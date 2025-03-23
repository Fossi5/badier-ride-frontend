# Guide d'installation et d'utilisation du frontend Badier Ride

Ce guide vous aidera à installer et configurer le frontend de l'application Badier Ride, qui est conçu pour fonctionner avec votre backend existant.

## Prérequis

- Node.js v14.0.0 ou supérieur
- npm v6.0.0 ou supérieur
- Backend Badier Ride en cours d'exécution sur http://localhost:8080/api

## Étape 1 : Configurer le projet

Commencez par créer un nouveau projet React :

```bash
# Créer le projet React
npx create-react-app badier-ride-frontend

# Naviguer dans le dossier du projet
cd badier-ride-frontend
```

## Étape 2 : Installer les dépendances

Installez les bibliothèques nécessaires pour le projet :

```bash
# Installer les dépendances principales
npm install axios react-router-dom
npm install react-leaflet leaflet
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-hook-form
npm install jwt-decode
npm install date-fns
```

## Étape 3 : Organiser la structure du projet

Créez les dossiers suivants dans le répertoire `src/` :

```bash
mkdir -p src/api src/components/common src/components/maps src/components/forms src/components/tables src/components/dashboard
mkdir -p src/pages/auth src/pages/admin src/pages/dispatcher src/pages/driver
mkdir -p src/context src/utils src/styles
```

## Étape 4 : Copier les fichiers du code source

Copiez tous les fichiers fournis dans leurs dossiers respectifs, conformément à la structure du projet.

Par exemple :

- `api/axios.js` → `src/api/axios.js`
- `context/AuthContext.jsx` → `src/context/AuthContext.jsx`
- `components/common/Header.jsx` → `src/components/common/Header.jsx`
- etc.

## Étape 5 : Configurer l'API

Ouvrez le fichier `src/api/axios.js` et vérifiez que l'URL de base est correctement définie :

```javascript
const BASE_URL = "http://localhost:8080/api";
```

Modifiez-la si votre backend est accessible à une adresse différente.

## Étape 6 : Démarrer l'application

Une fois tous les fichiers en place, démarrez l'application :

```bash
npm run dev
```

L'application sera accessible à l'adresse http://localhost:3000.

## Authentification

Utilisez les identifiants suivants pour vous connecter (selon votre configuration backend) :

- **Admin** : username: admin, password: password
- **Chauffeur** : username et mot de passe que vous avez configurés
- **Répartiteur** : username et mot de passe que vous avez configurés

## Fonctionnalités par rôle

### Administrateur

- Gestion des chauffeurs et répartiteurs
- Vue d'ensemble du système

### Répartiteur

- Gestion des tournées
- Optimisation des itinéraires
- Suivi des livraisons

### Chauffeur

- Visualisation des tournées assignées
- Mise à jour du statut des livraisons
- Navigation GPS vers les points de livraison

## Résolution des problèmes courants

### Problème de connexion à l'API

Si vous rencontrez des erreurs de connexion à l'API, vérifiez :

- Que votre backend est en cours d'exécution
- Que les URL d'API sont correctes
- Les erreurs CORS (peut nécessiter une configuration côté backend)

### Erreurs d'affichage de la carte

Si la carte Leaflet ne s'affiche pas correctement :

- Vérifiez que les coordonnées GPS sont valides dans vos objets d'adresse
- Assurez-vous que les feuilles de style Leaflet sont bien importées

### Problèmes d'authentification

Si vous ne pouvez pas vous connecter :

- Vérifiez que les API d'authentification fonctionnent côté backend
- Assurez-vous que le token JWT est correctement stocké et envoyé dans les en-têtes

## Personnalisation

Vous pouvez personnaliser le thème de l'application en modifiant le fichier `src/App.jsx`. Recherchez la section `createTheme` et ajustez les couleurs et la typographie selon vos préférences.
