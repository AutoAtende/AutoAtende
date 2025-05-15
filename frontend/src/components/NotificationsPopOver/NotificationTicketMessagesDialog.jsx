import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, IconButton, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import EnhancedMessagesList from "./EnhancedMessagesList"; // Importando o componente aprimorado

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: "600px",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    margin: theme.spacing(2)
  }
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2, 2, 1, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  padding: 6,
  marginRight: -6,
  color: theme.palette.primary.contrastText
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
  height: "400px"
}));

const NoMessagesText = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(3),
  color: theme.palette.text.secondary
}));

const NotificationTicketMessagesDialog = ({ open, handleClose, ticketId }) => {
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  
  // Referência para controlar se o componente está montado
  const isMounted = useRef(true);

  // Efeito para limpar a referência quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Efeito para resetar o estado quando o modal é fechado
  useEffect(() => {
    if (!open) {
      setLoading(true);
      setTicket(null);
      setMessages([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    const fetchTicketAndMessages = async () => {
      if (!open || !ticketId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Buscando ticket ID:", ticketId);
        
        // Primeiro, buscar os dados do ticket
        const ticketResponse = await api.get(`/tickets/${ticketId}`);
        if (!ticketResponse.data) {
          throw new Error("Ticket não encontrado");
        }
        
        if (!isMounted.current) return; // Verificar se o componente ainda está montado
        
        setTicket(ticketResponse.data);
        console.log("Ticket encontrado:", ticketResponse.data);
        
        // Em seguida, buscar as mensagens associadas ao ticket
        const messagesResponse = await api.get(`/messages/${ticketId}`);
        
        if (!isMounted.current) return; // Verificar novamente
        
        // Log para verificar o formato exato da resposta
        console.log("Resposta da API de mensagens:", messagesResponse.data);
        
        // Verificar e normalizar os dados das mensagens
        let normalizedMessages = [];
        if (Array.isArray(messagesResponse.data)) {
          normalizedMessages = messagesResponse.data;
        } else if (messagesResponse.data && typeof messagesResponse.data === 'object') {
          // Se for um objeto com propriedade messages, use-a
          if (Array.isArray(messagesResponse.data.messages)) {
            normalizedMessages = messagesResponse.data.messages;
          } else {
            // Tentar extrair valores se for um objeto com mensagens como valores
            normalizedMessages = Object.values(messagesResponse.data)
              .filter(item => item && typeof item === 'object');
          }
        }
        
        setMessages(normalizedMessages);
        console.log("Mensagens normalizadas:", normalizedMessages.length);
        
        // Garantir que o estado de carregamento seja atualizado
        if (isMounted.current) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do ticket:", err);
        if (isMounted.current) {
          setError(err.response?.data?.message || err.message || "Erro ao carregar mensagens");
          toast.error(err.response?.data?.message || "Erro ao carregar mensagens");
          setLoading(false); // Garantir que o loading termine mesmo em caso de erro
        }
      }
    };

    if (open && ticketId) {
      fetchTicketAndMessages();
    }
  }, [open, ticketId]);

  const handleDialogClose = () => {
    setTicket(null);
    setMessages([]);
    setError(null);
    handleClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleDialogClose}
      scroll="paper"
      fullWidth
      maxWidth="md"
    >
      <DialogHeader>
      <Typography variant="h6">
          {ticket?.contact?.name 
            ? `Conversa com ${ticket.contact.name}` 
            : "Visualização da conversa"}
        </Typography>
        <CloseButton onClick={handleDialogClose} aria-label="fechar">
          <CloseIcon />
        </CloseButton>
      </DialogHeader>
      <DialogContent 
        dividers 
        sx={{ 
          padding: 0, 
          backgroundColor: "#E5DDD5",
          backgroundImage: `linear-gradient(rgba(229, 221, 213, 0.9), rgba(229, 221, 213, 0.9))` 
        }}
      >
        {loading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : error ? (
          <NoMessagesText variant="body1" color="error">
            {error}
          </NoMessagesText>
        ) : messages && messages.length > 0 ? (
          <EnhancedMessagesList
            ticket={ticket}
            messages={messages}
            height={400}
          />
        ) : (
          <LoadingContainer>
            <NoMessagesText variant="body1">
              Nenhuma mensagem encontrada para este ticket.
            </NoMessagesText>
          </LoadingContainer>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default NotificationTicketMessagesDialog;