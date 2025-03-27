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
  Divider
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

  if (!route) return null;

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
            >
              Ajouter une adresse
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {route.deliveryPoints.length === 0 ? (
            <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
              Aucune adresse dans cette tournée
            </Typography>
          ) : (
            <List>
              {route.deliveryPoints.map((point) => (
                <React.Fragment key={point.id}>
                  <ListItem>
                    <ListItemText
                      primary={point.clientName || 'Client'}
                      secondary={
                        point.address ? 
                        `${point.address.street}, ${point.address.postalCode} ${point.address.city}` : 
                        'Adresse inconnue'
                      }
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => onRemoveAddress(point)}
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
        onSelectAddress={(address) => {
          setAddressSelectorOpen(false);
          onAddAddress(address);
        }}
      />
    </>
  );
};

export default RouteAddressesDialog;