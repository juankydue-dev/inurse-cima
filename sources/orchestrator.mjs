import { requestJSON } from "../cache.mjs";
import { searchPubMed } from "./pubmed.mjs";
import { searchCrossref } from "./crossref.mjs";
import { searchEuropePMC } from "./europepmc.mjs";
import { searchNICE } from "./nice.mjs";
import { searchOpenFDA } from "./openfda.mjs";
import { searchClinicalTrials } from "./clinicaltrials.mjs";
import { searchSemanticScholar } from "./semanticscholar.mjs";
import { searchWHO } from "./who.mjs";
import { searchCIMA } from "./cima.mjs";
import { SYSTEM_PROMPT } from "./guion-clinico.mjs";
import { streamAnthropicCall, anthropicDisponible, ANTHROPIC_MODEL } from "./anthropic.mjs";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
// GEMINI_BASE_URL solo se usa para levantar un doble local de la API en pruebas
// (ver docs/pruebas-streaming.md). En Render no está definida y se usa Google.
const GEMINI_BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/models";

// Presupuesto por fuente en la fase de búsqueda. Las búsquedas ya se lanzan en
// paralelo, pero la redacción no empieza hasta que responde la ÚLTIMA: sin tope,
// una sola fuente lenta (hasta 18s en httpRequest) retrasa toda la respuesta.
// Al agotarse, esa fuente se descarta y se redacta con las que sí llegaron.
// Tope por fuente. Deliberadamente MENOR que la espera global de abajo: si
// fueran iguales, ambas carreras terminaban a la vez y la fase de búsqueda se
// daba por buena justo cuando en realidad había expirado, informando "a tiempo"
// con cero referencias.
const SOURCE_BUDGET_MS = Number(process.env.SOURCE_BUDGET_MS || 2500);

// Espera máxima de la fase de búsqueda antes de empezar a redactar. Medido en
// producción, las fuentes externas responden sobre los 950 ms, así que este tope
// casi nunca se agota: se paga ~1 s a cambio de que la respuesta salga citada con
// bibliografía. Si se agota, se redacta solo con las fichas y se dice en el texto.
const WAIT_SOURCES_MS = Number(process.env.WAIT_SOURCES_MS || 3000);


const MEDICAL_TERMS = {
  "parada cardiorrespiratoria": "cardiac arrest resuscitation",
  "pcr": "cardiac arrest CPR",
  "rcp": "cardiopulmonary resuscitation",
  "infarto": "myocardial infarction STEMI",
  "ictus": "stroke cerebrovascular",
  "neumotorax": "pneumothorax",
  "sepsis": "sepsis septic shock management",
  "shock": "shock hemodynamic management",
  "arritmia": "arrhythmia cardiac rhythm",
  "taquicardia": "tachycardia SVT management",
  "bradicardia": "bradycardia management pacing",
  "insuficiencia cardiaca": "heart failure management",
  "edema pulmonar": "pulmonary edema acute",
  "tromboembolismo": "thromboembolism pulmonary embolism",
  "tep": "pulmonary embolism PE",
  "tvp": "deep vein thrombosis DVT",
  "hemorragia": "hemorrhage bleeding management",
  "intubacion": "intubation airway management",
  "ventilacion mecanica": "mechanical ventilation",
  "sedacion": "sedation analgesia ICU",
  "dolor": "pain management analgesia",
  "quemadura": "burn management",
  "traumatismo": "trauma management",
  "diabetes": "diabetes mellitus management",
  "hipoglucemia": "hypoglycemia management",
  "cetoacidosis": "diabetic ketoacidosis DKA",
  "hipertension": "hypertension management",
  "crisis hipertensiva": "hypertensive crisis emergency",
  "anafilaxia": "anaphylaxis epinephrine",
  "asma": "asthma exacerbation management",
  "epoc": "COPD exacerbation",
  "neumonia": "pneumonia treatment guidelines",
  "covid": "COVID-19 management",
  "meningitis": "meningitis management",
  "convulsion": "seizure management epilepsy",
  "embarazo": "pregnancy obstetric emergency",
  "eclampsia": "preeclampsia eclampsia",
  "neonato": "neonatal resuscitation",
  "pediatria": "pediatric emergency",
  "politraumatismo": "polytrauma management",
  "fractura": "fracture management orthopedic",
  "intoxicacion": "poisoning toxicology management",
  "sobredosis": "overdose toxicology",
  "reanimacion": "resuscitation guidelines ERC",
  "cateter": "catheter central venous",
  "sonda": "catheterization nursing",
  "ulcera": "pressure ulcer wound care",
  "herida": "wound management nursing",
  "transfusion": "blood transfusion",
  "antibiotico": "antibiotic therapy guidelines",
  "farmaco": "pharmacology drug therapy",
  "dosis": "drug dosing guidelines",
  "perfusion": "infusion pump dosing",
  "electrocardiograma": "electrocardiogram ECG interpretation",
  "ecg": "ECG interpretation cardiology",
  "gasometria": "arterial blood gas ABG",
  "analitica": "laboratory tests clinical",
  "enfermeria": "nursing care clinical",
  "cuidados": "nursing interventions",
  "protocolo": "clinical protocol guideline",
  "guia": "clinical practice guideline"
};

function normalize(text) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function generateQueries(question, editoriales = []) {
  const norm = normalize(question);
  const queries = [];

  // Términos editoriales de las fichas recuperadas (evidenceQuery): ya vienen en
  // el inglés con el que está indexada la literatura, así que van por delante del
  // diccionario. Sin ellos, una pregunta cuyo término clínico no esté en
  // MEDICAL_TERMS se buscaba en castellano contra bases en inglés y volvía vacía.
  // Como mucho dos: el tercer hueco queda libre para el diccionario o para la
  // propia pregunta, que siguen cubriendo lo que las fichas no recuperen.
  for (const term of editoriales.slice(0, 2)) {
    const t = String(term || "").trim();
    if (t) queries.push(t);
  }

  for (const [es, en] of Object.entries(MEDICAL_TERMS)) {
    if (norm.includes(normalize(es))) {
      queries.push(en);
    }
  }

  const words = norm.split(" ").filter(w => w.length > 3);
  if (words.length > 0) {
    queries.push(words.join(" "));
  }

  if (queries.length === 0) {
    queries.push(norm);
  }

  return [...new Set(queries)].slice(0, 3);
}

