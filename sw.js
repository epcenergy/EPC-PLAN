/* EPC PLAN – λειτουργία χωρίς internet
   Με internet: παίρνει ΠΑΝΤΑ τη νεότερη έκδοση από το GitHub (χωρίς παλιά αντίγραφα).
   Χωρίς internet ή με πολύ αργό σήμα (>3,5 δευτ.): ανοίγει από τη μνήμη του κινητού. */
const CACHE = 'epcplan-v1.6.0';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'app.css',
  'symbols.js', 'render.js', 'db.js', 'export.js', 'detect.js', 'app.js',
  './icon-32.png', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];
self.addEventListener('install', e => {
  // cache:'reload' → φρέσκα αρχεία από τον server, όχι από την προσωρινή μνήμη του browser
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(u =>
    fetch(new Request(u, { cache: 'reload' })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => { })
  ))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const net = fetch(req, { cache: 'no-cache' }).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; });
    const timeout = new Promise(res => setTimeout(() => res(null), 3500));
    try {
      const r = await Promise.race([net, timeout]);
      if (r) return r;
    } catch (err) { }
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('index.html') : null);
    if (hit) return hit;
    try { return await net; } catch (err) { return Response.error(); }
  })());
});
