// ============================================================
// Nom du programme : NEXXAT - Calories Repas (db.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.0.0
// Date de création : 2026-03-04 12:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/db.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.0.0 - 2026-03-04 - Création initiale - Gestion IndexedDB
// ============================================================

'use strict';

const NEXXAT_DB = {
  name: 'nexxat_calories_repas',
  version: 1,
  stores: {
    profils:   'profils',
    poids:     'poids',
    repas:     'repas',
    aliments:  'aliments',
  }
};

let db = null;

/**
 * Initialise la base de données IndexedDB
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NEXXAT_DB.name, NEXXAT_DB.version);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;

      // Store profils
      if (!database.objectStoreNames.contains(NEXXAT_DB.stores.profils)) {
        const profilStore = database.createObjectStore(NEXXAT_DB.stores.profils, { keyPath: 'id', autoIncrement: true });
        profilStore.createIndex('actif', 'actif', { unique: false });
      }

      // Store poids
      if (!database.objectStoreNames.contains(NEXXAT_DB.stores.poids)) {
        const poidsStore = database.createObjectStore(NEXXAT_DB.stores.poids, { keyPath: 'id', autoIncrement: true });
        poidsStore.createIndex('profilId', 'profilId', { unique: false });
        poidsStore.createIndex('date', 'date', { unique: false });
      }

      // Store repas
      if (!database.objectStoreNames.contains(NEXXAT_DB.stores.repas)) {
        const repasStore = database.createObjectStore(NEXXAT_DB.stores.repas, { keyPath: 'id', autoIncrement: true });
        repasStore.createIndex('profilId', 'profilId', { unique: false });
        repasStore.createIndex('date', 'date', { unique: false });
      }

      // Store aliments
      if (!database.objectStoreNames.contains(NEXXAT_DB.stores.aliments)) {
        const alimentsStore = database.createObjectStore(NEXXAT_DB.stores.aliments, { keyPath: 'id', autoIncrement: true });
        alimentsStore.createIndex('nom', 'nom', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      console.log('[NEXXAT] IndexedDB initialisée avec succès.');
      resolve(db);
    };

    request.onerror = (e) => {
      console.error('[NEXXAT] Erreur IndexedDB :', e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Ajoute un enregistrement dans un store
 */
function dbAdd(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror  = () => reject(request.error);
  });
}

/**
 * Met à jour un enregistrement existant
 */
function dbPut(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror  = () => reject(request.error);
  });
}

/**
 * Récupère tous les enregistrements d'un store
 */
function dbGetAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror  = () => reject(request.error);
  });
}

/**
 * Récupère un enregistrement par clé
 */
function dbGet(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror  = () => reject(request.error);
  });
}

/**
 * Supprime un enregistrement
 */
function dbDelete(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror  = () => reject(request.error);
  });
}

/**
 * Récupère les enregistrements par index
 */
function dbGetByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror  = () => reject(request.error);
  });
}
