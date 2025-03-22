// src/components/forms/AddressForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const AddressForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'France', // Valeur par défaut
    latitude: null,
    longitude: null,
    isVerified: false,
    ...initialData
  });
  const [formErrors, setFormErrors] = useState({});
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [geolocating, setGeolocating] = useState(false);

  // Gestion des changements de champs du formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.street) {
      errors.street = 'La rue est obligatoire';
    }
    
    if (!formData.city) {
      errors.city = 'La ville est obligatoire';
    }
    
    if (!formData.postalCode) {
      errors.postalCode = 'Le code postal est obligatoire';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      errors.postalCode = 'Le code postal doit contenir 5 chiffres';
    }
    
    if (!formData.country) {
      errors.country = 'Le pays est obligatoire';
    }
    
    if (formData.latitude !== null && formData.latitude !== '' && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      errors.latitude = 'La latitude doit être entre -90 et 90';
    }
    
    if (formData.longitude !== null && formData.longitude !== '' && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      errors.longitude = 'La longitude doit être entre -180 et 180';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Récupération des coordonnées GPS
  const fetchGeoCoordinates = () => {
    if (navigator.geolocation) {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGeolocating(false);
          setGeolocationEnabled(true);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setGeolocating(false);
          setGeolocationEnabled(false);
          alert('Impossible d\'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas prise en charge par votre navigateur.');
    }
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Convertir latitude et longitude en nombres
    const formattedData = {
      ...formData,
      latitude: formData.latitude !== null && formData.latitude !== '' ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude !== null && formData.longitude !== '' ? parseFloat(formData.longitude) : null
    };
    
    onSubmit(formattedData);
  };

  return (
    <Box component="form" sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="street"
            label="Rue"
            name="street"
            value={formData.street}
            onChange={handleFormChange}
            error={!!formErrors.street}
            helperText={formErrors.street}
            disabled={submitting}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="city"
            label="Ville"
            name="city"
            value={formData.city}
            onChange={handleFormChange}
            error={!!formErrors.city}
            helperText={formErrors.city}
            disabled={submitting}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="postalCode"
            label="Code postal"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleFormChange}
            error={!!formErrors.postalCode}
            helperText={formErrors.postalCode}
            disabled={submitting}
            inputProps={{ maxLength: 5 }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="country"
            label="Pays"
            name="country"
            value={formData.country}
            onChange={handleFormChange}
            error={!!formErrors.country}
            helperText={formErrors.country}
            disabled={submitting}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Coordonnées GPS
            </Typography>
          </Divider>
        </Grid>
        
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={geolocating ? <CircularProgress size={20} /> : <LocationOnIcon />}
            onClick={fetchGeoCoordinates}
            disabled={submitting || geolocating}
          >
            {geolocating ? 'Récupération...' : 'Obtenir ma position actuelle'}
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="latitude"
            label="Latitude"
            name="latitude"
            value={formData.latitude || ''}
            onChange={handleFormChange}
            error={!!formErrors.latitude}
            helperText={formErrors.latitude}
            disabled={submitting}
            type="number"
            inputProps={{ step: "0.000001" }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="longitude"
            label="Longitude"
            name="longitude"
            value={formData.longitude || ''}
            onChange={handleFormChange}
            error={!!formErrors.longitude}
            helperText={formErrors.longitude}
            disabled={submitting}
            type="number"
            inputProps={{ step: "0.000001" }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isVerified}
                onChange={handleFormChange}
                name="isVerified"
                color="primary"
                disabled={submitting}
              />
            }
            label="Adresse vérifiée"
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

export default AddressForm;