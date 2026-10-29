/* CaVeSal® Emergencias — service worker. Subir VERSION en cada publicación. */
const VERSION = "cavesal-emerg-v20";
const PRECACHE = [
  "./",
  "./academy-data.js",
  "./academy-data-en.js",
  "./academy-data-pt.js",
  "./academy.js",
  "./acerca.html",
  "./app-alerta-demo.js",
  "./app-alerta.js",
  "./app-coag.js",
  "./app-demo.js",
  "./app-full.js",
  "./bibliografia.html",
  "./demo.html",
  "./full.html",
  "./guia.html",
  "./guia-en.html",
  "./guia-pt.html",
  "./ia-bridge.js",
  "./img/apple-touch-icon.png",
  "./img/cavesal-academy.png",
  "./img/cavesal-emblema.png",
  "./img/cavesal-emergencias.jpg",
  "./img/cavesal-maestro.jpg",
  "./img/ecosistema-profesional.jpg",
  "./img/favicon.png",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/qr-ecosistema.png",
  "./img/qr-mama.png",
  "./img/qr-mujer.png",
  "./index.html",
  "./manifest.json",
  "./manual.html",
  "./manual-en.html",
  "./manual-pt.html",
  "./pwa.js",
  "./sim-data-alerta.js",
  "./sim-data-azul.js",
  "./sim-data-voz.js",
  "./sim-data-parto.js",
  "./sim-data-partograma.js",
  "./sim-data.js",
  "./sim.js",
  "./simulador.html",
  "./styles.css",
  "./voz-data.js",
  "./voz.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => /^cavesal-emerg-v\d+$/.test(k) && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // IA, voz y pagos: siempre red
  if (req.mode === "navigate") {
    // Páginas: red primero (trae cambios), caché si no hay conexión
    e.respondWith(
      fetch(req).then(r => {
        if (r && r.status === 200) { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(req, c)); }
        return r;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(m => m || caches.match("./index.html")))
    );
    return;
  }
  // Recursos: caché primero y actualización en segundo plano
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      const net = fetch(req).then(r => {
        if (r && r.status === 200) { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(req, c)); }
        return r;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
