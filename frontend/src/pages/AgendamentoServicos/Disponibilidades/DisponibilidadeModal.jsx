import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  FormHelperText,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { 
  Save as SaveIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from '../../../helpers/toast';
import { api } from '../../../services/api';
import { 
  DIAS_SEMANA, 
  DEFAULT_START_TIME, 
  DEFAULT_END_TIME, 
  DEFAULT_LUNCH_START, 
  DEFAULT_LUNCH_END 
} from '../constants';
import BaseModal from '../../../components/shared/BaseModal';

// Schema de validação com Yup
const validationSchema = yup.object({
  weekday: yup
    .number()
    .required('Dia da semana é obrigatório'),
  startTime: yup
    .string()
    .required('Horário inicial é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  endTime: yup
    .string()
    .required('Horário final é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)')
    .test('is-greater', 'Horário final deve ser maior que o inicial', function(value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return value > startTime;
    }),
    startLunchTime: yup
    .string()
    .nullable()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)')
    .test('is-after-start', 'Deve ser após o horário inicial', function(value) {
      const { startTime } = this.parent;
      if (!value || !startTime) return true;
      return value > startTime;
    }),
  endLunchTime: yup
    .string()
    .nullable()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)')
    .test('is-after-lunch-start', 'Deve ser após o início do almoço', function(value) {
      const { startLunchTime } = this.parent;
      if (!value || !startLunchTime) return true;
      return value > startLunchTime;
    })
    .test('is-before-end', 'Deve ser antes do horário final', function(value) {
      const { endTime } = this.parent;
      if (!value || !endTime) return true;
      return value < endTime;
    }),
  slotDuration: yup
    .number()
    .required('Duração do slot é obrigatória')
    .min(5, 'Mínimo de 5 minutos')
    .max(240, 'Máximo de 240 minutos (4 horas)')
});

const DisponibilidadeModal = ({ open, onClose, availability, professionalId }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Animações com react-spring
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Inicializa formulário com Formik
  const formik = useFormik({
    initialValues: {
      weekday: availability?.weekday ?? 1,
      weekdayLabel: availability?.weekdayLabel ?? DIAS_SEMANA.find(d => d.value === (availability?.weekday ?? 1))?.label,
      startTime: availability?.startTime ?? DEFAULT_START_TIME,
      endTime: availability?.endTime ?? DEFAULT_END_TIME,
      startLunchTime: availability?.startLunchTime ?? DEFAULT_LUNCH_START,
      endLunchTime: availability?.endLunchTime ?? DEFAULT_LUNCH_END,
      slotDuration: availability?.slotDuration ?? 30,
      active: availability?.active !== undefined ? availability.active : true
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Define o label do dia da semana com base no valor numérico
        const weekdayLabel = DIAS_SEMANA.find(d => d.value === values.weekday)?.label || '';
        
        const data = {
          ...values,
          weekdayLabel,
          professionalId
        };
        
        if (availability && availability.id) {
          await api.put(`/availabilities/${availability.id}`, data);
          toast.success('Disponibilidade atualizada com sucesso');
        } else {
          await api.post(`/professionals/${professionalId}/availabilities`, data);
          toast.success('Disponibilidade criada com sucesso');
        }
        onClose();
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || 'Erro ao salvar disponibilidade'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleWeekdayChange = (event) => {
    const weekday = Number(event.target.value);
    const weekdayLabel = DIAS_SEMANA.find(d => d.value === weekday)?.label || '';
    formik.setFieldValue('weekday', weekday);
    formik.setFieldValue('weekdayLabel', weekdayLabel);
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
      label: availability ? 'Atualizar' : 'Salvar',
      onClick: formik.handleSubmit,
      variant: 'contained',
      color: 'primary',
      disabled: loading,
      icon: loading ? <CircularProgress size={24} /> : <SaveIcon />
    }
  ];

  const modalTitle = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AccessTimeIcon color="primary" />
      <Typography variant="h6">
        {availability && availability.id ? 'Editar Disponibilidade' : 'Nova Disponibilidade'}
      </Typography>
    </Box>
  );

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      actions={modalActions}
      maxWidth="sm"
      loading={loadingData}
    >
      <animated.div style={fadeIn} sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="weekday"
              name="weekday"
              select
              label="Dia da semana"
              value={formik.values.weekday}
              onChange={handleWeekdayChange}
              error={formik.touched.weekday && Boolean(formik.errors.weekday)}
              helperText={formik.touched.weekday && formik.errors.weekday}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon fontSize="small" color="primary" />
                  </InputAdornment>
                )
              }}
            >
              {DIAS_SEMANA.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="startTime"
              name="startTime"
              label="Horário inicial"
              type="time"
              value={formik.values.startTime}
              onChange={formik.handleChange}
              error={formik.touched.startTime && Boolean(formik.errors.startTime)}
              helperText={formik.touched.startTime && formik.errors.startTime}
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
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="endTime"
              name="endTime"
              label="Horário final"
              type="time"
              value={formik.values.endTime}
              onChange={formik.handleChange}
              error={formik.touched.endTime && Boolean(formik.errors.endTime)}
              helperText={formik.touched.endTime && formik.errors.endTime}
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
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2">
                Horário de almoço/pausa (opcional)
              </Typography>
              <Tooltip title="Defina um período de intervalo que não estará disponível para agendamentos" arrow>
                <IconButton size="small">
                  <InfoIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="startLunchTime"
              name="startLunchTime"
              label="Início do intervalo"
              type="time"
              value={formik.values.startLunchTime || ''}
              onChange={formik.handleChange}
              error={formik.touched.startLunchTime && Boolean(formik.errors.startLunchTime)}
              helperText={formik.touched.startLunchTime && formik.errors.startLunchTime}
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
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="endLunchTime"
              name="endLunchTime"
              label="Fim do intervalo"
              type="time"
              value={formik.values.endLunchTime || ''}
              onChange={formik.handleChange}
              error={formik.touched.endLunchTime && Boolean(formik.errors.endLunchTime)}
              helperText={formik.touched.endLunchTime && formik.errors.endLunchTime}
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
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="slotDuration"
              name="slotDuration"
              label="Duração dos slots (minutos)"
              type="number"
              variant="outlined"
              value={formik.values.slotDuration}
              onChange={formik.handleChange}
              error={formik.touched.slotDuration && Boolean(formik.errors.slotDuration)}
              helperText={formik.touched.slotDuration && formik.errors.slotDuration}
              required
              inputProps={{ 
                min: 5, 
                max: 240
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Defina o tamanho de cada intervalo de agendamento (ex: 30 min, 60 min)" arrow>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
            <FormHelperText>
              Defina o tamanho de cada intervalo de agendamento
            </FormHelperText>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.active}
                  onChange={(e) => formik.setFieldValue('active', e.target.checked)}
                  color="primary"
                />
              }
              label="Disponibilidade ativa"
            />
            <FormHelperText>
              Desative temporariamente sem excluir esta disponibilidade
            </FormHelperText>
          </Grid>
        </Grid>
      </animated.div>
    </BaseModal>
  );
};

DisponibilidadeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  availability: PropTypes.shape({
    id: PropTypes.number,
    weekday: PropTypes.number,
    weekdayLabel: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    startLunchTime: PropTypes.string,
    endLunchTime: PropTypes.string,
    slotDuration: PropTypes.number,
    active: PropTypes.bool
  }),
  professionalId: PropTypes.number.isRequired
};

DisponibilidadeModal.defaultProps = {
  availability: null
};

export default DisponibilidadeModal;