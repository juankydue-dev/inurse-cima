/* ═══════════════════════════════════════════════════════════════════════════
   Centros sanitarios cercanos — combinación Google Places + Overpass
   ---------------------------------------------------------------------------
   Esta lógica vivía dentro de la ruta GET /api/nearby de server.mjs. Se extrae
   aquí SIN cambiar su comportamiento porque ahora tiene dos consumidores: esa
   misma ruta y la herramienta `centros_cercanos` de Javny (javny-tools.mjs).
   Si se duplicara, los resultados del panel de Servicios cercanos y los del
   chat podrían discrepar ante el mismo fallo de una fuente, y eso no puede
   pasar: ambos tienen que contar la misma verdad.

   Reparto de fuentes (igual que siempre):
   - Google Places (si hay GOOGLE_MAPS_API_KEY) tiene prioridad para hospitales.
   - Overpass/OSM es la ÚNICA fuente de desfibriladores (DEA) y la red de
     seguridad para hospitales cuando Google falla o no está configurado.
   Nunca se inventa un centro: si todas las fuentes pedidas fallan, se lanza el
   primer error real para que el consumidor muestre su estado de fallo honesto.
   ═══════════════════════════════════════════════════════════════════════════ */
import { searchNearbyHospitals, isGooglePlacesEnabled } from "./gplaces.mjs";
import { searchNearby } from "./overpass.mjs";

export async function buscarCercanos(lat, lon, { radius = 5000, kinds = ["hospital", "aed"] } = {}) {
  const wantHospitals = kinds.includes("hospital");
  const wantAed = kinds.includes("aed");
  const useGoogle = wantHospitals && isGooglePlacesEnabled();

  const tasks = [];
  if (useGoogle) {
    tasks.push(
      searchNearbyHospitals(lat, lon, { radius })
        .then(r => ({ kind: "hospital", source: "google", items: r.items }))
        .catch(err => ({ kind: "hospital", source: "google", error: err.message }))
    );
  }
  // Overpass para: DEA siempre que se pidan, y hospitales cuando no hay
  // Google Places disponible. Si Google respondió bien, los hospitales
  // de Overpass se descartan más abajo (Google gana).
  const osmKinds = [];
  if (wantAed) osmKinds.push("aed");
  if (wantHospitals && !useGoogle) osmKinds.push("hospital");
  if (osmKinds.length) {
    tasks.push(
      searchNearby(lat, lon, { radius, kinds: osmKinds })
        .then(r => ({ kind: "osm", source: "osm", items: r.items }))
        .catch(err => ({ kind: "osm", source: "osm", error: err.message }))
    );
  }

  const results = await Promise.all(tasks);
  const googleResult = results.find(r => r.source === "google");
  const osmResult = results.find(r => r.source === "osm");

  // Hospitales: primero Google si respondió; si falló, tirar de Overpass
  // (que puede haberse pedido explícitamente como fallback).
  let hospitals = [];
  let usedGoogleForHospitals = false;
  if (googleResult && !googleResult.error) {
    hospitals = googleResult.items;
    usedGoogleForHospitals = true;
  } else if (osmResult && !osmResult.error) {
    hospitals = osmResult.items.filter(it => it.kind === "hospital");
  }
  const aeds = osmResult && !osmResult.error
    ? osmResult.items.filter(it => it.kind === "aed")
    : [];

  // Si Google falló pero Overpass no cubrió los hospitales (porque
  // aquí no se le pidieron), reintentar con Overpass como red de
  // seguridad para hospitales.
  let fallbackHospitals = null;
  if (wantHospitals && !hospitals.length && googleResult?.error && !osmKinds.includes("hospital")) {
    try {
      const r = await searchNearby(lat, lon, { radius, kinds: ["hospital"] });
      hospitals = r.items;
    } catch (err) {
      fallbackHospitals = err.message;
    }
  }

  const items = [...hospitals, ...aeds].sort(
    (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
  );

  // Si NO hay items y todo lo que se pidió ha fallado, se lanza el primer
  // error real (Google si aplicaba, si no Overpass) en vez de devolver una
  // lista vacía que se leería como "no hay centros cerca". El criterio es
  // LITERALMENTE el que tenía la ruta /api/nearby antes de extraerse aquí.
  const anyRequestedFailed = (wantHospitals && !hospitals.length) || (wantAed && !aeds.length && osmResult?.error);
  if (items.length === 0 && anyRequestedFailed) {
    throw new Error(googleResult?.error || osmResult?.error || fallbackHospitals || "Error consultando las fuentes");
  }

  const sources = [];
  if (usedGoogleForHospitals) sources.push("Google Places API");
  if (aeds.length || (!usedGoogleForHospitals && hospitals.length)) sources.push("OpenStreetMap (Overpass API)");
  return { items, source: sources.join(" · ") };
}
