/* ═══════════════════════════════════════════════════════════════════════════
   Herramientas de Javny (frente 3 de javny-inteligente)
   ---------------------------------------------------------------------------
   Javny puede invocar directamente las fuentes y acciones REALES de Enferix
   como herramientas del modelo, en vez de recibir solo contexto preensamblado.
   Principios, que son los del proyecto y los del encargo:

   - El modelo NUNCA calcula ni interpreta una escala por su cuenta: extrae los
     parámetros, la herramienta llama al compute() del motor validado
     (public/data/escalas-clinicas.js) y el resultado se presenta literal.
   - Cada herramienta responde SOLO con datos reales de la app o de sus fuentes
     oficiales (CIMA). Si no hay dato, la respuesta es decirlo, no rellenar.
   - Los valores clínicos se devuelven literales de su fuente; aquí no se
     redondea, no se adapta y no se parafrasea nada.
   - La ubicación del usuario llega del NAVEGADOR con su consentimiento
     (body.ubicacion); el modelo no puede inventar coordenadas: la herramienta
     de cercanos usa las del usuario o contesta que no hay ubicación.

   Consumidor: sources/anthropic.mjs (bucle de tool use). El fallback a Gemini
   NO lleva herramientas: es el plan B de emergencia y mantiene el camino de
   siempre (contexto preensamblado), que sigue funcionando sin ellas.
   ═══════════════════════════════════════════════════════════════════════════ */
import { getEscalas, getDiluciones, getVademecum, getDocs } from "./datos-app.mjs";
import { comprobarInteracciones } from "./interacciones.mjs";
import { buscarCercanos } from "./cercanos.mjs";

function norm(s) {
  return String(s == null ? "" : s)
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Escalas: resolución, especificación y cálculo ─────────────────────────── */

function resolverEscala(nombre) {
  const data = getEscalas();
  if (!data) return { error: "El motor de escalas no está disponible en el servidor." };
  const q = norm(nombre);
  if (!q) return { error: "Indica el nombre o id de la escala." };
  const porId = data.CALCULATORS.find(c => norm(c.id) === q);
  if (porId) return { calc: porId };
  const exactas = data.CALCULATORS.filter(c => norm(c.name) === q || norm(c.shortName || "") === q);
  if (exactas.length === 1) return { calc: exactas[0] };
  const parciales = data.CALCULATORS.filter(c =>
    norm(c.name).includes(q) || norm(c.shortName || "").includes(q) || norm(c.id).includes(q)
  );
  if (parciales.length === 1) return { calc: parciales[0] };
  if (parciales.length > 1) {
    return {
      candidatas: parciales.slice(0, 8).map(c => ({ id: c.id, nombre: c.name, descripcion: c.description }))
    };
  }
  return { error: `No hay ninguna escala llamada «${nombre}» en Enferix.` };
}

// Especificación de entradas tal como las define el motor validado, para que
// el modelo sepa qué parámetros pedir y con qué etiquetas exactas.
function especificacionEscala(calc) {
  return {
    id: calc.id,
    nombre: calc.name,
    descripcion: calc.description,
    campos: calc.inputs.map(inp => {
      const campo = { id: inp.id, etiqueta: inp.label, tipo: inp.type };
      if (inp.type === "number") {
        if (inp.unit) campo.unidad = inp.unit;
        if (inp.min != null) campo.min = inp.min;
        if (inp.max != null) campo.max = inp.max;
      }
      if (inp.type === "select") campo.opciones = inp.options.map(o => o.label);
      if (inp.type === "boolean") campo.valores = "true/false";
      return campo;
    })
  };
}

// Una etiqueta que es un tramo numérico PURO («≤ 8», «9–11», «≥ 96 %», con
// coma decimal española) se convierte en intervalo. Cualquier otra cosa
// (condiciones, uniones con «o», palabras) devuelve null y desactiva el
// adaptador numérico para ese campo entero.
function analizarRango(label) {
  const t = norm(label).replace(/%\s*$/, "").replace(/,/g, ".").trim();
  let m = t.match(/^(≤|<=)\s*(\d+(?:\.\d+)?)$/);
  if (m) return { min: -Infinity, max: Number(m[2]) };
  m = t.match(/^<\s*(\d+(?:\.\d+)?)$/);
  if (m) return { min: -Infinity, max: Number(m[1]) - 1e-9 };
  m = t.match(/^(≥|>=)\s*(\d+(?:\.\d+)?)$/);
  if (m) return { min: Number(m[2]), max: Infinity };
  m = t.match(/^>\s*(\d+(?:\.\d+)?)$/);
  if (m) return { min: Number(m[1]) + 1e-9, max: Infinity };
  m = t.match(/^(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)$/);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };
  return null;
}

