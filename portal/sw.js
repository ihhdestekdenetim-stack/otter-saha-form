/* OTTER Saha Portalı — Service Worker (çevrimdışı kabuk).
 * Kabuğu (HTML/JS/ikon) + supabase-js CDN'i önbelleğe alır → internet yokken açılır.
 * Supabase REST/Auth istekleri ASLA önbeklenmez (dinamik + kimlik) → doğrudan ağa gider;
 * çevrimdışı yazmalar uygulamadaki localStorage kuyruğuyla yönetilir.
 */
var VERSION = "otter-portal-v1";
var SB_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
var FILES = [
  "./", "index.html",
  "config.js?v=3", "form-schema.js?v=3",
  "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png",
  SB_CDN
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return Promise.all(FILES.map(function (u) {
        return fetch(u, { cache: "reload" }).then(function (r) {
          if (r && (r.ok || r.type === "opaque")) return c.put(u, r);
        }).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf("otter-portal-") === 0 && k !== VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;                       // POST/PATCH (Supabase yazma) → ağa
  var url = new URL(req.url);

  // supabase-js CDN → önce-önbellek (çevrimdışı açılış için)
  if (req.url === SB_CDN || url.hostname === "cdn.jsdelivr.net") {
    e.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (r) {
          var cp = r.clone();
          caches.open(VERSION).then(function (c) { c.put(req, cp); });
          return r;
        }).catch(function () { return hit; });
      })
    );
    return;
  }

  // Yalnız kendi origin'imiz: network-first (3 sn) → önbellek → index.html
  if (url.origin !== self.location.origin) return;        // Supabase API vb. → dokunma (ağ)
  e.respondWith(
    Promise.race([
      fetch(req).then(function (r) {
        var cp = r.clone();
        caches.open(VERSION).then(function (c) { c.put(req, cp); });
        return r;
      }),
      new Promise(function (res) { setTimeout(function () { res(null); }, 3000); })
    ]).then(function (r) {
      if (r) return r;
      return caches.match(req).then(function (hit) {
        return hit || caches.match("index.html");
      });
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("index.html") ||
          new Response("Çevrimdışı", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      });
    })
  );
});
