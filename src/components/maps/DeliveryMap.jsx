// src/components/maps/DeliveryMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NavigationIcon from '@mui/icons-material/Navigation';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { geocodeAddress, calculateRoute } from '../../utils/geocoding';
import { isMobileDevice, isIOS, openNavigation } from '../../utils/navigationUtils';
import { createColoredRouteSegments } from '../../utils/mapUtils';

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
        width:34px;
        height:34px;
        border-radius:17px;
        border:3px solid ${borderColor};
        background:${background};
        color:${textColor};
        font-size:14px;
        font-weight:700;
        display:flex;
        align-items:center;
        justify-content:center;
        ${halo}
      ">
        ${safeLabel}
      </div>
      <div style="
        width:0;
        height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:10px solid ${borderColor};
        margin:0 auto;
        transform:translateY(-2px);
      "></div>
    `,
    iconSize: [34, 40],
    iconAnchor: [17, 36],
    popupAnchor: [0, -34]
  });
};

// Composant pour suivre la position de l'utilisateur
const LocationMarker = ({ onLocationUpdate, onPositionChange }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());

      const coords = [e.latlng.lat, e.latlng.lng];

      if (onLocationUpdate) {
        onLocationUpdate(coords);
      }

      if (onPositionChange) {
        onPositionChange(coords);
      }
    },
  });

  useEffect(() => {
    map.locate({ setView: true });

    // Mettre à jour la position régulièrement
    const interval = setInterval(() => {
      map.locate();
    }, 30000); // toutes les 30 secondes

    return () => clearInterval(interval);
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={driverIcon}>
      <Popup>
        <Typography variant="subtitle2">Votre position</Typography>
        <Typography variant="caption">Chauffeur</Typography>
      </Popup>
    </Marker>
  );
};

// Composant pour recentrer la carte sur la position du chauffeur
const RecenterControl = ({ driverPosition }) => {
  const map = useMap();

  useEffect(() => {
    // Exposer la fonction de recentrage
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

const DeliveryMap = ({
  route,
  onStatusUpdate,
  onLocationUpdate,
  loading = false
}) => {
  const [center, setCenter] = useState([48.8566, 2.3522]); // Paris par défaut
  const [zoom, setZoom] = useState(13);
  const [routePoints, setRoutePoints] = useState([]);
  const [driverPosition, setDriverPosition] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState(null); // Itinéraire calculé
  const [routeInfo, setRouteInfo] = useState(null); // Distance et durée
  const [routeSegments, setRouteSegments] = useState([]); // Segments colorés pour l'itinéraire calculé
  const [fallbackSegments, setFallbackSegments] = useState([]); // Segments colorés pour ligne directe
  const [mapInstance, setMapInstance] = useState(null);
  const [nextStopIndex, setNextStopIndex] = useState(-1);

  useEffect(() => {
    if (!route || !route.deliveryPoints) {
      return;
    }

    const loadPointsWithGeocode = async () => {
      setGeocoding(true);
      const points = [];

      for (const point of route.deliveryPoints) {
        let position = null;

        // Vérifier si les coordonnées existent déjà
        if (point.address && point.address.latitude && point.address.longitude) {
          position = [point.address.latitude, point.address.longitude];
        }
        // Sinon, géocoder l'adresse
        else if (point.address && point.address.street && point.address.city) {
          position = await geocodeAddress(point.address);

          // Petite pause pour respecter les limites d'API (1 req/sec)
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
        const orderA = typeof a.sequenceOrder === 'number' ? a.sequenceOrder : Number.MAX_SAFE_INTEGER;
        const orderB = typeof b.sequenceOrder === 'number' ? b.sequenceOrder : Number.MAX_SAFE_INTEGER;
        if (orderA === orderB) {
          const nameA = a.clientName || '';
          const nameB = b.clientName || '';
          return nameA.localeCompare(nameB);
        }
        return orderA - orderB;
      });

      const firstPendingIndex = points.findIndex((p) => p.status !== 'COMPLETED' && p.status !== 'FAILED');
      setNextStopIndex(firstPendingIndex === -1 ? (points.length ? points.length - 1 : -1) : firstPendingIndex);

      setRoutePoints(points);
      setGeocoding(false);

      // Calculer l'itinéraire routier entre tous les points
      if (points.length > 1) {
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
      }

      // Créer les segments colorés pour la ligne de secours (directe)
      const fallbackPositions = points.map(p => p.position);
      const fallbackSegs = createColoredRouteSegments(fallbackPositions);
      setFallbackSegments(fallbackSegs);

      // Calculer le centre et le zoom de la carte
      if (points.length > 0) {
        // Calculer les limites des points
        const latitudes = points.map(p => p.position[0]);
        const longitudes = points.map(p => p.position[1]);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        // Calculer le centre
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
      }
    };

    loadPointsWithGeocode();
  }, [route]);

  // Recalculer l'itinéraire quand la position du chauffeur change
  useEffect(() => {
    const calculateRouteWithDriver = async () => {
      if (driverPosition && routePoints.length > 0) {
        const allCoordinates = [driverPosition, ...routePoints.map(p => p.position)];
        const routeResult = await calculateRoute(allCoordinates);

        if (routeResult) {
          setRouteGeometry(routeResult.coordinates);
          setRouteInfo({
            distance: routeResult.distance,
            duration: routeResult.duration
          });

          // Créer les segments colorés pour l'itinéraire calculé avec le chauffeur
          const segments = createColoredRouteSegments(routeResult.coordinates);
          setRouteSegments(segments);
        }

        // Mettre à jour aussi les segments de secours
        const fallbackPositions = [driverPosition, ...routePoints.map(p => p.position)];
        const fallbackSegs = createColoredRouteSegments(fallbackPositions);
        setFallbackSegments(fallbackSegs);
      }
    };

    calculateRouteWithDriver();
  }, [driverPosition, routePoints]);

  // Si pas de route, afficher un message
  if (!route || !route.deliveryPoints || route.deliveryPoints.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Aucune tournée active</Typography>
      </Box>
    );
  }

  // Fonction pour gérer la mise à jour de la position du chauffeur
  const handleDriverPositionChange = (coords) => {
    setDriverPosition(coords);
  };

  // Fonction pour mettre à jour le statut d'un point de livraison
  const handleStatusUpdate = (pointId, newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(pointId, newStatus);
    }
  };

  const nextStop = (nextStopIndex >= 0 && nextStopIndex < routePoints.length)
    ? routePoints[nextStopIndex]
    : null;


  // Fonction pour recentrer sur la position du chauffeur
  const handleRecenterOnDriver = () => {
    if (driverPosition && mapInstance) {
      mapInstance.flyTo(driverPosition, 15, {
        duration: 1
      });
    }
  };

  const getSegmentVisualProps = (segmentIndex, totalSegments) => {
    if (totalSegments <= 0) {
      return { opacity: 0.8, weight: 5 };
    }

    const normalizedSegment = totalSegments === 1 ? 0 : segmentIndex / (totalSegments - 1);
    const totalStops = routePoints.length > 1 ? routePoints.length - 1 : 1;
    const progressRatio = nextStopIndex < 0 ? 1 : Math.min(nextStopIndex / totalStops, 1);

    if (normalizedSegment < progressRatio - 0.05) {
      return { opacity: 0.25, weight: 3 };
    }

    if (Math.abs(normalizedSegment - progressRatio) <= 0.05) {
      return { opacity: 1, weight: 6 };
    }

    return { opacity: 0.6, weight: 4 };
  };

  // Actions du Speed Dial pour la navigation
  const isMobile = isMobileDevice();
  const navigationActions = [
    {
      icon: <MapIcon />,
      name: 'Google Maps',
      onClick: () => openNavigation('google', routePoints, driverPosition)
    }
  ];

  // Ajouter Waze uniquement sur mobile
  if (isMobile) {
    navigationActions.push({
      icon: <NavigationIcon />,
      name: 'Waze',
      onClick: () => openNavigation('waze', routePoints, driverPosition)
    });
  }

  // Ajouter Apple Plans uniquement sur iOS
  if (isIOS()) {
    navigationActions.push({
      icon: <MapIcon />,
      name: 'Apple Plans',
      onClick: () => openNavigation('apple', routePoints, driverPosition)
    });
  }

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
            {routeSegments.map((segment, index) => {
              const style = getSegmentVisualProps(segment.index ?? index, routeSegments.length);
              return (
                <Polyline
                  key={`route-segment-${index}`}
                  positions={segment.positions}
                  color={segment.color}
                  weight={style.weight}
                  opacity={style.opacity}
                  lineJoin="round"
                />
              );
            })}
          </>
        )}

        {/* Si pas d'itinéraire calculé, afficher ligne droite de secours avec segments colorés */}
        {!routeGeometry && routePoints.length > 1 && fallbackSegments.length > 0 && (
          <>
            {fallbackSegments.map((segment, index) => {
              const style = getSegmentVisualProps(segment.index ?? index, fallbackSegments.length);
              return (
                <Polyline
                  key={`fallback-segment-${index}`}
                  positions={segment.positions}
                  color={segment.color}
                  weight={Math.max(style.weight - 1, 2)}
                  opacity={style.opacity}
                  dashArray="5, 10"
                />
              );
            })}
          </>
        )}

        {/* Marqueur de localisation du chauffeur */}
        <LocationMarker
          onLocationUpdate={onLocationUpdate}
          onPositionChange={handleDriverPositionChange}
        />

        {/* Afficher les infos de l'itinéraire */}
        {routeInfo && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'white',
              p: 1.5,
              borderRadius: 1,
              boxShadow: 2,
              zIndex: 1000
            }}
          >
            <Typography variant="caption" display="block">
              <strong>Distance:</strong> {routeInfo.distance} km
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Durée estimée:</strong> {routeInfo.duration} min
            </Typography>
          </Box>
        )}

        {nextStop && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'white',
              p: 1.5,
              borderRadius: 1,
              boxShadow: 2,
              zIndex: 1000,
              minWidth: 180
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Prochain arrêt
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              #{nextStopIndex + 1} - {nextStop.clientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {nextStop.address}
            </Typography>
          </Box>
        )}

        {/* Points de livraison */}
        {routePoints.map((point, index) => {
          const isNextStopMarker = nextStopIndex === index;
          const markerIcon = createNumberedIcon(index + 1, point.status, isNextStopMarker);

          return (
            <Marker
              key={point.id}
              position={point.position}
              icon={markerIcon}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    #{index + 1} - {point.clientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {point.address}
                  </Typography>

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
                    {isNextStopMarker && (
                      <Chip
                        size="small"
                        label="Prochain arrêt"
                        color="info"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>

                  {point.time && (
                    <Typography variant="body2">
                      <strong>Heure prévue:</strong> {new Date(point.time).toLocaleTimeString()}
                    </Typography>
                  )}

                  {point.phone && (
                    <Typography variant="body2">
                      <strong>Tel:</strong> {point.phone}
                    </Typography>
                  )}

                  {point.notes && (
                    <Typography variant="body2">
                      <strong>Notes:</strong> {point.notes}
                    </Typography>
                  )}

                  {/* Boutons d'action pour mettre à jour le statut */}
                  {point.status !== 'COMPLETED' && point.status !== 'FAILED' && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleStatusUpdate(point.id, 'COMPLETED')}
                        disabled={loading}
                      >
                        Livré
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleStatusUpdate(point.id, 'FAILED')}
                        disabled={loading}
                      >
                        Échec
                      </Button>
                    </Box>
                  )}

                  {/* Bouton pour ouvrir Google Maps */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      fullWidth
                      variant="outlined"
                      color="primary"
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
          );
        })}
      </MapContainer>

      {/* Overlay pour l'indicateur de chargement ou géocodage */}
      {(loading || geocoding) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <CircularProgress />
          {geocoding && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Géocodage des adresses en cours...
            </Typography>
          )}
        </Box>
      )}

      {/* Speed Dial pour la navigation externe */}
      {routePoints.length > 0 && (
        <SpeedDial
          ariaLabel="Navigation externe"
          sx={{ position: 'absolute', bottom: 80, right: 16 }}
          icon={<SpeedDialIcon icon={<DirectionsIcon />} />}
          FabProps={{
            size: 'medium',
            color: 'primary',
            sx: { boxShadow: 3 }
          }}
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

      {/* Bouton pour recentrer sur la position du chauffeur */}
      {driverPosition && (
        <Fab
          color="secondary"
          aria-label="recentrer sur ma position"
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

export default DeliveryMap;