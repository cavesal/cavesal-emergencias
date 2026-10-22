/**
 * CaVeSal® Emergencias — Modo voz con lazo cerrado, árbol de entrada y "Mi camino".
 *
 * Lazo cerrado (Equipo Nacer UdeA): indicación → repetición → ejecución → confirmación.
 * La app dicta el paso (SpeechSynthesis), el equipo lo repite y lo ejecuta, y quien
 * coordina confirma con "cumplido" (SpeechRecognition) o con el botón.
 * Los pasos salen de voz-data.js (flujogramas con fuente). La IA solo recibe el
 * registro final para resumen y preguntas.
 */
(function () {
  "use strict";

  var P = window.VOZ_PROTOCOLOS || {};
  var ARBOL = window.VOZ_ARBOL || [];
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var synth = window.speechSynthesis || null;
  var IA_URL = "https://ia.cavesal.app/chat.html";
  var LICENSE_KEY = "cavesal_emerg_full_unlocked";

  /* ---------------- licencia: modo voz / modo guía son función de la versión completa ----------------
   * El gate visual de full.html (#license_gate) es un overlay por CSS (z-index), pero un <dialog>
   * abierto con showModal() se renderiza en el "top layer" del navegador, por encima de cualquier
   * z-index. Por eso antes el diálogo de "Tengo una emergencia ahora" se abría y la app empezaba a
   * dictar aunque el gate de licencia siguiera visible tapando la pantalla. Esta función es el único
   * punto de entrada real (clic en los botones y los hashes #emergencia / #desde-cero de la URL), así
   * que basta con frenar acá, consultando la misma clave que usa el gate de full.html. */
  function tieneLicenciaFull() {
    try { return !!localStorage.getItem(LICENSE_KEY); } catch (e) { return false; }
  }
  var dlgBloqueo;
  function mostrarBloqueoFull() {
    if (!dlgBloqueo) {
      dlgBloqueo = h("dialog", { id: "voz-bloqueo", class: "voz-entrada" });
      document.body.appendChild(dlgBloqueo);
      dlgBloqueo.addEventListener("click", function (e) {
        if (e.target === dlgBloqueo || e.target.closest(".ve-x")) dlgBloqueo.close();
      });
    }
    dlgBloqueo.innerHTML = '<div class="ve-head"><h2>Versión completa</h2><button type="button" class="ve-x" aria-label="Cerrar">×</button></div>' +
      '<p class="ve-sub">El modo voz y el modo guía para emergencias en tiempo real están disponibles solo en la versión completa de CaVeSal® Emergencias Obstétricas.</p>' +
      '<div style="padding:0 18px 18px">' +
        '<a href="https://cavesal.gumroad.com/l/cavesal" target="_blank" style="display:block;text-align:center;text-decoration:none;padding:13px;border-radius:10px;font-weight:700;color:#fff;background:linear-gradient(135deg,#0D1B2D,#0EA5B7)">Adquirir versión completa →</a>' +
      "</div>";
    if (!dlgBloqueo.open) dlgBloqueo.showModal();
  }

  var S = null; // estado de la sesión activa
  var root, els = {};

  /* ---------------- utilidades ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); }
  function mmss(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function hora(d) { return d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  function elapsed() { return S ? Date.now() - S.t0 - S.pausedMs - (S.pausedAt ? Date.now() - S.pausedAt : 0) : 0; }

  /* ---------------- voz: síntesis ---------------- */
  var vozEs = null;
  function elegirVoz() {
    if (!synth) return;
    var vs = synth.getVoices();
    vozEs = vs.filter(function (v) { return /^es[-_](PY|AR|UY|419|MX|US)/i.test(v.lang); })[0] || vs.filter(function (v) { return /^es/i.test(v.lang); })[0] || null;
  }
  if (synth) { elegirVoz(); synth.onvoiceschanged = elegirVoz; }

  function decir(texto, cb) {
    if (!S || !S.sonido || !synth) { if (cb) cb(); return; }
    escucharPausa();
    synth.cancel();
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = vozEs ? vozEs.lang : "es-ES";
    if (vozEs) u.voice = vozEs;
    u.rate = 1.0;
    S.hablando = true;
    var fin = function () { S && (S.hablando = false); escucharReanudar(); if (cb) cb(); };
    u.onend = fin; u.onerror = fin;
    synth.speak(u);
  }

  /* ---------------- voz: reconocimiento ---------------- */
  var rec = null, recOn = false, recLang = "es-PY";
  function crearRec() {
    if (!SR) return null;
    var r = new SR();
    r.lang = recLang; r.continuous = true; r.interimResults = false; r.maxAlternatives = 3;
    r.onresult = function (ev) {
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        if (!ev.results[i].isFinal) continue;
        var alts = [];
        for (var j = 0; j < ev.results[i].length; j++) alts.push(ev.results[i][j].transcript);
        comando(alts);
      }
    };
    r.onerror = function (e) {
      if (e.error === "language-not-supported" && recLang !== "es-ES") { recLang = "es-ES"; rec = crearRec(); return; }
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { S && (S.micro = false); estadoMic("Micrófono bloqueado: usá los botones"); }
    };
    r.onend = function () { recOn = false; if (S && S.micro && !S.hablando && !S.fin) setTimeout(escucharReanudar, 250); };
    return r;
  }
  function escucharPausa() { if (rec && recOn) { try { rec.abort(); } catch (e) {} recOn = false; } }
  function escucharReanudar() {
    if (!S || !S.micro || S.hablando || S.fin || recOn) return;
    if (!rec) rec = crearRec();
    if (!rec) return;
    try { rec.start(); recOn = true; estadoMic("Escuchando: «cumplido», «repetir», «atrás», «sí», «no»"); } catch (e) {}
  }
  function estadoMic(t) { if (els.mic) els.mic.textContent = t; }

  function comando(alts) {
    if (!S || S.fin) return;
    var t = alts.map(norm).join(" | ");
    if (els.oido) els.oido.textContent = "Oído: «" + alts[0].trim() + "»";
    var paso = pasoActual();
    var m = function (re) { return re.test(t); };
    if (m(/\b(no aplica|omitir|saltar)\b/)) return accion("omitir");
    if (m(/\b(repet|repeti|repita|repite|otra vez)/)) return accion("repetir");
    if (m(/\b(atras|anterior|volver)\b/)) return accion("atras");
    if (S.pausedAt) { if (m(/\b(continu|reanud|seguir|sigue|seguimos)/)) return accion("reanudar"); }
    else if (m(/\b(pausa|pausar|espera)\b/)) return accion("pausa");
    if (m(/\b(tiempo|reloj|cuanto va|minutos)\b/)) return accion("tiempo");
    if (m(/\b(cerrar|finalizar|terminar) (el )?codigo\b/)) return accion("terminar");
    if (paso && paso.op) {
      for (var oi = 0; oi < paso.op.length; oi++) if (new RegExp(paso.op[oi].k).test(t)) return elegir(paso.op[oi].id);
      return;
    }
    if (paso && paso.q) {
      if (m(/\b(si|afirmativo|correcto|cedio)\b/) && !m(/\bno\b/)) return accion("si");
      if (m(/\b(no|negativo|persiste|sigue sangrando)\b/)) return accion("no");
      return;
    }
    if (m(/\b(cumplido|cumplida|listo|lista|ok|okey|okay|hecho|hecha|confirmado|siguiente)\b/)) return accion("cumplido");
  }

  /* ---------------- motor ---------------- */
  function pasoActual() { return S ? S.proto.pasos[S.idx] : null; }
  function idxDe(id) { for (var i = 0; i < S.proto.pasos.length; i++) if (S.proto.pasos[i].id === id) return i; return -1; }
  function log(tipo, texto) { S.log.push({ t: elapsed(), at: new Date(), tipo: tipo, texto: texto }); pintarLog(); }

  function irA(i, sinHistorial) {
    if (!sinHistorial) S.hist.push(S.idx);
    S.idx = i;
    var p = pasoActual();
    S.fasesVistas[p.fase] = true;
    pintar();
    dictar();
  }
  function dictar() {
    var p = pasoActual(); if (!p) return;
    var txt = p.v || p.t;
    var c = calcTexto(p);
    if (c) txt += " " + c.replace(/-/g, " a ").replace(/mL\/h/g, "mililitros por hora").replace(/mL/g, "mililitros").replace(/kg/g, "kilos") + ".";
    decir(txt);
  }
  function siguienteDe(p) {
    if (p.fin) return -1;
    if (p.next) return idxDe(p.next);
    if (p.op) return p.omit ? idxDe(p.omit) : -1;
    return S.idx + 1 < S.proto.pasos.length ? S.idx + 1 : -1;
  }

  function elegir(id) {
    if (!S || S.fin) return;
    var p = pasoActual(); if (!p || !p.op) return;
    if (S.pausedAt) { decir("En pausa. Diga continuar."); return; }
    var o = p.op.filter(function (x) { return x.id === id; })[0]; if (!o) return;
    log("eleccion", p.t + " → " + o.l);
    var d = idxDe(o.dest); if (d < 0) return terminar();
    irA(d);
  }
  function pesoKg() { var v = parseFloat((document.getElementById("in-peso") || {}).value); return v > 25 && v < 250 ? v : 0; }
  function calcTexto(p) {
    if (!p || !p.calc) return "";
    var kg = pesoKg(); if (!kg) return "";
    if (p.calc === "bolo_sepsis") return "Con " + kg + " kg: bolo " + Math.round(kg * 20) + "-" + Math.round(kg * 30) + " mL; mantenimiento " + Math.round(kg) + "-" + Math.round(kg * 2) + " mL/h";
    return "";
  }

  function accion(a) {
    if (!S || S.fin) return;
    var p = pasoActual();
    if (S.pausedAt && a !== "reanudar" && a !== "terminar" && a !== "tiempo") { decir("En pausa. Diga continuar."); return; }
    switch (a) {
      case "cumplido":
        if (p.q) { decir("Responda sí o no."); return; }
        if (p.op) { decir("Elija una opción: " + p.op.map(function (o) { return o.l; }).join(", ") + "."); return; }
        if (p.input) leerSignos();
        log("cumplido", p.t + (calcTexto(p) ? " (" + calcTexto(p) + ")" : ""));
        if (p.timer) iniciarTimer(p.timer, p.id);
        var n = siguienteDe(p);
        if (n < 0) return terminar();
        irA(n);
        break;
      case "si": case "no":
        if (!p.q) return;
        log(a === "si" ? "respuesta-si" : "respuesta-no", p.t + " → " + (a === "si" ? "Sí" : "No"));
        var dest = idxDe(p[a]);
        if (dest < 0) return terminar();
        irA(dest);
        break;
      case "omitir":
        log("omitido", p.t);
        var k = p.q ? idxDe(p.no) : siguienteDe(p);
        if (k < 0) return terminar();
        irA(k);
        break;
      case "repetir": dictar(); break;
      case "atras":
        if (!S.hist.length) { decir("Es el primer paso."); return; }
        var prev = S.hist.pop();
        log("atras", "Volver a: " + S.proto.pasos[prev].t);
        irA(prev, true);
        break;
      case "pausa":
        S.pausedAt = Date.now(); log("pausa", "Pausa"); pintar(); decir("Pausa. Diga continuar para seguir.");
        break;
      case "reanudar":
        if (!S.pausedAt) return;
        S.pausedMs += Date.now() - S.pausedAt; S.pausedAt = 0; log("reanudar", "Continuar"); pintar(); dictar();
        break;
      case "tiempo":
        var mins = Math.floor(elapsed() / 60000);
        decir("Van " + mins + (mins === 1 ? " minuto" : " minutos") + " desde la activación.");
        break;
      case "terminar": terminar(); break;
    }
  }

  function leerSignos() {
    var fc = parseFloat(els.fc && els.fc.value), pas = parseFloat(els.pas && els.pas.value);
    if (fc > 0 && pas > 0) {
      var si = fc / pas, txt;
      if (si >= 1.7) txt = "alta probabilidad de resultado adverso";
      else if (si >= 1.4) txt = "necesidad urgente de intervención";
      else if (si > 0.9) txt = "marcador de severidad";
      else txt = "en meta";
      S.signos.push({ fc: fc, pas: pas, si: si });
      log("signos", "FC " + fc + " · PAS " + pas + " · Índice de choque " + si.toFixed(2).replace(".", ",") + " (" + txt + ")");
      // sincroniza con la barra de paciente de la Calculadora si existe
      var bfc = document.getElementById("in-fc"), bpas = document.getElementById("in-pas");
      if (bfc && bpas && !bfc.value && !bpas.value) { bfc.value = fc; bpas.value = pas; bfc.dispatchEvent(new Event("input", { bubbles: true })); bpas.dispatchEvent(new Event("input", { bubbles: true })); }
    }
  }
  function actualizarSI() {
    var fc = parseFloat(els.fc.value), pas = parseFloat(els.pas.value);
    if (fc > 0 && pas > 0) {
      var si = fc / pas;
      els.siOut.textContent = "Índice de choque: " + si.toFixed(2).replace(".", ",") + (si >= 1.7 ? " · alta probabilidad de resultado adverso" : si >= 1.4 ? " · necesidad urgente de intervención" : si > 0.9 ? " · marcador de severidad" : " · en meta (<0,9)");
      els.siOut.className = "voz-si " + (si >= 1.4 ? "sev" : si > 0.9 ? "mod" : "ok");
    } else { els.siOut.textContent = ""; els.siOut.className = "voz-si"; }
  }

  /* ---------------- timers, recordatorios e hitos ---------------- */
  function iniciarTimer(cfg, origen) {
    S.timers = S.timers.filter(function (x) { return x.origen !== origen; });
    S.timers.push({ origen: origen, fin: elapsed() + cfg.min * 60000, msg: cfg.msg, min: cfg.min, avisado: false });
    log("timer", "Cuenta regresiva " + cfg.min + " min: " + cfg.msg);
  }
  function tick() {
    if (!S || S.fin) return;
    var e = elapsed();
    els.reloj.textContent = mmss(e);
    if (S.pausedAt) return;
    var msgs = [];
    S.timers.forEach(function (x) {
      if (!x.avisado && e >= x.fin) { x.avisado = true; log("aviso", x.msg); msgs.push(x.msg); }
    });
    S.proto.hitos.forEach(function (hh, i) {
      if (!S.hitos[i] && e >= hh.min * 60000) { S.hitos[i] = true; log("hito", hh.msg); msgs.push(hh.msg); }
    });
    S.proto.recordatorios.forEach(function (r, i) {
      var n = Math.floor(e / (r.cada * 60000));
      if (n > 0 && (S.rec[i] || 0) < n) { S.rec[i] = n; log("recordatorio", r.msg); msgs.push(r.msg); }
    });
    if (msgs.length) {
      alertaVisual(msgs);
      // el aviso se dice y luego se vuelve a dictar el paso en curso
      decir("Atención. " + msgs.join(" ") + " Paso en curso: " + (pasoActual().v || pasoActual().t));
    }
    pintarTimers(e);
  }
  function alertaVisual(msg) {
    els.aviso.innerHTML = [].concat(msg).map(esc).join('<br>'); els.aviso.hidden = false;
    clearTimeout(S.avisoT); S.avisoT = setTimeout(function () { els.aviso.hidden = true; }, 12000);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
  function pintarTimers(e) {
    var act = S.timers.filter(function (x) { return !x.avisado; });
    els.timers.innerHTML = act.length ? act.map(function (x) { return '<span class="voz-timer">' + esc(mmss(x.fin - e)) + " · " + esc(x.msg.split(".")[0]) + "</span>"; }).join("") : "";
  }

  /* ---------------- pintura ---------------- */
  function pintar() {
    var p = pasoActual();
    var fase = S.proto.camino.filter(function (c) { return c.id === p.fase; })[0];
    els.fase.textContent = fase ? fase.nombre + (fase.tramo ? " · " + fase.tramo : "") : "";
    els.paso.textContent = p.t;
    els.ref.textContent = p.ref ? "Fuente: " + p.ref : "";
    els.inputs.hidden = !p.input;
    var c = calcTexto(p); els.calc.textContent = c; els.calc.hidden = !c;
    els.ops.hidden = !p.op;
    els.ops.innerHTML = p.op ? p.op.map(function (o) { return '<button type="button" class="vb" data-op="' + o.id + '">' + esc(o.l) + "</button>"; }).join("") : "";
    els.bCumplido.hidden = !!p.q || !!p.op; els.bSi.hidden = !p.q; els.bNo.hidden = !p.q;
    els.bPausa.textContent = S.pausedAt ? "Continuar" : "Pausa";
    root.classList.toggle("en-pausa", !!S.pausedAt);
    // Mi camino
    els.camino.innerHTML = S.proto.camino.map(function (c) {
      var cls = c.id === p.fase ? "actual" : S.fasesVistas[c.id] ? "visto" : "";
      return '<li class="' + cls + '"><strong>' + esc(c.nombre) + "</strong>" + (c.tramo ? "<span>" + esc(c.tramo) + "</span>" : "") + "</li>";
    }).join("");
  }
  function pintarLog() {
    els.log.innerHTML = S.log.slice().reverse().map(function (l) {
      return '<li class="lg-' + l.tipo + '"><time>' + mmss(l.t) + "</time> " + esc(etiqueta(l.tipo)) + esc(l.texto) + "</li>";
    }).join("");
  }
  function etiqueta(t) {
    return { eleccion: "Elección: ", cumplido: "✓ ", omitido: "Omitido: ", "respuesta-si": "", "respuesta-no": "", aviso: "Aviso: ", hito: "Hito: ", recordatorio: "Recordatorio: ", timer: "", signos: "Signos: ", pausa: "", reanudar: "", atras: "", inicio: "", fin: "" }[t] || "";
  }

  /* ---------------- resumen y CaVeSal IA ---------------- */
  function resumenTexto() {
    var L = [];
    L.push("CaVeSal® Emergencias — " + S.proto.titulo);
    L.push("Activación: " + S.at0.toLocaleString("es-PY") + " · Duración: " + mmss(elapsed()));
    var vistas = S.proto.camino.filter(function (c) { return S.fasesVistas[c.id]; }).map(function (c) { return c.nombre; });
    L.push("Mi camino: " + vistas.join(" → "));
    L.push("");
    S.log.forEach(function (l) { L.push("[" + mmss(l.t) + " · " + hora(l.at) + "] " + etiqueta(l.tipo) + l.texto); });
    L.push("");
    L.push("Pasos dictados según: " + S.proto.fuentes);
    L.push("Registro de apoyo al equipo. No reemplaza el criterio clínico ni la historia clínica.");
    return L.join("\n");
  }
  function contextoIA() {
    var ultimo = S.signos[S.signos.length - 1];
    var clave = S.log.filter(function (l) { return /cumplido|respuesta|omitido|signos|aviso/.test(l.tipo); }).map(function (l) {
      return mmss(l.t) + " " + etiqueta(l.tipo) + l.texto.slice(0, 140);
    });
    var txt = clave.join(" | ");
    if (txt.length > 6000) txt = txt.slice(0, 6000) + "…";
    return {
      source_module: "emergencias",
      scope_authorized: "registro_codigo",
      patient_summary: null,
      pregnancy_context: { fum: null, eg_semanas: null, eg_dias: null, fpp: null, gestas: null, paridad: null, clasificacion_riesgo: null },
      clinical_findings: ultimo ? [{ hallazgo: "Índice de choque " + ultimo.si.toFixed(2) + " (FC " + ultimo.fc + ", PAS " + ultimo.pas + ")", nivel: ultimo.si >= 1.4 ? "rojo" : ultimo.si > 0.9 ? "naranja" : "verde" }] : [],
      labs: [], ultrasound: [], medications: [],
      risk_calculations: [{ tipo: "registro_" + S.proto.id, resultado: "Duración " + mmss(elapsed()) + ". Camino: " + S.proto.camino.filter(function (c) { return S.fasesVistas[c.id]; }).map(function (c) { return c.nombre; }).join(" → "), riesgo: null, fecha: S.at0.toISOString() }],
      alerts: [],
      event_log: txt,
      request: "Resumí el registro del " + S.proto.corto + " y respondé las preguntas del equipo. Los pasos fueron dictados por el algoritmo fijo con fuente."
    };
  }

  function terminar() {
    if (!S || S.fin) return;
    log("fin", "Cierre del " + S.proto.corto);
    S.fin = true;
    escucharPausa();
    if (synth) synth.cancel();
    clearInterval(S.int);
    soltarWakeLock();
    els.vivo.hidden = true;
    els.aviso.hidden = true;
    els.resumen.hidden = false;
    root.scrollTop = 0;
    els.resTxt.textContent = resumenTexto();
    els.reloj.textContent = mmss(elapsed());
    if (S.sonido && synth) {
      var u = new SpeechSynthesisUtterance("Código cerrado. Duración " + Math.floor(elapsed() / 60000) + " minutos. El registro está en pantalla.");
      u.lang = vozEs ? vozEs.lang : "es-ES"; if (vozEs) u.voice = vozEs; synth.speak(u);
    }
  }

  /* ---------------- wake lock ---------------- */
  var wl = null;
  function pedirWakeLock() { if ("wakeLock" in navigator) navigator.wakeLock.request("screen").then(function (x) { wl = x; }).catch(function () {}); }
  function soltarWakeLock() { if (wl) { try { wl.release(); } catch (e) {} wl = null; } }
  document.addEventListener("visibilitychange", function () { if (S && !S.fin && document.visibilityState === "visible") pedirWakeLock(); });

  /* ---------------- construcción del overlay ---------------- */
  function construir() {
    if (root) return;
    root = h("div", { id: "voz-overlay", class: "voz-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "voz-title", hidden: "" });
    root.innerHTML =
      '<div class="voz-head">' +
        '<div><div class="voz-title" id="voz-title"></div><div class="voz-mic" id="voz-mic"></div></div>' +
        '<div class="voz-reloj" id="voz-reloj" aria-live="off">00:00</div>' +
        '<button type="button" class="voz-x" id="voz-cerrar" aria-label="Cerrar modo voz">×</button>' +
      "</div>" +
      '<div class="voz-aviso" id="voz-aviso" role="alert" hidden></div>' +
      '<div class="voz-vivo" id="voz-vivo">' +
        '<ol class="voz-camino" id="voz-camino" aria-label="Mi camino"></ol>' +
        '<div class="voz-fase" id="voz-fase"></div>' +
        '<div class="voz-paso" id="voz-paso" aria-live="assertive"></div>' +
        '<div class="voz-inputs" id="voz-inputs" hidden>' +
          '<label>FC <input type="number" id="voz-fc" inputmode="numeric" min="0" placeholder="lpm"></label>' +
          '<label>PAS <input type="number" id="voz-pas" inputmode="numeric" min="0" placeholder="mmHg"></label>' +
          '<div class="voz-si" id="voz-si"></div>' +
        "</div>" +
        '<div class="voz-calc" id="voz-calc" hidden></div>' +
        '<div class="voz-ref" id="voz-ref"></div>' +
        '<div class="voz-timers" id="voz-timers"></div>' +
        '<div class="voz-ops" id="voz-ops" hidden></div>' +
        '<div class="voz-btns">' +
          '<button type="button" class="vb vb-ok" data-a="cumplido" id="vb-cumplido">Cumplido</button>' +
          '<button type="button" class="vb vb-si" data-a="si" id="vb-si" hidden>Sí</button>' +
          '<button type="button" class="vb vb-no" data-a="no" id="vb-no" hidden>No</button>' +
        "</div>" +
        '<div class="voz-btns sec">' +
          '<button type="button" class="vb2" data-a="atras">Atrás</button>' +
          '<button type="button" class="vb2" data-a="repetir">Repetir</button>' +
          '<button type="button" class="vb2" data-a="omitir">No aplica</button>' +
          '<button type="button" class="vb2" data-a="pausa" id="vb-pausa">Pausa</button>' +
          '<button type="button" class="vb2" id="vb-sonido" aria-pressed="true">Voz: sí</button>' +
          '<button type="button" class="vb2 fin" data-a="terminar">Cerrar código</button>' +
        "</div>" +
        '<div class="voz-oido" id="voz-oido"></div>' +
        '<details class="voz-logbox"><summary>Registro con hora</summary><ol class="voz-log" id="voz-log"></ol></details>' +
      "</div>" +
      '<div class="voz-resumen" id="voz-resumen" hidden>' +
        "<h3>Resumen del código</h3>" +
        '<pre class="voz-restxt" id="voz-restxt"></pre>' +
        '<div class="voz-btns sec">' +
          '<button type="button" class="vb2" id="vr-copiar">Copiar</button>' +
          '<button type="button" class="vb2" id="vr-descargar">Descargar .txt</button>' +
          '<button type="button" class="vb2 ia" id="vr-ia">Resumen y preguntas con CaVeSal® IA</button>' +
          '<button type="button" class="vb2" id="vr-cerrar">Volver a la Calculadora</button>' +
        "</div>" +
        '<p class="voz-nota">CaVeSal® IA recibe el registro sin nombre ni documento. Los pasos ya fueron dictados por el algoritmo fijo; la IA solo resume y responde preguntas.</p>' +
      "</div>";
    document.body.appendChild(root);
    ["title", "mic", "reloj", "aviso", "vivo", "camino", "fase", "paso", "inputs", "ref", "calc", "ops", "timers", "oido", "log", "resumen", "restxt"].forEach(function (k) { els[k === "restxt" ? "resTxt" : k] = $("#voz-" + k); });
    els.fc = $("#voz-fc"); els.pas = $("#voz-pas"); els.siOut = $("#voz-si");
    els.bCumplido = $("#vb-cumplido"); els.bSi = $("#vb-si"); els.bNo = $("#vb-no"); els.bPausa = $("#vb-pausa");
    root.addEventListener("click", function (e) {
      var o = e.target.closest("[data-op]"); if (o) return elegir(o.getAttribute("data-op"));
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (a === "pausa" && S && S.pausedAt) a = "reanudar";
      accion(a);
    });
    els.fc.addEventListener("input", actualizarSI); els.pas.addEventListener("input", actualizarSI);
    $("#vb-sonido").addEventListener("click", function () {
      S.sonido = !S.sonido; this.textContent = "Voz: " + (S.sonido ? "sí" : "no"); this.setAttribute("aria-pressed", S.sonido);
      if (!S.sonido && synth) synth.cancel();
    });
    $("#voz-cerrar").addEventListener("click", function () {
      if (S && !S.fin && !confirm("¿Cerrar el código en curso? Se generará el resumen.")) return;
      if (S && !S.fin) terminar(); else cerrar();
    });
    $("#vr-cerrar").addEventListener("click", cerrar);
    $("#vr-copiar").addEventListener("click", function () {
      var t = els.resTxt.textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { this.textContent = "Copiado"; }.bind(this)).catch(function () { prompt("Copiá el registro:", t); });
    });
    $("#vr-descargar").addEventListener("click", function () {
      var blob = new Blob([els.resTxt.textContent], { type: "text/plain;charset=utf-8" });
      var a = h("a", { href: URL.createObjectURL(blob), download: "registro-" + S.proto.id + "-" + S.at0.toISOString().slice(0, 16).replace(/[:T]/g, "-") + ".txt" });
      document.body.appendChild(a); a.click(); a.remove();
    });
    $("#vr-ia").addEventListener("click", function () {
      var enc = btoa(unescape(encodeURIComponent(JSON.stringify(contextoIA()))));
      window.open(IA_URL + "?context=" + encodeURIComponent(enc), "_blank", "noopener,noreferrer");
    });
  }

  function cerrar() {
    escucharPausa(); if (synth) synth.cancel(); soltarWakeLock();
    if (S) clearInterval(S.int);
    S = null; root.hidden = true; document.body.classList.remove("voz-abierto");
  }

  function iniciar(codigo, opciones) {
    var proto = P[codigo]; if (!proto) return;
    construir();
    opciones = opciones || {};
    S = {
      proto: proto, idx: 0, hist: [], log: [], timers: [], hitos: {}, rec: {}, fasesVistas: {}, signos: [],
      t0: Date.now(), at0: new Date(), pausedMs: 0, pausedAt: 0, sonido: !!synth, micro: !!SR && opciones.micro !== false, hablando: false, fin: false
    };
    els.title.textContent = proto.titulo;
    root.className = "voz-overlay vz-" + proto.id;
    els.vivo.hidden = false; els.resumen.hidden = true; els.aviso.hidden = true;
    els.fc.value = (document.getElementById("in-fc") || {}).value || "";
    els.pas.value = (document.getElementById("in-pas") || {}).value || "";
    actualizarSI();
    $("#vb-sonido").textContent = "Voz: " + (S.sonido ? "sí" : "no");
    $("#vr-copiar").textContent = "Copiar";
    root.hidden = false; document.body.classList.add("voz-abierto");
    estadoMic(SR ? "Activando micrófono…" : "Este navegador no reconoce voz: usá los botones (la app igual dicta los pasos)");
    pedirWakeLock();
    log("inicio", "Activación del " + proto.corto);
    S.fasesVistas[proto.pasos[0].fase] = true;
    pintar();
    S.int = setInterval(tick, 500);
    dictar();
  }

  /* ---------------- entrada: emergencia ahora / desde cero ---------------- */
  var DESTINOS = {
    rojo: { nombre: "Código Rojo — Hemorragia", voz: true },
    thae: { nombre: "Código THAE — Hipertensión", voz: true },
    amarillo: { nombre: "Código Amarillo — Sepsis", voz: true },
    rcp: { nombre: "Código Azul Obstétrico — RCP", voz: true },
    ninguno: { nombre: "Sin criterios de activación", seccion: null }
  };
  function irDestino(code, panel) {
    var d = DESTINOS[code];
    if (d.voz && P[code]) { cerrarEntrada(); return iniciar(code); }
    if (d.guia) { location.href = d.guia; return; }
    cerrarEntrada();
    if (d.seccion) {
      var b = document.getElementById("navtab-" + d.seccion);
      if (b) { b.click(); b.scrollIntoView({ behavior: "smooth", block: "start" }); }
    } else {
      var bar = document.querySelector(".patient-bar"); if (bar) bar.scrollIntoView({ behavior: "smooth" });
      var fc = document.getElementById("in-fc"); if (fc) fc.focus();
    }
  }

  var dlg;
  function entrada(modo) {
    if (!tieneLicenciaFull()) { mostrarBloqueoFull(); return; }
    if (!dlg) {
      dlg = h("dialog", { id: "voz-entrada", class: "voz-entrada", "aria-labelledby": "ve-title" });
      document.body.appendChild(dlg);
      dlg.addEventListener("click", function (e) {
        if (e.target === dlg) return dlg.close();
        var b = e.target.closest("[data-go]"); if (b) irDestino(b.getAttribute("data-go"));
        var q = e.target.closest("[data-arbol]"); if (q) pasoArbol(q.getAttribute("data-arbol"));
        if (e.target.closest(".ve-x")) dlg.close();
      });
    }
    if (modo === "ahora") {
      dlg.innerHTML = '<div class="ve-head"><h2 id="ve-title">Tengo una emergencia ahora</h2><button type="button" class="ve-x" aria-label="Cerrar">×</button></div>' +
        '<p class="ve-sub">Elegí el código. Se abre el modo voz: la app dicta cada paso y avanza cuando decís «cumplido».</p>' +
        '<div class="ve-codes">' +
          '<button type="button" class="ve-code rojo" data-go="rojo"><strong>Código Rojo</strong><span>Hemorragia · modo voz</span></button>' +
          '<button type="button" class="ve-code azul" data-go="thae"><strong>Código THAE</strong><span>Hipertensión grave · modo voz</span></button>' +
          '<button type="button" class="ve-code ambar" data-go="amarillo"><strong>Código Amarillo</strong><span>Sepsis · modo voz</span></button>' +
          '<button type="button" class="ve-code rcp" data-go="rcp"><strong>Código Azul</strong><span>Paro / colapso · modo voz</span></button>' +
        "</div>" + avisoMic();
    } else {
      dlg.innerHTML = '<div class="ve-head"><h2 id="ve-title">Empezar desde cero</h2><button type="button" class="ve-x" aria-label="Cerrar">×</button></div><div id="ve-arbol"></div>';
      S_arbol = []; pasoArbol("p1");
    }
    if (!dlg.open) dlg.showModal();
  }
  function avisoMic() {
    return '<p class="ve-nota">' + (SR ? "Al iniciar, el navegador pide permiso para usar el micrófono. Funciona mejor en Chrome o Edge (Android y computadora)." : "Este navegador no reconoce comandos de voz (habitual en iPhone): la app dicta los pasos y se avanza con los botones grandes.") + " Es apoyo a la memoria del equipo y no reemplaza el criterio clínico.</p>";
  }
  var S_arbol = [];
  function pasoArbol(arg) {
    var cont = $("#ve-arbol");
    if (arg.indexOf(":") > 0) {
      var parts = arg.split(":"), nodo = ARBOL.filter(function (n) { return n.id === parts[0]; })[0];
      S_arbol.push({ q: nodo.q, r: parts[1] === "si" ? "Sí" : "No" });
      var dest = nodo[parts[1]];
      if (typeof dest === "object") return resultadoArbol(dest.code);
      arg = dest;
    }
    var n = ARBOL.filter(function (x) { return x.id === arg; })[0];
    var hist = S_arbol.map(function (x) { return "<li>" + esc(x.q) + " <strong>" + x.r + "</strong></li>"; }).join("");
    cont.innerHTML = (hist ? '<ol class="ve-hist">' + hist + "</ol>" : "") +
      '<div class="ve-q">' + esc(n.q) + '</div><div class="ve-ref">' + esc(n.ref) + "</div>" +
      '<div class="ve-yn"><button type="button" class="vb vb-si" data-arbol="' + n.id + ':si">Sí</button><button type="button" class="vb vb-no" data-arbol="' + n.id + ':no">No</button></div>';
  }
  function resultadoArbol(code) {
    var d = DESTINOS[code], cont = $("#ve-arbol");
    var hist = S_arbol.map(function (x) { return "<li>" + esc(x.q) + " <strong>" + x.r + "</strong></li>"; }).join("");
    var btn = code === "ninguno"
      ? '<p class="ve-sub">No se cumplen los criterios de activación de ningún código. Cargá los signos vitales para la Escala de Alerta Precoz Obstétrica y reevaluá.</p><button type="button" class="vb vb-ok" data-go="ninguno">Ir a la barra de signos vitales</button>'
      : '<button type="button" class="vb vb-ok" data-go="' + code + '">Activar ' + esc(d.nombre) + (d.voz ? " · modo voz" : "") + "</button>";
    cont.innerHTML = '<ol class="ve-hist">' + hist + '</ol><div class="ve-res ' + code + '">' + esc(d.nombre) + "</div>" + btn + (d.voz ? avisoMic() : "") +
      '<button type="button" class="vb2" data-arbol-reset>Volver a empezar</button>';
    var r = cont.querySelector("[data-arbol-reset]"); r.addEventListener("click", function () { S_arbol = []; pasoArbol("p1"); });
  }
  function cerrarEntrada() { if (dlg && dlg.open) dlg.close(); }

  window.CaVeSalVoz = { iniciar: iniciar, entrada: entrada, _cmd: comando, _estado: function () { return S; } };

  document.addEventListener("DOMContentLoaded", function () {
    var a = document.getElementById("btn-emergencia-ahora"), z = document.getElementById("btn-desde-cero");
    if (a) a.addEventListener("click", function () { entrada("ahora"); });
    if (z) z.addEventListener("click", function () { entrada("cero"); });
    if (/[#&?]emergencia/.test(location.hash + location.search)) entrada("ahora");
    if (/[#&?]desde-cero/.test(location.hash + location.search)) entrada("cero");
  });
})();
