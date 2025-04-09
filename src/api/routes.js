// src/api/routes.js
import api from './axios';

// Récupérer toutes les routes
export const getAllRoutes = () => {
  return api.get('/routes');
};

// Récupérer une route spécifique
export const getRouteById = (id) => {
  return api.get(`/routes/${id}`);
};

// Récupérer les routes par statut
export const getRoutesByStatus = (status) => {
  return api.get(`/routes/status/${status}`);
};

// Récupérer les routes pour un chauffeur connecté
export const getDriverRoutes = () => {
  return api.get('/routes/driver');
};

// Récupérer les routes pour un dispatcher
export const getRoutesByDispatcher = (dispatcherId) => {
  return api.get(`/routes/dispatcher/${dispatcherId}`);
};

// Créer une nouvelle route
export const createRoute = (routeData) => {
  return api.post('/routes', routeData);
};

// Mettre à jour une route
export const updateRoute = (id, routeData) => {
  return api.put(`/routes/${id}`, routeData);
};

// Mettre à jour le statut d'une route
export const updateRouteStatus = (id, status) => {
  return api.put(`/routes/${id}/status?status=${status}`);
};

// Supprimer une route
export const deleteRoute = (id) => {
  return api.delete(`/routes/${id}`);
};

// Ajouter un point de livraison à une route
export const addDeliveryPointToRoute = (routeId, deliveryPointId) => {
  return api.post(`/routes/${routeId}/delivery-points/${deliveryPointId}`);
};

// Supprimer un point de livraison d'une route
export const removeDeliveryPointFromRoute = (routeId, deliveryPointId) => {
  return api.delete(`/routes/${routeId}/delivery-points/${deliveryPointId}`);
};

// Optimiser une route
export const optimizeRoute = (routeId) => {
  return api.post(`/routes/${routeId}/optimize`);
};

// Obtenir la distance totale d'une route
export const getRouteDistance = (routeId) => {
  return api.get(`/routes/${routeId}/distance`);
};

/**
 * Mettre à jour l'ordre des points de livraison d'une tournée
 * @param {number} routeId - ID de la tournée
 * @param {Array} orderedPoints - Liste des points ordonnés avec propriétés id, sequenceOrder, isStartPoint, isEndPoint
 * @returns {Promise} - Réponse de l'API
 */
export const updateRoutePointsOrder = async (routeId, orderedPoints) => {
  try {
    const response = await api.put(`/routes/${routeId}/delivery-points/order`, { 
      orderedPoints 
    });
    return response;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des points de livraison:', error);
    throw error;
  }
};

/**
 * Optimiser une tournée tout en respectant les points de départ et d'arrivée définis
 * @param {number} routeId - ID de la tournée
 * @returns {Promise} - Réponse de l'API
 */
export const optimizeRouteWithFixedPoints = async (routeId) => {
  try {
    const response = await api.post(`/routes/optimization/${routeId}/with-fixed-points`);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de la tournée avec points fixes:', error);
    throw error;
  }
};