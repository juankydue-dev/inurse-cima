const SOURCE_EVIDENCE = {
  'GINA': { level: 'A', url: 'https://ginasthma.org', name: 'Global Initiative for Asthma' },
  'GOLD': { level: 'A', url: 'https://goldcopd.org', name: 'Global Strategy for COPD' },
  'ESC': { level: 'A', url: 'https://www.escardio.org', name: 'European Society of Cardiology' },
  'ACC': { level: 'A', url: 'https://www.acc.org', name: 'American College of Cardiology' },
  'AHA': { level: 'A', url: 'https://www.heart.org', name: 'American Heart Association' },
  'NICE': { level: 'A', url: 'https://www.nice.org.uk', name: 'National Institute for Health and Care Excellence' },
  'WHO': { level: 'A', url: 'https://www.who.int', name: 'World Health Organization' },
  'OMS': { level: 'A', url: 'https://www.who.int', name: 'Organización Mundial de la Salud' },
  'SEMICYUC': { level: 'A', url: 'https://www.semicyuc.org', name: 'SEMICYUC' },
  'SEMES': { level: 'A', url: 'https://www.semes.org', name: 'SEMES' },
  'ATS': { level: 'A', url: 'https://www.thoracic.org', name: 'American Thoracic Society' },
  'EULAR': { level: 'A', url: 'https://www.eular.org', name: 'European League Against Rheumatism' },
  'ACR': { level: 'A', url: 'https://www.rheumatology.org', name: 'American College of Rheumatology' },
  'SVA': { level: 'A', url: 'https://www.erc.edu', name: 'European Resuscitation Council' },
  'ERC': { level: 'A', url: 'https://www.erc.edu', name: 'European Resuscitation Council' },
  'ALS': { level: 'A', url: 'https://www.resus.org.uk', name: 'Resuscitation Council UK' },
  'Algoritmo': { level: 'B', url: '', name: 'Protocolo Local' },
  'Protocol': { level: 'B', url: '', name: 'Protocolo Institucional' },
  'iNurse': { level: 'B', url: '', name: 'iNurse CIMA' }
};
function getEvidenceFromSource(source) {
  if (!source) return { level: 'B', url: '', updated: new Date().getFullYear().toString() };
  for (const [key, ev] of Object.entries(SOURCE_EVIDENCE)) {
    if (source.includes(key)) {
      const year = source.match(/(\d{4})/)?.[1] || new Date().getFullYear().toString();
      return { level: ev.level, url: ev.url, updated: year, name: ev.name };
    }
  }
  const year = source.match(/(\d{4})/)?.[1] || new Date().getFullYear().toString();
  return { level: 'C', url: '', updated: year };
}

// BASES DE DATOS FUSIONADAS INYECTADAS
const DOCS = [
  {
    "id": "algoritmo-taquicardia",
    "cat": "cardio",
    "title": "Taquicardia (SVA)",
    "source": "Algoritmo Universal SVA",
    "tags": "taquicardia algoritmo ecg electro tsv tv arritmia rapida",
    "summary": "Algoritmo de actuación ante taquicardias sintomáticas (>150 lpm).",
    "sec": [
      {
        "h": "Evaluación Inicial",
        "b": "<p>Vía aérea permeable, oxigenoterapia si procede. Monitorización de ECG, PA, SpO2. Acceso IV.</p>"
      },
      {
        "h": "¿Signos de inestabilidad?",
        "b": "<ul><li>Shock, síncope, isquemia miocárdica o insuficiencia cardiaca grave.</li><li><b>Si inestable:</b> Cardioversión sincronizada (hasta 3 intentos). Si persiste, Amiodarona 300 mg IV en 10-20 min y nueva cardioversión.</li></ul>"
      },
      {
        "h": "Estable (Sin signos de gravedad)",
        "b": "<ul><li><b>QRS Ancho (>0.12s):</b> Si irregular (FA con bloqueo), tratar como FA. Si regular, Amiodarona 300 mg IV en 20-60 min.</li><li><b>QRS Estrecho (<0.12s):</b> Maniobras vagales. Adenosina 6 mg IV rápido (seguido de flush), repetir 12 mg y 12 mg si necesario. Controlar FC con betabloqueantes o diltiazem.</li></ul>"
      }
    ]
  },
  {
    "id": "algoritmo-bradicardia",
    "cat": "cardio",
    "title": "Bradicardia (SVA)",
    "source": "Algoritmo Universal SVA",
    "tags": "bradicardia algoritmo ecg electro arritmia lenta marcapasos",
    "summary": "Algoritmo de actuación ante bradicardias sintomáticas (<50 lpm).",
    "sec": [
      {
        "h": "Evaluación Inicial",
        "b": "<p>Evaluación ABCDE. Oxígeno si es necesario. Monitorización ECG, PA y SpO2. Vía venosa.</p>"
      },
      {
        "h": "¿Signos de inestabilidad?",
        "b": "<ul><li>Shock, síncope, isquemia miocárdica, IC severa.</li><li><b>Si inestable:</b> Atropina 500 mcg IV (repetir hasta máximo 3 mg).</li></ul>"
      },
      {
        "h": "Si la Atropina no es eficaz",
        "b": "<ul><li>Considerar Marcapasos Transcutáneo.</li><li>Fármacos alternativos: Isoprenalina 5 mcg/min, Adrenalina 2-10 mcg/min, o Dopamina.</li></ul>"
      },
      {
        "h": "Riesgo de Asistolia",
        "b": "<ul><li>Asistolia reciente, Mobitz II, Bloqueo AV de 3er grado, pausas ventriculares >3s.</li><li><b>Acción:</b> Requiere marcapasos profiláctico. Buscar causas reversibles.</li></ul>"
      }
    ]
  },
  {
    "id": "asma",
    "cat": "resp",
    "title": "Asma GINA",
    "source": "GINA 2026 · Adolescentes y adultos",
    "tags": "asma biologico corticoide inhalado omalizumab dupilumab mepolizumab tezepelumab eosinofilos feno tipo2 mart saba laba",
    "summary": "Distinguir asma no controlada, difícil de tratar y grave. Ruta de 10 etapas y biológicos según fenotipo tipo 2.",
    "sec": [
      {
        "h": "Tres definiciones que no son lo mismo",
        "b": "<ul><li><b>No controlada:</b> mal control de síntomas y/o exacerbaciones frecuentes.</li><li><b>Difícil de tratar:</b> sigue descontrolada pese a dosis media-alta de corticoide inhalado + 2º controlador. A menudo el problema es técnica, adherencia, tabaco o diagnóstico erróneo.</li><li><b>Grave:</b> subgrupo del anterior, persiste descontrolada pese a tratamiento óptimo. Etiqueta retrospectiva. Solo ~3,7% de los asmáticos.</li></ul>"
      },
      {
        "h": "Antes de etiquetar de grave (bloque verde, etapas 1-4)",
        "b": "<ul><li>Confirmar que <b>de verdad es asma</b> (12-50% de supuestos casos graves no lo son).</li><li>Revisar <b>técnica inhalatoria</b> (mal hasta en 80%) y <b>adherencia</b> (hasta 75%).</li><li>Tratar comorbilidades: obesidad, RGE, rinosinusitis, apnea, obstrucción laríngea.</li><li>Optimizar: educación, plan escrito, terapia MART, vacunas. Reevaluar a los 3-6 meses.</li></ul>"
      },
      {
        "h": "Fenotipo tipo 2 (etapas 5-8, especialista)",
        "b": "<p>Se considera inflamación tipo 2 con corticoide a dosis alta u oral si:</p><ul><li>Eosinófilos en sangre ≥150/µl</li><li>FeNO ≥20 ppb</li><li>Eosinófilos en esputo ≥2%</li><li>Asma claramente alérgica</li></ul><p>Repetir hasta 3 veces antes de descartarlo; el corticoide oral los suprime.</p>"
      },
      {
        "h": "Biológicos dirigidos a tipo 2",
        "b": "<ul><li><b>Anti-IgE</b> (omalizumab): asma alérgica grave.</li><li><b>Anti-IL5/IL5R</b> (mepolizumab, benralizumab, reslizumab): eosinofílica.</li><li><b>Anti-IL4Rα</b> (dupilumab): tipo 2, útil en dependientes de corticoide oral.</li><li><b>Anti-TSLP</b> (tezepelumab): útil incluso sin marcadores tipo 2 elevados.</li></ul><p>Probar ≥4 meses y evaluar respuesta antes de cambiar.</p>"
      },
      {
        "h": "Oxigenoterapia y aviso sobre el salbutamol (GINA 2026)",
        "b": "<p><b>Iniciar oxígeno solo si SpO₂ &lt; 92 %.</b> <i>«supplemental oxygen not recommended unless saturation is below 92%»</i>.<br><b>Dos poblaciones con reglas distintas — no unificar en una sola cifra:</b><ul><li><b>Adultos, adolescentes y niños de 6 a 11 años:</b> objetivo con O₂ <b>92-95 %</b>, sin superar el 95 % — <i>«the upper limit of the oxygen saturation target for adults, adolescents and children 6–11 years is 95%»</i>.</li><li><b>Niños de 5 años o menos:</b> objetivo <b>≥ 92 %</b> — <i>«the target saturation if oxygen is given is ≥92%»</i>.</li></ul> Una SpO₂ &lt; 92 % en aire ambiente indica presentación grave y obliga a manejo urgente; SpO₂ ≥ 94 % en aire ambiente es compatible con presentación leve.</p><p><b>Precaución con el salbutamol.</b> GINA 2026 recomienda dosis más conservadoras que ediciones previas. El exceso de SABA puede provocar acidosis láctica, cuya hiperventilación compensatoria se confunde fácilmente con empeoramiento del asma y lleva a seguir administrando broncodilatador. Ante un paciente que no mejora pese a dosis repetidas, considerar esta posibilidad antes de escalar la dosis.</p><p><b>Si coexisten anafilaxia y asma:</b> administrar adrenalina IM antes que el broncodilatador.</p>"
      },
      {
        "h": "Para llevar a la cabecera",
        "b": "<ul><li>Minimizar el corticoide oral es prioridad máxima.</li><li><b>Nunca retirar del todo el corticoide inhalado.</b></li><li>El biológico se añade, no sustituye.</li></ul>"
      }
    ]
  },
  {
    "id": "gold",
    "cat": "resp",
    "title": "EPOC: diagnóstico y manejo",
    "source": "GOLD 2026 · Report v1.3 (Dic 2025)",
    "tags": "epoc fev1 fvc espirometria abe laba lama ics eosinofilos exacerbacion ensifentrina dupilumab mepolizumab roflumilast azitromicina tabaco rehabilitacion actividad baja actividad case-finding busqueda activa vrs",
    "summary": "Diagnóstico por espirometría (FEV1/FVC <0,70). Reencuadre 2026: enfermedad de actividad, objetivo «baja actividad». Escalar con una sola exacerbación. Búsqueda activa de casos.",
    "sec": [
      {
        "h": "Reencuadre 2026: enfermedad de actividad",
        "b": "<p>GOLD 2026 recontextualiza la EPOC como enfermedad de <b>actividad</b> más que como limitación fija al flujo aéreo. El objetivo terapéutico pasa a ser alcanzar y mantener un <b>estado de baja actividad de la enfermedad</b> — se abandona la idea de la EPOC como diagnóstico estático.</p><p>La guía añade un <b>algoritmo de búsqueda activa de casos</b> (case-finding) para detectar antes a los pacientes: la EPOC infradiagnosticada es una prioridad de salud pública.</p>"
      },
      {
        "h": "Diagnóstico",
        "b": "<p>Confirmación con espirometría: <b>FEV1/FVC posbroncodilatador &lt; 0,70.</b> Gravedad por FEV1: GOLD 1 ≥80%, GOLD 2 50-79%, GOLD 3 30-49%, GOLD 4 &lt;30%.</p>"
      },
      {
        "h": "Clasificación ABE: el grupo E baja a UNA exacerbación (GOLD 2026)",
        "b": "<p>Criterios de la <b>Figura 2.13 «GOLD ABE Assessment Tool»</b> de GOLD 2026. Cambia el eje de exacerbaciones; los cortes de síntomas no.</p><ul><li><b>Grupo A</b> — <b>cero</b> exacerbaciones moderadas o graves el año previo, y mMRC 0-1 / CAAT &lt;10 → un broncodilatador de larga duración.</li><li><b>Grupo B</b> — <b>cero</b> exacerbaciones moderadas o graves el año previo, y mMRC ≥2 / CAAT ≥10 → <b>LABA + LAMA</b>.</li><li><b>Grupo E</b> — <b>una o más (≥1)</b> exacerbaciones moderadas o graves el año previo, con cualquier nivel de síntomas → <b>LABA + LAMA</b>. Si eosinófilos ≥300, valorar LABA + LAMA + ICS.</li></ul><p><b>Qué cambia respecto a 2025:</b> antes el grupo E exigía ≥2 moderadas o ≥1 con hospitalización, y los grupos A y B admitían hasta una moderada sin hospitalización. Ahora <b>el paciente con una sola exacerbación moderada ambulatoria pasa de A o B a E</b>. Los cortes de mMRC y CAAT son idénticos a 2025, y los fármacos de cada casilla también: lo que cambia es quién cae en cada casilla.</p><p>Justificación literal: <i>«Observational studies have shown that even one moderate or severe exacerbation prior to initiating maintenance pharmacological therapy increases the risk of subsequent events; this risk is further increased if there are more frequent or severe events. Consequently, Group E has been modified to include individuals with one moderate exacerbation in the previous year.»</i></p><p><small>Fuente: GOLD 2026 v1.3, Figura 2.13 (criterios) y Figura 3.8 (tratamiento inicial).</small></p><p><b>Umbral de escalada más bajo (novedad GOLD 2026):</b> incluso <b>una sola exacerbación moderada o grave</b> antes de iniciar el tratamiento de mantenimiento aumenta el riesgo de nuevos eventos. No hace falta esperar a dos exacerbaciones al año para intervenir con más intensidad.</p><p>A todos, broncodilatador de rescate de acción corta.</p>"
      },
      {
        "h": "Seguimiento por síntoma dominante",
        "b": "<ul><li><b>Disnea:</b> optimizar broncodilatación, valorar ensifentrina.</li><li><b>Exacerbaciones:</b> escalar a triple terapia. ICS beneficia con eosinófilos ≥100, más cuanto más altos.</li><li>Eosinófilos &lt;100 persistentes: azitromicina (no fumadores) o roflumilast.</li><li>Triple terapia + eosinófilos ≥300 con bronquitis crónica: <b>dupilumab y mepolizumab</b> como opciones en fenotipo de inflamación tipo 2 (evidencia reforzada en GOLD 2026; contrastar nivel exacto con el Report v1.3 antes de basar una recomendación firme).</li></ul>"
      },
      {
        "h": "No farmacológico",
        "b": "<ul><li><b>Dejar de fumar</b> es lo que más modifica el curso.</li><li>Vacunas: gripe, neumococo, COVID, Tdap, herpes zóster; <b>VRS a partir de los 50 años</b> (actualización GOLD 2026, era ≥60).</li><li>Rehabilitación pulmonar en todos los grados.</li><li>Oxigenoterapia de larga duración en hipoxemia grave en reposo.</li></ul>"
      },
      {
        "h": "Exacerbaciones",
        "b": "<p>Empeoramiento &lt;14 días. Descartar neumonía, IC y TEP. Broncodilatadores de acción corta + corticoides sistémicos (≤5 días) ± antibióticos (5 días). VMNI de primera opción en fallo respiratorio agudo. GOLD 2026 revisa la clasificación de gravedad de exacerbaciones y los criterios de ingreso — revisar el capítulo específico en el Report.</p>"
      }
    ]
  },
  {
    "id": "fa",
    "cat": "cardio",
    "title": "Fibrilación auricular",
    "source": "ESC 2024 · con EACTS",
    "tags": "fibrilacion auricular fa af-care anticoagulacion cha2ds2-va acod ictus frecuencia ritmo ablacion cardioversion betabloqueante",
    "summary": "Esquema AF-CARE: comorbilidades, anticoagulación, reducir síntomas y evaluación dinámica. Escala CHA2DS2-VA.",
    "sec": [
      {
        "h": "El camino AF-CARE",
        "b": "<ul><li><b>[C] Comorbilidades:</b> tratar HTA, IC, diabetes, obesidad, apnea, alcohol y sedentarismo. Es la primera pieza.</li><li><b>[A] Anticoagulación:</b> evitar ictus.</li><li><b>[R] Reducir síntomas:</b> frecuencia y ritmo.</li><li><b>[E] Evaluación dinámica:</b> reevaluar periódicamente.</li></ul>"
      },
      {
        "h": "Anticoagulación · CHA2DS2-VA",
        "b": "<p>Versión actualizada que <b>ya no incluye el sexo</b>:</p><ul><li>C insuficiencia cardíaca (1) · H hipertensión (1)</li><li>A2 edad ≥75 (2) · D diabetes (1)</li><li>S2 ictus/AIT/TE previa (2) · V enfermedad vascular (1) · A edad 65-74 (1)</li></ul><p>≥2 → anticoagular; =1 → considerar. <b>ACOD de elección</b> frente a AVK. El riesgo de sangrado corrige factores, no niega la anticoagulación.</p>"
      },
      {
        "h": "Reducir síntomas",
        "b": "<ul><li><b>Frecuencia:</b> betabloqueantes, diltiazem/verapamilo, digoxina de apoyo.</li><li><b>Ritmo:</b> cardioversión (con anticoagulación periprocedimiento), antiarrítmicos según cardiopatía.</li><li><b>Ablación:</b> 1ª línea en FA paroxística seleccionada; útil en FA con IC y FEVI reducida.</li></ul>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Educación en adherencia a la anticoagulación y signos de alarma, vigilancia de frecuencia y síntomas, cuidados en cardioversión/ablación y coordinación del seguimiento.</p>"
      }
    ]
  },
  {
    "id": "ic",
    "cat": "cardio",
    "title": "Insuficiencia cardíaca (crónica y descompensada)",
    "source": "ESC 2026",
    "tags": "insuficiencia cardiaca fevi icfer icfec arni iscglt2 betabloqueante arm mineralocorticoide furosemida diuretico nyha bnp congestion humedo seco caliente frio estadios semaglutida tirzepatida obesidad descompensada fundacional",
    "summary": "Nueva clasificación por FEVI (IC-FEr <50% agrupa la antigua «ligeramente reducida»; IC-FEc ≥50%). ARM clase I en toda FEVI. La antigua «IC aguda» pasa a «IC descompensada».",
    "sec": [
      {
        "h": "Clasificación por FEVI (ESC 2026)",
        "b": "<ul><li><b>IC-FEr</b> (reducida): FEVI <b>&lt; 50 %</b>. <b>Desaparece la categoría «ligeramente reducida» (41-49 %)</b> — se integra aquí. Comparten etiología (contractilidad reducida, disfunción sistólica) y responden al mismo tratamiento; muchos pacientes con FEVI 41-49 % deterioran a &lt; 40 % con el tiempo.</li><li><b>IC-FEc</b> (conservada): FEVI ≥ 50 % con alteración estructural y péptidos elevados.</li></ul><p><b>⚠️ Dos marcos vigentes sobre el corte de FEVI — la app no elige por ti.</b></p><ul><li><b>Guía ESC de IC 2026</b> (28/08/2026): mantiene el corte numérico, <b>&lt;50 % y ≥50 %</b>, que es el que usa esta ficha.</li><li><b>2ª Definición Universal de IC</b> (29/06/2026, AHA/ACC/ESC/WHF con HFSA, HFA y JHFS): se aleja de los cortes rígidos — <i>«the classification of HF phenotypes moves away from rigid left ventricular ejection fraction cutoffs, instead grouping HF into reduced, preserved, and improved ejection fraction categories»</i>, <i>«moving away from arbitrary numeric LVEF thresholds»</i>.</li></ul><p>Son dos meses de diferencia y la ESC firma los dos documentos. No es necesariamente una contradicción: puede que la guía subordine el corte a la valoración clínica. Mientras no se coteje en el texto primario, <b>el corte no debe codificarse como criterio automático</b> en ninguna calculadora.</p><p>Diagnóstico con clínica + péptidos natriuréticos + ecocardiografía. La FEVI puede estar <b>falsamente elevada</b> en ciertas situaciones (p. ej. insuficiencia mitral significativa).</p><p><b>IC con FEVI mejorada:</b> los pacientes con IC-FEr que mejoran la FEVI tras tratamiento tienen mejor pronóstico, pero <b>deben mantener el tratamiento médico óptimo</b> — retirarlo lleva a recaída.</p>"
      },
      {
        "h": "Estadios A-D (ESC 2026)",
        "b": "<ul><li><b>A · En riesgo:</b> sin signos, síntomas ni alteraciones cardíacas.</li><li><b>B · Pre-IC:</b> alteraciones cardíacas sin signos ni síntomas.</li><li><b>C · IC sintomática.</b></li><li><b>D · IC avanzada.</b></li></ul><p>El énfasis 2026 está en <b>prevención e inicio precoz del tratamiento</b>: cuanto antes en el estadio, mayor beneficio.</p>"
      },
      {
        "h": "Terapia farmacológica fundacional",
        "b": "<ul><li><b>IECA o ARNI</b> (sacubitrilo-valsartán preferente) en IC-FEr.</li><li><b>Betabloqueante</b> titulado en IC-FEr.</li><li><b>ARM</b> (espironolactona o eplerenona) — <b>clase I en IC crónica sea cual sea la FEVI</b>, no sólo en IC-FEr (cambio ESC 2026).</li><li><b>iSGLT2</b> (dapagliflozina/empagliflozina).</li></ul><p>Ponerlos pronto y a la vez. Los <b>diuréticos de asa</b> (furosemida) forman parte de la <b>terapia adicional</b> para la congestión: alivian síntomas pero no cambian pronóstico.</p><p><b>Semaglutida o tirzepatida (clase IIa)</b> en IC-FEc con obesidad.</p><p>La ESC 2026 reagrupa el tratamiento en <b>fundacional / adicional / intervencionista dirigida por guías</b>, dejando atrás la etiqueta GDMT («tratamiento médico dirigido por guías»).</p>"
      },
      {
        "h": "IC descompensada (antes «IC aguda»)",
        "b": "<p>La ESC 2026 reemplaza el término «IC aguda» por <b>«IC descompensada»</b>: en la mayoría de los pacientes la función cardíaca declina de forma progresiva hasta que el corazón ya no compensa, no de forma súbita — la etiqueta anterior transmitía una idea equivocada.</p><p>Valorar dos ejes: congestivo (<b>húmedo</b>/seco) y perfusión (<b>caliente</b>/frío).</p><ul><li>Oxigenoterapia/VMNI si insuficiencia respiratoria.</li><li>Diuréticos de asa IV para descongestionar.</li><li>Vasodilatadores IV si la tensión lo permite.</li><li>Inotrópicos/vasopresores solo en shock cardiogénico.</li></ul><p>Buscar desencadenante: SCA, crisis HTA, arritmia, infección, transgresión, anemia, TEP. <b>Cribar comorbilidad renal</b> (filtrado glomerular estimado + cociente albúmina/creatinina en orina, según ESC 2026 cardio-renal).</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Educación (adherencia, peso diario, sal), vigilancia de congestión, función renal e iones en la titulación. Cribar déficit de hierro (hierro IV mejora síntomas y reingresos).</p><p>Para el manejo prehospitalario específico del edema agudo de pulmón y de la IC descompensada extrahospitalaria, consultar las fichas basadas en INGESA («Insuficiencia cardíaca aguda y EAP», «Insuficiencia cardiaca aguda» y «Edema agudo de pulmón»), que se mantienen con su fuente original.</p>"
      }
    ]
  },
  {
    "id": "iam-definicion-2026",
    "cat": "cardio",
    "title": "Infarto de miocardio: clasificación y troponinas",
    "source": "5ª Definición Universal del IAM · ESC/ACC/AHA/WHF 2026 (Glob Heart 21(1):64)",
    "tags": "infarto iam definicion universal quinta 5 primario secundario relacionado con procedimiento troponina percentil 99 sexo minoca stemi nstemi lesion miocardica onda q angina inestable sca coronario",
    "summary": "Desaparece la numeración por tipos: primario, secundario o relacionado con procedimiento. Troponina con percentil 99 específico por sexo y sin cifra fija.",
    "sec": [
      {
        "h": "Se elimina la clasificación numérica",
        "b": "<p>La 5ª Definición Universal retira los tipos 1, 2, 3, 4a, 4b, 4c y 5. Literal: <i>«The previous numerical classification of myocardial infarction has been replaced. Myocardial infarction is now classified into one of three clinical types»</i>.</p><ul><li><b>Infarto primario:</b> <i>«spontaneous presentation due to a primary acute coronary pathology»</i>.</li><li><b>Infarto secundario:</b> <i>«resulting from myocardial oxygen supply–demand imbalance due to another acute condition»</i>.</li><li><b>Infarto relacionado con procedimiento:</b> <i>«occurring as a complication of a percutaneous or surgical cardiac procedure»</i>.</li></ul><p>Motivo del cambio, literal: <i>«To reflect underlying pathophysiology, align with clinical evaluation, and enable consistent application»</i>.</p><p><small>Fuente: 5ª Definición Universal del IAM, 28/08/2026. Sustituye a la 4ª (2018).</small></p>"
      },
      {
        "h": "⚠️ Correspondencia con los tipos antiguos — aquí es fácil equivocarse",
        "b": "<ul><li><b>Tipo 1</b> (aterotrombosis) → <b>primario</b>, pero <b>se amplía</b>.</li><li><b>Tipo 2</b> (desequilibrio aporte/demanda) → <b>secundario</b>, y <b>se estrecha</b>.</li><li><b>Tipo 3</b> (muerte súbita) → <b>eliminado</b>.</li><li><b>Tipos 4a, 4b, 4c y 5</b> → <b>relacionado con procedimiento</b>, unificados.</li></ul><p><b>El infarto primario ya no es solo aterotrombosis.</b> Literal: <i>«Primary myocardial infarction — Includes all acute coronary pathologies: atherothrombosis; spontaneous coronary artery dissection; coronary embolism; vasospasm; and restenosis, stent thrombosis, or graft failure &gt;30 days from procedure»</i>.</p><p><b>Consecuencia práctica:</b> la <b>disección coronaria espontánea</b>, la <b>embolia coronaria</b> y el <b>vasoespasmo</b> eran tipo 2 en 2018 y ahora son <b>primario</b>, no secundario.</p><p>Tipo 3, literal: <i>«Term removed. Where myocardial infarction is the likely cause of death, clinical classification (primary, secondary, or procedure-related) should be applied, based on setting or post-mortem findings»</i>. Razón: <i>«Limited use in clinical practice»</i>.</p>"
      },
      {
        "h": "Troponina: percentil 99 específico por sexo, y sin cifra fija",
        "b": "<p><b>Lesión miocárdica aguda</b>, literal: <i>«a rise and/or fall in cardiac troponin I or T with at least one value above the sex-specific 99th percentile URL»</i>.</p><p>Motivo: <i>«Sex-specific thresholds are necessary to avoid a systematic bias and the under-recognition of myocardial injury in female patients»</i>. La guía señala que <i>«the URL in females is half the URL in males for cardiac troponin T»</i> en una población de referencia sana global.</p><p><b>Qué cambia respecto a 2018:</b> el percentil 99 no cambia; lo que cambia es que los umbrales por sexo pasan de estar <i>recomendados</i> con ensayos de alta sensibilidad a formar <b>parte de la definición</b>.</p><p><b>❌ No hay cifras en ng/L, y no debe haberlas en una ficha.</b> Literal: <i>«As cardiac troponin assays are not standardized by the manufacturers […] clinicians should refer to the International Federation of Clinical Chemistry and Laboratory Medicine Biomarkers Reference Tables and apply assay-specific thresholds in practice»</i>. <b>Usa siempre el valor del laboratorio de tu centro.</b></p>"
      },
      {
        "h": "Trampa: los algoritmos rápidos 0/1 h no usan umbral por sexo",
        "b": "<p>Literal: <i>«The thresholds used to triage patients with possible myocardial infarction in accelerated diagnostic pathways are often not based on the 99th percentile of the cardiac troponin assay and here uniform rather than sex-specific thresholds have been applied. […] It should be noted that these thresholds are used for risk stratification, rather than to define myocardial injury and confirm a final diagnosis of myocardial infarction»</i>.</p><p><b>Los algoritmos rápidos estratifican riesgo; los criterios diagnósticos definen el infarto.</b> No son lo mismo y no deben mezclarse.</p><p><b>Deltas:</b> por debajo o alrededor del percentil 99 se prefieren los valores absolutos a los relativos, y <i>«absolute delta values are assay-specific, and a cut-off value cannot be transferred from one assay to another»</i>.</p><p><b>Edad:</b> no hay umbrales ajustados. Dato útil: <i>«1 in 3 patients over 75 years with possible myocardial infarction have an elevated cardiac troponin concentration compared with 1 in 20 patients under 50 years old»</i>.</p>"
      },
      {
        "h": "Lesión miocárdica crónica: criterio nuevo y cuantificado",
        "b": "<p>Literal: <i>«Chronic myocardial injury is considered if two or more cardiac troponin I or T values are above the sex-specific 99th percentile URL when testing is performed in a stable clinical setting. Chronic myocardial injury is confirmed when a cardiac or non-cardiac condition associated with cardiac remodelling is identified and is excluded when the elevation in cardiac troponin is explained by analytical interference or reduced clearance»</i>.</p><p>El requisito de <b>dos o más valores en situación estable</b> es nuevo: la 4ª definición no lo cuantificaba.</p>"
      },
      {
        "h": "MINOCA cambia de significado",
        "b": "<p>Literal: <i>«The definition of MINOCA is updated to \u2018myocardial injury with non-obstructive coronary arteries\u2019 in recognition that this is a working rather than final diagnosis»</i>.</p><p>Antes decía <i>infarction</i>; ahora dice <b>injury</b>. Motivo: <i>«most patients are subsequently found to have a non-coronary cardiac (e.g. myocarditis, Takotsubo syndrome, cardiomyopathy) or non-cardiac cause (e.g. pulmonary embolism)»</i>.</p><p>Definición angiográfica: <i>«non-obstructive coronary arteries (no stenosis ≥50%) on coronary angiography»</i>.</p><p><b>Misma sigla, concepto distinto, y ahora es diagnóstico de trabajo, no final.</b></p>"
      },
      {
        "h": "Infarto relacionado con procedimiento",
        "b": "<p><b>Los múltiplos de troponina dejan de ser criterio diagnóstico.</b> Literal: <i>«The diagnosis of procedure-related myocardial infarction does not rely on cardiac biomarker thresholds and is comparable for percutaneous and surgical procedures»</i>. Los antiguos ×5 y ×10 de los tipos 4a y 5 <i>«were arbitrary»</i>.</p><p>Ahora los múltiplos solo orientan <b>cuándo pedir imagen</b>, y las cifras cambian: <i>«the diagnosis is likely with higher cardiac biomarker levels that have increased from pre-procedural levels and continue to rise at 6 h (e.g. &gt;5 times URL for intervention) and 24 h (e.g. &gt;35 times URL for surgery)»</i>. Ojo: <b>×35 en cirugía</b>, no ×10.</p><p><b>Procedimiento cardíaco</b>, definición: <i>«coronary angiography with or without intervention, structural cardiac intervention, or catheter ablation, and any open or minimally invasive cardiac surgical procedure, including CABG, valve replacement, or other procedures for structural heart conditions»</i>. Ventana de <b>30 días</b>.</p>"
      },
      {
        "h": "Otros cambios que afectan al lenguaje de la ficha",
        "b": "<ul><li><b>STEMI y NSTEMI se mantienen</b> como clasificación electrocardiográfica paralela, con códigos ICD-11 propios (BA41.0 y BA41.1).</li><li><b>La angina inestable se mantiene:</b> <i>«unstable angina has not disappeared from clinical practice and is still considered part of the spectrum of ACS»</i>.</li><li><b>«Infarto silente» pasa a «infarto no reconocido»</b> (<i>unrecognized</i>): <i>«the term \u2018silent\u2019 myocardial infarction can in some cases be misleading»</i>. Confirmación por imagen <i>«preferably with CMR with late gadolinium enhancement»</i>.</li><li><b>Enfermedad coronaria obstructiva</b>, definición cuantitativa: <i>«≥70% stenosis in an epicardial vessel by angiography (or ≥50% stenosis in an epicardial vessel that is flow-limiting on physiological assessment)»</i>.</li><li><b>Onda Q patológica</b>, vuelve la definición clásica: <i>«requires a Q-wave duration ≥40 ms and/or a depth of ≥25% of the R wave in the same lead»</i>.</li></ul>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<ul><li>Registrar la <b>hora exacta</b> de inicio del dolor y de cada extracción: el diagnóstico se apoya en el <b>ascenso o descenso seriado</b>, no en un valor aislado.</li><li>Al transmitir un resultado de troponina, decir <b>el valor y el límite del laboratorio</b>, no solo «elevada»: el umbral depende del ensayo y del sexo.</li><li>Cuidado al reutilizar cifras de troponina entre centros o entre ensayos distintos: no son transferibles.</li><li>Una troponina elevada no es sinónimo de infarto: puede ser lesión miocárdica de causa no coronaria.</li></ul>"
      }
    ]
  },
  {
    "id": "cardio-renal",
    "cat": "cardio",
    "title": "Cribado cardio-renal (ESC/ERA 2026)",
    "source": "ESC 2026 · en colaboración con European Renal Association (DOI 10.1093/eurheartj/ehag098)",
    "tags": "cardio renal erc enfermedad renal cronica cribado albuminuria cociente albumina creatinina filtrado glomerular egfr stamp iecas ara-ii isglt2 estatinas prevencion cardiovascular",
    "summary": "Primera guía ESC de eje cardio-renal: cribado universal de ERC en toda enfermedad cardiovascular con eGFR y cociente albúmina/creatinina en orina. Marco STAMP.",
    "sec": [
      {
        "h": "Novedad 2026",
        "b": "<p>Primera guía conjunta ESC + European Renal Association. Se estima que en Europa hay ~100 millones de personas con enfermedad renal crónica; todas ellas con riesgo cardiovascular elevado. La guía sale del silo tradicional y aborda el eje cardio-renal como una única entidad.</p>"
      },
      {
        "h": "Cribado universal de ERC en cardiovascular",
        "b": "<p>En todo paciente con enfermedad cardiovascular conocida se recomienda cribado de ERC. Incluye <b>dos determinaciones</b>, no una:</p><ul><li><b>Filtrado glomerular estimado</b> a partir de creatinina. ⚠️ <b>La ecuación está en disputa y esta ficha no la resuelve:</b> la recomendación formal de la ESC no nombra ecuación (<i>«Measurement of a creatinine-based eGFR using a validated estimating equation is recommended»</i>, I/A), pero su texto narrativo <b>rechaza la CKD-EPI 2021 para Europa</b> — <i>«The 2009 […] CKD-EPI eGFR equation without the race coefficient appears to be an optimal compromise for European populations […] instead of the newer 2021 equation. The 2021 equation was developed for a United States (US) population and overestimates GFR in large parts of Europe»</i>. <b>KDIGO mantiene la de 2021</b>, y es la que usan las calculadoras de Enferix.</li><li><b>Cociente albúmina/creatinina en orina (UACR)</b> — pieza clave para detectar daño renal precoz que no se ve con la creatinina sola.</li></ul><p>La sola creatinina infradiagnostica ERC. El UACR se recomienda incluir en la primera analítica de cribado cardiovascular.</p>"
      },
      {
        "h": "Marco STAMP",
        "b": "<ul><li><b>S · Screen</b> (cribar): eGFR + UACR en todo paciente con EC.</li><li><b>T · Triage</b> (triar): estratificar el riesgo combinado ERC-EC.</li><li><b>A · Address CKD risk</b>: abordar factores modificables (HTA, DM, obesidad, tabaco).</li><li><b>M · Modify CVD management</b>: adaptar el manejo cardiovascular al perfil renal (ajuste de dosis, elección de fármacos).</li><li><b>P · Plan services</b>: coordinar servicios y planificar seguimiento nefrocardiológico.</li></ul>"
      },
      {
        "h": "Tratamiento precoz",
        "b": "<p>Despliegue precoz de:</p><ul><li><b>IECA / ARA-II</b> para reducir albuminuria y proteger el riñón.</li><li><b>iSGLT2</b> (dapagliflozina, empagliflozina) — beneficio cardiovascular y renal demostrado.</li><li><b>Estatinas</b> según riesgo cardiovascular.</li><li>Control estricto de HTA, DM y peso.</li></ul>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Vigilar creatinina y potasio al iniciar/titular IECA/ARA-II/iSGLT2. Educación en adherencia y en signos de descompensación renal (edema, oliguria, disnea nueva). Coordinar con nefrología si eGFR &lt; 30 o UACR ≥ 300 mg/g. Cruce con la ficha de insuficiencia cardíaca para cribado renal en descompensación.</p>"
      }
    ]
  },
  {
    "id": "anemia-erc",
    "cat": "cardio",
    "title": "Anemia en enfermedad renal crónica (KDIGO 2026)",
    "source": "KDIGO 2026 · Anemia in CKD (Kidney International)",
    "tags": "anemia enfermedad renal cronica erc kdigo hemoglobina hierro oral intravenoso hif-phi prolil hidroxilasa eritropoyesis esa transfusion decision compartida",
    "summary": "Sustituye la guía KDIGO 2012. Abandona la diana única de Hb: decisión individualizada. Nuevos criterios de hierro IV vs oral y de HIF-PHI.",
    "sec": [
      {
        "h": "Cambio de fondo: sin diana única de hemoglobina",
        "b": "<p>KDIGO 2026 abandona la <b>diana única de hemoglobina</b> que orientaba la práctica desde 2012. La decisión de subir la Hb pasa a ser <b>individualizada</b>, mediante <b>decisión compartida</b> con el paciente en función de:</p><ul><li>Síntomas atribuibles a la anemia.</li><li>Comorbilidad (cardiovascular, oncológica).</li><li>Riesgo de transfusión y de eventos adversos por eritropoyesis-estimulantes o HIF-PHI.</li><li>Preferencias y valores del paciente.</li></ul><p>Cualquier tabla con rango fijo de Hb objetivo procedente de la guía 2012 queda superada.</p>"
      },
      {
        "h": "Evaluación sistemática de anemia y déficit de hierro",
        "b": "<p>Ante Hb reducida en ERC, evaluar sistemáticamente:</p><ul><li>Hemograma completo, reticulocitos, ferritina, saturación de transferrina (IST).</li><li>Vitamina B12 y folato.</li><li>Descartar sangrado activo, hemólisis, inflamación crónica.</li><li>Función renal y proteinuria.</li></ul>"
      },
      {
        "h": "Hierro oral vs intravenoso",
        "b": "<p>KDIGO 2026 aclara los criterios:</p><ul><li><b>Hierro oral</b>: ERC no diálisis con buena tolerancia y déficit leve-moderado. Barato y accesible; limitado por tolerancia digestiva y absorción reducida en inflamación crónica.</li><li><b>Hierro intravenoso</b>: preferente en diálisis, en intolerancia oral, en respuesta insuficiente al oral, y cuando se busca corrección más rápida. Preparados de alta dosis por infusión son la opción actual.</li></ul>"
      },
      {
        "h": "ESAs y HIF-PHIs (novedad)",
        "b": "<p>La decisión de usar <b>agentes estimulantes de la eritropoyesis (ESAs)</b> o <b>inhibidores de la prolil-hidroxilasa del HIF (HIF-PHIs)</b> para subir la hemoglobina se toma por <b>decisión compartida</b>, considerando síntomas, riesgos de transfusión y riesgos específicos del fármaco.</p><ul><li><b>ESAs</b> (darbepoetina, epoetina): vía SC/IV, uso consolidado.</li><li><b>HIF-PHIs</b> (roxadustat, daprodustat, vadadustat): vía oral, novedad de 2026. Perfil de riesgo cardiovascular específico — revisar contraindicaciones antes de iniciar.</li></ul>"
      },
      {
        "h": "Transfusión",
        "b": "<p>La transfusión se reserva para anemia grave sintomática con riesgo vital, sangrado activo o falta de respuesta a las otras estrategias. Cada transfusión aumenta el riesgo de aloinmunización — importante en candidatos a trasplante renal.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Registrar Hb basal y tendencia, no cifras absolutas. Vigilar síntomas atribuibles a anemia (astenia, disnea de esfuerzo, palpitaciones, mala calidad del sueño). Adherencia al hierro oral (dosis fraccionadas, ayunas si tolera, no con calcio ni café). Reacciones a la infusión IV de hierro. Educación en decisión compartida: no hay «una Hb correcta» — hay la Hb que le va mejor a este paciente concreto.</p>"
      }
    ]
  },
  {
    "id": "arritmias",
    "cat": "cardio",
    "title": "Arritmias ventriculares y muerte súbita",
    "source": "ESC 2022",
    "tags": "arritmia ventricular muerte subita dai desfibrilador fibrilacion ventricular taquicardia tormenta electrica amiodarona ablacion rcp dea canalopatia brugada",
    "summary": "Manejo de arritmias ventriculares y prevención de muerte súbita. El DAI es la herramienta central.",
    "sec": [
      {
        "h": "Conceptos",
        "b": "<ul><li>Extrasístoles ventriculares: aisladas, a menudo benignas.</li><li>TV no sostenida (rachas breves) y sostenida (compromete gasto).</li><li><b>Fibrilación ventricular:</b> caótica, sin pulso → parada.</li><li><b>MSC:</b> muerte inesperada de origen cardíaco.</li></ul>"
      },
      {
        "h": "Respuesta a la parada en comunidad",
        "b": "<p>La supervivencia depende de la cadena: formación en RCP, acceso público a <b>DEA</b> en lugares concurridos, RCP precoz por testigos y desfibrilación temprana.</p>"
      },
      {
        "h": "Manejo agudo",
        "b": "<ul><li>Tratar causas reversibles: isquemia, iones, fármacos.</li><li>TV monomórfica con inestabilidad: <b>cardioversión eléctrica inmediata</b>.</li><li><b>Tormenta eléctrica:</b> betabloqueo, sedación, amiodarona y, si refractaria, ablación.</li></ul>"
      },
      {
        "h": "DAI y largo plazo",
        "b": "<ul><li><b>Prevención secundaria:</b> supervivientes de parada/TV sostenida sin causa reversible.</li><li><b>Prevención primaria:</b> riesgo elevado por cardiopatía con disfunción ventricular.</li></ul><p>Optimizar programación para evitar descargas inapropiadas. Ablación reduce recurrencias, sobre todo en cardiopatía isquémica.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Dominio de la RCP y el desfibrilador, cuidados y educación del portador de DAI (incluido impacto psicosocial de las descargas), vigilancia de iones y fármacos proarrítmicos, apoyo a familias en causas hereditarias.</p>"
      }
    ]
  },
  {
    "id": "codigo-ictus",
    "cat": "ictus",
    "title": "Activación del Código Ictus",
    "source": "061 · Coordinación prehospitalaria",
    "tags": "ictus codigo ictus prehospitalario rankin ventana 6 horas cincinnati asimetria facial fuerza lenguaje glucemia mimic tac fibrolisis trombectomia",
    "summary": "Emergencia tiempo-dependiente. Fase prehospitalaria idealmente <60 min. Criterios de activación y cuidados.",
    "sec": [
      {
        "h": "Criterios de activación (todos)",
        "b": "<ul><li><b>Independencia previa:</b> Rankin basal ≤2.</li><li><b>Ventana:</b> inicio conocido <6 h (incluye ictus del despertar en ciertos protocolos).</li><li><b>Focalidad neurológica</b> objetiva y evidente.</li><li>Sin comorbilidad terminal.</li></ul>"
      },
      {
        "h": "Reconocimiento precoz",
        "b": "<ul><li><b>Asimetría facial:</b> desviación de la comisura al sonreír.</li><li><b>Pérdida de fuerza:</b> claudicación de un brazo elevado 10 s con palmas arriba.</li><li><b>Lenguaje:</b> habla incoherente o disartria.</li></ul>"
      },
      {
        "h": "Cuidados inmediatos y traslado",
        "b": "<ul><li><b>PA</b> < 185/110 si candidato a fibrólisis.</li><li><b>SatO2:</b> O2 si <94% o dificultad respiratoria.</li><li><b>Glucemia:</b> corregir hipoglucemia ya (principal <i>mimic</i> del ictus).</li><li>Cabecera a <b>30°</b> (salvo shock).</li><li>Dos vías en el brazo no parético; analítica en ambulancia para ir directo al TAC.</li><li><b>Dieta absoluta</b> por riesgo de disfagia y aspiración.</li></ul>"
      }
    ]
  },
  {
    "id": "pa-ictus",
    "cat": "ictus",
    "title": "Presión arterial en ictus agudo",
    "source": "ESO 2025/2026 · isquémico y HIC",
    "tags": "presion arterial ictus isquemico hemorragia intracerebral hic trombolisis rtpa trombectomia labetalol nicardipino clevidipino penumbra hematoma",
    "summary": "Objetivos de PA según reperfusión en isquémico, y control en hemorragia intracerebral. Evitar variabilidad.",
    "sec": [
      {
        "h": "Ictus isquémico",
        "b": "<ul><li><b>Candidato a trombólisis (rtPA):</b> <185/110 antes del bolo; <180/105 durante y después. Monitorizar cada 15 min las primeras 2 h.</li><li><b>Candidato a trombectomía:</b> <185/110 previo. Tras reperfusión, objetivos individualizados sin descensos bruscos (>20 mmHg empeora el pronóstico).</li><li><b>No candidato:</b> no bajar de rutina salvo HTA extrema >220/120 o daño de órgano. Si se trata, reducir ≤15% en 24 h (proteger la penumbra).</li></ul>"
      },
      {
        "h": "Hemorragia intracerebral (HIC)",
        "b": "<ul><li>En las primeras 6 h con PAS 150-220: objetivo <b>PAS 130-140</b> de forma rápida y mantenida.</li><li>No bajar de <120 PAS (riesgo de daño renal por hipoperfusión).</li><li>Fármacos IV de acción corta: <b>labetalol, nicardipino o clevidipino</b>.</li></ul>"
      },
      {
        "h": "Clave de implementación",
        "b": "<p>La variabilidad tensional extrema (picos y valles) es predictor independiente de mala evolución. Protocolos locales y monitorización continua en Unidad de Ictus.</p>"
      }
    ]
  },
  {
    "id": "post-rcp",
    "cat": "emer",
    "title": "Cuidados post-resucitación",
    "source": "ERC / ESICM 2025 · adultos",
    "tags": "post resucitacion rosc sppc parada cardiaca uci oxigenacion normocapnia ttm temperatura fiebre noradrenalina neuroprognostico eeg nse 72 horas",
    "summary": "Manejo del paciente tras ROSC: síndrome post-parada, oxigenación, hemodinámica, temperatura y neuropronóstico.",
    "sec": [
      {
        "h": "Síndrome post-parada (SPPC)",
        "b": "<ul><li><b>Daño cerebral:</b> edema, convulsiones, mioclonías. Principal causa de muerte tras parada extrahospitalaria.</li><li><b>Disfunción miocárdica:</b> aturdimiento, pico a 24 h, mejora en 48-72 h.</li><li><b>Respuesta isquemia-reperfusión:</b> similar a sepsis.</li><li>Patología causante no resuelta (SCA, TEP, metabólica).</li></ul>"
      },
      {
        "h": "Oxigenación y ventilación",
        "b": "<ul><li>Evitar hipoxia (<94%) e hiperoxia: <b>SatO2 94-98%</b> o PaO2 75-100 mmHg.</li><li><b>Normocapnia</b> PaCO2 35-45 mmHg con capnografía. Evitar hipocapnia (vasoconstricción cerebral).</li><li>Angiografía coronaria inmediata si IAMCEST o inestabilidad con sospecha coronaria.</li></ul>"
      },
      {
        "h": "Hemodinámica y temperatura",
        "b": "<ul><li><b>PAM ≥65-70</b> mmHg. Noradrenalina de 1ª elección; dobutamina si disfunción/shock.</li><li><b>TTM:</b> prevenir activamente la fiebre (≥37,8°C) mínimo 72 h en coma. Hipotermia 32-36°C en escenarios específicos.</li></ul>"
      },
      {
        "h": "Convulsiones y neuropronóstico",
        "b": "<ul><li>EEG si movimientos anómalos. Tratar crisis: levetiracetam, valproato; propofol/midazolam si refractario.</li><li><b>Regla de oro: nunca pronosticar antes de 72 h</b> post-ROSC.</li><li>Pronóstico <b>multimodal:</b> examen clínico + SSEP/EEG + NSE + neuroimagen.</li></ul>"
      }
    ]
  },
  {
    "id": "svb",
    "cat": "emer",
    "title": "Soporte Vital Básico y RCP",
    "source": "061 Andalucía · Primeros auxilios",
    "tags": "svb rcp pas proteger alertar socorrer compresiones ventilaciones 30:2 desa dea ovace heimlich hemorragia torniquete quemadura convulsion pls 112",
    "summary": "Sistema PAS, algoritmo de SVB adulto, OVACE, control hemorrágico y emergencias comunes.",
    "sec": [
      {
        "h": "Sistema PAS",
        "b": "<ul><li><b>Proteger:</b> asegurar el entorno (víctima, reanimador, terceros).</li><li><b>Alertar:</b> 112 / 061 con localización, tipo de siniestro y nº de afectados.</li><li><b>Socorrer:</b> evaluación primaria y maniobras según gravedad.</li></ul>"
      },
      {
        "h": "Algoritmo SVB adulto",
        "b": "<ul><li>Evaluar consciencia: agitar hombros, preguntar.</li><li>Si no responde: decúbito supino, abrir vía aérea (frente-mentón).</li><li>Ver-Oír-Sentir ≤10 s. El <b>gasping</b> es signo de parada.</li><li>Respira normal → <b>PLS</b> y revisar cada 2 min. No respira → <b>RCP</b> y pedir DESA.</li></ul>"
      },
      {
        "h": "Compresiones y ventilaciones",
        "b": "<ul><li>Talón de la mano en mitad inferior del esternón, brazos rectos.</li><li>Deprimir <b>5-6 cm</b>, frecuencia <b>100-120/min</b>, descompresión completa.</li><li>Ciclo <b>30:2</b>. Sin entrenamiento o sin barrera: compresiones continuas.</li><li><b>DESA:</b> parche bajo clavícula derecha y axilar media izquierda. Nadie toca durante análisis y descarga.</li></ul>"
      },
      {
        "h": "OVACE",
        "b": "<ul><li><b>Obstrucción ligera</b> (tose, habla): animar a toser, no interferir.</li><li><b>Grave</b> (tos ineficaz, cianosis): 5 golpes interescapulares + 5 compresiones abdominales (Heimlich).</li><li>Si pierde consciencia: al suelo, 112 e iniciar RCP 30:2.</li></ul>"
      },
      {
        "h": "Emergencias comunes",
        "b": "<ul><li><b>Hemorragia:</b> presión directa ≥10 min; no retirar apósito empapado. Torniquete solo en exanguinante, anotar la hora.</li><li><b>Quemadura:</b> agua templada 15-20 °C, 15-20 min. No romper ampollas ni remedios caseros.</li><li><b>Convulsión:</b> proteger cabeza, cronometrar, PLS al ceder. No sujetar ni meter objetos en la boca.</li><li><b>Síncope:</b> tumbar y elevar piernas 45°.</li></ul>"
      }
    ]
  },
  {
    "id": "paue",
    "cat": "emer",
    "title": "Manual de Protocolos Asistenciales (PAUE)",
    "source": "Plan Andaluz de Urgencias y Emergencias",
    "tags": "protocolos urgencias emergencias paue respiratorio neurologico cardiovascular trauma metabolico intoxicaciones pediatria triaje shock politraumatizado",
    "summary": "Mapa de contenidos del manual de urgencias y emergencias por áreas clínicas. Índice de trabajo.",
    "sec": [
      {
        "h": "Qué es",
        "b": "<p>Manual de protocolos asistenciales del SSPA: cómo actuar ante urgencias y emergencias frecuentes, adulto y pediatría, extra e intrahospitalario. Respuesta homogénea con criterios comunes de valoración, tratamiento y traslado. Esta ficha es un <b>mapa por áreas</b>, no el detalle de cada protocolo.</p>"
      },
      {
        "h": "Áreas clínicas",
        "b": "<ul><li><b>Respiratorias:</b> crisis asmática, agudización EPOC, bronquiolitis, disnea.</li><li><b>Neurológicas:</b> coma, cefaleas, ictus, crisis convulsivas y estatus.</li><li><b>Cardiovasculares:</b> dolor torácico, SCA, arritmias, crisis HTA, IC, síncope.</li><li><b>Trauma:</b> politraumatizado, TCE, quemados, shock, soporte vital.</li><li><b>Metabólicas:</b> hipo e hiperglucemia.</li></ul>"
      },
      {
        "h": "Otras áreas",
        "b": "<ul><li><b>Intoxicaciones:</b> fármacos, drogas, cáusticos, organofosforados, metanol, CO, setas.</li><li><b>Pediatría:</b> bronquiolitis, coma, crisis convulsiva infantil, cólico del lactante.</li><li><b>Transversales:</b> dolor abdominal, hemorragia digestiva, agitación, sedoanalgesia, triaje.</li></ul>"
      }
    ]
  },
  {
    "id": "bat",
    "cat": "esp",
    "title": "Test de activación de basófilos (BAT)",
    "source": "EAACI 2025 · Posicionamiento",
    "tags": "bat basofilos alergia oncologia ige citometria hipersensibilidad alergooncologia desensibilizacion biomarcador estandarizacion",
    "summary": "Prueba funcional ex vivo que mide activación de basófilos. Puente entre alergología y oncología.",
    "sec": [
      {
        "h": "Qué es",
        "b": "<p>Prueba funcional en sangre del paciente: se exponen los basófilos al alérgeno o fármaco y, por citometría de flujo, se mide su activación. Reproduce en el tubo lo que ocurriría en el paciente, sin exponerlo a una reacción real. Lectura funcional del mecanismo mediado por IgE.</p>"
      },
      {
        "h": "Aplicaciones en alergología",
        "b": "<ul><li>Hipersensibilidad IgE a alimentos, venenos de himenópteros y fármacos.</li><li>Aclarar casos con prick o IgE específica no concluyentes.</li><li>Estimar umbral de reactividad y monitorizar la inducción de tolerancia.</li></ul>"
      },
      {
        "h": "Novedad: AlergoOncología",
        "b": "<ul><li>Hipersensibilidad a biológicos y quimioterapia.</li><li>Monitorizar tolerancia en desensibilización para mantener tratamiento de 1ª línea.</li><li>Apoyo a terapias antitumorales basadas en IgE; biomarcador de riesgo.</li></ul>"
      },
      {
        "h": "Fortalezas y reto",
        "b": "<p>A favor: funcional, seguro (ex vivo), útil cuando otras pruebas fallan. <b>Cuello de botella: la estandarización</b> entre laboratorios (marcadores, controles, puntos de corte). Necesita sangre fresca y existen pacientes \\\"no liberadores\\\".</p>"
      }
    ]
  },
  {
    "id": "diabetes-tec",
    "cat": "esp",
    "title": "Individualizar la tecnología en diabetes",
    "source": "ADA-EASD 2026 · Posicionamiento",
    "tags": "diabetes tecnologia mcg monitorizacion continua glucosa bomba insulina pluma inteligente aid lazo cerrado brecha digital equidad tiempo en rango",
    "summary": "No hay enfoque único: adaptar MCG, bombas y sistemas AID a cada persona y evitar desigualdades.",
    "sec": [
      {
        "h": "Tecnologías disponibles",
        "b": "<ul><li><b>MCG:</b> mide glucosa intersticial, a tiempo real o flash. Mejora el tiempo en rango.</li><li><b>Bombas:</b> infusión continua que sustituye inyecciones.</li><li><b>Plumas inteligentes:</b> registran dosis y horarios.</li><li><b>Sistemas AID:</b> MCG + bomba + algoritmo; hoy de lazo cerrado híbrido (aún cuentan carbohidratos).</li></ul>"
      },
      {
        "h": "La idea clave: individualizar",
        "b": "<p>El equipo necesita conocer deseos, capacidades y preferencias de cada paciente, su objetivo de control y su estilo de vida. Forzar una solución estándar lleva al abandono.</p>"
      },
      {
        "h": "Brecha digital y equidad",
        "b": "<p>El acceso no es uniforme ni está cubierto en todas partes, incluso en sistemas públicos. Pesan los determinantes sociales, la alfabetización digital y el idioma de los materiales.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Educar y acompañar en MCG, bombas y AID; valorar capacidades y preferencias; detectar y ayudar a salvar barreras de acceso; trabajar por la equidad.</p>"
      }
    ]
  },
  {
    "id": "farmaco-insulina",
    "cat": "esp",
    "title": "Insulina y fármacos endocrinos",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "insulina rapida ultrarrapida lenta basal bolo hiperglucemia hipoglucemia glucemia corticoide tiroides levotiroxina antitiroideo pauta correctora subcutanea unidades alto riesgo glucagon cetoacidosis rotacion zonas",
    "summary": "Tipos de insulina, pautas basal-bolo, manejo de la hipo e hiperglucemia y otros fármacos endocrinos. Alto riesgo.",
    "sec": [
      {
        "h": "Tipos de insulina",
        "b": "<p>Las ultrarrápidas y rápidas controlan la glucemia tras las comidas y permiten correcciones. Las intermedias y las basales lentas dan la cobertura de fondo. La pauta basal-bolo imita la secreción fisiológica.</p>"
      },
      {
        "h": "Seguridad: fármaco de alto riesgo",
        "b": "<ul><li>Nunca abreviar la palabra unidades con la letra U.</li><li>Usar siempre jeringa o pluma específica de insulina.</li><li>Doble chequeo.</li><li>Conservación correcta y rotación de las zonas de punción subcutánea.</li></ul>"
      },
      {
        "h": "Hipoglucemia",
        "b": "<p>Es el riesgo más temido. Si el paciente está consciente, dar 15 gramos de hidratos de absorción rápida y reevaluar a los 15 minutos. Si está inconsciente, glucosa intravenosa o glucagón. Buscar la causa, como saltarse una comida, la dosis o el ejercicio.</p>"
      },
      {
        "h": "Hiperglucemia e ingreso",
        "b": "<p>Aplicar la pauta correctora según protocolo y vigilar especialmente al paciente en tratamiento con corticoides, que elevan la glucemia. La cetoacidosis y el estado hiperosmolar son emergencias que se manejan aparte.</p>"
      },
      {
        "h": "Otros fármacos endocrinos y enfoque enfermero",
        "b": "<p>La levotiroxina se toma en ayunas y separada de otros fármacos; los antitiroideos y los corticoides no se suspenden de forma brusca. El enfermero coordina la insulina con las comidas, monitoriza las glucemias, previene y trata la hipoglucemia y educa en la técnica y el autocontrol.</p>"
      }
    ]
  },
  {
    "id": "gina",
    "cat": "resp",
    "title": "Asma de difícil control y asma grave",
    "source": "GINA 2026 · Adolescentes y adultos",
    "tags": "asma biologico corticoide inhalado omalizumab dupilumab mepolizumab tezepelumab eosinofilos feno tipo2 mart saba laba",
    "summary": "Distinguir asma no controlada, difícil de tratar y grave. Ruta de 10 etapas y biológicos según fenotipo tipo 2.",
    "sec": [
      {
        "h": "Tres definiciones que no son lo mismo",
        "b": "<ul><li><b>No controlada:</b> mal control de síntomas y/o exacerbaciones frecuentes.</li><li><b>Difícil de tratar:</b> sigue descontrolada pese a dosis media-alta de corticoide inhalado + 2º controlador. A menudo el problema es técnica, adherencia, tabaco o diagnóstico erróneo.</li><li><b>Grave:</b> subgrupo del anterior, persiste descontrolada pese a tratamiento óptimo. Etiqueta retrospectiva. Solo ~3,7% de los asmáticos.</li></ul>"
      },
      {
        "h": "Antes de etiquetar de grave (bloque verde, etapas 1-4)",
        "b": "<ul><li>Confirmar que <b>de verdad es asma</b> (12-50% de supuestos casos graves no lo son).</li><li>Revisar <b>técnica inhalatoria</b> (mal hasta en 80%) y <b>adherencia</b> (hasta 75%).</li><li>Tratar comorbilidades: obesidad, RGE, rinosinusitis, apnea, obstrucción laríngea.</li><li>Optimizar: educación, plan escrito, terapia MART, vacunas. Reevaluar a los 3-6 meses.</li></ul>"
      },
      {
        "h": "Fenotipo tipo 2 (etapas 5-8, especialista)",
        "b": "<p>Se considera inflamación tipo 2 con corticoide a dosis alta u oral si:</p><ul><li>Eosinófilos en sangre ≥150/µl</li><li>FeNO ≥20 ppb</li><li>Eosinófilos en esputo ≥2%</li><li>Asma claramente alérgica</li></ul><p>Repetir hasta 3 veces antes de descartarlo; el corticoide oral los suprime.</p>"
      },
      {
        "h": "Biológicos dirigidos a tipo 2",
        "b": "<ul><li><b>Anti-IgE</b> (omalizumab): asma alérgica grave.</li><li><b>Anti-IL5/IL5R</b> (mepolizumab, benralizumab, reslizumab): eosinofílica.</li><li><b>Anti-IL4Rα</b> (dupilumab): tipo 2, útil en dependientes de corticoide oral.</li><li><b>Anti-TSLP</b> (tezepelumab): útil incluso sin marcadores tipo 2 elevados.</li></ul><p>Probar ≥4 meses y evaluar respuesta antes de cambiar.</p>"
      },
      {
        "h": "Oxigenoterapia y aviso sobre el salbutamol (GINA 2026)",
        "b": "<p><b>Iniciar oxígeno solo si SpO₂ &lt; 92 %.</b> <i>«supplemental oxygen not recommended unless saturation is below 92%»</i>.<br><b>Dos poblaciones con reglas distintas — no unificar en una sola cifra:</b><ul><li><b>Adultos, adolescentes y niños de 6 a 11 años:</b> objetivo con O₂ <b>92-95 %</b>, sin superar el 95 % — <i>«the upper limit of the oxygen saturation target for adults, adolescents and children 6–11 years is 95%»</i>.</li><li><b>Niños de 5 años o menos:</b> objetivo <b>≥ 92 %</b> — <i>«the target saturation if oxygen is given is ≥92%»</i>.</li></ul> Una SpO₂ &lt; 92 % en aire ambiente indica presentación grave.</p><p><b>Precaución con el salbutamol.</b> GINA 2026 recomienda dosis más conservadoras: el exceso de SABA puede provocar acidosis láctica, cuya hiperventilación compensatoria se confunde con empeoramiento del asma y lleva a seguir administrando broncodilatador. Ante un paciente que no mejora pese a dosis repetidas, considerar esta posibilidad.</p><p><b>Si coexisten anafilaxia y asma:</b> adrenalina IM antes que el broncodilatador.</p>"
      },
      {
        "h": "Para llevar a la cabecera",
        "b": "<ul><li>Minimizar el corticoide oral es prioridad máxima.</li><li><b>Nunca retirar del todo el corticoide inhalado.</b></li><li>El biológico se añade, no sustituye.</li></ul>"
      }
    ]
  },
  {
    "id": "farmaco-anticoag",
    "cat": "cardio",
    "title": "Anticoagulación y tromboprofilaxis",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "anticoagulacion heparina hbpm enoxaparina fondaparinux acod apixaban rivaroxaban dabigatran edoxaban warfarina acenocumarol sintrom inr tromboprofilaxis padua hemorragia reversion idarucizumab andexanet vitamina k protamina anti-xa",
    "summary": "Heparinas, antivitamina K y ACOD: indicaciones, control, profilaxis del paciente ingresado y manejo del sangrado.",
    "sec": [
      {
        "h": "Grupos de anticoagulantes",
        "b": "<ul><li><b>Heparina no fraccionada:</b> control con TTPa, antídoto protamina.</li><li><b>HBPM</b> (enoxaparina): ajuste por peso y función renal; en casos seleccionados se controla con anti-Xa.</li><li><b>Fondaparinux:</b> inhibidor del factor Xa subcutáneo.</li><li><b>Antivitamina K</b> (acenocumarol, warfarina): control con INR, muchas interacciones, antídoto vitamina K.</li><li><b>ACOD</b> (apixabán, rivaroxabán, edoxabán, dabigatrán): dosis fija, sin control rutinario.</li></ul>"
      },
      {
        "h": "Tromboprofilaxis del paciente ingresado",
        "b": "<p>Valorar el riesgo trombótico (escala de Padua) frente al hemorrágico. Si procede, HBPM a dosis profiláctica. Cuando el fármaco esté contraindicado por sangrado, usar medidas mecánicas como medias de compresión o compresión neumática intermitente.</p>"
      },
      {
        "h": "ACOD: ventajas y cuidados",
        "b": "<ul><li>Dosis fija y menos interacciones que la antivitamina K.</li><li>Ajustar según función renal, edad y peso.</li><li>Vida media corta: la adherencia es crítica, porque saltarse una dosis deja al paciente sin protección.</li></ul>"
      },
      {
        "h": "Manejo del sangrado y reversión",
        "b": "<ul><li>Medidas generales: presión, soporte hemodinámico, suspender el fármaco.</li><li>Antivitamina K: vitamina K y complejo protrombínico.</li><li>Dabigatrán: idarucizumab.</li><li>Anti-Xa (apixabán, rivaroxabán): andexanet alfa o complejo protrombínico.</li><li>Heparina: protamina.</li></ul>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Educación en adherencia y en signos de alarma de sangrado, vigilancia de hematomas y exteriorizaciones, no asociar antiinflamatorios ni antiagregantes sin indicación, y cuidado de los puntos de inyección de la heparina de bajo peso.</p>"
      }
    ]
  },
  {
    "id": "farmaco-htacrisis",
    "cat": "cardio",
    "title": "Antihipertensivos y crisis hipertensiva",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "hipertension crisis hipertensiva urgencia emergencia labetalol urapidilo nicardipino clevidipino nitroglicerina nitroprusiato captopril amlodipino organo diana encefalopatia disección eclampsia edema agudo pulmon pam",
    "summary": "Diferenciar urgencia de emergencia hipertensiva. Fármacos intravenosos de acción corta y objetivos de descenso seguro.",
    "sec": [
      {
        "h": "Urgencia frente a emergencia",
        "b": "<ul><li><b>Urgencia hipertensiva:</b> presión muy alta SIN daño agudo de órgano diana. Se baja en horas con tratamiento oral.</li><li><b>Emergencia hipertensiva:</b> presión alta CON daño agudo (encefalopatía, síndrome coronario, edema agudo de pulmón, disección aórtica, eclampsia, ictus). Requiere fármaco intravenoso y monitorización.</li></ul>"
      },
      {
        "h": "Principio clave del descenso",
        "b": "<p>En la emergencia NO se normaliza la presión de golpe. Como norma general, reducir la presión arterial media en torno a un 10 a 20 por ciento la primera hora y después de forma gradual. Excepciones: la disección aórtica exige bajar rápido y a cifras bajas, y el ictus tiene objetivos propios.</p>"
      },
      {
        "h": "Fármacos intravenosos",
        "b": "<ul><li>Labetalol.</li><li>Urapidilo.</li><li>Nicardipino o clevidipino.</li><li>Nitroglicerina, útil en edema agudo de pulmón y síndrome coronario.</li><li>Nitroprusiato en casos seleccionados y con vigilancia estrecha.</li></ul>"
      },
      {
        "h": "Urgencia por vía oral",
        "b": "<p>Reposo, ambiente tranquilo y reevaluación. Fármacos como captopril, labetalol o amlodipino. Evitar el nifedipino sublingual por el riesgo de descensos bruscos e impredecibles.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Monitorización continua de la presión, manejo de la bomba de perfusión, vigilar la aparición de hipotensión o de signos de daño de órgano, y descartar causas tratables como dolor, retención urinaria, ansiedad o mala adherencia.</p>"
      }
    ]
  },
  {
    "id": "farmaco-anafilaxia",
    "cat": "emer",
    "title": "Anafilaxia y reacciones alérgicas graves",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "anafilaxia alergia adrenalina epinefrina intramuscular muslo reaccion hipersensibilidad shock antihistaminico corticoide broncoespasmo angioedema autoinyector bifasica glucagon cristaloides",
    "summary": "La adrenalina intramuscular es el tratamiento de primera línea. Reconocimiento rápido, dosis y vigilancia de reacción bifásica.",
    "sec": [
      {
        "h": "Reconocer la anafilaxia",
        "b": "<p>Inicio súbito con afectación de piel o mucosas más, al menos, uno de estos: compromiso respiratorio, descenso de la presión arterial o síntomas digestivos graves, tras la exposición a un alérgeno probable. También se considera ante hipotensión brusca tras un alérgeno conocido.</p>"
      },
      {
        "h": "Primera línea: adrenalina intramuscular",
        "b": "<ul><li>No demorarla. En el adulto, 0,5 miligramos por vía intramuscular en la cara anterolateral del muslo (medio mililitro de la concentración de 1 miligramo por mililitro).</li><li>Se puede repetir cada 5 a 15 minutos si no hay mejoría.</li><li>En el niño, 0,01 miligramos por kilo, con un máximo de 0,3 a 0,5 miligramos.</li></ul>"
      },
      {
        "h": "Medidas de soporte",
        "b": "<ul><li>Retirar el desencadenante si es posible.</li><li>Tumbar con las piernas elevadas; no incorporar bruscamente al paciente.</li><li>Oxígeno a alto flujo.</li><li>Vía venosa y fluidos cristaloides.</li><li>Monitorización continua.</li></ul>"
      },
      {
        "h": "Segunda línea (no sustituyen a la adrenalina)",
        "b": "<ul><li>Broncodilatadores si hay broncoespasmo.</li><li>Antihistamínicos para la urticaria y el prurito.</li><li>Corticoides, de efecto más tardío.</li><li>Glucagón si el paciente toma betabloqueantes y no responde a la adrenalina.</li></ul>"
      },
      {
        "h": "Tras estabilizar y enfoque enfermero",
        "b": "<p>Observación prolongada por el riesgo de reacción bifásica horas después. Localizar la adrenalina intramuscular de inmediato y conocer la dosis es la clave del cuidado enfermero. Prescripción de autoinyector al alta y derivación a alergología.</p>"
      }
    ]
  },
  {
    "id": "farmaco-sedoanalgesia",
    "cat": "emer",
    "title": "Sedación y analgesia",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "sedacion analgesia dolor escala eva evn opioides morfina fentanilo oxicodona midazolam propofol ketamina escalera analgesica oms paracetamol aines naloxona flumazenilo rass ramsay capnografia multimodal",
    "summary": "Valoración del dolor, escalera analgésica, fármacos de sedoanalgesia y antídotos. La vigilancia respiratoria es prioritaria.",
    "sec": [
      {
        "h": "Valorar el dolor",
        "b": "<p>Usar escalas validadas, numéricas o visuales en quien comunica, y escalas conductuales en pacientes no comunicativos. El dolor es lo que el paciente dice que es. Reevaluar siempre tras cada intervención.</p>"
      },
      {
        "h": "Escalera analgésica",
        "b": "<p>Adaptada de la Organización Mundial de la Salud: no opioides como paracetamol y antiinflamatorios, luego opioides débiles y después opioides potentes como morfina, fentanilo u oxicodona, junto a coadyuvantes. Hoy se aplica de forma flexible según la intensidad del dolor.</p>"
      },
      {
        "h": "Sedación para procedimientos",
        "b": "<ul><li>Midazolam para ansiólisis.</li><li>Propofol para sedación profunda, solo con personal entrenado.</li><li>Ketamina como analgesia disociativa.</li><li>Monitorizar el nivel de sedación con escalas como Ramsay o RASS, y la saturación con capnografía.</li></ul>"
      },
      {
        "h": "Vigilancia y antídotos",
        "b": "<ul><li>La depresión respiratoria es el riesgo principal.</li><li>Naloxona revierte los opioides.</li><li>Flumazenilo revierte las benzodiacepinas, con cautela.</li><li>Tener preparado el material de vía aérea.</li></ul>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Titular el fármaco al efecto, monitorizar la respiración y el nivel de conciencia, prevenir y registrar efectos como náuseas, estreñimiento o prurito, y favorecer un plan de analgesia multimodal.</p>"
      }
    ]
  },
  {
    "id": "farmaco-altoriesgo",
    "cat": "emer",
    "title": "Medicamentos de alto riesgo y opioides",
    "source": "Farmacología · Seguridad (ISMP)",
    "tags": "alto riesgo opioides ismp doble chequeo verificacion electrolitos potasio cloruro potasico insulina heparina anticoagulante citostaticos sedantes bloqueante neuromuscular error medicacion lasa naloxona almacenamiento",
    "summary": "Medicamentos de alto riesgo (ISMP): doble verificación, opioides, electrolitos concentrados y prevención de errores.",
    "sec": [
      {
        "h": "Qué son",
        "b": "<p>Fármacos con alta probabilidad de causar daño grave si se produce un error. La lista del ISMP incluye insulina, opioides, anticoagulantes y heparinas, electrolitos concentrados como el cloruro potásico y el suero salino hipertónico, citostáticos, sedantes intravenosos y bloqueantes neuromusculares.</p>"
      },
      {
        "h": "Medidas de seguridad",
        "b": "<ul><li>Doble chequeo independiente por dos profesionales.</li><li>Almacenamiento diferenciado y etiquetado.</li><li>Alertas para fármacos de aspecto o nombre parecido.</li><li>Protocolos de dilución estandarizados.</li><li>Evitar electrolitos concentrados fuera de áreas críticas.</li></ul>"
      },
      {
        "h": "Opioides",
        "b": "<p>Prescripción y registro estrictos como estupefacientes, conciliar la dosis, vigilar el nivel de sedación y la respiración, y tener la naloxona accesible.</p>"
      },
      {
        "h": "Electrolitos concentrados",
        "b": "<p>Nunca administrar cloruro potásico en bolo intravenoso directo: siempre diluido y en perfusión controlada. El suero salino hipertónico se administra por la vía y al ritmo pautados.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Aplicar los correctos de la administración, realizar la doble verificación, no interrumpir durante la preparación y notificar los incidentes sin buscar culpables, para aprender y mejorar la seguridad.</p>"
      }
    ]
  },
  {
    "id": "farmaco-iv",
    "cat": "esp",
    "title": "Administración segura de medicación intravenosa",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "intravenoso iv via perifusion bolo dilucion disolvente compatibilidad incompatibilidad extravasacion flebitis bomba ritmo correctos cvc picc purga lavado vesicante",
    "summary": "Principios de administración intravenosa segura: comprobaciones, dilución, compatibilidad y complicaciones de la vía.",
    "sec": [
      {
        "h": "Antes de administrar",
        "b": "<p>Aplicar los correctos: paciente, fármaco, dosis, vía y hora, además del registro, la caducidad, la indicación, la respuesta y la educación. Comprobar siempre las alergias y la prescripción.</p>"
      },
      {
        "h": "Preparación",
        "b": "<ul><li>Técnica aséptica.</li><li>Disolvente y dilución correctos.</li><li>Respetar la estabilidad y el tiempo de infusión.</li><li>Comprobar la compatibilidad entre fármacos y con el suero, sobre todo en administración conjunta en Y.</li></ul>"
      },
      {
        "h": "Elección de la vía",
        "b": "<p>La vía periférica exige vigilar la permeabilidad. La vía central o el PICC se reservan para fármacos irritantes, vesicantes o nutrición parenteral. Purgar la luz y lavar antes y después de administrar.</p>"
      },
      {
        "h": "Velocidad de administración",
        "b": "<p>Diferenciar el bolo lento de la perfusión. Usar bomba en fármacos de riesgo. Un ritmo demasiado rápido puede provocar reacciones, como ocurre con la vancomicina.</p>"
      },
      {
        "h": "Complicaciones",
        "b": "<ul><li>Flebitis: valorar con escala.</li><li>Extravasación: detener la infusión y seguir el protocolo según el fármaco.</li><li>Infección del catéter.</li><li>Sobrecarga de volumen.</li><li>Vigilar siempre el punto de punción.</li></ul>"
      }
    ]
  },
  {
    "id": "farmaco-antibiot",
    "cat": "esp",
    "title": "Antibioterapia y uso prudente",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "antibioticos betalactamicos penicilina cefalosporina carbapenem vancomicina glucopeptido aminoglucosido quinolona macrolido resistencia stewardship espectro hemocultivos desescalada alergia infusion clostridium nefrotoxico ototoxico qt",
    "summary": "Familias de antibióticos, principios de uso prudente (stewardship) y cuidados en su administración.",
    "sec": [
      {
        "h": "Familias principales",
        "b": "<ul><li>Betalactámicos: penicilinas, cefalosporinas y carbapenems.</li><li>Glucopéptidos como la vancomicina.</li><li>Aminoglucósidos.</li><li>Quinolonas, macrólidos, lincosamidas y oxazolidinonas.</li></ul><p>Se diferencian en bactericidas y bacteriostáticos.</p>"
      },
      {
        "h": "Uso prudente",
        "b": "<ul><li>Tomar los cultivos ANTES de la primera dosis.</li><li>Tratamiento empírico según el foco y el mapa de resistencias local.</li><li>Desescalar cuando llega el antibiograma.</li><li>Ajustar la dosis al peso y a la función renal.</li><li>La duración, la más corta que sea eficaz.</li></ul>"
      },
      {
        "h": "Administración",
        "b": "<p>Respetar los tiempos de infusión, como la vancomicina lenta para evitar reacción por velocidad. Separar fármacos incompatibles, proteger de la luz los que lo requieran y vigilar la vía.</p>"
      },
      {
        "h": "Seguridad",
        "b": "<ul><li>Confirmar si la alergia es real y distinguirla de una intolerancia.</li><li>Vigilar la toxicidad renal y auditiva de vancomicina y aminoglucósidos con niveles.</li><li>Atención a la diarrea por Clostridioides difficile.</li><li>Algunos prolongan el intervalo QT.</li></ul>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Administración puntual sin saltarse los intervalos, cultivos previos, vigilancia de la toxicidad y de las reacciones, y educación en completar siempre la pauta.</p>"
      }
    ]
  },
  {
    "id": "farmaco-fcinetica",
    "cat": "esp",
    "title": "Farmacocinética y ajuste de dosis",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "farmacocinetica absorcion distribucion metabolismo eliminacion citocromo p450 semivida renal hepatico filtrado glomerular aclaramiento niveles vancomicina digoxina litio anciano pediatria obesidad embarazo margen estrecho valle pico",
    "summary": "Cómo el organismo maneja el fármaco y por qué hay que ajustar la dosis según riñón, hígado, edad y peso.",
    "sec": [
      {
        "h": "El recorrido del fármaco",
        "b": "<p>Absorción, distribución, metabolismo (sobre todo hepático, por el citocromo P450) y eliminación (principalmente renal). La semivida marca el intervalo entre dosis y el tiempo hasta alcanzar el estado estable.</p>"
      },
      {
        "h": "Insuficiencia renal",
        "b": "<p>Muchos fármacos o sus metabolitos se acumulan, así que hay que ajustar la dosis o el intervalo según el filtrado glomerular. Afecta, por ejemplo, a heparinas de bajo peso, varios antibióticos y la digoxina. Vigilar los signos de toxicidad.</p>"
      },
      {
        "h": "Insuficiencia hepática",
        "b": "<p>Afecta a los fármacos de metabolismo hepático y a la síntesis de proteínas, lo que aumenta la fracción libre y activa. Precaución especial con sedantes y anticoagulantes.</p>"
      },
      {
        "h": "Poblaciones especiales",
        "b": "<ul><li>Ancianos: menor aclaramiento y polifarmacia.</li><li>Pediatría: dosis por peso o superficie corporal.</li><li>Obesidad y embarazo modifican la distribución.</li></ul>"
      },
      {
        "h": "Monitorización de niveles",
        "b": "<p>Los fármacos de margen terapéutico estrecho (vancomicina, digoxina, aminoglucósidos, litio, antiepilépticos) requieren niveles y respetar los tiempos de extracción, valle o pico. El enfermero debe conocer la función renal y hepática del paciente y respetar esos horarios de extracción.</p>"
      }
    ]
  },
  {
    "id": "farmaco-interacciones",
    "cat": "esp",
    "title": "Interacciones medicamentosas",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "interacciones citocromo p450 inductor inhibidor sinergia antagonismo qt serotoninergico anticoagulante aine antiagregante potasio hiperpotasemia pomelo vitamina k hierba san juan polifarmacia stopp start conciliacion",
    "summary": "Tipos de interacción, mecanismos, combinaciones peligrosas frecuentes y conciliación de la medicación.",
    "sec": [
      {
        "h": "Tipos de interacción",
        "b": "<p>Farmacocinéticas, que cambian los niveles del fármaco mediante inductores o inhibidores del citocromo P450, y farmacodinámicas, que suman o se oponen en el efecto. También hay interacciones con alimentos, como el pomelo o la vitamina K, y con la fitoterapia, como la hierba de San Juan.</p>"
      },
      {
        "h": "Combinaciones de riesgo frecuentes",
        "b": "<ul><li>Anticoagulante con antiinflamatorio o antiagregante: más sangrado.</li><li>Varios fármacos que prolongan el QT a la vez.</li><li>Varios serotoninérgicos: síndrome serotoninérgico.</li><li>Inhibidores del eje renina con ahorradores de potasio: hiperpotasemia.</li><li>Depresores del sistema nervioso central sumados.</li></ul>"
      },
      {
        "h": "Polifarmacia",
        "b": "<p>Cuantos más fármacos, mayor riesgo, sobre todo en el anciano. Ayuda revisar el tratamiento con herramientas como los criterios STOPP y START.</p>"
      },
      {
        "h": "Conciliación de la medicación",
        "b": "<p>Comparar la medicación habitual del paciente con la pautada en el ingreso, los traslados y el alta, para evitar duplicidades, omisiones e interacciones.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Revisar el conjunto del tratamiento, consultar posibles interacciones antes de añadir un fármaco, vigilar signos como sangrado, sedación o arritmia, y educar al paciente al alta.</p>"
      }
    ]
  },
  {
    "id": "farmaco-ram",
    "cat": "esp",
    "title": "Farmacovigilancia y reacciones adversas",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "farmacovigilancia ram reaccion adversa tarjeta amarilla notificacion triangulo negro alergia idiosincrasica dosis dependiente naranjo causalidad tipo a tipo b efecto secundario seguridad",
    "summary": "Detectar, manejar y notificar reacciones adversas. La notificación mejora la seguridad de todos los pacientes.",
    "sec": [
      {
        "h": "Qué es una reacción adversa",
        "b": "<p>Una respuesta nociva y no buscada a un fármaco usado a dosis habituales. Las de tipo A son dosis-dependientes y predecibles, como la hemorragia por un anticoagulante. Las de tipo B son idiosincrásicas o alérgicas y no predecibles.</p>"
      },
      {
        "h": "Detección",
        "b": "<p>Sospechar ante cualquier síntoma nuevo tras iniciar o cambiar un fármaco. Valorar la relación temporal y la causalidad con algoritmos como el de Naranjo. Distinguir la alergia real del efecto esperado.</p>"
      },
      {
        "h": "Manejo",
        "b": "<p>Valorar suspender o ajustar el fármaco, tratar la reacción, registrarla en la historia y como alergia si procede, y evitar la reexposición.</p>"
      },
      {
        "h": "Notificación",
        "b": "<p>Comunicar la sospecha al sistema de farmacovigilancia mediante la tarjeta amarilla, incluso las reacciones leves o las de fármacos nuevos identificados con el triángulo negro. Conviene notificar aunque haya dudas.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>El enfermero suele ser quien primero detecta la reacción. Vigilancia activa, registro, notificación y educación del paciente en los signos de alarma.</p>"
      }
    ]
  },
  {
    "id": "farmaco-psico",
    "cat": "esp",
    "title": "Psicofármacos",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "psicofarmacos benzodiacepinas antidepresivos isrs irsn tricicliclos antipsicoticos neuroleptico litio estabilizador sindrome serotoninergico neuroleptico maligno extrapiramidal qt sedacion caidas dependencia agitacion contencion",
    "summary": "Grupos de psicofármacos, efectos a vigilar y cuadros graves como el serotoninérgico y el neuroléptico maligno.",
    "sec": [
      {
        "h": "Grupos principales",
        "b": "<ul><li>Benzodiacepinas: ansiólisis y sedación, con riesgo de dependencia y de depresión respiratoria.</li><li>Antidepresivos: los inhibidores de la recaptación de serotonina son de primera línea; también los duales y los tricíclicos.</li><li>Antipsicóticos típicos y atípicos.</li><li>Estabilizadores del ánimo: litio, valproato, lamotrigina.</li></ul>"
      },
      {
        "h": "Efectos a vigilar",
        "b": "<ul><li>Sedación y caídas, sobre todo en el anciano.</li><li>Efectos anticolinérgicos.</li><li>Síntomas extrapiramidales con los antipsicóticos.</li><li>Prolongación del QT.</li><li>Aumento de peso y alteraciones metabólicas con los atípicos.</li></ul>"
      },
      {
        "h": "Cuadros graves",
        "b": "<p>El síndrome serotoninérgico cursa con fiebre, agitación, hiperreflexia y clonus por exceso de serotonina. El síndrome neuroléptico maligno cursa con rigidez, fiebre y alteración de la conciencia. Ambos son emergencias.</p>"
      },
      {
        "h": "Litio y agitación",
        "b": "<p>El litio tiene margen estrecho: vigilar niveles, deshidratación, función renal e interacciones con antiinflamatorios y diuréticos, que elevan el litio. Ante la agitación, priorizar la contención verbal y un entorno seguro; la sedación farmacológica y la contención mecánica son el último recurso, siempre pautadas y vigiladas.</p>"
      },
      {
        "h": "Enfoque enfermero",
        "b": "<p>Reforzar la adherencia, recordando que el antidepresivo tarda semanas en hacer efecto, prevenir caídas, vigilar los efectos y los cuadros graves, no retirar bruscamente, y ofrecer apoyo y educación.</p>"
      }
    ]
  },
  {
    "id": "farmaco-antifungico",
    "cat": "esp",
    "title": "Antifúngicos y antiparasitarios",
    "source": "Farmacología · Apoyo de enfermería",
    "tags": "antifungico antimicotico fluconazol voriconazol azol anfotericina equinocandina caspofungina anidulafungina candida aspergillus antiparasitario antimalarico albendazol ivermectina metronidazol alcohol interacciones hepatico nefrotoxico potasio magnesio",
    "summary": "Familias de antifúngicos y antiparasitarios, sus indicaciones generales y los cuidados en su administración.",
    "sec": [
      {
        "h": "Antifúngicos",
        "b": "<ul><li>Azoles (fluconazol, voriconazol): muchas interacciones por el citocromo P450.</li><li>Equinocandinas (caspofungina, anidulafungina): buen perfil de seguridad.</li><li>Polienos (anfotericina B): nefrotoxicidad y reacciones a la infusión; se prefieren las formas lipídicas.</li></ul><p>La elección depende del hongo, como Candida o Aspergillus, y de la gravedad.</p>"
      },
      {
        "h": "Cuidados con la anfotericina",
        "b": "<p>Premedicación según protocolo, infusión lenta, vigilar fiebre y escalofríos, y controlar la función renal y los iones, sobre todo el potasio y el magnesio.</p>"
      },
      {
        "h": "Antiparasitarios",
        "b": "<p>Incluyen antimaláricos, antihelmínticos como el albendazol y la ivermectina, y antiprotozoarios como el metronidazol, con el que hay que evitar el alcohol. El uso depende del parásito y de la zona geográfica.</p>"
      },
      {
        "h": "Seguridad y enfoque enfermero",
        "b": "<p>Vigilar interacciones, en especial de los azoles con anticoagulantes, estatinas e inmunosupresores, así como la toxicidad hepática y renal. El enfermero cuida la administración correcta, con sus ritmos y premedicación, vigila la toxicidad y la infusión, educa en la adherencia y, con el metronidazol, recuerda evitar el alcohol.</p>"
      }
    ]
  },
  {
    "id": "extra-trauma",
    "cat": "extra",
    "title": "Trauma grave y politraumatizado",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "trauma politraumatizado tce traumatismo craneal medular columna abcde avdi sample hora de oro shock hipovolemico hemorragia inmovilizacion collarin glasgow",
    "summary": "Atención inicial al politraumatizado con la secuencia ABCDE, control de hemorragias, inmovilización y traslado dentro de la hora de oro.",
    "sec": [
      {
        "h": "Secuencia ABCDE",
        "b": "<ul><li><b>A</b> vía aérea con control cervical (collarín).</li><li><b>B</b> ventilación y oxígeno.</li><li><b>C</b> circulación y control de hemorragias, dos vías de grueso calibre.</li><li><b>D</b> déficit neurológico: AVDI o Glasgow y pupilas.</li><li><b>E</b> exposición evitando la hipotermia.</li></ul>"
      },
      {
        "h": "TCE",
        "b": "<ul><li>Vigilar nivel de conciencia, pupilas y focalidad.</li><li>Evitar hipotensión e hipoxia, que agravan la lesión.</li><li>Glasgow igual o menor de 8: valorar aislar la vía aérea.</li></ul>"
      },
      {
        "h": "Lesión medular",
        "b": "<ul><li>Sospecha en todo trauma de alta energía.</li><li>Inmovilización completa con collarín y tablero o colchón de vacío.</li><li>Movilización siempre en bloque.</li></ul>"
      },
      {
        "h": "Shock hipovolémico",
        "b": "<ul><li>Cristaloides en bolos de 250 ml reevaluando la respuesta.</li><li>Controlar el foco de sangrado y abrigar.</li><li>Clasificar la hemorragia por el porcentaje de pérdida estimada.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-fisicos",
    "cat": "extra",
    "title": "Quemaduras, hipotermia y agentes físicos",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "quemaduras parkland regla de los nueve hipotermia congelacion ahogamiento electrocucion arma de fuego mordeduras buceo recalentamiento superficie corporal quemada",
    "summary": "Manejo de quemaduras con la fórmula de Parkland, hipotermia, ahogamiento, electrocución y otras lesiones por agentes físicos.",
    "sec": [
      {
        "h": "Quemaduras",
        "b": "<ul><li>Retirar ropa y joyas, irrigar con suero fisiológico.</li><li>No romper ampollas ni aplicar remedios caseros.</li><li>Estimar la superficie con la regla de los nueves.</li><li>Reposición con Parkland: 4 ml × % superficie quemada × kg en 24 h, la mitad en las primeras 8 h.</li><li>Analgesia y prevención de la hipotermia.</li></ul>"
      },
      {
        "h": "Hipotermia",
        "b": "<ul><li>Retirar ropa húmeda y recalentar de forma gradual.</li><li>Manipular con suavidad por el riesgo de fibrilación ventricular.</li><li>En parada con hipotermia: RCP prolongada y desfibrilar; nadie está muerto hasta que está caliente y muerto.</li></ul>"
      },
      {
        "h": "Ahogamiento",
        "b": "<ul><li>La prioridad es la ventilación y oxigenación precoz.</li><li>Iniciar con 5 ventilaciones de rescate.</li><li>Vigilar el deterioro respiratorio que puede aparecer horas después.</li></ul>"
      },
      {
        "h": "Electrocución y arma de fuego",
        "b": "<ul><li>Asegurar primero la escena.</li><li>Valorar lesiones internas y arritmias.</li><li>En heridas por arma: control de la hemorragia y traslado urgente.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-dolortoracico",
    "cat": "extra",
    "title": "Dolor torácico y síndrome coronario agudo",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "dolor toracico sindrome coronario agudo iam scacest perfil isquemico nitroglicerina aas aspirina morfina clopidogrel heparina hbpm ecg betabloqueante",
    "summary": "Valoración del dolor torácico y manejo del perfil isquémico o síndrome coronario agudo en el medio extrahospitalario.",
    "sec": [
      {
        "h": "Valoración",
        "b": "<ul><li>ECG de 12 derivaciones precoz y constantes.</li><li>Oxígeno solo si hay hipoxia.</li><li>Reconocer el perfil isquémico: opresivo, irradiado y con cortejo vegetativo, frente a causas pleuríticas o mecánicas.</li></ul>"
      },
      {
        "h": "Tratamiento del SCA",
        "b": "<ul><li>AAS 160-325 mg masticado.</li><li>Nitroglicerina sublingual si no hay hipotensión.</li><li>Morfina 2-4 mg iv para el dolor.</li><li>Clopidogrel 300 mg según pauta y anticoagulación con HBPM.</li><li>Betabloqueante si no está contraindicado.</li></ul>"
      },
      {
        "h": "Alarma",
        "b": "<ul><li>Si hay elevación del ST, priorizar el traslado a hemodinámica.</li><li>Monitorización continua por el riesgo de arritmias.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-arritmias",
    "cat": "extra",
    "title": "Arritmias y crisis hipertensiva",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "arritmias taquicardia bradicardia adenosina amiodarona atropina cardioversion sincronizada marcapasos crisis hipertensiva urgencia emergencia urapidil labetalol maniobras vagales",
    "summary": "Manejo rápido de taquiarritmias, bradiarritmias y crisis hipertensivas fuera del hospital.",
    "sec": [
      {
        "h": "Taquiarritmias",
        "b": "<ul><li>Si hay inestabilidad (hipotensión, dolor, bajo nivel de conciencia): cardioversión sincronizada.</li><li>QRS estrecho estable: maniobras vagales y adenosina.</li><li>QRS ancho: amiodarona.</li></ul>"
      },
      {
        "h": "Bradiarritmias",
        "b": "<ul><li>Atropina si es sintomática.</li><li>Si no responde: marcapasos transcutáneo y traslado.</li><li>Buscar causas reversibles.</li></ul>"
      },
      {
        "h": "Crisis hipertensiva",
        "b": "<ul><li>Urgencia (sin daño de órgano): control gradual, vía oral.</li><li>Emergencia (con daño agudo): fármacos iv como urapidil o labetalol.</li><li>Evitar descensos bruscos de la tensión.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-ica",
    "cat": "extra",
    "title": "Insuficiencia cardíaca aguda y EAP",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "insuficiencia cardiaca aguda edema agudo de pulmon eap furosemida nitroglicerina morfina cloruro morfico fowler vmni cpap perfiles humedo seco frio caliente dobutamina levosimendan",
    "summary": "Manejo del edema agudo de pulmón y la insuficiencia cardíaca aguda según el perfil hemodinámico.",
    "sec": [
      {
        "h": "Edema agudo de pulmón",
        "b": "<ul><li>Sentar al paciente en Fowler a 60º.</li><li>Oxígeno a alto flujo o VMNI/CPAP.</li><li>Furosemida 40-80 mg iv.</li><li>Nitroglicerina si la tensión está conservada.</li><li>Cloruro mórfico para reducir la ansiedad y la precarga.</li></ul>"
      },
      {
        "h": "Perfiles hemodinámicos",
        "b": "<ul><li>Clasificar en húmedo/seco y frío/caliente.</li><li>El húmedo-caliente (congestivo con buena perfusión) es el más frecuente y responde a diuréticos y vasodilatadores.</li></ul>"
      },
      {
        "h": "Bajo gasto",
        "b": "<ul><li>En el perfil frío valorar inotrópicos (dobutamina, levosimendan) y traslado.</li><li>Vigilar la hipotensión.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-ictus",
    "cat": "extra",
    "title": "Código ictus y urgencias neurológicas",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "ictus acv codigo ictus cincinnati ventana terapeutica convulsiones epilepsia estatus diazepam glucemia coma sindrome meningeo cabecera 30 grados",
    "summary": "Activación del código ictus y manejo de convulsiones, coma y síndrome meníngeo.",
    "sec": [
      {
        "h": "Código ictus",
        "b": "<ul><li>Reconocer con la escala de Cincinnati: asimetría facial, claudicación de un brazo y alteración del habla.</li><li>Anotar la hora de inicio (ventana terapéutica), glucemia y constantes.</li><li>Cabecera a 30º y traslado urgente a centro con unidad de ictus.</li></ul>"
      },
      {
        "h": "Convulsiones",
        "b": "<ul><li>Proteger de traumatismos y no introducir nada en la boca.</li><li>Oxígeno; si persiste (estatus): benzodiacepina (diazepam) y traslado.</li><li>Descartar siempre hipoglucemia.</li></ul>"
      },
      {
        "h": "Coma",
        "b": "<ul><li>ABCDE, pupilas, Glasgow y glucemia capilar.</li><li>Considerar causas reversibles (hipoglucemia, opioides) antes de medidas avanzadas.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-pediatria",
    "cat": "extra",
    "title": "Urgencias pediátricas",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "pediatria niño fiebre paracetamol ibuprofeno convulsion febril diazepam rectal asma salbutamol prednisona dosis por kilo deshidratacion",
    "summary": "Manejo de la fiebre, la convulsión febril y la crisis asmática en pediatría, con dosis por peso.",
    "sec": [
      {
        "h": "Fiebre",
        "b": "<ul><li>Medidas físicas y antitérmicos: paracetamol 10-20 mg/kg o ibuprofeno 5-7 mg/kg.</li><li>Buscar signos de alarma: mal estado general, exantema petequial o rigidez de nuca.</li></ul>"
      },
      {
        "h": "Convulsión febril",
        "b": "<ul><li>Proteger al niño y colocarlo en posición de seguridad.</li><li>Si se prolonga: diazepam rectal 0,5 mg/kg.</li><li>Tranquilizar a la familia y valorar traslado.</li></ul>"
      },
      {
        "h": "Crisis asmática",
        "b": "<ul><li>Salbutamol nebulizado con oxígeno; valorar ipratropio.</li><li>Corticoide oral: prednisona 1-2 mg/kg.</li><li>Reevaluar la respuesta.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-metabolico",
    "cat": "extra",
    "title": "Urgencias endocrino-metabólicas",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "hipoglucemia glucagon glucosa dextrosa cetoacidosis diabetica cad coma mixedematoso crisis tirotoxica hidrocortisona kussmaul descompensacion diabetes",
    "summary": "Manejo de la hipoglucemia, la cetoacidosis y otras descompensaciones endocrino-metabólicas.",
    "sec": [
      {
        "h": "Hipoglucemia",
        "b": "<ul><li>Si está consciente: 15-20 g de glucosa por vía oral.</li><li>Si hay bajo nivel de conciencia: dextrosa al 50% iv o glucagón im/sc.</li><li>Reevaluar glucemia y dar hidratos de absorción lenta al recuperar.</li></ul>"
      },
      {
        "h": "Cetoacidosis diabética",
        "b": "<ul><li>Sospecha por hiperglucemia, deshidratación, respiración de Kussmaul y aliento cetósico.</li><li>Hidratación con suero fisiológico y traslado.</li><li>Vigilar el nivel de conciencia.</li></ul>"
      },
      {
        "h": "Otras descompensaciones",
        "b": "<ul><li>Coma mixedematoso: abrigar, hidrocortisona y traslado.</li><li>Crisis tirotóxica: controlar la agitación y traslado urgente.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-psiquiatria",
    "cat": "extra",
    "title": "Agitación y urgencias psiquiátricas",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "agitacion psicomotriz contencion mecanica verbal haloperidol diazepam sindrome confusional agudo delirium tiamina naloxona flumazenil seguridad",
    "summary": "Manejo del paciente agitado y del síndrome confusional agudo garantizando la seguridad.",
    "sec": [
      {
        "h": "Agitación",
        "b": "<ul><li>Priorizar la seguridad del paciente y del equipo.</li><li>Contención verbal y ambiental primero.</li><li>Si fracasa: sedación (haloperidol y/o benzodiacepina).</li><li>Contención mecánica solo como último recurso y con vigilancia.</li></ul>"
      },
      {
        "h": "Síndrome confusional agudo",
        "b": "<ul><li>Buscar causa orgánica: infección, hipoxia, hipoglucemia o tóxicos.</li><li>Valorar tiamina y antídotos (naloxona, flumazenil) si se sospecha intoxicación.</li></ul>"
      },
      {
        "h": "Norma",
        "b": "<ul><li>Descartar siempre una causa médica antes de atribuir el cuadro a lo psiquiátrico.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-respiratorio",
    "cat": "extra",
    "title": "Disnea, asma y EPOC reagudizado",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "disnea crisis asmatica epoc reagudizado broncoespasmo salbutamol ipratropio metilprednisolona ventimask vmni cpap hemoptisis saturacion oxigeno hipercapnia",
    "summary": "Manejo de la disnea aguda, la crisis asmática, la reagudización de EPOC y la hemoptisis.",
    "sec": [
      {
        "h": "Crisis asmática",
        "b": "<ul><li>Oxígeno y salbutamol nebulizado repetido con ipratropio.</li><li>Corticoide sistémico (metilprednisolona).</li><li>Valorar gravedad por la dificultad para hablar, el uso de musculatura accesoria y la saturación.</li></ul>"
      },
      {
        "h": "EPOC reagudizado",
        "b": "<ul><li>Oxigenoterapia controlada (Ventimask 24-28%) para evitar la narcosis.</li><li>Broncodilatadores y corticoide.</li><li>VMNI/CPAP si hay insuficiencia respiratoria con hipercapnia.</li></ul>"
      },
      {
        "h": "Hemoptisis",
        "b": "<ul><li>Decúbito sobre el lado que sangra si se conoce, y oxígeno.</li><li>Vigilar la vía aérea; la hemoptisis masiva es una emergencia vital.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-digestivo",
    "cat": "extra",
    "title": "Urgencias digestivas",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "dolor abdominal abdomen agudo hemorragia digestiva melenas hematemesis omeprazol descompensacion hepatica ascitis encefalopatia ictericia shock",
    "summary": "Valoración del abdomen agudo y manejo de la hemorragia digestiva y la descompensación hepática.",
    "sec": [
      {
        "h": "Dolor abdominal",
        "b": "<ul><li>Valorar signos de alarma: defensa, abdomen en tabla o signos de shock.</li><li>Constantes y traslado; dieta absoluta.</li><li>Analgesia prudente sin enmascarar el cuadro.</li></ul>"
      },
      {
        "h": "Hemorragia digestiva",
        "b": "<ul><li>Reconocer hematemesis y melenas.</li><li>Vía venosa, reposición con cristaloides y oxígeno.</li><li>Inhibidor de la bomba de protones (omeprazol iv) y traslado urgente.</li><li>Vigilar signos de shock.</li></ul>"
      },
      {
        "h": "Descompensación hepática",
        "b": "<ul><li>Ascitis, ictericia y encefalopatía.</li><li>Cuidar el nivel de conciencia y la vía aérea, y trasladar.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-toxicologia",
    "cat": "extra",
    "title": "Intoxicaciones y antídotos",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "intoxicacion toxicologia carbon activado lavado gastrico naloxona flumazenil n-acetilcisteina atropina pralidoxima hidroxicobalamina opioides benzodiacepinas paracetamol organofosforados cianuro drogas de abuso",
    "summary": "Manejo inicial del intoxicado, medidas de descontaminación y principales antídotos.",
    "sec": [
      {
        "h": "Manejo inicial",
        "b": "<ul><li>ABCDE y soporte de las funciones vitales.</li><li>Identificar el tóxico, la dosis y el tiempo transcurrido.</li><li>El soporte vital prima sobre el antídoto.</li></ul>"
      },
      {
        "h": "Descontaminación",
        "b": "<ul><li>Carbón activado si la ingesta es reciente, el tóxico es adsorbible y la vía aérea está protegida.</li><li>El lavado gástrico tiene indicaciones cada vez más limitadas.</li></ul>"
      },
      {
        "h": "Antídotos clave",
        "b": "<ul><li>Naloxona: opioides.</li><li>Flumazenil: benzodiacepinas, con cautela.</li><li>N-acetilcisteína: paracetamol.</li><li>Atropina y pralidoxima: organofosforados.</li><li>Hidroxicobalamina: cianuro.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-obstetricia",
    "cat": "extra",
    "title": "Parto inminente y urgencias obstétricas",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "parto inminente embarazo cordon umbilical oxitocina alumbramiento prolapso de cordon hemorragia posparto preeclampsia eclampsia recien nacido coronacion",
    "summary": "Atención al parto extrahospitalario inminente y a las complicaciones obstétricas urgentes.",
    "sec": [
      {
        "h": "Parto inminente",
        "b": "<ul><li>Si la coronación es visible, prepararse para asistir.</li><li>Acompañar la salida controlada de la cabeza y los hombros.</li><li>Pinzar y cortar el cordón entre dos pinzas.</li><li>Secar y abrigar al recién nacido sobre el abdomen de la madre.</li></ul>"
      },
      {
        "h": "Alumbramiento",
        "b": "<ul><li>Esperar la salida espontánea de la placenta sin tirar del cordón.</li><li>Oxitocina 10 UI im ayuda a la contracción uterina y reduce la hemorragia.</li></ul>"
      },
      {
        "h": "Complicaciones",
        "b": "<ul><li>Prolapso de cordón: no reintroducir, elevar la presentación y traslado urgente.</li><li>Hemorragia posparto: masaje uterino.</li><li>Eclampsia: control de las convulsiones y traslado.</li></ul>"
      }
    ]
  },
  {
    "id": "extra-paliativos",
    "cat": "extra",
    "title": "Sedación paliativa y oncología",
    "source": "INGESA · Emergencias Extrahospitalarias 2014",
    "tags": "cuidados paliativos sedacion paliativa terminal midazolam cloruro morfico escala ramsay control del dolor agonia disnea terminal sintoma refractario confort",
    "summary": "Manejo del paciente oncológico terminal: control de síntomas y sedación paliativa.",
    "sec": [
      {
        "h": "Control de síntomas",
        "b": "<ul><li>Tratar dolor, disnea, agitación y náuseas.</li><li>Escalar la analgesia (opioides como el cloruro mórfico) según necesidad.</li><li>Cuidar la vía y a la familia.</li></ul>"
      },
      {
        "h": "Sedación paliativa",
        "b": "<ul><li>Ante un síntoma refractario al final de la vida: midazolam, a menudo con cloruro mórfico.</li><li>Ajustar el nivel de sedación con la escala de Ramsay.</li><li>Siempre con información y consentimiento.</li></ul>"
      },
      {
        "h": "Enfoque",
        "b": "<ul><li>El objetivo es el confort, sin acelerar ni retrasar la muerte.</li><li>Acompañamiento y comunicación con el entorno.</li></ul>"
      }
    ]
  },
  {
    "id": "tce-extrahosp",
    "cat": "extra",
    "title": "Traumatismo craneoencefálico (TCE)",
    "source": "061 Ingesa · Guía Rápida Extrahospitalaria",
    "tags": "tce trauma cráneo pic herniación pupilas anisocoria glasgow pic urapidil manitol vomito",
    "summary": "ABC inicial, inmovilización cervical, detección precoz de la PIC y herniación cerebral. Manejo tensional y anticomicial.",
    "sec": [
      {
        "h": "Valoración Inicial y PIC",
        "b": "<ul><li><b>ABC prioritario:</b> asegurar vía aérea permeable, ventilación y tratar alteraciones circulatorias con inmovilización cervical rígida.</li><li><b>Detección de PIC (Presión Intracraneal):</b> buscar la tríada de hipertensión arterial, bradicardia y bradipnea. Signos de herniación inminente: anisocoria, disminución del nivel de conciencia y rigidez de descerebración.</li><li>Un <b>Glasgow ≤ 8</b> se considera lesión encefálica severa.</li></ul>"
      },
      {
        "h": "Manejo Tensional Estricto",
        "b": "<p>Mantener siempre la Tensión Arterial Diastólica (TAD) por encima de 100 mmHg para asegurar la perfusión cerebral:</p><ul><li><b>En caso de Hipotensión:</b> infundir cristaloides IV (10 mg/kg); si no responde, añadir dopamina.</li><li><b>En caso de Hipertensión reactiva:</b> administrar Urapidil (media ampolla IV lenta en 20 segundos).</li></ul>"
      },
      {
        "h": "Medidas Antiedema y Crisis",
        "b": "<ul><li>Si hay signos de herniación o aumento de PIC: intubación endotraqueal obligatoria e <b>hiperventilar a más de 20 rpm</b>, junto a <b>Manitol al 20%</b> (1 g/kg IV a pasar en 20 minutos). Contraindicado en shock.</li><li><b>En caso de convulsiones:</b> Diazepam en bolos IV lentos seguido de Fenitoína (18 mg/kg IV en suero fisiológico).</li></ul>"
      }
    ]
  },
  {
    "id": "medular-extrahosp",
    "cat": "extra",
    "title": "Traumatismo vertebral y medular",
    "source": "061 Ingesa · Guía Rápida Extrahospitalaria",
    "tags": "medular columna cervical shock neurogenico rme collarin nascis metilprednisolona solumoderin dopamina",
    "summary": "Diferenciación del shock neurogénico, Restricción de Movimientos Espinales (RME) y protocolo de Metilprednisolona.",
    "sec": [
      {
        "h": "Shock Neurogénico frente a Hipovolémico",
        "b": "<p>La disfunción del sistema nervioso autónomo produce un shock neurogénico característico:</p><ul><li>El paciente se presenta <b>hipotenso</b> pero con <b>frecuencia cardíaca lenta (bradicardia)</b> y la <b>piel caliente/color normal</b> (sin palidez ni sudoración por ausencia de catecolaminas).</li><li><b>Tratamiento:</b> posición de Trendelenburg, cristaloides IV hasta conseguir PAS ≥ 90-100 mmHg y pulso radial palpable. Si falla, perfundir Dopamina.</li></ul>"
      },
      {
        "h": "Restricción de Movimientos Espinales (RME)",
        "b": "<ul><li>Inmovilización en posición neutra alineada sin tracción colocando un acolchado de 2.5 a 5 cm en la zona occipital. Realizar RME definitiva con collarín, tetracameral y colchón de vacío o tabla larga.</li><li><b>Indicaciones absolutas:</b> colisiones a alta velocidad, caídas de altura triple a la estatura, accidentes por clavados, heridas penetrantes en columna o trauma con Glasgow alterado, intoxicación o dolor espontáneo a la palpación espinal.</li></ul>"
      },
      {
        "h": "Daño Secundario: Protocolo NASCIS II",
        "b": "<p>Para prevenir la inflamación secundaria de la médula, administrar <b>Metilprednisolona</b> de inmediato:</p><ul><li><b>Bolo inicial:</b> 30 mg/kg diluidos en suero a pasar en 15-20 minutos.</li><li><b>Perfusión continua:</b> 5.4 mg/kg/hora durante las siguientes 23 horas.</li><li>Colocar sonda Foley por retención urinaria secundaria a atonía vesical.</li></ul>"
      }
    ]
  },
  {
    "id": "politrauma-extrahosp",
    "cat": "extra",
    "title": "Atención inicial al paciente politraumatizado",
    "source": "061 Ingesa · Guía Rápida Extrahospitalaria",
    "tags": "politraumatizado politrauma escena oro platino sample avdi cincinnati dcap",
    "summary": "Definición de riesgo vital, la hora de oro y los 10 minutos de platino extrahospitalarios. Algoritmos SAMPLE y AVDI.",
    "sec": [
      {
        "h": "Tiempos Críticos: Platino y Oro",
        "b": "<ul><li><b>Politraumatizado:</b> paciente con más de una lesión traumática, alguna de las cuales conlleva riesgo vital potencial.</li><li>Si el paciente severamente lesionado llega estable al quirófano en la primera hora (<b>Hora de Oro</b>), la supervivencia es del 85%.</li><li>En el entorno extrahospitalario se dispone únicamente de los <b>10 minutos de platino</b> in situ para realizar la valoración primaria y el soporte vital crítico.</li></ul>"
      },
      {
        "h": "Evaluación Inicial (AVDI y ABC)",
        "b": "<ul><li><b>Estado Mental Rápido (AVDI):</b> Alerta, Verbal, Dolor, Inconsciente.</li><li><b>Vía Aérea y Respiración:</b> si está inconsciente o no habla, buscar signos obstructivos (gorgoteos, estridor) e iniciar asistencia ventilatoria si la FR < 10 rpm.</li><li><b>Circulación:</b> la palidez, frialdad cutánea, relleno capilar > 2 segundos y pulso filiforme confirman el estado de shock.</li></ul>"
      },
      {
        "h": "Revisión Rápida de Trauma",
        "b": "<p>Exploración ordenada de la cabeza a los pies buscando deformidades, contusiones, abrasiones y penetraciones (DCAP):</p><ul><li><b>SAMPLE Obligatorio:</b> Síntomas, Alergias, Medicamentos, Patologías previas, Última ingesta y Eventos del accidente.</li><li> venas del cuello, asimetrías torácicas (auscultar en 4º espacio intercostal línea axilar media) y contractura abdominal.</li></ul>"
      }
    ]
  },
  {
    "id": "shock-extrahosp",
    "cat": "extra",
    "title": "Manejo prehospitalario del shock hipovolémico",
    "source": "061 Ingesa · Guía Rápida Extrahospitalaria",
    "tags": "shock hipovolemico hemorragico cristaloides volemia dopamina perfusión fides",
    "summary": "Identificación del shock hemorrágico por trauma, resucitación volumétrica con cristaloides y soporte inotrópico.",
    "sec": [
      {
        "h": "Fisiopatología del Shock Hemorrágico",
        "b": "<ul><li>Se produce por la pérdida de al menos un 30% de la volemia intravascular debido a rotura de grandes vasos, vísceras macizas o fracturas complejas de pelvis o fémur.</li><li><b>Signos clínicos:</b> TAS < 90 mmHg, taquicardia extrema (>110-140 lpm), pulsos periféricos filiformes o ausentes, frialdad cutánea con sudor frío y oliguria.</li></ul>"
      },
      {
        "h": "Resucitación con Fluidos",
        "b": "<ul><li><b>Cristaloides de elección:</b> iniciar de inmediato con bolos de 250 ml de Suero Salino Fisiológico (SSF) o Ringer Lactato si no hay pulso radial palpable.</li><li>Monitorizar la respuesta (PA, FC, SatO2) y vigilar signos de sobrecarga de volumen (crepitantes basales o ingurgitación yugular con la cabeza elevada).</li><li>Anotar minuciosamente la respuesta a los fluidos y transmitirla de viva voz en la transferencia hospitalaria.</li></ul>"
      },
      {
        "h": "Soporte Inotrópico de Emergencia",
        "b": "<p>Si el paciente no responde a la fluidoterapia volumétrica, iniciar soporte presor con <b>Dopamina</b>:</p><ul><li><b>Preparación:</b> diluir 1 ampolla (200 mg) en 90 ml de Suero Glucosado al 5% (concentración de 2 mg/ml).</li><li>Infundir dosis tituladas según peso mediante bomba o Dial-a-Flo para potenciar el efecto inotrópico positivo.</li></ul>"
      }
    ]
  },
  {
    "id": "quemados-extrahosp",
    "cat": "extra",
    "title": "Quemaduras térmicas, químicas y eléctricas",
    "source": "061 Ingesa · Guía Rápida Extrahospitalaria",
    "tags": "quemaduras quemado parkland ringer lactato mórfico analgesia ácidos álcalis iceberg",
    "summary": "Fórmula de Parkland, manejo de la inhalación de humo, neutralización química y prevención del fracaso renal en quemaduras eléctricas.",
    "sec": [
      {
        "h": "Estabilización y Fluidoterapia",
        "b": "<ul><li>Priorizar el aislamiento de la vía aérea en caso de inhalación de humos (esputos carbonáceos, pérdida de vello nasal) administrando O2 al 100% con reservorio.</li><li><b>Fórmula de Parkland:</b> perfundir Ringer Lactato (500 ml IV en los primeros 30 minutos de forma empírica) mientras se calcula la pauta definitiva de 4 ml x % SCQ x kg de peso para las primeras 24 horas.</li><li>Sondaje urinario precoz obligatorio para medir la diuresis horaria.</li></ul>"
      },
      {
        "h": "Analgesia Continua con Opioides",
        "b": "<ul><li><b>Tratamiento del dolor intenso:</b> Cloruro Mórfico IV. Diluir 1 ampolla (10 mg) en 9 ml de SF; infundir 3 mg IV cada 20 minutos hasta el alivio.</li><li>Si el traslado es prolongado, preparar perfusión continua: 5 ampollas de cloruro mórfico en 50 ml de SF a pasar de 2 a 10 ml/hora. Proteger la mucosa gástrica con Ranitidina IV.</li><li><b>Cuidado local:</b> irrigar con SF templado, cubrir con sábanas limpias y <b>NO</b> aplicar pomadas ni antisépticos colorantes.</li></ul>"
      },
      {
        "h": "Quemaduras Químicas y Eléctricas",
        "b": "<ul><li><b>Ácidos frente a Álcalis:</b> los ácidos producen escara seca autolimitada; los álcalis licúan el tejido sin formar escara y penetran en profundidad (exigen lavado continuo con agua hasta una hora). Si es por sodio o potasio metálico, usar aceites, nunca agua.</li><li><b>Eléctricas (Efecto Iceberg):</b> el daño interno es masivo. Exigen fluidoterapia agresiva para mantener una <b>diuresis mayor de 100 cc/hora</b> y evitar el fracaso renal agudo por mioglobinuria. Monitorización continua por arritmias ventriculares.</li></ul>"
      }
    ]
  },
{"id":"uci-vm-conceptos","evidenceQuery":"mechanical ventilation modes","cat":"uci","title":"Conceptos, indicaciones y modos de VM","source":"Manual Básico de la UCI · Ventilación Mecánica","tags":"conceptos, indicaciones modos ventilacion mecanica conceptos uci cuidados intensivos criticos critico","summary":"La ventilación mecánica sustituye o ayuda temporalmente la función de los músculos inspiratorios. Es una intervención de apoyo, no una terapia.","sec":[{"h":"","b":"<p>La ventilación mecánica sustituye o ayuda temporalmente la función de los músculos inspiratorios. Es una intervención de apoyo, no una terapia.</p>"},{"h":"INDICACIONES","b":"<ul><li>Respiratorias: Insuficiencia respiratoria Tipo 1 (hipoxémica: PaO2<60 mmHg con O2 suplementario, SatO2<88%) y Tipo 2 (hipercápnica/hipoventilación: CO2 elevado con acidosis respiratoria).</li><li>Protección de la vía aérea.</li><li>Indicaciones neurológicas.</li></ul>"},{"h":"MODOS CONVENCIONALES","b":"<ul><li>Asistida-controlada (A/C): controlada por volumen o por presión.</li><li>Mandatoria intermitente sincronizada (SIMV).</li><li>Ventilación espontánea (SV).</li></ul>"},{"h":"","b":"<p>Tipos según carga de trabajo: mandatorio, asistido, soporte y espontáneo.</p>"}]},
{"id":"uci-vm-parametros-ac","evidenceQuery":"assist control ventilation settings","cat":"uci","title":"Parámetros en modo Asistido/Controlado","source":"Manual Básico de la UCI · Ventilación Mecánica","tags":"parametros modo asistido/controlado ventilacion mecanica uci cuidados intensivos criticos critico","summary":"FiO2: 21-60%.","sec":[{"h":"","b":"<p>FiO2: 21-60%.</p><p>Volumen tidal: 6-8 ml/kg peso ideal (sin SDRA); 4-8 ml/kg peso predicho con SDRA (iniciar con 6).</p><p>Disparo (trigger): 1-3 L/min por flujo, o -0.5 a 2 cmH2O por presión.</p><p>PEEP: 5-8 cmH2O.</p><p>FR: la necesaria para un CO2 normal/deseado según patología.</p><p>Flujo: 30-60 L/min, ajustar para relación I:E de 1:2 a 1:3.</p>"},{"h":"","b":"<p>PESO IDEAL (sin SDRA): Talla(m)² × 23 (hombre); Talla(m)² × 21.5 (mujer).</p><p>PESO PREDICHO (con SDRA): (Talla cm − 152.4 × 0.91) + 50 (hombres); + 45.5 (mujeres).</p>"}]},
{"id":"uci-vm-volumen-minuto-co2","evidenceQuery":"minute ventilation CO2 management","cat":"uci","title":"Volumen minuto y ajuste de CO2","source":"Manual Básico de la UCI · Ventilación Mecánica","tags":"volumen minuto ajuste co2 ventilacion mecanica uci cuidados intensivos criticos critico","summary":"VOLUMEN MINUTO (Vm) = Volumen tidal × FR. Valor normal 4-6 L/min. Relacionado con el CO2.","sec":[{"h":"","b":"<p>VOLUMEN MINUTO (Vm) = Volumen tidal × FR. Valor normal 4-6 L/min. Relacionado con el CO2.</p><p>Ejemplo: Vt 350 ml × FR 14 = 5 L/min.</p>"},{"h":"","b":"<p>FÓRMULA DE CO2: FCO2 = FR × CO2 actual / CO2 esperado.</p><p>Ejemplo: 14 × 55 / 40 = 19.2.</p>"},{"h":"","b":"<p>AJUSTE POR BICARBONATO (Fórmula de Winter, acidosis metabólica): CO2 esperado = (HCO3 × 1.5) + 8.</p><p>Ejemplo: (10×1.5)+8 = 23; FCO2 = 14×35/23 = 21.</p>"}]},
{"id":"uci-vm-acp","evidenceQuery":"pressure controlled ventilation","cat":"uci","title":"Modo Asistido Controlado por Presión (AC-P)","source":"Manual Básico de la UCI · Ventilación Mecánica","tags":"modo asistido controlado por presion (ac-p) ventilacion mecanica acp uci cuidados intensivos criticos critico","summary":"Se ajusta el nivel de presión inspiratoria, la FR y la duración de la inspiración; el volumen circulante y el flujo son variables.","sec":[{"h":"","b":"<p>Se ajusta el nivel de presión inspiratoria, la FR y la duración de la inspiración; el volumen circulante y el flujo son variables.</p><p>La variable control es la presión inspiratoria = presión pico (Pmax).</p><p>Valor estándar: 10-15 cmH2O para lograr un volumen tidal adecuado.</p>"},{"h":"","b":"<p>Tiempo inspiratorio con relación I:E 1:2 (fisiológica):</p><ul><li>a) Ciclo respiratorio ÷ 3</li><li>b) Ciclo respiratorio × 0.333</li></ul>"}]},
{"id":"uci-vmni","evidenceQuery":"noninvasive ventilation CPAP","cat":"uci","title":"Ventilación Mecánica No Invasiva (VMNI / CPAP-PSV)","source":"Manual Básico de la UCI · Ventilación Mecánica","tags":"ventilacion mecanica invasiva (vmni cpap-psv) vmni uci cuidados intensivos criticos critico","summary":"La inspiración siempre la determina el esfuerzo del paciente; nunca se programa FR. Variable control = presión soporte (diferencia entre presión in…","sec":[{"h":"","b":"<p>La inspiración siempre la determina el esfuerzo del paciente; nunca se programa FR. Variable control = presión soporte (diferencia entre presión inspiratoria y PEEP).</p>"},{"h":"PARÁMETROS","b":"<p>FiO2: 21-60%.</p><p>PSV: la necesaria para Vt 6-8 ml/kg (8-14 cmH2O).</p><p>Disparo: 1-2 L/min por flujo o -0.5 a 2 cmH2O por presión.</p><p>CPAP/PEEP: 5-8 cmH2O.</p>"}]},
{"id":"uci-vm-cuidados-neumotaponamiento","evidenceQuery":"endotracheal tube cuff pressure","cat":"uci","title":"Cuidados: presión del balón de neumotaponamiento","source":"Manual Básico de la UCI · Ventilación Mecánica","tags":"cuidados: presion del balon neumotaponamiento ventilacion mecanica cuidados uci intensivos criticos critico","summary":"RANGOS DE PRESIÓN DEL BALÓN:","sec":[{"h":"RANGOS DE PRESIÓN DEL BALÓN","b":"<ul><li>Bajo <20 cmH2O (<15 mmHg): fuga, broncoaspiración, neumonía, extubación accidental.</li><li>Adecuado 20-30 cmH2O (15-22 mmHg).</li><li>Alto >30 cmH2O (>22 mmHg): dolor, disfonía, úlcera, parálisis de cuerdas vocales, fístula/estenosis traqueal.</li></ul><p>En cc: aprox. 7-10 cc.</p>"},{"h":"","b":"<p>CONVERSIONES: 1 mmHg = 1.36 cmH2O; 1 cmH2O = 0.73 mmHg.</p><p>Sensibilidad: 0.5-2 cmH2O por presión; 1-3 L/min en flujo-volumen.</p>"}]},
{"id":"uci-gasometria-valores","evidenceQuery":"arterial blood gas interpretation","cat":"uci","title":"Gasometría arterial: valores normales","source":"Manual Básico de la UCI · Gasometría y Equilibrio Ácido-Base","tags":"gasometria arterial: valores normales equilibrio acido-base uci cuidados intensivos criticos critico","summary":"pH: 7.35-7.45","sec":[{"h":"","b":"<p>pH: 7.35-7.45</p><p>PaO2: 80-100 mmHg</p><p>PaCO2: 35-45 mmHg</p><p>SaO2: 95-100%</p><p>HCO3: 22-26 mEq/L</p><p>Exceso de base (BE): -2 a +2</p><p>Lactato: 1-2 mmol/L</p><p>Na+: 135-145 mEq/L | K+: 3.5-5 mEq/L | Cl-: 95-110 mEq/L</p>"}]},
{"id":"uci-gasometria-kirby","evidenceQuery":"PaO2 FiO2 ratio","cat":"uci","title":"Índice de Kirby (PaFi = PaO2/FiO2)","source":"Manual Básico de la UCI · Gasometría y Equilibrio Ácido-Base","tags":"indice kirby (pafi pao2/fio2) gasometria equilibrio acido-base uci cuidados intensivos criticos critico","summary":"Cociente que mide indirectamente la lesión pulmonar; útil en SDRA.","sec":[{"h":"","b":"<p>Cociente que mide indirectamente la lesión pulmonar; útil en SDRA.</p><ul><li>Normal: >300</li><li>Leve: 300-200</li><li>Moderada: 200-100</li><li>Severa: <100</li></ul>"}]},
{"id":"uci-acido-base-reglas","evidenceQuery":"acid base disorders","cat":"uci","title":"Reglas de alteración ácido-base","source":"Manual Básico de la UCI · Gasometría y Equilibrio Ácido-Base","tags":"reglas alteracion acido-base gasometria equilibrio acido base uci cuidados intensivos criticos critico","summary":"pH <7.35 Acidosis | >7.45 Alcalosis","sec":[{"h":"","b":"<p>pH <7.35 Acidosis | >7.45 Alcalosis</p><p>PCO2 <35 Alcalosis respiratoria | >45 Acidosis respiratoria</p><p>HCO3 <22 Acidosis metabólica | >26 Alcalosis metabólica</p><p>BE <-2 Acidosis metabólica | >+2 Alcalosis metabólica</p>"},{"h":"","b":"<p>INTERPRETACIÓN (algoritmo): verificar pH → acidemia/alcalemia → valorar PCO2 (respiratorio) y HCO3 (metabólico). En acidosis metabólica calcular ANION GAP = Na - (Cl + HCO3): normal 8-12 (hiperclóricas, diarrea, ATR); elevado >12 (cetoacidosis, salicilatos, uremia, láctica, metanol, etilenglicol).</p>"},{"h":"","b":"<p>Compensación acidosis metabólica (Winter): CO2 esperado = (1.5 × HCO3) + 8 ±2.</p>"}]},
{"id":"uci-sedoanalgesia-escalas","evidenceQuery":"CPOT RASS pain sedation assessment","cat":"uci","title":"Escalas de dolor: CPOT y RASS","source":"Manual Básico de la UCI · Sedoanalgesia","tags":"escalas dolor: cpot rass sedoanalgesia uci cuidados intensivos criticos critico","summary":"CPOT (Critical Care Pain Observation Tool): valora expresión facial, movimiento de miembros, tensión muscular, adaptación al ventilador y vocalizac…","sec":[{"h":"","b":"<p>CPOT (Critical Care Pain Observation Tool): valora expresión facial, movimiento de miembros, tensión muscular, adaptación al ventilador y vocalización (0-2 c/u). Puntuación >2 indica presencia de dolor. También válida la BPS.</p>"},{"h":"","b":"<p>RASS (Richmond Agitation-Sedation Scale): de +4 (combativo) a -5 (sin respuesta), 0 = alerta y calmado. Sedación superficial (objetivo habitual): -2 a +1, ideal 0 = paciente despierto, tranquilo y colaborador.</p>"},{"h":"","b":"<p>CONCEPTO eCASH: early Comfort using Analgesia, minimal Sedatives and maximal Human care. Analgesia primero, mínima sedación, movilización precoz, cuidados centrados en paciente/familia.</p>"}]},
{"id":"uci-cardio-precarga-postcarga","evidenceQuery":"preload afterload contractility","cat":"uci","title":"Precarga, postcarga y contractilidad","source":"Manual Básico de la UCI · Cardiología Crítica","tags":"precarga, postcarga contractilidad cardiologia critica cardio precarga uci cuidados intensivos criticos critico","summary":"PRECARGA: volumen/presión ventricular al iniciar la contracción (volumen diastólico final). Depende del retorno venoso; a mayor precarga mayor volu…","sec":[{"h":"","b":"<p>PRECARGA: volumen/presión ventricular al iniciar la contracción (volumen diastólico final). Depende del retorno venoso; a mayor precarga mayor volumen de eyección.</p><p>POSTCARGA: tensión contra la que se contrae el ventrículo (resistencia a vencer). Componente principal: presión arterial y resistencia vascular periférica.</p><p>CONTRACTILIDAD (inotropismo): capacidad del músculo cardíaco de acortarse y generar fuerza independiente de pre/postcarga. La fracción de eyección es un aproximado clínico.</p>"}]},
{"id":"uci-cardio-laboratorios","evidenceQuery":"cardiac biomarkers","cat":"uci","title":"Valores de laboratorio en cardiología","source":"Manual Básico de la UCI · Cardiología Crítica","tags":"valores laboratorio cardiologia critica cardio laboratorios uci cuidados intensivos criticos critico","summary":"ELECTROLITOS: K+ 3.5-5.5 mEq/L (elevado → riesgo FV, tratar con gluconato de calcio); Ca+ 8-10 mg/dL; Mg+ 1.5-2.5 mEq/L; Na+ 135-145 mEq/L; Lactato…","sec":[{"h":"","b":"<p>ELECTROLITOS: K+ 3.5-5.5 mEq/L (elevado → riesgo FV, tratar con gluconato de calcio); Ca+ 8-10 mg/dL; Mg+ 1.5-2.5 mEq/L; Na+ 135-145 mEq/L; Lactato <2 mmol/L.</p><p>HEMATOLOGÍA: Hb 12-16 g/dL (<6 requiere transfusión); Hto 40-60%; Colesterol <200; TG <150.</p><p>PERFIL CARDIACO: CK-MB 0-6%; DHL 115-225 UI/L; BNP &lt;50 pg/ml.</p><p>⚠️ <b>Troponina: aquí no va una cifra.</b> El límite superior de referencia es <b>específico de cada ensayo y de cada sexo</b>, así que un número fijo no es transferible entre laboratorios. La 5ª Definición Universal del IAM (2026) remite a las tablas de la IFCC y al laboratorio del centro: <i>«cardiac troponin assays are not standardized by the manufacturers […] clinicians should refer to the […] Biomarkers Reference Tables and apply assay-specific thresholds in practice»</i>. Ver la ficha <b>Infarto de miocardio: clasificación y troponinas</b>.</p>"}]},
{"id":"uci-cardio-inotropicos","evidenceQuery":"inotropes vasopressors critical care","cat":"uci","title":"Inotrópicos y vasopresores + cálculo de dosis","source":"Manual Básico de la UCI · Cardiología Crítica","tags":"inotropicos vasopresores calculo dosis cardiologia critica cardio uci cuidados intensivos criticos critico","summary":"AUMENTAN PRECARGA (vasopresores): Dopamina (crisis hipotensivas, IC), Noradrenalina (choque cardiogénico, 1ª elección, 4 mg/ampolla).","sec":[{"h":"","b":"<p>AUMENTAN PRECARGA (vasopresores): Dopamina (crisis hipotensivas, IC), Noradrenalina (choque cardiogénico, 1ª elección, 4 mg/ampolla).</p><p>REDUCEN PRECARGA (vasodilatadores/diuréticos): Furosemida, Espironolactona, Nitroglicerina (angina, SCA).</p><p>INOTRÓPICOS POSITIVOS: Digoxina, Adrenalina, Dobutamina, Levosimendán.</p><p>INOTRÓPICOS NEGATIVOS: betabloqueantes (metoprolol, atenolol), antagonistas del calcio (verapamilo, diltiazem).</p><p>Receptores: α1 → vasoconstricción; β2 → vasodilatación.</p>"},{"h":"","b":"<p>GASTO CARDIACO ≈ 5 L/min. Depende de precarga, postcarga y contractilidad.</p>"},{"h":"FÓRMULAS DE PERFUSIÓN","b":"<p>1) Concentración = mcg/ml ÷ 60 microgotas (mg × 1000 = mcg).</p><p>2) Velocidad de perfusión (ml/h) = Dosis × peso / concentración.</p><p>3) Dosis (mcg/kg/min, gammas) = Velocidad × concentración / peso (kg).</p>"}]},
{"id":"uci-ecg-basico","evidenceQuery":"ECG interpretation basics","cat":"uci","title":"ECG básico: ritmo sinusal, ondas y derivaciones","source":"Manual Básico de la UCI · Electrofisiología / ECG","tags":"ecg basico: ritmo sinusal, ondas derivaciones electrofisiologia basico uci cuidados intensivos criticos critico","summary":"RITMO SINUSAL: onda P antes de cada QRS (en DII), P sin variación de morfología, PR constante, PP y RR constantes, P positiva en DI/DII/aVF y negat…","sec":[{"h":"","b":"<p>RITMO SINUSAL: onda P antes de cada QRS (en DII), P sin variación de morfología, PR constante, PP y RR constantes, P positiva en DI/DII/aVF y negativa en aVR, FC 60-100 lpm.</p>"},{"h":"","b":"<p>ONDAS: P = despolarización auricular; QRS (0.08-0.12 s) = despolarización ventricular; T = repolarización ventricular. Intervalo PR 0.10-0.20 s; QT 0.33-0.44 s.</p>"},{"h":"","b":"<p>DERIVACIONES PRECORDIALES: V1 borde esternal derecho 4º EIC; V2 borde esternal izquierdo 4º EIC; V3 entre V2 y V4; V4 línea medioclavicular 5º EIC; V5 línea axilar anterior 5º EIC; V6 línea axilar media 5º EIC.</p><p>BIPOLARES: DI (brazo D-brazo I), DII (brazo D-pierna I), DIII (pierna I-brazo I).</p><p>MONOPOLARES: aVR, aVL, aVF.</p>"}]},
{"id":"uci-neuro-escalas-ictus","evidenceQuery":"NIHSS stroke scale","cat":"uci","title":"Escalas de ictus: NIHSS y Cincinnati","source":"Manual Básico de la UCI · Neurología Crítica","tags":"escalas ictus: nihss cincinnati neurologia critica neuro ictus uci cuidados intensivos criticos critico","summary":"NIHSS: 11 ítems (nivel de conciencia, mirada, campo visual, paresia facial, fuerza de miembros, ataxia, sensibilidad, lenguaje, disartria, extinció…","sec":[{"h":"","b":"<p>NIHSS: 11 ítems (nivel de conciencia, mirada, campo visual, paresia facial, fuerza de miembros, ataxia, sensibilidad, lenguaje, disartria, extinción). Máx 42.</p><p>INTERPRETACIÓN: Leve 0-7 | Moderada 8-13 | Severa 14-21 | Muy severa 22-42.</p>"},{"h":"","b":"<p>CINCINNATI (prehospitalaria): 1) desviación de comisura labial, 2) debilidad de extremidad superior, 3) alteración del habla. Si UNO es positivo → 72% probabilidad de ictus. Tratamiento con rtPA en las primeras 4.5 h si no está contraindicado.</p>"}]},
{"id":"uci-neuro-escalas-hsa","evidenceQuery":"subarachnoid hemorrhage grading","cat":"uci","title":"Escalas de HSA: Hunt-Hess y Fisher","source":"Manual Básico de la UCI · Neurología Crítica","tags":"escalas hsa: hunt-hess fisher neurologia critica neuro hsa uci cuidados intensivos criticos critico","summary":"HUNT Y HESS (hemorragia subaracnoidea):","sec":[{"h":"","b":"<p>HUNT Y HESS (hemorragia subaracnoidea):</p><p>1) Asintomático o mínima cefalea con leve rigidez de nuca.</p><p>2) Cefalea severa-moderada con rigidez nucal, sin déficit (salvo parálisis de pares).</p><p>3) Somnolencia, confusión o déficit focal leve.</p><p>4) Estupor, déficit motor moderado-severo, descerebración precoz.</p><p>5) Coma profundo, rigidez de descerebración, aspecto moribundo.</p>"},{"h":"","b":"<p>FISHER (sangre en TC):</p><p>I Sin sangrado en cisternas ni ventrículos.</p><p>II Sangre difusa fina <1 mm.</p><p>III Coágulo grueso cisternal >1 mm.</p><p>IV Hematoma intraparenquimatoso / hemorragia intraventricular ± sangrado difuso.</p>"}]},
{"id":"uci-neuro-glasgow-pupilas","evidenceQuery":"Glasgow coma scale assessment","cat":"uci","title":"Glasgow, valoración pupilar y niveles de conciencia","source":"Manual Básico de la UCI · Neurología Crítica","tags":"glasgow, valoracion pupilar niveles conciencia neurologia critica neuro glasgow pupilas uci cuidados intensivos criticos critico","summary":"ESCALA DE GLASGOW (GCS):","sec":[{"h":"ESCALA DE GLASGOW (GCS)","b":"<p>Apertura ocular: espontánea 4, verbal 3, dolor 2, ninguna 1.</p><p>Respuesta verbal: orientada 5, confusa 4, palabras inadecuadas 3, sonidos 2, ninguna 1.</p><p>Respuesta motora: obedece 6, localiza 5, retirada 4, flexión (decorticación) 3, extensión (descerebración) 2, ninguna 1.</p><p>Trauma: leve 13-15 | moderado 9-12 | grave 3-8.</p>"},{"h":"","b":"<p>PUPILAS: Isocoria (iguales, ~2 mm normal); Miosis (intoxicación insecticida/drogas); Midriasis (falta de O2, alcohol industrial); Anisocoria (daño cerebral, TCE/ECV).</p>"},{"h":"","b":"<p>NIVELES DE CONCIENCIA: confusión, obnubilación, estupor, coma (superficial/profundo).</p>"}]},
{"id":"uci-neuro-pic-ppc","evidenceQuery":"intracranial pressure cerebral perfusion","cat":"uci","title":"Presión intracraneal (PIC) y presión de perfusión cerebral","source":"Manual Básico de la UCI · Neurología Crítica","tags":"presion intracraneal (pic) perfusion cerebral neurologia critica neuro pic ppc uci cuidados intensivos criticos critico","summary":"PIC normal: adultos 10-20 mmHg; niños 3-7 mmHg; recién nacidos 1.5-6 mmHg.","sec":[{"h":"","b":"<p>PIC normal: adultos 10-20 mmHg; niños 3-7 mmHg; recién nacidos 1.5-6 mmHg.</p>"},{"h":"","b":"<p>PRESIÓN DE PERFUSIÓN CEREBRAL (PPC) = PAM − PIC. Valores >60-70 mmHg seguros en adultos (rango de perfusión 50-60 mmHg mínimo).</p>"},{"h":"","b":"<p>PAM (Presión Arterial Media) = (2×PAD + PAS) / 3. Normal 70-110 mmHg.</p>"}]},
{"id":"img-sistematica-torax","evidenceQuery":"chest radiograph interpretation","cat":"imagen","title":"Sistemática de lectura de la Rx de tórax","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"radiografia torax rx sistematica lectura abcde tecnica silueta parenquima pleura oseo dispositivos imagen radiologia rayos","summary":"Método ordenado para leer una placa de tórax sin dejarse hallazgos: técnica, vía aérea, mediastino, parénquima, pleura, hueso y dispositivos.","sec":[{"h":"1. Datos y técnica","b":"<ul><li>Identificación, proyección (PA/AP, lateral) y si es en bipedestación o en cama.</li><li>Calidad: penetración (deben verse los cuerpos vertebrales tras el corazón), inspiración (6 arcos costales anteriores) y rotación (clavículas simétricas respecto a las apófisis espinosas).</li></ul>"},{"h":"2. Recorrido ordenado","b":"<ul><li><b>A</b> vía aérea y tráquea (central, sin desviaciones).</li><li><b>B</b> mediastino y silueta cardíaca (índice cardiotorácico &lt;0,5 en PA).</li><li><b>C</b> campos pulmonares comparando ambos lados por tercios.</li><li><b>D</b> pleura y senos costofrénicos.</li><li><b>E</b> estructuras óseas y partes blandas.</li><li>Por último, tubos, vías y dispositivos.</li></ul>"},{"h":"Clave","b":"<p>Comparar siempre un lado con el otro y no quedarse en el primer hallazgo llamativo: revisar la placa entera antes de concluir.</p>"}]},
{"id":"img-patron-alveolar-intersticial","evidenceQuery":"alveolar interstitial pattern chest radiograph","cat":"imagen","title":"Patrón alveolar vs. intersticial","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"patron alveolar intersticial consolidacion broncograma aereo vidrio deslustrado reticular condensacion imagen radiologia","summary":"Distinguir el relleno del alveolo (consolidación, broncograma aéreo) del engrosamiento del intersticio (patrón reticular o en vidrio deslustrado).","sec":[{"h":"Patrón alveolar","b":"<ul><li>Ocupación del espacio aéreo: opacidad algodonosa, mal definida, que tiende a confluir.</li><li><b>Broncograma aéreo</b>: bronquios negros dentro de la zona blanca (signo típico de consolidación).</li><li>Causas: neumonía, edema, hemorragia alveolar.</li></ul>"},{"h":"Patrón intersticial","b":"<ul><li>Líneas y retículo fino, o vidrio deslustrado (aumento tenue de densidad sin borrar los vasos).</li><li>Causas: edema intersticial, fibrosis, infecciones atípicas/víricas.</li></ul>"}]},
{"id":"img-atelectasia-opaco","evidenceQuery":"atelectasis opaque hemithorax","cat":"imagen","title":"Atelectasia y hemitórax opaco","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"atelectasia colapso perdida volumen hemitorax opaco cisura desviacion mediastinica diafragma imagen radiologia","summary":"Signos de pérdida de volumen (atelectasia) y cómo orientar un hemitórax completamente blanco según hacia dónde se desvía el mediastino.","sec":[{"h":"Atelectasia (pérdida de volumen)","b":"<ul><li>Desplazamiento de cisuras, ascenso del hemidiafragma, agrupamiento de costillas.</li><li>El mediastino se desvía <b>hacia</b> el lado de la lesión.</li></ul>"},{"h":"Hemitórax opaco","b":"<ul><li>Si el mediastino se desvía <b>hacia</b> el lado opaco: atelectasia completa (p. ej. tapón mucoso, tumor bronquial).</li><li>Si se desvía <b>al lado contrario</b>: derrame masivo o masa que ocupa espacio.</li><li>Si está <b>centrado</b>: patología mixta o del propio parénquima.</li></ul>"}]},
{"id":"img-derrame-pleural","evidenceQuery":"pleural effusion imaging","cat":"imagen","title":"Derrame pleural","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"derrame pleural seno costofrenico menisco decubito lateral toracocentesis pleura liquido imagen radiologia","summary":"Reconocer líquido en la pleura: borramiento del seno costofrénico, curva de menisco y cómo confirmarlo.","sec":[{"h":"Signos","b":"<ul><li>Borramiento del seno costofrénico (el primer signo, con poca cantidad).</li><li>Opacidad de base con borde superior cóncavo (menisco de Damoiseau).</li><li>Derrame masivo: hemitórax opaco con desviación del mediastino al lado sano.</li></ul>"},{"h":"Confirmación","b":"<p>La proyección en decúbito lateral o la ecografía confirman líquido libre. La ecografía es de elección para guiar la toracocentesis.</p>"}]},
{"id":"img-neumotorax","evidenceQuery":"pneumothorax radiograph","cat":"imagen","title":"Neumotórax","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"neumotorax aire pleura linea pleural visceral tension urgencia drenaje imagen radiologia torax","summary":"Aire en la pleura: fina línea de pleura visceral con ausencia de trama pulmonar por fuera. El neumotórax a tensión es una urgencia vital.","sec":[{"h":"Signos","b":"<ul><li>Línea fina de pleura visceral paralela a la pared.</li><li>Ausencia de vasos por fuera de esa línea (área hiperclara).</li><li>Se ve mejor en el vértice y en espiración.</li></ul>"},{"h":"A tensión (emergencia)","b":"<ul><li>Desviación del mediastino al lado contrario, hemidiafragma aplanado o invertido, colapso pulmonar.</li><li>Clínica de shock: es un diagnóstico clínico; no esperar a la placa para descomprimir.</li></ul>"}]},
{"id":"img-nodulo-pulmonar","evidenceQuery":"solitary pulmonary nodule","cat":"imagen","title":"Nódulo pulmonar solitario","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"nodulo pulmonar solitario granuloma cancer pulmon benigno maligno calcificacion bordes crecimiento imagen radiologia","summary":"Opacidad redondeada única ≤3 cm rodeada de pulmón. Datos que orientan a benignidad frente a malignidad.","sec":[{"h":"Orientan a benignidad","b":"<ul><li>Bordes lisos y bien definidos.</li><li>Calcificación central, en palomitas o difusa.</li><li>Estabilidad en el tiempo (sin crecer en dos años).</li></ul>"},{"h":"Orientan a malignidad","b":"<ul><li>Bordes espiculados o lobulados.</li><li>Tamaño mayor y crecimiento en controles.</li><li>Factores de riesgo (tabaquismo, edad). Estudiar con TC.</li></ul>"}]},
{"id":"img-edema-icc","evidenceQuery":"pulmonary edema heart failure radiograph","cat":"imagen","title":"Edema pulmonar e insuficiencia cardíaca","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"edema pulmonar insuficiencia cardiaca icc redistribucion kerley cardiomegalia alas mariposa congestion imagen radiologia","summary":"Secuencia radiológica de la congestión: redistribución vascular, edema intersticial (líneas de Kerley) y edema alveolar en alas de mariposa.","sec":[{"h":"Progresión","b":"<ul><li>Cardiomegalia (índice cardiotorácico &gt;0,5).</li><li>Redistribución vascular hacia vértices.</li><li>Edema intersticial: líneas B de Kerley, borrosidad perihiliar.</li><li>Edema alveolar: patrón perihiliar en alas de mariposa.</li><li>Puede acompañarse de derrame pleural, más frecuente derecho.</li></ul>"}]},
{"id":"img-condensacion-neumonia","evidenceQuery":"pneumonia consolidation radiograph","cat":"imagen","title":"Condensación neumónica","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"neumonia condensacion consolidacion lobar broncograma aereo silueta infeccion imagen radiologia torax","summary":"Consolidación del espacio aéreo, habitualmente lobar, con broncograma aéreo; el signo de la silueta ayuda a localizarla.","sec":[{"h":"Hallazgos","b":"<ul><li>Opacidad homogénea que respeta límites lobares, con broncograma aéreo.</li><li>El derrame paraneumónico obliga a valorar toracocentesis si es significativo.</li></ul>"},{"h":"Localización","b":"<p>El signo de la silueta orienta el lóbulo: si se borra el borde cardíaco derecho, lóbulo medio; si se borra el hemidiafragma, lóbulos inferiores; si se borra el borde cardíaco izquierdo, língula.</p>"}]},
{"id":"img-signo-silueta","evidenceQuery":"silhouette sign chest radiograph","cat":"imagen","title":"Signo de la silueta y localización lobar","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"signo silueta localizacion lobar borde cardiaco diafragma lingula lobulo medio imagen radiologia","summary":"Cuando dos estructuras de igual densidad se tocan, se pierde el borde entre ellas: sirve para ubicar la lesión en profundidad.","sec":[{"h":"Regla","b":"<p>Si una opacidad borra el contorno de una estructura, está en contacto con ella (mismo plano). Si el contorno se conserva, la lesión está por delante o por detrás de esa estructura.</p>"},{"h":"Aplicación","b":"<ul><li>Borde cardíaco derecho borrado → lóbulo medio.</li><li>Borde cardíaco izquierdo borrado → língula.</li><li>Hemidiafragma borrado → lóbulo inferior correspondiente.</li></ul>"}]},
{"id":"img-abdomen-simple","evidenceQuery":"abdominal radiograph obstruction pneumoperitoneum","cat":"imagen","title":"Rx simple de abdomen: aire libre y obstrucción","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"abdomen simple neumoperitoneo aire libre obstruccion intestinal niveles hidroaereos asas dilatadas ileo imagen radiologia","summary":"Dos urgencias a reconocer en la placa de abdomen: aire libre (perforación) y patrón de obstrucción intestinal.","sec":[{"h":"Neumoperitoneo","b":"<ul><li>Aire libre subdiafragmático en bipedestación, o signo de Rigler (se ven ambas paredes del asa) en decúbito.</li><li>Sugiere perforación de víscera hueca: urgencia quirúrgica.</li></ul>"},{"h":"Obstrucción","b":"<ul><li>Asas dilatadas con niveles hidroaéreos en bipedestación.</li><li>Intestino delgado: central, con válvulas conniventes que cruzan toda el asa.</li><li>Colon: periférico, con haustras que no cruzan del todo.</li></ul>"}]},
{"id":"img-oseo-fractura","evidenceQuery":"fracture radiograph assessment","cat":"imagen","title":"Rx ósea: sistemática de la fractura","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"radiografia osea fractura cortical alineacion partes blandas fisis pediatria luxacion traumatologia imagen radiologia","summary":"Cómo revisar un hueso: continuidad de la cortical, línea de fractura, alineación y partes blandas; en niños vigilar la fisis.","sec":[{"h":"Qué mirar","b":"<ul><li>Cortical: buscar escalones o interrupciones.</li><li>Línea de fractura y desplazamiento o angulación.</li><li>Alineación de las articulaciones (descartar luxación).</li><li>Partes blandas: tumefacción, derrame articular (signo de la almohadilla grasa en codo).</li></ul>"},{"h":"Pediatría","b":"<p>Valorar el cartílago de crecimiento (fisis) y comparar con el lado sano si hay dudas. Dos proyecciones perpendiculares siempre.</p>"}]},
{"id":"img-lineas-dispositivos","evidenceQuery":"chest radiograph lines tubes devices","cat":"imagen","title":"Tubos, vías y dispositivos en la Rx de tórax","source":"Diagnóstico por Imagen · San Román (síntesis)","tags":"tet tubo endotraqueal sng via central marcapasos tubo torax posicion dispositivos comprobacion enfermeria imagen radiologia","summary":"Comprobar en la placa la posición correcta de los dispositivos que maneja enfermería y detectar complicaciones.","sec":[{"h":"Posiciones correctas","b":"<ul><li><b>TET</b>: punta 2-4 cm por encima de la carina; evitar intubación selectiva del bronquio derecho.</li><li><b>Vía central</b>: punta en cava superior, cerca de su unión con la aurícula.</li><li><b>SNG</b>: recorrido por línea media, punta bajo el diafragma en cámara gástrica.</li></ul>"},{"h":"Complicaciones a buscar","b":"<ul><li>Neumotórax tras colocar una vía central.</li><li>TET demasiado bajo (atelectasia contralateral) o alto (extubación).</li><li>Tubo torácico acodado o mal posicionado.</li></ul>"}]},
{"id":"euci-coma","evidenceQuery":"coma initial management","cat":"enfoqueuci","title":"Manejo inicial del paciente en coma","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"coma nivel conciencia glasgow causas estructurales metabolicas pupilas tronco enfoque uci critico","summary":"Aproximación ordenada al coma: estabilizar, valorar Glasgow y focalidad, y separar causas estructurales de metabólicas.","sec":[{"h":"Primero estabilizar","b":"<ul><li>ABC: proteger vía aérea si Glasgow ≤8, oxigenación, glucemia capilar inmediata.</li><li>Si sospecha de opiáceos, naloxona; tiamina antes que glucosa en alcohólicos/desnutridos.</li></ul>"},{"h":"Orientar la causa","b":"<ul><li><b>Estructural</b>: focalidad, asimetría pupilar, patrón respiratorio anómalo → neuroimagen urgente.</li><li><b>Metabólica/tóxica</b>: coma simétrico sin focalidad, pupilas reactivas → analítica, tóxicos, iones.</li></ul>"}]},
{"id":"euci-muerte-cerebral","evidenceQuery":"brain death criteria","cat":"enfoqueuci","title":"Muerte encefálica: criterios","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"muerte encefalica cerebral criterios coma arreactivo reflejos tronco test apnea confirmatorias enfoque uci","summary":"Diagnóstico clínico de muerte encefálica: coma arreactivo de causa conocida, ausencia de reflejos de tronco y test de apnea positivo.","sec":[{"h":"Requisitos previos","b":"<ul><li>Causa conocida e irreversible.</li><li>Excluir hipotermia, alteraciones metabólicas graves, tóxicos y sedantes que confundan la exploración.</li></ul>"},{"h":"Exploración","b":"<ul><li>Coma profundo sin respuesta.</li><li>Ausencia de reflejos de tronco: fotomotor, corneal, oculocefálico, oculovestibular, nauseoso y tusígeno.</li><li>Test de apnea positivo.</li><li>Pruebas instrumentales cuando la clínica no es valorable. El diagnóstico y la certificación siguen el protocolo legal vigente.</li></ul>"}]},
{"id":"euci-status","evidenceQuery":"status epilepticus management","cat":"enfoqueuci","title":"Estatus epiléptico","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"status estatus epileptico convulsivo benzodiacepinas escalonado antiepileptico anestesia enfoque uci critico","summary":"Crisis prolongada (≥5 min) o repetidas sin recuperación. Tratamiento escalonado y precoz para evitar daño neuronal.","sec":[{"h":"Escalones","b":"<ul><li><b>Inicial</b>: benzodiacepina (p. ej. diazepam o midazolam) con soporte de vía aérea y glucemia.</li><li><b>Segundo</b>: antiepiléptico IV (valproato, levetiracetam o fenitoína) según protocolo.</li><li><b>Refractario</b>: sedación anestésica e intubación en UCI, con monitorización.</li></ul>"},{"h":"Enfermería","b":"<p>Proteger de lesiones, oxígeno, acceso venoso, monitorización continua y control estricto de tiempos de cada fármaco.</p>"}]},
{"id":"euci-tce","evidenceQuery":"severe traumatic brain injury neuroprotection","cat":"enfoqueuci","title":"TCE grave: objetivos de neuroprotección","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"tce traumatismo craneoencefalico grave pic ppc pam neuroproteccion hipotension hipoxia enfoque uci critico","summary":"En el TCE grave el objetivo es evitar el daño secundario: mantener PIC, PPC y evitar hipotensión e hipoxia.","sec":[{"h":"Objetivos","b":"<ul><li>Evitar hipoxia (SatO2 &gt;94%) y evitar hipotensión (mantener presión arterial adecuada).</li><li>PIC por debajo de 22 mmHg; presión de perfusión cerebral en torno a 60-70 mmHg.</li><li>Cabecero a 30°, normocapnia, normotermia, analgosedación adecuada.</li></ul>"},{"h":"Medidas escalonadas","b":"<p>Ante hipertensión intracraneal: optimizar sedación, drenaje de LCR si hay ventriculostomía, osmoterapia (suero salino hipertónico o manitol) y, en casos refractarios, valorar medidas de segundo nivel.</p>"}]},
{"id":"euci-crisis-hta","evidenceQuery":"hypertensive emergency management","cat":"enfoqueuci","title":"Urgencia y emergencia hipertensiva","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"crisis hipertensiva urgencia emergencia dano organo diana pam descenso controlado enfoque uci critico","summary":"Distinguir la urgencia (cifras altas sin daño agudo de órgano) de la emergencia (con daño), porque el ritmo de descenso es distinto.","sec":[{"h":"Diferencia clave","b":"<ul><li><b>Urgencia</b>: PA muy elevada sin daño agudo de órgano diana. Descenso gradual, vía oral, en horas.</li><li><b>Emergencia</b>: daño agudo (encefalopatía, edema pulmonar, disección, eclampsia, SCA). Tratamiento IV en UCI.</li></ul>"},{"h":"Regla del descenso","b":"<p>En la emergencia, bajar la PAM en torno a un 20-25% en la primera hora (salvo excepciones como disección o ictus). Descensos bruscos pueden provocar isquemia.</p>"}]},
{"id":"euci-diseccion-aortica","evidenceQuery":"aortic dissection management","cat":"enfoqueuci","title":"Disección aórtica","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"diseccion aortica stanford a b dolor control frecuencia presion betabloqueante cirugia enfoque uci critico","summary":"Dolor torácico/dorsal intenso y migratorio. La clasificación de Stanford decide el manejo (quirúrgico vs. médico).","sec":[{"h":"Clasificación de Stanford","b":"<ul><li><b>Tipo A</b>: afecta a la aorta ascendente → suele ser quirúrgica urgente.</li><li><b>Tipo B</b>: no afecta a la ascendente → manejo médico salvo complicaciones.</li></ul>"},{"h":"Manejo médico inicial","b":"<p>Controlar primero la frecuencia con betabloqueante y luego la presión arterial, con analgesia potente. El objetivo es reducir la fuerza de eyección sobre la pared aórtica.</p>"}]},
{"id":"euci-sdra","evidenceQuery":"ARDS protective ventilation","cat":"enfoqueuci","title":"SDRA y ventilación protectora","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"sdra distres ventilacion protectora volumen tidal peso predicho presion meseta peep prono kirby pafi enfoque uci critico","summary":"Insuficiencia respiratoria hipoxémica con infiltrados bilaterales. La ventilación protectora reduce la mortalidad.","sec":[{"h":"Estrategia protectora","b":"<ul><li>Volumen tidal 6 ml/kg de peso predicho.</li><li>Presión meseta por debajo de 30 cmH2O.</li><li>PEEP ajustada; hipercapnia permisiva si es preciso.</li></ul>"},{"h":"Gravedad y medidas","b":"<p>Se clasifica por el índice PaO2/FiO2 (Kirby): &gt;300 sin SDRA, y leve/moderado/grave por debajo. En el grave, la posición en decúbito prono precoz mejora la oxigenación y la supervivencia.</p>"}]},
{"id":"euci-shock","evidenceQuery":"shock classification management","cat":"enfoqueuci","title":"Shock: clasificación y abordaje","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"shock hipovolemico cardiogenico distributivo obstructivo lactato perfusion vasopresores enfoque uci critico","summary":"Hipoperfusión tisular. Identificar el tipo guía el tratamiento; el lactato y la clínica marcan la respuesta.","sec":[{"h":"Cuatro grandes tipos","b":"<ul><li><b>Hipovolémico</b>: hemorragia o pérdidas → volumen.</li><li><b>Cardiogénico</b>: fallo de bomba → inotrópicos, evitar sobrecarga.</li><li><b>Distributivo</b>: séptico, anafiláctico, neurogénico → volumen y vasopresores.</li><li><b>Obstructivo</b>: taponamiento, TEP, neumotórax a tensión → resolver la causa.</li></ul>"},{"h":"Monitorización","b":"<p>Vigilar diuresis, relleno capilar, nivel de conciencia, lactato y aclaramiento del mismo como marcador de respuesta.</p>"}]},
{"id":"euci-sepsis","evidenceQuery":"sepsis septic shock management","cat":"enfoqueuci","title":"Sepsis y shock séptico","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"sepsis shock septico hemocultivos antibiotico precoz resucitacion noradrenalina lactato bundle enfoque uci critico","summary":"Disfunción orgánica por respuesta desregulada a la infección. Las primeras horas son decisivas.","sec":[{"h":"Actuación precoz","b":"<ul><li>Reconocer y activar el circuito de sepsis; medir lactato.</li><li>Extraer hemocultivos antes del antibiótico, pero sin retrasarlo.</li><li>Antibiótico de amplio espectro precoz.</li><li>Resucitación con cristaloides guiada por perfusión.</li></ul>"},{"h":"Vasopresores","b":"<p>Si persiste la hipotensión pese a volumen, noradrenalina como vasopresor de primera elección para mantener la presión de perfusión.</p>"}]},
{"id":"euci-sedoanalgesia","evidenceQuery":"sedation analgesia neuromuscular blockade ICU","cat":"enfoqueuci","title":"Sedoanalgesia y bloqueo neuromuscular","source":"Enfoque práctico en UCI · Sánchez y cols. (síntesis)","tags":"sedoanalgesia analgesia primero rass sedacion minima bloqueo neuromuscular ecash movilizacion enfoque uci critico","summary":"Filosofía de analgesia primero y mínima sedación (concepto eCASH), con el bloqueo neuromuscular reservado a indicaciones concretas.","sec":[{"h":"Principios","b":"<ul><li>Tratar primero el dolor; sedar lo mínimo necesario.</li><li>Objetivo habitual de RASS entre 0 y −2 (despierto y tranquilo), evitando la sobresedación.</li><li>Ventanas de sedación y movilización precoz cuando sea posible.</li></ul>"},{"h":"Bloqueo neuromuscular","b":"<p>Reservado a situaciones concretas (SDRA grave, asincronías refractarias). Siempre sobre una analgosedación adecuada, nunca como sustituto de ésta, y con monitorización.</p>"}]}
,
{"id":"uci-rcp-algoritmo","evidenceQuery":"advanced cardiac life support algorithm","cat":"uci","title":"RCP avanzado — Algoritmo universal con dosis","source":"Manual Algoritmos UCI · ERC/AHA","tags":"rcp parada cardiorrespiratoria pcr adrenalina amiodarona algoritmo universal sva reanimacion uci critico dosis","summary":"Algoritmo completo de SVA con dosis exactas de Adrenalina 1 mg cada 3-5 min y Amiodarona 300 mg tras el 3er choque.","sec":[{"h":"Reconocimiento y activación","b":"<ul><li>Paciente inconsciente + no respira / respiración agónica → activar equipo de RCP.</li><li>Iniciar <b>compresiones inmediatas</b>: profundidad 5-6 cm, frecuencia 100-120/min, permitir reexpansión completa, minimizar interrupciones (&lt;10 s).</li><li>Relación 30:2 sin vía aérea avanzada. Con IOT: compresiones continuas + 10 ventilaciones/min.</li></ul>"},{"h":"Analizar ritmo (cada 2 min)","b":"<ul><li><b>Ritmo desfibrilable</b> (FV / TVSP) → <b>choque</b> + RCP 2 min.</li><li><b>Ritmo NO desfibrilable</b> (Asistolia / AESP) → RCP 2 min + Adrenalina inmediata.</li></ul>"},{"h":"Fármacos en FV/TVSP","b":"<ul><li><b>Adrenalina 1 mg IV/IO</b> tras el <b>3er choque</b>, y después cada 3-5 min (cada 2 ciclos).</li><li><b>Amiodarona 300 mg IV/IO</b> en bolo tras el 3er choque (diluir en 20 mL SG5%). Segunda dosis <b>150 mg</b> tras el 5º choque.</li><li>Alternativa: <b>Lidocaína 1-1.5 mg/kg</b> IV/IO si no hay amiodarona.</li></ul>"},{"h":"Fármacos en Asistolia/AESP","b":"<ul><li><b>Adrenalina 1 mg IV/IO tan pronto como sea posible</b>, después cada 3-5 min.</li><li>NO indicada la atropina en asistolia (retirada de las guías desde 2010).</li></ul>"},{"h":"Vía aérea y monitorización","b":"<ul><li>Ventilar con bolsa-mascarilla con reservorio + O2 a 15 L/min hasta IOT.</li><li>Tras IOT: capnografía continua. <b>ETCO2 &lt;10 mmHg</b> → RCP inadecuada. <b>Aumento brusco de ETCO2</b> → posible RCE (retorno de circulación espontánea).</li></ul>"}]},
{"id":"uci-rcp-desfibrilables","evidenceQuery":"ventricular fibrillation defibrillation","cat":"uci","title":"Ritmos desfibrilables (FV / TVSP)","source":"Manual Algoritmos UCI · ERC/AHA","tags":"fv fibrilacion ventricular tvsp taquicardia sin pulso desfibrilable choque energia bifasico monofasico uci critico rcp","summary":"Choque inmediato con máxima energía disponible, retomar compresiones sin comprobar pulso.","sec":[{"h":"Energía del choque","b":"<ul><li><b>Bifásico</b>: primer choque <b>150-200 J</b> (según fabricante); segundos choques <b>200-360 J</b>.</li><li><b>Monofásico</b>: <b>360 J</b> en todos los choques.</li><li><b>Pediátrico</b>: 4 J/kg (hasta 10 J/kg si no responde).</li></ul>"},{"h":"Secuencia","b":"<ol><li>Cargar durante compresiones.</li><li>Choque único a máxima energía disponible.</li><li>Reanudar compresiones INMEDIATAMENTE (sin comprobar pulso).</li><li>Analizar ritmo a los 2 minutos.</li><li>Repetir hasta RCE o parada de RCP.</li></ol>"},{"h":"Puntos críticos","b":"<ul><li>No retrasar el choque para intubación o vía.</li><li>Minimizar pausa peri-choque (&lt;5 s).</li><li>Comprobar pulso solo si se ve ritmo organizado tras 2 min de RCP.</li></ul>"}]},
{"id":"uci-rcp-no-desfibrilables","evidenceQuery":"asystole pulseless electrical activity","cat":"uci","title":"Ritmos NO desfibrilables (Asistolia / AESP)","source":"Manual Algoritmos UCI · ERC/AHA","tags":"asistolia aesp actividad electrica sin pulso no desfibrilable adrenalina causas reversibles uci critico rcp","summary":"Peor pronóstico, priorizar RCP de calidad y búsqueda activa de causa reversible.","sec":[{"h":"Actuación","b":"<ul><li>RCP inmediata 30:2 hasta vía aérea avanzada.</li><li><b>Adrenalina 1 mg IV/IO cuanto antes</b>, después cada 3-5 min.</li><li>Confirmar asistolia: comprobar cables, ganancia, dos derivaciones.</li><li><b>Buscar y tratar la causa</b>: es la única posibilidad real de RCE.</li></ul>"},{"h":"AESP: pistas clínicas","b":"<ul><li>QRS estrecho + FC rápida → mecánica (hipovolemia, taponamiento, neumotórax, TEP).</li><li>QRS ancho + FC lenta → metabólica (hipoxia, acidosis, hiperK, tóxicos).</li></ul>"}]},
{"id":"uci-rcp-4h-4t","evidenceQuery":"reversible causes cardiac arrest","cat":"uci","title":"Causas reversibles: 4H y 4T","source":"Manual Algoritmos UCI · ERC/AHA","tags":"causas reversibles 4h 4t hipoxia hipovolemia hipotermia hiperpotasemia neumotorax taponamiento tromboembolismo toxicos uci critico rcp","summary":"Búsqueda sistemática de causas reversibles durante toda la RCP.","sec":[{"h":"4 H","b":"<ul><li><b>Hipoxia</b>: O2 100%, comprobar posición TET, capnografía.</li><li><b>Hipovolemia</b>: cristaloides IV rápidos, buscar hemorragia oculta.</li><li><b>Hipo/Hiperpotasemia (y otros iones)</b>: <br>• HiperK → Gluconato Ca 10% 10 mL + Insulina 10 UI + Glucosa 25 g + Bicarbonato.<br>• HipoK → KCl IV con precaución.</li><li><b>Hipotermia</b>: recalentamiento activo, RCP prolongada (no muerto hasta calentar &gt;35°C).</li></ul>"},{"h":"4 T","b":"<ul><li><b>Tromboembolismo (TEP)</b>: fibrinolisis empírica con <b>Alteplase 50 mg IV bolo</b> (o 100 mg en 15 min), RCP mínimo 60-90 min tras fibrinolisis.</li><li><b>Taponamiento cardíaco</b>: pericardiocentesis ecoguiada.</li><li><b>Tóxicos</b>: antídotos específicos (naloxona, flumazenil, bicarbonato, intralipid).</li><li><b>Neumotórax a tensión</b>: toracocentesis inmediata 2º EIC línea medioclavicular con Abbocath 14G.</li></ul>"}]},
{"id":"uci-post-parada","evidenceQuery":"post cardiac arrest care","cat":"uci","title":"Cuidados post-parada cardíaca (RCE)","source":"Manual Algoritmos UCI · ERC/AHA","tags":"rce post parada cuidados sindrome post reanimacion targeted temperature management ttm hipotermia terapeutica coronariografia uci critico","summary":"Objetivos: normoxia, normocapnia, TAM ≥65 mmHg, control estricto de temperatura, coronariografía urgente si sospecha coronaria.","sec":[{"h":"Objetivos hemodinámicos","b":"<ul><li>TAM ≥65 mmHg (evitar hipotensión).</li><li>SpO2 94-98% (evitar hiperoxia).</li><li>PaCO2 35-45 mmHg (normocapnia estricta).</li><li>Glucemia 140-180 mg/dL, evitar hipoglucemia.</li></ul>"},{"h":"Control de temperatura (TTM)","b":"<ul><li>Objetivo: <b>32-36°C durante ≥24 h</b> en comatosos tras RCE.</li><li>Prevenir fiebre las siguientes 72 h.</li><li>Sedoanalgesia + bloqueo neuromuscular si es preciso para evitar escalofríos.</li></ul>"},{"h":"Coronariografía","b":"<ul><li>Urgente si SCACEST evidente en ECG post-RCE.</li><li>Considerar en las primeras horas si causa cardíaca sospechada.</li></ul>"},{"h":"Pronóstico neurológico","b":"<ul><li>NO evaluar antes de 72 h desde RCE (o 72 h post-normotermia si TTM).</li><li>Multimodal: exploración, EEG, potenciales evocados, NSE, TC/RM.</li></ul>"}]},
{"id":"uci-sdra-berlin","evidenceQuery":"ARDS Berlin definition","cat":"uci","title":"SDRA — Criterios de Berlín","source":"Manual Algoritmos UCI · ARDS Definition Task Force","tags":"sdra distres respiratorio agudo berlin criterios pafi kirby ards leve moderado grave uci critico","summary":"Los 4 criterios de Berlín (2012) para el diagnóstico y estratificación del SDRA.","sec":[{"h":"Los 4 criterios (todos deben cumplirse)","b":"<ol><li><b>Tiempo</b>: inicio en la semana previa al insulto o empeoramiento respiratorio.</li><li><b>Imagen</b>: infiltrados bilaterales en Rx/TC no explicables por derrame, atelectasia o nódulos.</li><li><b>Origen del edema</b>: no explicado completamente por insuficiencia cardíaca o sobrecarga (valorar con eco si no hay factor de riesgo evidente).</li><li><b>Oxigenación</b> (con PEEP o CPAP ≥5 cmH2O):<br>• <b>Leve</b>: PaO2/FiO2 200-300<br>• <b>Moderado</b>: PaO2/FiO2 100-200<br>• <b>Grave</b>: PaO2/FiO2 ≤100</li></ol>"},{"h":"Factores de riesgo comunes","b":"<ul><li><b>Directos</b>: neumonía, aspiración, contusión pulmonar, inhalación, ahogamiento.</li><li><b>Indirectos</b>: sepsis, shock, pancreatitis, politransfusión (TRALI), quemaduras, cirugía mayor.</li></ul>"}]},
{"id":"uci-sdra-ventilacion-protectora","evidenceQuery":"ARDS protective ventilation prone positioning","cat":"uci","title":"SDRA — Ventilación protectora y prono","source":"Manual Algoritmos UCI · ARDSnet + PROSEVA","tags":"sdra ventilacion protectora volumen tidal peso predicho meseta plateau peep prono decubito prono relajacion neuromuscular uci critico","summary":"Vt 6 mL/kg peso predicho, Pmeseta <30, prono precoz si PaFi <150.","sec":[{"h":"Ventilación protectora (ARDSnet)","b":"<ul><li><b>Volumen tidal 6 mL/kg peso PREDICHO</b> (no real).<br>• Hombre: 50 + 0.91×(altura cm − 152.4)<br>• Mujer: 45.5 + 0.91×(altura cm − 152.4)</li><li><b>Presión meseta &lt;30 cmH2O</b> (mejor &lt;28).</li><li><b>Driving pressure = Pmeseta − PEEP &lt;15 cmH2O</b>.</li><li><b>PEEP</b> ajustada según tabla FiO2/PEEP (PEEP alta si SDRA moderado-grave).</li><li>FR 20-35 rpm, permitir <b>hipercapnia permisiva</b> hasta pH ≥7.20.</li><li>SpO2 objetivo 88-95%, PaO2 55-80 mmHg.</li></ul>"},{"h":"Decúbito prono (PROSEVA)","b":"<ul><li>Indicación: <b>PaFi &lt;150</b> con FiO2 ≥0.6 y PEEP ≥5.</li><li>Duración: <b>≥16 h consecutivas</b>.</li><li>Se mantiene hasta PaFi &gt;150 en supino ≥4 h.</li><li>Complicaciones: úlceras faciales, extubación accidental, salida de vías/drenajes.</li></ul>"},{"h":"Bloqueo neuromuscular","b":"<ul><li>Considerar <b>Cisatracurio</b> perfusión primeras 48 h en SDRA grave (PaFi &lt;120) con sedación profunda RASS -5.</li></ul>"}]},
{"id":"uci-hiperpotasemia","evidenceQuery":"hyperkalemia management","cat":"uci","title":"Hiperpotasemia — Protocolo de emergencia","source":"Manual Algoritmos UCI · KDIGO","tags":"hiperpotasemia hiperkalemia potasio elevado emergencia gluconato calcio insulina bicarbonato dialisis ecg t picuda uci critico","summary":"K+ >6.5 mEq/L o cambios ECG: gluconato cálcico + insulina/glucosa + salbutamol ± bicarbonato ± diálisis.","sec":[{"h":"Clasificación y ECG","b":"<ul><li><b>Leve</b>: 5.5-5.9 mEq/L</li><li><b>Moderada</b>: 6.0-6.4 mEq/L</li><li><b>Grave</b>: ≥6.5 mEq/L o cualquier cifra con cambios ECG</li></ul><p>Cambios ECG progresivos: T picudas → PR alargado → P plana → QRS ancho → onda sinusoidal → FV/asistolia.</p>"},{"h":"1. Estabilización de membrana (primero, si ECG alterado o K ≥6.5)","b":"<ul><li><b>Gluconato cálcico 10% 10 mL IV en 2-5 min</b> (o Cloruro cálcico 10% 5-10 mL por vía central).</li><li>Inicio en 1-3 min, duración 30-60 min. Repetir si persisten cambios ECG.</li><li>NO baja el K, solo protege el miocardio.</li></ul>"},{"h":"2. Redistribución intracelular","b":"<ul><li><b>Insulina rápida 10 UI IV + Glucosa 25 g (50 mL SG50% o 250 mL SG10%)</b>. Baja K 0.5-1.2 mEq/L en 15-30 min. Vigilar glucemia 1-6 h.</li><li><b>Salbutamol 10-20 mg nebulizado</b> (o 0.5 mg IV). Baja K 0.5-1 mEq/L en 30 min. Aditivo con insulina.</li><li><b>Bicarbonato 1 M 50-100 mEq IV</b> solo si <b>acidosis metabólica</b> concomitante.</li></ul>"},{"h":"3. Eliminación","b":"<ul><li><b>Furosemida 40-80 mg IV</b> si función renal conservada.</li><li><b>Resinas de intercambio</b> (Resincalcio 15-30 g VO/VR): efecto en horas.</li><li><b>Patiromer / Zirconio ciclosilicato</b>: nuevos quelantes (mantenimiento).</li><li><b>Hemodiálisis urgente</b> si: refractario, IRC/IRA, sobrecarga hídrica, K &gt;7 con ECG grave.</li></ul>"}]},
{"id":"uci-hipopotasemia","evidenceQuery":"hypokalemia replacement","cat":"uci","title":"Hipopotasemia — Reposición IV","source":"Manual Algoritmos UCI · KDIGO","tags":"hipopotasemia hipokalemia potasio bajo reposicion kcl velocidad maxima uci critico ecg u onda","summary":"Reposición según déficit, ritmo máximo por vía periférica y central, siempre con Mg corregido.","sec":[{"h":"Clasificación","b":"<ul><li>Leve: 3.0-3.4 mEq/L</li><li>Moderada: 2.5-2.9 mEq/L</li><li>Grave: &lt;2.5 mEq/L o síntomas (arritmias, parálisis, rabdomiólisis)</li></ul><p>ECG: onda U, T aplanada, descenso ST, prolongación QT → arritmias ventriculares.</p>"},{"h":"Reposición IV","b":"<ul><li><b>Vía periférica</b>: máximo <b>10 mEq/h</b> y concentración ≤40 mEq/L (irritante).</li><li><b>Vía central</b>: máximo <b>20 mEq/h</b> (excepcionalmente 40 mEq/h con monitorización ECG continua).</li><li>Ejemplo: <b>KCl 20 mEq en 100 mL SF a pasar en 1 h</b> por central.</li><li>Reevaluar K cada 2-4 h en grave.</li></ul>"},{"h":"Puntos clave","b":"<ul><li><b>SIEMPRE corregir Mg</b> antes o simultáneamente (hipoMg impide corregir hipoK).</li><li>Evitar reposición con suero glucosado (estimula insulina, empeora hipoK).</li><li>Vía oral en leves: KCl 40-80 mEq/día en varias tomas.</li></ul>"}]},
{"id":"uci-hiponatremia","evidenceQuery":"hyponatremia correction","cat":"uci","title":"Hiponatremia — Algoritmo y corrección","source":"Manual Algoritmos UCI · Guías europeas 2014","tags":"hiponatremia sodio bajo siadh mielinolisis pontina osmolaridad hipovolemica hipervolemica euvolemica salino hipertonico uci critico","summary":"Clasificación por volemia y osmolaridad, corrección lenta para evitar mielinolisis pontina.","sec":[{"h":"Clasificación","b":"<ul><li><b>Leve</b>: 130-135 mEq/L</li><li><b>Moderada</b>: 125-129 mEq/L</li><li><b>Grave</b>: &lt;125 mEq/L</li><li><b>Aguda</b>: &lt;48 h; <b>crónica</b>: ≥48 h o desconocida.</li></ul>"},{"h":"Clasificación por volemia (tras Osm plasma y orina)","b":"<ul><li><b>Hipovolémica</b>: pérdidas GI/renales/3er espacio → SF 0.9% para reponer volumen.</li><li><b>Euvolémica</b>: SIADH, hipotiroidismo, insuficiencia suprarrenal → restricción hídrica + tratar causa.</li><li><b>Hipervolémica</b>: IC, cirrosis, sd. nefrótico → restricción hídrica + diuréticos de asa.</li></ul>"},{"h":"Síntomas graves (encefalopatía)","b":"<ul><li>Convulsiones, coma, vómitos, herniación → tratar YA, independientemente de volemia.</li><li><b>Suero salino hipertónico 3%: bolo 150 mL en 10 min</b>, repetir hasta 3 veces o hasta subir Na 5 mEq/L.</li><li>Meta inicial: elevar Na 4-6 mEq/L primeras horas.</li></ul>"},{"h":"Límites de corrección (evitar mielinolisis)","b":"<ul><li><b>Máximo 10 mEq/L en 24 h</b>.</li><li><b>Máximo 18 mEq/L en 48 h</b>.</li><li>En riesgo (Na &lt;105, hipoK, malnutrición, alcohol, hepatopatía): máximo 8 mEq/L/24 h.</li><li>Si sobrecorrección → suero glucosado 5% ± DDAVP para bajar de nuevo.</li></ul>"}]},
{"id":"uci-hipernatremia","evidenceQuery":"hypernatremia correction","cat":"uci","title":"Hipernatremia — Corrección","source":"Manual Algoritmos UCI · Nefrología clínica","tags":"hipernatremia sodio elevado diabetes insipida deficit agua libre correccion lenta edema cerebral uci critico","summary":"Reponer agua libre calculando déficit; corrección lenta ≤10 mEq/L/día.","sec":[{"h":"Causas","b":"<ul><li>Pérdida de agua: sudor, fiebre, quemados, diarrea osmótica, diuresis osmótica (hiperglucemia, manitol).</li><li>Diabetes insípida central o nefrogénica.</li><li>Falta de aporte (ancianos, ventilados sin acceso a agua).</li><li>Aporte excesivo Na: bicarbonato, suero hipertónico.</li></ul>"},{"h":"Cálculo del déficit de agua libre","b":"<p><b>Déficit = 0.6 × peso × [(Na actual / 140) − 1]</b></p><p>Ejemplo: 70 kg, Na 160 → 0.6 × 70 × (160/140 − 1) = 6 L de déficit.</p>"},{"h":"Corrección","b":"<ul><li>Vía oral/SNG preferente con agua libre.</li><li>IV: suero glucosado 5% o hipotónico (0.45% NaCl).</li><li><b>Máximo 10 mEq/L en 24 h</b> (evitar edema cerebral).</li><li>En hipernatremia aguda (&lt;48 h) se puede corregir más rápido.</li><li>Diabetes insípida central: DDAVP.</li></ul>"}]},
{"id":"uci-hipomg-hipoca","evidenceQuery":"hypomagnesemia hypocalcemia management","cat":"uci","title":"Hipomagnesemia e hipocalcemia","source":"Manual Algoritmos UCI · Nefrología clínica","tags":"hipomagnesemia magnesio hipocalcemia calcio ionico gluconato sulfato magnesio torsades qt largo uci critico","summary":"HipoMg y hipoCa suelen coexistir; reposición IV en sintomáticos o graves.","sec":[{"h":"Hipomagnesemia","b":"<ul><li>Normal: 1.7-2.4 mg/dL (1.5-2.5 mEq/L).</li><li>Síntomas: arritmias (torsades), tetania, temblor, convulsiones.</li><li>Grave/sintomática: <b>Sulfato de magnesio 1-2 g IV en 15 min</b>, luego 4-8 g/24 h en perfusión.</li><li>Torsades de Pointes: <b>Sulfato Mg 2 g IV bolo</b> aunque Mg normal.</li></ul>"},{"h":"Hipocalcemia","b":"<ul><li>Medir <b>calcio iónico</b> (más fiable que total; corregir por albúmina si no).</li><li>Ca corregido = Ca total + 0.8 × (4 − albúmina)</li><li>Síntomas: parestesias, tetania, Chvostek/Trousseau, laringoespasmo, QT largo.</li><li>Grave/sintomática: <b>Gluconato cálcico 10% 10-20 mL IV en 10 min</b>, luego perfusión 0.5-1.5 mg/kg/h Ca elemental.</li><li>Corregir siempre <b>Mg y vitamina D</b> asociados.</li></ul>"}]},
{"id":"uci-ira-kdigo","evidenceQuery":"acute kidney injury KDIGO","cat":"uci","title":"Insuficiencia renal aguda — Clasificación KDIGO","source":"Manual Algoritmos UCI · KDIGO 2012","tags":"ira insuficiencia renal aguda kdigo akin creatinina diuresis oliguria estadios uci critico","summary":"Estadios KDIGO por creatinina y diuresis; el más alto de los dos define el grado.","sec":[{"h":"Criterios KDIGO (2012)","b":"<ul><li><b>Estadio 1</b>: Cr ×1.5-1.9 basal o ↑ ≥0.3 mg/dL en 48 h; diuresis &lt;0.5 mL/kg/h × 6-12 h.</li><li><b>Estadio 2</b>: Cr ×2.0-2.9 basal; diuresis &lt;0.5 mL/kg/h × ≥12 h.</li><li><b>Estadio 3</b>: Cr ×3 basal o ≥4 mg/dL o inicio de TRR; diuresis &lt;0.3 mL/kg/h × ≥24 h o anuria ≥12 h.</li></ul>"},{"h":"Clasificación etiológica","b":"<ul><li><b>Prerrenal (55-60%)</b>: hipovolemia, shock, IC, sd. hepatorrenal.</li><li><b>Renal / intrínseca (35-40%)</b>: NTA (isquémica o tóxica), GN, NIA.</li><li><b>Postrenal (5%)</b>: uropatía obstructiva.</li></ul>"},{"h":"Actuación inicial","b":"<ul><li>Descartar obstrucción (eco vía urinaria).</li><li>Retirar/ajustar nefrotóxicos: AINE, IECA/ARA-II, contrastes, aminoglucósidos, vanco.</li><li>Optimizar hemodinámica: TAM ≥65, evitar sobrecarga.</li><li>Solicitar sedimento, iones en orina, FENa.</li></ul>"}]},
{"id":"uci-fena","evidenceQuery":"fractional excretion sodium acute kidney injury","cat":"uci","title":"FENa y diagnóstico diferencial prerrenal vs. NTA","source":"Manual Algoritmos UCI · Nefrología clínica","tags":"fena fraccion excretada sodio prerrenal renal nta necrosis tubular aguda feurea diagnostico diferencial uci critico ira","summary":"FENa <1% sugiere prerrenal; >2% sugiere NTA (renal).","sec":[{"h":"Fórmula","b":"<p><b>FENa (%) = [(Na orina × Cr plasma) / (Na plasma × Cr orina)] × 100</b></p><p>Necesita: Na y Cr en plasma y orina simultáneos, en muestra aleatoria.</p>"},{"h":"Interpretación","b":"<ul><li><b>FENa &lt;1%</b>: prerrenal (riñón conservando Na). También: sd. hepatorrenal, GN aguda, NIA temprana, contraste.</li><li><b>FENa &gt;2%</b>: NTA / renal intrínseca (riñón no puede reabsorber).</li><li><b>Zona gris 1-2%</b>: valorar contexto clínico.</li></ul>"},{"h":"FEUrea (si diurético)","b":"<ul><li>Si el paciente lleva diurético, FENa no es válido. Usar <b>FEUrea</b>:</li><li>FEUrea = [(Urea orina × Cr plasma) / (Urea plasma × Cr orina)] × 100</li><li><b>FEUrea &lt;35%</b>: prerrenal.</li><li><b>FEUrea &gt;50%</b>: NTA.</li></ul>"},{"h":"Otros índices en prerrenal","b":"<ul><li>Osm orina &gt;500 mOsm/kg.</li><li>Cr orina / Cr plasma &gt;40.</li><li>Urea/Cr plasma &gt;40.</li><li>Na orina &lt;20 mEq/L.</li></ul>"}]},
{"id":"uci-dialisis-indicaciones","evidenceQuery":"renal replacement therapy indications","cat":"uci","title":"Indicaciones de terapia de reemplazo renal (TRR)","source":"Manual Algoritmos UCI · KDIGO","tags":"dialisis trr terapia reemplazo renal hemodialisis hemofiltracion aeiou indicaciones urgencia uci critico ira","summary":"Regla AEIOU para indicación urgente; individualizar timing en el paciente crítico.","sec":[{"h":"Regla AEIOU (indicaciones absolutas de urgencia)","b":"<ul><li><b>A — Acidosis metabólica</b> refractaria (pH &lt;7.15 pese a tratamiento).</li><li><b>E — Electrolitos</b>: hiperK refractaria (K &gt;6.5 o cambios ECG que no ceden).</li><li><b>I — Intoxicaciones</b> dializables: metanol, etilenglicol, litio, salicilatos, valproato, metformina.</li><li><b>O — Overload (sobrecarga hídrica)</b> refractaria a diuréticos, especialmente con EAP.</li><li><b>U — Uremia sintomática</b>: pericarditis, encefalopatía, hemorragia urémica; o urea &gt;180-200 mg/dL.</li></ul>"},{"h":"Modalidad en UCI","b":"<ul><li><b>TCRR (continua)</b>: preferible en inestabilidad hemodinámica, edema cerebral, insuficiencia hepática grave.</li><li><b>HD intermitente</b>: paciente estable o intoxicación aguda con necesidad de aclaramiento rápido.</li><li><b>SLED</b>: híbrida, útil en unidades sin capacidad continua 24 h.</li></ul>"},{"h":"Anticoagulación del circuito","b":"<ul><li><b>Citrato regional</b>: de elección (menos sangrado, mayor duración del filtro). Vigilar Ca iónico y cociente Ca total/iónico.</li><li>Heparina no fraccionada si contraindicado citrato.</li><li>Sin anticoagulación si alto riesgo hemorrágico.</li></ul>"}]},
{"id":"uci-sepsis-bundle-1h","evidenceQuery":"sepsis hour-1 bundle","cat":"uci","title":"Sepsis — Bundle 1 hora (Surviving Sepsis)","source":"Surviving Sepsis Campaign 2021 · con el marco de NICE NG253 (2025) en paralelo","tags":"sepsis shock septico bundle 1 hora surviving campaign lactato hemocultivos antibiotico cristaloides noradrenalina qsofa sofa uci critico nice ng253 news2 bolo 250 ml fluidoterapia codigo sepsis","summary":"Bundle de Surviving Sepsis 2021, con el marco de NICE NG253 al lado: difieren en el volumen del bolo y en cuándo arranca el reloj del antibiótico.","sec":[{"h":"Reconocimiento","b":"<ul><li><b>Sepsis</b>: infección + SOFA ≥2 puntos (o incremento ≥2 desde basal).</li><li><b>Shock séptico</b>: sepsis + hipotensión que requiere vasopresores para TAM ≥65 <b>Y</b> lactato &gt;2 mmol/L, pese a resucitación con volumen.</li><li>Cribado prehospitalario/planta: <b>qSOFA ≥2</b> (TAS ≤100, FR ≥22, alteración mental).</li></ul>"},{"h":"Bundle de la 1ª hora (5 medidas)","b":"<ol><li><b>Medir lactato</b>. Repetir en 2-4 h si &gt;2.</li><li><b>Extraer hemocultivos ANTES del antibiótico</b> (sin retrasarlo &gt;45 min).</li><li><b>Antibiótico de amplio espectro precoz</b> (en la 1ª hora).</li><li><b>Cristaloides 30 mL/kg IV</b> en las primeras 3 h si hipotensión o lactato ≥4 (Ringer Lactato mejor que SF).</li><li><b>Vasopresores</b> si hipotensión persiste tras volumen: <b>Noradrenalina</b> objetivo TAM ≥65 mmHg (empezar por vía periférica si es preciso hasta central).</li></ol>"},{"h":"⚠️ Fluidoterapia: dos marcos vigentes, no son intercambiables","b":"<p>Esta ficha sigue el bundle de <b>Surviving Sepsis Campaign 2021</b>, que es el marco con el que trabaja la app. <b>NICE NG253</b> (británica, 19/11/2025, sustituye a NG51) plantea una pauta distinta. Se muestran las dos <b>identificadas por su fuente</b>; cuál aplica depende del protocolo de tu centro.</p><ul><li><b>Surviving Sepsis Campaign 2021:</b> cristaloides <b>30 mL/kg IV en las primeras 3 h</b> si hipotensión o lactato ≥4.</li><li><b>NICE NG253:</b> <i>«give an initial bolus of 250 ml. Ideally, give this over 10 to 15 minutes»</i>, con reevaluación tras cada bolo y hasta <b>1.000 mL</b> orientativos.</li></ul><p>No es un matiz de redacción: en un paciente de 70 kg son <b>2.100 mL en 3 h</b> frente a <b>250 mL reevaluando</b>. Antes de aplicar una u otra, comprueba qué dice el Código Sepsis de tu hospital.</p>"},{"h":"⚠️ El reloj del antibiótico: desde qué momento","b":"<ul><li><b>Surviving Sepsis 2021:</b> antibiótico de amplio espectro <b>en la primera hora desde el reconocimiento</b> de la sepsis.</li><li><b>NICE NG253:</b> <i>«broad-spectrum intravenous antibiotic treatment, within 1 hour of calculating the person\'s NEWS2 score on initial assessment in the emergency department or on ward deterioration»</i> — la hora cuenta <b>desde el cálculo del NEWS2</b>, no desde el triaje ni desde la sospecha.</li></ul><p>NG253 además usa el NEWS2 como criterio explícito de cribado: <i>«use the national early warning score (NEWS2) to assess people with suspected sepsis who are aged 16 or over»</i>, en hospital de agudos, salud mental y ambulancias. La app usa hoy <b>qSOFA</b> para ese cribado.</p><p><small>Fuentes: Surviving Sepsis Campaign 2021 · NICE NG253 (2025). Decidir el marco aplicable es una decisión de protocolo, no de esta ficha.</small></p>"},{"h":"Otros puntos","b":"<ul><li>Control del foco lo antes posible (drenaje, cirugía, retirada de catéter).</li><li>Corticoides (Hidrocortisona 200 mg/día) si shock séptico refractario a NA.</li><li>Ventilación protectora si SDRA asociado.</li><li>Control glucémico 140-180 mg/dL.</li></ul>"}]},
{"id":"uci-sepsis-antibiotico","evidenceQuery":"empirical antibiotic therapy sepsis","cat":"uci","title":"Antibioterapia empírica en sepsis por foco","source":"Manual Algoritmos UCI · Surviving Sepsis + protocolos locales","tags":"sepsis antibiotico empirico foco abdominal respiratorio urinario piel partes blandas meningitis neutropenia catetervascular uci critico","summary":"Elección empírica según foco, gravedad, factores locales y ajuste tras antibiograma en 48-72 h.","sec":[{"h":"Foco desconocido / paciente crítico","b":"<ul><li><b>Piperacilina-Tazobactam 4/0.5 g c/6-8 h</b> o <b>Meropenem 1 g c/8 h</b> (si multirresistente sospechado o BLEE).</li><li>Añadir <b>Vancomicina 25-30 mg/kg carga → 15-20 mg/kg c/8-12 h</b> (o Linezolid) si sospecha SARM.</li></ul>"},{"h":"Foco respiratorio (NAC grave / NIH)","b":"<ul><li>NAC grave: Ceftriaxona 2 g/día + Azitromicina o Levofloxacino 750 mg/día.</li><li>NIH / NAVM: Piperacilina-Tazobactam o Meropenem + Vancomicina/Linezolid ± Amikacina.</li></ul>"},{"h":"Foco abdominal","b":"<ul><li>Piperacilina-Tazobactam o Meropenem.</li><li>Añadir Fluconazol si sospecha candidiasis (recurrente, inmunosupresión, cirugía previa).</li></ul>"},{"h":"Foco urinario","b":"<ul><li>Ceftriaxona 2 g/día o Piperacilina-Tazobactam.</li><li>Si multirresistente: Meropenem.</li></ul>"},{"h":"Piel y partes blandas / fascitis necrotizante","b":"<ul><li>Piperacilina-Tazobactam + Clindamicina 600 mg c/8 h (antitoxina) + Vancomicina/Linezolid.</li><li>Cirugía urgente si fascitis.</li></ul>"},{"h":"Meningitis bacteriana","b":"<ul><li><b>Ceftriaxona 2 g c/12 h + Vancomicina 15 mg/kg c/8 h + Ampicilina 2 g c/4 h</b> (Listeria en &gt;50 años o inmunodeprimidos).</li><li><b>Dexametasona 10 mg c/6 h</b> antes o con el primer antibiótico.</li></ul>"},{"h":"Neutropenia febril","b":"<ul><li>Piperacilina-Tazobactam o Cefepime o Meropenem monoterapia.</li><li>Vancomicina si sospecha catéter, mucositis o SARM.</li></ul>"}]},
{"id":"uci-acv-codigo-ictus","evidenceQuery":"acute ischemic stroke management","cat":"uci","title":"ACV isquémico — Código ictus y ventanas","source":"Manual Algoritmos UCI · AHA/ASA + SEN","tags":"acv ictus isquemico codigo ictus ventana terapeutica fibrinolisis trombectomia dwi flair mismatch nihss uci critico","summary":"Ventana de 4.5 h para trombolisis IV y hasta 24 h para trombectomía en oclusiones de gran vaso seleccionadas.","sec":[{"h":"Reconocimiento y activación","b":"<ul><li>Escala prehospitalaria: <b>Cincinnati</b> (asimetría facial, debilidad braquial, disartria).</li><li>Activar <b>código ictus</b> ante cualquier síntoma focal agudo.</li><li>Registrar hora exacta de inicio o última vez visto asintomático.</li></ul>"},{"h":"En urgencias (objetivo puerta-aguja &lt;60 min)","b":"<ul><li>ABC, glucemia capilar (excluir hipoglucemia).</li><li>NIHSS.</li><li>TC craneal urgente sin contraste (excluir hemorragia).</li><li>AngioTC + TC perfusión si candidato a trombectomía.</li><li>Analítica (INR, plaquetas), ECG.</li><li>PA controlada &lt;185/110 antes de fibrinolisis.</li></ul>"},{"h":"Ventanas terapéuticas","b":"<ul><li><b>Fibrinolisis IV con Alteplase</b>: hasta <b>4.5 h</b> desde inicio.</li><li><b>Trombectomía mecánica</b>: hasta <b>6 h</b> en oclusión de gran vaso; hasta <b>24 h</b> con selección por perfusión (DAWN, DEFUSE-3).</li><li><b>Wake-up stroke</b>: valorar con mismatch DWI-FLAIR en RM.</li></ul>"}]},
{"id":"uci-alteplase","evidenceQuery":"alteplase stroke thrombolysis","cat":"uci","title":"Alteplase (rtPA) — Protocolo IV","source":"Manual Algoritmos UCI · AHA/ASA","tags":"alteplase rtpa trombolisis fibrinolisis intravenosa ictus dosis contraindicaciones ventana 4.5 horas transformacion hemorragica uci critico acv","summary":"0.9 mg/kg (máx 90 mg): 10% en bolo, 90% en perfusión de 1 h, en las primeras 4.5 h.","sec":[{"h":"Dosis","b":"<ul><li><b>0.9 mg/kg peso</b> (máximo 90 mg).</li><li><b>10% en bolo IV en 1 min</b>.</li><li><b>90% restante en perfusión IV durante 60 min</b>.</li></ul>"},{"h":"Contraindicaciones absolutas","b":"<ul><li>Hemorragia intracraneal previa o actual.</li><li>Ictus &lt;3 meses.</li><li>TCE grave &lt;3 meses.</li><li>Cirugía intracraneal/espinal &lt;3 meses.</li><li>Sospecha de HSA o disección aórtica.</li><li>Malformación vascular / neoplasia intracraneal con riesgo hemorrágico.</li><li>Hemorragia activa.</li><li>Plaquetas &lt;100.000, INR &gt;1.7, TTPa prolongado, HBPM terapéutica &lt;24 h, ACOD &lt;48 h.</li><li>PA no controlable &gt;185/110.</li><li>Glucemia &lt;50 mg/dL.</li></ul>"},{"h":"Manejo tras trombolisis","b":"<ul><li>Ingreso en Unidad de Ictus/UCI.</li><li>NO antiagregación/anticoagulación en las primeras 24 h.</li><li>TC de control a las 24 h antes de iniciar antiagregación.</li><li>Control estricto de PA &lt;180/105 durante 24 h.</li><li>Vigilar transformación hemorrágica: deterioro neurológico, cefalea, HTA, náuseas → TC urgente.</li></ul>"},{"h":"Si sangrado tras rtPA","b":"<ul><li>Parar perfusión.</li><li>Fibrinógeno, TP, TTPa, plaquetas, hemograma, grupo.</li><li>Crioprecipitado 10 U (o fibrinógeno 25-50 mg/kg) si fibrinógeno &lt;150.</li><li>Ácido tranexámico 10-15 mg/kg IV o Ac. aminocaproico.</li><li>Neurocirugía si hematoma con efecto masa.</li></ul>"}]},
{"id":"uci-acv-hemorragico","evidenceQuery":"intracerebral hemorrhage management","evidenceDrugs":["Idarucizumab","Andexanet alfa","Protamine"],"cat":"uci","title":"ACV hemorrágico — Manejo","source":"Manual Algoritmos UCI · AHA/ASA","tags":"acv hemorragico hemorragia intracerebral hic hipertension revertir anticoagulacion warfarina acod control pa uci critico","summary":"Control de PA <140 sistólica, reversión inmediata de anticoagulantes, valoración neuroquirúrgica.","sec":[{"h":"Diagnóstico","b":"<ul><li>TC craneal sin contraste (patrón oro).</li><li>Localizar (lobar, ganglios basales, cerebelo, tronco) y calcular volumen (ABC/2).</li><li>Escala <b>ICH score</b> para pronóstico.</li><li>AngioTC si sospecha aneurisma / MAV.</li></ul>"},{"h":"Control de la PA","b":"<ul><li>Objetivo: <b>PAS &lt;140 mmHg</b> en la primera hora (INTERACT-2, ATACH-2), mantener &gt;120.</li><li>Fármacos IV: Labetalol bolos 10-20 mg, Urapidilo, Nicardipino perfusión.</li></ul>"},{"h":"Reversión de anticoagulación","b":"<ul><li><b>Warfarina/acenocumarol</b>: Complejo Protrombínico (CCP) 25-50 UI/kg + Vitamina K 10 mg IV.</li><li><b>Dabigatrán</b>: Idarucizumab 5 g IV en 2 bolos de 2.5 g.</li><li><b>Apixabán / Rivaroxabán / Edoxabán</b>: Andexanet alfa (si disponible) o CCP 50 UI/kg.</li><li><b>HNF</b>: Sulfato de protamina 1 mg/100 UI heparina (máx 50 mg).</li><li><b>HBPM</b>: Protamina 1 mg/mg enoxaparina (revierte parcialmente).</li><li><b>Antiagregantes</b>: no está indicada la transfusión de plaquetas rutinaria (PATCH).</li></ul>"},{"h":"Valoración neuroquirúrgica","b":"<ul><li><b>Hemorragia cerebelosa &gt;3 cm o con deterioro/hidrocefalia</b>: cirugía urgente.</li><li><b>Hidrocefalia</b>: drenaje ventricular externo.</li><li>HIC supratentorial lobar &gt;30 mL con deterioro: valorar caso a caso.</li></ul>"},{"h":"Medidas generales","b":"<ul><li>Cabecero 30°, normotermia, normocapnia, evitar hipoxia.</li><li>Profilaxis anticomicial solo si convulsión objetivada (no rutinaria).</li><li>Profilaxis TVP con compresión neumática desde el ingreso; HBPM a las 24-48 h si hemorragia estable.</li></ul>"}]},
{"id":"uci-anafilaxia","evidenceQuery":"anaphylaxis epinephrine management","cat":"uci","title":"Anafilaxia grave — Adrenalina IM","source":"Manual Algoritmos UCI · WAO / EAACI","tags":"anafilaxia shock anafilactico adrenalina intramuscular vastus lateralis broncoespasmo hipotension bifasica uci critico","summary":"Adrenalina 0.5 mg IM en cara lateral del muslo es el primer y más importante paso.","sec":[{"h":"Reconocimiento","b":"<ul><li>Inicio agudo (min-h) con afectación de al menos 2 sistemas: piel-mucosas, respiratorio, cardiovascular, GI.</li><li>O hipotensión tras exposición a alérgeno conocido.</li></ul>"},{"h":"Tratamiento inmediato","b":"<ul><li><b>Adrenalina 0.5 mg IM (0.5 mL de 1:1000)</b> en <b>vastus lateralis</b> (cara lateral muslo). Repetir cada 5-15 min si no respuesta. Pediátrico: 0.01 mg/kg (máx 0.5 mg).</li><li>Retirar alérgeno.</li><li>Posición: decúbito supino con piernas elevadas (Trendelenburg). Semi-incorporado si dificultad respiratoria; lateral izquierdo si embarazada.</li><li>O2 alto flujo, vía IV gruesa.</li></ul>"},{"h":"Si shock refractario","b":"<ul><li><b>Cristaloides 1-2 L IV rápidos</b> (20 mL/kg pediatría).</li><li><b>Adrenalina en perfusión IV 0.05-1 µg/kg/min</b> si no responde a IM.</li><li>Considerar glucagón 1-5 mg IV si toma betabloqueantes.</li></ul>"},{"h":"Segunda línea","b":"<ul><li>Salbutamol nebulizado 5 mg si broncoespasmo.</li><li>Corticoides: Metilprednisolona 1-2 mg/kg (previene fase bifásica; NO sustituye adrenalina).</li><li>Antihistamínicos: Dexclorfeniramina 5 mg IV + Ranitidina/Famotidina IV (síntomas cutáneos).</li><li>Observación mínima 6-12 h por riesgo de reacción bifásica.</li></ul>"}]},
{"id":"uci-antidotos","evidenceQuery":"antidotes poisoning","cat":"uci","title":"Antídotos clave en UCI","source":"Manual Algoritmos UCI · Toxicología clínica","tags":"antidotos naloxona flumazenil bicarbonato n acetilcisteina paracetamol intralipid digoxina anticuerpos uci critico intoxicacion","summary":"Los antídotos más utilizados en el paciente crítico con dosis y precauciones.","sec":[{"h":"Opioides","b":"<ul><li><b>Naloxona 0.04-0.4 mg IV</b> (0.4-2 mg si parada). Repetir cada 2-3 min. Perfusión 2/3 de la dosis efectiva por hora si opioide de vida larga (metadona, fentanilo transdérmico).</li></ul>"},{"h":"Benzodiacepinas","b":"<ul><li><b>Flumazenil 0.2 mg IV</b>, repetir hasta 1-2 mg. Vida media corta, riesgo de resedación. <b>Evitar</b> si epilepsia, coingesta con tricíclicos (riesgo de convulsiones).</li></ul>"},{"h":"Paracetamol","b":"<ul><li><b>N-acetilcisteína IV</b> según nomograma Rumack-Matthew (útil hasta 8-24 h). Pauta 21 h: 150 mg/kg en 60 min + 50 mg/kg en 4 h + 100 mg/kg en 16 h.</li></ul>"},{"h":"Tricíclicos / bloqueo de canales de Na","b":"<ul><li>QRS &gt;100 ms o arritmias: <b>Bicarbonato 1M 1-2 mEq/kg IV bolo</b>, objetivo pH 7.45-7.55.</li></ul>"},{"h":"Anestésicos locales / lipofílicos","b":"<ul><li><b>Intralipid 20% 1.5 mL/kg IV en 1 min</b>, luego 0.25 mL/kg/min, hasta 10 mL/kg total.</li></ul>"},{"h":"Digoxina","b":"<ul><li>Intoxicación grave (arritmia, K &gt;5, digoxinemia elevada): <b>Anticuerpos anti-digoxina (Fab)</b>.</li></ul>"},{"h":"Betabloqueantes / calcioantagonistas","b":"<ul><li>Gluconato cálcico, Glucagón 3-10 mg IV, Insulina euglucémica en dosis altas, catecolaminas.</li></ul>"},{"h":"Metahemoglobinemia","b":"<ul><li><b>Azul de metileno 1-2 mg/kg IV</b> en 5 min.</li></ul>"},{"h":"Metanol / etilenglicol","b":"<ul><li>Fomepizol o etanol IV + hemodiálisis.</li></ul>"}]},
{"id":"uci-cad","evidenceQuery":"diabetic ketoacidosis management","cat":"uci","title":"Cetoacidosis diabética (CAD)","source":"Manual Algoritmos UCI · ADA","tags":"cad cetoacidosis diabetica insulina fluidoterapia potasio bicarbonato hiperglucemia acidosis metabolica cetonemia uci critico endocrino","summary":"Fluidoterapia + insulina IV + reposición de K son los tres pilares. Bicarbonato solo si pH <6.9.","sec":[{"h":"Criterios diagnósticos","b":"<ul><li>Glucemia &gt;250 mg/dL.</li><li>pH &lt;7.30 o HCO3 &lt;18.</li><li>Cetonuria o cetonemia positiva (β-hidroxibutirato ≥3 mmol/L).</li><li>Anion gap elevado.</li></ul>"},{"h":"1. Fluidoterapia","b":"<ul><li><b>SF 0.9%: 1 L en la primera hora</b>, luego 500-1000 mL/h las siguientes 2-4 h.</li><li>Cambiar a SF 0.45% si Na corregido normal/alto.</li><li>Añadir <b>glucosa 5%</b> cuando glucemia &lt;200-250 (mantener insulina).</li></ul>"},{"h":"2. Insulina","b":"<ul><li>NO iniciar insulina si K &lt;3.3 (reponer K primero).</li><li><b>Insulina rápida perfusión IV 0.1 UI/kg/h</b> (sin bolo inicial recomendado en última guía).</li><li>Objetivo: bajar glucemia 50-75 mg/dL/h.</li><li>Cuando glucemia &lt;200: reducir a 0.02-0.05 UI/kg/h y añadir glucosa.</li><li>Mantener perfusión hasta cierre del anion gap y HCO3 &gt;18, con solapamiento 1-2 h con insulina SC basal.</li></ul>"},{"h":"3. Potasio","b":"<ul><li>K &gt;5.2: no reponer, controlar cada 2 h.</li><li>K 3.3-5.2: <b>20-30 mEq/L de K</b> en cada litro de sueroterapia.</li><li>K &lt;3.3: <b>parar insulina</b>, reponer 20-40 mEq/h hasta K &gt;3.3.</li></ul>"},{"h":"Bicarbonato","b":"<ul><li>Solo si pH &lt;6.9: 100 mEq en 400 mL agua bidestilada + 20 mEq K en 2 h. Repetir cada 2 h hasta pH ≥7.</li></ul>"}]},
{"id":"uci-ehh","evidenceQuery":"hyperosmolar hyperglycemic state","cat":"uci","title":"Estado Hiperglucémico Hiperosmolar (EHH)","source":"Manual Algoritmos UCI · ADA","tags":"ehh estado hiperosmolar hiperglucemico coma hiperosmolar dm2 fluidoterapia agresiva osmolaridad uci critico endocrino","summary":"Deshidratación grave, hiperosmolaridad >320, sin cetosis; corrección lenta para evitar edema cerebral.","sec":[{"h":"Criterios diagnósticos","b":"<ul><li>Glucemia &gt;600 mg/dL (típicamente &gt;1000).</li><li>Osmolaridad efectiva &gt;320 mOsm/kg.</li><li>pH &gt;7.30, HCO3 &gt;18, cetonuria mínima o ausente.</li><li>Alteración del sensorio (desde confusión hasta coma).</li></ul>"},{"h":"Cálculo de osmolaridad efectiva","b":"<p>2 × Na + (glucosa mg/dL / 18)</p>"},{"h":"Tratamiento","b":"<ul><li><b>Fluidoterapia agresiva</b>: SF 0.9% 1-1.5 L en la primera hora, luego 250-500 mL/h. Déficit medio 8-12 L.</li><li>Corrección lenta del sodio y osmolaridad (evitar edema cerebral): objetivo bajar osmolaridad &lt;3 mOsm/kg/h.</li><li><b>Insulina IV 0.05-0.1 UI/kg/h</b> tras iniciar fluidos (dosis menor que en CAD).</li><li>Añadir glucosa 5% cuando glucemia &lt;300.</li><li>Reposición de K similar a CAD.</li><li>Buscar y tratar el factor desencadenante: infección, IAM, ictus, mal cumplimiento.</li><li>Profilaxis TVP (alto riesgo trombótico).</li></ul>"}]},
{"id":"uci-emergencia-hta","evidenceQuery":"hypertensive emergency intravenous therapy","cat":"uci","title":"Emergencia hipertensiva — Fármacos IV","source":"Manual Algoritmos UCI · ESC/ESH","tags":"emergencia hipertensiva urapidilo labetalol nitroglicerina nitroprusiato nicardipino organo diana descenso controlado uci critico","summary":"Descenso controlado según daño de órgano diana; fármaco IV según situación clínica.","sec":[{"h":"Concepto","b":"<ul><li><b>Emergencia</b>: PA muy elevada + daño agudo de órgano diana (encefalopatía, EAP, disección, SCA, eclampsia, HIC).</li><li><b>Urgencia</b>: PA elevada sin daño agudo. Descenso gradual VO en horas-días.</li></ul>"},{"h":"Objetivo general","b":"<ul><li>Bajar PAM ≤20-25% en la primera hora.</li><li>PA &lt;160/100-110 en las siguientes 2-6 h.</li><li>Descensos bruscos pueden causar isquemia (cerebral, coronaria).</li></ul>"},{"h":"Excepciones (objetivos específicos)","b":"<ul><li><b>Disección aórtica</b>: PAS 100-120 mmHg y FC &lt;60 en 20 min (labetalol/esmolol).</li><li><b>ACV isquémico con rtPA</b>: PA &lt;185/110 antes y &lt;180/105 después.</li><li><b>ACV hemorrágico</b>: PAS &lt;140 (INTERACT-2).</li><li><b>Eclampsia</b>: PAS &lt;160 y PAD &lt;110 (labetalol / hidralazina / nifedipino + sulfato Mg).</li></ul>"},{"h":"Fármacos IV","b":"<ul><li><b>Urapidilo</b>: bolo 12.5-25 mg IV, perfusión 5-40 mg/h.</li><li><b>Labetalol</b>: bolo 10-20 mg (repetir hasta 300 mg), perfusión 2-10 mg/min.</li><li><b>Nitroglicerina</b>: perfusión 5-200 µg/min (EAP, SCA).</li><li><b>Nicardipino</b>: perfusión 5-15 mg/h.</li><li><b>Nitroprusiato</b>: 0.25-10 µg/kg/min (emergencia refractaria; riesgo cianuro).</li><li><b>Esmolol</b>: bolo 500 µg/kg, perfusión 50-200 µg/kg/min (disección).</li></ul>"}]}
,
{"id":"img-rx-torax-sistematica","evidenceQuery":"chest radiograph systematic interpretation","cat":"imagen","title":"Rx tórax — Lectura sistemática (ABCDEF)","source":"Manual Imagen Clínica · Radiología","tags":"rx torax radiografia lectura sistematica abcdef airway breathing circulation vias respiratorias imagen critico","summary":"Método ABCDEF para no dejarse nada en la lectura sistemática de una Rx tórax.","sec":[{"h":"A — Airway","b":"<ul><li>Tráquea centrada (desviación → masa, atelectasia, neumotórax).</li><li>Bronquios principales.</li><li>Carina en 5º-6º cuerpo vertebral dorsal.</li></ul>"},{"h":"B — Breathing (parénquima)","b":"<ul><li>Simetría de hemitorax y trasparencia.</li><li>Marca vascular pulmonar hasta 2 cm de la periferia.</li><li>Ángulos costofrénicos y cardiofrénicos libres.</li><li>Fisuras horizontal (D) y mayor (bilateral).</li></ul>"},{"h":"C — Circulation","b":"<ul><li>ICT (índice cardiotorácico) &lt;0.5 en PA (proyección posteroanterior).</li><li>Botón aórtico, arco pulmonar, aurícula izquierda.</li><li>Vasos hiliares (a. pulmonares).</li></ul>"},{"h":"D — Diafragma","b":"<ul><li>Hemidiafragma D suele estar 1-2 cm más alto que I.</li><li>Cámara gástrica bajo hemidiafragma I.</li><li>Descartar aire libre subdiafragmático (perforación).</li></ul>"},{"h":"E — Estructuras óseas y partes blandas","b":"<ul><li>Costillas, clavículas, escápulas, esternón, columna.</li><li>Fracturas, lesiones líticas/blásticas.</li><li>Enfisema subcutáneo.</li></ul>"},{"h":"F — Foreign objects y datos técnicos","b":"<ul><li>Vías, catéteres, TET, marcapasos, prótesis.</li><li>Calidad: inspiración adecuada (6 arcos anteriores o 10 posteriores), rotación, penetración.</li></ul>"}]},
{"id":"img-rx-patrones-pulmonares","evidenceQuery":"pulmonary patterns chest radiograph","cat":"imagen","title":"Rx tórax — Patrones alveolar, intersticial y nodular","source":"Manual Imagen Clínica · Radiología","tags":"rx torax patron alveolar intersticial nodular condensacion broncograma aereo edema neumonia sdra imagen critico","summary":"Cómo distinguir los tres patrones básicos y sus causas más frecuentes.","sec":[{"h":"Patrón alveolar (condensación)","b":"<ul><li><b>Signos</b>: opacidad homogénea, mal definida, <b>broncograma aéreo</b>, borrado del borde silueteado adyacente (signo de la silueta).</li><li><b>Causas</b>: neumonía, edema pulmonar, hemorragia alveolar, SDRA, contusión, aspiración.</li></ul>"},{"h":"Patrón intersticial","b":"<ul><li><b>Signos</b>: engrosamiento reticular (líneas de Kerley A, B, C), en vidrio deslustrado, en panal.</li><li><b>Causas agudas</b>: edema pulmonar (Kerley B en bases), neumonía viral, neumonitis.</li><li><b>Causas crónicas</b>: fibrosis (patrón en panal), neumopatía intersticial.</li></ul>"},{"h":"Patrón nodular","b":"<ul><li><b>Micronodular</b> (&lt;3 mm): miliar (TBC, metástasis, sarcoidosis, silicosis).</li><li><b>Macronodular</b> (3-30 mm): metástasis (\"suelta de globos\"), granulomas, TBC.</li><li><b>Masa</b> (&gt;30 mm): cáncer de pulmón, absceso, aspergiloma.</li></ul>"},{"h":"Signo de la silueta","b":"<ul><li>Si una opacidad borra un borde anatómico, ambas estructuras están en el mismo plano.</li><li>Borra borde D del corazón → lóbulo medio.</li><li>Borra borde I del corazón → língula.</li><li>Borra hemidiafragma → lóbulos inferiores.</li></ul>"}]},
{"id":"img-rx-neumotorax-derrame","evidenceQuery":"pneumothorax pleural effusion radiograph","cat":"imagen","title":"Rx tórax — Neumotórax, derrame pleural y atelectasia","source":"Manual Imagen Clínica · Radiología","tags":"rx torax neumotorax derrame pleural atelectasia hidroneumotorax tension pulmon colapso imagen critico","summary":"Signos radiológicos de las tres patologías pleurales más frecuentes en el paciente crítico.","sec":[{"h":"Neumotórax","b":"<ul><li><b>Línea pleural visceral</b> visible sin marca vascular por fuera.</li><li>Hiperclaridad periférica.</li><li>En decúbito: <b>deep sulcus sign</b> (seno costofrénico anormalmente profundo).</li><li><b>A tensión</b>: desplazamiento mediastino contralateral, aplanamiento diafragma, ensanchamiento espacios intercostales → <b>toracocentesis inmediata sin esperar Rx</b>.</li></ul>"},{"h":"Derrame pleural","b":"<ul><li>&gt;200 mL: borra ángulo costofrénico.</li><li>&gt;500 mL: opacidad basal con menisco de Damoiseau (cóncavo hacia arriba).</li><li>Masivo: opacificación hemitórax con desplazamiento mediastínico contralateral.</li><li>En decúbito: velado homogéneo de todo el hemitórax.</li><li><b>Rx en decúbito lateral</b> del lado afecto (Laurell): útil para cuantificar y determinar si libre (&gt;10 mm es puncionable).</li></ul>"},{"h":"Atelectasia","b":"<ul><li><b>Signos directos</b>: opacidad + desplazamiento de cisuras.</li><li><b>Signos indirectos</b>: elevación hemidiafragma, desviación tráquea/mediastino <b>hacia</b> el lado afecto, hiperinsuflación compensadora.</li><li>Causa frecuente en UCI: tapón mucoso, malposición de TET (intubación selectiva bronquio D).</li></ul>"}]},
{"id":"img-rx-colocacion-dispositivos","evidenceQuery":"endotracheal tube central line position radiograph","cat":"imagen","title":"Rx tórax — Colocación de TET, SNG, CVC y drenajes","source":"Manual Imagen Clínica · Radiología","tags":"rx torax tet tubo endotraqueal sng sonda nasogastrica cvc via central pleur evac carina posicion imagen critico uci","summary":"Puntos anatómicos de referencia para comprobar colocación de dispositivos en el paciente crítico.","sec":[{"h":"Tubo endotraqueal (TET)","b":"<ul><li><b>Punta 3-5 cm por encima de la carina</b> (aprox. T3-T4).</li><li>Con flexión cuello: se desplaza 2 cm hacia abajo.</li><li>Con extensión cuello: se desplaza 2 cm hacia arriba.</li><li>Si punta en bronquio principal derecho → atelectasia pulmón izquierdo → retirar hasta posición correcta.</li></ul>"},{"h":"Sonda nasogástrica (SNG)","b":"<ul><li>Debe cruzar el diafragma en línea media.</li><li>Punta y orificios laterales <b>por debajo del diafragma</b>, en cámara gástrica.</li><li>Si en árbol bronquial: retirar y recolocar (nunca administrar por SNG sin comprobar posición).</li></ul>"},{"h":"Vía venosa central (CVC)","b":"<ul><li><b>Yugular interna / subclavia</b>: punta en <b>vena cava superior</b>, a nivel del ángulo traqueobronquial (aprox. 2 dedos por debajo de clavículas D).</li><li>NO debe estar en aurícula derecha (riesgo de arritmia, perforación).</li><li>Descartar neumotórax siempre tras canalización de subclavia o yugular.</li></ul>"},{"h":"Catéter Swan-Ganz","b":"<ul><li>Punta en <b>rama de la arteria pulmonar</b> (2-3 cm más allá de la carina, dentro del hilio pulmonar).</li></ul>"},{"h":"Drenaje pleural (Pleur-Evac)","b":"<ul><li>Punta en el <b>vértice</b> del hemitórax si neumotórax.</li><li>Punta en <b>base</b> si derrame.</li><li>Todos los orificios laterales deben estar <b>dentro</b> de la caja torácica.</li></ul>"},{"h":"Marcapasos transvenoso","b":"<ul><li>Punta del electrodo en <b>ápex del ventrículo derecho</b>.</li></ul>"}]},
{"id":"img-rx-abdomen-sistematica","evidenceQuery":"abdominal radiograph interpretation","cat":"imagen","title":"Rx abdomen — Lectura sistemática","source":"Manual Imagen Clínica · Radiología","tags":"rx abdomen radiografia simple lectura sistematica gases niveles hidroaereos imagen critico","summary":"Método sistemático para no dejarse patología en la Rx abdomen simple.","sec":[{"h":"Proyecciones","b":"<ul><li><b>Abdomen simple en decúbito supino</b>: patrón gaseoso, calcificaciones.</li><li><b>Abdomen en bipedestación</b>: niveles hidroaéreos y aire libre subdiafragmático.</li><li>Si no bipedestación → <b>decúbito lateral izquierdo con rayo horizontal</b>.</li></ul>"},{"h":"Sistemática","b":"<ol><li><b>Gas</b>: distribución normal (cámara gástrica, colon con heces). Anormal: dilatación.</li><li><b>Silueta hepática, esplénica, renal</b>.</li><li><b>Psoas</b>: si se borra sugiere retroperitoneo afecto (absceso, hematoma).</li><li><b>Vejiga</b>.</li><li><b>Estructuras óseas</b>: columna, pelvis, caderas, últimas costillas.</li><li><b>Cuerpos extraños y calcificaciones</b>: litiasis renoureteral, biliar, pancreática, ganglios, flebolitos.</li><li><b>Aire libre</b>: bajo cúpulas diafragmáticas (bipedestación) o entre hígado y pared (decúbito lateral I).</li></ol>"},{"h":"Distribución normal del gas","b":"<ul><li>Cámara gástrica visible en hipocondrio I.</li><li>Colon con heces en marco cólico.</li><li>ID sin dilatación (diámetro &lt;3 cm).</li><li>Colon: máximo diámetro admitido 6 cm (9 cm en ciego).</li></ul>"}]},
{"id":"img-rx-abdomen-obstruccion","evidenceQuery":"bowel obstruction perforation radiograph","cat":"imagen","title":"Rx abdomen — Obstrucción intestinal y perforación","source":"Manual Imagen Clínica · Radiología","tags":"rx abdomen obstruccion intestinal perforacion aire libre neumoperitoneo niveles hidroaereos ileo cuentas rosario imagen critico","summary":"Diagnóstico radiológico de las dos urgencias abdominales más comunes.","sec":[{"h":"Obstrucción de intestino delgado","b":"<ul><li>Asas dilatadas &gt;3 cm en el centro del abdomen.</li><li>Válvulas conniventes atraviesan toda la luz (\"pila de monedas\", \"cuentas de rosario\").</li><li>En bipedestación: <b>niveles hidroaéreos escalonados</b>.</li><li>Escasez de gas en colon (distal a la obstrucción).</li></ul>"},{"h":"Obstrucción de colon","b":"<ul><li>Colon dilatado en marco cólico.</li><li>Haustras: no atraviesan toda la luz del intestino.</li><li>Si válvula ileocecal competente: dilatación proximal masiva con riesgo de perforación cuando el ciego alcanza 9-12 cm.</li></ul>"},{"h":"Íleo paralítico","b":"<ul><li>Dilatación difusa de ID y colon (a diferencia de obstrucción mecánica).</li><li>Múltiples niveles pero no escalonados.</li><li>Aire en recto/ampolla rectal presente.</li></ul>"},{"h":"Perforación / neumoperitoneo","b":"<ul><li><b>Aire libre subdiafragmático</b> en bipedestación (radiotransparencia en semiluna bajo hemidiafragma D).</li><li>En decúbito supino: <b>signo de Rigler</b> (doble contorno de asa por aire dentro y fuera), signo del ligamento falciforme.</li><li>Si dudoso → <b>TC urgente</b>.</li></ul>"},{"h":"Vólvulo de sigma","b":"<ul><li>Signo del \"grano de café\" en cuadrante superior izquierdo, con asa dilatada en forma de U invertida.</li></ul>"}]},
{"id":"img-tc-craneal-urgente","evidenceQuery":"emergency head CT findings","cat":"imagen","title":"TC craneal urgente — Signos claves","source":"Manual Imagen Clínica · Neurorradiología","tags":"tc craneal urgente hemorragia intracraneal hematoma epidural subdural subaracnoidea signos precoces ictus isquemico imagen critico","summary":"Los signos de urgencia neurológica en la TC craneal sin contraste.","sec":[{"h":"Densidades a recordar","b":"<ul><li>Aire: -1000 UH (hipodenso, negro).</li><li>Grasa: -100 UH.</li><li>Agua/LCR: 0 UH.</li><li>Sustancia blanca: 25-35 UH.</li><li>Sustancia gris: 35-45 UH.</li><li><b>Sangre aguda: 60-90 UH (hiperdensa, blanca)</b>.</li><li>Hueso/calcio: &gt;150 UH.</li></ul>"},{"h":"Hematoma epidural","b":"<ul><li><b>Forma biconvexa (lenticular)</b>, hiperdensa.</li><li>No cruza suturas.</li><li>Frecuente en región temporoparietal.</li><li>Causa: fractura + lesión de arteria meníngea media.</li></ul>"},{"h":"Hematoma subdural","b":"<ul><li><b>Forma en semiluna (cóncava hacia parénquima)</b>.</li><li>Cruza suturas pero no la línea media (contenido por hoz).</li><li>Agudo hiperdenso, subagudo isodenso, crónico hipodenso.</li></ul>"},{"h":"Hemorragia subaracnoidea (HSA)","b":"<ul><li>Sangre hiperdensa en <b>cisternas basales</b>, surcos, cisuras.</li><li>\"Estrella de la muerte\" en cisternas de la base.</li><li>Buscar aneurisma con AngioTC.</li></ul>"},{"h":"Hemorragia intraparenquimatosa","b":"<ul><li>Colección hiperdensa intraparenquimatosa.</li><li>Localización típica hipertensiva: ganglios basales, tálamo, protuberancia, cerebelo.</li><li>Cálculo volumen: <b>ABC/2</b> (largo × ancho × alto/2 en cm).</li></ul>"},{"h":"Ictus isquémico — signos precoces","b":"<ul><li><b>Signo de la arteria cerebral media hiperdensa</b>.</li><li>Pérdida de diferenciación sustancia gris-blanca.</li><li>Borramiento de surcos.</li><li>Hipodensidad del núcleo lenticular.</li><li><b>Escala ASPECTS</b> (0-10): puntúa hipodensidad en 10 áreas del territorio de ACM. ≥6 predice buena evolución con trombectomía.</li></ul>"}]},
{"id":"img-tc-htic","evidenceQuery":"intracranial hypertension CT signs","cat":"imagen","title":"TC craneal — Signos de hipertensión intracraneal","source":"Manual Imagen Clínica · Neurorradiología","tags":"tc craneal htic hipertension intracraneal edema cerebral herniacion desplazamiento linea media borramiento surcos imagen critico neuro","summary":"Signos radiológicos de HTIC en TC y tipos de herniación cerebral.","sec":[{"h":"Signos generales de HTIC","b":"<ul><li><b>Borramiento de surcos</b> corticales.</li><li><b>Colapso ventricular</b>.</li><li>Pérdida de diferenciación sustancia gris/blanca.</li><li><b>Borramiento de cisternas</b> basales.</li><li>Efecto masa con desplazamiento de estructuras.</li></ul>"},{"h":"Desplazamiento de línea media","b":"<ul><li>Se mide en la altura del septum pellucidum.</li><li><b>&gt;5 mm</b>: significativo.</li><li><b>&gt;10 mm</b>: quirúrgico en la mayoría de contextos.</li></ul>"},{"h":"Herniaciones","b":"<ul><li><b>Subfalcina</b>: giro cingulado bajo la hoz. Desviación línea media, compresión ACA.</li><li><b>Transtentorial descendente (uncal)</b>: uncus temporal por hendidura tentorial. Compresión III par (midriasis ipsilateral), pedúnculo cerebral (hemiparesia contralateral).</li><li><b>Central descendente</b>: diencéfalo por tienda. Deterioro rápido, coma, alteración pupilar.</li><li><b>Amigdalar</b>: amígdalas cerebelosas por foramen magno. Parada cardiorrespiratoria (compresión bulbar).</li><li><b>Transtentorial ascendente</b>: cerebelo hacia arriba (menos frecuente).</li></ul>"},{"h":"Actitud","b":"<ul><li>Cabecero 30°, sedación, hiperventilación transitoria a PaCO2 30-35 (rescate).</li><li>Osmoterapia: <b>Suero salino hipertónico 3% 250 mL</b> o <b>Manitol 20% 1 g/kg</b>.</li><li>Drenaje ventricular externo si hidrocefalia.</li><li>Craniectomía descompresiva en casos seleccionados.</li></ul>"}]},
{"id":"img-eco-fast","evidenceQuery":"FAST ultrasound trauma","cat":"imagen","title":"ECO-FAST — Trauma abdominal","source":"Manual Imagen Clínica · Ecografía a pie de cama","tags":"eco fast trauma abdominal ventana perihepatica periesplenica pelvis pericardio hemoperitoneo pocus imagen critico","summary":"Ecografía focalizada para trauma: 4 ventanas para detectar líquido libre en <5 min.","sec":[{"h":"Objetivo","b":"<p>Detectar líquido libre en 4 ventanas: hepatorrenal, esplenorrenal, pélvica y pericárdica. Es una prueba de \"sí/no\" (líquido libre = hemoperitoneo/hemopericardio en contexto traumático).</p>"},{"h":"Las 4 ventanas","b":"<ol><li><b>Perihepática / hepatorrenal (Morison)</b>: entre hígado y riñón derecho. Sensible para líquido libre en supino.</li><li><b>Periesplénica / esplenorrenal</b>: entre bazo y riñón I. Requiere mayor angulación posterior.</li><li><b>Pélvica / suprapúbica</b>: fondo de saco de Douglas / rectovesical.</li><li><b>Subxifoidea (pericárdica)</b>: 4 cavidades cardíacas + saco pericárdico.</li></ol>"},{"h":"E-FAST (extendida)","b":"<ul><li>Añade valoración de <b>líneas pleurales bilaterales</b> para detectar <b>neumotórax</b> (ausencia de deslizamiento pleural, sin líneas B).</li><li>Añade valoración pleural bilateral para detectar <b>hemotórax</b> (líquido anecoico por encima del diafragma).</li></ul>"},{"h":"Interpretación","b":"<ul><li>Líquido libre = anecoico (negro), forma anguloso siguiendo espacios.</li><li>FAST negativo NO descarta lesión visceral sólida sin hemoperitoneo.</li><li>Trauma cerrado inestable + FAST positivo → laparotomía urgente.</li><li>Trauma cerrado estable + FAST positivo → TC abdominal con contraste.</li></ul>"}]},
{"id":"img-pocus-pulmonar","evidenceQuery":"lung ultrasound BLUE protocol","cat":"imagen","title":"POCUS pulmonar — Líneas A, B y perfiles BLUE","source":"Manual Imagen Clínica · Ecografía a pie de cama","tags":"pocus pulmonar ecografia pulmon lineas a b sliding cortina pulmonar blue protocolo edema neumonia neumotorax imagen critico","summary":"Ecografía pulmonar a pie de cama: patrones básicos para diagnóstico rápido en el crítico.","sec":[{"h":"Signos básicos","b":"<ul><li><b>Deslizamiento pleural (\"lung sliding\")</b>: movimiento con la respiración de la línea pleural. Presente = pulmón aireado en contacto con pared.</li><li><b>Líneas A</b>: horizontales, paralelas a la pleura, equidistantes. Reverberación normal en pulmón aireado.</li><li><b>Líneas B</b>: verticales (\"cola de cometa\"), nacen de pleura hasta borde inferior, se mueven con respiración, borran líneas A. &gt;3 en un espacio intercostal = patológico (edema, intersticial).</li></ul>"},{"h":"Neumotórax","b":"<ul><li><b>Ausencia de deslizamiento pleural</b>.</li><li>Ausencia de líneas B.</li><li>Presencia de <b>\"punto pulmón\" (lung point)</b>: patognomónico (transición zona con y sin deslizamiento).</li><li>Sensibilidad ecografía &gt; Rx tórax para neumotórax pequeño.</li></ul>"},{"h":"Edema pulmonar cardiogénico","b":"<ul><li><b>Líneas B múltiples bilaterales</b> difusas.</li><li>Con derrame pleural bilateral.</li><li>Función cardíaca deprimida en eco.</li></ul>"},{"h":"Neumonía / consolidación","b":"<ul><li>Patrón \"tisular\" o \"hepatización\" del pulmón.</li><li>Broncograma aéreo dinámico.</li><li>Líneas B focales, derrame paraneumónico.</li></ul>"},{"h":"Derrame pleural","b":"<ul><li>Colección anecoica sobre el diafragma.</li><li>Signo del \"sinusoide\" en modo M (variación con respiración).</li><li>Signo de la \"cortina\" (aire pulmonar que aparece con inspiración).</li></ul>"},{"h":"Protocolo BLUE (disnea aguda)","b":"<ul><li>Líneas A + venas normales → asma/EPOC.</li><li>Líneas B bilaterales → edema pulmonar.</li><li>Consolidación → neumonía.</li><li>Sin deslizamiento + punto pulmón → neumotórax.</li><li>Líneas A + TVP → TEP.</li></ul>"}]},
{"id":"img-pocus-cardiaco","evidenceQuery":"focused cardiac ultrasound emergency","cat":"imagen","title":"POCUS cardíaco — Eco en emergencias","source":"Manual Imagen Clínica · Ecografía a pie de cama","tags":"pocus cardiaco ecocardiografia emergencia derrame taponamiento funcion ventricular fevi disfuncion cava inferior imagen critico","summary":"Eco cardíaca de emergencia: 5 preguntas rápidas al paciente inestable.","sec":[{"h":"Ventanas básicas","b":"<ul><li><b>Paraesternal eje largo</b>: valorar VI, VD, aorta, válvulas mitral y aórtica.</li><li><b>Paraesternal eje corto</b>: función global VI, motilidad segmentaria.</li><li><b>Apical 4 cámaras</b>: comparar tamaños ventriculares, valorar aurículas.</li><li><b>Subcostal</b>: pericardio, VCI.</li></ul>"},{"h":"5 preguntas del paciente inestable","b":"<ol><li><b>¿Hay derrame/taponamiento?</b> — colección anecoica pericárdica + colapso AD/VD en diástole.</li><li><b>¿Contractilidad VI?</b> — visual: normal, deprimida, hiperdinámica.</li><li><b>¿VD dilatado?</b> — VD ≥ VI en 4 cámaras sugiere sobrecarga (TEP).</li><li><b>¿VCI y estado de volemia?</b> — VCI &lt;2 cm y colapsable &gt;50% = probable hipovolemia. VCI dilatada no colapsable = presiones derechas altas.</li><li><b>¿Hay signos de disección aórtica?</b> — flap intimal, dilatación aórtica.</li></ol>"},{"h":"Signos de TEP masivo","b":"<ul><li>Dilatación VD (relación VD/VI &gt;1 en 4 cámaras).</li><li>Movimiento paradójico del septo (\"septo en D\").</li><li><b>Signo de McConnell</b>: hipoquinesia de pared libre VD con normofunción del ápex.</li><li>VCI dilatada.</li><li>Insuficiencia tricúspide con velocidad alta.</li></ul>"},{"h":"Taponamiento cardíaco","b":"<ul><li>Derrame pericárdico + colapso diastólico de AD (temprano) y VD (más específico).</li><li>Flujo mitral con variación &gt;25% con respiración.</li><li>VCI dilatada no colapsable.</li><li>Actuación: pericardiocentesis ecoguiada subxifoidea.</li></ul>"}]},
{"id":"img-angiotc-tep","evidenceQuery":"pulmonary embolism CT angiography","cat":"imagen","title":"AngioTC — TEP y signos radiológicos","source":"Manual Imagen Clínica · Radiología","tags":"angiotc tep tromboembolismo pulmonar defecto repleccion arteria pulmonar wells geneva imagen critico","summary":"AngioTC pulmonar: técnica de elección para diagnóstico de TEP.","sec":[{"h":"Indicación","b":"<ul><li>Sospecha clínica moderada-alta (score de Wells / Geneva) o D-dímero elevado con probabilidad clínica no baja.</li><li>Requisitos: función renal (Cr, TFG), no alergia grave a contraste.</li></ul>"},{"h":"Signos directos en AngioTC","b":"<ul><li><b>Defecto de repleción</b> intraluminal en arteria pulmonar principal, lobar, segmentaria o subsegmentaria.</li><li>Trombo agudo: hipodenso central rodeado por contraste.</li><li>Trombo crónico: excéntrico, adherido a pared, con calcificaciones.</li></ul>"},{"h":"Signos indirectos","b":"<ul><li>Infartos pulmonares periféricos (opacidad triangular con base pleural).</li><li>Dilatación de VD (VD/VI &gt;1).</li><li>Rectificación/inversión del septo interventricular.</li><li>Reflujo de contraste a vena cava inferior/venas suprahepáticas.</li></ul>"},{"h":"Estratificación de gravedad","b":"<ul><li><b>Alto riesgo (masivo)</b>: hipotensión sostenida / shock → fibrinolisis o embolectomía.</li><li><b>Riesgo intermedio</b>: normotensión + disfunción VD + biomarcadores (troponina, BNP) → anticoagulación e ingreso vigilado.</li><li><b>Bajo riesgo</b>: sin criterios anteriores → anticoagulación ambulatoria en casos seleccionados.</li></ul>"},{"h":"Alternativas si AngioTC no disponible","b":"<ul><li>Gammagrafía V/Q (útil en embarazadas, insuficiencia renal).</li><li>Ecografía compresiva venas MMII (si TVP confirmada + clínica compatible = TEP tratable).</li><li>Eco cardíaca (sobrecarga VD).</li></ul>"}]},
{"id":"obst-preeclampsia","evidenceQuery":"severe preeclampsia eclampsia management","cat":"obst","title":"Preeclampsia grave y eclampsia","source":"Manual Obstétrico Crítico · SEGO/ACOG","tags":"preeclampsia grave eclampsia convulsiones hipertension embarazo proteinuria sulfato magnesio obstetrico critico","summary":"HTA + proteinuria después de la sem 20; eclampsia = convulsiones. Sulfato magnesio + antihipertensivos + finalizar gestación.","sec":[{"h":"Criterios de preeclampsia grave","b":"<ul><li>PA ≥160/110 mmHg confirmada.</li><li>Proteinuria &gt;5 g/24 h o &gt;3+ en tira.</li><li>Oliguria &lt;500 mL/24 h.</li><li>Cr &gt;1.1 mg/dL o &gt;doble del basal.</li><li>Alteraciones neurológicas: cefalea intensa, visión borrosa, escotomas.</li><li>Edema pulmonar.</li><li>Dolor epigástrico o en HCD.</li><li>Trombopenia &lt;100.000.</li><li>Enzimas hepáticas x2 valor normal.</li></ul>"},{"h":"Eclampsia","b":"<ul><li>Convulsión tónico-clónica en gestante o puérpera (hasta 48 h posparto) sin otra causa.</li><li>Puede ser primera manifestación en 20-40% de los casos.</li></ul>"},{"h":"Actuación","b":"<ol><li><b>ABC</b>: proteger vía aérea, decúbito lateral izquierdo si convulsión, O2.</li><li><b>Sulfato de magnesio</b>: primera línea para prevenir y tratar convulsiones (ver ficha específica).</li><li><b>Antihipertensivos IV</b>: <ul><li>Labetalol 20 mg IV, repetir cada 10-20 min hasta 300 mg.</li><li>Hidralazina 5-10 mg IV cada 20 min.</li><li>Nifedipino 10 mg VO (evitar sublingual por caída brusca).</li></ul></li><li><b>Objetivo PA</b>: 140-150/90-100 (evitar descenso brusco por hipoperfusión placentaria).</li><li><b>Finalizar la gestación</b>: única cura definitiva.<ul><li>&gt;34 sem: parto/cesárea urgente.</li><li>24-34 sem: individualizar; maduración pulmonar con corticoides si posible.</li></ul></li></ol>"}]},
{"id":"obst-sulfato-magnesio","evidenceQuery":"magnesium sulfate eclampsia","cat":"obst","title":"Sulfato de magnesio — Protocolo eclampsia","source":"Manual Obstétrico Crítico · SEGO","tags":"sulfato magnesio mgso4 eclampsia preeclampsia dosis toxicidad reflejos gluconato calcio obstetrico critico","summary":"Dosis carga 4-6 g IV + mantenimiento 1-2 g/h. Vigilar diuresis, ROT y FR. Antídoto: gluconato cálcico.","sec":[{"h":"Indicación","b":"<ul><li>Prevención de eclampsia en preeclampsia grave.</li><li>Tratamiento de convulsión eclámptica.</li></ul>"},{"h":"Pauta IV","b":"<ul><li><b>Dosis carga</b>: 4-6 g IV en 100 mL SG 5% en <b>15-20 min</b>.</li><li><b>Perfusión de mantenimiento</b>: <b>1-2 g/h IV</b> durante <b>24 h después del parto</b> o de la última convulsión.</li><li>Si convulsión recurrente: nueva dosis de 2 g IV en 5 min.</li></ul>"},{"h":"Alternativa IM (si no vía IV)","b":"<ul><li>Carga: 4 g IV lento + 10 g IM (5 g en cada glúteo).</li><li>Mantenimiento: 5 g IM cada 4 h.</li></ul>"},{"h":"Vigilancia (obligatoria cada 1-2 h)","b":"<ul><li><b>Reflejos osteotendinosos (ROT)</b>: si abolidos → suspender.</li><li><b>Frecuencia respiratoria</b>: si &lt;12/min → suspender.</li><li><b>Diuresis</b>: si &lt;25 mL/h en 4 h → bajar dosis (se elimina renal).</li><li>Magnesemia si dudas: rango terapéutico 4.8-8.4 mg/dL.</li></ul>"},{"h":"Signos de toxicidad y niveles","b":"<ul><li>Pérdida de ROT: 9-12 mg/dL.</li><li>Depresión respiratoria: 12-18 mg/dL.</li><li>Parada cardíaca: &gt;25 mg/dL.</li></ul>"},{"h":"Antídoto","b":"<ul><li><b>Gluconato cálcico 10% 10 mL IV en 5-10 min</b>.</li></ul>"}]},
{"id":"obst-hellp","evidenceQuery":"HELLP syndrome","cat":"obst","title":"Síndrome HELLP","source":"Manual Obstétrico Crítico · SEGO","tags":"hellp hemolisis enzimas hepaticas plaquetas bajas preeclampsia hematoma hepatico embarazo critico obstetrico","summary":"Hemólisis + enzimas hepáticas elevadas + plaquetopenia. Variante grave de preeclampsia con alta mortalidad materna y fetal.","sec":[{"h":"Criterios diagnósticos (Tennessee)","b":"<ul><li><b>H</b> — Hemólisis: LDH &gt;600 U/L, bilirrubina total &gt;1.2 mg/dL, esquistocitos en sangre periférica.</li><li><b>EL</b> — Elevated Liver enzymes: AST/ALT &gt;70 U/L.</li><li><b>LP</b> — Low Platelets: plaquetas &lt;100.000.</li></ul>"},{"h":"Clasificación Mississippi","b":"<ul><li>Clase 1: plaquetas &lt;50.000.</li><li>Clase 2: plaquetas 50.000-100.000.</li><li>Clase 3: plaquetas 100.000-150.000.</li></ul>"},{"h":"Clínica","b":"<ul><li>Dolor en HCD/epigastrio, náuseas, vómitos.</li><li>HTA (85%), proteinuria.</li><li>Cefalea, malestar general.</li><li>Complicaciones: <b>hematoma subcapsular hepático</b>, insuficiencia hepática, CID, DPPNI, IRA, edema pulmonar, ictus.</li></ul>"},{"h":"Actuación","b":"<ol><li>Ingreso en unidad materno-fetal / UCI.</li><li><b>Sulfato magnesio</b> (profilaxis convulsiones).</li><li>Antihipertensivos IV si PA ≥160/110.</li><li><b>Corticoides</b>: dexametasona 10 mg IV c/12 h (maduración pulmonar fetal y mejora plaquetopenia).</li><li>Transfusión de plaquetas si &lt;20.000 o &lt;50.000 con sangrado/cesárea.</li><li><b>Finalizar la gestación</b> como en preeclampsia grave.</li><li>Vigilancia postparto: puede empeorar 24-48 h después.</li></ol>"}]},
{"id":"obst-hemorragia-postparto","evidenceQuery":"postpartum hemorrhage management","cat":"obst","title":"Hemorragia postparto — Protocolo 4T","source":"Manual Obstétrico Crítico · SEGO/RCOG","tags":"hemorragia postparto hpp atonia uterina tono trauma tejido trombina 4t oxitocina misoprostol ergometrina obstetrico critico","summary":"Pérdida >500 mL vaginal o >1000 mL cesárea. Causas 4T: Tono, Trauma, Tejido, Trombina.","sec":[{"h":"Definición y gravedad","b":"<ul><li>Pérdida ≥500 mL tras parto vaginal o ≥1000 mL tras cesárea.</li><li>Grave: pérdida &gt;1500 mL o inestabilidad hemodinámica.</li><li>Primera causa de mortalidad materna mundial.</li></ul>"},{"h":"Causas 4T","b":"<ul><li><b>T — Tono</b> (70%): <b>atonía uterina</b>.</li><li><b>T — Trauma</b> (20%): laceraciones cervicales, vaginales, perineales; rotura uterina; hematomas.</li><li><b>T — Tejido</b> (10%): retención placentaria o restos.</li><li><b>T — Trombina</b> (1%): coagulopatía (CID, HELLP, embolia LA).</li></ul>"},{"h":"Actuación general","b":"<ol><li><b>ABC</b>: 2 vías gruesas, O2, monitorización, sondaje vesical.</li><li>Analítica urgente: hemograma, coagulación, fibrinógeno, cruzar sangre.</li><li>Cristaloides + hemoderivados según pérdida.</li><li>Ácido tranexámico 1 g IV en los primeros 3 h (WOMAN trial).</li><li>Buscar causa (revisión canal blando, ecografía).</li></ol>"},{"h":"Uterotónicos (por escalones)","b":"<ol><li><b>Oxitocina</b>: 5 UI IV lento + perfusión 20-40 UI en 1000 mL SF a 60 gotas/min.</li><li><b>Ergometrina (Methergin)</b>: 0.25 mg IM o IV lento; contraindicada en HTA/preeclampsia.</li><li><b>Carboprost (Hemabate)</b>: 250 μg IM cada 15 min (máx 8 dosis); contraindicado en asma.</li><li><b>Misoprostol</b>: 800-1000 μg rectal o sublingual.</li></ol>"},{"h":"Medidas mecánicas y quirúrgicas","b":"<ul><li>Masaje uterino bimanual.</li><li><b>Balón de Bakri</b> (taponamiento intrauterino).</li><li><b>Suturas B-Lynch</b> (compresión uterina).</li><li>Ligadura de arterias uterinas / hipogástricas.</li><li>Embolización arterial selectiva si disponible.</li><li><b>Histerectomía obstétrica</b> como último recurso.</li></ul>"},{"h":"Transfusión masiva","b":"<ul><li>Ratio 1:1:1 (CH:PFC:plaquetas).</li><li>Fibrinógeno &lt;2 g/L: crioprecipitado o fibrinógeno concentrado.</li><li>Complejo protrombínico si sangrado activo por ACO.</li></ul>"}]},
{"id":"obst-parada-embarazada","evidenceQuery":"cardiac arrest pregnancy","cat":"obst","title":"Parada cardiorrespiratoria en embarazada","source":"Manual Obstétrico Crítico · AHA/ERC","tags":"parada cardiorrespiratoria embarazada rcp desplazamiento uterino izquierdo cesarea perimortem 4 5 minutos obstetrico critico","summary":"RCP con desplazamiento manual uterino izquierdo + cesárea perimortem a los 4 minutos si no RCE.","sec":[{"h":"Causas específicas","b":"<ul><li>Embolia de líquido amniótico.</li><li>Hemorragia obstétrica.</li><li>Preeclampsia/eclampsia complicadas.</li><li>Sepsis materna.</li><li>TEP.</li><li>Anafilaxia (alergia a anestésico).</li><li>Cardiopatía preexistente.</li></ul>"},{"h":"Modificaciones a la RCP estándar","b":"<ul><li><b>Compresiones torácicas en el mismo punto</b> (mitad inferior del esternón).</li><li><b>Desplazamiento manual del útero hacia la izquierda</b> (a partir de las 20 semanas o si útero palpable en ombligo) — descomprime la vena cava inferior.</li><li>Ventilación estándar; intubación precoz (mayor riesgo de aspiración, vía aérea difícil).</li><li>Desfibrilar con energía estándar; no daña al feto.</li><li>Fármacos habituales (adrenalina, amiodarona) en dosis estándar.</li></ul>"},{"h":"Cesárea perimortem","b":"<ul><li><b>Si no hay RCE tras 4 minutos de RCP correcta → cesárea perimortem</b>.</li><li>Objetivo: extraer feto <b>en el minuto 5</b>.</li><li>Beneficio doble: mejora RCP materna (descompresión aortocava) y salva al feto viable (&gt;20-24 sem).</li><li>Se realiza <b>en el sitio de la RCP</b>, sin traslado a quirófano.</li><li>Instrumentos mínimos: bisturí, torundas, pinzas de cordón. Anestesia no necesaria.</li></ul>"},{"h":"Post-cesárea","b":"<ul><li>Continuar RCP materna.</li><li>Neonatología para el recién nacido.</li><li>Buscar causa reversible (embolia LA, TEP, hemorragia).</li></ul>"}]},
{"id":"obst-embolia-lam","evidenceQuery":"amniotic fluid embolism","cat":"obst","title":"Embolia de líquido amniótico","source":"Manual Obstétrico Crítico · SEGO","tags":"embolia liquido amniotico ela colapso hemodinamico coagulopatia parto cesarea sindrome anafilactoide obstetrico critico","summary":"Colapso cardiovascular brusco durante el parto/postparto + fallo respiratorio + CID. Alta mortalidad. Manejo de soporte.","sec":[{"h":"Clínica clásica (tríada)","b":"<ol><li><b>Hipotensión / shock</b> súbito.</li><li><b>Insuficiencia respiratoria aguda</b> hipoxémica.</li><li><b>CID</b> con hemorragia.</li></ol><p>Puede empezar como convulsión, disnea o colapso durante el parto, cesárea, hasta 30 min postparto.</p>"},{"h":"Diagnóstico","b":"<ul><li><b>Es un diagnóstico clínico de exclusión</b>: no hay prueba confirmatoria disponible en tiempo real.</li><li>Excluir: TEP, IAM, hemorragia, sepsis, eclampsia, anafilaxia.</li><li>Post mortem: escamas fetales, mucina o pelos en vasos pulmonares.</li></ul>"},{"h":"Manejo","b":"<ol><li><b>ABC</b>: intubación precoz, O2 100%, ventilación protectora si SDRA.</li><li>Vías gruesas, transfusión masiva 1:1:1.</li><li><b>Vasopresores</b>: noradrenalina + adrenalina si es preciso.</li><li>Ecocardiografía: fallo de VD frecuente; considerar inotrópicos, óxido nítrico inhalado, milrinona.</li><li>Corrección de coagulopatía: PFC, plaquetas, fibrinógeno, crioprecipitado.</li><li>Ácido tranexámico 1 g IV.</li><li>Si arresto → RCP + cesárea perimortem a los 4 min.</li><li>ECMO en centros con capacidad si refractario.</li></ol>"}]},
{"id":"obst-sepsis-obstetrica","evidenceQuery":"maternal sepsis","cat":"obst","title":"Sepsis obstétrica y puerperal","source":"Manual Obstétrico Crítico · Surviving Sepsis + SEGO","tags":"sepsis obstetrica puerperal corioamnionitis endometritis pielonefritis embarazo antibiotico critico obstetrico","summary":"Sepsis en embarazada/puérpera; focos frecuentes: corioamnionitis, endometritis, ITU/pielonefritis, aborto séptico.","sec":[{"h":"Reconocimiento","b":"<ul><li>Fisiología del embarazo enmascara la sepsis: FC/FR basales altas, hipotensión relativa.</li><li>Signos de alarma: fiebre &gt;38°, hipotermia &lt;36°, FC &gt;110, FR &gt;24, alteración del sensorio, oliguria, saturación &lt;95%.</li><li>Herramientas: qSOFA/SOFA obstétrica (omqSOFA).</li></ul>"},{"h":"Focos frecuentes","b":"<ul><li><b>Corioamnionitis</b>: fiebre + leucocitosis + taquicardia materna/fetal + útero doloroso, líquido amniótico purulento.</li><li><b>Endometritis puerperal</b>: fiebre y dolor uterino los primeros días postparto.</li><li><b>Pielonefritis</b>: fiebre + dolor lumbar + tira orina positiva.</li><li><b>Aborto séptico</b>: fiebre + sangrado y dolor pélvico tras aborto.</li><li>Mastitis, herida quirúrgica, TVP séptica pélvica.</li></ul>"},{"h":"Antibioterapia empírica","b":"<ul><li><b>Corioamnionitis / endometritis</b>: Ampicilina 2 g IV c/6 h + Gentamicina 5 mg/kg/24 h ± Clindamicina 900 mg c/8 h.</li><li><b>Pielonefritis</b>: Ceftriaxona 2 g/día.</li><li><b>Sepsis grave / origen no aclarado</b>: Piperacilina-Tazobactam 4/0.5 g c/8 h o Meropenem 1 g c/8 h.</li><li>Añadir Vancomicina si sospecha SARM (heridas, catéteres).</li></ul>"},{"h":"Bundle 1 hora + medidas obstétricas","b":"<ul><li>Bundle de sepsis (lactato, hemocultivos, antibiótico, cristaloides 30 mL/kg, vasopresores).</li><li><b>Control del foco</b>: legrado en aborto séptico, retirada de retención en endometritis, drenaje absceso, retirar catéter infectado.</li><li>Si viable: monitorización fetal continua.</li><li>Extracción fetal en sepsis materna grave / shock que no mejora, o si corioamnionitis con feto a término.</li></ul>"}]},
{"id":"obst-hta-embarazo","evidenceQuery":"hypertension pregnancy management","cat":"obst","title":"Hipertensión en el embarazo — Clasificación y fármacos","source":"Manual Obstétrico Crítico · SEGO","tags":"hipertension embarazo cronica gestacional preeclampsia antihipertensivos labetalol alfametildopa nifedipino contraindicados iecas obstetrico","summary":"HTA crónica, gestacional, preeclampsia y HTA crónica con preeclampsia sobreañadida; fármacos seguros y contraindicados.","sec":[{"h":"Clasificación","b":"<ul><li><b>HTA crónica</b>: previa al embarazo o antes de sem 20.</li><li><b>HTA gestacional</b>: aparece &gt;sem 20, sin proteinuria, normaliza en 12 sem posparto.</li><li><b>Preeclampsia</b>: HTA + proteinuria &gt;300 mg/24 h o alteración de órgano diana.</li><li><b>HTA crónica con preeclampsia sobreañadida</b>: empeoramiento brusco + proteinuria nueva o daño orgánico.</li></ul>"},{"h":"Objetivos de PA","b":"<ul><li>HTA crónica sin daño orgánico: PA &lt;140/90.</li><li>HTA severa (≥160/110): tratamiento inmediato.</li><li>Evitar descenso brusco de PA (hipoperfusión placentaria y fetal).</li></ul>"},{"h":"Fármacos seguros","b":"<ul><li><b>Alfametildopa</b>: 250-500 mg c/8-12 h VO (crónica, primera línea histórica).</li><li><b>Labetalol</b>: 100-400 mg c/8-12 h VO / 20 mg IV bolo (aguda).</li><li><b>Nifedipino</b>: 10-30 mg c/8 h VO (evitar sublingual por caída brusca).</li><li><b>Hidralazina</b>: 5-10 mg IV cada 20-30 min (aguda).</li></ul>"},{"h":"Fármacos CONTRAINDICADOS","b":"<ul><li><b>IECA (enalapril, captopril…)</b>: teratogénicos, oligohidramnios, IR neonatal.</li><li><b>ARA-II (losartán, valsartán…)</b>: igual que IECAs.</li><li>Aliskiren.</li><li>Nitroprusiato: solo casos extremos, corto tiempo (toxicidad por cianuro).</li><li>Diuréticos: no rutinarios (empeoran hipoperfusión placentaria).</li></ul>"},{"h":"Recomendaciones","b":"<ul><li>AAS 100-150 mg desde sem 12-16 si alto riesgo de preeclampsia.</li><li>Suplementación con calcio si baja ingesta.</li><li>Monitorización fetal ecográfica y de bienestar.</li></ul>"}]},
{"id":"ped-rcp-pediatrica","evidenceQuery":"pediatric cardiac arrest resuscitation","cat":"ped","title":"RCP pediátrica — Algoritmo y dosis","source":"Manual Pediátrico Crítico · ERC/AHA 2021","tags":"rcp pediatrica ninos lactantes compresiones ventilaciones adrenalina amiodarona dosis peso pediatria critico","summary":"Compresiones 15:2 (2 reanimadores), profundidad 1/3 diámetro AP; adrenalina 0.01 mg/kg.","sec":[{"h":"Reconocimiento","b":"<ul><li>Inconsciente + no respira o gasping + sin pulso (comprobar &lt;10 s).</li><li><b>Lactante</b>: pulso braquial o femoral.</li><li><b>Niño</b>: pulso carotídeo o femoral.</li></ul>"},{"h":"Compresiones","b":"<ul><li><b>Lactante</b>: dos dedos (1 reanimador) o técnica de rodear el tórax con dos pulgares (2 reanimadores). Sobre el esternón, un dedo debajo de la línea intermamilar.</li><li><b>Niño</b>: talón de la mano (1 o 2 según tamaño), mitad inferior del esternón.</li><li><b>Profundidad</b>: al menos 1/3 del diámetro anteroposterior (≈4 cm en lactante, 5 cm en niño).</li><li><b>Frecuencia</b>: 100-120/min.</li></ul>"},{"h":"Ratio compresión:ventilación","b":"<ul><li><b>Sin vía aérea avanzada</b>: 15:2 con 2 reanimadores, 30:2 con 1.</li><li><b>Con IOT</b>: compresiones continuas + 1 ventilación cada 2-3 s (20-30/min).</li></ul>"},{"h":"Fármacos (peso real o estimado)","b":"<ul><li><b>Adrenalina 0.01 mg/kg IV/IO</b> (0.1 mL/kg de la dilución 1:10.000), <b>máx 1 mg</b>. Cada 3-5 min.</li><li>Adrenalina IT (si no vía): 0.1 mg/kg (10 veces la dosis).</li><li><b>Amiodarona 5 mg/kg IV/IO bolo</b> tras 3er choque en FV/TVSP (máx 300 mg). Se puede repetir.</li><li>Bicarbonato 1 mEq/kg si acidosis grave / paro prolongado.</li></ul>"},{"h":"Desfibrilación","b":"<ul><li>Primer choque: <b>4 J/kg</b>.</li><li>Siguientes choques: <b>4-10 J/kg</b> (no superar dosis adulta).</li><li>Palas de lactante &lt;10 kg; palas de adulto &gt;10 kg.</li></ul>"},{"h":"Causas reversibles (4H/4T)","b":"<ul><li>Igual que adulto, pero <b>hipoxia</b> es la más frecuente en niños.</li></ul>"}]},
{"id":"ped-peso-equipamiento","evidenceQuery":"pediatric weight estimation Broselow","cat":"ped","title":"Peso pediátrico y equipamiento (Broselow)","source":"Manual Pediátrico Crítico · Broselow","tags":"peso pediatrico broselow cinta color estimacion equipamiento tet sonda desfibrilador pediatria critico formula","summary":"Fórmulas de estimación de peso y equipamiento según edad/peso — clave para dosis y material.","sec":[{"h":"Fórmulas de estimación de peso","b":"<ul><li><b>0-12 meses</b>: peso (kg) = (edad en meses + 9) / 2.</li><li><b>1-5 años</b>: peso (kg) = 2 × edad + 8.</li><li><b>6-12 años</b>: peso (kg) = 3 × edad + 7.</li><li>Otra opción rápida (APLS): peso = (edad + 4) × 2.</li></ul>"},{"h":"Cinta de Broselow","b":"<ul><li>Método más fiable si disponible.</li><li>Mide longitud del niño y asigna código de color con dosis y equipamiento predefinidos.</li></ul>"},{"h":"Tubo endotraqueal (TET)","b":"<ul><li><b>Sin balón</b>: diámetro (mm) = edad/4 + 4.</li><li><b>Con balón</b>: diámetro (mm) = edad/4 + 3.5.</li><li>Lactantes: 3.5-4.0 sin balón / 3.0-3.5 con balón.</li><li>Profundidad de inserción: 3 × diámetro del TET.</li></ul>"},{"h":"Otros equipos","b":"<ul><li>Sonda vesical: 2 × diámetro TET.</li><li>Sonda nasogástrica: 2 × diámetro TET.</li><li>Drenaje pleural: 4 × diámetro TET.</li><li>Laringoscopio: pala recta (Miller) 0 en RN, 1 en lactante; curva (Macintosh) 2 en niño, 3 en adolescente.</li></ul>"},{"h":"Desfibrilación pediátrica","b":"<ul><li>Palas pediátricas si peso &lt;10 kg o &lt;1 año.</li><li>Dosis desfibrilación: 4 J/kg.</li><li>Cardioversión sincronizada: 1 J/kg, luego 2 J/kg.</li></ul>"}]},
{"id":"ped-bronquiolitis","evidenceQuery":"severe bronchiolitis infant","cat":"ped","title":"Bronquiolitis grave del lactante","source":"Manual Pediátrico Crítico · SEIP","tags":"bronquiolitis grave lactante vrs virus respiratorio sincitial hipoxia apneas oxigeno nasal hidratacion pediatria critico","summary":"Lactante <2 años con IVRA, disnea espiratoria, sibilancias y trabajo respiratorio. Manejo de soporte con O2 e hidratación.","sec":[{"h":"Definición","b":"<ul><li>Primer episodio de dificultad respiratoria con sibilancias/crepitantes en lactante &lt;24 meses (típicamente &lt;12).</li><li>Etiología más frecuente: VRS. También rinovirus, metapneumovirus.</li><li>Estacional (otoño-invierno).</li></ul>"},{"h":"Signos de gravedad","b":"<ul><li><b>Apneas</b> (especialmente &lt;3 meses o prematuros).</li><li>Trabajo respiratorio importante (tiraje, aleteo, quejido).</li><li>SpO2 &lt;92% (con O2 ambiente).</li><li>FR &gt;70 en &lt;12 meses o &gt;60 en &gt;12 meses.</li><li>Rechazo del alimento, deshidratación.</li><li>Palidez, cianosis, alteración de conciencia.</li></ul>"},{"h":"Escalas","b":"<ul><li><b>Wood-Downes-Ferrés</b> o <b>ESBA</b>: valoran sibilancias, tiraje, entrada de aire, FR, FC, SatO2. Guían soporte respiratorio.</li></ul>"},{"h":"Manejo","b":"<ol><li>Aspiración de secreciones (suero fisiológico + aspiración suave nasal).</li><li>Posición semiincorporada.</li><li><b>Oxigenoterapia</b>: gafas nasales, si insuficiente → alto flujo (OAF: 1-2 L/kg/min).</li><li><b>CPAP/VNI</b> si SDRA leve o fallo con OAF.</li><li><b>Intubación y VM</b> si apneas graves, agotamiento, hipercapnia refractaria.</li><li>Hidratación: si no tolera oral, SNG o IV al 70% de necesidades basales.</li><li>Aislamiento por contacto y gotas.</li></ol>"},{"h":"NO recomendado de forma rutinaria","b":"<ul><li>Broncodilatadores (salbutamol, adrenalina nebulizada): solo ensayo terapéutico si mala respuesta.</li><li>Corticoides.</li><li>Antibióticos (salvo sobreinfección bacteriana).</li><li>Fisioterapia respiratoria en fase aguda.</li><li>Suero hipertónico 3%: efecto marginal.</li></ul>"}]},
{"id":"ped-laringitis","evidenceQuery":"croup management","cat":"ped","title":"Laringitis aguda / crup","source":"Manual Pediátrico Crítico · SEIP","tags":"laringitis aguda crup subglotico tos perruna estridor inspiratorio adrenalina dexametasona pediatria critico","summary":"Niño con tos perruna, estridor inspiratorio y disfonía. Manejo con corticoides y adrenalina nebulizada si grave.","sec":[{"h":"Clínica","b":"<ul><li>Niño 6 meses-6 años.</li><li>Inicio nocturno.</li><li>Tríada: <b>tos perruna, estridor inspiratorio, disfonía</b>.</li><li>Precedido de catarro.</li><li>Fiebre variable.</li></ul>"},{"h":"Diagnóstico diferencial CRÍTICO","b":"<ul><li><b>Epiglotitis</b>: niño de 2-6 años, aspecto tóxico, babeante, sentado en trípode, sin tos, disfagia, estridor severo. <b>Emergencia</b>: no explorar la orofaringe, ir a IOT en quirófano.</li><li><b>Traqueítis bacteriana</b>: fiebre alta, aspecto tóxico, mala respuesta a adrenalina.</li><li><b>Cuerpo extraño</b>: inicio brusco sin catarro previo.</li><li><b>Absceso retrofaríngeo</b>: cuello rígido, dolor.</li></ul>"},{"h":"Escala de Westley","b":"<ul><li><b>Leve</b> (≤2): manejo domiciliario.</li><li><b>Moderado</b> (3-7): observación.</li><li><b>Grave</b> (8-11): ingreso, adrenalina.</li><li><b>Fallo respiratorio</b> (&gt;11): UCI, considerar IOT.</li></ul>"},{"h":"Tratamiento","b":"<ul><li><b>Dexametasona 0.15-0.6 mg/kg VO/IM/IV</b> (máx 10 mg), dosis única. Es el pilar del tratamiento incluso en leves.</li><li>Alternativa: Prednisolona 1-2 mg/kg VO.</li><li>Budesonida 2 mg nebulizada si no tolera oral.</li><li><b>Adrenalina L o racémica nebulizada</b>: <ul><li>Adrenalina 1:1000 <b>0.5 mL/kg</b> (máx 5 mL) sin diluir.</li><li>Efecto máximo a los 30 min, dura ~2 h. Observar 3-4 h por posible efecto rebote.</li></ul></li><li>Oxígeno si SatO2 &lt;92%.</li><li>Mantener al niño tranquilo (agitación empeora obstrucción).</li></ul>"}]},
{"id":"ped-status-asmatico","evidenceQuery":"pediatric status asthmaticus","cat":"ped","title":"Estatus asmático pediátrico","source":"Manual Pediátrico Crítico · GINA 2026 + SEIP","tags":"status asmatico pediatrico crisis asma salbutamol bromuro ipratropio corticoides sulfato magnesio pediatria critico","summary":"Crisis asmática grave refractaria a tratamiento inicial. Salbutamol + bromuro + corticoides ± Mg IV.","sec":[{"h":"Gravedad (Pulmonary Score)","b":"<ul><li>Leve: FR normal, sin tiraje, sibilancias tele-espiratorias.</li><li>Moderada: tiraje intercostal, sibilancias espiratorias, SatO2 91-95%.</li><li>Grave: tiraje intenso, aleteo, sibilancias inspiratorias y espiratorias, SatO2 &lt;91%.</li><li><b>Fallo respiratorio</b>: cianosis, silencio auscultatorio, alteración de conciencia, agotamiento.</li></ul>"},{"h":"Primer escalón","b":"<ul><li><b>O₂ solo si SpO₂ &lt; 92 %</b> — objetivo con O₂: <b>≥ 92 %</b> en ≤ 5 años y <b>92-95 %</b> en 6-11 años (GINA 2026).</li><li><b>Salbutamol nebulizado</b>: 0.15 mg/kg (mín 2.5 mg, máx 5 mg) c/20 min × 3 dosis. Con MDI + cámara: 4-8 puff c/20 min.</li><li><b>Bromuro ipratropio nebulizado</b>: 250 μg (&lt;30 kg) o 500 μg (&gt;30 kg) c/20 min × 3 dosis en las moderadas-graves.</li><li><b>Corticoides sistémicos precoces</b>: Prednisolona 1-2 mg/kg VO (máx 40 mg) o Metilprednisolona 1-2 mg/kg IV.</li></ul>"},{"h":"Segundo escalón (crisis grave / refractaria)","b":"<ul><li><b>Salbutamol nebulizado continuo</b>: 0.5 mg/kg/h.</li><li><b>Sulfato de magnesio IV</b>: 40 mg/kg (máx 2 g) en 20 min.</li><li>Adrenalina IM 0.01 mg/kg (máx 0.5 mg) si sospecha anafilaxia.</li><li>Salbutamol IV: bolo 15 μg/kg en 10 min + perfusión 1-2 μg/kg/min.</li></ul>"},{"h":"Tercer escalón — UCI","b":"<ul><li>VNI: CPAP/BiPAP en fallo respiratorio inminente.</li><li><b>Intubación e IOT</b>: <b>ketamina</b> como inductor (broncodilatador). Ventilación con Vt bajo, tiempo espiratorio largo, hipercapnia permisiva.</li><li>Considerar heliox, sevoflurano inhalado, ECMO en centros con capacidad.</li></ul>"}]},
{"id":"ped-sepsis","evidenceQuery":"pediatric septic shock","cat":"ped","title":"Sepsis y shock séptico pediátrico","source":"Manual Pediátrico Crítico · Surviving Sepsis Pediátrica","tags":"sepsis pediatrica shock septico bundle 1 hora antibiotico cristaloides adrenalina noradrenalina pediatria critico","summary":"Bundle en primera hora: cristaloides 20 mL/kg + antibiótico + hemocultivos + vasopresores si refractario a fluidos.","sec":[{"h":"Reconocimiento","b":"<ul><li>Infección + disfunción cardiovascular u otro órgano.</li><li>Signos clínicos: taquicardia, mala perfusión (relleno capilar &gt;3 s), extremidades frías, hipotensión (signo tardío), oliguria, alteración mental.</li><li>Diferenciar shock <b>frío</b> (fallo miocárdico, mal relleno, extremidades frías) vs <b>caliente</b> (vasodilatado, relleno rápido, extremidades calientes) — común en niños.</li></ul>"},{"h":"Bundle primera hora","b":"<ol><li><b>O2</b>, monitorizar.</li><li><b>Cristaloides IV en bolos de 10-20 mL/kg</b> en 5-10 min, reevaluar cada bolo, hasta 40-60 mL/kg. En zonas sin UCI y sin ventilación: bolos más conservadores.</li><li><b>Antibiótico amplio espectro en la primera hora</b>.</li><li>Hemocultivos y otros cultivos antes del antibiótico (sin retrasar &gt;45 min).</li><li>Lactato, glucemia (corregir hipoglucemia).</li><li>Calcio iónico (frecuente hipocalcemia en niño con sepsis).</li></ol>"},{"h":"Antibioterapia empírica","b":"<ul><li><b>Neonato (0-28 días)</b>: Ampicilina + Cefotaxima + Gentamicina.</li><li><b>Lactante-niño</b>: Cefotaxima o Ceftriaxona 100 mg/kg/día ± Vancomicina 15 mg/kg c/6-8 h si sospecha neumococo resistente o SARM.</li><li><b>Neutropénico</b>: Piperacilina-Tazobactam 300 mg/kg/día en 4 dosis o Meropenem.</li><li><b>Meningitis</b>: Cefotaxima + Vancomicina + Dexametasona 0.15 mg/kg c/6 h en Hib.</li></ul>"},{"h":"Vasopresores","b":"<ul><li>Si shock refractario a 40-60 mL/kg de cristaloides.</li><li><b>Shock frío</b>: Adrenalina 0.05-0.3 μg/kg/min (primera línea en niños).</li><li><b>Shock caliente</b>: Noradrenalina 0.05-1 μg/kg/min.</li><li>Se puede iniciar por vía periférica hasta lograr acceso central.</li><li>Objetivo TAM: adecuada a la edad (percentil 5).</li></ul>"},{"h":"Otras medidas","b":"<ul><li>Hidrocortisona 2 mg/kg si shock refractario a catecolaminas.</li><li>Corrección hipoglucemia: 0.25 g/kg IV.</li><li>Corrección hipocalcemia iónica.</li><li>Transfusión si Hb &lt;7 g/dL en shock estabilizado.</li></ul>"}]},
{"id":"ped-meningitis","evidenceQuery":"pediatric bacterial meningitis","cat":"ped","title":"Meningitis bacteriana pediátrica","source":"Manual Pediátrico Crítico · SEIP","tags":"meningitis bacteriana pediatrica pediatria puncion lumbar dexametasona cefotaxima vancomicina purpura fulminans meningococica critico","summary":"Fiebre + signos meníngeos + alteración de conciencia. Antibiótico y dexametasona precoces salvan vidas.","sec":[{"h":"Clínica según edad","b":"<ul><li><b>Neonato/lactante &lt;3 m</b>: síntomas inespecíficos (fiebre o hipotermia, rechazo del alimento, irritabilidad, fontanela abombada, hipotonía, convulsiones).</li><li><b>Niño mayor</b>: fiebre, cefalea, vómitos, rigidez de nuca, fotofobia, alteración de conciencia.</li><li><b>Meningococemia</b>: petequias, púrpura, shock (fulminante en horas).</li></ul>"},{"h":"Diagnóstico","b":"<ul><li>Punción lumbar (LCR): pleocitosis PMN, glucosa baja, proteínas altas, Gram, cultivo, PCR virus/bacterias.</li><li>Hemocultivos, hemograma, coagulación, PCR, procalcitonina.</li><li><b>Diferir PL y hacer TC craneal antes</b> si: signos focales, papiledema, GCS &lt;10, convulsiones recientes, sospecha de HTIC, inmunosupresión grave.</li><li><b>NO retrasar antibiótico por la PL</b>.</li></ul>"},{"h":"Antibioterapia empírica","b":"<ul><li><b>&gt;3 meses</b>: <b>Cefotaxima 300 mg/kg/día c/6 h</b> (o Ceftriaxona 100 mg/kg/día c/12 h) + <b>Vancomicina 60 mg/kg/día c/6 h</b> (sospecha neumococo resistente).</li><li><b>Neonato-&lt;3 meses</b>: Ampicilina 200-300 mg/kg/día + Cefotaxima + Gentamicina.</li><li><b>Alergia a beta-lactámicos</b>: Vancomicina + Rifampicina.</li></ul>"},{"h":"Dexametasona","b":"<ul><li><b>0.15 mg/kg IV c/6 h × 4 días</b> antes o con la primera dosis del antibiótico (reduce secuelas auditivas en Hib y mortalidad en neumocócica).</li><li>Especialmente en meningitis por Haemophilus y neumococo.</li></ul>"},{"h":"Medidas de soporte","b":"<ul><li>Ingreso en UCI si inestabilidad, alteración conciencia, sepsis grave.</li><li>Fluidoterapia según situación hemodinámica.</li><li>Manejo de HTIC si signos.</li><li>Control de convulsiones.</li><li>Aislamiento respiratorio 24 h si sospecha meningococo/Hib.</li><li>Profilaxis a contactos íntimos en meningocócica (Rifampicina/Ciprofloxacino).</li></ul>"}]},
{"id":"ped-deshidratacion","evidenceQuery":"pediatric dehydration rehydration","cat":"ped","title":"Deshidratación aguda pediátrica","source":"Manual Pediátrico Crítico · OMS + SEUP","tags":"deshidratacion aguda pediatria gastroenteritis vomitos diarrea sales rehidratacion oral suero fisiologico hipoosmolar hiperosmolar critico","summary":"Gravedad por % pérdida de peso; rehidratación oral en leve-moderada, IV en grave o intolerancia.","sec":[{"h":"Grado de deshidratación (% peso corporal perdido)","b":"<ul><li><b>Leve &lt;5%</b>: mucosas algo secas, diuresis conservada, buen estado general.</li><li><b>Moderada 5-10%</b>: mucosas secas, taquicardia, oliguria, ojos hundidos, fontanela deprimida, pliegue cutáneo.</li><li><b>Grave &gt;10%</b>: shock (frío, hipotensión, alteración conciencia, taquipnea, anuria).</li></ul>"},{"h":"Tipo según Na plasma","b":"<ul><li><b>Isotónica</b> (Na 130-150): más frecuente. Rehidratación estándar.</li><li><b>Hipotónica</b> (Na &lt;130): pérdidas &gt; agua, riesgo edema cerebral con reposición rápida.</li><li><b>Hipertónica</b> (Na &gt;150): pérdidas de agua &gt; sodio, corregir lentamente (&lt;10 mEq/L/día).</li></ul>"},{"h":"Rehidratación oral (leve-moderada)","b":"<ul><li>Soluciones de rehidratación oral hipoosmolares (60 mEq/L Na, 75 mmol/L glucosa) — OMS 2002.</li><li><b>Leve</b>: 50 mL/kg en 4 h + reposición de pérdidas.</li><li><b>Moderada</b>: 100 mL/kg en 4 h + reposición.</li><li>A tomas pequeñas y frecuentes (5-10 mL cada 5 min).</li><li>Reintroducir alimentación temprano tras 4 h de rehidratación.</li></ul>"},{"h":"Rehidratación IV","b":"<ul><li>Indicaciones: shock, intolerancia oral, íleo, fracaso de rehidratación oral, deshidratación grave.</li><li><b>Expansión inicial en shock</b>: SF o Ringer lactato 20 mL/kg IV en 10-20 min, repetir hasta 60 mL/kg.</li><li>Mantenimiento y déficit según fórmula Holliday-Segar y % pérdida.</li><li>Añadir potasio cuando el paciente orine.</li><li>Vigilar Na, K, glucemia cada 4-6 h.</li></ul>"},{"h":"Complicaciones y prevención","b":"<ul><li>Edema cerebral en corrección rápida de hipoNa/hiperNa.</li><li>Hipocaliemia (corregir K).</li><li>Hipoglucemia (usar suero glucosalino en mantenimiento).</li></ul>"}]},
{"id":"ped-status-epileptico","evidenceQuery":"pediatric status epilepticus","cat":"ped","title":"Estatus epiléptico pediátrico","source":"Manual Pediátrico Crítico · ILAE","tags":"status epileptico pediatrico convulsion prolongada diazepam midazolam bucal levetiracetam fenitoina uci pediatria critico","summary":"Crisis ≥5 min o repetidas sin recuperación. Escalones farmacológicos con dosis pediátricas.","sec":[{"h":"Definición","b":"<ul><li>Crisis única &gt;5 min o crisis repetidas sin recuperación de conciencia entre ellas.</li><li>Estatus refractario: no cede tras 2 fármacos anticonvulsivantes de primera y segunda línea.</li><li>Estatus superrefractario: persiste ≥24 h tras anestesia general.</li></ul>"},{"h":"Fase inicial (0-5 min): estabilización","b":"<ul><li>ABC: O2, posición lateral, protección cabeza.</li><li>Glucemia capilar. Si &lt;60 mg/dL: <b>Glucosa 2-4 mL/kg de SG10%</b>.</li><li>Vía IV. Monitorización.</li></ul>"},{"h":"Primera línea (5-20 min): benzodiacepinas","b":"<ul><li><b>Midazolam intranasal/bucal 0.3 mg/kg</b> (máx 10 mg) — si no vía.</li><li><b>Diazepam rectal 0.5 mg/kg</b> (máx 10 mg).</li><li><b>Midazolam IM 0.2 mg/kg</b> (máx 10 mg).</li><li><b>Con vía</b>: Diazepam 0.3 mg/kg IV (máx 10 mg) o Midazolam 0.15-0.2 mg/kg IV (máx 10 mg).</li><li>Repetir 1 vez si no cede en 5-10 min.</li></ul>"},{"h":"Segunda línea (20-40 min)","b":"<ul><li><b>Levetiracetam 60 mg/kg IV</b> (máx 4.5 g) en 5-15 min.</li><li><b>Fenitoína / Fosfenitoína 20 mg/kg IV</b> (máx 1.5 g) en 20 min (monitorizar arritmias).</li><li><b>Valproato 40 mg/kg IV</b> (máx 3 g) en 10 min — evitar en &lt;2 años o sospecha de enfermedad mitocondrial.</li></ul>"},{"h":"Tercera línea — Estatus refractario","b":"<ul><li>UCI, IOT.</li><li><b>Midazolam en perfusión</b>: bolo 0.2 mg/kg + perfusión 0.1-2 mg/kg/h.</li><li>Propofol perfusión (evitar &lt;16 años por síndrome de infusión).</li><li>Tiopental o pentobarbital.</li><li>EEG continuo, objetivo: brote-supresión.</li></ul>"},{"h":"Buscar y tratar causa","b":"<ul><li>Iones (Na, glucosa, Ca, Mg).</li><li>Infección SNC (PL con antibioterapia empírica).</li><li>Ingesta de tóxicos.</li><li>Retirada de anticomicial (niño epiléptico conocido).</li><li>Encefalopatía metabólica, TCE, encefalitis autoinmune.</li></ul>"}]},
{"id":"ped-tce","evidenceQuery":"pediatric severe traumatic brain injury","cat":"ped","title":"TCE pediátrico grave","source":"Manual Pediátrico Crítico · SEIP / BTF","tags":"tce pediatrico traumatismo craneoencefalico grave glasgow pediatrico htic pic ppc suero salino hipertonico manitol pediatria critico","summary":"GCS pediátrico ≤8: IOT, neuroprotección, control estricto de PIC y PPC, evitar hipoxia e hipotensión.","sec":[{"h":"Clasificación por Glasgow (adaptado a &lt;5 años)","b":"<ul><li><b>Leve</b>: GCS 13-15.</li><li><b>Moderado</b>: GCS 9-12.</li><li><b>Grave</b>: GCS ≤8.</li></ul><p>En &lt;5 años se usa la escala adaptada con respuestas verbales según edad.</p>"},{"h":"Actuación inicial","b":"<ol><li>ABC, inmovilización cervical.</li><li>O2, ventilación adecuada (normocapnia PaCO2 35-40).</li><li>IOT si GCS ≤8, pérdida de reflejos de vía aérea, hipoxia refractaria, agitación grave.</li><li>Vía IV. Glucemia.</li><li>Evitar y tratar: <b>hipoxia (SatO2 &lt;90%)</b> e <b>hipotensión</b> (dos noxas más deletéreas del cerebro pediátrico).</li></ol>"},{"h":"Objetivos hemodinámicos y respiratorios","b":"<ul><li>SatO2 ≥94%.</li><li>PaCO2 35-40 mmHg (evitar hiperventilación rutinaria).</li><li>PA sistólica según edad (percentil 5):<ul><li>Neonato: &gt;70.</li><li>Lactante: &gt;70 + 2×edad(años).</li><li>Niño &gt;10 años: &gt;90.</li></ul></li><li>PPC objetivo: 40-50 mmHg en &lt;2 años; 50-60 en 2-6 años; &gt;60 en &gt;6 años.</li></ul>"},{"h":"Neuroimagen y neurocirugía","b":"<ul><li>TC craneal urgente en todo TCE moderado-grave.</li><li>Valoración neuroquirúrgica precoz.</li><li>Considerar monitorización PIC en GCS ≤8 + TC alterada o normal con factores de riesgo.</li></ul>"},{"h":"Manejo de HTIC (PIC &gt;20 mmHg)","b":"<ul><li>Cabecera 30°, cabeza en línea media, sedoanalgesia adecuada.</li><li><b>Suero salino hipertónico 3%</b>: 3-5 mL/kg en bolo IV (opción de elección en pediatría).</li><li><b>Manitol 20%</b>: 0.25-1 g/kg IV en 20 min.</li><li>Drenaje de LCR si ventriculostomía.</li><li>Hiperventilación transitoria a PaCO2 30-35 solo como rescate.</li><li>Coma barbitúrico y craniectomía descompresiva en refractarios.</li></ul>"},{"h":"Otras medidas","b":"<ul><li>Antiepilépticos profilácticos (Levetiracetam, Fenitoína) 7 días si TCE grave o convulsión precoz.</li><li>Normotermia (evitar fiebre).</li><li>Nutrición precoz.</li><li>NO corticoides (contraindicados en TCE).</li></ul>"}]},
{"id":"ped-anafilaxia","evidenceQuery":"pediatric anaphylaxis","cat":"ped","title":"Anafilaxia pediátrica","source":"Manual Pediátrico Crítico · EAACI","tags":"anafilaxia pediatrica adrenalina intramuscular dosis peso alimentos alergias adrenalina autoinyectable pediatria critico","summary":"Adrenalina IM 0.01 mg/kg en cara lateral del muslo. Auto-inyectores según peso.","sec":[{"h":"Reconocimiento (2 sistemas afectados)","b":"<ul><li>Piel-mucosas: urticaria, angioedema, prurito.</li><li>Respiratorio: disnea, sibilancias, estridor, hipoxia.</li><li>Cardiovascular: hipotensión, síncope, taquicardia.</li><li>GI: vómitos, diarrea, dolor abdominal.</li></ul>"},{"h":"Adrenalina IM (primera línea, imprescindible)","b":"<ul><li><b>0.01 mg/kg IM en cara lateral del muslo</b>, dilución 1:1000.</li><li>Dosis máxima: 0.5 mg (adolescentes) / 0.3 mg (niños &lt;30 kg).</li><li>Repetir cada 5-15 min si no respuesta.</li><li>Se puede administrar aunque no haya vía IV.</li></ul>"},{"h":"Autoinyectores según peso","b":"<ul><li><b>&lt;7.5 kg</b>: no disponibles (usar jeringa).</li><li><b>7.5-25 kg</b>: 0.15 mg (Jr).</li><li><b>&gt;25-30 kg</b>: 0.30 mg (adulto).</li></ul>"},{"h":"Medidas asociadas","b":"<ul><li>O2 alto flujo.</li><li>Posición decúbito supino con piernas elevadas (Trendelenburg); semi-incorporado si dificultad respiratoria.</li><li>Retirar alérgeno (parar infusión, retirar picadura si posible).</li><li>Fluidos IV 20 mL/kg si hipotensión, repetibles.</li><li>Salbutamol nebulizado 0.15 mg/kg (mín 2.5 mg, máx 5 mg) si broncoespasmo.</li><li>Antihistamínico: Dexclorfeniramina 0.15-0.3 mg/kg IV (máx 5 mg).</li><li>Corticoide: Metilprednisolona 1-2 mg/kg IV o Hidrocortisona 5-10 mg/kg IV.</li><li>Glucagón 20-30 μg/kg IV (máx 1 mg) si toma betabloqueantes.</li></ul>"},{"h":"Observación y alta","b":"<ul><li>Observar 4-6 h por riesgo de reacción bifásica.</li><li>Al alta: prescripción de 2 autoinyectores, plan de acción individualizado, derivación a Alergología.</li></ul>"}]},
{"id":"ped-intoxicaciones","evidenceQuery":"pediatric acute poisoning","cat":"ped","title":"Intoxicaciones agudas pediátricas","source":"Manual Pediátrico Crítico · SEUP","tags":"intoxicaciones pediatricas paracetamol carbon activado antidotos naloxona flumazenil n acetilcisteina pediatria critico","summary":"Manejo general + descontaminación + antídotos específicos. Contactar centro toxicológico (91 5620420).","sec":[{"h":"Principios generales","b":"<ol><li>ABC, monitorización, vía IV.</li><li>Glucemia capilar.</li><li>Identificar el tóxico, la dosis y el tiempo desde la ingesta.</li><li>Contactar con Servicio de Toxicología (España: 91 562 04 20, 24 h).</li></ol>"},{"h":"Descontaminación","b":"<ul><li><b>Carbón activado 1 g/kg</b> (máx 50 g): eficaz en las <b>2 primeras horas</b>. NO usar en: cáusticos, hidrocarburos, metales pesados, sales de litio, alcoholes, alteración de conciencia sin protección vía aérea.</li><li>Lavado gástrico: raramente indicado, solo &lt;1 h post-ingesta de tóxico grave.</li><li>NO inducir el vómito con jarabe de ipecacuana (obsoleto).</li></ul>"},{"h":"Paracetamol","b":"<ul><li>Dosis tóxica: &gt;150 mg/kg (o &gt;7.5 g total).</li><li>Nomograma de Rumack-Matthew a las 4 h desde ingesta.</li><li><b>N-acetilcisteína IV</b>: 150 mg/kg en 200 mL SG5% en 1 h + 50 mg/kg en 4 h + 100 mg/kg en 16 h.</li></ul>"},{"h":"Antídotos más frecuentes","b":"<ul><li><b>Opioides</b>: Naloxona 0.01-0.1 mg/kg IV/IM (máx 2 mg), repetible.</li><li><b>Benzodiacepinas</b>: Flumazenil 0.01 mg/kg IV (máx 0.2 mg), repetible. Evitar si convulsiones o coingesta ADT.</li><li><b>Antidepresivos tricíclicos (QRS &gt;100 ms)</b>: Bicarbonato 1 mEq/kg IV.</li><li><b>Betabloqueantes</b>: Glucagón 50-150 μg/kg IV, insulina euglucémica.</li><li><b>Calcioantagonistas</b>: Gluconato Ca 10% 0.6 mL/kg IV, insulina euglucémica, glucagón.</li><li><b>Hierro</b>: Deferoxamina 15 mg/kg/h IV.</li><li><b>Metahemoglobinemia</b>: Azul de metileno 1-2 mg/kg IV.</li><li><b>Anestésicos locales / lipofílicos</b>: Intralipid 20% 1.5 mL/kg IV en 1 min, luego 0.25 mL/kg/min.</li></ul>"},{"h":"Situaciones típicas en niños","b":"<ul><li>Ingesta accidental de medicación de abuelos (antidiabéticos → hipoglucemia grave; digoxina, ACO, calcioantagonistas → letal en 1-2 comprimidos).</li><li>Cáusticos (lejía): NO neutralizar, NO inducir vómito, NO carbón activado. Derivar a endoscopia.</li><li>Hidrocarburos (petróleo, disolventes): riesgo de neumonitis aspirativa.</li><li>Monóxido de carbono: HbCO, O2 100%, valorar cámara hiperbárica.</li></ul>"}]}
,
{"id":"trauma-abcde","evidenceQuery":"trauma primary survey ABCDE","cat":"trauma","title":"Politrauma — Valoración primaria ABCDE","source":"Manual Trauma · ATLS","tags":"politrauma trauma abcde valoracion primaria via aerea ventilacion circulacion discapacidad exposicion critico atls","summary":"Reconocimiento sistemático que prioriza la amenaza vital. Cada letra se resuelve antes de pasar a la siguiente.","sec":[{"h":"A — Airway con control cervical","b":"<ul><li>Inmovilización cervical hasta descartar lesión.</li><li>Apertura vía aérea con maniobra tracción mandibular (no hiperextender).</li><li>Aspiración de secreciones/sangre/vómito.</li><li>Cánula orofaríngea (Guedel) si inconsciente y sin reflejo nauseoso.</li><li><b>Intubación</b> si: GCS ≤8, quemadura vía aérea, apnea, traumatismo maxilofacial grave, incapacidad para proteger la vía aérea.</li><li>Vía aérea quirúrgica (cricotiroidotomía) si intubación imposible.</li></ul>"},{"h":"B — Breathing","b":"<ul><li>O2 15 L/min con mascarilla reservorio.</li><li>Inspección: simetría, heridas soplantes, tórax inestable (flail chest), enfisema.</li><li>Palpación: crepitación, dolor, enfisema subcutáneo.</li><li>Auscultación: hipoventilación unilateral (neumotórax, hemotórax).</li><li>Percusión: timpanismo (neumotórax) vs matidez (hemotórax).</li><li><b>Amenazas vitales inmediatas</b>: neumotórax a tensión (toracocentesis 2º EIC LMC), hemotórax masivo, tórax inestable, taponamiento cardíaco, herida torácica soplante (parche 3 lados).</li></ul>"},{"h":"C — Circulation con control hemorragia","b":"<ul><li>Presión directa sobre hemorragias externas + torniquete si es preciso en extremidad.</li><li>Valorar perfusión: nivel de conciencia, color piel, pulso, relleno capilar, PA.</li><li><b>2 vías gruesas (14-16 G) periféricas</b>. Si no posible: intraóseo o vía central.</li><li>Analítica urgente: hemograma, coagulación, cruce, gasometría con lactato.</li><li>Cristaloides tibios: Ringer lactato, evitar sobrecarga excesiva.</li><li>Hemoderivados según pérdidas: activar <b>protocolo transfusión masiva (PTM) si Shock Index &gt;1</b> o pérdida &gt;30%.</li><li>Ácido tranexámico 1 g IV en las primeras 3 h (CRASH-2).</li><li>Descartar hemorragias ocultas: tórax, abdomen, retroperitoneo (pelvis), muslos, exterior.</li></ul>"},{"h":"D — Disability (neurológico)","b":"<ul><li>Glasgow (GCS).</li><li>Pupilas: tamaño, reactividad, simetría.</li><li>Focalidad motora y sensitiva.</li><li>Glucemia capilar (excluir hipoglucemia).</li><li>Escala AVPU rápida (Alerta, Verbal, Dolor, sin respuesta).</li></ul>"},{"h":"E — Exposure y control de temperatura","b":"<ul><li>Desnudar completamente para exploración.</li><li>Buscar heridas ocultas, incluso en espalda (log-roll).</li><li>Prevenir hipotermia: mantas térmicas, sueros calientes, cubrir tras la exploración.</li><li>Log-roll para movilizar en bloque y explorar dorso.</li></ul>"}]},
{"id":"trauma-valoracion-secundaria","evidenceQuery":"trauma secondary survey","cat":"trauma","title":"Politrauma — Valoración secundaria y AMPLE","source":"Manual Trauma · ATLS","tags":"politrauma valoracion secundaria ample cabeza pies exploracion sistematica traumaimagen critico atls","summary":"Exploración cabeza-pies + historia AMPLE + reevaluación continua tras estabilización primaria.","sec":[{"h":"Cuándo hacerla","b":"<ul><li>Solo después de completar el ABCDE y estabilizar amenazas vitales.</li><li>Si el paciente se descompensa, volver siempre al ABCDE.</li></ul>"},{"h":"AMPLE (historia rápida)","b":"<ul><li><b>A</b> — Alergias.</li><li><b>M</b> — Medicación habitual.</li><li><b>P</b> — Patologías previas.</li><li><b>L</b> — Última ingesta (Last meal).</li><li><b>E</b> — Eventos y mecanismo lesional.</li></ul>"},{"h":"Exploración cabeza-pies","b":"<ul><li><b>Cabeza y cara</b>: heridas, hundimientos, otorragia/rinorragia, hemotímpano, signos de fractura base cráneo (ojos de mapache, signo de Battle).</li><li><b>Cuello</b>: enfisema, ingurgitación yugular, desviación traqueal, palpación de apófisis espinosas cervicales.</li><li><b>Tórax</b>: reevaluar auscultación, palpación, signos de contusión miocárdica.</li><li><b>Abdomen</b>: inspección (contusiones, cinturón), palpación, ECO-FAST.</li><li><b>Pelvis</b>: estabilidad (una sola exploración; si dolor o inestable, no repetir y colocar faja pélvica).</li><li><b>Periné y tacto rectal</b>: sangre, próstata alta (sospecha de lesión uretral).</li><li><b>Extremidades</b>: deformidad, pulsos distales, sensibilidad y motilidad.</li><li><b>Espalda</b>: log-roll con inspección de columna.</li></ul>"},{"h":"Imagen inicial","b":"<ul><li><b>Rx tórax</b>, <b>Rx pelvis</b>, <b>ECO-FAST</b> en la sala de reanimación.</li><li>TC body con contraste (\"Panscan\") en trauma grave estabilizado, con doble/tripe contraste según sospecha.</li><li>AngioTC si sospecha de lesión vascular.</li></ul>"},{"h":"Reevaluación","b":"<ul><li>Constantes cada 5-15 min inicialmente.</li><li>Reevaluar respuesta al tratamiento.</li><li>Nunca dejar de reevaluar por completar historia.</li></ul>"}]},
{"id":"trauma-shock-hemorragico","evidenceQuery":"hemorrhagic shock massive transfusion","cat":"trauma","title":"Shock hemorrágico y protocolo de transfusión masiva","source":"Manual Trauma · ATLS + EUSCT","tags":"shock hemorragico transfusion masiva 1 1 1 acido tranexamico coagulopatia trauma hipotension permisiva critico","summary":"Grados I-IV según pérdida. Objetivo: hipotensión permisiva (PAS 80-90) hasta control quirúrgico, transfusión 1:1:1.","sec":[{"h":"Clasificación (adulto 70 kg, ~5 L sangre)","b":"<ul><li><b>I</b> (&lt;15%, &lt;750 mL): FC &lt;100, FR 14-20, PA normal, ansiedad leve.</li><li><b>II</b> (15-30%, 750-1500 mL): FC 100-120, FR 20-30, PA normal, ansiedad, agitación.</li><li><b>III</b> (30-40%, 1500-2000 mL): FC 120-140, FR 30-40, PA baja, confusión.</li><li><b>IV</b> (&gt;40%, &gt;2000 mL): FC &gt;140, FR &gt;35, PA muy baja o no palpable, letargia. Riesgo vital inminente.</li></ul>"},{"h":"Signos precoces útiles","b":"<ul><li><b>Shock Index (FC/PAS) &gt;1</b>: sospecha shock hemorrágico y activa PTM.</li><li>Lactato &gt;2 mmol/L, déficit de bases &gt;-6.</li><li>Relleno capilar &gt;3 s, extremidades frías, taquicardia con presión conservada.</li></ul>"},{"h":"Hipotensión permisiva","b":"<ul><li>Objetivo PAS 80-90 mmHg (o TAM 65 mmHg) hasta control del sangrado, salvo TCE (mantener TAM ≥80).</li><li>Evita diluir factores y aumentar sangrado por presión excesiva.</li><li>No prolongar en el tiempo.</li></ul>"},{"h":"Protocolo transfusión masiva (PTM)","b":"<ul><li>Activar si Shock Index &gt;1, pérdida estimada &gt;30%, o predictores (ABC score ≥2).</li><li><b>Ratio 1:1:1</b>: 1 CH : 1 PFC : 1 pool plaquetas.</li><li>Fibrinógeno &lt;1.5-2 g/L: <b>Fibrinógeno concentrado 3-6 g IV</b> o crioprecipitado 10 U.</li><li>Calcio: 1 g gluconato cálcico por cada 4 unidades de CH (evitar hipocalcemia por citrato).</li><li>Objetivo: Hb &gt;7-8 g/dL, plaquetas &gt;50.000 (o &gt;100.000 si TCE/sangrado activo), INR &lt;1.5, fibrinógeno &gt;1.5-2 g/L.</li></ul>"},{"h":"Fármacos y control","b":"<ul><li><b>Ácido tranexámico 1 g IV en 10 min + 1 g en 8 h</b>, en las primeras 3 h (CRASH-2, CRASH-3 en TCE).</li><li>Revertir anticoagulación previa (CCP, vitamina K, idarucizumab, andexanet).</li><li>Control quirúrgico o de radiología intervencionista sin demora (\"tríada letal\": acidosis + hipotermia + coagulopatía).</li><li>Mantener temperatura &gt;35°C.</li></ul>"}]},
{"id":"trauma-pelvis","evidenceQuery":"unstable pelvic fracture management","cat":"trauma","title":"Fractura de pelvis inestable","source":"Manual Trauma · ATLS","tags":"fractura pelvis inestable libro abierto open book faja pelvica hemorragia retroperitoneal angioembolizacion critico trauma","summary":"Alta mortalidad por hemorragia retroperitoneal. Faja pélvica inmediata, no manipular, control angio-embolización o cirugía.","sec":[{"h":"Sospecha","b":"<ul><li>Mecanismo de alta energía (atropello, precipitación, aplastamiento).</li><li>Dolor pélvico, deformidad, hematoma perineal/escrotal/labial.</li><li>Sangrado uretral, próstata alta.</li><li>Inestabilidad hemodinámica sin foco claro.</li><li>Rx pelvis en sala de reanimación.</li></ul>"},{"h":"Tipos (Young-Burgess)","b":"<ul><li><b>APC (anteroposterior compression)</b>: \"libro abierto\", diastasis sínfisis. Alta hemorragia.</li><li><b>LC (lateral compression)</b>: fractura ramas + ala sacra. Menos sangrado.</li><li><b>VS (vertical shear)</b>: desplazamiento vertical, muy inestable.</li><li><b>Combinada</b>: peor pronóstico.</li></ul>"},{"h":"Manejo urgente","b":"<ol><li><b>NO reexplorar la pelvis inestable</b> (una sola exploración).</li><li>Colocar <b>faja pélvica</b> (o sábana con torsión) a la altura de <b>trocánteres mayores</b>, no en cresta ilíaca. Cierra el volumen pélvico y comprime plexos venosos.</li><li>Rotación interna de MMII y flexión rodillas para reducir volumen.</li><li>Reanimación con hemoderivados 1:1:1 + ácido tranexámico.</li><li><b>ECO-FAST</b> para descartar hemorragia intraabdominal asociada.</li></ol>"},{"h":"Control de hemorragia","b":"<ul><li><b>Angio-embolización</b>: primera línea si hemorragia arterial (más frecuente en APC).</li><li><b>Packing pélvico extraperitoneal</b>: si inestable con hemorragia venosa refractaria o no disponibilidad de angio.</li><li>Fijador externo pélvico complementario.</li><li>Laparotomía si FAST positivo con sangrado intraabdominal asociado.</li></ul>"},{"h":"Lesiones asociadas frecuentes","b":"<ul><li>Uretra posterior (contraindicado sondaje ciego si sangre en meato o próstata alta).</li><li>Vejiga.</li><li>Recto (tacto rectal siempre).</li><li>Vagina.</li><li>Vasos ilíacos, nervios lumbosacros.</li></ul>"}]},
{"id":"trauma-toracico","evidenceQuery":"severe thoracic trauma","cat":"trauma","title":"Traumatismo torácico grave","source":"Manual Trauma · ATLS","tags":"trauma toracico neumotorax tension hemotorax masivo torax inestable flail chest taponamiento contusion pulmonar critico","summary":"Las 6 amenazas vitales: neumotórax a tensión, abierto, hemotórax masivo, tórax inestable, taponamiento y obstrucción vía aérea.","sec":[{"h":"Neumotórax a tensión","b":"<ul><li>Clínica: disnea, hipotensión, taquicardia, ingurgitación yugular, timpanismo, hipoventilación unilateral, desviación traqueal contralateral.</li><li><b>Diagnóstico clínico, NO esperar Rx</b>.</li><li>Tratamiento: <b>toracocentesis descompresiva con Abbocath 14G en 2º EIC línea medioclavicular</b> (alternativa: 4º-5º EIC línea axilar anterior).</li><li>Después: drenaje torácico definitivo (Pleur-Evac) en 5º EIC LAA.</li></ul>"},{"h":"Neumotórax abierto (herida soplante)","b":"<ul><li>Herida en pared torácica que comunica con pleura, movimiento paradójico de aire.</li><li>Tratamiento: <b>parche oclusivo de 3 lados</b> (válvula unidireccional que deja salir aire pero no entrar) y drenaje torácico separado.</li></ul>"},{"h":"Hemotórax masivo","b":"<ul><li>&gt;1500 mL de sangre en un hemitórax o &gt;200 mL/h durante 4 h.</li><li>Matidez a la percusión, hipoventilación, shock.</li><li>Drenaje torácico grueso (32-36 Fr) en 5º EIC LAA.</li><li>Reanimación con hemoderivados.</li><li>Toracotomía urgente si sangrado inicial &gt;1500 mL o persistente &gt;200 mL/h × 4 h.</li></ul>"},{"h":"Tórax inestable (flail chest)","b":"<ul><li>Fractura de ≥2 costillas consecutivas en ≥2 puntos → segmento con movimiento paradójico.</li><li>Casi siempre asocia contusión pulmonar (verdadera causa de insuficiencia respiratoria).</li><li>Analgesia potente (epidural, PCA, bloqueos), fisioterapia respiratoria.</li><li>Ventilación mecánica solo si fallo respiratorio (no rutinaria).</li><li>Considerar osteosíntesis costal en casos seleccionados.</li></ul>"},{"h":"Taponamiento cardíaco","b":"<ul><li>Tríada de Beck: hipotensión + ingurgitación yugular + tonos cardíacos apagados.</li><li>Pulso paradójico (caída &gt;10 mmHg en inspiración).</li><li>ECO-FAST subxifoidea: derrame + colapso AD/VD.</li><li><b>Pericardiocentesis subxifoidea ecoguiada</b> como puente a cirugía.</li><li>Toracotomía de reanimación si parada por trauma penetrante.</li></ul>"},{"h":"Contusión pulmonar","b":"<ul><li>Puede tardar 6-24 h en aparecer clínicamente.</li><li>Analgesia + humidificación + fisioterapia + O2.</li><li>Restricción hídrica (fluidos empeoran).</li><li>VNI o IOT según evolución gasométrica.</li></ul>"}]},
{"id":"trauma-abdominal","evidenceQuery":"abdominal trauma management","cat":"trauma","title":"Traumatismo abdominal","source":"Manual Trauma · ATLS","tags":"trauma abdominal cerrado penetrante bazo higado eco fast tc laparotomia lavado peritoneal critico","summary":"Cerrado (bazo/hígado más lesionados) o penetrante. FAST + TC dirigen decisión quirúrgica.","sec":[{"h":"Mecanismos","b":"<ul><li><b>Cerrado</b>: accidente tráfico (bazo #1, hígado #2), atropello, precipitación.</li><li><b>Penetrante</b>:<ul><li>Arma blanca: si viola peritoneo, exploración quirúrgica.</li><li>Arma de fuego: laparotomía casi siempre.</li></ul></li></ul>"},{"h":"Exploración","b":"<ul><li>Inspección: contusiones (signo del cinturón, huella de neumático), heridas.</li><li>Palpación: dolor, defensa, contractura.</li><li>Auscultación: peristaltismo (ausente en irritación peritoneal).</li><li>Tacto rectal: sangre.</li></ul>"},{"h":"Diagnóstico","b":"<ul><li><b>ECO-FAST</b>: en el momento en sala de reanimación. Detecta líquido libre.</li><li><b>TC abdominopélvica con contraste IV</b>: exploración de elección en estable. Doble contraste (IV + oral) si sospecha lesión intestinal.</li><li>Lavado peritoneal diagnóstico (LPD): en desuso, solo si no hay eco/TC.</li></ul>"},{"h":"Decisión quirúrgica","b":"<ul><li><b>Inestable + FAST positivo</b>: laparotomía urgente.</li><li><b>Inestable + FAST negativo</b>: buscar otro foco (tórax, pelvis, retroperitoneo). Si duda: LPD o repetir eco.</li><li><b>Estable + FAST/TC positivos</b>: si lesión de víscera hueca, laparotomía. Si lesión sólida contenida, manejo conservador con vigilancia.</li></ul>"},{"h":"Manejo conservador de lesión de víscera sólida","b":"<ul><li>Bazo/hígado grado I-III y hemodinámica estable.</li><li>Ingreso en UCI/observación.</li><li>Monitorización clínica, Hb seriada, ECO/TC de control.</li><li>Angio-embolización si sangrado activo.</li><li>Cirugía si falla el manejo conservador (inestabilidad, caída Hb).</li></ul>"}]},
{"id":"trauma-medular","evidenceQuery":"acute spinal cord injury","cat":"trauma","title":"Lesión medular aguda","source":"Manual Trauma · ATLS + AANS","tags":"lesion medular aguda shock neurogenico espinal columna cervical asia grado corticoides no recomendados critico trauma","summary":"Inmovilizar en bloque, mantener PAM 85-90, no corticoides. Escala ASIA para grado.","sec":[{"h":"Reconocimiento","b":"<ul><li>Traumatismo con déficit neurológico focal, dolor cervical/espalda, priapismo.</li><li>Ausencia de respuesta al dolor por debajo de un nivel.</li><li>Respiración paradójica (paresia intercostal).</li><li>Priorizar inmovilización cervical y en bloque hasta descartar.</li></ul>"},{"h":"Shock neurogénico vs shock espinal","b":"<ul><li><b>Shock neurogénico</b>: lesión ≥T6. <b>Hipotensión + bradicardia + piel caliente</b> por pérdida de tono simpático.</li><li><b>Shock espinal</b>: arreflexia flácida transitoria por debajo del nivel lesional. Se resuelve en días-semanas.</li><li>Tratamiento shock neurogénico: cristaloides + noradrenalina, atropina si bradicardia sintomática.</li></ul>"},{"h":"Escala ASIA","b":"<ul><li><b>A</b>: Completa. Sin función motora ni sensitiva en S4-S5.</li><li><b>B</b>: Incompleta. Función sensitiva conservada bajo el nivel, sin función motora.</li><li><b>C</b>: Incompleta. Función motora conservada bajo el nivel, &gt;50% músculos con fuerza &lt;3.</li><li><b>D</b>: Incompleta. ≥50% de músculos bajo el nivel con fuerza ≥3.</li><li><b>E</b>: Normal.</li></ul>"},{"h":"Manejo","b":"<ul><li>Inmovilización cervical con collarín rígido, tabla espinal (retirar cuanto antes por úlceras) y movilización en bloque.</li><li>ABCDE. IOT con maniobras de estabilización cervical si es preciso.</li><li>Mantener <b>PAM 85-90 mmHg durante 7 días</b> (perfusión medular).</li><li>Descartar y tratar hipoxia.</li><li>Prevención UPP (giros programados, superficie especial).</li><li>Sondaje vesical (retención por vejiga neurógena).</li><li>Profilaxis TVP con HBPM (retrasar 24-72 h si sangrado activo/cirugía).</li><li><b>NO indicados corticoides</b> a dosis altas (metilprednisolona) — evidencia actual no muestra beneficio y aumenta complicaciones.</li></ul>"},{"h":"Diagnóstico por imagen","b":"<ul><li>TC de columna completa como primera línea en trauma grave.</li><li>RM en 24-72 h para valorar médula, ligamentos y disco.</li><li>Interconsulta a Neurocirugía / Traumatología de raquis.</li></ul>"}]},
{"id":"trauma-quemados-superficie","evidenceQuery":"burn surface area assessment","cat":"trauma","title":"Quemados — Superficie corporal quemada y gravedad","source":"Manual Trauma · ABLS","tags":"quemados superficie corporal quemada scq regla nueve wallace lund browder profundidad gravedad criterios traslado unidad critico","summary":"Regla de los 9 en adulto, Lund-Browder en niños. Solo cuentan quemaduras de 2º y 3er grado.","sec":[{"h":"Regla de los 9 (adulto)","b":"<ul><li>Cabeza y cuello: 9%.</li><li>Cada MMSS: 9% (total 18%).</li><li>Cada MMII: 18% (total 36%).</li><li>Tórax anterior: 18%.</li><li>Espalda: 18%.</li><li>Periné: 1%.</li><li>Regla de la palma: la palma del paciente (con dedos) = <b>1% SCQ</b>.</li></ul>"},{"h":"Regla en niños (Lund-Browder)","b":"<ul><li>La cabeza pesa más y las piernas menos que en adulto.</li><li>Lactante: cabeza 18%, MMII 14% cada uno.</li><li>Se ajusta con la edad según tabla de Lund-Browder.</li></ul>"},{"h":"Profundidad","b":"<ul><li><b>1er grado (epidérmica)</b>: eritema, dolor, sin ampolla. Cura sin secuelas. <b>NO cuenta en SCQ</b>.</li><li><b>2º grado superficial (dérmica superficial)</b>: ampollas, dolor intenso, blanquea, edema. Cura en 2-3 semanas.</li><li><b>2º grado profundo (dérmica profunda)</b>: ampollas, poco dolor, moteado, no blanquea. Cura lenta con cicatriz o requiere injerto.</li><li><b>3er grado (subdérmica total)</b>: acartonada, blanca-negra-nacarada, indolora (destrucción de terminaciones). Requiere injerto.</li><li><b>4º grado</b>: afecta a fascia, músculo, hueso.</li></ul>"},{"h":"Criterios de derivación a Unidad de Quemados","b":"<ul><li>2º grado &gt;10% SCQ.</li><li>Cualquier 3er grado.</li><li>Quemadura en cara, manos, pies, genitales, periné, articulaciones mayores.</li><li>Quemadura eléctrica (incluida por rayo), química, con inhalación.</li><li>Quemadura circunferencial en tórax o extremidad.</li><li>Comorbilidad médica significativa.</li><li>Trauma asociado.</li><li>Edad extrema (&lt;10 o &gt;50 años) con SCQ &gt;10%.</li></ul>"},{"h":"Escarotomía","b":"<ul><li>Indicación: quemadura circunferencial que comprime (extremidad con síndrome compartimental, tórax con compromiso ventilatorio).</li><li>Incisiones longitudinales en zonas mediales/laterales, hasta grasa subcutánea, sin anestesia si 3er grado.</li></ul>"}]},
{"id":"trauma-quemados-parkland","evidenceQuery":"burn fluid resuscitation Parkland","cat":"trauma","title":"Quemados — Fluidoterapia (Parkland modificada)","source":"Manual Trauma · ABLS","tags":"quemados fluidoterapia parkland ringer lactato reposicion volumen diuresis objetivo horas post quemadura critico trauma","summary":"4 mL × kg × %SCQ en 24 h con Ringer lactato; mitad en las primeras 8 h. Guiar por diuresis.","sec":[{"h":"Fórmula Parkland modificada","b":"<ul><li><b>Volumen total 24 h = 2-4 mL × peso (kg) × %SCQ</b>.</li><li>Fluido: <b>Ringer lactato</b>.</li><li>Actualmente se prefiere iniciar con <b>2 mL/kg/%SCQ</b> (\"regla del 10\" en centros americanos) y titular.</li><li>Mitad del volumen en las <b>primeras 8 h desde la quemadura</b> (no desde el ingreso).</li><li>Segunda mitad en las 16 h siguientes.</li></ul>"},{"h":"Ejemplo","b":"<ul><li>Adulto 70 kg con 40% SCQ (2ª-3er grado):<ul><li>Volumen total: 2 × 70 × 40 = 5600 mL en 24 h.</li><li>Primeras 8 h: 2800 mL (350 mL/h).</li><li>Siguientes 16 h: 2800 mL (175 mL/h).</li></ul></li></ul>"},{"h":"Objetivos y monitorización","b":"<ul><li><b>Diuresis 0.5 mL/kg/h en adulto</b> (30-50 mL/h).</li><li>Diuresis 1 mL/kg/h en niños &lt;30 kg.</li><li>Diuresis 1-2 mL/kg/h en quemados eléctricos con rabdomiólisis (evitar mioglobinuria).</li><li>Ajustar velocidad al alza o a la baja según diuresis, PA, lactato.</li><li>Evitar sobre-resucitación (\"fluid creep\"): edema, SDRA, síndrome compartimental abdominal.</li></ul>"},{"h":"Cuidados generales","b":"<ul><li>Analgesia potente IV (opioides).</li><li>Prevenir hipotermia (mantas, sueros calientes, sala 28°C).</li><li>Retirar ropa, joyas, restos de material.</li><li>Cubrir con apósitos limpios y secos (o específicos si disponibles).</li><li>Profilaxis antitetánica.</li><li>NO antibióticos profilácticos sistémicos rutinarios.</li><li>Sondaje vesical (control estricto diuresis).</li><li>SNG si SCQ &gt;20% (íleo).</li><li>Nutrición precoz (grandes requerimientos, hipercatabolismo).</li></ul>"}]},
{"id":"trauma-inhalacion-co","evidenceQuery":"smoke inhalation carbon monoxide poisoning","cat":"trauma","title":"Inhalación de humo e intoxicación por CO/cianuro","source":"Manual Trauma · ABLS","tags":"inhalacion humo lesion via aerea monoxido carbono co cianuro cn hidroxocobalamina oxigeno alto flujo camara hiperbarica critico trauma","summary":"Sospechar en incendios en espacio cerrado. O2 100% + hidroxocobalamina si cianuro. Vía aérea con umbral bajo.","sec":[{"h":"Sospecha de lesión inhalatoria","b":"<ul><li>Incendio en espacio cerrado, atrapamiento.</li><li>Quemaduras faciales, esputo carbonáceo, vibrisas quemadas.</li><li>Ronquera, estridor, disfonía, disfagia.</li><li>Alteración de conciencia.</li><li>CO-oximetría con HbCO elevada.</li></ul>"},{"h":"Actuación inmediata","b":"<ul><li>Retirar del ambiente.</li><li><b>O2 100% con mascarilla reservorio</b> desde el primer momento (independientemente de SatO2).</li><li>Considerar IOT precoz si signos de compromiso de vía aérea (progresa rápido con el edema).</li><li>Broncodilatadores nebulizados si broncoespasmo.</li></ul>"},{"h":"Intoxicación por monóxido de carbono","b":"<ul><li>Se une a Hb con afinidad 240 veces mayor que O2 → hipoxia tisular.</li><li>SatO2 con pulsioxímetro NO es fiable (mide oxi + carboxi como oxigenada).</li><li>Diagnóstico: HbCO en gasometría con CO-oximetría.</li><li>Clínica: cefalea, náuseas, mareo (leve); confusión, síncope (moderada); coma, convulsiones, isquemia (grave).</li><li><b>Vida media HbCO</b>: aire ambiente 5-6 h; O2 100% 60-90 min; cámara hiperbárica 20 min.</li></ul>"},{"h":"Indicaciones de cámara hiperbárica","b":"<ul><li>HbCO &gt;25% (o &gt;15% en embarazada).</li><li>Alteración neurológica (síncope, coma, focalidad).</li><li>Isquemia miocárdica.</li><li>Acidosis metabólica persistente.</li><li>Embarazo con HbCO &gt;15%.</li></ul>"},{"h":"Intoxicación por cianuro","b":"<ul><li>Sospecha: incendio + shock refractario + acidosis metabólica con lactato &gt;10 mmol/L + coma.</li><li>Bloquea cadena respiratoria mitocondrial.</li><li><b>Hidroxocobalamina (Cyanokit) 5 g IV en 15 min</b>, repetible hasta 10 g. Antídoto de elección.</li><li>Alternativa: nitrito de sodio + tiosulfato (obsoleto por efectos secundarios y metahemoglobinemia).</li><li>Precaución: hidroxocobalamina puede colorear orina, piel y muestras de rojo intenso (interfiere en analíticas).</li></ul>"}]},
{"id":"trauma-quemados-electricos","evidenceQuery":"electrical chemical burns","cat":"trauma","title":"Quemaduras eléctricas y químicas","source":"Manual Trauma · ABLS","tags":"quemaduras electricas alto voltaje bajo voltaje rabdomiolisis mioglobinuria arritmias quimicas acidos alcalis lavado abundante trauma critico","summary":"Eléctricas: rabdomiólisis, arritmias, lesiones internas ocultas. Químicas: lavado abundante 20-60 min.","sec":[{"h":"Quemaduras eléctricas — clasificación","b":"<ul><li><b>Bajo voltaje (&lt;1000 V)</b>: corriente doméstica. Lesiones locales.</li><li><b>Alto voltaje (≥1000 V)</b>: red eléctrica, industrial. Lesiones profundas graves con daño interno muy superior al externo.</li><li><b>Rayo</b>: lesión ultrarápida, alta letalidad por parada, puede tener pocas quemaduras externas.</li></ul>"},{"h":"Consecuencias específicas","b":"<ul><li><b>Cardíacas</b>: arritmias (FV, TV), IAM, parada. ECG y monitorización 24-48 h en toda alta tensión.</li><li><b>Musculares</b>: rabdomiólisis (CK muy elevada), síndrome compartimental.</li><li><b>Renales</b>: fallo renal por mioglobinuria.</li><li><b>Neurológicas</b>: confusión, convulsiones, lesión medular por caída, neuropatías tardías.</li><li><b>Óseas</b>: fracturas por tetania muscular.</li></ul>"},{"h":"Manejo","b":"<ol><li>Seguridad: NO tocar al paciente hasta desconectar corriente.</li><li>ABCDE, monitorización cardíaca.</li><li>Fluidoterapia agresiva: <b>diuresis objetivo 1-2 mL/kg/h</b> (adulto).</li><li>Alcalinización de orina si mioglobinuria: bicarbonato 1M para pH orina &gt;6.5.</li><li>Valorar y tratar síndrome compartimental (fasciotomías).</li><li>Analgesia potente.</li><li>Ingreso siempre en alta tensión.</li></ol>"},{"h":"Quemaduras químicas","b":"<ul><li><b>Lavado abundante con agua tibia</b> durante 20-60 min (más si álcalis).</li><li>Retirar ropa contaminada con precaución (EPI para personal).</li><li>NO neutralizar (calor de reacción empeora).</li><li>Álcalis (lejía, cal): penetración más profunda que ácidos, lavado más prolongado.</li><li>Ácido fluorhídrico: gluconato cálcico gel tópico + Ca IV (quela el fluoruro).</li><li>Fósforo blanco: cubrir con agua o suero (no dejar secar, se inflama con el aire).</li><li>Quemadura ocular química: lavado con SF durante 15-30 min inmediatamente.</li></ul>"}]},
{"id":"uci-toxidromes","evidenceQuery":"toxidromes poisoning syndromes","cat":"uci","title":"Síndromes tóxicos (toxidromes)","source":"Manual UCI · Toxicología clínica","tags":"toxidromes sindromes toxicos anticolinergico colinergico simpaticomimetico opioide sedante serotoninergico critico intoxicacion uci","summary":"Los 5 toxidromes principales orientan el diagnóstico y guían la búsqueda de antídoto.","sec":[{"h":"Anticolinérgico","b":"<ul><li>\"Rojo como remolacha, seco como hueso, ciego como topo, loco como cabra, caliente como horno\".</li><li>Midriasis, taquicardia, HTA, hipertermia, piel seca y roja, retención urinaria, íleo, delirio.</li><li>Causas: atropina, escopolamina, antihistamínicos, tricíclicos, estramonio, setas.</li><li>Antídoto: <b>fisostigmina</b> (si toxicidad grave sin QRS ancho).</li></ul>"},{"h":"Colinérgico","b":"<ul><li>SLUDGE: Salivación, Lagrimeo, Urinación, Defecación, GI cramps, Emesis.</li><li>Miosis, bradicardia, hipotensión, broncorrea, broncoespasmo, fasciculaciones, convulsiones.</li><li>Causas: organofosforados, carbamatos (insecticidas), setas, fisostigmina.</li><li>Antídoto: <b>atropina 2-5 mg IV c/5 min</b> hasta secar secreciones + <b>pralidoxima</b> (reactivador colinesterasa) en organofosforados.</li></ul>"},{"h":"Simpaticomimético","b":"<ul><li>Midriasis, taquicardia, HTA, hipertermia, diaforesis, agitación, psicosis, convulsiones.</li><li>Piel húmeda (a diferencia del anticolinérgico).</li><li>Causas: cocaína, anfetaminas, MDMA, cafeína, teofilina.</li><li>Tratamiento: benzodiacepinas (diazepam, midazolam), soporte, hidratación.</li></ul>"},{"h":"Opioide","b":"<ul><li>Tríada: <b>miosis + depresión respiratoria + coma</b>.</li><li>Bradicardia, hipotensión, hipotermia.</li><li>Causas: heroína, morfina, fentanilo, metadona, tramadol.</li><li>Antídoto: <b>naloxona 0.04-2 mg IV</b>, repetible; perfusión si opioide de vida larga.</li></ul>"},{"h":"Sedante-hipnótico","b":"<ul><li>Depresión SNC, confusión, disartria, ataxia, coma sin depresión respiratoria (a dosis moderadas).</li><li>Pupilas normales, PA y FC generalmente conservadas.</li><li>Causas: benzodiacepinas, zolpidem, alcohol, barbitúricos, GHB.</li><li>Antídoto BZD: <b>flumazenil 0.2 mg IV</b>, con precaución (convulsiones si epiléptico o coingesta ADT).</li></ul>"},{"h":"Serotoninérgico","b":"<ul><li>Tríada: alteración estado mental + hiperactividad autonómica + hiperactividad neuromuscular (clonus, rigidez, hiperreflexia).</li><li>Diaforesis, fiebre.</li><li>Causas: ISRS + IMAO, tramadol, MDMA, litio, linezolid combinaciones.</li><li>Tratamiento: retirar fármaco, BZD, sueroterapia, ciproheptadina en casos moderados-graves.</li></ul>"}]},
{"id":"uci-golpe-calor","evidenceQuery":"heat stroke management","cat":"uci","title":"Golpe de calor / Hipertermia grave","source":"Manual UCI · Termorregulación","tags":"golpe calor hipertermia grave clasica esfuerzo enfriamiento activo fallo multiorganico dantroleno hipertermia maligna neuroleptico critico uci","summary":"Tª central >40°C + alteración de conciencia. Enfriamiento rápido a <39°C en 30 min.","sec":[{"h":"Formas clínicas","b":"<ul><li><b>Golpe de calor clásico</b>: ancianos con enfermedad crónica en ola de calor, sin ejercicio. Piel seca (anhidrótica).</li><li><b>Golpe de calor por esfuerzo</b>: jóvenes/deportistas/militares tras ejercicio intenso en calor. Piel húmeda con sudor.</li><li>Ambos: Tª central &gt;40°C + alteración de conciencia (delirio, convulsiones, coma).</li></ul>"},{"h":"Complicaciones","b":"<ul><li>Rabdomiólisis con IRA y mioglobinuria.</li><li>CID.</li><li>Fallo hepático fulminante.</li><li>SDRA, arritmias, isquemia intestinal.</li><li>Fallo multiorgánico → mortalidad alta.</li></ul>"},{"h":"Enfriamiento rápido (crítico en primeras horas)","b":"<ul><li><b>Objetivo: bajar Tª central a &lt;39°C en 30 min</b>.</li><li><b>Golpe por esfuerzo</b>: inmersión en agua fría (efectivo).</li><li><b>Golpe clásico</b>: rociado + ventilador, hielo en cuello/axilas/ingles, mantas de enfriamiento, lavado gástrico/vesical con SF frío.</li><li><b>Casos graves</b>: enfriamiento intravascular, TCRR con circuito frío.</li><li>Parar enfriamiento activo al llegar a 38.5°C (evitar hipotermia rebote).</li></ul>"},{"h":"Soporte","b":"<ul><li>Fluidoterapia guiada por diuresis (evitar sobrecarga).</li><li>Benzodiacepinas para escalofríos y agitación (los escalofríos generan calor).</li><li><b>NO usar antipiréticos</b> (paracetamol, AINEs): no bajan la Tª de origen no infeccioso y pueden dañar hígado/riñón ya lesionados.</li><li>Corregir electrolitos, coagulopatía, hipoglucemia.</li><li>Vigilar mioglobinuria: alcalinizar, diuresis 1-2 mL/kg/h.</li></ul>"},{"h":"Hipertermia maligna y sd. neuroléptico maligno","b":"<ul><li><b>Hipertermia maligna</b>: reacción idiosincrática a anestésicos halogenados o succinilcolina. Rigidez, hipercapnia, acidosis, hipertermia. Antídoto: <b>dantroleno 2.5 mg/kg IV</b> repetible hasta 10 mg/kg.</li><li><b>Sd. neuroléptico maligno</b>: por neurolépticos. Rigidez, hipertermia, alteración mental, disautonomía. Tratamiento: retirar fármaco, BZD, dantroleno, bromocriptina.</li></ul>"}]},
{"id":"uci-hipotermia","evidenceQuery":"severe hypothermia management","cat":"uci","title":"Hipotermia grave","source":"Manual UCI · Termorregulación","tags":"hipotermia grave accidental recalentamiento activo pasivo ecmo osborn onda j nunca muerto hasta caliente parada critico uci","summary":"Recalentamiento según grado. \"Nadie está muerto hasta que está caliente y muerto\".","sec":[{"h":"Clasificación","b":"<ul><li><b>Leve (32-35°C)</b>: escalofríos, taquicardia, HTA, confusión leve.</li><li><b>Moderada (28-32°C)</b>: bradicardia, hipotensión, cese de escalofríos, confusión, arritmias auriculares.</li><li><b>Grave (&lt;28°C)</b>: coma, arritmias ventriculares/FV, apnea, dilatación pupilar. Riesgo asistolia.</li></ul>"},{"h":"ECG en hipotermia","b":"<ul><li><b>Onda J de Osborn</b>: deflexión positiva al final del QRS.</li><li>Prolongación intervalos, bradicardia, FA lenta.</li><li>&lt;28°C: alto riesgo de FV con manipulación.</li></ul>"},{"h":"Recalentamiento","b":"<ul><li><b>Pasivo externo</b> (leve): mantas, entorno cálido, ropa seca.</li><li><b>Activo externo</b> (leve-moderada): manta térmica, aire caliente forzado (Bair-Hugger).</li><li><b>Activo interno</b> (moderada-grave): sueros calentados a 42°C, lavado peritoneal/pleural/vesical con SF caliente, humidificación caliente vía aérea.</li><li><b>Extracorpóreo</b> (grave o parada): <b>ECMO/circulación extracorpórea</b>. Método más eficaz (2-3°C/h).</li><li>Ritmo de recalentamiento: 0.5-1°C/h en leves; 1-2°C/h en moderadas; hasta 6°C/h con ECMO.</li></ul>"},{"h":"Parada por hipotermia","b":"<ul><li>RCP prolongada durante el recalentamiento.</li><li>Fármacos: <b>evitar adrenalina y desfibrilaciones hasta &gt;30°C</b> (poco eficaces). A partir de 30°C, dosis dobladas de intervalo.</li><li>Máximo 3 desfibrilaciones hasta &gt;30°C.</li><li>Priorizar recalentamiento con ECMO.</li><li>\"Nadie está muerto hasta que está caliente y muerto\": no declarar exitus hasta Tª &gt;35°C.</li></ul>"},{"h":"Complicaciones del recalentamiento","b":"<ul><li>Hipotensión por vasodilatación (\"afterdrop\").</li><li>Arritmias.</li><li>Alteraciones electrolíticas (K sube, luego baja).</li><li>Rabdomiólisis, IRA, edema pulmonar, CID.</li></ul>"}]},
{"id":"uci-organofosforados","evidenceQuery":"organophosphate poisoning","cat":"uci","title":"Intoxicación por organofosforados","source":"Manual UCI · Toxicología clínica","tags":"organofosforados carbamatos insecticidas atropina pralidoxima colinergico sludge critico intoxicacion uci","summary":"Toxidrome colinérgico + fasciculaciones + broncorrea. Atropina + pralidoxima como antídotos.","sec":[{"h":"Clínica","b":"<ul><li><b>Muscarínicos (SLUDGE + DUMBBELS)</b>: sudoración, lagrimeo, salivación, urgencia miccional/urinaria, diarrea, broncorrea, broncoespasmo, miosis, bradicardia, hipotensión.</li><li><b>Nicotínicos</b>: fasciculaciones, debilidad, parálisis, HTA, taquicardia.</li><li><b>SNC</b>: agitación, convulsiones, coma, depresión respiratoria central.</li><li>Fetor característico (a ajo o insecticida).</li></ul>"},{"h":"Diagnóstico","b":"<ul><li>Clínico + historia de exposición (agricultores, suicidios).</li><li>Colinesterasa eritrocitaria y plasmática disminuidas.</li></ul>"},{"h":"Manejo — EPI del personal","b":"<ul><li>Riesgo de contaminación del personal.</li><li>Retirar toda la ropa (bolsa hermética), lavado abundante con agua y jabón.</li><li>Personal con guantes, mascarilla, delantal impermeable.</li></ul>"},{"h":"Antídotos","b":"<ul><li><b>Atropina 2-5 mg IV en bolo</b> (0.05 mg/kg en niños). Repetir <b>doblando la dosis cada 3-5 min</b> hasta atropinización: cese de broncorrea, FC &gt;80, PAS &gt;80.</li><li>Perfusión de mantenimiento tras estabilización: 10-20% de la dosis total requerida por hora.</li><li>Puede necesitarse cientos de mg totales.</li><li><b>Pralidoxima 30 mg/kg IV (máx 2 g) en 30 min</b>, luego <b>8 mg/kg/h en perfusión</b> 24-72 h. Reactiva la colinesterasa (útil si se administra pronto, antes del \"envejecimiento\" del enlace).</li></ul>"},{"h":"Soporte","b":"<ul><li>IOT precoz por broncorrea y depresión respiratoria (usar rocuronio, evitar succinilcolina — bloqueo prolongado).</li><li>Aspirar secreciones abundantes.</li><li>Benzodiacepinas para convulsiones (evitar teofilina).</li><li>Monitorización cardíaca (arritmias).</li><li>Ingreso en UCI 48-72 h por riesgo de recaída y \"síndrome intermedio\" (parálisis muscular tardía).</li></ul>"}]},
{"id":"uci-nutricion-critico","evidenceQuery":"critical care nutrition","cat":"uci","title":"Nutrición del paciente crítico","source":"Manual UCI · ESPEN + ASPEN","tags":"nutricion enteral parenteral paciente critico kcal proteinas balance nitrogenado gastrico postpilorico refeeding uci","summary":"Enteral precoz (24-48 h) en la mayoría; 25-30 kcal/kg + 1.3-1.5 g/kg proteínas. Vigilar tolerancia y refeeding.","sec":[{"h":"Inicio y vía","b":"<ul><li><b>Nutrición enteral (NE) precoz en las primeras 24-48 h</b> si tolera (peristaltismo, no obstrucción).</li><li>Vía gástrica (SNG/OG) es la primera opción; postpilórica (yeyunal) si intolerancia gástrica o alto riesgo aspiración.</li><li><b>Nutrición parenteral (NP)</b>: si NE contraindicada &gt;3-5 días, o mixta si cobertura NE insuficiente tras 7-10 días.</li></ul>"},{"h":"Requerimientos energéticos","b":"<ul><li><b>25-30 kcal/kg/día</b> (peso ideal en obesos).</li><li>Calorimetría indirecta si disponible (más exacto).</li><li>Fase aguda temprana (primeros 3 días): hipocalórica 15-20 kcal/kg/día (\"permissive underfeeding\").</li><li>Fase estable: alcanzar objetivo pleno.</li></ul>"},{"h":"Proteínas","b":"<ul><li><b>1.3-1.5 g/kg/día</b> en crítico general.</li><li>Hasta 2-2.5 g/kg/día en quemados, politrauma, obesidad grave, TCRR.</li><li>Balance nitrogenado: N ingerido − N excretado (urea urinaria + 4).</li></ul>"},{"h":"Contraindicaciones de NE","b":"<ul><li>Obstrucción intestinal.</li><li>Isquemia intestinal.</li><li>Perforación / peritonitis no resuelta.</li><li>Íleo grave.</li><li>Shock refractario con dosis altas de vasopresores (contraindicación relativa; permitir NE trófica 10-20 mL/h si estable).</li><li>HDA activa.</li></ul>"},{"h":"Monitorización de tolerancia","b":"<ul><li>Vigilar distensión abdominal, dolor, vómitos, diarrea, débitos por SNG.</li><li>Residuo gástrico: <b>no medir de forma rutinaria</b>. Solo si intolerancia. Umbral &gt;500 mL para revalorar (guías ESPEN actuales no recomiendan por sistema).</li><li>Cabecero 30-45° para prevenir aspiración.</li><li>Procinéticos (metoclopramida, eritromicina) si retención gástrica.</li></ul>"},{"h":"Síndrome de realimentación (refeeding)","b":"<ul><li>Aparece al reintroducir nutrición tras ayuno prolongado (&gt;5-7 días) o desnutrición grave.</li><li>Hipofosfatemia grave, hipoK, hipoMg, tiamina baja, retención hídrica.</li><li>Prevención: reintroducir calorías gradualmente (25% el 1er día, 50% el 2º, 75% el 3º), suplementar <b>tiamina 100-300 mg/día × 3-5 días antes de iniciar</b>, monitorizar y corregir electrolitos.</li></ul>"}]},
{"id":"uci-delirio-camicu","evidenceQuery":"ICU delirium CAM-ICU","cat":"uci","title":"Delirio en UCI (CAM-ICU y manejo)","source":"Manual UCI · PADIS","tags":"delirio uci cam icu rass sedacion minima haloperidol dexmedetomidina prevencion no farmacologico movilizacion precoz critico","summary":"Alta prevalencia y mortalidad. Cribado sistemático con CAM-ICU + medidas no farmacológicas + evitar BZD.","sec":[{"h":"Definición","b":"<ul><li>Alteración fluctuante de la atención y conciencia con cambio en la cognición, de causa médica.</li><li>50-80% de pacientes ventilados en UCI.</li><li>Se asocia a mayor mortalidad, estancia y deterioro cognitivo a largo plazo.</li></ul>"},{"h":"Tipos","b":"<ul><li><b>Hiperactivo</b>: agitación, hiperalerta (~5%).</li><li><b>Hipoactivo</b>: apatía, somnolencia, más frecuente e infradiagnosticado (~45%).</li><li><b>Mixto</b> (~50%).</li></ul>"},{"h":"CAM-ICU (Confusion Assessment Method for ICU)","b":"<ul><li>1er paso: <b>RASS</b>. Si RASS -4 o -5: no evaluable.</li><li>Criterio 1: <b>Inicio agudo o curso fluctuante</b>.</li><li>Criterio 2: <b>Falta de atención</b> (test de letras \"A\" — leer palabra).</li><li>Criterio 3: <b>Alteración del nivel de conciencia</b> (RASS distinto de 0).</li><li>Criterio 4: <b>Pensamiento desorganizado</b> (preguntas + órdenes).</li><li><b>Delirio positivo</b>: criterios 1 + 2 + (3 o 4).</li></ul>"},{"h":"Medidas no farmacológicas (PRIMERA LÍNEA)","b":"<ul><li>Reorientación: reloj, calendario, ventana, presencia familiar.</li><li>Analgesia adecuada, evitar sobresedación.</li><li>Preservar ciclo sueño-vigilia (luz de día, oscuridad nocturna, ruido controlado).</li><li>Retirar tempranamente sondas, catéteres, contenciones.</li><li>Movilización precoz.</li><li>Uso de gafas y audífonos.</li><li>Bundle ABCDEF: <b>A</b>nalgesia, <b>B</b>reathing trials, <b>C</b>hoice of sedatives, <b>D</b>elirium monitoring, <b>E</b>arly mobility, <b>F</b>amily engagement.</li></ul>"},{"h":"Fármacos","b":"<ul><li><b>EVITAR benzodiacepinas</b> (aumentan delirio); si necesarias, dosis mínima.</li><li><b>Dexmedetomidina</b>: 0.2-1.4 μg/kg/h (menor delirio que BZD; buena para destete de VM).</li><li>Haloperidol 2.5-5 mg IV si agitación grave (vigilar QT, sedación paradójica). No previene ni acorta el delirio.</li><li>Quetiapina 25-100 mg VO/SNG por la noche en manejo prolongado.</li><li>Antipsicóticos atípicos: eficacia limitada, uso individualizado.</li></ul>"}]},
{"id":"uci-navm-bundle","evidenceQuery":"ventilator associated pneumonia prevention bundle","cat":"uci","title":"Bundle prevención NAVM (neumonía asociada a VM)","source":"Manual UCI · IHI + SEMICYUC","tags":"navm neumonia asociada ventilacion mecanica bundle prevencion clorhexidina cabecera aspiracion subglotica sedacion despertar critico uci","summary":"Bundle de 6-7 medidas que reduce la incidencia de NAVM y mortalidad.","sec":[{"h":"Definición","b":"<ul><li>Neumonía que aparece &gt;48 h tras inicio de ventilación mecánica.</li><li>Precoz &lt;5 días: gérmenes comunitarios.</li><li>Tardía ≥5 días: multirresistentes (BLEE, Pseudomonas, SARM, Acinetobacter).</li></ul>"},{"h":"Bundle de prevención (medidas simultáneas)","b":"<ol><li><b>Elevación cabecera 30-45°</b> (salvo contraindicación).</li><li><b>Higiene bucal con clorhexidina 0.12-0.2%</b> cada 6-8 h.</li><li><b>Aspiración subglótica continua/intermitente</b> con TET con canal específico.</li><li><b>Control presión balón TET 20-30 cmH2O</b> cada 4-6 h.</li><li><b>Despertar diario</b> con interrupción de sedación (\"sedation vacation\") + valoración de destete.</li><li><b>Higiene de manos</b> estricta antes/después de manipular la vía aérea.</li><li><b>Profilaxis TVP y UGD</b> (aunque esta última no reduce NAVM).</li><li>Movilización precoz cuando sea posible.</li></ol>"},{"h":"Otras medidas","b":"<ul><li>Preferencia por IOT orotraqueal (menor sinusitis vs nasotraqueal).</li><li>Evitar cambios rutinarios de tubuladura del respirador.</li><li>Circuito cerrado de aspiración.</li><li>Considerar TET impregnado en plata en pacientes seleccionados.</li></ul>"},{"h":"Diagnóstico","b":"<ul><li>Nuevos infiltrados en Rx tórax + 2 de: fiebre, leucocitosis, secreciones purulentas, empeoramiento gasométrico.</li><li>Cultivo cuantitativo: aspirado traqueal ≥10⁶ UFC/mL o BAL ≥10⁴ UFC/mL.</li><li>Considerar procalcitonina para modular duración antibiótica.</li></ul>"},{"h":"Antibioterapia empírica","b":"<ul><li>Cobertura Pseudomonas + gramnegativos multirresistentes + SARM.</li><li>Ejemplo: Piperacilina-Tazobactam o Meropenem + Amikacina + Vancomicina/Linezolid.</li><li>Duración 7-8 días, ajustar según respuesta y cultivos.</li></ul>"}]},
{"id":"uci-cvc-cuidados","evidenceQuery":"central venous catheter care","cat":"uci","title":"Cuidados de catéteres venosos centrales (CVC/PICC)","source":"Manual UCI · Bacteremia Zero","tags":"cvc picc via central bacteriemia zero clorhexidina desinfeccion apositos cambio guia sepsis relacionada cateter critico uci","summary":"Bundle de inserción y mantenimiento reduce bacteriemia asociada a catéter. Higiene, clorhexidina 2%, retirada precoz.","sec":[{"h":"Inserción — Bundle","b":"<ul><li><b>Higiene de manos</b>.</li><li><b>Barrera estéril máxima</b>: bata, guantes, mascarilla, gorro, paño estéril.</li><li><b>Antisepsia con clorhexidina alcohólica 2%</b> (dejar secar 30 s).</li><li><b>Elección del sitio</b>: subclavia &lt; yugular &lt; femoral en riesgo infeccioso. Ecoguiado siempre que sea posible.</li><li><b>Comprobar posición</b> con Rx tórax (punta en VCS).</li><li>Evitar la femoral en la medida de lo posible (mayor infección y trombosis).</li></ul>"},{"h":"Mantenimiento","b":"<ul><li>Antisepsia con clorhexidina 2% en cada manipulación de conexiones.</li><li>Apósito transparente (cambio cada 7 días) o gasa (cada 48 h, si sangrado/exudado).</li><li>Cambio inmediato si se moja, sangra o despega.</li><li>Limpieza de conexiones (\"scrub the hub\") durante 15 s antes de cada uso.</li><li>NO cambio rutinario de CVC en la misma vía; retirar cuando no sea necesario.</li><li>Registro diario de indicación de mantenimiento.</li></ul>"},{"h":"Sospecha de bacteriemia asociada","b":"<ul><li>Fiebre sin foco, escalofríos con manipulación, signos locales.</li><li><b>Hemocultivos pareados</b>: por CVC y periférico simultáneos.</li><li>Diferencial de crecimiento &gt;2 h a favor del catéter → BAC (bacteriemia asociada al catéter).</li><li>Si signos de shock/inestabilidad: <b>retirar catéter y cultivar la punta</b>.</li></ul>"},{"h":"Manejo","b":"<ul><li>Retirar catéter en: signos locales de infección, shock/sepsis grave, hemocultivo positivo para S. aureus/Candida/Pseudomonas/BLEE/multirresistente.</li><li>Antibioterapia empírica: Vancomicina + cobertura de Pseudomonas (Cefepime, Piperacilina-Tazobactam) según epidemiología local.</li><li>Sellado antibiótico si conservar catéter tunelizado necesario y germen no exigente.</li><li>Eco-cardiograma para descartar endocarditis si S. aureus.</li></ul>"}]},
{"id":"uci-tiss-nas","evidenceQuery":"nursing workload scores TISS NAS","cat":"uci","title":"Escalas de carga de trabajo: TISS-28, NEMS y NAS","source":"Manual UCI · SEMICYUC / gestión","tags":"tiss 28 nems nas escalas carga trabajo enfermeria uci dotacion ratios gestion critico","summary":"Herramientas para cuantificar la carga de trabajo por paciente y ajustar dotación de enfermería.","sec":[{"h":"TISS-28","b":"<ul><li><b>Therapeutic Intervention Scoring System</b> abreviado.</li><li>28 intervenciones puntuadas de 1 a 8.</li><li>Cada punto = ~10.6 min de trabajo enfermero/turno.</li><li>Rango: 0-78 puntos.</li><li>Estimación: 1 enfermera puede asumir <b>~46 puntos TISS/turno</b>.</li><li>Categorías: monitorización, soporte respiratorio, cardiovascular, renal, neurológico, metabólico, intervenciones específicas.</li></ul>"},{"h":"NEMS","b":"<ul><li><b>Nine Equivalents of Nursing Manpower use Score</b>.</li><li>9 ítems (versión simplificada del TISS).</li><li>Rango: 0-56 puntos.</li><li>Más fácil de rellenar; correlaciona bien con TISS-28.</li><li>Útil para cargas medias en unidades y comparación entre UCIs.</li></ul>"},{"h":"NAS","b":"<ul><li><b>Nursing Activities Score</b>.</li><li>Considera actividades no incluidas en TISS (soporte psicológico, movilización, higiene, familia, coordinación).</li><li>Cada paciente puntúa 0-100+% (100% = 1 enfermera dedicada 100% del turno a ese paciente).</li><li>Mejor reflejo real de la carga en UCI polivalente.</li><li>Cada vez más utilizada como estándar internacional.</li></ul>"},{"h":"Aplicación práctica","b":"<ul><li>Registro diario/por turno permite planificar dotación.</li><li>Detecta unidades con sobrecarga estructural.</li><li>Justifica ratios enfermera:paciente basados en carga real (no solo número).</li><li>Herramienta útil en supervisión y gestión de recursos.</li><li>Ratios de referencia: crítico ventilado 1:1 o 1:2 según carga; postoperatorio de baja complejidad 1:3.</li></ul>"}]},
{"id":"uci-contencion-mecanica","evidenceQuery":"physical restraints ICU","cat":"uci","title":"Contención mecánica en UCI — Uso responsable","source":"Manual UCI · SEEIUC","tags":"contencion mecanica sujecion agitacion delirio uci evaluacion alternativa protocolo autorizacion registro etica critico","summary":"Último recurso tras agotar alternativas. Requiere valoración, orden, consentimiento y reevaluación frecuente.","sec":[{"h":"Principios","b":"<ul><li>Medida excepcional, no rutinaria.</li><li>Objetivo: proteger al paciente o a terceros; NUNCA por comodidad del equipo.</li><li>Requiere valoración por médico y prescripción.</li><li>Reevaluación al menos cada 4-8 h y en cada turno.</li><li>Registro detallado en historia (motivo, tipo, duración, alternativas probadas).</li><li>Retirar en cuanto cese la indicación.</li></ul>"},{"h":"Indicaciones y contraindicaciones","b":"<ul><li>Indicaciones: agitación con riesgo de autorretirada de dispositivos vitales, riesgo de caída con delirio, agresividad hacia el personal.</li><li>Contraindicaciones: exclusivo control conductual, castigo, sustitución de dotación insuficiente.</li></ul>"},{"h":"Alternativas previas","b":"<ol><li>Analgesia adecuada.</li><li>Presencia familiar / acompañamiento.</li><li>Reorientación, entorno tranquilo.</li><li>Movilización, cambios posturales, entretenimiento (radio, televisión).</li><li>Sedación farmacológica ajustada (dexmedetomidina si delirio).</li><li>Vigilancia estrecha 1:1 si es posible.</li></ol>"},{"h":"Aplicación segura","b":"<ul><li>Material homologado (muñequeras, tobilleras, arnés).</li><li>Nudos accesibles solo por el equipo.</li><li>Posición semiincorporada, extremidades en posición neutra.</li><li>Comprobar cada 30-60 min: pulsos, coloración, sensibilidad, integridad piel bajo la sujeción.</li><li>Movilización pasiva de extremidades y cambios de posición cada 2 h.</li><li>Prevenir UPP con almohadillado.</li></ul>"},{"h":"Aspectos éticos y legales","b":"<ul><li>Informar al paciente (si posible) y a la familia; recoger consentimiento cuando sea posible.</li><li>Documentar decisión clínica, alternativas descartadas y consentimiento en la historia.</li><li>Comunicación al Comité de Ética si hay dudas o desacuerdo.</li><li>Marco legal: derecho a la libertad y a la integridad física (Ley 41/2002 en España, Convenio de Oviedo).</li></ul>"}]},
{"id":"uci-pic-monitorizacion","evidenceQuery":"intracranial pressure monitoring nursing","cat":"uci","title":"Monitorización de PIC — Cuidados de enfermería","source":"Manual UCI · Neurocrítica","tags":"pic presion intracraneal drenaje ventricular externo dve intraparenquimatoso monitor cuidados enfermeria calibracion ondas critico uci","summary":"Ventriculostomía (DVE) o sensor intraparenquimatoso. Objetivo PIC <20-22 y PPC 60-70. Cuidados asépticos estrictos.","sec":[{"h":"Tipos de monitor","b":"<ul><li><b>Drenaje ventricular externo (DVE)</b>: catéter en ventrículo lateral. Permite medir PIC + drenar LCR. Gold standard.</li><li><b>Sensor intraparenquimatoso</b>: fibra óptica o transductor. Solo mide, no drena. Menor riesgo infeccioso.</li><li>Subaracnoideo (obsoleto).</li></ul>"},{"h":"Objetivos","b":"<ul><li>PIC &lt;20-22 mmHg.</li><li>PPC (= PAM − PIC) 60-70 mmHg (55-60 mínimo tolerable).</li><li>Vigilar tendencia y ondas (P1 percusión, P2 tidal, P3 dícrota). Aumento de P2 &gt; P1 sugiere disminución de compliance.</li></ul>"},{"h":"Cuidados generales del paciente","b":"<ul><li>Cabecera 30° elevada, cuello en línea media (no rotado, sin flexión).</li><li>Evitar compresión yugular (collarines mal colocados).</li><li>Sedoanalgesia y bloqueo neuromuscular ajustados.</li><li>Normotermia (fiebre aumenta PIC): usar métodos activos si &gt;38°C.</li><li>Normocapnia PaCO2 35-40. Hiperventilación transitoria a 30-35 solo como rescate.</li><li>Normoglicemia 140-180.</li><li>Sodio 145-155 mEq/L en pacientes con osmoterapia.</li></ul>"},{"h":"Cuidados del DVE","b":"<ul><li>Sistema cerrado, estéril.</li><li>Punto cero calibrado a nivel del <b>trago del oído</b> (agujero de Monro).</li><li>Alturas del drenaje según prescripción (habitualmente 10-20 cmH2O sobre el punto cero).</li><li><b>Cerrar el drenaje para transfer/cambios posturales</b> para evitar drenaje excesivo o reflujo.</li><li>Vigilar volumen, aspecto y turbidez del LCR: registro por turno.</li><li>Signos de alarma: LCR turbio/hemático nuevo, ausencia de drenaje, pulsatilidad ausente.</li><li>Curas del punto de inserción con clorhexidina, apósito estéril.</li><li>Muestras de LCR solo con indicación médica y técnica aséptica.</li><li>Cambio de sistema/bolsa según protocolo (habitualmente 48-72 h).</li></ul>"},{"h":"Complicaciones","b":"<ul><li><b>Infección/ventriculitis</b>: 5-10% (mayor riesgo &gt;5 días de DVE).</li><li>Hemorragia por colocación.</li><li>Obstrucción del catéter.</li><li>Sobre/infradrenaje.</li><li>Salida accidental.</li></ul>"}]}
,
{"id":"farm-noradrenalina","evidenceQuery":"norepinephrine infusion","cat":"farm","title":"Noradrenalina — Perfusión y cálculos","source":"Manual Farmacología UCI","tags":"noradrenalina norepinefrina vasopresor perfusion dilucion velocidad gammas critico farmacologia uci shock","summary":"Vasopresor de primera línea en shock séptico y distributivo. Dilución estándar 8 mg en 100 mL SG5% (80 μg/mL).","sec":[{"h":"Indicaciones","b":"<ul><li>Shock séptico (primera línea).</li><li>Shock cardiogénico con hipotensión moderada.</li><li>Shock anafiláctico refractario a adrenalina.</li><li>Shock neurogénico (con soporte de volumen).</li></ul>"},{"h":"Presentación","b":"<ul><li>Ampollas de <b>10 mg / 10 mL</b> (1 mg/mL).</li><li>También ampollas de 4 mg / 4 mL o 8 mg / 8 mL.</li></ul>"},{"h":"Dilución estándar HJ23","b":"<ul><li><b>Concentración habitual: 8 mg en 100 mL SG5% → 80 μg/mL</b>.</li><li>Doble concentración para restricción de volumen: 16 mg en 100 mL SG5% (160 μg/mL).</li><li>Preferible vía central; se acepta periférica gruesa a bajas dosis con vigilancia por extravasación.</li></ul>"},{"h":"Dosis y titulación","b":"<ul><li>Rango: <b>0.05-1.5 μg/kg/min</b> (habitual 0.1-0.5).</li><li>Iniciar 0.05-0.1 μg/kg/min y titular cada 3-5 min según TAM (objetivo ≥65 mmHg).</li><li>Sin dosis máxima absoluta, pero &gt;1 μg/kg/min = shock refractario → añadir 2º vasopresor (vasopresina, adrenalina).</li></ul>"},{"h":"Fórmula de velocidad (mL/h)","b":"<p><b>mL/h = (dosis μg/kg/min × peso × 60) / concentración μg/mL</b></p><p>Ejemplo: 70 kg, dosis 0.1 μg/kg/min, concentración 80 μg/mL:<br>= (0.1 × 70 × 60) / 80 = <b>5.25 mL/h</b>.</p><p>Regla práctica con dilución 8/100 y adulto 70 kg: cada 5 mL/h ≈ 0.1 μg/kg/min.</p>"},{"h":"Efectos adversos y cuidados","b":"<ul><li>Vasoconstricción excesiva: isquemia digital/mesentérica/renal.</li><li>Extravasación: necrosis. Antídoto: <b>fentolamina 5-10 mg + 10 mL SF SC</b> alrededor. Alternativa: nitroglicerina tópica.</li><li>Vigilar diuresis, perfusión periférica, lactato.</li><li>Retirada gradual (bajar 0.05 μg/kg/min cada 15-30 min si TAM estable).</li></ul>"}]},
{"id":"farm-otras-catecolaminas","evidenceQuery":"epinephrine dopamine dobutamine vasopressin infusion","cat":"farm","title":"Adrenalina, Dopamina, Dobutamina y Vasopresina","source":"Manual Farmacología UCI","tags":"adrenalina epinefrina dopamina dobutamina vasopresina catecolaminas inotropicos vasopresores perfusion dilucion critico farmacologia uci","summary":"Diluciones estándar y velocidades para las catecolaminas más usadas.","sec":[{"h":"Adrenalina","b":"<ul><li><b>Indicaciones</b>: PCR (bolo), shock anafiláctico, shock refractario, bradicardia inestable.</li><li><b>Dilución perfusión</b>: 5 mg en 100 mL SG5% → 50 μg/mL. Alternativa: 1 mg en 100 mL → 10 μg/mL.</li><li><b>Dosis</b>: 0.05-1 μg/kg/min (bajo: β; alto: α).</li><li><b>Bolo PCR</b>: 1 mg IV cada 3-5 min.</li><li><b>Bolo anafilaxia IM</b>: 0.5 mg en cara lateral muslo.</li></ul>"},{"h":"Dopamina","b":"<ul><li><b>Indicaciones</b>: bradicardia sintomática (2ª línea tras atropina), soporte hemodinámico en algunos escenarios.</li><li><b>Dilución</b>: 200-400 mg en 250 mL SG5%.</li><li><b>Dosis-efecto</b>:<ul><li>Baja 1-3 μg/kg/min: efecto renal (obsoleto, no protege riñón).</li><li>Media 3-10 μg/kg/min: β1 inotrópico.</li><li>Alta &gt;10 μg/kg/min: α vasopresor.</li></ul></li><li>Cada vez menos usada por arritmogenicidad; prefiere noradrenalina.</li></ul>"},{"h":"Dobutamina","b":"<ul><li><b>Indicaciones</b>: shock cardiogénico, disfunción VI con gasto bajo, sepsis con hipoperfusión pese a TAM adecuada.</li><li><b>Dilución</b>: 250 mg en 250 mL SG5% (1 mg/mL) o 500 mg en 250 mL (2 mg/mL).</li><li><b>Dosis</b>: 2.5-20 μg/kg/min (β1 predominante).</li><li>Efectos: taquicardia, arritmias, hipotensión por vasodilatación β2.</li></ul>"},{"h":"Vasopresina","b":"<ul><li><b>Indicaciones</b>: shock séptico refractario a NA (ahorrador de catecolaminas). Diabetes insípida.</li><li><b>Dilución</b>: 20 UI en 100 mL SF (0.2 UI/mL).</li><li><b>Dosis fija</b>: 0.03 UI/min (~9 mL/h con dilución anterior).</li><li>NO titular al alza en shock (dosis fija, sin efecto adicional a mayor dosis y aumenta isquemia).</li></ul>"},{"h":"Levosimendán","b":"<ul><li><b>Indicaciones</b>: disfunción VI grave, ICC descompensada, weaning cardiaco.</li><li><b>Dilución</b>: 12.5 mg en 500 mL SG5% (25 μg/mL).</li><li><b>Dosis</b>: 0.05-0.2 μg/kg/min durante 24 h. Bolo inicial opcional 6-12 μg/kg en 10 min (habitualmente no se da por hipotensión).</li><li>Efecto sensibilizador al calcio, dura 7-9 días por metabolito activo.</li></ul>"}]},
{"id":"farm-sedantes","evidenceQuery":"sedative infusions midazolam propofol dexmedetomidine","cat":"farm","title":"Sedantes en perfusión — Midazolam, Propofol, Dexmedetomidina, Ketamina","source":"Manual Farmacología UCI","tags":"sedantes perfusion midazolam propofol dexmedetomidina precedex ketamina dilucion velocidad rass critico farmacologia uci","summary":"Elección según objetivo RASS, hemodinámica y duración prevista.","sec":[{"h":"Midazolam","b":"<ul><li><b>Indicaciones</b>: sedación profunda prolongada, control convulsivo.</li><li><b>Dilución</b>: 100 mg en 100 mL SF (1 mg/mL) o sin diluir en jeringa (5 mg/mL).</li><li><b>Bolo</b>: 0.02-0.05 mg/kg IV.</li><li><b>Perfusión</b>: 0.02-0.2 mg/kg/h (equivale a 1.5-15 mg/h en adulto de 70 kg).</li><li>Inconvenientes: acumulación (metabolito activo), delirio, taquifilaxia, larga vida media en obesos y hepatopatía.</li></ul>"},{"h":"Propofol","b":"<ul><li><b>Indicaciones</b>: sedación de duración corta-media, weaning, procedimientos.</li><li><b>Presentación</b>: 1% (10 mg/mL) o 2% (20 mg/mL). No requiere dilución.</li><li><b>Bolo</b>: 0.5-2 mg/kg IV lento.</li><li><b>Perfusión</b>: 0.5-4 mg/kg/h (habitual 1-3).</li><li>Ventajas: rápido inicio y despertar, no acumula.</li><li>Inconvenientes: hipotensión, bradicardia, hipertrigliceridemia. <b>Síndrome de infusión por propofol (PRIS)</b> si &gt;4 mg/kg/h &gt;48 h: acidosis, rabdomiólisis, IR, colapso. Vigilar CK y triglicéridos.</li><li>NO recomendado en niños &lt;16 años.</li></ul>"},{"h":"Dexmedetomidina (Dexdor)","b":"<ul><li><b>Indicaciones</b>: sedación consciente y cooperativa, weaning, prevención de delirio, ansiolisis.</li><li><b>Dilución</b>: 200 μg (2 mL) en 48 mL SF → 4 μg/mL. O 400 μg en 100 mL.</li><li><b>Perfusión</b>: <b>0.2-1.4 μg/kg/h</b> (habitual 0.4-0.7).</li><li>NO bolo (produce hipertensión seguida de hipotensión y bradicardia grave).</li><li>Sedación superficial: paciente despierto y cooperador.</li><li>Efectos: bradicardia, hipotensión, boca seca.</li></ul>"},{"h":"Ketamina","b":"<ul><li><b>Indicaciones</b>: inducción en shock/asma, sedoanalgesia, adyuvante en dolor refractario.</li><li><b>Dilución</b>: 500 mg en 100 mL SF (5 mg/mL) o 250 mg en 250 mL SG5% (1 mg/mL).</li><li><b>Inducción</b>: 1-2 mg/kg IV (0.5-1 mg/kg en shock).</li><li><b>Sedoanalgesia perfusión</b>: 0.1-0.5 mg/kg/h.</li><li>Ventajas: mantiene PA, broncodilatador, analgésico.</li><li>Inconvenientes: alucinaciones (asociar BZD), hipersialorrea, HTIC (relativa; datos actuales cuestionan contraindicación en TCE).</li></ul>"},{"h":"Comparativa rápida","b":"<ul><li>Objetivo RASS -3 a -5 sostenido: propofol o midazolam.</li><li>Objetivo RASS 0 a -2, prevención delirio: dexmedetomidina.</li><li>Shock inestable: ketamina de elección para inducción.</li><li>Combinar propofol + dexmedetomidina para ahorro de dosis en sedación prolongada.</li></ul>"}]},
{"id":"farm-opioides","evidenceQuery":"opioid infusions fentanyl remifentanil","cat":"farm","title":"Opioides en perfusión — Fentanilo, Remifentanilo, Cloruro mórfico","source":"Manual Farmacología UCI","tags":"opioides perfusion fentanilo remifentanilo cloruro morfico morfina dilucion velocidad analgesia critico farmacologia uci","summary":"Fentanilo es el opioide de referencia en UCI. Remifentanilo si se busca despertar rápido.","sec":[{"h":"Fentanilo","b":"<ul><li><b>Indicaciones</b>: analgesia en ventilación mecánica, procedimientos dolorosos.</li><li><b>Presentación</b>: ampollas de 150 μg / 3 mL (50 μg/mL).</li><li><b>Dilución</b>: 1000 μg (20 mL) en 80 mL SF → <b>10 μg/mL</b>. O 500 μg en 100 mL (5 μg/mL).</li><li><b>Bolo</b>: 0.5-2 μg/kg.</li><li><b>Perfusión</b>: 0.5-5 μg/kg/h (habitual 1-3 μg/kg/h).</li><li>Metabolito no activo; se acumula en obesos y en perfusiones prolongadas por depósito en grasa.</li></ul>"},{"h":"Remifentanilo","b":"<ul><li><b>Indicaciones</b>: sedoanalgesia con weaning rápido, procedimientos cortos, neurocrítico (permite exploración neurológica).</li><li><b>Presentación</b>: viales de 1, 2 o 5 mg polvo.</li><li><b>Dilución</b>: 2 mg en 40 mL SF → 50 μg/mL (o 1 mg en 50 mL → 20 μg/mL).</li><li><b>Perfusión</b>: 0.025-0.2 μg/kg/min.</li><li>Vida media ultracorta (3-10 min) independiente de duración de perfusión.</li><li>NO usar en bolo (rigidez torácica).</li><li>Al suspender: analgesia de rescate porque desaparece muy rápido.</li></ul>"},{"h":"Cloruro mórfico","b":"<ul><li><b>Indicaciones</b>: dolor moderado-severo, sedoanalgesia, edema pulmonar (vasodilatador venoso).</li><li><b>Presentación</b>: ampollas 10 mg / 1 mL.</li><li><b>Bolo</b>: 2-5 mg IV, repetible cada 5-10 min.</li><li><b>Perfusión</b>: 40 mg en 100 mL SF (0.4 mg/mL). Velocidad 1-5 mg/h.</li><li>Metabolito activo (M6G) se acumula en IR → toxicidad prolongada.</li></ul>"},{"h":"Equipotencias analgésicas IV","b":"<ul><li>Morfina 10 mg = Fentanilo 100 μg = Remifentanilo 100 μg (aproximado, considerar duración).</li><li>Rotación por vía o efectos secundarios: reducir 25-50% de la equipotencia.</li></ul>"},{"h":"Efectos adversos y antagonista","b":"<ul><li>Depresión respiratoria, hipotensión, bradicardia, náuseas, íleo, estreñimiento, prurito, retención urinaria.</li><li><b>Naloxona 0.04-0.2 mg IV</b> titulada si depresión respiratoria (evitar reversión brusca por dolor y agitación).</li><li>Perfusión de naloxona 2/3 de la dosis efectiva por hora si opioide de larga duración.</li></ul>"}]},
{"id":"farm-bnm","evidenceQuery":"neuromuscular blocking agents reversal","cat":"farm","title":"Bloqueantes neuromusculares (BNM) y reversores","source":"Manual Farmacología UCI","tags":"bloqueantes neuromusculares rocuronio cisatracurio vecuronio succinilcolina sugammadex neostigmina relajantes musculares critico farmacologia uci","summary":"Rocuronio para IOT rápida, cisatracurio en perfusión en SDRA. Sugammadex como reversor específico.","sec":[{"h":"Succinilcolina","b":"<ul><li><b>Único despolarizante</b>. Onset ultrarrápido (30-60 s), duración 5-10 min.</li><li><b>Dosis IOT</b>: 1-1.5 mg/kg IV.</li><li>Ideal en secuencia rápida de intubación en emergencia.</li><li><b>Contraindicaciones</b>: hiperK, quemados &gt;24 h, denervación (paraplejia), miopatías, hipertermia maligna, historia familiar de HM.</li></ul>"},{"h":"Rocuronio","b":"<ul><li>No despolarizante. Onset 60-90 s a 1.2 mg/kg.</li><li><b>Dosis IOT rápida</b>: 1-1.2 mg/kg IV (equivalente a succinilcolina).</li><li><b>Mantenimiento en bolos</b>: 0.15 mg/kg cada 30 min.</li><li><b>Perfusión</b>: 500 mg en 100 mL (5 mg/mL) a 5-15 μg/kg/min.</li><li>Duración prolongada en IR/IH.</li></ul>"},{"h":"Cisatracurio","b":"<ul><li>No despolarizante. Metabolismo Hofmann (independiente de riñón/hígado).</li><li><b>Perfusión SDRA grave</b>: 150 μg/kg IV bolo + 1-3 μg/kg/min durante primeras 48 h (estudio ACURASYS).</li><li><b>Dilución</b>: 200 mg en 100 mL SF (2 mg/mL).</li><li>Sin efectos cardiovasculares significativos.</li></ul>"},{"h":"Vecuronio","b":"<ul><li>Alternativa; menos usada. Duración media.</li><li>Bolo: 0.08-0.1 mg/kg.</li></ul>"},{"h":"Reversores","b":"<ul><li><b>Sugammadex</b>: reversor específico de <b>rocuronio</b> (y vecuronio).<ul><li>2 mg/kg si TOF ≥2.</li><li>4 mg/kg si bloqueo profundo.</li><li>16 mg/kg si reversión inmediata tras IOT fallida con rocuronio.</li></ul></li><li><b>Neostigmina + atropina/glicopirrolato</b>: reversor no específico. 0.04-0.07 mg/kg neostigmina + 0.01-0.02 mg/kg atropina.</li></ul>"},{"h":"Monitorización","b":"<ul><li><b>TOF (Train of Four)</b> con acelerómetro: 4 estímulos.<ul><li>4 respuestas iguales: sin bloqueo.</li><li>Fade progresivo: bloqueo parcial.</li><li>0-1 respuestas: bloqueo profundo.</li></ul></li><li>Objetivo: 1-2 respuestas TOF.</li><li>Siempre bajo sedoanalgesia adecuada (nunca bloqueante sin sedación).</li></ul>"}]},
{"id":"farm-otras-perfusiones","evidenceQuery":"insulin heparin nitroglycerin amiodarone infusion","cat":"farm","title":"Insulina, Heparina, Nitroglicerina, Amiodarona y Furosemida en perfusión","source":"Manual Farmacología UCI","tags":"insulina heparina nitroglicerina amiodarona furosemida perfusion dilucion velocidad critico farmacologia uci","summary":"Diluciones y velocidades habituales de las perfusiones no vasoactivas más usadas.","sec":[{"h":"Insulina regular (Actrapid)","b":"<ul><li><b>Indicaciones</b>: hiperglucemia, CAD, EHH, hiperK, control glucémico estricto en crítico.</li><li><b>Dilución</b>: 50 UI en 50 mL SF (1 UI/mL). Purgar 20 mL para saturar plástico (la insulina se adsorbe).</li><li><b>Perfusión CAD</b>: 0.1 UI/kg/h; ajustar cada hora para bajada 50-75 mg/dL/h.</li><li><b>Control glucémico crítico</b>: iniciar 2 UI/h con glucemia &gt;180; objetivo 140-180 mg/dL.</li><li>Controlar glucemia horaria al inicio; espaciar a c/2-4 h en estable.</li></ul>"},{"h":"Heparina sódica no fraccionada (HNF)","b":"<ul><li><b>Indicaciones</b>: TVP, TEP, SCA, ACO puente, ECMO, TCRR sin citrato.</li><li><b>Dilución</b>: 25.000 UI en 250 mL SG5% (100 UI/mL). O 5.000 UI en 100 mL (50 UI/mL).</li><li><b>Bolo</b>: 80 UI/kg IV.</li><li><b>Perfusión</b>: 18 UI/kg/h.</li><li>Ajustar por <b>TTPa</b> (objetivo 1.5-2.5 × basal) cada 6 h hasta estable, luego cada 12-24 h.</li><li>Antídoto: <b>protamina 1 mg / 100 UI heparina</b> (máx 50 mg dosis única).</li></ul>"},{"h":"Nitroglicerina","b":"<ul><li><b>Indicaciones</b>: SCA, EAP, HTA emergencia con IC o SCA.</li><li><b>Dilución</b>: 50 mg en 250 mL SG5% (200 μg/mL). Preferir envase de vidrio (adsorción al PVC).</li><li><b>Perfusión</b>: <b>5-200 μg/min</b>. Iniciar 10 μg/min y titular cada 3-5 min.</li><li>Efectos: hipotensión, cefalea, taquicardia refleja.</li><li>Contraindicaciones: IAM VD, uso de sildenafilo/tadalafilo en últimas 24-48 h.</li></ul>"},{"h":"Amiodarona","b":"<ul><li><b>Indicaciones</b>: FA rápida, arritmias ventriculares, tras 3er choque en FV/TVSP.</li><li><b>Bolo PCR</b>: 300 mg IV en 20 mL SG5%.</li><li><b>Bolo taquicardia estable</b>: 150-300 mg en 20-60 min.</li><li><b>Perfusión</b>: 900 mg en 500 mL SG5% (1.8 mg/mL). Ritmo: 1 mg/min × 6 h + 0.5 mg/min × 18 h = 1.2 g/24 h.</li><li>Vía central preferente (flebitis en periférica).</li><li>NO en SF (precipita).</li><li>Efectos: hipotensión durante bolo, bradicardia, prolongación QT, tiroides, hepático, pulmonar (uso crónico).</li></ul>"},{"h":"Furosemida","b":"<ul><li><b>Indicaciones</b>: sobrecarga hídrica, EAP, oliguria, hiperK.</li><li><b>Bolo</b>: 20-80 mg IV.</li><li><b>Perfusión</b>: 250 mg en 50 mL SF (5 mg/mL) a 5-20 mg/h (más eficaz que bolos repetidos en IC).</li><li>Vigilar iones (hipoK, hipoMg, hipoNa), función renal, ototoxicidad si dosis altas.</li></ul>"},{"h":"Vigilancia general de perfusiones","b":"<ul><li>Etiquetar cada línea con fármaco, concentración y velocidad.</li><li>Purgar 20 mL antes de conectar cuando adsorción esperable (insulina, nitroglicerina).</li><li>Comprobar compatibilidades antes de conectar en la misma vía.</li><li>Doble comprobación de dosis en fármacos de alto riesgo (ISMP).</li></ul>"}]},
{"id":"farm-antibioticos-uci","evidenceQuery":"intravenous antibiotics ICU dosing","cat":"farm","title":"Antibióticos IV frecuentes en UCI — Dosis y ajustes","source":"Manual Farmacología UCI","tags":"antibioticos iv vancomicina meropenem piperacilina tazobactam gentamicina amikacina linezolid daptomicina ajuste renal critico farmacologia uci","summary":"Dosis carga y mantenimiento de los antibióticos más usados; ajuste por función renal y TCRR.","sec":[{"h":"Vancomicina","b":"<ul><li><b>Dosis carga</b>: 25-30 mg/kg IV (máx 3 g) en 90-120 min.</li><li><b>Mantenimiento</b>: 15-20 mg/kg cada 8-12 h.</li><li><b>Objetivo AUC/MIC 400-600</b> (o valle 15-20 mg/L en infecciones graves).</li><li>Perfusión continua alternativa: carga 25-30 mg/kg + perfusión 30-40 mg/kg/24 h.</li><li>Ajuste renal: intervalos más largos según FG.</li><li>Vigilar nefrotoxicidad y ototoxicidad.</li></ul>"},{"h":"Piperacilina-Tazobactam","b":"<ul><li><b>Dosis</b>: 4/0.5 g IV cada 6-8 h.</li><li><b>Perfusión extendida</b> (recomendada): en 3-4 h en lugar de 30 min.</li><li>Perfusión continua alternativa tras carga: 16 g/24 h.</li><li>Ajuste renal si FG &lt;20.</li></ul>"},{"h":"Meropenem","b":"<ul><li><b>Dosis</b>: 1 g IV cada 8 h; hasta 2 g cada 8 h en meningitis o gérmenes con MIC alta.</li><li><b>Perfusión extendida</b>: en 3 h.</li><li>Estable 3 h a 25°C tras reconstitución, 24 h en frigorífico (usar rápido).</li><li>Ajuste renal si FG &lt;50.</li></ul>"},{"h":"Aminoglucósidos (Gentamicina, Amikacina)","b":"<ul><li><b>Gentamicina</b>: 5-7 mg/kg/24 h en dosis única diaria (peso ajustado si obesidad).</li><li><b>Amikacina</b>: 15-20 mg/kg/24 h.</li><li>Objetivo pico Amikacina: 60-80 mg/L; valle &lt;5 mg/L.</li><li>Nefrotoxicidad y ototoxicidad acumulativas.</li><li>Vigilar función renal y niveles.</li></ul>"},{"h":"Linezolid","b":"<ul><li>600 mg IV cada 12 h.</li><li>Cobertura SARM y Enterococo VanR.</li><li>Vigilar plaquetopenia (uso &gt;10 días), acidosis láctica, neuropatía en tratamiento prolongado.</li></ul>"},{"h":"Daptomicina","b":"<ul><li>6-10 mg/kg cada 24 h (peso real).</li><li>NO usar en neumonía (inactivado por surfactante).</li><li>Vigilar CK semanal, riesgo de rabdomiólisis. Suspender estatinas si posible.</li></ul>"},{"h":"Ajustes en TCRR (aproximaciones)","b":"<ul><li>Vancomicina: 15-20 mg/kg carga + 500-1000 mg cada 24 h según niveles.</li><li>Piperacilina-Tazobactam: 2.25-3.375 g cada 6-8 h.</li><li>Meropenem: 1 g cada 12 h (o cada 8 h si carga bacteriana alta).</li><li>Cefepime: 2 g cada 12 h.</li><li>Confirmar siempre con farmacia por variabilidad de aclaramientos según modalidad.</li></ul>"}]},
{"id":"img-pocus-acceso-venoso","evidenceQuery":"ultrasound guided vascular access","cat":"imagen","title":"POCUS — Ecoguiado de accesos vasculares","source":"Manual POCUS UCI","tags":"pocus ecoguiado canalizacion venosa central yugular subclavia radial arterial vena arteria transductor transversal longitudinal critico imagen","summary":"Técnica ecoguiada disminuye complicaciones y fallos. Confirmar vena (compresible) vs arteria (pulsátil).","sec":[{"h":"Preparación","b":"<ul><li>Transductor lineal alta frecuencia (7-15 MHz) con funda estéril y gel estéril.</li><li>Marcador del transductor a la izquierda del paciente (por convención).</li><li>Preset \"vascular\" del ecógrafo.</li></ul>"},{"h":"Identificar vena vs arteria","b":"<ul><li><b>Vena</b>: fácilmente <b>compresible</b> con presión leve del transductor.</li><li><b>Arteria</b>: <b>pulsátil</b>, no colapsable con presión moderada.</li><li>Doppler color y pulsado como refuerzo.</li></ul>"},{"h":"Yugular interna","b":"<ul><li>Paciente en Trendelenburg 15-20°, cabeza rotada al lado contrario.</li><li>Transductor transversal en triángulo de Sedillot.</li><li>Vena lateral a la carótida en 90% de casos.</li><li>Aguja en tiempo real, seguir la punta hasta ver \"efecto tienda de campaña\" en la pared.</li></ul>"},{"h":"Subclavia (abordaje infraclavicular o supraclavicular)","b":"<ul><li>Infraclavicular ecoguiada: más difícil por sombra de clavícula. Considerar abordaje axilar (más lateral).</li><li>Supraclavicular: útil si el operador tiene experiencia.</li><li>Menor riesgo de neumotórax con eco vs técnica ciega.</li></ul>"},{"h":"Femoral","b":"<ul><li>Vena medial a la arteria (NAVEL: Nervio, Arteria, Vena, Espacio, Linfáticos).</li><li>Transductor transversal en pliegue inguinal.</li></ul>"},{"h":"Confirmación de la vía","b":"<ul><li>Ver el catéter en la vena (vista longitudinal).</li><li>Test de burbuja (\"rapid atrial swirl\"): inyección de SF agitado; burbujas en aurícula derecha en &lt;2 s = punta central correcta.</li><li>Rx tórax final para descartar neumotórax y confirmar posición punta.</li></ul>"},{"h":"Arterial radial","b":"<ul><li>Test de Allen previo (opcional; utilidad clínica cuestionada).</li><li>Transductor lineal en cara volar de muñeca, transversal.</li><li>Arteria radial pequeña (2-3 mm), doppler para confirmarla.</li><li>Angulación aguja 30-45°, técnica de \"pulverización\" o transfixión.</li></ul>"}]},
{"id":"img-pocus-rush","evidenceQuery":"RUSH protocol undifferentiated shock","cat":"imagen","title":"POCUS — Protocolo RUSH en shock indiferenciado","source":"Manual POCUS UCI","tags":"pocus rush shock indiferenciado bomba tanque tuberias corazon cava aorta pulmon abdomen critico imagen","summary":"\"Bomba - Tanque - Tuberías\": ecografía sistemática para clasificar shock en <5 min.","sec":[{"h":"Concepto","b":"<ul><li>RUSH = Rapid Ultrasound for Shock and Hypotension.</li><li>Tres pilares: <b>Bomba, Tanque, Tuberías</b>.</li><li>Objetivo: distinguir shock hipovolémico, cardiogénico, obstructivo o distributivo.</li></ul>"},{"h":"Bomba (corazón)","b":"<ul><li>Ventanas: paraesternal eje largo/corto, apical 4C, subxifoidea.</li><li>Preguntas: ¿derrame pericárdico/taponamiento? ¿contractilidad VI? ¿dilatación VD? ¿signo de McConnell?</li><li><b>Hallazgos</b>:<ul><li>Derrame + colapso AD/VD → obstructivo (taponamiento).</li><li>VI hiperdinámico y vacío → hipovolémico o distributivo.</li><li>VI dilatado e hipocontráctil → cardiogénico.</li><li>VD dilatado + septo D → obstructivo (TEP).</li></ul></li></ul>"},{"h":"Tanque (volemia)","b":"<ul><li>VCI subxifoidea: diámetro y colapso con respiración.<ul><li>&lt;2 cm y colapso &gt;50% → hipovolémico o distributivo.</li><li>&gt;2 cm sin colapso → cardiogénico u obstructivo.</li></ul></li><li>Congestión pulmonar: líneas B bilaterales → cardiogénico / sobrecarga.</li><li>Fugas de tanque: líquido libre en FAST (hipovolémico por hemorragia), neumotórax (obstructivo).</li></ul>"},{"h":"Tuberías (vasos)","b":"<ul><li><b>Aorta</b>: descartar aneurisma o disección (medir diámetro; &gt;3 cm abdominal es aneurismático).</li><li><b>Venas MMII</b>: compresión venosa femoral y poplítea para descartar TVP (indirecto de TEP).</li></ul>"},{"h":"Perfiles diagnósticos rápidos","b":"<ul><li><b>Hipovolémico</b>: VI hiperdinámico + VCI colapsada + líquido libre o vacío.</li><li><b>Cardiogénico</b>: VI dilatado hipocontráctil + VCI dilatada + líneas B bilaterales.</li><li><b>Distributivo (séptico)</b>: VI hiperdinámico + VCI variable + sin causa obstructiva.</li><li><b>Obstructivo</b>: derrame pericárdico con taponamiento, VD dilatado (TEP), neumotórax (sin sliding).</li></ul>"}]},
{"id":"img-pocus-renal","evidenceQuery":"renal ultrasound point of care","cat":"imagen","title":"POCUS renal y vía urinaria","source":"Manual POCUS UCI","tags":"pocus renal ecografia rinones hidronefrosis obstruccion vejiga globo vesical residuo posmiccional critico imagen","summary":"Detecta obstrucción, globo vesical y residuo. Complemento clave en IRA y sondaje.","sec":[{"h":"Técnica","b":"<ul><li>Transductor convex 2-5 MHz.</li><li>Paciente en supino o decúbito lateral.</li><li>Riñón D: entre 9º-11º arco costal derecho, vía ventana hepática.</li><li>Riñón I: entre 10º-11º arco costal izquierdo, ventana esplénica (más difícil por menor tamaño del bazo).</li><li>Vejiga: transductor suprapúbico en cortes transversal y sagital.</li></ul>"},{"h":"Anatomía normal","b":"<ul><li>Tamaño: 9-12 cm × 5 cm.</li><li>Corteza más ecogénica que la médula.</li><li>Seno pélvico hiperecogénico central.</li></ul>"},{"h":"Hidronefrosis (obstrucción)","b":"<ul><li><b>Leve</b>: dilatación de pelvis renal.</li><li><b>Moderada</b>: dilatación de pelvis + cálices.</li><li><b>Grave</b>: cálices redondeados con adelgazamiento del parénquima.</li><li>Bilateral: sugiere obstrucción baja (uretra, vejiga, próstata).</li><li>Unilateral: obstrucción uretral (litiasis, tumor).</li></ul>"},{"h":"Vejiga y residuo posmiccional","b":"<ul><li>Volumen (mL) = largo × ancho × alto (cm) × 0.5.</li><li><b>Globo vesical</b>: vejiga distendida con dolor o retención → sondar.</li><li>Residuo posmiccional &gt;100-200 mL en adulto: sugiere retención crónica.</li><li>Comprobación de sonda vesical: balón intravesical, no en uretra.</li></ul>"},{"h":"Utilidades en UCI","b":"<ul><li><b>IRA sin causa clara</b>: descartar obstrucción como causa (postrenal).</li><li><b>Anuria por sondaje</b>: descartar sonda mal colocada u obstruida.</li><li>Guía para sondaje difícil o cistostomía suprapúbica.</li><li>Valorar el trasplante renal (posición pélvica) en receptor.</li></ul>"}]},
{"id":"uci-postop-cardiaca","evidenceQuery":"cardiac surgery postoperative care","cat":"uci","title":"Postoperatorio de cirugía cardíaca","source":"Manual UCI · Cardíaca","tags":"postoperatorio cirugia cardiaca bypass revascularizacion coronaria valvular drenajes marcapasos taponamiento sangrado bajo gasto critico uci","summary":"Cuidados en 24-48 h clave: hemodinamia, drenajes, marcapasos, sangrado, arritmias, extubación precoz.","sec":[{"h":"Ingreso: fase inicial (0-4 h)","b":"<ul><li>Monitorización continua: ECG, PA invasiva, PVC, SvcO2, capnografía, débitos drenajes.</li><li>Objetivo TAM 65-80 mmHg, IC &gt;2.2 L/min/m², diuresis &gt;0.5 mL/kg/h.</li><li>Recalentar hasta 36.5°C (frecuente hipotermia postbomba).</li><li>Revertir heparina con protamina (ya en quirófano habitualmente).</li><li>Valoración de sangrado, coagulación, hemograma, iones, gasometría.</li></ul>"},{"h":"Drenajes torácicos y mediastínicos","b":"<ul><li>2-3 drenajes: mediastínico + pleurales.</li><li>Vigilancia: aspecto (rojo/serohemático), débito por hora.</li><li><b>Alarma</b>: &gt;200 mL/h × 3 h, &gt;300 mL en 1 h, o cese brusco de drenaje productivo (posible taponamiento).</li><li>Ordeñar suavemente si obstruido; no clampar en principio.</li><li>Retirar cuando débito &lt;100 mL/8 h y sin fuga aérea.</li></ul>"},{"h":"Sangrado postoperatorio","b":"<ul><li>Descartar: causa quirúrgica (sangrado activo), coagulopatía, hipotermia, HTA.</li><li>Objetivos coagulación: INR &lt;1.5, TTPa &lt;40 s, plaquetas &gt;100.000, fibrinógeno &gt;2 g/L.</li><li>Ácido tranexámico si sangrado activo con fibrinolisis (ROTEM/TEG).</li><li>Reintervención si &gt;500 mL/h, &gt;400 mL/h × 2 h, &gt;300 mL/h × 3 h.</li></ul>"},{"h":"Cables de marcapasos epicárdicos","b":"<ul><li>Colocados en quirófano (bipolares auriculares y ventriculares).</li><li>Comprobar umbral, sensado y captura al ingreso.</li><li>Modo habitual: DDD o AAI si función AV conservada, VVI en FA.</li><li>Retirar tirando suavemente cuando ya no sean necesarios (habitualmente 48-72 h después de retirar drenajes).</li><li>Vigilar riesgo de taponamiento al retirar (raro pero descrito).</li></ul>"},{"h":"Complicaciones frecuentes","b":"<ul><li><b>Taponamiento cardíaco</b>: bajo gasto + PVC/PAP altas + cese brusco de drenaje. Ecocardiografía urgente.</li><li><b>Bajo gasto</b>: optimizar precarga, inotropo (dobutamina, levosimendán), IABP si refractario.</li><li><b>Vasoplejia postbomba</b>: hipotensión + IC alto + RVS bajas. Noradrenalina + vasopresina, considerar azul de metileno.</li><li><b>FA postoperatoria</b> (25-40%): amiodarona, control frecuencia, anticoagulación si &gt;48 h.</li><li>Dolor: analgesia multimodal, evitar sobresedación para extubación precoz.</li><li>Extubación en las primeras 6-8 h si estabilidad (\"fast track\").</li></ul>"}]},
{"id":"uci-postop-neuro","evidenceQuery":"neurosurgery postoperative care","cat":"uci","title":"Postoperatorio de neurocirugía","source":"Manual UCI · Neurocrítica","tags":"postoperatorio neurocirugia craneotomia tumor hematoma htic vigilancia neurologica descompresiva hipofisectomia critico uci","summary":"Vigilancia neurológica horaria + control estricto de PA + prevención de HTIC. Detectar precozmente resangrado.","sec":[{"h":"Objetivos generales","b":"<ul><li>TAM 80-100 mmHg (evitar hipertensión que aumente sangrado, y hipotensión que reduzca PPC).</li><li>PaCO2 35-40, SatO2 &gt;94%.</li><li>Normotermia, normoglucemia.</li><li>Cabecera 30° elevada, cuello en línea media.</li><li>Analgesia con opioide de corta duración (fentanilo/remifentanilo) para permitir exploración.</li><li>Antiepilépticos si prescritos (Levetiracetam 500 mg c/12 h habitualmente).</li></ul>"},{"h":"Vigilancia neurológica","b":"<ul><li>Escala Glasgow horaria las primeras 24 h.</li><li>Pupilas: tamaño y reactividad.</li><li>Focalidad motora comparativa.</li><li>Registro de sedación (RASS) para valorar deterioro real vs. sedación.</li><li><b>Alarmas de deterioro</b>: caída ≥2 puntos GCS, anisocoria nueva, focalidad nueva, cefalea intensa creciente, vómitos en escopetazo → TC craneal urgente.</li></ul>"},{"h":"Complicaciones específicas","b":"<ul><li><b>Hematoma postoperatorio</b>: aparición en 6-24 h, deterioro neurológico. TC + reintervención.</li><li><b>Edema cerebral / HTIC</b>: manejar como en TCE (osmoterapia, hiperventilación transitoria).</li><li><b>Convulsiones</b>: benzodiacepinas + antiepiléptico. Considerar EEG.</li><li><b>Neumocéfalo a tensión</b>: raro; cefalea, deterioro. Descompresión.</li><li><b>Fístula de LCR</b>: rinorrea/otorrea. Riesgo de meningitis.</li></ul>"},{"h":"Cirugía transesfenoidal (hipofisectomía)","b":"<ul><li>Vigilar <b>diabetes insípida</b>: poliuria &gt;250 mL/h con orina hipotónica y aumento del Na → DDAVP.</li><li>Vigilar <b>SIADH</b> (hiponatremia dilucional): más tardío, en días.</li><li>Cortisol postoperatorio: suplementar hidrocortisona si hipoadrenalismo.</li><li>Detectar fístula de LCR (rinorrea).</li><li>NO SNG a ciegas (riesgo de vía transesfenoidal falsa); evitar Valsalva (limpiarse la nariz).</li></ul>"},{"h":"Craniectomía descompresiva","b":"<ul><li>Cráneo con defecto óseo: no apoyar la zona (\"casco protector\" si se sienta).</li><li>Cabeza posición neutra.</li><li>Vigilar sd. del trepanado (\"sinking flap\") tras retirar edema.</li><li>Cranioplastia diferida (habitualmente 3-6 meses).</li></ul>"}]},
{"id":"uci-postop-hepatico","evidenceQuery":"liver transplantation postoperative care","cat":"uci","title":"Postoperatorio de trasplante hepático","source":"Manual UCI · Trasplante","tags":"trasplante hepatico postoperatorio inmunosupresion tacrolimus arteria hepatica trombosis rechazo drenaje coledocostomia critico uci","summary":"Vigilancia estricta de función del injerto, complicaciones vasculares y biliares. Inmunosupresión precoz.","sec":[{"h":"Fase inicial","b":"<ul><li>Ingreso intubado, sedación con propofol o remifentanilo.</li><li>Estabilización hemodinámica: TAM &gt;65 mmHg, PVC 5-8 (evitar congestión hepática por PVC alta).</li><li>Objetivo diuresis &gt;0.5-1 mL/kg/h.</li><li>Corregir hipotermia, coagulopatía habitual del receptor.</li><li>Extubación cuando estable (a menudo primeras 12-24 h).</li></ul>"},{"h":"Valoración de función del injerto","b":"<ul><li>Signos de buena función: mejoría del INR, descenso de lactato, ácidosis compensada, diuresis, despertar.</li><li>Bilirrubina, GOT/GPT, GGT, FA seriadas.</li><li>Producción biliar (por drenaje si tubo en T o Kehr).</li><li>Sospecha de disfunción primaria del injerto: transaminasas &gt;2000-3000, coagulopatía persistente, encefalopatía → retrasplante urgente.</li></ul>"},{"h":"Complicaciones vasculares (primeras 72 h clave)","b":"<ul><li><b>Trombosis arteria hepática</b> (5-10%): elevación brusca de transaminasas, coagulopatía, colangitis. <b>Eco-Doppler diario primera semana</b>. Reintervención urgente.</li><li>Trombosis portal.</li><li>Estenosis / trombosis venas suprahepáticas.</li></ul>"},{"h":"Complicaciones biliares","b":"<ul><li>Fuga biliar por anastomosis: bilis en drenaje, aumento bilirrubina en líquido.</li><li>Estenosis biliar (tardía).</li><li>Colangitis.</li></ul>"},{"h":"Inmunosupresión (protocolo habitual)","b":"<ul><li>Inducción: <b>Basiliximab</b> (anti-IL2R) día 0 y día 4.</li><li>Mantenimiento: <b>Tacrolimus + Micofenolato + Corticoides</b>.</li><li>Objetivo niveles tacrolimus 8-12 ng/mL primeras semanas.</li><li>Ajustar según función renal.</li></ul>"},{"h":"Profilaxis","b":"<ul><li>Antibiótica: piperacilina-tazobactam o cefalosporina + antianaerobio 48-72 h.</li><li>Antifúngica: fluconazol o micafungina si alto riesgo.</li><li>Antiviral CMV: valganciclovir o ganciclovir según serologías.</li><li>Neumocystis: cotrimoxazol 3 días/semana durante 6-12 meses.</li></ul>"},{"h":"Rechazo agudo","b":"<ul><li>Sospecha: fiebre, malestar, elevación de GOT/GPT/GGT/bilirrubina + colestasis.</li><li>Diagnóstico definitivo: biopsia hepática.</li><li>Tratamiento: bolos de metilprednisolona 500-1000 mg × 3 días.</li></ul>"}]},
{"id":"uci-postop-toracica","evidenceQuery":"thoracic surgery postoperative care","cat":"uci","title":"Postoperatorio de cirugía torácica pulmonar","source":"Manual UCI · Torácica","tags":"postoperatorio cirugia toracica lobectomia neumonectomia drenaje pleural fuga aerea fisioterapia analgesia epidural bloqueo critico uci","summary":"Analgesia potente + fisioterapia respiratoria + control drenajes. Neumonectomía requiere restricción hídrica.","sec":[{"h":"Objetivos generales","b":"<ul><li>Analgesia potente (permite fisioterapia): epidural torácica, PCA opioides, bloqueos (paravertebral, ESP).</li><li>Fisioterapia respiratoria precoz e intensiva.</li><li>Movilización precoz.</li><li>Broncodilatadores nebulizados si EPOC o hiperreactividad.</li><li>O2 titulado (evitar hiperoxia crónica en EPOC).</li></ul>"},{"h":"Drenaje pleural","b":"<ul><li>Vigilar: débito, aspecto, oscilación (respiración) y fuga aérea.</li><li><b>Fuga aérea</b>: burbujeo en cámara de aspiración durante espiración/tos.<ul><li>Persistente &gt;5-7 días: valorar reintervención, pleurodesis, válvula Heimlich ambulatoria.</li></ul></li><li>Débito hemático &gt;200 mL/h × 2-3 h: sospecha sangrado, reintervención.</li><li>Retirar cuando débito &lt;150-200 mL/24 h y sin fuga.</li></ul>"},{"h":"Neumonectomía — cuidados específicos","b":"<ul><li><b>Restricción hídrica</b> 1500 mL/24 h primeras 48 h (riesgo alto de edema pulmonar del pulmón único).</li><li>Balance hídrico negativo controlado.</li><li>Vigilar arritmias (FA en 20-30%).</li><li>Posición decúbito lateral con lado operado abajo (protege el pulmón único de aspiración).</li><li><b>No aspirar el drenaje pleural del lado neumonectomizado</b> (riesgo desplazamiento mediastínico).</li><li>Rx tórax diaria: nivel de líquido pleural progresivo.</li></ul>"},{"h":"Complicaciones específicas","b":"<ul><li><b>Atelectasia lobar / tapón mucoso</b>: fisioterapia, aspiración, broncoscopia.</li><li><b>Neumonía postoperatoria</b>: antibióticos según cultivos.</li><li><b>SDRA pulmón único / edema pulmonar postneumonectomía</b>: mortalidad alta, restricción hídrica desde el inicio.</li><li><b>Fístula broncopleural</b>: complicación grave de neumonectomía. Cirugía urgente.</li><li>TEP: profilaxis con HBPM.</li></ul>"}]},
{"id":"uci-tcrr-montaje","evidenceQuery":"continuous renal replacement therapy setup","cat":"uci","title":"TCRR — Montaje, purga y modalidades","source":"Manual UCI · TCRR","tags":"tcrr terapia continua reemplazo renal prismax prismaflex montaje purga cebado modalidad cvvh cvvhd cvvhdf critico uci dialisis","summary":"Preparación del sistema, cebado del filtro y elección de modalidad según objetivo.","sec":[{"h":"Preparación","b":"<ul><li>Comprobar prescripción: modalidad, dosis, anticoagulación, líquidos.</li><li>Reunir material: set completo (filtro, líneas, bolsas), líquidos según prescripción, jeringa de heparina o citrato.</li><li>Vía venosa central de <b>catéter de diálisis (13.5 Fr, doble luz)</b> — habitualmente femoral o yugular.</li></ul>"},{"h":"Montaje y purga (cebado)","b":"<ul><li>Colocar set en máquina siguiendo indicaciones de pantalla.</li><li>Purgar con SF (habitualmente 1000-2000 mL con heparina 5000 UI/L o sin heparina si citrato).</li><li>Comprobar ausencia de burbujas antes de conectar al paciente.</li><li>Conexión con técnica estéril: rojo con rojo (arterial/aspiración), azul con azul (venoso/retorno).</li></ul>"},{"h":"Modalidades","b":"<ul><li><b>CVVH (hemofiltración)</b>: eliminación por convección (arrastre por líquido de reposición). Buena depuración de moléculas medianas.</li><li><b>CVVHD (hemodiálisis)</b>: eliminación por difusión (contracorriente con dializado). Buena depuración de moléculas pequeñas (urea, creatinina).</li><li><b>CVVHDF (hemodiafiltración)</b>: combinación de ambas. Modalidad más usada en UCI.</li><li><b>SCUF</b>: ultrafiltración sola, solo elimina líquido, no depura solutos.</li></ul>"},{"h":"Prescripción básica","b":"<ul><li><b>Dosis</b>: 25-30 mL/kg/h de aclaramiento (dosis efectuada). En sobredosis o intoxicaciones: hasta 35-45 mL/kg/h.</li><li><b>Flujo sanguíneo (QB)</b>: 150-250 mL/min. Bajo si citrato.</li><li><b>Líquido de reposición/dializado</b>: soluciones estándar (Prismasol B22, HF con bicarbonato, etc.).</li><li><b>Ultrafiltración neta</b>: según balance deseado (0-300 mL/h habitual).</li></ul>"},{"h":"Cuidados durante la sesión","b":"<ul><li>Registro horario de constantes, balance, presiones del circuito.</li><li>Vigilar coagulación (citrato: Ca iónico postfiltro c/6 h; heparina: TTPa c/6 h).</li><li>Cambios de bolsas según nivel.</li><li>Cambio del set según duración (habitual 72 h o antes si alarmas de coagulación).</li><li>Tapar catéter con heparina/citrato al desconectar.</li></ul>"}]},
{"id":"uci-tcrr-citrato","evidenceQuery":"regional citrate anticoagulation CRRT","cat":"uci","title":"TCRR — Anticoagulación con citrato regional","source":"Manual UCI · TCRR","tags":"tcrr citrato regional prismaflex prismax calcio ionico postfiltro sistemico ratio ca alcalosis metabolica critico uci dialisis","summary":"Anticoagulación de elección: mejor duración del filtro, menos sangrado. Vigilar Ca iónico y ratio.","sec":[{"h":"Principio","b":"<ul><li>El citrato quela el Ca en el circuito → impide la coagulación.</li><li>El Ca se repone al retorno para restituir el Ca sistémico.</li><li>El citrato se metaboliza en el hígado a bicarbonato (efecto alcalinizante).</li></ul>"},{"h":"Ventajas e inconvenientes","b":"<ul><li>Ventajas: mejor duración del filtro (48-72 h), menos sangrado (no anticoagulación sistémica), menos consumo de hemoderivados.</li><li>Inconvenientes: complejidad, requiere monitorización de Ca iónico postfiltro y sistémico, riesgo de acumulación de citrato (\"citrate lock\") en hepatopatía grave o shock con lactato alto.</li></ul>"},{"h":"Prescripción","b":"<ul><li>Solución de citrato prediluida (Prismocitrate 18/0 o equivalente).</li><li>Flujo de citrato ajustado al flujo sanguíneo (habitualmente 2-4 mmol/L de sangre entrante).</li><li>Solución de reposición de Ca al retorno (Cloruro cálcico o Gluconato cálcico según protocolo).</li><li>Ejemplo Prismaflex: modalidad CVVHDF-citrato con Prismocitrate y Ca por bomba dedicada.</li></ul>"},{"h":"Monitorización","b":"<ul><li><b>Ca iónico POSTFILTRO</b>: objetivo <b>0.25-0.35 mmol/L</b>. Cada 6 h.<ul><li>Si &gt;0.35: aumentar citrato.</li><li>Si &lt;0.25: reducir citrato.</li></ul></li><li><b>Ca iónico SISTÉMICO</b>: objetivo <b>1.0-1.2 mmol/L</b>. Cada 6-12 h.<ul><li>Si &gt;1.2: reducir reposición de Ca.</li><li>Si &lt;1.0: aumentar reposición.</li></ul></li><li>Gasometría (pH, bicarbonato, exceso de bases): objetivo pH 7.35-7.45.</li></ul>"},{"h":"Complicaciones","b":"<ul><li><b>Alcalosis metabólica</b>: reducir concentración de citrato o cambiar solución.</li><li><b>Acidosis metabólica</b>: aumentar bicarbonato del dializado.</li><li><b>Acumulación de citrato</b>: sospechar si <b>ratio Ca total / Ca iónico &gt;2.5</b>. Causas: hepatopatía grave, shock con hipoxia hepática.<ul><li>Reducir citrato, reponer Ca, valorar cambio a heparina.</li></ul></li><li>Hipomagnesemia (el citrato quela también Mg): reponer.</li></ul>"}]},
{"id":"uci-tcrr-alarmas","evidenceQuery":"CRRT alarms troubleshooting","cat":"uci","title":"TCRR — Alarmas frecuentes y actuación","source":"Manual UCI · TCRR","tags":"tcrr alarmas presiones acceso retorno filtro tmp transmembrana prismaflex prismax coagulacion aire critico uci dialisis","summary":"Interpretar alarmas de presión y actuar rápido para evitar coagulación del filtro.","sec":[{"h":"Presiones normales de referencia","b":"<ul><li><b>Presión acceso (aspiración)</b>: negativa. Rango habitual -50 a -150 mmHg.</li><li><b>Presión retorno</b>: positiva. Rango 50-150 mmHg.</li><li><b>Presión prefiltro</b>: positiva, mayor que retorno.</li><li><b>TMP (presión transmembrana)</b>: &lt;150-200 mmHg ideal.</li><li><b>Caída de presión del filtro (drop pressure)</b>: &lt;100 mmHg.</li></ul>"},{"h":"Alarma de acceso (aspiración)","b":"<ul><li><b>Muy negativa (&gt;-200 mmHg)</b>: obstrucción del catéter (colapso, coágulo, posición).<ul><li>Verificar catéter, cambiar de posición al paciente, invertir líneas si es preciso.</li></ul></li><li><b>Poco negativa (cerca de 0)</b>: aire, desconexión, catéter mal colocado.</li></ul>"},{"h":"Alarma de retorno","b":"<ul><li><b>Muy alta (&gt;200-250 mmHg)</b>: obstrucción de la vena de retorno, catéter mal colocado, coágulo en la luz venosa del catéter.</li><li>Recolocar, aspirar el catéter.</li></ul>"},{"h":"Alarma TMP alta y filtro coagulándose","b":"<ul><li>Signos: TMP creciente, caída de presión aumenta, filtro oscuro, coágulos visibles en cámara del atrapaburbujas.</li><li>Actuación:<ul><li>Revisar anticoagulación (nivel de heparina, Ca iónico postfiltro en citrato).</li><li>Aumentar flujo sanguíneo si es bajo.</li><li>Reducir tasa de ultrafiltración si muy alta.</li><li>Considerar cambio de filtro si coagulación establecida.</li></ul></li></ul>"},{"h":"Alarma de aire","b":"<ul><li>Aire en línea venosa: detiene bomba automáticamente.</li><li>Purgar cámara, comprobar conexiones, reanudar.</li><li>Alarma persistente: revisar sensor.</li></ul>"},{"h":"Otros problemas","b":"<ul><li><b>Fuga de sangre en dializado</b>: rotura de membrana → cambio inmediato de filtro.</li><li>Bomba parada &gt;15-30 min: casi seguro coagulación → cambio de set.</li><li>Fugas en conexiones: revisar conexiones luer, apretar.</li></ul>"}]},
{"id":"uci-donacion-me","evidenceQuery":"brain dead donor management","cat":"uci","title":"Donación tras muerte encefálica — Mantenimiento del donante","source":"Manual UCI · ONT / Coordinación de Trasplantes","tags":"donacion muerte encefalica mantenimiento donante hemodinamica hipotermia diabetes insipida hormonal oxigenacion critico uci trasplante","summary":"Objetivo: mantener perfusión y oxigenación óptimas de los órganos hasta la extracción.","sec":[{"h":"Detección y comunicación","b":"<ul><li>Sospecha en todo paciente con lesión cerebral catastrófica sin opciones terapéuticas.</li><li>Comunicar precozmente al <b>Coordinador de Trasplantes (CT)</b>.</li><li>Diagnóstico de muerte encefálica: protocolo clínico + pruebas instrumentales según legislación (RD 1723/2012 en España).</li></ul>"},{"h":"Objetivos hemodinámicos","b":"<ul><li>TAM ≥65-70 mmHg.</li><li>PVC 6-10 mmHg (evitar congestión hepática y edema pulmonar).</li><li>Diuresis 0.5-3 mL/kg/h.</li><li>Lactato &lt;2 mmol/L.</li><li>Sat central venosa &gt;70%.</li></ul>"},{"h":"Cuidados generales","b":"<ul><li>Reposición de volumen con cristaloides balanceados; evitar SF a alta dosis (acidosis hiperclorémica).</li><li>Noradrenalina si hipotensión persistente (habitualmente por vasoplejia).</li><li>Vasopresina como ahorrador y para tratar diabetes insípida.</li><li>Ventilación protectora: Vt 6-8 mL/kg peso predicho, PEEP 8-10, FiO2 mínima para SatO2 &gt;95%.</li><li>Normotermia (36-37°C): calentadores activos frecuentes por hipotermia central.</li></ul>"},{"h":"Diabetes insípida central","b":"<ul><li>Muy frecuente (&gt;80% donantes).</li><li>Poliuria &gt;4 mL/kg/h con orina hipotónica (Osm &lt;300, densidad &lt;1005) + Na plasma en ascenso.</li><li><b>Desmopresina (DDAVP) 1-4 μg IV</b>, repetible c/6-8 h. Alternativa: perfusión de vasopresina.</li><li>Reponer pérdidas con SG5% para corregir hipernatremia lentamente.</li></ul>"},{"h":"Terapia hormonal","b":"<ul><li>Considerar en donante multiorgánico inestable:<ul><li>Metilprednisolona 15 mg/kg IV bolo.</li><li>T3/T4 (levotiroxina) en algunos protocolos.</li><li>Insulina en perfusión para glucemia 140-180.</li></ul></li></ul>"},{"h":"Analíticas periódicas","b":"<ul><li>Iones y gasometría cada 2-4 h.</li><li>Hemograma, coagulación, función renal, función hepática cada 4-6 h.</li><li>Serologías y estudios inmunológicos según protocolo del CT.</li></ul>"}]},
{"id":"uci-donacion-daco","evidenceQuery":"donation after circulatory death Maastricht","cat":"uci","title":"Donación en asistolia controlada (DAC / Maastricht III)","source":"Manual UCI · ONT / Coordinación de Trasplantes","tags":"donacion asistolia controlada dac dac tipo iii maastricht limitacion tratamiento soporte vital funcional isquemia caliente critico uci trasplante","summary":"Donación tras LTSV con protocolo estricto de tiempos de isquemia. Requiere coordinación multidisciplinar.","sec":[{"h":"Concepto y clasificación de Maastricht","b":"<ul><li>Donación en asistolia = tras parada cardiocirculatoria.</li><li><b>Tipo I</b>: cadáver a la llegada al hospital.</li><li><b>Tipo II</b>: PCR presenciada extrahospitalaria, RCP fallida.</li><li><b>Tipo III</b>: <b>controlada</b>, tras decisión de limitación de tratamiento de soporte vital (LTSV).</li><li><b>Tipo IV</b>: PCR durante o tras muerte encefálica.</li></ul>"},{"h":"Requisitos previos","b":"<ul><li>Decisión de LTSV previa e independiente del proceso de donación.</li><li>Paciente sin criterios de muerte encefálica.</li><li>Consentimiento familiar tras información por el equipo asistencial y el CT.</li><li>Evaluación de viabilidad de órganos por CT y equipos.</li></ul>"},{"h":"Tiempos críticos","b":"<ul><li><b>Tiempo de isquemia caliente funcional</b>: desde caída de PAS &lt;60 mmHg o SatO2 &lt;70% hasta la <b>perfusión</b> con solución de preservación tras confirmación de exitus.</li><li>Límites orientativos (varían por órgano y programa):<ul><li>Hígado y páncreas: &lt;30 min.</li><li>Pulmones y riñones: &lt;60-90 min.</li></ul></li><li>Confirmación de exitus tras <b>5 min de asistolia</b> (\"no touch period\").</li></ul>"},{"h":"Procedimiento simplificado","b":"<ol><li>Decisión de LTSV consensuada y documentada.</li><li>Consentimiento familiar de donación.</li><li>Preparación en quirófano o UCI: equipo de extracción listo.</li><li>Retirada del soporte vital.</li><li>Vigilancia de constantes hasta parada cardiocirculatoria.</li><li>Certificación de exitus tras 5 min de asistolia.</li><li>Extracción rápida o inicio de <b>perfusión regional normotérmica (ECMO)</b> según protocolo.</li></ol>"},{"h":"Cuidados en UCI","b":"<ul><li>Analgesia y sedación adecuadas (foco en confort del paciente, no en preservar órganos).</li><li>NO administrar heparina/fentolamina antes del exitus (algunos programas lo permiten con consentimiento).</li><li>Respeto al proceso de duelo familiar.</li><li>Registro riguroso de tiempos.</li><li>Apoyo psicológico al equipo asistencial (proceso emocionalmente demandante).</li></ul>"}]},
{"id":"uci-deteccion-donante","evidenceQuery":"organ donor identification referral","cat":"uci","title":"Detección precoz del donante y comunicación con CCT","source":"Manual UCI · ONT / Coordinación de Trasplantes","tags":"deteccion donante coordinacion trasplantes cct ont oferta gcs valoracion serologias registro critico uci","summary":"Comunicar precozmente al CT ante todo paciente con lesión neurológica catastrófica sin opciones.","sec":[{"h":"A quién considerar posible donante","b":"<ul><li>Todo paciente con lesión encefálica catastrófica (TCE grave, HIC extensa, ACV masivo, HSA grado V, encefalopatía anóxica sin opciones).</li><li>GCS ≤5 sin opciones terapéuticas.</li><li>Pacientes en los que se plantea LTSV (candidatos a DAC).</li><li>Independientemente de edad avanzada o comorbilidades (evaluar caso a caso).</li></ul>"},{"h":"Contraindicaciones absolutas actuales (revisar periódicamente)","b":"<ul><li>Neoplasia activa con alto riesgo de transmisión (excepto algunos tumores SNC primarios de bajo grado).</li><li>Infección sistémica activa no controlada con germen multirresistente incontrolable.</li><li>Enfermedad neurodegenerativa por priones.</li><li>VIH, VHB, VHC en la mayoría de programas (pero cada vez más donación en positivos para receptores seleccionados).</li></ul>"},{"h":"Contactar con CT precozmente","b":"<ul><li>Cuando aparezca la <b>sospecha clínica</b>, no cuando ya haya criterios de muerte encefálica.</li><li>Datos iniciales a proporcionar: edad, causa, GCS, evolución, comorbilidades relevantes, serologías previas si las hay.</li><li>Coordinación centralizada por ONT (España) y CCTA autonómicas.</li></ul>"},{"h":"Estudios habituales del donante","b":"<ul><li>Serologías: VIH, VHB, VHC, sífilis, CMV, VEB, Toxoplasma, HTLV.</li><li>PCR de patógenos oportunistas según protocolo.</li><li>Grupo sanguíneo, tipaje HLA.</li><li>Ecocardiografía, ECG, coronariografía si donante cardiaco.</li><li>Ecografía / TC / broncoscopia según órgano.</li><li>Hemocultivos, urocultivo, aspirado traqueal.</li></ul>"},{"h":"Comunicación con familia","b":"<ul><li>Información sobre pronóstico por equipo clínico ANTES de plantear la donación.</li><li>Petición realizada por CT en colaboración con clínicos responsables.</li><li>Entorno adecuado, tiempo suficiente, respeto emocional.</li><li>La familia decide en representación del paciente (España: consentimiento presunto, pero se respeta la voluntad familiar).</li></ul>"}]},
{"id":"ped-rcp-neonatal","evidenceQuery":"neonatal resuscitation program algorithm","cat":"ped","title":"Reanimación neonatal — Algoritmo NRP","source":"Manual Pediátrico · NRP / ILCOR","tags":"reanimacion neonatal rcp paritorio recien nacido apgar liquido meconial ventilacion presion positiva compresiones adrenalina critico ped","summary":"70% de neonatos NO necesita nada. Cadena: sacar, secar, calentar, estimular. Ventilar es la clave.","sec":[{"h":"Preparación","b":"<ul><li>Cuna térmica caliente, toallas secas.</li><li>Ambú/bolsa autoinflable con reservorio + mascarilla neonatal.</li><li>Aspirador y sondas de aspiración.</li><li>Pulsioxímetro (en mano derecha = preductal).</li><li>Material de intubación (TET 2.5-3.5), fármacos.</li></ul>"},{"h":"Preguntas iniciales","b":"<ul><li>¿Gestación a término?</li><li>¿Buen tono muscular?</li><li>¿Llora o respira?</li><li>Si 3 SÍ → contacto piel con piel, secar, cubrir.</li><li>Si algún NO → cuna térmica, iniciar los 5 pasos iniciales.</li></ul>"},{"h":"5 pasos iniciales (primeros 30 s)","b":"<ol><li>Proporcionar calor.</li><li>Colocar la cabeza en \"posición de olfateo\" (ligera extensión).</li><li>Aspirar boca y nariz solo si obstrucción.</li><li>Secar completamente y estimular.</li><li>Reposicionar la cabeza.</li></ol>"},{"h":"Evaluación tras 30 s","b":"<ul><li><b>FC &gt;100 lpm + respiración eficaz</b>: cuidados de rutina.</li><li><b>FC &gt;100 pero respiración inadecuada / apnea / cianosis persistente</b>: valorar CPAP o VPP.</li><li><b>FC &lt;100</b>: <b>VPP inmediata</b>.</li></ul>"},{"h":"Ventilación con presión positiva (VPP)","b":"<ul><li>La medida más importante en la reanimación neonatal.</li><li>Frecuencia: <b>40-60/min</b>.</li><li>Presión: 20-25 cmH2O (30 en primer inflado).</li><li>Objetivo: subida de FC en 15-30 s.</li><li>Si no responde: MR SOPA (Mask, Reposition, Suction, Open mouth, Pressure, Airway alternative — IOT o mascarilla laríngea).</li></ul>"},{"h":"Compresiones torácicas","b":"<ul><li>Iniciar si <b>FC &lt;60 tras 30 s de VPP eficaz</b>.</li><li>Técnica de los dos pulgares rodeando el tórax.</li><li>Ritmo <b>3 compresiones : 1 ventilación</b> = 120 eventos/min (90 compresiones + 30 ventilaciones).</li><li>Profundidad: 1/3 diámetro AP del tórax.</li></ul>"},{"h":"Adrenalina","b":"<ul><li>Si FC &lt;60 tras 60 s de compresiones + VPP con FiO2 100% e IOT.</li><li><b>0.01-0.03 mg/kg IV/IO</b> (0.1-0.3 mL/kg de la dilución 1:10.000).</li><li>Alternativa por TET: 0.05-0.1 mg/kg mientras se logra vía IV/IO.</li><li>Repetir cada 3-5 min.</li></ul>"},{"h":"Volumen","b":"<ul><li>Si sospecha hipovolemia (palidez, sangrado, mala respuesta): <b>SF o Ringer 10 mL/kg IV/IO</b> en 5-10 min.</li><li>Concentrados de hematíes O Rh- 10 mL/kg si sangrado activo.</li></ul>"},{"h":"SpO2 objetivo por edad","b":"<ul><li>1 min: 60-65%.</li><li>3 min: 70-75%.</li><li>5 min: 80-85%.</li><li>10 min: 85-95%.</li></ul>"},{"h":"Líquido meconial","b":"<ul><li>Vigoroso: no aspiración rutinaria de tráquea, seguir pasos habituales.</li><li>No vigoroso: valorar aspiración endotraqueal si obstrucción de vía aérea. Ya no es rutinario intubar para aspirar.</li></ul>"}]},
{"id":"ped-farmacos-tabla","evidenceQuery":"pediatric emergency drugs weight based dosing","cat":"ped","title":"Fármacos de emergencia pediátrica — Tabla rápida por peso","source":"Manual Pediátrico Crítico · AEP","tags":"farmacos emergencia pediatrica adrenalina atropina amiodarona bicarbonato dosis tabla peso rapida sedacion secuencia critico ped","summary":"Dosis por peso de los fármacos más usados en la reanimación y emergencia pediátrica.","sec":[{"h":"RCP","b":"<ul><li><b>Adrenalina</b> 0.01 mg/kg IV/IO (0.1 mL/kg de 1:10.000), máx 1 mg. IT: 0.1 mg/kg.</li><li><b>Amiodarona</b> 5 mg/kg IV/IO en FV/TVSP refractaria (máx 300 mg), repetible.</li><li><b>Lidocaína</b> 1 mg/kg IV/IO (alternativa a amiodarona).</li><li><b>Bicarbonato</b> 1 mEq/kg IV en acidosis grave o paro prolongado.</li><li><b>Sulfato de magnesio</b> 25-50 mg/kg IV en torsades o hipoMg.</li><li><b>Gluconato cálcico 10%</b> 0.5 mL/kg IV en hiperK, hipoCa, sobredosis calcioantagonistas.</li></ul>"},{"h":"Arritmias","b":"<ul><li><b>Atropina</b> 0.02 mg/kg IV (mín 0.1 mg, máx 0.5 mg niño / 1 mg adolescente) en bradicardia vagal, intoxicación colinérgica.</li><li><b>Adenosina</b> 0.1 mg/kg (máx 6 mg) IV rápido; segunda dosis 0.2 mg/kg (máx 12 mg) en TSV.</li><li><b>Cardioversión sincronizada</b>: 0.5-1 J/kg, subir a 2 J/kg si no responde.</li><li><b>Desfibrilación</b>: 4 J/kg (hasta 10 J/kg si refractario, sin superar dosis adulta).</li></ul>"},{"h":"Sedación / analgesia","b":"<ul><li><b>Midazolam</b> 0.1-0.2 mg/kg IV, IM (0.3 mg/kg IN o VO).</li><li><b>Fentanilo</b> 1-2 μg/kg IV.</li><li><b>Ketamina</b> 1-2 mg/kg IV (procedimientos, inducción en shock/asma).</li><li><b>Propofol</b> 1-2 mg/kg IV (evitar en &lt;16 años en perfusión larga).</li></ul>"},{"h":"Secuencia rápida de intubación","b":"<ul><li>Premedicación: atropina 0.02 mg/kg si &lt;1 año o dosis de succinilcolina.</li><li>Inducción: etomidato 0.3 mg/kg, ketamina 1-2 mg/kg, propofol 2 mg/kg.</li><li>Relajante: rocuronio 1.2 mg/kg o succinilcolina 1-2 mg/kg.</li></ul>"},{"h":"Fluidoterapia y expansores","b":"<ul><li><b>Bolo de cristaloide</b>: 10-20 mL/kg SF/Ringer IV en 5-10 min. Reevaluar y repetir hasta 40-60 mL/kg si shock.</li><li><b>Concentrado de hematíes</b>: 10-15 mL/kg si hemorragia.</li><li><b>Suero glucosado 10%</b>: 2-5 mL/kg IV si hipoglucemia.</li></ul>"},{"h":"Anticonvulsivantes","b":"<ul><li><b>Midazolam IN/IM/bucal</b>: 0.2-0.3 mg/kg (máx 10 mg).</li><li><b>Diazepam rectal</b>: 0.5 mg/kg (máx 10 mg).</li><li><b>Levetiracetam</b>: 60 mg/kg IV (máx 4.5 g).</li><li><b>Fenitoína/Fosfenitoína</b>: 20 mg/kg IV (máx 1.5 g).</li></ul>"},{"h":"Antibióticos empíricos","b":"<ul><li><b>Cefotaxima</b>: 200-300 mg/kg/día en 3-4 dosis.</li><li><b>Ceftriaxona</b>: 100 mg/kg/día en 1-2 dosis.</li><li><b>Vancomicina</b>: 60 mg/kg/día c/6 h.</li><li><b>Ampicilina</b> (neonato): 200-300 mg/kg/día c/6-8 h.</li><li><b>Gentamicina</b> (neonato): 4-5 mg/kg/día.</li></ul>"}]},
{"id":"ped-rcp-avanzada","evidenceQuery":"pediatric advanced life support","cat":"ped","title":"Soporte vital avanzado pediátrico (SVAP)","source":"Manual Pediátrico Crítico · ERC 2021","tags":"svap soporte vital avanzado pediatrico algoritmo pals ritmos desfibrilables no desfibrilables adrenalina causas reversibles critico ped","summary":"Algoritmo por ritmos con dosis pediátricas y las 4H/4T adaptadas.","sec":[{"h":"Reconocimiento y activación","b":"<ul><li>Inconsciente + no respira o gasping + sin pulso central (comprobar &lt;10 s).</li><li>Iniciar RCP 15:2 (2 reanimadores) o 30:2 (1 reanimador).</li><li>Solicitar desfibrilador y equipo, pedir ayuda.</li></ul>"},{"h":"Vía aérea","b":"<ul><li>Ventilar con bolsa-mascarilla con O2 100%.</li><li>Cánula orofaríngea/nasofaríngea según edad.</li><li>Considerar IOT cuando sea posible sin interrumpir compresiones más de 5 s.</li><li>Confirmar posición del TET con auscultación + capnografía.</li></ul>"},{"h":"Monitorización y ritmo","b":"<ul><li>Colocar palas/parches y valorar ritmo lo antes posible.</li><li>Palas pediátricas &lt;10 kg; adultas &gt;10 kg.</li></ul>"},{"h":"Ritmo desfibrilable (FV / TVSP)","b":"<ol><li>Choque: <b>4 J/kg</b>. Reanudar RCP 2 min.</li><li>Analizar ritmo. Si persiste: choque + RCP.</li><li>Tras 3er choque: <b>Adrenalina 0.01 mg/kg IV/IO</b> + <b>Amiodarona 5 mg/kg IV/IO</b>.</li><li>Continuar ciclo. Adrenalina cada 3-5 min.</li><li>Amiodarona 5 mg/kg segunda dosis tras 5º choque (máx 300 mg/dosis).</li><li>Alternativa: Lidocaína 1 mg/kg si no amiodarona.</li></ol>"},{"h":"Ritmo NO desfibrilable (Asistolia / AESP)","b":"<ol><li>RCP + <b>Adrenalina 0.01 mg/kg IV/IO tan pronto sea posible</b>.</li><li>Repetir adrenalina cada 3-5 min.</li><li>Buscar y tratar la causa (hipoxia es la más frecuente en niños).</li></ol>"},{"h":"Causas reversibles 4H/4T pediátricas","b":"<ul><li><b>Hipoxia</b>: revisar vía aérea, oxigenar bien.</li><li><b>Hipovolemia</b>: cristaloide 20 mL/kg.</li><li><b>Hipoglucemia</b>: SG10% 2-5 mL/kg.</li><li><b>Hipotermia</b>: recalentar activamente.</li><li><b>Hidrogeniones (acidosis)</b>: bicarbonato 1 mEq/kg.</li><li><b>Hipo/HiperK</b>: Ca + insulina/glucosa + bicarbonato + salbutamol si hiperK grave.</li><li><b>Neumotórax a tensión</b>: toracocentesis 2º EIC LMC.</li><li><b>Taponamiento</b>: pericardiocentesis.</li><li><b>Tóxicos</b>: antídotos.</li><li><b>TEP</b>: raro; fibrinolisis empírica si sospecha.</li></ul>"},{"h":"Cuidados post-RCE","b":"<ul><li>Optimizar oxigenación (SpO2 94-98%) y ventilación (PaCO2 35-40).</li><li>Mantener TAM en percentil ≥5 para edad.</li><li>Control de temperatura (32-36°C, o al menos evitar fiebre) tras RCE en pacientes comatosos.</li><li>Control glucémico (evitar hipoglucemia e hiperglucemia).</li><li>Ingreso en UCI pediátrica.</li></ul>"}]},
{
  "id": "trauma-tce-ingesa",
  "cat": "trauma",
  "especialidad": "Traumatología / Urgencias",
  "title": "Traumatismo craneoencefálico (TCE)",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias traumatológicas, 2013",
  "tags": "tce traumatismo craneoencefalico glasgow pic herniacion anisocoria manitol convulsiones trauma cervical",
  "summary": "Manejo extrahospitalario del TCE con prioridad ABC, inmovilización cervical, detección de hipertensión intracraneal, valoración neurológica rápida y control tensional.",
  "relations": {
    "patologias": [
      "Traumatismo craneoencefálico",
      "Hipertensión intracraneal",
      "Herniación cerebral",
      "Convulsiones"
    ],
    "farmacos": [
      "Midazolam",
      "Propofol",
      "Metamizol",
      "Dexketoprofeno",
      "Urapidil",
      "Manitol",
      "Diazepam",
      "Fenitoína",
      "Dopamina"
    ],
    "escalas": [
      "Escala de Glasgow",
      "AVDI"
    ],
    "tecnicas": [
      "Inmovilización cervical",
      "Oxigenoterapia",
      "Intubación orotraqueal",
      "Sondaje nasogástrico",
      "Canalización venosa"
    ],
    "alertas": [
      "Glasgow ≤ 8",
      "anisocoria",
      "bradicardia + hipertensión + bradipnea",
      "signos de decorticación/descerebración"
    ]
  },
  "sec": [
    {
      "h": "Definición y objetivo",
      "b": "<p>El traumatismo craneoencefálico es una causa principal de mortalidad en el paciente politraumatizado. En el entorno extrahospitalario el objetivo es evitar lesión cerebral secundaria: hipoxia, hipotensión, aumento de presión intracraneal, convulsiones y traslado inadecuado.</p><ul><li>Asumir lesión cervical asociada en todo TCE significativo.</li><li>Priorizar vía aérea, ventilación, circulación e inmovilización cervical.</li><li>Detectar precozmente signos de hipertensión intracraneal y herniación.</li></ul>"
    },
    {
      "h": "Fisiopatología clave",
      "b": "<ul><li><b>Lesión primaria:</b> daño directo por impacto, aceleración/deceleración o fenómeno golpe-contragolpe.</li><li><b>Lesión secundaria:</b> edema, hipoxia, hipotensión, sangrado o aumento de presión intracraneal.</li><li>La perfusión cerebral depende de la relación entre presión arterial media y presión intracraneal. Si aumenta la presión intracraneal o cae la presión arterial, disminuye la perfusión cerebral.</li><li>En TCE grave debe evitarse la hipotensión. El manual plantea mantener una presión sistémica suficiente, aproximadamente TAS 110-120 mmHg en lesión severa.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A · Airway:</b> asegurar vía aérea permeable con control cervical. Aspirar secreciones si precisa. Preparar vía aérea avanzada si Glasgow bajo o ventilación ineficaz.</li><li><b>B · Breathing:</b> oxígeno a alto flujo. Valorar frecuencia, patrón respiratorio y saturación. Evitar hipoxia.</li><li><b>C · Circulation:</b> controlar hemorragias, valorar pulso, piel, relleno capilar y tensión arterial. La hipotensión en TCE suele indicar shock hemorrágico o neurogénico asociado.</li><li><b>D · Disability:</b> Glasgow, pupilas, movilidad/sensibilidad de extremidades, signos de focalidad, decorticación o descerebración.</li><li><b>E · Exposure:</b> exposición completa, búsqueda de lesiones asociadas y prevención de hipotermia.</li></ol>"
    },
    {
      "h": "Exploración neurológica rápida",
      "b": "<ul><li><b>Nivel de conciencia:</b> AVDI y Glasgow.</li><li><b>Glasgow ≤ 8:</b> considerar lesión encefálica severa y necesidad de control avanzado de vía aérea según recursos/protocolo.</li><li><b>Pupilas:</b> tamaño, simetría y reflejo fotomotor. Anisocoria o midriasis unilateral pueden ser signo precoz de aumento de presión intracraneal.</li><li><b>Motor/sensitivo:</b> comprobar movilidad y sensibilidad en manos y pies.</li><li><b>Signos de herniación:</b> disminución del nivel de conciencia, anisocoria, decorticación o descerebración.</li></ul>"
    },
    {
      "h": "Signos de alarma",
      "b": "<ul><li>Triada compatible con aumento de presión intracraneal: hipertensión arterial, bradicardia y bradipnea.</li><li>Glasgow bajo o deterioro progresivo.</li><li>Anisocoria, pupilas fijas o cambios pupilares.</li><li>Vómitos repetidos, cefalea intensa, intervalo lúcido, amnesia o convulsiones.</li><li>Signos de fractura de base de cráneo: rinorragia, licuorrea, hematoma retroauricular o periorbitario.</li><li>Rigidez de descerebración: tratar como emergencia neurológica.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>Seguridad de la escena y valoración primaria.</li><li>Control cervical manual y collarín cervical.</li><li>Oxígeno a alto flujo; valorar ventilación asistida si respiración ineficaz.</li><li>Monitorización: ECG, SatO₂, TA, frecuencia respiratoria, frecuencia cardiaca y nivel de conciencia.</li><li>Canalizar vía venosa. Tratar hipotensión de forma agresiva evitando hipoperfusión cerebral.</li><li>Exploración de cabeza: heridas, deformidades, signos de fractura de base de cráneo.</li><li>Valorar analgesia y sedación según situación clínica y protocolo local.</li><li>Si signos de herniación: control avanzado de vía aérea y medidas de hiperventilación transitoria según indicación médica/protocolo.</li><li>Traslado urgente a centro útil, con preaviso si TCE grave.</li></ol>"
    },
    {
      "h": "Farmacología orientativa del manual",
      "b": "<ul><li><b>Sedación:</b> midazolam orientativamente 1 mg/10 kg o propofol según disponibilidad, experiencia y protocolo.</li><li><b>Analgesia:</b> metamizol o dexketoprofeno. El manual recomienda evitar inicialmente opiáceos y depresores del SNC si pueden dificultar la valoración neurológica.</li><li><b>Hipotensión:</b> cristaloides IV. Si no hay respuesta, el manual propone dopamina.</li><li><b>Hipertensión:</b> urapidil IV en bolo lento según protocolo.</li><li><b>Signos de hipertensión intracraneal/herniación:</b> manitol 20 % 1 g/kg en unos 20 minutos; evitar si shock o hipotensión grave.</li><li><b>Convulsiones:</b> diazepam IV en bolos y fenitoína 18 mg/kg IV según protocolo.</li></ul><p><b>Nota:</b> revisar dosis y fármacos con protocolos locales actuales antes de uso clínico.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Mantener alineación cabeza-cuello-tronco y evitar movimientos cervicales.</li><li>Control estricto de constantes y Glasgow seriado.</li><li>Registrar pupilas, movilidad, sensibilidad y cambios neurológicos.</li><li>Evitar hipoxia, hipotensión, hipoglucemia/hiperglucemia e hipotermia.</li><li>Preparar material de vía aérea avanzada, aspiración, oxígeno, monitorización y medicación anticonvulsivante.</li><li>Comunicar al equipo receptor: mecanismo, hora, Glasgow inicial/actual, pupilas, constantes, tratamientos y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Olvidar que todo TCE relevante puede tener lesión cervical.</li><li>Retrasar el traslado por exploraciones no prioritarias.</li><li>Permitir hipotensión o hipoxia.</li><li>Colocar sonda nasogástrica si hay signos de fractura de base de cráneo.</li><li>No registrar evolución de Glasgow y pupilas.</li><li>Enmascarar la exploración neurológica con sedación/analgesia sin necesidad o sin registro.</li></ul>"
    }
  ],
  "block": 1
},
{
  "id": "trauma-vertebral-medular-ingesa",
  "cat": "trauma",
  "especialidad": "Traumatología / Neurología / Urgencias",
  "title": "Traumatismo vertebral y medular",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias traumatológicas, 2013",
  "tags": "trauma vertebral medular lesion medular shock neurogenico rme collarin colchón vacío metilprednisolona dopamina",
  "summary": "Evaluación extrahospitalaria del traumatismo vertebral/medular, restricción de movimientos espinales y manejo inicial del shock neurogénico.",
  "relations": {
    "patologias": [
      "Lesión medular",
      "Shock neurogénico",
      "Traumatismo vertebral"
    ],
    "farmacos": [
      "Cristaloides",
      "Dopamina",
      "Metilprednisolona"
    ],
    "escalas": [
      "AVDI",
      "Glasgow"
    ],
    "tecnicas": [
      "Restricción de movimientos espinales",
      "Collarín cervical",
      "Colchón de vacío",
      "Tabla larga",
      "Sondaje vesical"
    ],
    "alertas": [
      "hipotensión + bradicardia + piel caliente",
      "déficit neurológico",
      "dolor cervical/dorsolumbar",
      "mecanismo de alta energía"
    ]
  },
  "sec": [
    {
      "h": "Definición y objetivo",
      "b": "<p>El traumatismo vertebral puede producir lesión medular completa o parcial. El objetivo extrahospitalario es prevenir lesión secundaria por hipoxia, hipotensión, movilización inadecuada, edema o compresión.</p><ul><li>Proteger vía aérea sin movilizar la columna.</li><li>Estabilizar columna en posición neutra.</li><li>Detectar déficit motor/sensitivo y shock neurogénico.</li></ul>"
    },
    {
      "h": "Mecanismos de lesión",
      "b": "<ul><li><b>Hiperextensión:</b> impactos posteriores o golpes con extensión excesiva del cuello.</li><li><b>Hiperflexión:</b> caídas de bicicleta/moto/caballo o zambullidas.</li><li><b>Compresión axial:</b> caídas de altura sobre pies o cabeza.</li><li><b>Rotación:</b> vuelcos, accidentes de tráfico o deportes de contacto.</li><li><b>Lateralización:</b> impacto lateral.</li><li><b>Elongación:</b> tracción por cinturón mal colocado u otros mecanismos.</li></ul>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ol><li><b>ABCDE:</b> vía aérea, ventilación, circulación y déficit neurológico.</li><li><b>Control cervical manual inmediato</b> si mecanismo compatible.</li><li><b>Exploración motora:</b> pedir que mueva dedos de manos y pies si está consciente.</li><li><b>Exploración sensitiva:</b> detectar parestesias, hipoestesia o nivel sensitivo.</li><li><b>Dolor:</b> preguntar por dolor cervical, dorsal o lumbar; palpar si procede evitando movilización.</li></ol>"
    },
    {
      "h": "Indicaciones de restricción de movimientos espinales",
      "b": "<ul><li>Accidente de alta energía o velocidad elevada.</li><li>Caída desde altura relevante o carga axial.</li><li>Zambullida o accidente deportivo con impacto en cabeza/cuello.</li><li>Herida penetrante cerca de columna.</li><li>Lesión contusa por encima de clavículas.</li><li>Trauma con alteración del nivel de conciencia.</li><li>Intoxicación, dolor que enmascara, déficit neurológico, dolor espinal espontáneo o a la palpación.</li></ul>"
    },
    {
      "h": "Shock neurogénico",
      "b": "<p>Debe sospecharse en lesión medular alta con hipotensión, bradicardia y piel caliente/bien perfundida. Es un diagnóstico de exclusión tras descartar hemorragia u otras causas de shock.</p><ul><li>No suele presentar piel fría, pálida y sudorosa como el shock hemorrágico.</li><li>Puede asociarse a retención urinaria por atonía vesical.</li><li>El objetivo es mantener perfusión adecuada y evitar daño medular secundario.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>Asegurar vía aérea con control cervical.</li><li>Oxígeno a alto flujo; valorar intubación si compromiso respiratorio o neurológico.</li><li>Collarín cervical y restricción de movimientos espinales si indicada.</li><li>Colchón de vacío o tabla larga con inmovilizador de cabeza y sujeción de torso/pelvis.</li><li>Vía venosa periférica y cristaloides si hipotensión o riesgo de shock.</li><li>Monitorización: TA, FC, SatO₂, ECG y nivel de conciencia.</li><li>Valorar sondaje vesical si retención urinaria y entorno lo permite.</li><li>Traslado a centro útil con aviso de posible lesión medular.</li></ol>"
    },
    {
      "h": "Farmacología orientativa del manual",
      "b": "<ul><li><b>Cristaloides IV:</b> hasta recuperar perfusión clínica y TAS aproximada 90-100 mmHg según respuesta.</li><li><b>Dopamina:</b> si no se alcanzan cifras tensionales con cristaloides; el manual propone 200 mg en 250 ml de SG 5 % a 21 ml/h.</li><li><b>Metilprednisolona:</b> el manual describe bolo 30 mg/kg en 15-20 min y perfusión 5,4 mg/kg/h durante 23 h.</li></ul><p><b>Nota importante:</b> el uso de corticoides en lesión medular traumática es controvertido y debe ajustarse a protocolos actuales del centro.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Mantener alineación cabeza-cuello-tronco durante toda la asistencia.</li><li>Verificar collarín, sujeciones y ausencia de presión excesiva.</li><li>Registrar función motora y sensitiva inicial y evolutiva.</li><li>Prevenir hipotermia y úlceras por presión en inmovilización prolongada.</li><li>Control de perfusión distal tras inmovilizaciones o tracciones.</li><li>Comunicación clara al hospital: mecanismo, déficit, constantes, tratamiento y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Mover al paciente antes de estabilizar columna si no hay amenaza vital inmediata.</li><li>Confundir shock neurogénico con ausencia de gravedad por piel caliente.</li><li> repetidamente una pelvis o columna inestable.</li><li>Olvidar reevaluación neurológica tras movilización o inmovilización.</li><li>Aplicar medicación controvertida sin protocolo vigente.</li></ul>"
    }
  ],
  "block": 1
},
{
  "id": "trauma-politrauma-inicial-ingesa",
  "cat": "trauma",
  "especialidad": "Traumatología / Urgencias",
  "title": "Atención inicial al paciente politraumatizado",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias traumatológicas, 2013",
  "tags": "politrauma politraumatizado abcde avdi sample dcap hora oro minutos platino revision rapida trauma escena",
  "summary": "Abordaje inicial del paciente politraumatizado: escena, evaluación inicial, revisión rápida de trauma, exploración secundaria y reevaluación.",
  "relations": {
    "patologias": [
      "Politraumatismo",
      "Shock",
      "Traumatismo grave"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Analgesia según protocolo"
    ],
    "escalas": [
      "AVDI",
      "Glasgow",
      "SAMPLE"
    ],
    "tecnicas": [
      "Control de hemorragias",
      "Inmovilización",
      "Auscultación torácica",
      "Canalización venosa",
      "Monitorización"
    ],
    "alertas": [
      "mecanismo de alta energía",
      "inconsciente",
      "FR < 10",
      "pulso filiforme",
      "piel fría/pálida",
      "alteración de conciencia"
    ]
  },
  "sec": [
    {
      "h": "Concepto y tiempos críticos",
      "b": "<p>Politraumatizado es todo paciente con más de una lesión traumática, alguna de ellas con riesgo vital real o potencial. Todo paciente inconsciente tras trauma debe considerarse grave hasta demostrar lo contrario.</p><ul><li><b>Hora de oro:</b> supervivencia ligada al acceso rápido a tratamiento definitivo.</li><li><b>Diez minutos de platino:</b> tiempo extrahospitalario para evaluación y actuaciones críticas antes del traslado.</li><li>La atención al paciente tiene prioridad sobre la extricación salvo riesgo para rescatadores o víctima.</li></ul>"
    },
    {
      "h": "Valoración de la escena",
      "b": "<ol><li>Protección frente a fluidos: guantes, mascarilla/protección ocular si vía aérea o sangrado.</li><li>Seguridad: ubicación de ambulancia, riesgo de tráfico, fuego, electricidad, agresión o tóxicos.</li><li>Número de pacientes y triage inicial.</li><li>Solicitar recursos adicionales si se prevé necesidad.</li><li>Identificar mecanismo: contuso, penetrante, caída, atropello, vuelco, explosión, etc.</li></ol>"
    },
    {
      "h": "Evaluación inicial en menos de 2 minutos",
      "b": "<ol><li><b>Impresión general:</b> gravedad aparente, edad extrema, sangrado, respiración, postura.</li><li><b>Nivel de conciencia AVDI:</b> Alerta, respuesta Verbal, respuesta al Dolor, Inconsciente.</li><li><b>Vía aérea:</b> si no habla o está inconsciente, mirar-oír-sentir, aspirar si precisa y abrir vía aérea con control cervical.</li><li><b>Respiración:</b> si FR < 10 rpm, respiración superficial o ventilación ineficaz, iniciar asistencia ventilatoria.</li><li><b>Circulación:</b> pulso, piel, relleno capilar, hemorragias externas y control inmediato de sangrado.</li></ol>"
    },
    {
      "h": "Revisión rápida de trauma",
      "b": "<p>Exploración breve de cabeza a pies para detectar lesiones que amenazan la vida.</p><ul><li><b>SAMPLE:</b> Síntomas, Alergias, Medicación, Patologías previas, última ingesta, Eventos del accidente.</li><li><b>Cabeza/cuello:</b> lesiones, venas yugulares, tráquea centrada, collarín cervical.</li><li><b>Tórax:</b> movimientos paradójicos, heridas abiertas, dolor, inestabilidad, crepitación y ruidos respiratorios bilaterales.</li><li><b>Abdomen:</b> distensión, contusiones, heridas penetrantes, dolor, defensa o rigidez.</li><li><b>Pelvis:</b> dolor, deformidad, inestabilidad; si es inestable, inmovilizar y no repetir maniobra.</li><li><b>Extremidades:</b> deformidad, dolor, crepitación, movilidad y sensibilidad distal.</li><li><b>Espalda:</b> explorar durante transferencia o rodamiento controlado.</li></ul>"
    },
    {
      "h": "Evaluación secundaria",
      "b": "<p>Debe realizarse durante el traslado si la situación lo permite.</p><ol><li>Registrar signos vitales de nuevo.</li><li>Exploración neurológica: conciencia, pupilas, función motora y sensitiva.</li><li>Monitorización.</li><li>Exploración cabeza-pies con esquema DCAP: deformidades, contusiones, abrasiones y penetraciones.</li><li>Revisar cabeza, cuello, tórax, abdomen, pelvis y extremidades con pulso, movilidad y sensibilidad antes y después de tracciones o férulas.</li></ol>"
    },
    {
      "h": "Reevaluación continua",
      "b": "<ul><li>Cada 5 minutos en críticos; cada 15 minutos en estables.</li><li>Preguntar cómo se siente si está consciente.</li><li>Reevaluar estado mental y ABC.</li><li>Reevaluar abdomen y cada lesión identificada.</li><li>Comprobar tubo endotraqueal, oxígeno, vías IV, sellado de heridas torácicas, aguja de descompresión, férulas, vendajes, objetos empalados, posición de embarazadas, monitor y pulsioximetría.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Preparar material de trauma: oxígeno, aspiración, collarines, inmovilización, vías venosas, fluidoterapia, apósitos hemostáticos, monitor y analgesia.</li><li>Controlar hemorragias externas sin retrasar traslado.</li><li>Registrar hora de accidente, hora de valoración, constantes seriadas, intervenciones y respuesta.</li><li>Prevenir hipotermia: manta térmica, retirada de ropa mojada, exposición solo la necesaria.</li><li>Transferencia estructurada al hospital con mecanismo, lesiones, ABC, constantes, tratamientos y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Quedarse demasiado tiempo en escena sin intervención crítica.</li><li>No identificar mecanismo de alta energía.</li><li>Descuidar el control de hemorragias visibles.</li><li>No reevaluar tras férulas, movilización o traslado.</li><li> de forma repetida una pelvis inestable.</li><li>No documentar respuesta a fluidos o cambios neurológicos.</li></ul>"
    }
  ],
  "block": 1
},
{
  "id": "trauma-toracoabdominal-ingesa",
  "cat": "trauma",
  "especialidad": "Traumatología / Urgencias / Cirugía General",
  "title": "Traumatismo toracoabdominal",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias traumatológicas, 2013",
  "tags": "trauma toracico abdominal neumotorax hemotorax volet contusion pulmonar herida torax abdomen shock hipovolemico peritonitis",
  "summary": "Evaluación y actuación inicial ante traumatismo torácico y abdominal, con identificación de lesiones vitales como neumotórax a tensión, hemotórax, contusión pulmonar y hemorragia intraabdominal.",
  "relations": {
    "patologias": [
      "Neumotórax",
      "Hemotórax",
      "Volet costal",
      "Contusión pulmonar",
      "Traumatismo abdominal",
      "Shock hipovolémico"
    ],
    "farmacos": [
      "Oxígeno",
      "Ibuprofeno",
      "Metamizol",
      "Paracetamol-codeína",
      "Meperidina",
      "Morfina",
      "Fentanilo"
    ],
    "escalas": [
      "ABCDE",
      "AVDI"
    ],
    "tecnicas": [
      "Auscultación pulmonar",
      "Sellado de neumotórax abierto",
      "Canalización de dos vías gruesas",
      "Monitorización",
      "Control de hemorragias"
    ],
    "alertas": [
      "hipoventilación unilateral",
      "shock",
      "desviación traqueal",
      "ingurgitación yugular",
      "abdomen en tabla",
      "signos de sangrado intraabdominal"
    ]
  },
  "sec": [
    {
      "h": "Traumatismo torácico: concepto",
      "b": "<p>Incluye lesiones de pulmones, caja torácica, mediastino, grandes vasos y corazón. Puede ser abierto o cerrado. En trauma grave, el compromiso respiratorio y circulatorio debe tratarse de forma prioritaria.</p>"
    },
    {
      "h": "Valoración inicial torácica",
      "b": "<ol><li>ABCDE con prioridad a vía aérea, ventilación y circulación.</li><li>Inspección: dificultad respiratoria, movimientos paradójicos, heridas, enfisema subcutáneo, venas cervicales distendidas o colapsadas, hematoma cervical.</li><li>Palpación: dolor focal, crepitación costal, inestabilidad.</li><li>Auscultación: ruidos respiratorios simétricos o disminuidos; valorar ruidos cardiacos.</li><li>Monitorización: TA, FC, ECG, SatO₂ y vía venosa.</li></ol>"
    },
    {
      "h": "Lesiones torácicas prioritarias",
      "b": "<ul><li><b>Fracturas costales:</b> dolor con respiración y palpación, posible crepitación. Evitar vendaje compresivo. Analgesia y traslado para valoración.</li><li><b>Contusión pulmonar:</b> disnea, taquipnea, hemoptisis, febrícula, disminución del murmullo vesicular. Tratamiento inicial: oxígeno, analgesia y soporte ventilatorio si precisa.</li><li><b>Neumotórax simple:</b> desde asintomático hasta insuficiencia respiratoria; puede presentar disminución del murmullo vesicular.</li><li><b>Neumotórax a tensión:</b> diagnóstico clínico: insuficiencia respiratoria severa, hipoventilación unilateral, shock, enfisema, timpanismo, ingurgitación yugular o desviación traqueal. Requiere descompresión inmediata según protocolo.</li><li><b>Neumotórax abierto:</b> cubrir con apósito estéril fijado en tres lados y traslado urgente.</li><li><b>Fractura esternal/contusión cardiaca:</b> sospechar en mecanismos de alta energía y dolor intenso; monitorizar ECG.</li><li><b>Rotura diafragmática:</b> sospechar en heridas penetrantes o trauma de alta energía; tratamiento definitivo quirúrgico.</li></ul>"
    },
    {
      "h": "Traumatismo abdominal: concepto",
      "b": "<p>Puede ser cerrado, por desaceleración o impacto directo, o penetrante. Las lesiones más frecuentes afectan a hígado, bazo, riñones o vísceras huecas. La hemorragia intraabdominal es causa frecuente de shock hipovolémico en politrauma.</p>"
    },
    {
      "h": "Valoración abdominal",
      "b": "<ol><li>ABCDE con especial atención a circulación y control de hemorragias.</li><li>Dos vías periféricas gruesas y reposición de volumen si shock.</li><li>Inspección anterior y posterior de tórax/abdomen/periné: heridas, contusiones, laceraciones o sangrado activo.</li><li>Percusión: matidez o timpanismo.</li><li>Palpación: dolor, defensa, rigidez, contractura involuntaria o signos de irritación peritoneal.</li><li>Auscultación: presencia o ausencia de ruidos intestinales.</li></ol>"
    },
    {
      "h": "Síndromes abdominales útiles",
      "b": "<ul><li><b>Víscera maciza:</b> hipovolemia, tendencia a shock, distensión, dolor, defensa, matidez en flancos.</li><li><b>Víscera hueca:</b> dolor abdominal, abdomen en tabla, íleo paralítico y timpanismo.</li><li><b>Retroperitoneal:</b> dolor lumbar, hipovolemia, tumefacción lumbar, equimosis en flanco/escroto/raíz del muslo e íleo reflejo.</li></ul>"
    },
    {
      "h": "Tratamiento inicial",
      "b": "<ul><li>Oxígeno y soporte ventilatorio según necesidad.</li><li>Canalizar dos vías venosas gruesas.</li><li>Reposición de volumen si shock o hipoperfusión.</li><li>Sellar heridas torácicas abiertas.</li><li>Control de sangrado externo.</li><li>Analgesia cuando no comprometa la reevaluación, siguiendo protocolo local.</li><li>Traslado urgente a centro útil si inestabilidad, sospecha de sangrado interno, neumotórax a tensión, abdomen agudo o mecanismo de alta energía.</li></ul>"
    },
    {
      "h": "Farmacología orientativa del manual",
      "b": "<ul><li><b>Dolor costal:</b> ibuprofeno 600 mg + metamizol, o paracetamol-codeína según situación y contraindicaciones.</li><li><b>Dolor abdominal intenso:</b> el manual menciona meperidina, morfina o fentanilo, valorando que la analgesia no elimina la contractura abdominal verdadera.</li><li><b>Shock:</b> cristaloides iniciales y manejo como shock hipovolémico.</li></ul><p>Revisar siempre contraindicaciones, alergias, estado hemodinámico y protocolo local.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Monitorizar SatO₂, FR, TA, FC, ECG y nivel de conciencia.</li><li>Valorar trabajo respiratorio y simetría ventilatoria de forma repetida.</li><li>Preparar material para descompresión torácica si protocolo/equipo lo contempla.</li><li>Control térmico y prevención de hipotermia.</li><li>Registrar dolor, analgesia, respuesta ventilatoria y hemodinámica.</li><li>Transferir verbalmente signos de sospecha: hipoventilación unilateral, abdomen en tabla, respuesta a fluidos y mecanismo de lesión.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Esperar radiografía ante sospecha clínica de neumotórax a tensión.</li><li>Vendar de forma compresiva fracturas costales.</li><li>Infravalorar fracturas costales altas o bajas por lesiones asociadas.</li><li>Retrasar traslado ante signos de hemorragia intraabdominal.</li><li>No reevaluar el abdomen tras analgesia o durante traslado.</li></ul>"
    }
  ],
  "block": 1
},
{
  "id": "trauma-shock-hipovolemico-ingesa",
  "cat": "trauma",
  "especialidad": "Traumatología / Urgencias / Medicina Intensiva",
  "title": "Manejo prehospitalario del shock hipovolémico",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias traumatológicas, 2013",
  "tags": "shock hipovolemico hemorragico trauma cristaloides dopamina dobutamina volemia perfusion relleno capilar hemorragia",
  "summary": "Identificación y manejo inicial del shock hipovolémico/hemorrágico en el medio prehospitalario, con énfasis en perfusión, oxigenación, fluidoterapia y traslado urgente.",
  "relations": {
    "patologias": [
      "Shock hipovolémico",
      "Shock hemorrágico",
      "Hemorragia masiva",
      "Hipoperfusión"
    ],
    "farmacos": [
      "Cristaloides",
      "Dopamina",
      "Dobutamina",
      "Oxígeno"
    ],
    "escalas": [
      "Clasificación del shock hemorrágico ACS",
      "ABCDE"
    ],
    "tecnicas": [
      "Control de hemorragia",
      "Canalización de dos vías gruesas",
      "Monitorización",
      "Fluidoterapia",
      "Transferencia estructurada"
    ],
    "alertas": [
      "TAS < 90",
      "relleno capilar > 2 s",
      "alteración conciencia",
      "piel fría y sudorosa",
      "oliguria",
      "ausencia pulso radial"
    ]
  },
  "sec": [
    {
      "h": "Definición",
      "b": "<p>El shock hipovolémico se produce por pérdida de volumen intravascular eficaz. Puede ser hemorrágico, típico del traumatizado grave, o no hemorrágico por pérdidas de fluidos o tercer espacio.</p><ul><li>No equivale únicamente a hipotensión: la hipotensión puede aparecer tarde.</li><li>La clave es la hipoperfusión tisular y el desequilibrio entre aporte y demanda de oxígeno.</li><li>En politrauma debe buscarse activamente shock hemorrágico.</li></ul>"
    },
    {
      "h": "Causas frecuentes",
      "b": "<ul><li><b>Hemorrágicas:</b> fractura de pelvis/fémur, rotura de grandes vasos, lesión de víscera maciza, hemotórax, hemoperitoneo, hemorragia digestiva o complicaciones ginecológicas.</li><li><b>No hemorrágicas:</b> grandes quemados, pancreatitis, ascitis, obstrucción intestinal, vómitos o diarrea intensos, pérdidas renales, diabetes mellitus/insípida.</li></ul>"
    },
    {
      "h": "Signos clínicos de hipoperfusión",
      "b": "<ul><li>TAS < 90 mmHg o TAM < 60 mmHg, aunque puede ser tardía.</li><li>Piel fría, pálida, sudorosa o con livideces.</li><li>Relleno capilar > 2 segundos.</li><li>Pulso débil o filiforme; ausencia de pulso radial en shock avanzado.</li><li>Oliguria: diuresis < 0,5 ml/kg/h.</li><li>Alteración del nivel de conciencia: ansiedad, confusión, coma.</li><li>Taquipnea y aumento del trabajo respiratorio.</li></ul>"
    },
    {
      "h": "Clasificación orientativa del shock hemorrágico",
      "b": "<ul><li><b>Clase I:</b> pérdida < 15 %, FC hasta 100-110, TA normal, conciencia normal. Cristaloides.</li><li><b>Clase II:</b> pérdida 15-30 %, FC 110-120, ansiedad, FR 20-30. Cristaloides/coloides según protocolo.</li><li><b>Clase III:</b> pérdida 30-40 %, FC 120-140, PAS < 100, pulso radial débil, confusión, diuresis < 30 ml/h. Requiere hemoderivados y control de foco.</li><li><b>Clase IV:</b> pérdida > 40 %, FC > 140, PAS < 80, pulso radial ausente, coma/anuria. Emergencia vital.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>Seguridad, valoración primaria ABCDE y control de hemorragias externas.</li><li>Oxígeno con mascarilla para mantener SatO₂ > 90 %. Si no se consigue o hay agotamiento, valorar vía aérea avanzada.</li><li>Canalizar dos vías periféricas gruesas.</li><li>Monitorización: ECG, TA, FC, FR, SatO₂, temperatura, glucemia y diuresis si es posible.</li><li>Reposición con cristaloides en bolos pequeños, valorando respuesta clínica y evitando sobrecarga.</li><li>Protección térmica para evitar hipotermia.</li><li>Buscar foco: tórax, abdomen, pelvis, extremidades, sangrado externo.</li><li>Traslado urgente a centro útil si no responde a fluidos o precisa control quirúrgico/hemoderivados.</li></ol>"
    },
    {
      "h": "Fluidoterapia y respuesta",
      "b": "<p>El manual propone iniciar con cristaloides por beneficios iniciales y ausencia relativa de efectos secundarios. En ausencia de pulso radial se plantean bolos de 250 ml de suero fisiológico o Ringer, repetibles si no hay signos de sobrecarga.</p><ul><li>Monitorizar respuesta: TA, FC, FR, SatO₂, estado mental y diuresis si disponible.</li><li>Vigilar sobrecarga: ingurgitación yugular, crepitantes basales, empeoramiento respiratorio.</li><li>Si no hay respuesta: sospechar sangrado activo que requerirá hemoderivados y control quirúrgico/intervencionista.</li><li>Registrar claramente la respuesta a fluidos para la transferencia hospitalaria.</li></ul>"
    },
    {
      "h": "Fármacos orientativos del manual",
      "b": "<ul><li><b>Dopamina:</b> indicada si no hay respuesta al tratamiento inicial; el manual describe 200 mg en 90 ml de SG 5 %, quedando 2 mg/ml.</li><li><b>Dobutamina:</b> 250 mg en 230 ml de SG 5 %, quedando 1 mg/ml, inicio orientativo 21 ml/h y ajuste según TA, gasto cardiaco y diuresis.</li><li>El manual menciona que ambas drogas pueden asociarse con llave en Y en situaciones concretas.</li></ul><p><b>Nota:</b> en shock hemorrágico el tratamiento definitivo es control de sangrado y reposición adecuada. Vasopresores/inotrópicos deben ajustarse a protocolo médico actual.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Control rápido de hemorragia externa: compresión directa, vendaje compresivo, hemostáticos o torniquete si protocolo.</li><li>Canalizar vías gruesas sin retrasar traslado.</li><li>Registrar constantes seriadas y respuesta a fluidos.</li><li>Preparar calentamiento activo/pasivo y evitar exposición prolongada.</li><li>Control de glucemia y temperatura.</li><li>Transferir al hospital con mecanismo, sospecha de foco, volumen administrado, respuesta y cambios clínicos.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Esperar a hipotensión franca para reconocer shock.</li><li>No controlar hemorragias externas antes de fluidoterapia.</li><li>Administrar grandes volúmenes sin valorar respuesta o sobrecarga.</li><li>Retrasar traslado si no hay respuesta a fluidos.</li><li>No registrar respuesta hemodinámica a bolos.</li><li>Olvidar prevención de hipotermia, que empeora coagulopatía y pronóstico.</li></ul>"
    }
  ],
  "block": 1
},
{
  "id": "fisicos-quemaduras-ingesa",
  "cat": "extra",
  "especialidad": "Urgencias extrahospitalarias / Trauma / Quemados",
  "title": "Quemaduras",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias por agentes físicos, 2013",
  "tags": "quemaduras quemado regla de los nueve Wallace Parkland inhalación humo gran quemado químicas eléctricas cloruro mórfico SCQ",
  "summary": "Valoración del paciente quemado por profundidad, extensión, gravedad, sospecha de inhalación y tratamiento inicial extrahospitalario.",
  "relations": {
    "patologias": [
      "Quemadura térmica",
      "Quemadura química",
      "Quemadura eléctrica",
      "Lesión inhalatoria",
      "Gran quemado",
      "Síndrome compartimental"
    ],
    "farmacos": [
      "Oxígeno",
      "Ringer lactato",
      "Cloruro mórfico",
      "Ranitidina",
      "Povidona yodada",
      "Profilaxis antitetánica"
    ],
    "escalas": [
      "Regla de los 9 de Wallace",
      "Palma de la mano = 1 % SCQ",
      "Glasgow"
    ],
    "tecnicas": [
      "Oxigenoterapia 100 %",
      "Canalización venosa",
      "Sondaje vesical",
      "Cura local de quemadura",
      "Irrigación de quemadura química"
    ],
    "alertas": [
      "sospecha de inhalación",
      "quemadura circular",
      "cara/manos/pies/genitales",
      ">20 % SCQ adulto",
      ">10 % SCQ niño",
      "quemadura eléctrica de alto voltaje"
    ]
  },
  "sec": [
    {
      "h": "Definición y factores pronósticos",
      "b": "<p>La quemadura es la destrucción de tejidos por un agente térmico, eléctrico, químico o radioactivo. La gravedad no depende solo de la piel quemada: hay que valorar edad, extensión, profundidad, localización, mecanismo, lesiones asociadas y patología previa.</p><ul><li>Las causas más frecuentes son llamas y líquidos calientes.</li><li>La primera prioridad no es la cura local: es el ABC y la detección de lesión inhalatoria.</li><li>En quemaduras extensas, evitar que el enfriamiento produzca hipotermia.</li></ul>"
    },
    {
      "h": "Clasificación por profundidad",
      "b": "<ul><li><b>Primer grado / epidérmica:</b> eritema y dolor, sin ampollas. No se contabiliza para la extensión en quemaduras mixtas.</li><li><b>Segundo grado superficial:</b> dolor, ampollas, conserva folículos pilosos y glándulas.</li><li><b>Segundo grado profundo:</b> fondo rojo intenso o blanquecino, menos dolorosa o indolora, sin folículos pilosos.</li><li><b>Tercer grado / subdérmica:</b> indolora por destrucción nerviosa; aspecto carbonáceo o blanco nacarado.</li></ul>"
    },
    {
      "h": "Extensión: regla de Wallace y palma",
      "b": "<ul><li>Usar la <b>regla de los 9 de Wallace</b> para estimación rápida de superficie corporal quemada.</li><li>En quemaduras pequeñas o dispersas, la palma de la mano del paciente equivale aproximadamente al <b>1 % de la superficie corporal</b>.</li><li>No incluir quemaduras de primer grado en el cálculo de extensión cuando haya grados mixtos.</li><li>En niños, la proporción corporal varía; la estimación debe ajustarse por edad.</li></ul>"
    },
    {
      "h": "Clasificación práctica de gravedad",
      "b": "<ul><li><b>Leve:</b> &lt;10 % SCQ en adultos, &lt;5 % en niños o &lt;2 % de tercer grado. Puede ser control ambulatorio si no hay otros criterios.</li><li><b>Moderada:</b> 10-20 % SCQ adulto, 5-10 % niño, 2-5 % tercer grado, sospecha de inhalación, quemaduras circulares o eléctricas. Requiere ingreso/valoración hospitalaria.</li><li><b>Grave:</b> &gt;20 % adulto, &gt;10 % niño, &gt;5 % tercer grado, quemadura eléctrica de alto voltaje, inhalación evidente, afectación importante de cara, ojos, manos, pies, genitales o zonas flexoras, traumatismo asociado o patología relevante.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>Seguridad:</b> neutralizar el agente productor protegiendo al equipo. Retirar de la fuente térmica/química/eléctrica.</li><li><b>A:</b> valorar vía aérea. Sospechar inhalación si disnea, ronquera, tos, estridor, sibilancias, cianosis, esputos carbonáceos, hemoptisis, pérdida de vello nasal/cejas o quemadura facial.</li><li><b>B:</b> auscultación bilateral, frecuencia respiratoria, SatO₂ y oxígeno al 100 % si sospecha de inhalación.</li><li><b>C:</b> pulso, TA, relleno capilar, color y temperatura de piel. Canalizar vía venosa si moderada/grave.</li><li><b>D:</b> Glasgow y pupilas.</li><li><b>E:</b> exposición completa, retirar ropa no adherida y joyas; evitar hipotermia.</li></ol>"
    },
    {
      "h": "Evaluación secundaria",
      "b": "<ul><li>Confirmar extensión y profundidad de las lesiones de cabeza a pies.</li><li>Buscar traumatismos asociados: deformidades torácicas, crepitación cervical/torácica, heridas en pared torácica, fracturas, etc.</li><li>Determinar la <b>hora cero</b> de la quemadura.</li><li>Irrigar con suero fisiológico frío o agua al menos 5 minutos; más tiempo en químicas. Si SCQ &gt;10 %, cuidado con la irrigación continua por riesgo de hipotermia.</li><li>Cubrir con sábanas limpias o apósitos adecuados; no es imprescindible que sean estériles en el primer traslado.</li></ul>"
    },
    {
      "h": "Fluidoterapia",
      "b": "<ul><li>Si quemadura &lt;15 %, paciente consciente y sin patología asociada: valorar reposición oral si procede.</li><li>En el resto: reposición intravenosa. El manual propone iniciar <b>Ringer lactato 500 ml IV en 30 minutos</b> mientras se calcula pauta definitiva.</li><li><b>Fórmula de Parkland:</b> 4 ml × % SCQ × kg en las primeras 24 horas; la mitad durante las primeras 8 horas desde la quemadura.</li><li>Colocar sonda vesical precoz en gran quemado para controlar diuresis.</li></ul>"
    },
    {
      "h": "Tratamiento del gran quemado",
      "b": "<ol><li>Asegurar vía aérea; valorar intubación si inhalación o edema progresivo.</li><li>Oxígeno al 100 %; en inhalación de humos, reservorio.</li><li>Monitorización: ECG, TA, SatO₂, frecuencia respiratoria y frecuencia cardiaca.</li><li>Evitar hipotermia: sábanas limpias, manta térmica, ambiente cálido.</li><li>Sonda urinaria precoz; sonda nasogástrica si vómitos o quemadura &gt;20 % SCQ.</li><li>Analgesia IV, con opiáceos si dolor intenso y situación clínica lo permite.</li><li>Profilaxis antitetánica según estado vacunal.</li><li>Protección gástrica si protocolo local.</li><li>Traslado a centro útil o unidad de quemados si criterios de gravedad.</li></ol>"
    },
    {
      "h": "Farmacología orientativa del manual",
      "b": "<ul><li><b>Cloruro mórfico:</b> el manual propone 3-4 mg IV en medio minuto; diluir ampolla de 10 mg/ml en 9 ml de SF 0,9 % y administrar 3 ml IV cada 20 min hasta alivio. En traslado prolongado: perfusión continua 5 ampollas en 50 ml de SF a 2-10 ml/h.</li><li><b>Ranitidina IV:</b> mencionada como protector gástrico.</li><li><b>Antitetánica:</b> según vacunación y tipo de lesión.</li></ul><p><b>Nota:</b> revisar fármacos y dosis con protocolo local actual antes de uso clínico.</p>"
    },
    {
      "h": "Cuidado local",
      "b": "<ul><li>Retirar ropa quemada de forma no traumática; no arrancar ropa adherida.</li><li>Cubrir con compresas empapadas en suero fisiológico templado, sin interferir la valoración hospitalaria posterior.</li><li>No aplicar pomadas, cremas ni antisépticos colorantes.</li><li>No romper ampollas que no estén infectadas.</li><li>Elevar extremidades afectadas para reducir edema y vigilar compromiso vascular.</li></ul>"
    },
    {
      "h": "Quemaduras químicas",
      "b": "<ul><li>Retirar ropa contaminada con protección del equipo.</li><li>Irrigar de forma abundante y prolongada. En álcalis el lavado debe ser especialmente largo por penetración profunda.</li><li>No neutralizar de rutina con otro producto químico: puede generar calor y agravar la lesión.</li><li>Identificar producto si es posible y llevar envase/ficha al hospital.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Centrarse en la piel y olvidar vía aérea.</li><li>Enfriar una quemadura extensa hasta provocar hipotermia.</li><li>Aplicar pomadas o antisépticos colorantes antes de valoración hospitalaria.</li><li>No retirar anillos, pulseras o ropa no adherida.</li><li>No valorar lesiones asociadas por centrarse en la quemadura visible.</li></ul>"
    }
  ],
  "block": 2
},
{
  "id": "fisicos-hipotermia-ingesa",
  "cat": "extra",
  "especialidad": "Urgencias extrahospitalarias / Medicina intensiva",
  "title": "Hipotermia y congelaciones",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias por agentes físicos, 2013",
  "tags": "hipotermia congelación recalentamiento pasivo activo interno temperatura central FV bradicardia RCP frío",
  "summary": "Reconocimiento y manejo extrahospitalario de la hipotermia, con recalentamiento progresivo, monitorización y manejo especial de la parada cardiaca hipotérmica.",
  "relations": {
    "patologias": [
      "Hipotermia accidental",
      "Congelación",
      "Parada cardiaca por hipotermia",
      "Arritmias por frío"
    ],
    "farmacos": [
      "Cristaloides calientes sin lactato",
      "Oxígeno caliente",
      "Fármacos SVA con ajuste por temperatura"
    ],
    "escalas": [
      "Temperatura central",
      "Glasgow",
      "ABCDE"
    ],
    "tecnicas": [
      "Recalentamiento externo pasivo",
      "Recalentamiento externo activo",
      "Recalentamiento interno activo",
      "RCP en hipotermia"
    ],
    "alertas": [
      "Tª central <35 °C",
      "Tª <30 °C",
      "FV/TV",
      "bradicardia fisiológica",
      "ropa húmeda",
      "congelación acral"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La hipotermia es el descenso de la temperatura corporal central por debajo de 35 ºC. El organismo pierde capacidad para mantener funciones fisiológicas normales. Debe medirse con temperatura rectal, esofágica o timpánica cuando esté disponible.</p><ul><li>Predisponen: ancianos, neonatos, alteración de conciencia, enfermedades crónicas, fatiga, desnutrición, humedad, viento y falta de oxígeno ambiental.</li><li>El escalofrío es el mecanismo principal de producción de calor y puede cesar por debajo de 30 ºC.</li></ul>"
    },
    {
      "h": "Clasificación práctica",
      "b": "<ul><li><b>Leve:</b> 32-35 ºC. Escalofríos, piel fría, taquicardia inicial, confusión leve.</li><li><b>Moderada:</b> 28-32 ºC. Disminuye o desaparece el escalofrío, bradicardia, hipotensión, deterioro neurológico y arritmias.</li><li><b>Grave:</b> &lt;28 ºC. Coma, apnea, arritmias ventriculares, FV/TV y alto riesgo de parada.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A/B:</b> asegurar vía aérea, ventilación y oxigenación. Administrar oxígeno; si es posible, calentado/humidificado.</li><li><b>C:</b> monitorización ECG, TA, FC y perfusión. Manipular con suavidad: el corazón hipotérmico es irritable.</li><li><b>D:</b> conciencia, pupilas, glucemia y descartar causas asociadas: alcohol, drogas, trauma, ictus, sepsis, endocrino.</li><li><b>E:</b> retirar ropa mojada, secar, aislar del suelo/frío y cubrir.</li></ol>"
    },
    {
      "h": "Tratamiento general",
      "b": "<ul><li>Retirar del estrés térmico y aislar del frío.</li><li>Iniciar RCP si procede.</li><li>Monitorizar al paciente.</li><li>Corregir volemia: dos vías periféricas gruesas si es posible, usando cristaloides calientes sin lactato según el manual.</li><li>Asegurar ventilación y oxigenación.</li><li>Corregir alteraciones metabólicas, electrolíticas y endocrinas: vigilar hipoglucemia y acidosis metabólica.</li></ul>"
    },
    {
      "h": "Tipos de recalentamiento",
      "b": "<ul><li><b>Externo pasivo:</b> retirar ropa húmeda, secar y aislar con mantas o material reflectante. Depende de la producción de calor del paciente.</li><li><b>Externo activo:</b> aplicación de calor externo con mantas eléctricas, objetos calientes o inmersión en agua alrededor de 40 ºC si es seguro.</li><li><b>Interno activo:</b> técnicas más avanzadas: oxigenoterapia caliente, sueroterapia caliente, diálisis peritoneal u otras técnicas hospitalarias.</li></ul>"
    },
    {
      "h": "Parada cardiaca por hipotermia",
      "b": "<ul><li>El SVA se centra en el recalentamiento como tratamiento principal.</li><li>El corazón hipotérmico puede responder mal a fármacos, marcapasos y desfibrilación.</li><li>Si Tª central &lt;30 ºC, el manual advierte que puede interrumpirse la administración IV repetida de fármacos cardioactivos por riesgo de acumulación.</li><li>Si Tª &gt;30 ºC, pueden administrarse fármacos IV aumentando intervalos entre dosis.</li><li>La bradicardia puede ser fisiológica en hipotermia grave; en general no está indicado marcapasos solo por bradicardia.</li></ul>"
    },
    {
      "h": "Congelaciones",
      "b": "<p>Las congelaciones afectan sobre todo zonas acras: dedos de manos y pies, nariz, orejas y labios. Evolucionan desde eritema hasta flictenas, cianosis y anestesia de la zona.</p><ul><li>Evitar progresión retirando del frío y humedad.</li><li>No frotar la zona congelada.</li><li>No recalentar si existe riesgo de recongelación durante el traslado.</li><li>Retirar elementos compresivos y elevar si edema.</li><li>Cubrir con gasas secas y separar dedos si procede.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Manipulación suave, movimientos lentos y coordinación del equipo.</li><li>Monitorización continua si moderada/grave.</li><li>Control de glucemia, temperatura central y constantes seriadas.</li><li>Retirar ropa húmeda, secar y aislar sin exposición innecesaria.</li><li>Preparar sueros calientes si disponibles.</li><li>Registrar temperatura inicial, método de medición, medidas de recalentamiento y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Dar por fallecido precozmente a un hipotérmico profundo sin recalentamiento adecuado.</li><li>Manipular bruscamente al paciente.</li><li>Administrar bolos repetidos de fármacos en hipotermia grave sin considerar temperatura.</li><li>Recalentar una extremidad congelada si puede volver a congelarse.</li><li>Masajear o frotar zonas congeladas.</li></ul>"
    }
  ],
  "block": 2
},
{
  "id": "fisicos-electricidad-ingesa",
  "cat": "extra",
  "especialidad": "Urgencias extrahospitalarias / Trauma / Quemados",
  "title": "Lesiones por electricidad",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias por agentes físicos, 2013",
  "tags": "electricidad electrocución corriente alterna alto voltaje rayo quemadura eléctrica arritmia FV rabdomiolisis mioglobinuria síndrome compartimental",
  "summary": "Manejo de lesiones eléctricas, priorizando seguridad de escena, ABCDE, monitorización cardiaca, búsqueda de daño profundo y prevención de fracaso renal.",
  "relations": {
    "patologias": [
      "Electrocución",
      "Quemadura eléctrica",
      "Fibrilación ventricular",
      "Rabdomiólisis",
      "Síndrome compartimental",
      "Fracaso renal agudo"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Analgesia opiácea/no opiácea",
      "Protectores gástricos"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "ECG"
    ],
    "tecnicas": [
      "Desconexión segura de corriente",
      "Monitorización ECG",
      "Fluidoterapia",
      "Control de diuresis",
      "Exploración neurovascular"
    ],
    "alertas": [
      "alto voltaje",
      "corriente alterna",
      "trayecto brazo-brazo",
      "PCR",
      "arritmia",
      "quemadura profunda oculta",
      "diuresis baja",
      "dolor desproporcionado"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La electricidad puede causar desde molestias leves hasta muerte súbita por electrocución. Las lesiones resultan del efecto directo de la corriente y de la conversión de energía eléctrica en calor al atravesar tejidos.</p><ul><li>El aspecto externo puede ser engañoso: puede haber lesión profunda grave con piel aparentemente poco afectada.</li><li>La corriente alterna es especialmente peligrosa por mayor riesgo de fibrilación ventricular.</li><li>Los trayectos horizontales brazo-brazo son más peligrosos que algunos trayectos verticales por paso torácico.</li></ul>"
    },
    {
      "h": "Factores que determinan gravedad",
      "b": "<ul><li>Intensidad y voltaje: más daño cuanto mayor voltaje y menor resistencia.</li><li>Tipo de corriente: alterna o continua.</li><li>Resistencia tisular: hueso y grasa ofrecen más resistencia; sangre y tejido nervioso menos.</li><li>Trayectoria: si atraviesa corazón, cerebro o tórax, mayor riesgo vital.</li><li>Área y tiempo de contacto.</li><li>Humedad de la piel: reduce resistencia y aumenta daño.</li></ul>"
    },
    {
      "h": "Seguridad de escena",
      "b": "<ol><li>No tocar al paciente hasta confirmar que la corriente está desconectada.</li><li>Solicitar bomberos/policía/electricistas si alta tensión o entorno inseguro.</li><li>Usar equipos de protección y mantener distancia en alta tensión.</li><li>Una vez segura la escena, iniciar ABCDE.</li></ol>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ol><li><b>A/B:</b> valorar vía aérea, ventilación y oxígeno. Considerar lesión por inhalación si incendio asociado.</li><li><b>C:</b> pulso, TA, perfusión, control de hemorragias y monitorización ECG.</li><li><b>D:</b> Glasgow, convulsiones, focalidad, dolor, parestesias.</li><li><b>E:</b> búsqueda de puntos de entrada/salida, quemaduras, fracturas, luxaciones y lesiones por caída.</li></ol>"
    },
    {
      "h": "Manifestaciones importantes",
      "b": "<ul><li><b>Cardiacas:</b> FV/TV, asistolia, alteraciones de conducción o isquemia.</li><li><b>Musculares:</b> necrosis profunda, rabdomiólisis, dolor intenso y síndrome compartimental.</li><li><b>Renales:</b> riesgo de fracaso renal por mioglobinuria.</li><li><b>Neurológicas:</b> alteración de conciencia, convulsiones, neuropatías.</li><li><b>Traumáticas:</b> fracturas/luxaciones por contracción muscular o caída.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>ABCDE y RCP si precisa.</li><li>Oxigenoterapia y monitorización ECG continua.</li><li>Canalizar vía venosa y valorar fluidoterapia.</li><li>Exploración completa: piel, pulsos, perfusión distal, dolor, sensibilidad, movilidad, fracturas y luxaciones.</li><li>Control de diuresis; el manual plantea mantener diuresis mínima de 35-50 ml/h.</li><li>Analgesia según dolor y gravedad.</li><li>Valorar traslado a UCI/centro útil si PCR, arritmia grave, grandes quemaduras, lesión neurológica importante o afectación renal grave.</li></ol>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Monitorizar ECG incluso si la lesión cutánea parece pequeña.</li><li>Registrar entrada/salida de corriente si se identifican.</li><li>Valorar pulsos y relleno capilar de extremidades seriado.</li><li>Vigilar dolor progresivo, tensión de compartimentos y déficit sensitivo/motor.</li><li>Control estricto de diuresis si el contexto permite sonda vesical.</li><li>Preparar traslado con informe de voltaje aproximado, tipo de corriente, tiempo de contacto y pérdida de conciencia/PCR si existió.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Tocar al paciente sin comprobar seguridad eléctrica.</li><li>Infravalorar lesión por piel aparentemente normal.</li><li>No hacer ECG/monitorización en electricidad.</li><li>Olvidar lesiones asociadas por caída o tetania muscular.</li><li>No vigilar diuresis ni rabdomiólisis en alto voltaje.</li></ul>"
    }
  ],
  "block": 2
},
{
  "id": "fisicos-arma-fuego-ingesa",
  "cat": "extra",
  "especialidad": "Urgencias extrahospitalarias / Trauma",
  "title": "Heridas por arma de fuego",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias por agentes físicos, 2013",
  "tags": "arma de fuego balística herida entrada salida proyectil hemorragia fractura contaminada ABC trauma shock",
  "summary": "Atención inicial de heridas por arma de fuego: seguridad, ABC del trauma, control de hemorragia, identificación de orificios, inmovilización y traslado precoz.",
  "relations": {
    "patologias": [
      "Herida penetrante",
      "Hemorragia traumática",
      "Fractura abierta",
      "Shock hemorrágico",
      "Lesión vascular"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Analgesia",
      "Profilaxis antitetánica",
      "Antibioterapia según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "AVDI",
      "Glasgow"
    ],
    "tecnicas": [
      "Control de hemorragias",
      "Vendaje compresivo",
      "Canalización de dos vías gruesas",
      "Inmovilización de extremidad",
      "Transferencia estructurada"
    ],
    "alertas": [
      "hemorragia activa",
      "orificio torácico/abdominal",
      "fractura",
      "shock",
      "sangrado arterial",
      "no extraer cuerpos extraños"
    ]
  },
  "sec": [
    {
      "h": "Conceptos útiles",
      "b": "<p>El arma de fuego proyecta un agente lesivo mediante combustión de pólvora. La balística terminal describe el efecto del proyectil al impactar en el cuerpo.</p><ul><li>La herida puede tener orificio de entrada, trayecto y orificio de salida.</li><li>El orificio de entrada puede ser único o múltiple, redondeado u oval y con tatuaje/contusión periférica.</li><li>El orificio de salida puede no existir, ser irregular, tener bordes evertidos y no presentar tatuaje.</li><li>La trayectoria puede desviarse por hueso o fragmentarse, generando trayectos múltiples.</li></ul>"
    },
    {
      "h": "Seguridad y escena",
      "b": "<ol><li>Confirmar seguridad del equipo: agresor, arma, entorno, policía si procede.</li><li>Usar equipos de protección individual.</li><li>No manipular indicios si no es necesario para asistencia.</li><li>Priorizar atención a amenazas vitales y traslado.</li></ol>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ol><li><b>A:</b> vía aérea con control cervical si mecanismo/caída asociado.</li><li><b>B:</b> tórax: ventilación, heridas soplantes, hipoventilación, neumotórax.</li><li><b>C:</b> control de hemorragia, pulso, TA, piel, relleno capilar; canalizar dos vías gruesas si inestable.</li><li><b>D:</b> conciencia y focalidad neurológica.</li><li><b>E:</b> exposición completa buscando orificios de entrada y salida, sin perder control térmico.</li></ol>"
    },
    {
      "h": "Actuación sobre la herida",
      "b": "<ul><li>Observar tipo, tamaño y localización de la herida.</li><li>Buscar orificios de entrada y salida.</li><li>Cubrir con gasas estériles.</li><li>Lavar con solución fisiológica si procede; el manual indica no usar agua.</li><li>Si hay hemorragia: compresión directa y vendaje compresivo. Valorar torniquete si sangrado masivo de extremidad y protocolo.</li><li>No intentar extraer cuerpos extraños visibles.</li><li>Identificar tipo de sangrado: arterial, venoso o capilar.</li></ul>"
    },
    {
      "h": "Fracturas y extremidades",
      "b": "<ul><li>Las fracturas por arma de fuego se consideran contaminadas; si superan 6 horas se consideran infectadas según el manual.</li><li>Movilizar la extremidad lo menos posible.</li><li>Inmovilizar desde proximal y distal a la lesión con tracción suave en eje si está indicado.</li><li>Comprobar pulsos, sensibilidad, movilidad y relleno capilar antes y después de inmovilizar.</li></ul>"
    },
    {
      "h": "Reposición y traslado",
      "b": "<ul><li>Tomar constantes seriadas.</li><li>Reposición de líquidos IV con dos vías de gran calibre 14G o 16G si inestabilidad o riesgo de shock.</li><li>Estabilizar siguiendo ABC del trauma.</li><li>Trasladar al centro asistencial más adecuado y avisar al centro coordinador con información clara y resumida.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Registrar hora, mecanismo, localización de heridas, constantes y tratamiento.</li><li>Controlar hemorragia de forma continua durante traslado.</li><li>Vigilar signos de shock y reevaluar ABC.</li><li>Mantener normotermia.</li><li>No limpiar en exceso ni retirar elementos si compromete evidencia o seguridad del paciente.</li><li>Transferencia hospitalaria: mecanismo, número de heridas, entrada/salida, sangrado, líquidos, respuesta, analgesia y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Entrar en escena no segura.</li><li>Buscar orificios antes de controlar ABC y hemorragia.</li><li>Retirar proyectiles/cuerpos extraños.</li><li>No exponer completamente al paciente y perder un orificio de salida.</li><li>Olvidar hipotermia en paciente sangrante.</li></ul>"
    }
  ],
  "block": 2
},
{
  "id": "fisicos-mordeduras-picaduras-ingesa",
  "cat": "extra",
  "especialidad": "Urgencias extrahospitalarias / Infecciosas / Dermatología",
  "title": "Mordeduras y picaduras",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias por agentes físicos, 2013",
  "tags": "mordeduras perro gato humano rabia tétanos infección picaduras pez araña escorpión himenópteros metilprednisolona antihistamínico antibiótico",
  "summary": "Valoración y tratamiento inicial de mordeduras de animales/humanos y picaduras, con énfasis en limpieza, profundidad, infección, tétanos/rabia y analgesia.",
  "relations": {
    "patologias": [
      "Mordedura de perro",
      "Mordedura de gato",
      "Mordedura humana",
      "Picadura de pez araña",
      "Picadura de escorpión",
      "Anafilaxia",
      "Infección de partes blandas"
    ],
    "farmacos": [
      "Suero salino",
      "Povidona yodada",
      "Metamizol",
      "Ketorolaco",
      "Tramadol",
      "Metilprednisolona",
      "Clorfeniramina",
      "Gluconato cálcico",
      "Antibiótico según protocolo",
      "Profilaxis antitetánica"
    ],
    "escalas": [
      "ABCDE",
      "Valoración dolor"
    ],
    "tecnicas": [
      "Irrigación a presión",
      "Desinfección de herida",
      "Elevación de extremidad",
      "Inmovilización si afectación profunda"
    ],
    "alertas": [
      "cara/manos/genitales",
      "articulación/tendón/hueso",
      "signos de infección",
      "riesgo de rabia",
      "anafilaxia",
      "edema con compromiso vascular"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>Las mordeduras son una causa frecuente de consulta urgente. Las más habituales son de perro, gato y humano. La complicación más frecuente es la infección por flora de la boca del animal o persona.</p><ul><li>Las mordeduras de otros animales requieren atención similar, pero debe valorarse posibilidad de rabia.</li><li>Las heridas por punción pueden parecer pequeñas y afectar estructuras profundas.</li><li>Las mordeduras humanas tienen alto riesgo infeccioso.</li></ul>"
    },
    {
      "h": "Historia clínica dirigida",
      "b": "<ul><li>Tipo de animal/persona.</li><li>Estado de vacunación del animal si se conoce.</li><li>Tiempo transcurrido desde la mordedura.</li><li>Situación basal de la víctima: inmunosupresión, diabetes, embarazo, anticoagulación, alergias.</li><li>Estado vacunal antitetánico.</li><li>Localización y circunstancias: provocada/no provocada, animal conocido o salvaje.</li></ul>"
    },
    {
      "h": "Exploración",
      "b": "<ol><li>Exploración física general y signos vitales.</li><li>Tipo de herida: punción, laceración, aplastamiento o arañazo.</li><li>Profundidad y extensión.</li><li>Afectación de articulaciones, huesos, tendones, nervios o vasos.</li><li>Signos de infección local o sistémica: eritema, calor, edema, dolor creciente, pus, linfangitis, fiebre.</li><li>En extremidades: perfusión distal, movilidad y sensibilidad.</li></ol>"
    },
    {
      "h": "Tratamiento inicial de mordeduras",
      "b": "<ul><li>Limpieza e irrigación con suero salino a presión.</li><li>Desinfección de la herida.</li><li>Retirar cuerpos extraños visibles si es seguro, pero sin exploraciones agresivas fuera de entorno adecuado.</li><li>Valorar cierre: muchas mordeduras contaminadas no se cierran de forma primaria salvo criterios concretos.</li><li>Antibioterapia profiláctica/terapéutica según localización, profundidad, tipo de animal, retraso e inmunosupresión.</li><li>Profilaxis antitetánica según calendario.</li><li>Valorar profilaxis antirrábica si animal de riesgo o situación epidemiológica compatible.</li></ul>"
    },
    {
      "h": "Picaduras y mordeduras marinas",
      "b": "<ul><li>Las picaduras por peces marinos como rascacio o pez araña son muy dolorosas.</li><li>Medidas locales del protocolo de pez araña: lavado y desinfección; sumergir el miembro en agua muy caliente porque el veneno es termolábil.</li><li>Medidas generales descritas: analgesia con metamizol, ketorolaco o tramadol; corticoides con metilprednisolona 40-80 mg IM/IV; antihistamínico como clorfeniramina cada 6 h VO.</li><li>Protección antibiótica y antitetánica: el manual la indica siempre en el protocolo de pez araña.</li><li>Gluconato cálcico al 20 % 1 ampolla IV diluida si precisa.</li></ul>"
    },
    {
      "h": "Dolor y reacciones sistémicas",
      "b": "<ul><li>La analgesia depende de intensidad del dolor y puede ser oral o parenteral.</li><li>En escorpión, el manual advierte no usar narcóticos.</li><li>Si urticaria, angioedema, broncoespasmo, hipotensión o síncope: manejar como reacción alérgica grave/anafilaxia según protocolo.</li><li>En niños con hipotensión o colapso tras picaduras, pueden requerirse medidas de reanimación, glucocorticoides y gluconato cálcico según el manual.</li></ul>"
    },
    {
      "h": "Criterios de derivación",
      "b": "<ul><li>Mordedura en cara, cuello, manos, pies, genitales o articulaciones.</li><li>Heridas profundas, por aplastamiento, con pérdida de tejido o sospecha de lesión tendinosa/vascular/nerviosa.</li><li>Signos de infección, fiebre, linfangitis o paciente inmunodeprimido.</li><li>Sospecha de rabia o animal no localizable.</li><li>Dolor intenso, edema progresivo o compromiso vascular.</li><li>Reacción alérgica sistémica.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Irrigar de forma generosa y registrar tipo de solución, hora y aspecto.</li><li>Medir y fotografiar si protocolo/local permite, especialmente para seguimiento.</li><li>Control de dolor antes/después de analgesia.</li><li>Verificar vacunación antitetánica y registrar pauta indicada.</li><li>Educar sobre signos de alarma: fiebre, enrojecimiento progresivo, supuración, dolor creciente, pérdida de movilidad/sensibilidad.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Infravalorar punciones pequeñas de gato o humanas.</li><li>No preguntar por estado vacunal y animal causante.</li><li>Cerrar de forma primaria una herida contaminada sin valoración adecuada.</li><li>No explorar tendones, nervios y vasos en manos.</li><li>Olvidar riesgo de anafilaxia en picaduras.</li></ul>"
    }
  ],
  "block": 2
},
{
  "id": "fisicos-ahogamiento-buceo-ingesa",
  "cat": "extra",
  "especialidad": "Urgencias extrahospitalarias / Respiratorio / Medicina hiperbárica",
  "title": "Ahogamiento y lesiones en el buceo",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias por agentes físicos, 2013",
  "tags": "ahogamiento semi-ahogamiento inmersión hipoxia distrés respiratorio buceo barotrauma embolia gaseosa enfermedad descompresiva cámara hiperbárica",
  "summary": "Atención inmediata del paciente tras inmersión o accidente de buceo: rescate seguro, oxigenación precoz, RCP, vigilancia respiratoria y traslado urgente.",
  "relations": {
    "patologias": [
      "Ahogamiento",
      "Casi ahogamiento",
      "Ahogamiento secundario",
      "Hipoxia",
      "SDRA",
      "Barotrauma",
      "Enfermedad descompresiva",
      "Embolia gaseosa arterial"
    ],
    "farmacos": [
      "Oxígeno al 100 %",
      "Cristaloides si shock",
      "Broncodilatadores si broncoespasmo según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "SatO₂"
    ],
    "tecnicas": [
      "Rescate seguro",
      "Ventilaciones de rescate",
      "RCP",
      "Oxigenoterapia",
      "Inmovilización cervical si trauma",
      "Traslado a cámara hiperbárica si buceo"
    ],
    "alertas": [
      "inmersión >3-10 min",
      "PCR",
      "hipotermia",
      "alteración neurológica",
      "tos/disnea persistente",
      "hemoptisis",
      "dolor torácico",
      "síntomas tras buceo"
    ]
  },
  "sec": [
    {
      "h": "Conceptos",
      "b": "<p>La actuación inmediata en el ahogamiento es clave para supervivencia y prevención de complicaciones. El manual señala que los daños irreversibles por inmersión pueden desarrollarse entre 3 y 10 minutos.</p><ul><li><b>Ahogamiento:</b> muerte o consecuencias por falta de aire tras sumersión en líquido.</li><li><b>Casi/semi-ahogamiento:</b> el paciente sobrevive tras accidente por inmersión, con o sin reanimación.</li><li><b>Ahogamiento secundario:</b> aparición posterior de distrés respiratorio, desde minutos hasta 72 h tras la inmersión.</li></ul>"
    },
    {
      "h": "Clasificación fisiopatológica del ahogamiento",
      "b": "<ul><li><b>Muerte súbita:</b> parada tras inmersión en agua fría, probable reflejo vasovagal.</li><li><b>Sin aspiración de líquido:</b> laringoespasmo y cierre de glotis.</li><li><b>Con aspiración:</b> entrada de líquido en vía aérea. La hipoxia prolongada causa PCR y acidosis metabólica.</li><li>Agua dulce: hipervolemia, hemodilución, hemólisis e hiperpotasemia. Agua salada: hipovolemia y hemoconcentración.</li></ul>"
    },
    {
      "h": "Rescate seguro",
      "b": "<ol><li>No poner en riesgo al rescatador.</li><li>Extraer del agua con control cervical si existe sospecha de traumatismo: zambullida, caída, accidente náutico, pérdida de conciencia o dolor cervical.</li><li>Retirar ropa mojada, secar y prevenir hipotermia.</li><li>Iniciar valoración ABCDE inmediatamente.</li></ol>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ol><li><b>A:</b> permeabilizar vía aérea; retirar cuerpos extraños visibles y aspirar secreciones/vómitos si disponible.</li><li><b>B:</b> prioridad absoluta: ventilación y oxigenación. Oxígeno al 100 %. Valorar ventilación con bolsa-mascarilla o vía aérea avanzada si fracaso ventilatorio.</li><li><b>C:</b> pulso central, TA, perfusión y RCP si parada.</li><li><b>D:</b> Glasgow, pupilas, convulsiones, focalidad.</li><li><b>E:</b> temperatura, lesiones asociadas, hipotermia y exposición controlada.</li></ol>"
    },
    {
      "h": "Actuación en PCR por ahogamiento",
      "b": "<ul><li>La causa principal es hipoxia: priorizar ventilaciones eficaces y oxígeno.</li><li>Iniciar RCP siguiendo protocolo vigente.</li><li>Si hipotermia asociada, aplicar manejo específico de hipotermia.</li><li>Tras recuperación, traslado hospitalario urgente aunque parezca estable.</li></ul>"
    },
    {
      "h": "Vigilancia tras casi-ahogamiento",
      "b": "<ul><li>Todo paciente con síntomas respiratorios debe trasladarse para valoración.</li><li>Vigilar tos, disnea, SatO₂ baja, crepitantes, broncoespasmo, hemoptisis, fiebre, alteración neurológica o empeoramiento progresivo.</li><li>El ahogamiento secundario puede aparecer de forma diferida, hasta 72 horas.</li><li>Monitorizar SatO₂ y constantes seriadas durante el traslado.</li></ul>"
    },
    {
      "h": "Lesiones en buceo",
      "b": "<ul><li>Preguntar por profundidad, tiempo de inmersión, ascenso rápido, número de inmersiones, mezcla respiratoria, síntomas durante o después del ascenso.</li><li>Sospechar barotrauma si dolor torácico, disnea, hemoptisis, neumotórax, dolor de oído/senos o alteración neurológica.</li><li>Sospechar enfermedad descompresiva/embolia gaseosa si dolor articular, parestesias, debilidad, vértigo, alteración visual, confusión, convulsiones o déficit focal tras buceo.</li><li>Administrar oxígeno al 100 % y consultar/trasladar a centro con cámara hiperbárica si sospecha.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Oxígeno precoz y mantenimiento de vía aérea permeable.</li><li>Control de SatO₂, FR, FC, TA, temperatura y estado neurológico.</li><li>Aspiración de secreciones/vómitos si precisa.</li><li>Prevención activa de hipotermia.</li><li>Registrar hora de inmersión, tiempo estimado bajo agua, tipo de agua, RCP, recuperación y síntomas.</li><li>En buceo: registrar profundidad, tiempo, ascenso, paradas y mezcla respiratoria.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Retrasar ventilación por intentar expulsar agua.</li><li>Considerar seguro al paciente asintomático demasiado pronto si ha tenido síntomas o inmersión significativa.</li><li>Olvidar lesión cervical en zambullidas.</li><li>No prevenir hipotermia.</li><li>No preguntar por datos de buceo ante síntomas neurológicos tras inmersión.</li></ul>"
    }
  ],
  "block": 2
},
{
  "id": "cardio-dolor-toracico-agudo-ingesa",
  "cat": "cardio",
  "especialidad": "Cardiología / Urgencias",
  "title": "Dolor torácico agudo",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias cardiovasculares, 2013",
  "tags": "dolor toracico agudo perfil isquemico pleuritico mecanico esofagico psicogeno pericardico diseccion aortica tep neumotorax sca ecg",
  "summary": "Valoración inicial del dolor torácico para diferenciar causas potencialmente mortales de cuadros no vitales, con enfoque prehospitalario y de enfermería.",
  "relations": {
    "patologias": [
      "Síndrome coronario agudo",
      "Infarto agudo de miocardio",
      "Angina",
      "Disección aórtica",
      "Tromboembolismo pulmonar",
      "Neumotórax",
      "Pericarditis",
      "Reflujo gastroesofágico",
      "Dolor musculoesquelético"
    ],
    "farmacos": [
      "Oxígeno",
      "Ácido acetilsalicílico",
      "Nitroglicerina",
      "Morfina",
      "Antiácidos",
      "Analgésicos"
    ],
    "escalas": [
      "ABCDE",
      "Escala del dolor",
      "ECG 12 derivaciones",
      "SAMPLE"
    ],
    "tecnicas": [
      "Monitorización ECG",
      "Toma de constantes",
      "Canalización venosa",
      "Electrocardiograma de 12 derivaciones",
      "Transferencia estructurada"
    ],
    "alertas": [
      "dolor opresivo irradiado",
      "sudoración/náuseas/síncope",
      "disnea",
      "hipotensión",
      "dolor desgarrador interescapular",
      "saturación baja",
      "alteración ECG"
    ]
  },
  "sec": [
    {
      "h": "Objetivo",
      "b": "<p>El dolor torácico es una de las consultas urgentes más frecuentes. El objetivo no es diagnosticar todas las causas en la escena, sino identificar rápidamente los cuadros que pueden comprometer la vida: síndrome coronario agudo, disección aórtica, tromboembolismo pulmonar, neumotórax a tensión, pericarditis complicada o patología respiratoria grave.</p>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A:</b> confirmar vía aérea permeable.</li><li><b>B:</b> valorar disnea, frecuencia respiratoria, SatO₂, trabajo respiratorio, auscultación y asimetría ventilatoria.</li><li><b>C:</b> TA en ambos brazos si sospecha vascular, frecuencia cardiaca, perfusión, sudoración, palidez y dolor persistente.</li><li><b>D:</b> nivel de conciencia, síncope, confusión, focalidad neurológica.</li><li><b>E:</b> signos traumáticos, herpes zóster, dolor a la palpación, fiebre o datos de infección.</li></ol>"
    },
    {
      "h": "Anamnesis dirigida",
      "b": "<ul><li><b>Factores de riesgo cardiovascular:</b> HTA, diabetes, tabaquismo, hipercolesterolemia, obesidad, sedentarismo, menopausia, edad y sexo.</li><li><b>Antecedentes:</b> cardiopatía isquémica, enfermedad vascular, trombosis, cirugía reciente, inmovilización, infección respiratoria, uso de fármacos concretos.</li><li><b>Dolor:</b> inicio brusco/progresivo, localización, irradiación, duración, desencadenantes y alivio.</li><li><b>Síntomas acompañantes:</b> disnea, sudoración, náuseas, vómitos, síncope, palpitaciones, fiebre, tos, hemoptisis o ansiedad.</li></ul>"
    },
    {
      "h": "Perfiles clínicos orientativos",
      "b": "<ul><li><b>Perfil isquémico:</b> opresivo, retroesternal/precordial, irradiado a brazo izquierdo, cuello, mandíbula, espalda o epigastrio; asociado a cortejo vegetativo, disnea o sensación de muerte.</li><li><b>Perfil pleurítico:</b> dolor punzante, aumenta con respiración profunda, tos o movimientos respiratorios; pensar en neumotórax, neumonía, TEP o pleuritis.</li><li><b>Perfil vascular:</b> dolor brusco, intenso, desgarrador, irradiado a espalda/interescapular; buscar asimetría de pulsos o TA.</li><li><b>Perfil pericárdico:</b> dolor punzante que empeora con inspiración y mejora sentado inclinado hacia delante.</li><li><b>Perfil esofágico:</b> relación con ingesta, reflujo, disfagia o mejora con antiácidos.</li><li><b>Perfil mecánico:</b> dolor reproducible con palpación, movimiento o postura.</li><li><b>Perfil psicógeno:</b> ansiedad, hiperventilación, parestesias y palpitaciones, siempre tras descartar gravedad.</li></ul>"
    },
    {
      "h": "Exploración y pruebas básicas",
      "b": "<ul><li>ECG de 12 derivaciones precoz si hay sospecha cardiovascular.</li><li>Monitorización ECG continua si dolor activo, inestabilidad o alteraciones ECG.</li><li>TA, FC, FR, SatO₂, temperatura y glucemia si alteración de conciencia.</li><li>Auscultación cardiopulmonar: crepitantes, sibilancias, roce pericárdico, asimetría de murmullo vesicular.</li><li> pulsos periféricos, signos de TVP, edemas y perfusión.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>Valorar ABCDE y estabilidad hemodinámica.</li><li>Sentar al paciente si disnea; reposo absoluto si sospecha de SCA.</li><li>Monitorizar ECG, TA, FC y SatO₂.</li><li>Realizar ECG de 12 derivaciones y repetir si dolor cambia o persiste.</li><li>Canalizar vía venosa si sospecha de causa grave.</li><li>Oxígeno si hipoxemia, dificultad respiratoria o shock.</li><li>Tratar según perfil y protocolo: SCA, arritmia, EAP, crisis hipertensiva, neumotórax, TEP, etc.</li><li>Traslado a centro útil con preaviso si SCA con elevación ST, inestabilidad, arritmia grave o sospecha de disección/TEP.</li></ol>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>No dejar al paciente solo si dolor activo o ECG alterado.</li><li>Registrar hora de inicio del dolor, evolución, factores de alivio y tratamientos administrados.</li><li>Preparar desfibrilador y material de vía venosa si perfil isquémico o inestabilidad.</li><li>Control seriado de dolor y constantes.</li><li>Transferencia estructurada: dolor, hora de inicio, ECG, constantes, medicación, respuesta y antecedentes clave.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Dar por benigno un dolor torácico porque es atípico.</li><li>No hacer ECG precoz ante sospecha de SCA.</li><li>Administrar nitratos sin comprobar TA o contraindicaciones.</li><li>Confundir ansiedad con diagnóstico final sin descartar causas graves.</li><li>No repetir ECG si el dolor persiste o cambia.</li></ul>"
    }
  ],
  "block": 3
},
{
  "id": "cardio-dolor-perfil-isquemico-sca-ingesa",
  "cat": "cardio",
  "especialidad": "Cardiología / Urgencias",
  "title": "Dolor de perfil isquémico / Síndrome coronario agudo",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias cardiovasculares, 2013",
  "tags": "dolor perfil isquemico sca iam scacest iamceST angina inestable aas nitroglicerina morfina clopidogrel heparina fibrinolisis hemodinamica ecg 12 derivaciones",
  "summary": "Identificación precoz del síndrome coronario agudo, ECG de 12 derivaciones, alivio del dolor, prevención de arritmias y traslado rápido al recurso adecuado.",
  "relations": {
    "patologias": [
      "Síndrome coronario agudo",
      "IAM con elevación del ST",
      "IAM sin elevación del ST",
      "Angina inestable",
      "Parada cardiaca",
      "Shock cardiogénico"
    ],
    "farmacos": [
      "Ácido acetilsalicílico",
      "Nitroglicerina",
      "Morfina",
      "Clopidogrel",
      "Heparina de bajo peso molecular",
      "Betabloqueantes",
      "Oxígeno"
    ],
    "escalas": [
      "ECG 12 derivaciones",
      "Escala del dolor",
      "Killip-Kimball",
      "Glasgow"
    ],
    "tecnicas": [
      "Monitorización ECG",
      "Desfibrilación",
      "Canalización venosa",
      "Administración sublingual",
      "Preaviso hemodinámica"
    ],
    "alertas": [
      "elevación ST",
      "dolor persistente",
      "síncope",
      "arritmia",
      "hipotensión",
      "edema pulmonar",
      "shock"
    ]
  },
  "sec": [
    {
      "h": "Objetivos prehospitalarios",
      "b": "<ul><li>Identificación precoz idealmente en los primeros minutos del contacto sanitario.</li><li>Aliviar el dolor y reducir consumo miocárdico de oxígeno.</li><li>Prevenir, detectar y tratar arritmias y parada cardiaca.</li><li>Activar el circuito hospitalario más útil: hemodinámica, fibrinólisis o unidad coronaria según protocolo territorial.</li></ul>"
    },
    {
      "h": "Claves diagnósticas",
      "b": "<ul><li>Dolor opresivo retroesternal o precordial, con irradiación a brazo izquierdo, mandíbula, cuello, espalda o epigastrio.</li><li>Puede acompañarse de sudoración fría, náuseas, vómitos, disnea, palidez, síncope o sensación de gravedad.</li><li>En diabéticos, mujeres, ancianos y pacientes con insuficiencia renal puede presentarse de forma atípica: disnea, debilidad, epigastralgia, mareo o síncope.</li><li>El diagnóstico inicial se basa en historia clínica y ECG; los marcadores son hospitalarios y pueden ser tardíos.</li></ul>"
    },
    {
      "h": "ECG de 12 derivaciones",
      "b": "<ul><li>Realizar ECG precoz y repetir si el dolor persiste, cambia o el primero no es diagnóstico.</li><li>Buscar elevación/depresión del ST, inversión de T, bloqueo de rama nuevo o arritmias.</li><li>Si hay elevación del ST o bloqueo de rama nuevo con clínica compatible: activar circuito de reperfusión.</li><li>No retrasar traslado por ECG no concluyente si el paciente está inestable o la clínica es muy sugestiva.</li></ul>"
    },
    {
      "h": "Valoración de gravedad",
      "b": "<ul><li>TA baja, piel fría, confusión o oliguria: sospecha de shock cardiogénico.</li><li>Crepitantes, ortopnea o SatO₂ baja: insuficiencia cardiaca/EAP.</li><li>Arritmias ventriculares, bradicardia extrema o bloqueo AV: riesgo de deterioro.</li><li>Dolor persistente pese a tratamiento: alto riesgo.</li></ul>"
    },
    {
      "h": "Tratamiento inicial orientativo",
      "b": "<ul><li><b>Reposo absoluto</b> y monitorización ECG continua.</li><li><b>Oxígeno</b> si hipoxemia, disnea importante, shock o insuficiencia cardiaca.</li><li><b>AAS</b> masticada si no alergia ni contraindicación.</li><li><b>Nitroglicerina sublingual</b> si dolor y TA adecuada; evitar si hipotensión, sospecha de infarto de ventrículo derecho, estenosis aórtica crítica o uso reciente de inhibidores PDE5.</li><li><b>Analgesia</b> si dolor persistente, con morfina u opiáceo según protocolo y vigilancia estrecha.</li><li><b>Antiagregación/anticoagulación adicional</b> según protocolo de SCA y estrategia de reperfusión.</li></ul>"
    },
    {
      "h": "Reperfusión y traslado",
      "b": "<ul><li>Si sospecha de IAM con elevación ST, prioridad absoluta: acceso rápido a angioplastia primaria si disponible en tiempos adecuados.</li><li>Si no hay angioplastia en tiempo y protocolo lo indica, valorar fibrinólisis por equipo médico.</li><li>Preaviso al centro receptor con hora de inicio, ECG, tratamiento y situación clínica.</li><li>Mantener desfibrilador disponible durante todo el traslado.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Monitorización continua y vigilancia de arritmias.</li><li>Registrar hora exacta de inicio del dolor y hora de cada tratamiento.</li><li>Control de dolor antes/después de nitratos y analgesia.</li><li>Verificar alergias, sangrados, anticoagulación previa y toma de fármacos tipo sildenafilo/tadalafilo.</li><li>Preparar material de RCP/desfibrilación.</li><li>Comunicar cualquier cambio en ST, dolor, TA, SatO₂ o ritmo.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Retrasar ECG o traslado por buscar confirmaciones innecesarias.</li><li>Administrar nitratos con hipotensión o sin valorar contraindicaciones.</li><li>No monitorizar a un paciente con dolor isquémico activo.</li><li>No registrar hora de inicio, fundamental para estrategia de reperfusión.</li><li>Infravalorar síntomas atípicos en mujeres, diabéticos o ancianos.</li></ul>"
    }
  ],
  "block": 3
},
{
  "id": "cardio-arritmias-ingesa",
  "cat": "cardio",
  "especialidad": "Cardiología / Urgencias / Críticos",
  "title": "Manejo del paciente con arritmias",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias cardiovasculares, 2013",
  "tags": "arritmia taquicardia bradicardia qrs estrecho qrs ancho fibrilacion auricular flutter tpsv tv fv adenosina amiodarona atropina cardioversion marcapasos",
  "summary": "Algoritmo práctico para arritmias basado en estabilidad hemodinámica, frecuencia, regularidad y anchura del QRS.",
  "relations": {
    "patologias": [
      "Taquicardia supraventricular",
      "Fibrilación auricular",
      "Flutter auricular",
      "Taquicardia ventricular",
      "Bradicardia sintomática",
      "Bloqueo AV",
      "Torsade de pointes"
    ],
    "farmacos": [
      "Adenosina",
      "Amiodarona",
      "Atropina",
      "Midazolam",
      "Adrenalina",
      "Digoxina",
      "Diltiazem",
      "Betabloqueantes",
      "Sulfato de magnesio"
    ],
    "escalas": [
      "ECG 12 derivaciones",
      "ABCDE",
      "Glasgow"
    ],
    "tecnicas": [
      "Cardioversión sincronizada",
      "Desfibrilación",
      "Marcapasos transcutáneo",
      "Maniobras vagales",
      "Monitorización ECG"
    ],
    "alertas": [
      "TAS <90",
      "dolor torácico",
      "fallo cardiaco",
      "síncope",
      "alteración conciencia",
      "FC <40",
      "QRS ancho",
      "TV/FV"
    ]
  },
  "sec": [
    {
      "h": "Primer paso: estabilidad",
      "b": "<p>En arritmias, la primera decisión es si el paciente está estable o inestable. La inestabilidad manda más que el nombre exacto de la arritmia.</p><ul><li><b>Signos adversos:</b> hipotensión, síncope, shock, dolor torácico isquémico, insuficiencia cardiaca, alteración del nivel de conciencia o mala perfusión.</li><li>Si hay inestabilidad con taquiarritmia: valorar cardioversión sincronizada inmediata por equipo entrenado.</li><li>Si hay bradiarritmia inestable: atropina, marcapasos transcutáneo y soporte según protocolo.</li></ul>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ol><li>ABCDE, oxígeno si hipoxemia o dificultad respiratoria.</li><li>Monitorización ECG, TA, SatO₂ y nivel de conciencia.</li><li>Canalizar vía venosa.</li><li>ECG de 12 derivaciones si el paciente lo permite, sin retrasar tratamiento si inestable.</li><li>Buscar causas reversibles: hipoxia, dolor, fiebre, sepsis, IAM, alteraciones K/Mg, fármacos, tóxicos, hipovolemia.</li></ol>"
    },
    {
      "h": "Taquicardia: enfoque práctico",
      "b": "<ul><li><b>QRS estrecho regular y estable:</b> maniobras vagales; si no revierte, adenosina según protocolo.</li><li><b>QRS estrecho irregular:</b> pensar en FA/flutter; controlar frecuencia según situación, tiempo de evolución y riesgo embólico.</li><li><b>QRS ancho regular:</b> tratar como taquicardia ventricular hasta demostrar lo contrario; amiodarona si estable, cardioversión si inestable.</li><li><b>QRS ancho irregular:</b> alto riesgo; valorar preexcitación, FA con aberrancia o TV polimórfica. Requiere ayuda experta.</li></ul>"
    },
    {
      "h": "Cardioversión sincronizada",
      "b": "<ul><li>Indicada en taquiarritmia con signos adversos.</li><li>Debe sincronizarse para evitar descarga sobre onda T.</li><li>El manual recuerda que los intentos de cardioversión deben ir precedidos de sedación con midazolam cuando la situación lo permita.</li><li>Si la arritmia degenera en FV/TV sin pulso: desfibrilación no sincronizada y RCP.</li></ul>"
    },
    {
      "h": "Bradicardia: enfoque práctico",
      "b": "<ul><li>Valorar si la frecuencia es inadecuadamente lenta para el estado del paciente.</li><li>Signos adversos: FC &lt;40, TAS &lt;90, arritmia ventricular con compromiso TA, fallo cardiaco o síncope.</li><li>Atropina 0,5 mg IV; puede repetirse hasta máximo 3 mg según respuesta.</li><li>Si no responde o hay riesgo de asistolia: marcapasos transcutáneo y preparar marcapasos IV si procede.</li><li>Riesgo de asistolia: asistolia reciente, Mobitz II, bloqueo AV completo con QRS ancho o pausa ventricular &gt;3 s.</li></ul>"
    },
    {
      "h": "Farmacología orientativa",
      "b": "<ul><li><b>Adenosina:</b> útil en taquicardia regular de QRS estrecho. Administrar en bolo rápido con lavado de suero y monitorización.</li><li><b>Amiodarona:</b> en TV o ritmo incierto estable; el manual describe 300 mg IV en 20-30 min, seguida de perfusión 900 mg/24 h.</li><li><b>Atropina:</b> bradicardia sintomática: 0,5 mg IV repetible hasta 3 mg.</li><li><b>Magnesio:</b> en torsade de pointes, 2 g en 10 min según manual.</li><li><b>Midazolam:</b> sedación previa a cardioversión si hay tiempo y seguridad clínica.</li></ul><p>Revisar siempre dosis y algoritmos con SVA/protocolo local vigente.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Preparar desfibrilador, parches y carro de RCP.</li><li>Monitorizar ECG continuo y conservar tiras antes/después de tratamientos.</li><li>Registrar hora, ritmo, constantes, fármaco, dosis y respuesta.</li><li>Vigilar hipotensión, dolor torácico, disnea y nivel de conciencia tras fármacos.</li><li>En adenosina, avisar al paciente de sensación transitoria desagradable y registrar la respuesta del ritmo.</li><li>En marcapasos transcutáneo, controlar captura eléctrica/mecánica, analgesia/sedación y tolerancia.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Intentar identificar el ritmo perfecto antes de tratar inestabilidad.</li><li>No sincronizar la cardioversión en taquiarritmia con pulso.</li><li>Tratar una taquicardia de QRS ancho como supraventricular sin seguridad.</li><li>No buscar causas reversibles.</li><li>Olvidar sedación/analgesia cuando la situación permite cardioversión o marcapasos.</li></ul>"
    }
  ],
  "block": 3
},
{
  "id": "cardio-crisis-hipertensiva-ingesa",
  "cat": "cardio",
  "especialidad": "Cardiología / Urgencias",
  "title": "Crisis hipertensiva",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias cardiovasculares, 2013",
  "tags": "crisis hipertensiva urgencia hipertensiva emergencia hipertensiva daño organo diana encefalopatia acv sca eap diseccion captopril labetalol urapidil nitroglicerina",
  "summary": "Diferenciación entre urgencia y emergencia hipertensiva, búsqueda de daño de órgano diana y descenso tensional seguro.",
  "relations": {
    "patologias": [
      "Urgencia hipertensiva",
      "Emergencia hipertensiva",
      "Encefalopatía hipertensiva",
      "Edema agudo de pulmón",
      "Disección aórtica",
      "SCA",
      "Ictus"
    ],
    "farmacos": [
      "Captopril",
      "Labetalol",
      "Urapidil",
      "Nitroglicerina",
      "Furosemida",
      "Analgésicos"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "ECG 12 derivaciones"
    ],
    "tecnicas": [
      "Medición correcta de TA",
      "Monitorización continua",
      "Canalización venosa",
      "Bomba de perfusión"
    ],
    "alertas": [
      "dolor torácico",
      "disnea/EAP",
      "cefalea intensa",
      "déficit neurológico",
      "alteración conciencia",
      "dolor interescapular",
      "embarazo/eclampsia",
      "creatinina/oliguria"
    ]
  },
  "sec": [
    {
      "h": "Definición práctica",
      "b": "<ul><li><b>Urgencia hipertensiva:</b> cifras muy elevadas de TA sin daño agudo de órgano diana. Requiere descenso gradual y seguimiento.</li><li><b>Emergencia hipertensiva:</b> TA elevada con daño agudo de órgano diana: encefalopatía, ictus, SCA, edema agudo de pulmón, disección aórtica, insuficiencia renal aguda, eclampsia, etc. Requiere tratamiento IV, monitorización y traslado urgente.</li></ul>"
    },
    {
      "h": "Confirmar la TA",
      "b": "<ul><li>Medir con manguito adecuado y paciente en reposo si la situación lo permite.</li><li>Repetir medición y comparar brazos si sospecha de disección o patología vascular.</li><li>Valorar causas transitorias: dolor, ansiedad, retención urinaria, hipoxia, abstinencia, consumo de tóxicos o mala adherencia.</li></ul>"
    },
    {
      "h": "Buscar daño de órgano diana",
      "b": "<ul><li><b>Neurológico:</b> cefalea intensa, vómitos, confusión, convulsiones, déficit focal, alteración visual.</li><li><b>Cardiaco:</b> dolor torácico, ECG alterado, arritmia, signos de SCA.</li><li><b>Respiratorio:</b> disnea, ortopnea, crepitantes, SatO₂ baja, EAP.</li><li><b>Vascular:</b> dolor brusco desgarrador, asimetría de pulsos/TA, sospecha de disección.</li><li><b>Renal:</b> oliguria, edema, sospecha de insuficiencia renal aguda.</li><li><b>Obstétrico:</b> embarazo/puerperio, cefalea, epigastralgia, alteración visual o convulsiones.</li></ul>"
    },
    {
      "h": "Actuación en urgencia hipertensiva",
      "b": "<ol><li>Reposo en ambiente tranquilo.</li><li>Repetir TA y valorar adherencia a tratamiento.</li><li>Tratar dolor, ansiedad o desencadenante si existe.</li><li>Descenso gradual con fármacos orales según protocolo.</li><li>No normalizar la TA de forma brusca.</li><li>Derivación/seguimiento según cifra, contexto y riesgo cardiovascular.</li></ol>"
    },
    {
      "h": "Actuación en emergencia hipertensiva",
      "b": "<ol><li>ABCDE y monitorización continua.</li><li>Canalizar vía venosa.</li><li>ECG de 12 derivaciones si dolor torácico/disnea o sospecha cardiaca.</li><li>Oxígeno si hipoxemia o EAP.</li><li>Tratamiento IV según órgano afectado y protocolo: urapidil/labetalol/nitroglicerina/nitroprusiato/nicardipino según disponibilidad y escenario.</li><li>Evitar descensos bruscos salvo indicaciones específicas como disección aórtica.</li><li>Traslado medicalizado al centro útil.</li></ol>"
    },
    {
      "h": "Principio de seguridad en el descenso",
      "b": "<p>En general, la presión no debe bajarse de golpe porque puede producir hipoperfusión cerebral, coronaria o renal. El descenso debe ser controlado, progresivo y adaptado al órgano diana afectado. Existen excepciones con objetivos propios, como disección aórtica, ictus, eclampsia o edema agudo de pulmón.</p>"
    },
    {
      "h": "Farmacología orientativa",
      "b": "<ul><li><b>Captopril VO/SL:</b> opción en urgencia hipertensiva si no contraindicaciones y paciente estable.</li><li><b>Urapidil/Labetalol IV:</b> opciones en emergencia hipertensiva según contexto.</li><li><b>Nitroglicerina IV/SL:</b> útil si SCA o EAP con TA adecuada.</li><li><b>Furosemida:</b> si congestión/EAP.</li></ul><p>Evitar nifedipino sublingual de acción rápida por riesgo de caída brusca e impredecible de TA.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Medir TA correctamente y registrar brazo, postura, hora y cifras seriadas.</li><li>Vigilar aparición o empeoramiento de daño de órgano: dolor, disnea, déficit neurológico, oliguria, confusión.</li><li>Manejar bomba de perfusión si antihipertensivo IV.</li><li>Evitar errores de dosis en perfusiones y comprobar diluciones.</li><li>Educar al alta/derivación si urgencia: adherencia, alarma y control posterior.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Tratar solo la cifra sin buscar daño de órgano diana.</li><li>Bajar la TA demasiado rápido en una urgencia hipertensiva.</li><li>Ignorar dolor torácico, disnea o síntomas neurológicos.</li><li>Usar fármacos de acción impredecible sin monitorización.</li><li>No revisar embarazo/puerperio en mujer en edad fértil.</li></ul>"
    }
  ],
  "block": 3
},
{
  "id": "cardio-insuficiencia-cardiaca-aguda-ingesa",
  "cat": "cardio",
  "especialidad": "Cardiología / Urgencias / Críticos",
  "title": "Insuficiencia cardiaca aguda",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias cardiovasculares, 2013",
  "tags": "insuficiencia cardiaca aguda ic disnea congestión bajo gasto perfil húmedo seco frío caliente furosemida nitroglicerina dobutamina cpap vmni",
  "summary": "Manejo inicial de la insuficiencia cardiaca aguda según congestión, perfusión, tensión arterial y presencia de edema pulmonar.",
  "relations": {
    "patologias": [
      "Insuficiencia cardiaca aguda",
      "Edema agudo de pulmón",
      "Shock cardiogénico",
      "SCA",
      "Arritmia",
      "Crisis hipertensiva"
    ],
    "farmacos": [
      "Oxígeno",
      "Furosemida",
      "Nitroglicerina",
      "Morfina",
      "Dobutamina",
      "Noradrenalina"
    ],
    "escalas": [
      "NYHA",
      "Killip-Kimball",
      "ABCDE",
      "ECG 12 derivaciones"
    ],
    "tecnicas": [
      "Posición Fowler",
      "VMNI/CPAP",
      "Monitorización",
      "Canalización venosa",
      "Bomba de perfusión"
    ],
    "alertas": [
      "SatO2 baja",
      "crepitantes",
      "ortopnea",
      "piel fría",
      "hipotensión",
      "alteración conciencia",
      "dolor torácico",
      "arritmia"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La insuficiencia cardiaca aguda es la aparición rápida o empeoramiento de signos y síntomas de fallo cardiaco, con incapacidad del corazón para mantener un gasto adecuado o hacerlo a costa de presiones de llenado elevadas.</p><ul><li>Puede debutar como disnea, congestión pulmonar, bajo gasto o shock cardiogénico.</li><li>Los desencadenantes frecuentes son SCA, arritmias, crisis hipertensiva, infección, incumplimiento terapéutico, exceso de sal/fluidos, anemia, TEP o insuficiencia renal.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A/B:</b> valorar vía aérea, disnea, ortopnea, uso de musculatura accesoria, SatO₂, auscultación.</li><li><b>C:</b> TA, FC, perfusión periférica, piel fría/caliente, edemas, ingurgitación yugular.</li><li><b>D:</b> conciencia, agitación, somnolencia o confusión por hipoxia/hipoperfusión.</li><li><b>E:</b> fiebre, signos de infección, edema periférico, desencadenantes.</li></ol>"
    },
    {
      "h": "Clasificación rápida por perfil",
      "b": "<ul><li><b>Húmedo:</b> congestión: crepitantes, ortopnea, ingurgitación yugular, edemas.</li><li><b>Seco:</b> sin congestión clara.</li><li><b>Caliente:</b> perfusión conservada.</li><li><b>Frío:</b> hipoperfusión: piel fría, confusión, oliguria, hipotensión, lactato elevado si disponible.</li><li>El perfil más frecuente es húmedo-caliente: congestión con perfusión conservada.</li></ul>"
    },
    {
      "h": "Exploración y pruebas",
      "b": "<ul><li>Constantes: TA, FC, FR, SatO₂, temperatura.</li><li>ECG de 12 derivaciones: buscar SCA, arritmia, bloqueo o signos de sobrecarga.</li><li>Auscultación: crepitantes, sibilancias cardiacas, ritmo de galope si se detecta.</li><li>Buscar edemas, ingurgitación yugular, hepatomegalia dolorosa, piel fría o diaforesis.</li><li>Glucemia si alteración del nivel de conciencia.</li></ul>"
    },
    {
      "h": "Tratamiento según situación",
      "b": "<ul><li><b>Congestión con TA conservada/alta:</b> posición Fowler, oxígeno si precisa, nitratos si indicados, diurético si sobrecarga, VMNI si distrés.</li><li><b>Congestión con hipotensión o perfil frío:</b> evitar vasodilatadores agresivos; valorar inotrópicos/vasopresores por equipo médico y traslado urgente.</li><li><b>Arritmia desencadenante:</b> tratar según algoritmo de arritmias.</li><li><b>SCA desencadenante:</b> tratar como síndrome coronario agudo y activar circuito.</li><li><b>Infección/sepsis:</b> tratar desencadenante y derivar.</li></ul>"
    },
    {
      "h": "Oxígeno y soporte ventilatorio",
      "b": "<ul><li>Oxígeno si SatO₂ baja o trabajo respiratorio aumentado.</li><li>Posición Fowler o sedestación si tolera.</li><li>VMNI/CPAP si edema pulmonar, hipoxemia o trabajo respiratorio importante y no hay contraindicaciones.</li><li>Preparar vía aérea avanzada si agotamiento, disminución del nivel de conciencia o fracaso ventilatorio.</li></ul>"
    },
    {
      "h": "Farmacología orientativa",
      "b": "<ul><li><b>Furosemida:</b> si congestión/edema pulmonar y perfil compatible.</li><li><b>Nitroglicerina:</b> si TA conservada/alta y congestión/SCA; vigilar hipotensión.</li><li><b>Morfina:</b> algunos protocolos antiguos la contemplan en EAP con ansiedad/dolor, pero debe usarse con mucha prudencia y según protocolo vigente.</li><li><b>Dobutamina/Noradrenalina:</b> si bajo gasto/shock bajo indicación médica y monitorización.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Colocar al paciente incorporado y reducir esfuerzo.</li><li>Monitorizar SatO₂, FR, TA, FC, ECG y estado mental.</li><li>Control estricto de diuresis si es posible.</li><li>Preparar VMNI y comprobar mascarilla, fugas, tolerancia y presión.</li><li>Vigilar hipotensión tras nitratos o diuréticos.</li><li>Transferir desencadenante sospechado, perfil hemodinámico, tratamientos y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Tratar toda disnea como respiratoria sin valorar causa cardiaca.</li><li>Dar nitratos a paciente hipotenso.</li><li>Retrasar VMNI en EAP con trabajo respiratorio importante.</li><li>No buscar SCA o arritmia como desencadenante.</li><li>Administrar fluidos sin valorar congestión y perfusión.</li></ul>"
    }
  ],
  "block": 3
},
{
  "id": "cardio-edema-agudo-pulmon-ingesa",
  "cat": "cardio",
  "especialidad": "Cardiología / Respiratorio / Urgencias",
  "title": "Edema agudo de pulmón",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias cardiovasculares, 2013",
  "tags": "edema agudo pulmon eap cardiogenico disnea ortopnea espuma rosada crepitantes cpap vmni furosemida nitroglicerina morfina fowler",
  "summary": "Manejo práctico del edema agudo de pulmón cardiogénico: posición, oxigenación, VMNI, nitratos/diuréticos si indicados y traslado urgente.",
  "relations": {
    "patologias": [
      "Edema agudo de pulmón",
      "Insuficiencia cardiaca aguda",
      "Crisis hipertensiva",
      "SCA",
      "Shock cardiogénico"
    ],
    "farmacos": [
      "Oxígeno",
      "Nitroglicerina",
      "Furosemida",
      "Morfina",
      "Dobutamina",
      "Noradrenalina"
    ],
    "escalas": [
      "ABCDE",
      "SatO₂",
      "ECG 12 derivaciones"
    ],
    "tecnicas": [
      "Posición Fowler",
      "VMNI/CPAP",
      "Monitorización ECG",
      "Canalización venosa",
      "Bomba de perfusión"
    ],
    "alertas": [
      "disnea intensa",
      "ortopnea",
      "expectoración rosada",
      "SatO2 baja",
      "crepitantes difusos",
      "hipertensión grave",
      "hipotensión/shock",
      "alteración conciencia"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>El edema agudo de pulmón cardiogénico es una forma grave de insuficiencia cardiaca izquierda con acumulación rápida de líquido en el intersticio/alvéolo pulmonar. Produce hipoxemia, trabajo respiratorio elevado y sensación intensa de ahogo.</p>"
    },
    {
      "h": "Clínica típica",
      "b": "<ul><li>Disnea brusca o progresiva, ortopnea, ansiedad e imposibilidad para tumbarse.</li><li>Taquipnea, uso de musculatura accesoria, sudoración y palidez.</li><li>Crepitantes bilaterales, a veces sibilancias cardiacas.</li><li>Expectoración espumosa rosada en casos avanzados.</li><li>TA puede estar alta, normal o baja. La hipotensión indica peor pronóstico.</li></ul>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ol><li>ABCDE y valoración de vía aérea/ventilación.</li><li>Sentar en Fowler o posición de máximo confort.</li><li>SatO₂, FR, TA, FC, ECG y nivel de conciencia.</li><li>Auscultación pulmonar y cardiaca.</li><li>ECG de 12 derivaciones para buscar SCA o arritmia desencadenante.</li><li>Canalizar vía venosa.</li></ol>"
    },
    {
      "h": "Tratamiento inmediato",
      "b": "<ul><li><b>Posición:</b> Fowler/sedestación, piernas dependientes si tolera.</li><li><b>Oxígeno:</b> si hipoxemia o trabajo respiratorio.</li><li><b>VMNI/CPAP:</b> precoz si distrés, SatO₂ baja o crepitantes extensos, siempre que no haya contraindicaciones.</li><li><b>Nitratos:</b> especialmente útiles si TA alta o SCA, vigilando hipotensión.</li><li><b>Diurético:</b> furosemida si congestión/retención hídrica y perfil compatible.</li><li><b>Si hipotensión/shock:</b> evitar nitratos agresivos; valorar inotrópicos/vasopresores y traslado medicalizado urgente.</li></ul>"
    },
    {
      "h": "VMNI/CPAP: puntos de enfermería",
      "b": "<ul><li>Explicar al paciente para mejorar tolerancia.</li><li>Elegir mascarilla adecuada y minimizar fugas.</li><li>Vigilar TA, SatO₂, FR, trabajo respiratorio, nivel de conciencia y riesgo de vómito.</li><li>Contraindicaciones relativas: vómitos, bajo nivel de conciencia, incapacidad para proteger vía aérea, shock severo, trauma facial o mala adaptación.</li><li>Preparar alternativa de vía aérea avanzada si fracasa.</li></ul>"
    },
    {
      "h": "Farmacología orientativa",
      "b": "<ul><li><b>Furosemida IV:</b> en edema asociado a insuficiencia cardiaca; ajustar a situación, función renal y tratamiento previo.</li><li><b>Nitroglicerina SL/IV:</b> si TA lo permite; útil en EAP hipertensivo/SCA.</li><li><b>Morfina:</b> uso clásico por ansiedad y precarga, pero actualmente debe individualizarse por riesgo de depresión respiratoria, náuseas e hipotensión.</li><li><b>Inotrópicos/vasopresores:</b> si shock cardiogénico por equipo médico y con monitorización.</li></ul>"
    },
    {
      "h": "Criterios de gravedad",
      "b": "<ul><li>SatO₂ baja pese a oxígeno.</li><li>Agotamiento respiratorio, silencio auscultatorio o disminución del nivel de conciencia.</li><li>Hipotensión, piel fría o mala perfusión.</li><li>Dolor torácico/SCA asociado.</li><li>Arritmia grave.</li><li>Necesidad de VMNI o vía aérea avanzada.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>No tumbar al paciente si empeora la disnea.</li><li>Preparar oxígeno, VMNI, aspiración, monitor y vía venosa.</li><li>Control seriado de TA antes/después de nitratos.</li><li>Vigilar diuresis, respuesta clínica y efectos adversos.</li><li>Registrar FR, SatO₂, auscultación, tolerancia a VMNI y respuesta a tratamiento.</li><li>Transferir: inicio, desencadenante sospechado, ECG, TA inicial/evolución, tratamiento y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Acostar al paciente con ortopnea intensa.</li><li>Retrasar CPAP/VMNI cuando hay distrés respiratorio.</li><li>Dar nitratos con hipotensión.</li><li>Olvidar ECG y SCA como causa desencadenante.</li><li>Usar morfina de rutina sin valorar riesgos.</li></ul>"
    }
  ],
  "block": 3
},
{
  "id": "neuro-acv-ingesa",
  "cat": "neuro",
  "especialidad": "Neurología / Urgencias",
  "title": "Accidente cerebrovascular (ACV)",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neurológicas, 2013",
  "tags": "acv ictus stroke ait isquemico hemorragico deficit focal afasia hemiparesia tiempo es cerebro glucemia cincinnati nihss",
  "summary": "Reconocimiento del déficit neurológico focal agudo, estabilización inicial y traslado urgente evitando medidas que puedan agravar el daño neurológico.",
  "relations": {
    "patologias": [
      "Ictus isquémico",
      "Ictus hemorrágico",
      "Accidente isquémico transitorio",
      "Hemorragia subaracnoidea",
      "Hipoglucemia simulando ictus"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Glucosa si hipoglucemia",
      "Antihipertensivos según protocolo"
    ],
    "escalas": [
      "Cincinnati",
      "NIHSS",
      "Glasgow",
      "AVDI",
      "Escala de Rankin modificada"
    ],
    "tecnicas": [
      "ECG 12 derivaciones",
      "Glucemia capilar",
      "Monitorización",
      "Canalización venosa",
      "Preaviso hospitalario"
    ],
    "alertas": [
      "inicio brusco",
      "afasia",
      "hemiparesia",
      "asimetría facial",
      "alteración visual",
      "cefalea súbita intensa",
      "Glasgow bajo",
      "convulsión al inicio"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>El accidente cerebrovascular es un síndrome neurológico focal de inicio agudo y origen vascular. Puede ser isquémico, por oclusión arterial, o hemorrágico, por sangrado intracraneal. En la práctica extrahospitalaria se trata como una emergencia tiempo-dependiente: <b>tiempo es cerebro</b>.</p><ul><li>El objetivo es identificar rápido el déficit, estabilizar y trasladar al centro útil.</li><li>No se debe perder tiempo intentando distinguir con certeza isquémico de hemorrágico en la escena.</li><li>La hora de inicio o la última vez que fue visto bien es un dato crítico.</li></ul>"
    },
    {
      "h": "Clasificación práctica",
      "b": "<ul><li><b>Isquémico:</b> el más frecuente. Puede ser aterotrombótico, cardioembólico, lacunar u otras causas.</li><li><b>Hemorrágico:</b> intraparenquimatoso, subaracnoideo, subdural, epidural o intraventricular.</li><li><b>AIT:</b> déficit neurológico focal de origen vascular con resolución completa. Aunque revierta, debe considerarse de alto riesgo.</li><li><b>ACV establecido:</b> déficit persistente durante las primeras horas.</li></ul>"
    },
    {
      "h": "Clínica de sospecha",
      "b": "<ul><li>Debilidad o pérdida de fuerza en cara, brazo o pierna, especialmente unilateral.</li><li>Alteración del habla: disartria, afasia o lenguaje incoherente.</li><li>Pérdida de visión, diplopía o desviación de la mirada.</li><li>Alteración de sensibilidad unilateral.</li><li>Ataxia, vértigo intenso con focalidad o alteración de la marcha.</li><li>Cefalea brusca e intensa, sobre todo si se asocia a vómitos, rigidez de nuca o disminución de conciencia.</li><li>Confusión, somnolencia o coma en formas graves.</li></ul>"
    },
    {
      "h": "Descartar simuladores",
      "b": "<p>Antes de etiquetar un cuadro como ictus, hay que descartar causas reversibles o imitadores frecuentes:</p><ul><li>Hipoglucemia o hiperglucemia grave.</li><li>Crisis epiléptica con parálisis de Todd.</li><li>Migraña con aura.</li><li>Intoxicaciones o fármacos sedantes.</li><li>Sepsis, hipoxia, trastornos metabólicos o síncope.</li><li>Traumatismo craneal.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A:</b> vía aérea. Si disminuye el nivel de conciencia, aspirar secreciones y preparar soporte avanzado.</li><li><b>B:</b> SatO₂ y frecuencia respiratoria. Oxígeno si hipoxemia o dificultad respiratoria.</li><li><b>C:</b> TA, pulso, perfusión y ECG. Buscar arritmias como fibrilación auricular.</li><li><b>D:</b> Glasgow, pupilas, glucemia capilar y valoración focal.</li><li><b>E:</b> temperatura, signos de trauma, infección o tóxicos.</li></ol>"
    },
    {
      "h": "Evaluación neurológica rápida",
      "b": "<ul><li><b>Cincinnati:</b> asimetría facial, caída de un brazo y alteración del habla.</li><li><b>Glasgow:</b> especialmente si hay disminución del nivel de conciencia.</li><li><b>Déficit motor:</b> elevación de brazos y piernas, fuerza contra gravedad.</li><li><b>Lenguaje:</b> comprensión, emisión, nominación y disartria.</li><li><b>Pupilas y mirada:</b> asimetrías, desviación conjugada, respuesta a luz.</li><li><b>Hora:</b> inicio exacto o última vez visto bien.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>Confirmar sospecha de ictus y hora de inicio.</li><li>ABCDE, glucemia capilar, constantes y ECG.</li><li>Cabecera elevada unos 30º si tolera y no hay hipotensión.</li><li>Evitar hipoxia, hipotensión, fiebre e hipoglucemia.</li><li>Canalizar vía venosa si no retrasa el traslado.</li><li>No administrar antiagregantes, anticoagulantes, corticoides ni manitol de rutina en el ámbito prehospitalario.</li><li>Activar código ictus si cumple criterios locales.</li><li>Traslado a centro con capacidad de tratamiento específico, con preaviso.</li></ol>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Registrar hora de inicio/último momento asintomático, testigos y evolución.</li><li>Control seriado de Glasgow, pupilas, fuerza y lenguaje.</li><li>Mantener vía aérea permeable y aspiración preparada.</li><li>Evitar ingesta oral por riesgo de broncoaspiración.</li><li>Proteger extremidades afectas y prevenir caídas.</li><li>Transferir: hora, Cincinnati/NIHSS si disponible, glucemia, TA, ECG, medicación previa y anticoagulación.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Retrasar el traslado por exploraciones no imprescindibles.</li><li>No medir glucemia.</li><li>Administrar antiagregantes/anticoagulantes antes de descartar hemorragia.</li><li>Bajar la tensión de forma agresiva sin indicación.</li><li>Sedar al paciente si no es imprescindible.</li><li>No anotar la hora de inicio o la última vez visto bien.</li></ul>"
    }
  ],
  "block": 4
},
{
  "id": "neuro-codigo-ictus-prehospitalario-ingesa",
  "cat": "neuro",
  "especialidad": "Neurología / Urgencias / Coordinación prehospitalaria",
  "title": "Código ictus en atención prehospitalaria",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neurológicas, 2013",
  "tags": "codigo ictus prehospitalario fibrinolisis trombolisis ventana terapeutica cincinnati neuroestable unidad ictus teleictus",
  "summary": "Activación organizada del circuito código ictus para identificar, notificar y trasladar pacientes candidatos a tratamiento específico.",
  "relations": {
    "patologias": [
      "Ictus isquémico agudo",
      "Ictus hemorrágico",
      "AIT",
      "Hemorragia subaracnoidea"
    ],
    "farmacos": [
      "Oxígeno",
      "Glucosa si hipoglucemia",
      "Cristaloides si hipotensión"
    ],
    "escalas": [
      "Cincinnati",
      "NIHSS",
      "Glasgow",
      "Rankin previa"
    ],
    "tecnicas": [
      "Preaviso código ictus",
      "Glucemia capilar",
      "ECG",
      "Monitorización",
      "Traslado a unidad de ictus"
    ],
    "alertas": [
      "ventana terapéutica",
      "última vez visto bien",
      "anticoagulado",
      "Glasgow bajo",
      "crisis convulsiva inicial",
      "TA extrema"
    ]
  },
  "sec": [
    {
      "h": "Qué es el código ictus",
      "b": "<p>El código ictus es un sistema de alerta y actuación que permite la identificación rápida, notificación y traslado del paciente con ictus agudo al hospital de referencia preparado para tratamiento específico, incluyendo reperfusión cuando esté indicada.</p><ul><li>Organiza la asistencia prehospitalaria y hospitalaria.</li><li>Reduce demoras.</li><li>Mantiene al paciente neuroestable durante el traslado.</li></ul>"
    },
    {
      "h": "Objetivos",
      "b": "<ul><li>Detectar ictus agudo de forma precoz.</li><li>Recoger datos esenciales para decidir tratamiento: hora de inicio, situación basal, anticoagulación, glucemia y gravedad.</li><li>Evitar daño secundario: hipoxia, hipotensión, fiebre, hipoglucemia, broncoaspiración.</li><li>Trasladar al centro útil, no necesariamente al centro más cercano si no dispone de circuito ictus.</li></ul>"
    },
    {
      "h": "Criterios de sospecha",
      "b": "<ul><li>Déficit neurológico focal agudo no convulsivo.</li><li>Cincinnati positiva: asimetría facial, claudicación de brazo o alteración del habla.</li><li>Inicio súbito o última vez visto bien dentro de ventana terapéutica local.</li><li>Situación funcional previa compatible con tratamiento activo.</li></ul>"
    },
    {
      "h": "Datos imprescindibles antes del preaviso",
      "b": "<ul><li>Hora exacta de inicio o última vez visto asintomático.</li><li>Edad, situación basal y autonomía previa.</li><li>Síntomas actuales y evolución.</li><li>Glucemia capilar.</li><li>TA, FC, SatO₂, temperatura y Glasgow.</li><li>Medicación: anticoagulantes, antiagregantes, insulina, antihipertensivos.</li><li>Antecedentes: ictus previo, sangrado, cirugía reciente, epilepsia, trauma, neoplasia o anticoagulación.</li></ul>"
    },
    {
      "h": "Mantener al paciente neuroestable",
      "b": "<ul><li>Vía aérea protegida; aspiración si secreciones o vómitos.</li><li>Oxígeno si SatO₂ baja o dificultad respiratoria.</li><li>Evitar hipotensión: perfusión cerebral depende de presión sistémica adecuada.</li><li>Evitar hipertermia e hipoglucemia.</li><li>No administrar nada por vía oral.</li><li>Cabecera 30º si tolera.</li><li>Traslado sin frenadas bruscas ni movimientos innecesarios.</li></ul>"
    },
    {
      "h": "Lo que NO debe hacerse de rutina",
      "b": "<ul><li>No antiagregar antes de neuroimagen.</li><li>No anticoagular.</li><li>No sedar salvo necesidad vital o agitación que impida asistencia segura.</li><li>No administrar corticoides.</li><li>No administrar manitol salvo situaciones extremas bajo indicación específica.</li><li>No bajar la TA de forma brusca salvo emergencia hipertensiva definida o protocolo local.</li></ul>"
    },
    {
      "h": "Transferencia al hospital",
      "b": "<p>La transferencia debe ser clara, breve y con datos de decisión terapéutica.</p><ul><li>Hora de inicio/última vez bien.</li><li>Cincinnati/NIHSS si disponible.</li><li>Glucemia y constantes.</li><li>Anticoagulación/antiagregación.</li><li>Situación funcional previa.</li><li>Tratamientos administrados.</li><li>Cambios durante el traslado.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Preparar monitor, aspiración y oxígeno.</li><li>Evitar broncoaspiración: no dar líquidos ni medicación oral si disfagia o alteración neurológica.</li><li>Reevaluar cada pocos minutos el déficit y nivel de conciencia.</li><li>Acompañar emocionalmente: explicar al paciente/familia que el tiempo es crítico.</li><li>Gestionar documentos, medicación y testigos para la anamnesis hospitalaria.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>No activar código ictus por mejoría parcial.</li><li>No recoger la hora de inicio.</li><li>Trasladar a un centro no útil si existe circuito ictus accesible.</li><li>Permitir hipotensión, hipoxia o hipoglucemia.</li><li>Dar medicación oral a un paciente con disfagia o bajo nivel de conciencia.</li></ul>"
    }
  ],
  "block": 4
},
{
  "id": "neuro-convulsiones-epilepsia-ingesa",
  "cat": "neuro",
  "especialidad": "Neurología / Urgencias / Críticos",
  "title": "Convulsiones y epilepsia",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neurológicas, 2013",
  "tags": "convulsion crisis epileptica epilepsia estatus epileptico benzodiacepina diazepam midazolam fenitoina hipoglucemia mordedura lengua postcritico",
  "summary": "Manejo de la crisis convulsiva y del estatus epiléptico: protección, ABC, glucemia, benzodiacepinas, tratamiento de causa y traslado.",
  "relations": {
    "patologias": [
      "Crisis epiléptica",
      "Epilepsia",
      "Estatus epiléptico",
      "Hipoglucemia",
      "Traumatismo craneal",
      "Ictus",
      "Meningitis"
    ],
    "farmacos": [
      "Diazepam",
      "Midazolam",
      "Fenitoína",
      "Glucosa",
      "Tiamina",
      "Oxígeno"
    ],
    "escalas": [
      "Glasgow",
      "AVDI",
      "Escala del dolor",
      "ABCDE"
    ],
    "tecnicas": [
      "Posición lateral de seguridad",
      "Aspiración de secreciones",
      "Canalización venosa",
      "Monitorización",
      "Glucemia capilar"
    ],
    "alertas": [
      "crisis >5 min",
      "crisis repetidas sin recuperación",
      "primera crisis",
      "embarazo",
      "fiebre/rigidez nuca",
      "trauma",
      "hipoglucemia",
      "estatus epiléptico"
    ]
  },
  "sec": [
    {
      "h": "Conceptos",
      "b": "<ul><li><b>Convulsión/crisis comicial:</b> episodio paroxístico por descarga neuronal anormal, excesiva e hipersincrónica.</li><li><b>Epilepsia:</b> enfermedad crónica con crisis recurrentes no provocadas.</li><li><b>Crisis provocada:</b> relacionada con hipoglucemia, fiebre, tóxicos, abstinencia, alteraciones iónicas, ictus, trauma o infección.</li><li><b>Estatus epiléptico:</b> crisis prolongada o crisis repetidas sin recuperación completa; debe tratarse como emergencia.</li></ul>"
    },
    {
      "h": "Durante la crisis",
      "b": "<ol><li>Proteger al paciente de golpes y retirar objetos peligrosos.</li><li>No sujetar con fuerza las extremidades.</li><li>No introducir objetos en la boca.</li><li>Controlar tiempo de inicio y duración.</li><li>Valorar vía aérea, respiración y coloración.</li><li>Cuando ceda, colocar en posición lateral de seguridad si no hay sospecha traumática relevante.</li></ol>"
    },
    {
      "h": "Valoración inmediata postcrítica",
      "b": "<ul><li>ABCDE, SatO₂, FR, FC, TA y temperatura.</li><li>Glucemia capilar obligatoria.</li><li>Glasgow y recuperación progresiva.</li><li>Buscar traumatismos, mordedura de lengua, incontinencia, fiebre, rigidez de nuca, focalidad neurológica.</li><li>Preguntar antecedentes de epilepsia, medicación, adherencia, consumo de alcohol/drogas, embarazo y enfermedades recientes.</li></ul>"
    },
    {
      "h": "Criterios de gravedad / traslado",
      "b": "<ul><li>Primera crisis.</li><li>Crisis prolongada o repetida.</li><li>No recuperación del nivel de conciencia.</li><li>Trauma, fiebre, rigidez de nuca, cefalea brusca o focalidad.</li><li>Embarazo o puerperio.</li><li>Paciente anticoagulado o inmunodeprimido.</li><li>Hipoglucemia, intoxicación o alteración metabólica.</li><li>Déficit neurológico persistente tras la crisis.</li></ul>"
    },
    {
      "h": "Tratamiento inicial",
      "b": "<ul><li>Oxígeno si hipoxemia, cianosis, crisis prolongada o compromiso ventilatorio.</li><li>Aspirar secreciones si obstruyen vía aérea.</li><li>Canalizar vía venosa si posible sin retrasar tratamiento.</li><li>Corregir hipoglucemia si presente.</li><li>Si crisis activa prolongada: benzodiacepina según protocolo.</li><li>Si persiste o recurre: segunda línea con antiepiléptico, habitualmente fenitoína/levetiracetam/valproato según protocolo local y contexto.</li></ul>"
    },
    {
      "h": "Farmacología orientativa del manual",
      "b": "<ul><li><b>Diazepam IV</b> en bolos para crisis activa según protocolo.</li><li><b>Midazolam</b> puede usarse por vía IV/IM/bucal/intranasal según recursos y protocolo.</li><li><b>Fenitoína:</b> el manual menciona 18 mg/kg IV en crisis persistentes o repetidas.</li><li><b>Glucosa</b> si hipoglucemia; en pacientes desnutridos/alcohólicos, considerar tiamina previa según protocolo.</li></ul><p>Revisar dosis actuales y vías disponibles antes de uso clínico.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Cronometrar crisis y registrar tipo de movimientos, mirada, inicio focal/generalizado y recuperación.</li><li>Preparar oxígeno, aspiración, cánula orofaríngea solo cuando no haya reflejo nauseoso y material de vía aérea.</li><li>Proteger intimidad y seguridad.</li><li>Control seriado de Glasgow y constantes.</li><li>Vigilar depresión respiratoria tras benzodiacepinas.</li><li>Transferir duración, número de crisis, fármacos, glucemia, respuesta y focalidad.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Meter objetos en la boca.</li><li>Ignorar hipoglucemia.</li><li>No medir la duración real de la crisis.</li><li>Dar altas o dejar en domicilio una primera crisis sin valoración.</li><li>Repetir benzodiacepinas sin vigilar ventilación.</li><li>No pensar en eclampsia si gestante o puérpera convulsiona.</li></ul>"
    }
  ],
  "block": 4
},
{
  "id": "neuro-sindrome-meningeo-ingesa",
  "cat": "neuro",
  "especialidad": "Neurología / Infecciosas / Urgencias",
  "title": "Síndrome meníngeo. Manejo prehospitalario",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neurológicas, 2013",
  "tags": "sindrome meningeo meningitis meningoencefalitis rigidez nuca fiebre cefalea vomitos petequias fotofobia kernig brudzinski sepsis aislamiento",
  "summary": "Sospecha y manejo inicial del síndrome meníngeo con prioridad a ABC, detección de sepsis, aislamiento, tratamiento precoz y traslado urgente.",
  "relations": {
    "patologias": [
      "Meningitis bacteriana",
      "Meningitis viral",
      "Meningoencefalitis",
      "Sepsis meningocócica",
      "Hemorragia subaracnoidea"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Antitérmicos",
      "Benzodiacepinas si convulsión",
      "Antibióticos según protocolo",
      "Corticoides según protocolo"
    ],
    "escalas": [
      "Glasgow",
      "ABCDE",
      "qSOFA",
      "Escala de sepsis"
    ],
    "tecnicas": [
      "Aislamiento respiratorio/gotas",
      "Monitorización",
      "Canalización venosa",
      "Control térmico",
      "Transferencia urgente"
    ],
    "alertas": [
      "fiebre + cefalea",
      "rigidez de nuca",
      "petequias",
      "confusión",
      "convulsiones",
      "shock",
      "focalidad",
      "inmunodepresión"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>El síndrome meníngeo es el conjunto de síntomas y signos que indican irritación de las meninges. La meningitis es la inflamación de las meninges; si afecta al parénquima cerebral se habla de meningoencefalitis.</p><ul><li>Puede ser infeccioso o no infeccioso.</li><li>En prehospitalaria importa reconocerlo, detectar gravedad y trasladar de forma urgente.</li><li>La meningitis bacteriana y la sepsis meningocócica son emergencias tiempo-dependientes.</li></ul>"
    },
    {
      "h": "Etiología orientativa",
      "b": "<ul><li><b>Infecciosa:</b> meningococo, neumococo, H. influenzae, listeria, bacilos gramnegativos, virus herpes y otros, según edad e inmunidad.</li><li><b>No infecciosa:</b> hemorragia subaracnoidea, tumores, enfermedades autoinmunes, sarcoidosis, delirium tremens u otras causas irritativas.</li></ul>"
    },
    {
      "h": "Cuándo sospechar meningismo",
      "b": "<ul><li>Cefalea intensa, aguda y persistente.</li><li>Fiebre.</li><li>Náuseas y vómitos.</li><li>Fotofobia.</li><li>Rigidez de nuca.</li><li>Confusión, somnolencia o coma.</li><li>Petequias o púrpura.</li><li>Convulsiones.</li><li>Focalidad neurológica o afectación de pares craneales.</li></ul>"
    },
    {
      "h": "Signos físicos",
      "b": "<ul><li><b>Rigidez de nuca:</b> resistencia dolorosa a la flexión pasiva del cuello.</li><li><b>Kernig:</b> dolor/resistencia al extender rodilla con cadera flexionada.</li><li><b>Brudzinski:</b> flexión involuntaria de caderas/rodillas al flexionar cuello.</li><li>La ausencia de signos meníngeos no descarta meningitis, especialmente en ancianos, niños pequeños o inmunodeprimidos.</li></ul>"
    },
    {
      "h": "Valoración ABCDE",
      "b": "<ol><li><b>A/B:</b> vía aérea y oxigenación; vigilar disminución de conciencia y riesgo de broncoaspiración.</li><li><b>C:</b> TA, FC, perfusión, relleno capilar; buscar shock séptico.</li><li><b>D:</b> Glasgow, pupilas, focalidad, convulsiones y glucemia.</li><li><b>E:</b> fiebre, petequias, púrpura, signos de infección y exposición controlada.</li></ol>"
    },
    {
      "h": "Actuación prehospitalaria",
      "b": "<ol><li>Medidas de aislamiento por gotas si sospecha de meningitis bacteriana/meningococo.</li><li>ABCDE y soporte vital si precisa.</li><li>Oxígeno si hipoxemia o compromiso.</li><li>Vía venosa y cristaloides si shock o hipoperfusión.</li><li>Antitérmicos y medidas físicas prudentes si fiebre alta.</li><li>Control de convulsiones con benzodiacepinas si aparecen.</li><li>Antibioterapia precoz si protocolo local lo contempla y no retrasa traslado.</li><li>Traslado urgente con preaviso.</li></ol>"
    },
    {
      "h": "Diferenciales críticos",
      "b": "<ul><li><b>Hemorragia subaracnoidea:</b> cefalea súbita explosiva, vómitos, rigidez nuca, pérdida de conciencia.</li><li><b>Sepsis meningocócica:</b> fiebre, petequias/púrpura, shock, mal estado general.</li><li><b>Encefalitis:</b> fiebre, alteración conductual, convulsiones, focalidad.</li><li><b>Intoxicación o trastorno metabólico:</b> coma/confusión sin fiebre ni rigidez clara.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Protección del equipo: mascarilla y medidas de aislamiento según protocolo.</li><li>Control de constantes, Glasgow, temperatura y piel.</li><li>Buscar petequias/púrpura y marcar evolución si protocolo.</li><li>Preparar material de RCP, oxígeno, vía venosa y medicación anticonvulsivante.</li><li>Registrar hora de inicio, fiebre, exantema, antibióticos previos y contactos.</li><li>Informar al centro receptor de sospecha infecciosa para aislamiento inmediato.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Retrasar traslado por intentar confirmar signos meníngeos clásicos.</li><li>No aislar al paciente con sospecha meningocócica.</li><li>Ignorar petequias o púrpura.</li><li>No controlar glucemia en paciente confuso o convulsionando.</li><li>Dar medicación oral si bajo nivel de conciencia.</li></ul>"
    }
  ],
  "block": 4
},
{
  "id": "neuro-convulsion-gestante-ingesa",
  "cat": "obst",
  "especialidad": "Obstetricia / Neurología / Urgencias",
  "title": "Convulsión en mujer gestante",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neurológicas, 2013",
  "tags": "convulsion gestante embarazo eclampsia preeclampsia sulfato magnesio benzodiacepinas lateral izquierdo hipertension proteinuria hellp puerperio",
  "summary": "Manejo extrahospitalario de la convulsión en gestante, priorizando eclampsia hasta demostrar otra causa, ABC, posición lateral izquierda y sulfato de magnesio según protocolo.",
  "relations": {
    "patologias": [
      "Eclampsia",
      "Preeclampsia grave",
      "HELLP",
      "Epilepsia",
      "Hipoglucemia",
      "Ictus",
      "Meningitis"
    ],
    "farmacos": [
      "Sulfato de magnesio",
      "Gluconato cálcico",
      "Labetalol",
      "Hidralazina",
      "Nifedipino",
      "Diazepam",
      "Midazolam",
      "Oxígeno"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "TA en embarazo"
    ],
    "tecnicas": [
      "Decúbito lateral izquierdo",
      "Monitorización materna",
      "Control de vía aérea",
      "Canalización venosa",
      "Preaviso obstétrico"
    ],
    "alertas": [
      "gestante >20 semanas",
      "puerperio",
      "TA elevada",
      "cefalea",
      "fotopsias",
      "dolor epigástrico",
      "convulsión recurrente",
      "coma"
    ]
  },
  "sec": [
    {
      "h": "Principio clave",
      "b": "<p>Toda convulsión en una gestante de más de 20 semanas o en puerperio debe considerarse <b>eclampsia hasta demostrar lo contrario</b>, aunque existan antecedentes de epilepsia. Es una emergencia materno-fetal.</p>"
    },
    {
      "h": "Causas posibles",
      "b": "<ul><li><b>Eclampsia/preeclampsia:</b> la más importante por riesgo materno-fetal.</li><li>Epilepsia conocida o mala adherencia antiepiléptica.</li><li>Hipoglucemia, hipoxia, tóxicos, abstinencia.</li><li>Ictus, hemorragia intracraneal, trombosis venosa cerebral.</li><li>Meningitis/encefalitis o sepsis.</li><li>Trauma craneal.</li></ul>"
    },
    {
      "h": "Signos que orientan a eclampsia/preeclampsia",
      "b": "<ul><li>TA elevada.</li><li>Cefalea intensa.</li><li>Alteraciones visuales: fotopsias, visión borrosa, escotomas.</li><li>Dolor epigástrico o en hipocondrio derecho.</li><li>Náuseas/vómitos, hiperreflexia, clonus.</li><li>Edemas, oliguria o mal estado general.</li><li>Puerperio reciente, especialmente primeras 48 horas, aunque puede aparecer después.</li></ul>"
    },
    {
      "h": "Actuación durante la crisis",
      "b": "<ol><li>Proteger de traumatismos; no introducir nada en la boca.</li><li>Colocar en <b>decúbito lateral izquierdo</b> en cuanto sea posible para reducir compresión aortocava.</li><li>Asegurar vía aérea y administrar oxígeno.</li><li>Aspirar secreciones/vómitos si precisa.</li><li>Controlar duración de la crisis y constantes.</li><li>Canalizar vía venosa si es posible.</li></ol>"
    },
    {
      "h": "Tratamiento específico",
      "b": "<ul><li><b>Sulfato de magnesio</b> es el tratamiento de elección para prevenir y tratar crisis eclámpticas según protocolo.</li><li>Si no hay magnesio o la crisis no cede, pueden requerirse benzodiacepinas, vigilando depresión respiratoria materna y fetal.</li><li>Si hipertensión grave: antihipertensivos IV u oral de acción controlada según protocolo obstétrico.</li><li>Traslado urgente a centro con obstetricia/anestesia/neonatología.</li></ul>"
    },
    {
      "h": "Pauta orientativa de sulfato de magnesio",
      "b": "<ul><li>Protocolos actuales suelen usar carga IV 4-6 g en 15-20 min y mantenimiento 1-2 g/h.</li><li>Vigilar signos de toxicidad: pérdida de reflejos osteotendinosos, depresión respiratoria, somnolencia profunda, oliguria.</li><li>Antídoto: <b>gluconato cálcico</b> según protocolo.</li></ul><p>La pauta concreta debe seguir el protocolo obstétrico local.</p>"
    },
    {
      "h": "Control de la tensión arterial",
      "b": "<ul><li>Medir TA de forma seriada.</li><li>Si TA muy elevada y signos de gravedad, tratar para reducir riesgo de hemorragia cerebral, pero evitando descensos bruscos que comprometan perfusión uteroplacentaria.</li><li>Opciones habituales según protocolo: labetalol, hidralazina o nifedipino oral.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Proteger vía aérea, posición lateral izquierda y aspiración preparada.</li><li>Control de TA, FC, FR, SatO₂, Glasgow, diuresis si procede y reflejos si magnesio.</li><li>Preparar material de parto inminente si gestación avanzada y traslado largo.</li><li>Evitar estímulos excesivos: luz, ruido, maniobras innecesarias.</li><li>Transferir: semanas de gestación, TA, síntomas previos, duración de crisis, fármacos, respuesta, antecedentes y movimientos fetales si conocidos.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Asumir que es epilepsia conocida sin pensar en eclampsia.</li><li>No colocar en lateral izquierdo.</li><li>No vigilar toxicidad por magnesio.</li><li>Bajar la TA de forma brusca.</li><li>Retrasar el traslado a centro obstétrico útil.</li></ul>"
    }
  ],
  "block": 4
},
{
  "id": "neuro-coma-ingesa",
  "cat": "neuro",
  "especialidad": "Neurología / Urgencias / Críticos",
  "title": "Manejo urgente del paciente en coma",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neurológicas, 2013",
  "tags": "coma disminucion nivel conciencia glasgow pupilas hipoglucemia naloxona flumazenil tiamina glucosa herniacion hipoxia shock intoxicacion",
  "summary": "Aproximación estructurada al coma: descartar trauma, garantizar ABC, valorar Glasgow, glucemia, pupilas y tratar causas reversibles inmediatas.",
  "relations": {
    "patologias": [
      "Coma",
      "Hipoglucemia",
      "Intoxicación por opioides",
      "Intoxicación por benzodiacepinas",
      "Ictus",
      "Meningitis",
      "Sepsis",
      "Shock",
      "Herniación cerebral"
    ],
    "farmacos": [
      "Oxígeno",
      "Glucosa",
      "Tiamina",
      "Naloxona",
      "Flumazenil",
      "Diazepam si convulsión"
    ],
    "escalas": [
      "Glasgow",
      "AVDI",
      "Pupilas",
      "ABCDE"
    ],
    "tecnicas": [
      "Manejo de vía aérea",
      "Cánula de Guedel",
      "Aspiración de secreciones",
      "Glucemia capilar",
      "ECG",
      "Monitorización",
      "Restricción espinal si trauma"
    ],
    "alertas": [
      "Glasgow ≤8",
      "hipoglucemia",
      "miosis puntiforme",
      "anisocoria",
      "descerebración",
      "respiración anómala",
      "shock",
      "hipoxia"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>Coma es la disminución del nivel de conciencia en la que estímulos habituales no producen un grado normal de alerta. En extrahospitalaria el objetivo inicial es sostener funciones vitales y tratar causas reversibles inmediatas.</p>"
    },
    {
      "h": "Etiología orientativa",
      "b": "<ul><li><b>Con focalidad neurológica:</b> ACV, tumor, infección, trauma o trastorno metabólico con focalidad.</li><li><b>Con signos meníngeos:</b> meningitis, hemorragia subaracnoidea o encefalitis.</li><li><b>Sin focalidad ni meningismo:</b> intoxicaciones, trastornos metabólicos, sepsis o shock.</li><li><b>Traumático:</b> TCE, lesión cervical o politrauma.</li></ul>"
    },
    {
      "h": "Actitud inicial",
      "b": "<ol><li>Descartar origen psicógeno sin retrasar soporte vital.</li><li>Descartar trauma y aplicar restricción de movimientos espinales si TCE/cervical posible.</li><li>Garantizar ABC.</li><li>Valoración rápida: constantes, exploración, Glasgow, glucemia y ECG.</li><li>Si existe emergencia: convulsiones, emergencia hipertensiva, herniación, hipertermia/hipotermia, hipoglucemia, hipoxia, PCR, shock o sobredosis de opiáceos, tratar de inmediato.</li><li>Si no hay emergencia inmediata: valoración reglada.</li></ol>"
    },
    {
      "h": "ABCDE del coma",
      "b": "<ul><li><b>A:</b> abrir vía aérea, aspirar secreciones, retirar cuerpos extraños. Cánula de Guedel si no hay reflejo nauseoso.</li><li><b>B:</b> oxígeno a alto flujo; ventilación asistida si apnea, hipoventilación o SatO₂ baja.</li><li><b>C:</b> pulso, TA, perfusión, ECG, vía venosa.</li><li><b>D:</b> Glasgow, pupilas, glucemia, focalidad, convulsiones, rigidez nuca.</li><li><b>E:</b> temperatura, signos de trauma, pinchazos, exantema, tóxicos, olor a alcohol, medicación.</li></ul>"
    },
    {
      "h": "Exploración neurológica",
      "b": "<ul><li>Nivel de conciencia: somnolencia, estupor, coma superficial o profundo.</li><li>Actitud/postura: asimetrías, decorticación o descerebración.</li><li>Pupilas: miosis, midriasis, anisocoria, reactividad a la luz.</li><li>Movimientos oculares y parpadeo.</li><li>Rigidez de nuca.</li><li>Patrón respiratorio.</li><li>Respuesta motora al dolor.</li></ul>"
    },
    {
      "h": "Signos de herniación",
      "b": "<ul><li>Descerebración: extensión y rotación interna de brazos.</li><li>Respiración anormal: Cheyne-Stokes, Biot u otros patrones.</li><li>Anisocoria.</li><li>Pupilas puntiformes o midriáticas arreactivas.</li><li>Deterioro progresivo del nivel de conciencia.</li></ul>"
    },
    {
      "h": "Medidas farmacológicas si causa desconocida",
      "b": "<p>El manual plantea que, si no se conoce ni se sospecha la etiología del coma, pueden administrarse tratamientos dirigidos a causas reversibles:</p><ul><li><b>Glucosa</b> si hipoglucemia o alta sospecha.</li><li><b>Naloxona</b> si sospecha de opiáceos: miosis, depresión respiratoria, contexto compatible.</li><li><b>Flumazenil</b> si sospecha clara de benzodiacepinas, con mucha prudencia por riesgo de convulsiones en dependientes o intoxicaciones mixtas.</li><li><b>Tiamina 100 mg</b> en desnutrición/alcoholismo antes o junto con glucosa según protocolo.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Preparar vía aérea, aspiración, oxígeno, BVM y monitor.</li><li>Glucemia capilar inmediata y registro.</li><li>Control seriado de Glasgow, pupilas, FR, SatO₂, TA, FC y temperatura.</li><li>Evitar broncoaspiración: lateralizar si no contraindicado y aspirar secreciones.</li><li>Buscar información: medicación, tóxicos, antecedentes, testigos, inicio brusco/progresivo.</li><li>Transferir hallazgos neurológicos, reversibles tratados, respuesta y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>No comprobar glucemia.</li><li>No proteger vía aérea en Glasgow bajo.</li><li>Administrar flumazenil de forma indiscriminada.</li><li>Olvidar trauma cervical si el coma aparece tras caída o accidente.</li><li>No reevaluar pupilas y Glasgow tras tratamiento.</li><li>No buscar sepsis, meningitis o shock como causa de coma.</li></ul>"
    }
  ],
  "block": 4
},
{
  "id": "pedia-sindrome-febril-ingesa",
  "cat": "pedia",
  "especialidad": "Pediatría / Urgencias",
  "title": "Síndrome febril en pediatría",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias pediátricas, 2013",
  "tags": "pediatria fiebre niño lactante fiebre sin foco sepsis meningitis petequias rigidez nuca paracetamol ibuprofeno antitermico mal estado general",
  "summary": "Valoración práctica del niño con fiebre: edad, aspecto general, foco, signos de alarma, tratamiento sintomático y criterios de derivación urgente.",
  "relations": {
    "patologias": [
      "Fiebre sin foco",
      "Infección viral",
      "Sepsis pediátrica",
      "Meningitis",
      "Neumonía",
      "Infección urinaria",
      "Otitis media",
      "Gastroenteritis",
      "Exantema febril"
    ],
    "farmacos": [
      "Paracetamol",
      "Ibuprofeno",
      "Suero fisiológico",
      "Antibióticos según protocolo",
      "Oxígeno si compromiso"
    ],
    "escalas": [
      "ABCDE pediátrico",
      "Triángulo de evaluación pediátrica",
      "Glasgow pediátrico",
      "Escala AVPU/AVDI",
      "Escala del dolor"
    ],
    "tecnicas": [
      "Medición de temperatura",
      "Glucemia capilar",
      "Monitorización",
      "Canalización venosa/intraósea",
      "Control térmico"
    ],
    "alertas": [
      "<3 meses",
      "mal estado general",
      "petequias/púrpura",
      "rigidez de nuca",
      "dificultad respiratoria",
      "relleno capilar lento",
      "somnolencia/irritabilidad",
      "convulsión",
      "deshidratación"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>Se considera fiebre la elevación de la temperatura, especialmente si la temperatura rectal supera 38 ºC. En pediatría suele ser consecuencia de una infección y, salvo excepciones, dura menos de una semana. En lactantes, la temperatura rectal es la más fiable, aunque en la práctica familiar se usa con frecuencia la axilar.</p><ul><li>La fiebre es un motivo muy frecuente de consulta urgente.</li><li>El manejo depende mucho de la edad, el estado general y la presencia o ausencia de foco.</li><li>La fiebre de pocas horas de evolución puede no mostrar aún el foco clínico.</li></ul>"
    },
    {
      "h": "Fiebre sin foco",
      "b": "<p>Fiebre sin foco es la temperatura ≥38 ºC sin cuadro catarral evidente, sin clínica respiratoria clara como taquipnea y sin proceso diarreico que explique el cuadro.</p><ul><li>En menores de 3 meses tiene especial importancia por mayor riesgo de infección bacteriana grave.</li><li>En lactantes y niños pequeños, valorar siempre aspecto general, hidratación, perfusión y respiración.</li><li>Un niño con buen aspecto puede deteriorarse; la reevaluación y la información a la familia son esenciales.</li></ul>"
    },
    {
      "h": "Valoración inicial: triángulo pediátrico + ABCDE",
      "b": "<ol><li><b>Apariencia:</b> tono, interacción, consolabilidad, mirada, llanto, respuesta a estímulos.</li><li><b>Respiración:</b> tiraje, quejido, aleteo nasal, cianosis, estridor, sibilancias o taquipnea.</li><li><b>Circulación cutánea:</b> palidez, moteado, cianosis, relleno capilar, temperatura distal.</li><li><b>ABCDE:</b> vía aérea, ventilación, circulación, estado neurológico y exposición completa buscando exantemas/petequias.</li></ol>"
    },
    {
      "h": "Anamnesis dirigida",
      "b": "<ul><li>Edad exacta, peso aproximado y calendario vacunal.</li><li>Tiempo de evolución y temperatura máxima.</li><li>Cómo se ha medido la temperatura y dónde.</li><li>Síntomas acompañantes: tos, dificultad respiratoria, vómitos, diarrea, dolor, rechazo de tomas, llanto inconsolable, somnolencia, irritabilidad, exantema.</li><li>Diuresis, ingesta y signos de deshidratación.</li><li>Medicaciones administradas, dosis y hora.</li><li>Antecedentes: prematuridad, inmunodepresión, cardiopatía, nefropatía, enfermedades crónicas.</li></ul>"
    },
    {
      "h": "Signos de alarma",
      "b": "<ul><li>Menor de 3 meses con fiebre.</li><li>Mal estado general, irritabilidad inconsolable o somnolencia marcada.</li><li>Petequias, púrpura o exantema que no blanquea.</li><li>Rigidez de nuca, fontanela abombada, fotofobia o cefalea intensa.</li><li>Dificultad respiratoria, quejido, cianosis o SatO₂ baja.</li><li>Relleno capilar lento, piel moteada, extremidades frías o hipotensión.</li><li>Convulsión, alteración del nivel de conciencia o signos neurológicos.</li><li>Deshidratación moderada-grave: mucosas secas, ojos hundidos, llanto sin lágrimas, oliguria.</li></ul>"
    },
    {
      "h": "Actuación inicial",
      "b": "<ol><li>Valorar gravedad con triángulo pediátrico y ABCDE.</li><li>Si aspecto tóxico, shock, dificultad respiratoria o alteración neurológica: oxígeno, monitorización, vía venosa/intraósea si precisa y traslado urgente.</li><li>Si estable: explorar por sistemas buscando foco.</li><li>Control térmico y confort: retirar exceso de abrigo, ambiente templado e hidratación oral si tolera.</li><li>Antitérmico si malestar, dolor o fiebre elevada, ajustado a peso.</li><li>Informar a la familia de signos de alarma y necesidad de reevaluación.</li></ol>"
    },
    {
      "h": "Antitérmicos orientativos",
      "b": "<ul><li><b>Paracetamol:</b> opción habitual en lactantes y niños; ajustar siempre a peso y presentación.</li><li><b>Ibuprofeno:</b> útil si no hay contraindicación; evitar en deshidratación importante, insuficiencia renal, vómitos persistentes o lactantes pequeños según protocolo local.</li><li>No alternar antitérmicos de forma automática sin una pauta clara: aumenta riesgo de errores de dosis.</li><li>El objetivo no es normalizar el número, sino mejorar confort y detectar gravedad.</li></ul><p><b>Nota:</b> la dosis exacta debe validarse con calculadora pediátrica/protocolo local antes de administrar.</p>"
    },
    {
      "h": "Criterios de derivación urgente",
      "b": "<ul><li>Todo menor de 3 meses con fiebre.</li><li>Signos de sepsis, meningitis, shock o dificultad respiratoria.</li><li>Convulsión o alteración del nivel de conciencia.</li><li>Petequias/púrpura.</li><li>Deshidratación relevante o imposibilidad para hidratación oral.</li><li>Inmunodepresión, enfermedad crónica importante o mal control familiar/social.</li><li>Fiebre persistente con mal estado general o sin foco claro y riesgo clínico.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Medir y registrar temperatura, método y hora.</li><li>Tomar peso o estimarlo para calcular dosis.</li><li>Valorar ingesta, diuresis y signos de deshidratación.</li><li>Controlar dolor/malestar antes y después del antitérmico.</li><li> piel completa: petequias, púrpura, exantemas, perfusión.</li><li>Educar a la familia: dosis correctas, no sobreabrigar, hidratación y signos de alarma.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Tratar solo la temperatura y no valorar el aspecto general.</li><li>No pesar al niño antes de medicar.</li><li>Infravalorar fiebre en menor de 3 meses.</li><li>No explorar piel completa.</li><li>Alternar antitérmicos sin pauta clara.</li><li>No dar instrucciones de alarma a la familia.</li></ul>"
    }
  ],
  "block": 5
},
{
  "id": "pedia-convulsiones-ingesa",
  "cat": "pedia",
  "especialidad": "Pediatría / Neurología / Urgencias",
  "title": "Convulsiones en pediatría",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias pediátricas, 2013",
  "tags": "convulsion pediatria convulsion febril estatus epileptico niño lactante recien nacido diazepam midazolam fenobarbital fenitoina hipoglucemia fiebre",
  "summary": "Manejo del niño con convulsión: proteger, ABC, glucemia, diferenciar crisis febril simple/complex, tratar crisis prolongada y detectar causas graves.",
  "relations": {
    "patologias": [
      "Convulsión febril",
      "Estatus epiléptico",
      "Epilepsia infantil",
      "Hipoglucemia",
      "Meningitis",
      "TCE",
      "Intoxicación",
      "Convulsión neonatal"
    ],
    "farmacos": [
      "Diazepam",
      "Midazolam",
      "Fenobarbital",
      "Fenitoína",
      "Valproato",
      "Glucosa",
      "Oxígeno"
    ],
    "escalas": [
      "ABCDE pediátrico",
      "Glasgow pediátrico",
      "AVDI/AVPU",
      "Escala del dolor"
    ],
    "tecnicas": [
      "Posición lateral de seguridad",
      "Aspiración",
      "Glucemia capilar",
      "Canalización venosa/intraósea",
      "Monitorización"
    ],
    "alertas": [
      "crisis >5 min",
      "crisis repetidas",
      "no recuperación",
      "menor de 6 meses",
      "focalidad",
      "meningismo",
      "TCE",
      "hipoglucemia",
      "neonato"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La convulsión en pediatría es una urgencia frecuente. Puede ser febril, epiléptica, metabólica, infecciosa, tóxica, traumática o neonatal. La prioridad inicial es evitar hipoxia, trauma, broncoaspiración e identificar causas reversibles como hipoglucemia.</p>"
    },
    {
      "h": "Durante la crisis",
      "b": "<ol><li>Proteger al niño de golpes y caídas.</li><li>No sujetar con fuerza ni intentar detener los movimientos.</li><li>No introducir objetos en la boca.</li><li>Colocar de lado cuando sea posible y seguro.</li><li>Aspirar secreciones/vómitos si comprometen vía aérea.</li><li>Controlar tiempo exacto de inicio y duración.</li><li>Administrar oxígeno si cianosis, SatO₂ baja, crisis prolongada o dificultad respiratoria.</li></ol>"
    },
    {
      "h": "Valoración ABCDE",
      "b": "<ul><li><b>A/B:</b> vía aérea permeable, respiración, SatO₂, cianosis, secreciones.</li><li><b>C:</b> pulso, perfusión, relleno capilar, TA si posible.</li><li><b>D:</b> glucemia capilar, Glasgow/AVDI, pupilas, focalidad, duración de crisis.</li><li><b>E:</b> temperatura, signos de trauma, exantema, petequias, rigidez de nuca, tóxicos o medicación accesible.</li></ul>"
    },
    {
      "h": "Convulsión febril",
      "b": "<ul><li>Aparece habitualmente entre 6 meses y 5 años asociada a fiebre.</li><li><b>Simple:</b> generalizada, dura menos de 15 minutos, no recurre en 24 horas y recuperación completa.</li><li><b>Compleja:</b> focal, duración prolongada, repetida en 24 horas o recuperación incompleta.</li><li>La convulsión febril simple suele tener buen pronóstico, pero siempre debe valorarse el foco de fiebre y descartar meningitis/sepsis si hay signos compatibles.</li></ul>"
    },
    {
      "h": "Criterios de gravedad",
      "b": "<ul><li>Crisis activa de más de 5 minutos.</li><li>Crisis repetidas sin recuperación completa.</li><li>Primera crisis o crisis atípica.</li><li>Menor de 6 meses o neonato.</li><li>Focalidad neurológica, rigidez de nuca, petequias, mal estado general.</li><li>TCE, intoxicación, hipoglucemia o sospecha de infección del SNC.</li><li>Persistencia de bajo nivel de conciencia tras fase postcrítica esperable.</li></ul>"
    },
    {
      "h": "Tratamiento de crisis prolongada",
      "b": "<ul><li>Si la crisis dura más de 5 minutos o no cede espontáneamente: benzodiacepina según vía disponible y protocolo.</li><li><b>Diazepam rectal/IV</b> o <b>midazolam bucal/intranasal/IM/IV</b> son opciones habituales, ajustadas a peso.</li><li>Si persiste: antiepiléptico de segunda línea por equipo médico, como fenitoína, levetiracetam, valproato o fenobarbital según edad, contexto y protocolo local.</li><li>Vigilar depresión respiratoria tras benzodiacepinas.</li></ul>"
    },
    {
      "h": "Convulsión en recién nacido",
      "b": "<p>El manual diferencia crisis ocasionales por agresión del sistema nervioso central, TCE, encefalopatía hipóxico-isquémica, infecciones, trastornos metabólicos o hemorragias, y crisis en recién nacido con epilepsia conocida o no conocida.</p><ul><li>Actuación: monitorización, vía aérea permeable, oxígeno, vía periférica y valoración especializada.</li><li>Tratamiento descrito en el manual: fenobarbital IV como carga; si no cede, fenitoína; después valproato IV y perfusión de midazolam si persiste, siempre bajo indicación médica.</li></ul>"
    },
    {
      "h": "Tras la crisis",
      "b": "<ul><li>Colocar en posición lateral si no hay sospecha traumática/cervical.</li><li>Reevaluar ABC, SatO₂, glucemia, temperatura y Glasgow.</li><li> lesiones por caída, mordedura de lengua, incontinencia y signos de infección.</li><li>Preguntar antecedentes, vacunas, medicación antiepiléptica, fiebre, tóxicos y duración real.</li><li>No forzar ingesta hasta recuperación neurológica completa.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Cronometrar y registrar la crisis: inicio, duración, tipo de movimientos, focalidad, coloración y recuperación.</li><li>Tomar peso para medicación.</li><li>Preparar oxígeno, aspiración, BVM y medicación anticonvulsivante.</li><li>Controlar glucemia y temperatura.</li><li>Acompañar y tranquilizar a la familia explicando lo que se está haciendo.</li><li>Transferir: duración, número de crisis, fiebre, glucemia, tratamiento, respuesta y fase postcrítica.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Introducir objetos en la boca.</li><li>No medir glucemia.</li><li>No controlar la duración exacta.</li><li>Repetir benzodiacepinas sin vigilar respiración.</li><li>Asumir que toda convulsión con fiebre es benigna.</li><li>Olvidar meningitis, sepsis, TCE, tóxicos o hipoglucemia.</li></ul>"
    }
  ],
  "block": 5
},
{
  "id": "pedia-crisis-asmatica-nino-ingesa",
  "cat": "pedia",
  "especialidad": "Pediatría / Respiratorio / Urgencias",
  "title": "Crisis asmática en el niño",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias pediátricas, 2013",
  "tags": "asma pediatrica crisis asmatica niño sibilancias disnea salbutamol ipratropio prednisolona corticoide oxigeno saturacion torax silente bronquiolitis laringitis",
  "summary": "Valoración de gravedad y tratamiento escalonado de la crisis asmática pediátrica, con broncodilatadores, oxígeno, corticoides y criterios de traslado.",
  "relations": {
    "patologias": [
      "Asma infantil",
      "Crisis asmática",
      "Bronquiolitis",
      "Laringitis",
      "Neumonía",
      "Cuerpo extraño bronquial",
      "Anafilaxia"
    ],
    "farmacos": [
      "Salbutamol",
      "Bromuro de ipratropio",
      "Prednisolona",
      "Dexametasona",
      "Metilprednisolona",
      "Sulfato de magnesio",
      "Oxígeno"
    ],
    "escalas": [
      "ABCDE pediátrico",
      "SatO₂",
      "Valoración de gravedad asmática",
      "Triángulo de evaluación pediátrica"
    ],
    "tecnicas": [
      "Inhalador con cámara",
      "Nebulización con oxígeno",
      "Monitorización",
      "VMNI si protocolo",
      "Canalización venosa/intraósea"
    ],
    "alertas": [
      "SatO₂ <91%",
      "tórax silente",
      "cianosis",
      "incapacidad para hablar",
      "agotamiento",
      "confusión",
      "bradicardia",
      "movimiento paradójico toracoabdominal"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>El asma es una enfermedad inflamatoria crónica de la vía aérea, caracterizada por episodios de tos, dificultad respiratoria, sibilancias y opresión torácica. Las crisis suelen ser reversibles, pero pueden ser potencialmente fatales si evolucionan a agotamiento respiratorio.</p>"
    },
    {
      "h": "Diagnóstico diferencial, especialmente en primer episodio",
      "b": "<ul><li><b>Bronquiolitis:</b> frecuente en lactantes, primer episodio con infección viral y crepitantes/sibilancias.</li><li><b>Laringitis:</b> disfonía, estridor inspiratorio y tos perruna, a menudo nocturna.</li><li><b>Neumonía:</b> fiebre, focalidad auscultatoria, dolor, afectación general.</li><li><b>Cuerpo extraño bronquial:</b> inicio brusco, tos/atragantamiento, asimetría ventilatoria.</li><li><b>Hiperventilación/cetoacidosis:</b> respiración rápida sin broncoespasmo típico, contexto metabólico o psicógeno.</li><li><b>Anafilaxia:</b> broncoespasmo con urticaria, edema, hipotensión o exposición alergénica.</li></ul>"
    },
    {
      "h": "Valoración de gravedad",
      "b": "<ul><li><b>Leve:</b> habla frases, camina/se tumba, SatO₂ generalmente >95 %, sibilancias al final de la espiración, poca o nula musculatura accesoria.</li><li><b>Moderada:</b> dificultad para hablar frases largas, prefiere sentarse, tiraje, SatO₂ 91-95 %, taquicardia y sibilancias espiratorias.</li><li><b>Grave:</b> disnea en reposo, frases cortas o palabras, lactante no come, agitación intensa, SatO₂ <91 %, tiraje marcado, sibilancias inspiratorias y espiratorias.</li><li><b>Parada inminente:</b> confusión, agotamiento, tórax silente, cianosis, bradicardia o movimientos paradójicos toracoabdominales.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A:</b> vía aérea; descartar estridor/cuerpo extraño.</li><li><b>B:</b> FR, SatO₂, tiraje, habla/llanto, auscultación y silencio auscultatorio.</li><li><b>C:</b> FC, perfusión, relleno capilar, TA si gravedad.</li><li><b>D:</b> conciencia, agitación, confusión o somnolencia.</li><li><b>E:</b> fiebre, exantema/urticaria, signos de infección, desencadenantes.</li></ol>"
    },
    {
      "h": "Tratamiento inicial",
      "b": "<ul><li>Posición de confort, normalmente incorporado.</li><li>Oxígeno para mantener saturación adecuada, especialmente si SatO₂ <94-95 % o trabajo respiratorio.</li><li>Salbutamol inhalado con cámara o nebulizado según gravedad y colaboración.</li><li>En crisis moderada-grave: añadir bromuro de ipratropio en las primeras nebulizaciones según protocolo.</li><li>Corticoide sistémico precoz si crisis moderada-grave o mala respuesta inicial.</li><li>Reevaluar tras cada ciclo: SatO₂, FR, tiraje, habla, auscultación y estado mental.</li></ul>"
    },
    {
      "h": "Tratamiento según gravedad",
      "b": "<ul><li><b>Leve:</b> salbutamol con cámara, reevaluación y educación.</li><li><b>Moderada:</b> salbutamol repetido + corticoide oral; valorar ipratropio y oxígeno.</li><li><b>Grave:</b> oxígeno, salbutamol nebulizado repetido o continuo según protocolo, ipratropio, corticoide sistémico, monitorización y traslado.</li><li><b>Parada inminente:</b> soporte ventilatorio, ayuda avanzada, vía venosa/intraósea, considerar magnesio IV/adrenalina si anafilaxia, preparación de vía aérea avanzada.</li></ul>"
    },
    {
      "h": "Farmacología orientativa",
      "b": "<ul><li><b>Salbutamol:</b> broncodilatador beta-2 de acción corta; ajustar a peso/edad y dispositivo.</li><li><b>Ipratropio:</b> útil asociado en crisis moderadas-graves.</li><li><b>Corticoide sistémico:</b> prednisolona/dexametasona VO o metilprednisolona IV si no tolera oral o crisis grave.</li><li><b>Sulfato de magnesio IV:</b> opción en crisis grave con mala respuesta, bajo indicación médica.</li><li><b>Oxígeno:</b> usar como gas impulsor de nebulización si hipoxemia.</li></ul><p>Las dosis deben calcularse siempre por peso con calculadora pediátrica/protocolo local.</p>"
    },
    {
      "h": "Criterios de traslado/ingreso",
      "b": "<ul><li>Crisis grave o parada inminente.</li><li>SatO₂ baja persistente o necesidad de oxígeno.</li><li>Mala respuesta a broncodilatadores iniciales.</li><li>Uso importante de musculatura accesoria, agotamiento o alteración de conciencia.</li><li>Antecedente de ingreso en UCI/intubación por asma.</li><li>Comorbilidad relevante o dificultad para manejo en domicilio.</li><li>Sospecha de diagnóstico alternativo: cuerpo extraño, neumonía, anafilaxia.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Valorar y registrar gravedad antes/después de cada intervención.</li><li>Comprobar técnica inhalatoria y uso de cámara.</li><li>Monitorizar SatO₂, FR, FC, tiraje, habla y nivel de conciencia.</li><li>Preparar oxígeno, nebulizador/cámara, medicación y vía venosa si grave.</li><li>Vigilar efectos adversos: taquicardia, temblor, hipopotasemia si dosis repetidas.</li><li>Educar: plan de acción, técnica, signos de alarma y cuándo consultar.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Infravalorar un tórax silente: puede indicar obstrucción crítica.</li><li>Esperar a cianosis para considerar gravedad.</li><li>No dar corticoide precoz en crisis moderada-grave.</li><li>No reevaluar tras broncodilatador.</li><li>Confundir laringitis/cuerpo extraño/anafilaxia con asma.</li><li>No calcular dosis por peso.</li></ul>"
    }
  ],
  "block": 5
},
{
  "id": "endo-paciente-diabetico-ingesa",
  "cat": "endo",
  "especialidad": "Endocrinología / Urgencias / Críticos",
  "title": "Urgencias en el paciente diabético",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias endocrino-metabólicas, 2013",
  "tags": "diabetes hipoglucemia cetoacidosis diabética CAD glucemia capilar whipple insulina glucosa glucagon cetonuria cetonemia kussmaul deshidratacion",
  "summary": "Manejo práctico de las dos urgencias diabéticas principales del bloque: hipoglucemia y cetoacidosis diabética, con enfoque ABCDE, glucemia, tratamiento rápido y traslado.",
  "relations": {
    "patologias": [
      "Hipoglucemia",
      "Cetoacidosis diabética",
      "Diabetes mellitus tipo 1",
      "Diabetes mellitus tipo 2",
      "Deshidratación",
      "Alteración del nivel de conciencia",
      "Shock séptico como desencadenante"
    ],
    "farmacos": [
      "Glucosa oral",
      "Glucosa IV",
      "Glucagón",
      "Insulina rápida",
      "Suero fisiológico 0,9 %",
      "Ringer lactato",
      "Potasio según protocolo hospitalario",
      "Antieméticos según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "AVDI",
      "Glucemia capilar",
      "Cetonuria/cetonemia"
    ],
    "tecnicas": [
      "Glucemia capilar",
      "Canalización venosa",
      "Monitorización ECG",
      "Control de cetonemia/cetonuria",
      "Fluidoterapia",
      "Transferencia estructurada"
    ],
    "alertas": [
      "glucemia <60 mg/dl capilar",
      "alteración de conciencia",
      "hipoglucemia en tratamiento con insulina/ADO",
      "glucemia 250-600 mg/dl + cetonas",
      "respiración de Kussmaul",
      "vómitos/deshidratación",
      "no iniciar insulina sin conocer potasio si CAD"
    ]
  },
  "sec": [
    {
      "h": "Objetivo",
      "b": "<p>En el paciente diabético, las urgencias metabólicas pueden evolucionar rápido. El objetivo es reconocer si estamos ante <b>hipoglucemia</b> o ante <b>cetoacidosis diabética</b>, corregir lo reversible, evitar daño neurológico o hemodinámico y trasladar si hay criterios de gravedad.</p>"
    },
    {
      "h": "Hipoglucemia: definición",
      "b": "<p>El manual define la hipoglucemia mediante la <b>tríada de Whipple</b>:</p><ul><li>Glucemia capilar &lt;60 mg/dl y/o glucemia venosa &lt;70 mg/dl.</li><li>Presencia de síntomas vegetativos y clínica neurológica.</li><li>Desaparición de la clínica al normalizar la glucemia.</li></ul><p>Es la complicación aguda más frecuente del tratamiento farmacológico de la diabetes y puede ser una urgencia vital.</p>"
    },
    {
      "h": "Hipoglucemia: clasificación",
      "b": "<ul><li><b>Leve:</b> síntomas sin interferir de forma importante con la actividad diaria.</li><li><b>Moderada:</b> afectación neurológica, pero el paciente todavía puede autotratarse por vía oral.</li><li><b>Grave:</b> alteración del nivel de conciencia que impide usar vía oral y requiere ayuda para recuperar glucemia normal.</li></ul>"
    },
    {
      "h": "Hipoglucemia: causas frecuentes",
      "b": "<ul><li>Exceso de dosis de insulina o antidiabéticos orales.</li><li>Insuficiencia renal o hepática que prolonga vida media de fármacos.</li><li>Mala técnica de administración de insulina.</li><li>Omisión o retraso de comidas.</li><li>Menor ingesta de hidratos de carbono.</li><li>Ejercicio físico o enfermedad/estrés intercurrente.</li><li>Alcohol y otras drogas.</li><li>Alteraciones endocrinas o sistémicas: hipotiroidismo, insuficiencia suprarrenal, hepatopatía, shock séptico, insuficiencia renal crónica.</li></ul>"
    },
    {
      "h": "Hipoglucemia: clínica",
      "b": "<ul><li><b>Fase autonómica/adrenérgica:</b> palpitaciones, nerviosismo, palidez, temblor, sudoración, hambre, ansiedad.</li><li><b>Fase neuroglucopénica:</b> cefalea, dificultad para concentrarse, visión borrosa, conducta extraña, somnolencia, confusión, convulsiones o coma.</li><li>Puede pasar desapercibida si neuropatía autonómica o tratamiento con betabloqueantes.</li></ul>"
    },
    {
      "h": "Hipoglucemia: actuación paso a paso",
      "b": "<ol><li>ABCDE y seguridad del paciente.</li><li>Glucemia capilar inmediata ante cualquier alteración neurológica, síncope, convulsión, agitación, sudoración o diabético con clínica inespecífica.</li><li>Si consciente y puede tragar: administrar hidratos de absorción rápida por vía oral.</li><li>Reevaluar glucemia y clínica a los 10-15 minutos.</li><li>Si bajo nivel de conciencia, convulsión o imposibilidad de vía oral: glucosa IV si vía disponible o glucagón IM/SC/IN según recursos y protocolo.</li><li>Cuando recupere, dar hidratos de absorción lenta si puede tragar y buscar causa.</li><li>Traslado si hipoglucemia grave, sulfonilureas, recurrencia, causa no clara, paciente vulnerable o mala recuperación.</li></ol>"
    },
    {
      "h": "Cetoacidosis diabética: cuándo sospechar",
      "b": "<p>La CAD es una urgencia metabólica por déficit absoluto o relativo de insulina, hiperglucemia, cetosis y acidosis. En extrahospitalaria se sospecha por clínica compatible y pruebas disponibles.</p><ul><li>Glucemia habitualmente elevada, a menudo 250-600 mg/dl.</li><li>Cetonuria o cetonemia positiva.</li><li>Poliuria, polidipsia, pérdida de peso, vómitos, dolor abdominal.</li><li>Deshidratación, hipotensión, taquicardia.</li><li>Respiración de Kussmaul y aliento cetósico.</li><li>Somnolencia, confusión o coma en formas graves.</li></ul>"
    },
    {
      "h": "CAD: desencadenantes",
      "b": "<ul><li>Debut diabético, especialmente DM1.</li><li>Omisión o fallo en administración de insulina.</li><li>Infección.</li><li>IAM, ictus, cirugía, trauma u otra enfermedad aguda.</li><li>Fármacos o consumo de tóxicos.</li><li>Problemas sociales, técnica incorrecta o falta de material.</li></ul>"
    },
    {
      "h": "CAD: actuación inicial",
      "b": "<ol><li>ABCDE, nivel de conciencia y constantes.</li><li>Glucemia capilar y cetonemia/cetonuria si disponible.</li><li>Monitorización ECG, SatO₂, TA, FC y FR.</li><li>Canalizar vía venosa y comenzar reposición con suero fisiológico 0,9 % si deshidratación o compromiso hemodinámico.</li><li>Valorar náuseas/vómitos y riesgo de broncoaspiración.</li><li>Buscar y tratar causa desencadenante si es posible sin retrasar traslado.</li><li>Traslado hospitalario para control analítico, potasio, gasometría, insulina IV y vigilancia.</li></ol>"
    },
    {
      "h": "Insulina y potasio en CAD",
      "b": "<p>La insulina IV corrige la cetosis, pero puede producir descenso rápido de potasio. Por eso la perfusión de insulina no debe iniciarse sin conocer o corregir potasio según protocolo. El manual recoge insulina rápida y señala que la perfusión no se iniciará hasta disponer de cifras de K.</p><ul><li>Objetivo de descenso de glucemia: progresivo, evitando bajadas excesivas.</li><li>El trastorno hidroelectrolítico se corrige en ámbito hospitalario.</li><li>En extrahospitalaria: fluidoterapia prudente, monitorización y traslado.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Glucemia capilar siempre que haya alteración neurológica o paciente diabético sintomático.</li><li>Registrar hora, valor de glucemia, tratamiento y respuesta.</li><li>Comprobar medicación: insulina, sulfonilureas, dosis, última comida, ejercicio, alcohol.</li><li>En CAD: vigilar respiración de Kussmaul, vómitos, deshidratación, diuresis y nivel de conciencia.</li><li>Doble chequeo de insulina: fármaco de alto riesgo; nunca abreviar “unidades” como “U”.</li><li>Transferir con glucemias seriadas, cetonas, volumen administrado, tratamientos y desencadenante sospechado.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>No medir glucemia en un paciente confuso, agitado, convulsionando o con coma.</li><li>Dar vía oral a un paciente con bajo nivel de conciencia.</li><li>No reevaluar glucemia tras tratamiento.</li><li>No pensar en sulfonilureas como causa de hipoglucemia prolongada/recurrente.</li><li>Iniciar insulina en CAD sin valorar potasio/protocolo.</li><li>Tratar la glucemia aislada y olvidar el estado hemodinámico, respiratorio y neurológico.</li></ul>"
    }
  ],
  "block": 6
},
{
  "id": "endo-enfermedades-tiroideas-ingesa",
  "cat": "endo",
  "especialidad": "Endocrinología / Urgencias / Críticos",
  "title": "Urgencias en enfermedades tiroideas",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias endocrino-metabólicas, 2013",
  "tags": "tiroides coma mixedematoso crisis tirotóxica tormenta tiroidea hipotiroidismo hipertiroidismo hipotermia hipertermia taquicardia bradicardia hidrocortisona UCI",
  "summary": "Reconocimiento y manejo inicial de las dos emergencias tiroideas: coma mixedematoso y crisis tirotóxica, ambas de alta mortalidad y necesidad de UCI.",
  "relations": {
    "patologias": [
      "Coma mixedematoso",
      "Crisis tirotóxica",
      "Hipotiroidismo severo",
      "Hipertiroidismo grave",
      "Enfermedad de Graves",
      "Insuficiencia cardiaca",
      "Sepsis como desencadenante"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Hidrocortisona",
      "Glucosa hipertónica",
      "Furosemida",
      "Betabloqueantes según protocolo",
      "Antitiroideos según protocolo",
      "Yodo/Lugol según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "Temperatura central",
      "ECG"
    ],
    "tecnicas": [
      "Soporte ventilatorio",
      "Calentamiento pasivo",
      "Monitorización ECG",
      "Canalización venosa",
      "Control térmico",
      "Preaviso UCI"
    ],
    "alertas": [
      "hipotermia + confusión en hipotiroideo",
      "bradicardia/hipoventilación",
      "hipertermia + taquicardia + agitación",
      "fiebre >38 ºC",
      "insuficiencia cardiaca",
      "alteración mental",
      "desencadenante infeccioso/cardiaco/quirúrgico"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>El manual identifica dos emergencias tiroideas: <b>coma mixedematoso</b> y <b>crisis tirotóxica</b>. Ambas requieren sospecha clínica precoz, soporte vital, tratamiento del desencadenante y traslado urgente, habitualmente a UCI.</p>"
    },
    {
      "h": "Coma mixedematoso: definición",
      "b": "<p>Es una emergencia médica debida a déficit severo de hormonas tiroideas, con disminución progresiva del nivel de conciencia, hipotermia y descompensación cardiovascular. El manual señala mortalidad elevada, hasta el 60 %.</p>"
    },
    {
      "h": "Coma mixedematoso: desencadenantes",
      "b": "<ul><li>Hipotiroidismo de larga evolución no tratado.</li><li>Abandono de tratamiento sustitutivo.</li><li>Infecciones, especialmente neumonía e infección urinaria.</li><li>Exposición al frío extremo, quemaduras.</li><li>Fármacos depresores del SNC.</li><li>Cirugía, anestesia, IAM, ACVA, insuficiencia cardiaca, hemorragia digestiva.</li><li>Hipoglucemia.</li></ul>"
    },
    {
      "h": "Coma mixedematoso: clínica",
      "b": "<ul><li>Síndrome confusional agudo, apatía, déficit de atención, bradipsiquia o coma.</li><li>Hipotermia &lt;35,5 ºC; si temperatura normal, sospechar infección o sepsis.</li><li>Hipoventilación de origen central e insuficiencia respiratoria global.</li><li>Hipotensión, bradicardia, bajo gasto cardiaco.</li><li>Hipoglucemia posible.</li><li>Facies mixedematosa: macroglosia, ptosis, edema periorbitario, piel fría, pálida y edematosa, pelo escaso/grueso.</li><li>Edemas sin fóvea.</li><li>ECG: bradicardia, bajo voltaje, alteraciones de T/ST, bloqueos o QT prolongado.</li></ul>"
    },
    {
      "h": "Coma mixedematoso: actuación inicial",
      "b": "<ol><li>ABCDE y valoración del deterioro progresivo del nivel de conciencia.</li><li>Asegurar vía aérea funcional; oxígeno y soporte ventilatorio si hipoventilación.</li><li>Monitorización ECG, TA, SatO₂, temperatura y glucemia.</li><li>Canalizar vía venosa.</li><li>Evitar bajo gasto: fluidoterapia prudente, valorar drogas vasoactivas por equipo médico.</li><li>Tratar hipoglucemia con glucosa IV si aparece.</li><li>Tratar hipotermia con calentamiento pasivo, evitando recalentamiento agresivo.</li><li>Preaviso y traslado urgente a UCI.</li></ol>"
    },
    {
      "h": "Coma mixedematoso: tratamiento hospitalario que debe anticiparse",
      "b": "<ul><li>Sustitución hormonal tiroidea con monitorización por riesgo de arritmias.</li><li>Hidrocortisona: el manual recoge 100 mg IV en bolo, seguidos de 100 mg cada 8 h en primeras 24 h, para evitar crisis addisoniana al iniciar hormonas tiroideas.</li><li>Tratamiento de la causa desencadenante.</li><li>Corrección de hiponatremia dilucional, hipoglucemia y trastornos hidroelectrolíticos.</li></ul>"
    },
    {
      "h": "Crisis tirotóxica: definición",
      "b": "<p>La crisis tirotóxica es una urgencia médica infrecuente pero de alta mortalidad, provocada por una respuesta exagerada a elevación masiva de hormonas tiroideas. Produce hipermetabolismo e hiperactividad simpática. El manual indica mortalidad hasta el 30 %.</p>"
    },
    {
      "h": "Crisis tirotóxica: desencadenantes",
      "b": "<ul><li>Hipertiroidismo grave mal tratado o no diagnosticado, habitualmente enfermedad de Graves.</li><li>Retirada de antitiroideos.</li><li>Tratamiento con yodo radiactivo o uso de contrastes yodados.</li><li>Cirugía tiroidea o palpación vigorosa del tiroides.</li><li>Infección, trauma, cirugía, ictus, TEP, parto, CAD, estrés emocional, IAM, estatus epiléptico.</li><li>Ingesta de simpaticomiméticos/salicilatos o exceso de hormonas tiroideas.</li></ul>"
    },
    {
      "h": "Crisis tirotóxica: clínica de sospecha",
      "b": "<p>Sospechar en paciente hipertiroideo que, tras un desencadenante, presenta la triada:</p><ul><li><b>Hipertermia</b>.</li><li><b>Taquicardia</b> marcada.</li><li><b>Alteración mental</b>, especialmente agitación severa.</li></ul><p>Puede asociar fiebre alta, náuseas, vómitos, diarrea intensa, dolor abdominal, ictericia, insuficiencia cardiaca, HTA sistólica, dolor torácico, sudoración, temblor, piel caliente/húmeda, pérdida de peso y disnea.</p>"
    },
    {
      "h": "Crisis tirotóxica: actuación inicial",
      "b": "<ol><li>ABCDE y monitorización continua.</li><li>Oxígeno si hipoxemia, dificultad respiratoria o insuficiencia cardiaca.</li><li>Canalizar vía venosa y valorar fluidoterapia prudente según perfusión, fiebre, diarrea/vómitos y estado cardiaco.</li><li>Control térmico: enfriamiento físico y antitérmicos según protocolo; evitar salicilatos porque pueden empeorar fracción libre de hormona tiroidea.</li><li>Control de taquicardia/hiperactividad simpática con betabloqueante si no contraindicado y bajo indicación médica.</li><li>Tratamiento específico hospitalario: antitiroideos, yodo y corticoides según secuencia/protocolo.</li><li>Buscar y tratar desencadenante: infección, SCA, TEP, CAD, parto, cirugía, abandono de tratamiento.</li><li>Ingreso en UCI.</li></ol>"
    },
    {
      "h": "Diferencial con sepsis y otros cuadros",
      "b": "<ul><li>Sepsis, golpe de calor, intoxicación por simpaticomiméticos, síndrome neuroléptico maligno, abstinencia, reacción transfusional, crisis de ansiedad grave, delirium o complicaciones postoperatorias.</li><li>El diagnóstico es clínico y no debe retrasarse tratamiento si la sospecha es alta.</li><li>La crisis tirotóxica y la sepsis pueden coexistir: la infección puede ser desencadenante.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Monitorización ECG continua por riesgo de arritmias.</li><li>Control seriado de temperatura, TA, FC, FR, SatO₂, glucemia y nivel de conciencia.</li><li>Preparar oxígeno, vía venosa, fluidos, bomba de perfusión y material de vía aérea.</li><li>En coma mixedematoso: calentamiento pasivo y evitar sedantes innecesarios.</li><li>En crisis tirotóxica: ambiente tranquilo, control térmico, vigilancia de insuficiencia cardiaca y diarrea/vómitos.</li><li>Transferencia: antecedentes tiroideos, tratamiento habitual, abandono, desencadenante, constantes, ECG, glucemia, tratamiento y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>No pensar en coma mixedematoso ante anciano hipotérmico y confuso.</li><li>Recalentar de forma agresiva al paciente mixedematoso.</li><li>Usar salicilatos en crisis tirotóxica.</li><li>Retrasar tratamiento esperando analítica hormonal.</li><li>No buscar infección, SCA, TEP o CAD como desencadenantes.</li><li>No monitorizar ECG en emergencias tiroideas.</li></ul>"
    }
  ],
  "block": 6
},
{
  "id": "psiq-agitacion-ansiedad-ingesa",
  "cat": "psiq",
  "especialidad": "Psiquiatría / Urgencias / Seguridad del paciente",
  "title": "Agitación psicomotriz y ansiedad",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias psiquiátricas, 2013",
  "tags": "agitacion psicomotriz ansiedad pánico contencion verbal ambiental mecanica sedacion haloperidol benzodiacepinas organicidad intoxicacion delirium seguridad",
  "summary": "Manejo seguro del paciente agitado o con crisis de ansiedad, priorizando seguridad, descarte de causa orgánica, desescalada verbal y sedación/contención solo si es imprescindible.",
  "relations": {
    "patologias": [
      "Agitación psicomotriz",
      "Crisis de ansiedad",
      "Ataque de pánico",
      "Psicosis aguda",
      "Delirium",
      "Intoxicación",
      "Abstinencia alcohólica",
      "Hipoglucemia",
      "Hipoxia"
    ],
    "farmacos": [
      "Oxígeno",
      "Glucosa si hipoglucemia",
      "Benzodiacepinas según protocolo",
      "Haloperidol según protocolo",
      "Antídotos si intoxicación específica"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "AVDI",
      "Glucemia capilar",
      "ECG si sedación o fármacos QT"
    ],
    "tecnicas": [
      "Desescalada verbal",
      "Contención ambiental",
      "Contención mecánica",
      "Sedación de urgencia",
      "Monitorización",
      "Transferencia estructurada"
    ],
    "alertas": [
      "no asumir origen psiquiátrico",
      "alucinaciones visuales",
      "inicio brusco en anciano",
      "alteración de conciencia",
      "fiebre",
      "hipoxia",
      "hipoglucemia",
      "violencia o riesgo de fuga",
      "intoxicación/abstinencia"
    ]
  },
  "sec": [
    {
      "h": "Idea clave",
      "b": "<p>El paciente agitado no debe considerarse automáticamente “psiquiátrico”. El manual insiste en descartar siempre una causa somática antes de iniciar sedación. La agitación puede ser orgánica, tóxica, metabólica, neurológica, psiquiátrica o una reacción aguda al estrés.</p>"
    },
    {
      "h": "Definición",
      "b": "<p>La agitación psicomotriz es un cuadro inespecífico caracterizado por aumento de la actividad motora, activación vegetativa —sudoración, taquicardia, midriasis—, ansiedad severa, pánico u otros estados emocionales intensos. Puede ser difícil de manejar por el riesgo para el paciente, el equipo y el entorno.</p>"
    },
    {
      "h": "Prioridad 1: seguridad",
      "b": "<ol><li>Valorar riesgo inmediato para paciente, equipo y terceros.</li><li>Colocar al equipo con salida visible y evitar quedar encerrado.</li><li>Retirar objetos peligrosos o potencialmente arrojadizos.</li><li>Reducir estímulos: ruido, luz, exceso de personal, público o familiares alterados.</li><li>Pedir apoyo si hay riesgo de violencia: equipo sanitario, seguridad o cuerpos de seguridad según contexto.</li><li>No intentar reducción física sin personal suficiente ni plan claro.</li></ol>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ul><li><b>A/B:</b> vía aérea, respiración, SatO₂, signos de hipoxia, intoxicación o broncoaspiración.</li><li><b>C:</b> TA, FC, perfusión, temperatura, signos de shock, sepsis o abstinencia.</li><li><b>D:</b> nivel de conciencia, orientación, glucemia capilar, pupilas, focalidad neurológica, crisis convulsivas.</li><li><b>E:</b> fiebre, traumatismos, tóxicos, pinchazos, lesiones, signos de síndrome serotoninérgico/neuroléptico, consumo o abstinencia.</li></ul>"
    },
    {
      "h": "Diferenciar causa orgánica vs psiquiátrica",
      "b": "<ul><li><b>Sugiere origen orgánico:</b> inicio brusco o subagudo, edad avanzada, ausencia de historia psiquiátrica previa, alteración de conciencia, desorientación temporoespacial, confusión, discurso incoherente, fluctuación, fiebre, taquicardia, taquipnea, sudoración, temblor o signos neurológicos.</li><li><b>Muy orientador de organicidad:</b> alucinaciones visuales, fluctuación con empeoramiento nocturno y actividad ocupacional.</li><li><b>Sugiere origen psiquiátrico:</b> antecedentes psiquiátricos, conciencia relativamente conservada, orientación más preservada, ideas delirantes estructuradas, alucinaciones auditivas, ansiedad/pánico o cuadro reactivo.</li><li>Aun con antecedentes psiquiátricos, siempre descartar hipoglucemia, hipoxia, infección, tóxicos, trauma y abstinencia.</li></ul>"
    },
    {
      "h": "Anamnesis útil",
      "b": "<ul><li>Inicio, evolución y desencadenante.</li><li>Antecedentes médicos y psiquiátricos.</li><li>Consumo de alcohol, drogas, fármacos, tóxicos o retirada de medicación.</li><li>Diabetes, epilepsia, ictus, TCE, infección, dolor, fiebre o hipoxia.</li><li>Riesgo de suicidio, heteroagresividad, fugas o incapacidad de autocuidado.</li><li>Información de familiares, testigos, policía o entorno.</li></ul>"
    },
    {
      "h": "Desescalada verbal",
      "b": "<ul><li>Presentarse, hablar despacio, con tono bajo y frases cortas.</li><li>No discutir delirios ni confrontar de forma humillante.</li><li>Validar emoción sin validar ideas falsas: “veo que esto le asusta; vamos a intentar ayudarle”.</li><li>Dar opciones simples y límites claros: “puede sentarse aquí o allí, pero no puede golpear”.</li><li>Evitar contacto físico innecesario y mantener distancia de seguridad.</li><li>Permitir que una sola persona lidere la comunicación.</li></ul>"
    },
    {
      "h": "Crisis de ansiedad / pánico",
      "b": "<ul><li>Puede presentar miedo intenso, palpitaciones, disnea, opresión torácica, temblor, mareo, parestesias, sensación de muerte o pérdida de control.</li><li>Antes de atribuirlo a ansiedad: valorar dolor torácico, hipoxia, hipoglucemia, TEP, arritmia, intoxicación o abstinencia.</li><li>Medidas iniciales: ambiente tranquilo, explicar que los síntomas son reales pero no necesariamente peligrosos, respiración guiada sin bolsa, acompañamiento y reevaluación.</li><li>Derivar si primera crisis, síntomas atípicos, causa orgánica posible, riesgo suicida, consumo de sustancias o interferencia importante en vida diaria.</li></ul>"
    },
    {
      "h": "Contención mecánica",
      "b": "<p>Debe ser el último recurso, cuando existe riesgo grave e inmediato y han fallado medidas menos restrictivas o no son posibles.</p><ul><li>Requiere personal suficiente, indicación clara y vigilancia continua.</li><li>Debe proteger dignidad, respiración, circulación, temperatura e hidratación.</li><li>Evitar decúbito prono prolongado por riesgo de asfixia posicional.</li><li>Reevaluar de forma frecuente y retirar en cuanto sea seguro.</li><li>Documentar motivo, hora, personal, constantes, lesiones, sedación y reevaluaciones.</li></ul>"
    },
    {
      "h": "Sedación de urgencia",
      "b": "<ul><li>Indicada si el paciente representa riesgo y no responde a contención verbal/ambiental, o si la exploración/tratamiento vital no puede realizarse con seguridad.</li><li>Elegir fármaco según sospecha: benzodiacepina si ansiedad intensa, abstinencia o estimulantes; antipsicótico si psicosis/agitación psicótica; combinación si agitación severa según protocolo.</li><li>Antes y después: valorar vía aérea, SatO₂, TA, FC, glucemia, ECG si riesgo QT o antipsicóticos.</li><li>Tras sedación, monitorizar depresión respiratoria, hipotensión, distonías, síndrome neuroléptico maligno, QT prolongado y broncoaspiración.</li></ul><p><b>Nota:</b> dosis y vía deben ajustarse a protocolo local, edad, comorbilidad e intoxicación sospechada.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Garantizar seguridad ambiental y del equipo.</li><li>Realizar glucemia capilar y constantes lo antes posible.</li><li>Observar nivel de conciencia, orientación, discurso, alucinaciones, delirios, riesgo de autolesión o agresión.</li><li>Registrar intentos de desescalada, respuesta, necesidad de contención/sedación y reevaluaciones.</li><li>Vigilar vía aérea y SatO₂ tras sedación.</li><li>Transferir: causa sospechada, riesgos, medicación administrada, constantes, respuesta y necesidad de vigilancia.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Etiquetar como psiquiátrico sin descartar causa orgánica.</li><li>No medir glucemia ni SatO₂.</li><li>Contener mecánicamente sin vigilancia.</li><li>Sedar sin plan de monitorización.</li><li>Discutir, gritar o rodear al paciente de forma intimidante.</li><li>Olvidar riesgo de violencia, fuga o suicidio.</li></ul>"
    }
  ],
  "block": 7
},
{
  "id": "psiq-sindrome-confusional-suicida-ingesa",
  "cat": "psiq",
  "especialidad": "Psiquiatría / Urgencias / Medicina interna",
  "title": "Síndrome confusional agudo y paciente suicida",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias psiquiátricas, 2013",
  "tags": "sindrome confusional agudo delirium paciente suicida ideacion suicida riesgo suicidio intoxicacion hipoxia hipoglucemia sepsis tce meningitis ACV seguridad",
  "summary": "Manejo del síndrome confusional agudo y valoración inicial del riesgo suicida: descartar causa orgánica, proteger al paciente y activar derivación urgente cuando proceda.",
  "relations": {
    "patologias": [
      "Síndrome confusional agudo",
      "Delirium",
      "Sepsis",
      "Hipoglucemia",
      "Intoxicación",
      "Abstinencia alcohólica",
      "TCE",
      "Meningitis",
      "ACV",
      "Riesgo suicida",
      "Depresión mayor",
      "Psicosis"
    ],
    "farmacos": [
      "Oxígeno",
      "Glucosa",
      "Tiamina",
      "Naloxona si sospecha opioides",
      "Flumazenil con mucha prudencia",
      "Haloperidol según protocolo",
      "Benzodiacepinas según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "AVDI",
      "Glucemia capilar",
      "ECG",
      "Valoración de riesgo suicida"
    ],
    "tecnicas": [
      "Vigilancia continua",
      "Retirada de medios peligrosos",
      "Contención verbal",
      "Monitorización",
      "Canalización venosa",
      "Preaviso psiquiatría/urgencias"
    ],
    "alertas": [
      "inicio brusco fluctuante",
      "desorientación",
      "alteración atención",
      "fiebre/sepsis",
      "hipoxia",
      "hipoglucemia",
      "focalidad",
      "ideación suicida con plan",
      "intento reciente",
      "no dejar solo"
    ]
  },
  "sec": [
    {
      "h": "Síndrome confusional agudo: concepto",
      "b": "<p>El síndrome confusional agudo o delirium es un cuadro de inicio brusco y curso fluctuante con alteración del nivel de conciencia, afectación global de funciones cognitivas, alteración de atención/concentración, desorientación, alteración psicomotriz —agitación o inhibición— y trastorno del ritmo vigilia-sueño. No se asocia a una focalidad neurológica mayor como rasgo principal.</p>"
    },
    {
      "h": "Etiología del síndrome confusional agudo",
      "b": "<ul><li><b>Infecciones:</b> neumonía, sepsis, infección urinaria.</li><li><b>Metabólicas:</b> encefalopatía hepática/urémica, trastornos hidroelectrolíticos, hipoglucemia.</li><li><b>Endocrinas:</b> Addison, Cushing, alteraciones tiroideas/paratiroideas.</li><li><b>Cardiacas:</b> IAM, insuficiencia cardiaca, arritmias, TEP.</li><li><b>Ambientales:</b> golpe de calor, hipotermia, ahogamiento, electrocución.</li><li><b>Neurológicas:</b> TCE, meningitis, ACV, tumores.</li><li><b>Fármacos/tóxicos:</b> anticolinérgicos, sedantes, opiáceos, benzodiacepinas, alcohol, drogas o abstinencia.</li></ul>"
    },
    {
      "h": "Factores predisponentes",
      "b": "<ul><li>Edad avanzada.</li><li>Deterioro cognitivo previo o antecedente de delirium.</li><li>Daño cerebral previo.</li><li>Abuso crónico de alcohol o drogas.</li><li>Depresión, estrés, falta de apoyo familiar.</li><li>Hospitalización, inmovilización, deprivación de sueño, aislamiento, UCI, deprivación sensorial o cambios bruscos de entorno.</li></ul>"
    },
    {
      "h": "Diagnóstico clínico",
      "b": "<ul><li>Inicio agudo o subagudo y fluctuación durante el día.</li><li>Alteración de atención: no mantiene conversación, se distrae, no sigue órdenes simples.</li><li>Desorientación temporoespacial.</li><li>Alteración del ciclo sueño-vigilia.</li><li>Agitación o inhibición psicomotriz.</li><li>Alucinaciones, especialmente visuales, e ideación delirante.</li><li>La historia debe obtenerse de familiares/testigos: enfermedades previas, fármacos, tóxicos, fiebre, trauma, convulsiones o focalidad.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A/B:</b> vía aérea, SatO₂, FR, signos de hipoxia, broncoaspiración o depresión respiratoria.</li><li><b>C:</b> TA, FC, perfusión, temperatura; buscar sepsis, shock, arritmias o SCA.</li><li><b>D:</b> Glasgow/AVDI, pupilas, glucemia capilar, focalidad, convulsiones, rigidez de nuca.</li><li><b>E:</b> signos de trauma, fiebre, exantema, tóxicos, medicación, lesiones, retención urinaria, dolor o deshidratación.</li></ol>"
    },
    {
      "h": "Tratamiento del síndrome confusional",
      "b": "<ul><li>Tratar causa desencadenante: hipoxia, hipoglucemia, sepsis, dolor, fiebre, retención urinaria, abstinencia, intoxicación, TCE, ACV, etc.</li><li>Medidas ambientales: luz suave, orientación verbal, presencia de familiar calmado si ayuda, gafas/audífonos si los usa, reducir ruidos.</li><li>Evitar sujeciones si no son imprescindibles; aumentan agitación y riesgo.</li><li>Si hay riesgo inmediato, usar contención verbal/ambiental y, solo si precisa, sedación/contención con vigilancia.</li><li>No usar benzodiacepinas de rutina en delirium salvo abstinencia alcohólica/sedante o indicación específica.</li></ul>"
    },
    {
      "h": "Paciente suicida: principio de seguridad",
      "b": "<p>La prioridad es proteger al paciente. Una persona con ideación suicida activa, plan, intento reciente o conducta imprevisible no debe quedarse sola ni tener acceso a medios lesivos.</p><ul><li>Retirar objetos peligrosos: medicación, cinturones, cordones, objetos cortantes, tóxicos o armas si existen.</li><li>Vigilancia continua si riesgo alto.</li><li>Ambiente tranquilo, trato respetuoso y no culpabilizante.</li><li>Preguntar directamente por suicidio no “induce” la idea; ayuda a valorar riesgo.</li></ul>"
    },
    {
      "h": "Valoración inicial del riesgo suicida",
      "b": "<ul><li>¿Ha pensado en hacerse daño o quitarse la vida?</li><li>¿Tiene un plan concreto?</li><li>¿Tiene acceso al método?</li><li>¿Ha hecho preparativos: despedidas, notas, regalar pertenencias, acumular fármacos?</li><li>¿Ha habido intento reciente o intentos previos?</li><li>¿Consume alcohol/drogas o está intoxicado?</li><li>¿Hay psicosis, desesperanza, dolor intenso, enfermedad grave o aislamiento?</li><li>Factores protectores: apoyo familiar, convivencia, responsabilidad de cuidado, motivación para ayuda, seguimiento previo.</li></ul>"
    },
    {
      "h": "Riesgo alto: criterios prácticos",
      "b": "<ul><li>Intento autolítico reciente.</li><li>Ideación suicida activa con plan y acceso al método.</li><li>Psicosis, mandato alucinatorio, agitación, intoxicación o delirium.</li><li>Alta letalidad del método o rescate improbable.</li><li>Desesperanza marcada, aislamiento extremo o falta de apoyo.</li><li>Rechazo de ayuda, fuga o incapacidad para garantizar seguridad.</li></ul><p>En estos casos, activar traslado/valoración urgente y vigilancia continua.</p>"
    },
    {
      "h": "Actuación ante paciente suicida",
      "b": "<ol><li>Garantizar seguridad del entorno y del paciente.</li><li>No dejar solo si riesgo moderado-alto.</li><li>Retirar medios lesivos.</li><li>ABCDE si intoxicación, trauma, sangrado, sobredosis o alteración de conciencia.</li><li>Glucemia, constantes, SatO₂, ECG si fármacos o intoxicación.</li><li>Contención verbal con actitud calmada, empática y clara.</li><li>Derivación a urgencias/psiquiatría según riesgo; si hay intento o plan activo, traslado urgente.</li><li>Documentar literalmente frases relevantes, plan, medios, antecedentes, consumo, testigos y medidas de seguridad.</li></ol>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Observación continua si riesgo suicida o confusión/agitación.</li><li>Retirada segura de objetos peligrosos, preservando dignidad.</li><li>Constantes, glucemia y nivel de conciencia seriados.</li><li>Comunicación calmada: no juzgar, no minimizar, no prometer confidencialidad absoluta si hay riesgo vital.</li><li>En delirium, reorientar: nombre, lugar, fecha, explicación breve de lo que ocurre.</li><li>Transferir riesgo, medios retirados, vigilancia, tratamientos, tóxicos, lesiones y red familiar.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Atribuir confusión a “demencia” o “psiquiatría” sin buscar causa aguda.</li><li>No medir glucemia, SatO₂ o temperatura en delirium.</li><li>Dejar solo a un paciente con riesgo suicida.</li><li>Minimizar frases suicidas como manipulación.</li><li>Prometer secreto si hay riesgo vital.</li><li>Contener sin monitorizar o sin documentar.</li><li>Usar sedación para comodidad del equipo en lugar de por seguridad clínica.</li></ul>"
    }
  ],
  "block": 7
},
{
  "id": "neumo-disnea-aguda-ingesa",
  "cat": "resp",
  "especialidad": "Neumología / Urgencias / Críticos",
  "title": "Paciente con disnea aguda",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neumológicas, 2013",
  "tags": "disnea aguda insuficiencia respiratoria satO2 ventimask oxigenoterapia estridor tiraje cianosis taquipnea bradipnea TEP neumotorax edema pulmonar asma epoc",
  "summary": "Abordaje inicial de la disnea aguda: diferenciar disnea de insuficiencia respiratoria, valorar gravedad con ABC, identificar perfiles clínicos y estabilizar oxigenación/ventilación.",
  "relations": {
    "patologias": [
      "Disnea aguda",
      "Insuficiencia respiratoria",
      "Obstrucción de vía aérea superior",
      "Crisis asmática",
      "EPOC reagudizado",
      "TEP",
      "Neumotórax",
      "Edema agudo de pulmón",
      "Neumonía",
      "SDRA",
      "Ansiedad"
    ],
    "farmacos": [
      "Oxígeno",
      "Salbutamol",
      "Bromuro de ipratropio",
      "Corticoides sistémicos",
      "Adrenalina si angioedema/anafilaxia",
      "Nitroglicerina si EAP/SCA según protocolo",
      "Diuréticos según perfil"
    ],
    "escalas": [
      "ABCDE",
      "SatO₂",
      "Frecuencia respiratoria",
      "Glasgow",
      "Wells TEP",
      "ECG 12 derivaciones"
    ],
    "tecnicas": [
      "Oxigenoterapia Venturi",
      "Aspiración de secreciones",
      "VMNI",
      "Ventilación invasiva",
      "Monitorización ECG",
      "Canalización venosa",
      "Auscultación cardiopulmonar"
    ],
    "alertas": [
      "SatO₂ <90 %",
      "FR >30",
      "FR <10",
      "tiraje",
      "estridor",
      "cianosis",
      "silencio auscultatorio",
      "alteración conciencia",
      "dolor torácico/síncope",
      "hipotensión"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La disnea es una sensación subjetiva de falta de aire con respiración anormal o dificultosa. Puede aparecer en reposo o con un grado de actividad menor al esperado. Puede ser aguda —horas o días—, crónica —semanas o meses— o crónica agudizada.</p><ul><li>Disnea e insuficiencia respiratoria no son lo mismo.</li><li>La insuficiencia respiratoria requiere datos objetivos, como gasometría, y se relaciona clásicamente con PaO₂ menor de 60 mmHg.</li><li>En extrahospitalaria el objetivo es asegurar oxigenación adecuada y detectar causas reversibles potencialmente graves.</li></ul>"
    },
    {
      "h": "Causas frecuentes",
      "b": "<ul><li><b>Respiratorias:</b> asma, EPOC reagudizado, neumonía, neumotórax, TEP, derrame pleural, cuerpo extraño, angioedema, SDRA.</li><li><b>Cardiacas:</b> edema agudo de pulmón, insuficiencia cardiaca, IAM, arritmias.</li><li><b>Metabólicas:</b> acidosis, sepsis, anemia grave, cetoacidosis.</li><li><b>Mecánicas/traumáticas:</b> volet costal, trauma torácico, obstrucción.</li><li><b>Psicógenas:</b> ansiedad o crisis de pánico, siempre después de descartar gravedad.</li></ul>"
    },
    {
      "h": "Valoración inicial ABC",
      "b": "<ol><li><b>A · Vía aérea:</b> ¿está consciente?, ¿habla?, ¿hay estridor, voz alterada, sialorrea, cuerpo extraño o secreciones? Si no está consciente o no mantiene vía aérea, actuar según soporte vital.</li><li><b>B · Respiración:</b> frecuencia respiratoria, SatO₂, tiraje, uso de musculatura accesoria, cianosis, silencio auscultatorio, sibilantes, crepitantes, roncus o disminución de murmullo vesicular.</li><li><b>C · Circulación:</b> TA, FC, relleno capilar, edemas, signos de bajo gasto, dolor torácico, síncope, arritmias o hemorragia.</li></ol>"
    },
    {
      "h": "Signos de gravedad respiratoria",
      "b": "<ul><li>SatO₂ menor de 90 %.</li><li>FR mayor de 30 rpm o menor de 10 rpm.</li><li>Uso marcado de musculatura accesoria.</li><li>Tiraje, estridor, cianosis.</li><li>Silencio auscultatorio.</li><li>Alteración del nivel de conciencia, agotamiento o agitación por hipoxia.</li><li>Hipotensión, síncope, dolor torácico o signos de shock.</li></ul>"
    },
    {
      "h": "Perfiles clínicos rápidos",
      "b": "<ul><li><b>Obstrucción vía aérea superior:</b> tos espasmódica, tiraje supraclavicular, estridor inspiratorio, voz alterada. Pensar en cuerpo extraño o angioedema.</li><li><b>Obstrucción vía aérea inferior:</b> sibilancias, espiración alargada, opresión torácica. Pensar en asma, EPOC, TEP o neumotórax.</li><li><b>Pleuropulmonar:</b> fiebre, tos, dolor pleurítico, crepitantes, derrame, neumonía, SDRA.</li><li><b>Cardiogénico:</b> ortopnea, disnea paroxística nocturna, crepitantes, expectoración rosada, edemas, ingurgitación yugular.</li><li><b>Vascular/TEP:</b> disnea súbita, dolor pleurítico, taquicardia, síncope, factores de riesgo trombótico o hemoptisis.</li><li><b>Traumático/mecánico:</b> antecedente de trauma, asimetría ventilatoria, dolor, crepitación, volet costal o neumotórax.</li><li><b>Psicógeno:</b> hiperventilación, parestesias, ansiedad intensa; diagnóstico de exclusión.</li></ul>"
    },
    {
      "h": "Tratamiento general",
      "b": "<ol><li>Tratamiento postural: elevar cabecera 45-90º según tolerancia y dificultad respiratoria.</li><li>Asegurar vía aérea y aspirar secreciones si es necesario.</li><li>Oxigenoterapia con mascarilla tipo Venturi para mantener SatO₂ por encima del 90 %, ajustando a patología de base.</li><li>Valorar VMNI o ventilación invasiva si fracaso respiratorio, agotamiento o bajo nivel de conciencia.</li><li>Monitorizar TA, FC, FR, temperatura, ECG y pulsioximetría.</li><li>Canalizar vía venosa y administrar fluidoterapia adecuada al perfil clínico.</li><li>Tratar la causa probable: broncoespasmo, EAP, TEP, neumotórax, anafilaxia, infección, etc.</li><li>Traslado hospitalario si signos de gravedad o diagnóstico no aclarado.</li></ol>"
    },
    {
      "h": "Oxigenoterapia: matices prácticos",
      "b": "<ul><li>Hipoxemia o dificultad respiratoria: iniciar oxígeno y titular según respuesta.</li><li>En EPOC con riesgo de retención de CO₂, usar oxigenoterapia controlada y objetivo de SatO₂ según protocolo local, habitualmente 88-92 % si hipercapnia conocida/sospechada.</li><li>Si no se logra SatO₂ adecuada o hay agotamiento: valorar VMNI o vía aérea avanzada.</li><li>No retrasar tratamiento de causa por esperar pruebas hospitalarias.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Observar habla, postura, tiraje, coloración, patrón respiratorio y tolerancia al decúbito.</li><li>Registrar constantes seriadas y respuesta al oxígeno.</li><li>Auscultar y comunicar hallazgos: sibilancias, crepitantes, silencio, asimetría.</li><li>Preparar material de aspiración, oxígeno, VMNI, vía venosa y medicación inhalada.</li><li>Controlar ansiedad sin minimizar síntomas.</li><li>Transferir: inicio, desencadenante, SatO₂ inicial/final, FR, auscultación, tratamiento y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Confundir disnea con ansiedad sin descartar hipoxia, SCA, TEP o neumotórax.</li><li>No auscultar ambos campos pulmonares.</li><li>No medir SatO₂ o no reevaluarla tras oxígeno.</li><li>Administrar oxígeno no controlado en EPOC hipercápnico sin vigilancia.</li><li>Retrasar VMNI/intubación si hay agotamiento o alteración de conciencia.</li><li>No considerar neumotórax a tensión ante disnea súbita, asimetría y shock.</li></ul>"
    }
  ],
  "block": 8
},
{
  "id": "neumo-epoc-reagudizado-ingesa",
  "cat": "resp",
  "especialidad": "Neumología / Urgencias",
  "title": "EPOC reagudizado",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neumológicas, 2013",
  "tags": "epoc reagudizado exacerbacion epoc disnea esputo purulento broncodilatadores salbutamol ipratropio corticoides ventimask vmni hipercapnia flapping somnolencia",
  "summary": "Manejo de la exacerbación de EPOC con oxigenoterapia controlada, broncodilatadores, corticoides, antibiótico si sospecha infecciosa y VMNI si insuficiencia respiratoria.",
  "relations": {
    "patologias": [
      "EPOC",
      "Exacerbación EPOC",
      "Bronquitis crónica",
      "Enfisema",
      "Insuficiencia respiratoria hipercápnica",
      "Neumonía",
      "Cor pulmonale"
    ],
    "farmacos": [
      "Oxígeno controlado",
      "Salbutamol",
      "Bromuro de ipratropio",
      "Metilprednisolona",
      "Prednisona",
      "Antibióticos según protocolo",
      "Furosemida si congestión derecha/izquierda según perfil"
    ],
    "escalas": [
      "ABCDE",
      "SatO₂",
      "FR",
      "Glasgow",
      "ECG"
    ],
    "tecnicas": [
      "Ventimask 24-28 %",
      "Nebulización",
      "VMNI",
      "Aspiración de secreciones",
      "Canalización venosa",
      "Monitorización"
    ],
    "alertas": [
      "somnolencia",
      "flapping",
      "cianosis",
      "SatO₂ baja",
      "FR >30 o <10",
      "silencio auscultatorio",
      "agotamiento",
      "hipotensión",
      "neumonía o sepsis"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La reagudización de EPOC es un empeoramiento agudo de la situación respiratoria basal, generalmente con aumento de disnea, aumento del volumen de esputo y/o cambio a esputo purulento. Puede estar desencadenada por infección respiratoria, contaminación, incumplimiento terapéutico, neumonía, TEP, neumotórax o insuficiencia cardiaca.</p>"
    },
    {
      "h": "Clínica de sospecha",
      "b": "<ul><li>Disnea superior a la habitual.</li><li>Aumento de expectoración o mayor densidad del moco.</li><li>Esputo purulento.</li><li>Tos, sibilancias, opresión torácica.</li><li>Taquipnea, uso de musculatura accesoria.</li><li>Roncus, sibilantes, estertores, disminución de murmullo vesicular y espiración alargada.</li><li>En gravedad: cianosis, somnolencia, flapping, confusión o agotamiento.</li></ul>"
    },
    {
      "h": "Evaluación inicial",
      "b": "<ol><li>ABCDE y valoración de gravedad.</li><li>SatO₂, FR, FC, TA, temperatura y nivel de conciencia.</li><li>Auscultación: sibilancias, roncus, crepitantes, silencio o asimetría.</li><li>ECG si dolor torácico, arritmia, edad avanzada o sospecha cardiaca.</li><li>Preguntar tratamiento habitual, oxígeno domiciliario, VMNI domiciliaria, ingresos previos, UCI/intubación, antibióticos/corticoides recientes.</li><li>Buscar desencadenante: fiebre, esputo purulento, dolor pleurítico, edema, inmovilización, neumotórax, TEP.</li></ol>"
    },
    {
      "h": "Signos de gravedad",
      "b": "<ul><li>Alteración del nivel de conciencia o somnolencia.</li><li>FR muy alta o bradipnea.</li><li>SatO₂ baja pese a oxígeno controlado.</li><li>Uso intenso de musculatura accesoria o agotamiento.</li><li>Cianosis, sudoración, mala perfusión.</li><li>Silencio auscultatorio.</li><li>Arritmia, hipotensión, dolor torácico o signos de sepsis.</li><li>Antecedente de ventilación mecánica o ingreso en UCI por EPOC.</li></ul>"
    },
    {
      "h": "Tratamiento inicial",
      "b": "<ul><li>Posición incorporada y reposo.</li><li>Oxigenoterapia controlada, preferentemente Venturi 24-28 % si riesgo de hipercapnia, titulando objetivo según protocolo.</li><li>Broncodilatadores inhalados: salbutamol y bromuro de ipratropio, con cámara o nebulización según gravedad.</li><li>Corticoide sistémico si exacerbación moderada-grave.</li><li>Antibiótico si esputo purulento, neumonía, fiebre, aumento importante de volumen de esputo o necesidad de ventilación, según protocolo local.</li><li>VMNI si insuficiencia respiratoria hipercápnica, trabajo respiratorio importante o mala respuesta inicial, siempre que no existan contraindicaciones.</li></ul>"
    },
    {
      "h": "Oxígeno en EPOC: seguridad",
      "b": "<ul><li>No retirar oxígeno por miedo a hipercapnia si el paciente está hipoxémico.</li><li>Usar oxígeno controlado y reevaluar clínicamente.</li><li>Vigilar somnolencia, cefalea, flapping, deterioro ventilatorio y disminución de FR.</li><li>Si empeora con oxígeno o persiste insuficiencia respiratoria: valorar VMNI y traslado a críticos.</li></ul>"
    },
    {
      "h": "VMNI: cuándo pensarla",
      "b": "<ul><li>Disnea moderada-grave con uso de musculatura accesoria.</li><li>Acidosis respiratoria o hipercapnia si se dispone de datos.</li><li>Persistencia de hipoxemia o trabajo respiratorio pese a tratamiento inicial.</li><li>Paciente cooperador, que protege vía aérea y tolera mascarilla.</li><li>No indicada si vómitos, coma profundo, shock grave, parada respiratoria o imposibilidad de proteger vía aérea.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Valorar situación basal: SatO₂ habitual, oxígeno domiciliario, tolerancia al esfuerzo y tratamiento.</li><li>Administrar broncodilatadores verificando técnica y dosis.</li><li>Monitorizar SatO₂, FR, FC, TA, conciencia y respuesta al tratamiento.</li><li>Vigilar secreciones: cantidad, color, viscosidad y capacidad de expectorar.</li><li>Preparar VMNI si precisa y controlar fugas/tolerancia.</li><li>Transferir: situación basal, desencadenante, SatO₂ inicial/final, tratamientos y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Administrar oxígeno a alto flujo sin control en hipercápnico conocido, salvo emergencia vital.</li><li>No tratar broncoespasmo de forma repetida/reevaluada.</li><li>No considerar neumonía, TEP, neumotórax o insuficiencia cardiaca como desencadenantes.</li><li>Esperar demasiado para VMNI si hay agotamiento.</li><li>No valorar nivel de conciencia como marcador de hipercapnia.</li></ul>"
    }
  ],
  "block": 8
},
{
  "id": "neumo-hemoptisis-ingesa",
  "cat": "resp",
  "especialidad": "Neumología / Urgencias / Críticos",
  "title": "Paciente con hemoptisis",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias neumológicas, 2013",
  "tags": "hemoptisis hemoptisis masiva sangre esputo vía aérea decúbito ipsilateral Trendelenburg oxigenoterapia IOT aspiración bronquiectasias tuberculosis TEP anticoagulantes",
  "summary": "Confirmación de hemoptisis, valoración de gravedad y manejo prehospitalario con prioridad absoluta a vía aérea, oxigenación, posición y traslado a críticos si es masiva.",
  "relations": {
    "patologias": [
      "Hemoptisis",
      "Hemoptisis masiva",
      "Bronquiectasias",
      "Bronquitis crónica",
      "Neumonía",
      "Tuberculosis",
      "TEP",
      "Cáncer de pulmón",
      "Malformación arteriovenosa",
      "Anticoagulación"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Codeína si tos seca dolorosa según protocolo",
      "Antibiótico si sospecha infección según protocolo",
      "Cloruro mórfico en sedación superficial según manual/protocolo"
    ],
    "escalas": [
      "ABCDE",
      "SatO₂",
      "Signos de shock",
      "Glasgow",
      "Wells TEP"
    ],
    "tecnicas": [
      "Aspiración enérgica",
      "Intubación orotraqueal",
      "Decúbito lateral ipsilateral",
      "Trendelenburg",
      "Monitorización",
      "Canalización venosa",
      "Preaviso sala de críticos"
    ],
    "alertas": [
      "hemoptisis masiva",
      "asfixia por sangre",
      "SatO₂ <90 %",
      "dificultad respiratoria",
      "hipotensión",
      "alteración conciencia",
      "anticoagulado",
      "sangrado recurrente",
      "sospecha TBC/neoplasia"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La hemoptisis es la expulsión de sangre procedente del árbol traqueobronquial o del parénquima pulmonar con la tos. La prioridad es distinguirla de sangrado digestivo o rinofaríngeo y valorar si compromete vía aérea, respiración o hemodinámica.</p>"
    },
    {
      "h": "Clasificación por cantidad y gravedad",
      "b": "<ul><li><b>Leve:</b> escasa cantidad, sin repercusión clínica.</li><li><b>Moderada:</b> aproximadamente 30-150 ml/día; escasa repercusión clínica.</li><li><b>Grave:</b> 150-600 ml, con repercusión clínica.</li><li><b>Exanguinante:</b> más de 1000-1500 ml/h, con riesgo de asfixia o deterioro hemodinámico.</li></ul><p>En la práctica, la gravedad depende más de la repercusión respiratoria que del volumen exacto, porque el paciente puede morir por asfixia antes que por shock.</p>"
    },
    {
      "h": "Etiología orientativa",
      "b": "<ul><li><b>Infecciosa:</b> bronquitis crónica, bronquiectasias, neumonía, tuberculosis.</li><li><b>Cardiovascular:</b> TEP, hipertensión pulmonar, malformaciones arteriovenosas, síndrome de vena cava superior, estenosis mitral.</li><li><b>Neoplásica:</b> tumor primario pulmonar o metástasis.</li><li><b>Traumática:</b> penetrante o cerrada.</li><li><b>Otras:</b> anticoagulantes, cuerpo extraño, vasculitis, endometriosis torácica, amiloidosis.</li></ul>"
    },
    {
      "h": "Confirmar que es hemoptisis",
      "b": "<ul><li><b>Hemoptisis:</b> sangre roja, espumosa, con tos, mezclada con esputo y síntomas respiratorios.</li><li><b>Hematemesis:</b> sangre con vómito, náuseas, restos alimentarios, melenas, color oscuro o posos de café.</li><li><b>Sangrado ORL:</b> epistaxis, sangrado gingival, sangre en cavidad oral sin tos verdadera.</li><li>La anamnesis y exploración pueden requerir valoración ORL/digestiva/hospitalaria si no está claro.</li></ul>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ol><li>ABCDE, con prioridad en vía aérea y ventilación.</li><li>Valorar volumen aproximado, velocidad de sangrado y repercusión.</li><li>Monitorizar ECG, FC, FR, TA, temperatura, SatO₂, relleno capilar y estado mental.</li><li>Buscar signos de hipovolemia y dificultad respiratoria.</li><li>Canalizar una o dos vías periféricas si moderada-grave.</li><li>Preguntar antecedentes: TBC, bronquiectasias, EPOC, neoplasia, anticoagulación, enfermedad renal/sistémica, fiebre, pérdida de peso, TEP.</li></ol>"
    },
    {
      "h": "Hemoptisis masiva: actuación",
      "b": "<ol><li>Aviso/preaviso como urgencia vital.</li><li>Oxigenoterapia continua para mantener SatO₂ por encima del 90 %.</li><li>Si no se logra oxigenación o hay compromiso de vía aérea: ventilación asistida e intubación orotraqueal si equipo entrenado.</li><li>Usar tubo de calibre suficiente, idealmente &gt;8 mm, para permitir aspiración de sangre y futura exploración endoscópica.</li><li>Aspiración enérgica de sangre y secreciones.</li><li>Posición: Trendelenburg y decúbito lateral sobre el lado del sangrado si se conoce, para proteger el pulmón sano.</li><li>Estabilización hemodinámica con vías periféricas y fluidoterapia si shock.</li><li>Traslado urgente a sala de críticos/hospital útil.</li></ol>"
    },
    {
      "h": "Hemoptisis leve-moderada",
      "b": "<ul><li>Observación clínica y monitorización si contexto de riesgo.</li><li>Oxígeno si SatO₂ baja o disnea.</li><li>Antitusígeno si tos seca dolorosa y no hay contraindicación; el manual menciona codeína 15 mg cada 4-6 h.</li><li>Si sospecha de infección respiratoria: antibiótico empírico según protocolo local; el manual menciona moxifloxacino 400 mg cada 24 h durante 5-10 días.</li><li>Derivación hospitalaria/Neumología para estudio etiológico, especialmente si recurrente, fumador, anticoagulado, neoplasia sospechada o TBC.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Cuantificar volumen aproximado: gasas, contenedores, frecuencia de episodios y presencia de coágulos.</li><li>Vigilar que el paciente no trague sangre en exceso y mantener aspiración preparada.</li><li>Colocar en posición adecuada según gravedad y lado de sangrado.</li><li>Controlar SatO₂, FR, TA, FC, relleno capilar y nivel de conciencia.</li><li>Preparar vía venosa, fluidos, material de intubación/aspiración y traslado a críticos.</li><li>Transferir: volumen, tiempo, color, lado sospechado, antecedentes, anticoagulación y respuesta a medidas.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Confundir hemoptisis masiva con “sangrado respiratorio” estable: es una emergencia de vía aérea.</li><li>Acostar en decúbito supino al paciente con sangrado activo.</li><li>No preparar aspiración.</li><li>Olvidar anticoagulantes o TBC/neoplasia en anamnesis.</li><li>Intubar con tubo pequeño si se prevé aspiración/broncoscopia.</li><li>No posicionar sobre el lado sangrante cuando se conoce.</li></ul>"
    }
  ],
  "block": 8
},
{
  "id": "digestivo-dolor-abdominal-agudo-ingesa",
  "cat": "digest",
  "especialidad": "Digestivo / Cirugía general / Urgencias",
  "title": "Paciente con dolor abdominal agudo",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias digestivas, 2013",
  "tags": "dolor abdominal agudo abdomen agudo peritonitis defensa rebote masa pulsátil aneurisma aorta apendicitis colecistitis obstrucción pancreatitis cólico renal",
  "summary": "Valoración estructurada del dolor abdominal agudo, priorizando ABC, estabilidad hemodinámica, signos de abdomen quirúrgico y criterios de traslado urgente.",
  "relations": {
    "patologias": [
      "Abdomen agudo",
      "Apendicitis",
      "Colecistitis",
      "Pancreatitis aguda",
      "Obstrucción intestinal",
      "Peritonitis",
      "Aneurisma de aorta abdominal",
      "Cólico renal",
      "Embarazo ectópico",
      "Colangitis",
      "Isquemia mesentérica"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Metamizol",
      "Paracetamol",
      "Meperidina",
      "Morfina",
      "Fentanilo",
      "Antieméticos según protocolo",
      "Antibióticos si sepsis/foco abdominal según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "Escala del dolor",
      "Glasgow",
      "Signos de shock",
      "SIRS/qSOFA si infección"
    ],
    "tecnicas": [
      "Exploración abdominal",
      "Auscultación abdominal",
      "Palpación por cuadrantes",
      "Canalización venosa",
      "Monitorización",
      "Dieta absoluta",
      "Transferencia estructurada"
    ],
    "alertas": [
      "alteración conciencia",
      "hipotensión + taquicardia",
      "FR >30 o <10",
      "distensión abdominal",
      "defensa/contractura",
      "masa pulsátil",
      "dolor >6 h",
      "hematomas/heridas",
      "silencio abdominal",
      "fiebre + ictericia + hipotensión"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>El dolor abdominal agudo es un síntoma frecuente que puede aparecer en la mayoría de trastornos intraabdominales, pero también puede ser la manifestación principal de enfermedades extraabdominales. En extrahospitalaria, la prioridad es identificar gravedad, estabilizar y decidir traslado útil.</p>"
    },
    {
      "h": "Primera valoración: antes del abdomen",
      "b": "<p>Antes de entrar a valorar el dolor, el manual indica comenzar por valoración general y resolver problemas vitales.</p><ol><li><b>A/B:</b> vía aérea, dificultad respiratoria, SatO₂, FR.</li><li><b>C:</b> TA, FC, pulsos, perfusión, piel/mucosas, signos de shock.</li><li><b>D:</b> nivel de conciencia y capacidad para responder.</li><li><b>E:</b> exposición, heridas, hematomas, distensión, fiebre, ictericia o signos de trauma.</li></ol>"
    },
    {
      "h": "Anamnesis dirigida",
      "b": "<ul><li><b>Características del dolor:</b> localización, inicio, forma de presentación, duración, evolución, intensidad, irradiación y factores que lo modifican.</li><li><b>Patrón:</b> cólico, continuo, punzante, urente, desgarrador.</li><li><b>Síntomas digestivos:</b> náuseas, vómitos, diarrea, estreñimiento, melenas, rectorragia, hematemesis, distensión.</li><li><b>Urológicos:</b> disuria, hematuria, polaquiuria, dolor lumbar.</li><li><b>Ginecológicos:</b> fecha de última regla, embarazo posible, sangrado vaginal, dolor pélvico.</li><li><b>Respiratorios/cardiológicos:</b> disnea, tos, dolor torácico, síncope, palpitaciones.</li><li><b>Antecedentes:</b> cirugías, úlcera, hepatopatía, anticoagulación, aneurisma, litiasis, EII, inmunosupresión.</li></ul>"
    },
    {
      "h": "Exploración física",
      "b": "<ul><li>Constantes: FC, FR, TA, temperatura, SatO₂ y pulsos periféricos.</li><li>Estado general: posición antiálgica, inquietud, palidez, sudoración, sensación de enfermedad.</li><li>Inspección: distensión, cicatrices, hernias, hematomas, heridas, circulación colateral, ictericia.</li><li>Auscultación: ruidos intestinales, ruidos de lucha o silencio abdominal.</li><li>Palpación: dolor localizado, defensa, contractura, rebote, masas, hernias, globo vesical.</li><li>Valorar hidratación, color de piel/mucosas y signos de sepsis o hipoperfusión.</li></ul>"
    },
    {
      "h": "Claves semiológicas del manual",
      "b": "<ul><li><b>Normotermia + bradicardia:</b> puede sugerir necrosis intestinal.</li><li><b>Hipotensión + taquicardia:</b> shock o hemorragia.</li><li><b>Ausencia de fiebre + taquicardia:</b> puede verse en apendicitis, colecistitis u obstrucción de intestino delgado.</li><li><b>Hipotensión + obnubilación + dolor de espalda:</b> pensar en aneurisma abdominal.</li><li><b>Hipotensión + fiebre + ictericia:</b> pensar en colangitis/sepsis biliar.</li><li>Paciente inmóvil, en posición antiálgica: orienta a irritación peritoneal. Paciente inquieto/hipercinético: orienta a dolor cólico por víscera hueca.</li></ul>"
    },
    {
      "h": "Criterios de gravedad",
      "b": "<ul><li>FR &gt;30 o &lt;10.</li><li>Ausencia o asimetría de pulsos periféricos.</li><li>Disminución del nivel de conciencia.</li><li>Signos de hipoperfusión en piel y mucosas.</li><li>Distensión abdominal importante.</li><li>Hematomas, heridas o sospecha traumática.</li><li>Ruidos de lucha o silencio abdominal.</li><li>Dolor de duración &gt;6 horas.</li><li>Presencia de masa pulsátil.</li><li>Defensa, contractura o signos de irritación peritoneal.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>ABCDE y estabilización inicial.</li><li>Dieta absoluta.</li><li>Monitorización si hay gravedad: TA, FC, FR, SatO₂, ECG y nivel de conciencia.</li><li>Canalizar vía venosa si dolor moderado-grave, vómitos, deshidratación, sospecha quirúrgica, sepsis o shock.</li><li>Fluidoterapia con cristaloides si hipovolemia, shock o mala perfusión.</li><li>Antiemético si vómitos persistentes según protocolo.</li><li>Analgesia si dolor importante. El manual recuerda que la analgesia no elimina la contractura abdominal verdadera.</li><li>Traslado urgente si criterios de gravedad, sospecha de abdomen quirúrgico, aneurisma, embarazo ectópico, sepsis abdominal o deterioro.</li></ol>"
    },
    {
      "h": "Analgesia: enfoque práctico",
      "b": "<ul><li>Si dolor leve y paciente estable, puede esperarse a terminar valoración inicial.</li><li>Si dolor moderado-grave, no debe negarse analgesia por miedo a “enmascarar” el cuadro.</li><li>El manual menciona meperidina, morfina o fentanilo para dolor intenso.</li><li>Registrar dolor antes/después, fármaco, dosis, hora y respuesta.</li><li>Reevaluar defensa/contractura: la analgesia puede aliviar dolor espontáneo y rebote, pero no enmascara contractura abdominal auténtica.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Tomar constantes seriadas y observar tendencia, no solo valor aislado.</li><li>Registrar características del dolor y localización con precisión.</li><li>Valorar signos de deshidratación, shock, ictericia, distensión y sangrado digestivo.</li><li>Mantener dieta absoluta y preparar material para vía venosa, fluidos, antiemético y analgesia.</li><li>No aplicar calor local en abdomen agudo no diagnosticado.</li><li>Transferir: hora de inicio, evolución, exploración, signos de alarma, analgesia y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li> el abdomen sin haber descartado shock, hipoxia o bajo nivel de conciencia.</li><li>Infravalorar dolor abdominal en ancianos, diabéticos, inmunodeprimidos o embarazadas.</li><li>Olvidar causas extraabdominales: IAM inferior, neumonía basal, TEP, cetoacidosis.</li><li>No preguntar por embarazo posible en mujer en edad fértil.</li><li>No reevaluar tras analgesia o durante traslado.</li><li>Dar comida/bebida a un posible abdomen quirúrgico.</li></ul>"
    }
  ],
  "block": 9
},
{
  "id": "digestivo-hemorragia-digestiva-ingesa",
  "cat": "digest",
  "especialidad": "Digestivo / Urgencias / Críticos",
  "title": "Paciente con hemorragia digestiva",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias digestivas, 2013",
  "tags": "hemorragia digestiva hematemesis melena rectorragia hematoquecia varices esofagicas ulcera shock hipovolemico omeprazol via venosa cristaloides transfusion",
  "summary": "Reconocimiento y manejo inicial de la hemorragia digestiva alta o baja, con prioridad en estabilidad hemodinámica, reposición, vía aérea si hematemesis masiva y traslado.",
  "relations": {
    "patologias": [
      "Hemorragia digestiva alta",
      "Hemorragia digestiva baja",
      "Úlcera péptica",
      "Varices esofágicas",
      "Gastritis erosiva",
      "Diverticulosis",
      "Angiodisplasia",
      "Cáncer colorrectal",
      "Shock hipovolémico",
      "Hepatopatía crónica"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Omeprazol/Pantoprazol IV según protocolo",
      "Octreótido/Terlipresina si varices según protocolo",
      "Antibiótico si cirrosis/varices según protocolo",
      "Antieméticos según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "Signos de shock",
      "Glasgow",
      "Glasgow-Blatchford hospitalaria",
      "Rockall hospitalaria"
    ],
    "tecnicas": [
      "Canalización de dos vías gruesas",
      "Monitorización",
      "Sonda nasogástrica si protocolo y sin contraindicación",
      "Posición lateral si vómitos",
      "Transferencia a críticos/endoscopia"
    ],
    "alertas": [
      "hematemesis activa",
      "melenas + hipotensión",
      "rectorragia masiva",
      "síncope",
      "TA baja",
      "taquicardia",
      "piel fría",
      "anticoagulación",
      "cirrosis",
      "alteración conciencia"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La hemorragia digestiva es la pérdida de sangre por cualquier tramo del tubo digestivo. Puede manifestarse como hematemesis, vómitos en posos de café, melenas, hematoquecia o rectorragia. En extrahospitalaria, la clave es valorar repercusión hemodinámica y riesgo vital.</p>"
    },
    {
      "h": "Clasificación práctica",
      "b": "<ul><li><b>Alta:</b> origen proximal al ligamento de Treitz. Suele manifestarse como hematemesis, posos de café o melenas. Causas: úlcera, varices, gastritis, Mallory-Weiss, neoplasia.</li><li><b>Baja:</b> origen distal. Suele manifestarse como rectorragia o hematoquecia. Causas: divertículos, angiodisplasia, colitis, hemorroides, neoplasia.</li><li>Una hemorragia alta masiva también puede dar rectorragia por tránsito rápido.</li></ul>"
    },
    {
      "h": "Anamnesis dirigida",
      "b": "<ul><li>Forma de sangrado: hematemesis, posos de café, melena, rectorragia, hematoquecia.</li><li>Cantidad aproximada, número de episodios y tiempo de evolución.</li><li>Síncope, mareo, debilidad, dolor abdominal, vómitos, fiebre, diarrea.</li><li>Antecedentes: úlcera, cirrosis, varices, hepatopatía, cáncer, EII, hemorroides.</li><li>Medicación: anticoagulantes, antiagregantes, AINEs, corticoides, ISRS.</li><li>Alcohol, vómitos previos, enfermedad hepática, endoscopias previas.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A:</b> riesgo de broncoaspiración si hematemesis activa o bajo nivel de conciencia.</li><li><b>B:</b> SatO₂, FR y trabajo respiratorio. Oxígeno si shock, hipoxemia o anemia/sangrado relevante.</li><li><b>C:</b> TA, FC, perfusión, piel, relleno capilar, pulsos. Buscar shock hipovolémico.</li><li><b>D:</b> Glasgow, confusión, síncope, glucemia si alteración.</li><li><b>E:</b> palidez, ictericia, signos de cirrosis, ascitis, estigmas hepáticos, sangre visible.</li></ol>"
    },
    {
      "h": "Signos de gravedad",
      "b": "<ul><li>Hipotensión, taquicardia o síncope.</li><li>Piel fría, pálida, sudorosa o relleno capilar lento.</li><li>Alteración del nivel de conciencia.</li><li>Hematemesis activa o sangrado abundante.</li><li>Melenas con inestabilidad.</li><li>Cirrosis o sospecha de varices esofágicas.</li><li>Anticoagulación o antiagregación significativa.</li><li>Edad avanzada, comorbilidad cardiopulmonar o renal.</li></ul>"
    },
    {
      "h": "Actuación inicial",
      "b": "<ol><li>Monitorización: TA, FC, FR, SatO₂, ECG y nivel de conciencia.</li><li>Dieta absoluta.</li><li>Posición de seguridad si vómitos o bajo nivel de conciencia; aspiración preparada.</li><li>Canalizar dos vías periféricas gruesas si sangrado importante o inestabilidad.</li><li>Reposición con cristaloides si shock/hipoperfusión; valorar respuesta.</li><li>Oxígeno si hipoxemia, shock o sangrado relevante.</li><li>Tratamiento específico según sospecha: IBP IV en HDA no varicosa; vasoactivo y antibiótico si varices/cirrosis según protocolo.</li><li>Traslado urgente a centro útil con capacidad de endoscopia/hemoterapia si sangrado significativo.</li></ol>"
    },
    {
      "h": "Sospecha de varices esofágicas",
      "b": "<ul><li>Antecedentes de cirrosis, alcoholismo, hepatitis crónica, ascitis, ictericia, varices conocidas o sangrado previo.</li><li>Sangrado puede ser masivo, con hematemesis roja y rápida inestabilidad.</li><li>Prioridad: vía aérea si hematemesis activa, dos vías gruesas, fluidoterapia prudente y preaviso.</li><li>En hospital o unidades con protocolo: terlipresina/octreótido y antibiótico profiláctico.</li><li>Evitar sobrecarga de volumen: puede aumentar presión portal y sangrado.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Cuantificar sangrado de forma aproximada y registrar aspecto.</li><li>Vigilar constantes seriadas y respuesta a fluidos.</li><li>Controlar perfusión: piel, relleno capilar, pulsos, conciencia.</li><li>Preparar aspiración, vía venosa, fluidos y medicación.</li><li>Comprobar anticoagulantes/antiagregantes y hora de última dosis.</li><li>Transferir: tipo de sangrado, volumen, constantes, tratamientos, respuesta, hepatopatía y medicación de riesgo.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Considerar una rectorragia como baja sin valorar que puede ser HDA masiva.</li><li>No proteger vía aérea ante hematemesis activa y bajo nivel de conciencia.</li><li>No preguntar por anticoagulantes/AINEs.</li><li>Retrasar traslado si hay inestabilidad.</li><li>Administrar líquidos sin monitorizar respuesta y signos de sobrecarga.</li><li>No sospechar varices en cirrótico con hematemesis.</li></ul>"
    }
  ],
  "block": 9
},
{
  "id": "digestivo-ictericia-ascitis-encefalopatia-ingesa",
  "cat": "digest",
  "especialidad": "Digestivo / Hepatología / Urgencias",
  "title": "Paciente con ictericia, ascitis y encefalopatía",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias digestivas, 2013",
  "tags": "ictericia ascitis encefalopatia hepatica cirrosis peritonitis bacteriana espontanea colangitis insuficiencia hepatica asterixis flapping amonio lactulosa paracentesis",
  "summary": "Manejo de la descompensación hepática: identificar ictericia, ascitis y encefalopatía, descartar sepsis/hemorragia digestiva y proteger vía aérea si bajo nivel de conciencia.",
  "relations": {
    "patologias": [
      "Ictericia",
      "Ascitis",
      "Encefalopatía hepática",
      "Cirrosis descompensada",
      "Peritonitis bacteriana espontánea",
      "Colangitis",
      "Hemorragia digestiva",
      "Insuficiencia hepática aguda",
      "Síndrome hepatorrenal"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Glucosa si hipoglucemia",
      "Lactulosa según protocolo",
      "Antibióticos si sospecha PBE/colangitis/sepsis",
      "Vitamina K según protocolo",
      "Albúmina hospitalaria"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "West Haven encefalopatía hepática",
      "qSOFA",
      "Child-Pugh/MELD hospitalarias"
    ],
    "tecnicas": [
      "Glucemia capilar",
      "Monitorización",
      "Canalización venosa",
      "Valoración de flapping",
      "Paracentesis diagnóstica hospitalaria",
      "Protección de vía aérea"
    ],
    "alertas": [
      "ictericia + fiebre + hipotensión",
      "ascitis + fiebre/dolor",
      "alteración mental",
      "hemorragia digestiva",
      "asterixis/flapping",
      "hipoglucemia",
      "oliguria",
      "sepsis",
      "no dar sedantes"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La ictericia, la ascitis y la encefalopatía suelen indicar descompensación hepática o enfermedad hepatobiliar grave. En extrahospitalaria, la prioridad es detectar sepsis, hemorragia digestiva, hipoglucemia, bajo nivel de conciencia y necesidad de traslado urgente.</p>"
    },
    {
      "h": "Ictericia: claves prácticas",
      "b": "<ul><li>Coloración amarillenta de piel y mucosas por aumento de bilirrubina.</li><li>Valorar inicio, dolor abdominal, fiebre, coluria, acolia, prurito, pérdida de peso, alcohol, fármacos y hepatopatía previa.</li><li><b>Ictericia + fiebre + dolor en hipocondrio derecho:</b> sospechar colangitis.</li><li><b>Ictericia + hipotensión + fiebre/confusión:</b> emergencia séptica de origen biliar hasta demostrar lo contrario.</li></ul>"
    },
    {
      "h": "Ascitis: concepto y valoración",
      "b": "<p>La ascitis es acumulación de líquido en cavidad peritoneal. La causa más frecuente es enfermedad hepática, especialmente cirrosis.</p><ul><li>Síntomas: distensión abdominal, anorexia, disminución de diuresis, disnea por aumento de presión abdominal.</li><li>Exploración: abdomen globuloso, matidez en flancos y signo de oleada ascítica.</li><li>Distinguir ascitis de novo de descompensación en cirrótico conocido.</li><li>Preguntar abandono de tratamiento, ingesta alcohólica, infección, sangrado digestivo, aumento rápido de perímetro abdominal y dolor.</li></ul>"
    },
    {
      "h": "Sospecha de peritonitis bacteriana espontánea",
      "b": "<p>En cirrótico con ascitis, fiebre, dolor abdominal, deterioro mental, hipotensión, leucocitosis, mal estado general o empeoramiento rápido deben hacer sospechar peritonitis bacteriana espontánea.</p><ul><li>Puede ser poco sintomática.</li><li>La paracentesis diagnóstica es hospitalaria y está indicada en primer episodio, mala respuesta, fiebre, alteración mental, rapidez de instauración, hemorragia digestiva o nuevo ingreso.</li><li>Requiere traslado y antibiótico precoz según protocolo si sospecha clínica alta.</li></ul>"
    },
    {
      "h": "Encefalopatía hepática",
      "b": "<p>La encefalopatía hepática es un deterioro neuropsiquiátrico asociado a insuficiencia hepática o derivación portosistémica. Puede ir desde cambios sutiles de conducta hasta coma.</p><ul><li>Clínica: inversión sueño-vigilia, somnolencia, confusión, irritabilidad, desorientación, bradipsiquia, flapping/asterixis, fetor hepático, coma.</li><li>Desencadenantes: hemorragia digestiva, infección, estreñimiento, exceso de diuréticos, deshidratación, alteraciones electrolíticas, sedantes, alcohol, insuficiencia renal o aumento de proteínas.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A:</b> proteger vía aérea si encefalopatía avanzada, vómitos o hematemesis.</li><li><b>B:</b> SatO₂, FR, disnea por ascitis, neumonía o sepsis.</li><li><b>C:</b> TA, FC, perfusión, signos de shock, sangrado digestivo, diuresis.</li><li><b>D:</b> Glasgow, flapping, glucemia capilar, pupilas, focalidad.</li><li><b>E:</b> fiebre, ictericia, ascitis, edemas, lesiones, signos de cirrosis, exantema/petequias.</li></ol>"
    },
    {
      "h": "Actuación general",
      "b": "<ol><li>ABCDE y soporte vital si precisa.</li><li>Glucemia capilar inmediata si alteración mental: los hepatópatas pueden hacer hipoglucemia.</li><li>Oxígeno si hipoxemia o shock.</li><li>Canalizar vía venosa si inestabilidad, encefalopatía, sospecha de infección o sangrado.</li><li>Evitar sedantes, benzodiacepinas y opiáceos salvo indicación estricta.</li><li>Dieta absoluta si bajo nivel de conciencia o riesgo de procedimiento.</li><li>Buscar desencadenantes: sangrado digestivo, fiebre, infección, estreñimiento, deshidratación, fármacos, alcohol.</li><li>Traslado urgente si encefalopatía, sepsis, colangitis, hemorragia digestiva, ascitis dolorosa/febril o deterioro.</li></ol>"
    },
    {
      "h": "Tratamiento específico orientativo",
      "b": "<ul><li><b>Encefalopatía:</b> lactulosa/rifaximina según protocolo y vía segura; si bajo nivel de conciencia, evitar vía oral no protegida.</li><li><b>Ascitis complicada/PBE:</b> antibiótico hospitalario o prehospitalario si protocolo; paracentesis diagnóstica hospitalaria.</li><li><b>Colangitis/sepsis biliar:</b> antibiótico de amplio espectro, fluidoterapia prudente y traslado urgente a centro con capacidad de drenaje biliar.</li><li><b>Hemorragia digestiva en cirrótico:</b> tratar como HDA con sospecha de varices.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Valorar nivel de conciencia y riesgo de broncoaspiración.</li><li>Glucemia capilar y constantes seriadas.</li><li>Observar flapping/asterixis, ictericia, ascitis, edemas, fiebre, dolor abdominal y sangrado.</li><li>Revisar medicación: diuréticos, lactulosa, benzodiacepinas, opiáceos, anticoagulantes.</li><li>Mantener seguridad: paciente confuso con riesgo de caídas o retirada de dispositivos.</li><li>Transferir: hepatopatía conocida, desencadenante, estado mental, glucemia, sangrado, fiebre, TA, diuresis, fármacos y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>No medir glucemia en hepatópata confuso.</li><li>Atribuir somnolencia a alcohol/sedantes sin buscar encefalopatía, sepsis o hemorragia.</li><li>Dar lactulosa oral a un paciente que no protege vía aérea.</li><li>Olvidar peritonitis bacteriana espontánea en ascitis con fiebre o deterioro mental.</li><li>No sospechar colangitis en ictericia + fiebre + hipotensión/confusión.</li><li>Usar sedantes innecesarios en encefalopatía.</li></ul>"
    }
  ],
  "block": 9
},
{
  "id": "toxico-intoxicaciones-manejo-inicial-ingesa",
  "cat": "toxico",
  "especialidad": "Toxicología / Urgencias / Críticos",
  "title": "Intoxicaciones: manejo inicial",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias toxicológicas, 2013",
  "tags": "intoxicacion aguda toxico ABC Glasgow pupilas RCP prolongada carbon activado lavado gastrico antidoto descontaminacion naloxona flumazenil hipoglucemia",
  "summary": "Abordaje inicial del paciente intoxicado: seguridad de escena, ABCDE, valoración neurológica, identificación del tóxico, descontaminación, antídotos y traslado.",
  "relations": {
    "patologias": [
      "Intoxicación aguda",
      "Coma tóxico",
      "Depresión respiratoria",
      "Convulsiones por tóxicos",
      "Shock tóxico",
      "Arritmias por tóxicos",
      "Síndrome colinérgico",
      "Síndrome simpaticomimético"
    ],
    "farmacos": [
      "Oxígeno",
      "Glucosa",
      "Tiamina",
      "Naloxona",
      "Flumazenil",
      "Carbón activado",
      "Benzodiacepinas",
      "Cristaloides",
      "Bicarbonato sódico según tóxico"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "AVDI",
      "Glucemia capilar",
      "ECG 12 derivaciones",
      "Pupilas"
    ],
    "tecnicas": [
      "Seguridad de escena",
      "Descontaminación",
      "Aspiración de secreciones",
      "Canalización venosa",
      "Monitorización ECG",
      "Lavado cutáneo/ocular",
      "Protección de vía aérea"
    ],
    "alertas": [
      "prioridad ABC sobre antídoto",
      "RCP prolongada en intoxicados",
      "glucemia siempre",
      "pupilas orientan",
      "arritmia grave en joven",
      "no carbón si vía aérea no protegida",
      "cáusticos/hidrocarburos",
      "notas de despedida/entorno"
    ]
  },
  "sec": [
    {
      "h": "Principio clave",
      "b": "<p>En toda intoxicación, el soporte vital va antes que identificar el tóxico o administrar antídotos. La primera actuación es valorar rápidamente <b>ABC</b> y estado neurológico —Glasgow y pupilas—, actuando con soporte vital avanzado si procede. En intoxicados, la reanimación puede requerir tiempos más prolongados.</p>"
    },
    {
      "h": "Seguridad de escena",
      "b": "<ol><li>Proteger al equipo: guantes, mascarilla, gafas y ventilación del entorno si hay gases o productos químicos.</li><li>No entrar en atmósferas peligrosas sin equipo especializado.</li><li>Retirar al paciente de la fuente de exposición si es seguro.</li><li>Identificar riesgos secundarios: monóxido de carbono, pesticidas, productos industriales, violencia, agujas, vómitos o contaminación cutánea.</li><li>Conservar envases, blísteres, notas, jeringas o restos del tóxico para el hospital si es seguro.</li></ol>"
    },
    {
      "h": "Cuándo sospechar intoxicación",
      "b": "<ul><li>Exposición conocida o encontrada en el entorno.</li><li>Deterioro brusco en paciente con patología psiquiátrica previa.</li><li>Traumatismo con mala evolución no explicada.</li><li>Alteración del nivel de conciencia o afectación multiorgánica sin causa clara, especialmente en jóvenes.</li><li>Arritmias graves en jóvenes o niños sin enfermedad previa.</li><li>Antecedentes de consumo de drogas, alcohol, demencia, intentos autolíticos o acceso a medicamentos/tóxicos.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A:</b> vía aérea. Riesgo de broncoaspiración por vómitos o bajo nivel de conciencia. Aspiración preparada.</li><li><b>B:</b> FR, SatO₂, patrón respiratorio, depresión respiratoria, broncoespasmo, edema pulmonar o hipoxia.</li><li><b>C:</b> TA, FC, perfusión, ECG, arritmias, shock, QT/QRS alterados.</li><li><b>D:</b> Glasgow, pupilas, glucemia capilar, convulsiones, focalidad, agitación o coma.</li><li><b>E:</b> temperatura, piel, olores, lesiones de venopunción, sudoración, sequedad, miosis/midriasis, signos de abandono o trauma.</li></ol>"
    },
    {
      "h": "Historia clínica toxicológica",
      "b": "<ul><li>Tipo de tóxico o tóxicos.</li><li>Vía de entrada: oral, inhalada, cutánea, parenteral, ocular, rectal/vaginal.</li><li>Dosis aproximada y concentración del producto.</li><li>Tiempo transcurrido desde exposición.</li><li>Síntomas presentes y evolución.</li><li>Antecedentes: intentos previos, psiquiatría, epilepsia, cardiopatía, embarazo, insuficiencia renal/hepática.</li><li>Tratamientos crónicos y alergias.</li><li>Entorno: blísteres vacíos, jeringuillas, estufa encendida, ambiente laboral, olores, productos domésticos, pesticidas o notas de despedida.</li></ul>"
    },
    {
      "h": "Síndromes tóxicos orientativos",
      "b": "<ul><li><b>Opioide:</b> miosis, depresión respiratoria, coma, bradicardia/hipotensión.</li><li><b>Simpaticomimético:</b> midriasis, taquicardia, hipertensión, hipertermia, agitación, sudoración; cocaína/anfetaminas.</li><li><b>Anticolinérgico:</b> midriasis, piel seca, hipertermia, retención urinaria, delirium.</li><li><b>Colinérgico:</b> miosis, broncorrea, sialorrea, lagrimeo, diarrea, vómitos, bradicardia; organofosforados/carbamatos.</li><li><b>Sedante-hipnótico:</b> somnolencia/coma, hipotonía, depresión respiratoria variable.</li><li><b>Serotoninérgico:</b> hipertermia, agitación, mioclonías, hiperreflexia, diarrea.</li></ul>"
    },
    {
      "h": "Descontaminación",
      "b": "<ul><li><b>Cutánea:</b> retirar ropa contaminada y lavar con agua abundante. Proteger al equipo.</li><li><b>Ocular:</b> irrigación inmediata y prolongada con suero/agua, sin retrasar traslado si lesión grave.</li><li><b>Digestiva:</b> valorar carbón activado si ingesta reciente, tóxico adsorbible y vía aérea protegida.</li><li><b>Lavado gástrico:</b> indicaciones muy restringidas; solo en tóxico potencialmente letal, ingesta reciente y entorno protegido.</li><li>No inducir el vómito.</li><li>No usar carbón activado si cáusticos, hidrocarburos, alcoholes, metales/litio/hierro o vía aérea no protegida, salvo indicación experta.</li></ul>"
    },
    {
      "h": "Antídotos: principio de uso",
      "b": "<p>Los antídotos no sustituyen al ABC. Deben usarse cuando el cuadro clínico y la sospecha son compatibles, el beneficio supera el riesgo y existe monitorización adecuada.</p><ul><li>Glucosa si hipoglucemia.</li><li>Tiamina en desnutrición/alcoholismo antes o junto con glucosa según protocolo.</li><li>Naloxona si depresión respiratoria por opioides.</li><li>Flumazenil solo en sospecha clara de benzodiacepinas aisladas y con mucha prudencia.</li><li>Otros antídotos específicos según tóxico y protocolo.</li></ul>"
    },
    {
      "h": "Criterios de traslado urgente",
      "b": "<ul><li>Bajo nivel de conciencia, coma o convulsiones.</li><li>Depresión respiratoria, SatO₂ baja o necesidad de ventilación.</li><li>Arritmias, QRS ancho, QT largo, hipotensión o shock.</li><li>Intento autolítico o riesgo suicida.</li><li>Ingesta de tóxico de liberación retardada, desconocido o potencialmente letal.</li><li>Exposición a gases, cáusticos, pesticidas, monóxido de carbono o tóxicos industriales.</li><li>Niños, embarazadas, ancianos, comorbilidad relevante o intoxicación múltiple.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Seguridad del equipo y aislamiento del tóxico.</li><li>Glucemia capilar precoz y registro.</li><li>Monitorizar ECG, SatO₂, FR, TA, FC, temperatura y Glasgow.</li><li>Preparar aspiración, oxígeno, BVM, vía venosa y medicación de rescate.</li><li>Recoger envases/blísteres y documentar cantidades, hora y testigos.</li><li>Vigilar broncoaspiración y cambios neurológicos.</li><li>Transferir: tóxico, dosis, tiempo, vía, clínica, constantes, ECG, glucemia, descontaminación, antídotos y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Centrarse en el antídoto y olvidar vía aérea/ventilación.</li><li>No medir glucemia.</li><li>Dar carbón activado a paciente somnoliento sin vía aérea protegida.</li><li>Inducir el vómito.</li><li>Usar flumazenil de forma indiscriminada.</li><li>No valorar riesgo suicida.</li><li>No proteger al equipo ante gases, pesticidas o químicos.</li></ul>"
    }
  ],
  "block": 10
},
{
  "id": "toxico-tratamiento-especifico-habituales-ingesa",
  "cat": "toxico",
  "especialidad": "Toxicología / Urgencias / Farmacología",
  "title": "Tratamiento específico en intoxicaciones habituales",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias toxicológicas, 2013",
  "tags": "antidotos intoxicaciones paracetamol NAC opioides naloxona benzodiacepinas flumazenil organofosforados atropina pralidoxima monoxido carbono salicilatos causticos alcoholes",
  "summary": "Ficha de antídotos y medidas específicas frecuentes, organizada para búsqueda rápida en iNurse y relación directa con tóxicos, fármacos y alertas.",
  "relations": {
    "patologias": [
      "Intoxicación por paracetamol",
      "Intoxicación por opioides",
      "Intoxicación por benzodiacepinas",
      "Intoxicación por organofosforados",
      "Intoxicación por monóxido de carbono",
      "Intoxicación por salicilatos",
      "Ingesta de cáusticos",
      "Intoxicación por alcoholes tóxicos",
      "Intoxicación por antidepresivos tricíclicos"
    ],
    "farmacos": [
      "N-acetilcisteína",
      "Naloxona",
      "Flumazenil",
      "Atropina",
      "Pralidoxima",
      "Hidroxicobalamina",
      "Oxígeno 100 %",
      "Bicarbonato sódico",
      "Vitamina K",
      "Carbón activado",
      "Diazepam/Midazolam"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "ECG 12 derivaciones",
      "Glucemia capilar",
      "Pupilas"
    ],
    "tecnicas": [
      "Descontaminación cutánea",
      "Lavado ocular",
      "Carbón activado",
      "Monitorización ECG",
      "Soporte ventilatorio",
      "Consulta toxicológica"
    ],
    "alertas": [
      "no carbón en cáusticos/hidrocarburos",
      "NAC precoz en paracetamol",
      "naloxona si depresión respiratoria",
      "flumazenil puede provocar convulsiones",
      "atropinizar en organofosforados",
      "CO: O2 al 100 %",
      "QRS ancho: bicarbonato"
    ]
  },
  "sec": [
    {
      "h": "Cómo usar esta ficha",
      "b": "<p>Esta ficha resume tratamientos específicos de intoxicaciones frecuentes. Debe usarse después de estabilizar ABCDE. En toxicología, la misma sustancia puede requerir manejo distinto según dosis, tiempo, formulación, vía, comorbilidad y coingestas.</p>"
    },
    {
      "h": "Paracetamol",
      "b": "<ul><li>Riesgo principal: hepatotoxicidad diferida.</li><li>El paciente puede estar asintomático al inicio.</li><li>Recoger dosis total, mg/kg, hora de ingesta, formulación, alcoholismo, ayuno, hepatopatía y fármacos inductores.</li><li><b>Antídoto:</b> N-acetilcisteína, más eficaz cuanto más precoz.</li><li>Derivación hospitalaria para niveles plasmáticos, nomograma y función hepática.</li><li>Si ingesta potencialmente tóxica o tiempo incierto: consultar toxicología/protocolo y no retrasar traslado.</li></ul>"
    },
    {
      "h": "Opioides",
      "b": "<ul><li>Triada típica: coma, miosis y depresión respiratoria.</li><li>La prioridad es ventilar y oxigenar.</li><li><b>Naloxona:</b> indicada si depresión respiratoria o coma compatible.</li><li>Puede precipitar abstinencia, agitación, vómitos o dolor; titular a recuperar ventilación, no necesariamente conciencia completa.</li><li>Vigilar recurrencia por opioides de vida media larga: puede requerir dosis repetidas o perfusión hospitalaria.</li></ul>"
    },
    {
      "h": "Benzodiacepinas",
      "b": "<ul><li>Suelen producir somnolencia, ataxia, disartria, hipotensión leve y depresión respiratoria variable, más grave si hay alcohol/opioides.</li><li>Tratamiento principal: soporte ventilatorio y vigilancia.</li><li><b>Flumazenil:</b> uso muy restringido. Evitar si epilepsia, dependencia a benzodiacepinas, intoxicación mixta, antidepresivos tricíclicos, riesgo de convulsiones o QRS ancho.</li><li>Puede desencadenar convulsiones o abstinencia.</li></ul>"
    },
    {
      "h": "Antidepresivos tricíclicos y fármacos con QRS ancho",
      "b": "<ul><li>Clínica: coma, convulsiones, hipotensión, arritmias, midriasis, sequedad, delirium, QRS ancho.</li><li>ECG precoz y monitorización continua.</li><li>Si QRS ancho, arritmia ventricular o hipotensión por toxicidad de membrana: bicarbonato sódico IV según protocolo.</li><li>Evitar flumazenil si coingesta posible.</li><li>Traslado a críticos.</li></ul>"
    },
    {
      "h": "Organofosforados / carbamatos",
      "b": "<ul><li>Síndrome colinérgico: miosis, broncorrea, broncoespasmo, salivación, lagrimeo, sudoración, vómitos, diarrea, bradicardia, fasciculaciones, debilidad y convulsiones.</li><li>Proteger al equipo y retirar ropa contaminada.</li><li>Lavado cutáneo abundante si exposición dérmica.</li><li>Aspirar secreciones y oxígeno.</li><li><b>Atropina:</b> repetir hasta signos de atropinización clínica y control de secreciones bronquiales.</li><li><b>Pralidoxima:</b> especialmente en organofosforados, según protocolo.</li></ul>"
    },
    {
      "h": "Monóxido de carbono",
      "b": "<ul><li>Sospechar ante cefalea, mareo, náuseas, confusión, síncope, convulsiones o varios afectados en el mismo lugar, especialmente con estufas, braseros, incendios o mala ventilación.</li><li>SatO₂ puede ser falsamente normal con pulsioxímetro convencional.</li><li>Retirar de la fuente y ventilar el entorno solo si es seguro.</li><li><b>Oxígeno al 100 %</b> con mascarilla reservorio.</li><li>Valorar cámara hiperbárica según gravedad, embarazo, pérdida de conciencia, acidosis, síntomas neurológicos o carboxihemoglobina.</li></ul>"
    },
    {
      "h": "Cáusticos",
      "b": "<ul><li>No inducir vómito.</li><li>No neutralizar con ácidos/bases.</li><li>No carbón activado de rutina.</li><li>No colocar sonda nasogástrica a ciegas.</li><li>Valorar vía aérea: edema, estridor, sialorrea, disfagia, dolor orofaríngeo o quemaduras.</li><li>Dieta absoluta y traslado urgente si síntomas, ingesta significativa o producto desconocido.</li></ul>"
    },
    {
      "h": "Hidrocarburos",
      "b": "<ul><li>Riesgo principal: aspiración y neumonitis química.</li><li>No inducir vómito.</li><li>Carbón activado generalmente no útil.</li><li>Vigilar tos, disnea, fiebre, hipoxemia o alteraciones respiratorias.</li><li>Traslado si síntomas respiratorios, ingesta importante, niño pequeño o producto con aditivos tóxicos.</li></ul>"
    },
    {
      "h": "Salicilatos",
      "b": "<ul><li>Clínica: náuseas, vómitos, tinnitus, hiperventilación, fiebre, alteración mental, acidosis y shock en graves.</li><li>Monitorización y traslado hospitalario para niveles, equilibrio ácido-base y electrolitos.</li><li>Tratamiento específico hospitalario: alcalinización con bicarbonato y hemodiálisis en casos graves.</li><li>Evitar sedación innecesaria: puede empeorar ventilación compensadora.</li></ul>"
    },
    {
      "h": "Alcoholes tóxicos",
      "b": "<ul><li>Metanol y etilenglicol pueden producir acidosis metabólica grave, alteración visual, fracaso renal, coma y muerte.</li><li>Puede haber periodo inicial con pocos síntomas.</li><li>Tratamiento hospitalario: fomepizol/etanol, bicarbonato, cofactores y hemodiálisis según caso.</li><li>En extrahospitalaria: ABCDE, glucemia, monitorización y traslado urgente si sospecha.</li></ul>"
    },
    {
      "h": "Raticidas anticoagulantes",
      "b": "<ul><li>Riesgo: sangrado diferido por alteración de vitamina K.</li><li>Recoger producto, dosis y tiempo.</li><li>El manual menciona aspiración/lavado gástrico seguido de carbón activado o lavado cutáneo si exposición dérmica, y vitamina K si procede.</li><li>Si manifestaciones hemorrágicas: requiere atención hospitalaria urgente y posible plasma/factores.</li></ul>"
    },
    {
      "h": "Convulsiones por tóxicos",
      "b": "<ul><li>Proteger de lesiones y asegurar vía aérea.</li><li>Glucemia inmediata.</li><li>Benzodiacepinas son primera línea en la mayoría de convulsiones tóxicas.</li><li>Buscar tóxicos asociados: cocaína, anfetaminas, tricíclicos, isoniazida, teofilina, organofosforados, abstinencia.</li><li>Traslado a críticos si recurrentes, estatus, acidosis, hipertermia o arritmias.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Tener tabla de antídotos vinculada a fármacos de iNurse.</li><li>Doble verificación de dosis y diluciones: antídotos son medicación de alto riesgo.</li><li>Registrar hora exacta de exposición e intervención.</li><li>Monitorización ECG si tóxico cardiotóxico o sedación.</li><li>Vigilar respiración, broncoaspiración, convulsiones, temperatura y respuesta a antídotos.</li><li>Consultar centro toxicológico/protocolo local si dudas.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Usar antídotos sin monitorización.</li><li>Dar carbón activado de forma automática.</li><li>Olvidar coingestas.</li><li>Fiarse de pulsioximetría normal en monóxido de carbono.</li><li>Neutralizar cáusticos.</li><li>Dar flumazenil si hay riesgo de convulsión o intoxicación mixta.</li></ul>"
    }
  ],
  "block": 10
},
{
  "id": "toxico-drogas-abuso-ingesa",
  "cat": "toxico",
  "especialidad": "Toxicología / Urgencias / Psiquiatría",
  "title": "Emergencias por consumo de drogas de abuso",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias toxicológicas, 2013",
  "tags": "drogas de abuso heroina opioides metadona naloxona cocaina anfetaminas drogas sintesis cannabis LSD policonsumo body packer hipertermia agitación",
  "summary": "Manejo de intoxicaciones por drogas de abuso: opioides, cocaína, anfetaminas/drogas de síntesis, cannabis, alucinógenos y body packers, con énfasis en ABC y complicaciones.",
  "relations": {
    "patologias": [
      "Sobredosis opioide",
      "Intoxicación por cocaína",
      "Intoxicación por anfetaminas/MDMA",
      "Síndrome simpaticomimético",
      "Hipertermia maligna por drogas",
      "Psicosis tóxica",
      "Body packer/body stuffer",
      "Policonsumo"
    ],
    "farmacos": [
      "Oxígeno",
      "Naloxona",
      "Benzodiacepinas",
      "Cristaloides",
      "Antitérmicos físicos",
      "Antihipertensivos según protocolo",
      "Carbón activado si indicado",
      "Glucosa"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "AVDI",
      "Glucemia capilar",
      "ECG 12 derivaciones",
      "Temperatura central"
    ],
    "tecnicas": [
      "Ventilación con BVM",
      "Monitorización ECG",
      "Control de hipertermia",
      "Contención verbal",
      "Canalización venosa",
      "Aspiración de secreciones",
      "Traslado a críticos"
    ],
    "alertas": [
      "policonsumo",
      "depresión respiratoria",
      "miosis + coma",
      "dolor torácico con cocaína",
      "hipertermia",
      "agitación severa",
      "convulsiones",
      "body packer: no manipular paquetes",
      "riesgo suicida/violencia"
    ]
  },
  "sec": [
    {
      "h": "Contexto",
      "b": "<p>El manual señala que la intoxicación por drogas, ya sea aguda o crónica, puede producir problemas psicofísicos graves, muerte o secuelas permanentes. La heroína y otros opioides son responsables de gran parte de los cuadros graves, y la cocaína, las drogas de síntesis y el policonsumo han aumentado la complejidad del manejo.</p>"
    },
    {
      "h": "Manejo inicial común",
      "b": "<ol><li>Seguridad de escena: agujas, violencia, tóxicos, entorno nocturno/festivo o espacios cerrados.</li><li>ABCDE y soporte vital.</li><li>Glucemia capilar en todo paciente con alteración neurológica.</li><li>Monitorización ECG, SatO₂, TA, FC, FR, temperatura y Glasgow.</li><li>Preguntar sustancia, cantidad, vía, hora, policonsumo, alcohol y comorbilidades.</li><li>Buscar complicaciones: trauma, aspiración, rabdomiólisis, hipertermia, SCA, ictus, convulsiones, sepsis.</li><li>No juzgar; obtener información útil y mantener seguridad.</li></ol>"
    },
    {
      "h": "Opioides: heroína, metadona y otros",
      "b": "<ul><li>Clínica típica: miosis, coma/somnolencia y depresión respiratoria.</li><li>También puede haber bradipnea, cianosis, hipotensión, edema pulmonar no cardiogénico, vómitos y broncoaspiración.</li><li>Tratamiento: abrir vía aérea, oxígeno, ventilación con bolsa-mascarilla si hipoventila y naloxona si depresión respiratoria compatible.</li><li>Titular naloxona para recuperar respiración eficaz, evitando despertar brusco/agitación si es posible.</li><li>Vigilar renarcotización, especialmente con metadona u opioides de larga duración.</li></ul>"
    },
    {
      "h": "Cocaína",
      "b": "<ul><li>Síndrome simpaticomimético: agitación, ansiedad, midriasis, sudoración, taquicardia, hipertensión, hipertermia.</li><li>Complicaciones graves: dolor torácico/SCA, arritmias, ictus, convulsiones, disección aórtica, hipertermia, rabdomiólisis.</li><li>Tratamiento inicial: ambiente tranquilo, monitorización, oxígeno si precisa, benzodiacepinas para agitación/hiperactividad simpática según protocolo.</li><li>Dolor torácico: tratar como SCA, con particular atención a vasoespasmo y arritmias.</li><li>Evitar contención física prolongada sin sedación/monitorización si hipertermia o lucha intensa.</li></ul>"
    },
    {
      "h": "Anfetaminas, MDMA y drogas de síntesis",
      "b": "<ul><li>Clínica: agitación, ansiedad, euforia, alucinaciones, midriasis, taquicardia, hipertensión, hipertermia, bruxismo, sudoración.</li><li>Complicaciones: hipertermia severa, hiponatremia, convulsiones, rabdomiólisis, arritmias, fallo renal, síndrome serotoninérgico.</li><li>Tratamiento: ABC, control de temperatura, benzodiacepinas si agitación/convulsiones, fluidoterapia prudente y traslado.</li><li>La hipertermia es una emergencia: enfriamiento físico activo y traslado a críticos.</li></ul>"
    },
    {
      "h": "Cannabis",
      "b": "<ul><li>Puede producir ansiedad intensa, pánico, taquicardia, hipotensión ortostática, vómitos, somnolencia o psicosis en susceptibles.</li><li>Valorar siempre policonsumo.</li><li>Tratamiento habitual: ambiente tranquilo, observación, hidratación si precisa y manejo sintomático.</li><li>Derivar si psicosis, agitación severa, dolor torácico, síncope, embarazo, menor, intoxicación accidental o mala evolución.</li></ul>"
    },
    {
      "h": "Alucinógenos: LSD y similares",
      "b": "<ul><li>Clínica: alteraciones perceptivas, ansiedad, pánico, delirios, midriasis, taquicardia, hipertensión variable.</li><li>Riesgo: conducta imprevisible, traumatismos, psicosis, mezcla con estimulantes.</li><li>Tratamiento: entorno tranquilo, reducir estímulos, contención verbal y benzodiacepinas si agitación intensa según protocolo.</li><li>Evitar confrontar la experiencia delirante de forma brusca; priorizar seguridad.</li></ul>"
    },
    {
      "h": "Body packers / body stuffers",
      "b": "<ul><li><b>Body packer:</b> ingesta planificada de paquetes de droga para transporte.</li><li><b>Body stuffer:</b> ingesta precipitada para ocultar droga; paquetes peor preparados y más riesgo de rotura.</li><li>Riesgo fatal por rotura de paquete: opioides, cocaína u otras drogas.</li><li>No manipular rectalmente ni intentar extraer paquetes en extrahospitalaria.</li><li>Si asintomático, igualmente requiere valoración hospitalaria.</li><li>Si síntomas de sobredosis o simpaticomiméticos: tratar ABC y trasladar a críticos.</li></ul>"
    },
    {
      "h": "Hipertermia por drogas",
      "b": "<ul><li>Temperatura elevada con agitación, rigidez, convulsiones o alteración mental es emergencia vital.</li><li>Retirar ropa, enfriamiento físico activo, fluidoterapia según estado, benzodiacepinas si agitación/temblor/convulsiones.</li><li>Buscar rabdomiólisis, acidosis, hipoglucemia/hiponatremia y arritmias.</li><li>Traslado urgente a centro con críticos.</li></ul>"
    },
    {
      "h": "Paciente agitado por drogas",
      "b": "<ul><li>Priorizar seguridad y desescalada verbal.</li><li>Evitar lucha física prolongada: aumenta acidosis, hipertermia y rabdomiólisis.</li><li>Benzodiacepinas suelen ser primera opción en estimulantes, drogas de síntesis y alucinógenos con agitación severa.</li><li>Monitorizar respiración, SatO₂, TA y ECG tras sedación.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Glucemia capilar y constantes completas, incluida temperatura.</li><li>Preparar aspiración, oxígeno, BVM, vía venosa y naloxona si opioides.</li><li>Vigilar depresión respiratoria, broncoaspiración, convulsiones, dolor torácico y cambios de conducta.</li><li>Registrar sustancia declarada, vía, hora, policonsumo, alcohol, testigos y respuesta al tratamiento.</li><li>Comunicación no punitiva: facilita información clínica y reduce conflicto.</li><li>Transferir riesgos: body packer, hipertermia, SCA, trauma, agitación, necesidad de vigilancia y antídotos.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Asumir que una sola droga explica todo: el policonsumo es frecuente.</li><li>No medir glucemia.</li><li>Despertar bruscamente a sobredosis opioide con naloxona excesiva si basta con recuperar respiración.</li><li>Infravalorar dolor torácico por cocaína.</li><li>Contener físicamente a un paciente hipertermico/agitado sin monitorización.</li><li>No trasladar a body packer asintomático.</li><li>No vigilar renarcotización tras naloxona.</li></ul>"
    }
  ],
  "block": 10
},
{
  "id": "obst-parto-inminente-ingesa",
  "cat": "obst",
  "especialidad": "Obstetricia / Urgencias / Pediatría neonatal",
  "title": "Urgencias obstétricas: atención al parto inminente",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias obstétrico-ginecológicas, 2013",
  "tags": "parto inminente coronación expulsivo alumbramiento puerperio recién nacido cordón umbilical circular cordón distocia hombros prolapso cordón hemorragia posparto oxitocina Apgar",
  "summary": "Asistencia al parto extrahospitalario inminente: preparación, expulsivo, atención al recién nacido, alumbramiento, puerperio inmediato y complicaciones prioritarias.",
  "relations": {
    "patologias": [
      "Parto inminente",
      "Expulsivo",
      "Alumbramiento",
      "Circular de cordón",
      "Distocia de hombros",
      "Prolapso de cordón",
      "Hemorragia posparto",
      "Reanimación neonatal",
      "Preeclampsia/eclampsia"
    ],
    "farmacos": [
      "Oxitocina",
      "Oxígeno",
      "Cristaloides",
      "Sulfato de magnesio si eclampsia según protocolo",
      "Antihipertensivos obstétricos según protocolo"
    ],
    "escalas": [
      "Test de Apgar",
      "ABCDE materno",
      "Valoración neonatal inicial",
      "Glasgow si convulsión/alteración conciencia"
    ],
    "tecnicas": [
      "Asistencia al expulsivo",
      "Pinzamiento y corte del cordón",
      "Secado y abrigo neonatal",
      "Contacto piel con piel si estable",
      "Masaje uterino",
      "Maniobra de McRoberts",
      "Maniobra de Woods",
      "Aspiración neonatal solo si precisa"
    ],
    "alertas": [
      "coronación visible",
      "sangrado abundante",
      "prolapso de cordón",
      "distocia de hombros",
      "líquido meconial + depresión neonatal",
      "convulsión gestante",
      "TA elevada",
      "no tirar del cordón",
      "no retrasar traslado si complicación"
    ]
  },
  "sec": [
    {
      "h": "Concepto y objetivo",
      "b": "<p>El parto inminente se produce cuando el expulsivo está avanzado y existe coronación, deseo intenso de empujar, contracciones muy frecuentes o imposibilidad razonable de traslado antes del nacimiento. El objetivo es acompañar un proceso fisiológico, detectar complicaciones y proteger a madre y recién nacido.</p><ul><li>Si el parto no es inminente y no hay complicación, priorizar traslado a centro obstétrico.</li><li>Si hay coronación clara, prepararse para asistir el parto en el lugar.</li><li>Mantener calma: la comunicación con la gestante y acompañante es parte del tratamiento.</li></ul>"
    },
    {
      "h": "Material básico",
      "b": "<ul><li>Guantes y paños estériles si disponibles.</li><li>Toallas o sábanas limpias para secar, cubrir y abrigar al recién nacido.</li><li>Mantas para la puérpera.</li><li>Gasas y compresas estériles.</li><li>Dos pinzas de Kocher o pinzas umbilicales.</li><li>Tijera estéril o bisturí para cortar cordón.</li><li>Sondas de aspiración neonatal nº 8-10 si precisa.</li><li>Equipo de venoclisis y cristaloides si hemorragia o inestabilidad.</li><li>Oxitocina si disponible y protocolo local.</li><li>Material de reanimación neonatal: bolsa-mascarilla neonatal, oxígeno/aire, aspiración y fuente de calor.</li></ul>"
    },
    {
      "h": "Antes del nacimiento",
      "b": "<ol><li>Identificarse y tranquilizar a la gestante.</li><li>Valorar ABC materno, constantes, sangrado, dolor, conciencia y semanas de gestación.</li><li>Preguntar: número de embarazo/partos, semanas, contracciones, rotura de bolsa, color del líquido, sangrado, problemas del embarazo, preeclampsia, diabetes, parto múltiple o presentación anómala.</li><li>Colocar a la mujer en posición cómoda y segura, con intimidad y espacio para asistencia.</li><li>Lavar manos, colocar guantes y preparar material.</li><li>Si no hay coronación y el traslado es posible, trasladar a centro obstétrico.</li></ol>"
    },
    {
      "h": "Expulsivo: salida de la cabeza y hombros",
      "b": "<ol><li>Acompañar la salida de la cabeza sin traccionar.</li><li>Controlar la velocidad de salida para evitar desgarros, dejando que la contracción guíe.</li><li>Cuando salga la cabeza, comprobar si hay circular de cordón alrededor del cuello.</li><li>Si la circular está floja, deslizarla suavemente por encima de la cabeza.</li><li>Si está muy tensa y no permite el nacimiento, pinzar con dos Kocher y cortar entre ellas, procurando que el niño nazca con rapidez.</li><li>Permitir rotación externa espontánea de la cabeza.</li><li>Acompañar la salida del hombro anterior y después el posterior, sin tracción excesiva.</li><li>Recibir al recién nacido con firmeza: está mojado y resbaladizo.</li></ol>"
    },
    {
      "h": "Atención inmediata al recién nacido",
      "b": "<ul><li>Secar de forma vigorosa pero cuidadosa y retirar paños mojados.</li><li>Abrigar inmediatamente y mantener calor.</li><li>Si respira o llora y tiene buen tono: contacto piel con piel con la madre si ambos estables.</li><li>Valorar respiración, tono, color y frecuencia cardiaca.</li><li>No aspirar de rutina si el recién nacido está vigoroso; aspirar solo si secreciones obstruyen o hay dificultad.</li><li>Registrar hora de nacimiento.</li><li>Valorar Apgar al minuto y a los 5 minutos si es posible.</li></ul>"
    },
    {
      "h": "Pinzamiento y corte del cordón",
      "b": "<ul><li>Si madre y recién nacido están estables, se puede retrasar el pinzamiento según protocolo local.</li><li>Si precisa reanimación, hay circular tensa o situación urgente, pinzar y cortar según necesidad.</li><li>Colocar dos pinzas separadas y cortar entre ellas con material estéril.</li><li>Comprobar ausencia de sangrado en muñón umbilical.</li></ul>"
    },
    {
      "h": "Alumbramiento",
      "b": "<ul><li>El alumbramiento es la expulsión de la placenta.</li><li>No tirar del cordón.</li><li>Esperar salida espontánea si la madre está estable.</li><li>Tras salida de placenta, comprobar que parece completa y conservarla para revisión hospitalaria.</li><li>Masaje uterino si sangrado aumentado o útero blando.</li><li>Oxitocina según protocolo para prevenir/tratar hemorragia posparto.</li></ul>"
    },
    {
      "h": "Hemorragia posparto",
      "b": "<ul><li>Sospechar si sangrado abundante, empapa compresas rápidamente, mareo, palidez, taquicardia, hipotensión o útero blando.</li><li>Masaje uterino firme.</li><li>Favorecer vaciamiento vesical si procede.</li><li>Oxitocina según protocolo.</li><li>Dos vías venosas gruesas y cristaloides si inestabilidad.</li><li>Control de constantes, abrigo y traslado urgente a centro obstétrico.</li><li>Registrar cantidad aproximada de sangrado y respuesta.</li></ul>"
    },
    {
      "h": "Distocia de hombros",
      "b": "<p>Sospechar si sale la cabeza pero los hombros no progresan, aparece “signo de la tortuga” o hay dificultad para nacimiento del hombro anterior. Es una emergencia.</p><ol><li>Pedir ayuda y explicar a la madre que deje de empujar momentáneamente si se indica.</li><li>Maniobra de McRoberts: hiperflexionar muslos sobre abdomen materno.</li><li>Presión suprapúbica dirigida, nunca presión en el fondo uterino.</li><li>Si no resuelve: maniobras internas como Woods rectificada por personal entrenado.</li><li>Último recurso: extracción del brazo posterior o medidas avanzadas.</li><li>Tras el nacimiento, valorar lesiones neonatales y estado materno.</li></ol>"
    },
    {
      "h": "Prolapso de cordón",
      "b": "<ul><li>Sospechar si se ve/palpa cordón por vagina antes del nacimiento, especialmente tras rotura de bolsa.</li><li>No reintroducir el cordón.</li><li>Aliviar compresión elevando presentación fetal con mano enguantada si personal entrenado.</li><li>Posición genupectoral o Trendelenburg lateralizada.</li><li>Cubrir cordón con gasas estériles humedecidas con suero templado.</li><li>Traslado urgentísimo a centro obstétrico.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Comunicación calmada y continua con madre y acompañante.</li><li>Proteger intimidad y temperatura.</li><li>Registrar: hora de nacimiento, Apgar, sexo, estado del recién nacido, sangrado, placenta, constantes maternas y medicación.</li><li>Vigilar útero, sangrado, TA, FC, conciencia y dolor.</li><li>Vigilar recién nacido: respiración, tono, color, temperatura, cordón y lactancia/contacto si estable.</li><li>Transferir madre, recién nacido y placenta al hospital con datos del parto.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Intentar retrasar un parto con coronación clara.</li><li>Traccionar del bebé o del cordón.</li><li>Olvidar valorar circular de cordón al salir la cabeza.</li><li>Presionar el fondo uterino en distocia de hombros.</li><li>Separar innecesariamente a madre y recién nacido si ambos están estables.</li><li>No prevenir hipotermia neonatal.</li><li>No vigilar hemorragia posparto.</li></ul>"
    }
  ],
  "block": 11
},
{
  "id": "gine-urgencias-ginecologicas-ingesa",
  "cat": "obst",
  "especialidad": "Ginecología / Urgencias / Cirugía",
  "title": "Urgencias ginecológicas",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias obstétrico-ginecológicas, 2013",
  "tags": "urgencias ginecologicas dolor abdominopelvico hemorragia genital test gestacion embarazo ectopico aborto salpingitis EPI torsion ovarica amenorrea prolapso mama",
  "summary": "Valoración prehospitalaria de la mujer con dolor abdominopélvico o hemorragia genital: descartar abdomen quirúrgico, embarazo y necesidad de hospitalización inmediata.",
  "relations": {
    "patologias": [
      "Dolor abdominopélvico",
      "Embarazo ectópico",
      "Aborto",
      "Enfermedad inflamatoria pélvica",
      "Torsión ovárica",
      "Rotura de quiste ovárico",
      "Hemorragia genital",
      "Metrorragia",
      "Amenorrea",
      "Prolapso genital",
      "Mastitis/absceso mamario"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides",
      "Analgesia según protocolo",
      "Antieméticos según protocolo",
      "Antibióticos si EPI/sepsis según protocolo",
      "Ácido tranexámico según protocolo si hemorragia grave"
    ],
    "escalas": [
      "ABCDE",
      "Escala del dolor",
      "Signos de shock",
      "Glasgow",
      "Test de gestación"
    ],
    "tecnicas": [
      "Test de embarazo",
      "Canalización venosa",
      "Monitorización",
      "Exploración abdominal",
      "Control de sangrado",
      "Transferencia ginecológica estructurada"
    ],
    "alertas": [
      "dolor pélvico + test embarazo positivo",
      "síncope/hipotensión",
      "sangrado abundante",
      "abdomen agudo",
      "fiebre + dolor pélvico",
      "dolor súbito unilateral",
      "embarazo ectópico",
      "violencia sexual/género"
    ]
  },
  "sec": [
    {
      "h": "Clasificación del bloque",
      "b": "<p>El manual clasifica las urgencias ginecológicas en dolor abdominal, infecciones ginecológicas, hemorragia genital, amenorrea/prolapso, patología obstétrica y patología mamaria. En la práctica prehospitalaria se priorizan dos motivos por frecuencia y riesgo vital: <b>dolor abdominopélvico</b> y <b>hemorragia genital</b>.</p>"
    },
    {
      "h": "Tres preguntas clave",
      "b": "<ol><li>¿Tiene un abdomen agudo quirúrgico?</li><li>¿Está embarazada o podría estarlo?</li><li>¿Necesita hospitalización inmediata por dolor, sangrado, infección, shock o riesgo obstétrico/ginecológico?</li></ol>"
    },
    {
      "h": "Anamnesis ginecológica mínima",
      "b": "<ul><li>Edad.</li><li>Fecha de última regla (FUR), regularidad menstrual y posibilidad de embarazo.</li><li>Test de gestación si disponible.</li><li>Dolor: inicio, localización, irradiación, duración, intensidad y evolución.</li><li>Sangrado: cantidad, color, coágulos, relación con ciclo, embarazo o posparto.</li><li>Flujo vaginal, fiebre, disuria, náuseas/vómitos, síncope.</li><li>Antecedentes: embarazo ectópico, abortos, EPI, cirugía pélvica, DIU, tratamientos de fertilidad, anticoagulantes.</li><li>Riesgo de violencia sexual o de género: preguntar con seguridad, intimidad y respeto si procede.</li></ul>"
    },
    {
      "h": "Dolor abdominal con test de gestación positivo",
      "b": "<ul><li>Todo dolor pélvico con embarazo positivo debe hacer pensar en embarazo ectópico hasta demostrar lo contrario, especialmente si hay sangrado, síncope, dolor unilateral o inestabilidad.</li><li>Otras posibilidades: aborto, amenaza de aborto, torsión ovárica, cuerpo lúteo hemorrágico, patología digestiva/urinaria coexistente.</li><li>Si shock o síncope: ABCDE, oxígeno, dos vías venosas, cristaloides, monitorización y traslado urgente a centro con ginecología/cirugía.</li><li>No retrasar traslado por completar exploraciones si hay inestabilidad.</li></ul>"
    },
    {
      "h": "Dolor abdominal con test de gestación negativo",
      "b": "<ul><li>Valorar causas ginecológicas: torsión ovárica, rotura de quiste, EPI/salpingitis, endometriosis, miomas complicados.</li><li>Valorar causas no ginecológicas: apendicitis, diverticulitis, cólico renal, infección urinaria, obstrucción, aneurisma, pancreatitis.</li><li>Dolor súbito unilateral intenso con náuseas/vómitos: sospechar torsión ovárica.</li><li>Dolor pélvico + fiebre + flujo purulento/dolor a movilización cervical: sospechar EPI.</li><li>Signos de abdomen agudo o sepsis: traslado urgente.</li></ul>"
    },
    {
      "h": "Hemorragia genital",
      "b": "<ul><li>Valorar cantidad: compresas empapadas/hora, coágulos, mareo, síncope, palidez.</li><li>Siempre descartar embarazo.</li><li>Si test positivo: amenaza/aborto, embarazo ectópico, embarazo molar, complicación obstétrica.</li><li>Si test negativo: metrorragia disfuncional, miomas, pólipos, neoplasia, trauma, anticoagulantes, infección.</li><li>Si sangrado abundante con signos de shock: ABCDE, oxígeno, dos vías venosas, cristaloides, monitorización y traslado urgente.</li></ul>"
    },
    {
      "h": "Infecciones ginecológicas",
      "b": "<ul><li>Fiebre, dolor pélvico, mal estado general, flujo vaginal patológico, dolor con relaciones, sangrado intermenstrual o dolor a la movilización cervical orientan a infección ginecológica/EPI.</li><li>Buscar signos de sepsis: hipotensión, taquicardia, fiebre/hipotermia, confusión, mala perfusión.</li><li>En sepsis o abdomen agudo: oxígeno si precisa, vía venosa, fluidoterapia y traslado urgente.</li><li>Antibiótico según protocolo local si indicado y no retrasa traslado.</li></ul>"
    },
    {
      "h": "Prolapso y otras urgencias",
      "b": "<ul><li>Prolapso genital doloroso, irreductible, ulcerado, con retención urinaria o sangrado requiere valoración hospitalaria.</li><li>Amenorrea con dolor o síntomas sistémicos: descartar embarazo y causas endocrino-metabólicas.</li><li>Patología mamaria urgente: mastitis con fiebre/mal estado, absceso, dolor intenso, signos inflamatorios extensos o paciente inmunodeprimida.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>ABCDE y valoración de estabilidad.</li><li>Test de gestación si dolor pélvico, amenorrea o sangrado y está disponible.</li><li>Constantes, dolor, sangrado y estado general.</li><li>Canalizar vía venosa si dolor intenso, vómitos, sangrado, infección, sospecha quirúrgica o inestabilidad.</li><li>Analgesia y antiemético según protocolo si no retrasa traslado.</li><li>Si sospecha de ectópico, torsión, abdomen agudo, sepsis o hemorragia grave: traslado urgente.</li><li>Transferencia con FUR, embarazo/test, sangrado, dolor, constantes, tratamientos y antecedentes.</li></ol>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Preservar intimidad y trato respetuoso.</li><li>Cuantificar sangrado de forma objetiva: número de compresas, coágulos, duración.</li><li>Registrar FUR y posibilidad de embarazo.</li><li>Control de dolor y respuesta a analgesia.</li><li>Valorar riesgo de violencia sexual/género si contexto compatible, sin presión y con seguridad.</li><li>Preparar traslado a ginecología si signos de alarma.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>No preguntar por embarazo/FUR en dolor abdominal de mujer en edad fértil.</li><li>Infravalorar sangrado vaginal si las constantes aún son normales.</li><li>Dar por ginecológico un dolor que puede ser apendicitis, cólico renal o aneurisma.</li><li>No valorar signos de shock o sepsis.</li><li>No proteger intimidad y comunicación de la paciente.</li><li>No sospechar ectópico ante dolor + sangrado + test positivo.</li></ul>"
    }
  ],
  "block": 11
},
{
  "id": "obst-farmacologia-embarazo-ingesa",
  "cat": "obst",
  "especialidad": "Obstetricia / Farmacología / Urgencias",
  "title": "Farmacología de uso en urgencias en el embarazo",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias obstétrico-ginecológicas, 2013",
  "tags": "farmacologia embarazo lactancia teratogenicidad fármacos urgencias gestante paracetamol AINE IECA benzodiacepinas opioides antibióticos radiación seguridad fetal",
  "summary": "Principios de seguridad farmacológica en la gestante: valorar riesgo-beneficio, semanas de gestación, fármacos de uso frecuente en urgencias y medicamentos a evitar o usar con cautela.",
  "relations": {
    "patologias": [
      "Gestación",
      "Lactancia",
      "Dolor en embarazo",
      "Fiebre en embarazo",
      "Asma en embarazo",
      "Anafilaxia en embarazo",
      "Preeclampsia/eclampsia",
      "Infección en embarazo",
      "Náuseas/vómitos del embarazo"
    ],
    "farmacos": [
      "Paracetamol",
      "Metoclopramida",
      "Ondansetrón según protocolo",
      "Salbutamol",
      "Ipratropio",
      "Corticoides",
      "Amoxicilina/clavulánico",
      "Cefalosporinas",
      "Adrenalina en anafilaxia",
      "Sulfato de magnesio",
      "Labetalol",
      "Hidralazina",
      "Nifedipino"
    ],
    "escalas": [
      "Riesgo-beneficio",
      "Semanas de gestación",
      "ABCDE materno",
      "Ficha técnica/guía actual"
    ],
    "tecnicas": [
      "Doble verificación de fármacos",
      "Consulta a protocolo local",
      "Registro de dosis y trimestre",
      "Monitorización materno-fetal si disponible"
    ],
    "alertas": [
      "no negar tratamiento vital por embarazo",
      "evitar AINE tercer trimestre",
      "evitar IECA/ARA-II",
      "evitar tetraciclinas",
      "valorar litio/antiepilépticos/retinoides",
      "dosis materna correcta",
      "consultar guía actual"
    ]
  },
  "sec": [
    {
      "h": "Principio general",
      "b": "<p>En una urgencia, la seguridad materna es prioritaria: una madre hipóxica, hipotensa, convulsionando o séptica compromete también al feto. El embarazo obliga a seleccionar fármacos con prudencia, pero no debe retrasar tratamientos vitales.</p><ul><li>Valorar siempre riesgo-beneficio.</li><li>Registrar semanas de gestación o trimestre.</li><li>Usar la menor dosis eficaz durante el menor tiempo posible, salvo tratamientos vitales.</li><li>Consultar protocolos actuales: la clasificación antigua de categorías de riesgo ha sido sustituida progresivamente por información más descriptiva.</li></ul>"
    },
    {
      "h": "Qué preguntar antes de medicar",
      "b": "<ul><li>Semanas de gestación y fecha de última regla.</li><li>Alergias.</li><li>Medicaciones habituales y suplementos.</li><li>Patología materna: hipertensión, epilepsia, diabetes, asma, cardiopatía, renal/hepática.</li><li>Complicaciones del embarazo: preeclampsia, sangrado, contracciones, rotura de bolsa, amenaza de parto prematuro.</li><li>Lactancia si puérpera.</li></ul>"
    },
    {
      "h": "Analgesia y fiebre",
      "b": "<ul><li><b>Paracetamol:</b> analgésico/antitérmico de elección habitual si no contraindicado.</li><li><b>AINEs:</b> evitar especialmente en tercer trimestre por riesgo de cierre del ductus arterioso, alteraciones renales fetales y sangrado; valorar solo con indicación clara y protocolo.</li><li><b>Opioides:</b> pueden usarse en dolor intenso si beneficio supera riesgo, vigilando depresión respiratoria materna/neonatal, náuseas e hipotensión.</li><li>Fiebre persistente en gestante requiere buscar foco y valorar derivación.</li></ul>"
    },
    {
      "h": "Náuseas y vómitos",
      "b": "<ul><li>Primero valorar gravedad: deshidratación, cetosis, pérdida de peso, dolor abdominal, fiebre o sangrado.</li><li>Opciones frecuentes según protocolo: doxilamina-piridoxina, metoclopramida u ondansetrón en situaciones seleccionadas.</li><li>Si vómitos intensos: vía venosa, fluidoterapia y valoración hospitalaria.</li><li>Evitar medicar sin descartar abdomen agudo, hiperémesis grave o complicación obstétrica.</li></ul>"
    },
    {
      "h": "Respiratorio y anafilaxia",
      "b": "<ul><li><b>Asma:</b> tratar de forma activa; la hipoxia fetal por mal control materno es más peligrosa que broncodilatadores adecuados.</li><li>Salbutamol e ipratropio se usan en crisis según protocolo.</li><li>Corticoides sistémicos si crisis moderada-grave.</li><li><b>Anafilaxia:</b> adrenalina IM no debe retrasarse por embarazo; tratar a la madre salva al feto. Añadir oxígeno, fluidos y traslado urgente.</li><li>Colocar en decúbito lateral izquierdo o desplazar útero en gestación avanzada para mejorar retorno venoso.</li></ul>"
    },
    {
      "h": "Hipertensión, preeclampsia y eclampsia",
      "b": "<ul><li>TA severa, cefalea, alteraciones visuales, dolor epigástrico/hipocondrio derecho, hiperreflexia o convulsión requieren manejo urgente.</li><li><b>Sulfato de magnesio:</b> tratamiento de elección para prevenir/tratar convulsiones eclámpticas según protocolo.</li><li>Vigilar toxicidad por magnesio: reflejos, respiración, diuresis y nivel de conciencia.</li><li>Antihipertensivos usados habitualmente: labetalol, hidralazina o nifedipino según protocolo y escenario.</li><li>Evitar IECA/ARA-II en embarazo.</li></ul>"
    },
    {
      "h": "Antibióticos",
      "b": "<ul><li>La infección materna debe tratarse de forma adecuada.</li><li>Opciones generalmente utilizadas según foco y protocolo: penicilinas, amoxicilina/clavulánico y cefalosporinas.</li><li>Evitar tetraciclinas por efectos sobre dientes/hueso fetal.</li><li>Aminoglucósidos, quinolonas, sulfamidas y otros antibióticos requieren valoración específica de riesgo-beneficio.</li><li>En sepsis, no retrasar antibiótico por embarazo.</li></ul>"
    },
    {
      "h": "Fármacos que requieren especial cautela",
      "b": "<ul><li>IECA/ARA-II: evitar por riesgo fetal, especialmente segundo-tercer trimestre.</li><li>AINEs: evitar en tercer trimestre.</li><li>Tetraciclinas: evitar.</li><li>Retinoides: alto riesgo teratógeno.</li><li>Warfarina: riesgo teratógeno/hemorrágico; requiere manejo especializado.</li><li>Antiepilépticos: no suspender bruscamente; valorar con especialista.</li><li>Benzodiacepinas: usar solo si indicación clara, dosis mínima y vigilancia; no retrasar si convulsión/agitación grave que compromete seguridad.</li></ul>"
    },
    {
      "h": "Pruebas, radiación y contraste",
      "b": "<ul><li>Una prueba necesaria para salvar o diagnosticar una urgencia materna no debe negarse automáticamente por embarazo.</li><li>Aplicar principio ALARA: dosis tan baja como sea razonablemente posible.</li><li>Proteger abdomen si procede y no interfiere.</li><li>Contrastes yodados o gadolinio requieren valoración de indicación, alternativas y consentimiento según contexto.</li></ul>"
    },
    {
      "h": "Lactancia",
      "b": "<ul><li>La mayoría de tratamientos urgentes compatibles con seguridad materna pueden administrarse, pero debe revisarse compatibilidad con lactancia.</li><li>Valorar edad del lactante, prematuridad, función renal/hepática y necesidad de dosis repetidas.</li><li>Evitar suspender lactancia sin motivo; consultar ficha/protocolo si fármaco de riesgo.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Registrar embarazo, semanas, alergias, fármaco, dosis, vía y hora.</li><li>Doble chequeo de fármacos de alto riesgo: magnesio, insulina, opioides, vasopresores, sedantes.</li><li>Monitorizar constantes maternas y respuesta clínica.</li><li>Si gestación avanzada, favorecer decúbito lateral izquierdo cuando sea posible.</li><li>Informar de forma clara: “vamos a tratarle porque estabilizarla a usted protege al bebé”.</li><li>Transferir medicación administrada y motivo clínico.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>No tratar una emergencia materna por miedo al embarazo.</li><li>Dar AINEs en tercer trimestre sin indicación/protocolo.</li><li>Olvidar preguntar semanas de gestación.</li><li>Usar fármacos teratógenos sin revisar alternativas.</li><li>No vigilar toxicidad por sulfato de magnesio.</li><li>No documentar claramente dosis y justificación.</li></ul>"
    }
  ],
  "block": 11
},
{
  "id": "onco-sedacion-paciente-terminal-ingesa",
  "cat": "paliativos",
  "especialidad": "Oncología / Cuidados paliativos / Urgencias",
  "title": "Sedación del paciente terminal",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias en el paciente oncológico, 2013; contrastar con protocolos paliativos actuales.",
  "tags": "sedacion terminal paliativa agonia sintoma refractario disnea dolor delirium agitacion midazolam morfina levomepromazina escopolamina cuidados paliativos",
  "summary": "Manejo de la sedación paliativa en situación terminal: identificar síntoma refractario, valorar proporcionalidad, consentimiento, fármacos, cuidados y acompañamiento familiar.",
  "relations": {
    "patologias": [
      "Situación de últimos días",
      "Agonía",
      "Delirium terminal",
      "Disnea refractaria",
      "Dolor refractario",
      "Hemorragia masiva terminal",
      "Sufrimiento refractario"
    ],
    "farmacos": [
      "Midazolam",
      "Morfina",
      "Levomepromazina",
      "Clorpromazina",
      "Haloperidol",
      "Butilescopolamina",
      "Escopolamina",
      "Metoclopramida",
      "Dexametasona"
    ],
    "escalas": [
      "RASS paliativa",
      "Escala de Ramsay",
      "Escala del dolor",
      "ESAS",
      "Glasgow si procede"
    ],
    "tecnicas": [
      "Vía subcutánea",
      "Infusor subcutáneo",
      "Perfusión continua",
      "Cuidados de boca",
      "Acompañamiento familiar",
      "Registro de consentimiento"
    ],
    "alertas": [
      "síntoma refractario",
      "proporcionalidad",
      "consentimiento informado",
      "diferenciar sedación de eutanasia",
      "no suspender analgesia opioide",
      "vigilancia confort",
      "apoyo familiar"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La sedación paliativa es la disminución deliberada del nivel de conciencia, mediante fármacos adecuados y dosis proporcionales, para aliviar uno o más síntomas refractarios en un paciente en situación terminal o de últimos días.</p><ul><li>No busca acelerar la muerte: busca aliviar sufrimiento que no responde a medidas razonables.</li><li>Debe ser proporcional a la intensidad del síntoma.</li><li>Requiere valoración clínica, consentimiento y registro claro.</li></ul>"
    },
    {
      "h": "Síntoma refractario",
      "b": "<p>Un síntoma es refractario cuando no puede ser controlado adecuadamente pese a tratamientos correctamente aplicados, en un tiempo razonable y sin producir efectos adversos intolerables. No es lo mismo que síntoma difícil.</p><ul><li>Ejemplos: disnea intensa, dolor intratable, delirium terminal con agitación, hemorragia masiva, convulsiones, ansiedad/pánico extremo en agonía.</li><li>Antes de sedar, revisar si hay una medida razonable y proporcional pendiente.</li></ul>"
    },
    {
      "h": "Valoración previa",
      "b": "<ol><li>Confirmar situación terminal o de últimos días.</li><li>Identificar síntoma refractario y tratamientos ya intentados.</li><li>Valorar capacidad de decisión del paciente.</li><li> voluntades previas, familia/cuidador y equipo referente si existe.</li><li>Explicar objetivo: confort, no acortar vida.</li><li>Registrar consentimiento del paciente o representante si el paciente no puede decidir.</li><li>Planificar fármaco, vía, dosis, monitorización de confort y reevaluación.</li></ol>"
    },
    {
      "h": "Situaciones frecuentes",
      "b": "<ul><li><b>Delirium terminal/agitación:</b> inquietud, alucinaciones, miedo, imposibilidad de descanso, riesgo de autolesión.</li><li><b>Disnea refractaria:</b> sensación de ahogo persistente pese a opioide, oxígeno si hipoxemia y medidas no farmacológicas.</li><li><b>Dolor refractario:</b> dolor no controlable con titulación/rotación opioide, coadyuvantes o técnicas disponibles.</li><li><b>Hemorragia masiva terminal:</b> situación de alto impacto emocional; priorizar presencia, oscuridad/paños oscuros, opioide/benzodiacepina si sufrimiento.</li><li><b>Convulsiones repetidas:</b> control urgente con benzodiacepina y plan de sedación si refractarias.</li></ul>"
    },
    {
      "h": "Fármacos habituales",
      "b": "<ul><li><b>Midazolam:</b> benzodiacepina de elección habitual para iniciar sedación paliativa por rapidez, vida media corta y uso subcutáneo/IV.</li><li><b>Levomepromazina o clorpromazina:</b> útiles si delirium, agitación o necesidad de sedación más mantenida; vigilar hipotensión.</li><li><b>Haloperidol:</b> más antipsicótico que sedante; útil en delirium con náuseas, pero puede no ser suficiente si agitación refractaria.</li><li><b>Morfina:</b> no es sedante primario; se mantiene o titula si hay dolor/disnea. No debe usarse solo “para sedar”.</li><li><b>Butilescopolamina/escopolamina:</b> secreciones respiratorias terminales si causan ruido angustiante.</li></ul>"
    },
    {
      "h": "Vía subcutánea",
      "b": "<ul><li>Muy útil en domicilio o extrahospitalaria cuando vía oral no es posible.</li><li>Permite bolos y perfusión continua mediante infusor.</li><li>Zonas habituales: región infraclavicular, abdomen, cara externa del brazo o muslo.</li><li>Vigilar induración, edema, sangrado, dolor local o mala absorción.</li><li>No mezclar fármacos incompatibles sin comprobar estabilidad.</li></ul>"
    },
    {
      "h": "Actuación paso a paso",
      "b": "<ol><li>Valorar ABC solo en términos de confort y objetivos del paciente.</li><li>Confirmar síntoma refractario y situación terminal.</li><li>Informar a paciente/familia de forma clara, calmada y honesta.</li><li>Retirar intervenciones que no aportan confort y mantener las necesarias.</li><li>Administrar sedante elegido según protocolo, generalmente midazolam, titulando a confort.</li><li>Mantener analgesia opioide si dolor/disnea.</li><li>Reevaluar: expresión facial, respiración, inquietud, tono, respuesta al estímulo, secreciones y sufrimiento familiar.</li><li>Registrar motivo, consentimiento, fármaco, dosis, vía, respuesta y plan de revisión.</li></ol>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Preservar intimidad, silencio y acompañamiento.</li><li>Cuidados de boca frecuentes, hidratación de labios y cambios posturales suaves.</li><li>Evitar monitorización innecesaria si no aporta confort.</li><li>Vigilar signos de sufrimiento: gestos, quejidos, taquipnea angustiosa, inquietud.</li><li>Acompañar a la familia: explicar cambios esperables en respiración, piel, conciencia y secreciones.</li><li>Registrar todo con precisión: el registro protege al paciente, familia y equipo.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Confundir sedación paliativa con eutanasia.</li><li>Sedar sin confirmar refractariedad y sin registro.</li><li>Suspender opioides en un paciente con dolor/disnea al iniciar sedación.</li><li>Usar morfina como sedante principal.</li><li>No acompañar a la familia ni explicar el objetivo.</li><li>Monitorizar constantes de forma invasiva si solo aumenta sufrimiento y no cambia objetivos.</li></ul>"
    }
  ],
  "block": 12
},
{
  "id": "onco-dolor-oncologico-ingesa",
  "cat": "onco",
  "especialidad": "Oncología / Cuidados paliativos / Dolor",
  "title": "Control del dolor en el paciente oncológico",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias en el paciente oncológico, 2013; revisar equivalencias y protocolos actuales.",
  "tags": "dolor oncologico analgesia opioides morfina fentanilo rescate irruptivo escalera analgesica OMS coadyuvantes dolor neuropatico estreñimiento naloxona",
  "summary": "Valoración y tratamiento del dolor oncológico: tipo de dolor, intensidad, pauta basal, rescates, opioides, coadyuvantes, efectos adversos y criterios de derivación.",
  "relations": {
    "patologias": [
      "Dolor oncológico",
      "Dolor irruptivo",
      "Dolor neuropático",
      "Dolor óseo",
      "Compresión medular",
      "Hipercalcemia tumoral",
      "Obstrucción intestinal maligna",
      "Estreñimiento por opioides"
    ],
    "farmacos": [
      "Paracetamol",
      "Metamizol",
      "AINEs",
      "Tramadol",
      "Morfina",
      "Fentanilo",
      "Oxicodona",
      "Buprenorfina",
      "Metadona",
      "Pregabalina",
      "Gabapentina",
      "Amitriptilina",
      "Dexametasona",
      "Metoclopramida",
      "Laxantes",
      "Naloxona"
    ],
    "escalas": [
      "EVA",
      "Escala numérica del dolor",
      "ESAS",
      "DN4 dolor neuropático",
      "Escala de sedación"
    ],
    "tecnicas": [
      "Rotación de opioides",
      "Dosis de rescate",
      "Vía subcutánea",
      "Infusor elastomérico",
      "Valoración funcional",
      "Educación al cuidador"
    ],
    "alertas": [
      "dolor irruptivo",
      "dolor nuevo intenso",
      "déficit neurológico",
      "retención urinaria",
      "fiebre/neutropenia",
      "depresión respiratoria",
      "estreñimiento severo",
      "más de 3-4 rescates/día"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>El dolor oncológico puede deberse al tumor, a tratamientos, a complicaciones o a comorbilidad. No debe aceptarse como “normal” por tener cáncer: debe evaluarse, tratarse y reevaluarse. El objetivo urgente es aliviar dolor y detectar situaciones que requieren derivación inmediata.</p>"
    },
    {
      "h": "Valoración inicial del dolor",
      "b": "<ul><li>Intensidad: EVA/escala 0-10.</li><li>Localización e irradiación.</li><li>Tipo: nociceptivo somático, visceral, neuropático o mixto.</li><li>Inicio: nuevo, crónico, progresivo o irruptivo.</li><li>Factores que alivian/empeoran.</li><li>Tratamiento actual: fármacos, dosis, horarios, rescates, adherencia y efectos adversos.</li><li>Función: sueño, movilidad, alimentación, ánimo y autonomía.</li><li>Signos de alarma oncológica: fiebre, déficit neurológico, compresión medular, fractura, obstrucción, sangrado.</li></ul>"
    },
    {
      "h": "Tipos de dolor",
      "b": "<ul><li><b>Somático:</b> bien localizado, continuo, aumenta con movimiento o palpación; frecuente en metástasis óseas.</li><li><b>Visceral:</b> profundo, mal localizado, cólico o presión; puede acompañarse de náuseas, sudoración o distensión.</li><li><b>Neuropático:</b> quemazón, descargas, hormigueo, alodinia, parestesias; requiere coadyuvantes.</li><li><b>Dolor irruptivo:</b> exacerbación transitoria intensa sobre dolor basal relativamente controlado.</li></ul>"
    },
    {
      "h": "Escalera analgésica práctica",
      "b": "<ul><li><b>Dolor leve:</b> analgésicos no opioides: paracetamol, metamizol o AINE si no contraindicado.</li><li><b>Dolor moderado:</b> opioides débiles o dosis bajas de opioide fuerte según situación, más no opioides/coadyuvantes.</li><li><b>Dolor intenso:</b> opioide fuerte titulado, habitualmente morfina, oxicodona, fentanilo u otros, con rescate y prevención de efectos adversos.</li><li><b>Coadyuvantes:</b> corticoides, antiepilépticos, antidepresivos, bifosfonatos, radioterapia o técnicas intervencionistas según causa.</li></ul>"
    },
    {
      "h": "Morfina: ideas prácticas del manual",
      "b": "<ul><li>El manual recoge morfina de liberación inmediata para dolor agudo o rescates.</li><li>También menciona morfina de liberación controlada, con inicio orientativo de 10 mg cada 12 horas y ajustes progresivos.</li><li>Para un episodio aislado de dolor muy intenso en paciente con morfina retardada, el manual propone rescate con morfina inmediata equivalente a 1/3 de la dosis administrada cada 12 h.</li><li>Si precisa más de 4 rescates, debe revisarse la dosis basal.</li><li>La vía subcutánea puede ser útil si vía oral no es posible; el manual indica equivalencias orientativas: dosis oral total/2 para subcutánea y /3 para intravenosa.</li></ul>"
    },
    {
      "h": "Dolor irruptivo",
      "b": "<ul><li>Aparece de forma brusca, intensa y corta sobre dolor basal.</li><li>Requiere medicación de rescate rápida, proporcional al opioide basal.</li><li>Si hay muchos rescates al día, el dolor basal no está bien controlado o hay nueva complicación.</li><li>Buscar precipitantes: movimiento, cura, movilización, estreñimiento, fractura, compresión nerviosa.</li></ul>"
    },
    {
      "h": "Efectos adversos de opioides",
      "b": "<ul><li><b>Estreñimiento:</b> prevenir desde el inicio con laxante salvo contraindicación.</li><li><b>Náuseas/vómitos:</b> antiemético según protocolo.</li><li><b>Somnolencia:</b> frecuente al inicio o al aumentar dosis; vigilar si progresiva.</li><li><b>Depresión respiratoria:</b> rara si titulación correcta, pero emergencia si bradipnea, miosis, coma o SatO₂ baja.</li><li><b>Neurotoxicidad opioide:</b> mioclonías, confusión, alucinaciones, hiperalgesia; valorar hidratación, rotación y revisión médica.</li></ul>"
    },
    {
      "h": "Naloxona en paciente oncológico",
      "b": "<p>Si aparece depresión respiratoria por opioides, la naloxona puede ser necesaria, pero debe titularse con prudencia para recuperar ventilación sin desencadenar dolor intenso o abstinencia brusca.</p><ul><li>Ventilar y oxigenar primero.</li><li>Usar dosis pequeñas y reevaluar.</li><li>Tras naloxona, vigilar recurrencia por vida media más corta que muchos opioides.</li></ul>"
    },
    {
      "h": "Signos de alarma que cambian el enfoque",
      "b": "<ul><li>Dolor lumbar/dorsal nuevo + debilidad, anestesia en silla de montar, alteración esfínteres: sospechar compresión medular.</li><li>Dolor óseo brusco tras mínima movilización: sospechar fractura patológica.</li><li>Dolor abdominal + vómitos + distensión: sospechar obstrucción intestinal.</li><li>Dolor + fiebre/neutropenia: sepsis hasta demostrar lo contrario.</li><li>Somnolencia/confusión + estreñimiento + opioides: valorar toxicidad, hipercalcemia o sepsis.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Medir dolor antes/después del tratamiento y registrar hora de efecto.</li><li>Revisar pauta real: lo que toma, no solo lo prescrito.</li><li>Educar sobre rescates, laxantes, náuseas y cuándo pedir ayuda.</li><li>Vigilar sedación, FR, estreñimiento, náuseas, retención urinaria y delirium.</li><li>No pinchar IM si plaquetopenia o anticoagulación si hay alternativas.</li><li>Transferir: dolor basal, rescates, opioide total diario, efectos adversos, signos de alarma y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Dejar dolor intenso sin tratar por miedo injustificado a opioides.</li><li>No pautar laxante con opioide.</li><li>No diferenciar dolor basal e irruptivo.</li><li>Usar rescates sin revisar dosis basal.</li><li>Administrar naloxona en bolo grande y provocar dolor/abstinencia si puede titularse.</li><li>No sospechar compresión medular, fractura o sepsis ante dolor nuevo.</li></ul>"
    }
  ],
  "block": 12
},
{
  "id": "onco-toxicidad-digestiva-ingesa",
  "cat": "onco",
  "especialidad": "Oncología / Digestivo / Urgencias",
  "title": "Urgencias oncológicas por toxicidad digestiva",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias en el paciente oncológico, 2013; revisar guías oncológicas actuales.",
  "tags": "toxicidad digestiva oncologica quimioterapia radioterapia nauseas vomitos diarrea mucositis estreñimiento obstruccion ileo neutropenia deshidratacion antiemeticos loperamida",
  "summary": "Manejo inicial de toxicidad digestiva en paciente oncológico: náuseas/vómitos, diarrea, mucositis, estreñimiento, obstrucción y signos de gravedad como deshidratación, sepsis o neutropenia.",
  "relations": {
    "patologias": [
      "Náuseas y vómitos inducidos por quimioterapia",
      "Diarrea por quimioterapia",
      "Mucositis",
      "Estreñimiento por opioides",
      "Obstrucción intestinal maligna",
      "Neutropenia febril",
      "Deshidratación",
      "Íleo",
      "Colitis"
    ],
    "farmacos": [
      "Metoclopramida",
      "Ondansetrón",
      "Dexametasona",
      "Haloperidol",
      "Loperamida",
      "Racecadotrilo",
      "Suero fisiológico",
      "Ringer lactato",
      "Laxantes",
      "Butilescopolamina",
      "Omeprazol/Pantoprazol",
      "Antibióticos si sepsis/neutropenia según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "ECOG",
      "Escala de deshidratación",
      "Escala del dolor",
      "qSOFA",
      "CTCAE hospitalaria"
    ],
    "tecnicas": [
      "Rehidratación oral/IV",
      "Canalización venosa",
      "Monitorización",
      "Cuidados de mucositis",
      "Valoración abdominal",
      "Control de deposiciones/vómitos"
    ],
    "alertas": [
      "fiebre en oncológico",
      "neutropenia posible",
      "diarrea intensa",
      "vómitos incoercibles",
      "deshidratación",
      "dolor abdominal + distensión",
      "sangre en heces",
      "mucositis grave",
      "bajo nivel conciencia"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>Los tratamientos oncológicos pueden causar toxicidad digestiva aguda o diferida. En urgencias, la prioridad es valorar gravedad, hidratación, riesgo infeccioso/neutropenia, dolor, tolerancia oral y complicaciones como obstrucción, sangrado o sepsis.</p>"
    },
    {
      "h": "Preguntas clave",
      "b": "<ul><li>Tipo de cáncer y tratamiento recibido: quimioterapia, inmunoterapia, radioterapia, cirugía, opioides.</li><li>Fecha del último ciclo y día del ciclo actual.</li><li>Vómitos: número, contenido, tolerancia oral, sangre.</li><li>Diarrea: número de deposiciones, sangre/moco, fiebre, dolor, deshidratación.</li><li>Dolor abdominal, distensión, ausencia de gases/heces.</li><li>Mucositis: dolor, úlceras, imposibilidad para comer/beber, sangrado.</li><li>Fiebre o escalofríos: siempre relevante en paciente oncológico.</li><li>Neutropenia previa, catéter central, inmunosupresión, corticoides.</li></ul>"
    },
    {
      "h": "Valoración inicial ABCDE",
      "b": "<ol><li><b>A/B:</b> vómitos con bajo nivel de conciencia: riesgo de broncoaspiración. SatO₂ y respiración.</li><li><b>C:</b> TA, FC, perfusión, relleno capilar, signos de shock/deshidratación.</li><li><b>D:</b> Glasgow, glucemia si deterioro, delirium por sepsis, hipercalcemia o deshidratación.</li><li><b>E:</b> temperatura, mucosas, piel, abdomen, catéteres, signos de infección, estomas.</li></ol>"
    },
    {
      "h": "Náuseas y vómitos",
      "b": "<ul><li>Valorar gravedad: vómitos persistentes, intolerancia oral, deshidratación, alteración electrolítica, sangre, dolor abdominal o cefalea.</li><li>Buscar causas: quimioterapia, radioterapia, opioides, obstrucción intestinal, hipertensión intracraneal, hipercalcemia, infección, fármacos.</li><li>Tratamiento inicial: reposo digestivo relativo, antiemético según patrón, rehidratación oral o IV.</li><li>Antieméticos habituales según protocolo: metoclopramida, ondansetrón, haloperidol, dexametasona o combinaciones según emetogenicidad.</li><li>Traslado si vómitos incoercibles, deshidratación, bajo nivel de conciencia, dolor abdominal intenso, sospecha de obstrucción o fiebre.</li></ul>"
    },
    {
      "h": "Diarrea",
      "b": "<ul><li>Cuantificar deposiciones y comparar con basal.</li><li>Signos de alarma: fiebre, sangre, dolor abdominal intenso, diarrea nocturna, deshidratación, hipotensión, diarrea abundante, neutropenia, edad avanzada.</li><li>La diarrea puede deberse a quimioterapia, radioterapia pélvica, inmunoterapia, infección, antibióticos, laxantes o malabsorción.</li><li>Tratamiento inicial: hidratación, control de constantes, suspender laxantes si procede, antidiarreico como loperamida si no hay sospecha infecciosa/inflamatoria grave y según protocolo.</li><li>Si fiebre o neutropenia posible: traslado urgente y manejo como sepsis/neutropenia febril.</li></ul>"
    },
    {
      "h": "Mucositis",
      "b": "<ul><li>Inflamación/ulceración de mucosa oral o digestiva por quimioterapia/radioterapia.</li><li>Puede impedir ingesta y aumentar riesgo de infección.</li><li>Valorar dolor, capacidad para tragar, sangrado, fiebre, deshidratación y candidiasis.</li><li>Cuidados: higiene oral suave, evitar alcohol/irritantes, hidratación, analgesia adecuada, anestésicos tópicos si protocolo, tratamiento antifúngico si candidiasis.</li><li>Traslado si fiebre, neutropenia, imposibilidad para ingerir, sangrado, dolor severo o deshidratación.</li></ul>"
    },
    {
      "h": "Estreñimiento y obstrucción",
      "b": "<ul><li>Frecuente por opioides, inmovilidad, deshidratación, hipercalcemia, tumor o fármacos.</li><li>Signos de alarma: dolor abdominal cólico, distensión, vómitos fecaloideos, ausencia de gases/heces, peritonismo o fiebre.</li><li>Si estreñimiento simple: hidratación, laxantes según pauta, revisar opioides y educación.</li><li>Si sospecha de obstrucción intestinal maligna: dieta absoluta, antiemético, analgesia, evitar laxantes estimulantes si obstrucción completa y traslado.</li><li>En obstrucción con vómitos intensos: valorar vía venosa, fluidoterapia y aspiración/sonda hospitalaria.</li></ul>"
    },
    {
      "h": "Fiebre en paciente oncológico",
      "b": "<p>Fiebre en un paciente con quimioterapia reciente debe considerarse neutropenia febril hasta demostrar lo contrario.</p><ul><li>Tomar temperatura y constantes.</li><li>Valorar fecha de quimioterapia y neutropenias previas.</li><li>Buscar foco: catéter, boca/mucositis, respiratorio, urinario, abdominal, piel.</li><li>Si fiebre + mal estado, hipotensión, confusión o diarrea intensa: manejo como sepsis y traslado urgente.</li><li>No administrar antitérmico y dejar en domicilio sin valorar riesgo.</li></ul>"
    },
    {
      "h": "Rehidratación y soporte",
      "b": "<ul><li>Si tolera oral y está estable: suero oral en tomas pequeñas y frecuentes.</li><li>Si vómitos persistentes, diarrea intensa, hipotensión, taquicardia o mala perfusión: vía venosa y cristaloides.</li><li>Controlar diuresis, mucosas, relleno capilar y estado mental.</li><li>Evitar sobrecarga en insuficiencia cardiaca, renal o ancianos frágiles.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Cuantificar vómitos, diarrea, ingesta, diuresis y peso si disponible.</li><li>Valorar boca completa: úlceras, sangrado, candidiasis, dolor.</li><li>Control de temperatura y signos de sepsis.</li><li>Revisar medicación: opioides, laxantes, antieméticos, quimioterapia, inmunoterapia, antibióticos.</li><li>Preparar vía venosa, fluidoterapia, antieméticos, analgesia y traslado si signos de gravedad.</li><li>Transferir: tipo de tumor, último ciclo, síntomas, constantes, hidratación, fiebre, catéter, tratamientos y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Considerar “normal” la fiebre tras quimioterapia.</li><li>Dar antidiarreico si hay sangre, fiebre o sospecha de colitis grave sin valoración.</li><li>No valorar deshidratación.</li><li>Ignorar mucositis severa como puerta de entrada infecciosa.</li><li>Usar laxantes estimulantes ante sospecha de obstrucción completa.</li><li>No preguntar fecha del último ciclo de quimioterapia/inmunoterapia.</li></ul>"
    }
  ],
  "block": 12
},
{
  "id": "nefro-hematuria-ingesa",
  "cat": "nefro",
  "especialidad": "Nefrourología / Urgencias",
  "title": "Manejo del paciente con hematuria",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias nefrourológicas, 2013",
  "tags": "hematuria macrohematuria microhematuria coágulos uretrorragia pseudohematuria anticoagulación litiasis infección tumor traumatismo sonda triple vía lavado vesical",
  "summary": "Valoración de hematuria real frente a uretrorragia/pseudohematuria, causas frecuentes, signos de gravedad, manejo inicial y criterios de ingreso.",
  "relations": {
    "patologias": [
      "Macrohematuria",
      "Microhematuria",
      "Uretrorragia",
      "Pseudohematuria",
      "Cistitis",
      "Pielonefritis",
      "Litiasis urinaria",
      "Tumor renal/urotelial/prostático",
      "Hiperplasia benigna de próstata",
      "Traumatismo urológico",
      "Retención por coágulos",
      "Insuficiencia renal"
    ],
    "farmacos": [
      "Cristaloides si repercusión hemodinámica",
      "Cefuroxima según protocolo local",
      "Ceftibuteno según protocolo local",
      "Analgesia según dolor",
      "Anticoagulantes: revisar/valorar reversión hospitalaria si sangrado grave"
    ],
    "escalas": [
      "ABCDE",
      "Signos de shock",
      "Escala del dolor",
      "Tira de orina",
      "Hemograma/coagulación hospitalarios"
    ],
    "tecnicas": [
      "Tira de orina",
      "Exploración abdominal",
      "Percusión renal",
      "Exploración genital",
      "Tacto rectal en varones",
      "Sondaje vesical triple vía",
      "Lavado vesical continuo",
      "Canalización venosa"
    ],
    "alertas": [
      "hematuria grave + inestabilidad",
      "clínica de anemia aguda",
      "postraumática",
      "retención por coágulos",
      "recidivante",
      "insuficiencia renal",
      "anticoagulación oral",
      "coágulos macroscópicos"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La hematuria es la presencia de hematíes en la orina procedentes de cualquier nivel de la vía urinaria y que acompaña a la micción. Debe distinguirse de la uretrorragia, que es independiente de la micción, y de la pseudohematuria, en la que la orina se colorea por pigmentos, alimentos, fármacos o sangre de origen genital.</p>"
    },
    {
      "h": "Tipos",
      "b": "<ul><li><b>Macrohematuria:</b> visible a simple vista. Es la que con más frecuencia motiva consulta urgente.</li><li><b>Microhematuria:</b> detectada en sedimento/tira, sin coloración evidente.</li><li><b>Con coágulos:</b> orienta más a sangrado urológico bajo, tumores o traumatismos, y aumenta riesgo de retención urinaria.</li><li><b>Sin coágulos:</b> puede verse en infección, litiasis, patología renal o traumatismos.</li></ul>"
    },
    {
      "h": "Causas frecuentes",
      "b": "<ul><li>Infecciones: cistitis, pielonefritis, prostatitis, tuberculosis genitourinaria.</li><li>Litiasis urinaria.</li><li>Tumores renales, uroteliales o prostáticos.</li><li>Hiperplasia benigna de próstata.</li><li>Traumatismos.</li><li>Anticoagulación o coagulopatías.</li><li>Ejercicio intenso, frío, fármacos, alimentos o contaminación con sangre genital femenina.</li></ul>"
    },
    {
      "h": "Anamnesis dirigida",
      "b": "<ul><li>Confirmar si la sangre aparece durante la micción o fuera de ella.</li><li>Color, cantidad, presencia de coágulos y momento de la micción: inicial, terminal o total.</li><li>Inicio brusco/progresivo, episodios previos y recurrencia.</li><li>Síntomas urinarios: disuria, polaquiuria, tenesmo, dolor lumbar, fiebre, retención.</li><li>Síntomas generales: palidez, mareo, síncope, astenia, fiebre, pérdida de peso.</li><li>Trauma reciente, manipulación urológica o sondaje.</li><li>Medicación: anticoagulantes, antiagregantes, AINEs.</li><li>Antecedentes: litiasis, infecciones, tumores, HBP, enfermedad renal, coagulopatías.</li></ul>"
    },
    {
      "h": "Exploración física",
      "b": "<ul><li>Constantes: TA, FC, temperatura, SatO₂ si compromiso.</li><li>Estado general: palidez, sudoración, signos de anemia o shock.</li><li>Abdomen: dolor, globo vesical, masas, defensa, distensión.</li><li>Percusión renal y dolor en fosas lumbares.</li><li>Exploración de genitales externos; en mujer, valorar posible origen vaginal.</li><li>Tacto rectal en varones si procede, para valorar próstata y dolor compatible con prostatitis.</li></ul>"
    },
    {
      "h": "Pruebas orientativas",
      "b": "<ul><li>Tira de orina: hematuria, leucocituria, nitritos, proteinuria.</li><li>En hospital: hemograma, bioquímica con función renal y coagulación, especialmente si anticoagulado o sangrado relevante.</li><li>Urocultivo si sospecha infecciosa.</li><li>Imagen urológica según sospecha: trauma, litiasis, masa, coágulos, insuficiencia renal o hematuria persistente.</li></ul>"
    },
    {
      "h": "Actuación inicial",
      "b": "<ol><li>ABCDE si hay inestabilidad o sangrado importante.</li><li>Canalizar vía venosa y reposición de volemia si existe repercusión hemodinámica.</li><li>Valorar dolor y administrar analgesia según protocolo.</li><li>Si macrohematuria con coágulos o retención: sondaje vesical con sonda de triple vía de calibre 20-22 y lavado vesical continuo para limitar formación de coágulos.</li><li>Si sospecha infección y no hay contraindicación: iniciar antibiótico según protocolo local y derivación adecuada.</li><li>Hidratación si estable y sin contraindicación.</li><li>Valorar ingreso/traslado según criterios de gravedad.</li></ol>"
    },
    {
      "h": "Criterios de ingreso / derivación urgente",
      "b": "<ul><li>Hematuria grave con alteraciones hemodinámicas.</li><li>Clínica de anemia aguda.</li><li>Hematuria postraumática.</li><li>Retención urinaria por coágulos.</li><li>Hematuria recidivante.</li><li>Insuficiencia renal.</li><li>Anticoagulación oral.</li><li>Fiebre, sepsis, dolor lumbar intenso o sospecha de pielonefritis obstructiva.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Cuantificar y describir color de la orina: rosada, roja, vino, con coágulos.</li><li>Control seriado de TA, FC, temperatura, dolor y diuresis.</li><li>Vigilar signos de retención: dolor hipogástrico, globo vesical, ausencia de salida por sonda.</li><li>Mantener permeabilidad del lavado vesical si indicado; registrar entradas y salidas.</li><li>Revisar anticoagulantes/antiagregantes y última dosis.</li><li>Transferir: inicio, coágulos, anticoagulación, dolor, fiebre, sondaje, lavado, diuresis y estabilidad.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Confundir uretrorragia o sangrado vaginal con hematuria verdadera.</li><li>Dar de alta macrohematuria con coágulos sin valorar riesgo de retención.</li><li>No preguntar por anticoagulantes.</li><li>No explorar abdomen/globo vesical.</li><li>No derivar hematuria postraumática o con insuficiencia renal.</li><li>Forzar sondaje si hay resistencia o sospecha de lesión uretral traumática.</li></ul>"
    }
  ],
  "block": 13
},
{
  "id": "nefro-retencion-aguda-orina-ingesa",
  "cat": "nefro",
  "especialidad": "Nefrourología / Urgencias",
  "title": "Manejo del paciente con retención aguda de orina",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Urgencias nefrourológicas, 2013",
  "tags": "retencion aguda de orina RAO globo vesical sondaje vesical foley calibre 16 18 hipertrofia prostatica prostatitis estenosis uretral cistostomia suprapubica hematuria ex vacuo",
  "summary": "Abordaje de la imposibilidad de micción con dolor suprapúbico y globo vesical: confirmar RAO, sondaje seguro, vaciado controlado, criterios de derivación y cuidados.",
  "relations": {
    "patologias": [
      "Retención aguda de orina",
      "Globo vesical",
      "Hiperplasia benigna de próstata",
      "Prostatitis",
      "Cáncer de próstata",
      "Estenosis uretral",
      "Retención por fármacos",
      "Anuria",
      "Obstrucción ureteral bilateral",
      "Retención por coágulos"
    ],
    "farmacos": [
      "Lubricante urológico estéril",
      "Anestésico local urológico si disponible",
      "Antibióticos solo si indicación/protocolo",
      "Alfabloqueantes según indicación médica",
      "Analgesia según dolor"
    ],
    "escalas": [
      "ABCDE",
      "Escala del dolor",
      "Tira de orina",
      "Diuresis registrada",
      "Signos de sepsis"
    ],
    "tecnicas": [
      "Sondaje vesical",
      "Sonda Foley 16-18",
      "Sonda doble vía si hematuria",
      "Lavado vesical si coágulos",
      "Vaciado vesical controlado",
      "Tacto rectal en varones",
      "Cistostomía suprapúbica hospitalaria"
    ],
    "alertas": [
      "no maniobras violentas",
      "resistencia al sondaje",
      "sospecha lesión uretral",
      "trauma pélvico",
      "hematuria tras sondaje",
      "no sale orina tras sondaje",
      "fiebre/prostatitis",
      "derivar si no se consigue sondar"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La retención aguda de orina es la imposibilidad de realizar la micción y vaciar la vejiga a pesar del deseo y los esfuerzos del paciente. Es una auténtica urgencia urológica por el dolor y desasosiego que produce.</p>"
    },
    {
      "h": "Clínica típica",
      "b": "<ul><li>Imposibilidad para orinar de inicio súbito o progresivo.</li><li>Dolor hipogástrico o suprapúbico intenso.</li><li>Sensación de repleción vesical e imperiosidad miccional.</li><li>Agitación, sudoración y ansiedad por el dolor.</li><li>En obstrucción crónica: dificultad para iniciar micción, goteo posmiccional, polaquiuria e incontinencia por rebosamiento.</li></ul>"
    },
    {
      "h": "Causas frecuentes",
      "b": "<ul><li>Varón mayor de 50 años con obstrucción prostática: hiperplasia benigna de próstata, adenocarcinoma o prostatitis.</li><li>Estenosis uretral.</li><li>Retención por coágulos en hematuria.</li><li>Fármacos: antidepresivos tricíclicos, antiparkinsonianos, anticolinérgicos, antihistamínicos, simpaticomiméticos, opioides.</li><li>Neurológicas: lesión medular, vejiga neurógena, postoperatorio.</li><li>Infección, estreñimiento severo o dolor intenso.</li></ul>"
    },
    {
      "h": "Exploración física",
      "b": "<ul><li>Dolor intenso a la palpación hipogástrica.</li><li>Masa suprapúbica dolorosa, desplazable y dura/semidura: globo vesical. Puede no palparse en obesidad.</li><li>Constantes si dolor intenso, fiebre o mal estado.</li><li>Tacto rectal en varones para valorar prostatitis, HBP o neoplasia si procede y situación lo permite.</li><li> signos de trauma pélvico/uretral: sangre en meato, hematoma perineal, fractura pélvica, imposibilidad tras traumatismo.</li></ul>"
    },
    {
      "h": "Pruebas orientativas",
      "b": "<ul><li>Tira de orina tras obtener muestra: puede mostrar leucocituria, hematuria o ser normal.</li><li>Si no cumple criterios de derivación hospitalaria, la tira de orina puede ser la única prueba urgente.</li><li>Pruebas diferidas/hospitalarias según caso: hemograma, sedimento, bioquímica con función renal, urocultivo y ecografía.</li></ul>"
    },
    {
      "h": "Confirmación diagnóstica",
      "b": "<p>El diagnóstico se confirma al cateterizar la uretra y obtener orina, descartando confusión con disuria intensa. Si el sondaje se realiza correctamente y no sale orina, hay que pensar en anuria u obstrucción ureteral bilateral.</p>"
    },
    {
      "h": "Tratamiento: sondaje vesical",
      "b": "<ol><li>Asepsia estricta con guantes, paños, gasas y lubricación estériles.</li><li>Elegir sonda Foley de grueso calibre 16-18. Si se sospecha hematuria/coágulos, usar doble vía o triple vía según necesidad de lavado.</li><li>En varón, traccionar suavemente el pene para rectificar curvaturas uretrales.</li><li>Introducir la sonda sin maniobras violentas. Si hay resistencia, dolor intenso o sangre, detener y derivar.</li><li>Confirmar salida de orina antes de inflar balón.</li><li>Fijar sonda y registrar volumen drenado.</li></ol>"
    },
    {
      "h": "Vaciado vesical controlado",
      "b": "<p>El manual recomienda evitar hematuria “ex vacuo” deteniendo el flujo durante unos 20 minutos cada 350-500 ml, o manteniendo flujo continuo con la bolsa de diuresis al mismo nivel que la vejiga.</p><ul><li>Vigilar dolor, mareo, hipotensión, hematuria y espasmos vesicales.</li><li>Registrar volumen inicial y evolución de diuresis.</li></ul>"
    },
    {
      "h": "Si no se consigue sondar",
      "b": "<ul><li>No insistir con maniobras violentas.</li><li>Valorar causas: gran hipertrofia prostática, cáncer avanzado, estenosis uretral, falso trayecto, prostatitis, lesión uretral.</li><li>Derivar al hospital para sondaje por personal experto o cistostomía suprapúbica.</li><li>Si hay traumatismo pélvico o sangre en meato: no sondar sin valoración urológica/radiológica.</li></ul>"
    },
    {
      "h": "Criterios de derivación",
      "b": "<ul><li>Imposibilidad de sondaje.</li><li>Sospecha de lesión uretral o trauma pélvico.</li><li>Fiebre, prostatitis, sepsis o mal estado general.</li><li>Hematuria con coágulos o retención por coágulos.</li><li>Insuficiencia renal, anuria o no sale orina tras sondaje.</li><li>Dolor persistente pese a drenaje.</li><li>Paciente frágil, anticoagulado o con comorbilidad relevante.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Explicar la técnica al paciente para disminuir ansiedad.</li><li>Garantizar intimidad, analgesia/comfort y asepsia.</li><li>No inflar el balón hasta confirmar salida de orina.</li><li>Registrar calibre de sonda, volumen inicial, aspecto de orina, incidencias y tolerancia.</li><li>Vigilar hematuria ex vacuo, dolor, espasmos, fiebre y obstrucción de sonda.</li><li>Educar si queda sondado: bolsa por debajo de vejiga, no tirones, higiene, signos de alarma y seguimiento.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Forzar la sonda ante resistencia.</li><li>Inflar balón sin salida de orina.</li><li>No descartar trauma uretral antes de sondar.</li><li>No registrar volumen drenado.</li><li>Vaciado rápido sin vigilancia en retenciones muy voluminosas.</li><li>No derivar si sondaje imposible o no sale orina.</li></ul>"
    }
  ],
  "block": 13
},
{
  "id": "misc-vm-transporte-sanitario-ingesa",
  "cat": "uci",
  "especialidad": "Críticos / Transporte sanitario / Respiratorio",
  "title": "Ventilación mecánica en el transporte sanitario",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Miscelánea, 2013; revisar protocolos actuales de transporte crítico.",
  "tags": "ventilacion mecanica transporte sanitario paciente critico intubacion ventilador traslado monitorizacion alarmas PEEP FiO2 volumen tidal presión vía aérea capnografía",
  "summary": "Checklist práctico para el traslado de pacientes con ventilación mecánica: indicación, estabilización previa, parámetros, alarmas, monitorización, seguridad y transferencia.",
  "relations": {
    "patologias": [
      "Insuficiencia respiratoria aguda",
      "TCE grave",
      "PCR recuperada",
      "Shock",
      "SDRA",
      "EAP",
      "Politrauma",
      "Coma",
      "Apnea"
    ],
    "farmacos": [
      "Oxígeno",
      "Sedación según protocolo",
      "Analgesia según protocolo",
      "Relajantes neuromusculares si indicación médica",
      "Cristaloides/vasopresores según situación"
    ],
    "escalas": [
      "ABCDE",
      "Glasgow",
      "SatO₂",
      "EtCO₂",
      "Presión arterial",
      "Escala de sedación"
    ],
    "tecnicas": [
      "Intubación orotraqueal",
      "Ventilación mecánica invasiva",
      "Capnografía",
      "Aspiración de secreciones",
      "Control de neumotaponamiento",
      "Check-list pretraslado"
    ],
    "alertas": [
      "Glasgow <8",
      "SatO₂ <90 pese a O₂",
      "FR >35 + fatiga",
      "asincronía toracoabdominal",
      "apnea/PCR",
      "desconexión ventilador",
      "batería/oxígeno insuficiente",
      "alarmas anuladas"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La ventilación mecánica es un procedimiento de respiración artificial que utiliza un aparato mecánico para ayudar o sustituir la función respiratoria, mejorar la oxigenación e influir en la mecánica pulmonar. En transporte sanitario, el objetivo es mantener estabilidad cardiorrespiratoria antes, durante y al final del traslado.</p>"
    },
    {
      "h": "Indicaciones prácticas de ventilación invasiva",
      "b": "<ul><li>Parada respiratoria, apnea o PCR.</li><li>Necesidad de proteger vía aérea: coma, Glasgow &lt;8, vómitos, secreciones o riesgo de broncoaspiración.</li><li>Fracaso respiratorio con hipoxemia persistente: SatO₂ &lt;90 % pese a aporte alto de oxígeno.</li><li>Trabajo respiratorio excesivo: FR &gt;35, tiraje, uso de musculatura accesoria, fatiga o asincronía toracoabdominal.</li><li>TCE grave, politrauma, shock o sedación profunda que compromete ventilación.</li></ul>"
    },
    {
      "h": "Antes de salir: checklist de seguridad",
      "b": "<ol><li>Confirmar vía aérea: posición del tubo, fijación, presión de neumotaponamiento y capnografía si disponible.</li><li>Comprobar ventilador: modo, FiO₂, Vt o presión, FR, PEEP, trigger, alarmas, batería y circuito.</li><li>Calcular oxígeno suficiente para todo el traslado + margen de seguridad.</li><li>Monitorización: ECG, TA, SatO₂, EtCO₂, temperatura si precisa.</li><li>Vía venosa permeable, bombas, sedación/analgesia, sueros y medicación de rescate.</li><li>Aspirador funcionante y material de vía aérea alternativo.</li><li>Plan ante extubación accidental, obstrucción o parada.</li></ol>"
    },
    {
      "h": "Parámetros orientativos",
      "b": "<ul><li><b>Volumen tidal:</b> usar estrategia protectora, especialmente en SDRA o pulmón vulnerable.</li><li><b>FiO₂:</b> ajustar para mantener oxigenación adecuada, evitando hiperoxia innecesaria si está estable.</li><li><b>PEEP:</b> mantener reclutamiento y oxigenación, vigilando hipotensión o barotrauma.</li><li><b>FR/minuto:</b> ajustar a ventilación, EtCO₂ y situación ácido-base.</li><li><b>Presiones:</b> vigilar presión pico/meseta si disponible y cambios bruscos durante el traslado.</li></ul><p>Los parámetros definitivos deben individualizarse y validarse por equipo entrenado.</p>"
    },
    {
      "h": "Alarmas que no se ignoran",
      "b": "<ul><li><b>Alta presión:</b> secreciones, acodamiento, mordida, broncoespasmo, neumotórax, tos o mala adaptación.</li><li><b>Baja presión/fuga:</b> desconexión, fuga en circuito, cuff bajo, extubación accidental.</li><li><b>Bajo volumen minuto:</b> fuga, apnea, sedación excesiva, desconexión o fallo del ventilador.</li><li><b>SatO₂ baja:</b> revisar paciente primero, luego tubo, circuito, fuente de O₂ y ventilador.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Registrar parámetros iniciales y cambios durante traslado.</li><li>Aspirar solo si precisa, con preoxigenación si protocolo.</li><li>Vigilar sedación, analgesia, sincronía y dolor.</li><li>Evitar tracciones del tubo/circuito en movilizaciones.</li><li>Comprobar baterías, oxígeno, bombas y fijaciones antes de cada transferencia camilla-cama.</li><li>Transferir: indicación, tubo, parámetros, gasometría si disponible, EtCO₂, fármacos, incidencias y respuesta.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Salir sin comprobar oxígeno/batería suficientes.</li><li>Anular alarmas.</li><li>No llevar bolsa-mascarilla y material de vía aérea.</li><li>No usar capnografía si está disponible.</li><li>Trasladar sin estabilizar primero salvo emergencia de evacuación.</li><li>No registrar parámetros ni incidencias.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "misc-vmni-ingesa",
  "cat": "uci",
  "especialidad": "Respiratorio / Críticos / Urgencias",
  "title": "Ventilación mecánica no invasiva (VMNI)",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Miscelánea, 2013; revisar protocolos actuales de VMNI.",
  "tags": "VMNI CPAP BiPAP ventilacion no invasiva EPOC EAP hipercapnia hipoxemia mascarilla fugas PEEP presión soporte contraindicaciones",
  "summary": "Uso seguro de VMNI/CPAP/BiPAP en urgencias: indicaciones, contraindicaciones, inicio, vigilancia, fracaso y cuidados de enfermería.",
  "relations": {
    "patologias": [
      "EPOC reagudizado",
      "Edema agudo de pulmón",
      "Insuficiencia respiratoria hipercápnica",
      "Insuficiencia respiratoria hipoxémica",
      "SAOS",
      "Enfermedad neuromuscular"
    ],
    "farmacos": [
      "Oxígeno",
      "Salbutamol",
      "Ipratropio",
      "Corticoides",
      "Nitroglicerina si EAP según protocolo",
      "Sedación mínima solo si protocolo"
    ],
    "escalas": [
      "ABCDE",
      "SatO₂",
      "FR",
      "Glasgow",
      "EtCO₂ si disponible",
      "Gasometría"
    ],
    "tecnicas": [
      "CPAP",
      "BiPAP",
      "Mascarilla oronasal",
      "Control de fugas",
      "Protección cutánea",
      "Monitorización continua"
    ],
    "alertas": [
      "no usar si coma/vómitos",
      "shock grave",
      "secreciones no manejables",
      "trauma facial",
      "fracaso precoz",
      "fugas excesivas",
      "empeora conciencia",
      "preparar IOT si falla"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La VMNI es soporte ventilatorio externo sin tubo endotraqueal. Permite aplicar presión positiva para mejorar ventilación y oxigenación, reduciendo el trabajo respiratorio y, en escenarios seleccionados, evitando intubación.</p>"
    },
    {
      "h": "Escenarios útiles",
      "b": "<ul><li><b>EPOC hipercápnico:</b> reduce trabajo respiratorio y ayuda a corregir hipoventilación.</li><li><b>Edema agudo de pulmón:</b> CPAP/PEEP mejora oxigenación y reduce precarga/poscarga.</li><li><b>Hipoxemia seleccionada:</b> si paciente coopera y no hay contraindicación.</li><li><b>Enfermedad neuromuscular/SAOS:</b> soporte ventilatorio en contextos concretos.</li></ul>"
    },
    {
      "h": "Indicaciones prácticas",
      "b": "<ul><li>Disnea en reposo con uso de musculatura accesoria.</li><li>FR elevada, por ejemplo &gt;25 rpm, o signos de fatiga.</li><li>Movimiento paradójico abdominal.</li><li>Hipoxemia persistente pese a oxígeno convencional.</li><li>Hipercapnia/acidosis respiratoria si gasometría disponible.</li><li>EAP con dificultad respiratoria y tensión adecuada.</li></ul>"
    },
    {
      "h": "Contraindicaciones",
      "b": "<ul><li>Parada respiratoria o necesidad inmediata de intubación.</li><li>Glasgow bajo, coma o incapacidad para proteger vía aérea.</li><li>Vómitos activos o alto riesgo de broncoaspiración.</li><li>Shock grave o inestabilidad no controlada.</li><li>Trauma/cirugía facial, quemaduras faciales o imposibilidad de sellado.</li><li>Secreciones abundantes no manejables.</li><li>Agitación no controlada o falta de cooperación.</li></ul>"
    },
    {
      "h": "Inicio y vigilancia",
      "b": "<ol><li>Explicar al paciente: la tolerancia mejora si entiende qué va a notar.</li><li>Elegir interfaz y proteger puente nasal/puntos de presión.</li><li>Iniciar con presiones bajas-medias y ajustar según respuesta, protocolo y equipo.</li><li>Monitorizar SatO₂, FR, TA, FC, conciencia, fugas y sincronía.</li><li>Reevaluar precozmente: en los primeros minutos debe mejorar disnea, FR, SatO₂ y trabajo respiratorio.</li><li>Preparar plan B: IOT si fracaso.</li></ol>"
    },
    {
      "h": "Criterios de fracaso",
      "b": "<ul><li>Empeoramiento del nivel de conciencia.</li><li>Persistencia o empeoramiento de hipoxemia.</li><li>Agotamiento, bradipnea o respiración irregular.</li><li>Inestabilidad hemodinámica.</li><li>Intolerancia pese a ajustes razonables.</li><li>Secreciones/vómitos o broncoaspiración.</li><li>No mejora clínica precoz.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Control de fugas y lesiones por presión.</li><li>Vigilar distensión gástrica, vómitos, sequedad de mucosas y ansiedad.</li><li>Comprobar alarmas, conexiones, humidificación si procede y oxígeno.</li><li>No dejar solo al paciente en fase de inicio.</li><li>Registrar parámetros, tolerancia, respuesta y motivos de retirada.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Usar VMNI como sustituto de una intubación claramente necesaria.</li><li>No vigilar al inicio.</li><li>No preparar material de vía aérea avanzada.</li><li>Forzar VMNI en paciente que vomita o no protege vía aérea.</li><li>No revisar fugas antes de subir presiones.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "misc-oftalmologia-urgencias-ingesa",
  "cat": "oft",
  "especialidad": "Oftalmología / Urgencias",
  "title": "Urgencias en oftalmología",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Miscelánea, 2013.",
  "tags": "oftalmologia ojo rojo trauma ocular quemadura quimica cuerpo extraño glaucoma agudo pérdida visión diplopia perforacion ocular lavado ocular parche",
  "summary": "Valoración y manejo inicial de urgencias oftalmológicas: ojo rojo, pérdida visual, traumatismo, cuerpo extraño, quemadura química y glaucoma agudo.",
  "relations": {
    "patologias": [
      "Traumatismo ocular",
      "Cuerpo extraño ocular",
      "Quemadura química ocular",
      "Glaucoma agudo",
      "Conjuntivitis",
      "Queratitis",
      "Uveítis",
      "Desprendimiento de retina",
      "Oclusión vascular retiniana"
    ],
    "farmacos": [
      "Suero fisiológico",
      "Analgésicos",
      "Antiemético si glaucoma/vómitos",
      "Colirios según prescripción",
      "Antibiótico tópico según protocolo"
    ],
    "escalas": [
      "Agudeza visual",
      "Dolor ocular",
      "Pupilas",
      "ABCDE si trauma mayor"
    ],
    "tecnicas": [
      "Lavado ocular abundante",
      "Eversión palpebral",
      "Protección ocular rígida",
      "No presión ocular",
      "Retirada simple de cuerpo extraño superficial si protocolo"
    ],
    "alertas": [
      "pérdida brusca visión",
      "dolor ocular intenso",
      "quemadura química",
      "trauma penetrante",
      "pupila irregular",
      "hifema",
      "cuerpo extraño alta velocidad",
      "no parche compresivo si perforación"
    ]
  },
  "sec": [
    {
      "h": "Prioridad",
      "b": "<p>En oftalmología urgente, la pregunta clave es si existe amenaza para la visión. Dolor intenso, pérdida visual, trauma penetrante, quemadura química, hifema, pupila irregular o cuerpo extraño de alta velocidad requieren derivación urgente.</p>"
    },
    {
      "h": "Valoración inicial",
      "b": "<ul><li>Agudeza visual de cada ojo por separado antes de manipular si es posible.</li><li>Dolor, fotofobia, lagrimeo, secreción, visión borrosa, halos, diplopía.</li><li>Pupilas, simetría, respuesta a luz y motilidad ocular.</li><li>Inspección: heridas, cuerpos extraños, hifema, proptosis, quemaduras, edema palpebral.</li><li>Mecanismo: químico, térmico, contuso, penetrante, alta velocidad, lentillas.</li></ul>"
    },
    {
      "h": "Quemadura química",
      "b": "<ol><li>Iniciar lavado inmediato, no esperar a identificar producto.</li><li>Retirar lentes de contacto si es posible.</li><li>Irrigar con suero o agua abundante durante tiempo prolongado.</li><li>Evertir párpados y retirar partículas si se ven y es seguro.</li><li>Derivación urgente tras lavado, especialmente álcalis, dolor intenso o alteración visual.</li></ol>"
    },
    {
      "h": "Traumatismo ocular",
      "b": "<ul><li>Si sospecha perforación: no presionar, no retirar objeto enclavado, no parche compresivo.</li><li>Proteger con escudo rígido y derivar urgente.</li><li>Hifema, pupila irregular, disminución visual o dolor intenso: urgencia oftalmológica.</li><li>Cuerpo extraño superficial: valorar retirada solo si protocolo y sin sospecha de penetración.</li></ul>"
    },
    {
      "h": "Ojo rojo: claves de gravedad",
      "b": "<ul><li>Conjuntivitis simple suele producir secreción y molestia, con visión conservada.</li><li>Dolor intenso, fotofobia, visión reducida, náuseas/vómitos, córnea opaca o pupila media fija sugieren patología grave.</li><li>Glaucoma agudo: dolor ocular intenso, ojo rojo, halos, náuseas/vómitos, midriasis media y córnea turbia.</li><li>Queratitis en usuario de lentillas requiere valoración urgente.</li></ul>"
    },
    {
      "h": "Pérdida brusca de visión",
      "b": "<ul><li>Sin dolor: pensar en oclusión vascular, desprendimiento de retina, hemorragia vítrea.</li><li>Con dolor: glaucoma agudo, neuritis, queratitis grave, trauma.</li><li>Cortina negra, flashes o moscas volantes nuevas: sospecha de desprendimiento/rotura retiniana.</li><li>Derivación urgente; registrar hora de inicio.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>No retrasar lavado en quemadura química.</li><li>Registrar agudeza visual inicial y mecanismo lesional.</li><li>Control del dolor y náuseas.</li><li>Evitar presión directa si trauma.</li><li>Conservar gafas/lentes/cuerpo extraño si procede.</li><li>Transferir: ojo afectado, AV, mecanismo, lavado realizado, productos y evolución.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Tapar con parche compresivo una posible perforación.</li><li>Retrasar lavado químico buscando neutralizante.</li><li>Retirar objeto enclavado.</li><li>No preguntar por lentillas.</li><li>No medir agudeza visual antes del traslado si se puede.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "misc-orl-urgencias-ingesa",
  "cat": "orl",
  "especialidad": "ORL / Urgencias",
  "title": "Urgencias en ORL",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Miscelánea, 2013.",
  "tags": "ORL epistaxis otalgia otitis vertigo cuerpo extraño nasal oído garganta absceso periamigdalino disfonia estridor hipoacusia tapón cerumen",
  "summary": "Manejo inicial de problemas ORL frecuentes: epistaxis, cuerpos extraños, otalgia/otitis, vértigo, hipoacusia, odinofagia grave y obstrucción de vía aérea superior.",
  "relations": {
    "patologias": [
      "Epistaxis",
      "Cuerpo extraño nasal",
      "Cuerpo extraño ótico",
      "Otitis externa",
      "Otitis media",
      "Vértigo periférico",
      "Absceso periamigdalino",
      "Angioedema",
      "Estridor",
      "Tapón de cerumen"
    ],
    "farmacos": [
      "Suero fisiológico",
      "Analgésicos",
      "Antieméticos",
      "Antibióticos según protocolo",
      "Adrenalina si anafilaxia/angioedema según protocolo",
      "Corticoides según protocolo"
    ],
    "escalas": [
      "ABCDE",
      "SatO₂",
      "Escala del dolor",
      "Glasgow si compromiso"
    ],
    "tecnicas": [
      "Compresión nasal",
      "Taponamiento nasal anterior",
      "Extracción de cuerpo extraño si seguro",
      "Otoscopia",
      "Maniobras vestibulares por personal entrenado",
      "Aspiración"
    ],
    "alertas": [
      "estridor",
      "sialorrea",
      "disnea",
      "sangrado posterior",
      "anticoagulación",
      "trauma facial",
      "vértigo + focalidad neurológica",
      "otalgia diabético/inmunodeprimido",
      "cuerpo extraño botón/pila"
    ]
  },
  "sec": [
    {
      "h": "Epistaxis",
      "b": "<ul><li>Sentar al paciente inclinado hacia delante.</li><li>Comprimir alas nasales 10-15 minutos sin soltar.</li><li>Evitar echar la cabeza hacia atrás.</li><li>Valorar TA, anticoagulación, trauma, sangrado posterior, anemia o shock.</li><li>Si no cede: taponamiento anterior si protocolo y traslado.</li><li>Sangrado posterior, inestabilidad, anticoagulación relevante o trauma: derivación urgente.</li></ul>"
    },
    {
      "h": "Cuerpos extraños",
      "b": "<ul><li><b>Nariz:</b> frecuente en niños; derivar si pila de botón, imán, objeto profundo o no visible.</li><li><b>Oído:</b> no irrigar si pila, cuerpo extraño orgánico que se hincha o sospecha de perforación timpánica.</li><li><b>Garganta/vía aérea:</b> si disnea, estridor, sialorrea o imposibilidad de tragar: emergencia.</li><li>Evitar maniobras repetidas que empujen el objeto más profundo.</li></ul>"
    },
    {
      "h": "Otalgia y otitis",
      "b": "<ul><li>Valorar dolor, fiebre, otorrea, hipoacusia, vértigo, diabetes/inmunodepresión.</li><li>Otitis externa: dolor al mover pabellón/tragus.</li><li>Otitis media: fiebre, dolor profundo, membrana timpánica alterada si otoscopia.</li><li>Diabético/inmunodeprimido con otalgia intensa y otorrea: sospechar otitis externa maligna y derivar.</li><li>Mastoiditis: dolor/edema retroauricular y desplazamiento del pabellón; derivación urgente.</li></ul>"
    },
    {
      "h": "Vértigo",
      "b": "<ul><li>Diferenciar vértigo periférico de central.</li><li>Periférico: rotatorio, náuseas, nistagmo, empeora con movimientos, sin focalidad neurológica.</li><li>Central: focalidad, diplopía, disartria, ataxia severa, cefalea nueva, nistagmo vertical o alteración conciencia.</li><li>Vértigo + focalidad = código neurológico/ictus hasta demostrar lo contrario.</li></ul>"
    },
    {
      "h": "Odinofagia grave / vía aérea superior",
      "b": "<ul><li>Alertas: estridor, babeo/sialorrea, voz apagada, trismus, dificultad para abrir boca, desviación de úvula, rigidez cervical, dificultad respiratoria.</li><li>Absceso periamigdalino: dolor unilateral, fiebre, voz de “patata caliente”, trismus.</li><li>Epiglotitis/angioedema: no manipular innecesariamente; mantener sentado, oxígeno y traslado medicalizado.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Vigilar vía aérea en cualquier cuadro ORL con estridor, sialorrea o voz alterada.</li><li>Cuantificar epistaxis y comprobar anticoagulantes.</li><li>No irrigar oído sin seguridad.</li><li>Control de dolor, náuseas y seguridad ante vértigo.</li><li>Transferir: inicio, lateralidad, sangrado, fármacos, trauma, focalidad, cuerpo extraño y maniobras realizadas.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Echar la cabeza hacia atrás en epistaxis.</li><li>Irrigar oído con pila de botón.</li><li>Manipular vía aérea superior inestable.</li><li>Etiquetar vértigo como benigno si hay signos neurológicos.</li><li>Insistir en extracción de cuerpo extraño si no sale fácil.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "misc-dermatologia-urgencias-ingesa",
  "cat": "derma",
  "especialidad": "Dermatología / Urgencias",
  "title": "Urgencias dermatológicas",
  "source": "Adaptado de INGESA · Protocolos Clínico-Terapéuticos en Urgencias Extrahospitalarias, bloque Miscelánea, 2013.",
  "tags": "dermatologia urgencias urticaria angioedema anafilaxia celulitis erisipela absceso herpes zoster necrolisis epidermica Stevens Johnson púrpura petequias lesiones piel",
  "summary": "Valoración práctica de lesiones cutáneas urgentes: distinguir benignidad de cuadros sistémicos, infecciosos, alérgicos o potencialmente graves.",
  "relations": {
    "patologias": [
      "Urticaria",
      "Angioedema",
      "Anafilaxia",
      "Celulitis",
      "Erisipela",
      "Absceso cutáneo",
      "Herpes zóster",
      "Púrpura/petequias",
      "Síndrome de Stevens-Johnson",
      "Necrólisis epidérmica tóxica",
      "Eritrodermia"
    ],
    "farmacos": [
      "Adrenalina IM si anafilaxia",
      "Antihistamínicos",
      "Corticoides",
      "Antibióticos según protocolo",
      "Analgésicos",
      "Antivirales según protocolo",
      "Cristaloides si shock"
    ],
    "escalas": [
      "ABCDE",
      "SatO₂",
      "TA/FC",
      "Temperatura",
      "Escala del dolor",
      "Extensión de lesiones"
    ],
    "tecnicas": [
      "Exploración completa de piel y mucosas",
      "Marcaje de celulitis",
      "Drenaje de absceso por personal entrenado",
      "Aislamiento si infección contagiosa",
      "Fotografía clínica si protocolo"
    ],
    "alertas": [
      "lesiones + dificultad respiratoria",
      "angioedema lingual",
      "púrpura que no blanquea",
      "fiebre + mal estado",
      "afectación mucosas",
      "despegamiento cutáneo",
      "dolor desproporcionado",
      "inmunodeprimido"
    ]
  },
  "sec": [
    {
      "h": "Enfoque inicial",
      "b": "<p>Una lesión cutánea puede ser local y banal, pero también la primera manifestación de anafilaxia, sepsis, meningococemia, reacción medicamentosa grave o infección necrotizante. La valoración empieza por ABCDE y estado general.</p>"
    },
    {
      "h": "Signos de alarma",
      "b": "<ul><li>Dificultad respiratoria, estridor, hipotensión o síncope.</li><li>Angioedema de lengua, labios, úvula o laringe.</li><li>Petequias/púrpura que no blanquean con fiebre o mal estado.</li><li>Afectación de mucosas, ampollas extensas o desprendimiento cutáneo.</li><li>Dolor desproporcionado, crepitación, necrosis o progresión rápida.</li><li>Paciente inmunodeprimido, diabético o con neutropenia.</li></ul>"
    },
    {
      "h": "Urticaria, angioedema y anafilaxia",
      "b": "<ul><li>Urticaria: habones pruriginosos migratorios.</li><li>Angioedema: edema profundo de labios, párpados, lengua o vía aérea.</li><li>Anafilaxia: afectación cutánea más compromiso respiratorio, cardiovascular o digestivo grave.</li><li>Adrenalina IM inmediata si anafilaxia; oxígeno, fluidos y traslado urgente.</li><li>Antihistamínicos/corticoides no sustituyen adrenalina.</li></ul>"
    },
    {
      "h": "Celulitis, erisipela y absceso",
      "b": "<ul><li>Celulitis: eritema, calor, dolor, edema, bordes menos definidos.</li><li>Erisipela: placa roja brillante, elevada y bien delimitada, a menudo con fiebre.</li><li>Absceso: colección fluctuante de pus, dolor localizada.</li><li>Marcar bordes y registrar extensión.</li><li>Derivar si fiebre, sepsis, cara/manos/genitales, inmunodepresión, dolor intenso, necrosis o mala evolución.</li></ul>"
    },
    {
      "h": "Lesiones purpúricas y petequiales",
      "b": "<ul><li>Lesiones que no blanquean a la presión son alarma, especialmente con fiebre, cefalea, rigidez nuca, confusión o hipotensión.</li><li>Pensar en meningococemia/sepsis, trombocitopenia, vasculitis o coagulopatía.</li><li>ABCDE, aislamiento si sospecha meningocócica, vía venosa, antibiótico si protocolo y traslado urgente.</li></ul>"
    },
    {
      "h": "Reacciones cutáneas graves",
      "b": "<ul><li>Sospechar Stevens-Johnson/NET si hay fiebre, mal estado, lesiones dolorosas, ampollas, erosiones y afectación de mucosas tras fármacos.</li><li>No arrancar piel ni aplicar productos irritantes.</li><li>Cubrir con sábanas limpias, analgesia, fluidos si extensa y traslado urgente a centro útil.</li></ul>"
    },
    {
      "h": "Herpes zóster",
      "b": "<ul><li>Dolor urente y vesículas en dermatoma.</li><li>Derivar urgente si afectación ocular, inmunodepresión, diseminado, dolor intenso, compromiso neurológico o localización facial complicada.</li><li>Antiviral precoz según protocolo, analgesia y cuidado de lesiones.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li> piel y mucosas con respeto e intimidad.</li><li>Registrar distribución, extensión, dolor, prurito, fiebre y evolución temporal.</li><li>Preguntar fármacos nuevos, alimentos, picaduras, infecciones, viajes y contactos.</li><li>Preparar adrenalina y vía aérea si angioedema/anafilaxia.</li><li>Transferir signos sistémicos, mucosas, fármacos, alergias, extensión y tratamientos.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Tratar anafilaxia solo con antihistamínicos.</li><li>Ignorar púrpura febril.</li><li>No revisar mucosas en exantema grave.</li><li>No valorar dolor desproporcionado.</li><li>Dar de baja prioridad a inmunodeprimido con lesión cutánea y fiebre.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "misc-rcp-esquemas-ingesa-actualizar",
  "cat": "resus",
  "especialidad": "RCP / Urgencias / Críticos",
  "title": "Esquemas de RCP y soporte vital",
  "source": "Basado en el bloque Miscelánea del manual INGESA 2013; actualizar con AHA/ERC locales vigentes antes de uso asistencial.",
  "tags": "RCP soporte vital básico avanzado PCR compresiones desfibrilación DEA adrenalina amiodarona ritmo desfibrilable asistolia AESP 4H 4T vía aérea",
  "summary": "Ficha de RCP para iNurse: reconocimiento de PCR, RCP de calidad, desfibrilación, ritmos, causas reversibles, cuidados posresucitación y seguridad.",
  "relations": {
    "patologias": [
      "Parada cardiorrespiratoria",
      "FV",
      "TV sin pulso",
      "Asistolia",
      "AESP",
      "Obstrucción de vía aérea",
      "SCA",
      "Hipoxia",
      "Hipovolemia",
      "Hipotermia"
    ],
    "farmacos": [
      "Adrenalina",
      "Amiodarona",
      "Lidocaína según protocolo",
      "Magnesio en torsade",
      "Cristaloides",
      "Glucosa si hipoglucemia",
      "Naloxona si opioides"
    ],
    "escalas": [
      "ABCDE",
      "Ritmo ECG",
      "EtCO₂",
      "Glasgow pos-ROSC",
      "Pupilas"
    ],
    "tecnicas": [
      "Compresiones torácicas",
      "DEA/desfibrilación",
      "Ventilación con BVM",
      "IOT/dispositivo supraglótico",
      "Capnografía",
      "Acceso IV/IO"
    ],
    "alertas": [
      "compresiones 100-120/min",
      "profundidad 5-6 cm adulto",
      "minimizar pausas",
      "desfibrilación precoz",
      "rotar reanimador",
      "buscar 4H/4T",
      "ROSC no es final",
      "validar AHA/ERC"
    ]
  },
  "sec": [
    {
      "h": "Reconocer PCR",
      "b": "<ol><li>Seguridad de escena.</li><li>Comprobar respuesta.</li><li>Abrir vía aérea y valorar respiración normal.</li><li>Activar sistema de emergencias/equipo.</li><li>Si no respira normalmente o hay dudas: iniciar RCP y conectar DEA/desfibrilador.</li></ol>"
    },
    {
      "h": "RCP de calidad en adulto",
      "b": "<ul><li>Compresiones en centro del tórax.</li><li>Frecuencia 100-120/min.</li><li>Profundidad 5-6 cm en adulto.</li><li>Permitir reexpansión completa.</li><li>Minimizar interrupciones.</li><li>Rotar reanimador cada 2 minutos si es posible.</li><li>Evitar ventilación excesiva.</li></ul>"
    },
    {
      "h": "Ritmos desfibrilables",
      "b": "<ul><li>FV y TV sin pulso: desfibrilación precoz.</li><li>Reanudar compresiones inmediatamente tras descarga.</li><li>Revalorar ritmo cada 2 minutos.</li><li>Adrenalina y antiarrítmico según algoritmo local.</li><li>Considerar causas reversibles: hipoxia, SCA, alteraciones electrolíticas, tóxicos.</li></ul>"
    },
    {
      "h": "Ritmos no desfibrilables",
      "b": "<ul><li>Asistolia y AESP: RCP de calidad, adrenalina precoz según protocolo y búsqueda activa de reversibles.</li><li>No desfibrilar asistolia.</li><li>Confirmar conexiones/ganancia del monitor si línea plana.</li><li>Reevaluar ritmo cada 2 minutos.</li></ul>"
    },
    {
      "h": "Causas reversibles: 4H/4T",
      "b": "<ul><li><b>Hipoxia.</b></li><li><b>Hipovolemia.</b></li><li><b>Hipo/hiperpotasemia y alteraciones metabólicas.</b></li><li><b>Hipotermia.</b></li><li><b>Taponamiento cardíaco.</b></li><li><b>Tóxicos.</b></li><li><b>Trombosis coronaria o pulmonar.</b></li><li><b>Neumotórax a tensión.</b></li></ul>"
    },
    {
      "h": "Vía aérea y ventilación",
      "b": "<ul><li>Ventilar con bolsa-mascarilla si equipo entrenado.</li><li>Con vía aérea avanzada: evitar interrumpir compresiones y ventilar según protocolo.</li><li>Capnografía si disponible: confirma posición, calidad de RCP y posible ROSC.</li><li>Evitar hiperventilación: empeora retorno venoso.</li></ul>"
    },
    {
      "h": "ROSC: cuidados inmediatos",
      "b": "<ul><li>Reevaluación ABCDE.</li><li>Oxigenación y ventilación controladas.</li><li>TA, ECG 12 derivaciones, glucemia, temperatura y nivel neurológico.</li><li>Tratar causa probable: SCA, hipoxia, TEP, sepsis, tóxicos, etc.</li><li>Traslado a centro útil con preaviso.</li></ul>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Organizar roles: compresiones, vía aérea, desfibrilador, fármacos, registro.</li><li>Registrar tiempos: inicio, ritmos, descargas, adrenalina, vía aérea, ROSC.</li><li>Preparar medicación y acceso IV/IO.</li><li>Control de calidad: profundidad, frecuencia, pausas y rotación.</li><li>Apoyo a familia si presente y según política local.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Retrasar compresiones por buscar pulso demasiado tiempo.</li><li>Pausas largas para intubar o canalizar vía.</li><li>Ventilar demasiado.</li><li>No desfibrilar precozmente FV/TV sin pulso.</li><li>Olvidar causas reversibles.</li><li>No actualizar el algoritmo con AHA/ERC vigente.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "misc-sepsis-prehospitalaria-ingesa-actualizar",
  "cat": "sepsis",
  "especialidad": "Sepsis / Urgencias / Críticos",
  "title": "Manejo extrahospitalario de la sepsis",
  "source": "Adaptado del bloque Miscelánea del manual INGESA 2013 · Actualizado con NICE NG253 (2025) y Surviving Sepsis Campaign 2026; aplicar el protocolo vigente en el centro.",
  "tags": "sepsis shock septico prehospitalaria sospecha infeccion hipotension lactato qSOFA SOFA fiebre hipotermia antibiotico fluidoterapia noradrenalina codigo sepsis",
  "summary": "Reconocimiento precoz de sepsis y shock séptico: sospecha de infección, disfunción orgánica, ABCDE, oxígeno, fluidoterapia, antibiótico precoz si protocolo y traslado con preaviso.",
  "relations": {
    "patologias": [
      "Sepsis",
      "Shock séptico",
      "Neumonía",
      "ITU/Pielonefritis",
      "Sepsis abdominal",
      "Meningitis",
      "Celulitis necrotizante",
      "Colangitis",
      "Neutropenia febril"
    ],
    "farmacos": [
      "Oxígeno",
      "Cristaloides balanceados o SF según protocolo",
      "Antibióticos según foco/protocolo",
      "Noradrenalina si shock refractario por equipo entrenado",
      "Antitérmicos",
      "Glucosa si hipoglucemia"
    ],
    "escalas": [
      "ABCDE",
      "qSOFA",
      "SOFA hospitalaria",
      "Glasgow",
      "Lactato si disponible",
      "NEWS2 si disponible"
    ],
    "tecnicas": [
      "Canalización venosa",
      "Fluidoterapia",
      "Hemocultivos hospitalarios",
      "Monitorización",
      "Preaviso código sepsis",
      "Control de temperatura"
    ],
    "alertas": [
      "sospecha infección + hipotensión",
      "alteración mental",
      "FR ≥22",
      "TAS ≤100",
      "piel moteada",
      "oliguria",
      "lactato elevado",
      "neutropenia febril",
      "no retrasar traslado"
    ]
  },
  "sec": [
    {
      "h": "Concepto",
      "b": "<p>La sepsis es una respuesta desregulada a la infección con disfunción orgánica potencialmente mortal. En extrahospitalaria debe sospecharse ante infección probable y signos de gravedad, incluso sin fiebre.</p>"
    },
    {
      "h": "Cuándo sospechar",
      "b": "<ul><li>Fiebre o hipotermia, escalofríos o infección conocida.</li><li>Confusión, somnolencia o deterioro brusco.</li><li>Taquipnea, SatO₂ baja o dificultad respiratoria.</li><li>Hipotensión, piel moteada, relleno capilar lento, taquicardia.</li><li>Oliguria, debilidad extrema, dolor intenso o mal estado general.</li><li>Pacientes de riesgo: ancianos, inmunodeprimidos, quimioterapia, corticoides, cirrosis, diabetes, embarazo, dispositivos/catéteres.</li></ul>"
    },
    {
      "h": "qSOFA orientativo",
      "b": "<ul><li>FR ≥22 rpm.</li><li>TAS ≤100 mmHg.</li><li>Alteración del estado mental.</li></ul><p>qSOFA no descarta sepsis si es negativo; sirve para alertar riesgo. La clínica manda.</p>"
    },
    {
      "h": "Valoración ABCDE",
      "b": "<ol><li><b>A/B:</b> oxígeno si hipoxemia o dificultad respiratoria.</li><li><b>C:</b> TA, FC, perfusión, relleno capilar, piel, diuresis si conocida.</li><li><b>D:</b> Glasgow/AVDI, glucemia, pupilas si coma.</li><li><b>E:</b> temperatura, foco infeccioso, piel, catéteres, heridas, abdomen, respiratorio y urinario.</li></ol>"
    },
    {
      "h": "Actuación inicial",
      "b": "<ol><li>Reconocer sepsis/shock séptico y activar preaviso si protocolo.</li><li>Oxígeno si precisa.</li><li>Canalizar vía venosa y monitorizar.</li><li>Fluidoterapia si hipotensión o hipoperfusión, reevaluando respuesta y sobrecarga.</li><li>Antibiótico precoz si el protocolo prehospitalario lo contempla y no retrasa traslado.</li><li>Control de glucemia y temperatura.</li><li>Traslado a centro útil con información del foco probable, constantes, fluidos y evolución.</li></ol>"
    },
    {
      "h": "Shock séptico",
      "b": "<ul><li>Sospechar si hipotensión persistente, mala perfusión, piel moteada, confusión, oliguria o lactato elevado si disponible.</li><li>Fluidoterapia inicial con reevaluación frecuente.</li><li>Si shock refractario: vasopresor por equipo entrenado según protocolo.</li><li>No retrasar traslado esperando normalizar constantes.</li></ul>"
    },
    {
      "h": "Focos prioritarios",
      "b": "<ul><li>Respiratorio: neumonía.</li><li>Urinario: pielonefritis/urosepsis.</li><li>Abdominal: peritonitis, colangitis, perforación.</li><li>Cutáneo: celulitis, fascitis necrotizante.</li><li>SNC: meningitis/encefalitis.</li><li>Catéter/dispositivo: bacteriemia asociada.</li></ul>"
    },
    {
      "h": "Fluidoterapia inicial: dos marcos vigentes",
      "b": "<p>Existen actualmente dos aproximaciones a la fluidoterapia inicial en sepsis, y conviene conocer ambas:</p><ul><li><b>NICE NG253 (2025)</b> recomienda volúmenes menores al inicio en pacientes en riesgo, con reevaluación clínica tras cada infusión en lugar de bolos protocolizados. Prioriza la titulación individualizada e implicación más temprana del equipo de cuidados intensivos que en ediciones previas.</li><li><b>Surviving Sepsis Campaign 2026</b> mantiene al menos <b>30 mL/kg de cristaloide</b> en las primeras 3 horas ante hipoperfusión inducida por sepsis, con preferencia por cristaloides balanceados frente al suero salino 0,9 %, y recomendación en contra de almidones y gelatinas.</li></ul><p>No son recomendaciones equivalentes. Aplique el protocolo vigente en su centro y, ante la duda, consulte con el equipo de cuidados intensivos.</p><p><b>Valoración reforzada (NG253).</b> Extremar la valoración en personas con barrera idiomática o dificultades de comunicación —neurodivergencia, deterioro cognitivo, discapacidad intelectual, daño cerebral—, donde los signos de alarma pueden pasar desapercibidos.</p>"
    },
    {
      "h": "Cuidados de enfermería",
      "b": "<ul><li>Tomar constantes seriadas y tendencia.</li><li>Observar piel: moteado, frialdad, relleno capilar, púrpura.</li><li>Registrar hora de sospecha, inicio de fluidos, antibiótico si se administra y respuesta.</li><li>Control de glucemia y temperatura.</li><li>Preparar bombas, fluidos, oxígeno, monitor y traslado prioritario.</li><li>Transferir con SBAR: foco, qSOFA/alteraciones, alergias, antibiótico/fluidos, lactato si disponible.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Esperar fiebre para sospechar sepsis.</li><li>Infravalorar confusión en anciano.</li><li>Dar fluidos sin reevaluar sobrecarga en insuficiencia cardiaca/renal.</li><li>Retrasar antibiótico/traslado por pruebas no disponibles.</li><li>No activar código sepsis si existe.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "misc-mini-vademecum-urgencias-ingesa",
  "cat": "farmaco",
  "especialidad": "Farmacología / Urgencias extrahospitalarias",
  "title": "Mini vademécum de fármacos frecuentes",
  "source": "Adaptado del bloque Miscelánea del manual INGESA 2013; validar siempre con ficha técnica, protocolo local y calculadora de dosis.",
  "tags": "mini vademecum farmacos urgencias analgesia sedacion cardiovascular respiratorio antidotos antiemeticos pediatria embarazo alto riesgo dosis diluciones",
  "summary": "Índice práctico de fármacos frecuentes para iNurse: grupos, usos, alertas de seguridad, doble chequeo y relación con protocolos.",
  "relations": {
    "patologias": [
      "Dolor",
      "Anafilaxia",
      "SCA",
      "Arritmias",
      "Crisis asmática",
      "EPOC",
      "Convulsiones",
      "Hipoglucemia",
      "Intoxicación",
      "Sepsis",
      "Eclampsia"
    ],
    "farmacos": [
      "Adrenalina",
      "Atropina",
      "Amiodarona",
      "AAS",
      "Nitroglicerina",
      "Furosemida",
      "Salbutamol",
      "Ipratropio",
      "Hidrocortisona",
      "Metilprednisolona",
      "Morfina",
      "Fentanilo",
      "Midazolam",
      "Diazepam",
      "Glucosa",
      "Glucagón",
      "Naloxona",
      "Flumazenil",
      "Sulfato de magnesio",
      "Paracetamol",
      "Metamizol",
      "Ondansetrón",
      "Metoclopramida"
    ],
    "escalas": [
      "Peso",
      "Edad",
      "Función renal/hepática",
      "Alergias",
      "ECG",
      "TA/FC/FR/SatO₂",
      "Doble chequeo"
    ],
    "tecnicas": [
      "Preparación de diluciones",
      "Perfusión con bomba",
      "Vía IV/IO/IM/SC/IN/nebulizada",
      "Registro de administración",
      "Reevaluación postfármaco"
    ],
    "alertas": [
      "fármacos de alto riesgo",
      "calcular por peso en pediatría",
      "embarazo/lactancia",
      "alergias",
      "intervalo QT",
      "hipotensión",
      "depresión respiratoria",
      "no abreviar unidades",
      "doble chequeo"
    ]
  },
  "sec": [
    {
      "h": "Uso de esta ficha",
      "b": "<p>El mini vademécum no sustituye una guía farmacológica. Su función en iNurse es ayudar a encontrar rápidamente fármacos frecuentes, relacionarlos con protocolos y recordar alertas de seguridad.</p>"
    },
    {
      "h": "Reglas de seguridad",
      "b": "<ul><li>Comprobar paciente, fármaco, dosis, vía, hora, alergias y caducidad.</li><li>En pediatría: calcular por peso y confirmar concentración.</li><li>No abreviar “unidades” como “U”.</li><li>Doble chequeo en alto riesgo: adrenalina, insulina, opioides, sedantes, magnesio, vasopresores, antiarrítmicos.</li><li>Registrar hora, dosis, vía, lote si procede, respuesta y efectos adversos.</li></ul>"
    },
    {
      "h": "Respiratorio",
      "b": "<ul><li><b>Salbutamol:</b> broncoespasmo, asma/EPOC. Vigilar taquicardia, temblor e hipopotasemia con dosis repetidas.</li><li><b>Ipratropio:</b> asociado en crisis moderada-grave.</li><li><b>Corticoides:</b> asma/EPOC, anafilaxia como coadyuvante, edema laríngeo según protocolo.</li><li><b>Oxígeno:</b> fármaco; titular objetivo y vigilar EPOC hipercápnico.</li></ul>"
    },
    {
      "h": "Cardiovascular/RCP",
      "b": "<ul><li><b>AAS:</b> SCA si no contraindicado.</li><li><b>Nitroglicerina:</b> dolor isquémico/EAP hipertensivo si TA adecuada; evitar hipotensión, infarto VD sospechado o uso reciente de PDE5.</li><li><b>Adrenalina:</b> PCR y anafilaxia; vía/dosis cambian según indicación.</li><li><b>Atropina:</b> bradicardia sintomática según algoritmo.</li><li><b>Amiodarona:</b> arritmias ventriculares/desfibrilables según protocolo; vigilar TA y ritmo.</li></ul>"
    },
    {
      "h": "Dolor y sedación",
      "b": "<ul><li><b>Paracetamol/metamizol:</b> analgesia y fiebre según perfil.</li><li><b>Morfina/fentanilo:</b> dolor intenso, SCA/EAP en contextos seleccionados; vigilar FR, TA, náuseas y sedación.</li><li><b>Midazolam/diazepam:</b> convulsiones, sedación/cardioversión/agitación según protocolo; vigilar depresión respiratoria.</li><li>Siempre reevaluar dolor, sedación y constantes tras administrar.</li></ul>"
    },
    {
      "h": "Neurológico/toxicología",
      "b": "<ul><li><b>Glucosa:</b> hipoglucemia; confirmar glucemia y reevaluar.</li><li><b>Glucagón:</b> alternativa si no hay vía IV y sospecha hipoglucemia.</li><li><b>Naloxona:</b> opioides con depresión respiratoria; titular a ventilación eficaz.</li><li><b>Flumazenil:</b> uso restringido por riesgo de convulsiones en intoxicación mixta/dependencia.</li><li><b>Sulfato de magnesio:</b> eclampsia, torsade, crisis asmática grave seleccionada; vigilar toxicidad.</li></ul>"
    },
    {
      "h": "Digestivo/antieméticos",
      "b": "<ul><li><b>Metoclopramida:</b> náuseas/vómitos; vigilar efectos extrapiramidales y contraindicaciones.</li><li><b>Ondansetrón:</b> antiemético; vigilar QT y combinaciones de riesgo.</li><li><b>IBP:</b> hemorragia digestiva alta/sospecha ulcerosa según protocolo.</li><li><b>Laxantes:</b> prevención/tratamiento de estreñimiento por opioides, salvo obstrucción.</li></ul>"
    },
    {
      "h": "Obstetricia/pediatría",
      "b": "<ul><li>En embarazo no retrasar tratamiento vital: madre estable = feto protegido.</li><li>Evitar fármacos de riesgo si hay alternativas; consultar guía actual.</li><li>En pediatría, la concentración importa tanto como la dosis: revisar presentación.</li><li>Registrar peso real/estimado y quién verifica el cálculo.</li></ul>"
    },
    {
      "h": "Estructura recomendada en iNurse",
      "b": "<ul><li>Ficha por fármaco: indicaciones, contraindicaciones, dosis adulta/pediátrica, preparación, efectos adversos y protocolos relacionados.</li><li>Calculadora pediátrica vinculada.</li><li>Buscador por nombre comercial/principio activo.</li><li>Alertas de embarazo, QT, renal/hepático, anticoagulación y alto riesgo.</li></ul>"
    },
    {
      "h": "Errores a evitar",
      "b": "<ul><li>Copiar dosis antiguas sin validar.</li><li>No ajustar por peso pediátrico.</li><li>No vigilar tras sedantes/opioides.</li><li>Confundir adrenalina IM de anafilaxia con adrenalina IV de PCR.</li><li>No registrar respuesta clínica.</li></ul>"
    }
  ],
  "block": 14
},
{
  "id": "rehab-cardiaca-esc-2026",
  "cat": "cardio",
  "title": "Rehabilitación cardíaca (ESC 2026)",
  "source": "ESC 2026 · Primera guía específica de rehabilitación cardíaca",
  "tags": "rehabilitacion cardiaca ejercicio secundaria educacion adherencia insuficiencia cardiaca sca revascularizacion coronaria tratamiento medico ottimo prevencion",
  "summary": "Primera guía ESC dedicada a rehabilitación cardíaca. Impacto directo en la fase de agudos es limitado, pero conviene documentar derivación temprana y educación del alta.",
  "sec": [
    {
      "h": "Qué cambia con esta guía",
      "b": "<p>Primera guía específica de rehabilitación cardíaca de la ESC. Sistematiza indicaciones (post-SCA, revascularización coronaria, insuficiencia cardíaca crónica, trasplante cardíaco), duración, componentes (ejercicio, educación, apoyo psicológico y sociolaboral) y criterios de derivación. La derivación desde la hospitalización pasa a considerarse parte del alta segura, no un extra opcional.</p>"
    },
    {
      "h": "Papel de enfermería en agudos",
      "b": "<ul><li>Iniciar movilización precoz según protocolo local en cuanto la estabilidad clínica lo permita.</li><li>Educación breve al alta: qué es la rehabilitación cardíaca, por qué reduce reingresos y mortalidad, cómo se accede en el área.</li><li>Cribado de barreras: transporte, situación laboral, apoyo familiar, comorbilidad musculoesquelética.</li><li>Solicitar la derivación al programa antes del alta, no dejarla al seguimiento en consultas externas.</li><li>Referencia cruzada con la ficha de insuficiencia cardíaca (`ic`) y con las fichas de SCA.</li></ul>"
    },
    {
      "h": "Componentes del programa",
      "b": "<ul><li><b>Ejercicio supervisado</b> progresivo, adaptado a la capacidad funcional.</li><li><b>Educación</b>: adherencia, control de factores de riesgo, dieta, tabaco, alcohol, actividad sexual.</li><li><b>Apoyo psicológico</b>: cribado y manejo de ansiedad, depresión y estrés postraumático (frecuentes tras un evento agudo).</li><li><b>Reincorporación sociolaboral</b>: certificados, adaptación del puesto, actividad de ocio.</li><li>Seguimiento estructurado con reevaluación de riesgo y ajuste de tratamiento farmacológico óptimo.</li></ul>"
    },
    {
      "h": "Nota de contraste",
      "b": "<p>Esta ficha se ha redactado a partir de la información pública sobre la nueva guía ESC 2026 de rehabilitación cardíaca. Antes de basar en ella recomendaciones firmes, contrastar con el documento oficial completo en escardio.org — algunos detalles operativos y umbrales concretos pueden requerir precisión adicional.</p>"
    }
  ]
}
];
window.DOCS = DOCS;
window.INURSE_PROTOCOLOS_COMPLETOS = true;

// Auto-asignar niveles de evidencia a todos los protocolos
(function() {
  if (Array.isArray(DOCS)) {
    DOCS.forEach(doc => {
      if (!doc.evidence_level) {
        const ev = getEvidenceFromSource(doc.source);
        doc.evidence_level = ev.level;
        doc.last_updated = doc.last_updated || ev.updated;
        doc.reference_url = doc.reference_url || ev.url;
      }
      if (Array.isArray(doc.sec)) {
        doc.sec.forEach(section => {
          if (!section.evidence) {
            section.evidence = doc.evidence_level;
            section.citation = section.citation || doc.source;
          }
        });
      }
    });
  }
})();
