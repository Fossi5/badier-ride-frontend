import {
  Grid, Card, CardContent, Typography, Box, Avatar, Button
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  DirectionsCar as DriverIcon,
  Timeline as RouteIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DispatcherStatsCards({
  profile, todayRoutes, activeRoutes, plannedRoutes,
  pendingDeliveries, allAvailableDrivers, onCreateRoute
}) {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Répartiteur</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="h6">{profile?.username || 'Utilisateur'}</Typography>
                <Typography variant="body2" color="textSecondary">{profile?.department || 'Département'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Tournées</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}><RouteIcon /></Avatar>
              <Typography variant="h5">{todayRoutes.length}</Typography>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">Actives: {activeRoutes.length}</Typography>
              <Typography variant="body2" color="textSecondary">Planifiées: {plannedRoutes.length}</Typography>
            </Box>
            <Button variant="outlined" size="small" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/dispatcher/routes')}>
              Voir toutes
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Points de livraison</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}><LocationIcon /></Avatar>
              <Typography variant="h5">{pendingDeliveries.length}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">En attente d'assignation</Typography>
            </Box>
            <Button variant="outlined" size="small" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/dispatcher/delivery-points')}>
              Gérer
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Chauffeurs disponibles</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}><DriverIcon /></Avatar>
              <Typography variant="h5">{allAvailableDrivers.length}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">Prêts pour assignation</Typography>
            </Box>
            <Button variant="contained" size="small" fullWidth startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={onCreateRoute}>
              Nouvelle tournée
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
