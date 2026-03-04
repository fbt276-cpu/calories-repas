// ============================================================
// Nom du programme : NEXXAT - Calories Repas (profil.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.1.0
// Date de création : 2026-03-04 14:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/profil.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.1.0 - 2026-03-04 - Date de naissance → âge calculé automatiquement
// v1.0.0 - 2026-03-04 - Création initiale - Profil + Poids + IMC
// ============================================================

'use strict';

// ── Profil actif en mémoire ────────────────────────────────
let profilActif = null;

/**
 * Calcule l'âge exact à partir de la date de naissance
 */
function calculerAge(dateNaissance) {
  const naissance  = new Date(dateNaissance);
  const aujourd_hui = new Date();
  let age = aujourd_hui.getFullYear() - naissance.getFullYear();
  const moisDiff = aujourd_hui.getMonth() - naissance.getMonth();
  if (moisDiff < 0 || (moisDiff === 0 && aujourd_hui.getDate() < naissance.getDate())) {
    age--;
  }
  return age;
}

/**
 * Vérifie si c'est l'anniversaire aujourd'hui
 */
function estAnniversaire(dateNaissance) {
  const naissance   = new Date(dateNaissance);
  const aujourd_hui = new Date();
  return naissance.getMonth() === aujourd_hui.getMonth() &&
         naissance.getDate()  === aujourd_hui.getDate();
}

/**
 * Calcule l'IMC et retourne la catégorie
 */
function calculerIMC(poids, taille) {
  const tailleM = taille / 100;
  const imc     = poids / (tailleM * tailleM);
  let categorie = '', couleur = '';

  if      (imc < 16.5) { categorie = 'Dénutrition sévère';     couleur = '#e74c3c'; }
  else if (imc < 18.5) { categorie = 'Insuffisance pondérale'; couleur = '#e67e22'; }
  else if (imc < 25.0) { categorie = 'Poids normal ✓';          couleur = '#27ae60'; }
  else if (imc < 30.0) { categorie = 'Surpoids';                couleur = '#f39c12'; }
  else if (imc < 35.0) { categorie = 'Obésité modérée';         couleur = '#e67e22'; }
  else if (imc < 40.0) { categorie = 'Obésité sévère';          couleur = '#e74c3c'; }
  else                 { categorie = 'Obésité morbide';          couleur = '#c0392b'; }

  return { valeur: Math.round(imc * 10) / 10, categorie, couleur };
}

/**
 * Calcule le métabolisme de base (Mifflin-St Jeor)
 * L'âge est recalculé automatiquement depuis la date de naissance
 */
function calculerMetabolismeBase(poids, taille, dateNaissance, sexe) {
  const age = calculerAge(dateNaissance);
  let mb;
  if (sexe === 'H') {
    mb = (10 * poids) + (6.25 * taille) - (5 * age) + 5;
  } else {
    mb = (10 * poids) + (6.25 * taille) - (5 * age) - 161;
  }
  return Math.round(mb);
}

/**
 * Calcule les besoins caloriques journaliers
 */
function calculerBesoinsCaloriques(mb, niveauActivite) {
  const facteurs = {
    sedentaire: 1.2,
    leger:      1.375,
    modere:     1.55,
    actif:      1.725,
    tres_actif: 1.9
  };
  return Math.round(mb * (facteurs[niveauActivite] || 1.55));
}

/**
 * Calcule la tendance du poids
 */
function calculerTendancePoids(historique) {
  if (!historique || historique.length < 2) return { icone: '➡️', texte: 'Données insuffisantes' };
  const dernier      = historique[historique.length - 1].poids;
  const avantDernier = historique[historique.length - 2].poids;
  const diff = Math.round((dernier - avantDernier) * 10) / 10;

  if (diff > 0.2)  return { icone: '↗️', texte: `+${diff} kg`, couleur: '#e67e22' };
  if (diff < -0.2) return { icone: '↘️', texte: `${diff} kg`,  couleur: '#27ae60' };
  return               { icone: '➡️', texte: 'Stable',          couleur: '#3498db' };
}

/**
 * Sauvegarde le profil en base
 */
async function sauvegarderProfil(donnees) {
  const profil = {
    nom:             donnees.nom,
    prenom:          donnees.prenom,
    sexe:            donnees.sexe,
    dateNaissance:   donnees.dateNaissance,   // ← date de naissance (remplace age)
    taille:          parseInt(donnees.taille),
    poids:           parseFloat(donnees.poids),
    objectifPoids:   parseFloat(donnees.objectifPoids) || null,
    niveauActivite:  donnees.niveauActivite || 'modere',
    actif:           1,
    dateCreation:    new Date().toISOString()
  };

  let id;
  if (donnees.id) {
    profil.id = donnees.id;
    await dbPut(NEXXAT_DB.stores.profils, profil);
    id = donnees.id;
  } else {
    // Désactiver les autres profils
    const tousLesProfils = await dbGetAll(NEXXAT_DB.stores.profils);
    for (const p of tousLesProfils) { p.actif = 0; await dbPut(NEXXAT_DB.stores.profils, p); }
    id = await dbAdd(NEXXAT_DB.stores.profils, profil);
  }

  await enregistrerPoids(id, profil.poids);
  profilActif = { ...profil, id };
  afficherProfil();
  return id;
}

/**
 * Enregistre une mesure de poids
 */
async function enregistrerPoids(profilId, poids) {
  const mesure = {
    profilId,
    poids:    parseFloat(poids),
    date:     new Date().toISOString(),
    dateJour: new Date().toISOString().split('T')[0]
  };
  return await dbAdd(NEXXAT_DB.stores.poids, mesure);
}

/**
 * Charge le profil actif depuis la base
 */
