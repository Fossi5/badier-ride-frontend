// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Group as GroupIcon,
  DirectionsCar as DriverIcon,
  LocalShipping as ShippingIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Services API
import { getAllDrivers } from '../../api/drivers';
import { getAllDispatchers } from '../../api/dispatchers';
import { getAllRoutes } from '../../api/routes';
import { getAllDeliveryPoints } from '../../api/deliveryPoints';

// Utilitaires
import { useAlert } from '../../context/AlertContext';

// Sous-composants
import StatCard from './components/StatCard';
import TodayRoutesList from './components/TodayRoutesList';
import RecentDeliveriesList from './components/RecentDeliveriesList';

const AdminDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { error } = useAlert();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const activeRoutes = routes.filter(r => r.status === 'IN_PROGRESS').length;
    const plannedRoutes = routes.filter(r => r.status === 'PLANNED').length;
    const completedRoutes = routes.filter(r => r.status === 'COMPLETED').length;

    const availableDrivers = drivers.filter(d => d.isAvailable).length;

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

  const getTodayRoutes = () => {
    const today = new Date().toISOString().split('T')[0];
    return routes.filter(route =>
      route.startTime && route.startTime.startsWith(today)
    );
  };

  const getRecentDeliveryPoints = () => {
    return [...deliveryPoints]
      .sort((a, b) => new Date(b.plannedTime) - new Date(a.plannedTime))
      .slice(0, 5);
  };

  const stats = loading ? null : getStats();
  const todayRoutes = loading ? [] : getTodayRoutes();
  const recentDeliveryPoints = loading ? [] : getRecentDeliveryPoints();

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
            {/* Chauffeurs */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Chauffeurs"
                value={stats.drivers.total}
                icon={<DriverIcon />}
                color="primary.main"
                subContent={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Disponibles: {stats.drivers.available}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Indisponibles: {stats.drivers.unavailable}
                    </Typography>
                  </Box>
                }
                buttonLabel="Gérer les chauffeurs"
                onClick={() => navigate('/admin/drivers')}
              />
            </Grid>

            {/* Répartiteurs */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Répartiteurs"
                value={stats.dispatchers.total}
                icon={<GroupIcon />}
                color="secondary.main"
                subContent={
                  <Typography variant="body2" color="textSecondary">
                    &nbsp;
                  </Typography>
                }
                buttonLabel="Gérer les répartiteurs"
                onClick={() => navigate('/admin/dispatchers')}
              />
            </Grid>

            {/* Tournées */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tournées"
                value={stats.routes.total}
                icon={<TimelineIcon />}
                color="info.main"
                subContent={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Actives: {stats.routes.active}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Planifiées: {stats.routes.planned}
                    </Typography>
                  </Box>
                }
                buttonLabel="Voir les tournées"
                onClick={() => navigate('/admin/routes')}
              />
            </Grid>

            {/* Livraisons */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Livraisons"
                value={stats.deliveries.total}
                icon={<ShippingIcon />}
                color="success.main"
                subContent={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Terminées: {stats.deliveries.completed}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      En attente: {stats.deliveries.pending + stats.deliveries.inProgress}
                    </Typography>
                  </Box>
                }
                buttonLabel="Gérer les livraisons"
                buttonVariant="contained"
                onClick={() => navigate('/admin/delivery-points')}
              />
            </Grid>
          </Grid>

          {/* Listes du bas */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TodayRoutesList routes={todayRoutes} loading={false} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RecentDeliveriesList deliveries={recentDeliveryPoints} loading={false} />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
