
// Trampa de foco reutilizable para diálogos modales: mientras el diálogo está
// abierto, Tab/Shift+Tab circulan solo entre sus elementos interactivos (sin
// escapar al contenido de detrás) y, al cerrarlo, el foco vuelve a quien lo
// abrió. Se expone en window porque los distintos overlays de la app viven en
// closures/<script> independientes que no comparten variables entre sí.
window.EnferixFocusTrap = function(container, opts){
  opts = opts || {};
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var previouslyFocused = document.activeElement;
  function focusable(){
    return Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function(el){
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }
  function onKeydown(e){
    if(e.key !== 'Tab') return;
    var items = focusable();
    if(!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKeydown);
  setTimeout(function(){
    var target = opts.initialFocus || focusable()[0];
    if(target) target.focus();
  }, 30);
  return function release(){
    container.removeEventListener('keydown', onKeydown);
    if(!opts.skipRestoreFocus && previouslyFocused && typeof previouslyFocused.focus === 'function'){
      try{ previouslyFocused.focus(); }catch(e){}
    }
  };
};
window.EnferixCloud = (function(){
  var origSet = localStorage.setItem.bind(localStorage);
  var origRemove = localStorage.removeItem.bind(localStorage);
  var pending = {};
  var timer = null;
  var user = null;

  function isSecretKey(k){ return /key|token|password|apikey/i.test(k); }

  function scheduleFlush(){ clearTimeout(timer); timer = setTimeout(flush, 1500); }
  function flush(){
    if(!user) { pending = {}; return; }
    var batch = pending; pending = {};
    if(!Object.keys(batch).length) return;
    fetch('/api/sync/bulk', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({data: batch})
    }).catch(function(){});
  }

  localStorage.setItem = function(k,v){
    origSet(k,v);
    if(isSecretKey(k)) return;
    pending[k]=v;
    scheduleFlush();
  };
  localStorage.removeItem = function(k){
    origRemove(k);
    if(isSecretKey(k)) return;
    pending[k]=null;
    scheduleFlush();
  };
  window.addEventListener('beforeunload', flush);

  function pushAll(){
    var batch = {};
    for(var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if(isSecretKey(k)) continue;
      batch[k] = localStorage.getItem(k);
    }
    if(!Object.keys(batch).length) return Promise.resolve();
    return fetch('/api/sync/bulk', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({data: batch})
    }).catch(function(){});
  }

  function pullAll(){
    return fetch('/api/sync', {credentials:'include'})
      .then(function(r){ return r.ok ? r.json() : {data:{}}; })
      .then(function(res){
        var data = res.data || {};
        Object.keys(data).forEach(function(k){
          if(isSecretKey(k)) return;
          if(data[k]===null) origRemove(k); else origSet(k, data[k]);
        });
      });
  }

  function whoami(){
    return fetch('/api/auth/me', {credentials:'include'})
      .then(function(r){ return r.ok? r.json(): {user:null}; })
      .then(function(res){ user = res.user || null; return user; });
  }

  function register(email,password,name){
    return fetch('/api/auth/register', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email:email,password:password,name:name})
    }).then(function(r){
      return r.json().then(function(d){
        if(!r.ok) throw new Error(d.error||'Error al registrar');
        user = d.user;
        return pushAll();
      });
    });
  }

  function login(email,password){
    return fetch('/api/auth/login', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email:email,password:password})
    }).then(function(r){
      return r.json().then(function(d){
        if(!r.ok) throw new Error(d.error||'Error al iniciar sesión');
        user = d.user;
        return pullAll();
      });
    });
  }

  function logout(){
    return fetch('/api/auth/logout', {method:'POST', credentials:'include'}).then(function(){ user=null; });
  }

  return {
    whoami: whoami, register: register, login: login, logout: logout,
    getUser: function(){ return user; }, pushAll: pushAll, pullAll: pullAll
  };
})();
const CATS={
  all:{name:"Todos",icon:"📋",color:"#0EA5E9"},
  resp:{name:"Respiratorio",icon:"🫁",color:"#22D3EE"},
  cardio:{name:"Cardiología",icon:"❤️",color:"#F43F5E"},
  ictus:{name:"Ictus / Neuro",icon:"🧠",color:"#A855F7"},
  emer:{name:"Urgencias / Parada",icon:"%s",color:"#FB923C"},
  extra:{name:"Urgencias extrahospitalarias",icon:"⛑️",color:"#14B8A6"},
  esp:{name:"Especialidades",icon:"🧪",color:"#FACC15"},
  uci:{name:"Cuidados Intensivos",icon:"🏥",color:"#6366F1"},
  imagen:{name:"Diagnóstico por Imagen",icon:"🩻",color:"#8B5CF6"},
  enfoqueuci:{name:"Enfoque UCI",icon:"🧬",color:"#0D9488"},
  obst:{name:"Obstétrico crítico",icon:"🤰",color:"#EC4899"},
  ped:{name:"Pediátrico crítico",icon:"👶",color:"#F97316"},
  trauma:{name:"Trauma y quemados",icon:"🚑",color:"#DC2626"},
  farm:{name:"Farmacología UCI",icon:"💊",color:"#0891B2"},
  recent:{name:"Recientes",icon:"🕐",color:"#64748B"},
  fav:{name:"",icon:"⭐️",color:"#F59E0B"}
};

CATS.emer.icon = "🚑";

const VCATS={
  atb:{name:"Antibacterianos",icon:"💊",color:"#2563EB"},
  fung:{name:"Antifúngicos",icon:"🍄",color:"#7C3AED"},
  palud:{name:"Antipalúdicos",icon:"🦟",color:"#059669"},
  parasit:{name:"Antiparasitarios",icon:"🪱",color:"#65A30D"},
  viral:{name:"Antivirales",icon:"🧬",color:"#0891B2"},
  dolor:{name:"Analgésicos y AINE",icon:"🩹",color:"#DC2626"},
  cardio:{name:"Cardiovascular",icon:"❤️",color:"#E11D48"},
  hemat:{name:"Hematología / Anticoag.",icon:"🩸",color:"#BE123C"},
  resp:{name:"Respiratorio",icon:"🫁",color:"#0EA5E9"},
  neuro:{name:"Neuro / Psiquiatría",icon:"🧠",color:"#9333EA"},
  gi:{name:"Digestivo",icon:"🥣",color:"#D97706"},
  endo:{name:"Endocrino / Diabetes",icon:"🍬",color:"#CA8A04"},
  gineco:{name:"Salud reproductiva",icon:"🤰",color:"#DB2777"},
  alergia:{name:"Alergia / Antihistam.",icon:"🤧",color:"#0D9488"},
  antidoto:{name:"Urgencias / Antídotos",icon:"🧯",color:"#EA580C"},
  anest:{name:"Anestésicos",icon:"💉",color:"#4F46E5"},
  sueros:{name:"Sueros y electrolitos",icon:"💧",color:"#0284C7"},
  vacunas:{name:"Vacunas e inmunog.",icon:"🛡️",color:"#16A34A"},
  derma:{name:"Uso externo / Dérmico",icon:"%s",color:"#0F766E"},
  nutri:{name:"Vitaminas y nutrición",icon:"🥗",color:"#22C55E"},
  infec:{name:"Infecciosas / Parasitarias",icon:"🦠",color:"#15803D"},
  nefro:{name:"Nefrología / Urología",icon:"🚿",color:"#0369A1"},
  oftalmo:{name:"Oftalmología",icon:"👁️",color:"#7E22CE"},
  orl:{name:"Otorrinolaringología",icon:"👂",color:"#B45309"},
  onco:{name:"Oncología",icon:"🎗️",color:"#9D174D"},
  reuma:{name:"Reumatología / Trauma",icon:"🦴",color:"#57534E"},
  obsoleto:{name:"⚠️ Peligrosos / Obsoletos",icon:"⛔",color:"#6B7280"}
};

VCATS.derma.icon = "🧴";

const VORDER=["atb", "fung", "palud", "parasit", "viral", "infec", "dolor", "cardio", "hemat", "resp", "neuro", "gi", "endo", "nefro", "gineco", "alergia", "reuma", "oftalmo", "orl", "onco", "anest", "sueros", "vacunas", "derma", "nutri", "antidoto", "obsoleto"];

const store={
  get:(k)=>localStorage.getItem(k),
  set:(k,v)=>localStorage.setItem(k,v)
};

// Robust localStorage loading
let favs = [];
try { favs = JSON.parse(store.get("guiaHJ23_favs") || "[]"); } catch(e) { favs = []; }
let history = [];
try { history = JSON.parse(store.get("guiaHJ23_history") || "[]"); } catch(e) { history = []; }
function addHistory(id){
  history = [id, ...history.filter(x=>x!==id)].slice(0,10);
  try{ store.set("guiaHJ23_history", JSON.stringify(history)); }catch(e){}
}
function getNote(id){ try{ return store.get("guiaHJ23_note_"+id) || ""; }catch(e){ return ""; } }
function setNote(id, txt){ try{ if(txt) store.set("guiaHJ23_note_"+id, txt); else localStorage.removeItem("guiaHJ23_note_"+id); }catch(e){} }

let theme = store.get("guiaHJ23_theme") || "dark";

let groupsOpen = new Set();
try {
  const storedGroups = JSON.parse(store.get("guiaHJ23_groups") || "[]");
  groupsOpen = new Set(storedGroups);
} catch(e) {
  groupsOpen = new Set(["resp", "cardio"]);
}
if (groupsOpen.size === 0) {
  groupsOpen.add("resp");
  groupsOpen.add("cardio");
}
let activeCat="all", query="";

const $=s=>document.querySelector(s);
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2200)}
function stripHTML(html){
  if(!html) return "";
  const tmp=html.replace(/<\/li>/g,". ").replace(/<\/p>/g,". ").replace(/<li>/g," ").replace(/<[^>]+>/g,"");
  const d=document.createElement("div");d.innerHTML=tmp;return d.textContent.replace(/\s+/g," ").trim();
}
function docPlainText(d){let t=d.title+". "+d.source+". "+d.summary+". ";d.sec.forEach(s=>{t+=s.h+". "+stripHTML(s.b)+" "});return t}
function docShareText(d){
  let t="🩺 "+d.title+"\n"+d.source+"\n\n"+d.summary+"\n";
  d.sec.forEach(s=>{t+="\n• "+s.h+":\n"+stripHTML(s.b)+"\n"});
  t+="\n— Enferix";
  return t;
}

/* ---------- voz: síntesis ---------- */
const synth=window.speechSynthesis;let esVoice=null;
function loadVoices(){if(!synth)return;const v=synth.getVoices();esVoice=v.find(x=>/es[-_]ES/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))||null}
if(synth){loadVoices();synth.onvoiceschanged=loadVoices}
let speakingBtn=null;
function stopSpeak(){if(synth)synth.cancel();if(speakingBtn){speakingBtn.classList.remove("speaking");speakingBtn._reset&&speakingBtn._reset();speakingBtn=null}}
function speak(text,btn){
  if(!synth){toast("Tu navegador no permite leer en voz alta");return}
  if(speakingBtn===btn){stopSpeak();return}
  stopSpeak();
  let voiceRate=parseFloat(store.get("guiaHJ23_rate"))||1.05;
  const u=new SpeechSynthesisUtterance(text);u.lang="es-ES";if(esVoice)u.voice=esVoice;u.rate=voiceRate;u.pitch=1;
  u.onend=()=>{if(btn){btn.classList.remove("speaking");btn._reset&&btn._reset()}speakingBtn=null};
  speakingBtn=btn;if(btn)btn.classList.add("speaking");synth.speak(u);
}

/* ---------- voz: reconocimiento ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function dictate(btn,onResult,onFinal){
  if(!SR){toast("El dictado por voz no está disponible en este navegador");return}
  if(btn._rec){btn._rec.stop();return}
  const rec=new SR();rec.lang="es-ES";rec.interimResults=true;rec.continuous=false;
  btn._rec=rec;btn.classList.add("listening");let finalText="";
  rec.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)finalText+=r[0].transcript;else interim+=r[0].transcript}onResult((finalText+interim).trim())};
  rec.onerror=e=>{if(e.error==="not-allowed")toast("Permite el micrófono para dictar")};
  rec.onend=()=>{btn.classList.remove("listening");btn._rec=null;if(finalText.trim()&&onFinal)onFinal(finalText.trim())};
  rec.start();
}

/* ---------- tema ---------- */
function applyTheme(){
  const valid = theme==="light" || theme==="night" ? theme : "dark";
  document.documentElement.setAttribute("data-theme", valid);
  const btn=$("#themeBtn");
  if(btn){ btn.textContent = valid==="light"?"☀️": (valid==="night"?"🌚":"🌙"); btn.title = "Tema: "+(valid==="light"?"día":valid==="night"?"turno noche":"oscuro")+" — pulsa para cambiar"; }
}
$("#themeBtn").onclick=()=>{theme = theme==="light"?"dark":(theme==="dark"?"night":"light");store.set("guiaHJ23_theme",theme);applyTheme();toast(theme==="light"?"☀️ Modo día":theme==="dark"?"🌙 Modo oscuro":"🌚 Modo turno de noche")};
applyTheme();

