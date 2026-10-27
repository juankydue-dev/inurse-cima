/* ═══════════════════════════════════════════════════════════════════════════
   ¿Dónde estoy? — geocodificación inversa (coordenadas → dirección)
   ---------------------------------------------------------------------------
   Convierte la posición del usuario en una dirección legible usando Nominatim,
   el geocodificador de OpenStreetMap — el mismo ecosistema que ya usa la app
   para los DEA y la red de seguridad de hospitales (overpass.mjs).

   Dos verdades que el consumidor tiene que transmitir:
   - La dirección es la del punto REGISTRADO más cercano en el mapa, no la
     posición exacta del usuario: se presenta siempre como APROXIMADA.
   - Nunca se inventa una dirección: si Nominatim no resuelve, se lanza el
     error para que el consumidor muestre su estado de fallo honesto.

   Consumidores: GET /api/donde-estoy (server.mjs) y, a través de él, la
   herramienta donde_estoy de Javny (chat en javny-tools.mjs y Live).
   NOMINATIM_BASE_URL permite apuntar a un doble local en pruebas, igual que
   OVERPASS_BASE y EPMC_BASE_URL.
   ═══════════════════════════════════════════════════════════════════════════ */
import { requestJSON } from "../cache.mjs";

const NOMINATIM_BASE = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
const TIMEOUT_MS = 10_000;

export async function dondeEstoy(lat, lon) {
  // 4 decimales ≈ 11 m: de sobra para una dirección y agrupa la cache de
  // posiciones casi idénticas (el GPS baila varios metros entre lecturas).
  const qLat = Math.round(lat * 10000) / 10000;
  const qLon = Math.round(lon * 10000) / 10000;
  // zoom=18 pide resolución de edificio; accept-language=es, nombres en castellano.
  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${qLat}&lon=${qLon}&zoom=18&addressdetails=1&accept-language=es`;
  const raw = await requestJSON(url, {
    ttl: 5 * 60 * 1000,
    label: "Nominatim (OpenStreetMap)",
    timeout: TIMEOUT_MS,
    // La política de uso de Nominatim exige identificar a la aplicación.
    headers: { "User-Agent": "Enferix/1.0 (https://inurse-cima.onrender.com)" }
  });
  if (!raw || raw.error || !raw.address) {
    throw new Error(raw && raw.error
      ? `Nominatim no pudo resolver la posición: ${raw.error}`
      : "Nominatim no devolvió ninguna dirección para esa posición");
  }
  const a = raw.address;
  const via = [a.road || a.pedestrian || a.footway || "", a.house_number || ""].filter(Boolean).join(" ");
  const municipio = a.city || a.town || a.village || a.municipality || "";
  return {
    // Dirección completa tal como la devuelve OSM, sin recomponer nada.
    direccion: raw.display_name || "",
    via,
    barrio: a.neighbourhood || a.suburb || a.quarter || "",
    municipio,
    provincia: a.province || a.state_district || a.state || "",
    codigo_postal: a.postcode || "",
    pais: a.country || "",
    // El consumidor debe decirlo así: es el punto del mapa más cercano.
    precision: "aproximada",
    fuente: "OpenStreetMap (Nominatim)"
  };
}
