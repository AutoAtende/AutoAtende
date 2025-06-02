import React, { useState, useEffect, useContext, useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import { DatePickerMoment } from "../../components/DatePickerMoment";
import { UsersFilter } from "../../components/UsersFilter";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonIcon from "@mui/icons-material/Person";
import { FormControlLabel, Switch, Chip, Avatar, CircularProgress } from "@mui/material";

import "./style.css";
import {
  KanbanFilterContainer,
  KanbanFilterSectionButtons,
  KanbanFilterSectionFields,
} from "./styles";
import BoardSettingsModal from "../../components/kanbanModal";
import InstructionsModal from "./info";
import { green } from "@mui/material/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  formControl: {
    width: "180px",
    marginRight: theme.spacing(1),
  },
  datePickerContainer: {
    display: "flex",
    gap: "8px",
    "& > *": {
      width: "150px",
    }
  },
  searchField: {
    flex: "1 1 200px",
    marginRight: theme.spacing(1),
  },
  userSelect: {
    width: "180px",
    marginRight: theme.spacing(1),
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    padding: theme.spacing(1),
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    maxWidth: "90vw",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
    borderRadius: "8px",
    maxHeight: "90vh",
    overflow: "auto",
  }
}));

const QueueSelect = ({ queues, selectedQueue, onChange }) => {
  const classes = useStyles();

  return (
    <FormControl variant="outlined" className={classes.formControl} size="small">
      <InputLabel>Setor</InputLabel>
      <Select
        value={selectedQueue || ''}
        onChange={onChange}
        label="Setor"
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
  );
};

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { profile } = user;
  
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [lanes, setLanes] = useState([]);
  const [viewType, setViewType] = useState('active');
  const [enableTicketValueAndSku, setEnableTicketValueAndSku] = useState(false);
  const [searchParams, setSearchParams] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    from: "",
    until: "",
  });
  const [showLaneZero, setShowLaneZero] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [makeRequest, setMakeRequest] = useState(null);

  const [file, setFile] = useState({
    lanes: [],
  });

  const { getPlanCompany } = usePlans();

  // Verificar permissões
  useEffect(() => {
    async function fetchData() {
      const companyId = user?.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useKanban) {
        toast.error(i18n.t("kanban.messages.accessDenied"));
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
  }, [user, getPlanCompany, history]);

  // Carregar filas
  useEffect(() => {
    const loadQueues = async () => {
      try {
        const { data } = await api.get("/queue");
        const userQueues = user.profile === "admin" 
          ? data 
          : data.filter((queue) => user.queues.some((q) => q.id === queue.id));
        setQueues(userQueues);
      } catch (err) {
        console.error("Erro ao carregar filas:", err);
        toast.error("Erro ao carregar setores");
      }
    };
    
    if (user?.id) {
      loadQueues();
    }
  }, [user]);

  // Carregar configurações
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        if (Array.isArray(data)) {
          const enableSetting = data.find(d => d.key === "enableTicketValueAndSku");
          if (enableSetting) {
            setEnableTicketValueAndSku(enableSetting.value === "enabled");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      }
    };
    
    loadSettings();
  }, []);

  // Buscar dados do Kanban
  const fetchKanbanData = useCallback(async () => {
    if (!selectedQueue) {
      setFile({ lanes: [] });
      return;
    }
    
    try {
      setLoading(true);
      
      const params = {
        queueId: selectedQueue,
        searchParam: searchParams || undefined,
        users: selectedUsers.length > 0 ? JSON.stringify(selectedUsers) : undefined,
        dateFrom: selectedDate.from || undefined,
        dateTo: selectedDate.until || undefined,
        viewType
      };

      // Remover parâmetros undefined
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

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
  }, [selectedQueue, searchParams, selectedUsers, selectedDate, viewType]);

  // Atualizar quando filtros mudarem
  useEffect(() => {
    if (selectedQueue) {
      fetchKanbanData();
    }
  }, [fetchKanbanData, makeRequest]);

  // Formatar dados para o Board
  const popularCards = useCallback(() => {
    if (!lanes.length) {
      setFile({ lanes: [] });
      return;
    }

    const formattedLanes = lanes
      .filter(lane => {
        if (!showLaneZero && lane.id === 'no-tags') {
          return false;
        }
        return true;
      })
      .map(lane => {
        const laneTickets = lane.tickets || [];
        const totalValue = laneTickets.reduce((sum, ticket) => sum + (Number(ticket.value) || 0), 0);

        return {
          id: lane.id,
          title: (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{
                backgroundColor: lane.color,
                padding: "12px",
                marginBottom: "8px",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "white",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
              }}>
                {lane.name}
              </div>
              <div style={{ color: "#666", fontSize: "13px", fontWeight: "500" }}>
                {laneTickets.length} ticket{laneTickets.length !== 1 ? 's' : ''}
                {enableTicketValueAndSku && totalValue > 0 && (
                  <div style={{ color: "#2e7d32", fontWeight: "bold", marginTop: "4px" }}>
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
            href: `/tickets/${ticket.uuid}`,
            metadata: { ticket }
          })),
          style: {
            backgroundColor: "#f8f9fa",
            width: 300,
            minHeight: 120
          }
        };
      });

    setFile({ lanes: formattedLanes });
  }, [lanes, enableTicketValueAndSku, showLaneZero]);

  // Criar descrição do card
  const createCardDescription = (ticket) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return '#ff9800';
        case 'open': return '#2196f3';
        case 'closed': return '#4caf50';
        default: return '#757575';
      }
    };

    const getStatusLabel = (status) => {
      switch (status) {
        case 'pending': return 'Pendente';
        case 'open': return 'Em Atendimento';
        case 'closed': return 'Fechado';
        default: return status;
      }
    };

    return (
      <div style={{ 
        position: "relative", 
        padding: "8px",
        backgroundColor: "white",
        borderRadius: "6px",
        border: "1px solid #e0e0e0"
      }}>
        {/* Header com foto e nome */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "10px",
          paddingBottom: "8px",
          borderBottom: "1px solid #f0f0f0"
        }}>
          <Avatar
            src={ticket.contact?.profilePicUrl}
            alt={ticket.contact?.name}
            sx={{ 
              width: 36, 
              height: 36, 
              mr: 1.5,
              border: "2px solid #e0e0e0"
            }}
          >
            {ticket.contact?.name?.charAt(0)?.toUpperCase() || 
             ticket.contact?.number?.charAt(0) || '?'}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              fontWeight="bold" 
              sx={{ 
                fontSize: "14px",
                lineHeight: "1.2",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {ticket.contact?.name || ticket.contact?.number || 'Sem nome'}
            </Typography>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ 
                fontSize: "11px",
                lineHeight: "1.2",
                display: "block"
              }}
            >
              {ticket.contact?.number}
            </Typography>
          </div>
        </div>
        
        {/* Última mensagem */}
        {ticket.lastMessage && (
          <div style={{ marginBottom: "10px" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: "12px",
                lineHeight: "1.3",
                color: "#555",
                fontStyle: "italic",
                backgroundColor: "#f5f5f5",
                padding: "6px 8px",
                borderRadius: "4px",
                borderLeft: "3px solid #2196f3"
              }}
            >
              {ticket.lastMessage.length > 80 
                ? `${ticket.lastMessage.substring(0, 80)}...`
                : ticket.lastMessage
              }
            </Typography>
          </div>
        )}

        {/* Informações do atendente */}
        {ticket.user && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "8px",
            padding: "4px 6px",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px"
          }}>
            <PersonIcon sx={{ fontSize: 14, mr: 0.5, color: "#1976d2" }} />
            <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: "500" }}>
              {ticket.user.name}
            </Typography>
          </div>
        )}

        {/* Valor e SKU */}
        {enableTicketValueAndSku && (ticket.value > 0 || ticket.sku) && (
          <div style={{ 
            marginBottom: "8px",
            padding: "6px",
            backgroundColor: "#e8f5e8",
            borderRadius: "4px",
            border: "1px solid #c8e6c9"
          }}>
            {ticket.sku && (
              <Typography variant="caption" display="block" sx={{ fontSize: "11px" }}>
                <strong>SKU:</strong> {ticket.sku}
              </Typography>
            )}
            {ticket.value > 0 && (
              <Typography variant="caption" display="block" sx={{ fontSize: "11px", color: "#2e7d32", fontWeight: "bold" }}>
                <strong>R$ {Number(ticket.value).toFixed(2).replace(".", ",")}</strong>
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
                  backgroundColor: tag.color || "#2196f3",
                  color: "white",
                  fontSize: "9px",
                  height: "18px",
                  "& .MuiChip-label": {
                    padding: "0 4px"
                  }
                }}
              />
            ))}
            {ticket.tags.length > 3 && (
              <Chip
                label={`+${ticket.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: "9px", 
                  height: "18px",
                  "& .MuiChip-label": {
                    padding: "0 4px"
                  }
                }}
              />
            )}
          </div>
        )}

        {/* Footer com status e botão WhatsApp */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          paddingTop: "8px",
          borderTop: "1px solid #f0f0f0"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div 
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: getStatusColor(ticket.status),
                marginRight: "6px"
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: "10px",
                color: "#666",
                fontWeight: "500"
              }}
            >
              {getStatusLabel(ticket.status)}
            </Typography>
          </div>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleTicketClick(ticket);
            }}
            sx={{ 
              color: "#25d366",
              backgroundColor: "#f0f8f0",
              "&:hover": {
                backgroundColor: "#e8f5e8"
              },
              width: "28px",
              height: "28px"
            }}
          >
            <WhatsAppIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </div>
      </div>
    );
  };

  useEffect(() => {
    popularCards();
  }, [popularCards]);

  // Handlers
  const handleOpenBoardSettings = () => {
    setSettingsModalOpen(true);
  };

  const handleQueueChange = (event) => {
    setSelectedQueue(event.target.value);
  };

  const handleViewTypeChange = (event) => {
    setViewType(event.target.checked ? 'closed' : 'active');
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
      await fetchKanbanData();
      
    } catch (error) {
      console.error("Erro ao mover ticket:", error);
      toast.error("Erro ao mover ticket");
      await fetchKanbanData();
    }
  };

  const handleOpenTicket = () => {
    if (selectedTicket) {
      history.push(`/tickets/${selectedTicket.uuid}`);
    }
  };

  const handleCloseTicketModal = () => {
    setTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const toggleLaneZeroVisibility = useCallback(() => {
    setShowLaneZero((prev) => !prev);
  }, []);

  const handleSelectedDate = (value, range) => {
    setSelectedDate(prev => ({ ...prev, [range]: value }));
  };

  const handleSearchQueryChange = (e) => {
    setSearchParams(e.target.value);
  };

  const onFiltered = (value) => {
    const users = value.map((t) => t.id);
    setSelectedUsers(users);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Paper style={{ margin: "8px" }}>
        <KanbanFilterContainer>
          <KanbanFilterSectionFields>
            <div className={classes.filterContainer}>
              <QueueSelect 
                queues={queues}
                selectedQueue={selectedQueue}
                onChange={handleQueueChange}
              />
              
              <TextField
                placeholder="Pesquisar tickets..."
                size="small"
                value={searchParams}
                onChange={handleSearchQueryChange}
                className={classes.searchField}
                variant="outlined"
              />
              
              {(profile === "admin" || profile === "superv") && (
                <>
                  <div className={classes.userSelect}>
                    <UsersFilter onFiltered={onFiltered} />
                  </div>
                  
                  <div className={classes.datePickerContainer}>
                    <DatePickerMoment
                      label="De"
                      getDate={(value) => handleSelectedDate(value, "from")}
                    />
                    <DatePickerMoment
                      label="Até"
                      getDate={(value) => handleSelectedDate(value, "until")}
                    />
                  </div>
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
                style={{ marginLeft: "8px" }}
              />
            </div>
            
            <KanbanFilterSectionButtons>
              <IconButton
                color="primary"
                onClick={handleOpenBoardSettings}
                size="medium"
                title="Configurações"
              >
                <SettingsIcon sx={{ color: green[500] }} />
              </IconButton>
              <IconButton
                color="primary"
                onClick={toggleLaneZeroVisibility}
                size="medium"
                title={showLaneZero ? "Ocultar 'Em Aberto'" : "Mostrar 'Em Aberto'"}
              >
                {showLaneZero ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
              <InstructionsModal />
            </KanbanFilterSectionButtons>
          </KanbanFilterSectionFields>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Carregando tickets...
              </Typography>
            </Box>
          )}
        </KanbanFilterContainer>
      </Paper>

      {settingsModalOpen && (
        <BoardSettingsModal
          open={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          setMakeRequest={setMakeRequest}
        />
      )}

      <div style={{ flex: 1, overflow: "hidden", margin: "0 8px 8px 8px" }}>
        {selectedQueue ? (
          <Board
            data={file}
            onCardMoveAcrossLanes={handleCardMove}
            onCardClick={handleCardClick}
            draggable
            style={{
              backgroundColor: "rgba(248, 249, 250, 0.8)",
              width: "100%",
              height: "100%",
              borderRadius: "8px"
            }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#666",
              fontSize: "16px",
              flexDirection: "column",
              gap: "16px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px"
            }}
          >
            <SettingsIcon sx={{ fontSize: 64, color: "#ccc" }} />
            <Typography variant="h5" color="textSecondary" fontWeight="300">
              Selecione um setor para visualizar o Kanban
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Escolha um setor na lista acima para começar a visualizar e gerenciar seus tickets
            </Typography>
          </Box>
        )}
      </div>

      {/* Modal de detalhes do ticket */}
      <Modal
        open={ticketModalOpen}
        onClose={handleCloseTicketModal}
        aria-labelledby="ticket-modal-title"
      >
        <Box className={classes.modal}>
          {selectedTicket && (
            <>
              <Typography 
                id="ticket-modal-title" 
                variant="h5" 
                component="h2" 
                sx={{ mb: 3, fontWeight: "600", color: "#1976d2" }}
              >
                Ticket #{selectedTicket.id}
              </Typography>
              
              {/* Informações do contato */}
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0"
              }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar
                    src={selectedTicket.contact?.profilePicUrl}
                    alt={selectedTicket.contact?.name}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {selectedTicket.contact?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedTicket.contact?.name || "Nome não informado"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedTicket.contact?.number}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Última mensagem */}
              {selectedTicket.lastMessage && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Última mensagem:
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                    borderLeft: "4px solid #2196f3"
                  }}>
                    <Typography variant="body2">
                      {selectedTicket.lastMessage}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Informações do ticket */}
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 3
              }}>
                {/* Atendente */}
                {selectedTicket.user && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                      Atendente:
                    </Typography>
                    <Typography variant="body1">
                      {selectedTicket.user.name}
                    </Typography>
                  </Box>
                )}

                {/* Status */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Status:
                  </Typography>
                  <Chip 
                    label={
                      selectedTicket.status === 'pending' ? 'Pendente' :
                      selectedTicket.status === 'open' ? 'Em Atendimento' :
                      selectedTicket.status === 'closed' ? 'Fechado' :
                      selectedTicket.status
                    }
                    color={
                      selectedTicket.status === 'pending' ? 'warning' :
                      selectedTicket.status === 'open' ? 'info' :
                      selectedTicket.status === 'closed' ? 'success' :
                      'default'
                    }
                    size="small"
                  />
                </Box>

                {/* Fila */}
                {selectedTicket.queue && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                      Setor:
                    </Typography>
                    <Typography variant="body1">
                      {selectedTicket.queue.name}
                    </Typography>
                  </Box>
                )}

                {/* Data de criação */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Criado em:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
              </Box>

              {/* Valor e SKU */}
              {enableTicketValueAndSku && (selectedTicket.value > 0 || selectedTicket.sku) && (
                <Box sx={{ 
                  mb: 3,
                  p: 2,
                  backgroundColor: "#e8f5e8",
                  borderRadius: "8px",
                  border: "1px solid #c8e6c9"
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: "#2e7d32" }}>
                    Informações Comerciais:
                  </Typography>
                  {selectedTicket.sku && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>SKU:</strong> {selectedTicket.sku}
                    </Typography>
                  )}
                  {selectedTicket.value > 0 && (
                    <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: "bold" }}>
                      <strong>Valor: R$ {Number(selectedTicket.value).toFixed(2).replace(".", ",")}</strong>
                    </Typography>
                  )}
                </Box>
              )}

              {/* Tags */}
              {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Tags:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedTicket.tags.map(tag => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        sx={{ 
                          backgroundColor: tag.color || "#2196f3", 
                          color: "white",
                          fontWeight: "500"
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Botões de ação */}
              <Box sx={{ 
                display: "flex", 
                gap: 2, 
                justifyContent: "flex-end", 
                mt: 4,
                pt: 2,
                borderTop: "1px solid #e0e0e0"
              }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseTicketModal}
                  sx={{ minWidth: "100px" }}
                >
                  Fechar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleOpenTicket}
                  sx={{ 
                    minWidth: "140px",
                    backgroundColor: "#25d366",
                    "&:hover": {
                      backgroundColor: "#128c7e"
                    }
                  }}
                >
                  Abrir Conversa
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Kanban;