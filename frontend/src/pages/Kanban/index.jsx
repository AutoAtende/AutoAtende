import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Button,
  Modal,
  Chip,
  Avatar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Badge
} from "@mui/material";
import {
  Settings as SettingsIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import Board from "react-trello";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { DatePickerMoment } from "../../components/DatePickerMoment";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { toast } from "../../helpers/toast";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflow: 'auto'
};

const Kanban = () => {
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [lanes, setLanes] = useState([]);
  const [queues, setQueues] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [stats, setStats] = useState({});
  
  // Estados de filtro
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    from: "",
    until: "",
  });
  
  // Estados de modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [ticketChecklist, setTicketChecklist] = useState([]);
  
  // Board data
  const [boardData, setBoardData] = useState({ lanes: [] });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    fetchKanbanData();
  }, [selectedQueue, selectedUsers, selectedDate, searchQuery, showClosed]);

  // Atualizar board quando dados mudarem
  useEffect(() => {
    formatBoardData();
  }, [lanes]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar filas
      const { data: queueData } = await api.get("/queue");
      const userQueues = user.profile === "admin" 
        ? queueData 
        : queueData.filter((queue) => user.queues.some((q) => q.id === queue.id));
      setQueues(userQueues);

      // Carregar usuários
      const { data: userData } = await api.get("/users/list");
      setUsers(userData || []);

      // Se há filas, selecionar a primeira por padrão
      if (userQueues.length > 0) {
        setSelectedQueue(userQueues[0].id);
      }

    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast.error("Erro ao carregar dados iniciais");
    } finally {
      setLoading(false);
    }
  };

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      
      const params = {
        queueId: selectedQueue || undefined,
        searchParam: searchQuery || undefined,
        users: selectedUsers.length > 0 ? JSON.stringify(selectedUsers) : undefined,
        dateFrom: selectedDate.from || undefined,
        dateTo: selectedDate.until || undefined,
        showClosed: showClosed.toString()
      };

      // Remover parâmetros undefined
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const [kanbanResponse, statsResponse] = await Promise.all([
        api.get("/kanban", { params }),
        api.get("/kanban/stats", { params: { queueId: selectedQueue || undefined } })
      ]);
      
      setLanes(kanbanResponse.data.lanes || []);
      setStats(statsResponse.data || {});
      
    } catch (error) {
      console.error("Erro ao buscar dados do Kanban:", error);
      toast.error("Erro ao carregar dados do Kanban");
      setLanes([]);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para converter valor para número
  const parseTicketValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };

  // Função auxiliar para calcular valor total dos tickets
  const calculateTotalValue = (tickets) => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return 0;
    }
    
    const total = tickets.reduce((sum, ticket) => {
      const ticketValue = parseTicketValue(ticket.value);
      return sum + ticketValue;
    }, 0);
    
    return parseFloat(total.toFixed(2));
  };

  // Função auxiliar para formatar valor monetário
  const formatCurrency = (value) => {
    const numValue = parseTicketValue(value);
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatBoardData = () => {
    if (!lanes.length) {
      setBoardData({ lanes: [] });
      return;
    }

    const formattedLanes = lanes.map(lane => {
      // Garantir que lane.tickets é um array
      const laneTickets = Array.isArray(lane.tickets) ? lane.tickets : [];
      const totalValue = calculateTotalValue(laneTickets);

      return {
        id: lane.id,
        title: (
          <Box sx={{ width: '100%', textAlign: 'center', minWidth: 300 }}>
            <Box sx={{
              backgroundColor: lane.color || '#666',
              padding: "16px",
              marginBottom: "12px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "50px"
            }}>
              <Typography variant="h6" sx={{ color: "white", fontWeight: "bold", flex: 1 }}>
                {lane.name}
              </Typography>
              <Badge 
                badgeContent={laneTickets.length} 
                color="secondary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: 'white',
                    color: lane.color || '#666'
                  }
                }}
              />
            </Box>
            <Box sx={{ 
              color: "#666", 
              fontSize: "12px", 
              display: "flex", 
              justifyContent: "space-between",
              padding: "0 8px",
              flexWrap: "wrap",
              gap: 1
            }}>
              <Typography variant="caption">
                {laneTickets.length} ticket{laneTickets.length !== 1 ? 's' : ''}
              </Typography>
              {laneTickets.length > 0 && totalValue > 0 && (
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(totalValue)}
                </Typography>
              )}
            </Box>
          </Box>
        ),
        cards: laneTickets.map(ticket => ({
          id: String(ticket.id),
          title: ticket.name || `Ticket #${ticket.id}`,
          description: createCardDescription(ticket),
          draggable: true,
          metadata: { ticket }
        })),
        style: {
          backgroundColor: "#f8f9fa",
          width: 340,
          minWidth: 340,
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          margin: "0 8px"
        }
      };
    });

    setBoardData({ lanes: formattedLanes });
  };

  const createCardDescription = (ticket) => {
    // Garantir que o ticket tem todas as propriedades necessárias
    const safeTicket = {
      id: ticket.id || 0,
      uuid: ticket.uuid || '',
      name: ticket.name || '',
      status: ticket.status || 'pending',
      lastMessage: ticket.lastMessage || '',
      unreadMessages: ticket.unreadMessages || 0,
      value: parseTicketValue(ticket.value),
      sku: ticket.sku || '',
      contact: ticket.contact || null,
      user: ticket.user || null,
      tags: Array.isArray(ticket.tags) ? ticket.tags : [],
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    };

    return (
      <Box sx={{ position: "relative", p: 1 }}>
        {/* Header do contato */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: 2,
          p: 1.5,
          backgroundColor: "#f5f5f5",
          borderRadius: "8px"
        }}>
          <Avatar
            src={safeTicket.contact?.profilePicUrl}
            alt={safeTicket.contact?.name}
            sx={{ width: 40, height: 40, mr: 1.5 }}
          >
            {safeTicket.contact?.name?.charAt(0) || safeTicket.contact?.number?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {safeTicket.contact?.name || safeTicket.contact?.number || "Contato desconhecido"}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {safeTicket.contact?.number || ''}
            </Typography>
          </Box>
        </Box>
        
        {/* Última mensagem */}
        {safeTicket.lastMessage && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">
              Última mensagem:
            </Typography>
            <Typography variant="body2" sx={{ 
              fontSize: "0.85rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mt: 0.5,
              p: 1,
              bgcolor: "#f9f9f9",
              borderRadius: 1,
              border: "1px solid #e0e0e0"
            }}>
              {safeTicket.lastMessage.length > 100 
                ? `${safeTicket.lastMessage.substring(0, 100)}...`
                : safeTicket.lastMessage
              }
            </Typography>
          </Box>
        )}

        {/* Mensagens não lidas */}
        {safeTicket.unreadMessages > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Chip 
              size="small" 
              color="error" 
              label={`${safeTicket.unreadMessages} não lida${safeTicket.unreadMessages > 1 ? 's' : ''}`}
              icon={<WarningIcon fontSize="small" />}
              sx={{ fontSize: "11px" }}
            />
          </Box>
        )}

        {/* Atendente */}
        {safeTicket.user && (
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            mb: 1.5,
            p: 1,
            backgroundColor: "#e3f2fd",
            borderRadius: "6px"
          }}>
            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
            <Typography variant="caption" fontWeight="bold">
              {safeTicket.user.name}
            </Typography>
          </Box>
        )}

        {/* Valor e SKU */}
        {(safeTicket.value > 0 || safeTicket.sku) && (
          <Box sx={{ mb: 1.5, p: 1, bgcolor: "#f0f8f0", borderRadius: 1 }}>
            {safeTicket.sku && (
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                <strong>SKU:</strong> {safeTicket.sku}
              </Typography>
            )}
            {safeTicket.value > 0 && (
              <Typography variant="caption" display="block" color="success.main" fontWeight="bold">
                <strong>Valor:</strong> {formatCurrency(safeTicket.value)}
              </Typography>
            )}
          </Box>
        )}

        {/* Tags */}
        {safeTicket.tags.length > 0 && (
          <Box sx={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 0.5, 
            mb: 1.5 
          }}>
            {safeTicket.tags.slice(0, 2).map(tag => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                sx={{
                  backgroundColor: tag.color,
                  color: "white",
                  fontSize: "10px",
                  height: "22px"
                }}
              />
            ))}
            {safeTicket.tags.length > 2 && (
              <Chip
                label={`+${safeTicket.tags.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "10px", height: "22px" }}
              />
            )}
          </Box>
        )}

        {/* Footer com ações */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderTop: "1px solid #e0e0e0",
          pt: 1.5,
          mt: 1.5
        }}>
          <Typography variant="caption" color="textSecondary">
            {getStatusLabel(safeTicket.status)} • #{safeTicket.id}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Ver detalhes">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTicketClick(safeTicket);
                }}
                sx={{ color: "#1976d2" }}
              >
                <AssignmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Abrir conversa">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTicket(safeTicket);
                }}
                sx={{ color: "#25d366" }}
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    );
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Aguardando',
      'open': 'Atendimento',
      'closed': 'Fechado'
    };
    return statusMap[status] || status;
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setTicketModalOpen(true);
  };

  const handleCardClick = (cardId, metadata) => {
    if (metadata?.ticket) {
      handleTicketClick(metadata.ticket);
    }
  };

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId, position, cardDetails) => {
    if (sourceLaneId === targetLaneId) return;

    try {
      console.log('Movendo card:', { cardId, sourceLaneId, targetLaneId, position });
      
      await api.post(`/kanban/tickets/${cardId}/move`, {
        targetLaneId: targetLaneId,
        sourceLaneId: sourceLaneId,
        position: position
      });

      toast.success("Ticket movido com sucesso!");
      
      // Recarregar dados após um pequeno delay
      setTimeout(() => {
        fetchKanbanData();
      }, 500);
      
    } catch (error) {
      console.error("Erro ao mover ticket:", error);
      toast.error(error.response?.data?.error || "Erro ao mover ticket");
      
      // Recarregar para reverter mudança visual
      fetchKanbanData();
    }
  };

  const handleOpenTicket = (ticket) => {
    if (ticket && ticket.uuid) {
      history.push(`/tickets/${ticket.uuid}`);
    } else if (ticket && ticket.id) {
      // Fallback para ID se UUID não estiver disponível
      history.push(`/tickets/${ticket.id}`);
    }
  };

  const handleCloseModal = () => {
    setTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleAssignUser = async (userId) => {
    if (!selectedTicket) return;

    try {
      await api.post(`/kanban/tickets/${selectedTicket.id}/assign`, {
        userId: userId || null
      });

      toast.success(userId ? "Usuário atribuído com sucesso" : "Usuário removido com sucesso");
      handleCloseModal();
      await fetchKanbanData();

    } catch (error) {
      console.error("Erro ao atribuir usuário:", error);
      toast.error(error.response?.data?.error || "Erro ao atribuir usuário");
    }
  };

  const handleShowChecklist = async () => {
    if (!selectedTicket) return;

    try {
      const { data } = await api.get(`/kanban/tickets/${selectedTicket.id}/checklist`);
      setTicketChecklist(data || []);
      setChecklistModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar checklist:", error);
      toast.error("Erro ao carregar checklist do ticket");
    }
  };

  const handleQueueChange = (event) => {
    setSelectedQueue(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectedDate = (value, range) => {
    setSelectedDate(prev => ({ ...prev, [range]: value }));
  };

  const onFiltered = (value) => {
    const userIds = value.map(u => u.id);
    setSelectedUsers(userIds);
  };

  const handleShowClosedChange = (event) => {
    setShowClosed(event.target.checked);
  };

  const handleRefresh = () => {
    fetchKanbanData();
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", p: 2 }}>
      {/* Header com estatísticas */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight="bold">
              Kanban de Tickets
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center", py: 1 }}>
                    <Typography variant="h6" color="warning.main">
                      {stats.pending || 0}
                    </Typography>
                    <Typography variant="caption">
                      Aguardando
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center", py: 1 }}>
                    <Typography variant="h6" color="info.main">
                      {stats.open || 0}
                    </Typography>
                    <Typography variant="caption">
                      Em Atendimento
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center", py: 1 }}>
                    <Typography variant="h6" color="success.main">
                      {stats.closedToday || 0}
                    </Typography>
                    <Typography variant="caption">
                      Fechados Hoje
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center", py: 1 }}>
                    <Typography variant="h6" color="primary.main">
                      {stats.total || 0}
                    </Typography>
                    <Typography variant="caption">
                      Total Ativo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Filtros - Layout Melhorado */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel>Setor</InputLabel>
              <Select
                value={selectedQueue || ''}
                onChange={handleQueueChange}
                label="Setor"
              >
                <MenuItem value="">Todos os Setores</MenuItem>
                {queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3} lg={2}>
            <TextField
              placeholder="Pesquisar..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
            />
          </Grid>

          {(user.profile === "admin" || user.profile === "superv") && (
            <>
              <Grid item xs={12} sm={6} md={3} lg={2}>
                <Box sx={{ minWidth: "100%" }}>
                  <UsersFilter onFiltered={onFiltered} />
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2} lg={1.5}>
                <DatePickerMoment
                  label="De"
                  getDate={(value) => handleSelectedDate(value, "from")}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2} lg={1.5}>
                <DatePickerMoment
                  label="Até"
                  getDate={(value) => handleSelectedDate(value, "until")}
                />
              </Grid>
            </>
          )}

          <Grid item xs={6} sm={3} md={2} lg={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={showClosed}
                  onChange={handleShowClosedChange}
                  color="primary"
                />
              }
              label={showClosed ? "Fechados" : "Ativos"}
            />
          </Grid>

          <Grid item xs={6} sm={3} md={2} lg={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              fullWidth
              size="small"
            >
              {loading ? <CircularProgress size={16} /> : "Atualizar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Kanban Board */}
      {loading && lanes.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 300px)",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : lanes.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 300px)",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <SettingsIcon sx={{ fontSize: 48, color: "#ccc" }} />
          <Typography variant="h6" color="textSecondary">
            {selectedQueue ? 
              "Nenhum ticket encontrado com os filtros aplicados" : 
              "Selecione um setor para visualizar os tickets"
            }
          </Typography>
          {!selectedQueue && queues.length > 0 && (
            <Button
              variant="contained"
              onClick={() => setSelectedQueue(queues[0].id)}
            >
              Carregar {queues[0].name}
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ 
          flex: 1, 
          overflow: "auto",
          '& .react-trello-board': {
            padding: '20px',
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 300px)',
          },
          '& .react-trello-lane': {
            margin: '0 8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '12px'
          }
        }}>
          <Board
            data={boardData}
            onCardMoveAcrossLanes={handleCardMove}
            onCardClick={handleCardClick}
            draggable
            laneDraggable={false}
            cardDraggable={true}
            style={{
              backgroundColor: "#f5f5f5",
              width: "100%",
              height: "100%",
              fontFamily: theme.typography.fontFamily
            }}
          />
        </Box>
      )}

      {/* Modal de detalhes do ticket */}
      <Modal
        open={ticketModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="ticket-modal-title"
      >
        <Box sx={modalStyle}>
          {selectedTicket && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography id="ticket-modal-title" variant="h6" component="h2">
                  Ticket #{selectedTicket.id}
                </Typography>
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              {/* Informações do contato */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Informações do Contato
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar 
                    src={selectedTicket.contact?.profilePicUrl} 
                    sx={{ mr: 2, width: 40, height: 40 }}
                  >
                    {selectedTicket.contact?.name?.charAt(0) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedTicket.contact?.name || "Nome não informado"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedTicket.contact?.number}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Informações do ticket */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Detalhes do Ticket
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Status:</strong> {getStatusLabel(selectedTicket.status)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Setor:</strong> {selectedTicket.queue?.name || "Não definido"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Criado:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Atualizado:</strong> {new Date(selectedTicket.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  {parseTicketValue(selectedTicket.value) > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Valor:</strong> {formatCurrency(selectedTicket.value)}
                      </Typography>
                    </Grid>
                  )}
                  {selectedTicket.sku && (
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>SKU:</strong> {selectedTicket.sku}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {selectedTicket.lastMessage && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Última mensagem:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mt: 1, 
                      p: 1, 
                      bgcolor: "background.default", 
                      borderRadius: 1,
                      fontStyle: "italic"
                    }}>
                      {selectedTicket.lastMessage}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Atribuição de usuário */}
              {selectedTicket.status !== "closed" && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Responsável pelo Atendimento
                  </Typography>
                  
                  {selectedTicket.user ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                          {selectedTicket.user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {selectedTicket.user.name}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => handleAssignUser(null)}
                        color="error"
                      >
                        Remover
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Nenhum responsável atribuído
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Atribuir para</InputLabel>
                        <Select
                          label="Atribuir para"
                          onChange={(e) => handleAssignUser(e.target.value)}
                          defaultValue=""
                        >
                          {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Paper>
              )}

              {/* Tags */}
              {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedTicket.tags.map(tag => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        sx={{ backgroundColor: tag.color, color: "white" }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Ações */}
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={handleShowChecklist}
                >
                  Ver Checklist
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCloseModal}
                >
                  Fechar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => handleOpenTicket(selectedTicket)}
                >
                  Abrir Conversa
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Modal de checklist */}
      <Modal
        open={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        aria-labelledby="checklist-modal-title"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography id="checklist-modal-title" variant="h6">
              Checklist do Ticket #{selectedTicket?.id}
            </Typography>
            <IconButton onClick={() => setChecklistModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {ticketChecklist.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", py: 4 }}>
              Nenhum item de checklist encontrado para este ticket.
            </Typography>
          ) : (
            <Box>
              {ticketChecklist.map((item, index) => (
                <Paper 
                  key={item.id || index} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 1,
                    bgcolor: item.completed ? "success.light" : "background.paper",
                    opacity: item.completed ? 0.8 : 1
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <CheckCircleIcon 
                        sx={{ 
                          mr: 1, 
                          color: item.completed ? "success.main" : "action.disabled" 
                        }} 
                      />
                      <Typography 
                        variant="body2"
                        sx={{
                          textDecoration: item.completed ? "line-through" : "none",
                          fontWeight: item.required ? "bold" : "normal"
                        }}
                      >
                        {item.description}
                        {item.required && (
                          <Chip 
                            label="Obrigatório" 
                            size="small" 
                            color="error" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Typography>
                    </Box>
                    
                    {item.assignedTo && (
                      <Typography variant="caption" color="textSecondary">
                        Atribuído: {users.find(u => u.id === item.assignedTo)?.name || "Usuário"}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ))}
              
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="caption" color="textSecondary">
                  {ticketChecklist.filter(i => i.completed).length} de {ticketChecklist.length} itens concluídos
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Kanban;