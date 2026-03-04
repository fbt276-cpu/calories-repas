# NEXXAT - Calories Repas
# SPÉCIFICATIONS FONCTIONNELLES
# © NEXXAT - ODET François 2026 · v1.0.0

---

## 1. OBJECTIF

Application PWA Android de suivi nutritionnel et de santé, fonctionnant 100% en local, sans coût serveur.

---

## 2. FONCTIONNALITÉS PHASE 1

### 2.1 Profil utilisateur
- Saisie : prénom, nom, sexe, âge, taille (cm), poids (kg), objectif poids
- Niveau d'activité physique (5 niveaux)
- Stockage local IndexedDB
- Mode multi-utilisateurs (phases ultérieures)

### 2.2 Suivi du poids
- Enregistrement quotidien du poids
- Historique complet avec date/heure
- Tendance : ↗️ prise / ↘️ perte / ➡️ stable (seuil ±0.2 kg)
- Objectif poids avec progression

### 2.3 Calcul IMC
- Formule : IMC = poids / (taille en m)²
- Catégories : Dénutrition / Insuffisance / Normal / Surpoids / Obésité
- Barre visuelle colorée avec curseur
- Code couleur : vert (normal), orange (surpoids), rouge (obésité)

### 2.4 Besoins caloriques
- Formule Mifflin-St Jeor (métabolisme de base)
- Ajustement selon niveau d'activité (facteur MET)
- Affiché en kcal/jour

### 2.5 Graphique d'évolution
- Canvas HTML5 natif
- Courbe orange sur fond sombre
- Ligne objectif en vert pointillé
- Axes avec valeurs

---

## 3. RÈGLES MÉTIER

- IMC < 18.5 → alerte insuffisance pondérale
- IMC > 30 → alerte obésité
- Seuil tendance poids : ±0.2 kg entre deux mesures
- Poids valide : 20–300 kg
- Taille valide : 100–250 cm
- Âge valide : 10–120 ans

---

## 4. INTERFACE

- Design NEXXAT : fond sombre #0d0d1a, orange #ff8c00
- Police Orbitron (titres) + Rajdhani (texte)
- Navigation par onglets bas (Accueil / Poids / Profil)
- Splash screen NEXXAT 2 secondes au démarrage
- Responsive mobile-first

---

*© NEXXAT - ODET François 2026 · Sourcé par Claude IA v1.5.0*
