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
  Report as ReportIcon
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
  
  // Calcul des statistiques
  const stats = loading ? null : getStats();
  const todayRoutes = loading ? [] : getTodayRoutes();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord administrateur
        </Typography>
        
        <Tooltip title="Rafraîchir">
          <IconButton onClick={fetchData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
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
                    onClick={() => navigate('/dispatcher/routes')}
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
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/dispatcher/delivery-points')}
                  >
                    Voir les livraisons
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
                            edge="end"
                            onClick={() => navigate(`/dispatcher/routes/${route.id}`)}
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
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/dispatcher/routes/create')}
                  >
                    Ajouter une tournée
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Activité récente */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Dernières activités
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <List>
                  {/* Ici, vous pourriez afficher un historique des activités récentes */}
                  {/* Par exemple, les derniers changements de statut, connexions, etc. */}
                  {/* Ces informations devraient venir d'une API que vous implémenterez côté backend */}
                  <ListItem divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.light' }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Tournée terminée"
                      secondary={`Tournée #${routes[0]?.id || '1'} terminée par ${routes[0]?.driver?.username || 'user'}`}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <DriverIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Chauffeur connecté"
                      secondary={`${drivers[0]?.username || 'Chauffeur'} s'est connecté`}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.light' }}>
                        <SpeedIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Tournée démarrée"
                      secondary={`Tournée #${routes[1]?.id || '2'} démarrée par ${routes[1]?.driver?.username || 'user'}`}
                    />
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {/* Navigation vers un historique complet */}}
                  >
                    Voir tout l'historique
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;