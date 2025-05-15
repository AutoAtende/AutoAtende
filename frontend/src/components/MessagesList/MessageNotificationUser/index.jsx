import React from 'react';
import { Typography, Box } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import WhatsMarkedWrapper from "../../WhatsMarkedWrapper";

export const MessageNotificationUser = ({ message, title, classes }) => {
  // Identificar se há mensagem citada (quotedMsg)
  const hasQuotedMessage = message.quotedMsg && message.quotedMsg.id;

  const renderQuotedMessage = () => {
    if (!hasQuotedMessage) return null;

    const { quotedMsg } = message;

    // Determinar tipo de mídia e ícone
    let mediaIcon = null;
    let previewContent;

    if (quotedMsg.mediaType === 'audio') {
      mediaIcon = '🎵';
      previewContent = 'Áudio';
    } else if (quotedMsg.mediaType === 'image') {
      mediaIcon = '📷';
      previewContent = 'Imagem';
    } else if (quotedMsg.mediaType === 'video') {
      mediaIcon = '🎥';
      previewContent = 'Vídeo';
    } else if (quotedMsg.mediaType === 'document') {
      mediaIcon = '📎';
      previewContent = 'Documento';
    } else if (quotedMsg.mediaType === 'locationMessage') {
      mediaIcon = '📍';
      previewContent = 'Localização';
    } else if (quotedMsg.mediaType === 'contactMessage' || quotedMsg.mediaType === 'contactsArrayMessage') {
      mediaIcon = '👤';
      previewContent = 'Contato';
    } else {
      previewContent = quotedMsg.body || '';
    }

    return (
      <div
        style={{
          margin: "6px 6px 6px 6px", // Margem uniforme para alinhamento correto
          overflow: "hidden",
          backgroundColor: "#cfe9ba",
          borderRadius: "7.5px",
          display: "flex",
          position: "relative",
          cursor: "pointer",
          maxWidth: "calc(100% - 12px)", // Ajustado para respeitar as margens
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            flex: "none",
            width: "4px",
            backgroundColor: "#35cd96",
          }}
        ></span>
        <div
          style={{
            padding: 10,
            maxWidth: "calc(100% - 14px)", // Ajustado para considerar padding
            height: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {quotedMsg?.contact?.name && (
            <Typography
              variant="subtitle2"
              component="span"
              sx={{
                fontWeight: 500,
                color: '#6bcbef',
                display: 'block'
              }}
            >
              {quotedMsg.contact.name}
            </Typography>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {mediaIcon && <span style={{ fontSize: '14px' }}>{mediaIcon}</span>}
            {mediaIcon ? (
              <Typography variant="body2">{previewContent}</Typography>
            ) : (
              <WhatsMarkedWrapper>{previewContent}</WhatsMarkedWrapper>
            )}
          </div>
        </div>
        {quotedMsg.mediaType === 'image' && quotedMsg.mediaUrl && (
          <div style={{ width: 70, height: 70, overflow: 'hidden' }}>
            <img
              src={quotedMsg.mediaUrl}
              alt="Thumbnail"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={classes.messageContainerRight}>
      <div className={classes.avatar} />
      <div
        id={message.id}
        className={classes.messageRightNotificationWarning}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <InfoOutlined
            fontSize="small"
            sx={{ color: '#ffc107', marginRight: '8px' }}
          />
          <Typography
            variant="subtitle2"
            component="span"
            sx={{
              fontWeight: 600,
              color: '#f57c00',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px'
            }}
          >
            {title}
          </Typography>
        </Box>

        <div className={classes.textContentItem}>
          {hasQuotedMessage && renderQuotedMessage()}
          <WhatsMarkedWrapper>{message?.body}</WhatsMarkedWrapper>
          <span className={classes.timestamp}>
            {new Date(message?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};