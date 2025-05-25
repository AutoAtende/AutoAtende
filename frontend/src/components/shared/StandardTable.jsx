import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
  Skeleton,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Checkbox,
  useMediaQuery
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 'calc(100vh - 300px)',
  overflow: 'auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
  '& .MuiTable-root': {
    minWidth: 650,
    [theme.breakpoints.down('md')]: {
      minWidth: 'auto'
    }
  }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.light,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.primary.contrastText,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    '&:first-of-type': {
      paddingLeft: theme.spacing(2)
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(2)
    }
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer'
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.selected
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:first-of-type': {
      paddingLeft: theme.spacing(2)
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(2)
    }
  }
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8),
  textAlign: 'center',
  minHeight: '300px'
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2)
}));

// Componente de Estado Vazio Customizável
const EmptyState = ({ icon, title, description, action }) => (
  <EmptyStateContainer>
    {icon && (
      <Box sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}>
        {icon}
      </Box>
    )}
    <Typography variant="h6" color="textSecondary" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="textSecondary" paragraph>
        {description}
      </Typography>
    )}
    {action && action}
  </EmptyStateContainer>
);

// Componente de Loading Skeleton
const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <LoadingContainer>
    {[...Array(rows)].map((_, rowIndex) => (
      <Box key={rowIndex} display="flex" alignItems="center" mb={2}>
        {[...Array(columns)].map((_, colIndex) => (
          <Box key={colIndex} flex={1} mr={colIndex < columns - 1 ? 2 : 0}>
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        ))}
      </Box>
    ))}
  </LoadingContainer>
);

// Menu de Ações
const ActionsMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  actions = [], 
  selectedItem 
}) => (
  <Menu
    anchorEl={anchorEl}
    keepMounted
    open={open}
    onClose={onClose}
    PaperProps={{
      elevation: 3,
      sx: {
        minWidth: 180,
        '& .MuiMenuItem-root': {
          py: 1,
          px: 2
        }
      }
    }}
  >
    {actions.map((action, index) => (
      <React.Fragment key={index}>
        {action.divider && <Divider />}
        <MenuItem
          onClick={() => {
            action.onClick(selectedItem);
            onClose();
          }}
          disabled={action.disabled}
          sx={{
            color: action.color || 'inherit',
            '&:hover': {
              backgroundColor: action.color === 'error' 
                ? 'error.light' 
                : 'action.hover'
            }
          }}
        >
          {action.icon && (
            <ListItemIcon sx={{ color: 'inherit' }}>
              {action.icon}
            </ListItemIcon>
          )}
          <ListItemText 
            primary={action.label}
            primaryTypographyProps={{
              fontWeight: action.primary ? 600 : 400
            }}
          />
        </MenuItem>
      </React.Fragment>
    ))}
  </Menu>
);

