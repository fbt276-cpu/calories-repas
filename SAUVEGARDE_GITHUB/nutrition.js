// ============================================================
// Nom du programme : NEXXAT - Calories Repas (nutrition.js)
// Auteur           : ODET François
// Société          : NEXXAT
// Copyright        : © NEXXAT - ODET François 2026
// Version          : v1.2.0
// Date de création : 2026-03-04 16:00:00
// Langage          : JavaScript ES2022
// Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/js/nutrition.js
// Sourcé par       : Claude IA
// ------------------------------------------------------------
// Historique des versions :
// v1.2.0 - 2026-03-04 - Création Phase 3 - Saisie aliments + macros + Nutri-Score + IG
// ============================================================

'use strict';

// ── Constantes ─────────────────────────────────────────────
const GROUPES_ALIMENTAIRES = [
  { id: 'viande',    label: '🥩 Viande / Poisson' },
  { id: 'oeufs',     label: '🥚 Œufs' },
  { id: 'laitier',   label: '🥛 Produits laitiers' },
  { id: 'cereales',  label: '🌾 Céréales / Féculents' },
  { id: 'legumes',   label: '🥦 Légumes' },
  { id: 'fruits',    label: '🍎 Fruits' },
  { id: 'legumineuses', label: '🫘 Légumineuses' },
  { id: 'matieres_grasses', label: '🧈 Matières grasses' },
  { id: 'boissons',  label: '🥤 Boissons' },
  { id: 'autres',    label: '🍽️ Autres' },
];

const REPAS_TYPES = [
  { id: 'petit_dejeuner', label: '☀️ Petit-déjeuner', icone: '☀️' },
  { id: 'dejeuner',       label: '🌤️ Déjeuner',       icone: '🌤️' },
  { id: 'diner',          label: '🌙 Dîner',           icone: '🌙' },
  { id: 'collation',      label: '🍎 Collation',       icone: '🍎' },
];

const UNITES = [
  { id: 'g',      label: 'grammes (g)' },
  { id: 'ml',     label: 'millilitres (ml)' },
  { id: 'unite',  label: 'unité(s)' },
  { id: 'tranche',label: 'tranche(s)' },
  { id: 'cuillere_cafe',   label: 'cuillère(s) à café' },
  { id: 'cuillere_soupe',  label: 'cuillère(s) à soupe' },
  { id: 'verre',  label: 'verre(s)' },
  { id: 'tasse',  label: 'tasse(s)' },
];

// AJR de référence (adulte moyen)
const AJR = {
  calories:   2000,
  proteines:  50,    // g
  glucides:   260,   // g
  lipides:    70,    // g
  sucres:     90,    // g
  fibres:     25,    // g
  sel:        6,     // g
  vitamineA:  800,   // µg
  vitamineB:  1.4,   // mg
  vitamineC:  80,    // mg
  vitamineD:  5,     // µg
  vitamineE:  12,    // mg
};

