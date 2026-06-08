// src/pages/admin/ManageDrivers.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Services API
import {
  getDriversPaged,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
} from '../../api/drivers';

// Utilitaires
import { useAlert } from '../../context/AlertContext';
import { isValidEmail, isValidPhone } from '../../utils/validators';

// Sous-composants
import DriverTable from './components/DriverTable';
import DriverFormDialog from './components/DriverFormDialog';
import DeleteDriverDialog from './components/DeleteDriverDialog';

const ManageDrivers = () => {
  // Données
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog formulaire
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentDriver, setCurrentDriver] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    vehicleType: '',
    isAvailable: true,
    latitude: '',
    longitude: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Dialog suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  const { success, error } = useAlert();

  useEffect(() => {
    fetchDrivers();
  }, [page, rowsPerPage]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await getDriversPaged(page, rowsPerPage);
      setDrivers(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      error('Erreur lors du chargement des chauffeurs');
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination ---
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Dialog formulaire ---
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      username: '',
      password: '',
      email: '',
      phoneNumber: '',
      vehicleType: '',
      isAvailable: true,
      latitude: '',
      longitude: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = async (driverId) => {
    setDialogMode('edit');
    setFormErrors({});

    try {
      const response = await getDriverById(driverId);
      const driver = response.data;

      setCurrentDriver(driver);
      setFormData({
        username: driver.username,
        email: driver.email,
        phoneNumber: driver.phoneNumber || '',
        vehicleType: driver.vehicleType || '',
        isAvailable: driver.isAvailable,
        latitude: driver.latitude || '',
        longitude: driver.longitude || '',
        password: ''
      });

      setOpenDialog(true);
    } catch (err) {
      error('Erreur lors de la récupération des détails du chauffeur');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username) {
      errors.username = "Le nom d'utilisateur est obligatoire";
    }

    if (dialogMode === 'create' && !formData.password) {
      errors.password = 'Le mot de passe est obligatoire';
    }

    if (!formData.email) {
      errors.email = "L'email est obligatoire";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Format de numéro de téléphone invalide';
    }

    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      errors.latitude = 'Latitude invalide (doit être entre -90 et 90)';
    }

    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      errors.longitude = 'Longitude invalide (doit être entre -180 et 180)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await createDriver(formData);
        success('Chauffeur créé avec succès');
      } else {
        const driverId = currentDriver.id;
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        await updateDriver(driverId, dataToUpdate);
        success('Chauffeur mis à jour avec succès');
      }

      handleCloseDialog();
      fetchDrivers();
    } catch (err) {
      error(`Erreur lors de la ${dialogMode === 'create' ? 'création' : 'mise à jour'} du chauffeur`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Dialog suppression ---
  const handleOpenDeleteDialog = (driver) => {
    setDriverToDelete(driver);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDriverToDelete(null);
  };

  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;

    try {
      await deleteDriver(driverToDelete.id);
      success('Chauffeur supprimé avec succès');
      handleCloseDeleteDialog();
      fetchDrivers();
    } catch (err) {
      error('Erreur lors de la suppression du chauffeur');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des chauffeurs
        </Typography>

        <Box>
          <Tooltip title="Rafraîchir">
            <IconButton onClick={fetchDrivers} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={loading}
          >
            Ajouter un chauffeur
          </Button>
        </Box>
      </Box>

      <DriverTable
        drivers={drivers}
        loading={loading}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <DriverFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        onChange={handleFormChange}
        loading={submitting}
      />

      <DeleteDriverDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteDriver}
        driverName={driverToDelete?.username}
      />
    </Container>
  );
};

export default ManageDrivers;
