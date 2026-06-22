import { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText,
  Button, CircularProgress, Divider, Paper, IconButton, Tooltip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import MessageIcon from '@mui/icons-material/Message';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { getNotifications, markAllRead, deleteNotification, deleteAllNotifications } from '../../api/notifications';
import { useAlert } from '../../context/AlertContext';

const TYPE_ICONS = {
  NEW_ROUTE:    <DirectionsCarIcon color="primary" />,
  ROUTE_UPDATE: <EditIcon color="warning" />,
  ALERT:        <WarningIcon color="error" />,
  SYSTEM:       <InfoIcon color="info" />,
  MESSAGE:      <MessageIcon color="secondary" />,
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
    try {
      await markAllRead();
      success('Notifications marquées comme lues');
      load();
    } catch {
      showError('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      showError('Erreur lors de la suppression');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      success('Toutes les notifications supprimées');
    } catch {
      showError('Erreur lors de la suppression');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, px: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Notifications</Typography>
        <Box display="flex" gap={1}>
          <Button
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.isRead)}
            size="small"
          >
            Tout lire
          </Button>
          <Button
            startIcon={<DeleteSweepIcon />}
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
            color="error"
            size="small"
          >
            Tout supprimer
          </Button>
        </Box>
      </Box>

      {notifications.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>Aucune notification</Typography>
      ) : (
        <Paper>
          <List disablePadding>
            {notifications.map((n, i) => (
              <Box key={n.id}>
                <ListItem
                  sx={{ bgcolor: n.isRead ? 'inherit' : 'action.hover' }}
                  secondaryAction={
                    <Tooltip title="Supprimer">
                      <IconButton edge="end" size="small" onClick={() => handleDelete(n.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemIcon>{TYPE_ICONS[n.type] ?? <InfoIcon />}</ListItemIcon>
                  <ListItemText
                    primary={n.message}
                    secondary={
                      <>
                        {n.senderUsername && <span style={{ marginRight: 8 }}>De : {n.senderUsername}</span>}
                        {n.createdAt ? new Date(n.createdAt).toLocaleString('fr-FR') : ''}
                      </>
                    }
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
