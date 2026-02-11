// src/pages/driver/RouteDetails.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Button,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  LocalShipping as ShippingIcon,
  Notes as NotesIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Import des composants personnalisés
import DeliveryMap from '../../components/maps/DeliveryMap';

// Import des services API
import { getRouteById, updateRouteStatus } from '../../api/routes';
import { updateDeliveryPointStatus } from '../../api/deliveryPoints';
import { updateDriverLocation, updateDriverAvailability } from '../../api/drivers';

// Import du contexte d'alerte
import { useAlert } from '../../context/AlertContext';

const RouteDetails = () => {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  const navigate = useNavigate();
  const { success, error, info } = useAlert();

  // Charger les données de la tournée au montage du composant
  useEffect(() => {
    fetchRouteDetails();

    // Activer la géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.error('Erreur de géolocalisation:', err);
          info('La géolocalisation n\'est pas activée ou disponible');
        }
      );
    }
  }, [id]);

  // Fonction pour charger les détails de la tournée
  const fetchRouteDetails = async () => {
    setLoading(true);
    try {
      const response = await getRouteById(id);
      setRoute(response.data);
    } catch (err) {
      error('Erreur lors du chargement des détails de la tournée: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'un point de livraison
  const handleStatusUpdate = async (pointId, newStatus) => {
    try {
      setUpdating(true);
      // Le statut est maintenant par tournée, on passe le routeId
      await updateDeliveryPointStatus(id, pointId, newStatus);
      success(`Point de livraison mis à jour: ${newStatus}`);

      // Mettre à jour les données
      await fetchRouteDetails();

      // Vérifier si tous les points sont complétés/échoués, et mettre à jour la tournée si c'est le cas
      const updatedRoute = await getRouteById(id);
      const allPointsCompleted = updatedRoute.data.deliveryPoints.every(
        point => point.deliveryStatus === 'COMPLETED' || point.deliveryStatus === 'FAILED'
      );

      if (allPointsCompleted && updatedRoute.data.status === 'IN_PROGRESS') {
        await updateRouteStatus(id, 'COMPLETED');
        success('Toutes les livraisons sont terminées, la tournée est marquée comme complétée');

        // Mettre le chauffeur en indisponible
        try {
          await updateDriverAvailability(false);
          info('Vous avez été marqué comme indisponible');
        } catch (err) {
          console.error('Erreur lors de la mise à jour de la disponibilité:', err);
        }

        // Rafraîchir la page après un court délai pour laisser les messages s'afficher
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      error('Erreur lors de la mise à jour du statut: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Mettre à jour la position du chauffeur
  const handleLocationUpdate = async (position) => {
    if (!position || !position.length === 2) return;

    try {
      await updateDriverLocation(position[0], position[1]);
      // Pas besoin d'afficher une notification car c'est une mise à jour silencieuse et fréquente
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la position:', err);
    }
  };

  // Démarrer la tournée
  const handleStartRoute = async () => {
    try {
      setUpdating(true);
      await updateRouteStatus(id, 'IN_PROGRESS');
      success('Tournée démarrée avec succès');
      await fetchRouteDetails();
    } catch (err) {
      error('Erreur lors du démarrage de la tournée: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Terminer la tournée
  const handleCompleteRoute = async () => {
    try {
      setUpdating(true);
      await updateRouteStatus(id, 'COMPLETED');
      success('Tournée terminée avec succès');
      await fetchRouteDetails();
    } catch (err) {
      error('Erreur lors de la clôture de la tournée: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'FAILED':
        return 'error';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      case 'FAILED':
        return 'Échec';
      case 'CANCELLED':
        return 'Annulé';
      case 'PLANNED':
        return 'Planifié';
      default:
        return status;
    }
  };

  // Fonction pour formater l'adresse
  const formatAddress = (address) => {
    if (!address) return 'Adresse inconnue';
    const { street, city, postalCode, country } = address;
    return `${street}, ${postalCode} ${city}, ${country || ''}`.trim();
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Afficher un message si la tournée n'existe pas
  if (!route) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Tournée non trouvée
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/driver/dashboard')}
            sx={{ mt: 2 }}
          >
            Retour au tableau de bord
          </Button>
        </Paper>
      </Container>
    );
  }

  // Calculer les statistiques
  const completedPoints = route.deliveryPoints.filter(point => point.deliveryStatus === 'COMPLETED').length;
  const failedPoints = route.deliveryPoints.filter(point => point.deliveryStatus === 'FAILED').length;
  const pendingPoints = route.deliveryPoints.length - completedPoints - failedPoints;
  const progress = route.deliveryPoints.length > 0
    ? Math.round(((completedPoints + failedPoints) / route.deliveryPoints.length) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/driver/dashboard')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          Détails de la tournée
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Colonne de gauche: Informations et Liste des points */}
        <Grid item xs={12} md={5}>
          {/* Carte des informations de la tournée */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {route.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Chip
                label={getStatusText(route.status)}
                color={getStatusColor(route.status)}
                sx={{ mr: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                Progression: {progress}%
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <strong>Date de début:</strong> {route.startTime ? format(new Date(route.startTime), 'dd/MM/yyyy HH:mm') : 'Non démarrée'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <strong>Chauffeur:</strong> {route.driver.username}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShippingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <strong>Nombre de points:</strong> {route.deliveryPoints.length}
                  </Typography>
                </Box>
              </Grid>

              {route.notes && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <NotesIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>Notes:</strong> {route.notes}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {route.status === 'PLANNED' && (
              <Button
                variant="contained"
                fullWidth
                startIcon={<ScheduleIcon />}
                onClick={handleStartRoute}
                disabled={updating}
                sx={{ mt: 3 }}
              >
                {updating ? <CircularProgress size={24} /> : 'Démarrer la tournée'}
              </Button>
            )}

            {route.status === 'IN_PROGRESS' && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<CheckCircleIcon />}
                onClick={handleCompleteRoute}
                disabled={updating || pendingPoints > 0}
                sx={{ mt: 3 }}
              >
                {updating ? <CircularProgress size={24} /> : 'Terminer la tournée'}
              </Button>
            )}
          </Paper>

          {/* Liste des points de livraison */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Points de livraison
            </Typography>

            <List sx={{ mt: 2 }}>
              {route.deliveryPoints.map((point, index) => (
                <React.Fragment key={point.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor:
                          point.deliveryStatus === 'COMPLETED' ? 'success.main' :
                            point.deliveryStatus === 'IN_PROGRESS' ? 'warning.main' :
                              point.deliveryStatus === 'FAILED' ? 'error.main' :
                                'grey.400'
                      }}>
                        <LocationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={point.clientName}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" display="block">
                            {formatAddress(point.address)}
                          </Typography>
                          {point.clientPhoneNumber && (
                            <Typography variant="body2" component="span" display="block">
                              <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                              {point.clientPhoneNumber}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {point.deliveryStatus === 'PENDING' && route.status === 'IN_PROGRESS' && (
                        <Tooltip title="Marquer comme en cours">
                          <IconButton
                            edge="end"
                            onClick={() => handleStatusUpdate(point.id, 'IN_PROGRESS')}
                            disabled={updating}
                            color="warning"
                          >
                            <LocationIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {point.deliveryStatus === 'IN_PROGRESS' && (
                        <>
                          <Tooltip title="Marquer comme livré">
                            <IconButton
                              edge="end"
                              onClick={() => handleStatusUpdate(point.id, 'COMPLETED')}
                              disabled={updating}
                              color="success"
                              sx={{ mr: 1 }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Marquer comme échec">
                            <IconButton
                              edge="end"
                              onClick={() => handleStatusUpdate(point.id, 'FAILED')}
                              disabled={updating}
                              color="error"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {(point.deliveryStatus === 'COMPLETED' || point.deliveryStatus === 'FAILED') && (
                        <Chip
                          label={getStatusText(point.deliveryStatus)}
                          color={getStatusColor(point.deliveryStatus)}
                          size="small"
                        />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}

              {route.deliveryPoints.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Aucun point de livraison"
                    secondary="Cette tournée ne contient pas de points de livraison"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Colonne de droite: Carte */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ height: 'calc(100vh - 180px)', minHeight: 500, p: 0 }}>
            <Box sx={{ height: '100%', position: 'relative' }}>
              <DeliveryMap
                route={route}
                onStatusUpdate={handleStatusUpdate}
                onLocationUpdate={handleLocationUpdate}
                loading={updating}
              />

              <Tooltip title="Ma position">
                <IconButton
                  color="primary"
                  size="large"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'white',
                    boxShadow: 3,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          handleLocationUpdate([latitude, longitude]);
                        },
                        (err) => {
                          error('Impossible d\'accéder à votre localisation: ' + err.message);
                        }
                      );
                    } else {
                      error('La géolocalisation n\'est pas prise en charge par votre navigateur');
                    }
                  }}
                >
                  <MyLocationIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RouteDetails;