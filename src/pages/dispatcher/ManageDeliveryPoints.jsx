// src/pages/dispatcher/ManageDeliveryPoints.jsx
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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

// Import des services API
import { 
  getAllDeliveryPoints, 
  getDeliveryPointsByStatus, 
  createDeliveryPoint, 
  updateDeliveryPoint, 
  deleteDeliveryPoint,
  updateDeliveryPointStatus
} from '../../api/deliveryPoints';
import { getAllAddresses } from '../../api/addresses';

// Import du contexte d'alerte
import { useAlert } from '../../context/AlertContext';

const ManageDeliveryPoints = () => {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  
  // États pour le dialogue de création/édition
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null);
  const [formData, setFormData] = useState({
    addressId: '',
    clientName: '',
    clientPhoneNumber: '',
    clientEmail: '',
    clientNote: '',
    deliveryNote: '',
    deliveryTime: new Date(),
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryStatus: 'PENDING'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // État pour le dialogue de confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  
  // Hooks et contextes
  const { success, error } = useAlert();
  
  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, []);
  
  // Effet pour filtrer les points de livraison par statut
  useEffect(() => {
    if (statusFilter) {
      fetchDeliveryPointsByStatus(statusFilter);
    } else {
      fetchAllDeliveryPoints();
    }
  }, [statusFilter]);
  
  // Fonction pour charger toutes les données nécessaires
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAllDeliveryPoints(), fetchAddresses()]);
    } catch (err) {
      error('Erreur lors du chargement des données: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour charger tous les points de livraison
  const fetchAllDeliveryPoints = async () => {
    try {
      const response = await getAllDeliveryPoints();
      setDeliveryPoints(response.data);
      return response.data;
    } catch (err) {
      error('Erreur lors du chargement des points de livraison: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
      return [];
    }
  };
  
  // Fonction pour charger les points de livraison par statut
  const fetchDeliveryPointsByStatus = async (status) => {
    try {
      const response = await getDeliveryPointsByStatus(status);
      setDeliveryPoints(response.data);
      return response.data;
    } catch (err) {
      error('Erreur lors du chargement des points de livraison: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
      return [];
    }
  };
  
  // Fonction pour charger les adresses
  const fetchAddresses = async () => {
    try {
      const response = await getAllAddresses();
      setAddresses(response.data);
      return response.data;
    } catch (err) {
      error('Erreur lors du chargement des adresses: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
      return [];
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
  
  // Gestion du changement de filtre par statut
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };
  
  // Ouverture du dialogue pour créer un nouveau point de livraison
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      addressId: '',
      clientName: '',
      clientPhoneNumber: '',
      clientEmail: '',
      clientNote: '',
      deliveryNote: '',
      deliveryTime: new Date(),
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryStatus: 'PENDING'
    });
    setFormErrors({});
    setOpenDialog(true);
  };
  
  // Ouverture du dialogue pour éditer un point de livraison existant
  const handleOpenEditDialog = (deliveryPoint) => {
    setDialogMode('edit');
    setSelectedDeliveryPoint(deliveryPoint);
    setFormData({
      addressId: deliveryPoint.address.id,
      clientName: deliveryPoint.clientName,
      clientPhoneNumber: deliveryPoint.clientPhoneNumber || '',
      clientEmail: deliveryPoint.clientEmail || '',
      clientNote: deliveryPoint.clientNote || '',
      deliveryNote: deliveryPoint.deliveryNote || '',
      deliveryTime: deliveryPoint.deliveryTime ? new Date(deliveryPoint.deliveryTime) : new Date(),
      deliveryDate: deliveryPoint.deliveryDate || new Date().toISOString().split('T')[0],
      deliveryStatus: deliveryPoint.deliveryStatus
    });
    setFormErrors({});
    setOpenDialog(true);
  };
  
  // Fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDeliveryPoint(null);
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
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      deliveryTime: date
    });
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (formErrors.deliveryTime) {
      setFormErrors({
        ...formErrors,
        deliveryTime: null
      });
    }
  };
  
  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.addressId) {
      errors.addressId = 'Veuillez sélectionner une adresse';
    }
    
    if (!formData.clientName) {
      errors.clientName = 'Le nom du client est obligatoire';
    }
    
    if (!formData.deliveryTime) {
      errors.deliveryTime = 'La date et heure de livraison sont obligatoires';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Formatage de la date pour l'API
      const formattedDate = format(formData.deliveryTime, "yyyy-MM-dd'T'HH:mm:ss");
      const deliveryPointData = {
        ...formData,
        deliveryTime: formattedDate
      };
      
      if (dialogMode === 'create') {
        // Création d'un nouveau point de livraison
        await createDeliveryPoint(deliveryPointData);
        success('Point de livraison créé avec succès');
      } else {
        // Mise à jour d'un point de livraison existant
        await updateDeliveryPoint(selectedDeliveryPoint.id, deliveryPointData);
        success('Point de livraison mis à jour avec succès');
      }
      
      // Fermer le dialogue et rafraîchir la liste
      handleCloseDialog();
      fetchData();
    } catch (err) {
      error(`Erreur lors de la ${dialogMode === 'create' ? 'création' : 'mise à jour'} du point de livraison: ` + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Mise à jour du statut d'un point de livraison
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDeliveryPointStatus(id, newStatus);
      success(`Statut du point de livraison mis à jour: ${newStatus}`);
      fetchData();
    } catch (err) {
      error('Erreur lors de la mise à jour du statut: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    }
  };
  
  // Ouverture du dialogue de confirmation de suppression
  const handleOpenDeleteDialog = (deliveryPoint) => {
    setPointToDelete(deliveryPoint);
    setOpenDeleteDialog(true);
  };
  
  // Fermeture du dialogue de confirmation de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setPointToDelete(null);
  };
  
  // Suppression d'un point de livraison
  const handleDeleteDeliveryPoint = async () => {
    if (!pointToDelete) return;
    
    try {
      await deleteDeliveryPoint(pointToDelete.id);
      success('Point de livraison supprimé avec succès');
      
      // Fermer le dialogue et rafraîchir la liste
      handleCloseDeleteDialog();
      fetchData();
    } catch (err) {
      error('Erreur lors de la suppression du point de livraison: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    }
  };
  
  // Fonction pour formater l'adresse
  const formatAddress = (address) => {
    if (!address) return 'Adresse inconnue';
    const { street, city, postalCode, country } = address;
    return `${street}, ${postalCode} ${city}, ${country || ''}`.trim();
  };
  
  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      case 'FAILED':
        return 'Échec';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des points de livraison
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
            disabled={loading}
          >
            Nouveau point de livraison
          </Button>
        </Box>
      </Box>
      
      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Filtrer par statut</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Filtrer par statut"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="PENDING">En attente</MenuItem>
                <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                <MenuItem value="COMPLETED">Terminé</MenuItem>
                <MenuItem value="FAILED">Échec</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader aria-label="table des points de livraison">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Date prévue</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryPoints
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((point) => (
                    <TableRow key={point.id} hover>
                      <TableCell>{point.id}</TableCell>
                      <TableCell>{point.clientName}</TableCell>
                      <TableCell>
                        {point.clientPhoneNumber && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {point.clientPhoneNumber}
                          </Box>
                        )}
                        {point.clientEmail && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {point.clientEmail}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{formatAddress(point.address)}</TableCell>
                      <TableCell>
                        {point.plannedTime ? format(new Date(point.plannedTime), 'dd/MM/yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={getStatusText(point.deliveryStatus)} 
                          color={getStatusColor(point.deliveryStatus)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={() => handleOpenEditDialog(point)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDeleteDialog(point)}
                              disabled={point.deliveryStatus === 'IN_PROGRESS'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {point.deliveryStatus === 'PENDING' && (
                            <Tooltip title="Marquer en cours">
                              <IconButton 
                                size="small" 
                                onClick={() => handleUpdateStatus(point.id, 'IN_PROGRESS')}
                                color="warning"
                              >
                                <LocationIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {point.deliveryStatus === 'IN_PROGRESS' && (
                            <>
                              <Tooltip title="Marquer terminé">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleUpdateStatus(point.id, 'COMPLETED')}
                                  color="success"
                                >
                                  <LocationIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Marquer échec">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleUpdateStatus(point.id, 'FAILED')}
                                  color="error"
                                >
                                  <LocationIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {deliveryPoints.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun point de livraison trouvé
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
          count={deliveryPoints.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
      
      {/* Dialogue de création/édition de point de livraison */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Nouveau point de livraison' : 'Modifier le point de livraison'}
        </DialogTitle>
        
        <Divider />
        
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formErrors.addressId}>
                  <InputLabel id="address-label">Adresse</InputLabel>
                  <Select
                    labelId="address-label"
                    id="addressId"
                    name="addressId"
                    value={formData.addressId}
                    onChange={handleFormChange}
                    label="Adresse"
                    disabled={submitting}
                  >
                    {addresses.map((address) => (
                      <MenuItem key={address.id} value={address.id}>
                        {formatAddress(address)}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.addressId && (
                    <Typography variant="caption" color="error">
                      {formErrors.addressId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="clientName"
                  label="Nom du client"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleFormChange}
                  error={!!formErrors.clientName}
                  helperText={formErrors.clientName}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="clientPhoneNumber"
                  label="Numéro de téléphone"
                  name="clientPhoneNumber"
                  value={formData.clientPhoneNumber}
                  onChange={handleFormChange}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="clientEmail"
                  label="Email du client"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={handleFormChange}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Date et heure de livraison"
                    value={formData.deliveryTime}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!formErrors.deliveryTime,
                        helperText: formErrors.deliveryTime,
                        disabled: submitting
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Statut</InputLabel>
                  <Select
                    labelId="status-label"
                    id="deliveryStatus"
                    name="deliveryStatus"
                    value={formData.deliveryStatus}
                    onChange={handleFormChange}
                    label="Statut"
                    disabled={submitting}
                  >
                    <MenuItem value="PENDING">En attente</MenuItem>
                    <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                    <MenuItem value="COMPLETED">Terminé</MenuItem>
                    <MenuItem value="FAILED">Échec</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="clientNote"
                  label="Note du client"
                  name="clientNote"
                  value={formData.clientNote}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="deliveryNote"
                  label="Note de livraison"
                  name="deliveryNote"
                  value={formData.deliveryNote}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
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
            Êtes-vous sûr de vouloir supprimer le point de livraison pour <strong>{pointToDelete?.clientName}</strong> ?
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
            onClick={handleDeleteDeliveryPoint} 
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

export default ManageDeliveryPoints;