// ============================================================
// Nom du programme : NEXXAT - Calories Repas (app.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.1.0
// Date de création : 2026-03-04 14:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/app.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.1.0 - 2026-03-04 - Phase 2 : Podomètre + Paramètres + Date naissance + Thème doux
// v1.0.0 - 2026-03-04 - Création initiale
// ============================================================

'use strict';

console.log('╔══════════════════════════════════════════════════╗');
console.log('║       NEXXAT - Calories Repas                    ║');
console.log('║       © NEXXAT - ODET François 2026 | v1.1.0    ║');
console.log('║       Sourcé par Claude IA                       ║');
console.log('╚══════════════════════════════════════════════════╝');

// ── Navigation ────────────────────────────────────────────
let pageActuelle = 'accueil';

function naviguer(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('actif'));

  const pageEl = document.getElementById(`page-${page}`);
  const navEl  = document.getElementById(`nav-${page}`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl)  navEl.classList.add('actif');

  pageActuelle = page;

  switch (page) {
    case 'accueil':
      afficherProfil();
      afficherProfilComplet();
      chargerGraphiquePoids();
      break;
    case 'podometre':
      chargerHistoriquePasUI();
      mettreAJourAffichagePas();
      break;
    case 'poids':
      chargerHistoriquePoidsUI();
      chargerGraphiquePoids();
      break;
    case 'profil':
      remplirFormulaireProfil();
      break;
    case 'parametres':
      remplirFormulaireParametres();
      break;
  }
}

// ── Formulaire profil ─────────────────────────────────────
async function handleSauvegardeProfil(e) {
  e.preventDefault();

  const donnees = {
    id:             parseInt(document.getElementById('profil-id').value) || null,
    prenom:         document.getElementById('profil-prenom').value.trim(),
    nom:            document.getElementById('profil-nom').value.trim(),
    sexe:           document.getElementById('profil-sexe').value,
    dateNaissance:  document.getElementById('profil-dateNaissance').value,
    taille:         document.getElementById('profil-taille').value,
    poids:          document.getElementById('profil-poids').value,
    objectifPoids:  document.getElementById('profil-objectifPoids').value || null,
    niveauActivite: document.getElementById('profil-niveauActivite').value,
  };

  if (!donnees.dateNaissance) {
    afficherNotification('Veuillez saisir votre date de naissance', 'erreur');
    return;
  }

  try {
    const id = await sauvegarderProfil(donnees);
    document.getElementById('profil-id').value = id;
    const age = calculerAge(donnees.dateNaissance);
    afficherNotification(`Profil de ${donnees.prenom} (${age} ans) sauvegardé ✓`, 'succes');
    setTimeout(() => naviguer('accueil'), 1200);
  } catch (err) {
    console.error('[NEXXAT] Erreur sauvegarde profil :', err);
    afficherNotification('Erreur lors de la sauvegarde', 'erreur');
  }
}

// ── Affichage âge calculé en temps réel ──────────────────
function onChangeDateNaissance() {
  const el    = document.getElementById('profil-dateNaissance');
  const affEl = document.getElementById('age-calcule');
  if (!el || !affEl || !el.value) { if (affEl) affEl.textContent = ''; return; }

  const age = calculerAge(el.value);
  affEl.textContent = `→ ${age} ans`;
}

// ── Sélection sexe ────────────────────────────────────────
function selectionnerSexe(sexe) {
  document.getElementById('profil-sexe').value = sexe;
  document.getElementById('btn-sexe-H').classList.toggle('actif', sexe === 'H');
  document.getElementById('btn-sexe-F').classList.toggle('actif', sexe === 'F');
}

