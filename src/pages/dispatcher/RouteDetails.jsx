// src/pages/dispatcher/RouteDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Map as MapIcon,
  DirectionsBus as VehicleIcon,
  Sort as SortIcon
} from '@mui/icons-material';

// Import des services API
import { 
  getRouteById, 
  addDeliveryPointToRoute, 
  removeDeliveryPointFromRoute,
  updateRoutePointsOrder,
  optimizeRouteWithFixedPoints
} from '../../api/routes';
import { useAlert } from '../../context/AlertContext';
import { format } from 'date-fns';

// Import des composants
import RouteAddressesDialog from '../../components/routes/RouteAddressesDialog';
import RouteOrderingDialog from '../../components/routes/RouteOrderingDialog';

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useAlert();
  
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [orderingDialogOpen, setOrderingDialogOpen] = useState(false);
  const [orderingLoading, setOrderingLoading] = useState(false);

  // Charger les détails de la tournée
  useEffect(() => {
    fetchRouteDetails();
  }, [id]);

  const fetchRouteDetails = async () => {
    setLoading(true);
    try {
      const response = await getRouteById(id);
      setRoute(response.data);
    } catch (err) {
      error(`Erreur lors du chargement des détails de la tournée: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer les adresses
  const handleAddAddress = async (address) => {
    try {
      await addDeliveryPointToRoute(id, address.id);
      success(`Adresse ajoutée avec succès à la tournée`);
      await fetchRouteDetails(); // Rafraîchir les données
      return true;
    } catch (err) {
      error(`Erreur lors de l'ajout de l'adresse: ${err.message || 'Erreur inconnue'}`);
      throw err;
    }
  };

  const handleRemoveAddress = async (point) => {
    try {
      await removeDeliveryPointFromRoute(id, point.id);
      success(`Adresse retirée avec succès de la tournée`);
      await fetchRouteDetails(); // Rafraîchir les données
      return true;
    } catch (err) {
      error(`Erreur lors de la suppression de l'adresse: ${err.message || 'Erreur inconnue'}`);
      throw err;
    }
  };

  // Fonction pour gérer la sauvegarde de l'ordre des points
  const handleSavePointsOrder = async (orderedPoints) => {
    setOrderingLoading(true);
    try {
      await updateRoutePointsOrder(id, orderedPoints);
      success('Ordre des points de livraison mis à jour avec succès');
      await fetchRouteDetails(); // Rafraîchir les données
    } catch (err) {
      error(`Erreur lors de la mise à jour de l'ordre: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setOrderingLoading(false);
      setOrderingDialogOpen(false);
    }
  };

  // Fonction pour optimiser la tournée avec points fixes
  const handleOptimizeWithFixedPoints = async () => {
    try {
      setLoading(true);
      await optimizeRouteWithFixedPoints(id);
      success('Tournée optimisée avec succès en respectant les points fixes');
      await fetchRouteDetails();
    } catch (err) {
      error(`Erreur lors de l'optimisation: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigation vers la page d'optimisation standard
  const handleOptimizeRoute = () => {
    navigate(`/dispatcher/optimize?routeId=${id}`);
  };

  // Retour à la liste des tournées
  const handleBack = () => {
    navigate('/dispatcher/routes');
  };

  // Navigation vers la page d'édition
  const handleEdit = () => {
    navigate(`/dispatcher/routes/edit/${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!route) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="error">
          Tournée non trouvée
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Retour aux tournées
        </Button>
      </Container>
    );
  }

  // Trier les points de livraison par ordre de séquence
  const sortedDeliveryPoints = route.deliveryPoints
    ? [...route.deliveryPoints].sort((a, b) => {
        // Si l'ordre de séquence est défini, l'utiliser
        if (a.sequenceOrder !== undefined && b.sequenceOrder !== undefined) {
          return a.sequenceOrder - b.sequenceOrder;
        }
        // Sinon, trier par ID
        return a.id - b.id;
      })
    : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Détails de la tournée
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h5" gutterBottom>
            {route.name}
            <Chip
              sx={{ ml: 2 }}
              size="small"
              label={route.status}
              color={
                route.status === 'COMPLETED' ? 'success' :
                route.status === 'IN_PROGRESS' ? 'primary' :
                route.status === 'CANCELLED' ? 'error' : 'default'
              }
            />
          </Typography>
          <Box>
            <Tooltip title="Modifier la tournée">
              <IconButton onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Optimiser la tournée">
              <IconButton onClick={handleOptimizeRoute} disabled={route.status === 'COMPLETED' || route.status === 'CANCELLED'}>
                <MapIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>ID:</strong> {route.id}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Chauffeur:</strong> {route.driver?.username || 'Non assigné'}
              {route.driver?.vehicleType && (
                <Chip
                  icon={<VehicleIcon />}
                  size="small"
                  label={route.driver.vehicleType}
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Répartiteur:</strong> {route.dispatcher?.username || 'Non assigné'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date de début:</strong> {route.startTime ? format(new Date(route.startTime), 'dd/MM/yyyy HH:mm') : 'Non définie'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date de fin:</strong> {route.endTime ? format(new Date(route.endTime), 'dd/MM/yyyy HH:mm') : 'Non définie'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Nombre de points de livraison:</strong> {route.deliveryPoints?.length || 0}
            </Typography>
          </Grid>
          {route.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Notes:</strong>
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">{route.notes}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Points de livraison
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => setAddressDialogOpen(true)}
              disabled={route.status === 'COMPLETED' || route.status === 'CANCELLED'}
              sx={{ mr: 2 }}
            >
              Gérer les adresses
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={() => setOrderingDialogOpen(true)}
              disabled={
                route.status === 'COMPLETED' || 
                route.status === 'CANCELLED' || 
                !route.deliveryPoints || 
                route.deliveryPoints.length <= 1
              }
            >
              Définir l'ordre
            </Button>

            <Button
              variant="outlined"
              startIcon={<MapIcon />}
              onClick={handleOptimizeWithFixedPoints}
              disabled={route.status === 'COMPLETED' || route.status === 'CANCELLED'}
              sx={{ ml: 2 }}
            >
              Optimiser avec points fixes
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {!sortedDeliveryPoints || sortedDeliveryPoints.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
            Aucune adresse dans cette tournée
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {sortedDeliveryPoints.map((point, index) => (
              <Grid item xs={12} sm={6} md={4} key={point.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    // Ajouter une couleur de fond pour les points de départ et d'arrivée
                    bgcolor: 
                      (point.isStartPoint) ? 'rgba(25, 118, 210, 0.12)' : // Bleu clair pour le départ
                      (point.isEndPoint) ? 'rgba(156, 39, 176, 0.12)' :   // Violet clair pour l'arrivée
                      'background.paper'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>
                      #{index + 1} - {point.clientName || 'Client'}
                      {point.isStartPoint && (
                        <Chip size="small" label="Départ" color="primary" sx={{ ml: 1 }} />
                      )}
                      {point.isEndPoint && (
                        <Chip size="small" label="Arrivée" color="secondary" sx={{ ml: 1 }} />
                      )}
                    </strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {point.address
                      ? `${point.address.street}, ${point.address.postalCode} ${point.address.city}`
                      : 'Adresse inconnue'
                    }
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label={point.deliveryStatus || 'EN ATTENTE'}
                      color={
                        point.deliveryStatus === 'COMPLETED' ? 'success' :
                        point.deliveryStatus === 'IN_PROGRESS' ? 'primary' :
                        point.deliveryStatus === 'FAILED' ? 'error' : 'default'
                      }
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Dialogue de gestion des adresses */}
      <RouteAddressesDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        route={route}
        onAddAddress={handleAddAddress}
        onRemoveAddress={handleRemoveAddress}
      />

      {/* Dialogue d'ordonnancement des points */}
      <RouteOrderingDialog
        open={orderingDialogOpen}
        onClose={() => setOrderingDialogOpen(false)}
        route={route}
        onSaveOrder={handleSavePointsOrder}
        loading={orderingLoading}
      />
    </Container>
  );
};

export default RouteDetails;