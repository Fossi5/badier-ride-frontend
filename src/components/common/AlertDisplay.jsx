// src/components/common/AlertDisplay.jsx
import React from 'react';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useAlert, AlertType } from '../../context/AlertContext';

/**
 * Composant pour afficher les alertes et notifications
 */
const AlertDisplay = () => {
  const { alerts, removeAlert } = useAlert();
  
  // Gestion de la fermeture d'une alerte
  const handleClose = (id) => {
    removeAlert(id);
  };
  
  return (
    <Stack spacing={2} sx={{ position: 'fixed', top: 70, right: 16, zIndex: 2000 }}>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={() => handleClose(alert.id)}
        >
          <Alert
            onClose={() => handleClose(alert.id)}
            severity={alert.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default AlertDisplay;