// ============================================================
// Nom du programme : NEXXAT - Calories Repas (sw.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.0.0
// Date de création : 2026-03-04 12:00:00
// Langage          : JavaScript ES2022 (Service Worker)
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/sw.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.0.0 - 2026-03-04 - Création initiale - Cache offline
// ============================================================

'use strict';

const CACHE_NAME = 'calories-repas-nexxat-v1.0.0';

const ASSETS_A_CACHER = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './js/app.js',
  './js/db.js',
  './js/profil.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap'
];

// Installation : mise en cache des assets
self.addEventListener('install', (e) => {
  console.log('[NEXXAT SW] Installation v1.0.0');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_A_CACHER))
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (e) => {
  console.log('[NEXXAT SW] Activation');
  e.waitUntil(
    caches.keys().then(cles =>
      Promise.all(
        cles.filter(cle => cle !== CACHE_NAME)
            .map(cle => caches.delete(cle))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch : stratégie cache-first
self.addEventListener('fetch', (e) => {
  // Ne pas intercepter les requêtes vers des APIs externes
  if (e.request.url.includes('api.') || e.request.url.includes('fonts.gstatic')) {
    return;
  }

  e.respondWith(
    caches.match(e.request)
      .then(reponseCache => {
        if (reponseCache) return reponseCache;
        return fetch(e.request)
          .then(reponseReseau => {
            if (!reponseReseau || reponseReseau.status !== 200) return reponseReseau;
            const reponseClone = reponseReseau.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, reponseClone));
            return reponseReseau;
          })
          .catch(() => caches.match('./index.html'));
      })
  );
});
