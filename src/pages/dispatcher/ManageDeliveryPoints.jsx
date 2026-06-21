import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Divider, Tooltip
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, Close as CloseIcon,
  Phone as PhoneIcon, Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon
} from '@mui/icons-material';

import DeliveryPointForm from '../../components/forms/DeliveryPointForm';
import {
  getAllDeliveryPoints, createDeliveryPoint,
  updateDeliveryPoint, deleteDeliveryPoint
} from '../../api/deliveryPoints';
import { useAlert } from '../../context/AlertContext';

const ManageDeliveryPoints = () => {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);

  const { success, error } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldAutoOpenDialog = location.state?.openCreateDialog;

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!loading && shouldAutoOpenDialog) {
      handleOpenCreateDialog();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, shouldAutoOpenDialog]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllDeliveryPoints();
      setDeliveryPoints(res.data);
    } catch (err) {
      error('Erreur lors du chargement : ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setSelectedDeliveryPoint(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (point) => {
    setDialogMode('edit');
    setSelectedDeliveryPoint({
      ...point,
      clientPhoneNumber: point.clientPhoneNumber || '',
      clientEmail: point.clientEmail || '',
      clientNote: point.clientNote || '',
      deliveryNote: point.deliveryNote || '',
      address: {
        id: point.address?.id,
        street: point.address?.street || '',
        city: point.address?.city || '',
        postalCode: point.address?.postalCode || '',
        country: point.address?.country || 'Belgique',
        latitude: point.address?.latitude ?? '',
        longitude: point.address?.longitude ?? '',
        isVerified: point.address?.isVerified || false
      }
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDeliveryPoint(null);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await createDeliveryPoint(formData);
        success('Point de livraison créé');
      } else {
        await updateDeliveryPoint(selectedDeliveryPoint.id, formData);
        success('Point de livraison mis à jour');
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      error('Erreur : ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDeliveryPoint(pointToDelete.id);
      success('Point de livraison supprimé');
      setOpenDeleteDialog(false);
      setPointToDelete(null);
      fetchData();
    } catch (err) {
      error('Erreur lors de la suppression : ' + (err.response?.data?.error || err.message));
    }
  };

  const formatAddress = (address) => {
    if (!address) return '—';
    return `${address.street}, ${address.postalCode} ${address.city}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Tooltip title="Retour au tableau de bord">
          <IconButton onClick={() => navigate('/dispatcher/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flex: 1 }}>Points de livraison</Typography>
        <Tooltip title="Rafraîchir">
          <span>
            <IconButton onClick={fetchData} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog} disabled={loading}>
          Nouveau point
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell align="center">Adresse vérifiée</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryPoints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Aucun point de livraison</TableCell>
                  </TableRow>
                ) : (
                  deliveryPoints
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
                        <TableCell align="center">
                          <Tooltip title={point.address?.isVerified ? 'Adresse vérifiée' : 'Adresse non vérifiée'}>
                            {point.address?.isVerified
                              ? <CheckCircleIcon color="success" fontSize="small" />
                              : <CancelIcon color="disabled" fontSize="small" />
                            }
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Modifier">
                              <IconButton size="small" onClick={() => handleOpenEditDialog(point)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton size="small" onClick={() => { setPointToDelete(point); setOpenDeleteDialog(true); }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
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
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      {/* Dialog formulaire */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Nouveau point de livraison' : 'Modifier le point de livraison'}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DeliveryPointForm
            initialData={selectedDeliveryPoint}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Supprimer le point de livraison de <strong>{pointToDelete?.clientName}</strong> ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CloseIcon />} onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button color="error" variant="contained" startIcon={<DeleteIcon />} onClick={handleDeleteConfirm}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageDeliveryPoints;
