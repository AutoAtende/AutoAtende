import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { styled, useTheme, keyframes } from "@mui/material/styles";
import {
  Badge, Collapse, List, Tooltip,
  Box, Typography, ListItem, ListItemIcon, ListItemText, Divider
} from "@mui/material";

import {
  DashboardOutlined,
  RuleOutlined,
  WhatsApp,
  HeadsetMic,
  SyncAlt,
  Search,
  RateReviewOutlined,
  PasswordOutlined,
  MonitorHeart,
  PeopleAltOutlined,
  SupervisedUserCircle,
  ContactPhoneOutlined,
  AccountTreeOutlined,
  FlashOn,
  HelpOutline,
  CodeRounded,
  ViewKanban,
  AccountTree,
  Schedule,
  LocalOffer,
  EventAvailable,
  EventOutlined,
  ExpandLess,
  ExpandMore,
  Campaign,
  People,
  Business,
  WorkOutline,
  Announcement,
  Forum,
  LocalAtm,
  AllInclusive,
  DeviceHubOutlined,
  EmailRounded,
  RotateRight,
  WebOutlined,
  SettingsOutlined,
  PaletteOutlined,
  AssignmentIndOutlined,
  HelpCenterOutlined,
  ScheduleOutlined,
  PaymentsOutlined,
  ReportProblemOutlined
} from '@mui/icons-material';

// Importações de contexto e utilitários
import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { SocketContext } from "../context/Socket/SocketContext";
import { isArray } from "../utils/helpers";
import api from "../services/api";
import { toast } from "../helpers/toast";
import moment from "moment";
import useVersion from "../hooks/useVersion";
import { useWhitelabelSettings } from "../hooks/useWhitelabelSettings";
import ColorModeContext from "./themeContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { GlobalContext } from "../context/GlobalContext";
import { getTicketsArrayByUser } from "../hooks/useTickets";
import { useCorrectDomain } from "../hooks/useCorrectDomain";
import usePlans from "../hooks/usePlans";

// Badge padronizada
const StandardBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

// Espaçamento reduzido entre títulos e itens
const spacing = {
  mainCategory: "4px 0 0 0",
  itemSpacing: "1px 0"
};

// Definir a animação
const blinkAnimation = keyframes`
  0%, 100% {
    color: #25D366;
  }
  50% {
    color: #128C7E;
  }
`;

// Estilizar o ícone com a animação
const BlinkingWhatsAppIcon = styled(WhatsApp)({
  animation: `${blinkAnimation} 1.5s infinite`,
});

// Categoria principal (Gerência, Atendimentos, Administração)
const CategoryItemStyled = styled(ListItem)(({ theme, collapsed }) => ({
  height: "40px",
  width: "auto",
  borderRadius: "4px",
  margin: spacing.mainCategory,
  // Quando recolhido, alinha o ícone com os outros
  padding: collapsed ? "0 8px" : "0 8px",
  transition: "background-color 0.3s",
  fontWeight: 500,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.mode === "light"
      ? "rgba(57, 172, 231, 0.08)"
      : "rgba(57, 172, 231, 0.15)",
  }
}));

// Itens de primeiro nível (Dashboard, Tickets, etc)
const MenuItemStyled = styled(ListItem)(({ theme, active, collapsed }) => ({
  height: "38px",
  width: "auto",
  borderRadius: "4px",
  margin: spacing.itemSpacing,
  // Quando recolhido, todos os ícones ficam alinhados com padding fixo
  padding: collapsed ? "0 8px" : "0 8px 0 15px",
  transition: "background-color 0.3s, color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.mode === "light"
      ? "rgba(57, 172, 231, 0.08)"
      : "rgba(57, 172, 231, 0.15)",
  },
  ...(active && {
    backgroundColor: theme.palette.mode === "light"
      ? "rgba(57, 172, 231, 0.15)"
      : "rgba(57, 172, 231, 0.25)",
    borderLeft: `3px solid ${theme.palette.primary.main}`,
  })
}));

