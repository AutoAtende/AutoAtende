import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as ProcessingIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

const AnalysisStatusTracker = ({ 
  analysisId, 
  onAnalysisComplete, 
  onAnalysisError,
  autoRefresh = true,
  refreshInterval = 5000 
}) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Buscar status da análise
  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get(`/ticket-analysis/${analysisId}/status`);
      setStatus(data);

      // Notificar sobre conclusão
      if (data.analysis.status === 'completed' && onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }

      // Notificar sobre erro
      if (data.analysis.status === 'failed' && onAnalysisError) {
        onAnalysisError(data.analysis);
      }

    } catch (error) {
      console.error('Erro ao buscar status:', error);
      if (onAnalysisError) {
        onAnalysisError({ error: error.message });
      }
    } finally {
      setLoading(false);
    }
  }, [analysisId, onAnalysisComplete, onAnalysisError]);

  // Efeito para buscar status inicial
  useEffect(() => {
    if (analysisId) {
      fetchStatus();
    }
  }, [analysisId, fetchStatus]);

  // Efeito para auto-refresh
  useEffect(() => {
    if (!autoRefresh || !analysisId || !status) return;

    // Só continua fazendo polling se estiver em processamento
    if (!['pending', 'processing'].includes(status.analysis.status)) {
      return;
    }

    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [status, autoRefresh, refreshInterval, fetchStatus, analysisId]);

  // Cancelar análise
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/ticket-analysis/${analysisId}/cancel`);
      toast.success('Análise cancelada com sucesso');
      await fetchStatus(); // Atualizar status
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Erro ao cancelar análise:', error);
      toast.error(error.response?.data?.error || 'Erro ao cancelar análise');
    } finally {
      setCancelling(false);
    }
  };

  // Renderizar ícone do status
  const renderStatusIcon = (analysisStatus) => {
    switch (analysisStatus) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <ProcessingIcon color="primary" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  // Obter cor do status
  const getStatusColor = (analysisStatus) => {
    switch (analysisStatus) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  };

  // Obter texto do status
  const getStatusText = (analysisStatus) => {
    switch (analysisStatus) {
      case 'completed':
        return 'Concluída';
      case 'failed':
        return 'Falhou';
      case 'processing':
        return 'Processando';
      default:
        return 'Pendente';
    }
  };

  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Carregando status...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Alert severity="error">
        Não foi possível carregar o status da análise.
      </Alert>
    );
  }

  const { analysis, job } = status;
  const isProcessing = ['pending', 'processing'].includes(analysis.status);
  const canCancel = isProcessing && !cancelling;

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          {/* Header com status */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              {renderStatusIcon(analysis.status)}
              <Typography variant="h6">
                Status da Análise
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={getStatusText(analysis.status)}
                color={getStatusColor(analysis.status)}
                size="small"
              />
              
              <IconButton
                size="small"
                onClick={fetchStatus}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Progresso */}
          {isProcessing && (
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Progresso: {job.progress || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={job.progress || 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {/* Informações da análise */}
          <Box>
            <Typography variant="body2" color="textSecondary">
              Criada em: {format(new Date(analysis.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </Typography>
            
            {job.processedOn && (
              <Typography variant="body2" color="textSecondary">
                Iniciada em: {format(new Date(job.processedOn), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </Typography>
            )}
            
            {job.finishedOn && (
              <Typography variant="body2" color="textSecondary">
                Finalizada em: {format(new Date(job.finishedOn), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </Typography>
            )}
          </Box>

          {/* Mensagem de erro */}
          {analysis.status === 'failed' && job.failedReason && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {job.failedReason}
              </Typography>
            </Alert>
          )}

          {/* Ações */}
          <Box mt={2} display="flex" gap={1}>
            {canCancel && (
              <Button
                size="small"
                color="error"
                startIcon={cancelling ? <CircularProgress size={16} /> : <CancelIcon />}
                onClick={() => setCancelDialogOpen(true)}
                disabled={cancelling}
              >
                Cancelar
              </Button>
            )}
            
            {analysis.status === 'completed' && (
              <Button
                size="small"
                color="primary"
                startIcon={<ViewIcon />}
                onClick={() => {
                  if (onAnalysisComplete) {
                    onAnalysisComplete(analysis);
                  }
                }}
              >
                Ver Resultados
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de cancelamento */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancelar Análise</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja cancelar esta análise? 
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Não
          </Button>
          <Button
            onClick={handleCancel}
            color="error"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : <CancelIcon />}
          >
            Sim, Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnalysisStatusTracker;