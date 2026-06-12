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
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  getRoutesPaged,
  createRoute,
  updateRoute,
  deleteRoute,
  updateRouteStatus
} from '../../api/routes';
import { getAllDrivers, getAvailableDrivers } from '../../api/drivers';
import { getAllDispatchers } from '../../api/dispatchers';
import { getAllDeliveryPoints } from '../../api/deliveryPoints';

import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

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
  const [_totalPages, setTotalPages] = useState(0);

  const [authErrors, setAuthErrors] = useState({
    driversError: false,
    dispatchersError: false,
    routesError: false
  });

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

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const shouldAutoOpenCreateDialog = location.state?.openCreateDialog;
  const { success, error } = useAlert();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRoutes();
  }, [page, rowsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && shouldAutoOpenCreateDialog) {
      handleOpenCreateDialog();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, shouldAutoOpenCreateDialog]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRoutes = async () => {
    setLoading(true);
    setAuthErrors(prev => ({ ...prev, routesError: false }));
    try {
      const res = await getRoutesPaged(page, rowsPerPage);
      setRoutes(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, routesError: true }));
        error("Vous n'avez pas l'autorisation d'accéder aux tournées");
      } else {
        error('Erreur lors du chargement des tournées : ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setAuthErrors(prev => ({ ...prev, driversError: false, dispatchersError: false }));

    try {
      const res = await getAllDeliveryPoints();
      setDeliveryPoints(res.data);
    } catch (err) {
      error('Erreur lors du chargement des points de livraison : ' + (err.response?.data?.error || err.message));
    }

    try {
      const res = await getAvailableDrivers();
      setAvailableDrivers(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, driversError: true }));
        try {
          const res = await getAllDrivers();
          setDrivers(res.data);
        } catch (_e) {}
      } else {
        error('Erreur lors du chargement des chauffeurs : ' + (err.response?.data?.error || err.message));
      }
    }

    try {
      const res = await getAllDispatchers();
      setDispatchers(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthErrors(prev => ({ ...prev, dispatchersError: true }));
      } else {
        error('Erreur lors du chargement des répartiteurs : ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreateDialog = () => {
    if (authErrors.driversError && authErrors.dispatchersError) {
      error("Vous n'avez pas les autorisations nécessaires pour créer une tournée");
      return;
    }

    const initialData = {
      name: '',
      driverId: '',
      dispatcherId: '',
      deliveryPointIds: [],
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 8)),
      notes: '',
      status: 'PLANNED'
    };

    if (currentUser?.role === 'DISPATCHER') {
      const me = dispatchers.find(d => d.username === currentUser.username);
      if (me) initialData.dispatcherId = me.id;
    }

    setDialogMode('create');
    setFormData(initialData);
    setFormErrors({});
    setOpenRouteDialog(true);
  };

  const handleOpenEditDialog = (route) => {
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

  const handleCloseRouteDialog = () => {
    setOpenRouteDialog(false);
    setSelectedRoute(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Le nom de la tournée est obligatoire';
    if (!formData.driverId) errors.driverId = 'Veuillez sélectionner un chauffeur';
    if (!formData.dispatcherId && currentUser?.role === 'DISPATCHER') {
      errors.dispatcherId = 'Veuillez sélectionner un répartiteur';
    }
    if (formData.deliveryPointIds.length === 0) {
      errors.deliveryPointIds = 'Veuillez sélectionner au moins un point de livraison';
    }
    if (!formData.startTime) errors.startTime = 'La date et heure de début sont obligatoires';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    let submissionData = { ...formData };

    if (currentUser?.role === 'DISPATCHER' && !submissionData.dispatcherId) {
      const me = dispatchers.find(d => d.username === currentUser.username);
      if (me) {
        submissionData.dispatcherId = me.id;
      } else if (dispatchers.length > 0) {
        submissionData.dispatcherId = dispatchers[0].id;
      } else {
        error("Aucun répartiteur disponible. Veuillez contacter l'administrateur.");
        return;
      }
    }

    if (!submissionData.dispatcherId) submissionData.dispatcherId = null;

    setSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await createRoute(submissionData);
        success('Tournée créée avec succès');
      } else {
        await updateRoute(selectedRoute.id, submissionData);
        success('Tournée mise à jour avec succès');
      }
      handleCloseRouteDialog();
      fetchRoutes();
    } catch (err) {
      error(`Erreur lors de la ${dialogMode === 'create' ? 'création' : 'mise à jour'} de la tournée : ` + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (route) => {
    setRouteToDelete(route);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setRouteToDelete(null);
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;
    try {
      await deleteRoute(routeToDelete.id);
      success('Tournée supprimée avec succès');
      handleCloseDeleteDialog();
      fetchRoutes();
    } catch (err) {
      if (err.response?.status === 403) {
        error("Vous n'avez pas l'autorisation de supprimer une tournée");
      } else {
        error('Erreur lors de la suppression de la tournée : ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleUpdateStatus = async (routeId, newStatus) => {
    try {
      await updateRouteStatus(routeId, newStatus);
      success(`Statut mis à jour : ${newStatus}`);
      fetchRoutes();
    } catch (err) {
      if (err.response?.status === 403) {
        error("Vous n'avez pas l'autorisation de modifier le statut d'une tournée");
      } else {
        error('Erreur lors de la mise à jour du statut : ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleOptimizeRoute = (routeId) => {
    navigate(`/dispatcher/optimize?routeId=${routeId}`);
  };

  const isAssignedDispatcher = (route) =>
    currentUser?.role === 'DISPATCHER' &&
    route.dispatcher?.username === currentUser.username;

  const canEditRoute = (route) =>
    currentUser?.role === 'ADMIN' || isAssignedDispatcher(route);

  const getDriversForList = () =>
    authErrors.driversError ? drivers : availableDrivers.length > 0 ? availableDrivers : drivers;

  const dashboardPath = currentUser?.role === 'ADMIN' ? '/admin/dashboard' : '/dispatcher/dashboard';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {(authErrors.driversError || authErrors.dispatchersError) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Attention</AlertTitle>
          {authErrors.driversError && "Accès limité aux chauffeurs. "}
          {authErrors.dispatchersError && "Accès limité aux répartiteurs. "}
          Certaines fonctionnalités peuvent être restreintes.
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Tooltip title="Retour au tableau de bord">
          <IconButton onClick={() => navigate(dashboardPath)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Gestion des tournées
        </Typography>
        <Tooltip title="Rafraîchir">
          <span>
            <IconButton onClick={() => { fetchData(); fetchRoutes(); }} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </span>
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
