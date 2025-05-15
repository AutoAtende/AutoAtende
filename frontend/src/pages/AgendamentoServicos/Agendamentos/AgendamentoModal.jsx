import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
  Tooltip,
  Divider,
  InputAdornment
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from '../../../helpers/toast';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Spa as SpaIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import api from '../../../services/api';
import {
  STATUS_OPTIONS,
  formatDateToString,
  formatTimeToString,
  combineDateAndTime
} from '../constants';
import BaseModal from '../../../components/shared/BaseModal';

// Schema de validação com Yup
const validationSchema = yup.object({
  scheduledDate: yup
    .string()
    .required('Data é obrigatória'),
  scheduledTime: yup
    .string()
    .required('Horário é obrigatório'),
  professionalId: yup
    .number()
    .required('Profissional é obrigatório'),
  serviceId: yup
    .number()
    .required('Serviço é obrigatório'),
  contactId: yup
    .number()
    .required('Cliente é obrigatório'),
  whatsappId: yup
    .number()
    .required('Conexão WhatsApp é obrigatória'),
  notes: yup
    .string(),
  status: yup
    .string()
    .required('Status é obrigatório'),
  cancellationReason: yup
    .string()
});

const AgendamentoModal = ({ open, onClose, appointment, selectedDate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Animações com react-spring
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Garante que a data inicial seja um objeto dayjs válido
  const initialDate = useMemo(() => {
    if (appointment?.scheduledAt) {
      return dayjs(appointment.scheduledAt);
    }
    if (selectedDate && dayjs(selectedDate).isValid()) {
      return dayjs(selectedDate);
    }
    return dayjs();
  }, [appointment, selectedDate]);

  const formik = useFormik({
    initialValues: {
      scheduledDate: formatDateToString(initialDate),
      scheduledTime: formatTimeToString(initialDate),
      professionalId: appointment?.professionalId || '',
      serviceId: appointment?.serviceId || '',
      contactId: appointment?.contactId || '',
      whatsappId: appointment?.whatsappId || '',
      notes: appointment?.notes || '',
      status: appointment?.status || 'pending',
      cancellationReason: appointment?.cancellationReason || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Validar manualmente o campo cancellationReason quando o status é cancelled
      if (values.status === 'cancelled' && !values.cancellationReason) {
        formik.setFieldError('cancellationReason', 'Motivo de cancelamento é obrigatório');
        return;
      }

      setLoading(true);
      try {
        // Criar um objeto de data a partir das strings de data e hora
        let scheduledAt;
        try {
          const dateStr = values.scheduledDate;
          const timeStr = values.scheduledTime;

          // Construir uma string ISO de data e hora
          const dateTimeStr = `${dateStr}T${timeStr}:00`;
          scheduledAt = dateTimeStr;
        } catch (e) {
          console.error("Erro ao processar data/hora:", e);
          scheduledAt = new Date().toISOString(); // Fallback
        }

        const submissionData = {
          professionalId: values.professionalId,
          serviceId: values.serviceId,
          contactId: values.contactId,
          whatsappId: values.whatsappId,
          notes: values.notes,
          status: values.status,
          cancellationReason: values.cancellationReason,
          scheduledAt: scheduledAt
        };

        if (appointment) {
          await api.put(`/appointments/${appointment.id}`, submissionData);
          toast.success('Agendamento atualizado com sucesso');
        } else {
          await api.post('/appointments', submissionData);
          toast.success('Agendamento criado com sucesso');
        }
        onClose();
      } catch (error) {
        console.error(error);
        const errorMessage = error.response?.data?.message || 'Erro ao salvar agendamento';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  // Carrega dados necessários (profissionais, serviços, clientes, whatsapp)
  const fetchData = useCallback(async () => {
    if (open) {
      setLoadingData(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const [professionalsResponse, servicesResponse, contactsResponse, whatsappsResponse] =
          await Promise.all([
            api.get('/professionals', {
              params: { active: true },
              signal: controller.signal
            }),
            api.get('/services', {
              params: { active: true },
              signal: controller.signal
            }),
            api.get('/contacts/list', { signal: controller.signal }),
            api.get('/whatsapp', { signal: controller.signal })
          ]);

        clearTimeout(timeoutId);

        // Processamento dos dados com verificações adicionais
        setProfessionals(Array.isArray(professionalsResponse.data) ? professionalsResponse.data :
          (professionalsResponse.data && Array.isArray(professionalsResponse.data.records)) ?
            professionalsResponse.data.records : []);

        setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data :
          (servicesResponse.data && Array.isArray(servicesResponse.data.records)) ?
            servicesResponse.data.records : []);

        setContacts(Array.isArray(contactsResponse.data) ? contactsResponse.data :
          (contactsResponse.data && Array.isArray(contactsResponse.data.records)) ?
            contactsResponse.data.records : []);

        // Processa os WhatsApps disponíveis e adiciona status (online/offline)
        const whatsappList = Array.isArray(whatsappsResponse.data) ? whatsappsResponse.data :
          (whatsappsResponse.data && Array.isArray(whatsappsResponse.data.records)) ?
            whatsappsResponse.data.records : [];

        // Garante que cada whatsapp tenha um status definido
        const processedWhatsapps = whatsappList.map(w => ({
          ...w,
          status: w.status
        }));

        setWhatsapps(processedWhatsapps);

        // Se não houver um WhatsApp selecionado, seleciona o padrão ou o primeiro
        if (!formik.values.whatsappId && processedWhatsapps.length > 0) {
          const defaultWhatsapp = processedWhatsapps.find(w => w.isDefault && w.status === 'CONNECTED') ||
            processedWhatsapps.find(w => w.status === 'DISCONNECTED') ||
            processedWhatsapps.find(w => w.isDefault) ||
            processedWhatsapps[0];
          formik.setFieldValue('whatsappId', defaultWhatsapp.id);
        }

        // Se estiver editando, pré-selecionar serviço e profissional
        if (appointment) {
          const service = Array.isArray(servicesResponse.data) ?
            servicesResponse.data.find(s => s.id === appointment.serviceId) : null;
          const professional = Array.isArray(professionalsResponse.data) ?
            professionalsResponse.data.find(p => p.id === appointment.professionalId) : null;

          setSelectedService(service || null);
          setSelectedProfessional(professional || null);
        }

      } catch (error) {
        if (error.name === 'AbortError') {
          toast.error('Tempo limite excedido ao carregar dados. Tente novamente.');
        } else {
          console.error('Erro ao carregar dados necessários para o agendamento:', error);
          toast.error('Erro ao carregar dados necessários para o agendamento');
        }
      } finally {
        setLoadingData(false);
      }
    }
  }, [open, appointment, formik]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função para buscar horários disponíveis
  const fetchTimeSlots = useCallback(async () => {
    if (!formik.values.serviceId || !formik.values.professionalId || !formik.values.scheduledDate) {
      return;
    }

    // Não buscar slots ao editar um agendamento existente
    if (appointment) {
      return;
    }

    // Evitar chamadas múltiplas durante o carregamento
    if (loadingTimeSlots) {
      return;
    }

    // Implementar throttling adequado
    const now = Date.now();
    if (now - lastFetchTime < 1000) { // Tempo mínimo entre chamadas: 1 segundo
      return;
    }

    try {
      setLoadingTimeSlots(true);
      setLastFetchTime(now);

      console.log('Buscando slots disponíveis:', {
        professionalId: formik.values.professionalId,
        serviceId: formik.values.serviceId,
        date: formik.values.scheduledDate
      });

      const { data } = await api.get('/availability/slots', {
        params: {
          professionalId: formik.values.professionalId,
          serviceId: formik.values.serviceId,
          date: formik.values.scheduledDate
        }
      });

      console.log('Slots recebidos:', data);
      setAvailableTimeSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
      toast.error('Erro ao carregar horários disponíveis');
      setAvailableTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  }, [formik.values.serviceId, formik.values.professionalId, formik.values.scheduledDate, appointment, lastFetchTime, loadingTimeSlots]);

  // Efeito para buscar slots de horários disponíveis
  useEffect(() => {
    // Verificação de condições para busca
    const shouldFetchTimeSlots =
      !appointment &&
      formik.values.serviceId &&
      formik.values.professionalId &&
      formik.values.scheduledDate;

    if (shouldFetchTimeSlots) {
      // Atraso para agrupar mudanças de estado
      const timeoutId = setTimeout(() => {
        fetchTimeSlots();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [fetchTimeSlots, appointment]);

  const handleServiceChange = (event, service) => {
    setSelectedService(service);
    formik.setFieldValue('serviceId', service ? service.id : '');
  };

  const handleProfessionalChange = (event, professional) => {
    setSelectedProfessional(professional);
    formik.setFieldValue('professionalId', professional ? professional.id : '');
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    formik.setFieldValue('scheduledDate', date);
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    formik.setFieldValue('scheduledTime', time);
  };

  const handleTimeSlotSelect = (startTime) => {
    const time = formatTimeToString(dayjs(startTime));
    formik.setFieldValue('scheduledTime', time);
  };

  // Verifica se o horário selecionado está disponível
  const isTimeSlotAvailable = (time) => {
    if (!availableTimeSlots.length || appointment) return true;

    return availableTimeSlots.some(slot => {
      const slotStart = dayjs(slot.startTime);
      const slotEnd = dayjs(slot.endTime);
      const selectedTime = combineDateAndTime(formik.values.scheduledDate, time);

      return selectedTime && (
        selectedTime.isAfter(slotStart) || selectedTime.isSame(slotStart)
      ) && selectedTime.isBefore(slotEnd);
    });
  };

  // Definindo ações do modal para usar com o BaseModal
  const modalActions = [
    {
      label: 'Cancelar',
      onClick: onClose,
      variant: 'outlined',
      color: 'secondary',
      disabled: loading,
      icon: <CloseIcon />
    },
    {
      label: appointment ? 'Atualizar' : 'Salvar',
      onClick: formik.handleSubmit,
      variant: 'contained',
      color: 'primary',
      disabled: loading || (!appointment && !isTimeSlotAvailable(formik.values.scheduledTime)) || whatsapps.length === 0,
      icon: loading ? <CircularProgress size={24} /> : <SaveIcon />
    }
  ];

  const modalTitle = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <EventIcon color="primary" />
      <Typography variant="h6">
        {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
      </Typography>
    </Box>
  );

  // Estilos personalizados para o modal
  const modalStyles = {
    '& .MuiDialogContent-root': {
      overflowY: 'auto',
      maxHeight: '80vh',
      paddingTop: 3
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      actions={modalActions}
      maxWidth="md"
      loading={loadingData}
      sx={modalStyles} // Aplicando os estilos corretamente
    >
      <animated.div style={fadeIn}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  id="contactId"
                  options={contacts}
                  getOptionLabel={(option) => {
                    if (!option) return '';
                    if (typeof option === 'object' && option.name) {
                      return `${option.name} (${option.number || 'Sem telefone'})`;
                    }
                    return '';
                  }}
                  value={contacts.find(c => c.id === formik.values.contactId) || null}
                  onChange={(_, contact) => {
                    formik.setFieldValue('contactId', contact ? contact.id : '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      variant="outlined"
                      error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                      helperText={formik.touched.contactId && formik.errors.contactId}
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" color="primary" />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                  fullWidth
                  loading={contacts.length === 0}
                  loadingText="Carregando..."
                  noOptionsText="Nenhum cliente encontrado"
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  id="serviceId"
                  options={services}
                  getOptionLabel={(option) => option ? option.name : ''}
                  value={selectedService}
                  onChange={handleServiceChange}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: option.color || '#ccc',
                          mr: 1.5
                        }}
                      />
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.duration} min
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Serviço"
                      variant="outlined"
                      error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}
                      helperText={formik.touched.serviceId && formik.errors.serviceId}
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SpaIcon fontSize="small" color="primary" />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                  fullWidth
                  loading={services.length === 0}
                  loadingText="Carregando..."
                  noOptionsText="Nenhum serviço encontrado"
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  id="professionalId"
                  options={professionals}
                  getOptionLabel={(option) => option ? option.name : ''}
                  value={selectedProfessional}
                  onChange={handleProfessionalChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Profissional"
                      variant="outlined"
                      error={formik.touched.professionalId && Boolean(formik.errors.professionalId)}
                      helperText={formik.touched.professionalId && formik.errors.professionalId}
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" color="primary" />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                  fullWidth
                  loading={professionals.length === 0}
                  loadingText="Carregando..."
                  noOptionsText="Nenhum profissional encontrado"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={formik.touched.whatsappId && Boolean(formik.errors.whatsappId)}
                  required
                >
                  <InputLabel id="whatsapp-label">Conexão WhatsApp</InputLabel>
                  <Select
                    labelId="whatsapp-label"
                    id="whatsappId"
                    name="whatsappId"
                    value={formik.values.whatsappId}
                    onChange={formik.handleChange}
                    label="Conexão WhatsApp"
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Selecione uma conexão</em>
                    </MenuItem>
                    {whatsapps.map((whatsapp) => (
                      <MenuItem key={whatsapp.id} value={whatsapp.id}>
                        {whatsapp.name} {whatsapp.isDefault ? '(Padrão)' : ''} - {whatsapp.number}
                        <Box component="span" sx={{
                          ml: 1,
                          color: whatsapp.status === 'CONNECTED' ? 'success.main' : 'error.main',
                          fontWeight: 'medium',
                          fontSize: '0.85rem'
                        }}>
                          {whatsapp.status === 'CONNECTED' ? 'Online' : 'Offline'}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.whatsappId && formik.errors.whatsappId && (
                    <FormHelperText>{formik.errors.whatsappId}</FormHelperText>
                  )}
                  {whatsapps.length === 0 && (
                    <FormHelperText error>
                      Nenhuma conexão WhatsApp configurada. Configure uma conexão para criar agendamentos.
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="scheduledDate"
                  name="scheduledDate"
                  label="Data"
                  type="date"
                  value={formik.values.scheduledDate}
                  onChange={handleDateChange}
                  error={formik.touched.scheduledDate && Boolean(formik.errors.scheduledDate)}
                  helperText={formik.touched.scheduledDate && formik.errors.scheduledDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    )
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="scheduledTime"
                  name="scheduledTime"
                  label="Horário"
                  type="time"
                  value={formik.values.scheduledTime}
                  onChange={handleTimeChange}
                  error={(formik.touched.scheduledTime && Boolean(formik.errors.scheduledTime)) ||
                    (!isTimeSlotAvailable(formik.values.scheduledTime) && !appointment)}
                  helperText={(formik.touched.scheduledTime && formik.errors.scheduledTime) ||
                    (!isTimeSlotAvailable(formik.values.scheduledTime) && !appointment ?
                      "Horário indisponível" : "")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    )
                  }}
                  required
                />
              </Grid>

              {!appointment && loadingTimeSlots && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Carregando horários disponíveis...
                    </Typography>
                  </Box>
                </Grid>
              )}

              {!appointment && !loadingTimeSlots && availableTimeSlots.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Horários disponíveis:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {availableTimeSlots.map((slot) => {
                      const startTime = dayjs(slot.startTime);
                      const formattedTime = startTime.format('HH:mm');
                      const isSelected = formik.values.scheduledTime === formattedTime;

                      return (
                        <Button
                          key={formattedTime}
                          variant={isSelected ? "contained" : "outlined"}
                          size="small"
                          onClick={() => handleTimeSlotSelect(startTime)}
                          sx={{
                            minWidth: 48,
                            minHeight: 36,
                            m: 0.5,
                            borderRadius: 8
                          }}
                        >
                          {formattedTime}
                        </Button>
                      );
                    })}
                  </Box>
                </Grid>
              )}

              {appointment && (
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    error={formik.touched.status && Boolean(formik.errors.status)}
                  >
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      label="Status"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.status && formik.errors.status && (
                      <FormHelperText>{formik.errors.status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}

              {formik.values.status === 'cancelled' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="cancellationReason"
                    name="cancellationReason"
                    label="Motivo do cancelamento"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={formik.values.cancellationReason}
                    onChange={formik.handleChange}
                    error={formik.touched.cancellationReason && Boolean(formik.errors.cancellationReason)}
                    helperText={formik.touched.cancellationReason && formik.errors.cancellationReason}
                    required={formik.values.status === 'cancelled'}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Observações"
              variant="outlined"
              multiline
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Adicione informações importantes sobre este agendamento" arrow>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </animated.div>
    </BaseModal>
  );
};

AgendamentoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    scheduledAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.object // para suportar objetos dayjs
    ]).isRequired,
    professionalId: PropTypes.number.isRequired,
    serviceId: PropTypes.number.isRequired,
    contactId: PropTypes.number.isRequired,
    whatsappId: PropTypes.number,
    notes: PropTypes.string,
    status: PropTypes.oneOf(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).isRequired,
    cancellationReason: PropTypes.string,
    duration: PropTypes.number,
    professional: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }),
    service: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }),
    contact: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      number: PropTypes.string
    })
  }),
  selectedDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.object
  ])
};

AgendamentoModal.defaultProps = {
  appointment: null,
  selectedDate: null
};

export default AgendamentoModal;