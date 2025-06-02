import React, { useState, useEffect, useContext, useCallback } from "react";
import Board from "react-trello";
import { useHistory } from "react-router-dom";
import {
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
  Modal,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  alpha,
  useTheme
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  WhatsApp as WhatsAppIcon,
  CommentOutlined as CommentIcon,
  Pending as PendingIcon,
  Inbox as InboxIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import { green } from "@mui/material/colors";

import { AuthContext } from "../../context/Auth/AuthContext";
import { UsersFilter } from "./components/UsersFilter";
import { DatePickerMoment } from "../../components/DatePickerMoment";
import BoardSettingsModal from "./components/BoardSettingsModal";
import InfoModal from "./components/InfoModal";
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import usePlans from "../../hooks/usePlans";

import {
  KanbanContainer,
  FilterContainer,
  FilterFields,
  FilterButtons,
  ModalContent,
  BoardStyles,
  EmptyStateContainer
} from "./styles";

const QueueSelect = ({ queues, selectedQueue, onChange }) => (
  <FormControl variant="outlined" size="small" sx={{ width: "100px", minWidth: "100px" }}>
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

const Kanban = () => {
  const history = useHistory();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user } = useContext(AuthContext);
  const { profile } = user;
  const jsonString = user.queues?.map((queue) => queue.id) || [];
  
  // Estados do componente
  const [viewType, setViewType] = useState('active');
  const [statusFilter, setStatusFilter] = useState("all"); // Adicionado para filtrar "open" ou "pending"
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [enableTicketValueAndSku, setEnableTicketValueAndSku] = useState(false);
  const [searchParams, setSearchParams] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState({ from: "", until: "" });
  const [showOpenLane, setShowOpenLane] = useState(true);
  const [showPendingLane, setShowPendingLane] = useState(true);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [makeRequest, setMakeRequest] = useState(null);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [file, setFile] = useState({ lanes: [] });
  const [tabValue, setTabValue] = useState(0);

  const { getPlanCompany } = usePlans();

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
  }, []);

  useEffect(() => {
    const loadQueues = async () => {
      try {
        const { data } = await api.get("/queue");
        const userQueues = user.profile === "admin" 
          ? data 
          : data.filter((queue) => user.queues.some((q) => q.id === queue.id));
        setQueues(userQueues);
      } catch (err) {
        toast.error(err);
      }
    };
    loadQueues();
  }, [user.profile, user.queues]);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const enableTicketValueAndSku = data.find(
          (d) => d.key === "enableTicketValueAndSku"
        );
        if (enableTicketValueAndSku) {
          setEnableTicketValueAndSku(
            enableTicketValueAndSku?.value || "disabled"
          );
        }
      }
    });
  }, []);

  const handleOpenBoardSettings = () => {
    setSettingsModalOpen(true);
  };

  const fetchTags = async () => {
    if (!selectedQueue) return;
    
    try {
      const response = await api.get(`/queue/${selectedQueue}/tags`);
      const responseAll = await api.get("/tags/kanban/?alltags=true");
      const fetchedTags = response.data || [];
      const fetchedAllTags = responseAll.data.lista || [];

      setAllTags(fetchedAllTags);
      setTags(fetchedTags);
      await fetchTickets();
    } catch (error) {
      toast.error(error);
    }
  };

  const fetchTickets = async () => {
    if (!selectedQueue) return;
    
    try {
      const { data } = await api.get("/kanban", {
        params: {
          queueId: selectedQueue,
          searchParam: searchParams,
          users: JSON.stringify(selectedUsers),
          dateFrom: selectedDate.from,
          dateTo: selectedDate.until,
          viewType,
          status: statusFilter === "all" ? undefined : statusFilter
        },
      });
      setTickets(data.tickets);
    } catch (err) {
      toast.error(err);
      setTickets([]);
    }
  };

  const handleViewTypeChange = (event) => {
    setViewType(event.target.checked ? 'closed' : 'active');
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Atualizar filtro de status com base na aba selecionada
    switch(newValue) {
      case 0: // Todos
        setStatusFilter("all");
        break;
      case 1: // Em aberto
        setStatusFilter("open");
        break;
      case 2: // Aguardando
        setStatusFilter("pending");
        break;
      default:
        setStatusFilter("all");
    }
  };

  useEffect(() => {
    if (selectedQueue) {
      fetchTags();
    }
  }, [selectedQueue, selectedUsers, selectedDate, searchParams, makeRequest, viewType, statusFilter]);

  const handleQueueChange = (event) => {
    setSelectedQueue(event.target.value);
  };

  const handleCardClick = (cardId, metadata, laneId) => {
    const selectedTicket = tickets.find(
      (ticket) => ticket.id.toString() === cardId
    );
    setSelectedCard(selectedTicket);
    setCardModalOpen(true);
  };

  const handleCloseCardModal = () => {
    setCardModalOpen(false);
    setSelectedCard(null);
  };

  const handleLaneMove = (removedIndex, addedIndex, payload) => {
    const newLanes = Array.from(file.lanes);
    const [removedLane] = newLanes.splice(removedIndex, 1);
    newLanes.splice(addedIndex, 0, removedLane);
    setFile({ lanes: newLanes });
  };
  
  // Método para aceitar um ticket diretamente pelo Kanban
  const handleAcceptTicket = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}`, {
        status: "open",
        userId: user.id
      });
      
      toast.success("Ticket aceito com sucesso!");
      fetchTickets(); // Recarregar tickets após aceitar
    } catch (err) {
      console.error(err);
      toast.error("Erro ao aceitar o ticket");
    }
  };

  const createCardDescription = (ticket, kanbanTags) => {
    // Filtrar tags que não são do kanban
    const nonKanbanTags = ticket.tags.filter(tag => 
      !kanbanTags.some(kTag => kTag.id === tag.id)
    );

    // Verificar o status do ticket para mostrar botão de aceitar se estiver em pending
    const isPending = ticket.status === "pending";

    return (
      <div style={{ position: "relative" }}>
        <img
          src={ticket.contact.profilePicUrl || "/nopicture.png"}
          alt={ticket.contact.name || ticket.contact.number}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
          }}
        />
        <div style={{ marginLeft: "50px", marginRight: "50px" }}>
          <strong>{ticket.contact.name || ticket.contact.number}</strong>
          <br />
          {ticket.contact.number !== ticket.contact.name && ticket.contact.number}
          <br />
          {ticket.lastMessage}
          <br />
          {enableTicketValueAndSku === "enabled" && (
            <>
              <b>SKU: {ticket.sku || "N/D"}</b> -
              <b>VALOR: R${(Number(ticket.value) || 0).toFixed(2).replace(".", ",")}</b>
            </>
          )}
        </div>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {nonKanbanTags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                sx={{
                  backgroundColor: tag.color || '#eee',
                  color: '#fff',
                  maxWidth: '90px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isPending && (
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation(); // Impedir que o card seja aberto
                  handleAcceptTicket(ticket.id);
                }}
                size="small"
                color="primary"
                sx={{ 
                  ml: 0.5,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                  }
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              edge="end"
              onClick={() => handleCardClick(ticket.id.toString())}
              size="small"
              sx={{ 
                color: "#10a110",
                backgroundColor: alpha('#10a110', 0.1),
                '&:hover': {
                  backgroundColor: alpha('#10a110', 0.2),
                }
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </div>
    );
  };

  const popularCards = async () => {
    if (!selectedQueue) {
      setFile({ lanes: [] });
      return;
    }
  
    try {
      // Separar tickets por status (open e pending)
      const openTickets = tickets.filter(
        ticket => ticket.status === "open" && ticketMatchesSearchQuery(ticket)
      );
      
      const pendingTickets = tickets.filter(
        ticket => ticket.status === "pending" && ticketMatchesSearchQuery(ticket)
      );
  
      const lanes = [];
      
      // Lane para tickets em aberto (sem tag)
      if (showOpenLane) {
        lanes.push({
          id: "open",
          title: (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{
                backgroundColor: theme.palette.success.main,
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "4px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "white"
              }}>
                {i18n.t("Em aberto")}
              </div>
              <div style={{ color: theme.palette.text.secondary, fontSize: "14px" }}>
                {openTickets.filter(t => t.tags.length === 0).length.toString()} tickets
                {enableTicketValueAndSku === "enabled" && (
                  <div>
                    R$ {openTickets
                      .filter(t => t.tags.length === 0)
                      .reduce((acc, ticket) => acc + (Number(ticket.value) || 0), 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </div>
                )}
              </div>
            </div>
          ),
          cards: await Promise.all(
            openTickets
              .filter(ticket => ticket.tags.length === 0)
              .map(async (ticket) => {
                let ticketName = ticket.contact?.name || "Sem nome";
  
                return {
                  id: ticket.id.toString(),
                  label: "Ticket nº " + ticket.id.toString(),
                  description: createCardDescription(ticket, tags),
                  title: ticketName,
                  draggable: true,
                  href: "/tickets/" + ticket.uuid,
                  style: {
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[2],
                    borderLeft: `4px solid ${theme.palette.success.main}`
                  }
                };
              })
          ),
          style: {
            backgroundColor: isDarkMode ? theme.palette.background.default : "white"
          },
        });
      }
      
      // Lane para tickets aguardando (sem tag)
      if (showPendingLane) {
        lanes.push({
          id: "pending",
          title: (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{
                backgroundColor: theme.palette.warning.main,
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "4px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "white"
              }}>
                {i18n.t("Aguardando")}
              </div>
              <div style={{ color: theme.palette.text.secondary, fontSize: "14px" }}>
                {pendingTickets.filter(t => t.tags.length === 0).length.toString()} tickets
                {enableTicketValueAndSku === "enabled" && (
                  <div>
                    R$ {pendingTickets
                      .filter(t => t.tags.length === 0)
                      .reduce((acc, ticket) => acc + (Number(ticket.value) || 0), 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </div>
                )}
              </div>
            </div>
          ),
          cards: await Promise.all(
            pendingTickets
              .filter(ticket => ticket.tags.length === 0)
              .map(async (ticket) => {
                let ticketName = ticket.contact?.name || "Sem nome";
  
                return {
                  id: ticket.id.toString(),
                  label: "Ticket nº " + ticket.id.toString(),
                  description: createCardDescription(ticket, tags),
                  title: ticketName,
                  draggable: false, // Tickets pendentes não podem ser movidos
                  href: "/tickets/" + ticket.uuid,
                  style: {
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[2],
                    borderLeft: `4px solid ${theme.palette.warning.main}`
                  }
                };
              })
          ),
          style: {
            backgroundColor: isDarkMode ? theme.palette.background.default : "white"
          },
        });
      }
      
      // Lanes para tags
      for (const tag of tags) {
        // Tickets com esta tag (apenas os abertos podem ser movidos)
        const tagTickets = tickets.filter(ticket => 
          ticket.tags.some(t => t.id === tag.id) && ticketMatchesSearchQuery(ticket)
        );
        
        // Dividir por status para aplicar propriedade draggable corretamente
        const openTagTickets = tagTickets.filter(t => t.status === "open");
        const pendingTagTickets = tagTickets.filter(t => t.status === "pending");
        
        // Todos os tickets com esta tag
        const allTagTickets = [...openTagTickets, ...pendingTagTickets];
  
        lanes.push({
          id: tag.id.toString(),
          title: (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{
                backgroundColor: tag.color,
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "4px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "white"
              }}>
                {tag.name}
              </div>
              <div style={{ color: theme.palette.text.secondary, fontSize: "14px" }}>
                {allTagTickets.length.toString()} tickets
                {enableTicketValueAndSku === "enabled" && (
                  <div>
                    R$ {allTagTickets
                      .reduce((acc, ticket) => acc + (Number(ticket.value) || 0), 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </div>
                )}
                {!!tag?.actCamp > 0 && (
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>
                    Campanha ativa, envio as 18hrs.
                  </div>
                )}
              </div>
            </div>
          ),
          cards: await Promise.all(
            allTagTickets.map(async (ticket) => {
              let ticketName = ticket.contact?.name || "Sem nome";
  
              return {
                id: ticket.id.toString(),
                label: "Ticket nº " + ticket.id.toString(),
                description: createCardDescription(ticket, tags),
                title: ticketName,
                draggable: ticket.status === "open", // Apenas tickets em aberto podem ser movidos
                href: "/tickets/" + ticket.uuid,
                style: {
                  backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
                  color: theme.palette.text.primary,
                  boxShadow: theme.shadows[2],
                  borderLeft: `4px solid ${tag.color}`
                }
              };
            })
          ),
          style: {
            backgroundColor: isDarkMode ? theme.palette.background.default : "white"
          },
        });
      }
  
      setFile({ lanes });
    } catch (error) {
      console.error('Erro ao popular cards:', error);
      toast.error('Erro ao carregar o quadro Kanban');
    }
  };
  
  
  const toggleOpenLaneVisibility = useCallback(() => {
    setShowOpenLane((prev) => !prev);
  }, []);
  
  const togglePendingLaneVisibility = useCallback(() => {
    setShowPendingLane((prev) => !prev);
  }, []);

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets, searchQuery, showOpenLane, showPendingLane, isDarkMode]);

// Função atualizada para usar as rotas de TicketTag ao invés das rotas de Kanban
const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
  try {
    if (sourceLaneId === targetLaneId) {
      return; // Nada a fazer se mover para a mesma lane
    }
    
    const ticketId = cardId;
    const ticket = tickets.find(t => t.id.toString() === ticketId);
    
    if (!ticket) {
      toast.error("Ticket não encontrado");
      return;
    }
    
    // Verificar se o ticket está com status "open" - apenas tickets em aberto podem ser movidos
    if (ticket.status !== "open") {
      toast.error("Apenas tickets em aberto podem ser movidos entre colunas");
      return;
    }

    // Se estamos movendo de/para "open" ou "pending", precisamos atualizar o status
    if (sourceLaneId === "open" || sourceLaneId === "pending" || targetLaneId === "open" || targetLaneId === "pending") {
      // Determinar o novo status
      let newStatus = ticket.status;
      
      if (targetLaneId === "open") {
        newStatus = "open";
      } else if (targetLaneId === "pending") {
        newStatus = "pending";
      }
      
      // Se o status mudou, atualizar
      if (newStatus !== ticket.status) {
        await api.put(`/tickets/${ticketId}`, {
          status: newStatus,
          userId: newStatus === "open" ? user.id : null
        });
      }
      
      // Se estamos movendo para uma lane de tag, adicionar a tag ao ticket
      if (targetLaneId !== "open" && targetLaneId !== "pending") {
        // Usar a rota de TicketTag ao invés da rota de Kanban
        await api.put(`/ticket-tags/${ticketId}/${targetLaneId}`);
      }
    } else {
      // Estamos movendo entre tags ou removendo tags
      try {
        // Se targetLaneId é uma tag válida, atribuir a tag
        if (targetLaneId !== "0") {
          // Usar a rota de TicketTag ao invés da rota de Kanban
          await api.put(`/ticket-tags/${ticketId}/${targetLaneId}`);
          
          // Verificar e processar campanha se necessário
          await processCampaignOnMove(cardId, sourceLaneId, targetLaneId);
        } else {
          // Remover todas as tags do ticket usando a rota de TicketTag
          await api.delete(`/ticket-tags/${ticketId}`);
        }
      } catch (error) {
        console.error('Erro ao atualizar tag do ticket:', error);
        toast.error('Erro ao mover o ticket. Verifique se você tem permissão para esta operação.');
        return;
      }
    }
    
    // Recarregar tickets após a alteração
    await fetchTickets();
    
  } catch (err) {
    console.error('Erro ao mover ticket:', err);
    const errorMsg = err.response?.data?.error || 'Erro ao mover o ticket entre as colunas';
    toast.error(errorMsg);
  }
};

  const processCampaignOnMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      const targetTicketId = cardId;
      const movedTicket = tickets.find(
        (ticket) => ticket.id.toString() === targetTicketId
      );

      if (!movedTicket || !movedTicket.contact) {
        console.error("Ticket ou contato não encontrado");
        return false;
      }

      const response = await api.get("/schedules", {
        params: { contactId: movedTicket.contact.id },
      });

      const schedules = response.data.schedules;

      // Verificar se a tag de destino é uma tag de campanha
      const targetTag = tags.find(tag => tag.id.toString() === targetLaneId);
      const isCampaignTag = targetTag && targetTag.actCamp === 1;

      if (schedules.length === 0) {
        if (isCampaignTag) {
          await handleEmptySchedules(targetLaneId, movedTicket);
        }
      } else {
        if (isCampaignTag) {
          await handleNonEmptySchedules(targetLaneId, schedules, movedTicket);
        } else if (targetLaneId === "0" || targetLaneId === "open" || targetLaneId === "pending") {
          // Se estamos movendo para uma coluna não-campanha, cancelar agendamentos existentes
          await handleDeleteScheduleForContact(movedTicket.contact.id);
          toast.success(`Campanhas zeradas para ${movedTicket.contact.name}.`);
        }
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleEmptySchedules = async (tagId, movedTicket) => {
    if (tagId !== "0" && tagId !== "open" && tagId !== "pending") {
      toast.success(
        `Campanha nº ${tagId} iniciada para ${movedTicket.contact.name}. Horario de envio as 18h`,
        {
          autoClose: 10000,
        }
      );
      await campanhaInit(movedTicket, tagId);
    } else {
      toast.success(`Campanhas zeradas para ${movedTicket.contact.name}.`, {
        autoClose: 10000,
      });
    }
  };

  const handleNonEmptySchedules = async (
    tagId,
    schedules,
    movedTicket
  ) => {
    const campIdInSchedules = schedules[0].campId;

    if (String(tagId) === String(campIdInSchedules)) {
      toast.success(
        `Campanha nº ${tagId} já está em andamento para ${movedTicket.contact.name}.`,
        {
          autoClose: 10000,
        }
      );
    } else {
      const scheduleIdToDelete = schedules[0].id;

      if (tagId !== "0" && tagId !== "open" && tagId !== "pending") {
        await handleDeleteScheduleAndInit(
          tagId,
          scheduleIdToDelete,
          campIdInSchedules,
          movedTicket
        );
      } else {
        await handleDeleteSchedule(
          tagId,
          scheduleIdToDelete,
          movedTicket
        );
      }
    }
  };

  const handleDeleteScheduleAndInit = async (
    tagId,
    scheduleIdToDelete,
    campIdInSchedules,
    movedTicket
  ) => {
    try {
      await api.delete(`/schedules/${scheduleIdToDelete}`);
      toast.error(
        `Campanha nº ${campIdInSchedules} excluída para ${movedTicket.contact.name}.`,
        {
          autoClose: 10000,
        }
      );
      await campanhaInit(movedTicket, tagId);
      toast.success(
        `Campanha nº ${tagId} iniciada para ${movedTicket.contact.name}. Horario de envio as 18h`,
        {
          autoClose: 10000,
        }
      );
    } catch (deleteError) {
      console.error("Erro ao excluir campanha:", deleteError);
    }
  };

  const handleDeleteSchedule = async (
    tagId,
    scheduleIdToDelete,
    movedTicket
  ) => {
    try {
      await api.delete(`/schedules/${scheduleIdToDelete}`);
      toast.success(`Campanhas zeradas para ${movedTicket.contact.name}.`, {
        autoClose: 10000,
      });
    } catch (deleteError) {
      console.error("Erro ao excluir campanha:", deleteError);
    }
  };

  const handleDeleteScheduleForContact = async (contactId) => {
    try {
      const response = await api.get("/schedules", {
        params: { contactId }
      });
      
      const schedules = response.data.schedules || [];
      
      for (const schedule of schedules) {
        await api.delete(`/schedules/${schedule.id}`);
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir agendamentos:", error);
      return false;
    }
  };

  const campanhaInit = async (ticket, campId) => {
    try {
      const tagResponse = await api.get(`/tags/${campId}`);
      const tagMsg = tagResponse.data.msgR;
      const rptDays = tagResponse.data.rptDays;
      const pathFile = tagResponse.data.mediaPath;
      const nameMedia = tagResponse.data.mediaName;
      
      // Obter instância de WhatsApp ativa
      const { data: whatsapps } = await api.get("/whatsapp/");
      const activeWhatsapp = whatsapps.find(w => w.status === "CONNECTED" && w.isDefault === 1);
      
      if (!activeWhatsapp) {
        toast.error("Nenhuma conexão WhatsApp disponível");
        return;
      }

      const getRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const getToday18hRandom = () => {
        const today18h = new Date();
        today18h.setHours(18);
        today18h.setMinutes(getRandomNumber(1, 30)); // Adiciona minutos aleatórios
        today18h.setSeconds(getRandomNumber(1, 60)); // Adiciona segundos aleatórios
        return today18h;
      };

      // Obter a data de hoje às 18:00 com minutos e segundos aleatórios
      const campDay = getToday18hRandom();

      const currentTime = new Date();
      if (currentTime.getHours() >= 18) {
        // Se já passou das 18:00, definir o horário para amanhã
        campDay.setDate(campDay.getDate() + 1);
      }

      const scheduleData = {
        body: tagMsg,
        sendAt: campDay,
        contactId: ticket.contact.id,
        userId: user.id,
        whatsappId: activeWhatsapp.id,
        daysR: rptDays,
        campId: campId,
        mediaPath: pathFile,
        mediaName: nameMedia,
      };

      try {
        const response = await api.post("/schedules", scheduleData);

        if (response.status === 200) {
          console.log("Agendamento criado com sucesso:", response.data);
          return true;
        } else {
          console.error("Erro ao criar agendamento:", response.data);
          return false;
        }
      } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        return false;
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return false;
    }
  };

  const ticketMatchesSearchQuery = (ticket) => {
    if (searchQuery.trim() === "") {
      if (selectedUsers.length > 0) {
        return !ticket.user?.id || selectedUsers.includes(ticket.user.id);
      }
      return true;
    }

    const query = searchQuery.toLowerCase();
    var match =
      ticket.contact.number.toLowerCase().includes(query) ||
      (ticket.lastMessage &&
        ticket.lastMessage.toLowerCase().includes(query)) ||
      ticket.contact?.name?.toLowerCase().includes(query) ||
      ticket.value?.includes(query) ||
      ticket.sku?.includes(query);

    if (selectedUsers.length > 0) {
      return match && selectedUsers.includes(ticket.userId);
    }

    return match;
  };

  const handleSelectedDate = (value, range) => {
    setSelectedDate({ ...selectedDate, [range]: value });
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const onFiltered = (value) => {
    setSelectedUsers(value);
  };

  return (
    <KanbanContainer>
      <FilterContainer>
        <FilterFields>
          <QueueSelect 
            queues={queues}
            selectedQueue={selectedQueue}
            onChange={handleQueueChange}
          />
          
          <TextField
            placeholder="Pesquisar..."
            size="small"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            fullWidth
            variant="outlined"
            sx={{ flex: '1 1 200px' }}
          />
          
          {(profile === "admin" || profile === "superv") && (
            <>
              <Box sx={{ width: '200px' }}>
                <UsersFilter onFiltered={onFiltered} />
              </Box>
              <Box sx={{ display: 'flex', gap: '5px' }}>
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
            label={viewType === 'closed' ? "Tickets Fechados" : "Tickets Ativos"}
          />
          
          <FilterButtons>
            <Tooltip title="Configurações do Kanban">
              <IconButton
                onClick={handleOpenBoardSettings}
                size="medium"
              >
                <SettingsIcon sx={{ color: green[500] }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={showOpenLane ? "Ocultar coluna Em Aberto" : "Mostrar coluna Em Aberto"}>
              <IconButton
                onClick={toggleOpenLaneVisibility}
                size="medium"
              >
                {showOpenLane ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={showPendingLane ? "Ocultar coluna Aguardando" : "Mostrar coluna Aguardando"}>
              <IconButton
                onClick={togglePendingLaneVisibility}
                size="medium"
                sx={{ ml: 1 }}
              >
                {showPendingLane ? <VisibilityOffIcon color="warning" /> : <VisibilityIcon color="warning" />}
              </IconButton>
            </Tooltip>
            <InfoModal />
          </FilterButtons>
        </FilterFields>
        
        {/* Tabs para filtrar status */}
        {viewType === 'active' && selectedQueue && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
              <Tab 
                icon={<InboxIcon />} 
                label="Todos" 
                iconPosition="start"
              />
              <Tab 
                icon={<CommentIcon />} 
                label="Em Aberto" 
                iconPosition="start"
              />
              <Tab 
                icon={<PendingIcon />} 
                label="Aguardando" 
                iconPosition="start"
              />
            </Tabs>
          </Box>
        )}
      </FilterContainer>

      {selectedQueue ? (
        <BoardStyles.Container>
          <Board
            data={file}
            onCardMoveAcrossLanes={handleCardMove}
            onLaneDragEnd={handleLaneMove}
            onCardClick={handleCardClick}
            draggable
            style={{
              backgroundColor: isDarkMode ? theme.palette.background.default : "rgba(252, 252, 252, 0.03)",
              width: "100%",
              height: "calc(100vh - 200px)",
              color: theme.palette.text.primary
            }}
            laneStyle={{
              backgroundColor: isDarkMode ? theme.palette.background.default : "white",
              color: theme.palette.text.primary
            }}
            cardStyle={{
              backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
              color: theme.palette.text.primary,
              margin: "10px 0"
            }}
          />
        </BoardStyles.Container>
      ) : (
        <EmptyStateContainer>
          <SettingsIcon sx={{ fontSize: 64, color: theme.palette.action.disabled }} />
          <Typography variant="h6" color="textSecondary">
            Selecione um setor para visualizar o quadro Kanban
          </Typography>
        </EmptyStateContainer>
      )}

      <Modal
        open={cardModalOpen}
        onClose={handleCloseCardModal}
        aria-labelledby="ticket-modal-title"
        aria-describedby="ticket-modal-description"
      >
        <ModalContent sx={{ bgcolor: theme.palette.background.paper }}>
          {selectedCard && (
            <>
              <Typography variant="h6" component="h2" id="ticket-modal-title">
                Ticket #{selectedCard.id}
              </Typography>
              <Typography sx={{ mt: 2 }} id="ticket-modal-description">
                <strong>
                  {selectedCard.contact.name || selectedCard.contact.number}
                </strong>
                <br />
                {selectedCard.lastMessage}
                <br />
                {enableTicketValueAndSku === "enabled" && (
                  <>
                    <b>SKU: {selectedCard.sku || "N/D"}</b> -
                    <b>
                      VALOR: R$
                      {(Number(selectedCard.value) || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </b>
                  </>
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => {
                    history.push(`/tickets/${selectedCard.uuid}`);
                    handleCloseCardModal();
                  }}
                >
                  Abrir Conversa
                </Button>
                
                {selectedCard.status === "pending" && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => {
                      handleAcceptTicket(selectedCard.id);
                      handleCloseCardModal();
                    }}
                  >
                    Aceitar Ticket
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<CloseIcon />}
                  onClick={handleCloseCardModal}
                >
                  Fechar
                </Button>
              </Box>
            </>
          )}
        </ModalContent>
      </Modal>

      {settingsModalOpen && (
        <BoardSettingsModal
          open={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          setMakeRequest={setMakeRequest}
        />
      )}
    </KanbanContainer>
  );
};

export default Kanban;