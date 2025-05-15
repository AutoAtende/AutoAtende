import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  Tooltip,
  IconButton,
  useMediaQuery,
  ButtonBase
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import {
  Message,
  Campaign,
  Speed,
  Group,
  InfoOutlined,
  TrendingUp
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { i18n } from "../../../translate/i18n";

const MetricCard = ({ icon: Icon, title, value, subtitle, trend, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  const springProps = useSpring({
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
    boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.05)',
    config: { tension: 300, friction: 20 }
  });

  const numberAnimation = useSpring({
    number: value,
    from: { number: 0 },
    config: { duration: 1000 }
  });

  return (
    <animated.div style={springProps}>
      <ButtonBase
        onClick={onClick}
        sx={{ 
          width: '100%',
          textAlign: 'left',
          borderRadius: 2,
          overflow: 'hidden'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Icon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                {title}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="baseline">
              <Typography variant="h4" component="div">
                <animated.span>
                  {numberAnimation.number.to(n => Math.floor(n).toLocaleString())}
                </animated.span>
              </Typography>
              
              {trend && (
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    color: trend >= 0 ? 'success.main' : 'error.main',
                    bgcolor: trend >= 0 ? 'success.light' : 'error.light',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    opacity: 0.8
                  }}
                >
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">
                    {trend}%
                  </Typography>
                </Box>
              )}
            </Box>

            {subtitle && (
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ 
                  display: 'block',
                  mt: 1,
                  opacity: isHovered ? 1 : 0.7,
                  transition: 'opacity 0.2s'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </CardContent>
        </Card>
      </ButtonBase>
    </animated.div>
  );
};

const EngagementMetricsCard = ({ metrics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedMetric, setSelectedMetric] = useState('messages');

  const getGradientColors = (color) => ({
    start: theme.palette[color].light,
    end: theme.palette[color].main
  });

  const chartData = React.useMemo(() => {
    if (selectedMetric === 'messages') {
      return metrics?.messageVolume?.trend || [];
    }
    return metrics?.campaignMetrics?.trends || [];
  }, [metrics, selectedMetric]);

  return (
    <Card 
      sx={{ 
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            {i18n.t("adminDashboard.engagementMetrics.title")}
          </Typography>
          <Tooltip title={i18n.t("adminDashboard.engagementMetrics.info")}>
            <IconButton size="small">
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={Message}
              title={i18n.t("adminDashboard.engagementMetrics.messagesPerDay")}
              value={metrics?.messagesPerDay || 0}
              subtitle="Média diária de mensagens"
              onClick={() => setSelectedMetric('messages')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={Campaign}
              title={i18n.t("adminDashboard.engagementMetrics.campaignSuccess")}
              value={metrics?.campaignMetrics?.successRate || 0}
              subtitle="Taxa de sucesso das campanhas"
              trend={15}
              onClick={() => setSelectedMetric('campaigns')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={Group}
              title={i18n.t("adminDashboard.engagementMetrics.activeContacts")}
              value={metrics?.contactMetrics?.total || 0}
              subtitle="Contatos ativos no período"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={Speed}
              title={i18n.t("adminDashboard.engagementMetrics.deliveryRate")}
              value={metrics?.whatsappMetrics?.deliveryRate || 0}
              subtitle="Taxa de entrega de mensagens"
              trend={5}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, height: isMobile ? 300 : 400 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
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
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(parseISO(date), 'dd/MM', { locale: ptBR })}
                stroke={theme.palette.text.secondary}
              />
              <YAxis stroke={theme.palette.text.secondary} />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric === 'messages' ? 'count' : 'delivered'}
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Typography variant="caption" color="textSecondary">
            {selectedMetric === 'messages' 
              ? 'Volume de mensagens ao longo do tempo'
              : 'Desempenho das campanhas'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EngagementMetricsCard;