const CACHE_NAME = 'planner-cache-v1.1';

const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './img/Logo_Planner.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se achou no cache, entrega. Se não, busca na rede.
                return response || fetch(event.request);
            })
    );
});
