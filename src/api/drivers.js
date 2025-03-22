// src/api/drivers.js
import api from './axios';

// Endpoints pour l'administrateur (gestion des chauffeurs)
export const getAllDrivers = () => {
  return api.get('/admin/drivers');
};

export const getDriverById = (id) => {
  return api.get(`/admin/drivers/${id}`);
};

export const createDriver = (driverData) => {
  return api.post('/admin/drivers', driverData);
};

export const updateDriver = (id, driverData) => {
  return api.put(`/admin/drivers/${id}`, driverData);
};

export const deleteDriver = (id) => {
  return api.delete(`/admin/drivers/${id}`);
};

export const getAvailableDrivers = () => {
  return api.get('/admin/drivers/available');
};

// Endpoints pour le chauffeur lui-même
export const getDriverProfile = () => {
  return api.get('/driver/profile');
};

export const updateDriverProfile = (profileData) => {
  return api.put('/driver/profile', profileData);
};

export const updateDriverAvailability = (isAvailable) => {
  return api.put(`/driver/availability?isAvailable=${isAvailable}`);
};

export const updateDriverLocation = (latitude, longitude) => {
  return api.put('/driver/profile', { latitude, longitude });
};