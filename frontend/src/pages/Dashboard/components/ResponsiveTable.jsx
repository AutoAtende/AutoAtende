import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  List,
  ListItem,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import useResponsive from '../hooks/useResponsive';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';
import VisibilityToggle from './VisibilityToggle';

const ResponsiveTable = ({ 
  title, 
  data = [], 
  columns = [], 
  mobileCardComponent = null,
  actions = null,
  tabId,
  componentId,
  ...props 
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [expandedItem, setExpandedItem] = useState(null);
  const { isComponentVisible } = useDashboardSettings();
  
  const visible = isComponentVisible(tabId, componentId);

  // Se o componente não estiver visível, não renderize nada
  if (!visible) {
    return null;
  }
  
  // Verificar se temos dados e colunas
  const hasValidData = Array.isArray(data) && data.length > 0;
  const hasValidColumns = Array.isArray(columns) && columns.length > 0;
  
  // Função para renderizar o conteúdo das células
  const renderCellContent = (row, column) => {
    const value = row[column.field];
    
    if (column.renderCell) {
      return column.renderCell(value, row);
    }
    
    return value;
  };
  
  // Função para expandir/colapsar item em mobile
  const toggleExpand = (index) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };
  
  // Versão desktop - tabela normal
  const renderDesktopTable = () => (
    <TableContainer sx={{ maxHeight: props.maxHeight || 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={index}
                align={column.align || 'left'}
                sx={{
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  minWidth: column.minWidth || 'auto',
                  px: 2,
                  py: 1.5
                }}
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              hover
              sx={{
                '&:nth-of-type(even)': {
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
                }
              }}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={colIndex}
                  align={column.align || 'left'}
                  sx={{ px: 2, py: 1 }}
                >
                  {renderCellContent(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // Versão mobile - lista de cards
  const renderMobileList = () => (
    <List sx={{ p: 0 }}>
      {data.map((row, index) => (
        <React.Fragment key={index}>
          <ListItem
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              p: 1.5,
              '&:nth-of-type(even)': {
                bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              width: '100%', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {mobileCardComponent ? (
                // Se houver um componente personalizado para o card mobile
                mobileCardComponent(row, index, expandedItem === index)
              ) : (
                // Card padrão - exibe apenas o primeiro campo
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {renderCellContent(row, columns[0])}
                </Typography>
              )}
              
              {/* Se tivermos mais de um campo, exibir botão de expansão */}
              {columns.length > 1 && !mobileCardComponent && (
                <IconButton
                  size="small"
                  onClick={() => toggleExpand(index)}
                  sx={{ ml: 1 }}
                >
                  {expandedItem === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>
            
            {/* Detalhes expandidos */}
            {columns.length > 1 && !mobileCardComponent && (
              <Collapse in={expandedItem === index} timeout="auto" unmountOnExit sx={{ width: '100%', mt: 1 }}>
                <Box sx={{ px: 1, py: 0.5 }}>
                  {columns.slice(1).map((column, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {column.headerName}:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {renderCellContent(row, column)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            )}
          </ListItem>
          {index < data.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
  
  // Renderizar mensagem caso não haja dados
  const renderEmptyState = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Nenhum dado disponível
      </Typography>
    </Box>
  );
  
  return (
    <Paper
      sx={{
        borderRadius: 1,
        boxShadow: theme.shadows[2],
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...props.sx
      }}
      elevation={1}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: isMobile ? 1.5 : 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ fontWeight: isMobile ? 'medium' : 'bold' }}
          >
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {actions && actions}
            <VisibilityToggle 
              tabId={tabId} 
              componentId={componentId} 
              visible={true} 
            />
          </Box>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {hasValidData && hasValidColumns ? (
          isMobile ? renderMobileList() : renderDesktopTable()
        ) : (
          renderEmptyState()
        )}
      </Box>
    </Paper>
  );
};

export default ResponsiveTable;