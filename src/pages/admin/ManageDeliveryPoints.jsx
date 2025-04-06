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
import { format } from 'date-fns';

// Import du composant DeliveryPointForm modifié
import DeliveryPointForm from '../../components/forms/DeliveryPointForm';

// Import des services API
import { 
  getAllDeliveryPoints, 
  getDeliveryPointsByStatus, 
  createDeliveryPoint, 
  updateDeliveryPoint, 
  deleteDeliveryPoint,
  updateDeliveryPointStatus
} from '../../api/deliveryPoints';

// Import du contexte d'alerte
import { useAlert } from '../../context/AlertContext';

const ManageDeliveryPoints = () => {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  
  // États pour le dialogue de création/édition
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null);
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
      await fetchAllDeliveryPoints();
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
    setSelectedDeliveryPoint(null);
    setOpenDialog(true);
  };
  
  // Ouverture du dialogue pour éditer un point de livraison existant
  const handleOpenEditDialog = (deliveryPoint) => {
    setDialogMode('edit');
    setSelectedDeliveryPoint({
      ...deliveryPoint,
      // Formatage des données pour le formulaire
      clientName: deliveryPoint.clientName,
      clientPhoneNumber: deliveryPoint.clientPhoneNumber || '',
      clientEmail: deliveryPoint.clientEmail || '',
      clientNote: deliveryPoint.clientNote || '',
      deliveryNote: deliveryPoint.deliveryNote || '',
      deliveryTime: deliveryPoint.deliveryTime ? new Date(deliveryPoint.deliveryTime) : new Date(),
      deliveryStatus: deliveryPoint.deliveryStatus,
      // Ajout des données d'adresse
      address: {
        id: deliveryPoint.address.id,
        street: deliveryPoint.address.street,
        city: deliveryPoint.address.city,
        postalCode: deliveryPoint.address.postalCode,
        country: deliveryPoint.address.country,
        latitude: deliveryPoint.address.latitude,
        longitude: deliveryPoint.address.longitude,
        isVerified: deliveryPoint.address.isVerified
      }
    });
    setOpenDialog(true);
  };
  
  // Fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDeliveryPoint(null);
  };
  
  // Soumission du formulaire via le composant DeliveryPointForm
  const handleSubmitDeliveryPoint = async (formData) => {
    setSubmitting(true);
    
    try {
      if (dialogMode === 'create') {
        // Création d'un nouveau point de livraison
        await createDeliveryPoint(formData);
        success('Point de livraison créé avec succès');
      } else {
        // Mise à jour d'un point de livraison existant
        await updateDeliveryPoint(selectedDeliveryPoint.id, formData);
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
         <span>
          <IconButton onClick={fetchData} disabled={loading} sx={{ mr: 1 }}>
          <RefreshIcon />
          </IconButton>
         </span>
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
          {/* Utilisation du composant DeliveryPointForm modifié */}
          <DeliveryPointForm
            initialData={selectedDeliveryPoint}
            onSubmit={handleSubmitDeliveryPoint}
            onCancel={handleCloseDialog}
            submitting={submitting}
          />
        </DialogContent>
        
        {/* Nous n'avons plus besoin des DialogActions car les boutons sont déjà inclus dans le DeliveryPointForm */}
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