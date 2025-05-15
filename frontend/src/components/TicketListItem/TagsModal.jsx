import React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  styled
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';
import { i18n } from "../../translate/i18n";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 10,
    maxWidth: 500,
    width: '100%'
  }
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: 8
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  padding: '16px 24px 8px 24px',
  textAlign: 'center'
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  padding: '0px 24px 16px 24px',
  overflowY: 'auto',
  maxHeight: 400
}));

const TagGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  justifyContent: 'center',
  margin: '10px 0'
}));

const Tag = styled(Box)(({ theme, bgcolor }) => ({
  borderRadius: 10,
  padding: '6px 10px',
  fontSize: 12,
  color: 'white',
  display: 'inline-flex',
  alignItems: 'center',
  margin: '0 4px 4px 0',
  whiteSpace: 'nowrap',
  fontWeight: 500,
  backgroundColor: bgcolor || "#7C7C7C"
}));

const DialogActionsStyled = styled(DialogActions)(({ theme }) => ({
  padding: '8px 24px 16px 24px',
  justifyContent: 'center'
}));

const TagsModal = ({ open, onClose, tags, ticketId }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <StyledDialog 
      open={open} 
      onClose={onClose}
      fullScreen={fullScreen}
      aria-labelledby="tags-dialog-title"
    >
      <DialogTitleStyled id="tags-dialog-title">
        <Typography variant="h6">
          {i18n.t("ticketsList.tagsModalTitle", { defaultValue: "Tags do Ticket" })}
        </Typography>
        <CloseButton 
          aria-label="close"
          onClick={onClose}
          size="large"
        >
          <CloseIcon />
        </CloseButton>
      </DialogTitleStyled>
      <DialogContentStyled dividers>
        <TagGrid>
          {tags.map((tag) => (
            <Tag
              key={tag.id}
              bgcolor={tag.color}
            >
              {tag.name.toUpperCase()}
            </Tag>
          ))}
        </TagGrid>
        {tags.length === 0 && (
          <Typography align="center" variant="body2" color="textSecondary">
            {i18n.t("ticketsList.noTagsAvailable", { defaultValue: "Nenhuma tag disponível para este ticket" })}
          </Typography>
        )}
      </DialogContentStyled>
      <DialogActionsStyled>
        <Button onClick={onClose} color="primary" variant="contained">
          {i18n.t("ticketsList.buttons.close", { defaultValue: "Fechar" })}
        </Button>
      </DialogActionsStyled>
    </StyledDialog>
  );
};

export default TagsModal;