const DRUG_KEYWORDS = new Set([
  "farmaco", "medicamento", "dosis", "posologia", "antibiotico", "analgesico",
  "antihipertensivo", "anticoagulante", "diuretico", "corticoide", "insulina",
  "perfusion", "infusion", "bolo", "via oral", "via intravenosa", "via subcutanea",
  "interaccion", "contraindicacion", "efecto adverso", "sobredosis", "antidoto"
]);

const DRUG_NAMES = {
  "paracetamol": "acetaminophen", "ibuprofeno": "ibuprofen", "amoxicilina": "amoxicillin",
  "omeprazol": "omeprazole", "metformina": "metformin", "enalapril": "enalapril",
  "losartan": "losartan", "atorvastatina": "atorvastatin", "simvastatina": "simvastatin",
  "amlodipino": "amlodipine", "furosemida": "furosemide", "hidroclorotiazida": "hydrochlorothiazide",
  "warfarina": "warfarin", "heparina": "heparin", "enoxaparina": "enoxaparin",
  "clopidogrel": "clopidogrel", "aspirina": "aspirin", "acido acetilsalicilico": "aspirin",
  "metoprolol": "metoprolol", "atenolol": "atenolol", "bisoprolol": "bisoprolol",
  "propranolol": "propranolol", "digoxina": "digoxin", "amiodarona": "amiodarone",
  "nitroglicerina": "nitroglycerin", "dopamina": "dopamine", "dobutamina": "dobutamine",
  "noradrenalina": "norepinephrine", "adrenalina": "epinephrine",
  "morfina": "morphine", "fentanilo": "fentanyl", "tramadol": "tramadol",
  "metadona": "methadone", "naloxona": "naloxone", "flumazenilo": "flumazenil",
  "midazolam": "midazolam", "diazepam": "diazepam", "lorazepam": "lorazepam",
  "propofol": "propofol", "ketamina": "ketamine", "lidocaina": "lidocaine",
  "atropina": "atropine", "adenosina": "adenosine", "verapamilo": "verapamil",
  "diltiazem": "diltiazem", "captopril": "captopril", "ramipril": "ramipril",
  "espironolactona": "spironolactone", "manitol": "mannitol",
  "dexametasona": "dexamethasone", "prednisona": "prednisone", "prednisolona": "prednisolone",
  "hidrocortisona": "hydrocortisone", "metilprednisolona": "methylprednisolone",
  "salbutamol": "albuterol", "ipratropio": "ipratropium", "budesonida": "budesonide",
  "insulina glargina": "insulin glargine", "insulina lispro": "insulin lispro",
  "metoclopramida": "metoclopramide", "ondansetron": "ondansetron",
  "ciprofloxacino": "ciprofloxacin", "levofloxacino": "levofloxacin",
  "azitromicina": "azithromycin", "claritromicina": "clarithromycin",
  "ceftriaxona": "ceftriaxone", "cefazolina": "cefazolin", "meropenem": "meropenem",
  "vancomicina": "vancomycin", "gentamicina": "gentamicin", "clindamicina": "clindamycin",
  "metronidazol": "metronidazole", "fluconazol": "fluconazole",
  "levotiroxina": "levothyroxine", "cloruro potasico": "potassium chloride",
  "bicarbonato sodico": "sodium bicarbonate", "sulfato magnesio": "magnesium sulfate",
  "gluconato calcio": "calcium gluconate", "alteplasa": "alteplase", "tenecteplasa": "tenecteplase",
  "acido tranexamico": "tranexamic acid", "fitomenadiona": "phytonadione",
  "clexane": "enoxaparin", "nolotil": "metamizole", "metamizol": "metamizole",
  "enantyum": "dexketoprofen", "dexketoprofeno": "dexketoprofen",
  "ventolin": "albuterol", "urbason": "methylprednisolone"
};

function detectDrugName(question) {
  const norm = normalize(question);
  for (const [es, en] of Object.entries(DRUG_NAMES)) {
    if (norm.includes(normalize(es))) return en;
  }
  return null;
}

function isDrugRelated(question) {
  const norm = normalize(question);
  if (detectDrugName(question)) return true;
  for (const kw of DRUG_KEYWORDS) {
    if (norm.includes(normalize(kw))) return true;
  }
  return false;
}

const GUIDELINE_ORGS = [
  '"NICE guideline" OR "National Institute for Health and Care Excellence"',
  '"ESC guideline" OR "European Society of Cardiology"',
  '"ERC guideline" OR "European Resuscitation Council"',
  '"JBI" OR "Joanna Briggs Institute"'
];

// Acota una búsqueda al presupuesto de la fase: si tarda más, se resuelve con el
// valor vacío que espera cada consumidor en vez de bloquear al resto. La promesa
// original se deja correr (su resultado llegará a la caché de cache.mjs y servirá
// a la siguiente consulta), pero ya no se espera.
function withBudget(promise, empty, ms = SOURCE_BUDGET_MS) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(empty), ms))
  ]);
}

// Igual que withBudget, pero además registra qué le pasó a esa fuente: cuánto
// tardó, cuántos resultados trajo y si acabó en ok / timeout / error. Sin esto
// sólo se sabe cuánto tardó la fase entera, que es justo lo que no permite
// distinguir "una fuente lenta" de "todas lentas" ni de "el modelo tarda".
function medir(nombre, promesa, vacio, registro, ms = SOURCE_BUDGET_MS) {
  const t0 = Date.now();
  const marca = { nombre, ms: 0, estado: "ok", count: 0, error: null };
  registro.push(marca);
  // El temporizador se dispara aunque la fuente ya haya contestado. Sin esta
  // bandera, marcaba como "timeout" (a los 5 s) fuentes que en realidad habían
  // fallado o respondido en 35 ms: el diagnóstico salía justo del revés.
  let resuelto = false;
  const cerrar = (estado, v) => {
    if (!resuelto) {
      resuelto = true;
      marca.estado = estado;
      marca.ms = Date.now() - t0;
      marca.count = Array.isArray(v?.items) ? v.items.length : (v ? 1 : 0);
    }
    return v;
  };
  const conEstado = Promise.resolve(promesa).then(
    v => cerrar("ok", v),
    e => {
      const msg = e instanceof Error ? e.message : String(e);
      const r = cerrar("error", vacio);
      if (marca.estado === "error") marca.error = msg;
      return r;
    }
  );
  return Promise.race([
    conEstado,
    new Promise(resolve => setTimeout(() => resolve(cerrar("timeout", vacio)), ms))
  ]);
}

