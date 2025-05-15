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
  CircularProgress,
  Badge
} from '@mui/material';
import {
  WhatsApp,
  Power,
  PowerOff,
  Sync,
  Warning,
  Speed,
  InfoOutlined,
  SignalCellular4Bar,
  SignalCellular0Bar
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { i18n } from "../../../translate/i18n";

const ConnectionStatus = ({ status, count }) => {
  const theme = useTheme();
  
  const getStatusConfig = (status) => {
    const configs = {
      CONNECTED: {
        icon: <SignalCellular4Bar />,
        color: theme.palette.success.main,
        label: i18n.t("adminDashboard.whatsapp.status.connected")
      },
      DISCONNECTED: {
        icon: <SignalCellular0Bar />,
        color: theme.palette.error.main,
        label: i18n.t("adminDashboard.whatsapp.status.disconnected")
      },
      CONNECTING: {
        icon: <Sync className="rotating" />,
        color: theme.palette.warning.main,
        label: i18n.t("adminDashboard.whatsapp.status.connecting")
      }
    };
    return configs[status] || configs.DISCONNECTED;
  };

  const config = getStatusConfig(status);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{ color: config.color }}>
        {config.icon}
      </Box>
      <Box flex={1}>
        <Typography variant="body2">
          {config.label}
        </Typography>
      </Box>
      <Chip
        label={count}
        size="small"
        sx={{
          bgcolor: config.color,
          color: 'white'
        }}
      />
    </Box>
  );
};

const WhatsAppStatusCard = ({ metrics, getStatusColor }) => {
  const theme = useTheme();

  // Animação para a taxa de entrega
  const deliveryAnimation = useSpring({
    from: { number: 0 },
    to: { number: metrics?.deliveryRate || 0 },
    config: { duration: 1000 }
  });

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <WhatsApp color="primary" />
            <Typography variant="h6">
              {i18n.t("adminDashboard.whatsapp.title")}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge
              badgeContent={metrics?.active || 0}
              color="success"
              max={99}
            >
              <Chip
                icon={<Power />}
                label={i18n.t("adminDashboard.whatsapp.activeConnections")}
                size="small"
                color="primary"
              />
            </Badge>
            <Tooltip title={i18n.t("adminDashboard.whatsapp.info")}>
              <IconButton size="small">
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Status das conexões */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ConnectionStatus
                status="CONNECTED"
                count={metrics?.active || 0}
              />
              <ConnectionStatus
                status="DISCONNECTED"
                count={metrics?.inactive || 0}
              />
              <ConnectionStatus
                status="CONNECTING"
                count={metrics?.connecting || 0}
              />
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Box 
                sx={{ 
                  position: 'relative',
                  display: 'inline-flex' 
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={metrics?.deliveryRate || 0}
                  size={100}
                  thickness={4}
                  sx={{ color: theme.palette.success.main }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" component="div" color="text.secondary">
                    <animated.span>
                      {deliveryAnimation.number.to(n => `${n.toFixed(1)}%`)}
                    </animated.span>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {i18n.t("adminDashboard.whatsapp.deliveryRate")}
              </Typography>
            </Box>
          </Grid>

          {/* Gráfico de mensagens */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.messageVolume || []}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'HH:mm')}
                  />
                  <YAxis />
                  <ChartTooltip
                    formatter={(value) => [
                      value,
                      i18n.t("adminDashboard.whatsapp.messages")
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Métricas adicionais */}
          <Grid item xs={12}>
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 2,
                mt: 2
              }}
            >
              <Box sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <Speed color="primary" />
                <Typography variant="h5">
                  {metrics?.averageResponseTime || 0}s
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("adminDashboard.whatsapp.responseTime")}
                </Typography>
              </Box>

              <Box sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <Warning color="warning" />
                <Typography variant="h5">
                  {metrics?.failureRate?.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("adminDashboard.whatsapp.failureRate")}
                </Typography>
              </Box>

              <Box sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <PowerOff color="error" />
                <Typography variant="h5">
                  {metrics?.disconnectionsToday || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("adminDashboard.whatsapp.disconnections")}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatusCard;