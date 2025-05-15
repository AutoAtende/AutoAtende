import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Avatar,
  AvatarGroup,
  Menu,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Send,
  AttachFile,
  Mic,
  Stop,
  PictureAsPdf,
  Download,
  Info as InfoIcon
} from '@mui/icons-material';
import { SocketContext } from '../../context/Socket/SocketContext';
import { AuthContext } from '../../context/Auth/AuthContext';
import { toast } from '../../helpers/toast';
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const ChatMessages = ({ 
  chat, 
  messages, 
  onSendMessage,
  loading, 
  handleLoadMore,
  pageInfo 
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participantsAnchor, setParticipantsAnchor] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);
  const messageListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  // Efeito para rolagem automática quando novas mensagens são recebidas
  useEffect(() => {
    if (messages?.length && !loading) {
      scrollToBottom();
    }
  }, [messages?.length, loading]);

  useEffect(() => {
    if (chat?.id) {
      // Certifique-se de que chat.users está carregado corretamente
      console.log("Participantes do chat:", chat.users);
    }
  }, [chat]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('media', file);
      formData.append('typeArch', 'internalChat'); // Explicitamente adicionar typeArch
      
      // Determinar o tipo de mídia com base no MIME type
      let messageType = 'file';
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      } else if (file.type.startsWith('audio/')) {
        messageType = 'audio';
      }
      
      formData.append('messageType', messageType);
      
      const { data } = await api.post(`/chats/${chat.id}/messages`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
  
      // Limpa o input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      scrollToBottom();
    } catch (error) {
      console.error(error);
      setUploadError(i18n.t('chat.errors.uploadFailed'));
      toast.error(i18n.t('chat.errors.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return '';
    
    // Se já for uma URL completa
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }
    
    // Se o caminho for relativo
    const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
    const baseUrlWithoutTrailingSlash = baseUrl.endsWith('/') 
      ? baseUrl.slice(0, -1) 
      : baseUrl;
    
    if (mediaPath.startsWith('/')) {
      return `${baseUrlWithoutTrailingSlash}${mediaPath}`;
    }
    
    return `${baseUrlWithoutTrailingSlash}/${mediaPath}`;
  };

  // Gravação de áudio com melhor gestão de estado
  const startRecording = useCallback(async () => {
    try {
      setAudioChunks([]); // Limpa chunks antigos antes de iniciar
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      let chunks = []; // Array local para evitar problemas de concorrência
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
  
      recorder.onstop = async () => {
        setAudioChunks(chunks); // Atualiza uma única vez após a gravação
        
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('media', audioBlob, 'audio.wav');
        formData.append('typeArch', 'internalChat');
        formData.append('messageType', 'audio');
        
        try {
          setIsUploading(true);
          await api.post(`/chats/${chat.id}/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          scrollToBottom();
        } catch (error) {
          console.error(error);
          toast.error(i18n.t('chat.errors.audioSendFailed'));
        } finally {
          setIsUploading(false);
          chunks = []; // Limpa os chunks após envio
        }
      };
  
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t('chat.errors.microphoneAccessDenied'));
    }
  }, [chat.id]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null); // Limpa o objeto mediaRecorder
    }
  }, [mediaRecorder, isRecording]);

  // Scroll otimizado com throttling para melhor performance
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    if (scrollTop < 100 && pageInfo?.hasMore && !loading) {
      handleLoadMore();
    }
  }, [pageInfo, loading, handleLoadMore]);

  // Envio de mensagens com validação adequada
  const handleSendMessage = async (text) => {
    if (!text.trim() || loading || isUploading) return;
    
    try {
      // Guarda o texto antes de limpar o input
      const messageText = text.trim();
      
      // Limpa o input antes para melhor UX
      setMessage('');
      
      // Chama a função de envio passada pelo componente pai
      if (typeof onSendMessage === 'function') {
        await onSendMessage(messageText);
      } else {
        // Fallback se onSendMessage não for fornecido
        await api.post(`/chats/${chat.id}/messages`, {
          message: messageText,
          messageType: 'text'
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(i18n.t('chat.errors.messageSendFailed'));
      setMessage(text); // Restaura a mensagem em caso de erro
    }
  };

  // UI dos participantes
  const handleParticipantsClick = (event) => {
    setParticipantsAnchor(event.currentTarget);
    setShowParticipants(true);
  };

  const handleParticipantsClose = () => {
    setParticipantsAnchor(null);
    setShowParticipants(false);
  };

  // Função para exportar o chat
  const handleExportChat = async () => {
    try {
      setIsExporting(true);
      const response = await api.get(`/chats/${chat.id}/export`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chat-${chat.title}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(i18n.t('chat.success.exported'));
      setShowExportDialog(false);
    } catch (error) {
      console.error(error);
      toast.error(i18n.t('chat.errors.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  // Limpa recursos no desmonte do componente
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);


  const handleMediaError = (e, type) => {
    console.error(`Erro ao carregar ${type}:`, e);
    
    // Oculta o elemento com erro
    e.target.style.display = 'none';
    
    // Remove qualquer fallback existente antes de adicionar um novo
    const existingFallback = e.target.nextElementSibling;
    if (existingFallback && existingFallback.classList.contains('media-fallback')) {
      existingFallback.remove();
    }
    
    // Adiciona um elemento de fallback
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'media-fallback';
    fallbackDiv.style.padding = '1rem';
    fallbackDiv.style.border = '1px dashed #ccc';
    fallbackDiv.style.borderRadius = '4px';
    fallbackDiv.style.textAlign = 'center';
    fallbackDiv.innerText = i18n.t(`chat.errors.${type}LoadFailed`);
    
    // Log mais detalhado para depuração
    console.log(`URL da mídia que falhou: ${e.target.src || e.target.currentSrc}`);
    
    e.target.parentNode.appendChild(fallbackDiv);
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      {/* Header com participantes */}
      <Box 
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6">{chat.title}</Typography>
          <Tooltip title={i18n.t('chat.participants')}>
            <IconButton onClick={handleParticipantsClick} size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <AvatarGroup max={3} sx={{ ml: 2 }}>
  {chat.users?.map(user => {
    if (!user) return null;
    
    const userName = user.user?.name || user.name || "Usuário";
    const userId = user.userId || user.id || `temp-${Math.random().toString(36).substring(7)}`;
    
    return (
      <Avatar 
        key={userId}
        sx={{ width: 30, height: 30 }}
        alt={userName}
      >
        {userName.charAt(0)}
      </Avatar>
    );
  })}
</AvatarGroup>
        </Box>

        <IconButton onClick={() => setShowExportDialog(true)}>
          <PictureAsPdf />
        </IconButton>
      </Box>

      {/* Lista de mensagens */}
      <Box
        ref={messageListRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: '3px'
          }
        }}
      >
        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.senderId === user.id ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                bgcolor: msg.senderId === user.id ? 'primary.main' : 'grey.100',
                color: msg.senderId === user.id ? 'white' : 'text.primary',
                borderRadius: 2,
                p: 1.5
              }}
            >
              <Typography variant="caption" display="block" gutterBottom>
                {msg.sender?.name || i18n.t('chat.unknownUser')}
              </Typography>

              {msg.messageType === 'text' && (
                <Typography>{msg.message}</Typography>
              )}
{msg.messageType === 'image' && (
  <Box
    component="img"
    src={getMediaUrl(msg.mediaUrl)}
    alt={i18n.t('chat.imageMessage')}
    sx={{
      maxWidth: '100%',
      height: 'auto',
      borderRadius: 1,
      cursor: 'pointer',
      objectFit: 'contain'
    }}
    loading="lazy"
    onError={(e) => handleMediaError(e, 'image')}
  />
)}
{msg.messageType === 'video' && (
  <Box
    component="video"
    controls
    sx={{
      maxWidth: '100%',
      borderRadius: 1
    }}
    onError={(e) => {
      console.error("Erro ao carregar vídeo:", e);
      e.target.style.display = 'none';
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.padding = '1rem';
      fallbackDiv.style.border = '1px dashed #ccc';
      fallbackDiv.style.borderRadius = '4px';
      fallbackDiv.style.textAlign = 'center';
      fallbackDiv.innerText = i18n.t('chat.errors.videoLoadFailed');
      e.target.parentNode.appendChild(fallbackDiv);
    }}
  >
    <source src={`${process.env.REACT_APP_BACKEND_URL}${msg.mediaPath}`} type="video/mp4" />
    {i18n.t('chat.errors.videoNotSupported')}
  </Box>
)}

{msg.messageType === 'audio' && (
  <Box
    component="audio"
    controls
    sx={{
      maxWidth: '100%',
      borderRadius: 1
    }}
    onError={(e) => {
      console.error("Erro ao carregar áudio:", e);
      e.target.style.display = 'none';
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.padding = '1rem';
      fallbackDiv.style.border = '1px dashed #ccc';
      fallbackDiv.style.borderRadius = '4px';
      fallbackDiv.style.textAlign = 'center';
      fallbackDiv.innerText = i18n.t('chat.errors.audioLoadFailed');
      e.target.parentNode.appendChild(fallbackDiv);
    }}
  >
    <source src={`${process.env.REACT_APP_BACKEND_URL}${msg.mediaPath}`} type="audio/wav" />
    {i18n.t('chat.errors.audioNotSupported')}
  </Box>
)}

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5,
                  opacity: 0.7
                }}
              >
                {new Date(msg.createdAt).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        ))}
        
        {/* Elemento de referência para scroll automático */}
        <div ref={messagesEndRef} />
        
        {/* Indicador de estado vazio */}
        {!loading && messages.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="200px"
            color="text.secondary"
          >
            <Typography>
              {i18n.t('chat.noMessages')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Indicador de progresso de upload */}
      {isUploading && (
        <Box sx={{ width: '100%', px: 2 }}>
          <Typography variant="caption" color="primary">
            {uploadProgress > 0 ? `${i18n.t('chat.uploading')} ${uploadProgress}%` : i18n.t('chat.processing')}
          </Typography>
          <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1, mt: 0.5 }}>
            <Box sx={{ width: `${uploadProgress}%`, height: 4, bgcolor: 'primary.main', borderRadius: 1 }} />
          </Box>
        </Box>
      )}

      {/* Input de mensagem */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(message);
              }
            }}
            placeholder={i18n.t('chat.typeMessage')}
            disabled={isUploading || isRecording}
            sx={{ bgcolor: 'background.default' }}
          />

          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || isUploading || isRecording}
            aria-label={i18n.t('chat.attachFile')}
          >
            <AttachFile />
          </IconButton>

          <IconButton
            onClick={isRecording ? stopRecording : startRecording}
            color={isRecording ? 'error' : 'default'}
            disabled={loading || isUploading}
            aria-label={isRecording ? i18n.t('chat.stopRecording') : i18n.t('chat.startRecording')}
          >
            {isRecording ? <Stop /> : <Mic />}
          </IconButton>

          <IconButton
            onClick={() => handleSendMessage(message)}
            disabled={!message.trim() || loading || isUploading || isRecording}
            color="primary"
            aria-label={i18n.t('chat.send')}
          >
            <Send />
          </IconButton>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*"
        />
      </Box>

      {/* Menu de participantes */}
      <Menu
  anchorEl={participantsAnchor}
  open={showParticipants}
  onClose={handleParticipantsClose}
>
  {chat.users?.map(user => {
    if (!user || !user.user) return null;
    
    return (
      <MenuItem key={user.id || user.userId || `user-${Math.random()}`}>
        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
          {user.user.name?.charAt(0) || "?"}
        </Avatar>
        <Typography>{user.user.name || "Usuário Desconhecido"}</Typography>
      </MenuItem>
    );
  })}
</Menu>

      {/* Dialog de exportação */}
      <Dialog
        open={showExportDialog}
        onClose={() => !isExporting && setShowExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{i18n.t('chat.exportChat')}</DialogTitle>
        <DialogContent>
          <Typography>
            {i18n.t('chat.exportConfirmMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowExportDialog(false)}
            disabled={isExporting}
          >
            {i18n.t('chat.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleExportChat}
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={20} /> : <Download />}
          >
            {isExporting ? i18n.t('chat.exporting') : i18n.t('chat.export')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificações de erro */}
      <Snackbar 
        open={!!uploadError} 
        autoHideDuration={6000} 
        onClose={() => setUploadError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setUploadError(null)} severity="error">
          {uploadError}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default React.memo(ChatMessages);