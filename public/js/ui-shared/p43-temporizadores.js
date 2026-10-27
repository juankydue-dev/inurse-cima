/* ═══════════════════════════════════════════════════════════════════════════
   P43 · Temporizadores con aviso (voz + pitidos + vibración)
   ---------------------------------------------------------------------------
   En una urgencia nadie mira el reloj: se pide «avísame en 3 minutos» y se
   sigue con las manos en el paciente. Este componente lleva esos avisos:

   - Fichas flotantes con cuenta atrás, POR ENCIMA de todo (Javny Live
     incluido): lo que está corriendo se ve siempre.
   - Al cumplirse: pitidos (WebAudio), voz (speechSynthesis) y vibración.
     La ficha queda en rojo «cumplido» hasta que se toca: si el aviso sonoro
     se pierde, la pantalla lo sigue diciendo.
   - Sobrevive a recargas (inurse_timers_v1 guarda el instante de fin, no la
     duración): al volver se re-arman los pendientes, y uno vencido con la
     app cerrada se anuncia como vencido, nunca se pierde en silencio.
   - Cancelar pide confirmación en la propia ficha (dos toques): en una
     urgencia un roce no puede matar un aviso.

   API para Javny Live y para cualquier otro componente:
     window.EnferixTemporizadores = { crear, cancelar, listar, activos }
   El modelo NUNCA cuenta el tiempo: crea el temporizador y es la app quien
   avisa cuando toca. Autocontenido: no toca una línea de Live.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var LSK = 'inurse_timers_v1';
  var MAX_ACTIVOS = 8;
  var MIN_S = 5, MAX_S = 4 * 60 * 60;

  var L = {
    es: {
      cumplido: 'Tiempo cumplido',
      vencidoCerrada: 'Venció con la aplicación cerrada',
      cancelar: '¿Cancelar?',
      vozCumplido: 'Tiempo cumplido: ',
      sinEtiqueta: 'Temporizador',
      tocaParaQuitar: 'Toca para quitar'
    },
    ca: {
      cumplido: 'Temps complert',
      vencidoCerrada: 'Va vèncer amb l’aplicació tancada',
      cancelar: 'Cancel·lar?',
      vozCumplido: 'Temps complert: ',
      sinEtiqueta: 'Temporitzador',
      tocaParaQuitar: 'Toca per treure'
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
  function mmss(ms){
    var s = Math.max(0, Math.ceil(ms / 1000));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var ss = ('0' + (s % 60)).slice(-2);
    return h ? h + ':' + ('0' + m).slice(-2) + ':' + ss : m + ':' + ss;
  }
  function norm(s){
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  }

  /* ── Estado ── */
  var timers = [];      // [{id, etiqueta, fin, cumplido}]
  var tick = null;

  function guardar(){
    try { localStorage.setItem(LSK, JSON.stringify(timers.map(function(x){
      return { id: x.id, etiqueta: x.etiqueta, fin: x.fin, cumplido: !!x.cumplido };
    }))); } catch(e){}
  }

  /* ── Aviso sonoro: tres tandas de pitidos, sin ficheros de audio ── */
  var audioCtx = null;
  function pitidos(){
    try {
      // Canal COMPARTIDO de la app (lo publica P40): un contexto propio era
      // uno más hacia el límite de iOS y dejaba mudo el metrónomo de RCP.
      audioCtx = (window.EnferixAudioCompartido && window.EnferixAudioCompartido()) || audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(function(){});
      var t0 = audioCtx.currentTime;
      for (var i = 0; i < 6; i++) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square'; osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, t0 + i * 0.35);
        gain.gain.exponentialRampToValueAtTime(0.5, t0 + i * 0.35 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.35 + 0.25);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t0 + i * 0.35); osc.stop(t0 + i * 0.35 + 0.3);
      }
    } catch(e){}
  }
  function hablar(texto){
    try {
      if (!('speechSynthesis' in window)) return;
      var u = new SpeechSynthesisUtterance(texto);
      u.lang = detectLang() === 'ca' ? 'ca-ES' : 'es-ES';
      u.rate = 1; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch(e){}
  }

  /* ── Fichas flotantes ── */
  var pila = null;
  function pilaHost(){
    if (pila && document.body.contains(pila)) return pila;
    pila = document.createElement('div');
    pila.className = 'p43-pila';
    document.body.appendChild(pila);
    pila.addEventListener('click', function(e){
      var ficha = e.target.closest('[data-p43-id]');
      if (!ficha) return;
      var id = ficha.getAttribute('data-p43-id');
      var tm = timers.find(function(x){ return x.id === id; });
      if (!tm) { ficha.remove(); return; }
      if (tm.cumplido) { quitar(id); return; }           // cumplido: un toque lo retira
      var x = e.target.closest('[data-p43-x]');
      if (x) {
        // Dos toques para cancelar uno en marcha: el primero pregunta.
        if (x.getAttribute('data-p43-arm') === '1') { quitar(id); return; }
        x.setAttribute('data-p43-arm', '1');
        x.textContent = t('cancelar');
        setTimeout(function(){
          if (x && x.isConnected) { x.removeAttribute('data-p43-arm'); x.textContent = '✕'; }
        }, 3000);
      }
    });
    return pila;
  }
  function pintar(){
    var host = pilaHost();
    var ids = {};
    timers.forEach(function(tm){
      ids[tm.id] = 1;
      var el = host.querySelector('[data-p43-id="' + tm.id + '"]');
      if (!el) {
        el = document.createElement('div');
        el.className = 'p43-ficha';
        el.setAttribute('data-p43-id', tm.id);
        el.innerHTML = '<span class="p43-eti"></span><b class="p43-resto"></b><button type="button" class="p43-x" data-p43-x aria-label="Cancelar">✕</button>';
        host.appendChild(el);
      }
      el.querySelector('.p43-eti').textContent = tm.etiqueta || t('sinEtiqueta');
      if (tm.cumplido) {
        el.classList.add('p43-cumplido');
        el.querySelector('.p43-resto').textContent = tm.vencidoCerrada ? t('vencidoCerrada') : t('cumplido');
        var xb = el.querySelector('[data-p43-x]');
        if (xb) xb.textContent = t('tocaParaQuitar');
      } else {
        el.querySelector('.p43-resto').textContent = mmss(tm.fin - Date.now());
      }
    });
    // fichas huérfanas (canceladas o retiradas)
    Array.prototype.forEach.call(host.querySelectorAll('[data-p43-id]'), function(el){
      if (!ids[el.getAttribute('data-p43-id')]) el.remove();
    });
    if (!timers.length && host) { host.remove(); pila = null; }
  }

  /* ── Motor ── */
  function arrancarTick(){
    if (tick || !timers.length) { pintar(); return; }
    tick = setInterval(function(){
      var ahora = Date.now();
      timers.forEach(function(tm){
        if (!tm.cumplido && tm.fin <= ahora) cumplir(tm, false);
      });
      pintar();
      if (!timers.length) { clearInterval(tick); tick = null; }
    }, 500);
    pintar();
  }
  function cumplir(tm, vencidoCerrada){
    tm.cumplido = true;
    tm.vencidoCerrada = !!vencidoCerrada;
    guardar();
    pitidos();
    try { if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]); } catch(e){}
    hablar(t('vozCumplido') + (tm.etiqueta || t('sinEtiqueta')));
    pintar();
  }
  function quitar(id){
    timers = timers.filter(function(x){ return x.id !== id; });
    guardar(); pintar();
  }

  /* ── API ── */
  function crear(segundos, etiqueta){
    var s = Math.round(Number(segundos));
    if (!isFinite(s) || s < MIN_S || s > MAX_S) {
      return { error: 'Duración no válida: entre ' + MIN_S + ' segundos y 4 horas.' };
    }
    if (timers.filter(function(x){ return !x.cumplido; }).length >= MAX_ACTIVOS) {
      return { error: 'Ya hay ' + MAX_ACTIVOS + ' temporizadores en marcha.' };
    }
    var tm = {
      id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      etiqueta: String(etiqueta || '').slice(0, 80),
      fin: Date.now() + s * 1000,
      cumplido: false
    };
    timers.push(tm);
    guardar(); arrancarTick();
    return { ok: true, id: tm.id, etiqueta: tm.etiqueta, segundos: s };
  }
  function cancelar(que){
    var q = norm(que);
    if (!q || q === 'todos' || q === 'todo' || q === 'tots' || q === 'tot') {
      var n = timers.length; timers = []; guardar(); pintar();
      return { ok: true, cancelados: n };
    }
    var antes = timers.length;
    var resto = timers.filter(function(x){ return x.id !== que && norm(x.etiqueta).indexOf(q) === -1; });
    if (resto.length === antes) return { error: 'No hay ningún temporizador que encaje con «' + que + '».' };
    timers = resto; guardar(); pintar();
    return { ok: true, cancelados: antes - resto.length };
  }
  function listar(){
    var ahora = Date.now();
    return timers.map(function(x){
      return {
        etiqueta: x.etiqueta || t('sinEtiqueta'),
        quedan_segundos: x.cumplido ? 0 : Math.max(0, Math.ceil((x.fin - ahora) / 1000)),
        cumplido: !!x.cumplido
      };
    });
  }
  function activos(){ return timers.filter(function(x){ return !x.cumplido; }).length; }

  /* ── Arranque: re-armar lo pendiente y anunciar lo vencido en la ausencia ── */
  function boot(){
    try {
      var d = JSON.parse(localStorage.getItem(LSK) || '[]');
      if (Array.isArray(d)) {
        var ahora = Date.now();
        timers = d.filter(function(x){ return x && x.id && isFinite(x.fin); });
        timers.forEach(function(tm){
          // Lo cumplido y ya anunciado se conserva en pantalla; lo que venció
          // mientras la app estaba cerrada se anuncia AHORA como vencido.
          if (!tm.cumplido && tm.fin <= ahora) cumplir(tm, true);
        });
      }
    } catch(e){ timers = []; }
    if (timers.length) arrancarTick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.EnferixTemporizadores = { crear: crear, cancelar: cancelar, listar: listar, activos: activos };
})();