// ── Calcul Nutri-Score (algorithme simplifié officiel) ─────
function calculerNutriScore(aliment) {
  // Points négatifs (énergie, sucres, graisses saturées, sel)
  let pointsNegatifs = 0;

  // Énergie (kcal/100g)
  const kcal = aliment.calories || 0;
  if      (kcal <= 335)  pointsNegatifs += 0;
  else if (kcal <= 670)  pointsNegatifs += 1;
  else if (kcal <= 1005) pointsNegatifs += 2;
  else if (kcal <= 1340) pointsNegatifs += 3;
  else if (kcal <= 1675) pointsNegatifs += 4;
  else if (kcal <= 2010) pointsNegatifs += 5;
  else if (kcal <= 2345) pointsNegatifs += 6;
  else if (kcal <= 2680) pointsNegatifs += 7;
  else if (kcal <= 3015) pointsNegatifs += 8;
  else if (kcal <= 3350) pointsNegatifs += 9;
  else                   pointsNegatifs += 10;

  // Sucres (g/100g)
  const sucres = aliment.sucres || 0;
  if      (sucres <= 4.5)  pointsNegatifs += 0;
  else if (sucres <= 9)    pointsNegatifs += 1;
  else if (sucres <= 13.5) pointsNegatifs += 2;
  else if (sucres <= 18)   pointsNegatifs += 3;
  else if (sucres <= 22.5) pointsNegatifs += 4;
  else if (sucres <= 27)   pointsNegatifs += 5;
  else if (sucres <= 31)   pointsNegatifs += 6;
  else if (sucres <= 36)   pointsNegatifs += 7;
  else if (sucres <= 40)   pointsNegatifs += 8;
  else if (sucres <= 45)   pointsNegatifs += 9;
  else                     pointsNegatifs += 10;

  // Acides gras saturés (g/100g)
  const ags = aliment.agSatures || 0;
  if      (ags <= 1)   pointsNegatifs += 0;
  else if (ags <= 2)   pointsNegatifs += 1;
  else if (ags <= 3)   pointsNegatifs += 2;
  else if (ags <= 4)   pointsNegatifs += 3;
  else if (ags <= 5)   pointsNegatifs += 4;
  else if (ags <= 6)   pointsNegatifs += 5;
  else if (ags <= 7)   pointsNegatifs += 6;
  else if (ags <= 8)   pointsNegatifs += 7;
  else if (ags <= 9)   pointsNegatifs += 8;
  else if (ags <= 10)  pointsNegatifs += 9;
  else                 pointsNegatifs += 10;

  // Sel (g/100g)
  const sel = aliment.sel || 0;
  if      (sel <= 0.2)  pointsNegatifs += 0;
  else if (sel <= 0.4)  pointsNegatifs += 1;
  else if (sel <= 0.6)  pointsNegatifs += 2;
  else if (sel <= 0.8)  pointsNegatifs += 3;
  else if (sel <= 1.0)  pointsNegatifs += 4;
  else if (sel <= 1.2)  pointsNegatifs += 5;
  else if (sel <= 1.5)  pointsNegatifs += 6;
  else if (sel <= 1.8)  pointsNegatifs += 7;
  else if (sel <= 2.0)  pointsNegatifs += 8;
  else if (sel <= 2.2)  pointsNegatifs += 9;
  else                  pointsNegatifs += 10;

  // Points positifs (fibres, protéines)
  let pointsPositifs = 0;

  const fibres = aliment.fibres || 0;
  if      (fibres <= 0.9) pointsPositifs += 0;
  else if (fibres <= 1.9) pointsPositifs += 1;
  else if (fibres <= 2.8) pointsPositifs += 2;
  else if (fibres <= 3.7) pointsPositifs += 3;
  else if (fibres <= 4.7) pointsPositifs += 4;
  else                    pointsPositifs += 5;

  const proteines = aliment.proteines || 0;
  if      (proteines <= 1.6) pointsPositifs += 0;
  else if (proteines <= 3.2) pointsPositifs += 1;
  else if (proteines <= 4.8) pointsPositifs += 2;
  else if (proteines <= 6.4) pointsPositifs += 3;
  else if (proteines <= 8.0) pointsPositifs += 4;
  else                       pointsPositifs += 5;

  const score = pointsNegatifs - pointsPositifs;

  if      (score <= -1)  return { lettre: 'A', couleur: '#1a7b3f', bg: '#d4edda' };
  else if (score <= 2)   return { lettre: 'B', couleur: '#5a8f2a', bg: '#e8f5d3' };
  else if (score <= 10)  return { lettre: 'C', couleur: '#d4ac0d', bg: '#fef9e7' };
  else if (score <= 18)  return { lettre: 'D', couleur: '#e67e22', bg: '#fef0e6' };
  else                   return { lettre: 'E', couleur: '#c0392b', bg: '#fde8e6' };
}

// ── Catégorie indice glycémique ────────────────────────────
function categorieIG(ig) {
  if (!ig || ig === 0) return null;
  if (ig <= 35)  return { label: 'IG bas',   couleur: '#27ae60', icone: '🟢' };
  if (ig <= 55)  return { label: 'IG moyen', couleur: '#f39c12', icone: '🟡' };
  return               { label: 'IG élevé', couleur: '#e74c3c', icone: '🔴' };
}

