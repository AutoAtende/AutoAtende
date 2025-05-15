import React from 'react';
import { i18n } from "../../../translate/i18n";
import BaseEmptyState from '../../../components/BaseEmptyState';
import { Add as AddIcon, Campaign as CampaignIcon } from '@mui/icons-material';

const CampaignEmptyState = ({
  type = 'campaign',
  title,
  message,
  buttonText,
  onAction,
  showButton = true,
}) => {
  // Definir os textos e ícones com base no tipo
  const getContent = () => {
    switch (type) {
      case 'campaigns':
        return {
          title: title || i18n.t("campaigns.empty.title"),
          message: message || i18n.t("campaigns.empty.message"),
          buttonText: buttonText || i18n.t("campaigns.empty.button"),
          icon: <CampaignIcon sx={{ fontSize: 40 }} />,
        };
      case 'contactLists':
        return {
          title: title || i18n.t("contactLists.empty.title"),
          message: message || i18n.t("contactLists.empty.message"),
          buttonText: buttonText || i18n.t("contactLists.empty.button"),
          icon: <CampaignIcon sx={{ fontSize: 40 }} />,
        };
      case 'reports':
        return {
          title: title || i18n.t("campaigns.reports.empty.title"),
          message: message || i18n.t("campaigns.reports.empty.message"),
          buttonText: buttonText || i18n.t("campaigns.reports.empty.button"),
          icon: <CampaignIcon sx={{ fontSize: 40 }} />,
        };
      default:
        return {
          title: title || i18n.t("empty.title"),
          message: message || i18n.t("empty.message"),
          buttonText: buttonText || i18n.t("empty.button"),
          icon: <AddIcon sx={{ fontSize: 40 }} />,
        };
    }
  };

  const content = getContent();

  return (
    <BaseEmptyState
      icon={content.icon}
      title={content.title}
      message={content.message}
      buttonText={content.buttonText}
      onAction={onAction}
      showButton={showButton}
    />
  );
};

export default CampaignEmptyState;