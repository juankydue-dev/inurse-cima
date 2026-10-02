# Probar el streaming de Javny en local

La consulta de portada y el chat hablan con Gemini a través del servidor. Para
ver el streaming funcionando sin gastar la clave real (y sin depender de que
Google responda), el orquestador acepta una variable de entorno que apunta la
API de Gemini a otro sitio:

| Variable          | Para qué sirve                                                        | En Render |
|-------------------|-----------------------------------------------------------------------|-----------|
| `GEMINI_BASE_URL` | Base de la API de Gemini. Solo para pruebas locales.                   | sin definir (se usa Google) |
| `SOURCE_BUDGET_MS`| Tope por fuente en la fase de búsqueda (por defecto 7000 ms).          | opcional  |

## Doble local de la API

Un servidor mínimo que emite SSE trozo a trozo, igual que Google:

```js
// gemini-stub.mjs
import http from 'node:http';
// El relleno tiene que ser inconfundible: nada de frases con aspecto clínico,
// umbrales, dosis ni citas inventadas (regla del CLAUDE.md).
const TEXTO = ('TEXTO DE PRUEBA, NO CLÍNICO. ').repeat(40);
http.createServer((req, res) => {
  let b = ''; req.on('data', c => b += c);
  req.on('end', () => {
    if (req.url.includes(':streamGenerateContent')) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8' });
      const trozos = TEXTO.match(/[\s\S]{1,60}/g);
      let i = 0;
      const tick = setInterval(() => {
        if (i >= trozos.length) { clearInterval(tick); res.end(); return; }
        res.write('data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text: trozos[i++] }] } }] }) + '\n\n');
      }, 55);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ candidates: [{ content: { parts: [{ text: TEXTO }] } }] }));
  });
}).listen(3399);
```

## Arrancar

```bash
node gemini-stub.mjs &
PORT=3344 GEMINI_API_KEY=stub-key \
  GEMINI_BASE_URL=http://127.0.0.1:3399/models \
  NO_PROXY=localhost,127.0.0.1 node server.mjs
```

Y comprobar los eventos NDJSON que consume la portada:

```bash
curl -N -X POST http://localhost:3344/api/javny/chat/stream \
  -H 'Content-Type: application/json' \
  -d '{"question":"manejo de la sepsis"}'
```

La secuencia esperada es:

```
{"type":"phase","phase":"searching"}
{"type":"phase","phase":"writing","sourceCount":N,"ms":…}
{"type":"sources","sources":{"references":[…]}}
{"type":"delta","text":"…"}        ← uno por fragmento, texto acumulado
{"type":"done","answer":"…","sources":{…}}
```

Las fuentes externas (PubMed, Europe PMC, NICE, CIMA…) requieren salida a
internet: en un entorno sin ella devuelven vacío y la respuesta se redacta sin
referencias, mostrando el estado vacío honesto del panel.

## Doble de la API de Anthropic (con herramientas)

Para probar el camino de Claude —incluido el bucle de herramientas del
frente 3— sin clave y sin red, hay un doble en `scripts/anthropic-stub.mjs`:
en la primera ronda responde texto y una llamada a `calcular_escala` (más
`buscar_en_enferix` en paralelo), y en la segunda devuelve texto con un eco
del `tool_result` recibido, para comprobar que el resultado REAL de la
herramienta llegó al modelo. Su relleno es inconfundible como relleno.

```bash
node scripts/anthropic-stub.mjs &
PORT=3344 GEMINI_API_KEY=stub-key \
  ANTHROPIC_API_KEY=stub-key ANTHROPIC_BASE_URL=http://127.0.0.1:3398 \
  NO_PROXY=localhost,127.0.0.1 node server.mjs
```

Eventos nuevos que emite el chat interno (`/api/javny/chat/stream`) cuando el
modelo usa herramientas — los clientes que no los conocen los ignoran:

```
{"type":"herramienta","estado":"inicio","herramienta":"calcular_escala"}
{"type":"herramienta","estado":"fin","herramienta":"calcular_escala","ok":true,"ms":…}
{"type":"enlaces","enlaces":[{"tipo":"escala","id":"glasgow","titulo":"…"}]}
```

El endpoint público (`/api/javny/public/chat/stream`) y la portada
(`conciso: true`) NO llevan herramientas: debe salir 0 eventos `herramienta`
en ambos. Las herramientas en sí se prueban sin modelo con
`sources/javny-tools.mjs` directamente (ver los `run` de cada una).
