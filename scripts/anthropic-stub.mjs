// Doble local de la API de Anthropic (Messages, streaming SSE) para probar el
// bucle de herramientas de Javny sin clave y sin red. Ver docs/pruebas-streaming.md.
//
// Comportamiento:
//   - Si la petición trae `tools` y la conversación aún no tiene ningún
//     tool_result → responde con un bloque de texto y una llamada a
//     calcular_escala (Glasgow 2-2-4), terminando en stop_reason "tool_use".
//   - Si ya hay tool_result (segunda ronda) o no hay tools → responde texto y
//     termina en "end_turn". El texto de la segunda ronda incluye un eco del
//     tool_result recibido, para comprobar que el resultado real llegó al modelo.
//
// El relleno es inconfundible como relleno (regla del CLAUDE.md): nada con
// aspecto clínico, ni dosis, ni citas.
import http from "node:http";

const PORT = Number(process.env.PORT || 3398);

function sse(res, eventos) {
  res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8" });
  let i = 0;
  const tick = setInterval(() => {
    if (i >= eventos.length) { clearInterval(tick); res.end(); return; }
    const e = eventos[i++];
    res.write(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
  }, 25);
}

function bloqueTexto(idx, texto) {
  return [
    { type: "content_block_start", index: idx, content_block: { type: "text", text: "" } },
    ...texto.match(/[\s\S]{1,24}/g).map(t => ({
      type: "content_block_delta", index: idx, delta: { type: "text_delta", text: t }
    })),
    { type: "content_block_stop", index: idx }
  ];
}

http.createServer((req, res) => {
  let b = "";
  req.on("data", c => b += c);
  req.on("end", () => {
    let body = {};
    try { body = JSON.parse(b || "{}"); } catch { /* cuerpo vacío */ }
    const tieneTools = Array.isArray(body.tools) && body.tools.length > 0;
    const yaHayResultado = (body.messages || []).some(m =>
      Array.isArray(m.content) && m.content.some(bl => bl.type === "tool_result"));
    const forzadoTexto = body.tool_choice && body.tool_choice.type === "none";

    const inicio = {
      type: "message_start",
      message: {
        id: "msg_stub_" + Date.now(), type: "message", role: "assistant",
        model: "claude-stub", content: [], stop_reason: null, stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 1 }
      }
    };

    if (tieneTools && !yaHayResultado && !forzadoTexto) {
      // Primera ronda: texto breve + llamada a la herramienta.
      sse(res, [
        inicio,
        ...bloqueTexto(0, "TEXTO DE PRUEBA, NO CLÍNICO: ahora llamo a la herramienta."),
        { type: "content_block_start", index: 1, content_block: { type: "tool_use", id: "toolu_stub_1", name: "calcular_escala", input: {} } },
        { type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: '{"escala":"glasgow","valores":{"ocular":2,"verbal":2,"motora":4}}' } },
        { type: "content_block_stop", index: 1 },
        // Segunda llamada EN PARALELO en el mismo turno: prueba que el bucle
        // ejecuta varias herramientas a la vez y que buscar_en_enferix emite
        // el evento "enlaces" hacia el cliente.
        { type: "content_block_start", index: 2, content_block: { type: "tool_use", id: "toolu_stub_2", name: "buscar_en_enferix", input: {} } },
        { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: '{"consulta":"glasgow","tipo":"cualquiera"}' } },
        { type: "content_block_stop", index: 2 },
        { type: "message_delta", delta: { stop_reason: "tool_use", stop_sequence: null }, usage: { output_tokens: 30 } },
        { type: "message_stop" }
      ]);
      return;
    }

    // Segunda ronda (o llamada sin herramientas): texto final.
    let eco = "";
    if (yaHayResultado) {
      const tr = body.messages.flatMap(m => Array.isArray(m.content) ? m.content : [])
        .filter(bl => bl.type === "tool_result").pop();
      const crudo = typeof tr?.content === "string" ? tr.content : JSON.stringify(tr?.content || "");
      eco = " RESULTADO RECIBIDO (eco de prueba): " + crudo.slice(0, 160);
    }
    sse(res, [
      inicio,
      ...bloqueTexto(0, ("TEXTO DE PRUEBA, NO CLÍNICO. ").repeat(4).trim() + eco),
      { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 40 } },
      { type: "message_stop" }
    ]);
  });
}).listen(PORT, () => console.log(`[anthropic-stub] escuchando en http://127.0.0.1:${PORT}`));
