import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TableSortLabel,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// TableRow que aplica animação de fade-in nas linhas novas
const AnimatedTableRow = ({ children, index, ...props }) => {
  return (
    <TableRow
      sx={{
        animation: `fadeIn 0.5s ease-in-out`,
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        animationDelay: `${index * 0.05}s`,
        '&:nth-of-type(odd)': {
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        }
      }}
      {...props}
    >
      {children}
    </TableRow>
  );
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const CustomTable = ({
  data,
  loading,
  error,
  onLoadMore,
  hasMore,
  onEdit,
  onBlock,
  onDelete,
  onDetails,
  onUsers,
  onInvoices,
  onSchedule,
  schedulesEnabled = false
}) => {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const observerTarget = useRef(null);
  const [sortedData, setSortedData] = useState([]);
  const [prevData, setPrevData] = useState([]);

  // Ordenação dos dados
  useEffect(() => {
    // Impede ordenação durante carregamento inicial
    if (!data || data.length === 0) {
      setSortedData([]);
      setPrevData([]);
      return;
    }

    // Verifica se os dados mudaram para evitar re-renderizações desnecessárias
    if (JSON.stringify(data) === JSON.stringify(prevData)) {
      return;
    }

    const sorted = [...data].sort((a, b) => {
      // Verificações de valores nulos ou indefinidos
      if (!a[sortField] && !b[sortField]) return 0;
      if (!a[sortField]) return 1;
      if (!b[sortField]) return -1;

      // Comparação baseada no tipo de campo
      let comparison;
      if (typeof a[sortField] === 'string') {
        comparison = a[sortField].localeCompare(b[sortField]);
      } else if (a[sortField] instanceof Date) {
        comparison = a[sortField].getTime() - b[sortField].getTime();
      } else {
        comparison = a[sortField] - b[sortField];
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setSortedData(sorted);
    setPrevData(data);
  }, [data, sortField, sortDirection, prevData]);

  // Configuração do Intersection Observer para scroll infinito
  useEffect(() => {
    if (!observerTarget.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [onLoadMore, loading, hasMore]);

  // Função para mudar a ordenação
  const handleRequestSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Renderização de skeletons durante carregamento
  const renderSkeletons = useCallback(() => {
    return Array.from(new Array(5)).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" width={150} /></TableCell>
      </TableRow>
    ));
  }, []);

  // Estado para erro
  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Headers da tabela e suas propriedades
  const columns = [
    { id: 'id', label: 'ID', minWidth: 60 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'name', label: 'Nome', minWidth: 200 },
    { id: 'email', label: 'E-mail', minWidth: 200 },
    { id: 'plan', label: 'Plano', minWidth: 150 },
    { id: 'value', label: 'Valor', minWidth: 120 },
    { id: 'createdAt', label: 'Criada em', minWidth: 120 },
    { id: 'dueDate', label: 'Vencimento', minWidth: 120 },
    { id: 'lastLogin', label: 'Último login', minWidth: 160 },
    { id: 'folderSize', label: 'Tamanho', minWidth: 120 },
    { id: 'numberOfFiles', label: 'Arquivos', minWidth: 100 },
    { id: 'actions', label: 'Ações', minWidth: 280 }
  ];

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        height: 'calc(100vh - 180px)', 
        maxHeight: 'calc(100vh - 180px)',
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.05)',
        }
      }}
    >
      <Table stickyHeader aria-label="tabela de empresas" size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{ 
                  minWidth: column.minWidth,
                  fontWeight: 'bold',
                  backgroundColor: '#f5f5f5',
                }}
                sortDirection={sortField === column.id ? sortDirection : false}
              >
                {column.id !== 'actions' ? (
                  <TableSortLabel
                    active={sortField === column.id}
                    direction={sortField === column.id ? sortDirection : 'asc'}
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
          {/* Dados da tabela */}
          {sortedData.length > 0 ? (
            sortedData.map((row, index) => (
              <AnimatedTableRow 
                key={`${row.id}-${index}`}
                index={index}
              >
                {/* ID */}
                <TableCell>{row.id}</TableCell>
                
                {/* Status */}
                <TableCell>
                  <Chip
                    label={row.status ? 'Ativo' : 'Bloqueado'}
                    color={row.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                
                {/* Nome */}
                <TableCell>{row.name}</TableCell>
                
                {/* Email */}
                <TableCell>{row.email}</TableCell>
                
                {/* Plano */}
                <TableCell>{row.plan?.name || '-'}</TableCell>
                
                {/* Valor */}
                <TableCell>
                  {row.plan?.value ? 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(row.plan?.value) : '-'}
                </TableCell>
                
                {/* Criada em */}
                <TableCell>
                  {row.createdAt ? 
                    format(new Date(row.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                
                {/* Vencimento */}
                <TableCell>
                  {row.dueDate ? 
                    format(new Date(row.dueDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                
                {/* Último login */}
                <TableCell>
                  {row.lastLogin ? 
                    format(new Date(row.lastLogin), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                </TableCell>
                
                {/* Tamanho */}
                <TableCell>
                  {formatBytes(row.metrics?.folderSize || 0)}
                </TableCell>
                
                {/* Arquivos */}
                <TableCell>
                  {row.metrics?.numberOfFiles || 0}
                </TableCell>
                
                {/* Ações */}
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {schedulesEnabled && (
                      <Tooltip title="Horários">
                        <IconButton
                          size="small"
                          onClick={() => onSchedule(row)}
                        >
                          <ScheduleIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Detalhes">
                      <IconButton
                        size="small"
                        onClick={() => onDetails(row)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Usuários">
                      <IconButton
                        size="small"
                        onClick={() => onUsers(row)}
                      >
                        <PersonIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Faturas">
                      <IconButton
                        size="small"
                        onClick={() => onInvoices(row)}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>

                    {row.id !== 1 && (
                      <>
                        <Tooltip title={row.status ? "Bloquear" : "Desbloquear"}>
                          <IconButton
                            size="small"
                            onClick={() => onBlock(row)}
                          >
                            {row.status ? <BlockIcon /> : <LockOpenIcon />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(row)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </AnimatedTableRow>
            ))
          ) : !loading && (
            <TableRow>
              <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="textSecondary">
                  Nenhum registro encontrado
                </Typography>
              </TableCell>
            </TableRow>
          )}
          
          {/* Skeletons durante carregamento inicial */}
          {loading && data.length === 0 && renderSkeletons()}

          {/* Elemento de referência para o scroll infinito */}
          {hasMore && (
            <TableRow ref={observerTarget}>
              <TableCell colSpan={12} align="center" sx={{ py: 2 }}>
                {loading && (
                  <CircularProgress size={30} thickness={4} />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;