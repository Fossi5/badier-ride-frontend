// src/components/dashboard/SummaryWidget.jsx
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';

/**
 * Composant pour afficher un widget récapitulatif avec plusieurs métriques
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Titre du widget
 * @param {Array} props.metrics - Liste des métriques à afficher
 * @param {boolean} props.loading - Indicateur de chargement
 * @param {Object} props.sx - Style supplémentaire à appliquer au widget
 */
const SummaryWidget = ({
  title,
  metrics = [],
  loading = false,
  sx = {}
}) => {
  return (
    <Paper sx={{ p: 2, height: '100%', ...sx }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={metric.color || 'inherit'}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
                {metric.status && (
                  <Chip 
                    label={metric.status} 
                    color={metric.statusColor || 'default'} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default SummaryWidget;