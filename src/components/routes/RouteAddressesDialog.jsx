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
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import AddressSelector from '../forms/AddressSelector';
import { useAlert } from '../../context/AlertContext';

const RouteAddressesDialog = ({
  open,
  onClose,
  route,
  onAddAddress,
  onRemoveAddress
}) => {
  const [addressSelectorOpen, setAddressSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useAlert();

  if (!route) return null;

  // Sécuriser l'accès à deliveryPoints pour éviter les erreurs
  const deliveryPoints = route.deliveryPoints || [];

  // Fonction pour gérer l'ajout d'adresse avec gestion d'erreur
  const handleAddAddress = async (address) => {
    setLoading(true);
    try {
      await onAddAddress(address);
      success(`Adresse ajoutée avec succès à la tournée ${route.name}`);
      // Le sélecteur se ferme, mais le dialogue principal reste ouvert
    } catch (err) {
      showError(`Erreur lors de l'ajout de l'adresse: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
      setAddressSelectorOpen(false);
    }
  };

  // Fonction pour gérer la suppression d'adresse avec gestion d'erreur
  const handleRemoveAddress = async (point) => {
    setLoading(true);
    try {
      await onRemoveAddress(point);
      success(`Adresse retirée avec succès de la tournée ${route.name}`);
    } catch (err) {
      showError(`Erreur lors de la suppression de l'adresse: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
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
    </>
  );
};

export default RouteAddressesDialog;
