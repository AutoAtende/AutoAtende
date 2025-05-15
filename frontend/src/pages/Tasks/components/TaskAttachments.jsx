// TaskAttachments.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  LinearProgress,
  Tooltip,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider,
  Fade,
  Badge,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
  FileCopy as FileCopyIcon,
  SortByAlpha as SortIcon,
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";
import { canPreview, formatFileSize } from './TaskUtils';

// Tamanho máximo de arquivo permitido (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Tipos de arquivos permitidos
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Componentes estilizados
const AnimatedBox = animated(Box);

const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderStyle: 'dashed',
  borderWidth: 2,
  borderColor: theme.palette.divider,
  display: 'flex',
  flexDirection: 'column',
// TaskAttachments.jsx (continuação)
alignItems: 'center',
justifyContent: 'center',
cursor: 'pointer',
transition: 'all 0.3s ease',
'&:hover': {
  borderColor: theme.palette.primary.main,
  backgroundColor: theme.palette.action.hover,
}
}));

const FileItemContainer = styled(ListItem)(({ theme, isdragging, ispreviewable }) => ({
marginBottom: theme.spacing(1),
borderRadius: theme.shape.borderRadius,
backgroundColor: theme.palette.background.paper,
transition: 'all 0.2s ease',
cursor: ispreviewable === 'true' ? 'pointer' : 'default',
'&:hover': {
  backgroundColor: theme.palette.action.hover,
  transform: 'translateY(-2px)',
  boxShadow: theme.shadows[1],
},
}));

const TaskAttachments = ({ taskId, canDelete, disabled, onPreviewClick }) => {
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const { user } = useContext(AuthContext);
const socketManager = useContext(SocketContext);

// Estados
const [attachments, setAttachments] = useState([]);
const [loading, setLoading] = useState(true);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [error, setError] = useState(null);
const [menuAnchorEl, setMenuAnchorEl] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);
const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'nameAsc', 'nameDesc', 'sizeAsc', 'sizeDesc'
const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
const [dragActive, setDragActive] = useState(false);

// Animações
const fadeIn = useSpring({
  from: { opacity: 0 },
  to: { opacity: 1 },
  config: { duration: 300 }
});

const dragAnimation = useSpring({
  borderColor: dragActive ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: dragActive ? `${theme.palette.primary.light}20` : 'transparent',
  transform: dragActive ? 'scale(1.02)' : 'scale(1)',
});

// Handler para erros da API
const handleApiError = (error) => {
  if (error.response?.data?.details) {
    return error.response.data.details;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return 'Erro ao comunicar com o servidor. Tente novamente.';
};

// Buscar anexos da tarefa
const fetchAttachments = async () => {
  if (!taskId) return;

  setLoading(true);
  try {
    const { data } = await api.get(`/task/${taskId}/attachments`);
    
    // Ordenar os anexos conforme a preferência
    const sortedAttachments = sortAttachments(data);
    setAttachments(sortedAttachments);
    setError(null);
  } catch (err) {
    const errorMessage = handleApiError(err);
    console.error('Erro ao buscar anexos:', errorMessage);
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

// Configurar escuta de socket para atualizações em tempo real
useEffect(() => {
  const companyId = localStorage.getItem("companyId");
  const socket = socketManager.GetSocket(companyId);
  
  const handleTaskUpdate = (data) => {
    if (data.taskId !== taskId) return;
    
    if (data.type === 'task-attachment-added' || 
        data.type === 'task-attachment-deleted') {
      fetchAttachments();
    }
  };

  socket?.on('task-update', handleTaskUpdate);
  return () => socket?.off('task-update', handleTaskUpdate);
}, [socketManager, taskId]);

// Buscar dados iniciais
useEffect(() => {
  if (taskId) {
    fetchAttachments();
  }
}, [taskId]);

// Ordenar os anexos
const sortAttachments = (files) => {
  const filesArray = Array.isArray(files) ? [...files] : [];
  
  switch (sortOrder) {
    case 'newest':
      return filesArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return filesArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'nameAsc':
      return filesArray.sort((a, b) => a.originalName.localeCompare(b.originalName));
    case 'nameDesc':
      return filesArray.sort((a, b) => b.originalName.localeCompare(a.originalName));
    case 'sizeAsc':
      return filesArray.sort((a, b) => a.size - b.size);
    case 'sizeDesc':
      return filesArray.sort((a, b) => b.size - a.size);
    default:
      return filesArray;
  }
};

// Handlers para upload de arquivos
const handleUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // Validar tamanho do arquivo
  if (file.size > MAX_FILE_SIZE) {
    toast.error(i18n.t("tasks.attachments.fileTooLarge", { 
      size: formatFileSize(MAX_FILE_SIZE) 
    }));
    return;
  }
  
  // Validar tipo de arquivo
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error(i18n.t("tasks.attachments.fileTypeNotAllowed"));
    return;
  }
  
  uploadFile(file);
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(true);
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  
  const file = e.dataTransfer.files?.[0];
  if (!file) return;
  
  // Validar tamanho do arquivo
  if (file.size > MAX_FILE_SIZE) {
    toast.error(i18n.t("tasks.attachments.fileTooLarge", { 
      size: formatFileSize(MAX_FILE_SIZE) 
    }));
    return;
  }
  
  // Validar tipo de arquivo
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error(i18n.t("tasks.attachments.fileTypeNotAllowed"));
    return;
  }
  
  uploadFile(file);
};

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  setUploading(true);
  setUploadProgress(0);

  try {
    await api.post(`/task/${taskId}/attachments`, formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      }
    });
    
    toast.success(i18n.t("tasks.attachments.uploaded"));
    await fetchAttachments();
  } catch (err) {
    const errorMessage = handleApiError(err);
    toast.error(errorMessage);
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};