// ── Ajuster calories selon quantité ───────────────────────
function ajusterValeurs(aliment, quantite) {
  const ratio = quantite / (aliment.quantiteRef || 100);
  return {
    calories:  Math.round((aliment.calories  || 0) * ratio),
    proteines: Math.round((aliment.proteines || 0) * ratio * 10) / 10,
    glucides:  Math.round((aliment.glucides  || 0) * ratio * 10) / 10,
    lipides:   Math.round((aliment.lipides   || 0) * ratio * 10) / 10,
    sucres:    Math.round((aliment.sucres    || 0) * ratio * 10) / 10,
    fibres:    Math.round((aliment.fibres    || 0) * ratio * 10) / 10,
    sel:       Math.round((aliment.sel       || 0) * ratio * 10) / 10,
  };
}

// ── Sauvegarder un aliment consommé ───────────────────────
async function enregistrerAliment(donnees) {
  if (!profilActif) { afficherNotification('Veuillez d\'abord créer un profil', 'erreur'); return; }

  const nutriscore = calculerNutriScore(donnees);
  const igCategorie = categorieIG(donnees.ig);

  const entree = {
    profilId:     profilActif.id,
    nom:          donnees.nom.trim(),
    quantite:     parseFloat(donnees.quantite),
    unite:        donnees.unite || 'g',
    repas:        donnees.repas || 'dejeuner',
    groupe:       donnees.groupe || 'autres',
    calories:     parseFloat(donnees.calories)  || 0,
    proteines:    parseFloat(donnees.proteines) || 0,
    glucides:     parseFloat(donnees.glucides)  || 0,
    lipides:      parseFloat(donnees.lipides)   || 0,
    sucres:       parseFloat(donnees.sucres)    || 0,
    agSatures:    parseFloat(donnees.agSatures) || 0,
    fibres:       parseFloat(donnees.fibres)    || 0,
    sel:          parseFloat(donnees.sel)       || 0,
    ig:           parseInt(donnees.ig)          || 0,
    vitamineA:    parseFloat(donnees.vitamineA) || 0,
    vitamineB:    parseFloat(donnees.vitamineB) || 0,
    vitamineC:    parseFloat(donnees.vitamineC) || 0,
    vitamineD:    parseFloat(donnees.vitamineD) || 0,
    vitamineE:    parseFloat(donnees.vitamineE) || 0,
    nutriScore:   nutriscore.lettre,
    date:         new Date().toISOString(),
    dateJour:     new Date().toISOString().split('T')[0],
  };

  const id = await dbAdd('repas', entree);
  await sauvegarderAlimentFavori(entree);
  afficherNotification(`${entree.nom} ajouté (${entree.calories} kcal) ✓`, 'succes');
  await rafraichirNutrition();
  return id;
}

// ── Sauvegarder dans la bibliothèque de favoris ────────────
async function sauvegarderAlimentFavori(entree) {
  try {
    const existants = await dbGetAll('aliments');
    const existant  = existants.find(a => a.nom.toLowerCase() === entree.nom.toLowerCase());
    const favori = {
      nom:       entree.nom,
      groupe:    entree.groupe,
      calories:  entree.calories,
      proteines: entree.proteines,
      glucides:  entree.glucides,
      lipides:   entree.lipides,
      sucres:    entree.sucres,
      agSatures: entree.agSatures,
      fibres:    entree.fibres,
      sel:       entree.sel,
      ig:        entree.ig,
      vitamineA: entree.vitamineA,
      vitamineB: entree.vitamineB,
      vitamineC: entree.vitamineC,
      vitamineD: entree.vitamineD,
      vitamineE: entree.vitamineE,
      nutriScore:    entree.nutriScore,
      quantiteRef:   entree.quantite,
      uniteRef:      entree.unite,
      utilisations:  existant ? (existant.utilisations || 0) + 1 : 1,
      dernierUsage:  new Date().toISOString(),
    };
    if (existant) { favori.id = existant.id; await dbPut('aliments', favori); }
    else          { await dbAdd('aliments', favori); }
  } catch (e) { console.warn('[NEXXAT] Favori :', e); }
}

