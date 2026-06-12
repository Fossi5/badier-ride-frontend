import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Drawer, Divider, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { useAlert } from '../../context/AlertContext';
import StatusChip from '../../components/common/StatusChip';
import { getAlerts, createAlert, resolveAlert, updateAlertStatus } from '../../api/alerts';
import { getAllRoutes } from '../../api/routes';
import { getAvailableDrivers } from '../../api/drivers';

const PRIORITIES = [
  { value: 'LOW',      label: 'Faible'   },
  { value: 'MEDIUM',   label: 'Moyen'    },
  { value: 'HIGH',     label: 'Élevé'    },
  { value: 'CRITICAL', label: 'Critique' },
];

const STATUSES = [
  { value: '',            label: 'Tous'      },
  { value: 'NEW',         label: 'Nouveau'   },
  { value: 'IN_PROGRESS', label: 'En cours'  },
  { value: 'RESOLVED',    label: 'Résolu'    },
  { value: 'CLOSED',      label: 'Fermé'     },
];

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [detailAlert, setDetailAlert] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [createForm, setCreateForm] = useState({ title: '', description: '', priority: 'MEDIUM', routeId: '', driverId: '' });
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const { success, error: showError } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    getAllRoutes().then(r => setRoutes(r.data || [])).catch(() => {});
    getAvailableDrivers().then(r => setDrivers(r.data || [])).catch(() => {});
  }, []);

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
        ...(createForm.routeId  ? { routeId:  Number(createForm.routeId)  } : {}),
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

  const handleStartProgress = async (alert) => {
    try {
      await updateAlertStatus(alert.id, 'IN_PROGRESS');
      success('Alerte passée en cours');
      if (detailAlert?.id === alert.id) setDetailAlert(prev => ({ ...prev, status: 'IN_PROGRESS' }));
      refetch();
    } catch {
      showError("Impossible de mettre à jour le statut");
    }
  };

  const handleResolve = async () => {
    try {
      await resolveAlert(selectedAlert.id, resolveNote);
      success('Alerte résolue');
      setResolveOpen(false);
      setResolveNote('');
      if (detailAlert?.id === selectedAlert.id) setDetailAlert(prev => ({ ...prev, status: 'RESOLVED' }));
      setSelectedAlert(null);
      refetch();
    } catch {
      showError("Impossible de résoudre l'alerte");
    }
  };

  const openResolve = (alert) => {
    setSelectedAlert(alert);
    setResolveNote('');
    setResolveOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <Tooltip title="Retour au tableau de bord">
          <IconButton onClick={() => navigate('/dispatcher/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flex: 1 }}>Alertes</Typography>
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
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
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
                  <TableRow key={alert.id} hover>
                    <TableCell>{alert.title}</TableCell>
                    <TableCell>
                      <StatusChip status={alert.priority} type="alert-priority" size="small" />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={alert.status} type="alert-status" size="small" />
                    </TableCell>
                    <TableCell>{alert.driverUsername || '—'}</TableCell>
                    <TableCell>{alert.routeName || '—'}</TableCell>
                    <TableCell>
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Détails">
                          <IconButton size="small" onClick={() => setDetailAlert(alert)}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {alert.status === 'NEW' && (
                          <Tooltip title="Passer en cours">
                            <IconButton size="small" color="info" onClick={() => handleStartProgress(alert)}>
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(alert.status === 'NEW' || alert.status === 'IN_PROGRESS') && (
                          <Tooltip title="Résoudre">
                            <IconButton size="small" color="success" onClick={() => openResolve(alert)}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Panneau de détail */}
      <Drawer anchor="right" open={!!detailAlert} onClose={() => setDetailAlert(null)}>
        {detailAlert && (
          <Box sx={{ width: 360, p: 3 }}>
            <Typography variant="h6" gutterBottom>Détails de l'alerte</Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" color="text.secondary">Titre</Typography>
            <Typography mb={2}>{detailAlert.title}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography mb={2}>{detailAlert.description || '—'}</Typography>

            <Box display="flex" gap={1} mb={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Priorité</Typography>
                <StatusChip status={detailAlert.priority} type="alert-priority" size="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                <StatusChip status={detailAlert.status} type="alert-status" size="small" />
              </Box>
            </Box>

            <Typography variant="subtitle2" color="text.secondary">Chauffeur</Typography>
            <Typography mb={2}>{detailAlert.driverUsername || '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Route</Typography>
            <Typography mb={2}>{detailAlert.routeName || '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Créée le</Typography>
            <Typography mb={2}>
              {detailAlert.createdAt ? new Date(detailAlert.createdAt).toLocaleString('fr-FR') : '—'}
            </Typography>

            {detailAlert.resolvedAt && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Résolue le</Typography>
                <Typography mb={2}>{new Date(detailAlert.resolvedAt).toLocaleString('fr-FR')}</Typography>
              </>
            )}

            {detailAlert.resolutionNote && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Note de résolution</Typography>
                <Typography mb={2}>{detailAlert.resolutionNote}</Typography>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Box display="flex" flexDirection="column" gap={1}>
              {detailAlert.status === 'NEW' && (
                <Button
                  variant="outlined" color="info" startIcon={<PlayArrowIcon />}
                  onClick={() => handleStartProgress(detailAlert)}
                >
                  Passer en cours
                </Button>
              )}
              {(detailAlert.status === 'NEW' || detailAlert.status === 'IN_PROGRESS') && (
                <Button
                  variant="contained" color="success" startIcon={<CheckIcon />}
                  onClick={() => { openResolve(detailAlert); }}
                >
                  Résoudre
                </Button>
              )}
              <Button onClick={() => setDetailAlert(null)}>Fermer</Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Dialog création */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une alerte</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Titre"
            value={createForm.title}
            onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
            fullWidth required
          />
          <TextField
            label="Description"
            value={createForm.description}
            onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            fullWidth multiline rows={3}
          />
          <FormControl fullWidth>
            <InputLabel>Priorité</InputLabel>
            <Select
              value={createForm.priority}
              label="Priorité"
              onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value }))}
            >
              {PRIORITIES.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Tournée concernée (optionnel)</InputLabel>
            <Select
              value={createForm.routeId}
              label="Tournée concernée (optionnel)"
              onChange={e => setCreateForm(f => ({ ...f, routeId: e.target.value }))}
            >
              <MenuItem value=""><em>Aucune</em></MenuItem>
              {routes.map(r => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} — {r.driver?.username ?? 'sans chauffeur'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Chauffeur concerné (optionnel)</InputLabel>
            <Select
              value={createForm.driverId}
              label="Chauffeur concerné (optionnel)"
              onChange={e => setCreateForm(f => ({ ...f, driverId: e.target.value }))}
            >
              <MenuItem value=""><em>Aucun</em></MenuItem>
              {drivers.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.username}{d.vehicleType ? ` — ${d.vehicleType}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!createForm.title}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog résolution */}
      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Résoudre l'alerte</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Note de résolution"
            value={resolveNote}
            onChange={e => setResolveNote(e.target.value)}
            fullWidth multiline rows={3}
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
