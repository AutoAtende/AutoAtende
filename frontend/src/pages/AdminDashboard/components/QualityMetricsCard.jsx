import React from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Tooltip,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Speed,
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
  Area,
  AreaChart
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { i18n } from "../../../translate/i18n";

const MetricBox = ({ icon: Icon, title, value, subtitle, color }) => {
  const animatedValue = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration: 1000 }
  });

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <Icon sx={{ color, mr: 1 }} />
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" gutterBottom>
        <animated.span>
          {animatedValue.number.to(n => `${n.toFixed(1)}%`)}
        </animated.span>
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

const QualityMetricsCard = ({ quality }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!quality?.firstCallResolution || !quality?.directResolution) {
    return null;
  }

  const { firstCallResolution, directResolution } = quality;

  // Prepara dados para o gráfico
  const chartData = firstCallResolution.byPeriod.map((fcr, index) => ({
    date: format(parseISO(fcr.period), 'dd/MM', { locale: ptBR }),
    fcr: fcr.percentage,
    directResolution: directResolution.byPeriod[index]?.percentage || 0
  }));

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            {i18n.t("adminDashboard.qualityMetrics.title")}
          </Typography>
          <Tooltip title={i18n.t("adminDashboard.qualityMetrics.info")}>
            <IconButton size="small">
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <MetricBox
              icon={CheckCircle}
              title={i18n.t("adminDashboard.qualityMetrics.fcr.title")}
              value={firstCallResolution.percentage}
              subtitle={i18n.t("adminDashboard.qualityMetrics.fcr.subtitle", {
                total: firstCallResolution.total
              })}
              color={theme.palette.success.main}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricBox
              icon={Speed}
              title={i18n.t("adminDashboard.qualityMetrics.directResolution.title")}
              value={directResolution.percentage}
              subtitle={i18n.t("adminDashboard.qualityMetrics.directResolution.subtitle", {
                total: directResolution.total
              })}
              color={theme.palette.primary.main}
            />
          </Grid>
        </Grid>

        {/* Gráfico de Tendência */}
        <Box
          sx={{
            height: isMobile ? 300 : 400,
            mt: 3,
            p: 1,
            backgroundColor: 'background.paper',
            borderRadius: 1
          }}
        >
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorFcr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke={theme.palette.text.secondary}
              />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`
                }}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="fcr"
                name={i18n.t("adminDashboard.qualityMetrics.fcr.title")}
                stroke={theme.palette.success.main}
                fillOpacity={1}
                fill="url(#colorFcr)"
              />
              <Area
                type="monotone"
                dataKey="directResolution"
                name={i18n.t("adminDashboard.qualityMetrics.directResolution.title")}
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#colorDirect)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {i18n.t("adminDashboard.qualityMetrics.chartHelp")}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QualityMetricsCard;