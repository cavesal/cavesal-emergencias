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
    return e.offsetParent !== null || e.getClientRects().length > 0 || !!e.closest(".code-section") || !!e.closest(".cvn-page");
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
      if (box.closest("#cvs-res") || box.closest("#cvn-p-resultado")) return;
      var tt = t($(box.id + "-title")) || t(box.querySelector(".result-title"));
      if (!tt) return;
      var det = $(box.id + "-detail") || box.querySelector(".result-detail");
      var sec = box.closest(".code-section");
      var secT = sec ? t(sec.querySelector(".section-intro h2, h2")) : (box.closest("#alerta-card") ? "Alerta Obstétrica CaVeSal®" : "");
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

  /* ================= NAVEGACIÓN POR PESTAÑAS ================= */
  var PAGINAS = [
    ["emergencia", "Tengo una emergencia", '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>'],
    ["codigos", "Códigos", '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'],
    ["parto", "Parto y puerperio", '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>'],
    ["resultado", "Resultado", '<path d="M9 4h6v3H9zM7 5H5v16h14V5h-2"/><path d="m9 14 2 2 4-4"/>']
  ];
  var CODIGOS = {
    rojo: ["Código Rojo", "Hemorragia obstétrica"],
    azul: ["Código Azul THAE", "Hipertensión / preeclampsia"],
    ambar: ["Código Amarillo — Sepsis", "Infección materna grave"],
    rcp: ["Código Azul Obstétrico", "Paro / colapso materno"]
  };
  var NOMBRE_NIVEL = { rojo: "Rojo", naranja: "Naranja", amarillo: "Amarillo", verde: "Verde" };

  function injectNavCSS() {
    var c = "" +
      ".topbar{position:relative!important;top:auto!important}" +
      ".patient-bar{position:relative!important;top:auto!important}" +
      "#cvn-nav{position:sticky;top:0;z-index:60;background:linear-gradient(135deg,#0D1B2D,#0c4e54);padding:8px 10px 10px;box-shadow:0 4px 14px rgba(13,27,45,.25)}" +
      "#cvn-nav .cvn-in{max-width:1100px;margin:0 auto}" +
      ".cvn-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}" +
      ".cvn-tab{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:54px;padding:6px 4px;border-radius:12px;border:1.5px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#e6f4f6;font:700 .74rem/1.15 inherit;font-family:inherit;text-align:center;cursor:pointer}" +
      ".cvn-tab svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
      ".cvn-tab[aria-selected='true']{background:#fff;color:#0c4e54;border-color:#fff}" +
      ".cvn-tab[data-p='emergencia']{border-color:rgba(255,120,120,.6)}" +
      ".cvn-tab[data-p='emergencia'][aria-selected='true']{color:#a13544}" +
      ".cvn-tab i{position:absolute;top:6px;right:8px;width:10px;height:10px;border-radius:50%;display:none;border:2px solid #fff}" +
      ".cvn-tab i[data-n]{display:block}.cvn-tab i[data-n='rojo']{background:#ef4444}.cvn-tab i[data-n='naranja']{background:#f97316}.cvn-tab i[data-n='amarillo']{background:#eab308}.cvn-tab i[data-n='verde']{background:#22c55e}" +
      "#cvn-calc{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:8px;padding:12px;border:0;border-radius:12px;background:#fff;color:#0D1B2D;font:800 1rem/1 inherit;font-family:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.18)}" +
      "#cvn-calc svg{width:18px;height:18px;fill:#f59e0b}" +
      "#cvn-nav[data-p='emergencia'] #cvn-calc,#cvn-nav[data-p='resultado'] #cvn-calc{display:none}" +
      ".cvn-sos{max-width:1100px;margin:16px auto 0;padding:0 16px}" +
      ".cvn-sos>div{background:linear-gradient(135deg,#7f1d1d,#c0392b);color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 6px 18px rgba(161,53,68,.3)}" +
      ".cvn-sos h2{display:flex;align-items:center;gap:10px;margin:0 0 6px;font-size:1.15rem;font-weight:800;color:#fff}" +
      ".cvn-sos h2 i{width:12px;height:12px;border-radius:50%;background:#fff;flex-shrink:0;animation:cvnPulse 1.2s ease-in-out infinite}" +
      "@keyframes cvnPulse{50%{opacity:.25;transform:scale(.7)}}@media (prefers-reduced-motion:reduce){.cvn-sos h2 i{animation:none}}" +
      ".cvn-sos p{margin:0;font-size:.88rem;line-height:1.45;color:#fff}.cvn-sos p+p{margin-top:6px}" +
      ".cvn-sos b{color:#fff}" +
      ".cvn-page .demo-banner{margin-top:14px}.cvn-page .emerg-entry{margin-top:10px}.cvn-page .emerg-btn{min-height:78px}.cvn-page .emerg-btn strong{font-size:1.12rem}" +
      ".cvn-page{display:none}.cvn-page.on{display:block}" +
      ".cvn-page .card,.cvn-page .code-section,.cvn-page .sub-tabs,.cvn-page .patient-bar,.cvn-page .section-intro{scroll-margin-top:130px}" +
      ".cvn-wrap{max-width:1280px;margin:0 auto;padding:16px 16px 8px}" +
      ".cvn-h{font-size:1.1rem;font-weight:800;color:#0D1B2D;margin:6px 0 4px}" +
      ".cvn-p{font-size:.85rem;color:#4a5662;margin:0 0 12px;line-height:1.45}" +
      ".cvn-step{display:flex;align-items:center;gap:8px;font-size:.78rem;font-weight:800;color:#0e7490;text-transform:uppercase;letter-spacing:.05em;max-width:1100px;margin:18px auto 0;padding:0 16px}" +
      ".cvn-step b{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#0e7490;color:#fff;font-size:.75rem}" +
      /* Códigos: 4 botones grandes */
      "#cvn-p-codigos .code-nav,.cvn-codes{display:grid!important;grid-template-columns:1fr 1fr;gap:10px;max-width:1100px;margin:16px auto 0;padding:0 16px}" +
      "#cvn-p-codigos .code-nav-btn,.cvn-cbtn{flex:none!important;display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:76px;padding:12px 14px;border-radius:14px;border:2px solid;text-align:left;font-family:inherit;cursor:pointer}" +
      "#cvn-p-codigos .code-nav-btn svg{display:none}" +
      "#cvn-p-codigos .code-nav-btn strong,.cvn-cbtn strong{font-size:1rem;font-weight:800}" +
      "#cvn-p-codigos .code-nav-btn span,.cvn-cbtn span{font-size:.76rem;font-weight:600;opacity:.85}" +
      ".cvn-c-rojo{border-color:#a13544!important;background:#fbeaec!important;color:#a13544!important}" +
      ".cvn-c-azul{border-color:#0284c7!important;background:#e6f4fb!important;color:#075985!important}" +
      ".cvn-c-ambar{border-color:#ca8a04!important;background:#fef7e0!important;color:#854d0e!important}" +
      ".cvn-c-rcp{border-color:#1e3a8a!important;background:#e8edf9!important;color:#1e3a8a!important}" +
      "#cvn-p-codigos .code-nav-btn[aria-selected='true']{box-shadow:0 0 0 3px rgba(13,27,45,.18),0 6px 14px rgba(13,27,45,.15)!important}" +
      "#cvn-p-codigos .code-nav-btn.cvn-c-rojo[aria-selected='true']{background:#a13544!important;color:#fff!important}" +
      "#cvn-p-codigos .code-nav-btn.cvn-c-azul[aria-selected='true']{background:#0284c7!important;color:#fff!important}" +
      "#cvn-p-codigos .code-nav-btn.cvn-c-ambar[aria-selected='true']{background:#ca8a04!important;color:#fff!important}" +
      "#cvn-p-codigos .code-nav-btn.cvn-c-rcp[aria-selected='true']{background:#1e3a8a!important;color:#fff!important}" +
      ".cvn-hide{display:none!important}" +
      /* Parto: secciones siempre visibles + atajos */
      "#cvn-p-parto .code-section{display:block!important}" +
      ".cvn-chips{display:flex;flex-wrap:wrap;gap:6px;max-width:1280px;margin:14px auto 0;padding:0 16px}" +
      ".cvn-chip{border:1.5px solid #00838f;background:#fff;color:#00666f;border-radius:999px;padding:7px 12px;font:700 .78rem/1.1 inherit;font-family:inherit;cursor:pointer}" +
      ".cvn-chip.tr{border-color:#5b3a8e;color:#5b3a8e}" +
      /* Demo: entrada con candado */
      ".cvn-lock-entry .emerg-btn{opacity:.8}" +
      /* Resultado */
      "#cvn-p-resultado .cvn-wrap{max-width:820px}" +
      ".rs-global{border-radius:16px;padding:14px 16px;color:#fff;background:#64748b;margin-bottom:12px;display:flex;align-items:center;gap:12px}" +
      ".rs-global small{display:block;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;opacity:.9;font-weight:700}" +
      ".rs-global strong{display:block;font-size:1.35rem;line-height:1.15}" +
      ".rs-global.n-rojo{background:#c0392b}.rs-global.n-naranja{background:#ea580c}.rs-global.n-amarillo{background:#ca8a04}.rs-global.n-verde{background:#16a34a}" +
      ".rs-global .dot{width:14px;height:14px;border-radius:50%;background:#fff;flex-shrink:0;opacity:.9}" +
      "#cvn-p-resultado .rs-ia{align-items:center;margin:0 0 14px;padding:14px}" +
      "#cvn-p-resultado .rs-ia .mz{width:78px}" +
      "#cvn-p-resultado .rs-ia .tt{font-size:1rem}" +
      "#cvn-p-resultado .rs-ia .bub{font-size:.85rem}" +
      "#cvn-p-resultado .rs-ia .rs-btn.ia{width:100%;padding:13px;font-size:.95rem}" +
      ".rs-acts-h{font-size:.8rem;font-weight:800;color:#0e7490;text-transform:uppercase;letter-spacing:.05em;margin:16px 0 8px}" +
      "@media (min-width:760px){.cvn-tab{flex-direction:row;font-size:.86rem;min-height:46px}#cvn-p-codigos .code-nav,.cvn-codes{grid-template-columns:repeat(4,1fr)}}";
    var s = document.createElement("style"); s.textContent = c; document.head.appendChild(s);
  }

  var paginaActual = "emergencia";
  function mostrar(p, sinScroll) {
    paginaActual = p;
    var nv = document.getElementById("cvn-nav"); if (nv) nv.setAttribute("data-p", p);
    document.querySelectorAll(".cvn-page").forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-p") === p); });
    document.querySelectorAll(".cvn-tab").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-p") === p ? "true" : "false"); });
    if (p === "resultado") abrir();
    if (!sinScroll) window.scrollTo(0, 0);
  }

  function revelar(el) {
    if (!el || !el.closest) return;
    var pg = el.closest(".cvn-page");
    if (pg && !pg.classList.contains("on")) mostrar(pg.getAttribute("data-p"), true);
    var sec = el.closest(".code-section");
    if (sec && sec.id && pg && pg.getAttribute("data-p") === "codigos" && !sec.classList.contains("active")) {
      var b = document.querySelector('.code-nav-btn[aria-controls="' + sec.id + '"]'); if (b) b.click();
    }
    var sp = el.closest(".sub-panel");
    if (sp && sp.id && !sp.classList.contains("active")) {
      var tb = document.getElementById("subtab-" + sp.id.replace(/^sub-/, "")); if (tb) tb.click();
    }
  }

  function div(cls, html) { var d = document.createElement("div"); if (cls) d.className = cls; if (html) d.innerHTML = html; return d; }
  function porTitulo(raiz, re) {
    var r = null;
    (raiz || document).querySelectorAll(".card").forEach(function (c) {
      if (r) return; var h = c.querySelector("h3"); if (h && re.test(t(h))) r = c;
    });
    return r;
  }

  function armarNavegacion() {
    var main = document.querySelector("main");
    var top = document.querySelector("header.topbar");
    if (!main || !top || document.getElementById("cvn-nav")) return;

    /* enlaces de arriba: sin Inicio ni Demo */
    top.querySelectorAll(".topbar-links a").forEach(function (a) {
      var x = t(a);
      if (/^Inicio$/i.test(x) || /Versión Demo/i.test(x)) a.remove();
      if (DEMO && /Versión completa/i.test(x)) { a.textContent = "Activar Full"; }
    });

    /* barra fija: 4 pestañas + Calcular */
    var nav = document.createElement("nav");
    nav.id = "cvn-nav"; nav.setAttribute("aria-label", "Secciones"); nav.setAttribute("data-p", "emergencia");
    nav.innerHTML = '<div class="cvn-in"><div class="cvn-tabs" role="tablist">' +
      PAGINAS.map(function (p) {
        return '<button type="button" class="cvn-tab" role="tab" data-p="' + p[0] + '" aria-selected="' + (p[0] === "emergencia") + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + p[2] + "</svg>" + p[1] + (p[0] === "resultado" ? "<i></i>" : "") + "</button>";
      }).join("") + "</div>" +
      '<button type="button" id="cvn-calc"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>Calcular</button></div>';
    top.parentNode.insertBefore(nav, top.nextSibling);
    nav.addEventListener("click", function (e) {
      var b = e.target.closest(".cvn-tab"); if (b) return mostrar(b.getAttribute("data-p"));
      if (e.target.closest("#cvn-calc")) mostrar("resultado");
    });

    /* páginas */
    var P = {};
    PAGINAS.forEach(function (p) {
      var d = div("cvn-page" + (p[0] === "emergencia" ? " on" : "")); d.id = "cvn-p-" + p[0]; d.setAttribute("data-p", p[0]);
      P[p[0]] = d;
    });
    var cont = div("cvn-pages");
    PAGINAS.forEach(function (p) { cont.appendChild(P[p[0]]); });
    main.insertBefore(cont, main.firstChild);

    var entry = document.querySelector(".emerg-entry");
    var ejBtn = document.querySelector('button[onclick^="mostrarEjemplosEmerg"]');
    var ej = ejBtn ? ejBtn.parentNode : null;
    var bar = document.querySelector(".patient-bar");
    var banner = document.querySelector(".demo-banner");
    var alerta = document.getElementById("alerta-card");

    /* ---- 1. Tengo una emergencia ---- */
    var E = P.emergencia;
    if (!entry && DEMO) {
      entry = div("emerg-entry cvn-lock-entry",
        '<button type="button" class="emerg-btn now" onclick="abrirUpgradeModal()"><strong>Tengo una emergencia ahora 🔒</strong><span>Modo voz manos libres: la app dicta cada paso y avanza con «cumplido». Versión completa.</span></button>' +
        '<button type="button" class="emerg-btn zero" onclick="abrirUpgradeModal()"><strong>Empezar desde cero 🔒</strong><span>Preguntas sí/no que te llevan al código que corresponde. Versión completa.</span></button>');
    }
    E.appendChild(div("cvn-sos", '<div><h2><i></i>¿Tenés una emergencia ahora?</h2>' +
      '<p>Tocá el botón rojo <b>Tengo una emergencia ahora</b>: se activa el modo voz manos libres, la app te dicta cada paso y avanza cuando decís «cumplido».</p>' +
      '<p>Si todavía no sabés qué código corresponde, tocá <b>Empezar desde cero</b>: con preguntas de sí o no te lleva al código correcto.' + (DEMO ? " Las dos opciones están en la versión completa." : "") + "</p></div>"));
    if (entry) E.appendChild(entry);
    if (banner) E.appendChild(banner);
    if (ej) E.appendChild(ej);
    if (bar) {
      E.appendChild(div("cvn-step", "<b>1</b>Signos vitales de la paciente"));
      E.appendChild(bar);
    }
    if (alerta) {
      var w = div("cvn-wrap");
      E.appendChild(div("cvn-step", "<b>2</b>Alerta Obstétrica CaVeSal®"));
      var intro = DEMO ? document.querySelector("main .code-section .section-intro") : null;
      if (intro) w.appendChild(intro);
      w.appendChild(alerta);
      if (DEMO) {
        var dyn = porTitulo(main, /^EAPO dinámica/); if (dyn) w.appendChild(dyn);
        var voz = porTitulo(main, /^Modo voz/); if (voz) w.appendChild(voz);
      } else {
        var s5 = document.getElementById("sub-rojo-5");
        if (s5) {
          var n = div("card", '<p class="cvn-p" style="margin:0">La Escala de Alerta Obstétrica está en la pestaña <b>Tengo una emergencia</b>, debajo de los signos vitales.</p>' +
            '<button type="button" class="cvn-chip" style="margin-top:8px" data-cvn-go="alerta-card">Ir a la Alerta Obstétrica</button>');
          var ref = s5.querySelector(".section-intro");
          s5.insertBefore(n, ref ? ref.nextSibling : s5.firstChild);
        }
      }
      E.appendChild(w);
    }
    E.appendChild(div("cvn-wrap", '<p class="cvn-p" style="text-align:center;margin:4px 0 0">Después elegí el código en <b>Códigos</b> o seguí en <b>Parto y puerperio</b>. Ahí, cuando quieras, tocá <b>Calcular</b> para ver el resultado y la conducta.</p>'));

    /* ---- 2. Códigos ---- */
    var C = P.codigos;
    if (!DEMO) {
      var cn = document.querySelector(".code-nav");
      if (cn) {
        C.appendChild(cn);
        cn.querySelectorAll(".code-nav-btn").forEach(function (b) {
          var k = b.getAttribute("data-code");
          if (CODIGOS[k]) {
            b.classList.add("cvn-c-" + k);
            b.innerHTML = "<strong>" + CODIGOS[k][0] + "</strong><span>" + CODIGOS[k][1] + "</span>";
          } else b.classList.add("cvn-hide");
          b.addEventListener("click", function () {
            if (CODIGOS[k]) { if (paginaActual !== "codigos") mostrar("codigos"); }
            else {
              mostrar("parto", true);
              var sec = document.getElementById("code-" + k);
              setTimeout(function () { if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
            }
          });
        });
      }
      ["rojo", "azul", "ambar", "rcp"].forEach(function (k) { var s = document.getElementById("code-" + k); if (s) C.appendChild(s); });
      var h2 = document.querySelector("#code-azul .section-intro h2");
      if (h2) h2.textContent = h2.textContent.replace(/^Código THAE/, "Código Azul THAE");
    } else {
      var grid = div("cvn-codes");
      C.appendChild(grid);
      var wc = div("cvn-wrap"); C.appendChild(wc);
      var mapa = [
        ["rojo", porTitulo(main, /^Código Rojo/)],
        ["azul", porTitulo(main, /THAE/)],
        ["ambar", porTitulo(main, /^qSOFA/), porTitulo(main, /^Código Amarillo/)],
        ["rcp", porTitulo(main, /^Código Azul Obstétrico/)]
      ];
      mapa.forEach(function (m) {
        var k = m[0], first = null;
        for (var i = 1; i < m.length; i++) if (m[i]) { wc.appendChild(m[i]); if (!first) first = m[i]; }
        var hb = m[2] ? null : (m[1] && m[1].querySelector("h3"));
        if (k === "azul" && hb) hb.textContent = hb.textContent.replace("Código Azul — THAE", "Código Azul THAE");
        var b = document.createElement("button");
        b.type = "button"; b.className = "cvn-cbtn cvn-c-" + k;
        b.innerHTML = "<strong>" + CODIGOS[k][0] + "</strong><span>" + CODIGOS[k][1] + "</span>";
        b.addEventListener("click", function () { if (first) first.scrollIntoView({ behavior: "smooth", block: "start" }); });
        grid.appendChild(b);
      });
    }

    /* ---- 3. Parto y puerperio ---- */
    var R = P.parto;
    var chips = div("cvn-chips"); R.appendChild(chips);
    if (!DEMO) {
      ["parto", "trombo"].forEach(function (k) { var s = document.getElementById("code-" + k); if (s) R.appendChild(s); });
    } else {
      var wp = div("cvn-wrap"); R.appendChild(wp);
      [porTitulo(main, /^Parto/), porTitulo(main, /^Tromboprofilaxis/)].forEach(function (c) { if (c) wp.appendChild(c); });
    }
    R.querySelectorAll(".card").forEach(function (c) {
      var h = c.querySelector(":scope > h3, :scope > .locked-head h3"); if (!h) return;
      var x = t(h).split(" — ")[0].replace(/\s*\(.*$/, "").replace(/🔒.*$/, "").trim();
      if (!x || x.length > 46) x = x.slice(0, 44) + "…";
      var b = document.createElement("button");
      b.type = "button"; b.className = "cvn-chip" + (c.closest("#code-trombo") || /Trombo/i.test(x) ? " tr" : ""); b.textContent = x;
      b.addEventListener("click", function () { c.scrollIntoView({ behavior: "smooth", block: "start" }); });
      chips.appendChild(b);
    });

    /* ---- 4. Resultado ---- */
    P.resultado.appendChild(div("cvn-wrap", ""));

    /* atajos internos y desplazamientos que apuntan a otra pestaña */
    var orig = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function () { try { revelar(this); } catch (e) { } return orig.apply(this, arguments); };
    document.addEventListener("click", function (e) {
      var g = e.target.closest && e.target.closest("[data-cvn-go]");
      if (g) { e.preventDefault(); var el = document.getElementById(g.getAttribute("data-cvn-go")); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    function porHash() {
      var h = (location.hash || "").slice(1); if (!h) return;
      var el = document.getElementById(h); if (el && el.closest(".cvn-page")) setTimeout(function () { el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 350);
    }
    window.addEventListener("hashchange", porHash); porHash();

    /* texto del modal de ejemplos */
    var me2 = document.querySelector("#modal_ejemplos div div:nth-child(2)");
    if (me2 && /scroll/i.test(t(me2))) me2.textContent = "Completa los signos vitales y las escalas con un caso ilustrativo. Al elegirlo vas directo al Resultado.";

    /* punto de color en la pestaña Resultado */
    var dot = nav.querySelector(".cvn-tab[data-p='resultado'] i");
    setInterval(function () {
      if (document.hidden) return;
      var p = recolectar().peor;
      if (p) dot.setAttribute("data-n", p); else dot.removeAttribute("data-n");
    }, 1500);
  }

  /* ================= RESULTADO (en su pestaña) ================= */
  function construirPanel() {
    var host = document.querySelector("#cvn-p-resultado .cvn-wrap");
    if (!host) return;
    var w = document.createElement("div");
    w.id = "cvs-res-in";
    var L = DEMO ? " 🔒" : "";
    w.innerHTML =
      '<h2 class="cvn-h">Resultado y conducta</h2><div id="rs-hora" class="rs-note" style="margin:0 0 10px"></div>' +
      '<div id="rs-global"></div>' +
      '<div class="rs-ia"><span class="mz" role="img" aria-label="Robotita de CaVeSal® IA"></span><div class="bd"><div class="tt">Analizar con CaVeSal® IA</div>' +
      '<p class="bub">¿Querés ir más a fondo? Enviame lo que cargaste y lo repaso con las guías OMS, FIGO, ACOG y MSPBS. Vos decidís; yo te acompaño en cada paso.</p>' +
      '<div class="pv">' + (DEMO ? "Disponible en la versión completa." : "No se envían nombre ni documento.") + "</div></div>" +
      '<button type="button" class="rs-btn ia' + (DEMO ? " rs-lock" : "") + '" data-a="ia">Analizar con CaVeSal® IA' + L + "</button></div>" +
      '<div id="rs-contenido"></div>' +
      '<div class="rs-acts-h">Guardar y exportar</div>' +
      '<div class="rs-card"><h3>Paciente (opcional)</h3><div class="rs-pac">' +
      '<input id="rs-nombre" placeholder="Nombre o iniciales" autocomplete="off"><input id="rs-edad" type="number" inputmode="numeric" placeholder="Edad">' +
      '<textarea id="rs-notas" placeholder="Notas del caso (opcional)"></textarea></div>' +
      '<p class="rs-note">Estos datos quedan solo en este dispositivo y en los archivos que vos exportes. No se envían a CaVeSal® IA.</p></div>' +
      '<div class="rs-acts">' +
      '<button type="button" class="rs-btn main' + (DEMO ? " rs-lock" : "") + '" data-a="json">Guardar caso' + L + "</button>" +
      '<button type="button" class="rs-btn' + (DEMO ? " rs-lock" : "") + '" data-a="abrir">Abrir caso guardado' + L + "</button>" +
      '<button type="button" class="rs-btn' + (DEMO ? " rs-lock" : "") + '" data-a="pdf">Exportar PDF' + L + "</button>" +
      '<button type="button" class="rs-btn' + (DEMO ? " rs-lock" : "") + '" data-a="word">Exportar Word' + L + "</button>" +
      "</div>" +
      (DEMO ? '<p class="rs-demo">Guardar, exportar y analizar con CaVeSal® IA están en la versión completa.</p>' : "") +
      '<input type="file" id="rs-file" accept=".json,application/json" hidden>';
    host.appendChild(w);
    w.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.getAttribute("data-a");
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
  }

  function abrir() {
    if (paginaActual !== "resultado") return mostrar("resultado");
    var d = recolectar();
    $("rs-contenido").innerHTML = htmlResumen(d, false);
    $("rs-hora").textContent = "Calculado: " + hoy();
    var g = $("rs-global");
    if (d.peor) {
      g.innerHTML = '<div class="rs-global n-' + d.peor + '"><span class="dot"></span><div><small>Nivel de alerta más alto</small><strong>' + NOMBRE_NIVEL[d.peor] + "</strong></div></div>";
    } else {
      g.innerHTML = '<div class="rs-global"><span class="dot"></span><div><small>Nivel de alerta</small><strong>Sin resultados todavía</strong></div></div>';
    }
  }
  function cerrar() { }

  /* ---------- guardar / abrir JSON ---------- */
  function claveCampo(e) {
    if ((e.type === "radio" || e.type === "checkbox") && !e.id) return e.name ? e.name + "=" + e.value : null;
    return e.id || null;
  }
  var EXCL = "#cvs-res, #cvs-res-in, #license_gate, #cavesal-legal-overlay, #modal_ejemplos, .voz-overlay";
  function todos() {
    return Array.prototype.filter.call(document.querySelectorAll("input, select, textarea"), function (e) {
      return !e.closest(EXCL) && e.type !== "hidden" && e.type !== "password" && e.type !== "file";
    });
  }
  function campos() {
    var o = {};
    todos().forEach(function (e) {
      if (e.type === "file" || e.type === "password") return;
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
          if (e.type === "file") return;
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
      var w = function () { var r = orig.apply(this, arguments); setTimeout(function () { mostrar("resultado"); }, 700); return r; };
      w.__cvs = true; window[fn] = w;
    });
  }

  function init() {
    injectCSS(); injectNavCSS(); armarNavegacion(); construirPanel(); engancharEjemplos();
    window.cvsAbrirResumen = abrir; window.cvsMostrar = mostrar;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
