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
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Fade,
  Collapse
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components Mobile First - SEM altura fixa
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: '100%',
  // REMOVIDO: flex, overflow, height - deixa crescer naturalmente
  borderRadius: 12, // Mobile first: bordas mais arredondadas
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 12px rgba(0, 0, 0, 0.4)' 
    : '0 2px 12px rgba(0, 0, 0, 0.08)',
  [theme.breakpoints.up('sm')]: {
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiTable-root': {
    minWidth: 320, // Mobile first: menor largura mínima
    [theme.breakpoints.up('sm')]: {
      minWidth: 500,
    },
    [theme.breakpoints.up('md')]: {
      minWidth: 650,
    }
  }
}));

// CORRIGIDO: Cabeçalho SEM cor de fundo azul
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    // REMOVIDO: backgroundColor com cor primária
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: theme.palette.text.primary, // cor normal do texto
    borderBottom: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
    // Mobile first
    [theme.breakpoints.up('sm')]: {
      fontSize: '0.875rem',
      padding: theme.spacing(2),
    },
    '&:first-of-type': {
      paddingLeft: theme.spacing(1.5),
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(2),
      }
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(1.5),
      [theme.breakpoints.up('sm')]: {
        paddingRight: theme.spacing(2),
      }
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
    padding: theme.spacing(1.5),
    fontSize: '0.875rem',
    // Mobile first
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2),
      fontSize: '0.9rem',
    },
    '&:first-of-type': {
      paddingLeft: theme.spacing(1.5),
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(2),
      }
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(1.5),
      [theme.breakpoints.up('sm')]: {
        paddingRight: theme.spacing(2),
      }
    }
  }
}));

// Mobile Card Component para visualização em cards
const MobileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  borderRadius: 12,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
  '&:last-child': {
    marginBottom: 0
  }
}));

// CORRIGIDO: EmptyState SEM altura fixa
const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  width: '100%',
  // REMOVIDO: minHeight
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(6),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8),
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2)
}));

// Componente de Estado Vazio Melhorado - SEM altura fixa
const EmptyState = ({ icon, title, description, action }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  
  return (
    <Fade in timeout={500}>
      <EmptyStateContainer>
        {icon && (
          <Box sx={{ 
            fontSize: isXs ? 48 : 60, 
            color: 'text.secondary', 
            mb: 2 
          }}>
            {icon}
          </Box>
        )}
        <Typography 
          variant={isXs ? "subtitle1" : "h6"} 
          color="textSecondary" 
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
        {description && (
          <Typography 
            variant="body2" 
            color="textSecondary" 
            paragraph
            sx={{ 
              maxWidth: isXs ? 280 : 400,
              lineHeight: 1.6
            }}
          >
            {description}
          </Typography>
        )}
        {action && (
          <Box sx={{ mt: 2 }}>
            {action}
          </Box>
        )}
      </EmptyStateContainer>
    </Fade>
  );
};

