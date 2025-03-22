// src/components/tables/DataTable.jsx
import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  CircularProgress,
  Checkbox,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';

/**
 * Composant générique pour afficher un tableau de données paginé
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.columns - Configuration des colonnes
 * @param {Array} props.data - Données à afficher
 * @param {boolean} props.loading - Indicateur de chargement
 * @param {string} props.emptyMessage - Message à afficher si aucune donnée
 * @param {Function} props.onRowClick - Fonction appelée au clic sur une ligne
 * @param {boolean} props.selectable - Permet la sélection de lignes
 * @param {Array} props.selectedRows - Tableau des ID des lignes sélectionnées
 * @param {Function} props.onSelectRows - Fonction appelée lorsque la sélection change
 * @param {string} props.idField - Nom du champ contenant l'ID (default: 'id')
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectRows,
  idField = 'id'
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Gestion du changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Gestion du changement de nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Gestion de la sélection d'une ligne
  const handleSelectRow = (id) => {
    if (!selectable || !onSelectRows) return;
    
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selectedRows, id];
    } else {
      newSelected = selectedRows.filter(rowId => rowId !== id);
    }
    
    onSelectRows(newSelected);
  };
  
  // Gestion de la sélection de toutes les lignes
  const handleSelectAllClick = (event) => {
    if (!selectable || !onSelectRows) return;
    
    if (event.target.checked) {
      const newSelected = data.map(row => row[idField]);
      onSelectRows(newSelected);
    } else {
      onSelectRows([]);
    }
  };
  
  // Vérifie si une ligne est sélectionnée
  const isSelected = (id) => selectedRows.indexOf(id) !== -1;
  
  // Préparation des données à afficher pour la page courante
  const displayData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Fonction pour rendre une cellule avec la bonne mise en forme
  const renderCell = (row, column) => {
    const { field, render, align = 'left' } = column;
    
    // Si une fonction de rendu personnalisée est fournie, l'utiliser
    if (render) {
      return render(row);
    }
    
    // Gestion des valeurs null ou undefined
    if (row[field] === null || row[field] === undefined) {
      return '-';
    }
    
    // Renvoyer la valeur brute
    return row[field];
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                )}
                
                {columns.map((column) => (
                  <TableCell 
                    key={column.field} 
                    align={column.align || 'left'}
                    style={column.width ? { width: column.width } : {}}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((row) => {
                const isRowSelected = selectable && isSelected(row[idField]);
                return (
                  <TableRow
                    hover
                    key={row[idField]}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    role={onRowClick ? 'button' : undefined}
                    selected={isRowSelected}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isRowSelected}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRow(row[idField]);
                          }}
                        />
                      </TableCell>
                    )}
                    
                    {columns.map((column) => (
                      <TableCell 
                        key={`${row[idField]}-${column.field}`} 
                        align={column.align || 'left'}
                      >
                        {renderCell(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              
              {displayData.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={selectable ? columns.length + 1 : columns.length} 
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />
    </Paper>
  );
};

export default DataTable;