/* CaVeSal® Emergencias — Escala de Alerta Obstétrica
 * Selector: EAPO MSPBS 2025/2022 (por defecto) · Score MAMÁ 2025 (MSP Ecuador) · Alerta Obstétrica CaVeSal® (híbrida).
 * EAPO: hoja 2025; huecos completados con la versión 2022 (PAS 140-159 amarillo).
 * Algoritmo propio CaVeSal® · Basado en:
 *  - MSPBS Paraguay, DSSR. Escala de Alerta Precoz Obstétrica (hoja web 09-06-2025).
 *  - MSPBS Paraguay. Guía de Código Rojo Materno Neonatal, 2ª ed. (2022): uso, colores, controles, sobrevida.
 *  - MSP Ecuador. Protocolo Score MAMÁ y Claves Obstétricas 2025 (AM 00042-2025).
 * El híbrido no suma puntos nuevos: toma el peor color de las dos escalas. No está validado como escala independiente.
 * Monitor sin datos identificatorios; el registro queda solo en este dispositivo. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  if (!$("alerta-card")) return;
  function num(id) { var el = $(id); if (!el) return NaN; var s = String(el.value).trim().replace(",", "."); if (s === "") return NaN; var v = parseFloat(s); return isNaN(v) ? NaN : v; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function f1(x) { return (Math.round(x * 10) / 10).toString().replace(".", ","); }

  var RANK = { verde: 0, amarillo: 1, rojo: 2 };
  var LABEL = { verde: "VERDE", amarillo: "AMARILLO", rojo: "ROJO" };
  var RB = { verde: "rb-verde", amarillo: "rb-amarillo", rojo: "rb-rojo" };
  function peor(a, b) { if (!a) return b; if (!b) return a; return RANK[b] > RANK[a] ? b : a; }

  /* ---------------- EAPO MSPBS 2025 ----------------
     n: función que convierte el valor numérico en la opción (v). Intervalos no escritos en la hoja → nota "interp". */
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
      n: function (x) { return x > 30 ? "si" : null; } }, // ≤30 mL/h no define por sí solo (criterio "orinó en 6 h o >30"): se elige a mano
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

  /* ---------------- Score MAMÁ 2025 (MSP Ecuador) ---------------- */
  var MAMA = [
    { id: "temp", label: "1. Temperatura axilar (°C)", vital: "av-t", options: [
      { v: "3a", t: "<35", p: 3 }, { v: "1a", t: "35 a 35,9", p: 1 }, { v: "0", t: "36 a 37,4", p: 0 },
      { v: "1b", t: "37,5 a 38,2", p: 1 }, { v: "2b", t: "38,3 a 38,9", p: 2 }, { v: "3b", t: "≥39", p: 3 }],
      n: function (x) { return x < 35 ? "3a" : x < 36 ? "1a" : x < 37.5 ? "0" : x < 38.3 ? "1b" : x < 39 ? "2b" : "3b"; } },
    { id: "pas", label: "2. Tensión arterial sistólica (mmHg)", vital: "av-pas", options: [
      { v: "3a", t: "≤70", p: 3 }, { v: "2a", t: "71 a 79", p: 2 }, { v: "1a", t: "80 a 89", p: 1 }, { v: "0", t: "90 a 139", p: 0 },
      { v: "1b", t: "140 a 149", p: 1 }, { v: "2b", t: "150 a 159", p: 2 }, { v: "3b", t: "≥160", p: 3 }],
      n: function (x) { return x <= 70 ? "3a" : x < 80 ? "2a" : x < 90 ? "1a" : x < 140 ? "0" : x < 150 ? "1b" : x < 160 ? "2b" : "3b"; } },
    { id: "pad", label: "3. Tensión arterial diastólica (mmHg)", vital: "av-pad", options: [
      { v: "1a", t: "≤49", p: 1 }, { v: "0", t: "50 a 89", p: 0 }, { v: "1b", t: "90 a 99", p: 1 },
      { v: "2b", t: "100 a 109", p: 2 }, { v: "3b", t: "≥110", p: 3 }],
      n: function (x) { return x < 50 ? "1a" : x < 90 ? "0" : x < 100 ? "1b" : x < 110 ? "2b" : "3b"; } },
    { id: "fc", label: "4. Frecuencia cardíaca (lpm)", vital: "av-fc", options: [
      { v: "3a", t: "≤40", p: 3 }, { v: "2a", t: "41 a 49", p: 2 }, { v: "0", t: "50 a 99", p: 0 },
      { v: "1b", t: "100 a 109", p: 1 }, { v: "2b", t: "110 a 129", p: 2 }, { v: "3b", t: "≥130", p: 3 }],
      n: function (x) { return x <= 40 ? "3a" : x < 50 ? "2a" : x < 100 ? "0" : x < 110 ? "1b" : x < 130 ? "2b" : "3b"; } },
    { id: "fr", label: "5. Frecuencia respiratoria (rpm)", vital: "av-fr", options: [
      { v: "3a", t: "≤10", p: 3 }, { v: "0", t: "11 a 20", p: 0 }, { v: "1b", t: "21 a 24", p: 1 },
      { v: "2b", t: "25 a 29", p: 2 }, { v: "3b", t: "≥30", p: 3 }],
      n: function (x) { return x <= 10 ? "3a" : x <= 20 ? "0" : x < 25 ? "1b" : x < 30 ? "2b" : "3b"; } },
    { id: "sat", label: "6. Saturación de O₂ (%)", vital: "av-sat", options: [
      { v: "3", t: "≤88", p: 3 }, { v: "2", t: "89 a 90", p: 2 }, { v: "1", t: "91 a 93", p: 1 }, { v: "0", t: "≥94", p: 0 }],
      n: function (x) { return x <= 88 ? "3" : x <= 90 ? "2" : x <= 93 ? "1" : "0"; } },
    { id: "o2", label: "7. Oxigenoterapia", options: [
      { v: "0", t: "Aire ambiente", p: 0 }, { v: "2", t: "Catéter nasal", p: 2 }, { v: "3", t: "Máscara o superior", p: 3 }] },
    { id: "conc", label: "8. Nivel de conciencia", options: [
      { v: "0", t: "Alerta", p: 0 }, { v: "1", t: "Responde a la voz", p: 1 }, { v: "2", t: "Responde al dolor", p: 2 }, { v: "3", t: "No responde", p: 3 }] },
    { id: "gu", label: "9. Gasto urinario (mL/h)", vital: "av-diu", options: [
      { v: "0", t: "No cuantificable (sin sonda) o >30", p: 0 }, { v: "2", t: "≤30", p: 2 }, { v: "3", t: "≤10", p: 3 }],
      n: function (x) { return x <= 10 ? "3" : x <= 30 ? "2" : "0"; } }
  ];
  function ptsColor(p) { return p >= 3 ? "rojo" : p >= 1 ? "amarillo" : "verde"; }
  MAMA.forEach(function (q) { q.options.forEach(function (o) { o.c = ptsColor(o.p); }); });

  /* Intervalos de control (minutos): [mínimo, máximo] */
  var INT_MSPBS = { rojo: [5, 10], amarillo: [20, 30], verde: [60, 120] };
  var INT_MAMA = { rojo: [30, 30], amarillo: [60, 60], verde: [240, 240] };
  function txtInt(r) { var a = r[0], b = r[1]; var u = function (m) { return m >= 60 ? (m / 60) + (m === 60 ? " hora" : " horas") : m + " min"; }; return a === b ? "cada " + u(a) : "cada " + (b >= 60 ? (a / 60) + " a " + u(b) : a + " a " + b + " min"); }

  var ESCALAS = {
    eapo: {
      nombre: "EAPO MSPBS 2025/2022",
      info: "Escala de Alerta Precoz Obstétrica del MSPBS: hoja vigente 2025; los huecos se completan con la versión 2022 (Guía Código Rojo, 2ª ed.). Se aplica a todas las pacientes. No es un puntaje: cada parámetro tiene un color y basta uno en rojo para activar la emergencia. Controles: rojo cada 5 a 10 min, amarillo cada 20 a 30 min, verde cada 1 a 2 h."
    },
    mama: {
      nombre: "Score MAMÁ 2025",
      info: "Score MAMÁ del MSP de Ecuador (protocolo 2025). Suma de 9 variables, cada una de 0 a 3. 0-1: aplicar cada 4 h · 2-4: tratar, referir y aplicar cada 1 h · ≥5 o cualquier variable en 3: activar la clave y aplicar cada 30 min. Los colores son de CaVeSal®."
    },
    hibrida: {
      nombre: "Alerta Obstétrica CaVeSal®",
      info: "Híbrida: EAPO 2025/2022 + Score MAMÁ 2025. Cargás los signos vitales una vez, se calculan las dos escalas y gana el peor color (Score MAMÁ ≥5 o cualquier 3 = rojo; 2-4 = amarillo; 0-1 = verde). No suma puntos nuevos. Controles según la EAPO. Algoritmo propio, no validado como escala independiente."
    }
  };

  var st = { escala: "eapo", eapo: {}, mama: {} };

  /* ---------------- render de grillas ---------------- */
  function grid(containerId, params, prefix, showPts) {
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
        lab.innerHTML = '<input type="radio" name="' + prefix + "-" + param.id + '" value="' + esc(o.v) + '"><span class="dot"></span><span>' + esc(o.t) +
          (showPts ? ' <b class="al-pts">' + o.p + "</b>" : "") + "</span>";
        ow.appendChild(lab);
      });
      wrap.appendChild(ow);
      g.appendChild(wrap);
    });
    g.addEventListener("change", function (e) {
      var inp = e.target; if (inp.type !== "radio") return;
      marcar(inp);
      var id = inp.name.slice(prefix.length + 1);
      (prefix === "eapo" ? st.eapo : st.mama)[id] = inp.value;
      calcular();
    });
  }
  function marcar(inp) {
    var w = inp.closest(".eapo-param");
    w.querySelectorAll(".eapo-option").forEach(function (o) { o.classList.remove("selected"); });
    inp.closest(".eapo-option").classList.add("selected");
  }
  function elegir(prefix, id, v) {
    var inp = document.querySelector('input[name="' + prefix + "-" + id + '"][value="' + v + '"]');
    if (!inp) return;
    inp.checked = true; marcar(inp);
    (prefix === "eapo" ? st.eapo : st.mama)[id] = v;
  }
  function limpiarParam(prefix, id) {
    document.querySelectorAll('input[name="' + prefix + "-" + id + '"]').forEach(function (i) { i.checked = false; var l = i.closest(".eapo-option"); if (l) l.classList.remove("selected"); });
    delete (prefix === "eapo" ? st.eapo : st.mama)[id];
  }

  /* Signos vitales numéricos → completan las dos grillas */
  function desdeVitales(vitalId) {
    var x = num(vitalId);
    [["eapo", EAPO], ["mama", MAMA]].forEach(function (pair) {
      pair[1].forEach(function (p) {
        if (p.vital !== vitalId || !p.n) return;
        if (isNaN(x)) return;
        var v = p.n(x);
        if (v == null) { limpiarParam(pair[0], p.id); return; }
        elegir(pair[0], p.id, v);
      });
    });
    calcular();
  }

  /* ---------------- cálculo ---------------- */
  function resultadoEAPO() {
    var cols = [], rojos = [], amar = [];
    EAPO.forEach(function (p) {
      var v = st.eapo[p.id]; if (!v) return;
      var o = p.options.filter(function (x) { return x.v === v; })[0];
      cols.push(o.c);
      if (o.c === "rojo") rojos.push(p.label.replace(/^\d+\.\s*/, "") + " (" + o.t.replace(/\*+/g, "") + ")");
      else if (o.c === "amarillo") amar.push(p.label.replace(/^\d+\.\s*/, "") + " (" + o.t.replace(/\*+/g, "") + ")");
    });
    var color = cols.reduce(function (a, b) { return peor(a, b); }, null);
    return { color: color, n: cols.length, total: EAPO.length, rojos: rojos, amar: amar };
  }
  function resultadoMAMA() {
    var tot = 0, n = 0, tres = [], det = [];
    MAMA.forEach(function (p) {
      var v = st.mama[p.id]; if (v == null) return;
      var o = p.options.filter(function (x) { return x.v === v; })[0];
      n++; tot += o.p;
      if (o.p === 3) tres.push(p.label.replace(/^\d+\.\s*/, ""));
      if (o.p > 0) det.push(p.label.replace(/^\d+\.\s*/, "").replace(/ \(.*\)$/, "") + " " + o.p);
    });
    if (!n) return { color: null, n: 0, total: MAMA.length };
    var color = (tot >= 5 || tres.length) ? "rojo" : tot >= 2 ? "amarillo" : "verde";
    var conducta = color === "rojo" ? "Tratar, activar la clave que corresponda y referir. Aplicar cada 30 min."
      : color === "amarillo" ? "Tratar y referir según el caso. Aplicar cada 1 h."
      : tot === 1 ? "Evaluar factores de riesgo. Aplicar cada 4 h." : "Evaluar factores de riesgo, bienestar materno-fetal y signos de alarma. Aplicar cada 4 h.";
    return { color: color, n: n, total: MAMA.length, puntos: tot, tres: tres, det: det, conducta: conducta };
  }

  var ultimo = null;
  function calcular() {
    var esc_ = st.escala, e = resultadoEAPO(), m = resultadoMAMA();
    var box = $("result-eapo"), t = $("result-eapo-title"), d = $("result-eapo-detail");
    var color = null, intervalo = INT_MSPBS, html = [];
    if (esc_ === "eapo") {
      color = e.color;
      if (color) {
        t.textContent = "EAPO 2025/2022: " + LABEL[color] + (e.n < e.total ? " (parcial: " + e.n + " de " + e.total + " parámetros)" : " (15 de 15 parámetros)");
        if (e.rojos.length) html.push("<strong>En rojo:</strong> " + esc(e.rojos.join(" · ")));
        if (e.amar.length) html.push("<strong>En amarillo:</strong> " + esc(e.amar.join(" · ")));
        html.push("No es un puntaje: gana el peor color. Próximo control " + txtInt(INT_MSPBS[color]) + ".");
      }
    } else if (esc_ === "mama") {
      color = m.color; intervalo = INT_MAMA;
      if (color) {
        t.textContent = "Score MAMÁ: " + m.puntos + (m.puntos === 1 ? " punto" : " puntos") + " · " + LABEL[color] + (m.n < m.total ? " (parcial: " + m.n + " de " + m.total + " variables)" : "");
        if (m.det.length) html.push("<strong>Suman:</strong> " + esc(m.det.join(" · ")));
        if (m.tres.length) html.push("<strong>Variable en 3:</strong> " + esc(m.tres.join(" · ")) + " (activa por sí sola).");
        html.push(esc(m.conducta));
      }
    } else {
      color = peor(e.color, m.color);
      if (color) {
        var quien = e.color && m.color ? (RANK[e.color] === RANK[m.color] ? "las dos escalas coinciden" : RANK[e.color] > RANK[m.color] ? "lo define la EAPO" : "lo define el Score MAMÁ") : (e.color ? "solo hay datos de la EAPO" : "solo hay datos del Score MAMÁ");
        t.textContent = "Alerta CaVeSal®: " + LABEL[color] + " (" + quien + ")";
        html.push("<strong>EAPO 2025/2022:</strong> " + (e.color ? LABEL[e.color] + " (" + e.n + "/" + e.total + ")" : "sin datos") +
          (e.rojos.length ? " · rojo: " + esc(e.rojos.join(", ")) : ""));
        html.push("<strong>Score MAMÁ:</strong> " + (m.color ? m.puntos + " puntos, " + LABEL[m.color] + " (" + m.n + "/" + m.total + ")" : "sin datos") +
          (m.tres && m.tres.length ? " · variable en 3: " + esc(m.tres.join(", ")) : ""));
        html.push("Gana el peor color. Próximo control " + txtInt(INT_MSPBS[color]) + " (intervalos de la EAPO).");
      }
    }
    if (!color) {
      box.className = "result-box rb-neutro eapo-summary";
      t.textContent = "Cargá los signos vitales o elegí las opciones para ver el resultado";
      d.innerHTML = ""; $("alerta-ruta").hidden = true; ultimo = null; pintarMonitor(); return;
    }
    box.className = "result-box eapo-summary " + RB[color];
    d.innerHTML = html.map(function (x) { return "<div>" + x + "</div>"; }).join("");
    $("alerta-ruta").hidden = color !== "rojo";
    ultimo = { color: color, intervalo: intervalo[color], escala: esc_, e: e, m: m };
    pintarMonitor();
  }

  /* ---------------- vista según escala ---------------- */
  function vista() {
    var v = st.escala;
    $("alerta-info").textContent = ESCALAS[v].info;
    $("alerta-eapo-wrap").hidden = v === "mama";
    $("alerta-mama-wrap").hidden = v === "eapo";
    calcular();
  }

  /* ---------------- monitor dinámico ---------------- */
  var KEY = "cavesal_alerta_monitor_v1";
  var mon = { inicio: null, controles: [] };
  try { var g = JSON.parse(localStorage.getItem(KEY) || "null"); if (g && g.controles) mon = g; } catch (err) { }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(mon)); } catch (err) { } }
  function hhmm(ts) { var d = new Date(ts); return (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes(); }
  function mmss(seg) { seg = Math.max(0, Math.round(seg)); var m = Math.floor(seg / 60), s = seg % 60; return m + ":" + (s < 10 ? "0" : "") + s; }
  function resumenVitales() {
    var parts = [], map = [["av-pas", "PAS"], ["av-pad", "PAD"], ["av-fc", "FC"], ["av-fr", "FR"], ["av-sat", "SpO₂"], ["av-t", "T"], ["av-diu", "Diuresis"]];
    map.forEach(function (x) { var v = num(x[0]); if (!isNaN(v)) parts.push(x[1] + " " + (x[0] === "av-t" ? f1(v) : Math.round(v))); });
    return parts.join(" · ");
  }
  function registrar() {
    if (!ultimo) { aviso("Primero cargá los datos de la paciente para tener un color."); return; }
    var ahora = Date.now();
    var c = { ts: ahora, color: ultimo.color, escala: ultimo.escala, int: ultimo.intervalo, vit: resumenVitales(),
      mama: ultimo.m && ultimo.m.color ? ultimo.m.puntos : null };
    mon.controles.push(c);
    if (!mon.inicio && c.color === "rojo") mon.inicio = ahora;
    mon.avisado = false;
    guardar(); pintarMonitor();
    aviso("Control " + mon.controles.length + " registrado a las " + hhmm(ahora) + ".");
  }
  function iniciarHora() { if (!mon.inicio) { mon.inicio = Date.now(); guardar(); pintarMonitor(); } }
  function reiniciar() {
    if (mon.controles.length && !confirm("¿Borrar el registro de controles y el reloj de la hora de oro?")) return;
    mon = { inicio: null, controles: [] }; guardar(); pintarMonitor();
  }
  function aviso(t) { var a = $("alerta-aviso"); a.textContent = t; }
  var FASES = [
    [0, 1, "Minuto 0: activación. Estabilizá y decidí."],
    [1, 20, "Minuto 1 a 20: reanimación y diagnóstico. Tratá la causa (4T)."],
    [20, 60, "Minuto 20 a 60: estabilización. ¿Hay mejoría? ¿Hace falta escalar de nivel?"],
    [60, 1e9, "Más de 60 min: manejo avanzado. Alta probabilidad de CID."]
  ];
  function pintarMonitor() {
    var ahora = Date.now(), cs = mon.controles, last = cs[cs.length - 1];
    var prox = $("alerta-prox"), hora = $("alerta-hora"), tl = $("alerta-tl");
    if (last) {
      var desde = (ahora - last.ts) / 1000, min = last.int[0] * 60, max = last.int[1] * 60;
      var cls = desde >= max ? "vencido" : desde >= min ? "ventana" : "";
      var txt = desde >= max ? "Control vencido hace " + mmss(desde - max) + " · último control " + LABEL[last.color] + " a las " + hhmm(last.ts)
        : desde >= min ? "Tomá el próximo control ahora (ventana " + txtInt(last.int).replace("cada ", "") + "): quedan " + mmss(max - desde)
        : "Próximo control en " + mmss(min - desde) + (last.int[0] !== last.int[1] ? " a " + mmss(max - desde) : "") + " · último " + LABEL[last.color] + " a las " + hhmm(last.ts);
      prox.className = "al-prox " + cls + " c-" + last.color; prox.textContent = txt; prox.hidden = false;
      if (desde >= min && !mon.avisado) { mon.avisado = true; guardar(); alarma(); }
    } else { prox.hidden = true; }
    if (mon.inicio) {
      var m = Math.floor((ahora - mon.inicio) / 60000);
      var f = FASES.filter(function (x) { return m >= x[0] && m < x[1]; })[0];
      var sob = m >= 40 ? " Pasados 40 a 60 min sin control del sangrado se asume CID y la sobrevida cae a menos del 20 % (MSPBS)."
        : m >= 20 ? " Pasados 20 min sin acción compensatoria la sobrevida cae al 60 % (MSPBS)." : "";
      hora.innerHTML = '<div class="al-hora-n"><strong>' + m + "</strong><span>min de 60</span></div>" +
        '<div class="al-hora-bar"><i style="width:' + Math.min(100, m / 60 * 100) + '%"></i><b style="left:33.3%"></b></div>' +
        '<div class="al-hora-t">' + esc(f[2]) + esc(sob) + "</div>";
      hora.className = "al-hora" + (m >= 60 ? " pasada" : m >= 20 ? " media" : "");
      hora.hidden = false; $("alerta-btn-hora").hidden = true;
    } else { hora.hidden = true; $("alerta-btn-hora").hidden = false; }
    if (cs.length) {
      tl.hidden = false;
      tl.querySelector("tbody").innerHTML = cs.map(function (c, i) {
        var prev = cs[i - 1], tend = !prev ? "—" : RANK[c.color] > RANK[prev.color] ? "Empeora" : RANK[c.color] < RANK[prev.color] ? "Mejora" : "Igual";
        var rel = mon.inicio && c.ts >= mon.inicio ? " (min " + Math.floor((c.ts - mon.inicio) / 60000) + ")" : "";
        return "<tr><td>" + (i + 1) + "</td><td>" + hhmm(c.ts) + esc(rel) + '</td><td><span class="al-chip c-' + c.color + '">' + LABEL[c.color] + "</span>" +
          (c.mama != null ? " <small>MAMÁ " + c.mama + "</small>" : "") + "</td><td>" + tend + "</td><td>" + esc(c.vit || "—") + "</td></tr>";
      }).reverse().join("");
    } else { tl.hidden = true; }
  }
  function alarma() {
    try { if (navigator.vibrate) navigator.vibrate([300, 150, 300]); } catch (err) { }
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      var ctx = new AC(), o = ctx.createOscillator(), g2 = ctx.createGain();
      o.frequency.value = 880; o.connect(g2); g2.connect(ctx.destination); g2.gain.value = 0.08;
      o.start(); o.stop(ctx.currentTime + 0.5);
    } catch (err) { }
  }

  /* ---------------- ruta por causa (rojo) ---------------- */
  function ir(code, sub) {
    var b = document.getElementById("navtab-" + code); if (b) b.click();
    if (sub) { var s = document.getElementById("subtab-" + sub); if (s) s.click(); }
    var sec = document.getElementById("code-" + code); if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------- init ---------------- */
  grid("eapo-grid", EAPO, "eapo", false);
  grid("mama-grid", MAMA, "mama", true);
  $("alerta-escala").addEventListener("change", function () { st.escala = this.value; vista(); });
  ["av-t", "av-fr", "av-sat", "av-fc", "av-pas", "av-pad", "av-diu"].forEach(function (id) {
    $(id).addEventListener("input", function () { this.dataset.manual = "1"; desdeVitales(id); });
  });
  // Datos comunes (FC, PAS, PAD) → se copian si el campo de la escala no fue editado a mano.
  [["in-fc", "av-fc"], ["in-pas", "av-pas"], ["in-pad", "av-pad"]].forEach(function (pr) {
    var src = $(pr[0]); if (!src) return;
    src.addEventListener("input", function () { var dst = $(pr[1]); if (dst.dataset.manual) return; dst.value = src.value; desdeVitales(pr[1]); });
  });
  $("alerta-btn-reg").addEventListener("click", registrar);
  $("alerta-btn-hora").addEventListener("click", iniciarHora);
  $("alerta-btn-reset").addEventListener("click", reiniciar);
  $("alerta-btn-limpiar").addEventListener("click", function () {
    ["av-t", "av-fr", "av-sat", "av-fc", "av-pas", "av-pad", "av-diu"].forEach(function (id) { $(id).value = ""; delete $(id).dataset.manual; });
    EAPO.forEach(function (p) { limpiarParam("eapo", p.id); });
    MAMA.forEach(function (p) { limpiarParam("mama", p.id); });
    calcular();
  });
  document.querySelectorAll("[data-alerta-ir]").forEach(function (b) {
    b.addEventListener("click", function () { var x = b.getAttribute("data-alerta-ir").split(":"); ir(x[0], x[1]); });
  });
  setInterval(pintarMonitor, 1000);
  vista();

  window.CaVeSalAlerta = { _st: st, _calcular: calcular, _mon: function () { return mon; }, EAPO: EAPO, MAMA: MAMA };
})();
