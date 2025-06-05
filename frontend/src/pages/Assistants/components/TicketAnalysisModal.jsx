import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { styled } from "@mui/material/styles";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Divider,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  SmartToy as SmartToyIcon,
  QuestionAnswer as QuestionIcon,
  ExpandMore as ExpandMoreIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { format, subDays } from "date-fns";

import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { useSpring, animated } from "react-spring";
import AnalysisStatusTracker from "./AnalysisStatusTracker";

// Schemas de validação
const FilterSchema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  openaiApiKey: Yup.string().required("Chave da API OpenAI é obrigatória"),
  dateRange: Yup.object().shape({
    startDate: Yup.date().required("Data inicial é obrigatória"),
    endDate: Yup.date().required("Data final é obrigatória")
  }),
  minMessages: Yup.number().min(1, "Mínimo 1 mensagem").default(3)
});

// Componente TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Estilos
const PREFIX = "TicketAnalysisModal";

const AnimatedCard = animated(Card);

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    minHeight: "80vh",
    maxHeight: "90vh"
  }
}));

const TicketAnalysisModal = ({ open, onClose, assistantId, onAnalysisComplete }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    queues: [],
    users: [],
    statusOptions: []
  });
  const [assistants, setAssistants] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Animação
  const springProps = useSpring({
    opacity: open ? 1 : 0,
    transform: `scale(${open ? 1 : 0.9})`
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      fetchFilterOptions();
      fetchAssistants();
    }
  }, [open]);

  const fetchFilterOptions = async () => {
    try {
      const { data } = await api.get("/ticket-analysis-filters");
      setFilterOptions(data);
    } catch (error) {
      console.error("Erro ao carregar opções de filtro:", error);
      toast.error("Erro ao carregar opções de filtro");
    }
  };

  const fetchAssistants = async () => {
    try {
      const { data } = await api.get("/assistants");
      setAssistants(data.assistants || []);
    } catch (error) {
      console.error("Erro ao carregar assistentes:", error);
    }
  };

  const handleClose = () => {
    setActiveTab(0);
    setActiveStep(0);
    setAnalysis(null);
    setEditingQuestion(null);
    onClose();
  };

  // Executar análise
  const handleRunAnalysis = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        assistantId: assistantId || undefined,
        filterCriteria: {
          dateRange: {
            startDate: format(values.dateRange.startDate, "yyyy-MM-dd"),
            endDate: format(values.dateRange.endDate, "yyyy-MM-dd")
          },
          queueIds: values.queueIds || [],
          userIds: values.userIds || [],
          status: values.status || [],
          minMessages: values.minMessages || 3
        }
      };

      const { data } = await api.post("/ticket-analysis", payload);
      setAnalysis(data);
      setActiveStep(1);
      toast.success("Análise iniciada com sucesso!");

    } catch (error) {
      console.error("Erro ao executar análise:", error);
      toast.error(error.response?.data?.error || "Erro ao executar análise");
    } finally {
      setLoading(false);
    }
  };

  // Callback quando análise é completada
  const handleAnalysisComplete = (completedAnalysis) => {
    // Recarregar análise completa com perguntas
    fetchAnalysisDetails(completedAnalysis.id);
  };

  // Buscar detalhes completos da análise
  const fetchAnalysisDetails = async (analysisId) => {
    try {
      const { data } = await api.get(`/ticket-analysis/${analysisId}`);
      setAnalysis(data);
      setActiveStep(2); // Ir para resultados
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da análise:", error);
      toast.error("Erro ao carregar resultados da análise");
    }
  };

  // Salvar pergunta editada
  const handleSaveQuestion = async (questionIndex, updatedQuestion) => {
    try {
      const updatedQuestions = [...analysis.frequentQuestions];
      updatedQuestions[questionIndex] = updatedQuestion;

      const { data } = await api.put(`/ticket-analysis/${analysis.id}`, {
        frequentQuestions: updatedQuestions
      });

      setAnalysis(data);
      setEditingQuestion(null);
      toast.success("Pergunta atualizada com sucesso!");

    } catch (error) {
      console.error("Erro ao salvar pergunta:", error);
      toast.error("Erro ao salvar pergunta");
    }
  };

  // Aplicar treinamento ao assistente
  const handleApplyToAssistant = async (selectedAssistantId, mergeMode = "append") => {
    setLoading(true);
    try {
      const { data } = await api.post(`/ticket-analysis/${analysis.id}/apply`, {
        assistantId: selectedAssistantId,
        mergeMode
      });

      setAnalysis(prev => ({ ...prev, isApplied: true, appliedAt: new Date() }));
      setActiveStep(3); // Ir para passo 4 (índice 3)
      toast.success("Treinamento aplicado ao assistente com sucesso!");

    } catch (error) {
      console.error("Erro ao aplicar treinamento:", error);
      toast.error(error.response?.data?.error || "Erro ao aplicar treinamento");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar cartão de pergunta
  const renderQuestionCard = (question, index) => (
    <AnimatedCard
      key={index}
      variant="outlined"
      sx={{ mb: 2, transition: "all 0.3s" }}
      style={springProps}
    >
      <CardContent>
        {editingQuestion === index ? (
          <QuestionEditor
            question={question}
            onSave={(updated) => handleSaveQuestion(index, updated)}
            onCancel={() => setEditingQuestion(null)}
          />
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6" color="primary">
                {question.question}
              </Typography>
              <Box>
                <Chip
                  label={question.category}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Freq: ${question.frequency}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
            
            <Typography variant="body1" paragraph>
              {question.answer}
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="textSecondary">
                Confiança: {(question.confidence * 100).toFixed(0)}%
              </Typography>
              <IconButton
                size="small"
                onClick={() => setEditingQuestion(index)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Box>
          </>
        )}
      </CardContent>
    </AnimatedCard>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <StyledDialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AnalyticsIcon color="primary" />
            <Typography variant="h6">
              Análise de Tickets para Treinamento
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Passo 1: Configurar Filtros */}
            <Step>
              <StepLabel>
                <Typography variant="subtitle1">Configurar Análise</Typography>
              </StepLabel>
              <StepContent>
                <Formik
                  initialValues={{
                    name: `Análise ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
                    description: "",
                    openaiApiKey: "",
                    dateRange: {
                      startDate: subDays(new Date(), 30),
                      endDate: new Date()
                    },
                    queueIds: [],
                    userIds: [],
                    status: ["closed"],
                    minMessages: 3
                  }}
                  validationSchema={FilterSchema}
                  onSubmit={handleRunAnalysis}
                >
                  {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            name="name"
                            label="Nome da Análise"
                            fullWidth
                            error={touched.name && errors.name}
                            helperText={touched.name && errors.name}
                            margin="normal"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            name="openaiApiKey"
                            label="Chave da API OpenAI"
                            type="password"
                            fullWidth
                            error={touched.openaiApiKey && errors.openaiApiKey}
                            helperText={touched.openaiApiKey && errors.openaiApiKey}
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="description"
                            label="Descrição (opcional)"
                            fullWidth
                            multiline
                            rows={2}
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Data Inicial"
                            value={values.dateRange.startDate}
                            onChange={(date) => setFieldValue("dateRange.startDate", date)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                margin="normal"
                                error={touched.dateRange?.startDate && errors.dateRange?.startDate}
                                helperText={touched.dateRange?.startDate && errors.dateRange?.startDate}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Data Final"
                            value={values.dateRange.endDate}
                            onChange={(date) => setFieldValue("dateRange.endDate", date)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                margin="normal"
                                error={touched.dateRange?.endDate && errors.dateRange?.endDate}
                                helperText={touched.dateRange?.endDate && errors.dateRange?.endDate}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Filas (opcional)</InputLabel>
                            <Select
                              multiple
                              value={values.queueIds}
                              onChange={(e) => setFieldValue("queueIds", e.target.value)}
                              renderValue={(selected) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                  {selected.map((value) => {
                                    const queue = filterOptions.queues.find(q => q.id === value);
                                    return (
                                      <Chip
                                        key={value}
                                        label={queue?.name || value}
                                        size="small"
                                      />
                                    );
                                  })}
                                </Box>
                              )}
                            >
                              {filterOptions.queues.map((queue) => (
                                <MenuItem key={queue.id} value={queue.id}>
                                  <Checkbox checked={values.queueIds.indexOf(queue.id) > -1} />
                                  <ListItemText primary={queue.name} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Status dos Tickets</InputLabel>
                            <Select
                              multiple
                              value={values.status}
                              onChange={(e) => setFieldValue("status", e.target.value)}
                              renderValue={(selected) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                  ))}
                                </Box>
                              )}
                            >
                              {filterOptions.statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  <Checkbox checked={values.status.indexOf(option.value) > -1} />
                                  <ListItemText primary={option.label} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            name="minMessages"
                            label="Mínimo de Mensagens por Ticket"
                            type="number"
                            fullWidth
                            margin="normal"
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                      </Grid>

                      <Box mt={3}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                          disabled={loading || isSubmitting}
                          size="large"
                        >
                          {loading ? "Analisando..." : "Executar Análise"}
                        </Button>
                      </Box>
                    </Form>
                  )}
                </Formik>
              </StepContent>
            </Step>

            {/* Passo 2: Acompanhar Processamento */}
            <Step>
              <StepLabel>
                <Typography variant="subtitle1">Acompanhar Processamento</Typography>
              </StepLabel>
              <StepContent>
                {analysis && analysis.status === 'completed' && analysis.frequentQuestions ? (
                  <AnalysisStatusTracker
                    analysisId={analysis.id}
                    onAnalysisComplete={handleAnalysisComplete}
                    onAnalysisError={(error) => {
                      console.error("Erro na análise:", error);
                      toast.error("Erro durante o processamento da análise");
                    }}
                    autoRefresh={true}
                    refreshInterval={3000}
                  />
                ) : (
                  <Typography variant="body1">
                    Aguarde enquanto a análise é processada...
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* Passo 3: Resultados da Análise */}
            <Step>
              <StepLabel>
                <Typography variant="subtitle1">Revisar Resultados</Typography>
              </StepLabel>
              <StepContent>
                {analysis && (
                  <>
                    {/* Métricas da Análise */}
                    <Alert severity="success" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Análise Concluída!
                      </Typography>
                      <Typography variant="body2">
                        {analysis.analysisMetrics?.totalTickets} tickets analisados • {" "}
                        {analysis.analysisMetrics?.totalMessages} mensagens • {" "}
                        {analysis.frequentQuestions?.length} perguntas frequentes identificadas
                      </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Tempo Médio de Resolução
                            </Typography>
                            <Typography variant="h5">
                              {analysis.analysisMetrics?.averageResolutionTime?.toFixed(1) || 0} min
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Categorias Encontradas
                            </Typography>
                            <Typography variant="h5">
                              {analysis.analysisMetrics?.categoriesFound?.length || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Confiança Média
                            </Typography>
                            <Typography variant="h5">
                              {analysis.frequentQuestions?.length > 0
                                ? (analysis.frequentQuestions.reduce((sum, q) => sum + q.confidence, 0) / analysis.frequentQuestions.length * 100).toFixed(0)
                                : 0}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Perguntas Frequentes */}
                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                      Perguntas Frequentes Identificadas
                    </Typography>
                    
                    {analysis.frequentQuestions?.length > 0 ? (
                      analysis.frequentQuestions.map((question, index) => 
                        renderQuestionCard(question, index)
                      )
                    ) : (
                      <Alert severity="info">
                        Nenhuma pergunta frequente foi identificada nos tickets analisados.
                      </Alert>
                    )}

                    {/* Aplicar ao Assistente */}
                    {analysis.frequentQuestions?.length > 0 && (
                      <Box mt={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Aplicar Treinamento ao Assistente
                            </Typography>
                            
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                  <InputLabel>Selecionar Assistente</InputLabel>
                                  <Select
                                    value={assistantId || ""}
                                    onChange={(e) => setAssistantId(e.target.value)}
                                  >
                                    {assistants.map((assistant) => (
                                      <MenuItem key={assistant.id} value={assistant.id}>
                                        {assistant.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              
                              <Grid item xs={12} md={6}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<SchoolIcon />}
                                  onClick={() => handleApplyToAssistant(assistantId)}
                                  disabled={!assistantId || loading}
                                  fullWidth
                                >
                                  Aplicar Treinamento
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Box>
                    )}
                  </>
                )}
              </StepContent>
            </Step>

            {/* Passo 4: Concluído */}
            <Step>
              <StepLabel>
                <Typography variant="subtitle1">Treinamento Aplicado</Typography>
              </StepLabel>
              <StepContent>
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <Typography variant="h6" gutterBottom>
                    Treinamento Aplicado com Sucesso!
                  </Typography>
                  <Typography variant="body2">
                    O assistente foi treinado com as perguntas frequentes identificadas na análise.
                    As instruções foram atualizadas com o novo conteúdo de treinamento.
                  </Typography>
                </Alert>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Fechar
          </Button>
        </DialogActions>
      </StyledDialog>
    </LocalizationProvider>
  );
};

// Componente para editar perguntas
const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [editedQuestion, setEditedQuestion] = useState({
    question: question.question,
    answer: question.answer,
    category: question.category,
    frequency: question.frequency,
    confidence: question.confidence
  });

  const handleSave = () => {
    onSave(editedQuestion);
  };

  return (
    <Box>
      <TextField
        label="Pergunta"
        value={editedQuestion.question}
        onChange={(e) => setEditedQuestion(prev => ({ ...prev, question: e.target.value }))}
        fullWidth
        margin="normal"
        multiline
        rows={2}
      />
      
      <TextField
        label="Resposta"
        value={editedQuestion.answer}
        onChange={(e) => setEditedQuestion(prev => ({ ...prev, answer: e.target.value }))}
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <TextField
            label="Categoria"
            value={editedQuestion.category}
            onChange={(e) => setEditedQuestion(prev => ({ ...prev, category: e.target.value }))}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            label="Frequência"
            type="number"
            value={editedQuestion.frequency}
            onChange={(e) => setEditedQuestion(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </Grid>
      </Grid>
      
      <Box mt={2} display="flex" gap={1}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Salvar
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default TicketAnalysisModal;