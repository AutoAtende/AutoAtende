import React, { useState, useEffect, useReducer, useContext, useMemo, useCallback } from "react";
import { useSpring, animated } from 'react-spring';
import { toast } from "../../helpers/toast";
import { makeStyles } from '@mui/styles';
import {
  Paper,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  Badge,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Skeleton,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Visibility as VisibilityIcon,
  AccessTime as ClockIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  WhatsApp as WhatsAppIcon,
  Today as TodayIcon
} from "@mui/icons-material";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ScheduleModal from "./components/ScheduleModal";
import ScheduleDetailsModal from "./components/ScheduleDetailsModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import "moment/locale/pt-br";

// Configurações do calendário
const localizer = momentLocalizer(moment);

// Mensagens traduzidas para o calendário
const calendarMessages = {
  date: i18n.t("schedules.calendar.date"),
  time: i18n.t("schedules.calendar.time"),
  event: i18n.t("schedules.calendar.event"),
  allDay: i18n.t("schedules.calendar.allDay"),
  week: i18n.t("schedules.calendar.week"),
  work_week: i18n.t("schedules.calendar.work_week"),
  day: i18n.t("schedules.calendar.day"),
  month: i18n.t("schedules.calendar.month"),
  previous: i18n.t("schedules.calendar.previous"),
  next: i18n.t("schedules.calendar.next"),
  yesterday: i18n.t("schedules.calendar.yesterday"),
  tomorrow: i18n.t("schedules.calendar.tomorrow"),
  today: i18n.t("schedules.calendar.today"),
  agenda: i18n.t("schedules.calendar.agenda"),
  noEventsInRange: i18n.t("schedules.calendar.noEventsInRange"),
  showMore: function showMore(total) {
    return "+" + total + " mais";
  }
};

// Reducer para gerenciar os agendamentos
const scheduleReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_SCHEDULES":
      return [...action.payload];
    case "ADD_SCHEDULES":
      return [...state, ...action.payload];
    case "UPDATE_SCHEDULE":
      return state.map(schedule => 
        schedule.id === action.payload.id ? action.payload : schedule
      );
    case "DELETE_SCHEDULE":
      return state.filter(schedule => schedule.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

// Estilos personalizados
const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    position: "relative",
  },
  searchInput: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  calendarContainer: {
    "& .rbc-event": {
      backgroundColor: "transparent",
      border: "none",
      padding: 0,
    },
    "& .rbc-day-bg.rbc-today": {
      backgroundColor: theme.palette.primary.light + "30",
    },
    "& .rbc-toolbar button": {
      borderRadius: theme.shape.borderRadius,
    },
    "& .rbc-toolbar button.rbc-active": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    "& .rbc-toolbar-label": {
      fontSize: "1rem",
      fontWeight: 500,
    },
    "& .rbc-header": {
      padding: "8px 3px",
    },
    "& .rbc-button-link": {
      padding: "4px",
    }
  },
  tabItem: {
    minWidth: 80,
    '@media (max-width: 600px)': {
      minWidth: 0,
      padding: '6px 8px',
    },
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
      '@media (max-width: 600px)': {
        marginRight: theme.spacing(0.5),
        fontSize: '1.2rem',
      },
    }
  },
  viewToggleButton: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1),
  },
  skeletonCard: {
    height: 200,
    borderRadius: theme.shape.borderRadius * 2,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    textAlign: "center",
    height: "100%",
  },
  refreshButton: {
    marginLeft: theme.spacing(1),
  },
  statCard: {
    minWidth: 120,
    borderRadius: theme.shape.borderRadius * 2,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[4],
    }
  },
  formControl: {
    minWidth: 200,
    margin: theme.spacing(1),
    '@media (max-width: 600px)': {
      minWidth: '100%',
      margin: theme.spacing(1, 0),
    },
  },
  mobileTabs: {
    minHeight: 40,
    '& .MuiTab-root': {
      minHeight: 40,
      textTransform: 'none',
    }
  }
}));

