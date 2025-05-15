import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import {
  Typography,
  IconButton,
  Box,
  Tooltip,
  Slider,
  CircularProgress,
  Badge,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Description as DescriptionIcon,

  Delete as DeleteIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Add as AddIcon,
  MusicNote as MusicNoteIcon,
  Videocam as VideocamIcon,
  Article as ArticleIcon,
  TableChart as TableChartIcon,
  Slideshow as SlideshowIcon,
  FolderZip as FolderZipIcon,
  InsertDriveFile as InsertDriveFileIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Crop as CropIcon,
  FilterAlt as FilterIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  FileCopy as FileCopyIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { toast } from '../../helpers/toast';
import BaseModal from '../shared/BaseModal';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
  },
  previewArea: {
    position: 'relative',
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    minHeight: 400,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    maxHeight: '70vh',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '70vh',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  },
  thumbnailsContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    overflowX: 'auto',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  thumbnailContainer: {
    position: 'relative',
    '&:hover .deleteButton': {
      opacity: 1,
    },
  },
  thumbnail: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    border: `2px solid transparent`,
    '&.active': {
      borderColor: theme.palette.primary.main,
    },
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    zIndex: 1,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
      color: 'white',
    },
  },
  addMoreButton: {
    minWidth: 60,
    height: 60,
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      '& .MuiSvgIcon-root': {
        color: theme.palette.primary.main,
      },
    },
  },
  captionInput: {
    width: '100%',
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    fontSize: 16,
    resize: 'none',
    '&:focus': {
      outline: 'none',
      borderColor: theme.palette.primary.main,
    },
  },
  bottomToolBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  navigationButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
  },
  prevButton: {
    left: theme.spacing(1),
  },
  nextButton: {
    right: theme.spacing(1),
  },
  pdfPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    '& .MuiSvgIcon-root': {
      fontSize: '64px',
      marginBottom: theme.spacing(2),
    },
  },
  imageToolbar: {
    position: 'absolute',
    bottom: theme.spacing(1),
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    transition: 'opacity 0.3s ease',
  },
  toolbarButton: {
    color: 'white',
    padding: 8,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  zoomSlider: {
    width: 120,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: 'white',
  },
  fullscreenPreview: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
  },
  closeFullscreen: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
  },
  captionOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  iconThumbnail: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.shape.borderRadius,
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
      color: theme.palette.grey[700],
    },
  },
  metadataPanel: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
  },
  metadataItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  captionCounter: {
    marginLeft: 'auto',
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
}));

