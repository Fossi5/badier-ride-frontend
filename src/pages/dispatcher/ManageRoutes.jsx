// src/pages/dispatcher/ManageRoutes.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Divider,
  Tooltip,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Route as RouteIcon,
  Map as MapIcon,
  Close as CloseIcon,
  DirectionsCar as DriverIcon,
  Person as DispatcherIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Import des services API
import {
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  updateRouteStatus
} from '../../api/routes';
import { getAllDrivers } from '../../api/drivers';
import { getAvailableDrivers } from '../../api/drivers';
import { getAllDispatchers } from '../../api/dispatchers';
import { getAllDeliveryPoints } from '../../api/deliveryPoints';

// Import du contexte d'alerte
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Ã‰tats pour les erreurs d'autorisations
  const [authErrors, setAuthErrors] = useState({
    driversError: false,
    dispatchersError: false,
    routesError: false
  });

  // Ã‰tats pour le dialogue de crÃ©ation/Ã©dition
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    driverId: '',
    dispatcherId: '',
    deliveryPointIds: [],
    startTime: null,
    endTime: null,
    notes: '',
    status: 'PLANNED'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Ã‰tat pour le dialogue de confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

  // Hooks et contextes
  const navigate = useNavigate();
  const location = useLocation();
  const shouldAutoOpenCreateDialog = location.state?.openCreateDialog;
  const { success, error, } = useAlert();
  const { currentUser } = useAuth();

  // Charger les donnÃ©es au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && shouldAutoOpenCreateDialog) {
      handleOpenCreateDialog();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, shouldAutoOpenCreateDialog, location.pathname, navigate]);

  // Fonction pour charger toutes les donnÃ©es nÃ©cessaires
  const fetchData = async () => {
    setLoading(true);

    // RÃ©initialiser les erreurs d'autorisation
    setAuthErrors({
      driversError: false,
      dispatchersError: false,
      routesError: false
    });

    // Charger les tournÃ©es
    try {
      const routesRes = await getAllRoutes();
      setRoutes(routesRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, routesError: true }));
        error("Vous n'avez pas l'autorisation d'accÃ©der aux tournÃ©es");
      } else {
        error('Erreur lors du chargement des tournÃ©es: ' + (err.response?.data?.error || err.message));
      }
    }

    // Charger les points de livraison
    try {
      const deliveryPointsRes = await getAllDeliveryPoints();
      setDeliveryPoints(deliveryPointsRes.data);
    } catch (err) {
      error('Erreur lors du chargement des points de livraison: ' + (err.response?.data?.error || err.message));
    }

    // Charger les chauffeurs disponibles
    try {
      const availableDriversRes = await getAvailableDrivers();
      setAvailableDrivers(availableDriversRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, driversError: true }));
        // Pas d'accÃ¨s aux chauffeurs disponibles : fallback sur la liste complÃ¨te des chauffeurs
        try {
          const driversRes = await getAllDrivers();
          setDrivers(driversRes.data);
        } catch (driverErr) {
          // Ã‰chec du fallback chauffeurs : aucune liste disponible
        }
      } else {
        error('Erreur lors du chargement des chauffeurs disponibles: ' + (err.response?.data?.error || err.message));
      }
    }

    // Charger les rÃ©partiteurs
    try {
      const dispatchersRes = await getAllDispatchers();
      setDispatchers(dispatchersRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, dispatchersError: true }));
      } else {
        error('Erreur lors du chargement des rÃ©partiteurs: ' + (err.response?.data?.error || err.message));
      }
    }

    setLoading(false);
  };

  // Gestion du changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gestion du changement de nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Ouverture du dialogue pour crÃ©er une nouvelle tournÃ©e
  const handleOpenCreateDialog = () => {
    // VÃ©rifier si toutes les donnÃ©es nÃ©cessaires sont disponibles
    if (authErrors.driversError && authErrors.dispatchersError) {
      error("Vous n'avez pas les autorisations nÃ©cessaires pour crÃ©er une tournÃ©e");
      return;
    }

    // PrÃ©remplir avec le dispatcher actuel si l'utilisateur est un dispatcher
    let initialData = {
      name: '',
      driverId: '',
      dispatcherId: '',
      deliveryPointIds: [],
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 8)), // Par dÃ©faut 8h plus tard
      notes: '',
      status: 'PLANNED'
    };

    if (currentUser?.role === 'DISPATCHER') {
      const currentDispatcher = dispatchers.find(d => d.username === currentUser.username);
      if (currentDispatcher) {
        initialData.dispatcherId = currentDispatcher.id;
      }
    }

    setDialogMode('create');
    setFormData(initialData);
    setFormErrors({});
    setOpenRouteDialog(true);
  };

  // Ouverture du dialogue pour Ã©diter une tournÃ©e existante
  const handleOpenEditDialog = (route) => {
    // VÃ©rifier si toutes les donnÃ©es nÃ©cessaires sont disponibles
    if (authErrors.driversError && authErrors.dispatchersError) {
      error("Vous n'avez pas les autorisations nÃ©cessaires pour modifier une tournÃ©e");
      return;
    }

    setDialogMode('edit');
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      driverId: route.driver?.id || '',
      dispatcherId: route.dispatcher?.id || '',
      deliveryPointIds: route.deliveryPoints?.map(dp => dp.id) || [],
      startTime: route.startTime ? new Date(route.startTime) : null,
      endTime: route.endTime ? new Date(route.endTime) : null,
      notes: route.notes || '',
      status: route.status
    });
    setFormErrors({});
    setOpenRouteDialog(true);
  };

  // Fermeture du dialogue
  const handleCloseRouteDialog = () => {
    setOpenRouteDialog(false);
    setSelectedRoute(null);
  };

  // Gestion des changements de champs du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Gestion des changements de dates
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });

    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Le nom de la tournÃ©e est obligatoire';
    }

    if (!formData.driverId) {
      errors.driverId = 'Veuillez sÃ©lectionner un chauffeur';
    }

    // Ne validez le champ dispatcherId que si l'utilisateur n'est pas un dispatcher
    if (!formData.dispatcherId && currentUser?.role !== 'DISPATCHER') {
      errors.dispatcherId = 'Veuillez sÃ©lectionner un rÃ©partiteur';
    }

    if (formData.deliveryPointIds.length === 0) {
      errors.deliveryPointIds = 'Veuillez sÃ©lectionner au moins un point de livraison';
    }

    if (!formData.startTime) {
      errors.startTime = 'La date et heure de dÃ©but sont obligatoires';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // S'assurer que le dispatcherId est dÃ©fini pour un dispatcher
    let submissionData = { ...formData };

    if (currentUser?.role === 'DISPATCHER') {
      if (submissionData.dispatcherId) {
        // Dispatcher ID dÃ©jÃ  dÃ©fini dans le formulaire, on le conserve
      }
      else if (currentUser.username) {
        const currentDispatcher = dispatchers.find(d => d.username === currentUser.username);

        if (currentDispatcher) {
          submissionData.dispatcherId = currentDispatcher.id;
        }
        else {
          // Dispatcher non trouvÃ© par username : fallback au premier dispatcher de la liste
          if (dispatchers.length > 0) {
            submissionData.dispatcherId = dispatchers[0].id;
          } else {
            error("Aucun dispatcher disponible. Veuillez contacter l'administrateur.");
            setSubmitting(false);
            return;
          }
        }
      }
      // Si aucun username n'est disponible, utiliser le premier dispatcher
      else if (dispatchers.length > 0) {
        submissionData.dispatcherId = dispatchers[0].id;
      } else {
        error("Aucun dispatcher disponible. Veuillez contacter l'administrateur.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (dialogMode === 'create') {
        await createRoute(submissionData);
        success('TournÃ©e crÃ©Ã©e avec succÃ¨s');
      } else {
        await updateRoute(selectedRoute.id, submissionData);
        success('TournÃ©e mise Ã  jour avec succÃ¨s');
      }

      handleCloseRouteDialog();
      fetchData();
    } catch (err) {
      error(`Erreur lors de la ${dialogMode === 'create' ? 'crÃ©ation' : 'mise Ã  jour'} de la tournÃ©e: ` + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Ouverture du dialogue de confirmation de suppression
  const handleOpenDeleteDialog = (route) => {
    setRouteToDelete(route);
    setOpenDeleteDialog(true);
  };

  // Fermeture du dialogue de confirmation de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setRouteToDelete(null);
  };

  // Suppression d'une tournÃ©e
  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;

    try {
      await deleteRoute(routeToDelete.id);
      success('TournÃ©e supprimÃ©e avec succÃ¨s');

      // Fermer le dialogue et rafraÃ®chir la liste
      handleCloseDeleteDialog();
      fetchData();
    } catch (err) {
      if (err.response?.status === 403) {
        error("Vous n'avez pas l'autorisation de supprimer une tournÃ©e");
      } else {
        error('Erreur lors de la suppression de la tournÃ©e: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Mise Ã  jour du statut d'une tournÃ©e
  const handleUpdateStatus = async (routeId, newStatus) => {
    try {
      await updateRouteStatus(routeId, newStatus);
      success(`Statut de la tournÃ©e mis Ã  jour: ${newStatus}`);
      fetchData();
    } catch (err) {
      if (err.response?.status === 403) {
        error("Vous n'avez pas l'autorisation de modifier le statut d'une tournÃ©e");
      } else {
        error('Erreur lors de la mise Ã  jour du statut: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Navigation vers la page d'optimisation
  const handleOptimizeRoute = (routeId) => {
    navigate(`/dispatcher/optimize?routeId=${routeId}`);
  };

  // DÃ©termine si l'utilisateur courant est le dispatcher assignÃ© Ã  la tournÃ©e
  const isAssignedDispatcher = (route) => {
    return currentUser?.role === 'DISPATCHER' &&
      route.dispatcher &&
      route.dispatcher.username === currentUser.username;
  };

  // DÃ©termine si l'utilisateur a le droit de modifier une tournÃ©e spÃ©cifique
  const canEditRoute = (route) => {
    return currentUser?.role === 'ADMIN' || isAssignedDispatcher(route);
  };

  // DÃ©terminer les drivers Ã  afficher dans la liste
  const getDriversForList = () => {
    return authErrors.driversError ? drivers : availableDrivers.length > 0 ? availableDrivers : drivers;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Affichage des alertes pour les erreurs d'autorisation */}
      {(authErrors.driversError || authErrors.dispatchersError) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Attention</AlertTitle>
          {authErrors.driversError && "Vous n'avez pas accÃ¨s Ã  certaines fonctionnalitÃ©s liÃ©es aux chauffeurs. "}
          {authErrors.dispatchersError && "Vous n'avez pas accÃ¨s Ã  certaines fonctionnalitÃ©s liÃ©es aux rÃ©partiteurs. "}
          Certaines fonctionnalitÃ©s peuvent Ãªtre limitÃ©es.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des tournÃ©es
        </Typography>

        <Box>
          <Tooltip title="RafraÃ®chir">
            <IconButton onClick={fetchData} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={loading || (authErrors.driversError && authErrors.dispatchersError)}
          >
            Nouvelle tournÃ©e
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : routes.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>Aucune tournÃ©e disponible</Typography>
            </Box>
          ) : (
            <Table stickyHeader aria-label="table des tournÃ©es">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Chauffeur</TableCell>
                  <TableCell>RÃ©partiteur</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((route) => (
                    <TableRow key={route.id} hover>
                      <TableCell>{route.id}</TableCell>
                      <TableCell>{route.name}</TableCell>
                      <TableCell>{route.driver?.username || 'Non assignÃ©'}</TableCell>
                      <TableCell>{route.dispatcher?.username || 'Non assignÃ©'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={route.status}
                          color={
                            route.status === 'COMPLETED' ? 'success' :
                              route.status === 'IN_PROGRESS' ? 'primary' :
                                route.status === 'CANCELLED' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{route.deliveryPoints?.length || 0}</TableCell>
                      <TableCell>
                        {route.startTime ? format(new Date(route.startTime), 'dd/MM/yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="Modifier">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditDialog(route)}
                                disabled={!canEditRoute(route)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Supprimer">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(route)}
                                disabled={!canEditRoute(route) || route.status === 'IN_PROGRESS'}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Optimiser">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleOptimizeRoute(route.id)}
                                disabled={route.status === 'COMPLETED' || route.status === 'CANCELLED'}
                              >
                                <MapIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          {canEditRoute(route) && route.status === 'PLANNED' && (
                            <Tooltip title="DÃ©marrer">
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(route.id, 'IN_PROGRESS')}
                                color="primary"
                              >
                                <RouteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canEditRoute(route) && route.status === 'IN_PROGRESS' && (
                            <Tooltip title="Terminer">
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(route.id, 'COMPLETED')}
                                color="success"
                              >
                                <RouteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={routes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      {/* Dialogue de crÃ©ation/Ã©dition de tournÃ©e */}
      <Dialog
        open={openRouteDialog}
        onClose={handleCloseRouteDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Nouvelle tournÃ©e' : 'Modifier la tournÃ©e'}
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Nom de la tournÃ©e"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.driverId}>
                  <InputLabel id="driver-label">Chauffeur</InputLabel>
                  <Select
                    labelId="driver-label"
                    id="driverId"
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleFormChange}
                    label="Chauffeur"
                    disabled={submitting || authErrors.driversError}
                  >
                    {getDriversForList().map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.username}
                        {driver.vehicleType && ` - ${driver.vehicleType}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.driverId && (
                    <Typography variant="caption" color="error">
                      {formErrors.driverId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.dispatcherId}>
                  <InputLabel id="dispatcher-label">RÃ©partiteur</InputLabel>
                  <Select
                    labelId="dispatcher-label"
                    id="dispatcherId"
                    name="dispatcherId"
                    value={formData.dispatcherId}
                    onChange={handleFormChange}
                    label="RÃ©partiteur"
                    disabled={submitting || (currentUser?.role === 'DISPATCHER') || authErrors.dispatchersError}
                  >
                    {dispatchers.map((dispatcher) => (
                      <MenuItem key={dispatcher.id} value={dispatcher.id}>
                        {dispatcher.username}
                        {dispatcher.department && ` - ${dispatcher.department}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.dispatcherId && (
                    <Typography variant="caption" color="error">
                      {formErrors.dispatcherId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formErrors.deliveryPointIds}>
                  <InputLabel id="delivery-points-label">Points de livraison</InputLabel>
                  <Select
                    labelId="delivery-points-label"
                    id="deliveryPointIds"
                    name="deliveryPointIds"
                    multiple
                    value={formData.deliveryPointIds}
                    onChange={handleFormChange}
                    label="Points de livraison"
                    disabled={submitting}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const deliveryPoint = deliveryPoints.find(dp => dp.id === value);
                          return (
                            <Chip
                              key={value}
                              label={deliveryPoint ? deliveryPoint.clientName : value}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {deliveryPoints
                      .filter(dp => dp.deliveryStatus !== 'COMPLETED' && dp.deliveryStatus !== 'FAILED')
                      .map((dp) => (
                        <MenuItem key={dp.id} value={dp.id}>
                          {dp.clientName} - {dp.address?.street}, {dp.address?.city}
                        </MenuItem>
                      ))}
                  </Select>
                  {formErrors.deliveryPointIds && (
                    <Typography variant="caption" color="error">
                      {formErrors.deliveryPointIds}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Date et heure de dÃ©but"
                    value={formData.startTime}
                    onChange={(date) => handleDateChange('startTime', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!formErrors.startTime,
                        helperText: formErrors.startTime,
                        disabled: submitting
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Date et heure de fin (optionnel)"
                    value={formData.endTime}
                    onChange={(date) => handleDateChange('endTime', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.endTime,
                        helperText: formErrors.endTime,
                        disabled: submitting
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Statut</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    label="Statut"
                    disabled={submitting}
                  >
                    <MenuItem value="PLANNED">PlanifiÃ©e</MenuItem>
                    <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                    <MenuItem value="COMPLETED">TerminÃ©e</MenuItem>
                    <MenuItem value="CANCELLED">AnnulÃ©e</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  multiline
                  rows={4}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseRouteDialog} disabled={submitting}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            disabled={submitting}
          >
            {dialogMode === 'create' ? 'CrÃ©er' : 'Mettre Ã  jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            ÃŠtes-vous sÃ»r de vouloir supprimer la tournÃ©e <strong>{routeToDelete?.name}</strong> ?
            Cette action est irrÃ©versible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            startIcon={<CloseIcon />}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteRoute}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            autoFocus
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default ManageRoutes;