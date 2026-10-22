/* ============================================================
   CaVeSal — app-demo.js (Modo Demo, Emergencias Obstétricas)
   Reutiliza exactamente la misma lógica de app-full.js para los
   módulos liberados en la demo: IMC/EG/PAM/Índice de choque
   (barra de datos comunes) y qSOFA. No debe divergir de app-full.js.
   ============================================================ */
(function () {
  "use strict";
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
  function setReadout(id, value, sub, statusClass) {
    var box = document.getElementById(id);
    var valueEl = document.getElementById(id + "-value");
    var subEl = document.getElementById(id + "-sub");
    if (!box || !valueEl) return;
    valueEl.textContent = value;
    if (sub !== undefined && subEl) subEl.textContent = sub;
    box.className = "readout " + (statusClass || "status-neutro");
  }

  /* ---------- Datos comunes de paciente: IMC, EG, PAM, Índice de choque ---------- */
  var inPeso = $("#in-peso"), inTalla = $("#in-talla"), inFum = $("#in-fum");
  var inFc = $("#in-fc"), inPas = $("#in-pas"), inPad = $("#in-pad");

  function recalcCommon() {
    recalcIMC();
    recalcEG();
    recalcPAM();
    recalcShockIndex();
  }

  function recalcIMC() {
    var peso = parseFloat(inPeso.value);
    var talla = parseFloat(inTalla.value);
    if (!peso || !talla) { setReadout("ro-imc", "—", "Ingresá peso/talla", "status-neutro"); return; }
    var tallaM = talla / 100;
    var imc = peso / (tallaM * tallaM);
    var label, status;
    if (imc >= 35) { label = "Obesidad II-III (riesgo alto)"; status = "status-rojo"; }
    else if (imc >= 30) { label = "Obesidad"; status = "status-amarillo"; }
    else if (imc >= 25) { label = "Sobrepeso (riesgo moderado)"; status = "status-amarillo"; }
    else { label = "Normal"; status = "status-verde"; }
    setReadout("ro-imc", imc.toFixed(1), label, status);
  }

  function recalcEG() {
    var fumVal = inFum.value;
    if (!fumVal) { setReadout("ro-eg", "—", "Ingresá FUM", "status-neutro"); return; }
    var fum = new Date(fumVal + "T00:00:00");
    var now = new Date();
    var diffMs = now - fum;
    if (diffMs < 0) { setReadout("ro-eg", "—", "FUM en el futuro", "status-neutro"); return; }
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var weeks = Math.floor(diffDays / 7);
    var days = diffDays % 7;
    var sub = weeks >= 24 ? "Viable (≥24 sem)" : "No viable (<24 sem)";
    var status = weeks >= 24 ? "status-verde" : "status-amarillo";
    setReadout("ro-eg", weeks + "s " + days + "d", sub, status);
  }

  function recalcPAM() {
    var pas = parseFloat(inPas.value);
    var pad = parseFloat(inPad.value);
    if (isNaN(pas) || isNaN(pad)) { setReadout("ro-pam", "—", "mmHg", "status-neutro"); return; }
    var pam = (pas + 2 * pad) / 3;
    var sub, status;
    var semActual = null;
    if (inFum.value) {
      var dd = (new Date() - new Date(inFum.value + "T00:00:00")) / 86400000;
      if (dd >= 0) semActual = Math.floor(dd / 7);
    }
    if (pam >= 105) { sub = "Alarma ≥105"; status = "status-rojo"; }
    else if (pam > 90 && semActual !== null && semActual <= 14) { sub = "Riesgo PE (1º trim.)"; status = "status-amarillo"; }
    else if (pam > 90) { sub = "Leve elevada >90"; status = "status-verde"; }
    else { sub = "mmHg — sin alerta"; status = "status-verde"; }
    setReadout("ro-pam", pam.toFixed(0), sub, status);
  }

  function recalcShockIndex() {
    var fc = parseFloat(inFc.value);
    var pas = parseFloat(inPas.value);
    if (!fc || !pas) { setReadout("ro-si", "—", "FC/PAS", "status-neutro"); return; }
    var si = fc / pas;
    var sub, status;
    if (si >= 1.7) { sub = "Alta probabilidad result. adverso"; status = "status-rojo"; }
    else if (si >= 1.4) { sub = "Necesidad urgente de intervención"; status = "status-naranja"; }
    else if (si >= 0.9) { sub = "Marcador de severidad"; status = "status-amarillo"; }
    else { sub = "Normal"; status = "status-verde"; }
    setReadout("ro-si", si.toFixed(2), sub, status);
  }

  [inPeso, inTalla, inFum, inFc, inPas, inPad].forEach(function (el) {
    if (el) el.addEventListener("input", recalcCommon);
  });
  recalcCommon();

  /* ---------- qSOFA (idéntico a app-full.js) ---------- */
  var qsofaCheckboxes = $all("[data-qsofa]");
  function recalcQsofa() {
    var n = qsofaCheckboxes.filter(function (cb) { return cb.checked; }).length;
    var box = $("#result-qsofa");
    if (!box) return;
    if (n >= 2) {
      box.className = "result-box rb-naranja";
      $("#result-qsofa-title").textContent = "qSOFA " + n + "/3 — mayor riesgo de mala evolución";
      $("#result-qsofa-detail").textContent = "≥2 criterios: asociado a mayor mortalidad y estancia en UCI. Alta especificidad, baja sensibilidad — un qSOFA negativo NO descarta sepsis temprana. En la versión completa esto se complementa con Criterios California, SIRS y MEOWS.";
    } else {
      box.className = n === 1 ? "result-box rb-amarillo" : "result-box rb-neutro";
      $("#result-qsofa-title").textContent = n + " de 3 criterios qSOFA marcados";
      $("#result-qsofa-detail").textContent = n === 1 ? "Un solo criterio: vigilancia estrecha, repetir evaluación." : "Sin criterios qSOFA marcados. Por su baja sensibilidad, esto no descarta sepsis temprana.";
    }
  }
  qsofaCheckboxes.forEach(function (cb) { cb.addEventListener("change", recalcQsofa); });
  recalcQsofa();
})();
