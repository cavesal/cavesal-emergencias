/* CaVeSal® Emergencias — registro PWA, aviso de actualización e instalación */
(function () {
  "use strict";
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(function (e) { console.log("SW:", e.message); });
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || document.getElementById("cv-aviso-actualizacion")) return;
      var b = document.createElement("div");
      b.id = "cv-aviso-actualizacion";
      b.setAttribute("role", "status");
      b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:10000;background:#0c4e54;color:#fff;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;font-size:.85rem;box-shadow:0 2px 10px rgba(0,0,0,.25)";
      b.innerHTML = '<span>Hay una actualización lista. Reiniciá la app para aplicarla.</span>' +
        '<button type="button" id="cv-btn-reiniciar" style="background:#fff;color:#0c4e54;border:none;border-radius:20px;padding:6px 14px;font-weight:700;cursor:pointer">Reiniciar ahora</button>' +
        '<button type="button" id="cv-btn-despues" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6);border-radius:20px;padding:6px 14px;cursor:pointer">Más tarde</button>';
      document.body.prepend(b);
      document.getElementById("cv-btn-reiniciar").onclick = function () { location.reload(); };
      document.getElementById("cv-btn-despues").onclick = function () { b.remove(); };
    });
  }

  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var deferred = null, KEY = "cavesal_emerg_install_dismissed";

  function boton() {
    if (standalone || document.getElementById("cv-btn-instalar")) return null;
    try { if (sessionStorage.getItem(KEY)) return null; } catch (e) {}
    var w = document.createElement("div");
    w.id = "cv-btn-instalar";
    w.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9000;display:flex;align-items:center;gap:4px;background:#0c4e54;color:#fff;border-radius:24px;box-shadow:0 4px 14px rgba(0,0,0,.25);font-size:.85rem";
    w.innerHTML = '<button type="button" id="cv-instalar-go" style="background:none;border:none;color:#fff;font-weight:700;padding:10px 6px 10px 16px;cursor:pointer">Instalar app</button>' +
      '<button type="button" id="cv-instalar-x" aria-label="Cerrar" style="background:none;border:none;color:#fff;opacity:.8;padding:10px 14px 10px 6px;cursor:pointer;font-size:1rem">×</button>';
    document.body.appendChild(w);
    document.getElementById("cv-instalar-x").onclick = function () { w.remove(); try { sessionStorage.setItem(KEY, "1"); } catch (e) {} };
    return w;
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e;
    var w = boton(); if (!w) return;
    document.getElementById("cv-instalar-go").onclick = function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; w.remove(); });
    };
  });
  window.addEventListener("appinstalled", function () { var w = document.getElementById("cv-btn-instalar"); if (w) w.remove(); });

  function instruccionesIOS() {
    var o = document.createElement("div");
    o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10001;display:flex;align-items:flex-end;justify-content:center";
    o.innerHTML = '<div role="dialog" aria-modal="true" aria-label="Instalar en iPhone o iPad" style="background:#fff;color:#12302f;border-radius:18px 18px 0 0;padding:22px 20px 28px;width:100%;max-width:480px">' +
      '<h3 style="font-size:1rem;margin:0 0 12px">Instalar CaVeSal Emergencias en iPhone o iPad</h3>' +
      '<ol style="padding-left:20px;line-height:1.9;font-size:.92rem;margin:0">' +
      '<li>Tocá el botón <strong>Compartir</strong> (cuadrado con flecha) de Safari.</li>' +
      '<li>Elegí <strong>Agregar a pantalla de inicio</strong>.</li>' +
      '<li>Tocá <strong>Agregar</strong>.</li></ol>' +
      '<p style="font-size:.8rem;color:#4a6274;margin:12px 0 0">Funciona desde Safari. Una vez instalada, la app abre sin conexión.</p>' +
      '<button type="button" style="width:100%;margin-top:16px;padding:12px;background:#0c4e54;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer">Entendido</button></div>';
    o.addEventListener("click", function (e) { if (e.target === o || e.target.tagName === "BUTTON") o.remove(); });
    document.body.appendChild(o);
  }
  if (esIOS && !standalone) {
    var ini = function () { var w = boton(); if (w) document.getElementById("cv-instalar-go").onclick = instruccionesIOS; };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ini); else ini();
  }
})();
