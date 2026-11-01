/* CaVeSal® Emergencias — full. Service worker. Subir CACHE en cada publicación.
   Red primero para páginas y scripts (siempre la versión nueva si hay conexión);
   la copia guardada solo se usa sin internet. */
const CACHE = "cavesal-emerg-full-v24";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll([new Request("./index.html", { cache: "reload" }), new Request("../cvs-resumen.js?v=9", { cache: "reload" })]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("cavesal-emerg-full-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // IA, voz y pagos: siempre red
  const esCodigo = req.mode === "navigate" || /\.(html|js|css|json)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (esCodigo) {
    e.respondWith(
      fetch(req, { cache: "no-cache" }).then(r => {
        if (r && r.status === 200) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); }
        return r;
      }).catch(() => caches.match(req).then(m => m || caches.match(req, { ignoreSearch: true })).then(m => m || caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(r => {
      if (r && r.status === 200) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); }
      return r;
    }))
  );
});
