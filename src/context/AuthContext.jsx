// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

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
  // Le token JWT est dans un cookie httpOnly (inaccessible depuis JS)
  // On restaure uniquement les métadonnées de l'utilisateur depuis localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (username, password) => {
    try {
      const response = await apiLogin({ username, password });
      const { username: returnedUsername, role } = response.data;

      // Stocker uniquement les métadonnées (pas le token — il est dans un cookie httpOnly)
      const userInfo = { username: returnedUsername, role };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setCurrentUser(userInfo);

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
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Demander au backend d'effacer le cookie httpOnly
      await apiLogout();
    } catch (e) {
      // Ignorer les erreurs réseau lors du logout
    } finally {
      localStorage.removeItem('userInfo');
      setCurrentUser(null);
      navigate('/login');
    }
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
