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
  Chip,
  Checkbox,
  ListItemText as MuiListItemText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fr } from 'date-fns/locale';

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
  currentUser,
  onFormChange,
  onDateChange
}) => {
  const isAdmin = currentUserRole === 'ADMIN';
  const isDispatcher = currentUserRole === 'DISPATCHER';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                <InputLabel>Chauffeur</InputLabel>
                <Select
                  name="driverId"
                  value={formData.driverId}
                  onChange={onFormChange}
                  label="Chauffeur"
                  disabled={submitting || authErrors.driversError}
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.username}{driver.vehicleType ? ` — ${driver.vehicleType}` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.driverId && (
                  <Typography variant="caption" color="error">{formErrors.driverId}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.dispatcherId}>
                <InputLabel>Répartiteur</InputLabel>
                <Select
                  name="dispatcherId"
                  value={formData.dispatcherId}
                  onChange={onFormChange}
                  label="Répartiteur"
                  disabled={submitting || isDispatcher || authErrors.dispatchersError}
                >
                  {dispatchers.map((dispatcher) => (
                    <MenuItem key={dispatcher.id} value={dispatcher.id}>
                      {dispatcher.username}{dispatcher.department ? ` — ${dispatcher.department}` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.dispatcherId && (
                  <Typography variant="caption" color="error">{formErrors.dispatcherId}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.deliveryPointIds}>
                <InputLabel>Points de livraison</InputLabel>
                <Select
                  name="deliveryPointIds"
                  multiple
                  value={formData.deliveryPointIds}
                  onChange={onFormChange}
                  label="Points de livraison"
                  disabled={submitting}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const dp = deliveryPoints.find(d => d.id === value);
                        return (
                          <Chip key={value} label={dp ? dp.clientName : value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {deliveryPoints
                    .filter(dp => dp.deliveryStatus !== 'COMPLETED' && dp.deliveryStatus !== 'FAILED')
                    .map((dp) => (
                      <MenuItem key={dp.id} value={dp.id}>
                        <Checkbox checked={formData.deliveryPointIds.includes(dp.id)} size="small" />
                        <MuiListItemText
                          primary={dp.clientName}
                          secondary={`${dp.address?.street}, ${dp.address?.city}`}
                        />
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.deliveryPointIds && (
                  <Typography variant="caption" color="error">{formErrors.deliveryPointIds}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <Grid container spacing={1}>
                  <Grid item xs={7}>
                    <DatePicker
                      label="Date de début *"
                      value={formData.startTime}
                      onChange={(date) => {
                        if (!date) return onDateChange('startTime', null);
                        const prev = formData.startTime ? new Date(formData.startTime) : new Date();
                        date.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
                        onDateChange('startTime', date);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.startTime,
                          disabled: submitting,
                          size: 'small'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TimePicker
                      label="Heure *"
                      value={formData.startTime}
                      onChange={(time) => {
                        if (!time) return;
                        const prev = formData.startTime ? new Date(formData.startTime) : new Date();
                        prev.setHours(time.getHours(), time.getMinutes(), 0, 0);
                        onDateChange('startTime', new Date(prev));
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.startTime,
                          helperText: formErrors.startTime,
                          disabled: submitting,
                          size: 'small'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <Grid container spacing={1}>
                  <Grid item xs={7}>
                    <DatePicker
                      label="Date de fin"
                      value={formData.endTime}
                      onChange={(date) => {
                        if (!date) return onDateChange('endTime', null);
                        const prev = formData.endTime ? new Date(formData.endTime) : new Date();
                        date.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
                        onDateChange('endTime', date);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.endTime,
                          disabled: submitting,
                          size: 'small'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TimePicker
                      label="Heure fin"
                      value={formData.endTime}
                      onChange={(time) => {
                        if (!time) return;
                        const prev = formData.endTime ? new Date(formData.endTime) : new Date();
                        prev.setHours(time.getHours(), time.getMinutes(), 0, 0);
                        onDateChange('endTime', new Date(prev));
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.endTime,
                          helperText: formErrors.endTime,
                          disabled: submitting,
                          size: 'small'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
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
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={onFormChange}
                multiline
                rows={3}
                disabled={submitting}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Annuler</Button>
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
