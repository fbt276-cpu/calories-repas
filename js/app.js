// ============================================================
// Nom du programme : NEXXAT - Calories Repas (app.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.0.0
// Date de création : 2026-03-04 12:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/app.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.0.0 - 2026-03-04 - Création initiale - Logique principale
// ============================================================

'use strict';

// ── Affichage console NEXXAT ───────────────────────────────
console.log('╔══════════════════════════════════════════════════╗');
console.log('║       NEXXAT - Calories Repas                    ║');
console.log('║       © NEXXAT - ODET François 2026 | v1.0.0    ║');
console.log('║       Sourcé par Claude IA                       ║');
console.log('╚══════════════════════════════════════════════════╝');

// ── Navigation ────────────────────────────────────────────
let pageActuelle = 'accueil';

function naviguer(page) {
  // Masquer toutes les pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('actif'));

  // Afficher la page cible
  const pageEl = document.getElementById(`page-${page}`);
  const navEl  = document.getElementById(`nav-${page}`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl)  navEl.classList.add('actif');

  pageActuelle = page;

  // Actions spécifiques par page
  if (page === 'accueil') {
    afficherProfil();
    chargerGraphiquePoids();
  }
  if (page === 'poids') {
    chargerHistoriquePoidsUI();
    chargerGraphiquePoidsDetail();
  }
  if (page === 'profil') {
    remplirFormulaireProfil();
  }
}

// ── Gestion formulaire profil ─────────────────────────────
async function handleSauvegardeProfil(e) {
  e.preventDefault();

  const donnees = {
    id:             parseInt(document.getElementById('profil-id').value) || null,
    prenom:         document.getElementById('profil-prenom').value.trim(),
    nom:            document.getElementById('profil-nom').value.trim(),
    sexe:           document.getElementById('profil-sexe').value,
    age:            document.getElementById('profil-age').value,
    taille:         document.getElementById('profil-taille').value,
    poids:          document.getElementById('profil-poids').value,
    objectifPoids:  document.getElementById('profil-objectifPoids').value || null,
    niveauActivite: document.getElementById('profil-niveauActivite').value,
  };

  try {
    const id = await sauvegarderProfil(donnees);
    document.getElementById('profil-id').value = id;
    afficherNotification(`Profil de ${donnees.prenom} sauvegardé ✓`, 'succes');
    setTimeout(() => naviguer('accueil'), 1200);
  } catch (err) {
    console.error('[NEXXAT] Erreur sauvegarde profil :', err);
    afficherNotification('Erreur lors de la sauvegarde', 'erreur');
  }
}

// ── Sélection sexe ────────────────────────────────────────
function selectionnerSexe(sexe) {
  document.getElementById('profil-sexe').value = sexe;
  document.getElementById('btn-sexe-H').classList.toggle('actif', sexe === 'H');
  document.getElementById('btn-sexe-F').classList.toggle('actif', sexe === 'F');
}