// Componente Principal da Tabela
const StandardTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState,
  pagination = true,
  selectable = false,
  actions = [],
  onRowClick,
  onSelectionChange,
  initialRowsPerPage = 10,
  stickyHeader = true,
  dense = false,
  hover = true,
  showRowNumbers = false,
  customRowRenderer,
  tableProps = {},
  containerProps = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [selected, setSelected] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Handlers de Paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handlers de Seleção
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = paginatedData.map((item, index) => index);
      setSelected(newSelected);
      onSelectionChange?.(paginatedData);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleRowSelect = (event, index) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(index);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, index);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
    onSelectionChange?.(
      newSelected.map(idx => paginatedData[idx])
    );
  };

  // Handler do Menu de Ações
  const handleOpenActionsMenu = (event, item) => {
    event.stopPropagation();
    setSelectedItem(item);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleCloseActionsMenu = () => {
    setActionMenuAnchor(null);
    setSelectedItem(null);
  };

  // Cálculo da paginação
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = pagination ? data.slice(startIndex, endIndex) : data;

  // Verificações de seleção
  const numSelected = selected.length;
  const numRows = paginatedData.length;
  const isAllSelected = numRows > 0 && numSelected === numRows;
  const isIndeterminate = numSelected > 0 && numSelected < numRows;

  // Renderização de Loading
  if (loading && data.length === 0) {
    return (
      <Paper {...containerProps}>
        <TableSkeleton rows={rowsPerPage} columns={columns.length} />
      </Paper>
    );
  }

  // Renderização de Estado Vazio
  if (data.length === 0 && !loading) {
    return (
      <Paper {...containerProps}>
        {emptyState || (
          <EmptyState
            title="Nenhum registro encontrado"
            description="Não há dados para exibir no momento."
          />
        )}
      </Paper>
    );
  }

  return (
    <Box>
      <StyledTableContainer component={Paper} {...containerProps}>
        <Table 
          stickyHeader={stickyHeader}
          size={dense ? 'small' : 'medium'}
          {...tableProps}
        >
          <StyledTableHead>
            <TableRow>
              {/* Checkbox de Seleção */}
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'selecionar todos os itens'
                    }}
                  />
                </TableCell>
              )}

              {/* Numeração de Linhas */}
              {showRowNumbers && (
                <TableCell width={60}>#</TableCell>
              )}

              {/* Colunas */}
              {columns.map((column, index) => (
                <TableCell
                  key={column.id || index}
                  align={column.align || 'left'}
                  style={{ 
                    width: column.width,
                    minWidth: column.minWidth 
                  }}
                  sortDirection={false}
                >
                  {column.label}
                </TableCell>
              ))}

              {/* Coluna de Ações */}
              {actions.length > 0 && (
                <TableCell align="right" width={60}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {paginatedData.map((item, index) => {
              const isItemSelected = selected.indexOf(index) !== -1;
              const actualIndex = startIndex + index;

              return (
                <StyledTableRow
                  key={item.id || index}
                  hover={hover}
                  selected={isItemSelected}
                  onClick={() => onRowClick?.(item, actualIndex)}
                  role={selectable ? "checkbox" : undefined}
                  aria-checked={selectable ? isItemSelected : undefined}
                  tabIndex={-1}
                >
                  {/* Checkbox de Seleção */}
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={(event) => handleRowSelect(event, index)}
                        inputProps={{
                          'aria-labelledby': `table-checkbox-${index}`
                        }}
                      />
                    </TableCell>
                  )}

                  {/* Numeração de Linhas */}
                  {showRowNumbers && (
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {actualIndex + 1}
                      </Typography>
                    </TableCell>
                  )}

                  {/* Renderização Customizada ou Padrão */}
                  {customRowRenderer ? (
                    customRowRenderer(item, index, columns)
                  ) : (
                    columns.map((column, colIndex) => (
                      <TableCell
                        key={column.id || colIndex}
                        align={column.align || 'left'}
                      >
                        {column.render 
                          ? column.render(item, index)
                          : item[column.field] || '-'
                        }
                      </TableCell>
                    ))
                  )}

                  {/* Menu de Ações */}
                  {actions.length > 0 && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenActionsMenu(event, item)}
                        color="primary"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Paginação */}
      {pagination && data.length > 0 && (
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: '0',
            },
          }}
        />
      )}

      {/* Menu de Ações */}
      <ActionsMenu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionsMenu}
        actions={actions}
        selectedItem={selectedItem}
      />
    </Box>
  );
};

StandardTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      field: PropTypes.string,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyState: PropTypes.node,
  pagination: PropTypes.bool,
  selectable: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      color: PropTypes.string,
      divider: PropTypes.bool,
      primary: PropTypes.bool
    })
  ),
  onRowClick: PropTypes.func,
  onSelectionChange: PropTypes.func,
  initialRowsPerPage: PropTypes.number,
  stickyHeader: PropTypes.bool,
  dense: PropTypes.bool,
  hover: PropTypes.bool,
  showRowNumbers: PropTypes.bool,
  customRowRenderer: PropTypes.func,
  tableProps: PropTypes.object,
  containerProps: PropTypes.object
};

export default StandardTable;