// Subcategorias (Contatos, Integrações) - Alinhamento condicional
const SubcategoryItemStyled = styled(ListItem)(({ theme, collapsed }) => ({
  height: "38px",
  width: "auto",
  borderRadius: "4px",
  margin: spacing.itemSpacing,
  // Quando recolhido, alinha com os outros ícones
  padding: collapsed ? "0 8px" : "0 8px 0 15px",
  transition: "background-color 0.3s",
  fontWeight: 500,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.mode === "light"
      ? "rgba(57, 172, 231, 0.08)"
      : "rgba(57, 172, 231, 0.15)",
  }
}));

// Itens de segundo nível (dentro de Contatos e Integrações)
const SubmenuItemStyled = styled(ListItem)(({ theme, active, collapsed }) => ({
  height: "38px",
  width: "auto",
  borderRadius: "4px",
  margin: spacing.itemSpacing,
  // Quando recolhido, alinha com os outros ícones
  padding: collapsed ? "0 8px" : "0 8px 0 30px",
  transition: "background-color 0.3s, color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.mode === "light"
      ? "rgba(57, 172, 231, 0.08)"
      : "rgba(57, 172, 231, 0.15)",
  },
  ...(active && {
    backgroundColor: theme.palette.mode === "light"
      ? "rgba(57, 172, 231, 0.15)"
      : "rgba(57, 172, 231, 0.25)",
    borderLeft: `3px solid ${theme.palette.primary.main}`,
  })
}));

// Ícone do menu com alinhamento consistente quando recolhido
const MenuIconStyled = styled(ListItemIcon)(({ theme, active, collapsed }) => ({
  minWidth: collapsed ? "auto" : "36px",
  display: "flex",
  alignItems: "center",
  justifyContent: collapsed ? "center" : "flex-start",
  // Quando recolhido, centraliza o ícone no container
  marginRight: collapsed ? 0 : "8px",
  color: active
    ? theme.palette.primary.main
    : theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.54)" : "rgba(255, 255, 255, 0.7)",
  transition: "color 0.3s",
  "& .MuiSvgIcon-root": {
    fontSize: "1.25rem",
  }
}));

// Texto do menu
const MenuTextStyled = styled(Typography)(({ theme, active }) => ({
  fontWeight: active ? 500 : 400,
  fontSize: "14px",
  transition: "color 0.3s",
  color: active
    ? theme.palette.primary.main
    : theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.87)" : "rgba(255, 255, 255, 0.9)",
}));

// Componente para itens de menu
function ListItemLink(props) {
  const {
    icon,
    primary,
    to,
    tooltip,
    showBadge,
    badgeContent,
    invisible = true,
    level = 0,
    onItemClick,
    drawerClose,
    collapsed
  } = props;

  const theme = useTheme();
  const activeMenu = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  // Escolher o componente certo com base no nível
  let ItemComponent;
  if (level === 0) {
    ItemComponent = MenuItemStyled;
  } else if (level === 1) {
    ItemComponent = MenuItemStyled;
  } else {
    ItemComponent = SubmenuItemStyled;
  }

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => (
      <RouterLink
        to={to}
        ref={ref}
        {...itemProps}
        onClick={(e) => {
          if (onItemClick) onItemClick(e);
          if (window.innerWidth <= 768) {
            if (drawerClose) {
              drawerClose();
            }
          }
        }}
      />
    )),
    [to, onItemClick, drawerClose]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  const IconWithBadge = React.useMemo(() => {
    if (!icon) return null;

    if (showBadge) {
      return (
        <StandardBadge
          badgeContent={badgeContent}
          color="secondary"
          invisible={invisible}
        >
          {icon}
        </StandardBadge>
      );
    }
    return icon;
  }, [icon, showBadge, badgeContent, invisible]);

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip || collapsed}>
      <li>
        <ItemComponent
          button
          component={renderLink}
          active={isActive ? 1 : 0}
          collapsed={collapsed ? 1 : 0}
        >
          <MenuIconStyled 
            active={isActive ? 1 : 0}
            collapsed={collapsed ? 1 : 0}
          >
            {IconWithBadge}
          </MenuIconStyled>

          {/* Texto é ocultado apenas quando o menu está recolhido */}
          {!collapsed && (
            <ListItemText
              primary={
                <MenuTextStyled active={isActive ? 1 : 0}>
                  {primary}
                </MenuTextStyled>
              }
            />
          )}
        </ItemComponent>
      </li>
    </ConditionalTooltip>
  );
}

