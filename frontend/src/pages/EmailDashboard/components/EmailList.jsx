// src/pages/EmailDashboard/components/EmailList.jsx
import React, { useState, useMemo } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Collapse,
  Divider,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
  Pagination,
  useTheme,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import { debounce } from '../../../utils/helpers';

// Ícones
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';

import { i18n } from "../../../translate/i18n";

// Styled components
const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status) {
    case 'SENT':
      color = theme.palette.success.main;
      break;
    case 'ERROR':
      color = theme.palette.error.main;
      break;
    case 'PENDING':
      color = theme.palette.warning.main;
      break;
    default:
      color = theme.palette.info.main;
  }
  
  return {
    backgroundColor: `${color}20`,  // 20% opacity
    color: color,
    borderColor: color,
    '& .MuiChip-icon': {
      color: color
    }
  };
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
}));

/**
 * Componente para exibir lista de emails com virtualização para desempenho otimizado
 */
const EmailList = ({ 
  emails = [], // Valor padrão para evitar erro quando emails é undefined
  type = 'sent', 
  onViewEmail, 
  onCancelScheduled, 
  onReschedule,
  isMobile,
  isTablet 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState({ field: 'createdAt', direction: 'desc' });
  const [filter, setFilter] = useState('all');
  
  const theme = useTheme();
  const itemsPerPage = isMobile ? 5 : isTablet ? 8 : 10;
  
  // Menu de ações
  const handleMenuOpen = (event, emailId) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedEmailId(emailId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedEmailId(null);
  };
  
  // Expandir/colapsar item (mobile)
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  // Busca com debounce
  const handleSearchChange = debounce((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset para primeira página ao buscar
  }, 300);
  
  // Ordenação
  const handleSort = (field) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Filtro de status
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };
  
  // Paginação
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };
  
  // Status icons mapping
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT': return <CheckIcon fontSize="small" />;
      case 'ERROR': return <ErrorIcon fontSize="small" />;
      case 'PENDING': return <PendingIcon fontSize="small" />;
      default: return null;
    }
  };
  
  // Processamento de dados
  const filteredEmails = useMemo(() => {
    // Verificar se emails é um array válido
    if (!Array.isArray(emails)) {
      return [];
    }
    
    let result = [...emails];
    
    // Aplicar busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(email => 
        (email.subject && email.subject.toLowerCase().includes(term)) || 
        (email.sender && email.sender.toLowerCase().includes(term)) ||
        (email.message && email.message.toLowerCase().includes(term))
      );
    }
    
    // Aplicar filtro de status
    if (filter !== 'all') {
      result = result.filter(email => email.status === filter);
    }
    
    // Aplicar ordenação
    result.sort((a, b) => {
      let valueA = a[sortOrder.field];
      let valueB = b[sortOrder.field];
      
      // Tratamento especial para datas
      if (valueA instanceof Date && valueB instanceof Date) {
        valueA = valueA.getTime();
        valueB = valueB.getTime();
      }
      
      if (sortOrder.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return result;
  }, [emails, searchTerm, filter, sortOrder]);
  
  // Dados paginados
  const paginatedEmails = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmails.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmails, currentPage, itemsPerPage]);
  
  // Total de páginas
  const pageCount = Math.ceil(filteredEmails.length / itemsPerPage);
  
  // Formatação de data
  const formatDate = (date) => {
    if (!date) return '-';
    return moment(date).format('DD/MM/YYYY HH:mm');
  };
  
  // Versão mobile (cards)
  if (isMobile) {
    return (
      <Box>
        {/* Barra de busca e filtros */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder={i18n.t('email.search.placeholder')}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Box>
              <Chip 
                label={i18n.t('email.filters.all')}
                onClick={() => handleFilterChange('all')}
                color={filter === 'all' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
                size="small"
              />
              <Chip 
                label={i18n.t('email.filters.sent')}
                onClick={() => handleFilterChange('SENT')}
                color={filter === 'SENT' ? 'primary' : 'default'}
                icon={<CheckIcon />}
                sx={{ mr: 1 }}
                size="small"
              />
              <Chip 
                label={i18n.t('email.filters.pending')}
                onClick={() => handleFilterChange('PENDING')}
                color={filter === 'PENDING' ? 'primary' : 'default'}
                icon={<PendingIcon />}
                size="small"
              />
            </Box>
          </Box>
        </Box>
        
        {/* Lista de emails */}
        <Box sx={{ mb: 2 }}>
          {paginatedEmails.length === 0 ? (
            <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
              {i18n.t('email.noEmails')}
            </Typography>
          ) : (
            paginatedEmails.map((email) => (
              <Card 
                variant="outlined" 
                sx={{ mb: 1.5, overflow: 'visible' }}
                key={email.id || `email-${Math.random()}`}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography 
                      variant="subtitle1" 
                      component="h3" 
                      noWrap 
                      sx={{ maxWidth: '70%', fontWeight: '500' }}
                    >
                      {email.subject || i18n.t('email.noSubject')}
                    </Typography>
                    
                    <StatusChip
                      label={i18n.t(`email.status.${email.status?.toLowerCase() || 'unknown'}`)}
                      size="small"
                      status={email.status}
                      icon={getStatusIcon(email.status)}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {email.sender}
                  </Typography>
                  
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                    {type === 'scheduled' 
                      ? `${i18n.t('email.scheduledFor')}: ${formatDate(email.sendAt)}`
                      : `${i18n.t('email.sentAt')}: ${formatDate(email.sentAt)}`
                    }
                  </Typography>
                  
                  <Collapse in={expandedId === email.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="textPrimary" sx={{ whiteSpace: 'pre-line' }}>
                        {email.message?.length > 200 
                          ? `${email.message.substring(0, 200)}...`
                          : email.message
                        }
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
                
                <CardActions>
                  <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                    <Button 
                      size="small" 
                      onClick={() => toggleExpand(email.id)}
                      color="inherit"
                    >
                      {expandedId === email.id 
                        ? i18n.t('email.buttons.showLess') 
                        : i18n.t('email.buttons.showMore')
                      }
                    </Button>
                    
                    <Box>
                      <IconButton 
                        aria-label={i18n.t('email.ariaLabels.viewEmail')}
                        onClick={() => onViewEmail && onViewEmail(email)}
                        size="small"
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      
                      {type === 'scheduled' && (
                        <IconButton
                          aria-label={i18n.t('email.ariaLabels.moreOptions')}
                          onClick={(e) => handleMenuOpen(e, email.id)}
                          size="small"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
        
        {/* Paginação */}
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination 
              count={pageCount} 
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        )}
        
        {/* Menu de opções */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem 
            onClick={() => {
              const email = emails.find(e => e.id === selectedEmailId);
              if (onReschedule && selectedEmailId) {
                onReschedule(selectedEmailId);
              }
              handleMenuClose();
            }}
          >
            <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
            {i18n.t('email.buttons.reschedule')}
          </MenuItem>
          
          <MenuItem 
            onClick={() => {
              if (onCancelScheduled && selectedEmailId) {
                onCancelScheduled(selectedEmailId);
              }
              handleMenuClose();
            }}
          >
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            {i18n.t('email.buttons.cancel')}
          </MenuItem>
        </Menu>
      </Box>
    );
  }
  
  // Versão desktop (tabela)
  return (
    <Box>
      {/* Barra de busca e filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder={i18n.t('email.search.placeholder')}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: isTablet ? 'flex-start' : 'flex-end' }}>
            <Chip 
              label={i18n.t('email.filters.all')}
              onClick={() => handleFilterChange('all')}
              color={filter === 'all' ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            />
            <Chip 
              label={i18n.t('email.filters.sent')}
              onClick={() => handleFilterChange('SENT')}
              color={filter === 'SENT' ? 'primary' : 'default'}
              icon={<CheckIcon />}
              sx={{ mr: 1 }}
            />
            <Chip 
              label={i18n.t('email.filters.pending')}
              onClick={() => handleFilterChange('PENDING')}
              color={filter === 'PENDING' ? 'primary' : 'default'}
              icon={<PendingIcon />}
              sx={{ mr: 1 }}
            />
            <Chip 
              label={i18n.t('email.filters.error')}
              onClick={() => handleFilterChange('ERROR')}
              color={filter === 'ERROR' ? 'primary' : 'default'}
              icon={<ErrorIcon />}
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* Tabela de emails */}
      <TableContainer component={Paper} variant="outlined">
        <Table size={isTablet ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSort('subject')}
                >
                  {i18n.t('email.table.subject')}
                  <SortIcon 
                    fontSize="small" 
                    sx={{ 
                      ml: 0.5,
                      transform: sortOrder.field === 'subject' && sortOrder.direction === 'desc' 
                        ? 'rotate(180deg)' 
                        : 'none',
                      opacity: sortOrder.field === 'subject' ? 1 : 0.3,
                      transition: 'transform 0.2s'
                    }} 
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSort('sender')}
                >
                  {i18n.t('email.table.recipient')}
                  <SortIcon 
                    fontSize="small" 
                    sx={{ 
                      ml: 0.5,
                      transform: sortOrder.field === 'sender' && sortOrder.direction === 'desc' 
                        ? 'rotate(180deg)' 
                        : 'none',
                      opacity: sortOrder.field === 'sender' ? 1 : 0.3,
                      transition: 'transform 0.2s'
                    }} 
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSort(type === 'scheduled' ? 'sendAt' : 'sentAt')}
                >
                  {type === 'scheduled' 
                    ? i18n.t('email.table.scheduledFor')
                    : i18n.t('email.table.sentAt')
                  }
                  <SortIcon 
                    fontSize="small" 
                    sx={{ 
                      ml: 0.5,
                      transform: (sortOrder.field === 'sendAt' || sortOrder.field === 'sentAt') && 
                                sortOrder.direction === 'desc' 
                        ? 'rotate(180deg)' 
                        : 'none',
                      opacity: (sortOrder.field === 'sendAt' || sortOrder.field === 'sentAt') ? 1 : 0.3,
                      transition: 'transform 0.2s'
                    }} 
                  />
                </Box>
              </TableCell>
              <TableCell>{i18n.t('email.table.status')}</TableCell>
              <TableCell align="center">{i18n.t('email.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    {i18n.t('email.noEmails')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmails.map((email) => (
                <StyledTableRow 
                  key={email.id || `email-${Math.random()}`}
                  onClick={() => onViewEmail && onViewEmail(email)}
                  hover
                >
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        maxWidth: '250px', 
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis' 
                      }}
                    >
                      {email.subject || i18n.t('email.noSubject')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ maxWidth: '200px' }}
                    >
                      {email.sender}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {type === 'scheduled' 
                      ? formatDate(email.sendAt)
                      : formatDate(email.sentAt)
                    }
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={i18n.t(`email.status.${email.status?.toLowerCase() || 'unknown'}`)}
                      size="small"
                      status={email.status}
                      icon={getStatusIcon(email.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <Tooltip title={i18n.t('email.tooltips.viewEmail')}>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewEmail) onViewEmail(email);
                          }}
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {type === 'scheduled' && (
                        <Tooltip title={i18n.t('email.tooltips.moreOptions')}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, email.id)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Paginação */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination 
          count={pageCount} 
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size={isTablet ? "small" : "medium"}
        />
      </Box>
      
      {/* Menu de opções */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            if (onReschedule && selectedEmailId) {
              onReschedule(selectedEmailId);
            }
            handleMenuClose();
          }}
        >
          <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
          {i18n.t('email.buttons.reschedule')}
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            if (onCancelScheduled && selectedEmailId) {
              onCancelScheduled(selectedEmailId);
            }
            handleMenuClose();
          }}
        >
          <CancelIcon fontSize="small" sx={{ mr: 1 }} />
          {i18n.t('email.buttons.cancel')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default React.memo(EmailList);