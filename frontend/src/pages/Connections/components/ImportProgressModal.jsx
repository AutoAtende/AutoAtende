import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  CircularProgress,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { SocketContext } from '../../../context/Socket/SocketContext';
import api from '../../../services/api';
import { i18n } from '../../../translate/i18n';
import { toast } from '../../../helpers/toast';

const ImportProgressModal = ({ open, onClose, whatsApp }) => {
  const [status, setStatus] = useState({
    phase: 'preparing', // 'preparing', 'running', 'complete', 'error'
    progress: 0,
    current: 0,
    total: 0,
    batchInfo: '',
    errorMessage: ''
  });
  
  const socketManager = useContext(SocketContext);
  const companyId = localStorage.getItem("companyId");
  
  useEffect(() => {
    if (!open || !whatsApp || !whatsApp.id || !companyId) return;
    
    const fetchStatus = async () => {
      try {
        const response = await api.get(`/whatsapp/${whatsApp.id}/import-messages-status`);
        if (response.data) {
          updateStatusFromData(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar status de importação:', error);
        setStatus(prev => ({
          ...prev,
          phase: 'error',
          errorMessage: 'Falha ao buscar status da importação'
        }));
      }
    };
    
    // Configura socket para receber atualizações
    const socket = socketManager.GetSocket(companyId);
    
    if (socket) {
      socket.on(`importMessages-${companyId}`, handleImportUpdate);
      socket.on(`importMessages-${companyId}-${whatsApp.id}`, handleWhatsAppSpecificUpdate);
    }
    
    fetchStatus();
    
    // Polling para status a cada 5 segundos como fallback caso o socket falhe
    const interval = setInterval(fetchStatus, 5000);
    
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off(`importMessages-${companyId}`);
        socket.off(`importMessages-${companyId}-${whatsApp.id}`);
      }
    };
  }, [open, whatsApp, companyId, socketManager]);
  
  const updateStatusFromData = (data) => {
    if (!data) return;
    
    // Status da importação vindo do backend
    if (data.status === 'idle' || data.status === 'preparing') {
      setStatus({
        phase: 'preparing',
        progress: 0,
        current: 0,
        total: data.totalMessages || 0,
        batchInfo: data.batchInfo || '',
        errorMessage: ''
      });
    } else if (data.status === 'processing' || data.status === 'running' || data.status === 'Running') {
      const progress = data.totalMessages > 0 
        ? Math.round((data.importedMessages / data.totalMessages) * 100)
        : 0;
        
      setStatus({
        phase: 'running',
        progress: progress,
        current: data.importedMessages || 0,
        total: data.totalMessages || 0,
        batchInfo: data.batchInfo || '',
        errorMessage: ''
      });
    } else if (data.status === 'completed' || data.status === 'complete') {
      setStatus({
        phase: 'complete',
        progress: 100,
        current: data.totalMessages || 0,
        total: data.totalMessages || 0,
        batchInfo: data.batchInfo || '',
        errorMessage: ''
      });
    } else if (data.status === 'renderButtonCloseTickets') {
      setStatus({
        phase: 'complete',
        progress: 100,
        current: data.totalMessages || 0,
        total: data.totalMessages || 0,
        batchInfo: 'Aguardando fechamento de tickets',
        errorMessage: ''
      });
    } else if (data.status === 'error') {
      setStatus({
        phase: 'error',
        progress: 0,
        current: 0,
        total: 0,
        batchInfo: '',
        errorMessage: data.errorMessage || 'Erro desconhecido durante a importação'
      });
    }
  };
  
  const handleImportUpdate = (data) => {
    if (data.action === 'update' && data.status) {
      if (data.status.status === 'preparing') {
        setStatus(prev => ({
          ...prev,
          phase: 'preparing',
          total: data.status.all || prev.total,
          batchInfo: data.status.batchInfo || ''
        }));
      } else if (data.status.status === 'Running') {
        const progress = data.status.all > 0 
          ? Math.round((data.status.this / data.status.all) * 100)
          : 0;
          
        setStatus(prev => ({
          ...prev,
          phase: 'running',
          current: data.status.this,
          total: data.status.all,
          progress: progress,
          batchInfo: data.status.batchInfo || ''
        }));
      }
    } else if (data.action === 'refresh') {
      api.get(`/whatsapp/${whatsApp.id}/import-messages-status`)
        .then(response => {
          if (response.data) {
            updateStatusFromData(response.data);
          }
        })
        .catch(error => console.error('Erro ao atualizar status:', error));
    }
  };
  
  const handleWhatsAppSpecificUpdate = (data) => {
    if (data.action === 'progress' && data.status) {
      setStatus(prev => ({
        ...prev,
        phase: 'running',
        current: data.status.processed,
        total: data.status.total,
        progress: data.status.progress || 0,
        batchInfo: data.status.batchInfo || ''
      }));
    }
  };
  
  const handleCloseTickets = async () => {
    try {
      setStatus(prev => ({ ...prev, phase: 'processing' }));
      await api.post(`/closedimported/${whatsApp.id}`);
      toast.success('Tickets fechados com sucesso!');
      setStatus(prev => ({ 
        ...prev, 
        phase: 'complete',
        batchInfo: 'Tickets fechados com sucesso' 
      }));
    } catch (error) {
      console.error('Erro ao fechar tickets:', error);
      toast.error('Falha ao fechar tickets importados');
      setStatus(prev => ({
        ...prev,
        phase: 'error',
        errorMessage: 'Falha ao fechar tickets importados'
      }));
    }
  };
  
  const handleRefreshStatus = () => {
    api.get(`/whatsapp/${whatsApp.id}/import-messages-status`)
      .then(response => {
        if (response.data) {
          updateStatusFromData(response.data);
          toast.success('Status atualizado');
        }
      })
      .catch(error => {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status');
      });
  };
  
  const renderContent = () => {
    switch (status.phase) {
      case 'preparing':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Preparando importação...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por favor, aguarde enquanto preparamos os dados para importação.
            </Typography>
          </Box>
        );
        
      case 'running':
      case 'processing':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Importando mensagens
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Progresso: {status.progress}%
              </Typography>
              <Typography variant="body2">
                {status.current} / {status.total}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={status.progress} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            
            {status.batchInfo && (
              <Typography variant="caption" color="text.secondary">
                {status.batchInfo}
              </Typography>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Não feche esta janela enquanto a importação estiver em andamento.
              </Typography>
            </Box>
          </Box>
        );
        
      case 'complete':
        return (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Importação concluída
              </Typography>
            </Box>
            
            <Typography variant="body1" gutterBottom>
              {status.total} mensagens foram importadas com sucesso.
            </Typography>
            
            {status.batchInfo && status.batchInfo.includes('Aguardando') && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Fechar tickets importados
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Você pode fechar automaticamente todos os tickets criados durante a importação para manter seu workspace organizado.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCloseTickets}
                  startIcon={<CheckIcon />}
                >
                  Fechar tickets importados
                </Button>
              </Paper>
            )}
          </Box>
        );
        
      case 'error':
        return (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Erro na importação
              </Typography>
            </Box>
            
            <Typography variant="body2" color="error" gutterBottom>
              {status.errorMessage || 'Ocorreu um erro durante o processo de importação.'}
            </Typography>
            
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleRefreshStatus}
              sx={{ mt: 2 }}
              startIcon={<RefreshIcon />}
            >
              Atualizar status
            </Button>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={status.phase === 'running' || status.phase === 'processing' ? null : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">
            Importação de Mensagens
          </Typography>
          {status.phase !== 'preparing' && status.phase !== 'running' && status.phase !== 'processing' && (
            <IconButton 
              size="small" 
              onClick={handleRefreshStatus}
              color="primary"
              sx={{ ml: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        
        {(status.phase !== 'running' && status.phase !== 'processing') && (
          <IconButton 
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <Divider />
      <DialogContent>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ImportProgressModal;