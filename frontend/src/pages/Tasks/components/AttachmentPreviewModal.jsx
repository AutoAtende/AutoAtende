// AttachmentPreviewModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Zoom,
  Fade,
  Tooltip,
  CircularProgress,
  Backdrop,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Fullscreen as FullscreenIcon,
  Print as PrintIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import moment from 'moment';
import { i18n } from "../../../translate/i18n";
import { formatFileSize } from './TaskUtils';

// Componentes estilizados
const AnimatedBox = animated(Box);

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  height: '80vh',
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 110px)',
  },
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  backgroundColor: theme.palette.grey[900],
}));

const ImagePreview = styled('img')(({ theme, zoom, rotation }) => ({
  maxWidth: `${zoom}%`,
  maxHeight: `${zoom}%`,
  objectFit: 'contain',
  transform: `rotate(${rotation}deg)`,
  transition: 'transform 0.3s ease',
}));

const PdfPreview = styled('iframe')(({ theme }) => ({
  width: '100%',
  height: '100%',
  border: 'none',
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(6),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
}));

const InfoPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: theme.palette.common.white,
  zIndex: 10,
  width: 250,
  maxWidth: '90%',
  [theme.breakpoints.down('sm')]: {
    width: '85%',
    top: 'auto',
    bottom: theme.spacing(16),
    right: '50%',
    transform: 'translateX(50%)',
  },
}));

