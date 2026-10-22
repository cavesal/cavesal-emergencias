/* CaVeSal® Simulador — Trabajo de parto de bajo riesgo.
 * Base única: OMS 2018, "WHO recommendations: intrapartum care for a positive childbirth experience" (56 recomendaciones).
 * Cada `ref` indica el número de recomendación. Casos ficticios con fines de entrenamiento. */
(function () {
  var OMS = "https://www.ncbi.nlm.nih.gov/books/NBK513802/table/executivesummary.tu1/";
  var OMSpdf = "https://iris.who.int/bitstream/handle/10665/260178/9789241550215-eng.pdf";
  var r = function (n) { return "OMS 2018 · Cuidados intraparto, recomendación " + n; };
  var GRUPO = "Trabajo de parto (OMS 2018)";
  var FUENTES = [
    ["OMS 2018 · WHO recommendations: intrapartum care for a positive childbirth experience — lista de las 56 recomendaciones", OMS],
    ["OMS 2018 · Texto completo de la guía (observaciones de cada recomendación)", OMSpdf]
  ];

  window.SIM_CASOS = window.SIM_CASOS || [];
  window.SIM_CASOS.push(
    {
      id: "parto1",
      grupo: GRUPO,
      codigo: "parto",
      modo: "parto",
      titulo: "Nulípara de 24 años, 39 semanas, inicio espontáneo",
      tema: "Primer período del parto",
      resumen: "Embarazo de bajo riesgo. Desde el ingreso hasta la fase activa: ¿sabés cuándo no intervenir?",
      escenas: [
        {
          min: 0, titulo: "Ingreso a la maternidad",
          relato: "Nulípara de 24 años, 39 semanas, embarazo controlado y de bajo riesgo. Contracciones dolorosas desde hace 6 horas. Al tacto: 3 cm, borramiento del 60 %, membranas íntegras, presentación cefálica.",
          vit: { fc: 84, pas: 118, pad: 74, t: 36.8, fcf: 140, cu: "2 en 10 min", dil: 3 },
          datos: [["Paridad", "Nulípara"], ["Membranas", "Íntegras"], ["Acompañante", "Su pareja, en la sala de espera"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿En qué etapa del trabajo de parto está?",
              ops: [
                { t: "Primer período, fase latente.", ok: true, fb: "Correcto. La OMS define la fase latente hasta los 5 cm, tanto en el primer parto como en los siguientes." },
                { t: "Primer período, fase activa: ya tiene más de 3 cm.", fb: "Para la OMS la fase activa empieza a los 5 cm. Con 3 cm sigue en fase latente." },
                { t: "Trabajo de parto prolongado: lleva 6 horas con contracciones.", fb: "La OMS aclara que la duración de la fase latente no está establecida y varía mucho entre mujeres. Seis horas no definen un parto prolongado." }
              ],
              ref: r("5 y 6"), url: OMS
            },
            {
              tipo: "opcion", q: "¿Cómo evaluás el bienestar fetal al ingreso?",
              ops: [
                { t: "Auscultación con Doppler o estetoscopio de Pinard.", ok: true, fb: "Correcto. Es lo que recomienda la OMS para el ingreso de una embarazada sana en trabajo de parto espontáneo." },
                { t: "Cardiotocografía de ingreso de rutina.", fb: "La OMS no recomienda la cardiotocografía de rutina al ingreso en embarazadas sanas con trabajo de parto espontáneo." },
                { t: "Monitoreo cardiotocográfico continuo desde el ingreso.", fb: "La OMS no recomienda la cardiotocografía continua en embarazadas sanas con trabajo de parto espontáneo." }
              ],
              ref: r("12, 13 y 17"), url: OMS
            },
            {
              tipo: "opcion", q: "¿Qué indicaciones das al ingreso?",
              ops: [
                { t: "Acompañante de su elección, líquidos y alimentos por boca, y libertad para moverse y estar en posición vertical.", ok: true, fb: "Correcto. La OMS recomienda el acompañante de elección, la ingesta oral en mujeres de bajo riesgo y alentar la movilidad y la posición vertical." },
                { t: "Pelvimetría clínica, rasurado perineal y enema.", fb: "La OMS no recomienda ninguna de las tres de rutina: ni la pelvimetría clínica al ingreso, ni el rasurado, ni el enema." },
                { t: "Ayuno y suero IV para acortar el trabajo de parto.", fb: "La OMS recomienda la ingesta oral en mujeres de bajo riesgo y no recomienda los líquidos IV con el fin de acortar el parto." }
              ],
              ref: r("3, 11, 14, 15, 24, 25 y 32"), url: OMS
            }
          ]
        },
        {
          min: 300, titulo: "Cinco horas después",
          relato: "Contracciones de 2 a 3 en 10 minutos. Al tacto: 4 cm. La paciente camina con su pareja y tolera líquidos. Pregunta si el parto «se trabó».",
          vit: { fc: 86, pas: 116, pad: 72, t: 36.9, fcf: 138, cu: "2-3 en 10 min", dil: 4 },
          preguntas: [
            {
              tipo: "opcion", q: "Progresó 1 cm en 5 horas. ¿Qué hacés?",
              ops: [
                { t: "Conducta expectante: antes de los 5 cm no se acelera el parto si la madre y el feto están bien.", ok: true, fb: "Correcto. El parto puede no acelerarse hasta los 5 cm. La OMS no recomienda oxitocina ni cesárea para acelerarlo antes de ese umbral si las condiciones maternas y fetales son tranquilizadoras." },
                { t: "Oxitocina para acelerar el parto.", fb: "Antes de los 5 cm, con madre y feto bien, la OMS no recomienda intervenciones para acelerar el parto, como la oxitocina." },
                { t: "Amniotomía para prevenir la demora.", fb: "La OMS no recomienda la amniotomía sola para prevenir la demora del trabajo de parto." }
              ],
              ref: r("9 y 28"), url: OMS
            }
          ]
        },
        {
          min: 480, titulo: "Fase activa",
          relato: "Contracciones de 3 en 10 minutos, de 40 segundos. Al tacto: 6 cm. Refiere mucho dolor y pide alivio.",
          vit: { fc: 92, pas: 122, pad: 76, t: 37.0, fcf: 142, cu: "3 en 10 min", dil: 6 },
          preguntas: [
            {
              tipo: "opcion", q: "Pide alivio del dolor. ¿Qué le ofrecés?",
              ops: [
                { t: "Las opciones según su preferencia: técnicas de relajación, masaje o calor local, opioides parenterales o epidural.", ok: true, fb: "Correcto. La OMS recomienda todas estas opciones para la embarazada sana que pide alivio del dolor, según su preferencia." },
                { t: "Esperar a la dilatación completa para no frenar el parto.", fb: "La OMS recomienda la epidural y las demás opciones cuando la mujer sana pide alivio del dolor; no hace falta esperar a la dilatación completa." },
                { t: "Opioides de rutina a todas las parturientas.", fb: "La analgesia se ofrece según la preferencia de cada mujer, no de rutina." }
              ],
              ref: r("19 a 22"), url: OMS
            },
            {
              tipo: "numero", q: "En fase activa, ¿cada cuántos minutos, como máximo, auscultás la FCF?", resp: 30, tol: 0, dec: 0, unidad: "min",
              fbOk: "Correcto: cada 15 a 30 minutos en fase activa, durante una contracción y hasta 30 segundos después, al menos 1 minuto.",
              fbMal: "En fase activa se ausculta cada 15 a 30 minutos, durante una contracción y hasta 30 segundos después, al menos 1 minuto.",
              ref: r("18") + " (observaciones)", url: OMSpdf
            },
            {
              tipo: "numero", q: "¿Cada cuántas horas indicás el tacto vaginal de rutina en fase activa?", resp: 4, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: cada 4 horas en mujeres de bajo riesgo.",
              fbMal: "La OMS recomienda el tacto vaginal cada 4 horas para evaluar la fase activa en mujeres de bajo riesgo.",
              ref: r("16"), url: OMS
            }
          ]
        },
        {
          min: 720, titulo: "Cuatro horas después",
          relato: "Con epidural, bien analgesiada. Contracciones de 3 en 10 minutos. Al tacto: 7 cm. En la última auscultación, la FCF fue de 104 lpm después de una contracción.",
          vit: { fc: 88, pas: 114, pad: 70, t: 37.1, fcf: 104, cu: "3 en 10 min", dil: 7 },
          preguntas: [
            {
              tipo: "opcion", q: "FCF de 104 lpm en la auscultación. ¿Qué hacés primero?",
              ops: [
                { t: "Prolongar la auscultación hasta cubrir al menos tres contracciones.", ok: true, fb: "Correcto. Si la FCF no está siempre entre 110 y 160 lpm, la OMS indica prolongar la auscultación hasta cubrir al menos tres contracciones." },
                { t: "Registrarla y volver a auscultar en 30 minutos.", fb: "Una FCF fuera de 110-160 lpm no se deja para el próximo control: la auscultación se prolonga hasta cubrir al menos tres contracciones." },
                { t: "Cesárea inmediata.", fb: "Primero hay que confirmar el hallazgo: la OMS indica prolongar la auscultación hasta cubrir al menos tres contracciones." }
              ],
              ref: r("18") + " (observaciones)", url: OMSpdf
            },
            {
              tipo: "opcion", q: "La FCF se normaliza (140 lpm). Avanzó de 6 a 7 cm en 4 horas. ¿Qué hacés?",
              ops: [
                { t: "Seguir vigilando: una dilatación menor de 1 cm/h, por sí sola, no indica intervenir.", ok: true, fb: "Correcto. La OMS considera que 1 cm/h es irrealmente rápido para algunas mujeres y que, por sí solo, no es indicación de intervención. La fase activa suele no superar las 12 h en el primer parto." },
                { t: "Oxitocina, porque tiene epidural y eso frena el parto.", fb: "La OMS no recomienda la oxitocina para prevenir la demora en mujeres con epidural." },
                { t: "Cesárea por falta de progreso, porque cruzó la línea de alerta de 1 cm/h.", fb: "La OMS no recomienda usar la línea de alerta de 1 cm/h para identificar riesgo ni como indicación de intervención por sí sola." }
              ],
              ref: r("6, 7, 8 y 30"), url: OMS
            }
          ]
        }
      ],
      fuentes: FUENTES
    },
    {
      id: "parto2",
      grupo: GRUPO,
      codigo: "parto",
      modo: "parto",
      titulo: "Multípara de 30 años con epidural, dilatación completa",
      tema: "Segundo y tercer período del parto",
      resumen: "Del período expulsivo al alumbramiento y la primera hora: pujo, posición, periné, uterotónico y cordón.",
      escenas: [
        {
          min: 0, titulo: "Dilatación completa",
          relato: "Multípara de 30 años (dos partos vaginales), 38 semanas, bajo riesgo. Con epidural. Dilatación completa, todavía sin ganas de pujar. Presentación cefálica.",
          vit: { fc: 90, pas: 120, pad: 74, t: 37.0, fcf: 136, cu: "4 en 10 min", dil: 10 },
          datos: [["Paridad", "2 partos vaginales"], ["Analgesia", "Epidural"], ["Pujo", "Sin sensación de pujo"]],
          preguntas: [
            {
              tipo: "opcion", q: "Tiene dilatación completa pero no siente ganas de pujar. ¿Qué indicás?",
              ops: [
                { t: "Diferir el pujo 1 a 2 horas, o hasta que recupere la sensación de pujo.", ok: true, fb: "Correcto. La OMS lo recomienda en mujeres con epidural, donde se pueda prolongar la estadía en el segundo período y vigilar y manejar la hipoxia perinatal." },
                { t: "Pujo dirigido de inmediato en posición de litotomía.", fb: "Con epidural, la OMS recomienda diferir el pujo 1 a 2 horas o hasta que recupere la sensación, y alentar la posición que ella elija." },
                { t: "Presión manual en el fondo uterino para acortar el expulsivo.", fb: "La OMS no recomienda la presión fúndica manual en el segundo período." }
              ],
              ref: r("37 y 40"), url: OMS
            },
            {
              tipo: "numero", q: "En partos siguientes al primero, ¿dentro de cuántas horas suele completarse el segundo período?", resp: 2, tol: 0, dec: 0, unidad: "h",
              fbOk: "Correcto: suele completarse dentro de 2 horas en partos siguientes y dentro de 3 horas en el primer parto.",
              fbMal: "Suele completarse dentro de 2 horas en partos siguientes y dentro de 3 horas en el primer parto.",
              ref: r("33"), url: OMS
            }
          ]
        },
        {
          min: 70, titulo: "Período expulsivo",
          relato: "Recuperó la sensación de pujo. Puja con cada contracción y la cabeza desciende. Prefiere estar de costado o semisentada.",
          vit: { fc: 98, pas: 124, pad: 78, t: 37.1, fcf: 132, cu: "4-5 en 10 min", dil: 10 },
          preguntas: [
            {
              tipo: "numero", q: "En el segundo período, ¿cada cuántos minutos auscultás la FCF?", resp: 5, tol: 0, dec: 0, unidad: "min",
              fbOk: "Correcto: cada 5 minutos en el segundo período.",
              fbMal: "En el segundo período se ausculta cada 5 minutos.",
              ref: r("18") + " (observaciones)", url: OMSpdf
            },
            {
              tipo: "opcion", q: "¿Cómo acompañás el pujo y la posición?",
              ops: [
                { t: "Que puje según sus propias ganas, en la posición que elija, incluidas las verticales.", ok: true, fb: "Correcto. La OMS recomienda alentar la posición que la mujer elija, aunque tenga epidural, y que siga sus propias ganas de pujar." },
                { t: "Pujo dirigido con respiración contenida y en litotomía, para acortar el expulsivo.", fb: "La OMS recomienda que la mujer siga sus propias ganas de pujar y elija su posición, incluidas las verticales." },
                { t: "Que se acueste boca arriba porque tiene epidural.", fb: "La OMS recomienda alentar la posición que la mujer elija también en mujeres con epidural." }
              ],
              ref: r("34, 35 y 36"), url: OMS
            }
          ]
        },
        {
          min: 95, titulo: "Coronación",
          relato: "La cabeza corona. El periné está distendido y no hay compromiso fetal.",
          vit: { fc: 102, pas: 126, pad: 80, t: 37.1, fcf: 128, cu: "5 en 10 min", dil: 10 },
          preguntas: [
            {
              tipo: "opcion", q: "¿Cómo protegés el periné?",
              ops: [
                { t: "Masaje perineal, compresas tibias y protección manual del periné, según su preferencia.", ok: true, fb: "Correcto. La OMS recomienda estas técnicas para reducir el trauma perineal y facilitar el parto espontáneo." },
                { t: "Episiotomía de rutina para evitar un desgarro.", fb: "La OMS no recomienda la episiotomía de rutina o liberal en el parto vaginal espontáneo." },
                { t: "Presión fúndica para que salga más rápido y se distienda menos.", fb: "La OMS no recomienda la presión fúndica manual en el segundo período." }
              ],
              ref: r("38, 39 y 40"), url: OMS
            }
          ]
        },
        {
          min: 97, titulo: "Nacimiento",
          relato: "Nace un varón vigoroso, que llora de inmediato. Líquido amniótico claro. Lo colocás sobre el abdomen de la madre.",
          vit: { fc: 100, pas: 122, pad: 78, t: 37.0, fcf: null, cu: "—", dil: 10 },
          datos: [["Recién nacido", "Vigoroso, llora"], ["Líquido amniótico", "Claro"]],
          preguntas: [
            {
              tipo: "opcion", q: "¿Qué hacés en el tercer período y con el recién nacido?",
              ops: [
                { t: "Uterotónico, pinzamiento del cordón no antes de 1 minuto y contacto piel a piel.", ok: true, fb: "Correcto. La OMS recomienda el uterotónico en todos los partos, el pinzamiento tardío (no antes de 1 minuto) y el contacto piel a piel durante la primera hora." },
                { t: "Pinzamiento inmediato y aspiración de boca y nariz.", fb: "La OMS recomienda el pinzamiento no antes de 1 minuto y no aspirar boca ni nariz si el líquido es claro y el recién nacido respira solo." },
                { t: "Masaje uterino sostenido en lugar del uterotónico.", fb: "La OMS recomienda el uterotónico en todos los partos. El masaje uterino sostenido no se recomienda para prevenir la hemorragia si ya recibió oxitocina." }
              ],
              ref: r("41, 44, 46, 47 y 48"), url: OMS
            },
            {
              tipo: "numero", q: "Oxitocina para prevenir la hemorragia posparto: ¿cuántas UI, IM o IV?", resp: 10, tol: 0, dec: 0, unidad: "UI",
              fbOk: "Correcto: 10 UI IM o IV es el uterotónico recomendado.",
              fbMal: "La OMS recomienda oxitocina 10 UI IM o IV.",
              ref: r("42"), url: OMS
            }
          ]
        },
        {
          min: 160, titulo: "Primera hora posparto",
          relato: "Alumbramiento completo. Útero contraído. Sangrado escaso. El recién nacido está en contacto piel a piel e inicia la lactancia.",
          vit: { fc: 88, pas: 118, pad: 74, t: 36.9, fcf: null, cu: "—", dil: null },
          preguntas: [
            {
              tipo: "opcion", q: "¿Qué indicás para las próximas horas?",
              ops: [
                { t: "Controlar con regularidad el sangrado, el tono uterino, la altura uterina, la temperatura y el pulso durante 24 h, y la PA poco después del parto.", ok: true, fb: "Correcto. La OMS recomienda evaluar el tono uterino en todas las mujeres y estos controles durante las primeras 24 horas, desde la primera hora." },
                { t: "Antibiótico profiláctico de rutina por tratarse de un parto vaginal.", fb: "La OMS no recomienda el antibiótico profiláctico de rutina en el parto vaginal sin complicaciones." },
                { t: "Alta a las 6 horas si todo está bien.", fb: "Tras un parto vaginal sin complicaciones en una institución, la OMS recomienda que madre y recién nacido permanezcan al menos 24 horas." }
              ],
              ref: r("52, 53, 55 y 56"), url: OMS
            },
            {
              tipo: "numero", q: "Vitamina K al recién nacido: ¿cuántos mg IM?", resp: 1, tol: 0, dec: 0, unidad: "mg",
              fbOk: "Correcto: 1 mg IM, después de la primera hora de contacto piel a piel y del inicio de la lactancia.",
              fbMal: "Se indica 1 mg IM, después de la primera hora de contacto piel a piel y del inicio de la lactancia.",
              ref: r("50"), url: OMS
            }
          ]
        }
      ],
      fuentes: FUENTES
    }
  );
})();