async function chargerProfilActif() {
  const profils = await dbGetAll(NEXXAT_DB.stores.profils);
  profilActif   = profils.find(p => p.actif === 1) || null;
  return profilActif;
}

/**
 * Charge l'historique de poids d'un profil
 */
async function chargerHistoriquePoids(profilId) {
  const historique = await dbGetByIndex(NEXXAT_DB.stores.poids, 'profilId', profilId);
  return historique.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Affiche les données du profil dans l'interface
 */
async function afficherProfil() {
  if (!profilActif) return;

  const age        = calculerAge(profilActif.dateNaissance);
  const historique = await chargerHistoriquePoids(profilActif.id);
  const imc        = calculerIMC(profilActif.poids, profilActif.taille);
  const mb         = calculerMetabolismeBase(profilActif.poids, profilActif.taille, profilActif.dateNaissance, profilActif.sexe);
  const calories   = calculerBesoinsCaloriques(mb, profilActif.niveauActivite);
  const tendance   = calculerTendancePoids(historique);

  const els = {
    nomProfil:     document.getElementById('nom-profil'),
    ageProfil:     document.getElementById('age-profil'),
    poidsActuel:   document.getElementById('poids-actuel'),
    imcValeur:     document.getElementById('imc-valeur'),
    imcCategorie:  document.getElementById('imc-categorie'),
    caloriesJour:  document.getElementById('calories-jour'),
    tendancePoids: document.getElementById('tendance-poids'),
    objectifPoids: document.getElementById('objectif-poids'),
    poidsRestant:  document.getElementById('poids-restant'),
  };

  if (els.nomProfil)     els.nomProfil.textContent     = `${profilActif.prenom} ${profilActif.nom}`;
  if (els.ageProfil)     els.ageProfil.textContent     = `${age} ans`;
  if (els.poidsActuel)   els.poidsActuel.textContent   = `${profilActif.poids} kg`;
  if (els.imcValeur)     { els.imcValeur.textContent   = imc.valeur; els.imcValeur.style.color = imc.couleur; }
  if (els.imcCategorie)  { els.imcCategorie.textContent = imc.categorie; els.imcCategorie.style.color = imc.couleur; }
  if (els.caloriesJour)  els.caloriesJour.textContent  = `${calories} kcal/jour`;
  if (els.tendancePoids) { els.tendancePoids.textContent = `${tendance.icone} ${tendance.texte}`; if (tendance.couleur) els.tendancePoids.style.color = tendance.couleur; }

  if (profilActif.objectifPoids && els.objectifPoids) {
    els.objectifPoids.textContent = `${profilActif.objectifPoids} kg`;
    const restant = Math.round((profilActif.poids - profilActif.objectifPoids) * 10) / 10;
    if (els.poidsRestant) els.poidsRestant.textContent = restant > 0 ? `${restant} kg à perdre` : `Objectif atteint ! 🎉`;
  }

  remplirFormulaireProfil();
}

/**
 * Remplit le formulaire avec les données du profil actif
 */
function remplirFormulaireProfil() {
  if (!profilActif) return;
  const champs = ['nom', 'prenom', 'sexe', 'dateNaissance', 'taille', 'poids', 'objectifPoids', 'niveauActivite'];
  champs.forEach(champ => {
    const el = document.getElementById(`profil-${champ}`);
    if (el && profilActif[champ] !== undefined) el.value = profilActif[champ];
  });
  const idEl = document.getElementById('profil-id');
  if (idEl) idEl.value = profilActif.id;
}

/**
 * Gestion du formulaire de saisie poids
 */
async function handleNouveauPoids(e) {
  e.preventDefault();
  if (!profilActif) { afficherNotification('Veuillez d\'abord créer un profil', 'erreur'); return; }

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

  if (champAccueil) champAccueil.value = '';
  if (champDetail)  champDetail.value  = '';

  afficherNotification(`Poids enregistré : ${poids} kg ✓`, 'succes');
  afficherProfil();
  chargerGraphiquePoids();
}

/**
 * Graphique d'évolution du poids (canvas)
 */
async function chargerGraphiquePoids() {
  if (!profilActif) return;
  const canvas = document.getElementById('graphique-poids');
  if (!canvas) return;

  const historique = await chargerHistoriquePoids(profilActif.id);
  if (historique.length < 2) return;

  const ctx  = canvas.getContext('2d');
  const w    = canvas.width;
  const h    = canvas.height;
  const pad  = 40;
  const poids = historique.map(h => h.poids);
  const min  = Math.min(...poids) - 1;
  const max  = Math.max(...poids) + 1;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'var(--nexxat-bg2, #222840)';
  ctx.fillRect(0, 0, w, h);

  // Grille
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (h - 2 * pad) * i / 4;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillText((max - (max - min) * i / 4).toFixed(1), 2, y + 4);
  }

  // Courbe
  ctx.strokeStyle = '#ff8c00';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  historique.forEach((point, i) => {
    const x = pad + (w - 2 * pad) * i / (historique.length - 1);
    const y = h - pad - (h - 2 * pad) * (point.poids - min) / (max - min);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Points
  historique.forEach((point, i) => {
    const x = pad + (w - 2 * pad) * i / (historique.length - 1);
    const y = h - pad - (h - 2 * pad) * (point.poids - min) / (max - min);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8c00'; ctx.fill();
  });

  // Ligne objectif
  if (profilActif.objectifPoids) {
    const yObj = h - pad - (h - 2 * pad) * (profilActif.objectifPoids - min) / (max - min);
    ctx.strokeStyle = '#27ae60'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, yObj); ctx.lineTo(w - pad, yObj); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#27ae60'; ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillText(`Objectif: ${profilActif.objectifPoids}kg`, w - 110, yObj - 5);
  }
}
