// src/pages/dispatcher/components/RouteFormDialog.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
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
  Chip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const RouteFormDialog = ({
  open,
  onClose,
  onSubmit,
  dialogMode,
  formData,
  formErrors,
  submitting,
  drivers,
  dispatchers,
  deliveryPoints,
  authErrors,
  currentUserRole,
  onFormChange,
  onDateChange
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {dialogMode === 'create' ? 'Nouvelle tournée' : 'Modifier la tournée'}
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Nom de la tournée"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.driverId}>
                <InputLabel id="driver-label">Chauffeur</InputLabel>
                <Select
                  labelId="driver-label"
                  id="driverId"
                  name="driverId"
                  value={formData.driverId}
                  onChange={onFormChange}
                  label="Chauffeur"
                  disabled={submitting || authErrors.driversError}
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.username}
                      {driver.vehicleType && ` - ${driver.vehicleType}`}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.driverId && (
                  <Typography variant="caption" color="error">
                    {formErrors.driverId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.dispatcherId}>
                <InputLabel id="dispatcher-label">Répartiteur</InputLabel>
                <Select
                  labelId="dispatcher-label"
                  id="dispatcherId"
                  name="dispatcherId"
                  value={formData.dispatcherId}
                  onChange={onFormChange}
                  label="Répartiteur"
                  disabled={submitting || currentUserRole === 'DISPATCHER' || authErrors.dispatchersError}
                >
                  {dispatchers.map((dispatcher) => (
                    <MenuItem key={dispatcher.id} value={dispatcher.id}>
                      {dispatcher.username}
                      {dispatcher.department && ` - ${dispatcher.department}`}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.dispatcherId && (
                  <Typography variant="caption" color="error">
                    {formErrors.dispatcherId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.deliveryPointIds}>
                <InputLabel id="delivery-points-label">Points de livraison</InputLabel>
                <Select
                  labelId="delivery-points-label"
                  id="deliveryPointIds"
                  name="deliveryPointIds"
                  multiple
                  value={formData.deliveryPointIds}
                  onChange={onFormChange}
                  label="Points de livraison"
                  disabled={submitting}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const deliveryPoint = deliveryPoints.find(dp => dp.id === value);
                        return (
                          <Chip
                            key={value}
                            label={deliveryPoint ? deliveryPoint.clientName : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {deliveryPoints
                    .filter(dp => dp.deliveryStatus !== 'COMPLETED' && dp.deliveryStatus !== 'FAILED')
                    .map((dp) => (
                      <MenuItem key={dp.id} value={dp.id}>
                        {dp.clientName} - {dp.address?.street}, {dp.address?.city}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.deliveryPointIds && (
                  <Typography variant="caption" color="error">
                    {formErrors.deliveryPointIds}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Date et heure de début"
                  value={formData.startTime}
                  onChange={(date) => onDateChange('startTime', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.startTime,
                      helperText: formErrors.startTime,
                      disabled: submitting
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Date et heure de fin (optionnel)"
                  value={formData.endTime}
                  onChange={(date) => onDateChange('endTime', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.endTime,
                      helperText: formErrors.endTime,
                      disabled: submitting
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={onFormChange}
                  label="Statut"
                  disabled={submitting}
                >
                  <MenuItem value="PLANNED">Planifiée</MenuItem>
                  <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                  <MenuItem value="COMPLETED">Terminée</MenuItem>
                  <MenuItem value="CANCELLED">Annulée</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={onFormChange}
                multiline
                rows={4}
                disabled={submitting}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={20} /> : null}
          disabled={submitting}
        >
          {dialogMode === 'create' ? 'Créer' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RouteFormDialog;
