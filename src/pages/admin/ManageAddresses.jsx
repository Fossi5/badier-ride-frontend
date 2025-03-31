// src/pages/admin/ManageAddresses.jsx
import React, { useEffect, useState } from 'react';
import {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  checkDuplicateAddresses
} from '../../api/addresses';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddressForm from '../../components/forms/AddressForm';
import DataTable from '../../components/tables/DataTable';
import { useAlert } from '../../context/AlertContext';

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { success, error } = useAlert();

  const fetchAddresses = async () => {
    console.log('Début fetchAddresses');
    setLoading(true);
    try {
      console.log('Appel de getAllAddresses...');
      const res = await getAllAddresses();
      console.log('Résultat de getAllAddresses:', res);
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Erreur détaillée lors du chargement des adresses:', err);
      error(`Erreur lors du chargement des adresses: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    console.log('Ouverture du formulaire d\'ajout');
    setEditAddress(null);
    setModalOpen(true);
  };

  const handleEdit = (address) => {
    console.log('Ouverture du formulaire d\'édition');
    console.log('Adresse à éditer:', address);
    // Créer une copie explicite pour éviter les problèmes de référence
    setEditAddress({...address});
    setModalOpen(true);
  };

  const handleDeleteConfirm = (address) => {
    console.log('Confirmation de suppression');
    console.log('Adresse à supprimer:', address);
    // Créer une copie explicite pour éviter les problèmes de référence
    setConfirmDelete({...address});
  };

  const handleDelete = async () => {
    if (!confirmDelete || !confirmDelete.id) {
      console.error('Tentative de suppression sans ID valide');
      setConfirmDelete(null);
      return;
    }
    
    console.log('Début de la suppression, ID:', confirmDelete.id);
    
    setSubmitting(true);
    try {
      await deleteAddress(confirmDelete.id);
      success('Adresse supprimée avec succès');
      setConfirmDelete(null); // Important: réinitialiser avant fetchAddresses
      await fetchAddresses();
    } catch (err) {
      console.error('Erreur détaillée lors de la suppression:', err);
      error(`Échec de la suppression: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
    // Un petit délai pour s'assurer que le modal est fermé avant de réinitialiser
    setTimeout(() => {
      setEditAddress(null);
    }, 100);
  };

  const handleSubmit = async (data) => {
    console.log('Début soumission du formulaire');
    console.log('Données du formulaire:', data);
    
    setSubmitting(true);
    try {
      // Vérifier les doublons potentiels pour les nouvelles adresses
      if (!editAddress) {
        try {
          console.log('Vérification des doublons...');
          const checkResult = await checkDuplicateAddresses(data);
          console.log('Résultat vérification doublons:', checkResult);
          
          if (checkResult.data && checkResult.data.hasDuplicates) {
            error('Une adresse similaire existe déjà. Veuillez vérifier les adresses existantes.');
            setSubmitting(false);
            return;
          }
        } catch (checkErr) {
          console.warn("Impossible de vérifier les doublons d'adresses:", checkErr);
          // On continue malgré l'erreur de vérification des doublons
        }
      }
      
      if (editAddress && editAddress.id) {
        console.log('Appel de updateAddress...', editAddress.id);
        await updateAddress(editAddress.id, data);
        success('Adresse modifiée avec succès');
      } else {
        console.log('Appel de createAddress...');
        await createAddress(data);
        success('Adresse créée avec succès');
      }
      
      handleCloseModal();
      await fetchAddresses();
    } catch (err) {
      console.error('Erreur détaillée lors de l\'enregistrement:', err);
      
      // Vérification d'erreur d'authentification spécifique
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('ERREUR D\'AUTHENTIFICATION DÉTECTÉE');
        error('Votre session a expiré. Vous allez être redirigé vers la page de connexion.');
      } else if (err.customMessage) {
        error(err.customMessage);
      } else {
        error(`Erreur lors de l'enregistrement: ${err.response?.data?.message || err.message || 'Erreur inconnue'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { field: 'street', headerName: 'Rue', flex: 2 },
    { field: 'city', headerName: 'Ville', flex: 1 },
    { field: 'postalCode', headerName: 'Code postal', flex: 1 },
    { field: 'country', headerName: 'Pays', flex: 1 },
    { 
      field: 'coordinates', 
      headerName: 'Coordonnées', 
      flex: 1,
      render: (row) => {
        if (!row) return 'Non définies';
        return (row.latitude && row.longitude) 
          ? `${parseFloat(row.latitude).toFixed(6)}, ${parseFloat(row.longitude).toFixed(6)}`
          : 'Non définies';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      align: 'center',
      width: 120,
      render: (row) => {
        if (!row) return null;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton size="small" onClick={() => handleEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDeleteConfirm(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion des adresses</Typography>
        <Box>
          <IconButton onClick={fetchAddresses} disabled={loading} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Nouvelle adresse
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={addresses}
        loading={loading}
        emptyMessage="Aucune adresse trouvée"
      />

      {/* Modal pour création/édition */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        keepMounted={false}
      >
        <DialogTitle>
          {editAddress ? 'Modifier une adresse' : 'Nouvelle adresse'}
        </DialogTitle>
        <DialogContent>
          {modalOpen && (
            <AddressForm
              key={editAddress ? `edit-${editAddress.id}` : 'create-new'}
              initialData={editAddress}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              submitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => !submitting && setConfirmDelete(null)}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Êtes-vous sûr de vouloir supprimer cette adresse ?
          </Typography>
          {confirmDelete && (
            <List sx={{ mt: 2 }}>
              <ListItem>{confirmDelete.street}</ListItem>
              <ListItem>{confirmDelete.postalCode} {confirmDelete.city}</ListItem>
              <ListItem>{confirmDelete.country}</ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDelete(null)} 
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageAddresses;