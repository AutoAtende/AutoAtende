import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Collapse,
  Divider,
  CircularProgress,
  Badge
} from "@mui/material";
import {
  AutoAwesome as AutoIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { useSpring, animated } from "react-spring";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useGroupSeriesGlobalStats, useGroupSeriesNotifications } from "./useGroupSeries";

const AnimatedCard = animated(Card);

const GroupSeriesSystemStatus = ({ 
  onViewDetails, 
  onOpenSettings, 
  compact = false 
}) => {
  const { stats, loading, refetch } = useGroupSeriesGlobalStats();
  const { notifications, unreadCount } = useGroupSeriesNotifications();
  const [expanded, setExpanded] = useState(!compact);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Animação para o card
  const springProps = useSpring({
    opacity: loading ? 0.8 : 1,
    transform: loading ? 'scale(0.98)' : 'scale(1)',
    config: { tension: 200, friction: 20 }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  const getSystemHealthStatus = () => {
    if (stats.totalSeries === 0) {
      return {
        status: "inactive",
        label: "Inativo",
        color: "default",
        icon: <PauseIcon />,
        message: "Nenhuma série configurada"
      };
    }

    if (stats.activeSeries === 0) {
      return {
        status: "paused",
        label: "Pausado",
        color: "warning",
        icon: <PauseIcon />,
        message: "Todas as séries estão pausadas"
      };
    }

    if (stats.seriesNearCapacity > 0) {
      return {
        status: "warning",
        label: "Atenção",
        color: "warning",
        icon: <WarningIcon />,
        message: `${stats.seriesNearCapacity} série(s) próxima(s) da capacidade`
      };
    }

    return {
      status: "healthy",
      label: "Saudável",
      color: "success",
      icon: <CheckIcon />,
      message: "Sistema funcionando normalmente"
    };
  };

  const health = getSystemHealthStatus();

  const renderCompactView = () => (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: `${health.color}.main` }}>
          {health.icon}
        </Avatar>
        <Box>
          <Typography variant="body1" fontWeight="600">
            Sistema de Grupos Automáticos
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {stats.activeSeries}/{stats.totalSeries} séries • {stats.totalGroups} grupos
          </Typography>
        </Box>
      </Box>
      
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          icon={health.icon}
          label={health.label}
          size="small"
          color={health.color}
          variant="outlined"
        />
        {unreadCount > 0 && (
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon color="action" />
          </Badge>
        )}
        <IconButton size="small" onClick={() => setExpanded(true)}>
          <ExpandMoreIcon />
        </IconButton>
      </Box>
    </Box>
  );

  const renderExpandedView = () => (
    <Box>
      {/* Cabeçalho */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoIcon color="primary" />
          <Typography variant="h6">
            Sistema de Grupos Automáticos
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            icon={health.icon}
            label={health.label}
            color={health.color}
            variant="outlined"
          />
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon color="action" />
            </Badge>
          )}
          <Tooltip title="Atualizar">
            <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          {compact && (
            <IconButton size="small" onClick={() => setExpanded(false)}>
              <ExpandLessIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Status Geral */}
      <Alert 
        severity={health.status === "healthy" ? "success" : health.status === "warning" ? "warning" : "info"}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          {health.message}
        </Typography>
      </Alert>

      {/* Métricas Principais */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AutoIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" gutterBottom>
                {stats.totalSeries}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Séries Criadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <PlayIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" gutterBottom>
                {stats.activeSeries}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Séries Ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <GroupIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" gutterBottom>
                {stats.totalGroups}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Grupos Criados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <TrendingUpIcon color="secondary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" gutterBottom>
                {stats.totalParticipants}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Participantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Performance do Sistema
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <SpeedIcon color="primary" />
            <Box flex={1}>
              <Typography variant="body2">
                Ocupação Média: {stats.averageOccupancy}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.averageOccupancy}
                color={stats.averageOccupancy > 80 ? "warning" : "primary"}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Grupos criados hoje
              </Typography>
              <Typography variant="h6">
                {stats.groupsCreatedToday}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Séries próximas da capacidade
              </Typography>
              <Typography variant="h6" color={stats.seriesNearCapacity > 0 ? "warning.main" : "text.primary"}>
                {stats.seriesNearCapacity}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notificações Recentes */}
      {notifications.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justify="space-between" mb={2}>
              <Typography variant="subtitle2">
                Atividade Recente
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} não lidas`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
            
            <List dense>
              {notifications.slice(0, 3).map((notification) => (
                <ListItem key={notification.id}>
                  <ListItemIcon>
                    {notification.type === "group_created" && <GroupIcon color="success" />}
                    {notification.type === "group_deactivated" && <WarningIcon color="warning" />}
                    {notification.type === "monitoring_error" && <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <ListItemSecondaryAction>
                      <Badge color="error" variant="dot" />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
            
            {notifications.length > 3 && (
              <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                ... e mais {notifications.length - 3} notificação(ões)
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Box display="flex" gap={1} mb={2}>
        {onViewDetails && (
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
            onClick={onViewDetails}
          >
            Ver Dashboard
          </Button>
        )}
        
        {onOpenSettings && (
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={onOpenSettings}
          >
            Configurações
          </Button>
        )}
      </Box>

      {/* Última Atualização */}
      <Divider sx={{ mb: 1 }} />
      <Typography variant="caption" color="textSecondary">
        Última atualização: {formatDistanceToNow(lastRefresh, { 
          addSuffix: true, 
          locale: ptBR 
        })}
      </Typography>
    </Box>
  );

  if (loading && stats.totalSeries === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={3}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Carregando status do sistema...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatedCard style={springProps} elevation={2}>
      <CardContent>
        <Collapse in={!expanded} timeout={300}>
          {!expanded && renderCompactView()}
        </Collapse>
        
        <Collapse in={expanded} timeout={300}>
          {expanded && renderExpandedView()}
        </Collapse>
      </CardContent>
    </AnimatedCard>
  );
};

export default GroupSeriesSystemStatus;