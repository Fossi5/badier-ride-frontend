// src/pages/admin/components/StatCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button
} from '@mui/material';

/**
 * Carte de statistique générique pour le tableau de bord admin.
 * Props :
 *   title       - libellé affiché en tête de carte
 *   value       - valeur principale (chiffre)
 *   icon        - icône MUI à afficher dans l'Avatar
 *   color       - couleur MUI ex: 'primary.main', 'success.main'…
 *   subContent  - nœud React optionnel affiché sous la valeur (sous-stats)
 *   buttonLabel - texte du bouton de navigation (optionnel)
 *   buttonVariant - 'outlined' | 'contained' (défaut 'outlined')
 *   buttonColor - couleur MUI du bouton (défaut 'primary')
 *   onClick     - handler du bouton
 */
const StatCard = ({
  title,
  value,
  icon,
  color = 'primary.main',
  subContent,
  buttonLabel,
  buttonVariant = 'outlined',
  buttonColor = 'primary',
  onClick
}) => {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>

        {subContent && (
          <Box sx={{ mt: 2 }}>
            {subContent}
          </Box>
        )}

        {buttonLabel && (
          <Button
            variant={buttonVariant}
            color={buttonColor}
            size="small"
            fullWidth
            sx={{ mt: 2 }}
            onClick={onClick}
          >
            {buttonLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
