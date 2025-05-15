import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ContactPhone as ContactIcon,
  PersonAdd as AddIcon
} from '@mui/icons-material';
import { i18n } from "../../../translate/i18n";

const ContactsEmptyState = ({ onCreateNew, isGroup = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}
    >
      <ContactIcon
        sx={{
          fontSize: { xs: 48, sm: 64 },
          color: 'primary.main',
          opacity: 0.7,
          mb: 2
        }}
      />
      
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        align="center"
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {isGroup 
          ? i18n.t("contacts.noGroupsFound") || "Nenhum grupo encontrado"
          : i18n.t("contacts.noContactsFound") || "Nenhum contato encontrado"}
      </Typography>
      
      <Typography
        variant="body1"
        align="center" 
        color="text.secondary"
        sx={{ maxWidth: '500px', mb: 4 }}
      >
        {isGroup
          ? i18n.t("contacts.noGroupsFoundMessage") || "Não há grupos cadastrados para os filtros selecionados."
          : i18n.t("contacts.noContactsFoundMessage") || "Não há contatos cadastrados para os filtros selecionados."}
        {isMobile ? '' : ' ' + (isGroup 
          ? i18n.t("contacts.addGroupMessage") || "Adicione um novo grupo ou ajuste os critérios de busca."
          : i18n.t("contacts.addContactMessage") || "Adicione um novo contato ou ajuste os critérios de busca.")}
      </Typography>
      
      <Button
        variant="contained"
        size={isMobile ? 'medium' : 'large'}
        startIcon={<AddIcon />}
        onClick={onCreateNew}
        disableElevation
        sx={{
          borderRadius: '28px',
          px: { xs: 3, sm: 4 },
          py: { xs: 1, sm: 1.5 },
          boxShadow: theme.shadows[2],
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          }
        }}
      >
        {isGroup
          ? i18n.t("contacts.buttons.addGroup") || "Adicionar Novo Grupo"
          : i18n.t("contacts.buttons.addContact") || "Adicionar Novo Contato"}
      </Button>
    </Paper>
  );
};

ContactsEmptyState.propTypes = {
  onCreateNew: PropTypes.func.isRequired,
  isGroup: PropTypes.bool
};

export default ContactsEmptyState;