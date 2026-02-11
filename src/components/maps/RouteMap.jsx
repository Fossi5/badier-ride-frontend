// src/components/maps/RouteMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip, Fab, CircularProgress } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { createColoredRouteSegments } from '../../utils/mapUtils';
import { calculateRoute } from '../../utils/geocoding';

// Correction des icônes Leaflet pour React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Icône personnalisée pour le chauffeur
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Icônes personnalisées pour les points de livraison selon leur statut
const deliveryIcons = {
  PENDING: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  IN_PROGRESS: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  COMPLETED: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  FAILED: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

// Composant pour recentrer la carte sur la position du chauffeur
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
  const [center, setCenter] = useState([48.8566, 2.3522]); // Paris par défaut
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
      // Récupérer la position du chauffeur si disponible
      if (route.driver && route.driver.latitude && route.driver.longitude) {
        setDriverPosition([route.driver.latitude, route.driver.longitude]);
      }

      // Préparer les points de livraison pour la carte
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
        
        // Calculer l'itinéraire routier entre tous les points
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

            // Créer les segments colorés pour l'itinéraire calculé
            const segments = createColoredRouteSegments(routeResult.coordinates);
            setRouteSegments(segments);
          }
          setCalculatingRoute(false);
        }

        // Créer les segments colorés pour la ligne de secours (directe)
        const fallbackPositions = points.map(p => p.position);
        const fallbackSegs = createColoredRouteSegments(fallbackPositions);
        setFallbackSegments(fallbackSegs);

        setRoutePoints(points);

        // Calculer le centre et le zoom de la carte
        if (points.length > 0) {
          // Calculer les limites des points
          const latitudes = points.map(p => p.position[0]);
          const longitudes = points.map(p => p.position[1]);

          // Ajouter la position du chauffeur si disponible
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

          // Calculer le zoom (basé sur l'étendue)
          const latRange = maxLat - minLat;
          const lngRange = maxLng - minLng;
          const range = Math.max(latRange, lngRange);

          let newZoom = 13; // zoom par défaut
          if (range > 0.2) newZoom = 10;
          if (range > 0.5) newZoom = 9;
          if (range > 1) newZoom = 8;
          if (range > 2) newZoom = 7;
          if (range > 5) newZoom = 6;

          setZoom(newZoom);

          // Créer les segments colorés pour visualiser l'ordre
          const polylinePositions = points.map(point => point.position);
          if (driverPosition) {
            polylinePositions.unshift(driverPosition); // Ajouter le chauffeur au début
          }

          const segments = createColoredRouteSegments(polylinePositions);
          setRouteSegments(segments);
        }
      }
    };

    initializeRoute();
  }, [route]);

  // Fonction pour recentrer sur la position du chauffeur
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

        {/* Contrôle pour recentrer sur le chauffeur */}
        <RecenterControl driverPosition={driverPosition} />

        {/* Tracer l'itinéraire routier calculé avec segments colorés */}
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

        {/* Si pas d'itinéraire calculé, afficher ligne droite de secours avec segments colorés */}
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

        {/* Position du chauffeur */}
        {driverPosition && (
          <Marker position={driverPosition} icon={driverIcon}>
            <Popup>
              <Typography variant="subtitle2">Chauffeur: {route.driver.username}</Typography>
              <Typography variant="body2">Position actuelle</Typography>
            </Popup>
          </Marker>
        )}

        {/* Points de livraison */}
        {routePoints.map((point, index) => (
          <Marker
            key={point.id}
            position={point.position}
            icon={deliveryIcons[point.status] || DefaultIcon}
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

      {/* Indicateur de chargement lors du calcul de l'itinéraire */}
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

      {/* Affichage des infos de l'itinéraire */}
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

      {/* Bouton pour recentrer sur la position du chauffeur */}
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