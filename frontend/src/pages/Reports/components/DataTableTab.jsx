import React from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Typography,
  Tooltip,
  Avatar,
  Skeleton,
  useTheme,
  useMediaQuery,
  Rating
} from '@mui/material';
import {
  AccessTime,
  Person,
  Queue,
  Tag,
  Star
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { i18n } from "../../../translate/i18n";

// Componente auxiliar para exibição de status
const StatusChip = ({ status }) => {
  let color = 'default';
  let label = status;
  
  switch (status) {
    case 'open':
      color = 'success';
      label = i18n.t('reports.status.open');
      break;
    case 'pending':
      color = 'warning';
      label = i18n.t('reports.status.pending');
      break;
    case 'closed':
      color = 'error';
      label = i18n.t('reports.status.closed');
      break;
    default:
      color = 'default';
      label = status;
  }
  
  return <Chip size="small" color={color} label={label} />;
};

// Componente de célula de tabela responsiva
const ResponsiveTableCell = ({ children, sx, ...props }) => {
  return (
    <TableCell
      sx={{
        ...sx,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '200px'
      }}
      {...props}
    >
      {children}
    </TableCell>
  );
};

const DataTableTab = ({ tickets, totalCount, filters, onFilterChange, loading, users, queues }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Animação
  const tableAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 }
  });
  
  // Funções para ordenação
  const handleRequestSort = (property) => {
    const isAsc = filters.sortBy === property && filters.sortOrder === 'ASC';
    onFilterChange('sortOrder', isAsc ? 'DESC' : 'ASC');
    onFilterChange('sortBy', property);
  };
  
  // Função para paginação
  const handleChangePage = (event, newPage) => {
    onFilterChange('pageNumber', newPage + 1);
  };
  
  const handleChangeRowsPerPage = (event) => {
    onFilterChange('pageSize', parseInt(event.target.value, 10));
    onFilterChange('pageNumber', 1);
  };
  
  // Função para encontrar o nome do atendente
  const findUserName = (userId) => {
    if (!userId) return '-';
    const user = users.find(u => u.id === userId);
    return user ? user.name : '-';
  };

  // Função para encontrar os dados da fila
  const findQueueData = (queueId) => {
    if (!queueId) return { name: '-', color: '#cccccc' };
    const queue = queues.find(q => q.id === queueId);
    return queue ? { name: queue.name, color: queue.color } : { name: '-', color: '#cccccc' };
  };
  
  // Colunas da tabela
  const columns = [
    { id: 'id', label: i18n.t('reports.table.columns.id'), sortable: true, minWidth: 70 },
    { id: 'contactName', label: i18n.t('reports.table.columns.contact'), sortable: true, minWidth: 150 },
    { id: 'queueName', label: i18n.t('reports.table.columns.queue'), sortable: true, minWidth: 120 },
    { id: 'userName', label: i18n.t('reports.table.columns.user'), sortable: true, minWidth: 120 },
    { id: 'status', label: i18n.t('reports.table.columns.status'), sortable: true, minWidth: 100 },
    { id: 'createdAt', label: i18n.t('reports.table.columns.createdAt'), sortable: true, minWidth: 120 },
    { id: 'updatedAt', label: i18n.t('reports.table.columns.updatedAt'), sortable: true, minWidth: 120 },
    { id: 'rating', label: i18n.t('reports.table.columns.rating'), sortable: true, minWidth: 120 },
    { id: 'tags', label: i18n.t('reports.table.columns.tags'), sortable: false, minWidth: 150 }
  ];
  
  // Colunas para mobile (versão reduzida)
  const mobileColumns = isMobile ? 
    columns.filter(column => ['contactName', 'status', 'updatedAt', 'rating'].includes(column.id)) :
    columns;
  
  return (
    <animated.div style={tableAnimation}>
      <Box sx={{ width: '100%', mb: 2 }}>
        {!loading && tickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body1" color="text.secondary">
              {i18n.t('reports.table.noData')}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader aria-label="sticky table" size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  {mobileColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.id === 'id' ? 'left' : 'left'}
                      style={{ minWidth: column.minWidth }}
                      sortDirection={filters.sortBy === column.id ? filters.sortOrder.toLowerCase() : false}
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={filters.sortBy === column.id}
                          direction={filters.sortBy === column.id ? filters.sortOrder.toLowerCase() : 'asc'}
                          onClick={() => handleRequestSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Esqueletos de carregamento
                  Array.from(new Array(filters.pageSize)).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {mobileColumns.map((column) => (
                        <TableCell key={`skeleton-${index}-${column.id}`}>
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  // Dados reais
                  tickets.map((ticket) => {
                    // Obter dados relacionados
                    const contactName = ticket.contact?.name || '-';
                    const queueData = findQueueData(ticket.queueId);
                    const userName = findUserName(ticket.userId);
                    const rating = ticket.user && ticket.user.ratings && ticket.user.ratings.length > 0 
                    ? ticket.user.ratings[0].rate 
                    : null;
                    
                    return (
                      <TableRow hover key={ticket.id}>
                        {mobileColumns.map((column) => {
                          
                          if (column.id === 'id') {
                            return (
                              <ResponsiveTableCell key={column.id}>
                                #{ticket.id}
                              </ResponsiveTableCell>
                            );
                          }
                          
                          if (column.id === 'contactName') {
                            return (
                              <ResponsiveTableCell key={column.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    src={ticket.contact?.profilePicUrl}
                                    alt={contactName}
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                  >
                                    {contactName?.charAt(0) || <Person fontSize="small" />}
                                  </Avatar>
                                  <Tooltip title={`${contactName} (${ticket.contact?.number || '-'})`}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {contactName || i18n.t('reports.table.unknown')}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                              </ResponsiveTableCell>
                            );
                          }
                          
                          if (column.id === 'queueName') {
                            return (
                              <ResponsiveTableCell key={column.id}>
                                {queueData.name !== '-' ? (
                                  <Chip
                                    icon={<Queue fontSize="small" />}
                                    label={queueData.name}
                                    size="small"
                                    style={{ backgroundColor: queueData.color || theme.palette.primary.main, color: '#fff' }}
                                  />
                                ) : (
                                  '-'
                                )}
                              </ResponsiveTableCell>
                            );
                          }
                          
                          if (column.id === 'userName') {
                            return (
                              <ResponsiveTableCell key={column.id}>
                                {userName || '-'}
                              </ResponsiveTableCell>
                            );
                          }
                          
                          if (column.id === 'status') {
                            return (
                              <ResponsiveTableCell key={column.id}>
                                <StatusChip status={ticket.status} />
                              </ResponsiveTableCell>
                            );
                          }
                          
                          if (column.id === 'createdAt' || column.id === 'updatedAt') {
                            const date = ticket[column.id] ? new Date(ticket[column.id]) : null;
                            return (
                              <ResponsiveTableCell key={column.id}>
                                {date ? (
                                  <Tooltip 
                                    title={format(
                                      date, 
                                      'dd/MM/yyyy HH:mm:ss',
                                      { locale: ptBR }
                                    )}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                      {format(
                                        date, 
                                        isMobile ? 'dd/MM/yy' : 'dd/MM/yy HH:mm',
                                        { locale: ptBR }
                                      )}
                                    </Box>
                                  </Tooltip>
                                ) : '-'}
                              </ResponsiveTableCell>
                            );
                          }
                          
                          if (column.id === 'rating') {
                            return (
<ResponsiveTableCell key={column.id}>
  {rating !== null ? (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Rating
        value={rating}
        readOnly
        size="small"
        precision={1}
      />
      <Typography variant="body2" sx={{ ml: 1 }}>
        {ticket.rating}
      </Typography>
    </Box>
  ) : ('-')}
</ResponsiveTableCell>
                            );
                          }
                          
                          if (column.id === 'tags') {
                            return (
                              <ResponsiveTableCell key={column.id}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {ticket.tags && ticket.tags.length > 0 ? (
                                    ticket.tags.slice(0, 3).map((tag) => (
                                      <Chip
                                        key={tag.id}
                                        icon={<Tag fontSize="small" />}
                                        label={tag.name}
                                        size="small"
                                        style={{ backgroundColor: tag.color, color: '#fff' }}
                                      />
                                    ))
                                  ) : (
                                    '-'
                                  )}
                                  {ticket.tags && ticket.tags.length > 3 && (
                                    <Tooltip
                                      title={
                                        <Box>
                                          {ticket.tags.slice(3).map(tag => (
                                            <Chip
                                              key={tag.id}
                                              label={tag.name}
                                              size="small"
                                              style={{ backgroundColor: tag.color, color: '#fff', margin: '2px' }}
                                            />
                                          ))}
                                        </Box>
                                      }
                                    >
                                      <Chip
                                        label={`+${ticket.tags.length - 3}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  )}
                                </Box>
                              </ResponsiveTableCell>
                            );
                          }
                          
                          return (
                            <ResponsiveTableCell key={column.id}>
                              {ticket[column.id] !== undefined ? ticket[column.id].toString() : '-'}
                            </ResponsiveTableCell>
                          );
                        })}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={filters.pageSize}
          page={filters.pageNumber - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={i18n.t('reports.table.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} ${i18n.t('reports.table.of')} ${count}`
          }
        />
      </Box>
    </animated.div>
  );
};

export default DataTableTab;