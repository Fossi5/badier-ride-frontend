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
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

// Services API
import { getAllAddresses } from '../../api/addresses';

// Context
import { useAlert } from '../../context/AlertContext';

const DeliveryPointForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    addressId: '',
    clientName: '',
    clientPhoneNumber: '',
    clientEmail: '',
    clientNote: '',
    deliveryNote: '',
    deliveryTime: new Date(),
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryStatus: 'PENDING',
    ...initialData
  });
  const [formErrors, setFormErrors] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const { error } = useAlert();

  // Charger les données au montage du composant
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Fonction pour charger les adresses
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await getAllAddresses();
      setAddresses(response.data);
    } catch (err) {
      error('Erreur lors du chargement des adresses: ' + (err.response?.data?.error || err.message));
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
  
  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.addressId) {
      errors.addressId = 'Veuillez sélectionner une adresse';
    }
    
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validation de l'email
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  // Validation du numéro de téléphone
  const validatePhoneNumber = (phone) => {
    // Format français: 10 chiffres, peut commencer par 0 ou +33
    return /^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/.test(phone);
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Formatage de la date pour l'API
    const formattedDate = format(formData.deliveryTime, "yyyy-MM-dd'T'HH:mm:ss");
    const deliveryPointData = {
      ...formData,
      deliveryTime: formattedDate
    };
    
    onSubmit(deliveryPointData);
  };

  // Fonction pour formater l'adresse
  const formatAddress = (address) => {
    if (!address) return 'Adresse inconnue';
    const { street, city, postalCode, country } = address;
    return `${street}, ${postalCode} ${city}, ${country || ''}`.trim();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: A4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth required error={!!formErrors.addressId}>
            <InputLabel id="address-label">Adresse</InputLabel>
            <Select
              labelId="address-label"
              id="addressId"
              name="addressId"
              value={formData.addressId}
              onChange={handleFormChange}
              label="Adresse"
              disabled={submitting}
            >
              {addresses.map((address) => (
                <MenuItem key={address.id} value={address.id}>
                  {formatAddress(address)}
                </MenuItem>
              ))}
            </Select>
            {formErrors.addressId && (
              <Typography variant="caption" color="error">
                {formErrors.addressId}
              </Typography>
            )}
          </FormControl>
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
        
        <Grid item xs={12} sm={6}>
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

export default DeliveryPointForm;