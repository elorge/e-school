// web/lib/register-service-worker.ts
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  // Skip in dev — a cached service worker fighting hot-reload is a classic timesink.
  if (process.env.NODE_ENV !== 'production') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}