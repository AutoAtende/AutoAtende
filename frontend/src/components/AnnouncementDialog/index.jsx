import React from "react";
import { styled } from "@mui/material/styles";
import DOMPurify from "dompurify";
import {
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box
} from "@mui/material";

import BaseModal from "../shared/BaseModal";

const StyledContent = styled(DialogContent)(({ theme }) => ({
  minWidth: 300,
  maxWidth: "100%",
  padding: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    maxWidth: 500,
  }
}));

const HtmlContentWrapper = styled(DialogContentText)(({ theme }) => ({
  "& img": {
    maxWidth: "100%",
    height: "auto",
    display: "block",
    margin: "1rem auto"
  },
  "& table": {
    borderCollapse: "collapse",
    width: "100%",
    margin: "1rem 0",
    backgroundColor: theme.palette.background.paper
  },
  "& td, & th": {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
    color: theme.palette.text.primary
  },
  "& ul, & ol": {
    paddingLeft: theme.spacing(2.5)
  },
  "& blockquote": {
    borderLeft: `4px solid ${theme.palette.divider}`,
    margin: theme.spacing(1, 0),
    padding: theme.spacing(0.5, 1),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover
  },
  "& a": {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline"
    }
  },
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    color: theme.palette.text.primary,
    margin: theme.spacing(2, 0, 1)
  }
}));

const MediaPreview = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  margin: "0 auto 20px",
  textAlign: "center",
  width: "90%",
  height: 300,
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  backgroundPosition: "center",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1]
}));

function AnnouncementDialog({ announcement, open, handleClose }) {
  const getMediaPath = (filename, companyId) => {
    return `${process.env.REACT_APP_BACKEND_URL}/public/company${companyId}/${filename}`;
  };

  const createSanitizedMarkup = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'table', 'thead', 'tbody',
        'tr', 'td', 'th'
      ],
      ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'style']
    });
    return { __html: sanitizedContent };
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={announcement?.title}
      maxWidth="md"
    >
      <StyledContent>
        {announcement?.mediaPath && (
          <MediaPreview
            sx={{
              backgroundImage: `url(${getMediaPath(
                announcement.mediaPath,
                announcement.companyId
              )})`
            }}
          />
        )}
        <HtmlContentWrapper
          component="div"
          dangerouslySetInnerHTML={createSanitizedMarkup(announcement?.text || '')}
        />
      </StyledContent>
      
      <DialogActions sx={{ padding: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={handleClose}
          color="primary"
          variant="contained"
          autoFocus
        >
          Fechar
        </Button>
      </DialogActions>
    </BaseModal>
  );
}

export default AnnouncementDialog;