// Handlers para ações com arquivos
const handleDownload = (attachment) => {
  const downloadUrl = `${process.env.REACT_APP_BACKEND_URL}/public/${user.companyId}/${attachment.filename}`;
  window.open(downloadUrl, '_blank');
  handleCloseMenu();
};

const handleDelete = async (attachmentId) => {
  try {
    await api.delete(`/task/${taskId}/attachments/${attachmentId}`);
    toast.success(i18n.t("tasks.attachments.deleted"));
    await fetchAttachments();
  } catch (err) {
    const errorMessage = handleApiError(err);
    console.error('Erro ao deletar anexo:', errorMessage);
    toast.error(errorMessage);
  }
  handleCloseMenu();
};

const handleOpenMenu = (event, file) => {
  event.stopPropagation();
  setSelectedFile(file);
  setMenuAnchorEl(event.currentTarget);
};

const handleCloseMenu = () => {
  setSelectedFile(null);
  setMenuAnchorEl(null);
};

const handleOpenSortMenu = (event) => {
  setSortMenuAnchor(event.currentTarget);
};

const handleCloseSortMenu = () => {
  setSortMenuAnchor(null);
};

const handleSort = (order) => {
  setSortOrder(order);
  const sortedAttachments = sortAttachments(attachments);
  setAttachments(sortedAttachments);
  handleCloseSortMenu();
};

// Obter ícone para o tipo de arquivo
const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) {
    return <ImageIcon color="primary" />;
  }
  if (mimeType === 'application/pdf') {
    return <PdfIcon color="error" />;
  }
  if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
    return <FileIcon sx={{ color: theme.palette.success.main }} />;
  }
  if (mimeType?.includes('document') || mimeType?.includes('word')) {
    return <FileIcon sx={{ color: theme.palette.info.main }} />;
  }
  return <FileIcon color="action" />;
};

