#!/bin/bash
# ============================================================
# Nom du programme : NEXXAT - Calories Repas (deploy.sh)
# Auteur           : ODET François
# Société          : NEXXAT
# Copyright        : © NEXXAT - ODET François 2026
# Version          : v1.2.1
# Date de création : 2026-03-04
# Sourcé par       : Claude IA
# ------------------------------------------------------------
# Historique des versions :
# v1.2.1 - 2026-03-04 - Copie sauvegarde + mv vers projet
# v1.2.0 - 2026-03-04 - Phase 3 Nutrition
# v1.1.0 - Phase 2 | v1.0.0 - Phase 1
# ============================================================

set -e

echo '╔══════════════════════════════════════════════════╗'
echo '║       NEXXAT - Calories Repas                    ║'
echo '║       Déploiement v1.2.1                         ║'
echo '║       © NEXXAT - ODET François 2026              ║'
echo '╚══════════════════════════════════════════════════╝'
echo ''

PROJET_DEFAUT="/home/francois/Bureau/DOSSIER/CALORIES REPAS"
TELECHARGEMENTS_DEFAUT="/home/francois/Téléchargements"
SAUVEGARDE_DEFAUT="/home/francois/Bureau/DOSSIER/CALORIES REPAS/SAUVEGARDE_GITHUB"

read -p "📁 Chemin projet [Entrée = défaut] : " PROJET_SAISI
PROJET="${PROJET_SAISI:-$PROJET_DEFAUT}"

read -p "📥 Téléchargements [Entrée = défaut] : " TELE_SAISI
TELECHARGEMENTS="${TELE_SAISI:-$TELECHARGEMENTS_DEFAUT}"

echo ''
echo '📂 Création de la structure...'
mkdir -p "$PROJET/assets/css"
mkdir -p "$PROJET/assets/icons"
mkdir -p "$PROJET/js"
mkdir -p "$PROJET/Documentation"
mkdir -p "$PROJET/scripts"
mkdir -p "$PROJET/.well-known"
mkdir -p "$SAUVEGARDE_DEFAUT"

echo ''
echo '📋 Copie de sauvegarde GitHub dans SAUVEGARDE_GITHUB/...'

copy_if_exists() {
  local src="$TELECHARGEMENTS/$1"
  if [ -f "$src" ]; then
    cp "$src" "$SAUVEGARDE_DEFAUT/$1" && echo "  📋 $1 → SAUVEGARDE_GITHUB/"
  fi
}

for f in index.html manifest.json sw.js README.md .gitignore style.css app.js db.js profil.js podometre.js parametres.js nutrition.js deploy.sh; do
  copy_if_exists "$f"
done

echo ''
echo '📦 Déplacement vers le projet (mv — sans doublon)...'

move_if_exists() {
  local src="$TELECHARGEMENTS/$1"
  local dst="$2"
  if [ -f "$src" ]; then
    mv "$src" "$dst" && echo "  ✓ $1 → $dst"
  else
    echo "  ⚠️  $1 non trouvé (ignoré)"
  fi
}

move_if_exists "index.html"    "$PROJET/index.html"
move_if_exists "manifest.json" "$PROJET/manifest.json"
move_if_exists "sw.js"         "$PROJET/sw.js"
move_if_exists "README.md"     "$PROJET/README.md"
move_if_exists ".gitignore"    "$PROJET/.gitignore"
move_if_exists "style.css"     "$PROJET/assets/css/style.css"
move_if_exists "app.js"        "$PROJET/js/app.js"
move_if_exists "db.js"         "$PROJET/js/db.js"
move_if_exists "profil.js"     "$PROJET/js/profil.js"
move_if_exists "podometre.js"  "$PROJET/js/podometre.js"
move_if_exists "parametres.js" "$PROJET/js/parametres.js"
move_if_exists "nutrition.js"  "$PROJET/js/nutrition.js"
move_if_exists "deploy.sh"     "$PROJET/scripts/deploy.sh"

chmod +x "$PROJET/scripts/deploy.sh"
mkdir -p ~/NEXXAT_SECURITE

echo ''
echo '🚀 Publication sur GitHub...'
cd "$PROJET"
git add .
git commit -m "NEXXAT - Calories Repas v1.2.1 - Bleu marine + Phase 3" || echo "  (rien à valider)"
git push origin master

echo ''
echo '════════════════════════════════════════════════════'
echo '✅ Déploiement v1.2.1 terminé !'
echo ''
echo "🌐 PWA : https://fbt276-cpu.github.io/calories-repas/"
echo "📋 Sauvegardes : $SAUVEGARDE_DEFAUT"
echo '════════════════════════════════════════════════════'
