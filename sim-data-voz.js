/* CaVeSal® Simulador — Modo voz en lazo cerrado (Código Rojo).
 * La app dicta cada paso del protocolo de voz y el equipo confirma («cumplido») o contesta «sí»/«no».
 * Caso ficticio con fines de entrenamiento. */
(function () {
  var GR = "guia.html#tab-rojo";
  var OMS = "https://iris.who.int/server/api/core/bitstreams/88bf11a5-93b6-4d6b-bdaa-856b46c8ed3c/content";
  var POS = "https://ginecologiayobstetricia.org.mx/articulo/control-efectivo-de-la-hemorragia-obstetrica-posparto-mediante-desarterializacion-selectiva-uterina-descripcion-de-la-tecnica-posadas";
  var RV = "Guías CaVeSal · Código Rojo (protocolo del modo voz)";
  function cumplido(fb) {
    return [
      { t: "«Cumplido»: confirmo en voz alta que el paso se hizo.", ok: true, dice: ["cumplido", "hecho", "listo"], fb: fb },
      { t: "Me quedo callado y sigo con lo mío.", fb: "La comunicación en lazo cerrado exige confirmar cada orden en voz alta." },
      { t: "Paso al siguiente paso sin hacer este.", fb: "Saltar pasos rompe la secuencia de la hora dorada." }
    ];
  }
  window.SIM_CASOS = window.SIM_CASOS || [];
  window.SIM_CASOS.push({
    id: "voz1",
    grupo: "Modo voz — lazo cerrado",
    codigo: "rojo",
    modo: "voz",
    titulo: "Hemorragia posparto con el asistente por voz",
    tema: "Código Rojo dictado: confirmar «cumplido» y contestar «sí» o «no»",
    resumen: "Puérpera con atonía. La app dicta cada paso en voz alta; respondé tocando o hablando («cumplido», «sí», «no»). Entrena la comunicación en lazo cerrado.",
    escenas: [
      { min: 0, titulo: "Activación", voz: "Activar el Código Rojo. Asignar líder, asistentes, circulante y anestesia. Iniciar el cronómetro.",
        relato: "Puérpera de 29 años, parto vaginal hace 20 min. Sangrado de 800 mL y en aumento, útero blando.",
        vit: { fc: 118, pas: 92, pad: 58, fr: 22, sat: 96, t: 36.4, mental: "Ansiosa · pálida" },
        preguntas: [{ tipo: "opcion", q: "¿Cómo respondés a la orden?", ops: cumplido("Correcto. Cada rol confirma en voz alta; el líder no avanza sin confirmación."), ref: RV, url: GR }] },
      { min: 2, titulo: "Accesos", voz: "Canalizar dos venas con catéter catorce, dieciséis o dieciocho, y tomar muestras de laboratorio.",
        relato: "La asistente canaliza dos vías y extrae tubos para hemograma, coagulación, fibrinógeno, grupo y pruebas cruzadas.",
        vit: { fc: 120, pas: 90, pad: 56, fr: 22, sat: 96, t: 36.3, mental: "Ansiosa" },
        preguntas: [{ tipo: "opcion", q: "Terminado el paso, ¿qué decís?", ops: cumplido("Correcto. El circulante anota la hora."), ref: RV, url: GR }] },
      { min: 4, titulo: "Volumen", voz: "Bolo de quinientos mililitros de cristaloide tibio. Reevaluar pulso radial y sensorio.",
        relato: "Se pasa el bolo de 500 mL y se reevalúa.",
        vit: { fc: 116, pas: 94, pad: 58, fr: 21, sat: 97, t: 36.3, mental: "Alerta" },
        preguntas: [{ tipo: "opcion", q: "La app pide confirmación:", ops: cumplido("Correcto. No se dan cargas predeterminadas de 1-2 L."), ref: RV, url: GR }] },
      { min: 5, titulo: "Oxitocina", voz: "Oxitocina cinco unidades endovenosa lenta en cinco minutos.",
        relato: "Se administra la oxitocina y se mantiene el masaje uterino.",
        vit: { fc: 116, pas: 94, pad: 58, fr: 21, sat: 97, t: 36.3, mental: "Alerta" },
        preguntas: [{ tipo: "opcion", q: "La app pide confirmación:", ops: cumplido("Correcto. Oxitocina de primera línea (OMS 2025)."), ref: "OMS/FIGO/ICM 2025", url: OMS }] },
      { min: 7, titulo: "Ácido tranexámico", voz: "Ácido tranexámico un gramo endovenoso en diez minutos.",
        relato: "Se prepara 1 g en goteo de 10 min.",
        vit: { fc: 118, pas: 92, pad: 56, fr: 22, sat: 96, t: 36.2, mental: "Alerta" },
        preguntas: [{ tipo: "opcion", q: "La app pide confirmación:", ops: cumplido("Correcto. Dentro de las 3 h del nacimiento, sin bolo rápido."), ref: "OMS/FIGO/ICM 2025", url: OMS }] },
      { min: 12, titulo: "Reevaluación", voz: "¿Cedió el sangrado? Diga sí o no.",
        relato: "El útero vuelve a relajarse y sigue sangrando: 1300 mL acumulados.",
        vit: { fc: 126, pas: 86, pad: 52, fr: 24, sat: 95, t: 36.1, mental: "Somnolienta" },
        preguntas: [{ tipo: "opcion", q: "¿Qué contestás?",
          ops: [
            { t: "«No»: sigue sangrando.", ok: true, dice: ["no"], fb: "Correcto. Con «no», el protocolo pasa a la compresión bimanual y a la segunda línea." },
            { t: "«Sí»: cedió.", dice: ["si"], fb: "Sigue sangrando: decir «sí» cerraría el código antes de tiempo." },
            { t: "No contesto hasta tener el laboratorio.", fb: "La decisión es clínica; el protocolo espera «sí» o «no»." }
          ], peor: { fc: 8, pas: -8 }, ref: RV, url: GR }] },
      { min: 13, titulo: "Compresión bimanual", voz: "Compresión bimanual al menos veinte minutos o hasta que cese el sangrado.",
        relato: "Una obstetra inicia la compresión bimanual. Se pide la segunda línea de uterotónicos.",
        vit: { fc: 124, pas: 88, pad: 52, fr: 24, sat: 95, t: 36.1, mental: "Somnolienta" },
        preguntas: [{ tipo: "opcion", q: "La app pide confirmación:", ops: cumplido("Correcto. El cronómetro marca los 20 minutos."), ref: RV, url: GR }] },
      { min: 25, titulo: "Nivel 2", voz: "Nivel dos: balón hidrostático intrauterino y traje antichoque no neumático.",
        relato: "Persiste el sangrado pese a la segunda línea. Se coloca el balón y se transfunde.",
        vit: { fc: 130, pas: 82, pad: 48, fr: 26, sat: 94, t: 35.9, mental: "Somnolienta" },
        preguntas: [{ tipo: "opcion", q: "¿Cedió con el balón?",
          ops: [
            { t: "«No»: se pasa a cirugía.", ok: true, dice: ["no"], fb: "Correcto. Sin respuesta al nivel 2, nivel 3: cirugía." },
            { t: "«Sí»: cedió.", dice: ["si"], fb: "El relato indica que persiste el sangrado." },
            { t: "Esperar una hora más con el balón.", fb: "Demorar la cirugía aumenta la mortalidad." }
          ], peor: { fc: 8, pas: -8 }, ref: RV, url: GR }] },
      { min: 35, titulo: "Nivel 3", voz: "Nivel tres: cirugía. Sutura de compresión B-Lynch o ligadura de arterias uterinas, O'Leary o Posadas. Si falla, histerectomía obstétrica.",
        relato: "En quirófano: útero atónico sin desgarros. El cirujano pregunta qué técnica conservadora usar.",
        vit: { fc: 128, pas: 84, pad: 50, fr: 24, sat: 96, t: 36.0, mental: "Bajo anestesia general" },
        preguntas: [{ tipo: "opcion", q: "¿Cuál es una opción conservadora válida antes de la histerectomía?",
          ops: [
            { t: "Ligadura vascular (O'Leary, Posadas o Tsirulnikov) o sutura de compresión (B-Lynch).", ok: true, fb: "Correcto. La técnica Posadas (desarterialización selectiva) tuvo 96,4 % de éxito en una serie de 750 casos." },
            { t: "Otra dosis de oxitocina y esperar.", fb: "Ya se agotó el tratamiento médico." },
            { t: "Histerectomía de entrada en toda paciente.", fb: "Con paciente estabilizada y deseo genésico se intentan primero las técnicas conservadoras." }
          ], ref: "Técnica Posadas — Ginecol Obstet Méx", url: POS }] }
    ],
    fuentes: [
      ["Guías CaVeSal · Código Rojo", GR],
      ["OMS/FIGO/ICM 2025 — Consolidated guidelines on PPH", OMS],
      ["Técnica Posadas — Ginecol Obstet Méx", POS]
    ]
  });
})();
