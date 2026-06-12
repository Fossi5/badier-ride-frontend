import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box, Typography, Button, CircularProgress,
  SpeedDial, SpeedDialAction, SpeedDialIcon, Fab, Chip
} from '@mui/material';
import StatusChip from '../common/StatusChip';
import DirectionsIcon from '@mui/icons-material/Directions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NavigationIcon from '@mui/icons-material/Navigation';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { geocodeAddress, calculateRoute } from '../../utils/geocoding';
import { isMobileDevice, isIOS, openNavigation } from '../../utils/navigationUtils';
import { DRIVER_ICON } from '../../utils/mapIcons';

const STATUS_COLORS = {
  PENDING: '#6b7280',
  IN_PROGRESS: '#f97316',
  COMPLETED: '#22c55e',
  FAILED: '#ef4444'
};

const createNumberedIcon = (label, status = 'PENDING', isNextStop = false) => {
  const safeLabel = label != null ? label : '?';
  const borderColor = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  const background = isNextStop ? borderColor : '#ffffff';
  const textColor = isNextStop ? '#ffffff' : borderColor;
  const halo = isNextStop
    ? 'box-shadow:0 0 0 8px rgba(37,99,235,0.18),0 4px 12px rgba(0,0,0,0.35);'
    : 'box-shadow:0 4px 10px rgba(0,0,0,0.25);';

  return L.divIcon({
    className: 'delivery-number-icon',
    html: `
      <div style="
        width:34px;height:34px;border-radius:17px;
        border:3px solid ${borderColor};background:${background};color:${textColor};
        font-size:14px;font-weight:700;display:flex;align-items:center;
        justify-content:center;${halo}
      ">${safeLabel}</div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;border-right:6px solid transparent;
        border-top:10px solid ${borderColor};margin:0 auto;transform:translateY(-2px);
      "></div>
    `,
    iconSize: [34, 40],
    iconAnchor: [17, 36],
    popupAnchor: [0, -34]
  });
};

const MapControl = ({ positions, driverPosition, mapRef }) => {
  const map = useMap();

  useEffect(() => {
    if (mapRef) mapRef.current = map;
  }, [map, mapRef]);

  useEffect(() => {
    if (driverPosition) {
      map._recenterOnDriver = () => map.flyTo(driverPosition, 15, { duration: 1 });
    }
  }, [driverPosition, map]);

  useEffect(() => {
    if (positions?.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [48, 48], animate: false });
        }
      } catch (_e) {
        // positions invalides
      }
    }
  }, [positions, map]);

  return null;
};

const LocationMarker = ({ onLocationUpdate, onPositionChange }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      const coords = [e.latlng.lat, e.latlng.lng];
      if (onLocationUpdate) onLocationUpdate(coords);
      if (onPositionChange) onPositionChange(coords);
    }
  });

  useEffect(() => {
    map.locate({ setView: true });
    const interval = setInterval(() => map.locate(), 30000);
    return () => clearInterval(interval);
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={DRIVER_ICON}>
      <Popup>
        <Typography variant="subtitle2">Votre position</Typography>
        <Typography variant="caption">Chauffeur</Typography>
      </Popup>
    </Marker>
  );
};

