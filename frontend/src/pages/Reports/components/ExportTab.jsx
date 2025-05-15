import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Skeleton,
  useTheme,
  Stack,
  Chip
} from '@mui/material';
import {
  FileDownload,
  PictureAsPdf,
  Image,
  ErrorOutline,
  CheckCircleOutline,
  QueryStats
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";

// Componente para mostrar estatísticas do resumo
const SummaryCard = ({ title, value, icon, loading, color = 'primary' }) => {
  const theme = useTheme();
  
  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${theme.palette[color].main}`,
        boxShadow: theme.shadows[2],
        height: '100%'
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box
              sx={{
                backgroundColor: theme.palette[color].main,
                color: theme.palette[color].contrastText,
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={30} />
            ) : (
              <Typography variant="h5" component="div">
                {value}
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ExportTab = ({ filters, tickets, summaryData, onFilterChange, loading, users, queues }) => {
  const theme = useTheme();
  const [includeLogo, setIncludeLogo] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [employers, setEmployers] = useState([]);
  
  // Animação
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });
  
  // Carregamento de employers
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const { data } = await api.get('/employers');
        setEmployers(data.employers || []);
      } catch (error) {
        console.error('Erro ao carregar employers:', error);
      }
    };
    
    fetchEmployers();
  }, []);
  
  // Encontrar usuário pelo ID
  const findUser = (userId) => {
    if (!userId) return null;
    return users.find(user => user.id === userId) || null;
  };
  
  // Encontrar fila pelo ID
  const findQueue = (queueId) => {
    if (!queueId) return null;
    return queues.find(queue => queue.id === queueId) || null;
  };
  
  // Encontrar employer pelo ID
  const findEmployer = (employerId) => {
    if (!employerId) return null;
    return employers.find(emp => emp.id === Number(employerId)) || null;
  };
  
  // Função para exportar como PDF
  const handleExport = async () => {
    try {
      setExporting(true);
      setExportSuccess(false);
      setExportError(null);
      
      const requestData = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.userId || null,
        queueIds: filters.queueIds,
        tagIds: filters.tagIds,
        status: filters.status || null,
        employerId: filters.employerId || null,
        includeLogo
      };
      
      const response = await api.post('/reports/export', requestData, {
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-atendimentos-${format(new Date(), 'yyyy-MM-dd', { locale: ptBR })}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setExportSuccess(true);
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
      setExportError(i18n.t('reports.export.error'));
    } finally {
      setExporting(false);
    }
  };
  
  // Função para calcular status total
  const calculateStatusTotal = () => {
    if (!summaryData || !summaryData.ticketsByStatus) return 0;
    return (
      (summaryData.ticketsByStatus.open || 0) +
      (summaryData.ticketsByStatus.pending || 0) +
      (summaryData.ticketsByStatus.closed || 0)
    );
  };
  
  // Formatar tempo médio de atendimento
  const formatAverageTime = (minutes) => {
    if (!minutes) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins}m`;
  };
  
  // Formatação das tags de filtro
  const renderFilterTags = () => {
    const tags = [];
    
    if (filters.userId) {
      const user = findUser(filters.userId);
      if (user) {
        tags.push(
          <Chip
            key="user"
            size="small"
            label={`${i18n.t('reports.filters.user')}: ${user.name}`}
            color="primary"
            variant="outlined"
          />
        );
      }
    }
    
    if (filters.status) {
      const statusLabels = {
        open: i18n.t('reports.status.open'),
        pending: i18n.t('reports.status.pending'),
        closed: i18n.t('reports.status.closed')
      };
      
      tags.push(
        <Chip
          key="status"
          size="small"
          label={`${i18n.t('reports.filters.status')}: ${statusLabels[filters.status] || filters.status}`}
          color="primary"
          variant="outlined"
        />
      );
    }
    
    if (filters.queueIds && filters.queueIds.length > 0) {
      const queueNames = filters.queueIds
        .map(id => {
          const queue = findQueue(id);
          return queue ? queue.name : null;
        })
        .filter(Boolean);
      
      if (queueNames.length === 1) {
        tags.push(
          <Chip
            key="queue"
            size="small"
            label={`${i18n.t('reports.filters.queue')}: ${queueNames[0]}`}
            color="primary"
            variant="outlined"
          />
        );
      } else if (queueNames.length > 1) {
        tags.push(
          <Chip
            key="queues"
            size="small"
            label={`${i18n.t('reports.filters.queues')}: ${queueNames.length}`}
            color="primary"
            variant="outlined"
          />
        );
      }
    }
    
    if (filters.tagIds && filters.tagIds.length > 0) {
      tags.push(
        <Chip
          key="tags"
          size="small"
          label={`${i18n.t('reports.filters.tags')}: ${filters.tagIds.length}`}
          color="primary"
          variant="outlined"
        />
      );
    }
    
    // Chip para filtro de Employer
    if (filters.employerId) {
      const employer = findEmployer(filters.employerId);
      if (employer) {
        tags.push(
          <Chip
            key="employer"
            size="small"
            label={`${i18n.t('reports.filters.employer')}: ${employer.name}`}
            color="primary"
            variant="outlined"
          />
        );
      }
    }
    
    return tags;
  };
  
  return (
    <animated.div style={fadeIn}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Grid container spacing={3}>
          {/* Seção de resumo */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <QueryStats sx={{ mr: 1 }} />
              {i18n.t('reports.export.summary')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          {/* Cards de resumo */}
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title={i18n.t('reports.export.totalTickets')}
              value={summaryData ? summaryData.totalTickets : 0}
              icon={<QueryStats />}
              loading={loading}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title={i18n.t('reports.export.totalMessages')}
              value={summaryData ? summaryData.totalMessages : 0}
              icon={<QueryStats />}
              loading={loading}
              color="info"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title={i18n.t('reports.export.avgMessagesPerTicket')}
              value={summaryData ? summaryData.averageMessagesPerTicket.toFixed(1) : 0}
              icon={<QueryStats />}
              loading={loading}
              color="secondary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title={i18n.t('reports.export.avgAttendanceTime')}
              value={summaryData ? formatAverageTime(summaryData.averageAttendanceTime) : '0m'}
              icon={<QueryStats />}
              loading={loading}
              color="warning"
            />
          </Grid>
          
          {/* Status dos tickets */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t('reports.export.statusDistribution')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {loading ? (
                <Skeleton height={100} />
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: theme.palette.success.light,
                        color: theme.palette.success.contrastText
                      }}
                    >
                      <Typography variant="h6">
                        {summaryData && summaryData.ticketsByStatus ? summaryData.ticketsByStatus.open : 0}
                      </Typography>
                      <Typography variant="body2">
                        {i18n.t('reports.status.open')}
                      </Typography>
                      {summaryData && summaryData.ticketsByStatus && (
                        <Typography variant="caption">
                          {calculateStatusTotal() > 0
                            ? `${Math.round((summaryData.ticketsByStatus.open / calculateStatusTotal()) * 100)}%`
                            : '0%'}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: theme.palette.warning.light,
                        color: theme.palette.warning.contrastText
                      }}
                    >
                      <Typography variant="h6">
                        {summaryData && summaryData.ticketsByStatus ? summaryData.ticketsByStatus.pending : 0}
                      </Typography>
                      <Typography variant="body2">
                        {i18n.t('reports.status.pending')}
                      </Typography>
                      {summaryData && summaryData.ticketsByStatus && (
                        <Typography variant="caption">
                          {calculateStatusTotal() > 0
                            ? `${Math.round((summaryData.ticketsByStatus.pending / calculateStatusTotal()) * 100)}%`
                            : '0%'}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: theme.palette.error.light,
                        color: theme.palette.error.contrastText
                      }}
                    >
                      <Typography variant="h6">
                        {summaryData && summaryData.ticketsByStatus ? summaryData.ticketsByStatus.closed : 0}
                      </Typography>
                      <Typography variant="body2">
                        {i18n.t('reports.status.closed')}
                      </Typography>
                      {summaryData && summaryData.ticketsByStatus && (
                        <Typography variant="caption">
                          {calculateStatusTotal() > 0
                            ? `${Math.round((summaryData.ticketsByStatus.closed / calculateStatusTotal()) * 100)}%`
                            : '0%'}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
                              
          {/* Opções de exportação */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {i18n.t('reports.export.options')}
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                    name="includeLogo"
                    color="primary"
                  />
                }
                label={i18n.t('reports.export.includeLogo')}
              />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={exporting ? <CircularProgress size={24} color="inherit" /> : <FileDownload />}
                  onClick={handleExport}
                  disabled={exporting || tickets.length === 0}
                >
                  {exporting
                    ? i18n.t('reports.export.generating')
                    : i18n.t('reports.export.exportPdf')}
                </Button>
              </Box>
              
              {exportSuccess && (
                <Alert
                  icon={<CheckCircleOutline fontSize="inherit" />}
                  severity="success"
                  sx={{ mt: 2 }}
                >
                  {i18n.t('reports.export.success')}
                </Alert>
              )}
              
              {exportError && (
                <Alert
                  icon={<ErrorOutline fontSize="inherit" />}
                  severity="error"
                  sx={{ mt: 2 }}
                >
                  {exportError}
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </animated.div>
  );
};

export default ExportTab;