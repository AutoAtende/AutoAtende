import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import clsx from "clsx";
import { styled } from "@mui/material/styles";
import {
  Drawer,
  AppBar,
  Toolbar,
  Tooltip,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  Avatar,
  Badge,
  ListItemText,
  Box,
} from "@mui/material";
import ReactCountryFlag from "react-country-flag";

import { 
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Cached as CachedIcon,
  Backup as BackupIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Language as LanguageIcon,
  ExitToApp as ExitToAppIcon,
  ConfirmationNumber as TicketsIcon,
  Storage as StorageIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';

import MainListItems from "./MainListItems";
import NotificationsTaskPopOver from "../components/NotificationsTaskPopOver";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import BackupModal from "../components/BackupModal";
import DueDateEmailModal from "../components/DueDateEmailModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import { messages } from "../translate/languages";
import { toast } from "../helpers/toast";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import ChatPopover from "../pages/Chat/ChatPopover";
import EnhancedSatisfactionSurvey from "../components/EnhancedSatisfactionSurvey";
import SatisfactionReport from "../components/SatisfactionReport";
import FacebookPixelTracker from "../components/FacebookPixelTracker";
import { SocketContext } from "../context/Socket/SocketContext";
import { useDate } from "../hooks/useDate";
import useSettings from "../hooks/useSettings";
import ColorModeContext from "../layout/themeContext";
import { GlobalContext } from "../context/GlobalContext";

import api from "../services/api";

const drawerWidth = 240;

// Estilos usando styled API do MUI 5
const Root = styled('div')(({ theme }) => ({
  display: "flex",
  height: "100vh",
  [theme.breakpoints.down("sm")]: {
    height: "100%",
    minHeight: "100vh",
    width: "100%",
    overflow: "hidden"
  },
  backgroundColor: theme.palette.fancyBackground,
  "& .MuiButton-outlinedPrimary": {
    color: theme.palette.primary,
    border: theme.mode === "light"
      ? "1px solid rgba(0 124 102)"
      : "1px solid rgba(255, 255, 255, 0.5)",
  },
  "& .MuiTab-textColorPrimary.Mui-selected": {
    color: theme.palette.primary,
  },
}));

const CustomToolbar = styled(Toolbar)(({ theme }) => ({
  paddingRight: 24,
  color: theme.palette.dark.main,
  background: theme.palette.barraSuperior,
  [theme.breakpoints.down("sm")]: {
    paddingLeft: 12,
    paddingRight: 12
  }
}));

const ToolbarIcon = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundSize: "cover",
  padding: "0 8px",
  minHeight: "48px",
  [theme.breakpoints.down("sm")]: {
    height: "48px",
  },
}));

const CustomAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.down("sm")]: {
    width: "100%"
  },
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: 0
    }
  }),
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontSize: 14,
  color: "white",
  [theme.breakpoints.down("sm")]: {
    fontSize: 13
  }
}));

const CustomDrawerPaper = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      height: "100%",
      zIndex: theme.zIndex.drawer + 2
    },
    ...(open === false && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
      [theme.breakpoints.down("sm")]: {
        width: 0,
        display: "none"
      }
    }),
  }
}));

const AppBarSpacer = styled('div')(({ theme }) => ({
  minHeight: "48px",
  [theme.breakpoints.down("sm")]: {
    minHeight: "48px"
  }
}));

const Content = styled('main')(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  WebkitOverflowScrolling: "touch",
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    height: "calc(100vh - 48px)",
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    backgroundColor: theme.palette.background.default
  }
}));

const ContainerWithScroll = styled(List)(({ theme }) => ({
  flex: 1,
  overflowY: "scroll",
  overflowX: "hidden",
  ...theme.scrollbarStyles,
  borderRadius: "8px",
  border: "2px solid transparent",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  "-ms-overflow-style": "none",
  "scrollbar-width": "none",
}));

const Logo = styled('img')(({ theme, open }) => ({
  width: "192px",
  maxHeight: "72px",
  logo: theme.logo,
  content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")",
  display: open ? "block" : "none",
}));

const Avatar2 = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  cursor: "pointer",
  borderRadius: "50%",
  border: "2px solid #ccc",
}));

const MenuItem2 = styled(MenuItem)({
  display: "flex",
  alignItems: "center",
});

const MenuItemIcon2 = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
  minWidth: "36px",
}));

const NestedMenuItem = styled(MenuItem)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