// Componente da página de agendamentos
const Schedules = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  // Estados
  const [schedules, dispatch] = useReducer(scheduleReducer, []);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactId, setContactId] = useState("");
  const [view, setView] = useState(isMobile ? "list" : "calendar");
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [scheduleDetailsOpen, setScheduleDetailsOpen] = useState(false);
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [calendarView, setCalendarView] = useState(isMobile ? "day" : "month");

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 20 }
  });

  // Carregar conexões WhatsApp ativas
  useEffect(() => {
    const fetchWhatsapps = async () => {
      try {
        const { data } = await api.get("/whatsapp/");
        // Filtrar apenas as conexões conectadas
        const activeWhatsapps = data.filter(whatsapp => whatsapp.status === "CONNECTED");
        setWhatsapps(activeWhatsapps);
      } catch (err) {
        console.error("Erro ao carregar conexões WhatsApp", err);
      }
    };

    fetchWhatsapps();
  }, []);

  // Carregar agendamentos
  const fetchSchedules = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get("/schedules/", {
        params: { 
          searchParam, 
          pageNumber, 
          contactId, 
          whatsappId: selectedWhatsapp || undefined 
        },
      });

      if (user.profile === "admin") {
        dispatch({ type: pageNumber === 1 ? "LOAD_SCHEDULES" : "ADD_SCHEDULES", payload: data.schedules });
      } else {
        const filteredSchedules = data.schedules.filter(schedule => schedule.userId === user.id);
        dispatch({ type: pageNumber === 1 ? "LOAD_SCHEDULES" : "ADD_SCHEDULES", payload: filteredSchedules });
      }

      setHasMore(data.hasMore);
    } catch (err) {
      toast.error(i18n.t("schedules.toasts.loadError"));
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchParam, pageNumber, contactId, user, selectedWhatsapp]);

  // Formatar agendamentos para o calendário
  const calendarEvents = useMemo(() => {
    return schedules.map(schedule => ({
      id: schedule.id,
      title: schedule.contact?.name || i18n.t("schedules.unknownContact"),
      start: new Date(schedule.sendAt),
      end: new Date(schedule.sendAt),
      resource: schedule,
    }));
  }, [schedules]);

  // Filtragem de agendamentos baseada na aba ativa e filtros
  const filteredSchedules = useMemo(() => {
    let filtered = [...schedules];

    // Filtragem por termo de busca
    if (searchParam) {
      const search = searchParam.toLowerCase();
      filtered = filtered.filter(schedule => 
        (schedule.body && schedule.body.toLowerCase().includes(search)) ||
        (schedule.contact?.name && schedule.contact.name.toLowerCase().includes(search))
      );
    }

    // Filtragem por status
    if (filterStatus !== "all") {
      filtered = filtered.filter(schedule => schedule.status === filterStatus);
    }

    // Filtragem por conexão WhatsApp
    if (selectedWhatsapp) {
      filtered = filtered.filter(schedule => schedule.whatsappId === parseInt(selectedWhatsapp));
    }

    // Filtragem por aba (em dispositivos móveis)
    if (isMobile) {
      const now = moment();
      
      switch (activeTab) {
        case 0: // Hoje
          filtered = filtered.filter(schedule => 
            moment(schedule.sendAt).isSame(now, 'day')
          );
          break;
        case 1: // Pendentes
          filtered = filtered.filter(schedule => 
            schedule.status === "PENDENTE" || schedule.status === "AGENDADA"
          );
          break;
        case 2: // Enviados
          filtered = filtered.filter(schedule => 
            schedule.status === "ENVIADA"
          );
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [schedules, searchParam, filterStatus, activeTab, isMobile, selectedWhatsapp]);

  // Estatísticas dos agendamentos
  const stats = useMemo(() => {
    return {
      total: schedules.length,
      pending: schedules.filter(s => s.status === "PENDENTE" || s.status === "AGENDADA").length,
      sent: schedules.filter(s => s.status === "ENVIADA").length,
      error: schedules.filter(s => s.status === "ERRO").length,
    };
  }, [schedules]);

  // Efeitos
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    fetchSchedules();
  }, [searchParam, contactId, selectedWhatsapp, fetchSchedules]);

  useEffect(() => {
    // Configuração do socket para receber atualizações em tempo real
    const socket = socketManager.GetSocket(user.companyId);

    const handleScheduleUpdate = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULE", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: data.scheduleId });
      }
    };

    socket.on(`company-${user.companyId}-schedule`, handleScheduleUpdate);

    return () => {
      socket.off(`company-${user.companyId}-schedule`, handleScheduleUpdate);
    };
  }, [user, socketManager]);

  // Ajustar a visualização ao mudar para mobile
  useEffect(() => {
    if (isMobile && view === "calendar") {
      setCalendarView("day");
    }
  }, [isMobile, view]);

  // Handlers
  const handleSearch = (event) => {
    setSearchParam(event.target.value);
  };

  const handleRefresh = () => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    fetchSchedules();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    handleFilterClose();
  };

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setScheduleDetailsOpen(false);
    setSelectedSchedule(null);
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleDeleteClick = (schedule) => {
    setDeletingSchedule(schedule);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/schedules/${deletingSchedule.id}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
      dispatch({ type: "DELETE_SCHEDULE", payload: deletingSchedule.id });
    } catch (err) {
      toast.error(i18n.t("schedules.toasts.deleteError"));
      console.error(err);
    } finally {
      setConfirmModalOpen(false);
      setDeletingSchedule(null);
    }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading || refreshing) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber(prevState => prevState + 1);
    }
  };

  const handleWhatsappChange = (event) => {
    setSelectedWhatsapp(event.target.value);
  };

  const handleCalendarNavigate = (newDate, view) => {
    // Poderá ser usado para filtrar por data no futuro
  };

  const handleCalendarViewChange = (view) => {
    setCalendarView(view);
  };

  // Função auxiliar para gerar propriedades do chip de status
  const getStatusChipProps = (status) => {
    switch (status) {
      case "ENVIADA":
        return {
          label: i18n.t("schedules.status.sent"),
          color: "success",
          icon: <CheckIcon fontSize="small" />
        };
      case "PENDENTE":
      case "AGENDADA":
        return {
          label: i18n.t("schedules.status.pending"),
          color: "warning",
          icon: <ClockIcon fontSize="small" />
        };
      case "ERRO":
        return {
          label: i18n.t("schedules.status.error"),
          color: "error",
          icon: <WarningIcon fontSize="small" />
        };
      default:
        return {
          label: status,
          color: "default",
          icon: <InfoIcon fontSize="small" />
        };
    }
  };

  // Componente de Card de Agendamento
  const ScheduleCard = ({ schedule }) => {
    const statusProps = getStatusChipProps(schedule.status);
    
    return (
      <Card 
        elevation={2} 
        sx={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column",
          borderRadius: 2,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[4]
          },
          overflow: "hidden"
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ 
                maxWidth: "calc(100% - 80px)",
                overflow: "hidden"
              }}
            >
              <EventIcon color="primary" sx={{ mr: 1, flexShrink: 0 }} />
              <Typography 
                variant="subtitle1" 
                fontWeight="medium" 
                noWrap
                sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {schedule.contact?.name || i18n.t("schedules.unknownContact")}
              </Typography>
            </Box>
            <Chip
              size="small"
              icon={statusProps.icon}
              label={statusProps.label}
              color={statusProps.color}
              sx={{ flexShrink: 0 }}
            />
          </Box>
          
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ 
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              mb: 1,
              height: "3.6em",
              wordBreak: "break-word"
            }}
          >
            {schedule.body}
          </Typography>
          
          <Typography 
            variant="caption" 
            color="textSecondary" 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              mt: 1,
              color: theme.palette.text.secondary
            }}
          >
            <ClockIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7, flexShrink: 0 }} />
            {moment(schedule.sendAt).format("DD/MM/YYYY HH:mm")}
          </Typography>
          
          {/* Exibição da conexão WhatsApp utilizada */}
          {schedule.whatsapp && (
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center",
                mt: 1,
                gap: 0.5
              }}
            >
              <WhatsAppIcon fontSize="small" sx={{ color: schedule.whatsapp.color || "#25D366", flexShrink: 0 }} />
              <Typography variant="caption" color="textSecondary" noWrap>
                {schedule.whatsapp.name}
              </Typography>
            </Box>
          )}
          
          {schedule.mediaPath && (
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center",
                mt: 1 
              }}
            >
              <Chip
                size="small"
                icon={<AttachIcon fontSize="small" />}
                label={(schedule.mediaName && schedule.mediaName.length > 15) 
                  ? `${schedule.mediaName.substring(0, 15)}...` 
                  : (schedule.mediaName || i18n.t("schedules.attachment"))}
                variant="outlined"
                color="primary"
              />
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: "flex-end", px: 2, py: 1 }}>
          <Tooltip title={i18n.t("schedules.buttons.view")} arrow>
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleScheduleClick(schedule)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={i18n.t("schedules.buttons.edit")} arrow>
            <span>
              <IconButton 
                size="small" 
                color="secondary"
                onClick={() => handleEditSchedule(schedule)}
                disabled={schedule.status === "ENVIADA"}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title={i18n.t("schedules.buttons.delete")} arrow>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteClick(schedule)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  // Componente Card de Estatística
  const StatCard = ({ title, value, icon, color }) => {
    return (
      <Card 
        elevation={2} 
        className={classes.statCard}
        sx={{
          minWidth: { xs: '45%', sm: 120 },
          flexGrow: { xs: 1, sm: 0 }
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Box
              sx={{
                bgcolor: `${color}.lighter`,
                color: `${color}.main`,
                borderRadius: "50%",
                p: 1,
                mr: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" fontWeight="medium">
              {value}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  // Componente de exibição da lista
  const ListView = () => {
    if (filteredSchedules.length === 0 && !loading) {
      return (
        <Box className={classes.emptyState}>
          <CalendarIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {i18n.t("schedules.emptyState.title")}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {i18n.t("schedules.emptyState.description")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenScheduleModal}
            sx={{ mt: 2 }}
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {filteredSchedules.map(schedule => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={schedule.id}>
            <ScheduleCard schedule={schedule} />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Componente de exibição do calendário
  const CalendarView = () => (
    <Box 
      className={classes.calendarContainer} 
      sx={{ 
        height: isMobile ? "calc(100vh - 210px)" : 600,
        minHeight: 300
      }}
    >
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        messages={calendarMessages}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day", "agenda"]}
        defaultView={calendarView}
        view={calendarView}
        onView={handleCalendarViewChange}
        onNavigate={handleCalendarNavigate}
        components={{
          event: EventComponent
        }}
        style={{ height: "100%" }}
        toolbar={true}
        popup={true}
      />
    </Box>
  );

  // Componente personalizado para renderizar eventos no calendário
  const EventComponent = ({ event }) => {
    const schedule = event.resource;
    const statusProps = getStatusChipProps(schedule.status);

    return (
      <Tooltip
        title={
          <>
            <Typography variant="subtitle2">{schedule.contact?.name || i18n.t("schedules.unknownContact")}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {moment(schedule.sendAt).format("HH:mm")}
            </Typography>
            {schedule.whatsapp && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                {schedule.whatsapp.name}
              </Typography>
            )}
            <Chip 
              size="small" 
              icon={statusProps.icon}
              label={statusProps.label}
              color={statusProps.color}
              sx={{ mt: 0.5 }}
            />
          </>
        }
        arrow
      >
        <Box
          onClick={() => handleScheduleClick(schedule)}
          sx={{
            bgcolor: `${statusProps.color}.lighter`,
            color: `${statusProps.color}.dark`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderLeft: `4px solid ${theme.palette[statusProps.color].main}`,
            p: 0.5,
            cursor: "pointer",
            borderRadius: 1,
            maxWidth: "100%",
            overflow: "hidden",
"&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
            }
          }}
        >
          <Typography 
            variant="caption" 
            fontWeight="medium" 
            noWrap
            sx={{ 
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {schedule.contact?.name || i18n.t("schedules.unknownContact")}
          </Typography>
          {statusProps.icon}
        </Box>
      </Tooltip>
    );
  };

  // Componente para Action Bar móvel (botões flutuantes)
  const MobileActionBar = () => (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 100,
        display: { xs: "block", sm: "none" }
      }}
    >
      <Button
        variant="contained"
        color="primary"
        size="medium"
        onClick={handleOpenScheduleModal}
        startIcon={<AddIcon />}
        sx={{
          borderRadius: 6,
          boxShadow: theme.shadows[4],
          px: 2,
          py: 1
        }}
      >
        {i18n.t("schedules.buttons.addShort")}
      </Button>
    </Box>
  );

  return (
    <MainContainer>
      {/* Modais */}
      <ConfirmationModal
        title={i18n.t("schedules.confirmationModal.deleteTitle")}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        reload={fetchSchedules}
        scheduleId={selectedSchedule?.id}
        contactId={contactId}
        initialWhatsAppId={selectedSchedule?.whatsappId || ""}
        cleanContact={() => setContactId("")}
      />
      
      <ScheduleDetailsModal
        open={scheduleDetailsOpen}
        onClose={handleCloseDetails}
        schedule={selectedSchedule}
        onEdit={() => {
          setScheduleDetailsOpen(false);
          handleEditSchedule(selectedSchedule);
        }}
        onDelete={() => {
          setScheduleDetailsOpen(false);
          handleDeleteClick(selectedSchedule);
        }}
      />

      <MainHeader>
        <Title>
          {i18n.t("schedules.title")}
          {!loading && (
            <Badge 
              badgeContent={filteredSchedules.length} 
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Title>
        
        <MainHeaderButtonsWrapper
          sx={{ 
            flexWrap: "wrap", 
            gap: 1, 
            justifyContent: "flex-end",
            mt: { xs: 2, sm: 0 }
          }}
        >
          <TextField
            placeholder={i18n.t("schedules.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className={classes.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            sx={{ 
              flexGrow: 1, 
              minWidth: { xs: "100%", sm: "auto" },
              mb: { xs: 1, sm: 0 }
            }}
          />
          
          {/* Filtro de Conexão WhatsApp */}
          <FormControl 
            variant="outlined" 
            size="small" 
            className={classes.formControl}
            sx={{ 
              minWidth: { xs: "100%", sm: 200 },
              m: { xs: 0, sm: 1 }
            }}
          >
            <InputLabel id="whatsapp-filter-label">
              {i18n.t("schedules.filters.whatsappConnection")}
            </InputLabel>
            <Select
              labelId="whatsapp-filter-label"
              id="whatsapp-filter"
              value={selectedWhatsapp}
              onChange={handleWhatsappChange}
              label={i18n.t("schedules.filters.whatsappConnection")}
              sx={{ borderRadius: 2 }}
              MenuProps={{ 
                PaperProps: { 
                  style: { maxHeight: 300 } 
                } 
              }}
            >
              <MenuItem value="">
                <em>{i18n.t("schedules.filters.allConnections")}</em>
              </MenuItem>
              {whatsapps.map((whatsapp) => (
                <MenuItem key={whatsapp.id} value={whatsapp.id}>
                  <Box display="flex" alignItems="center">
                    <WhatsAppIcon sx={{ mr: 1, color: whatsapp.color || "#25D366" }} />
                    {whatsapp.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {!isMobile && (
            <>
              <Tooltip title={i18n.t("schedules.buttons.filter")} arrow>
                <IconButton
                  color={filterStatus !== "all" ? "primary" : "default"}
                  onClick={handleFilterClick}
                  className={classes.viewToggleButton}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleFilterClose}
                PaperProps={{
                  sx: { borderRadius: 2, minWidth: 180 }
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem 
                  onClick={() => handleFilterSelect("all")}
                  selected={filterStatus === "all"}
                >
                  <ListItemIcon>
                    <FilterListIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{i18n.t("schedules.filters.all")}</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleFilterSelect("PENDENTE")}
                  selected={filterStatus === "PENDENTE"}
                >
                  <ListItemIcon>
                    <ClockIcon fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText>{i18n.t("schedules.filters.pending")}</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleFilterSelect("ENVIADA")}
                  selected={filterStatus === "ENVIADA"}
                >
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>{i18n.t("schedules.filters.sent")}</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleFilterSelect("ERRO")}
                  selected={filterStatus === "ERRO"}
                >
                  <ListItemIcon>
                    <WarningIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>{i18n.t("schedules.filters.error")}</ListItemText>
                </MenuItem>
              </Menu>
              
              <Tooltip title={i18n.t("schedules.buttons.calendarView")} arrow>
                <IconButton
                  color={view === "calendar" ? "primary" : "default"}
                  onClick={() => handleViewChange("calendar")}
                  className={classes.viewToggleButton}
                >
                  <CalendarIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={i18n.t("schedules.buttons.listView")} arrow>
                <IconButton
                  color={view === "list" ? "primary" : "default"}
                  onClick={() => handleViewChange("list")}
                  className={classes.viewToggleButton}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={i18n.t("schedules.buttons.refresh")} arrow>
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={classes.refreshButton}
                >
                  {refreshing ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </Tooltip>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenScheduleModal}
              >
                {i18n.t("schedules.buttons.add")}
              </Button>
            </>
          )}
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper 
        variant="outlined" 
        className={classes.mainPaper} 
        onScroll={handleScroll}
        sx={{ 
          display: "flex", 
          flexDirection: "column",
          overflowX: "hidden"
        }}
      >
        <animated.div style={{...fadeIn, display: "flex", flexDirection: "column", flex: 1}}>
          {/* Abas para dispositivos móveis */}
          {isMobile && (
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                className={classes.mobileTabs}
              >
                <Tab 
                  label={i18n.t("schedules.tabs.today")} 
                  icon={<TodayIcon fontSize={isMobile ? "small" : "medium"} />} 
                  className={classes.tabItem}
                  sx={{ minHeight: 40 }}
                />
                <Tab 
                  label={i18n.t("schedules.tabs.pending")} 
                  icon={<ClockIcon fontSize={isMobile ? "small" : "medium"} />}
                  className={classes.tabItem}
                  sx={{ minHeight: 40 }}
                />
                <Tab 
                  label={i18n.t("schedules.tabs.sent")} 
                  icon={<CheckIcon fontSize={isMobile ? "small" : "medium"} />}
                  className={classes.tabItem}
                  sx={{ minHeight: 40 }}
                />
              </Tabs>
            </Box>
          )}
          
          {/* Cards de estatísticas */}
          {!isMobile && !loading && (
            <Box 
              display="flex" 
              gap={2} 
              mb={3}
              sx={{
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": {
                  height: 8,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.1)",
                  borderRadius: 4,
                },
                flexWrap: { sm: "wrap", md: "nowrap" }
              }}
            >
              <StatCard 
                title={i18n.t("schedules.stats.total")} 
                value={stats.total} 
                icon={<EventIcon />} 
                color="primary" 
              />
              
              <StatCard 
                title={i18n.t("schedules.stats.pending")} 
                value={stats.pending} 
                icon={<ClockIcon />} 
                color="warning" 
              />
              
              <StatCard 
                title={i18n.t("schedules.stats.sent")} 
                value={stats.sent} 
                icon={<CheckIcon />} 
                color="success" 
              />
              
              <StatCard 
                title={i18n.t("schedules.stats.error")} 
                value={stats.error} 
                icon={<WarningIcon />} 
                color="error" 
              />
            </Box>
          )}
          
          {/* Estatísticas em dispositivos móveis em formato de linha */}
          {isMobile && !loading && (
            <Box 
              display="flex" 
              gap={1} 
              mb={2}
              flexWrap="wrap"
              sx={{
                px: 1,
                justifyContent: "center"
              }}
            >
              <StatCard 
                title={i18n.t("schedules.stats.total")} 
                value={stats.total} 
                icon={<EventIcon fontSize="small" />} 
                color="primary" 
              />
              
              <StatCard 
                title={i18n.t("schedules.stats.pending")} 
                value={stats.pending} 
                icon={<ClockIcon fontSize="small" />} 
                color="warning" 
              />
              
              <StatCard 
                title={i18n.t("schedules.stats.sent")} 
                value={stats.sent} 
                icon={<CheckIcon fontSize="small" />} 
                color="success" 
              />
              
              <StatCard 
                title={i18n.t("schedules.stats.error")} 
                value={stats.error} 
                icon={<WarningIcon fontSize="small" />} 
                color="error" 
              />
            </Box>
          )}
          
          {/* Esqueletos de carregamento */}
          {loading ? (
            <Box sx={{ flex: 1 }}>
              {view === "list" ? (
                <Grid container spacing={2}>
                  {Array.from(new Array(8)).map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Skeleton 
                        variant="rectangular"
                        animation="wave"
                        className={classes.skeletonCard}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Skeleton 
                  variant="rectangular"
                  animation="wave"
                  height={550}
                  sx={{ borderRadius: 2 }}
                />
              )}
            </Box>
          ) : (
            // Conteúdo principal
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {view === "calendar" ? <CalendarView /> : <ListView />}
              
              {/* Indicador de carregamento de mais itens */}
              {refreshing && hasMore && (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  my={2}
                >
                  <CircularProgress size={30} />
                </Box>
              )}
            </Box>
          )}
        </animated.div>
      </Paper>
      
      {/* Barra de ações fixa para dispositivos móveis */}
      {isMobile && <MobileActionBar />}
    </MainContainer>
  );
};

export default Schedules;