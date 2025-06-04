import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  Button,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Avatar
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  AutoAwesome as AutoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  PlayCircle as PlayIcon,
  Error as ErrorIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import StandardTabContent from "../../../components/shared/StandardTabContent";

const GroupMonitoringDashboard = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monitoringStats, setMonitoringStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    loadDashboardData();
    setupSocketListeners();
  }, []);

  const setupSocketListeners = () => {
    const socket = socketManager.GetSocket(user.companyId);
    
    if (socket) {
      // Listener para criação automática de grupos
      socket.on("auto-group-created", (data) => {
        setLiveUpdates(prev => [
          {
            id: Date.now(),
            type: "group_created",
            timestamp: new Date(),
            data: data
          },
          ...prev.slice(0, 9)
        ]);
        
        // Atualizar estatísticas
        loadDashboardData();
      });

      // Listener para grupos desativados
      socket.on("auto-group-deactivated", (data) => {
        setLiveUpdates(prev => [
          {
            id: Date.now(),
            type: "group_deactivated", 
            timestamp: new Date(),
            data: data
          },
          ...prev.slice(0, 9)
        ]);
      });

      // Listener para estatísticas de monitoramento
      socket.on("group-monitoring-stats", (data) => {
        if (data.action === "monitoring_completed") {
          setMonitoringStats(data.stats);
        }
      });

      return () => {
        socket.off("auto-group-created");
        socket.off("auto-group-deactivated");
        socket.off("group-monitoring-stats");
      };
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [seriesResponse, healthResponse] = await Promise.all([
        api.get("/group-series"),
        api.get("/group-series/monitor") // Endpoint para health check
      ]);

      // Calcular estatísticas das séries
      const series = seriesResponse.data;
      const stats = calculateStats(series);
      setMonitoringStats(stats);

      // Simular dados de atividade recente (em produção viria do backend)
      generateRecentActivity(series);

      // Health status do sistema
      setSystemHealth({
        status: "healthy",
        lastCheck: new Date(),
        issues: []
      });

    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (series) => {
    const totalSeries = series.length;
    const activeSeries = series.filter(s => s.autoCreateEnabled).length;
    const totalConnections = new Set(series.map(s => s.whatsappId)).size;
    
    return {
      totalSeries,
      activeSeries,
      inactiveSeries: totalSeries - activeSeries,
      totalConnections,
      lastMonitoringRun: new Date(),
      groupsCreatedToday: Math.floor(Math.random() * 15), // Simulado
      averageOccupancy: 78.5, // Simulado
      seriesNearCapacity: Math.floor(Math.random() * 3)
    };
  };

  const generateRecentActivity = (series) => {
    const activities = [];
    const now = new Date();

    // Simular atividades recentes
    for (let i = 0; i < 10; i++) {
      const randomSeries = series[Math.floor(Math.random() * series.length)];
      const types = ["group_created", "threshold_reached", "series_updated", "monitoring_run"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      activities.push({
        id: i,
        type: randomType,
        seriesName: randomSeries?.name || "Série Exemplo",
        timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
        details: getActivityDetails(randomType)
      });
    }

    setRecentActivity(activities.sort((a, b) => b.timestamp - a.timestamp));
  };

  const getActivityDetails = (type) => {
    const details = {
      group_created: "Novo grupo criado automaticamente",
      threshold_reached: "Limite de ocupação atingido",
      series_updated: "Configurações da série atualizadas",
      monitoring_run: "Verificação automática executada"
    };
    return details[type] || "Atividade do sistema";
  };

  const getActivityIcon = (type) => {
    const icons = {
      group_created: <GroupIcon color="success" />,
      threshold_reached: <WarningIcon color="warning" />,
      series_updated: <AutoIcon color="primary" />,
      monitoring_run: <CheckIcon color="info" />
    };
    return icons[type] || <NotificationsIcon />;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success("Dashboard atualizado!");
  };

  const handleRunMonitoring = async () => {
    try {
      await api.post("/group-series/monitor");
      toast.success("Monitoramento manual iniciado");
    } catch (err) {
      toast.error("Erro ao executar monitoramento");
    }
  };

  const renderMetricCard = (title, value, subtitle, icon, color = "primary", trend = null) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSystemHealth = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Status do Sistema
          </Typography>
          <Chip
            icon={<CheckIcon />}
            label="Saudável"
            color="success"
            variant="outlined"
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <SpeedIcon color="primary" />
          <Box flex={1}>
            <Typography variant="body2">
              Performance do Monitoramento
            </Typography>
            <LinearProgress
              variant="determinate"
              value={92}
              color="success"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            92%
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <ScheduleIcon color="primary" />
          <Box>
            <Typography variant="body2">
              Última Verificação
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {systemHealth?.lastCheck ? formatDistanceToNow(systemHealth.lastCheck, { 
                addSuffix: true, 
                locale: ptBR 
              }) : "Carregando..."}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Atividade Recente
          </Typography>
          <Tooltip title="Atualizar">
            <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <List dense>
          {recentActivity.slice(0, 8).map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem>
                <ListItemIcon>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                <ListItemText
                  primary={activity.details}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {activity.seriesName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        • {formatDistanceToNow(activity.timestamp, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        {recentActivity.length === 0 && (
          <Box textAlign="center" py={3}>
            <TimelineIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Nenhuma atividade recente
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderLiveUpdates = () => {
    if (liveUpdates.length === 0) return null;

    return (
      <Paper sx={{ p: 2, mb: 3, bgcolor: "primary.light", color: "primary.contrastText" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsIcon />
          <Typography variant="subtitle2">
            Atualizações em Tempo Real
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Último evento: {liveUpdates[0]?.data?.action || "Sistema monitorando..."}
        </Typography>
      </Paper>
    );
  };

  // Estatísticas para o cabeçalho
  const stats = monitoringStats ? [
    {
      label: `${monitoringStats.activeSeries} séries ativas`,
      icon: <AutoIcon />,
      color: 'success'
    },
    {
      label: `${monitoringStats.groupsCreatedToday} grupos hoje`,
      icon: <GroupIcon />,
      color: 'primary'
    },
    {
      label: `${monitoringStats.averageOccupancy}% ocupação média`,
      icon: <TrendingUpIcon />,
      color: 'info'
    }
  ] : [];

  // Alertas
  const alerts = [];
  
  if (monitoringStats?.seriesNearCapacity > 0) {
    alerts.push({
      severity: "warning",
      title: "Séries próximas da capacidade",
      message: `${monitoringStats.seriesNearCapacity} série(s) com grupos próximos da capacidade máxima.`
    });
  }

  // Ações do cabeçalho
  const actions = (
    <Box display="flex" gap={1}>
      <Button
        variant="outlined"
        startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={handleRefresh}
        disabled={refreshing}
      >
        Atualizar
      </Button>
      
      <Button
        variant="contained"
        startIcon={<PlayIcon />}
        onClick={handleRunMonitoring}
      >
        Executar Monitoramento
      </Button>
    </Box>
  );

  if (loading) {
    return (
      <StandardTabContent
        title="Dashboard de Monitoramento"
        description="Acompanhe o desempenho das séries de grupos em tempo real"
        icon={<DashboardIcon />}
        variant="padded"
      >
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={40} />
        </Box>
      </StandardTabContent>
    );
  }

  return (
    <StandardTabContent
      title="Dashboard de Monitoramento"
      description="Acompanhe o desempenho das séries de grupos em tempo real"
      icon={<DashboardIcon />}
      stats={stats}
      alerts={alerts}
      actions={actions}
      variant="default"
    >
      {renderLiveUpdates()}
      
      <Grid container spacing={3}>
        {/* Métricas Principais */}
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Séries Ativas",
            monitoringStats?.activeSeries || 0,
            `${monitoringStats?.totalSeries || 0} total`,
            <AutoIcon />,
            "primary",
            "+12% esta semana"
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Grupos Criados Hoje",
            monitoringStats?.groupsCreatedToday || 0,
            "Criação automática",
            <GroupIcon />,
            "success",
            "+3 desde ontem"
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Ocupação Média",
            `${monitoringStats?.averageOccupancy || 0}%`,
            "Todos os grupos",
            <PeopleIcon />,
            "info"
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Conexões Ativas",
            monitoringStats?.totalConnections || 0,
            "WhatsApp conectado",
            <AdminIcon />,
            "warning"
          )}
        </Grid>

        {/* Status do Sistema */}
        <Grid item xs={12} md={6}>
          {renderSystemHealth()}
        </Grid>

        {/* Atividade Recente */}
        <Grid item xs={12} md={6}>
          {renderRecentActivity()}
        </Grid>

        {/* Informações Adicionais */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Sistema de Monitoramento Automático
            </Typography>
            <Typography variant="body2">
              O sistema verifica automaticamente todas as séries a cada 5 minutos. 
              Novos grupos são criados quando necessário e você recebe notificações em tempo real.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </StandardTabContent>
  );
};

export default GroupMonitoringDashboard;