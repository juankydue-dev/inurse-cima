
(function(){
 var LOGO='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lgHJ" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/><stop offset=".55" stop-color="#d946a0"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(#lgHJ)"/><g fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 26 V46 a20 20 0 0 0 40 0 V26"/><path d="M50 66 V74 a12 12 0 0 0 12 12"/></g><circle cx="30" cy="24" r="4.6" fill="#fff"/><circle cx="70" cy="24" r="4.6" fill="#fff"/><circle cx="62" cy="86" r="9.5" fill="#fff"/><circle cx="62" cy="86" r="4.6" fill="#7b46c9"/></svg>';
 var MODEL='gemini-3.5-flash';
 var KEYK='guiaHJ23_apikey', CHATK='guiaHJ23_chat', VOICEK='guiaHJ23_autovoice', OPENK='guiaHJ23_home_v3';
 var BACKENDK='inurse_v20_backend_url', CASEK='inurse_v20_case_memory', VERIFYK='inurse_v22_double_verify', HANDSFREEK='inurse_v23_handsfree', WAKEK='inurse_v23_wakeword';
 var q=function(s){return document.querySelector(s)};
 function lget(k,d){try{var v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}}
 function lset(k,v){try{localStorage.setItem(k,v)}catch(e){}}
 function jget(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
 function jset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
 var messages=jget(CHATK,[]);
 var attachment=null;
 var autoVoice=lget(VOICEK,'0')==='1';
 var verifyEnabled=lget(VERIFYK,'1')==='1';
 var handsFree=lget(HANDSFREEK,'1')==='1';
 var requireWake=lget(WAKEK,'0')==='1';
 var mediaType='auto',voiceSession=false,voiceBusy=false,voiceFinal='',voiceRestartTimer=null;
 var caseMemory=[];
 try{caseMemory=JSON.parse(sessionStorage.getItem(CASEK)||'[]')||[]}catch(e){caseMemory=[]}
 function saveCase(){try{sessionStorage.setItem(CASEK,JSON.stringify(caseMemory.slice(-8)))}catch(e){}}
 function backendUrl(){
  var saved=(lget(BACKENDK,'')||'').trim().replace(/\/$/,'');
  if(saved)return saved;
  /* Sin backend propio ni clave de Gemini configurados por el usuario: usar el
     servidor de Enferix (mismo origen), que ya integra Gemini + PubMed, Crossref,
     NICE, OpenFDA, ClinicalTrials, Semantic Scholar y WHO con citas verificables. */
  if(!lget(KEYK,'')&&typeof window!=='undefined'&&window.location&&/^https?:$/.test(window.location.protocol)){
   return window.location.origin;
  }
  return '';
 }
 function connectionMode(){return backendUrl()?'backend':(lget(KEYK,'')?'direct':'local')}
 function updateConn(mode){
  var el=q('#v20Conn');if(!el)return;mode=mode||connectionMode();
  el.className='v20-conn '+mode;
  el.textContent=mode==='backend'?'Backend seguro':mode==='direct'?'Gemini directo':mode==='error'?'Error':'Modo local';
 }

 /* ---- texto ---- */
 function esc(s){return (s||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
 function stripH(h){return (h||'').replace(/<[^>]+>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
 function md(t){var h=esc(t);
  h=h.replace(/```([\s\S]*?)```/g,function(m,c){return '<pre style="white-space:pre-wrap">'+c+'</pre>'});
  h=h.replace(/`([^`]+)`/g,'<code>$1</code>');
  h=h.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
  h=h.replace(/(^|\n)#{1,3}\s*(.+)/g,'$1<h3>$2</h3>');
  h=h.replace(/(?:^|\n)(?:[-•*]\s.+(?:\n|$))+/g,function(b){var it=b.trim().split(/\n/).map(function(l){return l.replace(/^[-•*]\s*/,'').trim()}).filter(Boolean);return '<ul>'+it.map(function(i){return '<li>'+i+'</li>'}).join('')+'</ul>'});
  h=h.replace(/\n{2,}/g,'<br><br>').replace(/\n/g,'<br>');return h}

 /* ---- recuperación sobre la base de la guía (DOCS/VADEM globales) ---- */
 function nrm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
 var STOP={de:1,la:1,el:1,en:1,y:1,a:1,los:1,las:1,un:1,una:1,que:1,se:1,con:1,por:1,para:1,del:1,al:1,es:1,su:1,sus:1,mas:1,'más':1,o:1,como:1,cual:1};
 var DIDX=[],VIDX=[];
 try{ DIDX=DOCS.map(function(d){return {d:d,t:nrm(d.title+' '+d.tags+' '+d.summary+' '+d.sec.map(function(s){return s.h+' '+stripH(s.b)}).join(' '))}}); }catch(e){}
 try{ VIDX=VADEM.map(function(v){return {v:v,t:nrm(v.n+' '+v.a+' '+v.i+' '+v.cat)}}); }catch(e){}
 function retrieveDetailed(qy){
  /* Una urgencia contada en lenguaje natural ("no responde y no respira") no
     comparte palabras con los títulos de las fichas de soporte vital, así que
     la búsqueda por solapamiento devolvía fichas ajenas. P3.4 traduce esas
     frases a los términos con los que están escritas las fichas antes de
     buscar; no cambia el contenido, sólo con qué palabras se busca. */
  var _emergencia=false;
  try{
    if(window.EnferixUrgencias){
      /* enCurso se evalúa sobre la pregunta ORIGINAL: la expansión de abajo le
         añade términos de urgencia y daría emergencia siempre. */
      _emergencia=!!window.EnferixUrgencias.enCurso(qy);
      if(window.EnferixUrgencias.expandir) qy=window.EnferixUrgencias.expandir(qy);
    }
  }catch(e){}
  var toks=nrm(qy).split(/[^a-z0-9]+/).filter(function(w){return w.length>2&&!STOP[w]});
  var seen={},tk=[];toks.forEach(function(w){if(!seen[w]){seen[w]=1;tk.push(w)}});
  if(!tk.length)return {context:'',sources:[]};
  function score(t,title){
   var s=0,nt=nrm(title||'');
   for(var i=0;i<tk.length;i++){
    if(nt.indexOf(tk[i])>=0)s+=7;
    if(t.indexOf(tk[i])>=0)s+=1;
   }
   return s;
  }
  var dd=DIDX.map(function(o){return {o:o,s:score(o.t,o.d.title)}})
   .filter(function(x){return x.s>0});
  /* Durante una urgencia en curso, las fichas de ámbito organizativo (donación
     y trasplantes, coordinación, trámites…) no compiten: comparten vocabulario
     con la parada pero no se aplican durante una reanimación. Fuera de la
     emergencia siguen compitiendo con normalidad. */
  if(_emergencia&&window.EnferixUrgencias&&window.EnferixUrgencias.esGestion){
   dd=dd.filter(function(x){
    try{ return !window.EnferixUrgencias.esGestion([x.o.d.title,x.o.d.tags,x.o.d.source].join(' ')); }catch(e){ return true; }
   });
  }
  dd=dd.sort(function(a,b){return b.s-a.s}).slice(0,8);
  var vv=VIDX.map(function(o){return {o:o,s:score(o.t,o.v.n)}})
   .filter(function(x){return x.s>0}).sort(function(a,b){return b.s-a.s}).slice(0,5);
  var ctx='',sources=[];
  dd.forEach(function(x){
   var d=x.o.d,body=d.sec.map(function(s){return (s.h?s.h+': ':'')+stripH(s.b)}).join(' ');
   var cleanSource=(d.source||'').replace(/Hospital\s+(Universitari\s+)?(Joan|Juan)\s+XXIII|HJ23/gi,'Fuente integrada de Enferix');
   ctx+='### [GUÍA CLÍNICA] '+d.title+'\nID: '+d.id+' · Fuente: '+cleanSource+'\n'+d.summary+'\n'+body.slice(0,1850)+'\n\n';
   sources.push({type:'guide',id:d.id,title:d.title,meta:cleanSource,score:x.s});
  });
  vv.forEach(function(x){
   var v=x.o.v,id=v.id||('farmaco-'+nrm(v.n).replace(/[^a-z0-9]+/g,'-'));
   ctx+='### [VADEMÉCUM] '+v.n+'\nID: '+id+' · Categoría: '+(v.cat||'Farmacología')+'\nIndicación: '+(v.i||'').slice(0,320)+'\nPosología documental: '+(v.p||'').slice(0,380)+'\nPrecauciones: '+(v.r||v.c||'').slice(0,280)+'\n\n';
   sources.push({type:'drug',id:id,title:v.n,meta:v.cat||'Vademécum',score:x.s});
  });
  return {context:ctx.trim(),sources:sources};
 }
 function retrieve(qy){return retrieveDetailed(qy).context}
 /* La consulta de portada (p33) necesita EXACTAMENTE esta recuperación, no una
    copia suya: las fichas validadas son la fuente prioritaria y las dos vías de
    consulta deben ver lo mismo. Se publica igual que window.EnferixLibraryRetrieve
    hace con la biblioteca. No cambia nada del chat: solo da nombre a lo que ya había. */
 window.EnferixGuideRetrieve=retrieveDetailed;
 function parseLibrarySources(context){
  var out=[],re=/### \[BIBLIOTECA VIRTUAL\] ([^\n]+)\nID: ([^ ·\n]+) · Bloque ([^ ·\n]+) · ([^\n]+)/g,m;
  while((m=re.exec(context||''))&&out.length<8)out.push({type:'library',title:m[1],id:m[2],meta:'Bloque '+m[3]+' · '+m[4]});
  return out;
 }
 function buildLocalAnswer(question,guideSources,librarySources,route){
  var lines=['## Síntesis local de Javny','He localizado contenido relacionado dentro de Enferix, pero no hay una conexión activa con Gemini o con el backend seguro.',''];if(route)lines.push('**Intención detectada:** '+route.label,'');
  if(guideSources.length){
   lines.push('## Guías clínicas relacionadas');
   guideSources.slice(0,5).forEach(function(s){lines.push('- **'+s.title+'** — '+s.meta)});
  }
  if(librarySources.length){
   lines.push('','## Biblioteca virtual relacionada');
   librarySources.slice(0,5).forEach(function(s){lines.push('- **'+s.title+'** — '+s.meta)});
  }
  lines.push('','## Cómo continuar','Abre las fuentes mostradas debajo para revisar el contenido. Activa Gemini o el backend seguro para obtener una síntesis clínica razonada y estructurada.');
  lines.push('','> Modo local educativo: no genera recomendaciones clínicas nuevas ni valida dosis.');
  return lines.join('\n');
 }
 /* ===== Estilo OpenEvidence: referencias numeradas + citas [n] clicables ===== */
 var REF_STOP={de:1,la:1,el:1,los:1,las:1,un:1,una:1,en:1,con:1,para:1,del:1,al:1,que:1,cual:1,cuales:1,sobre:1,como:1,actual:1,actuales:1,manejo:1,tratamiento:1,paciente:1,pacientes:1,cuidados:1,segun:1,mediante:1,puede:1,pueden:1};
 function refRelevanceTokens(q){
  var n=String(q||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,' ');
  var toks=n.split(/\s+/).filter(function(t){return t.length>=5 && !REF_STOP[t];});
  var out=[];
  toks.forEach(function(t){ out.push(t); if(t.length>=7) out.push(t.slice(0,6)); });
  return out.filter(function(t,i,a){return t&&a.indexOf(t)===i;});
 }
 function buildNumberedRefs(query){
  var refs=[]; var seen={};
  var qtok=refRelevanceTokens(query);
  function relevant(title){
   if(!qtok.length) return true; // sin términos útiles → no filtrar
   var t=String(title||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
   return qtok.some(function(tok){ return t.indexOf(tok)!==-1; });
  }
  function add(arr){ (arr||[]).forEach(function(s){ if(!s) return; var url=s.id||''; var keyk=(url||s.title||'').toLowerCase(); if(!keyk||seen[keyk]) return; if(!relevant(s.title)) return; seen[keyk]=1; refs.push({ n:refs.length+1, title:s.title||'(sin título)', url:url, meta:s.meta||'', type:s.type||'', journal:s.journal||'', year:s.year||'' }); }); }
  // Prioridad: literatura y guías con enlace (evidencia externa citable), filtradas por relevancia al tema
  add(window.__v20LiteratureSources);
  add(window.__v20PmcSources);
  add(window.__v20GuidelineSources);
  add(window.__v20NiceSources);
  return refs.slice(0,12);
 }
 function refsContextBlock(refs){
  if(!refs||!refs.length) return '';
  var s='## REFERENCIAS DISPONIBLES (usa EXACTAMENTE estos números al citar [n])\n';
  refs.forEach(function(r){ s+='['+r.n+'] '+r.title+(r.meta?' — '+r.meta:'')+(r.url?' — '+r.url:'')+'\n'; });
  return s;
 }
 function linkifyCitations(html, refs){
  if(!html||!refs||!refs.length) return html;
  // Reemplaza [n], [n, m], [n-m] por superíndices clicables enlazados a la referencia
  return html.replace(/\[(\d+(?:\s*[-,]\s*\d+)*)\]/g, function(m, inner){
   var parts=inner.split(/\s*,\s*/).reduce(function(acc,tok){
    var range=tok.match(/^(\d+)\s*-\s*(\d+)$/);
    if(range){ for(var i=+range[1];i<=+range[2];i++) acc.push(i); } else { acc.push(+tok); }
    return acc;
   },[]);
   var out=parts.map(function(num){
    var r=refs[num-1];
    if(!r) return '['+num+']';
    if(r.url) return '<a class="cc-cite" href="'+esc(r.url)+'" target="_blank" rel="noopener" title="'+esc(r.title)+'">'+num+'</a>';
    return '<span class="cc-cite cc-cite-nolink" title="'+esc(r.title)+'">'+num+'</span>';
   }).join('');
   return '<sup class="cc-cite-wrap">'+out+'</sup>';
  });
 }
 var TOP_JOURNALS=/(new england journal|n engl j med|nejm|lancet|\bjama\b|\bbmj\b|british medical journal|nature|circulation|european heart journal|annals of internal medicine|intensive care medicine|critical care|\bchest\b|diabetes care|american journal of respiratory|blood\b|journal of clinical oncology|cochrane|american heart association|american college|european society)/i;
 function refBadges(r){
  var out=[];
  var ym=String(r.year||'').match(/(20\d{2})/); var y=ym?parseInt(ym[1],10):0;
  var cy=new Date().getFullYear();
  if(y && y>=cy-2) out.push('<span class="cc-ref-badge recent">🟢 Reciente</span>');
  if(r.journal && TOP_JOURNALS.test(r.journal)) out.push('<span class="cc-ref-badge lead">⭐ Revista líder</span>');
  if(r.type==='nice'||r.type==='guideline') out.push('<span class="cc-ref-badge guide">📋 Guía oficial</span>');
  return out.length?'<span class="cc-ref-badges">'+out.join('')+'</span>':'';
 }
 function renderRefsPanel(refs){
  if(!refs||!refs.length) return '';
  var items=refs.map(function(r){
   var head='<span class="cc-ref-n">'+r.n+'</span>';
   var body='<span class="cc-ref-body"><b>'+esc(r.title)+'</b>'+(r.meta?'<small>'+esc(r.meta)+'</small>':'')+refBadges(r)+'</span>';
   if(r.url) return '<a class="cc-ref-item" href="'+esc(r.url)+'" target="_blank" rel="noopener" id="ccref-'+r.n+'">'+head+body+'<span class="cc-ref-go">↗</span></a>';
   return '<div class="cc-ref-item" id="ccref-'+r.n+'">'+head+body+'</div>';
  }).join('');
  return '<div class="cc-refs"><div class="cc-refs-title">🔬 Referencias basadas en evidencia</div>'+items+'</div>';
 }

 function sourcePanel(sources){
  var guides=sources.filter(function(s){return s.type==='guide'||s.type==='drug'}).slice(0,6);
  var library=sources.filter(function(s){return s.type==='library'}).slice(0,6);
  var literature=sources.filter(function(s){return s.type==='literature'}).slice(0,6);
  var guidelines=sources.filter(function(s){return s.type==='guideline'}).slice(0,6);
  function chips(arr){
   if(!arr.length)return '<div class="v20-source-empty">Sin coincidencias relevantes.</div>';
   return arr.map(function(s){
    return '<button class="v20-source-chip" data-v20-source="'+esc(s.type)+'" data-v20-id="'+esc(s.id)+'">'+esc(s.title)+'<small>'+esc(s.meta||'')+'</small></button>';
   }).join('');
  }
  return '<div class="v20-source-panel"><div class="v20-source-title">📎 Fuentes recuperadas por Javny</div><div class="v20-source-groups">'+
   '<section class="v20-source-group"><h4>🩺 Guías clínicas / Vademécum</h4>'+chips(guides)+'</section>'+
   '<section class="v20-source-group"><h4>📚 Biblioteca virtual</h4>'+chips(library)+'</section>'+
   '<section class="v20-source-group"><h4>🔬 PubMed / Crossref</h4>'+chips(literature)+'</section>'+
   '<section class="v20-source-group"><h4>🌍 Guías internacionales (NICE·ESC·ERC·JBI)</h4>'+chips(guidelines)+'</section></div></div>';
 }
 function attachSourceEvents(host){
  if(!host)return;
  host.querySelectorAll('[data-v20-source]').forEach(function(btn){
   btn.onclick=function(){
    var type=btn.dataset.v20Source,id=btn.dataset.v20Id;
    if(type==='literature'||type==='guideline'){
     if(id)window.open(id,'_blank','noopener');else toastc('Sin enlace disponible para esta fuente.');
     return;
    }
    hideChat();
    if(type==='library'&&window.Enferix21&&window.Enferix21.openItem){window.Enferix21.openItem(id);return}
    if(type==='guide'&&typeof window.openDoc==='function'){window.openDoc(id);return}
    if(type==='guide'&&typeof openDoc==='function'){openDoc(id);return}
    if(type==='drug'&&typeof window.openVade==='function'){window.openVade();return}
    toastc('Fuente localizada: '+btn.textContent.trim());
   };
  });
 }

 function detectCalc(t){
  if(/\b(glasgow|gcs)\b/.test(t))return {id:'gcs',label:'Glasgow'};
  if(/\bnihss\b/.test(t))return {id:'nihss',label:'NIHSS'};
  if(/wells.*(tep|embolia)|\btep\b/.test(t))return {id:'wellsTep',label:'Wells TEP'};
  if(/wells.*(tvp|trombosis)|\btvp\b/.test(t))return {id:'wellsTvp',label:'Wells TVP'};
  if(/parkland|quemadur/.test(t))return {id:'parkland',label:'Parkland'};
  if(/pafi|pa\/?fi|pao2.*fio2/.test(t))return {id:'pafi',label:'PaFi'};
  if(/pediatr|dosis.*niñ|dosis.*nino/.test(t))return {id:'dosisPed',label:'Dosis pediátricas'};
  if(/perfusi|bomba|ml\/h|mcg\/kg|minuto.*kg|diluci/.test(t))return {id:'perf',label:'Perfusiones'};
  return null;
 }
 function routeQuestion(text,att){
  var t=nrm(text||''),calc=detectCalc(t),actions=[],intent='knowledge',label='Consulta clínica',icon='🧠',confidence=58,reason='Consulta general con recuperación de Guías y Biblioteca.';
  var hasCase=/\b(paciente|caso|presenta|ingresa|constantes|tension|frecuencia cardiaca|saturacion|lactato|fiebre|oliguria|disnea|dolor toracico|confusion)\b/.test(t);
  var isDrug=/\b(farmaco|medicamento|dosis|posologia|administrar|administracion|noradrenalina|adrenalina|dopamina|dobutamina|antibiotico|sedacion|antidoto)\b/.test(t);
  var isEcg=/\b(ecg|electrocardiograma|electro|ritmo|arritmia|qrs|segmento st|intervalo qt|fibrilacion|taquicardia|bradicardia)\b/.test(t);
  var isRx=/\b(radiografia|rayos x|rx de torax|rx torax|neumotorax|infiltrado|derrame pleural)\b/.test(t);
  var isPath=/\b(patologia|enfermedad|sepsis|shock|ictus|infarto|asma|epoc|sdra|pancreatitis|meningitis|anafilaxia|cetoacidosis)\b/.test(t);
  var isNav=/\b(abre|abrir|llevame|muéstrame|muestrame|ir a|busca en)\b/.test(t);

  if(att&&att.kind==='image'&&(isEcg||/trazado/.test(t))){
   intent='ecg_image';label='Análisis de ECG';icon='📟';confidence=96;reason='Se ha adjuntado una imagen y la consulta menciona un ECG.';
   actions.push({id:'ecg',label:'Abrir análisis ECG',icon:'📟',kind:'image',primary:true});
   actions.push({id:'atlas',label:'Comparar con Atlas',icon:'🫀',kind:'image'});
  }else if(att&&att.kind==='image'&&(isRx||/torax|pulmon/.test(t))){
   intent='rx_image';label='Análisis de imagen';icon='🩻';confidence=94;reason='Se ha adjuntado una imagen compatible con una consulta radiológica.';
   actions.push({id:'rx',label:'Abrir Rayos X',icon:'🩻',kind:'image',primary:true});
  }else if(calc){
   intent='calculator';label='Cálculo clínico · '+calc.label;icon='🧮';confidence=92;reason='La pregunta contiene una escala o cálculo disponible en Enferix.';
   actions.push({id:'calc',calc:calc.id,label:'Abrir '+calc.label,icon:'🧮',kind:'calc',primary:true});
   if(hasCase)actions.push({id:'triage',label:'Valorar el caso',icon:'🤖',kind:'warn'});
  }else if(isDrug){
   intent='medication';label='Consulta farmacológica';icon='💊';confidence=88;reason='Se han detectado términos de medicación, dosis o administración.';
   actions.push({id:'vadem',label:'Abrir Vademécum',icon:'💊',kind:'drug',primary:true});
   if(/perfusi|bomba|diluci|mcg\/kg|ml\/h/.test(t))actions.push({id:'calc',calc:'perf',label:'Calcular perfusión',icon:'🧮',kind:'calc'});
  }else if(isEcg){
   intent='ecg';label='Electrocardiografía';icon='🫀';confidence=87;reason='La consulta contiene términos de ECG o ritmo.';
   actions.push({id:'atlas',label:'Abrir Atlas ECG',icon:'🫀',kind:'image',primary:true});
   actions.push({id:'ecg',label:'Analizar una imagen',icon:'📟',kind:'image'});
  }else if(isRx){
   intent='imaging';label='Radiología / tórax';icon='🩻';confidence=86;reason='La consulta contiene términos de radiografía o imagen torácica.';
   actions.push({id:'rx',label:'Abrir Rayos X',icon:'🩻',kind:'image',primary:true});
   actions.push({id:'library-imaging',label:'Biblioteca de imagen',icon:'📚'});
  }else if(hasCase){
   intent='clinical_case';label='Caso clínico';icon='🤖';confidence=84;reason='Se han detectado datos de un paciente o una situación clínica.';
   actions.push({id:'triage',label:'Abrir Triage IA',icon:'🤖',kind:'warn',primary:true});
   actions.push({id:'library-pathology',label:'Ver patologías',icon:'📚'});
   if(isPath)actions.push({id:'guides',label:'Abrir Guías clínicas',icon:'🩺'});
  }else if(isPath){
   intent='pathology';label='Consulta de patología';icon='🚨';confidence=79;reason='Se ha reconocido una patología o síndrome clínico.';
   actions.push({id:'library-pathology',label:'Biblioteca de patologías',icon:'📚',primary:true});
   actions.push({id:'guides',label:'Abrir Guías clínicas',icon:'🩺'});
  }else if(isNav){
   intent='navigation';label='Navegación por Enferix';icon='🧭';confidence=70;reason='La petición parece solicitar que la app abra un apartado.';
   actions.push({id:'library',label:'Biblioteca virtual',icon:'📚',primary:true});
   actions.push({id:'guides',label:'Guías clínicas',icon:'🩺'});
  }else{
   actions.push({id:'library',label:'Explorar Biblioteca',icon:'📚'});
   actions.push({id:'guides',label:'Revisar Guías',icon:'🩺'});
  }
  return {intent:intent,label:label,icon:icon,confidence:confidence,reason:reason,calc:calc,actions:actions.slice(0,4),question:text||''};
 }
 function routePrompt(route){
  if(!route)return'';
  return '[ENRUTADOR DE JAVNY]\nIntención detectada: '+route.intent+'\nDescripción: '+route.label+'\nMotivo: '+route.reason+'\nHerramientas sugeridas: '+route.actions.map(function(a){return a.label}).join(', ')+'\n[FIN ENRUTADOR]\n\n';
 }
 function actionPanel(route){
  if(!route||!route.actions||!route.actions.length)return'';
  var buttons=route.actions.map(function(a,i){
   var cls='v21-action '+(a.kind||'')+(a.primary||i===0?' primary':'');
   return '<button class="'+cls+'" data-v21-action="'+esc(a.id)+'"'+(a.calc?' data-v21-calc="'+esc(a.calc)+'"':'')+'>'+esc(a.icon||'•')+' '+esc(a.label)+'</button>';
  }).join('');
  return '<div class="v21-router"><div class="v21-router-head"><span class="v21-router-icon">'+esc(route.icon)+'</span><span class="v21-router-copy"><b>Javny ha detectado: '+esc(route.label)+'</b><small>'+esc(route.reason)+'</small></span><span class="v21-confidence">'+route.confidence+'%</span></div><div class="v21-actions">'+buttons+'</div></div>';
 }
 function runJavnyAction(action,calc,question){
  function clickId(id){var el=document.getElementById(id);if(el){el.click();return true}return false}
  if(action==='triage'){
   hideChat();
   if(typeof openTriage==='function'){openTriage(question||'');return}
   if(clickId('triageBtn'))return;
  }
  if(action==='vadem'){
   hideChat();
   if(typeof openVade==='function'){openVade();return}
   if(clickId('vadeBtn'))return;
  }
  if(action==='calc'){
   hideChat();
   if(typeof openCalcs==='function'){openCalcs(calc||'perf');return}
   if(clickId('calcFab'))return;
  }
  if(action==='ecg'){
   hideChat();if(clickId('ecgFab'))return;
  }
  if(action==='rx'){
   hideChat();if(clickId('rxFab'))return;
  }
  if(action==='atlas'){
   hideChat();
   if(typeof openAtlas==='function'){openAtlas();return}
   if(clickId('atlasFab'))return;
  }
  if(action==='library-pathology'){
   hideChat();
   if(window.Enferix21&&typeof window.Enferix21.organize==='function'){window.Enferix21.organize('pathology','all');return}
   if(clickId('library21Btn'))return;
  }
  if(action==='library-imaging'){
   hideChat();
   if(window.Enferix21&&typeof window.Enferix21.organize==='function'){window.Enferix21.organize('system','imaging');return}
   if(clickId('library21Btn'))return;
  }
  if(action==='library'){
   hideChat();
   if(window.Enferix21&&typeof window.Enferix21.open==='function'){window.Enferix21.open('all');return}
   if(clickId('library21Btn'))return;
  }
  if(action==='guides'){
   hideChat();
   if(clickId('v29MenuBtn'))return;
   if(clickId('in50HomeDock'))return;
  }
  toastc('No he podido abrir esa herramienta en esta versión.');
 }
 function attachActionEvents(host,route){
  if(!host)return;
  host.querySelectorAll('[data-v21-action]').forEach(function(btn){
   btn.onclick=function(){
    runJavnyAction(btn.dataset.v21Action,btn.dataset.v21Calc,route&&route.question||window.__v21LastQuestion||'');
   };
  });
 }

 function sanitizeCaseText(text){
  return String(text||'')
   .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,'[correo omitido]')
   .replace(/\b(?:\+?34[\s.-]?)?(?:6|7|8|9)\d{8}\b/g,'[teléfono omitido]')
   .replace(/\b(?:dni|nie|nhc|nuhsa|historia\s*cl[ií]nica|nombre|apellidos)\s*[:\-]?\s*[^\n,;]{2,50}/gi,'[dato identificativo omitido]')
   .replace(/\b\d{7,12}\b/g,'[identificador numérico omitido]')
   .slice(0,1200);
 }
 function firstMatch(text,re,unit){
  var m=String(text||'').match(re);return m?(m[1]+(unit||'')):'';
 }
 function caseSnapshot(text,route){
  var raw=String(text||''),t=nrm(raw),values=[],alerts=[],missing=[];
  function add(label,value,alert){if(value)values.push({label:label,value:value,alert:!!alert})}
  var age=firstMatch(raw,/\b(\d{1,3})\s*(?:años|anos)\b/i,' años');
  var sbp=firstMatch(raw,/(?:tas|sist[oó]lica|tensi[oó]n(?: arterial)?)[^\d]{0,12}(\d{2,3})(?:\s*\/\s*\d{2,3})?/i,' mmHg');
  var bp=firstMatch(raw,/\b(\d{2,3}\s*\/\s*\d{2,3})\b/i,' mmHg');
  var hr=firstMatch(raw,/(?:fc|frecuencia card[ií]aca|pulso)[^\d]{0,10}(\d{2,3})/i,' lpm');
  var rr=firstMatch(raw,/(?:fr|frecuencia respiratoria)[^\d]{0,10}(\d{1,2})/i,' rpm');
  var spo=firstMatch(raw,/(?:spo2|sat(?:uraci[oó]n)?)[^\d]{0,10}(\d{2,3})\s*%?/i,' %');
  var temp=firstMatch(raw,/(?:temperatura|temp)[^\d]{0,8}(\d{2}(?:[.,]\d)?)\s*º?c?/i,' °C');
  var lact=firstMatch(raw,/(?:lactato)[^\d]{0,10}(\d+(?:[.,]\d+)?)/i,' mmol/L');
  var glu=firstMatch(raw,/(?:glucemia|glucosa)[^\d]{0,10}(\d{2,4})/i,' mg/dL');
  var diur=firstMatch(raw,/(?:diuresis)[^\d]{0,10}(\d+(?:[.,]\d+)?)/i,' mL');
  add('Edad',age);
  add('Presión arterial',bp||sbp,!!((bp||sbp)&&parseInt((bp||sbp),10)<90));
  add('Frecuencia cardíaca',hr,!!(hr&&(parseInt(hr,10)<50||parseInt(hr,10)>120)));
  add('Frecuencia respiratoria',rr,!!(rr&&(parseInt(rr,10)<8||parseInt(rr,10)>30)));
  add('Saturación',spo,!!(spo&&parseInt(spo,10)<92));
  add('Temperatura',temp,!!(temp&&(parseFloat(temp.replace(',','.'))<35||parseFloat(temp.replace(',','.'))>=39)));
  add('Lactato',lact,!!(lact&&parseFloat(lact.replace(',','.'))>=4));
  add('Glucemia',glu,!!(glu&&(parseInt(glu,10)<60||parseInt(glu,10)>300)));
  add('Diuresis',diur,false);

  if(/\b(confusi|alteraci[oó]n.*conciencia|somnol|coma|glasgow)\b/i.test(raw))alerts.push('Alteración del nivel de conciencia');
  if(/\b(dolor tor[aá]cico|opresi[oó]n tor[aá]cica)\b/i.test(raw))alerts.push('Dolor torácico');
  if(/\b(disnea intensa|dificultad respiratoria|cianosis)\b/i.test(raw))alerts.push('Compromiso respiratorio');
  if(/\b(anafilax|estridor|edema de glotis)\b/i.test(raw))alerts.push('Posible compromiso de vía aérea');
  if(/\b(hemorragia activa|sangrado masivo|hematemesis|melenas)\b/i.test(raw))alerts.push('Hemorragia significativa');
  values.filter(function(v){return v.alert}).forEach(function(v){alerts.push(v.label+' potencialmente crítico')});

  var clinical=route&&['clinical_case','pathology','medication','calculator'].includes(route.intent);
  if(clinical){
   if(!age)missing.push('Edad');
   if(!(bp||sbp))missing.push('Presión arterial');
   if(!hr)missing.push('Frecuencia cardíaca');
   if(!rr)missing.push('Frecuencia respiratoria');
   if(!spo)missing.push('Saturación');
   if(!/alerg/i.test(t))missing.push('Alergias');
   if(!/(antecedente|historia previa|comorbil)/.test(t))missing.push('Antecedentes');
   if(!/(medicaci|tratamiento habitual|farmaco previo)/.test(t))missing.push('Medicación habitual');
   if(!/(conciencia|orientado|glasgow|confusi|somnol)/.test(t))missing.push('Estado neurológico');
  }
  return {values:values,alerts:[...new Set(alerts)],missing:[...new Set(missing)].slice(0,8),clinical:clinical};
 }
 function casePanel(snapshot){
  if(!snapshot||(!snapshot.values.length&&!snapshot.alerts.length&&!snapshot.missing.length))return'';
  var cells=snapshot.values.map(function(v){return '<div class="v22-case-cell'+(v.alert?' alert':'')+'"><b>'+esc(v.label)+'</b><span>'+esc(v.value)+'</span></div>'}).join('');
  snapshot.alerts.forEach(function(a){cells+='<div class="v22-case-cell alert"><b>Señal de alerta detectada</b><span>'+esc(a)+'</span></div>'});
  if(!cells)cells='<div class="v22-case-cell"><b>Datos estructurados</b><span>No se han reconocido constantes numéricas.</span></div>';
  var miss=snapshot.missing.length?'<div class="v22-missing">'+snapshot.missing.map(function(x){return '<span>Falta: '+esc(x)+'</span>'}).join('')+'</div>':'';
  return '<div class="v22-case"><div class="v22-case-head"><span>🩺</span><span><b>Resumen estructurado del caso</b><small>Datos extraídos automáticamente del texto; comprueba que sean correctos.</small></span></div><div class="v22-case-grid">'+cells+'</div>'+miss+'</div>';
 }
 function hasAny(text,patterns){return patterns.some(function(p){return p.test(text)})}
 function localVerify(answer,question,route,sources,snapshot){
  var a=String(answer||''),n=nrm(a),issues=[],checks=[],score=100;
  var clinical=route&&['clinical_case','pathology','medication','calculator','ecg','imaging'].includes(route.intent);
  var structure={
   priority:hasAny(n,[/valoracion/,/prioridad/,/situacion clinica/]),
   missing:hasAny(n,[/datos.*falt/,/informacion.*pendiente/,/necesito conocer/]),
   alarms:hasAny(n,[/senal.*alarma/,/signos.*alarma/,/criterios.*gravedad/,/urgente/]),
   actions:hasAny(n,[/actuaciones/,/manejo inicial/,/prioridades/,/intervenciones/]),
   nursing:hasAny(n,[/cuidados.*enfermer/,/monitorizacion/,/vigilancia/]),
   tools:hasAny(n,[/escala/,/herramienta/,/sofa/,/news/,/nihss/,/glasgow/]),
   uncertainty:hasAny(n,[/incertid/,/diagnostico diferencial/,/no se puede confirmar/,/depende de/]),
   sources:hasAny(n,[/fuente/,/guia clinica/,/biblioteca virtual/,/verificar/])
  };
  if(clinical){
   [['Prioridad/valoración',structure.priority],['Datos faltantes',structure.missing],['Señales de alarma',structure.alarms],
    ['Actuaciones iniciales',structure.actions],['Cuidados/monitorización',structure.nursing],['Incertidumbre',structure.uncertainty],
    ['Fuentes/verificación',structure.sources]].forEach(function(c){
      checks.push({label:c[0],ok:c[1],kind:c[1]?'good':'note'});
      if(!c[1])score-=6;
   });
  }else{
   checks.push({label:'Respuesta pertinente',ok:a.length>80,kind:a.length>80?'good':'note'});
   checks.push({label:'Fuentes visibles',ok:(sources||[]).length>0,kind:(sources||[]).length?'good':'note'});
  }
  var dose=/\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|g|ml|mL|ui|UI|mEq|mmol)(?:\/(?:kg|min|h|hora))?\b/.test(a);
  var doseWarn=hasAny(n,[/verificar.*dosis/,/protocolo local/,/farmacia/,/validacion.*institucional/,/prescripcion/]);
  checks.push({label:'Control farmacológico',ok:!dose||doseWarn,kind:!dose||doseWarn?'good':'bad'});
  if(dose&&!doseWarn){issues.push('La respuesta contiene cantidades o dosis sin una advertencia clara de verificación institucional/farmacéutica.');score-=18}

  var absolute=hasAny(n,[/diagnostico definitivo/,/garantiza/,/siempre se debe/,/sin ninguna duda/,/es seguro que/]);
  checks.push({label:'Incertidumbre prudente',ok:!absolute,kind:!absolute?'good':'bad'});
  if(absolute){issues.push('Se ha detectado lenguaje excesivamente categórico.');score-=15}

  var ident=/\b(?:dni|nie|nhc|nombre completo|historia clinica)\b/.test(n);
  checks.push({label:'Privacidad',ok:!ident,kind:!ident?'good':'bad'});
  if(ident){issues.push('Revisa que la respuesta no reproduzca identificadores personales.');score-=20}

  if(snapshot&&snapshot.alerts.length&&!hasAny(n,[/urgente/,/emergencia/,/alarma/,/prioridad/,/inmediata/])){
   issues.push('El caso contiene señales de alerta, pero la respuesta no expresa claramente la prioridad.');score-=12
  }
  if((sources||[]).length===0){issues.push('No se han recuperado fuentes internas relevantes para esta consulta.');score-=8}
  score=Math.max(0,Math.min(100,score));
  var status=score>=86?'ok':score>=65?'warn':'risk';
  return {
   status:status,score:score,source:'local',
   title:status==='ok'?'Verificación clínica satisfactoria':status==='warn'?'Respuesta con observaciones':'Respuesta que requiere revisión',
   summary:status==='ok'?'La respuesta cumple los controles locales principales.':status==='warn'?'Conviene revisar los puntos señalados antes de utilizarla.':'No utilices esta respuesta sin una revisión profesional detallada.',
   checks:checks.slice(0,10),issues:issues.slice(0,6)
  };
 }
 function parseVerifierJSON(text){
  var clean=String(text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
  var start=clean.indexOf('{'),end=clean.lastIndexOf('}');
  if(start>=0&&end>start)clean=clean.slice(start,end+1);
  try{return JSON.parse(clean)}catch(e){return null}
 }
 function remoteVerify(answer,question,route,sources,local){
  if(!verifyEnabled||connectionMode()==='local')return Promise.resolve(local);
  var backend=backendUrl(),key=lget(KEYK,'');
  if(backend){
   return fetch(backend+'/api/javny/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    question:question,answer:answer,route:route||{},sources:(sources||[]).slice(0,12),local:local
   })}).then(function(r){return r.json().catch(function(){return {}}).then(function(data){
    if(!r.ok)throw new Error(data.error||('HTTP '+r.status));return data.verification||data
   })}).catch(function(){return local});
  }
  if(!key)return Promise.resolve(local);
  var sys='Eres un verificador clínico de seguridad. Evalúa una respuesta educativa para profesionales sanitarios. No añadas conocimiento nuevo. Devuelve SOLO JSON válido.';
  var payload={
   question:question,route:route||{},answer:answer,
   sources:(sources||[]).map(function(s){return {type:s.type,title:s.title,meta:s.meta}}),
   local_check:local,
   required_schema:{status:'ok|warn|risk',score:'0-100',title:'string',summary:'string',issues:['string'],checks:[{label:'string',ok:'boolean',kind:'good|note|bad'}]}
  };
  var body={systemInstruction:{parts:[{text:sys}]},contents:[{role:'user',parts:[{text:'Evalúa según: datos inventados, dosis sin verificación, lenguaje absoluto, prioridad ante alarmas, incertidumbre, datos faltantes, coherencia con fuentes y privacidad.\n'+JSON.stringify(payload)}]}],generationConfig:{temperature:0,maxOutputTokens:1800,responseMimeType:'application/json'}};
  var url='https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent?key='+encodeURIComponent(key);
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){
   return r.json().then(function(data){
    if(!r.ok)throw new Error(data&&data.error&&data.error.message||('HTTP '+r.status));
    var txt=(data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts||[]).map(function(p){return p.text||''}).join('');
    return parseVerifierJSON(txt)||local;
   })
  }).catch(function(){return local});
 }
 function verificationHTML(v,loading){
  v=v||{status:'warn',score:0,title:'Verificando…',summary:'Comprobando la respuesta.',checks:[],issues:[]};
  var icon=loading?'⏳':v.status==='ok'?'✅':v.status==='risk'?'⛔':'⚠️';
  var checks=(v.checks||[]).map(function(c){return '<div class="v22-check '+esc(c.kind||c.ok?'good':'note')+'"><span>'+(c.ok?'✓':c.kind==='bad'?'!':'•')+'</span><span>'+esc(c.label)+'</span></div>'}).join('');
  var issues=(v.issues||[]).length?'<div class="v22-issues"><b>Aspectos a revisar</b><ul>'+v.issues.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>':'';
  return '<div class="v22-verify '+esc(v.status||'warn')+(loading?' v22-verifying':'')+'"><div class="v22-verify-head"><span class="v22-vicon">'+icon+'</span><span class="v22-vcopy"><b>'+esc(v.title||'Verificación clínica')+'</b><small>'+esc(v.summary||'')+'</small></span><span class="v22-score">'+Math.round(Number(v.score)||0)+'</span></div><div class="v22-checks">'+checks+'</div>'+issues+'</div>';
 }
 function renderMemory(){
  var box=q('#v22MemoryList');if(!box)return;
  if(!caseMemory.length){box.innerHTML='<div class="v22-memory-empty">No hay información guardada en este caso.</div>';return}
  box.innerHTML=caseMemory.map(function(item,i){return '<div class="v22-memory-item"><small>Aportación '+(i+1)+'</small>'+esc(item)+'</div>'}).join('');
 }

 /* ---- render ---- */
 var chat=q('#ccChat');
 function launch(id){ hideChat(); var el=document.getElementById(id); if(el){ setTimeout(function(){el.click()},120); } else { toastc('Esa herramienta no está disponible'); } }
 var SPEC_QUICK_CC={
  cardio:[
   {q:"Manejo de la fibrilación auricular con respuesta ventricular rápida",ic:"❤️"},
   {q:"Síndrome coronario agudo — valoración y actuación inicial",ic:"🚨"},
   {q:"Preparación y dosis de amiodarona IV en arritmia",ic:"💊"}
  ],
  intensiva:[
   {q:"Preparación de noradrenalina: dilución, ritmo de infusión y monitorización",ic:"💉"},
   {q:"Sedación en UCI: escala RASS, fármacos y ajuste de perfusiones",ic:"🧠"},
   {q:"Criterios de extubación y proceso de weaning ventilatorio",ic:"🫁"}
  ],
  urgencias:[
   {q:"Protocolo de sepsis: qSOFA, lactato y paquete de medidas de la hora 1",ic:"🩸"},
   {q:"Manejo de la anafilaxia — dosis de adrenalina IM y segunda línea",ic:"💉"},
   {q:"Código ictus: valoración clínica y ventana terapéutica",ic:"🧠"}
  ],
  neuro:[
   {q:"Ictus isquémico agudo — manejo inicial, NIHSS y ventana trombolítica",ic:"🧠"},
   {q:"Escala de Glasgow y valoración del TCE grave",ic:"📊"},
   {q:"Crisis epiléptica: protocolo de benzodiacepinas y segunda línea",ic:"⚡"}
  ],
  trauma:[
   {q:"Evaluación ABCDE en el paciente politraumatizado grave",ic:"🚑"},
   {q:"Control de la hemorragia masiva — torniquete y compresión directa",ic:"🩸"},
   {q:"Protocolo de transfusión masiva 1:1:1",ic:"💉"}
  ],
  otras:[
   {q:"Protocolo de sepsis y shock séptico — manejo inicial",ic:"🩸"},
   {q:"Hipoglucemia grave — manejo y dosis de glucagón",ic:"🍬"},
   {q:"EPOC agudizado — broncodilatadores, corticoides y soporte ventilatorio",ic:"🫁"}
  ]
 };
 var GENERIC_QUICK_CC=[
  {q:"Paciente con sepsis: ¿cuáles son los primeros pasos?",ic:"🩺"},
  {q:"¿Cuál es la dosis de adrenalina en la parada cardíaca?",ic:"💉"},
  {q:"Lectura sistemática de la radiografía de tórax",ic:"🩻"}
 ];
 function welcome(){
  var mySpec='';try{mySpec=localStorage.getItem('inurse_myspec_v1')||'';}catch(e){}
  var specName=mySpec&&SPEC_NAMES_CC[mySpec]?SPEC_NAMES_CC[mySpec]:'';
  var suggestions=SPEC_QUICK_CC[mySpec]||GENERIC_QUICK_CC;
  var specTag=specName?'<div class="cc-spec-tag" style="margin:6px auto 12px;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:rgba(56,189,248,.13);border:1px solid rgba(56,189,248,.28);font-size:12px;color:#38bdf8;font-weight:700">🩺 '+esc(specName)+'</div>':'';
  var sugBtns=suggestions.map(function(s){return '<button class="cc-spec-sug" data-q="'+esc(s.q)+'"><span>'+s.ic+'</span>'+esc(s.q)+'</button>';}).join('');
  chat.innerHTML='<div class="cc-welcome cc-welcome-min"><div class="cc-wl">'+LOGO+'</div>'+
   '<h2>Hola, soy Javny 👋</h2>'+
   (specTag?specTag:'')+'<p style="margin-top:'+(specTag?'2px':'6px')+'">Cuéntame un caso o una duda. Detectaré qué fuentes y herramientas pueden ayudarte.</p>'+
   '<div class="cc-spec-sugs">'+sugBtns+'</div>'+
   '<div class="v21-quick">'+
    '<button data-v21-quick="case"><span>🤖</span>Plantear un caso</button>'+
    '<button data-v21-quick="drug"><span>💊</span>Consultar medicamento</button>'+
    '<button data-v21-tool="calc"><span>🧮</span>Calculadoras</button>'+
    '<button data-v21-tool="atlas"><span>🫀</span>Atlas ECG</button>'+
   '</div></div>';
  chat.querySelectorAll('.cc-spec-sug').forEach(function(btn){btn.onclick=function(){
   ta.value=btn.dataset.q;resize();upd();ta.focus();
  }});
  chat.querySelectorAll('[data-v21-quick]').forEach(function(btn){btn.onclick=function(){
   ta.value=btn.dataset.v21Quick==='case'?'Paciente con edad, antecedentes, constantes, síntomas, analítica y tratamiento administrado: ':'Necesito información sobre este medicamento: ';
   resize();upd();ta.focus();
  }});
  chat.querySelectorAll('[data-v21-tool]').forEach(function(btn){btn.onclick=function(){runJavnyAction(btn.dataset.v21Tool,btn.dataset.v21Tool==='calc'?'perf':'','')}});
 }
 function welcome_OLD(){
  chat.innerHTML='<div class="cc-welcome"><div class="cc-wl">'+LOGO+'</div>'+
   '<h2>Hola, soy Javny 👋</h2>'+
   '<p>Tu asistente clínica, conectada a toda la guía y al vademécum. Pregúntame, envíame una foto de un ECG o una radiografía, o abre las herramientas.</p>'+
   '<div class="cc-lbl">Pregúntame</div><div class="cc-sugg" id="ccSg1">'+
   '<button data-s="¿Cuál es la dosis de adrenalina en la anafilaxia del adulto?"><span class="ic">💉</span>Dosis de adrenalina en anafilaxia</button>'+
   '<button data-s="Resúmeme el manejo inicial de la sepsis y el shock séptico."><span class="ic">🩸</span>Manejo de la sepsis</button>'+
   '<button data-s="Recuérdame la sistemática de lectura de una radiografía de tórax."><span class="ic">🫁</span>Sistemática de la Rx de tórax</button>'+
   '</div><div class="cc-lbl">Herramientas de la guía</div><div class="cc-sugg" id="ccSg2">'+
   '<button data-l="atlasFab"><span class="ic">🫀</span>Abrir el Atlas de ECG</button>'+
   '<button data-l="ecgFab"><span class="ic">📟</span>Analizar un ECG con la cámara</button>'+
   '<button data-l="rxFab"><span class="ic">🩻</span>Analizar una radiografía</button>'+
   '<button data-g="1"><span class="ic">📚</span>Ver toda la guía y el vademécum</button>'+
   '</div></div>';
  chat.querySelectorAll('#ccSg1 button').forEach(function(b){b.onclick=function(){q('#ccTa').value=b.getAttribute('data-s');resize();send()}});
  chat.querySelectorAll('#ccSg2 button').forEach(function(b){b.onclick=function(){ if(b.getAttribute('data-g'))hideChat(); else launch(b.getAttribute('data-l')); }});
 }
 function getFollowups(userText){
  var mySpec='';try{mySpec=localStorage.getItem('inurse_myspec_v1')||'';}catch(e){}
  var pool=SPEC_QUICK_CC[mySpec]||GENERIC_QUICK_CC;
  var txt=(userText||'').toLowerCase();
  var filtered=pool.filter(function(s){ return !txt.includes(s.q.toLowerCase().slice(0,12)); });
  var picks=filtered.length>=2?filtered.slice(0,2):pool.slice(0,2);
  return picks;
 }
 function rmsg(m,isLast){
  var d=document.createElement('div');d.className='cc-msg '+(m.role==='user'?'u':'b');var inner='';
  if(m.att){ if(m.att.kind==='image')inner+='<img class="att" src="data:'+m.att.mime+';base64,'+m.att.data+'" alt="Imagen adjunta a la consulta">'; else inner+='<span class="doc">📄 '+esc(m.att.name||'documento')+'</span>'; }
  inner+= m.role==='user'? esc(m.content).replace(/\n/g,'<br>') : (function(){ var h=md(m.content); if(m.role==='bot'&&m.refs&&m.refs.length) h=linkifyCitations(h,m.refs); return h; })();
  if(m.role==='bot'){
   inner+='<div class="v30-actions"><button class="cc-spk">🔊 Leer</button><button class="v30-copy">📋 Copiar</button><button class="v30-share">📤 Compartir</button><button class="v30-pdf">📄 PDF</button></div>';
   if(isLast!==false){
    var prevUser=messages.slice(0,-1).filter(function(x){return x.role==='user';});
    var lastQ=prevUser.length?prevUser[prevUser.length-1].content:'';
    var fups=getFollowups(lastQ);
    if(fups.length)inner+='<div class="cc-followup">'+fups.map(function(f){return '<button class="cc-followup-btn" data-q="'+esc(f.q)+'">'+f.ic+' '+esc(f.q)+'</button>';}).join('')+'</div>';
   }
  }
  d.innerHTML=inner;
  if(m.role==='bot'){
   d.querySelector('.cc-spk').onclick=function(){speak(m.content)};
   d.querySelector('.v30-copy').onclick=function(){v30Copy(m.content)};
   d.querySelector('.v30-share').onclick=function(e){v30Share(m.content,e.currentTarget)};
   d.querySelector('.v30-pdf').onclick=function(){v30PDF(m.content)};
   d.querySelectorAll('.cc-followup-btn').forEach(function(btn){btn.onclick=function(){ ta.value=btn.dataset.q;resize();upd();ta.focus(); };});
  }
  chat.appendChild(d);return d;
 }
 function _ccNorm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();}
 function maybeAlgBubble(text){
  try{
   if(!text||!window.EnferixAlgLib||typeof window.EnferixAlgLib.find!=='function')return null;
   var n=_ccNorm(text);
   var intent=/algoritmo|protocolo|pauta|actuacion|paso a paso|como (actuo|actuar|manejo|trato|procedo)|que hago (con|ante|si)|manejo (de|del|inicial)|lee(me)? el|leer/.test(n);
   if(!intent)return null;
   var m=window.EnferixAlgLib.find(text);
   if(!m)return null;
   var d=document.createElement('div');d.className='cc-msg b cc-alg-msg';
   var steps=m.steps.map(function(s){return '<li>'+esc(s)+'</li>';}).join('');
   d.innerHTML='<div class="cc-alg-card">'
    +'<div class="cc-alg-head">🧩 <b>'+esc(m.name)+'</b>'+(m.cat?'<span class="cc-alg-cat">'+esc(m.cat)+'</span>':'')+'</div>'
    +'<div class="cc-alg-src">Fuente: '+esc(m.src)+' · Adáptalo siempre al protocolo y las competencias de tu centro.</div>'
    +'<ol class="cc-alg-steps">'+steps+'</ol>'
    +'<div class="cc-alg-actions">'
    +'<button class="cc-alg-btn" data-alg-open="'+esc(m.name)+'">📖 Abrir ficha completa</button>'
    +'<button class="cc-alg-btn alt" data-alg-ev="'+esc(m.name)+'">🔬 Buscar evidencia</button>'
    +'</div></div>';
   d.querySelector('[data-alg-open]').onclick=function(){ try{ window.EnferixAlgLib.open(m.name); }catch(e){} };
   d.querySelector('[data-alg-ev]').onclick=function(){ ta.value='Busca evidencia reciente en PubMed, PMC y NICE sobre '+m.name+' y resume las recomendaciones actuales con sus fuentes.'; resize();upd(); send(); };
   chat.appendChild(d);chat.scrollTop=chat.scrollHeight;
   return m;
  }catch(e){ return null; }
 }
 function algSpeechText(m){
  return 'Algoritmo de '+m.name+', según '+m.src+'. '+m.steps.map(function(s,i){return 'Paso '+(i+1)+'. '+s;}).join(' ')+' Recuerda adaptarlo al protocolo de tu centro.';
 }
 function paint(){ if(!messages.length){welcome();return} chat.innerHTML='';messages.forEach(function(m,i){rmsg(m,i===messages.length-1&&m.role==='bot');});chat.scrollTop=chat.scrollHeight; }

 /* ---- voz conversacional ---- */
 var voices=[];
 function lv(){voices=window.speechSynthesis?speechSynthesis.getVoices():[]}
 if(window.speechSynthesis){lv();speechSynthesis.onvoiceschanged=lv}
 function voiceUI(state,title,status){
  var bar=q('#v23VoiceBar'),button=q('#v23Voice');
  bar.className='v23-voice-bar'+(voiceSession?' on':'')+(state?' '+state:'');
  button.classList.toggle('on',voiceSession);
  q('#v23VoiceTitle').textContent=title||'Conversación por voz';
  q('#v23VoiceStatus').textContent=status||'';
 }
 function speak(t,onEnd){
  if(!window.speechSynthesis){if(onEnd)onEnd();return}
  speechSynthesis.cancel();voiceBusy=true;
  if(voiceSession)voiceUI('speaking','Javny está respondiendo','Al terminar volveré a escuchar.');
  var clean=stripH(md(t)).replace(/[*#`]/g,'');var u=new SpeechSynthesisUtterance(clean);u.lang='es-ES';u.rate=1.02;
  var es=voices.filter(function(v){return /es(-|_)ES/i.test(v.lang)})[0]||voices.filter(function(v){return /^es/i.test(v.lang)})[0];
  if(es)u.voice=es;
  u.onend=function(){voiceBusy=false;if(onEnd)onEnd()};
  u.onerror=function(){voiceBusy=false;if(onEnd)onEnd()};
  speechSynthesis.speak(u);
 }
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition,rec=null,recOn=false,base='',recMode='dictation',voiceTranscript='';
 function setTranscript(text){
  var bar=q('#v23VoiceBar'),old=bar.querySelector('.v23-transcript');
  if(old)old.remove();
  if(text){var d=document.createElement('div');d.className='v23-transcript';d.textContent='«'+text+'»';bar.appendChild(d)}
 }
 function stripWake(text){
  var clean=String(text||'').trim();
  var found=/\b(?:oye|hola)\s+javny\b/i.test(clean)||/^\s*javny[\s,:]/i.test(clean);
  clean=clean.replace(/\b(?:oye|hola)\s+javny[\s,:-]*/ig,'').replace(/^\s*javny[\s,:-]*/i,'').trim();
  return {found:found,text:clean};
 }
 function voiceCommand(text){
  var t=nrm(text);
  if(/^(deten|para|finaliza).*(voz|conversacion)|^adios javny$/.test(t)){stopVoiceSession();return true}
  if(/^(borra|cierra).*(caso|memoria)/.test(t)){q('#v20Case').click();return true}
  if(/abre.*biblioteca/.test(t)){runJavnyAction('library','','');return true}
  if(/abre.*(guia|guias)/.test(t)){runJavnyAction('guides','','');return true}
  if(/abre.*vademecum/.test(t)){runJavnyAction('vadem','','');return true}
  if(/abre.*(calculadora|perfus)/.test(t)){runJavnyAction('calc','perf','');return true}
  if(/abre.*triage/.test(t)){runJavnyAction('triage','',text);return true}
  if(/abre.*(atlas|electro)/.test(t)){runJavnyAction('atlas','','');return true}
  if(/abre.*(rayos|radiografia)/.test(t)){runJavnyAction('rx','','');return true}
  return false
 }
 function startRecognition(mode){
  if(!SR){toastc('El reconocimiento de voz no está disponible en este navegador');stopVoiceSession();return}
  if(voiceBusy)return;
  recMode=mode||'dictation';voiceFinal='';voiceTranscript='';base=recMode==='dictation'&&q('#ccTa').value?q('#ccTa').value+' ':'';
  if(recOn){try{rec.stop()}catch(e){}}
  rec=new SR();rec.lang='es-ES';rec.interimResults=true;rec.continuous=false;recOn=true;
  rec.onstart=function(){
   q('#ccMic').classList.add('on');q('#ccIbox').classList.add('rec');
   if(recMode==='conversation')voiceUI('listening','Te escucho','Habla con naturalidad. Puedes decir «Oye Javny» si lo has activado.');
  };
  rec.onresult=function(e){
   var interim='',final='';
   for(var i=e.resultIndex;i<e.results.length;i++){var result=e.results[i];if(result.isFinal)final+=result[0].transcript;else interim+=result[0].transcript}
   if(final)voiceFinal+=(voiceFinal?' ':'')+final.trim();
   var combined=(voiceFinal+' '+interim).trim();voiceTranscript=combined;
   if(recMode==='dictation'){q('#ccTa').value=(base+combined).trim();resize();upd()}
   else setTranscript(combined);
  };
  rec.onerror=function(e){
   recOn=false;q('#ccMic').classList.remove('on');q('#ccIbox').classList.remove('rec');
   if(e.error==='not-allowed'||e.error==='service-not-allowed'){toastc('Safari no ha concedido permiso para usar el micrófono');stopVoiceSession();return}
   if(voiceSession)voiceUI('','Conversación activa','No te he entendido. Volveré a escuchar.');
  };
  rec.onend=function(){
   recOn=false;q('#ccMic').classList.remove('on');q('#ccIbox').classList.remove('rec');
   var spoken=(voiceFinal||voiceTranscript||'').trim();
   if(recMode==='dictation')return;
   if(!voiceSession)return;
   var wake=stripWake(spoken);
   if(requireWake&&!wake.found){
    voiceUI('','Esperando «Oye Javny»','Di «Oye Javny» seguido de tu pregunta.');
    scheduleVoiceRestart(500);return;
   }
   spoken=wake.text;
   if(!spoken){scheduleVoiceRestart(450);return}
   setTranscript(spoken);
   if(voiceCommand(spoken)){scheduleVoiceRestart(650);return}
   q('#ccTa').value=spoken;resize();upd();voiceBusy=true;
   setTimeout(function(){send()},120);
  };
  try{rec.start()}catch(e){recOn=false}
 }
 function scheduleVoiceRestart(delay){
  clearTimeout(voiceRestartTimer);
  if(!voiceSession||voiceBusy)return;
  voiceRestartTimer=setTimeout(function(){if(voiceSession&&!voiceBusy)startRecognition('conversation')},delay||400);
 }
 function startVoiceSession(){
  if(!SR){toastc('El modo conversación no está disponible en este navegador');return}
  voiceSession=true;voiceBusy=false;showChat();voiceUI('','Conversación por voz activa',requireWake?'Di «Oye Javny» y tu pregunta.':'Habla cuando aparezca «Te escucho».');
  startRecognition('conversation');
 }
 function stopVoiceSession(){
  voiceSession=false;voiceBusy=false;clearTimeout(voiceRestartTimer);
  if(recOn){try{rec.stop()}catch(e){}}
  recOn=false;if(window.speechSynthesis)speechSynthesis.cancel();
  q('#ccMic').classList.remove('on');q('#ccIbox').classList.remove('rec');setTranscript('');
  voiceUI('','Conversación por voz desactivada','Pulsa 🎙️ para iniciar una sesión manos libres.');
 }
 q('#v23Voice').onclick=function(){voiceSession?stopVoiceSession():startVoiceSession()};
 q('#v23VoiceStop').onclick=stopVoiceSession;
 q('#ccMic').onclick=function(){
  if(recOn&&recMode==='dictation'){try{rec.stop()}catch(e){}return}
  startRecognition('dictation');
 };
 function pauseVoiceInput(){
  if(recOn){try{rec.stop()}catch(e){}}
  recOn=false;q('#ccMic').classList.remove('on');q('#ccIbox').classList.remove('rec');
 }
 function stopRec(){pauseVoiceInput()}

 /* ---- adjuntar ---- */
 q('#ccAtt').onclick=function(){q('#ccFile').click()};
 q('#v23Camera').onclick=function(){q('#v23CameraFile').click()};
 function loadAttachmentFile(f){
  if(!f)return;
  if(f.size>8*1024*1024){toastc('El archivo es muy grande (máx. 8 MB)');return}
  var r=new FileReader();
  if(f.type.indexOf('image/')===0){
   r.onload=function(){mediaType='auto';attachment={kind:'image',mime:f.type||'image/jpeg',data:r.result.split(',')[1],name:f.name||'captura.jpg',preview:r.result,mediaType:mediaType};showAtt()};
   r.readAsDataURL(f);
  }else if(f.type==='application/pdf'){
   r.onload=function(){mediaType='document';attachment={kind:'pdf',mime:'application/pdf',data:r.result.split(',')[1],name:f.name,mediaType:'document'};showAtt()};
   r.readAsDataURL(f);
  }else{
   r.onload=function(){mediaType='document';attachment={kind:'text',mime:'text/plain',text:r.result,name:f.name,mediaType:'document'};showAtt()};
   r.readAsText(f);
  }
 }
 q('#ccFile').onchange=function(e){loadAttachmentFile(e.target.files[0]);e.target.value=''};
 q('#v23CameraFile').onchange=function(e){loadAttachmentFile(e.target.files[0]);e.target.value=''};
 function mediaLabel(type){
  return type==='ecg'?'Electrocardiograma':type==='xray'?'Radiografía':type==='clinical'?'Imagen clínica':type==='document'?'Documento':'Detección automática';
 }
 function renderMediaPanel(){
  var box=q('#v23MediaPanel');
  if(!attachment){box.className='v23-media-panel';box.innerHTML='';return}
  var types=attachment.kind==='image'?
   [['auto','✨ Automático'],['ecg','📟 ECG'],['xray','🩻 Radiografía'],['clinical','📷 Imagen clínica']]:
   [['document','📄 Documento']];
  box.className='v23-media-panel on';
  box.innerHTML='<div class="v23-media-head"><span>'+(attachment.kind==='image'?'🩻':'📄')+'</span><span><b>Tipo de contenido</b><small>Ayuda a Javny a interpretar correctamente el archivo.</small></span></div>'+
   '<div class="v23-media-types">'+types.map(function(t){return '<button class="v23-media-type '+(mediaType===t[0]?'on':'')+'" data-v23-media="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+
   '<div class="v23-media-safety">La interpretación es educativa: Javny debe describir calidad, hallazgos visibles, limitaciones y señales de alarma, sin sustituir el informe diagnóstico.</div>';
  box.querySelectorAll('[data-v23-media]').forEach(function(btn){btn.onclick=function(){mediaType=btn.dataset.v23Media;if(attachment)attachment.mediaType=mediaType;renderMediaPanel()}});
 }
 function showAtt(){var p=q('#ccAttPrev');if(!attachment){p.className='cc-attprev';p.innerHTML='';renderMediaPanel();upd();return}
  attachment.mediaType=mediaType;
  p.className='cc-attprev on';var th=attachment.kind==='image'?'<img src="'+attachment.preview+'" alt="Vista previa de la imagen a enviar">':'<span style="font-size:20px">📄</span>';
  p.innerHTML='<div class="cc-attchip">'+th+'<span>'+esc(attachment.name||attachment.kind)+' · '+esc(mediaLabel(mediaType))+'</span><button class="x" id="ccAttX">✕</button></div>';
  q('#ccAttX').onclick=function(){attachment=null;mediaType='auto';showAtt()};renderMediaPanel();upd();
 }

 /* ---- input ---- */
 var ta=q('#ccTa');
 function resize(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,120)+'px'}
 function upd(){q('#ccSend').disabled=!(ta.value.trim()||attachment)}
 ta.addEventListener('input',function(){resize();upd()});
 ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&window.innerWidth>700){e.preventDefault();send()}});
 q('#ccSend').onclick=send;


 function inferMediaType(att,text){
  if(!att)return'none';
  if(att.mediaType&&att.mediaType!=='auto')return att.mediaType;
  var t=nrm(text||'');
  if(att.kind==='pdf'||att.kind==='text')return'document';
  if(/\b(ecg|electrocardiograma|electro|ritmo|qrs|segmento st|qt)\b/.test(t))return'ecg';
  if(/\b(radiografia|rayos x|rx|torax|neumotorax|infiltrado|derrame)\b/.test(t))return'xray';
  return'clinical';
 }
 function mediaInstruction(att,text){
  if(!att)return'';
  var type=inferMediaType(att,text);
  var common='Analiza el archivo con finalidad educativa. Primero valora su calidad y limitaciones. Describe solo hallazgos observables, evita un diagnóstico definitivo, señala señales de alarma y explica qué debe confirmar un profesional o informe oficial.';
  if(type==='ecg')return '[ARCHIVO MULTIMODAL: ECG]\n'+common+' En un ECG sigue: calidad/calibración; frecuencia; ritmo; eje; intervalos; QRS; ST-T; hallazgos; diagnóstico diferencial; urgencia; limitaciones.';
  if(type==='xray')return '[ARCHIVO MULTIMODAL: RADIOGRAFÍA]\n'+common+' En una radiografía sigue: proyección/calidad; vía aérea; respiración/pleura; cardiomediastino; diafragma; huesos/partes blandas; dispositivos; hallazgos; urgencia; limitaciones.';
  if(type==='clinical')return '[ARCHIVO MULTIMODAL: IMAGEN CLÍNICA]\n'+common+' No identifiques personas ni infieras atributos personales. Describe localización, morfología, color, tamaño relativo, dispositivos visibles, hallazgos y limitaciones.';
  return '[DOCUMENTO ADJUNTO]\nResume el contenido, identifica fecha/versión si aparece, extrae recomendaciones y diferencia claramente texto documental de conclusiones propias.';
 }
 function mediaResultPanel(att,text){
  if(!att)return'';
  var type=inferMediaType(att,text),label=mediaLabel(type),quality=att.kind==='image'?'Imagen recibida':'Documento recibido';
  return '<div class="v23-media-result"><div class="v23-media-result-head"><span>'+(type==='ecg'?'📟':type==='xray'?'🩻':type==='document'?'📄':'📷')+'</span><span><b>Contenido multimodal enviado</b><small>'+esc(att.name||'archivo')+'</small></span></div>'+
   '<div class="v23-media-grid"><div class="v23-media-cell"><b>Tipo declarado</b><span>'+esc(label)+'</span></div>'+
   '<div class="v23-media-cell"><b>Estado</b><span>'+esc(quality)+'</span></div>'+
   '<div class="v23-media-cell"><b>Uso</b><span>Análisis educativo y apoyo a la interpretación</span></div>'+
   '<div class="v23-media-cell"><b>Limitación</b><span>No sustituye informe diagnóstico ni valoración presencial</span></div></div></div>';
 }

 /* ---- PMC Retrieval (RAG) ---- */
 async function pmcRetrieve(query, limit) {
  window.__v20PmcSources = [];
  if (!query || query.trim().length === 0) return '';
  limit = limit || 8;
  try {
    var response = await fetch('/api/pmc/search?q=' + encodeURIComponent(query));
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var data = await response.json();
    var list = data.items || data.results || [];
    if (list.length === 0) return '';

    var pmcCtx = '';
    list.slice(0, limit).forEach(function(article, idx) {
      pmcCtx += '### Artículo ' + (idx + 1) + '\n';
      if (article.title) pmcCtx += '**Título:** ' + article.title + '\n';
      if (article.authors || article.authorString) pmcCtx += '**Autores:** ' + (article.authors || article.authorString) + '\n';
      if (article.journal || article.journalTitle) pmcCtx += '**Revista:** ' + (article.journal || article.journalTitle) + '\n';
      if (article.year || article.pubYear) pmcCtx += '**Año:** ' + (article.year || article.pubYear) + '\n';
      if (article.abstract || article.abstractText) pmcCtx += '**Resumen:** ' + (article.abstract || article.abstractText).substring(0, 500) + '\n';
      if (article.pmcid) pmcCtx += '**PMC ID:** ' + article.pmcid + '\n';
      if (article.doi) pmcCtx += '**DOI:** ' + article.doi + '\n';
      pmcCtx += '\n';
      var pmcUrl = article.url || (article.pmcid ? 'https://www.ncbi.nlm.nih.gov/pmc/articles/' + article.pmcid + '/' : (article.doi ? 'https://doi.org/' + article.doi : ''));
      window.__v20PmcSources.push({
        type: 'literature',
        title: article.title || '(sin título)',
        id: pmcUrl,
        meta: (article.journal || article.journalTitle || 'Europe PMC') + ((article.year || article.pubYear) ? ' · ' + (article.year || article.pubYear) : ''),
        journal: article.journal || article.journalTitle || '',
        year: article.year || article.pubYear || ''
      });
    });

    return pmcCtx;
  } catch (error) {
    console.error('PMC retrieval error:', error);
    return '';
  }
 }

 /* ---- Literature Retrieval: PubMed + Crossref (RAG) ---- */
 async function literatureRetrieve(query, limit) {
  window.__v20LiteratureSources = [];
  if (!query || query.trim().length === 0) return '';
  limit = limit || 10;
  try {
    var response = await fetch('/api/literature/search?q=' + encodeURIComponent(query) + '&sources=pubmed,crossref&limit=' + limit);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var data = await response.json();
    if (!data.items || data.items.length === 0) return '';

    var ctx = '';
    data.items.forEach(function(article, idx) {
      ctx += '### Artículo ' + (idx + 1) + '\n';
      if (article.title) ctx += '**Título:** ' + article.title + '\n';
      if (article.authors) ctx += '**Autores:** ' + article.authors + '\n';
      if (article.journal) ctx += '**Revista:** ' + article.journal + '\n';
      if (article.year) ctx += '**Año:** ' + article.year + '\n';
      if (article.source) ctx += '**Fuente:** ' + article.source + '\n';
      if (article.abstract) ctx += '**Resumen:** ' + article.abstract.substring(0, 500) + '\n';
      if (article.pmid) ctx += '**PMID:** ' + article.pmid + '\n';
      if (article.doi) ctx += '**DOI:** ' + article.doi + '\n';
      if (article.url) ctx += '**URL:** ' + article.url + '\n';
      ctx += '\n';
      window.__v20LiteratureSources.push({
        type: 'literature',
        title: article.title || '(sin título)',
        id: article.url || (article.doi ? 'https://doi.org/' + article.doi : ''),
        meta: (article.journal || article.source || 'PubMed/Crossref') + (article.year ? ' · ' + article.year : ''),
        journal: article.journal || '',
        year: article.year || ''
      });
    });

    return ctx;
  } catch (error) {
    console.error('Literature retrieval error:', error);
    return '';
  }
 }

 /* ---- Guideline-focused Retrieval: NICE, ESC, ERC, JBI via PubMed ---- */
 var GUIDELINE_ORGS = [
  {tag:'NICE', q:'"NICE guideline" OR "National Institute for Health and Care Excellence"'},
  {tag:'ESC',  q:'"ESC guideline" OR "European Society of Cardiology"'},
  {tag:'ERC',  q:'"ERC guideline" OR "European Resuscitation Council"'},
  {tag:'JBI',  q:'"JBI" OR "Joanna Briggs Institute"'}
 ];
 async function guidelineRetrieve(query, limit) {
  window.__v20GuidelineSources = [];
  if (!query || query.trim().length === 0) return '';
  limit = limit || 8;
  var enriched = '(' + query + ') AND (' + GUIDELINE_ORGS.map(function(o){return o.q}).join(' OR ') + ')';
  try {
    var response = await fetch('/api/literature/search?q=' + encodeURIComponent(enriched) + '&sources=pubmed&limit=' + limit);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var data = await response.json();
    if (!data.items || data.items.length === 0) return '';

    var ctx = '';
    data.items.forEach(function(article, idx) {
      ctx += '### Guía ' + (idx + 1) + '\n';
      if (article.title) ctx += '**Título:** ' + article.title + '\n';
      if (article.authors) ctx += '**Autores:** ' + article.authors + '\n';
      if (article.journal) ctx += '**Revista:** ' + article.journal + '\n';
      if (article.year) ctx += '**Año:** ' + article.year + '\n';
      if (article.abstract) ctx += '**Resumen:** ' + article.abstract.substring(0, 500) + '\n';
      if (article.pmid) ctx += '**PMID:** ' + article.pmid + '\n';
      if (article.doi) ctx += '**DOI:** ' + article.doi + '\n';
      ctx += '\n';
      window.__v20GuidelineSources.push({
        type: 'guideline',
        title: article.title || '(sin título)',
        id: article.url || (article.doi ? 'https://doi.org/' + article.doi : (article.pmid ? 'https://pubmed.ncbi.nlm.nih.gov/' + article.pmid + '/' : '')),
        meta: (article.journal || 'Guía internacional') + (article.year ? ' · ' + article.year : ''),
        journal: article.journal || '',
        year: article.year || ''
      });
    });

    return ctx;
  } catch (error) {
    console.error('Guideline retrieval error:', error);
    return '';
  }
 }

 /* ---- NICE Guidelines Retrieval ---- */
 async function niceRetrieve(query, limit) {
  window.__v20NiceSources = [];
  if (!query || query.trim().length === 0) return '';
  limit = limit || 8;
  try {
    var response = await fetch('/api/nice/search?q=' + encodeURIComponent(query) + '&limit=' + limit);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var data = await response.json();
    if (!data.items || data.items.length === 0) return '';

    var ctx = '';
    data.items.forEach(function(g, idx) {
      ctx += '### NICE Guideline ' + (idx + 1) + '\n';
      if (g.title) ctx += '**Título:** ' + g.title + '\n';
      if (g.type) ctx += '**Tipo:** ' + g.type + '\n';
      if (g.date) ctx += '**Fecha:** ' + g.date + '\n';
      if (g.summary) ctx += '**Resumen:** ' + g.summary + '\n';
      if (g.url) ctx += '**URL:** ' + g.url + '\n';
      ctx += '\n';
      window.__v20NiceSources.push({
        type: 'nice',
        title: g.title || '(sin título)',
        id: g.url || '',
        meta: 'NICE' + (g.date ? ' · ' + g.date : ''),
        journal: 'NICE',
        year: (String(g.date||'').match(/(20\d{2})/)||[])[1] || ''
      });
    });

    return ctx;
  } catch (error) {
    console.error('NICE retrieval error:', error);
    return '';
  }
 }

 /* ---- SNOMED CT Retrieval (candidatos; Javny solo debe citar coincidencia exacta) ---- */
 async function snomedRetrieve(query, limit) {
  window.__v20SnomedSources = [];
  if (!query || query.trim().length === 0) return '';
  limit = limit || 6;
  try {
    var response = await fetch('/api/snomed/search?q=' + encodeURIComponent(query) + '&limit=' + limit);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var data = await response.json();
    if (!data.items || data.items.length === 0) return '';

    var ctx = '';
    data.items.forEach(function(c) {
      ctx += '- ' + c.term + ' — SNOMED CT: ' + c.conceptId + '\n';
      window.__v20SnomedSources.push({
        type: 'snomed',
        title: c.term,
        id: c.url || '',
        meta: 'SNOMED CT · ' + c.conceptId
      });
    });

    return ctx;
  } catch (error) {
    console.error('SNOMED retrieval error:', error);
    return '';
  }
 }

 /* ---- Gemini (streaming, modo directo con clave propia) ---- */
 async function streamGeminiDirect(sys,contents,key,onDelta){
  var url='https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':streamGenerateContent?alt=sse&key='+encodeURIComponent(key);
  var body={systemInstruction:{parts:[{text:sys}]},contents:contents,generationConfig:{temperature:0.18,maxOutputTokens:8192}};
  var res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok||!res.body){
   var errData=await res.json().catch(function(){return {};});
   throw new Error(errData&&errData.error&&errData.error.message?errData.error.message:('Error '+res.status));
  }
  var reader=res.body.getReader(),decoder=new TextDecoder('utf-8'),buf='',full='';
  while(true){
   var chunk=await reader.read();
   if(chunk.done)break;
   buf+=decoder.decode(chunk.value,{stream:true});
   var events=buf.split('\n\n');
   buf=events.pop();
   for(var i=0;i<events.length;i++){
    var line=events[i].trim();
    if(line.indexOf('data:')!==0)continue;
    var jsonStr=line.replace(/^data:\s*/,'').trim();
    if(!jsonStr||jsonStr==='[DONE]')continue;
    try{
     var evt=JSON.parse(jsonStr);
     var cand=evt.candidates&&evt.candidates[0];
     var t=cand&&cand.content&&cand.content.parts?cand.content.parts.map(function(p){return p.text||'';}).join(''):'';
     if(t){ full+=t; if(onDelta)onDelta(full); }
    }catch(e){ /* fragmento SSE incompleto: se completa en el siguiente chunk */ }
   }
  }
  var out=full.trim();
  if(!out)throw new Error('Gemini devolvió una respuesta vacía. Revisa la clave y el modelo en Ajustes.');
  return out;
 }
 function withTimeout(promise,ms){
  return new Promise(function(resolve){
   var settled=false;
   var t=setTimeout(function(){ if(!settled){ settled=true; resolve(''); } },ms);
   Promise.resolve(promise).then(function(v){ if(!settled){ settled=true; clearTimeout(t); resolve(v); } }).catch(function(){ if(!settled){ settled=true; clearTimeout(t); resolve(''); } });
  });
 }

 var SPEC_NAMES_CC={cardio:'Cardiología',intensiva:'UCI / Medicina Intensiva',urgencias:'Urgencias',neuro:'Neurología',trauma:'Traumatología y Quemados',otras:'Otras especialidades'};
 /* P36 · Herramientas de Javny: etiquetas del indicador mientras el servidor
    ejecuta una herramienta, y panel de botones para abrir las fichas/escalas
    que las herramientas enlazaron. Los eventos NDJSON nuevos ('herramienta',
    'enlaces') los ignoran sin ruido los clientes que no los conocen. */
 var P36_TOOL_LABELS={
  calcular_escala:'Calculando con la calculadora validada',
  dilucion_farmaco:'Consultando el formulario de fármacos',
  interacciones_farmacos:'Comprobando interacciones en CIMA',
  centros_cercanos:'Buscando centros cercanos',
  buscar_en_enferix:'Buscando en Enferix'
 };
 function p36ToolNote(evt){
  var typEl=document.querySelector('.cc-typing');if(!typEl)return;
  var lbl=typEl.querySelector('.p36-tool');
  if(evt.estado==='inicio'){
   if(!lbl){lbl=document.createElement('small');lbl.className='p36-tool';typEl.appendChild(lbl);}
   lbl.textContent='🔧 '+(P36_TOOL_LABELS[evt.herramienta]||evt.herramienta)+'…';
  }else if(lbl){lbl.textContent='';}
 }
 function p36EnlacesPanel(enl){
  if(!enl||!enl.length)return '';
  return '<div class="p36-enlaces">'+enl.map(function(e){
   return '<button type="button" class="p36-enlace" data-p36-tipo="'+esc(e.tipo)+'" data-p36-id="'+esc(e.id)+'">'
    +(e.tipo==='escala'?'🧮':'📄')+' '+esc(e.titulo)+'</button>';
  }).join('')+'</div>';
 }
 function p36AttachEnlaces(node){
  node.querySelectorAll('.p36-enlace').forEach(function(b){
   b.onclick=function(){
    var tipo=b.getAttribute('data-p36-tipo'),id=b.getAttribute('data-p36-id');
    if(tipo==='ficha'&&typeof window.openDoc==='function')window.openDoc(id);
    else if(tipo==='escala'){
     if(window.EnferixEscalas&&window.EnferixEscalas.openCalc)window.EnferixEscalas.openCalc(id);
     else if(typeof window.openCalcs==='function')window.openCalcs(id);
    }
   };
  });
 }
 function call(userText,att,guideCtx,libraryCtx,pmcCtx,litCtx,guidelineCtx,niceCtx,snomedCtx,hist,route,onDelta,nearbyCtx,ubicacion){
  var key=lget(KEYK,''),backend=backendUrl();
  var memory=caseMemory.slice(-6).join('\n');
  var mySpec='';try{mySpec=localStorage.getItem('inurse_myspec_v1')||'';}catch(e){}
  var specCtx=mySpec&&SPEC_NAMES_CC[mySpec]?'CONTEXTO DE ESPECIALIZACIÓN: La profesional que consulta trabaja en '+SPEC_NAMES_CC[mySpec]+'. Cuando sea pertinente, adapta el enfoque de tus respuestas a este contexto clínico (fármacos de referencia, protocolos y monitorización habitual en esa área).\n\n':'';
  var sys=specCtx+"Eres Javny, la asistente clínica de referencia de Enferix. Das respuestas clínicas basadas en evidencia, "+
   "SINTETIZADAS Y DIRECTAS al estilo de OpenEvidence (con el rigor de UpToDate pero sin extenderte de más). Responde SIEMPRE "+
   "en español (o en catalán si te preguntan en catalán). "+
   "Contesta PRIMERO lo que se pregunta (respuesta directa) y luego desarrolla con profundidad clínica. "+
   "Si alguien escribe solo el nombre de una patología o un fármaco, trátalo como una revisión clínica completa del tema "+
   "(definición, diagnóstico, manejo, monitorización y enfermería), manteniendo la apertura directa y el resumen final. "+
   "No respondas nunca solo de memoria: fundamenta tus afirmaciones en las fuentes recuperadas que se te adjuntan. Si falta "+
   "evidencia suficiente sobre algún punto, indícalo explícitamente en vez de inventarlo. "+
   "Trabaja con los repositorios integrados en Enferix: "+
   "FUENTE A = Guías clínicas internas y Vademécum (contenido validado de Enferix); "+
   "FUENTE B = Biblioteca virtual (documentación clínica interna); "+
   "FUENTE C = Europe PMC (evidencia científica publicada, acceso abierto); "+
   "FUENTE D = PubMed + Crossref (literatura científica, 140M+ artículos); "+
   "FUENTE F = NICE (guías oficiales del National Institute for Health and Care Excellence, recuperadas directamente de su API); "+
   "FUENTE G = SNOMED CT Edición Española (candidatos de terminología clínica oficial con su código de concepto). "+
   "Si entre los resultados de PubMed aparecen guías de organismos reconocidos (ESC, ERC, JBI u otros), destácalas, "+
   "pero no las presentes como si fueran un repositorio propio integrado. "+
   "Cuando haya guías NICE disponibles en la FUENTE F, cítalas con su título y URL oficial. "+
   "Cuando la FUENTE G incluya un candidato cuyo término coincida EXACTAMENTE (mismas palabras, sin diferencias) con el "+
   "término clínico principal de la pregunta, puedes mencionar su código una vez de forma natural: nombre del término "+
   "(SNOMED CT: código). Si ningún candidato coincide con exactitud, NO cites ningún código SNOMED aunque los candidatos "+
   "sean parecidos o relacionados: es preferible omitirlo a citar un código que no corresponde exactamente. "+
   "Integra la evidencia de TODAS las fuentes recuperadas para elaborar respuestas rigurosas con base científica. "+
   "Puedes combinar fuentes para razonar, pero conserva la procedencia y señala las discrepancias entre ellas cuando existan. "+
   "No inventes datos, bibliografía, dosis, concentraciones ni protocolos; las dosis deben marcarse para verificación "+
   "institucional/farmacéutica. "+
   "CITACIÓN Y REFERENCIAS (estilo OpenEvidence): cita cada afirmación clínica relevante con un número entre corchetes "+
   "[1], [2]… USANDO EXACTAMENTE los números del bloque 'REFERENCIAS DISPONIBLES' que se te adjunta en el contexto. "+
   "No inventes números que no estén en esa lista ni cites fuentes que no aparezcan en ella. Puedes agrupar varias citas "+
   "como [1, 3] o [2-4]. Coloca la cita justo después de la afirmación que la respalda. "+
   "NO escribas al final una lista de referencias ni una bibliografía: la aplicación añade automáticamente la lista "+
   "numerada de referencias debajo de tu respuesta, así que termina el texto sin listarlas. "+
   "IMPORTANTE sobre las fuentes internas: NO ensucies el texto repitiendo '(ficha validada de Enferix)', "+
   "'(guía clínica de Enferix)' ni '(biblioteca virtual de Enferix)' después de cada frase. No etiquetes las afirmaciones "+
   "internas; simplemente redáctalas con naturalidad. Reserva las citas para la evidencia externa con [n]. "+
   "Solo si la pregunta involucra un fármaco concreto, puedes indicar UNA vez que los datos proceden de la ficha técnica "+
   "de CIMA-AEMPS. "+
   "ESTRUCTURA (estilo OpenEvidence — respuesta directa, sintetizada y citada): "+
   "1) EMPIEZA SIEMPRE con una RESPUESTA DIRECTA a la pregunta en la primera línea, en negrita. Si la pregunta admite "+
   "sí/no, empieza literalmente por '**Sí,**', '**No,**' o '**Depende:**' seguido de la idea principal en una o dos frases. "+
   "Si es una pregunta abierta (una patología, un fármaco), abre con una frase-tesis en negrita que resuma lo esencial. "+
   "2) A continuación, desarrolla una NARRATIVA COMPLETA Y RIGUROSA, con la profundidad clínica que el tema requiera "+
   "(no te quedes corta: cubre a fondo diagnóstico/criterios, fisiopatología relevante, manejo por pilares con dosis y "+
   "objetivos, monitorización y cuidados de enfermería, complicaciones y consideraciones especiales cuando apliquen). "+
   "Sintetiza integrando la evidencia recuperada -no copies extractos sueltos- y pon una CITA [n] al final de cada "+
   "afirmación relevante. Usa subtítulos temáticos (p. ej. Diagnóstico, Tratamiento, Monitorización y enfermería) y "+
   "viñetas cuando aporten claridad; el objetivo es una respuesta tan útil y detallada como una consulta profesional, "+
   "pero siempre abierta con la respuesta directa y cerrada con el resumen. "+
   "FORMATO COMPACTO: NO uses líneas separadoras ni reglas horizontales ('---', '***', '___') en ningún caso. "+
   "No dejes líneas en blanco de más entre párrafos; escribe el texto seguido y denso, con los subtítulos pegados a su "+
   "contenido. Prefiere párrafos completos a listas fragmentadas de una línea. "+
   "3) TERMINA SIEMPRE con una línea que empiece por '**En resumen,**' y condense la conclusión práctica en 1-2 frases. "+
   "NO añadas después una lista de referencias (la aplicación la agrega automáticamente). "+
   "Varía la redacción entre respuestas; no repitas la misma plantilla palabra por palabra. "+
   "Ante un caso clínico concreto (paciente, urgencia, escenario) mantén el mismo espíritu directo pero prioriza: valoración "+
   "inmediata (ABCDE si hay riesgo vital), datos relevantes y faltantes, señales de alarma, actuaciones priorizadas, "+
   "cuidados y monitorización de enfermería, e incertidumbres; adáptalo sin forzar apartados que no apliquen. "+
   "Para preguntas breves y muy concretas (una dosis, un dato) responde en 1-3 frases directas con su cita, sin más. "+
   "Para proyectos, redacción o dudas no clínicas responde como asistente general experto. "+
   "Sé conciso y clínico: evita relleno y evita respuestas de solo bullets sin hilo. Si detectas una emergencia vital, "+
   "prioriza el manejo inmediato e indica cuándo una recomendación es de bajo nivel de evidencia o consenso. "+
   "No menciones Hospital Joan XXIII, Hospital Juan XXIII ni HJ23 salvo petición expresa. "+
   "La aplicación es educativa y no sustituye el juicio profesional ni los protocolos locales vigentes.";
  var ctx='';
  if(guideCtx)ctx+='## FUENTE A · GUÍAS CLÍNICAS Y VADEMÉCUM\n'+guideCtx;
  if(libraryCtx)ctx+=(ctx?'\n\n':'')+'## FUENTE B · BIBLIOTECA VIRTUAL\n'+libraryCtx;
  if(pmcCtx)ctx+=(ctx?'\n\n':'')+'## FUENTE C · EUROPE PMC (EVIDENCIA CIENTÍFICA)\n'+pmcCtx;
  if(litCtx)ctx+=(ctx?'\n\n':'')+'## FUENTE D · PUBMED + CROSSREF (LITERATURA CIENTÍFICA)\n'+litCtx;
  if(guidelineCtx)ctx+=(ctx?'\n\n':'')+'## RESULTADOS DE PUBMED FILTRADOS POR GUÍAS CLÍNICAS INTERNACIONALES\n'+guidelineCtx;
  if(niceCtx)ctx+=(ctx?'\n\n':'')+'## FUENTE F · NICE (GUÍAS OFICIALES)\n'+niceCtx;
  if(snomedCtx)ctx+=(ctx?'\n\n':'')+'## FUENTE G · SNOMED CT (EDICIÓN ESPAÑOLA, CANDIDATOS)\n'+snomedCtx;
  if(nearbyCtx)ctx+=(ctx?'\n\n':'')+'## SERVICIOS SANITARIOS CERCANOS AL USUARIO (ubicación compartida por el propio usuario)\n'+nearbyCtx;
  var refsBlock=refsContextBlock(window.__v20Refs||[]);
  if(refsBlock)ctx+=(ctx?'\n\n':'')+refsBlock;
  var prompt=routePrompt(route);
  if(memory)prompt+='[MEMORIA TEMPORAL DEL CASO — no contiene nombres ni identificadores]\n'+memory+'\n[FIN MEMORIA]\n\n';
  if(ctx)prompt+='[CONTEXTO INTERNO RECUPERADO]\n'+ctx+'\n[FIN CONTEXTO]\n\n';
  if(att)prompt+=mediaInstruction(att,userText)+'\n\n';
  if(att&&att.kind==='text')prompt+='[DOCUMENTO ADJUNTO: '+att.name+']\n'+att.text.slice(0,12000)+'\n\n';
  prompt+=userText||(att?'Analiza el archivo adjunto siguiendo la estructura indicada.':'');
  if(!backend&&!key)return Promise.resolve(buildLocalAnswer(userText,window.__v20GuideSources||[],window.__v20LibrarySources||[],route));
  if(backend){
   updateConn('backend');
   // El servidor (searchAllSources) ya busca en paralelo PubMed/Crossref/NICE/FDA/etc.
   // sources.references ya llega del backend numerada [1..n] en el MISMO orden que se
   // usó en el prompt de Gemini (assembleContext), así que aquí solo se indexa tal
   // cual: no se reconstruye ni se filtra por relevancia, para que los números [n]
   // que cite el modelo coincidan siempre con esta lista.
   function applyBackendSources(sources){
    var refs=(sources&&sources.references)||[];
    var numbered=[];
    refs.forEach(function(r){
     numbered[r.n-1]={n:r.n,title:r.title||'',url:r.url||'',meta:(r.journal||r.source||'')+(r.year?' · '+r.year:''),type:r.type||'',journal:r.journal||r.source||'',year:r.year||''};
    });
    window.__v20Refs=numbered;
    window.__v20OrchestratorSources=numbered.filter(Boolean).map(function(r){return{type:r.type,title:r.title,id:r.url,meta:r.meta};});
    window.__v20LiteratureSources=[];window.__v20GuidelineSources=[];window.__v20PmcSources=[];window.__v20NiceSources=[];
   }
   var backendPayload={
    question:userText,context:{guides:guideCtx||'',library:libraryCtx||'',pmc:pmcCtx||'',literature:(litCtx||'')+(refsBlock?'\n\n'+refsBlock:''),guidelines:guidelineCtx||'',nice:niceCtx||'',snomed:snomedCtx||'',refs:refsBlock||'',nearby:nearbyCtx||''},history:hist.slice(-10),caseMemory:caseMemory.slice(-6),route:route||{},
    attachment:att?{kind:att.kind,mime:att.mime,name:att.name,data:att.data||'',text:att.text||'',mediaType:inferMediaType(att,userText)}:null,
    // Coordenadas para la herramienta centros_cercanos del servidor. Solo van
    // si el permiso de ubicación ya estaba concedido (EnferixNearby.getCoords).
    ubicacion:ubicacion||null
   };
   function callBackendNonStreaming(){
    return fetch(backend+'/api/javny/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(backendPayload)}).then(function(res){return res.json().catch(function(){return {}}).then(function(data){
     if(!res.ok)throw new Error(data.error||data.message||('HTTP '+res.status));
     applyBackendSources(data.sources);
     var ans=(data.answer||data.text||'').trim();
     if(!ans)throw new Error('El servidor devolvió una respuesta vacía. Revisa los registros de Render y la variable GEMINI_API_KEY.');
     return ans;
    })});
   }
   function callBackendStreaming(){
    return fetch(backend+'/api/javny/chat/stream',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(backendPayload)}).then(function(res){
     if(!res.ok||!res.body)throw new Error('HTTP '+res.status);
     var reader=res.body.getReader(),decoder=new TextDecoder('utf-8'),buf='',finalAnswer=null,gotSources=false,acumulado='';
     function processLine(line){
      line=line.trim();if(!line)return;
      var evt;try{evt=JSON.parse(line);}catch(e){return;}
      if(evt.type==='sources'){applyBackendSources(evt.sources);gotSources=true;}
      else if(evt.type==='delta'){acumulado+=(evt.chunk||'');if(onDelta)onDelta(acumulado);}
      else if(evt.type==='herramienta'){try{p36ToolNote(evt)}catch(e){}}
      else if(evt.type==='enlaces'){window.__p36Enlaces=evt.enlaces||[];}
      else if(evt.type==='done'){if(!gotSources)applyBackendSources(evt.sources);finalAnswer=(evt.answer||'').trim();}
      else if(evt.type==='error'){var se=new Error(evt.error||'Error del servidor');se.javnyServerError=true;throw se;}
     }
     function pump(){
      return reader.read().then(function(chunk){
       if(chunk.done){
        var rest=buf.trim();if(rest)processLine(rest);
        if(finalAnswer===null)throw new Error('Streaming interrumpido sin respuesta');
        if(!finalAnswer){var ve=new Error('El servidor terminó la respuesta sin texto. Revisa los registros de Render y la variable GEMINI_API_KEY.');ve.javnyServerError=true;throw ve;}
        return finalAnswer;
       }
       buf+=decoder.decode(chunk.value,{stream:true});
       var lines=buf.split('\n');buf=lines.pop();
       for(var i=0;i<lines.length;i++)processLine(lines[i]);
       return pump();
      });
     }
     return pump();
    });
   }
   if(!att&&typeof onDelta==='function'){
    return callBackendStreaming().catch(function(err){
     // Si el servidor ya nos dijo POR QUÉ falló, propagamos ese motivo tal cual.
     // Reintentar sin streaming repetiría toda la orquestación (7 búsquedas de
     // evidencia + Gemini) para acabar en el mismo error: duplica la espera y
     // deja al usuario mirando un chat en blanco en vez del motivo real.
     // El reintento se reserva para fallos de transporte (proxy que corta el
     // streaming, 502, etc.), donde la vía no-streaming sí puede funcionar.
     if(err&&err.javnyServerError)throw err;
     return callBackendNonStreaming();
    });
   }
   return callBackendNonStreaming();
  }
  updateConn('direct');
  var contents=[];
  hist.slice(-10).forEach(function(m){contents.push({role:m.role==='user'?'user':'model',parts:[{text:m.content}]})});
  var parts=[{text:prompt}];
  var hasMedia=att&&(att.kind==='image'||att.kind==='pdf');
  if(hasMedia)parts.push({inlineData:{mimeType:att.mime,data:att.data}});
  contents.push({role:'user',parts:parts});
  function callDirectNonStreaming(){
   var body={systemInstruction:{parts:[{text:sys}]},contents:contents,generationConfig:{temperature:0.18,maxOutputTokens:8192}};
   var url='https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent?key='+encodeURIComponent(key);
   return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(res){
    return res.json().catch(function(){return {}}).then(function(data){
     if(!res.ok)throw new Error(data&&data.error&&data.error.message?data.error.message:('Error '+res.status));
     var c=data.candidates&&data.candidates[0];
     if(data&&data.promptFeedback&&data.promptFeedback.blockReason)throw new Error('Gemini bloqueó la respuesta por seguridad de contenido ('+data.promptFeedback.blockReason+'). Reformula la pregunta.');
     if(!c||!c.content||!c.content.parts)throw new Error('Respuesta vacía del modelo');
     var dt=c.content.parts.map(function(p){return p.text||''}).join('').trim();
     if(!dt)throw new Error('Gemini devolvió una respuesta vacía'+(c.finishReason?' (motivo: '+c.finishReason+')':'')+'. Revisa la clave y el modelo en Ajustes.');
     return dt;
    });
   });
  }
  if(!hasMedia&&typeof onDelta==='function'){
   return streamGeminiDirect(sys,contents,key,onDelta).catch(function(){ return callDirectNonStreaming(); });
  }
  return callDirectNonStreaming();
 }
 async function send(){
  var text=ta.value.trim();if(!text&&!attachment)return;pauseVoiceInput();voiceBusy=voiceSession;
  var att=attachment,um={role:'user',content:text};if(att)um.att={kind:att.kind,mime:att.mime,data:att.data,name:att.name,mediaType:inferMediaType(att,text)};
  messages.push(um);attachment=null;showAtt();ta.value='';resize();upd();
  if(text){
   caseMemory.push(sanitizeCaseText(text));
   caseMemory=caseMemory.slice(-8);saveCase();
  }
  if(messages.length===1)chat.innerHTML='';
  rmsg(um);chat.scrollTop=chat.scrollHeight;
  var algMatch=maybeAlgBubble(text);
  var spokenAlg=false;
  if(algMatch&&(voiceSession||autoVoice)&&connectionMode()!=='local'){
   spokenAlg=true;voiceBusy=true;
   speak(algSpeechText(algMatch),function(){voiceBusy=false;if(voiceSession)scheduleVoiceRestart(500)});
  }
  var typ=document.createElement('div');typ.className='cc-typing';typ.innerHTML='<span></span><span></span><span></span>';chat.appendChild(typ);chat.scrollTop=chat.scrollHeight;
  var route=routeQuestion(text||'',att);var snapshot=caseSnapshot(text||'',route);window.__v21LastQuestion=text||'';
  var gd=retrieveDetailed(text||''),guideCtx=gd.context||'',libraryCtx='',pmcCtx='',litCtx='',guidelineCtx='',niceCtx='',snomedCtx='';
  try{if(typeof window.EnferixLibraryRetrieve==='function')libraryCtx=window.EnferixLibraryRetrieve(text||'',8)||''}catch(e){}
  var _mode=connectionMode();
  if(_mode==='backend'){
   /* El servidor (searchAllSources) ya busca en PubMed/Crossref/NICE/guías EN PARALELO
      antes de llamar a Gemini; repetir esas 4 búsquedas aquí solo añadía espera sin
      aportar nada (el servidor las ignoraba). Se dejan vacías: call() reconstruye las
      referencias a partir de lo que devuelve el propio backend. */
   window.__v20PmcSources=[];window.__v20LiteratureSources=[];window.__v20GuidelineSources=[];window.__v20NiceSources=[];window.__v20SnomedSources=[];
  } else {
   var _r=await Promise.all([
    withTimeout(pmcRetrieve(text||'',8).catch(function(){return '';}),7000),
    withTimeout(literatureRetrieve(text||'',8).catch(function(){return '';}),7000),
    withTimeout(guidelineRetrieve(text||'',6).catch(function(){return '';}),7000),
    withTimeout(niceRetrieve(text||'',6).catch(function(){return '';}),7000),
    withTimeout(snomedRetrieve(text||'',6).catch(function(){return '';}),7000)
   ]);
   pmcCtx=_r[0]||'';litCtx=_r[1]||'';guidelineCtx=_r[2]||'';niceCtx=_r[3]||'';snomedCtx=_r[4]||'';
  }
  var librarySources=parseLibrarySources(libraryCtx);
  window.__v20GuideSources=gd.sources||[];window.__v20LibrarySources=librarySources;
  window.__v20OrchestratorSources=[];
  var allSources=(gd.sources||[]).concat(librarySources).concat(window.__v20LiteratureSources||[]).concat(window.__v20PmcSources||[]).concat(window.__v20GuidelineSources||[]).concat(window.__v20NiceSources||[]).concat(window.__v20SnomedSources||[]);
  var refs=buildNumberedRefs(text); window.__v20Refs=refs;
  var streamNode=null;
  function onStreamDelta(fullText){
   if(!streamNode){
    typ.remove();
    streamNode=document.createElement('div');streamNode.className='cc-msg b cc-streaming';
    chat.appendChild(streamNode);
   }
   streamNode.textContent=fullText;chat.scrollTop=chat.scrollHeight;
  }
  var canStream=(_mode==='direct'||_mode==='backend')&&!att;
  chat.setAttribute('aria-busy','true'); // evita que el lector de pantalla anuncie cada fragmento mientras llega en streaming
  var nearbyCtx='';
  if(/hospital|urgencias?\s+(m[aá]s\s+)?cercan|\bdea\b|desfibrilador|d[oó]nde\s+puedo\s+ir|centro\s+sanitario\s+cercan/i.test(text||'')&&window.EnferixNearby&&window.EnferixNearby.getContextText){
   try{nearbyCtx=await window.EnferixNearby.getContextText()}catch(e){}
  }
  /* P36: coordenadas para la herramienta centros_cercanos del servidor. Se
     mandan en CADA consulta si el permiso ya está concedido (getCoords nunca
     pregunta), porque Javny puede necesitarlas aunque la pregunta no case con
     la regex de arriba ("¿y el DEA?" a mitad de conversación). */
  var ubicacion=null;
  if(window.EnferixNearby&&window.EnferixNearby.getCoords){
   try{ubicacion=await window.EnferixNearby.getCoords({timeoutMs:3000})}catch(e){}
  }
  window.__p36Enlaces=[];
  call(text,att,guideCtx,libraryCtx,pmcCtx,litCtx,guidelineCtx,niceCtx,snomedCtx,messages.slice(0,-1),route,canStream?onStreamDelta:null,nearbyCtx,ubicacion).then(function(reply){
   if(streamNode&&streamNode.parentNode)streamNode.parentNode.removeChild(streamNode);
   var refsNow=window.__v20Refs||refs;
   if(window.__v20OrchestratorSources&&window.__v20OrchestratorSources.length)allSources=allSources.concat(window.__v20OrchestratorSources);
   typ.remove();var bm={role:'bot',content:reply,refs:refsNow};messages.push(bm);var node=rmsg(bm);
   node.insertAdjacentHTML('beforeend',mediaResultPanel(att,text));
   /* P36: botones a las fichas/escalas que las herramientas enlazaron */
   if(window.__p36Enlaces&&window.__p36Enlaces.length){
    node.insertAdjacentHTML('beforeend',p36EnlacesPanel(window.__p36Enlaces));
    p36AttachEnlaces(node);
   }
   node.insertAdjacentHTML('beforeend',renderRefsPanel(refsNow));
   node.insertAdjacentHTML('beforeend',casePanel(snapshot));
   node.insertAdjacentHTML('beforeend',actionPanel(route));
   var localCheck=localVerify(reply,text,route,allSources,snapshot);
   var verifyId='v22verify-'+Date.now()+'-'+Math.floor(Math.random()*1000);
   node.insertAdjacentHTML('beforeend','<div id="'+verifyId+'">'+verificationHTML(localCheck,verifyEnabled&&connectionMode()!=='local')+'</div>');
   if(caseMemory.length)node.insertAdjacentHTML('beforeend','<div class="v20-case-strip">🧠 Memoria temporal del caso activa: '+caseMemory.length+' aportaciones. Pulsa 🧠 para revisarla o 🧹 para borrarla.</div>');
   if(connectionMode()==='local')node.insertAdjacentHTML('beforeend','<div class="v20-mode-note">Javny está en modo local: recupera y abre información, pero no genera una síntesis clínica nueva.</div>');
   attachActionEvents(node,route);attachSourceEvents(node);chat.scrollTop=chat.scrollHeight;jset(CHATK,messages);updateConn();
   chat.setAttribute('aria-busy','false');
   v31Save(text,reply,allSources);
   if(spokenAlg){
    /* La lectura del algoritmo ya gestiona la voz y el reinicio de la escucha */
   }else if(voiceSession&&handsFree&&connectionMode()!=='local'){
    speak(reply,function(){voiceBusy=false;scheduleVoiceRestart(500)});
   }else{
    voiceBusy=false;
    if(autoVoice&&connectionMode()!=='local')speak(reply);
    else if(voiceSession)scheduleVoiceRestart(450);
   }
   if(verifyEnabled&&connectionMode()!=='local')remoteVerify(reply,text,route,allSources,localCheck).then(function(v){var host=document.getElementById(verifyId);if(host)host.innerHTML=verificationHTML(v,false)});
  }).catch(function(err){
   if(streamNode&&streamNode.parentNode)streamNode.parentNode.removeChild(streamNode);
   typ.remove();updateConn('error');chat.setAttribute('aria-busy','false');var bm={role:'bot',content:'⚠️ No he podido completar la consulta: '+err.message+'\n\nPuedes seguir utilizando la recuperación local de Guías clínicas, Biblioteca virtual y herramientas.'};messages.push(bm);var node=rmsg(bm);node.insertAdjacentHTML('beforeend',casePanel(snapshot));node.insertAdjacentHTML('beforeend',actionPanel(route));node.insertAdjacentHTML('beforeend',verificationHTML(localVerify(bm.content,text,route,allSources,snapshot),false));attachActionEvents(node,route);attachSourceEvents(node);jset(CHATK,messages);voiceBusy=false;if(voiceSession)scheduleVoiceRestart(700);
  });
 }

 /* ---- abrir/cerrar chat ---- */
 var releaseChatFocusTrap=null;
 function showChat(){q('#ccWrap').classList.remove('hide');q('#ccFab').classList.remove('on');lset(OPENK,'1');if(releaseChatFocusTrap)releaseChatFocusTrap();releaseChatFocusTrap=window.EnferixFocusTrap(q('#ccWrap'),{initialFocus:q('#ccTa')});}
 function hideChat(){if(voiceSession)stopVoiceSession();q('#ccWrap').classList.add('hide');q('#ccFab').classList.add('on');lset(OPENK,'0');if(releaseChatFocusTrap){releaseChatFocusTrap();releaseChatFocusTrap=null;}}
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!q('#ccWrap').classList.contains('hide'))hideChat()});
 q('#ccGuide').onclick=hideChat;
 q('#ccFab').onclick=showChat;
 q('#ccNew').onclick=function(){ if(messages.length&&!confirm('¿Empezar una conversación nueva? Se borrará la actual.'))return; messages=[];jset(CHATK,messages);paint(); };

 /* ---- ajustes ---- */
 function openSet(){q('#ccKey').value=lget(KEYK,'');q('#v20Backend').value=lget(BACKENDK,'');q('#ccVoiceSw').classList.toggle('on',autoVoice);q('#v22VerifySw').classList.toggle('on',verifyEnabled);q('#v23HandsFreeSw').classList.toggle('on',handsFree);q('#v23WakeSw').classList.toggle('on',requireWake);q('#ccSetModal').classList.add('on');var r=q('#v20TestResult');if(r){r.className='v20-test-result';r.textContent=''}}
 q('#ccSet').onclick=openSet;
 q('#ccSetBg').onclick=function(){q('#ccSetModal').classList.remove('on')};
 q('#ccVoiceSw').onclick=function(){q('#ccVoiceSw').classList.toggle('on')};
 q('#v22VerifySw').onclick=function(){q('#v22VerifySw').classList.toggle('on')};
 q('#v23HandsFreeSw').onclick=function(){q('#v23HandsFreeSw').classList.toggle('on')};
 q('#v23WakeSw').onclick=function(){q('#v23WakeSw').classList.toggle('on')};
 q('#ccSave').onclick=function(){ lset(KEYK,q('#ccKey').value.trim());lset(BACKENDK,q('#v20Backend').value.trim());autoVoice=q('#ccVoiceSw').classList.contains('on');verifyEnabled=q('#v22VerifySw').classList.contains('on');handsFree=q('#v23HandsFreeSw').classList.contains('on');requireWake=q('#v23WakeSw').classList.contains('on');lset(VOICEK,autoVoice?'1':'0');lset(VERIFYK,verifyEnabled?'1':'0');lset(HANDSFREEK,handsFree?'1':'0');lset(WAKEK,requireWake?'1':'0');q('#ccSetModal').classList.remove('on');updateConn();toastc('Ajustes de Javny Voz + Imagen guardados');
  if(typeof checkApiKeyUI==='function'){try{checkApiKeyUI()}catch(e){}} };
 q('#v20Test').onclick=function(){
  var out=q('#v20TestResult'),backend=(q('#v20Backend').value||'').trim().replace(/\/$/,'');
  out.className='v20-test-result on';out.textContent='Probando conexión…';
  if(backend){
   fetch(backend+'/api/health').then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||('HTTP '+r.status));return d})})
    .then(function(d){out.textContent='✅ Backend disponible'+(d.model?' · '+d.model:'');updateConn('backend')})
    .catch(function(e){out.textContent='❌ No se pudo conectar con el backend: '+e.message;updateConn('error')});
  }else if((q('#ccKey').value||'').trim()){
   out.textContent='✅ Clave presente. La validación completa se realizará al enviar una consulta.';updateConn('direct');
  }else{out.textContent='ℹ️ Sin backend ni clave: Javny funcionará en modo local.';updateConn('local')}
 };
 q('#v20Case').onclick=function(){
  if(caseMemory.length&&!confirm('¿Cerrar el caso y borrar su memoria temporal?'))return;
  caseMemory=[];saveCase();toastc('Memoria temporal del caso eliminada');
 };
 q('#v22Memory').onclick=function(){renderMemory();q('#v22MemoryModal').classList.add('on')};
 q('#v22MemoryBg').onclick=function(){q('#v22MemoryModal').classList.remove('on')};
 q('#v22MemoryClose').onclick=function(){q('#v22MemoryModal').classList.remove('on')};
 q('#v22MemoryClear').onclick=function(){
  if(caseMemory.length&&!confirm('¿Borrar toda la memoria temporal del caso?'))return;
  caseMemory=[];saveCase();renderMemory();toastc('Memoria temporal eliminada');
 };

 function toastc(m){ if(typeof toast==='function'){try{toast(m);return}catch(e){}} }

 /* ---- SW offline (opcional) ---- */
 if('serviceWorker' in navigator){try{var sw="self.addEventListener('install',function(e){self.skipWaiting()});self.addEventListener('activate',function(e){self.clients.claim()});self.addEventListener('fetch',function(e){e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request)}))});";var bl=new Blob([sw],{type:'text/javascript'});navigator.serviceWorker.register('/sw.js').catch(function(){})}catch(e){}}

 /* ---- init ---- */
 paint();
 updateConn();
 hideChat(); /* v30: la pantalla de inicio es siempre la guía limpia */
 /* P2.1: aviso "Pulsa ⚙ para añadir tu clave de Gemini" retirado del
    contenido; la configuración vive únicamente dentro del panel de
    Ajustes, donde el campo de la clave ya se ve al abrirlo. */
})();

/* ==== Service Worker inline (cache offline básico) ==== */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  const swCode = `
    const CACHE = 'hj23-v7';
    self.addEventListener('install', e => { self.skipWaiting(); });
    self.addEventListener('activate', e => {
      e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
          .then(() => self.clients.claim())
      );
    });
    self.addEventListener('fetch', e => {
      const req = e.request;
      if(req.method !== 'GET') return;
      e.respondWith(
        fetch(req).then(res => {
          if(res && res.status === 200 && res.type === 'basic'){
            caches.open(CACHE).then(cache => cache.put(req, res.clone()));
          }
          return res;
        }).catch(() => caches.open(CACHE).then(cache => cache.match(req)))
      );
    });
  `;
  try{
    const blob = new Blob([swCode], {type:'application/javascript'});
    const url = URL.createObjectURL(blob);
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }catch(e){}
}


/* ============================================================================
   FASE 2 — CALCULADORAS + PERFUSIONES
   ============================================================================ */

/* ============================================================================
   CALCULADORAS CLÍNICAS HJ23 — Fase 2
   Sistema de calculadoras reutilizables con historial y widget de perfusiones.
   ============================================================================ */

/* ---------- FIN del bloque previo a datos clínicos ---------- */
