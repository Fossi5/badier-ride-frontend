// src/pages/admin/components/DriverTable.jsx
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

/**
 * Tableau paginé des chauffeurs avec actions édition/suppression.
 * Props :
 *   drivers        - tableau des chauffeurs
 *   loading        - booléen d'état de chargement
 *   onEdit         - (driverId) => void
 *   onDelete       - (driver) => void
 *   page           - page courante (0-indexé)
 *   rowsPerPage    - nombre de lignes par page
 *   totalElements  - nombre total d'éléments (côté serveur)
 *   onPageChange   - (event, newPage) => void
 *   onRowsPerPageChange - (event) => void
 */
const DriverTable = ({
  drivers = [],
  loading,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  totalElements = 0,
  onPageChange,
  onRowsPerPageChange
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table stickyHeader aria-label="table des chauffeurs">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom d'utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Type de véhicule</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                  <TableRow key={driver.id} hover>
                    <TableCell>{driver.id}</TableCell>
                    <TableCell>{driver.username}</TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.phoneNumber || '-'}</TableCell>
                    <TableCell>{driver.vehicleType || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={driver.isAvailable ? 'Disponible' : 'Indisponible'}
                        color={driver.isAvailable ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => onEdit(driver.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => onDelete(driver)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun chauffeur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={totalElements}
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

export default DriverTable;
