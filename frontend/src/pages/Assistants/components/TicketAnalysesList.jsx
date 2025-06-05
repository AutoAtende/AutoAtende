import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as ProcessingIcon,
  Schedule as PendingIcon,
  QuestionAnswer as QuestionIcon,
  Assessment as AssessmentIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import ConfirmationModal from "../../../components/ConfirmationModal";

const TicketAnalysesList = ({ open, onClose, assistantId }) => {
  const { user } = useContext(AuthContext);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [applyingToAssistant, setApplyingToAssistant] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAnalyses();
      fetchAssistants();
    }
  }, [open, assistantId]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (assistantId) {
        params.assistantId = assistantId;
      }

      const { data } = await api.get("/ticket-analysis", { params });
      setAnalyses(data.analyses || []);
    } catch (error) {
      console.error("Erro ao carregar análises:", error);
      toast.error("Erro ao carregar análises");
    } finally {
      setLoading(false);
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

  const handleViewAnalysis = async (analysis) => {
    try {
      const { data } = await api.get(`/ticket-analysis/${analysis.id}`);
      setSelectedAnalysis(data);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar análise:", error);
      toast.error("Erro ao carregar detalhes da análise");
    }
  };

  const handleDeleteAnalysis = async () => {
    try {
      await api.delete(`/ticket-analysis/${selectedAnalysis.id}`);
      setAnalyses(prev => prev.filter(a => a.id !== selectedAnalysis.id));
      setConfirmDeleteOpen(false);
      setSelectedAnalysis(null);
      toast.success("Análise deletada com sucesso");
    } catch (error) {
      console.error("Erro ao deletar análise:", error);
      toast.error("Erro ao deletar análise");
    }
  };

  const handleApplyToAssistant = async (targetAssistantId, mergeMode = "append") => {
    setApplyingToAssistant(true);
    try {
      await api.post(`/ticket-analysis/${selectedAnalysis.id}/apply`, {
        assistantId: targetAssistantId,
        mergeMode
      });

      // Atualizar status da análise
      const updatedAnalyses = analyses.map(a => 
        a.id === selectedAnalysis.id 
          ? { ...a, isApplied: true, appliedAt: new Date() }
          : a
      );
      setAnalyses(updatedAnalyses);

      toast.success("Treinamento aplicado ao assistente com sucesso!");
      setViewModalOpen(false);
    } catch (error) {
      console.error("Erro ao aplicar treinamento:", error);
      toast.error(error.response?.data?.error || "Erro ao aplicar treinamento");
    } finally {
      setApplyingToAssistant(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon color="success" />;
      case "failed":
        return <ErrorIcon color="error" />;
      case "processing":
        return <ProcessingIcon color="primary" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "failed":
        return "Falha";
      case "processing":
        return "Processando";
      default:
        return "Pendente";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "processing":
        return "info";
      default:
        return "default";
    }
  };

  const renderAnalysisCard = (analysis) => (
    <Card key={analysis.id} variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {analysis.name}
            </Typography>
            {analysis.description && (
              <Typography variant="body2" color="textSecondary" paragraph>
                {analysis.description}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {analysis.isApplied && (
              <Chip
                label="Aplicado"
                color="success"
                size="small"
                icon={<SchoolIcon />}
              />
            )}
            <Chip
              label={getStatusText(analysis.status)}
              color={getStatusColor(analysis.status)}
              size="small"
              icon={getStatusIcon(analysis.status)}
            />
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="textSecondary">
              Data de Criação
            </Typography>
            <Typography variant="body2">
              {format(new Date(analysis.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </Typography>
          </Grid>

          {analysis.status === "completed" && analysis.analysisMetrics && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="textSecondary">
                  Tickets Analisados
                </Typography>
                <Typography variant="body2">
                  {analysis.analysisMetrics.totalTickets || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="textSecondary">
                  Perguntas Identificadas
                </Typography>
                <Typography variant="body2">
                  {analysis.frequentQuestions?.length || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="textSecondary">
                  Tempo Médio de Resolução
                </Typography>
                <Typography variant="body2">
                  {analysis.analysisMetrics.averageResolutionTime?.toFixed(1) || 0} min
                </Typography>
              </Grid>
            </>
          )}

          {analysis.assistant && (
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                Assistente Associado
              </Typography>
              <Typography variant="body2">
                {analysis.assistant.name}
              </Typography>
            </Grid>
          )}
        </Grid>

        {analysis.status === "failed" && analysis.errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {analysis.errorMessage}
            </Typography>
          </Alert>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<ViewIcon />}
          onClick={() => handleViewAnalysis(analysis)}
          disabled={analysis.status !== "completed"}
        >
          Visualizar
        </Button>
        
        <Button
          size="small"
          startIcon={<DeleteIcon />}
          color="error"
          onClick={() => {
            setSelectedAnalysis(analysis);
            setConfirmDeleteOpen(true);
          }}
        >
          Deletar
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AnalyticsIcon color="primary" />
            <Typography variant="h6">
              Análises de Tickets
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : analyses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <AssessmentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Nenhuma análise encontrada
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {assistantId 
                  ? "Este assistente não possui análises de tickets."
                  : "Ainda não foram criadas análises de tickets."}
              </Typography>
            </Box>
          ) : (
            <Box>
              {analyses.map(analysis => renderAnalysisCard(analysis))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização Detalhada */}
      <Dialog 
        open={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            {selectedAnalysis?.name}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {selectedAnalysis && (
            <Box>
              {/* Métricas */}
              <Typography variant="h6" gutterBottom>
                Métricas da Análise
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" variant="caption">
                        Tickets
                      </Typography>
                      <Typography variant="h6">
                        {selectedAnalysis.analysisMetrics?.totalTickets || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" variant="caption">
                        Mensagens
                      </Typography>
                      <Typography variant="h6">
                        {selectedAnalysis.analysisMetrics?.totalMessages || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" variant="caption">
                        Perguntas
                      </Typography>
                      <Typography variant="h6">
                        {selectedAnalysis.frequentQuestions?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" variant="caption">
                        Resolução Média
                      </Typography>
                      <Typography variant="h6">
                        {selectedAnalysis.analysisMetrics?.averageResolutionTime?.toFixed(1) || 0}m
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Perguntas Frequentes */}
              <Typography variant="h6" gutterBottom>
                Perguntas Frequentes Identificadas
              </Typography>
              
              {selectedAnalysis.frequentQuestions?.length > 0 ? (
                selectedAnalysis.frequentQuestions.map((question, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" justifyContent="space-between" width="100%">
                        <Typography variant="subtitle1">
                          {question.question}
                        </Typography>
                        <Box display="flex" gap={1} mr={2}>
                          <Chip 
                            label={question.category} 
                            size="small" 
                            color="secondary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`Freq: ${question.frequency}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" paragraph>
                        <strong>Resposta:</strong> {question.answer}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Confiança: {(question.confidence * 100).toFixed(0)}%
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Alert severity="info">
                  Nenhuma pergunta frequente foi identificada.
                </Alert>
              )}

              {/* Aplicar a Assistente */}
              {selectedAnalysis.frequentQuestions?.length > 0 && (
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom>
                    Aplicar Treinamento
                  </Typography>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <ApplyToAssistantForm
                        assistants={assistants}
                        onApply={handleApplyToAssistant}
                        loading={applyingToAssistant}
                        isApplied={selectedAnalysis.isApplied}
                      />
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        title={`Deletar análise "${selectedAnalysis?.name}"?`}
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteAnalysis}
      >
        Esta ação não pode ser desfeita. A análise e todos os dados associados serão permanentemente removidos.
      </ConfirmationModal>
    </>
  );
};

// Componente para aplicar treinamento a assistente
const ApplyToAssistantForm = ({ assistants, onApply, loading, isApplied }) => {
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [mergeMode, setMergeMode] = useState("append");

  const handleApply = () => {
    if (selectedAssistant) {
      onApply(selectedAssistant, mergeMode);
    }
  };

  if (isApplied) {
    return (
      <Alert severity="success" icon={<CheckCircleIcon />}>
        Este treinamento já foi aplicado a um assistente.
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={5}>
          <FormControl fullWidth>
            <InputLabel>Selecionar Assistente</InputLabel>
            <Select
              value={selectedAssistant}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              label="Selecionar Assistente"
            >
              {assistants.map((assistant) => (
                <MenuItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Modo de Aplicação</InputLabel>
            <Select
              value={mergeMode}
              onChange={(e) => setMergeMode(e.target.value)}
              label="Modo de Aplicação"
            >
              <MenuItem value="append">Adicionar ao Final</MenuItem>
              <MenuItem value="prepend">Adicionar no Início</MenuItem>
              <MenuItem value="replace">Substituir Completamente</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <SchoolIcon />}
            onClick={handleApply}
            disabled={!selectedAssistant || loading}
            fullWidth
          >
            Aplicar
          </Button>
        </Grid>
      </Grid>
      
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
        <strong>Adicionar ao Final:</strong> Mantém as instruções atuais e adiciona o novo treinamento.<br/>
        <strong>Adicionar no Início:</strong> Prioriza o novo treinamento sobre as instruções existentes.<br/>
        <strong>Substituir:</strong> Remove as instruções atuais e usa apenas o novo treinamento.
      </Typography>
    </Box>
  );
};

export default TicketAnalysesList;