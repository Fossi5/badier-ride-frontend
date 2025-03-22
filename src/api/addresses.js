// src/api/addresses.js
import api from './axios';

// Récupérer toutes les adresses
export const getAllAddresses = () => {
  return api.get('/addresses');
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
  return api.post('/addresses', addressData);
};

// Mettre à jour une adresse
export const updateAddress = (id, addressData) => {
  return api.put(`/addresses/${id}`, addressData);
};

// Supprimer une adresse
export const deleteAddress = (id) => {
  return api.delete(`/addresses/${id}`);
};

// Vérifier les doublons potentiels
export const checkDuplicateAddresses = (addressData) => {
  return api.post('/addresses/check-duplicates', addressData);
};