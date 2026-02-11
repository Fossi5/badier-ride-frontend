// src/pages/dispatcher/RouteOptimization.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import TimerIcon from '@mui/icons-material/Timer';
import MapIcon from '@mui/icons-material/Map';

import { useAlert } from '../../context/AlertContext';
import RouteMap from '../../components/maps/RouteMap';
import { getAllRoutes, optimizeRoute, getRouteDistance } from '../../api/routes';

const RouteOptimization = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [currentRoute, setCurrentRoute] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { success, error } = useAlert();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await getAllRoutes();
      setRoutes(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des tournées:', err);
      
      if (err.response && err.response.status === 401) {
        error('Session expirée. Vous allez être redirigé vers la page de connexion.');
      } else {
        error('Erreur lors du chargement des tournées. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = async (event) => {
    const routeId = event.target.value;
    setSelectedRoute(routeId);
    
    if (routeId) {
      const selectedRouteData = routes.find(route => route.id === routeId);
      setCurrentRoute(selectedRouteData);
      
      try {
        const distanceResponse = await getRouteDistance(routeId);
        setDistance(distanceResponse.data);
      } catch (err) {
        console.log('Distance non disponible pour cette tournée:', err.response?.status || err.message);
        setDistance(null);
        
        if (err.response && err.response.status === 401 && 
            (err.response.data?.message?.toLowerCase().includes('token') ||
             err.response.data?.message?.toLowerCase().includes('expired'))) {
          error('Votre session a expiré. Veuillez vous reconnecter.');
        }
      }
    } else {
      setCurrentRoute(null);
      setDistance(null);
    }
  };
  
  const handleOptimize = async () => {
    if (!selectedRoute) return;
    
    setOptimizing(true);
    
    try {
      await optimizeRoute(selectedRoute);
      success('Tournée optimisée avec succès!');
      
      await fetchRoutes();
      
      if (selectedRoute) {
        const updatedRoute = routes.find(route => route.id === selectedRoute);
        setCurrentRoute(updatedRoute);
        
        try {
          const distanceResponse = await getRouteDistance(selectedRoute);
          setDistance(distanceResponse.data);
        } catch (distErr) {
          console.warn('Impossible de récupérer la distance après optimisation:', distErr);
          setDistance(null);
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'optimisation:', err);
      
      if (err.response && err.response.status === 401) {
        error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur inconnue';
        error('Erreur lors de l\'optimisation: ' + errorMessage);
      }
    } finally {
      setOptimizing(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Optimisation des tournées
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <FormControl fullWidth disabled={loading || optimizing}>
              <InputLabel id="route-select-label">Sélectionner une tournée</InputLabel>
              <Select
                labelId="route-select-label"
                id="route-select"
                value={selectedRoute}
                label="Sélectionner une tournée"
                onChange={handleRouteChange}
              >
                <MenuItem value="">
                  <em>Sélectionner une tournée</em>
                </MenuItem>
                {routes.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {route.name} - {route.deliveryPoints.length} points - {route.driver.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<DirectionsIcon />}
              onClick={handleOptimize}
              disabled={!selectedRoute || optimizing || loading}
              sx={{ height: '56px' }}
            >
              {optimizing ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Optimisation...
                </>
              ) : (
                'Optimiser cette tournée'
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {currentRoute && !loading && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Détails de la tournée
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <RouteIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Nom de la tournée" 
                    secondary={currentRoute.name}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocalShippingIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Chauffeur" 
                    secondary={currentRoute.driver.username}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Répartiteur" 
                    secondary={currentRoute.dispatcher.username}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TimerIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date/Heure de début" 
                    secondary={new Date(currentRoute.startTime).toLocaleString()}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Distance totale" 
                    secondary={distance ? `${distance.toFixed(2)} km` : 'Non disponible'}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Points de livraison ({currentRoute.deliveryPoints.length})
              </Typography>
              
              <List dense>
                {currentRoute.deliveryPoints.map((point, index) => (
                  <ListItem key={point.id}>
                    <Chip size="small" label={index + 1} sx={{ mr: 1 }} />
                    <ListItemText 
                      primary={point.clientName}
                      secondary={`${point.address.street}, ${point.address.city}`}
                    />
                    <Chip 
                      size="small" 
                      label={point.deliveryStatus} 
                      color={
                        point.deliveryStatus === 'COMPLETED' ? 'success' :
                        point.deliveryStatus === 'IN_PROGRESS' ? 'warning' :
                        point.deliveryStatus === 'FAILED' ? 'error' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 0, overflow: 'hidden', height: '500px' }}>
              <Box sx={{ height: '100%', width: '100%' }}>
                {currentRoute.deliveryPoints.length > 0 ? (
                  <RouteMap route={currentRoute} />
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%'
                    }}
                  >
                    <MapIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucun point de livraison pour cette tournée
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {!currentRoute && !loading && (
        <Paper 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}
        >
          <DirectionsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Sélectionnez une tournée pour commencer l'optimisation
          </Typography>
        </Paper>
      )}
    </Container>
  );
};
export default RouteOptimization;