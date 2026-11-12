// Prueba: la ficha personal de Emergencia SOS (guiaHJ23_sos) no se sincroniza.
//
// Ejecuta el EnferixCloud REAL de public/js/core/inline-script-3125.js en una
// máquina virtual de Node, con localStorage y fetch simulados, y comprueba el
// helper del servidor. Sin dependencias:  npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { CLAVES_LOCALES, sincronizable, esLocal, esSecreta } from "../sources/sincronizacion.mjs";

const SOS = "guiaHJ23_sos";
const FUENTE = readFileSync(new URL("../public/js/core/inline-script-3125.js", import.meta.url), "utf8");

function extraerCloud() {
  const ini = FUENTE.indexOf("window.EnferixCloud = (function(){");
  const fin = FUENTE.indexOf("})();", FUENTE.indexOf("pushAll: pushAll, pullAll: pullAll", ini)) + "})();".length;
  assert.ok(ini >= 0 && fin > ini, "no se encuentra EnferixCloud en el cliente");
  return FUENTE.slice(ini, fin);
}

function montarCliente({ servidor = {} } = {}) {
  const almacen = new Map();
  const localStorage = {
    getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
    setItem: (k, v) => almacen.set(k, String(v)),
    removeItem: (k) => almacen.delete(k),
    key: (i) => [...almacen.keys()][i] ?? null,
    get length() { return almacen.size; },
  };
  const enviados = [];
  let temporizador = null;
  const fetch = async (url, opts = {}) => {
    if (url === "/api/auth/me") return { ok: true, json: async () => ({ user: { id: "u1", email: "prueba@ejemplo.invalid" } }) };
    if (url === "/api/sync/bulk") { enviados.push(JSON.parse(opts.body).data); return { ok: true, json: async () => ({ ok: true }) }; }
    if (url === "/api/sync") return { ok: true, json: async () => ({ data: servidor }) };
    throw new Error("URL inesperada: " + url);
  };
  const window = { addEventListener() {} };
  const ctx = vm.createContext({
    window, localStorage, fetch, Promise, JSON, Object,
    setTimeout: (fn) => { temporizador = fn; return 1; },
    clearTimeout: () => { temporizador = null; },
  });
  vm.runInContext(extraerCloud(), ctx);
  return { cloud: window.EnferixCloud, localStorage, almacen, enviados, vaciar: () => temporizador && temporizador() };
}

test("la lista del cliente coincide con la del servidor", () => {
  const m = extraerCloud().match(/var CLAVES_LOCALES = \[([^\]]*)\]/);
  assert.ok(m, "el cliente no declara CLAVES_LOCALES");
  const cliente = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  assert.deepEqual(cliente, CLAVES_LOCALES);
  assert.ok(CLAVES_LOCALES.includes(SOS));
});

test("servidor: la ficha SOS y las claves secretas no son sincronizables", () => {
  assert.equal(sincronizable(SOS), false);
  assert.equal(esLocal(SOS), true);
  assert.equal(sincronizable("gemini_apikey"), false);
  assert.equal(esSecreta("gemini_apikey"), true);
  assert.equal(sincronizable("guiaHJ23_theme"), true);
  assert.equal(sincronizable(""), false);
});

test("cliente: guardar la ficha SOS no la envía; el resto sí", async () => {
  const c = montarCliente();
  await c.cloud.whoami();
  c.localStorage.setItem(SOS, '{"dni":"PRUEBA"}');
  c.localStorage.setItem("guiaHJ23_theme", "dark");
  c.vaciar();
  assert.equal(c.enviados.length, 1);
  assert.ok(!(SOS in c.enviados[0]), "la ficha SOS se ha enviado");
  assert.equal(c.enviados[0].guiaHJ23_theme, "dark");
  assert.equal(c.almacen.get(SOS), '{"dni":"PRUEBA"}', "la ficha debe seguir en el dispositivo");
});

test("cliente: borrar la ficha SOS tampoco se envía", async () => {
  const c = montarCliente();
  await c.cloud.whoami();
  c.localStorage.setItem(SOS, "x");
  c.localStorage.removeItem(SOS);
  c.vaciar();
  assert.equal(c.enviados.length, 0);
});

test("cliente: subir todo (al registrarse) deja fuera la ficha SOS", async () => {
  const c = montarCliente();
  c.almacen.set(SOS, '{"dni":"PRUEBA"}');
  c.almacen.set("guiaHJ23_favs", "[1,2]");
  await c.cloud.whoami();
  await c.cloud.pushAll();
  assert.equal(c.enviados.length, 1);
  assert.deepEqual(Object.keys(c.enviados[0]), ["guiaHJ23_favs"]);
});

test("cliente: una copia antigua en el servidor no pisa la ficha local", async () => {
  const c = montarCliente({ servidor: { [SOS]: '{"dni":"ANTIGUA"}', guiaHJ23_theme: "light" } });
  c.almacen.set(SOS, '{"dni":"LOCAL"}');
  await c.cloud.whoami();
  await c.cloud.pullAll();
  assert.equal(c.almacen.get(SOS), '{"dni":"LOCAL"}');
  assert.equal(c.almacen.get("guiaHJ23_theme"), "light");
});