async function searchAllSources(question, timings = [], evidenceQueries = []) {
  const queries = generateQueries(question, evidenceQueries);
  const guidelineQuery = `(${queries[0]}) AND (${GUIDELINE_ORGS.join(" OR ")})`;
  const drugName = detectDrugName(question);
  const drugRelated = isDrugRelated(question);
  // Para CIMA (mercado español) usamos el término original en castellano, no la
  // traducción a inglés de DRUG_NAMES (pensada para PubMed/OpenFDA).
  const cimaQuery = normalize(question).split(" ").filter(w => w.length > 3)[0] || queries[0];

  const vacio = { items: [] };
  const searches = [
    medir("europepmc", searchEuropePMC(queries[0], { limit: 8 }), vacio, timings),
    queries[1] ? medir("pubmed", searchPubMed(queries[1], { limit: 5 }), vacio, timings) : Promise.resolve(vacio),
    medir("crossref", searchCrossref(queries[0], { limit: 5 }), vacio, timings),
    medir("pubmed-guias", searchPubMed(guidelineQuery, { limit: 5 }), vacio, timings),
    medir("nice", searchNICE(queries[0], { limit: 5 }), vacio, timings),
    drugName ? medir("openfda", searchOpenFDA(drugName), null, timings) : Promise.resolve(null),
    medir("clinicaltrials", searchClinicalTrials(queries[0], { limit: 5 }), vacio, timings),
    medir("semanticscholar", searchSemanticScholar(queries[0], { limit: 5 }), vacio, timings),
    medir("who", searchWHO(queries[0], { limit: 5 }), vacio, timings),
    drugRelated ? medir("cima", searchCIMA(cimaQuery, { limit: 5 }), vacio, timings) : Promise.resolve(vacio)
  ];

  const [pmcResult, pubmedResult, crossrefResult, guidelineResult, niceResult, fdaResult, ctResult, scholarResult, whoResult, cimaResult] =
    await Promise.allSettled(searches);

  // ── Anclaje clínico de la consulta ──────────────────────────────────────────
  // "manejo de la hiperpotasemia" se manda a Crossref como texto libre, y
  // "manejo" es una palabra de proceso que en español devuelve manejo del maíz,
  // del suelo o de la soya. El término que identifica la consulta es el clínico
  // ("hiperpotasemia"), no el de proceso, así que se exige que el resultado lo
  // contenga —en castellano o en la traducción inglesa que ya usa el propio
  // buscador—. No es una lista de temas prohibidos: es exigir que la referencia
  // hable de lo que se ha preguntado.
  const PALABRAS_DE_PROCESO = new Set([
    "manejo", "tratamiento", "abordaje", "protocolo", "guia", "guias", "cuidados",
    "atencion", "valoracion", "control", "seguimiento", "diagnostico", "paciente",
    "pacientes", "adulto", "adultos", "clinica", "clinico", "hospitalario", "urgente",
    "management", "treatment", "care", "approach", "guideline", "guidelines",
    "patient", "patients", "clinical", "review", "study", "acute", "adult"
  ]);

  function anclasClinicas(pregunta, queriesGeneradas) {
    const anclas = new Set();
    // Términos clínicos de la propia pregunta
    for (const w of normalize(pregunta).split(" ")) {
      if (w.length > 4 && !PALABRAS_DE_PROCESO.has(w)) anclas.add(w);
    }
    // Y sus equivalentes en inglés: MEDICAL_TERMS es el mismo diccionario con el
    // que se construyen las búsquedas, así que lo que se buscó es lo que se exige.
    for (const [es, en] of Object.entries(MEDICAL_TERMS)) {
      if (normalize(pregunta).includes(normalize(es))) {
        for (const w of normalize(en).split(" ")) {
          if (w.length > 4 && !PALABRAS_DE_PROCESO.has(w)) anclas.add(w);
        }
      }
    }
    for (const q of queriesGeneradas || []) {
      for (const w of normalize(q).split(" ")) {
        if (w.length > 4 && !PALABRAS_DE_PROCESO.has(w)) anclas.add(w);
      }
    }
    return [...anclas];
  }

  const anclas = anclasClinicas(question, queries);

  // Qué fuentes necesitan el filtro, y por qué sólo ellas. Europe PMC, PubMed,
  // NICE, la OMS y ClinicalTrials indexan SÓLO literatura biomédica: lo que
  // devuelven es clínico por construcción, aunque el título no repita el término
  // de la consulta. Crossref y Semantic Scholar son generalistas —indexan todo
  // el DOI publicado, agronomía incluida—, y de ahí salieron el maíz, el suelo
  // y la soya. El criterio es esa propiedad del corpus, no una lista de temas
  // prohibidos: no envejece y no hay que mantenerla.
  const FUENTES_GENERALISTAS = new Set(["Crossref", "Semantic Scholar"]);

  function esRelevante(item, sourceLabel) {
    if (!FUENTES_GENERALISTAS.has(sourceLabel)) return true;
    if (!anclas.length) return true;   // sin anclas clínicas no se filtra nada
    const texto = normalize([item.title, item.abstract, item.journal, item.source].filter(Boolean).join(" "));
    // Se compara por raíz para cubrir la morfología ("hiperpotasemia" /
    // "hiperpotasemias"), sin cruzar idiomas: si la consulta va en castellano y
    // el artículo en inglés, el anclaje llega por la traducción que MEDICAL_TERMS
    // ya usó para BUSCAR, que es exactamente lo que se pidió a la fuente.
    return anclas.some(a => texto.includes(a.slice(0, Math.max(5, Math.min(a.length, 8)))));
  }

  const articles = [];
  const seen = new Set();
  let descartados = 0;

  function addUnique(items, sourceLabel) {
    for (const item of items || []) {
      const key = item.doi || item.pmid || item.title;
      if (!key || seen.has(key)) continue;
      if (!esRelevante(item, sourceLabel)) { descartados++; continue; }
      seen.add(key);
      articles.push({ ...item, retrievedFrom: sourceLabel });
    }
  }

  if (pmcResult.status === "fulfilled") addUnique(pmcResult.value.items, "Europe PMC");
  if (pubmedResult.status === "fulfilled") addUnique(pubmedResult.value.items, "PubMed");
  if (crossrefResult.status === "fulfilled") addUnique(crossrefResult.value.items, "Crossref");
  if (guidelineResult.status === "fulfilled") addUnique(guidelineResult.value.items, "Guías internacionales");

  const niceGuidelines = niceResult.status === "fulfilled" ? (niceResult.value?.items || []) : [];
  const fdaDrug = fdaResult.status === "fulfilled" ? fdaResult.value : null;
  const clinicalTrials = ctResult.status === "fulfilled" ? (ctResult.value?.items || []) : [];
  const semanticScholar = scholarResult.status === "fulfilled" ? (scholarResult.value?.items || []) : [];
  const whoDocuments = whoResult.status === "fulfilled" ? (whoResult.value?.items || []) : [];
  const cimaDrugs = cimaResult.status === "fulfilled" ? (cimaResult.value?.items || []) : [];

  const allSettled = [pmcResult, pubmedResult, crossrefResult, guidelineResult, niceResult, fdaResult, ctResult, scholarResult, whoResult, cimaResult];

  if (descartados) console.log(`[Orquestador] Referencias descartadas por no hablar de la consulta: ${descartados} (anclas: ${anclas.slice(0, 6).join(", ")})`);

  return {
    articles: articles.slice(0, 12),
    niceGuidelines: niceGuidelines.slice(0, 5),
    fdaDrug,
    clinicalTrials: clinicalTrials.slice(0, 3),
    semanticScholar: semanticScholar.slice(0, 3),
    whoDocuments: whoDocuments.slice(0, 3),
    cimaDrugs: cimaDrugs.slice(0, 5),
    drugDetected: drugName,
    queries,
    timings,
    errors: allSettled
      .filter(r => r.status === "rejected")
      .map(r => r.reason?.message || "Error desconocido")
  };
}

