const CACHE_NAME = 'planner-cache-v1';

// O que baixar para o celular assim que a pessoa abrir a primeira vez
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Quando o celular pedir um arquivo, entrega do Cache se não tiver internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se achou no cache, entrega o cache. Se não, tenta baixar da rede.
                return response || fetch(event.request);
            })
    );
});