// ── Historique poids UI ───────────────────────────────────
async function chargerHistoriquePoidsUI() {
  if (!profilActif) return;
  const historique = await chargerHistoriquePoids(profilActif.id);
  const container  = document.getElementById('liste-historique-poids');
  if (!container) return;

  if (historique.length === 0) {
    container.innerHTML = '<div style="color:var(--nexxat-muted); font-size:0.85rem; text-align:center;">Aucune mesure enregistrée</div>';
    return;
  }

  const inversé = [...historique].reverse();
  container.innerHTML = inversé.map((h, i) => {
    const date   = new Date(h.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
    const heure  = new Date(h.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    const diff   = i < inversé.length - 1 ? Math.round((h.poids - inversé[i+1].poids) * 10) / 10 : null;
    const diffTxt = diff !== null ? (diff > 0 ? `<span style="color:#e67e22">+${diff}</span>` : diff < 0 ? `<span style="color:#27ae60">${diff}</span>` : '<span style="color:#3498db">=</span>') : '';
    return `
      <div style="display:flex; justify-content:space-between; align-items:center;
                  padding:10px 0; border-bottom:1px solid var(--nexxat-border);">
        <div>
          <div style="font-family:'Orbitron',sans-serif; font-size:1rem;">${h.poids} kg ${diffTxt}</div>
          <div style="font-size:0.75rem; color:var(--nexxat-muted);">${date} à ${heure}</div>
        </div>
        ${i === 0 ? '<span style="background:var(--nexxat-orange);color:#000;padding:2px 8px;border-radius:10px;font-size:0.65rem;font-family:Orbitron,sans-serif;">Actuel</span>' : ''}
      </div>`;
  }).join('');
}

// ── Graphique poids page détail ───────────────────────────
async function chargerGraphiquePoidsDetail() {
  if (!profilActif) return;
  const canvas = document.getElementById('graphique-poids-detail');
  if (!canvas) return;

  const historique = await chargerHistoriquePoids(profilActif.id);
  if (historique.length < 2) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Enregistrez au moins 2 mesures pour afficher le graphique', canvas.width/2, canvas.height/2);
    return;
  }

  // Réutiliser la logique de profil.js
  const canvasTemp = { ...canvas, id: 'graphique-poids' };
  const origId = canvas.id;
  canvas.id = 'graphique-poids';
  await chargerGraphiquePoids();
  canvas.id = origId;
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

// ── Mise à jour IMC curseur ───────────────────────────────
function mettreAJourCurseurIMC(imcValeur) {
  const curseur = document.getElementById('imc-curseur');
  const grandIMC = document.getElementById('imc-grand');
  if (!curseur) return;

  // Position sur la barre (16 → 40+)
  const min = 16, max = 40;
  const pct = Math.min(Math.max((imcValeur - min) / (max - min) * 100, 2), 98);
  curseur.style.left = `${pct}%`;

  const data = calculerIMC(profilActif?.poids || 70, profilActif?.taille || 170);
  if (grandIMC) { grandIMC.textContent = data.valeur; grandIMC.style.color = data.couleur; }
}

// ── Surcharge afficherProfil pour l'accueil ───────────────
const _afficherProfilOriginal = typeof afficherProfil === 'function' ? afficherProfil : null;

// Patch pour mettre à jour le curseur IMC et l'objectif
async function afficherProfilComplet() {
  if (!profilActif) {
    document.getElementById('no-profil-msg')?.style.setProperty('display', 'block');
    document.getElementById('stats-accueil')?.style.setProperty('display', 'none');
    return;
  }

  document.getElementById('no-profil-msg')?.style.setProperty('display', 'none');
  document.getElementById('stats-accueil')?.style.setProperty('display', 'block');

  const imc = calculerIMC(profilActif.poids, profilActif.taille);
  mettreAJourCurseurIMC(imc.valeur);

  // Objectif
  const carteObj = document.getElementById('carte-objectif');
  if (profilActif.objectifPoids && carteObj) {
    carteObj.style.display = 'block';
  }

  // Avatar sexe
  const avatar = document.getElementById('profil-avatar');
  if (avatar) avatar.textContent = profilActif.sexe === 'F' ? '👩' : '👨';
}

// ── Initialisation ────────────────────────────────────────
async function init() {
  try {
    // Init IndexedDB
    await initDB();

    // Charger profil actif
    await chargerProfilActif();

    // Masquer splash après 2 secondes
    setTimeout(() => {
      document.getElementById('splash')?.classList.add('hidden');
      afficherProfil();
      afficherProfilComplet();
      chargerGraphiquePoids();
    }, 2000);

    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('[NEXXAT] Service Worker enregistré.'))
        .catch(e => console.warn('[NEXXAT] SW non disponible :', e));
    }

  } catch (err) {
    console.error('[NEXXAT] Erreur initialisation :', err);
    afficherNotification('Erreur d\'initialisation', 'erreur');
  }
}

// ── Patch handleNouveauPoids pour sync les deux formulaires
const _handleNouveauPoidsOriginal = handleNouveauPoids;
async function handleNouveauPoids(e) {
  e.preventDefault();
  if (!profilActif) {
    afficherNotification('Veuillez d\'abord créer un profil', 'erreur');
    return;
  }

  // Récupérer depuis le bon champ selon le formulaire
  const champAccueil = document.getElementById('nouveau-poids');
  const champDetail  = document.getElementById('nouveau-poids-detail');
  const valeur = champAccueil?.value || champDetail?.value;
  const poids  = parseFloat(valeur);

  if (isNaN(poids) || poids < 20 || poids > 300) {
    afficherNotification('Veuillez saisir un poids valide (20–300 kg)', 'erreur');
    return;
  }

  profilActif.poids = poids;
  await dbPut(NEXXAT_DB.stores.profils, profilActif);
  await enregistrerPoids(profilActif.id, poids);

  afficherNotification(`Poids enregistré : ${poids} kg ✓`, 'succes');
  if (champAccueil)  champAccueil.value  = '';
  if (champDetail)   champDetail.value   = '';

  afficherProfil();
  afficherProfilComplet();
  chargerGraphiquePoids();

  if (pageActuelle === 'poids') {
    chargerHistoriquePoidsUI();
    chargerGraphiquePoidsDetail();
  }
}

// ── Démarrage ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
