// src/api/dispatchers.js
import api from './axios';

// Endpoints pour l'administrateur (gestion des répartiteurs)
export const getAllDispatchers = () => {
  return api.get('/admin/dispatchers');
};

export const getDispatcherById = (id) => {
  return api.get(`/admin/dispatchers/${id}`);
};

export const createDispatcher = (dispatcherData) => {
  return api.post('/admin/dispatchers', dispatcherData);
};

export const updateDispatcher = (id, dispatcherData) => {
  return api.put(`/admin/dispatchers/${id}`, dispatcherData);
};

export const deleteDispatcher = (id) => {
  return api.delete(`/admin/dispatchers/${id}`);
};

export const getDispatchersByDepartment = (department) => {
  return api.get(`/admin/dispatchers/department/${department}`);
};

// Endpoints pour le répartiteur lui-même
export const getDispatcherProfile = () => {
  return api.get('/dispatcher/profile');
};

export const updateDispatcherProfile = (profileData) => {
  return api.put('/dispatcher/profile', profileData);
};