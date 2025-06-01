import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ViewKanban as KanbanIcon,
  Sync as SyncIcon,
  OpenInNew as OpenIcon,
  AutoMode as AutoIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

const TicketKanbanIntegration = ({ 
  ticket, 
  onUpdate, 
  showInTicketDetails = false 
}) => {
  const { user } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [kanbanCard, setKanbanCard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [lanes, setLanes] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedLane, setSelectedLane] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [autoCreateEnabled, setAutoCreateEnabled] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  useEffect(() => {
    if (ticket) {
      fetchKanbanCard();
      fetchBoards();
      checkAutoCreateSettings();
    }
  }, [ticket]);

  useEffect(() => {
    if (selectedBoard) {
      fetchLanes();
    }
  }, [selectedBoard]);

  const fetchKanbanCard = async () => {
    try {
      const { data } = await api.request({
        url: '/kanban/cards',
        method: 'get',
        params: { ticketId: ticket.id }
      });
      
      if (data.cards && data.cards.length > 0) {
        setKanbanCard(data.cards[0]);
      }
    } catch (err) {
      console.error("Erro ao buscar cartão Kanban:", err);
    }
  };

  const fetchBoards = async () => {
    try {
      const { data } = await api.request({
        url: '/kanban/boards',
        method: 'get'
      });
      setBoards(data || []);
      
      // Selecionar quadro padrão automaticamente
      const defaultBoard = data.find(board => board.isDefault);
      if (defaultBoard) {
        setSelectedBoard(defaultBoard.id);
      }
    } catch (err) {
      console.error("Erro ao buscar quadros:", err);
    }
  };

  const fetchLanes = async () => {
    try {
      const board = boards.find(b => b.id === selectedBoard);
      if (board && board.lanes) {
        setLanes(board.lanes);
        
        // Selecionar primeira lane por padrão
        if (board.lanes.length > 0) {
          setSelectedLane(board.lanes[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar lanes:", err);
    }
  };

  const checkAutoCreateSettings = async () => {
    try {
      const { data } = await api.request({
        url: '/settings/kanban_auto_create_cards',
        method: 'get'
      });
      setAutoCreateEnabled(data.value === 'enabled');
    } catch (err) {
      // Configuração não existe ainda
      setAutoCreateEnabled(false);
    }
  };

  const handleCreateCard = async () => {
    try {
      setLoading(true);
      
      const { data } = await api.request({
        url: '/kanban/tickets/create-card',
        method: 'post',
        data: {
          ticketId: ticket.id,
          boardId: selectedBoard,
          laneId: selectedLane
        }
      });
      
      setKanbanCard(data.card);
      setShowCreateDialog(false);
      toast.success('Cartão Kanban criado com sucesso!');
      
    } catch (err) {
      console.error("Erro ao criar cartão:", err);
      toast.error(err.response?.data?.message || 'Erro ao criar cartão Kanban');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStatus = async () => {
    try {
      setLoading(true);
      
      await api.request({
        url: `/kanban/tickets/${kanbanCard.id}/sync`,
        method: 'post',
        data: {
          laneId: kanbanCard.laneId
        }
      });
      
      toast.success('Status sincronizado com sucesso!');
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
      toast.error('Erro ao sincronizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCreateToggle = async (enabled) => {
    try {
      setLoading(true);
      
      await api.request({
        url: '/settings/kanban_auto_create_cards',
        method: 'post',
        data: {
          value: enabled ? 'enabled' : 'disabled'
        }
      });
      
      setAutoCreateEnabled(enabled);
      toast.success(`Criação automática ${enabled ? 'ativada' : 'desativada'}`);
      
    } catch (err) {
      console.error("Erro ao alterar configuração:", err);
      toast.error('Erro ao alterar configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateCards = async () => {
    try {
      setLoading(true);
      
      const { data } = await api.request({
        url: '/kanban/tickets/auto-create',
        method: 'post',
        data: {
          queueId: ticket.queueId,
          status: ['pending', 'open'],
          boardId: selectedBoard
        }
      });
      
      toast.success(`${data.createdCount} cartões criados automaticamente`);
      
    } catch (err) {
      console.error("Erro na criação em lote:", err);
      toast.error('Erro na criação automática de cartões');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKanban = () => {
    if (kanbanCard) {
      // Navegar para o Kanban na posição do cartão
      history.push(`/kanban/${kanbanCard.lane.boardId}?cardId=${kanbanCard.id}`);
    } else {
      // Navegar para o Kanban geral
      history.push('/kanban');
    }
  };

  const getTicketStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'open': 'info',
      'closed': 'success'
    };
    return colors[status] || 'default';
  };

  const getLaneColor = (laneColor) => {
    return {
      backgroundColor: laneColor || '#1976d2',
      color: 'white'
    };
  };

  if (showInTicketDetails) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <KanbanIcon sx={{ mr: 1 }} />
            Kanban
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Configurações Kanban">
              <IconButton onClick={() => setShowSettingsDialog(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<KanbanIcon />}
              onClick={handleOpenKanban}
              size="small"
            >
              Abrir Kanban
            </Button>
          </Box>
        </Box>

        {kanbanCard ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Cartão:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {kanbanCard.title}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Coluna:
                </Typography>
                <Chip 
                  label={kanbanCard.lane?.name || 'N/A'}
                  size="small"
                  style={getLaneColor(kanbanCard.lane?.color)}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Status do Ticket:
                </Typography>
                <Chip 
                  label={ticket.status}
                  size="small"
                  color={getTicketStatusColor(ticket.status)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<SyncIcon />}
                  onClick={handleSyncStatus}
                  disabled={loading}
                  size="small"
                >
                  Sincronizar
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<OpenIcon />}
                  onClick={handleOpenKanban}
                  size="small"
                >
                  Ver no Kanban
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Este ticket não possui cartão Kanban associado
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<KanbanIcon />}
              onClick={() => setShowCreateDialog(true)}
              disabled={loading}
            >
              Criar Cartão Kanban
            </Button>
          </Box>
        )}

        {/* Dialog para criar cartão */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
          <DialogTitle>Criar Cartão Kanban</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 400, pt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Quadro</InputLabel>
                <Select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  label="Quadro"
                >
                  {boards.map((board) => (
                    <MenuItem key={board.id} value={board.id}>
                      {board.name}
                      {board.isDefault && (
                        <Chip label="Padrão" size="small" sx={{ ml: 1 }} />
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Coluna</InputLabel>
                <Select
                  value={selectedLane}
                  onChange={(e) => setSelectedLane(e.target.value)}
                  label="Coluna"
                  disabled={!selectedBoard}
                >
                  {lanes.map((lane) => (
                    <MenuItem key={lane.id} value={lane.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%',
                            bgcolor: lane.color || '#1976d2',
                            mr: 1 
                          }} 
                        />
                        {lane.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info">
                O cartão será criado com as informações do ticket atual e poderá ser gerenciado no Kanban.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCard}
              variant="contained"
              disabled={loading || !selectedBoard || !selectedLane}
              startIcon={loading ? <CircularProgress size={20} /> : <KanbanIcon />}
            >
              Criar Cartão
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de configurações */}
        <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)}>
          <DialogTitle>Configurações Kanban</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 400, pt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoCreateEnabled}
                    onChange={(e) => handleAutoCreateToggle(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Criação automática de cartões para novos tickets"
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Quando ativado, cartões Kanban serão criados automaticamente para tickets pendentes e abertos.
              </Typography>

              <Button
                variant="outlined"
                startIcon={<AutoIcon />}
                onClick={handleBulkCreateCards}
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
              >
                Criar cartões para tickets existentes
              </Button>

              <Alert severity="warning">
                Esta ação criará cartões para todos os tickets pendentes e abertos da mesma fila.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettingsDialog(false)}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }

  // Versão compacta para usar em outros lugares
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {kanbanCard ? (
        <>
          <Chip 
            label={kanbanCard.lane?.name || 'Kanban'}
            size="small"
            style={getLaneColor(kanbanCard.lane?.color)}
            clickable
            onClick={handleOpenKanban}
          />
          <Tooltip title="Sincronizar com Kanban">
            <IconButton size="small" onClick={handleSyncStatus} disabled={loading}>
              <SyncIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Criar cartão Kanban">
          <IconButton 
            size="small" 
            onClick={() => setShowCreateDialog(true)}
            disabled={loading}
          >
            <KanbanIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default TicketKanbanIntegration;