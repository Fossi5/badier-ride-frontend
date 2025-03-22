// src/components/maps/DeliveryMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip, Button, CircularProgress } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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

// Composant pour suivre la position de l'utilisateur
const LocationMarker = ({ onLocationUpdate }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      
      if (onLocationUpdate) {
        onLocationUpdate([e.latlng.lat, e.latlng.lng]);
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
      <Popup>Vous êtes ici</Popup>
    </Marker>
  );
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

  useEffect(() => {
    if (!route || !route.deliveryPoints) return;

    // Préparer les points de livraison pour la carte
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

    setRoutePoints(points);

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
  }, [route]);

  // Si pas de route, afficher un message
  if (!route || !route.deliveryPoints || route.deliveryPoints.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Aucune tournée active</Typography>
      </Box>
    );
  }

  // Créer un polygone pour relier les points dans l'ordre
  const polylinePositions = routePoints.map(point => point.position);

  // Fonction pour mettre à jour le statut d'un point de livraison
  const handleStatusUpdate = (pointId, newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(pointId, newStatus);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marqueur de localisation du chauffeur */}
        <LocationMarker onLocationUpdate={onLocationUpdate} />

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
        ))}

        {/* Polyline pour connecter les points */}
        <Polyline 
          positions={polylinePositions} 
          color="blue" 
          weight={3} 
          opacity={0.7} 
          dashArray="10, 5"
        />
      </MapContainer>
      
      {/* Overlay pour l'indicateur de chargement */}
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: 'rgba(255, 255, 255, 0.7)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000 
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default DeliveryMap;