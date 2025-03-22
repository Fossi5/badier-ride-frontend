// src/pages/admin/ManageDrivers.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Importation des services API
import { 
  getAllDrivers, 
  getDriverById, 
  createDriver, 
  updateDriver, 
  deleteDriver 
} from '../../api/drivers';

// Importation des utilitaires
import { useAlert } from '../../context/AlertContext';
import { isValidEmail, isValidPhone } from '../../utils/validators';

const ManageDrivers = () => {
  // État pour gérer les données des chauffeurs
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // État pour le dialogue du formulaire
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' ou 'edit'
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
  
  // État pour le dialogue de confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  
  // Notifications
  const { success, error } = useAlert();
  
  // Charger les données au montage du composant
  useEffect(() => {
    fetchDrivers();
  }, []);
  
  // Fonction pour récupérer tous les chauffeurs
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await getAllDrivers();
      setDrivers(response.data);
    } catch (err) {
      error('Erreur lors du chargement des chauffeurs');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
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
  
  // Ouverture du dialogue pour créer un nouveau chauffeur
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
  
  // Ouverture du dialogue pour éditer un chauffeur existant
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
        password: '' // Champ vide pour le mot de passe en mode édition
      });
      
      setOpenDialog(true);
    } catch (err) {
      error('Erreur lors de la récupération des détails du chauffeur');
      console.error('Erreur:', err);
    }
  };
  
  // Fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Gestion des changements de champs du formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = 'Le nom d\'utilisateur est obligatoire';
    }
    
    if (dialogMode === 'create' && !formData.password) {
      errors.password = 'Le mot de passe est obligatoire';
    }
    
    if (!formData.email) {
      errors.email = 'L\'email est obligatoire';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Format d\'email invalide';
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
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      if (dialogMode === 'create') {
        // Création d'un nouveau chauffeur
        await createDriver(formData);
        success('Chauffeur créé avec succès');
      } else {
        // Mise à jour d'un chauffeur existant
        const driverId = currentDriver.id;
        // Si le mot de passe est vide, on ne l'envoie pas pour la mise à jour
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        
        await updateDriver(driverId, dataToUpdate);
        success('Chauffeur mis à jour avec succès');
      }
      
      // Fermer le dialogue et rafraîchir la liste
      handleCloseDialog();
      fetchDrivers();
    } catch (err) {
      error(`Erreur lors de la ${dialogMode === 'create' ? 'création' : 'mise à jour'} du chauffeur`);
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Ouverture du dialogue de confirmation de suppression
  const handleOpenDeleteDialog = (driver) => {
    setDriverToDelete(driver);
    setOpenDeleteDialog(true);
  };
  
  // Fermeture du dialogue de confirmation de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDriverToDelete(null);
  };
  
  // Suppression d'un chauffeur
  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    try {
      await deleteDriver(driverToDelete.id);
      success('Chauffeur supprimé avec succès');
      
      // Fermer le dialogue et rafraîchir la liste
      handleCloseDeleteDialog();
      fetchDrivers();
    } catch (err) {
      error('Erreur lors de la suppression du chauffeur');
      console.error('Erreur:', err);
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
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader aria-label="table des chauffeurs">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom d'utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Type de véhicule</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((driver) => (
                    <TableRow key={driver.id} hover>
                      <TableCell>{driver.id}</TableCell>
                      <TableCell>{driver.username}</TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>{driver.phoneNumber || '-'}</TableCell>
                      <TableCell>{driver.vehicleType || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={driver.isAvailable ? 'Disponible' : 'Indisponible'} 
                          color={driver.isAvailable ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(driver.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => handleOpenDeleteDialog(driver)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {drivers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun chauffeur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={drivers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
      
      {/* Dialogue de création/édition */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Ajouter un chauffeur' : 'Modifier le chauffeur'}
        </DialogTitle>
        
        <Divider />
        
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nom d'utilisateur"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleFormChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={submitting}
            />
            
            <TextField
              margin="normal"
              required={dialogMode === 'create'}
              fullWidth
              name="password"
              label={dialogMode === 'create' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleFormChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={submitting}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleFormChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={submitting}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="phoneNumber"
              label="Numéro de téléphone"
              name="phoneNumber"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={handleFormChange}
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              disabled={submitting}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="vehicleType"
              label="Type de véhicule"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleFormChange}
              disabled={submitting}
            />
            
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                margin="normal"
                fullWidth
                id="latitude"
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleFormChange}
                error={!!formErrors.latitude}
                helperText={formErrors.latitude}
                disabled={submitting}
                sx={{ mr: 1 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="longitude"
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleFormChange}
                error={!!formErrors.longitude}
                helperText={formErrors.longitude}
                disabled={submitting}
                sx={{ ml: 1 }}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAvailable}
                  onChange={handleFormChange}
                  name="isAvailable"
                  color="primary"
                  disabled={submitting}
                />
              }
              label="Disponible"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
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
            Êtes-vous sûr de vouloir supprimer le chauffeur <strong>{driverToDelete?.username}</strong> ?
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
            onClick={handleDeleteDriver} 
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

export default ManageDrivers;