/* ═══════════════════════════════════════════════════════════════════════════
   P45 · Modo parada estilo DEA — pantalla, voz y enganches
   ---------------------------------------------------------------------------
   La app guía la parada como un DEA: órdenes cortas en imperativo, una detrás
   de otra. TODA la lógica clínica vive en el motor puro (p45-parada-motor.js);
   aquí solo hay pantalla, voz y fontanería. Ningún texto de un modelo de
   lenguaje suena durante la parada: solo las frases fijas del motor.

   - Reloj monotónico (performance.now()) para los intervalos.
   - Voz de salida: speechSynthesis es-ES con las frases del motor. El
     metrónomo NUNCA se para porque la app hable (canales independientes).
   - Voz de entrada: reconocimiento por palabras clave (reconoceOrden del
     motor, coincidencia más larga primero). Mientras la app habla, el
     reconocimiento se ignora: si no, «¿Desfibrilable o no desfibrilable?»
     se contestaría a sí misma. Los BOTONES son el camino principal: con
     ruido, la voz falla.
   - Metrónomo y registro: los de P40 (EnferixRCP), vía su API. El registro es
     el mismo que exporta el panel 🚨 y el que adjunta el traspaso SBAR.
   - Javny Live: su herramienta rcp_parada abre este modo y pausa su micrófono
     hasta el fin; el flujo de Live fuera del modo no se toca.
   - Solo en castellano (decisión del encargo: sin versión en catalán).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function M(){ return window.EnferixParadaMotor; }
  function RCP(){ return window.EnferixRCP || null; }

  var estado = null;
  var overlay = null, tickTimer = null, wakeLock = null;
  var rec = null, recActivo = false, recSuspendido = false, ignorarVozHasta = 0, hablandoAhora = 0, ttsVivas = [];
  var alTerminarCb = null, wallT0 = null, registroVolcado = 0;

  var BOTONES = [
    { ev: 'analizar',          txt: 'ANALIZAR',          fases: ['rcp'] },
    { ev: 'desfibrilable',     txt: 'DESFIBRILABLE',     fases: ['analisis'], clase: 'p45-desf' },
    { ev: 'no_desfibrilable',  txt: 'NO DESFIBRILABLE',  fases: ['analisis'], clase: 'p45-nodesf' },
    { ev: 'descarga_hecha',    txt: 'DESCARGA HECHA',    fases: ['carga'], clase: 'p45-desf' },
    { ev: 'adrenalina_puesta', txt: 'ADRENALINA PUESTA', fases: ['rcp', 'analisis', 'carga'] },
    { ev: 'amiodarona_puesta', txt: 'AMIODARONA PUESTA', fases: ['rcp', 'analisis', 'carga'] },
    { ev: 'rce',               txt: 'HAY PULSO',         fases: ['rcp', 'analisis', 'carga'], clase: 'p45-rce' },
    { ev: 'vuelve_a_parar',    txt: 'VUELVE A PARAR',    fases: ['rce'], clase: 'p45-nodesf' },
    { ev: 'deshacer',          txt: '↩ DESHAZ',          fases: ['rcp', 'analisis', 'carga', 'rce', 'confirmandoFin'] },
    { ev: 'fin',               txt: 'FIN DE PARADA',     fases: ['rcp', 'analisis', 'carga', 'rce', 'confirmandoFin'], clase: 'p45-fin' }
  ];

  function mmss(ms){
    var s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function esc(x){
    return String(x == null ? '' : x).replace(/[&<>"]/g, function(c){
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function horaDe(msMotor){
    // El motor cuenta en reloj monotónico; para enseñar horas reales se ancla
    // el inicio a la hora de pared del arranque.
    if(wallT0 === null || !estado || estado.t0 === null) return '';
    var d = new Date(wallT0 + (msMotor - estado.t0));
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  }

  /* ── Voz de salida: frases fijas, nada generado ─────────────────────────── */
  function decir(frase){
    try {
      if(!('speechSynthesis' in window)) return;
      // En iOS, con el reconocimiento ESCUCHANDO, la síntesis sale MUDA (la
      // sesión de audio queda en modo grabación): como un DEA de verdad, se
      // calla el oído mientras la app habla y se reabre justo después. De
      // paso, el anti-eco pasa de filtro a físico: el micro está cerrado.
      if(rec && recActivo && !recSuspendido){
        recSuspendido = true;
        try { rec.stop(); } catch(e){}
      }
      try { window.speechSynthesis.resume(); } catch(e){}  // Safari se queda en pausa a veces
      var u = new SpeechSynthesisUtterance(frase);
      u.lang = 'es-ES'; u.rate = 1.04; u.volume = 1;
      hablandoAhora++;
      ttsVivas.push(u);        // sin referencia viva, el GC de Safari corta la voz a medias
      u.onstart = function(){ ignorarVozHasta = Infinity; };
      var hecho = false;
      var fin = function(){
        if(hecho) return;
        hecho = true;
        var i = ttsVivas.indexOf(u); if(i !== -1) ttsVivas.splice(i, 1);
        hablandoAhora = Math.max(0, hablandoAhora - 1);
        if(hablandoAhora === 0){
          ignorarVozHasta = Date.now() + 600;  // anti-eco
          setTimeout(reanudarOido, 450);
        }
      };
      u.onend = fin; u.onerror = fin;
      // Vigilante: si una frase nunca dispara su fin (pasa en iOS), que no
      // deje el oído cerrado ni el anti-eco en infinito.
      setTimeout(fin, Math.max(5000, frase.length * 120));
      window.speechSynthesis.speak(u);
    } catch(e){}
  }
  function reanudarOido(){
    if(!recActivo || !recSuspendido || hablandoAhora > 0) return;
    recSuspendido = false;
    try { if(rec) rec.start(); } catch(e){}
  }

  /* ── Despacho de eventos al motor ───────────────────────────────────────── */
  function despacha(tipo){
    if(!estado || !M()) return;
    var r = M().aplicar(estado, { tipo: tipo }, performance.now());
    aplicaResultado(r);
  }
  function aplicaResultado(r){
    estado = r.estado;
    if(r.metro === 'on' && RCP()) RCP().metro.on();
    if(r.metro === 'off' && RCP()) RCP().metro.off();
    if(r.avisos.length){
      try { if(navigator.vibrate) navigator.vibrate(120); } catch(e){}
      r.avisos.forEach(function(a){ decir(a.frase); });
      var ultima = r.avisos[r.avisos.length - 1].frase;
      var host = overlay && overlay.querySelector('[data-p45-orden]');
      if(host) host.textContent = ultima;
    }
    // El registro del motor se vuelca al registro de P40 (el que exporta el
    // panel 🚨 y adjunta el SBAR): un único registro para toda la parada.
    while(RCP() && registroVolcado < estado.registro.length){
      RCP().anotar(estado.registro[registroVolcado].texto);
      registroVolcado++;
    }
    pintar();
    if(estado.fase === 'finalizada') terminar();
  }

  /* ── Voz de entrada: palabras clave, botones como camino principal ──────── */
  function arrancaVoz(){
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var chip = overlay && overlay.querySelector('[data-p45-voz]');
    if(!SR){ if(chip) chip.textContent = '🎙 Voz no disponible: usa los botones'; return; }
    try {
      rec = new SR();
      rec.lang = 'es-ES'; rec.continuous = true; rec.interimResults = false;
      rec.onresult = function(ev){
        if(Date.now() < ignorarVozHasta) return;            // la app está hablando
        var res = ev.results[ev.results.length - 1];
        if(!res || !res.isFinal) return;
        var texto = res[0] ? res[0].transcript : '';
        var orden = M().reconoceOrden(texto);
        if(orden){
          var c = overlay && overlay.querySelector('[data-p45-voz]');
          if(c) c.textContent = '🎙 «' + texto.trim().slice(0, 40) + '»';
          despacha(orden);
        }
      };
      rec.onerror = function(ev){
        if(ev && (ev.error === 'not-allowed' || ev.error === 'service-not-allowed')){
          recActivo = false;
          if(chip) chip.textContent = '🎙 Sin permiso de micrófono: usa los botones';
        }
      };
      rec.onend = function(){
        // El continuo se cae solo: rearmar — salvo suspensión a propósito
        // mientras la app habla (la reabre reanudarOido).
        if(recActivo && !recSuspendido){ try { rec.start(); } catch(e){} }
      };
      recActivo = true;
      if(hablandoAhora > 0) recSuspendido = true;   // lo abre reanudarOido al callar
      else rec.start();
      if(chip) chip.textContent = '🎙 Escuchando órdenes';
    } catch(e){
      if(chip) chip.textContent = '🎙 Voz no disponible: usa los botones';
    }
  }
  function paraVoz(){
    recActivo = false;
    recSuspendido = false;
    if(rec){ try { rec.stop(); } catch(e){} rec = null; }
  }

  /* ── Pantalla ───────────────────────────────────────────────────────────── */
  function construir(){
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'p45-pantalla';
    var botones = BOTONES.map(function(b){
      return '<button type="button" class="p45-btn ' + (b.clase || '') + '" data-p45-ev="' + b.ev + '">' + esc(b.txt) + '</button>';
    }).join('');
    overlay.innerHTML =
      '<div class="p45-cab">'
      + '<b data-p45-crono>0:00</b>'
      + '<span data-p45-ciclo>monitor pendiente</span>'
      + '<span class="p45-chipvoz" data-p45-voz>🎙</span>'
      + '</div>'
      + '<div class="p45-orden" data-p45-orden></div>'
      + '<div class="p45-datos" data-p45-datos></div>'
      + '<div class="p45-botonera">' + botones + '</div>'
      + '<div class="p45-pie">'
      + '<button type="button" class="p45-min" data-p45-min>▾ Ocultar pantalla (la parada sigue)</button>'
      + '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e){
      var b = e.target.closest('[data-p45-ev]');
      if(b && !b.disabled){ despacha(b.getAttribute('data-p45-ev')); return; }
      if(e.target.closest('[data-p45-min]')){ overlay.classList.remove('on'); return; }
    });
    return overlay;
  }
  function pintar(){
    if(!overlay || !estado) return;
    var ahora = performance.now();
    overlay.querySelector('[data-p45-crono]').textContent = estado.t0 !== null ? mmss(ahora - estado.t0) : '0:00';
    var ciclo = overlay.querySelector('[data-p45-ciclo]');
    if(estado.fase === 'rce') ciclo.textContent = 'RCE · cronómetro en marcha';
    else if(estado.fase === 'analisis') ciclo.textContent = 'ANÁLISIS: ¿ritmo?';
    else if(estado.fase === 'carga') ciclo.textContent = 'CARGA · apártense';
    else if(estado.fase === 'confirmandoFin') ciclo.textContent = '¿Finalizar? repite FIN DE PARADA';
    else if(estado.cicloInicio !== null) ciclo.textContent = 'ciclo ' + estado.ciclo + ' · ' + mmss(M().CONSTANTES.CICLO_MS - (ahora - estado.cicloInicio));
    else ciclo.textContent = 'monitor pendiente · di ANALIZAR';

    var proxEnergia = M().energiaDescarga(estado.descargas + 1);
    var adrTxt;
    if(estado.ultimaAdrenalinaConf !== null){
      var falta = (estado.ultimaAdrenalinaConf + M().CONSTANTES.INTERVALO_ADRENALINA_MIN * 60000) - ahora;
      adrTxt = estado.adrenalinas + ' · última ' + horaDe(estado.ultimaAdrenalinaConf)
        + (estado.fase === 'rce' ? '' : ' · próxima en ' + mmss(falta));
    } else {
      adrTxt = estado.adrenalinaPedidaDesde !== null ? '0 · PEDIDA, confirma al ponerla' : '0';
    }
    overlay.querySelector('[data-p45-datos]').innerHTML =
      '<span><b>' + estado.descargas + '</b> descargas · próx. <b>' + proxEnergia + ' J</b></span>'
      + '<span>adrenalina: <b>' + esc(adrTxt) + '</b></span>'
      + '<span>amiodarona: <b>' + (estado.amiodaronasMg.length ? esc(estado.amiodaronasMg.join(' + ') + ' mg') : '—') + '</b></span>';

    overlay.querySelectorAll('[data-p45-ev]').forEach(function(btn){
      var def = null;
      for(var i = 0; i < BOTONES.length; i++) if(BOTONES[i].ev === btn.getAttribute('data-p45-ev')) def = BOTONES[i];
      btn.disabled = !def || def.fases.indexOf(estado.fase) === -1;
    });
  }

  /* ── Arranque y fin ─────────────────────────────────────────────────────── */
  function iniciar(opts){
    opts = opts || {};
    if(activa()){ abrirPantalla(); return { ok: true, yaActiva: true }; }
    if(!M()) return { error: 'El motor del modo parada no está cargado.' };
    alTerminarCb = typeof opts.alTerminar === 'function' ? opts.alTerminar : null;
    estado = M().estadoInicial();
    wallT0 = Date.now();
    registroVolcado = 0;
    construir();
    overlay.classList.add('on');
    // Registro y metrónomo de P40: vía aérea avanzada → compresiones continuas
    // (modo 'cont', sin contador 30:2) con marca de ventilación cada 6 s.
    if(RCP()){
      RCP().ponModo('cont');
      RCP().iniciarParadaFondo();
    }
    try {
      if(navigator.wakeLock && navigator.wakeLock.request){
        navigator.wakeLock.request('screen').then(function(wl){ wakeLock = wl; }).catch(function(){});
      }
    } catch(e){}
    despacha('iniciar');
    arrancaVoz();
    tickTimer = setInterval(function(){ despacha('tick'); }, 250);
    return { ok: true };
  }
  function terminar(){
    clearInterval(tickTimer); tickTimer = null;
    paraVoz();
    if(RCP()){
      RCP().metro.off();
      RCP().finalizarSinConfirmar();
    }
    if(wakeLock){ try { wakeLock.release(); } catch(e){} wakeLock = null; }
    if(overlay) overlay.classList.remove('on');
    var cb = alTerminarCb; alTerminarCb = null;
    estado = null;
    if(cb){ try { cb(); } catch(e){} }
    // El registro queda en el panel 🚨, listo para copiar o compartir (debriefing).
    if(RCP()) RCP().open();
  }
  function activa(){
    return !!(estado && estado.fase !== 'inactiva' && estado.fase !== 'finalizada');
  }
  function abrirPantalla(){ if(overlay && activa()) overlay.classList.add('on'); }

  window.EnferixModoParada = { iniciar: iniciar, activa: activa, abrirPantalla: abrirPantalla };

  /* ── Lanzadores ─────────────────────────────────────────────────────────── */
  // 1. Botón grande dentro del panel 🚨 de RCP (P40), inyectado por observer:
  //    el panel se reconstruye al abrirse y no se toca su código.
  function inyectaEnPanel(){
    var caja = document.querySelector('.p40-caja .p40-cuerpo');
    if(!caja || caja.querySelector('[data-p45-abrir]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'p45-lanzador';
    btn.setAttribute('data-p45-abrir', '1');
    btn.innerHTML = '🚑 MODO PARADA GUIADO<small>La app canta los pasos como un DEA (SVA adulto, ERC 2025)</small>';
    btn.onclick = function(){ activa() ? abrirPantalla() : iniciar(); };
    caja.insertBefore(btn, caja.firstChild);
  }
  // 2. El diagrama de la ficha uci-rcp-algoritmo (su metrónomo visual no tiene
  //    sonido): gana un botón que abre el panel 🚨, que es el que suena.
  function inyectaEnFicha(){
    var met = document.getElementById('rcpMet');
    if(!met || met.querySelector('[data-p45-ficha]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'p45-ficha-btn';
    btn.setAttribute('data-p45-ficha', '1');
    btn.textContent = '🔊 Metrónomo con sonido y modo guiado';
    btn.onclick = function(){ if(RCP()) RCP().open(); };
    met.appendChild(btn);
  }
  var obs = new MutationObserver(function(){ inyectaEnPanel(); inyectaEnFicha(); });
  function bootObs(){
    if(!document.body) return;
    obs.observe(document.body, { childList: true, subtree: true });
    inyectaEnPanel(); inyectaEnFicha();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootObs);
  else bootObs();

  // 3. Comando de voz global (fuera de Live): «iniciar parada», «iniciamos la RCP»…
  (function(){
    var orig = window.handleVoiceCommand;
    var re = /iniciar\s+(la\s+)?parada|iniciamos\s+(la\s+)?parada|iniciamos\s+la\s+rcp/i;
    window.handleVoiceCommand = function(texto){
      if(re.test(String(texto || ''))){ iniciar(); return true; }
      return orig ? orig(texto) : false;
    };
  })();
})();