// ── Affichage profil complet (accueil) ────────────────────
async function afficherProfilComplet() {
  if (!profilActif) {
    document.getElementById('no-profil-msg')?.style.setProperty('display', 'block');
    document.getElementById('stats-accueil')?.style.setProperty('display', 'none');
    return;
  }

  document.getElementById('no-profil-msg')?.style.setProperty('display', 'none');
  document.getElementById('stats-accueil')?.style.setProperty('display', 'block');

  // Curseur IMC
  const imc = calculerIMC(profilActif.poids, profilActif.taille);
  const curseur = document.getElementById('imc-curseur');
  const grandIMC = document.getElementById('imc-grand');
  if (curseur) {
    const pct = Math.min(Math.max((imc.valeur - 16) / (40 - 16) * 100, 2), 98);
    curseur.style.left = `${pct}%`;
  }
  if (grandIMC) { grandIMC.textContent = imc.valeur; grandIMC.style.color = imc.couleur; }

  // Objectif
  const carteObj = document.getElementById('carte-objectif');
  if (profilActif.objectifPoids && carteObj) carteObj.style.display = 'block';

  // Avatar
  const avatar = document.getElementById('profil-avatar');
  if (avatar) avatar.textContent = profilActif.sexe === 'F' ? '👩' : '👨';

  // Anniversaire
  if (estAnniversaire(profilActif.dateNaissance)) {
    const zoneAnniv = document.getElementById('zone-anniversaire');
    if (zoneAnniv) zoneAnniv.style.display = 'block';
  }
}

// ── Historique poids UI ───────────────────────────────────
async function chargerHistoriquePoidsUI() {
  if (!profilActif) return;
  const historique = await chargerHistoriquePoids(profilActif.id);
  const container  = document.getElementById('liste-historique-poids');
  if (!container) return;

  if (historique.length === 0) {
    container.innerHTML = '<div style="color:var(--nexxat-muted);font-size:0.85rem;text-align:center">Aucune mesure enregistrée</div>';
    return;
  }

  const inversé = [...historique].reverse();
  container.innerHTML = inversé.map((h, i) => {
    const date  = new Date(h.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
    const heure = new Date(h.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    const diff  = i < inversé.length - 1
      ? Math.round((h.poids - inversé[i+1].poids) * 10) / 10 : null;
    const diffTxt = diff !== null
      ? (diff > 0 ? `<span style="color:#e67e22">+${diff}</span>`
                  : diff < 0 ? `<span style="color:#27ae60">${diff}</span>`
                              : '<span style="color:#3498db">=</span>') : '';
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:10px 0;border-bottom:1px solid var(--nexxat-border)">
        <div>
          <div style="font-family:'Orbitron',sans-serif;font-size:1rem">${h.poids} kg ${diffTxt}</div>
          <div style="font-size:0.75rem;color:var(--nexxat-muted)">${date} à ${heure}</div>
        </div>
        ${i === 0 ? '<span style="background:var(--nexxat-orange);color:#000;padding:2px 8px;border-radius:10px;font-size:0.65rem;font-family:Orbitron,sans-serif">Actuel</span>' : ''}
      </div>`;
  }).join('');
}

// ── Notifications ─────────────────────────────────────────
function afficherNotification(message, type = 'info') {
  const container = document.getElementById('notification-container');
  const notif     = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);
  setTimeout(() => notif.remove(), 3500);
}

// ── Initialisation ────────────────────────────────────────
async function init() {
  try {
    await initDB();
    await chargerProfilActif();

    // Écouter changement date naissance
    const dateEl = document.getElementById('profil-dateNaissance');
    if (dateEl) dateEl.addEventListener('change', onChangeDateNaissance);

    // Démarrer podomètre
    await initPodometre();

    // Splash 2 secondes
    setTimeout(() => {
      document.getElementById('splash')?.classList.add('hidden');
      afficherProfil();
      afficherProfilComplet();
      chargerGraphiquePoids();
    }, 2000);

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('[NEXXAT] Service Worker v1.1.0 enregistré.'))
        .catch(e => console.warn('[NEXXAT] SW :', e));
    }

  } catch (err) {
    console.error('[NEXXAT] Erreur init :', err);
    afficherNotification('Erreur d\'initialisation', 'erreur');
  }
}

document.addEventListener('DOMContentLoaded', init);
