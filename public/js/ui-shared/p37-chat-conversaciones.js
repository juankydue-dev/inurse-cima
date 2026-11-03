/* ═══════════════════════════════════════════════════════════════════════════
   P37 · Conversaciones guardadas del chat de Javny
   ---------------------------------------------------------------------------
   El chat guardaba solo el hilo EN CURSO (guiaHJ23_chat): al empezar una
   conversación nueva, la anterior se perdía. Este componente archiva cada
   conversación automáticamente y añade un cajón para reabrirlas o borrarlas.

   Cómo funciona, sin tocar el monolito del chat (inline-script-4931.js):
   - El chat expone una API mínima (window.EnferixChat: mensajes/cargar).
   - Aquí se encadena un segundo envoltorio sobre localStorage.setItem (igual
     que ya hace EnferixCloud): cada vez que el chat persiste su hilo, se
     archiva en inurse_chats_v1 con un id estable por conversación.
   - La clave NO es secreta, así que EnferixCloud la sube sola a la cuenta del
     usuario con sesión iniciada: las conversaciones viajan entre dispositivos
     sin código nuevo de servidor.

   Distinto del historial v31 (🕒): aquel guarda preguntas sueltas con su
   respuesta; esto guarda HILOS completos que se pueden reabrir y continuar.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var CHATK = 'guiaHJ23_chat';
  var LISTK = 'inurse_chats_v1';
  var CURK  = 'inurse_chats_actual_v1';
  var MAX_CONVOS = 30;
  var MAX_BYTES  = 1500000; // tope del archivo entero: localStorage es finito

  var L = {
    es: {
      boton: 'Conversaciones guardadas',
      titulo: 'Conversaciones',
      nueva: '＋ Nueva conversación',
      abrir: 'Abrir',
      borrar: 'Borrar esta conversación',
      vacio: 'Todavía no hay conversaciones guardadas. Se guardan solas al hablar con Javny.',
      nota: 'Se guardan en este dispositivo; con sesión iniciada, también en tu cuenta.',
      confirmaBorrar: '¿Borrar esta conversación guardada?',
      mensajes: function(n){ return n === 1 ? '1 mensaje' : n + ' mensajes'; },
      sinTitulo: 'Conversación'
    },
    ca: {
      boton: 'Converses desades',
      titulo: 'Converses',
      nueva: '＋ Conversa nova',
      abrir: 'Obre',
      borrar: 'Esborra aquesta conversa',
      vacio: 'Encara no hi ha converses desades. Es desen soles en parlar amb la Javny.',
      nota: 'Es desen en aquest dispositiu; amb la sessió iniciada, també al teu compte.',
      confirmaBorrar: 'Vols esborrar aquesta conversa desada?',
      mensajes: function(n){ return n === 1 ? '1 missatge' : n + ' missatges'; },
      sinTitulo: 'Conversa'
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
  function jget(k, d){ try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } }
  function jset(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  function lget(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }
  function lset(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function lrm(k){ try { localStorage.removeItem(k); } catch(e){} }

  /* ── Archivo ─────────────────────────────────────────────────────────────── */
  function lista(){ var a = jget(LISTK, []); return Array.isArray(a) ? a : []; }

  function tituloDe(mensajes){
    for(var i = 0; i < mensajes.length; i++){
      if(mensajes[i] && mensajes[i].role === 'user' && mensajes[i].content){
        var s = String(mensajes[i].content).replace(/\s+/g, ' ').trim();
        if(s) return s.length > 80 ? s.slice(0, 80) + '…' : s;
      }
    }
    return t('sinTitulo');
  }

  function archivar(mensajes){
    if(!Array.isArray(mensajes) || !mensajes.length) return;
    var id = lget(CURK);
    if(!id){ id = 'c' + Date.now() + Math.random().toString(36).slice(2, 7); lset(CURK, id); }
    var ahora = Date.now();
    var l = lista();
    var idx = -1;
    for(var i = 0; i < l.length; i++) if(l[i].id === id){ idx = i; break; }
    var entrada = idx >= 0 ? l[idx] : { id: id, creado: ahora };
    entrada.titulo = tituloDe(mensajes);
    entrada.actualizado = ahora;
    entrada.mensajes = mensajes;
    if(idx >= 0) l.splice(idx, 1);
    l.unshift(entrada);
    while(l.length > MAX_CONVOS) l.pop();
    // Si aun así no cabe, se sueltan las más antiguas: perder la conversación
    // de hace un mes es mejor que no poder guardar la de hoy.
    var json = JSON.stringify(l);
    while(l.length > 1 && json.length > MAX_BYTES){ l.pop(); json = JSON.stringify(l); }
    try { localStorage.setItem(LISTK, json); } catch(e){
      while(l.length > 1){ l.pop(); try { localStorage.setItem(LISTK, JSON.stringify(l)); break; } catch(e2){} }
    }
  }

  function borrar(id){
    var l = lista().filter(function(c){ return c.id !== id; });
    jset(LISTK, l);
    if(lget(CURK) === id) lrm(CURK);
  }

  /* ── Enganche al guardado del chat ───────────────────────────────────────
     Se encadena sobre localStorage.setItem (ya envuelto por EnferixCloud, que
     así sigue sincronizando). Cuando el chat escribe su hilo, se archiva con
     un pequeño retardo para no trabajar en medio del streaming. */
  var tmr = null;
  var previo = localStorage.setItem;
  localStorage.setItem = function(k, v){
    previo.call(localStorage, k, v);
    if(k !== CHATK) return;
    clearTimeout(tmr);
    tmr = setTimeout(function(){
      var arr = null;
      try { arr = JSON.parse(v); } catch(e){ return; }
      if(!Array.isArray(arr)) return;
      if(!arr.length){ lrm(CURK); return; } // conversación nueva: id nuevo al primer mensaje
      archivar(arr);
      if(modal && modal.classList.contains('on')) render();
    }, 400);
  };

  /* ── Interfaz ───────────────────────────────────────────────────────────── */
  var modal = null;

  function fecha(ms){
    var d = new Date(ms || Date.now());
    var dd = ('0' + d.getDate()).slice(-2), mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var hh = ('0' + d.getHours()).slice(-2), mi = ('0' + d.getMinutes()).slice(-2);
    return dd + '/' + mm + ' · ' + hh + ':' + mi;
  }

  function construirModal(){
    if(modal) return modal;
    modal = document.createElement('div');
    modal.className = 'p37-modal';
    modal.innerHTML =
      '<div class="p37-caja" role="dialog" aria-modal="true" aria-label="' + esc(t('titulo')) + '">'
      + '<div class="p37-cab"><h3>🗂 ' + esc(t('titulo')) + '</h3><button type="button" class="p37-x" data-p37="cerrar" aria-label="Cerrar">✕</button></div>'
      + '<button type="button" class="p37-nueva" data-p37="nueva">' + esc(t('nueva')) + '</button>'
      + '<div class="p37-lista" data-p37-lista></div>'
      + '<p class="p37-nota">' + esc(t('nota')) + '</p>'
      + '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){
      if(e.target === modal){ cerrar(); return; }
      var b = e.target.closest('[data-p37]');
      if(!b) return;
      var acc = b.getAttribute('data-p37');
      if(acc === 'cerrar'){ cerrar(); }
      else if(acc === 'nueva'){
        if(window.EnferixChat){ lrm(CURK); window.EnferixChat.cargar([]); }
        cerrar();
      }
      else if(acc === 'abrir'){
        var id = b.getAttribute('data-p37-id');
        var c = lista().filter(function(x){ return x.id === id; })[0];
        if(c && window.EnferixChat){ lset(CURK, c.id); window.EnferixChat.cargar(c.mensajes || []); }
        cerrar();
      }
      else if(acc === 'borrar'){
        var id2 = b.getAttribute('data-p37-id');
        if(confirm(t('confirmaBorrar'))){ borrar(id2); render(); }
      }
    });
    return modal;
  }

  function render(){
    var host = modal && modal.querySelector('[data-p37-lista]');
    if(!host) return;
    var l = lista();
    if(!l.length){ host.innerHTML = '<div class="p37-vacio">' + esc(t('vacio')) + '</div>'; return; }
    var actual = lget(CURK);
    host.innerHTML = l.map(function(c){
      var n = (c.mensajes || []).length;
      return '<div class="p37-item' + (c.id === actual ? ' p37-actual' : '') + '">'
        + '<button type="button" class="p37-abrir" data-p37="abrir" data-p37-id="' + esc(c.id) + '" title="' + esc(t('abrir')) + '">'
        + '<b>' + esc(c.titulo || t('sinTitulo')) + '</b>'
        + '<small>' + esc(fecha(c.actualizado)) + ' · ' + esc(t('mensajes')(n)) + '</small>'
        + '</button>'
        + '<button type="button" class="p37-del" data-p37="borrar" data-p37-id="' + esc(c.id) + '" title="' + esc(t('borrar')) + '" aria-label="' + esc(t('borrar')) + '">✕</button>'
        + '</div>';
    }).join('');
  }

  function abrir(){ construirModal(); render(); modal.classList.add('on'); }
  function cerrar(){ if(modal) modal.classList.remove('on'); }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal && modal.classList.contains('on')){ e.stopPropagation(); cerrar(); }
  }, true);

  /* Botón en la cabecera del chat, junto a ✚ (nueva conversación). */
  function boot(){
    var head = document.querySelector('#ccWrap .cc-head');
    var nuevo = document.getElementById('ccNew');
    if(!head || !nuevo || document.getElementById('p37Btn')){ return !!document.getElementById('p37Btn'); }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cc-hbtn';
    btn.id = 'p37Btn';
    btn.title = t('boton');
    btn.textContent = '🗂';
    btn.onclick = abrir;
    nuevo.insertAdjacentElement('afterend', btn);
    return true;
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600); setTimeout(boot, 2000);
})();