/* ---------- render ---------- */
function matches(d){
  if(d&&d.__masterHidden)return false;
  if(activeCat==="fav")return favs.includes(d.id);
  if(activeCat==="recent")return history.includes(d.id);
  const dc=Array.isArray(d.cat)?d.cat:[d.cat];
  if(activeCat && activeCat.indexOf("spec:")===0){
    var _set=(window.__SPEC_SETS&&window.__SPEC_SETS[activeCat.slice(5)])||[];
    if(!_set.some(function(c){return dc.includes(c)}))return false;
  } else if(activeCat!=="all"){
    if(activeCat==="uci"){
      if(!dc.includes("uci")&&!dc.includes("enfoqueuci"))return false;
    } else if(!dc.includes(activeCat))return false;
  }
  if(query){
    const blob=(d.title+" "+d.source+" "+d.tags+" "+d.summary+" "+d.sec.map(s=>s.h+" "+s.b).join(" ")).toLowerCase();
    return blob.includes(query);
  }
  return true;
}
function cardHTML(d){
  const c=CATS[Array.isArray(d.cat)?d.cat[0]:d.cat] || {name:"Especialidades", color:"var(--esp)"};
  const isFav=favs.includes(d.id);
  const evidenceBadge=(level)=>{const colors={A:'#34d399',B:'#fbbf24',C:'#f87171'};return `<span class="evidence-badge" style="background:${colors[level]||'#999'}">${level}</span>`;};
  const secs=d.sec.map(s=>`<div class="sec">${s.evidence?`<div class="sec-evidence">${evidenceBadge(s.evidence)}<span>${s.citation||''}</span></div>`:''}<h4>${s.h}</h4><p>${s.b}</p></div>`).join("");
  const reliabilityBadges=d.evidence_level?`<div class="reliability-badges"><div class="badge-group">Evidencia: ${evidenceBadge(d.evidence_level)}</div>${d.last_updated?`<div class="badge-group">🗓️ ${d.last_updated}</div>`:''}${d.reference_url?`<div class="badge-group"><a href="${d.reference_url}" target="_blank" class="ref-link" onclick="event.stopPropagation()">📖 Fuente oficial</a></div>`:''}</div>`:'';
  return `<div class="card" id="card-${d.id}" style="--ac:${c.color}">
    <div class="card-head" onclick="toggle('${d.id}')">
      <div class="card-body-title">
        <span class="ctag">${c.name}</span>
        <div class="ctitle">${d.title}</div>
        <div class="csource">${d.source}</div>
        <div class="csummary">${d.summary}</div>
      </div>
      <button class="star ${isFav?'on':''}" onclick="event.stopPropagation();fav('${d.id}')" title="Favorito">${isFav?'★':'☆'}</button>
    </div>
    <div class="detail"><div class="detail-inner">
      ${reliabilityBadges}
      <div class="toolbar">
        <button class="tool" id="speak-${d.id}" onclick="event.stopPropagation();speakCard('${d.id}')">🔊 Escuchar</button>
        <button class="tool" onclick="event.stopPropagation();shareDoc('${d.id}')">📤 Compartir</button>
        <button class="tool notes-btn ${getNote(d.id)?'has-note':''}" id="notesBtn-${d.id}" onclick="event.stopPropagation();toggleNotes('${d.id}')">📝 ${getNote(d.id)?'Ver notas':'Mis notas'}</button>
      </div>
      ${secs}
      ${(function(){ if(typeof DIAGRAMS!=="undefined" && DIAGRAMS[d.id]){ return `<div class="diag-sec" id="diagSec-${d.id}"><div class="diag-sec-title"><span class="diag-sec-ico">${DIAGRAMS[d.id].icon}</span>${DIAGRAMS[d.id].title}</div>${DIAGRAMS[d.id].render()}</div>`; } return ""; })()}
      <div class="notes-wrap">
        ${getNote(d.id)?`<div class="notes-preview" id="notesPreview-${d.id}">${escapeHtml(getNote(d.id))}</div>`:''}
        <div class="notes-editor" id="notesEditor-${d.id}">
          <textarea id="notesText-${d.id}" placeholder="Notas personales de esta ficha (dilución en HJ23, contactos, protocolos locales…). Se guardan solo en este dispositivo.">${escapeHtml(getNote(d.id))}</textarea>
          <div class="notes-actions">
            <button class="notes-clear" onclick="event.stopPropagation();clearNote('${d.id}')">Borrar</button>
            <button class="notes-save" onclick="event.stopPropagation();saveNote('${d.id}')">Guardar</button>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:10px"><span class="expand-ico">▲ cerrar</span></div>
    </div></div>
  </div>`;
}
function render(){
  if(activeCat==="patologias"){renderPatologias();return;}
  if(activeCat==="herramientas"){renderHerramientas();return;}
  const list=DOCS.filter(matches),cont=$("#content");
  $("#count").textContent=list.length+(list.length===1?" documento":" documentos");
  if(!list.length){cont.innerHTML=`<div class="empty"><div class="big">🔍</div>Sin resultados.<br>Prueba con otra palabra o categoría.</div>`;return}
  
  if(activeCat==="all"&&!query){
    let html="";
    for(const k in CATS){
      if(k==="all"||k==="fav")continue;
      const g=list.filter(d=>Array.isArray(d.cat)?d.cat.includes(k):d.cat===k);
      if(!g.length)continue;
      const c=CATS[k],open=groupsOpen.has(k);
      html+=`<div class="group-card ${open?'open':''}" id="group-${k}" style="--ac:${c.color}">
        <div class="group-header" onclick="toggleGroup('${k}')">
          <div class="group-ico">${c.icon}</div>
          <div class="group-meta"><div class="gname">${c.name}</div><div class="gcount">${g.length} ${g.length===1?'documento':'documentos'}</div></div>
          <div class="group-chev">▼</div>
        </div>
        <div class="group-content"><div class="inner"><div class="grid">${g.map(cardHTML).join("")}</div></div></div>
      </div>`;
    }
    cont.innerHTML=html;
  }else{
    cont.innerHTML=`<div class="grid flat">${list.map(cardHTML).join("")}</div>`;
  }
}
function toggleGroup(k){
  const el=$("#group-"+k),open=el.classList.toggle("open");
  if(open)groupsOpen.add(k);else groupsOpen.delete(k);
  store.set("guiaHJ23_groups",JSON.stringify([...groupsOpen]));
}
function toggle(id){
  const card=$("#card-"+id);
  if(!card) return;
  const det=card.querySelector(".detail"),open=card.classList.toggle("open");
  det.style.maxHeight=open?det.querySelector(".detail-inner").scrollHeight+40+"px":"0";
  if(open){
    addHistory(id);
    if(typeof DIAGRAMS!=="undefined" && DIAGRAMS[id] && DIAGRAMS[id].init){
      setTimeout(()=>{ try{ DIAGRAMS[id].init(); }catch(e){} }, 100);
    }
  }
}
function fav(id){
  const i=favs.indexOf(id);
  if(i>=0)favs.splice(i,1);else favs.push(id);
  store.set("guiaHJ23_favs",JSON.stringify(favs));
  render();
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function toast(msg){
  let t=document.querySelector(".toast");
  if(!t){ t=document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add("on");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("on"), 2200);
}
function toggleNotes(id){
  const ed=document.getElementById("notesEditor-"+id);
  if(!ed) return;
  ed.classList.toggle("on");
  if(ed.classList.contains("on")){
    setTimeout(()=>{
      const ta=document.getElementById("notesText-"+id);
      if(ta) ta.focus();
      const card=document.getElementById("card-"+id);
      if(card){
        const det=card.querySelector(".detail");
        if(det) det.style.maxHeight = det.querySelector(".detail-inner").scrollHeight+80+"px";
      }
    }, 50);
  }
}
function saveNote(id){
  const ta=document.getElementById("notesText-"+id);
  if(!ta) return;
  const txt=ta.value.trim();
  setNote(id, txt);
  toast(txt?"📝 Notas guardadas":"🗑 Notas borradas");
  render();
  setTimeout(()=>{
    const card=document.getElementById("card-"+id);
    if(card && !card.classList.contains("open")) toggle(id);
    card.scrollIntoView({behavior:"smooth", block:"center"});
  }, 100);
}
function clearNote(id){
  const ta=document.getElementById("notesText-"+id);
  if(ta) ta.value="";
  setNote(id, "");
  toast("🗑 Notas borradas");
  render();
}
function speakCard(id){
  const d=DOCS.find(x=>x.id===id),btn=$("#speak-"+id);
  if(!d||!btn) return;
  btn._reset=()=>btn.textContent="🔊 Escuchar";
  if(speakingBtn===btn){stopSpeak();return}
  document.querySelectorAll(".tool.speaking").forEach(b=>{b.classList.remove("speaking");b.textContent="🔊 Escuchar"});
  btn.textContent="⏹ Parar";
  speak(docPlainText(d),btn);
}

async function shareDoc(id){
  const d=DOCS.find(x=>x.id===id);
  if(!d) return;
  const text=docShareText(d);
  if(navigator.share){try{await navigator.share({title:d.title,text});return}catch(e){if(e.name==="AbortError")return}}
  window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank");
}
async function shareAll(){
  const text="%s\n%s\n\n%s"; // formatted below safely
  const title = "Enferix";
  const bodyText = "🩺 Enferix\nAsistente clínico de enfermería con guías, vademécum, calculadoras, ECG y Javny.\n\n"+location.href;
  if(navigator.share){try{await navigator.share({title,text:bodyText,url:location.href});return}catch(e){if(e.name==="AbortError")return}}
  try{await navigator.clipboard.writeText(location.href);toast("Enlace copiado")}catch(e){window.open("https://wa.me/?text="+encodeURIComponent(bodyText),"_blank")}
}
$("#shareAllBtn").onclick=shareAll;

const searchInput=$("#search"),clearBtn=$("#clearBtn"),micBtn=$("#micBtn");
function applyQuery(v){
  searchInput.value=v;
  query=v.trim().toLowerCase();
  clearBtn.style.display=v?"flex":"none";
  render();
}
searchInput.oninput=()=>applyQuery(searchInput.value);
clearBtn.onclick=()=>{applyQuery("");searchInput.focus()};
micBtn.onclick=()=>dictate(micBtn,
  v=>applyQuery(v),
  final=>{
    const handled = handleVoiceCommand(final);
    if (!handled) {
      applyQuery(final);
    }
  }
);

$("#chips").onclick=e=>{
  const chip=e.target.closest(".chip");
  if(!chip)return;
  document.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
  chip.classList.add("active");
  activeCat=chip.dataset.c;
  render();
};
const PATOCHAPTERS=[["perinatal", "🍼", "Afecciones del período perinatal (P00-P96)", []], ["circulatorio", "❤️", "Aparato circulatorio (I00-I99)", ["cardio"]], ["digestivo", "🍽️", "Aparato digestivo (K00-K95)", ["gi"]], ["genitourinario", "🚻", "Aparato genitourinario (N00-N99)", ["nefro"]], ["musculo", "🦴", "Aparato musculoesquelético (M00-M99)", ["reuma"]], ["respiratorio", "🫁", "Aparato respiratorio (J00-J99)", ["resp"]], ["cirugia", "🔪", "Cirugía", ["anest"]], ["diagnostico", "🔬", "Diagnóstico", []], ["embarazo", "🤰", "Embarazo, parto y puerperio (O00-O9A)", []], ["endocrino", "🧬", "Endocrinas, nutricionales y metabólicas (E00-E89)", ["endo", "nutri"]], ["infecciosas", "🦠", "Enfermedades infecciosas y parasitarias (A00-B99)", ["infec", "atb", "fung", "palud", "parasit", "viral"]], ["factores", "📋", "Factores que influyen en el estado de salud", []], ["ginecologia", "♀️", "Ginecología", ["gineco"]], ["inmunologia", "🛡️", "Inmunología", ["alergia"]], ["malformaciones", "🧩", "Malformaciones congénitas y cromosómicas (Q00-Q99)", []], ["mentales", "🧠", "Mentales y del comportamiento (F01-F99)", []], ["neoplasias", "🎗️", "Neoplasias (C00-D49)", ["onco"]], ["ojo", "👁️", "Ojo y sus anexos (H00-H59)", ["oftalmo"]], ["oido", "👂", "Oído y apófisis mastoides (H60-H95)", ["orl"]], ["piel", "🩹", "Piel y tejido subcutáneo (L00-L99)", ["derma"]], ["procedimientos", "⚙️", "Procedimientos", []], ["sangre", "🩸", "Sangre y órganos hematopoyéticos (D50-D89)", ["hemat"]], ["nervioso", "🧠", "Sistema nervioso (G00-G99)", ["neuro"]], ["sintomas", "🌡️", "Síntomas y signos inespecíficos", ["dolor"]], ["traumatismos", "☠️", "Traumatismos y envenenamientos", ["antidoto"]]];
const PATODIS={"perinatal": [["conjuntivitis-clamidia", "Conjuntivitis neonatal por clamidia"], ["distres-rn", "Distrés respiratorio del recién nacido"], ["enf-hemolitica-rn", "Enfermedad hemolítica del recién nacido"], ["enf-hemorragica-rn", "Enfermedad hemorrágica del recién nacido"], ["oftalmia-neonatal", "Oftalmía neonatal"], ["ductus-arterioso", "Persistencia del ductus arterioso"]], "circulatorio": [["aneurisma", "Aneurisma"], ["angina-de-esfuerzo", "Angina de esfuerzo"], ["angina-de-pecho", "Angina de pecho"], ["angina-de-prinzmetal", "Angina de Prinzmetal"], ["angina-inestable", "Angina inestable"], ["angina-estable", "Angina estable"], ["apoplejia", "Apoplejía"], ["arritmia-cardiaca", "Arritmia cardíaca"], ["arteriopatia-periferica", "Arteriopatía periférica"], ["arteritis", "Arteritis"], ["aterosclerosis", "Aterosclerosis"], ["arteriosclerosis-cerebral", "Arteriosclerosis cerebral"], ["bloqueo-cardiaco", "Bloqueo cardíaco"], ["bradicardia", "Bradicardia"], ["bradicardia-sinusal", "Bradicardia sinusal"], ["cardiopatia-isquemica", "Cardiopatía isquémica"], ["claudicacion-intermitente", "Claudicación intermitente"], ["crisis-hipertensivas", "Crisis hipertensivas"], ["diseccion-aortica", "Disección aórtica"], ["embolia", "Embolia"], ["embolia-cerebral", "Embolia cerebral"], ["embolia-pulmonar", "Embolia pulmonar"], ["endocarditis-infecciosa", "Endocarditis infecciosa"], ["estenosis-aortica", "Estenosis aórtica"], ["estenosis-valvular", "Estenosis valvular"], ["estasis-venosa", "Estasis venosa"], ["fibrilacion-auricular", "Fibrilación auricular"], ["fibrilacion-ventricular", "Fibrilación ventricular"], ["fiebre-reumatica", "Fiebre reumática"], ["flebitis", "Flebitis"], ["fluter-aleteo-auricular", "Flúter (aleteo) auricular"], ["fragilidad-capilar", "Fragilidad capilar"], ["gangrena", "Gangrena"], ["hemorragia-cerebral", "Hemorragia cerebral"], ["hemorragia-intracraneal", "Hemorragia intracraneal"], ["hemorragia-subaracnoidea", "Hemorragia subaracnoidea"], ["hipertension-arterial", "Hipertensión arterial"], ["hipertension-pulmonar", "Hipertensión pulmonar"], ["hipotension", "Hipotensión"], ["hipotension-ortostatica", "Hipotensión ortostática"], ["infarto-agudo-de-miocardio", "Infarto agudo de miocardio"], ["insuficiencia-cardiaca", "Insuficiencia cardíaca"], ["insuficiencia-coronaria", "Insuficiencia coronaria"], ["insuficiencia-valvular-cardiaca", "Insuficiencia valvular cardíaca"], ["insuficiencia-ventricular-derecha", "Insuficiencia ventricular derecha"], ["insuficiencia-ventricular-izquierda", "Insuficiencia ventricular izquierda"], ["isquemia-cerebral", "Isquemia cerebral"], ["miocardiopatia", "Miocardiopatía"], ["miocardiopatia-hipertrofica-obstructiva", "Miocardiopatía hipertrófica obstructiva"], ["miocarditis", "Miocarditis"], ["pericarditis", "Pericarditis"], ["problemas-de-circulacion", "Problemas de circulación"], ["shock-hipovolemico", "Shock hipovolémico"], ["sindrome-de-adams-stokes", "Síndrome de Adams-Stokes"], ["sindrome-de-raynaud", "Síndrome de Raynaud"], ["sindrome-de-wolff-parkinson-white", "Síndrome de Wolff-Parkinson-White"], ["hipercolesterolemia-familiar-homocigotica", "Hipercolesterolemia familiar homocigótica"], ["taquicardia", "Taquicardia"], ["taquicardia-auricular", "Taquicardia auricular"], ["taquicardia-sinusal", "Taquicardia sinusal"], ["taquicardia-supraventricular", "Taquicardia supraventricular"], ["taquicardia-ventricular", "Taquicardia ventricular"], ["telangiectasia", "Telangiectasia"], ["tromboangeitis-obliterante-enfermedad-de-buerger", "Tromboangeítis obliterante (enfermedad de Buerger)"], ["tromboembolismo", "Tromboembolismo"], ["tromboembolismo-arterial", "Tromboembolismo arterial"], ["tromboembolismo-venoso", "Tromboembolismo venoso"], ["tromboflebitis", "Tromboflebitis"], ["trombosis", "Trombosis"], ["trombosis-venosa", "Trombosis venosa"], ["trombosis-venosa-profunda", "Trombosis venosa profunda"], ["trombosis-venosa-superficial", "Trombosis venosa superficial"], ["ulcera-varicosa", "Úlcera varicosa"], ["valvulopatia", "Valvulopatía"], ["varices", "Varices"], ["varices-esofagicas", "Varices esofágicas"], ["vasculitis", "Vasculitis"]], "digestivo": [["absceso-dental", "Absceso dental"], ["absceso-hepatico", "Absceso hepático"], ["absceso-peritoneal", "Absceso peritoneal"], ["adenocarcinoma-gastrico", "Adenocarcinoma gástrico"], ["aftas-orales", "Aftas orales"], ["apendicitis", "Apendicitis"], ["atonia-intestinal", "Atonía intestinal"], ["carcinoma-de-celulas-escamosas-de-esofago", "Carcinoma de células escamosas de esófago"], ["caries-dental", "Caries dental"], ["cirrosis-biliar", "Cirrosis biliar"], ["cirrosis-hepatica", "Cirrosis hepática"], ["colangitis", "Colangitis"], ["colecistitis", "Colecistitis"], ["colelitiasis", "Colelitiasis"], ["colestasis", "Colestasis"], ["colico-biliar", "Cólico biliar"], ["colitis-colagena", "Colitis colágena"], ["colitis-ulcerosa", "Colitis ulcerosa"], ["diarrea", "Diarrea"], ["dispepsia", "Dispepsia"], ["dispepsia-biliar", "Dispepsia biliar"], ["disquinesia-biliar", "Disquinesia biliar"], ["diverticulitis-intestinal", "Diverticulitis intestinal"], ["encefalopatia-hepatica", "Encefalopatía hepática"], ["enfermedad-de-crohn", "Enfermedad de Crohn"], ["enfermedad-inflamatoria-intestinal", "Enfermedad inflamatoria intestinal"], ["enfermedad-periodontal", "Enfermedad periodontal"], ["enfermedad-por-reflujo-gastrico-esofagico", "Enfermedad por reflujo gástrico esofágico"], ["enterocolitis", "Enterocolitis"], ["esofagitis-eosinofila", "Esofagitis eosinófila"], ["estomatitis", "Estomatitis"], ["estrenimiento", "Estreñimiento"], ["fistula-anal", "Fístula anal"], ["fistula-pancreatica", "Fístula pancreática"], ["gases", "Gases"], ["gastritis", "Gastritis"], ["gastritis-cronica", "Gastritis crónica"], ["gastritis-clorica", "Gastritis clórica"], ["gastroenteritis", "Gastroenteritis"], ["gastroparesia", "Gastroparesia"], ["gingivitis", "Gingivitis"], ["hemorragia-de-esofago", "Hemorragia de esófago"], ["hemorragia-digestiva", "Hemorragia digestiva"], ["hemorragia-gastrointestinal", "Hemorragia gastrointestinal"], ["hemorroides", "Hemorroides"], ["hepatitis", "Hepatitis"], ["hepatitis-autoinmune", "Hepatitis autoinmune"], ["hepatitis-cronica", "Hepatitis crónica"], ["hepatopatia", "Hepatopatía"], ["hepatopatia-alcoholica", "Hepatopatía alcohólica"], ["hepatotoxicidad", "Hepatotoxicidad"], ["higado-graso", "Hígado graso"], ["hiperacidez-gastrica", "Hiperacidez gástrica"], ["hipertension-portal", "Hipertensión portal"], ["ileo-paralitico", "Íleo paralítico"], ["infeccion-bucal", "Infección bucal"], ["infeccion-de-vias-hepatobiliares", "Infección de vías hepatobiliares"], ["infeccion-dental", "Infección dental"], ["infecciones-intraabdominales", "Infecciones intraabdominales"], ["litiasis-biliar", "Litiasis biliar"], ["malabsorcion-intestinal", "Malabsorción intestinal"], ["obstruccion-intestinal", "Obstrucción intestinal"], ["odontalgia", "Odontalgia"], ["pancreatitis", "Pancreatitis"], ["pancreatitis-aguda", "Pancreatitis aguda"], ["peritonitis", "Peritonitis"], ["proctitis", "Proctitis"], ["prurito-colestasico", "Prurito colestásico"], ["quelitis", "Quelitis"], ["reflujo-gastroesofagico", "Reflujo gastroesofágico"], ["sequedad-de-boca", "Sequedad de boca"], ["sindrome-de-budd-chiari", "Síndrome de Budd-Chiari"], ["sindrome-de-intestino-corto", "Síndrome de intestino corto"], ["sindrome-de-intestino-irritable", "Síndrome de intestino irritable"], ["sindrome-hepatorrenal", "Síndrome hepatorrenal"], ["ulcera-bucal", "Úlcera bucal"], ["ulcera-duodenal", "Úlcera duodenal"], ["ulcera-gastrica", "Úlcera gástrica"], ["ulcera-intestinal", "Úlcera intestinal"], ["ulcera-peptica", "Úlcera péptica"]], "genitourinario": [["alteraciones-de-la-eyaculacion", "Alteraciones de la eyaculación"], ["balanitis", "Balanitis"], ["balanopostitis", "Balanopostitis"], ["calculos-renales", "Cálculos renales"], ["calculos-urinarios", "Cálculos urinarios"], ["cistitis", "Cistitis"], ["colico-nefritico", "Cólico nefrítico"], ["disfuncion-erectil", "Disfunción eréctil"], ["dispareunia", "Dispareunia"], ["enfermedad-de-peyronie", "Enfermedad de Peyronie"], ["enuresis-nocturna", "Enuresis nocturna"], ["epididimitis", "Epididimitis"], ["fibrosis-retroperitoneal", "Fibrosis retroperitoneal"], ["glomerulonefritis", "Glomerulonefritis"], ["glomerulopatia-por-complemento-c3", "Glomerulopatía por complemento C3"], ["hiperparatiroidismo-secundario-de-origen-renal", "Hiperparatiroidismo secundario de origen renal"], ["hiperplasia-benigna-de-prostata", "Hiperplasia benigna de próstata"], ["hiperplasia-prostatica", "Hiperplasia prostática"], ["impotencia-sexual", "Impotencia sexual"], ["infeccion-genitourinaria", "Infección genitourinaria"], ["infecciones-del-tracto-urinario", "Infecciones del tracto urinario"], ["infertilidad-masculina", "Infertilidad masculina"], ["insuficiencia-renal", "Insuficiencia renal"], ["insuficiencia-renal-cronica", "Insuficiencia renal crónica"], ["nefritis", "Nefritis"], ["nefropatia", "Nefropatía"], ["oligospermia", "Oligospermia"], ["orquitis", "Orquitis"], ["pielonefritis-aguda", "Pielonefritis aguda"], ["prostatitis", "Prostatitis"], ["sindrome-nefrotico", "Síndrome nefrótico"], ["uretritis", "Uretritis"], ["uretritis-no-gonococica", "Uretritis no gonocócica"], ["vejiga-hiperactiva", "Vejiga hiperactiva"], ["vejiga-neurogena", "Vejiga neurógena"]], "musculo": [["acondroplasia", "Acondroplasia"], ["amiloidosis-heredofamiliar-no-neuropatica", "Amiloidosis heredofamiliar no neuropática"], ["arteritis-de-celulas-gigantes", "Arteritis de células gigantes"], ["artralgia", "Artralgia"], ["artritis", "Artritis"], ["artritis-gotosa", "Artritis gotosa"], ["artritis-infecciosa", "Artritis infecciosa"], ["artritis-reumatoide", "Artritis reumatoide"], ["artritis-reumatoide-juvenil", "Artritis reumatoide juvenil"], ["artropatia-neurogena", "Artropatía neurógena"], ["artrosis", "Artrosis"], ["atrofia-muscular", "Atrofia muscular"], ["bursitis", "Bursitis"], ["capsulitis", "Capsulitis"], ["contractura-muscular", "Contractura muscular"], ["contusion", "Contusión"], ["dermatomiositis", "Dermatomiositis"], ["dermatopolimiositis", "Dermatopolimiositis"], ["dolor-de-espalda", "Dolor de espalda"], ["dolor-oseo", "Dolor óseo"], ["dolor-osteomuscular", "Dolor osteomuscular"], ["enfermedad-de-paget", "Enfermedad de Paget"], ["epicondilitis", "Epicondilitis"], ["esclerosis-sistemica", "Esclerosis sistémica"], ["espasmo-abdominal", "Espasmo abdominal"], ["espasmo-muscular", "Espasmo muscular"], ["espondilitis-anquilosante", "Espondilitis anquilosante"], ["espondiloartritis", "Espondiloartritis"], ["fractura-de-cadera", "Fractura de cadera"], ["fractura-de-tibia", "Fractura de tibia"], ["fractura-osea", "Fractura ósea"], ["fractura-vertebral", "Fractura vertebral"], ["gota", "Gota"], ["granulomatosis", "Granulomatosis"], ["granulomatosis-de-wegener", "Granulomatosis de Wegener"], ["hernia-discal", "Hernia discal"], ["infeccion-articular", "Infección articular"], ["infeccion-osea", "Infección ósea"], ["lumbalgia", "Lumbalgia"], ["lupus-eritematoso", "Lupus eritematoso"], ["lupus-eritematoso-discoide", "Lupus eritematoso discoide"], ["lupus-eritematoso-sistemico", "Lupus eritematoso sistémico"], ["luxacion", "Luxación"], ["mialgia", "Mialgia"], ["miositis", "Miositis"], ["miotonia", "Miotonía"], ["osteodistrofia", "Osteodistrofia"], ["osteomalacia", "Osteomalacia"], ["osteomielitis", "Osteomielitis"], ["osteoporosis", "Osteoporosis"], ["osteoporosis-inducida-por-corticosteroides", "Osteoporosis inducida por corticosteroides"], ["osteoporosis-posmenopausica", "Osteoporosis posmenopáusica"], ["pie-equino", "Pie equino"], ["poliarteritis-nudosa", "Poliarteritis nudosa"], ["poliartritis", "Poliartritis"], ["policondritis", "Policondritis"], ["policondritis-recidivante", "Policondritis recidivante"], ["polimialgia-reumatica", "Polimialgia reumática"], ["polimiositis", "Polimiositis"], ["sindrome-de-behcet", "Síndrome de Behçet"], ["sindrome-de-hombro-mano", "Síndrome de hombro-mano"], ["sindrome-de-kawasaki", "Síndrome de Kawasaki"], ["sindrome-de-reiter", "Síndrome de Reiter"], ["sindrome-de-sjogren", "Síndrome de Sjögren"], ["sinovitis", "Sinovitis"], ["tendinitis", "Tendinitis"], ["tenosinovitis", "Tenosinovitis"]], "respiratorio": [["absceso-pulmonar", "Absceso pulmonar"], ["amigdalitis", "Amigdalitis"], ["amigdalitis-aguda", "Amigdalitis aguda"], ["amigdalitis-estreptococica", "Amigdalitis estreptocócica"], ["antracosis", "Antracosis"], ["asma", "Asma"], ["asma-eosinofilica", "Asma eosinofílica"], ["atelectasia", "Atelectasia"], ["beriliosis", "Beriliosis"], ["bronquiectasia", "Bronquiectasia"], ["bronquitis", "Bronquitis"], ["bronquitis-aguda", "Bronquitis aguda"], ["bronquitis-cronica", "Bronquitis crónica"], ["crisis-asmatica", "Crisis asmática"], ["derrame-pleural", "Derrame pleural"], ["edema-pulmonar", "Edema pulmonar"], ["enfermedad-pulmonar-obstructiva-cronica", "Enfermedad pulmonar obstructiva crónica"], ["enfisema-pulmonar", "Enfisema pulmonar"], ["espasmo-bronquial", "Espasmo bronquial"], ["estado-asmatico", "Estado asmático"], ["faringitis", "Faringitis"], ["faringitis-aguda", "Faringitis aguda"], ["faringitis-estreptococica", "Faringitis estreptocócica"], ["gripe", "Gripe"], ["hiperviscosidad-bronquial", "Hiperviscosidad bronquial"], ["infeccion-por-virus-respiratorio-sincitial", "Infección por virus respiratorio sincitial"], ["infeccion-respiratoria", "Infección respiratoria"], ["infeccion-respiratoria-superior", "Infección respiratoria superior"], ["linfangioleiomiomatosis", "Linfangioleiomiomatosis"], ["neumonia", "Neumonía"], ["neumonia-adquirida-en-la-comunidad", "Neumonía adquirida en la comunidad"], ["neumonia-intersticial", "Neumonía intersticial"], ["neumonia-nosocomial", "Neumonía nosocomial"], ["neumonia-por-aspiracion", "Neumonía por aspiración"], ["neumonia-por-clamidias", "Neumonía por clamidias"], ["neumonia-por-haemophilus-influenzae", "Neumonía por Haemophilus influenzae"], ["neumonia-por-micoplasma", "Neumonía por micoplasma"], ["piotorax", "Piotórax"], ["polipos-nasales", "Pólipos nasales"], ["resfriado-comun", "Resfriado común"], ["rinitis", "Rinitis"], ["rinitis-alergica", "Rinitis alérgica"], ["rinitis-alergica-estacional", "Rinitis alérgica estacional"], ["rinitis-alergica-perenne", "Rinitis alérgica perenne"], ["rinitis-vasomotora", "Rinitis vasomotora"], ["rinosinusitis-cronica-con-poliposis-nasal", "Rinosinusitis crónica con poliposis nasal"], ["sinusitis", "Sinusitis"], ["sinusitis-aguda", "Sinusitis aguda"], ["sinusitis-cronica", "Sinusitis crónica"], ["tos-asmatica", "Tos asmática"]], "cirugia": [["anestesia-basal", "Anestesia basal"], ["anestesia-epidural", "Anestesia epidural"], ["anestesia-espinal", "Anestesia espinal"], ["anestesia-general", "Anestesia general"], ["anestesia-local", "Anestesia local"], ["bypass", "Bypass"], ["cirugia", "Cirugía"], ["dolor-posoperatorio", "Dolor posoperatorio"], ["extraccion-dental", "Extracción dental"], ["induccion-y-mantenimiento-de-la-anestesia", "Inducción y mantenimiento de la anestesia"], ["movilizacion-de-celulas-progenitoras-de-sangre-periferica", "Movilización de células progenitoras de sangre periférica"]], "diagnostico": [["angiografia", "Angiografía"], ["arteriografia", "Arteriografía"], ["artrografia", "Artrografía"], ["cisternografia", "Cisternografía"], ["cistouretrografia-con-angiografia", "Cistouretrografía con angiografía"], ["doppler", "Doppler"], ["ecocardiografia-de-contraste", "Ecocardiografía de contraste"], ["ecografia", "Ecografía"], ["endoscopia", "Endoscopia"], ["gammagrafia", "Gammagrafía"], ["marcador-radiactivo", "Marcador radiactivo"], ["midriasis-de-examen", "Midriasis de examen"], ["mielografia", "Mielografía"], ["pielografia", "Pielografía"], ["resonancia-magnetica-nuclear", "Resonancia magnética nuclear"], ["sedacion-para-tecnicas-diagnosticas-y-quirurgicas", "Sedación para técnicas diagnósticas y quirúrgicas"], ["tomografia-axial-computarizada", "Tomografía axial computarizada"], ["tomografia-por-emision-de-positrones-pet", "Tomografía por emisión de positrones (PET)"], ["urografia", "Urografía"], ["vaciado-gastrointestinal", "Vaciado gastrointestinal"], ["venografia", "Venografía"], ["ventriculografia", "Ventriculografía"]], "embarazo": [["aborto", "Aborto"], ["diabetes-gestacional", "Diabetes gestacional"], ["eclampsia", "Eclampsia"], ["galactorrea", "Galactorrea"], ["grietas-del-pezon", "Grietas del pezón"], ["mola-hidatiforme", "Mola hidatiforme"], ["parto-prematuro", "Parto prematuro"], ["preeclampsia", "Preeclampsia"], ["sepsis-puerperal", "Sepsis puerperal"], ["sufrimiento-fetal", "Sufrimiento fetal"], ["supresion-de-la-lactancia", "Supresión de la lactancia"]], "endocrino": [["acidosis", "Acidosis"], ["acidosis-metabolica", "Acidosis metabólica"], ["acromegalia", "Acromegalia"], ["adenocarcinoma-de-pancreas", "Adenocarcinoma de páncreas"], ["alcalosis", "Alcalosis"], ["alcalosis-metabolica", "Alcalosis metabólica"], ["amiloidosis", "Amiloidosis"], ["bocio", "Bocio"], ["bocio-nodular-toxico", "Bocio nodular tóxico"], ["cetoacidosis-diabetica", "Cetoacidosis diabética"], ["cetosis", "Cetosis"], ["cistinosis", "Cistinosis"], ["cistinuria", "Cistinuria"], ["coma-mixedematoso", "Coma mixedematoso"], ["control-del-peso", "Control del peso"], ["coproporfiria-hereditaria", "Coproporfiria hereditaria"], ["cretinismo", "Cretinismo"], ["deficit-de-acido-folico", "Déficit de ácido fólico"], ["deficit-de-acido-pantotenico", "Déficit de ácido pantoténico"], ["deficit-de-alfa-1-antitripsina", "Déficit de alfa-1 antitripsina"], ["deficit-de-biotina", "Déficit de biotina"], ["deficit-de-calcio", "Déficit de calcio"], ["deficit-de-carnitina", "Déficit de carnitina"], ["deficit-de-cianocobalamina", "Déficit de cianocobalamina"], ["deficit-de-hormona-del-crecimiento", "Déficit de hormona del crecimiento"], ["deficit-de-lipasa-acida-lisosomal", "Déficit de lipasa ácida lisosomal"], ["deficit-de-magnesio", "Déficit de magnesio"], ["deficit-de-minerales", "Déficit de minerales"], ["deficit-de-piridoxina", "Déficit de piridoxina"], ["deficit-de-potasio", "Déficit de potasio"], ["deficit-de-proteina-c", "Déficit de proteína C"], ["deficit-de-tiamina", "Déficit de tiamina"], ["deficit-de-vitamina-a", "Déficit de vitamina A"], ["deficit-de-vitamina-b", "Déficit de vitamina B"], ["deficit-de-vitamina-c", "Déficit de vitamina C"], ["deficit-de-vitamina-d", "Déficit de vitamina D"], ["deficit-de-vitamina-e", "Déficit de vitamina E"], ["deficit-de-yodo", "Déficit de yodo"], ["desequilibrio-hidroelectrolitico", "Desequilibrio hidroelectrolítico"], ["deshidratacion", "Deshidratación"], ["desnutricion", "Desnutrición"], ["diabetes", "Diabetes"], ["diabetes-insipida", "Diabetes insípida"], ["diabetes-mellitus-tipo-1", "Diabetes mellitus tipo 1"], ["diabetes-mellitus-tipo-2", "Diabetes mellitus tipo 2"], ["dislipidemia", "Dislipidemia"], ["dislipidemia-mixta", "Dislipidemia mixta"], ["edema-macular-diabetico", "Edema macular diabético"], ["encefalopatia-de-wernicke", "Encefalopatía de Wernicke"], ["enfermedad-de-addison", "Enfermedad de Addison"], ["enfermedad-de-cushing", "Enfermedad de Cushing"], ["enfermedad-de-fabry", "Enfermedad de Fabry"], ["enfermedad-de-gaucher", "Enfermedad de Gaucher"], ["enfermedad-de-niemann-pick", "Enfermedad de Niemann-Pick"], ["enfermedad-de-pompe", "Enfermedad de Pompe"], ["enfermedad-de-wilson", "Enfermedad de Wilson"], ["esfingolipidosis", "Esfingolipidosis"], ["fenilcetonuria", "Fenilcetonuria"], ["fibrosis-quistica", "Fibrosis quística"], ["hemocromatosis", "Hemocromatosis"], ["hemosiderosis", "Hemosiderosis"], ["hiperaldosteronismo", "Hiperaldosteronismo"], ["hiperamonemia", "Hiperamonemia"], ["hiperarginemia", "Hiperarginemia"], ["hipercalcemia", "Hipercalcemia"], ["hipercolesterolemia", "Hipercolesterolemia"], ["hipercolesterolemia-familiar-heterocigotica", "Hipercolesterolemia familiar heterocigótica"], ["hipercolesterolemia-familiar-homocigotica", "Hipercolesterolemia familiar homocigótica"], ["hiperfenilalaninemia", "Hiperfenilalaninemia"], ["hiperfosfatemia", "Hiperfosfatemia"], ["hipermagnesemia", "Hipermagnesemia"], ["hiperoxaluria", "Hiperoxaluria"], ["hiperparatiroidismo", "Hiperparatiroidismo"], ["hiperplasia-suprarrenal-congenita", "Hiperplasia suprarrenal congénita"], ["hiperpotasemia", "Hiperpotasemia"], ["hiperprolactinemia", "Hiperprolactinemia"], ["hipertiroidismo", "Hipertiroidismo"], ["hipertrigliceridemia", "Hipertrigliceridemia"], ["hiperuricemia", "Hiperuricemia"], ["hipocalcemia", "Hipocalcemia"], ["hipofosfatemia", "Hipofosfatemia"], ["hipofosfatemia-familiar", "Hipofosfatemia familiar"], ["hipoglucemia", "Hipoglucemia"], ["hipogonadismo", "Hipogonadismo"], ["hipomagnesemia", "Hipomagnesemia"], ["hiponatremia", "Hiponatremia"], ["hipoparatiroidismo", "Hipoparatiroidismo"], ["hipopotasemia", "Hipopotasemia"], ["hipotiroidismo", "Hipotiroidismo"], ["hipovitaminosis", "Hipovitaminosis"], ["hipovolemia", "Hipovolemia"], ["insuficiencia-corticosuprarrenal", "Insuficiencia corticosuprarrenal"], ["insuficiencia-corticosuprarrenal-secundaria", "Insuficiencia corticosuprarrenal secundaria"], ["insuficiencia-hipofisaria-de-acth", "Insuficiencia hipofisaria de ACTH"], ["insuficiencia-ovarica", "Insuficiencia ovárica"], ["insuficiencia-testicular", "Insuficiencia testicular"], ["intolerancia-a-la-lactosa", "Intolerancia a la lactosa"], ["mucopolisacaridosis", "Mucopolisacaridosis"], ["mucopolisacaridosis-tipo-1", "Mucopolisacaridosis tipo 1"], ["mucopolisacaridosis-tipo-2", "Mucopolisacaridosis tipo 2"], ["mucopolisacaridosis-tipo-4", "Mucopolisacaridosis tipo 4"], ["mucopolisacaridosis-tipo-7", "Mucopolisacaridosis tipo 7"], ["nefropatia-diabetica", "Nefropatía diabética"], ["neuropatia-diabetica", "Neuropatía diabética"], ["obesidad", "Obesidad"], ["polineuropatia-amiloide-familiar", "Polineuropatía amiloide familiar"], ["porfiria", "Porfiria"], ["porfiria-aguda-intermitente", "Porfiria aguda intermitente"], ["porfiria-hepatica-aguda", "Porfiria hepática aguda"], ["porfiria-por-deficiencia-de-la-deshidratasa", "Porfiria por deficiencia de la deshidratasa"], ["porfiria-variegata", "Porfiria variegata"], ["pubertad-precoz", "Pubertad precoz"], ["retinopatia-diabetica", "Retinopatía diabética"], ["sindrome-adrenogenital", "Síndrome adrenogenital"], ["sindrome-de-cushing", "Síndrome de Cushing"], ["sindrome-de-lesch-nyhan", "Síndrome de Lesch-Nyhan"], ["sindrome-de-lisis-tumoral", "Síndrome de lisis tumoral"], ["sindrome-de-secrecion-inadecuada-de-hormona-antidiuretica", "Síndrome de secreción inadecuada de hormona antidiurética"], ["sindrome-de-zollinger-ellison", "Síndrome de Zollinger-Ellison"], ["sobrecarga-de-aluminio", "Sobrecarga de aluminio"], ["sobrecarga-de-hierro", "Sobrecarga de hierro"], ["sobrepeso", "Sobrepeso"], ["tiroiditis", "Tiroiditis"], ["tirosinemia-hereditaria-de-tipo-1", "Tirosinemia hereditaria de tipo 1"], ["trastornos-del-ciclo-de-la-urea", "Trastornos del ciclo de la urea"], ["trastornos-tiroideos", "Trastornos tiroideos"], ["virilizacion", "Virilización"]], "infecciosas": [["absceso", "Absceso"], ["actinomicosis", "Actinomicosis"], ["amebiasis", "Amebiasis"], ["amebiasis-extraintestinal", "Amebiasis extraintestinal"], ["amebiasis-hepatica", "Amebiasis hepática"], ["amebiasis-intestinal", "Amebiasis intestinal"], ["amebiasis-intestinal-cronica", "Amebiasis intestinal crónica"], ["anquilostomiasis", "Anquilostomiasis"], ["ascariasis", "Ascariasis"], ["aspergilosis", "Aspergilosis"], ["balanitis-por-candida", "Balanitis por cándida"], ["bartonelosis", "Bartonelosis"], ["blastomicosis", "Blastomicosis"], ["brucelosis", "Brucelosis"], ["candidiasis", "Candidiasis"], ["candidiasis-de-la-piel", "Candidiasis de la piel"], ["candidiasis-esofagica", "Candidiasis esofágica"], ["candidiasis-faringea", "Candidiasis faríngea"], ["candidiasis-intestinal", "Candidiasis intestinal"], ["candidiasis-oral", "Candidiasis oral"], ["candidiasis-sistemica", "Candidiasis sistémica"], ["candidiasis-vaginal", "Candidiasis vaginal"], ["capilariasis", "Capilariasis"], ["carbunco", "Carbunco"], ["chancro-blando", "Chancro blando"], ["coccidioidomicosis", "Coccidioidomicosis"], ["cisticercosis", "Cisticercosis"], ["colera", "Cólera"], ["colitis-pseudomembranosa", "Colitis pseudomembranosa"], ["condiloma-acuminado", "Condiloma acuminado"], ["covid-19", "COVID-19"], ["criptococosis", "Criptococosis"], ["cromomicosis", "Cromomicosis"], ["dengue", "Dengue"], ["dermatomicosis", "Dermatomicosis"], ["desinfeccion", "Desinfección"], ["difteria", "Difteria"], ["disenteria-amebiana-aguda", "Disentería amebiana aguda"], ["encefalitis-japonesa", "Encefalitis japonesa"], ["enfermedad-de-chagas", "Enfermedad de Chagas"], ["enfermedad-de-lyme", "Enfermedad de Lyme"], ["enteritis-por-campylobacter", "Enteritis por Campylobacter"], ["enteritis-por-rotavirus", "Enteritis por rotavirus"], ["enterobiasis", "Enterobiasis"], ["equinococosis", "Equinococosis"], ["erisipela", "Erisipela"], ["esporotricosis", "Esporotricosis"], ["exacerbaciones-en-epoc", "Exacerbaciones en EPOC"], ["exacerbaciones-en-fibrosis-quistica", "Exacerbaciones en fibrosis quística"], ["fascioliasis", "Fascioliasis"], ["fiebre-amarilla", "Fiebre amarilla"], ["fiebre-de-las-montanas-rocosas", "Fiebre de las Montañas Rocosas"], ["fiebre-paratifoidea", "Fiebre paratifoidea"], ["fiebre-recurrente", "Fiebre recurrente"], ["fiebre-tifoidea", "Fiebre tifoidea"], ["filariasis", "Filariasis"], ["fusariosis", "Fusariosis"], ["gangrena-gaseosa", "Gangrena gaseosa"], ["giardiasis", "Giardiasis"], ["gonorrea", "Gonorrea"], ["granuloma-inguinal", "Granuloma inguinal"], ["helmintiasis", "Helmintiasis"], ["hepatitis-a", "Hepatitis A"], ["hepatitis-b", "Hepatitis B"], ["hepatitis-c", "Hepatitis C"], ["hepatitis-d", "Hepatitis D"], ["hepatitis-viral", "Hepatitis viral"], ["herpes-genital", "Herpes genital"], ["herpes-simple-labial", "Herpes simple labial"], ["herpes-simple-oftalmico", "Herpes simple oftálmico"], ["herpes-zoster", "Herpes zóster"], ["herpes-zoster-ocular", "Herpes zóster ocular"], ["histoplasmosis", "Histoplasmosis"], ["infeccion", "Infección"], ["infeccion-bacteriana", "Infección bacteriana"], ["infeccion-estafilococica", "Infección estafilocócica"], ["infeccion-estreptococica", "Infección estreptocócica"], ["infeccion-fungica", "Infección fúngica"], ["infeccion-meningococica", "Infección meningocócica"], ["infeccion-micobacteriana", "Infección micobacteriana"], ["infeccion-parasitaria", "Infección parasitaria"], ["infeccion-por-bacterias-anaerobias", "Infección por bacterias anaerobias"], ["infeccion-por-citomegalovirus", "Infección por citomegalovirus"], ["infeccion-por-clostridium-difficile", "Infección por Clostridium difficile"], ["infeccion-por-helicobacter-pylori", "Infección por Helicobacter pylori"], ["infeccion-por-herpesvirus", "Infección por herpesvirus"], ["infeccion-por-herpesvirus-simple", "Infección por herpesvirus simple"], ["infeccion-por-mycobacterium-avium-intracellulare-complex", "Infección por Mycobacterium avium-intracellulare complex"], ["infeccion-por-protozoos", "Infección por protozoos"], ["infeccion-por-vih", "Infección por VIH"], ["infeccion-por-virus-del-papiloma", "Infección por virus del papiloma"], ["infeccion-viral", "Infección viral"], ["infecciones-digestivas", "Infecciones digestivas"], ["legionelosis", "Legionelosis"], ["leishmaniasis", "Leishmaniasis"], ["leishmaniasis-cutanea", "Leishmaniasis cutánea"], ["leishmaniasis-mucocutanea", "Leishmaniasis mucocutánea"], ["leishmaniasis-visceral", "Leishmaniasis visceral"], ["lepra", "Lepra"], ["linfogranuloma-venereo", "Linfogranuloma venéreo"], ["listeriosis", "Listeriosis"], ["meningitis-criptococica", "Meningitis criptocócica"], ["meningitis-meningococica", "Meningitis meningocócica"], ["micetoma", "Micetoma"], ["neumocistosis", "Neumocistosis"], ["nocardiosis", "Nocardiosis"], ["oniquia-por-candidas", "Oniquia por cándidas"], ["otitis-externa-por-candidas", "Otitis externa por cándidas"], ["paludismo", "Paludismo"], ["paracoccidioidomicosis", "Paracoccidioidomicosis"], ["peste", "Peste"], ["pie-de-atleta", "Pie de atleta"], ["pitiriasis-versicolor", "Pitiriasis versicolor"], ["poliomielitis", "Poliomielitis"], ["psitacosis", "Psitacosis"], ["queilitis-por-candidas", "Queilitis por cándidas"], ["queratitis-fungica", "Queratitis fúngica"], ["queratitis-por-herpesvirus-simple", "Queratitis por herpesvirus simple"], ["rabia", "Rabia"], ["rinitis-por-citomegalovirus", "Rinitis por citomegalovirus"], ["rubeola", "Rubéola"], ["sarampion", "Sarampión"], ["sarna", "Sarna"], ["sepsis", "Sepsis"], ["sepsis-estafilococica", "Sepsis estafilocócica"], ["sepsis-meningococica", "Sepsis meningocócica"], ["shigelosis", "Shigelosis"], ["sifilis", "Sífilis"], ["teniasis", "Teniasis"], ["tetanos", "Tétanos"], ["tifus", "Tifus"], ["tina-de-la-barba", "Tiña de la barba"], ["tina-de-la-mano", "Tiña de la mano"], ["tina-de-las-unas", "Tiña de las uñas"], ["tina-del-cuero-cabelludo", "Tiña del cuero cabelludo"], ["tina-del-cuerpo", "Tiña del cuerpo"], ["tina-inguinal", "Tiña inguinal"], ["tosferina", "Tosferina"], ["toxoplasmosis", "Toxoplasmosis"], ["tracoma", "Tracoma"], ["tricomoniasis", "Tricomoniasis"], ["tricuriasis", "Tricuriasis"], ["tripanosomiasis-gambiense", "Tripanosomiasis gambiense"], ["triquinosis", "Triquinosis"], ["tuberculosis", "Tuberculosis"], ["tuberculosis-cutanea", "Tuberculosis cutánea"], ["tuberculosis-ocular", "Tuberculosis ocular"], ["tuberculosis-pulmonar", "Tuberculosis pulmonar"], ["tularemia", "Tularemia"], ["uretritis-gonococica", "Uretritis gonocócica"], ["varicela", "Varicela"], ["verrugas", "Verrugas"]], "factores": [["trasplante", "Trasplante"], ["trasplante-alogenico-de-celulas-madre-hematopoyeticas", "Trasplante alogénico de células madre hematopoyéticas"], ["trasplante-alogenico-de-medula-osea", "Trasplante alogénico de médula ósea"], ["trasplante-de-celulas-madre-hematopoyeticas", "Trasplante de células madre hematopoyéticas"], ["trasplante-de-corazon", "Trasplante de corazón"], ["trasplante-de-corazon-y-pulmon", "Trasplante de corazón y pulmón"], ["trasplante-de-higado", "Trasplante de hígado"], ["trasplante-de-intestino", "Trasplante de intestino"], ["trasplante-de-medula-osea", "Trasplante de médula ósea"], ["trasplante-de-organos-solidos", "Trasplante de órganos sólidos"], ["trasplante-de-pancreas", "Trasplante de páncreas"], ["trasplante-de-pulmon", "Trasplante de pulmón"], ["trasplante-de-rinon", "Trasplante de riñón"]], "ginecologia": [["absceso-tubo-ovarico", "Absceso tubo-ovárico"], ["amenorrea", "Amenorrea"], ["amenorrea-secundaria", "Amenorrea secundaria"], ["anticoncepcion", "Anticoncepción"], ["anticoncepcion-de-urgencia", "Anticoncepción de urgencia"], ["atonia-uterina", "Atonía uterina"], ["cervicitis", "Cervicitis"], ["craurosis-vulvar", "Craurosis vulvar"], ["dismenorrea", "Dismenorrea"], ["dismenorrea-primaria", "Dismenorrea primaria"], ["endometriosis", "Endometriosis"], ["endometritis", "Endometritis"], ["enfermedad-inflamatoria-pelvica", "Enfermedad inflamatoria pélvica"], ["estimulacion-ovarica", "Estimulación ovárica"], ["hemorragia-obstetrica", "Hemorragia obstétrica"], ["higiene-intima", "Higiene íntima"], ["induccion-de-la-ovulacion", "Inducción de la ovulación"], ["induccion-del-parto", "Inducción del parto"], ["infeccion-vaginal", "Infección vaginal"], ["infertilidad", "Infertilidad"], ["infertilidad-femenina", "Infertilidad femenina"], ["legrado", "Legrado"], ["menopausia", "Menopausia"], ["menorragia", "Menorragia"], ["menorragia-idiopatica", "Menorragia idiopática"], ["metrorragia", "Metrorragia"], ["salpingitis", "Salpingitis"], ["secrecion-vaginal-excesiva", "Secreción vaginal excesiva"], ["sequedad-vaginal", "Sequedad vaginal"], ["sindrome-premenstrual", "Síndrome premenstrual"], ["tension-mamaria", "Tensión mamaria"], ["tincion-de-papanicolaou", "Tinción de Papanicolaou"], ["vaginitis", "Vaginitis"], ["ulcera-genital", "Úlcera genital"], ["vaginitis-atrofica-posmenopausica", "Vaginitis atrófica posmenopáusica"], ["vaginosis-bacteriana", "Vaginosis bacteriana"], ["vulvovaginitis", "Vulvovaginitis"]], "inmunologia": [["alergia", "Alergia"], ["alveolitis-alergica-extrinseca", "Alveolitis alérgica extrínseca"], ["colagenosis", "Colagenosis"], ["reacciones-de-hipersensibilidad", "Reacciones de hipersensibilidad"], ["urticaria", "Urticaria"]], "malformaciones": [["mastocitosis", "Mastocitosis"], ["rinon-poliquistico-autosomico-dominante", "Riñón poliquístico autosómico dominante"], ["tetralogia-de-fallot", "Tetralogía de Fallot"]], "mentales": [["agorafobia", "Agorafobia"], ["alcoholismo-cronico", "Alcoholismo crónico"], ["alteraciones-de-la-libido", "Alteraciones de la libido"], ["ansiedad", "Ansiedad"], ["ataques-de-panico", "Ataques de pánico"], ["aumento-de-la-libido", "Aumento de la libido"], ["bulimia", "Bulimia"], ["delirio", "Delirio"], ["delirium-tremens", "Delirium tremens"], ["demencia", "Demencia"], ["dependencia-a-opiaceos", "Dependencia a opiáceos"], ["dependencia-al-tabaco", "Dependencia al tabaco"], ["depresion", "Depresión"], ["deterioro-cognitivo", "Deterioro cognitivo"], ["drogodependencia", "Drogodependencia"], ["esquizofrenia", "Esquizofrenia"], ["estres", "Estrés"], ["estres-postraumatico", "Estrés postraumático"], ["eyaculacion-precoz", "Eyaculación precoz"], ["fobia-social", "Fobia social"], ["fobias", "Fobias"], ["hipocondria", "Hipocondría"], ["mania", "Manía"], ["neurosis", "Neurosis"], ["psicosis", "Psicosis"], ["sindrome-de-abstinencia", "Síndrome de abstinencia"], ["sindrome-de-abstinencia-alcoholica", "Síndrome de abstinencia alcohólica"], ["sindrome-de-tourette", "Síndrome de Tourette"], ["tabaquismo", "Tabaquismo"], ["tics", "Tics"], ["trastorno-bipolar", "Trastorno bipolar"], ["trastorno-de-ansiedad-generalizada", "Trastorno de ansiedad generalizada"], ["trastorno-de-deficit-de-atencion-e-hipercinetico", "Trastorno de déficit de atención e hipercinético"], ["trastorno-esquizoafectivo", "Trastorno esquizoafectivo"], ["trastorno-obsesivo-compulsivo", "Trastorno obsesivo-compulsivo"], ["trastornos-de-la-conducta", "Trastornos de la conducta"], ["trastornos-de-la-conducta-alimentaria", "Trastornos de la conducta alimentaria"]], "neoplasias": [["adenoma-tirotropo", "Adenoma tirotropo"], ["cancer", "Cáncer"], ["cancer-de-ano", "Cáncer de ano"], ["cancer-de-celulas-escamosas", "Cáncer de células escamosas"], ["cancer-de-cervix", "Cáncer de cérvix"], ["cancer-de-colon", "Cáncer de colon"], ["cancer-de-corteza-suprarrenal", "Cáncer de corteza suprarrenal"], ["cancer-de-endometrio", "Cáncer de endometrio"], ["cancer-de-esofago", "Cáncer de esófago"], ["cancer-de-estomago", "Cáncer de estómago"], ["cancer-de-glandulas-endocrinas", "Cáncer de glándulas endocrinas"], ["cancer-de-higado", "Cáncer de hígado"], ["cancer-de-hueso", "Cáncer de hueso"], ["cancer-de-intestino", "Cáncer de intestino"], ["cancer-de-mama", "Cáncer de mama"], ["cancer-de-mama-her2-negativo", "Cáncer de mama HER2 negativo"], ["cancer-de-mama-her2-positivo", "Cáncer de mama HER2 positivo"], ["cancer-de-organos-digestivos", "Cáncer de órganos digestivos"], ["cancer-de-organos-genitales-femeninos", "Cáncer de órganos genitales femeninos"], ["cancer-de-organos-genitales-masculinos", "Cáncer de órganos genitales masculinos"], ["cancer-de-organos-respiratorios", "Cáncer de órganos respiratorios"], ["cancer-de-ovario", "Cáncer de ovario"], ["cancer-de-pancreas", "Cáncer de páncreas"], ["cancer-de-paratiroides", "Cáncer de paratiroides"], ["cancer-de-peritoneo", "Cáncer de peritoneo"], ["cancer-de-piel", "Cáncer de piel"], ["cancer-de-prostata", "Cáncer de próstata"], ["cancer-de-pulmon", "Cáncer de pulmón"], ["cancer-de-pulmon-microcitico", "Cáncer de pulmón microcítico"], ["cancer-de-pulmon-no-microcitico", "Cáncer de pulmón no microcítico"], ["cancer-de-recto", "Cáncer de recto"], ["cancer-de-retina", "Cáncer de retina"], ["cancer-de-rinon", "Cáncer de riñón"], ["cancer-de-tejidos-blandos-de-cabeza-y-cuello", "Cáncer de tejidos blandos de cabeza y cuello"], ["cancer-de-tejidos-mesoteliales-y-tejidos-blandos", "Cáncer de tejidos mesoteliales y tejidos blandos"], ["cancer-de-testiculo", "Cáncer de testículo"], ["cancer-de-tiroides", "Cáncer de tiroides"], ["cancer-de-trompas-de-falopio", "Cáncer de trompas de Falopio"], ["cancer-de-utero", "Cáncer de útero"], ["cancer-de-vejiga", "Cáncer de vejiga"], ["cancer-de-tracto-urinario", "Cáncer de tracto urinario"], ["cancer-hematologico-o-hematopoyetico", "Cáncer hematológico o hematopoyético"], ["cancer-urotelial", "Cáncer urotelial"], ["cancer-de-vias-biliares", "Cáncer de vías biliares"], ["carcinoma-basocelular", "Carcinoma basocelular"], ["carcinoma-de-celulas-de-merkel", "Carcinoma de células de Merkel"], ["coriocarcinoma", "Coriocarcinoma"], ["dermatofibrosarcoma-protuberans", "Dermatofibrosarcoma protuberans"], ["enfermedad-de-bowen", "Enfermedad de Bowen"], ["enfermedad-de-castleman-multicentrica", "Enfermedad de Castleman multicéntrica"], ["enfermedades-mieloproliferativas", "Enfermedades mieloproliferativas"], ["feocromocitoma", "Feocromocitoma"], ["gastrinoma", "Gastrinoma"], ["glioma", "Glioma"], ["glucagonoma", "Glucagonoma"], ["histiocitosis-multisistemica", "Histiocitosis multisistémica"], ["insulinoma", "Insulinoma"], ["leucemia", "Leucemia"], ["leucemia-eosinofilica-cronica", "Leucemia eosinofílica crónica"], ["leucemia-linfoide", "Leucemia linfoide"], ["leucemia-linfoide-aguda", "Leucemia linfoide aguda"], ["leucemia-linfoide-cronica", "Leucemia linfoide crónica"], ["leucemia-mieloide", "Leucemia mieloide"], ["leucemia-mieloide-aguda", "Leucemia mieloide aguda"], ["leucemia-mieloide-cronica", "Leucemia mieloide crónica"], ["leucemia-promielocitica-aguda", "Leucemia promielocítica aguda"], ["linfoma", "Linfoma"], ["linfoma-anaplasico-de-celulas-grandes", "Linfoma anaplásico de células grandes"], ["linfoma-b-difuso-de-celulas-grandes", "Linfoma B difuso de células grandes"], ["linfoma-b-primario-mediastinico-de-celulas-grandes", "Linfoma B primario mediastínico de células grandes"], ["linfoma-cutaneo-de-celulas-t-nk", "Linfoma cutáneo de células T/NK"], ["linfoma-de-burkitt", "Linfoma de Burkitt"], ["linfoma-de-hodgkin", "Linfoma de Hodgkin"], ["linfoma-no-hodgkin", "Linfoma no Hodgkin"], ["liposarcoma", "Liposarcoma"], ["macroglobulinemia-de-waldenstrom", "Macroglobulinemia de Waldenström"], ["meduloblastoma", "Meduloblastoma"], ["melanoma", "Melanoma"], ["mesotelioma-pleural", "Mesotelioma pleural"], ["metastasis", "Metástasis"], ["micosis-fungoide", "Micosis fungoide"], ["mielofibrosis", "Mielofibrosis"], ["mieloma-multiple", "Mieloma múltiple"], ["mioma-uterino", "Mioma uterino"], ["neuroblastoma", "Neuroblastoma"], ["osteosarcoma", "Osteosarcoma"], ["policitemia-vera", "Policitemia vera"], ["prolactinoma", "Prolactinoma"], ["rabdomiosarcoma", "Rabdomiosarcoma"], ["sarcoma", "Sarcoma"], ["sarcoma-de-ewing", "Sarcoma de Ewing"], ["sarcoma-de-kaposi", "Sarcoma de Kaposi"], ["sindrome-carcinoide", "Síndrome carcinoide"], ["sindrome-mielodisplasico", "Síndrome mielodisplásico"], ["tricoleucemia", "Tricoleucemia"], ["trombocitemia-esencial", "Trombocitemia esencial"], ["tumor-carcinoide", "Tumor carcinoide"], ["tumor-carcinoide-de-estomago", "Tumor carcinoide de estómago"], ["tumor-carcinoide-de-intestino", "Tumor carcinoide de intestino"], ["tumor-carcinoide-de-pancreas", "Tumor carcinoide de páncreas"], ["tumor-cerebral", "Tumor cerebral"], ["tumor-de-wilms", "Tumor de Wilms"], ["tumor-del-estroma-gastrointestinal", "Tumor del estroma gastrointestinal"], ["tumor-mioblastico-inflamatorio", "Tumor mioblástico inflamatorio"], ["tumor-endocrino", "Tumor endocrino"], ["tumor-neuroendocrino-gastroenteropatico", "Tumor neuroendocrino gastroenteropático"], ["vipoma", "Vipoma"]], "ojo": [["absceso-de-cornea", "Absceso de córnea"], ["blefaritis", "Blefaritis"], ["blefaroconjuntivitis", "Blefaroconjuntivitis"], ["cataratas", "Cataratas"], ["ciclitis", "Ciclitis"], ["conjuntivitis", "Conjuntivitis"], ["conjuntivitis-aguda", "Conjuntivitis aguda"], ["conjuntivitis-alergica", "Conjuntivitis alérgica"], ["conjuntivitis-cronica", "Conjuntivitis crónica"], ["coriorretinitis", "Coriorretinitis"], ["coroiditis", "Coroiditis"], ["dacriocistitis", "Dacriocistitis"], ["degeneracion-macular", "Degeneración macular"], ["degeneracion-macular-asociada-a-la-edad-exudativa", "Degeneración macular asociada a la edad exudativa"], ["dolor-ocular", "Dolor ocular"], ["edema-de-cornea", "Edema de córnea"], ["edema-de-retina", "Edema de retina"], ["edema-macular", "Edema macular"], ["endoftalmitis", "Endoftalmitis"], ["episcleritis", "Episcleritis"], ["escleritis", "Escleritis"], ["fotofobia", "Fotofobia"], ["glaucoma", "Glaucoma"], ["glaucoma-de-angulo-abierto", "Glaucoma de ángulo abierto"], ["glaucoma-pseudoexfoliativo", "Glaucoma pseudoexfoliativo"], ["hemoftalmos", "Hemoftalmos"], ["hemorragia-retiniana", "Hemorragia retiniana"], ["hiperemia-conjuntival", "Hiperemia conjuntival"], ["hipertension-ocular", "Hipertensión ocular"], ["infeccion-oftalmologica", "Infección oftalmológica"], ["iridociclitis", "Iridociclitis"], ["iritis", "Iritis"], ["irritacion-ocular", "Irritación ocular"], ["miopia", "Miopía"], ["miopia-degenerativa", "Miopía degenerativa"], ["miosis", "Miosis"], ["neovascularizacion-coroidea-miopica", "Neovascularización coroidea miópica"], ["neuritis-optica", "Neuritis óptica"], ["oclusion-de-rama-tributaria-de-vena-retiniana", "Oclusión de rama tributaria de vena retiniana"], ["oclusion-de-vena-central-de-la-retina", "Oclusión de vena central de la retina"], ["oclusion-de-vena-retiniana", "Oclusión de vena retiniana"], ["queratitis", "Queratitis"], ["queratoconjuntivitis", "Queratoconjuntivitis"], ["queratoconjuntivitis-primaveral", "Queratoconjuntivitis primaveral"], ["retinitis", "Retinitis"], ["retinopatia", "Retinopatía"], ["sequedad-ocular", "Sequedad ocular"], ["trastornos-de-refraccion-y-acomodacion", "Trastornos de refracción y acomodación"], ["ulcera-de-cornea", "Úlcera de córnea"], ["uveitis", "Uveítis"]], "oido": [["alteraciones-del-equilibrio", "Alteraciones del equilibrio"], ["congestion-nasal", "Congestión nasal"], ["edema-laringeo", "Edema laríngeo"], ["enfermedad-de-meniere", "Enfermedad de Ménière"], ["epiglotitis", "Epiglotitis"], ["infeccion-nasal", "Infección nasal"], ["infeccion-otorrinolaringologica", "Infección otorrinolaringológica"], ["irritacion-nasal", "Irritación nasal"], ["mastoiditis-aguda", "Mastoiditis aguda"], ["otitis", "Otitis"], ["otitis-externa", "Otitis externa"], ["otitis-externa-maligna", "Otitis externa maligna"], ["otitis-media", "Otitis media"], ["otitis-media-aguda", "Otitis media aguda"], ["otitis-media-cronica", "Otitis media crónica"], ["otitis-media-supurativa", "Otitis media supurativa"], ["rinorrea", "Rinorrea"], ["sordera", "Sordera"], ["tapon-de-cerumen", "Tapón de cerumen"], ["tinnitus", "Tinnitus"], ["vertigo", "Vértigo"]], "piel": [["absceso-subcutaneo", "Absceso subcutáneo"], ["acne", "Acné"], ["alopecia", "Alopecia"], ["alopecia-androgenica", "Alopecia androgénica"], ["alopecia-areata", "Alopecia areata"], ["artritis-psoriasica", "Artritis psoriásica"], ["atrofia-cutanea", "Atrofia cutánea"], ["callos", "Callos"], ["caspa", "Caspa"], ["celulitis", "Celulitis"], ["cicatrices", "Cicatrices"], ["dermatitis", "Dermatitis"], ["dermatitis-atopica", "Dermatitis atópica"], ["dermatitis-de-contacto", "Dermatitis de contacto"], ["dermatitis-de-contacto-alergica", "Dermatitis de contacto alérgica"], ["dermatitis-de-contacto-irritativa", "Dermatitis de contacto irritativa"], ["dermatitis-del-panal", "Dermatitis del pañal"], ["dermatitis-exfoliativa", "Dermatitis exfoliativa"], ["dermatitis-herpetiforme", "Dermatitis herpetiforme"], ["dermatitis-numular", "Dermatitis numular"], ["dermatitis-seborreica", "Dermatitis seborreica"], ["dermatosis", "Dermatosis"], ["dishidrosis", "Dishidrosis"], ["eritema", "Eritema"], ["eritema-multiforme", "Eritema multiforme"], ["eritema-nudoso", "Eritema nudoso"], ["eritrasma", "Eritrasma"], ["eritrodermia", "Eritrodermia"], ["erupciones-liqueniformes", "Erupciones liqueniformes"], ["excoriacion", "Excoriación"], ["foliculitis", "Foliculitis"], ["forunculo", "Forúnculo"], ["granuloma-anular", "Granuloma anular"], ["hemangioma", "Hemangioma"], ["heridas", "Heridas"], ["hidradenitis-supurativa", "Hidradenitis supurativa"], ["hiperpigmentacion-cutanea", "Hiperpigmentación cutánea"], ["hiperqueratosis", "Hiperqueratosis"], ["hirsutismo", "Hirsutismo"], ["impetigo", "Impétigo"], ["infeccion-de-piel", "Infección de piel"], ["infeccion-de-tejidos-blandos-de-piel", "Infección de tejidos blandos de piel"], ["intertrigo", "Intertrigo"], ["irritacion-cutanea", "Irritación cutánea"], ["lentigo", "Léntigo"], ["liquen-rojo-exantematico", "Liquen rojo exantemático"], ["liquen-simple-cronico", "Liquen simple crónico"], ["melasma", "Melasma"], ["necrolisis-epidermica-toxica", "Necrólisis epidérmica tóxica"], ["necrosis-cutanea", "Necrosis cutánea"], ["panadizo", "Panadizo"], ["onicodistrofia", "Onicodistrofia"], ["paroniquia", "Paroniquia"], ["penfigo", "Pénfigo"], ["penfigoide-ampolloso", "Pénfigoide ampolloso"], ["prurigo-nodular", "Prúrigo nodular"], ["prurito", "Prurito"], ["prurito-anal", "Prurito anal"], ["prurito-vaginal", "Prurito vaginal"], ["psoriasis", "Psoriasis"], ["psoriasis-vulgar", "Psoriasis vulgar"], ["pustulosis-palmar-y-plantar", "Pustulosis palmar y plantar"], ["queloide", "Queloide"], ["quemaduras-solares", "Quemaduras solares"], ["queratosis-actinica", "Queratosis actínica"], ["rosacea", "Rosácea"], ["sequedad-de-piel", "Sequedad de piel"], ["sindrome-de-stevens-johnson", "Síndrome de Stevens-Johnson"], ["sindrome-de-sweet", "Síndrome de Sweet"], ["trastornos-de-la-pigmentacion", "Trastornos de la pigmentación"], ["ulcera-cutanea", "Úlcera cutánea"], ["ulceras-de-las-extremidades", "Úlceras de las extremidades"], ["urticaria-cronica-idiopatica", "Urticaria crónica idiopática"], ["vitiligo", "Vitíligo"]], "procedimientos": [["dialisis", "Diálisis"], ["hemodialisis", "Hemodiálisis"], ["intervencion-coronaria-percutanea", "Intervención coronaria percutánea"], ["radiografia", "Radiografía"], ["reproduccion-asistida", "Reproducción asistida"]], "sangre": [["afibrinogenemia", "Afibrinogenemia"], ["alteraciones-de-la-coagulacion", "Alteraciones de la coagulación"], ["anemia", "Anemia"], ["anemia-aplasica", "Anemia aplásica"], ["anemia-falciforme", "Anemia falciforme"], ["anemia-ferropenica", "Anemia ferropénica"], ["anemia-hemolitica", "Anemia hemolítica"], ["anemia-hemolitica-autoinmune", "Anemia hemolítica autoinmune"], ["anemia-megaloblastica", "Anemia megaloblástica"], ["anemia-por-deficit-de-vitamina-b12", "Anemia por déficit de vitamina B12"], ["angioedema-hereditario", "Angioedema hereditario"], ["betatalasemia", "Betatalasemia"], ["coagulacion-intravascular-diseminada", "Coagulación intravascular diseminada"], ["deficit-de-antitrombina-iii", "Déficit de antitrombina III"], ["deficit-de-factor-xiii-de-la-coagulacion", "Déficit de factor XIII de la coagulación"], ["discrasias-sanguineas", "Discrasias sanguíneas"], ["enfermedad-de-injerto-frente-a-huesped", "Enfermedad de injerto frente a huésped"], ["enfermedad-de-von-willebrand", "Enfermedad de von Willebrand"], ["eosinofilia", "Eosinofilia"], ["hemofilia", "Hemofilia"], ["hemofilia-a", "Hemofilia A"], ["hemofilia-b", "Hemofilia B"], ["hemoglobinuria-paroxistica-nocturna", "Hemoglobinuria paroxística nocturna"], ["inmunodeficiencia", "Inmunodeficiencia"], ["leucocitosis", "Leucocitosis"], ["leucopenia", "Leucopenia"], ["neutropenia", "Neutropenia"], ["neutropenia-febril", "Neutropenia febril"], ["purpura", "Púrpura"], ["purpura-alergica", "Púrpura alérgica"], ["purpura-no-trombocitopenica", "Púrpura no trombocitopénica"], ["purpura-trombocitopenica", "Púrpura trombocitopénica"], ["purpura-trombocitopenica-idiopatica", "Púrpura trombocitopénica idiopática"], ["sarcoidosis", "Sarcoidosis"], ["sindrome-de-kostmann", "Síndrome de Kostmann"], ["sindrome-hemolitico-uremico", "Síndrome hemolítico urémico"], ["sindrome-hipereosinofilico", "Síndrome hipereosinofílico"], ["talasemia", "Talasemia"], ["trombocitopenia", "Trombocitopenia"], ["trombocitopenia-inmune-primaria", "Trombocitopenia inmune primaria"]], "nervioso": [["absceso-cerebral", "Absceso cerebral"], ["apnea-del-sueno", "Apnea del sueño"], ["ataque-isquemico-transitorio", "Ataque isquémico transitorio"], ["ataxia-de-friedreich", "Ataxia de Friedreich"], ["atetosis", "Atetosis"], ["atrofia-muscular-espinal", "Atrofia muscular espinal"], ["ausencias", "Ausencias"], ["blefaroespasmo", "Blefaroespasmo"], ["bloqueo-neuromuscular", "Bloqueo neuromuscular"], ["cataplejia", "Cataplejía"], ["cefalea-en-racimos", "Cefalea en racimos"], ["ciatica", "Ciática"], ["corea", "Corea"], ["corea-de-huntington", "Corea de Huntington"], ["crisis-epilepticas", "Crisis epilépticas"], ["crisis-epilepticas-cronicas", "Crisis epilépticas crónicas"], ["crisis-epilepticas-generalizadas", "Crisis epilépticas generalizadas"], ["crisis-epilepticas-jacksonianas", "Crisis epilépticas jacksonianas"], ["crisis-epilepticas-mioclonicas", "Crisis epilépticas mioclónicas"], ["crisis-epilepticas-parciales", "Crisis epilépticas parciales"], ["crisis-epilepticas-parciales-con-generalizacion-secundaria", "Crisis epilépticas parciales con generalización secundaria"], ["crisis-epilepticas-parciales-sin-generalizacion-secundaria", "Crisis epilépticas parciales sin generalización secundaria"], ["crisis-epilepticas-tonicas", "Crisis epilépticas tónicas"], ["crisis-epilepticas-tonico-clonicas", "Crisis epilépticas tónico-clónicas"], ["demencia-con-parkinsonismo", "Demencia con parkinsonismo"], ["depresion-respiratoria", "Depresión respiratoria"], ["distonia", "Distonía"], ["distrofia-de-duchenne", "Distrofia de Duchenne"], ["distrofia-muscular", "Distrofia muscular"], ["edema-cerebral", "Edema cerebral"], ["encefalitis", "Encefalitis"], ["encefalopatia-hipertensiva", "Encefalopatía hipertensiva"], ["enfermedad-de-alzheimer", "Enfermedad de Alzheimer"], ["enfermedad-de-parkinson", "Enfermedad de Parkinson"], ["epilepsia", "Epilepsia"], ["esclerosis-lateral-amiotrofica", "Esclerosis lateral amiotrófica"], ["esclerosis-multiple", "Esclerosis múltiple"], ["espasticidad", "Espasticidad"], ["hidrocefalia", "Hidrocefalia"], ["hiperactividad", "Hiperactividad"], ["ictus", "Ictus"], ["induccion-del-sueno", "Inducción del sueño"], ["infarto-cerebral", "Infarto cerebral"], ["insomnio", "Insomnio"], ["insuficiencia-cerebral", "Insuficiencia cerebral"], ["meningitis", "Meningitis"], ["meningitis-bacteriana", "Meningitis bacteriana"], ["miastenia-grave", "Miastenia grave"], ["migrana", "Migraña"], ["migrana-con-aura", "Migraña con aura"], ["migrana-sin-aura", "Migraña sin aura"], ["mioclonia", "Mioclonía"], ["narcolepsia", "Narcolepsia"], ["neuralgia", "Neuralgia"], ["neuralgia-del-trigemino", "Neuralgia del trigémino"], ["neuralgia-glosofaringea", "Neuralgia glosofaríngea"], ["neuralgia-posherpetica", "Neuralgia posherpética"], ["neuritis", "Neuritis"], ["neurofibromatosis", "Neurofibromatosis"], ["neuropatia", "Neuropatía"], ["neuropatia-motora", "Neuropatía motora"], ["neuropatia-optica", "Neuropatía óptica"], ["paralisis-facial", "Parálisis facial"], ["paralisis-muscular", "Parálisis muscular"], ["paralisis-supranuclear-progresiva", "Parálisis supranuclear progresiva"], ["parkinsonismo", "Parkinsonismo"], ["polineuropatia-desmielinizante-inflamatoria-cronica", "Polineuropatía desmielinizante inflamatoria crónica"], ["sedacion", "Sedación"], ["sedacion-prolongada-en-uci", "Sedación prolongada en UCI"], ["sindrome-de-dravet", "Síndrome de Dravet"], ["sindrome-de-guillain-barre", "Síndrome de Guillain-Barré"], ["sindrome-de-lennox-gastaut", "Síndrome de Lennox-Gastaut"], ["sindrome-de-piernas-inquietas", "Síndrome de piernas inquietas"], ["sindrome-de-west", "Síndrome de West"], ["estatus-epileptico", "Estatus epiléptico"], ["trastorno-del-espectro-de-la-neuromielitis-optica-tenmo", "Trastorno del espectro de la neuromielitis óptica (TENMO)"], ["trastorno-del-sueno", "Trastorno del sueño"], ["trastornos-extrapiramidales", "Trastornos extrapiramidales"], ["trombosis-de-arteria-cerebral", "Trombosis de arteria cerebral"]], "sintomas": [["aerofagia", "Aerofagia"], ["afonia", "Afonía"], ["agitacion", "Agitación"], ["agresividad", "Agresividad"], ["alergia-a-medicamentos", "Alergia a medicamentos"], ["alteraciones-de-la-miccion", "Alteraciones de la micción"], ["amnesia", "Amnesia"], ["anafilaxia", "Anafilaxia"], ["anorexia", "Anorexia"], ["apnea", "Apnea"], ["ascitis", "Ascitis"], ["astenia", "Astenia"], ["bacteriuria", "Bacteriuria"], ["calambres-musculares", "Calambres musculares"], ["caquexia", "Caquexia"], ["cefalea", "Cefalea"], ["cinetosis", "Cinetosis"], ["coma", "Coma"], ["confusion", "Confusión"], ["convalecencia", "Convalecencia"], ["convulsiones", "Convulsiones"], ["convulsiones-febriles", "Convulsiones febriles"], ["convulsiones-infantiles", "Convulsiones infantiles"], ["descamacion-cutanea", "Descamación cutánea"], ["disnea", "Disnea"], ["distension-abdominal", "Distensión abdominal"], ["disuria", "Disuria"], ["dolor", "Dolor"], ["dolor-abdominal", "Dolor abdominal"], ["dolor-agudo", "Dolor agudo"], ["dolor-cronico", "Dolor crónico"], ["dolor-de-garganta", "Dolor de garganta"], ["dolor-irruptivo", "Dolor irruptivo"], ["dolor-oncologico", "Dolor oncológico"], ["dolor-pelvico", "Dolor pélvico"], ["edema", "Edema"], ["epistaxis", "Epistaxis"], ["erupciones-cutaneas", "Erupciones cutáneas"], ["escaras", "Escaras"], ["espasmo", "Espasmo"], ["esplenomegalia", "Esplenomegalia"], ["fibrosis", "Fibrosis"], ["fiebre", "Fiebre"], ["fistula", "Fístula"], ["flatulencia", "Flatulencia"], ["frialdad-en-las-extremidades", "Frialdad en las extremidades"], ["halitosis", "Halitosis"], ["hematoma", "Hematoma"], ["hemoglobinuria", "Hemoglobinuria"], ["hemorragia", "Hemorragia"], ["heridas-posoperatorias", "Heridas posoperatorias"], ["hiperhidrosis", "Hiperhidrosis"], ["hipoprotrombinemia", "Hipoprotrombinemia"], ["incontinencia-urinaria", "Incontinencia urinaria"], ["inflamacion", "Inflamación"], ["intoxicacion-aguda", "Intoxicación aguda"], ["intoxicacion-por-agentes-antifolato", "Intoxicación por agentes antifolato"], ["intoxicacion-por-alimentos", "Intoxicación por alimentos"], ["intoxicacion-por-amanita-phalloides", "Intoxicación por Amanita phalloides"], ["intoxicacion-por-barbituricos", "Intoxicación por barbitúricos"], ["intoxicacion-por-cianuro", "Intoxicación por cianuro"], ["intoxicacion-por-digitalicos", "Intoxicación por digitálicos"], ["intoxicacion-por-hierro", "Intoxicación por hierro"], ["intoxicacion-por-inhibidores-de-la-colinesterasa", "Intoxicación por inhibidores de la colinesterasa"], ["intoxicacion-por-opioides", "Intoxicación por opioides"], ["intoxicacion-por-organofosforados", "Intoxicación por organofosforados"], ["intoxicacion-por-paracetamol", "Intoxicación por paracetamol"], ["intoxicacion-por-plomo", "Intoxicación por plomo"], ["irritabilidad", "Irritabilidad"], ["labilidad-emocional", "Labilidad emocional"], ["mareo", "Mareo"], ["miccion-imperiosa", "Micción imperiosa"], ["nauseas", "Náuseas"], ["nauseas-y-vomitos-inducidos-por-derivados-de-morfina", "Náuseas y vómitos inducidos por derivados de morfina"], ["nauseas-y-vomitos-inducidos-por-quimioterapia", "Náuseas y vómitos inducidos por quimioterapia"], ["nauseas-y-vomitos-inducidos-por-radioterapia", "Náuseas y vómitos inducidos por radioterapia"], ["nauseas-y-vomitos-posoperatorios", "Náuseas y vómitos posoperatorios"], ["nerviosismo", "Nerviosismo"], ["nicturia", "Nicturia"], ["oliguria", "Oliguria"], ["palpitaciones", "Palpitaciones"], ["picaduras-de-insectos", "Picaduras de insectos"], ["pioderma-gangrenoso", "Pioderma gangrenoso"], ["polaquiuria", "Polaquiuria"], ["polipos", "Pólipos"], ["poliuria", "Poliuria"], ["premedicacion-anestesica", "Premedicación anestésica"], ["reaccion-de-jarisch-herxheimer", "Reacción de Jarisch-Herxheimer"], ["retencion-urinaria", "Retención urinaria"], ["retraso-del-crecimiento", "Retraso del crecimiento"], ["ronquera", "Ronquera"], ["sensacion-de-plenitud-gastrica", "Sensación de plenitud gástrica"], ["shock-cardiogenico", "Shock cardiogénico"], ["shock-septico", "Shock séptico"], ["sincope", "Síncope"], ["sindrome-de-liberacion-de-citoquinas", "Síndrome de liberación de citoquinas"], ["sindrome-de-prader-willi", "Síndrome de Prader-Willi"], ["sindrome-dress", "Síndrome DRESS"], ["sofocos", "Sofocos"], ["somnolencia", "Somnolencia"], ["temblor", "Temblor"], ["tetania", "Tetania"], ["tos", "Tos"], ["tos-productiva", "Tos productiva"], ["tos-seca", "Tos seca"], ["vomitos", "Vómitos"]], "traumatismos": [["alergia-al-veneno-de-abeja", "Alergia al veneno de abeja"], ["alergia-al-veneno-de-avispa", "Alergia al veneno de avispa"], ["alergia-alimentaria", "Alergia alimentaria"], ["angioedema", "Angioedema"], ["congelacion", "Congelación"], ["esguince", "Esguince"], ["estrenimiento-inducido-por-opioides", "Estreñimiento inducido por opioides"], ["lesion-medular", "Lesión medular"], ["quemaduras", "Quemaduras"], ["rechazo-de-organos-trasplantados", "Rechazo de órganos trasplantados"], ["torticolis", "Tortícolis"], ["traumatismo-craneoencefalico", "Traumatismo craneoencefálico"], ["ulcera-peptica-inducida-por-aine", "Úlcera péptica inducida por AINE"]]};

function patoDrugs(cats){ if(!cats||!cats.length)return []; return VADEM.map((d,i)=>({d:d,i:i})).filter(o=>cats.includes(o.d.cat)); }
function patoNorm(s){return (''+ (s||'')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}

/* ===== CRUCE CLÍNICO MEJORADO v2 ===== */
const CLINICAL_KEYWORDS = {
  // Cardiovascular
  "infarto":["nitroglicerina","heparina","enoxaparina","clopidogrel","ácido acetilsalicílico","aspirina","atorvastatina","alteplasa","tenecteplasa","morfina","bisoprolol","ramipril","enalapril","captopril"],
  "angina":["nitroglicerina","isosorbida","bisoprolol","atenolol","amlodipino","diltiazem","ácido acetilsalicílico","clopidogrel","heparina","atorvastatina","ranolazina"],
  "hipertensión":["enalapril","ramipril","losartán","valsartán","amlodipino","nifedipino","bisoprolol","atenolol","carvedilol","hidroclorotiazida","furosemida","espironolactona","doxazosina","labetalol","nitroprusiato","urapidilo"],
  "hipotensión":["noradrenalina","adrenalina","dopamina","dobutamina","efedrina","fenilefrina","vasopresina"],
  "insuficiencia cardíaca":["furosemida","espironolactona","eplerenona","enalapril","ramipril","sacubitrilo","carvedilol","bisoprolol","digoxina","ivabradina","dapagliflozina","empagliflozina","dobutamina","levosimendán","nitroglicerina"],
  "arritmia":["amiodarona","flecainida","propafenona","digoxina","verapamilo","diltiazem","bisoprolol","atenolol","adenosina","lidocaína","atropina"],
  "fibrilación auricular":["amiodarona","flecainida","propafenona","digoxina","bisoprolol","verapamilo","diltiazem","acenocumarol","warfarina","rivaroxabán","apixabán","dabigatrán","edoxabán","heparina"],
  "taquicardia":["amiodarona","adenosina","verapamilo","diltiazem","bisoprolol","atenolol","esmolol","flecainida","propafenona","lidocaína"],
  "bradicardia":["atropina","isoprenalina","adrenalina","dopamina"],
  "trombosis":["heparina","enoxaparina","acenocumarol","warfarina","rivaroxabán","apixabán","dabigatrán","alteplasa","tenecteplasa","ácido acetilsalicílico","clopidogrel","fondaparinux"],
  "embolia pulmonar":["heparina","enoxaparina","rivaroxabán","apixabán","alteplasa","tenecteplasa","fondaparinux","acenocumarol","warfarina"],
  "embolia":["heparina","enoxaparina","acenocumarol","warfarina","rivaroxabán","apixabán","alteplasa"],
  "endocarditis":["vancomicina","gentamicina","ampicilina","cloxacilina","ceftriaxona","daptomicina"],
  "shock":["noradrenalina","adrenalina","dopamina","dobutamina","vasopresina","levosimendán","hidrocortisona","cristaloides"],
  "aterosclerosis":["atorvastatina","rosuvastatina","simvastatina","ezetimiba","ácido acetilsalicílico","clopidogrel"],
  "colesterol":["atorvastatina","rosuvastatina","simvastatina","pravastatina","ezetimiba","fenofibrato","gemfibrozilo","alirocumab","evolocumab","colestiramina"],
  "varices":["diosmina","hesperidina","pentoxifilina","heparina"],
  "aneurisma":["labetalol","esmolol","nitroprusiato","enalapril"],
  "disección":["labetalol","esmolol","nitroprusiato","morfina"],
  // Respiratorio
  "asma":["salbutamol","terbutalina","ipratropio","budesonida","fluticasona","beclometasona","montelukast","teofilina","prednisona","prednisolona","metilprednisolona","omalizumab","mepolizumab","formoterol","salmeterol","tiotropio"],
  "epoc":["salbutamol","ipratropio","tiotropio","budesonida","fluticasona","formoterol","salmeterol","indacaterol","umeclidinio","prednisona","teofilina","roflumilast","azitromicina"],
  "bronquitis":["amoxicilina","azitromicina","salbutamol","ipratropio","prednisona","acetilcisteína","carbocisteína"],
  "neumonía":["amoxicilina","amoxicilina-clavulánico","ceftriaxona","cefotaxima","levofloxacino","azitromicina","claritromicina","piperacilina-tazobactam","meropenem","vancomicina","linezolid","oseltamivir"],
  "edema pulmonar":["furosemida","nitroglicerina","morfina","oxígeno","dobutamina"],
  "rinitis":["loratadina","cetirizina","desloratadina","ebastina","budesonida","mometasona","azelastina","montelukast","cromoglicato"],
  "sinusitis":["amoxicilina","amoxicilina-clavulánico","moxifloxacino","budesonida","mometasona","paracetamol","ibuprofeno"],
  "gripe":["oseltamivir","paracetamol","ibuprofeno"],
  "tos":["codeína","dextrometorfano","acetilcisteína","carbocisteína","bromhexina"],
  // Digestivo
  "gastritis":["omeprazol","pantoprazol","ranitidina","sucralfato","misoprostol","bismuto"],
  "úlcera péptica":["omeprazol","pantoprazol","esomeprazol","ranitidina","sucralfato","misoprostol","bismuto","amoxicilina","claritromicina","metronidazol"],
  "reflujo":["omeprazol","pantoprazol","esomeprazol","lansoprazol","ranitidina","alginato","domperidona","metoclopramida"],
  "helicobacter":["omeprazol","amoxicilina","claritromicina","metronidazol","bismuto","levofloxacino"],
  "diarrea":["loperamida","racecadotrilo","suero oral","zinc","metronidazol","vancomicina","rifaximina","colestiramina"],
  "estreñimiento":["lactulosa","macrogol","bisacodilo","senósidos","metilcelulosa","enema","linaclotida","prucaloprida","naloxegol"],
  "náuseas":["ondansetrón","metoclopramida","domperidona","granisetrón","dexametasona","aprepitant","dimenhidrinato"],
  "vómitos":["ondansetrón","metoclopramida","domperidona","granisetrón","dexametasona","aprepitant"],
  "hepatitis":["entecavir","tenofovir","sofosbuvir","ribavirina","interferón","lamivudina"],
  "cirrosis":["espironolactona","furosemida","lactulosa","rifaximina","propranolol","terlipresina","albúmina","norfloxacino"],
  "pancreatitis":["paracetamol","metamizol","morfina","octreótida"],
  "colitis ulcerosa":["mesalazina","sulfasalazina","budesonida","prednisona","azatioprina","infliximab","adalimumab","vedolizumab","tofacitinib"],
  "crohn":["mesalazina","budesonida","prednisona","azatioprina","metotrexato","infliximab","adalimumab","vedolizumab","ustekinumab"],
  "hemorroides":["lidocaína tópica","hidrocortisona tópica","diosmina","hesperidina","nitroglicerina tópica"],
  "cólico biliar":["metamizol","diclofenaco","ketorolaco","buscapina","morfina"],
  // Infecciosas
  "sepsis":["piperacilina-tazobactam","meropenem","vancomicina","noradrenalina","hidrocortisona","cristaloides","amikacina"],
  "tuberculosis":["isoniazida","rifampicina","pirazinamida","etambutol","estreptomicina"],
  "vih":["tenofovir","emtricitabina","dolutegravir","rilpivirina","darunavir","ritonavir","bictegravir","abacavir","lamivudina","efavirenz"],
  "malaria":["cloroquina","artemisinina","mefloquina","atovacuona","proguanil","quinina","primaquina","doxiciclina"],
  "paludismo":["cloroquina","artemisinina","mefloquina","atovacuona","proguanil","quinina","primaquina"],
  "candidiasis":["fluconazol","itraconazol","voriconazol","anfotericina","caspofungina","nistatina","clotrimazol","miconazol"],
  "herpes":["aciclovir","valaciclovir","famciclovir"],
  "sífilis":["penicilina","doxiciclina","ceftriaxona"],
  "gonorrea":["ceftriaxona","azitromicina"],
  "tétanos":["metronidazol","inmunoglobulina","diazepam","vacuna"],
  // Neurológico
  "epilepsia":["levetiracetam","valproato","carbamazepina","lamotrigina","fenitoína","lacosamida","topiramato","clonazepam","clobazam","perampanel","brivaracetam","zonisamida"],
  "estatus epiléptico":["diazepam","midazolam","levetiracetam","valproato","fenitoína","fenobarbital","propofol","tiopental"],
  "parkinson":["levodopa","carbidopa","pramipexol","ropinirol","rasagilina","selegilina","entacapona","amantadina","trihexifenidilo","apomorfina","rotigotina"],
  "alzheimer":["donepezilo","rivastigmina","galantamina","memantina"],
  "migraña":["sumatriptán","zolmitriptán","rizatriptán","ergotamina","paracetamol","ibuprofeno","naproxeno","propranolol","topiramato","amitriptilina","valproato","erenumab","fremanezumab"],
  "meningitis":["ceftriaxona","cefotaxima","ampicilina","vancomicina","dexametasona","aciclovir","meropenem"],
  "ictus":["alteplasa","tenecteplasa","ácido acetilsalicílico","clopidogrel","heparina","atorvastatina","nimodipino"],
  "dolor neuropático":["pregabalina","gabapentina","amitriptilina","duloxetina","carbamazepina","lidocaína","capsaicina"],
  "esclerosis múltiple":["interferón beta","glatirámero","fingolimod","natalizumab","ocrelizumab","dimetilfumarato","teriflunomida","metilprednisolona"],
  "miastenia":["piridostigmina","neostigmina","prednisona","azatioprina","inmunoglobulina","rituximab"],
  "sedación":["propofol","midazolam","dexmedetomidina","ketamina","fentanilo","remifentanilo","morfina"],
  "insomnio":["zolpidem","lorazepam","lormetazepam","trazodona","melatonina","doxepina"],
  // Endocrino
  "diabetes mellitus":["metformina","glibenclamida","gliclazida","glimepirida","sitagliptina","vildagliptina","empagliflozina","dapagliflozina","canagliflozina","liraglutida","semaglutida","dulaglutida","insulina","pioglitazona","repaglinida","acarbosa"],
  "diabetes tipo 1":["insulina"],
  "diabetes tipo 2":["metformina","glibenclamida","gliclazida","sitagliptina","empagliflozina","dapagliflozina","liraglutida","semaglutida","insulina","pioglitazona"],
  "cetoacidosis":["insulina","suero salino","potasio","bicarbonato"],
  "hipotiroidismo":["levotiroxina","liotironina"],
  "hipertiroidismo":["metimazol","carbimazol","propiltiouracilo","propranolol","yodo radiactivo"],
  "hipoglucemia":["glucosa","glucagón"],
  "hiperpotasemia":["salbutamol","insulina","gluconato cálcico","bicarbonato","furosemida","resinas","patirómero"],
  "hipopotasemia":["cloruro potásico","espironolactona"],
  "hipercalcemia":["suero salino","furosemida","ácido zoledrónico","pamidronato","calcitonina","denosumab"],
  "hipocalcemia":["gluconato cálcico","calcio oral","calcitriol"],
  "hiponatremia":["suero salino hipertónico","restricción hídrica","tolvaptán","furosemida"],
  "gota":["colchicina","alopurinol","febuxostat","naproxeno","indometacina","prednisona"],
  "osteoporosis":["alendronato","risedronato","ácido zoledrónico","denosumab","teriparatida","calcio","vitamina D","raloxifeno"],
  "obesidad":["orlistat","liraglutida","semaglutida","naltrexona-bupropión"],
  // Dolor e inflamación
  "dolor":["paracetamol","metamizol","ibuprofeno","naproxeno","diclofenaco","ketorolaco","tramadol","morfina","fentanilo","oxicodona","buprenorfina","pregabalina","gabapentina","amitriptilina"],
  "dolor agudo":["paracetamol","metamizol","ibuprofeno","ketorolaco","tramadol","morfina","fentanilo"],
  "dolor crónico":["paracetamol","ibuprofeno","tramadol","tapentadol","amitriptilina","duloxetina","pregabalina","gabapentina","parche de fentanilo","buprenorfina"],
  "dolor oncológico":["morfina","fentanilo","oxicodona","tapentadol","metadona","buprenorfina","paracetamol","ibuprofeno","dexametasona","pregabalina"],
  "fiebre":["paracetamol","ibuprofeno","metamizol"],
  "inflamación":["ibuprofeno","naproxeno","diclofenaco","indometacina","prednisona","prednisolona","metilprednisolona","dexametasona"],
  // Psiquiatría
  "depresión":["fluoxetina","sertralina","paroxetina","citalopram","escitalopram","venlafaxina","duloxetina","mirtazapina","amitriptilina","bupropión","trazodona","desvenlafaxina","vortioxetina"],
  "ansiedad":["lorazepam","alprazolam","diazepam","bromazepam","buspirona","sertralina","escitalopram","paroxetina","venlafaxina","pregabalina","hidroxizina"],
  "esquizofrenia":["haloperidol","risperidona","olanzapina","quetiapina","aripiprazol","paliperidona","clozapina","ziprasidona"],
  "bipolar":["litio","valproato","carbamazepina","lamotrigina","quetiapina","olanzapina","aripiprazol"],
  "insomnio":["zolpidem","lorazepam","lormetazepam","trazodona","melatonina"],
  "psicosis":["haloperidol","risperidona","olanzapina","quetiapina","aripiprazol","clozapina"],
  "abstinencia alcohólica":["diazepam","lorazepam","clometiazol","tiamina","haloperidol"],
  "dependencia":["metadona","buprenorfina","naltrexona","naloxona","disulfiram","vareniclina"],
  // Renal
  "insuficiencia renal":["furosemida","bicarbonato","eritropoyetina","calcio","calcitriol","sevelámero","quelantes de fósforo","hierro IV"],
  "cólico nefrítico":["metamizol","diclofenaco","ketorolaco","buscapina","tamsulosina"],
  "cistitis":["fosfomicina","nitrofurantoína","trimetoprim-sulfametoxazol","amoxicilina-clavulánico","ciprofloxacino"],
  "infección urinaria":["fosfomicina","nitrofurantoína","trimetoprim-sulfametoxazol","amoxicilina-clavulánico","ciprofloxacino","ceftriaxona"],
  "pielonefritis":["ceftriaxona","ciprofloxacino","amoxicilina-clavulánico","piperacilina-tazobactam","meropenem"],
  "hiperplasia prostática":["tamsulosina","alfuzosina","dutasterida","finasterida"],
  "vejiga hiperactiva":["oxibutinina","tolterodina","solifenacina","mirabegrón"],
  // Dermatología
  "psoriasis":["metotrexato","ciclosporina","acitretino","adalimumab","secukinumab","ustekinumab","calcipotriol","betametasona","corticoides tópicos"],
  "dermatitis atópica":["corticoides tópicos","tacrolimus","pimecrolimus","dupilumab","ciclosporina","antihistamínicos","emolientes"],
  "acné":["peróxido de benzoilo","adapaleno","tretinoína","clindamicina tópica","eritromicina tópica","doxiciclina","isotretinoína"],
  "urticaria":["cetirizina","loratadina","desloratadina","ebastina","bilastina","omalizumab","prednisona"],
  // Hematología
  "anemia ferropénica":["hierro oral","hierro IV","ácido fólico"],
  "anemia megaloblástica":["cianocobalamina","ácido fólico"],
  "anemia":["hierro","ácido fólico","cianocobalamina","eritropoyetina","darbepoetina"],
  "trombocitopenia":["prednisona","inmunoglobulina","eltrombopag","romiplostim","rituximab"],
  "hemofilia":["factor VIII","factor IX","emicizumab","ácido tranexámico","desmopresina"],
  "coagulación intravascular":["heparina","plasma fresco","plaquetas","fibrinógeno","ácido tranexámico"],
  "neutropenia":["filgrastim","pegfilgrastim","antibióticos de amplio espectro"],
  // Anafilaxia / alergia
  "anafilaxia":["adrenalina","metilprednisolona","dexclorfeniramina","salbutamol","ranitidina","cristaloides"],
  "alergia":["loratadina","cetirizina","desloratadina","ebastina","dexclorfeniramina","metilprednisolona","prednisona","adrenalina"],
  // Ginecología / obstetricia
  "preeclampsia":["labetalol","nifedipino","sulfato de magnesio","hidralazina"],
  "eclampsia":["sulfato de magnesio","labetalol","diazepam"],
  "anticoncepción":["etinilestradiol","levonorgestrel","desogestrel","drospirenona","etonogestrel","DIU"],
  "dismenorrea":["ibuprofeno","naproxeno","paracetamol","anticonceptivos orales","buscapina"],
  "endometriosis":["anticonceptivos orales","dienogest","análogos GnRH","danazol","ibuprofeno"],
  "menopausia":["estradiol","tibolona","raloxifeno","ospemifeno"],
  // Oncología (genérico)
  "cáncer":["cisplatino","carboplatino","oxaliplatino","ciclofosfamida","doxorrubicina","paclitaxel","docetaxel","5-fluorouracilo","capecitabina","gemcitabina","metotrexato","irinotecan","vincristina","etopósido"],
  "leucemia":["imatinib","dasatinib","nilotinib","rituximab","ciclofosfamida","doxorrubicina","vincristina","citarabina","daunorrubicina","ácido transretinoico","venetoclax"],
  "linfoma":["rituximab","ciclofosfamida","doxorrubicina","vincristina","prednisona","bendamustina","brentuximab","ibrutinib"],
  "mieloma":["bortezomib","lenalidomida","dexametasona","daratumumab","carfilzomib","pomalidomida","melfalán"],
  "melanoma":["nivolumab","pembrolizumab","ipilimumab","dabrafenib","trametinib","vemurafenib"],
  // Oftalmología
  "glaucoma":["timolol","latanoprost","travoprost","brimonidina","dorzolamida","pilocarpina","acetazolamida"],
  "conjuntivitis":["tobramicina","ciprofloxacino colirio","ofloxacino colirio","cromoglicato","olopatadina","dexametasona colirio"],
  "uveítis":["dexametasona","prednisolona colirio","atropina","ciclopentolato","metotrexato"],
  "degeneración macular":["ranibizumab","aflibercept","bevacizumab"],
  // Intoxicaciones
  "intoxicación por paracetamol":["acetilcisteína"],
  "intoxicación por opioides":["naloxona"],
  "intoxicación por organofosforados":["atropina","pralidoxima"],
  "intoxicación por cianuro":["hidroxocobalamina","tiosulfato sódico"],
  "intoxicación por digitálicos":["anticuerpos antidigoxina"],
  "intoxicación por hierro":["deferoxamina"],
  "intoxicación por plomo":["EDTA","succímero","dimercaprol"],
  "intoxicación por barbitúricos":["carbón activado","bicarbonato"],
  // Anestesia
  "anestesia general":["propofol","sevoflurano","tiopental","fentanilo","remifentanilo","rocuronio","succinilcolina","sugammadex","neostigmina"],
  "anestesia local":["lidocaína","bupivacaína","ropivacaína","mepivacaína","levobupivacaína"],
  "anestesia epidural":["bupivacaína","ropivacaína","levobupivacaína","fentanilo","morfina"],
  "dolor posoperatorio":["paracetamol","metamizol","ketorolaco","tramadol","morfina","fentanilo","bupivacaína"],
  // Miscelánea
  "trasplante":["tacrolimus","ciclosporina","micofenolato","sirolimus","everolimus","prednisona","basiliximab","timoglobulina"],
  "rechazo":["metilprednisolona","tacrolimus","micofenolato","timoglobulina","rituximab"],
  "quemaduras":["sulfadiazina argéntica","paracetamol","morfina","cristaloides","albúmina"],
  "convulsiones":["diazepam","midazolam","levetiracetam","fenitoína","valproato","fenobarbital"],
  "edema":["furosemida","torasemida","hidroclorotiazida","espironolactona"],
  "hemorragia":["ácido tranexámico","fitomenadiona","plasma fresco","plaquetas","fibrinógeno"],
  "prostatitis":["ciprofloxacino","levofloxacino","trimetoprim-sulfametoxazol","doxiciclina"],
  "artritis reumatoide":["metotrexato","leflunomida","sulfasalazina","hidroxicloroquina","adalimumab","etanercept","infliximab","tocilizumab","baricitinib","prednisona"],
  "lupus":["hidroxicloroquina","prednisona","azatioprina","micofenolato","ciclofosfamida","belimumab"],
  "espondilitis":["indometacina","naproxeno","adalimumab","etanercept","secukinumab","sulfasalazina"],
};

function suggestDrugs(name){
  const nm=patoNorm(name); const results=new Map();
  // Layer 1: clinical keyword matching (curated)
  for(const [kw, drugs] of Object.entries(CLINICAL_KEYWORDS)){
    if(nm.indexOf(patoNorm(kw))>=0){
      drugs.forEach(dn=>{
        const idx=VADEM.findIndex(d=>patoNorm(d.n).indexOf(patoNorm(dn))>=0);
        if(idx>=0){const d=VADEM[idx]; const k=d.n; if(!results.has(k))results.set(k,{d:d,i:idx,s:10}); else results.get(k).s+=5;}
      });
    }
  }
  // Layer 2: token matching (original, as fallback)
  const toks=patoNorm(name).split(/[^a-z0-9]+/).filter(w=>w.length>=5);
  if(toks.length){
    VADEM.forEach((d,i)=>{ const hay=patoNorm(d.n+' '+d.i+' '+d.a); let s=0; toks.forEach(t=>{if(hay.indexOf(t)>=0)s++;}); if(s>0&&!results.has(d.n))results.set(d.n,{d:d,i:i,s:s}); });
  }
  return [...results.values()].sort((a,b)=>b.s-a.s).slice(0,15);
}
function patoDrugCard(d,i){
  const f=(lbl,v)=>(v&&(''+v).trim())?'<h6>'+lbl+'</h6><p>'+(''+v).replace(/</g,'&lt;')+'</p>':'';
  return '<div class="pato-drug"><div class="pd-top" data-pdtoggle="1"><span class="pd-name">'+d.n+'</span>'+
    (d.route?'<span class="pd-route">'+d.route+'</span>':'')+'<span style="color:var(--text-dim,#94A3B8)">▾</span></div>'+
    '<div class="pd-body">'+f('Acción',d.a)+f('Indicaciones',d.i)+f('Posología y adm.',d.p)+f('Contraindicaciones',d.c)+f('Efectos adv. / Notas',d.r)+f('Fuente',d.source||'No especificada')+
    '<div class="toolbar" style="margin-top:12px"><button class="tool" style="--ac:#14B8A6" data-pspeak="'+i+'">🔊 Escuchar</button>'+
    '<button class="tool" style="--ac:#14B8A6" data-pexplain="'+i+'">✨ Explícamelo</button></div></div></div>';
}
function renderPatologias(){
  const cont=$("#content");
  $("#count").textContent=PATOCHAPTERS.length+" capítulos";
  const tiles=PATOCHAPTERS.map(ch=>{
    const nd=(PATODIS[ch[0]]||[]).length, nf=patoDrugs(ch[3]).length;
    const sub= nd? (nd+" patologías") : (nf? nf+" fármacos" : "por completar");
    const em=(nd||nf)?'':' empty';
    return '<button class="pato-tile" data-pato="'+ch[0]+'"><span class="pem">'+ch[1]+'</span><span class="pmeta"><span class="pname">'+ch[2]+'</span><span class="pcount'+em+'">'+sub+'</span></span></button>';
  }).join('');
  cont.innerHTML='<div class="pato-wrap"><div class="pato-intro">🗂️ <b>Patologías por capítulo (CIE-10).</b> Cada capítulo abre sus <b>patologías</b> concretas (o los principios activos del grupo). La seguridad E/L/IH/IR y las interacciones no se muestran: no hay ese dato y no se inventa.</div><div class="pato-grid">'+tiles+'</div></div>';
}
function renderPatoChapter(id){
  const ch=PATOCHAPTERS.find(c=>c[0]===id); if(!ch)return;
  const dis=PATODIS[id]||[];
  if(!dis.length){ renderPatoGroup(id); return; }
  const cont=$("#content");
  $("#count").textContent=dis.length+(dis.length===1?" patología":" patologías");
  const rows=dis.map(x=>'<div class="pato-drug"><div class="pd-top" data-patodis="'+id+'|'+x[0]+'"><span class="pd-name">'+x[1]+'</span><span class="pd-route">ver ›</span></div></div>').join('');
  cont.innerHTML='<div class="pato-wrap"><button class="pato-back" data-patoback="1">‹ Capítulos</button><div class="pato-h">'+ch[1]+' '+ch[2]+'</div><div class="pato-intro">Patologías de este capítulo. Pulsa una para ver su contenido.</div>'+rows+'<button class="pato-back" data-patogrp="'+id+'" style="margin-top:10px">Ver principios activos del grupo ›</button></div>';
  window.scrollTo(0,0);
}
function renderPatoGroup(id){
  const ch=PATOCHAPTERS.find(c=>c[0]===id); if(!ch)return;
  const cont=$("#content"); const list=patoDrugs(ch[3]); const hasDis=(PATODIS[id]||[]).length>0;
  $("#count").textContent=list.length+(list.length===1?" fármaco":" fármacos");
  const body= list.length ? list.map(o=>patoDrugCard(o.d,o.i)).join('') : '<div class="pato-empty">Este capítulo aún no tiene fármacos asignados en tu vademécum.</div>';
  const back= hasDis ? '<button class="pato-back" data-backchap="'+id+'">‹ '+ch[2]+'</button>' : '<button class="pato-back" data-patoback="1">‹ Capítulos</button>';
  cont.innerHTML='<div class="pato-wrap">'+back+'<div class="pato-h">'+ch[1]+' '+ch[2]+'</div><div class="pato-intro">Principios activos de este sistema (de tu vademécum). Pulsa un fármaco para ver su ficha.</div>'+body+'</div>';
  window.scrollTo(0,0);
}
function renderPatoDisease(chId,disId){
  const ch=PATOCHAPTERS.find(c=>c[0]===chId); const dis=(PATODIS[chId]||[]).find(x=>x[0]===disId);
  if(!ch||!dis)return;
  const cont=$("#content"); const sug=suggestDrugs(dis[1]); const def=PATODEF[disId]||"";
  $("#count").textContent=dis[1];
  const defHtml= def ? '<div class="pato-def"><h6>Definici\u00f3n</h6><p>'+def+'</p></div>' : '';
  const sugHtml= sug.length ? '<div class="relhead2">F\u00e1rmacos relacionados</div>'+sug.map(o=>patoDrugCard(o.d,o.i)).join('') : '<div class="pato-empty">Sin f\u00e1rmacos sugeridos autom\u00e1ticamente.</div>';
  const intro= def ? '<div class="pato-intro">Definici\u00f3n de referencia. Los f\u00e1rmacos de abajo son <b>relaciones cl\u00ednicas</b> de tu vademécum, <b>por revisar</b>; el manejo concreto queda por completar. E/L/IH/IR e interacciones no se muestran (sin dato).</div>' : '<div class="pato-intro">\u26a0 <b>Contenido por completar.</b> De momento, f\u00e1rmacos sugeridos autom\u00e1ticamente (por revisar).</div>';
  cont.innerHTML='<div class="pato-wrap"><button class="pato-back" data-backchap="'+chId+'">\u2039 '+ch[2]+'</button><div class="pato-h">'+dis[1]+'</div>'+defHtml+intro+sugHtml+'</div>';
  window.scrollTo(0,0);
}
document.addEventListener('click',function(e){
  const sp=e.target.closest('[data-pspeak]'); if(sp){e.stopPropagation();speakVadeDrug(+sp.dataset.pspeak,sp);return;}
  const ex=e.target.closest('[data-pexplain]'); if(ex){e.stopPropagation();explainVadeDrug(+ex.dataset.pexplain);return;}
  const dd=e.target.closest('[data-patodis]'); if(dd){const p=dd.dataset.patodis.split('|');renderPatoDisease(p[0],p[1]);return;}
  const gg=e.target.closest('[data-patogrp]'); if(gg){renderPatoGroup(gg.dataset.patogrp);return;}
  const bc=e.target.closest('[data-backchap]'); if(bc){renderPatoChapter(bc.dataset.backchap);return;}
  const tg=e.target.closest('[data-pdtoggle]'); if(tg){tg.parentNode.classList.toggle('open');return;}
  const tl=e.target.closest('[data-pato]'); if(tl){renderPatoChapter(tl.dataset.pato);return;}
  const bk=e.target.closest('[data-patoback]'); if(bk){renderPatologias();return;}

/* ===== HERRAMIENTAS: Calculadoras + NANDA/NIC/NOC ===== */
const HERRAMIENTAS_CHIP = "herramientas";

const CALCULADORAS = [
  {id:"glasgow",ico:"🧠",name:"Escala de Glasgow (GCS)",desc:"Nivel de conciencia: ocular + verbal + motor"},
  {id:"dilucion",ico:"💉",name:"Dilución de fármacos IV",desc:"Calcular concentración y ritmo de infusión"},
  {id:"dosispeso",ico:"⚖️",name:"Dosis por peso",desc:"mg/kg → dosis total según peso del paciente"},
  {id:"goteo",ico:"💧",name:"Ritmo de goteo",desc:"mL/h y gotas/min para una perfusión"},
  {id:"imc",ico:"📏",name:"Índice de masa corporal",desc:"IMC = peso / talla²"},
  {id:"chadvasc",ico:"❤️",name:"CHA₂DS₂-VASc",desc:"Riesgo tromboembólico en fibrilación auricular"},
  {id:"creatinina",ico:"🧪",name:"Aclaramiento de creatinina",desc:"Cockcroft-Gault: estimación del filtrado glomerular"},
  {id:"correccion_na",ico:"🧂",name:"Corrección de sodio",desc:"Na corregido por glucosa"},
  {id:"anion_gap",ico:"⚗️",name:"Anion Gap",desc:"Na − (Cl + HCO₃)"},
  {id:"superficie",ico:"📐",name:"Superficie corporal",desc:"Fórmula de Mosteller: √(peso×talla/3600)"},
];

const NANDA_DATA = [
  {code:"00029",title:"Disminución del gasto cardíaco",def:"Estado en el que la cantidad de sangre bombeada por el corazón es inadecuada para satisfacer las demandas metabólicas.",noc:"Efectividad de la bomba cardíaca · Estado circulatorio · Signos vitales",nic:"Manejo hemodinámico · Monitorización hemodinámica invasiva · Cuidados cardíacos agudos"},
  {code:"00030",title:"Deterioro del intercambio de gases",def:"Exceso o déficit en la oxigenación y/o eliminación de dióxido de carbono en la membrana alveolocapilar.",noc:"Estado respiratorio: intercambio gaseoso · Respuesta de la ventilación mecánica",nic:"Manejo de las vías aéreas · Oxigenoterapia · Monitorización respiratoria · Manejo de la ventilación mecánica"},
  {code:"00031",title:"Limpieza ineficaz de las vías aéreas",def:"Incapacidad para eliminar las secreciones u obstrucciones del tracto respiratorio.",noc:"Estado respiratorio: permeabilidad de vías aéreas",nic:"Aspiración de vías aéreas · Fisioterapia respiratoria · Manejo de vías aéreas artificiales"},
  {code:"00025",title:"Riesgo de desequilibrio de volumen de líquidos",def:"Riesgo de sufrir una disminución, aumento o cambio rápido de líquido intravascular, intersticial o intracelular.",noc:"Equilibrio hídrico · Hidratación",nic:"Manejo de líquidos · Monitorización de líquidos · Terapia intravenosa"},
  {code:"00132",title:"Dolor agudo",def:"Experiencia sensitiva y emocional desagradable provocada por una lesión tisular real o potencial, de inicio súbito, de cualquier intensidad.",noc:"Control del dolor · Nivel del dolor · Nivel de comodidad",nic:"Manejo del dolor · Administración de analgésicos · Manejo de la sedación"},
  {code:"00046",title:"Deterioro de la integridad cutánea",def:"Alteración de la epidermis y/o la dermis.",noc:"Integridad tisular: piel y membranas mucosas · Curación de heridas",nic:"Cuidados de la piel · Vigilancia de la piel · Prevención de úlceras por presión"},
  {code:"00004",title:"Riesgo de infección",def:"Aumento del riesgo de ser invadido por organismos patógenos.",noc:"Estado inmunitario · Conocimiento: control de la infección",nic:"Control de infecciones · Protección contra infecciones · Cuidados del catéter"},
  {code:"00039",title:"Riesgo de aspiración",def:"Riesgo de entrada de secreciones gastrointestinales, orofaríngeas, sólidos o líquidos en las vías traqueobronquiales.",noc:"Prevención de la aspiración · Estado de deglución",nic:"Precauciones para evitar aspiración · Manejo de vías aéreas · Alimentación enteral"},
  {code:"00128",title:"Confusión aguda",def:"Inicio brusco de alteraciones reversibles de la conciencia, atención, cognición y percepción.",noc:"Cognición · Orientación cognitiva",nic:"Manejo del delirio · Vigilancia · Orientación de la realidad · Manejo ambiental"},
  {code:"00155",title:"Riesgo de caídas",def:"Aumento de la susceptibilidad a las caídas que pueden causar daño físico.",noc:"Conducta de prevención de caídas · Movilidad",nic:"Prevención de caídas · Manejo ambiental: seguridad · Vigilancia"},
  {code:"00198",title:"Trastorno del patrón del sueño",def:"Interrupciones durante un tiempo limitado de la cantidad y calidad del sueño debidas a factores externos.",noc:"Sueño · Descanso",nic:"Mejorar el sueño · Manejo ambiental: confort · Manejo de la medicación"},
  {code:"00002",title:"Desequilibrio nutricional: inferior a las necesidades",def:"Ingesta de nutrientes insuficiente para satisfacer las necesidades metabólicas.",noc:"Estado nutricional · Ingesta de nutrientes",nic:"Manejo de la nutrición · Alimentación enteral · Monitorización nutricional"},
  {code:"00016",title:"Deterioro de la eliminación urinaria",def:"Disfunción en la eliminación de orina.",noc:"Eliminación urinaria · Continencia urinaria",nic:"Manejo de la eliminación urinaria · Sondaje vesical · Cuidados de la incontinencia"},
  {code:"00085",title:"Deterioro de la movilidad física",def:"Limitación del movimiento independiente e intencionado del cuerpo o de una o más extremidades.",noc:"Movilidad · Ambular · Posición corporal",nic:"Terapia de ejercicios · Cambio de posición · Fomento de la movilidad"},
  {code:"00146",title:"Ansiedad",def:"Sensación vaga e intranquilizadora de malestar o amenaza acompañada de una respuesta autonómica.",noc:"Autocontrol de la ansiedad · Nivel de ansiedad · Afrontamiento",nic:"Disminución de la ansiedad · Técnicas de relajación · Apoyo emocional · Presencia"},
];

function renderHerramientas(){
  const cont=$("#content");
  $("#count").textContent="Herramientas clínicas";
  // Calculators section
  const calcTiles=CALCULADORAS.map(c=>
    '<button class="tool-card" data-calc="'+c.id+'"><div class="tico">'+c.ico+'</div><div class="tname">'+c.name+'</div><div class="tdesc">'+c.desc+'</div></button>'
  ).join('');
  // NANDA section
  const nandaCards=NANDA_DATA.map(n=>
    '<div class="nanda-card"><div class="ncode">NANDA '+n.code+'</div><div class="ntitle">'+n.title+'</div><div class="ndef">'+n.def+'</div>'+
    '<div class="nlinks"><b>NOC:</b> '+n.noc+'<br><b>NIC:</b> '+n.nic+'</div></div>'
  ).join('');
  cont.innerHTML='<div class="tools-wrap">'+
    '<div class="pato-intro">🧰 <b>Herramientas clínicas para enfermería.</b> Calculadoras interactivas, validador de terminología NNN y taxonomía enfermera NANDA/NIC/NOC.</div>'+
    '<div class="nanda-section">🧮 Calculadoras clínicas</div>'+
    '<div class="tools-grid">'+calcTiles+'</div>'+
    '<div class="nanda-section" style="margin-top:20px">🔍 Validador de diagnósticos enfermeros (NNN)</div>'+
    '<div class="pato-intro">Escribe un diagnóstico enfermero y valida si tiene código NANDA-I / NIC / NOC verificado en NNNConsult. Solo devuelve códigos confirmados manualmente — nunca inventa.</div>'+
    '<div class="nnn-validator">'+
      '<div class="nnn-input-row">'+
        '<input type="text" id="nnnInput" class="nnn-search" placeholder="Ej: riesgo de deterioro de la integridad cutánea" autocomplete="off">'+
        '<button id="nnnBtn" class="calc-btn" style="margin:0;white-space:nowrap">Validar</button>'+
      '</div>'+
      '<div id="nnnResult"></div>'+
    '</div>'+
    '<div class="nanda-section" style="margin-top:20px">📋 Diagnósticos enfermeros NANDA · NOC · NIC (UCI / hospitalización)</div>'+
    '<div class="pato-intro">Los 15 diagnósticos NANDA más usados en UCI y hospitalización, con sus resultados esperados (NOC) e intervenciones (NIC). Pulsa uno para validarlo.</div>'+
    nandaCards+
    '</div>';
  const nnnInput=document.getElementById('nnnInput');
  const nnnBtn=document.getElementById('nnnBtn');
  const nnnResult=document.getElementById('nnnResult');
  async function validarNNN(){
    const valor=nnnInput.value.trim();
    if(valor.length<2){nnnResult.innerHTML='<div class="nnn-msg nnn-warn">Escribe al menos 2 caracteres.</div>';return;}
    nnnBtn.disabled=true;nnnBtn.textContent='Validando…';
    nnnResult.innerHTML='<div class="nnn-msg">Consultando diccionario NNN…</div>';
    try{
      const r=await fetch('/api/terminology/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor,via:'nnn'})});
      const d=await r.json();
      if(!r.ok){nnnResult.innerHTML='<div class="nnn-msg nnn-warn">'+(d.error||'Error')+'</div>';return;}
      if(d.code_status==='coded'){
        nnnResult.innerHTML=
          '<div class="nnn-coded">'+
            '<div class="nnn-badge">✓ Código verificado</div>'+
            '<div class="nanda-card" style="margin-top:8px">'+
              '<div class="ncode">NANDA-I '+d.nanda.code+'</div>'+
              '<div class="ntitle">'+d.nanda.label+'</div>'+
              '<div class="nlinks" style="margin-top:8px"><b>NIC:</b> '+d.nic.code+' — '+d.nic.label+'</div>'+
              '<div class="nlinks"><b>NOC:</b> '+d.noc.code+' — '+d.noc.label+'</div>'+
              '<div class="nlinks" style="margin-top:6px;font-size:10.5px"><b>Fuente:</b> '+d.fuente+' · <b>Verificado:</b> '+d.fecha_verificacion+' · <b>Por:</b> '+d.revisado_por+'</div>'+
            '</div>'+
          '</div>';
      }else{
        nnnResult.innerHTML=
          '<div class="nnn-unvalidated">'+
            '<div class="nnn-badge nnn-badge-pending">⚠ Sin código verificado</div>'+
            '<div class="nnn-reason">'+(d.reason||'Término no encontrado en el diccionario NNN.')+'</div>'+
          '</div>';
      }
    }catch(e){nnnResult.innerHTML='<div class="nnn-msg nnn-warn">Error de conexión: '+e.message+'</div>';}
    finally{nnnBtn.disabled=false;nnnBtn.textContent='Validar';}
  }
  nnnBtn.onclick=validarNNN;
  nnnInput.addEventListener('keydown',e=>{if(e.key==='Enter')validarNNN();});
  document.querySelectorAll('.nanda-card').forEach(card=>{
    card.style.cursor='pointer';
    card.addEventListener('click',()=>{
      const title=card.querySelector('.ntitle');
      if(title){nnnInput.value=title.textContent;validarNNN();}
    });
  });
}
function renderCalc(id){
  const cont=$("#content"); const c=CALCULADORAS.find(x=>x.id===id); if(!c)return;
  $("#count").textContent=c.name;
  let form='';
  if(id==='glasgow'){
    form='<div class="calc-row"><label for="gE">Apertura ocular</label> <select id="gE"><option value="4">4 - Espontánea</option><option value="3">3 - A la voz</option><option value="2">2 - Al dolor</option><option value="1">1 - Ninguna</option></select></div>'+
    '<div class="calc-row"><label for="gV">Respuesta verbal</label> <select id="gV"><option value="5">5 - Orientada</option><option value="4">4 - Confusa</option><option value="3">3 - Palabras inadecuadas</option><option value="2">2 - Sonidos</option><option value="1">1 - Ninguna</option></select></div>'+
    '<div class="calc-row"><label for="gM">Respuesta motora</label> <select id="gM"><option value="6">6 - Obedece</option><option value="5">5 - Localiza</option><option value="4">4 - Retirada</option><option value="3">3 - Flexión</option><option value="2">2 - Extensión</option><option value="1">1 - Ninguna</option></select></div>'+
    '<button class="calc-btn" data-calcrun="glasgow">Calcular</button>';
  } else if(id==='dilucion'){
    form='<div class="calc-row"><label for="dMg">Fármaco (mg)</label> <input id="dMg" type="number" placeholder="mg totales"></div>'+
    '<div class="calc-row"><label for="dVol">Volumen (mL)</label> <input id="dVol" type="number" placeholder="mL de dilución"></div>'+
    '<div class="calc-row"><label for="dRate">Ritmo (mL/h)</label> <input id="dRate" type="number" placeholder="mL/h"></div>'+
    '<button class="calc-btn" data-calcrun="dilucion">Calcular concentración y dosis/h</button>';
  } else if(id==='dosispeso'){
    form='<div class="calc-row"><label for="dpW">Peso (kg)</label> <input id="dpW" type="number" placeholder="kg"></div>'+
    '<div class="calc-row"><label for="dpD">Dosis (mg/kg)</label> <input id="dpD" type="number" step="0.01" placeholder="mg/kg"></div>'+
    '<button class="calc-btn" data-calcrun="dosispeso">Calcular dosis total</button>';
  } else if(id==='goteo'){
    form='<div class="calc-row"><label for="goV">Volumen total (mL)</label> <input id="goV" type="number" placeholder="mL"></div>'+
    '<div class="calc-row"><label for="goH">Tiempo (horas)</label> <input id="goH" type="number" step="0.5" placeholder="horas"></div>'+
    '<div class="calc-row"><label for="goF">Factor de goteo</label> <select id="goF"><option value="20">Macrogoteo (20 gts/mL)</option><option value="60">Microgoteo (60 gts/mL)</option></select></div>'+
    '<button class="calc-btn" data-calcrun="goteo">Calcular</button>';
  } else if(id==='imc'){
    form='<div class="calc-row"><label for="imcW">Peso (kg)</label> <input id="imcW" type="number" placeholder="kg"></div>'+
    '<div class="calc-row"><label for="imcH">Talla (cm)</label> <input id="imcH" type="number" placeholder="cm"></div>'+
    '<button class="calc-btn" data-calcrun="imc">Calcular IMC</button>';
  } else if(id==='chadvasc'){
    form='<div class="calc-row"><label for="cv1">ICC / FE ≤40%</label> <select id="cv1"><option value="0">No</option><option value="1">Sí (+1)</option></select></div>'+
    '<div class="calc-row"><label for="cv2">Hipertensión</label> <select id="cv2"><option value="0">No</option><option value="1">Sí (+1)</option></select></div>'+
    '<div class="calc-row"><label for="cv3">Edad ≥75</label> <select id="cv3"><option value="0">No</option><option value="2">Sí (+2)</option></select></div>'+
    '<div class="calc-row"><label for="cv4">Diabetes</label> <select id="cv4"><option value="0">No</option><option value="1">Sí (+1)</option></select></div>'+
    '<div class="calc-row"><label for="cv5">Ictus/AIT/TEP previo</label> <select id="cv5"><option value="0">No</option><option value="2">Sí (+2)</option></select></div>'+
    '<div class="calc-row"><label for="cv6">Enf. vascular</label> <select id="cv6"><option value="0">No</option><option value="1">Sí (+1)</option></select></div>'+
    '<div class="calc-row"><label for="cv7">Edad 65-74</label> <select id="cv7"><option value="0">No</option><option value="1">Sí (+1)</option></select></div>'+
    '<div class="calc-row"><label for="cv8">Sexo femenino</label> <select id="cv8"><option value="0">No</option><option value="1">Sí (+1)</option></select></div>'+
    '<button class="calc-btn" data-calcrun="chadvasc">Calcular</button>';
  } else if(id==='creatinina'){
    form='<div class="calc-row"><label for="ccAge">Edad (años)</label> <input id="ccAge" type="number" placeholder="años"></div>'+
    '<div class="calc-row"><label for="ccW">Peso (kg)</label> <input id="ccW" type="number" placeholder="kg"></div>'+
    '<div class="calc-row"><label for="ccCr">Creatinina (mg/dL)</label> <input id="ccCr" type="number" step="0.1" placeholder="mg/dL"></div>'+
    '<div class="calc-row"><label for="ccS">Sexo</label> <select id="ccS"><option value="1">Hombre</option><option value="0.85">Mujer</option></select></div>'+
    '<button class="calc-btn" data-calcrun="creatinina">Calcular Cockcroft-Gault</button>';
  } else if(id==='correccion_na'){
    form='<div class="calc-row"><label for="cnNa">Na medido (mEq/L)</label> <input id="cnNa" type="number" step="0.1" placeholder="mEq/L"></div>'+
    '<div class="calc-row"><label for="cnGlu">Glucosa (mg/dL)</label> <input id="cnGlu" type="number" placeholder="mg/dL"></div>'+
    '<button class="calc-btn" data-calcrun="correccion_na">Calcular Na corregido</button>';
  } else if(id==='anion_gap'){
    form='<div class="calc-row"><label for="agNa">Na (mEq/L)</label> <input id="agNa" type="number" step="0.1"></div>'+
    '<div class="calc-row"><label for="agCl">Cl (mEq/L)</label> <input id="agCl" type="number" step="0.1"></div>'+
    '<div class="calc-row"><label for="agHco">HCO₃ (mEq/L)</label> <input id="agHco" type="number" step="0.1"></div>'+
    '<button class="calc-btn" data-calcrun="anion_gap">Calcular Anion Gap</button>';
  } else if(id==='superficie'){
    form='<div class="calc-row"><label for="scW">Peso (kg)</label> <input id="scW" type="number"></div>'+
    '<div class="calc-row"><label for="scH">Talla (cm)</label> <input id="scH" type="number"></div>'+
    '<button class="calc-btn" data-calcrun="superficie">Calcular SC (Mosteller)</button>';
  }
  cont.innerHTML='<div class="tools-wrap"><button class="pato-back" data-toolsback="1">‹ Herramientas</button>'+
    '<div class="calc-panel"><h3>'+c.ico+' '+c.name+'</h3>'+form+'<div class="calc-result" id="calcRes"></div></div></div>';
  window.scrollTo(0,0);
}
function runCalc(id){
  const r=document.getElementById('calcRes'); if(!r)return;
  const v=s=>parseFloat(document.getElementById(s)?.value||0);
  if(id==='glasgow'){
    const e=v('gE'),vb=v('gV'),m=v('gM'),t=e+vb+m;
    const sev=t>=13?'Leve (13-15)':t>=9?'Moderado (9-12)':'Grave (3-8)';
    r.innerHTML='<b>Glasgow = '+t+'/15</b> → '+sev+'<br>O:'+e+' V:'+vb+' M:'+m;
  } else if(id==='dilucion'){
    const mg=v('dMg'),vol=v('dVol'),rate=v('dRate');
    if(!mg||!vol){r.innerHTML='Introduce mg y volumen.';return;}
    const conc=mg/vol; const dh=rate?conc*rate:0;
    r.innerHTML='<b>Concentración:</b> '+conc.toFixed(2)+' mg/mL'+(rate?'<br><b>Dosis/hora:</b> '+dh.toFixed(2)+' mg/h':'');
  } else if(id==='dosispeso'){
    const w=v('dpW'),d=v('dpD');
    if(!w||!d){r.innerHTML='Introduce peso y dosis.';return;}
    r.innerHTML='<b>Dosis total:</b> '+(w*d).toFixed(2)+' mg ('+w+' kg × '+d+' mg/kg)';
  } else if(id==='goteo'){
    const vol=v('goV'),h=v('goH'),f=v('goF');
    if(!vol||!h){r.innerHTML='Introduce volumen y tiempo.';return;}
    const mlh=vol/h; const gpm=(vol*f)/(h*60);
    r.innerHTML='<b>'+mlh.toFixed(1)+' mL/h</b> · <b>'+gpm.toFixed(1)+' gotas/min</b> (factor '+f+')';
  } else if(id==='imc'){
    const w=v('imcW'),h=v('imcH');
    if(!w||!h){r.innerHTML='Introduce peso y talla.';return;}
    const imc=w/((h/100)*(h/100));
    const cat=imc<18.5?'Bajo peso':imc<25?'Normal':imc<30?'Sobrepeso':imc<35?'Obesidad grado I':imc<40?'Obesidad grado II':'Obesidad grado III';
    r.innerHTML='<b>IMC = '+imc.toFixed(1)+' kg/m²</b> → '+cat;
  } else if(id==='chadvasc'){
    let t=0; for(const s of['cv1','cv2','cv3','cv4','cv5','cv6','cv7','cv8'])t+=v(s);
    const risk=t===0?'Bajo (0): no anticoagular':t===1?'Bajo-intermedio (1): considerar anticoagulación':'Alto ('+t+'): anticoagulación recomendada';
    r.innerHTML='<b>CHA₂DS₂-VASc = '+t+'</b><br>'+risk;
  } else if(id==='creatinina'){
    const age=v('ccAge'),w=v('ccW'),cr=v('ccCr'),s=v('ccS');
    if(!age||!w||!cr){r.innerHTML='Introduce todos los campos.';return;}
    const ccg=((140-age)*w*s)/(72*cr);
    r.innerHTML='<b>ClCr = '+ccg.toFixed(1)+' mL/min</b> (Cockcroft-Gault)';
  } else if(id==='correccion_na'){
    const na=v('cnNa'),glu=v('cnGlu');
    if(!na||!glu){r.innerHTML='Introduce Na y glucosa.';return;}
    const corr=na+0.016*(glu-100);
    r.innerHTML='<b>Na corregido = '+corr.toFixed(1)+' mEq/L</b><br>(fórmula: Na + 1.6 × [(Glu−100)/100])';
  } else if(id==='anion_gap'){
    const na=v('agNa'),cl=v('agCl'),hco=v('agHco');
    if(!na){r.innerHTML='Introduce los valores.';return;}
    const ag=na-cl-hco;
    r.innerHTML='<b>Anion Gap = '+ag.toFixed(1)+' mEq/L</b><br>Normal: 8-12 mEq/L'+(ag>12?' → <b>Elevado</b>':'');
  } else if(id==='superficie'){
    const w=v('scW'),h=v('scH');
    if(!w||!h){r.innerHTML='Introduce peso y talla.';return;}
    const sc=Math.sqrt((w*h)/3600);
    r.innerHTML='<b>SC = '+sc.toFixed(2)+' m²</b> (Mosteller)';
  }
}

document.addEventListener('click',function(e){
  const tc=e.target.closest('[data-calc]'); if(tc){renderCalc(tc.dataset.calc);return;}
  const tb=e.target.closest('[data-toolsback]'); if(tb){renderHerramientas();return;}
  const cr=e.target.closest('[data-calcrun]'); if(cr){runCalc(cr.dataset.calcrun);return;}
});

});


function saveApiKey(val){
  if(!val) return;
  store.set("guiaHJ23_apikey", val.trim());
  document.querySelectorAll(".api-key-input").forEach(input => input.value = val.trim());
  document.querySelectorAll(".api-key-box").forEach(el => el.style.display = "none");
  toast("Clave guardada");
}
/* La caja de clave del modal sólo tiene sentido si el servidor NO puede
   responder: la consulta, la explicación de fármaco y las lecturas de imagen
   van ya por el servidor con su propia clave. Se pregunta una vez y se
   recuerda; mientras no se sepa, se deja como estaba para no parpadear.
   Quien necesite la clave para lo que aún depende de ella (el editor de
   Proyectos, Javny 2.0) la tiene en Ajustes, que tiene su propio campo. */
let servidorResponde = null;
function servidorPuedeResponder(){
  if(servidorResponde !== null) return Promise.resolve(servidorResponde);
  return fetch('/api/javny/health')
    .then(r => r.ok ? r.json() : {})
    .then(d => { servidorResponde = !!(d.geminiConfigured || d.imagenConfigurada || d.farmacoConfigurado); return servidorResponde; })
    .catch(() => { servidorResponde = false; return false; });
}
function checkApiKeyUI(){
  const key = store.get("guiaHJ23_apikey");
  document.querySelectorAll(".api-key-input").forEach(input => input.value = key || "");
  servidorPuedeResponder().then(puede => {
    document.querySelectorAll(".api-key-box").forEach(el => el.style.display = (key || puede) ? "none" : "flex");
  });
}

/* ---------- asistente AI ---------- */
const overlay=$("#overlay"),qinput=$("#qinput"),qsendBtn=$("#qsendBtn"),qmicBtn=$("#qmicBtn"),modalBody=$("#modalBody");
function openModal(){overlay.classList.add("show");checkApiKeyUI();setTimeout(()=>qinput.focus(),200)}
function closeModal(){overlay.classList.remove("show");stopSpeak()}
let autoVoice=store.get("guiaHJ23_autovoice")==="1";
const voiceToggle=$("#voiceToggle");

function paintVoiceToggle(){
  voiceToggle.textContent=autoVoice?"🔊":"🔇";
  voiceToggle.style.background=autoVoice?"var(--ictus)":"";
  voiceToggle.style.color=autoVoice?"#fff":"";
  voiceToggle.style.borderColor=autoVoice?"transparent":"";
}
paintVoiceToggle();
voiceToggle.onclick=()=>{
  autoVoice=!autoVoice;
  store.set("guiaHJ23_autovoice",autoVoice?"1":"0");
  paintVoiceToggle();
  if(autoVoice){
    try{synth&&synth.cancel();const w=new SpeechSynthesisUtterance(" ");w.volume=0;synth&&synth.speak(w)}catch(e){}
    toast("🔊 Te leeré las respuestas en voz alta");
  }else{
    stopSpeak();
    toast("🔇 Respuesta en voz desactivada");
  }
};
$("#askFab").onclick=openModal;$("#modalClose").onclick=closeModal;
overlay.onclick=e=>{if(e.target===overlay)closeModal()};
qinput.oninput=()=>{qinput.style.height="auto";qinput.style.height=Math.min(qinput.scrollHeight,120)+"px"};
qmicBtn.onclick=()=>dictate(qmicBtn,
  v=>{qinput.value=v;qinput.oninput()},
  final=>{
    qinput.value=final;qinput.oninput();
    const handled = handleVoiceCommand(final);
    if (!handled) {
      ask();
    }
  }
);
qsendBtn.onclick=ask;
qinput.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}};
document.addEventListener("click",e=>{const ex=e.target.closest(".ex");if(ex){qinput.value=ex.textContent;qinput.oninput();ask()}});

/* Consulta del modal, contra el orquestador del servidor.
   Antes montaba aquí su propio guion de sistema con TODAS las fichas
   concatenadas (KB) y llamaba a Google desde el navegador con la clave del
   usuario: sin clave no respondía, y con ella daba una respuesta distinta a
   la del chat y la portada, porque el guion era otro. Ahora usa el mismo
   camino que ellos, así que el guion clínico es uno solo
   (sources/guion-clinico.mjs) y las fichas las recupera EnferixGuideRetrieve
   en vez de ir enteras en el prompt.

   Se usa /api/javny/chat/stream y no /api/javny/chat porque el no-streaming
   sigue siendo sólo de Gemini: con ANTHROPIC_API_KEY como único proveedor
   fallaría. El texto se acumula aquí y se pinta al terminar, que es lo que
   espera renderAnswer(). */
function contextoInternoJavny(q){
  var guides='', library='';
  try{ if(typeof window.EnferixGuideRetrieve==='function') guides=(window.EnferixGuideRetrieve(q)||{}).context||''; }catch(e){}
  try{ if(typeof window.EnferixLibraryRetrieve==='function') library=window.EnferixLibraryRetrieve(q,8)||''; }catch(e){}
  return {guides:guides, library:library, nearby:''};
}

/* Consulta al orquestador del servidor, en streaming NDJSON.
   Expuesta como global porque la usan los DOS caminos que llegan al modal:
   ask() y el interceptor de Javny 2.0 (inurse52-javny-js.js), que se carga
   después de este archivo. Si cada uno montara la suya, volveríamos a tener
   respuestas distintas según qué capa atienda el mismo botón.

   Se usa /api/javny/chat/stream y no /api/javny/chat porque el no-streaming
   sigue siendo sólo de Gemini: con ANTHROPIC_API_KEY como único proveedor
   fallaría. El texto se acumula aquí y se devuelve entero. */
window.EnferixConsultaServidor = async function(question, contextoExtra){
  const contexto = Object.assign(contextoInternoJavny(question), contextoExtra||{});
  const r = await fetch('/api/javny/chat/stream',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({question:question, context:contexto, history:[], caseMemory:[], route:{}})
  });
  if(!r.ok||!r.body){
    const d = await r.json().catch(()=>({}));
    throw new Error(d.error||('El servidor respondió HTTP '+r.status));
  }
  const reader=r.body.getReader(), dec=new TextDecoder('utf-8');
  let buf='', answer='', hecho=false, fallo=null;
  function linea(l){
    l=l.trim(); if(!l)return;
    let evt; try{evt=JSON.parse(l)}catch(e){return}
    // El evento delta trae SÓLO el trozo nuevo; el texto se acumula aquí,
    // igual que en la portada, el chat del avatar y javny-publico.html.
    if(evt.type==='delta') answer+=evt.chunk||'';
    else if(evt.type==='done'){ answer=(evt.answer||answer||'').trim(); hecho=true; }
    else if(evt.type==='error') fallo=evt.error||'Error del servidor';
  }
  for(;;){
    const {done,value}=await reader.read();
    if(done){ const resto=buf.trim(); if(resto)linea(resto); break; }
    buf+=dec.decode(value,{stream:true});
    const ls=buf.split('\n'); buf=ls.pop();
    for(const l of ls) linea(l);
  }
  if(fallo) throw new Error(fallo);
  if(!hecho||!answer) throw new Error('El servidor terminó la respuesta sin texto.');
  return answer;
};

