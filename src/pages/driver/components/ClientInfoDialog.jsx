import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button } from '@mui/material';

export default function ClientInfoDialog({ point, onClose }) {
  return (
    <Dialog open={!!point} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Infos — {point?.clientName}</DialogTitle>
      <DialogContent>
        {point?.clientPhoneNumber && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2"><strong>Tél :</strong> {point.clientPhoneNumber}</Typography>
          </Box>
        )}
        {point?.clientEmail && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2"><strong>Email :</strong> {point.clientEmail}</Typography>
          </Box>
        )}
        {point?.clientNote && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Note client</Typography>
            <Typography variant="body2">{point.clientNote}</Typography>
          </Box>
        )}
        {point?.deliveryNote && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Note de livraison</Typography>
            <Typography variant="body2">{point.deliveryNote}</Typography>
          </Box>
        )}
        {!point?.clientNote && !point?.deliveryNote && !point?.clientPhoneNumber && !point?.clientEmail && (
          <Typography color="text.secondary">Aucune information disponible</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
