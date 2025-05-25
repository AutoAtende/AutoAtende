import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Divider,
  Dialog,
  DialogContent,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  FileOpenOutlined as FileIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  InsertLink as LinkIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  CheckOutlined as CheckIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { toast } from "../../../helpers/toast";
import { useSpring, animated } from 'react-spring';
import { AuthContext } from '../../../context/Auth/AuthContext';
import api from '../../../services/api';

const AnimatedCard = animated(Card);

// Componente para exibir o ícone correto baseado no tipo de arquivo
const FileTypeIcon = ({ mimeType, fontSize = 'large' }) => {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon fontSize={fontSize} />;
  } else if (mimeType === 'application/pdf') {
    return <PdfIcon fontSize={fontSize} />;
  } else if (mimeType.startsWith('video/')) {
    return <VideoIcon fontSize={fontSize} />;
  } else {
    return <FileIcon fontSize={fontSize} />;
  }
};

// Componente para previsualisar arquivos
const FilePreview = ({ file, onClose, onDelete, landingPageId }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { isAuth, user } = useContext(AuthContext);  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });
  
  // Função para copiar URL para clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.url)
      .then(() => {
        toast.success('URL copiada para a área de transferência');
      })
      .catch(err => {
        console.error('Erro ao copiar URL:', err);
        toast.error('Erro ao copiar URL');
      });
  };
  
  // Função para excluir o arquivo
  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/landing-pages/${landingPageId}/media/${file.id}?fileName=${encodeURIComponent(file.name)}`);
      toast.success('Arquivo excluído com sucesso');
      onDelete(file.id);
      onClose();
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast.error('Erro ao excluir arquivo');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <animated.div style={fadeIn}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {file.name || 'Visualizar arquivo'}
        </Typography>
        <Box>
          <Chip
            icon={<FileTypeIcon mimeType={file.mimeType} fontSize="small" />}
            label={file.mimeType}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>
      
      <Box display="flex" flexDirection="column" alignItems="center">
        {file.mimeType.startsWith('image/') ? (
          <Box 
            component="img" 
            src={file.url} 
            alt={file.name}
            sx={{ 
              maxWidth: '100%', 
              maxHeight: '500px',
              objectFit: 'contain',
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`
            }}
          />
        ) : file.mimeType === 'application/pdf' ? (
          <Box
            component="iframe"
            src={file.url}
            sx={{
              width: '100%',
              height: '500px',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}
          />
        ) : file.mimeType.startsWith('video/') ? (
          <Box
            component="video"
            controls
            sx={{
              width: '100%',
              maxHeight: '500px',
              borderRadius: 1
            }}
          >
            <source src={file.url} type={file.mimeType} />
            Seu navegador não suporta o elemento de vídeo.
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" p={4}>
            <FileTypeIcon mimeType={file.mimeType} fontSize="large" sx={{ fontSize: '4rem', color: 'primary.main', opacity: 0.8 }} />
            <Typography variant="body1" mt={2}>
              Este tipo de arquivo não pode ser previsualisado
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LinkIcon />}
              onClick={() => window.open(file.url, '_blank')}
              sx={{ mt: 2 }}
            >
              Abrir arquivo
            </Button>
          </Box>
        )}
        
        <Box width="100%" mt={3}>
          <TextField
            fullWidth
            label="URL do arquivo"
            value={file.url}
            variant="outlined"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Copiar URL">
                    <IconButton
                      edge="end"
                      onClick={handleCopyUrl}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box width="100%" mt={2} p={2} bgcolor="background.paper" borderRadius={1} border={`1px solid ${theme.palette.divider}`}>
          <Typography variant="subtitle2" gutterBottom fontWeight={500}>
            Detalhes do arquivo:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Nome:</strong> {file.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Tamanho:</strong> {(file.size / 1024).toFixed(2)} KB
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Data de upload:</strong> {new Date(file.createdAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Box display="flex" justifyContent="space-between" width="100%" mt={3}>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleDelete}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Excluindo...' : 'Excluir arquivo'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </Box>
      </Box>
    </animated.div>
  );
};

