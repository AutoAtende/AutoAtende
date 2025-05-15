import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { 
  Leaderboard as LeaderboardIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { toast } from "../../../helpers/toast";
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { makeStyles } from '@mui/styles';
import api from '../../../services/api';

const useStyles = makeStyles((theme) => ({
  filterContainer: {
    marginBottom: theme.spacing(3),
  },
  chartCard: {
    marginBottom: theme.spacing(3),
  },
  employeeCard: {
    marginBottom: theme.spacing(2),
  }
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const EmployerReport = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [employersList, setEmployersList] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  const [rankingOpen, setRankingOpen] = useState(false);
  const [rankingData, setRankingData] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Função para buscar todas as empresas para o select
  const fetchAllEmployers = async () => {
    try {
      setLoadingEmployers(true);
      // Buscar todas as empresas sem paginação (agora filtradas por companyId automaticamente)
      const { data } = await api.get('/employers', {
        params: { 
          searchParam: '',
          limit: 999999, // Número alto para pegar todas
          page: 0
        }
      });

      if (data.employers && Array.isArray(data.employers)) {
        // Ordenar por nome
        const sortedEmployers = data.employers.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setEmployersList(sortedEmployers);
      }
    } catch (error) {
      console.error('Error fetching employers:', error);
      toast.error('Erro ao carregar lista de empresas');
    } finally {
      setLoadingEmployers(false);
    }
  };

  const fetchRanking = async () => {
    try {
      setLoadingRanking(true);
      const response = await api.get('/employer/reports/ranking');
      setRankingData(response.data);
      setRankingOpen(true);
    } catch (error) {
      console.error('Error fetching ranking:', error);
      toast.error('Erro ao carregar ranking de empresas');
    } finally {
      setLoadingRanking(false);
    }
  };

  // Carregar lista de empresas ao montar o componente
  useEffect(() => {
    fetchAllEmployers();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedEmployer) {
      toast.error('Selecione uma empresa');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/employer/reports', {
        params: {
          employerId: selectedEmployer,
          startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
          endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
        }
      });
      setReportData(response.data);
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const RankingDialog = () => (
    <Dialog 
      open={rankingOpen} 
      onClose={() => setRankingOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <LeaderboardIcon sx={{ mr: 1 }} />
          Ranking de Tickets por Empresa
          <IconButton
            aria-label="close"
            onClick={() => setRankingOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loadingRanking ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Gráfico de Barras */}
            <Box height={300} mb={4}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="totalTickets" fill="#8884d8" name="Total de Tickets">
                    <LabelList dataKey="totalTickets" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Lista com detalhes */}
            <List>
              {rankingData.map((employer, index) => (
                <React.Fragment key={employer.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: index < 3 ? 
                          ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 
                          'grey.400'
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={employer.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Total de Tickets: {employer.totalTickets}
                          </Typography>
                          <Box display="flex" gap={2}>
                            <Typography variant="caption" color="success.main">
                              Fechados: {employer.closedTickets}
                            </Typography>
                            <Typography variant="caption" color="warning.main">
                              Pendentes: {employer.pendingTickets}
                            </Typography>
                            <Typography variant="caption" color="info.main">
                              Em Aberto: {employer.openTickets}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < rankingData.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box>
      <Grid container spacing={2} className={classes.filterContainer}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Empresa</InputLabel>
            <Select
              value={selectedEmployer}
              onChange={(e) => setSelectedEmployer(e.target.value)}
              label="Empresa"
              disabled={loadingEmployers}
            >
              {loadingEmployers ? (
                <MenuItem value="">
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Carregando...
                  </Box>
                </MenuItem>
              ) : (
                employersList.map((employer) => (
                  <MenuItem key={employer.id} value={employer.id}>
                    {employer.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data Inicial"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data Final"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={handleGenerateReport}
              color="primary"
              disabled={loading || loadingEmployers}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
            <Tooltip title="Ver Ranking de Empresas">
              <IconButton
                color="primary"
                onClick={fetchRanking}
                disabled={loadingRanking}
              >
                {loadingRanking ? (
                  <CircularProgress size={24} />
                ) : (
                  <LeaderboardIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : reportData ? (
        <>
          <Grid container spacing={3}>
            {/* Gráfico de Pizza - Status dos Tickets */}
            <Grid item xs={12} md={6}>
              <Card className={classes.chartCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status dos Tickets
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pendentes', value: reportData.tickets.pending },
                            { name: 'Em Aberto', value: reportData.tickets.open },
                            { name: 'Fechados', value: reportData.tickets.closed }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Gráfico de Barras - Tickets por Funcionário */}
            <Grid item xs={12} md={6}>
              <Card className={classes.chartCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tickets por Funcionário
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.employees}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="tickets.pending" name="Pendentes" fill={COLORS[0]} />
                        <Bar dataKey="tickets.open" name="Em Aberto" fill={COLORS[1]} />
                        <Bar dataKey="tickets.closed" name="Fechados" fill={COLORS[2]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Lista detalhada de funcionários */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalhamento por Funcionário
              </Typography>
              <Grid container spacing={2}>
                {reportData.employees.map((employee) => (
                  <Grid item xs={12} md={6} key={employee.id}>
                    <Card className={classes.employeeCard} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {employee.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Cargo: {employee.position}
                        </Typography>
                        <Box mt={2}>
                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Typography variant="subtitle2">Pendentes</Typography>
                              <Typography color="error">
                                {employee.tickets.pending}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="subtitle2">Em Aberto</Typography>
                              <Typography color="primary">
                                {employee.tickets.open}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="subtitle2">Fechados</Typography>
                              <Typography color="success">
                                {employee.tickets.closed}
                              </Typography>
                              </Grid>
                          </Grid>
                          </Box>
                          <Box mt={1}>
                            <Typography variant="subtitle2" gutterBottom>
                              Total de Tickets: {employee.tickets.total}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {employee.tickets.total > 0 
                                ? ((employee.tickets.closed / employee.tickets.total) * 100).toFixed(1) 
                                : 0}% de resolução
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Card com totalizadores */}
            <Box mt={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo Geral
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Total de Tickets
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {reportData.tickets.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Tickets Pendentes
                      </Typography>
                      <Typography variant="h4" color="error">
                        {reportData.tickets.pending}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Tickets em Aberto
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {reportData.tickets.open}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Tickets Fechados
                      </Typography>
                      <Typography variant="h4" color="success">
                        {reportData.tickets.closed}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <Typography color="textSecondary">
              Selecione uma empresa e período para gerar o relatório
            </Typography>
          </Box>
        )}

        <RankingDialog />

      </Box>
    );
};

export default EmployerReport;