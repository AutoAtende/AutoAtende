import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Avatar, IconButton, Link } from "@mui/material";
import { format } from "date-fns";
import { parseISO } from "date-fns";
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Função auxiliar para obter iniciais do nome
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const MessagesListContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflowY: "auto",
  padding: "0.5rem 1rem",
  backgroundColor: "#E5DDD5",
  backgroundImage: `linear-gradient(rgba(229, 221, 213, 0.9), rgba(229, 221, 213, 0.9)), url("data:image/png;base64,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")`,
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0,0,0,0.05)"
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(0,0,0,0.2)",
    borderRadius: "4px"
  }
}));

const MessageItem = styled(Box)(({ theme, fromMe }) => ({
  display: "flex",
  justifyContent: fromMe ? "flex-end" : "flex-start",
  marginBottom: "0.5rem",
  width: "100%",
  position: "relative",
}));

const MessageContent = styled(Box)(({ theme }) => ({
  maxWidth: "75%",
  position: "relative",
}));

const MessageBubble = styled(Paper)(({ theme, fromMe }) => ({
  padding: theme.spacing(1, 1.5),
  borderRadius: "7.5px",
  backgroundColor: fromMe ? "#DCF8C6" : "#FFFFFF",
  color: "#303030",
  boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    [fromMe ? "right" : "left"]: -8,
    width: 0,
    height: 0,
    borderTop: "8px solid transparent",
    borderBottom: "8px solid transparent",
    [fromMe ? "borderLeft" : "borderRight"]: `8px solid ${fromMe ? "#DCF8C6" : "#FFFFFF"}`,
    transform: fromMe ? "none" : "translateY(0)",
  }
}));

const MessageText = styled(Typography)(({ theme }) => ({
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: "14px",
  lineHeight: 1.4,
}));

const TicketInfo = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  color: "#65B246",
  textAlign: "center",
  marginBottom: "0.5rem",
  padding: "4px 12px",
  borderRadius: "4px",
  backgroundColor: "rgba(255,255,255,0.6)",
  display: "inline-block",
  margin: "0 auto 0.5rem auto",
}));

const DateDivider = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0.75rem 0",
}));

const DateDividerText = styled(Typography)(({ theme }) => ({
  padding: "4px 12px",
  color: "#616161",
  fontSize: "12px",
  backgroundColor: "rgba(225,245,254,0.92)",
  borderRadius: "7.5px",
  boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: "11px",
  color: "rgba(0,0,0,0.45)",
  marginTop: "2px",
  textAlign: "right",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingRight: "4px",
}));

const StatusIcon = styled(Box)(({ theme }) => ({
  marginLeft: "4px",
  display: "inline-flex",
  alignItems: "center",
  fontSize: "14px",
  color: "#4FC3F7",
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  maxWidth: "100%",
  position: "relative",
  borderRadius: "3px",
  overflow: "hidden",
  marginBottom: "4px",
}));

const MessageImage = styled('img')(({ theme }) => ({
  width: "100%",
  maxHeight: "200px",
  objectFit: "contain",
  display: "block",
  backgroundColor: "rgba(0,0,0,0.1)",
}));

const FileContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px",
  backgroundColor: "rgba(0,0,0,0.05)",
  borderRadius: "4px",
  marginBottom: "4px",
}));

const FileIconContainer = styled(Box)(({ theme }) => ({
  marginRight: "8px",
  fontSize: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const FileInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: "hidden",
}));

const FileName = styled(Typography)(({ theme }) => ({
  fontSize: "13px",
  fontWeight: 500,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const FileSize = styled(Typography)(({ theme }) => ({
  fontSize: "11px",
  color: "rgba(0,0,0,0.54)",
}));

const AudioContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px",
  backgroundColor: "rgba(0,0,0,0.05)",
  borderRadius: "4px",
  marginBottom: "4px",
}));

const AudioControls = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
}));

const PlayButton = styled(IconButton)(({ theme }) => ({
  padding: "4px",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const AudioInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  marginLeft: "8px",
}));

const AudioDuration = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  color: "rgba(0,0,0,0.6)",
}));

const LocationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "8px",
  backgroundColor: "rgba(0,0,0,0.05)",
  borderRadius: "4px",
  marginBottom: "4px",
}));

const LocationIcon = styled(LocationOnIcon)(({ theme }) => ({
  fontSize: "32px",
  color: theme.palette.error.main,
  marginBottom: "4px",
}));

const LocationInfo = styled(Typography)(({ theme }) => ({
  fontSize: "13px",
  textAlign: "center",
}));

