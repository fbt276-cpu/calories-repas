# NEXXAT - Calories Repas
# SPÉCIFICATIONS TECHNIQUES
# © NEXXAT - ODET François 2026 · v1.0.0

---

## 1. ARCHITECTURE

```
PWA Android (Chrome)
    ↕
IndexedDB (local)
    ↕
Service Worker (cache offline)
```

## 2. STACK TECHNIQUE

| Composant       | Technologie              | Version  |
|-----------------|--------------------------|----------|
| Interface       | HTML5 / CSS3 / JS        | ES2022   |
| Stockage        | IndexedDB                | Natif    |
| Offline         | Service Worker           | v1.0.0   |
| Police          | Orbitron + Rajdhani      | Google Fonts |
| Graphiques      | Canvas 2D API            | Natif    |
| PWA             | Web App Manifest         | v1.0.0   |

## 3. STRUCTURE FICHIERS

```
CALORIES REPAS/
├── assets/
│   ├── css/style.css
│   └── icons/{icon-192.png, icon-512.png}
├── js/
│   ├── app.js       ← Logique principale + navigation
│   ├── db.js        ← IndexedDB (CRUD)
│   └── profil.js    ← Profil + Poids + IMC + Graphiques
├── Documentation/
├── scripts/deploy.sh
├── index.html
├── manifest.json
├── sw.js
└── .gitignore
```

## 4. BASE DE DONNÉES IndexedDB

### Store : profils
| Champ          | Type    | Description              |
|----------------|---------|--------------------------|
| id             | Auto    | Clé primaire             |
| nom            | String  | Nom de famille           |
| prenom         | String  | Prénom                   |
| age            | Number  | Âge en années            |
| sexe           | String  | H ou F                   |
| taille         | Number  | Taille en cm             |
| poids          | Number  | Poids actuel en kg       |
| objectifPoids  | Number  | Objectif en kg           |
| niveauActivite | String  | sedentaire/leger/modere… |
| actif          | Number  | 1 = profil actif         |
| dateCreation   | ISO String | Date de création      |

### Store : poids
| Champ     | Type      | Description         |
|-----------|-----------|---------------------|
| id        | Auto      | Clé primaire        |
| profilId  | Number    | Référence profil    |
| poids     | Number    | Poids en kg         |
| date      | ISO String | Date/heure mesure  |
| dateJour  | String    | YYYY-MM-DD          |

## 5. FORMULES

### IMC
```
IMC = poids(kg) / (taille(m))²
```

### Métabolisme de base (Mifflin-St Jeor)
```
Homme : MB = (10 × poids) + (6.25 × taille) - (5 × âge) + 5
Femme : MB = (10 × poids) + (6.25 × taille) - (5 × âge) - 161
```

### Besoins caloriques
```
Besoins = MB × facteur_activité
Sédentaire: 1.2 | Léger: 1.375 | Modéré: 1.55 | Actif: 1.725 | Très actif: 1.9
```

## 6. DÉPLOIEMENT

- **Hébergement** : GitHub Pages (HTTPS gratuit)
- **URL PWA** : https://fbt276-cpu.github.io/calories-repas/
- **APK** : Bubblewrap TWA (com.nexxat.caloriesrepas)
- **Keystore** : ~/NEXXAT_SECURITE/calories-repas-release.keystore

---

*© NEXXAT - ODET François 2026 · Sourcé par Claude IA v1.5.0*
