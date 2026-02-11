// src/utils/navigationUtils.js
/**
 * Utilitaires pour la navigation externe (Google Maps, Waze, Apple Plans)
 */

/**
 * Détecte si l'utilisateur est sur mobile ou desktop
 * @returns {boolean} true si mobile/tablette, false si desktop
 */
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Détection mobile/tablette
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase(),
  );
};

/**
 * Détecte si l'utilisateur est sur iOS
 * @returns {boolean} true si iOS
 */
export const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

/**
 * Génère l'URL Google Maps pour un itinéraire multi-points
 * @param {Array<{position: [number, number], clientName: string}>} points - Points de livraison
 * @param {[number, number]|null} origin - Point de départ (position du chauffeur)
 * @returns {string} URL Google Maps
 */
export const getGoogleMapsUrl = (points, origin = null) => {
  if (!points || points.length === 0) return null;

  // Format: https://www.google.com/maps/dir/?api=1&origin=lat,lng&destination=lat,lng&waypoints=lat,lng|lat,lng

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  // Point de départ : position du chauffeur ou premier point
  const originCoords = origin
    ? `${origin[0]},${origin[1]}`
    : `${firstPoint.position[0]},${firstPoint.position[1]}`;

  // Destination : dernier point
  const destination = `${lastPoint.position[0]},${lastPoint.position[1]}`;

  // Points intermédiaires (waypoints)
  const waypoints = points
    .slice(origin ? 0 : 1, -1) // Si origin, inclure le premier point, sinon l'exclure
    .map((p) => `${p.position[0]},${p.position[1]}`)
    .join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destination}`;

  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }

  url += "&travelmode=driving";

  return url;
};

/**
 * Génère l'URL Waze pour un itinéraire
 * Note: Waze ne supporte qu'une destination à la fois, pas de waypoints
 * @param {[number, number]} destination - Coordonnées de destination
 * @returns {string} URL Waze
 */
export const getWazeUrl = (destination) => {
  if (!destination) return null;

  // Format: https://waze.com/ul?ll=lat,lng&navigate=yes
  return `https://waze.com/ul?ll=${destination[0]},${destination[1]}&navigate=yes`;
};

/**
 * Génère l'URL Apple Plans pour un itinéraire
 * @param {Array<{position: [number, number], clientName: string}>} points - Points de livraison
 * @returns {string} URL Apple Plans
 */
export const getAppleMapsUrl = (points) => {
  if (!points || points.length === 0) return null;

  // Apple Plans : supporte destination unique ou multi-stops via saddr et daddr
  const destination = points[points.length - 1];

  // Format: http://maps.apple.com/?daddr=lat,lng&dirflg=d
  return `http://maps.apple.com/?daddr=${destination.position[0]},${destination.position[1]}&dirflg=d`;
};

/**
 * Ouvre la navigation dans l'app appropriée
 * @param {'google'|'waze'|'apple'} app - Application à utiliser
 * @param {Array<{position: [number, number], clientName: string}>} points - Points de livraison
 * @param {[number, number]|null} origin - Point de départ
 */
export const openNavigation = (app, points, origin = null) => {
  let url;

  switch (app) {
    case "google":
      url = getGoogleMapsUrl(points, origin);
      break;
    case "waze": {
      // Waze : uniquement vers le prochain point
      const nextPoint =
        points.find(
          (p) => p.status === "PENDING" || p.status === "IN_PROGRESS",
        ) || points[0];
      url = getWazeUrl(nextPoint.position);
      break;
    }
    case "apple":
      url = getAppleMapsUrl(points);
      break;
    default:
      console.error("Application de navigation inconnue:", app);
      return;
  }

  if (url) {
    window.open(url, "_blank");
  }
};

/**
 * Génère l'URL pour un point unique
 * @param {[number, number]} position - Coordonnées
 * @param {'google'|'waze'|'apple'} app - Application
 * @returns {string} URL
 */
export const getSinglePointUrl = (position, app = "google") => {
  switch (app) {
    case "google":
      return `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}&travelmode=driving`;
    case "waze":
      return getWazeUrl(position);
    case "apple":
      return `http://maps.apple.com/?daddr=${position[0]},${position[1]}&dirflg=d`;
    default:
      return null;
  }
};
