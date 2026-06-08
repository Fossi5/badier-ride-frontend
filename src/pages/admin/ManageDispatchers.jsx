// src/pages/admin/ManageDispatchers.jsx
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
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DeleteDispatcherDialog from './components/DeleteDispatcherDialog';

// Importation des services API
import { 
  getAllDispatchers, 
  getDispatcherById, 
  createDispatcher, 
  updateDispatcher, 
  deleteDispatcher 
} from '../../api/dispatchers';

// Importation des utilitaires
import { useAlert } from '../../context/AlertContext';
import { isValidEmail } from '../../utils/validators';
import DispatcherFormDialog from './components/DispatcherFormDialog';

const ManageDispatchers = () => {
  // État pour gérer les données des répartiteurs
  const [dispatchers, setDispatchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // État pour le dialogue du formulaire
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' ou 'edit'
  const [currentDispatcher, setCurrentDispatcher] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    department: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // État pour le dialogue de confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dispatcherToDelete, setDispatcherToDelete] = useState(null);
  
  // Notifications
  const { success, error } = useAlert();
  
  // Charger les données au montage du composant
  useEffect(() => {
    fetchDispatchers();
  }, []);
  
  // Fonction pour récupérer tous les répartiteurs
  const fetchDispatchers = async () => {
    setLoading(true);
    try {
      const response = await getAllDispatchers();
      setDispatchers(response.data);
    } catch (err) {
      error('Erreur lors du chargement des répartiteurs');
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
  
  // Ouverture du dialogue pour créer un nouveau répartiteur
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      username: '',
      password: '',
      email: '',
      department: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };
  
  // Ouverture du dialogue pour éditer un répartiteur existant
  const handleOpenEditDialog = async (dispatcherId) => {
    setDialogMode('edit');
    setFormErrors({});
    
    try {
      const response = await getDispatcherById(dispatcherId);
      const dispatcher = response.data;
      
      setCurrentDispatcher(dispatcher);
      setFormData({
        username: dispatcher.username,
        email: dispatcher.email,
        department: dispatcher.department || '',
        password: '' // Champ vide pour le mot de passe en mode édition
      });
      
      setOpenDialog(true);
    } catch (err) {
      error('Erreur lors de la récupération des détails du répartiteur');
      console.error('Erreur:', err);
    }
  };
  
  // Fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
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
    
    if (!formData.department) {
      errors.department = 'Le département est obligatoire';
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
        // Création d'un nouveau répartiteur
        await createDispatcher(formData);
        success('Répartiteur créé avec succès');
      } else {
        // Mise à jour d'un répartiteur existant
        const dispatcherId = currentDispatcher.id;
        // Si le mot de passe est vide, on ne l'envoie pas pour la mise à jour
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        
        await updateDispatcher(dispatcherId, dataToUpdate);
        success('Répartiteur mis à jour avec succès');
      }
      
      // Fermer le dialogue et rafraîchir la liste
      handleCloseDialog();
      fetchDispatchers();
    } catch (err) {
      error(`Erreur lors de la ${dialogMode === 'create' ? 'création' : 'mise à jour'} du répartiteur`);
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Ouverture du dialogue de confirmation de suppression
  const handleOpenDeleteDialog = (dispatcher) => {
    setDispatcherToDelete(dispatcher);
    setOpenDeleteDialog(true);
  };
  
  // Fermeture du dialogue de confirmation de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDispatcherToDelete(null);
  };
  
  // Suppression d'un répartiteur
  const handleDeleteDispatcher = async () => {
    if (!dispatcherToDelete) return;
    
    try {
      await deleteDispatcher(dispatcherToDelete.id);
      success('Répartiteur supprimé avec succès');
      
      // Fermer le dialogue et rafraîchir la liste
      handleCloseDeleteDialog();
      fetchDispatchers();
    } catch (err) {
      error('Erreur lors de la suppression du répartiteur');
      console.error('Erreur:', err);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des répartiteurs
        </Typography>
        
        <Box>
          <Tooltip title="Rafraîchir">
            <IconButton onClick={fetchDispatchers} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={loading}
          >
            Ajouter un répartiteur
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
            <Table stickyHeader aria-label="table des répartiteurs">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom d'utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dispatchers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((dispatcher) => (
                    <TableRow key={dispatcher.id} hover>
                      <TableCell>{dispatcher.id}</TableCell>
                      <TableCell>{dispatcher.username}</TableCell>
                      <TableCell>{dispatcher.email}</TableCell>
                      <TableCell>{dispatcher.department || '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(dispatcher.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => handleOpenDeleteDialog(dispatcher)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {dispatchers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucun répartiteur trouvé
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
          count={dispatchers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
      
      {/* Dialogue de création/édition */}
      <DispatcherFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        onChange={handleFormChange}
        loading={submitting}
      />
      
      <DeleteDispatcherDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteDispatcher}
        dispatcherName={dispatcherToDelete?.username}
      />
    </Container>
  );
};

export default ManageDispatchers;