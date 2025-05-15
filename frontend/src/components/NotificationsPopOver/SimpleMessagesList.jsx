import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Avatar } from "@mui/material";
import { format } from "date-fns";
import { parseISO } from "date-fns";
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';

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
  padding: "1rem",
}));

const MessageItem = styled(Box)(({ theme, fromMe }) => ({
  display: "flex",
  justifyContent: fromMe ? "flex-end" : "flex-start",
  marginBottom: "1rem",
  width: "100%",
}));

const MessageContent = styled(Box)(({ theme, fromMe }) => ({
  display: "flex",
  flexDirection: fromMe ? "row" : "row-reverse",
  maxWidth: "70%",
}));

const MessageAvatar = styled(Avatar)(({ theme, fromMe }) => ({
  width: 32,
  height: 32,
  margin: theme.spacing(0, 1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.75rem",
  backgroundColor: fromMe ? theme.palette.primary.dark : theme.palette.grey[400],
}));

const MessageBubble = styled(Paper)(({ theme, fromMe }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: 16,
  backgroundColor: fromMe ? theme.palette.primary.main : theme.palette.background.paper,
  color: fromMe ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  maxWidth: "100%",
  position: "relative",
}));

const MessageText = styled(Typography)(({ theme }) => ({
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
}));

const MessageTime = styled(Typography)(({ theme, fromMe }) => ({
  fontSize: "0.75rem",
  color: fromMe ? "rgba(255,255,255,0.7)" : theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: "right",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
}));

const StatusIcon = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  display: "inline-flex",
  alignItems: "center",
  fontSize: "0.75rem",
}));

const DateDivider = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: theme.spacing(2, 0),
}));

const DateDividerLine = styled(Box)(({ theme }) => ({
  flex: 1,
  height: 1,
  backgroundColor: theme.palette.divider,
}));

const DateDividerText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
}));

const SimpleMessagesList = ({ messages, ticket, height = 400 }) => {
  // Verificação para evitar erros se messages for undefined ou não for um array
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return (
      <MessagesListContainer style={{ height }}>
        <Typography align="center" color="textSecondary">
          Nenhuma mensagem encontrada
        </Typography>
      </MessagesListContainer>
    );
  }

  let currentDate = null;
  
  return (
    <MessagesListContainer style={{ height }}>
      {messages.map((message, index) => {
        // Verificações para evitar erros
        if (!message || !message.createdAt) {
          return null;
        }
        
        const messageDate = typeof message.createdAt === 'string' 
          ? parseISO(message.createdAt) 
          : new Date(message.createdAt);
          
        const formattedDate = format(messageDate, "dd/MM/yyyy");
        
        // Verificar se precisamos mostrar um divisor de data
        const showDateDivider = currentDate !== formattedDate;
        if (showDateDivider) {
          currentDate = formattedDate;
        }
        
        // Usar um valor seguro para fromMe
        const fromMe = !!message.fromMe;
        
        return (
          <React.Fragment key={message.id || index}>
            {showDateDivider && (
              <DateDivider>
                <DateDividerLine />
                <DateDividerText variant="body2">{formattedDate}</DateDividerText>
                <DateDividerLine />
              </DateDivider>
            )}
            
            <MessageItem fromMe={fromMe}>
              <MessageContent fromMe={fromMe}>
                {!fromMe && (
                  <MessageAvatar fromMe={fromMe}>
                    {getInitials(ticket?.contact?.name || "?")}
                  </MessageAvatar>
                )}
                
                <MessageBubble fromMe={fromMe} elevation={0}>
                  <MessageText variant="body2">
                    {message.body || "<sem conteúdo>"}
                  </MessageText>
                  
                  <MessageTime variant="caption" fromMe={fromMe}>
                    {format(messageDate, "HH:mm")}
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
                
                {fromMe && (
                  <MessageAvatar fromMe={fromMe}>
                    {getInitials(ticket?.user?.name || "?")}
                  </MessageAvatar>
                )}
              </MessageContent>
            </MessageItem>
          </React.Fragment>
        );
      })}
    </MessagesListContainer>
  );
};

export default SimpleMessagesList;