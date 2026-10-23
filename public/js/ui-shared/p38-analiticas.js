/* ═══════════════════════════════════════════════════════════════════════════
   P38 · Analíticas · Informe con Javny
   ---------------------------------------------------------------------------
   Tercer lector de imagen de la app, junto al Electro (📟) y Rayos X (🩻):
   se fotografía una analítica (una o varias páginas del MISMO informe) y
   Javny redacta un informe por apartados: valores alterados y críticos,
   interpretación orientativa, manejo general e intervenciones de enfermería.

   Todo lo clínico vive en el guion del servidor (GUION_ANALITICA en
   sources/imagen-clinica.mjs, modo "lab" del endpoint /api/javny/imagen):
   aquí solo hay interfaz y transporte. Las fotos se reescalan en canvas
   antes de enviarse para caber en el límite del endpoint (8 MB).

   Componente autocontenido, sin tocar el monolito: inyecta su botón 🧪 en la
   pila de flotantes, se registra en INURSE_SECTIONS para el menú de Inicio,
   y envuelve EnferixOpenSection para atender su id. El micro del contexto es
   el patrón global de voz (.qmic dentro de .qwrap): lo atiende el listener
   de inurse21-master-js.js sin una línea nueva aquí.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var MAX_FOTOS = 4;

  var L = {
    es: {
      fab: 'Analíticas (informe con Javny)',
      titulo: 'Analíticas',
      sub: 'Informe orientativo con Javny',
      drop: '🧪 Añade la foto de la analítica (hasta ' + MAX_FOTOS + ' páginas del mismo informe)',
      anadir: '+ Añadir página',
      quitar: 'Quitar esta página',
      pagina: function(i){ return 'Página ' + i; },
      ctxLabel: 'Contexto del paciente (opcional)',
      ctxPh: 'Ej: mujer de 78 años en tratamiento anticoagulante; control de función renal…',
      enviar: 'Redactar informe con Javny',
      enviarN: function(n){ return 'Redactar informe de las ' + n + ' páginas con Javny'; },
      analizando: 'Leyendo la analítica',
      informe: 'INFORME ORIENTATIVO',
      errImagen: 'Selecciona un archivo de imagen',
      errGrande: 'La imagen supera 25 MB',
      errMax: 'Máximo ' + MAX_FOTOS + ' páginas por informe',
      errPrimero: 'Primero añade la foto de la analítica',
      errAnalisis: 'No se ha podido leer la analítica: ',
      menu: 'Analíticas'
    },
    ca: {
      fab: 'Analítiques (informe amb Javny)',
      titulo: 'Analítiques',
      sub: 'Informe orientatiu amb Javny',
      drop: '🧪 Afegeix la foto de l’analítica (fins a ' + MAX_FOTOS + ' pàgines del mateix informe)',
      anadir: '+ Afegeix pàgina',
      quitar: 'Treu aquesta pàgina',
      pagina: function(i){ return 'Pàgina ' + i; },
      ctxLabel: 'Context del pacient (opcional)',
      ctxPh: 'Ex: dona de 78 anys amb anticoagulants; control de funció renal…',
      enviar: 'Redacta l’informe amb Javny',
      enviarN: function(n){ return 'Redacta l’informe de les ' + n + ' pàgines amb Javny'; },
      analizando: 'Llegint l’analítica',
      informe: 'INFORME ORIENTATIU',
      errImagen: 'Selecciona un arxiu d’imatge',
      errGrande: 'La imatge supera 25 MB',
      errMax: 'Màxim ' + MAX_FOTOS + ' pàgines per informe',
      errPrimero: 'Primer afegeix la foto de l’analítica',
      errAnalisis: 'No s’ha pogut llegir l’analítica: ',
      menu: 'Analítiques'
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

  /* ── Estado ──────────────────────────────────────────────────────────────── */
  var fotos = [];   // {src(dataURL), w, h}
  var overlay = null, enviando = false;

  /* ── Reescalado en canvas (legibilidad primero: 2048 px, calidad 0,88) ──── */
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

  function cargar(files){
    var lista = [].slice.call(files || []).filter(Boolean);
    if(!lista.length) return;
    var hueco = MAX_FOTOS - fotos.length;
    if(lista.length > hueco){ toast(t('errMax')); lista = lista.slice(0, Math.max(0, hueco)); }
    lista.forEach(function(f){
      if(!/^image\//.test(String(f.type || ''))){ toast(t('errImagen')); return; }
      if(f.size > 25 * 1024 * 1024){ toast(t('errGrande')); return; }
      var r = new FileReader();
      r.onload = function(){
        procesar(r.result).then(function(jpeg){
          fotos.push({ src: jpeg });
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
    overlay.className = 'p38-overlay';
    overlay.innerHTML =
      '<div class="p38-caja" role="dialog" aria-modal="true" aria-label="' + esc(t('titulo')) + '">'
      + '<div class="p38-cab">'
      +   '<span class="p38-ico">🧪</span>'
      +   '<div class="p38-tit"><h3>' + esc(t('titulo')) + '</h3><p>' + esc(t('sub')) + '</p></div>'
      +   '<button type="button" class="p38-x" data-p38="cerrar" aria-label="Cerrar">✕</button>'
      + '</div>'
      + '<div class="p38-cuerpo">'
      +   '<input type="file" id="p38File" accept="image/*" multiple style="display:none">'
      +   '<button type="button" class="p38-drop" data-p38="elegir">' + esc(t('drop')) + '</button>'
      +   '<div class="p38-tira" data-p38-tira style="display:none"></div>'
      +   '<label class="p38-lbl" for="p38Ctx">' + esc(t('ctxLabel')) + '</label>'
      +   '<div class="qwrap p38-qwrap">'
      +     '<textarea id="p38Ctx" rows="2" placeholder="' + esc(t('ctxPh')) + '"></textarea>'
      +     '<button type="button" class="qmic p38-mic" title="Dictar">🎙️</button>'
      +   '</div>'
      +   '<button type="button" class="p38-enviar" data-p38="enviar">' + esc(t('enviar')) + '</button>'
      +   '<div class="p38-resultado" data-p38-res></div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e){
      if(e.target === overlay){ cerrar(); return; }
      var b = e.target.closest('[data-p38]');
      if(!b) return;
      var acc = b.getAttribute('data-p38');
      if(acc === 'cerrar') cerrar();
      else if(acc === 'elegir' || acc === 'anadir') overlay.querySelector('#p38File').click();
      else if(acc === 'quitar'){ fotos.splice(Number(b.getAttribute('data-p38-i')), 1); pintar(); }
      else if(acc === 'enviar') enviar();
    });
    overlay.querySelector('#p38File').addEventListener('change', function(){
      cargar(this.files); this.value = '';
    });
    return overlay;
  }

  function pintar(){
    if(!overlay) return;
    var tira = overlay.querySelector('[data-p38-tira]');
    var drop = overlay.querySelector('.p38-drop');
    var btn = overlay.querySelector('.p38-enviar');
    if(!fotos.length){
      tira.style.display = 'none'; tira.innerHTML = '';
      drop.textContent = t('drop');
      btn.textContent = t('enviar');
      return;
    }
    tira.style.display = 'flex';
    tira.innerHTML = fotos.map(function(f, i){
      return '<div class="p38-thumb"><img src="' + f.src + '" alt=""><span>' + esc(t('pagina')(i + 1)) + '</span>'
        + '<button type="button" data-p38="quitar" data-p38-i="' + i + '" title="' + esc(t('quitar')) + '" aria-label="' + esc(t('quitar')) + '">✕</button></div>';
    }).join('')
    + (fotos.length < MAX_FOTOS ? '<button type="button" class="p38-thumb-add" data-p38="anadir">' + esc(t('anadir')) + '</button>' : '');
    drop.textContent = '🧪 ' + t('anadir');
    btn.textContent = fotos.length > 1 ? t('enviarN')(fotos.length) : t('enviar');
  }

  function render(answer){
    var safe = esc(answer).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    var html = safe.split(/\n{2,}/).map(function(p){
      p = p.trim(); if(!p) return '';
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');
    return '<div class="p38-res-tit">' + esc(t('informe')) + '</div><div class="p38-ans">' + html + '</div>';
  }

  function enviar(){
    if(enviando) return;
    if(!fotos.length){ toast(t('errPrimero')); return; }
    var res = overlay.querySelector('[data-p38-res]');
    var ctx = (overlay.querySelector('#p38Ctx').value || '').trim();
    var body;
    if(fotos.length === 1){
      body = { tipo: 'lab', data: fotos[0].src.split(',')[1], media: 'image/jpeg', contexto: ctx };
    } else {
      body = { tipo: 'lab', imagenes: fotos.map(function(f){ return { data: f.src.split(',')[1], media: 'image/jpeg' }; }), contexto: ctx };
    }
    enviando = true;
    overlay.querySelector('.p38-enviar').disabled = true;
    res.innerHTML = '<div class="p38-cargando">' + esc(t('analizando')) + '<span class="p38-dots"><span></span><span></span><span></span></span></div>';
    fetch('/api/javny/imagen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(d){
        if(!r.ok) throw new Error(d.error || ('El servidor respondió HTTP ' + r.status));
        if(!d.answer) throw new Error('Respuesta vacía del servidor.');
        res.innerHTML = render(d.answer);
        res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }).catch(function(e){
      res.innerHTML = '<div class="p38-error">❌ ' + esc(t('errAnalisis') + (e && e.message ? e.message : e)) + '</div>';
    }).then(function(){
      // tras resolverse el catch, esto corre siempre (equivale a finally, que
      // no existe en algunos WebView antiguos)
      enviando = false;
      var b = overlay.querySelector('.p38-enviar'); if(b) b.disabled = false;
    });
  }

  function abrir(){ construir(); pintar(); overlay.classList.add('on'); }
  function cerrar(){ if(overlay) overlay.classList.remove('on'); }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay && overlay.classList.contains('on')){ e.stopPropagation(); cerrar(); }
  }, true);

  /* ── Enganches: botón flotante, menú de Inicio y router ─────────────────── */
  function boot(){
    if(!document.getElementById('labFab')){
      var rx = document.getElementById('rxFab');
      if(rx){
        var fab = document.createElement('button');
        fab.className = 'fab-lab'; fab.id = 'labFab';
        fab.title = t('fab'); fab.textContent = '🧪';
        fab.onclick = abrir;
        rx.insertAdjacentElement('afterend', fab);
      }
    }
    if(Array.isArray(window.INURSE_SECTIONS) && !window.INURSE_SECTIONS.some(function(s){ return s.id === 'analiticas'; })){
      window.INURSE_SECTIONS.push({ id: 'analiticas', t: t('menu'), em: '🧪', kw: 'analitica analiticas laboratorio hemograma bioquimica gasometria coagulacion valores informe sangre orina lab' });
      var prev = window.EnferixOpenSection;
      window.EnferixOpenSection = function(id){
        if(id === 'analiticas'){ abrir(); return; }
        if(typeof prev === 'function') return prev(id);
      };
    }
    return !!document.getElementById('labFab');
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600); setTimeout(boot, 2000);
  window.EnferixAnaliticas = { open: abrir };
})();
