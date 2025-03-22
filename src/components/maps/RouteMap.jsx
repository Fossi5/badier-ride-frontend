// src/components/maps/RouteMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip } from '@mui/material';

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

const RouteMap = ({ route }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [center, setCenter] = useState([48.8566, 2.3522]); // Paris par défaut
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (!route) return;

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
    }
  }, [route]);

  // Si pas de route, afficher un message
  if (!route || !route.deliveryPoints || route.deliveryPoints.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Aucune donnée de route à afficher</Typography>
      </Box>
    );
  }

  // Créer un polygone pour relier les points dans l'ordre
  const polylinePositions = routePoints.map(point => point.position);
  if (driverPosition) {
    polylinePositions.unshift(driverPosition); // Ajouter le chauffeur au début
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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
                  <strong>Tel:</strong> {point.phone}
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

      {/* Polyline pour connecter les points */}
      <Polyline 
        positions={polylinePositions} 
        color="blue" 
        weight={3} 
        opacity={0.7} 
        dashArray="10, 5"
      />
    </MapContainer>
  );
};

export default RouteMap;