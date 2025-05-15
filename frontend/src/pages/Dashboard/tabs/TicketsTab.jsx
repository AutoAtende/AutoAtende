import React, { useState, useMemo } from "react";
import {
  Grid,
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
  LinearProgress,
  Typography,
  Fade,
  Badge,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList
} from "recharts";

// Componentes otimizados para mobile
import ResponsiveChart from '../components/ResponsiveChart';
import ResponsiveTable from '../components/ResponsiveTable';
import useResponsive from '../hooks/useResponsive';

// Mapeamento de status para nomes mais amigáveis e cores
const ticketStatusMap = {
  pending: { name: "Pendente", color: "#FFC107" },
  open: { name: "Aberto", color: "#2196F3" },
  closed: { name: "Resolvido", color: "#4CAF50" },
  processing: { name: "Em Atendimento", color: "#9C27B0" }
};

// Mapeamento de dias da semana
const weekdayMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const TicketsTab = ({ data, touchEnabled = false }) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [selectedTab, setSelectedTab] = useState(0);

  // Verificação segura dos dados com valores padrão
  const safeData = useMemo(() => {
    const defaultData = {
      ticketsByStatus: [],
      ticketsByQueue: [],
      ticketsByUser: [],
      ticketsByHour: [],
      ticketsByWeekday: [],
      averageResolutionTimeByQueue: [],
      averageFirstResponseTime: 0
    };

    if (!data) return defaultData;

    return {
      ticketsByStatus: Array.isArray(data.ticketsByStatus) ? data.ticketsByStatus : defaultData.ticketsByStatus,
      ticketsByQueue: Array.isArray(data.ticketsByQueue) ? data.ticketsByQueue : defaultData.ticketsByQueue,
      ticketsByUser: Array.isArray(data.ticketsByUser) ? data.ticketsByUser : defaultData.ticketsByUser,
      ticketsByHour: Array.isArray(data.ticketsByHour) ? data.ticketsByHour : defaultData.ticketsByHour,
      ticketsByWeekday: Array.isArray(data.ticketsByWeekday) ? data.ticketsByWeekday : defaultData.ticketsByWeekday,
      averageResolutionTimeByQueue: Array.isArray(data.averageResolutionTimeByQueue)
        ? data.averageResolutionTimeByQueue
        : defaultData.averageResolutionTimeByQueue,
      averageFirstResponseTime: typeof data.averageFirstResponseTime === 'number'
        ? data.averageFirstResponseTime
        : defaultData.averageFirstResponseTime
    };
  }, [data]);

  // Verificação aprimorada se existem dados para exibir
  const hasData = useMemo(() => {
    const hasStatus = safeData.ticketsByStatus && safeData.ticketsByStatus.length > 0;
    const hasQueue = safeData.ticketsByQueue && safeData.ticketsByQueue.length > 0;
    const hasUser = safeData.ticketsByUser && safeData.ticketsByUser.length > 0;

    return hasStatus || hasQueue || hasUser;
  }, [safeData]);

  // Dados para gráficos otimizados para visualização mobile
  const chartData = useMemo(() => {
    if (!hasData) {
      return {
        ticketsByStatusData: [],
        ticketsByQueueData: [],
        ticketsByHourData: [],
        ticketsByWeekdayData: [],
        resolutionTimeByQueueData: []
      };
    }

    // Status dos tickets
    const ticketsByStatusData = safeData.ticketsByStatus
      .filter(status => status && status.status && typeof status.count === 'number')
      .map(status => ({
        name: ticketStatusMap[status.status]?.name ||
          (status.status ? status.status.charAt(0).toUpperCase() + status.status.slice(1) : "Desconhecido"),
        value: status.count,
        color: ticketStatusMap[status.status]?.color || theme.palette.grey[500]
      }));

    // Conversas por fila
    const ticketsByQueueData = safeData.ticketsByQueue
      .filter(queue => queue && typeof queue.count === 'number' && queue.queueName)
      .sort((a, b) => b.count - a.count)
      .map(queue => ({
        name: isMobile && queue.queueName.length > 12
          ? `${queue.queueName.substring(0, 10)}...`
          : queue.queueName,
        value: queue.count,
        fullName: queue.queueName,
        color: queue.queueColor || theme.palette.grey[500]
      }))
      .slice(0, isMobile ? 5 : 10);

    // Conversas por hora
    const ticketsByHourData = Array.from({ length: 24 }, (_, i) => {
      const hourData = safeData.ticketsByHour.find(h =>
        h && String(h.hour) === String(i)
      );
      return {
        hour: i,
        count: hourData ? parseInt(hourData.count) || 0 : 0
      };
    });

    // Versão simplificada para mobile
    const ticketsByHourMobile = isMobile ?
      Array.from({ length: 12 }, (_, i) => {
        const hour1 = ticketsByHourData[i * 2];
        const hour2 = ticketsByHourData[i * 2 + 1];
        return {
          hour: `${i * 2}-${i * 2 + 1}`,
          count: (hour1 ? hour1.count : 0) + (hour2 ? hour2.count : 0)
        };
      }) : ticketsByHourData;

    // Conversas por dia da semana
    const ticketsByWeekdayData = Array.from({ length: 7 }, (_, i) => {
      const weekdayData = safeData.ticketsByWeekday.find(w =>
        w && String(w.weekday) === String(i)
      );
      return {
        name: isMobile ? weekdayMap[i].substring(0, 3) : weekdayMap[i],
        fullName: weekdayMap[i],
        count: weekdayData ? parseInt(weekdayData.count) || 0 : 0
      };
    });

    // Tempo de resolução por fila
    const resolutionTimeByQueueData = safeData.averageResolutionTimeByQueue
      .filter(queue => queue && queue.queueName && !isNaN(parseFloat(queue.avgTime)))
      .map(queue => ({
        name: isMobile && queue.queueName.length > 12
          ? `${queue.queueName.substring(0, 10)}...`
          : queue.queueName,
        fullName: queue.queueName,
        value: parseFloat(queue.avgTime).toFixed(1),
        color: queue.queueColor || theme.palette.grey[500]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, isMobile ? 5 : 10);

    return {
      ticketsByStatusData,
      ticketsByQueueData,
      ticketsByHourData: isMobile ? ticketsByHourMobile : ticketsByHourData,
      ticketsByWeekdayData,
      resolutionTimeByQueueData
    };
  }, [safeData, hasData, isMobile, theme.palette.grey]);

  // Caso não tenha dados, exibe mensagem
  if (!hasData) {
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}>
        <Typography variant="body1" color="text.secondary">
          Não há dados de tickets disponíveis para o período selecionado.
        </Typography>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Customização para tooltip da recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            maxWidth: 250
          }}
        >
          <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
            {payload[0]?.payload?.fullName || label}
          </Typography>
          {payload.map((entry, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: index === payload.length - 1 ? 0 : 0.5
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color || theme.palette.primary.main,
                  mr: 1
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 'medium'
                }}
              >
                {`${entry.name || 'Valor'}: ${entry.value || 0}`}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Colunas para a tabela de atendentes
  const userColumns = [
    {
      field: 'userName',
      headerName: 'Atendente',
      minWidth: 150
    },
    {
      field: 'count',
      headerName: 'Conversas',
      align: 'right',
      renderCell: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#fff',
            fontWeight: 'bold',
            minWidth: 60
          }}
        />
      )
    }
  ];

  // Renderização mobile para tabela de usuários
  const renderUserMobileCard = (row, index, isExpanded) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Typography variant="body1" fontWeight="medium">
        {row.userName || 'Sem nome'}
      </Typography>
      <Chip
        label={row.count || 0}
        size="small"
        sx={{
          bgcolor: theme.palette.primary.main,
          color: '#fff',
          fontWeight: 'bold',
          minWidth: 50
        }}
      />
    </Box>
  );

  // Dados para a tabela de atendentes
  const usersTableData = safeData.ticketsByUser
    .filter(user => user && user.userName && typeof user.count === 'number')
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(user => ({
      userName: user.userName || 'Nome não informado',
      count: user.count || 0
    }));

  return (
    <Box sx={{ p: isMobile ? 1.5 : 2, height: '100%', overflow: 'auto' }}>
      {/* Abas internas - Otimizadas para mobile */}
      <Paper
        sx={{
          borderRadius: 1,
          mb: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[1]
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          centered={!isMobile}
          sx={{
            minHeight: isMobile ? 48 : 56,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              minHeight: isMobile ? 48 : 56,
              py: 0
            }
          }}
        >
          <Tab
            label="Status e Filas"
            wrapped={isMobile}
            icon={
              <Badge
                badgeContent={safeData.ticketsByStatus.length}
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}
              >
                <PieChart width={16} height={16} />
              </Badge>
            }
            iconPosition="start"
            sx={{
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              textTransform: 'none',
              fontWeight: selectedTab === 0 ? 'bold' : 'normal',
            }}
          />
          <Tab
            label="Tendências"
            wrapped={isMobile}
            icon={
              <LineChart width={16} height={16}>
                <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} dot={false} />
              </LineChart>
            }
            iconPosition="start"
            sx={{
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              textTransform: 'none',
              fontWeight: selectedTab === 1 ? 'bold' : 'normal',
            }}
          />
          <Tab
            label="Performance"
            wrapped={isMobile}
            icon={
              <Badge
                badgeContent={Math.round(safeData.averageFirstResponseTime || 0)}
                color="warning"
                max={99}
                showZero
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}
              >
                <BarChart width={16} height={16} />
              </Badge>
            }
            iconPosition="start"
            sx={{
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              textTransform: 'none',
              fontWeight: selectedTab === 2 ? 'bold' : 'normal',
            }}
          />
        </Tabs>
      </Paper>

      {/* Conteúdo das abas */}
      {selectedTab === 0 && (
        <Fade in={selectedTab === 0} timeout={300}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <ResponsiveChart
                title="Conversas por Status"
                height={isMobile ? 250 : 300}
                isEmpty={chartData.ticketsByStatusData.length === 0}
                tabId="ticketsTab"
                componentId="ticketsStatusChart"
              >
                <PieChart>
                  <Pie
                    data={chartData.ticketsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={!isMobile}
                    label={({ name, value, percent }) => isMobile ?
                      `${(percent * 100).toFixed(0)}% (${value})` :
                      `${name}: ${(percent * 100).toFixed(0)}% (${value})`
                    }
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.ticketsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    formatter={(value) => [`${value} tickets`, 'Quantidade']}
                  />
                </PieChart>
              </ResponsiveChart>
            </Grid>

            <Grid item xs={12} md={6}>
              <ResponsiveChart
                title="Conversas por Fila"
                height={isMobile ? 250 : 300}
                isEmpty={chartData.ticketsByQueueData.length === 0}
                tabId="ticketsTab"
                componentId="ticketsQueueChart"
              >
                <BarChart
                  data={chartData.ticketsByQueueData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 5 : 20,
                    bottom: 5
                  }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 100 : 120}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    formatter={(value) => [`${value} tickets`, 'Quantidade']}
                  />
                  <Bar
                    dataKey="value"
                    name="Conversas"
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(value) => value}
                      style={{
                        fill: theme.palette.text.secondary,
                        fontSize: isMobile ? 10 : 12,
                        fontWeight: 'medium'
                      }}
                    />
                    {chartData.ticketsByQueueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChart>
            </Grid>

            <Grid item xs={12}>
              <ResponsiveTable
                title="Atendentes com Mais Conversas"
                columns={userColumns}
                data={usersTableData}
                mobileCardComponent={renderUserMobileCard}
                sx={{ height: 'auto' }}
                tabId="ticketsTab"
                componentId="ticketsUserTable"
              />
            </Grid>
          </Grid>
        </Fade>
      )}

      {selectedTab === 1 && (
        <Fade in={selectedTab === 1} timeout={300}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <ResponsiveChart
                title="Conversas por Hora do Dia"
                height={isMobile ? 250 : 300}
                isEmpty={chartData.ticketsByHourData.length === 0}
                tabId="ticketsTab"
                componentId="ticketsHourChart"
              >
                <LineChart
                  data={chartData.ticketsByHourData}
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 5 : 20,
                    bottom: 5
                  }}
                >
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => {
                      if (isMobile && String(hour).includes('-')) {
                        const [start, end] = String(hour).split('-');
                        return `${start}h-${end}h`;
                      }
                      return `${hour}h`;
                    }}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    interval={isMobile ? 1 : 2}
                  />
                  <YAxis
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    width={isMobile ? 25 : 35}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${value} tickets`, 'Quantidade']}
                    labelFormatter={(hour) => {
                      if (String(hour).includes('-')) {
                        const [start, end] = String(hour).split('-');
                        return `${start}:00 - ${end}:59`;
                      }
                      return `${hour}:00 - ${hour}:59`;
                    }}
                    content={<CustomTooltip />}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Conversas"
                    stroke={theme.palette.primary.main}
                    activeDot={{ r: isMobile ? 4 : 8 }}
                    strokeWidth={2}
                    dot={isMobile ? false : { r: 3 }}
                  >
                    <LabelList
                      dataKey="count"
                      position="top"
                      formatter={(value) => value > 0 ? value : ''}
                      style={{
                        fill: theme.palette.text.secondary,
                        fontSize: isMobile ? 10 : 12,
                        fontWeight: 'medium'
                      }}
                    />
                  </Line>
                </LineChart>
              </ResponsiveChart>
            </Grid>

            <Grid item xs={12} md={6}>
              <ResponsiveChart
                title="Conversas por Dia da Semana"
                height={isMobile ? 250 : 300}
                isEmpty={chartData.ticketsByWeekdayData.length === 0}
                tabId="ticketsTab"
                componentId="ticketsWeekdayChart"
              >
                <BarChart
                  data={chartData.ticketsByWeekdayData}
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 5 : 20,
                    bottom: 5
                  }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    width={isMobile ? 25 : 35}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${value} tickets`, 'Quantidade']}
                    content={<CustomTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    name="Conversas"
                    fill={theme.palette.secondary.main}
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="count"
                      position="top"
                      formatter={(value) => value}
                      style={{
                        fill: theme.palette.text.secondary,
                        fontSize: isMobile ? 10 : 12,
                        fontWeight: 'medium'
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveChart>
            </Grid>
          </Grid>
        </Fade>
      )}

      {selectedTab === 2 && (
        <Fade in={selectedTab === 2} timeout={300}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <ResponsiveChart
                title="Tempo Médio de Resolução por Fila"
                height={isMobile ? 250 : 350}
                isEmpty={chartData.resolutionTimeByQueueData.length === 0}
                tabId="ticketsTab"
                componentId="resolutionTimeChart"
              >
                <BarChart
                  data={chartData.resolutionTimeByQueueData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: isMobile ? 15 : 30,
                    left: isMobile ? 5 : 20,
                    bottom: 5
                  }}
                >
                  <XAxis
                    type="number"
                    unit=" min"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 100 : 120}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${value} minutos`, 'Tempo Médio']}
                    content={<CustomTooltip />}
                  />
                  <Bar
                    dataKey="value"
                    name="Tempo Médio"
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(value) => value}
                      style={{
                        fill: theme.palette.text.secondary,
                        fontSize: isMobile ? 10 : 12,
                        fontWeight: 'medium'
                      }}
                    />
                    {chartData.resolutionTimeByQueueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChart>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{
                height: '100%',
                p: isMobile ? 2 : 3,
                borderRadius: 1,
                boxShadow: theme.shadows[2]
              }}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  gutterBottom
                  sx={{ fontWeight: 'medium' }}
                >
                  Métricas de Atendimento
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tempo Médio da Primeira Resposta
                      </Typography>
                      <Typography variant="h6" color="info.main" fontWeight="medium">
                        {!isNaN(safeData.averageFirstResponseTime)
                          ? `${parseFloat(safeData.averageFirstResponseTime).toFixed(1)} min`
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={!isNaN(safeData.averageFirstResponseTime)
                            ? Math.min((safeData.averageFirstResponseTime / 30) * 100, 100)
                            : 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              bgcolor: theme.palette.info.main,
                              borderRadius: 4
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      )}
    </Box>
  );
};

export default TicketsTab;