// src/pages/admin/Dashboard.jsx
import React, { useState } from 'react';
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
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { exportRoutes, exportAddresses } from '../../api/export';
import { downloadFile } from '../../utils/downloadFile';

// Services API
import { getAllDispatchers } from '../../api/dispatchers';
import { getAllDeliveryPoints } from '../../api/deliveryPoints';

// Hooks
import { useRoutesLive } from '../../hooks/useRoutes';
import { useDrivers } from '../../hooks/useDrivers';
import { useAsync } from '../../hooks/useAsync';

// Utilitaires
import { useAlert } from '../../context/AlertContext';

// Sous-composants
import StatCard from './components/StatCard';
import TodayRoutesList from './components/TodayRoutesList';
import RecentDeliveriesList from './components/RecentDeliveriesList';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: drivers, loading: driversLoading, refetch: refetchDrivers } = useDrivers();
  const { data: dispatchers, loading: dispatchersLoading, refetch: refetchDispatchers } = useAsync(() => getAllDispatchers());
  const { data: routes, loading: routesLoading, refetch: refetchRoutes } = useRoutesLive(30000);
  const { data: deliveryPoints, loading: dpLoading, refetch: refetchDp } = useAsync(() => getAllDeliveryPoints());

  const loading = driversLoading || dispatchersLoading || routesLoading || dpLoading;

  const fetchData = () => {
    refetchDrivers();
    refetchDispatchers();
    refetchRoutes();
    refetchDp();
  };

  const handleExportRoutes = async () => {
    const res = await exportRoutes();
    downloadFile(res.data, 'tournees.csv');
  };

  const handleExportAddresses = async () => {
    const res = await exportAddresses();
    downloadFile(res.data, 'adresses.csv');
  };

  const allDrivers = drivers || [];
  const allDispatchers = dispatchers || [];
  const allRoutes = routes || [];
  const allDeliveryPoints = deliveryPoints || [];

  const getStats = () => {
    const activeRoutes = allRoutes.filter(r => r.status === 'IN_PROGRESS').length;
    const plannedRoutes = allRoutes.filter(r => r.status === 'PLANNED').length;
    const completedRoutes = allRoutes.filter(r => r.status === 'COMPLETED').length;

    const availableDrivers = allDrivers.filter(d => d.isAvailable).length;

    const pendingDeliveries = allDeliveryPoints.filter(d => d.deliveryStatus === 'PENDING').length;
    const inProgressDeliveries = allDeliveryPoints.filter(d => d.deliveryStatus === 'IN_PROGRESS').length;
    const completedDeliveries = allDeliveryPoints.filter(d => d.deliveryStatus === 'COMPLETED').length;
    const failedDeliveries = allDeliveryPoints.filter(d => d.deliveryStatus === 'FAILED').length;

    return {
      drivers: {
        total: allDrivers.length,
        available: availableDrivers,
        unavailable: allDrivers.length - availableDrivers
      },
      dispatchers: {
        total: allDispatchers.length
      },
      routes: {
        total: allRoutes.length,
        active: activeRoutes,
        planned: plannedRoutes,
        completed: completedRoutes
      },
      deliveries: {
        total: allDeliveryPoints.length,
        pending: pendingDeliveries,
        inProgress: inProgressDeliveries,
        completed: completedDeliveries,
        failed: failedDeliveries
      }
    };
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRoutes = allRoutes.filter(r => r.startTime && r.startTime.startsWith(today));
  const recentDeliveryPoints = [...allDeliveryPoints]
    .sort((a, b) => new Date(b.plannedTime) - new Date(a.plannedTime))
    .slice(0, 5);

  const stats = loading ? null : getStats();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord administrateur
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Exporter les tournées">
            <span>
              <IconButton onClick={handleExportRoutes} disabled={loading}>
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Exporter les adresses">
            <span>
              <IconButton onClick={handleExportAddresses} disabled={loading}>
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rafraîchir">
            <span>
              <IconButton onClick={fetchData} disabled={loading} sx={{ mr: 1 }}>
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
