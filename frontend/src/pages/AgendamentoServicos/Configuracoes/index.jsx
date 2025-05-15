import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Tooltip,
  Grid, 
  TextField, 
  FormControlLabel, 
  Switch,
  IconButton,
  CircularProgress,
  Divider,
  Alert,
  Chip,
  Snackbar,
  InputAdornment,
  Slider,
  Card,
  CardContent,
  CardHeader,
  FormHelperText,
  useMediaQuery,
  useTheme,
  Button,
  LinearProgress,
  Fade
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { 
  Save as SaveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from '../../../helpers/toast';
import { api } from '../../../services/api';
import TemplateEditor from '../components/TemplateEditor';

// Schema de validação com Yup
const validationSchema = yup.object({
  minScheduleHoursAhead: yup
    .number()
    .min(0, 'Não pode ser negativo')
    .required('Campo obrigatório'),
  maxScheduleDaysAhead: yup
    .number()
    .min(1, 'Mínimo de 1 dia')
    .max(365, 'Máximo de 365 dias')
    .required('Campo obrigatório'),
  reminderHours: yup
    .number()
    .min(1, 'Mínimo de 1 hora')
    .max(72, 'Máximo de 72 horas')
    .required('Campo obrigatório'),
  welcomeMessage: yup
    .string()
    .required('Mensagem de boas-vindas é obrigatória'),
  confirmationMessage: yup
    .string()
    .required('Mensagem de confirmação é obrigatória'),
  reminderMessage: yup
    .string()
    .required('Mensagem de lembrete é obrigatória'),
  cancelMessage: yup
    .string()
    .required('Mensagem de cancelamento é obrigatória'),
  noSlotsMessage: yup
    .string()
    .required('Mensagem de horários indisponíveis é obrigatória')
});

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);
const AnimatedCard = animated(Card);

