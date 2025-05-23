import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  Alert,
  Tabs,
  Tab,
  FormHelperText,
  Divider,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Chat as ChatIcon,
  Image as ImageIcon,
  AudioFile as AudioFileIcon,
  VideoFile as VideoFileIcon,
  Description as DocumentIcon,
  LocationOn as LocationIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';
import api from '../../../../services/api';
import { VariablesReferencePanel } from '../VariablesReferencePanel';
import { handleApiError } from '../../../../utils/api-error-handler';

const VariableHelperAdornment = ({ variables, onInsert }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInsertVariable = (variable) => {
    if (onInsert) {
      onInsert(`\${${variable}}`);
    }
    handleClose();
  };

  if (!variables || variables.length === 0) return null;

  return (
    <>
      <InputAdornment position="end">
        <Tooltip title="Inserir variável">
          <IconButton edge="end" onClick={handleClick}>
            <CodeIcon />
          </IconButton>
        </Tooltip>
      </InputAdornment>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: 250,
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="caption">Selecione uma variável</Typography>
        </MenuItem>
        <Divider />
        {variables.map((variable) => (
          <MenuItem
            key={variable.name}
            onClick={() => handleInsertVariable(variable.name)}
          >
            <ListItemIcon>
              <CodeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={variable.name}
              secondary={variable.description}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// Componente para as abas de tipo de mídia
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`message-type-tabpanel-${index}`}
      aria-labelledby={`message-type-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1, mt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MessageNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const theme = useTheme();
  const [messageType, setMessageType] = useState(nodeData.messageType || 'text');
  const [mediaUrl, setMediaUrl] = useState(nodeData.mediaUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [locationData, setLocationData] = useState({
    latitude: nodeData.latitude || '',
    longitude: nodeData.longitude || '',
    address: nodeData.address || '',
    name: nodeData.locationName || ''
  });

  useEffect(() => {
    validateForm();
  }, [nodeData.message, messageType, mediaUrl, locationData]);

  const validateForm = () => {
    const errors = {};

    if (messageType === 'text') {
      if (!nodeData.message || nodeData.message.trim() === '') {
        errors.message = "O texto da mensagem é obrigatório";
      }
    } else if (['image', 'audio', 'video', 'document'].includes(messageType)) {
      if (!mediaUrl) {
        errors.mediaUrl = `O arquivo ${messageType === 'image' ? 'de imagem' :
          messageType === 'audio' ? 'de áudio' :
            messageType === 'video' ? 'de vídeo' : 'de documento'} é obrigatório`;
      }
    } else if (messageType === 'location') {
      if (!locationData.latitude || !locationData.longitude) {
        errors.location = "Latitude e longitude são obrigatórios";
      } else if (isNaN(parseFloat(locationData.latitude)) || isNaN(parseFloat(locationData.longitude))) {
        errors.location = "Latitude e longitude devem ser valores numéricos válidos";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMessageTypeChange = (event) => {
    const newType = event.target.value;
    setMessageType(newType);

    onChange({
      ...nodeData,
      messageType: newType
    });
  };

  const handleMessageChange = (event) => {
    onChange({
      ...nodeData,
      message: event.target.value
    });
  };

  const handleLocationChange = (field, value) => {
    const updatedLocationData = {
      ...locationData,
      [field]: value
    };

    setLocationData(updatedLocationData);

    onChange({
      ...nodeData,
      latitude: updatedLocationData.latitude,
      longitude: updatedLocationData.longitude,
      address: updatedLocationData.address,
      locationName: updatedLocationData.name,
      messageType: 'location'
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar tipo de arquivo baseado no messageType
    let validType = false;
    const fileType = file.type;

    if (messageType === 'image' && fileType.startsWith('image/')) {
      validType = true;
    } else if (messageType === 'audio' && (fileType.startsWith('audio/') || fileType === 'application/ogg')) {
      validType = true;
    } else if (messageType === 'video' && fileType.startsWith('video/')) {
      validType = true;
    } else if (messageType === 'document') {
      validType = true; // Aceitamos qualquer tipo para documentos
    }

    if (!validType) {
      setUploadError(`O tipo de arquivo não é compatível com o tipo de mensagem ${messageType}`);
      return;
    }

    // Verificar tamanho (máximo 16MB)
    if (file.size > 16 * 1024 * 1024) {
      setUploadError('O arquivo é muito grande. O tamanho máximo é 16MB.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      console.log(`Enviando arquivo de ${messageType}:`, {
        nome: file.name,
        tipo: file.type,
        tamanho: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

      // Criar FormData corretamente para envio do arquivo
      const formData = new FormData();
      formData.append('media', file);
      formData.append('mediaType', messageType);
      // IMPORTANTE: Definir explicitamente o typeArch
      formData.append('typeArch', 'flowBuilder');

      const response = await api.post('/flow-builder/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log(`Resposta do upload de ${messageType}:`, response.data);

      if (response.data && response.data.url) {
        setMediaUrl(response.data.url);
        onChange({
          ...nodeData,
          mediaUrl: response.data.url,
          mediaType: messageType,
          mimeType: response.data.mimetype || file.type,
          filename: response.data.filename || file.name
        });
      }
    } catch (err) {
      console.error(`Erro detalhado do upload de ${messageType}:`, err);
      const errorMessage = handleApiError(err, `Erro ao fazer upload do ${messageType}`, false);
      setUploadError(`${errorMessage} - Detalhes: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Depois, use esse componente nos campos de texto
  const handleInsertVariable = (variableText) => {
    // Pegar o elemento de texto atual (pode ser message, caption, etc.)
    const currentElement = document.activeElement;
    if (!currentElement) return;

    // Inserir o texto da variável na posição do cursor
    const start = currentElement.selectionStart;
    const end = currentElement.selectionEnd;
    const value = currentElement.value;

    const newValue = value.substring(0, start) + variableText + value.substring(end);

    // Atualizar o valor manualmente (não acionará o evento onChange)
    currentElement.value = newValue;

    // Acionar um evento de input para garantir que o React capture a mudança
    const event = new Event('input', { bubbles: true });
    currentElement.dispatchEvent(event);

    // Reposicionar o cursor após a variável inserida
    currentElement.selectionStart = start + variableText.length;
    currentElement.selectionEnd = start + variableText.length;

    // Manter o foco no campo
    currentElement.focus();
  };

  const handleRemoveMedia = () => {
    setMediaUrl('');
    onChange({
      ...nodeData,
      mediaUrl: '',
      mediaType: messageType,
      mimeType: '',
      filename: ''
    });
  };

  // Renderiza o editor de mensagem baseado no tipo
  const renderMessageEditor = () => {
    switch (messageType) {
      case 'text':
        return (
          <>
            <TextField
              fullWidth
              label="Texto da mensagem"
              multiline
              rows={6}
              value={nodeData.message || ''}
              onChange={handleMessageChange}
              margin="normal"
              placeholder="Digite a mensagem que será enviada ao contato"
              InputProps={{
                endAdornment: (
                  <VariableHelperAdornment
                    variables={flowVariables}
                    onInsert={handleInsertVariable}
                  />
                )
              }}
            />
            <Divider sx={{ my: 3 }} />
            <VariablesReferencePanel variables={flowVariables} />

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Este nó envia uma mensagem ao contato. Você pode personalizar o texto usando variáveis
                no formato ${'{'}variavel{'}'}. O valor das variáveis será substituído quando a mensagem for enviada.
              </Typography>
            </Box>
          </>
        );

      case 'image':
      case 'audio':
      case 'video':
      case 'document':
        const mediaTypeLabel = messageType === 'image' ? 'Imagem' :
          messageType === 'audio' ? 'Áudio' :
            messageType === 'video' ? 'Vídeo' : 'Documento';

        const mediaIcon = messageType === 'image' ? <ImageIcon sx={{ fontSize: 32, opacity: 0.7, mb: 1 }} /> :
          messageType === 'audio' ? <AudioFileIcon sx={{ fontSize: 32, opacity: 0.7, mb: 1 }} /> :
            messageType === 'video' ? <VideoFileIcon sx={{ fontSize: 32, opacity: 0.7, mb: 1 }} /> :
              <DocumentIcon sx={{ fontSize: 32, opacity: 0.7, mb: 1 }} />;

        const acceptTypes = messageType === 'image' ? 'image/*' :
          messageType === 'audio' ? 'audio/*' :
            messageType === 'video' ? 'video/*' :
              '*/*';

        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {mediaTypeLabel}
            </Typography>

            {mediaUrl ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  position: 'relative',
                  borderRadius: 1,
                  overflow: 'hidden',
                  height: messageType === 'image' ? 200 : 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: uploadError ? '1px solid #f44336' : undefined
                }}
              >
                {messageType === 'image' ? (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', e);
                      setUploadError('Não foi possível carregar a imagem. Verifique se a URL está correta.');
                    }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {mediaIcon}
                    <Typography variant="body2">
                      {nodeData.filename || mediaUrl.split('/').pop() || 'Arquivo carregado'}
                    </Typography>
                  </Box>
                )}
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
                  onClick={handleRemoveMedia}
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
                  borderColor: validationErrors.mediaUrl ? '#f44336' : undefined
                }}
                disabled={uploading}
              >
                {mediaIcon}
                Selecionar {mediaTypeLabel}
                <input
                  type="file"
                  accept={acceptTypes}
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            )}

            {validationErrors.mediaUrl && (
              <FormHelperText error>{validationErrors.mediaUrl}</FormHelperText>
            )}

            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Legenda (opcional)"
              multiline
              rows={3}
              value={nodeData.caption || ''}
              onChange={(e) => onChange({ ...nodeData, caption: e.target.value })}
              margin="normal"
              placeholder={`Digite uma legenda para ${messageType === 'image' ? 'a imagem' :
                messageType === 'audio' ? 'o áudio' :
                  messageType === 'video' ? 'o vídeo' :
                    'o documento'} (opcional)`}
            />
          </Box>
        );

      case 'location':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Localização
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Latitude"
                value={locationData.latitude}
                onChange={(e) => handleLocationChange('latitude', e.target.value)}
                required
                error={!!validationErrors.location}
              />
              <TextField
                fullWidth
                label="Longitude"
                value={locationData.longitude}
                onChange={(e) => handleLocationChange('longitude', e.target.value)}
                required
                error={!!validationErrors.location}
              />
            </Box>

            {validationErrors.location && (
              <FormHelperText error>{validationErrors.location}</FormHelperText>
            )}

            <TextField
              fullWidth
              label="Nome do local (opcional)"
              value={locationData.name}
              onChange={(e) => handleLocationChange('name', e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Endereço (opcional)"
              value={locationData.address}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              margin="normal"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Você pode obter as coordenadas exatas no Google Maps clicando com o botão direito em um local e selecionando "O que há aqui?"
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return (
          <Alert severity="warning">
            Tipo de mensagem não suportado: {messageType}
          </Alert>
        );
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configuração de Mensagem
      </Typography>

      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo de mensagem</InputLabel>
        <Select
          value={messageType}
          onChange={handleMessageTypeChange}
          label="Tipo de mensagem"
        >
          <MenuItem value="text">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon fontSize="small" />
              <span>Texto</span>
            </Box>
          </MenuItem>
          <MenuItem value="image">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon fontSize="small" />
              <span>Imagem</span>
            </Box>
          </MenuItem>
          <MenuItem value="audio">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AudioFileIcon fontSize="small" />
              <span>Áudio</span>
            </Box>
          </MenuItem>
          <MenuItem value="video">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoFileIcon fontSize="small" />
              <span>Vídeo</span>
            </Box>
          </MenuItem>
          <MenuItem value="document">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DocumentIcon fontSize="small" />
              <span>Documento</span>
            </Box>
          </MenuItem>
          <MenuItem value="location">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" />
              <span>Localização</span>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {renderMessageEditor()}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {messageType === 'text' ?
            'Envie uma mensagem de texto. Você pode usar variáveis dinâmicas como {{nome}} para personalizar seus textos.' :
            messageType === 'image' ?
              'Envie uma imagem para o contato, com legenda opcional. Formatos suportados: JPG, PNG, GIF, WEBP.' :
              messageType === 'audio' ?
                'Envie um arquivo de áudio. Formatos suportados: MP3, OGG, WAV, AAC.' :
                messageType === 'video' ?
                  'Envie um arquivo de vídeo. Formatos suportados: MP4, 3GP, MOV, AVI.' :
                  messageType === 'document' ?
                    'Envie um documento. Formatos suportados: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP.' :
                    messageType === 'location' ?
                      'Envie uma localização geográfica. Insira as coordenadas de latitude e longitude, e opcionalmente o nome do local e endereço.' :
                      'Selecione o tipo de mensagem que deseja enviar.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageNodeDrawer;