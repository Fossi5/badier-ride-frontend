// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Group as GroupIcon,
  DirectionsCar as DriverIcon,
  Speed as SpeedIcon,
  LocalShipping as ShippingIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  AddCircle as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Report as ReportIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Importation des services API
import { getAllDrivers } from '../../api/drivers';
import { getAllDispatchers } from '../../api/dispatchers';
import { getAllRoutes } from '../../api/routes';
import { getAllDeliveryPoints } from '../../api/deliveryPoints';

// Importation des utilitaires
import { formatDate } from '../../utils/formatters';
import { useAlert } from '../../context/AlertContext';

const AdminDashboard = () => {
  // États pour stocker les données
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation et alertes
  const navigate = useNavigate();
  const { error } = useAlert();

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  // Fonction pour charger toutes les données nécessaires
  const fetchData = async () => {
    setLoading(true);
    try {
      // Chargement parallèle des données pour optimiser les performances
      const [driversRes, dispatchersRes, routesRes, deliveryPointsRes] = await Promise.all([
        getAllDrivers(),
        getAllDispatchers(),
        getAllRoutes(),
        getAllDeliveryPoints()
      ]);

      setDrivers(driversRes.data);
      setDispatchers(dispatchersRes.data);
      setRoutes(routesRes.data);
      setDeliveryPoints(deliveryPointsRes.data);
    } catch (err) {
      error('Erreur lors du chargement des données');
      console.error('Erreur de chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques
  const getStats = () => {
    // Statistiques des routes
    const activeRoutes = routes.filter(r => r.status === 'IN_PROGRESS').length;
    const plannedRoutes = routes.filter(r => r.status === 'PLANNED').length;
    const completedRoutes = routes.filter(r => r.status === 'COMPLETED').length;

    // Statistiques des chauffeurs
    const availableDrivers = drivers.filter(d => d.isAvailable).length;

    // Statistiques des livraisons
    const pendingDeliveries = deliveryPoints.filter(d => d.deliveryStatus === 'PENDING').length;
    const inProgressDeliveries = deliveryPoints.filter(d => d.deliveryStatus === 'IN_PROGRESS').length;
    const completedDeliveries = deliveryPoints.filter(d => d.deliveryStatus === 'COMPLETED').length;
    const failedDeliveries = deliveryPoints.filter(d => d.deliveryStatus === 'FAILED').length;

    return {
      drivers: {
        total: drivers.length,
        available: availableDrivers,
        unavailable: drivers.length - availableDrivers
      },
      dispatchers: {
        total: dispatchers.length
      },
      routes: {
        total: routes.length,
        active: activeRoutes,
        planned: plannedRoutes,
        completed: completedRoutes
      },
      deliveries: {
        total: deliveryPoints.length,
        pending: pendingDeliveries,
        inProgress: inProgressDeliveries,
        completed: completedDeliveries,
        failed: failedDeliveries
      }
    };
  };

  // Filtres pour les routes du jour
  const getTodayRoutes = () => {
    const today = new Date().toISOString().split('T')[0];
    return routes.filter(route =>
      route.startTime && route.startTime.startsWith(today)
    );
  };

  // Récupérer les points de livraison récents
  const getRecentDeliveryPoints = () => {
    return [...deliveryPoints]
      .sort((a, b) => new Date(b.plannedTime) - new Date(a.plannedTime))
      .slice(0, 5);
  };

  // Calcul des statistiques
  const stats = loading ? null : getStats();
  const todayRoutes = loading ? [] : getTodayRoutes();
  const recentDeliveryPoints = loading ? [] : getRecentDeliveryPoints();

  // Fonction pour obtenir la couleur selon le statut
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

  // Fonction pour obtenir le texte du statut
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord administrateur
        </Typography>

        <Tooltip title="Rafraîchir">
          <span>
            <IconButton onClick={fetchData} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Statistiques chauffeurs */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Chauffeurs
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <DriverIcon />
                    </Avatar>
                    <Typography variant="h4">
                      {stats.drivers.total}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Disponibles: {stats.drivers.available}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Indisponibles: {stats.drivers.unavailable}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/admin/drivers')}
                  >
                    Gérer les chauffeurs
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques répartiteurs */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Répartiteurs
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <GroupIcon />
                    </Avatar>
                    <Typography variant="h4">
                      {stats.dispatchers.total}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      &nbsp;
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/admin/dispatchers')}
                  >
                    Gérer les répartiteurs
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques tournées */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Tournées
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Typography variant="h4">
                      {stats.routes.total}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Actives: {stats.routes.active}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Planifiées: {stats.routes.planned}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/admin/routes')}
                  >
                    Voir les tournées
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques livraisons */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Livraisons
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <ShippingIcon />
                    </Avatar>
                    <Typography variant="h4">
                      {stats.deliveries.total}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Terminées: {stats.deliveries.completed}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      En attente: {stats.deliveries.pending + stats.deliveries.inProgress}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/admin/delivery-points')}
                  >
                    Gérer les livraisons
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Tournées du jour */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tournées d'aujourd'hui ({todayRoutes.length})
                </Typography>
                <Divider sx={{ my: 2 }} />

                {todayRoutes.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                    Aucune tournée prévue pour aujourd'hui
                  </Typography>
                ) : (
                  <List>
                    {todayRoutes.map((route) => (
                      <ListItem
                        key={route.id}
                        divider
                        secondaryAction={
                          <IconButton
                            edge="end" disabled
                          // onClick={() => navigate(`/dispatcher/routes/${route.id}`)}
                          >
                            {route.status === 'COMPLETED' ? (
                              <CheckCircleIcon color="success" />
                            ) : route.status === 'IN_PROGRESS' ? (
                              <SpeedIcon color="primary" />
                            ) : route.status === 'CANCELLED' ? (
                              <ReportIcon color="error" />
                            ) : (
                              <WarningIcon color="warning" />
                            )}
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light' }}>
                            <TimelineIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={route.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Chauffeur: {route.driver.username} •
                                Points: {route.deliveryPoints.length} •
                                Statut: {route.status}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="textSecondary">
                                {route.startTime && formatDate(route.startTime, 'datetime')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}


              </Paper>
            </Grid>

            {/* Points de livraison récents */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Points de livraison récents
                </Typography>
                <Divider sx={{ my: 2 }} />

                {recentDeliveryPoints.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                    Aucun point de livraison récent
                  </Typography>
                ) : (
                  <List>
                    {recentDeliveryPoints.map((point) => (
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
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;