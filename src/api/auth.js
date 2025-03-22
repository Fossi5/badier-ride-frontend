// src/api/auth.js
import api from './axios';

export const login = (credentials) => {
  return api.post('/auth/authenticate', credentials);
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  
  if (!token) {
    return null;
  }
  
  return { token, role };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  window.location.href = '/login';
};