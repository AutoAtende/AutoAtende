import React, { useState, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AssessmentOutlined, Download, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BaseModal from '../shared/BaseModal';
import api from '../../services/api';
import { toast } from '../../helpers/toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SatisfactionReport = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
    fetchData();
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/satisfaction-survey/summary');
      setData(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportCSV = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/satisfaction-survey', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pesquisa-satisfacao-${format(new Date(), 'dd-MM-yyyy')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setLoading(false);
    }
  }, []);

  const renderMetricCard = useCallback((title, value, description) => (
    <Card className="h-full shadow">
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="h4" color="primary">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </CardContent>
    </Card>
  ), []);

  const renderActions = useCallback(() => (
    <Box className="flex gap-4 mb-6 items-center justify-end">
      <Button
        variant="outlined"
        startIcon={<Refresh />}
        onClick={fetchData}
        disabled={loading}
      >
        Atualizar Dados
      </Button>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={handleExportCSV}
        disabled={loading}
      >
        Exportar CSV
      </Button>
    </Box>
  ), [fetchData, handleExportCSV, loading]);

  const renderCharts = useCallback(() => {
    if (!data) return null;

    // Certifique-se de que os dados existem e têm o formato esperado
    const mediasGerais = data.mediasGerais || {};
    const distribuicaoNotas = data.distribuicaoNotas || {};
    const tendenciaTemporal = data.tendenciaTemporal || [];
    const empresasMaisSatisfeitas = data.empresasMaisSatisfeitas || [];
    const taxaRecomendacao = data.taxaRecomendacao || { nps: 0, promotores: 0, neutros: 0, detratores: 0 };

    // Preparar dados para os gráficos
    const distribuicaoData = Object.entries(distribuicaoNotas).map(([range, count]) => ({
      range,
      count: count || 0
    }));

    const tendenciaData = tendenciaTemporal.map(item => ({
      ...item,
      data: item.data ? new Date(item.data).getTime() : new Date().getTime(),
      satisfacaoGeral: item.satisfacaoGeral || 0
    }));

    const npsData = [
      { name: 'Promotores', value: taxaRecomendacao.promotores },
      { name: 'Neutros', value: taxaRecomendacao.neutros },
      { name: 'Detratores', value: taxaRecomendacao.detratores }
    ];

    return (
      <Grid container spacing={3}>
        {/* Métricas Principais - Linha 1 */}
        <Grid item xs={12} md={3}>
          {renderMetricCard(
            'Total de Respostas',
            data.totalRespostas || 0,
            'Número total de pesquisas respondidas'
          )}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard(
            'Satisfação Geral',
            `${(mediasGerais.satisfacaoGeral || 0).toFixed(1)}/10`,
            'Média da satisfação geral dos usuários'
          )}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard(
            'NPS',
            `${taxaRecomendacao.nps || 0}`,
            'Net Promoter Score (Taxa de Recomendação)'
          )}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard(
            'Empresas Participantes',
            data.companies?.length || 0,
            'Total de empresas que responderam'
          )}
        </Grid>

        {/* Métricas de Módulos - Linha 2 */}
        <Grid item xs={6} md={2}>
          {renderMetricCard(
            'Atendimento',
            `${(mediasGerais.atendimento || 0).toFixed(1)}`,
            'Satisfação com chat/atendimento'
          )}
        </Grid>
        <Grid item xs={6} md={2}>
          {renderMetricCard(
            'Gerenciamento',
            `${(mediasGerais.gerenciamento || 0).toFixed(1)}`,
            'Satisfação com gestão usuários/empresas'
          )}
        </Grid>
        <Grid item xs={6} md={2}>
          {renderMetricCard(
            'WhatsApp',
            `${(mediasGerais.whatsapp || 0).toFixed(1)}`,
            'Satisfação com conexões WhatsApp'
          )}
        </Grid>
        <Grid item xs={6} md={2}>
          {renderMetricCard(
            'Tarefas',
            `${(mediasGerais.tarefas || 0).toFixed(1)}`,
            'Satisfação com sistema de tarefas'
          )}
        </Grid>
        <Grid item xs={6} md={2}>
          {renderMetricCard(
            'Recursos',
            `${(mediasGerais.recursos || 0).toFixed(1)}`,
            'Satisfação com recursos adicionais'
          )}
        </Grid>
        <Grid item xs={6} md={2}>
          {renderMetricCard(
            'Suporte',
            `${(mediasGerais.suporte || 0).toFixed(1)}`,
            'Satisfação com suporte técnico'
          )}
        </Grid>

        {/* Gráficos - Linha 3 */}
        <Grid item xs={12} md={6}>
          <Card className="h-96 shadow">
            <CardContent>
              <Typography variant="h6" gutterBottom>Distribuição de Notas</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distribuicaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="h-96 shadow">
            <CardContent>
              <Typography variant="h6" gutterBottom>Taxa de Recomendação (NPS)</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={npsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value }) => (value > 0 ? `${name}: ${value}%` : null)}
                  >
                    {npsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        index === 0 ? '#4caf50' : // Promotores - verde
                        index === 1 ? '#2196f3' : // Neutros - azul
                        '#ff9800'                 // Detratores - laranja
                      } />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    layout="horizontal" 
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      return `${value}: ${payload.value}%`;
                    }}
                  />
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: '24px', fontWeight: 'bold' }}
                  >
                    {`${taxaRecomendacao.nps || 0}`}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráficos - Linha 4 */}
        <Grid item xs={12} md={6}>
          <Card className="h-96 shadow">
            <CardContent>
              <Typography variant="h6" gutterBottom>Tendência Temporal</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendenciaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="data" 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(timestamp) => {
                      try {
                        return format(new Date(timestamp), 'dd/MM', { locale: ptBR });
                      } catch (e) {
                        return '';
                      }
                    }}
                  />
                  <YAxis domain={[0, 10]} />
                  <RechartsTooltip 
                    labelFormatter={(timestamp) => {
                      try {
                        return format(new Date(timestamp), 'dd/MM/yyyy', { locale: ptBR });
                      } catch (e) {
                        return '';
                      }
                    }}
                  />
                  <Line type="monotone" dataKey="satisfacaoGeral" stroke="#2196f3" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="h-96 shadow">
            <CardContent>
              <Typography variant="h6" gutterBottom>Empresas Mais Satisfeitas</Typography>
              {empresasMaisSatisfeitas?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={empresasMaisSatisfeitas}
                    layout="vertical"
                    margin={{ left: 20, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 10]} tickCount={11} />
                    <YAxis 
                      dataKey="nome" 
                      type="category" 
                      width={120} 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`${value}/10`, 'Média de Satisfação']}
                      labelFormatter={(nome) => nome}
                    />
                    <Bar dataKey="media" fill="#4caf50" name="Satisfação" barSize={20}>
                      {empresasMaisSatisfeitas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="media" position="right" formatter={(value) => `${value}/10`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box className="flex flex-col items-center justify-center h-64">
                  <Typography variant="body1" className="text-center">Sem dados suficientes</Typography>
                  <Typography variant="caption" color="textSecondary" className="mt-2 text-center">
                    É necessário pelo menos 3 respostas por empresa
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sugestões de Melhoria */}
        {data.principaisMelhorias && data.principaisMelhorias.length > 0 && (
          <Grid item xs={12}>
            <Card className="shadow">
              <CardContent>
                <Typography variant="h6" gutterBottom>Sugestões de Melhorias</Typography>
                <Box className="overflow-auto max-h-96">
                  {data.principaisMelhorias.map((item, index) => (
                    <Box key={index} className="mb-4 p-3 border rounded">
                      <Typography variant="subtitle2" color="primary">
                        {item.tipo === 'atendimento' ? 'Módulo de Atendimento' : 'Geral'}
                      </Typography>
                      <Typography variant="body2">{item.sugestao}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  }, [data, renderMetricCard]);

  return (
    <>
      <Tooltip title="Relatórios de Satisfação">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          size="large"
        >
          <AssessmentOutlined style={{ color: 'white' }} />
        </IconButton>
      </Tooltip>

      <BaseModal
        open={open}
        onClose={handleClose}
        title="Relatório de Pesquisa de Satisfação"
        maxWidth="lg"
      >
        <Box className="p-6">
          {renderActions()}
          {loading ? (
            <Box className="flex justify-center items-center h-96">
              <CircularProgress />
              <Typography className="ml-3">Carregando dados...</Typography>
            </Box>
          ) : (
            renderCharts()
          )}
        </Box>
      </BaseModal>
    </>
  );
};

export default SatisfactionReport;