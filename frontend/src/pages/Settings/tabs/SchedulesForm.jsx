import React, { useContext, useState, useMemo, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  IconButton, 
  Collapse, 
  useMediaQuery,
  Divider,
  TextField, 
  InputAdornment, 
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material";
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp, 
  AccessTime, 
  Restaurant, 
  Work,
  AccessTimeRounded, 
  RestaurantRounded,
  PlayArrowRounded,
  StopRounded,
  Business,
  Queue,
  Info
} from "@mui/icons-material";
import { Formik, Form, Field } from "formik";
import * as Yup from 'yup';
import { i18n } from "../../../translate/i18n";
import ButtonWithSpinner from "../../../components/ButtonWithSpinner";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import api from "../../../services/api";

// ===== CONSTANTES =====

/**
 * Dias da semana com tradução e identificadores
 */
const defaultWeekdays = [
  { weekday: i18n.t("serviceHours.daysweek.day1"), weekdayEn: "monday" },
  { weekday: i18n.t("serviceHours.daysweek.day2"), weekdayEn: "tuesday" },
  { weekday: i18n.t("serviceHours.daysweek.day3"), weekdayEn: "wednesday" },
  { weekday: i18n.t("serviceHours.daysweek.day4"), weekdayEn: "thursday" },
  { weekday: i18n.t("serviceHours.daysweek.day5"), weekdayEn: "friday" },
  { weekday: i18n.t("serviceHours.daysweek.day6"), weekdayEn: "saturday" },
  { weekday: i18n.t("serviceHours.daysweek.day7"), weekdayEn: "sunday" },
];

/**
 * Valores padrão para horários não preenchidos
 */
const DEFAULT_VALUES = {
  START_TIME: "00:00",
  END_TIME: "23:59",
  LUNCH_START: null,
  LUNCH_END: null
};

/**
 * Definições de tempos mínimos para interações touch em mobile
 */
const TOUCH_TIMINGS = {
  PRESS_DELAY: 200,
  LONG_PRESS: 500,
  DOUBLE_TAP_DELAY: 300
};

/**
 * Breakpoints específicos para componentes de horário
 */
const TIME_BREAKPOINTS = {
  HIDE_LABELS: "sm",
  STACK_FIELDS: "xs",
  FULL_FEATURES: "md"
};

/**
 * Mensagens de error padrão para validação
 */
const ERROR_MESSAGES = {
  REQUIRED: i18n.t("serviceHours.validation.required"),
  INVALID_TIME: i18n.t("serviceHours.validation.invalidTime"),
  END_BEFORE_START: i18n.t("serviceHours.validation.endBeforeStart"),
  LUNCH_OUTSIDE_WORK: i18n.t("serviceHours.validation.lunchOutsideWork"),
  LUNCH_END_BEFORE_START: i18n.t("serviceHours.validation.lunchEndBeforeStart")
};

/**
 * Tipos de animação para diferentes estados
 */
const ANIMATION_TYPES = {
  ENTER: "enter",
  EXIT: "exit",
  ERROR: "error",
  SUCCESS: "success"
};

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Formata os horários para o formato aceito pela API
 * @param {Array} schedules - Array de horários dos dias da semana
 * @returns {Array} Array de horários formatados
 */
const formatScheduleForSubmission = (schedules) => {
  return schedules.map(schedule => ({
    ...schedule,
    startTime: schedule.startTime || DEFAULT_VALUES.START_TIME,
    endTime: schedule.endTime || DEFAULT_VALUES.END_TIME,
    startLunchTime: schedule.startLunchTime || DEFAULT_VALUES.LUNCH_START,
    endLunchTime: schedule.endLunchTime || DEFAULT_VALUES.LUNCH_END
  }));
};

/**
 * Converte um horário no formato "HH:MM" para minutos
 * @param {string} time - Horário no formato "HH:MM"
 * @returns {number} Total de minutos
 */
