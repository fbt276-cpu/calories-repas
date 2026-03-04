#!/bin/bash
# ============================================================
# Nom du programme : NEXXAT - Calories Repas (deploy.sh)
# Auteur           : ODET François
# Société          : NEXXAT
# Copyright        : © NEXXAT - ODET François 2026
# Version          : v1.0.0
# Date de création : 2026-03-04
# Langage          : Bash
# Chemin du fichier: /home/francois/Bureau/DOSSIER/CALORIES REPAS/scripts/deploy.sh
# Sourcé par       : Claude IA
# ------------------------------------------------------------
# Historique des versions :
# v1.0.0 - 2026-03-04 - Création initiale
# ============================================================

set -e

echo '╔══════════════════════════════════════════════════╗'
echo '║       NEXXAT - Calories Repas                    ║'
echo '║       Script de déploiement automatisé           ║'
echo '║       © NEXXAT - ODET François 2026 | v1.0.0    ║'
echo '║       Sourcé par Claude IA                       ║'
echo '╚══════════════════════════════════════════════════╝'
echo ''

# ── Chemins par défaut ─────────────────────────────────────
PROJET_DEFAUT="/home/francois/Bureau/DOSSIER/CALORIES REPAS"
TELECHARGEMENTS_DEFAUT="/home/francois/Téléchargements"

echo "📁 Chemin projet par défaut : $PROJET_DEFAUT"
read -p "   → Appuyez sur Entrée pour confirmer ou saisissez un autre chemin : " PROJET_SAISI
PROJET="${PROJET_SAISI:-$PROJET_DEFAUT}"

echo ''
echo "📥 Dossier Téléchargements par défaut : $TELECHARGEMENTS_DEFAUT"
read -p "   → Appuyez sur Entrée pour confirmer ou saisissez un autre chemin : " TELE_SAISI
TELECHARGEMENTS="${TELE_SAISI:-$TELECHARGEMENTS_DEFAUT}"

echo ''
echo "📂 Création de l'arborescence du projet..."

# ── Création des dossiers ──────────────────────────────────
mkdir -p "$PROJET/assets/css"
mkdir -p "$PROJET/assets/icons"
mkdir -p "$PROJET/js"
mkdir -p "$PROJET/Documentation"
mkdir -p "$PROJET/scripts"
mkdir -p "$PROJET/.well-known"

echo '✅ Structure créée.'
echo ''
echo '📦 Déplacement des fichiers depuis Téléchargements...'

# ── Déplacement des fichiers (mv = pas de doublon) ─────────
move_if_exists() {
  local src="$TELECHARGEMENTS/$1"
  local dst="$2"
  if [ -f "$src" ]; then
    mv "$src" "$dst"
    echo "  ✓ $1 → $dst"
  else
    echo "  ⚠️  $1 non trouvé dans Téléchargements (ignoré)"
  fi
}

move_if_exists "index.html"     "$PROJET/index.html"
move_if_exists "manifest.json"  "$PROJET/manifest.json"
move_if_exists "sw.js"          "$PROJET/sw.js"
move_if_exists "README.md"      "$PROJET/README.md"
move_if_exists ".gitignore"     "$PROJET/.gitignore"
move_if_exists "style.css"      "$PROJET/assets/css/style.css"
move_if_exists "app.js"         "$PROJET/js/app.js"
move_if_exists "db.js"          "$PROJET/js/db.js"
move_if_exists "profil.js"      "$PROJET/js/profil.js"
move_if_exists "deploy.sh"      "$PROJET/scripts/deploy.sh"

echo ''
echo '🔐 Configuration des permissions...'
chmod +x "$PROJET/scripts/deploy.sh"

# ── Sécurité keystore ──────────────────────────────────────
mkdir -p ~/NEXXAT_SECURITE
echo '🔒 Dossier ~/NEXXAT_SECURITE/ prêt pour le keystore Android.'

echo ''
echo '════════════════════════════════════════════════════'
echo '✅ Déploiement Phase 1 terminé !'
echo ''
echo "📁 Projet    : $PROJET"
echo '🌐 GitHub    : https://fbt276-cpu.github.io/calories-repas/'
echo '📦 Package   : com.nexxat.caloriesrepas'
echo ''
echo '📋 Prochaines étapes :'
echo '   1. Ouvrez index.html dans Chrome Android pour tester'
echo '   2. Vérifiez le splash screen NEXXAT (2 secondes)'
echo '   3. Créez votre profil'
echo '   4. Dites "OK validé" pour passer à la Phase 2'
echo '════════════════════════════════════════════════════'
