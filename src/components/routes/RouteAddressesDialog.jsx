// src/components/routes/RouteAddressesDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Box,
  Typography,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import AddressSelector from '../forms/AddressSelector';

const RouteAddressesDialog = ({
  open,
  onClose,
  route,
  onAddAddress,
  onRemoveAddress
}) => {
  const [addressSelectorOpen, setAddressSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!route) return null;

  // Sécuriser l'accès à deliveryPoints pour éviter les erreurs
  const deliveryPoints = route.deliveryPoints || [];

  // Fonction pour gérer l'ajout d'adresse avec gestion d'erreur
  const handleAddAddress = async (address) => {
    setLoading(true);
    setError(null);
    try {
      await onAddAddress(address);
      setSuccess(`Adresse ajoutée avec succès à la tournée ${route.name}`);
      // Le sélecteur se ferme, mais le dialogue principal reste ouvert
    } catch (err) {
      setError(`Erreur lors de l'ajout de l'adresse: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
      setAddressSelectorOpen(false);
    }
  };

  // Fonction pour gérer la suppression d'adresse avec gestion d'erreur
  const handleRemoveAddress = async (point) => {
    setLoading(true);
    setError(null);
    try {
      await onRemoveAddress(point);
      setSuccess(`Adresse retirée avec succès de la tournée ${route.name}`);
    } catch (err) {
      setError(`Erreur lors de la suppression de l'adresse: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fermer les alertes
  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Gestion des adresses - {route.name}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddressSelectorOpen(true)}
              disabled={loading}
            >
              Ajouter une adresse
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {deliveryPoints.length === 0 ? (
            <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
              Aucune adresse dans cette tournée
            </Typography>
          ) : (
            <List>
              {deliveryPoints.map((point) => (
                <React.Fragment key={point.id}>
                  <ListItem>
                    <ListItemText
                      primary={point.clientName || 'Client'}
                      secondary={
                        point.address
                          ? `${point.address.street}, ${point.address.postalCode} ${point.address.city}`
                          : 'Adresse inconnue'
                      }
                    />
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveAddress(point)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      <AddressSelector
        open={addressSelectorOpen}
        onClose={() => setAddressSelectorOpen(false)}
        onSelectAddress={handleAddAddress}
      />

      {/* Notification d'erreur */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Notification de succès */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RouteAddressesDialog;