/* Consulta del modal. Antes montaba aquí su propio guion de sistema con TODAS
   las fichas concatenadas (KB) y llamaba a Google desde el navegador con la
   clave del usuario: sin clave no respondía, y con ella daba una respuesta
   distinta a la del chat y la portada, porque el guion era otro. */
async function ask(){
  const q=qinput.value.trim();if(!q)return;
  stopSpeak();qsendBtn.disabled=true;
  modalBody.innerHTML=`<div style="font-weight:700;margin-bottom:12px">"${q}"</div><div class="thinking">Buscando en tus guías <span class="dots"><span></span><span></span><span></span></span></div>`;
  modalBody.scrollTop=0;
  try{
    renderAnswer(q, await window.EnferixConsultaServidor(q));
  }catch(err){modalBody.innerHTML=`<div class="placeholder-ans">❌ No se ha podido responder: ${escaparTexto(err.message)}</div>`}
  finally{qsendBtn.disabled=false}
}
function mdToHtml(text){
  var s=text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  s=s.replace(/^### (.+)$/gm,'<h4 style="margin:14px 0 6px;font-size:15px;color:var(--ictus)">$1</h4>');
  s=s.replace(/^## (.+)$/gm,'<h3 style="margin:18px 0 8px;font-size:16px;color:var(--ictus)">$1</h3>');
  s=s.replace(/^# (.+)$/gm,'<h3 style="margin:18px 0 8px;font-size:17px;color:var(--ictus)">$1</h3>');
  s=s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  s=s.replace(/\*(.+?)\*/g,'<em>$1</em>');
  s=s.replace(/^- (.+)$/gm,'<li style="margin:2px 0 2px 18px">$1</li>');
  s=s.replace(/^(\d+)\. (.+)$/gm,'<li style="margin:2px 0 2px 18px;list-style:decimal">$1. $2</li>');
  s=s.replace(/\n{2,}/g,'<br><br>');
  s=s.replace(/\n/g,'<br>');
  return s;
}
function renderAnswer(q,answer){
  const safe=mdToHtml(answer);
  modalBody.innerHTML=`<div style="font-weight:700;margin-bottom:12px;color:var(--text-dim);font-size:13px">PREGUNTA</div>
    <div style="font-weight:700;margin-bottom:16px">${q}</div>
    <div style="font-weight:700;margin-bottom:8px;color:var(--ictus);font-size:13px">RESPUESTA</div>
    <div class="ans" id="answerText">${safe}</div>
    <div class="ans-tools"><button class="ans-tool" id="answerSpeak">🔊 Escuchar</button><button class="ans-tool" id="answerShare">📤 Compartir</button></div>`;
  const sb=$("#answerSpeak");sb._reset=()=>sb.textContent="🔊 Escuchar";
  sb.onclick=()=>{if(speakingBtn===sb){stopSpeak();return}sb.textContent="⏹ Parar";speak(answer,sb)};
  if(autoVoice){sb.textContent="⏹ Parar";speak(answer,sb)}
  $("#answerShare").onclick=async()=>{
    const txt="🩺 "+q+"\n\n"+answer+"\n\n— Asistente Enferix";
    if(navigator.share){try{await navigator.share({title:q,text:txt});return}catch(e){if(e.name==="AbortError")return}}
    window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank");
  };
}

function normaliza(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
const STOP=new Set("para con sin como cuando donde tiene esta este esto unos unas paciente caso protocolo hacer hago debo tengo sobre tras desde hasta entre tambien pero porque segun una uno los las que del".split(" "));
const DOCBLOBS=DOCS.map(d=>({d,strong:normaliza(d.title+" "+d.tags),full:normaliza(d.title+" "+d.tags+" "+d.summary+" "+d.sec.map(s=>s.h+" "+stripHTML(s.b)).join(" "))}));
function scoreDocs(text){
  const toks=[...new Set(normaliza(text).split(/[^a-z0-9]+/).filter(w=>w.length>3&&!STOP.has(w)))];
  if(!toks.length)return [];
  const scored=DOCBLOBS.map(({d,strong,full})=>{let s=0;toks.forEach(t=>{if(strong.includes(t))s+=2;else if(full.includes(t))s+=1});return {d,score:s}}).sort((a,b)=>b.score-a.score);
  const max=(scored[0]&&scored[0].score)||1;
  return scored.map(r=>({d:r.d,score:r.score,pct:Math.round(r.score/max*100)}));
}
const recOverlay=$("#recOverlay"),recMic=$("#recMic"),recHint=$("#recHint");
function openRec(){recOverlay.classList.add("show")}
function closeRec(){recOverlay.classList.remove("show");if(recMic._rec)recMic._rec.stop();stopSpeak()}
function sendToAssistant(text){closeRec();openModal();qinput.value=text;qinput.oninput();ask()}

function openDoc(id){
  const d=DOCS.find(x=>x.id===id);if(!d)return;
  addHistory(id);
  activeCat="all";query="";searchInput.value="";clearBtn.style.display="none";
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c.dataset.c==='all'));
  groupsOpen.add(d.cat);store.set("guiaHJ23_groups",JSON.stringify([...groupsOpen]));
  render();
  closeRec();
  setTimeout(()=>{const card=$("#card-"+id);if(card){if(!card.classList.contains("open"))toggle(id);card.scrollIntoView({behavior:"smooth",block:"center"})}},150);
}

function analyze(text){
  const t=$("#transcript");t.style.display="block";t.textContent=text;
  const ranked=scoreDocs(text).filter(r=>r.score>0).slice(0,3);
  const res=$("#recResults");
  if(!ranked.length){res.innerHTML=`<div class="rec-none">🤔 No he encontrado un protocolo claro.<br>Describe el síntoma o el diagnóstico con un poco más de detalle.</div>`;return}
  res.innerHTML=`<div class="rec-label">Protocolos relacionados</div>`+ranked.map((r,i)=>{const c=CATS[r.d.cat] || {color:"#475569", icon:"🩺"};return `<div class="match" style="--ac:${c.color}" onclick="openDoc('${r.d.id}')"><div class="match-top"><span class="match-ic">${c.icon}</span><div class="match-meta"><div class="match-title">${r.d.title}</div><div class="match-src">${r.d.source}</div></div>${i===0?'<span class="match-badge">Mejor</span>':''}</div><div class="match-barwrap"><div class="match-bar" style="width:${r.pct}%"></div></div></div>`}).join("")+`<button class="rec-action" id="recActionBtn">📋 Dame la actuación paso a paso</button>`;
  const act=$("#recActionBtn");if(act)act.onclick=()=>sendToAssistant(text);
}
recMic.onclick=()=>{
  if(recMic._rec){dictate(recMic);return}
  $("#recResults").innerHTML="";const t=$("#transcript");t.style.display="block";t.textContent="…";
  recHint.textContent="Escuchando… toca otra vez para parar";
  dictate(recMic,
    v=>{t.textContent=v||"…"},
    final=>{
      recHint.textContent="Toca el micro para grabar otra vez";
      const handled = handleVoiceCommand(final);
      if (!handled) {
        analyze(final);
      }
    }
  );
};
$("#recFab").onclick=openRec;$("#recClose").onclick=closeRec;
recOverlay.onclick=e=>{if(e.target===recOverlay)closeRec()};

/* ---------- RETO DEL ELECTRO ---------- */
const ecgOverlay=$("#ecgOverlay"),ecgFile=$("#ecgFile"),ecgDrop=$("#ecgDrop"),ecgGuess=$("#ecgGuess"),ecgMic=$("#ecgMic"),ecgSend=$("#ecgSend");
let ecgImage=null;
function openEcg(){ecgOverlay.classList.add("show");checkApiKeyUI()}
function closeEcg(){ecgOverlay.classList.remove("show");stopSpeak();if(ecgMic._rec)ecgMic._rec.stop()}
$("#ecgFab").onclick=openEcg;$("#ecgClose").onclick=closeEcg;
ecgOverlay.onclick=e=>{if(e.target===ecgOverlay)closeEcg()};
ecgDrop.onclick=()=>ecgFile.click();
ecgFile.onchange=()=>{
  const f=ecgFile.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    ecgImage={data:r.result.split(",")[1],media:f.type||"image/jpeg"};
    ecgDrop.innerHTML=`<img src="${r.result}" alt="Electrocardiograma cargado para análisis" style="width:100%;border-radius:10px;display:block"><div style="margin-top:8px;font-size:12px">Toca para cambiar la imagen</div>`;
  };
  r.readAsDataURL(f);
};
ecgGuess.oninput=()=>{ecgGuess.style.height="auto";ecgGuess.style.height=Math.min(ecgGuess.scrollHeight,120)+"px"};
ecgMic.onclick=()=>dictate(ecgMic,
  v=>{ecgGuess.value=v;ecgGuess.oninput()},
  final=>{
    ecgGuess.value=final;ecgGuess.oninput();
    const handled = handleVoiceCommand(final);
    if (!handled) {
      // do nothing, let them click send
    }
  }
);
function renderEcg(answer){
  const safe=answer.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
  $("#ecgResult").innerHTML=`<div style="font-weight:700;margin:18px 0 8px;color:var(--ictus);font-size:13px">RESPUESTA</div><div class="ans">${safe}</div><div class="ans-tools"><button class="ans-tool" id="ecgSpeak">🔊 Escuchar</button></div>`;
  const sb=$("#ecgSpeak");sb._reset=()=>sb.textContent="🔊 Escuchar";
  sb.onclick=()=>{if(speakingBtn===sb){stopSpeak();return}sb.textContent="⏹ Parar";speak(answer,sb)};
  if(autoVoice){sb.textContent="⏹ Parar";speak(answer,sb)}
}
/* Lectura de imagen clínica contra el servidor.
   La sistemática de lectura (el guion del ECG y el de la radiografía) vive
   SÓLO en sources/imagen-clinica.mjs. Antes estaba aquí, en el navegador, y se
   llamaba a Google con la clave que el usuario se hubiera pegado en Ajustes:
   quien no tuviera clave propia veía "Introduce tu Gemini API Key primero" y
   no podía analizar nada. Duplicar el guion en el cliente para conservar ese
   camino haría que la lectura cambiase según por dónde entrase, así que el
   camino directo se ha retirado entero. */
function escaparTexto(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
async function analizarImagenClinica(tipo, imagen, contexto){
  /* La serie la prepara el laboratorio de imagen (inurse-rxecg-v04): varias
     radiografías del mismo paciente, o los cortes extraídos de un vídeo (TAC
     grabado en pantalla). Con una sola imagen el cuerpo no cambia. */
  const serie = (tipo === 'rx' && Array.isArray(window.__rxSerie) && window.__rxSerie.length > 1) ? window.__rxSerie : null;
  const body = serie
    ? { tipo, imagenes: serie, origenVideo: window.__rxSerieVideo === true, contexto: contexto || '' }
    : { tipo, data: imagen.data, media: imagen.media, contexto: contexto || '' };
  const r = await fetch('/api/javny/imagen', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error || ('El servidor respondió HTTP '+r.status));
  if(!data.answer) throw new Error('El servidor devolvió una respuesta vacía.');
  return data.answer;
}

ecgSend.onclick=async()=>{
  if(!ecgImage){toast("Primero añade la foto del electro");return}
  const guess=ecgGuess.value.trim();ecgSend.disabled=true;
  const result=$("#ecgResult");result.innerHTML=`<div class="thinking">Analizando el trazado <span class="dots"><span></span><span></span><span></span></span></div>`;
  try{
    renderEcg(await analizarImagenClinica('ecg', ecgImage, guess));
  }catch(e){result.innerHTML=`<div class="placeholder-ans">❌ No se ha podido analizar el trazado: ${escaparTexto(e.message)}</div>`}
  finally{ecgSend.disabled=false}
};

/* ===== Diagnóstico por Imagen (Rayos X · lectura con Javny) ===== */
const rxOverlay=$("#rxOverlay"),rxFile=$("#rxFile"),rxDrop=$("#rxDrop"),rxGuess=$("#rxGuess"),rxMic=$("#rxMic"),rxSend=$("#rxSend");
let rxImage=null;
function openRx(){rxOverlay.classList.add("show");checkApiKeyUI()}
function closeRx(){rxOverlay.classList.remove("show");stopSpeak();if(rxMic._rec)rxMic._rec.stop()}
$("#rxFab").onclick=openRx;$("#rxClose").onclick=closeRx;
rxOverlay.onclick=e=>{if(e.target===rxOverlay)closeRx()};
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  if(recOverlay.classList.contains('show'))closeRec();
  else if(ecgOverlay.classList.contains('show'))closeEcg();
  else if(rxOverlay.classList.contains('show'))closeRx();
});
rxDrop.onclick=()=>rxFile.click();
rxFile.onchange=()=>{
  const f=rxFile.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    rxImage={data:r.result.split(",")[1],media:f.type||"image/jpeg"};
    rxDrop.innerHTML=`<img src="${r.result}" alt="Radiografía cargada para análisis" style="width:100%;border-radius:10px;display:block"><div style="margin-top:8px;font-size:12px">Toca para cambiar la imagen</div>`;
  };
  r.readAsDataURL(f);
};
rxGuess.oninput=()=>{rxGuess.style.height="auto";rxGuess.style.height=Math.min(rxGuess.scrollHeight,120)+"px"};
rxMic.onclick=()=>dictate(rxMic,
  v=>{rxGuess.value=v;rxGuess.oninput()},
  final=>{rxGuess.value=final;rxGuess.oninput();}
);
function renderRx(answer){
  const safe=answer.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
  $("#rxResult").innerHTML=`<div style="font-weight:700;margin:18px 0 8px;color:#8B5CF6;font-size:13px">LECTURA ORIENTATIVA</div><div class="ans">${safe}</div><div class="ans-tools"><button class="ans-tool" id="rxSpeak">🔊 Escuchar</button></div>`;
  const sb=$("#rxSpeak");sb._reset=()=>sb.textContent="🔊 Escuchar";
  sb.onclick=()=>{if(speakingBtn===sb){stopSpeak();return}sb.textContent="⏹ Parar";speak(answer,sb)};
  if(autoVoice){sb.textContent="⏹ Parar";speak(answer,sb)}
}
rxSend.onclick=async()=>{
  if(!rxImage){toast("Primero añade la foto de la imagen");return}
  const guess=rxGuess.value.trim();rxSend.disabled=true;
  const result=$("#rxResult");result.innerHTML=`<div class="thinking">Analizando la imagen <span class="dots"><span></span><span></span><span></span></span></div>`;
  try{
    renderRx(await analizarImagenClinica('rx', rxImage, guess));
  }catch(e){result.innerHTML=`<div class="placeholder-ans">❌ No se ha podido analizar la imagen: ${escaparTexto(e.message)}</div>`}
  finally{rxSend.disabled=false}
};


