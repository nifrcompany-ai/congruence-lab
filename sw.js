/* eslint-disable no-restricted-globals */
var CACHE = 'cl-v1';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './favicon.svg',
  './manifest.json',
  './data/constants.js',
  './js/utils.js',
  './js/ui-early.js',
  './js/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = e.request.url;
  if (u.indexOf('http') === 0 && u.indexOf(self.location.origin) !== 0) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return (
        cached ||
        fetch(e.request).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) {
            c.put(e.request, copy);
          });
          return res;
        })
      );
    })
  );
});
