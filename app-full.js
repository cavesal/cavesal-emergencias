/* ============================================================
   CaVeSal — app-full.js
   Lógica de cálculo vanilla JS para el Modo Calculadora (Full)
   Todos los umbrales provienen de spec_calculadora_emergencias.md
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
  function setReadout(id, value, sub, statusClass) {
    var box = document.getElementById(id);
    var valueEl = document.getElementById(id + "-value");
    var subEl = document.getElementById(id + "-sub");
    valueEl.textContent = value;
    if (sub !== undefined) subEl.textContent = sub;
    box.className = "readout " + (statusClass || "status-neutro");
  }

  /* ---------- Navegación código (Full) ---------- */
  var codeNavBtns = $all(".code-nav-btn");
  var codeSections = $all(".code-section");
  codeNavBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      codeNavBtns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
      codeSections.forEach(function (s) { s.classList.remove("active"); });
      btn.setAttribute("aria-selected", "true");
      document.getElementById("code-" + btn.dataset.code).classList.add("active");
    });
  });

  /* ---------- Sub-tabs (Código Rojo) ---------- */
  var subTabs = $all(".sub-tab");
  var subPanels = $all(".sub-panel");
  subTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      subTabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
      subPanels.forEach(function (p) { p.classList.remove("active"); });
      tab.setAttribute("aria-selected", "true");
      document.getElementById("sub-" + tab.dataset.sub).classList.add("active");
    });
  });

  /* ============================================================
     DATOS COMUNES DE PACIENTE — IMC, EG, PAM, Shock Index
     ============================================================ */
  var inPeso = $("#in-peso"), inTalla = $("#in-talla"), inFum = $("#in-fum");
  var inFc = $("#in-fc"), inPas = $("#in-pas"), inPad = $("#in-pad");

  function recalcCommon() {
    recalcIMC();
    recalcEG();
    recalcPAM();
    recalcShockIndex();
    recalcTHAEClasif();
    recalcPEGrave();
  }

  function recalcIMC() {
    var peso = parseFloat(inPeso.value);
    var talla = parseFloat(inTalla.value);
    if (!peso || !talla) {
      setReadout("ro-imc", "—", "Ingresá peso/talla", "status-neutro");
      return;
    }
    var tallaM = talla / 100;
    var imc = peso / (tallaM * tallaM);
    var imcRounded = imc.toFixed(1);
    var label, status;
    if (imc >= 35) { label = "Obesidad II-III (riesgo alto)"; status = "status-rojo"; }
    else if (imc >= 30) { label = "Obesidad"; status = "status-amarillo"; }
    else if (imc >= 25) { label = "Sobrepeso (riesgo moderado)"; status = "status-amarillo"; }
    else { label = "Normal"; status = "status-verde"; }
    setReadout("ro-imc", imcRounded, label, status);
  }

  function recalcEG() {
    var fumVal = inFum.value;
    if (!fumVal) {
      setReadout("ro-eg", "—", "Ingresá FUM", "status-neutro");
      return;
    }
    var fum = new Date(fumVal + "T00:00:00");
    var now = new Date();
    var diffMs = now - fum;
    if (diffMs < 0) {
      setReadout("ro-eg", "—", "FUM en el futuro", "status-neutro");
      return;
    }
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var weeks = Math.floor(diffDays / 7);
    var days = diffDays % 7;
    var label = weeks + "s " + days + "d";
    var sub = weeks >= 24 ? "Viable (≥24 sem)" : "No viable (<24 sem)";
    var status = weeks >= 24 ? "status-verde" : "status-amarillo";
    setReadout("ro-eg", label, sub, status);
  }

  function recalcPAM() {
    var pas = parseFloat(inPas.value);
    var pad = parseFloat(inPad.value);
    if (isNaN(pas) || isNaN(pad)) {
      setReadout("ro-pam", "—", "mmHg", "status-neutro");
      return;
    }
    var pam = (pas + 2 * pad) / 3;
    var pamRounded = pam.toFixed(0);
    var sub, status, src;
    // Lógica de 3 niveles emulada de la calculadora prenatal (indexfullv170826.html)
    var semActual = null;
    if (inFum.value) {
      var dd = (new Date() - new Date(inFum.value + "T00:00:00")) / 86400000;
      if (dd >= 0) semActual = Math.floor(dd / 7);
    }
    if (pam >= 105) { sub = "Alarma ≥105"; src = "OMS / NICE / ISUOG"; status = "status-rojo"; }
    else if (pam > 90 && semActual !== null && semActual <= 14) { sub = "Riesgo PE (1º trim.)"; src = "FMF / ACOG / Cochrane"; status = "status-amarillo"; }
    else if (pam > 90) { sub = "Leve elevada >90"; src = "NICE / CDC"; status = "status-verde"; }
    else { sub = "mmHg — sin alerta"; src = ""; status = "status-verde"; }
    setReadout("ro-pam", pamRounded, sub, status);
    document.getElementById("ro-pam").title = src ? "Fuente: " + src + " (lógica de la calculadora prenatal CaVeSal)" : "";
    return pam;
  }

  function recalcShockIndex() {
    var fc = parseFloat(inFc.value);
    var pas = parseFloat(inPas.value);
    if (!fc || !pas) {
      setReadout("ro-si", "—", "FC/PAS", "status-neutro");
      return;
    }
    var si = fc / pas;
    var siRounded = si.toFixed(2);
    var sub, status;
    if (si >= 1.7) { sub = "Alta probabilidad result. adverso"; status = "status-rojo"; }
    else if (si >= 1.4) { sub = "Necesidad urgente de intervención"; status = "status-naranja"; }
    else if (si >= 0.9) { sub = "Marcador de severidad"; status = "status-amarillo"; }
    else { sub = "Normal"; status = "status-verde"; }
    setReadout("ro-si", siRounded, sub, status);
    return si;
  }

  [inPeso, inTalla, inFum, inFc, inPas, inPad].forEach(function (el) {
    el.addEventListener("input", recalcCommon);
  });

  /* ============================================================
     CÓDIGO ROJO — Vélez: clasificación de choque hipovolémico
     ============================================================ */
  var GRADE_ORDER = { compensado: 0, leve: 1, moderado: 2, severo: 3 };
  var GRADE_LABEL = {
    compensado: "Compensado",
    leve: "Leve",
    moderado: "Moderado",
    severo: "Severo"
  };
  var GRADE_STATUS = {
    compensado: "rb-verde",
    leve: "rb-amarillo",
    moderado: "rb-naranja",
    severo: "rb-rojo"
  };

  function gradeFromSangrado(mL) {
    if (mL === null || isNaN(mL)) return null;
    if (mL >= 2001) return "severo";
    if (mL >= 1501) return "moderado";
    if (mL >= 1001) return "leve";
    if (mL >= 500) return "compensado";
    return null; // below 500 mL doesn't map to a defined grade
  }
  function gradeFromSensorio(v) {
    return { normal: "compensado", agitada: "leve", agitada2: "moderado", letargica: "severo" }[v] || null;
  }
  function gradeFromPerfusion(v) {
    return { normal: "compensado", palidez: "leve", palidez2: "moderado", extrema: "severo" }[v] || null;
  }
  function gradeFromPulso(p) {
    if (p === null || isNaN(p)) return null;
    if (p > 120 || p === 0) return "severo";
    if (p >= 101) return "moderado";
    if (p >= 91) return "leve";
    if (p >= 60) return "compensado";
    return "severo"; // pulse not palpable / below range treated as severe per "no palpable"
  }
  function gradeFromPAS(pas) {
    // Tabla Vélez 2009: Compensado/Leve = PAS normal; Moderado = "cae 80-90"; Severo = "cae <60".
    if (pas === null || isNaN(pas)) return null;
    if (pas < 60) return "severo";
    if (pas <= 90) return "moderado"; // "cae 80-90" — banda de PAS descendida hasta 90
    return "compensado"; // PAS normal (compensado o leve, sin distinguir por PAS sola)
  }

  $("#btn-velez-calc").addEventListener("click", function () {
    var sangrado = parseFloat($("#velez-sangrado").value);
    var sensorio = $("#velez-sensorio").value;
    var perfusion = $("#velez-perfusion").value;
    var pulso = parseFloat($("#velez-pulso").value);
    var pas = parseFloat($("#velez-pas").value);

    var grades = [
      gradeFromSangrado(sangrado),
      gradeFromSensorio(sensorio),
      gradeFromPerfusion(perfusion),
      gradeFromPulso(pulso),
      gradeFromPAS(pas)
    ].filter(function (g) { return g !== null; });

    var box = $("#result-velez");
    box.style.display = "block";
    if (grades.length === 0) {
      box.className = "result-box rb-neutro";
      $("#result-velez-title").textContent = "Ingresá al menos un parámetro";
      $("#result-velez-detail").textContent = "";
      return;
    }

    var worst = grades.reduce(function (a, b) {
      return GRADE_ORDER[b] > GRADE_ORDER[a] ? b : a;
    });

    box.className = "result-box " + GRADE_STATUS[worst];
    $("#result-velez-title").textContent = "Grado " + GRADE_LABEL[worst] + " (define el peor parámetro)";

    var alertTxt = "";
    if ((sangrado && sangrado > 1000) || worst !== "compensado") {
      alertTxt = " — ACTIVAR CÓDIGO ROJO (hemorragia >1000mL y/o signo de choque).";
      showAlert("alert-codigo-rojo");
    } else {
      hideAlert("alert-codigo-rojo");
    }
    $("#result-velez-detail").textContent =
      "Regla: el grado de choque lo define el peor parámetro entre sangrado, sensorio, perfusión, pulso y PAS." + alertTxt;
  });

  function showAlert(id) { document.getElementById(id).classList.add("show"); }
  function hideAlert(id) { document.getElementById(id).classList.remove("show"); }

  /* ---------- 4T's detalle ---------- */
  var FOUR_T_DETAIL = {
    tono: "<strong>Tono (70% de los casos) — atonía:</strong> oxitocina 5U IV en 3min + perfusión 30U/500cc a 125cc/h, metilergonovina, TXA, masaje uterino, compresión bimanual, balón.",
    trauma: "<strong>Trauma (20%) — desgarros:</strong> revisión del canal, reparar, TXA.",
    tejido: "<strong>Tejido (10%) — restos:</strong> revisar cavidad, retirar restos/placenta, TXA.",
    trombina: "<strong>Trombina (1%) — coagulopatía:</strong> pruebas de coagulación, test de formación de coágulo manual en tubo 7min, corregir con plasma/crioprecipitado/plaquetas."
  };
  $("#sel-4t").addEventListener("change", function () {
    var v = this.value;
    var box = $("#detail-4t");
    if (!v) { box.style.display = "none"; return; }
    box.style.display = "block";
    box.innerHTML = FOUR_T_DETAIL[v];
  });

  /* ---------- Escalada Nivel 0-3 ---------- */
  var nivelCheckboxes = $all("[data-nivel]");
  var NIVEL_LABEL = {
    0: "Nivel 0 — E-MOTIVE (detección temprana)",
    1: "Nivel 1 — TXA + compresión bimanual uterina",
    2: "Nivel 2 — 2ª línea farmacológica + balón intrauterino + transfusión",
    3: "Nivel 3 — Cirugía (B-Lynch, Hayman, Cho, histerectomía)"
  };
  function recalcNivel() {
    var maxNivel = 0;
    nivelCheckboxes.forEach(function (cb) {
      if (cb.checked) {
        var n = parseInt(cb.dataset.nivel, 10);
        if (n > maxNivel) maxNivel = n;
      }
    });
    var badge = $("#badge-nivel");
    badge.className = "badge-level lvl-" + maxNivel;
    badge.textContent = NIVEL_LABEL[maxNivel];
  }
  nivelCheckboxes.forEach(function (cb) { cb.addEventListener("change", recalcNivel); });

  /* EAPO / Score MAMÁ / Escala de Alerta Obstétrica CaVeSal®: ver app-alerta.js */

  /* ============================================================
     HELLP — Clasificación Mississippi
     ============================================================ */
  var HELLP_SRC = {
    mississippi: "Fuente: Clasificación Mississippi (Martin JN Jr et al.): plaquetas por clase + AST o ALT ≥70 (clases 1-2) o ≥40 UI/L (clase 3) + LDH ≥600 UI/L.",
    acog: "Fuente: ACOG Practice Bulletin No. 222 (2020): LDH ≥600 UI/L, AST y ALT >2 veces el límite superior normal, plaquetas <100.000/µL.",
    tennessee: "Fuente: Clasificación Tennessee (Sibai): plaquetas ≤100.000/µL, AST ≥70 UI/L, LDH ≥600 UI/L (o bilirrubina >1,2 mg/dL con frotis anormal). Completo = 3; parcial = 1-2."
  };
  function hellpToggleFields() {
    var crit = $("#hellp-criterio").value;
    $("#hellp-lsn-group").style.display = crit === "acog" ? "" : "none";
    $("#hellp-alt-group").style.display = crit === "tennessee" ? "none" : "";
    $("#hellp-bili-group").style.display = crit === "tennessee" ? "" : "none";
    $("#hellp-frotis-group").style.display = crit === "tennessee" ? "" : "none";
    $("#hellp-source").textContent = HELLP_SRC[crit];
    $("#result-hellp").style.display = "none";
  }
  $("#hellp-criterio").addEventListener("change", hellpToggleFields);
  hellpToggleFields();

  var HELLP_CONDUCTA_BASE = "MgSO4, control de PA, estabilización materna y finalización del embarazo según gravedad y EG (ACOG: en general independientemente de la EG). Corticoides solo para maduración pulmonar fetal según EG.";
  var HELLP_ANESTESIA = function (pl) {
    if (isNaN(pl)) return "";
    return pl >= 70000
      ? " Neuroaxial aceptable (≥70.000/µL) si el recuento es estable, sin coagulopatía ni antiagregantes/anticoagulantes."
      : " Plaquetas <70.000/µL: evitar anestesia neuroaxial; considerar anestesia general.";
  };

  $("#btn-hellp-calc").addEventListener("click", function () {
    var crit = $("#hellp-criterio").value;
    var pl = parseFloat($("#hellp-plaquetas").value);
    var ast = parseFloat($("#hellp-ast").value);
    var alt = parseFloat($("#hellp-alt").value);
    var ldh = parseFloat($("#hellp-ldh").value);
    var box = $("#result-hellp");
    box.style.display = "block";
    if (isNaN(pl)) {
      box.className = "result-box rb-neutro";
      $("#result-hellp-title").textContent = "Ingresá al menos el recuento de plaquetas";
      $("#result-hellp-detail").textContent = "";
      return;
    }
    var titulo, status, detalle;
    var maxTrans = Math.max(isNaN(ast) ? -1 : ast, isNaN(alt) ? -1 : alt);
    var labsOk = !isNaN(ldh) && maxTrans >= 0;

    if (crit === "mississippi") {
      var clase = null, umbralTrans = 70, status0;
      if (pl <= 50000) { clase = 1; status0 = "rb-rojo"; }
      else if (pl <= 100000) { clase = 2; status0 = "rb-naranja"; }
      else if (pl <= 150000) { clase = 3; status0 = "rb-amarillo"; umbralTrans = 40; }
      if (clase === null) {
        titulo = "Plaquetas >150.000/µL — fuera de la clasificación Mississippi";
        status = "rb-verde";
        detalle = "No cumple criterio plaquetario de HELLP. Reevaluar clínica y laboratorio seriado.";
      } else {
        var rango = clase === 1 ? "≤50.000/µL" : clase === 2 ? "50.001-100.000/µL" : "100.001-150.000/µL";
        var nombre = clase === 1 ? "severo" : clase === 2 ? "moderado" : "leve";
        if (!labsOk) {
          titulo = "Mississippi Clase " + clase + " (" + rango + ") — " + nombre + " · clasificación parcial";
          status = status0;
          detalle = "Clasificado solo por plaquetas. Para confirmar, cargá AST/ALT (≥" + umbralTrans + " UI/L) y LDH (≥600 UI/L). " + HELLP_CONDUCTA_BASE;
        } else if (maxTrans >= umbralTrans && ldh >= 600) {
          titulo = "HELLP Mississippi Clase " + clase + " (" + rango + ") — " + nombre;
          status = status0;
          detalle = HELLP_CONDUCTA_BASE + (clase === 1 ? " Alto riesgo de CID/hemorragia: preparar hemoderivados y plaquetas antes de cirugía." : "");
        } else {
          titulo = "Plaquetas en rango de Clase " + clase + ", pero sin criterio bioquímico completo";
          status = "rb-amarillo";
          detalle = "Requiere AST o ALT ≥" + umbralTrans + " UI/L y LDH ≥600 UI/L. Valores cargados: AST/ALT máx " + maxTrans + ", LDH " + ldh + ". Descartar otras causas de trombocitopenia (PTI, PTT, SHU, hígado graso agudo) y repetir laboratorio.";
        }
        detalle += HELLP_ANESTESIA(pl);
      }
    } else if (crit === "acog") {
      var lsn = parseFloat($("#hellp-lsn").value) || 40;
      if (isNaN(ast) || isNaN(alt) || isNaN(ldh)) {
        titulo = "Faltan datos para ACOG: AST, ALT y LDH";
        status = "rb-neutro";
        detalle = "ACOG PB 222 requiere LDH ≥600, AST y ALT >2× límite superior normal (" + (2 * lsn) + " UI/L con LSN " + lsn + ") y plaquetas <100.000/µL.";
      } else {
        var c1 = pl < 100000, c2 = ast > 2 * lsn && alt > 2 * lsn, c3 = ldh >= 600;
        var n = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
        var faltan = [];
        if (!c1) faltan.push("plaquetas <100.000/µL");
        if (!c2) faltan.push("AST y ALT >" + (2 * lsn) + " UI/L");
        if (!c3) faltan.push("LDH ≥600 UI/L");
        if (n === 3) {
          titulo = "HELLP según ACOG PB 222 (3/3 criterios)";
          status = pl <= 50000 ? "rb-rojo" : "rb-naranja";
          detalle = HELLP_CONDUCTA_BASE + HELLP_ANESTESIA(pl);
        } else {
          titulo = "No cumple criterio ACOG completo (" + n + "/3)";
          status = n >= 1 ? "rb-amarillo" : "rb-verde";
          detalle = "Falta: " + faltan.join("; ") + ". Vigilancia estrecha y laboratorio seriado si hay preeclampsia." + HELLP_ANESTESIA(pl);
        }
      }
    } else {
      var bili = parseFloat($("#hellp-bili").value);
      var frotis = $("#hellp-frotis").value;
      var t1 = pl < 100000;
      var t2 = !isNaN(ast) && ast >= 70;
      var t3 = (!isNaN(ldh) && ldh >= 600) || (!isNaN(bili) && bili > 1.2 && frotis === "anormal");
      var m = (t1 ? 1 : 0) + (t2 ? 1 : 0) + (t3 ? 1 : 0);
      var faltanT = [];
      if (!t1) faltanT.push("plaquetas <100.000/µL");
      if (!t2) faltanT.push("AST ≥70 UI/L");
      if (!t3) faltanT.push("LDH ≥600 UI/L (o bilirrubina >1,2 mg/dL con frotis anormal)");
      if (m === 3) {
        titulo = "HELLP completo — Tennessee (3/3)";
        status = pl <= 50000 ? "rb-rojo" : "rb-naranja";
        detalle = HELLP_CONDUCTA_BASE + HELLP_ANESTESIA(pl);
      } else if (m >= 1) {
        titulo = "HELLP parcial — Tennessee (" + m + "/3)";
        status = "rb-amarillo";
        detalle = "Falta: " + faltanT.join("; ") + ". Puede progresar a HELLP completo: laboratorio seriado y vigilancia estrecha." + HELLP_ANESTESIA(pl);
      } else {
        titulo = "Sin criterios de HELLP — Tennessee (0/3)";
        status = "rb-verde";
        detalle = "Reevaluar según clínica.";
      }
    }
    box.className = "result-box " + status;
    $("#result-hellp-title").textContent = titulo;
    $("#result-hellp-detail").textContent = detalle;
  });

  /* ============================================================
     CÓDIGO THAE — clasificación automática PAS/PAD + PE grave
     ============================================================ */
  function recalcTHAEClasif() {
    var pas = parseFloat(inPas.value);
    var pad = parseFloat(inPad.value);
    var box = $("#result-thae-clasif");
    if (isNaN(pas) || isNaN(pad)) {
      box.className = "result-box rb-neutro";
      $("#result-thae-clasif-title").textContent = "Ingresá PAS/PAD en la barra superior";
      $("#result-thae-clasif-detail").textContent = "";
      hideAlert("alert-thae");
      return;
    }
    var severa = pas >= 160 || pad >= 110;
    var leve = !severa && (pas >= 140 || pad >= 90);
    if (severa) {
      box.className = "result-box rb-rojo";
      $("#result-thae-clasif-title").textContent = "Hipertensión SEVERA (2 tomas separadas 15min)";
      $("#result-thae-clasif-detail").textContent = "PAS≥160 o PAD≥110 → activar código.";
      showAlert("alert-thae");
    } else if (leve) {
      box.className = "result-box rb-amarillo";
      $("#result-thae-clasif-title").textContent = "Hipertensión LEVE (2 tomas separadas 4h)";
      $("#result-thae-clasif-detail").textContent = "PAS 140-159 o PAD 90-109.";
      hideAlert("alert-thae");
    } else {
      box.className = "result-box rb-verde";
      $("#result-thae-clasif-title").textContent = "Sin criterios de hipertensión";
      $("#result-thae-clasif-detail").textContent = "PAS<140 y PAD<90.";
      hideAlert("alert-thae");
    }
  }

  var organoCheckboxes = $all("[data-organo]");
  function recalcPEGrave() {
    var pas = parseFloat(inPas.value);
    var pad = parseFloat(inPad.value);
    var severa = pas >= 160 || pad >= 110;
    var anyOrgano = organoCheckboxes.some(function (cb) { return cb.checked && cb.dataset.organo !== "proteinuria"; });
    var proteinuria = organoCheckboxes.some(function (cb) { return cb.checked && cb.dataset.organo === "proteinuria"; });
    var box = $("#result-pe-grave");
    if (severa && (anyOrgano || proteinuria)) {
      box.className = "result-box rb-rojo";
      $("#result-pe-grave-title").textContent = "PREECLAMPSIA GRAVE (severa + lesión de órgano blanco y/o proteinuria)";
    } else if (severa) {
      box.className = "result-box rb-amarillo";
      $("#result-pe-grave-title").textContent = "Hipertensión severa sin criterios adicionales marcados aún";
    } else {
      box.className = "result-box rb-neutro";
      $("#result-pe-grave-title").textContent = "Sin criterios marcados";
    }
  }
  organoCheckboxes.forEach(function (cb) { cb.addEventListener("change", recalcPEGrave); });

  /* ---------- Selector antihipertensivo / MgSO4 ---------- */
  var ANTIHTA_DETAIL = {
    nifedipino: "<strong>Nifedipino VO:</strong> 10-20-20mg c/20min. Dosis máxima: 180mg/día.",
    labetalol: "<strong>Labetalol IV:</strong> 20-40-80mg c/10min. Dosis máxima: 300mg/día.",
    hidralazina: "<strong>Hidralazina IV:</strong> 5-10mg c/20min. Dosis máxima: 20mg/día.",
    nicardipina: "<strong>Nicardipina (infusión):</strong> 5mg/h incrementando 2.5mg/h c/5min. Dosis máxima: 10mg/h.",
    nitroprusiato: "<strong>Nitroprusiato de sodio:</strong> 0.2µg/kg/min incrementando c/5min. Dosis máxima: 4µg/kg/min.",
    mgso4: "<strong>Sulfato de magnesio:</strong> bolo (impregnación) 4-6g IV + mantenimiento 1-2g/h hasta 24h posparto. Vigilar toxicidad."
  };
  $("#sel-antihta").addEventListener("change", function () {
    var v = this.value;
    var box = $("#detail-antihta");
    if (!v) { box.style.display = "none"; return; }
    box.style.display = "block";
    box.innerHTML = ANTIHTA_DETAIL[v];
  });

  /* ---------- Checklist eclampsia toggle ---------- */
  $("#chk-convulsiones").addEventListener("change", function () {
    $("#eclampsia-detail").style.display = this.checked ? "block" : "none";
  });

  /* ============================================================
     SEPSIS MATERNA — Criterios California + choque séptico
     ============================================================ */
  var calCheckboxes = $all("[data-cal]");
  var pamPostBolo = $("#pam-post-bolo");

  function recalcSepsis() {
    var calCount = calCheckboxes.filter(function (cb) { return cb.checked; }).length;
    var box = $("#result-sepsis");
    var pam = parseFloat(pamPostBolo.value);

    if (calCount >= 2) {
      if (!isNaN(pam) && pam < 65) {
        box.className = "result-box rb-rojo";
        $("#result-sepsis-title").textContent = "CHOQUE SÉPTICO";
        $("#result-sepsis-detail").textContent = "≥2 criterios California + PAM<65 tras bolo 30mL/kg. Iniciar vasopresores (norepinefrina 0.05µg/kg/min hasta PAM≥60).";
        showAlert("alert-sepsis");
        $("#alert-sepsis-text").textContent = "CHOQUE SÉPTICO — activar vasopresores";
      } else {
        box.className = "result-box rb-naranja";
        $("#result-sepsis-title").textContent = "SEPSIS";
        $("#result-sepsis-detail").textContent = "≥2 de 4 criterios California + sospecha de infección → iniciar 1-2L cristaloides + antibióticos + vigilancia.";
        showAlert("alert-sepsis");
        $("#alert-sepsis-text").textContent = "SOSPECHA DE SEPSIS — iniciar bundle";
      }
    } else {
      box.className = "result-box rb-neutro";
      $("#result-sepsis-title").textContent = calCount + " de 4 criterios California marcados";
      $("#result-sepsis-detail").textContent = "Se requieren 2 de 4 + sospecha de infección para clasificar como sepsis.";
      hideAlert("alert-sepsis");
    }
  }
  calCheckboxes.forEach(function (cb) { cb.addEventListener("change", recalcSepsis); });
  pamPostBolo.addEventListener("input", recalcSepsis);

  /* ============================================================
     qSOFA + SIRS — selector comparativo de tamizaje (informativo,
     no reemplaza a Criterios California, que son los que validan
     la conducta/alerta de este módulo)
     ============================================================ */
  var qsofaCheckboxes = $all("[data-qsofa]");
  var sirsCheckboxes = $all("[data-sirs]");

  function recalcQsofa() {
    var n = qsofaCheckboxes.filter(function (cb) { return cb.checked; }).length;
    var box = $("#result-qsofa");
    if (n >= 2) {
      box.className = "result-box rb-naranja";
      $("#result-qsofa-title").textContent = "qSOFA " + n + "/3 — mayor riesgo de mala evolución";
      $("#result-qsofa-detail").textContent = "≥2 criterios: asociado a mayor mortalidad y estancia en UCI. Alta especificidad, baja sensibilidad — un qSOFA negativo NO descarta sepsis temprana. Complementar con Criterios California y evaluación clínica.";
    } else {
      box.className = n === 1 ? "result-box rb-amarillo" : "result-box rb-neutro";
      $("#result-qsofa-title").textContent = n + " de 3 criterios qSOFA marcados";
      $("#result-qsofa-detail").textContent = n === 1 ? "Un solo criterio: vigilancia estrecha, repetir evaluación." : "Sin criterios qSOFA marcados. Por su baja sensibilidad, esto no descarta sepsis temprana.";
    }
  }
  qsofaCheckboxes.forEach(function (cb) { cb.addEventListener("change", recalcQsofa); });
  recalcQsofa();

  function recalcSirs() {
    var n = sirsCheckboxes.filter(function (cb) { return cb.checked; }).length;
    var box = $("#result-sirs");
    if (n >= 2) {
      box.className = "result-box rb-naranja";
      $("#result-sirs-title").textContent = "SIRS " + n + "/4 — positivo";
      $("#result-sirs-detail").textContent = "≥2 criterios + sospecha de infección: considerar sepsis. Alta sensibilidad pero baja especificidad en la paciente obstétrica — la fisiología normal del embarazo puede generar falsos positivos. Confirmar con Criterios California y foco infeccioso.";
    } else {
      box.className = n === 1 ? "result-box rb-amarillo" : "result-box rb-neutro";
      $("#result-sirs-title").textContent = n + " de 4 criterios SIRS marcados";
      $("#result-sirs-detail").textContent = n === 1 ? "Un solo criterio: no cumple SIRS. Reevaluar evolución." : "Sin criterios SIRS marcados.";
    }
  }
  sirsCheckboxes.forEach(function (cb) { cb.addEventListener("change", recalcSirs); });
  recalcSirs();

  /* ============================================================
     MEOWS — Score Obstétrico de Alerta Temprana
     Tabla adaptada de Norfolk and Norwich University Hospital NHS
     Trust, MEOWS Development Group 2022 (tomada de Universidad de
     Antioquia/UNFPA, "Sepsis", pág. 17 — verificada celda por celda
     contra la imagen original). Validación: Singh S et al.
     Anaesthesia 2012;67(1):12-18.
     ============================================================ */
  function numOrNull(sel) {
    var el = $(sel);
    if (!el || el.value === "") return null;
    var n = parseFloat(el.value);
    return isNaN(n) ? null : n;
  }
  function meowsTemp(v) {
    if (v < 35) return 2;
    if (v < 36) return 1;
    if (v <= 37.4) return 0;
    if (v <= 37.9) return 1;
    if (v <= 38.9) return 2;
    return 3;
  }
  function meowsPAS(v) {
    if (v <= 70) return 3;
    if (v <= 79) return 2;
    if (v <= 89) return 1;
    if (v <= 139) return 0;
    if (v <= 149) return 1;
    if (v <= 159) return 2;
    return 3;
  }
  function meowsPAD(v) {
    if (v <= 49) return 1;
    if (v <= 89) return 0;
    if (v <= 99) return 1;
    if (v <= 109) return 2;
    return 3;
  }
  function meowsFC(v) {
    if (v <= 40) return 2;
    if (v <= 49) return 1;
    if (v <= 99) return 0;
    if (v <= 109) return 1;
    if (v <= 129) return 2;
    return 3;
  }
  function meowsFR(v) {
    if (v <= 10) return 3;
    if (v <= 20) return 0;
    if (v <= 24) return 1;
    if (v <= 29) return 2;
    return 3;
  }
  function meowsSatO2(v) {
    return v <= 94 ? 3 : 0;
  }
  function meowsDiuresis(v) {
    if (v <= 10) return 3;
    if (v <= 30) return 2;
    return 0;
  }

  function recalcMeows() {
    var box = $("#result-meows");
    if (!box) return;
    var campos = 0, suma = 0, hayRojo = false;
    function acc(v, scorer) {
      if (v === null) return;
      campos++;
      var s = scorer(v);
      suma += s;
      if (s === 3) hayRojo = true;
    }
    acc(numOrNull("#meows-temp"), meowsTemp);
    acc(numOrNull("#meows-pas"), meowsPAS);
    acc(numOrNull("#meows-pad"), meowsPAD);
    acc(numOrNull("#meows-fc"), meowsFC);
    acc(numOrNull("#meows-fr"), meowsFR);
    acc(numOrNull("#meows-sato2"), meowsSatO2);
    acc(numOrNull("#meows-diuresis"), meowsDiuresis);
    var mentalSel = $("#meows-mental");
    var mental = mentalSel ? parseInt(mentalSel.value, 10) : 0;
    suma += mental;
    if (mental === 3) hayRojo = true;

    var titulo, detalle;
    if (campos === 0) {
      box.className = "result-box rb-neutro";
      titulo = "Cargá al menos un parámetro";
      detalle = "";
    } else if (suma >= 6) {
      box.className = "result-box rb-rojo";
      titulo = "MEOWS " + suma + " — PIENSE EN SEPSIS (alerta máxima)";
      detalle = "Monitoreo continuo de signos vitales. Llamado emergente al equipo con competencias en cuidado crítico y habilidades para el diagnóstico.";
    } else if (hayRojo || suma >= 4) {
      box.className = "result-box rb-naranja";
      titulo = "MEOWS " + suma + (hayRojo ? " (con un parámetro en zona roja)" : "") + " — PIENSE EN SEPSIS";
      detalle = "Observación mínimo cada hora. Llamado urgente al equipo médico a cargo de la paciente y al personal con competencias para el manejo de la enfermedad aguda.";
    } else if (suma >= 1) {
      box.className = "result-box rb-amarillo";
      titulo = "MEOWS " + suma + " — vigilancia estrecha";
      detalle = "Observación mínimo cada 4 horas. Llamado a la enfermera jefe a cargo.";
    } else {
      box.className = "result-box rb-verde";
      titulo = "MEOWS 0 — observación de rutina";
      detalle = "";
    }
    box.style.display = "block";
    $("#result-meows-title").textContent = titulo;
    $("#result-meows-detail").textContent = detalle;
  }
  ["#meows-temp", "#meows-pas", "#meows-pad", "#meows-fc", "#meows-fr", "#meows-sato2", "#meows-diuresis"].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener("input", recalcMeows);
  });
  if ($("#meows-mental")) $("#meows-mental").addEventListener("change", recalcMeows);
  recalcMeows();

  /* ---------- Temporizador bundle 4-5-3 ---------- */
  var timerInterval = null;
  var timerStart = null;
  $("#btn-start-timer").addEventListener("click", function () {
    timerStart = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimers, 1000);
    updateTimers();
  });

  function fmt(ms) {
    if (ms < 0) ms = 0;
    var totalSec = Math.floor(ms / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    return pad(h) + ":" + pad(m) + ":" + pad(s);
  }

  function updateTimers() {
    var elapsed = Date.now() - timerStart;
    $("#timer-1h-value").textContent = fmt(elapsed);
    $("#timer-3h-value").textContent = fmt(Math.max(0, 3 * 3600 * 1000 - elapsed));
    $("#timer-6h-value").textContent = fmt(Math.max(0, 6 * 3600 * 1000 - elapsed));
    $("#timer-1h").classList.toggle("active", elapsed < 3600 * 1000);
    $("#timer-3h").classList.toggle("active", elapsed < 3 * 3600 * 1000);
    $("#timer-6h").classList.toggle("active", elapsed < 6 * 3600 * 1000);
  }

  /* ---------- Esquema antibiótico por foco ---------- */
  var FOCO_DETAIL = {
    urinario: "<strong>Urinario:</strong> piperacilina-tazobactam 4.5g c/8h, o gentamicina 3-5mg/kg c/24h.",
    respiratorio: "<strong>Respiratorio:</strong> ampicilina-sulbactam 3g c/6h + claritromicina 500mg c/12h (+ oseltamivir si riesgo de influenza).",
    puerperal: "<strong>Infección puerperal:</strong> clindamicina 900mg c/8h + gentamicina 240mg c/24h o amikacina 1g c/24h; o ampicilina-sulbactam 3g c/6h; o esquema penicilina cristalina + metronidazol + gentamicina."
  };
  $("#sel-foco").addEventListener("change", function () {
    var v = this.value;
    var box = $("#detail-foco");
    if (!v) { box.style.display = "none"; return; }
    box.style.display = "block";
    box.innerHTML = FOCO_DETAIL[v];
  });


  /* ============================================================
     TROMBOPROFILAXIS OBSTÉTRICA — Grillo-Ardila et al. 2017
     (Rev Colomb Obstet Ginecol 2017;68(4):285-304, Tabla 3)
     Sistema semáforo de 4 niveles: gana la categoría más grave
     con al menos 1 factor marcado; dentro de esa categoría, la
     acción depende del número de factores presentes.
     ============================================================ */
  var TROMBO_TIERS = [
    {
      id: "muyalto", color: "muyalto", label: "Riesgo MUY ALTO",
      triggerAt: 1,
      factors: [
        { id: "trombofilia_muyalto", t: "Trombofilia hereditaria de muy alto riesgo (Factor V Leiden, deficiencia de protrombina)" },
        { id: "trombofilia_evt", t: "Trombofilia adquirida o hereditaria con evento tromboembólico venoso (EVT) previo" },
        { id: "evt_recurrente", t: "EVT recurrente (2 o más episodios)" }
      ],
      rule: function () {
        return {
          antenatal: "Anticoagulación desde el momento de su identificación.",
          posnatal: "Anticoagulación hasta al menos 6 semanas posparto."
        };
      }
    },
    {
      id: "alto", color: "alto", label: "Riesgo ALTO",
      triggerAt: 1,
      factors: [
        { id: "obesidad_morbida", t: "Obesidad mórbida pregestacional (IMC >40 kg/m²)" },
        { id: "trombofilia_alto_saf", t: "Trombofilia hereditaria de alto riesgo o adquirida (síndrome de anticuerpos antifosfolípidos)" },
        { id: "evt_previo", t: "EVT previo (episodio único)" },
        { id: "colagenopatia", t: "Enfermedad del colágeno (lupus eritematoso sistémico, artritis reumatoidea, dermatomiositis)" },
        { id: "obito", t: "Óbito fetal" },
        {
          id: "soho", t: "Síndrome de hiperestimulación ovárica",
          note: { antenatal: "Tromboprofilaxis farmacológica en 1er trimestre y hasta que resuelva el cuadro clínico.", posnatal: "Tromboprofilaxis farmacológica posnatal hasta 6 semanas posparto." }
        },
        {
          id: "sepsis_puerperal", t: "Sepsis puerperal",
          note: { antenatal: "No aplica (factor exclusivamente posnatal).", posnatal: "Tromboprofilaxis farmacológica por 10 días posteriores al egreso." }
        },
        {
          id: "hosp_mas3d", t: "Gestante o puérpera hospitalizada >3 días (por causa distinta al nacimiento)",
          note: { antenatal: "Durante la hospitalización: tromboprofilaxis con medidas farmacológicas.", posnatal: "Tromboprofilaxis farmacológica por 10 días posteriores al egreso." }
        }
      ],
      rule: function () {
        return {
          antenatal: "Tromboprofilaxis farmacológica antenatal desde el momento de su identificación.",
          posnatal: "Tromboprofilaxis farmacológica posnatal hasta 6 semanas posparto."
        };
      }
    },
    {
      id: "moderado", color: "moderado", label: "Riesgo MODERADO",
      triggerAt: 1,
      factors: [
        { id: "obesidad_pregest", t: "Obesidad pregestacional (IMC 30-39 kg/m²)" },
        { id: "varices", t: "Várices en miembros inferiores (con edema, cambios de piel, dolor, o por encima de la rodilla)" },
        { id: "diabetes", t: "Diabetes tipo I o tipo II" },
        { id: "enf_renal", t: "Enfermedad renal preexistente" },
        { id: "tra", t: "Técnicas de reproducción asistida" },
        { id: "embarazo_multiple", t: "Embarazo múltiple" },
        { id: "hpp", t: "Hemorragia posparto" },
        { id: "preeclampsia", t: "Preeclampsia" },
        { id: "hiperemesis", t: "Hiperémesis gravídica (alteración hidroelectrolítica o del estado ácido-base)" },
        { id: "parto_pretermino", t: "Parto pretérmino" },
        { id: "cesarea", t: "Cesárea" },
        { id: "sepsis_embarazo", t: "Sepsis durante el embarazo" },
        { id: "eii", t: "Enfermedad inflamatoria intestinal" },
        { id: "cirugia_emb", t: "Procedimiento quirúrgico en el embarazo o puerperio" },
        { id: "transfusion", t: "Transfusión >2 unidades" },
        {
          id: "hosp_menos3d", t: "Gestante o puérpera hospitalizada <3 días (por causa distinta al nacimiento)",
          note: { antenatal: "Durante la hospitalización: tromboprofilaxis con cualquier intervención farmacológica o no farmacológica.", posnatal: "Al alta: tromboprofilaxis con medidas no farmacológicas por 10 días." }
        }
      ],
      rule: function (n) {
        if (n <= 1) return { antenatal: "Recomendaciones generales.", posnatal: "Recomendaciones generales." };
        return {
          antenatal: "Iniciar medidas no farmacológicas durante toda la gestación.",
          posnatal: "Tromboprofilaxis farmacológica por 10 días posparto."
        };
      }
    },
    {
      id: "bajo", color: "bajo", label: "Riesgo BAJO",
      triggerAt: 1,
      factors: [
        { id: "edad35", t: "Edad >35 años" },
        { id: "sobrepeso", t: "Sobrepeso pregestacional (IMC 25-30 kg/m²)" },
        { id: "tabaquismo_bajo", t: "Tabaquismo" },
        { id: "hta_cronica", t: "Hipertensión arterial crónica" },
        { id: "hemorragia_anteparto", t: "Hemorragia anteparto" },
        { id: "induccion", t: "Inducción del trabajo de parto" },
        { id: "multiparidad", t: "3 o más partos" },
        { id: "corioamnionitis", t: "Corioamnionitis" },
        { id: "viaje", t: "Viaje mayor de 4 horas" }
      ],
      rule: function (n) {
        if (n <= 2) return { antenatal: "Recomendaciones generales.", posnatal: "Recomendaciones generales." };
        if (n <= 5) return {
          antenatal: "Iniciar medidas no farmacológicas desde el momento de su identificación.",
          posnatal: "10 días de tromboprofilaxis con medidas farmacológicas."
        };
        return {
          antenatal: "Iniciar medidas no farmacológicas + tromboprofilaxis farmacológica desde semana 28, a menos que exista contraindicación.",
          posnatal: "10 días de tromboprofilaxis con medidas farmacológicas."
        };
      }
    }
  ];

  var trombeState = {};
  var trombeTiersEl = $("#trombo-tiers");
  if (trombeTiersEl) {
    TROMBO_TIERS.forEach(function (tier) {
      var wrap = document.createElement("div");
      wrap.className = "trombo-tier " + tier.color;
      var header = document.createElement("div");
      header.className = "trombo-tier-header";
      header.innerHTML =
        '<span class="trombo-tier-title">' + tier.label + '</span>' +
        '<span class="trombo-tier-count" id="trombo-count-' + tier.id + '">0 factores</span>';
      wrap.appendChild(header);
      var list = document.createElement("div");
      list.className = "checklist";
      tier.factors.forEach(function (f) {
        var label = document.createElement("label");
        label.innerHTML = '<input type="checkbox" data-trombo-tier="' + tier.id + '" data-trombo-factor="' + f.id + '">' + f.t;
        list.appendChild(label);
      });
      wrap.appendChild(list);
      trombeTiersEl.appendChild(wrap);
    });

    trombeTiersEl.addEventListener("change", function (e) {
      var input = e.target;
      if (input.type !== "checkbox") return;
      recalcTromboprofilaxis();
    });
  }

  var TROMBO_COLOR_RANK = { bajo: 0, moderado: 1, alto: 2, muyalto: 3 };
  var TROMBO_RESULT_CLASS = { bajo: "rb-verde", moderado: "rb-amarillo", alto: "rb-naranja", muyalto: "rb-rojo" };

  function recalcTromboprofilaxis() {
    var box = $("#result-trombo");
    if (!box) return;
    var checked = $all('[data-trombo-tier]:checked');
    TROMBO_TIERS.forEach(function (tier) {
      var count = checked.filter(function (c) { return c.dataset.tromboTier === tier.id; }).length;
      var countEl = $("#trombo-count-" + tier.id);
      if (countEl) countEl.textContent = count + (count === 1 ? " factor" : " factores");
    });

    if (checked.length === 0) {
      box.className = "result-box rb-neutro eapo-summary";
      $("#result-trombo-title").textContent = "Seleccioná los factores de riesgo presentes";
      $("#result-trombo-detail").textContent = "Sin factores marcados: aplican solo las medidas generales para todas las pacientes (hidratación y deambulación precoz).";
      return;
    }

    var worstTier = null;
    for (var i = 0; i < TROMBO_TIERS.length; i++) {
      var tier = TROMBO_TIERS[i];
      var tierChecked = checked.filter(function (c) { return c.dataset.tromboTier === tier.id; });
      if (tierChecked.length > 0 && (!worstTier || TROMBO_COLOR_RANK[tier.id] > TROMBO_COLOR_RANK[worstTier.tier.id])) {
        worstTier = { tier: tier, count: tierChecked.length, checked: tierChecked };
      }
    }

    var rec = worstTier.tier.rule(worstTier.count);
    box.className = "result-box eapo-summary " + TROMBO_RESULT_CLASS[worstTier.tier.id];
    $("#result-trombo-title").textContent = worstTier.tier.label + " (" + worstTier.count + " " + (worstTier.count === 1 ? "factor de esta categoría" : "factores de esta categoría") + ")";

    var detailHtml = "<strong>Antenatal:</strong> " + rec.antenatal + "<br><strong>Posnatal:</strong> " + rec.posnatal;

    // Notas específicas por factor (excepciones con texto propio en la guía)
    var notes = [];
    TROMBO_TIERS.forEach(function (tier) {
      tier.factors.forEach(function (f) {
        if (!f.note) return;
        var isChecked = checked.some(function (c) { return c.dataset.tromboFactor === f.id; });
        if (isChecked) notes.push({ label: f.t, note: f.note });
      });
    });
    if (notes.length > 0) {
      detailHtml += "<br><br><strong>Notas específicas por factor marcado:</strong>";
      notes.forEach(function (n) {
        detailHtml += "<br>· <em>" + n.label + "</em> — Antenatal: " + n.note.antenatal + " Posnatal: " + n.note.posnatal;
      });
    }
    $("#result-trombo-detail").innerHTML = detailHtml;
  }

  /* ---------- Calculadora de dosis de HBPM ---------- */
  var HBPM_DOSIS = {
    enoxaparina: {
      profilactica: [
        { max: 50, t: "20 mg/día" },
        { max: 90, t: "40 mg/día" },
        { max: 130, t: "60 mg/día" },
        { max: 170, t: "80 mg/día" }
      ],
      anticoagulacion: "1 mg/kg/dosis cada 12 horas"
    },
    dalteparina: {
      profilactica: [
        { max: 50, t: "2500 U/día" },
        { max: 90, t: "5000 U/día" },
        { max: 130, t: "7500 U/día" },
        { max: 170, t: "10000 U/día" }
      ],
      anticoagulacion: "5000 U cada 12 horas"
    },
    nadroparina: {
      profilactica: [
        { max: 50, t: "2850 U/día (0.3 mL)" },
        { max: 90, t: "No especificado en la guía para este rango de peso" },
        { max: 130, t: "No especificado en la guía para este rango de peso" },
        { max: 170, t: "No especificado en la guía para este rango de peso" }
      ],
      anticoagulacion: "171 U/kg/día"
    }
  };

  function recalcHBPM() {
    var detail = $("#detail-hbpm");
    if (!detail) return;
    var farmaco = $("#sel-hbpm-farmaco").value;
    var tipo = $("#sel-hbpm-tipo").value;
    var peso = parseFloat(inPeso.value);
    var data = HBPM_DOSIS[farmaco];

    if (tipo === "anticoagulacion") {
      detail.style.display = "block";
      detail.innerHTML = "<strong>Dosis de anticoagulación (" + farmaco + "):</strong> " + data.anticoagulacion +
        (peso ? "<br><span class=\"card-sub\">Peso ingresado: " + peso + " kg — ajustar según fórmula si aplica (mg/kg o U/kg).</span>" : "");
      return;
    }

    if (!peso) {
      detail.style.display = "block";
      detail.innerHTML = "Ingresá el peso de la paciente en la barra superior para calcular la dosis profiláctica.";
      return;
    }
    if (peso > 170) {
      detail.style.display = "block";
      detail.innerHTML = "Peso &gt;170 kg: la guía colombiana no incluye dosis específica para este rango — requiere valoración por especialista.";
      return;
    }
    var band = data.profilactica.find(function (b) { return peso <= b.max; });
    detail.style.display = "block";
    detail.innerHTML = "<strong>Dosis profiláctica (" + farmaco + ", peso " + peso + " kg):</strong> " + band.t;
  }

  if ($("#sel-hbpm-farmaco")) {
    $("#sel-hbpm-farmaco").addEventListener("change", recalcHBPM);
    $("#sel-hbpm-tipo").addEventListener("change", recalcHBPM);
    inPeso.addEventListener("input", recalcHBPM);
  }

  /* ---------- sFlt-1/PlGF (lógica clSflt de la calculadora prenatal) ---------- */
  function clSflt(v, eg) {
    if (v === null || isNaN(v)) return null;
    var umbralSosp = eg && eg < 34 ? 85 : 110;
    if (v > 655) return "inminente";
    if (v > umbralSosp) return "sospecha";
    if (v > 38) return "interm";
    return "descarta";
  }
  function egDesdeFum() {
    if (!inFum || !inFum.value) return null;
    var d = (new Date() - new Date(inFum.value + "T00:00:00")) / 86400000;
    return d >= 0 ? Math.floor(d / 7) : null;
  }
  var SFLT_TXT = {
    inminente: ["rb-rojo", "PE inminente (>655)", "Hospitalización urgente. Maduración pulmonar si <34 sem. Sulfato de magnesio. Finalización individualizada."],
    sospecha: ["rb-naranja", "Sospecha de preeclampsia", "Alta sospecha de PE. Proteinuria 24 h, función hepática y renal. Hospitalización si hay compromiso."],
    interm: ["rb-amarillo", "Zona intermedia / gris", "Repetir en 1-2 semanas. Vigilar PA y proteinuria. Si progresivo: hospitalizar."],
    descarta: ["rb-verde", "Descarta PE en 1 semana (≤38)", "VPN >99% para PE en la próxima semana. Control habitual."]
  };
  if ($("#btn-sflt-calc")) {
    $("#btn-sflt-calc").addEventListener("click", function () {
      var v = parseFloat($("#sflt-valor").value);
      var egIn = parseFloat($("#sflt-eg").value);
      var eg = !isNaN(egIn) ? egIn : egDesdeFum();
      var box = $("#result-sflt");
      box.style.display = "block";
      var cl = clSflt(isNaN(v) ? null : v, eg);
      if (!cl) {
        box.className = "result-box rb-neutro";
        $("#result-sflt-title").textContent = "Ingresá el cociente sFlt-1/PlGF";
        $("#result-sflt-detail").textContent = "";
        return;
      }
      var t = SFLT_TXT[cl];
      box.className = "result-box " + t[0];
      $("#result-sflt-title").textContent = "sFlt-1/PlGF " + v + " — " + t[1];
      var egTxt = eg ? "EG usada: " + eg + " sem (corte de sospecha >" + (eg < 34 ? 85 : 110) + ")" + (isNaN(egIn) ? ", tomada de la FUM." : ".") : "Sin EG: se aplicó el corte >110.";
      $("#result-sflt-detail").textContent = t[2] + " " + egTxt;
    });
  }

  /* ---------- Doppler arteria oftálmica (lógica calcAORatio2T de la calculadora prenatal) ---------- */
  function calcAO() {
    var psv1 = parseFloat($("#ao-psv1").value), psv2 = parseFloat($("#ao-psv2").value);
    var box = $("#result-ao");
    if (isNaN(psv1) || isNaN(psv2) || psv1 <= 0) { box.style.display = "none"; return; }
    var ratio = Math.round(psv2 / psv1 * 100) / 100;
    var cls, tit, det;
    if (ratio >= 0.78) {
      cls = "rb-rojo"; tit = "Ratio AO " + ratio + " (≥0.78) — compromiso vascular sistémico grave";
      det = "Mayor riesgo de RCIU severo y PE de inicio precoz. Mal pronóstico materno-fetal. Derivar a Medicina Fetal urgente. Evaluar sFlt-1/PlGF, función renal/hepática y bienestar fetal.";
    } else if (ratio >= 0.70) {
      cls = "rb-amarillo"; tit = "Ratio AO " + ratio + " (0.70-0.77) — zona gris";
      det = "Compromiso vascular intermedio. Monitoreo estrecho de PA, proteinuria y bienestar fetal. Repetir Doppler AO en 48-72 h. Evaluar sFlt-1/PlGF.";
    } else {
      cls = "rb-verde"; tit = "Ratio AO " + ratio + " (<0.70) — normal";
      det = "Sin compromiso vascular sistémico significativo. Pronóstico relativo más favorable. Continuar vigilancia habitual según EG y cuadro clínico.";
    }
    box.style.display = "block";
    box.className = "result-box " + cls;
    $("#result-ao-title").textContent = tit;
    $("#result-ao-detail").textContent = det;
  }
  if ($("#ao-psv1")) {
    $("#ao-psv1").addEventListener("input", calcAO);
    $("#ao-psv2").addEventListener("input", calcAO);
  }

  /* ---------- Inicialización ---------- */
  recalcCommon();
  recalcNivel();
})();