// Função para calcular o tamanho do arquivo em uma forma legível
const formatFileSize = (bytes) => {
  if (!bytes) return "Desconhecido";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

// Função para detectar o tipo de mensagem
const detectMessageType = (message) => {
  if (!message || !message.body) return "text";
  
  // Verifica se é uma localização
  if (message.body.includes('data:image/png;base64') && 
      message.body.includes('latitude')) {
    return "location";
  }
  
  // Verifica se é uma imagem
  if (message.mediaUrl && 
      (message.mediaUrl.endsWith('.jpg') || 
       message.mediaUrl.endsWith('.jpeg') || 
       message.mediaUrl.endsWith('.png') || 
       message.mediaUrl.endsWith('.gif'))) {
    return "image";
  }
  
  // Verifica se é um áudio
  if (message.mediaUrl && 
      (message.mediaUrl.endsWith('.mp3') || 
       message.mediaUrl.endsWith('.ogg') || 
       message.mediaUrl.endsWith('.wav') || 
       message.mediaType === 'audio')) {
    return "audio";
  }
  
  // Verifica se é um PDF
  if (message.mediaUrl && message.mediaUrl.endsWith('.pdf')) {
    return "pdf";
  }
  
  // Verifica se é outro tipo de arquivo
  if (message.mediaUrl) {
    return "file";
  }
  
  return "text";
};

// Componente para renderizar o conteúdo da mensagem com base no tipo
const MessageContentRenderer = ({ message, fromMe }) => {
  const messageType = detectMessageType(message);
  
  switch (messageType) {
    case "image":
      return (
        <>
          <ImageContainer>
            <MessageImage src={message.mediaUrl} alt="Imagem" />
          </ImageContainer>
          {message.body && <MessageText>{message.body}</MessageText>}
        </>
      );
      
    case "pdf":
      return (
        <>
          <FileContainer>
            <FileIconContainer>
              <PictureAsPdfIcon color="error" />
            </FileIconContainer>
            <FileInfo>
              <FileName>
                {message.mediaName || "Documento PDF"}
              </FileName>
              <FileSize>
                {formatFileSize(message.mediaSize)}
              </FileSize>
            </FileInfo>
            <IconButton size="small" component={Link} href={message.mediaUrl} target="_blank" download>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </FileContainer>
          {message.body && <MessageText>{message.body}</MessageText>}
        </>
      );
      
    case "audio":
      return (
        <>
          <AudioContainer>
            <AudioControls>
              <PlayButton size="small">
                <PlayArrowIcon fontSize="small" />
              </PlayButton>
            </AudioControls>
            <AudioInfo>
              <AudiotrackIcon fontSize="small" style={{ marginRight: 4 }} />
              <AudioDuration>00:00</AudioDuration>
            </AudioInfo>
            <IconButton size="small" component={Link} href={message.mediaUrl} target="_blank" download>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </AudioContainer>
          {message.body && <MessageText>{message.body}</MessageText>}
        </>
      );
      
    case "file":
      return (
        <>
          <FileContainer>
            <FileIconContainer>
              <InsertDriveFileIcon color="primary" />
            </FileIconContainer>
            <FileInfo>
              <FileName>
                {message.mediaName || "Arquivo"}
              </FileName>
              <FileSize>
                {formatFileSize(message.mediaSize)}
              </FileSize>
            </FileInfo>
            <IconButton size="small" component={Link} href={message.mediaUrl} target="_blank" download>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </FileContainer>
          {message.body && <MessageText>{message.body}</MessageText>}
        </>
      );
      
    case "location":
      return (
        <LocationContainer>
          <LocationIcon />
          <LocationInfo>Localização Compartilhada</LocationInfo>
          <Typography variant="caption" color="textSecondary">
            Clique para ver no mapa
          </Typography>
        </LocationContainer>
      );
      
    case "text":
    default:
      return <MessageText>{message.body || "<sem conteúdo>"}</MessageText>;
  }
};

const EnhancedMessagesList = ({ messages, ticket, height = 400 }) => {
  // Verificação para evitar erros se messages for undefined ou não for um array
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return (
      <MessagesListContainer style={{ height }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography align="center" color="textSecondary">
            Nenhuma mensagem encontrada
          </Typography>
        </Box>
      </MessagesListContainer>
    );
  }

  // Organizar mensagens por data
  const messagesByDate = {};
  messages.forEach(message => {
    if (!message || !message.createdAt) return;
    
    const messageDate = typeof message.createdAt === 'string' 
      ? parseISO(message.createdAt) 
      : new Date(message.createdAt);
      
    const formattedDate = format(messageDate, "dd/MM/yyyy");
    
    if (!messagesByDate[formattedDate]) {
      messagesByDate[formattedDate] = [];
    }
    
    messagesByDate[formattedDate].push(message);
  });
  
  // Ordenar datas
  const sortedDates = Object.keys(messagesByDate).sort((a, b) => {
    return new Date(a) - new Date(b);
  });
  
  return (
    <MessagesListContainer style={{ height }}>
      {/* Informação do ticket */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TicketInfo>
          {ticket?.status === 'open' ? 'Atendimento em Andamento' : 'Visualização da Conversa'}
        </TicketInfo>
      </Box>
      
      {/* Renderizar mensagens agrupadas por data */}
      {sortedDates.map(date => (
        <React.Fragment key={date}>
          <DateDivider>
            <DateDividerText>{date}</DateDividerText>
          </DateDivider>
          
          {messagesByDate[date].map((message, index) => {
            if (!message) return null;
            
            // Usar um valor seguro para fromMe
            const fromMe = !!message.fromMe;
            
            // Formatar hora
            const messageDate = typeof message.createdAt === 'string' 
              ? parseISO(message.createdAt) 
              : new Date(message.createdAt);
              
            const formattedTime = format(messageDate, "HH:mm");
            
            return (
              <MessageItem key={message.id || index} fromMe={fromMe}>
                <MessageContent>
                  <MessageBubble fromMe={fromMe} elevation={0}>
                    <MessageContentRenderer message={message} fromMe={fromMe} />
                    
                    <MessageTime>
                      {formattedTime}
                      {fromMe && (
                        <StatusIcon>
                          {message.ack === 2 ? (
                            <DoneAllIcon fontSize="inherit" />
                          ) : (
                            <CheckIcon fontSize="inherit" />
                          )}
                        </StatusIcon>
                      )}
                    </MessageTime>
                  </MessageBubble>
                </MessageContent>
              </MessageItem>
            );
          })}
        </React.Fragment>
      ))}
    </MessagesListContainer>
  );
};

export default EnhancedMessagesList;