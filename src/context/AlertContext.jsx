// src/context/AlertContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Création du contexte
const AlertContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'alerte
export const useAlert = () => {
  return useContext(AlertContext);
};

// Types d'alertes
export const AlertType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Fournisseur du contexte d'alerte
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Ajouter une alerte
  const addAlert = (message, type = AlertType.INFO, timeout = 5000) => {
    const id = Date.now();
    const newAlert = { id, message, type };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto-supprimer après le délai spécifié
    if (timeout > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, timeout);
    }
    
    return id;
  };

  // Supprimer une alerte
  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Raccourcis pour les différents types d'alertes
  const success = (message, timeout) => addAlert(message, AlertType.SUCCESS, timeout);
  const error = (message, timeout) => addAlert(message, AlertType.ERROR, timeout);
  const warning = (message, timeout) => addAlert(message, AlertType.WARNING, timeout);
  const info = (message, timeout) => addAlert(message, AlertType.INFO, timeout);

  // Valeur du contexte
  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;