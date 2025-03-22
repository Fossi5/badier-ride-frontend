// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * Composant de route protégée par authentification
 * Vérifie si l'utilisateur est connecté et a le rôle approprié
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  
  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Vérifier l'authentification
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // Vérifier les rôles autorisés
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role;
    
    if (!allowedRoles.includes(userRole)) {
      // Rediriger vers la page correspondant au rôle de l'utilisateur
      if (userRole === 'ADMIN') {
        return <Navigate to="/admin/dashboard" />;
      } else if (userRole === 'DISPATCHER') {
        return <Navigate to="/dispatcher/dashboard" />;
      } else if (userRole === 'DRIVER') {
        return <Navigate to="/driver/dashboard" />;
      } else {
        return <Navigate to="/login" />;
      }
    }
  }
  
  // Si l'utilisateur est authentifié et a le rôle approprié, afficher les routes enfants
  return <Outlet />;
};

export default ProtectedRoute;