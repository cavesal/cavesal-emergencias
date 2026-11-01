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
  var SNAP = {};
  function firma(box) { return box.className + "|" + t($(box.id + "-title") || box.querySelector(".result-title")); }
  function tomarSnap(forzar) { document.querySelectorAll(".result-box[id]").forEach(function (b) { if (forzar || !(b.id in SNAP)) SNAP[b.id] = firma(b); }); }
  function cardDe(box) { var c = box.closest(".card"), up; while (c && (up = c.parentElement && c.parentElement.closest(".card"))) c = up; return c; }
  function cuenta(box) {
    var c = cardDe(box);
    if (c && Array.prototype.some.call(c.querySelectorAll("input, select, textarea"), function (e) { return e.type !== "hidden" && cambiado(e); })) return true;
    return (box.id in SNAP) && SNAP[box.id] !== firma(box);
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
      if (!cuenta(box)) return;
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
  var PAC = { nombre: "", edad: "", hc: "", notas: "" };
  function htmlResumen(d, paraExportar) {
    var h = "";
    if (paraExportar) {
      var p = [];
      if (PAC.nombre) p.push("<b>Paciente:</b> " + esc(PAC.nombre));
      if (PAC.edad) p.push("<b>Edad:</b> " + esc(PAC.edad) + " años");
      if (PAC.hc) p.push("<b>HC:</b> " + esc(PAC.hc));
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
    ["resultado", "Resultado", '<path d="M9 4h6v3H9zM7 5H5v16h14V5h-2"/><path d="m9 14 2 2 4-4"/>'],
    ["pacientes", "Pacientes", '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>']
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
      ".cvn-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}" +
      ".cvn-tab{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:56px;padding:6px 2px;border-radius:12px;border:1.5px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#e6f4f6;font:700 .68rem/1.15 inherit;font-family:inherit;text-align:center;cursor:pointer}" +
      ".cvn-tab svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
      ".cvn-tab[aria-selected='true']{background:#fff;color:#0c4e54;border-color:#fff}" +
      ".cvn-tab[data-p='emergencia']{border-color:rgba(255,120,120,.6)}" +
      ".cvn-tab[data-p='emergencia'][aria-selected='true']{color:#a13544}" +
      ".cvn-tab i{position:absolute;top:6px;right:8px;width:10px;height:10px;border-radius:50%;display:none;border:2px solid #fff}" +
      ".cvn-tab i[data-n]{display:block}.cvn-tab i[data-n='rojo']{background:#ef4444}.cvn-tab i[data-n='naranja']{background:#f97316}.cvn-tab i[data-n='amarillo']{background:#eab308}.cvn-tab i[data-n='verde']{background:#22c55e}" +
      "#cvn-calc{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-top:8px;padding:14px;border:2px solid #fde68a;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font:900 1.08rem/1 inherit;font-family:inherit;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 16px rgba(234,88,12,.5);animation:cvnGlow 2.2s ease-in-out infinite}" +
      "#cvn-calc svg{width:20px;height:20px;fill:#fff}" +
      "#cvn-limpiar{display:flex;align-items:center;justify-content:center;gap:6px;margin:7px auto 0;padding:5px 12px;background:transparent;color:rgba(255,255,255,.9);border:1px solid rgba(255,255,255,.4);border-radius:999px;font:600 .72rem/1.2 inherit;font-family:inherit;cursor:pointer}" +
      "#cvn-limpiar svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}" +
      ".rs-vacio{text-align:center}.rs-vacio p{margin:0 0 12px;color:#334155;line-height:1.5}" +
      "#cvn-calc:active{transform:scale(.98)}" +
      "@keyframes cvnGlow{50%{box-shadow:0 4px 24px rgba(245,158,11,.85),0 0 0 3px rgba(253,230,138,.35)}}" +
      "@media (prefers-reduced-motion:reduce){#cvn-calc{animation:none}}" +
      ".cvn-tab .lk{position:absolute;top:4px;right:5px;font-size:.62rem}" +
      "#cvn-nav[data-p='emergencia'] #cvn-calc,#cvn-nav[data-p='resultado'] #cvn-calc,#cvn-nav[data-p='pacientes'] #cvn-calc{display:none}" +
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
      ".rs-ley{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:.74rem;color:#475569;margin:-4px 0 12px}" +
      ".rs-ley span{display:inline-flex;align-items:center;gap:5px;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:3px 9px;font-weight:700;color:#1e293b}" +
      ".rs-ley span i{width:9px;height:9px;border-radius:50%}" +
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
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + p[2] + "</svg>" + p[1] + (p[0] === "resultado" ? "<i></i>" : "") + (p[0] === "pacientes" && DEMO ? '<span class="lk" aria-label="Versión completa">🔒</span>' : "") + "</button>";
      }).join("") + "</div>" +
      '<button type="button" id="cvn-calc"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>Calcular</button>' +
      '<button type="button" id="cvn-limpiar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>Limpiar todos los campos</button></div>';
    top.parentNode.insertBefore(nav, top.nextSibling);
    nav.addEventListener("click", function (e) {
      var b = e.target.closest(".cvn-tab"); if (b) return mostrar(b.getAttribute("data-p"));
      if (e.target.closest("#cvn-calc")) mostrar("resultado");
      if (e.target.closest("#cvn-limpiar")) nuevaConsulta();
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
    P.pacientes.appendChild(div("cvn-wrap", ""));

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
      var p = hayDatos() ? recolectar().peor : null;
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
      '<div class="rs-card" id="rs-paccard"></div>' +
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
      var pa = e.target.closest("[data-pa]");
      if (pa) { if (pa.getAttribute("data-pa") === "guardar") { if (!hayDatos()) return alert("No tenés datos cargados. Cargá los datos y apretá Calcular."); guardarEnFicha(); } else mostrar("pacientes"); return; }
      var ir = e.target.closest("[data-ir]"); if (ir) return mostrar(ir.getAttribute("data-ir"));
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (DEMO) return upgrade();
      if (a !== "abrir" && !hayDatos()) return alert("No tenés datos cargados. Cargá los datos y apretá Calcular.");
      if (a === "ia") { if (typeof window.analizarConCavesalIA === "function") window.analizarConCavesalIA(); return; }
      if (a === "json") return guardarJSON();
      if (a === "abrir") return $("rs-file").click();
      if (a === "pdf") return exportarPDF();
      if (a === "word") return exportarWord();
    });
    $("rs-file").addEventListener("change", abrirJSON);
  }