const convertTimeToMinutes = (time) => {
  if (!time) return 0;
  
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
};

/**
 * Verifica se um horário está dentro do intervalo de trabalho
 * @param {string} time - Horário a ser verificado
 * @param {string} startTime - Horário de início
 * @param {string} endTime - Horário de fim
 * @returns {boolean} Se o horário está dentro do intervalo
 */
const isTimeWithinWorkHours = (time, startTime, endTime) => {
  if (!time || !startTime || !endTime) return true;
  
  if (startTime === "00:00" && endTime === "23:59") return true;
  
  const timeMinutes = convertTimeToMinutes(time);
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * Calcula se há conflito entre horário de almoço e horário de trabalho
 * @param {Object} schedule - Objeto com os horários do dia
 * @returns {boolean} Se há conflito
 */
const hasLunchTimeConflict = (schedule) => {
  const { startTime, endTime, startLunchTime, endLunchTime } = schedule;
  
  if (!startLunchTime || !endLunchTime) return false;
  
  return !isTimeWithinWorkHours(startLunchTime, startTime, endTime) || 
         !isTimeWithinWorkHours(endLunchTime, startTime, endTime);
};

/**
 * Verifica se o horário de fim é anterior ao horário de início
 * @param {string} startTime - Horário de início
 * @param {string} endTime - Horário de fim
 * @returns {boolean} Se o horário de fim é anterior ao horário de início
 */
const isEndTimeBeforeStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  
  return endMinutes < startMinutes;
};

/**
 * Verifica se o horário de fim do almoço é anterior ao horário de início do almoço
 * @param {string} startLunchTime - Horário de início do almoço
 * @param {string} endLunchTime - Horário de fim do almoço
 * @returns {boolean} Se o horário de fim do almoço é anterior ao horário de início do almoço
 */
const isLunchEndBeforeLunchStart = (startLunchTime, endLunchTime) => {
  if (!startLunchTime || !endLunchTime) return false;
  
  const startMinutes = convertTimeToMinutes(startLunchTime);
  const endMinutes = convertTimeToMinutes(endLunchTime);
  
  return endMinutes < startMinutes;
};

/**
 * Verifica a necessidade de completar ambos os campos de horário de almoço
 * @param {string} startLunchTime - Horário de início do almoço
 * @param {string} endLunchTime - Horário de fim do almoço
 * @returns {boolean} Se é necessário completar o outro campo de horário de almoço
 */
const needsCompleteLunchTime = (startLunchTime, endLunchTime) => {
  return (startLunchTime && !endLunchTime) || (!startLunchTime && endLunchTime);
};

/**
 * Formata um horário para exibição
 * @param {string} time - Horário no formato "HH:MM"
 * @returns {string} Horário formatado para exibição
 */
const formatTimeForDisplay = (time) => {
  if (!time) return '-';
  
  const [hours, minutes] = time.split(':');
  return `${hours}h${minutes}min`;
};

// ===== SCHEMAS DE VALIDAÇÃO =====

/**
 * Validação customizada para o formato de tempo (HH:MM)
 */
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validação para um único horário
 */
const timeSchema = Yup.string()
  .nullable()
  .matches(timeRegex, ERROR_MESSAGES.INVALID_TIME);

/**
 * Esquema de validação para um dia de horário
 */