// Renderização baseada em estado
if (loading && attachments.length === 0) {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

if (error) {
  return (
    <Fade in={true}>
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={fetchAttachments}
          >
            <RefreshIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {error}
      </Alert>
    </Fade>
  );
}

return (
  <AnimatedBox style={fadeIn}>
    {!disabled && (
      <>
        <input
          accept={ALLOWED_TYPES.join(',')}
          style={{ display: 'none' }}
          id={`attachment-upload-${taskId}`}
          type="file"
          onChange={handleUpload}
          disabled={uploading}
        />
        
        <label htmlFor={`attachment-upload-${taskId}`}>
          <AnimatedBox
            component={UploadContainer}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={dragAnimation}
          >
            <CloudUploadIcon 
              color="primary" 
              sx={{ 
                fontSize: isMobile ? 36 : 48, 
                mb: 1,
                opacity: uploading ? 0.5 : 1 
              }} 
            />
            
            {!uploading ? (
              <>
                <Typography variant="subtitle1" gutterBottom align="center">
                  {i18n.t("tasks.attachments.dropFiles")}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  {i18n.t("tasks.attachments.clickToUpload")}
                </Typography>
                <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1 }}>
                  {i18n.t("tasks.attachments.allowedTypes")}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="subtitle1" gutterBottom align="center">
                  {i18n.t("tasks.attachments.uploading")}
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 300, mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              </>
            )}
          </AnimatedBox>
        </label>
      </>
    )}

    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="medium">
        {i18n.t("tasks.attachments.title")} 
        {attachments.length > 0 && (
          <Chip 
            size="small" 
            label={attachments.length} 
            sx={{ ml: 1 }}
            color="primary"
          />
        )}
      </Typography>
      
      {attachments.length > 0 && (
        <Tooltip title={i18n.t("tasks.attachments.sort")}>
          <IconButton size="small" onClick={handleOpenSortMenu}>
            <SortIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>

    {attachments.length === 0 ? (
      <Paper 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.default,
          borderRadius: theme.shape.borderRadius,
          border: `1px dashed ${theme.palette.divider}`
        }}
      >
        <FileCopyIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography color="textSecondary" align="center">
          {i18n.t("tasks.attachments.empty")}
        </Typography>
      </Paper>
    ) : (
      <List sx={{ mt: 1 }}>
        {attachments.map((file) => (
          <FileItemContainer
            key={file.id}
            ispreviewable={canPreview(file.mimeType).toString()}
            onClick={() => canPreview(file.mimeType) && onPreviewClick && onPreviewClick(file)}
          >
            <ListItemIcon>
              {getFileIcon(file.mimeType)}
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {file.originalName}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {file.uploader?.name && (
                      <Tooltip title={i18n.t("tasks.attachments.uploadedBy")}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              fontSize: '0.6rem',
                              marginRight: 0.5,
                              bgcolor: theme.palette.primary.main
                            }}
                          >
                            {file.uploader.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="caption" color="textSecondary" noWrap>
                            {file.uploader.name}
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                    
                    <Tooltip title={moment(file.createdAt).format('DD/MM/YYYY HH:mm:ss')}>
                      <Typography variant="caption" color="textSecondary">
                        {moment(file.createdAt).fromNow()}
                      </Typography>
                    </Tooltip>
                    
                    <Typography variant="caption" color="textSecondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                  
                  {canPreview(file.mimeType) && (
                    <Typography 
                      variant="caption" 
                      color="primary"
                      sx={{ mt: 0.5, display: 'inline-block' }}
                    >
                      {i18n.t("tasks.attachments.clickToPreview")}
                    </Typography>
                  )}
                </Box>
              }
            />
            
            <ListItemSecondaryAction onClick={(e) => e.stopPropagation()}>
              <Tooltip title={i18n.t("buttons.download")}>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  sx={{ mr: 1 }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              {canDelete && (
                <Tooltip title={i18n.t("buttons.delete")}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {isMobile && (
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => handleOpenMenu(e, file)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </FileItemContainer>
        ))}
      </List>
    )}

    {/* Menu de contexto */}
    <Menu
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={handleCloseMenu}
    >
      <MenuItem onClick={() => handleDownload(selectedFile)}>
        <ListItemIcon>
          <DownloadIcon fontSize="small" />
        </ListItemIcon>
        {i18n.t("buttons.download")}
      </MenuItem>
      
      {canDelete && (
        <MenuItem 
          onClick={() => handleDelete(selectedFile?.id)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          {i18n.t("buttons.delete")}
        </MenuItem>
      )}
      
      {canPreview(selectedFile?.mimeType) && onPreviewClick && (
        <MenuItem onClick={() => {
          handleCloseMenu();
          onPreviewClick(selectedFile);
        }}>
          <ListItemIcon>
            {selectedFile?.mimeType?.startsWith('image/') ? (
              <ImageIcon fontSize="small" color="primary" />
            ) : (
              <PdfIcon fontSize="small" color="error" />
            )}
          </ListItemIcon>
          {i18n.t("tasks.attachments.preview")}
        </MenuItem>
      )}
    </Menu>
    
    {/* Menu de ordenação */}
    <Menu
      anchorEl={sortMenuAnchor}
      open={Boolean(sortMenuAnchor)}
      onClose={handleCloseSortMenu}
    >
      <MenuItem 
        onClick={() => handleSort('newest')}
        selected={sortOrder === 'newest'}
      >
        {i18n.t("tasks.attachments.sort.newest")}
      </MenuItem>
      <MenuItem 
        onClick={() => handleSort('oldest')}
        selected={sortOrder === 'oldest'}
      >
        {i18n.t("tasks.attachments.sort.oldest")}
      </MenuItem>
      <Divider />
      <MenuItem 
        onClick={() => handleSort('nameAsc')}
        selected={sortOrder === 'nameAsc'}
      >
        {i18n.t("tasks.attachments.sort.nameAsc")}
      </MenuItem>
      <MenuItem 
        onClick={() => handleSort('nameDesc')}
        selected={sortOrder === 'nameDesc'}
      >
        {i18n.t("tasks.attachments.sort.nameDesc")}
      </MenuItem>
      <Divider />
      <MenuItem 
        onClick={() => handleSort('sizeAsc')}
        selected={sortOrder === 'sizeAsc'}
      >
        {i18n.t("tasks.attachments.sort.sizeAsc")}
      </MenuItem>
      <MenuItem 
        onClick={() => handleSort('sizeDesc')}
        selected={sortOrder === 'sizeDesc'}
      >
        {i18n.t("tasks.attachments.sort.sizeDesc")}
      </MenuItem>
    </Menu>
  </AnimatedBox>
);
};

export default TaskAttachments;