/**
 * Protocolos dictados por el modo voz (lazo cerrado).
 * Los pasos se toman SOLO de los flujogramas con fuente ya publicados en las
 * Guías (guia.html: Código Rojo fichas 1-5 y Modelo ICT fichas 1-11).
 * La IA no genera pasos: solo recibe el registro al final.
 *
 * Tipos de paso:
 *   (por defecto) acción → "cumplido" avanza
 *   q: true            → pregunta; "sí" va a si, "no" va a no
 *   si / no            → id del paso destino
 *   next               → id del paso siguiente (si no, el siguiente en la lista)
 *   timer {min, msg}   → al cumplirse, arranca una cuenta regresiva con aviso por voz
 *   input "si"         → muestra campos FC / PAS y calcula el índice de choque
 */
window.VOZ_PROTOCOLOS = {
  rojo: {
    id: "rojo",
    titulo: "Código Rojo — Hemorragia obstétrica",
    corto: "Código Rojo",
    color: "rojo",
    fuentes: "MSPBS/DGPS, Guía Código Rojo Materno y Neonatal 2.ª ed. 2021 (modelo ICT) · WHO PPH Guidelines 2025 · Vélez AG et al., Rev Colomb Obstet Ginecol 2009 · Colombia MinSalud GPC 2013 · WHO MCPC 2.ª ed. 2017 · Plaat (respuesta a cristaloides).",
    camino: [
      { id: "identificar", nombre: "Identificar", tramo: "Tiempo cero" },
      { id: "compensar", nombre: "Compensar", tramo: "1-20 min" },
      { id: "tono", nombre: "Tratar: Tono", tramo: "Nivel 0-1" },
      { id: "nivel2", nombre: "Nivel 2", tramo: "20-60 min" },
      { id: "nivel3", nombre: "Nivel 3", tramo: "Cirugía" },
      { id: "vigilar", nombre: "Metas y vigilancia", tramo: "" }
    ],
    recordatorios: [
      { cada: 10, msg: "Control de signos vitales en la escala de alerta del Código Rojo.", ref: "MSPBS: cada 5-10 min" }
    ],
    hitos: [
      { min: 20, msg: "Veinte minutos. ¿Hay mejoría? Evaluar Nivel dos o tres.", ref: "Flujograma Hora de Oro" },
      { min: 60, msg: "Sesenta minutos. ¿Nivel tres y condiciones?", ref: "Flujograma Hora de Oro" }
    ],
    pasos: [
      { id: "r1", fase: "identificar", t: "Activar Código Rojo: anunciarlo en voz alta y poner en marcha el reloj.", ref: "MSPBS ICT, Etapa 1" },
      { id: "r2", fase: "identificar", t: "Asignar roles: Coordinador, Asistente 1, Asistente 2 y Circulante.", ref: "Colombia MinSalud GPC 2013" },
      { id: "r3", fase: "identificar", t: "Aplicar la Escala de Alerta Precoz Obstétrica. Registrar frecuencia cardíaca y presión sistólica para el índice de choque.", ref: "MSPBS ICT · índice de choque 0,9 / 1,4 / 1,7", input: "si" },
      { id: "r4", fase: "identificar", t: "Clasificar el grado de choque por el peor parámetro: sensorio, perfusión, pulso y presión sistólica.", v: "Clasificar el grado de choque por el peor parámetro: sensorio, perfusión, pulso y presión sistólica.", ref: "Vélez 2009" },

      { id: "c1", fase: "compensar", t: "Pedir ayuda y controlar la permeabilidad de la vía aérea.", ref: "MSPBS ICT, Etapa 2" },
      { id: "c2", fase: "compensar", t: "Administrar oxígeno.", ref: "MSPBS ICT, Etapa 2" },
      { id: "c3", fase: "compensar", t: "Canalizar 2 venas con catéter N.° 14, 16 o 18 y tomar muestras de laboratorio.", v: "Canalizar dos venas con catéter catorce, dieciséis o dieciocho, y tomar muestras de laboratorio.", ref: "MSPBS ICT · Hora Dorada" },
      { id: "c4", fase: "compensar", t: "Bolo de 500 mL de cristaloide isotónico tibio (39 °C). Reevaluar pulso radial y sensorio. No dar cargas predeterminadas de 1-2 L.", v: "Bolo de quinientos mililitros de cristaloide isotónico tibio. Reevaluar pulso radial y sensorio. No dar cargas predeterminadas de uno a dos litros.", ref: "OMS 2025, Rec. 28 · Plaat" },
      { id: "c5", fase: "compensar", t: "Sonda vesical y control de diuresis: meta >30 mL/h (MSPBS) o >0,5 mL/kg/h.", v: "Sonda vesical y control de diuresis. Meta mayor a treinta mililitros por hora.", ref: "MSPBS ICT · WHO" },
      { id: "c6", fase: "compensar", t: "Cubrir con manta para evitar la hipotermia.", ref: "MSPBS ICT, Etapa 2" },
      { id: "c7", fase: "compensar", q: true, t: "¿Respondió a la carga de cristaloides, con retorno sostenido a lo normal?", v: "¿Respondió a la carga de cristaloides, con retorno sostenido a lo normal? Diga sí o no.", si: "c7s", no: "c7n", ref: "Plaat" },
      { id: "c7s", fase: "compensar", t: "Respuesta rápida: transfusión improbable. Pedir sangre tipo-compatible con pruebas cruzadas.", next: "t1", ref: "Plaat" },
      { id: "c7n", fase: "compensar", t: "Respuesta transitoria o sin respuesta: pedir paquete globular de emergencia. Si no hay respuesta en ningún momento: sangre tipo específica sin pruebas cruzadas, u O negativo/O positivo.", v: "Respuesta transitoria o sin respuesta. Pedir paquete globular de emergencia. Si no hay respuesta en ningún momento, sangre tipo específica sin pruebas cruzadas, u O negativo u O positivo.", ref: "Plaat" },

      { id: "t1", fase: "tono", t: "Masaje uterino externo continuo durante todo el manejo, hasta que el sangrado ceda.", ref: "MSPBS ICT, Etapa 3 · WHO MCPC 2017" },
      { id: "t2", fase: "tono", t: "Oxitocina 5 UI EV lento en 5 min (10 UI IM si no hay vía). Repetible a los 5 min hasta 10 UI. Mantenimiento: 20 UI en 500 cc de SF en 4 h.", v: "Oxitocina cinco unidades endovenosa lenta en cinco minutos, o diez unidades intramuscular si no hay vía. Repetible a los cinco minutos hasta diez unidades. Mantenimiento: veinte unidades en quinientos de suero fisiológico en cuatro horas.", timer: { min: 5, msg: "Cinco minutos desde la oxitocina. Evaluar repetir cinco unidades, hasta un máximo de diez." }, ref: "Guías, Modelo ICT ficha 7" },
      { id: "t3", fase: "tono", t: "Ácido tranexámico 1 g IV en 10 min (1 mL/min, no en bolo rápido: hipotensión). Segunda dosis si continúa a los 30 min o reaparece dentro de las 24 h. No usar después de 3 h del nacimiento.", v: "Ácido tranexámico un gramo endovenoso, goteo en diez minutos, no en bolo rápido. Segunda dosis si continúa a los treinta minutos o reaparece dentro de las veinticuatro horas. No usar después de tres horas del nacimiento.", timer: { min: 30, msg: "Treinta minutos desde el ácido tranexámico. Si el sangrado continúa, repetir un gramo." }, ref: "OMS 2025" },
      { id: "t4", fase: "tono", t: "Revisar las 4T: Tono, Trauma (revisar y reparar el canal), Tejido (revisar placenta y cavidad) y Trombina (test del coágulo en tubo, 7 min).", v: "Revisar las cuatro T. Tono. Trauma: revisar y reparar el canal. Tejido: revisar placenta y cavidad. Trombina: test del coágulo en tubo, siete minutos.", ref: "Guías, Código Rojo ficha 5" },
      { id: "t5", fase: "tono", q: true, t: "¿Cedió el sangrado?", v: "¿Cedió el sangrado? Diga sí o no.", si: "v1", no: "t6" },
      { id: "t6", fase: "tono", t: "Compresión bimanual al menos 20 min o hasta que cese el sangrado. Continuar hasta que no sangre al liberar y el útero esté contraído.", v: "Compresión bimanual al menos veinte minutos o hasta que cese el sangrado.", timer: { min: 20, msg: "Veinte minutos de compresión bimanual. Liberar y verificar útero contraído sin sangrado." }, ref: "MSPBS ICT · WHO MCPC 2017" },
      { id: "t7", fase: "tono", t: "Segunda línea: ergometrina o metilergonovina 0,2 mg IM o IV lento. Contraindicada en hipertensión, preeclampsia y cardiopatía. Misoprostol 800 µg SL si no hay oxitocina ni ergonovina.", v: "Segunda línea: ergometrina o metilergonovina cero coma dos miligramos, intramuscular o endovenosa lenta. Contraindicada en hipertensión, preeclampsia y cardiopatía. Misoprostol ochocientos microgramos sublingual si no hay oxitocina ni ergonovina.", ref: "OMS · FIGO 2022 · Guías ficha 7" },
      { id: "t8", fase: "tono", q: true, t: "¿Cedió el sangrado?", v: "¿Cedió el sangrado? Diga sí o no.", si: "v1", no: "n1" },

      { id: "n1", fase: "nivel2", t: "Nivel 2: balón hidrostático intrauterino y traje antichoque no neumático.", v: "Nivel dos: balón hidrostático intrauterino y traje antichoque no neumático.", ref: "Escalada Nivel 0-3 · Hora Dorada" },
      { id: "n2", fase: "nivel2", t: "Transfusión en relación 1:1:1 (GRE : PFC : plaquetas). Si el fibrinógeno es <2 g/L: crioprecipitado 10-20 U o concentrado de fibrinógeno 2 g.", v: "Transfusión en relación uno a uno a uno: glóbulos rojos, plasma y plaquetas. Si el fibrinógeno es menor a dos gramos por litro: crioprecipitado o concentrado de fibrinógeno dos gramos.", ref: "Guías, Modelo ICT ficha 9" },
      { id: "n3", fase: "nivel2", t: "Como puente: compresión de la aorta abdominal con el puño cerrado, justo sobre el ombligo y ligeramente a la izquierda.", v: "Como puente: compresión de la aorta abdominal con el puño cerrado, justo sobre el ombligo y ligeramente a la izquierda.", ref: "WHO MCPC 2017" },
      { id: "n4", fase: "nivel2", q: true, t: "¿Cedió el sangrado?", v: "¿Cedió el sangrado? Diga sí o no.", si: "v1", no: "s1" },

      { id: "s1", fase: "nivel3", t: "Nivel 3: cirugía. Sutura de compresión B-Lynch o ligadura de arterias uterinas (O'Leary o Posadas); si falla, histerectomía obstétrica.", v: "Nivel tres: cirugía. Sutura de compresión B-Lynch o ligadura de arterias uterinas, O'Leary o Posadas. Si falla, histerectomía obstétrica.", ref: "Escalada Nivel 0-3 · FIGO/WHO" },

      { id: "v1", fase: "vigilar", t: "Verificar metas: sensorio normal, llenado capilar <3 s, PAS >90, SatO₂ ≥95 %, índice de choque <0,9, T° >35 °C, lactato <2 mmol/L, fibrinógeno >200 mg/dL.", v: "Verificar metas: sensorio normal, llenado capilar menor a tres segundos, presión sistólica mayor a noventa, saturación de noventa y cinco o más, índice de choque menor a cero coma nueve, temperatura mayor a treinta y cinco, lactato menor a dos y fibrinógeno mayor a doscientos.", ref: "Guías, Código Rojo ficha 3" },
      { id: "v2", fase: "vigilar", t: "Vigilancia cada 15 min durante 2 h. Registrar y comunicar el cierre del código.", v: "Vigilancia cada quince minutos durante dos horas. Registrar y comunicar el cierre del código.", ref: "OMS 2025", fin: true }
    ]
  },

  thae: {
    id: "thae",
    titulo: "Código THAE — Hipertensión grave / eclampsia",
    corto: "Código THAE",
    color: "azul",
    fuentes: "Guías CaVeSal, Código THAE fichas 1-4 y 8 (ACOG PB 222 2020, NICE, FIGO, ISSHP) · MSPBS/DGPS, Guía Código Rojo Materno y Neonatal 2.ª ed. 2021 (modelo ICT y control del MgSO₄) · OMS, ficha de producto del sulfato de magnesio.",
    camino: [
      { id: "identificar", nombre: "Identificar", tramo: "Tiempo cero" },
      { id: "soporte", nombre: "Soporte y seguridad", tramo: "" },
      { id: "sulfato", nombre: "Sulfato de magnesio", tramo: "" },
      { id: "antihta", nombre: "Antihipertensivo", tramo: "c/10-20 min" },
      { id: "obstetrico", nombre: "Obstétrico", tramo: "" },
      { id: "vigilar", nombre: "Vigilancia", tramo: "" }
    ],
    recordatorios: [],
    hitos: [
      { min: 15, msg: "Quince minutos. La presión severa sostenida por más de quince minutos es una emergencia que amenaza la vida. Verificar que el antihipertensivo esté indicado.", ref: "Guías THAE ficha 2" }
    ],
    pasos: [
      { id: "a1", fase: "identificar", t: "Activar Código THAE: PAS >160 o PAD >110, o convulsiones eclámpticas. Anunciarlo en voz alta y poner en marcha el reloj.", v: "Activar Código THAE: presión sistólica mayor a ciento sesenta o diastólica mayor a ciento diez, o convulsiones eclámpticas. Anunciarlo en voz alta y poner en marcha el reloj.", ref: "Guías THAE ficha 2" },
      { id: "a2", fase: "identificar", t: "Asignar roles: Coordinador, Asistente y Circulante.", ref: "Guías THAE ficha 2" },
      { id: "a3", fase: "identificar", t: "Confirmar la PA severa con 2 tomas separadas 15 min. Buscar lesión de órgano blanco: cefalea, cambios visuales, dolor en hipocondrio derecho, edema pulmonar.", v: "Confirmar la presión severa con dos tomas separadas quince minutos. Buscar lesión de órgano blanco: cefalea, cambios visuales, dolor en hipocondrio derecho, edema pulmonar.", ref: "Guías THAE ficha 1 (ACOG PB 222)" },
      { id: "a4", fase: "identificar", q: true, t: "¿Está convulsionando o convulsionó (eclampsia)?", v: "¿Está convulsionando o convulsionó? Diga sí o no.", si: "e1", no: "c1" },

      { id: "e1", fase: "sulfato", t: "Eclampsia: bolo de sulfato de magnesio 4-6 g IV (2 g IV si ya lo recibía). Mantenimiento 2 g/h. Si reconvulsiona: segundo bolo de 2 g IV.", v: "Eclampsia: bolo de sulfato de magnesio cuatro a seis gramos endovenoso, o dos gramos si ya lo recibía. Mantenimiento dos gramos por hora. Si reconvulsiona, segundo bolo de dos gramos.", ref: "Guías THAE ficha 3" },
      { id: "e2", fase: "soporte", t: "Intubar si: inconsciente tras la convulsión, estatus convulsivo, broncoaspiración o hipoxia.", ref: "Guías THAE ficha 3" },
      { id: "e3", fase: "soporte", t: "Cuidados básicos: pedir ayuda, vía aérea, oxígeno, 2 vías periféricas, sonda vesical y control de diuresis. Líquidos sin bolo: total 80 mL/h o 1 mL/kg/h, máximo 125 mL/h.", v: "Cuidados básicos: pedir ayuda, vía aérea, oxígeno, dos vías periféricas, sonda vesical y control de diuresis. Líquidos sin bolo: total ochenta mililitros por hora, máximo ciento veinticinco.", ref: "MSPBS ICT · Guías THAE ficha 3", next: "h1" },

      { id: "c1", fase: "soporte", t: "Cuidados básicos: pedir ayuda, vía aérea, oxígeno, 2 vías periféricas, sonda vesical y control de diuresis. Líquidos sin bolo: total 80 mL/h o 1 mL/kg/h, máximo 125 mL/h.", v: "Cuidados básicos: pedir ayuda, vía aérea, oxígeno, dos vías periféricas, sonda vesical y control de diuresis. Líquidos sin bolo: total ochenta mililitros por hora, máximo ciento veinticinco.", ref: "MSPBS ICT · Guías THAE ficha 3" },
      { id: "s1", fase: "sulfato", t: "Sulfato de magnesio: impregnación 4-6 g IV y mantenimiento 1-2 g/h hasta 24 h posparto. Todas las pacientes con preeclampsia grave lo reciben.", v: "Sulfato de magnesio: impregnación cuatro a seis gramos endovenoso y mantenimiento uno a dos gramos por hora hasta veinticuatro horas posparto.", ref: "Guías THAE fichas 3-4" },

      { id: "h1", fase: "antihta", op: [
          { id: "nif", l: "Nifedipino VO", k: "nifedipin|nifedipina", dest: "hn" },
          { id: "lab", l: "Labetalol IV", k: "labetalol", dest: "hl" },
          { id: "hid", l: "Hidralazina IV", k: "hidralazin", dest: "hh" }
        ], t: "Antihipertensivo: elegir fármaco.", v: "Antihipertensivo. Elegir fármaco: nifedipino, labetalol o hidralazina.", ref: "Guías THAE fichas 3 y 8" },
      { id: "hn", fase: "antihta", t: "Nifedipino 10 mg VO, tragado con agua (NO sublingual). Reevaluar a los 20 min: 20 mg; a los 20 min: 20 mg. Máximo 180 mg/día.", v: "Nifedipino diez miligramos por boca, tragado con agua, no sublingual. Reevaluar a los veinte minutos.", timer: { min: 20, msg: "Veinte minutos desde el nifedipino. Tomar la presión; si no hay control, siguiente dosis." }, next: "h2", ref: "Guías THAE ficha 8" },
      { id: "hl", fase: "antihta", t: "Labetalol 20 mg IV. Reevaluar a los 10 min: 40 mg; luego 80 mg c/10 min. Máximo 300 mg/día.", v: "Labetalol veinte miligramos endovenoso. Reevaluar a los diez minutos.", timer: { min: 10, msg: "Diez minutos desde el labetalol. Tomar la presión; si no hay control, siguiente dosis." }, next: "h2", ref: "Guías THAE ficha 8" },
      { id: "hh", fase: "antihta", t: "Hidralazina 5-10 mg IV. Reevaluar c/20 min. Máximo 20 mg/día.", v: "Hidralazina cinco a diez miligramos endovenoso. Reevaluar a los veinte minutos.", timer: { min: 20, msg: "Veinte minutos desde la hidralazina. Tomar la presión; si no hay control, siguiente dosis." }, next: "h2", ref: "Guías THAE ficha 8" },
      { id: "h2", fase: "antihta", q: true, t: "¿Se controló la PA? Meta: reducir 20-25 % (NICE: 135/85).", v: "¿Se controló la presión? Diga sí o no.", si: "o1", no: "h3", ref: "Guías THAE ficha 3" },
      { id: "h3", fase: "antihta", t: "Siguiente escalón del algoritmo (labetalol 20→40→80 mg / nifedipino 10→20→20 mg / hidralazina 10 mg). Infusiones de la tabla: nicardipina 5 mg/h (+2,5 mg/h c/5 min, máx. 10) o nitroprusiato 0,2 µg/kg/min (máx. 4).", v: "Siguiente escalón del algoritmo escalonado, o infusión de nicardipina o nitroprusiato según la tabla. Al confirmar, vuelvo a preguntar por el control.", next: "h1", ref: "Guías THAE fichas 3 y 8" },

      { id: "o1", fase: "obstetrico", t: "Obstétrico: maduración fetal entre 24 y 34 sem, bienestar fetal y plan de finalización (PE no grave: 37 sem; PE grave: 34 sem). La vía de parto se define por condiciones obstétricas, NO cesárea automática.", v: "Obstétrico: maduración fetal entre veinticuatro y treinta y cuatro semanas, bienestar fetal y plan de finalización. La vía de parto se define por condiciones obstétricas, no cesárea automática.", ref: "Guías THAE fichas 3-4" },
      { id: "m1", fase: "vigilar", t: "Control del MgSO₄: suspender o no repetir si FR <12/min (MSPBS) o <16/min (OMS), reflejo rotuliano ausente o diuresis <30 mL/h. Antídoto: gluconato de calcio 10 % 1 g IV lento.", v: "Control del sulfato: suspender o no repetir si la frecuencia respiratoria es menor a doce, el reflejo rotuliano está ausente o la diuresis es menor a treinta por hora. Antídoto: gluconato de calcio al diez por ciento, un gramo endovenoso lento.", ref: "MSPBS 2022 · OMS ficha de producto · Guías THAE ficha 8" },
      { id: "v1", fase: "vigilar", t: "Vigilancia tras la meta: PA cada 10 min la 1.ª hora, cada 15 min la 2.ª, cada 30 min la 3.ª y cada hora desde la 4.ª por 4 h más. MgSO₄ hasta 24 h posparto o desde la última convulsión.", v: "Vigilancia tras la meta: presión cada diez minutos la primera hora, cada quince la segunda, cada treinta la tercera y cada hora desde la cuarta por cuatro horas más.", ref: "Guías THAE fichas 2-3", fin: true }
    ]
  },

  amarillo: {
    id: "amarillo",
    titulo: "Código Amarillo — Sepsis materna",
    corto: "Código Amarillo",
    color: "ambar",
    fuentes: "OMS 2017 (WHO/RHR/17.02) · WHO GLOSS 2020 · CMQCC Toolkit 2022 · Surviving Sepsis Campaign 2021 · MSPBS 2022 (pág. 76) · SOMANZ (omqSOFA) · Universidad de Antioquia/UNFPA. Bundle «Sepsis 4-5-3» de las Guías CaVeSal, Código Amarillo fichas 1-5.",
    camino: [
      { id: "identificar", nombre: "Identificar", tramo: "Tiempo cero" },
      { id: "tome", nombre: "Tome 4", tramo: "1.ª hora" },
      { id: "suministre", nombre: "Suministre 5", tramo: "1.ª hora" },
      { id: "considere", nombre: "Considere 3", tramo: "" },
      { id: "metas", nombre: "Metas y revisión", tramo: "3 h · 6 h" }
    ],
    recordatorios: [],
    hitos: [
      { min: 60, msg: "Una hora. Verificar el bundle de la primera hora completo: tome cuatro y suministre cinco.", ref: "Bundle Sepsis 4-5-3" },
      { min: 180, msg: "Tres horas. Revisión: diagnóstico, tratamiento, laboratorios, repetir lactato y reevaluar el foco.", ref: "Guías Código Amarillo ficha 3" },
      { min: 360, msg: "Seis horas. Revisión y, idealmente, traslado a tercer nivel.", ref: "Guías Código Amarillo ficha 3" }
    ],
    pasos: [
      { id: "y1", fase: "identificar", t: "Activar Código Amarillo: infección sospechada o confirmada + disfunción orgánica. Anunciarlo y poner en marcha el reloj del bundle de la 1.ª hora.", v: "Activar Código Amarillo: infección sospechada o confirmada más disfunción orgánica. Anunciarlo y poner en marcha el reloj del bundle de la primera hora.", ref: "OMS 2017" },
      { id: "y2", fase: "identificar", t: "qSOFA obstétrico: PAS ≤90, FR ≥25, estado mental alterado. ≥2 puntos = riesgo elevado: aplicar SOFA obstétrico completo.", v: "q SOFA obstétrico: sistólica menor o igual a noventa, frecuencia respiratoria de veinticinco o más, estado mental alterado. Dos o más puntos es riesgo elevado.", ref: "Guías Código Amarillo ficha 5 · SOMANZ" },
      { id: "y3", fase: "identificar", t: "Cuidados básicos: pedir ayuda, vía aérea, 2 vías periféricas, sonda vesical y control de diuresis, controlar la temperatura.", v: "Cuidados básicos: pedir ayuda, vía aérea, dos vías periféricas, sonda vesical y control de diuresis.", ref: "MSPBS ICT, Etapa 2" },

      { id: "k1", fase: "tome", t: "Tome 4: cultivos, laboratorios de disfunción orgánica + lactato, signos vitales e imágenes.", v: "Tome cuatro: cultivos, laboratorios de disfunción orgánica más lactato, signos vitales e imágenes.", ref: "Bundle Sepsis 4-5-3" },

      { id: "u1", fase: "suministre", t: "Oxígeno con FiO₂ ≥50 %.", v: "Oxígeno con fracción inspirada de cincuenta por ciento o más.", ref: "Bundle Sepsis 4-5-3" },
      { id: "u2", fase: "suministre", t: "Cristaloides: bolo de 20-30 mL/kg, luego mantenimiento 1-2 mL/kg/h.", v: "Cristaloides: bolo de veinte a treinta mililitros por kilo, luego mantenimiento uno a dos mililitros por kilo por hora.", calc: "bolo_sepsis", ref: "Bundle Sepsis 4-5-3" },
      { id: "u3", fase: "suministre", op: [
          { id: "uri", l: "Urinario", k: "urinari|orina|pielo", dest: "ab_uri" },
          { id: "resp", l: "Respiratorio", k: "respirator|pulmon|neumon", dest: "ab_resp" },
          { id: "puer", l: "Puerperal", k: "puerper|utero|endometr|pelvic", dest: "ab_puer" }
        ], t: "Antibióticos de amplio espectro en la 1.ª hora. Elegir el foco.", v: "Antibióticos de amplio espectro en la primera hora. Elegir el foco: urinario, respiratorio o puerperal.", ref: "Guías Código Amarillo ficha 4" },
      { id: "ab_uri", fase: "suministre", t: "Foco urinario: piperacilina-tazobactam 4,5 g c/8 h o gentamicina 3-5 mg/kg c/24 h.", v: "Foco urinario: piperacilina tazobactam cuatro coma cinco gramos cada ocho horas, o gentamicina tres a cinco miligramos por kilo cada veinticuatro horas.", next: "u4", ref: "Guías Código Amarillo ficha 4" },
      { id: "ab_resp", fase: "suministre", t: "Foco respiratorio: ampicilina-sulbactam 3 g c/6 h + claritromicina 500 mg c/12 h (+ oseltamivir si hay riesgo de influenza).", v: "Foco respiratorio: ampicilina sulbactam tres gramos cada seis horas más claritromicina quinientos miligramos cada doce horas. Oseltamivir si hay riesgo de influenza.", next: "u4", ref: "Guías Código Amarillo ficha 4" },
      { id: "ab_puer", fase: "suministre", t: "Infección puerperal: clindamicina 900 mg c/8 h + gentamicina 240 mg c/24 h o amikacina 1 g c/24 h; o ampicilina-sulbactam 3 g c/6 h; o penicilina cristalina + metronidazol + gentamicina.", v: "Infección puerperal: clindamicina novecientos miligramos cada ocho horas más gentamicina doscientos cuarenta cada veinticuatro horas, o amikacina un gramo cada veinticuatro horas. Alternativas en pantalla.", next: "u4", ref: "Guías Código Amarillo ficha 4" },
      { id: "u4", fase: "suministre", t: "Tratar la hipertermia o la hipotermia.", ref: "Bundle Sepsis 4-5-3" },
      { id: "u5", fase: "suministre", q: true, t: "Tras el bolo, ¿la PAM sigue <65 mmHg?", v: "Después del bolo, ¿la presión arterial media sigue por debajo de sesenta y cinco? Diga sí o no.", si: "u6", no: "z1", ref: "CMQCC · MSPBS 2022" },
      { id: "u6", fase: "suministre", t: "Choque séptico: norepinefrina 0,05 µg/kg/min hasta PAM ≥65, por vía central o acceso 14-16G. Alternativa (UdeA): dopamina 5 µg/kg/min periférica, solo tras repletar volumen.", v: "Choque séptico: norepinefrina cero coma cero cinco microgramos por kilo por minuto hasta presión media de sesenta y cinco o más, por vía central o acceso catorce a dieciséis.", ref: "Guías Código Amarillo fichas 2 y 4" },

      { id: "z1", fase: "considere", t: "Considere 3: bienestar fetal si >26 sem, control del foco infeccioso y tromboprofilaxis.", v: "Considere tres: bienestar fetal si hay más de veintiséis semanas, control del foco infeccioso y tromboprofilaxis.", ref: "Bundle Sepsis 4-5-3" },

      { id: "w1", fase: "metas", t: "Metas: diuresis >0,5 mL/kg/h o >30 mL/h, PAM ≥65, PaO₂ >60 o SatO₂ >95 %, Glasgow 15.", v: "Metas: diuresis mayor a cero coma cinco mililitros por kilo por hora o treinta por hora, presión media de sesenta y cinco o más, saturación mayor a noventa y cinco y Glasgow quince.", ref: "MSPBS 2022 · Surviving Sepsis Campaign 2021" },
      { id: "w2", fase: "metas", t: "Revisión a las 3 h (repetir lactato, reevaluar foco) y a las 6 h (vigilancia estricta; idealmente traslado a 3.er nivel). El reloj avisará en ambos momentos.", v: "Revisión a las tres horas y a las seis horas. El reloj avisará en ambos momentos.", ref: "Guías Código Amarillo ficha 3", fin: true }
    ]
  },

  rcp: {
    id: "rcp",
    titulo: "Código Azul Obstétrico — Paro / colapso materno",
    corto: "Código Azul",
    color: "rcp",
    fuentes: "Guías CaVeSal, Código Azul Obstétrico fichas 1-4: 2020 AHA Guidelines for CPR and ECC (actualizado 2025) · Knapp C & Bhatia K, Br J Hosp Med 2022 · Bennett, Critical Care Obstetrics 2024 · Sumer, Emerg Med Clin North Am 2023.",
    camino: [
      { id: "activar", nombre: "Activar", tramo: "Min 0" },
      { id: "cabd", nombre: "CABD", tramo: "Min 0-4" },
      { id: "ritmo", nombre: "Ritmo y fármacos", tramo: "c/2 min" },
      { id: "histerotomia", nombre: "Histerotomía", tramo: "Min 4-5" },
      { id: "causa", nombre: "Causa y cierre", tramo: "" }
    ],
    recordatorios: [
      { cada: 2, msg: "Dos minutos de RCP o cinco ciclos: reevaluar el ritmo.", ref: "Guías Código Azul ficha 3" }
    ],
    hitos: [
      { min: 4, msg: "Minuto cuatro sin retorno de la circulación: iniciar la histerotomía ahora, en el lugar y sin detener la RCP. Objetivo: nacimiento al minuto cinco.", ref: "AHA 2015 · Guías Código Azul ficha 3" },
      { min: 5, msg: "Minuto cinco: objetivo de nacimiento. Si todavía no nació, completar la evacuación uterina sin detener la RCP. Equipo neonatal listo.", ref: "AHA 2025 · Guías Código Azul fichas 3-4" }
    ],
    pasos: [
      { id: "z1", fase: "activar", t: "No responde: activar Código Azul Obstétrico. Reloj en marcha.", ref: "Guías Código Azul ficha 2" },
      { id: "z2", fase: "activar", q: true, t: "Palpar el pulso 10 segundos. ¿Tiene pulso?", v: "Palpar el pulso diez segundos. ¿Tiene pulso? Diga sí o no.", si: "zp", no: "z3", ref: "Guías Código Azul ficha 2" },
      { id: "zp", fase: "causa", t: "Hay pulso: no iniciar compresiones. Vía aérea y oxígeno; buscar la causa del colapso (A-H: anestesia/asma, hemorragia, cardiovascular, fármacos como MgSO₄, embolia, fiebre/sepsis, 6H-6T, hipertensión).", v: "Hay pulso: no iniciar compresiones. Vía aérea y oxígeno, y buscar la causa del colapso con el mnemónico A a H.", next: "zh", ref: "Guías Código Azul ficha 1" },

      { id: "z3", fase: "cabd", t: "Iniciar CABD: compresiones torácicas 30:2, más profundas en la gestante. Minimizar el tiempo sin compresiones.", v: "Iniciar compresiones treinta a dos, más profundas en la gestante. Minimizar el tiempo sin compresiones.", ref: "Guías Código Azul ficha 2" },
      { id: "z4", fase: "cabd", t: "Desplazamiento uterino a la izquierda (descompresión aortocava).", ref: "Guías Código Azul ficha 2" },
      { id: "z5", fase: "cabd", t: "Vía aérea: O₂ 100 % a 15 L/min. Intubación orotraqueal precoz (tubo 6,0-7,0), 2 intentos; si falla, supraglótico 2 intentos; si falla, ambú; si es inefectiva, cricotiroidectomía. 8-10 ventilaciones/min, monitorizar CO₂.", v: "Vía aérea: oxígeno al cien por ciento a quince litros. Intubación precoz, dos intentos; si falla, supraglótico; si falla, ambú; si es inefectiva, cricotiroidectomía. Ocho a diez ventilaciones por minuto.", ref: "Guías Código Azul ficha 2" },

      { id: "r1", fase: "ritmo", q: true, t: "Analizar el ritmo: ¿es desfibrilable (FV o TV sin pulso)?", v: "Analizar el ritmo. ¿Es desfibrilable? Diga sí o no.", si: "rd1", no: "rn1", ref: "Guías Código Azul ficha 3" },
      { id: "rd1", fase: "ritmo", t: "Descarga: 150 J bifásica o 360 J monofásica, y 2 min de RCP 30:2.", v: "Descarga de ciento cincuenta joules bifásica o trescientos sesenta monofásica, y dos minutos de RCP.", ref: "Guías Código Azul ficha 3" },
      { id: "rd2", fase: "ritmo", t: "Si persiste: otra descarga + amiodarona 300 mg IV (150 mg adicionales si persiste la TV). Adrenalina 1 mg IV después de la 2.ª descarga, cada 3-5 min.", v: "Si persiste: otra descarga más amiodarona trescientos miligramos endovenoso. Adrenalina un miligramo después de la segunda descarga, cada tres a cinco minutos.", timer: { min: 4, msg: "Adrenalina: evaluar la siguiente dosis, cada tres a cinco minutos." }, next: "zc", ref: "Guías Código Azul ficha 3" },
      { id: "rn1", fase: "ritmo", t: "Asistolia o AESP: continuar compresiones y ventilación. Adrenalina 1 mg IV apenas haya acceso venoso, cada 3-5 min.", v: "Asistolia o actividad eléctrica sin pulso: continuar compresiones y ventilación. Adrenalina un miligramo endovenoso apenas haya acceso, cada tres a cinco minutos.", timer: { min: 4, msg: "Adrenalina: evaluar la siguiente dosis, cada tres a cinco minutos." }, ref: "Guías Código Azul ficha 3" },

      { id: "zc", fase: "histerotomia", t: "Regla de los 4 minutos: sin RCE al minuto 4, iniciar la histerotomía (cesárea perimortem) en el lugar para el nacimiento al minuto 5. <20 sem NO; 20-24 sem según sospecha de compresión aortocava; >24 sem SIEMPRE. Avisar al equipo neonatal si EG >24 sem.", v: "Regla de los cuatro minutos: sin retorno de la circulación al minuto cuatro, iniciar la histerotomía en el lugar, para el nacimiento al minuto cinco. Menos de veinte semanas, no; veinte a veinticuatro, según compresión aortocava; más de veinticuatro, siempre. Avisar al equipo neonatal.", ref: "Guías Código Azul fichas 3-4" },
      { id: "zh", fase: "causa", t: "Buscar causas reversibles: 6H (hipoxia, hipo/hipercalemia, acidosis, hipotermia, hipovolemia, hipoglicemia) y 6T (taponamiento, TEP, trombosis coronaria, tóxicos, neumotórax, trauma). Intoxicación por MgSO₄: gluconato de calcio 10 % 30 mL o cloruro de calcio 10 % 10 mL.", v: "Buscar causas reversibles: seis H y seis T. Si hay intoxicación por sulfato de magnesio: gluconato de calcio al diez por ciento, treinta mililitros, o cloruro de calcio diez mililitros.", ref: "Guías Código Azul fichas 1 y 4" },
      { id: "zr", fase: "causa", q: true, t: "¿Hay retorno de la circulación espontánea (o la paciente tenía pulso)?", v: "¿Hay retorno de la circulación espontánea? Diga sí o no.", si: "zf", no: "r1" },
      { id: "zf", fase: "causa", t: "Registrar la hora y continuar el tratamiento de la causa del colapso con el código que corresponda.", ref: "Guías Código Azul", fin: true }
    ]
  }
};

/* Árbol "Empezar desde cero": el orden prioriza el paro. Umbrales tomados de las Guías. */
window.VOZ_ARBOL = [
  { id: "p1", q: "¿La paciente responde y respira normalmente?", ref: "Código Azul Obstétrico: no responde → activar código, pulso 10 s, CABD", no: { code: "rcp" }, si: "p2" },
  { id: "p2", q: "¿Pérdida ≥500 mL, o ≥300 mL con FC >100, índice de choque >1, PAS <100 o PAD <60?", ref: "Código Rojo, ficha 1 (definición operativa de HPP)", si: { code: "rojo" }, no: "p3" },
  { id: "p3", q: "¿PAS >160 o PAD >110, o convulsiones eclámpticas?", ref: "Código THAE: criterios de activación del código", si: { code: "thae" }, no: "p4" },
  { id: "p4", q: "¿Sospecha de infección con 2 o más de: PAS <90, FR ≥25, estado mental alterado?", ref: "Código Amarillo: omqSOFA (SOMANZ)", si: { code: "amarillo" }, no: { code: "ninguno" } }
];
