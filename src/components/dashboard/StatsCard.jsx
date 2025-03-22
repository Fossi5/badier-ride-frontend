// src/components/dashboard/StatsCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Divider,
  Button
} from '@mui/material';

/**
 * Composant pour afficher une carte de statistiques 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Titre de la carte
 * @param {string|number} props.value - Valeur principale à afficher
 * @param {string} props.subtitle - Texte secondaire sous la valeur
 * @param {React.ReactNode} props.icon - Icône à afficher
 * @param {string} props.color - Couleur de l'avatar de l'icône (primary, secondary, success, warning, error, info)
 * @param {number} props.progress - Valeur de la progression (0-100)
 * @param {string} props.buttonText - Texte du bouton (optionnel)
 * @param {Function} props.buttonAction - Action du bouton (optionnel)
 * @param {Object} props.sx - Style supplémentaire à appliquer à la carte
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  progress,
  buttonText,
  buttonAction,
  sx = {}
}) => {
  // Couleur de l'avatar en fonction de la prop color
  const getAvatarColor = () => {
    switch (color) {
      case 'primary': return 'primary.main';
      case 'secondary': return 'secondary.main';
      case 'success': return 'success.main';
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      case 'info': return 'info.main';
      default: return color; // Si une couleur CSS est fournie directement
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        ...sx 
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography color="text.secondary" gutterBottom variant="body2">
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon && (
            <Avatar 
              sx={{ 
                bgcolor: getAvatarColor(), 
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              {icon}
            </Avatar>
          )}
          
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        
        {typeof progress === 'number' && (
          <Box sx={{ mt: 'auto', mb: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progression
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              color={color !== 'primary' ? color : undefined}
            />
          </Box>
        )}
        
        {buttonText && buttonAction && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="outlined" 
              size="small" 
              onClick={buttonAction}
              fullWidth
              color={color !== 'primary' ? color : undefined}
            >
              {buttonText}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;