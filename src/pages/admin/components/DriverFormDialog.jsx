// src/pages/admin/components/DriverFormDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';

/**
 * Dialog de création ou d'édition d'un chauffeur.
 * Props :
 *   open        - booléen d'ouverture
 *   onClose     - () => void
 *   onSubmit    - () => void
 *   dialogMode  - 'create' | 'edit'
 *   formData    - objet { username, password, email, phoneNumber, vehicleType, isAvailable, latitude, longitude }
 *   formErrors  - objet d'erreurs par champ
 *   onChange    - (event) => void  — handler pour tous les champs
 *   loading     - booléen soumission en cours
 */
const DriverFormDialog = ({
  open,
  onClose,
  onSubmit,
  dialogMode = 'create',
  formData,
  formErrors = {},
  onChange,
  loading
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            fullWidth
            id="phoneNumber"
            label="Numéro de téléphone"
            name="phoneNumber"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={onChange}
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
            disabled={loading}
          />

          <TextField
            margin="normal"
            fullWidth
            id="vehicleType"
            label="Type de véhicule"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={onChange}
            disabled={loading}
          />

          <Box sx={{ display: 'flex', mt: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              id="latitude"
              label="Latitude"
              name="latitude"
              value={formData.latitude}
              onChange={onChange}
              error={!!formErrors.latitude}
              helperText={formErrors.latitude}
              disabled={loading}
              sx={{ mr: 1 }}
            />

            <TextField
              margin="normal"
              fullWidth
              id="longitude"
              label="Longitude"
              name="longitude"
              value={formData.longitude}
              onChange={onChange}
              error={!!formErrors.longitude}
              helperText={formErrors.longitude}
              disabled={loading}
              sx={{ ml: 1 }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isAvailable}
                onChange={onChange}
                name="isAvailable"
                color="primary"
                disabled={loading}
              />
            }
            label="Disponible"
            sx={{ mt: 2 }}
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
};

export default DriverFormDialog;
