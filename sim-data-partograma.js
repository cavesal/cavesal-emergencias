/* CaVeSal® Simulador — Partograma (Ministerio CLAP · OMS 2020 · ACOG 2024).
 * Caso 1: partograma Ministerio CLAP (MSPBS · OPS/OMS-CLAP), líneas de alerta y acción.
 * Caso 2: Guía de Cuidados del Trabajo de Parto OMS 2020 (Labour Care Guide), umbrales de alerta.
 * Caso 3: ACOG 2024 (CPG 8), fase activa desde 6 cm y criterios de detención.
 * Casos ficticios con fines de entrenamiento. Algoritmo propio CaVeSal®. */
(function () {
  var MSPBS = "https://www.mspbs.gov.py/dependencias/portal/adjunto/0c51be-NORMASDECUIDADOS.pdf";
  var PPS = "https://www.mspbs.gov.py/dependencias/portal/adjunto/b4214b-ProtocoloPartoSeguroA41.pdf";
  var LCG = "https://cdn.who.int/media/docs/default-source/reproductive-health/maternal-health/who-labour-care-guide.pdf?sfvrsn=bd7fe865_15";
  var JH = "https://api.jhpiego.org/wp-content/uploads/2026/06/03-LCG-Participant-ENGLISH.pdf";
  var BC = "https://bettercare.co.za/maternal-care/08c.html";
  var ACOG = "https://www.acog.org/clinical/clinical-guidance/clinical-practice-guideline/articles/2024/01/first-and-second-stage-labor-management";
  var FPQC = "https://health.usf.edu/media/cijpqel3/providefoci-inductiondystocia.pdf";
  var GRUPO = "Partograma (Ministerio CLAP · OMS 2020 · ACOG 2024)";
  var rM = "MSPBS · Normas de Cuidados, partograma (pp. 61-63)";
  var rL = "OMS 2020 · Labour Care Guide";
  var rA = "ACOG 2024 · CPG 8";

  window.SIM_CASOS = window.SIM_CASOS || [];
  window.SIM_CASOS.push(
    {
      id: "pg1",
      grupo: GRUPO,
      codigo: "parto",
      modo: "parto",
      titulo: "Nulípara de 22 años, 40 semanas — partograma Ministerio CLAP",
      tema: "Partograma Ministerio CLAP",
      resumen: "Abrí el partograma, ubicá la curva respecto de las líneas de alerta y acción, y decidí a tiempo.",
      escenas: [
        {
          min: 0, titulo: "08:00 — Ingreso en trabajo de parto",
          relato: "Nulípara de 22 años, 40 semanas, embarazo de bajo riesgo. Tacto: 4 cm, membranas íntegras, cefálica en I plano. Contracciones 3 en 10 minutos, de 30 segundos. FCF 138 lpm.",
          vit: { fc: 82, pas: 116, pad: 72, t: 36.7, fcf: 138, cu: "3 en 10 min · 30 s", dil: 4, fase: "fase activa (MSPBS)" },
          datos: [["Paridad", "Nulípara"], ["Membranas", "Íntegras (I)"], ["Descenso", "I plano de Hodge"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Dónde marcás el primer punto de dilatación?",
              ops: [
                { t: "Sobre la línea de alerta, a los 4 cm.", ok: true, fb: "Correcto. La norma MSPBS abre el partograma con 4 cm y el primer punto se marca sobre la línea de alerta." },
                { t: "En la hora 0, aunque esté a la izquierda de la línea de alerta.", fb: "Con 4 cm el registro comienza sobre la línea de alerta; desde ahí se juzga la evolución." },
                { t: "Todavía no: el partograma se abre con 6 cm.", fb: "Los 6 cm son el inicio de fase activa de ACOG. La norma MSPBS abre el partograma con 4 cm." }
              ],
              ref: rM + " · Protocolo Parto Seguro", url: MSPBS
            },
            {
              tipo: "numero", q: "¿Cada cuántos minutos registrás FCF, contracciones y pulso?", resp: 30, tol: 0, dec: 0, unidad: "min",
              fbOk: "Correcto: cada 30 minutos.", fbMal: "La norma MSPBS indica cada 30 minutos FCF, contracciones (número y duración en 10 min) y pulso.",
              ref: rM, url: MSPBS
            },
            {
              tipo: "numero", q: "¿Cada cuántas horas registrás la presión arterial?", resp: 4, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: cada 4 horas (temperatura cada 2 horas).", fbMal: "La presión arterial se registra cada 4 horas y la temperatura cada 2 horas.",
              ref: rM, url: MSPBS
            },
            {
              tipo: "opcion", q: "Contracciones de 30 segundos. ¿Cómo se pintan?",
              ops: [
                { t: "Moderadas (20 a 40 s): en la calculadora, tono medio; en el papel clásico, rayas.", ok: true, fb: "Correcto. La intensidad se registra por la duración: menor de 20 s leve, 20 a 40 s moderada, mayor de 40 s fuerte." },
                { t: "Fuertes, porque son dolorosas.", fb: "En el partograma el sombreado se define por la duración, no por el dolor referido. Más de 40 s es fuerte." },
                { t: "Leves: menos de 3 en 10 minutos.", fb: "La frecuencia se marca con el número de casillas; la intensidad, por la duración (30 s = moderada)." }
              ],
              ref: "Sombreado por duración · Bettercare Maternal Care", url: BC
            }
          ]
        },
        {
          min: 240, titulo: "12:00 — Segundo tacto",
          relato: "Tacto: 6 cm, membranas íntegras, II plano. Contracciones 2 en 10 minutos, de 15 segundos. FCF 140 lpm. Signos vitales normales.",
          vit: { fc: 86, pas: 118, pad: 74, t: 36.9, fcf: 140, cu: "2 en 10 min · 15 s", dil: 6 },
          datos: [["Línea de alerta a las 12:00", "8 cm"], ["Curva", "2 cm a la derecha de la alerta"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Dónde está la curva y qué hacés?",
              ops: [
                { t: "A la derecha de la línea de alerta: evaluar causas (dinámica uterina, estática fetal, desproporción) y corregir; si el parto no es inminente, remitir a tiempo.", ok: true, fb: "Correcto. El desvío a la derecha obliga a buscar la causa; aquí la dinámica es insuficiente (2 en 10 min, leves)." },
                { t: "Normal: progresa 0,5 cm/h y la OMS 2020 no usa la regla de 1 cm/h.", fb: "Estás usando el modelo Ministerio CLAP: el desvío a la derecha de la línea de alerta exige evaluar causas y corregir." },
                { t: "Línea de acción: cesárea.", fb: "Todavía no llegó a la línea de acción; está en la zona de alerta." }
              ],
              ref: rM, url: MSPBS
            },
            {
              tipo: "numero", q: "¿Cuántas horas separan la línea de alerta de la línea de acción?", resp: 4, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: 4 horas, el tiempo previsto para la remisión oportuna.", fbMal: "Son 4 horas: el tiempo para corregir o remitir oportunamente.",
              ref: rM, url: MSPBS
            }
          ]
        },
        {
          min: 480, titulo: "16:00 — Tercer tacto",
          relato: "Pese a la corrección, el tacto muestra 7 cm, III plano, moldeamiento +. Contracciones 3 en 10 minutos, de 35 segundos. FCF 144 lpm.",
          vit: { fc: 90, pas: 120, pad: 76, t: 37.0, fcf: 144, cu: "3 en 10 min · 35 s", dil: 7 },
          datos: [["Línea de alerta para 7 cm", "11:00"], ["Línea de acción para 7 cm", "15:00"]],
          preguntas: [
            {
              tipo: "opcion", q: "La curva cruzó la línea de acción. ¿Qué corresponde?",
              ops: [
                { t: "Evaluación final y decisión de la vía de parto más segura.", ok: true, fb: "Correcto. Es la conducta que indica la norma MSPBS al llegar a la línea de acción." },
                { t: "Esperar 4 horas más con la misma conducta.", fb: "Las 4 horas de margen ya se usaron (entre alerta y acción). En la línea de acción se decide la vía." },
                { t: "Iniciar recién ahora el registro de signos vitales.", fb: "El registro se hace desde la apertura. En la línea de acción corresponde la evaluación final." }
              ],
              ref: rM, url: MSPBS
            },
            {
              tipo: "numero", q: "Si llega a dilatación completa, ¿hasta cuántas horas puede durar el expulsivo según la norma?", resp: 2, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: hasta 2 horas.", fbMal: "La norma MSPBS describe un período expulsivo de hasta 2 horas.",
              ref: rM, url: MSPBS
            }
          ]
        },
        {
          min: 540, titulo: "17:00 — Evaluación final",
          relato: "Una hora después, con buena dinámica, el tacto sigue en 7 cm, III plano, moldeamiento ++ y caput. Bolsa rota con líquido claro. Feto estimado de 3900 g. La dilatación no avanzó en 2 tactos y la presentación no desciende.",
          vit: { fc: 94, pas: 122, pad: 78, t: 37.1, fcf: 150, cu: "4 en 10 min · 45 s", dil: 7 },
          datos: [["Curva", "Meseta a la derecha de la línea de acción"], ["Signos de desproporción", "Moldeamiento ++, caput, sin descenso"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Cuál es la conducta?",
              ops: [
                { t: "Detención de la dilatación con signos de desproporción: cesárea segmentaria.", ok: true, fb: "Correcto. La curva quedó a la derecha de la línea de acción, sin progreso y con desproporción céfalo-pélvica: se termina por cesárea." },
                { t: "Aumentar la oxitocina y repetir el tacto en 4 horas.", fb: "Con desproporción y buena dinámica, más oxitocina no corrige el problema y aumenta el riesgo de rotura uterina." },
                { t: "Fórceps para acortar el trabajo de parto.", fb: "El fórceps exige dilatación completa y presentación encajada; acá hay 7 cm y desproporción." }
              ],
              ref: rM, url: MSPBS
            }
          ]
        }
      ],
      fuentes: [
        ["MSPBS — Normas de Cuidados Preconcepcional, Prenatal, Parto, Nacimiento y Puerperio (partograma OPS/OMS-CLAP)", MSPBS],
        ["MSPBS — Protocolo Parto Seguro", PPS],
        ["Bettercare — Maternal Care: registro de contracciones en el partograma", BC]
      ]
    },
    {
      id: "pg2",
      grupo: GRUPO,
      codigo: "parto",
      modo: "parto",
      titulo: "Multípara de 29 años, 39 semanas — Guía OMS 2020",
      tema: "Partograma OMS 2020 (Labour Care Guide)",
      resumen: "Registrá con la guía OMS 2020, reconocé los umbrales de alerta y respondé como indica la guía.",
      escenas: [
        {
          min: 0, titulo: "06:00 — Ingreso en fase activa",
          relato: "Multípara (2 partos vaginales), 39 semanas, bajo riesgo. Tacto: 5 cm, líquido claro. Contracciones 3 en 10 minutos, de 40 segundos. FCF 136 lpm sin desaceleraciones. Está acostada boca arriba.",
          vit: { fc: 80, pas: 112, pad: 70, t: 36.8, fcf: 136, cu: "3 en 10 min · 40 s", dil: 5 },
          datos: [["Paridad", "Multípara"], ["Líquido", "C (claro)"], ["Postura", "SP (supina)"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Abrís la guía OMS 2020 y qué alerta ya tiene?",
              ops: [
                { t: "Sí, con 5 cm se abre; la posición supina (SP) es una alerta del cuidado de apoyo: alentar la movilidad y la postura que elija.", ok: true, fb: "Correcto. La guía comienza a los 5 cm y la postura supina está marcada como alerta." },
                { t: "No: la guía se abre con 4 cm sobre la línea de alerta.", fb: "Eso corresponde al partograma Ministerio CLAP. La guía OMS 2020 se abre a los 5 cm." },
                { t: "Sí, sin alertas: la postura no se registra.", fb: "El cuidado de apoyo (acompañante, alivio del dolor, líquidos orales, postura) forma parte de la guía y la postura supina es alerta." }
              ],
              ref: rL + " · sección cuidado de apoyo", url: LCG
            },
            {
              tipo: "numero", q: "¿Cuántas horas en 5 cm disparan la alerta de progreso?", resp: 6, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: ≥6 h en 5 cm (6 cm ≥5 h · 7 cm ≥3 h · 8 cm ≥2,5 h · 9 cm ≥2 h).", fbMal: "Los umbrales son: 5 cm ≥6 h · 6 cm ≥5 h · 7 cm ≥3 h · 8 cm ≥2,5 h · 9 cm ≥2 h.",
              ref: rL, url: LCG
            }
          ]
        },
        {
          min: 240, titulo: "10:00 — Tacto de las 4 horas",
          relato: "Tacto: 6 cm, líquido claro, posición anterior. Contracciones 3 en 10 minutos, de 45 segundos. FCF 140 lpm. Camina con su acompañante.",
          vit: { fc: 84, pas: 114, pad: 72, t: 36.9, fcf: 140, cu: "3 en 10 min · 45 s", dil: 6 },
          preguntas: [
            {
              tipo: "numero", q: "¿Cada cuántas horas está previsto el tacto vaginal?", resp: 4, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: cada 4 horas en la primera etapa.", fbMal: "La guía prevé la evaluación del cuello y el descenso cada 4 horas.",
              ref: rL + " · frecuencias (manual Jhpiego)", url: JH
            }
          ]
        },
        {
          min: 540, titulo: "15:00 — Sin cambios",
          relato: "Tacto: 6 cm (igual que a las 10:00). FCF basal 150 lpm con desaceleraciones tardías. Líquido claro. Contracciones 2 en 10 minutos.",
          vit: { fc: 92, pas: 118, pad: 76, t: 37.1, fcf: 150, cu: "2 en 10 min · 40 s", dil: 6 },
          datos: [["Tiempo en 6 cm", "5 h"], ["Desaceleraciones", "L (tardías)"], ["Contracciones", "2 en 10 min"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Qué valores están en alerta?",
              ops: [
                { t: "5 h en 6 cm, desaceleraciones tardías y contracciones ≤2 en 10 min.", ok: true, fb: "Correcto. Son tres alertas. La FCF basal de 150 lpm está dentro de 110-159." },
                { t: "Solo la FCF de 150 lpm.", fb: "La alerta de FCF basal es <110 o ≥160. Aquí alertan el tiempo en 6 cm, las desaceleraciones tardías y las contracciones." },
                { t: "Ninguno: la guía no usa la regla de 1 cm/h.", fb: "No usa la regla de 1 cm/h, pero sí umbrales de tiempo por centímetro: 6 cm ≥5 h es alerta." }
              ],
              ref: rL, url: LCG
            },
            {
              tipo: "opcion", q: "¿Cómo respondés a las alertas?",
              ops: [
                { t: "Marcarlas con un círculo, avisar a la obstétrica o médico de mayor experiencia, registrar evaluación y plan, y compartirlo con la mujer.", ok: true, fb: "Correcto. Es la respuesta que define la guía ante cualquier valor en alerta." },
                { t: "Cesárea inmediata.", fb: "La alerta obliga a evaluar y planificar con el profesional de mayor experiencia; la conducta depende de esa evaluación." },
                { t: "Repetir el tacto en 4 horas.", fb: "Con alertas no se espera al próximo control: se avisa, se evalúa y se registra un plan." }
              ],
              ref: rL, url: LCG
            },
            {
              tipo: "opcion", q: "Si las desaceleraciones fueran variables (V), ¿serían alerta?",
              ops: [
                { t: "No: se registran, pero la alerta es solo para las tardías (L).", ok: true, fb: "Correcto." },
                { t: "Sí: toda desaceleración es alerta.", fb: "En la guía OMS 2020 la alerta es para las desaceleraciones tardías (L)." }
              ],
              ref: rL, url: LCG
            }
          ]
        },
        {
          min: 720, titulo: "18:00 — Dilatación completa",
          relato: "Tras la evaluación y el plan acordado, la FCF se normaliza y a las 18:00 llega a 10 cm. Comienza la segunda etapa.",
          vit: { fc: 96, pas: 120, pad: 78, t: 37.0, fcf: 142, cu: "4 en 10 min · 50 s", dil: 10 },
          preguntas: [
            {
              tipo: "numero", q: "En la segunda etapa, ¿cada cuántos minutos auscultás la FCF?", resp: 5, tol: 0, dec: 0, unidad: "min",
              fbOk: "Correcto: cada 5 minutos (contracciones cada 15 minutos).", fbMal: "En la segunda etapa la FCF se registra cada 5 minutos y las contracciones cada 15.",
              ref: rL + " · frecuencias (manual Jhpiego)", url: JH
            },
            {
              tipo: "numero", q: "Es multípara: ¿a partir de cuántas horas de segunda etapa hay alerta?", resp: 2, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: ≥2 h en multípara (≥3 h en nulípara).", fbMal: "El umbral es ≥2 h en multípara y ≥3 h en nulípara.",
              ref: rL, url: LCG
            }
          ]
       },
        {
          min: 790, titulo: "19:10 — Nacimiento",
          relato: "Con pujos espontáneos en posición semisentada, a las 19:10 nace un varón vigoroso de 3300 g, que llora al nacer y se coloca piel a piel.",
          vit: { fc: 100, pas: 118, pad: 76, t: 37.0, fcf: 140, cu: "Nacimiento", dil: 10 },
          preguntas: [
            {
              tipo: "opcion", q: "¿Qué corresponde en el tercer período?",
              ops: [
                { t: "Oxitocina 10 UI IM o IV y pinzamiento del cordón no antes de 1 minuto.", ok: true, fb: "Correcto. La OMS recomienda oxitocina 10 UI para prevenir la hemorragia posparto y el pinzamiento tardío del cordón (no antes de 1 minuto)." },
                { t: "Pinzamiento inmediato del cordón y esperar el alumbramiento sin uterotónico.", fb: "El recién nacido está vigoroso: pinzamiento tardío y uterotónico profiláctico para todas." },
                { t: "Tracción fuerte del cordón antes de que el útero se contraiga.", fb: "La tracción controlada es opcional y solo con útero contraído, por personal entrenado." }
              ],
              ref: "OMS 2018 · Cuidados intraparto (rec. 41-46)", url: "https://www.ncbi.nlm.nih.gov/books/NBK513802/table/executivesummary.tu1/"
            }
          ]
        }
      ],
      fuentes: [
        ["OMS 2020 — WHO Labour Care Guide (formulario)", LCG],
        ["Jhpiego — Labour Care Guide, manual del participante", JH]
      ]
    },
    {
      id: "pg3",
      grupo: GRUPO,
      codigo: "parto",
      modo: "parto",
      titulo: "Nulípara de 31 años, 39 semanas, con epidural — ACOG 2024",
      tema: "Partograma ACOG 2024 (fase activa desde 6 cm)",
      resumen: "Aplicá los criterios de ACOG: cuándo empieza la fase activa, qué exige el diagnóstico de detención y cuánto dura el pujo.",
      escenas: [
        {
          min: 0, titulo: "07:00 — Ingreso",
          relato: "Nulípara de 31 años, 39 semanas, bajo riesgo. Tacto: 5 cm, membranas íntegras, cefálica. Contracciones 3 en 10 minutos, moderadas a la palpación. FCF 140 lpm. Pide analgesia epidural.",
          vit: { fc: 84, pas: 118, pad: 72, t: 36.8, fcf: 140, cu: "3 en 10 min · moderadas", dil: 5, fase: "fase latente (ACOG)" },
          datos: [["Paridad", "Nulípara"], ["Membranas", "Íntegras"], ["Analgesia", "Epidural solicitada"]],
          preguntas: [
            {
              tipo: "opcion", q: "Según ACOG 2024, ¿en qué fase está?",
              ops: [
                { t: "Fase latente: ACOG considera el inicio de la fase activa a los 6 cm y no aplica criterios de fase activa antes.", ok: true, fb: "Correcto. Puede haber un rango entre 4 y 6 cm, pero los estándares de fase activa no se aplican antes de 6 cm." },
                { t: "Fase activa: tiene más de 4 cm.", fb: "Los 4 cm abren el partograma Ministerio CLAP. ACOG ubica el inicio de la fase activa a los 6 cm." },
                { t: "Fase activa: tiene 5 cm.", fb: "Los 5 cm son el inicio de la guía OMS 2020. ACOG usa 6 cm." }
              ],
              ref: rA, url: ACOG
            },
            {
              tipo: "numero", q: "ACOG 2024: ¿a partir de cuántas horas se define fase latente prolongada en nulíparas?", resp: 16, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: más de 16 h. No hay definición de detención de la fase latente: con madre y feto bien, evitar la cesárea por esta causa.", fbMal: "ACOG 2024 la define como más de 16 h en nulíparas y recomienda evitar la cesárea por fase latente prolongada si madre y feto están bien.",
              ref: rA, url: ACOG
            }
          ]
        },
        {
          min: 240, titulo: "11:00 — Fase activa",
          relato: "Con epidural. Tacto: 6 cm. Se realizó amniotomía: líquido claro. Contracciones 4 en 10 minutos, fuertes a la palpación. FCF 138 lpm.",
          vit: { fc: 86, pas: 112, pad: 68, t: 36.9, fcf: 138, cu: "4 en 10 min · fuertes", dil: 6 },
          datos: [["Membranas", "Rotas (amniotomía)"], ["Contracciones", "Fuertes, cada 2-3 min"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Qué exige ACOG para diagnosticar detención de la fase activa?",
              ops: [
                { t: "≥6 cm, membranas rotas y sin cambio cervical pese a 4 h de actividad uterina adecuada, o 6 h de actividad inadecuada con oxitocina.", ok: true, fb: "Correcto. Es la definición de ACOG CPG 8 (2024)." },
                { t: "Progreso menor de 1 cm/h a partir de los 4 cm.", fb: "Ese es el razonamiento de la línea de alerta del partograma Ministerio CLAP. ACOG mide horas sin cambio cervical desde 6 cm." },
                { t: "2 h sin cambio cervical, con membranas íntegras o rotas.", fb: "ACOG exige membranas rotas y 4 h (adecuadas) o 6 h (inadecuadas con oxitocina)." }
              ],
              ref: rA, url: ACOG
            },
            {
              tipo: "opcion", q: "No hay catéter de presión intrauterina. ¿Cómo registrás la dinámica en la calculadora?",
              ops: [
                { t: "Modo «sin catéter, con el contador de contracciones»: número en 10 min e intensidad leve, moderada o fuerte por palpación.", ok: true, fb: "Correcto. El criterio textual de ACOG (UMV >200) requiere catéter; sin catéter se usa una adaptación clínica: contracciones fuertes cada 3 min o menos." },
                { t: "No se puede usar el modelo ACOG sin catéter.", fb: "Se puede, como adaptación clínica citada (FPQC/USF). La calculadora lo aclara en el resultado." }
              ],
              ref: rA + " · adaptación sin catéter FPQC/USF", url: FPQC
            }
          ]
        },
        {
          min: 480, titulo: "15:00 — Sin cambio",
          relato: "Tacto: 6 cm, igual que a las 11:00. Contracciones 2 en 10 minutos, leves a la palpación. FCF 142 lpm, sin desaceleraciones. Signos vitales normales.",
          vit: { fc: 88, pas: 114, pad: 70, t: 37.0, fcf: 142, cu: "2 en 10 min · leves", dil: 6 },
          datos: [["Sin cambio cervical", "4 h"], ["Contracciones", "Inadecuadas"], ["Oxitocina", "No recibe"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Tiene criterio de detención de la fase activa?",
              ops: [
                { t: "No: las contracciones son inadecuadas y no recibe oxitocina; corresponde conducción con oxitocina y reevaluar.", ok: true, fb: "Correcto. Con actividad inadecuada, ACOG cuenta las horas sin cambio después de iniciar oxitocina." },
                { t: "Sí: 4 h sin cambio a 6 cm con membranas rotas; cesárea.", fb: "Las 4 h valen solo con contracciones adecuadas. Aquí son inadecuadas y no recibe oxitocina." },
                { t: "Sí, porque se pasó de la línea de acción.", fb: "ACOG no usa líneas de alerta ni de acción." }
              ],
              ref: rA, url: ACOG
            },
            {
              tipo: "numero", q: "Si inicia oxitocina y las contracciones siguen inadecuadas, ¿cuántas horas sin cambio cervical definen la detención?", resp: 6, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: 6 h de actividad inadecuada con oxitocina.", fbMal: "Son 6 h de actividad uterina inadecuada con oxitocina (4 h si la actividad es adecuada).",
              ref: rA, url: ACOG
            }
          ]
        },
        {
          min: 720, titulo: "19:00 — Dilatación completa",
          relato: "Con oxitocina, las contracciones se hicieron fuertes, cada 2-3 minutos. Progresó a 8 cm a las 17:00 y a 10 cm a las 19:00. Inicia el pujo a las 19:30. FCF 140 lpm.",
          vit: { fc: 96, pas: 120, pad: 76, t: 37.1, fcf: 140, cu: "4-5 en 10 min · fuertes", dil: 10 },
          datos: [["Pujo activo", "Desde las 19:30"], ["Analgesia", "Epidural"]],
          preguntas: [
            {
              tipo: "numero", q: "ACOG 2024: ¿más de cuántas horas de pujo definen segunda etapa prolongada en nulíparas?", resp: 3, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: más de 3 h de pujo en nulíparas (más de 2 h en multíparas).", fbMal: "Son más de 3 h de pujo en nulíparas y más de 2 h en multíparas.",
              ref: rA, url: ACOG
            },
            {
              tipo: "opcion", q: "A las 22:45 lleva 3 h 15 min de pujo, con descenso progresivo y FCF normal. ¿Qué corresponde según ACOG?",
              ops: [
                { t: "Enfoque individualizado: con progreso documentado, epidural y buen estado materno-fetal, puede ser apropiado continuar; discutir riesgos, beneficios y opciones con la paciente.", ok: true, fb: "Correcto. ACOG recomienda individualizar más allá de los umbrales, considerando progreso, factores clínicos y preferencia de la paciente." },
                { t: "Cesárea inmediata: superó las 3 h.", fb: "Superar el umbral define segunda etapa prolongada, pero el diagnóstico de detención se individualiza si hay progreso." },
                { t: "Usar la definición tradicional: con epidural el límite es 3 h y ya terminó.", fb: "La definición tradicional ya no es la vigente; ACOG 2024 propone individualizar." }
              ],
              ref: rA, url: ACOG
            }
          ]
        }
      ],
      fuentes: [
        ["ACOG — Clinical Practice Guideline No. 8: First and Second Stage Labor Management (2024)", ACOG],
        ["FPQC/USF PROVIDE — evaluación de contracciones sin catéter", FPQC]
      ]
    }
  );
})();
