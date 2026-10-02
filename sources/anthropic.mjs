/* ═══════════════════════════════════════════════════════════════════════════
   Llamada a Claude (Anthropic) en streaming, para /api/javny/chat/stream
   ---------------------------------------------------------------------------
   Usa el SDK oficial (@anthropic-ai/sdk). Su .stream() abre la conexión SSE y
   entrega los eventos según llegan; aquí se reenvía cada fragmento en el mismo
   momento, sin acumularlo: el texto completo se compone en el cliente. La
   variable `full` de abajo existe sólo para devolver la respuesta entera al
   terminar (el evento "done" la necesita), nunca para trocearla después.

   El guion clínico NO vive aquí: se importa de guion-clinico.mjs, el mismo que
   usa la llamada a Gemini, para que la respuesta no dependa del proveedor.
   ═══════════════════════════════════════════════════════════════════════════ */
import Anthropic from "@anthropic-ai/sdk";

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export function anthropicDisponible() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let cliente = null;
function getCliente() {
  if (!cliente) {
    // Una clave vinculada a identidad exige además el workspace: sin esta
    // cabecera la API responde 400 "anthropic-workspace-id is required when
    // authenticating with an identity-linked API key". Con una clave normal la
    // cabecera sobra, así que sólo se manda si la variable existe.
    const workspaceId = (process.env.ANTHROPIC_WORKSPACE_ID || "").trim();
    cliente = new Anthropic({
      // maxRetries bajo a propósito: este endpoint es de latencia crítica y ya
      // tiene su propio plan B (Gemini). Con los 2 reintentos por defecto, un
      // fallo de Claude tardaba ~2 s en caer al otro proveedor; con uno, la mitad.
      maxRetries: 1,                      // la clave sale del entorno
      ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {})
    });
    console.log(`[Anthropic] Cliente listo · workspace ${workspaceId ? "sí" : "no configurado"}`);
  }
  return cliente;
}

// Tope de rondas de herramientas por consulta. Protege de un modelo que
// encadene llamadas sin cerrar nunca: en la última ronda se fuerza texto
// (tool_choice "none") en vez de cortar la conexión a medias.
const MAX_RONDAS_HERRAMIENTAS = 5;

// Un resultado de herramienta desbocado (una ficha técnica entera) inflaría el
// prompt de las rondas siguientes; se recorta avisando, nunca en silencio.
function serializarResultado(valor) {
  let s;
  try { s = JSON.stringify(valor); } catch { s = String(valor); }
  if (s.length > 12000) s = s.slice(0, 12000) + "… [resultado recortado por longitud]";
  return s;
}

/**
 * Genera la respuesta con Claude y va entregando cada fragmento a onDelta.
 * Devuelve el texto completo al terminar.
 *
 * Con `herramientas` (catálogo de javny-tools.mjs: {name, description,
 * input_schema, run}), atiende el bucle de tool use: cuando el modelo pide una
 * herramienta se ejecuta su `run`, el resultado vuelve como tool_result y se
 * continúa la MISMA respuesta. El texto de todas las rondas se emite por
 * onDelta según llega, así que para el cliente sigue siendo un único streaming.
 *
 * @param {(chunk: string) => void} onDelta  recibe SÓLO el fragmento nuevo
 */
