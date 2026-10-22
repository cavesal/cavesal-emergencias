/* CaVeSal® Emergencias — Motor del Simulador.
 * La app presenta el caso ficticio, el usuario decide, el caso reacciona y al final hay devolución con fuentes. */
(function () {
  "use strict";
  var CASOS = window.SIM_CASOS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var fmt = function (n, d) { return Number(n).toFixed(d || 0).replace(".", ","); };
  var S = null, timerInt = null, MEJOR = {};

  function guardado() { return MEJOR; }
  function guardar(id, pct) { if (MEJOR[id] == null || pct > MEJOR[id]) MEJOR[id] = pct; }
  function mezclar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function tiempo(min) {
    if (S && S.c.modo === "parto") { var h = Math.floor(min / 60), m = min % 60; return "Hora " + h + ":" + (m < 10 ? "0" : "") + m; }
    return "Minuto " + min;
  }
  function grupos() {
    var out = [], idx = {};
    CASOS.forEach(function (c) { var n = c.grupo || "Emergencias maternas"; if (!(n in idx)) { idx[n] = out.length; out.push({ nombre: n, casos: [] }); } out[idx[n]].casos.push(c); });
    return out;
  }
  function totalPreguntas(c) { return c.escenas.reduce(function (n, e) { return n + e.preguntas.length; }, 0); }

  /* ---------- lista de casos ---------- */
  function lista() {
    pararTimer(); S = null;
    var g2 = guardado();
    $("#sim-app").innerHTML =
      '<div class="sim-intro">' +
        "<p>Casos ficticios para entrenar. La app presenta a la paciente, vos decidís, el caso reacciona y al final recibís la devolución con la fuente de cada respuesta.</p>" +
        '<label class="sim-switch"><input type="checkbox" id="sim-reloj" checked> Con reloj (tiempo límite por decisión)</label>' +
      "</div>" +
      grupos().map(function (g) {
        return '<section class="sim-grupo"><h2>' + esc(g.nombre) + ' <span>' + g.casos.length + (g.casos.length === 1 ? " caso" : " casos") + '</span></h2><div class="sim-casos">' + g.casos.map(function (c, i) {
        var best = g2[c.id];
        return '<article class="sim-caso ' + c.codigo + '">' +
          '<div class="sim-caso-n">Caso ' + (i + 1) + " · " + esc(c.tema) + "</div>" +
          "<h3>" + esc(c.titulo) + "</h3><p>" + esc(c.resumen) + "</p>" +
          '<div class="sim-caso-pie"><span>' + totalPreguntas(c) + " decisiones" + (best != null ? " · mejor resultado: " + best + " %" : "") + "</span>" +
          '<button type="button" class="btn btn-primary" data-caso="' + c.id + '">Iniciar caso</button></div>' +
        "</article>";
      }).join("") + "</div></section>";
      }).join("") +
      '<p class="sim-nota">Herramienta de entrenamiento. Los casos son ficticios y no reemplazan el criterio clínico.</p>';
  }

  /* ---------- inicio ---------- */
  function iniciar(id) {
    var c = CASOS.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var conReloj = ($("#sim-reloj") || {}).checked !== false;
    S = { c: c, e: 0, p: 0, reloj: conReloj, pts: 0, res: [], peor: { fc: 0, pas: 0, sat: 0 }, t0: Date.now() };
    pintarEscena();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- monitor ---------- */
  function nivel(k, v, vit) {
    if (vit.paro) return "rojo";
    if (S && S.c && S.c.codigo === "alerta") { // cortes EAPO MSPBS 2025/2022
      switch (k) {
        case "fc": return v >= 100 || v <= 59 ? "rojo" : "ok";
        case "pas": return v >= 160 || v <= 70 ? "rojo" : (v >= 140 || v <= 99) ? "amar" : "ok";
        case "pam": return v < 65 ? "rojo" : v < 70 ? "amar" : "ok";
        case "fr": return v >= 22 || v <= 11 ? "rojo" : v >= 20 ? "amar" : "ok";
        case "sat": return v < 95 ? "rojo" : "ok";
        case "t": return v >= 39 || v < 36 ? "rojo" : v >= 38 ? "amar" : "ok";
      }
      return "ok";
    }
    switch (k) {
      case "fc": return v === 0 || v > 120 || v < 50 ? "rojo" : v > 100 ? "amar" : "ok";
      case "pas": return v < 90 ? "rojo" : v < 100 ? "amar" : "ok";
      case "pam": return v < 65 ? "rojo" : v < 70 ? "amar" : "ok";
      case "fr": return v > 25 || v < 10 ? "rojo" : v > 20 ? "amar" : "ok";
      case "sat": return v < 90 ? "rojo" : v < 95 ? "amar" : "ok";
      case "t": return v > 38 || v < 35 ? "rojo" : v > 37.5 ? "amar" : "ok";
    }
    return "ok";
  }
  function monitorParto(vit) {
    var cel = function (cls, lab, val, uni) { return '<div class="sim-vit ' + cls + '"><span>' + lab + "</span><strong>" + val + "</strong><small>" + uni + "</small></div>"; };
    var pam = Math.round((vit.pas + 2 * vit.pad) / 3);
    var fcfCls = vit.fcf == null ? "ok" : (vit.fcf < 110 || vit.fcf > 160 ? "rojo" : "ok");
    return '<div class="sim-monitor parto">' +
      cel(nivel("fc", vit.fc, vit), "FC materna", vit.fc, "lpm") +
      cel(nivel("pas", vit.pas, vit), "PA", vit.pas + "/" + vit.pad, "mmHg · PAM " + pam) +
      cel(nivel("t", vit.t, vit), "T", fmt(vit.t, 1), "°C") +
      cel(fcfCls, "FCF", vit.fcf == null ? "—" : vit.fcf, vit.fcf == null ? "nacido" : "lpm · normal 110-160") +
      cel("neutro", "Contracciones", esc(vit.cu || "—"), "") +
      cel("neutro", "Dilatación", vit.dil == null ? "—" : vit.dil + " cm", vit.dil === 10 ? "completa" : vit.dil != null && vit.dil < 5 ? "fase latente" : vit.dil != null ? "fase activa" : "") +
      "</div>";
  }
  function monitor(vit) {
    if (S.c.modo === "parto") return monitorParto(vit);
    var p = S.peor, paro = !!vit.paro;
    var fc = paro ? 0 : Math.max(20, vit.fc + p.fc), pas = paro ? 0 : Math.max(40, vit.pas + p.pas), pad = paro ? 0 : Math.max(20, vit.pad + Math.round(p.pas / 2));
    var sat = paro ? 0 : Math.max(50, Math.min(100, vit.sat + p.sat));
    var pam = paro ? 0 : Math.round((pas + 2 * pad) / 3);
    var cel = function (k, lab, val, uni, extra) {
      return '<div class="sim-vit ' + nivel(k, k === "pam" ? pam : k === "pas" ? pas : k === "fc" ? fc : k === "sat" ? sat : k === "fr" ? vit.fr : vit.t, vit) + '"><span>' + lab + "</span><strong>" + val + "</strong><small>" + uni + (extra ? " · " + esc(extra) : "") + "</small></div>";
    };
    var empeora = (p.fc || p.pas || p.sat) && !paro;
    return '<div class="sim-monitor' + (paro ? " paro" : "") + '">' +
      cel("fc", "FC", paro ? "—" : fc, "lpm") +
      cel("pas", "PA", paro ? "—" : pas + "/" + pad, "mmHg") +
      cel("pam", "PAM", paro ? "—" : pam, "mmHg") +
      cel("fr", "FR", paro ? "—" : vit.fr, "rpm") +
      cel("sat", "SpO₂", paro ? "—" : sat + " %", "", vit.satNota) +
      cel("t", "T", fmt(vit.t, 1), "°C") +
      "</div>" +
      (vit.mental || vit.vaso ? '<div class="sim-mental">' + esc(vit.mental || "") + (vit.vaso ? (vit.mental ? " · " : "") + "Vasopresor en curso" : "") + "</div>" : "") +
      (empeora ? '<div class="sim-peor">La paciente empeoró por las decisiones demoradas o incorrectas.</div>' : "");
  }

  /* ---------- escena y pregunta ---------- */
  function pintarEscena() {
    var c = S.c, e = c.escenas[S.e], q = e.preguntas[S.p];
    var n = 0; for (var i = 0; i < S.e; i++) n += c.escenas[i].preguntas.length; n += S.p + 1;
    var tot = totalPreguntas(c);
    var html =
      '<div class="sim-top ' + c.codigo + '">' +
        '<button type="button" class="vb2" data-sim="salir">← Casos</button>' +
        '<div><div class="sim-top-t">' + esc(c.tema) + '</div><div class="sim-top-s">' + esc(c.titulo) + "</div></div>" +
        '<div class="sim-prog" aria-label="Progreso">' + n + " / " + tot + "</div>" +
      "</div>" +
      '<div class="sim-escena">' +
        '<div class="sim-min">' + tiempo(e.min) + " · " + esc(e.titulo) + "</div>" +
        '<p class="sim-relato">' + esc(e.relato) + "</p>" +
        monitor(e.vit) +
        (e.datos ? '<dl class="sim-datos">' + e.datos.map(function (d) { return "<div><dt>" + esc(d[0]) + "</dt><dd>" + esc(d[1]) + "</dd></div>"; }).join("") + "</dl>" : "") +
      "</div>" +
      '<div class="sim-q" id="sim-q">' + preguntaHTML(q) + "</div>";
    $("#sim-app").innerHTML = html;
    S.qt0 = Date.now(); S.respondida = false;
    if (q.tipo === "numero") { var inp = $("#sim-num"); if (inp) inp.focus({ preventScroll: true }); }
    arrancarTimer(q);
  }
  function preguntaHTML(q) {
    var reloj = S.reloj ? '<div class="sim-reloj" id="sim-reloj-q"></div>' : "";
    if (q.tipo === "numero") {
      return reloj + "<h3>" + esc(q.q) + "</h3>" +
        '<form class="sim-numf" id="sim-numf"><input type="text" inputmode="decimal" id="sim-num" autocomplete="off" aria-label="Respuesta">' + (q.unidad ? "<span>" + esc(q.unidad) + "</span>" : "") +
        '<button type="submit" class="btn btn-primary">Responder</button></form><div id="sim-fb"></div>';
    }
    S.ops = mezclar(q.ops.map(function (o, i) { return { o: o, i: i }; }));
    return reloj + "<h3>" + esc(q.q) + '</h3><div class="sim-ops">' + S.ops.map(function (x, k) {
      return '<button type="button" class="sim-op" data-op="' + k + '"><span class="sim-op-l">' + "ABC"[k] + "</span>" + esc(x.o.t) + "</button>";
    }).join("") + '</div><div id="sim-fb"></div>';
  }

  /* ---------- reloj ---------- */
  function limite(q) { return q.tipo === "numero" ? 60 : 45; }
  function arrancarTimer(q) {
    pararTimer(); if (!S.reloj) return;
    var lim = limite(q), el = $("#sim-reloj-q");
    var tick = function () {
      if (!S || S.respondida) return pararTimer();
      var r = lim - Math.floor((Date.now() - S.qt0) / 1000);
      if (el) { el.textContent = "Tiempo: " + Math.max(0, r) + " s"; el.className = "sim-reloj" + (r <= 10 ? " poco" : ""); }
      if (r <= 0) { pararTimer(); responder(null, true); }
    };
    tick(); timerInt = setInterval(tick, 250);
  }
  function pararTimer() { if (timerInt) { clearInterval(timerInt); timerInt = null; } }

  /* ---------- respuesta ---------- */
  function responder(valor, vencido) {
    if (!S || S.respondida) return;
    S.respondida = true; pararTimer();
    var e = S.c.escenas[S.e], q = e.preguntas[S.p];
    var seg = Math.round((Date.now() - S.qt0) / 1000);
    var ok = false, fb = "", elegido = "", correcto = "";
    if (q.tipo === "numero") {
      var v = parseFloat(String(valor == null ? "" : valor).replace(",", "."));
      ok = !vencido && !isNaN(v) && Math.abs(v - q.resp) <= q.tol + 1e-9;
      fb = ok ? q.fbOk : q.fbMal;
      elegido = vencido ? "Sin respuesta (tiempo agotado)" : isNaN(v) ? "—" : fmt(v, q.dec) + (q.unidad ? " " + q.unidad : "");
      correcto = fmt(q.resp, q.dec) + (q.unidad ? " " + q.unidad : "");
      var inp = $("#sim-num"); if (inp) inp.disabled = true;
      var b = $("#sim-numf button"); if (b) b.disabled = true;
    } else {
      var buenos = q.ops.filter(function (o) { return o.ok; })[0];
      correcto = buenos.t;
      if (vencido) { fb = "Se agotó el tiempo. " + buenos.fb; elegido = "Sin respuesta (tiempo agotado)"; }
      else { var x = S.ops[valor]; ok = !!x.o.ok; fb = x.o.fb; elegido = x.o.t; }
      [].forEach.call(document.querySelectorAll(".sim-op"), function (btn, k) {
        btn.disabled = true;
        if (S.ops[k].o.ok) btn.classList.add("bien");
        else if (!vencido && k === valor) btn.classList.add("mal");
      });
    }
    if (ok) { S.pts += 10; fb = String(fb).replace(/^Correcto[.:]\s*/, ""); fb = fb.charAt(0).toUpperCase() + fb.slice(1); }
    else if (q.peor) { S.peor.fc += q.peor.fc || 0; S.peor.pas += q.peor.pas || 0; S.peor.sat += q.peor.sat || 0; }
    S.res.push({ escena: e.titulo, min: e.min, q: q.q, ok: ok, elegido: elegido, correcto: correcto, seg: seg, vencido: !!vencido, ref: q.ref, url: q.url });
    var ultimo = S.p + 1 >= e.preguntas.length && S.e + 1 >= S.c.escenas.length;
    $("#sim-fb").innerHTML =
      '<div class="sim-fb ' + (ok ? "ok" : "mal") + '" role="status">' +
        "<strong>" + (ok ? "Correcto" : vencido ? "Tiempo agotado" : "No es la mejor decisión") + "</strong>" +
        "<p>" + esc(fb) + "</p>" +
        (!ok && q.peor ? '<p class="sim-cons">Consecuencia: la paciente se deteriora.</p>' : "") +
        '<p class="sim-ref">Fuente: <a href="' + esc(q.url) + '" target="_blank" rel="noopener">' + esc(q.ref) + "</a></p>" +
      "</div>" +
      '<button type="button" class="btn btn-primary btn-block sim-next" data-sim="next">' + (ultimo ? "Ver devolución" : "Continuar") + "</button>";
    var nb = $(".sim-next"); if (nb) nb.focus({ preventScroll: true });
    $("#sim-fb").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function siguiente() {
    var e = S.c.escenas[S.e];
    if (S.p + 1 < e.preguntas.length) { S.p++; return pintarEscena(); }
    if (S.e + 1 < S.c.escenas.length) { S.e++; S.p = 0; pintarEscena(); return window.scrollTo({ top: 0, behavior: "smooth" }); }
    devolucion();
  }

  /* ---------- devolución ---------- */
  function devolucion() {
    pararTimer();
    var c = S.c, tot = S.res.length, buenas = S.res.filter(function (r) { return r.ok; }).length;
    var pct = Math.round(100 * buenas / tot);
    guardar(c.id, pct);
    var seg = Math.round((Date.now() - S.t0) / 1000);
    var nivelTxt = pct >= 85 ? "Equipo entrenado" : pct >= 60 ? "Buen manejo, con puntos para reforzar" : "Conviene repasar el protocolo";
    var txt = textoResultado(c, buenas, tot, pct, seg);
    $("#sim-app").innerHTML =
      '<div class="sim-top ' + c.codigo + '"><button type="button" class="vb2" data-sim="salir">← Casos</button><div><div class="sim-top-t">Devolución</div><div class="sim-top-s">' + esc(c.tema) + "</div></div><div></div></div>" +
      '<div class="sim-score ' + (pct >= 85 ? "ok" : pct >= 60 ? "med" : "bajo") + '"><strong>' + pct + " %</strong><span>" + buenas + " de " + tot + " decisiones correctas · " + Math.floor(seg / 60) + " min " + (seg % 60) + " s</span><em>" + nivelTxt + "</em></div>" +
      '<ol class="sim-revision">' + S.res.map(function (r) {
        return '<li class="' + (r.ok ? "ok" : "mal") + '"><div class="sim-rev-h">' + tiempo(r.min) + " · " + esc(r.escena) + " · " + r.seg + " s</div>" +
          '<div class="sim-rev-q">' + esc(r.q) + "</div>" +
          '<div class="sim-rev-a"><span>Tu respuesta:</span> ' + esc(r.elegido) + "</div>" +
          (r.ok ? "" : '<div class="sim-rev-c"><span>Mejor decisión:</span> ' + esc(r.correcto) + "</div>") +
          '<div class="sim-ref">Fuente: <a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.ref) + "</a></div></li>";
      }).join("") + "</ol>" +
      '<section class="sim-fuentes"><h3>Fuentes del caso</h3><ul>' + c.fuentes.map(function (f) { return '<li><a href="' + esc(f[1]) + '" target="_blank" rel="noopener">' + esc(f[0]) + "</a></li>"; }).join("") + "</ul></section>" +
      '<div class="sim-acc"><button type="button" class="btn btn-primary" data-caso="' + c.id + '">Repetir caso</button>' +
      '<button type="button" class="btn btn-outline" data-sim="copiar">Copiar resultado</button>' +
      '<button type="button" class="btn btn-outline" data-sim="salir">Otro caso</button></div>' +
      '<pre class="sim-txt" id="sim-txt" hidden>' + esc(txt) + "</pre>";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function textoResultado(c, buenas, tot, pct, seg) {
    var L = ["CaVeSal® Simulador — " + c.tema, "Caso: " + c.titulo, "Resultado: " + pct + " % (" + buenas + "/" + tot + ") · " + Math.floor(seg / 60) + " min " + (seg % 60) + " s", ""];
    S.res.forEach(function (r, i) { L.push((i + 1) + ". " + (r.ok ? "✓ " : "✗ ") + r.q + " — " + r.elegido + (r.ok ? "" : " | Mejor: " + r.correcto)); });
    L.push("", "Caso ficticio de entrenamiento. No reemplaza el criterio clínico.");
    return L.join("\n");
  }

  /* ---------- eventos ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-caso],[data-sim],.sim-op"); if (!t) return;
    if (t.hasAttribute("data-caso")) return iniciar(t.getAttribute("data-caso"));
    if (t.classList.contains("sim-op")) return responder(parseInt(t.getAttribute("data-op"), 10), false);
    var a = t.getAttribute("data-sim");
    if (a === "next") siguiente();
    else if (a === "salir") { if (S && !$(".sim-score") && !confirm("¿Salir del caso en curso?")) return; lista(); window.scrollTo({ top: 0 }); }
    else if (a === "copiar") {
      var x = $("#sim-txt").textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(x) : Promise.reject()).then(function () { t.textContent = "Copiado"; }).catch(function () { prompt("Copiá el resultado:", x); });
    }
  });
  document.addEventListener("submit", function (ev) {
    if (ev.target.id !== "sim-numf") return;
    ev.preventDefault(); responder($("#sim-num").value, false);
  });

  window.CaVeSalSim = { iniciar: iniciar, lista: lista, _estado: function () { return S; } };
  document.addEventListener("DOMContentLoaded", function () {
    lista();
    var m = /caso=([a-z0-9]+)/.exec(location.hash); if (m) iniciar(m[1]);
  });
})();
