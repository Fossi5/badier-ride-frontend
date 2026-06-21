import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Box, Paper, Chip, IconButton, Tooltip,
  CircularProgress, List, ListItem, ListItemText, Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon, ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon, Circle as CircleIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { getAllDrivers } from '../../api/drivers';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createDriverIcon = (available) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${available ? '#4caf50' : '#f44336'};
      width:32px;height:32px;border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
    ">🚗</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });

const MapBounds = ({ drivers }) => {
  const map = useMap();
  useEffect(() => {
    const located = drivers.filter(d => d.latitude && d.longitude);
    if (located.length === 0) return;
    const bounds = L.latLngBounds(located.map(d => [d.latitude, d.longitude]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [drivers, map]);
  return null;
};

const DriverMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const { error } = useAlert();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const backPath = isAdmin() ? '/admin/dashboard' : '/dispatcher/dashboard';

  const fetchDrivers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAllDrivers();
      setDrivers(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      error('Erreur lors du chargement des chauffeurs : ' + (err.response?.status ?? err.message));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    intervalRef.current = setInterval(() => fetchDrivers(true), 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const locatedDrivers = drivers.filter(d => d.latitude && d.longitude);
  const unlocatedDrivers = drivers.filter(d => !d.latitude || !d.longitude);

  const defaultCenter = [50.8503, 4.3517];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Tooltip title="Retour">
          <IconButton onClick={() => navigate(backPath)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flex: 1 }}>Localisation des chauffeurs</Typography>
        {lastRefresh && (
          <Typography variant="caption" color="text.secondary">
            Mis à jour : {lastRefresh.toLocaleTimeString('fr-BE')}
          </Typography>
        )}
        <Tooltip title="Rafraîchir">
          <span>
            <IconButton onClick={() => fetchDrivers()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Paper sx={{ flex: 1, overflow: 'hidden', borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
              <CircularProgress />
            </Box>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={8}
              style={{ height: 500, width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locatedDrivers.length > 0 && <MapBounds drivers={locatedDrivers} />}
              {locatedDrivers.map(driver => (
                <Marker
                  key={driver.id}
                  position={[driver.latitude, driver.longitude]}
                  icon={createDriverIcon(driver.isAvailable)}
                >
                  <Popup>
                    <Box sx={{ minWidth: 150 }}>
                      <Typography variant="subtitle2" fontWeight="bold">{driver.username}</Typography>
                      <Typography variant="body2">{driver.firstName} {driver.lastName}</Typography>
                      {driver.vehicleType && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {driver.vehicleType}
                        </Typography>
                      )}
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={driver.isAvailable ? 'Disponible' : 'Indisponible'}
                          color={driver.isAvailable ? 'success' : 'error'}
                        />
                      </Box>
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </Paper>

        <Paper sx={{ width: { xs: '100%', md: 280 }, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Chauffeurs ({drivers.length})
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List dense>
            {drivers.map(driver => (
              <ListItem key={driver.id} sx={{ px: 0 }}>
                <CircleIcon
                  fontSize="small"
                  sx={{ mr: 1, color: driver.isAvailable ? 'success.main' : 'error.main', flexShrink: 0 }}
                />
                <ListItemText
                  primary={driver.username}
                  secondary={
                    driver.latitude && driver.longitude
                      ? `${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}`
                      : 'Position inconnue'
                  }
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
            {drivers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Aucun chauffeur
              </Typography>
            )}
          </List>
          {unlocatedDrivers.length > 0 && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="caption">
                {unlocatedDrivers.length} chauffeur(s) sans position GPS
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default DriverMap;
