import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { AuthContext } from '../../context/Auth/AuthContext';

const QRCodeDialog = ({ open, landingPage, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchQRCode = async () => {
      if (!open || !landingPage) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/landing-pages/${landingPage.id}/qrcode`);
        setQrCode(response.data.qrCode);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        enqueueSnackbar('Erro ao gerar QR Code', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [landingPage, open, enqueueSnackbar]);

  // Função para baixar a imagem do QR Code
  const handleDownload = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qrcode-${landingPage.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        QR Code - {landingPage?.title}
      </DialogTitle>
      <DialogContent>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          p={2}
        >
          {loading ? (
            <CircularProgress />
          ) : qrCode ? (
            <>
              <Box mb={2}>
                <img 
                  src={qrCode} 
                  alt={`QR Code da landing page ${landingPage?.title}`} 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" textAlign="center" mb={2}>
                Este QR Code direciona para a URL: <br />
                <strong>{window.location.origin}/l/{user.companyId}/{landingPage?.slug}</strong>
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Baixar QR Code
              </Button>
            </>
          ) : (
            <Typography color="error">
              Não foi possível gerar o QR Code.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDialog;