import React, { useState, useContext, useEffect } from "react";
import {
  Paper,
  Grid,
  Avatar,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Divider
} from "@mui/material";
import {
  Edit as EditIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Assessment as AssessmentIcon,
  ContactPhone as ContactPhoneIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Campaign as CampaignIcon,
  Visibility as VisibilityIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import UserModal from "../Users/components/UserModal";
import NewTicketModal from "../../components/NewTicketModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { toast } from "../../helpers/toast";

// i18n translations
const i18nTranslations = {
  "pt-BR": {
    profile: {
      title: "Meu Perfil",
      buttons: {
        edit: "Editar Perfil"
      },
      roles: {
        admin: "Administrador",
        user: "Atendente",
        superv: "Supervisor"
      },
      stats: {
        openTickets: "Tickets Abertos",
        closedToday: "Fechados Hoje",
        averageResponseTime: "Tempo Médio de Resposta",
        rating: "Avaliação"
      },
      tabs: {
        dashboard: "Dashboard",
        tickets: "Tickets",
        schedule: "Agenda",
        settings: "Configurações"
      },
      recentTickets: {
        title: "Tickets Recentes",
        contactName: "Nome",
        subject: "Assunto",
        status: "Status",
        lastUpdate: "Atualização",
        actions: "Ações",
        view: "Visualizar Ticket",
        noTickets: "Nenhum ticket encontrado",
        viewAll: "Ver Todos"
      },
      upcoming: {
        schedules: "Agendamentos",
        campaigns: "Campanhas",
        noSchedules: "Nenhum agendamento encontrado",
        noCampaigns: "Nenhuma campanha encontrada",
        viewAll: "Ver Todos"
      },
      settings: {
        title: "Configurações",
        description: "Gerencie suas preferências e detalhes da conta",
        editProfile: "Editar Perfil"
      }
    },
    quickAccess: {
      title: "Acesso Rápido",
      newTicket: "Novo Ticket",
      myTickets: "Meus Tickets"
    },
    ticketsList: {
      status: {
        open: "Aberto",
        pending: "Pendente",
        closed: "Fechado"
      }
    },
    campaigns: {
      scheduledAt: "Agendado para",
      contacts: "contatos"
    }
  }
};

// Componente para mostrar conteúdo baseado na aba selecionada
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [userStats, setUserStats] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [tickets, setTickets] = useState([]);

  // i18n helper function
  const i18n = {
    t: function(key, params = {}) {
      // Dividir a chave em partes usando o ponto como separador
      const parts = key.split('.');
      
      // Iniciar com o objeto de tradução completo
      let current = i18nTranslations["pt-BR"];
      
      // Percorrer cada parte da chave para acessar o valor aninhado
      for (const part of parts) {
        if (current[part] === undefined) {
          return key; // Retorna a chave original se não encontrar tradução
        }
        current = current[part];
      }
      
      // Se o valor atual não for uma string, algo está errado com a chave
      if (typeof current !== 'string') {
        return key;
      }
      
      // Substituir parâmetros se houver
      if (params && Object.keys(params).length > 0) {
        return Object.keys(params).reduce((acc, paramKey) => {
          return acc.replace(`{${paramKey}}`, params[paramKey]);
        }, current);
      }
      
      return current;
    }
  };

  // Funções para lidar com navegação
  const handleOpenTicket = (ticketId) => {
    window.location.href = `/tickets/${ticketId}`;
  };

  const handleOpenNewTicketModal = () => {
    setNewTicketModalOpen(true);
  };

  const handleCloseNewTicketModal = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket) {
      // Se um ticket foi criado, redirecionar para ele
      handleOpenTicket(ticket.id);
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        // Tente obter estatísticas do usuário, caso a API falhe, use dados de exemplo
        try {
          const { data } = await api.get(`/users/stats/${user.id}`);
          setUserStats(data);
        } catch (error) {
          console.log("Usando dados de estatísticas de exemplo");
          setUserStats({
            openTickets: 5,
            closedToday: 12,
            avgResponseTime: "15min",
            rating: 4.8
          });
        }
        
        // Tente obter tickets recentes, caso a API falhe, use dados de exemplo
        try {
          const { data } = await api.get("/tickets", {
            params: {
              userId: user.id,
              pageNumber: 1,
              count: 5,
              isRecent: true
            }
          });
          setTickets(data.tickets || []);
        } catch (error) {
          console.log("Usando dados de tickets de exemplo");
          setTickets([
            {
              id: 1,
              contactId: 1,
              contact: { name: "Cliente Exemplo" },
              status: "open",
              lastMessage: "Preciso de ajuda com meu pedido",
              updatedAt: new Date().toISOString()
            },
            {
              id: 2,
              contactId: 2,
              contact: { name: "Maria Silva" },
              status: "pending",
              lastMessage: "Quando será entregue?",
              updatedAt: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        toast.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user.id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getProfileStatusColor = (profile) => {
    const statusColors = {
      admin: "secondary",
      user: "primary",
      superv: "warning"
    };
    return statusColors[profile] || "default";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <ChatIcon color="primary" />;
      case "pending":
        return <HourglassEmptyIcon color="warning" />;
      case "closed":
        return <CheckIcon color="success" />;
      default:
        return null;
    }
  };

  // Dashboard Section (Acesso Rápido)
  const QuickAccessSection = () => {
    const quickActions = [
      {
        title: i18n.t("quickAccess.newTicket"),
        icon: <AddIcon style={{ fontSize: 40, color: '#3f51b5', marginBottom: 8 }} />,
        onClick: handleOpenNewTicketModal,
        badgeCount: 0
      },
      {
        title: i18n.t("quickAccess.myTickets"),
        icon: <ContactPhoneIcon style={{ fontSize: 40, color: '#3f51b5', marginBottom: 8 }} />,
        path: "/tickets",
        badgeCount: userStats?.openTickets || 0
      }
    ];

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>
          {i18n.t("quickAccess.title")}
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} sm={6} key={index}>
              <Card 
                style={{ 
                  textAlign: 'center', 
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    backgroundColor: '#f5f5f5',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                  }
                }}
                onClick={action.onClick || (() => window.location.href = action.path)}
              >
                {action.icon}
                <Typography align="center">{action.title}</Typography>
                {action.badgeCount > 0 && (
                  <Chip 
                    label={action.badgeCount} 
                    color="error" 
                    size="small"
                    style={{ marginTop: 8 }} 
                  />
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Recent Tickets Section
  const RecentTicketsSection = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>
          {i18n.t("profile.recentTickets.title")}
        </Typography>
        <TableContainer component={Paper} style={{ boxShadow: '0 2px 10px 0 rgba(0,0,0,0.12)', borderRadius: 8 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{i18n.t("profile.recentTickets.contactName")}</TableCell>
                <TableCell>{i18n.t("profile.recentTickets.subject")}</TableCell>
                <TableCell>{i18n.t("profile.recentTickets.status")}</TableCell>
                <TableCell>{i18n.t("profile.recentTickets.lastUpdate")}</TableCell>
                <TableCell align="center">{i18n.t("profile.recentTickets.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {i18n.t("profile.recentTickets.noTickets")}
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.contact?.name || "-"}</TableCell>
                    <TableCell>{ticket.lastMessage || "-"}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(ticket.status)}
                        <Typography variant="body2" style={{ marginLeft: 8 }}>
                          {i18n.t(`ticketsList.status.${ticket.status}`)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title={i18n.t("profile.recentTickets.view")}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenTicket(ticket.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => window.location.href = '/tickets'}
          >
            {i18n.t("profile.recentTickets.viewAll")}
          </Button>
        </Box>
      </Box>
    );
  };

  // Settings Section
  const SettingsSection = () => {
    return (
      <Box style={{ padding: 16 }}>
        <Typography variant="h6" gutterBottom>
          {i18n.t("profile.settings.title")}
        </Typography>
        <Typography color="textSecondary" mb={2}>
          {i18n.t("profile.settings.description")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => setUserModalOpen(true)}
        >
          {i18n.t("profile.settings.editProfile")}
        </Button>
      </Box>
    );
  };

  if (loading) {
    return (
      <MainContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user.id}
      />
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={handleCloseNewTicketModal}
      />
      <MainHeader>
        <Title>{i18n.t("profile.title")}</Title>
      </MainHeader>
      {/* Adicione o Box com overflow-y: auto para permitir rolagem */}
      <Box sx={{ overflow: "auto", height: "calc(100vh - 64px)", padding: "16px" }}>
        <Paper style={{ padding: 24, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box style={{ padding: 24, textAlign: 'center' }}>
                <Tooltip title={i18n.t("profile.buttons.edit")}>
                  <IconButton 
                    style={{ position: 'absolute', right: 16, top: 16 }}
                    onClick={() => setUserModalOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Box
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    marginBottom: 16
                  }}
                >
                  <Avatar 
                    style={{ 
                      width: 160, 
                      height: 160, 
                      margin: '0 auto', 
                      border: '3px solid #3f51b5'
                    }}
                    src={user.profilePic ? `${process.env.REACT_APP_BACKEND_URL}/public/company${user?.companyId}/profile/${user?.profilePic}` : null}
                    alt={user.name}
                  >
                    {user.name ? user.name[0].toUpperCase() : ""}
                  </Avatar>
                  {user.online && (
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: 5,
                        right: 5,
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        backgroundColor: '#4caf50',
                        border: '2px solid white'
                      }}
                    />
                  )}
                  {user.super && (
                    <StarIcon 
                      style={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#ff9800'
                      }}
                    />
                  )}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {user.name}
                </Typography>
                <Chip
                  label={i18n.t(`profile.roles.${user.profile}`)}
                  color={getProfileStatusColor(user.profile)}
                  style={{ marginBottom: 16 }}
                />
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                  <EmailIcon style={{ marginRight: 8 }} />
                  <Typography>{user.email}</Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <AccessTimeIcon style={{ marginRight: 8 }} />
                  <Typography>
                    {user.startWork || '08:00'} - {user.endWork || '18:00'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: 16,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <ContactPhoneIcon color="primary" />
                        <Typography variant="h6" style={{ marginLeft: 8 }}>
                          {i18n.t("profile.stats.openTickets")}
                        </Typography>
                      </Box>
                      <Typography variant="h4" style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: '#3f51b5' 
                      }}>
                        {userStats?.openTickets || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: 16,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <AssessmentIcon color="primary" />
                        <Typography variant="h6" style={{ marginLeft: 8 }}>
                          {i18n.t("profile.stats.closedToday")}
                        </Typography>
                      </Box>
                      <Typography variant="h4" style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: '#3f51b5' 
                      }}>
                        {userStats?.closedToday || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: 16,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <AccessTimeIcon color="primary" />
                        <Typography variant="h6" style={{ marginLeft: 8 }}>
                          {i18n.t("profile.stats.averageResponseTime")}
                        </Typography>
                      </Box>
                      <Typography variant="h4" style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: '#3f51b5' 
                      }}>
                        {userStats?.avgResponseTime || "0min"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: 16,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <StarIcon color="primary" />
                        <Typography variant="h6" style={{ marginLeft: 8 }}>
                          {i18n.t("profile.stats.rating")}
                        </Typography>
                      </Box>
                      <Typography variant="h4" style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: '#3f51b5' 
                      }}>
                        {`${userStats?.rating || 0}★`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Sistema de Abas */}
          <Box style={{ borderBottom: '1px solid #e0e0e0', marginTop: 24 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                icon={<AddIcon />} 
                label={i18n.t("profile.tabs.dashboard")} 
                id="profile-tab-0"
                aria-controls="profile-tabpanel-0"
              />
              <Tab 
                icon={<ContactPhoneIcon />} 
                label={i18n.t("profile.tabs.tickets")} 
                id="profile-tab-1"
                aria-controls="profile-tabpanel-1"
              />
              <Tab 
                icon={<SettingsIcon />} 
                label={i18n.t("profile.tabs.settings")} 
                id="profile-tab-3"
                aria-controls="profile-tabpanel-3"
              />
            </Tabs>
          </Box>

          {/* Conteúdo das Abas */}
          <TabPanel value={tabValue} index={0}>
            <QuickAccessSection />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <RecentTicketsSection />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <SettingsSection />
          </TabPanel>
        </Paper>
      </Box>
    </MainContainer>
  );
};

export default Profile;