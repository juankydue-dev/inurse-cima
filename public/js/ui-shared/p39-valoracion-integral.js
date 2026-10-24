/* ═══════════════════════════════════════════════════════════════════════════
   P39 · Valoración integral del paciente
   ---------------------------------------------------------------------------
   Reúne en un solo panel las pruebas de un mismo paciente —radiografías,
   páginas de analítica y electrocardiograma— más su contexto clínico, y
   Javny redacta UN informe de valoración integral: lectura resumida de cada
   prueba, síntesis integrada, orientación diagnóstica con diferencial,
   gravedad, manejo orientativo (sin dosis) e intervenciones de enfermería.

   Todo lo clínico vive en el guion del servidor (GUION_CASO en
   sources/imagen-clinica.mjs, modo "caso" del endpoint /api/javny/imagen):
   aquí solo hay interfaz y transporte. Cada imagen viaja etiquetada con su
   rol (rx | lab | ecg) para que el modelo aplique a cada una su sistemática.

   Componente autocontenido, mismo patrón que Analíticas (P38): botón 🩺 en
   la pila de flotantes, registro en INURSE_SECTIONS, micro del contexto por
   el patrón global de voz (.qmic dentro de .qwrap).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var SLOTS = [
    { rol: 'rx',  max: 3, em: '🩻' },
    { rol: 'lab', max: 3, em: '🧪' },
    { rol: 'ecg', max: 1, em: '📟' }
  ];

  var L = {
    es: {
      fab: 'Valoración integral del paciente (informe con Javny)',
      titulo: 'Valoración integral',
      sub: 'Radiografía + analítica + electro · informe conjunto con Javny',
      slotRx: 'Radiografías o imagen (hasta 3)',
      slotLab: 'Analítica (hasta 3 páginas)',
      slotEcg: 'Electrocardiograma (1)',
      anadir: '+ Añadir',
      quitar: 'Quitar',
      ctxLabel: 'Contexto clínico del paciente (cuanto más completo, mejor orientación)',
      ctxPh: 'Ej: varón de 67 años, disnea de 3 días, fiebre; EPOC conocido, anticoagulado…',
      enviar: 'Redactar valoración integral con Javny',
      analizando: 'Valorando el caso',
      informe: 'INFORME DE VALORACIÓN INTEGRAL',
      errImagen: 'Selecciona un archivo de imagen',
      errGrande: 'La imagen supera 25 MB',
      errMax: function(n){ return 'Este apartado admite como mucho ' + n; },
      errPrimero: 'Añade al menos una prueba (radiografía, analítica o electro)',
      avisoCtx: 'Sin contexto clínico la orientación será mucho más limitada. ¿Enviar igualmente?',
      errAnalisis: 'No se ha podido completar la valoración: ',
      escuchar: 'Escuchar', parar: 'Parar',
      compartir: 'Compartir', video: 'Vídeo relacionado', guias: 'Guías relacionadas', javny: 'Revisar con Javny',
      compartido: 'Contenido copiado', noCompartir: 'Compartir no está disponible en este navegador',
      videoQ: 'valoración integral del paciente enfermería',
      guiasQ: 'valoración paciente exploración constantes deterioro',
      tituloInforme: 'Informe de valoración integral',
      menu: 'Valoración integral'
    },
    ca: {
      fab: 'Valoració integral del pacient (informe amb Javny)',
      titulo: 'Valoració integral',
      sub: 'Radiografia + analítica + electro · informe conjunt amb Javny',
      slotRx: 'Radiografies o imatge (fins a 3)',
      slotLab: 'Analítica (fins a 3 pàgines)',
      slotEcg: 'Electrocardiograma (1)',
      anadir: '+ Afegeix',
      quitar: 'Treu',
      ctxLabel: 'Context clínic del pacient (com més complet, millor orientació)',
      ctxPh: 'Ex: home de 67 anys, dispnea de 3 dies, febre; MPOC conegut, anticoagulat…',
      enviar: 'Redacta la valoració integral amb Javny',
      analizando: 'Valorant el cas',
      informe: 'INFORME DE VALORACIÓ INTEGRAL',
      errImagen: 'Selecciona un arxiu d’imatge',
      errGrande: 'La imatge supera 25 MB',
      errMax: function(n){ return 'Aquest apartat admet com a molt ' + n; },
      errPrimero: 'Afegeix almenys una prova (radiografia, analítica o electro)',
      avisoCtx: 'Sense context clínic l’orientació serà molt més limitada. Vols enviar igualment?',
      errAnalisis: 'No s’ha pogut completar la valoració: ',
      escuchar: 'Escolta', parar: 'Atura',
      compartir: 'Comparteix', video: 'Vídeo relacionat', guias: 'Guies relacionades', javny: 'Revisa amb Javny',
      compartido: 'Contingut copiat', noCompartir: 'Compartir no està disponible en aquest navegador',
      videoQ: 'valoración integral del paciente enfermería',
      guiasQ: 'valoración paciente exploración constantes deterioro',
      tituloInforme: 'Informe de valoració integral',
      menu: 'Valoració integral'
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
  function slotLabel(rol){ return rol === 'rx' ? t('slotRx') : rol === 'lab' ? t('slotLab') : t('slotEcg'); }

  /* ── Estado ──────────────────────────────────────────────────────────────── */
  var pruebas = { rx: [], lab: [], ecg: [] };   // cada una: {src(dataURL jpeg)}
  var overlay = null, enviando = false, ultimoInforme = '';

  function procesar(dataURL){
    return new Promise(function(resolve, reject){
      var im = new Image();
      im.onload = function(){
        var max = 2048, k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.naturalWidth * k));
        c.height = Math.max(1, Math.round(im.naturalHeight * k));
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.88));
      };
      im.onerror = function(){ reject(new Error('imagen ilegible')); };
      im.src = dataURL;
    });
  }

  function cargar(rol, files){
    var slot = SLOTS.filter(function(s){ return s.rol === rol; })[0];
    var lista = [].slice.call(files || []).filter(Boolean);
    if(!slot || !lista.length) return;
    var hueco = slot.max - pruebas[rol].length;
    if(lista.length > hueco){ toast(t('errMax')(slot.max)); lista = lista.slice(0, Math.max(0, hueco)); }
    lista.forEach(function(f){
      if(!/^image\//.test(String(f.type || ''))){ toast(t('errImagen')); return; }
      if(f.size > 25 * 1024 * 1024){ toast(t('errGrande')); return; }
      var r = new FileReader();
      r.onload = function(){
        procesar(r.result).then(function(jpeg){
          pruebas[rol].push({ src: jpeg });
          pintar();
        }).catch(function(){ toast(t('errImagen')); });
      };
      r.readAsDataURL(f);
    });
  }

  /* ── Interfaz ───────────────────────────────────────────────────────────── */
  function construir(){
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'p39-overlay';
    overlay.innerHTML =
      '<div class="p39-caja" role="dialog" aria-modal="true" aria-label="' + esc(t('titulo')) + '">'
      + '<div class="p39-cab">'
      +   '<span class="p39-ico">🩺</span>'
      +   '<div class="p39-tit"><h3>' + esc(t('titulo')) + '</h3><p>' + esc(t('sub')) + '</p></div>'
      +   '<button type="button" class="p39-x" data-p39="cerrar" aria-label="Cerrar">✕</button>'
      + '</div>'
      + '<div class="p39-cuerpo">'
      + SLOTS.map(function(s){
          return '<div class="p39-slot" data-p39-slot="' + s.rol + '">'
            + '<input type="file" accept="image/*"' + (s.max > 1 ? ' multiple' : '') + ' style="display:none" data-p39-file="' + s.rol + '">'
            + '<div class="p39-slot-cab"><span>' + s.em + ' ' + esc(slotLabel(s.rol)) + '</span>'
            + '<button type="button" class="p39-add" data-p39="elegir" data-p39-rol="' + s.rol + '">' + esc(t('anadir')) + '</button></div>'
            + '<div class="p39-tira" data-p39-tira="' + s.rol + '" style="display:none"></div>'
            + '</div>';
        }).join('')
      +   '<label class="p39-lbl" for="p39Ctx">' + esc(t('ctxLabel')) + '</label>'
      +   '<div class="qwrap p39-qwrap">'
      +     '<textarea id="p39Ctx" rows="3" placeholder="' + esc(t('ctxPh')) + '"></textarea>'
      +     '<button type="button" class="qmic p39-mic" title="Dictar">🎙️</button>'
      +   '</div>'
      +   '<button type="button" class="p39-enviar" data-p39="enviar">' + esc(t('enviar')) + '</button>'
      +   '<div class="p39-resultado" data-p39-res></div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e){
      if(e.target === overlay){ cerrar(); return; }
      var b = e.target.closest('[data-p39]');
      if(!b) return;
      var acc = b.getAttribute('data-p39');
      if(acc === 'cerrar') cerrar();
      else if(acc === 'elegir') overlay.querySelector('[data-p39-file="' + b.getAttribute('data-p39-rol') + '"]').click();
      else if(acc === 'quitar'){ pruebas[b.getAttribute('data-p39-rol')].splice(Number(b.getAttribute('data-p39-i')), 1); pintar(); }
      else if(acc === 'enviar') enviar();
      else if(acc === 'escuchar') escuchar(b);
      else if(acc === 'compartir') compartir();
      else if(acc === 'video') video();
      else if(acc === 'guias') guias();
      else if(acc === 'javny'){ if(typeof window.EnferixOpenJavnyContext === 'function'){ cerrar(); window.EnferixOpenJavnyContext(t('tituloInforme'), ultimoInforme); } }
    });
    SLOTS.forEach(function(s){
      overlay.querySelector('[data-p39-file="' + s.rol + '"]').addEventListener('change', function(){
        cargar(s.rol, this.files); this.value = '';
      });
    });
    return overlay;
  }

  function pintar(){
    if(!overlay) return;
    SLOTS.forEach(function(s){
      var tira = overlay.querySelector('[data-p39-tira="' + s.rol + '"]');
      var items = pruebas[s.rol];
      if(!items.length){ tira.style.display = 'none'; tira.innerHTML = ''; }
      else {
        tira.style.display = 'flex';
        tira.innerHTML = items.map(function(f, i){
          return '<div class="p39-thumb"><img src="' + f.src + '" alt="">'
            + '<button type="button" data-p39="quitar" data-p39-rol="' + s.rol + '" data-p39-i="' + i + '" title="' + esc(t('quitar')) + '" aria-label="' + esc(t('quitar')) + '">✕</button></div>';
        }).join('');
      }
      var add = overlay.querySelector('[data-p39="elegir"][data-p39-rol="' + s.rol + '"]');
      if(add) add.style.display = items.length >= s.max ? 'none' : '';
    });
  }

  function render(answer){
    var safe = esc(answer).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    var html = safe.split(/\n{2,}/).map(function(p){
      p = p.trim(); if(!p) return '';
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');
    var acciones =
      '<div class="p39-acciones">'
      + '<button type="button" data-p39="escuchar">🔊 ' + esc(t('escuchar')) + '</button>'
      + '<button type="button" data-p39="compartir">📤 ' + esc(t('compartir')) + '</button>'
      + '<button type="button" data-p39="video">🎬 ' + esc(t('video')) + '</button>'
      + '<button type="button" data-p39="guias">📚 ' + esc(t('guias')) + '</button>'
      + (typeof window.EnferixOpenJavnyContext === 'function' ? '<button type="button" data-p39="javny">✨ ' + esc(t('javny')) + '</button>' : '')
      + '</div>';
    return '<div class="p39-res-tit">' + esc(t('informe')) + '</div><div class="p39-ans">' + html + '</div>' + acciones;
  }

  function enviar(){
    if(enviando) return;
    var imagenes = [];
    SLOTS.forEach(function(s){
      pruebas[s.rol].forEach(function(f){
        imagenes.push({ data: f.src.split(',')[1], media: 'image/jpeg', rol: s.rol });
      });
    });
    if(!imagenes.length){ toast(t('errPrimero')); return; }
    var ctx = (overlay.querySelector('#p39Ctx').value || '').trim();
    if(!ctx && !confirm(t('avisoCtx'))) return;
    var res = overlay.querySelector('[data-p39-res]');
    enviando = true;
    overlay.querySelector('.p39-enviar').disabled = true;
    res.innerHTML = '<div class="p39-cargando">' + esc(t('analizando')) + '<span class="p39-dots"><span></span><span></span><span></span></span></div>';
    fetch('/api/javny/imagen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'caso', imagenes: imagenes, contexto: ctx })
    }).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(d){
        if(!r.ok) throw new Error(d.error || ('El servidor respondió HTTP ' + r.status));
        if(!d.answer) throw new Error('Respuesta vacía del servidor.');
        ultimoInforme = String(d.answer || '');
        res.innerHTML = render(d.answer);
        res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }).catch(function(e){
      res.innerHTML = '<div class="p39-error">❌ ' + esc(t('errAnalisis') + (e && e.message ? e.message : e)) + '</div>';
    }).then(function(){
      enviando = false;
      var b = overlay.querySelector('.p39-enviar'); if(b) b.disabled = false;
    });
  }

  /* ── Acciones del informe (misma botonera que los otros lectores) ────────── */
  var vozActiva = null;
  function pararVoz(){
    try { window.speechSynthesis.cancel(); } catch(e){}
    if(vozActiva && vozActiva.btn) vozActiva.btn.textContent = '🔊 ' + t('escuchar');
    vozActiva = null;
  }
  function escuchar(btn){
    if(!ultimoInforme) return;
    if(vozActiva){ pararVoz(); return; }
    if(!('speechSynthesis' in window)){ toast(t('noCompartir')); return; }
    var u = new SpeechSynthesisUtterance(ultimoInforme.slice(0, 9000));
    u.lang = detectLang() === 'ca' ? 'ca-ES' : 'es-ES';
    u.onend = pararVoz; u.onerror = pararVoz;
    vozActiva = { u: u, btn: btn };
    btn.textContent = '⏹ ' + t('parar');
    window.speechSynthesis.speak(u);
  }
  function compartir(){
    if(!ultimoInforme) return;
    var payload = { title: 'Enferix · ' + t('tituloInforme'), text: ultimoInforme.slice(0, 9000) };
    if(navigator.share){ navigator.share(payload).catch(function(e){ if(e && e.name !== 'AbortError') toast(t('noCompartir')); }); return; }
    if(navigator.clipboard){ navigator.clipboard.writeText(payload.title + '\n\n' + payload.text).then(function(){ toast(t('compartido')); }).catch(function(){ toast(t('noCompartir')); }); return; }
    toast(t('noCompartir'));
  }
  function video(){
    var ctx = (overlay && overlay.querySelector('#p39Ctx').value || '').trim();
    var q = (ctx || t('videoQ')) + ' formación enfermería';
    var w = window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), '_blank', 'noopener,noreferrer');
    if(!w) toast(t('noCompartir'));
  }
  function guias(){
    cerrar();
    var input = document.getElementById('search');
    if(input){ input.value = t('guiasQ'); input.dispatchEvent(new Event('input', { bubbles: true })); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function abrir(){ construir(); pintar(); overlay.classList.add('on'); }
  function cerrar(){ if(overlay) overlay.classList.remove('on'); pararVoz(); }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay && overlay.classList.contains('on')){ e.stopPropagation(); cerrar(); }
  }, true);

  /* ── Enganches: botón flotante, menú de Inicio y router ─────────────────── */
  function boot(){
    if(!document.getElementById('casoFab')){
      var ancla = document.getElementById('labFab') || document.getElementById('rxFab');
      if(ancla){
        var fab = document.createElement('button');
        fab.className = 'fab-caso'; fab.id = 'casoFab';
        fab.title = t('fab'); fab.textContent = '🩺';
        fab.onclick = abrir;
        ancla.insertAdjacentElement('afterend', fab);
      }
    }
    if(Array.isArray(window.INURSE_SECTIONS) && !window.INURSE_SECTIONS.some(function(s){ return s.id === 'valoracion'; })){
      window.INURSE_SECTIONS.push({ id: 'valoracion', t: t('menu'), em: '🩺', kw: 'valoracion integral caso paciente informe conjunto radiografia analitica electro diagnostico' });
      var prev = window.EnferixOpenSection;
      window.EnferixOpenSection = function(id){
        if(id === 'valoracion'){ abrir(); return; }
        if(typeof prev === 'function') return prev(id);
      };
    }
    return !!document.getElementById('casoFab');
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 700); setTimeout(boot, 2200);
  window.EnferixValoracion = { open: abrir };
})();