export async function streamAnthropicCall(systemPrompt, userPrompt, {
  model, history, maxOutputTokens = 4096, conciso = false, herramientas = null, onHerramienta = null
} = {}, onDelta) {
  const client = getCliente();

  const messages = [];
  if (history?.length) {
    for (const m of history.slice(-10)) {
      messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content });
    }
  }
  messages.push({ role: "user", content: userPrompt });

  const tools = herramientas?.length
    ? herramientas.map(h => ({ name: h.name, description: h.description, input_schema: h.input_schema }))
    : null;

  let full = "";
  let nFragmentos = 0, tPrimero = null, tUltimo = null, rondas = 0;
  const usadas = [];
  const t0 = Date.now();

  for (;;) {
    rondas++;
    const ultimaRonda = rondas >= MAX_RONDAS_HERRAMIENTAS;

    // .stream() = SSE nativo del SDK. El evento "text" llega por cada trozo de
    // texto que produce el modelo, no al final.
    const stream = client.messages.stream({
      model: model || ANTHROPIC_MODEL,
      max_tokens: maxOutputTokens,
      system: systemPrompt,
      messages,
      // La portada quiere una respuesta corta y rápida; el chat, desarrollo largo.
      // El esfuerzo bajo recorta el razonamiento previo, que es lo que retrasaba
      // el primer fragmento.
      output_config: { effort: conciso ? "low" : "high" },
      ...(tools ? { tools, ...(ultimaRonda ? { tool_choice: { type: "none" } } : {}) } : {})
    });

    // El texto de una ronda nueva no debe pegarse a la frase que el modelo
    // dejó a medias antes de llamar a la herramienta: se separa con un salto,
    // emitido también como delta para que pantalla y respuesta final coincidan.
    let textoEnRonda = false;
    stream.on("text", (fragmento) => {
      if (!fragmento) return;
      if (!textoEnRonda && full && !/\s$/.test(full)) {
        full += "\n\n";
        if (onDelta) onDelta("\n\n");
      }
      textoEnRonda = true;
      nFragmentos++;
      if (tPrimero === null) tPrimero = Date.now() - t0;
      tUltimo = Date.now() - t0;
      full += fragmento;
      if (onDelta) onDelta(fragmento);   // ← se emite YA, sin esperar al resto
    });

    const mensajeFinal = await stream.finalMessage();

    // Una negativa por seguridad llega con HTTP 200: hay que mirar stop_reason
    // antes de dar por buena la respuesta (y antes de ejecutar herramientas:
    // una tool_use cortada por una negativa no se ejecuta).
    if (mensajeFinal.stop_reason === "refusal") {
      const cat = mensajeFinal.stop_details?.category || "sin categoría";
      throw new Error(`Claude declinó responder a esta consulta (${cat}).`);
    }
    if (mensajeFinal.stop_reason === "max_tokens") {
      // Si hay texto, se da por buena la respuesta recortada (como siempre);
      // pero unos argumentos de herramienta truncados no se ejecutan jamás.
      if (mensajeFinal.content.some(b => b.type === "tool_use")) {
        throw new Error("Claude agotó max_tokens a mitad de una llamada a herramienta.");
      }
    }

    if (mensajeFinal.stop_reason !== "tool_use") {
      console.log(`[Anthropic stream] ${nFragmentos} fragmentos · primero a los ${tPrimero ?? "n/d"} ms · ` +
        `último a los ${tUltimo ?? "n/d"} ms · modelo ${mensajeFinal.model} · stop=${mensajeFinal.stop_reason}` +
        (usadas.length ? ` · herramientas=${usadas.join(",")} · rondas=${rondas}` : ""));
      if (!full.trim()) {
        throw new Error(`Claude devolvió una respuesta vacía (motivo: ${mensajeFinal.stop_reason || "desconocido"}).`);
      }
      return full.trim();
    }

    // ── Ronda de herramientas ──────────────────────────────────────────────
    const usos = mensajeFinal.content.filter(b => b.type === "tool_use");
    messages.push({ role: "assistant", content: mensajeFinal.content });

    const resultados = await Promise.all(usos.map(async (uso) => {
      const def = herramientas.find(h => h.name === uso.name);
      const tUso = Date.now();
      usadas.push(uso.name);
      if (onHerramienta) onHerramienta({ estado: "inicio", herramienta: uso.name });
      let contenido, esError = false;
      if (!def) {
        contenido = `Herramienta desconocida: ${uso.name}`;
        esError = true;
      } else {
        try {
          contenido = serializarResultado(await def.run(uso.input || {}));
        } catch (err) {
          contenido = `La herramienta falló: ${err instanceof Error ? err.message : err}`;
          esError = true;
        }
      }
      if (onHerramienta) onHerramienta({ estado: "fin", herramienta: uso.name, ok: !esError, ms: Date.now() - tUso });
      console.log(`[Anthropic tools] ${uso.name} → ${esError ? "error" : "ok"} en ${Date.now() - tUso} ms`);
      return { type: "tool_result", tool_use_id: uso.id, content: contenido, ...(esError ? { is_error: true } : {}) };
    }));

    messages.push({ role: "user", content: resultados });
  }
}

/**
 * Llamada NO streaming, para respuestas cortas que el servidor necesita
 * enteras antes de devolver nada al cliente (p.ej. la estructura de un
 * proyecto: es un JSON pequeño, no hay fragmento que valga la pena emitir
 * suelto). Usa el mismo cliente y las mismas reglas de negativa/vacío que
 * streamAnthropicCall.
 *
 * `userPrompt` admite además un ARRAY de bloques de contenido, que es como se
 * manda una imagen ([{type:"image",...},{type:"text",...}]) en la lectura de
 * ECG y radiología. Con una cadena se comporta exactamente igual que antes.
 */
export async function anthropicCall(systemPrompt, userPrompt, {
  model, maxOutputTokens = 2048
} = {}) {
  const client = getCliente();
  const mensaje = await client.messages.create({
    model: model || ANTHROPIC_MODEL,
    max_tokens: maxOutputTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    output_config: { effort: "low" }
  });

  if (mensaje.stop_reason === "refusal") {
    const cat = mensaje.stop_details?.category || "sin categoría";
    throw new Error(`Claude declinó responder a esta consulta (${cat}).`);
  }
  const texto = (mensaje.content || [])
    .filter(bloque => bloque.type === "text")
    .map(bloque => bloque.text)
    .join("")
    .trim();
  if (!texto) {
    throw new Error(`Claude devolvió una respuesta vacía (motivo: ${mensaje.stop_reason || "desconocido"}).`);
  }
  return texto;
}
