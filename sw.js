/* EPC PLAN – λειτουργία χωρίς internet
   Ανοίγει αμέσως από τη μνήμη του κινητού (χωρίς αναμονή για σήμα)
   και ενημερώνεται στο παρασκήνιο για την επόμενη φορά. */
const CACHE = 'epcplan-v1.3.0';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'app.css',
  'symbols.js', 'render.js', 'db.js', 'export.js', 'detect.js', 'app.js',
  './icon-32.png', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (await c.match('index.html')) || Response.error();
  }));
});
