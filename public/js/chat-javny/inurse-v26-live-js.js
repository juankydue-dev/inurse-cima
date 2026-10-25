
(function(){
'use strict';

const $ = (s, r=document) => r.querySelector(s);
const overlay = $('#v26LiveOverlay');
const mini = $('#v26LiveMini');
const startBtn = $('#v26StartLive');
const micBtn = $('#v26MicToggle');
const audioBtn = $('#v26AudioToggle');
const closeCaseBtn = $('#v26CloseCase');
const endBtn = $('#v26EndSession');
const transcript = $('#v26Transcript');
const sourceBox = $('#v26Sources');
const caseBox = $('#v26CaseSummary');
const caseStateLabel = $('#v26CaseState');
const orb = $('#v26Orb');

const LIVE_MODEL_DEFAULT = 'gemini-3.1-flash-live-preview';
const MAX_SESSION_SECONDS = 14 * 60 + 30;
const OPENED_AS_FILE = location.protocol === 'file:';

let ws = null;
let live = false;
let ready = false;
let micPaused = false;
let audioMuted = false;
let startedAt = 0;
let timerId = null;
let reconnectHandle = '';
let inputContext = null;
let inputStream = null;
let inputSource = null;
let inputProcessor = null;
let inputSilentGain = null;
let outputContext = null;
let outputGain = null;
let nextPlayTime = 0;
let playingSources = new Set();
let currentUserText = '';
let currentModelText = '';
let userCommitTimer = null;
let sourceHistory = [];
let caseData = {
  priority:'',
  patientSummary:'',
  immediateActions:[],
  missingData:[],
  redFlags:[],
  lastUpdate:''
};

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}
function norm(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9%/.,+\-\s]/g,' ').replace(/\s+/g,' ').trim();
}
function stripHtml(s){
  const d=document.createElement('div');d.innerHTML=String(s||'');return (d.textContent||'').replace(/\s+/g,' ').trim();
}
function flatten(value){
  if(value==null)return'';
  if(typeof value==='string'||typeof value==='number')return String(value);
  if(Array.isArray(value))return value.map(flatten).join(' ');
  if(typeof value==='object')return Object.values(value).map(flatten).join(' ');
  return'';
}
function backendBase(){
  const saved=(localStorage.getItem('inurse_v20_backend_url')||'').trim().replace(/\/$/,'');
  if(saved)return saved;
  if(location.protocol==='http:'||location.protocol==='https:')return location.origin;
  return 'http://localhost:8787';
}
function updateActivationBox(state,title,text){
  const box=$('#v281Activation');
  if(!box)return;
  box.className='v281-activation '+(state||'');
  $('#v281ActivationTitle').textContent=title;
  $('#v281ActivationText').innerHTML=text;
}
async function activationCheck(){
  const isCorrectOrigin=(location.protocol==='http:'||location.protocol==='https:') &&
    (location.hostname==='localhost'||location.hostname==='127.0.0.1');
  if(location.protocol==='file:'){
    updateActivationBox(
      'error',
      'La aplicación está abierta como archivo',
      'Cierra esta pestaña y ejecuta <code>ABRIR_INURSE_CIMA.command</code>. La dirección correcta es <code>http://localhost:8787</code>.'
    );
    return false;
  }
  if(!isCorrectOrigin){
    updateActivationBox(
      '',
      'Enferix está en una dirección distinta',
      'Para el funcionamiento local recomendado utiliza <code>http://localhost:8787</code>.'
    );
  }
  try{
    const data=await fetchJSON(backendBase()+'/api/health');
    updateActivationBox(
      'ok',
      'Servidor local activado',
      'Enferix está abierta correctamente. Ya puedes consultar medicamentos en CIMA-AEMPS.'
    );
    return Boolean(data.ok);
  }catch(e){
    updateActivationBox(
      'error',
      'El servidor local no responde',
      'Ejecuta <code>ABRIR_INURSE_CIMA.command</code> y vuelve a abrir esta pantalla.'
    );
    return false;
  }
}

async function checkLocalBackend(){
  const url='http://localhost:8787';
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),2500);
    const response=await fetch(url+'/api/health',{signal:controller.signal});
    clearTimeout(timeout);
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.ok)throw new Error(data.error||('HTTP '+response.status));
    return {ok:true,data};
  }catch(error){
    return {ok:false,error:error?.message||String(error)};
  }
}
function showFileModeWarning(){
  const box=$('#v261FileWarning');
  if(box)box.classList.add('on');
  setStatus('Abierta como archivo local','warn');
  setStage(
    'error',
    'Falta abrir Javny Live desde el servidor',
    'Inicia el backend y entra en http://localhost:8787. El micrófono no se activará correctamente desde file://.'
  );
  startBtn.textContent='Abrir Javny Live correctamente';
}

