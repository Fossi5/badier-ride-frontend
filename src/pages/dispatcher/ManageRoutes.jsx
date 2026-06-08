// src/pages/dispatcher/ManageRoutes.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

// Import des services API
import {
  getRoutesPaged,
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

// Import des sous-composants
import RouteTable from './components/RouteTable';
import RouteFormDialog from './components/RouteFormDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  // Charger les données au montage du composant (drivers, dispatchers, delivery points)
  useEffect(() => {
    fetchData();
  }, []);

  // Recharger les routes quand la page ou le nombre de lignes change
  useEffect(() => {
    fetchRoutes();
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (!loading && shouldAutoOpenCreateDialog) {
      handleOpenCreateDialog();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, shouldAutoOpenCreateDialog, location.pathname, navigate]);

  // Fonction pour charger uniquement les tournées (paginées)
  const fetchRoutes = async () => {
    setLoading(true);
    setAuthErrors(prev => ({ ...prev, routesError: false }));
    try {
      const routesRes = await getRoutesPaged(page, rowsPerPage);
      setRoutes(routesRes.data.content);
      setTotalElements(routesRes.data.totalElements);
      setTotalPages(routesRes.data.totalPages);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, routesError: true }));
        error("Vous n'avez pas l'autorisation d'accéder aux tournées");
      } else {
        error('Erreur lors du chargement des tournées: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les données de référence (drivers, dispatchers, points de livraison)
  // Les tournées sont chargées séparément via fetchRoutes (useEffect sur page/rowsPerPage)
  const fetchData = async () => {
    // Réinitialiser les erreurs d'autorisation non liées aux routes
    setAuthErrors(prev => ({
      ...prev,
      driversError: false,
      dispatchersError: false
    }));

    // Charger les points de livraison (complets, pour les selects du formulaire)
    try {
      const deliveryPointsRes = await getAllDeliveryPoints();
      setDeliveryPoints(deliveryPointsRes.data);
    } catch (err) {
      error('Erreur lors du chargement des points de livraison: ' + (err.response?.data?.error || err.message));
    }

    // Charger les chauffeurs disponibles (complets, pour les selects)
    try {
      const availableDriversRes = await getAvailableDrivers();
      setAvailableDrivers(availableDriversRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, driversError: true }));
        // Pas d'accès aux chauffeurs disponibles : fallback sur la liste complète des chauffeurs
        try {
          const driversRes = await getAllDrivers();
          setDrivers(driversRes.data);
        } catch (driverErr) {
          // Échec du fallback chauffeurs : aucune liste disponible
        }
      } else {
        error('Erreur lors du chargement des chauffeurs disponibles: ' + (err.response?.data?.error || err.message));
      }
    }

    // Charger les répartiteurs (complets, pour les selects)
    try {
      const dispatchersRes = await getAllDispatchers();
      setDispatchers(dispatchersRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, dispatchersError: true }));
      } else {
        error('Erreur lors du chargement des répartiteurs: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Gestion du changement de page (côté serveur)
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
      fetchRoutes();
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
      fetchRoutes();
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
      fetchRoutes();
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
            <IconButton onClick={() => { fetchData(); fetchRoutes(); }} disabled={loading} sx={{ mr: 1 }}>
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


      <RouteTable
        routes={routes}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
        onOptimize={handleOptimizeRoute}
        onUpdateStatus={handleUpdateStatus}
        canEditRoute={canEditRoute}
      />

      <RouteFormDialog
        open={openRouteDialog}
        onClose={handleCloseRouteDialog}
        onSubmit={handleSubmit}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        submitting={submitting}
        drivers={getDriversForList()}
        dispatchers={dispatchers}
        deliveryPoints={deliveryPoints}
        authErrors={authErrors}
        currentUserRole={currentUser?.role}
        onFormChange={handleFormChange}
        onDateChange={handleDateChange}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteRoute}
        routeName={routeToDelete?.name}
      />
    </Container>
  );
};
export default ManageRoutes;
