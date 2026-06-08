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

// Gestion de la connectivité réseau : affichage d'un bandeau d'alerte visible dans le DOM
window.addEventListener('offline', () => {
  document.title = '(Hors ligne) Badier Ride';
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'block';
});
window.addEventListener('online', () => {
  document.title = 'Badier Ride';
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'none';
});

// Vérifier l'état initial de la connexion
if (!navigator.onLine) {
  document.title = '(Hors ligne) Badier Ride';
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'block';
}
