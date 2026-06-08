// src/pages/admin/components/TodayRoutesList.jsx
import React from 'react';
import {
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Box
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import { formatDate } from '../../../utils/formatters';

/**
 * Liste des tournées du jour.
 * Props :
 *   routes  - tableau des tournées filtrées pour aujourd'hui
 *   loading - booléen d'état de chargement
 */
const TodayRoutesList = ({ routes = [], loading }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tournées d'aujourd'hui ({routes.length})
      </Typography>
      <Divider sx={{ my: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : routes.length === 0 ? (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
          Aucune tournée prévue pour aujourd'hui
        </Typography>
      ) : (
        <List>
          {routes.map((route) => (
            <ListItem
              key={route.id}
              divider
              secondaryAction={
                <IconButton edge="end" disabled>
                  {route.status === 'COMPLETED' ? (
                    <CheckCircleIcon color="success" />
                  ) : route.status === 'IN_PROGRESS' ? (
                    <SpeedIcon color="primary" />
                  ) : route.status === 'CANCELLED' ? (
                    <ReportIcon color="error" />
                  ) : (
                    <WarningIcon color="warning" />
                  )}
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <TimelineIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={route.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Chauffeur: {route.driver.username} •
                      Points: {route.deliveryPoints.length} •
                      Statut: {route.status}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="textSecondary">
                      {route.startTime && formatDate(route.startTime, 'datetime')}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TodayRoutesList;
