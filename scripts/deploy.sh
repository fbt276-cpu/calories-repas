#!/bin/bash
# ============================================================
# Nom du programme : NEXXAT - Calories Repas (deploy.sh)
# Auteur           : ODET François
# Société          : NEXXAT
# Copyright        : © NEXXAT - ODET François 2026
# Version          : v1.3.0
# Date de création : 2026-03-04
# Langage          : Bash
# Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/scripts/deploy.sh
# Sourcé par       : Claude IA
# ------------------------------------------------------------
# Historique des versions :
# v1.3.0 - 2026-03-04 - Phase 4 Hydratation + nettoyage Téléchargements
# v1.2.1 - Phase 3 | v1.1.0 - Phase 2 | v1.0.0 - Phase 1
# ============================================================

set -e

echo '╔══════════════════════════════════════════════════╗'
echo '║       NEXXAT - Calories Repas                    ║'
echo '║       Déploiement v1.3.0 — Phase 4               ║'
echo '║       © NEXXAT - ODET François 2026              ║'
echo '╚══════════════════════════════════════════════════╝'
echo ''

PROJET_DEFAUT="/home/francois/Bureau/DOSSIER/CALORIES REPAS"
TELE_DEFAUT="/home/francois/Téléchargements"

read -p "📁 Chemin projet    [Entrée = défaut] : " PROJET_SAISI
PROJET="${PROJET_SAISI:-$PROJET_DEFAUT}"

read -p "📥 Téléchargements  [Entrée = défaut] : " TELE_SAISI
TELECHARGEMENTS="${TELE_SAISI:-$TELE_DEFAUT}"

SAUVEGARDE="$PROJET/SAUVEGARDE_GITHUB"

echo ''
echo '📂 Création de la structure...'
mkdir -p "$PROJET/assets/css"
mkdir -p "$PROJET/assets/icons"
mkdir -p "$PROJET/js"
mkdir -p "$PROJET/Documentation"
mkdir -p "$PROJET/scripts"
mkdir -p "$PROJET/.well-known"
mkdir -p "$SAUVEGARDE"
mkdir -p ~/NEXXAT_SECURITE

# Liste fichier => destination
NOMS=(
  "index.html"
  "manifest.json"
  "sw.js"
  "README.md"
  ".gitignore"
  "style.css"
  "app.js"
  "db.js"
  "profil.js"
  "podometre.js"
  "parametres.js"
  "nutrition.js"
  "hydratation.js"
  "deploy.sh"
)

DESTS=(
  "$PROJET/index.html"
  "$PROJET/manifest.json"
  "$PROJET/sw.js"
  "$PROJET/README.md"
  "$PROJET/.gitignore"
  "$PROJET/assets/css/style.css"
  "$PROJET/js/app.js"
  "$PROJET/js/db.js"
  "$PROJET/js/profil.js"
  "$PROJET/js/podometre.js"
  "$PROJET/js/parametres.js"
  "$PROJET/js/nutrition.js"
  "$PROJET/js/hydratation.js"
  "$PROJET/scripts/deploy.sh"
)

# ── Étape 1 : Copie sauvegarde ────────────────────────────
echo ''
echo '📋 Copie sauvegarde → SAUVEGARDE_GITHUB/...'
for i in "${!NOMS[@]}"; do
  src="$TELECHARGEMENTS/${NOMS[$i]}"
  if [ -f "$src" ]; then
    cp "$src" "$SAUVEGARDE/${NOMS[$i]}"
    echo "  📋 ${NOMS[$i]}"
  fi
done

# ── Étape 2 : Déplacement mv (sans doublon) ───────────────
echo ''
echo '📦 Déplacement vers le projet...'
for i in "${!NOMS[@]}"; do
  src="$TELECHARGEMENTS/${NOMS[$i]}"
  dst="${DESTS[$i]}"
  if [ -f "$src" ]; then
    mv "$src" "$dst"
    echo "  ✓ ${NOMS[$i]} → $dst"
  else
    echo "  ⚠️  ${NOMS[$i]} non trouvé (ignoré)"
  fi
done

# ── Étape 3 : Vérification nettoyage ─────────────────────
echo ''
echo '🔍 Vérification Téléchargements...'
RESTES=0
for nom in "${NOMS[@]}"; do
  if [ -f "$TELECHARGEMENTS/$nom" ]; then
    echo "  ⚠️  ENCORE PRÉSENT : $nom"
    RESTES=$((RESTES + 1))
  fi
done
if [ "$RESTES" -eq 0 ]; then
  echo '  ✅ Téléchargements propre — aucun fichier du projet restant.'
else
  echo "  ⚠️  $RESTES fichier(s) non déplacé(s)."
fi

chmod +x "$PROJET/scripts/deploy.sh" 2>/dev/null || true

# ── Étape 4 : Publication GitHub ──────────────────────────
echo ''
echo '🚀 Publication GitHub (branche master)...'
cd "$PROJET"
git add .
git commit -m "NEXXAT - Calories Repas v1.3.0 - Phase 4 - Hydratation" 2>/dev/null || echo '  (rien de nouveau à valider)'
git push origin master

echo ''
echo '════════════════════════════════════════════════════'
echo '✅ Déploiement v1.3.0 terminé !'
echo ''
echo "🌐 https://fbt276-cpu.github.io/calories-repas/"
echo "📋 Sauvegarde : $SAUVEGARDE"
echo '════════════════════════════════════════════════════'
