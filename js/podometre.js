// ============================================================
// Nom du programme : NEXXAT - Calories Repas (podometre.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.1.0
// Date de création : 2026-03-04 14:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/podometre.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.1.0 - 2026-03-04 - Création Phase 2 - Podomètre Android
// ============================================================

'use strict';

// ── État du podomètre ──────────────────────────────────────
const PODOMETRE = {
  actif:          false,
  pas:            0,
  objectif:       10000,
  dernierAccel:   { x: 0, y: 0, z: 0 },
  seuilDetection: 1.8,
  delaiMinPas:    250, // ms minimum entre deux pas
  dernierPas:     0,
  historique:     [],
};

// ── Calcul distance (mètres) ───────────────────────────────
function calculerDistance(pas, taille) {
  // Longueur de foulée ≈ 0.415 × taille
  const fouleeM = (taille * 0.415) / 100;
  return Math.round(pas * fouleeM);
}

// ── Calcul calories brûlées (MET marche) ──────────────────
function calculerCaloriesPas(pas, poids, taille) {
  // MET marche normale ≈ 3.5
  // Calories = MET × poids(kg) × durée(h)
  // Durée estimée : 1 pas ≈ 0.5 seconde à allure normale
  const dureeH = (pas * 0.5) / 3600;
  return Math.round(3.5 * poids * dureeH);
}

// ── Détection de pas via accéléromètre ────────────────────
function onAccelerometrie(event) {
  const { x, y, z } = event.accelerationIncludingGravity || event.acceleration || {};
  if (x === undefined) return;

  const delta = Math.sqrt(
    Math.pow(x - PODOMETRE.dernierAccel.x, 2) +
    Math.pow(y - PODOMETRE.dernierAccel.y, 2) +
    Math.pow(z - PODOMETRE.dernierAccel.z, 2)
  );

  PODOMETRE.dernierAccel = { x, y, z };

  const maintenant = Date.now();
  if (delta > PODOMETRE.seuilDetection &&
      maintenant - PODOMETRE.dernierPas > PODOMETRE.delaiMinPas) {
    PODOMETRE.pas++;
    PODOMETRE.dernierPas = maintenant;
    mettreAJourAffichagePas();
    sauvegarderPasSession();
  }
}

// ── Démarrer le podomètre ──────────────────────────────────
async function demarrerPodometre() {
  if (PODOMETRE.actif) return;

  // Demander permission sur iOS 13+
  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const perm = await DeviceMotionEvent.requestPermission();
      if (perm !== 'granted') {
        afficherNotification('Permission accéléromètre refusée', 'erreur');
        return;
      }
    } catch (err) {
      afficherNotification('Erreur permission accéléromètre', 'erreur');
      return;
    }
  }

  if (!window.DeviceMotionEvent) {
    afficherNotification('Accéléromètre non disponible sur cet appareil', 'erreur');
    activerModeSaisieManuelle();
    return;
  }

  window.addEventListener('devicemotion', onAccelerometrie, true);
  PODOMETRE.actif = true;

  const btnDemarrer = document.getElementById('btn-podometre');
  if (btnDemarrer) {
    btnDemarrer.textContent = '⏹ Arrêter';
    btnDemarrer.classList.add('actif');
  }

  afficherNotification('Podomètre démarré ✓', 'succes');
  mettreAJourAffichagePas();
}

// ── Arrêter le podomètre ───────────────────────────────────
function arreterPodometre() {
  if (!PODOMETRE.actif) return;
  window.removeEventListener('devicemotion', onAccelerometrie, true);
  PODOMETRE.actif = false;

  const btnDemarrer = document.getElementById('btn-podometre');
  if (btnDemarrer) {
    btnDemarrer.textContent = '▶ Démarrer';
    btnDemarrer.classList.remove('actif');
  }

  sauvegarderJourneePas();
  afficherNotification('Podomètre arrêté — données sauvegardées ✓', 'info');
}

// ── Toggle démarrer/arrêter ────────────────────────────────
function togglePodometre() {
  PODOMETRE.actif ? arreterPodometre() : demarrerPodometre();
}

// ── Remettre à zéro ───────────────────────────────────────
function reinitialiserPas() {
  if (PODOMETRE.actif) arreterPodometre();
  PODOMETRE.pas = 0;
  mettreAJourAffichagePas();
  afficherNotification('Compteur remis à zéro', 'info');
}

// ── Mode saisie manuelle (fallback PC/tablette) ───────────
function activerModeSaisieManuelle() {
  const zone = document.getElementById('zone-saisie-manuelle-pas');
  if (zone) zone.style.display = 'block';
}

async function validerPasManuel(e) {
  e.preventDefault();
  const valeur = parseInt(document.getElementById('input-pas-manuel').value);
  if (isNaN(valeur) || valeur < 0 || valeur > 100000) {
    afficherNotification('Veuillez saisir un nombre de pas valide (0–100 000)', 'erreur');
    return;
  }
  PODOMETRE.pas = valeur;
  mettreAJourAffichagePas();
  await sauvegarderJourneePas();
  afficherNotification(`${valeur} pas enregistrés ✓`, 'succes');
}

