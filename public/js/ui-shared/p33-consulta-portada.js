/* ═══════════════════════════════════════════════════════════════════════════
   P3.3 · Consulta de portada en streaming
   ---------------------------------------------------------------------------
   La caja de pregunta de la pantalla principal (#nxAsk) abría el chat del
   avatar, le escribía la pregunta y pulsaba enviar por el usuario: la portada
   se quedaba muda y la respuesta tardaba en aparecer al otro lado.

   Aquí la portada responde en su propio panel, en streaming, contra el mismo
   endpoint NDJSON que ya usa el chat (/api/javny/chat/stream). El chat del
   avatar de abajo a la derecha NO se toca: sigue funcionando igual, y desde el
   panel se puede saltar a él para continuar la conversación.

   Se engancha por captura en document (nunca modificando inline-script-17559),
   de modo que el envío de la portada no llega al handler que abre el chat.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var L = {
    es: {
      searching:  'Buscando en las fuentes…',
      writing:    'Redactando la respuesta…',
      done:       'Respuesta completa',
      refs:       'Referencias',
      refsTarde:  'Evidencia relacionada',
      refsNota:   'Llegó después de redactarse la respuesta, así que no respalda sus afirmaciones: es literatura sobre el tema.',
      openChat:   'Seguir en el chat de Javny',
      close:      'Cerrar',
      stop:       'Detener',
      retry:      'Reintentar',
      error:      'No he podido completar la consulta',
      noRefs:     'Esta respuesta no ha recuperado referencias externas.',
      sourcesFound: function(n){ return n === 1 ? '1 fuente recuperada' : n + ' fuentes recuperadas'; },
      aria:       'Respuesta de Javny a tu consulta'
    },
    ca: {
      searching:  'Cercant a les fonts…',
      writing:    'Redactant la resposta…',
      done:       'Resposta completa',
      refs:       'Referències',
      refsTarde:  'Evidència relacionada',
      refsNota:   'Va arribar després de redactar-se la resposta, així que no en fonamenta les afirmacions: és literatura sobre el tema.',
      openChat:   'Continuar al xat de Javny',
      close:      'Tancar',
      stop:       'Aturar',
      retry:      'Tornar-ho a provar',
      error:      'No he pogut completar la consulta',
      noRefs:     'Aquesta resposta no ha recuperat referències externes.',
      sourcesFound: function(n){ return n === 1 ? '1 font recuperada' : n + ' fonts recuperades'; },
      aria:       'Resposta de Javny a la teva consulta'
    }
  };

  function detectLang(){
    var l = '';
    try { l = document.documentElement.lang || ''; } catch(e){}
    if(!l){ try { l = localStorage.getItem('inurse_lang') || ''; } catch(e){} }
    if(!l){ try { l = navigator.language || ''; } catch(e){} }
    return /^ca/i.test(l) ? 'ca' : 'es';
  }
  function t(k){ var d = L[detectLang()] || L.es; return d[k] != null ? d[k] : L.es[k]; }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  /* Mismo criterio de backend que el chat (inline-script-4931.js): respeta el
     backend que el usuario haya configurado a mano y, si no hay ninguno ni
     clave propia de Gemini, usa el servidor de Enferix del mismo origen. */
  function backendUrl(){
    var saved = '';
    try { saved = (localStorage.getItem('inurse_v20_backend_url') || '').trim().replace(/\/$/,''); } catch(e){}
    if(saved) return saved;
    var key = '';
    try { key = localStorage.getItem('guiaHJ23_apikey') || ''; } catch(e){}
    if(!key && /^https?:$/.test(location.protocol)) return location.origin;
    return '';
  }

  /* ── Render del texto ──────────────────────────────────────────────────────
     Markdown mínimo, el mismo repertorio que ya usa el chat (negritas, títulos,
     listas y párrafos). Las citas [n] se convierten en anclas a la referencia
     correspondiente SOLO si esa referencia existe en la lista que ha devuelto
     el servidor: un número sin fuente detrás se deja como texto plano. */
  function renderMarkdown(text, refs){
    var h = esc(text);
    h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    h = h.replace(/(^|\n)#{1,4}\s*(.+)/g, '$1<h4 class="p33-h">$2</h4>');
    h = h.replace(/(^|\n)[-•*]\s+(.+)/g, '$1<li>$2</li>');
    h = h.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul class="p33-ul">$1</ul>');
    h = h.replace(/\[(\d+(?:\s*[,-]\s*\d+)*)\]/g, function(m, nums){
      var ok = String(nums).split(/[,-]/).some(function(n){
        return refs.some(function(r){ return r && Number(r.n) === Number(String(n).trim()); });
      });
      return ok ? '<a class="p33-cite" href="#p33ref-' + esc(String(nums).split(/[,-]/)[0].trim()) + '">[' + esc(nums) + ']</a>' : m;
    });
    return h.split(/\n{2,}/).map(function(p){
      p = p.trim();
      if(!p) return '';
      if(/^<(h4|ul)/.test(p)) return p;
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  // aTiempo === false significa que la evidencia llegó DESPUÉS de redactarse la
  // respuesta: entonces no puede presentarse como el respaldo de sus afirmaciones,
  // porque el modelo no la tenía delante al escribir.
  function renderRefs(refs, aTiempo){
    var list = (refs || []).filter(Boolean);
    if(!list.length) return '<div class="p33-refs-empty">' + esc(t('noRefs')) + '</div>';
    var tarde = aTiempo === false;
    return '<div class="p33-refs">'
      + '<h4 class="p33-refs-title">' + esc(tarde ? t('refsTarde') : t('refs')) + '</h4>'
      + (tarde ? '<p class="p33-refs-nota">' + esc(t('refsNota')) + '</p>' : '')
      + '<ol class="p33-refs-list">'
      + list.map(function(r){
          var meta = [r.journal || r.source || '', r.year || ''].filter(Boolean).join(' · ');
          var title = esc(r.title || '');
          var inner = r.url
            ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + title + '</a>'
            : title;
          return '<li id="p33ref-' + esc(r.n) + '" value="' + esc(r.n) + '">'
            + inner + (meta ? '<span class="p33-ref-meta">' + esc(meta) + '</span>' : '')
            + '</li>';
        }).join('')
      + '</ol></div>';
  }

  /* ── Panel ───────────────────────────────────────────────────────────────── */
  var current = null; // { abort, node }

  function panelHTML(question){
    return ''
      + '<div class="p33-head">'
      +   '<span class="p33-q">' + esc(question) + '</span>'
      +   '<button type="button" class="p33-x" data-p33="close" aria-label="' + esc(t('close')) + '">✕</button>'
      + '</div>'
      + '<div class="p33-phase" data-p33-phase role="status" aria-live="polite">'
      +   '<span class="p33-dots"><i></i><i></i><i></i></span>'
      +   '<span class="p33-phase-tx">' + esc(t('searching')) + '</span>'
      + '</div>'
      + '<div class="p33-body" data-p33-body></div>'
      + '<div class="p33-foot" data-p33-foot hidden>'
      +   '<button type="button" class="p33-btn" data-p33="chat">' + esc(t('openChat')) + '</button>'
      + '</div>';
  }

  function ensurePanel(question){
    var hero = document.querySelector('.nx-javny-hero');
    if(!hero) return null;
    var panel = hero.querySelector('.p33-panel');
    if(!panel){
      panel = document.createElement('section');
      panel.className = 'p33-panel';
      panel.setAttribute('aria-label', t('aria'));
      var ask = hero.querySelector('.nx-javny-ask');
      if(ask && ask.nextSibling) hero.insertBefore(panel, ask.nextSibling);
      else hero.appendChild(panel);
    }
    panel.innerHTML = panelHTML(question);
    panel.classList.remove('p33-error');
    return panel;
  }

  function setPhase(panel, label, state){
    var ph = panel.querySelector('[data-p33-phase]');
    if(!ph) return;
    var tx = ph.querySelector('.p33-phase-tx');
    if(tx) tx.textContent = label;
    ph.classList.toggle('p33-phase-done', state === 'done');
    ph.classList.toggle('p33-phase-error', state === 'error');
  }

  function closePanel(){
    if(current && current.abort){ try{ current.abort.abort(); }catch(e){} }
    current = null;
    var p = document.querySelector('.p33-panel');
    if(p && p.parentNode) p.parentNode.removeChild(p);
  }

  /* Salto al chat del avatar: se le entrega la pregunta tal cual, con el flujo
     de siempre (abrir, escribir, enviar). El chat no cambia en nada. */
  function handoffToChat(question){
    var fab = document.getElementById('ccFab');
    if(fab) fab.click();
    var tries = 0;
    (function fill(){
      var ta = document.getElementById('ccTa');
      if(!ta){ if(tries++ < 25) setTimeout(fill, 80); return; }
      ta.value = question;
      ta.dispatchEvent(new Event('input', { bubbles:true }));
      ta.focus();
      var send = document.getElementById('ccSend');
      if(send) setTimeout(function(){ send.click(); }, 60);
    })();
  }

  /* ── Contexto interno ──────────────────────────────────────────────────────
     La portada envía el MISMO contexto que el chat del avatar: las fichas
     validadas de Enferix y el vademécum (EnferixGuideRetrieve, la propia
     recuperación del chat), la biblioteca virtual, y los servicios sanitarios
     cercanos cuando la pregunta va de eso. Sin este bloque, el servidor
     redactaba solo con fuentes externas y las fichas validadas —la fuente
     prioritaria del sistema— no llegaban a intervenir. */
  var RE_CERCANOS = /hospital|urgencias?\s+(m[aá]s\s+)?cercan|\bdea\b|desfibrilador|d[oó]nde\s+puedo\s+ir|centro\s+sanitario\s+cercan/i;

  function conTope(promesa, ms){
    return Promise.race([
      promesa,
      new Promise(function(r){ setTimeout(function(){ r(''); }, ms); })
    ]).catch(function(){ return ''; });
  }

  function buildContext(question){
    var guides = '', library = '', evidenceQueries = [];
    try {
      if(typeof window.EnferixGuideRetrieve === 'function'){
        var gd = window.EnferixGuideRetrieve(question) || {};
        guides = gd.context || '';
        /* evidenceQuery editorial de las fichas recuperadas: con ellos el
           servidor pregunta a las fuentes externas en el inglés en que están
           indexadas, en vez de mandar la frase en castellano. */
        evidenceQueries = gd.evidenceQueries || [];
      }
    } catch(e){}
    try {
      if(typeof window.EnferixLibraryRetrieve === 'function'){
        library = window.EnferixLibraryRetrieve(question, 8) || '';
      }
    } catch(e){}

    // Los cercanos son la única pieza que va por red. Se acota a 2,5 s para no
    // retrasar el primer token: sin ella Javny ya sabe pedir que se active la
    // ubicación, que es mejor que dejar la pantalla esperando.
    var nearby = Promise.resolve('');
    if(RE_CERCANOS.test(question) && window.EnferixNearby && window.EnferixNearby.getContextText){
      try { nearby = conTope(Promise.resolve(window.EnferixNearby.getContextText()), 2500); } catch(e){}
    }
    return nearby.then(function(n){
      return { guides: guides, library: library, nearby: n || '', evidenceQueries: evidenceQueries };
    });
  }

  /* ── Consulta ────────────────────────────────────────────────────────────── */
  function ask(question){
    question = String(question || '').trim();
    if(question.length < 2) return;

    var backend = backendUrl();
    // Sin backend (app abierta desde file:// o con clave propia de Gemini) el
    // panel no puede hacer streaming por su cuenta: se cede al chat, que ya
    // sabe hablar directamente con Gemini desde el navegador.
    if(!backend){ handoffToChat(question); return; }

    var panel = ensurePanel(question);
    if(!panel){ handoffToChat(question); return; }

    if(current && current.abort){ try{ current.abort.abort(); }catch(e){} }
    var ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    current = { abort: ctrl, question: question };

    var body = panel.querySelector('[data-p33-body]');
    var foot = panel.querySelector('[data-p33-foot]');
    var refs = [];
    var answer = '';

    /* Marcas de tiempo de la consulta, en consola. Miden lo único que le importa
       a quien espera delante de la pantalla: cuánto tarda en aparecer la primera
       palabra (primer token) y cuánto en terminar. Los tres números salen del
       reloj del navegador, no de estimaciones. */
    var tEnvio = performance.now();
    var tPrimerToken = null;
    function marca(etiqueta, ms){
      console.log('[Javny · portada] ' + etiqueta + ': ' + Math.round(ms) + ' ms'
        + ' · ' + new Date().toISOString());
    }
    marca('envío de la pregunta', 0);

    var refsATiempo = true;
    /* En una urgencia en curso no se pinta bibliografía: quien está reanimando
       no va a leerla, y ocupa el sitio de la siguiente acción. El orquestador
       sigue recuperándola igual — esto es sólo lo que se muestra. */
    var emergencia = false;
    try { emergencia = !!(window.EnferixUrgencias && window.EnferixUrgencias.enCurso(question)); } catch(e){}
    function applySources(sources, aTiempo){
      var list = (sources && sources.references) || [];
      refs = list.slice();
      if(aTiempo !== undefined) refsATiempo = aTiempo !== false;
    }
    function paint(){
      body.innerHTML = renderMarkdown(answer, refs);
    }
    function finish(){
      marca('respuesta completa', performance.now() - tEnvio);
      paint();
      if(!emergencia) body.insertAdjacentHTML('beforeend', renderRefs(refs, refsATiempo));
      setPhase(panel, t('done'), 'done');
      if(foot) foot.hidden = false;
      current = null;
    }
    function fail(msg){
      setPhase(panel, t('error'), 'error');
      panel.classList.add('p33-error');
      body.innerHTML = '<p class="p33-err">' + esc(msg || '') + '</p>';
      if(foot) foot.hidden = false;
      current = null;
    }

    buildContext(question).then(function(contexto){
      marca('contexto interno listo', performance.now() - tEnvio);
      var payload = {
        question: question,
        context: { guides: contexto.guides, library: contexto.library, nearby: contexto.nearby },
        history: [],
        caseMemory: [],
        route: {},
        // La portada responde corto y citado; el desarrollo largo es del chat.
        conciso: true,
        // Términos editoriales de búsqueda de las fichas recuperadas, para que
        // la evidencia externa se busque en inglés (evidenceQuery, editorial).
        evidenceQueries: contexto.evidenceQueries || []
      };
      var opts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      };
      if(ctrl) opts.signal = ctrl.signal;

      return fetch(backend + '/api/javny/chat/stream', opts);
    }).then(function(res){
      if(!res.ok || !res.body){
        return res.json().catch(function(){ return {}; }).then(function(d){
          throw new Error(d.error || ('HTTP ' + res.status));
        });
      }
      var reader = res.body.getReader(), dec = new TextDecoder('utf-8'), buf = '', got = false;

      function processLine(line){
        line = line.trim(); if(!line) return;
        var evt; try { evt = JSON.parse(line); } catch(e){ return; }
        if(evt.type === 'phase'){
          setPhase(panel, evt.phase === 'writing' ? t('writing') : t('searching'));
        } else if(evt.type === 'sources'){
          applySources(evt.sources, evt.aTiempo);
          if(refs.length) setPhase(panel, t('writing') + ' · ' + t('sourcesFound')(refs.length));
          // Si llegan tarde (tras el texto), se repinta el bloque ya cerrado.
          if(got && refs.length && !emergencia){
            paint();
            body.insertAdjacentHTML('beforeend', renderRefs(refs, refsATiempo));
          }
        } else if(evt.type === 'delta'){
          // El servidor manda el fragmento nuevo; el texto se acumula aquí.
          var trozo = evt.chunk || '';
          if(tPrimerToken === null && trozo.trim()){
            tPrimerToken = performance.now();
            marca('primer token del streaming', tPrimerToken - tEnvio);
          }
          answer += trozo;
          paint();
        } else if(evt.type === 'done'){
          if(!refs.length) applySources(evt.sources, evt.aTiempo);
          answer = (evt.answer || answer || '').trim();
          got = true;
        } else if(evt.type === 'error'){
          var e = new Error(evt.error || 'Error del servidor');
          e.p33Server = true;
          throw e;
        }
      }
      function pump(){
        return reader.read().then(function(chunk){
          if(chunk.done){
            var rest = buf.trim(); if(rest) processLine(rest);
            if(!got || !answer) throw new Error('El servidor terminó la respuesta sin texto.');
            finish();
            return;
          }
          buf += dec.decode(chunk.value, { stream:true });
          var lines = buf.split('\n'); buf = lines.pop();
          for(var i = 0; i < lines.length; i++) processLine(lines[i]);
          return pump();
        });
      }
      return pump();
    }).catch(function(err){
      if(err && err.name === 'AbortError') return;
      fail((err && err.message) || String(err));
    });
  }

  /* ── Enganche a la caja de la portada ────────────────────────────────────── */
  function questionFromBox(){
    var box = document.getElementById('nxAsk');
    return box ? String(box.value || '').trim() : '';
  }
  function clearBox(){
    var box = document.getElementById('nxAsk');
    if(box){ box.value = ''; box.style.height = ''; }
  }

  // En captura sobre document: se ejecuta ANTES que los listeners que el inicio
  // (inline-script-17559.js) tiene puestos en la propia caja y en su botón, así
  // que la pregunta se queda aquí en vez de abrir el chat. No se modifica ni un
  // renglón de ese archivo.
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' || e.shiftKey) return;
    if(!e.target || e.target.id !== 'nxAsk') return;
    var q = questionFromBox(); if(!q) return;
    e.preventDefault(); e.stopPropagation();
    clearBox(); ask(q);
  }, true);

  document.addEventListener('click', function(e){
    var send = e.target.closest && e.target.closest('#nxAskSend');
    if(send){
      var q = questionFromBox(); if(!q) return;
      e.preventDefault(); e.stopPropagation();
      clearBox(); ask(q);
      return;
    }
    var act = e.target.closest && e.target.closest('[data-p33]');
    if(!act) return;
    var kind = act.getAttribute('data-p33');
    if(kind === 'close'){ closePanel(); }
    else if(kind === 'chat'){
      var panel = act.closest('.p33-panel');
      var qtx = panel ? (panel.querySelector('.p33-q') || {}).textContent || '' : '';
      closePanel();
      if(qtx) handoffToChat(qtx);
    }
  }, true);

  // Si el inicio se reconstruye (vuelta a portada, cambio de vista), el panel
  // pertenece a la pregunta anterior: se retira con ella para no dejar una
  // respuesta huérfana colgada de una portada nueva.
  var obs = new MutationObserver(function(){
    var panel = document.querySelector('.p33-panel');
    if(panel && !panel.closest('.nx-javny-hero')) closePanel();
  });
  if(document.body) obs.observe(document.body, { childList:true, subtree:true });

  window.EnferixConsultaPortada = { ask: ask, close: closePanel };
})();
