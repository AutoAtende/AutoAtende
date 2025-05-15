import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Business,
  Group,
  Storage,
  WhatsApp,
  Assignment
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

const UsageCard = ({ title, used = 0, total = 0, icon: Icon }) => {
  const percentage = Math.min((used / total) * 100, 100) || 0;
  const color = percentage > 90 ? 'error' : percentage > 70 ? 'warning' : 'success';

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Icon color={color} sx={{ mr: 1 }} />
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
        <Box mb={1}>
          <Typography variant="h4" component="span">
            {used}
          </Typography>
          <Typography variant="body2" component="span" color="textSecondary">
            {" "}/ {total}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={color}
        />
        <Typography variant="caption" color={`${color}.main`}>
          {percentage.toFixed(1)}% utilizado
        </Typography>
      </CardContent>
    </Card>
  );
};

const CompanyDetails = ({ open, onClose, companyId }) => {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompanyDetails = async () => {
      if (!companyId || !open) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data } = await api.get(`/companies/${companyId}/details`);
        setCompany(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Erro ao carregar detalhes da empresa');
        toast.error('Erro ao carregar detalhes da empresa');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyDetails();
  }, [companyId, open]);

  if (!company && !loading) return null;

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
  
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Informações Básicas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Nome/Razão Social
                </Typography>
                <Typography>{company.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  URL PBX
                </Typography>
                <Typography>
                  {company.urlPBX || 'Não configurado'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip 
                  label={company.status ? 'Ativo' : 'Bloqueado'}
                  color={company.status ? 'success' : 'error'}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
  
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Contato
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography>{company.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Telefone
                </Typography>
                <Typography>{company.phone}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
  
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Endereço
            </Typography>
            <Typography>
              {company.logradouro && `${company.logradouro}, ${company.numero}`}
              {company.complemento && ` - ${company.complemento}`} {/* Adicionando complemento */}
              {company.bairro && ` - ${company.bairro}`}
              {(company.cidade || company.estado) && <br />}
              {company.cidade && `${company.cidade}`}{company.estado && `/${company.estado}`}
              {company.cep && ` - CEP: ${company.cep}`}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPlanInfo = () => {
    if (!company.plan) {
      return (
        <Typography color="text.secondary">
          Nenhum plano encontrado
        </Typography>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Plano Atual
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Nome do Plano
                  </Typography>
                  <Typography variant="h6">{company.plan?.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Valor
                  </Typography>
                  <Typography>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(company.plan?.value || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Recorrência
                  </Typography>
                  <Typography>
                    {company.recurrence === 'MENSAL' ? 'Mensal' :
                     company.recurrence === 'BIMESTRAL' ? 'Bimestral' :
                     company.recurrence === 'TRIMESTRAL' ? 'Trimestral' :
                     company.recurrence === 'SEMESTRAL' ? 'Semestral' :
                     company.recurrence === 'ANUAL' ? 'Anual' : 
                     company.recurrence}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Faturamento
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Próximo Vencimento
                  </Typography>
                  <Typography>
                    {company.dueDate ? 
                      format(new Date(company.dueDate), 'dd/MM/yyyy', { locale: ptBR }) :
                      'Não definido'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Dia de Vencimento
                  </Typography>
                  <Typography>
                    Todo dia {company.diaVencimento || '1'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderUsageMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <UsageCard
          title="Usuários"
          used={company.metrics?.users?.used || 0}
          total={company.plan?.users || 0}
          icon={Group}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <UsageCard
          title="Conexões WhatsApp"
          used={company.metrics?.connections?.used || 0}
          total={company.plan?.connections || 0}
          icon={WhatsApp}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <UsageCard
          title="Filas"
          used={company.metrics?.queues?.used || 0}
          total={company.plan?.queues || 0}
          icon={Assignment}
        />
      </Grid>
    </Grid>
  );

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Business sx={{ mr: 1 }} />
            <Typography variant="h6">
              Detalhes da Empresa
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {loading ? (
        <DialogContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </DialogContent>
      ) : error ? (
        <DialogContent>
          <Box display="flex" justifyContent="center" p={3}>
            <Typography color="error">{error}</Typography>
          </Box>
        </DialogContent>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Informações" />
              <Tab label="Plano" />
              <Tab label="Métricas" />
            </Tabs>
          </Box>

          <DialogContent>
            <Box py={2}>
              {currentTab === 0 && renderBasicInfo()}
              {currentTab === 1 && renderPlanInfo()}
              {currentTab === 2 && renderUsageMetrics()}
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default CompanyDetails;