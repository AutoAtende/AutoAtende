import React, { useState, useEffect, useContext } from 'react';
import QRCode from "qrcode.react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from '../../../context/Socket/SocketContext';
import { toast } from "../../../helpers/toast";
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(60); // Garantir que começa com 90 segundos
  const [connectionName, setConnectionName] = useState("");
  const socketManager = useContext(SocketContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timerId, setTimerId] = useState(null);

  // Obter QR Code diretamente via API
  const getQrCodeDirectly = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/whatsapp/${whatsAppId}`);
      if (data) {
        if (data.qrcode) {
          setQrCode(data.qrcode);
          // Reiniciar o timer apenas quando um novo QR code for recebido
          setTimeRemaining(60);
        }
        setConnectionName(data.name || "");
        return !!data.qrcode;
      }
      return false;
    } catch (err) {
      console.error("Erro ao obter QR code diretamente:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handler para atualizações de QR code
  const handleQrCodeUpdate = (data) => {
    if (!data) return;
    
    // Verificar se os dados são relevantes para este WhatsApp
    const isRelevant = 
      (data.session?.id === Number(whatsAppId)) ||
      (data.id === Number(whatsAppId));
    
    if (isRelevant) {
      const status = data.session?.status || data.status || '';
      const qrcode = data.session?.qrcode || data.qrcode || '';
      
      // Atualizar o nome da conexão se disponível
      if (data.session?.name || data.name) {
        setConnectionName(data.session?.name || data.name);
      }

      if (status === "CONNECTED") {
        toast.success(i18n.t('qrCode.connected'));
        setTimeout(() => {
          onClose();
        }, 1000);
      }

      if (qrcode) {
        setQrCode(qrcode);
        setLoading(false);
        // Reiniciar o timer quando receber um novo QR code
        setTimeRemaining(90);
        // Indicar que não está mais atualizando
        setIsRefreshing(false);
      }
    }
  };

  // Limpar e reiniciar o timer
  const resetTimer = () => {
    // Limpar timer existente
    if (timerId) {
      clearInterval(timerId);
    }
    
    // Definir novo timer
    setTimeRemaining(60);
    const newTimerId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(newTimerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerId(newTimerId);
    return newTimerId;
  };

  // Função para solicitar reconexão - versão corrigida
  const handleRefreshQr = async () => {
    try {
      // Indicar que está atualizando
      setIsRefreshing(true);
      setLoading(true);
      
      // Pausar o timer atual durante a atualização
      if (timerId) {
        clearInterval(timerId);
      }
      
      // Limpar QR code atual
      setQrCode("");
      
      // Chamar o endpoint de reconexão
      const response = await api.post(`/whatsappsession/${whatsAppId}/reconnect`);
      
      if (response.status !== 200) {
        throw new Error("Falha ao solicitar reconexão");
      }
      
      toast.success(i18n.t("connections.toasts.qrCodeRequested"));
      
      // Criar uma função de verificação repetida
      let attempts = 0;
      const maxAttempts = 3;
      const checkInterval = 3000; // 3 segundos entre tentativas
      
      const checkQrCode = async () => {
        try {
          attempts++;
          
          const { data } = await api.get(`/whatsapp/${whatsAppId}`);
          
          // Se encontrou QR code válido
          if (data && data.qrcode) {
            setQrCode(data.qrcode);
            setLoading(false);
            setIsRefreshing(false);
            // Reiniciar o timer com o novo QR code
            setTimeRemaining(60);
            resetTimer();
            return true;
          }
          
          // Se conectado, fechar modal
          if (data && data.status === "CONNECTED") {
            toast.success(i18n.t('qrCode.connected'));
            setTimeout(() => {
              onClose();
            }, 1000);
            return true;
          }
          
          // Se atingiu o limite de tentativas
          if (attempts >= maxAttempts) {
            toast.error(i18n.t("connections.toasts.qrCodeError"));
            setLoading(false);
            setIsRefreshing(false);
            // Reiniciar timer mesmo sem QR code
            setTimeRemaining(60);
            resetTimer();
            return true;
          }
          
          // Continuar tentando
          setTimeout(checkQrCode, checkInterval);
          return false;
          
        } catch (err) {
          console.error("Erro ao verificar QR code:", err);
          setLoading(false);
          setIsRefreshing(false);
          // Reiniciar timer mesmo com erro
          setTimeRemaining(60);
          resetTimer();
          return true;
        }
      };
      
      // Iniciar a verificação
      setTimeout(checkQrCode, checkInterval);
      
    } catch (err) {
      console.error("Erro ao solicitar reconexão:", err);
      toast.error(i18n.t("connections.toasts.qrCodeError"));
      setLoading(false);
      setIsRefreshing(false);
      // Reiniciar timer mesmo com erro
      setTimeRemaining(60);
      resetTimer();
    }
  };

  // Timer para contagem regressiva do QR Code
  useEffect(() => {
    if (open) {
      const id = resetTimer();
      return () => clearInterval(id);
    }
    return () => {};
  }, [open]);

  // Efeito para carregar o QR Code inicial e configurar o socket
  useEffect(() => {
    if (!open || !whatsAppId) return;
    
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;
    
    // Obter o socket do SocketManager
    const socket = socketManager.GetSocket(companyId);

    const init = async () => {
      // Tentar obter QR code diretamente
      const hasQrCode = await getQrCodeDirectly();
      
      // Se encontrou QR code, reiniciar timer
      if (hasQrCode) {
        resetTimer();
      }
      
      // Configurar socket para atualização em tempo real
      if (socket) {
        socket.on(`company-${companyId}-whatsappSession`, handleQrCodeUpdate);
      }
    };
    
    init();
    
    // Cleanup
    return () => {
      if (socket) {
        socket.off(`company-${companyId}-whatsappSession`, handleQrCodeUpdate);
      }
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [open, whatsAppId, socketManager]);

  // Formatação do tempo restante
  const formattedTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">
            {i18n.t("qrCode.title")} - {connectionName}
          </Typography>
          <IconButton 
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: 2,
            mt: 2 
          }}
        >
          <Typography variant="body1" align="center">
            {i18n.t("qrCode.instructions")}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <Typography variant="body2">
              {i18n.t("qrCode.timeRemaining")}: {formattedTimeRemaining()}
            </Typography>
            <Typography variant="body2">
              {Math.round((timeRemaining / 60) * 100)}%
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={(timeRemaining / 60) * 100} 
            sx={{ width: '100%', height: 8, borderRadius: 4 }}
          />

          <Box 
            sx={{ 
              width: '256px', 
              height: '256px', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid #ddd',
              borderRadius: '4px',
              mt: 2,
              mb: 2
            }}
          >
            {loading || isRefreshing ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress color="primary" sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  {isRefreshing 
                    ? i18n.t("qrCode.refreshing") || "Gerando novo QR Code..." 
                    : i18n.t("qrCode.loading") || "Carregando..."}
                </Typography>
              </Box>
            ) : qrCode ? (
              <QRCode value={qrCode} size={256} />
            ) : (
              <Typography color="text.secondary">
                {i18n.t("qrCode.noQrFound")}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleRefreshQr}
            disabled={loading || isRefreshing}
            startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            fullWidth
          >
            {timeRemaining === 0 
              ? i18n.t("qrCode.expired")
              : i18n.t("connections.buttons.refreshQrCode")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QrcodeModal;