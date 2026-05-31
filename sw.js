const CACHE_NAME = 'masters-v16';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/data/courses.js',
  './js/storage.js',
  './js/scoring.js',
  './js/ui/profile.js',
  './js/ui/home.js',
  './js/ui/history.js',
  './js/ui/players.js',
  './js/ui/stats.js',
  './js/ui/liveRound.js',
  './Logo_GolfApp_Masters.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
