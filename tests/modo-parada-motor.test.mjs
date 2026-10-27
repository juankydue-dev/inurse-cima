/* Pruebas del motor del modo parada (P45) con RELOJ FALSO.
   Escenarios T1-T12 del documento editorial del modo parada (26-10-2026).
   Ejecutar:  node tests/modo-parada-motor.test.mjs
   El motor es una función pura: aquí no hay DOM, ni voz, ni temporizadores
   reales — el tiempo avanza a mano y se comprueban estado y avisos. */
// El motor es un script CLÁSICO de navegador (el package.json del repo lleva
// "type":"module", así que require/import lo malinterpretarían): se evalúa
// aquí igual que lo evalúa el navegador, con un `module` de CommonJS a mano.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const fuente = fs.readFileSync(path.join(aqui, '../public/js/ui-shared/p45-parada-motor.js'), 'utf8');
const _mod = { exports: {} };
new Function('module', 'window', fuente)(_mod, undefined);
const Motor = _mod.exports;

const C = Motor.CONSTANTES;
const MIN = 60 * 1000;

let fallos = 0, pruebas = 0;
function ok(cond, msg) {
  pruebas++;
  console.log((cond ? '✔' : '✘') + ' ' + msg);
  if (!cond) fallos++;
}

/* Arnés: mantiene estado y reloj falso; recoge avisos y cambios de metrónomo */
function arnes() {
  let estado = Motor.estadoInicial();
  let ahora = 1_000_000;           // arranque arbitrario del reloj monotónico
  const todo = [];                 // [{t, tipo, frase, metro}]
  function registra(r) {
    r.avisos.forEach(a => todo.push({ t: ahora, tipo: a.tipo, frase: a.frase }));
    if (r.metro) todo.push({ t: ahora, tipo: 'metro', frase: r.metro });
    estado = r.estado;
  }
  return {
    evento(tipo) { registra(Motor.aplicar(estado, { tipo }, ahora)); },
    // Avanza el reloj en pasos de 250 ms pasando ticks, como hará la pantalla
    avanza(ms) {
      const fin = ahora + ms;
      while (ahora < fin) {
        ahora = Math.min(ahora + 250, fin);
        registra(Motor.aplicar(estado, { tipo: 'tick' }, ahora));
      }
    },
    get estado() { return estado; },
    get ahora() { return ahora; },
    avisos(tipo) { return todo.filter(x => !tipo || x.tipo === tipo); },
    frases() { return todo.map(x => x.frase); },
    desde(t, tipo) { return todo.filter(x => x.t >= t && (!tipo || x.tipo === tipo)); }
  };
}

