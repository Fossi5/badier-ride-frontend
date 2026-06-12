// src/pages/dispatcher/Dashboard.jsx
import React, { useState } from 'react';
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
  Tooltip,
  Chip,
  Tab,
  Tabs
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  DirectionsCar as DriverIcon,
  Timeline as RouteIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Importation des services API
import { getAllDeliveryPoints } from '../../api/deliveryPoints';
import { getDispatcherProfile } from '../../api/dispatchers';

// Hooks
import { useRoutesLive } from '../../hooks/useRoutes';
import { useAvailableDrivers } from '../../hooks/useDrivers';
import { useAsync } from '../../hooks/useAsync';

// Importation des utilitaires
import { formatDate, formatAddress } from '../../utils/formatters';
import { useAlert } from '../../context/AlertContext';
import { exportRoutes } from '../../api/export';
import { downloadFile } from '../../utils/downloadFile';
import StatusChip from '../../components/common/StatusChip';

const DispatcherDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const navigate = useNavigate();
  const { error: showError } = useAlert();

  const { data: routes, loading: routesLoading, refetch: refetchRoutes } = useRoutesLive(30000);
  const { data: deliveryPoints, loading: dpLoading, refetch: refetchDp } = useAsync(() => getAllDeliveryPoints());
  const { data: availableDrivers, loading: driversLoading, refetch: refetchDrivers } = useAvailableDrivers();
  const { data: profile } = useAsync(() => getDispatcherProfile());

  const loading = routesLoading || dpLoading || driversLoading;

  const fetchData = () => {
    refetchRoutes();
    refetchDp();
    refetchDrivers();
  };

  const handleExportRoutes = async () => {
    const res = await exportRoutes();
    downloadFile(res.data, 'tournees.csv');
  };

  // Gestion du changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const allRoutes = routes || [];
  const allDeliveryPoints = deliveryPoints || [];
  const allAvailableDrivers = availableDrivers || [];

  const today = new Date().toISOString().split('T')[0];
  const todayRoutes = allRoutes.filter(r => r.startTime && r.startTime.startsWith(today));
  const activeRoutes = allRoutes.filter(r => r.status === 'IN_PROGRESS');
  const plannedRoutes = allRoutes.filter(r => r.status === 'PLANNED');
  const pendingDeliveries = allDeliveryPoints.filter(dp => dp.deliveryStatus === 'PENDING');

  // Fonction pour naviguer vers la création d'une route
  const navigateToCreateRoute = () => {
    navigate('/dispatcher/routes', { state: { openCreateDialog: true } });
  };

  const navigateToCreateDeliveryPoint = () => {
    navigate('/dispatcher/delivery-points', { state: { openCreateDialog: true } });
  };

  // Fonction pour naviguer vers la page d'optimisation de route
  const navigateToOptimizeRoute = (routeId) => {
    navigate(`/dispatcher/optimize?routeId=${routeId}`);
  };

  // Fonction pour naviguer vers les détails d'une route
  const navigateToRouteDetails = (routeId) => {
    navigate(`/dispatcher/routes/${routeId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord répartiteur
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Exporter les tournées">
            <span>
              <IconButton onClick={handleExportRoutes} disabled={loading}>
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rafraîchir">
            <span>
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Carte d'informations et statistiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Carte du répartiteur */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Répartiteur
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {profile?.username || "Utilisateur"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {profile?.department || "Département"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques des tournées */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Tournées
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <RouteIcon />
                    </Avatar>
                    <Typography variant="h5">
                      {todayRoutes.length}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Actives: {activeRoutes.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Planifiées: {plannedRoutes.length}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/dispatcher/routes')}
                  >
                    Voir toutes
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques des points de livraison */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Points de livraison
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <LocationIcon />
                    </Avatar>
                    <Typography variant="h5">
                      {pendingDeliveries.length}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      En attente d'assignation
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/dispatcher/delivery-points')}
                  >
                    Gérer
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques des chauffeurs */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Chauffeurs disponibles
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <DriverIcon />
                    </Avatar>
                    <Typography variant="h5">
                      {allAvailableDrivers.length}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Prêts pour assignation
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={navigateToCreateRoute}
                  >
                    Nouvelle tournée
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Onglets pour les différentes sections */}
          <Paper sx={{ width: '100%', mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Tournées d'aujourd'hui" />
              <Tab label="Points de livraison en attente" />
              <Tab label="Chauffeurs disponibles" />
            </Tabs>

            <Divider />

            {/* Contenu de l'onglet 1: Tournées d'aujourd'hui */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Tournées d'aujourd'hui ({todayRoutes.length})
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={navigateToCreateRoute}
                  >
                    Nouvelle tournée
                  </Button>
                </Box>

                {todayRoutes.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      Aucune tournée prévue pour aujourd'hui
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {todayRoutes.map((route) => (
                      <ListItem
                        key={route.id}
                        divider
                        secondaryAction={
                          route.status === 'PLANNED' ? (
                            <Tooltip title="Optimiser cette tournée">
                              <IconButton color="primary" onClick={(e) => { e.stopPropagation(); navigateToOptimizeRoute(route.id); }}>
                                <RouteIcon />
                              </IconButton>
                            </Tooltip>
                          ) : null
                        }
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigateToRouteDetails(route.id)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{
                            bgcolor:
                              route.status === 'COMPLETED' ? 'success.main' :
                              route.status === 'IN_PROGRESS' ? 'info.main' :
                              route.status === 'CANCELLED' ? 'error.main' : 'warning.main'
                          }}>
                            {route.status === 'COMPLETED' ? <CheckCircleIcon /> :
                             route.status === 'CANCELLED' ? <CancelIcon /> : <ScheduleIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {route.name}
                              <Box component="span" sx={{ ml: 1 }}>
                                <StatusChip status={route.status} />
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box component="span">
                              <Typography variant="body2" component="span">
                                Chauffeur: {route.driver?.username ?? 'Non assigné'} • {route.deliveryPoints?.length ?? 0} points
                              </Typography>
                              <br />
                              <Typography variant="body2" color="textSecondary" component="span">
                                {route.startTime ? formatDate(route.startTime, 'datetime') : 'Non planifiée'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Contenu de l'onglet 2: Points de livraison en attente */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Points de livraison en attente ({pendingDeliveries.length})
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={navigateToCreateDeliveryPoint}
                  >
                    Ajouter un point
                  </Button>
                </Box>

                {pendingDeliveries.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      Aucun point de livraison en attente
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {pendingDeliveries.slice(0, 5).map((point) => (
                      <ListItem
                        key={point.id}
                        divider
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/dispatcher/delivery-points')}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <DeliveryIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={point.clientName}
                          secondary={formatAddress(point.address)}
                        />
                        <StatusChip status={point.deliveryStatus} type="delivery" />
                      </ListItem>
                    ))}
                    {pendingDeliveries.length > 5 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate('/dispatcher/delivery-points?status=PENDING')}
                        >
                          Voir les {pendingDeliveries.length - 5} autres
                        </Button>
                      </Box>
                    )}
                  </List>
                )}
              </Box>
            )}

            {/* Contenu de l'onglet 3: Chauffeurs disponibles */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Chauffeurs disponibles ({allAvailableDrivers.length})
                </Typography>

                {allAvailableDrivers.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      Aucun chauffeur disponible actuellement
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {allAvailableDrivers.map((driver) => (
                      <ListItem key={driver.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <DriverIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={driver.username}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {driver.phoneNumber || 'Pas de téléphone'} •
                                {driver.vehicleType ? ` ${driver.vehicleType}` : ' Véhicule non spécifié'}
                              </Typography>
                              {driver.lastLocationUpdate && (
                                <>
                                  <br />
                                  <Typography variant="body2" color="textSecondary" component="span">
                                    Dernière position: {formatDate(driver.lastLocationUpdate, 'datetime')}
                                  </Typography>
                                </>
                              )}
                            </>
                          }
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => navigateToCreateRoute()}
                        >
                          Assigner
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Paper>

          {/* Carte pour les actions rapides */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={navigateToCreateRoute}
                >
                  Nouvelle tournée
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<RouteIcon />}
                  onClick={() => navigate('/dispatcher/optimize')}
                >
                  Optimiser
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LocationIcon />}
                  onClick={navigateToCreateDeliveryPoint}
                >
                  Nouveau point
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate('/dispatcher/routes')}
                >
                  Voir toutes les tournées
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default DispatcherDashboard;