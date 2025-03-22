// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';

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
      setCurrentUser({ token, role });
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
      
      // Mettre à jour l'état
      setCurrentUser({ token, role });
      
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