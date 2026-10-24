/* CaVeSal® Emergencias — Sangrado y coagulación + índice TAM/FC
   Algoritmo propio CaVeSal®. Fuentes citadas en cada tarjeta y en bibliografia.html */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function num(id) { var el = $(id); if (!el) return NaN; var v = parseFloat(String(el.value).replace(",", ".")); return isNaN(v) ? NaN : v; }
  function val(id) { var el = $(id); return el ? el.value : ""; }
  function f0(x) { return Math.round(x).toLocaleString("es-PY"); }
  function f1(x) { return (Math.round(x * 10) / 10).toLocaleString("es-PY"); }
  function f2(x) { return (Math.round(x * 100) / 100).toLocaleString("es-PY"); }
  function box(prefix, cls, title, html) {
    var b = $("result-" + prefix);
    if (!b) return;
    b.className = "result-box " + cls;
    b.style.display = "";
    $("result-" + prefix + "-title").textContent = title;
    $("result-" + prefix + "-detail").innerHTML = html;
  }
  function li(arr) { return "<ul>" + arr.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }

  function peso() { return num("in-peso"); }
  function imc() { var p = num("in-peso"), t = num("in-talla"); return (p && t) ? p / Math.pow(t / 100, 2) : NaN; }

  /* ---------- Volemia (SOGC 431) ---------- */
  function volFactor() {
    var sel = val("vol-factor");
    if (sel === "100" || sel === "70") return { f: +sel, why: "elegido manualmente" };
    var i = imc(), pe = val("vol-pe") === "1";
    if (pe) return { f: 70, why: "contracción de volumen (preeclampsia grave)" };
    if (!isNaN(i) && i >= 30) return { f: 70, why: "obesidad (IMC " + f1(i) + ")" };
    if (isNaN(i)) return { f: 100, why: "embarazo sano (sin talla: IMC no evaluado)" };
    return { f: 100, why: "embarazo sano (IMC " + f1(i) + ")" };
  }
  function ebv() { var p = peso(); if (!p) return NaN; return p * volFactor().f; }

  function calcVol() {
    var p = peso();
    if (!p) { box("vol", "rb-neutro", "Falta el peso en la barra superior", ""); return; }
    var vf = volFactor(), v = p * vf.f;
    var hbi = num("vol-hbi"), hbf = num("vol-hbf");
    var out = ["Volemia estimada: <strong>" + f0(v) + " mL</strong> (" + vf.f + " mL/kg × " + f1(p) + " kg; " + vf.why + ")."];
    out.push("Pérdida según grado de choque (Vélez 2009), personalizada: compensado 10–15 % = " + f0(v * 0.10) + "–" + f0(v * 0.15) +
      " mL · leve 16–30 % = " + f0(v * 0.16) + "–" + f0(v * 0.30) + " mL · moderado 31–40 % = " + f0(v * 0.31) + "–" + f0(v * 0.40) +
      " mL · severo &gt;40 % = &gt;" + f0(v * 0.40) + " mL.");
    var title = "Volemia " + f0(v) + " mL", cls = "rb-neutro";
    if (!isNaN(hbi) && !isNaN(hbf)) {
      if (hbi <= hbf) { out.push("La Hb inicial es igual o menor que la mínima aceptable: no hay margen de pérdida; evaluar transfusión según clínica."); cls = "rb-rojo"; title += " · sin margen"; }
      else {
        var mabl = (hbi - hbf) * v / ((hbi + hbf) * 0.5);
        title += " · pérdida permitida ≈ " + f0(mabl) + " mL";
        cls = "rb-amarillo";
        out.push("Pérdida sanguínea máxima permitida (MABL) hasta Hb " + f1(hbf) + " g/dL: <strong>≈ " + f0(mabl) + " mL</strong> (" + f0(mabl / v * 100) + " % de la volemia).");
      }
    } else out.push("Cargá Hb inicial para calcular la pérdida permitida.");
    out.push("Es una estimación: en hemorragia aguda la Hb tarda en descender; guiarse por clínica, índice de choque y cuantificación.");
    box("vol", cls, title, li(out));
  }

  /* ---------- Cuantificación (ACOG CO 794) ---------- */
  function calcQBL() {
    var warn = [], parts = [], total = 0;
    function grav(nId, wId, dId, label) {
      var n = num(nId) || 0, w = num(wId) || 0, d = num(dId);
      if (!w) return 0;
      if (n && isNaN(d)) warn.push("Falta el peso seco de " + label + ": se tomó el peso húmedo completo (sobreestima).");
      var s = Math.max(0, w - (isNaN(d) ? 0 : n * d));
      parts.push(label + ": " + f0(s) + " mL");
      return s;
    }
    total += grav("qbl-comp-n", "qbl-comp-w", "qbl-comp-d", "compresas");
    total += grav("qbl-gasa-n", "qbl-gasa-w", "qbl-gasa-d", "gasas");
    var asp = num("qbl-asp") || 0, la = num("qbl-la") || 0, lav = num("qbl-lav") || 0;
    if (asp) { var a = Math.max(0, asp - la - lav); parts.push("aspirado neto: " + f0(a) + " mL (" + f0(asp) + " − LA " + f0(la) + " − lavado " + f0(lav) + ")"); total += a; }
    var bolsa = num("qbl-bolsa") || 0;
    if (bolsa) { parts.push("bolsa colectora / otros: " + f0(bolsa) + " mL"); total += bolsa; }
    if (!parts.length) { box("qbl", "rb-neutro", "Cargá al menos un componente", ""); return; }
    var ces = val("qbl-via") === "ces", out = parts.slice();
    var cls = "rb-verde", title = "Pérdida cuantificada: " + f0(total) + " mL";
    /* Criterio HPP OMS/FIGO/ICM 2025 (rec. 22), para todas las vías: ≥300 mL + signo anormal, o ≥500 mL */
    var fc = num("in-fc"), pas = num("in-pas"), pad = num("in-pad"), sg = [];
    if (!isNaN(fc) && fc > 100) sg.push("FC " + f0(fc) + " &gt;100");
    if (!isNaN(fc) && !isNaN(pas) && pas > 0 && fc / pas > 1) sg.push("índice de choque " + (fc / pas).toFixed(2) + " &gt;1");
    if (!isNaN(pas) && pas < 100) sg.push("PAS " + f0(pas) + " &lt;100");
    if (!isNaN(pad) && pad < 60) sg.push("PAD " + f0(pad) + " &lt;60");
    var sinSV = isNaN(fc) && isNaN(pas) && isNaN(pad);
    if (total >= 1000) { cls = "rb-rojo"; out.push("<strong>≥1000 mL: hemorragia posparto</strong> (OMS 2025; también umbral clásico reVITALize/ACOG). Activar Código Rojo y escalar."); }
    else if (total >= 500) { cls = "rb-rojo"; out.push("<strong>≥500 mL: hemorragia posparto (OMS 2025, rec. 22)</strong>" + (ces ? ", también en cesárea" : "") + ". Iniciar MOTIVE y activar Código Rojo."); }
    else if (total >= 300 && sg.length) { cls = "rb-rojo"; out.push("<strong>≥300 mL con " + sg.join(", ") + ": hemorragia posparto (OMS 2025, rec. 22).</strong> Lo que más pesa es el signo de descompensación: iniciar MOTIVE y activar Código Rojo."); }
    else if (total >= 300) { cls = "rb-naranja"; out.push("≥300 mL: " + (sinSV ? "cargá FC y PA arriba (Signos vitales). Con FC &gt;100, índice de choque &gt;1, PAS &lt;100 o PAD &lt;60 ya es hemorragia posparto (OMS 2025)." : "sin signos anormales por ahora; con cualquier signo anormal ya es hemorragia posparto (OMS 2025). Repetir FC y PA.")); }
    if (ces && total < 1000 && total >= 300) out.push("Cesárea: la OMS 2025 aplica el mismo criterio a todas las vías y advierte no normalizar pérdidas mayores en cesárea; el umbral ≥1000 mL de reVITALize/ACOG queda como referencia histórica.");
    var v = ebv();
    if (!isNaN(v)) {
      var pct = total / v * 100, g;
      if (pct > 40) g = "severo (&gt;40 %)"; else if (pct > 30) g = "moderado (31–40 %)"; else if (pct > 15) g = "leve (16–30 %)"; else if (pct >= 10) g = "compensado (10–15 %)"; else g = "&lt;10 %";
      out.push("Equivale al <strong>" + f0(pct) + " %</strong> de la volemia estimada (" + f0(v) + " mL) — grado de choque esperado: " + g + ". Contrastar con signos vitales.");
    } else out.push("Cargá el peso para expresar la pérdida como % de la volemia.");
    box("qbl", cls, title, li(out.concat(warn)));
  }

  /* ---------- Scores de CID + conducta ---------- */
  var CID_SRC = {
    isth2025: "Algoritmo propio CaVeSal® · Basado en: Iba T et al. Updated definition and scoring of DIC in 2025, ISTH SSC (J Thromb Haemost 2025;23:2356-62).",
    isth2001: "Algoritmo propio CaVeSal® · Basado en: Taylor FB Jr et al. ISTH SSC (Thromb Haemost 2001;86:1327-30).",
    erez: "Tabla adaptada (traducida) de Erez O et al. DIC score for pregnant women (PLoS ONE 2014;9:e93240) · Licencia CC BY 4.0.",
    jsog: "Algoritmo propio CaVeSal® · Basado en: Morikawa M et al. Obstetric DIC diagnostic criteria, JSOG 2024 (Sci Rep 2024;14:17677)."
  };
  var CONDUCTA_SRC = " Conducta: RCOG GTG 52 (BJOG 2017;124:e106-49); Collins P et al. ISTH SSC 2016 (J Thromb Haemost 2016;14:205-10); dosis de fibrinógeno: ficha FDA RiaSTAP.";
  function cidFields() {
    var sc = val("cid-score");
    document.querySelectorAll(".cid-f").forEach(function (el) {
      el.style.display = el.classList.contains("cid-" + sc) ? "" : "none";
    });
    var s = $("cid-source"); if (s) s.textContent = CID_SRC[sc] + CONDUCTA_SRC;
  }

  function calcCID() {
    var sc = val("cid-score"), plq = num("cid-plq"), fib = num("cid-fib"), tp = num("cid-tp"), tpc = num("cid-tpc");
    var dtp = (!isNaN(tp) && !isNaN(tpc)) ? tp - tpc : NaN;
    var pts = 0, miss = [], det = [];
    function add(p, txt) { pts += p; det.push(txt + " → " + p); }
    if (sc === "isth2025" || sc === "isth2001") {
      if (isNaN(plq)) miss.push("plaquetas"); else add(plq < 50 ? 2 : plq < 100 ? 1 : 0, "Plaquetas " + f0(plq));
      if (sc === "isth2025") {
        var dd = num("cid-dd"), lsn = num("cid-ddlsn");
        if (isNaN(dd) || !lsn) miss.push("dímero D y su LSN");
        else { var r = dd / lsn; add(r > 7 ? 3 : r > 3 ? 2 : 0, "Dímero D " + f1(r) + "× LSN"); }
      } else add(+val("cid-marc"), "Marcador de fibrina");
      if (isNaN(dtp)) miss.push("TP y TP control"); else add(dtp >= 6 ? 2 : dtp >= 3 ? 1 : 0, "TP prolongado " + f1(dtp) + " s");
      if (isNaN(fib)) miss.push("fibrinógeno"); else add(fib < 100 ? 1 : 0, "Fibrinógeno " + f0(fib) + " mg/dL");
      var cut = 5, pos = pts >= cut;
      var interp = pos ? "Compatible con CID manifiesta (≥5). Repetir score a diario." : "No sugiere CID manifiesta (&lt;5). Repetir en 1–2 días si persiste la sospecha.";
    } else if (sc === "erez") {
      if (isNaN(dtp)) miss.push("TP y TP control"); else add(dtp < 0.5 ? 0 : dtp <= 1 ? 5 : dtp <= 1.5 ? 12 : 25, "Diferencia de TP " + f1(dtp) + " s");
      if (isNaN(plq)) miss.push("plaquetas"); else add(plq > 185 ? 0 : plq >= 100 ? 1 : plq >= 50 ? 2 : 1, "Plaquetas " + f0(plq));
      if (isNaN(fib)) miss.push("fibrinógeno"); else { var g = fib / 100; add(g >= 4.5 ? 0 : g >= 4 ? 1 : g >= 3 ? 6 : 25, "Fibrinógeno " + f2(g) + " g/L"); }
      cut = 26; pos = pts >= cut;
      interp = pos ? "Compatible con CID en el embarazo (≥26; sensibilidad 88 %, especificidad 96 %)." : "Por debajo del corte de CID (&lt;26).";
    } else {
      add(+val("cid-base"), "Condición de base");
      if (isNaN(fib)) miss.push("fibrinógeno"); else add(fib >= 300 ? 0 : fib >= 200 ? 1 : fib >= 150 ? 2 : 3, "Fibrinógeno " + f0(fib) + " mg/dL");
      var fv = num("cid-fibval"), isdd = val("cid-fibrinol") === "dd";
      if (isNaN(fv)) miss.push("PDF o dímero D");
      else add(isdd ? (fv >= 25 ? 2 : fv >= 15 ? 1 : 0) : (fv >= 60 ? 2 : fv >= 30 ? 1 : 0), (isdd ? "Dímero D " : "PDF ") + f1(fv) + " µg/mL");
      cut = 8; pos = pts >= cut;
      interp = pos ? "CID obstétrica (≥8, JSOG 2024). Iniciar reposición sin esperar nuevos controles." : "No cumple CID obstétrica (&lt;8). Aplica a puérperas con HPP de difícil control.";
    }
    var out = det.slice();
    out.push("<strong>Total: " + pts + " puntos.</strong> " + interp);
    if (miss.length) out.push("Score parcial: faltan " + miss.join(", ") + ".");

    // Conducta de reposición
    var cond = [], sang = val("cid-sangra") === "1", p = peso();
    if (!sang) cond.push("Sin sangrado activo: no transfundir por valores aislados; repetir controles (ISTH SSC 2016).");
    else {
      if (!isNaN(fib) && fib < 200) {
        var mgkg = (200 - fib) / 1.7;
        cond.push("Fibrinógeno &lt;200 mg/dL con sangrado: reponer. Crioprecipitado 2 pools (10 U) (RCOG) o concentrado de fibrinógeno " +
          (p ? "≈ <strong>" + f1(mgkg * p / 1000) + " g</strong> (" + f0(mgkg) + " mg/kg para llegar a 200 mg/dL)" : f0(mgkg) + " mg/kg para llegar a 200 mg/dL") + ".");
      }
      if (!isNaN(plq) && plq < 75) cond.push("Plaquetas &lt;75 000: 1 pool o 1 aféresis; objetivo &gt;50 000.");
      var rtp = (!isNaN(tp) && tpc) ? tp / tpc : NaN, rttpa = num("cid-ttpa"), rmax = Math.max(isNaN(rtp) ? 0 : rtp, isNaN(rttpa) ? 0 : rttpa);
      if (rmax > 1) {
        cond.push("TP/TTPa prolongado (razón " + f2(rmax) + "): PFC 12–15 mL/kg" + (p ? " ≈ <strong>" + f0(12 * p) + "–" + f0(15 * p) + " mL</strong>" : "") +
          (rmax > 1.5 ? ". Con razón &gt;1,5 probablemente se necesiten &gt;15 mL/kg; vigilar sobrecarga (TACO)." : "; objetivo razón &lt;1,5."));
      }
      if (!cond.length) cond.push("Valores sin indicación de reposición de factores. Mantener vigilancia y repetir cada 30–60 min mientras sangre.");
      cond.push("Ácido tranexámico 1 g IV en 10 min (1 mL/min, no en bolo rápido) dentro de las 3 h del nacimiento; segunda dosis si continúa a los 30 min o reaparece dentro de las 24 h — OMS 2025, rec. 27.");
    }
    out.push("<strong>Conducta:</strong>" + li(cond));
    box("cid", pos ? "rb-rojo" : (miss.length ? "rb-neutro" : "rb-verde"), (pos ? "CID: " : "Score: ") + pts + " pts (corte " + cut + ")", li(out));
  }

  /* ---------- ROTEM ---------- */
  function calcROT() {
    var a5 = num("rot-fibA5"), ct = num("rot-exCT"), exa5 = num("rot-exA5"), ml = num("rot-exML");
    var obj = +val("rot-obj"), ctcut = +val("rot-ctcut"), sang = val("rot-sangra") === "1", p = peso();
    if (isNaN(a5)) { box("rot", "rb-neutro", "Ingresá al menos FIBTEM A5", ""); return; }
    var out = [], sev = 0, fibOk = a5 >= obj;
    if (!fibOk) {
      var inc = obj - a5, g = p ? inc * p / 160 : NaN;
      sev = a5 < 7 ? 3 : 2;
      out.push("FIBTEM A5 " + f0(a5) + " mm &lt; objetivo " + obj + " mm" + (a5 < 7 ? " (déficit marcado, &lt;7 mm)" : "") + ".");
      if (sang || a5 < 7) out.push("Fibrinógeno: aumento buscado " + f0(inc) + " mm → concentrado " +
        (p ? "<strong>≈ " + f1(g) + " g</strong> o crioprecipitado ≈ " + f0(g * 5) + " U" : f2(inc / 160) + " g/kg (cargá el peso)") + " (Görlinger 2019).");
      else out.push("Sin sangrado activo y A5 ≥7 mm: no reponer por el valor aislado; repetir ROTEM.");
    } else out.push("FIBTEM A5 " + f0(a5) + " mm ≥ " + obj + " mm: no requiere fibrinógeno (OBS2).");
    if (!isNaN(ct)) {
      var ctHigh = ctcut === 75 ? ct >= 75 : ct > ctcut;
      if (ctHigh && sang) {
        sev = Math.max(sev, 2);
        out.push("EXTEM CT " + f0(ct) + " s (umbral " + ctcut + " s): déficit de factores. " + (fibOk
          ? "PFC 15 mL/kg" + (p ? " ≈ <strong>" + f0(15 * p) + " mL</strong>" : "") + " (o CCP según protocolo local)."
          : "Corregir primero el fibrinógeno y repetir; si CT sigue alto, PFC 15 mL/kg" + (p ? " ≈ " + f0(15 * p) + " mL" : "") + "."));
      } else out.push("EXTEM CT " + f0(ct) + " s" + (ctHigh ? " elevado, sin sangrado activo: repetir." : ": sin indicación de PFC (referencia 38–79 s)."));
    }
    if (!isNaN(exa5)) {
      if (exa5 < 35 && fibOk && sang) { sev = Math.max(sev, 2); out.push("EXTEM A5 " + f0(exa5) + " mm &lt;35 con FIBTEM en objetivo: componente plaquetario; considerar plaquetas y confirmar recuento (&lt;75 000 según RCOG)."); }
      else if (exa5 < 35 && !fibOk) out.push("EXTEM A5 " + f0(exa5) + " mm bajo: corregir fibrinógeno primero y reevaluar.");
      else out.push("EXTEM A5 " + f0(exa5) + " mm.");
    }
    if (!isNaN(ml)) {
      if (ml > 15) { sev = 3; out.push("EXTEM ML " + f0(ml) + " % (&gt;15 %): hiperfibrinólisis. Ácido tranexámico 1 g IV; repetir 1 g a los 30 min si persiste. Sospechar embolia de líquido amniótico si hay colapso."); }
      else out.push("EXTEM ML " + f0(ml) + " %: sin hiperfibrinólisis por rango de referencia (&lt;15 %; en trauma se usa ≥5 %).");
    }
    out.push("Repetir ROTEM 10–15 min después de cada intervención.");
    box("rot", sev >= 3 ? "rb-rojo" : sev === 2 ? "rb-naranja" : "rb-verde",
      sev >= 3 ? "Coagulopatía grave" : sev === 2 ? "Requiere corrección dirigida" : "Sin indicación de reposición", li(out));
  }

  /* ---------- Índice TAM/FC ---------- */
  function updTamFc() {
    if (!$("result-tamfc")) return;
    var pas = num("in-pas"), pad = num("in-pad"), fc = num("in-fc");
    if (isNaN(pas) || isNaN(pad) || !fc) { box("tamfc", "rb-neutro", "Ingresá PAS, PAD y FC en la barra superior", ""); return; }
    if (pas < 140 && pad < 90) { box("tamfc", "rb-neutro", "Sin hipertensión: el índice no se interpreta", li(["Aplica a trastornos hipertensivos (PAS ≥140 o PAD ≥90 mmHg). En hipotensión o shock usá el índice de choque."])); return; }
    var tam = (pas + 2 * pad) / 3, r = tam / fc, t, cls, d;
    if (r > 1.4) { t = "Hipodinámico (resistencia vascular alta)"; cls = "rb-naranja"; d = "Primera línea sugerida: vasodilatador — calcioantagonista (nifedipino). Asociado con más frecuencia a restricción de crecimiento fetal."; }
    else if (r >= 1.1) { t = "Normodinámico"; cls = "rb-amarillo"; d = "Primera línea sugerida en la revisión: alfametildopa; labetalol o nifedipino según guía local."; }
    else { t = "Hiperdinámico (gasto cardíaco alto)"; cls = "rb-amarillo"; d = "Primera línea sugerida: labetalol (o alfametildopa) para reducir la frecuencia y el gasto."; }
    box("tamfc", cls, "TAM/FC " + f2(r) + " — " + t,
      li(["TAM " + f0(tam) + " mmHg ÷ FC " + f0(fc) + " lpm = " + f2(r) + " mmHg/lpm.",
        "Cortes: &gt;1,4 hipodinámico · 1,1–1,4 normodinámico · &lt;1,1 hiperdinámico.", d,
        "No reemplaza la indicación de tratar la hipertensión severa en forma inmediata con el fármaco disponible."]));
  }

  function bind(id, fn) { var el = $(id); if (el) el.addEventListener("click", fn); }
  bind("btn-vol-calc", calcVol);
  bind("btn-qbl-calc", calcQBL);
  bind("btn-cid-calc", calcCID);
  bind("btn-rot-calc", calcROT);
  var sc = $("cid-score"); if (sc) { sc.addEventListener("change", cidFields); cidFields(); }
  ["in-pas", "in-pad", "in-fc"].forEach(function (id) { var el = $(id); if (el) { el.addEventListener("input", updTamFc); el.addEventListener("change", updTamFc); } });
  document.addEventListener("click", function () { setTimeout(updTamFc, 60); });
  updTamFc();
  window.CaVeSalCoag = { calcVol: calcVol, calcQBL: calcQBL, calcCID: calcCID, calcROT: calcROT, updTamFc: updTamFc };
})();