/* ===== VADEMÉCUM MÓDULO DRAWER INDEPENDIENTE ===== */
const vadeOv=document.getElementById('vadeOverlay');
const vadeListEl=document.getElementById('vadeList');
const vadeChipsEl=document.getElementById('vadeChips');
const vadeCountEl=document.getElementById('vadeCount');
const vadeSearchEl=document.getElementById('vadeSearch');
let vadeCat='all', vadeQ='';

function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

const vadeCounts={};
VADEM.forEach(d=>{vadeCounts[d.cat]=(vadeCounts[d.cat]||0)+1});

function buildVadeChips(){
  let html='<button class="vchip on" data-vc="all" style="--vc:#EC4899;background:#EC4899;border-color:#EC4899"><span class="vc-em">📋</span>Todos <span class="vc-n">'+VADEM.length+'</span></button>';
  VORDER.forEach(k=>{
    if(!VCATS[k]||!vadeCounts[k])return;
    const c=VCATS[k];
    html+='<button class="vchip" data-vc="'+k+'" style="--vc:'+c.color+'"><span class="vc-em">'+c.icon+'</span>'+c.name+' <span class="vc-n">'+vadeCounts[k]+'</span></button>';
  });
  vadeChipsEl.innerHTML=html;
  vadeChipsEl.querySelectorAll('.vchip').forEach(ch=>{
    ch.onclick=()=>{
      vadeCat=ch.dataset.vc;
      vadeChipsEl.querySelectorAll('.vchip').forEach(x=>{x.classList.remove('on');x.style.background='var(--card-solid)';x.style.borderColor='var(--border)';x.style.color='var(--text-dim)'});
      ch.classList.add('on');
      const col=ch.style.getPropertyValue('--vc')||'#EC4899';
      ch.style.background=col;ch.style.borderColor=col;ch.style.color='#fff';
      renderVade();
    };
  });
}