// ── Charger repas du jour ──────────────────────────────────
async function chargerRepasJour() {
  if (!profilActif) return [];
  const aujourd_hui = new Date().toISOString().split('T')[0];
  const tous = await dbGetByIndex('repas', 'profilId', profilActif.id);
  return tous.filter(r => r.dateJour === aujourd_hui);
}

// ── Calculer totaux journaliers ────────────────────────────
function calculerTotaux(repas) {
  return repas.reduce((acc, r) => ({
    calories:  acc.calories  + (r.calories  || 0),
    proteines: acc.proteines + (r.proteines || 0),
    glucides:  acc.glucides  + (r.glucides  || 0),
    lipides:   acc.lipides   + (r.lipides   || 0),
    sucres:    acc.sucres    + (r.sucres    || 0),
    fibres:    acc.fibres    + (r.fibres    || 0),
    sel:       acc.sel       + (r.sel       || 0),
    vitamineA: acc.vitamineA + (r.vitamineA || 0),
    vitamineB: acc.vitamineB + (r.vitamineB || 0),
    vitamineC: acc.vitamineC + (r.vitamineC || 0),
    vitamineD: acc.vitamineD + (r.vitamineD || 0),
    vitamineE: acc.vitamineE + (r.vitamineE || 0),
  }), { calories:0, proteines:0, glucides:0, lipides:0, sucres:0, fibres:0, sel:0, vitamineA:0, vitamineB:0, vitamineC:0, vitamineD:0, vitamineE:0 });
}

