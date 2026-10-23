/* ═══════════════════════════════════════════════════════════════════════════
   Datos de la propia app cargados en el servidor (para las herramientas de Javny)
   ---------------------------------------------------------------------------
   Los datos editoriales de Enferix viven en public/data/*.js como scripts de
   navegador (const de script clásico o window.*). Las herramientas de Javny
   (javny-tools.mjs) necesitan leerlos en el servidor SIN duplicarlos: una
   copia en /sources divergiría tarde o temprano del catálogo real, y la regla
   del proyecto es que el contenido clínico tiene una sola fuente.

   Se cargan igual que ya hace scripts/verify-escalas.mjs: evaluando el archivo
   en un contexto de vm con un `window` sintético. Para los archivos que solo
   declaran una `const` de nivel superior (DILUCIONES, VADEM), se evalúa el
   identificador en el MISMO contexto después de ejecutar el script: los
   bindings léxicos del nivel superior persisten en el contexto, como en un REPL.

   Todo es perezoso y cacheado: la primera herramienta que lo necesite paga la
   carga (decenas de ms) y el resto la reutiliza. Si un archivo no carga, el
   consumidor recibe null y responde con su estado honesto de "no disponible",
   nunca con datos inventados.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "public", "data");

const cache = new Map();   // archivo → valor cargado (o null si falló)

function cargar(archivo, extraer) {
  if (cache.has(archivo)) return cache.get(archivo);
  let valor = null;
  try {
    const src = readFileSync(path.join(DATA_DIR, archivo), "utf8");
    const win = {};
    const ctx = { window: win, globalThis: win };
    vm.createContext(ctx);
    vm.runInContext(src, ctx, { filename: archivo });
    valor = extraer(ctx, win) ?? null;
  } catch (err) {
    console.error(`[Datos app] No se pudo cargar ${archivo}: ${err instanceof Error ? err.message : err}`);
    valor = null;
  }
  cache.set(archivo, valor);
  return valor;
}

// Evalúa un identificador de nivel superior declarado con const/let por el
// script ya ejecutado en ese contexto.
function identificador(ctx, nombre) {
  try { return vm.runInContext(nombre, ctx); } catch { return null; }
}

/** Motor validado de escalas clínicas: {CATEGORIES, SPECIALTIES, CALCULATORS}. */
export function getEscalas() {
  return cargar("escalas-clinicas.js", (ctx, win) => win.ENFERIX_ESCALAS_DATA);
}

/** Formulario de perfusiones: objeto DILUCIONES (31 fármacos, datos editoriales). */
export function getDiluciones() {
  return cargar("diluciones.js", (ctx) => identificador(ctx, "DILUCIONES"));
}

/** Vademécum editorial: array VADEM ({n, a, i, p, c, r, route, cat, source}). */
export function getVademecum() {
  return cargar("vademecum.js", (ctx) => identificador(ctx, "VADEM"));
}

/** Fichas clínicas (guias.js): array DOCS ({id, cat, title, source, tags, summary, sec}). */
export function getDocs() {
  return cargar("guias.js", (ctx, win) => win.DOCS || identificador(ctx, "DOCS"));
}
