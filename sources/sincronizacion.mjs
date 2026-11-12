/* ═══════════════════════════════════════════════════════════
   Qué se sincroniza con la cuenta y qué no
   ---------------------------------------------------------------------------
   La sincronización (window.EnferixCloud en public/js/core/inline-script-3125.js
   y las rutas /api/sync y /api/sync/bulk de server.mjs) sube a user_data lo que
   la app guarda en localStorage. Dos cosas nunca deben salir del dispositivo:

   - Las claves secretas (API keys, tokens, contraseñas): se reconocen por el
     nombre, como ya se hacía.
   - CLAVES_LOCALES: datos que la app promete no enviar a ningún servidor.
     Hoy, la ficha personal de Emergencia SOS (guiaHJ23_sos): nombre, DNI,
     grupo sanguíneo, alergias, medicación y antecedentes de quien usa la app.
     Su pantalla dice «No se envían a ningún servidor», y son datos de salud
     (artículo 9 del RGPD).

   El cliente no puede importar este módulo: la MISMA lista está copiada en
   EnferixCloud. Al añadir o quitar una clave, tocar los dos sitios (y el test
   tests/sincronizacion.test.mjs, que comprueba que coinciden).
   ═══════════════════════════════════════════════════════════ */

export const CLAVES_LOCALES = ["guiaHJ23_sos"];

export function esSecreta(key) {
  return /key|token|password|apikey/i.test(String(key || ""));
}

export function esLocal(key) {
  return CLAVES_LOCALES.includes(String(key || ""));
}

export function sincronizable(key) {
  return !!key && !esSecreta(key) && !esLocal(key);
}