// ── Rafraîchir l'affichage nutrition ──────────────────────
async function rafraichirNutrition() {
  const repasJour = await chargerRepasJour();
  const totaux    = calculerTotaux(repasJour);

  // Besoins caloriques du profil
  const besoins = profilActif
    ? calculerBesoinsCaloriques(
        calculerMetabolismeBase(profilActif.poids, profilActif.taille, profilActif.dateNaissance, profilActif.sexe),
        profilActif.niveauActivite
      )
    : AJR.calories;

  const restant = Math.max(0, besoins - totaux.calories);
  const pctCal  = Math.min(Math.round((totaux.calories / besoins) * 100), 100);

  // Calories
  setEl('nutri-calories-total',   `${Math.round(totaux.calories)} kcal`);
  setEl('nutri-calories-restant', `${Math.round(restant)} kcal restantes`);
  setEl('nutri-calories-objectif',`/ ${besoins} kcal`);
  setBarreProgression('barre-calories', pctCal, pctCal > 100 ? '#e74c3c' : '#ff8c00');

  // Macronutriments
  afficherMacro('proteines', totaux.proteines, AJR.proteines, '#3498db');
  afficherMacro('glucides',  totaux.glucides,  AJR.glucides,  '#e67e22');
  afficherMacro('lipides',   totaux.lipides,   AJR.lipides,   '#9b59b6');
  afficherMacro('fibres',    totaux.fibres,    AJR.fibres,    '#27ae60');

  // Vitamines
  afficherVitamine('A', totaux.vitamineA, AJR.vitamineA, 'µg');
  afficherVitamine('B', totaux.vitamineB, AJR.vitamineB, 'mg');
  afficherVitamine('C', totaux.vitamineC, AJR.vitamineC, 'mg');
  afficherVitamine('D', totaux.vitamineD, AJR.vitamineD, 'µg');
  afficherVitamine('E', totaux.vitamineE, AJR.vitamineE, 'mg');

  // Liste repas par type
  afficherListeRepas(repasJour);
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setBarreProgression(id, pct, couleur) {
  const el = document.getElementById(id);
  if (el) { el.style.width = `${Math.min(pct, 100)}%`; el.style.background = couleur; }
}

function afficherMacro(nom, valeur, ajr, couleur) {
  const pct = Math.min(Math.round((valeur / ajr) * 100), 100);
  setEl(`macro-${nom}-val`, `${Math.round(valeur * 10) / 10} g`);
  setEl(`macro-${nom}-pct`, `${pct}%`);
  setBarreProgression(`barre-${nom}`, pct, couleur);
}

function afficherVitamine(lettre, valeur, ajr, unite) {
  const pct = Math.min(Math.round((valeur / ajr) * 100), 100);
  const id  = `vitamine-${lettre}`;
  setEl(`${id}-val`, `${Math.round(valeur * 10) / 10} ${unite}`);
  setEl(`${id}-pct`, `${pct}%`);
  setBarreProgression(`barre-vit-${lettre}`, pct, pct >= 100 ? '#27ae60' : '#3498db');
}

// ── Afficher liste repas groupés par type ─────────────────
function afficherListeRepas(repasJour) {
  const container = document.getElementById('liste-repas-jour');
  if (!container) return;

  if (repasJour.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icone">🍽️</div><p>Aucun aliment enregistré aujourd\'hui.<br>Ajoutez votre premier repas !</p></div>';
    return;
  }

  // Grouper par type de repas
  const groupes = {};
  REPAS_TYPES.forEach(t => { groupes[t.id] = []; });
  repasJour.forEach(r => { if (groupes[r.repas]) groupes[r.repas].push(r); });

  container.innerHTML = REPAS_TYPES.map(type => {
    const items = groupes[type.id];
    if (items.length === 0) return '';
    const totalCal = items.reduce((s, r) => s + (r.calories || 0), 0);

    return `
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;
                    margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--nexxat-border);">
          <span style="font-family:'Orbitron',sans-serif;font-size:0.72rem;color:var(--nexxat-orange);">
            ${type.icone} ${type.label.split(' ')[1] || type.label}
          </span>
          <span style="font-size:0.75rem;color:var(--nexxat-muted);">${Math.round(totalCal)} kcal</span>
        </div>
        ${items.map(r => {
          const ns   = calculerNutriScore(r);
          const igCat = categorieIG(r.ig);
          return `
            <div style="display:flex;justify-content:space-between;align-items:center;
                        padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <div style="flex:1;">
                <div style="font-size:0.9rem;font-weight:600;">${r.nom}</div>
                <div style="font-size:0.72rem;color:var(--nexxat-muted);">
                  ${r.quantite} ${r.unite} · P:${r.proteines}g G:${r.glucides}g L:${r.lipides}g
                  ${igCat ? ` · ${igCat.icone} IG ${r.ig}` : ''}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <span style="background:${ns.bg};color:${ns.couleur};padding:2px 8px;
                             border-radius:6px;font-family:'Orbitron',sans-serif;
                             font-size:0.7rem;font-weight:700;">${ns.lettre}</span>
                <div style="text-align:right;">
                  <div style="font-family:'Orbitron',sans-serif;font-size:0.85rem;color:var(--nexxat-orange);">
                    ${Math.round(r.calories)} kcal
                  </div>
                  <button onclick="supprimerRepas(${r.id})"
                          style="background:none;border:none;color:var(--nexxat-muted);
                                 cursor:pointer;font-size:0.7rem;padding:0;">✕</button>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');
}

// ── Supprimer un repas ─────────────────────────────────────
async function supprimerRepas(id) {
  await dbDelete('repas', id);
  afficherNotification('Aliment supprimé', 'info');
  await rafraichirNutrition();
}

// ── Autocomplétion aliments favoris ───────────────────────
async function rechercherAlimentsFavoris(terme) {
  if (!terme || terme.length < 2) return [];
  const tous = await dbGetAll('aliments');
  return tous
    .filter(a => a.nom.toLowerCase().includes(terme.toLowerCase()))
    .sort((a, b) => (b.utilisations || 0) - (a.utilisations || 0))
    .slice(0, 8);
}

// ── Remplir formulaire depuis favori ──────────────────────
function remplirDepuisFavori(aliment) {
  const champs = ['calories','proteines','glucides','lipides','sucres','agSatures',
                  'fibres','sel','ig','vitamineA','vitamineB','vitamineC','vitamineD',
                  'vitamineE','groupe'];
  champs.forEach(champ => {
    const el = document.getElementById(`aliment-${champ}`);
    if (el && aliment[champ] !== undefined) el.value = aliment[champ];
  });
  const nomEl = document.getElementById('aliment-nom');
  if (nomEl) nomEl.value = aliment.nom;
  cacherSuggestions();
}

function cacherSuggestions() {
  const el = document.getElementById('suggestions-aliments');
  if (el) el.style.display = 'none';
}

// ── Gestionnaire autocomplétion ────────────────────────────
async function onNomAlimentInput(e) {
  const terme      = e.target.value;
  const resultats  = await rechercherAlimentsFavoris(terme);
  const container  = document.getElementById('suggestions-aliments');
  if (!container) return;

  if (resultats.length === 0) { container.style.display = 'none'; return; }

  container.style.display = 'block';
  container.innerHTML = resultats.map(a => `
    <div class="suggestion-item" onclick="remplirDepuisFavori(${JSON.stringify(a).replace(/"/g,'&quot;')})">
      <span>${a.nom}</span>
      <span style="color:var(--nexxat-muted);font-size:0.75rem;">${a.calories} kcal · NS:${a.nutriScore || '?'}</span>
    </div>`).join('');
}

// ── Gestionnaire formulaire ajout aliment ─────────────────
async function handleAjoutAliment(e) {
  e.preventDefault();

  const donnees = {
    nom:       document.getElementById('aliment-nom')?.value,
    quantite:  document.getElementById('aliment-quantite')?.value,
    unite:     document.getElementById('aliment-unite')?.value,
    repas:     document.getElementById('aliment-repas')?.value,
    groupe:    document.getElementById('aliment-groupe')?.value,
    calories:  document.getElementById('aliment-calories')?.value,
    proteines: document.getElementById('aliment-proteines')?.value,
    glucides:  document.getElementById('aliment-glucides')?.value,
    lipides:   document.getElementById('aliment-lipides')?.value,
    sucres:    document.getElementById('aliment-sucres')?.value,
    agSatures: document.getElementById('aliment-agSatures')?.value,
    fibres:    document.getElementById('aliment-fibres')?.value,
    sel:       document.getElementById('aliment-sel')?.value,
    ig:        document.getElementById('aliment-ig')?.value,
    vitamineA: document.getElementById('aliment-vitamineA')?.value,
    vitamineB: document.getElementById('aliment-vitamineB')?.value,
    vitamineC: document.getElementById('aliment-vitamineC')?.value,
    vitamineD: document.getElementById('aliment-vitamineD')?.value,
    vitamineE: document.getElementById('aliment-vitamineE')?.value,
  };

  if (!donnees.nom || !donnees.quantite || !donnees.calories) {
    afficherNotification('Nom, quantité et calories sont obligatoires', 'erreur');
    return;
  }

  await enregistrerAliment(donnees);
  document.getElementById('form-ajout-aliment')?.reset();
  document.getElementById('aliment-unite').value = 'g';
  document.getElementById('aliment-repas').value = 'dejeuner';
  cacherSuggestions();
  basculerFormulaireAliment(false);
}

// ── Afficher / masquer formulaire ─────────────────────────
function basculerFormulaireAliment(forcer) {
  const form    = document.getElementById('zone-form-aliment');
  const btnAjout = document.getElementById('btn-afficher-form');
  if (!form) return;
  const visible = forcer !== undefined ? forcer : form.style.display === 'none';
  form.style.display = visible ? 'block' : 'none';
  if (btnAjout) btnAjout.textContent = visible ? '✕ Annuler' : '＋ Ajouter un aliment';
}

// ── Initialisation nutrition ───────────────────────────────
async function initNutrition() {
  await rafraichirNutrition();

  // Écouter input nom pour autocomplétion
  const nomEl = document.getElementById('aliment-nom');
  if (nomEl) nomEl.addEventListener('input', onNomAlimentInput);

  // Masquer suggestions au clic extérieur
  document.addEventListener('click', e => {
    if (!e.target.closest('#zone-autocomplete')) cacherSuggestions();
  });
}
