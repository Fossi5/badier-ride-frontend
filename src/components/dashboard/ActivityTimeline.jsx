// src/components/dashboard/ActivityTimeline.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import { format, isToday, isYesterday } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Composant pour afficher une chronologie d'activités
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.activities - Liste des activités à afficher
 * @param {boolean} props.loading - Indicateur de chargement
 * @param {string} props.title - Titre de la chronologie
 * @param {Function} props.onViewAll - Fonction appelée quand on clique sur "Voir tout"
 * @param {number} props.maxItems - Nombre max d'activités à afficher (par défaut 5)
 */
const ActivityTimeline = ({
  activities = [],
  loading = false,
  title = "Activités récentes",
  onViewAll,
  maxItems = 5
}) => {
  // Formatage de la date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      if (isToday(date)) {
        return `Aujourd'hui ${format(date, 'HH:mm')}`;
      } else if (isYesterday(date)) {
        return `Hier ${format(date, 'HH:mm')}`;
      } else {
        return format(date, 'dd/MM/yyyy HH:mm');
      }
    } catch (e) {
      console.error('Invalid date format:', e);
      return 'Date inconnue';
    }
  };
  
  // Fonction pour obtenir la couleur selon le type d'activité
  const getTypeColor = (type) => {
    switch (type) {
      case 'ROUTE_CREATED':
        return 'primary';
      case 'ROUTE_COMPLETED':
        return 'success';
      case 'ROUTE_STARTED':
        return 'info';
      case 'DELIVERY_COMPLETED':
        return 'success';
      case 'DELIVERY_FAILED':
        return 'error';
      case 'USER_CONNECTED':
        return 'secondary';
      case 'ALERT_CREATED':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Fonction pour obtenir l'icône selon le type d'activité
  const getTypeIcon = (type) => {
    switch (type) {
      case 'ROUTE_CREATED':
        return <DirectionsCarIcon />;
      case 'ROUTE_COMPLETED':
        return <CheckCircleIcon />;
      case 'ROUTE_STARTED':
        return <LocalShippingIcon />;
      case 'DELIVERY_COMPLETED':
        return <AssignmentTurnedInIcon />;
      case 'DELIVERY_FAILED':
        return <ErrorIcon />;
      case 'USER_CONNECTED':
        return <PersonIcon />;
      case 'ALERT_CREATED':
        return <WarningIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };
  
  // Liste des activités limitée au nombre maximal
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {displayedActivities.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Typography color="text.secondary">Aucune activité récente</Typography>
            </Box>
          ) : (
            <List>
              {displayedActivities.map((activity, index) => (
                <React.Fragment key={activity.id || index}>
                  {index > 0 && <Divider variant="inset" component="li" />}
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getTypeColor(activity.type)}.main` }}>
                        {getTypeIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle2"
                            component="span"
                          >
                            {activity.title}
                          </Typography>
                          <Chip
                            label={formatDate(activity.timestamp || activity.date || activity.createdAt)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {activity.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
          
          {onViewAll && activities.length > maxItems && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="text" onClick={onViewAll}>
                Voir toutes les activités
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ActivityTimeline;