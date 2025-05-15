import React from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  AttachMoney,
  InfoOutlined,
  ShowChart
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../../utils/formatters';
import { i18n } from "../../../translate/i18n";

const RevenueMetricsCard = ({ metrics, getColorScale }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animação para os números
  const revenueAnimation = useSpring({
    from: { number: 0 },
    to: { number: metrics?.monthlyRevenue || 0 },
    config: { duration: 1000 }
  });

  // Cores para o gráfico de pizza
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main
  ];

  return (
    <Card 
      sx={{ 
        position: 'relative',
        overflow: 'visible',
        height: '100%'
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalance color="primary" />
            <Typography variant="h6">
              {i18n.t("adminDashboard.financialMetrics.title")}
            </Typography>
          </Box>
          <Tooltip title={i18n.t("adminDashboard.financialMetrics.info")}>
            <IconButton size="small">
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          {/* Métricas principais */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {i18n.t("adminDashboard.financialMetrics.monthlyRevenue")}
              </Typography>
              <Typography variant="h4" component="div">
                <animated.span>
                  {revenueAnimation.number.to(n => 
                    formatCurrency(n, { compact: true })
                  )}
                </animated.span>
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <TrendingUp color="success" fontSize="small" />
                <Typography variant="body2" color="success.main">
                  +{metrics?.revenueMetrics?.growthRate || 0}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Gráfico de receita mensal */}
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.revenueMetrics?.byMonth || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(date) => format(new Date(date), 'MMM', { locale: ptBR })}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value, { compact: true })}
                  />
                  <ChartTooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      i18n.t("adminDashboard.financialMetrics.revenue")
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Distribuição por plano */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.t("adminDashboard.financialMetrics.planDistribution")}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics?.revenueMetrics?.planDistribution || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {metrics?.revenueMetrics?.planDistribution?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip 
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Taxa de inadimplência */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.t("adminDashboard.financialMetrics.defaultRate")}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.revenueMetrics?.defaultTrend || []}>
                  <defs>
                    <linearGradient id="colorDefault" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={theme.palette.error.main} 
                        stopOpacity={0.8}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={theme.palette.error.main} 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip 
                    formatter={(value) => [`${value}%`, i18n.t("adminDashboard.financialMetrics.defaultRate")]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke={theme.palette.error.main}
                    fillOpacity={1}
                    fill="url(#colorDefault)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RevenueMetricsCard;