const DeliveryMap = ({ route, onStatusUpdate, onLocationUpdate, loading = false }) => {
  const [routePoints, setRoutePoints] = useState([]);
  const [driverPosition, setDriverPosition] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [fullRouteGeometry, setFullRouteGeometry] = useState(null);
  const [activeSegmentGeometry, setActiveSegmentGeometry] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [nextStopIndex, setNextStopIndex] = useState(-1);
  const mapRef = React.useRef(null);

  const allPositions = useMemo(() => [
    ...(driverPosition ? [driverPosition] : []),
    ...routePoints.map(p => p.position)
  ], [driverPosition, routePoints]);

  useEffect(() => {
    if (!route?.deliveryPoints) return;

    const loadPoints = async () => {
      setGeocoding(true);
      const points = [];

      for (const point of route.deliveryPoints) {
        let position = null;

        if (point.address?.latitude && point.address?.longitude) {
          position = [point.address.latitude, point.address.longitude];
        } else if (point.address?.street && point.address?.city) {
          position = await geocodeAddress(point.address);
          await new Promise(resolve => setTimeout(resolve, 1100));
        }

        if (position) {
          points.push({
            id: point.id,
            position,
            clientName: point.clientName,
            address: `${point.address.street}, ${point.address.city}, ${point.address.postalCode || ''}`,
            status: point.deliveryStatus,
            time: point.plannedTime,
            actualTime: point.actualTime,
            phone: point.clientPhoneNumber,
            notes: point.clientNote,
            sequenceOrder: typeof point.sequenceOrder === 'number' ? point.sequenceOrder : points.length
          });
        }
      }

      points.sort((a, b) => {
        const oa = typeof a.sequenceOrder === 'number' ? a.sequenceOrder : Number.MAX_SAFE_INTEGER;
        const ob = typeof b.sequenceOrder === 'number' ? b.sequenceOrder : Number.MAX_SAFE_INTEGER;
        return oa !== ob ? oa - ob : (a.clientName || '').localeCompare(b.clientName || '');
      });

      const firstPending = points.findIndex(p => p.status !== 'COMPLETED' && p.status !== 'FAILED');
      setNextStopIndex(firstPending === -1 ? (points.length ? points.length - 1 : -1) : firstPending);
      setRoutePoints(points);
      setGeocoding(false);

      if (points.length > 1) {
        const result = await calculateRoute(points.map(p => p.position));
        if (result) {
          setFullRouteGeometry(result.coordinates);
          setRouteInfo({ distance: result.distance, duration: result.duration });
        }
      }
    };

    loadPoints();
  }, [route]);

  useEffect(() => {
    if (!driverPosition || routePoints.length === 0) return;

    const update = async () => {
      const allCoords = [driverPosition, ...routePoints.map(p => p.position)];
      const result = await calculateRoute(allCoords);
      if (result) {
        setFullRouteGeometry(result.coordinates);
        setRouteInfo({ distance: result.distance, duration: result.duration });
      }

      const nextStop = nextStopIndex >= 0 ? routePoints[nextStopIndex] : null;
      if (nextStop) {
        const activeResult = await calculateRoute([driverPosition, nextStop.position]);
        if (activeResult) setActiveSegmentGeometry(activeResult.coordinates);
      }
    };

    update();
  }, [driverPosition, routePoints, nextStopIndex]);

  if (!route?.deliveryPoints?.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Aucune tournée active</Typography>
      </Box>
    );
  }

  const nextStop = nextStopIndex >= 0 && nextStopIndex < routePoints.length
    ? routePoints[nextStopIndex]
    : null;

  const handleRecenter = () => {
    if (driverPosition && mapRef.current) {
      mapRef.current.flyTo(driverPosition, 15, { duration: 1 });
    }
  };

  const isMobile = isMobileDevice();
  const navigationActions = [
    { icon: <MapIcon />, name: 'Google Maps', onClick: () => openNavigation('google', routePoints, driverPosition) }
  ];
  if (isMobile) navigationActions.push({ icon: <NavigationIcon />, name: 'Waze', onClick: () => openNavigation('waze', routePoints, driverPosition) });
  if (isIOS()) navigationActions.push({ icon: <MapIcon />, name: 'Apple Plans', onClick: () => openNavigation('apple', routePoints, driverPosition) });

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[50.8503, 4.3517]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapControl positions={allPositions} driverPosition={driverPosition} mapRef={mapRef} />

        {fullRouteGeometry?.length > 1 && (
          <>
            <Polyline positions={fullRouteGeometry} color="#ffffff" weight={8} opacity={1} lineJoin="round" />
            <Polyline positions={fullRouteGeometry} color="#1976d2" weight={5} opacity={0.75} lineJoin="round" />
          </>
        )}

        {activeSegmentGeometry?.length > 1 && (
          <>
            <Polyline positions={activeSegmentGeometry} color="#ffffff" weight={10} opacity={1} lineJoin="round" />
            <Polyline positions={activeSegmentGeometry} color="#00BCD4" weight={7} opacity={0.95} lineJoin="round" />
          </>
        )}

        {!fullRouteGeometry && routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map(p => p.position)}
            color="#1976d2"
            weight={3}
            opacity={0.5}
            dashArray="8, 10"
          />
        )}

        <LocationMarker
          onLocationUpdate={onLocationUpdate}
          onPositionChange={setDriverPosition}
        />

        {routeInfo && (
          <Box sx={{
            position: 'absolute', top: 10, left: 10,
            bgcolor: 'white', p: 1.5, borderRadius: 1, boxShadow: 2, zIndex: 1000
          }}>
            <Typography variant="caption" display="block">
              <strong>Distance :</strong> {routeInfo.distance} km
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Durée estimée :</strong> {routeInfo.duration} min
            </Typography>
          </Box>
        )}

        {nextStop && (
          <Box sx={{
            position: 'absolute', top: 10, right: 10,
            bgcolor: 'white', p: 1.5, borderRadius: 1, boxShadow: 2,
            zIndex: 1000, minWidth: 180
          }}>
            <Typography variant="caption" color="text.secondary">Prochain arrêt</Typography>
            <Typography variant="body2" fontWeight="bold">
              #{nextStopIndex + 1} - {nextStop.clientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">{nextStop.address}</Typography>
          </Box>
        )}

        {routePoints.map((point, index) => (
          <Marker
            key={point.id}
            position={point.position}
            icon={createNumberedIcon(index + 1, point.status, nextStopIndex === index)}
          >
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  #{index + 1} - {point.clientName}
                </Typography>
                <Typography variant="body2" color="text.secondary">{point.address}</Typography>

                <Box sx={{ mt: 1, mb: 1 }}>
                  <StatusChip status={point.status} type="delivery" />
                  {nextStopIndex === index && (
                    <Chip size="small" label="Prochain arrêt" color="info" sx={{ ml: 1 }} />
                  )}
                </Box>

                {point.time && (
                  <Typography variant="body2">
                    <strong>Heure prévue :</strong> {new Date(point.time).toLocaleTimeString()}
                  </Typography>
                )}
                {point.phone && (
                  <Typography variant="body2"><strong>Tél :</strong> {point.phone}</Typography>
                )}
                {point.notes && (
                  <Typography variant="body2"><strong>Notes :</strong> {point.notes}</Typography>
                )}

                {point.status !== 'COMPLETED' && point.status !== 'FAILED' && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      size="small" variant="contained" color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => onStatusUpdate?.(point.id, 'COMPLETED')}
                      disabled={loading}
                    >
                      Livré
                    </Button>
                    <Button
                      size="small" variant="contained" color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => onStatusUpdate?.(point.id, 'FAILED')}
                      disabled={loading}
                    >
                      Échec
                    </Button>
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small" fullWidth variant="outlined" color="primary"
                    startIcon={<DirectionsIcon />}
                    href={`https://www.google.com/maps/dir/?api=1&destination=${point.position[0]},${point.position[1]}`}
                    target="_blank"
                  >
                    Itinéraire
                  </Button>
                </Box>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {(loading || geocoding) && (
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: 'rgba(255,255,255,0.7)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <CircularProgress />
          {geocoding && (
            <Typography variant="body2" sx={{ mt: 2 }}>Géocodage des adresses…</Typography>
          )}
        </Box>
      )}

      {routePoints.length > 0 && (
        <SpeedDial
          ariaLabel="Navigation externe"
          sx={{ position: 'absolute', bottom: 80, right: 16 }}
          icon={<SpeedDialIcon icon={<DirectionsIcon />} />}
          FabProps={{ size: 'medium', color: 'primary', sx: { boxShadow: 3 } }}
        >
          {navigationActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
              tooltipOpen
            />
          ))}
        </SpeedDial>
      )}

      {driverPosition && (
        <Fab
          color="secondary"
          aria-label="recentrer sur ma position"
          sx={{ position: 'absolute', bottom: 16, right: 16, boxShadow: 3 }}
          onClick={handleRecenter}
        >
          <MyLocationIcon />
        </Fab>
      )}
    </Box>
  );
};

export default DeliveryMap;
