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
  CardHeader,
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

  const formatBoardData = () => {
    if (!lanes.length) {
      setBoardData({ lanes: [] });
      return;
    }

    const formattedLanes = lanes.map(lane => ({
      id: lane.id,
      title: (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{
            backgroundColor: lane.color,
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{lane.name}</span>
            <Badge badgeContent={lane.tickets.length} color="secondary" />
          </div>
          <div style={{ 
            color: "#666", 
            fontSize: "12px", 
            display: "flex", 
            justifyContent: "space-between",
            padding: "0 8px" 
          }}>
            <span>{lane.tickets.length} tickets</span>
            {lane.tickets.length > 0 && (
              <span>
                Valor: R$ {lane.tickets.reduce((sum, t) => sum + (t.value || 0), 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      ),
      cards: lane.tickets.map(ticket => ({
        id: ticket.id.toString(),
        title: ticket.name || `Ticket #${ticket.id}`,
        description: createCardDescription(ticket),
        draggable: true,
        metadata: { ticket }
      })),
      style: {
        backgroundColor: "white",
        width: 320,
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }
    }));

    setBoardData({ lanes: formattedLanes });
  };

  const createCardDescription = (ticket) => {
    return (
      <div style={{ position: "relative" }}>
        {/* Header do contato */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "12px",
          padding: "8px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px"
        }}>
          <Avatar
            src={ticket.contact?.profilePicUrl}
            alt={ticket.contact?.name}
            sx={{ width: 36, height: 36, mr: 1 }}
          >
            {ticket.contact?.name?.charAt(0) || ticket.contact?.number?.charAt(0)}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {ticket.contact?.name || ticket.contact?.number || "Contato desconhecido"}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {ticket.contact?.number}
            </Typography>
          </div>
        </div>
        
        {/* Última mensagem */}
        {ticket.lastMessage && (
          <div style={{ marginBottom: "8px" }}>
            <Typography variant="caption" color="textSecondary">
              Última mensagem:
            </Typography>
            <Typography variant="body2" sx={{ 
              fontSize: "0.85rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            }}>
              {ticket.lastMessage.length > 80 
                ? `${ticket.lastMessage.substring(0, 80)}...`
                : ticket.lastMessage
              }
            </Typography>
          </div>
        )}

        {/* Mensagens não lidas */}
        {ticket.unreadMessages > 0 && (
          <div style={{ marginBottom: "8px" }}>
            <Chip 
              size="small" 
              color="error" 
              label={`${ticket.unreadMessages} não lidas`}
              icon={<WarningIcon fontSize="small" />}
            />
          </div>
        )}

        {/* Atendente */}
        {ticket.user && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "8px",
            padding: "4px 8px",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px"
          }}>
            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
            <Typography variant="caption">
              {ticket.user.name}
            </Typography>
          </div>
        )}

        {/* Valor e SKU */}
        {(ticket.value > 0 || ticket.sku) && (
          <div style={{ marginBottom: "8px" }}>
            {ticket.sku && (
              <Typography variant="caption" display="block">
                <strong>SKU:</strong> {ticket.sku}
              </Typography>
            )}
            {ticket.value > 0 && (
              <Typography variant="caption" display="block" color="success.main">
                <strong>Valor:</strong> R$ {ticket.value.toFixed(2).replace(".", ",")}
              </Typography>
            )}
          </div>
        )}

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "4px", 
            marginBottom: "8px" 
          }}>
            {ticket.tags.slice(0, 3).map(tag => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                sx={{
                  backgroundColor: tag.color,
                  color: "white",
                  fontSize: "10px",
                  height: "20px"
                }}
              />
            ))}
            {ticket.tags.length > 3 && (
              <Chip
                label={`+${ticket.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "10px", height: "20px" }}
              />
            )}
          </div>
        )}

        {/* Footer com ações */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "8px",
          marginTop: "8px"
        }}>
          <Typography variant="caption" color="textSecondary">
            {getStatusLabel(ticket.status)} • #{ticket.id}
          </Typography>
          <div style={{ display: "flex", gap: "4px" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleTicketClick(ticket);
              }}
              sx={{ color: "#1976d2" }}
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTicket(ticket);
              }}
              sx={{ color: "#25d366" }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>
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

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    if (sourceLaneId === targetLaneId) return;

    try {
      setLoading(true);
      
      await api.post(`/kanban/tickets/${cardId}/move`, {
        targetLaneId
      });

      toast.success("Ticket movido com sucesso!");
      
      // Recarregar dados
      await fetchKanbanData();
      
    } catch (error) {
      console.error("Erro ao mover ticket:", error);
      toast.error(error.response?.data?.error || "Erro ao mover ticket");
      
      // Recarregar para reverter mudança visual
      await fetchKanbanData();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = (ticket) => {
    if (ticket) {
      history.push(`/tickets/${ticket.uuid}`);
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

        {/* Filtros */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
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

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              placeholder="Pesquisar..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Grid>

          {(user.profile === "admin" || user.profile === "superv") && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ minWidth: "100%" }}>
                  <UsersFilter onFiltered={onFiltered} />
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3} md={1}>
                <DatePickerMoment
                  label="De"
                  getDate={(value) => handleSelectedDate(value, "from")}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={1}>
                <DatePickerMoment
                  label="Até"
                  getDate={(value) => handleSelectedDate(value, "until")}
                />
              </Grid>
            </>
          )}

          <Grid item xs={6} sm={3} md={2}>
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

          <Grid item xs={6} sm={3} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} /> : "Atualizar"}
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
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Board
            data={boardData}
            onCardMoveAcrossLanes={handleCardMove}
            onCardClick={handleCardClick}
            draggable
            style={{
              backgroundColor: "#f5f5f5",
              width: "100%",
              height: "100%",
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
                    {selectedTicket.contact?.name?.charAt(0)}
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
                  {selectedTicket.value > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Valor:</strong> R$ {selectedTicket.value.toFixed(2)}
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