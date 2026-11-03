/* ═══════════════════════════════════════════════════════════════════════════
   Una llamada a modelo con proveedor de reserva
   ---------------------------------------------------------------------------
   El patrón lo estrenó proyectos-ia.mjs y ya lo repiten la lectura de imagen y
   la explicación de fármaco: Claude primero si hay ANTHROPIC_API_KEY, y si
   falla, Gemini con la clave del servidor. Aquí está una sola vez para que no
   se separen tres copias — si mañana cambia el orden de proveedores, o la
   forma de decidir que una respuesta no vale, debe cambiar en un sitio.

   No sirve para el chat ni para la portada: ésos van en streaming y su
   fallback tiene una condición extra (sólo se reintenta si no se emitió texto,
   porque reintentar a media frase duplicaría la respuesta en pantalla). Aquí
   la llamada es entera: o falla del todo o no falla.

   `contenido` es el mensaje del usuario: una cadena, o un array de bloques
   cuando lleva una imagen. Gemini recibe la traducción de esos bloques a su
   propio formato (inlineData), porque callGemini() del orquestador sólo manda
   texto.
   ═══════════════════════════════════════════════════════════════════════════ */
import { anthropicCall, anthropicDisponible, ANTHROPIC_MODEL } from "./anthropic.mjs";
import { GEMINI_MODEL } from "./orchestrator.mjs";

export function proveedorDisponible() {
  return anthropicDisponible() || Boolean(process.env.GEMINI_API_KEY);
}

/**
 * @param {object} opts
 * @param {string} opts.sistema            guion de sistema
 * @param {string|Array} opts.contenido    mensaje del usuario (texto o bloques)
 * @param {number} [opts.maxOutputTokens]
 * @param {string} [opts.etiqueta]         prefijo del log, p.ej. "Imagen ecg"
 * @param {"low"|"medium"|"high"} [opts.effort]  sólo Claude; por defecto "low"
 * @returns {Promise<{texto:string, proveedor:"anthropic"|"gemini"}>}
 */
export async function generarConFallback({ sistema, contenido, maxOutputTokens = 4096, etiqueta = "IA", effort = "low" }) {
  const t0 = Date.now();

  if (anthropicDisponible()) {
    try {
      const texto = await anthropicCall(sistema, contenido, { model: ANTHROPIC_MODEL, maxOutputTokens, effort });
      console.log(`[${etiqueta}] Claude · ${texto.length} caracteres · ${Date.now() - t0} ms`);
      return { texto, proveedor: "anthropic" };
    } catch (err) {
      const motivo = err instanceof Error ? err.message : String(err);
      console.error(`[${etiqueta}] Claude falló (${motivo}); se reintenta con Gemini.`);
    }
  }

  const texto = await conGemini(sistema, contenido, maxOutputTokens);
  console.log(`[${etiqueta}] Gemini · ${texto.length} caracteres · ${Date.now() - t0} ms`);
  return { texto, proveedor: "gemini" };
}

// Traduce los bloques de Anthropic a las "parts" de Gemini. Una cadena es un
// único bloque de texto.
function aPartsDeGemini(contenido) {
  if (typeof contenido === "string") return [{ text: contenido }];
  return contenido.map(bloque => bloque.type === "image"
    ? { inlineData: { mimeType: bloque.source.media_type, data: bloque.source.data } }
    : { text: bloque.text });
}

async function conGemini(sistema, contenido, maxOutputTokens) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("No hay ningún proveedor de IA configurado en el servidor (falta ANTHROPIC_API_KEY o GEMINI_API_KEY).");
  }
  // GEMINI_BASE_URL apunta a un doble local en pruebas, igual que EPMC_BASE_URL
  // y ANTHROPIC_BASE_URL.
  const base = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
  const url = `${base}/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sistema }] },
      contents: [{ parts: aPartsDeGemini(contenido) }],
      generationConfig: { temperature: 0.2, maxOutputTokens }
    })
  });
  const datos = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(datos?.error?.message || `Gemini respondió HTTP ${resp.status}`);
  const texto = (datos?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
  if (!texto) throw new Error("Gemini devolvió una respuesta vacía.");
  return texto;
}
