import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Button, CircularProgress,
  FormControlLabel, Checkbox
} from '@mui/material';

const DeliveryPointForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhoneNumber: '',
    clientEmail: '',
    clientNote: '',
    deliveryNote: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Belgique',
      latitude: '',
      longitude: '',
      isVerified: false
    }
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    if (formErrors[`address_${name}`]) setFormErrors(prev => ({ ...prev, [`address_${name}`]: null }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^(\+32|0)[1-9]([-. ]?[0-9]{2}){4}$/.test(phone);

  const validateForm = () => {
    const errors = {};
    if (!formData.clientName) errors.clientName = 'Le nom du client est obligatoire';
    if (formData.clientEmail && !validateEmail(formData.clientEmail)) errors.clientEmail = "Email invalide";
    if (formData.clientPhoneNumber && !validatePhone(formData.clientPhoneNumber)) errors.clientPhoneNumber = "Numéro invalide";
    if (!formData.address.street) errors.address_street = 'La rue est obligatoire';
    if (!formData.address.city) errors.address_city = 'La ville est obligatoire';
    if (!formData.address.postalCode) {
      errors.address_postalCode = 'Le code postal est obligatoire';
    } else if (!/^\d{4}$/.test(formData.address.postalCode)) {
      errors.address_postalCode = 'Le code postal doit contenir 4 chiffres';
    }
    if (!formData.address.country) errors.address_country = 'Le pays est obligatoire';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit({
      clientName: formData.clientName,
      clientPhoneNumber: formData.clientPhoneNumber,
      clientEmail: formData.clientEmail,
      clientNote: formData.clientNote,
      deliveryNote: formData.deliveryNote,
      address: {
        ...formData.address,
        latitude: formData.address.latitude !== '' && formData.address.latitude !== null ? parseFloat(formData.address.latitude) : null,
        longitude: formData.address.longitude !== '' && formData.address.longitude !== null ? parseFloat(formData.address.longitude) : null,
      }
    });
  };

  return (
    <Box component="form" sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Adresse</Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField required fullWidth label="Rue" name="street"
            value={formData.address.street} onChange={handleAddressChange}
            error={!!formErrors.address_street} helperText={formErrors.address_street}
            disabled={submitting} placeholder="123 rue des Exemples" />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField required fullWidth label="Ville" name="city"
            value={formData.address.city} onChange={handleAddressChange}
            error={!!formErrors.address_city} helperText={formErrors.address_city}
            disabled={submitting} placeholder="Bruxelles" />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField required fullWidth label="Code postal" name="postalCode"
            value={formData.address.postalCode} onChange={handleAddressChange}
            error={!!formErrors.address_postalCode} helperText={formErrors.address_postalCode}
            disabled={submitting} inputProps={{ maxLength: 4 }} placeholder="1000" />
        </Grid>

        <Grid item xs={12}>
          <TextField required fullWidth label="Pays" name="country"
            value={formData.address.country} onChange={handleAddressChange}
            error={!!formErrors.address_country} helperText={formErrors.address_country}
            disabled={submitting} />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.address.isVerified || false}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, isVerified: e.target.checked } }))}
                name="isVerified"
                color="primary"
                disabled={submitting}
              />
            }
            label="Adresse vérifiée"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Informations client</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField required fullWidth label="Nom du client" name="clientName"
            value={formData.clientName} onChange={handleFormChange}
            error={!!formErrors.clientName} helperText={formErrors.clientName}
            disabled={submitting} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Téléphone" name="clientPhoneNumber"
            value={formData.clientPhoneNumber} onChange={handleFormChange}
            error={!!formErrors.clientPhoneNumber} helperText={formErrors.clientPhoneNumber}
            disabled={submitting} placeholder="+32 470 12 34 56" />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth label="Email" name="clientEmail" type="email"
            value={formData.clientEmail} onChange={handleFormChange}
            error={!!formErrors.clientEmail} helperText={formErrors.clientEmail}
            disabled={submitting} />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth label="Note client" name="clientNote"
            value={formData.clientNote} onChange={handleFormChange}
            multiline rows={2} disabled={submitting}
            placeholder="Instructions particulières du client..." />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth label="Note de livraison" name="deliveryNote"
            value={formData.deliveryNote} onChange={handleFormChange}
            multiline rows={2} disabled={submitting}
            placeholder="Informations pour le chauffeur..." />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onCancel} disabled={submitting} sx={{ mr: 2 }}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting && <CircularProgress size={20} sx={{ mr: 1 }} />}
            {initialData ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeliveryPointForm;
