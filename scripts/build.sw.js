/* eslint-disable @typescript-eslint/no-var-requires */
const { statSync, readdirSync, writeFileSync } = require("fs");
const path = require("path");

const template = `const cacheName = 'TasbeehAppCacheName';
const appShellFiles = [];

self.addEventListener("install", (event) => {
    console.log("[Service Worker] Install");
    appShellFiles.push('img/icon64.png', 'img/icon128.png', 'img/icon512.png', 'img/grid.svg');
    event.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            await Promise.all(appShellFiles.map((cachableContent) => {
                return cache.add(cachableContent).catch(() => {
                    console.warn(\`Failed to cache \${cachableContent}\`);
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
            console.log(\`[Service Worker] Fetching resource: \${event.request.url}\`);
            if (res) {
                return res;
            }
            const response = await fetch(event.request);
            const cache = await caches.open(cacheName);
            console.log(\`[Service Worker] Caching new resource: \${event.request.url}\`);
            cache.put(event.request, response.clone());
            return response;
        })()
    );
});
`

const cachableContentFiles = [
    `'/'`,
];

const skipFile = ['/service-worker.sw.js', '/.DS_Store', '/manifest.json'];

function enlistDirFiles(directoryPath, relativePath) {
    readdirSync(directoryPath).forEach((fileName) => {

        const fullPath = path.join(directoryPath, fileName);
        const relPath = `${relativePath}/${fileName}`;

        if (skipFile.includes(relPath)) return;

        const stat = statSync(fullPath);

        if (stat.isDirectory()) enlistDirFiles(fullPath, relPath);
        else if (stat.isFile()) cachableContentFiles.push(`'${relPath}'`);
    })
}

enlistDirFiles(path.join(__dirname, '..', 'dist'), '');

const swContent = template.replace(`const appShellFiles = []`, `const appShellFiles = [${cachableContentFiles.join(', ')}]`);

writeFileSync(
    path.join(__dirname, '..', 'dist', 'service-worker.sw.js'),
    swContent,
    {
        encoding: 'utf8'
    }
);
