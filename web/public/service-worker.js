// web/public/service-worker.js
// Deliberately minimal: caches the app SHELL (static assets) so the app
// still loads with no connection. It does NOT cache API responses — your
// offline queues (students, results, CBT attempts) already handle data
// correctly with proper conflict-safety; caching GET API responses here
// too would risk showing stale data as if it were live.

const CACHE_NAME = 'eschools-shell-v1';
const SHELL_ASSETS = ['/', '/manifest.json', '/logo.png', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — always go to network, let the app's own
  // offline-queue logic handle failures.
  if (url.pathname.startsWith('/api') || event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('/'))),
  );
});