const CACHE_NAME = 'levlr-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/dashboard.js',
  '/workout.js',
  '/goals.js',
  '/authService.js',
  // Add other important files
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 