/* ═══════════════════════════════════════════════════════════════════════════
   P42 · Pantalla de emergencia (Javny Live)
   ---------------------------------------------------------------------------
   En una urgencia, quien mira el móvil de reojo necesita UNA cosa: la última
   indicación de Javny en letra gigante, y el 112 a un toque. Esta pantalla es
   un ESPEJO: observa la transcripción de Live (#v26Transcript) y replica en
   grande el último mensaje del modelo, también mientras va llegando. No envía
   nada, no llama a ningún modelo y no toca una sola línea de Live: se engancha
   por MutationObserver, como manda la convención del proyecto.

   - Botón 🔳 inyectado en la cabecera de Live (junto a minimizar).
   - Botón grande de LLAMAR AL 112 (tel:112): marcar siempre lo hace la
     persona, la app no llama sola jamás.
   - Wake Lock mientras está abierta, para que la pantalla no se apague.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var L = {
    es: {
      boton: 'Pantalla de emergencia: la última indicación en grande',
      esperando: 'Esperando la indicación de Javny…',
      llamar: '📞 LLAMAR AL 112',
      salir: '✕ Volver a Javny Live'
    },
    ca: {
      boton: 'Pantalla d’emergència: l’última indicació en gran',
      esperando: 'Esperant la indicació de la Javny…',
      llamar: '📞 TRUCA AL 112',
      salir: '✕ Torna a Javny Live'
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

  var pantalla = null, observador = null, wakeLock = null, activa = false;

  function ultimoMensajeModelo(){
    var tr = document.getElementById('v26Transcript');
    if(!tr) return '';
    var filas = tr.querySelectorAll('.v26-line.model .v26-bubble');
    if(!filas.length) return '';
    var ultima = filas[filas.length - 1].cloneNode(true);
    // la marca de "transcribiendo…" no es parte de la indicación
    ultima.querySelectorAll('small').forEach(function(s){ s.remove(); });
    return (ultima.textContent || '').trim();
  }

  function refrescar(){
    if(!activa || !pantalla) return;
    var texto = ultimoMensajeModelo();
    var host = pantalla.querySelector('[data-p42-texto]');
    if(!host) return;
    var nuevo = texto || t('esperando');
    if(host.textContent !== nuevo){
      host.textContent = nuevo;
      // letra más pequeña cuanto más largo, para que quepa sin scroll
      host.style.fontSize = nuevo.length > 220 ? '26px' : nuevo.length > 120 ? '34px' : '44px';
    }
  }

  function construir(){
    if(pantalla) return pantalla;
    pantalla = document.createElement('div');
    pantalla.className = 'p42-pantalla';
    pantalla.innerHTML =
      '<div class="p42-texto" data-p42-texto>' + esc(t('esperando')) + '</div>'
      + '<div class="p42-pie">'
      + '<a class="p42-112" href="tel:112">' + esc(t('llamar')) + '</a>'
      + '<button type="button" class="p42-salir" data-p42="salir">' + esc(t('salir')) + '</button>'
      + '</div>';
    document.body.appendChild(pantalla);
    pantalla.addEventListener('click', function(e){
      if(e.target.closest('[data-p42="salir"]')) ocultar();
    });
    return pantalla;
  }

  function mostrar(){
    construir();
    activa = true;
    pantalla.classList.add('on');
    refrescar();
    var tr = document.getElementById('v26Transcript');
    if(tr && !observador){
      observador = new MutationObserver(refrescar);
      observador.observe(tr, { childList: true, subtree: true, characterData: true });
    }
    try {
      if(navigator.wakeLock && navigator.wakeLock.request){
        navigator.wakeLock.request('screen').then(function(wl){ wakeLock = wl; }).catch(function(){});
      }
    } catch(e){}
  }
  function ocultar(){
    activa = false;
    if(pantalla) pantalla.classList.remove('on');
    if(observador){ observador.disconnect(); observador = null; }
    if(wakeLock){ try { wakeLock.release(); } catch(e){} wakeLock = null; }
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && activa){ e.stopPropagation(); ocultar(); }
  }, true);

  /* Botón en la cabecera de Live, junto a minimizar. Inyección por DOM: si la
     cabecera aún no existe, se reintenta; Live no se toca. */
  function boot(){
    if(document.getElementById('p42Btn')) return true;
    var minimizar = document.getElementById('v26LiveMinimize');
    if(!minimizar) return false;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'p42Btn';
    btn.className = 'p42-btn';
    btn.title = t('boton');
    btn.textContent = '🔳';
    btn.onclick = mostrar;
    minimizar.insertAdjacentElement('beforebegin', btn);
    return true;
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 800); setTimeout(boot, 2600);
  window.EnferixPantallaEmergencia = { mostrar: mostrar, ocultar: ocultar };
})();
