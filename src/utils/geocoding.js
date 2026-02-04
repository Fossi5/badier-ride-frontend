// src/utils/geocoding.js
/**
 * Service de géocodage pour convertir les adresses en coordonnées GPS
 * Utilise l'API Nominatim d'OpenStreetMap (gratuite)
 */

const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

// Cache pour éviter les appels répétés
const geocodeCache = new Map();

/**
 * Géocode une adresse en coordonnées GPS [latitude, longitude]
 * @param {Object} address - Objet adresse avec street, city, postalCode, country
 * @returns {Promise<[number, number]|null>} Coordonnées [lat, lng] ou null si échec
 */
export const geocodeAddress = async (address) => {
  if (!address || !address.street || !address.city) {
    console.warn("Adresse invalide pour le géocodage:", address);
    return null;
  }

  // Créer une clé unique pour le cache
  const cacheKey = `${address.street}, ${address.city}, ${address.postalCode || ""}, ${address.country || ""}`;

  // Vérifier le cache
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    // Construire la requête de recherche
    const query = [
      address.street,
      address.postalCode,
      address.city,
      address.country || "Belgium",
    ]
      .filter(Boolean)
      .join(", ");

    console.log("🌍 Géocodage de:", query);

    const url = `${NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "BadierRideApp/1.0", // Nominatim requiert un User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

      // Mettre en cache
      geocodeCache.set(cacheKey, coords);

      return coords;
    } else {
      geocodeCache.set(cacheKey, null);
      return null;
    }
  } catch (error) {
    console.error("Erreur lors du géocodage:", error);
    return null;
  }
};

/**
 * Géocode plusieurs adresses en parallèle avec un délai pour respecter les limites d'API
 * @param {Array} addresses - Tableau d'objets adresse
 * @returns {Promise<Array>} Tableau de coordonnées
 */
export const geocodeMultipleAddresses = async (addresses) => {
  const results = [];

  for (let i = 0; i < addresses.length; i++) {
    const coords = await geocodeAddress(addresses[i]);
    results.push(coords);

    // Attendre 1 seconde entre chaque requête pour respecter les limites de Nominatim (1 req/sec)
    if (i < addresses.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
};

/**
 * Nettoie le cache de géocodage
 */
export const clearGeocodeCache = () => {
  geocodeCache.clear();
};

/**
 * Calcule un itinéraire routier entre plusieurs points
 * Utilise OSRM (Open Source Routing Machine) - gratuit
 * @param {Array<[number, number]>} coordinates - Tableau de coordonnées [lat, lng]
 * @returns {Promise<Array<[number, number]>|null>} Points de l'itinéraire ou null
 */
export const calculateRoute = async (coordinates) => {
  if (!coordinates || coordinates.length < 2) {
    console.warn("Pas assez de points pour calculer un itinéraire");
    return null;
  }

  try {
    // OSRM utilise le format lng,lat (inverse de Leaflet)
    const coordsString = coordinates
      .map((coord) => `${coord[1]},${coord[0]}`)
      .join(";");

    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Convertir les coordonnées GeoJSON (lng, lat) en format Leaflet (lat, lng)
      const routeCoordinates = route.geometry.coordinates.map((coord) => [
        coord[1],
        coord[0],
      ]);

      const distance = (route.distance / 1000).toFixed(2); // en km
      const duration = Math.round(route.duration / 60); // en minutes

      console.log("✅ Itinéraire calculé:", {
        distance: `${distance} km`,
        duration: `${duration} min`,
        points: routeCoordinates.length,
      });

      return {
        coordinates: routeCoordinates,
        distance,
        duration,
      };
    } else {
      console.warn("❌ Aucun itinéraire trouvé");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors du calcul de l'itinéraire:", error);
    return null;
  }
};