/* ── T1 · Asistolia continua ──────────────────────────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  a.avanza(10_000);
  a.evento('analizar');
  a.evento('no_desfibrilable');
  ok(a.avisos('adrenalina').length === 1 && /ya\.$/.test(a.avisos('adrenalina')[0].frase),
    'T1 adrenalina pedida en el primer análisis, con «ya»');
  a.evento('adrenalina_puesta');
  const t1 = a.ahora;
  // Tres intervalos completos de 3 min con análisis no desfibrilables entremedias
  a.avanza(C.INTERVALO_ADRENALINA_MIN * MIN + 1000);
  ok(a.desde(t1 + 1, 'adrenalina').length === 1, 'T1 recordatorio a los 3 min de la confirmación');
  a.evento('adrenalina_puesta');
  const t2 = a.ahora;
  a.avanza(C.INTERVALO_ADRENALINA_MIN * MIN + 1000);
  ok(a.desde(t2 + 1, 'adrenalina').length === 1, 'T1 siguiente recordatorio cuenta desde CADA confirmación');
  ok(a.avisos('amiodarona').length === 0, 'T1 nunca amiodarona sin descargas');
  ok(a.estado.descargas === 0 && a.estado.adrenalinas === 2, 'T1 contadores: 0 descargas, 2 adrenalinas');
}

/* ── T2 · FV, 3 descargas, RCE en el 4.º análisis ─────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  for (let i = 0; i < 3; i++) {
    a.evento('analizar'); a.evento('desfibrilable'); a.evento('descarga_hecha');
    if (i < 2) a.avanza(C.CICLO_MS);   // el 3.er postdescarga se examina ya
  }
  const combinada = a.avisos('adrenalina').filter(x => /amiodarona/.test(x.frase));
  ok(combinada.length === 1 && /trescientos miligramos/.test(combinada[0].frase),
    'T2 tras la 3.ª descarga: adrenalina y amiodarona trescientos en una orden');
  a.evento('adrenalina_puesta'); a.evento('amiodarona_puesta');
  a.avanza(C.CICLO_MS);              // 2:00 → análisis del 4.º ciclo
  a.evento('rce');
  const tRce = a.ahora;
  a.avanza(10 * MIN);
  ok(a.desde(tRce + 1).filter(x => x.tipo === 'adrenalina' || x.tipo === 'analisis' || x.tipo === 'preaviso').length === 0,
    'T2 tras RCE: ni adrenalina, ni análisis, ni preavisos');
  ok(a.estado.fase === 'rce' && a.estado.descargas === 3, 'T2 fase RCE con 3 descargas anotadas');
}

/* ── T3 · FV refractaria, 5 descargas seguidas ────────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  for (let i = 1; i <= 5; i++) {
    a.evento('analizar'); a.evento('desfibrilable'); a.evento('descarga_hecha');
    if (i === 3) {
      ok(a.avisos('refractaria').length === 1, 'T3 aviso de refractaria tras la 3.ª seguida');
      ok(a.avisos('adrenalina').some(x => /amiodarona, trescientos/.test(x.frase)), 'T3 adrenalina y amiodarona 300 tras la 3.ª');
      a.evento('adrenalina_puesta'); a.evento('amiodarona_puesta');
    }
    a.avanza(C.CICLO_MS);
  }
  ok(a.avisos('amiodarona').some(x => /ciento cincuenta miligramos/.test(x.frase)),
    'T3 amiodarona ciento cincuenta tras la 5.ª');
  ok(a.avisos('refractaria').length === 1, 'T3 el aviso de refractaria no se repite');
}

/* ── T4 · FV intermitente: desc, no desf, desc, no desf, desc ─────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  const secuencia = ['desfibrilable', 'no_desfibrilable', 'desfibrilable', 'no_desfibrilable', 'desfibrilable'];
  for (const ritmo of secuencia) {
    a.evento('analizar'); a.evento(ritmo);
    if (ritmo === 'desfibrilable') a.evento('descarga_hecha');
    if (a.estado.adrenalinaPedidaDesde !== null) a.evento('adrenalina_puesta');
    a.avanza(C.CICLO_MS);
  }
  ok(a.estado.descargas === 3, 'T4 tres descargas totales');
  ok(a.avisos('amiodarona').some(x => /trescientos/.test(x.frase)) || a.frases().some(f => /amiodarona, trescientos/.test(f || '')),
    'T4 amiodarona 300 tras la 3.ª descarga TOTAL (intermitente)');
  ok(a.avisos('refractaria').length === 0, 'T4 sin aviso de refractaria (nunca 3 seguidas)');
}

/* ── T5 · Análisis sin respuesta ──────────────────────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  a.evento('analizar');
  const t = a.ahora;
  a.avanza(C.ESPERA_ANALISIS_MS + 500);
  const reanudes = a.desde(t, 'reanude');
  ok(reanudes.length === 1 && a.estado.fase === 'rcp',
    'T5 a los 5 s sin decisión: «Reanude compresiones» y vuelta a RCP');
  ok(a.desde(t, 'metro').some(x => x.frase === 'on'), 'T5 el metrónomo vuelve a ON');
}

/* ── T6 · «no desfibrilable» nunca se lee como desfibrilable ──────────────── */
{
  ok(Motor.reconoceOrden('no desfibrilable') === 'no_desfibrilable', 'T6 «no desfibrilable» → no_desfibrilable');
  ok(Motor.reconoceOrden('es no desfibrilable, asistolia') === 'no_desfibrilable', 'T6 con asistolia en la frase');
  ok(Motor.reconoceOrden('ritmo desfibrilable, carga') === 'desfibrilable', 'T6 «desfibrilable» solo → desfibrilable');
  ok(Motor.reconoceOrden('fibrilación') === 'desfibrilable', 'T6 «fibrilación» → desfibrilable');
  ok(Motor.reconoceOrden('AESP') === 'no_desfibrilable', 'T6 «AESP» → no_desfibrilable');
}

