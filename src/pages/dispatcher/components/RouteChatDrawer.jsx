import { Drawer, Paper, Box, Typography } from '@mui/material';
import RouteChat from '../../../components/common/RouteChat';

export default function RouteChatDrawer({ chatRoute, onClose, readOnly }) {
  return (
    <Drawer anchor="right" open={!!chatRoute} onClose={onClose}>
      <Paper sx={{ width: 380, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Messages — {chatRoute?.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            Chauffeur : {chatRoute?.driver?.username}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {chatRoute && (
            <RouteChat routeId={chatRoute.id} routeStatus={chatRoute.status} readOnly={readOnly} />
          )}
        </Box>
      </Paper>
    </Drawer>
  );
}
