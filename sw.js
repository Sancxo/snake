let cacheName = "snake-game-page";
let filesToCache = [
    '/snake/',
    '/snake/index.html',
    '/snake/style.css',
    '/snake/script.js'
];

self.addEventListener('install', e => {
    // console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            // console.log('[Service Worker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request, {ignoreSearch: true})
        .then(response => {
            return response || fetch(e.request);
        })
    );
});