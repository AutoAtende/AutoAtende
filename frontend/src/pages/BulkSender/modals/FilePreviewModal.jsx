import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { i18n } from "../../../translate/i18n";

// Material UI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
  useMediaQuery,
  Paper
} from "@mui/material";

// Icons
import {
  Close as CloseIcon,
  GetApp as GetAppIcon,
  FileCopy as FileCopyIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as TextIcon,
  InsertDriveFile as DefaultFileIcon,
  AttachFile as AttachFileIcon
} from "@mui/icons-material";

const FilePreviewModal = ({ open, onClose, file }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState(null);

  // Resetar o estado de loading quando o modal é aberto ou o arquivo muda
  useEffect(() => {
    if (open && file) {
      setLoading(true);
      
      // Atualizar o conteúdo do arquivo
      const fileType = getFileType(file);
      const fileUrl = getFileUrl(file);
      
      if (!fileUrl) {
        setFileContent(renderNoPreviewContent());
        setLoading(false);
      } else if (fileType === 'Imagem') {
        setFileContent(renderImageContent(fileUrl));
        // o loading será desativado pelo onLoad da imagem
      } else if (fileType === 'PDF') {
        setFileContent(renderPdfContent(fileUrl));
        setLoading(false);
      } else {
        setFileContent(renderGenericFileContent(fileUrl));
        setLoading(false);
      }
    }
  }, [open, file]);

  // Garantir que não tentamos renderizar nada se não houver arquivo
  if (!file) {
    return null;
  }

  // Determinar o tipo de ícone com base no tipo de arquivo
  const getFileIcon = () => {
    if (!file) return <DefaultFileIcon fontSize="large" />;

    // Primeiro tentar pelo tipo MIME
    if (file.type) {
      const fileType = file.type.toLowerCase();
      
      if (fileType.includes('image')) {
        return <ImageIcon fontSize="large" color="primary" />;
      } else if (fileType.includes('pdf')) {
        return <PdfIcon fontSize="large" color="error" />;
      } else if (fileType.includes('text') || fileType.includes('document')) {
        return <TextIcon fontSize="large" color="info" />;
      }
    }
    
    // Se não tiver tipo, tentar pela extensão do nome
    if (file.name) {
      const extension = file.name.split('.').pop().toLowerCase();
      
      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return <ImageIcon fontSize="large" color="primary" />;
        case 'pdf':
          return <PdfIcon fontSize="large" color="error" />;
        case 'doc':
        case 'docx':
        case 'txt':
          return <TextIcon fontSize="large" color="info" />;
        default:
          break;
      }
    }

    return <AttachFileIcon fontSize="large" color="action" />;
  };

  // Formatação de valores para exibição
  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '-';
    
    // Converter para número se for string
    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    
    // Se ainda for inválido após a conversão
    if (isNaN(size)) return '-';
    
    if (size < 1024) {
      return `${size} B`;
    }
    
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  // Determinar o tipo de arquivo para exibição
  const getFileType = (fileObj) => {
    if (!fileObj) return i18n.t("files.table.unknownType");
    
    // Verificar tipo MIME
    if (fileObj.type) {
      const type = fileObj.type.toLowerCase();
      if (type.includes('image')) return 'Imagem';
      if (type.includes('pdf')) return 'PDF';
      if (type.includes('text')) return 'Texto';
      if (type.includes('word') || type.includes('document')) return 'Documento';
      if (type.includes('excel') || type.includes('spreadsheet')) return 'Planilha';
      if (type.includes('audio')) return 'Áudio';
      if (type.includes('video')) return 'Vídeo';
      return type;
    }
    
    // Se não tiver tipo MIME, verificar pela extensão
    if (fileObj.name) {
      const extension = fileObj.name.split('.').pop().toLowerCase();
      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return 'Imagem';
        case 'pdf':
          return 'PDF';
        case 'doc':
        case 'docx':
          return 'Documento';
        case 'xls':
        case 'xlsx':
          return 'Planilha';
        case 'txt':
          return 'Texto';
        case 'mp3':
        case 'wav':
          return 'Áudio';
        case 'mp4':
        case 'avi':
          return 'Vídeo';
        default:
          return extension.toUpperCase();
      }
    }
    
    return i18n.t("files.table.unknownType");
  };


