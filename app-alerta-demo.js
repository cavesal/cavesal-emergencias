/* CaVeSal® Emergencias — Escala de Alerta Obstétrica (EAPO), versión ESTÁTICA de demostración.
 * Misma tabla y el mismo motor de cálculo que app-alerta.js (solo EAPO MSPBS 2025/2022):
 * cargás los signos vitales UNA VEZ y obtenés el color — sin botón "agregar", sin reloj de
 * hora de oro, sin registro de controles ni gráfico de evolución (eso es exclusivo de la
 * versión completa, donde la escala es dinámica/longitudinal).
 * Fuente: MSPBS Paraguay, DSSR. Escala de Alerta Precoz Obstétrica (hoja web 09-06-2025) y
 * Guía de Código Rojo Materno Neonatal, 2ª ed. (2022).
 */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  if (!$("alerta-card")) return;
  function num(id) { var el = $(id); if (!el) return NaN; var s = String(el.value).trim().replace(",", "."); if (s === "") return NaN; var v = parseFloat(s); return isNaN(v) ? NaN : v; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var RANK = { verde: 0, amarillo: 1, rojo: 2 };
  var LABEL = { verde: "VERDE", amarillo: "AMARILLO", rojo: "ROJO" };
  var RB = { verde: "rb-verde", amarillo: "rb-amarillo", rojo: "rb-rojo" };
  function peor(a, b) { if (!a) return b; if (!b) return a; return RANK[b] > RANK[a] ? b : a; }

  /* Misma tabla EAPO que la versión full (app-alerta.js) — no debe divergir entre demo y full. */
  var EAPO = [
    { id: "aspecto", label: "1. Aspecto general", options: [
      { v: "normal", t: "Normal", c: "verde" }, { v: "sudorosa", t: "Sudorosa", c: "amarillo" },
      { v: "palida", t: "Pálida", c: "rojo" }, { v: "cianotica", t: "Cianótica", c: "rojo" }, { v: "icterica", t: "Ictérica", c: "rojo" }] },
    { id: "fr", label: "2. Frecuencia respiratoria (rpm)", vital: "av-fr", options: [
      { v: "22+", t: "22 o más", c: "rojo" }, { v: "20-21", t: "20 a 21", c: "amarillo" },
      { v: "12-19", t: "19 a 12", c: "verde" }, { v: "<=11", t: "11 o menos", c: "rojo" }],
      n: function (x) { return x >= 22 ? "22+" : x >= 20 ? "20-21" : x >= 12 ? "12-19" : "<=11"; } },
    { id: "sato2", label: "3. Saturación de O₂ (%)", vital: "av-sat", options: [
      { v: "95-100", t: "100 a 95", c: "verde" }, { v: "<95", t: "Menos de 95", c: "rojo" }],
      n: function (x) { return x >= 95 ? "95-100" : "<95"; } },
    { id: "temp", label: "4. Temperatura (°C)", vital: "av-t", options: [
      { v: "39+", t: "39 o más", c: "rojo" }, { v: "38", t: "38 (38,0 a 38,9)*", c: "amarillo" },
      { v: "36-37", t: "37 a 36 (36,0 a 37,9)*", c: "verde" }, { v: "<=35", t: "35 o menos (<36)*", c: "rojo" }],
      n: function (x) { return x >= 39 ? "39+" : x >= 38 ? "38" : x >= 36 ? "36-37" : "<=35"; } },
    { id: "fc", label: "5. Frecuencia cardíaca (lpm)", vital: "av-fc", options: [
      { v: "100+", t: "100 o más", c: "rojo" }, { v: "60-99", t: "99 a 60", c: "verde" }, { v: "<=59", t: "59 o menos", c: "rojo" }],
      n: function (x) { return x >= 100 ? "100+" : x >= 60 ? "60-99" : "<=59"; } },
    { id: "pas", label: "6. Presión sistólica (mmHg)", vital: "av-pas", options: [
      { v: "160+", t: "160 o más", c: "rojo" }, { v: "140-159", t: "159 a 140**", c: "amarillo" },
      { v: "100-139", t: "139 a 100", c: "verde" }, { v: "71-99", t: "99 a 71", c: "amarillo" }, { v: "<=70", t: "70 o menos", c: "rojo" }],
      n: function (x) { return x >= 160 ? "160+" : x >= 140 ? "140-159" : x >= 100 ? "100-139" : x >= 71 ? "71-99" : "<=70"; } },
    { id: "pad", label: "7. Presión diastólica (mmHg)", vital: "av-pad", options: [
      { v: "110+", t: "110 o más", c: "rojo" }, { v: "90-109", t: "109 a 90", c: "amarillo" },
      { v: "60-89", t: "89 a 60", c: "verde" }, { v: "<=59", t: "59 a 51 (y menos)*", c: "rojo" }],
      n: function (x) { return x >= 110 ? "110+" : x >= 90 ? "90-109" : x >= 60 ? "60-89" : "<=59"; } },
    { id: "neuro", label: "8. Respuesta neurológica", options: [
      { v: "alerta", t: "Alerta", c: "verde" }, { v: "desorientada", t: "Desorientada", c: "amarillo" },
      { v: "dolor", t: "Reacciona solo al dolor", c: "rojo" }, { v: "inconsciente", t: "Inconsciente", c: "rojo" }] },
    { id: "diuresis", label: "9. Orinó en las últimas 6 h o >30 mL/h", vital: "av-diu", options: [
      { v: "si", t: "Sí", c: "verde" }, { v: "no", t: "No", c: "rojo" }],
      n: function (x) { return x > 30 ? "si" : null; } },
    { id: "proteinuria", label: "10. Proteinuria (tira reactiva)", options: [
      { v: "+/++", t: "+ / ++ (o negativa)*", c: "verde" }, { v: "+++", t: "+++ o más", c: "rojo" }] },
    { id: "sangrado", label: "11. Sangrado genital", options: [
      { v: "abundante", t: "Abundante", c: "rojo" }, { v: "manchado", t: "Manchado", c: "amarillo" }, { v: "ausente", t: "Ausente", c: "verde" }] },
    { id: "flujo", label: "12. Flujo genital purulento", options: [{ v: "si", t: "Sí", c: "rojo" }, { v: "no", t: "No", c: "verde" }] },
    { id: "cefalea", label: "13. Cefalea y alteración visual y/o auditiva", options: [{ v: "si", t: "Sí", c: "rojo" }, { v: "no", t: "No", c: "verde" }] },
    { id: "convulsiones", label: "14. Convulsiones", options: [{ v: "si", t: "Sí", c: "rojo" }, { v: "no", t: "No", c: "verde" }] },
    { id: "abdominal", label: "15. Dolor abdominal", options: [
      { v: "no", t: "No", c: "verde" }, { v: "sin", t: "Sin irritación peritoneal", c: "amarillo" }, { v: "con", t: "Con irritación peritoneal", c: "rojo" }] }
  ];

  var st = {};

  function grid(containerId, params, prefix) {
    var g = $(containerId);
    params.forEach(function (param) {
      var wrap = document.createElement("div");
      wrap.className = "eapo-param";
      var title = document.createElement("div");
      title.className = "eapo-param-title";
      title.textContent = param.label;
      wrap.appendChild(title);
      var ow = document.createElement("div");
      ow.className = "eapo-options";
      param.options.forEach(function (o) {
        var lab = document.createElement("label");
        lab.className = "eapo-option";
        lab.dataset.color = o.c;
        lab.innerHTML = '<input type="radio" name="' + prefix + "-" + param.id + '" value="' + esc(o.v) + '"><span class="dot"></span><span>' + esc(o.t) + "</span>";
        ow.appendChild(lab);
      });
      wrap.appendChild(ow);
      g.appendChild(wrap);
    });
    g.addEventListener("change", function (e) {
      var inp = e.target; if (inp.type !== "radio") return;
      marcar(inp);
      var id = inp.name.slice(prefix.length + 1);
      st[id] = inp.value;
      calcular();
    });
  }
  function marcar(inp) {
    var w = inp.closest(".eapo-param");
    w.querySelectorAll(".eapo-option").forEach(function (o) { o.classList.remove("selected"); });
    inp.closest(".eapo-option").classList.add("selected");
  }
  function elegir(id, v) {
    var inp = document.querySelector('input[name="eapo-' + id + '"][value="' + v + '"]');
    if (!inp) return;
    inp.checked = true; marcar(inp);
    st[id] = v;
  }
  function limpiarParam(id) {
    document.querySelectorAll('input[name="eapo-' + id + '"]').forEach(function (i) { i.checked = false; var l = i.closest(".eapo-option"); if (l) l.classList.remove("selected"); });
    delete st[id];
  }
  function desdeVitales(vitalId) {
    var x = num(vitalId);
    EAPO.forEach(function (p) {
      if (p.vital !== vitalId || !p.n) return;
      if (isNaN(x)) return;
      var v = p.n(x);
      if (v == null) { limpiarParam(p.id); return; }
      elegir(p.id, v);
    });
    calcular();
  }

  function resultadoEAPO() {
    var cols = [], rojos = [], amar = [];
    EAPO.forEach(function (p) {
      var v = st[p.id]; if (!v) return;
      var o = p.options.filter(function (x) { return x.v === v; })[0];
      cols.push(o.c);
      if (o.c === "rojo") rojos.push(p.label.replace(/^\d+\.\s*/, "") + " (" + o.t.replace(/\*+/g, "") + ")");
      else if (o.c === "amarillo") amar.push(p.label.replace(/^\d+\.\s*/, "") + " (" + o.t.replace(/\*+/g, "") + ")");
    });
    var color = cols.reduce(function (a, b) { return peor(a, b); }, null);
    return { color: color, n: cols.length, total: EAPO.length, rojos: rojos, amar: amar };
  }

  function calcular() {
    var e = resultadoEAPO();
    var box = $("result-eapo"), t = $("result-eapo-title"), d = $("result-eapo-detail");
    if (!e.color) {
      box.className = "result-box rb-neutro eapo-summary";
      t.textContent = "Cargá los signos vitales o elegí las opciones para ver el resultado";
      d.innerHTML = "";
      return;
    }
    box.className = "result-box eapo-summary " + RB[e.color];
    t.textContent = "EAPO 2025/2022: " + LABEL[e.color] + (e.n < e.total ? " (parcial: " + e.n + " de " + e.total + " parámetros)" : " (15 de 15 parámetros)");
    var html = [];
    if (e.rojos.length) html.push("<strong>En rojo:</strong> " + esc(e.rojos.join(" · ")));
    if (e.amar.length) html.push("<strong>En amarillo:</strong> " + esc(e.amar.join(" · ")));
    html.push("No es un puntaje: gana el peor color. En la versión completa este control queda registrado con reloj de hora de oro y seguimiento de la evolución.");
    d.innerHTML = html.map(function (x) { return "<div>" + x + "</div>"; }).join("");
  }

  grid("eapo-grid", EAPO, "eapo");
  ["av-t", "av-fr", "av-sat", "av-fc", "av-pas", "av-pad", "av-diu"].forEach(function (id) {
    var el = $(id); if (el) el.addEventListener("input", function () { this.dataset.manual = "1"; desdeVitales(id); });
  });
  [["in-fc", "av-fc"], ["in-pas", "av-pas"], ["in-pad", "av-pad"]].forEach(function (pr) {
    var src = $(pr[0]); if (!src) return;
    src.addEventListener("input", function () { var dst = $(pr[1]); if (!dst || dst.dataset.manual) return; dst.value = src.value; desdeVitales(pr[1]); });
  });
  calcular();
})();
