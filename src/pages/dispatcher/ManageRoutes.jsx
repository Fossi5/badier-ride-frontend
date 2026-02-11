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

  // États pour les erreurs d'autorisations
  const [authErrors, setAuthErrors] = useState({
    driversError: false,
    dispatchersError: false,
    routesError: false
  });

  // États pour le dialogue de création/édition
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

  // État pour le dialogue de confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

  // Hooks et contextes
  const navigate = useNavigate();
  const location = useLocation();
  const shouldAutoOpenCreateDialog = location.state?.openCreateDialog;
  const { success, error, } = useAlert();
  const { currentUser } = useAuth();

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && shouldAutoOpenCreateDialog) {
      handleOpenCreateDialog();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, shouldAutoOpenCreateDialog, location.pathname, navigate]);

  // Fonction pour charger toutes les données nécessaires
  const fetchData = async () => {
    setLoading(true);

    // Réinitialiser les erreurs d'autorisation
    setAuthErrors({
      driversError: false,
      dispatchersError: false,
      routesError: false
    });

    // Charger les tournées
    try {
      const routesRes = await getAllRoutes();
      setRoutes(routesRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, routesError: true }));
        error("Vous n'avez pas l'autorisation d'accéder aux tournées");
      } else {
        error('Erreur lors du chargement des tournées: ' + (err.response?.data?.error || err.message));
      }
      console.error('Erreur routes:', err);
    }

    // Charger les points de livraison
    try {
      const deliveryPointsRes = await getAllDeliveryPoints();
      setDeliveryPoints(deliveryPointsRes.data);
    } catch (err) {
      error('Erreur lors du chargement des points de livraison: ' + (err.response?.data?.error || err.message));
      console.error('Erreur points de livraison:', err);
    }

    // Charger les chauffeurs disponibles
    try {
      const availableDriversRes = await getAvailableDrivers();
      setAvailableDrivers(availableDriversRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, driversError: true }));
        console.warn("Pas d'accès aux chauffeurs disponibles, utilisation des chauffeurs standards");

        // Tenter de charger les chauffeurs standards comme fallback
        try {
          const driversRes = await getAllDrivers();
          setDrivers(driversRes.data);
        } catch (driverErr) {
          console.error('Erreur fallback chauffeurs:', driverErr);
        }
      } else {
        error('Erreur lors du chargement des chauffeurs disponibles: ' + (err.response?.data?.error || err.message));
        console.error('Erreur chauffeurs disponibles:', err);
      }
    }

    // Charger les répartiteurs
    try {
      const dispatchersRes = await getAllDispatchers();
      setDispatchers(dispatchersRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, dispatchersError: true }));
        console.warn("Pas d'accès aux répartiteurs");
      } else {
        error('Erreur lors du chargement des répartiteurs: ' + (err.response?.data?.error || err.message));
        console.error('Erreur répartiteurs:', err);
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

  // Ouverture du dialogue pour créer une nouvelle tournée
  const handleOpenCreateDialog = () => {
    // Vérifier si toutes les données nécessaires sont disponibles
    if (authErrors.driversError && authErrors.dispatchersError) {
      error("Vous n'avez pas les autorisations nécessaires pour créer une tournée");
      return;
    }

    // Préremplir avec le dispatcher actuel si l'utilisateur est un dispatcher
    let initialData = {
      name: '',
      driverId: '',
      dispatcherId: '',
      deliveryPointIds: [],
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 8)), // Par défaut 8h plus tard
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

  // Ouverture du dialogue pour éditer une tournée existante
  const handleOpenEditDialog = (route) => {
    // Vérifier si toutes les données nécessaires sont disponibles
    if (authErrors.driversError && authErrors.dispatchersError) {
      error("Vous n'avez pas les autorisations nécessaires pour modifier une tournée");
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

  // Validation du formulaire
  /*const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Le nom de la tournée est obligatoire';
    }
    
    if (!formData.driverId) {
      errors.driverId = 'Veuillez sélectionner un chauffeur';
    }
    
    if (!formData.dispatcherId) {
      errors.dispatcherId = 'Veuillez sélectionner un répartiteur';
    }
    
    if (formData.deliveryPointIds.length === 0) {
      errors.deliveryPointIds = 'Veuillez sélectionner au moins un point de livraison';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'La date et heure de début sont obligatoires';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };*/

  // Soumission du formulaire
  /*const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const routeData = {
        ...formData,
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      
      if (dialogMode === 'create') {
        // Création d'une nouvelle tournée
        await createRoute(routeData);
        success('Tournée créée avec succès');
      } else {
        // Mise à jour d'une tournée existante
        await updateRoute(selectedRoute.id, routeData);
        success('Tournée mise à jour avec succès');
      }
      
      // Fermer le dialogue et rafraîchir la liste
      handleCloseRouteDialog();
      fetchData();
    } catch (err) {
      if (err.response?.status === 403) {
        error(`Vous n'avez pas l'autorisation de ${dialogMode === 'create' ? 'créer' : 'modifier'} une tournée`);
      } else {
        error(`Erreur lors de la ${dialogMode === 'create' ? 'création' : 'mise à jour'} de la tournée: ` + (err.response?.data?.error || err.message));
      }
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };*/

  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Le nom de la tournée est obligatoire';
    }

    if (!formData.driverId) {
      errors.driverId = 'Veuillez sélectionner un chauffeur';
    }

    // Ne validez le champ dispatcherId que si l'utilisateur n'est pas un dispatcher
    if (!formData.dispatcherId && currentUser?.role !== 'DISPATCHER') {
      errors.dispatcherId = 'Veuillez sélectionner un répartiteur';
    }

    if (formData.deliveryPointIds.length === 0) {
      errors.deliveryPointIds = 'Veuillez sélectionner au moins un point de livraison';
    }

    if (!formData.startTime) {
      errors.startTime = 'La date et heure de début sont obligatoires';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // S'assurer que le dispatcherId est défini pour un dispatcher
    let submissionData = { ...formData };

    if (currentUser?.role === 'DISPATCHER') {
      if (submissionData.dispatcherId) {
        console.log('Dispatcher ID déjà défini dans le formulaire:', submissionData.dispatcherId);
      }
      else if (currentUser.username) {
        console.log('Recherche dispatcher pour username:', currentUser.username);
        const currentDispatcher = dispatchers.find(d => d.username === currentUser.username);

        if (currentDispatcher) {
          submissionData.dispatcherId = currentDispatcher.id;
          console.log('Dispatcher ID défini automatiquement:', currentDispatcher.id);
        }
        else {
          console.warn("Dispatcher non trouvé dans la liste avec username:", currentUser.username);

          // Fallback au premier dispatcher si aucun correspondant n'est trouvé
          if (dispatchers.length > 0) {
            submissionData.dispatcherId = dispatchers[0].id;
            console.log('Dispatcher ID forcé au premier de la liste:', dispatchers[0].id);
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
        console.log('Dispatcher ID forcé au premier de la liste (aucun username):', dispatchers[0].id);
      } else {
        error("Aucun dispatcher disponible. Veuillez contacter l'administrateur.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);

    try {
      console.log('Envoi de la requête avec données:', submissionData);

      if (dialogMode === 'create') {
        const result = await createRoute(submissionData);
        console.log('Création réussie, résultat:', result);
        success('Tournée créée avec succès');
      } else {
        const result = await updateRoute(selectedRoute.id, submissionData);
        console.log('Mise à jour réussie, résultat:', result);
        success('Tournée mise à jour avec succès');
      }

      handleCloseRouteDialog();
      fetchData();
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      error(`Erreur lors de la ${dialogMode === 'create' ? 'création' : 'mise à jour'} de la tournée: ` + (err.response?.data?.error || err.message));
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

  // Suppression d'une tournée
  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;

    try {
      await deleteRoute(routeToDelete.id);
      success('Tournée supprimée avec succès');

      // Fermer le dialogue et rafraîchir la liste
      handleCloseDeleteDialog();
      fetchData();
    } catch (err) {
      if (err.response?.status === 403) {
        error("Vous n'avez pas l'autorisation de supprimer une tournée");
      } else {
        error('Erreur lors de la suppression de la tournée: ' + (err.response?.data?.error || err.message));
      }
      console.error('Erreur:', err);
    }
  };

  // Mise à jour du statut d'une tournée
  const handleUpdateStatus = async (routeId, newStatus) => {
    try {
      await updateRouteStatus(routeId, newStatus);
      success(`Statut de la tournée mis à jour: ${newStatus}`);
      fetchData();
    } catch (err) {
      if (err.response?.status === 403) {
        error("Vous n'avez pas l'autorisation de modifier le statut d'une tournée");
      } else {
        error('Erreur lors de la mise à jour du statut: ' + (err.response?.data?.error || err.message));
      }
      console.error('Erreur:', err);
    }
  };

  // Navigation vers la page d'optimisation
  const handleOptimizeRoute = (routeId) => {
    navigate(`/dispatcher/optimize?routeId=${routeId}`);
  };

  // Détermine si l'utilisateur courant est le dispatcher assigné à la tournée
  const isAssignedDispatcher = (route) => {
    return currentUser?.role === 'DISPATCHER' &&
      route.dispatcher &&
      route.dispatcher.username === currentUser.username;
  };

  // Détermine si l'utilisateur a le droit de modifier une tournée spécifique
  const canEditRoute = (route) => {
    return currentUser?.role === 'ADMIN' || isAssignedDispatcher(route);
  };

  // Déterminer les drivers à afficher dans la liste
  const getDriversForList = () => {
    return authErrors.driversError ? drivers : availableDrivers.length > 0 ? availableDrivers : drivers;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Affichage des alertes pour les erreurs d'autorisation */}
      {(authErrors.driversError || authErrors.dispatchersError) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Attention</AlertTitle>
          {authErrors.driversError && "Vous n'avez pas accès à certaines fonctionnalités liées aux chauffeurs. "}
          {authErrors.dispatchersError && "Vous n'avez pas accès à certaines fonctionnalités liées aux répartiteurs. "}
          Certaines fonctionnalités peuvent être limitées.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des tournées
        </Typography>

        <Box>
          <Tooltip title="Rafraîchir">
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
            Nouvelle tournée
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
              <Typography>Aucune tournée disponible</Typography>
            </Box>
          ) : (
            <Table stickyHeader aria-label="table des tournées">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Chauffeur</TableCell>
                  <TableCell>Répartiteur</TableCell>
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
                      <TableCell>{route.driver?.username || 'Non assigné'}</TableCell>
                      <TableCell>{route.dispatcher?.username || 'Non assigné'}</TableCell>
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
                            <Tooltip title="Démarrer">
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

      {/* Dialogue de création/édition de tournée */}
      <Dialog
        open={openRouteDialog}
        onClose={handleCloseRouteDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Nouvelle tournée' : 'Modifier la tournée'}
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
                  label="Nom de la tournée"
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
                  <InputLabel id="dispatcher-label">Répartiteur</InputLabel>
                  <Select
                    labelId="dispatcher-label"
                    id="dispatcherId"
                    name="dispatcherId"
                    value={formData.dispatcherId}
                    onChange={handleFormChange}
                    label="Répartiteur"
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
                    label="Date et heure de début"
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
                    <MenuItem value="PLANNED">Planifiée</MenuItem>
                    <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                    <MenuItem value="COMPLETED">Terminée</MenuItem>
                    <MenuItem value="CANCELLED">Annulée</MenuItem>
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
            {dialogMode === 'create' ? 'Créer' : 'Mettre à jour'}
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
            Êtes-vous sûr de vouloir supprimer la tournée <strong>{routeToDelete?.name}</strong> ?
            Cette action est irréversible.
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