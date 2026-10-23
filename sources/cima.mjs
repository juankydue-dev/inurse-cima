import { requestJSON } from "../cache.mjs";

const CIMA_BASE = (process.env.CIMA_BASE || "https://cima.aemps.es/cima/rest").replace(/\/$/, "");

export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  return data?.resultados || data?.medicamentos || data?.items || data?.content || [];
}

function cimaGet(pathname, options = {}) {
  return requestJSON(`${CIMA_BASE}/${pathname}`, { ...options, label: "CIMA" });
}

// Ficha completa de un medicamento: medicamento + secciones de la ficha técnica
// + notas + materiales + problemas de suministro. Vivía en server.mjs
// (ruta /api/cima/medicine/:nregistro); se trae aquí porque ahora la usan dos
// consumidores: esa ruta y la herramienta de interacciones de Javny
// (sources/interacciones.mjs), que lee la sección 4.5.
export async function medicineDetail(nregistro) {
  const medicine = await cimaGet(`medicamento?nregistro=${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 });
  const tasks = [
    cimaGet(`docSegmentado/contenido/1?nregistro=${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 }),
    medicine?.notas ? cimaGet(`notas/${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 }) : Promise.resolve([]),
    medicine?.materialesInf ? cimaGet(`materiales/${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 }) : Promise.resolve([])
  ];
  const [sections, notes, materials] = await Promise.allSettled(tasks);
  const affected = (medicine?.presentaciones || []).filter(p => p.psum && p.cn).slice(0, 20);
  const supplySettled = await Promise.allSettled(
    affected.map(p => cimaGet(`psuministro/${encodeURIComponent(p.cn)}`, { ttl: 5 * 60 * 1000 }))
  );
  return {
    medicine,
    sections: sections.status === "fulfilled" ? sections.value : [],
    notes: notes.status === "fulfilled" ? notes.value : [],
    materials: materials.status === "fulfilled" ? materials.value : [],
    supply: supplySettled.flatMap(r => r.status === "fulfilled" ? normalizeList(r.value) : []),
    source: "CIMA-AEMPS",
    fetchedAt: new Date().toISOString()
  };
}

// Búsqueda de medicamentos autorizados en España (CIMA-AEMPS) para que Javny consulte
// la ficha técnica oficial española antes de responder preguntas sobre fármacos,
// en vez de depender solo de OpenFDA (que refleja el mercado estadounidense).
export async function searchCIMA(query, { limit = 5 } = {}) {
  const params = new URLSearchParams({ nombre: query, pagina: "1" });
  const raw = await requestJSON(`${CIMA_BASE}/medicamentos?${params}`, {
    ttl: 15 * 60 * 1000,
    label: "CIMA"
  });
  const items = normalizeList(raw).slice(0, limit);
  return {
    items: items.map(m => ({
      nregistro: m.nregistro || "",
      name: m.nombre || "",
      lab: m.labtitular || "",
      active: (m.principiosActivos || []).map(p => p.nombre).join(", "),
      atc: (m.vtm?.nombre || (m.atcs || []).map(a => a.nombre).join(", ")) || "",
      commercialized: m.comerc !== false,
      authorized: m.estado?.aut ? true : false,
      photo: m.fotos?.find(f => f.tipo === "materialas")?.url || "",
      docs: (m.docs || []).map(d => ({ tipo: d.tipo, url: d.urlHtml || d.url })),
      url: m.nregistro ? `https://cima.aemps.es/cima/publico/detalle.html?nregistro=${encodeURIComponent(m.nregistro)}` : "",
      source: "CIMA-AEMPS"
    }))
  };
}
