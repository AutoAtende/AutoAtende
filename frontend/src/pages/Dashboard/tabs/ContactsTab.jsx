import React, { useMemo } from "react";
import {
  Grid,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  InputLabel,
  Tooltip,
  CircularProgress,
  Button,
  Alert
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LabelList
} from "recharts";
import {
  Phone as PhoneIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  CompareArrows as CompareArrowsIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import ResponsiveChart from '../components/ResponsiveChart';
import ResponsiveTable from '../components/ResponsiveTable';
import useResponsive from '../hooks/useResponsive';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';

const formatPhoneNumber = (number) => {
  if (!number) return '';
  const cleaned = number.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : number;
};

const ContactsTab = ({ 
  data = {}, 
  // Novos props para receber dados via index.jsx
  prospectionData = [],
  prospectionTotals = { clients: 0, messages: 0 },
  queues = [],
  comparativoData = null,
  updateProspectionPeriod,
  updateComparativoQueues,
  isDemoMode = false,
  touchEnabled = false 
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { isComponentVisible } = useDashboardSettings();

  // Estados para o card de Prospecção por Usuário
  const [prospectionPeriod, setPeriod] = React.useState('hoje');
  const [queue1, setQueue1] = React.useState('');
const [queue2, setQueue2] = React.useState('');
const [isLoadingComparison, setIsLoadingComparison] = React.useState(false);
const [errorMessage, setErrorMessage] = React.useState('');
  
  // Estados para o card de Comparativo entre setores


  // Functions to handle period changes for Prospection card
  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
    
    // Call the function from parent component to fetch new data
    if (updateProspectionPeriod && !isDemoMode) {
      updateProspectionPeriod(newPeriod);
    }
  };
// Functions para lidar com mudanças de fila e iniciar comparação
const handleQueue1Change = (event) => {
  const newQueue = event.target.value;
  setQueue1(newQueue);
  // Não chama updateComparativoQueues aqui
};

const handleQueue2Change = (event) => {
  const newQueue = event.target.value;
  setQueue2(newQueue);
  // Não chama updateComparativoQueues aqui
};

const handleCompareQueues = () => {
  if (!queue1 || !queue2) {
    setErrorMessage("Selecione duas filas para comparar");
    return;
  }
  
  if (queue1 === queue2) {
    setErrorMessage("Selecione filas diferentes para comparar");
    return;
  }
  
  setErrorMessage("");
  setIsLoadingComparison(true);
  
  // Chama a função do componente pai para buscar os dados
  if (updateComparativoQueues && !isDemoMode) {
    updateComparativoQueues(queue1, queue2)
      .finally(() => {
        setIsLoadingComparison(false);
      });
  } else {
    // Para modo demo, simular um delay
    setTimeout(() => {
      setIsLoadingComparison(false);
    }, 500);
  }
};


  // Funções utilitárias para os cards
  const getPerformanceChip = (performance) => {
    const performanceMap = {
      'Alto': { color: 'success', label: 'Alto' },
      'Médio': { color: 'warning', label: 'Médio' },
      'Baixo': { color: 'error', label: 'Baixo' }
    };
    const chipConfig = performanceMap[performance] || { color: 'default', label: performance };
    return <Chip size="small" label={chipConfig.label} color={chipConfig.color} />;
  };

  const calculatePercentage = (value, total) =>
    total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%';

  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return '-';
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const calcVariacao = (valor1, valor2) => {
    if (valor1 === null || valor2 === null || valor2 === 0) return '0%';
    return `${((valor1 - valor2) / valor2 * 100).toFixed(1)}%`;
  };

  const getVariacaoIcon = (variacao) => {
    const valor = parseFloat(variacao.replace('%', ''));
    if (valor > 5) return <TrendingUpIcon fontSize="small" color="success" />;
    if (valor < -5) return <TrendingDownIcon fontSize="small" color="error" />;
    return <TrendingFlatIcon fontSize="small" color="action" />;
  };

  const isPositiveVariation = (metricName, value) => {
    if (['Tempo médio', 'Primeiro contato'].includes(metricName)) {
      return value < 0;
    }
    return value > 0;
  };

  // Processamento e otimização de dados para diferentes tamanhos de tela
  const chartData = useMemo(() => {
    // Reduzir quantidade de pontos de dados para mobile
    const dataReductionFactor = isMobile ? 3 : 1;

    // Formatar dados para os gráficos com validações
    const newContactsByDay = (data.newContactsByDay || [])
      .filter((_, i) => i % dataReductionFactor === 0)
      .map(day => {
        // Formatar data para mostrar apenas dia/mês
        const dateParts = day?.date?.split('-') || [];
        const formattedDate = isMobile ?
          `${dateParts[2] || ''}/${dateParts[1] || ''}` :
          day.date || '';

        return {
          date: formattedDate,
          fullDate: day.date || '',
          count: day.count || 0
        };
      });

    const contactsWithMostTickets = (data.contactsWithMostTickets || []).map(contact => ({
      contactId: contact.contactId || '',
      name: contact.contactName || "Desconhecido",
      number: formatPhoneNumber(contact.contactNumber || ""),
      count: contact.count || 0
    }));

    const contactsByHour = Array.from({ length: 24 }, (_, i) => {
      const hourData = (data.contactsByHour || []).find(h => parseInt(h?.hour || 0) === i);
      return {
        hour: i,
        count: hourData ? parseInt(hourData.count || 0) : 0
      };
    });

    // Agrupar por intervalos de 2 horas em mobile para melhorar visualização
    const contactsByHourMobile = isMobile ?
      Array.from({ length: 12 }, (_, i) => {
        const hour1 = contactsByHour[i * 2];
        const hour2 = contactsByHour[i * 2 + 1];
        return {
          hour: `${i * 2}-${i * 2 + 1}`,
          count: (hour1 ? hour1.count : 0) + (hour2 ? hour2.count : 0)
        };
      }) : contactsByHour;

    const weekdayMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const contactsByWeekday = Array.from({ length: 7 }, (_, i) => {
      const weekdayData = (data.contactsByWeekday || []).find(w => parseInt(w?.weekday || 0) === i);
      return {
        name: isMobile ? (weekdayMap[i]?.substring(0, 3) || '') : (weekdayMap[i] || ''),
        fullName: weekdayMap[i] || '',
        count: weekdayData ? parseInt(weekdayData.count || 0) : 0
      };
    });

    const mostUsedTags = (data.mostUsedTags || []).map(tag => ({
      tagId: tag.tagId || '',
      name: tag.tagName || "Sem nome",
      color: tag.tagColor || theme.palette.grey[500],
      count: tag.count || 0
    }));

    return {
      newContactsByDay,
      contactsWithMostTickets,
      contactsByHour: isMobile ? contactsByHourMobile : contactsByHour,
      contactsByWeekday,
      mostUsedTags: mostUsedTags.length > 0 ? mostUsedTags : [{ // Fallback para quando não houver tags
        tagId: 'no-tags',
        name: "Sem tags",
        color: theme.palette.grey[500],
        count: 1
      }]
    };
  }, [data, isMobile, theme.palette.grey]);

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
            {payload[0]?.payload?.fullDate || payload[0]?.payload?.fullName || label || 'N/A'}
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
                  backgroundColor: entry.color,
                  mr: 1
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: entry.color,
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

  // Colunas para a tabela de contatos
  const contactColumns = [
    {
      field: 'name',
      headerName: 'Contato',
      minWidth: 200,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 32,
              height: 32,
              mr: 1
            }}
          >
            {(value || '').charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight="medium">
            {value || 'Sem nome'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'number',
      headerName: 'Número',
      minWidth: 150,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          {value || 'N/A'}
        </Box>
      )
    },
    {
      field: 'count',
      headerName: 'Conversas',
      align: 'right',
      renderCell: (value) => (
        <Chip
          label={value || 0}
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

  // Renderização móvel para contatos
  const renderContactMobileCard = (row, index, isExpanded) => (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Avatar
        sx={{
          bgcolor: theme.palette.primary.main,
          width: 40,
          height: 40,
          mr: 2
        }}
      >
        {(row.name || '').charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" fontWeight="medium">
          {row.name || 'Sem nome'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.875rem' }} />
          <Typography variant="body2" color="text.secondary">
            {row.number || 'N/A'}
          </Typography>
        </Box>
      </Box>
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

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ];

  if (!data || Object.keys(data).length === 0) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum dado de contatos disponível
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1.5 : 2, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Card de Comparativo entre Setores */}
        <Grid item xs={12} md={6}>
  {isComponentVisible("contactsTab", "queueComparativoCard") && (
    <Paper sx={{ height: '100%', borderRadius: 1, boxShadow: theme.shadows[2], overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: isMobile ? 1.5 : 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: isMobile ? 'medium' : 'bold' }}>
          Comparativo entre setores
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VisibilityToggle tabId="contactsTab" componentId="queueComparativoCard" visible={true} />
        </Box>
      </Box>
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Setor 1</InputLabel>
            <Select
              value={queue1}
              label="Setor 1"
              onChange={handleQueue1Change}
              disabled={isDemoMode || isLoadingComparison}
            >
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id.toString()}>{queue.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Setor 2</InputLabel>
            <Select
              value={queue2}
              label="Setor 2"
              onChange={handleQueue2Change}
              disabled={isDemoMode || isLoadingComparison}
            >
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id.toString()}>{queue.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Botão para iniciar a comparação */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompareQueues}
            disabled={!queue1 || !queue2 || queue1 === queue2 || isLoadingComparison || isDemoMode}
            startIcon={isLoadingComparison ? <CircularProgress size={20} color="inherit" /> : <CompareArrowsIcon />}
            sx={{ px: 3 }}
          >
            {isLoadingComparison ? "Comparando..." : "Comparar Setores"}
          </Button>
        </Box>
        
        {/* Mensagem de erro */}
        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {isLoadingComparison ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : comparativoData ? (
          // Tabela de comparativo (código existente)
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Métrica</TableCell>
                <TableCell align="right">
                  {queues.find(q => q.id.toString() === queue1)?.name || 'Setor 1'}
                </TableCell>
                <TableCell align="right">
                  {queues.find(q => q.id.toString() === queue2)?.name || 'Setor 2'}
                </TableCell>
                <TableCell align="right">Variação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Mensagens', value1: comparativoData.queue1?.totalMessages || 0, value2: comparativoData.queue2?.totalMessages || 0 },
                { name: 'Tempo médio', value1: comparativoData.queue1?.avgTime || 0, value2: comparativoData.queue2?.avgTime || 0, formatter: formatTime },
                { name: 'Clientes', value1: comparativoData.queue1?.totalClients || 0, value2: comparativoData.queue2?.totalClients || 0 },
                { name: 'Taxa de resposta', value1: comparativoData.queue1?.responseRate || 0, value2: comparativoData.queue2?.responseRate || 0, formatter: (val) => `${val}%` },
                { name: 'Primeiro contato', value1: comparativoData.queue1?.firstContactTime || 0, value2: comparativoData.queue2?.firstContactTime || 0, formatter: formatTime }
              ].map((metric) => {
                const variacao = calcVariacao(metric.value1, metric.value2);
                const variacaoNum = parseFloat(variacao.replace(/[+%]/g, ''));
                const isPositive = isPositiveVariation(metric.name, variacaoNum);

                return (
                  <TableRow key={metric.name}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell align="right">
                      {metric.formatter ? metric.formatter(metric.value1) : metric.value1}
                    </TableCell>
                    <TableCell align="right">
                      {metric.formatter ? metric.formatter(metric.value2) : metric.value2}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={isPositive ? "Melhor desempenho" : "Pior desempenho"}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          color: isPositive ? theme.palette.success.main :
                            (variacaoNum === 0 ? theme.palette.text.secondary : theme.palette.error.main)
                        }}>
                          {getVariacaoIcon(variacao)}
                          <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium', color: 'inherit' }}>
                            {variacao}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Selecione dois setores e clique em "Comparar" para visualizar o comparativo
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )}
</Grid>

        {/* Card de Prospecção por Usuário */}
        <Grid item xs={12} md={6}>
          {isComponentVisible("contactsTab", "prospectionByAgentCard") && (
            <Paper sx={{ height: '100%', borderRadius: 1, boxShadow: theme.shadows[2], overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: isMobile ? 1.5 : 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: isMobile ? 'medium' : 'bold' }}>
                  Prospecção por Usuário
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                    <Select
                      value={prospectionPeriod}
                      onChange={handlePeriodChange}
                      displayEmpty
                      disabled={isDemoMode}
                    >
                      <MenuItem value="hoje">Hoje</MenuItem>
                      <MenuItem value="semana">Esta semana</MenuItem>
                      <MenuItem value="quinzena">Últimos 15 dias</MenuItem>
                      <MenuItem value="mes">Este mês</MenuItem>
                    </Select>
                  </FormControl>
                  <VisibilityToggle tabId="contactsTab" componentId="prospectionByAgentCard" visible={true} />
                </Box>
              </Box>

              <Box sx={{ p: 2, flexGrow: 1 }}>
                {isDemoMode ? (
                  // Em modo de demonstração, mostrar dados demo
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuário</TableCell>
                        <TableCell align="right">Clientes</TableCell>
                        <TableCell align="right">Mensagens</TableCell>
                        <TableCell align="right">Desempenho</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prospectionData.slice(0, 8).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={`${calculatePercentage(row.clients, prospectionTotals.clients)} do total`}>
                              <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2">{row.clients}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({calculatePercentage(row.clients, prospectionTotals.clients)})
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={`${calculatePercentage(row.messages, prospectionTotals.messages)} do total`}>
                              <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2">{row.messages}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({calculatePercentage(row.messages, prospectionTotals.messages)})
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">{getPerformanceChip(row.performance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : prospectionData?.length > 0 ? (
                  // No modo normal, mostrar dados reais
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuário</TableCell>
                        <TableCell align="right">Clientes</TableCell>
                        <TableCell align="right">Mensagens</TableCell>
                        <TableCell align="right">Desempenho</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prospectionData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={`${calculatePercentage(row.clients, prospectionTotals.clients)} do total`}>
                              <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2">{row.clients}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({calculatePercentage(row.clients, prospectionTotals.clients)})
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={`${calculatePercentage(row.messages, prospectionTotals.messages)} do total`}>
                              <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2">{row.messages}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({calculatePercentage(row.messages, prospectionTotals.messages)})
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">{getPerformanceChip(row.performance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum dado de prospecção encontrado
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <ResponsiveChart
            title="Novos Contatos por Dia"
            height={isMobile ? 250 : 300}
            tabId="contactsTab"
            componentId="newContactsChart"
          >
            <AreaChart
              data={chartData.newContactsByDay || []}
              margin={{
                top: 5,
                right: isMobile ? 10 : 30,
                left: isMobile ? 5 : 20,
                bottom: 5
              }}
            >
              <defs>
                <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={isMobile ? "preserveStartEnd" : 0}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 25 : 35}
              />
              <RechartsTooltip
                formatter={(value) => [`${value || 0} contatos`, 'Novos']}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Novos Contatos"
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#colorContacts)"
                strokeWidth={2}
                activeDot={{ r: isMobile ? 4 : 6 }}
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
              </Area>
            </AreaChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={4}>
          <ResponsiveChart
            title="Contatos por Dia da Semana"
            height={isMobile ? 250 : 300}
            tabId="contactsTab"
            componentId="contactsWeekdayChart"
          >
            <BarChart
              data={chartData.contactsByWeekday || []}
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
                formatter={(value) => [`${value || 0} contatos`, 'Ativos']}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="count"
                name="Contatos Ativos"
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

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Contatos por Hora do Dia"
            height={isMobile ? 250 : 300}
            tabId="contactsTab"
            componentId="contactsHourChart"
          >
            <LineChart
              data={chartData.contactsByHour || []}
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
                  if (isMobile) {
                    const [start, end] = (hour || '').split('-');
                    return `${start || ''}h-${end || ''}h`;
                  }
                  return `${hour || ''}h`;
                }}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={isMobile ? 1 : 2}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 25 : 35}
              />
              <RechartsTooltip
                formatter={(value) => [`${value || 0} contatos`, 'Ativos']}
                labelFormatter={(hour) => {
                  if (isMobile) {
                    const [start, end] = (hour || '').split('-');
                    return `${start || ''}:00 - ${end || ''}:59`;
                  }
                  return `${hour || ''}:00 - ${hour || ''}:59`;
                }}
                content={<CustomTooltip />}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Contatos Ativos"
                stroke={theme.palette.info.main}
                activeDot={{ r: isMobile ? 4 : 8 }}
                strokeWidth={2}
                dot={isMobile ? false : { r: 3 }}
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
              </Line>
            </LineChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Tags Mais Usadas em Contatos"
            height={isMobile ? 250 : 300}
            tabId="contactsTab"
            componentId="tagsUsedChart"
          >
            <PieChart>
              <Pie
                data={chartData.mostUsedTags || []}
                cx="50%"
                cy="50%"
                labelLine={!isMobile}
                label={({ name, count, percent }) => isMobile ?
                  `${(percent * 100).toFixed(0)}% (${count})` :
                  `${name || 'Tag'}: ${(percent * 100).toFixed(0)}% (${count})`
                }
                outerRadius={isMobile ? 60 : 80}
                fill="#8884d8"
                dataKey="count"
              >
                {(chartData.mostUsedTags || []).map((tag, index) => (
                  <Cell key={`cell-${index}`} fill={tag.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value) => [`${value || 0} contatos`, 'Quantidade']}
                content={<CustomTooltip />}
              />
            </PieChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12}>
          <ResponsiveTable
            title="Contatos com Mais Conversas"
            columns={contactColumns}
            data={chartData.contactsWithMostTickets || []}
            mobileCardComponent={renderContactMobileCard}
            sx={{ height: 'auto' }}
            tabId="contactsTab"
            componentId="contactsTable"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Import a utilizar para o componente de toggle de visibilidade
const VisibilityToggle = ({ tabId, componentId, visible = true, size = 'small' }) => {
  const { toggleComponentVisibility } = useDashboardSettings();

  const handleToggle = async () => {
    try {
      await toggleComponentVisibility(tabId, componentId, !visible);
    } catch (error) {
      console.error('Erro ao alternar visibilidade:', error);
    }
  };

  return (
    <Tooltip title={visible ? "Ocultar componente" : "Mostrar componente"}>
      <IconButton 
        onClick={handleToggle} 
        size={size}
        color={visible ? "inherit" : "primary"}
      >
        {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

export default ContactsTab;