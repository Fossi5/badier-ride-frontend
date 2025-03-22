// src/pages/driver/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Chip,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { format } from 'date-fns';

import { getDriverRoutes } from '../../api/routes';
import { updateDriverAvailability, updateDriverLocation, getDriverProfile } from '../../api/drivers';
import { updateDeliveryPointStatus } from '../../api/deliveryPoints';
import { useAlert } from '../../context/AlertContext';
import DeliveryMap from '../../components/maps/DeliveryMap';

const DriverDashboard = () => {
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  
  const { success, error } = useAlert();

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  // Récupérer les données du chauffeur et ses tournées
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer profil chauffeur
      const profileResponse = await getDriverProfile();
      setDriverInfo(profileResponse.data);
      setIsAvailable(profileResponse.data.isAvailable);
      
      // Récupérer ses tournées
      const routesResponse = await getDriverRoutes();
      setRoutes(routesResponse.data);
      
      // Définir la tournée active (si existe)
      const inProgressRoute = routesResponse.data.find(r => r.status === 'IN_PROGRESS');
      const plannedRoute = routesResponse.data.find(r => r.status === 'PLANNED');
      
      if (inProgressRoute) {
        setActiveRoute(inProgressRoute);
      } else if (plannedRoute) {
        setActiveRoute(plannedRoute);
      }
      
      setLoading(false);
    } catch (err) {
      error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'un point de livraison
  const handleStatusUpdate = async (pointId, newStatus) => {
    try {
      setUpdating(true);
      await updateDeliveryPointStatus(pointId, newStatus);
      
      success(`Point de livraison mis à jour: ${newStatus}`);
      
      // Recharger les données
      await fetchData();
    } catch (err) {
      error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  // Démarrer une tournée
  const handleStartRoute = async (routeId) => {
    try {
      setUpdating(true);
      // Mettre à jour le statut de la route
      await updateRouteStatus(routeId, 'IN_PROGRESS');
      
      success('Tournée démarrée avec succès');
      
      // Recharger les données
      await fetchData();
    } catch (err) {
      error('Erreur lors du démarrage de la tournée');
    } finally {
      setUpdating(false);
    }
  };

  // Terminer une tournée
  const handleCompleteRoute = async (routeId) => {
    try {
      setUpdating(true);
      // Mettre à jour le statut de la route
      await updateRouteStatus(routeId, 'COMPLETED');
      
      success('Tournée terminée avec succès');
      
      // Recharger les données
      await fetchData();
    } catch (err) {
      error('Erreur lors de la clôture de la tournée');
    } finally {
      setUpdating(false);
    }
  };

  // Mettre à jour la position du chauffeur
  const handleLocationUpdate = async (position) => {
    try {
      await updateDriverLocation(position[0], position[1]);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la position:', err);
    }
  };

  // Mettre à jour la disponibilité du chauffeur
  const handleAvailabilityToggle = async (event) => {
    const newAvailability = event.target.checked;
    
    try {
      setUpdating(true);
      await updateDriverAvailability(newAvailability);
      setIsAvailable(newAvailability);
      success(`Statut mis à jour: ${newAvailability ? 'Disponible' : 'Indisponible'}`);
    } catch (err) {
      error('Erreur lors de la mise à jour de la disponibilité');
      // Remettre l'ancien état en cas d'erreur
      setIsAvailable(!newAvailability);
    } finally {
      setUpdating(false);
    }
  };

  // Recenter la carte sur la position du chauffeur
  const handleRecenter = () => {
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
  };

  // Calculer les statistiques de la journée
  const getTodayStats = () => {
    if (!routes || routes.length === 0) {
      return {
        totalDeliveries: 0,
        completed: 0,
        pending: 0,
        failed: 0
      };
    }
    
    // Filtrer les tournées d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const todayRoutes = routes.filter(route => {
      return route.startTime && route.startTime.startsWith(today);
    });
    
    // Compter les points de livraison par statut
    let totalDeliveries = 0;
    let completed = 0;
    let pending = 0;
    let failed = 0;
    
    todayRoutes.forEach(route => {
      route.deliveryPoints.forEach(point => {
        totalDeliveries++;
        
        if (point.deliveryStatus === 'COMPLETED') {
          completed++;
        } else if (point.deliveryStatus === 'FAILED') {
          failed++;
        } else {
          pending++;
        }
      });
    });
    
    return {
      totalDeliveries,
      completed,
      pending,
      failed
    };
  };

  const stats = getTodayStats();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord chauffeur
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Carte des statuts et actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Statut</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAvailable}
                      onChange={handleAvailabilityToggle}
                      disabled={updating}
                    />
                  }
                  label={isAvailable ? "Disponible" : "Indisponible"}
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Statistiques du jour
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Livraisons
                      </Typography>
                      <Typography variant="h5">
                        {stats.completed} / {stats.totalDeliveries}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        En attente
                      </Typography>
                      <Typography variant="h5">
                        {stats.pending}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Échecs
                      </Typography>
                      <Typography variant="h5">
                        {stats.failed}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Tournées
                      </Typography>
                      <Typography variant="h5">
                        {routes.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {activeRoute && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Tournée active
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      {activeRoute.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeRoute.startTime ? format(new Date(activeRoute.startTime), 'dd/MM/yyyy HH:mm') : 'Non planifiée'}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={activeRoute.status} 
                      color={
                        activeRoute.status === 'COMPLETED' ? 'success' :
                        activeRoute.status === 'IN_PROGRESS' ? 'primary' :
                        activeRoute.status === 'CANCELLED' ? 'error' : 'default'
                      }
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    {activeRoute.status === 'PLANNED' && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStartRoute(activeRoute.id)}
                        disabled={updating}
                        fullWidth
                      >
                        Démarrer
                      </Button>
                    )}
                    
                    {activeRoute.status === 'IN_PROGRESS' && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleCompleteRoute(activeRoute.id)}
                        disabled={updating}
                        fullWidth
                      >
                        Terminer
                      </Button>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Points de livraison ({activeRoute.deliveryPoints.length})
                  </Typography>
                  
                  <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {activeRoute.deliveryPoints.map((point, index) => (
                      <React.Fragment key={point.id}>
                        <ListItem
                          secondaryAction={
                            <>
                              {point.deliveryStatus !== 'COMPLETED' && point.deliveryStatus !== 'FAILED' && (
                                <>
                                  <Tooltip title="Marquer comme livré">
                                    <IconButton 
                                      edge="end" 
                                      aria-label="complete" 
                                      size="small"
                                      color="success"
                                      onClick={() => handleStatusUpdate(point.id, 'COMPLETED')}
                                      disabled={updating}
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Marquer comme échec">
                                    <IconButton 
                                      edge="end" 
                                      aria-label="fail" 
                                      size="small"
                                      color="error"
                                      onClick={() => handleStatusUpdate(point.id, 'FAILED')}
                                      disabled={updating}
                                      sx={{ ml: 1 }}
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </>
                          }
                        >
                          <ListItemText
                            primary={`${index + 1}. ${point.clientName}`}
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  {point.address.street}, {point.address.city}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={point.deliveryStatus} 
                                  color={
                                    point.deliveryStatus === 'COMPLETED' ? 'success' :
                                    point.deliveryStatus === 'IN_PROGRESS' ? 'warning' :
                                    point.deliveryStatus === 'FAILED' ? 'error' : 'default'
                                  }
                                  sx={{ ml: 1 }}
                                />
                              </>
                            }
                          />
                        </ListItem>
                        {index < activeRoute.deliveryPoints.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </>
              )}
              
              {!activeRoute && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Aucune tournée active pour aujourd'hui.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Carte de livraison */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0, overflow: 'hidden', height: 'calc(100vh - 180px)', minHeight: 500 }}>
              <Box sx={{ height: '100%', position: 'relative' }}>
                <DeliveryMap 
                  route={activeRoute} 
                  onStatusUpdate={handleStatusUpdate} 
                  onLocationUpdate={handleLocationUpdate}
                  loading={updating}
                />
                
                <Tooltip title="Recentrer sur ma position">
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
                    onClick={handleRecenter}
                  >
                    <MyLocationIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DriverDashboard;