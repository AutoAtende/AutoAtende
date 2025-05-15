import React from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Speed,
  Memory,
  Storage,
  Warning,
  InfoOutlined,
  CloudQueue,
  NetworkCheck
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { i18n } from "../../../translate/i18n";

const ResourceUsage = ({ label, value, warning, critical, icon: Icon }) => {
  const theme = useTheme();
  const getColor = (value) => {
    if (value >= critical) return theme.palette.error.main;
    if (value >= warning) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon color="primary" />
          <Typography variant="body2">{label}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: getColor(value) }}>
          {value}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: getColor(value)
          }
        }}
      />
    </Box>
  );
};

const PerformanceMetricsCard = ({ metrics, getColorScale }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Speed color="primary" />
            <Typography variant="h6">
              {i18n.t("adminDashboard.performance.title")}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {metrics?.status === 'healthy' ? (
              <Chip
                icon={<CloudQueue />}
                label={i18n.t("adminDashboard.performance.healthy")}
                color="success"
                size="small"
              />
            ) : (
              <Chip
                icon={<Warning />}
                label={i18n.t("adminDashboard.performance.issues")}
                color="warning"
                size="small"
              />
            )}
            <Tooltip title={i18n.t("adminDashboard.performance.info")}>
              <IconButton size="small">
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Uso de recursos */}
          <Grid item xs={12} md={6}>
            <ResourceUsage
              label={i18n.t("adminDashboard.performance.cpuUsage")}
              value={metrics?.cpu?.usage || 0}
              warning={70}
              critical={90}
              icon={Memory}
            />
            <ResourceUsage
              label={i18n.t("adminDashboard.performance.memoryUsage")}
              value={metrics?.memory?.usagePercent || 0}
              warning={80}
              critical={95}
              icon={Storage}
            />
            <ResourceUsage
              label={i18n.t("adminDashboard.performance.networkUsage")}
              value={metrics?.network?.usage || 0}
              warning={75}
              critical={90}
              icon={NetworkCheck}
            />

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t("adminDashboard.performance.systemInfo")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {i18n.t("adminDashboard.performance.cpuCores")}
                    </Typography>
                    <Typography variant="h6">
                      {metrics?.cpu?.cores || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {i18n.t("adminDashboard.performance.totalMemory")}
                    </Typography>
                    <Typography variant="h6">
                      {`${Math.round((metrics?.memory?.total || 0) / (1024 * 1024 * 1024))}GB`}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Gráficos de performance */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.cpu?.history || []}>
                  <defs>
                    <linearGradient id="cpuColor" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip
                    formatter={(value) => [`${value}%`, i18n.t("adminDashboard.performance.cpuUsage")]}
                  />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#cpuColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            {/* Status checks */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t("adminDashboard.performance.statusChecks")}
              </Typography>
              <Grid container spacing={1}>
                {[
                  { key: 'database', icon: Storage },
                  { key: 'cache', icon: Memory },
                  { key: 'network', icon: NetworkCheck }
                ].map((service) => (
                  <Grid item xs={4} key={service.key}>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <service.icon
                        color={metrics?.status?.[service.key] === 'healthy' ? 'success' : 'error'}
                      />
                      <Typography variant="caption" align="center">
                        {i18n.t(`adminDashboard.performance.services.${service.key}`)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Alertas e Recomendações */}
          {metrics?.alerts?.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="warning" />
                  {i18n.t("adminDashboard.performance.alerts")}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {metrics.alerts.map((alert, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        borderLeft: `4px solid ${theme.palette[alert.severity].main}`
                      }}
                    >
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Métricas de performance em tempo real */}
          <Grid item xs={12}>
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
                mt: 2
              }}
            >
              {[
                {
                  label: i18n.t("adminDashboard.performance.avgResponseTime"),
                  value: `${metrics?.performance?.avgResponseTime || 0}ms`,
                  icon: Speed,
                  color: 'primary'
                },
                {
                  label: i18n.t("adminDashboard.performance.requestsPerSecond"),
                  value: metrics?.performance?.requestsPerSecond || 0,
                  icon: NetworkCheck,
                  color: 'success'
                },
                {
                  label: i18n.t("adminDashboard.performance.errorRate"),
                  value: `${(metrics?.performance?.errorRate || 0).toFixed(2)}%`,
                  icon: Warning,
                  color: 'error'
                }
              ].map((metric) => (
                <Box 
                  key={metric.label}
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <metric.icon color={metric.color} />
                  <Typography variant="h6" color={`${metric.color}.main`}>
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" align="center">
                    {metric.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;