// Componentes separados para títulos de categoria e subcategorias
function MainCategoryItem({ icon, primary, open, onClick, children, collapsed }) {
  return (
    <React.Fragment>
      <CategoryItemStyled 
        button 
        onClick={onClick}
        collapsed={collapsed ? 1 : 0}
      >
        {icon && (
          <MenuIconStyled collapsed={collapsed ? 1 : 0}>
            {icon}
          </MenuIconStyled>
        )}

        {!collapsed && (
          <ListItemText
            primary={
              <MenuTextStyled sx={{ fontWeight: 600 }}>
                {primary}
              </MenuTextStyled>
            }
          />
        )}

        {!collapsed && open !== undefined && (
          open ? <ExpandLess /> : <ExpandMore />
        )}
      </CategoryItemStyled>

      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pt: 0, pb: 0 }}>
            {children}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
}

// Componente para subcategorias (Contatos, Integrações)
function SubCategoryItem({ icon, primary, open, onClick, children, collapsed }) {
  return (
    <React.Fragment>
      <SubcategoryItemStyled 
        button 
        onClick={onClick}
        collapsed={collapsed ? 1 : 0}
      >
        {icon && (
          <MenuIconStyled collapsed={collapsed ? 1 : 0}>
            {icon}
          </MenuIconStyled>
        )}

        {!collapsed && (
          <ListItemText
            primary={
              <MenuTextStyled sx={{ fontWeight: 600 }}>
                {primary}
              </MenuTextStyled>
            }
          />
        )}

        {!collapsed && open !== undefined && (
          open ? <ExpandLess /> : <ExpandMore />
        )}
      </SubcategoryItemStyled>

      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pt: 0, pb: 0 }}>
            {children}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
}

// Reducer para gerenciamento de estado
const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

