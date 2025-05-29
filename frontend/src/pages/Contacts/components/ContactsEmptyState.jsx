import React from 'react';
import PropTypes from 'prop-types';
import { Add as AddIcon, CloudUpload as ImportIcon } from '@mui/icons-material';
import StandardEmptyState from '../../../components/shared/StandardEmptyState';
import { i18n } from "../../../translate/i18n";

const ContactsEmptyState = ({ onCreateNew, onImport, isGroup = false }) => {
  const emptyStateProps = {
    type: 'contatos',
    title: isGroup 
      ? i18n.t("contacts.noGroupsFound") || "Nenhum grupo encontrado"
      : i18n.t("contacts.noContactsFound") || "Nenhum contato encontrado",
    description: isGroup
      ? i18n.t("contacts.noGroupsFoundMessage") || "Não há grupos cadastrados para os filtros selecionados. Adicione um novo grupo ou ajuste os critérios de busca."
      : i18n.t("contacts.noContactsFoundMessage") || "Não há contatos cadastrados para os filtros selecionados. Adicione um novo contato ou ajuste os critérios de busca.",
    primaryAction: {
      label: isGroup
        ? i18n.t("contacts.buttons.addGroup") || "Adicionar Novo Grupo"
        : i18n.t("contacts.buttons.addContact") || "Adicionar Novo Contato",
      icon: <AddIcon />,
      onClick: onCreateNew
    }
  };

  // Adicionar ação secundária para importar apenas se não for grupo e a função for fornecida
  if (!isGroup && onImport) {
    emptyStateProps.secondaryAction = {
      label: i18n.t("contacts.buttons.import") || "Importar Contatos",
      icon: <ImportIcon />,
      onClick: onImport
    };
  }

  return <StandardEmptyState {...emptyStateProps} />;
};

ContactsEmptyState.propTypes = {
  onCreateNew: PropTypes.func.isRequired,
  onImport: PropTypes.func,
  isGroup: PropTypes.bool
};

export default ContactsEmptyState;