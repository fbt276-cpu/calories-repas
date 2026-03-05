// ============================================================
// Nom du programme : NEXXAT - Calories Repas (db.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.3.0
// Date de création : 2026-03-04 14:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/db.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.3.0 - 2026-03-04 - Ajout store hydratation
// v1.1.0 - 2026-03-04 - Ajout store activites (podomètre)
// v1.0.0 - 2026-03-04 - Création initiale - Gestion IndexedDB
// ============================================================

'use strict';

const NEXXAT_DB = {
  name:    'nexxat_calories_repas',
  version: 3,           // ← incrémenté pour migration
  stores: {
    profils:   'profils',
    poids:     'poids',
    repas:     'repas',
    aliments:  'aliments',
    activites: 'activites',
    hydratation: 'hydratation',
  }
};

let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NEXXAT_DB.name, NEXXAT_DB.version);

    request.onupgradeneeded = (e) => {
      const database   = e.target.result;
      const oldVersion = e.oldVersion;

      // ── Store profils ───────────────────────────────────
      if (!database.objectStoreNames.contains('profils')) {
        const s = database.createObjectStore('profils', { keyPath: 'id', autoIncrement: true });
        s.createIndex('actif', 'actif', { unique: false });
      }

      // ── Store poids ─────────────────────────────────────
      if (!database.objectStoreNames.contains('poids')) {
        const s = database.createObjectStore('poids', { keyPath: 'id', autoIncrement: true });
        s.createIndex('profilId', 'profilId', { unique: false });
        s.createIndex('date',     'date',     { unique: false });
        s.createIndex('dateJour', 'dateJour', { unique: false });
      }

      // ── Store repas ─────────────────────────────────────
      if (!database.objectStoreNames.contains('repas')) {
        const s = database.createObjectStore('repas', { keyPath: 'id', autoIncrement: true });
        s.createIndex('profilId', 'profilId', { unique: false });
        s.createIndex('date',     'date',     { unique: false });
      }

      // ── Store aliments ──────────────────────────────────
      if (!database.objectStoreNames.contains('aliments')) {
        const s = database.createObjectStore('aliments', { keyPath: 'id', autoIncrement: true });
        s.createIndex('nom', 'nom', { unique: false });
      }

      // ── Store hydratation (v1.3.0) ──────────────────────
      if (!database.objectStoreNames.contains('hydratation')) {
        const s = database.createObjectStore('hydratation', { keyPath: 'id', autoIncrement: true });
        s.createIndex('profilId', 'profilId', { unique: false });
        s.createIndex('dateJour', 'dateJour', { unique: false });
      }

      // ── Store activites (v1.1.0) ────────────────────────
      if (!database.objectStoreNames.contains('activites')) {
        const s = database.createObjectStore('activites', { keyPath: 'id', autoIncrement: true });
        s.createIndex('profilId', 'profilId', { unique: false });
        s.createIndex('dateJour', 'dateJour', { unique: false });
        s.createIndex('type',     'type',     { unique: false });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      console.log('[NEXXAT] IndexedDB v2 initialisée.');
      resolve(db);
    };

    request.onerror = (e) => {
      console.error('[NEXXAT] Erreur IndexedDB :', e.target.error);
      reject(e.target.error);
    };
  });
}

function dbAdd(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.add(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbPut(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbGetAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbGet(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbDelete(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

function dbGetByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const req = index.getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
