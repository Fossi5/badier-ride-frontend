// src/components/common/ModalContainer.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Composant conteneur pour les modales avec une structure commune
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.open - État d'ouverture de la modale
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {string} props.title - Titre de la modale
 * @param {React.ReactNode} props.children - Contenu de la modale
 * @param {React.ReactNode} props.actions - Boutons d'actions à afficher en bas
 * @param {boolean} props.loading - Indicateur de chargement
 * @param {string} props.size - Taille de la modale (xs, sm, md, lg, xl)
 * @param {boolean} props.fullWidth - Si la modale doit prendre toute la largeur
 * @param {Object} props.sx - Style supplémentaire à appliquer à la modale
 */
const ModalContainer = ({
  open,
  onClose,
  title,
  children,
  actions,
  loading = false,
  size = 'md',
  fullWidth = true,
  sx = {}
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      maxWidth={size}
      fullWidth={fullWidth}
      sx={sx}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {title}
          </Typography>
          
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={loading}
            size="small"
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : children}
      </DialogContent>
      
      {actions && (
        <>
          <Divider />
          <DialogActions>
            {actions}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ModalContainer;