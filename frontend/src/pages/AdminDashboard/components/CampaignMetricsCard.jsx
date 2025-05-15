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
  Campaign,
  CheckCircle,
  Error,
  Schedule,
  InfoOutlined,
  Timeline
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  BarChart
} from 'recharts';
import { format } from 'date-fns';
import { i18n } from "../../../translate/i18n";

const CampaignStatus = ({ status, count, total }) => {
  const theme = useTheme();
  const progress = (count / total) * 100;

  const colors = {
    active: theme.palette.primary.main,
    completed: theme.palette.success.main,
    pending: theme.palette.warning.main,
    failed: theme.palette.error.main
  };

  const icons = {
    active: <Campaign />,
    completed: <CheckCircle />,
    pending: <Schedule />,
    failed: <Error />
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          {icons[status]}
          <Typography variant="body2">
            {i18n.t(`adminDashboard.campaignMetrics.status.${status}`)}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {count} / {total}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: colors[status]
          }
        }}
      />
    </Box>
  );
};

const CampaignMetricsCard = ({ metrics, getColorScale }) => {
  const theme = useTheme();

  // Animação para a taxa de sucesso
  const successAnimation = useSpring({
    from: { number: 0 },
    to: { number: metrics?.successRate || 0 },
    config: { duration: 1000 }
  });

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Campaign color="primary" />
            <Typography variant="h6">
              {i18n.t("adminDashboard.campaignMetrics.title")}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={`${metrics?.active || 0} ${i18n.t("adminDashboard.campaignMetrics.active")}`}
              color="primary"
              size="small"
            />
            <Tooltip title={i18n.t("adminDashboard.campaignMetrics.info")}>
              <IconButton size="small">
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Status das campanhas */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {i18n.t("adminDashboard.campaignMetrics.successRate")}
              </Typography>
              <Typography variant="h4">
                <animated.span>
                  {successAnimation.number.to(n => `${n.toFixed(1)}%`)}
                </animated.span>
              </Typography>
            </Box>

            <CampaignStatus
              status="active"
              count={metrics?.active || 0}
              total={metrics?.total || 0}
            />
            <CampaignStatus
              status="completed"
              count={metrics?.completed || 0}
              total={metrics?.total || 0}
            />
            <CampaignStatus
              status="pending"
              count={metrics?.pending || 0}
              total={metrics?.total || 0}
            />
          </Grid>

          {/* Gráfico de performance */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.performance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="sent"
                    name={i18n.t("adminDashboard.campaignMetrics.sent")}
                    fill={theme.palette.primary.main}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="delivered"
                    name={i18n.t("adminDashboard.campaignMetrics.delivered")}
                    fill={theme.palette.success.main}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Distribuição por tipo */}
          <Grid item xs={12}>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.byType || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="type" 
                  />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.primary.main}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke={theme.palette.success.main}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke={theme.palette.info.main}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Métricas detalhadas */}
          <Grid item xs={12}>
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
                mt: 2
              }}
            >
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h4" color="primary">
                  {metrics?.totalContacts?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("adminDashboard.campaignMetrics.totalContacts")}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h4" color="success.main">
                  {metrics?.deliveryRate?.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("adminDashboard.campaignMetrics.deliveryRate")}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h4" color="info.main">
                  {metrics?.engagementRate?.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("adminDashboard.campaignMetrics.engagementRate")}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CampaignMetricsCard;