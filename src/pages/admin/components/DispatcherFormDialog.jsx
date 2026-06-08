// src/pages/admin/components/DispatcherFormDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Divider
} from '@mui/material';

const DispatcherFormDialog = ({
  open,
  onClose,
  onSubmit,
  dialogMode,
  formData,
  formErrors,
  onChange,
  loading
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>
      {dialogMode === 'create' ? 'Ajouter un répartiteur' : 'Modifier le répartiteur'}
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
          onChange={onChange}
          error={!!formErrors.username}
          helperText={formErrors.username}
          disabled={loading}
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
          onChange={onChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          disabled={loading}
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
          onChange={onChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          disabled={loading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="department"
          label="Département"
          name="department"
          value={formData.department}
          onChange={onChange}
          error={!!formErrors.department}
          helperText={formErrors.department}
          disabled={loading}
        />
      </Box>
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Annuler
      </Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} /> : null}
        disabled={loading}
      >
        {dialogMode === 'create' ? 'Créer' : 'Mettre à jour'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DispatcherFormDialog;