// Traduce lo que mande el modelo al `value` que espera compute(), campo a
// campo. Los selects se resuelven por ETIQUETA (o por valor solo cuando ese
// número es inequívoco): en NEWS2/MEWS los puntos se repiten entre opciones
// («≤8» y «≥25» valen 3), así que el número solo no identifica la opción.
function coaccionarValores(calc, valores) {
  const v = {};
  const faltan = [];
  const asumidosNo = [];
  const errores = [];
  for (const inp of calc.inputs) {
    const crudo = valores ? valores[inp.id] : undefined;
    if (inp.type === "number") {
      if (crudo === undefined || crudo === null || crudo === "") {
        faltan.push(inp);
        continue;
      }
      const n = Number(String(crudo).replace(",", "."));
      if (!Number.isFinite(n)) { errores.push(`«${inp.label}» (${inp.id}): valor no numérico.`); continue; }
      if (inp.min != null && n < inp.min) { errores.push(`«${inp.label}»: ${n} está por debajo del mínimo admitido (${inp.min}${inp.unit ? " " + inp.unit : ""}).`); continue; }
      if (inp.max != null && n > inp.max) { errores.push(`«${inp.label}»: ${n} está por encima del máximo admitido (${inp.max}${inp.unit ? " " + inp.unit : ""}).`); continue; }
      v[inp.id] = n;
    } else if (inp.type === "boolean") {
      if (crudo === undefined || crudo === null || crudo === "") {
        // Un ítem de lista no mencionado se lee como "no presente" (0), y se
        // DICE en la respuesta: el silencio no se disfraza de dato.
        v[inp.id] = 0;
        asumidosNo.push(inp.label);
        continue;
      }
      const t = norm(crudo);
      v[inp.id] = (crudo === true || crudo === 1 || t === "1" || t === "true" || t === "si" || t === "s") ? 1 : 0;
    } else if (inp.type === "select") {
      if (crudo === undefined || crudo === null || crudo === "") {
        faltan.push(inp);
        continue;
      }
      const texto = norm(crudo);
      // Muchas etiquetas llevan la puntuación delante («4 — Espontánea»); para
      // comparar con lo que dice una enfermera («espontánea») se mira también
      // sin ese prefijo. La coincidencia parcial solo vale si es ÚNICA: ante
      // ambigüedad se devuelve error con las opciones, nunca se adivina.
      const sinPrefijo = (l) => norm(l).replace(/^\d+\s*[—–-]\s*/, "");
      let opcion = inp.options.find(o => norm(o.label) === texto)
        || inp.options.find(o => sinPrefijo(o.label) === texto);
      if (!opcion && typeof crudo === "number") {
        const porValor = inp.options.filter(o => o.value === crudo);
        if (porValor.length === 1) opcion = porValor[0];
      }
      // Tramos numéricos («≤ 8», «9–11», «≥ 25»): si llega la constante medida
      // (FR = 22), se traduce a su tramo — pero SOLO cuando TODAS las opciones
      // del campo son tramos puros. Si alguna lleva condiciones («con oxígeno»,
      // «o ≤ 29,9»), el número solo no identifica la opción y no se adivina.
      if (!opcion) {
        const n = Number(String(crudo).replace(",", "."));
        if (Number.isFinite(n)) {
          const rangos = inp.options.map(o => analizarRango(o.label));
          if (rangos.every(Boolean)) {
            const dentro = inp.options.filter((o, i) => n >= rangos[i].min && n <= rangos[i].max);
            if (dentro.length === 1) opcion = dentro[0];
          }
        }
      }
      if (!opcion && texto.length >= 3) {
        // Dos niveles, cada uno válido solo con coincidencia ÚNICA: primero
        // inclusión directa («escala 1» dentro de «Escala 1 (habitual)»), y
        // solo si no engancha ninguna, tokens con raíz suave (quita la vocal
        // final: casa «orientado» con «Orientada»). No se mezclan niveles:
        // el laxo no puede volver ambiguo lo que el estricto resolvía solo.
        const porInclusion = inp.options.filter(o => {
          const l = sinPrefijo(o.label);
          return l.includes(texto) || texto.includes(l);
        });
        if (porInclusion.length === 1) opcion = porInclusion[0];
        else if (!porInclusion.length) {
          const raiz = (w) => w.length > 4 ? w.replace(/[aoe]s?$/, "") : w;
          const tokens = texto.split(" ").filter(w => w.length > 2).map(raiz);
          const porTokens = inp.options.filter(o => {
            const lTokens = sinPrefijo(o.label).split(" ").map(raiz);
            return tokens.length && tokens.every(t => lTokens.some(lt => lt === t || lt.includes(t)));
          });
          if (porTokens.length === 1) opcion = porTokens[0];
        }
      }
      if (!opcion) {
        errores.push(`«${inp.label}» (${inp.id}): opción no reconocida. Opciones válidas: ${inp.options.map(o => o.label).join(" | ")}.`);
        continue;
      }
      v[inp.id] = opcion.value;
    }
  }
  return { v, faltan, asumidosNo, errores };
}

