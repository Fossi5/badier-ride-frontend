// src/components/forms/RouteForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Services API
import { getAvailableDrivers } from '../../api/drivers';
import { getAllDispatchers } from '../../api/dispatchers';
import { getAllDeliveryPoints } from '../../api/deliveryPoints';

// Context
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

const RouteForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    driverId: '',
    dispatcherId: '',
    deliveryPointIds: [],
    startTime: new Date(),
    endTime: null,
    notes: '',
    status: 'PLANNED',
    ...initialData
  });
  const [formErrors, setFormErrors] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const { error } = useAlert();
  const { currentUser } = useAuth();

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  // Fonction pour charger toutes les données nécessaires
  const fetchData = async () => {
    setLoading(true);
    try {
      // Charger les données en parallèle pour optimiser les performances
      const [driversRes, dispatchersRes, deliveryPointsRes] = await Promise.all([
        getAvailableDrivers(),
        getAllDispatchers(),
        getAllDeliveryPoints()
      ]);
      
      setDrivers(driversRes.data);
      setDispatchers(dispatchersRes.data);
      setDeliveryPoints(deliveryPointsRes.data.filter(dp => 
        dp.deliveryStatus !== 'COMPLETED' && dp.deliveryStatus !== 'FAILED'
      ));
      
      // Préremplir l'ID du dispatcher si l'utilisateur est un dispatcher
      if (currentUser?.role === 'DISPATCHER' && !initialData?.dispatcherId) {
        const currentDispatcher = dispatchersRes.data.find(d => d.username === currentUser.username);
        if (currentDispatcher) {
          setFormData(prev => ({
            ...prev,
            dispatcherId: currentDispatcher.id
          }));
        }
      }
    } catch (err) {
      error('Erreur lors du chargement des données: ' + (err.response?.data?.error || err.message));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
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
  
  // Gestion des changements de dates
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
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
    
    if (!formData.name) {
      errors.name = 'Le nom de la tournée est obligatoire';
    }
    
    if (!formData.driverId) {
      errors.driverId = 'Veuillez sélectionner un chauffeur';
    }
    
    if (!formData.dispatcherId) {
      errors.dispatcherId = 'Veuillez sélectionner un répartiteur';
    }
    
    if (!formData.deliveryPointIds || formData.deliveryPointIds.length === 0) {
      errors.deliveryPointIds = 'Veuillez sélectionner au moins un point de livraison';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'La date et heure de début sont obligatoires';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(formData);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
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
            onChange={handleFormChange}
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
              onChange={handleFormChange}
              label="Chauffeur"
              disabled={submitting}
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
              onChange={handleFormChange}
              label="Répartiteur"
              disabled={submitting || (currentUser?.role === 'DISPATCHER')}
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
              onChange={handleFormChange}
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
              {deliveryPoints.map((dp) => (
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
              onChange={(date) => handleDateChange('startTime', date)}
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
              onChange={(date) => handleDateChange('endTime', date)}
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
              onChange={handleFormChange}
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
            onChange={handleFormChange}
            multiline
            rows={4}
            disabled={submitting}
          />
        </Grid>
        
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            onClick={onCancel}
            disabled={submitting}
            sx={{ mr: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            disabled={submitting}
          >
            {initialData ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RouteForm;