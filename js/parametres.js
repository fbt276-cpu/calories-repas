// ============================================================
// Nom du programme : NEXXAT - Calories Repas (parametres.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.1.0
// Date de création : 2026-03-04 14:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/parametres.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.1.0 - 2026-03-04 - Création Phase 2 - Paramètres application
// ============================================================

'use strict';

// ── Paramètres par défaut ──────────────────────────────────
const PARAMETRES_DEFAUT = {
  langue:      'fr',
  unites:      'metric',   // metric (kg/cm) ou imperial (lbs/in)
  objectifPas: 10000,
  version:     '1.1.0'
};

// ── Charger les paramètres ─────────────────────────────────
function chargerParametres() {
  try {
    const stockes = localStorage.getItem('nexxat_parametres');
    return stockes ? { ...PARAMETRES_DEFAUT, ...JSON.parse(stockes) } : { ...PARAMETRES_DEFAUT };
  } catch {
    return { ...PARAMETRES_DEFAUT };
  }
}

// ── Sauvegarder les paramètres ─────────────────────────────
function sauvegarderParametres(params) {
  try {
    localStorage.setItem('nexxat_parametres', JSON.stringify(params));
    appliquerParametres(params);
    afficherNotification('Paramètres sauvegardés ✓', 'succes');
  } catch (err) {
    console.error('[NEXXAT] Erreur sauvegarde paramètres :', err);
    afficherNotification('Erreur lors de la sauvegarde', 'erreur');
  }
}

// ── Appliquer les paramètres ───────────────────────────────
function appliquerParametres(params) {
  // Objectif pas
  if (PODOMETRE) PODOMETRE.objectif = params.objectifPas || 10000;
  mettreAJourAffichagePas();
}

// ── Remplir le formulaire paramètres ──────────────────────
function remplirFormulaireParametres() {
  const params = chargerParametres();

  const elLangue = document.getElementById('param-langue');
  const elUnites = document.getElementById('param-unites');
  const elPas    = document.getElementById('param-objectif-pas');

  if (elLangue) elLangue.value = params.langue;
  if (elUnites) elUnites.value = params.unites;
  if (elPas)    elPas.value    = params.objectifPas;

  // Afficher version app
  const elVersion = document.getElementById('param-version');
  if (elVersion) elVersion.textContent = `NEXXAT Calories Repas v1.1.0`;

  // Afficher copyright
  const elCopyright = document.getElementById('param-copyright');
  if (elCopyright) elCopyright.textContent = '© NEXXAT - ODET François 2026 · Sourcé par Claude IA';
}

// ── Gérer formulaire paramètres ───────────────────────────
function handleSauvegardeParametres(e) {
  e.preventDefault();

  const params = {
    langue:      document.getElementById('param-langue')?.value || 'fr',
    unites:      document.getElementById('param-unites')?.value || 'metric',
    objectifPas: parseInt(document.getElementById('param-objectif-pas')?.value) || 10000,
    version:     '1.1.0'
  };

  sauvegarderParametres(params);
}

// ── Réinitialiser toutes les données ──────────────────────
async function reinitialiserToutesLesDonnees() {
  const confirmation = confirm(
    '⚠️ ATTENTION\n\nVous allez supprimer TOUTES vos données :\n' +
    '- Profil(s)\n- Historique poids\n- Historique pas\n\n' +
    'Cette action est IRRÉVERSIBLE.\n\nConfirmer ?'
  );

  if (!confirmation) return;

  try {
    // Vider IndexedDB
    const stores = Object.values(NEXXAT_DB.stores);
    for (const store of stores) {
      const items = await dbGetAll(store);
      for (const item of items) {
        await dbDelete(store, item.id);
      }
    }

    // Vider localStorage
    localStorage.clear();

    // Réinitialiser l'état
    profilActif = null;
    PODOMETRE.pas = 0;

    afficherNotification('Toutes les données ont été supprimées', 'info');
    setTimeout(() => naviguer('profil'), 1500);
  } catch (err) {
    console.error('[NEXXAT] Erreur réinitialisation :', err);
    afficherNotification('Erreur lors de la réinitialisation', 'erreur');
  }
}

// ── Exporter les données (RGPD) ────────────────────────────
async function exporterDonnees() {
  try {
    const profils   = await dbGetAll(NEXXAT_DB.stores.profils);
    const poids     = await dbGetAll(NEXXAT_DB.stores.poids);
    const activites = await dbGetAll('activites').catch(() => []);
    const params    = chargerParametres();

    const export_data = {
      export_date: new Date().toISOString(),
      application: 'NEXXAT Calories Repas v1.1.0',
      copyright:   '© NEXXAT - ODET François 2026',
      profils, poids, activites, parametres: params
    };

    const blob = new Blob(
      [JSON.stringify(export_data, null, 2)],
      { type: 'application/json' }
    );
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `nexxat_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    afficherNotification('Export téléchargé ✓', 'succes');
  } catch (err) {
    console.error('[NEXXAT] Erreur export :', err);
    afficherNotification('Erreur lors de l\'export', 'erreur');
  }
}