const dayScheduleSchema = Yup.object().shape({
  weekday: Yup.string().required(ERROR_MESSAGES.REQUIRED),
  weekdayEn: Yup.string().required(ERROR_MESSAGES.REQUIRED),
  startTime: timeSchema.test(
    'start-time-format',
    ERROR_MESSAGES.INVALID_TIME,
    function(value) {
      if (!value) return true;
      return timeRegex.test(value);
    }
  ),
  endTime: timeSchema.test(
    'end-time-format',
    ERROR_MESSAGES.INVALID_TIME,
    function(value) {
      if (!value) return true;
      return timeRegex.test(value);
    }
  ),
  startLunchTime: timeSchema,
  endLunchTime: timeSchema,
}).test(
  'end-time-after-start-time',
  ERROR_MESSAGES.END_BEFORE_START,
  function(schedule) {
    const { startTime, endTime } = schedule;
    return !isEndTimeBeforeStartTime(startTime, endTime);
  }
).test(
  'lunch-end-after-lunch-start',
  ERROR_MESSAGES.LUNCH_END_BEFORE_START,
  function(schedule) {
    const { startLunchTime, endLunchTime } = schedule;
    return !isLunchEndBeforeLunchStart(startLunchTime, endLunchTime);
  }
).test(
  'lunch-time-within-work-hours',
  ERROR_MESSAGES.LUNCH_OUTSIDE_WORK,
  function(schedule) {
    const { startTime, endTime, startLunchTime, endLunchTime } = schedule;
    
    if (startLunchTime && endLunchTime) {
      return (
        isTimeWithinWorkHours(startLunchTime, startTime, endTime) &&
        isTimeWithinWorkHours(endLunchTime, startTime, endTime)
      );
    }
    return true;
  }
).test(
  'complete-lunch-time',
  i18n.t('validation.completeLunchTime'),
  function(schedule) {
    const { startLunchTime, endLunchTime } = schedule;
    return !needsCompleteLunchTime(startLunchTime, endLunchTime);
  }
);

/**
 * Esquema de validação completo para o formulário
 */
const validationSchema = Yup.object().shape({
  schedules: Yup.array().of(dayScheduleSchema),
  type: Yup.string().oneOf(['company', 'queue']).required('Tipo é obrigatório'),
  queueId: Yup.number().when('type', {
    is: 'queue',
    then: Yup.number().required('Fila é obrigatória quando tipo for "Fila"'),
    otherwise: Yup.number().nullable()
  })
});

// ===== COMPONENTE TYPESELECTOR =====

/**
 * Seletor de tipo de configuração (Empresa ou Fila)
 * 
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.field - Propriedades do campo do Formik
 * @param {Object} props.meta - Metadados do campo do Formik
 * @param {Function} props.onChange - Função de callback para mudança de valor
 * @returns {React.Component} Seletor de tipo
 */
const TypeSelector = ({ field, meta, onChange }) => {
  const theme = useTheme();
  
  const handleChange = (event) => {
    const value = event.target.value;
    field.onChange(event);
    onChange && onChange(value);
  };

  return (
    <FormControl 
      fullWidth 
      error={meta.touched && Boolean(meta.error)}
      sx={{ mb: 2 }}
    >
      <InputLabel id="type-selector-label">Configurar horários para</InputLabel>
      <Select
        {...field}
        labelId="type-selector-label"
        label="Configurar horários para"
        onChange={handleChange}
        startAdornment={
          <InputAdornment position="start">
            {field.value === 'company' ? <Business /> : <Queue />}
          </InputAdornment>
        }
      >
        <MenuItem value="company">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Business sx={{ mr: 1 }} />
            Empresa
          </Box>
        </MenuItem>
        <MenuItem value="queue">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Queue sx={{ mr: 1 }} />
            Fila de Atendimento
          </Box>
        </MenuItem>
      </Select>
      {meta.touched && meta.error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {meta.error}
        </Typography>
      )}
    </FormControl>
  );
};

TypeSelector.propTypes = {
  field: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  onChange: PropTypes.func
};

// ===== COMPONENTE QUEUESELECTOR =====

/**
 * Seletor de fila quando o tipo for "queue"
 * 
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.field - Propriedades do campo do Formik
 * @param {Object} props.meta - Metadados do campo do Formik
 * @param {Array} props.queues - Lista de filas disponíveis
 * @param {boolean} props.loading - Se está carregando as filas
 * @param {Function} props.onChange - Função de callback para mudança de valor
 * @returns {React.Component} Seletor de fila
 */
