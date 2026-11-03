/* ═══════════════════════════════════════════════════════════════════════════
   P41 · Traspaso SBAR
   ---------------------------------------------------------------------------
   Cuando el profesional pide «el traspaso», «el relevo» o «el SBAR» durante
   una conversación con Javny Live, el modelo llama a la herramienta
   traspaso_sbar rellenando los cuatro campos SOLO con lo dicho en la
   conversación (regla 9b del guion de Live: nada inferido; lo no referido se
   marca como tal). Este componente solo PINTA ese traspaso y lo deja listo
   para cantarlo, copiarlo o compartirlo con el equipo que llega.

   Si hay un registro de parada reciente (P40, inurse_rcp_v1, últimas 6 h),
   se adjunta debajo con sus horas: es la parte del traspaso que nadie
   recuerda de memoria.

   Autocontenido: expone window.EnferixSBAR.mostrar(datos). El puente desde
   Live es una herramienta más (misma familia que rcp_parada), nada del flujo
   de conversación se toca.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var RCPK = 'inurse_rcp_v1';
  var RCP_VENTANA_MS = 6 * 60 * 60 * 1000;

  var L = {
    es: {
      titulo: 'Traspaso SBAR',
      sub: 'Compuesto solo con lo dicho en la conversación',
      s: 'Situación', b: 'Antecedentes', a: 'Evaluación', r: 'Recomendación',
      vacio: 'No referido en la conversación',
      rcpTit: 'Registro de la parada (horas reales)',
      escuchar: 'Escuchar', parar: 'Parar',
      copiar: 'Copiar', compartir: 'Compartir', cerrar: 'Cerrar',
      copiado: 'Traspaso copiado',
      noCompartir: 'Compartir no está disponible en este navegador',
      titTexto: 'Traspaso SBAR · Enferix'
    },
    ca: {
      titulo: 'Traspàs SBAR',
      sub: 'Compost només amb el que s’ha dit a la conversa',
      s: 'Situació', b: 'Antecedents', a: 'Avaluació', r: 'Recomanació',
      vacio: 'No referit a la conversa',
      rcpTit: 'Registre de l’aturada (hores reals)',
      escuchar: 'Escolta', parar: 'Atura',
      copiar: 'Copia', compartir: 'Comparteix', cerrar: 'Tanca',
      copiado: 'Traspàs copiat',
      noCompartir: 'Compartir no està disponible en aquest navegador',
      titTexto: 'Traspàs SBAR · Enferix'
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
  function mmss(ms){
    var s = Math.floor(ms/1000);
    return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+(s%60)).slice(-2);
  }

  var overlay = null, datosActuales = null, vozActiva = false;

  function registroRCP(){
    try {
      var d = JSON.parse(localStorage.getItem(RCPK) || 'null');
      if(d && Array.isArray(d.eventos) && d.eventos.length && d.t0 && (Date.now() - d.t0) < RCP_VENTANA_MS) return d;
    } catch(e){}
    return null;
  }

  function campo(valor){
    var v = String(valor == null ? '' : valor).trim();
    return v || t('vacio');
  }

  function textoPlano(datos){
    var reg = registroRCP();
    var lineas = [
      t('titTexto'),
      'S · ' + t('s') + ': ' + campo(datos.situacion),
      'B · ' + t('b') + ': ' + campo(datos.antecedentes),
      'A · ' + t('a') + ': ' + campo(datos.evaluacion),
      'R · ' + t('r') + ': ' + campo(datos.recomendacion)
    ];
    if(reg){
      lineas.push('');
      lineas.push(t('rcpTit') + ':');
      reg.eventos.forEach(function(e){ lineas.push('[' + mmss(e.ms) + ' · ' + e.hora + '] ' + e.texto); });
    }
    return lineas.join('\n');
  }

  function construir(){
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'p41-overlay';
    overlay.innerHTML = '<div class="p41-caja" role="dialog" aria-modal="true" aria-label="' + esc(t('titulo')) + '"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e){
      if(e.target === overlay){ cerrar(); return; }
      var b = e.target.closest('[data-p41]');
      if(!b) return;
      var acc = b.getAttribute('data-p41');
      if(acc === 'cerrar') cerrar();
      else if(acc === 'escuchar') escuchar(b);
      else if(acc === 'copiar' || acc === 'compartir'){
        if(!datosActuales) return;
        var texto = textoPlano(datosActuales);
        if(acc === 'compartir' && navigator.share){
          navigator.share({ title: t('titTexto'), text: texto }).catch(function(){});
        } else if(navigator.clipboard){
          navigator.clipboard.writeText(texto).then(function(){ toast(t('copiado')); }).catch(function(){ toast(t('noCompartir')); });
        } else toast(t('noCompartir'));
      }
    });
    return overlay;
  }

  function pararVoz(){
    try { window.speechSynthesis.cancel(); } catch(e){}
    vozActiva = false;
    var b = overlay && overlay.querySelector('[data-p41="escuchar"]');
    if(b) b.textContent = '🔊 ' + t('escuchar');
  }
  function escuchar(btn){
    if(!datosActuales) return;
    if(vozActiva){ pararVoz(); return; }
    if(!('speechSynthesis' in window)){ toast(t('noCompartir')); return; }
    try {
      var u = new SpeechSynthesisUtterance(textoPlano(datosActuales).slice(0, 9000));
      u.lang = detectLang() === 'ca' ? 'ca-ES' : 'es-ES';
      u.onend = pararVoz; u.onerror = pararVoz;
      vozActiva = true;
      btn.textContent = '⏹ ' + t('parar');
      window.speechSynthesis.speak(u);
    } catch(e){ pararVoz(); }
  }

  function mostrar(datos){
    datos = datos || {};
    datosActuales = {
      situacion: datos.situacion || datos.s || '',
      antecedentes: datos.antecedentes || datos.b || '',
      evaluacion: datos.evaluacion || datos.a || '',
      recomendacion: datos.recomendacion || datos.r || ''
    };
    construir();
    var reg = registroRCP();
    var bloques = [
      ['S', t('s'), datosActuales.situacion],
      ['B', t('b'), datosActuales.antecedentes],
      ['A', t('a'), datosActuales.evaluacion],
      ['R', t('r'), datosActuales.recomendacion]
    ];
    overlay.querySelector('.p41-caja').innerHTML =
      '<div class="p41-cab">'
      + '<span class="p41-ico">📋</span>'
      + '<div class="p41-tit"><h3>' + esc(t('titulo')) + '</h3><p>' + esc(t('sub')) + '</p></div>'
      + '<button type="button" class="p41-x" data-p41="cerrar" aria-label="' + esc(t('cerrar')) + '">✕</button>'
      + '</div>'
      + '<div class="p41-cuerpo">'
      + bloques.map(function(bl){
          var vacio = !String(bl[2] || '').trim();
          return '<div class="p41-bloque' + (vacio ? ' p41-nr' : '') + '">'
            + '<div class="p41-letra">' + bl[0] + '</div>'
            + '<div class="p41-texto"><b>' + esc(bl[1]) + '</b><span>' + esc(campo(bl[2])) + '</span></div>'
            + '</div>';
        }).join('')
      + (reg
          ? '<div class="p41-rcp"><b>🚨 ' + esc(t('rcpTit')) + '</b><ol>'
            + reg.eventos.map(function(e){
                return '<li><span>' + esc(mmss(e.ms)) + ' · ' + esc(e.hora) + '</span> ' + esc(e.texto) + '</li>';
              }).join('')
            + '</ol></div>'
          : '')
      + '<div class="p41-acc">'
      + '<button type="button" data-p41="escuchar">🔊 ' + esc(t('escuchar')) + '</button>'
      + '<button type="button" data-p41="copiar">📋 ' + esc(t('copiar')) + '</button>'
      + '<button type="button" data-p41="compartir">📤 ' + esc(t('compartir')) + '</button>'
      + '</div>'
      + '</div>';
    overlay.classList.add('on');
  }
  function cerrar(){ if(overlay) overlay.classList.remove('on'); pararVoz(); }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay && overlay.classList.contains('on')){ e.stopPropagation(); cerrar(); }
  }, true);

  window.EnferixSBAR = { mostrar: mostrar, cerrar: cerrar };
})();
