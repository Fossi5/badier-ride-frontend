// src/utils/mapUtils.js

/**
 * Calcule la distance à vol d'oiseau entre deux points GPS (formule de Haversine)
 * @param {number} lat1 - Latitude du point 1
 * @param {number} lon1 - Longitude du point 1
 * @param {number} lat2 - Latitude du point 2
 * @param {number} lon2 - Longitude du point 2
 * @returns {number} Distance en kilomètres
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Rayon de la Terre en kilomètres
  const R = 6371;

  // Conversion des degrés en radians
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Regroupe des points géographiques proches
 * @param {Array} points - Liste de points avec lat et lng
 * @param {number} maxDistance - Distance maximale en km pour regrouper
 * @returns {Array} Points regroupés
 */
export const clusterPoints = (points, maxDistance = 0.2) => {
  if (!points || points.length === 0) return [];

  const clusters = [];
  const visited = new Set();

  points.forEach((point, index) => {
    if (visited.has(index)) return;

    visited.add(index);
    const cluster = [point];

    points.forEach((otherPoint, otherIndex) => {
      if (index === otherIndex || visited.has(otherIndex)) return;

      const distance = calculateDistance(
        point.lat,
        point.lng,
        otherPoint.lat,
        otherPoint.lng,
      );

      if (distance <= maxDistance) {
        cluster.push(otherPoint);
        visited.add(otherIndex);
      }
    });

    clusters.push(cluster);
  });

  // Convertir les clusters en points représentatifs (centroïdes)
  return clusters.map((cluster) => {
    if (cluster.length === 1) return cluster[0];

    // Calculer le centroïde du cluster
    const totalLat = cluster.reduce((sum, p) => sum + p.lat, 0);
    const totalLng = cluster.reduce((sum, p) => sum + p.lng, 0);

    return {
      lat: totalLat / cluster.length,
      lng: totalLng / cluster.length,
      count: cluster.length,
      points: cluster,
    };
  });
};

/**
 * Calcule le centre et le zoom idéal pour afficher un ensemble de points
 * @param {Array} points - Liste de points avec lat et lng
 * @param {object} options - Options pour le calcul
 * @returns {object} Centre et zoom optimal
 */
export const calculateMapBounds = (points, options = {}) => {
  if (!points || points.length === 0) {
    // Valeurs par défaut (Paris)
    return {
      center: [48.8566, 2.3522],
      zoom: 13,
    };
  }

  const { padding = 0.1 } = options;

  // Extraire les latitudes et longitudes
  const lats = points.map((p) => p.lat || p.latitude);
  const lngs = points.map((p) => p.lng || p.longitude);

  // Calculer les bornes
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Ajouter un padding
  const latPadding = (maxLat - minLat) * padding;
  const lngPadding = (maxLng - minLng) * padding;

  const southWest = [minLat - latPadding, minLng - lngPadding];
  const northEast = [maxLat + latPadding, maxLng + lngPadding];

  // Calculer le centre
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculer le zoom approprié (logique simplifiée)
  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;
  const maxRange = Math.max(latRange, lngRange);

  let zoom = 13; // zoom par défaut

  if (maxRange > 0.2) zoom = 12;
  if (maxRange > 0.5) zoom = 11;
  if (maxRange > 1) zoom = 10;
  if (maxRange > 2) zoom = 9;
  if (maxRange > 5) zoom = 8;
  if (maxRange > 10) zoom = 7;
  if (maxRange > 20) zoom = 6;

  return {
    center: [centerLat, centerLng],
    zoom,
    bounds: [southWest, northEast],
  };
};

/**
 * Génère une couleur pour un segment de route en fonction de sa position dans l'itinéraire
 * Dégradé de vert (début) vers rouge (fin) en passant par jaune/orange
 * @param {number} index - Index du segment (0-based)
 * @param {number} total - Nombre total de segments
 * @returns {string} Code couleur hexadécimal
 */
export const getSegmentColor = (index, total) => {
  if (total <= 1) return "#1976d2"; // Bleu par défaut si un seul segment

  // Calculer le pourcentage de progression (0 à 1)
  const progress = index / (total - 1);

  // Interpolation de couleur du vert au rouge
  let r, g, b;

  if (progress <= 0.5) {
    // Première moitié : vert (#22c55e) vers jaune (#fbbf24)
    const localProgress = progress * 2; // 0 à 1
    r = Math.round(34 + (251 - 34) * localProgress);
    g = Math.round(197 + (191 - 197) * localProgress);
    b = Math.round(94 + (36 - 94) * localProgress);
  } else {
    // Deuxième moitié : jaune (#fbbf24) vers rouge (#ef4444)
    const localProgress = (progress - 0.5) * 2; // 0 à 1
    r = Math.round(251 + (239 - 251) * localProgress);
    g = Math.round(191 + (68 - 191) * localProgress);
    b = Math.round(36 + (68 - 36) * localProgress);
  }

  // Convertir en hexadécimal
  const toHex = (value) => {
    const hex = Math.round(value).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Crée des segments de route avec des couleurs différentes pour visualiser l'ordre
 * @param {Array} points - Liste de positions [lat, lng]
 * @returns {Array} Segments avec positions et couleurs
 */
export const createColoredRouteSegments = (points) => {
  if (!points || points.length < 2) return [];

  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    segments.push({
      positions: [points[i], points[i + 1]],
      color: getSegmentColor(i, points.length - 1),
      index: i,
    });
  }

  return segments;
};

/**
 * Obtient la position actuelle de l'utilisateur
 * @returns {Promise} Promise avec la position (lat, lng)
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "La géolocalisation n'est pas prise en charge par ce navigateur.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = "Erreur lors de la récupération de la position";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position indisponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai de géolocalisation dépassé";
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
};