// Construir URL do arquivo corretamente
const getFileUrl = (fileObj) => {
  if (!fileObj) return null;
  
  // Obter a URL base do backend
  // Se não estiver definido no .env, usar uma URL relativa
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
  
  // Se o arquivo tiver um caminho direto
  if (fileObj.path) {
    // Construir o caminho completo para o arquivo
    const companyPath = `company${fileObj.companyId || ""}`;
    const fileListPath = `fileList/${fileObj.fileId || fileObj.id || ""}`;
    
    // Se o caminho já tiver o caminho completo, retornar como está
    if (fileObj.path.startsWith('http')) {
      return fileObj.path;
    }
    
    // Construir caminho para acessar o arquivo no servidor
    return `${backendUrl}/public/${companyPath}/${fileListPath}/${fileObj.path}`;
  }
  
  // Se tiver uma URL completa
  if (fileObj.url) {
    return fileObj.url;
  }
  
  return null;
};

  // Componentes para diferentes tipos de conteúdo
  const renderNoPreviewContent = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      textAlign: 'center',
      gap: 2
    }}>
      {getFileIcon()}
      <Typography variant="body1" color="textSecondary">
        {i18n.t("files.preview.noPreview")}
      </Typography>
    </Box>
  );

  const renderImageContent = (url) => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100%',
      maxHeight: '60vh',
      overflow: 'hidden'
    }}>
      <img 
        src={url} 
        alt={file.name || "Visualização do arquivo"}
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%', 
          objectFit: 'contain' 
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          console.error("Erro ao carregar imagem");
        }}
      />
    </Box>
  );

  const renderPdfContent = (url) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      textAlign: 'center',
      gap: 2
    }}>
      {getFileIcon()}
      <Typography variant="body1">
        {i18n.t("files.preview.pdfMessage") || "Clique no botão abaixo para abrir o PDF"}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<GetAppIcon />}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {i18n.t("files.buttons.openPdf") || "Abrir PDF"}
      </Button>
    </Box>
  );

  const renderGenericFileContent = (url) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      textAlign: 'center',
      gap: 2
    }}>
      {getFileIcon()}
      <Typography variant="body1" color="textSecondary">
        {i18n.t("files.preview.notSupported") || "Visualização não disponível para este tipo de arquivo"}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<GetAppIcon />}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {i18n.t("files.buttons.download") || "Download"}
      </Button>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          overflow: 'hidden',
          borderRadius: theme.shape.borderRadius,
          ...(fullScreen ? {} : { height: '80vh' })
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
          {getFileIcon()}
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            {file.name || "Visualização de arquivo"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 0, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {fileContent}
        </Box>
        
        {file.message && (
          <Paper sx={{ m: 2, p: 2, bgcolor: theme.palette.background.neutral || theme.palette.grey[100] }}>
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              {i18n.t("files.preview.description") || "Descrição"}
            </Typography>
            <Typography variant="body2">
              {file.message}
            </Typography>
          </Paper>
        )}
        
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" gutterBottom>
            {i18n.t("files.preview.details") || "Detalhes do arquivo"}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip 
              icon={<FileCopyIcon />} 
              label={`${i18n.t("files.table.type") || "Tipo"}: ${getFileType(file)}`}
              variant="outlined"
              size="small"
            />
            
            <Chip 
              icon={<FileCopyIcon />} 
              label={`${i18n.t("files.table.size") || "Tamanho"}: ${formatFileSize(file.size)}`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} color="secondary">
          {i18n.t("files.buttons.close") || "Fechar"}
        </Button>
        <Button 
          startIcon={<GetAppIcon />}
          variant="contained" 
          color="primary"
          href={getFileUrl(file)}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!getFileUrl(file)}
        >
          {i18n.t("files.buttons.download") || "Download"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePreviewModal;