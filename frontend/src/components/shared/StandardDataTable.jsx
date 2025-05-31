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
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Box,
  Typography,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Componentes
import TableRowSkeleton from './TableRowSkeleton';
import StandardEmptyState from './StandardEmptyState';

// Styled Components - Mantendo o mesmo estilo da página Tags
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: 6,
    [theme.breakpoints.up('sm')]: {
      width: 8,
    }
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  }
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: theme.spacing(1.5, 2),
    borderBottom: `2px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: theme.palette.background.paper,
    boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer'
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    }
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    verticalAlign: 'middle'
  }
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: 400,
  padding: theme.spacing(4),
  textAlign: 'center'
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(0.5),
  minWidth: 'fit-content',
  '& .MuiIconButton-root': {
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.shadows[2]
    }
  }
}));

// Componente de Estado Vazio
const TableEmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onActionClick,
  customEmptyState 
}) => {
  if (customEmptyState) {
    return customEmptyState;
  }

  return (
    <EmptyStateContainer>
      {icon && (
        <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="textSecondary" paragraph sx={{ maxWidth: 400, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onActionClick && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onActionClick}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </EmptyStateContainer>
  );
};

// Componente de Ações Inline CORRIGIDO
const InlineActions = ({ actions = [], item, maxVisibleActions = 3 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Garantir que actions seja sempre um array e seja uma função
  const resolvedActions = typeof actions === 'function' ? actions(item) : (Array.isArray(actions) ? actions : []);
  
  if (!resolvedActions || resolvedActions.length === 0) {
    return null;
  }
  
  // Limitar ações visíveis baseado na tela
  const maxVisible = isMobile ? 2 : maxVisibleActions;
  const visibleActions = resolvedActions.slice(0, maxVisible);
  const hiddenActions = resolvedActions.slice(maxVisible);
  const hasMoreActions = hiddenActions.length > 0;

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleActionClick = (action, event) => {
    event.stopPropagation();
    handleMenuClose();
    action.onClick(item);
  };

  return (
    <ActionsContainer onClick={(e) => e.stopPropagation()}>
      {visibleActions.map((action, index) => (
        <Tooltip key={index} title={action.label} arrow placement="top">
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              action.onClick(item);
            }}
            disabled={action.disabled}
            color={action.color || 'default'}
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
      
      {hasMoreActions && (
        <>
          <Tooltip title="Mais ações" arrow placement="top">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              color="default"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary'
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                minWidth: 160
              }
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {hiddenActions.map((action, index) => (
              <MenuItem
                key={index}
                onClick={(event) => handleActionClick(action, event)}
                disabled={action.disabled}
                sx={{
                  minHeight: 40,
                  px: 2,
                  color: action.color === 'error' 
                    ? 'error.main' 
                    : action.color === 'success'
                      ? 'success.main'
                      : 'text.primary',
                  '&:hover': {
                    backgroundColor: action.color === 'error' 
                      ? 'error.light' 
                      : action.color === 'success'
                        ? 'success.light'
                        : 'action.hover'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 36
                  }}
                >
                  {action.icon}
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </ActionsContainer>
  );
};

// Componente Principal CORRIGIDO
const StandardDataTable = ({
  // Dados
  data = [],
  columns = [],
  loading = false,
  
  // Funcionalidades
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onRowClick,
  actions = [],
  
  // Estado vazio
  emptyState,
  emptyIcon,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Não há dados para exibir no momento.",
  emptyActionLabel,
  onEmptyActionClick,
  
  // Configurações visuais
  stickyHeader = true,
  size = "small",
  hover = true,
  
  // Configurações de ações
  maxVisibleActions = 3,
  
  // Props adicionais
  tableProps = {},
  containerProps = {},
  
  // Callbacks personalizados
  customRowRenderer,
  onRowDoubleClick,
  
  ...props
}) => {
  const theme = useTheme();

  // Handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = data.map((item, index) => ({ ...item, _index: index }));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectItem = (event, item, index) => {
    event.stopPropagation();
    const itemWithIndex = { ...item, _index: index };
    const isSelected = selectedItems.some(selected => 
      selected.id === item.id || selected._index === index
    );

    if (isSelected) {
      const newSelected = selectedItems.filter(selected => 
        selected.id !== item.id && selected._index !== index
      );
      onSelectionChange?.(newSelected);
    } else {
      onSelectionChange?.([...selectedItems, itemWithIndex]);
    }
  };

  const handleRowClick = (item, index) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  };

  const handleRowDoubleClick = (item, index) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(item, index);
    }
  };

  // Verificações de seleção
  const isAllSelected = data.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  // Verificar se há ações disponíveis
  const hasActions = actions && (
    typeof actions === 'function' || 
    (Array.isArray(actions) && actions.length > 0)
  );

  // Renderização de loading
  if (loading && data.length === 0) {
    return (
      <StyledTableContainer component={Paper} {...containerProps}>
        <StyledTable stickyHeader={stickyHeader} size={size} {...tableProps}>
          <StyledTableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ width: "48px" }}>
                  <Checkbox disabled />
                </TableCell>
              )}
              {columns.map((column, index) => (
                <TableCell
                  key={column.id || index}
                  align={column.align || 'left'}
                  style={{ 
                    width: column.width,
                    minWidth: column.minWidth 
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell align="right" sx={{ width: 120 }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            <TableRowSkeleton 
              columns={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)} 
            />
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    );
  }

  // Renderização de estado vazio
  if (data.length === 0 && !loading) {
    return (
      <StyledTableContainer component={Paper} {...containerProps}>
        <TableEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onActionClick={onEmptyActionClick}
          customEmptyState={emptyState}
        />
      </StyledTableContainer>
    );
  }

  return (
    <StyledTableContainer component={Paper} {...containerProps}>
      <StyledTable stickyHeader={stickyHeader} size={size} {...tableProps}>
        <StyledTableHead>
          <TableRow>
            {/* Checkbox de seleção global */}
            {selectable && (
              <TableCell padding="checkbox" sx={{ width: "48px" }}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  inputProps={{
                    'aria-label': 'selecionar todos os itens'
                  }}
                />
              </TableCell>
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
              >
                {column.label}
              </TableCell>
            ))}

            {/* Coluna de ações */}
            {hasActions && (
              <TableCell 
                align="right" 
                sx={{ 
                  width: 120,
                  minWidth: 120,
                  paddingRight: 2
                }}
              >
                Ações
              </TableCell>
            )}
          </TableRow>
        </StyledTableHead>

        <TableBody>
          {data.map((item, index) => {
            const isSelected = selectedItems.some(selected => 
              selected.id === item.id || selected._index === index
            );

            return (
              <StyledTableRow
                key={item.id || index}
                hover={hover}
                selected={isSelected}
                onClick={() => handleRowClick(item, index)}
                onDoubleClick={() => handleRowDoubleClick(item, index)}
                role={selectable ? "checkbox" : undefined}
                aria-checked={selectable ? isSelected : undefined}
                tabIndex={-1}
              >
                {/* Checkbox de seleção do item */}
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => handleSelectItem(event, item, index)}
                      inputProps={{
                        'aria-labelledby': `table-checkbox-${index}`
                      }}
                    />
                  </TableCell>
                )}

                {/* Renderização customizada ou padrão das colunas */}
                {customRowRenderer ? (
                  customRowRenderer(item, index, columns)
                ) : (
                  columns.map((column, colIndex) => (
                    <TableCell
                      key={column.id || colIndex}
                      align={column.align || 'left'}
                      ref={item.ref && colIndex === 0 ? item.ref : null}
                    >
                      {column.render 
                        ? column.render(item, index)
                        : item[column.field] || '-'
                      }
                    </TableCell>
                  ))
                )}

                {/* Ações inline */}
                {hasActions && (
                  <TableCell align="right" sx={{ paddingRight: 2 }}>
                    <InlineActions 
                      actions={actions} 
                      item={item} 
                      maxVisibleActions={maxVisibleActions}
                    />
                  </TableCell>
                )}
              </StyledTableRow>
            );
          })}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};

StandardDataTable.propTypes = {
  // Dados
  data: PropTypes.array.isRequired,
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
  loading: PropTypes.bool,
  
  // Funcionalidades
  selectable: PropTypes.bool,
  selectedItems: PropTypes.array,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowDoubleClick: PropTypes.func,
  actions: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.node,
        onClick: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        color: PropTypes.string,
        divider: PropTypes.bool
      })
    )
  ]),
  
  // Estado vazio
  emptyState: PropTypes.node,
  emptyIcon: PropTypes.node,
  emptyTitle: PropTypes.string,
  emptyDescription: PropTypes.string,
  emptyActionLabel: PropTypes.string,
  onEmptyActionClick: PropTypes.func,
  
  // Configurações visuais
  stickyHeader: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  hover: PropTypes.bool,
  
  // Configurações de ações
  maxVisibleActions: PropTypes.number,
  
  // Props adicionais
  tableProps: PropTypes.object,
  containerProps: PropTypes.object,
  customRowRenderer: PropTypes.func
};

export default StandardDataTable;