const Configuracoes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialValues, setInitialValues] = useState({
    scheduleEnabled: true,
    minScheduleHoursAhead: 1,
    maxScheduleDaysAhead: 30,
    reminderHours: 24,
    welcomeMessage: 'Olá! Bem-vindo ao nosso sistema de agendamento.\n\nDigite o número da opção desejada:\n1 - Fazer um agendamento\n2 - Consultar meus agendamentos\n3 - Falar com um atendente',
    confirmationMessage: 'Seu agendamento foi recebido com sucesso.\n\nServiço: {service}\nProfissional: {professional}\nData: {date}\nHorário: {time}\n\nPara confirmar este agendamento, responda com *CONFIRMAR*.\nPara cancelar, responda com *CANCELAR*.',
    reminderMessage: 'Olá {name}! Lembrete do seu agendamento para amanhã.\n\nServiço: {service}\nProfissional: {professional}\nData: {date}\nHorário: {time}\n\nAguardamos sua presença!',
    cancelMessage: 'Seu agendamento foi cancelado.\n\nServiço: {service}\nProfissional: {professional}\nData: {date}\nHorário: {time}\n\nPara reagendar, entre em contato conosco.',
    noSlotsMessage: 'Desculpe, não temos horários disponíveis para o dia selecionado. Por favor, tente outra data.'
  });

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
    config: { tension: 280, friction: 60 }
  });

  // Inicializa formulário com Formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await api.put('/schedule/settings', values);
        toast.success('Configurações salvas com sucesso');
        setSaveSuccess(true);
        // Recarrega os valores atualizados
        fetchSettings();
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        toast.error(
          error.response?.data?.message || 'Erro ao salvar configurações'
        );
      } finally {
        setLoading(false);
      }
    }
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/schedule/settings');
      setInitialValues({
        scheduleEnabled: data.scheduleEnabled ?? true,
        minScheduleHoursAhead: data.minScheduleHoursAhead ?? 1,
        maxScheduleDaysAhead: data.maxScheduleDaysAhead ?? 30,
        reminderHours: data.reminderHours ?? 24,
        welcomeMessage: data.welcomeMessage ?? '',
        confirmationMessage: data.confirmationMessage ?? '',
        reminderMessage: data.reminderMessage ?? '',
        cancelMessage: data.cancelMessage ?? '',
        noSlotsMessage: data.noSlotsMessage ?? ''
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSaveSuccess(false);
  };

  // Marcadores de placeholder nas mensagens
  const messagePlaceholders = [
    { label: '{name}', description: 'Nome do cliente' },
    { label: '{primeiro_nome}', description: 'Primeiro nome do cliente' },
    { label: '{service}', description: 'Nome do serviço' },
    { label: '{professional}', description: 'Nome do profissional' },
    { label: '{date}', description: 'Data do agendamento' },
    { label: '{time}', description: 'Horário do agendamento' },
    { label: '{duration}', description: 'Duração do serviço' },
    { label: '{price}', description: 'Preço do serviço' },
    { label: '{greeting}', description: 'Saudação baseada no horário (Bom dia, Boa tarde, etc)' },
    { label: '{cancellationReason}', description: 'Motivo do cancelamento' }
  ];

  return (
    <AnimatedBox style={fadeIn}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="h2">
            Configurações de Agendamento
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          type="submit"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={loading}
          onClick={formik.handleSubmit}
          sx={{ 
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: theme.shadows[3],
            padding: theme.spacing(1, 2),
          }}
        >
          Salvar Configurações
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ position: 'relative' }}>
          {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <AnimatedCard elevation={2} style={cardAnimation} sx={{ borderRadius: 2, height: '100%' }}>
                <CardHeader 
                  title="Configurações gerais" 
                  titleTypographyProps={{ variant: 'h6' }}
                  subheader="Defina os parâmetros de funcionamento do sistema de agendamento"
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiCardHeader-subheader': { 
                      color: 'primary.contrastText',
                      opacity: 0.8
                    }
                  }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.scheduleEnabled}
                            onChange={(e) => formik.setFieldValue('scheduleEnabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Habilitar sistema de agendamento"
                      />
                      <FormHelperText>
                        Ative ou desative o sistema de agendamento via WhatsApp
                      </FormHelperText>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Antecedência mínima para agendamento: {formik.values.minScheduleHoursAhead} horas
                      </Typography>
                      <Slider
                        value={formik.values.minScheduleHoursAhead}
                        onChange={(e, newValue) => formik.setFieldValue('minScheduleHoursAhead', newValue)}
                        valueLabelDisplay="auto"
                        step={1}
                        marks={[
                          { value: 0, label: '0h' },
                          { value: 24, label: '24h' },
                          { value: 48, label: '48h' }
                        ]}
                        min={0}
                        max={48}
                      />
                      <FormHelperText>
                        Quanto tempo antes o cliente precisa agendar (0 = pode agendar para hoje)
                      </FormHelperText>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Máximo de dias futuros para agendamento: {formik.values.maxScheduleDaysAhead} dias
                      </Typography>
                      <Slider
                        value={formik.values.maxScheduleDaysAhead}
                        onChange={(e, newValue) => formik.setFieldValue('maxScheduleDaysAhead', newValue)}
                        valueLabelDisplay="auto"
                        step={1}
                        marks={[
                          { value: 1, label: '1d' },
                          { value: 30, label: '30d' },
                          { value: 90, label: '90d' }
                        ]}
                        min={1}
                        max={90}
                      />
                      <FormHelperText>
                        Até quantos dias no futuro os clientes podem agendar
                      </FormHelperText>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Horas antes para envio de lembrete: {formik.values.reminderHours} horas
                      </Typography>
                      <Slider
                        value={formik.values.reminderHours}
                        onChange={(e, newValue) => formik.setFieldValue('reminderHours', newValue)}
                        valueLabelDisplay="auto"
                        step={1}
                        marks={[
                          { value: 1, label: '1h' },
                          { value: 24, label: '24h' },
                          { value: 48, label: '48h' }
                        ]}
                        min={1}
                        max={48}
                      />
                      <FormHelperText>
                        Quanto tempo antes do agendamento o cliente receberá um lembrete
                      </FormHelperText>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnimatedCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <AnimatedCard elevation={2} style={{...cardAnimation, delay: 300}} sx={{ borderRadius: 2, height: '100%' }}>
                <CardHeader 
                  title="Mensagens automáticas" 
                  titleTypographyProps={{ variant: 'h6' }}
                  subheader="Personalize as mensagens enviadas durante o processo de agendamento"
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiCardHeader-subheader': { 
                      color: 'primary.contrastText',
                      opacity: 0.8
                    }
                  }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TemplateEditor
                        label="Mensagem de boas-vindas"
                        value={formik.values.welcomeMessage}
                        onChange={(value) => formik.setFieldValue('welcomeMessage', value)}
                        helperText={formik.touched.welcomeMessage && formik.errors.welcomeMessage}
                        error={formik.touched.welcomeMessage && Boolean(formik.errors.welcomeMessage)}
                        placeholders={messagePlaceholders}
                        allTemplates={formik.values}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TemplateEditor
                        label="Mensagem de confirmação"
                        value={formik.values.confirmationMessage}
                        onChange={(value) => formik.setFieldValue('confirmationMessage', value)}
                        helperText={
                          (formik.touched.confirmationMessage && formik.errors.confirmationMessage) ||
                          "Enviada quando o cliente escolhe todos os detalhes do agendamento"
                        }
                        error={formik.touched.confirmationMessage && Boolean(formik.errors.confirmationMessage)}
                        placeholders={messagePlaceholders}
                        allTemplates={formik.values}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TemplateEditor
                        label="Mensagem de lembrete"
                        value={formik.values.reminderMessage}
                        onChange={(value) => formik.setFieldValue('reminderMessage', value)}
                        helperText={
                          (formik.touched.reminderMessage && formik.errors.reminderMessage) ||
                          "Enviada horas antes do agendamento conforme configurado acima"
                        }
                        error={formik.touched.reminderMessage && Boolean(formik.errors.reminderMessage)}
                        placeholders={messagePlaceholders}
                        allTemplates={formik.values}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TemplateEditor
                        label="Mensagem de cancelamento"
                        value={formik.values.cancelMessage}
                        onChange={(value) => formik.setFieldValue('cancelMessage', value)}
                        helperText={
                          (formik.touched.cancelMessage && formik.errors.cancelMessage) ||
                          "Enviada quando um agendamento é cancelado"
                        }
                        error={formik.touched.cancelMessage && Boolean(formik.errors.cancelMessage)}
                        placeholders={messagePlaceholders}
                        allTemplates={formik.values}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TemplateEditor
                        label="Mensagem de horários indisponíveis"
                        value={formik.values.noSlotsMessage}
                        onChange={(value) => formik.setFieldValue('noSlotsMessage', value)}
                        helperText={
                          (formik.touched.noSlotsMessage && formik.errors.noSlotsMessage) ||
                          "Enviada quando não há horários disponíveis para a data selecionada"
                        }
                        error={formik.touched.noSlotsMessage && Boolean(formik.errors.noSlotsMessage)}
                        placeholders={messagePlaceholders}
                        allTemplates={formik.values}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>
        </Box>
      </form>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          icon={<CheckIcon />}
          sx={{ width: '100%' }}
        >
          Configurações salvas com sucesso!
        </Alert>
      </Snackbar>
    </AnimatedBox>
  );
};

export default Configuracoes;