import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../../services/api';

/**
 * Dashboard de monitoramento Socket.io para administradores
 * Exibe métricas em tempo real, alerts e status de saúde
 */
const SocketMetricsDashboard = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  /**
   * Buscar métricas do servidor
   */
  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      
      // Buscar métricas principais
      const [metricsResponse, healthResponse] = await Promise.all([
        api.get('/socket-metrics'),
        api.get('/socket-health'),
      ]);

      setMetrics(metricsResponse.data);
      setHealth(healthResponse.data);
      
      // Extrair alerts das métricas se disponível
      if (metricsResponse.data.alerts) {
        setAlerts(metricsResponse.data.alerts.recent || []);
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
      setError(err.response?.data?.error || 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Auto-refresh das métricas
   */
  useEffect(() => {
    fetchMetrics();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 5000); // Atualizar a cada 5 segundos
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, fetchMetrics]);

  /**
   * Determinar cor do status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return theme.palette.success.main;
      case 'degraded':
        return theme.palette.warning.main;
      case 'unhealthy':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  /**
   * Formatar números grandes
   */
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toString() || '0';
  };

  /**
   * Formatar duração em ms
   */
  const formatDuration = (ms) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  /**
   * Componente de métrica individual
   */
  const MetricCard = ({ title, value, unit, icon: Icon, color, subtitle, progress }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
              {unit && <Typography component="span" variant="h6" color="textSecondary">{unit}</Typography>}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {progress !== undefined && (
              <Box mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  color={progress > 90 ? 'error' : progress > 75 ? 'warning' : 'primary'}
                />
                <Typography variant="caption" color="textSecondary">
                  {progress.toFixed(1)}% utilização
                </Typography>
              </Box>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color }} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <LinearProgress sx={{ mb: 2, width: 200 }} />
          <Typography>Carregando métricas...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={fetchMetrics}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Monitoramento Socket.io
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto-refresh"
          />
          <Tooltip title="Atualizar agora">
            <IconButton onClick={fetchMetrics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Status de Saúde */}
      {health && (
        <Alert 
          severity={health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'error'}
          icon={
            health.status === 'healthy' ? <CheckCircleIcon /> :
            health.status === 'degraded' ? <WarningIcon /> : <ErrorIcon />
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">
            Status: {health.status === 'healthy' ? 'Saudável' : 
                     health.status === 'degraded' ? 'Degradado' : 'Problemático'}
          </Typography>
          <Typography variant="body2">
            {health.connections} conexões ativas • 
            Latência P95: {health.performance?.latency}ms • 
            Uso de memória: {((health.memory?.used / health.memory?.threshold) * 100).toFixed(1)}%
          </Typography>
        </Alert>
      )}

      {/* Alerts Ativos */}
      {alerts && alerts.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Alertas Ativos ({alerts.length})
          </Typography>
          {alerts.map((alert) => (
            <Alert 
              key={alert.id}
              severity={alert.level === 'critical' ? 'error' : 'warning'}
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">{alert.message}</Typography>
              <Typography variant="caption">
                {alert.metric}: {alert.value} (limite: {alert.threshold})
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Métricas Principais */}
      {metrics && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Conexões Ativas"
                value={formatNumber(metrics.connections?.active || 0)}
                icon={PeopleIcon}
                color={theme.palette.primary.main}
                subtitle={`Pico: ${formatNumber(metrics.connections?.peak || 0)}`}
                progress={(metrics.connections?.active / (metrics.connections?.peak || 1)) * 100}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Latência P95"
                value={metrics.performance?.latency?.p95 || 0}
                unit="ms"
                icon={SpeedIcon}
                color={
                  (metrics.performance?.latency?.p95 || 0) > 500 
                    ? theme.palette.error.main 
                    : (metrics.performance?.latency?.p95 || 0) > 200
                    ? theme.palette.warning.main
                    : theme.palette.success.main
                }
                subtitle={`Média: ${metrics.performance?.latency?.average || 0}ms`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Uso de Memória"
                value={metrics.memory?.usage || 0}
                unit="%"
                icon={MemoryIcon}
                color={
                  (metrics.memory?.usage || 0) > 90 
                    ? theme.palette.error.main 
                    : (metrics.memory?.usage || 0) > 75
                    ? theme.palette.warning.main
                    : theme.palette.success.main
                }
                subtitle={`Tendência: ${metrics.memory?.trend || 'estável'}`}
                progress={metrics.memory?.usage || 0}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Eventos/seg"
                value={formatNumber(metrics.performance?.throughput?.eventsPerSecond || 0)}
                icon={TimelineIcon}
                color={theme.palette.info.main}
                subtitle={`Total: ${formatNumber(metrics.performance?.totalEvents || 0)}`}
              />
            </Grid>
          </Grid>

          {/* Métricas Detalhadas */}
          <Grid container spacing={3}>
            {/* Conexões por Empresa */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Conexões por Empresa" />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Empresa</TableCell>
                          <TableCell align="right">Conexões</TableCell>
                          <TableCell align="right">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.connections?.byCompany && 
                         Object.entries(metrics.connections.byCompany)
                           .sort(([,a], [,b]) => b - a)
                           .slice(0, 10)
                           .map(([companyId, count]) => {
                             const percentage = ((count / metrics.connections.active) * 100).toFixed(1);
                             return (
                               <TableRow key={companyId}>
                                 <TableCell>Empresa {companyId}</TableCell>
                                 <TableCell align="right">{count}</TableCell>
                                 <TableCell align="right">{percentage}%</TableCell>
                               </TableRow>
                             );
                           })
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Timeline */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Métricas de Performance" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Latência
                      </Typography>
                      <Typography variant="body2">
                        P50: {metrics.performance?.latency?.p50 || 0}ms
                      </Typography>
                      <Typography variant="body2">
                        P90: {metrics.performance?.latency?.p90 || 0}ms
                      </Typography>
                      <Typography variant="body2">
                        P95: {metrics.performance?.latency?.p95 || 0}ms
                      </Typography>
                      <Typography variant="body2">
                        P99: {metrics.performance?.latency?.p99 || 0}ms
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Throughput
                      </Typography>
                      <Typography variant="body2">
                        Enviados/s: {formatNumber(metrics.performance?.throughput?.sentPerSecond || 0)}
                      </Typography>
                      <Typography variant="body2">
                        Recebidos/s: {formatNumber(metrics.performance?.throughput?.receivedPerSecond || 0)}
                      </Typography>
                      <Typography variant="body2">
                        Taxa de erro: {(metrics.performance?.errorRate || 0).toFixed(2)}%
                      </Typography>
                      <Typography variant="body2">
                        Uptime: {formatDuration(metrics.performance?.uptime || 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Footer com informações de atualização */}
          <Box mt={3} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="caption" color="textSecondary">
              Última atualização: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Nunca'} • 
              Auto-refresh: {autoRefresh ? 'Ativado' : 'Desativado'}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SocketMetricsDashboard;