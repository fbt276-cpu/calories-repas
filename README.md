# NEXXAT - Calories Repas

**© NEXXAT - ODET François 2026 · Sourcé par Claude IA · v1.0.0**

---

## Description

Application Progressive Web App (PWA) Android de suivi nutritionnel, calorique et de santé.

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/fbt276-cpu/calories-repas.git

# Déployer avec le script automatisé
bash scripts/deploy.sh
```

## Accès

- **PWA** : https://fbt276-cpu.github.io/calories-repas/
- **APK** : https://github.com/fbt276-cpu/calories-repas/releases/latest

## Phases développées

- [x] **Phase 1** - Profil utilisateur + Suivi poids + IMC (v1.0.0)
- [ ] Phase 2 - Podomètre
- [ ] Phase 3 - Nutrition
- [ ] ...

## Stack technique

| Composant | Technologie |
|---|---|
| Interface | HTML5 / CSS3 / JS (PWA) |
| Stockage | IndexedDB (local) |
| Service Worker | Cache-first offline |
| Police | Orbitron + Rajdhani |

## Historique des versions

### v1.0.0 - 2026-03-04
- Création initiale Phase 1
- Profil utilisateur (nom, prénom, âge, sexe, taille, poids)
- Calcul IMC + catégorie + barre visuelle
- Suivi poids quotidien + historique
- Graphique d'évolution du poids (canvas)
- Calcul besoins caloriques (Mifflin-St Jeor)
- Tendance poids (↗️ ↘️ ➡️)
- Objectif poids + progression
- Mode hors-ligne (Service Worker)
- Charte graphique NEXXAT (Orbitron, orange #ff8c00)

---

*© NEXXAT - ODET François 2026 · Sourcé par Claude IA v1.5.0*
