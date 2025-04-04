// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';

// Fonction utilitaire pour décoder un token JWT
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erreur lors du décodage du token JWT:', e);
    return null;
  }
};

// Création du contexte
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier si un utilisateur est déjà connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token && role) {
      // Extraire le nom d'utilisateur du token
      const decodedToken = parseJwt(token);
      const username = decodedToken ? decodedToken.sub : null;
      
      setCurrentUser({ token, role, username });
    }

    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (username, password) => {
    try {
      const response = await apiLogin({ username, password });
      const { token, role } = response.data;

      // Stocker les informations dans le localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      // Extraire le nom d'utilisateur du token
      const decodedToken = parseJwt(token);
      const extractedUsername = decodedToken ? decodedToken.sub : null;

      // Mettre à jour l'état avec le nom d'utilisateur
      setCurrentUser({ token, role, username: extractedUsername });

      // Redirection basée sur le rôle
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'DISPATCHER') {
        navigate('/dispatcher/dashboard');
      } else if (role === 'DRIVER') {
        navigate('/driver/dashboard');
      }

      return response;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    navigate('/login');
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    login,
    logout,
    hasRole,
    isAdmin: () => hasRole('ADMIN'),
    isDispatcher: () => hasRole('DISPATCHER'),
    isDriver: () => hasRole('DRIVER'),
    isAuthenticated: () => !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;