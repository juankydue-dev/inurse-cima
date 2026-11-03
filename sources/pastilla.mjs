/* ═══════════════════════════════════════════════════════════════════════════
   Identificar una pastilla en la casilla de un blíster (SPD)
   ---------------------------------------------------------------------------
   Caso real: la farmacia prepara el blíster semanal (desayuno, comida, cena)
   con varias pastillas por casilla, y quien administra busca UNA de ellas sin
   saber cuál es. El profesional dice cuál busca —y, si las sabe, cuáles más
   hay en la casilla—, hace una foto, y la app le señala cuál es.

   La identificación NO es abierta. El modelo no elige entre todos los
   medicamentos del mundo, que es como acierta o falla un chat genérico, con
   la misma seguridad en los dos casos. Aquí:
     1. Los candidatos salen de CIMA-AEMPS por el nombre que da el usuario.
     2. De cada uno se lleva la FOTO OFICIAL de la forma farmacéutica
        (fotos tipo "formafarmac") y la DESCRIPCIÓN LITERAL de la ficha
        técnica (sección 3, «Forma farmacéutica»).
     3. El modelo sólo empareja la foto del usuario contra esos candidatos, y
        tiene que decir «dudosa» cuando dos pastillas se parecen demasiado.
   Si CIMA no devuelve nada por ese nombre, no se llama al modelo: se dice.

   La respuesta del modelo es un JSON que el servidor valida —un candidato que
   no estaba en la lista se descarta— antes de que llegue a la pantalla.
   ═══════════════════════════════════════════════════════════════════════════ */
import { requestJSON } from "../cache.mjs";
import { normalizeList } from "./cima.mjs";
import { generarConFallback, proveedorDisponible } from "./ia-fallback.mjs";

const CIMA_BASE = (process.env.CIMA_BASE || "https://cima.aemps.es/cima/rest").replace(/\/$/, "");

const MAX_CANDIDATOS_BUSCADA = 6;
const MAX_CANDIDATOS_OTRA = 2;
const MAX_OTRAS = 5;
const MAX_BYTES_FOTO = 1.5 * 1024 * 1024;
const MEDIA_VALIDOS = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export const ESTADOS = ["identificada", "dudosa", "no_encontrada", "foto_no_valida"];

export function pastillaDisponible() {
  return proveedorDisponible();
}

