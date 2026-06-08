// src/pages/dispatcher/components/RouteTable.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Route as RouteIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const RouteTable = ({
  routes,
  loading,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onOptimize,
  onUpdateStatus,
  canEditRoute
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : routes.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Aucune tournée disponible</Typography>
          </Box>
        ) : (
          <Table stickyHeader aria-label="table des tournées">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Chauffeur</TableCell>
                <TableCell>Répartiteur</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => (
                  <TableRow key={route.id} hover>
                    <TableCell>{route.id}</TableCell>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.driver?.username || 'Non assigné'}</TableCell>
                    <TableCell>{route.dispatcher?.username || 'Non assigné'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={route.status}
                        color={
                          route.status === 'COMPLETED' ? 'success' :
                            route.status === 'IN_PROGRESS' ? 'primary' :
                              route.status === 'CANCELLED' ? 'error' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{route.deliveryPoints?.length || 0}</TableCell>
                    <TableCell>
                      {route.startTime ? format(new Date(route.startTime), 'dd/MM/yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Modifier">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onEdit(route)}
                              disabled={!canEditRoute(route)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Supprimer">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onDelete(route)}
                              disabled={!canEditRoute(route) || route.status === 'IN_PROGRESS'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Optimiser">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onOptimize(route.id)}
                              disabled={route.status === 'COMPLETED' || route.status === 'CANCELLED'}
                            >
                              <MapIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canEditRoute(route) && route.status === 'PLANNED' && (
                          <Tooltip title="Démarrer">
                            <IconButton
                              size="small"
                              onClick={() => onUpdateStatus(route.id, 'IN_PROGRESS')}
                              color="primary"
                            >
                              <RouteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canEditRoute(route) && route.status === 'IN_PROGRESS' && (
                          <Tooltip title="Terminer">
                            <IconButton
                              size="small"
                              onClick={() => onUpdateStatus(route.id, 'COMPLETED')}
                              color="success"
                            >
                              <RouteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={totalElements ?? routes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />
    </Paper>
  );
};

export default RouteTable;
