/* ═══════════════════════════════════════════════════════════════════════════
   P40 · RCP · Metrónomo y registro de la parada
   ---------------------------------------------------------------------------
   Herramienta de emergencia para una parada REAL, pensada para manos ocupadas:

   - Metrónomo de compresiones: pitidos a 110/min (dentro del rango 100-120
     del soporte vital básico), en modo 30:2 (tras 30 compresiones, dos tonos
     graves para las 2 ventilaciones) o continuo. Suena con WebAudio en el
     propio dispositivo: no pasa por ningún modelo ni por la red.
   - Cronómetro de la parada con avisos de voz cada minuto y, cada 2 minutos,
     el recordatorio de reevaluar el ritmo y cambiar de reanimador.
   - Botones grandes de eventos (descarga, adrenalina, amiodarona, vía aérea,
     reevaluación, cambio de reanimador, ROSC, otro): cada toque apunta la
     hora. La app REGISTRA lo que el profesional hace y dice; no indica dosis
     ni pautas — eso es de la prescripción y el protocolo del centro.
   - Al finalizar: registro cronológico completo, copiable y compartible, y
     guardado en el dispositivo (inurse_rcp_v1) por si la app se cierra.
   - Mientras está activa, intenta mantener la pantalla encendida (Wake Lock).

   Los únicos números que fija la interfaz son los del soporte vital básico
   (ritmo de compresiones y relación 30:2), que el guion clínico del proyecto
   permite expresamente sin fuente delante.

   Componente autocontenido, mismo patrón que P38/P39: botón 🚨 en la pila de
   flotantes, registro en INURSE_SECTIONS y envoltura de EnferixOpenSection.
   Expone window.EnferixRCP para un enganche futuro (p. ej. como herramienta
   de Javny Live, que se decidirá aparte).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var BPM = 110;              // compresiones/minuto (rango SVB 100-120)
  var STOREK = 'inurse_rcp_v1';
  var VOLK = 'inurse_metro_vol_v1';
  var volumen = 1;
  try { var _v = parseFloat(localStorage.getItem(VOLK)); if(_v >= 0.1 && _v <= 1) volumen = _v; } catch(e){}

  /* Canal de audio ÚNICO para toda la app (metrónomo, temporizadores, pitidos).
     iOS Safari corta en silencio los AudioContext más antiguos al pasar de ~4
     simultáneos, y en una parada ya conviven los dos de Javny Live y el de la
     capa de voz: cada módulo con contexto propio acercaba el corte — así se
     quedó mudo el metrónomo al entrar los temporizadores (regresión del 25-10). */
  if(!window.EnferixAudioCompartido){
    window.EnferixAudioCompartido = function(){
      if(!window.__enferixAudioCtx){
        try { window.__enferixAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return null; }
      }
      if(window.__enferixAudioCtx.state === 'suspended'){ try { window.__enferixAudioCtx.resume(); } catch(e){} }
      return window.__enferixAudioCtx;
    };
  }

  var L = {
    es: {
      fab: 'RCP: metrónomo y registro de la parada',
      titulo: 'RCP · Parada',
      sub: 'Metrónomo de compresiones y registro de la parada',
      metro: 'Metrónomo de compresiones',
      metroNota: '110 por minuto (rango recomendado 100-120)',
      modo302: '30:2',
      modoCont: 'Continuo',
      iniciarMetro: '▶ Iniciar metrónomo',
      pararMetro: '⏹ Parar metrónomo',
      probar: 'Probar sonido',
      registro: 'Registro de la parada',
      iniciarParada: '▶ INICIAR PARADA',
      finalizar: '⏹ Finalizar parada',
      voz: 'Avisos de voz',
      ev: {
        descarga: '⚡ Descarga',
        adrenalina: '💉 Adrenalina',
        amiodarona: '💉 Amiodarona',
        via: '🫁 Vía aérea',
        ritmo: '📈 Reevaluación de ritmo',
        cambio: '🔄 Cambio de reanimador',
        rosc: '✅ ROSC',
        otro: '✍️ Otro…'
      },
      evTexto: {
        inicio: 'Inicio de la reanimación',
        descarga: 'Descarga',
        adrenalina: 'Adrenalina administrada',
        amiodarona: 'Amiodarona administrada',
        via: 'Manejo de vía aérea',
        ritmo: 'Reevaluación de ritmo',
        cambio: 'Cambio de reanimador',
        rosc: 'ROSC: recuperación de circulación espontánea',
        fin: 'Fin del registro'
      },
      otroPrompt: 'Describe el evento a registrar:',
      min2: 'Dos minutos. Reevalúa el ritmo y cambia de reanimador.',
      minuto: function(n){ return 'Minuto ' + n; },
      regTitulo: 'REGISTRO DE LA PARADA',
      copiar: '📋 Copiar',
      compartir: '📤 Compartir',
      cerrarReg: 'Cerrar registro',
      ultimo: '🕘 Ver último registro',
      copiado: 'Registro copiado',
      noCompartir: 'Compartir no está disponible en este navegador',
      vacio: 'Sin eventos registrados.',
      confFin: '¿Finalizar la parada y cerrar el registro?',
      duracion: 'Duración total',
      menu: 'RCP · Parada',
      titRegistro: 'Registro de parada · Enferix'
    },
    ca: {
      fab: 'RCP: metrònom i registre de l’aturada',
      titulo: 'RCP · Aturada',
      sub: 'Metrònom de compressions i registre de l’aturada',
      metro: 'Metrònom de compressions',
      metroNota: '110 per minut (rang recomanat 100-120)',
      modo302: '30:2',
      modoCont: 'Continu',
      iniciarMetro: '▶ Inicia el metrònom',
      pararMetro: '⏹ Atura el metrònom',
      probar: 'Prova el so',
      registro: 'Registre de l’aturada',
      iniciarParada: '▶ INICIA L’ATURADA',
      finalizar: '⏹ Finalitza l’aturada',
      voz: 'Avisos de veu',
      ev: {
        descarga: '⚡ Descàrrega',
        adrenalina: '💉 Adrenalina',
        amiodarona: '💉 Amiodarona',
        via: '🫁 Via aèria',
        ritmo: '📈 Reavaluació de ritme',
        cambio: '🔄 Canvi de reanimador',
        rosc: '✅ ROSC',
        otro: '✍️ Altre…'
      },
      evTexto: {
        inicio: 'Inici de la reanimació',
        descarga: 'Descàrrega',
        adrenalina: 'Adrenalina administrada',
        amiodarona: 'Amiodarona administrada',
        via: 'Maneig de via aèria',
        ritmo: 'Reavaluació de ritme',
        cambio: 'Canvi de reanimador',
        rosc: 'ROSC: recuperació de circulació espontània',
        fin: 'Fi del registre'
      },
      otroPrompt: 'Descriu l’esdeveniment a registrar:',
      min2: 'Dos minuts. Reavalua el ritme i canvia de reanimador.',
      minuto: function(n){ return 'Minut ' + n; },
      regTitulo: 'REGISTRE DE L’ATURADA',
      copiar: '📋 Copia',
      compartir: '📤 Comparteix',
      cerrarReg: 'Tanca el registre',
      ultimo: '🕘 Mostra l’últim registre',
      copiado: 'Registre copiat',
      noCompartir: 'Compartir no està disponible en aquest navegador',
      vacio: 'Sense esdeveniments registrats.',
      confFin: 'Vols finalitzar l’aturada i tancar el registre?',
      duracion: 'Durada total',
      menu: 'RCP · Aturada',
      titRegistro: 'Registre d’aturada · Enferix'
    }
  };
  function detectLang(){
    var l = document.documentElement.lang || '';
    try { l = l || localStorage.getItem('inurse_lang') || ''; } catch(e){}
    l = l || (navigator.language || 'es');
    return /^ca/i.test(l) ? 'ca' : 'es';
  }
  function t(k){ var d = L[detectLang()] || L.es; return d[k] != null ? d[k] : L.es[k]; }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }
  function toast(msg){
    try { if(typeof window.toast === 'function'){ window.toast(msg); return; } } catch(e){}
    try { alert(msg); } catch(e){}
  }
  function hora(d){
    d = d || new Date();
    return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2);
  }
  function mmss(ms){
    var s = Math.floor(ms/1000);
    return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+(s%60)).slice(-2);
  }
  function decir(texto){
    if(!vozOn) return;
    try {
      var u = new SpeechSynthesisUtterance(texto);
      u.lang = detectLang() === 'ca' ? 'ca-ES' : 'es-ES';
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    } catch(e){}
  }

  /* ── Estado ──────────────────────────────────────────────────────────────── */
  var overlay = null;
  var vozOn = true;
  // metrónomo
  var audio = null, metroOn = false, metroTimer = null, proximo = 0, nCompresion = 0, modo = '302', enVentilacion = 0, masterGain = null, ventTick = 0;
  // parada
  var parada = null;   // {t0, eventos:[{ms, hora, texto}], avisado:{} }
  var relojTimer = null, ultimoMinuto = 0, wakeLock = null;

  /* ── Metrónomo (WebAudio con planificación por adelantado) ─────────────────
     Click PERCUSIVO (punto 10.3 del encargo de modo parada): ataque
     instantáneo, ~45 ms, frecuencias medias-altas — lo que más destaca entre
     el ruido de una sala — con envolvente a ganancia 1 y un compresor dinámico
     antes de la salida para no saturar. El canal es el COMPARTIDO de la app:
     con contexto propio, iOS lo cortaba al convivir con los de Javny Live, la
     capa de voz y los temporizadores. */
  function obtenerAudio(){
    audio = (window.EnferixAudioCompartido && window.EnferixAudioCompartido()) || audio;
    if(!audio){ try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return null; } }
    if(audio.state === 'suspended'){ try { audio.resume(); } catch(e){} }
    return audio;
  }
  function cadenaSalida(){
    // La cadena pertenece a UN contexto: si el compartido apareció después,
    // se reconstruye sobre él.
    if(masterGain && masterGain.context === audio) return masterGain;
    var comp = audio.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 6; comp.ratio.value = 6;
    comp.attack.value = 0.001; comp.release.value = 0.08;
    masterGain = audio.createGain();
    masterGain.gain.value = volumen;
    masterGain.connect(comp); comp.connect(audio.destination);
    return masterGain;
  }
  function click(cuando, tipo){
    // tipo: 'comp' (compresión), 'vent' (los dos tonos del 30:2),
    // 'vent10' (marca aguda cada 6 s del modo continuo: ventilación a 10/min)
    var o = audio.createOscillator(), g = audio.createGain();
    o.type = 'square';
    var dur = 0.045, f0 = 2000, f1 = 900;
    if(tipo === 'vent'){ dur = 0.12; f0 = 700; f1 = 500; }
    if(tipo === 'vent10'){ dur = 0.07; f0 = 3200; f1 = 2400; }
    o.frequency.setValueAtTime(f0, cuando);
    o.frequency.exponentialRampToValueAtTime(f1, cuando + dur);
    g.gain.setValueAtTime(1, cuando);
    g.gain.exponentialRampToValueAtTime(0.001, cuando + dur);
    o.connect(g); g.connect(cadenaSalida());
    o.start(cuando); o.stop(cuando + dur + 0.01);
  }
  function planificar(){
    if(!metroOn) return;
    var paso = 60 / BPM;
    while(proximo < audio.currentTime + 0.15){
      if(enVentilacion > 0){
        click(proximo, 'vent');
        enVentilacion--;
        proximo += 1.6;                       // dos tonos espaciados: ventilaciones del 30:2
      } else {
        click(proximo, 'comp');
        nCompresion++;
        if(modo === '302' && nCompresion >= 30){ nCompresion = 0; enVentilacion = 2; proximo += paso; }
        else proximo += paso;
      }
    }
    // Modo continuo (vía aérea avanzada): marca aguda cada 6 s = 10
    // ventilaciones/minuto, sin parar nunca las compresiones.
    if(modo === 'cont'){
      if(!ventTick) ventTick = audio.currentTime + 6;
      while(ventTick < audio.currentTime + 0.15){
        click(ventTick, 'vent10');
        ventTick += 6;
      }
    }
  }
  function iniciarMetro(){
    if(metroOn) return;
    if(!obtenerAudio()) return;
    metroOn = true; nCompresion = 0; enVentilacion = 0; ventTick = 0; proximo = audio.currentTime + 0.1;
    metroTimer = setInterval(planificar, 40);
    pintarMetro();
  }
  /* «Probar sonido» fuera de la parada: cuatro clicks al tempo real, para
     ajustar el volumen ANTES de necesitarlo. */
  function probarSonido(){
    if(metroOn || !obtenerAudio()) return;
    var paso = 60 / BPM;
    for(var i = 0; i < 4; i++) click(audio.currentTime + 0.05 + i * paso, 'comp');
  }
  function ponVolumen(v){
    volumen = Math.min(1, Math.max(0.1, v));
    try { localStorage.setItem(VOLK, String(volumen)); } catch(e){}
    if(masterGain) masterGain.gain.value = volumen;
  }
  // Volumen por delegación en el documento: el panel se reconstruye entero al
  // abrirse y así no hay listener que pueda quedarse colgado de una iteración.
  document.addEventListener('input', function(e){
    var r = e.target && e.target.closest && e.target.closest('[data-p40-vol]');
    if(r) ponVolumen(Number(r.value) / 100);
  });
  function pararMetro(){
    metroOn = false;
    clearInterval(metroTimer); metroTimer = null;
    pintarMetro();
  }
  function pintarMetro(){
    if(!overlay) return;
    var b = overlay.querySelector('[data-p40="metro"]');
    if(b){ b.textContent = metroOn ? t('pararMetro') : t('iniciarMetro'); b.classList.toggle('on', metroOn); }
    overlay.querySelectorAll('[data-p40-modo]').forEach(function(x){
      x.classList.toggle('on', x.getAttribute('data-p40-modo') === modo);
    });
  }

  /* ── Registro de la parada ───────────────────────────────────────────────── */
  function guardar(){
    try { localStorage.setItem(STOREK, JSON.stringify({ t0: parada ? parada.t0 : null, eventos: parada ? parada.eventos : [], abierta: !!parada })); } catch(e){}
  }
  function anotar(texto){
    if(!parada) return;
    parada.eventos.push({ ms: Date.now() - parada.t0, hora: hora(), texto: texto });
    guardar();
    try { if(navigator.vibrate) navigator.vibrate(40); } catch(e){}
    pintarEventos();
  }
  function iniciarParada(){
    if(parada) return;
    parada = { t0: Date.now(), eventos: [] };
    ultimoMinuto = 0;
    anotar(t('evTexto').inicio);
    relojTimer = setInterval(tic, 500);
    try {
      if(navigator.wakeLock && navigator.wakeLock.request){
        navigator.wakeLock.request('screen').then(function(wl){ wakeLock = wl; }).catch(function(){});
      }
    } catch(e){}
    iniciarMetro();
    pintarParada();
  }
  function tic(){
    if(!parada) return;
    var ms = Date.now() - parada.t0;
    var reloj = overlay && overlay.querySelector('[data-p40-reloj]');
    if(reloj) reloj.textContent = mmss(ms);
    var minuto = Math.floor(ms / 60000);
    if(minuto > ultimoMinuto){
      ultimoMinuto = minuto;
      // Con el modo parada guiado activo, quien canta los tiempos es su motor.
      if(window.EnferixModoParada && window.EnferixModoParada.activa && window.EnferixModoParada.activa()) return;
      if(minuto % 2 === 0) decir(t('min2'));
      else decir(t('minuto')(minuto));
    }
  }
  function finalizarParada(){
    if(!parada) return;
    if(!confirm(t('confFin'))) return;
    terminarParada();
  }
  // Igual que finalizar, sin el confirm(): el modo parada guiado ya exige
  // repetir «fin de parada» para confirmar, y dos preguntas serían una trampa.
  function terminarParada(){
    if(!parada) return;
    anotar(t('evTexto').fin);
    clearInterval(relojTimer); relojTimer = null;
    pararMetro();
    if(wakeLock){ try { wakeLock.release(); } catch(e){} wakeLock = null; }
    var terminado = parada;
    parada = null;
    try { localStorage.setItem(STOREK, JSON.stringify({ t0: terminado.t0, eventos: terminado.eventos, abierta: false })); } catch(e){}
    pintarParada();
    mostrarRegistro(terminado);
  }
  function textoRegistro(reg){
    var lineas = [t('titRegistro')];
    lineas.push(new Date(reg.t0).toLocaleDateString() + ' · ' + hora(new Date(reg.t0)));
    reg.eventos.forEach(function(e){ lineas.push('[' + mmss(e.ms) + ' · ' + e.hora + '] ' + e.texto); });
    if(reg.eventos.length) lineas.push(t('duracion') + ': ' + mmss(reg.eventos[reg.eventos.length-1].ms));
    return lineas.join('\n');
  }
  function mostrarRegistro(reg){
    var host = overlay.querySelector('[data-p40-registro]');
    if(!host) return;
    host.style.display = 'block';
    host.innerHTML = '<div class="p40-reg-tit">' + esc(t('regTitulo')) + '</div>'
      + (reg.eventos.length
        ? '<ol class="p40-reg-lista">' + reg.eventos.map(function(e){
            return '<li><span>' + esc(mmss(e.ms)) + ' · ' + esc(e.hora) + '</span> ' + esc(e.texto) + '</li>';
          }).join('') + '</ol>'
        : '<p class="p40-reg-vacio">' + esc(t('vacio')) + '</p>')
      + '<div class="p40-reg-acc">'
      + '<button type="button" data-p40="copiar">' + esc(t('copiar')) + '</button>'
      + '<button type="button" data-p40="compartirReg">' + esc(t('compartir')) + '</button>'
      + '<button type="button" data-p40="cerrarReg">' + esc(t('cerrarReg')) + '</button>'
      + '</div>';
    host._registro = reg;
    host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function ultimoRegistro(){
    try {
      var d = JSON.parse(localStorage.getItem(STOREK) || 'null');
      if(d && Array.isArray(d.eventos) && d.eventos.length) mostrarRegistro(d);
      else toast(t('vacio'));
    } catch(e){ toast(t('vacio')); }
  }
  function pintarEventos(){
    if(!overlay) return;
    var n = overlay.querySelector('[data-p40-n]');
    if(n && parada) n.textContent = parada.eventos.length;
    // Lista en vivo: cada toque tiene que VERSE apuntado al instante, con su
    // minuto, o en plena parada parece que el botón no ha hecho nada.
    var lista = overlay.querySelector('[data-p40-vivo]');
    if(lista && parada){
      lista.innerHTML = parada.eventos.slice(-5).reverse().map(function(e){
        return '<li><span>' + esc(mmss(e.ms)) + '</span> ' + esc(e.texto) + '</li>';
      }).join('');
    }
  }
  function pintarParada(){
    if(!overlay) return;
    overlay.querySelector('[data-p40-activa]').style.display = parada ? 'block' : 'none';
    overlay.querySelector('[data-p40="iniciarParada"]').style.display = parada ? 'none' : 'block';
    if(!parada){
      var reloj = overlay.querySelector('[data-p40-reloj]');
      if(reloj) reloj.textContent = '00:00';
    }
    pintarEventos();
  }

  /* ── Interfaz ───────────────────────────────────────────────────────────── */
  function construir(){
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'p40-overlay';
    var ev = t('ev');
    overlay.innerHTML =
      '<div class="p40-caja" role="dialog" aria-modal="true" aria-label="' + esc(t('titulo')) + '">'
      + '<div class="p40-cab">'
      +   '<span class="p40-ico">🚨</span>'
      +   '<div class="p40-tit"><h3>' + esc(t('titulo')) + '</h3><p>' + esc(t('sub')) + '</p></div>'
      +   '<label class="p40-voz"><input type="checkbox" checked data-p40-voz> ' + esc(t('voz')) + '</label>'
      +   '<button type="button" class="p40-x" data-p40="cerrar" aria-label="Cerrar">✕</button>'
      + '</div>'
      + '<div class="p40-cuerpo">'
      +   '<div class="p40-bloque">'
      +     '<div class="p40-bloque-cab"><b>' + esc(t('metro')) + '</b><small>' + esc(t('metroNota')) + '</small></div>'
      +     '<div class="p40-metro-fila">'
      +       '<button type="button" class="p40-metro-btn" data-p40="metro">' + esc(t('iniciarMetro')) + '</button>'
      +       '<div class="p40-modos">'
      +         '<button type="button" data-p40-modo="302" class="on">' + esc(t('modo302')) + '</button>'
      +         '<button type="button" data-p40-modo="cont">' + esc(t('modoCont')) + '</button>'
      +       '</div>'
      +     '</div>'
      +     '<div class="p40-vol"><span aria-hidden="true">🔊</span>'
      +       '<input type="range" min="10" max="100" value="' + Math.round(volumen * 100) + '" data-p40-vol aria-label="' + esc(t('probar')) + '">'
      +       '<button type="button" data-p40="probar">' + esc(t('probar')) + '</button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="p40-bloque">'
      +     '<div class="p40-bloque-cab"><b>' + esc(t('registro')) + '</b></div>'
      +     '<button type="button" class="p40-iniciar" data-p40="iniciarParada">' + esc(t('iniciarParada')) + '</button>'
      +     '<div data-p40-activa style="display:none">'
      +       '<div class="p40-reloj" data-p40-reloj>00:00</div>'
      +       '<div class="p40-eventos">'
      +         '<button type="button" data-p40-ev="descarga">' + esc(ev.descarga) + '</button>'
      +         '<button type="button" data-p40-ev="adrenalina">' + esc(ev.adrenalina) + '</button>'
      +         '<button type="button" data-p40-ev="amiodarona">' + esc(ev.amiodarona) + '</button>'
      +         '<button type="button" data-p40-ev="via">' + esc(ev.via) + '</button>'
      +         '<button type="button" data-p40-ev="ritmo">' + esc(ev.ritmo) + '</button>'
      +         '<button type="button" data-p40-ev="cambio">' + esc(ev.cambio) + '</button>'
      +         '<button type="button" class="p40-rosc" data-p40-ev="rosc">' + esc(ev.rosc) + '</button>'
      +         '<button type="button" data-p40-ev="otro">' + esc(ev.otro) + '</button>'
      +       '</div>'
      +       '<ol class="p40-vivo" data-p40-vivo reversed></ol>'
      +       '<p class="p40-cuenta"><span data-p40-n>0</span> · <button type="button" class="p40-fin" data-p40="finalizar">' + esc(t('finalizar')) + '</button></p>'
      +     '</div>'
      +     '<button type="button" class="p40-ultimo" data-p40="ultimo">' + esc(t('ultimo')) + '</button>'
      +     '<div class="p40-registro" data-p40-registro style="display:none"></div>'
      +   '</div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e){
      if(e.target === overlay && !parada){ cerrar(); return; }
      var m = e.target.closest('[data-p40-modo]');
      if(m){ modo = m.getAttribute('data-p40-modo'); nCompresion = 0; enVentilacion = 0; ventTick = 0; pintarMetro(); return; }
      var evb = e.target.closest('[data-p40-ev]');
      if(evb){
        evb.classList.add('p40-flash');
        setTimeout(function(){ evb.classList.remove('p40-flash'); }, 450);
        var k = evb.getAttribute('data-p40-ev');
        if(k === 'otro'){
          var txt = prompt(t('otroPrompt')) || '';
          txt = txt.trim();
          if(txt) anotar(txt);
        } else {
          anotar(t('evTexto')[k]);
        }
        return;
      }
      var b = e.target.closest('[data-p40]');
      if(!b) return;
      var acc = b.getAttribute('data-p40');
      if(acc === 'cerrar') cerrar();
      else if(acc === 'metro'){ if(metroOn) pararMetro(); else iniciarMetro(); }
      else if(acc === 'probar') probarSonido();
      else if(acc === 'iniciarParada') iniciarParada();
      else if(acc === 'finalizar') finalizarParada();
      else if(acc === 'ultimo') ultimoRegistro();
      else if(acc === 'cerrarReg'){ var h = overlay.querySelector('[data-p40-registro]'); h.style.display = 'none'; }
      else if(acc === 'copiar' || acc === 'compartirReg'){
        var host = overlay.querySelector('[data-p40-registro]');
        var reg = host && host._registro; if(!reg) return;
        var texto = textoRegistro(reg);
        if(acc === 'compartirReg' && navigator.share){
          navigator.share({ title: t('titRegistro'), text: texto }).catch(function(){});
        } else if(navigator.clipboard){
          navigator.clipboard.writeText(texto).then(function(){ toast(t('copiado')); }).catch(function(){ toast(t('noCompartir')); });
        } else toast(t('noCompartir'));
      }
    });
    overlay.querySelector('[data-p40-voz]').addEventListener('change', function(){ vozOn = this.checked; });
    return overlay;
  }

  function abrir(){ construir(); pintarMetro(); pintarParada(); overlay.classList.add('on'); }
  function cerrar(){
    // Con una parada activa el panel no se cierra tocando el fondo, y al
    // cerrarlo con la ✕ el cronómetro y el metrónomo SIGUEN corriendo: lo que
    // se cierra es la vista, no la reanimación.
    if(overlay) overlay.classList.remove('on');
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay && overlay.classList.contains('on') && !parada){ e.stopPropagation(); cerrar(); }
  }, true);

  /* ── Enganches: botón flotante, menú de Inicio y router ─────────────────── */
  function boot(){
    if(!document.getElementById('rcpFab')){
      var ancla = document.getElementById('atlasFab') || document.getElementById('ecgFab');
      if(ancla){
        var fab = document.createElement('button');
        fab.className = 'fab-rcp'; fab.id = 'rcpFab';
        fab.title = t('fab'); fab.textContent = '🚨';
        fab.onclick = abrir;
        ancla.insertAdjacentElement('beforebegin', fab);
      }
    }
    if(Array.isArray(window.INURSE_SECTIONS) && !window.INURSE_SECTIONS.some(function(s){ return s.id === 'rcp'; })){
      window.INURSE_SECTIONS.push({ id: 'rcp', t: t('menu'), em: '🚨', kw: 'rcp parada metronomo compresiones reanimacion registro masaje cardiaco emergencia' });
      var prev = window.EnferixOpenSection;
      window.EnferixOpenSection = function(id){
        if(id === 'rcp'){ abrir(); return; }
        if(typeof prev === 'function') return prev(id);
      };
    }
    return !!document.getElementById('rcpFab');
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 700); setTimeout(boot, 2400);
  window.EnferixRCP = {
    open: abrir,
    iniciarParada: function(){ abrir(); iniciarParada(); },
    anotar: anotar,
    activa: function(){ return !!parada; },
    /* Para el modo parada guiado (P45): maneja el MISMO registro y el MISMO
       metrónomo, sin abrir el panel ni duplicar nada. */
    iniciarParadaFondo: iniciarParada,
    finalizarSinConfirmar: terminarParada,
    metro: { on: iniciarMetro, off: pararMetro, activo: function(){ return metroOn; } },
    ponModo: function(m){ if(m === '302' || m === 'cont'){ modo = m; nCompresion = 0; enVentilacion = 0; ventTick = 0; pintarMetro(); } }
  };
})();
