/* Component Tracker service worker.
   - App shell (same-origin): network-first, so a new deploy is picked up
     immediately when online; falls back to cache when offline.
   - Garmin ride log: network-first (fresh rides when online, cache offline).
   - Cross-origin (fonts): cache-first — they never change. */
const CACHE = 'ct-v2';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const networkFirst = (req) =>
  fetch(req).then((res) => {
    if (res && res.status === 200) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req));

const cacheFirst = (req) =>
  caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res && (res.status === 200 || res.type === 'opaque')) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  }));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  // Same-origin app shell + ride data: network-first. Cross-origin fonts: cache-first.
  e.respondWith(sameOrigin ? networkFirst(req) : cacheFirst(req));
});
