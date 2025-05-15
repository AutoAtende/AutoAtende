import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
  FormHelperText
} from '@mui/material';
import { 
  Upload as UploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';
import { handleApiError } from '../../../utils/api-error-handler';

const ImageNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(nodeData.mediaUrl || '');
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('O arquivo selecionado não é uma imagem válida.');
      return;
    }
    
    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem é muito grande. O tamanho máximo é 10MB.');
      return;
    }
    
    setError(null);
    setUploading(true);
    
    try {
      console.log('Enviando arquivo de imagem:', {
        nome: file.name,
        tipo: file.type,
        tamanho: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

      // Criar FormData corretamente para envio do arquivo
      const formData = new FormData();
      formData.append('media', file);
      formData.append('mediaType', 'image');
      // IMPORTANTE: Definir explicitamente o typeArch
      formData.append('typeArch', 'flowBuilder');
      
      const response = await api.post('/flow-builder/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Resposta do upload de imagem:', response.data);
      
      if (response.data && response.data.url) {
        setPreview(response.data.url);
        onChange({
          ...nodeData,
          mediaUrl: response.data.url,
          mediaType: 'image',
          mimeType: response.data.mimetype || file.type
        });
      }
    } catch (err) {
      console.error('Erro detalhado do upload de imagem:', err);
      const errorMessage = handleApiError(err, 'Erro ao fazer upload da imagem', false);
      setError(`${errorMessage} - Detalhes: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setPreview('');
    onChange({
      ...nodeData,
      mediaUrl: '',
      mediaType: '',
      mimeType: ''
    });
  };
  
  const validateMedia = () => {
    if (!preview && !nodeData.mediaUrl) {
      return "É necessário selecionar uma imagem";
    }
    return null;
  };
  
  const mediaError = validateMedia();
  
  return (
    <Box sx={{ p: 2 }}>      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        InputLabelProps={{
          shrink: true,
      }}
      />
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Imagem
        </Typography>
        
        {preview ? (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1, 
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: error ? '1px solid #f44336' : undefined
            }}
          >
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                objectFit: 'contain'
              }} 
              onError={(e) => {
                console.error('Erro ao carregar imagem:', e);
                setError('Não foi possível carregar a imagem. Verifique se a URL está correta.');
              }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                }
              }}
              onClick={handleRemoveImage}
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ) : (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{ 
              height: 120, 
              borderStyle: 'dashed',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              borderColor: mediaError ? '#f44336' : undefined
            }}
            disabled={uploading}
          >
            <ImageIcon sx={{ fontSize: 32, opacity: 0.7, mb: 1 }} />
            Selecionar Imagem
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        )}
        
        {mediaError && (
          <FormHelperText error>{mediaError}</FormHelperText>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      
      <TextField
        fullWidth
        label="Legenda"
        multiline
        rows={3}
        value={nodeData.caption || ''}
        onChange={(e) => onChange({ ...nodeData, caption: e.target.value })}
        margin="normal"
        placeholder="Digite uma legenda para a imagem (opcional)"
        InputLabelProps={{
          shrink: true,
      }}
      />
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          A imagem será enviada ao contato junto com a legenda (se preenchida).
          Formatos suportados: JPG, PNG, GIF e WebP.
          Tamanho máximo: 10MB.
        </Typography>
      </Box>
    </Box>
  );
};

export default ImageNodeDrawer;