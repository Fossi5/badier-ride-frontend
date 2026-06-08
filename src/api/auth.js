// src/api/auth.js
import api from './axios';

export const login = (credentials) => {
  return api.post('/auth/authenticate', credentials);
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const getCurrentUser = () => {
  const savedUser = localStorage.getItem('userInfo');
  if (!savedUser) {
    return null;
  }
  try {
    return JSON.parse(savedUser);
  } catch (e) {
    return null;
  }
};

// Appelle le backend pour effacer le cookie httpOnly JWT
export const logout = () => {
  return api.post('/auth/logout');
};