function setStatus(text, mode=''){
  $('#v26LiveStatus').textContent=text;
  const dot=$('#v26LiveStatusDot');
  dot.className=mode;
  $('#v26LivePulse').className=mode==='on'?'on':'';
}
function setStage(mode,title,text){
  orb.className='v26-orb '+mode;
  $('#v26StageTitle').textContent=title;
  $('#v26StageText').textContent=text;
}
function enableControls(enabled){
  [micBtn,audioBtn,closeCaseBtn,endBtn].forEach(b=>b.disabled=!enabled);
}
function showLive(){
  overlay.classList.add('on');overlay.setAttribute('aria-hidden','false');mini.classList.remove('on');
}
function minimizeLive(){
  if(!live){overlay.classList.remove('on');return}
  overlay.classList.remove('on');overlay.setAttribute('aria-hidden','true');mini.classList.add('on');
}
function timeText(seconds){
  const m=Math.floor(seconds/60),s=seconds%60;
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function startTimer(){
  startedAt=Date.now();clearInterval(timerId);
  timerId=setInterval(()=>{
    const sec=Math.floor((Date.now()-startedAt)/1000);
    $('#v26LiveTimer').textContent=timeText(sec);
    if(sec>=MAX_SESSION_SECONDS){
      addLine('model','La sesión Live ha alcanzado su límite de seguridad. Finalízala y abre una nueva para continuar.');
      stopLive('Límite de sesión alcanzado');
    }
  },1000);
}
function resetTimer(){
  clearInterval(timerId);timerId=null;$('#v26LiveTimer').textContent='00:00';
}
function addLine(role,text,temporary=false){
  const empty=$('.v26-transcript-empty',transcript);if(empty)empty.remove();
  let row;
  if(temporary){
    row=$(`.v26-line.${role}[data-temporary="1"]`,transcript);
  }
  if(!row){
    row=document.createElement('div');
    row.className='v26-line '+role;
    if(temporary)row.dataset.temporary='1';
    row.innerHTML='<div class="v26-line-icon">'+(role==='model'?'✨':'🧑‍⚕️')+'</div><div class="v26-bubble"></div>';
    transcript.appendChild(row);
  }
  $('.v26-bubble',row).innerHTML=esc(text)+(temporary?'<small>transcribiendo…</small>':'');
  transcript.scrollTop=transcript.scrollHeight;
  return row;
}
function finalizeTemporary(role,text){
  const row=$(`.v26-line.${role}[data-temporary="1"]`,transcript);
  if(row){
    delete row.dataset.temporary;
    $('.v26-bubble',row).textContent=text;
  }else if(text)addLine(role,text,false);
  transcript.scrollTop=transcript.scrollHeight;
}
function renderCase(){
  const parts=[];
  if(caseData.priority)parts.push(['Prioridad',caseData.priority,/inmediata|critica|emergencia|alta/i.test(caseData.priority)]);
  if(caseData.patientSummary)parts.push(['Resumen',caseData.patientSummary,false]);
  if(caseData.redFlags?.length)parts.push(['Señales de alarma',caseData.redFlags.join(' · '),true]);
  if(caseData.immediateActions?.length)parts.push(['Ahora',caseData.immediateActions.join(' · '),false]);
  if(caseData.missingData?.length)parts.push(['Datos pendientes',caseData.missingData.join(' · '),false]);
  if(!parts.length){
    caseBox.className='v26-case-empty';
    caseBox.textContent='Javny irá organizando prioridad, datos críticos, actuaciones y datos pendientes.';
    caseStateLabel.textContent='Sin datos todavía';return;
  }
  caseBox.className='v26-case-grid';
  caseBox.innerHTML=parts.map(p=>`<div class="v26-case-item${p[2]?' critical':''}"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('');
  caseStateLabel.textContent='Actualizado durante la conversación';
}
function renderSources(){
  if(!sourceHistory.length){
    sourceBox.className='v26-sources-empty';sourceBox.textContent='Todavía no se ha realizado ninguna búsqueda.';return;
  }
  sourceBox.className='';
  sourceBox.innerHTML=sourceHistory.slice(-8).reverse().map(s=>
    `<div class="v26-source"><b>${esc(s.title)}</b><small>${esc(s.meta||'')}</small><em>${esc(s.type||'Fuente Enferix')}</em></div>`
  ).join('');
}
function resetCase(silent=false){
  caseData={priority:'',patientSummary:'',immediateActions:[],missingData:[],redFlags:[],lastUpdate:''};
  sourceHistory=[];renderCase();renderSources();
  if(!silent)addLine('model','Caso cerrado. He borrado el contexto temporal. Puedes iniciar otro diciendo «Oye Javny».');
  if(ws&&ready){
    sendWS({realtimeInput:{text:'El usuario ha cerrado el caso. Borra el contexto clínico temporal del caso anterior y espera un caso nuevo.'}});
  }
}
function sanitizeTranscript(s){
  /* Rescatado del PR #151 al revertir la recuperación por turno. El
     reconocimiento de voz transcribió "112" como "alumno uno dos": oye los
     dígitos sueltos y los encaja en la palabra más probable de su vocabulario
     general. Si eso llega al modelo, la indicación de avisar al 112 se pierde o
     se convierte en ruido. Se normaliza ANTES de cualquier otra cosa, y la
     definición vive en p34 —compartida con la portada—, no aquí. */
  try{ if(window.EnferixUrgencias&&window.EnferixUrgencias.normalizarEmergencias) s=window.EnferixUrgencias.normalizarEmergencias(s); }catch(e){}
  return String(s||'')
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,'[correo omitido]')
    .replace(/\b(?:dni|nie|nhc|nuhsa|historia\s*clinica|nombre|apellidos)\s*[:\-]?\s*[^\n,;]{2,50}/gi,'[identificador omitido]')
    .replace(/\b\d{7,12}\b/g,'[identificador omitido]').trim();
}
function handleVoiceCommand(text){
  const n=norm(text);
  if(/(?:abre|busca).*(?:cima|vademecum|medicamento|farmaco)/.test(n)&&window.EnferixCima){
    const cleaned=text.replace(/(?:oye\s+)?javny/ig,'').replace(/abre|busca|en\s+cima|vademecum|medicamento|farmaco/ig,' ').replace(/\s+/g,' ').trim();
    try{minimizeLive()}catch(e){}
    window.EnferixCima.search(cleaned||'',/para|indicado|patologia/.test(n)?'pathology':'name');
    addLine('model','He abierto el Vademécum CIMA. La sesión Live continúa minimizada.');
    return true;
  }
  if(window.EnferixAlgorithms&&window.EnferixAlgorithms.searchAndOpen(text)){
    try{minimizeLive()}catch(e){}
    addLine('model','He abierto el algoritmo solicitado. La sesión Live continúa minimizada.');
    return true;
  }
  if(/(?:javny\s+)?(?:para|detente|finaliza la sesion|termina la sesion)/.test(n)){
    stopLive('Sesión finalizada por voz');return true;
  }
  if(/(?:javny\s+)?(?:cerrar|cierra|borra|borrar).*(?:caso|contexto)/.test(n)){
    resetCase(false);return true;
  }
  return false;
}

/* ---------------- Knowledge retrieval ---------------- */
let knowledgeIndex=null;
/* Rescatado del PR #152 al revertir la recuperación por turno: funciona igual
   con la búsqueda como function call y protege de un fallo ya visto en sesión
   real. La Biblioteca virtual mezcla contenido clínico con documentación del
   propio producto —cómo se citan las fuentes, cómo se controla la vigencia,
   cómo se despliega—, que comparte vocabulario con lo que un profesional dice
   cuando habla DE la app ("no tienes la fuente") y ganaba la búsqueda por
   coincidencia literal, desplazando al contenido clínico.

   El criterio es la CATEGORÍA editorial que ya llevan, no una lista de títulos:
   así un documento nuevo del mismo tipo queda cubierto sin tocar nada. No se
   borran: siguen en la Biblioteca y se abren desde ella; simplemente no son
   candidatas en una búsqueda clínica.

   Ojo: no todo lo que lleva "fuente" en el título es documentación. "Fuentes
   ocultas de hemorragia en trauma" y "Fuentes de células y acondicionamiento"
   son fichas clínicas, y excluirlas sería un error — de ahí que el filtro mire
   la categoría y no el título. */
var CATEGORIAS_DE_PRODUCTO=/integracion\s+global|calidad\s+y\s+despliegue|gobernanza|catalogo\s+y\s+actualizacion|javny,?\s+gemini|backend,?\s+despliegue|accesibilidad,?\s+movil/i;
function esDocumentacionInterna(f,block){
  try{
    const campos=norm([f&&f.categoria,f&&f.subcategoria,f&&f.tipo_elemento,block&&block.bloque].filter(Boolean).join(' '));
    return CATEGORIAS_DE_PRODUCTO.test(campos);
  }catch(e){ return false; }
}
function prepareKnowledge(){
  if(knowledgeIndex)return knowledgeIndex;
  const out=[];
  try{
    if(typeof DOCS!=='undefined'&&Array.isArray(DOCS)){
      DOCS.forEach(d=>{
        const sections=(d.sec||[]).map(s=>({heading:s.h||'',body:stripHtml(s.b||'')}));
        const text=[d.title,d.source,d.tags,d.summary,sections.map(s=>s.heading+' '+s.body).join(' ')].join(' ');
        out.push({
          type:'Guía clínica',id:d.id,title:d.title||'Sin título',
          meta:(d.source||'Guías clínicas Enferix'),
          searchable:norm(text),
          payload:{
            tipo_fuente:'Guía clínica',
            id:d.id,titulo:d.title,fuente:d.source,resumen:d.summary,
            contenido:sections.slice(0,8),
            advertencia:'Contrastar siempre con el protocolo institucional vigente.'
          }
        });
      });
    }
  }catch(e){console.warn('No se pudo indexar DOCS',e)}
  try{
    const tag=document.getElementById('inurse-master-21');
    const blocks=tag?JSON.parse(tag.textContent):[];
    blocks.forEach(block=>{
      const items=block.fichas||block.herramientas||block.elementos||block.cards||[];
      items.forEach(f=>{
        if(esDocumentacionInterna(f,block)) return;
        const title=f.titulo||f.title||f.nombre||'Sin título';
        const text=[title,block.bloque,f.categoria,f.subcategoria,f.etiquetas,flatten(f)].join(' ');
        out.push({
          type:'Biblioteca virtual',id:f.id||'',title,
          meta:(block.bloque||'Bloque Enferix')+(f.categoria?' · '+f.categoria:''),
          searchable:norm(text),
          payload:{
            tipo_fuente:'Biblioteca virtual',
            bloque:block.bloque,titulo:title,id:f.id||'',
            definicion:f.definicion_documental||f.definicion||f.resumen||'',
            alertas:f.manifestaciones_y_alertas||f.alertas||[],
            valoracion_inicial:f.valoracion_inicial||[],
            algoritmo:f.algoritmo_documental||f.algoritmo_app||[],
            cuidados_enfermeria:f.cuidados_de_enfermeria||[],
            criterios_escalada:f.criterios_de_escalada||[],
            advertencia:f.advertencia||block.advertencia_general||'Contrastar con fuentes vigentes y protocolo local.',
            fuente_documental:f.fuente_documental||''
          }
        });
      });
    });
  }catch(e){console.warn('No se pudo indexar la Biblioteca',e)}
  try{
    (window.V27_ALGORITHM_CATALOG||[]).forEach(a=>{
      const searchable=norm([a.title,a.subtitle,a.category,a.type,a.keywords,a.source,a.warning].join(' '));
      out.push({
        type:'Algoritmo clínico',id:'alg-'+a.id,title:a.title,
        meta:a.category+' · '+a.type+' · '+a.source,
        searchable,
        payload:{
          tipo_fuente:'Algoritmo clínico integrado',
          id:a.id,titulo:a.title,categoria:a.category,tipo:a.type,
          descripcion:a.subtitle,fuente:a.source,
          advertencia:a.warning,
          accion_disponible:'Puede abrirse dentro de Enferix con el módulo Algoritmos clínicos.'
        }
      });
    });
  }catch(e){console.warn('No se pudo indexar el catálogo de algoritmos',e)}
  knowledgeIndex=out;
  return out;
}
const STOP=new Set('de la el los las y o en con por para del al un una unos unas que se su sus es son como ante sobre entre desde hasta paciente caso tengo tiene hay me mi lo le'.split(' '));
const SYNONYMS={
  sepsis:['shock septico','infeccion','lactato','hipotension'],
  ictus:['accidente cerebrovascular','codigo ictus','nihss','focalidad'],
  infarto:['iam','sindrome coronario','dolor toracico','st'],
  disnea:['dificultad respiratoria','hipoxemia','saturacion','respiratorio'],
  hiperpotasemia:['potasio alto','hiperkalemia','ondas t'],
  trauma:['politrauma','politraumatizado','abcde'],
  parada:['pcr','reanimacion','rcp','asistolia'],
  anafilaxia:['alergia grave','adrenalina','estridor'],
  hipoglucemia:['glucosa baja','glucemia baja']
};
function queryTokens(query){
  const n=norm(query);const tokens=n.split(/\s+/).filter(x=>x.length>2&&!STOP.has(x));
  Object.entries(SYNONYMS).forEach(([key,values])=>{
    if(n.includes(key)||values.some(v=>n.includes(v)))tokens.push(key,...values.flatMap(v=>v.split(' ')));
  });
  return [...new Set(tokens)];
}
function searchINurse(query,focus='all',limit=5){
  const tokens=queryTokens(query);const index=prepareKnowledge();
  let scored=index.map(item=>{
    let score=0;
    const title=norm(item.title),meta=norm(item.meta),full=item.searchable;
    tokens.forEach(t=>{
      if(title.includes(t))score+=9;
      if(meta.includes(t))score+=4;
      if(full.includes(t))score+=1;
    });
    if(norm(query)&&full.includes(norm(query)))score+=12;
    if(focus==='guides'&&item.type==='Guía clínica')score+=3;
    if(focus==='library'&&item.type==='Biblioteca virtual')score+=3;
    return {item,score};
  }).filter(x=>x.score>0);
  /* Live tiene su propia recuperación, así que el filtro de ámbito hay que
     aplicarlo también aquí — con la MISMA definición de p34, no con una copia:
     con dos criterios acabarían discrepando y Live serviría en una parada la
     ficha que la portada ya descarta. Sólo actúa en urgencia en curso. */
  try{
    const U=window.EnferixUrgencias;
    if(U&&U.enCurso&&U.esGestion&&U.enCurso(query)){
      scored=scored.filter(x=>!U.esGestion([x.item.title,x.item.meta].join(' ')));
    }
  }catch(e){}
  scored=scored.sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(8,Number(limit)||5)));
  const sources=scored.map(x=>({title:x.item.title,meta:x.item.meta,type:x.item.type,id:x.item.id}));
  sources.forEach(s=>{
    if(!sourceHistory.some(old=>old.id===s.id&&old.type===s.type))sourceHistory.push(s);
  });
  sourceHistory=sourceHistory.slice(-16);renderSources();
  return {
    query,
    notice:'Contenido interno documental. Las dosis, algoritmos y recomendaciones deben contrastarse con guías vigentes y protocolo institucional.',
    resultados:scored.map(x=>x.item.payload)
  };
}
/* Herramienta buscar_cercanos (decisión de Juanky, tras el revert): el modelo
   la LANZA cuando la conversación lo pide, igual que search_inurse — ninguna
   capa por turno, la fluidez no se toca. Usa el MISMO /api/nearby que el panel
   de Servicios cercanos, y la posición sale de EnferixNearby.getCoords, que
   NUNCA dispara el diálogo de permiso del navegador en mitad de una llamada de
   voz: si el permiso no está concedido de antes, la respuesta es decirlo, no
   interrumpir. Nunca se inventa un centro, una dirección ni una distancia. */
async function buscarCercanosLive(tipo){
  const t=(tipo==='hospital'||tipo==='aed')?tipo:'all';
  if(!window.EnferixNearby||!window.EnferixNearby.getCoords){
    return {error:'La función de ubicación de la aplicación no está disponible en esta pantalla.'};
  }
  let coords=null;
  try{coords=await window.EnferixNearby.getCoords({timeoutMs:8000});}catch(e){}
  if(!coords){
    return {error:'Sin ubicación: el usuario no ha concedido el permiso de ubicación a la aplicación (se activa desde Servicios cercanos). No des ningún centro, dirección ni distancia de memoria.'};
  }
  const ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
  const timer=ctrl?setTimeout(()=>ctrl.abort(),12000):null;
  try{
    const r=await fetch('/api/nearby?lat='+coords.lat+'&lon='+coords.lon+'&type='+t,ctrl?{signal:ctrl.signal}:{});
    const d=await r.json().catch(()=>({}));
    if(timer)clearTimeout(timer);
    if(!r.ok)return {error:'La búsqueda de centros falló: '+((d&&d.error)||('HTTP '+r.status))+'. Dilo tal cual; no inventes ningún centro.'};
    const items=(d.items||[]).slice(0,6).map(x=>({
      nombre:x.name,
      tipo:x.kind==='aed'?'desfibrilador (DEA)':'hospital / urgencias',
      distancia_km:x.distanceKm,
      direccion:x.address||'',
      telefono:x.phone||''
    }));
    if(!items.length)return {resultados:[],notice:'Sin hospitales ni DEA registrados en las fuentes consultadas en un radio de 5 km. Dilo tal cual.'};
    return {
      resultados:items,
      notice:'Datos reales de '+(d.source||'las fuentes de la aplicación')+', con la ubicación compartida por el propio usuario. Lee nombre y distancia; no añadas centros que no estén en la lista.'
    };
  }catch(e){
    if(timer)clearTimeout(timer);
    return {error:'La búsqueda de centros no respondió a tiempo. Dilo tal cual; no inventes ningún centro.'};
  }
}
/* Herramienta donde_estoy: misma familia y mismas garantías que
   buscar_cercanos — la posición sale de EnferixNearby.getCoords (jamás
   dispara el diálogo de permiso en mitad de una llamada de voz) y la
   dirección sale del endpoint /api/donde-estoy (Nominatim/OSM). La dirección
   es la del punto registrado más cercano: siempre se presenta como
   aproximada, y sin dato la respuesta es decirlo, nunca inventarlo. */
async function dondeEstoyLive(){
  if(!window.EnferixNearby||!window.EnferixNearby.getCoords){
    return {error:'La función de ubicación de la aplicación no está disponible en esta pantalla.'};
  }
  let coords=null;
  try{coords=await window.EnferixNearby.getCoords({timeoutMs:8000});}catch(e){}
  if(!coords){
    return {error:'Sin ubicación: el usuario no ha concedido el permiso de ubicación a la aplicación (se activa desde Servicios cercanos). No digas ninguna calle, barrio ni municipio de memoria.'};
  }
  const ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
  const timer=ctrl?setTimeout(()=>ctrl.abort(),12000):null;
  try{
    const r=await fetch('/api/donde-estoy?lat='+coords.lat+'&lon='+coords.lon,ctrl?{signal:ctrl.signal}:{});
    const d=await r.json().catch(()=>({}));
    if(timer)clearTimeout(timer);
    if(!r.ok)return {error:'La consulta de la dirección falló: '+((d&&d.error)||('HTTP '+r.status))+'. Dilo tal cual; no inventes ninguna dirección.'};
    return {
      direccion:d.direccion||'',
      via:d.via||'',
      barrio:d.barrio||'',
      municipio:d.municipio||'',
      provincia:d.provincia||'',
      notice:'Dirección APROXIMADA (punto más cercano registrado en '+(d.fuente||'OpenStreetMap')+', no la posición exacta). Dila siempre como aproximada; no añadas nada que no esté aquí.'
    };
  }catch(e){
    if(timer)clearTimeout(timer);
    return {error:'La consulta de la dirección no respondió a tiempo. Dilo tal cual; no inventes ninguna dirección.'};
  }
}
/* Herramienta temporizador: puente a los temporizadores LOCALES de la app
   (P43, window.EnferixTemporizadores). Aquí no se cuenta nada: el componente
   lleva la cuenta atrás y da el aviso (voz + pitidos + vibración) al
   cumplirse, también si la conversación de Live ya terminó. El modelo solo
   crea, cancela o consulta, y JAMÁS avisa por su cuenta. */
function temporizadorDesdeLive(args){
  try{
    if(!window.EnferixTemporizadores){
      return {error:'La herramienta de temporizadores no está disponible en esta pantalla.'};
    }
    var T=window.EnferixTemporizadores;
    var a=(args&&args.accion)||'';
    if(a==='iniciar'){
      var r=T.crear(Number(args.duracion_segundos),String(args.etiqueta||'').slice(0,80));
      if(r.error)return r;
      return {ok:true,estado:'Temporizador «'+(r.etiqueta||'sin etiqueta')+'» en marcha ('+r.segundos+' segundos). La aplicación avisará con voz y pitidos al cumplirse: no cuentes el tiempo ni avises tú.'};
    }
    if(a==='cancelar')return T.cancelar(args.etiqueta||'todos');
    if(a==='consultar')return {temporizadores:T.listar()};
    return {error:'Acción no reconocida (iniciar, cancelar o consultar)'};
  }catch(e){
    return {error:e.message||String(e)};
  }
}
function updateCaseFromTool(args){
  if(args.priority)caseData.priority=String(args.priority).slice(0,300);
  if(args.patient_summary)caseData.patientSummary=String(args.patient_summary).slice(0,900);
  if(Array.isArray(args.immediate_actions))caseData.immediateActions=args.immediate_actions.slice(0,6).map(String);
  if(Array.isArray(args.missing_data))caseData.missingData=args.missing_data.slice(0,8).map(String);
  if(Array.isArray(args.red_flags))caseData.redFlags=args.red_flags.slice(0,8).map(String);
  caseData.lastUpdate=new Date().toISOString();renderCase();
  return {ok:true,case:caseData};
}

/* ---------------- Audio capture ---------------- */
function floatTo16kPCM(input,sourceRate){
  if(!input||!input.length)return new Int16Array();
  const ratio=sourceRate/16000;
  const length=Math.max(1,Math.round(input.length/ratio));
  const out=new Int16Array(length);
  for(let i=0;i<length;i++){
    const start=Math.floor(i*ratio),end=Math.min(input.length,Math.floor((i+1)*ratio));
    let sum=0,count=0;
    for(let j=start;j<end;j++){sum+=input[j];count++}
    const sample=Math.max(-1,Math.min(1,count?sum/count:input[start]||0));
    out[i]=sample<0?sample*0x8000:sample*0x7fff;
  }
  return out;
}
function bytesToBase64(view){
  const bytes=new Uint8Array(view.buffer,view.byteOffset,view.byteLength);
  let binary='';const step=0x8000;
  for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step));
  return btoa(binary);
}
async function initOutput(){
  if(outputContext)return;
  outputContext=new (window.AudioContext||window.webkitAudioContext)();
  outputGain=outputContext.createGain();outputGain.gain.value=audioMuted?0:1;outputGain.connect(outputContext.destination);
  await outputContext.resume();
  nextPlayTime=outputContext.currentTime;
}
async function startMicrophone(){
  if(inputStream)return;
  inputStream=await navigator.mediaDevices.getUserMedia({
    audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}
  });
  inputContext=new (window.AudioContext||window.webkitAudioContext)();
  await inputContext.resume();
  inputSource=inputContext.createMediaStreamSource(inputStream);
  inputProcessor=inputContext.createScriptProcessor(4096,1,1);
  inputSilentGain=inputContext.createGain();inputSilentGain.gain.value=0;
  inputProcessor.onaudioprocess=e=>{
    if(!live||!ready||micPaused||!ws||ws.readyState!==WebSocket.OPEN)return;
    const pcm=floatTo16kPCM(e.inputBuffer.getChannelData(0),inputContext.sampleRate);
    if(!pcm.length)return;
    sendWS({realtimeInput:{audio:{data:bytesToBase64(pcm),mimeType:'audio/pcm;rate=16000'}}});
  };
  inputSource.connect(inputProcessor);inputProcessor.connect(inputSilentGain);inputSilentGain.connect(inputContext.destination);
  micBtn.classList.add('active');$('small',micBtn).textContent='Escuchando';
}
async function stopMicrophone(permanent=false){
  if(ws&&ready&&!permanent)sendWS({realtimeInput:{audioStreamEnd:true}});
  try{if(inputProcessor)inputProcessor.disconnect()}catch(e){}
  try{if(inputSource)inputSource.disconnect()}catch(e){}
  try{if(inputSilentGain)inputSilentGain.disconnect()}catch(e){}
  if(inputStream){inputStream.getTracks().forEach(t=>t.stop())}
  if(inputContext){try{await inputContext.close()}catch(e){}}
  inputContext=inputStream=inputSource=inputProcessor=inputSilentGain=null;
  micBtn.classList.remove('active');$('small',micBtn).textContent=permanent?'Finalizado':'Pausado';
}
function stopPlayback(){
  playingSources.forEach(s=>{try{s.stop()}catch(e){}});
  playingSources.clear();
  if(outputContext)nextPlayTime=outputContext.currentTime;
}
async function playPCM(base64){
  if(audioMuted)return;
  await initOutput();
  const bin=atob(base64),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const aligned=bytes.byteLength-(bytes.byteLength%2);
  const ints=new Int16Array(bytes.buffer,bytes.byteOffset,aligned/2);
  const float=new Float32Array(ints.length);
  for(let i=0;i<ints.length;i++)float[i]=ints[i]/32768;
  const buffer=outputContext.createBuffer(1,float.length,24000);
  buffer.copyToChannel(float,0);
  const source=outputContext.createBufferSource();source.buffer=buffer;source.connect(outputGain);
  const start=Math.max(outputContext.currentTime+.015,nextPlayTime);
  source.start(start);nextPlayTime=start+buffer.duration;playingSources.add(source);
  source.onended=()=>playingSources.delete(source);
}

/* ---------------- WebSocket and tools ---------------- */
function sendWS(message){
  if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(message));
}
const SYSTEM_INSTRUCTION=`Eres Javny Live, asistente de apoyo protocolizado en tiempo real para profesionales sanitarios.
Habla siempre en español de España, con tono calmado, claro y muy breve.
El usuario puede estar atendiendo una emergencia. No eres la responsable clínica, no sustituyes el juicio profesional, el equipo de emergencias ni los protocolos vigentes.
Al principio espera a que el usuario diga “Oye Javny”, “Javny” o formule una pregunta directa.
Durante un caso:
1. Confirma en una frase los datos críticos entendidos, especialmente cifras.
2. Da solo una a tres prioridades inmediatas por turno.
3. Pregunta por el siguiente dato crítico que falta.
4. Ante peligro vital, indica activar inmediatamente el circuito/equipo de emergencia local y seguir ABCDE y el protocolo institucional.
5. Antes de dar orientación basada en protocolos DEBES llamar a search_inurse. Conserva la procedencia entre Guías clínicas y Biblioteca virtual.
6. El contenido interno puede proceder de documentación antigua. No lo presentes como guía actual y señala que debe contrastarse.
7. No inventes dosis, concentraciones, energías, tiempos ni contraindicaciones. Solo menciona una dosis si aparece expresamente en la fuente devuelta, leyéndola despacio y diciendo que debe verificarse con la ficha técnica/protocolo vigente.
7b. Si preguntan por el hospital, las urgencias o el desfibrilador (DEA) más cercano, llama a buscar_cercanos y lee SOLO lo que devuelva: nombre y distancia, y la dirección si la piden. Si devuelve un error o no hay ubicación, dilo tal cual y sigue con el caso. Nunca digas un centro, una dirección ni una distancia que no vengan de la herramienta.
7c. Si el usuario pide iniciar la parada, el metrónomo o el ritmo de compresiones, llama a rcp_parada con accion "iniciar". Si durante una parada canta un evento (descarga, adrenalina, intubación…), llama a rcp_parada con accion "anotar" pasando el evento tal como lo dijo. Esa herramienta solo cronometra y registra en el dispositivo: la orientación clínica sigue saliendo de search_inurse y de estas reglas.
7d. Si el usuario pide el traspaso, el relevo o el SBAR, llama a traspaso_sbar rellenando los cuatro campos ÚNICAMENTE con lo dicho en la conversación, como la regla 9b: nada inferido, y lo no referido se deja vacío. Tras llamarla, di solo que el traspaso está en pantalla, sin repetirlo entero.
7e. Si preguntan dónde están o por su ubicación, llama a donde_estoy y lee la dirección que devuelva diciendo SIEMPRE que es aproximada. Si devuelve un error o no hay ubicación, dilo tal cual y sigue con el caso. Nunca digas una calle, un barrio ni un municipio que no vengan de la herramienta.
7f. Si el usuario pide un temporizador o que le avises dentro de un tiempo («avísame en tres minutos», «pon cinco minutos para la adrenalina»), llama a temporizador con accion "iniciar", la duración en segundos y una etiqueta corta con el motivo. Confirma solo que está puesto y sigue con el caso: el aviso al cumplirse lo da la APLICACIÓN con voz, pitidos y cuenta atrás en pantalla — tú no cuentes el tiempo ni des el aviso por tu cuenta. Si piden quitarlo, accion "cancelar" con la etiqueta (o "todos"); si preguntan cuánto queda, accion "consultar" y lee lo que devuelva.
8. Llama a update_case cuando cambie la prioridad, aparezca una señal de alarma, haya nuevas actuaciones o falten datos.
9. No repitas nombres, DNI, números de historia, teléfonos ni otros identificadores.
9b. En el panel del caso (update_case) recoge SÓLO lo que el usuario ha dicho, nunca lo inferido. Si dice "mi padre", el resumen es "padre del usuario", no "varón" ni una edad: el sexo y la edad no se han dicho. No completes sexo, edad, antecedentes ni diagnóstico a partir de suposiciones; deja el hueco o ponlo en datos pendientes. Lo que se muestra en pantalla se lee como dato del caso, y un dato inventado es peor que un hueco.
10. Permite interrupciones. Si te interrumpen, detén la explicación y atiende al nuevo dato.
Cuando el usuario diga “más breve”, responde en formato: AHORA / DESPUÉS / DIME.
Cuando diga “repite”, repite únicamente la última instrucción.
Cuando diga “cerrar caso”, confirma que el contexto temporal queda borrado.
No des diagnósticos definitivos; expresa hipótesis y nivel de incertidumbre.`;

const tools=[{
  functionDeclarations:[
    {
      name:'search_inurse',
      description:'Busca contenido clínico interno relevante en las Guías clínicas y en la Biblioteca virtual de Enferix. Debe usarse antes de dar orientación protocolizada.',
      parameters:{
        type:'OBJECT',
        properties:{
          query:{type:'STRING',description:'Consulta clínica concreta: síndrome, signo, algoritmo, fármaco o cuidados.'},
          focus:{type:'STRING',enum:['all','guides','library'],description:'Repositorio preferente.'},
          limit:{type:'INTEGER',description:'Número de resultados, entre 1 y 8.'}
        },
        required:['query']
      }
    },
    {
      name:'buscar_cercanos',
      description:'Hospitales, urgencias y desfibriladores (DEA) reales cerca del usuario, con nombre, distancia y dirección. Usa la ubicación que el usuario ya compartió con la aplicación; si no hay permiso, devuelve un error que hay que transmitir tal cual. Nunca inventes un centro ni una distancia.',
      parameters:{
        type:'OBJECT',
        properties:{
          tipo:{type:'STRING',enum:['hospital','aed','all'],description:'Qué buscar: hospitales, desfibriladores o ambos.'}
        }
      }
    },
    {
      name:'donde_estoy',
      description:'Dirección aproximada del usuario (calle, barrio, municipio) a partir de la ubicación que ya compartió con la aplicación, vía OpenStreetMap. Si no hay permiso devuelve un error que hay que transmitir tal cual. La dirección se presenta SIEMPRE como aproximada; nunca inventes una calle ni un municipio.',
      parameters:{
        type:'OBJECT',
        properties:{}
      }
    },
    {
      name:'temporizador',
      description:'Temporizadores locales de la aplicación, con cuenta atrás en pantalla y aviso de voz, pitidos y vibración al cumplirse. iniciar: crea uno con su duración en segundos y una etiqueta corta con el motivo. cancelar: anula por etiqueta (o todos). consultar: lista los que corren y cuánto les queda. Quien avisa al cumplirse es la APLICACIÓN: tú nunca cuentes el tiempo ni des el aviso por tu cuenta.',
      parameters:{
        type:'OBJECT',
        properties:{
          accion:{type:'STRING',enum:['iniciar','cancelar','consultar'],description:'iniciar: crear y arrancar. cancelar: anular. consultar: listar los que corren.'},
          duracion_segundos:{type:'NUMBER',description:'Solo con iniciar: duración en segundos (5 a 14400).'},
          etiqueta:{type:'STRING',description:'Motivo corto del aviso («adrenalina», «reevaluar ritmo»). Con cancelar: cuál anular, o «todos».'}
        },
        required:['accion']
      }
    },
    {
      name:'rcp_parada',
      description:'Controla la herramienta local de RCP de la aplicación: abre el panel e inicia a la vez el metrónomo de compresiones y el cronómetro de la parada, y apunta en el registro, con su hora exacta, los eventos que el usuario va cantando (descarga, adrenalina, intubación…). No calcula ni decide nada clínico: solo cronometra y registra en el dispositivo.',
      parameters:{
        type:'OBJECT',
        properties:{
          accion:{type:'STRING',enum:['iniciar','anotar'],description:'iniciar: abre el panel y arranca metrónomo, cronómetro y registro. anotar: apunta un evento con su hora (requiere una parada ya iniciada).'},
          evento:{type:'STRING',description:'Solo con accion=anotar: el evento tal como lo ha dicho el usuario, p. ej. "Descarga" o "Adrenalina administrada".'}
        },
        required:['accion']
      }
    },
    {
      name:'traspaso_sbar',
      description:'Muestra en pantalla el traspaso SBAR del caso para el equipo que llega, compuesto ÚNICAMENTE con lo dicho en la conversación (nada inferido; lo no referido se deja vacío). La pantalla permite leerlo, escucharlo, copiarlo y compartirlo, y adjunta sola el registro de la parada con sus horas si lo hay.',
      parameters:{
        type:'OBJECT',
        properties:{
          situacion:{type:'STRING',description:'S · Situación: qué pasa ahora y prioridad, con las palabras dichas.'},
          antecedentes:{type:'STRING',description:'B · Antecedentes referidos del paciente. Vacío si no se han dicho.'},
          evaluacion:{type:'STRING',description:'A · Evaluación: constantes y hallazgos DICHOS, y señales de alarma.'},
          recomendacion:{type:'STRING',description:'R · Recomendación: qué se pide al equipo que llega, según lo hablado.'}
        }
      }
    },
    {
      name:'update_case',
      description:'Actualiza el panel temporal del caso para mostrar prioridad, resumen, actuaciones inmediatas, datos pendientes y señales de alarma.',
      parameters:{
        type:'OBJECT',
        properties:{
          priority:{type:'STRING'},
          patient_summary:{type:'STRING'},
          immediate_actions:{type:'ARRAY',items:{type:'STRING'}},
          missing_data:{type:'ARRAY',items:{type:'STRING'}},
          red_flags:{type:'ARRAY',items:{type:'STRING'}}
        }
      }
    }
  ]
}];

/* Herramienta traspaso_sbar (decisión de Juanky): puente al visor LOCAL del
   traspaso (P41, window.EnferixSBAR). El modelo la llama solo cuando el
   usuario pide el relevo; aquí no se redacta nada, solo se pinta lo que el
   modelo compuso con lo dicho (regla 9b). */
function sbarDesdeLive(args){
  const sbar=window.EnferixSBAR;
  if(!sbar)return {error:'El visor del traspaso no está cargado en esta pantalla'};
  try{
    const a=args||{};
    sbar.mostrar({
      situacion:String(a.situacion||'').slice(0,600),
      antecedentes:String(a.antecedentes||'').slice(0,600),
      evaluacion:String(a.evaluacion||'').slice(0,600),
      recomendacion:String(a.recomendacion||'').slice(0,600)
    });
    return {ok:true,estado:'Traspaso SBAR mostrado en pantalla, con botones de escuchar, copiar y compartir.'};
  }catch(e){
    return {error:e.message||String(e)};
  }
}

/* Herramienta rcp_parada (decisión de Juanky): puente a la herramienta LOCAL
   de RCP (P40, window.EnferixRCP). El modelo la lanza si la conversación lo
   pide, igual que search_inurse — nada de esto toca el flujo de la charla.
   Solo cronometra y registra; la orientación clínica sigue siendo del guion
   y de search_inurse. Finalizar la parada se hace SIEMPRE desde el panel,
   con su confirmación en pantalla, nunca por voz. */
function rcpDesdeLive(args){
  const rcp=window.EnferixRCP;
  if(!rcp)return {error:'La herramienta de RCP no está cargada en esta pantalla'};
  const accion=String((args&&args.accion)||'').toLowerCase();
  try{
    if(accion==='iniciar'){
      if(rcp.activa&&rcp.activa())return {ok:true,estado:'Ya hay una parada en marcha: metrónomo y registro siguen corriendo.'};
      rcp.iniciarParada();
      return {ok:true,estado:'Parada iniciada: metrónomo de compresiones, cronómetro y registro en marcha. Los avisos de cada 2 minutos los da la propia herramienta.'};
    }
    if(accion==='anotar'){
      if(!(rcp.activa&&rcp.activa()))return {error:'No hay ninguna parada iniciada: hay que iniciar la parada primero'};
      const ev=String((args&&args.evento)||'').trim().slice(0,120);
      if(!ev)return {error:'Falta el evento a anotar'};
      rcp.anotar(ev);
      return {ok:true,estado:'Anotado con su hora: '+ev};
    }
    return {error:'Acción no reconocida (iniciar o anotar)'};
  }catch(e){
    return {error:e.message||String(e)};
  }
}

async function executeToolCall(toolCall){
  const responses=[];
  for(const fc of (toolCall.functionCalls||[])){
    const args=fc.args||fc.arguments||{};
    let result;
    try{
      if(fc.name==='search_inurse'){
        result=searchINurse(args.query||'',args.focus||'all',args.limit||5);
      }else if(fc.name==='buscar_cercanos'){
        result=await buscarCercanosLive(args.tipo||'all');
      }else if(fc.name==='donde_estoy'){
        result=await dondeEstoyLive();
      }else if(fc.name==='temporizador'){
        result=temporizadorDesdeLive(args);
      }else if(fc.name==='rcp_parada'){
        result=rcpDesdeLive(args);
      }else if(fc.name==='traspaso_sbar'){
        result=sbarDesdeLive(args);
      }else if(fc.name==='update_case'){
        result=updateCaseFromTool(args);
      }else{
        result={error:'Herramienta no disponible'};
      }
    }catch(e){
      result={error:e.message||String(e)};
    }
    responses.push({id:fc.id,name:fc.name,response:{result}});
  }
  if(responses.length)sendWS({toolResponse:{functionResponses:responses}});
}
function commitUserSoon(){
  clearTimeout(userCommitTimer);
  userCommitTimer=setTimeout(()=>{
    const clean=sanitizeTranscript(currentUserText);
    if(clean){
      finalizeTemporary('user',clean);
      handleVoiceCommand(clean);
    }
    currentUserText='';
  },550);
}
function handleServerContent(sc){
  if(sc.interrupted){
    stopPlayback();currentModelText='';setStage('listening','Te escucho','Has interrumpido a Javny. Continúa con el nuevo dato.');
  }
  if(sc.inputTranscription?.text){
    const part=sc.inputTranscription.text;
    currentUserText=(currentUserText+' '+part).replace(/\s+/g,' ').trim();
    addLine('user',sanitizeTranscript(currentUserText),true);
    setStage('listening','Te escucho','Sigue hablando; Javny detectará automáticamente cuándo terminas.');
    commitUserSoon();
  }
  if(sc.outputTranscription?.text){
    currentModelText=(currentModelText+' '+sc.outputTranscription.text).replace(/\s+/g,' ').trim();
    addLine('model',currentModelText,true);
    setStage('speaking','Javny está respondiendo','Puedes interrumpirla hablando en cualquier momento.');
  }
  if(sc.modelTurn?.parts){
    sc.modelTurn.parts.forEach(part=>{
      const inline=part.inlineData;
      if(inline?.data&&(inline.mimeType||'').startsWith('audio/'))playPCM(inline.data).catch(console.error);
    });
  }
  if(sc.generationComplete)setStage('speaking','Javny está terminando','Escucha la indicación y aporta el siguiente dato.');
  if(sc.turnComplete){
    if(currentModelText)finalizeTemporary('model',currentModelText);
    currentModelText='';
    setStage('listening','Te escucho','Continúa con la evolución del mismo caso.');
  }
}
async function handleMessage(event){
  let text=event.data;
  if(text instanceof Blob)text=await text.text();
  let msg;try{msg=JSON.parse(text)}catch(e){return}
  if(msg.setupComplete){
    ready=true;setStatus('Conectada','on');setStage('listening','Te escucho','Empieza diciendo «Oye Javny» y describe la situación.');
    await startMicrophone();startTimer();return;
  }
  if(msg.serverContent)handleServerContent(msg.serverContent);
  if(msg.toolCall)await executeToolCall(msg.toolCall);
  if(msg.toolCallCancellation){}
  if(msg.goAway){
    addLine('model','El servidor va a cerrar la conexión. Finaliza la sesión y abre una nueva.');
    setStatus('Conexión próxima a finalizar','warn');
  }
  if(msg.sessionResumptionUpdate?.newHandle)reconnectHandle=msg.sessionResumptionUpdate.newHandle;
}
async function requestToken(){
  const base=backendBase();
  const res=await fetch(base+'/api/live/token',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||('No se pudo crear el token ('+res.status+')'));
  if(!data.token)throw new Error('El backend no devolvió un token Live.');
  return data;
}
async function startLive(){
  if(OPENED_AS_FILE){
    showFileModeWarning();
    const result=await checkLocalBackend();
    if(result.ok){
      location.href='http://localhost:8787';
    }else{
      addLine('model','El backend todavía no está iniciado. Descomprime el paquete del backend y ejecuta 2_INICIAR_JAVNY_LIVE.command.');
    }
    return;
  }
  if(live)return;
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador no permite acceder al micrófono.');
  live=true;showLive();startBtn.classList.add('connecting');startBtn.textContent='Conectando…';
  setStatus('Solicitando permiso','warn');setStage('thinking','Preparando Javny Live','Autoriza el micrófono cuando Safari lo solicite.');
  try{
    await initOutput();
    // Request microphone during the original user action before opening the WebSocket.
    inputStream=await navigator.mediaDevices.getUserMedia({
      audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}
    });
    const tokenData=await requestToken();
    const model=tokenData.model||LIVE_MODEL_DEFAULT;
    const url='wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token='+encodeURIComponent(tokenData.token);
    ws=new WebSocket(url);
    ws.onopen=()=>{
      setStatus('Configurando sesión','warn');
      const setup={
        model:'models/'+model,
        generationConfig:{
          responseModalities:['AUDIO'],
          temperature:0.12,
          maxOutputTokens:1400,
          speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Kore'}}}
        },
        systemInstruction:{parts:[{text:SYSTEM_INSTRUCTION}]},
        tools,
        realtimeInputConfig:{
          automaticActivityDetection:{
            disabled:false,
            startOfSpeechSensitivity:'START_SENSITIVITY_LOW',
            endOfSpeechSensitivity:'END_SENSITIVITY_LOW',
            prefixPaddingMs:80,
            silenceDurationMs:700
          },
          activityHandling:'START_OF_ACTIVITY_INTERRUPTS',
          turnCoverage:'TURN_INCLUDES_ONLY_ACTIVITY'
        },
        inputAudioTranscription:{},
        outputAudioTranscription:{},
        sessionResumption:reconnectHandle?{handle:reconnectHandle}:{}
      };
      sendWS({setup});
    };
    ws.onmessage=handleMessage;
    ws.onerror=()=>{setStatus('Error de conexión','error');setStage('error','No se ha podido conectar','Comprueba el backend, la clave y la conexión a internet.')};
    ws.onclose=event=>{
      const wasLive=live;ready=false;ws=null;
      if(wasLive){
        setStatus('Desconectada','error');setStage('error','La sesión se ha desconectado',event.reason||'Finaliza y vuelve a iniciar una sesión.');
        stopMicrophone(true);enableControls(false);
      }
    };
    // Reuse the already granted stream in startMicrophone.
    const granted=inputStream;inputStream=null;
    inputStream=granted;
    // Build processing graph here because startMicrophone exits if a stream already exists.
    inputContext=new (window.AudioContext||window.webkitAudioContext)();
    await inputContext.resume();
    inputSource=inputContext.createMediaStreamSource(inputStream);
    inputProcessor=inputContext.createScriptProcessor(4096,1,1);
    inputSilentGain=inputContext.createGain();inputSilentGain.gain.value=0;
    inputProcessor.onaudioprocess=e=>{
      if(!live||!ready||micPaused||!ws||ws.readyState!==WebSocket.OPEN)return;
      const pcm=floatTo16kPCM(e.inputBuffer.getChannelData(0),inputContext.sampleRate);
      if(pcm.length)sendWS({realtimeInput:{audio:{data:bytesToBase64(pcm),mimeType:'audio/pcm;rate=16000'}}});
    };
    inputSource.connect(inputProcessor);inputProcessor.connect(inputSilentGain);inputSilentGain.connect(inputContext.destination);
    startBtn.style.display='none';enableControls(true);
    micBtn.classList.add('active');$('small',micBtn).textContent='Escuchando';
  }catch(e){
    console.error(e);live=false;ready=false;startBtn.classList.remove('connecting');startBtn.textContent='Volver a intentar';
    setStatus('No conectada','error');setStage('error','No he podido iniciar Javny Live',e.message||String(e));
    await stopMicrophone(true);stopPlayback();
  }
}
async function stopLive(reason='Sesión finalizada'){
  if(!live&& !ws)return;
  live=false;ready=false;clearTimeout(userCommitTimer);
  try{if(ws&&ws.readyState===WebSocket.OPEN)sendWS({realtimeInput:{audioStreamEnd:true}})}catch(e){}
  try{if(ws)ws.close(1000,'Sesión finalizada por el usuario')}catch(e){}
  ws=null;await stopMicrophone(true);stopPlayback();resetTimer();enableControls(false);
  setStatus('Desconectada','');setStage('idle',reason,'Pulsa “Iniciar sesión clínica” para comenzar una nueva conversación.');
  startBtn.style.display='inline-block';startBtn.classList.remove('connecting');startBtn.textContent='Iniciar nueva sesión';
  audioMuted=false;micPaused=false;audioBtn.classList.remove('active');$('span',audioBtn).textContent='🔊';$('small',audioBtn).textContent='Activado';
}
async function toggleMic(){
  if(!live)return;
  micPaused=!micPaused;
  if(micPaused){
    sendWS({realtimeInput:{audioStreamEnd:true}});
    micBtn.classList.remove('active');$('span',micBtn).textContent='🔇';$('small',micBtn).textContent='Pausado';
  }else{
    $('span',micBtn).textContent='🎙️';micBtn.classList.add('active');$('small',micBtn).textContent='Escuchando';
  }
}
function toggleAudio(){
  audioMuted=!audioMuted;
  if(outputGain)outputGain.gain.value=audioMuted?0:1;
  audioBtn.classList.toggle('active',audioMuted);
  $('span',audioBtn).textContent=audioMuted?'🔇':'🔊';
  $('small',audioBtn).textContent=audioMuted?'Silenciado':'Activado';
  if(audioMuted)stopPlayback();
}

/* ---------------- Events ---------------- */
['#v26LiveHeaderBtn','#v26LiveChatBtn'].forEach(sel=>{
  const b=$(sel);if(b)b.addEventListener('click',()=>{showLive();if(!live)startBtn.focus()});
});
mini.addEventListener('click',showLive);
$('#v26LiveMinimize').addEventListener('click',minimizeLive);
$('#v26LiveClose').addEventListener('click',()=>live?minimizeLive():overlay.classList.remove('on'));
startBtn.addEventListener('click',startLive);
const openLocalhostBtn=$('#v261OpenLocalhost');
const checkBackendBtn=$('#v261CheckBackend');
if(openLocalhostBtn)openLocalhostBtn.addEventListener('click',async()=>{
  const result=await checkLocalBackend();
  if(result.ok)location.href='http://localhost:8787';
  else addLine('model','No encuentro el backend en localhost:8787. Ejecuta 2_INICIAR_JAVNY_LIVE.command y vuelve a pulsar.');
});
if(checkBackendBtn)checkBackendBtn.addEventListener('click',async()=>{
  checkBackendBtn.disabled=true;checkBackendBtn.textContent='Comprobando…';
  const result=await checkLocalBackend();
  if(result.ok){
    checkBackendBtn.textContent='✅ Backend disponible';
    setTimeout(()=>{location.href='http://localhost:8787'},500);
  }else{
    checkBackendBtn.textContent='❌ Backend no iniciado';
    setTimeout(()=>{checkBackendBtn.disabled=false;checkBackendBtn.textContent='Comprobar backend'},2200);
  }
});
micBtn.addEventListener('click',toggleMic);
audioBtn.addEventListener('click',toggleAudio);
closeCaseBtn.addEventListener('click',()=>resetCase(false));
endBtn.addEventListener('click',()=>stopLive('Sesión finalizada'));
window.addEventListener('beforeunload',()=>{try{if(ws)ws.close()}catch(e){}});

prepareKnowledge();
renderCase();renderSources();
if(OPENED_AS_FILE)showFileModeWarning();
})();