const MobileActionsMenu = styled(Menu)({
  "& .MuiPaper-root": {
    maxWidth: "80vw",
    width: 250
  }
});

const UserInfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginLeft: theme.spacing(1),
  "& .MuiTypography-root": {
    color: "white",
    fontWeight: "bold"
  }
}));

const TaskIndicator = styled('span')(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontSize: 12,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  borderRadius: 10,
  padding: "2px 6px",
  fontWeight: "bold"
}));

const ToolbarContent = styled(Box)({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between"
});

const ToolbarSection = styled(Box)({
  display: "flex",
  alignItems: "center"
});

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const LoggedInLayout = ({ children }) => {
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, handleLogout, loading } = useContext(AuthContext);
  const { makeRequestSettings } = useContext(GlobalContext);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupUrl, setBackupUrl] = useState(null);
  const [dueDateEmailModalOpen, setDueDateEmailModalOpen] = useState(false);
  const [backupAnchorEl, setBackupAnchorEl] = useState(null);
  const [backupMenuOpen, setBackupMenuOpen] = useState(false);
  const [profileImg, setProfileImg] = useState(null);
  const [tasksCount, setTasksCount] = useState({ overdueCount: 0, openCount: 0 });
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const { dateToClient } = useDate();

  const socketManager = useContext(SocketContext);
  const [drawerOpen, setDrawerOpen] = useState(user?.defaultMenu === "open");

  // Estados para configuração de pesquisa de satisfação
  const [settings, setSettings] = useState([]);
  const [enableSatisfactionSurvey, setEnableSatisfactionSurvey] = useState(false);
  const { getAll } = useSettings();

  // Carregar configurações
  useEffect(() => {
    const loadSettings = async () => {
      const settingsData = await getAll();
      setSettings(settingsData);
      
      // Encontrar configuração de pesquisa de satisfação
      const satisfactionSurveySetting = settingsData.find(s => s.key === "enableSatisfactionSurvey");
      setEnableSatisfactionSurvey(satisfactionSurveySetting?.value === "enabled");
    };

    loadSettings();
  }, [makeRequestSettings, getAll]);

  useEffect(() => {
    setDrawerOpen(user?.defaultMenu === "open");
  }, [user?.defaultMenu]);

  useEffect(() => {    
    const fetchTasksCount = async () => {
      try {
        const { data } = await api.get('/task/status-count');
        setTasksCount(data);
      } catch (error) {
        console.error(error);
        setTasksCount({ overdueCount: 0, openCount: 0 });
      }
    };

    fetchTasksCount();
    
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    
    socket.on('task-update', fetchTasksCount);
    
    return () => {
      socket.off('task-update', fetchTasksCount);
    };
  }, [socketManager]);

  useEffect(() => {
    if (!user?.id) return;

    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
    
    if (user?.profilePic) {
      setProfileImg(`${backendUrl}/public/company${companyId}/profile/${user.profilePic}`);
    } else {
      setProfileImg(`${frontendUrl}/assets/nopicture.png`);
    }

    const socket = socketManager.GetSocket(companyId);
    
    const onCompanyAuthLayout = (data) => {
      if (data.user.id === +userId) {
        toast.error("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    };

    socket.on(`company-${companyId}-auth`, onCompanyAuthLayout);
    
    return () => {
      socket.off(`company-${companyId}-auth`, onCompanyAuthLayout);
    };
  }, [socketManager, user]);

  useEffect(() => {
    if (!user?.id) return;
    
    let timeoutId = null;
    const companyId = localStorage.getItem("companyId"); 
    
    const socket = socketManager.GetSocket(companyId);
    
    const updateStatus = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        socket.emit("userStatus");
      }, 500);
    };
  
    updateStatus();
    const interval = setInterval(updateStatus, 1000 * 60 * 5);
  
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [socketManager, user]);

  useEffect(() => {
    if (!user?.id) return;
    
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    
    // Garante que todos os eventos de chat são recebidos, mesmo quando não está na tela de chat
    const setupChatListeners = () => {
      const chatRoomHandler = (data) => {
        console.log("Chat room event received in main layout:", data);
        // Evento será tratado pelo ChatPopover, não precisamos fazer nada aqui
      };
      
      // Escuta eventos de chat geral da empresa
      socket.on(`company-${companyId}-chat`, chatRoomHandler);
      
      // Escuta eventos de chat específicos para o usuário
      socket.on(`company-${companyId}-chat-user-${user.id}`, chatRoomHandler);
      
      return () => {
        socket.off(`company-${companyId}-chat`, chatRoomHandler);
        socket.off(`company-${companyId}-chat-user-${user.id}`, chatRoomHandler);
      };
    };
    
    const cleanup = setupChatListeners();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [user?.id, socketManager]);

  const handleDrawerClose = () => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleBackupMenu = (event) => {
    setBackupAnchorEl(event.currentTarget);
    setBackupMenuOpen(true);
  };

  const handleCloseBackupMenu = () => {
    setBackupAnchorEl(null);
    setBackupMenuOpen(false);
  };

  const handleOpenBackupModal = () => {
    setBackupModalOpen(true);
    handleCloseBackupMenu();
  };

  const handleBackup = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await api.get(`${backendUrl}/api/backup`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers["content-disposition"];
      const fileName = contentDisposition
      ? contentDisposition.split("filename=")[1]
      : "backup.zip";

    setBackupUrl({ url, fileName });
    handleOpenBackupModal();
  } catch (error) {
    console.log(error);
    toast.error("Erro ao gerar backup");
  }
};

const handleDueDateEmail = () => {
  setDueDateEmailModalOpen(true);
  handleCloseBackupMenu();
};

const handleProfileMenu = (event) => {
  setAnchorEl(event.currentTarget);
  setMenuOpen(true);
};

const handleCloseProfileMenu = () => {
  setAnchorEl(null);
  setMenuOpen(false);
};

const handleLanguageMenu = (event) => {
  setLanguageAnchorEl(event.currentTarget);
  setLanguageMenuOpen(true);
};

const handleCloseLanguageMenu = () => {
  setLanguageAnchorEl(null);
  setLanguageMenuOpen(false);
};

const handleChooseLanguage = (language) => {
  localStorage.setItem("language", language);
  handleCloseLanguageMenu();
  window.location.reload(false);
};

const handleClickLogout = () => {
  handleCloseProfileMenu();
  handleLogout();
};

const handleProfileClick = () => {
  handleCloseProfileMenu();
  history.push("/profile");
};

const handleRefreshPage = () => {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name);
    });
  });
  window.location.reload(false);
};

