import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton
} from '@mui/material';
import { alpha, useTheme } from "@mui/material/styles";
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Done as DoneIcon,
  ArrowForward as ArrowForwardIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, subDays } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { toast } from "../../../helpers/toast";
import api from '../../../services/api';
import useAuth from '../../../hooks/useAuth';

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

const MetricCard = ({ title, value, icon: Icon, color, loading }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Icon sx={{ mr: 1, color }} />
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const KanbanMetrics = ({ boardId, onClose }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  
  useEffect(() => {
    fetchMetrics();
  }, [boardId, startDate, endDate]);
  
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data } = await api.request({
        url: '/kanban/metrics/boards',
        method: 'get',
        params: {
          boardId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        }
      });
      
      setMetrics(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar métricas do quadro");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleDateFilterChange = (days) => {
    setStartDate(subDays(new Date(), days));
    setEndDate(new Date());
  };
  
  if (!metrics && loading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }
  
  // Transformar dados para os gráficos
  const getLaneTimeData = () => {
    if (!metrics || !metrics.timeInLane) return [];
    
    return metrics.timeInLane.map(lane => ({
      name: lane.laneName,
      tempo: lane.averageTime ? Math.round(lane.averageTime / 3600) : 0, // Converte segundos para horas
      cards: lane.cardCount
    }));
  };
  
  const getThroughputData = () => {
    if (!metrics || !metrics.throughput) return [];
    
    return metrics.throughput.map(day => ({
      date: format(new Date(day.date), 'dd/MM'),
      cards: day.count
    }));
  };
  
  const getProductivityData = () => {
    if (!metrics || !metrics.userProductivity) return [];
    
    return metrics.userProductivity.map(user => ({
      name: user.userName,
      total: user.totalCards,
      concluidos: user.completedCards,
      tempoMedio: user.avgCompletionTimeHours ? Math.round(user.avgCompletionTimeHours) : 0
    }));
  };
  
  const getCardsStatusData = () => {
    if (!metrics || !metrics.cardsStatus) return [];
    
    const totalCards = metrics.cardsStatus.reduce((sum, lane) => sum + lane.count, 0);
    
    return metrics.cardsStatus.map((lane, index) => ({
      name: lane.laneName,
      value: lane.count,
      percentage: totalCards > 0 ? Math.round((lane.count / totalCards) * 100) : 0,
      color: COLORS[index % COLORS.length]
    }));
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">
          Métricas do Quadro
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant={endDate.getTime() - startDate.getTime() === 7 * 24 * 60 * 60 * 1000 ? "contained" : "outlined"}
            onClick={() => handleDateFilterChange(7)}
          >
            7 dias
          </Button>
          <Button 
            size="small" 
            variant={endDate.getTime() - startDate.getTime() === 30 * 24 * 60 * 60 * 1000 ? "contained" : "outlined"}
            onClick={() => handleDateFilterChange(30)}
          >
            30 dias
          </Button>
          <Button 
            size="small" 
            variant={endDate.getTime() - startDate.getTime() === 90 * 24 * 60 * 60 * 1000 ? "contained" : "outlined"}
            onClick={() => handleDateFilterChange(90)}
          >
            90 dias
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <DatePicker
              label="De"
              value={startDate}
              onChange={setStartDate}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 120 }
                }
              }}
            />
            <Typography sx={{ mx: 1 }}>-</Typography>
            <DatePicker
              label="Até"
              value={endDate}
              onChange={setEndDate}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 120 }
                }
              }}
            />
          </Box>
          
          <IconButton onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tempo Médio no Ciclo"
            value={metrics?.leadTime ? `${Math.round(metrics.leadTime)} horas` : "N/A"}
            icon={ScheduleIcon}
            color={theme.palette.primary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cartões em Andamento"
            value={metrics?.cardsStatus ? 
              metrics.cardsStatus.reduce((sum, lane) => sum + lane.count, 0) : "0"}
            icon={BarChartIcon}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cartões Concluídos"
            value={metrics?.throughput ? 
              metrics.throughput.reduce((sum, day) => sum + day.count, 0) : "0"}
            icon={DoneIcon}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Usuários Ativos"
            value={metrics?.userProductivity ? metrics.userProductivity.length : "0"}
            icon={PersonIcon}
            color={theme.palette.info.main}
            loading={loading}
          />
        </Grid>
      </Grid>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{ mb: 2 }}
      >
        <Tab 
          icon={<ScheduleIcon />} 
          label="Tempo por Coluna" 
          iconPosition="start"
        />
        <Tab 
          icon={<TrendingUpIcon />} 
          label="Throughput" 
          iconPosition="start"
        />
        <Tab 
          icon={<PersonIcon />} 
          label="Produtividade" 
          iconPosition="start"
        />
        <Tab 
          icon={<BarChartIcon />} 
          label="Distribuição" 
          iconPosition="start"
        />
      </Tabs>
      
      <Box sx={{ minHeight: 400, width: '100%' }}>
        {tabValue === 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={getLaneTimeData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis yAxisId="left" label={{ value: 'Tempo Médio (horas)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Número de Cartões', angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value, name) => [value, name === 'tempo' ? 'Horas' : 'Cartões']} />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="tempo" name="Tempo Médio (horas)" fill={theme.palette.primary.main} />
              <Bar yAxisId="right" dataKey="cards" name="Número de Cartões" fill={theme.palette.secondary.main} />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {tabValue === 1 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={getThroughputData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Cartões Concluídos', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="cards" name="Cartões Concluídos" fill={theme.palette.success.main} />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {tabValue === 2 && (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell align="center">Total de Cartões</TableCell>
                  <TableCell align="center">Concluídos</TableCell>
                  <TableCell align="center">Taxa de Conclusão</TableCell>
                  <TableCell align="center">Tempo Médio (horas)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getProductivityData().map((user) => (
                  <TableRow key={user.name}>
                    <TableCell component="th" scope="row">
                      {user.name}
                    </TableCell>
                    <TableCell align="center">{user.total}</TableCell>
                    <TableCell align="center">{user.concluidos}</TableCell>
                    <TableCell align="center">
                      {user.total > 0 ? `${Math.round((user.concluidos / user.total) * 100)}%` : 'N/A'}
                    </TableCell>
                    <TableCell align="center">{user.tempoMedio}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCardsStatusData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({name, percentage}) => `${name}: ${percentage}%`}
                  >
                    {getCardsStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} cartões (${props.payload.percentage}%)`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Coluna</TableCell>
                      <TableCell align="center">Cartões</TableCell>
                      <TableCell align="center">Percentual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCardsStatusData().map((lane) => (
                      <TableRow key={lane.name}>
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%',
                                bgcolor: lane.color,
                                mr: 1 
                              }} 
                            />
                            {lane.name}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{lane.value}</TableCell>
                        <TableCell align="center">{lane.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default KanbanMetrics;