/* ═══════════════════════════════════════════════════════════════════════════
   P46 · Identificar una pastilla en la casilla del blíster (SPD)
   ---------------------------------------------------------------------------
   La farmacia prepara el blíster semanal con varias pastillas por toma, y
   quien administra busca UNA sin saber cuál de las cuatro es. Se dice cuál se
   busca (y, si se saben, las otras de la casilla), se hace la foto, y la app
   la señala en la foto junto a la foto oficial de CIMA y la descripción
   literal de la ficha técnica, para confirmarlo con los propios ojos.

   Todo lo clínico vive en el servidor (sources/pastilla.mjs, endpoint
   /api/pastilla/identificar): los candidatos salen de CIMA y el modelo sólo
   empareja entre ellos. Aquí hay interfaz y transporte.

   Componente autocontenido: se registra en INURSE_SECTIONS para el menú de
   Inicio y envuelve EnferixOpenSection para atender su id. Los micros de los
   dos campos son el patrón global de voz (.qmic dentro de .qwrap), que
   atiende el listener de inurse21-master-js.js sin una línea nueva aquí.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var L = {
    es: {
      titulo: 'Identificar pastilla',
      sub: 'En la casilla del blíster (SPD)',
      buscadaLbl: '¿Qué pastilla buscas?',
      buscadaPh: 'Ej: Omeprazol Cinfa 20 mg (como en la etiqueta)',
      otrasLbl: 'Otras que hay en la casilla (opcional)',
      otrasPh: 'Ej: Enalapril, Metformina, Atorvastatina',
      otrasAyuda: 'Sepáralas con comas. Ayudan a descartar las que no son.',
      foto: '📷 Hacer foto de la casilla',
      repetir: '📷 Repetir foto',
      identificar: '🔍 Identificar',
      analizando: 'Comparando con las fotos oficiales de CIMA',
      errBuscada: 'Escribe o dicta qué pastilla buscas',
      errFoto: 'Primero haz la foto de la casilla',
      errImagen: 'Selecciona un archivo de imagen',
      errGrande: 'La imagen supera 25 MB',
      errServidor: 'No se ha podido identificar: ',
      estado: {
        identificada: '✅ Es esta',
        dudosa: '⚠️ No es seguro',
        no_encontrada: '❌ No la encuentro en la foto',
        foto_no_valida: '📷 La foto no deja ver las pastillas'
      },
      sinCima: function(n){ return 'No encuentro «' + n + '» en CIMA'; },
      sinCimaAyuda: 'Revisa cómo está escrito en la etiqueta del blíster (nombre y, si puedes, laboratorio y dosis). Sin la ficha de CIMA no se compara: así no se adivina.',
      aprox: 'aprox.',
      posicion: 'Dónde está',
      rasgos: 'Cómo reconocerla',
      dudas: 'Por qué no es seguro',
      porQue: 'Motivo',
      oficial: 'Foto oficial de CIMA',
      sinFoto: 'CIMA no tiene foto de la pastilla de esta presentación: compara con la descripción.',
      fichaTec: 'Ficha técnica · sección 3 (forma farmacéutica)',
      sinDesc: 'La ficha técnica no describe el aspecto de esta presentación.',
      verCima: 'Ver en CIMA ↗',
      otrasLoc: 'Las otras que ha reconocido',
      comparada: function(n){ return 'Comparada con ' + n + (n === 1 ? ' presentación' : ' presentaciones') + ' de CIMA'; },
      noEnCima: 'No encontradas en CIMA (no se usaron para descartar): ',
      pastillas: function(n){ return n + (n === 1 ? ' pastilla en la foto' : ' pastillas en la foto'); },
      aviso: 'Ayuda visual. Antes de administrar, confírmalo con la etiqueta del blíster o con la farmacia.',
      soloEs: '',
      escuchar: '🔊 Escuchar', parar: '⏹ Parar',
      menu: 'Identificar pastilla'
    },
    ca: {
      titulo: 'Identificar pastilla',
      sub: 'A la casella del blíster (SPD)',
      buscadaLbl: 'Quina pastilla busques?',
      buscadaPh: 'Ex: Omeprazol Cinfa 20 mg (com a l’etiqueta)',
      otrasLbl: 'Altres que hi ha a la casella (opcional)',
      otrasPh: 'Ex: Enalapril, Metformina, Atorvastatina',
      otrasAyuda: 'Separa-les amb comes. Ajuden a descartar les que no són.',
      foto: '📷 Fes la foto de la casella',
      repetir: '📷 Repeteix la foto',
      identificar: '🔍 Identifica',
      analizando: 'Comparant amb les fotos oficials de CIMA',
      errBuscada: 'Escriu o dicta quina pastilla busques',
      errFoto: 'Primer fes la foto de la casella',
      errImagen: 'Selecciona un arxiu d’imatge',
      errGrande: 'La imatge supera 25 MB',
      errServidor: 'No s’ha pogut identificar: ',
      estado: {
        identificada: '✅ És aquesta',
        dudosa: '⚠️ No és segur',
        no_encontrada: '❌ No la trobo a la foto',
        foto_no_valida: '📷 La foto no deixa veure les pastilles'
      },
      sinCima: function(n){ return 'No trobo «' + n + '» a CIMA'; },
      sinCimaAyuda: 'Revisa com està escrit a l’etiqueta del blíster (nom i, si pots, laboratori i dosi). Sense la fitxa de CIMA no es compara: així no s’endevina.',
      aprox: 'aprox.',
      posicion: 'On és',
      rasgos: 'Com reconèixer-la',
      dudas: 'Per què no és segur',
      porQue: 'Motiu',
      oficial: 'Foto oficial de CIMA',
      sinFoto: 'CIMA no té foto de la pastilla d’aquesta presentació: compara amb la descripció.',
      fichaTec: 'Fitxa tècnica · secció 3 (forma farmacèutica)',
      sinDesc: 'La fitxa tècnica no descriu l’aspecte d’aquesta presentació.',
      verCima: 'Veure a CIMA ↗',
      otrasLoc: 'Les altres que ha reconegut',
      comparada: function(n){ return 'Comparada amb ' + n + (n === 1 ? ' presentació' : ' presentacions') + ' de CIMA'; },
      noEnCima: 'No trobades a CIMA (no s’han fet servir per descartar): ',
      pastillas: function(n){ return n + (n === 1 ? ' pastilla a la foto' : ' pastilles a la foto'); },
      aviso: 'Ajuda visual. Abans d’administrar, confirma-ho amb l’etiqueta del blíster o amb la farmàcia.',
      soloEs: 'La descripció i l’explicació només estan disponibles en castellà.',
      escuchar: '🔊 Escolta', parar: '⏹ Atura',
      menu: 'Identificar pastilla'
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
  function urlSegura(u){ return /^https?:\/\//i.test(String(u || '')) ? String(u) : ''; }

  /* ── Estado ──────────────────────────────────────────────────────────────── */
  var foto = '';            // dataURL JPEG reescalado
  var overlay = null, enviando = false;
  var ultimoResumen = '';   // texto para «Escuchar»

  /* ── Reescalado: el grabado de una pastilla es pequeño, se conserva detalle ─ */
  function procesar(dataURL){
    return new Promise(function(resolve, reject){
      var im = new Image();
      im.onload = function(){
        var max = 2048, k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.naturalWidth * k));
        c.height = Math.max(1, Math.round(im.naturalHeight * k));
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.9));
      };
      im.onerror = function(){ reject(new Error('imagen ilegible')); };
      im.src = dataURL;
    });
  }
  function cargar(file){
    if(!file) return;
    if(!/^image\//.test(String(file.type || ''))){ toast(t('errImagen')); return; }
    if(file.size > 25 * 1024 * 1024){ toast(t('errGrande')); return; }
    var r = new FileReader();
    r.onload = function(){
      procesar(r.result).then(function(jpeg){ foto = jpeg; limpiarResultado(); pintarFoto(); })
        .catch(function(){ toast(t('errImagen')); });
    };
    r.readAsDataURL(file);
  }

  /* ── Interfaz ───────────────────────────────────────────────────────────── */
  function construir(){
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'p46-overlay';
    overlay.innerHTML =
      '<div class="p46-caja" role="dialog" aria-modal="true" aria-label="' + esc(t('titulo')) + '">'
      + '<div class="p46-cab">'
      +   '<span class="p46-ico">💊</span>'
      +   '<div class="p46-tit"><h3>' + esc(t('titulo')) + '</h3><p>' + esc(t('sub')) + '</p></div>'
      +   '<button type="button" class="p46-x" data-p46="cerrar" aria-label="Cerrar">✕</button>'
      + '</div>'
      + '<div class="p46-cuerpo">'
      +   '<label class="p46-lbl" for="p46Buscada">' + esc(t('buscadaLbl')) + '</label>'
      +   '<div class="qwrap p46-qwrap">'
      +     '<input id="p46Buscada" type="text" autocomplete="off" placeholder="' + esc(t('buscadaPh')) + '">'
      +     '<button type="button" class="qmic p46-mic" title="Dictar">🎙️</button>'
      +   '</div>'
      +   '<label class="p46-lbl" for="p46Otras">' + esc(t('otrasLbl')) + '</label>'
      +   '<div class="qwrap p46-qwrap">'
      +     '<input id="p46Otras" type="text" autocomplete="off" placeholder="' + esc(t('otrasPh')) + '">'
      +     '<button type="button" class="qmic p46-mic" title="Dictar">🎙️</button>'
      +   '</div>'
      +   '<p class="p46-ayuda">' + esc(t('otrasAyuda')) + '</p>'
      +   '<input type="file" id="p46File" accept="image/*" capture="environment" style="display:none">'
      +   '<button type="button" class="p46-foto" data-p46="foto">' + esc(t('foto')) + '</button>'
      +   '<div class="p46-previa" data-p46-previa style="display:none"></div>'
      +   '<button type="button" class="p46-enviar" data-p46="enviar">' + esc(t('identificar')) + '</button>'
      +   '<div class="p46-resultado" data-p46-res></div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e){
      if(e.target === overlay){ cerrar(); return; }
      var b = e.target.closest('[data-p46]');
      if(!b) return;
      var acc = b.getAttribute('data-p46');
      if(acc === 'cerrar') cerrar();
      else if(acc === 'foto') overlay.querySelector('#p46File').click();
      else if(acc === 'enviar') enviar();
      else if(acc === 'escuchar') escuchar(b);
    });
    overlay.querySelector('#p46File').addEventListener('change', function(){
      cargar(this.files && this.files[0]); this.value = '';
    });
    return overlay;
  }

  function pintarFoto(caja, tono){
    var previa = overlay.querySelector('[data-p46-previa]');
    var btn = overlay.querySelector('.p46-foto');
    if(!foto){ previa.style.display = 'none'; previa.innerHTML = ''; btn.textContent = t('foto'); return; }
    var marco = '';
    if(caja){
      marco = '<span class="p46-marco p46-marco-' + tono + '" style="left:' + (caja[0] * 100) + '%;top:' + (caja[1] * 100)
        + '%;width:' + ((caja[2] - caja[0]) * 100) + '%;height:' + ((caja[3] - caja[1]) * 100) + '%"><i>' + esc(t('aprox')) + '</i></span>';
    }
    previa.style.display = 'block';
    previa.innerHTML = '<div class="p46-lienzo"><img src="' + foto + '" alt="">' + marco + '</div>';
    btn.textContent = t('repetir');
  }
  function limpiarResultado(){
    var res = overlay && overlay.querySelector('[data-p46-res]');
    if(res) res.innerHTML = '';
    ultimoResumen = '';
  }

  function tarjetaCandidato(c){
    var img = urlSegura(c.fotoPastilla)
      ? '<img class="p46-oficial-img" src="' + esc(c.fotoPastilla) + '" alt="' + esc(c.nombre) + '" loading="lazy">'
      : '<div class="p46-sinfoto">' + esc(t('sinFoto')) + '</div>';
    return '<div class="p46-oficial">'
      + '<div class="p46-oficial-tit">' + esc(t('oficial')) + '</div>'
      + img
      + '<div class="p46-oficial-nom"><b>' + esc(c.nombre) + '</b>' + (c.lab ? '<span>' + esc(c.lab) + '</span>' : '') + '</div>'
      + '<div class="p46-ft"><div class="p46-ft-tit">' + esc(t('fichaTec')) + '</div>'
      +   (c.descripcion ? '<p>' + esc(c.descripcion).replace(/\n/g, '<br>') + '</p>' : '<p class="p46-tenue">' + esc(t('sinDesc')) + '</p>')
      + '</div>'
      + (urlSegura(c.urlCima) ? '<a class="p46-cima" href="' + esc(c.urlCima) + '" target="_blank" rel="noopener noreferrer">' + esc(t('verCima')) + '</a>' : '')
      + '</div>';
  }

  function render(d){
    if(d.estado === 'sin_cima'){
      ultimoResumen = t('sinCima')(d.buscada);
      return '<div class="p46-veredicto p46-v-nocima">' + esc(t('sinCima')(d.buscada)) + '</div>'
        + '<p class="p46-texto">' + esc(t('sinCimaAyuda')) + '</p>';
    }
    var tono = d.estado === 'identificada' ? 'ok' : d.estado === 'dudosa' ? 'duda' : 'mal';
    var cand = null;
    (d.candidatos || []).forEach(function(c){ if(d.coincidencia && c.ref === d.coincidencia.ref) cand = c; });
    var otrosPorRef = {};
    (d.otros || []).forEach(function(c){ otrosPorRef[c.ref] = c; });

    var h = '<div class="p46-veredicto p46-v-' + tono + '">' + esc((t('estado') || {})[d.estado] || d.estado) + '</div>';
    if(d.pastillasEnFoto != null) h += '<div class="p46-cuenta">' + esc(t('pastillas')(d.pastillasEnFoto)) + '</div>';
    if(d.coincidencia){
      if(d.coincidencia.posicion) h += '<div class="p46-dato"><span>' + esc(t('posicion')) + '</span><b>' + esc(d.coincidencia.posicion) + '</b></div>';
      if(d.coincidencia.rasgos) h += '<div class="p46-dato"><span>' + esc(t('rasgos')) + '</span><p>' + esc(d.coincidencia.rasgos) + '</p></div>';
    }
    if(d.dudas) h += '<div class="p46-dudas"><b>' + esc(t('dudas')) + '</b><p>' + esc(d.dudas) + '</p></div>';
    if(d.explicacion) h += '<div class="p46-dato"><span>' + esc(t('porQue')) + '</span><p>' + esc(d.explicacion) + '</p></div>';
    (d.avisos || []).forEach(function(a){ h += '<div class="p46-dudas"><p>' + esc(a) + '</p></div>'; });
    if(cand) h += tarjetaCandidato(cand);

    var otras = (d.otras || []).filter(function(o){ return otrosPorRef[o.ref]; });
    if(otras.length){
      h += '<div class="p46-otras"><div class="p46-sec">' + esc(t('otrasLoc')) + '</div><ul>'
        + otras.map(function(o){ return '<li><b>' + esc(otrosPorRef[o.ref].nombre) + '</b> · ' + esc(o.posicion) + '</li>'; }).join('')
        + '</ul></div>';
    }
    if((d.candidatos || []).length){
      h += '<details class="p46-comparada"><summary>' + esc(t('comparada')(d.candidatos.length)) + '</summary><ul>'
        + d.candidatos.map(function(c){ return '<li>' + esc(c.nombre) + (c.lab ? ' · ' + esc(c.lab) : '') + (c.fotoPastilla ? '' : ' · <i>' + esc(t('sinFoto').split(':')[0]) + '</i>') + '</li>'; }).join('')
        + '</ul></details>';
    }
    if((d.otrasSinCima || []).length) h += '<p class="p46-tenue">' + esc(t('noEnCima') + d.otrasSinCima.join(', ')) + '</p>';
    if(t('soloEs')) h += '<p class="p46-tenue">' + esc(t('soloEs')) + '</p>';
    h += '<div class="p46-aviso">' + esc(t('aviso')) + '</div>';
    h += '<div class="p46-acciones"><button type="button" data-p46="escuchar">' + esc(t('escuchar')) + '</button></div>';

    ultimoResumen = [((t('estado') || {})[d.estado] || '').replace(/^[^\wÁÉÍÓÚáéíóúÑñ¿¡]+/, ''),
      d.coincidencia ? d.coincidencia.posicion : '', d.coincidencia ? d.coincidencia.rasgos : '', d.dudas, t('aviso')]
      .filter(Boolean).join('. ');
    pintarFoto(d.coincidencia && d.coincidencia.caja, tono);
    return h;
  }

  function enviar(){
    if(enviando) return;
    var buscada = (overlay.querySelector('#p46Buscada').value || '').trim();
    var otras = (overlay.querySelector('#p46Otras').value || '').split(/[,;\n]| y /).map(function(s){ return s.trim(); }).filter(Boolean);
    if(!buscada){ toast(t('errBuscada')); overlay.querySelector('#p46Buscada').focus(); return; }
    if(!foto){ toast(t('errFoto')); return; }
    var res = overlay.querySelector('[data-p46-res]');
    enviando = true;
    overlay.querySelector('.p46-enviar').disabled = true;
    pintarFoto();
    res.innerHTML = '<div class="p46-cargando">' + esc(t('analizando')) + '<span class="p46-dots"><span></span><span></span><span></span></span></div>';
    fetch('/api/pastilla/identificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buscada: buscada, otras: otras, data: foto.split(',')[1], media: 'image/jpeg' })
    }).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(d){
        if(!r.ok) throw new Error(d.error || ('El servidor respondió HTTP ' + r.status));
        if(!d.estado) throw new Error('Respuesta vacía del servidor.');
        res.innerHTML = render(d);
        res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }).catch(function(e){
      res.innerHTML = '<div class="p46-error">❌ ' + esc(t('errServidor') + (e && e.message ? e.message : e)) + '</div>';
    }).then(function(){
      enviando = false;
      var b = overlay.querySelector('.p46-enviar'); if(b) b.disabled = false;
    });
  }

  /* ── Escuchar el veredicto (manos ocupadas con el blíster) ─────────────── */
  var vozActiva = null;
  function pararVoz(){
    try { window.speechSynthesis.cancel(); } catch(e){}
    if(vozActiva && vozActiva.btn) vozActiva.btn.textContent = t('escuchar');
    vozActiva = null;
  }
  function escuchar(btn){
    if(!ultimoResumen || !('speechSynthesis' in window)) return;
    if(vozActiva){ pararVoz(); return; }
    var u = new SpeechSynthesisUtterance(ultimoResumen.slice(0, 3000));
    u.lang = 'es-ES';
    u.onend = pararVoz; u.onerror = pararVoz;
    vozActiva = { u: u, btn: btn };
    btn.textContent = t('parar');
    try { window.speechSynthesis.resume(); } catch(e){}
    window.speechSynthesis.speak(u);
  }

  function abrir(){ construir(); pintarFoto(); overlay.classList.add('on'); }
  function cerrar(){ if(overlay) overlay.classList.remove('on'); pararVoz(); }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay && overlay.classList.contains('on')){ e.stopPropagation(); cerrar(); }
  }, true);

  /* ── Enganches: menú de Inicio y router ─────────────────────────────────── */
  function boot(){
    if(Array.isArray(window.INURSE_SECTIONS) && !window.INURSE_SECTIONS.some(function(s){ return s.id === 'identificar-pastilla'; })){
      window.INURSE_SECTIONS.push({ id: 'identificar-pastilla', t: t('menu'), em: '💊', kw: 'pastilla pastillas identificar blister blíster spd pastillero medicacion comprimido capsula foto camara cual es' });
      var prev = window.EnferixOpenSection;
      window.EnferixOpenSection = function(id){
        if(id === 'identificar-pastilla'){ abrir(); return; }
        if(typeof prev === 'function') return prev(id);
      };
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600); setTimeout(boot, 2000);
  window.EnferixPastilla = { open: abrir };
})();