const toggleColorMode = () => {
  colorMode.toggleColorMode();
};

const handleMobileMenuOpen = (event) => {
  setMobileMenuAnchorEl(event.currentTarget);
};

const handleMobileMenuClose = () => {
  setMobileMenuAnchorEl(null);
};

if (loading) {
  return <BackdropLoading />;
}

// Verifica se deve exibir os componentes de pesquisa de satisfação
const shouldShowSatisfactionReport = () => {
  const companyId = localStorage.getItem("companyId");
  return enableSatisfactionSurvey && companyId === "1";
};

const shouldShowSatisfactionSurveyForm = () => {
  const companyId = localStorage.getItem("companyId");
  return enableSatisfactionSurvey && companyId !== "1";
};

return (
  <Root>
    <FacebookPixelTracker />
    <CustomDrawerPaper
      variant={drawerVariant}
      open={drawerOpen}
      onClose={handleDrawerClose}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <ToolbarIcon>
        <Logo open={drawerOpen} alt="logo" />
        <IconButton 
          onClick={handleDrawerClose} 
          size="large"
          color="inherit"
        >
          <ChevronLeftIcon />
        </IconButton>
      </ToolbarIcon>
      <Divider />
      <ContainerWithScroll>
        <MainListItems collapsed={!drawerOpen} />
      </ContainerWithScroll>
      <Divider />
    </CustomDrawerPaper>
    
    <BackupModal
      open={backupModalOpen}
      onClose={() => setBackupModalOpen(false)}
      backupUrl={backupUrl}
    />
    
    <DueDateEmailModal
      open={dueDateEmailModalOpen}
      onClose={() => setDueDateEmailModalOpen(false)}
    />
    
    <CustomAppBar
      position="fixed"
      open={drawerOpen}
      color="primary"
    >
      <CustomToolbar>
        <ToolbarContent>
          {/* Seção esquerda com menu e nome */}
          <ToolbarSection>
            <IconButton
              edge="start"
              aria-label="open drawer"
              style={{ color: "white" }}
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={clsx(drawerOpen && "menuButtonHidden")}
              size="large"
            >
              <MenuIcon />
            </IconButton>
            
            {isMobile && (
              <UserInfoContainer>
                <Typography variant="body1" noWrap>
                  {user.name}
                  {tasksCount.overdueCount > 0 && (
                    <TaskIndicator>
                      {tasksCount.overdueCount}
                    </TaskIndicator>
                  )}
                </Typography>
              </UserInfoContainer>
            )}

            {/* Exibir informação adicional em telas maiores */}
            {greaterThenSm && (
              <TitleTypography
                component="h2"
                variant="h6"
                color="inherit"
                noWrap
              >
                {tasksCount.overdueCount > 0 ? (
                  <>
                    Olá, <b>{user.name}</b>, você tem {tasksCount.overdueCount} {tasksCount.overdueCount === 1 ? 'tarefa atribuída vencida' : 'tarefas atribuídas vencidas'}!
                  </>
                ) : tasksCount.openCount > 0 ? (
                  <>
                    Olá, <b>{user.name}</b>, você tem {tasksCount.openCount} {tasksCount.openCount === 1 ? 'tarefa atribuída' : 'tarefas atribuídas'} em aberto!
                  </>
                ) : (
                  <>
                    {i18n.t("mainDrawer.appBar.greetings.one")}
                    <b>{user.name}</b>, {i18n.t("mainDrawer.appBar.greetings.two")}
                    <b>{user?.company?.name}</b>!
                    {greaterThenSm && user?.profile === "admin" && user?.company?.dueDate && (
                      <> ({i18n.t("mainDrawer.appBar.greetings.three")} {dateToClient(user?.company?.dueDate)})</>
                    )}
                  </>
                )}
              </TitleTypography>
            )}
          </ToolbarSection>

          {/* Seção direita com ícones de ação */}
          <ToolbarSection>
            {isMobile && (
              <Tooltip title="Tickets" arrow>
                <IconButton
                  onClick={() => history.push('/tickets')}
                  color="inherit"
                  size="large"
                >
                  <TicketsIcon style={{ color: "white" }} />
                </IconButton>
              </Tooltip>
            )}

            {user.super && !isMobile && (
              <>
                <Tooltip title={i18n.t("mainDrawer.appBar.backup.title")} arrow>
                  <IconButton
                    onClick={handleBackupMenu}
                    color="inherit"
                    size="large"
                  >
                    <BackupIcon style={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="backup-menu"
                  anchorEl={backupAnchorEl}
                  keepMounted
                  open={backupMenuOpen}
                  onClose={handleCloseBackupMenu}
                >
                  <MenuItem onClick={handleBackup}>
                    <ListItemIcon>
                      <StorageIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.appBar.backup.backup")} />
                  </MenuItem>
                  <MenuItem onClick={handleDueDateEmail}>
                    <ListItemIcon>
                      <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.appBar.backup.schedule")} />
                  </MenuItem>
                </Menu>
              </>
            )}

            {!isMobile && (
              <NotificationsVolume 
                setVolume={setVolume} 
                volume={volume}
                onVolumeChange={(newVolume) => {
                  setVolume(newVolume);
                  localStorage.setItem("volume", newVolume);
                }}
              />
            )}

            {!isMobile && (
              <Tooltip title={i18n.t("mainDrawer.appBar.refresh")} arrow>
                <IconButton
                  onClick={handleRefreshPage}
                  color="inherit"
                  size="large"
                >
                  <CachedIcon style={{ color: "white" }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Notificações de tarefas - visível em todas as telas */}
            {user.id && (
              <NotificationsTaskPopOver />
            )}

            {/* Notificações de tickets - visível em todas as telas */}
            {user.id && (
              <NotificationsPopOver volume={volume} />
            )}

            {/* Componentes de pesquisa de satisfação - visíveis somente se configuração estiver ativa */}
            {!isMobile && user.id && shouldShowSatisfactionReport() && <SatisfactionReport />}
            {!isMobile && user.id && shouldShowSatisfactionSurveyForm() && <EnhancedSatisfactionSurvey />}
            
            {!isMobile && <AnnouncementsPopover />}
            {!isMobile && <ChatPopover />}
            
            {/* Avatar do usuário com menu completo */}
            <Tooltip title={i18n.t("mainDrawer.appBar.user.profile")} arrow>
              <IconButton 
                color="inherit" 
                onClick={handleProfileMenu}
              >
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  <Avatar2 alt="User" src={profileImg} />
                </StyledBadge>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseProfileMenu}
              sx={isMobile ? { 
                '& .MuiPaper-root': { 
                  maxWidth: '80vw', 
                  width: 250 
                }
              } : undefined}
            >
              <MenuItem2 onClick={handleProfileClick}>
                <MenuItemIcon2>
                  <PersonIcon fontSize="small" />
                </MenuItemIcon2>
                <ListItemText primary={i18n.t("mainDrawer.appBar.user.profile")} />
              </MenuItem2>
              
              <MenuItem2 onClick={toggleColorMode}>
                <MenuItemIcon2>
                  {theme.mode === "dark" ? (
                    <Brightness7Icon fontSize="small" />
                  ) : (
                    <Brightness4Icon fontSize="small" />
                  )}
                </MenuItemIcon2>
                <ListItemText
                  primary={
                    theme.mode === "dark"
                      ? i18n.t("mainDrawer.appBar.user.lightmode")
                      : i18n.t("mainDrawer.appBar.user.darkmode")
                  }
                />
              </MenuItem2>
              
              {isMobile && (
                <MenuItem2 onClick={handleRefreshPage}>
                  <MenuItemIcon2>
                    <CachedIcon fontSize="small" />
                  </MenuItemIcon2>
                  <ListItemText primary={i18n.t("mainDrawer.appBar.refresh")} />
                </MenuItem2>
              )}
              
              {isMobile && user.super && (
                <MenuItem2 onClick={handleBackup}>
                  <MenuItemIcon2>
                    <BackupIcon fontSize="small" />
                  </MenuItemIcon2>
                  <ListItemText primary={i18n.t("mainDrawer.appBar.backup.backup")} />
                </MenuItem2>
              )}
              
              {isMobile && user.super && (
                <MenuItem2 onClick={handleDueDateEmail}>
                  <MenuItemIcon2>
                    <EmailIcon fontSize="small" />
                  </MenuItemIcon2>
                  <ListItemText primary={i18n.t("mainDrawer.appBar.backup.schedule")} />
                </MenuItem2>
              )}
              
              {isMobile && (
                <MenuItem2>
                  <MenuItemIcon2>
                    <VolumeUpIcon fontSize="small" />
                  </MenuItemIcon2>
                  <ListItemText 
                    primary={i18n.t("mainDrawer.appBar.volume")} 
                    secondary={
                      <NotificationsVolume 
                        setVolume={setVolume} 
                        volume={volume}
                        onVolumeChange={(newVolume) => {
                          setVolume(newVolume);
                          localStorage.setItem("volume", newVolume);
                        }}
                        style={{marginLeft: 0, backgroundColor: 'transparent', color: theme.palette.text.primary}}
                      />
                    }
                  />
                </MenuItem2>
              )}
              
              <MenuItem2 onClick={handleLanguageMenu}>
                <MenuItemIcon2>
                  <LanguageIcon fontSize="small" />
                </MenuItemIcon2>
                <ListItemText primary={i18n.t("mainDrawer.appBar.user.language")} />
                <KeyboardArrowRightIcon fontSize="small" />
              </MenuItem2>
              
              <Divider />
              
              <MenuItem2 onClick={handleClickLogout}>
                <MenuItemIcon2>
                  <ExitToAppIcon fontSize="small" />
                </MenuItemIcon2>
                <ListItemText primary={i18n.t("mainDrawer.appBar.user.logout")} />
              </MenuItem2>
            </Menu>

            <Menu
              id="language-menu"
              anchorEl={languageAnchorEl}
              keepMounted
              open={languageMenuOpen}
              onClose={handleCloseLanguageMenu}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{ zIndex: 9999 }}
            >
              {Object.keys(messages).map((m) => (
                <NestedMenuItem
                  key={m}
                  onClick={() => handleChooseLanguage(m)}
                >
                  <ReactCountryFlag
                    countryCode={
                      messages[m]?.translations?.mainDrawer?.appBar?.i18n
                        ?.language_short
                    }
                    svg
                    style={{
                      width: "1.5em",
                      height: "1.5em",
                      marginRight: "0.5em",
                    }}
                  />
                  {messages[m].translations.mainDrawer.appBar.i18n.language}
                </NestedMenuItem>
              ))}
            </Menu>
          </ToolbarSection>
        </ToolbarContent>
      </CustomToolbar>
    </CustomAppBar>
    
    <Content>
      <AppBarSpacer />
      {children}
    </Content>
  </Root>
);
};

export default LoggedInLayout;