const AttachmentPreviewModal = ({ open, onClose, attachment, baseURL }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Determinar o tipo de arquivo
  const isImage = attachment?.mimeType?.startsWith('image/');
  const isPDF = attachment?.mimeType === 'application/pdf';
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });
  
  const infoAnimation = useSpring({
    opacity: showInfo ? 1 : 0,
    transform: showInfo ? 'translateY(0)' : 'translateY(-20px)',
    config: { tension: 300, friction: 20 }
  });
  
  // Resetar estados ao abrir/fechar
  useEffect(() => {
    if (open) {
      setLoading(true);
      setZoom(100);
      setRotation(0);
      setShowInfo(false);
    } else {
      setError(null);
    }
  }, [open]);
  
  // Simular carregamento para melhorar UX
  useEffect(() => {
    if (open && attachment) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [open, attachment]);
  
  // Handlers
  const handleDownload = () => {
    if (!attachment) return;
    const downloadUrl = `${baseURL}/public/${attachment.filePath}`;
    window.open(downloadUrl, '_blank');
  };
  
  const handlePrint = () => {
    if (!attachment) return;
    const fileUrl = `${baseURL}/public/${attachment.filePath}`;
    const printWindow = window.open(fileUrl, '_blank');
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 20, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 20, 20));
  };
  
  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };
  
  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };
  
  const toggleInfo = () => {
    setShowInfo(prev => !prev);
  };
  
  const handleImageError = () => {
    setLoading(false);
    setError(i18n.t("tasks.attachments.preview.error"));
  };
  
  const handleFullscreen = () => {
    const element = document.getElementById('attachment-preview-container');
    
    if (!fullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setFullscreen(false);
    }
  };
  
  // Lidar com eventos de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Renderização condicional de conteúdo
  const renderPreview = () => {
    if (!attachment) return null;
    
    const fileUrl = `${baseURL}/public/${attachment.filePath}`;
    
    if (isImage) {
      return (
        <>
          {loading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
          
          <Fade in={!loading} timeout={300}>
            <ImagePreview 
              src={fileUrl} 
              alt={attachment.originalName}
              zoom={zoom}
              rotation={rotation}
              onLoad={() => setLoading(false)}
              onError={handleImageError}
              sx={{ display: loading ? 'none' : 'block' }}
            />
          </Fade>
          
          <Zoom in={!loading && !error}>
            <ControlsContainer>
              <Tooltip title={i18n.t("tasks.attachments.preview.zoomOut")}>
                <IconButton onClick={handleZoomOut} size="small" sx={{ color: 'white' }}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={i18n.t("tasks.attachments.preview.zoomIn")}>
                <IconButton onClick={handleZoomIn} size="small" sx={{ color: 'white' }}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={i18n.t("tasks.attachments.preview.rotateLeft")}>
                <IconButton onClick={handleRotateLeft} size="small" sx={{ color: 'white' }}>
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={i18n.t("tasks.attachments.preview.rotateRight")}>
                <IconButton onClick={handleRotateRight} size="small" sx={{ color: 'white' }}>
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={i18n.t("tasks.attachments.preview.fullscreen")}>
                <IconButton onClick={handleFullscreen} size="small" sx={{ color: 'white' }}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </ControlsContainer>
          </Zoom>
        </>
      );
    }
    
    if (isPDF) {
      return (
        <>
          {loading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
          
          <Fade in={!loading} timeout={300}>
            <PdfPreview 
              src={fileUrl} 
              title={attachment.originalName}
              onLoad={() => setLoading(false)}
              onError={handleImageError}
              sx={{ display: loading ? 'none' : 'block' }}
            />
          </Fade>
        </>
      );
    }
    
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <ErrorIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {i18n.t("tasks.attachments.preview.unsupported")}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {i18n.t("tasks.attachments.preview.downloadInstead")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          {i18n.t("buttons.download")}
        </Button>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={Zoom}
      transitionDuration={300}
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <Typography variant="subtitle1" component="div" noWrap sx={{ maxWidth: isMobile ? '70%' : '80%' }}>
            {attachment?.originalName}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={i18n.t("tasks.attachments.preview.showInfo")}>
            <IconButton size="small" onClick={toggleInfo} color={showInfo ? 'primary' : 'default'}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={i18n.t("buttons.download")}>
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          {(isImage || isPDF) && !isMobile && (
            <Tooltip title={i18n.t("buttons.print")}>
              <IconButton size="small" onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title={i18n.t("buttons.close")}>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </StyledDialogTitle>
      
      <Divider />
      
      <StyledDialogContent id="attachment-preview-container">
        <AnimatedBox style={fadeIn} component={PreviewContainer}>
          {renderPreview()}
          
          {/* Painel de informações do arquivo */}
          {attachment && (
            <AnimatedBox style={infoAnimation} component={InfoPanel} sx={{ display: showInfo ? 'block' : 'none' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {i18n.t("tasks.attachments.preview.fileInfo")}
              </Typography>
              
              <Divider sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
              
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" component="div" color="grey.400">
                  {i18n.t("tasks.attachments.preview.fileName")}
                </Typography>
                <Typography variant="body2" noWrap>
                  {attachment.originalName}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" component="div" color="grey.400">
                  {i18n.t("tasks.attachments.preview.fileType")}
                </Typography>
                <Typography variant="body2">
                  {attachment.mimeType}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" component="div" color="grey.400">
                  {i18n.t("tasks.attachments.preview.fileSize")}
                </Typography>
                <Typography variant="body2">
                  {formatFileSize(attachment.size)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" component="div" color="grey.400">
                  {i18n.t("tasks.attachments.preview.uploadDate")}
                </Typography>
                <Typography variant="body2">
                  {moment(attachment.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                </Typography>
              </Box>
              
              {attachment.uploader && (
                <Box>
                  <Typography variant="caption" component="div" color="grey.400">
                    {i18n.t("tasks.attachments.preview.uploadedBy")}
                  </Typography>
                  <Typography variant="body2">
                    {attachment.uploader.name}
                  </Typography>
                </Box>
              )}
            </AnimatedBox>
          )}
        </AnimatedBox>
        
        {/* Backdrop para estado de erro */}
        {error && (
          <Backdrop
            sx={{ color: '#fff', zIndex: 20, position: 'absolute' }}
            open={!!error}
          >
            <Paper sx={{ p: 3, maxWidth: 400, textAlign: 'center' }}>
              <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {i18n.t("tasks.attachments.preview.errorTitle")}
              </Typography>
              <Typography variant="body2" paragraph>
                {error}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button variant="outlined" onClick={onClose}>
                  {i18n.t("buttons.close")}
                </Button>
                <Button variant="contained" onClick={handleDownload}>
                  {i18n.t("buttons.download")}
                </Button>
              </Box>
            </Paper>
          </Backdrop>
        )}
      </StyledDialogContent>
    </Dialog>
  );
};

export default AttachmentPreviewModal;