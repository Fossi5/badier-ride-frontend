// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Configuration pour les icônes Leaflet (si vous utilisez Leaflet)
import { Icon } from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet
Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

// Création de la racine React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendu de l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Fonction pour vérifier la connexion réseau
const checkNetworkStatus = () => {
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    console.warn('Connexion internet perdue. Certaines fonctionnalités peuvent ne pas fonctionner correctement.');
    // Vous pouvez également afficher une notification dans l'UI
  }
};

// Écouteurs d'événements pour la connectivité réseau
window.addEventListener('online', checkNetworkStatus);
window.addEventListener('offline', checkNetworkStatus);

// Vérifier l'état initial de la connexion
checkNetworkStatus();
