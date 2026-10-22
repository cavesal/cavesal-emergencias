/* CaVeSal® Simulador — Escala de Alerta Obstétrica.
 * Caso 1: EAPO MSPBS 2025/2022 (hoja 2025; huecos completados con la Guía Código Rojo 2ª ed. 2022).
 * Caso 2: Alerta Obstétrica CaVeSal® (EAPO 2025 + Score MAMÁ 2025, gana el peor color).
 * Casos ficticios con fines de entrenamiento. */
(function () {
  var GR = "guia.html#tab-rojo", GA = "guia.html#tab-ambar";
  var EAPO25 = "https://www.mspbs.gov.py/dependencias/portal/adjunto/27dd99-EscaladeAlertaPrecozObsttrica.pdf";
  var MAMA = "https://www.hgdc.gob.ec/wp-content/uploads/2025/11/PROTOCOLO-MSP-SCORE-MAMA-Y-CLAVES-OBSTETRICAS-2025.pdf";
  var GUIA = "https://www.mspbs.gov.py/portal/25907/lanzan-herramientas-para-mejorar-efectividad-en-la-atencion-de-la-salud-materna-y-neonatal.html";
  var R23 = "Guías CaVeSal · Código Rojo, tarjeta 23 (EAPO MSPBS 2025/2022)";
  var GRUPO = "Escala de Alerta Obstétrica";

  window.SIM_CASOS = window.SIM_CASOS || [];
  window.SIM_CASOS.push(
    {
      id: "eapo1",
      grupo: GRUPO,
      codigo: "alerta",
      titulo: "Puérpera de 27 años, parto vaginal",
      tema: "EAPO MSPBS 2025/2022: controles seriados y hora de oro",
      resumen: "Controles de rutina en el posparto inmediato. ¿Leés bien el color en cada control y sabés cuándo repetirlo?",
      escenas: [
        {
          min: 0, titulo: "Control a los 30 min del parto",
          relato: "Puérpera de 27 años, G2P2, parto vaginal hace 30 minutos, alumbramiento completo. Está tranquila. Al revisar la compresa se ve sangrado manchado. Orinó antes del parto.",
          vit: { fc: 92, pas: 118, pad: 72, fr: 18, sat: 98, satNota: "aire ambiente", t: 36.8, mental: "Alerta · aspecto normal · sangrado manchado" },
          preguntas: [
            {
              tipo: "opcion", q: "Con la EAPO 2025/2022, ¿de qué color es este control?",
              ops: [
                { t: "Amarillo: el sangrado manchado es un parámetro amarillo.", ok: true, fb: "Correcto. Todos los signos vitales están en verde, pero el sangrado manchado es amarillo, y en la EAPO gana el peor color." },
                { t: "Verde: los signos vitales son normales.", fb: "La EAPO no mira solo los signos vitales: tiene 15 parámetros y gana el peor. El sangrado manchado es amarillo." },
                { t: "Rojo: todo sangrado posparto activa la emergencia.", fb: "El sangrado abundante es rojo; el manchado es amarillo." }
              ],
              ref: R23, url: GR
            },
            {
              tipo: "opcion", q: "¿Cuándo repetís el control?",
              ops: [
                { t: "En 20 a 30 minutos.", ok: true, fb: "Correcto. La guía del MSPBS indica controles cada 20-30 min en amarillo, cada 5-10 min en rojo y cada 1-2 h en verde." },
                { t: "En 2 horas.", fb: "Cada 1-2 h es para el verde. En amarillo es cada 20-30 min." },
                { t: "En 4 horas, como el Score MAMÁ con 0-1 punto.", fb: "Con la EAPO, el amarillo se controla cada 20-30 min." }
              ],
              ref: "MSPBS · Guía Código Rojo 2ª ed. 2022 (controles por color)", url: GUIA
            }
          ]
        },
        {
          min: 25, titulo: "Segundo control",
          relato: "A los 25 minutos la paciente está sudorosa. La compresa está empapada y hay coágulos en la cama.",
          vit: { fc: 108, pas: 96, pad: 60, fr: 21, sat: 97, satNota: "aire ambiente", t: 36.5, mental: "Alerta · sudorosa · sangrado abundante" },
          preguntas: [
            {
              tipo: "opcion", q: "¿De qué color es ahora y por qué?",
              ops: [
                { t: "Rojo: FC ≥100 y sangrado abundante son parámetros rojos.", ok: true, fb: "Correcto. FC 108 y sangrado abundante son rojos. PAS 96 (99-71), FR 21 (20-21) y sudorosa son amarillos. Basta un rojo." },
                { t: "Amarillo: la PAS sigue por encima de 90.", fb: "PAS 96 es amarilla, pero FC ≥100 y sangrado abundante ya son rojos. No hay que esperar la hipotensión." },
                { t: "Amarillo: hay que sumar los parámetros alterados.", fb: "La EAPO no suma puntos: un solo parámetro rojo define el rojo." }
              ],
              ref: R23, url: GR
            },
            {
              tipo: "numero", q: "Calculá el índice de choque (FC / PAS).", resp: 1.13, tol: 0.03, dec: 2,
              fbOk: "Correcto: 108 / 96 = 1,13. Un índice >0,9 es un marcador de severidad.",
              fbMal: "El índice de choque es 108 / 96 = 1,13 (>0,9: marcador de severidad).",
              ref: "Guías CaVeSal · Índice de choque (umbrales 0,9 / 1,4 / 1,7)", url: GR
            },
            {
              tipo: "opcion", q: "¿Qué hacés?",
              ops: [
                { t: "Emergencia obstétrica por hemorragia: activar el Código Rojo, minuto 0 de la hora de oro y controles cada 5-10 min.", ok: true, fb: "Correcto. El rojo activa la emergencia obstétrica; la causa (hemorragia) define el código. Desde ahí, controles cada 5-10 min." },
                { t: "Masaje uterino y nuevo control en 30 minutos.", fb: "En rojo, el control es cada 5-10 min y se activa el equipo. Esperar 30 min consume la mitad de la hora de oro." },
                { t: "Esperar el hematocrito para confirmar la pérdida.", fb: "El hematocrito tarda horas en reflejar la pérdida. La decisión es clínica y ahora." }
              ],
              peor: { fc: 6, pas: -6 },
              ref: R23, url: GR
            }
          ]
        },
        {
          min: 45, titulo: "Minuto 20 de la hora de oro",
          relato: "El equipo está trabajando: dos vías, uterotónicos, ácido tranexámico y masaje uterino. Pasaron 20 minutos desde la activación.",
          vit: { fc: 104, pas: 100, pad: 64, fr: 20, sat: 98, satNota: "O₂ por máscara", t: 36.4, mental: "Alerta · pálida · sangrado manchado" },
          preguntas: [
            {
              tipo: "opcion", q: "Según la guía del MSPBS, si a los 20 minutos de iniciada la hemorragia no se hubiera hecho ninguna acción compensatoria, ¿qué sobrevida tendría?",
              ops: [
                { t: "Alrededor del 60 %.", ok: true, fb: "Correcto. La guía indica que baja al 60 %, y que pasados 40-60 min se asume CID con sobrevida menor al 20 %." },
                { t: "Más del 90 %: el choque recién empieza.", fb: "La respuesta compensatoria dura unos 20-30 minutos. Sin acciones, a los 20 min la sobrevida ya baja al 60 %." },
                { t: "Menos del 20 %.", fb: "Menos del 20 % corresponde a 40-60 min sin control, cuando ya se asume CID." }
              ],
              ref: "MSPBS · Guía Código Rojo 2ª ed. 2022, pág. 34", url: GUIA
            },
            {
              tipo: "opcion", q: "¿De qué color es este control?",
              ops: [
                { t: "Rojo: sigue con FC ≥100 y está pálida.", ok: true, fb: "Correcto. FC 104 y aspecto pálido siguen en rojo, aunque el sangrado bajó a manchado. Se mantienen los controles cada 5-10 min." },
                { t: "Amarillo: el sangrado ya es manchado.", fb: "El sangrado mejoró, pero la FC ≥100 y la palidez siguen en rojo. Gana el peor color." },
                { t: "Verde: la PAS llegó a 100.", fb: "PAS 100 es verde, pero hay otros parámetros en rojo." }
              ],
              ref: R23, url: GR
            }
          ]
        },
        {
          min: 75, titulo: "Minuto 50: respuesta al tratamiento",
          relato: "El útero está contraído. El sangrado es escaso. La paciente recuperó el color y conversa.",
          vit: { fc: 88, pas: 112, pad: 70, fr: 18, sat: 98, satNota: "aire ambiente", t: 36.6, mental: "Alerta · aspecto normal · sangrado manchado" },
          preguntas: [
            {
              tipo: "opcion", q: "¿Cómo seguís?",
              ops: [
                { t: "Amarillo (sangrado manchado): controles cada 20-30 min y registrar la tendencia.", ok: true, fb: "Correcto. Pasó de rojo a amarillo: mejora. Se sigue registrando la EAPO en cada control hasta que se estabilice." },
                { t: "Verde: alta a sala con control en 4 horas.", fb: "Con sangrado manchado sigue en amarillo, con controles cada 20-30 min." },
                { t: "Rojo: hay que seguir controlando cada 5 minutos por 24 horas.", fb: "Ya no hay parámetros rojos. El amarillo se controla cada 20-30 min." }
              ],
              ref: R23, url: GR
            }
          ]
        }
      ],
      fuentes: [
        ["MSPBS Paraguay · Escala de Alerta Precoz Obstétrica (hoja 2025)", EAPO25],
        ["MSPBS Paraguay · Guía de Código Rojo Materno Neonatal, 2ª ed. 2022 (controles por color y sobrevida, pág. 34)", GUIA],
        [R23, GR]
      ]
    },

    {
      id: "alerta1",
      grupo: GRUPO,
      codigo: "alerta",
      titulo: "Puérpera de 34 años, cesárea por preeclampsia",
      tema: "Alerta Obstétrica CaVeSal®: EAPO 2025 + Score MAMÁ",
      resumen: "Seis horas después de la cesárea, la EAPO da amarillo. ¿Qué agrega el Score MAMÁ?",
      escenas: [
        {
          min: 0, titulo: "Control a las 6 h de la cesárea",
          relato: "Puérpera de 34 años, cesárea por preeclampsia con criterios de severidad. Recibe sulfato de magnesio. Lleva máscara de oxígeno desde hace una hora porque «saturaba bajo». Diuresis por sonda: 25 mL/h. Proteinuria ++. Sin cefalea ni alteraciones visuales.",
          vit: { fc: 96, pas: 145, pad: 92, fr: 20, sat: 96, satNota: "máscara de O₂", t: 37.2, mental: "Alerta · aspecto normal · sangrado escaso" },
          preguntas: [
            {
              tipo: "opcion", q: "Con la EAPO 2025/2022, ¿de qué color es?",
              ops: [
                { t: "Amarillo: FR 20, PAS 145 y PAD 92 son amarillos.", ok: true, fb: "Correcto. FR 20-21, PAS 140-159 (fila completada con la versión 2022) y PAD 90-109 son amarillos. SpO₂ 96 % es verde y la proteinuria ++ es verde en la EAPO." },
                { t: "Rojo: la proteinuria ++ es roja.", fb: "En la EAPO del MSPBS, + / ++ es verde y +++ es rojo." },
                { t: "Verde: la saturación es normal.", fb: "La saturación es verde, pero FR, PAS y PAD están en amarillo." }
              ],
              ref: R23, url: GR
            },
            {
              tipo: "numero", q: "Calculá el Score MAMÁ (temperatura, PAS, PAD, FC, FR, SpO₂, oxigenoterapia, conciencia y gasto urinario).", resp: 7, tol: 0, dec: 0, unidad: "puntos",
              fbOk: "Correcto: PAS 145 = 1 · PAD 92 = 1 · máscara de O₂ = 3 · gasto urinario 25 mL/h = 2 · el resto 0. Total 7.",
              fbMal: "Son 7 puntos: PAS 145 = 1 · PAD 92 = 1 · máscara de O₂ = 3 · gasto urinario 25 mL/h (≤30) = 2 · T, FC, FR, SpO₂ y conciencia = 0.",
              ref: "Guías CaVeSal · Código Amarillo, tarjeta 8 (Score MAMÁ 2025)", url: GA
            },
            {
              tipo: "opcion", q: "¿Qué color da la Alerta Obstétrica CaVeSal®?",
              ops: [
                { t: "Rojo: el Score MAMÁ es ≥5 y tiene una variable en 3; gana el peor color.", ok: true, fb: "Correcto. EAPO amarillo y Score MAMÁ rojo: gana el rojo. Una SpO₂ «normal» con máscara no es normal: esta paciente necesita oxígeno para saturar 96 %." },
                { t: "Amarillo: la EAPO es la escala oficial y manda.", fb: "En el modo híbrido gana el peor color de las dos escalas. Acá el Score MAMÁ detecta lo que la EAPO no mide: la oxigenoterapia y el gasto urinario." },
                { t: "Naranja: el promedio de las dos escalas.", fb: "No se promedia: gana el peor color." }
              ],
              ref: R23 + " · Alerta Obstétrica CaVeSal®", url: GR
            }
          ]
        },
        {
          min: 10, titulo: "Control a los 10 minutos",
          relato: "Refiere falta de aire. Se auscultan crepitantes en ambas bases.",
          vit: { fc: 112, pas: 150, pad: 96, fr: 26, sat: 92, satNota: "máscara de O₂", t: 37.3, mental: "Alerta · sudorosa" },
          preguntas: [
            {
              tipo: "opcion", q: "¿Qué hacés?",
              ops: [
                { t: "Emergencia obstétrica: activar el equipo, encuadrar la causa (trastorno hipertensivo con compromiso respiratorio → THAE) y controlar cada 5-10 min.", ok: true, fb: "Correcto. Ahora también la EAPO está en rojo (FR ≥22, SpO₂ <95, FC ≥100). La causa define el código: es hipertensiva, no hemorrágica." },
                { t: "Activar el Código Rojo de hemorragia.", fb: "No hay sangrado. El Código Rojo queda para la hemorragia; acá la causa es hipertensiva con compromiso respiratorio." },
                { t: "Repetir el Score MAMÁ en 30 minutos, como indica el protocolo.", fb: "En el modo híbrido los intervalos son los de la EAPO: en rojo, cada 5-10 min." }
              ],
              ref: R23, url: GR
            }
          ]
        },
        {
          min: 45, titulo: "Control a los 45 minutos",
          relato: "Mejoró con el tratamiento. Pasó a cánula nasal. Diuresis 40 mL/h.",
          vit: { fc: 94, pas: 138, pad: 86, fr: 19, sat: 97, satNota: "cánula nasal", t: 37.0, mental: "Alerta · aspecto normal" },
          preguntas: [
            {
              tipo: "opcion", q: "¿Qué color da la Alerta Obstétrica CaVeSal® y cada cuánto controlás?",
              ops: [
                { t: "Amarillo: EAPO verde, pero el Score MAMÁ da 2 por la cánula nasal. Control cada 20-30 min.", ok: true, fb: "Correcto. Todos los parámetros de la EAPO están en verde. El Score MAMÁ suma 2 (cánula nasal) = amarillo. Gana el amarillo, con intervalos de la EAPO." },
                { t: "Verde: la EAPO está toda en verde. Control en 1-2 h.", fb: "La EAPO está en verde, pero el Score MAMÁ suma 2 por la cánula nasal. En el modo híbrido gana el amarillo." },
                { t: "Rojo: sigue con oxígeno.", fb: "La cánula nasal suma 2 (no 3). Con 2 puntos y sin variables en 3, el Score MAMÁ es amarillo." }
              ],
              ref: R23 + " · Score MAMÁ 2025", url: GR
            }
          ]
        }
      ],
      fuentes: [
        ["MSPBS Paraguay · Escala de Alerta Precoz Obstétrica (hoja 2025)", EAPO25],
        ["MSP Ecuador · Protocolo Score MAMÁ y Claves Obstétricas 2025", MAMA],
        ["MSPBS Paraguay · Guía de Código Rojo Materno Neonatal, 2ª ed. 2022", GUIA],
        ["Guías CaVeSal · Código Amarillo, tarjeta 8 (Score MAMÁ 2025)", GA],
        [R23, GR]
      ]
    }
  );
})();
