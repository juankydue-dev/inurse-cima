/* ═══════════════════════════════════════════════════════════════════════════
   Interacciones entre fármacos — sección 4.5 de la ficha técnica (CIMA-AEMPS)
   ---------------------------------------------------------------------------
   Puerto al servidor del criterio del comprobador del cliente
   (public/js/vademecum/inurse-interacciones-js.js), para que Javny pueda
   invocarlo como herramienta. EL CRITERIO ES EL MISMO Y TIENE QUE SEGUIR
   SIÉNDOLO: si este archivo y el del cliente divergen, el chat y el panel de
   interacciones contestarían cosas distintas a la misma pareja de fármacos.
   Al tocar `principiosActivos`, `buscarMencion` o la lista de sales AQUÍ,
   replicar el cambio ALLÍ (y al revés). El cliente no puede importar módulos
   del servidor (es un IIFE sin bundler), así que hoy no hay forma razonable
   de compartir el archivo; esta nota es el seguro.

   Lo que este módulo NO hace, deliberadamente (igual que el cliente):
   - No inventa interacciones ni las deduce: solo localiza y cita texto oficial.
   - No asigna gravedad (leve/moderada/grave).
   - No afirma nunca que "no hay interacción": la ausencia de mención no
     prueba la ausencia de interacción, y el resultado lo dice siempre.
   ═══════════════════════════════════════════════════════════════════════════ */
import { searchCIMA, medicineDetail } from "./cima.mjs";

/* ── Normalización y principios activos (idéntico al cliente) ─────────────── */

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")  // fuera acentos
    .replace(/\s+/g, " ")
    .trim();
}

// La ficha técnica nombra la molécula ("enalapril"), mientras que CIMA devuelve
// el principio activo con su sal ("ENALAPRIL MALEATO"). Sin quitar la sal no
// habría coincidencia.
const SALES = new Set(["maleato","clorhidrato","hidrocloruro","sodico","sodica","calcico","calcica",
  "potasico","potasica","magnesico","sulfato","besilato","mesilato","tartrato","bitartrato",
  "succinato","fumarato","acetato","citrato","bromuro","cloruro","fosfato","nitrato","lactato",
  "gluconato","estearato","palmitato","valerato","propionato","dipropionato","furoato","tosilato",
  "oxalato","malato","embonato","pamoato","hemifumarato","trihidrato","dihidrato","monohidrato",
  "hemihidrato","anhidro","anhidra","hidratado","hidratada","micronizado","micronizada","de","del","y"]);

/* De "ENALAPRIL MALEATO, HIDROCLOROTIAZIDA" saca ["enalapril","hidroclorotiazida"].
   Cada principio activo se conserva como frase completa: buscar "acido
   acetilsalicilico" entero evita que "acido" case con cualquier cosa. */
export function principiosActivos(texto) {
  return String(texto || "")
    .split(/[,;/+]| y (?=[a-zA-ZÁÉÍÓÚáéíóúÑñ])/)
    .map(parte => norm(parte)
      .replace(/\([^)]*\)/g, " ")                        // fuera paréntesis
      .split(" ")
      .filter(p => p && !SALES.has(p) && p.length > 3)   // fuera sales y ruido
      .join(" ")
      .trim())
    .filter(p => p.length >= 4)
    .filter((p, i, arr) => arr.indexOf(p) === i);
}

function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/* Busca el principio activo como palabra completa. Devuelve el párrafo que lo
   contiene, recortado, para poder citarlo tal cual. */
export function buscarMencion(textoSeccion, principio) {
  const texto = String(textoSeccion || "");
  if (!texto || !principio) return null;
  const re = new RegExp("(^|[^a-záéíóúñ0-9])(" + escapeRe(principio) + ")([^a-záéíóúñ0-9]|$)", "i");
  const plano = norm(texto);
  const m = plano.match(re);
  if (!m) return null;

  // Se recorta sobre el texto original (con acentos y mayúsculas) usando la
  // posición hallada en el normalizado; ambos tienen la misma longitud porque
  // norm() solo sustituye caracteres uno a uno y colapsa espacios ya colapsados.
  const idx = plano.indexOf(m[2], m.index);
  const base = texto.length === plano.length ? texto : plano;
  let ini = base.lastIndexOf(".", idx);
  ini = ini === -1 ? Math.max(0, idx - 220) : ini + 1;
  let fin = base.indexOf(".", idx + principio.length);
  fin = fin === -1 ? Math.min(base.length, idx + 320) : fin + 1;
  let cita = base.slice(ini, fin).trim();
  if (cita.length > 460) cita = cita.slice(0, 460).trim() + "…";
  return { cita, termino: principio };
}

