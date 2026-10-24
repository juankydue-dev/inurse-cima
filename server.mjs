import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";
import { cacheGet, cacheSet, requestJSON, cache_obj } from "./cache.mjs";
import { searchPubMed, fetchPubMedArticle } from "./sources/pubmed.mjs";
import { searchCrossref, fetchCrossrefWork } from "./sources/crossref.mjs";
import { searchNICE } from "./sources/nice.mjs";
import { searchSnomed, snomedSnapshotMtime, snomedDataAvailable } from "./sources/snomed.mjs";
import { searchOpenFDA } from "./sources/openfda.mjs";
import { orchestrate, orchestrateStream, transcribeAudio, probeGemini, GEMINI_MODEL } from "./sources/orchestrator.mjs";
import { searchClinicalTrials } from "./sources/clinicaltrials.mjs";
import { searchSemanticScholar } from "./sources/semanticscholar.mjs";
import { searchWHO } from "./sources/who.mjs";
import { DB_ENABLED, pool, initSchema } from "./db.mjs";
import {
  registerUser, loginUser, createSession, getUserBySession, destroySession,
  parseCookies, setSessionCookie, clearSessionCookie, isSecureReq
} from "./auth.mjs";
import { validarTerminologia, invalidateNnnCache, nnnStats, nnnDictionary } from "./terminology-connector.mjs";
import { buscarCercanos } from "./sources/cercanos.mjs";
import { dondeEstoy } from "./sources/donde-estoy.mjs";
import { medicineDetail } from "./sources/cima.mjs";
import { TIPOS_DOCUMENTO, tipoValido } from "./sources/plantillas-proyectos.mjs";
import { generarEstructura } from "./sources/proyectos-ia.mjs";
import { analizarImagen, imagenDisponible } from "./sources/imagen-clinica.mjs";
import { explicarFarmaco, farmacoDisponible } from "./sources/farmaco-ia.mjs";
import { listarProyectos, crearProyecto, obtenerProyecto, actualizarProyecto, borrarProyecto } from "./proyectos-db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");
const PORT = Number(process.env.PORT || 8787);
const CIMA_BASE = (process.env.CIMA_BASE || "https://cima.aemps.es/cima/rest").replace(/\/$/, "");
const EPMC_BASE = (process.env.EPMC_BASE || "https://www.ebi.ac.uk/europepmc/webservices/rest").replace(/\/$/, "");
const cache = cache_obj;

function json(res, status, data) {
  const body = Buffer.from(JSON.stringify(data));
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(body);
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  return data?.resultados || data?.medicamentos || data?.items || data?.content || [];
}
function clean(value, max = 160) {
  return String(value || "").trim().replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, max);
}
function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ").trim();
}

