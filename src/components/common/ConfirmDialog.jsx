// src/components/common/ConfirmDialog.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Button, CircularProgress
} from '@mui/material';

/**
 * Dialog de confirmation générique.
 *
 * Props :
 *   open         {boolean}   - Ouvert ou fermé
 *   onClose      {function}  - Appelé sur annulation
 *   onConfirm    {function}  - Appelé sur confirmation
 *   title        {string}    - Titre du dialog  (défaut : "Confirmer")
 *   message      {string|node} - Corps du message
 *   confirmLabel {string}    - Label bouton confirm (défaut : "Confirmer")
 *   confirmColor {string}    - Couleur MUI du bouton confirm (défaut : "error")
 *   cancelLabel  {string}    - Label bouton annuler (défaut : "Annuler")
 *   loading      {boolean}   - Affiche un spinner sur le bouton confirm
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  confirmColor = 'error',
  cancelLabel = 'Annuler',
  loading = false,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText component="div">{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        onClick={onConfirm}
        color={confirmColor}
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