// Componente de Loading Skeleton Melhorado
const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  
  return (
    <LoadingContainer>
      {[...Array(rows)].map((_, rowIndex) => (
        <Box key={rowIndex} display="flex" alignItems="center" mb={2}>
          {[...Array(columns)].map((_, colIndex) => (
            <Box key={colIndex} flex={1} mr={colIndex < columns - 1 ? 2 : 0}>
              <Skeleton 
                variant="text" 
                width="80%" 
                height={isXs ? 24 : 20}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>
      ))}
    </LoadingContainer>
  );
};

// CORRIGIDO: Ações individuais SEM MoreVert
const IndividualActions = ({ actions = [], item }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (!actions || actions.length === 0) return null;
  
  // No mobile, mostrar apenas as 2 primeiras ações
  // No desktop, mostrar todas as ações
  const visibleActions = isMobile ? actions.slice(0, 2) : actions;

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'flex-end',
      gap: 0.5 
    }}>
      {visibleActions.map((action, index) => (
        <Tooltip key={index} title={action.label} arrow placement="top">
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              action.onClick(item);
            }}
            disabled={action.disabled}
            sx={{
              color: action.color === 'error' 
                ? 'error.main' 
                : action.color === 'success'
                  ? 'success.main'
                  : action.color === 'primary'
                    ? 'primary.main'
                    : 'text.secondary',
              '&:hover': {
                backgroundColor: action.color === 'error' 
                  ? 'error.light' 
                  : action.color === 'success'
                    ? 'success.light'
                    : action.color === 'primary'
                      ? 'primary.light'
                      : 'action.hover',
                color: action.color === 'error' 
                  ? 'error.dark' 
                  : action.color === 'success'
                    ? 'success.dark'
                    : action.color === 'primary'
                      ? 'primary.dark'
                      : 'text.primary'
              }
            }}
          >
            {action.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

// Componente Mobile Card Row
const MobileCardRow = ({ 
  item, 
  columns, 
  actions, 
  selectable, 
  selected, 
  onSelect, 
  onRowClick,
  index,
  showRowNumbers,
  actualIndex
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Separar colunas primárias das secundárias
  const primaryColumns = columns.filter(col => col.primary !== false).slice(0, 2);
  const secondaryColumns = columns.filter(col => !primaryColumns.includes(col));
  
  return (
    <MobileCard>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header do Card */}
        <Box display="flex" alignItems="flex-start" mb={1}>
          {selectable && (
            <Checkbox
              color="primary"
              checked={selected}
              onChange={onSelect}
              size="small"
              sx={{ mt: -0.5, mr: 1 }}
            />
          )}
          
          <Box flex={1} onClick={() => onRowClick?.(item, actualIndex)}>
            {/* Colunas Primárias */}
            {primaryColumns.map((column, colIndex) => (
              <Typography
                key={colIndex}
                variant={colIndex === 0 ? "subtitle2" : "body2"}
                color={colIndex === 0 ? "text.primary" : "text.secondary"}
                sx={{ 
                  fontWeight: colIndex === 0 ? 600 : 400,
                  mb: colIndex === 0 ? 0.5 : 1,
                  display: 'block'
                }}
              >
                {column.render 
                  ? column.render(item, index)
                  : item[column.field] || '-'
                }
              </Typography>
            ))}
          </Box>
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            {showRowNumbers && (
              <Typography variant="caption" color="text.secondary">
                #{actualIndex + 1}
              </Typography>
            )}
            
            {secondaryColumns.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ p: 0.5 }}
              >
                {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </IconButton>
            )}
            
            {/* Ações individuais */}
            <IndividualActions actions={actions} item={item} />
          </Stack>
        </Box>
        
        {/* Colunas Secundárias (Colapsáveis) */}
        {secondaryColumns.length > 0 && (
          <Collapse in={expanded} timeout={300}>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Stack spacing={1.5}>
                {secondaryColumns.map((column, colIndex) => (
                  <Box key={colIndex} display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {column.label}:
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                      {column.render 
                        ? column.render(item, index)
                        : item[column.field] || '-'
                      }
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Collapse>
        )}
      </CardContent>
    </MobileCard>
  );
};

// Componente Principal da Tabela Melhorado - SEM altura fixa
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
  stickyHeader = false, // DESABILITADO por padrão
  dense = false,
  hover = true,
  showRowNumbers = false,
  customRowRenderer,
  tableProps = {},
  containerProps = {},
  mobileView = 'auto' // 'auto', 'table', 'cards'
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [selected, setSelected] = useState([]);

  // Determinar se deve usar visualização mobile
  const useMobileView = mobileView === 'cards' || (mobileView === 'auto' && isXs);

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
      <Paper {...containerProps} sx={{ borderRadius: isXs ? 3 : 1, ...containerProps.sx }}>
        <TableSkeleton rows={rowsPerPage} columns={columns.length} />
      </Paper>
    );
  }

  // Renderização de Estado Vazio
  if (data.length === 0 && !loading) {
    return (
      <Paper {...containerProps} sx={{ borderRadius: isXs ? 3 : 1, ...containerProps.sx }}>
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%'
      // REMOVIDO: height - deixa crescer naturalmente
    }}>
      {/* Visualização Mobile em Cards */}
      {useMobileView ? (
        <Box sx={{ flex: 1, px: 1 }}>
          {/* Header com seleção para mobile */}
          {selectable && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  color="primary"
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAllClick}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {numSelected > 0 ? `${numSelected} selecionado(s)` : 'Selecionar todos'}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Cards */}
          {paginatedData.map((item, index) => {
            const isItemSelected = selected.indexOf(index) !== -1;
            const actualIndex = startIndex + index;

            return (
              <MobileCardRow
                key={item.id || index}
                item={item}
                columns={columns}
                actions={actions}
                selectable={selectable}
                selected={isItemSelected}
                onSelect={(event) => handleRowSelect(event, index)}
                onRowClick={onRowClick}
                index={index}
                showRowNumbers={showRowNumbers}
                actualIndex={actualIndex}
              />
            );
          })}
        </Box>
      ) : (
        /* Visualização em Tabela */
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
                  <TableCell align="right" width={120}>
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

                    {/* Ações Individuais */}
                    {actions.length > 0 && (
                      <TableCell align="right">
                        <IndividualActions actions={actions} item={item} />
                      </TableCell>
                    )}
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

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
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            borderRadius: useMobileView ? '0 0 12px 12px' : 0,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0,
              fontSize: isXs ? '0.875rem' : '0.8125rem',
            },
            '& .MuiTablePagination-select': {
              fontSize: isXs ? '0.875rem' : '0.8125rem',
            },
            '& .MuiIconButton-root': {
              padding: isXs ? 1 : 0.75,
            }
          }}
        />
      )}
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
      render: PropTypes.func,
      primary: PropTypes.bool // Para definir colunas principais no mobile
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
  containerProps: PropTypes.object,
  mobileView: PropTypes.oneOf(['auto', 'table', 'cards'])
};

export default StandardTable;