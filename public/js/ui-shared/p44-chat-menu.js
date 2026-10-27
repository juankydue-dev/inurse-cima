/* ═══════════════════════════════════════════════════════════════════════════
   P44 · «Chat de Javny» en el menú de inicio
   ---------------------------------------------------------------------------
   El chat de texto de Javny solo se abría desde el botón flotante 💬, que no
   es fácil de encontrar. Esta entrada lo pone donde se buscan las cosas: el
   desplegable de inicio (petición de Juanky). Se registra por el router de
   secciones, como cualquier otro componente, y para abrir usa EXACTAMENTE el
   mismo mecanismo que ya usa la app (inurse58-actions-js.js): mostrar #ccWrap
   y, si no existe, pulsar el fab 💬. Aquí no se duplica ni una línea del chat.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function detectLang(){
    var l = document.documentElement.lang || '';
    try { l = l || localStorage.getItem('inurse_lang') || ''; } catch(e){}
    l = l || (navigator.language || 'es');
    return /^ca/i.test(l) ? 'ca' : 'es';
  }
  function titulo(){ return detectLang() === 'ca' ? 'Xat de Javny' : 'Chat de Javny'; }

  function abrirChat(){
    var wrap = document.querySelector('#ccWrap');
    if(wrap){
      wrap.classList.remove('hide');
      wrap.style.display = 'flex';
      try { localStorage.setItem('cc_open', '1'); } catch(e){}
    } else {
      var fab = document.querySelector('#ccFab') || document.querySelector('#javnyFab');
      if(fab) fab.click();
    }
    // Dejar el cursor listo para escribir, que es a lo que se viene.
    setTimeout(function(){
      var input = document.querySelector('#ccTa') || document.querySelector('#qinput');
      if(input) try { input.focus(); } catch(e){}
    }, 350);
  }

  function boot(){
    if(!Array.isArray(window.INURSE_SECTIONS)) return false;
    if(!window.INURSE_SECTIONS.some(function(s){ return s.id === 'chat-javny'; })){
      window.INURSE_SECTIONS.push({
        id: 'chat-javny', t: titulo(), em: '💬',
        kw: 'chat javny asistente escribir texto conversacion preguntar ia hablar consulta'
      });
      var prev = window.EnferixOpenSection;
      window.EnferixOpenSection = function(id){
        if(id === 'chat-javny'){ abrirChat(); return; }
        if(typeof prev === 'function') return prev(id);
      };
    }
    return true;
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 700); setTimeout(boot, 2400);
  window.EnferixAbrirChat = abrirChat;
})();