// Construye el contexto en texto plano para el prompt de Gemini Y, en paralelo, una
// lista de referencias plana con numeración GLOBAL y secuencial ([1], [2], [3]...)
// que abarca todos los tipos de fuente. Es deliberadamente la misma lista y la misma
// numeración que se envía al frontend (buildSourcesPayload) para que los números que
// Gemini use al citar ([n]) coincidan exactamente con los que el cliente enlaza.
function assembleContext(question, { articles, niceGuidelines, fdaDrug, clinicalTrials, semanticScholar, whoDocuments, cimaDrugs }, clientContext, opciones = {}) {
  let ctx = "";
  const refs = [];
  let n = 0;

  if (clientContext?.guides) {
    ctx += "--- FICHAS VALIDADAS DE iNURSE (GUÍAS CLÍNICAS Y VADEMÉCUM) ---\n";
    ctx += clientContext.guides + "\n\n";
  }

  if (clientContext?.library) {
    ctx += "--- BIBLIOTECA VIRTUAL DE iNURSE ---\n";
    ctx += clientContext.library + "\n\n";
  }

  if (clientContext?.nearby) {
    ctx += "--- SERVICIOS SANITARIOS CERCANOS AL USUARIO (OpenStreetMap, ubicación compartida por el propio usuario) ---\n";
    ctx += clientContext.nearby + "\n\n";
  }

  if (articles.length > 0) {
    ctx += "--- LITERATURA RECUPERADA (PubMed + Crossref + Guías internacionales) ---\n";
    articles.forEach(art => {
      const num = ++n;
      const authors = Array.isArray(art.authors) ? art.authors.join(", ") : (art.authors || "");
      const url = art.url || (art.doi ? `https://doi.org/${art.doi}` : "");
      refs.push({ n: num, type: "literature", title: art.title || "", authors, journal: art.journal || art.retrievedFrom || art.source || "", year: art.year || "", doi: art.doi || "", pmid: art.pmid || "", url, source: art.retrievedFrom || art.source || "" });
      ctx += `\n[${num}] ${authors}. ${art.title}. ${art.journal || ""}. ${art.year || ""}.`;
      if (art.doi) ctx += ` DOI: ${art.doi}`;
      if (art.pmid) ctx += ` PMID: ${art.pmid}`;
      ctx += `\nFuente: ${art.retrievedFrom || art.source || ""}`;
      if (art.abstract) ctx += `\nAbstract: ${String(art.abstract).slice(0, 500)}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (niceGuidelines.length > 0) {
    ctx += "--- GUÍAS NICE (National Institute for Health and Care Excellence) ---\n";
    niceGuidelines.forEach(g => {
      const num = ++n;
      const year = (String(g.date || "").match(/(20\d{2})/) || [])[1] || "";
      refs.push({ n: num, type: "guideline", title: g.title || "", journal: "NICE", year, url: g.url || "", source: "NICE" });
      ctx += `\n[${num}] ${g.title}`;
      if (g.type) ctx += ` (${g.type})`;
      if (g.date) ctx += ` — ${g.date}`;
      if (g.url) ctx += `\nURL: ${g.url}`;
      if (g.summary) ctx += `\nResumen: ${g.summary}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (cimaDrugs.length > 0) {
    ctx += "--- VADEMÉCUM OFICIAL ESPAÑOL (CIMA-AEMPS) ---\n";
    cimaDrugs.forEach(m => {
      const num = ++n;
      refs.push({ n: num, type: "drug", title: m.name || "Ficha CIMA", journal: "CIMA-AEMPS", year: "", url: m.url || "", source: "CIMA-AEMPS" });
      ctx += `\n[${num}] ${m.name}`;
      if (m.lab) ctx += ` — ${m.lab}`;
      ctx += "\n";
      if (m.active) ctx += `Principios activos: ${m.active}\n`;
      ctx += `Comercializado: ${m.commercialized ? "sí" : "no"} | Autorizado: ${m.authorized ? "sí" : "no"}\n`;
      if (m.url) ctx += `Ficha técnica: ${m.url}\n`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (fdaDrug) {
    const num = ++n;
    refs.push({ n: num, type: "drug", title: fdaDrug.brandName || fdaDrug.genericName || "Ficha FDA", journal: "OpenFDA", year: "", url: "", source: "OpenFDA" });
    ctx += "--- FICHA TÉCNICA FDA (OpenFDA Drug Label) ---\n";
    ctx += `[${num}] Fármaco: ${fdaDrug.genericName}`;
    if (fdaDrug.brandName) ctx += ` (${fdaDrug.brandName})`;
    ctx += "\n";
    if (fdaDrug.manufacturer) ctx += `Fabricante: ${fdaDrug.manufacturer} | Vía: ${fdaDrug.route || "N/D"}\n`;
    if (fdaDrug.boxedWarning) ctx += `⚠️ BLACK BOX WARNING: ${fdaDrug.boxedWarning}\n`;
    if (fdaDrug.indications) ctx += `Indicaciones: ${fdaDrug.indications}\n`;
    if (fdaDrug.dosage) ctx += `Posología: ${fdaDrug.dosage}\n`;
    if (fdaDrug.contraindications) ctx += `Contraindicaciones: ${fdaDrug.contraindications}\n`;
    if (fdaDrug.interactions) ctx += `Interacciones: ${fdaDrug.interactions}\n`;
    if (fdaDrug.adverseReactions) ctx += `Reacciones adversas: ${fdaDrug.adverseReactions}\n`;
    if (fdaDrug.specialPopulations) ctx += `Poblaciones especiales: ${fdaDrug.specialPopulations}\n`;
    ctx += "\n";
  }

  if (clinicalTrials.length > 0) {
    ctx += "--- ENSAYOS CLÍNICOS EN CURSO (ClinicalTrials.gov) ---\n";
    clinicalTrials.forEach(ct => {
      const num = ++n;
      refs.push({ n: num, type: "trial", title: `${ct.title} (${ct.nctId})`, journal: "ClinicalTrials.gov", year: ct.startDate || "", url: ct.url || "", source: "ClinicalTrials.gov" });
      ctx += `\n[${num}] ${ct.title} (${ct.nctId})`;
      if (ct.status) ctx += `\nEstado: ${ct.status}`;
      if (ct.phase) ctx += ` | Fase: ${ct.phase}`;
      if (ct.organization) ctx += `\nOrganización: ${ct.organization}`;
      if (ct.startDate) ctx += ` | Inicio: ${ct.startDate}`;
      ctx += `\nURL: ${ct.url}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (semanticScholar.length > 0) {
    ctx += "--- PAPERS ACADÉMICOS (Semantic Scholar) ---\n";
    semanticScholar.forEach(paper => {
      const num = ++n;
      const url = paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : "");
      refs.push({ n: num, type: "literature", title: paper.title || "", authors: paper.authors || "", journal: "Semantic Scholar", year: paper.year || "", doi: paper.doi || "", url, source: "Semantic Scholar" });
      ctx += `\n[${num}] ${paper.authors}. ${paper.title}. ${paper.year || ""}.`;
      if (paper.doi) ctx += ` DOI: ${paper.doi}`;
      if (paper.isOpenAccess) ctx += " [OPEN ACCESS]";
      if (paper.abstract) ctx += `\nAbstract: ${String(paper.abstract).slice(0, 400)}`;
      ctx += `\nURL: ${paper.url}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (whoDocuments.length > 0) {
    ctx += "--- DOCUMENTOS DE LA OMS (WHO IRIS) ---\n";
    whoDocuments.forEach(doc => {
      const num = ++n;
      const year = (String(doc.date || "").match(/(20\d{2})/) || [])[1] || "";
      refs.push({ n: num, type: "guideline", title: doc.title || "", journal: "OMS", year, url: doc.url || "", source: "WHO" });
      ctx += `\n[${num}] ${doc.title}`;
      if (doc.type) ctx += ` (${doc.type})`;
      if (doc.date) ctx += ` — ${doc.date}`;
      ctx += `\nURL: ${doc.url}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  // La instrucción depende de si el contexto lleva literatura numerada o no.
  // Cuando la generación arranca antes que las búsquedas externas (para no hacer
  // esperar al usuario), el modelo escribe SIN literatura delante: pedirle citas
  // [n] en ese caso es pedirle que se las invente, que es justo lo que la regla
  // férrea del proyecto prohíbe.
  // La extensión sólo se acota en la consulta de portada (opciones.conciso). El
  // chat del avatar mantiene su desarrollo largo de siempre.
  const extension = opciones.conciso
    ? `\nEXTENSIÓN: entre 2000 y 3000 caracteres. Ve al grano: nada de introducciones ni de
recapitulaciones. Prioriza lo accionable y lo que cambia la conducta clínica. El desarrollo
extenso queda para el chat, no para esta respuesta.`
    : "";

  if (n > 0) {
    ctx += `--- INSTRUCCIÓN ---
Responde la siguiente pregunta clínica combinando las dos clases de fuente de arriba:
- Las FICHAS VALIDADAS DE iNURSE/Enferix son la fuente PRIORITARIA: mandan sobre el resto
  cuando hablen del mismo punto. Cuando una afirmación salga de una ficha, dilo en el texto
  nombrándola ("según la ficha de … de Enferix").
- La literatura y las guías externas son evidencia COMPLEMENTARIA: cítalas con el número
  entre corchetes que llevan arriba: [1], [2], [3]…
Usa EXACTAMENTE esos números; no inventes ninguno ni cites uno que no exista en el contexto.
Cita en el propio texto, junto a la afirmación que respalda; no acumules las citas al final.
NO escribas una lista de referencias al final: la aplicación la añade automáticamente.
Si una fuente se contradice con otra, señálalo y prioriza la de mayor nivel de evidencia.
Si las fuentes no cubren algún aspecto, indícalo explícitamente en vez de rellenar.${extension}

PREGUNTA DEL USUARIO: ${question}`;
  } else {
    // Sin literatura en el contexto, tanto si expiró la espera como si la búsqueda
    // no trajo nada: en ambos casos el usuario tiene que saber que esta respuesta
    // no lleva bibliografía detrás, y el modelo no puede citar números.
    ctx += `--- INSTRUCCIÓN ---
Responde la siguiente pregunta clínica apoyándote ÚNICAMENTE en las fichas validadas de
Enferix y demás contexto interno que aparece arriba, más tu conocimiento clínico general.
En este contexto NO hay literatura externa recuperada, así que:
- EMPIEZA con esta línea exacta, sola, antes del resto de la respuesta:
  "Sin evidencia externa disponible en esta consulta: respuesta basada en las fichas validadas de Enferix."
- NO cites números entre corchetes ([1], [2]...): no existe ninguna lista de referencias a la
  que puedan corresponder. Inventarlos sería atribuir una afirmación a una fuente inexistente.
- Cuando una afirmación proceda de una ficha validada de Enferix, dilo con naturalidad en el
  texto, nombrando la ficha ("según la ficha de … de Enferix").
- Cuando algo NO esté cubierto por el contexto interno, dilo explícitamente en vez de rellenar.
No inventes dosis, umbrales, concentraciones ni protocolos.${extension}

PREGUNTA DEL USUARIO: ${question}`;
  }

  return { ctx, refs };
}

export async function callGemini(systemPrompt, userPrompt, { apiKey, model, history, maxOutputTokens = 8192, temperature = 0.3 } = {}) {
  if (!apiKey) throw new Error("Falta la API Key de Gemini (GEMINI_API_KEY)");

  const contents = [];
  if (history?.length) {
    for (const m of history.slice(-10)) {
      contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: userPrompt }] });

  const url = `${GEMINI_BASE}/${model || GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature, maxOutputTokens, topP: 0.8, topK: 40 }
  };

  // Una respuesta clínica completa (hasta maxOutputTokens) puede tardar más que el
  // timeout genérico de 18s de httpRequest, pensado para APIs de búsqueda rápidas.
  const data = await requestJSON(url, { method: "POST", body, ttl: 0, label: "Gemini", timeout: 55000 });

  const candidate = data?.candidates?.[0];
  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) throw new Error(`Gemini bloqueó la respuesta por seguridad de contenido (${blockReason}). Reformula la pregunta.`);
  if (!candidate) throw new Error("Gemini no devolvió ningún candidato de respuesta.");
  if (candidate.finishReason && candidate.finishReason !== "STOP" && !candidate.content?.parts?.length) {
    throw new Error(`Gemini interrumpió la respuesta sin generar texto (motivo: ${candidate.finishReason}).`);
  }
  if (!candidate.content?.parts) throw new Error("Respuesta vacía del modelo");

  const text = candidate.content.parts.map(p => p.text || "").join("").trim();
  if (!text) throw new Error("Gemini devolvió una respuesta vacía.");
  return text;
}

// Variante en streaming de callGemini: usa el endpoint SSE de Gemini con fetch()
// nativo de Node (requestJSON/httpRequest de cache.mjs bufferizan la respuesta
// completa y no sirven para ir emitiendo texto parcial).
async function streamGeminiCall(systemPrompt, userPrompt, { apiKey, model, history, maxOutputTokens = 8192, temperature = 0.3 } = {}, onDelta) {
  if (!apiKey) throw new Error("Falta la API Key de Gemini (GEMINI_API_KEY)");

  const contents = [];
  if (history?.length) {
    for (const m of history.slice(-10)) {
      contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: userPrompt }] });

  const url = `${GEMINI_BASE}/${model || GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature, maxOutputTokens, topP: 0.8, topK: 40 }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok || !res.body) {
    let errData = {};
    try { errData = await res.json(); } catch { /* respuesta de error no era JSON */ }
    throw new Error(errData?.error?.message || `Error ${res.status} llamando a Gemini`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "", full = "", blockReason = "", finishReason = "", sawCandidate = false, rawSample = "";

  // Reloj de la propia conversación con Gemini. Sirve para distinguir, sin
  // ambigüedad, "el modelo tarda en empezar" de "algo retiene los fragmentos por
  // el camino": si el primer evento SSE llega a los 24 s y el último 300 ms
  // después, el tiempo se lo ha llevado el modelo, no el transporte.
  const tLlamada = Date.now();
  let tPrimerEvento = null, tUltimoEvento = null, nEventos = 0;

  function handleEvent(jsonStr) {
    if (!jsonStr || jsonStr === "[DONE]") return;
    let evt;
    try { evt = JSON.parse(jsonStr); } catch { return; /* fragmento SSE incompleto: se completa en el siguiente trozo */ }
    if (evt?.promptFeedback?.blockReason) blockReason = evt.promptFeedback.blockReason;
    const cand = evt?.candidates?.[0];
    if (cand) {
      sawCandidate = true;
      if (cand.finishReason && cand.finishReason !== "STOP") finishReason = cand.finishReason;
      const t = cand?.content?.parts ? cand.content.parts.map(p => p.text || "").join("") : "";
      if (t) {
        nEventos++;
        if (tPrimerEvento === null) tPrimerEvento = Date.now() - tLlamada;
        tUltimoEvento = Date.now() - tLlamada;
        // Se emite el fragmento RECIÉN llegado, no el texto acumulado. `full` sólo
        // existe para devolver la respuesta entera al terminar (evento "done").
        full += t;
        if (onDelta) onDelta(t, full);
      }
    }
  }

  // Un bloque de evento SSE puede traer más de una línea (p. ej. "event: message"
  // antes de "data: ..."), así que se busca la línea "data:" DENTRO del bloque en
  // vez de exigir que el bloque entero empiece por ella — si Gemini añade líneas
  // adicionales delante, la versión anterior descartaba el evento entero en silencio.
  function processBlock(block) {
    for (const rawLine of block.split("\n")) {
      const line = rawLine.trim();
      if (line.indexOf("data:") !== 0) continue;
      handleEvent(line.replace(/^data:\s*/, "").trim());
    }
  }

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    const decoded = decoder.decode(chunk.value, { stream: true });
    if (rawSample.length < 600) rawSample += decoded;
    buf += decoded;
    const events = buf.split("\n\n");
    buf = events.pop();
    for (const raw of events) processBlock(raw);
  }
  // Último evento sin salto de línea final tras él (la conexión se cerró justo después).
  if (buf.trim()) processBlock(buf);

  console.log(`[Gemini stream] ${nEventos} fragmentos · primero a los ${tPrimerEvento ?? "n/d"} ms · último a los ${tUltimoEvento ?? "n/d"} ms · ` +
    (tPrimerEvento !== null && tUltimoEvento !== null
      ? `el modelo tardó ${tPrimerEvento} ms en empezar y ${tUltimoEvento - tPrimerEvento} ms en emitirlo todo`
      : "sin fragmentos"));

  if (!full.trim()) {
    if (blockReason) throw new Error(`Gemini bloqueó la respuesta por seguridad de contenido (${blockReason}). Reformula la pregunta.`);
    if (finishReason) throw new Error(`Gemini interrumpió la respuesta sin generar texto (motivo: ${finishReason}).`);
    if (!sawCandidate) {
      // La muestra cruda solo va al log del servidor (nunca al cliente): puede contener
      // fragmentos de la respuesta de Gemini que no conviene mostrar tal cual en la app.
      console.error("[Gemini stream] Sin candidatos. Muestra cruda:", rawSample.slice(0, 600));
      throw new Error("Gemini no devolvió ningún candidato de respuesta (posible cambio en el formato de streaming del modelo).");
    }
    throw new Error("Gemini devolvió una respuesta vacía.");
  }

  return full.trim();
}

function buildSourcesPayload(refs, { queries, errors }) {
  return {
    references: refs,
    queries,
    errors: errors.length ? errors : undefined
  };
}

async function prepareOrchestration(question, clientContext, onPhase, evidenceQueries = []) {
  const startedAt = Date.now();
  if (onPhase) onPhase({ phase: "searching" });
  const searchResults = await searchAllSources(question, [], evidenceQueries);
  const { articles, niceGuidelines, fdaDrug, cimaDrugs, drugDetected, queries, errors } = searchResults;
  console.log(`[Orquestador] Queries: ${JSON.stringify(queries)} | Artículos: ${articles.length} | NICE: ${niceGuidelines.length} | FDA: ${fdaDrug ? "sí" : "no"} | CIMA: ${cimaDrugs.length}` +
    (drugDetected ? ` | Fármaco: ${drugDetected}` : "") +
    (errors.length ? ` | Errores: ${errors.join("; ")}` : ""));

  const { ctx, refs } = assembleContext(question, searchResults, clientContext);
  if (onPhase) onPhase({ phase: "writing", sourceCount: refs.length, ms: Date.now() - startedAt });
  return {
    searchResults,
    userPrompt: ctx,
    sources: buildSourcesPayload(refs, searchResults)
  };
}

function buildSystemPrompt(caseMemory) {
  let sys = SYSTEM_PROMPT;
  if (caseMemory?.length) {
    sys += "\n\n[MEMORIA TEMPORAL DEL CASO]\n" + caseMemory.slice(-6).join("\n") + "\n[FIN MEMORIA]";
  }
  return sys;
}

export async function orchestrate({ question, context: clientContext, history, apiKey, model, caseMemory, route, attachment, evidenceQueries }) {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) {
    throw new Error("No hay API Key de Gemini configurada. Añade GEMINI_API_KEY en las variables de entorno de Render.");
  }

  const { userPrompt, sources } = await prepareOrchestration(question, clientContext, undefined, evidenceQueries || []);

  const answer = await callGemini(buildSystemPrompt(caseMemory), userPrompt, {
    apiKey: key,
    model: model || GEMINI_MODEL,
    history,
    maxOutputTokens: 8192,
    temperature: 0.3
  });

  return { answer, sources, fetchedAt: new Date().toISOString() };
}

// Variante en streaming de orchestrate(): en vez de devolver la respuesta completa
// de una vez, emite eventos vía onEvent({type,...}) a medida que están disponibles
// (fuentes en cuanto se resuelve la búsqueda, texto parcial a medida que Gemini lo
// genera, y un evento final "done"). No escribe nada en la red directamente: eso lo
// hace el llamador (server.mjs), que decide el formato de transporte (NDJSON).
export async function orchestrateStream({ question, context: clientContext, history, apiKey, model, caseMemory, route, attachment, conciso, evidenceQueries }, onEvent) {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) {
    throw new Error("No hay API Key de Gemini configurada. Añade GEMINI_API_KEY en las variables de entorno de Render.");
  }

  const t0 = Date.now();

  // ── Fuentes externas: se esperan, pero con reloj ─────────────────────────────
  // Medido en producción, responden sobre los 950 ms, así que esperarlas cuesta
  // ~1 s y a cambio la respuesta sale citada con bibliografía, que es el
  // requisito. El tope (WAIT_SOURCES_MS, 3 s) existe sólo para que una fuente
  // atascada no bloquee nunca: pasado ese tiempo se redacta con las fichas y la
  // propia respuesta lo dice en su primera línea.
  onEvent({ type: "phase", phase: "searching" });

  const timings = [];
  const busquedas = searchAllSources(question, timings).catch(err => {
    console.error("[Orquestador] Las búsquedas externas fallaron:", err instanceof Error ? err.message : err);
    return null;
  });

  const aTiempo = await Promise.race([
    busquedas,
    new Promise(resolve => setTimeout(() => resolve(undefined), WAIT_SOURCES_MS))
  ]);
  const fuentesATiempo = aTiempo !== undefined && aTiempo !== null;
  const msBusqueda = Date.now() - t0;

  const vacio = {
    articles: [], niceGuidelines: [], fdaDrug: null,
    clinicalTrials: [], semanticScholar: [], whoDocuments: [], cimaDrugs: []
  };
  const { ctx: userPrompt, refs } = assembleContext(
    question,
    fuentesATiempo ? aTiempo : vacio,
    clientContext,
    { conciso: !!conciso }
  );

  // "A tiempo" de verdad significa que hay bibliografía dentro del prompt: una
  // búsqueda que expira, o que responde sin resultados, deja al modelo escribiendo
  // sin nada que citar, y eso el panel tiene que contarlo igual.
  const conBibliografia = fuentesATiempo && refs.length > 0;

  // Las referencias que van dentro del prompt se emiten ya, para que el panel las
  // tenga listas cuando el modelo las cite en el texto.
  let sources = conBibliografia
    ? buildSourcesPayload(refs, aTiempo)
    : { references: [], queries: [], errors: undefined };
  onEvent({ type: "sources", sources, aTiempo: conBibliografia });
  onEvent({ type: "phase", phase: "writing", sourceCount: refs.length, ms: msBusqueda });

  let tPrimerFragmento = null;
  let emitidos = 0;
  const sistema = buildSystemPrompt(caseMemory);

  // Cada fragmento sale hacia el navegador en cuanto llega, venga del proveedor
  // que venga. Viaja SOLO el trozo nuevo: el texto se compone en el cliente.
  const emitir = (proveedor) => (chunk) => {
    if (tPrimerFragmento === null) {
      tPrimerFragmento = Date.now() - t0;
      console.log(`[Orquestador] Primer fragmento de ${proveedor} a los ${tPrimerFragmento} ms (búsqueda: ${msBusqueda} ms)`);
    }
    emitidos++;
    onEvent({ type: "delta", chunk });
  };

  const conGemini = () => streamGeminiCall(sistema, userPrompt, {
    apiKey: key,
    model: model || GEMINI_MODEL,
    history,
    // La portada pide una respuesta corta; el chat mantiene su desarrollo largo.
    maxOutputTokens: conciso ? 2048 : 8192,
    temperature: 0.3
  }, emitir("Gemini"));

  let answer;
  if (anthropicDisponible()) {
    try {
      answer = await streamAnthropicCall(sistema, userPrompt, {
        model: ANTHROPIC_MODEL,
        history,
        maxOutputTokens: conciso ? 2048 : 8192,
        conciso: !!conciso
      }, emitir("Claude"));
    } catch (err) {
      const motivo = err instanceof Error ? err.message : String(err);
      // El fallback sólo es limpio si Claude no llegó a escribir nada. Si ya
      // había texto en pantalla, reintentar con otro modelo lo duplicaría, así
      // que en ese caso el error sube tal cual.
      if (emitidos > 0) throw err;
      console.error(`[Orquestador] Claude falló (${motivo}); se reintenta con Gemini.`);
      onEvent({ type: "aviso", aviso: "proveedor-alternativo" });
      answer = await conGemini();
    }
  } else {
    answer = await conGemini();
  }

  // Si las fuentes llegaron tarde, se adjuntan igualmente como evidencia
  // relacionada: el texto ya avisa de que se redactó sin ellas.
  if (!conBibliografia) {
    const tardias = await busquedas;
    if (tardias) {
      const { refs: refsTardias } = assembleContext(question, tardias, clientContext);
      if (refsTardias.length) {
        sources = buildSourcesPayload(refsTardias, tardias);
        onEvent({ type: "sources", sources, aTiempo: false });
      }
    }
  }

  const total = Date.now() - t0;
  console.log(`[Orquestador] Fuentes: ${timings.map(m => `${m.nombre}=${m.estado}/${m.ms}ms/${m.count}`).join(" ") || "ninguna"}`);
  console.log(`[Orquestador] Total ${total} ms · búsqueda ${msBusqueda} ms (${conBibliografia ? "con bibliografía en el prompt" : "SIN bibliografía: redactado solo con fichas"}) · primer fragmento ${tPrimerFragmento ?? "n/d"} ms · ${sources.references.length} referencias`);

  onEvent({
    type: "done",
    answer,
    sources,
    fetchedAt: new Date().toISOString(),
    timings: { busquedaMs: msBusqueda, primerFragmentoMs: tPrimerFragmento, totalMs: total, conBibliografia, fuentes: timings }
  });
}

// Sonda de diagnóstico para /api/javny/health: hace la llamada más pequeña posible a
// Gemini y devuelve el motivo exacto si falla, en vez de propagar la excepción. Sirve
// para separar de un vistazo los tres fallos que se confunden entre sí desde la app
// (clave ausente o inválida, modelo no disponible, y cuota agotada), sin tener que
// abrir los registros del servidor.
export async function probeGemini(apiKeyArg) {
  const apiKey = apiKeyArg || process.env.GEMINI_API_KEY || "";
  const startedAt = Date.now();
  try {
    // maxOutputTokens holgado a propósito: con un tope muy bajo, un modelo que use
    // tokens de razonamiento puede terminar en MAX_TOKENS sin texto y hacer fallar
    // la sonda por un motivo que no es el que estamos buscando.
    const text = await callGemini("Responde con una sola palabra.", "Responde únicamente: OK", {
      apiKey,
      model: GEMINI_MODEL,
      maxOutputTokens: 1024,
      temperature: 0
    });
    return { ok: true, model: GEMINI_MODEL, ms: Date.now() - startedAt, sample: text.slice(0, 80) };
  } catch (err) {
    return {
      ok: false,
      model: GEMINI_MODEL,
      ms: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// Transcribe audio (base64) a texto usando Gemini. Devuelve "" si no hay voz clara.
export async function transcribeAudio(audioBase64, mimeType = "audio/wav", apiKeyArg) {
  const apiKey = apiKeyArg || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Falta la API Key de Gemini (GEMINI_API_KEY)");
  if (!audioBase64) return "";

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [{
      role: "user",
      parts: [
        { text: "Transcribe literalmente este audio de una consulta clínica hablada en español. Devuelve ÚNICAMENTE el texto transcrito, sin comillas, sin comentarios ni explicaciones. Si el audio no contiene voz clara, devuelve una cadena vacía." },
        { inlineData: { mimeType, data: audioBase64 } }
      ]
    }],
    generationConfig: { temperature: 0, maxOutputTokens: 512 }
  };

  const data = await requestJSON(url, { method: "POST", body, ttl: 0, label: "Gemini Transcribe", timeout: 45000 });
  const candidate = data?.candidates?.[0];
  if (!candidate?.content?.parts) return "";
  return candidate.content.parts.map(p => p.text || "").join("").trim();
}

export { SYSTEM_PROMPT, generateQueries, searchAllSources };
