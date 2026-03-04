#!/bin/bash
# ============================================================
# Nom du programme : NEXXAT - Calories Repas (deploy.sh)
# Auteur           : ODET François
# Société          : NEXXAT
# Copyright        : © NEXXAT - ODET François 2026
# Version          : v1.1.0
# Date de création : 2026-03-04 14:00:00
# Langage          : Bash
# Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/scripts/deploy.sh
# Sourcé par       : Claude IA
# ------------------------------------------------------------
# Historique des versions :
# v1.1.0 - 2026-03-04 - Phase 2 : podometre.js + parametres.js
# v1.0.0 - 2026-03-04 - Création initiale
# ============================================================

set -e

echo '╔══════════════════════════════════════════════════╗'
echo '║       NEXXAT - Calories Repas                    ║'
echo '║       Déploiement Phase 2 — v1.1.0               ║'
echo '║       © NEXXAT - ODET François 2026              ║'
echo '╚══════════════════════════════════════════════════╝'
echo ''

PROJET_DEFAUT="/home/francois/Bureau/DOSSIER/CALORIES REPAS"
TELECHARGEMENTS_DEFAUT="/home/francois/Téléchargements"

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

echo '📦 Déplacement des fichiers (mv — sans doublon)...'

move_if_exists() {
  local src="$TELECHARGEMENTS/$1"
  local dst="$2"
  if [ -f "$src" ]; then
    mv "$src" "$dst" && echo "  ✓ $1"
  else
    echo "  ⚠️  $1 non trouvé (ignoré)"
  fi
}

# Fichiers racine
move_if_exists "index.html"    "$PROJET/index.html"
move_if_exists "manifest.json" "$PROJET/manifest.json"
move_if_exists "sw.js"         "$PROJET/sw.js"
move_if_exists "README.md"     "$PROJET/README.md"
move_if_exists ".gitignore"    "$PROJET/.gitignore"

# CSS
move_if_exists "style.css"     "$PROJET/assets/css/style.css"

# JS
move_if_exists "app.js"        "$PROJET/js/app.js"
move_if_exists "db.js"         "$PROJET/js/db.js"
move_if_exists "profil.js"     "$PROJET/js/profil.js"
move_if_exists "podometre.js"  "$PROJET/js/podometre.js"
move_if_exists "parametres.js" "$PROJET/js/parametres.js"

# Script
move_if_exists "deploy.sh"     "$PROJET/scripts/deploy.sh"

chmod +x "$PROJET/scripts/deploy.sh"
mkdir -p ~/NEXXAT_SECURITE

echo ''
echo '🚀 Publication sur GitHub...'
cd "$PROJET"
git add .
git commit -m "NEXXAT - Calories Repas v1.1.0 - Phase 2 - Podomètre + Paramètres + Date naissance + Thème doux" || echo "  (rien à valider)"
git push origin master

echo ''
echo '════════════════════════════════════════════════════'
echo '✅ Phase 2 déployée !'
echo ''
echo "🌐 PWA : https://fbt276-cpu.github.io/calories-repas/"
echo ''
echo '✨ Nouveautés Phase 2 :'
echo '   👟 Podomètre automatique (accéléromètre Android)'
echo '   📅 Date de naissance → âge calculé automatiquement'
echo '   🎂 Message anniversaire automatique'
echo '   ⚙️  Page Paramètres (langue, unités, objectif pas)'
echo '   🎨 Thème plus doux (fond bleu ardoise)'
echo '════════════════════════════════════════════════════'
