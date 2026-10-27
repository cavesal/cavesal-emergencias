/* CaVeSal® Simulador — Código Azul Obstétrico (RCP materna).
 * Caso ficticio con fines de entrenamiento. Secuencia según la Guía CaVeSal (Código Azul) y AHA 2020. */
(function () {
  var GZ = "guia.html#tab-azuloscuro";
  var AHA = "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000916";
  var RZ = "Guías CaVeSal · Código Azul Obstétrico (RCP)";
  window.SIM_CASOS = window.SIM_CASOS || [];
  window.SIM_CASOS.push({
    id: "azul1",
    grupo: "Código Azul Obstétrico (RCP)",
    codigo: "rcp",
    titulo: "Gestante de 32 semanas con preeclampsia en sulfato de magnesio",
    tema: "Paro cardiorrespiratorio materno: CABD, desplazamiento uterino y cesárea perimortem",
    resumen: "Paciente internada con preeclampsia grave que deja de responder. ¿Activás a tiempo, hacés RCP de calidad y decidís la cesárea perimortem en el minuto correcto?",
    escenas: [
      {
        min: 0, titulo: "La paciente no responde",
        relato: "Gestante de 34 años, 32 semanas, preeclampsia grave con sulfato de magnesio 2 g/h desde hace 10 h. La diuresis de las últimas 4 h fue escasa. La enfermera la encuentra sin responder al llamado.",
        vit: { fc: 38, pas: 60, pad: 30, fr: 4, sat: 78, satNota: "respiración agónica", t: 36.6, mental: "No responde · reflejos rotulianos ausentes" },
        preguntas: [
          { tipo: "opcion", q: "¿Qué hacés primero?",
            ops: [
              { t: "Pedir ayuda, activar el Código Azul y palpar pulso carotídeo no más de 10 segundos.", ok: true, fb: "Correcto. Ante una paciente que no responde: activar, pedir el carro de paro y comprobar pulso en 10 s como máximo." },
              { t: "Tomar una gasometría y esperar el resultado.", fb: "Retrasa la RCP. Primero activar y comprobar pulso." },
              { t: "Subir el goteo de sulfato de magnesio por sospecha de eclampsia.", fb: "Hay depresión respiratoria y arreflexia: sospechá intoxicación por magnesio, no eclampsia." }
            ], peor: { fc: -10, pas: -10, sat: -6 }, ref: RZ, url: GZ }
        ]
      },
      {
        min: 1, titulo: "Sin pulso",
        relato: "No palpás pulso. El monitor muestra actividad eléctrica sin pulso. Llega el equipo con el carro de paro.",
        vit: { fc: 0, pas: 0, pad: 0, fr: 0, sat: 0, t: 36.6, paro: true, mental: "Paro cardiorrespiratorio · AESP" },
        preguntas: [
          { tipo: "opcion", q: "¿Cómo iniciás la reanimación?",
            ops: [
              { t: "Compresiones 30:2 en el centro del tórax con desplazamiento uterino manual hacia la izquierda.", ok: true, fb: "Correcto. Secuencia CABD; con útero a la altura del ombligo o más, desplazamiento uterino manual a la izquierda para liberar la compresión aortocava." },
              { t: "Compresiones con la paciente en decúbito lateral izquierdo de 45°.", fb: "La inclinación reduce la calidad de las compresiones; se prefiere el desplazamiento uterino manual con la paciente en decúbito supino." },
              { t: "Desfibrilar de inmediato.", fb: "La AESP no es un ritmo desfibrilable." }
            ], peor: { sat: -5 }, ref: RZ, url: GZ },
          { tipo: "opcion", q: "Ritmo no desfibrilable con acceso venoso: ¿qué fármaco y cada cuánto?",
            ops: [
              { t: "Adrenalina 1 mg IV cada 3 a 5 minutos, reevaluando el ritmo cada 2 minutos.", ok: true, fb: "Correcto. En ritmo no desfibrilable, adrenalina en cuanto haya acceso; las dosis no cambian en el embarazo." },
              { t: "Amiodarona 300 mg IV.", fb: "La amiodarona es para FV/TV sin pulso refractaria, no para AESP." },
              { t: "Atropina 1 mg IV cada 3 minutos.", fb: "La atropina no forma parte del algoritmo de AESP/asistolia." }
            ], ref: "AHA 2020 · paro en el embarazo", url: AHA }
        ]
      },
      {
        min: 2, titulo: "Causa reversible",
        relato: "Mientras siguen las compresiones, revisás las causas reversibles. La bomba de sulfato de magnesio sigue funcionando.",
        vit: { fc: 0, pas: 0, pad: 0, fr: 0, sat: 0, t: 36.6, paro: true, mental: "Paro · RCP en curso" },
        preguntas: [
          { tipo: "opcion", q: "¿Qué hacés con el sulfato de magnesio?",
            ops: [
              { t: "Suspenderlo y dar gluconato de calcio 10 % 30 mL IV.", ok: true, fb: "Correcto. Antídoto: gluconato de calcio 10 % 30 mL o cloruro de calcio 10 % 10 mL." },
              { t: "Bajarlo a 1 g/h y seguir.", fb: "En el paro con sospecha de toxicidad se suspende y se da calcio." },
              { t: "Dejarlo: protege de la eclampsia.", fb: "La toxicidad por magnesio es una causa reversible del paro." }
            ], ref: RZ, url: GZ }
        ]
      },
      {
        min: 4, titulo: "Minuto 4 sin retorno de circulación",
        relato: "Cuatro minutos de RCP de calidad sin retorno de la circulación espontánea. Fondo uterino por encima del ombligo.",
        vit: { fc: 0, pas: 0, pad: 0, fr: 0, sat: 0, t: 36.5, paro: true, mental: "Paro · sin ROSC" },
        preguntas: [
          { tipo: "opcion", q: "¿Qué decidís?",
            ops: [
              { t: "Cesárea perimortem en el lugar, con nacimiento hacia el minuto 5, sin trasladar ni interrumpir la RCP.", ok: true, fb: "Correcto. Con más de 20-24 semanas, si no hay retorno de la circulación al minuto 4, histerotomía en el lugar para nacer hacia el minuto 5: mejora la reanimación materna." },
              { t: "Trasladar al quirófano para hacer la cesárea en condiciones estériles.", fb: "El traslado demora y empeora la RCP. Se hace donde está la paciente." },
              { t: "Seguir la RCP 20 minutos más antes de decidir.", fb: "El beneficio de la evacuación uterina depende del tiempo: la histerotomía empieza al minuto 4 para nacer al minuto 5." }
            ], peor: { sat: -5 }, ref: "AHA 2020 · cesárea perimortem", url: AHA },
          { tipo: "opcion", q: "Nace el feto y se recupera el pulso materno. ¿Qué sigue?",
            ops: [
              { t: "Cuidados posparo: vía aérea y ventilación, PAS mayor a 90, uterotónicos, control de la hemorragia y traslado a terapia intensiva.", ok: true, fb: "Correcto. Tras el retorno de la circulación: evitar hipoxia e hipotensión, prevenir la hemorragia posparto y buscar la causa." },
              { t: "Reiniciar el sulfato de magnesio a la dosis previa.", fb: "No se reinicia sin control de magnesemia, reflejos y diuresis." },
              { t: "Alta a sala común con control cada 4 horas.", fb: "Requiere terapia intensiva." }
            ], ref: RZ, url: GZ }
        ]
      }
    ],
    fuentes: [
      ["Guías CaVeSal · Código Azul Obstétrico", GZ],
      ["AHA 2020 — Adult Basic and Advanced Life Support (paro en el embarazo)", AHA]
    ]
  });
})();
