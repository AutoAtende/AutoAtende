import React, { useState, useRef, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  Tooltip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Photo as PhotoIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { toast } from "../../../helpers/toast";
import { useSpring, animated } from 'react-spring';
import { AuthContext } from '../../../context/Auth/AuthContext';
import api from '../../../services/api';

const AnimatedPaper = animated(Paper);

const ImageUploader = ({
  currentImage,
  onImageUpload,
  maxSize = 1024 * 1024, // 1MB default
  acceptedTypes = ['image/jpeg', 'image/png'],
  height = 150,
  width = '100%',
  landingPageId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const { isAuth, user } = useContext(AuthContext);
  
  // Animações
  const paperAnimation = useSpring({
    to: {
      transform: dragActive ? 'scale(1.02)' : 'scale(1)',
      borderColor: dragActive ? theme.palette.primary.main : (currentImage ? 'transparent' : theme.palette.divider),
      boxShadow: dragActive ? theme.shadows[4] : theme.shadows[0]
    },
    config: { tension: 300, friction: 30 }
  });

  const imageAnimation = useSpring({
    opacity: currentImage ? 1 : 0,
    transform: currentImage ? 'scale(1)' : 'scale(0.9)',
    config: { tension: 300, friction: 40 }
  });
  
  // Handler para click no botão de upload
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Handler para arrastar e soltar arquivos
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  // Handlers para eventos de drag
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };
  
  // Handler para seleção de arquivo
  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = null;
    }
  };
  
  // Processamento de arquivo
  const handleFile = async (file) => {
    // Validar tipo de arquivo
    if (!acceptedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado. Tipos aceitos: ${acceptedTypes.join(', ')}`);
      toast.error(`Tipo de arquivo não suportado: ${file.type}`);
      return;
    }
    
    // Validar tamanho
    if (file.size > maxSize) {
      const maxSizeInMB = (maxSize / (1024 * 1024)).toFixed(2);
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`);
      toast.error(`Arquivo muito grande. Máximo: ${maxSizeInMB}MB`);
      return;
    }
    
    // Upload do arquivo
    try {
      setLoading(true);
      setError('');
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', file); //
      
      const response = await api.post(`/landing-pages/${landingPageId}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      
      // Sucesso no upload
      const imageUrl = response.data.url;
      onImageUpload(imageUrl);
      enqueueSnackbar('Imagem enviada com sucesso!', { variant: 'success' });
      
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setError('Falha ao fazer upload da imagem. Tente novamente.');
      toast.error('Falha ao fazer upload da imagem');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  // Renderização de área de upload ou imagem atual
  return (
    <Box>
      {currentImage ? (
        <AnimatedPaper 
          elevation={1} 
          style={paperAnimation}
          sx={{ 
            overflow: 'hidden',
            height,
            width,
            position: 'relative',
            borderRadius: 2
          }}
        >
          <Box 
            component="div"
            style={imageAnimation}
            sx={{ 
              height: '100%',
              width: '100%',
              backgroundImage: `url(${currentImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <Box
            position="absolute"
            top={10}
            right={10}
            display="flex"
            gap={1}
          >
            <Tooltip title="Alterar imagem">
              <IconButton
                color="primary"
                onClick={handleButtonClick}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
                size="small"
              >
                <PhotoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </AnimatedPaper>
      ) : (
        <AnimatedPaper
          elevation={0}
          variant="outlined"
          style={paperAnimation}
          sx={{
            height,
            width,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            bgcolor: dragActive ? 'action.hover' : 'background.paper',
            borderRadius: 2,
            borderStyle: 'dashed',
            borderWidth: '2px',
            transition: 'all 0.2s ease',
            p: 2
          }}
          onClick={handleButtonClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" width="100%">
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enviando imagem... {uploadProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ width: '80%', mt: 1 }}
              />
            </Box>
          ) : (
            <>
              <ImageIcon 
                fontSize="large" 
                color="primary" 
                sx={{ 
                  mb: 1,
                  fontSize: '3rem',
                  opacity: 0.7
                }} 
              />
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Arraste uma imagem ou clique para selecionar
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {acceptedTypes.map(type => type.replace('image/', '')).join(', ')} • 
                Máx. {(maxSize / (1024 * 1024)).toFixed(2)}MB
              </Typography>
              {error && (
                <Alert 
                  severity="error" 
                  variant="outlined"
                  sx={{ mt: 1, width: '100%' }}
                >
                  {error}
                </Alert>
              )}
            </>
          )}
        </AnimatedPaper>
      )}
      
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedTypes.join(',')}
      />
    </Box>
  );
};

// Componente de Box animado
const AnimatedBox = animated(Box);

export default ImageUploader;