// src/components/routes/RouteOrderingDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  IconButton,
  Chip,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  MyLocation as StartIcon,
  Flag as EndIcon,
  Room as LocationIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const RouteOrderingDialog = ({
  open,
  onClose,
  route,
  onSaveOrder,
  loading
}) => {
  // État pour stocker les points ordonnés
  const [orderedPoints, setOrderedPoints] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  
  // Initialiser la liste avec les points de livraison existants
  useEffect(() => {
    if (route && route.deliveryPoints) {
      // Copier les points de livraison avec les données nécessaires
      const points = route.deliveryPoints.map(point => ({
        ...point,
        // Si les propriétés n'existent pas, définir des valeurs par défaut
        sequenceOrder: point.sequenceOrder || 0,
        isStartPoint: point.isStartPoint || false,
        isEndPoint: point.isEndPoint || false
      }));
      
      // Trier par ordre de séquence
      const sorted = [...points].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      
      setOrderedPoints(sorted);
      
      // Trouver les points de départ et d'arrivée s'ils existent
      const start = sorted.find(p => p.isStartPoint);
      const end = sorted.find(p => p.isEndPoint);
      
      setStartPoint(start || null);
      setEndPoint(end || null);
    }
  }, [route]);
  
  // Définir un point comme point de départ
  const setAsStartPoint = (point) => {
    // Si c'est déjà le point de départ, le désélectionner
    if (startPoint && startPoint.id === point.id) {
      setStartPoint(null);
      const newPoints = [...orderedPoints];
      const index = newPoints.findIndex(p => p.id === point.id);
      if (index !== -1) {
        newPoints[index] = { ...newPoints[index], isStartPoint: false };
        setOrderedPoints(newPoints);
      }
      return;
    }
    
    // Mettre à jour les points ordonnés
    const newPoints = orderedPoints.map(p => ({
      ...p,
      isStartPoint: p.id === point.id
    }));
    
    setOrderedPoints(newPoints);
    setStartPoint(point);
  };
  
  // Définir un point comme point d'arrivée
  const setAsEndPoint = (point) => {
    // Si c'est déjà le point d'arrivée, le désélectionner
    if (endPoint && endPoint.id === point.id) {
      setEndPoint(null);
      const newPoints = [...orderedPoints];
      const index = newPoints.findIndex(p => p.id === point.id);
      if (index !== -1) {
        newPoints[index] = { ...newPoints[index], isEndPoint: false };
        setOrderedPoints(newPoints);
      }
      return;
    }
    
    // Mettre à jour les points ordonnés
    const newPoints = orderedPoints.map(p => ({
      ...p,
      isEndPoint: p.id === point.id
    }));
    
    setOrderedPoints(newPoints);
    setEndPoint(point);
  };
  
  // Déplacer un point vers le haut
  const moveUp = (index) => {
    if (index === 0) return;
    
    const newOrderedPoints = [...orderedPoints];
    const temp = newOrderedPoints[index];
    newOrderedPoints[index] = newOrderedPoints[index - 1];
    newOrderedPoints[index - 1] = temp;
    
    // Mettre à jour l'ordre de séquence
    newOrderedPoints.forEach((point, i) => {
      point.sequenceOrder = i;
    });
    
    setOrderedPoints(newOrderedPoints);
  };
  
  // Déplacer un point vers le bas
  const moveDown = (index) => {
    if (index === orderedPoints.length - 1) return;
    
    const newOrderedPoints = [...orderedPoints];
    const temp = newOrderedPoints[index];
    newOrderedPoints[index] = newOrderedPoints[index + 1];
    newOrderedPoints[index + 1] = temp;
    
    // Mettre à jour l'ordre de séquence
    newOrderedPoints.forEach((point, i) => {
      point.sequenceOrder = i;
    });
    
    setOrderedPoints(newOrderedPoints);
  };
  
  // Réinitialiser l'ordre
  const resetOrder = () => {
    if (route && route.deliveryPoints) {
      const points = route.deliveryPoints.map((point, index) => ({
        ...point,
        sequenceOrder: index,
        isStartPoint: false,
        isEndPoint: false
      }));
      
      setOrderedPoints(points);
      setStartPoint(null);
      setEndPoint(null);
    }
  };
  
  // Préparation des données pour la soumission
  const prepareDataForSubmission = () => {
    return orderedPoints.map(point => ({
      id: point.id,
      sequenceOrder: point.sequenceOrder,
      isStartPoint: point.isStartPoint || false,
      isEndPoint: point.isEndPoint || false
    }));
  };
  
  // Gérer la soumission
  const handleSave = () => {
    const data = prepareDataForSubmission();
    onSaveOrder(data);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Organiser l'ordre de passage - {route?.name}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={resetOrder}
            disabled={loading}
          >
            Réinitialiser
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="textSecondary" paragraph>
          Réorganisez les points en utilisant les flèches haut/bas pour définir l'ordre de passage.
          Définissez un point de départ et un point d'arrivée en cliquant sur les icônes correspondantes.
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Point de départ:
                </Typography>
                {startPoint ? (
                  <Chip 
                    icon={<StartIcon />}
                    label={`${startPoint.clientName || 'Client'} - ${startPoint.address?.city || ''}`}
                    color="primary"
                    onDelete={() => setAsStartPoint(startPoint)}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun point de départ défini
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Point d'arrivée:
                </Typography>
                {endPoint ? (
                  <Chip 
                    icon={<EndIcon />}
                    label={`${endPoint.clientName || 'Client'} - ${endPoint.address?.city || ''}`}
                    color="secondary"
                    onDelete={() => setAsEndPoint(endPoint)}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun point d'arrivée défini
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {orderedPoints.map((point, index) => (
            <React.Fragment key={point.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      onClick={() => moveUp(index)}
                      disabled={index === 0 || loading}
                      size="small"
                    >
                      <MoveUpIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => moveDown(index)}
                      disabled={index === orderedPoints.length - 1 || loading}
                      size="small"
                    >
                      <MoveDownIcon />
                    </IconButton>
                  </Box>
                }
                sx={{ 
                  bgcolor: 
                    (point.isStartPoint) ? 'primary.light' : 
                    (point.isEndPoint) ? 'secondary.light' : 
                    'inherit' 
                }}
              >
                <ListItemIcon>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', width: 24 }}>
                    {index + 1}.
                  </Typography>
                </ListItemIcon>
                <ListItemText
                  primary={point.clientName || 'Client'}
                  secondary={
                    point.address
                      ? `${point.address.street}, ${point.address.postalCode} ${point.address.city}`
                      : 'Adresse inconnue'
                  }
                />
                <Box sx={{ display: 'flex', gap: 1, mr: 10 }}>
                  <IconButton 
                    size="small" 
                    color={point.isStartPoint ? "primary" : "default"}
                    onClick={() => setAsStartPoint(point)}
                    disabled={loading}
                    title="Définir comme point de départ"
                  >
                    <StartIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color={point.isEndPoint ? "secondary" : "default"}
                    onClick={() => setAsEndPoint(point)}
                    disabled={loading}
                    title="Définir comme point d'arrivée"
                  >
                    <EndIcon />
                  </IconButton>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
          
          {orderedPoints.length === 0 && (
            <ListItem>
              <ListItemText
                primary="Aucun point de livraison disponible"
                secondary="Ajoutez des points de livraison à cette tournée pour définir l'ordre de passage"
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={orderedPoints.length === 0 || loading}
        >
          Enregistrer l'ordre
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RouteOrderingDialog;