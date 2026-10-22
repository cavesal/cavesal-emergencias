/* CaVeSal® Emergencias — Simulador: casos clínicos ficticios.
 * Cada respuesta correcta se respalda en las Guías CaVeSal o en una fuente externa verificada (ver `ref` / `url`).
 * Los casos son ficticios y con fines de entrenamiento. */
(function () {
  var G = {
    rojo: "guia.html#tab-rojo",
    amarillo: "guia.html#tab-ambar",
    azul: "guia.html#tab-azuloscuro",
    smfmCheck: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13565333/",
    smfmCheck21: "https://anestesiaobstetrica.com/CursoAnual/Public/UPLOAD/ARTICULOS/FILE-0000000085.pdf",
    smfm9: "https://publications.smfm.org/publications/581-society-for-maternal-fetal-medicine-clinical-guidelines-9/",
    esc2025: "https://www.unipi.it/wp-content/uploads/ESC-guidelines-Cardiovascular-disease-pregnancy-2025.pdf",
    esc2025res: "https://academic.oup.com/ehjacc/article/14/11/703/8273852",
    tepSangrado: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13104373/",
    tepAnticoag: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12942629/"
  };

  window.SIM_CASOS = [
    {
      id: "sepsis",
      codigo: "amarillo",
      titulo: "Puérpera de 32 años, 48 h poscesárea",
      tema: "Sepsis puerperal y shock séptico",
      resumen: "Disnea progresiva, dolor abdominal y oliguria, sin fiebre referida. ¿Lo reconocés a tiempo y encontrás el foco?",
      escenas: [
        {
          min: 0, titulo: "Ingreso",
          relato: "Puérpera de 32 años, 48 horas poscesárea. Consulta por disnea progresiva, dolor abdominal, malestar general y oliguria. No refiere fiebre.",
          vit: { fc: 128, pas: 88, pad: 52, fr: 30, sat: 91, satNota: "aire ambiente", t: 37.4 },
          preguntas: [
            {
              tipo: "numero", q: "Calculá el índice de choque (FC / PAS).", resp: 1.45, tol: 0.05, dec: 2,
              fbOk: "Correcto: 128 / 88 = 1,45. Un índice ≥1,4 indica necesidad urgente de intervención; >0,9 ya es marcador de severidad.",
              fbMal: "El índice de choque es 128 / 88 = 1,45. Un valor ≥1,4 indica necesidad urgente de intervención.",
              ref: "Guías CaVeSal · Índice de choque (umbrales 0,9 / 1,4 / 1,7)", url: G.rojo
            },
            {
              tipo: "opcion", q: "¿Qué te preocupa de esta paciente?",
              ops: [
                { t: "Sepsis materna probable: hay sospecha de infección y signos de disfunción orgánica.", ok: true, fb: "Correcto. FC >100, FR >25, PAS <90 y SatO₂ <95 % son criterios de sospecha de sepsis (WHO GLOSS). La ausencia de fiebre no la descarta." },
                { t: "Sin fiebre, la infección es poco probable: control de signos en 4 horas.", fb: "La ausencia de fiebre no descarta sepsis. Esta paciente ya cumple varios criterios de sospecha: FC >100, FR >25, PAS <90 y SatO₂ <95 %." },
                { t: "Dolor posoperatorio con ansiedad: analgesia y reevaluar.", fb: "Taquicardia, taquipnea, hipotensión, hipoxemia y oliguria no se explican por dolor. Son signos de disfunción orgánica." }
              ],
              peor: { fc: 8, pas: -6, sat: -2 },
              ref: "Guías CaVeSal · Código Amarillo, ficha 1 (OMS 2017, WHO GLOSS 2020)", url: G.amarillo
            }
          ]
        },
        {
          min: 45, titulo: "Primera hora: deterioro clínico",
          relato: "Entre 30 y 60 minutos después, la paciente está somnolienta (Glasgow 13/15). Diuresis <0,3 mL/kg/h.",
          vit: { fc: 138, pas: 82, pad: 50, fr: 34, sat: 88, satNota: "O₂ 3 L/min", t: 37.6, mental: "Somnolienta · Glasgow 13" },
          datos: [["Leucocitos", "16.800/mm³"], ["Lactato", "4,2 mmol/L"], ["Creatinina", "1,3 mg/dL"], ["TP / TTPa", "normales"], ["Cultivos", "en curso"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Necesitás completar un puntaje para actuar?",
              ops: [
                { t: "No. Hay infección sospechada con disfunción respiratoria, cardiovascular, renal y neurológica: activar Código Amarillo ya.", ok: true, fb: "Correcto. Infección + disfunción orgánica = sepsis materna. Los puntajes ayudan a tamizar, pero no deben demorar el tratamiento." },
                { t: "Sí. Esperar el SOFA obstétrico completo con gasometría y bilirrubina.", fb: "El SOFA confirma, pero no debe demorar el inicio del bundle de la primera hora cuando la disfunción orgánica ya es evidente." },
                { t: "Calcular el qSOFA: si da menos de 2, se descarta sepsis.", fb: "El qSOFA tiene sensibilidad limitada y un valor <2 no descarta sepsis. No debe usarse como única herramienta de tamizaje." }
              ],
              peor: { fc: 6, pas: -6, sat: -2 },
              ref: "Guías CaVeSal · Código Amarillo, fichas 1 y 5 (qSOFA obstétrico, SOMANZ)", url: G.amarillo
            },
            {
              tipo: "opcion", q: "Hora 0. ¿Cómo organizás el manejo inicial?",
              ops: [
                { t: "Acciones simultáneas: oxígeno, cultivos y lactato, antibióticos de amplio espectro en la primera hora, cristaloides y vasopresor si la PAM sigue <65 tras el bolo.", ok: true, fb: "Correcto. Es el bundle de la primera hora: «Tome 4» y «Suministre 5», en paralelo y no en secuencia." },
                { t: "Esperar el resultado de los cultivos para elegir el antibiótico correcto.", fb: "Los antibióticos de amplio espectro deben iniciarse en la primera hora, después de tomar cultivos, sin esperar el resultado." },
                { t: "Primero normalizar la presión con cristaloides; los antibióticos después.", fb: "Las acciones son simultáneas. Retrasar el antibiótico empeora el pronóstico." }
              ],
              peor: { fc: 6, pas: -8, sat: -2 },
              ref: "Guías CaVeSal · Código Amarillo, ficha 3 (Bundle «Sepsis 4-5-3»)", url: G.amarillo
            },
            {
              tipo: "numero", q: "Peso actual 70 kg. ¿Cuántos mL de cristaloides indicás en el bolo inicial a 30 mL/kg?", resp: 2100, tol: 50, dec: 0, unidad: "mL",
              fbOk: "Correcto: 70 × 30 = 2.100 mL. El bundle indica 20-30 mL/kg y luego mantenimiento de 1-2 mL/kg/h.",
              fbMal: "70 kg × 30 mL/kg = 2.100 mL. El rango del bundle es 20-30 mL/kg (1.400 a 2.100 mL para 70 kg).",
              ref: "Guías CaVeSal · Código Amarillo, ficha 3", url: G.amarillo
            }
          ]
        },
        {
          min: 120, titulo: "Reevaluación tras la reanimación inicial",
          relato: "Ya recibió cerca de 2 L de cristaloides, antibióticos de amplio espectro y noradrenalina en curso. La disnea y la necesidad de vasopresor aumentan. Útero muy doloroso, dolor abdominal difuso y signos de irritación peritoneal.",
          vit: { fc: 142, pas: 80, pad: 47, fr: 32, sat: 86, satNota: "O₂ alto flujo", t: 37.8, mental: "Somnolienta", vaso: true },
          datos: [["Diuresis", "<0,3 mL/kg/h"], ["POCUS · vena cava", "poco colapsable"], ["POCUS · abdomen y pelvis", "líquido libre / colección intraabdominal o pélvica"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Otro litro de cristaloides o control del foco?",
              ops: [
                { t: "Control del foco: evaluar y drenar la colección (cirugía o drenaje). Los antibióticos y el soporte no sustituyen el control del foco.", ok: true, fb: "Correcto. Hay una colección intraabdominal o pélvica y deterioro pese a la reanimación: el control del foco es la decisión crítica." },
                { t: "Otro bolo de 1 L: todavía está hipotensa.", fb: "La vena cava ya es poco colapsable y la hipoxemia empeora: más volumen agrega sobrecarga sin resolver la causa. El problema es el foco." },
                { t: "Cambiar el antibiótico y reevaluar en 24 horas.", fb: "Con una colección y shock que progresa, esperar 24 horas no es seguro. Sin control del foco la sepsis no se resuelve." }
              ],
              peor: { fc: 8, pas: -8, sat: -3 },
              ref: "Guías CaVeSal · Código Amarillo, ficha 3 («Considere 3: control del foco»)", url: G.amarillo
            }
          ]
        }
      ],
      fuentes: [
        ["Guías CaVeSal · Código Amarillo (OMS 2017, WHO GLOSS 2020, CMQCC 2022, Surviving Sepsis Campaign 2021, MSPBS 2022, SOMANZ)", G.amarillo],
        ["Guías CaVeSal · Índice de choque", G.rojo]
      ]
    },

    {
      id: "tep",
      codigo: "azul",
      titulo: "Puérpera de 4 días poscesárea",
      tema: "Tromboembolismo pulmonar de alto riesgo",
      resumen: "Disnea súbita, hipoxemia y síncope en minutos. ¿Qué está obstruyendo la circulación y cómo la destrabás?",
      escenas: [
        {
          min: 0, titulo: "Todo ocurrió en segundos",
          relato: "Puérpera de 4 días, cesárea por falta de progreso. Movilización limitada. Minuto 0: disnea súbita. Minuto 5: hipoxemia. Minuto 10: hipotensión y síncope transitorio. Sangrado posoperatorio sin complicaciones.",
          vit: { fc: 132, pas: 78, pad: 46, fr: 32, sat: 85, satNota: "aire ambiente", t: 36.8, mental: "Lúcida tras síncope" },
          preguntas: [
            {
              tipo: "numero", q: "Calculá el índice de choque (FC / PAS).", resp: 1.69, tol: 0.05, dec: 2,
              fbOk: "Correcto: 132 / 78 = 1,69. Está en el umbral de necesidad urgente de intervención (≥1,4) y casi en el de alta probabilidad de resultado adverso (≥1,7).",
              fbMal: "132 / 78 = 1,69: necesidad urgente de intervención (≥1,4), cerca del umbral de 1,7.",
              ref: "Guías CaVeSal · Índice de choque", url: G.rojo
            }
          ]
        },
        {
          min: 15, titulo: "Evaluación inicial",
          relato: "Afebril, sin edema ni signos clínicos de trombosis venosa en miembros inferiores. Ansiosa, pálida y diaforética.",
          vit: { fc: 132, pas: 78, pad: 46, fr: 32, sat: 85, satNota: "aire ambiente", t: 36.8, mental: "Lúcida" },
          datos: [["POCUS cardíaco", "ventrículo derecho dilatado, VI pequeño (signo de la D)"], ["Ecografía pulmonar", "líneas A difusas"], ["ECG", "taquicardia sinusal, S1Q3T3"], ["Gasometría", "pH 7,48 · PaCO₂ 28 · PaO₂ 52"], ["Hemoglobina", "10,8 g/dL · plaquetas 280.000"], ["Dímero D", "elevado (baja especificidad en el puerperio)"], ["Rx de tórax", "sin infiltrados ni congestión"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Cuál es tu principal sospecha diagnóstica?",
              ops: [
                { t: "Tromboembolismo pulmonar de alto riesgo con shock obstructivo.", ok: true, fb: "Correcto. Disnea súbita, hipoxemia, hipotensión con VD dilatado y pulmón sin congestión en una puérpera poscesárea: shock obstructivo por TEP." },
                { t: "Hemorragia posparto oculta (shock hipovolémico).", fb: "La hemoglobina es 10,8 g/dL y no hay sangrado. El VD dilatado con VI pequeño indica obstrucción, no hipovolemia." },
                { t: "Sepsis puerperal.", fb: "Está afebril y el inicio fue súbito, en minutos. El patrón del POCUS es de obstrucción al ventrículo derecho." }
              ],
              peor: { fc: 6, pas: -6, sat: -3 },
              ref: "ESC 2025 · Enfermedad cardiovascular y embarazo (TEP)", url: G.esc2025res
            },
            {
              tipo: "opcion", q: "Alta sospecha de TEP e inestabilidad. ¿Cuándo iniciás la anticoagulación?",
              ops: [
                { t: "Ya, con heparina no fraccionada IV, mientras se completa el estudio.", ok: true, fb: "Correcto. Ante alta sospecha se anticoagula sin demora; en la paciente inestable se prefiere la heparina no fraccionada en la fase inicial." },
                { t: "Solo después de confirmar con angio-TC.", fb: "Con alta probabilidad clínica la anticoagulación se inicia mientras se completa el estudio, sin esperar la confirmación." },
                { t: "No anticoagular: la cesárea fue hace 4 días.", fb: "La cesárea reciente aumenta el riesgo de sangrado, pero no impide anticoagular un TEP de alto riesgo. El riesgo de muerte es mayor." }
              ],
              peor: { fc: 6, pas: -6, sat: -3 },
              ref: "Maternal cardiovascular emergencies (PMC, 2026) · Frontiers in Cardiovascular Medicine 2022", url: G.tepAnticoag
            }
          ]
        },
        {
          min: 25, titulo: "Acaba de tener una cesárea: ¿y ahora?",
          relato: "Con heparina en curso sigue inestable: TEP de alto riesgo con shock en una puérpera con herida quirúrgica de 4 días.",
          vit: { fc: 136, pas: 74, pad: 44, fr: 34, sat: 84, satNota: "O₂ con máscara", t: 36.8, mental: "Ansiosa" },
          preguntas: [
            {
              tipo: "opcion", q: "¿Cuál es la mejor estrategia ahora?",
              ops: [
                { t: "Anticoagulación más estrategia de reperfusión (por catéter o trombólisis sistémica), decidida con el equipo multidisciplinario.", ok: true, fb: "Correcto. En la embarazada o puérpera con TEP de alto riesgo se debe considerar la reperfusión por catéter o la trombólisis sistémica (ESC 2025, IIa C); la trombectomía quirúrgica es alternativa (IIb C)." },
                { t: "Continuar solo con la anticoagulación y observar.", fb: "La anticoagulación sola no resuelve rápido la obstrucción en el TEP de alto riesgo con shock. Hace falta reperfundir." },
                { t: "La trombólisis está absolutamente contraindicada en el puerperio: no reperfundir.", fb: "El embarazo y el posparto son contraindicaciones relativas, no absolutas. Ante riesgo vital, la reperfusión debe considerarse." }
              ],
              peor: { fc: 8, pas: -8, sat: -3 },
              ref: "ESC 2025 · Guías de enfermedad cardiovascular y embarazo, tabla 11", url: G.esc2025
            },
            {
              tipo: "opcion", q: "¿Por qué el equipo puede preferir la terapia por catéter en esta paciente?",
              ops: [
                { t: "Porque tras la trombólisis sistémica las complicaciones hemorrágicas mayores son frecuentes en el posparto (58 % en una revisión, frente a 18 % en el embarazo).", ok: true, fb: "Correcto. Por eso, si está disponible, la estrategia por catéter es una opción atractiva; la trombólisis sistémica sigue siendo válida ante riesgo vital." },
                { t: "Porque la terapia por catéter no requiere anticoagulación.", fb: "La anticoagulación sigue siendo la base del tratamiento en todos los casos." },
                { t: "Porque la trombólisis atraviesa la placenta.", fb: "Ya no hay feto: es una puérpera. Además, el activador tisular del plasminógeno no atraviesa la placenta. El motivo es el sangrado." }
              ],
              ref: "NEWS-guided management of PE in pregnancy (PMC, 2026) · ESC 2025", url: G.tepSangrado
            }
          ]
        }
      ],
      fuentes: [
        ["2025 ESC Guidelines for the management of cardiovascular disease and pregnancy (Eur Heart J 2025;46:4462-4568)", G.esc2025],
        ["Resumen ESC 2025 para cuidados cardiovasculares agudos (EHJ Acute CV Care)", G.esc2025res],
        ["Maternal cardiovascular emergencies during pregnancy and the postpartum period (PMC)", G.tepAnticoag],
        ["NEWS-guided management of pulmonary embolism in pregnancy (PMC)", G.tepSangrado],
        ["Guías CaVeSal · Índice de choque", G.rojo]
      ]
    },

    {
      id: "ela",
      codigo: "rcp",
      titulo: "Gestante de 39 semanas en trabajo de parto",
      tema: "Embolia de líquido amniótico con coagulopatía",
      resumen: "Colapso súbito durante el parto y, minutos después, sangrado incoercible. Dos emergencias a la vez.",
      escenas: [
        {
          min: 0, titulo: "Colapso periparto",
          relato: "Embarazo de 39 semanas, sin antecedentes relevantes, trabajo de parto de evolución normal. Minuto 5: disnea intensa y malestar. Minuto 10: hipoxemia e hipotensión. Minuto 15: colapso hemodinámico y respiratorio. Piel fría y pálida, bradicardia marcada, sin sangrado significativo.",
          vit: { fc: 38, pas: 60, pad: 30, fr: 6, sat: 76, satNota: "O₂ 100 %", t: 36.5, mental: "Inconsciente" },
          preguntas: [
            {
              tipo: "opcion", q: "¿Cuál es tu principal sospecha diagnóstica?",
              ops: [
                { t: "Embolia de líquido amniótico: colapso cardiorrespiratorio súbito en el periparto.", ok: true, fb: "Correcto. SMFM recomienda considerarla ante un colapso cardiorrespiratorio súbito en el trabajo de parto o el posparto inmediato. El diagnóstico es clínico." },
                { t: "Eclampsia.", fb: "No hubo convulsiones ni hipertensión: el cuadro es un colapso cardiorrespiratorio con hipotensión grave." },
                { t: "Hemorragia obstétrica.", fb: "Por ahora no hay sangrado significativo. El colapso precede al sangrado; la coagulopatía puede aparecer después." }
              ],
              peor: { fc: -6, pas: -6, sat: -4 },
              ref: "SMFM Clinical Guideline #9 · Embolia de líquido amniótico", url: G.smfm9
            },
            {
              tipo: "opcion", q: "¿Pedís una prueba de laboratorio para confirmar antes de actuar?",
              ops: [
                { t: "No: no existe ninguna prueba que confirme o descarte la embolia de líquido amniótico. Se actúa con el diagnóstico clínico.", ok: true, fb: "Correcto. SMFM no recomienda ninguna prueba específica para confirmar o refutar el diagnóstico (GRADE 1C)." },
                { t: "Sí: la triptasa sérica confirma el diagnóstico.", fb: "No hay una prueba diagnóstica validada. Esperar un resultado demora la reanimación." },
                { t: "Sí: una angio-TC de tórax antes de cualquier medida.", fb: "La paciente está en colapso. No se demora la reanimación por estudios." }
              ],
              ref: "SMFM Clinical Guideline #9", url: G.smfm9
            }
          ]
        },
        {
          min: 16, titulo: "Pierde el pulso",
          relato: "No se palpa pulso. Feto in utero de 39 semanas.",
          vit: { fc: 0, pas: 0, pad: 0, fr: 0, sat: 0, satNota: "sin señal", t: 36.4, mental: "Paro", paro: true },
          preguntas: [
            {
              tipo: "opcion", q: "¿Cuáles son tus primeras acciones?",
              ops: [
                { t: "Código Azul: RCP de alta calidad, desplazamiento uterino a la izquierda, vía aérea y alguien que cante el tiempo cada minuto.", ok: true, fb: "Correcto. Es la lista inicial de SMFM y la secuencia CABD de las Guías." },
                { t: "Trasladarla al quirófano antes de iniciar la RCP, aunque demore 10 minutos.", fb: "El traslado solo se considera si se puede hacer en 2 minutos o menos. La RCP empieza donde está la paciente." },
                { t: "Iniciar la RCP en decúbito dorsal estricto, sin desplazar el útero.", fb: "En la gestante, el desplazamiento uterino a la izquierda es parte de la RCP: descomprime la aorta y la vena cava." }
              ],
              ref: "SMFM · Checklist de manejo inicial de la embolia de líquido amniótico · Guías CaVeSal, Código Azul", url: G.smfmCheck21
            },
            {
              tipo: "opcion", q: "Minuto 4 de paro, sin respuesta. ¿Qué hacés?",
              ops: [
                { t: "Iniciar la cesárea perimortem (histerotomía de reanimación) para extraer al feto al minuto 5.", ok: true, fb: "Correcto. Con más de 24 semanas, la histerotomía se inicia al minuto 4 sin respuesta. Mejora la hemodinamia materna y la probabilidad de reanimación." },
                { t: "Seguir con la RCP 20 minutos más antes de decidir.", fb: "Esperar empeora el pronóstico materno y fetal. La decisión es al minuto 4." },
                { t: "Esperar a la profilaxis antibiótica y a la antisepsia completa.", fb: "SMFM indica preparar la piel solo con antiséptico rápido, sin esperar antibióticos." }
              ],
              ref: "Guías CaVeSal · Código Azul, fichas 3-4 · SMFM Checklist", url: G.azul
            }
          ]
        },
        {
          min: 25, titulo: "Y ahora… sangra",
          relato: "Tras la extracción vuelve la circulación con soporte. Minutos después aparece una hemorragia obstétrica incoercible.",
          vit: { fc: 72, pas: 68, pad: 42, fr: 14, sat: 90, satNota: "ventilación mecánica", t: 36.0, mental: "Sedada", vaso: true },
          datos: [["Fibrinógeno", "muy bajo (<100-150 mg/dL)"], ["Plaquetas", "<100.000/mm³"], ["TP / TTPa", "prolongados"], ["Dímero D", "muy elevado"], ["ROTEM", "FIBTEM con firmeza mínima"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Cómo manejás las dos emergencias?",
              ops: [
                { t: "En simultáneo: transfusión masiva con crioprecipitado o fibrinógeno, ácido tranexámico y uterotónicos; soporte del VD con noradrenalina e inotrópicos, evitando la sobrecarga de líquidos.", ok: true, fb: "Correcto. Embolia de líquido amniótico = compromiso cardiopulmonar + coagulopatía. Se tratan a la vez." },
                { t: "Reponer con cristaloides abundantes hasta normalizar la presión.", fb: "El VD está en falla: el exceso de líquidos lo empeora. SMFM indica bolos de 500 mL y reevaluar, más vasopresores e inotrópicos." },
                { t: "Esperar el ROTEM completo antes de transfundir.", fb: "La hemorragia es incoercible: el protocolo de transfusión masiva se activa ya. El ROTEM orienta, pero no debe demorar." }
              ],
              peor: { fc: 10, pas: -8, sat: -3 },
              ref: "SMFM · Checklist de manejo inicial de la embolia de líquido amniótico (2021, actualizado 2026)", url: G.smfmCheck
            },
            {
              tipo: "opcion", q: "Para corregir la coagulopatía, ¿qué hemoderivado se prefiere?",
              ops: [
                { t: "Crioprecipitado, en lugar de plasma fresco congelado, para reducir la sobrecarga de volumen.", ok: true, fb: "Correcto. SMFM prefiere el crioprecipitado sobre el plasma para no sobrecargar el VD." },
                { t: "Plasma fresco congelado en grandes volúmenes como primera opción.", fb: "El plasma aporta mucho volumen y empeora la falla del VD. Se prefiere el crioprecipitado." },
                { t: "Solo concentrado de plaquetas.", fb: "El fibrinógeno muy bajo es el defecto central de esta coagulopatía: requiere crioprecipitado o fibrinógeno, además de plaquetas y glóbulos rojos según necesidad." }
              ],
              ref: "SMFM · Checklist de manejo inicial de la embolia de líquido amniótico", url: G.smfmCheck21
            },
            {
              tipo: "numero", q: "Ácido tranexámico por coagulopatía o hemorragia: ¿cuántos gramos IV, en 10 minutos?", resp: 1, tol: 0, dec: 0, unidad: "g",
              fbOk: "Correcto: 1 g IV en 10 minutos.",
              fbMal: "La dosis es 1 g IV en 10 minutos.",
              ref: "SMFM · Checklist de manejo inicial de la embolia de líquido amniótico", url: G.smfmCheck21
            }
          ]
        }
      ],
      fuentes: [
        ["SMFM Clinical Guidelines #9: Amniotic fluid embolism, diagnosis and management (2016)", G.smfm9],
        ["SMFM Special Statement: Checklist for initial management of amniotic fluid embolism (2021)", G.smfmCheck21],
        ["SMFM Special Statement: Checklist… Updated 2026 (PMC)", G.smfmCheck],
        ["Guías CaVeSal · Código Azul Obstétrico (AHA 2020, actualización 2025)", G.azul]
      ]
    }
  ];
})();