function normaliza(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

function quitarHTML(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ").replace(/\n\s*/g, "\n").trim();
}

// Búsqueda por nombre en CIMA. Primero con el texto entero (que el usuario
// escriba «omeprazol cinfa 20» es lo más preciso); si no hay nada, con la
// primera palabra, y se ordena por cuántas palabras del texto contiene el
// nombre (así la dosis y el laboratorio que se den pesan).
async function buscarEnCima(nombre, debug) {
  const t0 = Date.now();
  const consulta = async q => {
    const url = `${CIMA_BASE}/medicamentos?${new URLSearchParams({ nombre: q, pagina: "1" })}`;
    const raw = await requestJSON(url, { ttl: 15 * 60 * 1000, label: "CIMA" });
    return { url, items: normalizeList(raw) };
  };
  let { url, items } = await consulta(nombre);
  const primera = normaliza(nombre).split(" ")[0];
  if (!items.length && primera && primera !== normaliza(nombre)) ({ url, items } = await consulta(primera));
  debug.push({ fuente: "CIMA", consulta: nombre, url, status: 200, count: items.length, ms: Date.now() - t0, error: null });

  const palabras = normaliza(nombre).split(" ").filter(p => p.length > 1);
  return items
    .filter(m => m && m.nregistro && m.comerc !== false)
    .map(m => {
      const n = normaliza(m.nombre);
      const fotos = Array.isArray(m.fotos) ? m.fotos : [];
      return {
        nregistro: String(m.nregistro),
        nombre: m.nombre || "",
        lab: m.labtitular || "",
        forma: m.formaFarmaceutica?.nombre || m.formaFarmaceuticaSimplificada?.nombre || "",
        fotoPastilla: fotos.find(f => f.tipo === "formafarmac")?.url || "",
        fotoCaja: fotos.find(f => f.tipo === "materialas")?.url || "",
        urlCima: `https://cima.aemps.es/cima/publico/detalle.html?nregistro=${encodeURIComponent(m.nregistro)}`,
        puntos: palabras.filter(p => n.includes(p)).length + (fotos.some(f => f.tipo === "formafarmac") ? 0.5 : 0)
      };
    })
    .sort((a, b) => b.puntos - a.puntos);
}

// Sección 3 de la ficha técnica («Forma farmacéutica»): es donde el
// laboratorio describe el aspecto (color, forma, ranura, grabado). Se copia
// literal: es el dato con el que se compara, no se resume. Se pide la ficha
// entera, con la misma URL que medicineDetail (misma caché), y se filtra aquí.
async function descripcionFichaTecnica(nregistro, debug) {
  const t0 = Date.now();
  const url = `${CIMA_BASE}/docSegmentado/contenido/1?nregistro=${encodeURIComponent(nregistro)}`;
  try {
    const raw = await requestJSON(url, { ttl: 30 * 60 * 1000, label: "CIMA" });
    const secciones = Array.isArray(raw) ? raw : Array.isArray(raw?.secciones) ? raw.secciones : [];
    const texto = secciones
      .filter(s => String(s.seccion || "") === "3")
      .map(s => quitarHTML(s.contenido))
      .join("\n").trim();
    debug.push({ fuente: "CIMA ficha técnica 3", consulta: nregistro, url, status: 200, count: texto ? 1 : 0, ms: Date.now() - t0, error: null });
    return texto.slice(0, 1200);
  } catch (err) {
    debug.push({ fuente: "CIMA ficha técnica 3", consulta: nregistro, url, status: null, count: 0, ms: Date.now() - t0, error: err instanceof Error ? err.message : String(err) });
    return "";
  }
}

async function descargarFoto(url, debug) {
  if (!url) return null;
  const t0 = Date.now();
  try {
    const ctl = new AbortController();
    const reloj = setTimeout(() => ctl.abort(), 8000);
    const resp = await fetch(url, { signal: ctl.signal });
    clearTimeout(reloj);
    const media = String(resp.headers.get("content-type") || "").split(";")[0].trim();
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    if (!MEDIA_VALIDOS.has(media)) throw new Error(`tipo ${media || "desconocido"}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.length > MAX_BYTES_FOTO) throw new Error("foto demasiado grande");
    debug.push({ fuente: "CIMA foto", consulta: url, url, status: resp.status, count: 1, ms: Date.now() - t0, error: null });
    return { media, data: buf.toString("base64") };
  } catch (err) {
    debug.push({ fuente: "CIMA foto", consulta: url, url, status: null, count: 0, ms: Date.now() - t0, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

async function prepararCandidatos(nombre, max, prefijo, debug) {
  const encontrados = (await buscarEnCima(nombre, debug)).slice(0, max);
  return Promise.all(encontrados.map(async (c, i) => {
    const [descripcion, foto] = await Promise.all([
      descripcionFichaTecnica(c.nregistro, debug),
      descargarFoto(c.fotoPastilla, debug)
    ]);
    return { ...c, ref: `${prefijo}${i + 1}`, descripcion, foto };
  }));
}

const GUION = `Eres el comprobador visual de Enferix. Un profesional sanitario tiene delante la casilla de un blíster preparado por la farmacia (SPD) con varias pastillas, y busca UNA concreta. Tu único trabajo es decir cuál de las pastillas de SU FOTO corresponde al medicamento que busca.

REGLAS QUE NO PUEDES ROMPER:
1. Sólo puedes emparejar con los CANDIDATOS que se te dan, identificados por su referencia (B1, B2… para el que busca; O1.1, O2.1… para otros que puede haber en la casilla). Nunca nombres ni supongas un medicamento que no esté en la lista.
2. Cada candidato trae la FOTO OFICIAL de CIMA-AEMPS (si la hay) y la DESCRIPCIÓN LITERAL de su ficha técnica (forma, color, ranura, grabado). Compara con eso, no con lo que recuerdes de memoria.
3. Fíjate primero en el grabado o la inscripción, después en la forma, el tamaño relativo, la ranura y el color. El color de una foto con mala luz engaña: no decidas sólo por color.
4. Si dos pastillas de la foto encajan con la descripción, o el grabado no se lee, o la foto no deja ver bien las pastillas, el estado es "dudosa" y lo explicas. Un «no lo sé» honesto es mejor que un acierto aparente: una confusión aquí llega a la boca del paciente.
5. Si ninguna pastilla de la foto encaja con el medicamento buscado, el estado es "no_encontrada".
6. Si la foto no muestra pastillas (o no se ven), el estado es "foto_no_valida".
7. Varias presentaciones del mismo medicamento (laboratorios distintos) pueden tener aspecto distinto: basta con que la pastilla encaje con UNA de ellas, y dices con cuál.

RESPONDE ÚNICAMENTE CON UN OBJETO JSON, sin texto antes ni después, con esta forma:
{
  "estado": "identificada" | "dudosa" | "no_encontrada" | "foto_no_valida",
  "pastillas_en_foto": <número de pastillas que ves, o null>,
  "coincidencia": null | {
    "ref": "<referencia B… del candidato con el que encaja>",
    "posicion": "<dónde está en la foto, en palabras: p. ej. «arriba a la derecha», «la segunda por la izquierda»>",
    "caja": [x0, y0, x1, y1],
    "rasgos": "<lo que se VE en la foto que coincide con la descripción oficial: forma, color, ranura, grabado>"
  },
  "dudas": "<si estado es dudosa: qué pastillas se confunden y en qué debe fijarse para distinguirlas; si no, cadena vacía>",
  "otras": [ { "ref": "<O…, p. ej. O1.1>", "posicion": "<dónde está>" } ],
  "explicacion": "<una o dos frases que justifiquen la decisión>"
}
"caja" es el rectángulo aproximado de la pastilla en la foto, en proporciones de 0 a 1 (x0,y0 esquina superior izquierda; x1,y1 inferior derecha). Si no puedes situarla, pon null. En "otras" pon sólo las pastillas de los candidatos O… que reconozcas con seguridad; si no hay, lista vacía. Si el estado es "dudosa", "coincidencia" puede indicar la más probable, pero "dudas" es obligatorio. Escribe en español.`;

function bloquesCandidato(c, rol) {
  const cab = `${c.ref} · ${rol} · ${c.nombre}${c.lab ? ` (${c.lab})` : ""}${c.forma ? ` · ${c.forma}` : ""}`;
  const desc = c.descripcion
    ? `Descripción literal de la ficha técnica (sección 3): «${c.descripcion}»`
    : "La ficha técnica no trae descripción del aspecto para esta presentación.";
  const bloques = [{ type: "text", text: `${cab}\n${desc}\n${c.foto ? "Foto oficial de CIMA a continuación:" : "CIMA no tiene foto de la pastilla de esta presentación."}` }];
  if (c.foto) bloques.push({ type: "image", source: { type: "base64", media_type: c.foto.media, data: c.foto.data } });
  return bloques;
}

function extraerJSON(texto) {
  const a = texto.indexOf("{");
  const b = texto.lastIndexOf("}");
  if (a === -1 || b <= a) throw new Error("La respuesta del modelo no trae un JSON.");
  return JSON.parse(texto.slice(a, b + 1));
}

function cajaValida(caja) {
  if (!Array.isArray(caja) || caja.length !== 4) return null;
  const n = caja.map(Number);
  if (n.some(v => !Number.isFinite(v))) return null;
  const [x0, y0, x1, y1] = n.map(v => Math.min(1, Math.max(0, v)));
  if (x1 - x0 < 0.01 || y1 - y0 < 0.01) return null;
  return [x0, y0, x1, y1];
}

// Lo que el modelo devuelve se valida contra la lista de candidatos: una
// referencia que no existe no llega a pantalla, y una «identificada» sin
// candidato válido baja a «dudosa». Nada del modelo pasa sin comprobar.
export function validarRespuesta(bruta, buscados, otros) {
  const estadoBruto = ESTADOS.includes(bruta?.estado) ? bruta.estado : "dudosa";
  const porRef = new Map(buscados.map(c => [c.ref, c]));
  const otrosPorRef = new Map(otros.map(c => [c.ref, c]));
  let estado = estadoBruto;
  let coincidencia = null;
  const avisos = [];

  const co = bruta?.coincidencia;
  if (co && porRef.has(co.ref)) {
    coincidencia = {
      ref: co.ref,
      posicion: String(co.posicion || "").slice(0, 200),
      caja: cajaValida(co.caja),
      rasgos: String(co.rasgos || "").slice(0, 400)
    };
  } else if (co && co.ref) {
    avisos.push("El modelo propuso un medicamento que no estaba entre los candidatos de CIMA; se ha descartado.");
  }
  if (estado === "identificada" && !coincidencia) {
    estado = "dudosa";
    avisos.push("No se pudo confirmar con qué presentación de CIMA coincide.");
  }
  if ((estado === "no_encontrada" || estado === "foto_no_valida")) coincidencia = null;

  const otras = (Array.isArray(bruta?.otras) ? bruta.otras : [])
    .filter(o => o && otrosPorRef.has(o.ref))
    .slice(0, 8)
    .map(o => ({ ref: o.ref, posicion: String(o.posicion || "").slice(0, 200) }));

  const n = Number(bruta?.pastillas_en_foto);
  return {
    estado,
    pastillasEnFoto: Number.isFinite(n) && n >= 0 && n < 50 ? Math.round(n) : null,
    coincidencia,
    dudas: String(bruta?.dudas || "").slice(0, 600),
    otras,
    explicacion: String(bruta?.explicacion || "").slice(0, 600),
    avisos
  };
}

const publico = c => ({
  ref: c.ref, nregistro: c.nregistro, nombre: c.nombre, lab: c.lab, forma: c.forma,
  fotoPastilla: c.fotoPastilla, fotoCaja: c.fotoCaja, urlCima: c.urlCima, descripcion: c.descripcion
});

/**
 * @param {object} p
 * @param {string} p.buscada   nombre del medicamento que se busca
 * @param {string[]} [p.otras] otros medicamentos que puede haber en la casilla
 * @param {string} p.data      foto en base64, sin prefijo data:
 * @param {string} [p.media]
 */
export async function identificarPastilla({ buscada, otras = [], data, media }) {
  const debug = [];
  const otrasLimpias = otras.map(o => String(o || "").trim()).filter(Boolean).slice(0, MAX_OTRAS);

  const buscados = await prepararCandidatos(buscada, MAX_CANDIDATOS_BUSCADA, "B", debug);
  if (!buscados.length) {
    return { estado: "sin_cima", buscada, candidatos: [], otros: [], debug };
  }
  const otrosListas = await Promise.all(otrasLimpias.map((o, i) =>
    prepararCandidatos(o, MAX_CANDIDATOS_OTRA, `O${i + 1}.`, debug)));
  const otros = otrosListas.flat();
  const otrasSinCima = otrasLimpias.filter((o, i) => !otrosListas[i].length);

  const contenido = [
    { type: "text", text: `MEDICAMENTO QUE BUSCA: «${buscada}». Presentaciones encontradas en CIMA (candidatos B):` },
    ...buscados.flatMap(c => bloquesCandidato(c, "el que busca")),
  ];
  if (otros.length) {
    contenido.push({ type: "text", text: "OTROS MEDICAMENTOS QUE PUEDE HABER EN LA CASILLA (candidatos O), para descartarlos:" });
    contenido.push(...otros.flatMap(c => bloquesCandidato(c, "otro de la casilla")));
  }
  contenido.push({ type: "text", text: "FOTO DEL PROFESIONAL (la casilla del blíster):" });
  contenido.push({ type: "image", source: { type: "base64", media_type: MEDIA_VALIDOS.has(media) ? media : "image/jpeg", data } });
  contenido.push({ type: "text", text: "Responde sólo con el JSON." });

  const { texto, proveedor } = await generarConFallback({
    sistema: GUION,
    contenido,
    maxOutputTokens: 1500,
    effort: "medium",
    etiqueta: `Pastilla ×${buscados.length + otros.length}`
  });
  const resultado = validarRespuesta(extraerJSON(texto), buscados, otros);

  return {
    ...resultado,
    buscada,
    candidatos: buscados.map(publico),
    otros: otros.map(publico),
    otrasSinCima,
    proveedor,
    debug
  };
}
