// src/api/deliveryPoints.js
import api from "./axios";

// Récupérer tous les points de livraison
export const getAllDeliveryPoints = () => {
  return api.get("/delivery-points");
};

// Récupérer un point de livraison spécifique
export const getDeliveryPointById = (id) => {
  return api.get(`/delivery-points/${id}`);
};

// Récupérer les points de livraison par statut
export const getDeliveryPointsByStatus = (status) => {
  return api.get(`/delivery-points/status/${status}`);
};

// Créer un nouveau point de livraison
export const createDeliveryPoint = (deliveryPointData) => {
  return api.post("/delivery-points", deliveryPointData);
};

// Mettre à jour un point de livraison
export const updateDeliveryPoint = (id, deliveryPointData) => {
  return api.put(`/delivery-points/${id}`, deliveryPointData);
};

// Mettre à jour le statut d'un point de livraison dans une tournée spécifique
export const updateDeliveryPointStatus = (routeId, deliveryPointId, status) => {
  // Nouveau endpoint : le statut est maintenant par tournée (RouteDeliveryPoint)
  return api.put(
    `/routes/${routeId}/delivery-points/${deliveryPointId}/status`,
    null,
    {
      params: { status: status.toUpperCase() },
    },
  );
};

// Supprimer un point de livraison
export const deleteDeliveryPoint = (id) => {
  return api.delete(`/delivery-points/${id}`);
};
