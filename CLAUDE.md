# Enferix / iNurse-CIMA — Guía para Claude

Este archivo lo lee Claude Code automáticamente al arrancar cualquier sesión
sobre este repositorio. Recoge la rama viva, las convenciones que hay que
respetar, y el estado de la tarea en curso.

## Estado de la rama principal

**`main`** está al día con el **Frente 1 de `javny-inteligente`** (PR #142,
mergeado y desplegado vía `autoDeploy: true`) y con la **Prioridad 3**
(PR #141). Contiene:

- **F1 · Consulta de portada en streaming** — la caja `#nxAsk` del inicio
  responde en su propio panel (`p33-consulta-portada`), en vez de abrir el
  chat del avatar y enviar por el usuario. NDJSON contra
  `/api/javny/chat/stream`; indicador de fases (`searching` → `writing`,
  evento `phase` nuevo del orquestador); referencias al final, con las citas
  `[n]` enlazadas solo cuando ese número existe en la lista del servidor.
  Tope por fuente en la búsqueda (`SOURCE_BUDGET_MS`, 7 s): antes la
  redacción esperaba a la última fuente en contestar.
  La portada envía el **mismo contexto interno que el chat** (fichas,
  vademécum, biblioteca, cercanos) reutilizando su recuperación, publicada
  como `window.EnferixGuideRetrieve` — no una copia.
  Latencia instrumentada: marcas en consola (envío / contexto / primer token /
  fin) y `scripts/medir-latencia-javny.mjs`.
  **El modo interactivo del avatar no cambia**, y así debe seguir.
- **F1b · La generación no espera a las fuentes externas** (PR #143) — el
  modelo arranca de inmediato con el contexto interno; las búsquedas corren en
  paralelo con tope de 5 s por fuente (`SOURCE_BUDGET_MS`) y sus referencias se
  emiten en cuanto llegan, sin bloquear nunca la respuesta.
  Como al redactar no hay literatura delante, la instrucción del prompt se
  bifurca: **sin literatura se le prohíbe citar `[n]`** (serían inventados) y se
  le pide nombrar la ficha de Enferix; el bloque del panel se llama entonces
  "Evidencia relacionada", con nota de que no respalda cada frase.
  Instrumentación en el servidor: log por fuente (`europepmc=ok/820ms/8`) y
  **tiempo hasta el primer fragmento de Gemini**.

- **F1c · La portada espera a las fuentes y responde corta y citada** (PR #144)
  — medido en producción, las fuentes externas responden en **~950 ms**, así que
  se esperan (tope `WAIT_SOURCES_MS`, 3 s) en vez de sacrificarlas: cuesta ~1 s y
  la respuesta sale fundamentada. Si la espera se agota, se redacta solo con las
  fichas y la respuesta lo dice en su primera línea; las referencias tardías se
  adjuntan como "Evidencia relacionada" con nota de que no fundamentan el texto.
  El prompt lleva las fichas como fuente **prioritaria** y la literatura como
  **complementaria**, citando ambas en el texto.
  **Respuesta concisa (2000-3000 caracteres) SOLO en la portada**, vía el
  parámetro `conciso`; el chat del avatar no lo envía y mantiene su desarrollo
  largo — al tocar el orquestador, comprobar siempre que sigue así.
  El tope por fuente (`SOURCE_BUDGET_MS`, 2,5 s) debe quedar **por debajo** de la
  espera global: siendo iguales competían y la fase se daba por buena justo al
  expirar, informando "a tiempo" con cero referencias.
  `EPMC_BASE_URL` apunta Europe PMC a un doble local para probar los dos caminos.

- **F1d · Fragmentos incrementales y salida sin retenciones** (PR #145) — el
  evento `delta` llevaba el texto **acumulado** en cada fragmento (cientos de KB
  por respuesta); ahora viaja sólo el trozo nuevo (`chunk`) y el texto se acumula
  en el cliente. **Los tres consumidores** lo hacen así: portada, chat del avatar
  y `javny-publico.html` — al tocar el formato del evento hay que actualizar los
  tres. En el endpoint: `flushHeaders()`, `Connection: keep-alive` y
  `setNoDelay`, además del `no-transform` y `X-Accel-Buffering: no` que ya había.
  La compresión NUNCA ha tocado `/api`: sólo se aplica en `sendFile`, por
  extensión de fichero (este servidor no usa Express).
  Log nuevo que separa el tiempo del modelo del del transporte:
  `[Gemini stream] N fragmentos · primero a los X ms · último a los Y ms`.

- **F1e · La redacción la hace Claude, con Gemini de reserva** (PR #146) — el
  endpoint `/api/javny/chat/stream` llama a la **API de Anthropic** con su
  streaming nativo (`sources/anthropic.mjs`, SDK oficial `@anthropic-ai/sdk`,
  `client.messages.stream()` + evento `text`). El orquestador y el contexto de
  fichas NO cambiaron: sólo cambia quién redacta.
  **El guion clínico vive en `sources/guion-clinico.mjs`**, importado por las
  DOS llamadas: si se duplica, la respuesta clínica cambia según el proveedor
  que atienda, y eso no puede pasar.
  Fallback: si Claude falla **antes** de emitir texto, se reintenta con Gemini
  y el cliente recibe un evento `aviso`; si ya había texto en pantalla, el error
  sube tal cual (reintentar duplicaría la respuesta a media frase).
  `ANTHROPIC_API_KEY` en Render activa este camino; sin ella se usa Gemini.
  **`ANTHROPIC_WORKSPACE_ID`**: una clave vinculada a identidad exige además la
  cabecera `anthropic-workspace-id`, o la API responde 400. Se manda sólo si la
  variable existe (con una clave normal sobra). El arranque lo dice en el log:
  `[Anthropic] Cliente listo · workspace sí | no configurado`.
  `ANTHROPIC_MODEL` (por defecto `claude-opus-5`) y `ANTHROPIC_BASE_URL` (doble
  local en pruebas). La portada pide `effort: "low"`; el chat mantiene `"high"`.
  Log: `[Anthropic stream] N fragmentos · primero a los X ms · … · stop=…` —
  ojo a `stop=refusal`, que llega con HTTP 200 y hay que comprobar aparte.

  **Cómo medir el contexto de la portada**: las fichas las monta el NAVEGADOR
  (`EnferixGuideRetrieve`). Medir el endpoint con `curl` manda `context` vacío
  por construcción, y parece un fallo del servidor sin serlo.

  **Diagnóstico abierto de latencia** — medido en producción antes de F1b:
  contexto 15 ms, primer token **34.584 ms**, respuesta completa **31 ms
  después**. Que el texto entero llegue en 31 ms significa que Gemini no emite
  de forma incremental: entrega la respuesta ya terminada. Las búsquedas no lo
  explicaban (estaban topadas). La reordenación de F1b quita del camino
  crítico los segundos de búsqueda, pero **no bajará el primer token de 3 s si
  el modelo sigue sin emitir hasta terminar**. Lo zanja la línea de log
  `[Orquestador] Primer fragmento de Gemini a los N ms`: si marca decenas de
  miles, el tiempo es del modelo (revisar qué modelo corre en Render, si lleva
  razonamiento, y el tamaño del prompt), no de la orquestación.
  Con el dato de las fuentes (~950 ms) queda descartado que las búsquedas
  explicasen los 34 s: como mucho aportaban uno. La palanca que queda es la
  **longitud de la respuesta** (F1c la baja a 2000-3000 caracteres), porque el
  reloj del primer token corre hasta que el modelo termina de generar.
- **P3.1 · Navegador NANDA · NOC · NIC** — overlay con 3 columnas enlazadas
  en escritorio y 3 pasos con migas de pan en móvil. Datos del diccionario
  NNN curado (`nnn_codes.json`, vínculos verificados; el resto pendientes
  editorialmente). Endpoint `GET /api/terminology/dictionary` (cache 5 min).
  Buscador por etiqueta y código; i18n ES/CA solo en el chrome.
- **P3.2 · Evidencia relacionada al final de ficha** — bloque al final de
  cada ficha clínica con resultados de Europe PMC + NICE + OpenFDA,
  agrupados por fuente, ordenados por año descendente, con enlace externo.
  Endpoint `GET /api/evidencia-relacionada?q=<término>&drugs=<f1,f2,…>` con
  probe nativo por fuente y `debug` (URL, status, count, ms, error). OpenFDA
  se busca por los fármacos editoriales de la propia ficha (`evidenceDrugs`),
  nunca por la indicación clínica general. Dos estados vacíos honestos
  ("sin resultados" / "fallo con reintentar") más el de "sin fármacos
  editoriales" en OpenFDA. Aislamiento entre fichas verificado con
  navegación real.
- Corrección de paso: la barra de pestañas sticky y los listeners de scroll
  de `p21-ficha-larga.js` ya no se quedan colgados de la ficha anterior al
  navegar entre fichas.

**Tarea en curso — `javny-inteligente`**: mejora del asistente Javny en tres
frentes. El primero ya está en `main`; quedan los dos siguientes:

1. ~~**Streaming en la consulta de portada**~~ — hecho (PR #142, ver arriba).
2. ~~**Guion de sistema con modo consulta y modo emergencia**~~ — hecho
   (PR #148). Vive en `sources/guion-clinico.mjs`, compartido por los dos
   proveedores. **Emergencia**: situación urgente EN CURSO (lo delata que algo
   está pasando, no que se pregunte por ello); 112 o equipo de parada primero,
   luego UNA acción, sin bibliografía ni citas ni vigencia de guías; ante la
   duda entre modos, emergencia. **Sin fuente que cubra esa emergencia responde
   igualmente**, con el criterio general de primeros auxilios (PR #157): sólo
   dosis, medicación, protocolo específico e invasivo exigen fuente.
   **Consulta** (por defecto): cada afirmación
   atribuida a su ficha o su cita, fichas por delante de la bibliografía,
   discrepancias señaladas, huecos de las fuentes dichos.
   **P3.4 · urgencias en lenguaje natural** (PR #149): la recuperación de fichas
   puntúa por solapamiento de palabras, así que "no responde y no respira" no
   enganchaba soporte vital y, peor, devolvía fichas ajenas (MAGALDRATO,
   Estatus epiléptico) por palabras vacías como "paciente" — ruido clínico en
   el contexto, peor que no recuperar nada. `p34-urgencias-lenguaje.js` traduce
   el coloquial de urgencia a los términos de las fichas ANTES de buscar; al
   añadir una entrada nueva, **comprobar que engancha una ficha real** de
   `guias.js`, no suponerlo. Expone `detectar`, `expandir` y `enCurso`.
   `enCurso()` separa la urgencia real de la consulta teórica sobre una
   urgencia ("cómo se maneja un atragantamiento"): con ella se decide no pintar
   bibliografía en el panel, y confundir ambas rompe una de las dos.
   **P3.5 · ruido de recuperación** (PR #150). Dos criterios que conviene no
   deshacer sin leer esto:
   (a) **Ámbito de la ficha en emergencia**: en una parada se servía la ficha de
   donación en asistolia (Maastricht III) — lleva "soporte vital" en sus tags
   por la LTSV, así que competía por léxico, y la expansión de P3.4 la subía.
   `esGestion()` la aparta SÓLO en urgencia en curso, por el **dominio**
   declarado en título+tags+fuente (donación/trasplantes, coordinación,
   legislación, trámites…), exigiendo **dos marcadores**: con uno, una ficha
   clínica que cite "protocolo del centro" caería sin merecerlo. No es lista de
   títulos (no envejece) y no borra nada del catálogo: en consulta compite igual.
   Se aplica en las DOS recuperaciones — `retrieveDetailed` y el `searchINurse`
   propio de Live — con la misma definición; duplicarla las haría discrepar.
   (b) **Relevancia de las citas**: el filtro por término clínico se aplica SÓLO
   a fuentes **generalistas** (Crossref, Semantic Scholar), que indexan todo el
   DOI publicado y de donde salieron "manejo del maíz/suelo/soya". Europe PMC,
   PubMed, NICE, OMS y ClinicalTrials pasan sin filtro: su corpus ya es
   biomédico. Exigir el término a TODAS descartaba literatura válida en inglés
   ("Management of hyperkalemia") cuando el término no está en `MEDICAL_TERMS`.
   **Trampa al tocarlo**: el orquestador añade al contexto instrucciones de
   estructura, extensión y citación `[n]` que contradicen al modo emergencia;
   el guion declara que su formato prevalece sobre ellas. Si se quita esa
   frase, el modo emergencia queda anulado en la práctica.
3. **Function calling con las herramientas de la app** — implementado en la
   rama `claude/youthful-tesla-3q8gg4` (PR en draft, pendiente del OK de
   Juanky). Javny invoca las fuentes/acciones REALES de Enferix como *tools*
   de la API de Anthropic (la redacción la hace Claude desde F1e; el fallback
   de Gemini NO lleva herramientas: mejor una respuesta sin ellas que
   ninguna). Lo que hay que saber antes de tocarlo:
   - **Catálogo y guion**: `sources/javny-tools.mjs` define las cinco
     herramientas (`calcular_escala`, `dilucion_farmaco`,
     `interacciones_farmacos`, `buscar_en_enferix`, `centros_cercanos`) y el
     `GUION_HERRAMIENTAS`, que se añade al guion SOLO cuando las herramientas
     van en la llamada — contarle herramientas al Gemini de reserva, que no
     las tiene, sería pedirle que las alucine. El bucle de tool_use vive en
     `streamAnthropicCall` (`sources/anthropic.mjs`): tope de 5 rondas y en
     la última se fuerza texto con `tool_choice: none`; una negativa o un
     `max_tokens` a mitad de llamada no ejecuta NADA.
   - **Opt-in por endpoint**: `orchestrateStream` solo activa herramientas si
     el llamador pasa `herramientas: true` Y no es `conciso`. Hoy solo las
     pide el chat interno (`/api/javny/chat/stream`); la portada (conciso,
     vive de la latencia) y el público anónimo quedan fuera a propósito.
     `JAVNY_TOOLS=0` las apaga en Render sin desplegar.
   - **Escalas**: el servidor carga el bundle VALIDADO
     (`public/data/escalas-clinicas.js`) con `node:vm` vía
     `sources/datos-app.mjs` — nunca una copia. Los selects se resuelven por
     etiqueta (en NEWS2/MEWS los puntos se repiten entre opciones, el número
     no identifica); una constante medida (FR=22) solo se traduce a su tramo
     cuando TODAS las opciones del campo son tramos puros (los compuestos de
     APACHE «≥ 41 o ≤ 29,9» y las SpO₂ con «con/sin oxígeno» se piden por
     etiqueta). Si falta UN select, se calcula con todas sus opciones y solo
     se omite si el resultado no cambia (así «Escala 1» no exige la SpO₂ de
     la escala 2). Campos de más, de menos o fuera de rango → error honesto
     con la especificación, nunca cálculo a medias.
   - **Interacciones**: `sources/interacciones.mjs` es el criterio del
     comprobador del cliente (`inurse-interacciones-js.js`) portado al
     servidor: misma lista de sales, mismo `principiosActivos`, mismo
     `buscarMencion`. El cliente no puede importar módulos del servidor, así
     que HOY ESTÁN DUPLICADOS: al tocar uno, replicar en el otro (las notas
     de cabecera de ambos archivos lo recuerdan). `medicineDetail` se movió
     de server.mjs a `sources/cima.mjs` por esto mismo.
   - **Ubicación**: las coordenadas viajan en `body.ubicacion` desde el chat
     del avatar, y SOLO si el permiso ya está concedido —
     `EnferixNearby.getCoords` comprueba la Permissions API y nunca dispara
     el aviso del navegador en mitad de una conversación (el flujo que sí
     pregunta sigue siendo el de siempre: panel de cercanos /
     `getContextText` con la regex). El modelo no ve las coordenadas ni puede
     inventarlas: las consume `centros_cercanos`, que reutiliza
     `sources/cercanos.mjs` — la MISMA combinación Google/Overpass que
     `/api/nearby`, extraída de esa ruta para que panel y chat cuenten lo
     mismo.
   - **Perfusiones**: `dilucion_farmaco` devuelve los datos EDITORIALES del
     formulario (diluciones, dosis, bolo, notas con vía/compatibilidad) y NO
     calcula mL/h: las fórmulas de `runPerf` siguen mezcladas con el DOM en
     `inline-script-6388.js`, y transcribirlas a mano era crear una segunda
     copia clínica. Extraerlas como función pura compartida es deuda de la
     fase siguiente.
   - **Eventos NDJSON nuevos**: `herramienta` (estado inicio/fin, pinta la
     nota «🔧 …» en el indicador del chat) y `enlaces` (botones P36 bajo la
     respuesta que abren `openDoc` / `EnferixEscalas.openCalc`). Los clientes
     que no los conocen los ignoran sin romperse (portada incluida).
   - **Pruebas sin clave**: `scripts/anthropic-stub.mjs` +
     `docs/pruebas-streaming.md` (sección del doble de Anthropic). CIMA está
     bloqueado desde el contenedor de desarrollo: las funciones de
     coincidencia se prueban en seco y la integración real se verifica en
     despliegue.

El frente 3 cierra `javny-inteligente` cuando se mergee; la deuda que deja
(fórmulas de perfusión como función pura, unificar el criterio de
interacciones cliente/servidor) queda apuntada arriba.

**Detalle del frente 2 según el usuario**: modo emergencia se activa cuando el
mensaje indica situación urgente **en curso** (parada, atragantamiento,
inconsciencia, sangrado masivo) y responde corto, imperativo, paso a paso,
**una acción por mensaje**, sin bibliografía ni menciones a vigencia de guías,
priorizando avisar al 112 y las maniobras inmediatas. Modo consulta responde
completo, citando siempre la ficha o fuente, y diciendo explícitamente cuándo
algo no está en sus fuentes en vez de rellenar. El contenido clínico de ambos
modos sale exclusivamente de las fuentes del orquestador.

**Detalle del frente 3 según el usuario**: las herramientas son (1) calcular
escalas llamando al **código validado de las calculadoras existentes** — el
modelo solo extrae parámetros y presenta el resultado con su interpretación,
jamás calcula él; (2) diluciones, vías y compatibilidades del formulario de
fármacos; (3) interacciones vía la conexión CIMA existente; (4) enlazar la
ficha o escala relevante de la app. Cada herramienta responde solo con datos
reales de la app; si no hay dato, se dice que no está disponible.

### Javny Live — lo que hay que saber antes de tocarlo

**Live está revertido al estado anterior a la recuperación por turno** (5 de
septiembre). Punto de vuelta: `40800db` (PR #150). Se deshacen los PR #151 a
#157 **en Live** —y sólo en Live—: la recuperación determinista por turno, el
contexto inyectado, la regla de "sin fuente no hay indicación", el cuadro
clínico persistente, la inyección única con señal de actividad, el arranque
inmediato en urgencia, el bonus de coherencia y el criterio de P3.5.

**Por qué, en palabras del usuario**: "cada capa que añadimos ha degradado la
fluidez, y la fluidez era el producto". Live es voz en la calle; una respuesta
que tarda no es una respuesta.

**Lo que vuelve con ello, y está asumido**: la búsqueda es otra vez una
*function call* que el modelo lanza si le parece, y en una parada la brevedad
que le pide el guion gana — turnos con indicaciones y el panel de fuentes
vacío, de forma intermitente. Decisión consciente de Juanky, tomada sabiendo
esto: se prefiere ese fallo a la pérdida de inmediatez. **No lo "arregles" otra
vez sin hablarlo**: ese arreglo es exactamente lo que se acaba de revertir.

El estado completo anterior al revert está en la rama
**`respaldo/live-antes-del-revert`** (`3b5f624`), por si hay que recuperar algo
puntual.

Lo que sigue siendo cierto del Live actual:

- **Live tiene su PROPIA recuperación** (`searchINurse` en
  `inurse-v26-live-js.js`), independiente de `retrieveDetailed`. La lanza el
  modelo como herramienta (`search_inurse`), no el código.
- **`searchINurse` devuelve `{query, notice, resultados}`**, NO `{sources,
  context}`. `resultados` son los *payload* (`titulo`, `fuente`, `resumen`,
  `contenido`). Leer los campos equivocados no da error: da vacío.
- **Puntúa por coincidencia LITERAL de palabras** (+9 título, +4 meta, +1
  cuerpo) y con `includes` de subcadena: "fuente" casa dentro de "fuentes", y
  "presion" dentro de "inmunosupresion". El criterio de P3.5 que corregía esto
  se fue con el revert; `p35-coincidencia-clinica.js` sigue en el repo y
  cargado en `index.html`, pero **ya no lo usa nadie**.
- **Ámbito de la ficha en urgencia** (PR #150, que es el punto de vuelta y por
  tanto se queda): `esGestion()` aparta las fichas de dominio organizativo
  (donación y trasplantes, coordinación, legislación) durante una urgencia en
  curso, con la misma definición de `p34-urgencias-lenguaje.js` que usa la
  portada. Duplicar el criterio las haría discrepar.
- **Documentación de producto fuera del índice clínico** (rescatado del PR #152
  al revertir). La Biblioteca mezcla contenido clínico con documentación del
  propio producto, que comparte vocabulario con lo que un profesional dice
  cuando habla DE la app ("no tienes la fuente") y ganaba la búsqueda. Se
  excluye por **categoría editorial**, no por lista de títulos: 105 de las 1.676
  fichas. **Ojo**: no todo lo que lleva "fuente" en el título es documentación
  — "Fuentes ocultas de hemorragia en trauma" y "Fuentes de células y
  acondicionamiento" son clínicas y siguen dentro (verificado contra el corpus).
- **El panel del caso recoge lo dicho, no lo inferido** (regla 9b del guion,
  rescatada al revertir): ponía "varón" cuando sólo se había dicho "mi padre".
  Sexo, edad, antecedentes y diagnóstico no se completan por suposición; hueco o
  datos pendientes. Lo que se muestra en pantalla se lee como dato del caso, y
  un dato inventado es peor que un hueco aunque acierte.
- **Los números de emergencia dictados por voz** (rescatado del PR #151):
  `sanitizeTranscript` normaliza "alumno uno dos" → 112 llamando a
  `normalizarEmergencias` de p34. El reconocimiento de voz oye los dígitos
  sueltos y los encaja en la palabra más probable; si eso llega al modelo, la
  indicación de avisar al 112 se pierde.
- **Los dos orígenes traen el payload con campos DISTINTOS**: Guías da
  `contenido` (heading/body); Biblioteca da `definicion`, `alertas`,
  `valoracion_inicial`, `algoritmo`, `cuidados_enfermeria`,
  `criterios_escalada`.
- **La Biblioteca virtual no pasa por el servidor**: Live abre un WebSocket
  directo del navegador a Google. Por eso su único log auditable es la consola
  del navegador, y por eso una línea de Live nunca aparecerá en los registros de
  Render.
- El guion de Live es SUYO (`SYSTEM_INSTRUCTION` en su archivo), no el
  `guion-clinico.mjs` de la portada y el chat. Son dos textos distintos.

**Lo que NO se revirtió y sigue vivo en la portada y el chat**: la migración a
Anthropic, el streaming, `guion-clinico.mjs` con sus dos modos —incluido el
cambio del PR #157, por el que en MODO EMERGENCIA se responde con el criterio
básico de primeros auxilios aunque no haya fuente—, y toda la recuperación de
consulta. La portada no se toca.

### Proyectos con Javny — Fase 1

Rehecho de arriba abajo (rama `claude/proyectos-javny-fase1`). Antes se
llamaba "Proyectos ConVive" — el nombre viene de los tres sitios que llevaban
el resto: el menú (`inline-script-17559.js`), el comando de voz
(`inurse18-voice-js.js`) y la clave de localStorage
`inurse_vivi_projects_v1`. Los tres se renombraron; la clave nueva es
`enferix_proyectos_v2`, con migración automática desde la antigua.

**Auditoría previa, para quien retome esto**: la app ya tenía un sistema de
cuentas real y operativo antes de esta fase —`db.mjs`/`auth.mjs`, bcrypt,
cookies de sesión, `/api/auth/register|login|logout|me`— y una sincronización
GENÉRICA de localStorage (`window.EnferixCloud` en
`public/js/core/inline-script-3125.js`, parchea `setItem`/`removeItem` y sube
cualquier clave como blob a `user_data`). Esa sincronización sigue intacta y
sigue cubriendo el resto de la app; Proyectos NO la usa, porque un blob no
sirve para lo que pide esta fase (columnas, progreso calculable, borrar un
proyecto suelto). Proyectos tiene su propia tabla.

- **Tabla `proyectos`** (`db.mjs`), colgada de `user_id` (la tabla `users` que
  ya existía). Columnas: `id, user_id, titulo, tipo, descripcion, idioma,
  tono, destinatario, normas_citacion, extension_objetivo, institucion_tutor,
  fuentes (jsonb), estado, estructura (jsonb: [{id,titulo,orden,estado,
  contenido}]), version, creado, actualizado`. Acceso en `proyectos-db.mjs`,
  SIEMPRE `WHERE id=$1 AND user_id=$2` — nunca se confía en el id del
  proyecto solo.
  **`descripcion` no estaba en la lista original del usuario** ("al menos
  estas columnas"): se añadió porque las acciones de IA del editor (deuda de
  abajo) la necesitan como contexto, igual que antes usaban `objective`.
  **`attachments` y `versions` NO tienen columna** (fuera de alcance de esta
  fase): viven solo en el objeto en memoria/localStorage y `paraGuardar()` los
  descarta sin fallar al guardar en la nube — no sobreviven a un cambio de
  dispositivo si el proyecto está en Postgres.
  En Render, la base es `inurse-db` (Oregón), enlazada a mano desde el
  dashboard — `DATABASE_URL` NO está en `render.yaml`.
- **`/api/proyectos/estructura` (POST) no toca la base de datos ni exige
  sesión**: es una llamada a modelo, como la consulta de portada, no una
  operación sobre "mis proyectos". Usa `sources/proyectos-ia.mjs`: Anthropic
  primero (`anthropicCall`, no streaming — es un JSON corto, no hay fragmento
  que valga la pena emitir suelto) y Gemini de reserva con la clave del
  servidor (`callGemini`, exportado desde `orchestrator.mjs` para esto). La
  clave nunca vuelve al cliente.
  Parte de la plantilla del tipo elegido y le pide al modelo que la ADAPTE a
  la descripción, nunca que la invente — el prompt lleva la plantilla
  numerada y pide entre `plantilla.length` y `plantilla.length+6` apartados.
- **`sources/plantillas-proyectos.mjs`** es la única fuente de los 11 tipos de
  documento (protocolo, procedimiento, cuidados NANDA·NOC·NIC, mejora,
  sesión clínica, investigación, TFG, TFM, revisión bibliográfica, evento
  adverso, libre). El cliente NO lleva su propia copia: pide el catálogo a
  `GET /api/proyectos/tipos` (cacheable, estático) para construir el
  `<select>`, así que no pueden desincronizarse. TFG/TFM/revisión comparten
  plantilla (`ACADEMICA`), tal como se pidió.
- **CRUD** en `server.mjs`: `GET/POST /api/proyectos`,
  `GET/PUT/DELETE /api/proyectos/:id` (id por `pathname.split('/').pop()`,
  como ya hacía `/api/cima/medicine/:id`). Todos exigen sesión + `DB_ENABLED`.
  `PUT` es actualización PARCIAL: solo toca los campos presentes en el body,
  para que el guardado automático no tenga que reenviar el proyecto entero.
  **`estructura` se reemplaza entera en cada PUT** (no hay merge por
  apartado): el cliente tiene que mandar siempre el `id` de cada apartado
  existente, o el servidor le asigna uno nuevo y pierde la referencia.
- **Persistencia con fallback**: si hay sesión (`GET /api/auth/me` ya
  devuelve usuario), todo va a Postgres. Sin sesión, seguimos con
  `localStorage['enferix_proyectos_v2']`, mismo formato que el servidor (un
  solo tipo de objeto en todo el cliente, cero traducción de campos entre
  modo local y modo nube). Al iniciar sesión con proyectos locales
  pendientes, se suben uno a uno (`migrarNubeSiHaceFalta`); cada uno se marca
  `_migrado` al conseguirlo, y el localStorage solo se borra cuando TODOS lo
  consiguen — así un fallo a mitad no duplica nada al reintentar.
- **Dictado**: el botón de la descripción (`in63DictDescripcion`) no
  implementa su propio reconocimiento de voz. Lleva un id que empieza por
  `in63Dict` dentro de un `.in63-field`, que es exactamente el patrón que ya
  intercepta el listener global de voz en `inurse21-master-js.js`
  (`document.addEventListener('click', ..., true)` + `EnferixVoiceManager`).
  Es el mismo mecanismo que ya usaba —sin que nadie lo hubiera notado— el
  dictado del título en la versión "ConVive".
- **Paleta**: teal de Enferix, no la violeta/rosa/cian del prototipo de
  referencia. Se retiró `v42-proyectos-glass.css` (el CSS de esa paleta).

**Deuda técnica explícita, para la fase 2** (decisión del usuario: se deja así
en esta fase, no se toca ahora): el resto de acciones de IA del editor de
apartados —Buscar evidencia, Reorganizar índice, Borrador completo, Elevar a
excelencia, y las del apartado individual (Desarrollar/Mejorar/Ampliar/
Resumir/Bibliografía/prompt libre)— siguen llamando a Gemini **directamente
desde el navegador** con la API key del propio usuario (`callAI()` en
`inurse-projects-v1-js.js`), igual que antes de esta fase. Migrarlas a
Anthropic/servidor, con el mismo patrón que `/api/proyectos/estructura`, es
trabajo de la fase 2.

**Fuera de alcance de esta fase** (son la "pantalla 2" del prototipo, no
tocada): rediseño visual del editor de apartados, redacción real de
contenido, historial de versiones y adjuntos persistentes en servidor,
"Importar documento" (botón deshabilitado con tooltip "Próximamente").

## Convenciones del proyecto

### Frontend

- Vanilla HTML / JS / CSS, sin bundler, sin framework. Cada mejora vive en un
  par `public/js/patologias/pXX-nombre.js` + `public/css/patologias/pXX-nombre.css`,
  con prefijo `pXX-` en todas las clases y selectores (`.p13-`, `.p21-`, `.p22-`,
  `.p23-`, `.p24-`, `.p2a-`, `.p31-`, `.p32-`…).
- Nunca se toca el monolito: los componentes nuevos se enganchan por
  MutationObserver sobre nodos existentes (`#in54ProtocolContent`,
  `.esc35-body`, `#in56GuidesHost`…) e inyectan HTML o clases sin alterar
  el código heredado. Al reconstruir tras un cambio de ficha/estado, se
  reconstruye TODO lo derivado de ella (contenido, pestañas, listeners),
  no solo una parte — un componente que deja listeners o nodos colgados de
  la iteración anterior es un bug, aunque el contenido visible sea correcto.
- Los `data-p2a-icon="nombre"` inyectan un SVG del sistema (P2-A) por
  observer; añadir un icono nuevo es un renglón en
  `public/js/ui-shared/p2a-icons.js`. Iconografía siempre monolínea (SVG
  stroke 1.6, currentColor), con emojis como fallback.
- Router de secciones: `window.EnferixOpenSection(id)` y catálogo en
  `window.INURSE_SECTIONS`. Un componente nuevo se registra ahí para
  aparecer en el menú Inicio.
- Persistencia local por componente: `localStorage.inurse_XXXX_v1`.

### Backend

- `server.mjs` en Node puro (sin Express), rutas `if (u.pathname === …)`.
  Cada fuente RAG en `sources/*.mjs` con función `searchX(query, {limit})`.
- Sin claves = sin sincronización. `DATABASE_URL` opcional; NICE_API_KEY,
  GEMINI_API_KEY, PUBMED_API_KEY, etc. se cargan de env de Render.
- Cache HTTP en memoria vía `cache.mjs` (TTL por endpoint).
- Al añadir un endpoint nuevo, cabecera `Cache-Control` explícita y
  respuesta con `debug: { fuente: { url, status, count, ms, error } }`
  cuando agrega fuentes externas.

### Diseño (tokens Enferix)

- Superficie: `#050814` → `#080f22` (gradiente vertical del shell).
- Tarjetas: `rgba(10,18,34,.7)` con borde `rgba(148,163,184,.18)`.
- Acento principal: **teal `#33B6A6`** (chips, activos, bordes de foco).
- Acentos secundarios:
  - Azul `#7dd3fc` (Europe PMC, NOC).
  - Morado `#c4b5fd` (OpenFDA, NIC).
  - Verde `#4ade80` / `#34D399` (NICE, verificado, éxito).
  - Ámbar `#fbbf24` (pendiente, aviso).
  - Rojo `#f87171` / `#fca5a5` (fallo, error).
- Texto: `#E5EEFF` (principal), `#c7d4f2` (secundario), `#8aa0c8` (tenue).
- Radios: `12px` (botones), `14–16px` (bloques), `20–22px` (cards grandes).
- Iconografía monolínea (SVG stroke 1.6, currentColor) — sistema `EnferixIcons`
  con emojis fallback.

### Bilingüe (ES ↔ CA)

- Todos los componentes exponen un objeto `L = { es: {…}, ca: {…} }` y
  detectan idioma con `detectLang()`:
  1. `document.documentElement.lang`
  2. `localStorage.inurse_lang`
  3. `navigator.language`
  4. Fallback `es`.
- **Regla férrea**: los labels de datos clínicos y de taxonomías (NANDA, NOC,
  NIC, títulos de artículos, títulos de guías) **nunca se autotraducen**.
  Si la tabla no tiene la versión CA de una etiqueta, se muestra la ES y
  se pinta una nota discreta `"etiqueta disponible sólo en castellano"`
  (una única vez en cabecera cuando aplica a un bloque entero).

### Regla férrea de contenido clínico

- **No se inventa ni se completa contenido clínico**. Nada de rellenar
  vínculos NANDA-NOC-NIC que no estén en `nnn_codes.json` con estado
  "Verificado", ni tramos de escala que no estén en la fuente validada,
  ni placeholders con aspecto de referencia bibliográfica.
- Números / umbrales / dosis / concentraciones: se copian literales de la
  fuente citada. Nunca se paráfrasean.
- Cuando no hay datos, se muestra un **estado vacío honesto** ("Sin
  resultados", "Pendiente de verificar") con explicación de por qué.
- El término de búsqueda en inglés (`evidenceQuery` en cada ficha) también
  es editorial: si no está, se envía el título ES tal cual. Nunca se
  autotraduce.
- **Texto de relleno en dobles de prueba**: cuando se levante un doble/stub de
  un modelo o de una fuente para probar (streaming, latencia, maquetación), su
  texto debe ser **inconfundible como relleno**: `TEXTO DE PRUEBA, NO CLÍNICO`
  repetido, o equivalente. Nunca frases con aspecto clínico, nunca umbrales ni
  dosis, y **nunca citas ni referencias bibliográficas inventadas** — ni siquiera
  plausibles. Una captura o un vídeo de prueba se enseña sin que nadie pueda
  confundir su contenido con una respuesta real; una nota al pie que avise no
  basta, porque lo que se recuerda es la pantalla. Regla del usuario (Juanky),
  a raíz de un stub cuyo relleno imitaba una respuesta clínica citada.
- Mismo principio para `evidenceDrugs` (array editorial de fármacos que la
  ficha nombra literalmente, p.ej. en su sección de tratamiento/reversión):
  las fuentes de fármacos (OpenFDA) se consultan SOLO por esos nombres,
  nunca por asociación temática con `evidenceQuery` — buscar un fármaco por
  su indicación general trae resultados de fichas ajenas, no evidencia de
  ESTA ficha. Sin `evidenceDrugs`, esa fuente no se llama y se muestra un
  vacío honesto explicando por qué.

## Flujo de trabajo con el usuario

1. **Rama por bloque de mejoras**: `mejoras-visuales-p1`, `mejoras-visuales-p2`,
   `mejoras-visuales-p2a`, `prioridad-tres`, `javny-inteligente`…
2. **Capturas antes del commit**: cada componente / iteración se muestra
   como PNG (desktop + móvil + estados relevantes + idiomas). Solo tras el
   OK explícito del usuario se hace commit.
3. **Los pull requests se abren en `draft`**. Ningún merge ni push a `main`
   sin aprobación explícita del usuario (Juanky).
4. **Ningún despliegue en Render sin aprobación**. `render.yaml` tiene
   `autoDeploy: true`, así que un merge a `main` dispara build automático —
   por eso el gate está en el merge: no se mergea sin que el usuario lo
   pida explícitamente.
5. Todo comentario en PR / commit / mensaje al usuario en **castellano**
   (el usuario también acepta catalán cuando lo pide).
6. Cuando existe un skill / plugin para lo que se pide, se prefiere sobre
   improvisar (`babysit`, `steward`, `code-review`, …). Si no existe, se
   documenta el razonamiento en el PR.

## Referencias rápidas de rutas

- Endpoints P3: `GET /api/terminology/dictionary`,
  `GET /api/evidencia-relacionada?q=<término>&drugs=<f1,f2,…>`.
- Fichas: `public/data/guias.js` (142 fichas hoy; añadir `evidenceQuery` /
  `evidenceDrugs` editoriales cuando aporten).
- Diccionario NNN: `nnn_codes.json` en la raíz, regenerable con
  `python3 build_nnn_json.py`.
- Escalas: `public/data/escalas.js` + `public/data/escalas-clinicas.js`.
- Sección router: `public/js/ui-shared/inline-script-17559.js`
  (`EnferixOpenSection`, `INURSE_SECTIONS`).
- Orquestador Javny (chat con Gemini): `sources/orchestrator.mjs`
  (`SYSTEM_PROMPT`, `searchAllSources`, `orchestrate`/`orchestrateStream`) —
  punto de partida de `javny-inteligente`.
