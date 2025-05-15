import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import moment from 'moment';
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";

const TaskReportsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    status: ''
  });
  const [users, setUsers] = useState([]);
  const [data, setData] = useState({
    summary: {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0
    },
    weeklyProgress: {
      labels: [],
      data: []
    },
    statusDistribution: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdueToday: 0
    },
    userPerformance: {
      users: [],
      assigned: [],
      completed: [],
      overdue: []
    },
    attachmentStats: {
      withAttachments: 0,
      withNotes: 0,
      fileTypes: []
    }
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/list');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      toast.error('Erro ao carregar lista de usuários');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        userId: filters.userId || undefined,
        status: filters.status || undefined
      };
    
      const response = await api.get('/task/stats', { params });
      
      // Compatibilidade com ambos os formatos de resposta
      if (response.data?.success && response.data?.data) {
        setData(response.data.data);
      } else {
        // Se a API retornar o formato antigo direto
        const responseData = response.data || {
          summary: {total: 0, completed: 0, pending: 0, overdue: 0},
          weeklyProgress: {labels: [], data: []},
          statusDistribution: {total: 0, pending: 0, inProgress: 0, completed: 0, overdueToday: 0},
          userPerformance: {users: [], assigned: [], completed: [], overdue: []},
          attachmentStats: {withAttachments: 0, withNotes: 0, fileTypes: []}
        };
        setData(responseData);
      }
      
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err.response?.data?.error || 'Erro ao carregar relatórios');
      // Em caso de erro, manter os dados anteriores ou usar dados vazios
      setData(prev => prev || {
        summary: {total: 0, completed: 0, pending: 0, overdue: 0},
        weeklyProgress: {labels: [], data: []},
        statusDistribution: {total: 0, pending: 0, inProgress: 0, completed: 0, overdueToday: 0},
        userPerformance: {users: [], assigned: [], completed: [], overdue: []},
        attachmentStats: {withAttachments: 0, withNotes: 0, fileTypes: []}
      });
      
      toast.error(err.response?.data?.error || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const colors = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statusData = [
    { name: 'Pendentes', value: data.statusDistribution.pending, color: colors.warning },
    { name: 'Em Progresso', value: data.statusDistribution.inProgress, color: colors.primary },
    { name: 'Concluídas', value: data.statusDistribution.completed, color: colors.success },
    { name: 'Atrasadas', value: data.summary.overdue, color: colors.error }
  ];

  const weeklyData = data.weeklyProgress.labels.map((label, index) => ({
    name: label,
    tarefas: data.weeklyProgress.data[index]
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Data Inicial"
              value={filters.startDate}
              onChange={handleFilterChange('startDate')}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Data Final"
              value={filters.endDate}
              onChange={handleFilterChange('endDate')}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={handleFilterChange('status')}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendentes</MenuItem>
                <MenuItem value="completed">Concluídas</MenuItem>
                <MenuItem value="overdue">Atrasadas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Usuário</InputLabel>
              <Select
                value={filters.userId}
                label="Usuário"
                onChange={handleFilterChange('userId')}
              >
                <MenuItem value="">Todos</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <IconButton onClick={fetchData} size="small">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Total de Tarefas
            </Typography>
            <Typography variant="h4">
              {data.summary.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="success.main">
              Concluídas
            </Typography>
            <Typography variant="h4" color="success.main">
              {data.summary.completed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="warning.main">
              Pendentes
            </Typography>
            <Typography variant="h4" color="warning.main">
              {data.summary.pending}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="error.main">
              Atrasadas
            </Typography>
            <Typography variant="h4" color="error.main">
              {data.summary.overdue}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Progresso Semanal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Progresso Semanal
            </Typography>
            <ResponsiveContainer>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tarefas" 
                  stroke={colors.primary} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribuição de Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição de Status
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Desempenho por Usuário */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Desempenho por Usuário
            </Typography>
            <ResponsiveContainer>
              <BarChart data={data.userPerformance.users.map((user, index) => ({
                name: user,
                atribuidas: data.userPerformance.assigned[index],
                concluidas: data.userPerformance.completed[index],
                atrasadas: data.userPerformance.overdue[index]
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="atribuidas" fill={colors.primary} stackId="a" />
                <Bar dataKey="concluidas" fill={colors.success} stackId="a" />
                <Bar dataKey="atrasadas" fill={colors.error} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Estatísticas de Anexos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estatísticas de Anexos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Com Anexos
                </Typography>
                <Typography variant="h4">
                  {data.attachmentStats.withAttachments}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Com Notas
                </Typography>
                <Typography variant="h4">
                  {data.attachmentStats.withNotes}
                </Typography>
              </Grid>
              {data.attachmentStats.fileTypes.map((type, index) => (
                <Grid item xs={6} key={index}>
                  <Typography variant="body2">
                    {type.type}: <strong>{type.count}</strong>
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskReportsPage;