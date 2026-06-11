import { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText,
  Button, CircularProgress, Divider, Paper
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getNotifications, markAllRead } from '../../api/notifications';
import { useAlert } from '../../context/AlertContext';

const TYPE_ICONS = {
  NEW_ROUTE: <DirectionsCarIcon color="primary" />,
  ROUTE_UPDATE: <EditIcon color="warning" />,
  ALERT: <WarningIcon color="error" />,
  SYSTEM: <InfoIcon color="info" />,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useAlert();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      showError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    success('Notifications marquées comme lues');
    load();
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, px: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Notifications</Typography>
        <Button
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
          disabled={notifications.every(n => n.isRead)}
        >
          Tout marquer comme lu
        </Button>
      </Box>
      {notifications.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>Aucune notification</Typography>
      ) : (
        <Paper>
          <List disablePadding>
            {notifications.map((n, i) => (
              <Box key={n.id}>
                <ListItem sx={{ bgcolor: n.isRead ? 'inherit' : 'action.hover' }}>
                  <ListItemIcon>{TYPE_ICONS[n.type] ?? <InfoIcon />}</ListItemIcon>
                  <ListItemText
                    primary={n.message}
                    secondary={n.createdAt ? new Date(n.createdAt).toLocaleString('fr-FR') : ''}
                  />
                </ListItem>
                {i < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
