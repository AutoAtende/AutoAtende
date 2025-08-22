'use client';

import React, { useState, useEffect, useContext, useReducer } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  styled,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Queue as QueueIcon,
  ColorLens as ColorIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/Auth/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { api } from '../services/api';
import { toast } from '../helpers/toast';
import QueueModal from '../components/modals/QueueModal';

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  margin: '0 auto',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const TableWrapper = styled(Paper)(({ theme }) => ({
  width: '100%',
  overflow: 'hidden',
}));

const ColorBox = styled(Box)<{ bgcolor: string }>(({ theme, bgcolor }) => ({
  width: 60,
  height: 20,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: bgcolor || theme.palette.primary.main,
  border: `1px solid ${theme.palette.divider}`,
}));

interface Queue {
  id: string;
  name: string;
  color: string;
  orderQueue?: string;
  greetingMessage?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
}

const reducer = (state: Queue[], action: any) => {
  switch (action.type) {
    case 'LOAD_QUEUES': {
      const queues = action.payload;
      const newQueues: Queue[] = [];

      queues.forEach((queue: Queue) => {
        const queueIndex = state.findIndex((q) => q.id === queue.id);
        if (queueIndex !== -1) {
          state[queueIndex] = queue;
        } else {
          newQueues.push(queue);
        }
      });

      return [...state, ...newQueues];
    }
    
    case 'UPDATE_QUEUES': {
      const queue = action.payload;
      const queueIndex = state.findIndex((q) => q.id === queue.id);

      if (queueIndex !== -1) {
        state[queueIndex] = queue;
        return [...state];
      } else {
        return [queue, ...state];
      }
    }
    
    case 'DELETE_QUEUE': {
      const queueId = action.payload;
      return state.filter((q) => q.id !== queueId);
    }
    
    case 'RESET':
      return [];
    
    default:
      return state;
  }
};

const Queues: React.FC = () => {
  const theme = useTheme();
  const { user: currentUser } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState('');

  // Modal states
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [queueToDelete, setQueueToDelete] = useState<Queue | null>(null);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/queue');
      dispatch({ type: 'LOAD_QUEUES', payload: data });
    } catch (error) {
      console.error('Error fetching queues:', error);
      toast.error('Erro ao carregar filas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  // Socket listener for real-time updates
  useEffect(() => {
    if (!currentUser?.companyId || !socketManager) return;

    const socket = socketManager.GetSocket(currentUser.companyId);
    if (!socket) return;

    const handleQueueUpdate = (data: any) => {
      if (data.action === 'update' || data.action === 'create') {
        dispatch({ type: 'UPDATE_QUEUES', payload: data.queue });
      }
      if (data.action === 'delete') {
        dispatch({ type: 'DELETE_QUEUE', payload: data.queueId });
      }
    };

    socket.on(`company-${currentUser.companyId}-queue`, handleQueueUpdate);

    return () => {
      socket.off(`company-${currentUser.companyId}-queue`, handleQueueUpdate);
    };
  }, [socketManager, currentUser, fetchQueues]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenQueueModal = (queue?: Queue) => {
    setSelectedQueue(queue || null);
    setQueueModalOpen(true);
  };

  const handleCloseQueueModal = () => {
    setSelectedQueue(null);
    setQueueModalOpen(false);
    fetchQueues();
  };

  const handleDeleteQueue = async () => {
    if (!queueToDelete) return;

    try {
      await api.delete(`/queue/${queueToDelete.id}`);
      toast.success('Fila excluída com sucesso');
      setDeleteModalOpen(false);
      setQueueToDelete(null);
      fetchQueues();
    } catch (error) {
      console.error('Error deleting queue:', error);
      toast.error('Erro ao excluir fila');
    }
  };

  const getFilteredQueues = () => {
    if (!searchParam) return queues;
    
    return queues.filter(queue =>
      queue.name?.toLowerCase().includes(searchParam) ||
      queue.greetingMessage?.toLowerCase().includes(searchParam) ||
      queue.orderQueue?.toLowerCase().includes(searchParam)
    );
  };

  const filteredQueues = getFilteredQueues();

  return (
    <Container>
      <Header>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Filas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as filas de atendimento
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenQueueModal()}
        >
          Nova Fila
        </Button>
      </Header>

      <SearchBox>
        <TextField
          placeholder="Pesquisar filas..."
          value={searchParam}
          onChange={handleSearch}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </SearchBox>

      <TableWrapper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Cor</TableCell>
                <TableCell>Ordem da Fila</TableCell>
                <TableCell>Mensagem de Saudação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Carregando filas...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredQueues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <QueueIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Nenhuma fila encontrada
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchParam ? 'Tente ajustar os filtros de busca' : 'Adicione a primeira fila'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQueues.map((queue) => (
                  <TableRow key={queue.id} hover>
                    <TableCell>{queue.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {queue.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center">
                        <ColorBox bgcolor={queue.color} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {queue.orderQueue || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ 
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {queue.greetingMessage || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenQueueModal(queue)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setQueueToDelete(queue);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TableWrapper>

      {/* Queue Modal */}
      <QueueModal
        open={queueModalOpen}
        onClose={handleCloseQueueModal}
        queue={selectedQueue}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a fila <strong>{queueToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita e todos os tickets associados serão afetados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteQueue} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Queues;