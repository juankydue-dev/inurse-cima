
/* Enferix · rediseño de inicio (Fase 1): estructura, tarjetas y enganches */
(function(){
  function clickId(id){ var el=document.getElementById(id); if(el){ el.click(); return true; } return false; }
  function openIC(tabId){
    clickId("icFab");
    if(tabId){ setTimeout(function(){ var t=document.querySelector('.icTab[data-id="'+tabId+'"]'); if(t) t.click(); }, 180); }
    return true;
  }
  function fire(k){
    switch(k){
      case "biblioteca": if(window.EnferixVirtualLibrary&&window.EnferixVirtualLibrary.open){ window.EnferixVirtualLibrary.open(); return; } clickId("v29MenuBtn"); return;
      case "guias":      clickId("v29MenuBtn"); return;
      case "evidencia":  location.href="evidencia.html"; return;
      case "literatura": location.href="literatura.html"; return;
      case "patologias": if(window.openPatoSistemas){ window.openPatoSistemas(); return; } if(window.Enferix21&&window.Enferix21.organize){ window.Enferix21.organize("pathology","all"); return; } { var pb=document.querySelector('[data-in192-organize="pathology"]'); if(pb){ pb.click(); return; } } clickId("v29MenuBtn"); return;
      case "farmaco":    if(window.EnferixCima&&window.EnferixCima.open){ window.EnferixCima.open(); return; } clickId("vadeBtn"); return;
      case "calc":       if(typeof window.openCalcs==='function'){ window.openCalcs('perf'); return; } openIC("calc"); return;
      case "escalas":    if(window.EnferixEscalas&&window.EnferixEscalas.open){ window.EnferixEscalas.open(); return; } clickId("escalasBtn"); return;
      case "rx":         clickId("rxFab") || (window.openRx&&window.openRx()); return;
      case "ecg":        clickId("ecgFab") || (window.openEcg&&window.openEcg()); return;
      case "procedimientos": if(typeof window.openProc==='function'){ window.openProc(); return; } openIC("procedures"); return;
      case "algoritmos": if(typeof window.openAlg==='function'){ window.openAlg(); return; } openIC("alg"); return;
      case "cercanos":   if(typeof window.openNearby==='function'){ window.openNearby(); return; } return;
      case "sos":        if(typeof window.openSos==='function'){ window.openSos(); return; } return;
      case "proyectos":  if(window.EnferixProjects&&window.EnferixProjects.open){ window.EnferixProjects.open(); return; } { var b=document.querySelector("#in63HomeWrap .in63-home-card"); if(b) b.click(); } return;
      case "fuentes":    if(typeof window.EnferixOpenOfficialRepo==='function'){ window.EnferixOpenOfficialRepo(''); return; } return;
      case "interacciones": if(window.EnferixInteracciones&&window.EnferixInteracciones.open){ window.EnferixInteracciones.open(); return; } return;
      case "perfusiones":if(typeof window.openCalcs==='function'){ window.openCalcs('perf'); return; } openIC("calc"); return;
      case "dosisped":   if(typeof window.openCalcs==='function'){ window.openCalcs('dosisPed'); return; } openIC("calc"); return;
      case "inicio":     window.scrollTo({top:0,behavior:"smooth"}); return;
      case "miturno":  if(window.EnferixTurno&&window.EnferixTurno.open){ window.EnferixTurno.open(); return; } return;
      case "ajustes":  openAjustes(); return;
    }
  }
  /* Menú desplegable del botón Inicio con todos los apartados */
  function buildHomeMenu(){
    var secs=window.INURSE_SECTIONS||[];
    var items=secs.map(function(s){ return '<button class="nx-hmenu-item" data-hmenu="'+s.id+'"><span class="ic">'+(s.em||'🔷')+'</span>'+esc(s.t)+'</button>'; }).join('');
    return '<div class="nx-hmenu" id="nxHomeMenu">'+items+'</div>';
  }
  function closeHomeMenu(){ var m=document.getElementById('nxHomeMenu'); if(m&&m.parentNode) m.parentNode.removeChild(m); }
  function toggleHomeMenu(btn){
    if(document.getElementById('nxHomeMenu')){ closeHomeMenu(); return; }
    var top=btn.closest('.nx-top')||document.querySelector('.nx-top'); if(!top) return;
    top.insertAdjacentHTML('beforeend', buildHomeMenu());
    var menu=document.getElementById('nxHomeMenu');
    if(menu){ menu.style.left=btn.offsetLeft+'px'; menu.style.top=(btn.offsetTop+btn.offsetHeight+8)+'px'; }
  }
  /* Exponer el lanzador de secciones y el registro para el buscador global y la voz */
  window.EnferixOpenSection=fire;
  window.INURSE_SECTIONS=[
    {id:'biblioteca',   t:'Biblioteca virtual',    em:'📚', kw:'biblioteca virtual libros manuales recursos referencia documentacion'},
    {id:'guias',        t:'Guías clínicas',        em:'📋', kw:'guias clinicas protocolos menu especialidad'},
    {id:'evidencia',    t:'Evidencia',             em:'🔬', kw:'evidencia literatura pubmed pmc preprints estudios papers investigacion articulos ciencia'},
    {id:'patologias',   t:'Patologías',            em:'🫁', kw:'patologias enfermedades sistemas alertas tratamiento clinica'},
    {id:'farmaco',      t:'Farmacología',          em:'💊', kw:'farmacologia farmacos vademecum medicamentos cima posologia dosis interacciones pharmacology'},
    {id:'calc',         t:'Calculadoras y cálculos',em:'🧮', kw:'calculadoras calculos perfusiones dosis formulas goteo'},
    {id:'escalas',      t:'Escalas clínicas',      em:'📐', kw:'escalas indices puntuaciones scores valoracion rcri sofa apache glasgow braden norton barthel morse rass wells cha2ds2 vasc has bled heart meld ciwa mme anestesiologia cardiologia intensiva farmacia'},
    {id:'rx',           t:'Rayos X y POCUS',       em:'🩻', kw:'rayos x radiografia imagen pocus ecografia radiologia'},
    {id:'ecg',          t:'Electro / ECG',         em:'📈', kw:'electro ecg electrocardiograma ritmo arritmia electros'},
    {id:'procedimientos',t:'Procedimientos',       em:'📝', kw:'procedimientos tecnicas enfermeria paso a paso material checklist'},
    {id:'algoritmos',   t:'Algoritmos',            em:'🔀', kw:'algoritmos protocolos criticos actuacion pauta emergencia'},
    {id:'cercanos',     t:'Servicios cercanos',    em:'📍', kw:'hospital cercano dea desfibrilador urgencias mas cercano donde puedo ir ubicacion mapa geolocalizacion'},
    {id:'proyectos',    t:'Proyectos con Javny',   em:'👥', kw:'proyectos documentos protocolos tfm tfg trabajo javny'}
  ];
  var SPECS = [
    {key:'cardio',    em:'❤️', t:'Cardiología',      sc:'#F43F5E'},
    {key:'intensiva', em:'🏥', t:'UCI',               sc:'#6366F1'},
    {key:'urgencias', em:'🚑', t:'Urgencias',         sc:'#FB923C'},
    {key:'neuro',     em:'🧠', t:'Neurología',        sc:'#A855F7'},
    {key:'trauma',    em:'🦴', t:'Trauma',            sc:'#DC2626'},
    {key:'otras',     em:'🩺', t:'Otras',             sc:'#0EA5E9'}
  ];
  var NAV = [
    {k:"inicio",   ic:"🏠", t:"Inicio"},
    {k:"miturno",  ic:"🌙", t:"Mi turno"},
    {k:"calc",     ic:"🧮", t:"Cálculo"},
    {k:"escalas",  ic:"📐", t:"Escalas"},
    {k:"ecg",      ic:"📈", t:"Electros"},
    {k:"rx",       ic:"🩻", t:"Rayos X"},
    {k:"fuentes",  ic:"🏛️", t:"Fuentes"},
    {k:"ajustes",  ic:"⚙️", t:"Ajustes"}
  ];
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  /* Resumen del turno en el inicio: si hay un turno en marcha, es
     probablemente lo más relevante que puede haber en esta pantalla. */
  function turnoSection(){
    var meta=null;
    try{ meta=JSON.parse(localStorage.getItem("inurse_turno_meta_v1")||"null"); }catch(e){}

    /* Antes esta tarjeta solo salía si Mi turno se había usado en ESE
       dispositivo, porque el turno vive en localStorage y no se comparte entre
       el ordenador y la tablet. En la práctica eso confunde: la app parece
       distinta en cada aparato. Ahora sale siempre, invitando a empezar. */
    if(!meta || !meta.startedAt){
      return '<section class="nx-turno">'
        + '<button type="button" class="nx-turno-card" data-fire="miturno">'
        +   '<div class="nx-turno-head">'
        +     '<span class="nx-turno-ico">'+turnoIcon()+'</span>'
        +     '<span class="nx-turno-copy"><b>Mi turno</b>'
        +       '<small>Sin turno iniciado en este dispositivo</small></span>'
        +   '</div>'
        +   '<div class="nx-turno-datos">Notas, pacientes, recordatorios y relevo. Ábrelo para empezar.</div>'
        + '</button></section>';
    }

    function leer(k,def){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?def:v; }catch(e){ return def; } }
    var rooms=leer("inurse_turno_rooms_v1",[]) || [];
    var rem=leer("inurse_turno_rem_v1",[]) || [];
    var check=leer("inurse_turno_checklist_v1",null);

    var horas=Number(meta.hours)||8;
    var transcurrido=Date.now()-Number(meta.startedAt);
    var restante=Math.max(0, horas*3600000 - transcurrido);
    var h=Math.floor(restante/3600000), m=Math.floor((restante%3600000)/60000);
    var quedan = restante>0 ? (h+"h "+String(m).padStart(2,"0")+"min") : "turno cumplido";
    var avance = Math.max(0, Math.min(100, Math.round(transcurrido/(horas*3600000)*100)));

    var pendientes=rem.filter(function(r){ return r && !r.done; }).length;
    var tareas=[];
    if(check){ tareas=(check.start||[]).concat(check.end||[]); }
    var sinHacer=tareas.filter(function(t){ return t && !t.done; }).length;

    var datos=[];
    if(rooms.length) datos.push(rooms.length+(rooms.length===1?" paciente":" pacientes"));
    if(pendientes)   datos.push(pendientes+(pendientes===1?" recordatorio":" recordatorios"));
    if(sinHacer)     datos.push(sinHacer+" de checklist");

    return '<section class="nx-turno">'
      + '<button type="button" class="nx-turno-card" data-fire="miturno">'
      +   '<div class="nx-turno-head">'
      +     '<span class="nx-turno-ico">'+turnoIcon()+'</span>'
      +     '<span class="nx-turno-copy"><b>Mi turno</b>'
      +       '<small>'+esc(quedan)+(restante>0?' restantes':'')+'</small></span>'
      +     '<span class="nx-turno-pct">'+avance+'%</span>'
      +   '</div>'
      +   '<div class="nx-turno-barra"><i style="width:'+avance+'%"></i></div>'
      +   '<div class="nx-turno-datos">'+(datos.length?esc(datos.join(' · ')):'Sin pendientes anotados')+'</div>'
      + '</button></section>';
  }
  function turnoIcon(){
    return '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">'
      + '<circle cx="16" cy="17" r="11" fill="none" stroke="currentColor" stroke-width="2.2"/>'
      + '<path d="M16 11v6.4l4.2 2.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
      + '<path d="M11 3.6 6.4 6.9M21 3.6l4.6 3.3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
      + '</svg>';
  }
  function recentSection(){
    var arr=[]; try{ arr=JSON.parse(localStorage.getItem("inurse_recent_v5")||"[]"); }catch(e){}
    if(!arr || !arr.length) return "";
    return '<section class="nx-recent">'
      + '<h3>Última consulta</h3>'
      + '<div class="nx-recent-list">'
      +   arr.slice(0,4).map(function(x){
            var lab = x.type==="drug" ? "Fármaco" : x.type==="scale" ? "Escala" : "Protocolo";
            return '<button type="button" class="nx-recent-item" data-q="'+esc(x.title)+'" data-item="'+esc(JSON.stringify(x))+'">'
              + '<span class="em">'+(x.em||'📄')+'</span>'
              + '<span class="tx"><b>'+esc(x.title)+'</b><small>'+lab+'</small></span>'
              + '</button>';
          }).join('')
      + '</div></section>';
  }
  function recentHTML(){
    var arr=[]; try{ arr=JSON.parse(localStorage.getItem("inurse_recent_v5")||"[]"); }catch(e){}
    arr=(arr||[]).slice(0,5);
    if(!arr.length) return '<div class="nx-empty">El historial se generará al abrir protocolos, fármacos o escalas.</div>';
    return arr.map(function(x){ var lab=x.type==="drug"?"Fármaco":x.type==="scale"?"Escala":"Protocolo"; return '<div class="nx-recent-item" data-q="'+esc(x.title)+'"><span>'+esc(x.title)+'</span><span class="t">'+lab+'</span></div>'; }).join("");
  }
  function javnyAvatar(){
    /* usa el avatar de Javny que ya existe en la app (variables CSS) */
    return '<span class="av" style="background-image:var(--javny-real-avatar,var(--javny-avatar-url));background-size:cover;background-position:center;background-repeat:no-repeat"></span>';
  }
  function specPanel(){
    var saved = '';
    try{ saved = localStorage.getItem('inurse_myspec_v1') || ''; }catch(e){}
    var btns = SPECS.map(function(s){
      return '<button class="nx-spec-btn'+(saved===s.key?' on':'')+'" data-spec="'+s.key+'" style="--sc:'+s.sc+'"><span class="sem">'+s.em+'</span>'+esc(s.t)+'</button>';
    }).join('');
    var specName = saved ? (SPECS.find(function(s){return s.key===saved;})||{}).t || '' : '';
    return '<div class="nx-spec-label"><h3>Mi especialidad</h3>'
      +'<span class="nx-spec-active'+(saved?' show':'') +'" id="nxSpecActive">'+(specName?specName:'')+'</span>'
      +'<button class="nx-spec-all" id="nxSpecAll" title="Todos los protocolos" style="font-size:11px;color:#7f93bd;background:none;border:none;cursor:pointer;padding:3px 6px">✕ Todos</button>'
      +'</div>'
      +'<div class="nx-spec-grid" id="nxSpecGrid">'+btns+'</div>';
  }
  function template(){
    return ''
      + '<div class="nx-wrap">'
      +   '<div class="nx-top">'
      +     '<div class="nx-brand"><img class="nx-logo" src="/icon-512-v2.png" alt=""><h1>Enferix</h1></div>'
      +     '<nav class="nx-nav">'+NAV.map(function(n,i){return '<button data-fire="'+n.k+'"'+(i===0?' class="on"':'')+'><span class="ic">'+n.ic+'</span>'+n.t+'</button>';}).join("")+'</nav>'
      +   '</div>'
      +   '<div class="nx-hero">'
      +     '<div class="nx-javny-hero">'
      +       '<div class="nx-hero-brand">'
      +         '<img class="nx-hero-mark" src="/icon-512-v2.png" alt="">'
      +         '<span class="nx-hero-word">ENFERIX</span>'
      +       '</div>'
      +       '<p class="nx-hero-tag">Asistente clínico</p>'
      +       '<div class="nx-javny-ask">'
      +         '<textarea id="nxAsk" rows="1" placeholder="Escribe tu pregunta…" autocomplete="off"></textarea>'
      +         '<button class="qmic nx-ask-mic" id="nxAskMic" title="Dictar la pregunta">🎙️</button>'
      +         '<button class="nx-ask-send" id="nxAskSend" title="Enviar a Javny" aria-label="Enviar a Javny">➤</button>'
      +       '</div>'
      +       '<p class="nx-hero-fuentes">Responde apoyándose en el vademécum CIMA-AEMPS, las guías clínicas y la biblioteca de la app.</p>'
      +     '</div>'
      +   '</div>'
      +   pharmaCard()
      +   turnoSection()
      +   recentSection()
      + '</div>'
      + '<div class="in60-shell" style="display:none"></div>';
  }
  /* Bloque de Farmacología: buscador de medicamentos arriba (texto o voz) y,
     debajo, los tres apartados del área como iconos. */
  function pharmaCard(){
    var tiles=[
      {k:"farmaco",     cls:"vade",  t:"Vademécum",    d:"Fichas técnicas"},
      {k:"interacciones",cls:"inter", t:"Interacciones",d:"Comprobador"},
      {k:"perfusiones", cls:"perf",  t:"Perfusiones",  d:"Y diluciones"}
    ];
    return '<section class="nx-pharma">'
      +  '<div class="nx-pharma-head">'
      +    '<span class="nx-pharma-ico">'+pharmaIcon()+'</span>'
      +    '<span class="nx-pharma-copy"><b>Farmacología</b><small>Busca en la base oficial CIMA-AEMPS</small></span>'
      +  '</div>'
      +  '<div class="nx-pharma-search">'
      +    '<span class="nx-pharma-search-ic">🔎</span>'
      +    '<input id="nxPharmaQ" type="search" autocomplete="off" placeholder="Medicamento…">'
      +    '<button id="nxPharmaMic" class="nx-pharma-mic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button>'
      +    '<button id="nxPharmaGo" class="nx-pharma-go" title="Buscar en CIMA-AEMPS">Buscar</button>'
      +  '</div>'
      +  '<div class="nx-pharma-quick">'
      +    '<button type="button" data-fire="perfusiones">💉 Dosis y perfusión</button>'
      +    '<button type="button" data-fire="interacciones">⚠️ Interacciones</button>'
      +  '</div>'
      + '</section>';
  }
  function pharmaIcon(){
    return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
      + '<defs><linearGradient id="nxPharmaGrad" x1="0" y1="0" x2="1" y2="1">'
      +   '<stop stop-color="#F472B6"/><stop offset=".5" stop-color="#A855F7"/><stop offset="1" stop-color="#6366F1"/>'
      + '</linearGradient></defs>'
      + '<g transform="rotate(-45 24 24)">'
      +   '<rect x="9" y="16" width="30" height="16" rx="8" fill="url(#nxPharmaGrad)"/>'
      +   '<path d="M24 16h7a8 8 0 0 1 0 16h-7z" fill="#fff" opacity=".3"/>'
      +   '<rect x="9" y="16" width="30" height="16" rx="8" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>'
      +   '<path d="M24 16v16" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>'
      + '</g>'
      + '</svg>';
  }
  /* Lleva la pregunta escrita en el hero al chat de Javny: lo abre, rellena su
     campo y lo envía, para que escribir arriba no obligue a repetir la pregunta. */
  function askJavny(text){
    text=String(text||"").trim(); if(!text) return;
    try{ if(typeof window.openJavnyWithContext==='function'){ window.openJavnyWithContext(text); return; } }catch(e){}
    clickId("ccFab");
    var tries=0;
    (function fill(){
      var ta=document.getElementById("ccTa");
      if(!ta){ if(tries++<25) setTimeout(fill,80); return; }
      ta.value=text; ta.dispatchEvent(new Event("input",{bubbles:true})); ta.focus();
      var send=document.getElementById("ccSend");
      if(send) setTimeout(function(){ send.click(); },60);
    })();
  }
  function forwardSearch(q){
    var nxInp=document.getElementById("nxSearch");
    if(nxInp){ nxInp.value=q; nxInp.focus(); }
    if(typeof window.showGlobalResults==='function'){ window.showGlobalResults(q); return; }
    var real=document.getElementById("search");
    if(real){ real.value=q; real.dispatchEvent(new Event("input",{bubbles:true})); }
  }
  function goToSpec(spec){
    window.__INURSE_HOME = false;
    try{ query=''; activeCat='spec:'+spec; }catch(e){}
    var si=document.getElementById("search"); if(si) si.value='';
    var cb=document.getElementById("clearBtn"); if(cb) cb.style.display="none";
    var h=document.getElementById("in50Home"); if(h) h.style.display="none";
    if(typeof render==='function') render();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function wire(home){
    home.addEventListener("click",function(e){
      // Ítem del menú de Inicio → abre esa sección
      var hm=e.target.closest("[data-hmenu]"); if(hm){ var hid=hm.dataset.hmenu; closeHomeMenu(); if(window.EnferixOpenSection) window.EnferixOpenSection(hid); return; }
      var f=e.target.closest("[data-fire]"); if(f){
        // El botón "Inicio" despliega el menú de apartados en lugar de solo hacer scroll
        if(f.dataset.fire==='inicio'){ toggleHomeMenu(f); return; }
        closeHomeMenu();
        fire(f.dataset.fire);
        if(f.parentElement&&f.parentElement.classList.contains("nx-nav")){ home.querySelectorAll(".nx-nav button").forEach(function(b){b.classList.toggle("on",b===f);}); }
        return; }
      // Click fuera del menú lo cierra
      if(!e.target.closest("#nxHomeMenu")) closeHomeMenu();
      var v=e.target.closest("[data-javny]"); if(v){ clickId("ccFab"); return; }
      var r=e.target.closest(".nx-recent-item"); if(r){
        // Abre el elemento directamente; si no se puede, cae a buscarlo.
        var raw=r.getAttribute("data-item");
        if(raw && typeof window.EnferixOpenResult==='function'){
          try{ window.EnferixOpenResult(JSON.parse(raw)); return; }catch(err){}
        }
        forwardSearch(r.getAttribute("data-q")); return; }
      var sb=e.target.closest(".nx-spec-btn"); if(sb){
        var spec=sb.dataset.spec;
        home.querySelectorAll(".nx-spec-btn").forEach(function(b){ b.classList.toggle("on", b===sb); });
        var specInfo=SPECS.find(function(s){return s.key===spec;});
        var a=home.querySelector("#nxSpecActive");
        if(a){ a.textContent=specInfo?specInfo.t:''; a.classList.toggle("show", !!specInfo); }
        try{ localStorage.setItem("inurse_myspec_v1", spec); }catch(ex){}
        goToSpec(spec);
        return;
      }
      var sa=e.target.closest("#nxSpecAll"); if(sa){
        home.querySelectorAll(".nx-spec-btn").forEach(function(b){ b.classList.remove("on"); });
        var a2=home.querySelector("#nxSpecActive"); if(a2){ a2.textContent=''; a2.classList.remove("show"); }
        try{ localStorage.removeItem("inurse_myspec_v1"); }catch(ex){}
        window.__INURSE_HOME = false;
        try{ query=''; activeCat='all'; }catch(e){}
        var si2=document.getElementById("search"); if(si2) si2.value='';
        var cb2=document.getElementById("clearBtn"); if(cb2) cb2.style.display="none";
        var h2=document.getElementById("in50Home"); if(h2) h2.style.display="none";
        if(typeof render==='function') render();
        window.scrollTo({top:0, behavior:'smooth'});
        return;
      }
    });
    var ask=home.querySelector("#nxAsk");
    if(ask){
      var sendAsk=function(){
        var t=ask.value.trim(); if(!t) return;
        askJavny(t); ask.value=""; ask.style.height="";
      };
      // Enter envía; Mayús+Enter deja escribir varias líneas.
      ask.addEventListener("keydown",function(e){
        if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendAsk(); }
      });
      // El campo crece con la pregunta en vez de recortarla.
      ask.addEventListener("input",function(){
        ask.style.height="auto";
        ask.style.height=Math.min(ask.scrollHeight,132)+"px";
      });
      var sendBtn=home.querySelector("#nxAskSend");
      if(sendBtn) sendBtn.addEventListener("click",sendAsk);

    }
    wirePharmaSearch(home);
  }
  /* Buscador de medicamentos de la tarjeta de Farmacología: manda la consulta
     al Vademécum CIMA, por texto o dictada. */
  function wirePharmaSearch(home){
    var q=home.querySelector("#nxPharmaQ"); if(!q) return;
    function go(){
      var t=(q.value||"").trim(); if(t.length<2) return;
      if(window.EnferixCima&&window.EnferixCima.search){ window.EnferixCima.search(t,'name'); return; }
      fire("farmaco");
    }
    q.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); go(); } });
    var goBtn=home.querySelector("#nxPharmaGo");
    if(goBtn) goBtn.addEventListener("click",go);
    var mic=home.querySelector("#nxPharmaMic");
    if(mic) mic.addEventListener("click",function(e){
      e.preventDefault();
      var V=window.EnferixVoiceManager;
      if(!V||!V.start){ q.focus(); return; }
      // Al cerrar el dictado se lanza la búsqueda sin tocar nada más.
      V.start(mic,function(t){ q.value=t; },function(t){ q.value=t; go(); });
    });
  }
  function build(){
    var home=document.getElementById("in50Home"); if(!home) return false;
    if(home.dataset.nx==="1" && home.querySelector(".nx-wrap")) return true;
    home.dataset.nx="1"; home.dataset.cleanV1="1";
    home.innerHTML=template();
    wire(home);
    return true;
  }
  function tick(n){ build(); if(n>0) setTimeout(function(){ tick(n-1); }, 400); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ tick(14); });
  else tick(14);
  var obs=new MutationObserver(function(){ var h=document.getElementById("in50Home"); if(h && !(h.dataset.nx==="1" && h.querySelector(".nx-wrap"))) build(); });
  if(document.body) obs.observe(document.body,{childList:true,subtree:true});

  /* ═══════════ AJUSTES ═══════════ */
  function openAjustes(){
    var old=document.getElementById('nxAjustesOverlay');
    if(old) old.remove();

    var saved={}; try{ saved=JSON.parse(localStorage.getItem('inurse_profile_v1')||'{}'); }catch(e){}
    var javnySaved={}; try{ javnySaved=JSON.parse(localStorage.getItem('inurse_vivi_config_v1')||'{}'); }catch(e){}
    var curTheme=localStorage.getItem('guiaHJ23_theme')||'dark';

    var themeLabels={'light':'☀️ Modo claro','dark':'🌙 Modo oscuro','night':'🌚 Turno noche'};
    var themeNext={'light':'dark','dark':'night','night':'light'};

    var P=window.EnferixPrefs||{};
    var ESCALAS=[{v:1,t:'Normal'},{v:1.15,t:'Grande'},{v:1.3,t:'Mayor'},{v:1.5,t:'Máximo'}];
    var IDIOMAS=P.IDIOMAS||[{id:'es-ES',label:'Español (España)'}];
    var COMANDOS=['buscar sepsis','abre el vademécum','abre las calculadoras',
      'abre la biblioteca','patologías','algoritmos','lee la pantalla',
      'para de leer','modo claro','inicio','ayuda'];
    var curScale=P.textScale?P.textScale():1;
    var curLang=P.lang?P.lang():'es-ES';
    var curRate=P.rate&&P.rate()?P.rate():1.05;
    var curAutoVoice=P.autoVoice?P.autoVoice():false;
    var curSpec=''; try{ curSpec=localStorage.getItem('inurse_myspec_v1')||''; }catch(e){}
    var curSpecEmoji=(SPECS.find(function(s){return s.key===curSpec;})||{em:'🩺'}).em;

    // Los mismos modelos que la app ya usa como cadena de reserva.
    var MODELOS=[
      {id:'gemini-3.5-flash',           t:'Equilibrado (por defecto)'},
      {id:'gemini-3.1-flash-lite',      t:'Más ligero y rápido'},
      {id:'gemini-3.1-pro-preview',     t:'Más capaz, más lento'}
    ];
    var curModel='gemini-3.5-flash';
    try{ curModel=localStorage.getItem('inurse_gemini_model_v1')||curModel; }catch(e){}
    var curDatos=(window.EnferixData&&window.EnferixData.resumen)?window.EnferixData.resumen():{claves:0,kb:0,tieneClaveApi:false};

    var ov=document.createElement('div'); ov.id='nxAjustesOverlay'; ov.className='nx-aj-overlay';
    ov.innerHTML=''
      +'<div class="nx-aj-panel" role="dialog" aria-modal="true" aria-label="Ajustes">'
      +'<div class="nx-aj-header"><h2>Ajustes</h2><button class="nx-aj-close" id="nxAjClose" aria-label="Cerrar ajustes">✕</button></div>'
      +'<div class="nx-aj-body">'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">👤</span>Mi perfil</div>'
      +'<div class="nx-aj-card nx-aj-profile">'
      +'<div class="nx-aj-avatar-wrap"><div class="nx-aj-avatar" id="nxProfileAvatar">'+(saved.photo?'<img src="'+esc(saved.photo)+'" alt="Foto">':'<span class="nx-aj-avatar-placeholder">👤</span>')+'</div><button type="button" class="nx-aj-avatar-edit" id="nxPhotoBtn">📷 Cambiar foto</button><input type="file" id="nxPhotoInput" accept="image/*" style="display:none"></div>'
      +'<div class="nx-aj-profile-fields">'
      +'<div class="nx-aj-field"><label for="nxProfileName">Nombre</label><input type="text" id="nxProfileName" value="'+esc(saved.name||'')+'" placeholder="Tu nombre"></div>'
      +'<div class="nx-aj-field"><label for="nxProfileSurname">Apellidos</label><input type="text" id="nxProfileSurname" value="'+esc(saved.surname||'')+'" placeholder="Tus apellidos"></div>'
      +'<div class="nx-aj-field"><label for="nxProfileEmail">Email</label><input type="email" id="nxProfileEmail" value="'+esc(saved.email||'')+'" placeholder="tu@email.com"></div>'
      +'<div class="nx-aj-field"><label for="nxProfileHospital">Hospital / Centro</label><input type="text" id="nxProfileHospital" value="'+esc(saved.hospital||'')+'" placeholder="Hospital..."></div>'
      +'<div class="nx-aj-field"><label for="nxProfileSpec">Especialidad</label><input type="text" id="nxProfileSpec" value="'+esc(saved.spec||'')+'" placeholder="UCI, Urgencias, Pediatría..."></div>'
      +'</div>'
      +'<button class="nx-aj-btn" id="nxProfileSave">Guardar perfil</button>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">☁️</span>Cuenta y sincronización</div>'
      +'<div class="nx-aj-card" id="nxAccountBox"><div class="nx-aj-row"><span>Comprobando sesión…</span></div></div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">🌗</span>Apariencia</div>'
      +'<div class="nx-aj-card">'
      +'<div class="nx-aj-row"><span id="nxThemeLabel">'+(themeLabels[curTheme]||themeLabels.dark)+'</span><button class="nx-aj-theme-btn" id="nxThemeCycle">Cambiar</button></div>'
      +'<div class="nx-aj-field" style="margin-top:14px"><label>Tamaño del texto</label>'
      +'<div class="nx-aj-scale" id="nxTextScale">'
      +  ESCALAS.map(function(s){
           return '<button type="button" data-scale="'+s.v+'"'+(curScale===s.v?' class="on"':'')+'>'
             +'<span class="sz">Aa</span><span class="lb">'+esc(s.t)+'</span></button>';
         }).join('')
      +'</div></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">'+curSpecEmoji+'</span>Mi especialidad</div>'
      +'<div class="nx-aj-card">'
      +'<p style="font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin:0 0 10px">Al elegirla, las calculadoras y escalas de tu área se colocan las primeras y quedan resaltadas.</p>'
      +'<div class="nx-aj-field"><label for="nxAjSpec">Especialidad</label><select id="nxAjSpec">'
      +'<option value="">Sin especialidad</option>'
      + SPECS.map(function(s){ return '<option value="'+s.key+'"'+(curSpec===s.key?' selected':'')+'>'+s.em+' '+esc(s.t)+'</option>'; }).join('')
      +'</select></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">🔊</span>Voz y lectura</div>'
      +'<div class="nx-aj-card">'
      +'<div class="nx-aj-row"><span>Que Javny lea sus respuestas en voz alta</span>'
      +'<button class="nx-aj-theme-btn" id="nxAutoVoice">'+(curAutoVoice?'🔊 Activada':'🔇 Desactivada')+'</button></div>'
      +'<div class="nx-aj-field" style="margin-top:14px"><label for="nxVoiceLang">Idioma y acento</label>'
      +'<select id="nxVoiceLang">'
      + IDIOMAS.map(function(l){ return '<option value="'+l.id+'"'+(curLang===l.id?' selected':'')+'>'+esc(l.label)+'</option>'; }).join('')
      +'</select></div>'
      +'<div class="nx-aj-field"><label for="nxVoicePick">Voz</label><select id="nxVoicePick"><option value="">Automática</option></select></div>'
      +'<div class="nx-aj-field"><label for="nxVoiceRate">Velocidad</label>'
      +'<div class="nx-aj-range"><input type="range" id="nxVoiceRate" min="0.6" max="1.6" step="0.05" value="'+curRate+'"><output id="nxVoiceRateOut">'+curRate+'×</output></div></div>'
      +'<button class="nx-aj-btn" id="nxVoiceTest">▶︎ Probar la voz</button>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">🎙️</span>Control por voz</div>'
      +'<div class="nx-aj-card">'
      +'<p style="font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin:0 0 10px">Puedes manejar la app hablando: abrir secciones, buscar, leer la pantalla o pedir ayuda. Usa el idioma que hayas elegido arriba.</p>'
      +'<div class="nx-aj-cmds">'
      + COMANDOS.map(function(c){ return '<span class="nx-aj-cmd">«'+esc(c)+'»</span>'; }).join('')
      +'</div>'
      +'<div class="nx-aj-row" style="margin-top:12px"><span>Manos libres: di «oye Javny»</span><button class="nx-aj-theme-btn" id="nxOpenDictado">🎙️ Abrir dictado</button></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">🆘</span>Emergencia</div>'
      +'<div class="nx-aj-card">'
      +'<p style="font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin:0 0 10px">Llama al 112, muestra tu ficha médica al personal que te atienda o avisa a tus contactos de emergencia con tu ubicación y el hospital más cercano.</p>'
      +'<div class="nx-aj-row"><span>Configura tu ficha y tus contactos aquí</span><button class="nx-aj-theme-btn" id="nxSosOpen" style="background:linear-gradient(135deg,#DC2626,#EF4444)">🆘 Abrir SOS</button></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">📍</span>Ubicación</div>'
      +'<div class="nx-aj-card">'
      +'<p style="font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin:0 0 10px">Permite tu ubicación para que Javny pueda indicarte, cuando lo preguntes por voz o por escrito, el hospital o desfibrilador (DEA) más cercano. Solo se usa en el momento de la consulta, no se guarda en ningún servidor.</p>'
      +'<div class="nx-aj-row"><span id="nxGeoStatus">'+((function(){try{return localStorage.getItem('inurse_geo_consent')==='1'}catch(e){return false}})()?'✅ Ubicación permitida':'⭕ Ubicación no compartida todavía')+'</span><button class="nx-aj-theme-btn" id="nxGeoOpen">📍 Servicios cercanos</button></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">✨</span>Configurar Javny</div>'
      +'<div class="nx-aj-card">'
      +'<div class="nx-aj-field"><label for="nxJavnyName">Nombre del asistente</label><input type="text" id="nxJavnyName" value="'+esc(javnySaved.name||'Javny')+'" placeholder="Javny"></div>'
      +'<div class="nx-aj-field"><label for="nxJavnyDetail">Nivel de detalle</label><select id="nxJavnyDetail"><option value="breve"'+(javnySaved.detail==='breve'?' selected':'')+'>Breve</option><option value="normal"'+(javnySaved.detail==='normal'||!javnySaved.detail?' selected':'')+'>Normal</option><option value="detallado"'+(javnySaved.detail==='detallado'?' selected':'')+'>Detallado</option></select></div>'
      +'<div class="nx-aj-field"><label for="nxJavnyLang">Idioma de respuesta</label><select id="nxJavnyLang"><option value="es"'+((javnySaved.lang||'es')==='es'?' selected':'')+'>Español</option><option value="en"'+(javnySaved.lang==='en'?' selected':'')+'>English</option><option value="pt"'+(javnySaved.lang==='pt'?' selected':'')+'>Português</option></select></div>'
      +'<div class="nx-aj-field"><label for="nxJavnyModel">Modelo</label><select id="nxJavnyModel">'
      + MODELOS.map(function(m){ return '<option value="'+m.id+'"'+(curModel===m.id?' selected':'')+'>'+esc(m.t)+'</option>'; }).join('')
      +'</select></div>'
      +'<div class="nx-aj-field"><label for="nxJavnyKey">Clave API Gemini (opcional)</label><input type="password" id="nxJavnyKey" value="'+esc(javnySaved.apiKey||'')+'" placeholder="AIza..."></div>'
      +'<div class="nx-aj-row" style="margin-top:2px"><span style="font-size:12px;color:#8aa0c8;line-height:1.4">Sin clave propia, Javny usa el servidor seguro de Enferix (recomendado: activa las herramientas del chat)</span><button class="nx-aj-theme-btn" id="nxJavnyKeyClear">🗑 Quitar clave</button></div>'
      +'<button class="nx-aj-btn" id="nxJavnySave">Guardar configuración de Javny</button>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">💾</span>Datos de este dispositivo</div>'
      +'<div class="nx-aj-card">'
      +'<p style="font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin:0 0 10px">'
      +  'Tu perfil, turnos, favoritos, historial y proyectos se guardan en este dispositivo'
      +  (curDatos.tieneClaveApi?', junto con tu clave de Gemini':'')
      +  '. Ahora mismo hay <b>'+curDatos.claves+'</b> elementos guardados (~'+curDatos.kb+' KB).</p>'
      +'<label class="nx-aj-check"><input type="checkbox" id="nxExpKey"><span>Incluir la clave de Gemini en la copia</span></label>'
      +'<div class="nx-aj-row" style="gap:10px;margin-top:10px">'
      +'<button class="nx-aj-btn" id="nxExportBtn" style="flex:1;margin:0">⬇︎ Exportar copia</button>'
      +'<button class="nx-aj-btn" id="nxImportBtn" style="flex:1;margin:0;background:rgba(120,150,220,.15)">⬆︎ Restaurar copia</button>'
      +'</div>'
      +'<input type="file" id="nxImportInput" accept="application/json,.json" style="display:none">'
      +'<div id="nxDataMsg" style="font-size:12px;color:#8aa0c8;margin-top:8px"></div>'
      +'<hr style="border:none;border-top:1px solid var(--border,#1E293B);margin:15px 0">'
      +'<div class="nx-aj-row"><span style="font-size:12.5px;line-height:1.4">Borrar todo lo guardado en este dispositivo</span>'
      +'<button class="nx-aj-theme-btn" id="nxWipeBtn" style="background:linear-gradient(135deg,#DC2626,#EF4444)">Borrar</button></div>'
      +'<div id="nxWipeConfirm" style="display:none;margin-top:10px">'
      +'<p style="font-size:12px;color:#FCA5A5;line-height:1.5;margin:0 0 9px">Se borrará todo de <b>este</b> dispositivo y no se puede deshacer. Si tienes cuenta, lo que ya esté sincronizado seguirá en la nube. Si no, exporta una copia antes.</p>'
      +'<div class="nx-aj-row" style="gap:10px"><button class="nx-aj-btn" id="nxWipeCancel" style="flex:1;margin:0;background:rgba(120,150,220,.15)">Cancelar</button>'
      +'<button class="nx-aj-btn" id="nxWipeYes" style="flex:1;margin:0;background:linear-gradient(135deg,#DC2626,#EF4444)">Sí, borrar todo</button></div>'
      +'</div>'
      +'</div>'
      +'</div>'

      +'</div>'
      +'</div>';

    document.body.appendChild(ov);

    var releaseAjustesFocusTrap=window.EnferixFocusTrap(ov.querySelector('.nx-aj-panel'));
    function closeAjustes(){ ov.remove(); document.removeEventListener('keydown',onAjustesEscape); if(releaseAjustesFocusTrap){releaseAjustesFocusTrap();releaseAjustesFocusTrap=null;} }
    function onAjustesEscape(e){ if(e.key==='Escape') closeAjustes(); }
    document.addEventListener('keydown',onAjustesEscape);
    document.getElementById('nxAjClose').onclick=closeAjustes;
    ov.addEventListener('click',function(e){ if(e.target===ov) closeAjustes(); });

    function renderAccountBox(){
      var box=document.getElementById('nxAccountBox');
      if(!box) return;
      window.EnferixCloud.whoami().then(function(user){
        if(user){
          box.innerHTML=''
            +'<div class="nx-aj-row"><span>✅ '+esc(user.email)+'</span><button class="nx-aj-theme-btn" id="nxLogoutBtn">Cerrar sesión</button></div>'
            +'<div class="nx-aj-field"><label style="text-transform:none;font-weight:400;color:#8aa0c8">Tu perfil, turnos, favoritos y ajustes se sincronizan automáticamente con la nube.</label></div>';
          document.getElementById('nxLogoutBtn').onclick=function(){
            window.EnferixCloud.logout().then(renderAccountBox);
          };
        } else {
          box.innerHTML=''
            +'<div class="nx-aj-field"><label for="nxAuthEmail">Email</label><input type="email" id="nxAuthEmail" placeholder="tu@email.com"></div>'
            +'<div class="nx-aj-field"><label for="nxAuthPassword">Contraseña</label><input type="password" id="nxAuthPassword" placeholder="Mínimo 8 caracteres"></div>'
            +'<div class="nx-aj-field"><label for="nxAuthName">Nombre (solo para crear cuenta)</label><input type="text" id="nxAuthName" placeholder="Tu nombre"></div>'
            +'<div class="nx-aj-row" style="gap:10px"><button class="nx-aj-btn" id="nxLoginBtn" style="flex:1;margin:0">Iniciar sesión</button><button class="nx-aj-btn" id="nxRegisterBtn" style="flex:1;margin:0;background:rgba(120,150,220,.15)">Crear cuenta</button></div>'
            +'<div id="nxAuthMsg" style="font-size:12px;color:#8aa0c8"></div>';
          var msg=document.getElementById('nxAuthMsg');
          document.getElementById('nxLoginBtn').onclick=function(){
            var email=document.getElementById('nxAuthEmail').value.trim();
            var pass=document.getElementById('nxAuthPassword').value;
            msg.textContent='Conectando…'; msg.style.color='#8aa0c8';
            window.EnferixCloud.login(email,pass).then(function(){
              msg.textContent='✓ Sesión iniciada. Sincronizando datos…'; msg.style.color='#4ade80';
              setTimeout(function(){ location.reload(); },700);
            }).catch(function(err){ msg.textContent=err.message; msg.style.color='#f87171'; });
          };
          document.getElementById('nxRegisterBtn').onclick=function(){
            var email=document.getElementById('nxAuthEmail').value.trim();
            var pass=document.getElementById('nxAuthPassword').value;
            var name=document.getElementById('nxAuthName').value.trim();
            msg.textContent='Creando cuenta…'; msg.style.color='#8aa0c8';
            window.EnferixCloud.register(email,pass,name).then(function(){
              msg.textContent='✓ Cuenta creada. Tus datos de este dispositivo ya están en la nube.'; msg.style.color='#4ade80';
              renderAccountBox();
            }).catch(function(err){ msg.textContent=err.message; msg.style.color='#f87171'; });
          };
        }
      });
    }
    renderAccountBox();

    document.getElementById('nxThemeCycle').onclick=function(){
      curTheme=themeNext[curTheme]||'dark';
      localStorage.setItem('guiaHJ23_theme',curTheme);
      document.documentElement.setAttribute('data-theme',curTheme);
      document.getElementById('nxThemeLabel').textContent=themeLabels[curTheme];
      var tb=document.getElementById('themeBtn');
      if(tb){ tb.textContent=curTheme==='light'?'☀️':curTheme==='night'?'🌚':'🌙'; }
    };

    /* Tamaño de texto */
    var scaleBox=document.getElementById('nxTextScale');
    if(scaleBox) scaleBox.onclick=function(e){
      var b=e.target.closest('[data-scale]'); if(!b) return;
      var v=parseFloat(b.dataset.scale);
      if(P.setTextScale) P.setTextScale(v);
      scaleBox.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on',x===b); });
    };

    /* Especialidad: la misma clave que ya usan las calculadoras para
       reordenarse, de modo que elegirla aquí surte efecto de verdad. */
    var specSel=document.getElementById('nxAjSpec');
    if(specSel) specSel.onchange=function(){
      try{
        if(specSel.value) localStorage.setItem('inurse_myspec_v1',specSel.value);
        else localStorage.removeItem('inurse_myspec_v1');
      }catch(e){}
      // El panel del inicio muestra la misma preferencia; se repinta si está.
      document.querySelectorAll('.nx-spec-btn').forEach(function(b){
        b.classList.toggle('on', b.dataset.spec===specSel.value);
      });
      var act=document.getElementById('nxSpecActive');
      if(act){
        var s=SPECS.find(function(x){return x.key===specSel.value;});
        act.textContent=s?s.t:''; act.classList.toggle('show',!!s);
      }
      if(typeof window.reorderCalcTabs==='function'){ try{ window.reorderCalcTabs(); }catch(e){} }
    };

    /* Voz y lectura */
    var autoBtn=document.getElementById('nxAutoVoice');
    if(autoBtn) autoBtn.onclick=function(){
      curAutoVoice=!curAutoVoice;
      if(P.setAutoVoice) P.setAutoVoice(curAutoVoice);
      autoBtn.textContent=curAutoVoice?'🔊 Activada':'🔇 Desactivada';
    };

    var voicePick=document.getElementById('nxVoicePick');
    function fillVoices(){
      if(!voicePick||!P.voicesForLang) return;
      var list=P.voicesForLang(curLang);
      var actual=P.pickVoice?P.pickVoice(curLang):null;
      voicePick.innerHTML='<option value="">Automática</option>'
        + list.map(function(v){
            return '<option value="'+esc(v.voiceURI)+'"'+((actual&&actual.voiceURI===v.voiceURI)?' selected':'')+'>'+esc(v.name)+'</option>';
          }).join('');
      if(!list.length) voicePick.innerHTML='<option value="">No hay voces instaladas para este idioma</option>';
    }
    fillVoices();
    if(P.onVoicesReady) P.onVoicesReady(fillVoices);
    if(voicePick) voicePick.onchange=function(){ if(P.setVoice) P.setVoice(voicePick.value); };

    var langSel=document.getElementById('nxVoiceLang');
    if(langSel) langSel.onchange=function(){
      curLang=langSel.value;
      if(P.setLang) P.setLang(curLang);
      fillVoices();
    };

    var rateInput=document.getElementById('nxVoiceRate');
    var rateOut=document.getElementById('nxVoiceRateOut');
    if(rateInput) rateInput.oninput=function(){
      curRate=parseFloat(rateInput.value);
      if(rateOut) rateOut.textContent=curRate.toFixed(2)+'×';
      if(P.setRate) P.setRate(curRate);
    };

    var testBtn=document.getElementById('nxVoiceTest');
    if(testBtn) testBtn.onclick=function(){
      try{
        speechSynthesis.cancel();
        // El módulo de preferencias fija idioma, voz y velocidad al hablar.
        speechSynthesis.speak(new SpeechSynthesisUtterance('Hola, soy Javny. Así sonaré cuando te lea una respuesta.'));
      }catch(e){}
    };

    var dictadoBtn=document.getElementById('nxOpenDictado');
    if(dictadoBtn) dictadoBtn.onclick=function(){
      closeAjustes();
      var f=document.getElementById('recFab');
      if(f){ f.click(); return; }
      if(typeof window.openRec==='function') window.openRec();
    };

    /* Modelo de Javny: se escriben las dos claves a la vez, igual que hace el
       propio reintento del chat, para que no queden desincronizadas. */
    var modelSel=document.getElementById('nxJavnyModel');
    if(modelSel) modelSel.onchange=function(){
      var m=modelSel.value;
      try{
        localStorage.setItem('inurse_gemini_model_v1',m);
        var raw=localStorage.getItem('inurse52_javny_config');
        if(raw){ var o=JSON.parse(raw); o.model=m; localStorage.setItem('inurse52_javny_config',JSON.stringify(o)); }
      }catch(e){}
    };

    /* Datos de este dispositivo */
    var dataMsg=document.getElementById('nxDataMsg');
    function decir(txt,color){ if(dataMsg){ dataMsg.textContent=txt; dataMsg.style.color=color||'#8aa0c8'; } }

    var exportBtn=document.getElementById('nxExportBtn');
    if(exportBtn) exportBtn.onclick=function(){
      try{
        var conClave=!!(document.getElementById('nxExpKey')||{}).checked;
        var copia=window.EnferixData.exportar(conClave);
        var blob=new Blob([JSON.stringify(copia,null,2)],{type:'application/json'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');
        a.href=url;
        a.download='enferix-copia-'+new Date().toISOString().slice(0,10)+'.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); },2000);
        decir(conClave
          ? '✓ Copia descargada. Contiene tu clave de Gemini: no la compartas.'
          : '✓ Copia descargada, sin la clave de Gemini.','#4ade80');
      }catch(e){ decir('No se pudo exportar: '+e.message,'#f87171'); }
    };

    var importBtn=document.getElementById('nxImportBtn');
    var importInput=document.getElementById('nxImportInput');
    if(importBtn&&importInput){
      importBtn.onclick=function(){ importInput.click(); };
      importInput.onchange=function(){
        var f=importInput.files&&importInput.files[0]; if(!f) return;
        var fr=new FileReader();
        fr.onload=function(){
          try{
            var n=window.EnferixData.importar(String(fr.result||''));
            decir('✓ Restaurados '+n+' elementos. Recargando…','#4ade80');
            setTimeout(function(){ location.reload(); },900);
          }catch(e){ decir(e.message,'#f87171'); }
        };
        fr.onerror=function(){ decir('No se pudo leer el fichero.','#f87171'); };
        fr.readAsText(f);
        importInput.value='';
      };
    }

    // Borrado en dos pasos: es irreversible y no debe dispararse de un roce.
    var wipeBtn=document.getElementById('nxWipeBtn');
    var wipeBox=document.getElementById('nxWipeConfirm');
    if(wipeBtn&&wipeBox){
      wipeBtn.onclick=function(){ wipeBox.style.display=wipeBox.style.display==='none'?'block':'none'; };
      var cancel=document.getElementById('nxWipeCancel');
      if(cancel) cancel.onclick=function(){ wipeBox.style.display='none'; };
      var yes=document.getElementById('nxWipeYes');
      if(yes) yes.onclick=function(){
        try{
          var n=window.EnferixData.borrar();
          decir('✓ Borrados '+n+' elementos. Recargando…','#4ade80');
        }catch(e){}
        setTimeout(function(){ location.reload(); },900);
      };
    }

    var geoOpenBtn=document.getElementById('nxGeoOpen');
    if(geoOpenBtn)geoOpenBtn.onclick=function(){
      if(ov&&ov.parentNode)ov.remove();
      if(typeof window.openNearby==='function')window.openNearby();
    };

    var sosOpenBtn=document.getElementById('nxSosOpen');
    if(sosOpenBtn)sosOpenBtn.onclick=function(){
      if(ov&&ov.parentNode)ov.remove();
      if(typeof window.openSos==='function')window.openSos();
    };

    /* La clave vive, según la época de cada componente, en varias claves de
       localStorage (la lista es la misma CLAVES_API de inurse-prefs-js.js). El
       chat lee 'guiaHJ23_apikey': antes este botón escribía solo en
       'gemini_api_key', así que guardar o vaciar el campo no cambiaba nada
       real. Ahora el campo manda sobre todas, al guardar y al quitar. */
    var AJ_CLAVES_API=['guiaHJ23_apikey','gemini_api_key','inurse_gemini_api_key_v1','in51_gemini_key','inurse52_gemini_api_key'];
    function ajQuitarClaveApi(){
      AJ_CLAVES_API.forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
      ['inurse_vivi_config_v1','inurse52_javny_config'].forEach(function(k){
        try{ var o=JSON.parse(localStorage.getItem(k)||'null'); if(o&&o.apiKey!==undefined){ delete o.apiKey; localStorage.setItem(k,JSON.stringify(o)); } }catch(e){}
      });
    }
    document.getElementById('nxJavnySave').onclick=function(){
      var apiKey=document.getElementById('nxJavnyKey').value.trim();
      var cfg={ name:document.getElementById('nxJavnyName').value.trim()||'Javny', detail:document.getElementById('nxJavnyDetail').value, lang:document.getElementById('nxJavnyLang').value };
      if(apiKey) cfg.apiKey=apiKey;
      try{ localStorage.setItem('inurse_vivi_config_v1',JSON.stringify(cfg)); }catch(e){}
      if(apiKey){ AJ_CLAVES_API.forEach(function(k){ try{ localStorage.setItem(k,apiKey); }catch(e){} }); }
      else ajQuitarClaveApi();
      this.textContent='✓ Guardado'; var self=this; setTimeout(function(){ self.textContent='Guardar configuración de Javny'; },1500);
    };
    document.getElementById('nxJavnyKeyClear').onclick=function(){
      document.getElementById('nxJavnyKey').value='';
      ajQuitarClaveApi();
      this.textContent='✓ Clave quitada'; var self=this; setTimeout(function(){ self.textContent='🗑 Quitar clave'; },2000);
    };

    document.getElementById('nxPhotoBtn').onclick=function(){
      document.getElementById('nxPhotoInput').click();
    };

    document.getElementById('nxPhotoInput').onchange=function(e){
      var file=e.target.files[0]; if(!file) return;
      var reader=new FileReader();
      reader.onload=function(ev){
        var dataUrl=ev.target.result;
        var av=document.getElementById('nxProfileAvatar');
        av.innerHTML='<img src="'+dataUrl+'" alt="Foto">';
        av.dataset.photo=dataUrl;
      };
      reader.readAsDataURL(file);
    };

    document.getElementById('nxProfileSave').onclick=function(){
      var av=document.getElementById('nxProfileAvatar');
      var photo='';
      if(av){ photo=av.dataset.photo||''; if(!photo){ var img=av.querySelector('img'); if(img) photo=img.src; } }
      var profile={ name:document.getElementById('nxProfileName').value.trim(), surname:document.getElementById('nxProfileSurname').value.trim(), email:document.getElementById('nxProfileEmail').value.trim(), hospital:document.getElementById('nxProfileHospital').value.trim(), spec:document.getElementById('nxProfileSpec').value.trim(), photo:photo };
      try{ localStorage.setItem('inurse_profile_v1',JSON.stringify(profile)); }catch(e){}
      this.textContent='✓ Perfil guardado'; var self=this; setTimeout(function(){ self.textContent='Guardar perfil'; },1500);
    };
  }

})();