/* ── HTML → texto plano sin DOM ───────────────────────────────────────────────
   El cliente usa document.createElement para quitar el HTML de la sección;
   aquí no hay DOM, así que se quitan las etiquetas y se decodifican las
   entidades habituales de las fichas de CIMA. El resultado se colapsa a
   espacios simples, igual que hace el cliente, para que buscarMencion pueda
   recortar la cita sobre el mismo texto. */
const ENTIDADES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", ordf: "ª", ordm: "º",
  iquest: "¿", iexcl: "¡", middot: "·", ndash: "–", mdash: "—",
  hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  plusmn: "±", ge: "≥", le: "≤", micro: "µ", deg: "°", sup2: "²", frac12: "½"
};
export function quitarHTML(html) {
  return String(html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => {
      const c = parseInt(h, 16);
      return Number.isFinite(c) ? String.fromCodePoint(c) : " ";
    })
    .replace(/&#(\d+);/g, (m, d) => {
      const c = Number(d);
      return Number.isFinite(c) ? String.fromCodePoint(c) : " ";
    })
    .replace(/&([a-zA-Z]+\d*);/g, (m, n) => ENTIDADES[n] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textoDeSecciones(detalle, prefijo) {
  const raw = detalle && detalle.sections;
  const lista = Array.isArray(raw) ? raw
    : Array.isArray(raw && raw.resultados) ? raw.resultados
    : Array.isArray(raw && raw.secciones) ? raw.secciones : [];
  return lista
    .filter(s => String(s.seccion || "") === prefijo || String(s.seccion || "").startsWith(prefijo + "."))
    .map(s => quitarHTML(s.contenido))
    .filter(Boolean)
    .join(" ");
}

/* ── Resolución de nombres y comprobación por parejas ───────────────────────── */

// De un nombre coloquial ("adiro", "enalapril") a un producto concreto de CIMA.
// Se toma el primer resultado comercializado y se DICE cuál se eligió, para que
// la respuesta nunca oculte sobre qué ficha técnica se ha mirado.
async function resolverFarmaco(nombre) {
  const q = String(nombre || "").trim();
  const base = { consulta: q, nombre: null, nregistro: null, principios: [], seccion45: "", error: null };
  if (q.length < 2) return { ...base, error: "Nombre demasiado corto" };
  let items;
  try {
    const r = await searchCIMA(q, { limit: 5 });
    items = r.items || [];
  } catch (err) {
    return { ...base, error: `No se pudo consultar CIMA: ${err instanceof Error ? err.message : err}` };
  }
  const elegido = items.find(m => m.commercialized) || items[0];
  if (!elegido) return { ...base, error: "Sin resultados en CIMA para ese nombre" };
  const ficha = { ...base, nombre: elegido.name, nregistro: elegido.nregistro, principios: principiosActivos(elegido.active) };
  try {
    const detalle = await medicineDetail(elegido.nregistro);
    ficha.seccion45 = textoDeSecciones(detalle, "4.5");
  } catch (err) {
    ficha.error = `No se pudo leer la ficha técnica: ${err instanceof Error ? err.message : err}`;
  }
  return ficha;
}

export const AVISO_INTERACCIONES =
  "Que no aparezca no significa que no exista: esta comprobación solo busca si una ficha técnica " +
  "nombra al principio activo de la otra. No detecta interacciones descritas por grupo terapéutico " +
  "(AINE, IECA, anticoagulantes…) ni las que no estén recogidas en la ficha. Ante la duda, consultar con Farmacia.";

/* Para cada pareja se mira en los dos sentidos: es habitual que solo una de las
   dos fichas recoja la interacción. */
export async function comprobarInteracciones(nombres) {
  const farmacos = await Promise.all(nombres.map(resolverFarmaco));
  const parejas = [];
  for (let i = 0; i < farmacos.length; i++) {
    for (let j = i + 1; j < farmacos.length; j++) {
      const a = farmacos[i], b = farmacos[j];
      const hallazgos = [];
      for (const pa of b.principios) {
        const m = buscarMencion(a.seccion45, pa);
        if (m) hallazgos.push({ enFichaDe: a.nombre, mencionaA: b.nombre, ...m });
      }
      for (const pb of a.principios) {
        const m = buscarMencion(b.seccion45, pb);
        if (m) hallazgos.push({ enFichaDe: b.nombre, mencionaA: a.nombre, ...m });
      }
      parejas.push({
        a: a.nombre || a.consulta,
        b: b.nombre || b.consulta,
        hallazgos,
        sinFicha: !a.seccion45 && !b.seccion45
      });
    }
  }
  return {
    farmacos: farmacos.map(f => ({
      consulta: f.consulta, nombre: f.nombre, nregistro: f.nregistro,
      principios: f.principios, error: f.error
    })),
    parejas,
    aviso: AVISO_INTERACCIONES,
    fuente: "CIMA-AEMPS, ficha técnica, sección 4.5"
  };
}
