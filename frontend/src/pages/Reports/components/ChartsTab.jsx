import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Box,
  Paper,
  Grid,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  CalendarViewWeek,
  CalendarViewMonth,
  Today
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Sector
} from 'recharts';
import { i18n } from "../../../translate/i18n";

// Componente de legenda personalizada para gráficos
const CustomLegend = ({ payload }) => {
  const theme = useTheme();
  
  if (!payload || payload.length === 0) return null;
  
  return (
    <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
      {payload.map((entry, index) => (
        <Box
          key={`legend-${index}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[1]
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: entry.color,
              mr: 1,
              borderRadius: '2px'
            }}
          />
          <Typography variant="caption" color="text.primary">
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

// Componente para tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                backgroundColor: entry.color,
                marginRight: 1,
                borderRadius: '2px'
              }}
            />
            <Typography variant="caption">
              {entry.name}: {entry.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }

  return null;
};

// Componente para setor ativo do gráfico de pizza
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.statusName}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const ChartsTab = ({ chartData, summaryData, filters, onFilterChange, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [periodAggregation, setPeriodAggregation] = useState('day');
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });
  
  // Função para mudança do tipo de agregação
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriodAggregation(newPeriod);
      onFilterChange('aggregation', newPeriod);
    }
  };
  
  // Função para manipular hover no gráfico de pizza
  const handlePieEnter = (_, index) => {
    setActiveStatusIndex(index);
  };
  
  // Cores para os gráficos
  const COLORS = {
    status: {
      open: theme.palette.success.main,
      pending: theme.palette.warning.main,
      closed: theme.palette.error.main
    },
    default: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
      '#8884d8',
      '#82ca9d',
      '#ffc658',
      '#ff8042'
    ]
  };
  
  // Função para obter cores para filas
  const getQueueColor = (index) => {
    const queue = chartData?.ticketsByQueue?.[index];
    return queue?.queueColor || COLORS.default[index % COLORS.default.length];
  };

  // Verificar se temos dados para renderizar
  const hasTicketsByQueue = chartData?.ticketsByQueue && chartData.ticketsByQueue.length > 0;
  const hasTicketsByStatus = chartData?.ticketsByStatus && chartData.ticketsByStatus.length > 0;
  const hasTicketsByDate = chartData?.ticketsByDate && chartData.ticketsByDate.length > 0;
  const hasTopUsers = summaryData?.topUsers && summaryData.topUsers.length > 0;
  const hasTopQueues = summaryData?.topQueues && summaryData.topQueues.length > 0;

  return (
    <animated.div style={fadeIn}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Grid container spacing={3}>
          {/* Controles */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 2
              }}
            >
              <Typography variant="h6" component="h2">
                {i18n.t('reports.charts.title')}
              </Typography>
              
              <ToggleButtonGroup
                value={periodAggregation}
                exclusive
                onChange={handlePeriodChange}
                aria-label="period aggregation"
                size={isMobile ? 'small' : 'medium'}
              >
                <ToggleButton value="day" aria-label="day">
                  <Today fontSize="small" sx={{ mr: isMobile ? 0 : 1 }} />
                  {!isMobile && i18n.t('reports.charts.daily')}
                </ToggleButton>
                <ToggleButton value="week" aria-label="week">
                  <CalendarViewWeek fontSize="small" sx={{ mr: isMobile ? 0 : 1 }} />
                  {!isMobile && i18n.t('reports.charts.weekly')}
                </ToggleButton>
                <ToggleButton value="month" aria-label="month">
                  <CalendarViewMonth fontSize="small" sx={{ mr: isMobile ? 0 : 1 }} />
                  {!isMobile && i18n.t('reports.charts.monthly')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Divider sx={{ mb: 3 }} />
          </Grid>
          
          {/* Gráfico de barras - Tickets por fila */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardHeader
                title={i18n.t('reports.charts.ticketsByQueue')}
                avatar={<BarChartIcon color="primary" />}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : hasTicketsByQueue ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData.ticketsByQueue}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="queueName"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip
                        content={
                          <CustomTooltip />
                        }
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        content={<CustomLegend />}
                      />
                      <Bar
                        name={i18n.t('reports.charts.tickets')}
                        dataKey="count"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.ticketsByQueue.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getQueueColor(index)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.t('reports.charts.noData')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Gráfico de pizza - Tickets por status */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardHeader
                title={i18n.t('reports.charts.ticketsByStatus')}
                avatar={<PieChartIcon color="primary" />}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : hasTicketsByStatus ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeStatusIndex}
                        activeShape={renderActiveShape}
                        data={chartData.ticketsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="count"
                        onMouseEnter={handlePieEnter}
                      >
                        {chartData.ticketsByStatus.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={entry.color || COLORS.status[entry.status] || theme.palette.primary.main}
                          />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        content={<CustomLegend />}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.t('reports.charts.noData')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Gráfico de linha - Tendência de tickets */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardHeader
                title={i18n.t('reports.charts.ticketsTrend')}
                avatar={<LineChartIcon color="primary" />}
                titleTypographyProps={{ variant: 'h6' }}
                subheaderTypographyProps={{ variant: 'body2' }}
                subheader={
                  periodAggregation === 'day'
                    ? i18n.t('reports.charts.daily')
                    : periodAggregation === 'week'
                    ? i18n.t('reports.charts.weekly')
                    : i18n.t('reports.charts.monthly')
                }
              />
              <CardContent>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : hasTicketsByDate ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData.ticketsByDate}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip
                        content={
                          <CustomTooltip />
                        }
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        content={<CustomLegend />}
                      />
                      <Line
                        name={i18n.t('reports.charts.tickets')}
                        type="monotone"
                        dataKey="count"
                        stroke={theme.palette.primary.main}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.t('reports.charts.noData')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Resumo - Top usuários e filas */}
          {summaryData && (
            <>
              {/* Top usuários */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardHeader
                    title={i18n.t('reports.charts.topUsers')}
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    {loading ? (
                      <Skeleton variant="rectangular" height={200} />
                    ) : hasTopUsers ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={summaryData.topUsers}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 12 }}
                            width={100}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            name={i18n.t('reports.charts.tickets')}
                            dataKey="count"
                            fill={theme.palette.primary.main}
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {i18n.t('reports.charts.noData')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Top filas */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardHeader
                    title={i18n.t('reports.charts.topQueues')}
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    {loading ? (
                      <Skeleton variant="rectangular" height={200} />
                    ) : hasTopQueues ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={summaryData.topQueues}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 12 }}
                            width={100}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            name={i18n.t('reports.charts.tickets')}
                            dataKey="count"
                            fill={theme.palette.primary.main}
                            radius={[0, 4, 4, 0]}
                          >
                            {summaryData.topQueues.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color || getQueueColor(index)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {i18n.t('reports.charts.noData')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </animated.div>
  );
};

export default ChartsTab;