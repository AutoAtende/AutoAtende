// AnnouncementDialog.jsx (refatorado)
import React from "react";
import DOMPurify from "dompurify";
import {
  Box,
  Typography
} from "@mui/material";

import BaseModal from "../../../components/BaseModal";
import BaseButton from "../../../components/BaseButton";

const AnnouncementDialog = ({ announcement, open, handleClose, isModal = false }) => {
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

  // Se o componente estiver sendo usado como conteúdo de um modal, não renderize um novo modal
  if (isModal) {
    return (
      <>
        {announcement?.mediaPath && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              margin: '0 auto 20px',
              textAlign: 'center',
              width: '90%',
              height: 300,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              borderRadius: 1,
              boxShadow: 1,
              backgroundImage: `url(${getMediaPath(
                announcement.mediaPath,
                announcement.companyId
              )})`
            }}
          />
        )}
        <Box
          component="div"
          sx={{
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '1rem auto'
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              margin: '1rem 0',
              backgroundColor: 'background.paper'
            },
            '& td, & th': {
              border: '1px solid',
              borderColor: 'divider',
              padding: 1,
              color: 'text.primary'
            },
            '& ul, & ol': {
              paddingLeft: 2.5
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'divider',
              margin: '8px 0',
              padding: '4px 8px',
              color: 'text.secondary',
              backgroundColor: 'action.hover'
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: 'text.primary',
              margin: '16px 0 8px'
            }
          }}
          dangerouslySetInnerHTML={createSanitizedMarkup(announcement?.text || '')}
        />
      </>
    );
  }

  // Ações para o modal
  const modalActions = [
    {
      label: "Fechar",
      onClick: handleClose,
      variant: "contained",
      color: "primary"
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={announcement?.title || ""}
      maxWidth="md"
      actions={modalActions}
    >
      <Box sx={{ p: 2 }}>
        {announcement?.mediaPath && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              margin: '0 auto 20px',
              textAlign: 'center',
              width: '90%',
              height: 300,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              borderRadius: 1,
              boxShadow: 1,
              backgroundImage: `url(${getMediaPath(
                announcement.mediaPath,
                announcement.companyId
              )})`
            }}
          />
        )}
        <Box
          component="div"
          sx={{
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '1rem auto'
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              margin: '1rem 0',
              backgroundColor: 'background.paper'
            },
            '& td, & th': {
              border: '1px solid',
              borderColor: 'divider',
              padding: 1,
              color: 'text.primary'
            },
            '& ul, & ol': {
              paddingLeft: 2.5
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'divider',
              margin: '8px 0',
              padding: '4px 8px',
              color: 'text.secondary',
              backgroundColor: 'action.hover'
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: 'text.primary',
              margin: '16px 0 8px'
            }
          }}
          dangerouslySetInnerHTML={createSanitizedMarkup(announcement?.text || '')}
        />
      </Box>
    </BaseModal>
  );
};

export default AnnouncementDialog;