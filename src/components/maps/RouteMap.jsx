import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip, Fab, CircularProgress } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { createColoredRouteSegments } from '../../utils/mapUtils';
import { calculateRoute } from '../../utils/geocoding';
import { DRIVER_ICON, getStatusIcon } from '../../utils/mapIcons';

const RecenterControl = ({ driverPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (driverPosition) {
      map._recenterOnDriver = () => {
        map.flyTo(driverPosition, 15, {
          duration: 1
        });
      };
    }
  }, [driverPosition, map]);

  return null;
};

const RouteMap = ({ route }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [center, setCenter] = useState([48.8566, 2.3522]);
  const [zoom, setZoom] = useState(13);
  const [routeSegments, setRouteSegments] = useState([]);
  const [fallbackSegments, setFallbackSegments] = useState([]);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    if (!route) return;

    const initializeRoute = async () => {
      if (route.driver && route.driver.latitude && route.driver.longitude) {
        setDriverPosition([route.driver.latitude, route.driver.longitude]);
      }

      if (route.deliveryPoints && route.deliveryPoints.length > 0) {
        const points = route.deliveryPoints
          .filter(point => point.address && point.address.latitude && point.address.longitude)
          .map(point => ({
            id: point.id,
            position: [point.address.latitude, point.address.longitude],
            clientName: point.clientName,
            address: `${point.address.street}, ${point.address.city}, ${point.address.postalCode}`,
            status: point.deliveryStatus,
            time: point.plannedTime,
            actualTime: point.actualTime,
            phone: point.clientPhoneNumber,
            notes: point.clientNote
          }));
        
        if (points.length > 1) {
          setCalculatingRoute(true);
          const allCoordinates = points.map(p => p.position);
          const routeResult = await calculateRoute(allCoordinates);

          if (routeResult) {
            setRouteGeometry(routeResult.coordinates);
            setRouteInfo({
              distance: routeResult.distance,
              duration: routeResult.duration
            });

            const segments = createColoredRouteSegments(routeResult.coordinates);
            setRouteSegments(segments);
          }
          setCalculatingRoute(false);
        }

        const fallbackPositions = points.map(p => p.position);
        const fallbackSegs = createColoredRouteSegments(fallbackPositions);
        setFallbackSegments(fallbackSegs);

        setRoutePoints(points);

        if (points.length > 0) {
          const latitudes = points.map(p => p.position[0]);
          const longitudes = points.map(p => p.position[1]);

          if (driverPosition) {
            latitudes.push(driverPosition[0]);
            longitudes.push(driverPosition[1]);
          }

          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;
          setCenter([centerLat, centerLng]);

          const latRange = maxLat - minLat;
          const lngRange = maxLng - minLng;
          const range = Math.max(latRange, lngRange);

          let newZoom = 13;
          if (range > 0.2) newZoom = 10;
          if (range > 0.5) newZoom = 9;
          if (range > 1) newZoom = 8;
          if (range > 2) newZoom = 7;
          if (range > 5) newZoom = 6;

          setZoom(newZoom);

          const polylinePositions = points.map(point => point.position);
          if (driverPosition) {
            polylinePositions.unshift(driverPosition);
          }

          const segments = createColoredRouteSegments(polylinePositions);
          setRouteSegments(segments);
        }
      }
    };

    initializeRoute();
  }, [route]);

  const handleRecenterOnDriver = () => {
    if (driverPosition && mapInstance) {
      mapInstance.flyTo(driverPosition, 15, {
        duration: 1
      });
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={(map) => {
          if (map) setMapInstance(map);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterControl driverPosition={driverPosition} />

        {routeGeometry && routeGeometry.length > 1 && routeSegments.length > 0 && (
          <>
            {routeSegments.map((segment, index) => (
              <Polyline
                key={`route-segment-${index}`}
                positions={segment.positions}
                color={segment.color}
                weight={5}
                opacity={0.8}
                lineJoin="round"
              />
            ))}
          </>
        )}

        {!routeGeometry && routePoints.length > 1 && fallbackSegments.length > 0 && (
          <>
            {fallbackSegments.map((segment, index) => (
              <Polyline
                key={`fallback-segment-${index}`}
                positions={segment.positions}
                color={segment.color}
                weight={4}
                opacity={0.6}
                dashArray="5, 10"
              />
            ))}
          </>
        )}

        {driverPosition && (
          <Marker position={driverPosition} icon={DRIVER_ICON}>
            <Popup>
              <Typography variant="subtitle2">Chauffeur: {route.driver.username}</Typography>
              <Typography variant="body2">Position actuelle</Typography>
            </Popup>
          </Marker>
        )}

        {routePoints.map((point, index) => (
          <Marker
            key={point.id}
            position={point.position}
            icon={getStatusIcon(point.status)}
          >
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
                    <strong>Heure prévue:</strong> {new Date(point.time).toLocaleTimeString()}
                  </Typography>
                )}

                {point.actualTime && (
                  <Typography variant="body2">
                    <strong>Heure réelle:</strong> {new Date(point.actualTime).toLocaleTimeString()}
                  </Typography>
                )}

                {point.phone && (
                  <Typography variant="body2">
                    <strong>Téléphone:</strong> {point.phone}
                  </Typography>
                )}

                {point.notes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {point.notes}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {calculatingRoute && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 1000
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2">Calcul de l'itinéraire...</Typography>
        </Box>
      )}

      {routeInfo && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 3,
            zIndex: 1000
          }}
        >
          <Typography variant="body2">
            <strong>Distance:</strong> {routeInfo.distance.toFixed(1)} km
          </Typography>
          <Typography variant="body2">
            <strong>Durée:</strong> {Math.round(routeInfo.duration)} min
          </Typography>
        </Box>
      )}

      {driverPosition && (
        <Fab
          color="secondary"
          aria-label="recentrer sur la position du chauffeur"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            boxShadow: 3
          }}
          onClick={handleRecenterOnDriver}
        >
          <MyLocationIcon />
        </Fab>
      )}
    </Box>
  );
};

export default RouteMap;