function vadeField(label,val,color){
  if(!val||!val.trim())return '';
  return '<div class="vc-sec" style="--vc:'+color+'"><h5>'+label+'</h5><p>'+val.replace(/</g,'&lt;')+'</p></div>';
}

function renderVade(){
  const nq=norm(vadeQ);
  let rows=VADEM.filter(d=>{
    if(vadeCat!=='all'&&d.cat!==vadeCat)return false;
    if(!nq)return true;
    return norm(d.n+' '+d.i+' '+d.a+' '+d.r+' '+(d.source||'')).includes(nq);
  });
  vadeCountEl.textContent=rows.length+(rows.length===1?' fármaco':' fármacos')+(vadeCat!=='all'&&VCATS[vadeCat]?' · '+VCATS[vadeCat].name:'');
  
  if(!rows.length){
    vadeListEl.innerHTML='<div class="vade-empty">Sin resultados. Prueba con otra palabra o categoría.</div>';
    return;
  }
  
  vadeListEl.innerHTML=rows.map((d,i)=>{
    const c=VCATS[d.cat]||{name:'Otros',color:'#475569'};
    const warn=d.cat==='obsoleto'?'<div class="vade-warn">⚠ Catalogado como potencialmente peligroso, obsoleto o ineficaz. Consultar antes de usar.</div>':'';
    return '<div class="vcard" style="--vc:'+c.color+'" data-i="'+i+'">'+
      '<div class="vcard-top" onclick="toggleVcard(this.parentNode)">'+
        '<span class="vc-name">'+d.n+'</span>'+
        (d.route?'<span class="vc-route" style="--vc:'+c.color+'">'+d.route+'</span>':'')+
        '<span class="vc-tag">'+c.name+'</span>'+
      '</div>'+
      (d.a?'<div class="vc-accion" onclick="toggleVcard(this.parentNode)">'+d.a.replace(/</g,'&lt;')+'</div>':'')+
      '<div class="vc-body">'+warn+
        vadeField('Indicaciones',d.i,c.color)+
        vadeField('Posología y adm.',d.p,c.color)+
        vadeField('Contraindicaciones',d.c,c.color)+
        vadeField('Efectos adv. / Notas',d.r,c.color)+
        '<div class="vc-sec" style="--vc:'+c.color+'"><h5>Fuente</h5><p style="font-size:11.5px;color:var(--text-dim)">'+(d.source||'No especificada')+'</p></div>'+
        '<div class="toolbar" style="margin-top:12px">'+
          '<button class="tool" style="--ac:'+c.color+'" onclick="event.stopPropagation();speakVadeDrug('+i+', this)">🔊 Escuchar ficha</button>'+
          '<button class="tool" style="--ac:'+c.color+'" onclick="event.stopPropagation();explainVadeDrug('+i+')">✨ Explícamelo</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

function toggleVcard(vcardEl){
  const open = vcardEl.classList.toggle('open');
  const body = vcardEl.querySelector('.vc-body');
  if(open){
    body.style.maxHeight = body.scrollHeight + 40 + 'px';
  } else {
    body.style.maxHeight = '0';
  }
}

function speakVadeDrug(idx, btn){
  const e=VADEM[idx];
  btn._reset=()=>btn.textContent="🔊 Escuchar ficha";
  if(speakingBtn===btn){stopSpeak();return}
  document.querySelectorAll(".tool.speaking").forEach(b=>{b.classList.remove("speaking");b.textContent="🔊 Escuchar ficha"});
  btn.textContent="⏹ Parar";
  
  let txt = e.n + ". " + (e.a || "") + ". Indicaciones: " + (e.i || "") + ". Posología: " + (e.p || "");
  speak(txt, btn);
}

/* El guion farmacológico vive SÓLO en sources/farmaco-ia.mjs. Antes estaba
   aquí y la llamada salía del navegador con la clave del usuario: sin clave,
   el panel decía "Introduce tu Gemini API Key para que te explique el fármaco"
   y no explicaba nada. */
async function explainVadeDrug(idx){
  const e=VADEM[idx];
  openModal();
  stopSpeak();
  modalBody.innerHTML=`<div style="font-weight:700;margin-bottom:12px">💊 ${e.n}</div><div class="thinking">Preparando la explicación de fármaco <span class="dots"><span></span><span></span><span></span></span></div>`;
  modalBody.scrollTop=0;
  try{
    const r=await fetch('/api/javny/farmaco',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ficha:{
        nombre:e.n, accion:e.a||'', indicaciones:e.i||'', posologia:e.p||'',
        contraindicaciones:e.c||'', reacciones:e.r||'', fuente:e.source||''
      }})
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.error||('El servidor respondió HTTP '+r.status));
    if(!data.answer) throw new Error('El servidor devolvió una respuesta vacía.');
    renderAnswer("💊 "+e.n,data.answer);
  }catch(err){modalBody.innerHTML=`<div class="placeholder-ans">❌ No se ha podido explicar el fármaco: ${escaparTexto(err.message)}</div>`}
}

function openVade(){
  buildVadeChips();
  renderVade();
  vadeOv.style.display='block';
  setTimeout(()=>{
    vadeOv.classList.add('on');
    vadeSearchEl.focus();
  },50);
}
function closeVade(){
  vadeOv.classList.remove('on');
  setTimeout(()=>{vadeOv.style.display='none';},300);
  stopSpeak();
}

$("#vadeBtn").onclick=openVade;
document.getElementById('vadeClose').onclick=closeVade;
vadeOv.onclick=e=>{if(e.target===vadeOv)closeVade();};
vadeSearchEl.oninput=()=>{
  vadeQ=vadeSearchEl.value;
  document.getElementById('vadeClear').style.display=vadeQ?'block':'none';
  renderVade();
};
document.getElementById('vadeClear').onclick=()=>{vadeSearchEl.value='';vadeQ='';document.getElementById('vadeClear').style.display='none';renderVade();vadeSearchEl.focus();};

/* ---------- MOTOR DE COMANDOS DE VOZ v8 ---------- */
function voiceAck(msg, spoken){
  toast(msg);
  if(autoVoice && synth){
    try{
      synth.cancel();
      const u=new SpeechSynthesisUtterance(spoken||msg.replace(/[^\p{L}\p{N}\s.,]/gu,"").trim());
      u.lang="es-ES";if(esVoice)u.voice=esVoice;u.rate=1.15;
      synth.speak(u);
    }catch(e){}
  }
}
function setCatVoice(cat){
  activeCat=cat;query="";searchInput.value="";clearBtn.style.display="none";
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c.dataset.c===cat));
  render();closeRec();
  const c=CATS[cat];
  voiceAck((c?c.icon+" ":"")+"Mostrando "+(c?c.name:cat),"Mostrando "+(c?c.name:cat));
}
const VOICE_CATS=[
  [["respiratorio","respiratorios","pulmon","pulmones","neumo"],"resp"],
  [["cardiologia","cardio","corazon","cardiaco","cardiaca"],"cardio"],
  [["ictus","neuro","neurologia","neurologico"],"ictus"],
  [["urgencias","parada","emergencias","emergencia","criticos"],"emer"],
  [["extrahospitalaria","extrahospitalarias","extra hospitalaria","extra hospitalarias","ambulancia"],"extra"],
  [["especialidades","especialidad"],"esp"],
  [["favoritos","favoritas","mis favoritos"],"fav"],
  [["todos","todas","todo","inicio","ver todo"],"all"]
];
function adjustRate(delta){
  let r=parseFloat(store.get("guiaHJ23_rate"))||1.05;
  r=Math.min(1.8,Math.max(0.6,+(r+delta).toFixed(2)));
  store.set("guiaHJ23_rate",r);
  voiceAck((delta>0?"⏩":"⏪")+" Velocidad de lectura: "+r.toFixed(2),"Velocidad ajustada");
}
function handleVoiceCommand(text) {
  const raw = text.trim();
  const clean = normaliza(raw);
  console.log("Comando de voz v8:", clean);

  /* --- ayuda --- */
  if (clean==="ayuda"||clean.includes("que puedo decir")||clean==="comandos"||clean==="comandos de voz") {
    openRec();
    const list=$("#cmdList");if(list)list.style.display="block";
    voiceAck("📖 Estos son los comandos disponibles","Aquí tienes los comandos disponibles");
    return true;
  }

  /* --- tema --- */
  if (clean.includes("modo oscuro") || clean.includes("modo noche")) {
    theme="dark";store.set("guiaHJ23_theme",theme);applyTheme();
    voiceAck("🌙 Modo oscuro activado");return true;
  }
  if (clean.includes("modo claro") || clean.includes("modo dia")) {
    theme="light";store.set("guiaHJ23_theme",theme);applyTheme();
    voiceAck("☀️ Modo claro activado");return true;
  }
  if (clean==="cambiar tema"||clean==="cambia el tema"||clean==="tema") {
    theme=theme==="light"?"dark":"light";store.set("guiaHJ23_theme",theme);applyTheme();
    voiceAck(theme==="light"?"☀️ Modo claro activado":"🌙 Modo oscuro activado");return true;
  }

  /* --- cerrar / parar --- */
  if (clean==="cerrar"||clean==="cerrar todo"||clean==="salir"||clean==="cierra todo") {
    closeModal();closeRec();closeEcg();closeVade();closeAtlas();
    document.querySelectorAll(".card.open").forEach(card=>{
      const det=card.querySelector(".detail");card.classList.remove("open");
      if(det)det.style.maxHeight="0";
    });
    stopSpeak();toast("🚪 Cerrado");return true;
  }
  if (clean==="parar"||clean==="silencio"||clean==="callar"||clean==="detener"||clean==="para"||clean==="calla") {
    stopSpeak();toast("🔇 Lectura detenida");return true;
  }

  /* --- velocidad de lectura --- */
  if (clean.includes("mas rapido")||clean.includes("mas deprisa")||clean.includes("acelera")) {adjustRate(0.15);return true;}
  if (clean.includes("mas despacio")||clean.includes("mas lento")||clean.includes("frena la lectura")) {adjustRate(-0.15);return true;}
  if (clean.includes("velocidad normal")) {store.set("guiaHJ23_rate",1.05);voiceAck("🔊 Velocidad normal restaurada");return true;}

  /* --- leer --- */
  if (clean==="leer"||clean==="escuchar"||clean==="reproducir"||clean==="lee"||clean==="leelo") {
    const openCard=document.querySelector(".card.open");
    if(openCard){speakCard(openCard.id.replace("card-",""));return true;}
    const answerText=document.getElementById("answerText");
    if(answerText&&overlay.classList.contains("show")){
      const btn=document.getElementById("answerSpeak");if(btn)btn.click();return true;
    }
    toast("Abre una guía para leerla");return true;
  }
  if (clean.startsWith("leer ")||clean.startsWith("lee ")) {
    const q=normaliza(clean.replace(/^leer? /,"").trim());
    const doc=DOCS.find(d=>normaliza(d.title).includes(q));
    if(doc){openDoc(doc.id);setTimeout(()=>speakCard(doc.id),600);voiceAck("🔊 Leyendo "+doc.title);return true;}
  }

  /* --- asistente IA --- */
  if (clean==="asistente"||clean==="preguntar"||clean==="abrir asistente"||clean==="abre el asistente") {
    closeRec();openModal();voiceAck("✨ Asistente abierto, dime tu pregunta");return true;
  }
  if (clean.startsWith("asistente ")||clean.startsWith("preguntar ")||clean.startsWith("pregunta ")||clean.startsWith("consulta ")) {
    const q=raw.replace(/^\S+\s+/,"").trim();
    if(q){sendToAssistant(q);return true;}
  }

  /* --- vademécum --- */
  if (clean==="vademecum"||clean==="abrir vademecum"||clean==="abre el vademecum"||clean==="medicamentos"||clean==="farmacos") {
    closeRec();openVade();voiceAck("💊 Vademécum abierto");return true;
  }
  if (clean.startsWith("vademecum ")||clean.startsWith("buscar medicamento ")||clean.startsWith("buscar farmaco ")||clean.startsWith("medicamento ")||clean.startsWith("farmaco ")) {
    const q=raw.replace(/^(vadem[eé]cum|buscar medicamento|buscar f[aá]rmaco|medicamento|f[aá]rmaco)\s+/i,"").trim();
    if(q){
      closeRec();openVade();
      vadeSearchEl.value=q;vadeQ=q;
      document.getElementById('vadeClear').style.display='block';
      renderVade();
      voiceAck("💊 Buscando "+q+" en el vademécum");
      return true;
    }
  }

  /* --- atlas ECG --- */
  if (clean==="atlas"||clean==="atlas ecg"||clean.includes("abrir atlas")||clean.includes("abre el atlas")||clean.includes("atlas de electros")) {
    closeRec();openAtlas();voiceAck("🫀 Atlas ECG abierto");return true;
  }

  /* --- reto del electro --- */
  if (clean.includes("reto del electro")||clean.includes("electrocardiograma")||clean==="electro"||clean==="analizar ecg"||clean.includes("analizar electro")) {
    closeRec();openEcg();voiceAck("📟 Reto del electro abierto");return true;
  }

  /* --- categorías por voz --- */
  for(const [words,cat] of VOICE_CATS){
    if(words.some(w=>clean===w||clean==="ver "+w||clean==="mostrar "+w||clean==="categoria "+w)){
      setCatVoice(cat);return true;
    }
  }

  /* --- búsqueda --- */
  if (clean.startsWith("buscar ")||clean.startsWith("busca ")) {
    const q=raw.replace(/^busca(r)?\s+/i,"").trim();
    if(q){applyQuery(q);closeRec();voiceAck("🔎 Buscando "+q);return true;}
  }
  if (clean==="limpiar"||clean==="borrar"||clean==="reiniciar"||clean==="borra la busqueda"||clean==="limpia") {
    applyQuery("");toast("🧹 Búsqueda limpia");return true;
  }
  if (clean==="subir"||clean==="arriba"||clean==="sube"||clean==="volver arriba") {
    window.scrollTo({top:0,behavior:"smooth"});closeRec();toast("⬆️ Arriba");return true;
  }

  /* --- abrir guía o fármaco --- */
  if (clean.startsWith("abrir ")||clean.startsWith("abre ")||clean.startsWith("abreme ")) {
    const q=clean.replace(/^abre(me)?\s+|^abrir\s+/,"").replace(/^(el|la|los|las)\s+/,"").trim();
    const cleanQ=normaliza(q);
    const doc=DOCS.find(d=>normaliza(d.title).includes(cleanQ)||normaliza(d.id).includes(cleanQ));
    if(doc){openDoc(doc.id);voiceAck("📖 Abriendo "+doc.title);return true;}
    const drugIdx=VADEM.findIndex(d=>normaliza(d.n).includes(cleanQ));
    if(drugIdx!==-1){
      closeRec();openVade();
      setTimeout(()=>{
        const card=document.querySelector(`.vcard[data-i="${drugIdx}"]`);
        if(card){
          card.classList.add("open");
          card.querySelector('.vc-body').style.maxHeight='1200px';
          card.scrollIntoView({behavior:"smooth",block:"center"});
        }
      },400);
      voiceAck("💊 Mostrando "+VADEM[drugIdx].n);return true;
    }
    voiceAck("🤔 No encontré "+q,"No he encontrado "+q);return true;
  }

  return false;
}

/* --- chips de comandos --- */
document.querySelectorAll(".cmd-chip").forEach(ch=>{
  ch.onclick=()=>{
    const cmd=ch.dataset.cmd;
    if(!handleVoiceCommand(cmd)) analyze(cmd);
  };
});
const cmdHelpBtn=$("#cmdHelpBtn");
if(cmdHelpBtn)cmdHelpBtn.onclick=()=>{
  const l=$("#cmdList");
  const show=l.style.display==="none";
  l.style.display=show?"block":"none";
  cmdHelpBtn.textContent=show?"▲ Ocultar comandos":"📖 Ver todos los comandos de voz";
};

document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    closeModal();
    closeRec();
    closeEcg();
    closeVade();
    closeAtlas();
  }
});