const QueueSelector = ({ field, meta, queues, loading, onChange }) => {
  const theme = useTheme();
  
  const handleChange = (event) => {
    const value = event.target.value;
    field.onChange(event);
    onChange && onChange(value);
  };

  return (
    <FormControl 
      fullWidth 
      error={meta.touched && Boolean(meta.error)}
      sx={{ mb: 2 }}
    >
      <InputLabel id="queue-selector-label">Selecione a Fila</InputLabel>
      <Select
        {...field}
        labelId="queue-selector-label"
        label="Selecione a Fila"
        onChange={handleChange}
        disabled={loading}
        startAdornment={
          loading ? (
            <InputAdornment position="start">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : (
            <InputAdornment position="start">
              <Queue />
            </InputAdornment>
          )
        }
      >
        {queues.map((queue) => (
          <MenuItem key={queue.id} value={queue.id}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: queue.color,
                  mr: 1
                }}
              />
              {queue.name}
            </Box>
          </MenuItem>
        ))}
      </Select>
      {meta.touched && meta.error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {meta.error}
        </Typography>
      )}
    </FormControl>
  );
};

QueueSelector.propTypes = {
  field: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  queues: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onChange: PropTypes.func
};

// ===== COMPONENTE TIMEFIELD =====

/**
 * Campo de input para seleção de horário com design otimizado para mobile
 *
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.field - Propriedades do campo do Formik
 * @param {Object} props.meta - Metadados do campo do Formik
 * @param {string} props.label - Texto do label
 * @param {string} props.icon - Tipo de ícone (start|end|lunch)
 * @param {boolean} [props.optional=false] - Se o campo é opcional
 * @returns {React.Component} Campo de tempo formatado
 */
