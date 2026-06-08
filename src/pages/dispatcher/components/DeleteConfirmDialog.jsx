// src/pages/dispatcher/components/DeleteConfirmDialog.jsx
import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const DeleteConfirmDialog = ({ open, onClose, onConfirm, routeName }) => {
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
          Êtes-vous sûr de vouloir supprimer la tournée <strong>{routeName}</strong> ?
          Cette action est irréversible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
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

export default DeleteConfirmDialog;