var LEYENDA = '<div class="rs-ley">Clasificación según gravedad: <span><i style="background:#16a34a"></i>Verde</span><span><i style="background:#ca8a04"></i>Amarillo</span><span><i style="background:#ea580c"></i>Naranja</span><span><i style="background:#c0392b"></i>Rojo</span></div>';
  function abrir() {
    if (paginaActual !== "resultado") return mostrar("resultado");
    if (!hayDatos()) {
      $("rs-hora").textContent = "";
      $("rs-global").innerHTML = '<div class="rs-global"><span class="dot"></span><div><small>Resultado</small><strong>No tenés datos cargados</strong></div></div>' + LEYENDA;
      $("rs-contenido").innerHTML = '<div class="rs-card rs-vacio"><p>Cargá los datos en <b>Códigos</b> o en <b>Parto y puerperio</b> y apretá <b>Calcular</b>. Acá vas a ver el resultado y la conducta.</p><button type="button" class="rs-btn main" data-ir="codigos">Ir a Códigos</button></div>';
      return;
    }
    var d = recolectar();
    $("rs-contenido").innerHTML = htmlResumen(d, false);
    $("rs-hora").textContent = "Calculado: " + hoy();
    var g = $("rs-global");
    if (d.peor) {
      g.innerHTML = '<div class="rs-global n-' + d.peor + '"><span class="dot"></span><div><small>Nivel de alerta más alto · resumen de diagnóstico y conducta</small><strong>' + NOMBRE_NIVEL[d.peor] + "</strong></div></div>" + LEYENDA;
    } else {
      g.innerHTML = '<div class="rs-global"><span class="dot"></span><div><small>Nivel de alerta</small><strong>Sin resultados todavía</strong></div></div>' + LEYENDA;
    }
  }
  function cerrar() { }

  /* ---------- guardar / abrir JSON ---------- */
  function claveCampo(e) {
    if ((e.type === "radio" || e.type === "checkbox") && !e.id) return e.name ? e.name + "=" + e.value : null;
    return e.id || null;
  }
  var EXCL = "#cvs-res, #cvs-res-in, #cvn-p-pacientes, #license_gate, #cavesal-legal-overlay, #modal_ejemplos, .voz-overlay";
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
        restaurar(data.campos);
        PAC = { nombre: (data.paciente && data.paciente.nombre) || "", edad: (data.paciente && data.paciente.edad) || "", hc: (data.paciente && data.paciente.hc) || "", notas: (data.paciente && data.paciente.notas) || "" };
        setTimeout(abrir, 400);
      } catch (e) {
        alert("Ese archivo no es un caso guardado de CaVeSal® Emergencias.");
      }
      ev.target.value = "";
    };
    r.readAsText(f);
  }
  function cambiado(e) {
    if (e.type === "time") return false;
    if (e.type === "radio" || e.type === "checkbox") return e.checked !== e.defaultChecked;
    if (e.tagName === "SELECT") {
      var def = 0;
      for (var i = 0; i < e.options.length; i++) if (e.options[i].defaultSelected) { def = i; break; }
      return e.options.length > 0 && e.selectedIndex !== def;
    }
    return e.value !== e.defaultValue;
  }
  function hayDatos() { return todos().some(cambiado); }
  var CLAVES_FORM = ["cavesal_alerta_monitor_v1", "cavesal_pg_v1", "cavesal_alu_v1", "cavesal_pp_v1", "cvs-rcp-v1", "cavesal_tocol_v1", "cavesal_mgso4_mon_v1", "cavesal_contr_v1", "cavesal_em_robson_din"];
  function nuevaConsulta() {
    if (!confirm("¿Limpiar todos los campos? Se borran los datos cargados en pantalla y se suelta la paciente elegida. Las fichas de pacientes no se tocan.")) return;
    todos().forEach(function (e) {
      if (e.type === "radio" || e.type === "checkbox") e.checked = e.defaultChecked;
      else if (e.tagName === "SELECT") Array.prototype.forEach.call(e.options, function (o) { o.selected = o.defaultSelected; });
      else e.value = e.defaultValue;
    });
    try { CLAVES_FORM.forEach(function (k) { localStorage.removeItem(k); }); localStorage.removeItem(PA); } catch (er) { }
    location.replace(location.pathname);
  }
  function restaurar(c) {
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
  }

  /* ---------- exportar ---------- */
  function documentoHTML() {
    var d = recolectar();
    return '<h1>CaVeSal® Emergencias Obstétricas — Resumen y conducta</h1>' +
      '<div class="sub">Generado: ' + esc(hoy()) + " · cavesal.app</div>" +
      htmlResumen(d, true) + LEGAL;
  }
  var LEGAL = '<p style="font-size:8.5pt;color:#555;margin-top:14px">Herramienta de apoyo a la decisión clínica para profesionales de la salud. No reemplaza el juicio clínico ni las guías oficiales. Algoritmos propios CaVeSal® basados en las fuentes citadas en la app.</p>';
  function salida(html, tipo, nombre) {
    if (tipo === "pdf") {
      var p = $("cvs-print");
      if (!p) { p = document.createElement("div"); p.id = "cvs-print"; document.body.appendChild(p); }
      p.innerHTML = html;
      document.body.classList.add("cvs-printing");
      var fin = function () { document.body.classList.remove("cvs-printing"); window.removeEventListener("afterprint", fin); };
      window.addEventListener("afterprint", fin);
      setTimeout(function () { window.print(); setTimeout(fin, 1500); }, 60);
      return;
    }
    var estilos = css.replace(/@media print\{[^}]*\}[^}]*\}/, "");
    var doc = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>CaVeSal Emergencias</title><style>body{font-family:Arial,sans-serif;font-size:11pt}' + estilos + "</style></head><body>" + html + "</body></html>";
    descargar(nombre + ".doc", "application/msword", "\ufeff" + doc);
  }
  function exportarPDF() { salida(documentoHTML(), "pdf", base()); }
  function exportarWord() { salida(documentoHTML(), "word", base()); }

  /* ================= PACIENTES (pestaña propia) ================= */
  var PK = "cavesal_em_pacientes", PA = "cavesal_em_pac_actual";
  function getPacs() { try { return JSON.parse(localStorage.getItem(PK) || "[]") || []; } catch (e) { return []; } }
  function savePacs(a) { try { localStorage.setItem(PK, JSON.stringify(a)); } catch (e) { alert("No se pudo guardar en este dispositivo (memoria llena)."); } }
  function pacActual() { var id = localStorage.getItem(PA); if (!id) return null; return getPacs().filter(function (p) { return p.id === id; })[0] || null; }
  function setActual(id) {
    if (id) localStorage.setItem(PA, id); else localStorage.removeItem(PA);
    var p = pacActual();
    PAC = p ? { nombre: p.nombre || "", edad: p.edad || "", hc: p.hc || "", notas: p.notas || "" } : { nombre: "", edad: "", hc: "", notas: "" };
    renderPacResultado(); renderPacientes();
  }
  function nid() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function fFecha(iso) { var d = new Date(iso); return d.toLocaleDateString("es-PY") + " " + d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" }); }
  var DOT = { rojo: "#dc2626", naranja: "#ea580c", amarillo: "#ca8a04", verde: "#16a34a" };

  function cssPac() {
    var c = "" +
      ".pc-top{display:flex;gap:8px;margin-bottom:10px}.pc-top input{flex:1;min-width:0;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;font:inherit;font-size:.88rem}" +
      ".pc-form{display:grid;grid-template-columns:1fr 90px;gap:8px}.pc-form input,.pc-form textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:9px;padding:9px 10px;font:inherit;font-size:.86rem}" +
      ".pc-form .full{grid-column:1/-1}.pc-form textarea{min-height:54px;resize:vertical}" +
      ".pc-item{background:#fff;border:1px solid #d7e6ea;border-radius:14px;padding:12px 14px;margin-bottom:10px}" +
      ".pc-item.act{border:2px solid #0e7490;box-shadow:0 2px 10px rgba(14,116,144,.15)}" +
      ".pc-n{font-weight:800;font-size:.98rem;color:#0D1B2D;display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".pc-badge{font-size:.66rem;font-weight:800;background:#0e7490;color:#fff;border-radius:999px;padding:3px 8px;text-transform:uppercase;letter-spacing:.04em}" +
      ".pc-m{font-size:.78rem;color:#64748b;margin:2px 0 8px}" +
      ".pc-b{display:flex;flex-wrap:wrap;gap:6px}.pc-b button{border:1.5px solid #0e7490;background:#fff;color:#0b3c5d;border-radius:9px;padding:7px 10px;font:700 .76rem/1 inherit;font-family:inherit;cursor:pointer}" +
      ".pc-b button.main{background:#0e7490;color:#fff}.pc-b button.del{border-color:#dc2626;color:#b91c1c}" +
      ".pc-casos{margin-top:10px;border-top:1px dashed #cbd5e1;padding-top:8px}" +
      ".pc-caso{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:.8rem}" +
      ".pc-caso i{width:10px;height:10px;border-radius:50%;background:#94a3b8;flex-shrink:0}.pc-caso span{flex:1;min-width:120px}" +
      ".pc-caso button{border:1px solid #cbd5e1;background:#f8fafc;border-radius:8px;padding:5px 8px;font:700 .72rem/1 inherit;font-family:inherit;cursor:pointer;color:#0b3c5d}" +
      ".pc-empty{text-align:center;color:#64748b;font-size:.86rem;padding:18px}" +
      ".pc-lock{text-align:center;padding:26px 18px;cursor:pointer}.pc-lock .ic{font-size:2.4rem;margin-bottom:8px}" +
      ".pc-lock h3{font-size:1rem;margin:0 0 10px;color:#0D1B2D}.pc-lock .it{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:14px}" +
      ".pc-lock .it span{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:5px 10px;font-size:.76rem;font-weight:700;color:#475569}" +
      ".pc-ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:10px;padding:8px 12px;font-size:.82rem;font-weight:700;margin-top:8px}" +
      ".rs-pacline{font-size:.9rem;color:#0D1B2D}.rs-pacline b{font-weight:800}";
    var s = document.createElement("style"); s.textContent = c; document.head.appendChild(s);
  }

  function construirPacientes() {
    var host = document.querySelector("#cvn-p-pacientes .cvn-wrap"); if (!host) return;
    if (DEMO) {
      host.innerHTML = '<div class="rs-card pc-lock" data-up="1"><div class="ic">🔒</div><h3>Sistema de pacientes</h3>' +
        '<div class="it"><span>Fichas de pacientes</span><span>Casos guardados</span><span>PDF y Word</span><span>Backup .json</span></div>' +
        '<p class="cvn-p">Guardá cada emergencia en la ficha de la paciente, volvé a abrirla y exportala. Disponible en la versión completa.</p>' +
        '<button type="button" class="rs-btn ia" style="width:100%;background:linear-gradient(135deg,#0D1B2D,#0EA5B7)">Adquirí tu versión completa</button></div>';
      host.querySelector("[data-up]").addEventListener("click", upgrade);
      return;
    }
    host.innerHTML = '<h2 class="cvn-h">Mis pacientes</h2><p class="cvn-p">Elegí la paciente de esta emergencia o creá una nueva. Los casos se guardan en su ficha, solo en este dispositivo.</p>' +
      '<div class="pc-top"><input id="pc-buscar" placeholder="Buscar por nombre o HC" autocomplete="off"><button type="button" class="rs-btn main" id="pc-nueva" style="background:#0e7490;color:#fff">+ Nueva</button></div>' +
      '<div class="rs-card" id="pc-form" hidden><h3 id="pc-form-t">Nueva paciente</h3><div class="pc-form">' +
      '<input id="pc-nombre" placeholder="Nombre o iniciales" autocomplete="off"><input id="pc-edad" type="number" inputmode="numeric" placeholder="Edad">' +
      '<input id="pc-hc" class="full" placeholder="N.º de HC o documento (opcional)" autocomplete="off">' +
      '<textarea id="pc-notas" class="full" placeholder="Notas (opcional)"></textarea></div>' +
      '<div class="pc-b" style="margin-top:10px"><button type="button" class="main" id="pc-guardar">Guardar y usar en esta emergencia</button><button type="button" id="pc-cancelar">Cancelar</button></div></div>' +
      '<div id="pc-lista"></div>' +
      '<div class="rs-acts" style="margin-top:12px"><button type="button" class="rs-btn" id="pc-backup">Descargar backup (.json)</button><button type="button" class="rs-btn" id="pc-import">Importar backup</button></div>' +
      '<input type="file" id="pc-file" accept=".json,application/json" hidden>' +
      '<p class="rs-note">Los datos de la paciente no se envían a CaVeSal® IA. Descargá el backup periódicamente para no perderlos y usarlos en otro equipo.</p>';
    var editId = null;
    function abrirForm(p) {
      editId = p ? p.id : null;
      $("pc-form-t").textContent = p ? "Editar paciente" : "Nueva paciente";
      $("pc-nombre").value = p ? p.nombre || "" : ""; $("pc-edad").value = p ? p.edad || "" : "";
      $("pc-hc").value = p ? p.hc || "" : ""; $("pc-notas").value = p ? p.notas || "" : "";
      $("pc-form").hidden = false; $("pc-nombre").focus();
    }
    $("pc-nueva").addEventListener("click", function () { abrirForm(null); });
    $("pc-cancelar").addEventListener("click", function () { $("pc-form").hidden = true; });
    $("pc-guardar").addEventListener("click", function () {
      var n = $("pc-nombre").value.trim(); if (!n) { $("pc-nombre").focus(); return; }
      var a = getPacs(), p;
      if (editId) p = a.filter(function (x) { return x.id === editId; })[0];
      if (!p) { p = { id: nid(), creada: new Date().toISOString(), casos: [] }; a.unshift(p); }
      p.nombre = n; p.edad = $("pc-edad").value.trim(); p.hc = $("pc-hc").value.trim(); p.notas = $("pc-notas").value.trim();
      savePacs(a); $("pc-form").hidden = true; setActual(p.id);
    });
    $("pc-buscar").addEventListener("input", renderPacientes);
    $("pc-backup").addEventListener("click", function () {
      descargar("CaVeSal-Emergencias_pacientes_" + base().split("_").pop() + ".json", "application/json", JSON.stringify({ app: "cavesal-emergencias-pacientes", version: 1, fecha: new Date().toISOString(), pacientes: getPacs() }, null, 2));
    });
    $("pc-import").addEventListener("click", function () { $("pc-file").click(); });
    $("pc-file").addEventListener("change", function (ev) {
      var f = ev.target.files && ev.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result); if (!d || d.app !== "cavesal-emergencias-pacientes" || !Array.isArray(d.pacientes)) throw 0;
          var a = getPacs(), ids = {}; a.forEach(function (p) { ids[p.id] = p; });
          d.pacientes.forEach(function (p) { if (!p || !p.id) return; if (ids[p.id]) { var cs = {}; (ids[p.id].casos || []).forEach(function (c) { cs[c.id] = 1; }); (p.casos || []).forEach(function (c) { if (!cs[c.id]) ids[p.id].casos.push(c); }); } else a.push(p); });
          savePacs(a); renderPacientes(); alert("Backup importado: " + d.pacientes.length + " paciente(s).");
        } catch (e) { alert("Ese archivo no es un backup de pacientes de CaVeSal® Emergencias."); }
        ev.target.value = "";
      };
      r.readAsText(f);
    });
    $("pc-lista").addEventListener("click", function (e) {
      var b = e.target.closest("[data-pc]"); if (!b) return;
      var acc = b.getAttribute("data-pc"), pid = b.getAttribute("data-id"), cid = b.getAttribute("data-c");
      var a = getPacs(), p = a.filter(function (x) { return x.id === pid; })[0]; if (!p) return;
      if (acc === "usar") { setActual(pid); mostrar("emergencia"); return; }
      if (acc === "quitar") { setActual(null); return; }
      if (acc === "editar") { abrirForm(p); window.scrollTo(0, 0); return; }
      if (acc === "ver") { b.closest(".pc-item").querySelector(".pc-casos").hidden ^= true; return; }
      if (acc === "borrar") {
        if (!confirm("¿Borrar la ficha de " + p.nombre + " y todos sus casos?")) return;
        savePacs(a.filter(function (x) { return x.id !== pid; })); if (localStorage.getItem(PA) === pid) setActual(null); else renderPacientes(); return;
      }
      if (acc === "ppdf" || acc === "pword") {
        if (!(p.casos || []).length) return alert("Esta paciente todavía no tiene casos guardados. Calculá una emergencia y tocá «Guardar en su ficha» en Resultado.");
        salida(docPaciente(p), acc === "ppdf" ? "pdf" : "word", "CaVeSal-Emergencias_" + (p.nombre || "paciente").replace(/[^\wáéíóúñÁÉÍÓÚÑ]+/g, "-").slice(0, 30) + "_resumen");
        return;
      }
      var c = (p.casos || []).filter(function (x) { return x.id === cid; })[0]; if (!c) return;
      if (acc === "abrir") { setActual(pid); restaurar(c.campos || {}); setTimeout(function () { mostrar("resultado"); }, 400); return; }
      if (acc === "pdf" || acc === "word") { salida(docCaso(p, c), acc, "CaVeSal-Emergencias_" + (p.nombre || "caso").replace(/[^\wáéíóúñÁÉÍÓÚÑ]+/g, "-").slice(0, 30) + "_" + c.fecha.slice(0, 10)); return; }
      if (acc === "bcaso") { if (!confirm("¿Borrar este caso?")) return; p.casos = p.casos.filter(function (x) { return x.id !== cid; }); savePacs(a); renderPacientes(); }
    });
    renderPacientes();
  }

  function renderPacientes() {
    var L = $("pc-lista"); if (!L) return;
    var q = ($("pc-buscar") && $("pc-buscar").value || "").toLowerCase().trim();
    var act = localStorage.getItem(PA);
    var a = getPacs().filter(function (p) { return !q || (p.nombre || "").toLowerCase().indexOf(q) >= 0 || (p.hc || "").toLowerCase().indexOf(q) >= 0; });
    if (!a.length) { L.innerHTML = '<div class="pc-empty">' + (q ? "No hay pacientes con ese nombre." : "Todavía no hay pacientes. Tocá «+ Nueva» para crear la primera.") + "</div>"; return; }
    L.innerHTML = a.map(function (p) {
      var cs = (p.casos || []).slice().sort(function (x, y) { return x.fecha < y.fecha ? 1 : -1; });
      var es = p.id === act;
      return '<div class="pc-item' + (es ? " act" : "") + '"><div class="pc-n">' + esc(p.nombre) + (es ? '<span class="pc-badge">En esta emergencia</span>' : "") + "</div>" +
        '<div class="pc-m">' + [p.edad ? esc(p.edad) + " años" : "", p.hc ? "HC " + esc(p.hc) : "", cs.length + (cs.length === 1 ? " caso guardado" : " casos guardados")].filter(Boolean).join(" · ") + "</div>" +
        '<div class="pc-b">' + (es ? '<button type="button" data-pc="quitar" data-id="' + p.id + '">Quitar de esta emergencia</button>' : '<button type="button" class="main" data-pc="usar" data-id="' + p.id + '">Usar en esta emergencia</button>') +
        '<button type="button" data-pc="ver" data-id="' + p.id + '">Casos (' + cs.length + ")</button>" +
        '<button type="button" data-pc="ppdf" data-id="' + p.id + '">PDF</button><button type="button" data-pc="pword" data-id="' + p.id + '">Word</button>' +
        '<button type="button" data-pc="editar" data-id="' + p.id + '">Editar</button><button type="button" class="del" data-pc="borrar" data-id="' + p.id + '">Borrar</button></div>' +
        '<div class="pc-casos" hidden>' + (cs.length ? cs.map(function (c) {
          return '<div class="pc-caso"><i style="background:' + (DOT[c.peor] || "#94a3b8") + '"></i><span>' + esc(fFecha(c.fecha)) + (c.peor ? " · nivel " + esc(NOMBRE_NIVEL[c.peor]) : "") + "</span>" +
            '<button type="button" data-pc="abrir" data-id="' + p.id + '" data-c="' + c.id + '">Abrir</button><button type="button" data-pc="pdf" data-id="' + p.id + '" data-c="' + c.id + '">PDF</button>' +
            '<button type="button" data-pc="word" data-id="' + p.id + '" data-c="' + c.id + '">Word</button><button type="button" data-pc="bcaso" data-id="' + p.id + '" data-c="' + c.id + '">Borrar</button></div>';
        }).join("") : '<div class="pc-empty" style="padding:8px">Sin casos. En Resultado tocá «Guardar en su ficha».</div>') + "</div></div>";
    }).join("");
  }

  function renderPacResultado() {
    var c = $("rs-paccard"); if (!c) return;
    if (DEMO) {
      c.innerHTML = '<h3>Paciente 🔒</h3><p class="rs-note" style="margin:0">El sistema de pacientes (fichas y casos guardados) está en la versión completa.</p>';
      c.style.cursor = "pointer"; c.onclick = upgrade; return;
    }
    var p = pacActual();
    c.innerHTML = p
      ? '<h3>Paciente</h3><div class="rs-pacline"><b>' + esc(p.nombre) + "</b>" + (p.edad ? " · " + esc(p.edad) + " años" : "") + (p.hc ? " · HC " + esc(p.hc) : "") + "</div>" +
        '<div class="pc-b" style="margin-top:8px"><button type="button" class="main" data-pa="guardar">Guardar en su ficha</button><button type="button" data-pa="ir">Cambiar paciente</button></div><div id="rs-pacok"></div>'
      : '<h3>Paciente</h3><p class="rs-note" style="margin:0 0 8px">Sin paciente asignada. Elegila o creala en la pestaña Pacientes para guardar el caso en su ficha.</p>' +
        '<div class="pc-b"><button type="button" class="main" data-pa="ir">Ir a Pacientes</button></div>';
  }

  function guardarEnFicha() {
    var a = getPacs(), id = localStorage.getItem(PA), p = a.filter(function (x) { return x.id === id; })[0];
    if (!p) return mostrar("pacientes");
    var d = recolectar();
    (p.casos = p.casos || []).push({ id: nid(), fecha: new Date().toISOString(), peor: d.peor, campos: campos(), html: htmlResumen(d, false) });
    savePacs(a); renderPacientes();
    var ok = $("rs-pacok"); if (ok) ok.innerHTML = '<div class="pc-ok">Caso guardado en la ficha de ' + esc(p.nombre) + " (" + esc(hoy()) + ").</div>";
  }

  function docPaciente(p) {
    var dp = [];
    dp.push("<b>Paciente:</b> " + esc(p.nombre)); if (p.edad) dp.push("<b>Edad:</b> " + esc(p.edad) + " años"); if (p.hc) dp.push("<b>HC:</b> " + esc(p.hc));
    var cs = (p.casos || []).slice().sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
    var h = '<h1>CaVeSal® Emergencias Obstétricas — Resumen de la paciente</h1><div class="sub">Exportado ' + esc(hoy()) + " · cavesal.app</div>" +
      '<div class="rs-card"><h3>Datos de la paciente</h3><div>' + dp.join(" · ") + "</div>" + (p.notas ? '<div style="margin-top:6px"><b>Notas:</b> ' + esc(p.notas) + "</div>" : "") +
      '<div style="margin-top:6px"><b>Casos guardados:</b> ' + cs.length + "</div></div>";
    cs.forEach(function (c, i) {
      h += '<h2 style="font-size:13pt;color:#0e7490;margin:16px 0 6px;border-bottom:1px solid #cbd5e1;padding-bottom:3px">' + (i === 0 ? "Último caso" : "Caso") + " · " + esc(fFecha(c.fecha)) + (c.peor ? " · nivel " + esc(NOMBRE_NIVEL[c.peor]) : "") + "</h2>" + (c.html || "");
    });
    return h + LEGAL;
  }
  function docCaso(p, c) {
    var dp = [];
    dp.push("<b>Paciente:</b> " + esc(p.nombre)); if (p.edad) dp.push("<b>Edad:</b> " + esc(p.edad) + " años"); if (p.hc) dp.push("<b>HC:</b> " + esc(p.hc));
    return '<h1>CaVeSal® Emergencias Obstétricas — Resumen y conducta</h1><div class="sub">Caso del ' + esc(fFecha(c.fecha)) + " · exportado " + esc(hoy()) + " · cavesal.app</div>" +
      '<div class="rs-card"><h3>Datos de la paciente</h3><div>' + dp.join(" · ") + "</div>" + (p.notas ? '<div style="margin-top:6px"><b>Notas:</b> ' + esc(p.notas) + "</div>" : "") + "</div>" +
      (c.html || "") + LEGAL;
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
    injectCSS(); injectNavCSS(); cssPac(); armarNavegacion(); construirPanel(); construirPacientes(); engancharEjemplos();
    tomarSnap(); setTimeout(function () { if (!hayDatos()) tomarSnap(true); }, 1500);
    setActual(DEMO ? null : localStorage.getItem(PA));
    window.cvsAbrirResumen = abrir; window.cvsMostrar = mostrar;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
