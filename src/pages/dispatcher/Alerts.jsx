import { useState } from 'react';
import {
  Container, Typography, Box, Button, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { useAsync } from '../../hooks/useAsync';
import { useAlert } from '../../context/AlertContext';
import StatusChip from '../../components/common/StatusChip';
import { getAlerts, createAlert, resolveAlert } from '../../api/alerts';

const PRIORITY_COLOR = {
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'error',
};

const ALERT_STATUS_COLOR = {
  NEW: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [createForm, setCreateForm] = useState({ title: '', description: '', priority: 'MEDIUM', routeId: '', driverId: '' });
  const { success, error: showError } = useAlert();

  const { data: alerts, loading, refetch } = useAsync(
    () => getAlerts(statusFilter || undefined),
    [statusFilter]
  );

  const allAlerts = alerts || [];

  const handleCreate = async () => {
    try {
      const payload = {
        title: createForm.title,
        description: createForm.description,
        priority: createForm.priority,
        ...(createForm.routeId ? { routeId: Number(createForm.routeId) } : {}),
        ...(createForm.driverId ? { driverId: Number(createForm.driverId) } : {}),
      };
      await createAlert(payload);
      success('Alerte créée');
      setCreateOpen(false);
      setCreateForm({ title: '', description: '', priority: 'MEDIUM', routeId: '', driverId: '' });
      refetch();
    } catch {
      showError("Impossible de créer l'alerte");
    }
  };

  const handleResolve = async () => {
    try {
      await resolveAlert(selectedAlert.id, resolveNote);
      success('Alerte résolue');
      setResolveOpen(false);
      setResolveNote('');
      setSelectedAlert(null);
      refetch();
    } catch {
      showError("Impossible de résoudre l'alerte");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Alertes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Créer une alerte
        </Button>
      </Box>

      <Box mb={3}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par statut</InputLabel>
          <Select
            value={statusFilter}
            label="Filtrer par statut"
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUSES.map(s => (
              <MenuItem key={s} value={s}>{s || 'Tous'}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Chauffeur</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">Aucune alerte</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allAlerts.map(alert => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.title}</TableCell>
                    <TableCell>
                      <StatusChip status={alert.priority} type="alert-priority" size="small" />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={alert.status} type="alert-status" size="small" />
                    </TableCell>
                    <TableCell>{alert.driver?.username || '—'}</TableCell>
                    <TableCell>{alert.route?.name || '—'}</TableCell>
                    <TableCell>
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell>
                      {alert.status !== 'RESOLVED' && alert.status !== 'CLOSED' && (
                        <Tooltip title="Résoudre">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => { setSelectedAlert(alert); setResolveOpen(true); }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une alerte</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Titre"
            value={createForm.title}
            onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={createForm.description}
            onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel>Priorité</InputLabel>
            <Select
              value={createForm.priority}
              label="Priorité"
              onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value }))}
            >
              {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="ID Route (optionnel)"
            value={createForm.routeId}
            onChange={e => setCreateForm(f => ({ ...f, routeId: e.target.value }))}
            fullWidth
            type="number"
          />
          <TextField
            label="ID Chauffeur (optionnel)"
            value={createForm.driverId}
            onChange={e => setCreateForm(f => ({ ...f, driverId: e.target.value }))}
            fullWidth
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!createForm.title}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Résoudre l'alerte</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Note de résolution"
            value={resolveNote}
            onChange={e => setResolveNote(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveOpen(false)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={handleResolve}>
            Résoudre
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
