// src/pages/dispatcher/RouteDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getRouteById,
  addDeliveryPointToRoute
} from '../../api/routes';
import { getAllDeliveryPoints } from '../../api/deliveryPoints';
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useAlert } from '../../context/AlertContext';

const RouteDetails = () => {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [availablePoints, setAvailablePoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState('');
  const { showAlert } = useAlert();

  const fetchRoute = async () => {
    try {
      const res = await getRouteById(id);
      setRoute(res.data);
    } catch {
      showAlert("Erreur lors du chargement de la route", "error");
    }
  };

  const fetchAvailablePoints = async () => {
    try {
      const res = await getAllDeliveryPoints();
      setAvailablePoints(res.data);
    } catch {
      showAlert("Erreur lors du chargement des points", "error");
    }
  };

  const handleAddPoint = async () => {
    try {
      await addDeliveryPointToRoute(route.id, selectedPoint);
      showAlert("Point ajouté avec succès", "success");
      fetchRoute(); // refresh
    } catch {
      showAlert("Erreur lors de l'ajout", "error");
    }
  };

  useEffect(() => {
    fetchRoute();
    fetchAvailablePoints();
  }, []);

  if (!route) return <Typography>Chargement...</Typography>;

  return (
    <Box className="container mt-4">
      <Typography variant="h5" gutterBottom>Route #{route.id}</Typography>

      <Typography variant="h6">Points de livraison actuels :</Typography>
      <ul>
        {route.deliveryPoints?.map((point) => (
          <li key={point.id}>
            {point.name} - {point.address?.street}, {point.address?.city}
          </li>
        ))}
      </ul>

      <Box className="mt-4">
        <FormControl fullWidth>
          <InputLabel>Ajouter un point de livraison</InputLabel>
          <Select
            value={selectedPoint}
            onChange={(e) => setSelectedPoint(e.target.value)}
          >
            {availablePoints.map((point) => (
              <MenuItem key={point.id} value={point.id}>
                {point.name} - {point.address?.street}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          className="mt-2"
          variant="contained"
          onClick={handleAddPoint}
          disabled={!selectedPoint}
        >
          Ajouter à la route
        </Button>
      </Box>
    </Box>
  );
};

export default RouteDetails;