// Componente principal
const MainListItems = (props) => {
  const { drawerClose, collapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout, isAuth } = useContext(AuthContext);
  const { toggleColorMode } = useContext(ColorModeContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const theme = useTheme();
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showOpenAIAssistants, setShowOpenAIAssistants] = useState(false);
  const [showFlowBuilder, setShowFlowBuilder] = useState(false);
  const [showAPIOfficial, setShowAPIOfficial] = useState(false);
  const [showChatBotRules, setShowChatBotRules] = useState(false);
  const history = useHistory();
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);

  const [version, setVersion] = useState(false);
  const { getPlanCompany } = usePlans();
  const { getVersion } = useVersion();

  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(true);
  const [openServiceSubmenu, setOpenServiceSubmenu] = useState(true);
  const [openAdminSubmenu, setOpenAdminSubmenu] = useState(true);
  const [openContactsSubmenu, setOpenContactsSubmenu] = useState(true);
  const [openIntegrationsSubmenu, setOpenIntegrationsSubmenu] = useState(true);
  const [invisibleTotalTicketsPending, setInvisibleTotalTicketsPending] = useState(true);
  const [totalTicketsPending, setTotalTicketsPending] = useState(0);
  const [openSettingsSubmenu, setOpenSettingsSubmenu] = useState(false);
  const isCorrectDomain = useCorrectDomain();

  const [openTasksCount, setOpenTasksCount] = useState(0);

  const socketManager = useContext(SocketContext);
  const { makeRequestSettings, notifications, makeRequestTagTotalTicketPending } = useContext(GlobalContext);

  const { settings, loading } = useWhitelabelSettings();

  // Carregar versão
  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }

    fetchVersion();
  }, [getVersion]);

  // Monitor de tarefas vencidas
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!socketManager?.GetSocket) return;

    const socket = socketManager.GetSocket(companyId);

    const handleTaskOverdue = (data) => {
      const formattedDate = moment(data.dueDate).format('DD/MM/YYYY HH:mm');
      toast.error(
        `Tarefa vencida: ${data.title}\nVencimento: ${formattedDate}`,
        {
          autoClose: false
        }
      );
    };

    socket.on('task-overdue', handleTaskOverdue);

    return () => {
      socket.off('task-overdue', handleTaskOverdue);
    };
  }, [socketManager]);

  // Carregar contagem de tarefas
  useEffect(() => {
    if (window.location.pathname === "/login") return;

    const fetchTasksCount = async () => {
      try {
        const { data } = await api.get('/task/status-count');
        setOpenTasksCount(data.openCount);
      } catch (error) {
        console.error(error);
        setOpenTasksCount(0);
      }
    };

    fetchTasksCount();

    const companyId = localStorage.getItem("companyId");
    if (!socketManager?.GetSocket) return;

    const socket = socketManager.GetSocket(companyId);

    const handleTaskUpdate = () => {
      fetchTasksCount();
    };

    socket.on('task-update', handleTaskUpdate);

    return () => {
      socket.off('task-update', handleTaskUpdate);
    };
  }, [socketManager]);

  // Carregar tickets pendentes
  useEffect(() => {
    if (window.location.pathname === "/login") return;

    const delayDebounceFn = setTimeout(() => {
      const fetchTickets = async () => {
        const { queues } = user;
        try {
          const { data } = await api.get("/tickets", {
            params: {
              status: "pending",
              pageNumber: 1,
              queueIds: queues
                ? JSON.stringify(queues?.map((item) => item.id))
                : undefined,
            },
          });

          const total = getTicketsArrayByUser(data?.tickets, user)?.length;

          setTotalTicketsPending(total);
          setInvisibleTotalTicketsPending(total <= 0);
        } catch (err) {
          toast.error(err);
          setInvisibleTotalTicketsPending(true);
        }
      };

      fetchTickets();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [makeRequestTagTotalTicketPending, notifications, user]);

  // Reset de paginação
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  // Carregar dados do plano
  useEffect(() => {
    async function fetchData() {
      if (window.location.pathname === "/login") return;

      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setShowEmail(planConfigs.plan.useEmail);
      setShowOpenAIAssistants(planConfigs.plan.useOpenAIAssistants);
      setShowFlowBuilder(planConfigs.plan.useFlowBuilder);
      setShowAPIOfficial(planConfigs.plan.useAPIOfficial);
      setShowChatBotRules(planConfigs.plan.useChatBotRules);
    }

    fetchData();
  }, [getPlanCompany, user.companyId]);

  // Carregar chats
  const fetchChats = async () => {
    if (window.location.pathname === "/login") return;

    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toast.error(err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [searchParam, pageNumber]);

  // Monitor de chats
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");

    const socket = socketManager.GetSocket(companyId);

    const onCompanyChatMainListItems = (data) => {
      if (data.action === "new-message" || data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    }

    socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);

    return () => {
      socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
    };
  }, [socketManager]);

  // Verificar mensagens não lidas
  useEffect(() => {
    let unreadsCount = 0;

    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }

    setInvisible(unreadsCount <= 0);
  }, [chats, user.id]);

  // Verificação de campanhas locais
  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  // Verificação de email local
  useEffect(() => {
    if (localStorage.getItem("eshow")) {
      setShowEmail(true);
    }
  }, []);

  // Verificar conexões WhatsApp
  useEffect(() => {
    if (whatsApps.length > 0) {
      const offlineWhats = whatsApps.filter((whats) => {
        return (
          whats.status === "qrcode" ||
          whats.status === "PAIRING" ||
          whats.status === "DISCONNECTED" ||
          whats.status === "TIMEOUT" ||
          whats.status === "OPENING"
        );
      });

      setConnectionWarning(offlineWhats.length > 0);
    }
  }, [whatsApps]);

  useEffect(() => {
    if (collapsed) {
      setOpenDashboardSubmenu(false);
      setOpenServiceSubmenu(false);
      setOpenAdminSubmenu(false);
      setOpenContactsSubmenu(false);
      setOpenIntegrationsSubmenu(false);
    } else {
      // Quando abre, pode reabrir os submenus se desejar
      setOpenDashboardSubmenu(true);
      setOpenServiceSubmenu(true);
      setOpenAdminSubmenu(true);
      setOpenContactsSubmenu(true);
      setOpenIntegrationsSubmenu(true);
    }
  }, [collapsed]);

  // Manipuladores
  const handleClickLogout = () => {
    handleLogout();
    if (window.innerWidth <= 768 && drawerClose) {
      drawerClose();
    }
  };

  const handleToggleSubmenu = (setter) => {
    if (!collapsed) {
      setter(prev => !prev);
    }
    if (window.innerWidth <= 768 && drawerClose) {
      drawerClose();
    }
  };

  return (
    <div>
      <Box sx={{ mt: 0.5 }}>
        {/* GERÊNCIA */}
        <Can
          role={user.profile}
          perform={"dashboard:view"}
          yes={() => (
            <>
              <MainCategoryItem
                icon={<DashboardOutlined />}
                primary={i18n.t("mainDrawer.listTitle.management")}
                open={openDashboardSubmenu}
                onClick={() => handleToggleSubmenu(setOpenDashboardSubmenu)}
                collapsed={collapsed}
              >
                <ListItemLink
                  to="/dashboard"
                  primary={i18n.t("mainDrawer.listItems.dashboard")}
                  icon={<DashboardOutlined />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />
                <ListItemLink
                  to="/reports"
                  primary={i18n.t("mainDrawer.listItems.reports")}
                  icon={<Search />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />
              </MainCategoryItem>
            </>
          )}
        />

        {/* ATENDIMENTOS */}
        <Can
          role={user.profile}
          perform={"drawer-service-items:view"}
          no={() => (
            <>
              <MainCategoryItem
                icon={<HeadsetMic />}
                primary={i18n.t("mainDrawer.listTitle.service")}
                open={openServiceSubmenu}
                onClick={() => handleToggleSubmenu(setOpenServiceSubmenu)}
                collapsed={collapsed}
              >
                <ListItemLink
                  to="/tickets"
                  primary={i18n.t("mainDrawer.listItems.tickets")}
                  icon={<WhatsApp />}
                  tooltip={collapsed}
                  showBadge={true}
                  badgeContent={totalTicketsPending}
                  invisible={invisibleTotalTicketsPending}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

                <ListItemLink
                  to="/quick-messages"
                  primary={i18n.t("mainDrawer.listItems.quickMessages")}
                  icon={<FlashOn />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

                {showKanban && (
                  <ListItemLink
                    to="/kanban"
                    primary={i18n.t("mainDrawer.listItems.kanban")}
                    icon={<ViewKanban />}
                    tooltip={collapsed}
                    drawerClose={drawerClose}
                    level={1}
                    collapsed={collapsed}
                  />
                )}

                {showEmail && (
                  <ListItemLink
                    to="/email"
                    primary={i18n.t("mainDrawer.listItems.email")}
                    icon={<EmailRounded />}
                    tooltip={collapsed}
                    drawerClose={drawerClose}
                    level={1}
                    collapsed={collapsed}
                  />
                )}

                <ListItemLink
                  to="/tasks"
                  primary={i18n.t("mainDrawer.listItems.tasks")}
                  icon={<EventAvailable />}
                  tooltip={collapsed}
                  showBadge={true}
                  badgeContent={openTasksCount}
                  invisible={openTasksCount <= 0}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

                {/* Contatos como submenu */}
                <SubCategoryItem
                  icon={<ContactPhoneOutlined />}
                  primary={i18n.t("mainDrawer.listItems.contacts.menu")}
                  open={openContactsSubmenu}
                  onClick={() => handleToggleSubmenu(setOpenContactsSubmenu)}
                  collapsed={collapsed}
                >
                  <ListItemLink
                    to="/contacts"
                    primary={i18n.t("mainDrawer.listItems.contacts.list")}
                    icon={<People />}
                    tooltip={collapsed}
                    drawerClose={drawerClose}
                    level={2}
                    collapsed={collapsed}
                  />
                  {settings?.displayBusinessInfo === 'enabled' && (
                    <>
                      <ListItemLink
                        to="/employers"
                        primary={i18n.t("mainDrawer.listItems.contacts.employers")}
                        icon={<Business />}
                        tooltip={collapsed}
                        drawerClose={drawerClose}
                        level={2}
                        collapsed={collapsed}
                      />
                      <ListItemLink
                        to="/employers-pwd"
                        primary={i18n.t("mainDrawer.listItems.contacts.employerspwd")}
                        icon={<PasswordOutlined />}
                        tooltip={collapsed}
                        drawerClose={drawerClose}
                        level={2}
                        collapsed={collapsed}
                      />
                      <ListItemLink
                        to="/positions"
                        primary={i18n.t("mainDrawer.listItems.contacts.positions")}
                        icon={<WorkOutline />}
                        tooltip={collapsed}
                        drawerClose={drawerClose}
                        level={2}
                        collapsed={collapsed}
                      />
                    </>
                  )}
                </SubCategoryItem>

                {showSchedules && (
                  <ListItemLink
                    to="/schedules"
                    primary={i18n.t("mainDrawer.listItems.schedules")}
                    icon={<Schedule />}
                    tooltip={collapsed}
                    drawerClose={drawerClose}
                    level={1}
                    collapsed={collapsed}
                  />
                )}

                <ListItemLink
                  to="/tags"
                  primary={i18n.t("mainDrawer.listItems.tags")}
                  icon={<LocalOffer />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

                {showInternalChat && (
                  <ListItemLink
                    to="/chats"
                    primary={i18n.t("mainDrawer.listItems.chats")}
                    icon={<Forum />}
                    tooltip={collapsed}
                    showBadge={true}
                    badgeContent={1}
                    invisible={invisible}
                    drawerClose={drawerClose}
                    level={1}
                    collapsed={collapsed}
                  />
                )}

                <ListItemLink
                  to="/helps"
                  primary={i18n.t("mainDrawer.listItems.helps")}
                  icon={<HelpOutline />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />
              </MainCategoryItem>
            </>
          )}
        />

        {/* INTEGRAÇÕES como submenu */}
        <MainCategoryItem
          icon={<DeviceHubOutlined />}
          primary={i18n.t("mainDrawer.listItems.integrations.menu")}
          open={openIntegrationsSubmenu}
          onClick={() => handleToggleSubmenu(setOpenIntegrationsSubmenu)}
          collapsed={collapsed}
        >
          {showCampaigns && (
            <ListItemLink
              to="/bulk-sender"
              primary={i18n.t("mainDrawer.listItems.campaigns")}
              icon={<Campaign />}
              tooltip={collapsed}
              drawerClose={drawerClose}
              level={1}
              collapsed={collapsed}
            />
          )}

          {isCorrectDomain && (
            <ListItemLink
              to="/landing-pages"
              primary={i18n.t("mainDrawer.listItems.landingPages")}
              icon={<WebOutlined />}
              tooltip={collapsed}
              drawerClose={drawerClose}
              level={1}
              collapsed={collapsed}
            />
          )}

          <ListItemLink
            to="/groups"
            primary={i18n.t("mainDrawer.listItems.groups")}
            icon={<SupervisedUserCircle />}
            tooltip={collapsed}
            drawerClose={drawerClose}
            level={1}
            collapsed={collapsed}
          />

          {showFlowBuilder && (
            <ListItemLink
              to="/flow-builder"
              primary={i18n.t("mainDrawer.listItems.flowBuilder")}
              icon={<AccountTree />}
              tooltip={collapsed}
              drawerClose={drawerClose}
              level={1}
              collapsed={collapsed}
            />
          )}

          <ListItemLink
            to={"/agendamento"}
            primary={i18n.t("mainDrawer.listItems.agendamento")}
            icon={<EventOutlined />}
            tooltip={collapsed}
            drawerClose={drawerClose}
            level={1}
            collapsed={collapsed}
          />

          <ListItemLink
            to={"/prompts"}
            primary={i18n.t("mainDrawer.listItems.prompts")}
            icon={<AllInclusive />}
            tooltip={collapsed}
            drawerClose={drawerClose}
            level={1}
            collapsed={collapsed}
          />

          {showOpenAIAssistants && (
            <ListItemLink
              to={"/assistants"}
              primary={i18n.t("mainDrawer.listItems.assistants")}
              icon={<AllInclusive />}
              tooltip={collapsed}
              drawerClose={drawerClose}
              level={1}
              collapsed={collapsed}
            />
          )}

          {showChatBotRules && (
            <ListItemLink
              to="/message-rules"
              primary={i18n.t("mainDrawer.listItems.messageRules")}
              icon={<RuleOutlined />}
              tooltip={collapsed}
              drawerClose={drawerClose}
              level={1}
              collapsed={collapsed}
            />
          )}

          {showAPIOfficial && (
            <ListItemLink
              to="/whatsapp-templates"
              primary={i18n.t("mainDrawer.listItems.whatsappTemplates")}
              icon={<RateReviewOutlined />}
              tooltip={collapsed}
              drawerClose={drawerClose}
              level={1}
              collapsed={collapsed}
            />
          )}

          <ListItemLink
            to={"/queue-integration"}
            primary={i18n.t("mainDrawer.listItems.queueIntegration")}
            icon={<DeviceHubOutlined />}
            tooltip={collapsed}
            drawerClose={drawerClose}
            level={1}
            collapsed={collapsed}
          />
        </MainCategoryItem>

        {/* ADMINISTRAÇÃO */}
        <Can
          role={user.profile}
          perform="drawer-admin-items:view"
          yes={() => (
            <>
              <Divider sx={{ my: 0.5 }} />
              <MainCategoryItem
                icon={<SettingsOutlined />}
                primary={i18n.t("mainDrawer.listTitle.administration")}
                open={openAdminSubmenu}
                onClick={() => handleToggleSubmenu(setOpenAdminSubmenu)}
                collapsed={collapsed}
              >
                {user.super && (
                  <ListItemLink
                    to="/announcements"
                    primary={i18n.t("mainDrawer.listItems.annoucements")}
                    icon={<Announcement />}
                    tooltip={collapsed}
                    drawerClose={drawerClose}
                    level={1}
                    collapsed={collapsed}
                  />
                )}

                <ListItemLink
                  to="/connections"
                  primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={<SyncAlt />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<AccountTreeOutlined />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<PeopleAltOutlined />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<LocalAtm />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />

{/* Configurações como submenu */}
<SubCategoryItem
  icon={<SettingsOutlined />}
  primary={i18n.t("mainDrawer.listItems.settings.menu")}
  open={openSettingsSubmenu}
  onClick={() => handleToggleSubmenu(setOpenSettingsSubmenu)}
  collapsed={collapsed}
>
  <ListItemLink
    to="/settings/general"
    primary={i18n.t("mainDrawer.listItems.settings.general")}
    icon={<SettingsOutlined />}
    tooltip={collapsed}
    drawerClose={drawerClose}
    level={2}
    collapsed={collapsed}
  />
  <ListItemLink
    to="/settings/whitelabel"
    primary={i18n.t("mainDrawer.listItems.settings.whitelabel")}
    icon={<PaletteOutlined />}
    tooltip={collapsed}
    drawerClose={drawerClose}
    level={2}
    collapsed={collapsed}
  />
{user.super && (
    <ListItemLink
      to="/settings/plans"
      primary={i18n.t("mainDrawer.listItems.settings.plans")}
      icon={<AssignmentIndOutlined />}
      tooltip={collapsed}
      drawerClose={drawerClose}
      level={2}
      collapsed={collapsed}
      exact
    />
  )}
  {user.super && (
  <ListItemLink
    to="/settings/helps"
    primary={i18n.t("mainDrawer.listItems.settings.helps")}
    icon={<HelpCenterOutlined />}
    tooltip={collapsed}
    drawerClose={drawerClose}
    level={2}
    collapsed={collapsed}
  />
  )}
  <ListItemLink
    to="/settings/schedules"
    primary={i18n.t("mainDrawer.listItems.settings.schedules")}
    icon={<ScheduleOutlined />}
    tooltip={collapsed}
    drawerClose={drawerClose}
    level={2}
    collapsed={collapsed}
  />
  {user.super && (
  <ListItemLink
    to="/settings/payment-gateway"
    primary={i18n.t("mainDrawer.listItems.settings.paymentGateway")}
    icon={<PaymentsOutlined />}
    tooltip={collapsed}
    drawerClose={drawerClose}
    level={2}
    collapsed={collapsed}
  />
  )}
  
  <ListItemLink
    to="/settings/closure-reasons"
    primary={i18n.t("mainDrawer.listItems.settings.closureReasons")}
    icon={<ReportProblemOutlined />}
    tooltip={collapsed}
    drawerClose={drawerClose}
    level={2}
    collapsed={collapsed}
  />
</SubCategoryItem>

                {user.super && (
                  <ListItemLink
                    to="/companies"
                    primary={i18n.t("mainDrawer.listItems.companies")}
                    icon={<Business />}
                    tooltip={collapsed}
                    drawerClose={drawerClose}
                    level={1}
                    collapsed={collapsed}
                  />
                )}
              </MainCategoryItem>
            </>
          )}
        />

        {/* SUPERVISOR */}
        <Can
          role={user.profile}
          perform="drawer-superv-items:view"
          yes={() => (
            <>
              <Divider sx={{ my: 0.5 }} />
              <MainCategoryItem
                icon={<SettingsOutlined />}
                primary={i18n.t("mainDrawer.listTitle.administration")}
                open={openAdminSubmenu}
                onClick={() => handleToggleSubmenu(setOpenAdminSubmenu)}
                collapsed={collapsed}
              >
                <ListItemLink
                  to="/connections"
                  primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={<SyncAlt />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<PeopleAltOutlined />}
                  tooltip={collapsed}
                  drawerClose={drawerClose}
                  level={1}
                  collapsed={collapsed}
                />
              </MainCategoryItem>
            </>
          )}
        />

        {/* BOTÃO DE SAIR */}
        <MenuItemStyled
          button
          onClick={handleClickLogout}
          collapsed={collapsed ? 1 : 0}
        >
          <MenuIconStyled collapsed={collapsed ? 1 : 0}>
            <RotateRight />
          </MenuIconStyled>

          {!collapsed && (
            <ListItemText
              primary={
                <MenuTextStyled>
                  {i18n.t("mainDrawer.listItems.exit")}
                </MenuTextStyled>
              }
            />
          )}
        </MenuItemStyled>

        {/* VERSÃO DO SISTEMA */}
        {!collapsed && (
          <React.Fragment>
            <Divider sx={{ my: 0.5 }} />
            <Typography
              sx={{
                fontSize: "12px",
                padding: "5px",
                textAlign: "center",
                fontWeight: "bold",
                color: theme.palette.text.secondary
              }}
            >
              {i18n.t("mainDrawer.listItems.version")}: {version}
            </Typography>
          </React.Fragment>
        )}
      </Box>
    </div>
  );
};

export default MainListItems;