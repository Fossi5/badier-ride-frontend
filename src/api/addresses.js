// src/api/addresses.js
import api from "./axios";

// Récupérer toutes les adresses
export const getAllAddresses = () => {
  return api.get("/addresses");
};

// Récupérer une adresse spécifique
export const getAddressById = (id) => {
  return api.get(`/addresses/${id}`);
};

// Récupérer les adresses par ville
export const getAddressesByCity = (city) => {
  return api.get(`/addresses/city/${city}`);
};

// Créer une nouvelle adresse
export const createAddress = (addressData) => {
  console.log("Données envoyées pour création d'adresse:", addressData);
  const token = localStorage.getItem("authToken");
  return api.post("/addresses", addressData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Mettre à jour une adresse
export const updateAddress = (id, addressData) => {
  console.log(
    `Données envoyées pour mise à jour d'adresse ${id}:`,
    addressData
  );
  const token = localStorage.getItem("authToken"); // ou tout autre mécanisme de stockage du token
  return api.put(`/addresses/${id}`, addressData, {
    headers: {
      Authorization: `Bearer ${token}`, // Assurez-vous que le format correspond à ce qu'attend votre API
    },
  });
};

// Supprimer une adresse
export const deleteAddress = (id) => {
  return api.delete(`/addresses/${id}`);
};

// Vérifier les doublons potentiels
export const checkDuplicateAddresses = (addressData) => {
  return api.post("/addresses/check-duplicates", addressData);
};
