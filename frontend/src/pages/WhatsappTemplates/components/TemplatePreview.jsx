import React from 'react';
import { styled } from "@mui/material/styles";
import { Box, Button, Typography } from "@mui/material";
import {
  Link as LinkIcon,
  Phone as PhoneIcon,
  Reply as ReplyIcon
} from "@mui/icons-material";

const PreviewContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#E5DDD5",
  backgroundImage: "url(/wa-background.png)",
  backgroundSize: "contain",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  height: "100%",
  minHeight: 400,
  position: "relative",
  overflow: "hidden"
}));

const MessageBubble = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "7.5px",
  padding: theme.spacing(1.5),
  maxWidth: "85%",
  boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
  position: "relative",
  marginLeft: "auto",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: "-8px",
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: "0 8px 8px 0",
    borderColor: "transparent #fff transparent transparent"
  }
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1)
}));

const PreviewButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "#fff",
  color: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: "#f5f5f5"
  }
}));

function TemplatePreview({ data }) {
  const renderHeader = () => {
    if (!data.header) return null;
    return (
      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
        {data.header}
      </Typography>
    );
  };

  const renderBody = () => {
    if (!data.body) return null;
    
    // Replace variables placeholders with example values
    let bodyText = data.body;
    for (let i = 1; i <= 10; i++) {
      const placeholder = `{{${i}}}`;
      if (bodyText.includes(placeholder)) {
        bodyText = bodyText.replace(placeholder, `[Variável ${i}]`);
      }
    }
    
    return (
      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
        {bodyText}
      </Typography>
    );
  };

  const renderFooter = () => {
    if (!data.footer) return null;
    return (
      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
        {data.footer}
      </Typography>
    );
  };

  const getButtonIcon = (type) => {
    switch (type) {
      case "URL":
        return <LinkIcon fontSize="small" />;
      case "PHONE_NUMBER":
        return <PhoneIcon fontSize="small" />;
      default:
        return <ReplyIcon fontSize="small" />;
    }
  };

  const renderButtons = () => {
    if (!data.buttons?.length) return null;
    
    return (
      <ButtonsContainer>
        {data.buttons.map((button, index) => (
          <PreviewButton
            key={index}
            variant="contained"
            fullWidth
            startIcon={getButtonIcon(button.type)}
          >
            {button.text || `Botão ${index + 1}`}
          </PreviewButton>
        ))}
      </ButtonsContainer>
    );
  };

  return (
    <PreviewContainer>
      <MessageBubble>
        {renderHeader()}
        {renderBody()}
        {renderFooter()}
        {renderButtons()}
      </MessageBubble>
    </PreviewContainer>
  );
}

export default TemplatePreview;