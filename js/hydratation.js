// ============================================================
// Nom du programme : NEXXAT - Calories Repas (hydratation.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.3.0
// Date de création : 2026-03-04 18:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/hydratation.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.3.0 - 2026-03-04 - Création Phase 4 - Suivi hydratation
// ============================================================

'use strict';

// ── État hydratation ───────────────────────────────────────
const HYDRATATION = {
  totalJour:  0,
  objectif:   1500,   // ml — recommandation OMS minimum
  historique: [],
};

// ── Boutons express ────────────────────────────────────────
const BOISSONS_EXPRESS = [
  { label: '☕ Café',      ml: 150,  icone: '☕' },
  { label: '🥛 Verre',     ml: 200,  icone: '🥛' },
  { label: '🥤 Canette',   ml: 330,  icone: '🥤' },
  { label: '💧 Bouteille', ml: 500,  icone: '💧' },
];

// ── Ajouter une prise d'eau ────────────────────────────────
async function ajouterEau(ml) {
  if (!profilActif) { afficherNotification('Veuillez d\'abord créer un profil', 'erreur'); return; }
  if (!ml || ml <= 0 || ml > 5000) { afficherNotification('Quantité invalide (1–5 000 ml)', 'erreur'); return; }

  const entree = {
    profilId: profilActif.id,
    ml:       parseInt(ml),
    date:     new Date().toISOString(),
    dateJour: new Date().toISOString().split('T')[0],
  };

  await dbAdd('hydratation', entree);
  HYDRATATION.totalJour += entree.ml;
  afficherNotification(`+${ml} ml ajoutés 💧`, 'succes');
  await rafraichirHydratation();
}

// ── Saisie libre ───────────────────────────────────────────
async function handleSaisieEau(e) {
  e.preventDefault();
  const input = document.getElementById('input-ml-eau');
  const ml    = parseInt(input?.value);
  if (isNaN(ml)) return;
  await ajouterEau(ml);
  if (input) input.value = '';
}

// ── Charger total du jour ──────────────────────────────────
async function chargerTotalJour() {
  if (!profilActif) return 0;
  const aujourd_hui = new Date().toISOString().split('T')[0];
  const tout = await dbGetByIndex('hydratation', 'profilId', profilActif.id);
  const prises = tout.filter(h => h.dateJour === aujourd_hui);
  HYDRATATION.totalJour = prises.reduce((s, h) => s + (h.ml || 0), 0);
  return { total: HYDRATATION.totalJour, prises };
}

// ── Rafraîchir tout l'affichage hydratation ───────────────
async function rafraichirHydratation() {
  const params = chargerParametres();
  HYDRATATION.objectif = params.objectifEau || 1500;

  const { total, prises } = await chargerTotalJour();
  const pct     = Math.min(Math.round((total / HYDRATATION.objectif) * 100), 100);
  const restant = Math.max(0, HYDRATATION.objectif - total);

  // Cercle SVG animé
  dessinerCercleHydratation(pct);

  // Chiffres
  setElH('hydra-total',   total >= 1000 ? `${(total / 1000).toFixed(2)} L` : `${total} ml`);
  setElH('hydra-objectif', HYDRATATION.objectif >= 1000 ? `${(HYDRATATION.objectif / 1000).toFixed(1)} L` : `${HYDRATATION.objectif} ml`);
  setElH('hydra-pct',     `${pct}%`);
  setElH('hydra-restant', restant > 0
    ? `encore ${restant >= 1000 ? (restant / 1000).toFixed(2) + ' L' : restant + ' ml'}`
    : '✅ Objectif atteint !');

  // Message motivation
  const elMsg = document.getElementById('hydra-message');
  if (elMsg) {
    if (pct >= 100)     { elMsg.textContent = '🏆 Excellent ! Hydratation optimale !'; elMsg.style.color = '#27ae60'; }
    else if (pct >= 75) { elMsg.textContent = '💪 Très bien, continuez !';              elMsg.style.color = '#3498db'; }
    else if (pct >= 50) { elMsg.textContent = '👍 Bonne progression !';                 elMsg.style.color = '#ff8c00'; }
    else if (pct >= 25) { elMsg.textContent = '💧 Pensez à boire davantage.';           elMsg.style.color = '#e67e22'; }
    else                { elMsg.textContent = '⚠️ Hydratation insuffisante !';           elMsg.style.color = '#e74c3c'; }
  }

  // Liste prises du jour
  afficherPrisesJour(prises);

  // Graphique 7 jours
  await dessinerGraphiqueHydratation();
}

