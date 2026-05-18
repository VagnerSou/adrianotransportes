const CACHE = 'mobi-v1';

const arquivos = [
    '/',
    '/passageiro.html',
    '/motorista.html',
    '/manifest.json'
];

self.addEventListener('install', e => {

    e.waitUntil(

        caches.open(CACHE)
        .then(cache => cache.addAll(arquivos))

    );

});

self.addEventListener('fetch', e => {

    e.respondWith(

        caches.match(e.request)
        .then(res => res || fetch(e.request))

    );

});