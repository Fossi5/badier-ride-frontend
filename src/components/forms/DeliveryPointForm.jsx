// src/components/forms/DeliveryPointForm.jsx
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
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { isValidLatitude, isValidLongitude } from '../../utils/validators';

// Context
import { useAlert } from '../../context/AlertContext';

const DeliveryPointForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    // Données du point de livraison
    clientName: '',
    clientPhoneNumber: '',
    clientEmail: '',
    clientNote: '',
    deliveryNote: '',
    deliveryTime: new Date(),
    deliveryStatus: 'PENDING',
    
    // Données de l'adresse intégrée
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Belgique',
      latitude: '',
      longitude: '',
      isVerified: false
    },
    ...initialData
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const { error } = useAlert();

  // Si initialData change, mettre à jour le formulaire
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
    }
  }, [initialData]);

  // Gestion des changements de champs du formulaire principal
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
  
  // Gestion des changements de l'adresse
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: type === 'checkbox' ? checked : value
      }
    });
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (formErrors[`address_${name}`]) {
      setFormErrors({
        ...formErrors,
        [`address_${name}`]: null
      });
    }
  };
  
  // Gestion des changements de dates
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      deliveryTime: date
    });
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (formErrors.deliveryTime) {
      setFormErrors({
        ...formErrors,
        deliveryTime: null
      });
    }
  };

  // Géolocalisation pour l'adresse
  const fetchGeoCoordinates = () => {
    setGeoError(null);
    
    if (navigator.geolocation) {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            address: {
              ...formData.address,
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6)
            }
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
  
  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    // Validation des champs principaux
    if (!formData.clientName) {
      errors.clientName = 'Le nom du client est obligatoire';
    }
    
    if (!formData.deliveryTime) {
      errors.deliveryTime = 'La date et heure de livraison sont obligatoires';
    }
    
    if (formData.clientEmail && !validateEmail(formData.clientEmail)) {
      errors.clientEmail = 'L\'adresse email n\'est pas valide';
    }
    
    if (formData.clientPhoneNumber && !validatePhoneNumber(formData.clientPhoneNumber)) {
      errors.clientPhoneNumber = 'Le numéro de téléphone n\'est pas valide';
    }

    // Validation de l'adresse
    if (!formData.address.street) {
      errors.address_street = 'La rue est obligatoire';
    }

    if (!formData.address.city) {
      errors.address_city = 'La ville est obligatoire';
    }

    if (!formData.address.postalCode) {
      errors.address_postalCode = 'Le code postal est obligatoire';
    } else if (!/^\d{4}$/.test(formData.address.postalCode)) {
      errors.address_postalCode = 'Le code postal doit contenir 4 chiffres';
    }

    if (!formData.address.country) {
      errors.address_country = 'Le pays est obligatoire';
    }

    if (
      formData.address.latitude !== null &&
      formData.address.latitude !== '' &&
      !isValidLatitude(formData.address.latitude)
    ) {
      errors.address_latitude = 'La latitude doit être entre -90 et 90';
    }

    if (
      formData.address.longitude !== null &&
      formData.address.longitude !== '' &&
      !isValidLongitude(formData.address.longitude)
    ) {
      errors.address_longitude = 'La longitude doit être entre -180 et 180';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validation de l'email
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  // Validation du numéro de téléphone (format belge)
  const validatePhoneNumber = (phone) => {
    // Format belge: peut commencer par 0 ou +32
    return /^(\+32|0)[1-9]([-. ]?[0-9]{2}){4}$/.test(phone);
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Formatage de la date pour l'API
    const formattedDate = format(formData.deliveryTime, "yyyy-MM-dd'T'HH:mm:ss");
    
    // Convertir les coordonnées GPS en nombres
    const formattedAddress = {
      ...formData.address,
      latitude:
        formData.address.latitude !== null && formData.address.latitude !== ''
          ? parseFloat(formData.address.latitude)
          : null,
      longitude:
        formData.address.longitude !== null && formData.address.longitude !== ''
          ? parseFloat(formData.address.longitude)
          : null
    };
    
    // Préparer les données à envoyer
    const deliveryPointData = {
      clientName: formData.clientName,
      clientPhoneNumber: formData.clientPhoneNumber,
      clientEmail: formData.clientEmail,
      clientNote: formData.clientNote,
      deliveryNote: formData.deliveryNote,
      deliveryTime: formattedDate,
      deliveryStatus: formData.deliveryStatus,
      address: formattedAddress
    };
    
    onSubmit(deliveryPointData);
  };

  return (
    <Box component="form" sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        {/* Section des informations d'adresse */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Informations d'adresse
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="street"
            label="Rue"
            name="street"
            value={formData.address.street}
            onChange={handleAddressChange}
            error={!!formErrors.address_street}
            helperText={formErrors.address_street}
            disabled={submitting}
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
            value={formData.address.city}
            onChange={handleAddressChange}
            error={!!formErrors.address_city}
            helperText={formErrors.address_city}
            disabled={submitting}
            placeholder="Bruxelles"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="postalCode"
            label="Code postal"
            name="postalCode"
            value={formData.address.postalCode}
            onChange={handleAddressChange}
            error={!!formErrors.address_postalCode}
            helperText={formErrors.address_postalCode}
            disabled={submitting}
            inputProps={{ maxLength: 4 }}
            placeholder="1000"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="country"
            label="Pays"
            name="country"
            value={formData.address.country}
            onChange={handleAddressChange}
            error={!!formErrors.address_country}
            helperText={formErrors.address_country}
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
            value={formData.address.latitude || ''}
            onChange={handleAddressChange}
            error={!!formErrors.address_latitude}
            helperText={formErrors.address_latitude}
            disabled={submitting}
            type="text"
            placeholder="50.846557"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="longitude"
            label="Longitude"
            name="longitude"
            value={formData.address.longitude || ''}
            onChange={handleAddressChange}
            error={!!formErrors.address_longitude}
            helperText={formErrors.address_longitude}
            disabled={submitting}
            type="text"
            placeholder="4.351697"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.address.isVerified}
                onChange={handleAddressChange}
                name="isVerified"
                color="primary"
                disabled={submitting}
              />
            }
            label="Adresse vérifiée"
          />
        </Grid>

        {/* Section des informations du client et de livraison */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Informations du client et de livraison
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="clientName"
            label="Nom du client"
            name="clientName"
            value={formData.clientName}
            onChange={handleFormChange}
            error={!!formErrors.clientName}
            helperText={formErrors.clientName}
            disabled={submitting}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="clientPhoneNumber"
            label="Numéro de téléphone"
            name="clientPhoneNumber"
            value={formData.clientPhoneNumber}
            onChange={handleFormChange}
            error={!!formErrors.clientPhoneNumber}
            helperText={formErrors.clientPhoneNumber}
            disabled={submitting}
            placeholder="+32 470 12 34 56 ou 0470 12 34 56"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="clientEmail"
            label="Email du client"
            name="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={handleFormChange}
            error={!!formErrors.clientEmail}
            helperText={formErrors.clientEmail}
            disabled={submitting}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date et heure de livraison"
              value={formData.deliveryTime}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!formErrors.deliveryTime,
                  helperText: formErrors.deliveryTime,
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
              id="deliveryStatus"
              name="deliveryStatus"
              value={formData.deliveryStatus}
              onChange={handleFormChange}
              label="Statut"
              disabled={submitting}
            >
              <MenuItem value="PENDING">En attente</MenuItem>
              <MenuItem value="IN_PROGRESS">En cours</MenuItem>
              <MenuItem value="COMPLETED">Terminé</MenuItem>
              <MenuItem value="FAILED">Échec</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="clientNote"
            label="Note du client"
            name="clientNote"
            value={formData.clientNote}
            onChange={handleFormChange}
            multiline
            rows={2}
            disabled={submitting}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="deliveryNote"
            label="Note de livraison"
            name="deliveryNote"
            value={formData.deliveryNote}
            onChange={handleFormChange}
            multiline
            rows={2}
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

export default DeliveryPointForm;