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
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { format } from 'date-fns';

import { getDriverRoutes, updateRouteStatus } from '../../api/routes';
import { updateDriverAvailability, updateDriverLocation, getDriverProfile } from '../../api/drivers';
import { updateDeliveryPointStatus } from '../../api/deliveryPoints';
import { useAlert } from '../../context/AlertContext';
import DeliveryMap from '../../components/maps/DeliveryMap';
import StatusChip from '../../components/common/StatusChip';
import ProofUpload from '../../components/delivery/ProofUpload';

const DriverDashboard = () => {
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [proofDialog, setProofDialog] = useState(null);

  const { success, error } = useAlert();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileResponse = await getDriverProfile();
      setIsAvailable(profileResponse.data.isAvailable);

      const routesResponse = await getDriverRoutes();
      setRoutes(routesResponse.data);

      const inProgressRoute = routesResponse.data.find(r => r.status === 'IN_PROGRESS');
      const plannedRoute = routesResponse.data.find(r => r.status === 'PLANNED');
      setActiveRoute(inProgressRoute ?? plannedRoute ?? null);
    } catch (err) {
      error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (pointId, newStatus) => {
    if (!activeRoute) return error('Aucune tournée active');
    try {
      setUpdating(true);
      await updateDeliveryPointStatus(activeRoute.id, pointId, newStatus);
      success(`Point mis à jour : ${newStatus}`);
      await fetchData();
    } catch (err) {
      error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleStartRoute = async (routeId) => {
    try {
      setUpdating(true);
      await updateRouteStatus(routeId, 'IN_PROGRESS');
      success('Tournée démarrée');
      await fetchData();
    } catch {
      error('Erreur lors du démarrage de la tournée');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteRoute = async (routeId) => {
    try {
      setUpdating(true);
      await updateRouteStatus(routeId, 'COMPLETED');
      success('Tournée terminée');
      await fetchData();
    } catch {
      error('Erreur lors de la clôture de la tournée');
    } finally {
      setUpdating(false);
    }
  };

  const handleLocationUpdate = async (position) => {
    try {
      await updateDriverLocation(position[0], position[1]);
    } catch {
      // mise à jour silencieuse
    }
  };

  const handleAvailabilityToggle = async (event) => {
    const newAvailability = event.target.checked;
    try {
      setUpdating(true);
      await updateDriverAvailability(newAvailability);
      setIsAvailable(newAvailability);
      success(`Statut : ${newAvailability ? 'Disponible' : 'Indisponible'}`);
    } catch {
      error('Erreur lors de la mise à jour de la disponibilité');
      setIsAvailable(!newAvailability);
    } finally {
      setUpdating(false);
    }
  };

  const getTodayStats = () => {
    if (!routes?.length) return { totalDeliveries: 0, completed: 0, pending: 0, failed: 0 };
    const today = new Date().toISOString().split('T')[0];
    const todayRoutes = routes.filter(r => r.startTime?.startsWith(today));
    let totalDeliveries = 0, completed = 0, pending = 0, failed = 0;
    todayRoutes.forEach(route => {
      route.deliveryPoints.forEach(point => {
        totalDeliveries++;
        if (point.deliveryStatus === 'COMPLETED') completed++;
        else if (point.deliveryStatus === 'FAILED') failed++;
        else pending++;
      });
    });
    return { totalDeliveries, completed, pending, failed };
  };

  const stats = getTodayStats();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord chauffeur
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
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
                  label={isAvailable ? 'Disponible' : 'Indisponible'}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Statistiques du jour
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  { label: 'Livraisons', value: `${stats.completed} / ${stats.totalDeliveries}` },
                  { label: 'En attente', value: stats.pending },
                  { label: 'Échecs', value: stats.failed },
                  { label: 'Tournées', value: routes.length },
                ].map(({ label, value }) => (
                  <Grid item xs={6} key={label}>
                    <Card variant="outlined">
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                        <Typography variant="h5">{value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {activeRoute ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Tournée active
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight="medium">{activeRoute.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeRoute.startTime
                        ? format(new Date(activeRoute.startTime), 'dd/MM/yyyy HH:mm')
                        : 'Non planifiée'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <StatusChip status={activeRoute.status} />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {activeRoute.status === 'PLANNED' && (
                      <Button
                        variant="contained"
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
                            point.deliveryStatus !== 'COMPLETED' && point.deliveryStatus !== 'FAILED' ? (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Livré">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleStatusUpdate(point.id, 'COMPLETED')}
                                    disabled={updating}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Échec">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleStatusUpdate(point.id, 'FAILED')}
                                    disabled={updating}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : null
                          }
                        >
                          <ListItemText
                            secondaryTypographyProps={{ component: 'div' }}
                            primary={`${index + 1}. ${point.clientName}`}
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span" display="block">
                                  {point.address?.street}, {point.address?.city}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <StatusChip status={point.deliveryStatus} type="delivery" size="small" />
                                  {(point.deliveryStatus === 'IN_PROGRESS' || point.deliveryStatus === 'COMPLETED') && (
                                    <Tooltip title="Photo / code de confirmation">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => setProofDialog({ routeId: activeRoute.id, pointId: point.id, name: point.clientName })}
                                      >
                                        <PhotoCameraIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < activeRoute.deliveryPoints.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Aucune tournée active pour aujourd'hui.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0, overflow: 'hidden', height: 'calc(100vh - 180px)', minHeight: 500 }}>
              <DeliveryMap
                route={activeRoute}
                onStatusUpdate={handleStatusUpdate}
                onLocationUpdate={handleLocationUpdate}
                loading={updating}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
      <Dialog open={!!proofDialog} onClose={() => setProofDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Preuve de livraison — {proofDialog?.name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {proofDialog && (
            <ProofUpload
              routeId={proofDialog.routeId}
              deliveryPointId={proofDialog.pointId}
              onValidated={() => { setProofDialog(null); fetchData(); }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProofDialog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DriverDashboard;
