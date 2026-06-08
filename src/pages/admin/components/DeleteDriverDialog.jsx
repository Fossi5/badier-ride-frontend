// src/pages/admin/components/DeleteDriverDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * Dialog de confirmation de suppression d'un chauffeur.
 * Props :
 *   open        - booléen d'ouverture
 *   onClose     - () => void
 *   onConfirm   - () => void
 *   driverName  - nom du chauffeur à afficher dans le message
 */
const DeleteDriverDialog = ({ open, onClose, onConfirm, driverName }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Confirmer la suppression
      </DialogTitle>
      <DialogContent>
        <Typography>
          Êtes-vous sûr de vouloir supprimer le chauffeur <strong>{driverName}</strong> ?
          Cette action est irréversible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          startIcon={<DeleteIcon />}
          autoFocus
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDriverDialog;
