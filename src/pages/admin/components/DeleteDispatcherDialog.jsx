// src/pages/admin/components/DeleteDispatcherDialog.jsx
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const DeleteDispatcherDialog = ({ open, onClose, onConfirm, dispatcherName }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Confirmer la suppression"
    message={
      <>
        Êtes-vous sûr de vouloir supprimer le répartiteur{' '}
        <strong>{dispatcherName}</strong> ? Cette action est irréversible.
      </>
    }
    confirmLabel="Supprimer"
    confirmColor="error"
  />
);

export default DeleteDispatcherDialog;