/* ---------- ATLAS ECG INTEGRADO ---------- */
const ATLAS_B64="PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVzIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9IlVURi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjAiPgo8dGl0bGU+QXRsYXMgRUNHIMK3IEhKMjM8L3RpdGxlPgo8c3R5bGU+CiAgOnJvb3R7CiAgICAtLWJnOiMwYzEwMTY7ICAgICAgICAgICAgLyogbW9uaXRvciBjaGFyY29hbCAqLwogICAgLS1iZzI6IzEwMTUxZDsKICAgIC0tc3VyZmFjZTojMTYxZDI3OwogICAgLS1zdXJmYWNlMjojMWMyNTMxOwogICAgLS1saW5lOiMyODM0NDU7CiAgICAtLWluazojZTllZWY1OwogICAgLS1tdXRlZDojOGI5N2E3OwogICAgLS10cmFjZTojM2RkYzk3OyAgICAgICAgIC8qIG1vbml0b3IgZ3JlZW4gKi8KICAgIC0tY3JpdDojZjA1MDZlOyAgICAgICAgICAvKiBjcsOtdGljbyAqLwogICAgLS11cmc6I2ZmOWY0MzsgICAgICAgICAgIC8qIHVyZ2VudGUgKi8KICAgIC0tYXR0OiNmZmQyNGE7ICAgICAgICAgICAvKiBhdGVuY2nDs24gKi8KICAgIC0tb2s6IzNkZGM5NzsgICAgICAgICAgICAvKiBub3JtYWwgKi8KICAgIC0tbW9ubzp1aS1tb25vc3BhY2UsIlNGIE1vbm8iLCJKZXRCcmFpbnMgTW9ubyIsIlJvYm90byBNb25vIixNZW5sbyxDb25zb2xhcyxtb25vc3BhY2U7CiAgICAtLXNhbnM6c3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sIlNlZ29lIFVJIixSb2JvdG8sSGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7CiAgfQogICp7Ym94LXNpemluZzpib3JkZXItYm94fQogIGh0bWwsYm9keXttYXJnaW46MDtwYWRkaW5nOjB9CiAgYm9keXsKICAgIGJhY2tncm91bmQ6CiAgICAgIHJhZGlhbC1ncmFkaWVudCgxMjAwcHggNjAwcHggYXQgNzUlIC0xMCUsICMxMzIwMmIgMCUsIHRyYW5zcGFyZW50IDYwJSksCiAgICAgIHZhcigtLWJnKTsKICAgIGNvbG9yOnZhcigtLWluayk7CiAgICBmb250LWZhbWlseTp2YXIoLS1zYW5zKTsKICAgIGxpbmUtaGVpZ2h0OjEuNTsKICAgIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6YW50aWFsaWFzZWQ7CiAgICBwYWRkaW5nLWJvdHRvbTo0OHB4OwogIH0KICBhe2NvbG9yOmluaGVyaXR9CgogIC8qIC0tLS0tLS0tLS0gaGVhZGVyIC8gc2lnbmF0dXJlIC0tLS0tLS0tLS0gKi8KICBoZWFkZXJ7CiAgICBwb3NpdGlvbjpzdGlja3k7dG9wOjA7ei1pbmRleDozMDsKICAgIGJhY2tncm91bmQ6bGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmdiYSgxMiwxNiwyMiwuOTYpLCByZ2JhKDEyLDE2LDIyLC44MikpOwogICAgYmFja2Ryb3AtZmlsdGVyOmJsdXIoOHB4KTsKICAgIGJvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWxpbmUpOwogIH0KICAuYmFyewogICAgbWF4LXdpZHRoOjEyMDBweDttYXJnaW46MCBhdXRvO3BhZGRpbmc6MTRweCAxOHB4IDA7CiAgICBkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxNnB4O2ZsZXgtd3JhcDp3cmFwOwogIH0KICAuYnJhbmR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDttaW4td2lkdGg6MH0KICAuYnJhbmQgLm1hcmt7ZmxleDowIDAgYXV0b30KICAuYnJhbmQgaDF7CiAgICBmb250LXNpemU6MTlweDttYXJnaW46MDtsZXR0ZXItc3BhY2luZzouMTRlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Zm9udC13ZWlnaHQ6NzAwOwogIH0KICAuYnJhbmQgaDEgc21hbGx7CiAgICBkaXNwbGF5OmJsb2NrO2ZvbnQtZmFtaWx5OnZhcigtLW1vbm8pO2ZvbnQtc2l6ZToxMC41cHg7bGV0dGVyLXNwYWNpbmc6LjIyZW07CiAgICBjb2xvcjp2YXIoLS10cmFjZSk7Zm9udC13ZWlnaHQ6NTAwO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTttYXJnaW4tdG9wOjJweDsKICB9CiAgLnNlYXJjaHsKICAgIG1hcmdpbi1sZWZ0OmF1dG87ZmxleDoxIDEgMjQwcHg7bWF4LXdpZHRoOjM4MHB4O3Bvc2l0aW9uOnJlbGF0aXZlOwogIH0KICAuc2VhcmNoIGlucHV0ewogICAgd2lkdGg6MTAwJTtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Y29sb3I6dmFyKC0taW5rKTsKICAgIGJvcmRlci1yYWRpdXM6OXB4O3BhZGRpbmc6OXB4IDEycHggOXB4IDM0cHg7Zm9udC1zaXplOjE0cHg7Zm9udC1mYW1pbHk6dmFyKC0tc2Fucyk7CiAgfQogIC5zZWFyY2ggaW5wdXQ6Zm9jdXN7b3V0bGluZToycHggc29saWQgdmFyKC0tdHJhY2UpO291dGxpbmUtb2Zmc2V0OjFweDtib3JkZXItY29sb3I6dHJhbnNwYXJlbnR9CiAgLnNlYXJjaCBzdmd7cG9zaXRpb246YWJzb2x1dGU7bGVmdDoxMHB4O3RvcDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTUwJSk7b3BhY2l0eTouNTV9CgogIC8qIGFuaW1hdGVkIGJhc2VsaW5lIHRyYWNlICovCiAgLnB1bHNle2hlaWdodDozNHB4O21heC13aWR0aDoxMjAwcHg7bWFyZ2luOjhweCBhdXRvIDA7cGFkZGluZzowIDE4cHg7b3ZlcmZsb3c6aGlkZGVufQogIC5wdWxzZSBzdmd7d2lkdGg6MTAwJTtoZWlnaHQ6MzRweDtkaXNwbGF5OmJsb2NrfQogIC5wdWxzZSBwYXRoewogICAgZmlsbDpub25lO3N0cm9rZTp2YXIoLS10cmFjZSk7c3Ryb2tlLXdpZHRoOjEuNjsKICAgIHN0cm9rZS1kYXNoYXJyYXk6MTYwMDtzdHJva2UtZGFzaG9mZnNldDoxNjAwOwogICAgYW5pbWF0aW9uOmRyYXcgNC41cyBsaW5lYXIgaW5maW5pdGU7CiAgICBmaWx0ZXI6ZHJvcC1zaGFkb3coMCAwIDRweCByZ2JhKDYxLDIyMCwxNTEsLjUpKTsKICB9CiAgQGtleWZyYW1lcyBkcmF3e3Rve3N0cm9rZS1kYXNob2Zmc2V0OjB9fQoKICAvKiAtLS0tLS0tLS0tIGNvbnRyb2xzIC0tLS0tLS0tLS0gKi8KICAud3JhcHttYXgtd2lkdGg6MTIwMHB4O21hcmdpbjowIGF1dG87cGFkZGluZzowIDE4cHh9CiAgLm5vdGV7CiAgICBkaXNwbGF5OmZsZXg7Z2FwOjEwcHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDsKICAgIGJhY2tncm91bmQ6dmFyKC0tc3VyZmFjZSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItbGVmdDozcHggc29saWQgdmFyKC0tdXJnKTsKICAgIGJvcmRlci1yYWRpdXM6MTBweDtwYWRkaW5nOjExcHggMTRweDttYXJnaW46MTZweCAwO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLW11dGVkKTsKICB9CiAgLm5vdGUgYntjb2xvcjp2YXIoLS1pbmspO2ZvbnQtd2VpZ2h0OjYwMH0KCiAgLmNvbnRyb2xze2Rpc3BsYXk6ZmxleDtnYXA6MTBweDthbGlnbi1pdGVtczpjZW50ZXI7ZmxleC13cmFwOndyYXA7bWFyZ2luOjE0cHggMCA0cHh9CiAgLmNoaXBze2Rpc3BsYXk6ZmxleDtnYXA6N3B4O2ZsZXgtd3JhcDp3cmFwfQogIC5jaGlwewogICAgYmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2NvbG9yOnZhcigtLW11dGVkKTsKICAgIHBhZGRpbmc6NnB4IDEzcHg7Ym9yZGVyLXJhZGl1czo5OTlweDtmb250LXNpemU6MTIuNXB4O2N1cnNvcjpwb2ludGVyOwogICAgZm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7bGV0dGVyLXNwYWNpbmc6LjAyZW07dHJhbnNpdGlvbjouMTVzOwogIH0KICAuY2hpcDpob3Zlcntjb2xvcjp2YXIoLS1pbmspO2JvcmRlci1jb2xvcjojM2E0ODYwfQogIC5jaGlwW2FyaWEtcHJlc3NlZD0idHJ1ZSJde2JhY2tncm91bmQ6dmFyKC0tdHJhY2UpO2NvbG9yOiMwNjIwMTQ7Ym9yZGVyLWNvbG9yOnRyYW5zcGFyZW50O2ZvbnQtd2VpZ2h0OjYwMH0KICAuY2hpcDpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLXRyYWNlKTtvdXRsaW5lLW9mZnNldDoycHh9CgogIC5sZWdlbmR7ZGlzcGxheTpmbGV4O2dhcDoxNHB4O2ZsZXgtd3JhcDp3cmFwO21hcmdpbjoxMHB4IDAgMDtmb250LXNpemU6MTEuNXB4O2NvbG9yOnZhcigtLW11dGVkKTtmb250LWZhbWlseTp2YXIoLS1tb25vKX0KICAubGVnZW5kIHNwYW57ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweH0KICAuZG90e3dpZHRoOjlweDtoZWlnaHQ6OXB4O2JvcmRlci1yYWRpdXM6NTAlO2Rpc3BsYXk6aW5saW5lLWJsb2NrfQogIC5kb3QuY3JpdHtiYWNrZ3JvdW5kOnZhcigtLWNyaXQpfSAuZG90LnVyZ3tiYWNrZ3JvdW5kOnZhcigtLXVyZyl9CiAgLmRvdC5hdHR7YmFja2dyb3VuZDp2YXIoLS1hdHQpfSAuZG90Lm9re2JhY2tncm91bmQ6dmFyKC0tb2spfQoKICAvKiAtLS0tLS0tLS0tIGNvbXBhcmUgLyBjYW1lcmEgLS0tLS0tLS0tLSAqLwogIC5jb21wYXJlewogICAgbWFyZ2luOjE2cHggMCA0cHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MTJweDsKICAgIG92ZXJmbG93OmhpZGRlbjsKICB9CiAgLmNvbXBhcmUtaGVhZHsKICAgIGRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7cGFkZGluZzoxM3B4IDE1cHg7Y3Vyc29yOnBvaW50ZXI7CiAgfQogIC5jb21wYXJlLWhlYWQgLnR7Zm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxNHB4fQogIC5jb21wYXJlLWhlYWQgLnQgc21hbGx7ZGlzcGxheTpibG9jaztjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC13ZWlnaHQ6NDAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbi10b3A6MXB4fQogIC5jb21wYXJlLWhlYWQgLmNoZXZ7bWFyZ2luLWxlZnQ6YXV0bzt0cmFuc2l0aW9uOi4ycztvcGFjaXR5Oi43fQogIC5jb21wYXJlLm9wZW4gLmNoZXZ7dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfQogIC5jb21wYXJlLWJvZHl7ZGlzcGxheTpub25lO3BhZGRpbmc6MCAxNXB4IDE2cHh9CiAgLmNvbXBhcmUub3BlbiAuY29tcGFyZS1ib2R5e2Rpc3BsYXk6YmxvY2t9CiAgLmNhbS1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcDttYXJnaW4tYm90dG9tOjEycHh9CiAgLmJ0bnsKICAgIGJvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlMik7Y29sb3I6dmFyKC0taW5rKTsKICAgIHBhZGRpbmc6MTBweCAxNXB4O2JvcmRlci1yYWRpdXM6OXB4O2ZvbnQtc2l6ZToxMy41cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6dmFyKC0tc2Fucyk7CiAgICBkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3RyYW5zaXRpb246LjE1czsKICB9CiAgLmJ0bjpob3Zlcntib3JkZXItY29sb3I6IzNhNDg2MDtiYWNrZ3JvdW5kOiMyMjJkM2J9CiAgLmJ0bjpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLXRyYWNlKTtvdXRsaW5lLW9mZnNldDoycHh9CiAgLmJ0bi5wcmltYXJ5e2JhY2tncm91bmQ6dmFyKC0tdHJhY2UpO2NvbG9yOiMwNjIwMTQ7Ym9yZGVyLWNvbG9yOnRyYW5zcGFyZW50O2ZvbnQtd2VpZ2h0OjYwMH0KICAuYnRuLnByaW1hcnk6aG92ZXJ7YmFja2dyb3VuZDojNTRlNmE2fQogIC5idG4uZ2hvc3R7YmFja2dyb3VuZDp0cmFuc3BhcmVudH0KICAuY2FtLXN0YWdle2Rpc3BsYXk6bm9uZX0KICAuY2FtLXN0YWdlLm9ue2Rpc3BsYXk6YmxvY2t9CiAgLmNhbS1zdGFnZSB2aWRlbywudXNlcmltZyBpbWd7CiAgICB3aWR0aDoxMDAlO21heC1oZWlnaHQ6MzAwcHg7b2JqZWN0LWZpdDpjb250YWluO2JhY2tncm91bmQ6IzAwMDtib3JkZXItcmFkaXVzOjlweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpOwogIH0KICAudXNlcmltZ3tkaXNwbGF5Om5vbmU7bWFyZ2luLXRvcDo0cHh9CiAgLnVzZXJpbWcub257ZGlzcGxheTpibG9ja30KICAudXNlcmltZy1yb3d7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDttYXJnaW4tdG9wOjhweH0KICAudXNlcmltZy1yb3cgLm9re2NvbG9yOnZhcigtLXRyYWNlKTtmb250LXNpemU6MTIuNXB4O2ZvbnQtZmFtaWx5OnZhcigtLW1vbm8pfQogIC5oaW50e2ZvbnQtc2l6ZToxMi41cHg7Y29sb3I6dmFyKC0tbXV0ZWQpO21hcmdpbjo0cHggMCAwfQoKICAvKiAtLS0tLS0tLS0tIGdyaWQgLS0tLS0tLS0tLSAqLwogIC5ncmlkewogICAgZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maWxsLG1pbm1heCgyNTBweCwxZnIpKTtnYXA6MTRweDsKICAgIG1hcmdpbjoxOHB4IDAgMDsKICB9CiAgLmdyb3VwLWh7CiAgICBncmlkLWNvbHVtbjoxLy0xO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7bWFyZ2luOjE0cHggMCAwOwogIH0KICAuZ3JvdXAtaCBoMntmb250LXNpemU6MTNweDtsZXR0ZXItc3BhY2luZzouMTZlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Y29sb3I6dmFyKC0tbXV0ZWQpO21hcmdpbjowO2ZvbnQtd2VpZ2h0OjYwMDtmb250LWZhbWlseTp2YXIoLS1tb25vKX0KICAuZ3JvdXAtaCAucnVsZXtmbGV4OjE7aGVpZ2h0OjFweDtiYWNrZ3JvdW5kOnZhcigtLWxpbmUpfQoKICAuY2FyZHsKICAgIGJhY2tncm91bmQ6dmFyKC0tc3VyZmFjZSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjEycHg7b3ZlcmZsb3c6aGlkZGVuOwogICAgY3Vyc29yOnBvaW50ZXI7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjt0cmFuc2l0aW9uOi4xNnM7dGV4dC1hbGlnbjpsZWZ0OwogICAgcGFkZGluZzowO2NvbG9yOmluaGVyaXQ7Zm9udDppbmhlcml0OwogIH0KICAuY2FyZDpob3Zlcnt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMnB4KTtib3JkZXItY29sb3I6IzNhNDg2MDtib3gtc2hhZG93OjAgOHB4IDI0cHggcmdiYSgwLDAsMCwuMzUpfQogIC5jYXJkOmZvY3VzLXZpc2libGV7b3V0bGluZToycHggc29saWQgdmFyKC0tdHJhY2UpO291dGxpbmUtb2Zmc2V0OjJweH0KICAudGh1bWJ7CiAgICBhc3BlY3QtcmF0aW86MTYvNzt3aWR0aDoxMDAlO292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjpyZWxhdGl2ZTsKICAgIGJhY2tncm91bmQtY29sb3I6I2ZmZjdmNzsKICAgIGJhY2tncm91bmQtaW1hZ2U6CiAgICAgIGxpbmVhci1ncmFkaWVudCgjZmZlM2UzIDFweCx0cmFuc3BhcmVudCAxcHgpLAogICAgICBsaW5lYXItZ3JhZGllbnQoOTBkZWcsI2ZmZTNlMyAxcHgsdHJhbnNwYXJlbnQgMXB4KSwKICAgICAgbGluZWFyLWdyYWRpZW50KCNmZmMyYzIgMXB4LHRyYW5zcGFyZW50IDFweCksCiAgICAgIGxpbmVhci1ncmFkaWVudCg5MGRlZywjZmZjMmMyIDFweCx0cmFuc3BhcmVudCAxcHgpOwogICAgYmFja2dyb3VuZC1zaXplOjlweCA5cHgsOXB4IDlweCw0NXB4IDQ1cHgsNDVweCA0NXB4OwogICAgZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOwogIH0KICAudGh1bWIgaW1ne3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7b2JqZWN0LWZpdDpjb3ZlcjtvYmplY3QtcG9zaXRpb246Y2VudGVyO2Rpc3BsYXk6YmxvY2t9CiAgLnRodW1iIC5wZW5kaW5newogICAgZm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjExcHg7Y29sb3I6I2IwNmI2YjtsZXR0ZXItc3BhY2luZzouMDVlbTsKICAgIGRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHg7dGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzo4cHg7CiAgfQogIC50aHVtYiAucGVuZGluZyBzdmd7b3BhY2l0eTouNn0KICAuc2V2LXRhZ3sKICAgIHBvc2l0aW9uOmFic29sdXRlO3RvcDo4cHg7bGVmdDo4cHg7Zm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjkuNXB4O2xldHRlci1zcGFjaW5nOi4wOGVtOwogICAgdGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO3BhZGRpbmc6M3B4IDdweDtib3JkZXItcmFkaXVzOjVweDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzBjMTAxNjsKICB9CiAgLnNldi10YWcuY3JpdHtiYWNrZ3JvdW5kOnZhcigtLWNyaXQpO2NvbG9yOiMyYTA2MGZ9CiAgLnNldi10YWcudXJne2JhY2tncm91bmQ6dmFyKC0tdXJnKX0gLnNldi10YWcuYXR0e2JhY2tncm91bmQ6dmFyKC0tYXR0KX0gLnNldi10YWcub2t7YmFja2dyb3VuZDp2YXIoLS1vayk7Y29sb3I6IzA1MjAxM30KICAuYy1ib2R5e3BhZGRpbmc6MTFweCAxM3B4IDEzcHh9CiAgLmMtYm9keSBoM3ttYXJnaW46MDtmb250LXNpemU6MTQuNXB4O2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjI1fQogIC5jLWJvZHkgLmxlYWR7Zm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjEwLjVweDtjb2xvcjp2YXIoLS10cmFjZSk7bGV0dGVyLXNwYWNpbmc6LjA0ZW07bWFyZ2luOjNweCAwIDZweH0KICAuYy1ib2R5IHB7bWFyZ2luOjA7Zm9udC1zaXplOjEyLjhweDtjb2xvcjp2YXIoLS1tdXRlZCk7bGluZS1oZWlnaHQ6MS40NX0KCiAgLyogLS0tLS0tLS0tLSBtb2RhbCAtLS0tLS0tLS0tICovCiAgLm1vZGFsewogICAgcG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDt6LWluZGV4OjUwO2Rpc3BsYXk6bm9uZTthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2p1c3RpZnktY29udGVudDpjZW50ZXI7CiAgICBiYWNrZ3JvdW5kOnJnYmEoNSw4LDEyLC43OCk7YmFja2Ryb3AtZmlsdGVyOmJsdXIoNHB4KTtwYWRkaW5nOjI0cHggMTZweDtvdmVyZmxvdy15OmF1dG87CiAgfQogIC5tb2RhbC5vbntkaXNwbGF5OmZsZXh9CiAgLnNoZWV0ewogICAgYmFja2dyb3VuZDp2YXIoLS1iZzIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxNnB4O21heC13aWR0aDo4MjBweDt3aWR0aDoxMDAlOwogICAgb3ZlcmZsb3c6aGlkZGVuO2FuaW1hdGlvbjpyaXNlIC4yMnMgZWFzZTsKICB9CiAgQGtleWZyYW1lcyByaXNle2Zyb217dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMTRweCk7b3BhY2l0eTowfXRve3RyYW5zZm9ybTpub25lO29wYWNpdHk6MX19CiAgLnNoZWV0LXRvcHsKICAgIGRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDoxNHB4O3BhZGRpbmc6MTZweCAxOHB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWxpbmUpOwogIH0KICAuc2hlZXQtdG9wIGgye21hcmdpbjowO2ZvbnQtc2l6ZToxOXB4O2xpbmUtaGVpZ2h0OjEuMn0KICAuc2hlZXQtdG9wIC5zdWJ7Zm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tdHJhY2UpO2xldHRlci1zcGFjaW5nOi4wNWVtO21hcmdpbi10b3A6NXB4fQogIC5zZXYtYmFubmVye2Rpc3BsYXk6aW5saW5lLWJsb2NrO2ZvbnQtZmFtaWx5OnZhcigtLW1vbm8pO2ZvbnQtc2l6ZToxMHB4O2xldHRlci1zcGFjaW5nOi4xZW07dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlOwogICAgcGFkZGluZzozcHggOXB4O2JvcmRlci1yYWRpdXM6NnB4O2ZvbnQtd2VpZ2h0OjcwMDttYXJnaW4tdG9wOjhweDtjb2xvcjojMGMxMDE2fQogIC5zZXYtYmFubmVyLmNyaXR7YmFja2dyb3VuZDp2YXIoLS1jcml0KTtjb2xvcjojMmEwNjBmfSAuc2V2LWJhbm5lci51cmd7YmFja2dyb3VuZDp2YXIoLS11cmcpfQogIC5zZXYtYmFubmVyLmF0dHtiYWNrZ3JvdW5kOnZhcigtLWF0dCl9IC5zZXYtYmFubmVyLm9re2JhY2tncm91bmQ6dmFyKC0tb2spO2NvbG9yOiMwNTIwMTN9CiAgLnh7bWFyZ2luLWxlZnQ6YXV0bztiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Y29sb3I6dmFyKC0taW5rKTsKICAgIHdpZHRoOjM0cHg7aGVpZ2h0OjM0cHg7Ym9yZGVyLXJhZGl1czo4cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjE4cHg7ZmxleDowIDAgYXV0bztsaW5lLWhlaWdodDoxfQogIC54OmZvY3VzLXZpc2libGV7b3V0bGluZToycHggc29saWQgdmFyKC0tdHJhY2UpO291dGxpbmUtb2Zmc2V0OjJweH0KICAuc2hlZXQtYm9keXtwYWRkaW5nOjE4cHh9CiAgLmltZy1wYW5lbHsKICAgIHdpZHRoOjEwMCU7Ym9yZGVyLXJhZGl1czoxMHB4O292ZXJmbG93OmhpZGRlbjtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpOwogICAgYmFja2dyb3VuZC1jb2xvcjojZmZmN2Y3OwogICAgYmFja2dyb3VuZC1pbWFnZToKICAgICAgbGluZWFyLWdyYWRpZW50KCNmZmUzZTMgMXB4LHRyYW5zcGFyZW50IDFweCksCiAgICAgIGxpbmVhci1ncmFkaWVudCg5MGRlZywjZmZlM2UzIDFweCx0cmFuc3BhcmVudCAxcHgpLAogICAgICBsaW5lYXItZ3JhZGllbnQoI2ZmYzJjMiAxcHgsdHJhbnNwYXJlbnQgMXB4KSwKICAgICAgbGluZWFyLWdyYWRpZW50KDkwZGVnLCNmZmMyYzIgMXB4LHRyYW5zcGFyZW50IDFweCk7CiAgICBiYWNrZ3JvdW5kLXNpemU6MTBweCAxMHB4LDEwcHggMTBweCw1MHB4IDUwcHgsNTBweCA1MHB4OwogIH0KICAuaW1nLXBhbmVsIGltZ3t3aWR0aDoxMDAlO2Rpc3BsYXk6YmxvY2s7bWF4LWhlaWdodDozNDBweDtvYmplY3QtZml0OmNvbnRhaW59CiAgLmltZy1wYW5lbCAucGVuZGluZ3twYWRkaW5nOjQwcHggMTJweDt0ZXh0LWFsaWduOmNlbnRlcjtjb2xvcjojYjA2YjZiO2ZvbnQtZmFtaWx5OnZhcigtLW1vbm8pO2ZvbnQtc2l6ZToxM3B4fQogIC5jbXAtd3JhcHtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Z2FwOjEycHh9CiAgLmNtcC1jb2wgLmxhYntmb250LWZhbWlseTp2YXIoLS1tb25vKTtmb250LXNpemU6MTAuNXB4O2xldHRlci1zcGFjaW5nOi4wOGVtO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luOjAgMCA2cHh9CiAgLmNtcC1jb2wueW91IC5sYWJ7Y29sb3I6dmFyKC0tdHJhY2UpfQogIC5jcml0LWxpc3R7bWFyZ2luOjE2cHggMCAwO3BhZGRpbmc6MDtsaXN0LXN0eWxlOm5vbmV9CiAgLmNyaXQtbGlzdCBsaXtkaXNwbGF5OmZsZXg7Z2FwOjEwcHg7cGFkZGluZzo4cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1saW5lKTtmb250LXNpemU6MTRweH0KICAuY3JpdC1saXN0IGxpOmxhc3QtY2hpbGR7Ym9yZGVyLWJvdHRvbTowfQogIC5jcml0LWxpc3QgLmt7ZmxleDowIDAgOTJweDtmb250LWZhbWlseTp2YXIoLS1tb25vKTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS10cmFjZSk7bGV0dGVyLXNwYWNpbmc6LjA0ZW07cGFkZGluZy10b3A6MnB4O3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZX0KICAuY3JpdC1saXN0IC52e2NvbG9yOnZhcigtLWluayl9CiAgLmxvb2t7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MTBweDtwYWRkaW5nOjEzcHggMTVweDttYXJnaW4tdG9wOjE2cHh9CiAgLmxvb2sgaDR7bWFyZ2luOjAgMCA4cHg7Zm9udC1zaXplOjEycHg7bGV0dGVyLXNwYWNpbmc6LjFlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Y29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtZmFtaWx5OnZhcigtLW1vbm8pfQogIC5sb29rIHVse21hcmdpbjowO3BhZGRpbmctbGVmdDoxOHB4fQogIC5sb29rIGxpe2ZvbnQtc2l6ZToxMy41cHg7bWFyZ2luOjRweCAwfQogIC5hdHRyaWJ7bWFyZ2luLXRvcDoxNnB4O2ZvbnQtc2l6ZToxMS41cHg7Y29sb3I6dmFyKC0tbXV0ZWQpO2Rpc3BsYXk6ZmxleDtnYXA6OHB4O2ZsZXgtd3JhcDp3cmFwO2FsaWduLWl0ZW1zOmNlbnRlcn0KICAuYXR0cmliIGF7Y29sb3I6dmFyKC0tdHJhY2UpO3RleHQtZGVjb3JhdGlvbjpub25lfQogIC5hdHRyaWIgYTpob3Zlcnt0ZXh0LWRlY29yYXRpb246dW5kZXJsaW5lfQogIC5zaGVldC1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcDttYXJnaW4tdG9wOjE4cHh9CgogIGZvb3RlcnttYXgtd2lkdGg6MTIwMHB4O21hcmdpbjozNHB4IGF1dG8gMDtwYWRkaW5nOjE4cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tbGluZSk7Y29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZToxMnB4fQogIGZvb3RlciBhe2NvbG9yOnZhcigtLXRyYWNlKTt0ZXh0LWRlY29yYXRpb246bm9uZX0KICBmb290ZXIgcHttYXJnaW46NnB4IDB9CgogIEBtZWRpYSAobWF4LXdpZHRoOjU2MHB4KXsKICAgIC5jbXAtd3JhcHtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyfQogICAgLmJyYW5kIGgxe2ZvbnQtc2l6ZToxNnB4fQogICAgLmNyaXQtbGlzdCAua3tmbGV4LWJhc2lzOjc0cHh9CiAgfQogIEBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjpyZWR1Y2UpewogICAgLnB1bHNlIHBhdGh7YW5pbWF0aW9uOm5vbmU7c3Ryb2tlLWRhc2hvZmZzZXQ6MH0KICAgIC5zaGVldHthbmltYXRpb246bm9uZX0KICAgIC5jYXJkOmhvdmVye3RyYW5zZm9ybTpub25lfQogIH0KCiAgLyogPT09PT0gdjI6IGLDunNxdWVkYSBwb3Igdm96ID09PT09ICovCiAgLnNlYXJjaCBpbnB1dHtwYWRkaW5nLXJpZ2h0OjQ0cHh9CiAgLnZtaWN7CiAgICBwb3NpdGlvbjphYnNvbHV0ZTtyaWdodDo2cHg7dG9wOjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtNTAlKTsKICAgIHdpZHRoOjMwcHg7aGVpZ2h0OjMwcHg7Ym9yZGVyLXJhZGl1czo4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTsKICAgIGJhY2tncm91bmQ6dmFyKC0tc3VyZmFjZTIpO2NvbG9yOnZhcigtLW11dGVkKTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTRweDsKICAgIGRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt0cmFuc2l0aW9uOi4xNXM7CiAgfQogIC52bWljOmhvdmVye2NvbG9yOnZhcigtLXRyYWNlKTtib3JkZXItY29sb3I6dmFyKC0tdHJhY2UpfQogIC52bWljLmxpc3RlbmluZ3sKICAgIGJhY2tncm91bmQ6dmFyKC0tY3JpdCk7Y29sb3I6I2ZmZjtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQ7CiAgICBhbmltYXRpb246dm1pY0dsb3cgMS4ycyBlYXNlLW91dCBpbmZpbml0ZTsKICB9CiAgQGtleWZyYW1lcyB2bWljR2xvd3swJXtib3gtc2hhZG93OjAgMCAwIDAgcmdiYSgyNDAsODAsMTEwLC41NSl9MTAwJXtib3gtc2hhZG93OjAgMCAwIDEwcHggcmdiYSgyNDAsODAsMTEwLDApfX0KCiAgLyogPT09PT0gdjI6IGhvdmVyIGNvbiBhY2VudG8gcG9yIHNldmVyaWRhZCA9PT09PSAqLwogIC5jYXJkey0tc2V2LWM6dmFyKC0tbGluZSl9CiAgLmNhcmQ6aGFzKC5zZXYtdGFnLmNyaXQpey0tc2V2LWM6dmFyKC0tY3JpdCl9CiAgLmNhcmQ6aGFzKC5zZXYtdGFnLnVyZyl7LS1zZXYtYzp2YXIoLS11cmcpfQogIC5jYXJkOmhhcyguc2V2LXRhZy5hdHQpey0tc2V2LWM6dmFyKC0tYXR0KX0KICAuY2FyZDpoYXMoLnNldi10YWcub2spey0tc2V2LWM6dmFyKC0tb2spfQogIC5jYXJkOmhvdmVyewogICAgdHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTNweCk7CiAgICBib3JkZXItY29sb3I6Y29sb3ItbWl4KGluIHNyZ2IsdmFyKC0tc2V2LWMpIDYwJSx2YXIoLS1saW5lKSk7CiAgICBib3gtc2hhZG93OjAgMTJweCAzMHB4IHJnYmEoMCwwLDAsLjQ1KSwgMCAwIDAgMXB4IGNvbG9yLW1peChpbiBzcmdiLHZhcigtLXNldi1jKSAzMCUsdHJhbnNwYXJlbnQpOwogIH0KICAuY2FyZDpob3ZlciBoM3tjb2xvcjpjb2xvci1taXgoaW4gc3JnYix2YXIoLS1zZXYtYykgNzAlLHZhcigtLWluaykpfQogIC5jYXJkIGgze3RyYW5zaXRpb246Y29sb3IgLjJzfQogIC5jaGlwe3RyYW5zaXRpb246dHJhbnNmb3JtIC4xNXMsY29sb3IgLjE1cyxib3JkZXItY29sb3IgLjE1cyxiYWNrZ3JvdW5kIC4xNXN9CiAgLmNoaXA6YWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOTQpfQogIC5jaGlwW2FyaWEtcHJlc3NlZD0idHJ1ZSJde2JveC1zaGFkb3c6MCAzcHggMTJweCByZ2JhKDYxLDIyMCwxNTEsLjM1KX0KICAuZ3JvdXAtaCBoMntwb3NpdGlvbjpyZWxhdGl2ZX0KICAuYnRuOmFjdGl2ZXt0cmFuc2Zvcm06c2NhbGUoLjk3KX0KCjwvc3R5bGU+CjwvaGVhZD4KPGJvZHk+CjxoZWFkZXI+CiAgPGRpdiBjbGFzcz0iYmFyIj4KICAgIDxkaXYgY2xhc3M9ImJyYW5kIj4KICAgICAgPHNwYW4gY2xhc3M9Im1hcmsiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICA8c3ZnIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIj48cmVjdCB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHJ4PSI3IiBmaWxsPSIjMTEyMDJiIiBzdHJva2U9IiMyODM0NDUiLz48cGF0aCBkPSJNMyAxNWg2bDItNyAzIDE0IDIuNS05IDEuOCA0SDI3IiBmaWxsPSJub25lIiBzdHJva2U9IiMzZGRjOTciIHN0cm9rZS13aWR0aD0iMS43IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4KICAgICAgPC9zcGFuPgogICAgICA8aDE+QXRsYXMgRUNHPHNtYWxsPkd1w61hIENsw61uaWNhIMK3IEhKMjM8L3NtYWxsPjwvaDE+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9InNlYXJjaCI+CiAgICAgIDxzdmcgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjciLz48cGF0aCBkPSJtMjAgMjAtMy41LTMuNSIvPjwvc3ZnPgogICAgICA8aW5wdXQgaWQ9InEiIHR5cGU9InNlYXJjaCIgcGxhY2Vob2xkZXI9IkJ1c2NhciBvIGRpY3RhcjogZmx1dHRlciwgU1QsIGJsb3F1ZW/igKYiIGFyaWEtbGFiZWw9IkJ1c2NhciBlbGVjdHJvY2FyZGlvZ3JhbWEiPgogICAgICA8YnV0dG9uIGNsYXNzPSJ2bWljIiBpZD0idm1pYyIgdGl0bGU9IkJ1c2NhciBwb3Igdm96IiBhcmlhLWxhYmVsPSJCdXNjYXIgcG9yIHZveiI+8J+Ome+4jzwvYnV0dG9uPgogICAgPC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0icHVsc2UiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgIDxzdmcgdmlld0JveD0iMCAwIDEyMDAgMzQiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPgogICAgICA8cGF0aCBkPSJNMCAxNyBIMTIwIGw4LTMgNiA2IDUtMTIgNyAyMiA2LTE2IDUgMyBIMzYwIGw4LTMgNiA2IDUtMTIgNyAyMiA2LTE2IDUgMyBINzIwIGw4LTMgNiA2IDUtMTIgNyAyMiA2LTE2IDUgMyBIMTA4MCBsOC0zIDYgNiA1LTEyIDcgMjIgNi0xNiA1IDMgSDEyMDAiLz4KICAgIDwvc3ZnPgogIDwvZGl2Pgo8L2hlYWRlcj4KCjxkaXYgY2xhc3M9IndyYXAiPgogIDxkaXYgY2xhc3M9Im5vdGUiPgogICAgPHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmY5ZjQzIiBzdHJva2Utd2lkdGg9IjIiIHN0eWxlPSJmbGV4OjAgMCBhdXRvO21hcmdpbi10b3A6MXB4Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI5Ii8+PHBhdGggZD0iTTEyIDh2NU0xMiAxNi41di41Ii8+PC9zdmc+CiAgICA8ZGl2PjxiPkhlcnJhbWllbnRhIGRlIGVzdHVkaW8geSBjb21wYXJhY2nDs24sIG5vIGRpYWduw7NzdGljbyBhdXRvbcOhdGljby48L2I+IExhIGPDoW1hcmEgY29sb2NhIHR1IGVsZWN0cm8ganVudG8gYWwgZGUgcmVmZXJlbmNpYSBwYXJhIHF1ZSBsbyBjb21wYXJlcyB0w7ouIExhIGludGVycHJldGFjacOzbiBmaW5hbCBlcyBzaWVtcHJlIGNsw61uaWNhLjwvZGl2PgogIDwvZGl2PgoKICA8IS0tIGNhbWVyYSAvIGNvbXBhcmUgLS0+CiAgPGRpdiBjbGFzcz0iY29tcGFyZSIgaWQ9ImNvbXBhcmUiPgogICAgPGRpdiBjbGFzcz0iY29tcGFyZS1oZWFkIiBpZD0iY21wSGVhZCIgcm9sZT0iYnV0dG9uIiB0YWJpbmRleD0iMCIgYXJpYS1leHBhbmRlZD0iZmFsc2UiPgogICAgICA8c3ZnIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzZGRjOTciIHN0cm9rZS13aWR0aD0iMS44Ij48cGF0aCBkPSJNMyA4YTIgMiAwIDAgMSAyLTJoMmwxLjUtMmg3TDE5IDZoMmEyIDIgMCAwIDEgMiAydjlhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAwKSIvPjxjaXJjbGUgY3g9IjExIiBjeT0iMTMiIHI9IjMuNCIvPjwvc3ZnPgogICAgICA8ZGl2IGNsYXNzPSJ0Ij5Db21wYXJhciBjb24gbWkgZWxlY3RybzxzbWFsbD5IYXogdW5hIGZvdG8gbyBzw7piZWxhIHkgcG9ubGEgYWwgbGFkbyBkZSBsYSByZWZlcmVuY2lhPC9zbWFsbD48L2Rpdj4KICAgICAgPHN2ZyBjbGFzcz0iY2hldiIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJjb21wYXJlLWJvZHkiPgogICAgICA8ZGl2IGNsYXNzPSJjYW0tYWN0aW9ucyI+CiAgICAgICAgPGxhYmVsIGNsYXNzPSJidG4gcHJpbWFyeSIgZm9yPSJmaWxlIj4KICAgICAgICAgIDxzdmcgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0zIDhhMiAyIDAgMCAxIDItMmgybDEuNS0yaDdMMTkgNmgyYTIgMiAwIDAgMSAyIDJ2OWEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xIDApIi8+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMyIgcj0iMy40Ii8+PC9zdmc+CiAgICAgICAgICBIYWNlciAvIHN1YmlyIGZvdG8KICAgICAgICA8L2xhYmVsPgogICAgICAgIDxpbnB1dCBpZD0iZmlsZSIgdHlwZT0iZmlsZSIgYWNjZXB0PSJpbWFnZS8qIiBjYXB0dXJlPSJlbnZpcm9ubWVudCIgaGlkZGVuPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBnaG9zdCIgaWQ9ImxpdmVCdG4iPkFicmlyIGPDoW1hcmEgZW4gdml2bzwvYnV0dG9uPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBnaG9zdCIgaWQ9ImNsZWFyQnRuIiBoaWRkZW4+UXVpdGFyIGZvdG88L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImNhbS1zdGFnZSIgaWQ9ImNhbVN0YWdlIj4KICAgICAgICA8dmlkZW8gaWQ9InZpZGVvIiBwbGF5c2lubGluZT48L3ZpZGVvPgogICAgICAgIDxkaXYgY2xhc3M9ImNhbS1hY3Rpb25zIiBzdHlsZT0ibWFyZ2luLXRvcDoxMHB4Ij4KICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBwcmltYXJ5IiBpZD0ic25hcEJ0biI+Q2FwdHVyYXI8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBnaG9zdCIgaWQ9InN0b3BCdG4iPkNlcnJhciBjw6FtYXJhPC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJ1c2VyaW1nIiBpZD0idXNlckltZ0JveCI+CiAgICAgICAgPGltZyBpZD0idXNlckltZyIgYWx0PSJUdSBlbGVjdHJvIj4KICAgICAgICA8ZGl2IGNsYXNzPSJ1c2VyaW1nLXJvdyI+PHNwYW4gY2xhc3M9Im9rIj7inJMgRm90byBjYXJnYWRhIOKAlCDDoWJyZSB1bmEgcGF0b2xvZ8OtYSBwYXJhIGNvbXBhcmFyIGFsIGxhZG8uPC9zcGFuPjwvZGl2PgogICAgICA8L2Rpdj4KICAgICAgPHAgY2xhc3M9ImhpbnQiIGlkPSJjYW1IaW50Ij5MYSBjw6FtYXJhIGVuIHZpdm8gbmVjZXNpdGEgcGVybWlzbyBkZWwgbmF2ZWdhZG9yIHkgY29uZXhpw7NuIHNlZ3VyYSAoaHR0cHMpLiBTaSBmYWxsYSwgdXNhIOKAnEhhY2VyIC8gc3ViaXIgZm90b+KAnTogZW4gZWwgbcOzdmlsIGFicmUgbGEgY8OhbWFyYSBkaXJlY3RhbWVudGUuPC9wPgogICAgPC9kaXY+CiAgPC9kaXY+CgogIDwhLS0gZmlsdGVycyAtLT4KICA8ZGl2IGNsYXNzPSJjb250cm9scyI+CiAgICA8ZGl2IGNsYXNzPSJjaGlwcyIgaWQ9ImNoaXBzIj4KICAgICAgPGJ1dHRvbiBjbGFzcz0iY2hpcCIgZGF0YS1jYXQ9ImFsbCIgYXJpYS1wcmVzc2VkPSJ0cnVlIj5Ub2RvczwvYnV0dG9uPgogICAgICA8YnV0dG9uIGNsYXNzPSJjaGlwIiBkYXRhLWNhdD0icml0bW8iIGFyaWEtcHJlc3NlZD0iZmFsc2UiPlJpdG1vPC9idXR0b24+CiAgICAgIDxidXR0b24gY2xhc3M9ImNoaXAiIGRhdGEtY2F0PSJ2ZW50cmljdWxhciIgYXJpYS1wcmVzc2VkPSJmYWxzZSI+VmVudHJpY3VsYXI8L2J1dHRvbj4KICAgICAgPGJ1dHRvbiBjbGFzcz0iY2hpcCIgZGF0YS1jYXQ9ImlzcXVlbWlhIiBhcmlhLXByZXNzZWQ9ImZhbHNlIj5Jc3F1ZW1pYTwvYnV0dG9uPgogICAgICA8YnV0dG9uIGNsYXNzPSJjaGlwIiBkYXRhLWNhdD0iY29uZHVjY2lvbiIgYXJpYS1wcmVzc2VkPSJmYWxzZSI+Q29uZHVjY2nDs248L2J1dHRvbj4KICAgICAgPGJ1dHRvbiBjbGFzcz0iY2hpcCIgZGF0YS1jYXQ9Im90cm9zIiBhcmlhLXByZXNzZWQ9ImZhbHNlIj5PdHJvczwvYnV0dG9uPgogICAgPC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0ibGVnZW5kIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiAgICA8c3Bhbj48aSBjbGFzcz0iZG90IGNyaXQiPjwvaT5DcsOtdGljbzwvc3Bhbj4KICAgIDxzcGFuPjxpIGNsYXNzPSJkb3QgdXJnIj48L2k+VXJnZW50ZTwvc3Bhbj4KICAgIDxzcGFuPjxpIGNsYXNzPSJkb3QgYXR0Ij48L2k+QXRlbmNpw7NuPC9zcGFuPgogICAgPHNwYW4+PGkgY2xhc3M9ImRvdCBvayI+PC9pPk5vcm1hbDwvc3Bhbj4KICA8L2Rpdj4KCiAgPGRpdiBjbGFzcz0iZ3JpZCIgaWQ9ImdyaWQiPjwvZGl2Pgo8L2Rpdj4KCjwhLS0gZGV0YWlsIG1vZGFsIC0tPgo8ZGl2IGNsYXNzPSJtb2RhbCIgaWQ9Im1vZGFsIiByb2xlPSJkaWFsb2ciIGFyaWEtbW9kYWw9InRydWUiIGFyaWEtbGFiZWxsZWRieT0ibVRpdGxlIj4KICA8ZGl2IGNsYXNzPSJzaGVldCIgaWQ9InNoZWV0Ij48L2Rpdj4KPC9kaXY+Cgo8Zm9vdGVyPgogIDxwPjxiPkltw6FnZW5lczo8L2I+IFdpa2ltZWRpYSBDb21tb25zIChkb21pbmlvIHDDumJsaWNvIG8gQ3JlYXRpdmUgQ29tbW9ucykuIENhZGEgcGF0b2xvZ8OtYSBlbmxhemEgYSBzdSBhcmNoaXZvIGVuIENvbW1vbnMgY29uIGxhIGF1dG9yw61hIHkgbGEgbGljZW5jaWEgZXhhY3Rhcy4gTGFzIHBhdG9sb2fDrWFzIG1hcmNhZGFzIGNvbW8g4oCcaW1hZ2VuIHBvciBhw7FhZGly4oCdIGVubGF6YW4gYSBsYSBiw7pzcXVlZGEgZGUgQ29tbW9ucyBwYXJhIGNvbXBsZXRhcmxhcy48L3A+CiAgPHA+PGI+Q3JpdGVyaW9zOjwvYj4gcmVmZXJlbmNpYSByw6FwaWRhIGRlIGVzdHVkaW8uIE5vIHN1c3RpdHV5ZSBlbCBqdWljaW8gY2zDrW5pY28gbmkgbGEgdmFsb3JhY2nDs24gZGVsIHBhY2llbnRlLiBBdGxhcyBFQ0cgwrcgSEoyMy48L3A+CjwvZm9vdGVyPgoKPHNjcmlwdD4KY29uc3QgQ0FUUyA9IHtyaXRtbzoiUml0bW8geSBmcmVjdWVuY2lhIiwgdmVudHJpY3VsYXI6IkFycml0bWlhcyB2ZW50cmljdWxhcmVzIiwgaXNxdWVtaWE6IklzcXVlbWlhIGUgaW5mYXJ0byIsIGNvbmR1Y2Npb246IkNvbmR1Y2Npw7NuIiwgb3Ryb3M6Ik90cm9zIC8gbWV0YWLDs2xpY28ifTsKY29uc3QgU0VWID0ge2NyaXQ6IkNyw610aWNvIiwgdXJnOiJVcmdlbnRlIiwgYXR0OiJBdGVuY2nDs24iLCBvazoiTm9ybWFsIn07CgovLyBmaWxlID0gbm9tYnJlIHJlYWwgZW4gV2lraW1lZGlhIENvbW1vbnMgKG8gbnVsbCA9IHBvciBhw7FhZGlyLCBjb24gdMOpcm1pbm8gZGUgYsO6c3F1ZWRhIGVuICdmaW5kJykKY29uc3QgREFUQSA9IFsKICAvLyAtLS0tIFJJVE1PIC0tLS0KICB7aWQ6InNpbnVzYWwiLCBjYXQ6InJpdG1vIiwgc2V2OiJvayIsIG5hbWU6IlJpdG1vIHNpbnVzYWwgbm9ybWFsIiwgbGVhZDoiZGVyaXZhY2nDs24gSUkiLCBmaWxlOiJOb3JtYWwgU2ludXMgUmh5dGhtLnN2ZyIsCiAgIGtleToiUCBhbnRlcyBkZSBjYWRhIFFSUywgUFIgMCwxMuKAkzAsMjAgcywgUVJTIGVzdHJlY2hvLCA2MOKAkzEwMCBscG0uIiwKICAgY3JpdDpbWyJGcmVjdWVuY2lhIiwiNjDigJMxMDAgbHBtLCByZWd1bGFyIl0sWyJPbmRhIFAiLCJwb3NpdGl2YSBlbiBJSSwgdW5hIHBvciBjYWRhIFFSUyJdLFsiUFIiLCIwLDEy4oCTMCwyMCBzLCBjb25zdGFudGUiXSxbIlFSUyIsImVzdHJlY2hvICg8MCwxMiBzKSJdXSwKICAgbG9vazpbIkNhZGEgUVJTIHZhIHByZWNlZGlkbyBkZSB1bmEgUC4iLCJJbnRlcnZhbG9zIFItUiBjb25zdGFudGVzLiJdfSwKICB7aWQ6InRzaW51c2FsIiwgY2F0OiJyaXRtbyIsIHNldjoiYXR0IiwgbmFtZToiVGFxdWljYXJkaWEgc2ludXNhbCIsIGxlYWQ6ImRlcml2YWNpw7NuIElJIiwgZmlsZToiRUNHIFNpbnVzIFRhY2h5Y2FyZGlhIDEzMiBicG0uanBnIiwKICAga2V5OiI+MTAwIGxwbSBjb24gb25kYSBQIHNpbnVzYWwgbm9ybWFsIHkgUi1SIHJlZ3VsYXIuIiwKICAgY3JpdDpbWyJGcmVjdWVuY2lhIiwiPjEwMCBscG0sIHJlZ3VsYXIiXSxbIk9uZGEgUCIsInNpbnVzYWwsIG5vcm1hbCJdLFsiQ2F1c2EiLCJmaWVicmUsIGRvbG9yLCBoaXBvdm9sZW1pYSwgZXRjLiJdXSwKICAgbG9vazpbIlJpdG1vIHJlZ3VsYXIgeSByw6FwaWRvIGNvbiBQIG5vcm1hbC4iLCJCdXNjYSB5IHRyYXRhIGxhIGNhdXNhIGRlIGJhc2UuIl19LAogIHtpZDoiYnNpbnVzYWwiLCBjYXQ6InJpdG1vIiwgc2V2OiJhdHQiLCBuYW1lOiJCcmFkaWNhcmRpYSBzaW51c2FsIiwgbGVhZDoiZGVyaXZhY2nDs24gSUkiLCBmaWxlOm51bGwsIGZpbmQ6InNpbnVzIGJyYWR5Y2FyZGlhIEVDRyIsCiAgIGtleToiPDYwIGxwbSBjb24gb25kYSBQIHNpbnVzYWwgbm9ybWFsLiIsCiAgIGNyaXQ6W1siRnJlY3VlbmNpYSIsIjw2MCBscG0sIHJlZ3VsYXIiXSxbIk9uZGEgUCIsInNpbnVzYWwsIG5vcm1hbCJdLFsiQ2zDrW5pY2EiLCJ2YWxvcmEgc8OtbnRvbWFzIHkgZsOhcm1hY29zIGZyZW5hZG9yZXMiXV0sCiAgIGxvb2s6WyJSaXRtbyByZWd1bGFyIGxlbnRvIGNvbiBQIG5vcm1hbCBhbnRlcyBkZSBjYWRhIFFSUy4iXX0sCiAge2lkOiJmYSIsIGNhdDoicml0bW8iLCBzZXY6InVyZyIsIG5hbWU6IkZpYnJpbGFjacOzbiBhdXJpY3VsYXIiLCBsZWFkOiJkZXJpdmFjacOzbiBJSSIsIGZpbGU6IkF0cmlhbGZpYnJpbGxhdGlvbi5qcGciLAogICBrZXk6IlNpbiBvbmRhIFAsIGzDrW5lYSBiYXNhbCBpcnJlZ3VsYXIsIFItUiBpcnJlZ3VsYXJtZW50ZSBpcnJlZ3VsYXIuIiwKICAgY3JpdDpbWyJPbmRhIFAiLCJhdXNlbnRlOyBvbmRhcyAnZicgZmluYXMiXSxbIlJpdG1vIiwiUi1SIGlycmVndWxhcm1lbnRlIGlycmVndWxhciJdLFsiUVJTIiwibm9ybWFsbWVudGUgZXN0cmVjaG8iXSxbIlJpZXNnbyIsImVtYm9sw61nZW5vOyB2YWxvcmEgYW50aWNvYWd1bGFjacOzbiJdXSwKICAgbG9vazpbIk5vIGhheSBQIGlkZW50aWZpY2FibGUuIiwiTGEgZGlzdGFuY2lhIGVudHJlIFFSUyB2YXLDrWEgc2luIHBhdHLDs24uIl19LAogIHtpZDoiZmx1dHRlciIsIGNhdDoicml0bW8iLCBzZXY6InVyZyIsIG5hbWU6IkZsdXR0ZXIgYXVyaWN1bGFyIiwgbGVhZDoiZGVyaXZhY2nDs24gSUkiLCBmaWxlOiJFQ0cgQXRyaWFsIEZsdXR0ZXIgMjk0IGJwbS5qcGciLAogICBrZXk6Ik9uZGFzIEYgZW4gJ2RpZW50ZXMgZGUgc2llcnJhJyAofjMwMC9taW4pOyBjb25kdWNjacOzbiAyOjEg4oaSIH4xNTAgbHBtLiIsCiAgIGNyaXQ6W1siT25kYXMgRiIsIidkaWVudGVzIGRlIHNpZXJyYScgcmVndWxhcmVzLCB+MjUw4oCTMzAwL21pbiJdLFsiQ29uZHVjY2nDs24iLCJhIG1lbnVkbyAyOjEg4oaSIH4xNTAgbHBtIl0sWyJRUlMiLCJlc3RyZWNobyBzYWx2byBhYmVycmFuY2lhIl1dLAogICBsb29rOlsiU2llcnJhIGNvbnRpbnVhIGVuIGRlcml2YWNpb25lcyBpbmZlcmlvcmVzIChJSSwgSUlJLCBhVkYpLiIsIlNpIGxhIGZyZWN1ZW5jaWEgZXMgfjE1MCBmaWphLCBzb3NwZWNoYSBmbHV0dGVyIDI6MS4iXX0sCiAge2lkOiJ0cHN2IiwgY2F0OiJyaXRtbyIsIHNldjoidXJnIiwgbmFtZToiVFBTViAvIEFWUlQiLCBsZWFkOiJWMSIsIGZpbGU6IkF2cnQgc21hbGwgKENhcmRpb05ldHdvcmtzIEVDR3BlZGlhKS5zdmciLAogICBrZXk6IlFSUyBlc3RyZWNobyByZWd1bGFyIG11eSByw6FwaWRvICgxNTDigJMyNTApOyBQIG5vIHZpc2libGVzLiIsCiAgIGNyaXQ6W1siRnJlY3VlbmNpYSIsIjE1MOKAkzI1MCBscG0sIHJlZ3VsYXIiXSxbIlFSUyIsImVzdHJlY2hvIChzYWx2byBjb25kdWNjacOzbiBhYmVycmFudGUpIl0sWyJPbmRhIFAiLCJvY3VsdGEgbyByZXRyw7NncmFkYSJdXSwKICAgbG9vazpbIlRhcXVpY2FyZGlhIHJlZ3VsYXIgZGUgY29tcGxlam8gZXN0cmVjaG8gc2luIFAgdmlzaWJsZXMuIiwiTWFuaW9icmFzIHZhZ2FsZXMgLyBhZGVub3NpbmEgY29tbyBwcnVlYmEgeSB0cmF0YW1pZW50by4iXX0sCiAge2lkOiJ0YW0iLCBjYXQ6InJpdG1vIiwgc2V2OiJhdHQiLCBuYW1lOiJUYXF1aWNhcmRpYSBhdXJpY3VsYXIgbXVsdGlmb2NhbCIsIGxlYWQ6ImRlcml2YWNpw7NuIElJIiwgZmlsZToiTXVsdGlmb2NhbCBBdHJpYWwgVGFjaHljYXJkaWEuc3ZnIiwKICAga2V5OiLiiaUzIG1vcmZvbG9nw61hcyBkZSBvbmRhIFAgZGlzdGludGFzLCBSLVIgaXJyZWd1bGFyLiIsCiAgIGNyaXQ6W1siT25kYSBQIiwi4omlMyBtb3Jmb2xvZ8OtYXMgZGlmZXJlbnRlcyJdLFsiUml0bW8iLCJpcnJlZ3VsYXIsID4xMDAgbHBtIl0sWyJBc29jaWFjacOzbiIsIkVQT0MsIGhpcG94aWEiXV0sCiAgIGxvb2s6WyJQIGRlIGZvcm1hcyBjYW1iaWFudGVzIGNvbiBQUiB2YXJpYWJsZS4iXX0sCiAge2lkOiJtYXAiLCBjYXQ6InJpdG1vIiwgc2V2OiJhdHQiLCBuYW1lOiJNYXJjYXBhc29zIGF1cmljdWxhciBtaWdyYXRvcmlvIiwgbGVhZDoiZGVyaXZhY2nDs24gSUkiLCBmaWxlOiJXYW5kZXJpbmcgQXRyaWFsIFBhY2VtYWtlci5zdmciLAogICBrZXk6Ik1vcmZvbG9nw61hIGRlIFAgY2FtYmlhbnRlIGEgZnJlY3VlbmNpYSBub3JtYWwgbyBsZW50YS4iLAogICBjcml0OltbIk9uZGEgUCIsIuKJpTMgbW9yZm9sb2fDrWFzIl0sWyJGcmVjdWVuY2lhIiwiPDEwMCBscG0iXSxbIlNpZ25pZmljYWRvIiwic3VlbGUgc2VyIGJlbmlnbm8iXV0sCiAgIGxvb2s6WyJDb21vIGxhIFRBTSBwZXJvIHNpbiB0YXF1aWNhcmRpYS4iXX0sCiAge2lkOiJlYSIsIGNhdDoicml0bW8iLCBzZXY6ImF0dCIsIG5hbWU6IkV4dHJhc8Otc3RvbGUgYXVyaWN1bGFyIiwgbGVhZDoiZGVyaXZhY2nDs24gSUkiLCBmaWxlOiJQcmVtYXR1cmUgQXRyaWFsIENvbXBsZXhlcy5zdmciLAogICBrZXk6IkxhdGlkbyBhZGVsYW50YWRvIGNvbiBQIHByZW1hdHVyYSBkZSBtb3Jmb2xvZ8OtYSBkaXN0aW50YTsgUVJTIGVzdHJlY2hvLiIsCiAgIGNyaXQ6W1siT25kYSBQIiwicHJlbWF0dXJhLCBkaXN0aW50YSBkZSBsYSBzaW51c2FsIl0sWyJRUlMiLCJlc3RyZWNobyJdLFsiUGF1c2EiLCJubyBjb21wZW5zYWRvcmEiXV0sCiAgIGxvb2s6WyJMYXRpZG8gcXVlIHNlIGFkZWxhbnRhIGNvbiB1bmEgUCBkaWZlcmVudGUuIl19LAogIHtpZDoiZXUiLCBjYXQ6InJpdG1vIiwgc2V2OiJhdHQiLCBuYW1lOiJFeHRyYXPDrXN0b2xlIGRlIGxhIHVuacOzbiIsIGxlYWQ6ImRlcml2YWNpw7NuIElJIiwgZmlsZToiUHJlbWF0dXJlIEp1bmN0aW9uYWwgQ29tcGxleC5zdmciLAogICBrZXk6IlFSUyBwcmVtYXR1cm8gZXN0cmVjaG8gc2luIFAgKG8gUCByZXRyw7NncmFkYSkuIiwKICAgY3JpdDpbWyJRUlMiLCJwcmVtYXR1cm8sIGVzdHJlY2hvIl0sWyJPbmRhIFAiLCJhdXNlbnRlIG8gcmV0csOzZ3JhZGEiXV0sCiAgIGxvb2s6WyJMYXRpZG8gYWRlbGFudGFkbyBkZSBjb21wbGVqbyBlc3RyZWNobyBzaW4gUCBkZWxhbnRlLiJdfSwKICB7aWQ6ImV2IiwgY2F0OiJyaXRtbyIsIHNldjoiYXR0IiwgbmFtZToiRXh0cmFzw61zdG9sZSB2ZW50cmljdWxhciIsIGxlYWQ6ImRlcml2YWNpw7NuIElJIiwgZmlsZToiUHJlbWF0dXJlIFZlbnRyaWN1bGFyIENvbXBsZXguc3ZnIiwKICAga2V5OiJRUlMgYW5jaG8gcHJlbWF0dXJvLCBzaW4gUCBwcmV2aWEsIGNvbiBwYXVzYSBjb21wZW5zYWRvcmEuIiwKICAgY3JpdDpbWyJRUlMiLCJhbmNobyAoPjAsMTIgcyksIHByZW1hdHVybyJdLFsiT25kYSBQIiwiYXVzZW50ZSBhbnRlcyBkZWwgUVJTIl0sWyJQYXVzYSIsImNvbXBlbnNhZG9yYSBjb21wbGV0YSJdXSwKICAgbG9vazpbIkNvbXBsZWpvIGFuY2hvIHkgcmFybyBxdWUgcm9tcGUgZWwgcml0bW8uIl19LAogIHtpZDoiYmlnZW0iLCBjYXQ6InJpdG1vIiwgc2V2OiJhdHQiLCBuYW1lOiJCaWdlbWluaXNtbyB2ZW50cmljdWxhciIsIGxlYWQ6ImRlcml2YWNpw7NuIElJIiwgZmlsZToiQmlnZW1pbnkuanBnIiwKICAga2V5OiJDYWRhIGxhdGlkbyBzaW51c2FsIHZhIHNlZ3VpZG8gZGUgdW5hIGV4dHJhc8Otc3RvbGUgdmVudHJpY3VsYXIuIiwKICAgY3JpdDpbWyJQYXRyw7NuIiwiMSBub3JtYWwgKyAxIEVWLCByZXBldGlkbyJdLFsiUVJTIGRlIGxhIEVWIiwiYW5jaG8iXV0sCiAgIGxvb2s6WyJBbHRlcm5hbmNpYSByZWd1bGFyOiBsYXRpZG8gbm9ybWFsLCBleHRyYXPDrXN0b2xlLCBub3JtYWwsIGV4dHJhc8Otc3RvbGUuIl19LAoKICAvLyAtLS0tIFZFTlRSSUNVTEFSIC0tLS0KICB7aWQ6InR2IiwgY2F0OiJ2ZW50cmljdWxhciIsIHNldjoiY3JpdCIsIG5hbWU6IlRhcXVpY2FyZGlhIHZlbnRyaWN1bGFyIiwgbGVhZDoiZGVyaXZhY2lvbmVzIG3Dumx0aXBsZXMiLCBmaWxlOiJWZW50cmljdWxhciBUYWNoeWNhcmRpYS5zdmciLAogICBrZXk6IlFSUyBhbmNobywgcmVndWxhciB5IHLDoXBpZG8gKD4xMDAgbHBtKSBjb24gZGlzb2NpYWNpw7NuIEFWLiIsCiAgIGNyaXQ6W1siUVJTIiwiYW5jaG8gKD4wLDEyIHMpIl0sWyJSaXRtbyIsInJlZ3VsYXIsID4xMDAgbHBtIl0sWyJEaXNvY2lhY2nDs24iLCJBViAoUCBpbmRlcGVuZGllbnRlcykiXSxbIk1hbmVqbyIsImluZXN0YWJsZSDihpIgY2FyZGlvdmVyc2nDs24iXV0sCiAgIGxvb2s6WyJUYXF1aWNhcmRpYSByZWd1bGFyIGRlIGNvbXBsZWpvIGFuY2hvLiIsIlRvZGEgdGFxdWljYXJkaWEgYW5jaGEgZXMgVFYgbWllbnRyYXMgbm8gc2UgZGVtdWVzdHJlIGxvIGNvbnRyYXJpby4iXX0sCiAge2lkOiJmdiIsIGNhdDoidmVudHJpY3VsYXIiLCBzZXY6ImNyaXQiLCBuYW1lOiJGaWJyaWxhY2nDs24gdmVudHJpY3VsYXIiLCBsZWFkOiJjdWFscXVpZXIgZGVyaXZhY2nDs24iLCBmaWxlOiJWZW50cmljdWxhciBGaWJyaWxsYXRpb24uc3ZnIiwKICAga2V5OiJPbmR1bGFjacOzbiBjYcOzdGljYSBzaW4gUVJTIGlkZW50aWZpY2FibGUuIFBhcmFkYSBjYXJkaWFjYS4iLAogICBjcml0OltbIlRyYXphZG8iLCJjYcOzdGljbywgc2luIFFSUyByZWNvbm9jaWJsZSJdLFsiUHVsc28iLCJhdXNlbnRlIl0sWyJNYW5lam8iLCJSQ1AgKyBkZXNmaWJyaWxhY2nDs24gaW5tZWRpYXRhIl1dLAogICBsb29rOlsiTMOtbmVhIGlycmVndWxhciwgc2luIGNvbXBsZWpvcyBvcmRlbmFkb3Mg4oaSIGRlc2ZpYnJpbGFyIHlhLiJdfSwKICB7aWQ6ImZsdXR0ZXJ2IiwgY2F0OiJ2ZW50cmljdWxhciIsIHNldjoiY3JpdCIsIG5hbWU6IkZsdXR0ZXIgdmVudHJpY3VsYXIiLCBsZWFkOiJjdWFscXVpZXIgZGVyaXZhY2nDs24iLCBmaWxlOiJWZW50cmljdWxhciBGbHV0dGVyLnN2ZyIsCiAgIGtleToiT25kYSBzaW51c29pZGFsIHJlZ3VsYXIgbXV5IHLDoXBpZGEgKH4zMDAvbWluKS4iLAogICBjcml0OltbIlRyYXphZG8iLCJzaW51c29pZGFsIHJlZ3VsYXIsIH4zMDAvbWluIl0sWyJFdm9sdWNpw7NuIiwiZGVnZW5lcmEgZW4gRlYiXSxbIk1hbmVqbyIsImRlc2ZpYnJpbGFjacOzbiJdXSwKICAgbG9vazpbIk9uZGFzIGFtcGxpYXMgcmVndWxhcmVzICdlbiBzaW51c29pZGUnIHNpbiBzZXBhcmFyIFFSUy1ULiJdfSwKICB7aWQ6InRvcnNhZGUiLCBjYXQ6InZlbnRyaWN1bGFyIiwgc2V2OiJjcml0IiwgbmFtZToiVG9yc2FkZSBkZSBwb2ludGVzIiwgbGVhZDoiZGVyaXZhY2lvbmVzIG3Dumx0aXBsZXMiLCBmaWxlOiJUb3JzYWRlcyBkZSBQb2ludGVzIChwb2x5bW9ycGhpYyBWVCkuc3ZnIiwKICAga2V5OiJUViBwb2xpbW9yZmEgcXVlICdnaXJhJyBzb2JyZSBsYSBsw61uZWEgYmFzYWw7IFFUIGxhcmdvIHByZXZpby4iLAogICBjcml0OltbIlFSUyIsInBvbGltb3JmbywgYW1wbGl0dWQgY2FtYmlhbnRlIl0sWyJFamUiLCJnaXJhIGVuIHRvcm5vIGEgbGEgbMOtbmVhIGRlIGJhc2UiXSxbIkJhc2UiLCJRVCBsYXJnbyJdLFsiVHJhdGFtaWVudG8iLCJzdWxmYXRvIGRlIG1hZ25lc2lvIl1dLAogICBsb29rOlsiQ29tcGxlam9zIHF1ZSBjcmVjZW4geSBtZW5ndWFuIGdpcmFuZG8gc29icmUgbGEgbMOtbmVhLiJdfSwKICB7aWQ6InBlYSIsIGNhdDoidmVudHJpY3VsYXIiLCBzZXY6ImNyaXQiLCBuYW1lOiJBc2lzdG9saWEgLyBBRVNQIChQRUEpIiwgbGVhZDoiY3VhbHF1aWVyIGRlcml2YWNpw7NuIiwgZmlsZToiRGlzc29jaWF6aW9uZSBlbGV0dHJvbWVjY2FuaWNhIChQRUEpLnN2ZyIsCiAgIGtleToiU2luIGFjdGl2aWRhZCAoYXNpc3RvbGlhKSBvIGFjdGl2aWRhZCBlbMOpY3RyaWNhIHNpbiBwdWxzby4iLAogICBjcml0OltbIkFzaXN0b2xpYSIsImzDrW5lYSBzaW4gY29tcGxlam9zIl0sWyJBRVNQIiwiaGF5IHJpdG1vIHBlcm8gbm8gcHVsc28iXSxbIk1hbmVqbyIsIlJDUDsgYnVzY2EgY2F1c2FzICg0SC80VCkiXV0sCiAgIGxvb2s6WyJDb25maXJtYSBlbiAyIGRlcml2YWNpb25lcyB5IGNvbXBydWViYSBjb25leGlvbmVzIGFudGVzIGRlIGxsYW1hcmxvIGFzaXN0b2xpYS4iXX0sCgogIC8vIC0tLS0gSVNRVUVNSUEgLS0tLQogIHtpZDoic3RlbWlfYW50IiwgY2F0OiJpc3F1ZW1pYSIsIHNldjoiY3JpdCIsIG5hbWU6IlNDQUNFU1QgYW50ZXJpb3IiLCBsZWFkOiJWMeKAk1Y0IiwgZmlsZToiMTIgbGVhZCBnZW5lcmF0ZWQgYW50ZXJpb3IgTUkuSlBHIiwKICAga2V5OiJFbGV2YWNpw7NuIGRlbCBTVCBlbiBWMeKAk1Y0LiBPY2x1c2nDs24gZGUgbGEgZGVzY2VuZGVudGUgYW50ZXJpb3IuIiwKICAgY3JpdDpbWyJFbGV2YWNpw7NuIFNUIiwiVjHigJNWNCJdLFsiSW1hZ2VuIGVzcGVqbyIsImRlc2NlbnNvIGVuIElJLCBJSUksIGFWRiJdLFsiQXJ0ZXJpYSIsImRlc2NlbmRlbnRlIGFudGVyaW9yIChEQSkiXV0sCiAgIGxvb2s6WyJTVCBlbGV2YWRvIGVuIHByZWNvcmRpYWxlcyBhbnRlcmlvcmVzIOKGkiBhY3RpdmFyIGPDs2RpZ28gaW5mYXJ0by4iXX0sCiAge2lkOiJzdGVtaV9pbmYiLCBjYXQ6ImlzcXVlbWlhIiwgc2V2OiJjcml0IiwgbmFtZToiU0NBQ0VTVCBpbmZlcmlvciIsIGxlYWQ6IklJLCBJSUksIGFWRiIsIGZpbGU6IjEyIGxlYWQgZ2VuZXJhdGVkIGluZmVyaW9yIE1JLkpQRyIsCiAgIGtleToiRWxldmFjacOzbiBkZWwgU1QgZW4gSUksIElJSSB5IGFWRi4gT2NsdXNpw7NuIGRlIGxhIGNvcm9uYXJpYSBkZXJlY2hhLiIsCiAgIGNyaXQ6W1siRWxldmFjacOzbiBTVCIsIklJLCBJSUksIGFWRiJdLFsiSW1hZ2VuIGVzcGVqbyIsImRlc2NlbnNvIGVuIEksIGFWTCJdLFsiQXJ0ZXJpYSIsImNvcm9uYXJpYSBkZXJlY2hhIChoYWJpdHVhbCkiXSxbIk9qbyIsImRlcml2YWNpb25lcyBkZXJlY2hhcyAoVjRSKSBwb3IgVkQiXV0sCiAgIGxvb2s6WyJTVCBlbGV2YWRvIGVuIGNhcmEgaW5mZXJpb3I7IHZhbG9yYSBhZmVjdGFjacOzbiBkZSB2ZW50csOtY3VsbyBkZXJlY2hvLiJdfSwKICB7aWQ6InN0ZW1pX2xhdCIsIGNhdDoiaXNxdWVtaWEiLCBzZXY6ImNyaXQiLCBuYW1lOiJTQ0FDRVNUIGFudGVyb2xhdGVyYWwiLCBsZWFkOiJWM+KAk1Y2LCBJLCBhVkwiLCBmaWxlOiJBbnRlcmlvckxhdGVyYWxNSS5qcGciLAogICBrZXk6IkVsZXZhY2nDs24gZGVsIFNUIGVuIGNhcmEgYW50ZXJpb3IgeSBsYXRlcmFsLiIsCiAgIGNyaXQ6W1siRWxldmFjacOzbiBTVCIsIlYz4oCTVjYsIEksIGFWTCJdLFsiRXh0ZW5zacOzbiIsImluZmFydG8gZXh0ZW5zbyJdXSwKICAgbG9vazpbIlNUIGVsZXZhZG8gcXVlIGFiYXJjYSBwcmVjb3JkaWFsZXMgeSBsYXRlcmFsZXMgYWx0YXMuIl19LAogIHtpZDoicG9zdCIsIGNhdDoiaXNxdWVtaWEiLCBzZXY6ImNyaXQiLCBuYW1lOiJJQU0gcG9zdGVyaW9yIiwgbGVhZDoiVjHigJNWMyAoZXNwZWpvKSIsIGZpbGU6IkZsaXBwZWQgUG9zdGVyaW9yIFNURU1JIEVDRy5wbmciLAogICBrZXk6IkRlc2NlbnNvIGRlbCBTVCBlbiBWMeKAk1YzIGNvbiBSIGFsdGE6IGltYWdlbiBlbiBlc3Blam8gZGUgbGEgY2FyYSBwb3N0ZXJpb3IuIiwKICAgY3JpdDpbWyJEZXNjZW5zbyBTVCIsIlYx4oCTVjMiXSxbIk9uZGEgUiIsImFsdGEgeSBhbmNoYSBlbiBWMeKAk1YyIl0sWyJDb25maXJtYXIiLCJkZXJpdmFjaW9uZXMgcG9zdGVyaW9yZXMgVjfigJNWOSJdXSwKICAgbG9vazpbIlNpIFYx4oCTVjMgbXVlc3RyYW4gZGVzY2Vuc28gU1QgKyBSIGFsdGEsIHBpZW5zYSBlbiBwb3N0ZXJpb3IuIl19LAogIHtpZDoic3RlbWlfbWFwIiwgY2F0OiJpc3F1ZW1pYSIsIHNldjoiYXR0IiwgbmFtZToiTG9jYWxpemFjacOzbiBkZSBsYSBvY2x1c2nDs24iLCBsZWFkOiJtYXBhIGRlIHJlZmVyZW5jaWEiLCBmaWxlOiJMb2NhbGlzYXRpb24gb2YgdGhlIG9jY2x1c2lvbiBpbiBTVEVNSS5zdmciLAogICBrZXk6IkVzcXVlbWEgZGUgcXXDqSBkZXJpdmFjaW9uZXMgY29ycmVzcG9uZGVuIGEgY2FkYSBhcnRlcmlhLiIsCiAgIGNyaXQ6W1siVXNvIiwicmVmZXJlbmNpYSBwYXJhIGxvY2FsaXphciBsYSBhcnRlcmlhIGN1bHBhYmxlIl1dLAogICBsb29rOlsiQXDDs3lhdGUgZW4gZXN0ZSBtYXBhIHBhcmEgcmVsYWNpb25hciBkZXJpdmFjaW9uZXMgY29uIHRlcnJpdG9yaW8uIl19LAogIHtpZDoicGVyaWNhcmQiLCBjYXQ6ImlzcXVlbWlhIiwgc2V2OiJhdHQiLCBuYW1lOiJQZXJpY2FyZGl0aXMiLCBsZWFkOiJkaWZ1c2EiLCBmaWxlOiJBY3V0ZSBwZXJpY2FyZGl0aXMuanBnIiwKICAga2V5OiJFbGV2YWNpw7NuIGRlbCBTVCBkaWZ1c2EgeSBjw7NuY2F2YSArIGRlc2NlbnNvIGRlbCBQUi4iLAogICBjcml0OltbIkVsZXZhY2nDs24gU1QiLCJkaWZ1c2EsIGPDs25jYXZhICgnZW4gc2lsbGEnKSJdLFsiU2VnbWVudG8gUFIiLCJkZXNjZW5kaWRvIl0sWyJSZWNpcHJvY2lkYWQiLCJubyBzaWd1ZSB0ZXJyaXRvcmlvIGNvcm9uYXJpbyJdXSwKICAgbG9vazpbIlNUIGVsZXZhZG8gZW4gY2FzaSB0b2RhcyBsYXMgZGVyaXZhY2lvbmVzLCBjw7NuY2F2bywgc2luIGltYWdlbiBlbiBlc3Blam8gY2xhcmEuIl19LAogIHtpZDoicmVwb2wiLCBjYXQ6ImlzcXVlbWlhIiwgc2V2OiJhdHQiLCBuYW1lOiJSZXBvbGFyaXphY2nDs24gcHJlY296IiwgbGVhZDoiVjLigJNWNSIsIGZpbGU6IkJlbmlnbiBlYXJseSByZXBvbG9yaXphdGlvbi5qcGciLAogICBrZXk6IkVsZXZhY2nDs24gZGVsIFNUIGPDs25jYXZhIGNvbiBtdWVzY2EgZW4gZWwgcHVudG8gSjsgc3VlbGUgc2VyIGJlbmlnbmEuIiwKICAgY3JpdDpbWyJQdW50byBKIiwiZW1wYXN0YW1pZW50byAvIG11ZXNjYSJdLFsiU1QiLCJlbGV2YWNpw7NuIGPDs25jYXZhIGxldmUiXSxbIkNvbnRleHRvIiwiam92ZW4sIGFzaW50b23DoXRpY28iXV0sCiAgIGxvb2s6WyJQYXRyw7NuIGVzdGFibGUsIHNpbiBkb2xvciBuaSBldm9sdWNpw7NuOyBkaWZlcsOpbmNpYWxvIGRlbCBTQ0FDRVNULiJdfSwKCiAgLy8gLS0tLSBDT05EVUNDScOTTiAtLS0tCiAge2lkOiJicmkiLCBjYXQ6ImNvbmR1Y2Npb24iLCBzZXY6ImF0dCIsIG5hbWU6IkJsb3F1ZW8gZGUgcmFtYSBpenF1aWVyZGEgKEJSSSkiLCBsZWFkOiJWMSB5IFY2IiwgZmlsZToiTGVmdCBidW5kbGUgYnJhbmNoIGJsb2NrLnN2ZyIsCiAgIGtleToiUVJTIGFuY2hvIGNvbiBSIGFuY2hhL21lbGxhZGEgZW4gSSB5IFY2OyBzaW4gcSBsYXRlcmFsLiIsCiAgIGNyaXQ6W1siUVJTIiwi4omlMCwxMiBzIl0sWyJWNiAvIEkiLCJSIGFuY2hhIG8gbWVsbGFkYSJdLFsiVjEiLCJRUyBvIHJTIHByb2Z1bmRvIl0sWyJPam8iLCJkaWZpY3VsdGEgbGVlciBpc3F1ZW1pYSJdXSwKICAgbG9vazpbIlFSUyBhbmNobyBjb24gbW9yZm9sb2fDrWEgJ2RlIHRvcnJlJyBlbiBsYXRlcmFsLiIsIkJSSSBudWV2byArIGRvbG9yIHRvcsOhY2ljbyA9IHRyw6F0YWxvIGNvbW8gZXF1aXZhbGVudGUgZGUgU0NBQ0VTVC4iXX0sCiAge2lkOiJicmQiLCBjYXQ6ImNvbmR1Y2Npb24iLCBzZXY6ImF0dCIsIG5hbWU6IkJsb3F1ZW8gZGUgcmFtYSBkZXJlY2hhIChCUkQpIiwgbGVhZDoiVjEgeSBWNiIsIGZpbGU6IlJpZ2h0IGJ1bmRsZSBicmFuY2ggYmxvY2sgRUNHIGNoYXJhY3RlcmlzdGljcy5zdmciLAogICBrZXk6IlFSUyBhbmNobyBjb24gcGF0csOzbiByU1InIGVuIFYxICgnb3JlamFzIGRlIGNvbmVqbycpIHkgUyBhbmNoYSBlbiBJL1Y2LiIsCiAgIGNyaXQ6W1siUVJTIiwi4omlMCwxMiBzIl0sWyJWMSIsInJTUicgKCdvcmVqYXMgZGUgY29uZWpvJykiXSxbIkkgLyBWNiIsIlMgYW5jaGEgeSBlbXBhc3RhZGEiXV0sCiAgIGxvb2s6WyJEb2JsZSBwaWNvIGVuIFYxOyBTIGFuY2hhIGVuIGRlcml2YWNpb25lcyBsYXRlcmFsZXMuIl19LAogIHtpZDoid3B3IiwgY2F0OiJjb25kdWNjaW9uIiwgc2V2OiJ1cmciLCBuYW1lOiJXUFcgKHByZWV4Y2l0YWNpw7NuKSIsIGxlYWQ6ImRlcml2YWNpb25lcyBtw7psdGlwbGVzIiwgZmlsZTpudWxsLCBmaW5kOiJXb2xmZiBQYXJraW5zb24gV2hpdGUgRUNHIGRlbHRhIHdhdmUiLAogICBrZXk6IlBSIGNvcnRvICsgb25kYSBkZWx0YSArIFFSUyBhbmNobyBwb3IgdsOtYSBhY2Nlc29yaWEuIiwKICAgY3JpdDpbWyJQUiIsImNvcnRvICg8MCwxMiBzKSJdLFsiT25kYSBkZWx0YSIsImVtcGFzdGFtaWVudG8gaW5pY2lhbCBkZWwgUVJTIl0sWyJRUlMiLCJlbnNhbmNoYWRvIl0sWyJSaWVzZ28iLCJGQSBwcmVleGNpdGFkYTogZXZpdGEgZnJlbmFkb3JlcyBkZWwgbm9kbyBBViJdXSwKICAgbG9vazpbIlN1YmlkYSBsZW50YSBhbCBpbmljaW8gZGVsIFFSUyAoZGVsdGEpIGNvbiBQUiBjb3J0by4iXX0sCiAge2lkOiJiYXYxIiwgY2F0OiJjb25kdWNjaW9uIiwgc2V2OiJhdHQiLCBuYW1lOiJCbG9xdWVvIEFWIGRlIDEuwrogZ3JhZG8iLCBsZWFkOiJkZXJpdmFjacOzbiBJSSIsIGZpbGU6bnVsbCwgZmluZDoiZmlyc3QgZGVncmVlIEFWIGJsb2NrIEVDRyIsCiAgIGtleToiUFIgbGFyZ28geSBmaWpvICg+MCwyMCBzKTsgdG9kYXMgbGFzIFAgY29uZHVjZW4uIiwKICAgY3JpdDpbWyJQUiIsIj4wLDIwIHMsIGNvbnN0YW50ZSJdLFsiQ29uZHVjY2nDs24iLCJjYWRhIFAgbGxldmEgc3UgUVJTIl1dLAogICBsb29rOlsiUFIgYWxhcmdhZG8gcGVybyBlc3RhYmxlLCBzaW4gbGF0aWRvcyBwZXJkaWRvcy4iXX0sCiAge2lkOiJiYXYyYSIsIGNhdDoiY29uZHVjY2lvbiIsIHNldjoiYXR0IiwgbmFtZToiQmxvcXVlbyBBViAyLsK6IMK3IE1vYml0eiBJIChXZW5ja2ViYWNoKSIsIGxlYWQ6ImRlcml2YWNpw7NuIElJIiwgZmlsZTpudWxsLCBmaW5kOiJNb2JpdHogSSBXZW5ja2ViYWNoIEVDRyIsCiAgIGtleToiRWwgUFIgc2UgYWxhcmdhIHByb2dyZXNpdmFtZW50ZSBoYXN0YSBxdWUgdW5hIFAgbm8gY29uZHVjZS4iLAogICBjcml0OltbIlBSIiwic2UgYWxhcmdhIGxhdGlkbyBhIGxhdGlkbyJdLFsiQ2HDrWRhIiwidW5hIFAgc2luIFFSUyB5IHZ1ZWx0YSBhIGVtcGV6YXIiXSxbIk5pdmVsIiwic3VlbGUgc2VyIG5vZGFsLCBiZW5pZ25vIl1dLAogICBsb29rOlsiR3J1cG9zIGRlIGxhdGlkb3MgY29uIFBSIGNyZWNpZW50ZSB5IHVuIFFSUyBxdWUgZmFsdGEuIl19LAogIHtpZDoiYmF2MmIiLCBjYXQ6ImNvbmR1Y2Npb24iLCBzZXY6InVyZyIsIG5hbWU6IkJsb3F1ZW8gQVYgMi7CuiDCtyBNb2JpdHogSUkiLCBsZWFkOiJkZXJpdmFjacOzbiBJSSIsIGZpbGU6bnVsbCwgZmluZDoiTW9iaXR6IElJIHNlY29uZCBkZWdyZWUgQVYgYmxvY2sgRUNHIiwKICAga2V5OiJDYcOtZGFzIHPDumJpdGFzIGRlIFFSUyBzaW4gYWxhcmdhbWllbnRvIHByZXZpbyBkZWwgUFIuIiwKICAgY3JpdDpbWyJQUiIsImNvbnN0YW50ZSBlbiBsb3MgY29uZHVjaWRvcyJdLFsiQ2HDrWRhIiwiUVJTIHBlcmRpZG9zIGRlIGZvcm1hIGJydXNjYSJdLFsiUmllc2dvIiwicHJvZ3Jlc2EgYSBibG9xdWVvIGNvbXBsZXRvIOKGkiBtYXJjYXBhc29zIl1dLAogICBsb29rOlsiUCBxdWUgZGUgcmVwZW50ZSBubyBjb25kdWNlLCBzaW4gYXZpc28gZW4gZWwgUFIuIl19LAogIHtpZDoiYmF2MyIsIGNhdDoiY29uZHVjY2lvbiIsIHNldjoiY3JpdCIsIG5hbWU6IkJsb3F1ZW8gQVYgY29tcGxldG8gKDMuwropIiwgbGVhZDoiZGVyaXZhY2nDs24gSUkiLCBmaWxlOm51bGwsIGZpbmQ6InRoaXJkIGRlZ3JlZSBjb21wbGV0ZSBoZWFydCBibG9jayBFQ0ciLAogICBrZXk6IkRpc29jaWFjacOzbiBBViB0b3RhbDogUCB5IFFSUyBtYXJjaGFuIGluZGVwZW5kaWVudGVzLiIsCiAgIGNyaXQ6W1siRGlzb2NpYWNpw7NuIiwiUCB5IFFSUyBzaW4gcmVsYWNpw7NuIl0sWyJFc2NhcGUiLCJyaXRtbyBkZSBlc2NhcGUgbGVudG8iXSxbIk1hbmVqbyIsIm1hcmNhcGFzb3MiXV0sCiAgIGxvb2s6WyJQIHJlZ3VsYXJlcyB5IFFSUyByZWd1bGFyZXMgcGVybyBhIGRpc3RpbnRvIHJpdG1vLCBzaW4gcmVsYWNpw7NuIGVudHJlIHPDrS4iXX0sCiAge2lkOiJwYWNlIiwgY2F0OiJjb25kdWNjaW9uIiwgc2V2OiJhdHQiLCBuYW1lOiJFc3RpbXVsYWNpw7NuIHBvciBtYXJjYXBhc29zIiwgbGVhZDoiZGVyaXZhY2nDs24gSUkiLCBmaWxlOiJFQ0cgcGFjZW1ha2VyIHN5bmRyb21lLnN2ZyIsCiAgIGtleToiRXNwaWdhcyB2ZXJ0aWNhbGVzIGRlIG1hcmNhcGFzb3MgYW50ZXMgZGUgbGEgb25kYSBlc3RpbXVsYWRhLiIsCiAgIGNyaXQ6W1siRXNwaWdhIiwibMOtbmVhIHZlcnRpY2FsIGZpbmEgYW50ZXMgZGVsIFFSUy9QIl0sWyJDYXB0dXJhIiwiUVJTIGFuY2hvIHRyYXMgbGEgZXNwaWdhIl1dLAogICBsb29rOlsiQnVzY2EgbGFzIGVzcGlnYXMgZGUgZXN0aW11bGFjacOzbiB5IGNvbXBydWViYSBxdWUgY2FwdHVyYW4uIl19LAoKICAvLyAtLS0tIE9UUk9TIC0tLS0KICB7aWQ6ImhpcGVyayIsIGNhdDoib3Ryb3MiLCBzZXY6InVyZyIsIG5hbWU6IkhpcGVycG90YXNlbWlhIiwgbGVhZDoiZGVyaXZhY2lvbmVzIG3Dumx0aXBsZXMiLCBmaWxlOm51bGwsIGZpbmQ6Imh5cGVya2FsZW1pYSBFQ0cgcGVha2VkIFQgd2F2ZXMiLAogICBrZXk6IlQgcGljdWRhcyB5IGVzdHJlY2hhczsgYWwgc3ViaXIsIFAgYXBsYW5hZGEgeSBRUlMgYW5jaG8uIiwKICAgY3JpdDpbWyJPbmRhIFQiLCJhbHRhLCBwaWN1ZGEsIHNpbcOpdHJpY2EiXSxbIk9uZGEgUCIsInNlIGFwbGFuYSBhbCBwcm9ncmVzYXIiXSxbIlFSUyIsInNlIGVuc2FuY2hhOyByaWVzZ28gZGUgUENSIl1dLAogICBsb29rOlsiVCBhbHRhcyB5IHB1bnRpYWd1ZGFzIOKGkiBtaWRlIGVsIHBvdGFzaW8geSB0csOhdGFsby4iXX0sCiAge2lkOiJxdGxhcmdvIiwgY2F0OiJvdHJvcyIsIHNldjoiYXR0IiwgbmFtZToiUVQgbGFyZ28iLCBsZWFkOiJkZXJpdmFjacOzbiBJSSIsIGZpbGU6bnVsbCwgZmluZDoibG9uZyBRVCBpbnRlcnZhbCBFQ0ciLAogICBrZXk6IlFUYyBwcm9sb25nYWRvOyBwcmVkaXNwb25lIGEgdG9yc2FkZSBkZSBwb2ludGVzLiIsCiAgIGNyaXQ6W1siUVRjIiwicHJvbG9uZ2FkbyAoPjQ2MOKAkzQ4MCBtcykiXSxbIkNhdXNhcyIsImbDoXJtYWNvcywgaGlwby1LL01nL0NhLCBjb25nw6luaXRvIl0sWyJSaWVzZ28iLCJ0b3JzYWRlIl1dLAogICBsb29rOlsiTWlkZSBlbCBRVCB5IGNvcnLDrWdlbG8gcG9yIGxhIGZyZWN1ZW5jaWEgKFFUYykuIl19LAogIHtpZDoiYnJ1Z2FkYSIsIGNhdDoib3Ryb3MiLCBzZXY6InVyZyIsIG5hbWU6IlPDrW5kcm9tZSBkZSBCcnVnYWRhIiwgbGVhZDoiVjHigJNWMiIsIGZpbGU6IkJydWdhZGEgc3luZHJvbWUgRUNHcy5qcGciLAogICBrZXk6IlBhdHLDs24gclNSJyBjb24gU1QgZGVzY2VuZGVudGUgJ2VuIGFsZXRhJyBlbiBWMeKAk1YyLiIsCiAgIGNyaXQ6W1siVjHigJNWMiIsImVsZXZhY2nDs24gU1QgZGVzY2VuZGVudGUgKHRpcG8gMSkiXSxbIk9uZGEgVCIsIm5lZ2F0aXZhIl0sWyJSaWVzZ28iLCJtdWVydGUgc8O6Yml0YSBhcnLDrXRtaWNhIl1dLAogICBsb29rOlsiU1QgZW4gJ2FsZXRhIGRlIHRpYnVyw7NuJyBlbiBwcmVjb3JkaWFsZXMgZGVyZWNoYXMuIl19LAogIHtpZDoiaHZpIiwgY2F0OiJvdHJvcyIsIHNldjoiYXR0IiwgbmFtZToiSGlwZXJ0cm9maWEgdmVudHJpY3VsYXIgaXpxdWllcmRhIiwgbGVhZDoiVjEgeSBWNeKAk1Y2IiwgZmlsZTpudWxsLCBmaW5kOiJsZWZ0IHZlbnRyaWN1bGFyIGh5cGVydHJvcGh5IEVDRyBTb2tvbG93IiwKICAga2V5OiJDcml0ZXJpb3MgZGUgdm9sdGFqZSAoU29rb2xvdykgY29uIHNvYnJlY2FyZ2EuIiwKICAgY3JpdDpbWyJWb2x0YWplIiwiUyhWMSkrUihWNS9WNikgPjM1IG1tIl0sWyJTb2JyZWNhcmdhIiwiZGVzY2Vuc28gU1QgLyBUIGludmVydGlkYSBsYXRlcmFsIl1dLAogICBsb29rOlsiUVJTIG11eSB2b2x0YWRvIGVuIHByZWNvcmRpYWxlcyBjb24gYWx0ZXJhY2nDs24gc2VjdW5kYXJpYSBkZSBsYSByZXBvbGFyaXphY2nDs24uIl19Cl07Cgpjb25zdCBGUCA9IGYgPT4gImh0dHBzOi8vY29tbW9ucy53aWtpbWVkaWEub3JnL3dpa2kvU3BlY2lhbDpGaWxlUGF0aC8iICsgZW5jb2RlVVJJQ29tcG9uZW50KGYpOwpjb25zdCBGSUxFX1BBR0UgPSBmID0+ICJodHRwczovL2NvbW1vbnMud2lraW1lZGlhLm9yZy93aWtpL0ZpbGU6IiArIGVuY29kZVVSSUNvbXBvbmVudChmKTsKY29uc3QgU0VBUkNIID0gdCA9PiAiaHR0cHM6Ly9jb21tb25zLndpa2ltZWRpYS5vcmcvdy9pbmRleC5waHA/c2VhcmNoPSIgKyBlbmNvZGVVUklDb21wb25lbnQoIkVDRyAiK3QpICsgIiZ0aXRsZT1TcGVjaWFsOk1lZGlhU2VhcmNoJnR5cGU9aW1hZ2UiOwoKbGV0IHN0YXRlID0ge2NhdDoiYWxsIiwgcToiIiwgdXNlckltZzpudWxsLCBzdHJlYW06bnVsbH07Cgpjb25zdCBncmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dyaWQnKTsKCmZ1bmN0aW9uIHRodW1iSFRNTChkLCB3KXsKICBpZihkLmZpbGUpewogICAgcmV0dXJuIGA8aW1nIGxvYWRpbmc9ImxhenkiIHNyYz0iJHtGUChkLmZpbGUpfT93aWR0aD0ke3d9IiBhbHQ9IkVsZWN0cm8gZGUgJHtkLm5hbWV9IgogICAgICBvbmVycm9yPSJ0aGlzLnBhcmVudE5vZGUuaW5uZXJIVE1MPScmbHQ7ZGl2IGNsYXNzPVxcJ3BlbmRpbmdcXCcmZ3Q7aW1hZ2VuIG5vIGRpc3BvbmlibGUmbHQ7L2RpdiZndDsnIj5gOwogIH0KICByZXR1cm4gYDxkaXYgY2xhc3M9InBlbmRpbmciPgogICAgICA8c3ZnIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjYiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjMiLz48cGF0aCBkPSJNMTIgOHY4TTggMTJoOCIvPjwvc3ZnPgogICAgICBpbWFnZW4gcG9yIGHDsWFkaXI8L2Rpdj5gOwp9CgpmdW5jdGlvbiByZW5kZXIoKXsKICBjb25zdCBxID0gc3RhdGUucS50cmltKCkudG9Mb3dlckNhc2UoKTsKICBjb25zdCBpdGVtcyA9IERBVEEuZmlsdGVyKGQ9PnsKICAgIGlmKHN0YXRlLmNhdCE9PSJhbGwiICYmIGQuY2F0IT09c3RhdGUuY2F0KSByZXR1cm4gZmFsc2U7CiAgICBpZihxKXsKICAgICAgY29uc3QgaGF5ID0gKGQubmFtZSsiICIrZC5rZXkrIiAiK2QubGVhZCsiICIrZC5jcml0Lm1hcChjPT5jLmpvaW4oIiAiKSkuam9pbigiICIpKS50b0xvd2VyQ2FzZSgpOwogICAgICBpZighaGF5LmluY2x1ZGVzKHEpKSByZXR1cm4gZmFsc2U7CiAgICB9CiAgICByZXR1cm4gdHJ1ZTsKICB9KTsKCiAgbGV0IGh0bWwgPSAiIjsKICBsZXQgbGFzdENhdCA9IG51bGw7CiAgY29uc3Qgb3JkZXIgPSBbInJpdG1vIiwidmVudHJpY3VsYXIiLCJpc3F1ZW1pYSIsImNvbmR1Y2Npb24iLCJvdHJvcyJdOwogIGl0ZW1zLnNvcnQoKGEsYik9Pm9yZGVyLmluZGV4T2YoYS5jYXQpLW9yZGVyLmluZGV4T2YoYi5jYXQpKTsKICBpdGVtcy5mb3JFYWNoKGQ9PnsKICAgIGlmKGQuY2F0IT09bGFzdENhdCl7CiAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9Imdyb3VwLWgiPjxoMj4ke0NBVFNbZC5jYXRdfTwvaDI+PHNwYW4gY2xhc3M9InJ1bGUiPjwvc3Bhbj48L2Rpdj5gOwogICAgICBsYXN0Q2F0ID0gZC5jYXQ7CiAgICB9CiAgICBodG1sICs9IGA8YnV0dG9uIGNsYXNzPSJjYXJkIiBkYXRhLWlkPSIke2QuaWR9Ij4KICAgICAgPGRpdiBjbGFzcz0idGh1bWIiPjxzcGFuIGNsYXNzPSJzZXYtdGFnICR7ZC5zZXZ9Ij4ke1NFVltkLnNldl19PC9zcGFuPiR7dGh1bWJIVE1MKGQsNDIwKX08L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iYy1ib2R5Ij48aDM+JHtkLm5hbWV9PC9oMz48ZGl2IGNsYXNzPSJsZWFkIj4ke2QubGVhZH08L2Rpdj48cD4ke2Qua2V5fTwvcD48L2Rpdj4KICAgIDwvYnV0dG9uPmA7CiAgfSk7CiAgaWYoIWl0ZW1zLmxlbmd0aCkgaHRtbCA9IGA8ZGl2IHN0eWxlPSJncmlkLWNvbHVtbjoxLy0xO2NvbG9yOnZhcigtLW11dGVkKTtwYWRkaW5nOjMwcHggNHB4Ij5TaW4gcmVzdWx0YWRvcy4gUHJ1ZWJhIG90cmEgcGFsYWJyYSBvIGxpbXBpYSBlbCBmaWx0cm8uPC9kaXY+YDsKICBncmlkLmlubmVySFRNTCA9IGh0bWw7CiAgZ3JpZC5xdWVyeVNlbGVjdG9yQWxsKCcuY2FyZCcpLmZvckVhY2goYz0+Yy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsKCk9Pm9wZW5EZXRhaWwoYy5kYXRhc2V0LmlkKSkpOwp9CgovKiAtLS0tLS0tLS0tIGRldGFpbCBtb2RhbCAtLS0tLS0tLS0tICovCmNvbnN0IG1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsJyk7CmNvbnN0IHNoZWV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoZWV0Jyk7CgpmdW5jdGlvbiBvcGVuRGV0YWlsKGlkKXsKICBjb25zdCBkID0gREFUQS5maW5kKHg9PnguaWQ9PT1pZCk7CiAgY29uc3QgcmVmSW1nID0gZC5maWxlCiAgICA/IGA8aW1nIHNyYz0iJHtGUChkLmZpbGUpfT93aWR0aD05MDAiIGFsdD0iRWxlY3RybyBkZSAke2QubmFtZX0iIG9uZXJyb3I9InRoaXMucGFyZW50Tm9kZS5pbm5lckhUTUw9JyZsdDtkaXYgY2xhc3M9XFwncGVuZGluZ1xcJyZndDtpbWFnZW4gbm8gZGlzcG9uaWJsZSZsdDsvZGl2Jmd0OyciPmAKICAgIDogYDxkaXYgY2xhc3M9InBlbmRpbmciPkltYWdlbiBwb3IgYcOxYWRpcjxicj48YSBocmVmPSIke1NFQVJDSChkLmZpbmR8fGQubmFtZSl9IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciIgc3R5bGU9ImNvbG9yOnZhcigtLXRyYWNlKSI+QnVzY2FyIGVuIFdpa2ltZWRpYSBDb21tb25zIOKGkjwvYT48L2Rpdj5gOwoKICBjb25zdCBjb21wYXJlQmxvY2sgPSBzdGF0ZS51c2VySW1nID8gYAogICAgPGRpdiBjbGFzcz0iY21wLXdyYXAiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjRweCI+CiAgICAgIDxkaXYgY2xhc3M9ImNtcC1jb2wgeW91Ij48cCBjbGFzcz0ibGFiIj5UdSBlbGVjdHJvPC9wPjxkaXYgY2xhc3M9ImltZy1wYW5lbCI+PGltZyBzcmM9IiR7c3RhdGUudXNlckltZ30iIGFsdD0iVHUgZWxlY3RybyI+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImNtcC1jb2wiPjxwIGNsYXNzPSJsYWIiPlJlZmVyZW5jaWEgwrcgJHtkLm5hbWV9PC9wPjxkaXYgY2xhc3M9ImltZy1wYW5lbCI+JHtyZWZJbWd9PC9kaXY+PC9kaXY+CiAgICA8L2Rpdj5gIDogYDxkaXYgY2xhc3M9ImltZy1wYW5lbCI+JHtyZWZJbWd9PC9kaXY+YDsKCiAgY29uc3QgYXR0cmliID0gZC5maWxlCiAgICA/IGA8ZGl2IGNsYXNzPSJhdHRyaWIiPjxzcGFuPkltYWdlbjo8L3NwYW4+PGEgaHJlZj0iJHtGSUxFX1BBR0UoZC5maWxlKX0iIHRhcmdldD0iX2JsYW5rIiByZWw9Im5vb3BlbmVyIj4ke2QuZmlsZX0gwrcgV2lraW1lZGlhIENvbW1vbnMg4oaXPC9hPjwvZGl2PmAKICAgIDogYDxkaXYgY2xhc3M9ImF0dHJpYiI+PHNwYW4+UGVuZGllbnRlIGRlIGltYWdlbiDCtzwvc3Bhbj48YSBocmVmPSIke1NFQVJDSChkLmZpbmR8fGQubmFtZSl9IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciI+QnVzY2FyIGVuIENvbW1vbnMg4oaXPC9hPjwvZGl2PmA7CgogIHNoZWV0LmlubmVySFRNTCA9IGAKICAgIDxkaXYgY2xhc3M9InNoZWV0LXRvcCI+CiAgICAgIDxkaXY+CiAgICAgICAgPGgyIGlkPSJtVGl0bGUiPiR7ZC5uYW1lfTwvaDI+CiAgICAgICAgPGRpdiBjbGFzcz0ic3ViIj4ke2QubGVhZH08L2Rpdj4KICAgICAgICA8c3BhbiBjbGFzcz0ic2V2LWJhbm5lciAke2Quc2V2fSI+JHtTRVZbZC5zZXZdfTwvc3Bhbj4KICAgICAgPC9kaXY+CiAgICAgIDxidXR0b24gY2xhc3M9IngiIGlkPSJjbG9zZVgiIGFyaWEtbGFiZWw9IkNlcnJhciI+w5c8L2J1dHRvbj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0ic2hlZXQtYm9keSI+CiAgICAgICR7Y29tcGFyZUJsb2NrfQogICAgICA8dWwgY2xhc3M9ImNyaXQtbGlzdCI+CiAgICAgICAgJHtkLmNyaXQubWFwKGM9PmA8bGk+PHNwYW4gY2xhc3M9ImsiPiR7Y1swXX08L3NwYW4+PHNwYW4gY2xhc3M9InYiPiR7Y1sxXX08L3NwYW4+PC9saT5gKS5qb2luKCIiKX0KICAgICAgPC91bD4KICAgICAgPGRpdiBjbGFzcz0ibG9vayI+PGg0PsK/UXXDqSBtaXJhcj88L2g0Pjx1bD4ke2QubG9vay5tYXAobD0+YDxsaT4ke2x9PC9saT5gKS5qb2luKCIiKX08L3VsPjwvZGl2PgogICAgICAke2F0dHJpYn0KICAgICAgPGRpdiBjbGFzcz0ic2hlZXQtYWN0aW9ucyI+CiAgICAgICAgJHtzdGF0ZS51c2VySW1nID8gIiIgOiBgPGJ1dHRvbiBjbGFzcz0iYnRuIHByaW1hcnkiIGlkPSJjbXBGcm9tRGV0YWlsIj5Db21wYXJhciBjb24gbWkgZWxlY3RybzwvYnV0dG9uPmB9CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBpZD0iY2xvc2VCdG4iPkNlcnJhcjwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PmA7CiAgbW9kYWwuY2xhc3NMaXN0LmFkZCgnb24nKTsKICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93PSdoaWRkZW4nOwogIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJyNjbG9zZVgnKS5vbmNsaWNrID0gY2xvc2VEZXRhaWw7CiAgc2hlZXQucXVlcnlTZWxlY3RvcignI2Nsb3NlQnRuJykub25jbGljayA9IGNsb3NlRGV0YWlsOwogIGNvbnN0IGNmZCA9IHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJyNjbXBGcm9tRGV0YWlsJyk7CiAgaWYoY2ZkKSBjZmQub25jbGljayA9ICgpPT57IGNsb3NlRGV0YWlsKCk7IG9wZW5Db21wYXJlKCk7IH07CiAgc2hlZXQucXVlcnlTZWxlY3RvcignI2Nsb3NlWCcpLmZvY3VzKCk7Cn0KZnVuY3Rpb24gY2xvc2VEZXRhaWwoKXsgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZSgnb24nKTsgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdz0nJzsgfQptb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGU9PnsgaWYoZS50YXJnZXQ9PT1tb2RhbCkgY2xvc2VEZXRhaWwoKTsgfSk7CmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBlPT57IGlmKGUua2V5PT09J0VzY2FwZScpeyBjbG9zZURldGFpbCgpOyB9IH0pOwoKLyogLS0tLS0tLS0tLSBmaWx0ZXJzICYgc2VhcmNoIC0tLS0tLS0tLS0gKi8KZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoaXBzJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlPT57CiAgY29uc3QgYiA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5jaGlwJyk7IGlmKCFiKSByZXR1cm47CiAgc3RhdGUuY2F0ID0gYi5kYXRhc2V0LmNhdDsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hpcCcpLmZvckVhY2goYz0+Yy5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIGM9PT1iKSk7CiAgcmVuZGVyKCk7Cn0pOwpkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncScpLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZT0+eyBzdGF0ZS5xPWUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7CgovKiAtLS0tLS0tLS0tIGLDunNxdWVkYSBwb3Igdm96ICh2MikgLS0tLS0tLS0tLSAqLwpjb25zdCB2bWljPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2bWljJyk7CmNvbnN0IHFFbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncScpOwpjb25zdCBTUkE9d2luZG93LlNwZWVjaFJlY29nbml0aW9ufHx3aW5kb3cud2Via2l0U3BlZWNoUmVjb2duaXRpb247CmNvbnN0IG5vcm09dD0+dC50b0xvd2VyQ2FzZSgpLm5vcm1hbGl6ZSgnTkZEJykucmVwbGFjZSgvW1x1MDMwMC1cdTAzNmZdL2csJycpLnRyaW0oKTsKY29uc3QgVk9JQ0VfTUFQPVsKICBbWyJyaXRtbyIsImZyZWN1ZW5jaWEiLCJyaXRtb3MiXSwicml0bW8iXSwKICBbWyJ2ZW50cmljdWxhciIsInZlbnRyaWN1bGFyZXMiLCJhcnJpdG1pYXMgdmVudHJpY3VsYXJlcyJdLCJ2ZW50cmljdWxhciJdLAogIFtbImlzcXVlbWlhIiwiaW5mYXJ0byIsImlzcXVlbWlhcyJdLCJpc3F1ZW1pYSJdLAogIFtbImNvbmR1Y2Npb24iLCJibG9xdWVvcyJdLCJjb25kdWNjaW9uIl0sCiAgW1sib3Ryb3MiLCJtZXRhYm9saWNvIiwib3RyYXMiXSwib3Ryb3MiXSwKICBbWyJ0b2RvcyIsInRvZGFzIiwidG9kbyIsImluaWNpbyJdLCJhbGwiXQpdOwpmdW5jdGlvbiBzZXRDYXRVSShjYXQpewogIHN0YXRlLmNhdD1jYXQ7CiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoaXAnKS5mb3JFYWNoKGM9PmMuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBjLmRhdGFzZXQuY2F0PT09Y2F0KSk7CiAgcmVuZGVyKCk7Cn0KZnVuY3Rpb24gaGFuZGxlQXRsYXNWb2ljZSh0ZXh0KXsKICBjb25zdCBjPW5vcm0odGV4dCk7CiAgaWYoYz09PSJsaW1waWFyInx8Yz09PSJib3JyYXIifHxjPT09ImxpbXBpYSIpeyBxRWwudmFsdWU9IiI7IHN0YXRlLnE9IiI7IHJlbmRlcigpOyByZXR1cm4gdHJ1ZTsgfQogIGlmKGM9PT0iY29tcGFyYXIifHxjLmluY2x1ZGVzKCJtaSBlbGVjdHJvIil8fGMuaW5jbHVkZXMoImFicmlyIGNhbWFyYSIpKXsgb3BlbkNvbXBhcmUoKTsgcmV0dXJuIHRydWU7IH0KICBpZihjPT09ImNlcnJhciJ8fGM9PT0ic2FsaXIiKXsgY2xvc2VEZXRhaWwoKTsgcmV0dXJuIHRydWU7IH0KICBmb3IoY29uc3QgW3dvcmRzLGNhdF0gb2YgVk9JQ0VfTUFQKXsKICAgIGlmKHdvcmRzLnNvbWUodz0+Yz09PXd8fGM9PT0idmVyICIrd3x8Yz09PSJtb3N0cmFyICIrdykpeyBzZXRDYXRVSShjYXQpOyByZXR1cm4gdHJ1ZTsgfQogIH0KICBjb25zdCBxMj1jLnJlcGxhY2UoL15idXNjYShyKT9ccysvLCIiKTsKICBjb25zdCBkPURBVEEuZmluZCh4PT5ub3JtKHgubmFtZSkuaW5jbHVkZXMocTIpKTsKICBpZihkICYmIChjLnN0YXJ0c1dpdGgoImFicmlyICIpfHxjLnN0YXJ0c1dpdGgoImFicmUgIikpKXsgb3BlbkRldGFpbChkLmlkKTsgcmV0dXJuIHRydWU7IH0KICByZXR1cm4gZmFsc2U7Cn0KaWYoIVNSQSl7IHZtaWMuc3R5bGUuZGlzcGxheT0ibm9uZSI7IH0KZWxzZXsKICBsZXQgcmVjPW51bGw7CiAgdm1pYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsKCk9PnsKICAgIGlmKHJlYyl7IHJlYy5zdG9wKCk7IHJldHVybjsgfQogICAgcmVjPW5ldyBTUkEoKTsgcmVjLmxhbmc9ImVzLUVTIjsgcmVjLmludGVyaW1SZXN1bHRzPXRydWU7CiAgICB2bWljLmNsYXNzTGlzdC5hZGQoJ2xpc3RlbmluZycpOwogICAgbGV0IGZpbmFsVGV4dD0iIjsKICAgIHJlYy5vbnJlc3VsdD1lPT57CiAgICAgIGxldCBpbnRlcmltPSIiOwogICAgICBmb3IobGV0IGk9ZS5yZXN1bHRJbmRleDtpPGUucmVzdWx0cy5sZW5ndGg7aSsrKXsKICAgICAgICBjb25zdCByPWUucmVzdWx0c1tpXTsKICAgICAgICBpZihyLmlzRmluYWwpIGZpbmFsVGV4dCs9clswXS50cmFuc2NyaXB0OyBlbHNlIGludGVyaW0rPXJbMF0udHJhbnNjcmlwdDsKICAgICAgfQogICAgICBjb25zdCB0PShmaW5hbFRleHQraW50ZXJpbSkudHJpbSgpOwogICAgICBxRWwudmFsdWU9dDsgc3RhdGUucT10OyByZW5kZXIoKTsKICAgIH07CiAgICByZWMub25lcnJvcj1lPT57IGlmKGUuZXJyb3I9PT0ibm90LWFsbG93ZWQiKSBhbGVydCgiUGVybWl0ZSBlbCBtaWNyw7Nmb25vIHBhcmEgZGljdGFyIGxhIGLDunNxdWVkYS4iKTsgfTsKICAgIHJlYy5vbmVuZD0oKT0+ewogICAgICB2bWljLmNsYXNzTGlzdC5yZW1vdmUoJ2xpc3RlbmluZycpOyByZWM9bnVsbDsKICAgICAgY29uc3QgZj1maW5hbFRleHQudHJpbSgpOwogICAgICBpZihmICYmIGhhbmRsZUF0bGFzVm9pY2UoZikpeyBxRWwudmFsdWU9IiI7IHN0YXRlLnE9IiI7IGlmKHN0YXRlLmNhdD09PSJhbGwiKXJlbmRlcigpOyB9CiAgICB9OwogICAgcmVjLnN0YXJ0KCk7CiAgfSk7Cn0KCi8qIC0tLS0tLS0tLS0gY2FtZXJhIC8gY29tcGFyZSAtLS0tLS0tLS0tICovCmNvbnN0IGNtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb21wYXJlJyk7CmNvbnN0IGNtcEhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY21wSGVhZCcpOwpmdW5jdGlvbiB0b2dnbGVDb21wYXJlKGZvcmNlKXsKICBjb25zdCBvcGVuID0gZm9yY2UhPT11bmRlZmluZWQgPyBmb3JjZSA6ICFjbXAuY2xhc3NMaXN0LmNvbnRhaW5zKCdvcGVuJyk7CiAgY21wLmNsYXNzTGlzdC50b2dnbGUoJ29wZW4nLCBvcGVuKTsKICBjbXBIZWFkLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIG9wZW4pOwp9CmZ1bmN0aW9uIG9wZW5Db21wYXJlKCl7IHRvZ2dsZUNvbXBhcmUodHJ1ZSk7IGNtcC5zY3JvbGxJbnRvVmlldyh7YmVoYXZpb3I6J3Ntb290aCcsIGJsb2NrOidzdGFydCd9KTsgfQpjbXBIZWFkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRvZ2dsZUNvbXBhcmUoKSk7CmNtcEhlYWQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGU9PnsgaWYoZS5rZXk9PT0nRW50ZXInfHxlLmtleT09PScgJyl7IGUucHJldmVudERlZmF1bHQoKTsgdG9nZ2xlQ29tcGFyZSgpOyB9fSk7Cgpjb25zdCBmaWxlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZScpOwpjb25zdCB1c2VySW1nQm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJJbWdCb3gnKTsKY29uc3QgdXNlckltZ0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJJbWcnKTsKY29uc3QgY2xlYXJCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXJCdG4nKTsKCmZpbGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBlPT57CiAgY29uc3QgZiA9IGUudGFyZ2V0LmZpbGVzWzBdOyBpZighZikgcmV0dXJuOwogIGNvbnN0IHIgPSBuZXcgRmlsZVJlYWRlcigpOwogIHIub25sb2FkID0gKCk9PnNldFVzZXJJbWcoci5yZXN1bHQpOwogIHIucmVhZEFzRGF0YVVSTChmKTsKfSk7CmZ1bmN0aW9uIHNldFVzZXJJbWcoZGF0YVVybCl7CiAgc3RhdGUudXNlckltZyA9IGRhdGFVcmw7CiAgdXNlckltZ0VsLnNyYyA9IGRhdGFVcmw7CiAgdXNlckltZ0JveC5jbGFzc0xpc3QuYWRkKCdvbicpOwogIGNsZWFyQnRuLmhpZGRlbiA9IGZhbHNlOwp9CmNsZWFyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnsKICBzdGF0ZS51c2VySW1nPW51bGw7IHVzZXJJbWdCb3guY2xhc3NMaXN0LnJlbW92ZSgnb24nKTsgY2xlYXJCdG4uaGlkZGVuPXRydWU7IGZpbGVJbnB1dC52YWx1ZT0iIjsKfSk7CgovKiBsaXZlIGNhbWVyYSAqLwpjb25zdCBsaXZlQnRuPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXZlQnRuJyk7CmNvbnN0IGNhbVN0YWdlPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW1TdGFnZScpOwpjb25zdCB2aWRlbz1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlkZW8nKTsKY29uc3QgY2FtSGludD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FtSGludCcpOwpsaXZlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCk9PnsKICB0cnl7CiAgICBzdGF0ZS5zdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7dmlkZW86e2ZhY2luZ01vZGU6e2lkZWFsOidlbnZpcm9ubWVudCd9fX0pOwogICAgdmlkZW8uc3JjT2JqZWN0ID0gc3RhdGUuc3RyZWFtOyBhd2FpdCB2aWRlby5wbGF5KCk7CiAgICBjYW1TdGFnZS5jbGFzc0xpc3QuYWRkKCdvbicpOwogIH1jYXRjaChlcnIpewogICAgY2FtSGludC50ZXh0Q29udGVudCA9ICJObyBzZSBwdWRvIGFicmlyIGxhIGPDoW1hcmEgZW4gdml2byBhcXXDrSAoIitlcnIubmFtZSsiKS4gVXNhIOKAnEhhY2VyIC8gc3ViaXIgZm90b+KAnSwgcXVlIHRhbWJpw6luIGFicmUgbGEgY8OhbWFyYSBlbiBlbCBtw7N2aWwuIjsKICAgIGNhbUhpbnQuc3R5bGUuY29sb3IgPSAiI2YwNTA2ZSI7CiAgfQp9KTsKZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NuYXBCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57CiAgY29uc3QgYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTsKICBjLndpZHRoPXZpZGVvLnZpZGVvV2lkdGg7IGMuaGVpZ2h0PXZpZGVvLnZpZGVvSGVpZ2h0OwogIGMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodmlkZW8sMCwwKTsKICBzZXRVc2VySW1nKGMudG9EYXRhVVJMKCdpbWFnZS9qcGVnJywwLjkpKTsKICBzdG9wQ2FtKCk7Cn0pOwpkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3RvcENhbSk7CmZ1bmN0aW9uIHN0b3BDYW0oKXsKICBpZihzdGF0ZS5zdHJlYW0peyBzdGF0ZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaCh0PT50LnN0b3AoKSk7IHN0YXRlLnN0cmVhbT1udWxsOyB9CiAgY2FtU3RhZ2UuY2xhc3NMaXN0LnJlbW92ZSgnb24nKTsKfQoKcmVuZGVyKCk7Cjwvc2NyaXB0Pgo8L2JvZHk+CjwvaHRtbD4K";
const atlasOverlay=$("#atlasOverlay"),atlasFrame=$("#atlasFrame");
let atlasLoaded=false;
function openAtlas(){
  if(!atlasLoaded){
    try{
      const bin=atob(ATLAS_B64);
      const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      atlasFrame.srcdoc=new TextDecoder("utf-8").decode(bytes);
      atlasLoaded=true;
    }catch(e){toast("No se pudo cargar el Atlas ECG");return}
  }
  atlasOverlay.style.display="block";
  requestAnimationFrame(()=>atlasOverlay.classList.add("on"));
}
function closeAtlas(){
  atlasOverlay.classList.remove("on");
  setTimeout(()=>{atlasOverlay.style.display="none"},260);
}
$("#atlasFab").onclick=openAtlas;
$("#atlasClose").onclick=closeAtlas;
atlasOverlay.onclick=e=>{if(e.target===atlasOverlay)closeAtlas()};

render();
