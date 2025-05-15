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
  Chip,
  Divider
} from '@mui/material';
import {
  Message,
  Forum,
  Schedule,
  TrendingUp,
  Group,
  InfoOutlined,
  Update,
  QueryStats
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { i18n } from "../../../translate/i18n";

const MessagingMetricsCard = ({ metrics, getColorScale }) => {
  const theme = useTheme();

  // Animação para o volume total de mensagens
  const volumeAnimation = useSpring({
    from: { number: 0 },
    to: { number: metrics?.total || 0 },
    config: { duration: 1000 }
  });

  // Formatador de números grandes
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Message color="primary" />
            <Typography variant="h6">
              {i18n.t("adminDashboard.messaging.title")}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Update fontSize="small" />
            <Typography variant="caption" color="textSecondary">
              {i18n.t("adminDashboard.messaging.lastUpdate")}:
              {' '}
              {format(new Date(), 'HH:mm')}
            </Typography>
            <Tooltip title={i18n.t("adminDashboard.messaging.info")}>
              <IconButton size="small">
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Volume de mensagens */}
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h4" gutterBottom>
                <animated.span>
                  {volumeAnimation.number.to(n => formatNumber(Math.floor(n)))}
                </animated.span>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {i18n.t("adminDashboard.messaging.totalMessages")}
              </Typography>
            </Box>

            <Box display="flex" gap={1} mb={2}>
              <Chip
                icon={<Forum />}
                label={`${formatNumber(metrics?.sent || 0)} ${i18n.t("adminDashboard.messaging.sent")}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<Message />}
                label={`${formatNumber(metrics?.received || 0)} ${i18n.t("adminDashboard.messaging.received")}`}
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<Schedule />}
                label={`${metrics?.averageResponseTime || 0}min`}
                color="warning"
                variant="outlined"
              />
            </Box>

            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.hourlyDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}h`}
                  />
                  <YAxis />
                  <ChartTooltip 
                    formatter={(value) => [value, i18n.t("adminDashboard.messaging.messages")]}
                  />
                  <Bar
                    dataKey="count"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Tendências e padrões */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: 350,
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 1
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.trends || []}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
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
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={theme.palette.success.main} 
                        stopOpacity={0.8}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={theme.palette.success.main} 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    name={i18n.t("adminDashboard.messaging.sent")}
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorSent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="received"
                    name={i18n.t("adminDashboard.messaging.received")}
                    stroke={theme.palette.success.main}
                    fillOpacity={1}
                    fill="url(#colorReceived)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Métricas detalhadas */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <QueryStats color="primary" />
                    <Typography variant="body2">
                      {i18n.t("adminDashboard.messaging.engagementRate")}
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {metrics?.engagementRate?.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    +{metrics?.engagementGrowth?.toFixed(1)}% {i18n.t("adminDashboard.messaging.growth")}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Group color="success" />
                    <Typography variant="body2">
                      {i18n.t("adminDashboard.messaging.activeUsers")}
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {formatNumber(metrics?.activeUsers || 0)}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {metrics?.userGrowth > 0 ? '+' : ''}{metrics?.userGrowth?.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Forum color="warning" />
                    <Typography variant="body2">
                      {i18n.t("adminDashboard.messaging.avgMessagesPerUser")}
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {metrics?.avgMessagesPerUser?.toFixed(1)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      {metrics?.messageGrowth?.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Schedule color="info" />
                    <Typography variant="body2">
                      {i18n.t("adminDashboard.messaging.peakHour")}
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {metrics?.peakHour || '--'}h
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatNumber(metrics?.peakHourVolume || 0)} {i18n.t("adminDashboard.messaging.messages")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MessagingMetricsCard;