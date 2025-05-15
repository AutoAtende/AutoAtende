import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Alert,
  useTheme,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  FileDownload,
  TableChart,
  CloudDownload,
  ErrorOutline,
  CheckCircleOutline,
  QueryStats
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";

const ExportCsvTab = ({ onFilterChange, loading, users, queues }) => {
  const theme = useTheme();
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  // Estado dos filtros específicos para exportação CSV
  const [csvFilters, setCsvFilters] = useState({
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0],
    status: '',
    queueId: '',
    reasonId: ''
  });
  
  // Animação
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });
  
  
  // Função para atualizar os filtros locais
  const handleCsvFilterChange = (name, value) => {
    setCsvFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Função para exportar como CSV
  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      setExportSuccess(false);
      setExportError(null);
      
      const { data } = await api.post('/reports/csv', csvFilters);
      
      if (!data || data.length === 0) {
        setExportError(i18n.t('reports.exportCsv.noDataToExport'));
        return;
      }
      
      // Gerar CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(ticket => 
        Object.values(ticket)
          .map(value => 
            // Sanitizar valores para CSV (colocar aspas e escapar aspas existentes)
            typeof value === 'string' ? 
              `"${value.replace(/"/g, '""')}"` : 
              value
          )
          .join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      // Criar blob e fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-tickets-${format(new Date(), 'dd-MM-yyyy', { locale: ptBR })}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setExportSuccess(true);
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
      setExportError(i18n.t('reports.exportCsv.errorCsv'));
    } finally {
      setExportingCsv(false);
    }
  };
  
  return (
    <animated.div style={fadeIn}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Grid container spacing={3}>
          {/* Cabeçalho da seção */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CloudDownload sx={{ mr: 1 }} />
              {i18n.t('reports.exportCsv.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {i18n.t('reports.exportCsv.description')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          {/* Filtros específicos para CSV */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardHeader
                title={i18n.t('reports.exportCsv.filters')}
                avatar={<TableChart color="primary" />}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {/* Período de datas */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label={i18n.t('reports.filters.startDate')}
                      type="date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={csvFilters.dateStart}
                      onChange={(e) => handleCsvFilterChange('dateStart', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label={i18n.t('reports.filters.endDate')}
                      type="date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={csvFilters.dateEnd}
                      onChange={(e) => handleCsvFilterChange('dateEnd', e.target.value)}
                    />
                  </Grid>
                  
                  {/* Status */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{i18n.t('reports.filters.status')}</InputLabel>
                      <Select
                        value={csvFilters.status}
                        label={i18n.t('reports.filters.status')}
                        onChange={(e) => handleCsvFilterChange('status', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>{i18n.t('reports.filters.allStatus')}</em>
                        </MenuItem>
                        <MenuItem value="open">{i18n.t('reports.filters.statusOpen')}</MenuItem>
                        <MenuItem value="pending">{i18n.t('reports.filters.statusPending')}</MenuItem>
                        <MenuItem value="closed">{i18n.t('reports.filters.statusClosed')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Fila */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{i18n.t('reports.filters.queue')}</InputLabel>
                      <Select
                        value={csvFilters.queueId}
                        label={i18n.t('reports.filters.queue')}
                        onChange={(e) => handleCsvFilterChange('queueId', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>{i18n.t('reports.filters.allQueues')}</em>
                        </MenuItem>
                        {queues.map((queue) => (
                          <MenuItem key={queue.id} value={queue.id}>
                            {queue.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={exportingCsv ? <CircularProgress size={24} color="inherit" /> : <FileDownload />}
                    onClick={handleExportCsv}
                    disabled={exportingCsv}
                    sx={{ px: 4, py: 1 }}
                  >
                    {exportingCsv
                      ? i18n.t('reports.exportCsv.generating')
                      : i18n.t('reports.exportCsv.exportButton')}
                  </Button>
                </Box>
                
                {exportSuccess && (
                  <Alert
                    icon={<CheckCircleOutline fontSize="inherit" />}
                    severity="success"
                    sx={{ mt: 2 }}
                  >
                    {i18n.t('reports.exportCsv.success')}
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
              </CardContent>
            </Card>
          </Grid>
          
          {/* Prévia da estrutura do CSV */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardHeader
                title={i18n.t('reports.exportCsv.fileStructure')}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                <Typography variant="body2" component="pre" sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem', 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1, 
                  overflowX: 'auto' 
                }}>
                  id,nomeContato,numeroContato,criadoEm,iniciadoEm,enfileiradoEm,avaliadoEm,avaliado,status,usuario,idUsuario,fila,idFila,conexao,idConexao,primeiraMensagemEnviadaEm,resolvidoEm,contatoNovo,etiquetas
                </Typography>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  {i18n.t('reports.exportCsv.infoMessage')}
                </Alert>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Detalhes e instruções */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {i18n.t('reports.exportCsv.instructions')}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {i18n.t('reports.exportCsv.instruction1')}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {i18n.t('reports.exportCsv.instruction2')}
              </Typography>
              
              <Typography variant="body2">
                {i18n.t('reports.exportCsv.instruction3')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </animated.div>
  );
};

export default ExportCsvTab;