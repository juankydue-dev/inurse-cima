
(function(){
'use strict';
const tabs=[['assistant','Asistente','✨'],['shift','Mi turno','🕒'],['cases','Casos','🗂️'],['calc','Calculadoras','🧮'],['integrate','Interpretación','🔬'],['media','Multimedia','🎬'],['diary','Diario','📔']];
const $=s=>document.querySelector(s); const esc=s=>String(s||'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const ALG={
'Sepsis':{src:'Surviving Sepsis Campaign',steps:['Confirmar sospecha de infección y valorar disfunción orgánica.','ABCDE, monitorización, accesos, glucemia, temperatura y diuresis.','Obtener lactato y cultivos sin retrasar el tratamiento cuando proceda.','Administrar antimicrobianos según gravedad, foco y protocolo local.','Valorar fluidoterapia con reevaluación dinámica y evitar sobrecarga.','Si persiste hipotensión, activar manejo de shock y soporte vasopresor según protocolo.','Buscar y controlar el foco; reevaluar respuesta, perfusión y lactato.']},
'PCR':{src:'ERC Guidelines 2025',steps:['Confirmar inconsciencia y respiración ausente o anormal; activar equipo de emergencias.','Iniciar compresiones de alta calidad y ventilación; conectar desfibrilador.','Analizar ritmo: desfibrilable o no desfibrilable.','Aplicar el algoritmo ERC correspondiente, minimizando interrupciones.','Asegurar acceso IV/IO, vía aérea y capnografía según recursos.','Buscar causas reversibles durante toda la reanimación.','Tras RCE: oxigenación, ventilación, hemodinámica, temperatura y causa.']},
'Ictus':{src:'ESO / Código Ictus',steps:['Determinar hora de inicio o última vez visto bien.','Aplicar escala de ictus, ABCDE y glucemia capilar.','Activar Código Ictus y traslado prioritario a centro adecuado.','TC cerebral urgente ± angiografía según circuito.','Valorar reperfusión por equipo especializado y contraindicaciones.','Controlar temperatura, glucemia, oxigenación y presión arterial según estrategia.','Cribado de disfagia, prevención de complicaciones y vigilancia neurológica.']},
'IAM':{src:'ESC Acute Coronary Syndromes 2023',steps:['Valorar ABCDE, dolor, constantes y signos de inestabilidad.','Realizar ECG de 12 derivaciones precoz y repetir si persiste sospecha.','Monitorización, acceso venoso y troponina de alta sensibilidad.','Clasificar SCA con o sin elevación persistente del ST.','Activar estrategia de reperfusión urgente cuando corresponda.','Tratamiento antitrombótico y sintomático según valoración médica y protocolo.','Vigilar arritmias, shock, insuficiencia cardiaca y complicaciones mecánicas.']},
'Anafilaxia':{src:'ERC / WAO',steps:['Reconocer afectación súbita de vía aérea, respiración o circulación con posible exposición.','Retirar desencadenante, pedir ayuda y colocar según estado hemodinámico.','Administrar adrenalina intramuscular según protocolo y edad; repetir si precisa.','Oxígeno, monitorización y acceso IV; fluidos si hipotensión.','Broncodilatador y tratamientos complementarios sin retrasar adrenalina.','Preparar manejo avanzado de vía aérea si progresión.','Observación, prevención de recurrencia y plan de alta seguro.']},
'Trauma':{src:'ABCDE trauma / ATLS principles',steps:['Seguridad, mecanismo lesional y control de hemorragia catastrófica.','A: vía aérea con protección cervical.','B: ventilación y tratamiento inmediato de amenazas torácicas.','C: perfusión, hemorragia, accesos y protocolo de transfusión si procede.','D: Glasgow, pupilas, glucemia y déficit focal.','E: exposición completa, prevención de hipotermia y reevaluación.','Pruebas, traslado y control definitivo de lesiones tiempo-dependientes.']},
'Status epiléptico':{src:'Guías neurológicas vigentes',steps:['Cronometrar crisis y asegurar seguridad, vía aérea y oxigenación.','Glucemia capilar inmediata y corrección de causas reversibles.','Administrar benzodiacepina de primera línea según vía disponible y protocolo.','Si persiste, administrar antiepiléptico de segunda línea según protocolo.','Buscar etiología: analítica, tóxicos, infección, imagen y niveles farmacológicos.','Si refractario, activar UCI, EEG y manejo anestésico.','Vigilar recurrencia, aspiración, hipertermia, rabdomiólisis y lesiones.']},
'Hemorragia masiva':{src:'Protocolos de transfusión y control de daños',steps:['Activar protocolo de hemorragia masiva y avisar a banco de sangre.','Control mecánico o quirúrgico inmediato del sangrado.','Accesos de gran calibre, calentamiento activo y monitorización.','Transfusión balanceada guiada por protocolo, clínica y pruebas viscoelásticas si disponibles.','Corregir hipocalcemia, hipotermia, acidosis y coagulopatía.','Considerar antifibrinolítico dentro de la ventana indicada según causa.','Reevaluar sangrado, perfusión, coagulación y destino definitivo.']},
'Soporte vital avanzado y arritmias peri-parada':{src:'ERC 2025',steps:['Confirmar parada, iniciar RCP de calidad y conectar monitor-desfibrilador.','Clasificar el ritmo en desfibrilable (FV/TVSP) o no desfibrilable (asistolia/AESP).','En ritmo desfibrilable: desfibrilar y reanudar compresiones de inmediato; adrenalina tras la 3ª descarga y amiodarona según protocolo.','En ritmo no desfibrilable: adrenalina precoz y RCP continua, reevaluando ritmo cada 2 minutos.','Buscar y tratar causas reversibles (4 H y 4 T).','En peri-parada inestable: bradicardia con atropina o marcapasos; taquiarritmia con cardioversión sincronizada según protocolo.','Tras recuperar circulación: cuidados post-parada, oxigenación, hemodinámica y control de temperatura.']},
'Fibrilación auricular':{src:'ESC 2024',steps:['Valorar estabilidad hemodinámica (hipotensión, angina, insuficiencia cardiaca, síncope).','Si hay inestabilidad grave, preparar cardioversión eléctrica sincronizada urgente.','Monitorización, ECG de 12 derivaciones, acceso venoso y analítica con iones y función tiroidea.','En paciente estable, control de frecuencia con betabloqueante o calcioantagonista según valoración médica.','Valorar estrategia de control del ritmo y momento de la cardioversión según duración y anticoagulación.','Estimar riesgo tromboembólico (CHA2DS2-VASc) y hemorrágico (HAS-BLED) para anticoagulación.','Buscar y tratar desencadenantes (fiebre, sepsis, anemia, hipoxia, alteraciones iónicas).']},
'Insuficiencia cardiaca aguda y edema agudo de pulmón':{src:'ESC',steps:['Reconocer disnea aguda, ortopnea, crepitantes y signos de congestión o bajo gasto.','Posición semisentada, oxígeno para objetivo de saturación y monitorización continua.','Valorar ventilación no invasiva precoz en edema agudo de pulmón con dificultad respiratoria.','Diuréticos de asa IV y vasodilatadores según presión arterial y prescripción.','ECG, radiografía, ecoscopia y biomarcadores para identificar causa (isquemia, arritmia, valvular).','Si hipoperfusión o shock, valorar soporte inotrópico o vasopresor y aviso a UCI.','Vigilar diuresis, congestión, iones y función renal; ajustar tratamiento y precarga.']},
'Hemorragia intracerebral':{src:'ESO / AHA-ASA',steps:['Reconocer déficit neurológico brusco con cefalea, vómitos o disminución del nivel de conciencia.','ABCDE, proteger vía aérea si Glasgow bajo y evitar hipoxia e hipercapnia.','TC craneal urgente para confirmar hemorragia y activar circuito neurológico.','Control precoz e intensivo de la presión arterial según objetivos de guía.','Revertir anticoagulación de forma urgente según el fármaco y el protocolo local.','Neutralidad de temperatura, control de glucemia y prevención de crisis; valorar Neurocirugía.','Vigilancia neurológica estrecha, cabecero elevado y medidas frente a hipertensión intracraneal.']},
'Hipoglucemia':{src:'ADA Standards of Care 2026',steps:['Confirmar con glucemia capilar ante clínica adrenérgica o neuroglucopénica.','Si el paciente está consciente y traga con seguridad, administrar 15-20 g de hidratos de carbono de absorción rápida.','Reevaluar la glucemia a los 15 minutos y repetir la toma si persiste baja.','Si hay disminución del nivel de conciencia o no puede tragar, glucosa IV o glucagón según disponibilidad.','Tras normalizar, ofrecer hidratos de acción prolongada para evitar recaída.','Buscar la causa (exceso de insulina o sulfonilureas, ayuno, alcohol, insuficiencia renal).','Educar y ajustar el tratamiento hipoglucemiante; vigilar recurrencia, sobre todo con sulfonilureas.']},
'Cetoacidosis diabética':{src:'ADA 2026',steps:['Sospechar ante hiperglucemia, cetonemia o cetonuria y acidosis metabólica con anion gap elevado.','ABCDE, monitorización, accesos y analítica con gasometría, iones, glucosa y cetonas.','Reposición de volumen con cristaloides según estado hemodinámico y déficit.','Insulina IV en perfusión según protocolo, sin iniciar hasta comprobar el potasio.','Reponer potasio de forma precoz y guiada por niveles antes y durante la insulina.','Vigilar glucemia, iones y pH horarios; añadir suero glucosado cuando la glucemia descienda.','Buscar y tratar el desencadenante (infección, omisión de insulina, debut) y prevenir el edema cerebral en niños.']},
'Estado hiperglucémico hiperosmolar':{src:'ADA 2026',steps:['Sospechar ante hiperglucemia muy elevada, hiperosmolaridad y deterioro del nivel de conciencia sin cetoacidosis marcada.','ABCDE, monitorización y analítica con osmolaridad, iones, glucosa y función renal.','Reposición de volumen amplia y gradual con cristaloides, evitando descensos bruscos de osmolaridad.','Reponer potasio guiado por niveles antes de la insulina.','Insulina IV a dosis prudente tras iniciar la fluidoterapia, con descenso lento de la glucemia.','Profilaxis de trombosis salvo contraindicación por el alto riesgo trombótico.','Buscar el desencadenante (infección, fármacos, mala hidratación) y vigilar iones, diuresis y estado neurológico.']},
'Crisis asmática':{src:'GINA 2025',steps:['Valorar gravedad por habla, frecuencia respiratoria, saturación, uso de musculatura accesoria y nivel de conciencia.','Oxígeno para objetivo de saturación y monitorización continua.','Broncodilatador beta-2 de acción corta inhalado repetido, asociado a anticolinérgico en crisis graves.','Corticoide sistémico precoz.','Reevaluar la respuesta de forma seriada; en crisis grave valorar sulfato de magnesio IV.','Identificar signos de riesgo vital (silencio auscultatorio, bradicardia, agotamiento) y avisar a UCI.','Planificar el alta con corticoide, técnica inhalatoria, plan de acción y revisión.']},
'Exacerbación de EPOC':{src:'GOLD 2025',steps:['Reconocer aumento de disnea, tos o expectoración purulenta respecto a la situación basal.','Oxígeno controlado con objetivo de saturación prudente, vigilando la hipercapnia.','Broncodilatadores de acción corta inhalados y corticoide sistémico en pauta corta.','Antibiótico si hay criterios de infección bacteriana (aumento y purulencia del esputo).','Valorar ventilación no invasiva precoz si hay acidosis respiratoria hipercápnica.','Gasometría, ECG y radiografía para descartar complicaciones o diagnósticos alternativos.','Vigilar respuesta y planificar tratamiento, rehabilitación y prevención de recaídas.']},
'Neumonía y criterios de gravedad':{src:'ERS/ESICM',steps:['Sospechar ante fiebre, tos, disnea y crepitantes con infiltrado en la radiografía.','Valorar la gravedad con escala pronóstica y signos de sepsis o insuficiencia respiratoria.','Oxígeno, monitorización, accesos y analítica con lactato en caso de sepsis.','Antibioterapia empírica precoz según el ámbito, la gravedad y los factores de riesgo.','Hemocultivos y microbiología antes del antibiótico sin retrasar su administración.','Identificar criterios de ingreso en UCI (insuficiencia respiratoria grave o shock).','Reevaluar la respuesta, desescalar según cultivos y vigilar complicaciones.']},
'Angioedema con afectación de vía aérea':{src:'ERC / EAACI',steps:['Reconocer edema de labios, lengua, úvula o laringe con posible estridor o disfonía.','Priorizar la vía aérea: valoración precoz y aviso a la persona más experta en manejo de vía aérea difícil.','Si hay componente alérgico o anafilaxia, tratar como anafilaxia con adrenalina intramuscular.','En angioedema mediado por bradicinina (IECA o hereditario), la adrenalina y los antihistamínicos son poco eficaces; usar el tratamiento específico según protocolo.','Oxígeno, monitorización y acceso venoso; preparar material de vía aérea avanzada.','Retirar el desencadenante y suspender el fármaco implicado.','Observación prolongada por riesgo de progresión y planificar seguimiento y prevención.']},
'Urticaria / reacción alérgica aguda':{src:'EAACI',steps:['Confirmar habones o prurito y descartar signos de anafilaxia (vía aérea, respiración o circulación).','Si aparece cualquier signo sistémico grave, tratar como anafilaxia con adrenalina intramuscular.','En reacción cutánea aislada, administrar antihistamínico de segunda generación.','Valorar corticoide en casos extensos o persistentes según prescripción.','Retirar y registrar el desencadenante sospechoso.','Observación adecuada por riesgo de progresión.','Educar sobre evitación, signos de alarma y derivación a alergología si procede.']},
'Sepsis pediátrica':{src:'Surviving Sepsis Pediátrica 2026',steps:['Reconocer infección con signos de mala perfusión, taquicardia, alteración mental o hipotensión (signo tardío).','Oxígeno, monitorización y accesos vascular o intraóseo precoces.','Antibiótico de amplio espectro en la primera hora tras obtener cultivos sin retrasarlo.','Bolos de cristaloides reevaluando tras cada uno para evitar sobrecarga.','Si el shock es refractario a fluidos, iniciar vasoactivos (adrenalina o noradrenalina según tipo).','Corregir hipoglucemia y calcio; medir lactato.','Control del foco y traslado a un nivel de cuidados adecuado con vigilancia estrecha.']},
'Bronquiolitis':{src:'Guía de bronquiolitis 2025',steps:['Reconocer al lactante con catarro, dificultad respiratoria y sibilancias o crepitantes.','Valorar la gravedad por trabajo respiratorio, saturación, apneas y capacidad de alimentación.','Manejo de soporte: aspiración de secreciones, posición e hidratación adecuada.','Oxígeno si hay hipoxemia mantenida según objetivo de saturación.','Soporte respiratorio escalonado (alto flujo o VNI) en formas graves.','Evitar de forma sistemática broncodilatadores, corticoides y antibióticos salvo indicación concreta.','Identificar signos de alarma y criterios de ingreso; educar a la familia sobre la evolución.']},
'Crisis asmática pediátrica':{src:'GINA 2025',steps:['Valorar la gravedad por habla, saturación, trabajo respiratorio y nivel de conciencia.','Oxígeno para objetivo de saturación y monitorización.','Broncodilatador beta-2 inhalado repetido con cámara, añadiendo anticolinérgico en crisis graves.','Corticoide sistémico precoz.','Reevaluar de forma seriada; en crisis grave valorar sulfato de magnesio IV.','Reconocer signos de riesgo vital y avisar a UCI pediátrica.','Planificar el alta con tratamiento, técnica inhalatoria, plan escrito y revisión.']},
'Hemorragia posparto':{src:'OMS',steps:['Reconocer el sangrado excesivo tras el parto y pedir ayuda activando el protocolo.','Masaje uterino, vaciar la vejiga y administrar uterotónicos según pauta.','Accesos de gran calibre, cristaloides, analítica y pruebas cruzadas.','Ácido tranexámico precoz dentro de la ventana recomendada.','Buscar la causa con la regla de las cuatro T (tono, trauma, tejido, trombina).','Si persiste, escalar a medidas mecánicas o quirúrgicas y transfusión balanceada.','Vigilar constantes, sangrado, diuresis y coagulación hasta la estabilización.']},
'Preeclampsia / eclampsia':{src:'RCOG / OMS',steps:['Reconocer hipertensión con proteinuria u otros signos de afectación orgánica en la gestante.','Monitorización materna y fetal, accesos y analítica con función renal, hepática y plaquetas.','Control de la presión arterial con antihipertensivo según protocolo ante cifras graves.','Sulfato de magnesio para prevenir o tratar las convulsiones de la eclampsia.','En eclampsia, proteger a la paciente durante la crisis, asegurar vía aérea y oxigenar.','Valorar el momento y la vía de finalización de la gestación con el equipo obstétrico.','Vigilar signos de alarma, balance hídrico y toxicidad por magnesio.']},
'Sepsis o colapso materno':{src:'RCOG',steps:['Reconocer signos de sepsis o deterioro brusco en la gestante o puérpera, con umbral de sospecha bajo.','ABCDE con desplazamiento uterino hacia la izquierda si la gestación está avanzada.','Oxígeno, accesos, cristaloides y antibiótico de amplio espectro precoz tras cultivos.','Medir lactato y buscar el foco (endometritis, herida, urinario, mama, respiratorio).','Si hay parada, RCP con desplazamiento uterino y cesárea perimortem a los pocos minutos si no hay respuesta.','Aviso precoz a obstetricia, anestesia y cuidados críticos.','Vigilancia estrecha materna y fetal y control del foco.']},
'Embarazo ectópico':{src:'RCOG',steps:['Sospechar ante dolor abdominal y sangrado con prueba de embarazo positiva.','Valorar estabilidad hemodinámica y signos de rotura o irritación peritoneal.','Si hay inestabilidad, accesos, cristaloides, pruebas cruzadas y cirugía urgente.','En paciente estable, ecografía transvaginal y beta-hCG seriada para localizar la gestación.','Elegir manejo expectante, médico o quirúrgico según criterios y valoración.','Administrar profilaxis anti-D si la paciente es Rh negativa según protocolo.','Vigilar dolor, sangrado y constantes; informar de signos de alarma y seguimiento.']},
'Enfermedad inflamatoria pélvica':{src:'CDC',steps:['Sospechar ante dolor pélvico bajo con dolor a la movilización cervical o anexial.','Descartar embarazo y valorar signos de gravedad o absceso.','Tomar muestras microbiológicas sin retrasar el tratamiento.','Iniciar antibioterapia empírica de amplio espectro precoz según pauta.','Valorar ingreso si hay gestación, mala tolerancia, absceso o fallo del tratamiento oral.','Analgesia, retirada de DIU solo si no hay mejoría y valoración de la pareja.','Reevaluar la respuesta y educar sobre prevención de infecciones de transmisión sexual.']},
'Sangrado o dolor en embarazo inicial':{src:'ACOG',steps:['Valorar la cuantía del sangrado, el dolor y la estabilidad hemodinámica.','Si hay inestabilidad, accesos, cristaloides y descartar embarazo ectópico o aborto en curso.','Ecografía y beta-hCG para valorar la viabilidad y la localización de la gestación.','Clasificar el cuadro (amenaza de aborto, aborto en curso, gestación no viable).','Administrar profilaxis anti-D si la paciente es Rh negativa según protocolo.','Ofrecer manejo expectante, médico o quirúrgico según el caso y la preferencia.','Analgesia, apoyo emocional, signos de alarma y seguimiento programado.']},
'Hemorragia digestiva alta':{src:'ESGE',steps:['Reconocer hematemesis, melenas o repercusión hemodinámica.','ABCDE, accesos de gran calibre, cristaloides y pruebas cruzadas.','Analítica con hemograma, coagulación y grupo; transfusión con estrategia restrictiva salvo sangrado masivo.','Estratificar el riesgo con una escala validada.','Fármacos según sospecha (inhibidor de la bomba de protones en origen péptico) y corrección de la coagulación.','Endoscopia digestiva alta precoz para diagnóstico y tratamiento.','Vigilar constantes, resangrado y hemoglobina; planificar el tratamiento posterior.']},
'Hemorragia varicosa en cirrosis':{src:'EASL / ESGE',steps:['Reconocer hemorragia digestiva alta en paciente con hepatopatía o hipertensión portal.','ABCDE, proteger la vía aérea si hay hematemesis masiva o bajo nivel de conciencia.','Reposición prudente con estrategia transfusional restrictiva para no aumentar la presión portal.','Fármaco vasoactivo esplácnico precoz y antibiótico profiláctico.','Endoscopia urgente para ligadura o tratamiento de las varices.','Si el sangrado es incontrolable, valorar taponamiento con balón o prótesis y TIPS.','Prevenir la encefalopatía y vigilar resangrado, función hepática e infecciones.']},
'Colangitis / obstrucción biliar':{src:'ESGE',steps:['Sospechar ante fiebre, ictericia y dolor en hipocondrio derecho (tríada de Charcot).','Valorar signos de gravedad o shock que amplían la tríada a la péntada de Reynolds.','Analítica con perfil hepático, hemograma y coagulación, más hemocultivos.','Antibioterapia empírica precoz y reposición hidroelectrolítica.','Ecografía o colangio-RM para confirmar la obstrucción biliar.','Drenaje biliar urgente, habitualmente endoscópico, sobre todo en formas graves.','Vigilar la respuesta, la función orgánica y planificar el tratamiento de la causa.']},
'TVP / TEP':{src:'ASH',steps:['Valorar la probabilidad clínica con una escala validada (Wells).','En TEP con inestabilidad hemodinámica, activar el manejo del TEP de alto riesgo y valorar reperfusión.','Solicitar dímero D si la probabilidad es baja o intermedia y prueba de imagen si es alta.','Confirmar con ecografía en la TVP o angio-TC en el TEP según disponibilidad.','Iniciar anticoagulación según el riesgo hemorrágico y la función renal, incluso antes de confirmar si la sospecha es alta.','Valorar el ámbito de tratamiento (domiciliario u hospitalario) según la gravedad.','Educar sobre la duración, los controles y los signos de alarma de sangrado o recurrencia.']},
'Trombocitopenia inducida por heparina':{src:'ASH',steps:['Sospechar ante descenso de plaquetas o trombosis entre los días 5 y 10 de heparina.','Estimar la probabilidad con una escala clínica (puntuación 4T).','Suspender toda forma de heparina si la sospecha es intermedia o alta.','Iniciar un anticoagulante alternativo no heparínico según protocolo.','Solicitar las pruebas de anticuerpos para confirmar el diagnóstico.','Evitar transfundir plaquetas de forma sistemática y no iniciar antagonistas de la vitamina K hasta recuperar las plaquetas.','Vigilar trombosis, plaquetas y sangrado; registrar la alergia y evitar heparina en el futuro.']},
'Hemorragia en paciente anticoagulado':{src:'ASH',steps:['Valorar la gravedad del sangrado y la repercusión hemodinámica.','ABCDE, control local o mecánico del sangrado y accesos con analítica y coagulación.','Identificar el anticoagulante, la dosis y la hora de la última toma.','Revertir de forma específica según el fármaco (antagonista o agente de reversión) en sangrado grave.','Reposición y transfusión balanceada guiada por la clínica y las pruebas.','Buscar y tratar la fuente del sangrado.','Reevaluar el balance riesgo-beneficio antes de reintroducir la anticoagulación.']},
'Isquemia aguda de extremidad':{src:'ESVS',steps:['Reconocer la extremidad con las seis P (dolor, palidez, ausencia de pulso, parestesias, parálisis y frialdad).','Valorar la viabilidad y la urgencia con la clasificación de Rutherford.','Anticoagulación precoz con heparina salvo contraindicación.','Analgesia, protección de la extremidad y aviso urgente a cirugía vascular.','Prueba de imagen vascular sin retrasar la revascularización en la isquemia que amenaza la extremidad.','Revascularización urgente (endovascular o quirúrgica) según viabilidad y causa.','Vigilar el síndrome de reperfusión, la función renal y el síndrome compartimental.']},
'Enfermedad arterial periférica con extremidad amenazada':{src:'ACC/AHA 2024 / ESVS',steps:['Reconocer dolor de reposo, úlceras o gangrena como isquemia crónica que amenaza la extremidad.','Valorar la perfusión con pulsos, índice tobillo-brazo y presiones distales.','Analgesia, cuidado de las heridas y control de la infección si la hay.','Optimizar el tratamiento médico (antiagregación, estatina y control de factores de riesgo).','Prueba de imagen vascular para planificar la revascularización.','Derivación preferente a cirugía vascular para salvar la extremidad.','Educar sobre el cuidado de los pies, el abandono del tabaco y el seguimiento.']},
'Lesión renal aguda':{src:'KDIGO',steps:['Reconocer el descenso de la diuresis o el ascenso de la creatinina y estadificar según KDIGO.','Valorar el estado de volumen y la perfusión renal.','Identificar y tratar la causa (prerrenal, renal o posrenal) y descartar obstrucción con ecografía.','Optimizar la volemia y la presión de perfusión evitando la sobrecarga.','Retirar o ajustar los fármacos nefrotóxicos y adecuar dosis a la función renal.','Monitorizar iones, equilibrio ácido-base y diuresis; tratar la hiperpotasemia.','Identificar los criterios de diálisis urgente y avisar a nefrología cuando proceda.']},
'Hiperpotasemia':{src:'KDIGO / guías de urgencias',steps:['Confirmar el potasio elevado y descartar seudohiperpotasemia; realizar ECG urgente.','Si hay cambios en el ECG, administrar calcio IV para estabilizar la membrana miocárdica.','Desplazar el potasio al interior celular con insulina y glucosa, más beta-2 inhalado.','Valorar bicarbonato si hay acidosis metabólica asociada.','Favorecer la eliminación con diuréticos o resinas o quelantes según el caso.','Suspender los aportes de potasio y los fármacos que lo elevan.','Si es grave o refractaria, valorar diálisis urgente y monitorizar el potasio y el ECG.']},
'Cólico renal con uropatía obstructiva infectada':{src:'EAU 2025',steps:['Sospechar ante dolor lumbar cólico con fiebre o signos de sepsis (urgencia urológica).','Analgesia con antiinflamatorio salvo contraindicación y control de las constantes.','Analítica, sedimento y hemocultivos; prueba de imagen para confirmar la obstrucción.','Iniciar antibioterapia empírica precoz si hay datos de infección.','Descompresión urgente de la vía urinaria (catéter ureteral o nefrostomía) en el riñón obstruido e infectado.','Reposición hidroelectrolítica y manejo de la sepsis si está presente.','Planificar el tratamiento definitivo de la litiasis tras resolver la fase aguda.']},
'Tormenta tiroidea':{src:'ATA',steps:['Sospechar ante hipertiroidismo con fiebre alta, taquiarritmia, agitación o insuficiencia cardiaca.','ABCDE, monitorización, enfriamiento y reposición hidroelectrolítica.','Betabloqueante para el control de los síntomas adrenérgicos según tolerancia.','Antitiroideo para bloquear la síntesis y, tras él, yodo para frenar la liberación.','Corticoide para reducir la conversión periférica y la insuficiencia suprarrenal relativa.','Buscar y tratar el desencadenante (infección, cirugía, suspensión del tratamiento).','Vigilancia estrecha en cuidados críticos por la elevada mortalidad.']},
'Coma mixedematoso':{src:'ATA',steps:['Sospechar ante hipotiroidismo grave con hipotermia, bradicardia, hipoventilación y bajo nivel de conciencia.','ABCDE, soporte ventilatorio si hay hipoventilación y recalentamiento pasivo.','Hormona tiroidea IV según protocolo tras extraer muestras basales.','Corticoide hasta descartar insuficiencia suprarrenal asociada.','Corregir la hiponatremia, la hipoglucemia y la hipotermia con cautela.','Buscar y tratar el desencadenante (infección, frío, fármacos sedantes).','Manejo en cuidados críticos con monitorización cardiaca y neurológica.']},
'Nódulo tiroideo':{src:'ATA',steps:['Confirmar el nódulo y valorar síntomas compresivos o datos de sospecha de malignidad.','Solicitar TSH y ecografía tiroidea con estratificación de riesgo.','Si la TSH está baja, valorar gammagrafía para descartar un nódulo hiperfuncionante.','Indicar la punción con aguja fina según el tamaño y el patrón ecográfico de riesgo.','Clasificar la citología con el sistema de Bethesda para orientar la conducta.','Decidir seguimiento, cirugía u otras opciones según el resultado.','Programar la vigilancia ecográfica y funcional a largo plazo.']},
'Oclusión arterial retiniana':{src:'AAO',steps:['Reconocer la pérdida de visión brusca e indolora como urgencia equivalente a un ictus.','Actuar dentro de una ventana muy estrecha y activar el circuito de ictus.','Derivación inmediata a un centro con capacidad de ictus para valoración neurológica.','Descartar arteritis de células gigantes si hay clínica sugestiva y solicitar reactantes.','Realizar un estudio vascular y de factores de riesgo cardioembólico.','Iniciar prevención secundaria según la causa identificada.','Seguimiento oftalmológico y neurológico coordinado.']},
'Glaucoma agudo de ángulo cerrado':{src:'AAO',steps:['Reconocer el ojo rojo doloroso con visión borrosa, halos, midriasis media y náuseas.','Medir la presión intraocular y derivar de forma urgente a oftalmología.','Iniciar tratamiento hipotensor ocular tópico y sistémico según prescripción.','Analgesia y antieméticos para el control sintomático.','Posición en decúbito supino para favorecer el desplazamiento del cristalino.','Tratamiento definitivo con iridotomía una vez controlada la fase aguda.','Valorar y proteger el ojo contralateral por el riesgo de afectación.']},
'Pérdida visual aguda':{src:'AAO',steps:['Determinar el tiempo de instauración, si es dolorosa o indolora y si es mono o binocular.','Descartar causas tiempo-dependientes (oclusión arterial retiniana, arteritis, ictus, desprendimiento).','Medir la agudeza visual, valorar pupilas y el segmento anterior de forma básica.','Si hay sospecha de arteritis de células gigantes, solicitar reactantes y no demorar el corticoide.','Derivación urgente a oftalmología u oftalmourgencias según la causa probable.','Coordinar con neurología si el patrón sugiere un origen central.','Registrar la evolución y asegurar el seguimiento especializado.']},
'Epistaxis':{src:'ENT UK',steps:['Valorar la cuantía del sangrado y la repercusión hemodinámica.','Sentar al paciente inclinado hacia delante y aplicar compresión digital firme de las alas nasales varios minutos.','Retirar coágulos y aplicar vasoconstrictor tópico si está disponible.','Si persiste, cauterización del punto sangrante o taponamiento nasal anterior.','En sangrado posterior o incontrolable, taponamiento posterior y aviso a otorrinolaringología.','Revisar y corregir la anticoagulación o la coagulopatía si contribuyen.','Educar sobre cuidados locales, evitar el sonado enérgico y el seguimiento.']},
'Hipoacusia neurosensorial súbita':{src:'AAO-HNS',steps:['Reconocer la pérdida auditiva brusca, habitualmente unilateral, como urgencia.','Diferenciar con la exploración de una hipoacusia de transmisión (cerumen, otitis) con acumetría.','Descartar signos neurológicos asociados que sugieran un origen central.','Derivación preferente a otorrinolaringología para audiometría de confirmación.','Iniciar corticoterapia precoz según protocolo por la ventana de tratamiento estrecha.','Solicitar resonancia para descartar patología retrococlear en el seguimiento.','Informar del pronóstico, el seguimiento auditivo y las opciones de rehabilitación.']},
'Infección cervical profunda':{src:'ENT UK',steps:['Sospechar ante dolor cervical, fiebre, trismus, disfagia o tumefacción con afectación del estado general.','Priorizar la vía aérea por el riesgo de compromiso y avisar al equipo experto.','ABCDE, accesos, analítica, hemocultivos y antibioterapia empírica de amplio espectro precoz.','TC cervical con contraste para valorar la extensión y los abscesos.','Aviso urgente a otorrinolaringología o cirugía para el drenaje quirúrgico si procede.','Vigilar signos de mediastinitis, sepsis y progresión hacia la vía aérea.','Monitorización estrecha y soporte en el nivel de cuidados adecuado.']},
'Riesgo suicida / autolesión':{src:'NICE',steps:['Garantizar un entorno seguro y retirar los medios lesivos al alcance.','Atender primero las lesiones físicas o la intoxicación que pongan en riesgo la vida.','Realizar una valoración del riesgo con una entrevista empática y sin juicios.','Explorar la ideación, el plan, los intentos previos y los factores de protección y de riesgo.','No dejar sola a la persona con riesgo alto y asegurar la supervisión.','Derivar a salud mental para valoración especializada y plan de seguridad.','Documentar, coordinar el seguimiento e implicar a la red de apoyo según consentimiento.']},
'Agitación: desescalada y tranquilización rápida':{src:'NICE',steps:['Garantizar la seguridad del paciente, del personal y del entorno.','Emplear técnicas verbales de desescalada como primera medida.','Descartar causas orgánicas de la agitación (hipoxia, hipoglucemia, dolor, tóxicos, delirium).','Ofrecer medicación oral voluntaria antes de plantear la vía parenteral.','Si es imprescindible, tranquilización rápida con la pauta y las precauciones del protocolo.','Monitorizar constantes, nivel de conciencia y vía aérea tras la sedación.','Revisar la contención con la mínima restricción, registrar y planificar el seguimiento.']},
'Síndrome serotoninérgico':{src:'Guías de toxicología',steps:['Sospechar ante la tríada de alteración mental, hiperactividad autonómica y alteraciones neuromusculares (clonus, hiperreflexia).','Relacionarlo con fármacos serotoninérgicos recientes o su combinación.','Retirar de inmediato todos los agentes serotoninérgicos implicados.','Medidas de soporte, oxígeno, sueroterapia y enfriamiento si hay hipertermia.','Control de la agitación y la rigidez con benzodiacepinas.','En casos graves, valorar un antagonista serotoninérgico y cuidados críticos.','Vigilar la temperatura, la rabdomiólisis, la función renal y las complicaciones.']},
'Artritis reumatoide: escalada terapéutica':{src:'EULAR 2025',steps:['Confirmar el diagnóstico y valorar la actividad de la enfermedad con un índice compuesto.','Iniciar un fármaco modificador de la enfermedad convencional de forma precoz, con metotrexato como ancla.','Usar corticoide como puente a dosis baja y el menor tiempo posible.','Aplicar la estrategia de tratamiento por objetivos hacia la remisión o la baja actividad.','Si no se alcanza el objetivo, escalar a terapia biológica o dirigida según el perfil.','Cribar infecciones y comorbilidades antes de los inmunomoduladores y vacunar.','Monitorizar la respuesta, la toxicidad y ajustar según la evolución.']},
'Arteritis de células gigantes':{src:'BSR / EULAR',steps:['Sospechar en mayores de 50 años con cefalea de novo, claudicación mandibular o síntomas visuales.','Solicitar reactantes de fase aguda de forma urgente.','No demorar el corticoide a dosis altas ante la sospecha por el riesgo de ceguera.','Añadir antiagregación según la valoración y el riesgo.','Confirmar con ecografía de arterias temporales o biopsia sin retrasar el tratamiento.','Valorar tratamiento ahorrador de corticoide en el seguimiento.','Vigilar las complicaciones visuales y vasculares y los efectos del corticoide.']},
'Monoartritis aguda / descarte de artritis séptica':{src:'EULAR',steps:['Priorizar el descarte de artritis séptica en toda monoartritis aguda caliente.','Realizar artrocentesis antes de iniciar antibióticos siempre que sea posible.','Analizar el líquido con recuento, Gram, cultivo y cristales.','Si hay sospecha de infección, iniciar antibioterapia empírica precoz tras el cultivo.','Analgesia, inmovilización relativa y valoración de drenaje articular.','Diferenciar de la artritis microcristalina (gota o pseudogota) por los cristales.','Reevaluar según los resultados y coordinar con reumatología o traumatología.']},
'Lesión pigmentada sospechosa':{src:'AAD / EADV',steps:['Aplicar la regla ABCDE (asimetría, bordes, color, diámetro y evolución) a la lesión.','Preguntar por cambios recientes en tamaño, color, sangrado o prurito.','Explorar el resto de la piel y los ganglios regionales.','Emplear la dermatoscopia si se dispone de formación para su interpretación.','Evitar tratamientos destructivos que impidan el diagnóstico histológico.','Derivar de forma preferente a dermatología ante cualquier sospecha de melanoma.','Educar sobre la fotoprotección y la autoexploración periódica.']},
'Dermatitis atópica por gravedad':{src:'EADV',steps:['Valorar la extensión, la intensidad del prurito y el impacto en la calidad de vida.','Establecer la base del tratamiento con emolientes y evitación de desencadenantes.','En brotes leves o moderados, corticoide tópico o inhibidor de la calcineurina según la zona.','Tratar la sobreinfección si hay signos de impétigo o eccema herpético.','En enfermedad moderada o grave que no responde, valorar fototerapia o tratamiento sistémico.','Educar sobre el cuidado de la piel, la técnica de aplicación y el uso proactivo.','Derivar a dermatología para escalar el tratamiento y el seguimiento.']},
'Psoriasis: criterios de escalada':{src:'AAD / EADV',steps:['Valorar la extensión, las zonas especiales y el impacto en la calidad de vida.','Cribar la afectación articular por la posible artritis psoriásica.','En enfermedad leve, tratamiento tópico con corticoide y análogos de la vitamina D.','En enfermedad moderada o grave o con mala respuesta, valorar fototerapia o tratamiento sistémico.','Escalar a terapia biológica según el fenotipo y las comorbilidades.','Cribar infecciones y comorbilidades cardiometabólicas antes de los sistémicos.','Educar y coordinar el seguimiento con dermatología.']},
'Valoración del dolor agudo':{src:'EUSEM 2025',steps:['Valorar el dolor de forma estructurada con una escala adecuada a la edad y la situación.','Explorar las características, la intensidad, la repercusión funcional y las señales de alarma.','Identificar el tipo de dolor (nociceptivo, neuropático o mixto) para orientar el tratamiento.','Reevaluar el dolor de forma periódica y tras cada intervención analgésica.','Tratar de forma precoz sin enmascarar signos diagnósticos imprescindibles.','Considerar medidas no farmacológicas junto al tratamiento farmacológico.','Documentar la respuesta y adaptar el plan analgésico.']},
'Analgesia multimodal escalonada':{src:'EUSEM / NICE',steps:['Elegir el escalón analgésico según la intensidad y el tipo de dolor.','Combinar analgésicos de mecanismos distintos para mejorar el control y reducir dosis.','Usar paracetamol y antiinflamatorios como base salvo contraindicación.','Añadir opioides de forma prudente en el dolor moderado o intenso y a la mínima dosis eficaz.','Considerar coadyuvantes en el dolor neuropático según prescripción.','Reevaluar la eficacia y los efectos adversos de forma continua.','Planificar la desescalada y la transición al tratamiento domiciliario.']},
'Prevención del daño por opioides':{src:'CDC / NICE',steps:['Valorar el riesgo de daño antes de prescribir opioides y usar la mínima dosis y duración eficaces.','Informar del objetivo funcional, los riesgos y el plan de retirada.','Evitar la combinación con benzodiacepinas y otros depresores del sistema nervioso.','Monitorizar la sedación y la depresión respiratoria durante el tratamiento.','Tener disponible naloxona y reconocer los signos de sobredosis.','Reevaluar de forma periódica la eficacia, los efectos adversos y la necesidad de continuar.','Planificar una retirada gradual y derivar si aparece un trastorno por uso de opioides.']},
'Dolor dental agudo':{src:'ADA',steps:['Identificar el origen del dolor (caries, pulpitis, absceso o pericoronaritis).','Valorar signos de infección o tumefacción que indiquen derivación urgente.','Ofrecer analgesia con antiinflamatorios o paracetamol como primera opción.','Reservar los antibióticos para los casos con signos de infección sistémica o diseminación.','Dar medidas locales e higiene y evitar irritantes.','Derivar al odontólogo para el tratamiento definitivo de la causa.','Educar sobre los signos de alarma y el seguimiento.']},
'Infección odontógena con tumefacción':{src:'ADA',steps:['Reconocer la tumefacción facial o cervical con dolor, fiebre o afectación del estado general.','Valorar el trismus, la disfagia o el compromiso de la vía aérea como signos de gravedad.','ABCDE y priorizar la vía aérea si hay datos de infección cervical profunda.','Iniciar analgesia y antibioterapia empírica según la gravedad.','Prueba de imagen si se sospecha extensión profunda o absceso.','Derivar para el drenaje y el tratamiento dental definitivo del foco.','Vigilar la progresión y los signos de diseminación grave.']},
'Complicaciones tras extracción dental':{src:'ADA',steps:['Identificar el problema (sangrado persistente, alveolitis seca o infección).','En el sangrado, compresión con gasa mordida sobre el alveolo durante varios minutos.','Revisar y corregir la anticoagulación o la coagulopatía si contribuyen.','En la alveolitis, limpieza suave y analgesia con medidas locales.','Valorar antibiótico solo si hay signos de infección establecida.','Dar instrucciones de cuidado local y evitar enjuagues enérgicos o el tabaco.','Derivar al odontólogo si no cede o se complica.']},
'Intervención breve 5A':{src:'OMS 2024 / NICE 2025',steps:['Averiguar y registrar el consumo de tabaco en cada oportunidad de contacto.','Aconsejar de forma clara, personalizada y sin juicios el abandono del tabaco.','Apreciar la disposición al cambio y la motivación de la persona.','Ayudar a quien quiere dejarlo con un plan, apoyo conductual y opciones de tratamiento.','Acordar el seguimiento y fijar los siguientes contactos.','Ofrecer materiales y recursos de apoyo, incluidas las líneas de ayuda.','Reforzar los logros y readaptar el plan en cada revisión.']},
'Tratamiento para dejar de fumar':{src:'OMS 2024',steps:['Valorar el grado de dependencia y las preferencias de la persona.','Ofrecer apoyo conductual estructurado como base de la intervención.','Proponer tratamiento farmacológico de primera línea salvo contraindicación.','Explicar el uso correcto, la duración y los efectos esperados del tratamiento.','Fijar una fecha de abandono y anticipar las situaciones de riesgo.','Programar el seguimiento para reforzar y ajustar el tratamiento.','Registrar la evolución y tratar las recaídas sin culpabilizar.']},
'Prevención de recaídas del tabaquismo':{src:'NICE 2025',steps:['Identificar las situaciones, las emociones y los entornos que desencadenan el deseo de fumar.','Entrenar estrategias de afrontamiento y alternativas conductuales.','Mantener el apoyo y, si procede, prolongar el tratamiento farmacológico.','Reforzar los beneficios logrados y la motivación de la persona.','Diferenciar una caída puntual de una recaída y actuar de forma precoz.','Reajustar el plan tras una recaída sin culpabilizar y reintentar.','Asegurar un seguimiento a largo plazo y el acceso a los recursos de apoyo.']}
};
var releaseIcFocusTrap=null;
function open(){ $('#icOverlay').classList.add('on'); $('#icOverlay').setAttribute('aria-hidden','false'); if(releaseIcFocusTrap)releaseIcFocusTrap(); releaseIcFocusTrap=window.EnferixFocusTrap($('#icPanel')); }
function close(){ $('#icOverlay').classList.remove('on'); $('#icOverlay').setAttribute('aria-hidden','true'); if(releaseIcFocusTrap){releaseIcFocusTrap();releaseIcFocusTrap=null;} }
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#icOverlay').classList.contains('on'))close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#procOverlay').classList.contains('on'))closeProc()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#algOverlay').classList.contains('on'))closeAlg()});
function save(k,v){localStorage.setItem('inurse_ic_'+k,JSON.stringify(v))} function load(k,d){try{return JSON.parse(localStorage.getItem('inurse_ic_'+k))??d}catch(e){return d}}
function askJavny(text){try{if(typeof window.openJavnyWithContext==='function'){window.openJavnyWithContext(text);close();return}}catch(e){} try{if(typeof window.openIn72==='function'){window.openIn72(text);close();return}}catch(e){} const fab=document.querySelector('.fab,[data-javny],#javnyBtn,#v29Javny');if(fab)fab.click();setTimeout(()=>{const q=document.querySelector('.qinput,#javnyInput,textarea[placeholder*="Javny"],textarea[placeholder*="Pregunta"]');if(q){q.value=text;q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}},250);close()}
function card(title,body){return `<div class="icCard"><h3>${title}</h3>${body}</div>`}
function renderCalc(){return `<div class="icGrid">
${card('Perfusión mcg/kg/min','<input class="icInput" id="cDose" type="number" step="any" placeholder="Dosis mcg/kg/min"><input class="icInput" id="cWeight" type="number" step="any" placeholder="Peso kg"><input class="icInput" id="cMg" type="number" step="any" placeholder="Fármaco total mg"><input class="icInput" id="cVol" type="number" step="any" placeholder="Volumen ml"><button class="icBtn" data-calc="perf">Calcular</button><div class="icResult" id="outPerf">—</div>')}
${card('IMC y superficie corporal','<input class="icInput" id="cKg" type="number" step="any" placeholder="Peso kg"><input class="icInput" id="cCm" type="number" step="any" placeholder="Talla cm"><button class="icBtn" data-calc="body">Calcular</button><div class="icResult" id="outBody">—</div>')}
${card('Cockcroft–Gault','<input class="icInput" id="cAge" type="number" placeholder="Edad"><input class="icInput" id="cCrKg" type="number" step="any" placeholder="Peso kg"><input class="icInput" id="cCr" type="number" step="any" placeholder="Creatinina mg/dL"><select class="icSelect" id="cSex"><option value="m">Hombre</option><option value="f">Mujer</option></select><button class="icBtn" data-calc="crcl">Calcular</button><div class="icResult" id="outCrcl">—</div>')}
${card('PaFi y SaFi','<input class="icInput" id="cPa" type="number" step="any" placeholder="PaO₂ mmHg"><input class="icInput" id="cSa" type="number" step="any" placeholder="SpO₂ %"><input class="icInput" id="cFi" type="number" step="any" placeholder="FiO₂ % (ej. 40)"><button class="icBtn" data-calc="oxy">Calcular</button><div class="icResult" id="outOxy">—</div>')}
${card('Anión gap y sodio corregido','<input class="icInput" id="cNa" type="number" step="any" placeholder="Na mEq/L"><input class="icInput" id="cCl" type="number" step="any" placeholder="Cl mEq/L"><input class="icInput" id="cHco" type="number" step="any" placeholder="HCO₃ mEq/L"><input class="icInput" id="cGlu" type="number" step="any" placeholder="Glucosa mg/dL"><button class="icBtn" data-calc="met">Calcular</button><div class="icResult" id="outMet">—</div>')}
${card('Osmolaridad calculada','<input class="icInput" id="cONa" type="number" step="any" placeholder="Na mEq/L"><input class="icInput" id="cOGlu" type="number" step="any" placeholder="Glucosa mg/dL"><input class="icInput" id="cBun" type="number" step="any" placeholder="BUN mg/dL"><button class="icBtn" data-calc="osm">Calcular</button><div class="icResult" id="outOsm">—</div>')}
${card('Mantenimiento pediátrico 4-2-1','<input class="icInput" id="cPKg" type="number" step="any" placeholder="Peso kg"><button class="icBtn" data-calc="ped">Calcular</button><div class="icResult" id="outPed">—</div>')}
${card('Glasgow','<select class="icSelect" id="gEye"><option value="4">Ocular 4 espontánea</option><option value="3">Ocular 3 voz</option><option value="2">Ocular 2 dolor</option><option value="1">Ocular 1 ninguna</option></select><select class="icSelect" id="gVerb"><option value="5">Verbal 5 orientado</option><option value="4">Verbal 4 confuso</option><option value="3">Verbal 3 palabras</option><option value="2">Verbal 2 sonidos</option><option value="1">Verbal 1 ninguna</option></select><select class="icSelect" id="gMot"><option value="6">Motora 6 obedece</option><option value="5">Motora 5 localiza</option><option value="4">Motora 4 retira</option><option value="3">Motora 3 flexión anormal</option><option value="2">Motora 2 extensión</option><option value="1">Motora 1 ninguna</option></select><button class="icBtn" data-calc="gcs">Calcular</button><div class="icResult" id="outGcs">—</div>')}
</div><p class="icResult">Resultados orientativos. Verifica datos, unidades, indicación y protocolo local antes de tomar decisiones clínicas.</p>
<div style="margin-top:18px"><h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-dim,#94A3B8);margin:0 0 10px">🔍 Validador de diagnósticos enfermeros (NNN)</h3>
<div class="icCard"><h3>Validar diagnóstico NANDA-I / NIC / NOC</h3><p style="font-size:12.5px;color:var(--text-dim,#94A3B8);margin:0 0 10px;line-height:1.4">Escribe un diagnóstico enfermero y valida si tiene código verificado en NNNConsult. Solo devuelve códigos confirmados manualmente — nunca inventa.</p>
<div style="display:flex;gap:8px;align-items:center"><input class="icInput" id="icNnnInput" placeholder="Ej: riesgo de deterioro de la integridad cutánea" style="flex:1"><button class="icBtn" id="icNnnBtn">Validar</button></div>
<div id="icNnnResult" class="icResult" style="margin-top:10px">—</div></div>
<div class="icCard" style="margin-top:14px"><h3>Validar término en SNOMED CT (Edición Española)</h3><p style="font-size:12.5px;color:var(--text-dim,#94A3B8);margin:0 0 10px;line-height:1.4">Escribe una patología, procedimiento o hallazgo clínico y busca su código oficial SNOMED CT. Solo devuelve coincidencia exacta — nunca inventa un código.</p>
<div style="display:flex;gap:8px;align-items:center"><input class="icInput" id="icSnomedInput" placeholder="Ej: neumotórax" style="flex:1"><button class="icBtn" id="icSnomedBtn">Validar</button></div>
<div id="icSnomedResult" class="icResult" style="margin-top:10px">—</div></div></div>`}
const ALG_CAT={
'Sepsis':'Urgencias','PCR':'Urgencias','Trauma':'Urgencias','Hemorragia masiva':'Urgencias','Soporte vital avanzado y arritmias peri-parada':'Urgencias',
'IAM':'Cardiovascular','Fibrilación auricular':'Cardiovascular','Insuficiencia cardiaca aguda y edema agudo de pulmón':'Cardiovascular',
'Ictus':'Neurología','Status epiléptico':'Neurología','Hemorragia intracerebral':'Neurología',
'Hipoglucemia':'Endocrino y Diabetes','Cetoacidosis diabética':'Endocrino y Diabetes','Estado hiperglucémico hiperosmolar':'Endocrino y Diabetes',
'Crisis asmática':'Neumología','Exacerbación de EPOC':'Neumología','Neumonía y criterios de gravedad':'Neumología',
'Anafilaxia':'Alergología','Angioedema con afectación de vía aérea':'Alergología','Urticaria / reacción alérgica aguda':'Alergología',
'Sepsis pediátrica':'Pediatría','Bronquiolitis':'Pediatría','Crisis asmática pediátrica':'Pediatría',
'Hemorragia posparto':'Obstetricia','Preeclampsia / eclampsia':'Obstetricia','Sepsis o colapso materno':'Obstetricia',
'Embarazo ectópico':'Ginecología','Enfermedad inflamatoria pélvica':'Ginecología','Sangrado o dolor en embarazo inicial':'Ginecología',
'Hemorragia digestiva alta':'Gastroenterología','Hemorragia varicosa en cirrosis':'Gastroenterología','Colangitis / obstrucción biliar':'Gastroenterología',
'TVP / TEP':'Hematología','Trombocitopenia inducida por heparina':'Hematología','Hemorragia en paciente anticoagulado':'Hematología',
'Isquemia aguda de extremidad':'Vascular','Enfermedad arterial periférica con extremidad amenazada':'Vascular',
'Lesión renal aguda':'Nefro-Urología','Hiperpotasemia':'Nefro-Urología','Cólico renal con uropatía obstructiva infectada':'Nefro-Urología',
'Tormenta tiroidea':'Tiroides','Coma mixedematoso':'Tiroides','Nódulo tiroideo':'Tiroides',
'Oclusión arterial retiniana':'Oftalmología','Glaucoma agudo de ángulo cerrado':'Oftalmología','Pérdida visual aguda':'Oftalmología',
'Epistaxis':'Otorrinolaringología','Hipoacusia neurosensorial súbita':'Otorrinolaringología','Infección cervical profunda':'Otorrinolaringología',
'Riesgo suicida / autolesión':'Psiquiatría','Agitación: desescalada y tranquilización rápida':'Psiquiatría','Síndrome serotoninérgico':'Psiquiatría',
'Artritis reumatoide: escalada terapéutica':'Reumatología','Arteritis de células gigantes':'Reumatología','Monoartritis aguda / descarte de artritis séptica':'Reumatología',
'Lesión pigmentada sospechosa':'Dermatología','Dermatitis atópica por gravedad':'Dermatología','Psoriasis: criterios de escalada':'Dermatología',
'Valoración del dolor agudo':'Dolor','Analgesia multimodal escalonada':'Dolor','Prevención del daño por opioides':'Dolor',
'Dolor dental agudo':'Salud bucodental','Infección odontógena con tumefacción':'Salud bucodental','Complicaciones tras extracción dental':'Salud bucodental',
'Intervención breve 5A':'Deshabituación tabáquica','Tratamiento para dejar de fumar':'Deshabituación tabáquica','Prevención de recaídas del tabaquismo':'Deshabituación tabáquica'
};
const ALG_CAT_ORDER=['Urgencias','Cardiovascular','Neurología','Endocrino y Diabetes','Neumología','Alergología','Pediatría','Obstetricia','Ginecología','Gastroenterología','Hematología','Vascular','Nefro-Urología','Tiroides','Oftalmología','Otorrinolaringología','Psiquiatría','Reumatología','Dermatología','Dolor','Salud bucodental','Deshabituación tabáquica'];
const ALG_CAT_ICON={'Urgencias':'🚨','Cardiovascular':'❤️','Neurología':'🧠','Endocrino y Diabetes':'🩸','Neumología':'🫁','Alergología':'🤧','Pediatría':'👶','Obstetricia':'🤰','Ginecología':'🌸','Gastroenterología':'🩻','Hematología':'💉','Vascular':'🦵','Nefro-Urología':'🫘','Tiroides':'🦋','Oftalmología':'👁️','Otorrinolaringología':'👂','Psiquiatría':'🧩','Reumatología':'🦴','Dermatología':'🩹','Dolor':'💊','Salud bucodental':'🦷','Deshabituación tabáquica':'🚭'};
function getBibAlgs(){
  if(window._bibAlgsCache) return window._bibAlgsCache;
  var groups={};
  try{
    var jsonEl=document.getElementById('inurse-master-21');
    if(!jsonEl) return groups;
    var raw=JSON.parse(jsonEl.textContent);
    raw.forEach(function(b){
      (b.fichas||[]).forEach(function(x){
        if(!x||!x.algoritmo_documental) return;
        var cat=x.subcategoria||x.categoria||'Otros';
        if(!groups[cat]) groups[cat]=[];
        groups[cat].push({id:x.id,titulo:x.titulo,pasos:x.algoritmo_documental,cat:cat});
      });
    });
  }catch(e){}
  window._bibAlgsCache=groups;
  return groups;
}
function algNorm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim()}
var algCurrentCat=null;
var algCurrentBibCat=null;
var releaseAlgFocusTrap=null;
function openAlg(){
  algCurrentCat=null;algCurrentBibCat=null;
  $('#algOverlay').classList.add('on');
  $('#algOverlay').setAttribute('aria-hidden','false');
  renderAlgRoot();
  if(releaseAlgFocusTrap)releaseAlgFocusTrap();
  releaseAlgFocusTrap=window.EnferixFocusTrap($('#algPanel'));
}
function closeAlg(){
  $('#algOverlay').classList.remove('on');
  $('#algOverlay').setAttribute('aria-hidden','true');
  if(releaseAlgFocusTrap){releaseAlgFocusTrap();releaseAlgFocusTrap=null;}
}
function algCoreGroups(){
  const groups={};
  Object.keys(ALG).forEach(function(name){
    const cat=ALG_CAT[name]||'Otros';
    (groups[cat]=groups[cat]||[]).push(name);
  });
  const order=ALG_CAT_ORDER.slice();
  Object.keys(groups).forEach(function(c){if(order.indexOf(c)===-1)order.push(c)});
  return {groups:groups,order:order};
}
function renderAlgRoot(){
  const gc=algCoreGroups();
  var bibGroups=getBibAlgs();
  var bibCats=Object.keys(bibGroups).sort(function(a,b){return a.localeCompare(b,'es')});
  var totalBib=0; bibCats.forEach(function(c){totalBib+=bibGroups[c].length});
  let html='<div class="icSearchRow"><input class="icInput" id="algRootFilter" placeholder="🔎 Buscar especialidad o algoritmo…"><button type="button" class="icMicBtn qmic" id="algRootMic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button></div>';
  html+='<div class="proc-cat-grid" id="algCatRootGrid">';
  gc.order.forEach(function(cat){
    const names=gc.groups[cat]; if(!names||!names.length) return;
    const ico=ALG_CAT_ICON[cat]||'📋';
    const hay=esc(algNorm(cat+' '+names.join(' ')));
    html+='<button class="proc-cat-card" data-alg-cat="'+esc(cat)+'" data-alg-cat-hay="'+hay+'"><span class="proc-cat-ico">'+ico+'</span><b>'+esc(cat)+'</b><small>'+names.length+' algoritmo'+(names.length===1?'':'s')+'</small></button>';
  });
  if(totalBib){
    const hay=esc(algNorm('Biblioteca completa '+bibCats.join(' ')));
    html+='<button class="proc-cat-card" data-alg-bib-root="1" data-alg-cat-hay="'+hay+'"><span class="proc-cat-ico">📚</span><b>Biblioteca completa</b><small>'+totalBib+' fichas</small></button>';
  }
  html+='</div>';
  html+='<p class="icResult" id="algCatEmpty" style="display:none">No se ha encontrado ninguna especialidad.</p>';
  $('#algBody').innerHTML=html;
  $('#algRootFilter').oninput=filterAlgRoot;
  document.querySelectorAll('#algCatRootGrid [data-alg-cat]').forEach(function(x){x.onclick=function(){showAlgCategory(x.dataset.algCat)}});
  const bibBtn=document.querySelector('#algCatRootGrid [data-alg-bib-root]'); if(bibBtn)bibBtn.onclick=function(){renderAlgBibRoot()};
}
function filterAlgRoot(){
  const n=algNorm(($('#algRootFilter')||{}).value);
  let any=false;
  document.querySelectorAll('#algCatRootGrid .proc-cat-card').forEach(function(c){
    const hay=(c.dataset.algCatHay||'');
    const show=!n||hay.indexOf(n)!==-1;
    c.style.display=show?'':'none';
    if(show)any=true;
  });
  const empty=$('#algCatEmpty'); if(empty)empty.style.display=any?'none':'block';
}
function showAlgCategory(cat){
  algCurrentCat=cat;algCurrentBibCat=null;
  const gc=algCoreGroups();
  const names=gc.groups[cat]||[];
  const ico=ALG_CAT_ICON[cat]||'📋';
  let html='<button class="icBtn alt" id="backAlgCats">← Especialidades</button>';
  html+='<div class="icHead" style="padding:14px 0 10px;border:0"><span style="font-size:22px">'+ico+'</span><div><h2 style="font-size:17px">'+esc(cat)+'</h2><small style="color:var(--text-dim,#94a3b8)">'+names.length+' algoritmo'+(names.length===1?'':'s')+'</small></div></div>';
  html+='<div class="icSearchRow"><input class="icInput" id="algFilter" placeholder="🔎 Buscar algoritmo…"><button type="button" class="icMicBtn qmic" id="algMic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button></div>';
  html+='<div class="icGrid" id="algCatGrid">'+names.map(function(x){
    const hay=esc(algNorm(x));
    return '<button class="icCard" data-alg="'+esc(x)+'" data-alg-hay="'+hay+'" style="text-align:left;cursor:pointer;color:var(--text,#fff)"><h3>'+esc(x)+'</h3><p>'+esc(ALG[x].src)+'</p></button>';
  }).join('')+'</div>';
  $('#algBody').innerHTML=html;
  $('#backAlgCats').onclick=function(){algCurrentCat=null;renderAlgRoot()};
  $('#algFilter').oninput=filterAlgCategory;
  document.querySelectorAll('#algCatGrid [data-alg]').forEach(function(x){x.onclick=function(){showAlg(x.dataset.alg)}});
}
function filterAlgCategory(){
  const n=algNorm(($('#algFilter')||{}).value);
  document.querySelectorAll('#algCatGrid [data-alg]').forEach(function(c){
    c.style.display=(!n||(c.dataset.algHay||'').indexOf(n)!==-1)?'':'none';
  });
}
function renderAlgBibRoot(){
  algCurrentCat=null;algCurrentBibCat=null;
  var bibGroups=getBibAlgs();
  var bibCats=Object.keys(bibGroups).sort(function(a,b){return a.localeCompare(b,'es')});
  let html='<button class="icBtn alt" id="backAlgBibCats">← Especialidades</button>';
  html+='<div class="icHead" style="padding:14px 0 10px;border:0"><span style="font-size:22px">📚</span><div><h2 style="font-size:17px">Biblioteca completa</h2><small style="color:var(--text-dim,#94a3b8)">Algoritmos de la Biblioteca virtual, por bloque</small></div></div>';
  html+='<div class="icSearchRow"><input class="icInput" id="algBibRootFilter" placeholder="🔎 Buscar bloque o algoritmo…"><button type="button" class="icMicBtn qmic" id="algBibRootMic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button></div>';
  html+='<div class="proc-cat-grid" id="algBibCatRootGrid">'+bibCats.map(function(cat){
    var items=bibGroups[cat];
    const hay=esc(algNorm(cat+' '+items.map(function(x){return x.titulo}).join(' ')));
    return '<button class="proc-cat-card" data-alg-bib-cat="'+esc(cat)+'" data-alg-cat-hay="'+hay+'"><span class="proc-cat-ico">📋</span><b>'+esc(cat)+'</b><small>'+items.length+' ficha'+(items.length===1?'':'s')+'</small></button>';
  }).join('')+'</div>';
  html+='<p class="icResult" id="algBibCatEmpty" style="display:none">No se ha encontrado ningún bloque.</p>';
  $('#algBody').innerHTML=html;
  $('#backAlgBibCats').onclick=function(){renderAlgRoot()};
  $('#algBibRootFilter').oninput=filterAlgBibRoot;
  document.querySelectorAll('#algBibCatRootGrid [data-alg-bib-cat]').forEach(function(x){x.onclick=function(){showAlgBibCategory(x.dataset.algBibCat)}});
}
function filterAlgBibRoot(){
  const n=algNorm(($('#algBibRootFilter')||{}).value);
  let any=false;
  document.querySelectorAll('#algBibCatRootGrid .proc-cat-card').forEach(function(c){
    const hay=(c.dataset.algCatHay||'');
    const show=!n||hay.indexOf(n)!==-1;
    c.style.display=show?'':'none';
    if(show)any=true;
  });
  const empty=$('#algBibCatEmpty'); if(empty)empty.style.display=any?'none':'block';
}
function showAlgBibCategory(cat){
  algCurrentBibCat=cat;algCurrentCat=null;
  var bibGroups=getBibAlgs();
  var items=bibGroups[cat]||[];
  let html='<button class="icBtn alt" id="backAlgBibItems">← Biblioteca completa</button>';
  html+='<div class="icHead" style="padding:14px 0 10px;border:0"><span style="font-size:22px">📋</span><div><h2 style="font-size:17px">'+esc(cat)+'</h2><small style="color:var(--text-dim,#94a3b8)">'+items.length+' ficha'+(items.length===1?'':'s')+'</small></div></div>';
  html+='<div class="icSearchRow"><input class="icInput" id="algBibFilter" placeholder="🔎 Buscar algoritmo…"><button type="button" class="icMicBtn qmic" id="algBibMic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button></div>';
  html+='<div class="icGrid" id="algBibCatGrid">'+items.map(function(x){
    const hay=esc(algNorm(x.titulo));
    return '<button class="icCard" data-bib-alg="'+esc(x.id)+'" data-alg-hay="'+hay+'" style="text-align:left;cursor:pointer;color:var(--text,#fff)"><h3>'+esc(x.titulo)+'</h3><p>'+esc(cat)+'</p></button>';
  }).join('')+'</div>';
  $('#algBody').innerHTML=html;
  $('#backAlgBibItems').onclick=function(){algCurrentBibCat=null;renderAlgBibRoot()};
  $('#algBibFilter').oninput=filterAlgBibCategory;
  document.querySelectorAll('#algBibCatGrid [data-bib-alg]').forEach(function(x){x.onclick=function(){showBibAlg(x.dataset.bibAlg)}});
}
function filterAlgBibCategory(){
  const n=algNorm(($('#algBibFilter')||{}).value);
  document.querySelectorAll('#algBibCatGrid [data-bib-alg]').forEach(function(c){
    c.style.display=(!n||(c.dataset.algHay||'').indexOf(n)!==-1)?'':'none';
  });
}
function algExportText(title,src,cat,steps){
  var lines=[title];
  if(src) lines.push('Fuente: '+src);
  if(cat) lines.push('Categoría: '+cat);
  lines.push('');
  lines.push('Pasos:');
  steps.forEach(function(s,i){lines.push((i+1)+'. '+s)});
  lines.push('');
  lines.push('Adaptar siempre al protocolo local y a las competencias del centro. Contenido educativo de apoyo (Enferix).');
  return lines.join('\n');
}
function showAlg(name){
  const a=ALG[name];
  if(!a){renderAlgRoot();return}
  const icon=ALG_CAT_ICON[algCurrentCat]||'🔀';
  const fullText=algExportText(name,a.src,algCurrentCat,a.steps);
  let html='<button class="icBtn alt" id="backAlg">← '+esc(algCurrentCat||'Especialidades')+'</button>';
  html+='<div class="proc-hero"><span class="proc-hero-ico">'+icon+'</span><div><h3>'+esc(name)+'</h3><small>'+esc(a.src)+'</small></div></div>';
  html+=ficheActionsHtml('alg');
  html+='<div class="icCard"><h3>Pasos</h3><ol>'+a.steps.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol></div>';
  html+='<p class="icResult">Adaptar siempre al protocolo y competencias del centro.</p>';
  $('#algBody').innerHTML=html;
  $('#backAlg').onclick=function(){algCurrentCat?showAlgCategory(algCurrentCat):renderAlgRoot()};
  wireFicheActions('alg',name,fullText,closeAlg);
}
function showBibAlg(id){
  var bibGroups=getBibAlgs();var item=null;
  Object.values(bibGroups).forEach(function(arr){arr.forEach(function(x){if(x.id===id)item=x})});
  if(!item) return;
  var stepsHtml='';
  var stepTexts=[];
  if(Array.isArray(item.pasos)){
    stepsHtml=item.pasos.map(function(p,i){
      var num=p.paso||(i+1);
      var texto=p.accion||p.descripcion||'';
      stepTexts.push(texto+(p.objetivo?' → '+p.objetivo:''));
      return '<div class="icResult"><b>'+num+'.</b> '+esc(texto)+(p.objetivo?'<br><small style="color:#2DD4BF">→ '+esc(p.objetivo)+'</small>':'')+'</div>';
    }).join('');
  }else if(typeof item.pasos==='string'){
    stepsHtml='<div class="icResult">'+esc(item.pasos)+'</div>';
    stepTexts=[item.pasos];
  }
  const fullText=algExportText(item.titulo,'',item.cat,stepTexts);
  $('#algBody').innerHTML='<button class="icBtn alt" id="backAlg">← '+esc(item.cat||'Biblioteca completa')+'</button>'
    +'<div class="proc-hero"><span class="proc-hero-ico">📋</span><div><h3>'+esc(item.titulo)+'</h3><small>'+esc(item.cat)+'</small></div></div>'
    +ficheActionsHtml('alg')
    +'<div class="icCard"><h3>Pasos</h3><div id="algSteps">'+stepsHtml+'</div>'
    +'<button class="icBtn alt" id="algOpenLib">📚 Ver ficha completa</button>'
    +'</div>';
  $('#backAlg').onclick=function(){algCurrentBibCat?showAlgBibCategory(algCurrentBibCat):renderAlgBibRoot()};
  wireFicheActions('alg',item.titulo,fullText,closeAlg);
  $('#algOpenLib').onclick=function(){
    if(window.Enferix21&&window.Enferix21.openItem) window.Enferix21.openItem(item.id);
  };
}
function getProcData(){return (typeof PROCEDIMIENTOS_DATA!=='undefined'?PROCEDIMIENTOS_DATA:null)||{meta:[],items:[]}}
function procNorm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim()}
var procCurrentCat=null;
var releaseProcFocusTrap=null;
function openProc(){
  procCurrentCat=null;
  $('#procOverlay').classList.add('on');
  $('#procOverlay').setAttribute('aria-hidden','false');
  renderProcRoot();
  if(releaseProcFocusTrap)releaseProcFocusTrap();
  releaseProcFocusTrap=window.EnferixFocusTrap($('#procPanel'));
}
function closeProc(){
  $('#procOverlay').classList.remove('on');
  $('#procOverlay').setAttribute('aria-hidden','true');
  if(releaseProcFocusTrap){releaseProcFocusTrap();releaseProcFocusTrap=null;}
}
function renderProcRoot(){
  const data=getProcData();
  let html='<div class="icSearchRow"><input class="icInput" id="procRootFilter" placeholder="🔎 Buscar especialidad o procedimiento…"><button type="button" class="icMicBtn qmic" id="procRootMic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button></div>';
  html+='<div class="proc-cat-grid" id="procCatRootGrid">'+data.meta.map(function(cat){
    const titles=data.items.filter(function(p){return p.cat===cat.id}).map(function(p){return p.title}).join(' ');
    const hay=esc(procNorm(cat.label+' '+titles));
    return '<button class="proc-cat-card" data-proc-cat="'+esc(cat.id)+'" data-proc-cat-hay="'+hay+'"><span class="proc-cat-ico">'+(cat.icon||'📝')+'</span><b>'+esc(cat.label)+'</b><small>'+cat.count+' ficha'+(cat.count===1?'':'s')+'</small></button>';
  }).join('')+'</div>';
  html+='<p class="icResult" id="procCatEmpty" style="display:none">No se ha encontrado ninguna especialidad.</p>';
  $('#procBody').innerHTML=html;
  $('#procRootFilter').oninput=filterProcRoot;
  document.querySelectorAll('#procCatRootGrid [data-proc-cat]').forEach(function(x){x.onclick=function(){showProcCategory(x.dataset.procCat)}});
}
function filterProcRoot(){
  const n=procNorm(($('#procRootFilter')||{}).value);
  let any=false;
  document.querySelectorAll('#procCatRootGrid [data-proc-cat]').forEach(function(c){
    const hay=(c.dataset.procCatHay||'');
    const show=!n||hay.indexOf(n)!==-1;
    c.style.display=show?'':'none';
    if(show)any=true;
  });
  const empty=$('#procCatEmpty'); if(empty)empty.style.display=any?'none':'block';
}
function showProcCategory(catId){
  procCurrentCat=catId;
  const data=getProcData();
  const cat=data.meta.find(function(c){return c.id===catId});
  if(!cat){renderProcRoot();return}
  const items=data.items.filter(function(p){return p.cat===catId});
  let html='<button class="icBtn alt" id="backProcCats">← Especialidades</button>';
  html+='<div class="icHead" style="padding:14px 0 10px;border:0"><span style="font-size:22px">'+(cat.icon||'📝')+'</span><div><h2 style="font-size:17px">'+esc(cat.label)+'</h2><small style="color:var(--text-dim,#94a3b8)">'+items.length+' ficha'+(items.length===1?'':'s')+'</small></div></div>';
  html+='<div class="icSearchRow"><input class="icInput" id="procFilter" placeholder="🔎 Buscar procedimiento, material o complicación…"><button type="button" class="icMicBtn qmic" id="procMic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button></div>';
  html+='<div class="icGrid" id="procCatGrid">'+items.map(function(p){
    const hay=esc(procNorm(p.title+' '+p.subtype+' '+p.summary+' '+(p.material||[]).join(' ')+' '+(p.complicaciones||[]).join(' ')));
    return '<button class="icCard" data-proc="'+esc(p.code)+'" data-proc-hay="'+hay+'" style="text-align:left;cursor:pointer;color:var(--text,#fff)"><h3>'+esc(p.title)+'</h3><p><b>'+esc(p.subtype)+'</b></p><p>'+esc(p.summary)+'</p></button>';
  }).join('')+'</div>';
  $('#procBody').innerHTML=html;
  $('#backProcCats').onclick=function(){procCurrentCat=null;renderProcRoot()};
  $('#procFilter').oninput=filterProcCategory;
  document.querySelectorAll('#procCatGrid [data-proc]').forEach(function(x){x.onclick=function(){showProc(x.dataset.proc)}});
}
function filterProcCategory(){
  const n=procNorm(($('#procFilter')||{}).value);
  document.querySelectorAll('#procCatGrid [data-proc]').forEach(function(c){
    const hay=(c.dataset.procHay||'');
    c.style.display=(!n||hay.indexOf(n)!==-1)?'':'none';
  });
}
function procBuildSections(p){
  const secs=[{key:'resumen',label:'Resumen',body:p.summary}];
  if(p.definicion) secs.push({key:'definicion',label:'Definición',body:p.definicion});
  function addList(key,label,items,ordered){if(items&&items.length)secs.push({key:key,label:label,items:items,ordered:!!ordered})}
  addList('objetivos','Objetivos',p.objetivos);
  addList('indicaciones','Indicaciones',p.indicaciones);
  addList('contra','Contraindicaciones',p.contraindicaciones);
  addList('material','Material',p.material);
  addList('prep','Preparación',p.preparacion);
  addList('pasos','Paso a paso',p.pasos,true);
  addList('algoritmo','Algoritmo rápido',p.algoritmo,true);
  addList('monitorizacion','Monitorización',p.monitorizacion);
  addList('cuidados','Cuidados posteriores',p.cuidados);
  addList('complicaciones','Complicaciones',p.complicaciones);
  addList('alarma','Signos de alarma',p.alarma);
  addList('errores','Errores frecuentes',p.errores);
  addList('perlas','Perlas clínicas',p.perlas);
  addList('adaptacion','Adaptación por ámbito',p.adaptacion);
  addList('educacion','Educación al paciente',p.educacion);
  addList('registro','Registro',p.registro);
  if(p.checklist&&p.checklist.length) secs.push({key:'checklist',label:'Checklist',checklist:p.checklist});
  if(p.javnyguide) secs.push({key:'javnyguide',label:'Enfoque con Javny',body:p.javnyguide});
  if(p.bibliografia&&p.bibliografia.length) secs.push({key:'bibliografia',label:'Bibliografía',biblio:p.bibliografia});
  return secs;
}
function renderSecTabs(secs){
  return '<div class="proc-sec-tabs" id="procSecTabs">'+secs.map(function(s,i){return '<button class="proc-sec-tab'+(i===0?' on':'')+'" data-sec="'+s.key+'">'+esc(s.label)+'</button>';}).join('')+'</div>'
    +secs.map(function(s,i){
      var body='';
      if(s.body) body='<p>'+esc(s.body)+'</p>';
      if(s.items) body=(s.ordered?'<ol>':'<ul>')+s.items.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+(s.ordered?'</ol>':'</ul>');
      if(s.checklist) body='<ul class="checklist">'+s.checklist.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>';
      if(s.biblio) body='<ul class="biblio-list">'+s.biblio.map(function(b){return '<li>'+(b.url?'<a href="'+esc(b.url)+'" target="_blank" rel="noopener">'+esc(b.label)+'</a>':esc(b.label))+'</li>'}).join('')+'</ul>';
      return '<div class="icView'+(i===0?' on':'')+'" data-sec-pane="'+s.key+'">'+body+'</div>';
    }).join('');
}
function wireSecTabs(tabsId){
  document.querySelectorAll('#'+tabsId+' .proc-sec-tab').forEach(function(t){
    t.onclick=function(){
      document.querySelectorAll('#'+tabsId+' .proc-sec-tab').forEach(function(x){x.classList.remove('on')});
      t.classList.add('on');
      document.querySelectorAll('[data-sec-pane]').forEach(function(pane){pane.classList.toggle('on',pane.dataset.secPane===t.dataset.sec)});
    };
  });
}
function ficheActionsHtml(prefix){
  return '<div class="in58-actions">'
    +'<button class="in58-action" data-kind="read" id="'+prefix+'Read">🔊 Leer</button>'
    +'<button class="in58-action" data-kind="javny" id="'+prefix+'Javny">✨ Verificar con Javny</button>'
    +'<button class="in58-action" data-kind="video" id="'+prefix+'Video">🎬 Vídeo</button>'
    +'<button class="in58-action" data-kind="share" id="'+prefix+'Export">📤 Compartir</button>'
    +'</div>'
    +'<div class="in58-context-note">Javny recibirá el contenido de esta ficha. El botón Vídeo abre una búsqueda educativa en una pestaña nueva.</div>';
}
function wireFicheActions(prefix,title,fullText,onBeforeJavny){
  var readBtn=$('#'+prefix+'Read');
  if(readBtn) readBtn.onclick=function(){if(window.EnferixReadText)window.EnferixReadText(title,fullText,readBtn)};
  var javnyBtn=$('#'+prefix+'Javny');
  if(javnyBtn) javnyBtn.onclick=function(){if(onBeforeJavny)onBeforeJavny();if(window.EnferixOpenJavnyContext)window.EnferixOpenJavnyContext(title,fullText)};
  var videoBtn=$('#'+prefix+'Video');
  if(videoBtn) videoBtn.onclick=function(){if(window.EnferixOpenVideo)window.EnferixOpenVideo(title);else window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(title+' procedimiento sanitario formación'),'_blank','noopener')};
  var exportBtn=$('#'+prefix+'Export');
  if(exportBtn) exportBtn.onclick=function(){if(window.EnferixShareContent)window.EnferixShareContent(title,fullText);else exportShare(title,fullText)};
}
function showProc(code){
  const data=getProcData();
  // Los códigos (ej. "IN-004") se generaron por archivo de origen y no son únicos
  // globalmente entre especialidades; si hay una categoría activa, se prioriza esa.
  const p=data.items.find(function(x){return x.code===code&&(!procCurrentCat||x.cat===procCurrentCat)})
    ||data.items.find(function(x){return x.code===code});
  if(!p){renderProcRoot();return}
  const cat=data.meta.find(function(c){return c.id===p.cat});
  const icon=(cat&&cat.icon)||'📝';
  const fullText=procExportText(p);
  const secs=procBuildSections(p);
  let html=procCurrentCat?'<button class="icBtn alt" id="backProc">← '+esc((data.meta.find(function(c){return c.id===procCurrentCat})||{}).label||'Especialidades')+'</button>':'<button class="icBtn alt" id="backProc">← Especialidades</button>';
  html+='<div class="proc-hero"><span class="proc-hero-ico">'+icon+'</span><div><h3>'+esc(p.title)+'</h3><small>'+esc(p.subtype)+'</small></div></div>';
  html+=ficheActionsHtml('proc');
  html+=renderSecTabs(secs);
  if(p.evidencia&&p.evidencia.length) html+='<p class="icResult" style="margin-top:14px">'+p.evidencia.map(function(x){return esc(x)}).join('<br>')+'</p>';
  html+='<p class="icResult">Contenido educativo. Realizar solo por personal capacitado, con prescripción, supervisión y protocolo local cuando corresponda.</p>';
  $('#procBody').innerHTML=html;
  $('#backProc').onclick=function(){procCurrentCat?showProcCategory(procCurrentCat):renderProcRoot()};
  wireSecTabs('procSecTabs');
  wireFicheActions('proc',p.title,fullText,closeProc);
}
function exportShare(title,text){
  if(navigator.share){navigator.share({title:title,text:text}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(text).then(function(){toast('📤 Copiado al portapapeles')})}
}
function procExportText(p){
  var lines=[p.title,p.subtype,'',p.summary,''];
  function sec(label,items){if(items&&items.length){lines.push(label+':');items.forEach(function(x){lines.push('- '+x)});lines.push('')}}
  sec('Objetivos',p.objetivos);
  sec('Indicaciones',p.indicaciones);
  sec('Contraindicaciones y precauciones',p.contraindicaciones);
  sec('Material necesario',p.material);
  sec('Preparación',p.preparacion);
  if(p.pasos&&p.pasos.length){lines.push('Procedimiento paso a paso:');p.pasos.forEach(function(x,i){lines.push((i+1)+'. '+x)});lines.push('')}
  if(p.algoritmo&&p.algoritmo.length){lines.push('Algoritmo rápido de actuación:');p.algoritmo.forEach(function(x,i){lines.push((i+1)+'. '+x)});lines.push('')}
  sec('Cuidados posteriores',p.cuidados);
  sec('Complicaciones',p.complicaciones);
  sec('Signos de alarma',p.alarma);
  sec('Registro de enfermería',p.registro);
  if(p.checklist&&p.checklist.length){lines.push('Checklist de seguridad:');p.checklist.forEach(function(x){lines.push('☐ '+x)});lines.push('')}
  if(p.bibliografia&&p.bibliografia.length){lines.push('Bibliografía:');p.bibliografia.forEach(function(b){lines.push('- '+b.label+(b.url?' — '+b.url:''))});lines.push('')}
  lines.push('Contenido educativo de apoyo (Enferix). Verificar siempre con el protocolo local y el juicio profesional.');
  return lines.join('\n');
}
function renderTab(id){document.querySelectorAll('.icTab').forEach(b=>b.classList.toggle('on',b.dataset.id===id));const b=$('#icBody');
if(id==='assistant')b.innerHTML=`<div class="icGrid"><div class="icCard"><h3>Asistente clínico guiado</h3><input class="icInput" id="icaAge" placeholder="Edad y contexto"><textarea class="icArea" id="icaReason" placeholder="Motivo de consulta y evolución"></textarea><textarea class="icArea" id="icaData" placeholder="Constantes, exploración, analítica, ECG, RX..."></textarea><button class="icBtn" id="icaSend">Analizar con Javny</button></div><div class="icCard"><h3>Resultado esperado</h3><p>Datos observados, prioridades, diferenciales, alarmas, pruebas pendientes, actuación, cuidados y límites.</p></div></div>`;
if(id==='shift'){const d=load('shift',{notes:'',pending:''});b.innerHTML=`<div class="icCard"><h3>Mi turno</h3><textarea class="icArea" id="icsNotes" placeholder="Notas sin datos identificativos">${esc(d.notes)}</textarea><textarea class="icArea" id="icsPending" placeholder="Pendientes y aprendizajes">${esc(d.pending)}</textarea><button class="icBtn" id="icsSave">Guardar</button><button class="icBtn alt" id="icsSummary">Resumir con Javny</button></div>`}
if(id==='cases')b.innerHTML=`<div class="icCard"><h3>Caso clínico interactivo</h3><select class="icSelect" id="iccTopic"><option>Urgencias</option><option>UCI</option><option>Cardiología</option><option>Respiratorio</option><option>Neurología</option><option>Trauma</option></select><select class="icSelect" id="iccLevel"><option>Básico</option><option>Intermedio</option><option>Avanzado</option></select><button class="icBtn" id="iccStart">Crear caso</button></div>`;
if(id==='calc')b.innerHTML=renderCalc();
if(id==='integrate')b.innerHTML=`<div class="icCard"><h3>Interpretación conjunta</h3><textarea class="icArea" id="iciClinical" placeholder="Clínica y exploración"></textarea><textarea class="icArea" id="iciTests" placeholder="ECG, RX, gasometría, analítica y otros hallazgos"></textarea><button class="icBtn" id="iciSend">Integrar con Javny</button></div>`;
if(id==='media'){const items=load('media',[]);b.innerHTML=`<div class="icGrid"><div class="icCard"><h3>Añadir recurso</h3><input class="icInput" id="icmTitle" placeholder="Título"><input class="icInput" id="icmUrl" placeholder="https://..."><input class="icInput" id="icmTags" placeholder="Etiquetas"><button class="icBtn" id="icmAdd">Guardar</button></div><div class="icCard"><h3>Biblioteca</h3>${items.length?items.map((x,i)=>`<p><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a> <small>${esc(x.tags)}</small> <button class="icBtn alt" data-del-media="${i}">Eliminar</button></p>`).join(''):'<p>Sin recursos guardados.</p>'}</div></div>`}
if(id==='diary'){const items=load('diary',[]);b.innerHTML=`<div class="icGrid"><div class="icCard"><h3>Nueva entrada</h3><input class="icInput" id="icdTitle" placeholder="Título"><textarea class="icArea" id="icdText" placeholder="Caso o aprendizaje, sin datos identificativos"></textarea><button class="icBtn" id="icdAdd">Guardar</button></div><div class="icCard"><h3>Entradas</h3>${items.length?items.map((x,i)=>`<div class="icResult"><b>${esc(x.title)}</b><br>${esc(x.text)}<br><small>${esc(x.date)}</small><br><button class="icBtn alt" data-del-diary="${i}">Eliminar</button></div>`).join(''):'<p>Sin entradas.</p>'}</div></div>`}
bind(id)}
function n(id){return +($(id)?.value||0)}
function bind(id){
if(id==='assistant')$('#icaSend').onclick=()=>askJavny(`Analiza de forma completa y estructurada. Edad/contexto: ${$('#icaAge').value}\nMotivo: ${$('#icaReason').value}\nDatos: ${$('#icaData').value}`);
if(id==='shift'){$('#icsSave').onclick=()=>{save('shift',{notes:$('#icsNotes').value,pending:$('#icsPending').value});alert('Turno guardado')};$('#icsSummary').onclick=()=>askJavny(`Resume y prioriza este turno. Notas: ${$('#icsNotes').value}\nPendientes: ${$('#icsPending').value}`)}
if(id==='cases')$('#iccStart').onclick=()=>askJavny(`Crea un caso clínico interactivo de ${$('#iccTopic').value}, nivel ${$('#iccLevel').value}. Presenta solo la primera fase y espera mi respuesta.`);
if(id==='calc')document.querySelectorAll('[data-calc]').forEach(btn=>btn.onclick=()=>{const k=btn.dataset.calc;try{if(k==='perf'){const d=n('#cDose'),w=n('#cWeight'),mg=n('#cMg'),v=n('#cVol');if(!d||!w||!mg||!v)throw 0;const c=mg*1000/v,r=d*w*60/c;$('#outPerf').textContent=`${r.toFixed(2)} ml/h · ${c.toFixed(2)} mcg/ml`}
if(k==='body'){const kg=n('#cKg'),m=n('#cCm')/100;if(!kg||!m)throw 0;const bmi=kg/m**2,bsa=Math.sqrt(kg*m*100/3600);$('#outBody').textContent=`IMC ${bmi.toFixed(1)} kg/m² · SC ${bsa.toFixed(2)} m²`}
if(k==='crcl'){const age=n('#cAge'),kg=n('#cCrKg'),cr=n('#cCr');if(!age||!kg||!cr)throw 0;let x=(140-age)*kg/(72*cr);if($('#cSex').value==='f')x*=.85;$('#outCrcl').textContent=`Aclaramiento estimado: ${x.toFixed(1)} ml/min`}
if(k==='oxy'){const pa=n('#cPa'),sa=n('#cSa'),fi=n('#cFi')/100;if(!fi)throw 0;$('#outOxy').textContent=`PaFi: ${pa?(pa/fi).toFixed(0):'—'} · SaFi: ${sa?(sa/fi).toFixed(0):'—'}`}
if(k==='met'){const na=n('#cNa'),cl=n('#cCl'),h=n('#cHco'),g=n('#cGlu');if(!na||!cl||!h)throw 0;const ag=na-cl-h,cna=na+1.6*Math.max(0,(g-100)/100);$('#outMet').textContent=`Anión gap: ${ag.toFixed(1)} · Na corregido: ${cna.toFixed(1)} mEq/L`}
if(k==='osm'){const na=n('#cONa'),g=n('#cOGlu'),bun=n('#cBun');if(!na)throw 0;$('#outOsm').textContent=`Osmolaridad: ${(2*na+g/18+bun/2.8).toFixed(1)} mOsm/kg`}
if(k==='ped'){const kg=n('#cPKg');if(!kg)throw 0;let r=kg<=10?4*kg:kg<=20?40+2*(kg-10):60+(kg-20);$('#outPed').textContent=`Mantenimiento: ${r.toFixed(1)} ml/h`}
if(k==='gcs'){const x=n('#gEye')+n('#gVerb')+n('#gMot');$('#outGcs').textContent=`Glasgow: ${x}/15${x<=8?' · gravedad alta; valorar vía aérea según contexto':''}`}}catch(e){const out=btn.parentElement.querySelector('.icResult');if(out)out.textContent='Completa los datos requeridos y revisa las unidades.'}});
const icNnnInput=$('#icNnnInput'),icNnnBtn=$('#icNnnBtn'),icNnnOut=$('#icNnnResult');
if(icNnnBtn){const icValidarNNN=async function(){const v=icNnnInput.value.trim();if(v.length<2){icNnnOut.textContent='Escribe al menos 2 caracteres.';return;}icNnnBtn.disabled=true;icNnnBtn.textContent='Validando…';icNnnOut.textContent='Consultando diccionario NNN…';try{const r=await fetch('/api/terminology/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:v,via:'nnn'})});const d=await r.json();if(!r.ok){icNnnOut.innerHTML='<span style="color:#F59E0B">'+(d.error||'Error')+'</span>';return;}if(d.code_status==='coded'){icNnnOut.innerHTML='<div style="margin-bottom:6px"><span style="display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;background:#14B8A6;color:#fff">✓ Código verificado</span></div><div style="font-size:13px"><b style="color:#14B8A6">NANDA-I '+d.nanda.code+'</b> — '+d.nanda.label+'<br><b style="color:#A855F7">NIC '+d.nic.code+'</b> — '+d.nic.label+'<br><b style="color:#A855F7">NOC '+d.noc.code+'</b> — '+d.noc.label+'<br><span style="font-size:10.5px;color:var(--text-dim,#94A3B8)">Fuente: '+d.fuente+' · Verificado: '+d.fecha_verificacion+' · Por: '+d.revisado_por+'</span></div>';}else{icNnnOut.innerHTML='<span style="display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;background:#F59E0B;color:#000;margin-bottom:4px">⚠ Sin código verificado</span><br><span style="font-size:13px;color:var(--text-dim,#94A3B8)">'+(d.reason||'Término no encontrado.')+'</span>';}}catch(e){icNnnOut.innerHTML='<span style="color:#F59E0B">Error de conexión: '+e.message+'</span>';}finally{icNnnBtn.disabled=false;icNnnBtn.textContent='Validar';}};icNnnBtn.onclick=icValidarNNN;icNnnInput.addEventListener('keydown',e=>{if(e.key==='Enter')icValidarNNN()})}
const icSnomedInput=$('#icSnomedInput'),icSnomedBtn=$('#icSnomedBtn'),icSnomedOut=$('#icSnomedResult');
if(icSnomedBtn){const icValidarSnomed=async function(){const v=icSnomedInput.value.trim();if(v.length<2){icSnomedOut.textContent='Escribe al menos 2 caracteres.';return;}icSnomedBtn.disabled=true;icSnomedBtn.textContent='Validando…';icSnomedOut.textContent='Consultando SNOMED CT…';try{const r=await fetch('/api/terminology/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:v,via:'snomed'})});const d=await r.json();if(!r.ok){icSnomedOut.innerHTML='<span style="color:#F59E0B">'+(d.error||'Error')+'</span>';return;}if(d.code_status==='coded'){icSnomedOut.innerHTML='<div style="margin-bottom:6px"><span style="display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;background:#14B8A6;color:#fff">✓ Código verificado</span></div><div style="font-size:13px"><b style="color:#14B8A6">SNOMED CT '+d.snomed.conceptId+'</b> — '+d.snomed.term+'<br><span style="font-size:10.5px;color:var(--text-dim,#94A3B8)">Fuente: '+d.fuente+'</span></div>';}else{icSnomedOut.innerHTML='<span style="display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;background:#F59E0B;color:#000;margin-bottom:4px">⚠ Sin código verificado</span><br><span style="font-size:13px;color:var(--text-dim,#94A3B8)">'+(d.reason||'Término no encontrado.')+'</span>';}}catch(e){icSnomedOut.innerHTML='<span style="color:#F59E0B">Error de conexión: '+e.message+'</span>';}finally{icSnomedBtn.disabled=false;icSnomedBtn.textContent='Validar';}};icSnomedBtn.onclick=icValidarSnomed;icSnomedInput.addEventListener('keydown',e=>{if(e.key==='Enter')icValidarSnomed()})}
if(id==='integrate')$('#iciSend').onclick=()=>askJavny(`Integra clínica y pruebas, separando hallazgos, contradicciones, gravedad, diferenciales y actuación. Clínica: ${$('#iciClinical').value}\nPruebas: ${$('#iciTests').value}`);
if(id==='media'){$('#icmAdd').onclick=()=>{const a=load('media',[]);a.unshift({title:$('#icmTitle').value||'Recurso',url:$('#icmUrl').value,tags:$('#icmTags').value});save('media',a);renderTab('media')};document.querySelectorAll('[data-del-media]').forEach(x=>x.onclick=()=>{const a=load('media',[]);a.splice(+x.dataset.delMedia,1);save('media',a);renderTab('media')})}
if(id==='diary'){$('#icdAdd').onclick=()=>{const a=load('diary',[]);a.unshift({title:$('#icdTitle').value||'Entrada',text:$('#icdText').value,date:new Date().toLocaleString()});save('diary',a);renderTab('diary')};document.querySelectorAll('[data-del-diary]').forEach(x=>x.onclick=()=>{const a=load('diary',[]);a.splice(+x.dataset.delDiary,1);save('diary',a);renderTab('diary')})}}
function addHomeCard(){const qs=['#in50Home .in60-shell','#in50Home','.home-screen','main'];let host;for(const q of qs){host=document.querySelector(q);if(host)break}if(!host||document.getElementById('icHomeCard'))return;const c=document.createElement('div');c.id='icHomeCard';c.className='icHomeCard';c.innerHTML='<b>🧠 Espacio clínico inteligente</b><small>Calculadoras clínicas, asistente y organización del turno.</small>';c.onclick=open;host.appendChild(c)}
function init(){$('#icTabs').innerHTML=tabs.map((t,i)=>`<button class="icTab${i===0?' on':''}" data-id="${t[0]}">${t[2]?`<span class="icTab-ic">${t[2]}</span>`:''}${t[1]}</button>`).join('');$('#icTabs').onclick=e=>{const x=e.target.closest('.icTab');if(x)renderTab(x.dataset.id)};$('#icFab').onclick=open;$('#icClose').onclick=close;$('#icOverlay').onclick=e=>{if(e.target.id==='icOverlay')close()};renderTab('assistant');addHomeCard();setTimeout(addHomeCard,1200);setTimeout(addHomeCard,3000);$('#procClose').onclick=closeProc;$('#procOverlay').onclick=e=>{if(e.target.id==='procOverlay')closeProc()};$('#algClose').onclick=closeAlg;$('#algOverlay').onclick=e=>{if(e.target.id==='algOverlay')closeAlg()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.openProc=openProc;
window.EnferixProcSearch={
  search:function(query,limit){
    const q=procNorm(query);if(!q)return[];
    const toks=q.split(/\s+/).filter(Boolean);if(!toks.length)return[];
    const data=getProcData();
    const out=[];
    data.items.forEach(function(p){
      const hay=procNorm([p.title,p.summary,p.subtype].join(' '));
      let score=0;toks.forEach(function(t){if(hay.includes(t))score+=hay.startsWith(t)?3:1;if(procNorm(p.title).includes(t))score+=3});
      if(score>0)out.push({cat:p.cat,code:p.code,title:p.title,summary:p.summary,score:score});
    });
    out.sort(function(a,b){return b.score-a.score});
    return limit?out.slice(0,limit):out;
  },
  open:function(cat,code){
    openProc();
    setTimeout(function(){showProcCategory(cat);setTimeout(function(){showProc(code)},30)},30);
    return true;
  }
};

/* ---- Servicios sanitarios cercanos (geolocalización + OpenStreetMap) ---- */
var releaseNearbyFocusTrap=null;
var nearbyLastResults=null,nearbyLastCoords=null;
function nearbyConsent(){try{return localStorage.getItem('inurse_geo_consent')==='1'}catch(e){return false}}
function setNearbyConsent(v){try{localStorage.setItem('inurse_geo_consent',v?'1':'0')}catch(e){}}
function nearbyIco(kind){return kind==='aed'?'⚡':'🏥'}
function nearbyTypeLabel(kind){return kind==='aed'?'Desfibrilador (DEA)':'Hospital / urgencias'}
function renderNearbyPermission(){
  $('#nearbyBody').innerHTML='<div class="nearby-permission"><span class="em">📍</span>'+
    '<h3>Permite tu ubicación</h3>'+
    '<p>Para indicarte los hospitales y desfibriladores (DEA) más cercanos, Enferix necesita tu ubicación. Solo se usa para esta búsqueda: no se guarda en ningún servidor ni se comparte con nadie.</p>'+
    '<button class="icBtn" id="nearbyAllowBtn">📍 Permitir ubicación y buscar</button></div>';
  var btn=$('#nearbyAllowBtn');
  if(btn)btn.onclick=function(){requestNearbySearch('all')};
}
function renderNearbyLoading(){
  $('#nearbyBody').innerHTML='<div class="nearby-permission"><span class="em">📍</span><h3>Buscando cerca de ti…</h3><p>Consultando fuentes cartográficas.</p></div>';
}
// Enlace de emergencia a Google Maps con la ubicación del usuario. No usa API
// key: es la búsqueda normal de Maps con lat/lon en la URL. Útil como último
// recurso cuando ni Google Places ni OpenStreetMap responden.
function nearbyGoogleMapsUrl(query){
  var q=encodeURIComponent(query||'hospitales cerca de mí');
  if(nearbyLastCoords){
    return 'https://www.google.com/maps/search/?api=1&query='+q+
      '&query_place_id=&query='+nearbyLastCoords.lat+','+nearbyLastCoords.lon;
  }
  return 'https://www.google.com/maps/search/?api=1&query='+q;
}
function renderNearbyError(msg,title,retryFn){
  var mapsBtn=nearbyLastCoords
    ?' <a class="icBtn alt" id="nearbyGmapsBtn" href="'+nearbyGoogleMapsUrl('hospitales cerca de mí')+
      '" target="_blank" rel="noopener">🗺️ Abrir en Google Maps</a>'
    :'';
  $('#nearbyBody').innerHTML='<div class="nearby-permission"><span class="em">⚠️</span><h3>'+esc(title||'No se ha podido obtener tu ubicación')+'</h3><p>'+esc(msg)+'</p><div class="nearby-error-actions"><button class="icBtn" id="nearbyRetryBtn">Reintentar</button>'+mapsBtn+'</div></div>';
  var r=$('#nearbyRetryBtn');if(r)r.onclick=retryFn||function(){requestNearbySearch('all')};
}
function nearbyResultsSummary(items){
  if(!items.length)return 'No he encontrado hospitales ni desfibriladores en un radio de 5 kilómetros.';
  var lines=items.slice(0,10).map(function(x,i){return (i+1)+'. '+x.name+' ('+nearbyTypeLabel(x.kind)+'), a '+x.distanceKm+' kilómetros'+(x.address?', '+x.address:'')});
  return 'He encontrado '+items.length+' servicios sanitarios cerca de ti. '+lines.join('. ')+'.';
}
function renderNearbyResults(data){
  nearbyLastResults=data.items||[];
  var typeSel='<div class="nearby-topbar"><select id="nearbyTypeFilter">'+
    '<option value="all">🏥⚡ Hospitales y DEA</option><option value="hospital">🏥 Solo hospitales</option><option value="aed">⚡ Solo DEA</option></select>'+
    '<button class="icBtn alt" id="nearbyReadBtn">🔊 Leer</button>'+
    '<button class="icBtn alt" id="nearbyShareBtn">📤 Exportar</button>'+
    '<button class="icBtn alt" id="nearbyRefreshBtn">↻ Actualizar ubicación</button></div>';
  var list=nearbyLastResults.length
    ? '<div class="nearby-list">'+nearbyLastResults.map(function(x,i){
        return '<div class="nearby-item" data-maps-i="'+i+'" role="button" tabindex="0"><span class="ico">'+nearbyIco(x.kind)+'</span>'+
          '<div class="info"><b>'+esc(x.name)+'</b><br><span class="nearby-type-tag '+x.kind+'">'+esc(nearbyTypeLabel(x.kind))+'</span>'+
          (x.address?'<small>'+esc(x.address)+'</small>':'')+
          (x.phone?'<small>☎ '+esc(x.phone)+'</small>':'')+
          '<div class="actions"><span class="nearby-go">🗺️ Toca para abrir la ruta</span></div></div>'+
          '<span class="dist">'+x.distanceKm+' km</span></div>';
      }).join('')+'</div>'
    : '<div class="nearby-permission"><span class="em">🔍</span><h3>Sin resultados en 5 km</h3><p>No hay hospitales ni desfibriladores registrados en las fuentes consultadas dentro de ese radio. Prueba a ampliar la búsqueda desde un lugar con mejor cobertura de datos.</p></div>';
  // Atribución de fuentes (obligatoria para Google Places, buena práctica para OSM).
  var sourceLine=data.source
    ? '<div class="nearby-attrib">Fuentes: '+esc(data.source)+'</div>'
    : '';
  $('#nearbyBody').innerHTML=typeSel+list+sourceLine;
  function goToItem(i){var it=nearbyLastResults[i];if(it&&it.mapsUrl)window.open(it.mapsUrl,'_blank','noopener')}
  $('#nearbyBody').querySelectorAll('[data-maps-i]').forEach(function(el){
    el.onclick=function(){goToItem(+el.dataset.mapsI)};
    el.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();goToItem(+el.dataset.mapsI)}};
  });
  var sel=$('#nearbyTypeFilter');if(sel)sel.onchange=function(){if(nearbyLastCoords)searchNearbyAt(nearbyLastCoords,sel.value);else requestNearbySearch(sel.value)};
  var refresh=$('#nearbyRefreshBtn');if(refresh)refresh.onclick=function(){requestNearbySearch((sel&&sel.value)||'all')};
  var readBtn=$('#nearbyReadBtn');
  if(readBtn)readBtn.onclick=function(){
    var text=nearbyResultsSummary(nearbyLastResults);
    if(typeof window.EnferixReadText==='function')window.EnferixReadText('Servicios sanitarios cercanos',text,readBtn);
    else if('speechSynthesis' in window){window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang='es-ES';window.speechSynthesis.speak(u)}
  };
  var shareBtn=$('#nearbyShareBtn');
  if(shareBtn)shareBtn.onclick=function(){
    var text=nearbyResultsSummary(nearbyLastResults);
    if(typeof window.EnferixShareContent==='function')window.EnferixShareContent('Servicios sanitarios cercanos',text);
    else if(navigator.share)navigator.share({title:'Servicios sanitarios cercanos',text:text});
    else if(navigator.clipboard){navigator.clipboard.writeText(text);if(typeof toast==='function')toast('Copiado')}
  };
}
function searchNearbyAt(coords,type){
  renderNearbyLoading();
  // El backend prueba varios mirrors de Overpass en paralelo; el peor caso
  // realista ronda 35 s. Damos 45 s de margen y, si expira, mostramos un
  // mensaje útil en vez de dejar el spinner girando indefinidamente.
  var friendlyTimeout='Los servidores de OpenStreetMap tardan más de lo habitual. Vuelve a intentarlo en unos segundos.';
  var ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
  var timer=ctrl?setTimeout(function(){ctrl.abort()},45000):null;
  fetch('/api/nearby?lat='+coords.lat+'&lon='+coords.lon+'&type='+encodeURIComponent(type||'all'),
        ctrl?{signal:ctrl.signal}:{})
    .then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d}})})
    .then(function(res){
      if(timer)clearTimeout(timer);
      if(!res.ok){
        var raw=res.d&&res.d.error;
        var msg=(!raw||raw==='Timeout')?friendlyTimeout:raw;
        renderNearbyError(msg,'No se ha podido buscar cerca de ti',function(){searchNearbyAt(coords,type)});
        return;
      }
      renderNearbyResults(res.d);
    })
    .catch(function(e){
      if(timer)clearTimeout(timer);
      var aborted=e&&(e.name==='AbortError'||/aborted/i.test(e.message||''));
      var msg=aborted?friendlyTimeout:('Error de conexión: '+(e.message||e));
      renderNearbyError(msg,'No se ha podido buscar cerca de ti',function(){searchNearbyAt(coords,type)});
    });
}
function requestNearbySearch(type){
  renderNearbyLoading();
  if(!('geolocation' in navigator)){renderNearbyError('Este dispositivo o navegador no soporta geolocalización.','Ubicación no disponible');return}
  navigator.geolocation.getCurrentPosition(function(pos){
    setNearbyConsent(true);
    nearbyLastCoords={lat:pos.coords.latitude,lon:pos.coords.longitude};
    searchNearbyAt(nearbyLastCoords,type);
  },function(err){
    var msg=err.code===1?'Has denegado el permiso de ubicación. Actívalo en los ajustes del navegador para usar esta función.'
      :err.code===2?'El navegador no ha podido calcular tu posición (GPS/Wi-Fi). Comprueba que la ubicación esté activada en los ajustes del sistema, no solo en el navegador, e inténtalo de nuevo.'
      :'Se agotó el tiempo de espera al obtener tu ubicación.';
    renderNearbyError(msg,'No se ha podido obtener tu ubicación',function(){requestNearbySearch(type)});
  },{enableHighAccuracy:false,timeout:15000,maximumAge:120000});
}
function openNearby(){
  $('#nearbyOverlay').classList.add('on');$('#nearbyOverlay').setAttribute('aria-hidden','false');
  if(releaseNearbyFocusTrap)releaseNearbyFocusTrap();
  releaseNearbyFocusTrap=window.EnferixFocusTrap($('#nearbyPanel'));
  if(nearbyConsent())requestNearbySearch('all');else renderNearbyPermission();
}
function closeNearby(){
  $('#nearbyOverlay').classList.remove('on');$('#nearbyOverlay').setAttribute('aria-hidden','true');
  if(releaseNearbyFocusTrap){releaseNearbyFocusTrap();releaseNearbyFocusTrap=null}
}
$('#nearbyClose').onclick=closeNearby;
$('#nearbyOverlay').onclick=function(e){if(e.target.id==='nearbyOverlay')closeNearby()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#nearbyOverlay').classList.contains('on'))closeNearby()});
window.openNearby=openNearby;
// API para que el chat de Javny enriquezca sus respuestas con datos reales de
// ubicación cuando el usuario ya concedió el permiso previamente (nunca pide
// permiso de forma silenciosa: si no está ya concedido, no hace nada).
window.EnferixNearby={
  hasConsent:nearbyConsent,
  // Si el usuario ya dio el permiso antes, esto es casi instantáneo (el
  // navegador no vuelve a preguntar). Si es la primera vez que pregunta por
  // ubicación —aunque sea directamente a Javny, sin haber abierto antes el
  // panel de Servicios cercanos—, el propio navegador muestra aquí su aviso
  // nativo de permiso; nunca se pide en silencio ni se inventa nada si lo
  // deniega o tarda demasiado: Javny simplemente no recibe ese contexto.
  getContextText:function(){
    if(!('geolocation' in navigator))return Promise.resolve('');
    return new Promise(function(resolve){
      var done=false;
      var timer=setTimeout(function(){if(!done){done=true;resolve('')}},15000);
      navigator.geolocation.getCurrentPosition(function(pos){
        if(done)return;
        setNearbyConsent(true);
        fetch('/api/nearby?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&type=all')
          .then(function(r){return r.ok?r.json():null})
          .then(function(d){
            if(done)return;done=true;clearTimeout(timer);
            if(!d||!d.items||!d.items.length){resolve('');return}
            resolve(nearbyResultsSummary(d.items));
          }).catch(function(){if(!done){done=true;clearTimeout(timer);resolve('')}});
      },function(){if(!done){done=true;clearTimeout(timer);resolve('')}},{enableHighAccuracy:false,timeout:12000,maximumAge:120000});
    });
  },
  // Coordenadas crudas para el chat de Javny: viajan en el body de la consulta
  // y solo las consume la herramienta centros_cercanos del servidor. A
  // DIFERENCIA de getContextText, esto NUNCA dispara el aviso de permiso del
  // navegador: solo devuelve posición si el permiso ya está concedido (se
  // comprueba con la Permissions API y, si no existe, con el consentimiento
  // guardado de Servicios cercanos). Sin permiso previo → null, y Javny
  // responde pidiendo activar la ubicación.
  getCoords:function(opts){
    opts=opts||{};
    if(!('geolocation' in navigator))return Promise.resolve(null);
    var concedido=(navigator.permissions&&navigator.permissions.query)
      ?navigator.permissions.query({name:'geolocation'}).then(function(st){return st.state==='granted'}).catch(function(){return nearbyConsent()})
      :Promise.resolve(nearbyConsent());
    return concedido.then(function(ok){
      if(!ok)return null;
      return new Promise(function(resolve){
        var done=false;
        var ms=opts.timeoutMs||3500;
        var timer=setTimeout(function(){if(!done){done=true;resolve(null)}},ms);
        navigator.geolocation.getCurrentPosition(function(pos){
          if(done)return;done=true;clearTimeout(timer);
          resolve({lat:pos.coords.latitude,lon:pos.coords.longitude});
        },function(){if(!done){done=true;clearTimeout(timer);resolve(null)}},
        {enableHighAccuracy:false,timeout:ms,maximumAge:300000});
      });
    });
  }
};
/* Comando de voz: "hospital cercano", "dea cercano", "desfibrilador", "dónde puedo ir"... */
(function(){
  var origHVC=window.handleVoiceCommand;
  var re=/hospital(es)?\s+(m[aá]s\s+)?cercan|urgencias?\s+(m[aá]s\s+)?cercan|\bdea\b|desfibrilador|servicios?\s+sanitarios?\s+cercan|d[oó]nde\s+puedo\s+ir|centro\s+sanitario\s+cercan/i;
  window.handleVoiceCommand=function(text){
    if(re.test(String(text||''))){openNearby();return true}
    return origHVC?origHVC(text):false;
  };
})();
/* Comando de voz: "SOS", "socorro", "emergencia", "necesito ayuda", "llama al 112"... */
(function(){
  var origHVC=window.handleVoiceCommand;
  var re=/\bsos\b|\bsocorro\b|\bemergencia\b|necesito\s+ayuda|pide\s+ayuda|ayuda\s+urgente|llama\s+al?\s+112|activa\s+(el\s+)?sos/i;
  window.handleVoiceCommand=function(text){
    if(re.test(String(text||''))){if(typeof window.openSos==='function')window.openSos();return true}
    return origHVC?origHVC(text):false;
  };
})();
window.openAlg=openAlg;

/* ---- API global: biblioteca de algoritmos accesible por Javny ---- */
function _algNorm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
/* Palabras clave (sinónimos, abreviaturas y términos coloquiales) por algoritmo */
var ALG_KW={
'Sepsis':'shock septico infeccion','PCR':'parada cardiorrespiratoria paro cardiaco reanimacion rcp soporte vital','Trauma':'politraumatismo traumatismo abcde atls','Hemorragia masiva':'sangrado masivo transfusion masiva','Soporte vital avanzado y arritmias peri-parada':'sva arritmias periparada desfibrilacion',
'IAM':'infarto agudo miocardio sindrome coronario sca dolor toracico stemi','Fibrilación auricular':'fa arritmia','Insuficiencia cardiaca aguda y edema agudo de pulmón':'icc eap edema pulmonar insuficiencia cardiaca',
'Ictus':'acv accidente cerebrovascular isquemico codigo ictus','Status epiléptico':'crisis convulsiva convulsion convulsiones epilepsia estatus','Hemorragia intracerebral':'hic hemorragia cerebral ictus hemorragico',
'Hipoglucemia':'glucemia baja azucar bajo','Cetoacidosis diabética':'cad','Estado hiperglucémico hiperosmolar':'ehh hiperosmolar',
'Crisis asmática':'asma broncoespasmo agudizacion','Exacerbación de EPOC':'epoc reagudizacion agudizacion','Neumonía y criterios de gravedad':'neumonia infeccion respiratoria',
'Anafilaxia':'reaccion alergica shock anafilactico','Angioedema con afectación de vía aérea':'angioedema edema glotis','Urticaria / reacción alérgica aguda':'urticaria habones alergia',
'Sepsis pediátrica':'sepsis niño pediatrica shock septico','Bronquiolitis':'bronquiolitis lactante vrs','Crisis asmática pediátrica':'asma niño pediatrica',
'Hemorragia posparto':'hpp posparto','Preeclampsia / eclampsia':'preeclampsia eclampsia hipertension gestacional','Sepsis o colapso materno':'sepsis materna colapso obstetrico',
'Embarazo ectópico':'ectopico tubarico','Enfermedad inflamatoria pélvica':'eip','Sangrado o dolor en embarazo inicial':'amenaza aborto primer trimestre',
'Hemorragia digestiva alta':'hda melenas hematemesis','Hemorragia varicosa en cirrosis':'varices esofagicas cirrosis hipertension portal','Colangitis / obstrucción biliar':'colangitis coledoco ictericia biliar',
'TVP / TEP':'tromboembolismo pulmonar trombosis venosa profunda embolia','Trombocitopenia inducida por heparina':'hit trombopenia heparina','Hemorragia en paciente anticoagulado':'sangrado anticoagulacion sintrom acenocumarol',
'Isquemia aguda de extremidad':'isquemia arterial aguda extremidad','Enfermedad arterial periférica con extremidad amenazada':'eap arteriopatia periferica',
'Lesión renal aguda':'lra aki fracaso renal insuficiencia renal','Hiperpotasemia':'potasio hiperkaliemia','Cólico renal con uropatía obstructiva infectada':'colico nefritico litiasis urosepsis obstruccion',
'Tormenta tiroidea':'crisis tirotoxica hipertiroidismo tirotoxicosis','Coma mixedematoso':'hipotiroidismo grave mixedema','Nódulo tiroideo':'nodulo tiroides',
'Oclusión arterial retiniana':'oclusion arteria retina perdida vision','Glaucoma agudo de ángulo cerrado':'glaucoma ojo rojo doloroso','Pérdida visual aguda':'perdida vision ceguera brusca',
'Epistaxis':'sangrado nasal nariz','Hipoacusia neurosensorial súbita':'sordera subita perdida audicion','Infección cervical profunda':'absceso cervical flemon cuello',
'Riesgo suicida / autolesión':'suicidio autolisis ideacion suicida autolesion','Agitación: desescalada y tranquilización rápida':'agitacion desescalada contencion','Síndrome serotoninérgico':'serotonina toxicidad serotoninergica',
'Artritis reumatoide: escalada terapéutica':'artritis reumatoide ar fame','Arteritis de células gigantes':'arteritis temporal horton','Monoartritis aguda / descarte de artritis séptica':'monoartritis artritis septica gota',
'Lesión pigmentada sospechosa':'melanoma lunar nevus mancha','Dermatitis atópica por gravedad':'eccema dermatitis atopica','Psoriasis: criterios de escalada':'psoriasis',
'Valoración del dolor agudo':'dolor agudo valoracion','Analgesia multimodal escalonada':'analgesia escalera analgesica','Prevención del daño por opioides':'opioides morfina fentanilo naloxona',
'Dolor dental agudo':'dolor dental muela odontalgia','Infección odontógena con tumefacción':'flemon dental absceso odontogeno','Complicaciones tras extracción dental':'alveolitis extraccion dental',
'Intervención breve 5A':'tabaco 5a intervencion breve','Tratamiento para dejar de fumar':'dejar fumar cesacion tabaquica','Prevención de recaídas del tabaquismo':'recaida tabaco'
};
var ALG_STOP={algoritmo:1,algoritmos:1,protocolo:1,protocolos:1,pauta:1,pautas:1,manejo:1,actuacion:1,de:1,del:1,la:1,el:1,los:1,las:1,un:1,una:1,dame:1,muestra:1,muestrame:1,abre:1,abrir:1,quiero:1,ver:1,busca:1,buscar:1,ensename:1,javny:1,por:1,favor:1,sobre:1,para:1,como:1,en:1,y:1,e:1,que:1,con:1,ante:1,si:1,hago:1,actuo:1,actuar:1,trato:1,procedo:1,inicial:1};
function algScore(name,toks,raw){
  var hay=' '+_algNorm(name)+' '+_algNorm(ALG_CAT[name]||'')+' '+_algNorm(ALG_KW[name]||'')+' ';
  var score=0;
  toks.forEach(function(t){ if(hay.indexOf(' '+t+' ')!==-1) score+=3; else if(t.length>=4&&hay.indexOf(t)!==-1) score+=1; });
  if(raw&&raw.indexOf(_algNorm(name))!==-1) score+=4;
  return score;
}
function algFind(query){
  var raw=_algNorm(query); if(!raw) return null;
  var toks=raw.split(' ').filter(function(t){return t&&!ALG_STOP[t];});
  if(!toks.length) return null;
  var best=null,bestScore=0;
  Object.keys(ALG).forEach(function(name){ var s=algScore(name,toks,raw); if(s>bestScore){ bestScore=s; best=name; } });
  if(!best||bestScore<3) return null;
  var a=ALG[best];
  return { name:best, src:a.src, steps:a.steps.slice(), cat:ALG_CAT[best]||'' };
}
function algSearch(query,limit){
  var raw=_algNorm(query); if(!raw) return [];
  var toks=raw.split(' ').filter(function(t){return t&&!ALG_STOP[t];});
  if(!toks.length) return [];
  var out=[];
  Object.keys(ALG).forEach(function(name){ var s=algScore(name,toks,raw); if(s>=3) out.push({name:name,src:ALG[name].src,cat:ALG_CAT[name]||'',score:s}); });
  out.sort(function(a,b){return b.score-a.score;});
  return limit?out.slice(0,limit):out;
}
window.EnferixAlgLib={
  find:algFind,
  search:algSearch,
  get:function(name){ var a=ALG[name]; return a?{name:name,src:a.src,steps:a.steps.slice(),cat:ALG_CAT[name]||''}:null; },
  open:function(name){ if(!ALG[name]) return false; if(typeof window.openAlg==='function')window.openAlg(); setTimeout(function(){ showAlg(name); },30); return true; },
  list:function(){ return Object.keys(ALG).map(function(n){ return {name:n,src:ALG[n].src,cat:ALG_CAT[n]||''}; }); }
};
})();
