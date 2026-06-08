// src/pages/dispatcher/components/DeleteConfirmDialog.jsx
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const DeleteConfirmDialog = ({ open, onClose, onConfirm, routeName }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Confirmer la suppression"
    message={
      <>
        Êtes-vous sûr de vouloir supprimer la tournée{' '}
        <strong>{routeName}</strong> ? Cette action est irréversible.
      </>
    }
    confirmLabel="Supprimer"
    confirmColor="error"
  />
);

export default DeleteConfirmDialog;
