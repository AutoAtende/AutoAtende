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
  Divider
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
  overflow: 'auto'
}));

const StyledTable = styled(Table)(({ theme }) => ({
  // Mantém as mesmas configurações da tabela original
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    // Cabeçalho sem cor de fundo definida
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: theme.palette.background.paper
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer'
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(4),
  textAlign: 'center'
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

// Menu de Ações - REMOVIDO (não será mais usado)

// Componente de Ações Inline
const InlineActions = ({ actions = [], item, maxVisibleActions = 3 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Se for mobile ou muitas ações, limita a quantidade visível
  const visibleActions = isMobile ? actions.slice(0, 2) : actions.slice(0, maxVisibleActions);
  const hasMoreActions = actions.length > visibleActions.length;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {visibleActions.map((action, index) => (
        <IconButton
          key={index}
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            action.onClick(item);
          }}
          disabled={action.disabled}
          color={action.color || 'default'}
          title={action.label}
          sx={{
            padding: '4px',
            '&:hover': {
              backgroundColor: action.color === 'error' 
                ? 'error.light' 
                : 'action.hover'
            }
          }}
        >
          {action.icon}
        </IconButton>
      ))}
      
      {hasMoreActions && (
        <IconButton
          size="small"
          color="default"
          title="Mais ações"
          sx={{ padding: '4px' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

// Componente Principal
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
  maxVisibleActions = 3, // Máximo de ações visíveis por linha
  
  // Props adicionais
  tableProps = {},
  containerProps = {},
  
  // Callbacks personalizados
  customRowRenderer,
  onRowDoubleClick,
  
  ...props
}) => {
  const theme = useTheme();
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleOpenActionsMenu = (event, item) => {
    // Removido - não será mais usado
  };

  const handleCloseActionsMenu = () => {
    // Removido - não será mais usado
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
              {actions.length > 0 && (
                <TableCell align="right">Ações</TableCell>
              )}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            <TableRowSkeleton 
              columns={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} 
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
    <>
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
              {actions.length > 0 && (
                <TableCell align="right" sx={{ width: `${Math.min(actions.length * 40, maxVisibleActions * 40)}px` }}>
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
                      >
                        {column.render 
                          ? column.render(item, index)
                          : item[column.field] || '-'
                        }
                      </TableCell>
                    ))
                  )}

                  {/* Ações inline */}
                  {actions.length > 0 && (
                    <TableCell align="right">
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
    </>
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
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      color: PropTypes.string,
      divider: PropTypes.bool
    })
  ),
  
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