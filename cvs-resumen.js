/**
 * CaVeSal® Emergencias — "Resumen y conducta".
 * Junta en un panel lo que ya calcula cada tarjeta (sin contenido clínico nuevo):
 * datos de la paciente (opcionales, solo en este dispositivo), signos vitales,
 * índices, alertas activas y el resultado + conducta de cada módulo.
 * Full: guardar/abrir caso (JSON), exportar PDF y Word, y analizar con CaVeSal® IA.
 * Demo: muestra el resumen; guardar, exportar e IA aparecen con candado.
 */
(function () {
  "use strict";
  var me = document.currentScript;
  var MODO = (me && me.getAttribute("data-mode")) || "full";
  var DEMO = MODO === "demo";
  var IMG = "https://cavesal.app/img/landing/mascota-ia-anim.webp";

  function $(id) { return document.getElementById(id); }
  function t(e) { return e ? (e.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function val(id) { var e = $(id); return e && e.value !== "" ? e.value : ""; }
  function hoy() {
    var d = new Date();
    return d.toLocaleDateString("es-PY") + " " + d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });
  }
  function upgrade() {
    if (typeof window.abrirUpgradeModal === "function") window.abrirUpgradeModal();
    else location.href = "../full/";
  }

  var css = "" +
    "#cvs-res-fab{position:fixed;left:12px;bottom:12px;z-index:8990;display:flex;align-items:center;gap:8px;background:#0D1B2D;color:#fff;border:0;border-radius:999px;padding:12px 18px;font:700 .9rem/1 inherit;font-family:inherit;box-shadow:0 6px 18px rgba(13,27,45,.35);cursor:pointer}" +
    "#cvs-res-fab b{display:inline-block;width:9px;height:9px;border-radius:50%;background:#94a3b8}" +
    "#cvs-res-fab[data-n='rojo'] b{background:#ef4444}#cvs-res-fab[data-n='naranja'] b{background:#f97316}#cvs-res-fab[data-n='amarillo'] b{background:#eab308}#cvs-res-fab[data-n='verde'] b{background:#22c55e}" +
    "#cvs-res{position:fixed;inset:0;z-index:9500;background:rgba(13,27,45,.6);display:none;align-items:flex-end;justify-content:center}" +
    "#cvs-res.open{display:flex}" +
    "#cvs-res .rs-sheet{background:#f4f8fa;width:100%;max-width:760px;max-height:92vh;overflow:auto;border-radius:18px 18px 0 0;padding:0 0 24px;font-family:inherit;color:#0D1B2D}" +
    "#cvs-res .rs-head{position:sticky;top:0;background:#0D1B2D;color:#fff;padding:14px 18px;display:flex;align-items:center;gap:10px;z-index:2}" +
    "#cvs-res .rs-head h2{font-size:1.05rem;margin:0;flex:1;color:#fff}" +
    "#cvs-res .rs-x{background:rgba(255,255,255,.14);color:#fff;border:0;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer;font-family:inherit}" +
    "#cvs-res .rs-body{padding:14px 16px}" +
    ".rs-card{background:#fff;border:1px solid #d7e6ea;border-radius:14px;padding:12px 14px;margin-bottom:10px}" +
    ".rs-card h3{font-size:.92rem;margin:0 0 8px;color:#0b3c5d}" +
    ".rs-pac{display:grid;grid-template-columns:1fr 90px;gap:8px}" +
    ".rs-pac input,.rs-pac textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:9px;padding:8px 10px;font:inherit;font-size:.85rem}" +
    ".rs-pac textarea{grid-column:1/-1;min-height:48px;resize:vertical}" +
    ".rs-note{font-size:.72rem;color:#64748b;margin:6px 0 0}" +
    ".rs-kv{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}" +
    ".rs-kv div{background:#f1f7f9;border-radius:10px;padding:8px 10px}" +
    ".rs-kv span{display:block;font-size:.68rem;color:#64748b;text-transform:uppercase;letter-spacing:.04em}" +
    ".rs-kv strong{font-size:.95rem}" +
    ".rs-kv em{display:block;font-style:normal;font-size:.72rem;color:#475569}" +
    ".rs-alert{background:#fdecea;border:1px solid #f5b5ae;color:#991b1b;border-radius:10px;padding:8px 12px;font-weight:700;font-size:.85rem;margin-bottom:6px}" +
    ".rs-sec{font-size:.8rem;font-weight:800;color:#0e7490;text-transform:uppercase;letter-spacing:.05em;margin:14px 0 6px}" +
    ".rs-item{border-left:5px solid #94a3b8;background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:8px;border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}" +
    ".rs-item.n-rojo{border-left-color:#dc2626}.rs-item.n-naranja{border-left-color:#ea580c}.rs-item.n-amarillo{border-left-color:#ca8a04}.rs-item.n-verde{border-left-color:#16a34a}" +
    ".rs-item small{display:block;font-size:.7rem;color:#64748b;font-weight:700}" +
    ".rs-item .rs-t{font-weight:700;font-size:.9rem;margin:2px 0}" +
    ".rs-item .rs-d{font-size:.8rem;line-height:1.45;color:#1e293b}" +
    ".rs-item .rs-d button,.rs-item .rs-d input,.rs-item .rs-d select{display:none}" +
    ".rs-empty{font-size:.85rem;color:#64748b;text-align:center;padding:18px}" +
    ".rs-ia{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;background:linear-gradient(135deg,#f5f0ff,#faf7ff);border:1px solid #ddd0fb;border-radius:14px;padding:12px 14px;margin:12px 0 10px}" +
    ".rs-ia .mz{width:52px;aspect-ratio:120/256;flex-shrink:0;background:url(" + IMG + ") 0 0/800% 100% no-repeat;animation:rsOrb 1.6s steps(8) infinite,rsBob 3.2s ease-in-out infinite}" +
    "@keyframes rsOrb{to{background-position:114.2857% 0}}@keyframes rsBob{50%{transform:translateY(-4px)}}" +
    ".rs-ia .bd{flex:1 1 220px;min-width:0}" +
    ".rs-ia .tt{font-weight:700;color:#5b21b6;font-size:.9rem;margin-bottom:4px}" +
    ".rs-ia .bub{position:relative;background:#fff;border:1.5px solid #c9b3f5;border-radius:14px;padding:9px 12px;font-size:.8rem;line-height:1.4;margin:0 0 6px 6px}" +
    ".rs-ia .bub:before{content:'';position:absolute;left:-8px;bottom:12px;width:13px;height:13px;background:#fff;border-left:1.5px solid #c9b3f5;border-bottom:1.5px solid #c9b3f5;transform:rotate(45deg)}" +
    ".rs-ia .pv{font-size:.7rem;color:#64748b;margin-left:6px}" +
    ".rs-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;padding:11px 16px;font:700 .86rem/1 inherit;font-family:inherit;cursor:pointer}" +
    ".rs-btn.ia{background:#7c3aed;color:#fff}" +
    ".rs-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".rs-acts .rs-btn{background:#fff;color:#0b3c5d;border:1.5px solid #0e7490}" +
    ".rs-acts .rs-btn.main{background:#0e7490;color:#fff}" +
    ".rs-lock{opacity:.75}" +
    ".rs-demo{font-size:.75rem;color:#64748b;text-align:center;margin-top:8px}" +
    "@media (prefers-reduced-motion:reduce){.rs-ia .mz{animation:none;background-position:57.14% 0}}" +
    "#cvs-print{display:none}" +
    "@media print{body.cvs-printing>*:not(#cvs-print){display:none!important}body.cvs-printing #cvs-print{display:block!important}#cvs-print,#cvs-print *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}" +
    "#cvs-print{font-family:Arial,sans-serif;color:#000;font-size:11pt}" +
    "#cvs-print h1{font-size:15pt;margin:0 0 2px}#cvs-print .sub{font-size:9pt;color:#444;margin-bottom:10px}" +
    "#cvs-print .rs-item,#cvs-print .rs-card{break-inside:avoid}";

  function injectCSS() { var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); }

  /* ---------- recolección (reusa el criterio del puente IA) ---------- */
  var NIV = { "rb-verde": "verde", "rb-amarillo": "amarillo", "rb-naranja": "naranja", "rb-rojo": "rojo" };
  var ORDEN = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 };
  function nivel(box) { for (var k in NIV) if (box.classList.contains(k)) return NIV[k]; return null; }
  function visible(e) {
    if (!e) return false;
    if (e.style && e.style.display === "none") return false;
    return e.offsetParent !== null || e.getClientRects().length > 0 || !!e.closest(".code-section");
  }
  function recolectar() {
    var out = { basicos: [], alertas: [], grupos: [], peor: null };
    function kv(lbl, v, sub) { if (v && v !== "—") out.basicos.push({ l: lbl, v: v, s: sub || "" }); }
    var pas = val("in-pas"), pad = val("in-pad");
    kv("FUM", val("in-fum"));
    kv("Edad gestacional", t($("ro-eg-value")), t($("ro-eg-sub")));
    if (pas && pad) kv("Presión arterial", pas + "/" + pad + " mmHg");
    kv("FC", val("in-fc") ? val("in-fc") + " lpm" : "");
    kv("PAM", t($("ro-pam-value")), t($("ro-pam-sub")));
    kv("Índice de shock", t($("ro-si-value")), t($("ro-si-sub")));
    kv("IMC", t($("ro-imc-value")), t($("ro-imc-sub")));
    kv("Peso", val("in-peso") ? val("in-peso") + " kg" : "");
    kv("Talla", val("in-talla") ? val("in-talla") + " cm" : "");

    document.querySelectorAll(".alert-banner").forEach(function (a) {
      if (a.classList.contains("show")) { var x = t(a); if (x) out.alertas.push(x); }
    });

    var mapa = {};
    document.querySelectorAll(".result-box").forEach(function (box) {
      if (!box.id || box.classList.contains("rb-neutro") || !visible(box)) return;
      if (box.closest("#cvs-res")) return;
      var tt = t($(box.id + "-title")) || t(box.querySelector(".result-title"));
      if (!tt) return;
      var det = $(box.id + "-detail") || box.querySelector(".result-detail");
      var sec = box.closest(".code-section");
      var secT = sec ? t(sec.querySelector(".section-intro h2, h2")) : "";
      var card = box.closest(".card");
      var cardT = card ? t(card.querySelector("h3") || card.querySelector("h4")) : "";
      var n = nivel(box);
      if (n && (!out.peor || ORDEN[n] > ORDEN[out.peor])) out.peor = n;
      var key = secT || "Resultados";
      if (!mapa[key]) { mapa[key] = { titulo: key, items: [] }; out.grupos.push(mapa[key]); }
      mapa[key].items.push({ modulo: cardT, titulo: tt, detalle: det ? det.innerHTML : "", nivel: n });
    });
    return out;
  }

  /* ---------- panel ---------- */
  var PAC = { nombre: "", edad: "", notas: "" };
  function htmlResumen(d, paraExportar) {
    var h = "";
    if (paraExportar) {
      var p = [];
      if (PAC.nombre) p.push("<b>Paciente:</b> " + esc(PAC.nombre));
      if (PAC.edad) p.push("<b>Edad:</b> " + esc(PAC.edad) + " años");
      h += '<div class="rs-card"><h3>Datos de la paciente</h3><div>' + (p.join(" · ") || "Sin datos de identificación") + "</div>" +
        (PAC.notas ? '<div style="margin-top:6px"><b>Notas:</b> ' + esc(PAC.notas) + "</div>" : "") + "</div>";
    }
    if (d.basicos.length) {
      h += '<div class="rs-card"><h3>Signos vitales e índices</h3><div class="rs-kv">' +
        d.basicos.map(function (b) { return "<div><span>" + esc(b.l) + "</span><strong>" + esc(b.v) + "</strong>" + (b.s ? "<em>" + esc(b.s) + "</em>" : "") + "</div>"; }).join("") +
        "</div></div>";
    }
    if (d.alertas.length) h += d.alertas.map(function (a) { return '<div class="rs-alert">' + esc(a) + "</div>"; }).join("");
    if (!d.grupos.length && !d.basicos.length) {
      h += '<div class="rs-empty">Todavía no hay resultados. Cargá los signos vitales o completá algún módulo, o probá con un caso de ejemplo.</div>';
    }
    d.grupos.forEach(function (g) {
      h += '<div class="rs-sec">' + esc(g.titulo) + "</div>";
      g.items.forEach(function (it) {
        h += '<div class="rs-item' + (it.nivel ? " n-" + it.nivel : "") + '">' + (it.modulo ? "<small>" + esc(it.modulo) + "</small>" : "") +
          '<div class="rs-t">' + esc(it.titulo) + "</div>" + (it.detalle ? '<div class="rs-d">' + it.detalle + "</div>" : "") + "</div>";
      });
    });
    return h;
  }

  function construirPanel() {
    var w = document.createElement("div");
    w.id = "cvs-res";
    w.setAttribute("role", "dialog");
    w.setAttribute("aria-modal", "true");
    w.setAttribute("aria-label", "Resumen y conducta");
    var L = DEMO ? " 🔒" : "";
    w.innerHTML = '<div class="rs-sheet"><div class="rs-head"><h2>Resumen y conducta</h2><button type="button" class="rs-x" data-a="cerrar">Cerrar</button></div>' +
      '<div class="rs-body">' +
      '<div class="rs-card"><h3>Paciente (opcional)</h3><div class="rs-pac">' +
      '<input id="rs-nombre" placeholder="Nombre o iniciales" autocomplete="off"><input id="rs-edad" type="number" inputmode="numeric" placeholder="Edad">' +
      '<textarea id="rs-notas" placeholder="Notas del caso (opcional)"></textarea></div>' +
      '<p class="rs-note">Estos datos quedan solo en este dispositivo y en los archivos que vos exportes. No se envían a CaVeSal® IA.</p></div>' +
      '<div id="rs-hora" class="rs-note" style="margin:0 0 8px"></div>' +
      '<div id="rs-contenido"></div>' +
      '<div class="rs-ia"><span class="mz" role="img" aria-label="Robotita de CaVeSal® IA"></span><div class="bd"><div class="tt">Analizar con CaVeSal® IA</div>' +
      '<p class="bub">¿Querés ir más a fondo? Enviame lo que cargaste y lo repaso con las guías OMS, FIGO, ACOG y MSPBS. Vos decidís; yo te acompaño en cada paso.</p>' +
      '<div class="pv">' + (DEMO ? "Disponible en la versión completa." : "No se envían nombre ni documento.") + "</div></div>" +
      '<button type="button" class="rs-btn ia' + (DEMO ? " rs-lock" : "") + '" data-a="ia">Analizar' + L + "</button></div>" +
      '<div class="rs-acts">' +
      '<button type="button" class="rs-btn main' + (DEMO ? " rs-lock" : "") + '" data-a="json">Guardar caso' + L + "</button>" +
      '<button type="button" class="rs-btn' + (DEMO ? " rs-lock" : "") + '" data-a="abrir">Abrir caso guardado' + L + "</button>" +
      '<button type="button" class="rs-btn' + (DEMO ? " rs-lock" : "") + '" data-a="pdf">Exportar PDF' + L + "</button>" +
      '<button type="button" class="rs-btn' + (DEMO ? " rs-lock" : "") + '" data-a="word">Exportar Word' + L + "</button>" +
      "</div>" +
      (DEMO ? '<p class="rs-demo">Guardar, exportar y analizar con CaVeSal® IA están en la versión completa.</p>' : "") +
      '<input type="file" id="rs-file" accept=".json,application/json" hidden>' +
      "</div></div>";
    document.body.appendChild(w);
    w.addEventListener("click", function (e) {
      if (e.target === w) return cerrar();
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (a === "cerrar") return cerrar();
      if (DEMO) return upgrade();
      if (a === "ia") { if (typeof window.analizarConCavesalIA === "function") window.analizarConCavesalIA(); return; }
      if (a === "json") return guardarJSON();
      if (a === "abrir") return $("rs-file").click();
      if (a === "pdf") return exportarPDF();
      if (a === "word") return exportarWord();
    });
    ["rs-nombre", "rs-edad", "rs-notas"].forEach(function (id) {
      $(id).addEventListener("input", function () { PAC.nombre = $("rs-nombre").value.trim(); PAC.edad = $("rs-edad").value.trim(); PAC.notas = $("rs-notas").value.trim(); });
    });
    $("rs-file").addEventListener("change", abrirJSON);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && w.classList.contains("open")) cerrar(); });
  }

  function abrir() {
    var d = recolectar();
    $("rs-contenido").innerHTML = htmlResumen(d, false);
    $("rs-hora").textContent = "Resumen generado: " + hoy();
    $("cvs-res").classList.add("open");
    document.documentElement.style.overflow = "hidden";
  }
  function cerrar() { $("cvs-res").classList.remove("open"); document.documentElement.style.overflow = ""; }

  function construirFab() {
    var b = document.createElement("button");
    b.id = "cvs-res-fab"; b.type = "button";
    b.innerHTML = "<b></b>Resumen y conducta";
    b.addEventListener("click", abrir);
    document.body.appendChild(b);
    setInterval(function () {
      if (document.hidden) return;
      var p = recolectar().peor;
      if (p) b.setAttribute("data-n", p); else b.removeAttribute("data-n");
    }, 1500);
  }

  /* ---------- guardar / abrir JSON ---------- */
  function claveCampo(e) {
    if ((e.type === "radio" || e.type === "checkbox") && !e.id) return e.name ? e.name + "=" + e.value : null;
    return e.id || null;
  }
  var EXCL = "#cvs-res, #license_gate, #cavesal-legal-overlay, #modal_ejemplos, .voz-overlay";
  function todos() {
    return Array.prototype.filter.call(document.querySelectorAll("input, select, textarea"), function (e) {
      return !e.closest(EXCL) && e.type !== "hidden" && e.type !== "password" && e.type !== "file";
    });
  }
  function campos() {
    var o = {};
    todos().forEach(function (e) {
      if (e.closest("#cvs-res") || e.type === "file" || e.type === "password") return;
      var k = claveCampo(e); if (!k) return;
      if (e.type === "radio" || e.type === "checkbox") { if (e.checked) o[k] = true; }
      else if (e.value !== "") o[k] = e.value;
    });
    return o;
  }
  function descargar(nombre, tipo, contenido) {
    var blob = new Blob([contenido], { type: tipo });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function base() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    var id = (PAC.nombre || "caso").replace(/[^\wáéíóúñÁÉÍÓÚÑ]+/g, "-").slice(0, 30);
    return "CaVeSal-Emergencias_" + id + "_" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes());
  }
  function guardarJSON() {
    var data = { app: "cavesal-emergencias", version: 1, fecha: new Date().toISOString(), paciente: PAC, campos: campos() };
    descargar(base() + ".json", "application/json", JSON.stringify(data, null, 2));
  }
  function abrirJSON(ev) {
    var f = ev.target.files && ev.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(r.result);
        if (!data || data.app !== "cavesal-emergencias" || !data.campos) throw new Error("formato");
        var c = data.campos;
        todos().forEach(function (e) {
          if (e.closest("#cvs-res") || e.type === "file") return;
          var k = claveCampo(e); if (!k) return;
          if (e.type === "radio" || e.type === "checkbox") {
            var on = !!c[k];
            if (e.checked !== on) { e.checked = on; e.dispatchEvent(new Event("change", { bubbles: true })); }
          } else if (Object.prototype.hasOwnProperty.call(c, k)) {
            e.value = c[k];
            e.dispatchEvent(new Event("input", { bubbles: true }));
            e.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
        PAC = { nombre: (data.paciente && data.paciente.nombre) || "", edad: (data.paciente && data.paciente.edad) || "", notas: (data.paciente && data.paciente.notas) || "" };
        $("rs-nombre").value = PAC.nombre; $("rs-edad").value = PAC.edad; $("rs-notas").value = PAC.notas;
        setTimeout(abrir, 400);
      } catch (e) {
        alert("Ese archivo no es un caso guardado de CaVeSal® Emergencias.");
      }
      ev.target.value = "";
    };
    r.readAsText(f);
  }

  /* ---------- exportar ---------- */
  function documentoHTML() {
    var d = recolectar();
    return '<h1>CaVeSal® Emergencias Obstétricas — Resumen y conducta</h1>' +
      '<div class="sub">Generado: ' + esc(hoy()) + " · cavesal.app</div>" +
      htmlResumen(d, true) +
      '<p style="font-size:8.5pt;color:#555;margin-top:14px">Herramienta de apoyo a la decisión clínica para profesionales de la salud. No reemplaza el juicio clínico ni las guías oficiales. Algoritmos propios CaVeSal® basados en las fuentes citadas en la app.</p>';
  }
  function exportarPDF() {
    var p = $("cvs-print");
    if (!p) { p = document.createElement("div"); p.id = "cvs-print"; document.body.appendChild(p); }
    p.innerHTML = documentoHTML();
    document.body.classList.add("cvs-printing");
    var fin = function () { document.body.classList.remove("cvs-printing"); window.removeEventListener("afterprint", fin); };
    window.addEventListener("afterprint", fin);
    setTimeout(function () { window.print(); setTimeout(fin, 1500); }, 60);
  }
  function exportarWord() {
    var estilos = css.replace(/@media print\{[^}]*\}[^}]*\}/, "");
    var doc = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>CaVeSal Emergencias</title><style>body{font-family:Arial,sans-serif;font-size:11pt}' + estilos + "</style></head><body>" + documentoHTML() + "</body></html>";
    descargar(base() + ".doc", "application/msword", "\ufeff" + doc);
  }

  /* ---------- ejemplos: al cargar, abrir el resumen ---------- */
  function engancharEjemplos() {
    ["cargarEjemploEmerg", "cargarEjemploParto"].forEach(function (fn) {
      var orig = window[fn];
      if (typeof orig !== "function" || orig.__cvs) return;
      var w = function () { var r = orig.apply(this, arguments); setTimeout(abrir, 700); return r; };
      w.__cvs = true; window[fn] = w;
    });
  }

  function init() {
    injectCSS(); construirPanel(); construirFab(); engancharEjemplos();
    window.cvsAbrirResumen = abrir;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
