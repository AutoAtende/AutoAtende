import React, { useState, useEffect, useContext, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import useSettings from "../../hooks/useSettings";
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
  CircularProgress
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon
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
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const KanbanTicketsView = () => {
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [lanes, setLanes] = useState([]);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [viewType, setViewType] = useState('active');
  const { settings, updateSetting } = useSettings();
  const enableValueAndSku = settings.find(s => s.key === "enableTicketValueAndSku")?.value === "enabled";
  
  // Estados de filtro
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    from: "",
    until: "",
  });
  const [showLaneZero, setShowLaneZero] = useState(true);
  
  // Estados de modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  
  // Board data
  const [boardData, setBoardData] = useState({ lanes: [] });

  // Carregar configurações iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    if (selectedQueue) {
      fetchKanbanData();
    }
  }, [selectedQueue, selectedUsers, selectedDate, searchQuery, viewType]);

  // Atualizar board quando dados mudarem
  useEffect(() => {
    formatBoardData();
  }, [tickets, lanes, showLaneZero, enableValueAndSku]);

  const loadInitialData = async () => {
    try {
      // Carregar filas
      const { data: queueData } = await api.get("/queue");
      const userQueues = user.profile === "admin" 
        ? queueData 
        : queueData.filter((queue) => user.queues.some((q) => q.id === queue.id));
      setQueues(userQueues);

      // As configurações são carregadas automaticamente pelo hook useSettings
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast.error("Erro ao carregar dados iniciais");
    }
  };

  const fetchKanbanData = async () => {
    if (!selectedQueue) return;
    
    try {
      setLoading(true);
      
      const params = {
        queueId: selectedQueue,
        searchParam: searchQuery,
        users: JSON.stringify(selectedUsers),
        dateFrom: selectedDate.from,
        dateTo: selectedDate.until,
        viewType
      };

      const { data } = await api.get("/kanban", { params });
      
      setTickets(data.tickets || []);
      setLanes(data.lanes || []);
      
    } catch (error) {
      console.error("Erro ao buscar dados do Kanban:", error);
      toast.error("Erro ao carregar dados do Kanban");
      setTickets([]);
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

    const formattedLanes = lanes
      .filter(lane => {
        // Se showLaneZero for false, ocultar lane "Em Aberto"
        if (!showLaneZero && lane.id === 'no-tags') {
          return false;
        }
        return true;
      })
      .map(lane => {
        const laneTickets = lane.tickets || [];
        const totalValue = laneTickets.reduce((sum, ticket) => sum + (ticket.value || 0), 0);

        return {
          id: lane.id,
          title: (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{
                backgroundColor: lane.color,
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "4px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "white"
              }}>
                {lane.name}
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>
                {laneTickets.length} tickets
                {enableValueAndSku && (
                  <div>
                    R$ {totalValue.toFixed(2).replace(".", ",")}
                  </div>
                )}
              </div>
            </div>
          ),
          cards: laneTickets.map(ticket => ({
            id: ticket.id.toString(),
            title: ticket.name || `Ticket #${ticket.id}`,
            description: createCardDescription(ticket),
            draggable: true,
            metadata: {
              ticket: ticket
            }
          })),
          style: {
            backgroundColor: "white",
            width: 280
          }
        };
      });

    setBoardData({ lanes: formattedLanes });
  };

  const createCardDescription = (ticket) => {
    return (
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <Avatar
            src={ticket.contact?.profilePicUrl}
            alt={ticket.contact?.name}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {ticket.contact?.name?.charAt(0)}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {ticket.contact?.name || ticket.contact?.number}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {ticket.contact?.number}
            </Typography>
          </div>
        </div>
        
        {ticket.lastMessage && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            {ticket.lastMessage.length > 50 
              ? `${ticket.lastMessage.substring(0, 50)}...`
              : ticket.lastMessage
            }
          </Typography>
        )}

        {ticket.user && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
            <Typography variant="caption">
              {ticket.user.name}
            </Typography>
          </div>
        )}

        {enableValueAndSku && (ticket.value > 0 || ticket.sku) && (
          <div style={{ marginBottom: "8px" }}>
            {ticket.sku && (
              <Typography variant="caption" display="block">
                <strong>SKU:</strong> {ticket.sku}
              </Typography>
            )}
            {ticket.value > 0 && (
              <Typography variant="caption" display="block">
                <strong>Valor:</strong> R$ {ticket.value.toFixed(2).replace(".", ",")}
              </Typography>
            )}
          </div>
        )}

        {ticket.tags && ticket.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
            {ticket.tags.slice(0, 2).map(tag => (
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
            {ticket.tags.length > 2 && (
              <Chip
                label={`+${ticket.tags.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "10px", height: "20px" }}
              />
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="textSecondary">
            Status: {getStatusLabel(ticket.status)}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleTicketClick(ticket);
            }}
            sx={{ color: "#25d366" }}
          >
            <WhatsAppIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    );
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'open': 'Em Atendimento',
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
      await api.post(`/kanban/tickets/${cardId}/move`, {
        targetLaneId
      });

      toast.success("Ticket movido com sucesso!");
      
      // Recarregar dados
      await fetchKanbanData();
      
    } catch (error) {
      console.error("Erro ao mover ticket:", error);
      toast.error("Erro ao mover ticket");
      
      // Recarregar para reverter mudança visual
      await fetchKanbanData();
    }
  };

  const handleOpenTicket = () => {
    if (selectedTicket) {
      history.push(`/tickets/${selectedTicket.uuid}`);
    }
  };

  const handleCloseModal = () => {
    setTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleToggleValueAndSku = async (event) => {
    try {
      await updateSetting("enableTicketValueAndSku", event.target.checked ? "enabled" : "disabled");
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      toast.error("Erro ao atualizar configuração");
    }
  };

  const handleViewTypeChange = (event) => {
    setViewType(event.target.checked ? 'closed' : 'active');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectedDate = (value, range) => {
    setSelectedDate(prev => ({ ...prev, [range]: value }));
  };

  const onFiltered = (value) => {
    const users = value.map(t => t.id);
    setSelectedUsers(users);
  };

  const toggleLaneZeroVisibility = () => {
    setShowLaneZero(prev => !prev);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header com filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 2, 
          flexWrap: "wrap",
          mb: 2 
        }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Setor</InputLabel>
            <Select
              value={selectedQueue || ''}
              onChange={handleQueueChange}
              label="Setor"
              size="small"
            >
              <MenuItem value="">
                <em>Selecione um setor</em>
              </MenuItem>
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            placeholder="Pesquisar..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ minWidth: 200 }}
          />

          {(user.profile === "admin" || user.profile === "superv") && (
            <>
              <Box sx={{ minWidth: 200 }}>
                <UsersFilter onFiltered={onFiltered} />
              </Box>
              
              <Box sx={{ display: "flex", gap: 1 }}>
                <DatePickerMoment
                  label="De"
                  getDate={(value) => handleSelectedDate(value, "from")}
                />
                <DatePickerMoment
                  label="Até"
                  getDate={(value) => handleSelectedDate(value, "until")}
                />
              </Box>
            </>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={viewType === 'closed'}
                onChange={handleViewTypeChange}
                color="primary"
              />
            }
            label={viewType === 'closed' ? "Fechados" : "Ativos"}
          />

          <IconButton
            onClick={toggleLaneZeroVisibility}
            color={showLaneZero ? "primary" : "default"}
            title={showLaneZero ? "Ocultar 'Em Aberto'" : "Mostrar 'Em Aberto'"}
          >
            {showLaneZero ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      {/* Kanban Board */}
      {selectedQueue ? (
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Board
            data={boardData}
            onCardMoveAcrossLanes={handleCardMove}
            onCardClick={handleCardClick}
            draggable
            style={{
              backgroundColor: "rgba(252, 252, 252, 0.03)",
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 200px)",
            color: "#666",
            fontSize: "16px",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <SettingsIcon sx={{ fontSize: 48, color: "#ccc" }} />
          <Typography variant="h6" color="textSecondary">
            Selecione um setor para visualizar o quadro Kanban
          </Typography>
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
              <Typography id="ticket-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                Ticket #{selectedTicket.id}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedTicket.contact?.name || selectedTicket.contact?.number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedTicket.contact?.number}
                </Typography>
              </Box>

              {selectedTicket.lastMessage && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Última mensagem:</strong> {selectedTicket.lastMessage}
                  </Typography>
                </Box>
              )}

              {selectedTicket.user && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Atendente:</strong> {selectedTicket.user.name}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Status:</strong> {getStatusLabel(selectedTicket.status)}
                </Typography>
              </Box>

              {enableValueAndSku && (selectedTicket.value > 0 || selectedTicket.sku) && (
                <Box sx={{ mb: 2 }}>
                  {selectedTicket.sku && (
                    <Typography variant="body2">
                      <strong>SKU:</strong> {selectedTicket.sku}
                    </Typography>
                  )}
                  {selectedTicket.value > 0 && (
                    <Typography variant="body2">
                      <strong>Valor:</strong> R$ {selectedTicket.value.toFixed(2).replace(".", ",")}
                    </Typography>
                  )}
                </Box>
              )}

              {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tags:</strong>
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
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 3 }}>
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
                  onClick={handleOpenTicket}
                >
                  Abrir Conversa
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default KanbanTicketsView;