const TimeField = ({ field, meta, label, icon, optional = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [focused, setFocused] = useState(false);

  // Determina o ícone baseado na propriedade icon
  const fieldIcon = useMemo(() => {
    switch(icon) {
      case 'start':
        return <PlayArrowRounded color="primary" />;
      case 'end':
        return <StopRounded color="error" />;
      case 'lunch':
        return <RestaurantRounded color="warning" />;
      default:
        return <AccessTimeRounded color="action" />;
    }
  }, [icon]);

  // Determina a cor do campo baseado no estado
  const getBorderColor = useCallback(() => {
    const hasSubmitCount = meta?.form?.submitCount !== undefined;
    const submitAttempted = hasSubmitCount ? meta.form.submitCount > 0 : false;
    
    if ((meta.touched || submitAttempted) && meta.error) {
      return theme.palette.error.main;
    }
    if (focused) return theme.palette.primary.main;
    return theme.palette.divider;
  }, [focused, meta, theme]);

  // Texto de ajuda para o campo
  const getHelperText = useCallback(() => {
    const hasSubmitCount = meta?.form?.submitCount !== undefined;
    const submitAttempted = hasSubmitCount ? meta.form.submitCount > 0 : false;
    
    if ((meta.touched || submitAttempted) && meta.error) {
      return meta.error;
    }
    if (isMobile && optional) {
      return i18n.t("serviceHours.optionalField");
    }
    return " ";
  }, [meta, isMobile, optional]);

  // Handlers para foco e perda de foco
  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback((e) => {
    setFocused(false);
    field.onBlur(e);
  }, [field]);

  // Label responsivo para mobile
  const responsiveLabel = useMemo(() => {
    if (isMobile) {
      return (
        <Tooltip title={label} arrow placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {fieldIcon}
            {optional && <Box component="span" sx={{ ml: 0.5, fontSize: '0.7rem' }}>(Opc)</Box>}
          </Box>
        </Tooltip>
      );
    }
    
    return label + (optional ? ` (${i18n.t("serviceHours.optional")})` : "");
  }, [label, optional, isMobile, fieldIcon]);

  return (
    <TextField
      {...field}
      label={responsiveLabel}
      variant="outlined"
      type="time"
      error={(meta.touched || meta?.form?.submitCount > 0) && Boolean(meta.error)}
      helperText={getHelperText()}
      InputLabelProps={{ 
        shrink: true,
        sx: {
          fontSize: { xs: '0.8rem', md: '0.875rem' }
        }
      }}
      inputProps={{ 
        step: 300,
        'aria-label': label,
        sx: {
          px: { xs: 1, md: 2 },
          py: { xs: 1.5, md: 1.75 },
          fontSize: { xs: '0.9rem', md: '1rem' }
        }
      }}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: getBorderColor(),
            transition: 'border-color 0.2s ease-in-out'
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.light
          }
        },
        '& .MuiFormHelperText-root': {
          margin: 0,
          marginTop: 0.5,
          fontSize: '0.7rem',
          minHeight: '1rem',
          lineHeight: 1.2
        }
      }}
      InputProps={{
        startAdornment: isMobile ? null : (
          <InputAdornment position="start">
            {fieldIcon}
          </InputAdornment>
        ),
        sx: {
          borderRadius: 1.5,
          backgroundColor: theme.palette.background.paper
        }
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

TimeField.propTypes = {
  field: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.oneOf(['start', 'end', 'lunch', 'default']).isRequired,
  optional: PropTypes.bool
};

// ===== COMPONENTE DAYSCHEDULECARD =====

/**
 * Card de agenda para um dia da semana com design responsivo
 *
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.schedule - Dados do horário para o dia específico
 * @param {number} props.index - Índice do dia no array de dias da semana
 * @param {Object} [props.errors] - Erros de validação para este dia
 * @param {Object} [props.touched] - Estado de touch para os campos deste dia
 * @returns {React.Component} Card de horário do dia
 */
const DayScheduleCard = ({ schedule, index, errors, touched }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  // Verifica se há erros para dar destaque visual
  const hasErrors = errors && Object.keys(errors).length > 0;

  return (
    <Paper
      elevation={hasErrors ? 3 : 1}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        border: hasErrors ? `1px solid ${theme.palette.error.main}` : "none",
      }}
    >
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        mb: 2
      }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccessTime 
            sx={{ 
              mr: 1, 
              color: theme.palette.primary.main,
              fontSize: { xs: '1.5rem', md: '1.75rem' }
            }} 
          />
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.1rem', md: '1.3rem' }
            }}
          >
            {schedule.weekday}
          </Typography>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={toggleExpanded} 
            size="medium"
            aria-expanded={expanded}
            aria-label={expanded ? i18n.t("serviceHours.collapse") : i18n.t("serviceHours.expand")}
          >
            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        )}
      </Box>
      
      {(expanded || !isMobile) && (
        <Collapse in={expanded} timeout={300}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              {i18n.t("serviceHours.workingHours")}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Work fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
                  <Typography variant="body2">
                    {i18n.t("serviceHours.workTime")}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.startTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.startTime")}
                          icon="start"
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.endTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.endTime")}
                          icon="end"
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Restaurant fontSize="small" sx={{ mr: 1, color: theme.palette.warning.main }} />
                  <Typography variant="body2">
                    {i18n.t("serviceHours.lunchTime")}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.startLunchTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.startLunchTime")}
                          icon="lunch"
                          optional
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.endLunchTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.endLunchTime")}
                          icon="lunch"
                          optional
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            {hasErrors && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  bgcolor: 'error.light', 
                  borderRadius: 1,
                  color: 'error.contrastText'
                }}
              >
                <Typography variant="caption" component="div">
                  {Object.values(errors).map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

DayScheduleCard.propTypes = {
  schedule: PropTypes.shape({
    weekday: PropTypes.string.isRequired,
    weekdayEn: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    startLunchTime: PropTypes.string,
    endLunchTime: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object
};

// ===== COMPONENTE PRINCIPAL SCHEDULESFORM =====

/**
 * Componente de formulário de horários de atendimento com abordagem mobile-first
 *
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Array} [props.initialValues] - Valores iniciais dos horários
 * @param {Function} [props.onSubmit] - Função a ser executada após submissão bem-sucedida
 * @param {boolean} [props.loading] - Estado de carregamento externo
 * @param {number} [props.companyId] - ID da empresa (opcional, usa o contexto se não fornecido)
 * @param {string} [props.labelSaveButton="Salvar"] - Texto do botão de salvar
 * @returns {React.Component} Componente de formulário de horários
 */
const SchedulesForm = ({
  initialValues,
  onSubmit: externalOnSubmit,
  loading: externalLoading,
  companyId,
  labelSaveButton = "Salvar"
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [queues, setQueues] = useState([]);
  const [scheduleType, setScheduleType] = useState('company');
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [currentSchedules, setCurrentSchedules] = useState([]);
  const { user } = useContext(AuthContext);

  // Prepara os valores iniciais dos horários
  const schedules = useMemo(() => {
    return currentSchedules?.length > 0 
      ? currentSchedules 
      : defaultWeekdays.map(day => ({
          ...day,
          startTime: "",
          endTime: "",
          startLunchTime: "",
          endLunchTime: "",
        }));
  }, [currentSchedules]);

  // Carrega as filas da empresa quando necessário
  const loadQueues = useCallback(async () => {
    if (!companyId && !user?.companyId) return;
    
    setLoadingQueues(true);
    try {
      const targetCompanyId = companyId || user.companyId;
      const response = await api.get(`/companies/${targetCompanyId}/queues`);
      setQueues(response.data.queues || []);
    } catch (error) {
      console.error('Erro ao carregar filas:', error);
      toast.error('Erro ao carregar filas da empresa');
      setQueues([]);
    } finally {
      setLoadingQueues(false);
    }
  }, [companyId, user?.companyId]);

  // Carrega os horários atuais baseado no tipo e queue selecionada
  const loadCurrentSchedules = useCallback(async (type = 'company', queueId = null) => {
    if (!companyId && !user?.companyId) return;
    
    try {
      const targetCompanyId = companyId || user.companyId;
      const params = new URLSearchParams({ type });
      
      if (type === 'queue' && queueId) {
        params.append('queueId', queueId.toString());
      }
      
      const response = await api.get(`/companies/${targetCompanyId}/schedules?${params}`);
      setCurrentSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setCurrentSchedules([]);
    }
  }, [companyId, user?.companyId]);

  // Efeito para carregar filas na inicialização
  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

  // Efeito para carregar horários iniciais
  useEffect(() => {
    if (initialValues?.length > 0) {
      setCurrentSchedules(initialValues);
    } else {
      loadCurrentSchedules(scheduleType, selectedQueueId);
    }
  }, [initialValues, scheduleType, selectedQueueId, loadCurrentSchedules]);

  // Handler para mudança de tipo de configuração
  const handleTypeChange = useCallback((newType) => {
    setScheduleType(newType);
    setSelectedQueueId(null);
    
    if (newType === 'company') {
      loadCurrentSchedules('company');
    } else {
      setCurrentSchedules([]);
    }
  }, [loadCurrentSchedules]);

  // Handler para mudança de queue selecionada
  const handleQueueChange = useCallback((queueId) => {
    setSelectedQueueId(queueId);
    if (queueId) {
      loadCurrentSchedules('queue', queueId);
    } else {
      setCurrentSchedules([]);
    }
  }, [loadCurrentSchedules]);

  /**
   * Processa o envio do formulário
   * @param {Object} values - Valores do formulário
   * @param {Object} formikHelpers - Objeto com funções auxiliares do Formik
   * @returns {Promise<boolean>} - Resultado do processamento
   */
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    
    try {
      // Verifica se pelo menos um horário foi preenchido
      const hasAtLeastOneSchedule = values.schedules.some(
        schedule => schedule.startTime || schedule.endTime
      );
      
      if (!hasAtLeastOneSchedule) {
        toast.error("É necessário definir pelo menos um horário de funcionamento");
        return false;
      }

      // Validações específicas por tipo
      if (values.type === 'queue' && !values.queueId) {
        toast.error("Selecione uma fila para configurar os horários");
        return false;
      }
      
      const formattedSchedules = formatScheduleForSubmission(values.schedules);
      const targetCompanyId = companyId || user.companyId;
      
      const requestData = {
        schedules: formattedSchedules,
        type: values.type,
        ...(values.type === 'queue' ? { queueId: values.queueId } : {})
      };

      console.log('Enviando dados para API:', requestData);
      
      const response = await api.put(`/companies/${targetCompanyId}/schedules`, requestData);
  
      if (response.data && externalOnSubmit) {
        externalOnSubmit(response.data);
      }

      const entityName = values.type === 'company' ? 'empresa' : 'fila';
      toast.success(`Horários da ${entityName} atualizados com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar horários:', error);
      const errorMessage = error?.response?.data?.error || "Erro ao atualizar horários";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Info sx={{ mr: 1 }} />
            <Typography variant="body2">
              Configure os horários de atendimento para a empresa ou para filas específicas. 
              Os horários das filas têm prioridade sobre os horários da empresa.
            </Typography>
          </Box>
        </Alert>
      </Box>

      <Formik
        initialValues={{ 
          schedules,
          type: scheduleType,
          queueId: selectedQueueId
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form aria-label={i18n.t("serviceHours.formAriaLabel")}>
            <Box sx={{ mb: 4 }}>
              <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1 }} />
                  Configuração de Horários
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Field name="type">
                      {({ field, meta }) => (
                        <TypeSelector
                          field={field}
                          meta={meta}
                          onChange={(newType) => {
                            setFieldValue('type', newType);
                            setFieldValue('queueId', null);
                            handleTypeChange(newType);
                          }}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  {values.type === 'queue' && (
                    <Grid item xs={12} md={6}>
                      <Field name="queueId">
                        {({ field, meta }) => (
                          <QueueSelector
                            field={field}
                            meta={meta}
                            queues={queues}
                            loading={loadingQueues}
                            onChange={(queueId) => {
                              setFieldValue('queueId', queueId);
                              handleQueueChange(queueId);
                            }}
                          />
                        )}
                      </Field>
                    </Grid>
                  )}
                </Grid>

                {values.type === 'queue' && values.queueId && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Configurando horários para a fila: <strong>
                        {queues.find(q => q.id === values.queueId)?.name}
                      </strong>
                    </Typography>
                  </Alert>
                )}
              </Paper>
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: { xs: 2, sm: 3, md: 4 },
                mb: 4
              }}
            >
              {values.schedules.map((schedule, index) => (
                <DayScheduleCard 
                  key={schedule.weekdayEn}
                  schedule={schedule}
                  index={index}
                  errors={errors?.schedules?.[index]}
                  touched={touched?.schedules?.[index]}
                />
              ))}
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: { xs: 4, md: 6 } 
              }}
            >
              <ButtonWithSpinner
                loading={loading || externalLoading}
                type="submit"
                color="primary"
                variant="contained"
                sx={{
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  minWidth: { xs: '60%', sm: '40%', md: '30%' },
                  borderRadius: 2,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 5,
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  }
                }}
                aria-label={labelSaveButton}
              >
                {labelSaveButton}
              </ButtonWithSpinner>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  );
};

SchedulesForm.propTypes = {
  initialValues: PropTypes.arrayOf(
    PropTypes.shape({
      weekday: PropTypes.string.isRequired,
      weekdayEn: PropTypes.string.isRequired,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      startLunchTime: PropTypes.string,
      endLunchTime: PropTypes.string
    })
  ),
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
  companyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  labelSaveButton: PropTypes.string
};

export default React.memo(SchedulesForm);