function calcularEscala({ escala, valores }) {
  const r = resolverEscala(escala);
  if (r.error) return { error: r.error };
  if (r.candidatas) return { ambigua: true, candidatas: r.candidatas, nota: "Varias escalas encajan con ese nombre; vuelve a llamar con el id exacto." };
  const calc = r.calc;
  if (!valores || !Object.keys(valores).length) {
    return { especificacion: especificacionEscala(calc), nota: "Faltan los valores. Pide a quien consulta los campos listados y vuelve a llamar con ellos." };
  }
  const { v, faltan, asumidosNo, errores } = coaccionarValores(calc, valores);
  if (errores.length) return { error: errores.join(" "), especificacion: especificacionEscala(calc) };

  // Campo irrelevante dado el resto: en NEWS2, con «Escala 1» elegida, el
  // select de SpO₂ de la escala 2 no interviene, y exigirlo sería absurdo.
  // No se adivina cuál es el caso: se COMPRUEBA. Solo cuando falta EXACTAMENTE
  // un select (todo lo demás resuelto), se calcula con cada una de sus
  // opciones; si el resultado es idéntico en todas, el campo no interviene y
  // se sigue. Si cambia en alguna, era necesario y se pide como siempre.
  if (faltan.length === 1 && faltan[0].type === "select") {
    const campo = faltan[0];
    let resultados;
    try {
      resultados = campo.options.map(o => {
        const r = calc.compute({ ...v, [campo.id]: o.value });
        return JSON.stringify(r ?? null);
      });
    } catch { resultados = null; }
    if (resultados && resultados[0] !== "null" && resultados.every(s => s === resultados[0])) {
      v[campo.id] = campo.options[0].value;
      faltan.length = 0;
    }
  }

  if (faltan.length) {
    return {
      faltan: faltan.map(inp => {
        const campo = { id: inp.id, etiqueta: inp.label, tipo: inp.type };
        if (inp.type === "select") campo.opciones = inp.options.map(o => o.label);
        if (inp.type === "number" && inp.unit) campo.unidad = inp.unit;
        return campo;
      }),
      nota: "No se calcula con datos incompletos: pide estos campos y vuelve a llamar."
    };
  }
  let resultado;
  try {
    resultado = calc.compute(v);
  } catch (err) {
    return { error: `La calculadora «${calc.name}» falló: ${err instanceof Error ? err.message : err}` };
  }
  if (!resultado) return { error: `La calculadora «${calc.name}» no devolvió resultado con esos valores.` };
  return {
    escala: { id: calc.id, nombre: calc.name },
    resultado: {
      valor: resultado.main,
      unidad: resultado.mainUnit || "",
      desglose: resultado.secondary || "",
      interpretacion: resultado.interpretation,
      nivel: resultado.level,
      detalles: resultado.details || ""
    },
    asumidos_como_no_presentes: asumidosNo,
    notas: calc.notes || "",
    referencias: calc.references || [],
    fuente: "Calculadora validada de Enferix (motor de escalas clínicas)"
  };
}

/* ── Fármacos: diluciones, vías y compatibilidades (datos editoriales) ─────── */

