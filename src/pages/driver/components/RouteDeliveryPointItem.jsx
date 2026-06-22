import {
  ListItem, ListItemText, ListItemAvatar, Avatar,
  Box, Typography, IconButton, Tooltip, Button
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  PhotoCamera as PhotoCameraIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import StatusChip from '../../../components/common/StatusChip';

const STATUS_COLORS = {
  COMPLETED: 'success.main',
  IN_PROGRESS: 'warning.main',
  FAILED: 'error.main',
};

const formatAddress = (address) => {
  if (!address) return 'Adresse inconnue';
  const { street, city, postalCode, country } = address;
  return `${street}, ${postalCode} ${city}, ${country || ''}`.trim();
};

export default function RouteDeliveryPointItem({ point, routeStatus, updating, onStatusUpdate, onInfoClick, onProofClick }) {
  return (
    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: STATUS_COLORS[point.deliveryStatus] || 'grey.400' }}>
            <LocationIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={point.clientName}
          secondary={
            <>
              <Typography variant="body2" component="span" display="block">
                {formatAddress(point.address)}
              </Typography>
              {point.clientPhoneNumber && (
                <Typography variant="body2" component="span" display="block">
                  <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  {point.clientPhoneNumber}
                </Typography>
              )}
            </>
          }
        />
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Infos client">
            <IconButton size="small" onClick={() => onInfoClick(point)}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {point.deliveryStatus === 'PENDING' && routeStatus === 'IN_PROGRESS' && (
            <Tooltip title="Marquer comme en cours">
              <IconButton edge="end" onClick={() => onStatusUpdate(point.id, 'IN_PROGRESS')} disabled={updating} color="warning">
                <LocationIcon />
              </IconButton>
            </Tooltip>
          )}

          {point.deliveryStatus === 'IN_PROGRESS' && (
            <>
              <Tooltip title="Marquer comme livré">
                <IconButton edge="end" onClick={() => onStatusUpdate(point.id, 'COMPLETED')} disabled={updating} color="success" sx={{ mr: 1 }}>
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Marquer comme échec">
                <IconButton edge="end" onClick={() => onStatusUpdate(point.id, 'FAILED')} disabled={updating} color="error">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          {(point.deliveryStatus === 'COMPLETED' || point.deliveryStatus === 'FAILED') && (
            <StatusChip status={point.deliveryStatus} type="delivery" />
          )}
        </Box>
      </Box>

      {point.deliveryStatus === 'COMPLETED' && !point.proofImagePath && !point.proofValidated && (
        <Box sx={{ pl: 7, mt: 0.5 }}>
          <Tooltip title="Photo / code de confirmation">
            <Button
              size="small"
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={() => onProofClick(point)}
            >
              Preuve de livraison
            </Button>
          </Tooltip>
        </Box>
      )}
    </ListItem>
  );
}
