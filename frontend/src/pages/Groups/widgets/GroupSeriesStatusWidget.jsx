import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Collapse,
  Alert,
  CircularProgress,
  Badge
} from "@mui/material";
import {
  AutoAwesome as AutoIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Error as ErrorIcon
} from "@mui/icons-material";
import { useSpring, animated } from "react-spring";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";

const AnimatedCard = animated(Card);

const GroupSeriesStatusWidget = ({ 
  onViewDetails, 
  onCreateSeries, 
  compact = false,
  showActions = true 
}) => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [seriesData, setSeriesData] = useState([]);
  const [summary, setSummary] = useState({
    totalSeries: 0,
    activeSeries: 0,
    totalGroups: 0,
    totalParticipants: 0,
    alertCount: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Animação para o widget
  const springProps = useSpring({
    opacity: loading ? 0.7 : 1,
    transform: loading ? 'scale(0.98)' : 'scale(1)',
    config: { tension: 300, friction: 25 }
  });

  useEffect(() => {
    loadSeriesData();
    setupSocketListeners();
  }, []);

  const setupSocketListeners = () => {
    if (!user?.companyId) return;

    const socket = socketManager.GetSocket(user.companyId);
    
    if (socket) {
      socket.on("group-series", (data) => {
        setLastUpdate(new Date());
        loadSeriesData(); // Recarregar dados quando houver mudanças
      });

      socket.on("auto-group-created", (data) => {
        setLastUpdate(new Date());
        loadSeriesData();
      });

      return () => {
        socket.off("group-series");
        socket.off("auto-group-created");
      };
    }
  };

  const loadSeriesData = async () => {
    if (!loading) setRefreshing(true);
    
    try {
      const { data } = await api.get("/group-series");
      setSeriesData(data);
      
      // Calcular estatísticas
      const stats = calculateSummary(data);
      setSummary(stats);
      
    } catch (err) {
      console.error("Erro ao carregar dados das séries:", err);
      if (!compact) {
        toast.error("Erro ao carregar dados das séries");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateSummary = (data) => {
    let totalGroups = 0;
    let totalParticipants = 0;
    let alertCount = 0;

    // Simular dados de grupos e participantes (em produção viria do backend)
    data.forEach(series => {
      // Simular número de grupos por série
      const groupCount = Math.floor(Math.random() * 5) + 1;
      totalGroups += groupCount;
      
      // Simular participantes
      totalParticipants += Math.floor(Math.random() * series.maxParticipants * groupCount * 0.8);
      
      // Verificar alertas (séries próximas da capacidade)
      if (Math.random() > 0.7) {
        alertCount++;
      }
    });

    return {
      totalSeries: data.length,
      activeSeries: data.filter(s => s.autoCreateEnabled).length,
      totalGroups,
      totalParticipants,
      alertCount
    };
  };

  const getSeriesStatus = (series) => {
    if (!series.autoCreateEnabled) {
      return { status: 'paused', label: 'Pausado', color: 'default', icon: <PauseIcon /> };
    }
    
    if (series.whatsapp?.status !== 'CONNECTED') {
      return { status: 'error', label: 'Erro', color: 'error', icon: <ErrorIcon /> };
    }
    
    // Simular status baseado em condições
    const random = Math.random();
    if (random > 0.8) {
      return { status: 'warning', label: 'Atenção', color: 'warning', icon: <WarningIcon /> };
    }
    
    return { status: 'active', label: 'Ativo', color: 'success', icon: <CheckIcon /> };
  };

  const handleRefresh = async () => {
    await loadSeriesData();
    toast.success("Dados atualizados!");
  };

  const renderCompactView = () => (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <AutoIcon />
        </Avatar>
        <Box>
          <Typography variant="body1" fontWeight="600">
            {summary.activeSeries}/{summary.totalSeries} Séries Ativas
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {summary.totalGroups} grupos • {summary.totalParticipants} participantes
          </Typography>
        </Box>
      </Box>
      
      <Box display="flex" alignItems="center" gap={1}>
        {summary.alertCount > 0 && (
          <Badge badgeContent={summary.alertCount} color="warning">
            <WarningIcon color="warning" />
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoIcon color="primary" />
          <Typography variant="h6">
            Séries de Grupos
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          {summary.alertCount > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${summary.alertCount} alertas`}
              size="small"
              color="warning"
              variant="outlined"
            />
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

      {/* Estatísticas Resumidas */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip
          icon={<AutoIcon />}
          label={`${summary.totalSeries} Séries`}
          variant="outlined"
          color="primary"
        />
        <Chip
          icon={<PlayIcon />}
          label={`${summary.activeSeries} Ativas`}
          variant="outlined"
          color="success"
        />
        <Chip
          icon={<GroupIcon />}
          label={`${summary.totalGroups} Grupos`}
          variant="outlined"
          color="info"
        />
        <Chip
          icon={<TrendingUpIcon />}
          label={`${summary.totalParticipants} Participantes`}
          variant="outlined"
          color="secondary"
        />
      </Box>

      {/* Lista de Séries */}
      {seriesData.length > 0 ? (
        <List dense>
          {seriesData.slice(0, compact ? 3 : 5).map((series) => {
            const status = getSeriesStatus(series);
            return (
              <ListItem
                key={series.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${status.color}.light`, color: `${status.color}.main` }}>
                    {status.icon}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="500">
                        {series.name}
                      </Typography>
                      <Chip
                        label={status.label}
                        size="small"
                        color={status.color}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {series.baseGroupName} • Max: {series.maxParticipants} • {series.thresholdPercentage}%
                      </Typography>
                      {series.whatsapp && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          WhatsApp: {series.whatsapp.name}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                {showActions && (
                  <Tooltip title="Ver detalhes">
                    <IconButton 
                      size="small" 
                      onClick={() => onViewDetails?.(series)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Nenhuma série de grupos criada ainda.
          </Typography>
        </Alert>
      )}

      {/* Ações */}
      {showActions && (
        <Box display="flex" gap={1} mt={2}>
          {seriesData.length > 0 && onViewDetails && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => onViewDetails(null)}
            >
              Ver Todas
            </Button>
          )}
          {onCreateSeries && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onCreateSeries}
            >
              Nova Série
            </Button>
          )}
        </Box>
      )}

      {/* Última Atualização */}
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Última atualização: {formatDistanceToNow(lastUpdate, { 
          addSuffix: true, 
          locale: ptBR 
        })}
      </Typography>
    </Box>
  );

  if (loading && seriesData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={3}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Carregando séries...
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

export default GroupSeriesStatusWidget;