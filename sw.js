const CACHE_NAME = 'planner-v2.1'; // Alterar para v3, v4 se quiser forçar atualização futura
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './img/Logo_Planner.png'
];

// Instala o Service Worker e armazena os arquivos principais no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('SW: Cacheando arquivos essenciais para funcionamento offline...');
            return cache.addAll(urlsToCache);
        }).then(() => self.skipWaiting()) // Força o SW ativo a tomar o controle imediatamente
    );
});

// Limpa caches antigos quando uma nova versão do Service Worker é ativada
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Removendo cache antigo expirado:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Garante que o SW controle todas as abas abertas imediatamente
    );
});

// Trata as requisições de rede
self.addEventListener('fetch', event => {
    // Ignorar requisições externas de CDN e APIs do Firebase/Google para não atrapalhar o tempo real
    if (
        event.request.url.includes('firebase') || 
        event.request.url.includes('firestore') || 
        event.request.url.includes('googleapis') || 
        event.request.url.includes('esm.sh') || 
        event.request.url.includes('unpkg')
    ) {
        return;
    }

    // Estratégia Network-First: Tenta buscar as coisas novas online. Se falhar (offline), usa o cache local.
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Se a resposta for válida, guarda uma cópia atualizada no cache
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se der erro de rede (offline), recupera do cache
                return caches.match(event.request).then(response => {
                    if (response) {
                        return response;
                    }
                    // Se for uma navegação de página e não achar no cache, abre o index.html inicial
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
