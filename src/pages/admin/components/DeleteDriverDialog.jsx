// src/pages/admin/components/DeleteDriverDialog.jsx
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const DeleteDriverDialog = ({ open, onClose, onConfirm, driverName }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Confirmer la suppression"
    message={
      <>
        Êtes-vous sûr de vouloir supprimer le chauffeur{' '}
        <strong>{driverName}</strong> ? Cette action est irréversible.
      </>
    }
    confirmLabel="Supprimer"
    confirmColor="error"
  />
);

export default DeleteDriverDialog;