const FileManager = ({ 
  allowedTypes = ['image/*', 'application/pdf'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  multipleSelection = false,
  onFileSelect = null,
  landingPageId = null // Parâmetro obrigatório para as rotas!
}) => {
  // Verificação para landingPageId obrigatório
  if (!landingPageId) {
    console.error('FileManager: landingPageId é obrigatório para as operações do gerenciador de arquivos');
  }

  // Endpoints corretos que utilizam o landingPageId
  const uploadEndpoint = `/landing-pages/${landingPageId}/media/upload`;
  const listEndpoint = `/landing-pages/${landingPageId}/media`;
  const deleteEndpoint = `/landing-pages/${landingPageId}/media`;
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: loading ? 0 : 1 },
    config: { tension: 280, friction: 60 }
  });
  
  // Carregar lista de arquivos
  const loadFiles = async () => {
    if (!landingPageId) {
      toast.error('ID da landing page não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let queryParams = '';
      if (searchTerm) {
        queryParams += `search=${encodeURIComponent(searchTerm)}&`;
      }
      if (fileType !== 'all') {
        queryParams += `type=${fileType}&`;
      }
      
      const response = await api.get(`${listEndpoint}${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`);
      setFiles(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar arquivos na inicialização e quando os filtros mudarem
  useEffect(() => {
    if (landingPageId) {
      loadFiles();
    }
  }, [searchTerm, fileType, landingPageId]);
  
  // Função para fazer upload de arquivos
  const handleFileUpload = async (event) => {
    if (!landingPageId) {
      toast.error('ID da landing page não fornecido');
      return;
    }

    const selectedFiles = event.target.files;
    
    if (!selectedFiles.length) return;
    
    // Verificar cada arquivo antes de fazer upload
    const filesToUpload = Array.from(selectedFiles).filter(file => {
      // Verificar tamanho
      if (file.size > maxFileSize) {
        const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
        toast.error(`Arquivo ${file.name} excede o tamanho máximo de ${maxSizeMB}MB`);
        return false;
      }
      
      // Verificar tipo
      let isAllowedType = false;
      for (const type of allowedTypes) {
        if (type.endsWith('/*')) {
          // Para wildcards como 'image/*'
          const generalType = type.split('/')[0];
          isAllowedType = file.type.startsWith(`${generalType}/`);
        } else {
          // Para tipos específicos
          isAllowedType = file.type === type;
        }
        
        if (isAllowedType) break;
      }
      
      if (!isAllowedType) {
        toast.error(`Tipo de arquivo não suportado: ${file.type}`);
        return false;
      }
      
      return true;
    });
    
    if (!filesToUpload.length) return;
    
    try {
      setUploading(true);
      
      const uploadPromises = filesToUpload.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('landingPageId', landingPageId);
        formData.append('typeArch', "landingPage");
        
        return api.post(uploadEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      });
      
      const results = await Promise.all(uploadPromises);
      
      toast.success(`${results.length} arquivo(s) enviado(s) com sucesso`);
      
      // Recarregar lista de arquivos
      loadFiles();
      
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      event.target.value = null;
      
    } catch (error) {
      console.error('Erro ao fazer upload de arquivos:', error);
      toast.error('Erro ao fazer upload de arquivos');
    } finally {
      setUploading(false);
    }
  };
  
  // Função para abrir o diálogo de seleção de arquivo
  const openFileDialog = () => {
    fileInputRef.current.click();
  };
  
  // Função para remover um arquivo da lista após exclusão
  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Filtrar arquivos por tipo
  const handleFileTypeChange = (event, newValue) => {
    setFileType(newValue);
  };

  // Alternar modo de visualização
  const handleToggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };
  
  // Renderizar card para cada arquivo
  const renderFileCard = (file, index) => {
    const isImage = file.mimeType.startsWith('image/');
    
    return (
      <AnimatedCard 
        key={file.id} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4]
          },
          borderRadius: 2
        }}
        style={{
          ...fadeIn,
          delay: index * 50
        }}
      >
        <Box 
          sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: isImage ? 'transparent' : 'background.neutral',
            overflow: 'hidden',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            position: 'relative'
          }}
        >
          {isImage ? (
            <CardMedia
              component="img"
              height="140"
              image={file.url}
              alt={file.name}
              sx={{ objectFit: 'cover' }}
            />
          ) : (
            <FileTypeIcon mimeType={file.mimeType} sx={{ fontSize: '3rem', color: 'primary.main', opacity: 0.7 }} />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, pt: 2 }}>
          <Tooltip title={file.name}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
              {file.name}
            </Typography>
          </Tooltip>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Typography variant="caption" color="textSecondary">
              {new Date(file.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
        </CardContent>
        <Divider />
        <CardActions>
          <Button 
            size="small" 
            startIcon={<SearchIcon fontSize="small" />}
            onClick={() => setSelectedFile(file)}
          >
            Visualizar
          </Button>
          {onFileSelect && (
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => onFileSelect(file)}
              sx={{ ml: 'auto' }}
            >
              Selecionar
            </Button>
          )}
        </CardActions>
      </AnimatedCard>
    );
  };

  // Renderizar item de lista para cada arquivo
  const renderFileListItem = (file, index) => {
    const isImage = file.mimeType.startsWith('image/');
    
    return (
      <AnimatedCard 
        key={file.id} 
        sx={{ 
          mb: 1,
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
        style={{
          ...fadeIn,
          delay: index * 50
        }}
      >
        <Box display="flex" alignItems="center" p={1}>
          <Box 
            sx={{ 
              width: 60, 
              height: 60, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 1,
              overflow: 'hidden',
              mr: 2,
              bgcolor: isImage ? 'transparent' : 'action.hover'
            }}
          >
            {isImage ? (
              <Box
                component="img"
                src={file.url}
                alt={file.name}
                sx={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <FileTypeIcon mimeType={file.mimeType} />
            )}
          </Box>
          
          <Box flex={1} overflow="hidden">
            <Typography variant="subtitle2" noWrap title={file.name}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              {new Date(file.createdAt).toLocaleDateString()} • {(file.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
          <Button 
              size="small" 
              variant="outlined"
              onClick={() => setSelectedFile(file)}
            >
              Visualizar
            </Button>
            
            {onFileSelect && (
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={() => onFileSelect(file)}
                sx={{ ml: 1 }}
              >
                Selecionar
              </Button>
            )}
          </Box>
        </Box>
      </AnimatedCard>
    );
  };
  
  return (
    <Box>
      {!landingPageId ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro: O parâmetro landingPageId é obrigatório para o funcionamento correto do gerenciador de arquivos.
        </Alert>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={500} sx={{ display: 'flex', alignItems: 'center' }}>
              <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
              Gerenciador de Arquivos
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
              onClick={openFileDialog}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Enviar Arquivo'}
            </Button>
            
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple={multipleSelection}
              accept={allowedTypes.join(',')}
            />
          </Box>
          
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              placeholder="Buscar arquivos..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ flex: 1, mr: 2 }}
            />
            
            <Tooltip title={viewMode === 'grid' ? 'Visualizar em lista' : 'Visualizar em grade'}>
              <IconButton onClick={handleToggleViewMode} color="primary" sx={{ mr: 1 }}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Atualizar">
              <IconButton onClick={loadFiles} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
            <Tabs
              value={fileType}
              onChange={handleFileTypeChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Todos" value="all" />
              <Tab label="Imagens" value="image" icon={<ImageIcon />} iconPosition="start" />
              <Tab label="Documentos" value="document" icon={<PdfIcon />} iconPosition="start" />
              <Tab label="Vídeos" value="video" icon={<VideoIcon />} iconPosition="start" />
            </Tabs>
          </Paper>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : files.length > 0 ? (
            viewMode === 'grid' ? (
              <Grid container spacing={2}>
                {files.map((file, index) => (
                  <Grid item xs={12} sm={6} md={3} key={file.id}>
                    {renderFileCard(file, index)}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                {files.map((file, index) => renderFileListItem(file, index))}
              </Box>
            )
          ) : (
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f9f9f9',
                borderRadius: 2 
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhum arquivo encontrado.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Clique em "Enviar Arquivo" para adicionar um novo arquivo.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onClick={openFileDialog}
                  sx={{ mt: 1 }}
                >
                  Enviar Arquivo
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Diálogo de visualização de arquivo */}
          <Dialog 
            open={!!selectedFile} 
            maxWidth="md" 
            fullWidth 
            onClose={() => setSelectedFile(null)}
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogContent>
              {selectedFile && (
                <FilePreview
                  file={selectedFile}
                  onClose={() => setSelectedFile(null)}
                  onDelete={handleRemoveFile}
                  landingPageId={landingPageId}
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default FileManager;