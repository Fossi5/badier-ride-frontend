// src/components/forms/AddressForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { isValidLatitude, isValidLongitude } from '../../utils/validators';

const AddressForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'Belgique', // Default value
    latitude: '',
    longitude: '',
    isVerified: false,
    ...initialData
  });
  const [formErrors, setFormErrors] = useState({});
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Si initialData change (ex: passage du mode création à édition)
  useEffect(() => {
    if (initialData) {
      setFormData({
        street: '',
        city: '',
        postalCode: '',
        country: 'Belgique',
        latitude: '',
        longitude: '',
        isVerified: false,
        ...initialData
      });
    }
  }, [initialData]);

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear the error when the user modifies the field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate the form
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
    } else if (!/^\d{4}$/.test(formData.postalCode)) {
      errors.postalCode = 'Le code postal doit contenir 4 chiffres';
    }

    if (!formData.country) {
      errors.country = 'Le pays est obligatoire';
    }

    if (
      formData.latitude !== null &&
      formData.latitude !== '' &&
      !isValidLatitude(formData.latitude)
    ) {
      errors.latitude = 'La latitude doit être entre -90 et 90';
    }

    if (
      formData.longitude !== null &&
      formData.longitude !== '' &&
      !isValidLongitude(formData.longitude)
    ) {
      errors.longitude = 'La longitude doit être entre -180 et 180';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch GPS coordinates
  const fetchGeoCoordinates = () => {
    setGeoError(null);
    
    if (navigator.geolocation) {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
          setGeolocating(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setGeolocating(false);
          
          let errorMsg = "Impossible d'obtenir votre position.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += " Vous avez refusé l'accès à la géolocalisation.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += " Les données de localisation sont indisponibles.";
              break;
            case error.TIMEOUT:
              errorMsg += " La demande de localisation a expiré.";
              break;
            default:
              errorMsg += " Une erreur inconnue s'est produite.";
          }
          
          setGeoError(errorMsg);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setGeoError("La géolocalisation n'est pas prise en charge par votre navigateur.");
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    // Convert latitude and longitude to numbers if present
    const formattedData = {
      ...formData,
      latitude:
        formData.latitude !== null && formData.latitude !== ''
          ? parseFloat(formData.latitude)
          : null,
      longitude:
        formData.longitude !== null && formData.longitude !== ''
          ? parseFloat(formData.longitude)
          : null
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
            autoFocus
            placeholder="123 rue des Exemples"
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
            placeholder="Paris"
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
            inputProps={{ maxLength: 4 }}
            placeholder="7000"
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
            placeholder="Belgique"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Coordonnées GPS
            </Typography>
          </Divider>
        </Grid>

        {geoError && (
          <Grid item xs={12}>
            <Alert severity="error">{geoError}</Alert>
          </Grid>
        )}

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
            type="text"
            placeholder="48.858844"
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
            type="text"
            placeholder="2.294351"
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
          <Button onClick={onCancel} disabled={submitting} sx={{ mr: 2 }}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ mr: 1 }} />
            ) : null}
            {initialData ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressForm;