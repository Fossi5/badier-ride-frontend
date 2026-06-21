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

export const refreshToken = (token) => {
  return api.post('/auth/refresh', { refreshToken: token });
};

// Appelle le backend pour effacer le cookie httpOnly JWT + invalider le refresh token
export const logout = (refreshToken) => {
  return api.post('/auth/logout', refreshToken ? { refreshToken } : undefined);
};
