const cacheName = 'TasbeehAppCacheName';
const appShellFiles = [
];

self.addEventListener("install", (event) => {
    console.log("[Service Worker] Install");
    appShellFiles.push('img/icon64.png', 'img/icon128.png', 'img/icon512.png', 'img/grid.svg');
    event.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            await Promise.all(appShellFiles.map((cachableContent) => {
                return cache.add(cachableContent).catch(() => {
                    console.warn(`Failed to cache ${cachableContent}`);
                });
            }));
            // await cache.addAll(appShellFiles);
        })()
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        (async () => {
            const res = await caches.match(event.request);
            console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
            if (res) {
                return res;
            }
            const response = await fetch(event.request);
            const cache = await caches.open(cacheName);
            console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
            cache.put(event.request, response.clone());
            return response;
        })()
    );
});