// ── Mise à jour affichage ──────────────────────────────────
function mettreAJourAffichagePas() {
  if (!profilActif) return;

  const pas      = PODOMETRE.pas;
  const objectif = PODOMETRE.objectif;
  const distance = calculerDistance(pas, profilActif.taille);
  const calories = calculerCaloriesPas(pas, profilActif.poids, profilActif.taille);
  const pct      = Math.min(Math.round((pas / objectif) * 100), 100);

  // Compteur principal
  const elPas = document.getElementById('compteur-pas');
  if (elPas) elPas.textContent = pas.toLocaleString('fr-FR');

  // Distance
  const elDist = document.getElementById('distance-parcourue');
  if (elDist) elDist.textContent = distance >= 1000
    ? `${(distance / 1000).toFixed(2)} km`
    : `${distance} m`;

  // Calories
  const elCal = document.getElementById('calories-marche');
  if (elCal) elCal.textContent = `${calories} kcal`;

  // Objectif
  const elObj = document.getElementById('objectif-pas');
  if (elObj) elObj.textContent = objectif.toLocaleString('fr-FR');

  // Pourcentage
  const elPct = document.getElementById('pct-objectif');
  if (elPct) elPct.textContent = `${pct}%`;

  // Barre de progression
  const barre = document.getElementById('barre-progression-pas');
  if (barre) {
    barre.style.width = `${pct}%`;
    barre.style.background = pct >= 100 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#ff8c00';
  }

  // Message motivation
  const elMsg = document.getElementById('message-motivation');
  if (elMsg) {
    if (pct >= 100)      elMsg.textContent = '🏆 Objectif atteint ! Félicitations !';
    else if (pct >= 75)  elMsg.textContent = '💪 Presque là, encore un effort !';
    else if (pct >= 50)  elMsg.textContent = '🚶 Bonne progression, continuez !';
    else if (pct >= 25)  elMsg.textContent = '👟 Vous êtes lancé, continuez !';
    else                 elMsg.textContent = '🎯 Démarrez votre objectif du jour !';
  }
}

// ── Sauvegarde session en cours ────────────────────────────
async function sauvegarderPasSession() {
  if (!profilActif) return;
  const cle = `pas_session_${profilActif.id}`;
  localStorage.setItem(cle, JSON.stringify({
    pas:  PODOMETRE.pas,
    date: new Date().toISOString().split('T')[0]
  }));
}

// ── Sauvegarde journée complète en IndexedDB ───────────────
async function sauvegarderJourneePas() {
  if (!profilActif || PODOMETRE.pas === 0) return;

  const aujourd_hui = new Date().toISOString().split('T')[0];
  const entree = {
    profilId:  profilActif.id,
    pas:       PODOMETRE.pas,
    distance:  calculerDistance(PODOMETRE.pas, profilActif.taille),
    calories:  calculerCaloriesPas(PODOMETRE.pas, profilActif.poids, profilActif.taille),
    date:      new Date().toISOString(),
    dateJour:  aujourd_hui
  };

  // Vérifier si une entrée existe déjà pour aujourd'hui
  try {
    const existants = await dbGetByIndex('activites', 'dateJour', aujourd_hui);
    const existant = existants?.find(a => a.profilId === profilActif.id && a.type === 'pas');
    if (existant) {
      entree.id = existant.id;
      entree.type = 'pas';
      await dbPut('activites', entree);
    } else {
      entree.type = 'pas';
      await dbAdd('activites', entree);
    }
  } catch {
    entree.type = 'pas';
    await dbAdd('activites', entree);
  }
}

// ── Charger session du jour ────────────────────────────────
async function chargerSessionJour() {
  if (!profilActif) return;
  const cle     = `pas_session_${profilActif.id}`;
  const session = localStorage.getItem(cle);
  if (!session) return;

  try {
    const data = JSON.parse(session);
    const aujourd_hui = new Date().toISOString().split('T')[0];
    if (data.date === aujourd_hui) {
      PODOMETRE.pas = data.pas;
      mettreAJourAffichagePas();
    } else {
      localStorage.removeItem(cle);
    }
  } catch { /* ignorer */ }
}

// ── Charger historique pas ─────────────────────────────────
async function chargerHistoriquePasUI() {
  if (!profilActif) return;
  const container = document.getElementById('historique-pas');
  if (!container) return;

  try {
    const historique = await dbGetByIndex('activites', 'profilId', profilActif.id);
    const pasDays = historique
      .filter(a => a.type === 'pas')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    if (pasDays.length === 0) {
      container.innerHTML = '<div style="color:var(--nexxat-muted);text-align:center;font-size:0.85rem;">Aucune activité enregistrée</div>';
      return;
    }

    container.innerHTML = pasDays.map(j => {
      const date = new Date(j.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
      const pct  = Math.min(Math.round((j.pas / PODOMETRE.objectif) * 100), 100);
      return `
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:0.8rem;color:var(--nexxat-muted);">${date}</span>
            <span style="font-family:'Orbitron',sans-serif;font-size:0.8rem;">${j.pas.toLocaleString('fr-FR')} pas</span>
          </div>
          <div style="background:var(--nexxat-bg);border-radius:4px;height:6px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${pct>=100?'#27ae60':'#ff8c00'};border-radius:4px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:2px;">
            <span style="font-size:0.7rem;color:var(--nexxat-muted);">${j.distance >= 1000 ? (j.distance/1000).toFixed(1)+'km' : j.distance+'m'}</span>
            <span style="font-size:0.7rem;color:var(--nexxat-muted);">${j.calories} kcal · ${pct}%</span>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.warn('[NEXXAT] Historique pas :', err);
  }
}

// ── Initialisation podomètre ───────────────────────────────
async function initPodometre() {
  // Charger objectif depuis paramètres
  const params = chargerParametres();
  PODOMETRE.objectif = params.objectifPas || 10000;

  await chargerSessionJour();
  mettreAJourAffichagePas();
}
