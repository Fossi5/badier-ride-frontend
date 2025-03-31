// src/pages/admin/ManageAddresses.jsx
import React, { useEffect, useState } from 'react';
import {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../../api/addresses';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddressForm from '../../components/forms/AddressForm';
import ModalContainer from '../../components/common/ModalContainer';
import DataTable from '../../components/tables/DataTable';
import { useAlert } from '../../context/AlertContext';

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const { showAlert } = useAlert();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getAllAddresses();
      setAddresses(res.data);
    } catch (error) {
      showAlert(`Erreur lors du chargement des adresses: ${error.message}`, 'error');
      console.error('Erreur lors du chargement des adresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = () => {
    setEditAddress(null);
    setModalOpen(true);
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      showAlert('Adresse supprimée avec succès', 'success');
      fetchAddresses();
    } catch {
      showAlert('Échec de la suppression', 'error');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editAddress) {
        await updateAddress(editAddress.id, data);
        showAlert('Adresse modifiée avec succès', 'success');
      } else {
        await createAddress(data);
        showAlert('Adresse créée avec succès', 'success');
      }
      setModalOpen(false); // Ferme la modale
      fetchAddresses();    // Recharge la liste
    } catch {
      showAlert('Erreur lors de l’enregistrement', 'error');
    }
  };

  const columns = [
    { label: 'Rue', key: 'street' },
    { label: 'Ville', key: 'city' },
    { label: 'Code postal', key: 'postalCode' },
    { label: 'Latitude', key: 'latitude' },
    { label: 'Longitude', key: 'longitude' },
  ];

  return (
    <Box className="container mt-4">
      <Box className="flex justify-between items-center mb-4">
  <Typography variant="h5">Gestion des adresses</Typography>
  {!modalOpen ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
      Nouvelle adresse
    </Button>
  ) : (
    <Button variant="outlined" onClick={() => setModalOpen(false)}>
      Voir la liste
    </Button>
  )}
</Box>

      {/* Affiche la table uniquement si la modale est fermée */}
      {!modalOpen && (
        <DataTable
          data={addresses}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ModalContainer
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editAddress ? 'Modifier une adresse' : 'Nouvelle adresse'}
        actions={null}
      >
        <AddressForm
          defaultValues={editAddress}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </ModalContainer>
    </Box>
  );
};

export default ManageAddresses;