function dilucionFarmaco({ farmaco }) {
  const q = norm(farmaco);
  if (!q) return { error: "Indica el nombre del fármaco." };
  const dil = getDiluciones();
  const vadem = getVademecum();

  let entrada = null;
  if (dil) {
    const clave = Object.keys(dil).find(k => norm(k) === q || norm(dil[k].n) === q)
      || Object.keys(dil).find(k => norm(dil[k].n).includes(q) || q.includes(norm(dil[k].n)));
    if (clave) entrada = { clave, ...dil[clave] };
  }

  let fichaVademecum = null;
  if (vadem) {
    const hit = vadem.find(f => norm(f.n) === q) || vadem.find(f => norm(f.n).startsWith(q));
    if (hit) {
      fichaVademecum = {
        nombre: hit.n, accion: hit.a || "", indicacion: hit.i || "", posologia: hit.p || "",
        contraindicaciones: hit.c || "", precauciones: hit.r || "", via: hit.route || "",
        fuente: hit.source || "Vademécum editorial de Enferix"
      };
    }
  }

  if (!entrada && !fichaVademecum) {
    return { error: `«${farmaco}» no está ni en el formulario de perfusiones ni en el vademécum editorial de Enferix.` };
  }

  const out = {};
  if (entrada) {
    out.perfusion = {
      nombre: entrada.n,
      dosis: entrada.dosis,                 // unidad/min/max/def literales del formulario
      diluciones_estandar: (entrada.diluciones || []).map(d => d.l),
      por_peso: !!entrada.ppw,
      bolo: entrada.bolo || null,
      tiempo: entrada.tiempo || null,
      inicio_accion: entrada.info?.inicio || "",
      vida_media: entrada.info?.vida || "",
      // La vía y las compatibilidades constan como texto editorial en las
      // notas del formulario; se devuelven literales, sin interpretar.
      notas: entrada.info?.notas || "",
      fuente: "Formulario de perfusiones de Enferix (datos editoriales)"
    };
    out.calculo_ml_h = "El cálculo de ritmo (mL/h) se hace en la calculadora de perfusiones de la app, no aquí.";
  }
  if (fichaVademecum) out.vademecum = fichaVademecum;
  return out;
}

/* ── Buscar y enlazar fichas y escalas de la app ───────────────────────────── */

function buscarEnEnferix({ consulta, tipo }, onEnlace) {
  const q = norm(consulta);
  if (q.length < 2) return { error: "Consulta demasiado corta." };
  const quiere = (t) => !tipo || tipo === "cualquiera" || tipo === t;
  const tokens = q.split(" ").filter(w => w.length > 2);
  if (!tokens.length) return { error: "Consulta demasiado corta." };

  const fichas = [];
  if (quiere("ficha")) {
    const docs = getDocs() || [];
    for (const d of docs) {
      const titulo = norm(d.title);
      const tags = norm(Array.isArray(d.tags) ? d.tags.join(" ") : d.tags || "");
      const resumen = norm(d.summary || "");
      let score = 0;
      for (const t of tokens) {
        if (titulo.includes(t)) score += 7;
        if (tags.includes(t)) score += 3;
        if (resumen.includes(t)) score += 1;
      }
      if (score > 0) fichas.push({ score, id: d.id, titulo: d.title, fuente: d.source || "" });
    }
    fichas.sort((a, b) => b.score - a.score);
  }

  const escalas = [];
  if (quiere("escala")) {
    const data = getEscalas();
    for (const c of (data ? data.CALCULATORS : [])) {
      const nombre = norm(c.name + " " + (c.shortName || "") + " " + c.id);
      let score = 0;
      for (const t of tokens) if (nombre.includes(t)) score += 5;
      if (score > 0) escalas.push({ score, id: c.id, titulo: c.name, descripcion: c.description });
    }
    escalas.sort((a, b) => b.score - a.score);
  }

  const topFichas = fichas.slice(0, 5).map(({ score, ...r }) => r);
  const topEscalas = escalas.slice(0, 5).map(({ score, ...r }) => r);
  if (!topFichas.length && !topEscalas.length) {
    return { resultado: "Nada en Enferix encaja con esa búsqueda.", fichas: [], escalas: [] };
  }
  // Los mejores resultados se registran como enlaces: la app pinta botones
  // para abrirlos (openDoc / EnferixEscalas.openCalc) debajo de la respuesta.
  if (typeof onEnlace === "function") {
    for (const f of topFichas.slice(0, 2)) onEnlace({ tipo: "ficha", id: f.id, titulo: f.titulo });
    for (const e of topEscalas.slice(0, 2)) onEnlace({ tipo: "escala", id: e.id, titulo: e.titulo });
  }
  return {
    fichas: topFichas,
    escalas: topEscalas,
    nota: "La app muestra botones para abrir los primeros resultados; menciona en el texto cuál es el pertinente."
  };
}

