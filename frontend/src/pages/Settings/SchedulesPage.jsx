import React, { useState, useEffect, useCallback } from "react";
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
  TextField,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Button,
  Stack,
  Divider,
  Chip
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  AccessTime,
  Restaurant,
  Work,
  Business,
  Queue,
  Info,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Block as DisabledIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import StandardEmptyState from "../../components/shared/StandardEmptyState";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

// Styled Components
const DayCard = styled(Paper)(({ theme, hasErrors }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  position: "relative",
  overflow: "hidden",
  border: hasErrors ? `2px solid ${theme.palette.error.main}` : "none",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4]
  }
}));

const TimeField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    "&:hover fieldset": {
      borderColor: theme.palette.primary.light
    }
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2)
}));

const CopyButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  padding: theme.spacing(1),
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark
  }
}));

// Constantes
const weekdays = [
  { weekday: i18n.t("serviceHours.daysweek.day1"), weekdayEn: "monday" },
  { weekday: i18n.t("serviceHours.daysweek.day2"), weekdayEn: "tuesday" },
  { weekday: i18n.t("serviceHours.daysweek.day3"), weekdayEn: "wednesday" },
  { weekday: i18n.t("serviceHours.daysweek.day4"), weekdayEn: "thursday" },
  { weekday: i18n.t("serviceHours.daysweek.day5"), weekdayEn: "friday" },
  { weekday: i18n.t("serviceHours.daysweek.day6"), weekdayEn: "saturday" },
  { weekday: i18n.t("serviceHours.daysweek.day7"), weekdayEn: "sunday" }
];

// Schema de validação
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const dayScheduleSchema = Yup.object().shape({
  startTime: Yup.string()
    .matches(timeRegex, "Formato inválido (HH:MM)")
    .nullable(),
  endTime: Yup.string()
    .matches(timeRegex, "Formato inválido (HH:MM)")
    .nullable()
    .test("end-after-start", "Horário final deve ser após o inicial", function(endTime) {
      const { startTime } = this.parent;
      if (!startTime || !endTime) return true;
      return endTime > startTime;
    }),
  startLunchTime: Yup.string()
    .matches(timeRegex, "Formato inválido (HH:MM)")
    .nullable(),
  endLunchTime: Yup.string()
    .matches(timeRegex, "Formato inválido (HH:MM)")
    .nullable()
    .test("lunch-end-after-start", "Fim do almoço deve ser após o início", function(endLunchTime) {
      const { startLunchTime } = this.parent;
      if (!startLunchTime || !endLunchTime) return true;
      return endLunchTime > startLunchTime;
    })
});

const schedulesSchema = Yup.object().shape({
  type: Yup.string().oneOf(["company", "queue", "disabled"]).required("Tipo é obrigatório"),
  queueId: Yup.number().when("type", {
    is: "queue",
    then: Yup.number().required("Fila é obrigatória"),
    otherwise: Yup.number().nullable()
  }),
  schedules: Yup.array().of(dayScheduleSchema)
});

