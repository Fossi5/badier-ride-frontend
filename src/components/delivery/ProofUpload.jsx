import { useState, useRef } from 'react';
import { Box, Button, TextField, Typography, Divider,
         CircularProgress, Stack } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../api/axios';
import { useAlert } from '../../context/AlertContext';

export default function ProofUpload({ routeId, deliveryPointId, onValidated }) {
  const [code, setCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const fileRef = useRef();
  const { success, error: showError } = useAlert();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post(`/routes/${routeId}/delivery-points/${deliveryPointId}/proof/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      success('Photo enregistrée');
      onValidated?.();
    } catch {
      showError("Échec de l'envoi de la photo");
    } finally {
      setUploading(false);
    }
  };

  const handleValidateCode = async () => {
    if (!code.trim()) return;
    setValidating(true);
    try {
      await api.post(`/routes/${routeId}/delivery-points/${deliveryPointId}/proof/validate-code`, { code });
      success('Livraison confirmée');
      onValidated?.();
    } catch {
      showError('Code invalide');
    } finally {
      setValidating(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={16} /> : <PhotoCameraIcon />}
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          Photo de preuve
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }}>ou</Divider>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          label="Code de confirmation"
          value={code}
          onChange={e => setCode(e.target.value)}
          inputProps={{ maxLength: 6 }}
        />
        <Button
          variant="contained"
          startIcon={validating ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          onClick={handleValidateCode}
          disabled={validating || !code.trim()}
        >
          Valider
        </Button>
      </Stack>
    </Box>
  );
}
