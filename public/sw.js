// TukangBaik Service Worker v1
const STATIC_CACHE = 'tukangbaik-static-v1';
const DYNAMIC_CACHE = 'tukangbaik-dynamic-v1';

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll([
          '/',
          '/dashboard',
          '/login',
          '/signup',
        ]).catch(() => {
          // Silently ignore if pages are not available during install
        }),
      )
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, non-http
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Skip external API calls (backend server)
  if (url.hostname !== self.location.hostname) return;

  // Cache-first: Next.js static assets (content-hashed, safe to cache forever)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Network-first: navigation (HTML pages) — fallback to cache if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/dashboard') || caches.match('/')),
        ),
    );
    return;
  }

  // Network-first: everything else
  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  );
});