// Componente de Dia da Semana
const DayScheduleCard = ({ 
  schedule, 
  index, 
  errors, 
  touched, 
  expanded, 
  onToggle, 
  showCopyButton, 
  onCopyFromFirst,
  setFieldValue 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const hasErrors = errors && Object.keys(errors).length > 0;

  const handleCopyFromFirst = () => {
    onCopyFromFirst(index);
    toast.success(`Horários copiados para ${schedule.weekday}`);
  };

  return (
    <DayCard hasErrors={hasErrors}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTime sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={600}>
            {schedule.weekday}
          </Typography>
          {index === 0 && (
            <Chip 
              label="Primeiro dia" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {showCopyButton && index > 0 && (
            <Tooltip title={`Copiar horários de ${weekdays[0].weekday}`}>
              <IconButton
                onClick={handleCopyFromFirst}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark
                  }
                }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isMobile && (
            <IconButton onClick={onToggle} size="small">
              {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded || !isMobile} timeout={300}>
        <Grid container spacing={3}>
          {/* Horário de Trabalho */}
          <Grid item xs={12} md={6}>
            <SectionHeader>
              <Work fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>
                {i18n.t("serviceHours.workTime")}
              </Typography>
            </SectionHeader>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Field name={`schedules.${index}.startTime`}>
                  {({ field, meta }) => (
                    <TimeField
                      {...field}
                      type="time"
                      label={i18n.t("serviceHours.startTime")}
                      variant="outlined"
                      fullWidth
                      size="small"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={6}>
                <Field name={`schedules.${index}.endTime`}>
                  {({ field, meta }) => (
                    <TimeField
                      {...field}
                      type="time"
                      label={i18n.t("serviceHours.endTime")}
                      variant="outlined"
                      fullWidth
                      size="small"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Field>
              </Grid>
            </Grid>
          </Grid>

          {/* Horário de Almoço */}
          <Grid item xs={12} md={6}>
            <SectionHeader>
              <Restaurant fontSize="small" color="warning" />
              <Typography variant="subtitle2" fontWeight={600}>
                {i18n.t("serviceHours.lunchTime")} (Opcional)
              </Typography>
            </SectionHeader>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Field name={`schedules.${index}.startLunchTime`}>
                  {({ field, meta }) => (
                    <TimeField
                      {...field}
                      type="time"
                      label={i18n.t("serviceHours.startLunchTime")}
                      variant="outlined"
                      fullWidth
                      size="small"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={6}>
                <Field name={`schedules.${index}.endLunchTime`}>
                  {({ field, meta }) => (
                    <TimeField
                      {...field}
                      type="time"
                      label={i18n.t("serviceHours.endLunchTime")}
                      variant="outlined"
                      fullWidth
                      size="small"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Field>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {hasErrors && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {Object.values(errors).map((error, i) => (
              <div key={i}>{error}</div>
            ))}
          </Alert>
        )}
      </Collapse>
    </DayCard>
  );
};

DayScheduleCard.propTypes = {
  schedule: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  showCopyButton: PropTypes.bool,
  onCopyFromFirst: PropTypes.func,
  setFieldValue: PropTypes.func.isRequired
};

// Componente Principal
const SchedulesPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(false);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [queues, setQueues] = useState([]);
  const [scheduleType, setScheduleType] = useState("company");
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [currentSchedules, setCurrentSchedules] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});

  // Valores iniciais
  const initialSchedules = weekdays.map(day => ({
    ...day,
    startTime: "",
    endTime: "",
    startLunchTime: "",
    endLunchTime: ""
  }));

  // Carregar filas
  const loadQueues = useCallback(async () => {
    const companyId = user?.companyId || localStorage.getItem("companyId");
    if (!companyId) return;

    setLoadingQueues(true);
    try {
      const response = await api.get(`/companies/${companyId}/queues`);
      setQueues(response.data.queues || []);
    } catch (error) {
      console.error("Erro ao carregar filas:", error);
      toast.error("Erro ao carregar filas");
      setQueues([]);
    } finally {
      setLoadingQueues(false);
    }
  }, [user?.companyId]);

  // Carregar horários
  const loadSchedules = useCallback(async (type = "company", queueId = null) => {
    const companyId = user?.companyId || localStorage.getItem("companyId");
    if (!companyId) return;

    if (type === "disabled") {
      const defaultSchedules = weekdays.map(day => ({
        ...day,
        startTime: "",
        endTime: "",
        startLunchTime: "",
        endLunchTime: ""
      }));
      setCurrentSchedules(defaultSchedules);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (type === "queue" && queueId) {
        params.append("queueId", queueId.toString());
      }

      const response = await api.get(`/companies/${companyId}/schedules?${params}`);
      const schedules = response.data.schedules || [];
      
      // Mesclar com dias da semana para garantir todos os dias
      const mergedSchedules = weekdays.map(day => {
        const existing = schedules.find(s => s.weekdayEn === day.weekdayEn);
        return existing || { ...day, startTime: "", endTime: "", startLunchTime: "", endLunchTime: "" };
      });
      
      setCurrentSchedules(mergedSchedules);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      const errorSchedules = weekdays.map(day => ({
        ...day,
        startTime: "",
        endTime: "",
        startLunchTime: "",
        endLunchTime: ""
      }));
      setCurrentSchedules(errorSchedules);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadQueues();
    loadSchedules();
  }, [loadQueues, loadSchedules]);

  // Função para copiar horários do primeiro dia
  const copyFromFirstDay = useCallback((targetIndex, setFieldValue, values) => {
    const firstDaySchedule = values.schedules[0];
    
    setFieldValue(`schedules.${targetIndex}.startTime`, firstDaySchedule.startTime || "");
    setFieldValue(`schedules.${targetIndex}.endTime`, firstDaySchedule.endTime || "");
    setFieldValue(`schedules.${targetIndex}.startLunchTime`, firstDaySchedule.startLunchTime || "");
    setFieldValue(`schedules.${targetIndex}.endLunchTime`, firstDaySchedule.endLunchTime || "");
  }, []);

  // Função para copiar para todos os dias
  const copyToAllDays = useCallback((setFieldValue, values) => {
    const firstDaySchedule = values.schedules[0];
    
    for (let i = 1; i < values.schedules.length; i++) {
      setFieldValue(`schedules.${i}.startTime`, firstDaySchedule.startTime || "");
      setFieldValue(`schedules.${i}.endTime`, firstDaySchedule.endTime || "");
      setFieldValue(`schedules.${i}.startLunchTime`, firstDaySchedule.startLunchTime || "");
      setFieldValue(`schedules.${i}.endLunchTime`, firstDaySchedule.endLunchTime || "");
    }
    
    toast.success("Horários copiados para todos os dias!");
  }, []);

  // Handlers
  const handleSubmit = async (values, { setSubmitting }) => {
    const companyId = user?.companyId || localStorage.getItem("companyId");
    if (!companyId) {
      toast.error("ID da empresa não encontrado");
      setSubmitting(false);
      return;
    }

    if (values.type === "disabled") {
      toast.info("Horários desativados - nenhuma alteração salva");
      setSubmitting(false);
      return;
    }

    setLoading(true);
    try {
      // Formatar horários
      const formattedSchedules = values.schedules.map(schedule => ({
        ...schedule,
        startTime: schedule.startTime || null,
        endTime: schedule.endTime || null,
        startLunchTime: schedule.startLunchTime || null,
        endLunchTime: schedule.endLunchTime || null
      }));

      const requestData = {
        schedules: formattedSchedules,
        type: values.type,
        ...(values.type === "queue" ? { queueId: values.queueId } : {})
      };

      await api.put(`/companies/${companyId}/schedules`, requestData);

      const entityName = values.type === "company" ? "empresa" : "fila";
      toast.success(`Horários da ${entityName} atualizados com sucesso!`);
      
      // Recarregar horários
      await loadSchedules(values.type, values.queueId);
    } catch (error) {
      console.error("Erro ao atualizar horários:", error);
      const errorMsg = error?.response?.data?.error || "Erro ao atualizar horários";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleTypeChange = (newType, setFieldValue) => {
    setScheduleType(newType);
    setSelectedQueueId(null);
    setFieldValue("type", newType);
    setFieldValue("queueId", null);
    
    if (newType === "company") {
      loadSchedules("company");
    } else if (newType === "disabled") {
      const defaultSchedules = weekdays.map(day => ({
        ...day,
        startTime: "",
        endTime: "",
        startLunchTime: "",
        endLunchTime: ""
      }));
      setCurrentSchedules(defaultSchedules);
    } else {
      const defaultSchedules = weekdays.map(day => ({
        ...day,
        startTime: "",
        endTime: "",
        startLunchTime: "",
        endLunchTime: ""
      }));
      setCurrentSchedules(defaultSchedules);
    }
  };

  const handleQueueChange = (queueId, setFieldValue) => {
    setSelectedQueueId(queueId);
    setFieldValue("queueId", queueId);
    if (queueId) {
      loadSchedules("queue", queueId);
    } else {
      setCurrentSchedules(initialSchedules);
    }
  };

  const toggleDayExpansion = (index) => {
    setExpandedDays(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleReset = useCallback(() => {
    loadSchedules(scheduleType, selectedQueueId);
    toast.info("Horários restaurados");
  }, [scheduleType, selectedQueueId, loadSchedules]);

  // Estatísticas
  const getStatsLabel = () => {
    switch (scheduleType) {
      case "company": return "Horários da Empresa";
      case "queue": return "Horários por Fila";
      case "disabled": return "Horários Desativados";
      default: return "Horários";
    }
  };

  const stats = [
    {
      label: getStatsLabel(),
      icon: scheduleType === "disabled" ? <DisabledIcon /> : (scheduleType === "company" ? <Business /> : <Queue />),
      color: scheduleType === "disabled" ? "error" : "primary"
    },
    {
      label: `${currentSchedules.filter(s => s.startTime && s.endTime).length} dias configurados`,
      icon: <ScheduleIcon />,
      color: "success"
    }
  ];

  return (
    <StandardPageLayout
      title="Configuração de Horários"
      subtitle="Configure os horários de funcionamento da empresa ou filas específicas"
      showSearch={false}
    >
      <StandardTabContent
        variant="default"
      >
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Info sx={{ mr: 1 }} />
            <Typography variant="body2">
              Configure os horários de atendimento para a empresa ou para filas específicas.
              Os horários das filas têm prioridade sobre os horários da empresa.
            </Typography>
          </Box>
        </Alert>

        <Formik
          initialValues={{
            schedules: currentSchedules,
            type: scheduleType,
            queueId: selectedQueueId
          }}
          validationSchema={schedulesSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form>
              {/* Seleção de Tipo e Fila */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                  <Business sx={{ mr: 1 }} />
                  Configuração de Horários
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Configurar horários para</InputLabel>
                      <Select
                        value={values.type}
                        onChange={(e) => handleTypeChange(e.target.value, setFieldValue)}
                        label="Configurar horários para"
                      >
                        <MenuItem value="company">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Business sx={{ mr: 1 }} />
                            Empresa
                          </Box>
                        </MenuItem>
                        <MenuItem value="queue">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Queue sx={{ mr: 1 }} />
                            Fila de Atendimento
                          </Box>
                        </MenuItem>
                        <MenuItem value="disabled">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <DisabledIcon sx={{ mr: 1 }} />
                            Desativado
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {values.type === "queue" && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={touched.queueId && !!errors.queueId}>
                        <InputLabel>Selecione a Fila</InputLabel>
                        <Select
                          value={values.queueId || ""}
                          onChange={(e) => handleQueueChange(e.target.value, setFieldValue)}
                          label="Selecione a Fila"
                          disabled={loadingQueues}
                        >
                          {queues.map(queue => (
                            <MenuItem key={queue.id} value={queue.id}>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    backgroundColor: queue.color,
                                    mr: 1
                                  }}
                                />
                                {queue.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.queueId && errors.queueId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {errors.queueId}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  )}
                </Grid>

                {values.type === "queue" && values.queueId && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Configurando horários para a fila:{" "}
                      <strong>{queues.find(q => q.id === values.queueId)?.name}</strong>
                    </Typography>
                  </Alert>
                )}

                {values.type === "disabled" && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Horários desativados:</strong> Nenhum controle de horário será aplicado.
                      O atendimento funcionará 24/7.
                    </Typography>
                  </Alert>
                )}

                {/* Botão para copiar para todos os dias */}
                {values.type !== "disabled" && (
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <Tooltip title="Copiar horários do primeiro dia para todos os outros dias">
                      <Button
                        variant="outlined"
                        startIcon={<CopyIcon />}
                        onClick={() => copyToAllDays(setFieldValue, values)}
                        disabled={!values.schedules[0]?.startTime}
                      >
                        Copiar Primeiro Dia para Todos
                      </Button>
                    </Tooltip>
                  </Box>
                )}
              </Paper>

              {/* Horários por Dia */}
              {values.type !== "disabled" && (
                <Stack spacing={2}>
                  {values.schedules.map((schedule, index) => (
                    <DayScheduleCard
                      key={schedule.weekdayEn}
                      schedule={schedule}
                      index={index}
                      errors={errors?.schedules?.[index]}
                      touched={touched?.schedules?.[index]}
                      expanded={expandedDays[index] !== false}
                      onToggle={() => toggleDayExpansion(index)}
                      showCopyButton={true}
                      onCopyFromFirst={(targetIndex) => copyFromFirstDay(targetIndex, setFieldValue, values)}
                      setFieldValue={setFieldValue}
                    />
                  ))}
                </Stack>
              )}

              {/* Ações */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RefreshIcon />}
                  disabled={loading || isSubmitting}
                >
                  Restaurar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading || isSubmitting || values.type === "disabled"}
                  sx={{ minWidth: 200 }}
                >
                  {values.type === "disabled" ? "Desativado" : "Salvar Horários"}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </StandardTabContent>
    </StandardPageLayout>
  );
};

export default SchedulesPage;