const MediaPreviewModal = ({
  open,
  onClose,
  medias,
  onCaption,
  onDelete,
  onAddMore
}) => {
  const classes = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [captions, setCaptions] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [tags, setTags] = useState({});
  const [newTag, setNewTag] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [captionLimit] = useState(280); // Limite de caracteres para legendas
  const captionInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setCurrentIndex(0);
      setCaptions({});
      setZoomLevel(1);
      setIsFullscreen(false);
      setShowMetadata(false);
      setTags({});
    }
  }, [open]);

  useEffect(() => {
    // Reset zoom when changing media
    setZoomLevel(1);
  }, [currentIndex]);

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    // Limita o tamanho da legenda ao máximo definido
    if (value.length <= captionLimit) {
      setCaptions({
        ...captions,
        [currentIndex]: value
      });
    }
  };

  const handleDelete = (index) => {
    onDelete(index);
    const newCaptions = { ...captions };
    delete newCaptions[index];
    
    const newTags = { ...tags };
    delete newTags[index];
    setTags(newTags);
    
    setCaptions(newCaptions);
    if (currentIndex >= index && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("fromMe", true);
    
    medias.forEach((media, index) => {
      formData.append("medias", media);
      
      // Adiciona a legenda como body da mensagem
      const caption = captions[index] || '';
      
      // Adiciona tags à legenda se existirem
      const mediaTags = tags[index] || [];
      const tagsString = mediaTags.length > 0 ? '\n' + mediaTags.map(tag => `#${tag}`).join(' ') : '';
      
      formData.append("body", caption + tagsString);
    });
  
    onCaption(formData);
    setSnackbar({
      open: true,
      message: i18n.t("mediaInput.messages.mediaSent"),
      severity: "success"
    });
  };

  const handleKeyDown = (e) => {
    // Navegação por teclas
    if (e.key === "ArrowRight") {
      setCurrentIndex((prev) => (prev + 1) % medias.length);
    } else if (e.key === "ArrowLeft") {
      setCurrentIndex((prev) => (prev - 1 + medias.length) % medias.length);
    } else if (e.key === "Delete" && e.ctrlKey) {
      handleDelete(currentIndex);
    } else if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomChange = (_, newValue) => {
    setZoomLevel(newValue);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const downloadMedia = () => {
    if (!medias || medias.length === 0) return;
    
    const currentMedia = medias[currentIndex];
    const mediaUrl = URL.createObjectURL(currentMedia);
    
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = currentMedia.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({
      open: true,
      message: i18n.t("mediaInput.messages.downloadStarted"),
      severity: "info"
    });
  };

  const copyToClipboard = async () => {
    if (!medias || medias.length === 0) return;
    
    try {
      const currentMedia = medias[currentIndex];
      const mediaUrl = URL.createObjectURL(currentMedia);
      
      // Se for uma imagem, tenta copiar a imagem
      if (currentMedia.type.startsWith('image/')) {
        const response = await fetch(mediaUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      } else {
        // Para outros tipos, copia o nome do arquivo
        await navigator.clipboard.writeText(currentMedia.name);
      }
      
      setSnackbar({
        open: true,
        message: i18n.t("mediaInput.messages.copiedToClipboard"),
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: i18n.t("mediaInput.messages.copyFailed"),
        severity: "error"
      });
    }
  };

  const duplicateMedia = () => {
    if (!medias || medias.length === 0) return;
    
    const currentMedia = medias[currentIndex];
    
    // Não é possível duplicar diretamente um File/Blob,
    // então criamos uma cópia dele
    currentMedia.arrayBuffer().then(buffer => {
      const duplicatedFile = new File([buffer], `copy_${currentMedia.name}`, {
        type: currentMedia.type
      });
      
      // Adicionar ao final da lista
      const newMedias = [...medias, duplicatedFile];
      
      // Atualizar o estado global (simulado aqui)
      // Isso requer que você atualize o componente pai
      setSnackbar({
        open: true,
        message: i18n.t("mediaInput.messages.mediaDuplicated"),
        severity: "info"
      });
      
      // Na implementação real, você precisaria chamar uma função do componente pai
      // para atualizar a lista de medias
    });
  };

  const toggleMetadata = () => {
    setShowMetadata(prev => !prev);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = tags[currentIndex] || [];
    if (!currentTags.includes(newTag.trim())) {
      setTags({
        ...tags,
        [currentIndex]: [...currentTags, newTag.trim()]
      });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    const currentTags = tags[currentIndex] || [];
    setTags({
      ...tags,
      [currentIndex]: currentTags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPressTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const getFileMetadata = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileType = file.type;
    const fileSize = formatFileSize(file.size);
    const lastModified = new Date(file.lastModified).toLocaleString();
    
    return {
      name: file.name,
      type: fileType || `${fileExtension.toUpperCase()} file`,
      size: fileSize,
      lastModified
    };
  };

  const renderPreview = () => {
    if (!medias || medias.length === 0) return null;
  
    const currentMedia = medias[currentIndex];
    const mediaUrl = URL.createObjectURL(currentMedia);
    const fileExtension = currentMedia.name.split('.').pop().toLowerCase();
  
    // Identificar tipo de arquivo baseado no MIME ou extensão
    const isImage = currentMedia.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    const isVideo = currentMedia.type.startsWith('video/') || ['mp4', 'webm', '3gp', 'mkv', 'avi', 'mov', 'mpeg'].includes(fileExtension);
    const isAudio = currentMedia.type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(fileExtension);
    const isPDF = currentMedia.type === 'application/pdf' || fileExtension === 'pdf';
    
    // Renderização com base no tipo de arquivo
    if (isImage) {
      return (
        <div className={classes.previewContainer}>
          <img
            src={mediaUrl}
            alt={currentMedia.name}
            className={classes.imagePreview}
            style={{ transform: `scale(${zoomLevel})` }}
          />
          <div className={classes.imageToolbar}>
            <Tooltip title={i18n.t("mediaInput.buttons.zoomOut")}>
              <IconButton className={classes.toolbarButton} onClick={handleZoomOut} size="small">
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Slider
              className={classes.zoomSlider}
              value={zoomLevel}
              min={0.5}
              max={3}
              step={0.1}
              onChange={handleZoomChange}
              aria-labelledby="zoom-slider"
            />
            <Tooltip title={i18n.t("mediaInput.buttons.zoomIn")}>
              <IconButton className={classes.toolbarButton} onClick={handleZoomIn} size="small">
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("mediaInput.buttons.fullscreen")}>
              <IconButton className={classes.toolbarButton} onClick={toggleFullscreen} size="small">
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("mediaInput.buttons.download")}>
              <IconButton className={classes.toolbarButton} onClick={downloadMedia} size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("mediaInput.buttons.copy")}>
              <IconButton className={classes.toolbarButton} onClick={copyToClipboard} size="small">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      );
    } else if (isVideo) {
      return (
        <div className={classes.previewContainer}>
          <video 
            src={mediaUrl} 
            controls 
            className={classes.imagePreview}
          />
          <div className={classes.imageToolbar}>
            <Tooltip title={i18n.t("mediaInput.buttons.download")}>
              <IconButton className={classes.toolbarButton} onClick={downloadMedia} size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("mediaInput.buttons.copy")}>
              <IconButton className={classes.toolbarButton} onClick={copyToClipboard} size="small">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      );
    } else if (isAudio) {
      return (
        <div className={classes.previewContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <MusicNoteIcon style={{ fontSize: 64, marginBottom: 16 }} />
          <Typography variant="h6">{currentMedia.name}</Typography>
          <audio 
            src={mediaUrl} 
            controls 
            style={{ marginTop: 16, width: '100%', maxWidth: 400 }}
          />
          <div className={classes.imageToolbar} style={{ position: 'relative', marginTop: 16 }}>
            <Tooltip title={i18n.t("mediaInput.buttons.download")}>
              <IconButton className={classes.toolbarButton} onClick={downloadMedia} size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("mediaInput.buttons.copy")}>
              <IconButton className={classes.toolbarButton} onClick={copyToClipboard} size="small">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      );
    } else {
      // Documentos e outros tipos
      let IconComponent = DescriptionIcon;
      
      // Se quiser usar ícones específicos para diferentes tipos de arquivo
      if (['doc', 'docx'].includes(fileExtension)) IconComponent = ArticleIcon;
      else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) IconComponent = TableChartIcon;
      else if (['ppt', 'pptx'].includes(fileExtension)) IconComponent = SlideshowIcon;
      else if (['zip', 'rar', 'tar'].includes(fileExtension)) IconComponent = FolderZipIcon;
      else if (isPDF) IconComponent = PictureAsPdfIcon;
      
      return (
        <div className={classes.pdfPreview}>
          <IconComponent />
          <Typography variant="h6">{currentMedia.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {`${Math.round(currentMedia.size / 1024)} KB`}
          </Typography>
          <div className={classes.imageToolbar} style={{ position: 'relative', marginTop: 16 }}>
            <Tooltip title={i18n.t("mediaInput.buttons.download")}>
              <IconButton className={classes.toolbarButton} onClick={downloadMedia} size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("mediaInput.buttons.copy")}>
              <IconButton className={classes.toolbarButton} onClick={copyToClipboard} size="small">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      );
    }
  };

  const renderThumbnail = (media) => {
    const fileExtension = media.name.split('.').pop().toLowerCase();
    
    // Identificar tipo de arquivo
    const isImage = media.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    
    if (isImage) {
      return (
        <img
          src={URL.createObjectURL(media)}
          alt={`thumbnail`}
          className={classes.thumbnail}
        />
      );
    } else if (media.type.startsWith('video/')) {
      return (
        <div className={classes.iconThumbnail}>
          <VideocamIcon />
        </div>
      );
    } else if (media.type.startsWith('audio/')) {
      return (
        <div className={classes.iconThumbnail}>
          <MusicNoteIcon />
        </div>
      );
    } else if (media.type === 'application/pdf') {
      return (
        <div className={classes.iconThumbnail}>
          <PictureAsPdfIcon />
        </div>
      );
    } else {
      return (
        <div className={classes.iconThumbnail}>
          <InsertDriveFileIcon />
        </div>
      );
    }
  };

  // Componente para mostrar em modo de tela cheia
  const FullscreenPreview = () => {
    if (!isFullscreen || !medias || medias.length === 0) return null;
    
    const currentMedia = medias[currentIndex];
    const mediaUrl = URL.createObjectURL(currentMedia);
    const isImage = currentMedia.type.startsWith('image/');
    
    return (
      <div className={classes.fullscreenPreview} onClick={() => setIsFullscreen(false)}>
        {isImage ? (
          <img
            src={mediaUrl}
            alt={currentMedia.name}
            className={classes.fullscreenImage}
          />
        ) : currentMedia.type.startsWith('video/') ? (
          <video 
            src={mediaUrl} 
            controls 
            className={classes.fullscreenImage}
            onClick={e => e.stopPropagation()}
          />
        ) : null}
        
        <IconButton 
          className={classes.closeFullscreen}
          onClick={() => setIsFullscreen(false)}
        >
          <CloseIcon />
        </IconButton>
      </div>
    );
  };

  // Renderiza os metadados do arquivo atual
  const renderMetadata = () => {
    if (!showMetadata || !medias || medias.length === 0) return null;
    
    const currentMedia = medias[currentIndex];
    const metadata = getFileMetadata(currentMedia);
    
    return (
      <Box className={classes.metadataPanel}>
        <Typography variant="subtitle2" gutterBottom>
          {i18n.t("mediaInput.metadata.title")}
        </Typography>
        <div className={classes.metadataItem}>
          <Typography variant="body2">{i18n.t("mediaInput.metadata.name")}</Typography>
          <Typography variant="body2">{metadata.name}</Typography>
        </div>
        <div className={classes.metadataItem}>
          <Typography variant="body2">{i18n.t("mediaInput.metadata.type")}</Typography>
          <Typography variant="body2">{metadata.type}</Typography>
        </div>
        <div className={classes.metadataItem}>
          <Typography variant="body2">{i18n.t("mediaInput.metadata.size")}</Typography>
          <Typography variant="body2">{metadata.size}</Typography>
        </div>
        <div className={classes.metadataItem}>
          <Typography variant="body2">{i18n.t("mediaInput.metadata.modified")}</Typography>
          <Typography variant="body2">{metadata.lastModified}</Typography>
        </div>
      </Box>
    );
  };

  return (
    <>
      <BaseModal
        open={open && !isFullscreen}
        onClose={onClose}
        title={i18n.t("mediaInput.previewTitle")}
        maxWidth="md"
      >
        <div className={classes.modalContent} onKeyDown={handleKeyDown} tabIndex="0">
          <div className={classes.previewArea}>
            {renderPreview()}

            {medias?.length > 1 && (
              <>
                <IconButton
                  className={`${classes.navigationButton} ${classes.prevButton}`}
                  onClick={() => setCurrentIndex(prev => (prev - 1 + medias.length) % medias.length)}
                  size="small"
                >
                  <PrevIcon />
                </IconButton>
                <IconButton
                  className={`${classes.navigationButton} ${classes.nextButton}`}
                  onClick={() => setCurrentIndex(prev => (prev + 1) % medias.length)}
                  size="small"
                >
                  <NextIcon />
                </IconButton>
              </>
            )}
          </div>

          <div className={classes.thumbnailsContainer}>
            {medias.map((media, index) => (
              <div key={index} className={classes.thumbnailContainer}>
                <Badge
                  color="primary"
                  badgeContent={(tags[index] || []).length > 0 ? tags[index].length : 0}
                  invisible={(tags[index] || []).length === 0}
                >
                  <div
                    onClick={() => setCurrentIndex(index)}
                    className={`${classes.thumbnail} ${currentIndex === index ? 'active' : ''}`}
                  >
                    {renderThumbnail(media)}
                  </div>
                </Badge>
                <IconButton
                  className={`${classes.deleteButton} deleteButton`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <div className={classes.addMoreButton} onClick={onAddMore}>
              <AddIcon />
            </div>
          </div>

          {renderMetadata()}

          <div className={classes.captionOptions}>
            <Typography variant="body2">
            {i18n.t("mediaInput.captions")}
            </Typography>
            <Tooltip title={i18n.t("mediaInput.buttons.showMetadata")}>
              <IconButton onClick={toggleMetadata} size="small">
                <FileCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" className={classes.captionCounter}>
              {captions[currentIndex]?.length || 0}/{captionLimit}
            </Typography>
          </div>

          <textarea
            ref={captionInputRef}
            className={classes.captionInput}
            placeholder={i18n.t("mediaInput.caption")}
            value={captions[currentIndex] || ''}
            onChange={handleCaptionChange}
            rows={3}
            maxLength={captionLimit}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <input 
                type="text" 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPressTag}
                placeholder={i18n.t("mediaInput.addTag")}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginRight: '8px',
                  flexGrow: 1
                }}
              />
              <Tooltip title={i18n.t("mediaInput.buttons.addTag")}>
                <IconButton onClick={addTag} size="small" color="primary">
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </div>
            
            <div className={classes.tagsContainer}>
              {(tags[currentIndex] || []).map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </div>
          </div>

          <div className={classes.bottomToolBar}>
            <div>
              <Tooltip title={i18n.t("mediaInput.buttons.cancel")}>
                <IconButton onClick={onClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={i18n.t("mediaInput.buttons.duplicate")}>
                <IconButton onClick={duplicateMedia} size="small">
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
            </div>
            
            <Typography variant="body2" color="textSecondary">
              {`${currentIndex + 1}/${medias.length}`}
            </Typography>
            
            <Tooltip title={i18n.t("mediaInput.buttons.send")}>
              <IconButton onClick={handleSave} color="primary" size="small">
                <SendIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </BaseModal>
      
      {isFullscreen && <FullscreenPreview />}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MediaPreviewModal;