// Límite de peticiones muy sencillo por IP, en memoria. Solo protege /api/javny/public/*,
// el único endpoint de Gemini alcanzable de forma anónima (sin API Key propia del
// visitante) — sin esto, cualquiera podría agotar la cuota compartida de GEMINI_API_KEY.
// No pretende ser robusto ante spoofing de IP; es una primera barrera, no la definitiva.
const rateLimitBuckets = new Map();
function rateLimited(req, { max = 12, windowMs = 10 * 60 * 1000 } = {}) {
  const ip = clean(String(req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket.remoteAddress || "unknown", 64);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip) || [];
  const recent = bucket.filter(t => now - t < windowMs);
  if (recent.length >= max) {
    rateLimitBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimitBuckets.set(ip, recent);
  return false;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 1024 * 1024) { reject(new Error("Petición demasiado grande")); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function readBodyLarge(req, maxBytes = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > maxBytes) { reject(new Error("Petición demasiado grande")); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function cima(pathname, options = {}) {
  return requestJSON(`${CIMA_BASE}/${pathname}`, { ...options, label: "CIMA" });
}
function epmc(pathname, options = {}) {
  return requestJSON(`${EPMC_BASE}/${pathname}`, { ...options, label: "Europe PMC" });
}
// PUBLIC_APP=1 permite desplegar este mismo repositorio como un segundo servicio de
// Render dedicado solo a javny-publico.html: la raíz "/" (y cualquier ruta sin
// archivo propio) sirve esa página en vez de la app completa de Enferix, sin duplicar
// el backend (Gemini, CIMA, /api/nearby, etc. se comparten igual en ambos servicios).
const PUBLIC_APP_MODE = process.env.PUBLIC_APP === "1";
const HOME_FILE = PUBLIC_APP_MODE ? "javny-publico.html" : "index.html";

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded === "/" ? HOME_FILE : decoded.replace(/^\/+/, "");
  const full = path.resolve(PUBLIC, relative);
  return full.startsWith(path.resolve(PUBLIC) + path.sep) || full === path.resolve(PUBLIC, HOME_FILE) ? full : null;
}
function serveStatic(req, res) {
  const full = safeStaticPath(req.url);
  if (!full || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    const fallback = path.join(PUBLIC, HOME_FILE);
    if (!fs.existsSync(fallback)) { res.writeHead(404); res.end("No encontrado"); return; }
    return sendFile(req, res, fallback);
  }
  sendFile(req, res, full);
}

// index.html pesa varios MB (biblioteca virtual inline); sin comprimir se transfiere
// entero en cada visita. Se cachea en memoria la versión ya comprimida (br/gzip) por
// archivo, para pagar el coste de comprimir una sola vez por arranque del proceso,
// no en cada petición.
const COMPRESSIBLE_EXT = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".xml"]);
const compressedCache = new Map();
// Identifica la versión de un fichero en disco; se usa tal cual como ETag.
function fileVersion(file) {
  const stat = fs.statSync(file);
  return `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
}
function pickEncoding(acceptEncoding) {
  const ae = String(acceptEncoding || "");
  if (/\bbr\b/.test(ae)) return "br";
  if (/\bgzip\b/.test(ae)) return "gzip";
  return null;
}
// La versión del fichero (su ETag: tamaño + mtime) forma parte de la clave. Sin
// eso, al cambiar un fichero sin reiniciar el proceso se seguía devolviendo el
// cuerpo comprimido anterior acompañado del ETag nuevo: el navegador recibía
// contenido viejo con etiqueta de nuevo y no había forma de que se enterase.
function getCompressed(file, encoding, version) {
  const v = version || fileVersion(file);
  const key = `${file}:${encoding}:${v}`;
  let buf = compressedCache.get(key);
  if (buf) return buf;
  // Fuera las versiones anteriores de este mismo fichero, para que la caché no
  // crezca sin límite a lo largo de la vida del proceso.
  for (const k of compressedCache.keys()) {
    if (k.startsWith(`${file}:${encoding}:`)) compressedCache.delete(k);
  }
  const raw = fs.readFileSync(file);
  buf = encoding === "br"
    ? zlib.brotliCompressSync(raw, { params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 9,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length
      } })
    : zlib.gzipSync(raw, { level: 9 });
  compressedCache.set(key, buf);
  return buf;
}
function sendFile(req, res, file) {
  const ext = path.extname(file).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml", ".webp": "image/webp"
  };
  const contentType = types[ext] || "application/octet-stream";
  // .html, .js y .json van con "no-cache" (siempre revalida con el servidor,
  // resolviéndose con un 304 sin cuerpo si no ha cambiado) en vez de
  // "no-store" o de un max-age largo. Los .js/.json de /data/ son el
  // contenido clínico de la app (procedimientos, guías, vademécum...) y
  // cambian con cada PR; con max-age=3600 el navegador servía una copia
  // vieja durante una hora sin ni siquiera preguntar al servidor.
  const revalidate = ext === ".html" || ext === ".js" || ext === ".json";
  const cacheControl = revalidate ? "no-cache" : "public, max-age=3600";
  const stat = fs.statSync(file);
  const etag = `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`; // = fileVersion(file)

  if (req?.headers?.["if-none-match"] === etag) {
    res.writeHead(304, { "Cache-Control": cacheControl, "ETag": etag });
    res.end();
    return;
  }

  if (COMPRESSIBLE_EXT.has(ext)) {
    const encoding = pickEncoding(req?.headers?.["accept-encoding"]);
    if (encoding) {
      const compressed = getCompressed(file, encoding, etag);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Encoding": encoding,
        "Content-Length": compressed.length,
        "Vary": "Accept-Encoding",
        "Cache-Control": cacheControl,
        "ETag": etag
      });
      res.end(compressed);
      return;
    }
  }

  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": stat.size,
    "Cache-Control": cacheControl,
    "ETag": etag
  });
  fs.createReadStream(file).pipe(res);
}
// medicineDetail vive ahora en sources/cima.mjs: lo usan esta ruta y la
// herramienta de interacciones de Javny (sources/interacciones.mjs).

const LITERATURE_SOURCES = { pubmed: searchPubMed, crossref: searchCrossref };

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return json(res, 204, {});
    const u = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    // ── Health ──
    if (u.pathname === "/api/health") {
      return json(res, 200, {
        ok: true, service: "Enferix CIMA local", port: PORT,
        runtime: `Node ${process.version}`, cimaBase: CIMA_BASE
      });
    }

    // ── CIMA ──
    if (u.pathname === "/api/cima/health") {
      await cima("medicamento?nregistro=51347", { ttl: 30 * 60 * 1000 });
      return json(res, 200, {
        ok: true, service: "CIMA-AEMPS", apiVersion: "REST v1.23",
        source: "Agencia Española de Medicamentos y Productos Sanitarios"
      });
    }
    if (u.pathname === "/api/cima/search" && req.method === "GET") {
      const mode = ["name","active","pathology","atc"].includes(u.searchParams.get("mode"))
        ? u.searchParams.get("mode") : "name";
      const q = clean(u.searchParams.get("q"), 120);
      const page = Math.max(1, Math.min(1000, Number(u.searchParams.get("page")) || 1));
      const commercial = u.searchParams.get("commercial") === "1";
      const authorized = u.searchParams.get("authorized") === "1";
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });

      let raw;
      if (mode === "pathology") {
        raw = await cima("buscarEnFichaTecnica", {
          method: "POST", body: [{ seccion: "4.1", texto: q, contiene: 1 }],
          ttl: 15 * 60 * 1000
        });
      } else {
        const params = new URLSearchParams({ pagina: String(page) });
        if (mode === "name") params.set("nombre", q);
        if (mode === "active") params.set("practiv1", q);
        if (mode === "atc") params.set("atc", q);
        if (commercial) params.set("comerc", "1");
        if (authorized) params.set("autorizados", "1");
        raw = await cima(`medicamentos?${params}`, { ttl: 15 * 60 * 1000 });
      }
      let items = normalizeList(raw);
      if (commercial) items = items.filter(item => item.comerc !== false);
      return json(res, 200, {
        items, page, mode, query: q,
        total: raw?.totalFilas ?? raw?.total ?? items.length,
        source: "CIMA-AEMPS", fetchedAt: new Date().toISOString()
      });
    }
    if (u.pathname.startsWith("/api/cima/medicine/") && req.method === "GET") {
      const nregistro = clean(u.pathname.split("/").pop(), 30);
      if (!/^[A-Za-z0-9.-]+$/.test(nregistro)) return json(res, 400, { error: "Número de registro no válido" });
      return json(res, 200, await medicineDetail(nregistro));
    }
    if (u.pathname === "/api/cima/search-indication" && req.method === "POST") {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const text = clean(parsed.text, 120);
      if (text.length < 2) return json(res, 400, { error: "Texto insuficiente" });
      const raw = await cima("buscarEnFichaTecnica", {
        method: "POST", body: [{ seccion: "4.1", texto: text, contiene: 1 }],
        ttl: 15 * 60 * 1000
      });
      return json(res, 200, { items: normalizeList(raw), query: text, section: "4.1", source: "CIMA-AEMPS" });
    }

    // ── Europe PMC ──
    if (u.pathname === "/api/pmc/health") {
      await epmc("search?query=heart&format=json&pageSize=1&resultType=idlist", { ttl: 30 * 60 * 1000 });
      return json(res, 200, {
        ok: true, service: "Europe PMC",
        source: "EMBL-EBI · Europe PMC RESTful Web Service"
      });
    }
    if (u.pathname === "/api/pmc/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const openOnly = u.searchParams.get("open") === "1";
      const sort = u.searchParams.get("sort") === "date" ? "date" : "relevance";
      const cursor = clean(u.searchParams.get("cursor") || "*", 200) || "*";

      let query = q;
      if (openOnly) query = `(${query}) AND (OPEN_ACCESS:y)`;
      const params = new URLSearchParams({
        query, format: "json", resultType: "core",
        pageSize: "25", cursorMark: cursor
      });
      if (sort === "date") params.set("sort", "P_PDATE_D desc");

      const raw = await epmc(`search?${params}`, { ttl: 15 * 60 * 1000 });
      const list = raw?.resultList?.result || [];
      const items = list.map(r => ({
        id: r.id || "", source: r.source || "", pmid: r.pmid || "", pmcid: r.pmcid || "", doi: r.doi || "",
        title: clean(stripTags(r.title), 400),
        authors: clean(r.authorString, 240),
        journal: clean(r.journalInfo?.journal?.title || r.journalTitle || r.bookOrReportDetails?.publisher, 160),
        year: r.pubYear || "",
        isOpen: r.isOpenAccess === "Y",
        citedBy: Number(r.citedByCount || 0),
        type: clean(r.pubType, 60),
        abstract: clean(stripTags(r.abstractText), 1400),
        url: r.doi ? `https://doi.org/${r.doi}`
          : (r.source && r.id ? `https://europepmc.org/article/${r.source}/${r.id}` : "")
      }));
      return json(res, 200, {
        items,
        total: raw?.hitCount ?? items.length,
        nextCursor: raw?.nextCursorMark || null,
        query: q, sort, openOnly,
        source: "Europe PMC", fetchedAt: new Date().toISOString()
      });
    }

    // ── Literature Search (PubMed + Crossref) ──
    if (u.pathname === "/api/literature/health") {
      return json(res, 200, {
        ok: true, service: "Enferix Literature Search",
        sources: Object.keys(LITERATURE_SOURCES)
      });
    }
    if (u.pathname === "/api/literature/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const page = Math.max(1, Math.min(100, Number(u.searchParams.get("page")) || 1));
      const limit = Math.max(1, Math.min(50, Number(u.searchParams.get("limit")) || 25));
      const requested = (u.searchParams.get("sources") || "pubmed,crossref")
        .split(",").map(s => s.trim()).filter(s => s in LITERATURE_SOURCES);
      if (requested.length === 0) return json(res, 400, { error: "Ninguna fuente válida" });

      const settled = await Promise.allSettled(
        requested.map(src => LITERATURE_SOURCES[src](q, { page, limit }))
      );

      const items = [];
      const errors = [];
      for (let i = 0; i < requested.length; i++) {
        const r = settled[i];
        if (r.status === "fulfilled") {
          items.push(...r.value.items);
        } else {
          errors.push({ source: requested[i], error: r.reason?.message || "Error desconocido" });
        }
      }

      return json(res, 200, {
        items: items.slice(0, limit),
        total: items.length,
        page,
        query: q,
        sources: requested,
        errors: errors.length > 0 ? errors : undefined,
        fetchedAt: new Date().toISOString()
      });
    }

    // ── Article Detail ──
    if (u.pathname.startsWith("/api/article/") && req.method === "GET") {
      const raw = decodeURIComponent(u.pathname.slice("/api/article/".length));
      if (!raw || raw.length < 2) return json(res, 400, { error: "ID de artículo no válido" });

      const colonIdx = raw.indexOf(":");
      const source = colonIdx > 0 ? raw.slice(0, colonIdx) : "pubmed";
      const identifier = colonIdx > 0 ? raw.slice(colonIdx + 1) : raw;

      if (source === "pubmed") {
        return json(res, 200, await fetchPubMedArticle(identifier));
      } else if (source === "crossref" || source === "doi") {
        return json(res, 200, await fetchCrossrefWork(identifier));
      }
      return json(res, 400, { error: `Fuente no soportada: ${source}` });
    }

    // ── NICE Guidelines ──
    if (u.pathname === "/api/nice/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const limit = Math.max(1, Math.min(25, Number(u.searchParams.get("limit")) || 10));
      const result = await searchNICE(q, { limit });
      return json(res, 200, { ...result, query: q, source: "NICE", fetchedAt: new Date().toISOString() });
    }

    // ── SNOMED CT (búsqueda por candidatos, para contexto del chat) ──
    if (u.pathname === "/api/snomed/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 200);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const limit = Math.max(1, Math.min(20, Number(u.searchParams.get("limit")) || 6));
      const result = await searchSnomed(q, { limit });
      return json(res, 200, { ...result, query: q, source: "SNOMED CT (Edición Española)", fetchedAt: new Date().toISOString() });
    }

    // ── OpenFDA ──
    if (u.pathname === "/api/fda/drug" && req.method === "GET") {
      const name = clean(u.searchParams.get("name"), 120);
      if (name.length < 2) return json(res, 400, { error: "Nombre de fármaco demasiado corto" });
      const result = await searchOpenFDA(name);
      if (!result) return json(res, 404, { error: "Fármaco no encontrado en OpenFDA", query: name });
      return json(res, 200, { ...result, query: name, fetchedAt: new Date().toISOString() });
    }

    // ── ClinicalTrials.gov ──
    if (u.pathname === "/api/clinicaltrials/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const limit = Math.max(1, Math.min(25, Number(u.searchParams.get("limit")) || 10));
      try {
        const result = await searchClinicalTrials(q, { limit });
        return json(res, 200, { ...result, query: q, source: "ClinicalTrials.gov", fetchedAt: new Date().toISOString() });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error consultando ClinicalTrials.gov" });
      }
    }

    // ── Semantic Scholar ──
    if (u.pathname === "/api/scholar/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const limit = Math.max(1, Math.min(50, Number(u.searchParams.get("limit")) || 10));
      try {
        const result = await searchSemanticScholar(q, { limit });
        return json(res, 200, { ...result, query: q, source: "Semantic Scholar", fetchedAt: new Date().toISOString() });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error consultando Semantic Scholar" });
      }
    }

    // ── WHO IRIS ──
    if (u.pathname === "/api/who/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const limit = Math.max(1, Math.min(25, Number(u.searchParams.get("limit")) || 10));
      try {
        const result = await searchWHO(q, { limit });
        return json(res, 200, { ...result, query: q, source: "WHO IRIS", fetchedAt: new Date().toISOString() });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error consultando WHO IRIS" });
      }
    }

    // ── Evidencia relacionada (P3.2) ──
    // Probe nativo (fetch()) a cada fuente por separado, sin pasar por
    // requestJSON: aquí necesitamos el status HTTP exacto y el tiempo de
    // cada fuente aunque falle, para poder distinguir en el frontend entre
    // "sin resultados" (todas 2xx, count=0) y "fallo" (alguna fuente cayó).
    if (u.pathname === "/api/evidencia-relacionada" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      // OpenFDA busca SOLO los fármacos que la propia ficha nombra (campo editorial
      // `doc.evidenceDrugs`, enviado aquí como `drugs`), nunca por asociación temática
      // con `q`: sin esto se traían fármacos de otras fichas con la misma indicación,
      // lo que viola la regla de no inventar/asociar contenido clínico no citado.
      const drugs = clean(u.searchParams.get("drugs") || "", 300)
        .split(",").map(s => s.trim()).filter(Boolean).slice(0, 8);

      async function probeSource(name, url, fetchOptions, parseItems) {
        const startedAt = Date.now();
        try {
          const r = await fetch(url, { ...fetchOptions, signal: AbortSignal.timeout(10000) });
          const ms = Date.now() - startedAt;
          let data = null;
          try { data = await r.json(); } catch { data = null; }
          if (!r.ok) {
            const errMsg = data?.error?.message || (typeof data?.error === "string" ? data.error : "") || data?.message || `HTTP ${r.status}`;
            return { name, url, status: r.status, ms, count: 0, items: [], error: errMsg };
          }
          const items = parseItems(data) || [];
          return { name, url, status: r.status, ms, count: items.length, items, error: null };
        } catch (err) {
          return { name, url, status: 0, ms: Date.now() - startedAt, count: 0, items: [], error: err.message || "Error de red" };
        }
      }

      const epmcUrl = `${EPMC_BASE}/search?${new URLSearchParams({ query: q, format: "json", resultType: "core", pageSize: "8" })}`;
      const niceUrl = `https://api.nice.org.uk/services/search?${new URLSearchParams({ q, ps: "8", pa: "1", sp: "Relevance" })}`;
      const NICE_API_KEY = process.env.NICE_API_KEY || "";

      function fdaDrugClause(drug) {
        const safe = drug.replace(/"/g, "");
        return `openfda.generic_name:"${safe}" OR openfda.brand_name:"${safe}" OR openfda.substance_name:"${safe}"`;
      }
      const fdaUrl = drugs.length
        ? `https://api.fda.gov/drug/label.json?${new URLSearchParams({ search: drugs.map(fdaDrugClause).join(" OR "), limit: "5" })}`
        : "";

      const [europepmc, nice, openfda] = await Promise.all([
        probeSource("europepmc", epmcUrl, {}, data => (data?.resultList?.result || []).map(r => ({
          id: r.id || "", title: clean(stripTags(r.title), 400) || "(sin título)",
          authors: clean(r.authorString, 200),
          journal: clean(r.journalInfo?.journal?.title || r.journalTitle, 160),
          year: r.pubYear || "",
          url: r.doi ? `https://doi.org/${r.doi}` : (r.source && r.id ? `https://europepmc.org/article/${r.source}/${r.id}` : ""),
          source: "Europe PMC"
        }))),
        probeSource("nice", niceUrl, { headers: NICE_API_KEY ? { "Api-Key": NICE_API_KEY } : {} }, data => (data?.documents || data?.Documents || []).map(d => ({
          id: d.id || d.Id || "", title: clean(d.title || d.Title, 300) || "(sin título)",
          year: clean(d.publicationDate || d.PublicationDate, 20),
          url: d.url || d.Url || d.pathAndQuery || "",
          type: clean(d.documentType || d.DocumentType || d.guidanceType, 60),
          source: "NICE"
        }))),
        drugs.length
          ? probeSource("openfda", fdaUrl, {}, data => (data?.results || []).map(d => ({
              id: clean(d.id || d.set_id, 80),
              title: clean(d.openfda?.brand_name?.[0] || d.openfda?.generic_name?.[0], 200) || "(sin título)",
              detail: clean(Array.isArray(d.indications_and_usage) ? d.indications_and_usage[0] : "", 400),
              year: "",
              url: "",
              source: "OpenFDA"
            })))
          // Sin fármacos editoriales para esta ficha: estado vacío honesto, sin
          // llamar a la API (sería buscar por asociación, justo lo que evitamos).
          : Promise.resolve({ name: "openfda", url: "", status: 200, ms: 0, count: 0, items: [], error: null, skipped: true })
      ]);

      const sources = { europepmc, nice, openfda };
      const totalCount = europepmc.count + nice.count + openfda.count;
      const anyFailed = [europepmc, nice, openfda].some(s => !s.skipped && (s.status < 200 || s.status >= 300));

      return json(res, 200, {
        query: q, sources, totalCount, anyFailed,
        fetchedAt: new Date().toISOString()
      });
    }

    // ── Javny Orchestrator ──
    if (u.pathname === "/api/javny/chat" && req.method === "POST") {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const question = clean(parsed.question, 500);
      if (question.length < 2) return json(res, 400, { error: "Pregunta demasiado corta" });
      const result = await orchestrate({
        question,
        context: parsed.context || {},
        history: Array.isArray(parsed.history) ? parsed.history.slice(-10) : [],
        apiKey: parsed.apiKey || "",
        model: clean(parsed.model, 60) || undefined,
        caseMemory: Array.isArray(parsed.caseMemory) ? parsed.caseMemory.slice(-6) : [],
        route: parsed.route || {},
        attachment: parsed.attachment || null,
        // Términos editoriales de búsqueda (evidenceQuery de las fichas que el
        // navegador ha recuperado): texto plano acotado, solo son consultas a
        // las fuentes externas — no entran en el prompt.
        evidenceQueries: Array.isArray(parsed.evidenceQueries)
          ? parsed.evidenceQueries.map(t => clean(t, 120)).filter(Boolean).slice(0, 3)
          : []
      });
      return json(res, 200, result);
    }

    // ── Javny Orchestrator (streaming NDJSON) ──
    if (u.pathname === "/api/javny/chat/stream" && req.method === "POST") {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const question = clean(parsed.question, 500);
      if (question.length < 2) return json(res, 400, { error: "Pregunta demasiado corta" });
      const key = parsed.apiKey || process.env.GEMINI_API_KEY || "";
      if (!key) {
        return json(res, 400, { error: "No hay API Key de Gemini configurada. Añade GEMINI_API_KEY en las variables de entorno de Render." });
      }

      res.writeHead(200, {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      });
      // Manda las cabeceras por el cable AHORA, sin esperar al primer evento: así
      // el proxy de delante abre el canal desde el principio en vez de retenerlo.
      if (typeof res.flushHeaders === "function") res.flushHeaders();
      // Nagle agrupa escrituras pequeñas antes de mandarlas; en un flujo de
      // fragmentos cortos eso los retiene unos milisegundos de más.
      if (res.socket && typeof res.socket.setNoDelay === "function") res.socket.setNoDelay(true);

      const writeEvent = (evt) => { try { res.write(JSON.stringify(evt) + "\n"); } catch { /* conexión ya cerrada por el cliente */ } };
      try {
        await orchestrateStream({
          question,
          context: parsed.context || {},
          history: Array.isArray(parsed.history) ? parsed.history.slice(-10) : [],
          apiKey: key,
          model: clean(parsed.model, 60) || undefined,
          caseMemory: Array.isArray(parsed.caseMemory) ? parsed.caseMemory.slice(-6) : [],
          route: parsed.route || {},
          attachment: parsed.attachment || null,
          // Sólo lo pide la consulta de portada: respuesta corta y al grano. El
          // chat del avatar no lo envía y mantiene su desarrollo largo de siempre.
          conciso: parsed.conciso === true,
          // Términos editoriales de búsqueda (evidenceQuery de las fichas que el
          // navegador ha recuperado): texto plano acotado, solo son consultas a
          // las fuentes externas — no entran en el prompt.
          evidenceQueries: Array.isArray(parsed.evidenceQueries)
            ? parsed.evidenceQueries.map(t => clean(t, 120)).filter(Boolean).slice(0, 3)
            : [],
          // Coordenadas que el navegador comparte (con consentimiento ya dado)
          // para la herramienta centros_cercanos. El modelo nunca las ve como
          // texto ni puede inventarlas: solo las consume la herramienta.
          ubicacion: (parsed.ubicacion
            && Number.isFinite(Number(parsed.ubicacion.lat)) && Math.abs(Number(parsed.ubicacion.lat)) <= 90
            && Number.isFinite(Number(parsed.ubicacion.lon)) && Math.abs(Number(parsed.ubicacion.lon)) <= 180)
            ? { lat: Number(parsed.ubicacion.lat), lon: Number(parsed.ubicacion.lon) }
            : null,
          // Las herramientas de la app (frente 3) son opt-in del llamador:
          // este chat interno sí; el endpoint público anónimo, no.
          herramientas: true
        }, writeEvent);
      } catch (err) {
        console.error("[Javny chat/stream] Error:", err instanceof Error ? err.stack || err.message : err);
        writeEvent({ type: "error", error: err instanceof Error ? err.message : "Error de conexión con Javny" });
      } finally {
        res.end();
      }
      return;
    }

    // ── Parte de turno (SBAR) ──
    if (u.pathname === "/api/sbar/generate" && req.method === "POST") {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const patientState = clean(parsed.patientState, 1000);
      if (patientState.length < 10) return json(res, 400, { error: "Describe el estado del paciente con más detalle" });
      const apiKey = parsed.apiKey || "";

      const sbarPrompt = `Estructura INMEDIATAMENTE el siguiente estado del paciente en formato SBAR (Situación | Antecedentes | Evaluación | Recomendación). Usa encabezados claros (## para cada sección). Sé conciso y clínico.

ESTADO DEL PACIENTE:
${patientState}

ESTRUCTURA SBAR:`;

      try {
        const result = await orchestrate({
          question: sbarPrompt,
          context: { sbar: true },
          history: [],
          apiKey,
          model: "gemini-3.5-flash"
        });
        return json(res, 200, {
          sbar: result.answer || result.text || "Error generando SBAR",
          original: patientState,
          source: "Javny SBAR",
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error generando SBAR" });
      }
    }

    // ── Javny Live token (ephemeral auth for Gemini Live WebSocket) ──
    if (u.pathname === "/api/live/token" && req.method === "POST") {
      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey) return json(res, 500, { error: "GEMINI_API_KEY no configurada en el servidor" });
      const liveModel = process.env.GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview";
      try {
        // AuthTokenService.CreateToken (solo v1alpha). Token de un uso, sin restricciones:
        // el cliente controla su propio setup (modelo, systemInstruction, tools).
        const postBody = JSON.stringify({ uses: 1 });
        const g = await new Promise((resolve, reject) => {
          const r = https.request({
            hostname: "generativelanguage.googleapis.com",
            path: `/v1alpha/auth_tokens?key=${encodeURIComponent(apiKey)}`,
            method: "POST",
            timeout: 15000,
            headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postBody) }
          }, resp => {
            const chunks = [];
            resp.on("data", c => chunks.push(c));
            resp.on("end", () => {
              let data = {};
              try { data = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch {}
              resolve({ status: resp.statusCode, data });
            });
          });
          r.on("timeout", () => r.destroy(new Error("Timeout")));
          r.on("error", reject);
          r.write(postBody);
          r.end();
        });
        if (g.status >= 200 && g.status < 300) {
          const tok = g.data?.name || g.data?.token;
          if (tok) return json(res, 200, { token: tok, model: liveModel });
          return json(res, 500, { error: "Google no devolvió el token (campo name)", detail: g.data });
        }
        const gmsg = g.data?.error?.message || g.data?.message || ("HTTP " + g.status);
        return json(res, 502, { error: "Gemini Live: " + gmsg });
      } catch (err) {
        return json(res, 502, { error: "No se pudo obtener token de Gemini Live: " + (err && err.message || err) });
      }
    }

    // ── Transcripción de audio para Javny Life (manos libres) ──
    if (u.pathname === "/api/javny/transcribe" && req.method === "POST") {
      // Alcanzable de forma anónima desde javny-publico.html además de desde la app
      // de Enferix, así que lleva el mismo límite por IP que /api/javny/public/chat/stream.
      if (rateLimited(req, { max: 20, windowMs: 10 * 60 * 1000 })) {
        return json(res, 429, { error: "Demasiados audios seguidos. Espera unos minutos." });
      }
      const rawBody = await readBodyLarge(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const audio = typeof parsed.audio === "string" ? parsed.audio : "";
      const mimeType = clean(parsed.mimeType, 40) || "audio/wav";
      if (!audio) return json(res, 400, { error: "Falta el audio" });
      const text = await transcribeAudio(audio, mimeType, parsed.apiKey || "");
      return json(res, 200, { text });
    }

    // Lectura de ECG y de imagen radiológica. Antes la hacía el NAVEGADOR contra
    // Google con la clave que el usuario se hubiera pegado en Ajustes, así que
    // sin esa clave la app no analizaba nada. Ahora la clave la pone el servidor,
    // como en el resto de Javny, y no vuelve nunca al cliente.
    if (u.pathname === "/api/javny/imagen" && req.method === "POST") {
      if (rateLimited(req, { max: 20, windowMs: 10 * 60 * 1000 })) {
        return json(res, 429, { error: "Demasiadas imágenes seguidas. Espera unos minutos." });
      }
      if (!imagenDisponible()) {
        return json(res, 503, { error: "El servidor no tiene ningún proveedor de IA configurado (ANTHROPIC_API_KEY o GEMINI_API_KEY)." });
      }
      const rawBody = await readBodyLarge(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const tipo = clean(parsed.tipo, 8);
      if (tipo !== "ecg" && tipo !== "rx" && tipo !== "lab" && tipo !== "caso") return json(res, 400, { error: "Tipo de imagen no reconocido" });
      const data = typeof parsed.data === "string" ? parsed.data : "";
      // Serie de imágenes del mismo estudio (varias proyecciones, o los cortes
      // extraídos de un vídeo). Solo datos saneados: base64 y su media type.
      const imagenes = Array.isArray(parsed.imagenes)
        ? parsed.imagenes
            .filter(i => i && typeof i.data === "string" && i.data.length > 0)
            .slice(0, 14)
            .map(i => ({ data: i.data, media: clean(i.media, 40) || "image/jpeg", rol: (i.rol === "rx" || i.rol === "lab" || i.rol === "ecg") ? i.rol : undefined }))
        : [];
      if (!data && imagenes.length === 0) return json(res, 400, { error: "Falta la imagen" });
      const { answer, proveedor } = await analizarImagen({
        tipo,
        data,
        media: clean(parsed.media, 40) || "image/jpeg",
        imagenes,
        origenVideo: parsed.origenVideo === true,
        contexto: clean(parsed.contexto, 1200)
      });
      res.setHeader("Cache-Control", "no-store");
      return json(res, 200, { answer, proveedor, fetchedAt: new Date().toISOString() });
    }

    // "Explícame el fármaco" del Vademécum. Mismo motivo que la lectura de
    // imagen: la llamada la hacía el navegador con la clave del usuario.
    if (u.pathname === "/api/javny/farmaco" && req.method === "POST") {
      if (rateLimited(req, { max: 30, windowMs: 10 * 60 * 1000 })) {
        return json(res, 429, { error: "Demasiadas consultas seguidas. Espera unos minutos." });
      }
      if (!farmacoDisponible()) {
        return json(res, 503, { error: "El servidor no tiene ningún proveedor de IA configurado (ANTHROPIC_API_KEY o GEMINI_API_KEY)." });
      }
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      if (!parsed.ficha || !String(parsed.ficha.nombre || "").trim()) {
        return json(res, 400, { error: "Falta la ficha del fármaco" });
      }
      const { answer, proveedor } = await explicarFarmaco(parsed.ficha);
      res.setHeader("Cache-Control", "no-store");
      return json(res, 200, { answer, proveedor, fetchedAt: new Date().toISOString() });
    }

    if (u.pathname === "/api/javny/health") {
      const payload = {
        ok: true, service: "Javny Orchestrator",
        geminiConfigured: !!process.env.GEMINI_API_KEY,
        geminiModel: GEMINI_MODEL,
        // Lo consulta el cliente para saber si puede analizar ECG y radiografías
        // contra el servidor o si tiene que pedirle la clave al usuario.
        imagenConfigurada: imagenDisponible(),
        farmacoConfigurado: farmacoDisponible(),
        sources: ["Enferix fichas", "PubMed", "Crossref", "NICE Guidelines", "OpenFDA", "Guías internacionales"]
      };
      // ?test=1 hace además una llamada real a Gemini y devuelve el motivo exacto si
      // falla. No se hace por defecto porque consume cuota en cada visita.
      if (u.searchParams.get("test") !== "1") {
        payload.hint = "Añade ?test=1 a esta URL para probar Gemini de verdad y ver el error concreto.";
        return json(res, 200, payload);
      }
      payload.gemini = await probeGemini();
      payload.diagnostico = payload.gemini.ok
        ? "Gemini responde correctamente desde el servidor."
        : `Gemini falla desde el servidor: ${payload.gemini.error}`;
      return json(res, 200, payload);
    }

    // ── Javny para el público general (javny-publico.html) — streaming NDJSON ──
    // A diferencia de /api/javny/chat/stream: audience "public" fuerza un prompt más
    // sencillo y conservador, usa SIEMPRE la GEMINI_API_KEY del servidor (nunca una
    // clave que traiga el visitante, porque no hay pantalla de Ajustes en esta vista
    // pública) y tiene límite de peticiones por IP al ser un endpoint anónimo.
    if (u.pathname === "/api/javny/public/chat/stream" && req.method === "POST") {
      if (rateLimited(req)) {
        return json(res, 429, { error: "Demasiadas preguntas seguidas. Espera unos minutos antes de volver a preguntar." });
      }
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const question = clean(parsed.question, 500);
      if (question.length < 2) return json(res, 400, { error: "Pregunta demasiado corta" });
      const key = process.env.GEMINI_API_KEY || "";
      if (!key) {
        return json(res, 400, { error: "No hay API Key de Gemini configurada en el servidor." });
      }

      res.writeHead(200, {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      });

      const writeEvent = (evt) => { try { res.write(JSON.stringify(evt) + "\n"); } catch { /* conexión ya cerrada por el cliente */ } };
      try {
        await orchestrateStream({
          question,
          context: parsed.context || {},
          history: Array.isArray(parsed.history) ? parsed.history.slice(-10) : [],
          apiKey: key
        }, writeEvent);
      } catch (err) {
        console.error("[Javny public/chat/stream] Error:", err instanceof Error ? err.stack || err.message : err);
        writeEvent({ type: "error", error: err instanceof Error ? err.message : "Error de conexión con Javny" });
      } finally {
        res.end();
      }
      return;
    }

    // ── Servicios sanitarios cercanos (hospitales / DEA) ──
    // Estrategia: Google Places API para hospitales (SLA industrial) y
    // Overpass/OSM para desfibriladores (única fuente sistemática de AEDs).
    // Si Google Places falla o no está configurado, hospitales caen también
    // a Overpass como red de seguridad. Los items conservan su `source` para
    // que la UI pueda mostrar la atribución correspondiente.
    if (u.pathname === "/api/nearby" && req.method === "GET") {
      const lat = Number(u.searchParams.get("lat"));
      const lon = Number(u.searchParams.get("lon"));
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        return json(res, 400, { error: "Coordenadas no válidas" });
      }
      const radius = Math.max(500, Math.min(20000, Number(u.searchParams.get("radius")) || 5000));
      const typeParam = clean(u.searchParams.get("type"), 20) || "all";
      const kinds = typeParam === "all" ? ["hospital", "aed"] : [typeParam].filter(k => k === "hospital" || k === "aed");
      if (!kinds.length) return json(res, 400, { error: "type debe ser 'hospital', 'aed' o 'all'" });

      // La combinación de fuentes (Google prioritario para hospitales,
      // Overpass para DEA y como red de seguridad) vive en sources/cercanos.mjs
      // porque también la usa la herramienta centros_cercanos de Javny.
      try {
        const r = await buscarCercanos(lat, lon, { radius, kinds });
        return json(res, 200, {
          items: r.items,
          source: r.source,
          lat, lon, radius,
          fetchedAt: new Date().toISOString()
        });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error consultando las fuentes" });
      }
    }

    // ── ¿Dónde estoy? (geocodificación inversa) ──
    // Convierte las coordenadas del usuario en una dirección legible vía
    // Nominatim (OpenStreetMap). La dirección es la del punto registrado más
    // cercano en el mapa, por eso se presenta siempre como aproximada. La
    // consume la herramienta donde_estoy de Javny (chat y Live).
    if (u.pathname === "/api/donde-estoy" && req.method === "GET") {
      const lat = Number(u.searchParams.get("lat"));
      const lon = Number(u.searchParams.get("lon"));
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        return json(res, 400, { error: "Coordenadas no válidas" });
      }
      try {
        const r = await dondeEstoy(lat, lon);
        return json(res, 200, { ...r, lat, lon, fetchedAt: new Date().toISOString() });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error consultando el geocodificador" });
      }
    }

    // ── Terminología NNN / SNOMED ──
    if (u.pathname === "/api/terminology/validate" && req.method === "POST") {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const valor = clean(parsed.valor || parsed.value || "", 300);
      const via = clean(parsed.via || "nnn", 20);
      if (valor.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres del diagnóstico" });
      try {
        const result = await validarTerminologia(valor, via);
        return json(res, 200, { ...result, query: valor, via, validatedAt: new Date().toISOString() });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error validando terminología" });
      }
    }
    if (u.pathname === "/api/terminology/stats" && req.method === "GET") {
      try {
        const stats = await nnnStats();
        return json(res, 200, { ...stats, source: "nnn_codes.json" });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error obteniendo estadísticas NNN" });
      }
    }
    if (u.pathname === "/api/terminology/reload" && req.method === "POST") {
      invalidateNnnCache();
      const stats = await nnnStats();
      return json(res, 200, { reloaded: true, ...stats });
    }
    if (u.pathname === "/api/terminology/dictionary" && req.method === "GET") {
      try {
        const dict = await nnnDictionary();
        res.setHeader("Cache-Control", "public, max-age=300");
        return json(res, 200, { ...dict, source: "nnn_codes.json" });
      } catch (err) {
        return json(res, 503, { error: err.message || "Error obteniendo diccionario NNN" });
      }
    }

    // ── Auth ──
    if (u.pathname === "/api/auth/register" && req.method === "POST") {
      if (!DB_ENABLED) return json(res, 503, { error: "La sincronización en la nube no está configurada en este servidor." });
      try {
        const rawBody = await readBody(req);
        const parsed = rawBody ? JSON.parse(rawBody) : {};
        const user = await registerUser(parsed);
        const token = await createSession(user.id);
        setSessionCookie(res, token, isSecureReq(req));
        return json(res, 200, { user });
      } catch (err) {
        return json(res, err.status || 500, { error: err.message || "Error al registrar la cuenta" });
      }
    }
    if (u.pathname === "/api/auth/login" && req.method === "POST") {
      if (!DB_ENABLED) return json(res, 503, { error: "La sincronización en la nube no está configurada en este servidor." });
      try {
        const rawBody = await readBody(req);
        const parsed = rawBody ? JSON.parse(rawBody) : {};
        const user = await loginUser(parsed);
        const token = await createSession(user.id);
        setSessionCookie(res, token, isSecureReq(req));
        return json(res, 200, { user });
      } catch (err) {
        return json(res, err.status || 500, { error: err.message || "Error al iniciar sesión" });
      }
    }
    if (u.pathname === "/api/auth/logout" && req.method === "POST") {
      const cookies = parseCookies(req);
      if (DB_ENABLED) await destroySession(cookies.sid);
      clearSessionCookie(res, isSecureReq(req));
      return json(res, 200, { ok: true });
    }
    if (u.pathname === "/api/auth/me" && req.method === "GET") {
      if (!DB_ENABLED) return json(res, 200, { user: null });
      const cookies = parseCookies(req);
      const user = await getUserBySession(cookies.sid);
      return json(res, 200, { user });
    }

    // ── Sincronización en la nube (perfil, turnos, favoritos, ajustes) ──
    if (u.pathname === "/api/sync" && req.method === "GET") {
      if (!DB_ENABLED) return json(res, 503, { error: "Sincronización no disponible" });
      const cookies = parseCookies(req);
      const user = await getUserBySession(cookies.sid);
      if (!user) return json(res, 401, { error: "Sesión no válida" });
      const r = await pool.query("SELECT key, value FROM user_data WHERE user_id=$1", [user.id]);
      const data = {};
      r.rows.forEach(row => { data[row.key] = row.value; });
      return json(res, 200, { data });
    }
    if (u.pathname === "/api/sync/bulk" && req.method === "POST") {
      if (!DB_ENABLED) return json(res, 503, { error: "Sincronización no disponible" });
      const cookies = parseCookies(req);
      const user = await getUserBySession(cookies.sid);
      if (!user) return json(res, 401, { error: "Sesión no válida" });
      const rawBody = await readBodyLarge(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const data = parsed && typeof parsed.data === "object" && parsed.data ? parsed.data : {};
      const entries = Object.entries(data).slice(0, 200);
      for (const [rawKey, value] of entries) {
        const key = clean(rawKey, 120);
        if (!key || /key|token|password|apikey/i.test(key)) continue;
        if (value === null) {
          await pool.query("DELETE FROM user_data WHERE user_id=$1 AND key=$2", [user.id, key]);
        } else {
          await pool.query(
            `INSERT INTO user_data (user_id, key, value, updated_at) VALUES ($1,$2,$3, now())
             ON CONFLICT (user_id, key) DO UPDATE SET value=$3, updated_at=now()`,
            [user.id, key, String(value).slice(0, 2000000)]
          );
        }
      }
      return json(res, 200, { ok: true, count: entries.length });
    }

    // ── Proyectos con Javny ──
    // Catálogo de tipos: única fuente de verdad, la lee el cliente para
    // montar el <select> en vez de llevar su propia copia (ver
    // sources/plantillas-proyectos.mjs). Es contenido estático del servidor,
    // cacheable largo.
    if (u.pathname === "/api/proyectos/tipos" && req.method === "GET") {
      res.setHeader("Cache-Control", "public, max-age=3600");
      return json(res, 200, { tipos: TIPOS_DOCUMENTO });
    }

    // Propone el índice de un proyecto. No requiere sesión ni toca la base de
    // datos: es una llamada a modelo, igual que la consulta de portada, no una
    // operación sobre "mis proyectos". La clave del proveedor es SIEMPRE la
    // del servidor — nunca vuelve al cliente.
    if (u.pathname === "/api/proyectos/estructura" && req.method === "POST") {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const descripcion = clean(parsed.descripcion, 4000);
      if (descripcion.length < 10) {
        return json(res, 400, { error: "Describe el proyecto con un poco más de detalle." });
      }
      const tipo = tipoValido(parsed.tipo) ? parsed.tipo : "libre";
      try {
        const sections = await generarEstructura({
          descripcion,
          tipo,
          idioma: clean(parsed.idioma, 40) || "Castellano",
          tono: clean(parsed.tono, 40) || "Profesional",
          destinatario: clean(parsed.destinatario, 300),
          normasCitacion: clean(parsed.normasCitacion, 40) || "Vancouver",
          extensionObjetivo: clean(parsed.extensionObjetivo, 200),
          institucionTutor: clean(parsed.institucionTutor, 300)
        });
        return json(res, 200, { tipo, sections });
      } catch (err) {
        console.error("[Proyectos] No se pudo generar la estructura:", err instanceof Error ? err.message : err);
        return json(res, 502, { error: err instanceof Error ? err.message : "No se pudo generar la estructura." });
      }
    }

    // CRUD de "mis proyectos". Requiere sesión — es contenido del usuario, no
    // una consulta anónima como la de arriba — y cuelga siempre de su user_id
    // (proyectos-db.mjs no acepta un id de proyecto sin el user_id a juego).
    if (u.pathname === "/api/proyectos" && req.method === "GET") {
      if (!DB_ENABLED) return json(res, 503, { error: "La sincronización en la nube no está configurada en este servidor." });
      const user = await getUserBySession(parseCookies(req).sid);
      if (!user) return json(res, 401, { error: "Sesión no válida" });
      return json(res, 200, { proyectos: await listarProyectos(user.id) });
    }
    if (u.pathname === "/api/proyectos" && req.method === "POST") {
      if (!DB_ENABLED) return json(res, 503, { error: "La sincronización en la nube no está configurada en este servidor." });
      const user = await getUserBySession(parseCookies(req).sid);
      if (!user) return json(res, 401, { error: "Sesión no válida" });
      const rawBody = await readBodyLarge(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      if (!clean(parsed.titulo, 300)) return json(res, 400, { error: "El proyecto necesita un título." });
      const proyecto = await crearProyecto(user.id, parsed);
      return json(res, 200, { proyecto });
    }
    if (u.pathname.startsWith("/api/proyectos/") && !u.pathname.startsWith("/api/proyectos/estructura") && !u.pathname.startsWith("/api/proyectos/tipos")) {
      const id = clean(u.pathname.split("/").pop(), 60);
      if (!DB_ENABLED) return json(res, 503, { error: "La sincronización en la nube no está configurada en este servidor." });
      const user = await getUserBySession(parseCookies(req).sid);
      if (!user) return json(res, 401, { error: "Sesión no válida" });
      if (req.method === "GET") {
        const proyecto = await obtenerProyecto(user.id, id);
        if (!proyecto) return json(res, 404, { error: "Proyecto no encontrado" });
        return json(res, 200, { proyecto });
      }
      if (req.method === "PUT") {
        const rawBody = await readBodyLarge(req);
        const parsed = rawBody ? JSON.parse(rawBody) : {};
        const proyecto = await actualizarProyecto(user.id, id, parsed);
        if (!proyecto) return json(res, 404, { error: "Proyecto no encontrado" });
        return json(res, 200, { proyecto });
      }
      if (req.method === "DELETE") {
        const borrado = await borrarProyecto(user.id, id);
        if (!borrado) return json(res, 404, { error: "Proyecto no encontrado" });
        return json(res, 200, { ok: true });
      }
    }

    serveStatic(req, res);
  } catch (error) {
    console.error(error);
    json(res, 502, {
      error: error instanceof Error ? error.message : "Error de conexión con CIMA"
    });
  }
});

// Precalienta la caché de compresión de index.html (varios MB, biblioteca virtual
// inline) para que el primer usuario real no pague el coste de comprimir.
function warmCompressionCache() {
  const indexFile = path.join(PUBLIC, "index.html");
  if (!fs.existsSync(indexFile)) return;
  const startedAt = Date.now();
  getCompressed(indexFile, "br");
  getCompressed(indexFile, "gzip");
  console.log(`Caché de compresión de index.html precalentada en ${Date.now() - startedAt}ms.`);
}

initSchema()
  .catch(err => console.error("Error inicializando la base de datos:", err.message || err))
  .finally(() => {
    warmCompressionCache();
    server.listen(PORT, "0.0.0.0", () => {
      const label = PUBLIC_APP_MODE ? "Javny público" : "Enferix CIMA";
      console.log(`${label} activa en http://localhost:${PORT}`);
      // Fecha del snapshot local de SNOMED CT Edición Española. Sirve para
      // saber de un vistazo cuándo se actualizó por última vez sin abrir el
      // fichero. Ver sources/snomed.mjs para el procedimiento de actualización.
      if (snomedDataAvailable()) {
        const mtime = snomedSnapshotMtime();
        if (mtime) {
          const iso = mtime.toISOString().slice(0, 10);
          console.log(`Snapshot SNOMED CT Edición Española: ${iso}.`);
        }
      } else {
        console.warn("Snapshot SNOMED CT no disponible (snomed_ct_es.tsv.gz ausente): la validación de terminología devolverá null.");
      }
    });
  });
