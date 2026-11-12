/* ═══════════════════════════════════════════════════════════════════════════
   P45 · Motor del modo parada (SVA adulto, ERC 2025) — SOLO el motor
   ---------------------------------------------------------------------------
   Fuente clínica: ERC Guidelines 2025 Adult Advanced Life Support,
   Resuscitation 2025;215 Suppl 1:110769 (doi:10.1016/j.resuscitation.2025.110769),
   según el documento editorial cerrado de Juanky (26-10-2026). Las cifras son
   LITERALES de ese documento: no se redondea ni se completa nada aquí.

   Motor de reglas DETERMINISTA y PURO: aplicar(estado, evento, ahora) →
   { estado, avisos[], metro }. Sin DOM, sin voz, sin reloj propio (el host
   pasa `ahora` en milisegundos monotónicos): por eso se prueba entero con
   reloj falso (tests/modo-parada-motor.test.mjs, escenarios T1-T12).
   Ninguna decisión clínica sale de un modelo de lenguaje: todo está aquí.

   Escenario fijo del documento: adulto, intrahospitalario, vía aérea avanzada
   y vía venosa ya puestas, varios reanimadores, con médico presente (la app
   marca tiempos y recuerda pasos, no dirige). Fuera de alcance: pediatría,
   embarazo, trauma, hipotermia, circunstancias especiales y post-RCE.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (raiz) raiz.EnferixParadaMotor = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  /* ── Constantes clínicas y de diseño: ÚNICO sitio del código ────────────── */
  var C = {
    CICLO_MS: 2 * 60 * 1000,            // ciclo de RCP: 2 min ✅
    PREAVISO_MS: 105 * 1000,            // 1:45 → "Quince segundos..." ✅
    ESPERA_ANALISIS_MS: 5 * 1000,       // análisis sin respuesta → reanudar ✅
    INTERVALO_ADRENALINA_MIN: 3,        // ✅ decidido (ERC 2025: cada 3-5 min)
    REPETIR_ADRENALINA_MS: 30 * 1000,   // repetir UNA vez si no se confirma ⚠ diseño
    CONFIRMAR_FIN_MS: 15 * 1000,        // ventana para confirmar "fin de parada" ⚠ diseño
    ENERGIAS_J: [150, 150, 200],        // ✅ decidido; desde la 3.ª se repite el último
    ADRENALINA_MG: 1,                   // ✅ ERC 2025
    AMIODARONA_1_MG: 300,               // ✅ tras 3 descargas
    AMIODARONA_2_MG: 150,               // ✅ tras 5 descargas
    DESCARGAS_AMIODARONA_1: 3,          // descargas TOTALES, seguidas o no ✅
    DESCARGAS_AMIODARONA_2: 5,
    DESCARGAS_REFRACTARIA: 3,           // SEGUIDAS → FV refractaria ✅
    BPM: 110                            // ⚠ diseño, dentro del rango 100-120
  };
  var INTERVALO_ADRENALINA_MS = C.INTERVALO_ADRENALINA_MIN * 60 * 1000;

  /* ── Números en palabras (es): el TTS no puede leer mal "1 mg" o "150 J" ── */
  var UNI = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
    'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  var DEC = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var CEN = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  function enPalabras(n) {
    n = Math.round(n);
    if (n < 0 || n > 999) return String(n);
    if (n < 30) return UNI[n];
    if (n < 100) {
      var d = Math.floor(n / 10), u = n % 10;
      return DEC[d] + (u ? ' y ' + UNI[u] : '');
    }
    if (n === 100) return 'cien';
    var c = Math.floor(n / 100), r = n % 100;
    return CEN[c] + (r ? ' ' + enPalabras(r) : '');
  }
  // Para sustantivos femeninos (descarga, adrenalina): un → una, veintiuno → veintiuna
  function enPalabrasFem(n) {
    return enPalabras(n).replace(/uno$/, 'una').replace(/\bun$/, 'una');
  }
  function tiempoEnPalabras(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60); s = s % 60;
    var tm = enPalabras(m) + (m === 1 ? ' minuto' : ' minutos');
    if (!s) return tm;
    return tm + ' y ' + enPalabras(s) + (s === 1 ? ' segundo' : ' segundos');
  }

  /* ── Guion de voz: frases fijas en imperativo, construidas con las constantes ── */
  function energiaDescarga(n) {        // n: número de la descarga que viene (1-based)
    var i = Math.min(n - 1, C.ENERGIAS_J.length - 1);
    return C.ENERGIAS_J[i];
  }
  var FRASES = {
    inicio: function () { return 'Parada iniciada. Comience compresiones. Cuando el monitor esté listo, diga analizar.'; },
    analisis: function () { return 'Pare compresiones. Analice el ritmo. ¿Desfibrilable o no desfibrilable?'; },
    cargue: function (n) { return 'Ritmo desfibrilable. Cargue a ' + enPalabras(energiaDescarga(n)) + ' julios. Apártense. Descargue.'; },
    reanude: function () { return 'Reanude compresiones.'; },
    noDesf: function () { return 'Ritmo no desfibrilable. Reanude compresiones.'; },
    preaviso: function () { return 'Quince segundos. Prepare análisis y cambio de compresor.'; },
    causas: function () { return 'Revise causas reversibles: cuatro H y cuatro T.'; },
    adrenalina: function () { return 'Administre adrenalina, ' + enPalabras(C.ADRENALINA_MG) + ' miligramo.'; },
    adrenalinaYa: function () { return 'Administre adrenalina, ' + enPalabras(C.ADRENALINA_MG) + ' miligramo, ya.'; },
    adrenalinaYAmiodarona: function () { return 'Administre adrenalina, ' + enPalabras(C.ADRENALINA_MG) + ' miligramo, y amiodarona, ' + enPalabras(C.AMIODARONA_1_MG) + ' miligramos.'; },
    amiodarona300: function () { return 'Administre amiodarona, ' + enPalabras(C.AMIODARONA_1_MG) + ' miligramos.'; },
    amiodarona150: function () { return 'Administre amiodarona, ' + enPalabras(C.AMIODARONA_2_MG) + ' miligramos.'; },
    adrenalinaAnotada: function () { return 'Adrenalina anotada.'; },
    amiodaronaAnotada: function () { return 'Amiodarona anotada.'; },
    refractaria: function () { return 'Fibrilación refractaria. Revise el parche lateral. Valore posición anteroposterior.'; },
    rce: function (ms) { return 'Recuperación de circulación a los ' + tiempoEnPalabras(ms) + '.'; },
    vuelveAParar: function () { return 'Parada reanudada. Reanude compresiones.'; },
    confirmarFin: function () { return '¿Finalizar la parada? Repita fin de parada para confirmar.'; },
    fin: function (ms, descargas, adrenalinas) {
      return 'Parada finalizada. ' + tiempoEnPalabras(ms) + '. '
        + enPalabrasFem(descargas) + (descargas === 1 ? ' descarga. ' : ' descargas. ')
        + enPalabrasFem(adrenalinas) + (adrenalinas === 1 ? ' adrenalina.' : ' adrenalinas.');
    },
    deshecho: function (que) { return 'Anotación deshecha: ' + que + '.'; },
    nadaQueDeshacer: function () { return 'No hay ninguna anotación que deshacer.'; }
  };

  /* ── Estado inicial ──────────────────────────────────────────────────────── */
  function estadoInicial() {
    return {
      fase: 'inactiva',          // inactiva | rcp | analisis | carga | rce | confirmandoFin | finalizada
      t0: null,                  // instante de inicio (reloj monotónico del host)
      cicloInicio: null,         // null hasta la primera decisión de ritmo
      ciclo: 0,                  // nº de ciclo de 2 min en curso
      preavisado: false,
      causasAvisadas: false,
      analisisDesde: null,
      descargas: 0,
      descargasSeguidas: 0,
      adrenalinas: 0,
      amiodaronasMg: [],
      // Reloj de adrenalina, independiente del ciclo. "Pendiente" = avisada y
      // sin confirmar; el intervalo cuenta SOLO desde cada confirmación.
      adrenalinaPedidaDesde: null,
      adrenalinaRepetida: false,
      ultimaAdrenalinaConf: null,
      faseAntesDeFin: null,
      finPedidoDesde: null,
      registro: [],              // [{ms, texto}] para el debriefing (sin datos del paciente)
      deshacerPila: []           // confirmaciones reversibles
    };
  }

  /* ── Utilidades internas (el estado se COPIA: función pura) ──────────────── */
  function copia(e) { return JSON.parse(JSON.stringify(e)); }
  function anota(e, ahora, texto) { e.registro.push({ ms: ahora - e.t0, texto: texto }); }
  function aviso(lista, tipo, frase) { lista.push({ tipo: tipo, frase: frase }); }
  function arrancaCiclo(e, ahora) {
    e.cicloInicio = ahora; e.ciclo++; e.preavisado = false; e.causasAvisadas = false;
  }
  function pideAdrenalina(e, ahora, avisos, frase) {
    e.adrenalinaPedidaDesde = ahora; e.adrenalinaRepetida = false;
    aviso(avisos, 'adrenalina', frase);
    anota(e, ahora, 'Aviso: ' + frase);
  }
  function guardaDeshacer(e, tipo) {
    e.deshacerPila.push({
      tipo: tipo,
      descargas: e.descargas,
      descargasSeguidas: e.descargasSeguidas,
      adrenalinas: e.adrenalinas,
      amiodaronasMg: e.amiodaronasMg.slice(),
      adrenalinaPedidaDesde: e.adrenalinaPedidaDesde,
      adrenalinaRepetida: e.adrenalinaRepetida,
      ultimaAdrenalinaConf: e.ultimaAdrenalinaConf
    });
  }
  function trasDescarga(e, ahora, avisos) {
    e.descargas++; e.descargasSeguidas++;
    anota(e, ahora, 'Descarga ' + e.descargas + ' (' + energiaDescarga(e.descargas) + ' J)');
    aviso(avisos, 'reanude', FRASES.reanude());
    // Fármacos por descargas TOTALES (seguidas o intermitentes) ✅
    if (e.descargas === C.DESCARGAS_AMIODARONA_1) {
      if (e.adrenalinas === 0 && e.adrenalinaPedidaDesde === null) {
        pideAdrenalina(e, ahora, avisos, FRASES.adrenalinaYAmiodarona());
      } else if (e.adrenalinas === 0) {
        // Ya estaba pedida y sin confirmar: se mantiene su reloj de repetición,
        // y la amiodarona se pide aparte.
        aviso(avisos, 'amiodarona', FRASES.amiodarona300());
        anota(e, ahora, 'Aviso: ' + FRASES.amiodarona300());
      } else {
        aviso(avisos, 'amiodarona', FRASES.amiodarona300());
        anota(e, ahora, 'Aviso: ' + FRASES.amiodarona300());
      }
    }
    if (e.descargas === C.DESCARGAS_AMIODARONA_2) {
      aviso(avisos, 'amiodarona', FRASES.amiodarona150());
      anota(e, ahora, 'Aviso: ' + FRASES.amiodarona150());
    }
    // FV refractaria: descargas SEGUIDAS ✅
    if (e.descargasSeguidas === C.DESCARGAS_REFRACTARIA) {
      aviso(avisos, 'refractaria', FRASES.refractaria());
      anota(e, ahora, 'Aviso: FV refractaria');
    }
    e.fase = 'rcp';
    arrancaCiclo(e, ahora);
  }

  /* ── El motor: estado + evento + ahora → { estado, avisos, metro } ───────── */
  function aplicar(estadoPrevio, evento, ahora) {
    var e = copia(estadoPrevio);
    var avisos = [];
    var metro = null;     // 'on' | 'off' | null (sin cambio)
    var tipo = evento && evento.tipo;

    /* ── tick: avisos que dependen solo del paso del tiempo ── */
    if (tipo === 'tick') {
      if (e.fase === 'rcp' && e.cicloInicio !== null) {
        if (!e.preavisado && ahora - e.cicloInicio >= C.PREAVISO_MS) {
          e.preavisado = true;
          aviso(avisos, 'preaviso', FRASES.preaviso());
          // Solo en el ciclo 2: repaso de causas reversibles ⚠
          if (e.ciclo === 2 && !e.causasAvisadas) {
            e.causasAvisadas = true;
            aviso(avisos, 'causas', FRASES.causas());
          }
        }
        if (ahora - e.cicloInicio >= C.CICLO_MS) {
          e.fase = 'analisis'; e.analisisDesde = ahora;
          metro = 'off';
          aviso(avisos, 'analisis', FRASES.analisis());
          anota(e, ahora, 'Análisis de ritmo (fin de ciclo ' + e.ciclo + ')');
        }
      } else if (e.fase === 'analisis' && e.analisisDesde !== null) {
        if (ahora - e.analisisDesde >= C.ESPERA_ANALISIS_MS) {
          // Sin decisión en 5 s: las compresiones mandan ✅
          e.fase = 'rcp'; e.analisisDesde = null;
          arrancaCiclo(e, ahora);
          metro = 'on';
          aviso(avisos, 'reanude', FRASES.reanude());
          anota(e, ahora, 'Análisis sin respuesta: se reanudan compresiones');
        }
      }
      if (e.fase === 'confirmandoFin' && e.finPedidoDesde !== null
        && ahora - e.finPedidoDesde >= C.CONFIRMAR_FIN_MS) {
        // La confirmación caduca: se sigue donde se estaba.
        e.fase = e.faseAntesDeFin || 'rcp'; e.finPedidoDesde = null; e.faseAntesDeFin = null;
      }
      // Reloj de adrenalina: independiente del ciclo, activo en rcp/analisis/carga.
      if (e.fase === 'rcp' || e.fase === 'analisis' || e.fase === 'carga') {
        if (e.adrenalinaPedidaDesde !== null && !e.adrenalinaRepetida
          && ahora - e.adrenalinaPedidaDesde >= C.REPETIR_ADRENALINA_MS) {
          e.adrenalinaRepetida = true;        // se repite UNA vez ⚠
          aviso(avisos, 'adrenalina', FRASES.adrenalina());
        }
        if (e.adrenalinaPedidaDesde === null && e.ultimaAdrenalinaConf !== null
          && ahora - e.ultimaAdrenalinaConf >= INTERVALO_ADRENALINA_MS) {
          pideAdrenalina(e, ahora, avisos, FRASES.adrenalina());
        }
      }
      return { estado: e, avisos: avisos, metro: metro };
    }

    /* ── eventos de la secuencia ── */
    switch (tipo) {
      case 'iniciar':
        if (e.fase !== 'inactiva') break;
        e = estadoInicial();
        e.fase = 'rcp'; e.t0 = ahora;
        metro = 'on';
        aviso(avisos, 'inicio', FRASES.inicio());
        anota(e, ahora, 'Parada iniciada');
        break;

      case 'analizar':
        if (e.fase !== 'rcp') break;
        e.fase = 'analisis'; e.analisisDesde = ahora;
        metro = 'off';
        aviso(avisos, 'analisis', FRASES.analisis());
        anota(e, ahora, 'Análisis de ritmo (a petición)');
        break;

      case 'desfibrilable':
        if (e.fase !== 'analisis') break;
        e.fase = 'carga'; e.analisisDesde = null;
        aviso(avisos, 'cargue', FRASES.cargue(e.descargas + 1));
        anota(e, ahora, 'Ritmo desfibrilable; cargando a ' + energiaDescarga(e.descargas + 1) + ' J');
        break;

      case 'no_desfibrilable':
        if (e.fase !== 'analisis') break;
        e.analisisDesde = null;
        e.descargasSeguidas = 0;
        aviso(avisos, 'noDesf', FRASES.noDesf());
        anota(e, ahora, 'Ritmo no desfibrilable');
        e.fase = 'rcp';
        arrancaCiclo(e, ahora);
        metro = 'on';
        // Primera adrenalina lo antes posible si aún no se ha puesto ✅
        // (también viniendo de FV sin llegar a la 3.ª descarga ✅ decidido)
        if (e.adrenalinas === 0 && e.adrenalinaPedidaDesde === null) {
          pideAdrenalina(e, ahora, avisos, FRASES.adrenalinaYa());
        }
        break;

      case 'descarga_hecha':
        if (e.fase !== 'carga') break;
        guardaDeshacer(e, 'descarga');
        trasDescarga(e, ahora, avisos);
        metro = 'on';
        break;

      case 'adrenalina_puesta':
        if (e.fase === 'inactiva' || e.fase === 'finalizada') break;
        guardaDeshacer(e, 'adrenalina');
        e.adrenalinas++;
        e.adrenalinaPedidaDesde = null; e.adrenalinaRepetida = false;
        e.ultimaAdrenalinaConf = ahora;   // el intervalo cuenta desde la confirmación ✅
        aviso(avisos, 'eco', FRASES.adrenalinaAnotada());
        anota(e, ahora, 'Adrenalina ' + C.ADRENALINA_MG + ' mg (nº ' + e.adrenalinas + ')');
        break;

      case 'amiodarona_puesta':
        if (e.fase === 'inactiva' || e.fase === 'finalizada') break;
        guardaDeshacer(e, 'amiodarona');
        e.amiodaronasMg.push(e.amiodaronasMg.length === 0 ? C.AMIODARONA_1_MG : C.AMIODARONA_2_MG);
        aviso(avisos, 'eco', FRASES.amiodaronaAnotada());
        anota(e, ahora, 'Amiodarona ' + e.amiodaronasMg[e.amiodaronasMg.length - 1] + ' mg');
        break;

      case 'rce':
        if (e.fase !== 'rcp' && e.fase !== 'analisis' && e.fase !== 'carga') break;
        e.fase = 'rce'; e.analisisDesde = null; e.cicloInicio = null;
        e.adrenalinaPedidaDesde = null; e.adrenalinaRepetida = false;
        metro = 'off';
        aviso(avisos, 'rce', FRASES.rce(ahora - e.t0));
        anota(e, ahora, 'RCE: recuperación de circulación espontánea');
        break;

      case 'vuelve_a_parar':
        if (e.fase !== 'rce') break;
        e.fase = 'rcp';
        arrancaCiclo(e, ahora);
        metro = 'on';
        aviso(avisos, 'reanude', FRASES.vuelveAParar());
        anota(e, ahora, 'Vuelve a parar: se reanuda la secuencia');
        // Los contadores NO se reinician ✅ (T11). Si la adrenalina venció
        // durante el RCE, se pide ahora.
        if (e.ultimaAdrenalinaConf !== null && ahora - e.ultimaAdrenalinaConf >= INTERVALO_ADRENALINA_MS) {
          pideAdrenalina(e, ahora, avisos, FRASES.adrenalina());
        }
        break;

      case 'deshacer': {
        var ult = e.deshacerPila.pop();
        if (!ult) { aviso(avisos, 'eco', FRASES.nadaQueDeshacer()); break; }
        e.descargas = ult.descargas;
        e.descargasSeguidas = ult.descargasSeguidas;
        e.adrenalinas = ult.adrenalinas;
        e.amiodaronasMg = ult.amiodaronasMg;
        e.adrenalinaPedidaDesde = ult.adrenalinaPedidaDesde;
        e.adrenalinaRepetida = ult.adrenalinaRepetida;
        e.ultimaAdrenalinaConf = ult.ultimaAdrenalinaConf;
        var nombre = ult.tipo === 'descarga' ? 'descarga' : ult.tipo;
        aviso(avisos, 'eco', FRASES.deshecho(nombre));
        anota(e, ahora, 'Deshecho: ' + nombre);
        break;
      }

      case 'fin':
        if (e.fase === 'inactiva' || e.fase === 'finalizada') break;
        if (e.fase === 'confirmandoFin') {
          var dur = ahora - e.t0;
          e.fase = 'finalizada'; e.finPedidoDesde = null;
          metro = 'off';
          aviso(avisos, 'fin', FRASES.fin(dur, e.descargas, e.adrenalinas));
          anota(e, ahora, 'Parada finalizada (' + Math.round(dur / 60000) + ' min, '
            + e.descargas + ' descargas, ' + e.adrenalinas + ' adrenalinas)');
        } else {
          e.faseAntesDeFin = e.fase;
          e.fase = 'confirmandoFin'; e.finPedidoDesde = ahora;
          aviso(avisos, 'confirmarFin', FRASES.confirmarFin());
        }
        break;
    }

    return { estado: e, avisos: avisos, metro: metro };
  }

  /* ── Órdenes de voz: la coincidencia MÁS LARGA gana (punto 7) ────────────── */
  var ORDENES = [
    // El orden importa solo entre prefijos: se resuelve midiendo la variante.
    { orden: 'no_desfibrilable', variantes: ['no desfibrilable', 'asistolia', 'aesp'] },
    { orden: 'desfibrilable', variantes: ['desfibrilable', 'fibrilación', 'fibrilacion', 'taquicardia sin pulso'] },
    { orden: 'iniciar', variantes: ['iniciar parada', 'iniciamos parada', 'iniciamos la rcp'] },
    { orden: 'analizar', variantes: ['analizar', 'monitor listo'] },
    { orden: 'descarga_hecha', variantes: ['descarga hecha', 'descargado', 'choque dado'] },
    { orden: 'adrenalina_puesta', variantes: ['adrenalina puesta', 'adrenalina dentro'] },
    { orden: 'amiodarona_puesta', variantes: ['amiodarona puesta'] },
    { orden: 'rce', variantes: ['hay pulso', 'recupera'] },
    { orden: 'vuelve_a_parar', variantes: ['vuelve a parar'] },
    { orden: 'deshacer', variantes: ['deshaz', 'eso no'] },
    { orden: 'fin', variantes: ['fin de parada'] }
  ];
  function normaliza(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function reconoceOrden(texto) {
    var t = ' ' + normaliza(texto) + ' ';
    var mejor = null, mejorLen = 0;
    for (var i = 0; i < ORDENES.length; i++) {
      for (var j = 0; j < ORDENES[i].variantes.length; j++) {
        var v = normaliza(ORDENES[i].variantes[j]);
        if (t.indexOf(' ' + v + ' ') !== -1 && v.length > mejorLen) {
          mejor = ORDENES[i].orden; mejorLen = v.length;
        }
      }
    }
    return mejor;
  }

  return {
    CONSTANTES: C,
    FRASES: FRASES,
    ORDENES: ORDENES,
    estadoInicial: estadoInicial,
    aplicar: aplicar,
    reconoceOrden: reconoceOrden,
    enPalabras: enPalabras,
    tiempoEnPalabras: tiempoEnPalabras,
    energiaDescarga: energiaDescarga
  };
});
