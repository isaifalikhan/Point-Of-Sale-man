/**
 * Placeholder service worker — stops /sw.js 404 when the browser still requests it
 * (e.g. stale registration from another app on localhost:3000).
 * To remove entirely: DevTools → Application → Service workers → Unregister, then delete this file.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
