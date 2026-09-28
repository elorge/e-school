// web/public/service-worker.js

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

  // Only ever consider same-origin GET requests. This app's API calls go
  // to a completely different origin than the frontend itself (see
  // NEXT_PUBLIC_API_URL in lib/api.ts) — a "/api" path-prefix check (the
  // previous approach here) never actually matches a cross-origin URL's
  // pathname, so it silently failed to exclude them. Checking the origin
  // directly excludes every API call regardless of path, while still
  // letting same-origin page navigations fall back to the cached shell
  // ('/') when offline, same as before.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('/'))),
  );
});