/* ── T7 · Los avisos no apagan el metrónomo en plena RCP ──────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  a.avanza(1000);
  a.evento('analizar'); a.evento('no_desfibrilable');   // pide adrenalina, arranca ciclo
  a.avanza(1000);                                        // separa en el reloj el OFF legítimo del análisis
  const t = a.ahora;
  a.avanza(C.PREAVISO_MS);                               // preaviso 1:45 y repetición de adrenalina
  const apagados = a.desde(t + 1, 'metro').filter(x => x.frase === 'off');
  ok(a.desde(t + 1, 'preaviso').length === 1 && apagados.length === 0,
    'T7 preaviso y recordatorios hablan SIN apagar el metrónomo');
}

/* ── T8 · Adrenalina avisada y no confirmada ──────────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  a.evento('analizar'); a.evento('no_desfibrilable');    // 1.ª petición
  const t = a.ahora;
  a.avanza(C.REPETIR_ADRENALINA_MS + 500);
  ok(a.desde(t + 1, 'adrenalina').length === 1, 'T8 se repite UNA vez a los 30 s');
  a.avanza(C.REPETIR_ADRENALINA_MS * 3);
  ok(a.desde(t + 1, 'adrenalina').length === 1, 'T8 y no se repite más');
  a.evento('adrenalina_puesta');
  const tConf = a.ahora;
  a.avanza(C.INTERVALO_ADRENALINA_MIN * MIN + 1000);
  ok(a.desde(tConf + 1, 'adrenalina').length === 1, 'T8 el siguiente intervalo cuenta desde la confirmación');
}

/* ── T9 · «Deshaz» tras una confirmación errónea ──────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  a.evento('analizar'); a.evento('no_desfibrilable');
  a.evento('adrenalina_puesta');
  ok(a.estado.adrenalinas === 1, 'T9 adrenalina anotada');
  const relojAntes = a.estado.ultimaAdrenalinaConf;
  a.evento('deshacer');
  ok(a.estado.adrenalinas === 0 && a.estado.ultimaAdrenalinaConf === null && relojAntes !== null,
    'T9 contador y reloj de adrenalina vuelven atrás');
  ok(a.avisos('eco').some(x => /deshecha/i.test(x.frase)), 'T9 se anuncia el deshacer');
  // La petición pendiente vuelve a estar viva: al confirmar de nuevo, cuenta desde ahí
  a.evento('adrenalina_puesta');
  ok(a.estado.adrenalinas === 1, 'T9 se puede volver a confirmar');
}

/* ── T10 · Energías ───────────────────────────────────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  const esperadas = [150, 150, 200, 200, 200];
  const vistas = [];
  for (let i = 0; i < 5; i++) {
    a.evento('analizar'); a.evento('desfibrilable');
    const ultima = a.avisos('cargue').slice(-1)[0].frase;
    vistas.push(/ciento cincuenta julios/.test(ultima) ? 150 : /doscientos julios/.test(ultima) ? 200 : NaN);
    a.evento('descarga_hecha');
    if (a.estado.adrenalinaPedidaDesde !== null) a.evento('adrenalina_puesta');
    a.avanza(C.CICLO_MS);
  }
  ok(JSON.stringify(vistas) === JSON.stringify(esperadas),
    'T10 energías habladas: ' + vistas.join(',') + ' (esperado 150,150,200,200,200)');
  ok(Motor.energiaDescarga(1) === 150 && Motor.energiaDescarga(2) === 150 && Motor.energiaDescarga(3) === 200 && Motor.energiaDescarga(7) === 200,
    'T10 ENERGIAS_J=[150,150,200] y desde la 3.ª se repite el último valor');
}

/* ── T11 · RCE y «vuelve a parar» ─────────────────────────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  a.evento('analizar'); a.evento('desfibrilable'); a.evento('descarga_hecha');
  a.evento('adrenalina_puesta');
  a.evento('rce');
  ok(a.estado.fase === 'rce', 'T11 fase RCE');
  a.avanza(2 * MIN);
  a.evento('vuelve_a_parar');
  ok(a.estado.fase === 'rcp' && a.estado.descargas === 1 && a.estado.adrenalinas === 1,
    'T11 al volver a parar: descargas y adrenalinas NO se reinician');
  a.evento('analizar'); a.evento('desfibrilable');
  ok(/ciento cincuenta julios/.test(a.avisos('cargue').slice(-1)[0].frase),
    'T11 la siguiente descarga es la 2.ª (ciento cincuenta julios)');
}

/* ── T12 · FV, 1 descarga, luego no desfibrilable sin adrenalina previa ───── */
{
  const a = arnes();
  a.evento('iniciar');
  a.evento('analizar'); a.evento('desfibrilable'); a.evento('descarga_hecha');
  a.avanza(C.CICLO_MS);
  a.evento('no_desfibrilable');
  const pedida = a.avisos('adrenalina').slice(-1)[0];
  ok(!!pedida && /ya\.$/.test(pedida.frase), 'T12 pide adrenalina en el momento al pasar a no desfibrilable');
  a.evento('adrenalina_puesta');
  // Vuelve a FV hasta la 3.ª descarga TOTAL
  for (let i = 0; i < 2; i++) {
    a.evento('analizar'); a.evento('desfibrilable'); a.evento('descarga_hecha');
    a.avanza(C.CICLO_MS);
  }
  ok(a.estado.descargas === 3, 'T12 tres descargas totales');
  const trasTercera = a.avisos('amiodarona').filter(x => /trescientos/.test(x.frase));
  const combinadas = a.avisos('adrenalina').filter(x => /amiodarona/.test(x.frase));
  ok(trasTercera.length === 1 && combinadas.length === 0,
    'T12 tras la 3.ª solo pide amiodarona 300 (la adrenalina ya estaba puesta)');
}

/* ── Extra · fin con confirmación y resumen hablado ───────────────────────── */
{
  const a = arnes();
  a.evento('iniciar');
  a.evento('analizar'); a.evento('desfibrilable'); a.evento('descarga_hecha');
  a.evento('adrenalina_puesta');
  a.avanza(4 * MIN);
  a.evento('fin');
  ok(a.estado.fase === 'confirmandoFin', 'fin pide confirmación');
  a.evento('fin');
  const resumen = a.avisos('fin')[0];
  ok(a.estado.fase === 'finalizada' && /Parada finalizada/.test(resumen.frase)
    && /una descarga/.test(resumen.frase) && /una adrenalina/.test(resumen.frase),
    'resumen hablado con minutos, descargas y adrenalinas · ' + resumen.frase);
  ok(a.estado.registro.length > 3 && a.estado.registro.every(r => typeof r.ms === 'number' && r.texto),
    'registro completo con tiempos desde el inicio');
}

console.log('\n' + (fallos ? fallos + ' FALLOS de ' + pruebas : 'Todo OK · ' + pruebas + ' comprobaciones'));
process.exit(fallos ? 1 : 0);