// ── Cercle SVG de progression ──────────────────────────────
function dessinerCercleHydratation(pct) {
  const cercle = document.getElementById('cercle-hydra-progress');
  if (!cercle) return;

  const rayon        = 54;
  const circonference = 2 * Math.PI * rayon;
  const offset       = circonference - (pct / 100) * circonference;
  const couleur      = pct >= 100 ? '#27ae60' : pct >= 50 ? '#3498db' : '#ff8c00';

  cercle.setAttribute('stroke-dasharray',  `${circonference}`);
  cercle.setAttribute('stroke-dashoffset', `${offset}`);
  cercle.setAttribute('stroke',            couleur);
}

// ── Afficher les prises du jour ────────────────────────────
function afficherPrisesJour(prises) {
  const container = document.getElementById('liste-prises-eau');
  if (!container) return;

  if (prises.length === 0) {
    container.innerHTML = '<div style="color:var(--nexxat-muted);font-size:0.85rem;text-align:center">Aucune prise enregistrée aujourd\'hui</div>';
    return;
  }

  const inversées = [...prises].reverse();
  container.innerHTML = inversées.map(p => {
    const heure = new Date(p.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const icone = p.ml <= 150 ? '☕' : p.ml <= 250 ? '🥛' : p.ml <= 350 ? '🥤' : '💧';
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:1.2rem">${icone}</span>
          <span style="font-family:'Orbitron',sans-serif;font-size:0.9rem;color:#3498db;">+${p.ml} ml</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:0.75rem;color:var(--nexxat-muted);">${heure}</span>
          <button onclick="supprimerPriseEau(${p.id})"
                  style="background:none;border:none;color:var(--nexxat-muted);cursor:pointer;font-size:0.75rem;">✕</button>
        </div>
      </div>`;
  }).join('');
}

// ── Supprimer une prise ────────────────────────────────────
async function supprimerPriseEau(id) {
  await dbDelete('hydratation', id);
  afficherNotification('Prise supprimée', 'info');
  await rafraichirHydratation();
}

// ── Graphique 7 jours (canvas) ─────────────────────────────
async function dessinerGraphiqueHydratation() {
  const canvas = document.getElementById('graphique-hydratation');
  if (!canvas || !profilActif) return;

  // Construire les 7 derniers jours
  const jours = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    jours.push(d.toISOString().split('T')[0]);
  }

  const tout = await dbGetByIndex('hydratation', 'profilId', profilActif.id);
  const totauxParJour = jours.map(j => {
    const prises = tout.filter(h => h.dateJour === j);
    return { date: j, total: prises.reduce((s, h) => s + (h.ml || 0), 0) };
  });

  const ctx  = canvas.getContext('2d');
  const w    = canvas.width;
  const h    = canvas.height;
  const pad  = 40;
  const max  = Math.max(HYDRATATION.objectif * 1.2, ...totauxParJour.map(j => j.total), 500);

  ctx.clearRect(0, 0, w, h);

  // Fond blanc
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Grille
  ctx.strokeStyle = 'rgba(0,0,80,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (h - 2 * pad) * i / 4;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    ctx.fillStyle = '#888888';
    ctx.font = '9px Rajdhani, sans-serif';
    const val = Math.round(max - (max * i / 4));
    ctx.fillText(val >= 1000 ? `${(val/1000).toFixed(1)}L` : `${val}`, 2, y + 4);
  }

  // Ligne objectif
  const yObj = h - pad - (h - 2 * pad) * (HYDRATATION.objectif / max);
  ctx.strokeStyle = '#3498db'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad, yObj); ctx.lineTo(w - pad, yObj); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#3498db'; ctx.font = '9px Rajdhani, sans-serif';
  ctx.fillText(`Objectif`, w - 60, yObj - 4);

  // Barres
  const largeurBarre = (w - 2 * pad) / 7 * 0.6;
  totauxParJour.forEach((jour, i) => {
    const x = pad + (w - 2 * pad) * i / 6 - largeurBarre / 2;
    const hauteur = (h - 2 * pad) * (jour.total / max);
    const y = h - pad - hauteur;
    const atteint = jour.total >= HYDRATATION.objectif;
    ctx.fillStyle = atteint ? '#27ae60' : jour.total > 0 ? '#3498db' : 'rgba(0,0,80,0.08)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, largeurBarre, hauteur, 3) : ctx.rect(x, y, largeurBarre, hauteur);
    ctx.fill();

    // Étiquette jour
    const label = new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short' });
    ctx.fillStyle = '#555555';
    ctx.font = '9px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + largeurBarre / 2, h - pad + 12);
    ctx.textAlign = 'left';
  });
}

// ── Helper setEl local ─────────────────────────────────────
function setElH(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Initialisation ─────────────────────────────────────────
async function initHydratation() {
  const params = chargerParametres();
  HYDRATATION.objectif = params.objectifEau || 1500;
  await rafraichirHydratation();
}