/* ── Centros cercanos (la ubicación viene del navegador, nunca del modelo) ── */

const SIN_UBICACION =
  "No hay ubicación disponible: el usuario no la ha compartido con la aplicación. " +
  "Indícale que puede activarla desde Servicios cercanos (o preguntándolo de nuevo tras conceder el permiso). " +
  "No des nunca un centro, dirección ni distancia de memoria.";

async function centrosCercanos({ tipo, radio_metros }, ubicacion) {
  if (!ubicacion || !Number.isFinite(ubicacion.lat) || !Number.isFinite(ubicacion.lon)) {
    return { error: SIN_UBICACION };
  }
  const kinds = tipo === "hospital" ? ["hospital"] : tipo === "aed" ? ["aed"] : ["hospital", "aed"];
  const radius = Math.max(500, Math.min(20000, Number(radio_metros) || 5000));
  let r;
  try {
    r = await buscarCercanos(ubicacion.lat, ubicacion.lon, { radius, kinds });
  } catch (err) {
    return { error: `No se pudo consultar las fuentes de centros cercanos: ${err instanceof Error ? err.message : err}` };
  }
  const items = (r.items || []).slice(0, 8).map(x => ({
    nombre: x.name,
    tipo: x.kind === "aed" ? "desfibrilador (DEA)" : "hospital / urgencias",
    distancia_km: x.distanceKm,
    direccion: x.address || "",
    telefono: x.phone || ""
  }));
  if (!items.length) {
    return { resultado: `Sin hospitales ni DEA registrados en las fuentes consultadas en un radio de ${Math.round(radius / 1000)} km.`, fuente: r.source };
  }
  return { centros: items, radio_metros: radius, fuente: r.source };
}

/* ── Catálogo de herramientas ──────────────────────────────────────────────── */

