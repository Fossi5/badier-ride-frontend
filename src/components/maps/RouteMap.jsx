import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip, Fab, CircularProgress } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { calculateRoute } from '../../utils/geocoding';
import { DRIVER_ICON, getStatusIcon } from '../../utils/mapIcons';

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
    if (positions && positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [48, 48] });
        }
      } catch (_e) {
        // positions invalides
      }
    }
  }, [positions, map]);

  return null;
};

const RouteMap = ({ route, onRouteInfo }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const mapRef = React.useRef(null);

  const allPositions = [
    ...(driverPosition ? [driverPosition] : []),
    ...routePoints.map(p => p.position)
  ];

  useEffect(() => {
    if (!route) return;

    setRouteGeometry(null);
    setRouteInfo(null);

    const initializeRoute = async () => {
      if (route.driver?.latitude && route.driver?.longitude) {
        setDriverPosition([route.driver.latitude, route.driver.longitude]);
      }

      if (!route.deliveryPoints?.length) return;

      const points = route.deliveryPoints
        .filter(p => p.address?.latitude && p.address?.longitude)
        .map(p => ({
          id: p.id,
          position: [p.address.latitude, p.address.longitude],
          clientName: p.clientName,
          address: `${p.address.street}, ${p.address.city}, ${p.address.postalCode}`,
          status: p.deliveryStatus,
          time: p.plannedTime,
          actualTime: p.actualTime,
          phone: p.clientPhoneNumber,
          notes: p.clientNote
        }));

      setRoutePoints(points);

      if (points.length > 1) {
        setCalculatingRoute(true);
        const result = await calculateRoute(points.map(p => p.position));
        if (result) {
          setRouteGeometry(result.coordinates);
          const info = { distance: result.distance, duration: result.duration };
          setRouteInfo(info);
          if (onRouteInfo) onRouteInfo(info);
        }
        setCalculatingRoute(false);
      }
    };

    initializeRoute();
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRecenter = () => {
    if (driverPosition && mapRef.current) {
      mapRef.current.flyTo(driverPosition, 15, { duration: 1 });
    }
  };

  const formatValue = (val, unit) =>
    typeof val === 'number' ? `${val.toFixed(1)} ${unit}` : val;

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

        <MapControl
          positions={allPositions}
          driverPosition={driverPosition}
          mapRef={mapRef}
        />

        {routeGeometry?.length > 1 && (
          <>
            <Polyline positions={routeGeometry} color="#ffffff" weight={8} opacity={1} lineJoin="round" />
            <Polyline positions={routeGeometry} color="#1976d2" weight={5} opacity={0.9} lineJoin="round" />
          </>
        )}

        {!routeGeometry && routePoints.length > 1 && (
          <>
            <Polyline
              positions={routePoints.map(p => p.position)}
              color="#1976d2"
              weight={3}
              opacity={0.5}
              dashArray="8, 10"
            />
          </>
        )}

        {driverPosition && (
          <Marker position={driverPosition} icon={DRIVER_ICON}>
            <Popup>
              <Typography variant="subtitle2">Chauffeur : {route.driver?.username}</Typography>
              <Typography variant="body2">Position actuelle</Typography>
            </Popup>
          </Marker>
        )}

        {routePoints.map((point, index) => (
          <Marker key={point.id} position={point.position} icon={getStatusIcon(point.status)}>
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1">{index + 1}. {point.clientName}</Typography>
                <Typography variant="body2">{point.address}</Typography>
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Chip
                    size="small"
                    label={point.status}
                    color={
                      point.status === 'COMPLETED' ? 'success' :
                      point.status === 'IN_PROGRESS' ? 'warning' :
                      point.status === 'FAILED' ? 'error' : 'default'
                    }
                  />
                </Box>
                {point.time && (
                  <Typography variant="body2">
                    <strong>Heure prévue :</strong> {new Date(point.time).toLocaleTimeString()}
                  </Typography>
                )}
                {point.actualTime && (
                  <Typography variant="body2">
                    <strong>Heure réelle :</strong> {new Date(point.actualTime).toLocaleTimeString()}
                  </Typography>
                )}
                {point.phone && (
                  <Typography variant="body2"><strong>Tél :</strong> {point.phone}</Typography>
                )}
                {point.notes && (
                  <Typography variant="body2"><strong>Notes :</strong> {point.notes}</Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {calculatingRoute && (
        <Box sx={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 3,
          display: 'flex', alignItems: 'center', gap: 1, zIndex: 1000
        }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Calcul de l'itinéraire…</Typography>
        </Box>
      )}

      {routeInfo && (
        <Box sx={{
          position: 'absolute', top: 16, left: 16,
          bgcolor: 'background.paper', px: 2, py: 1,
          borderRadius: 1, boxShadow: 3, zIndex: 1000
        }}>
          <Typography variant="body2">
            <strong>Distance :</strong> {formatValue(routeInfo.distance, 'km')}
          </Typography>
          <Typography variant="body2">
            <strong>Durée :</strong> {formatValue(routeInfo.duration, 'min')}
          </Typography>
        </Box>
      )}

      {driverPosition && (
        <Fab
          color="secondary"
          aria-label="recentrer sur la position du chauffeur"
          sx={{ position: 'absolute', bottom: 16, right: 16, boxShadow: 3 }}
          onClick={handleRecenter}
        >
          <MyLocationIcon />
        </Fab>
      )}
    </Box>
  );
};

export default RouteMap;
