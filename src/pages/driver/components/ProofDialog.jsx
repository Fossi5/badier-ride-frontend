import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ProofUpload from '../../../components/delivery/ProofUpload';

export default function ProofDialog({ proofDialog, onClose, onValidated }) {
  return (
    <Dialog open={!!proofDialog} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Preuve de livraison — {proofDialog?.name}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {proofDialog && (
          <ProofUpload
            routeId={proofDialog.routeId}
            deliveryPointId={proofDialog.pointId}
            onValidated={onValidated}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