export function construirHerramientas({ ubicacion, onEnlace } = {}) {
  return [
    {
      name: "calcular_escala",
      description:
        "Calcula una escala clínica con el código validado de las calculadoras de Enferix (Glasgow, NEWS2, Braden, " +
        "Morse, qSOFA y 300+ más). Pásale el id o nombre de la escala y los valores por id de campo; los selects, por " +
        "su etiqueta exacta. Sin valores, devuelve la especificación de campos para que los pidas. Si faltan campos o " +
        "hay valores fuera de rango, lo dice y NO calcula. Presenta su resultado e interpretación literales.",
      input_schema: {
        type: "object",
        properties: {
          escala: { type: "string", description: "Id o nombre de la escala (p. ej. 'glasgow', 'news2', 'braden')" },
          valores: {
            type: "object",
            description: "Valores por id de campo. Números para campos numéricos, true/false para ítems sí/no, y la etiqueta exacta de la opción para los selects."
          }
        },
        required: ["escala"]
      },
      run: (input) => calcularEscala(input || {})
    },
    {
      name: "dilucion_farmaco",
      description:
        "Datos editoriales del formulario de fármacos de Enferix para un fármaco: diluciones estándar, rango de " +
        "dosis, bolo, inicio/vida media y notas (vía y compatibilidades constan ahí como texto literal). Devuelve " +
        "también la entrada del vademécum editorial (vía, posología, contraindicaciones) si existe. No calcula " +
        "ritmos de infusión. Si el fármaco no está, lo dice.",
      input_schema: {
        type: "object",
        properties: { farmaco: { type: "string", description: "Nombre del fármaco (p. ej. 'noradrenalina')" } },
        required: ["farmaco"]
      },
      run: (input) => dilucionFarmaco(input || {})
    },
    {
      name: "interacciones_farmacos",
      description:
        "Comprueba interacciones entre 2-4 fármacos contra la sección 4.5 de la ficha técnica oficial (CIMA-AEMPS), " +
        "citando el párrafo literal donde una ficha menciona al principio activo del otro. No asigna gravedad y la " +
        "ausencia de mención NUNCA se presenta como ausencia de interacción: transmite siempre su aviso.",
      input_schema: {
        type: "object",
        properties: {
          farmacos: {
            type: "array",
            items: { type: "string" },
            description: "Nombres de los fármacos o medicamentos (2 a 4)"
          }
        },
        required: ["farmacos"]
      },
      run: async (input) => {
        const lista = Array.isArray(input?.farmacos) ? input.farmacos.filter(f => String(f).trim()).slice(0, 4) : [];
        if (lista.length < 2) return { error: "Hacen falta al menos dos fármacos." };
        return comprobarInteracciones(lista);
      }
    },
    {
      name: "buscar_en_enferix",
      description:
        "Busca fichas clínicas y escalas dentro de la app para enlazarlas en la respuesta. La app pinta botones " +
        "que abren los primeros resultados; nombra en el texto cuál es el pertinente. Útil cuando convenga remitir " +
        "a la ficha o calculadora de Enferix sobre el tema.",
      input_schema: {
        type: "object",
        properties: {
          consulta: { type: "string", description: "Término clínico a buscar (p. ej. 'sepsis', 'caídas')" },
          tipo: { type: "string", enum: ["ficha", "escala", "cualquiera"], description: "Limitar a fichas, a escalas o a ambas" }
        },
        required: ["consulta"]
      },
      run: (input) => buscarEnEnferix(input || {}, onEnlace)
    },
    {
      name: "centros_cercanos",
      description:
        "Hospitales, urgencias y desfibriladores (DEA) reales cerca del usuario (Google Places + OpenStreetMap), " +
        "con nombre, distancia y dirección. Usa la ubicación que el usuario ya compartió con la app; si no la hay, " +
        "la herramienta lo dice y hay que pedirle que la active. Nunca inventes un centro ni una distancia.",
      input_schema: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["hospital", "aed", "all"], description: "Qué buscar: hospitales, DEA o ambos" },
          radio_metros: { type: "number", description: "Radio de búsqueda en metros (500-20000, por defecto 5000)" }
        }
      },
      run: (input) => centrosCercanos(input || {}, ubicacion)
    }
  ];
}

/* Instrucciones que SOLO se añaden al guion cuando las herramientas están
   activas (camino Anthropic del chat). No viven en guion-clinico.mjs porque el
   fallback de Gemini no tiene herramientas: contarle al modelo herramientas
   que no existen en su llamada sería pedirle que alucine invocaciones. */
export const GUION_HERRAMIENTAS = `

## Herramientas de Enferix

Tienes herramientas que consultan datos REALES de la aplicación. Normas:

- **Escalas**: para calcular o interpretar cualquier escala clínica usa SIEMPRE calcular_escala. Tú solo extraes los parámetros de lo que te cuentan y presentas el resultado y la interpretación LITERALES que devuelve la herramienta. Nunca calcules ni interpretes una escala de memoria, ni "corrijas" su resultado. Si la herramienta dice que faltan campos, pídelos a quien consulta en vez de suponerlos.
- **Fármacos**: para diluciones, vías de administración y compatibilidades usa dilucion_farmaco y transmite sus datos literales. Para interacciones usa interacciones_farmacos y cita lo que devuelva, incluido su aviso: nunca digas que "no hay interacción" porque no haya mención.
- **Cercanos**: para el hospital, las urgencias o el desfibrilador más cercano usa centros_cercanos. Si responde que no hay ubicación, dile al usuario cómo activarla y no des ningún centro de memoria.
- **Enlaces**: cuando la ficha o la escala de Enferix sobre el tema le sirva a quien pregunta, usa buscar_en_enferix para que la app la enlace debajo de tu respuesta, y nómbrala en el texto.
- Si una herramienta devuelve un error o no tiene el dato, dilo con esas palabras ("no está disponible en Enferix") en vez de rellenar el hueco de memoria.
- En MODO EMERGENCIA el formato manda igual que siempre: 112 primero, UNA acción, frases cortas. Como mucho, usa centros_cercanos si piden el DEA o el hospital más cercano; no encadenes herramientas mientras alguien tiene una urgencia delante.`;
