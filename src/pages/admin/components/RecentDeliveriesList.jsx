// src/pages/admin/components/RecentDeliveriesList.jsx
import React from 'react';
import {
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Box
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../utils/formatters';

/**
 * Retourne la couleur MUI selon le statut de livraison.
 */
const getDeliveryStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Retourne le libellé français du statut de livraison.
 */
const getDeliveryStatusText = (status) => {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'COMPLETED':
      return 'Terminé';
    case 'FAILED':
      return 'Échec';
    default:
      return status;
  }
};

/**
 * Liste des points de livraison récents.
 * Props :
 *   deliveries - tableau des points de livraison triés/limités
 *   loading    - booléen d'état de chargement
 */
const RecentDeliveriesList = ({ deliveries = [], loading }) => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Points de livraison récents
      </Typography>
      <Divider sx={{ my: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : deliveries.length === 0 ? (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
          Aucun point de livraison récent
        </Typography>
      ) : (
        <List>
          {deliveries.map((point) => (
            <ListItem
              key={point.id}
              divider
              secondaryAction={
                <Tooltip title="Voir les points de livraison">
                  <IconButton
                    edge="end"
                    onClick={() => navigate('/admin/delivery-points')}
                  >
                    <LocationIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getDeliveryStatusColor(point.deliveryStatus) + '.light' }}>
                  <ShippingIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={point.clientName}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {point.address.street}, {point.address.postalCode} {point.address.city}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="textSecondary">
                      {point.plannedTime && formatDate(point.plannedTime, 'datetime')} •
                      Statut: {getDeliveryStatusText(point.deliveryStatus)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RecentDeliveriesList;
