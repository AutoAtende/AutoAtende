// src/components/EmptyState/index.jsx
import React from 'react';
import { i18n } from "../../translate/i18n";
import BaseEmptyState from '../BaseEmptyState';

// Importando ícones otimizados em um único import para reduzir o tamanho da bundle
import {
  Add as AddIcon,
  Campaign as CampaignIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  AttachFile as AttachFileIcon,
  ChatBubbleOutline as ChatIcon,
  ContactPhone as ContactPhoneIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Task as TaskIcon,
  LocalOffer as TagIcon,
  QuestionAnswer as TicketIcon,
  WhatsApp as WhatsAppIcon,
  SupportAgent as SupportIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  AccountBalance as FinanceIcon,
  Email as EmailIcon,
  Assistant as AssistantIcon,
  Dashboard as DashboardIcon,
  Password as PasswordIcon,
  FormatListNumbered as KanbanIcon,
  People as UsersIcon,
  Devices as ConnectionsIcon,
  Category as QueueIcon,
  FlashOn as QuickIcon,
  AccountTree as FlowIcon,
  Work as EmployerIcon,
  WorkOutline as PositionIcon,
  ReportProblem as ReportIcon,
} from '@mui/icons-material';

const EmptyState = ({
  type = 'default',
  title,
  message,
  buttonText,
  onCreateNew,
  showButton = true,
  customIcon,
  // Parâmetros adicionais para tradução
  moduleName,
  moduleNamePlural,
}) => {
  // Função para obter o ícone e texto baseado no tipo
  const getContent = () => {
    let icon;
    let translationModule = '';
    
    // Determinar o ícone e o módulo de tradução com base no tipo
    switch (type) {
      case 'campaigns':
        icon = <CampaignIcon sx={{ fontSize: 40 }} />;
        translationModule = 'campaigns';
        break;
      case 'contactLists':
        icon = <ListIcon sx={{ fontSize: 40 }} />;
        translationModule = 'contactLists';
        break;
      case 'reports':
        icon = <AssessmentIcon sx={{ fontSize: 40 }} />;
        translationModule = 'reports';
        break;
      case 'files':
        icon = <AttachFileIcon sx={{ fontSize: 40 }} />;
        translationModule = 'files';
        break;
      case 'chat':
        icon = <ChatIcon sx={{ fontSize: 40 }} />;
        translationModule = 'chat';
        break;
      case 'contacts':
        icon = <ContactPhoneIcon sx={{ fontSize: 40 }} />;
        translationModule = 'contacts';
        break;
      case 'tickets':
        icon = <TicketIcon sx={{ fontSize: 40 }} />;
        translationModule = 'tickets';
        break;
      case 'connections':
        icon = <ConnectionsIcon sx={{ fontSize: 40 }} />;
        translationModule = 'connections';
        break;
      case 'whatsappTemplates':
        icon = <WhatsAppIcon sx={{ fontSize: 40 }} />;
        translationModule = 'whatsAppTemplates';
        break;
      case 'tags':
        icon = <TagIcon sx={{ fontSize: 40 }} />;
        translationModule = 'tags';
        break;
      case 'queues':
        icon = <QueueIcon sx={{ fontSize: 40 }} />;
        translationModule = 'queues';
        break;
      case 'quickMessages':
        icon = <QuickIcon sx={{ fontSize: 40 }} />;
        translationModule = 'quickMessages';
        break;
      case 'users':
        icon = <UsersIcon sx={{ fontSize: 40 }} />;
        translationModule = 'users';
        break;
      case 'schedules':
        icon = <ScheduleIcon sx={{ fontSize: 40 }} />;
        translationModule = 'schedules';
        break;
      case 'flows':
        icon = <FlowIcon sx={{ fontSize: 40 }} />;
        translationModule = 'flows';
        break;
      case 'tasks':
      case 'tasks.timeline':
        icon = <TaskIcon sx={{ fontSize: 40 }} />;
        translationModule = 'tasks';
        break;
      case 'kanban':
        icon = <KanbanIcon sx={{ fontSize: 40 }} />;
        translationModule = 'kanban';
        break;
      case 'assistants':
        icon = <AssistantIcon sx={{ fontSize: 40 }} />;
        translationModule = 'assistants';
        break;
      case 'companies':
        icon = <GroupIcon sx={{ fontSize: 40 }} />;
        translationModule = 'companies';
        break;
      case 'prompts':
        icon = <CodeIcon sx={{ fontSize: 40 }} />;
        translationModule = 'prompts';
        break;
      case 'helps':
        icon = <SupportIcon sx={{ fontSize: 40 }} />;
        translationModule = 'helps';
        break;
      case 'messageRules':
        icon = <AssignmentIcon sx={{ fontSize: 40 }} />;
        translationModule = 'messageRules';
        break;
      case 'passwords':
        icon = <PasswordIcon sx={{ fontSize: 40 }} />;
        translationModule = 'passwords';
        break;
      case 'dashboard':
        icon = <DashboardIcon sx={{ fontSize: 40 }} />;
        translationModule = 'dashboard';
        break;
      case 'emails':
        icon = <EmailIcon sx={{ fontSize: 40 }} />;
        translationModule = 'emails';
        break;
      case 'finance':
        icon = <FinanceIcon sx={{ fontSize: 40 }} />;
        translationModule = 'finance';
        break;
      case 'employers':
        icon = <EmployerIcon sx={{ fontSize: 40 }} />;
        translationModule = 'employers';
        break;
      case 'positions':
        icon = <PositionIcon sx={{ fontSize: 40 }} />;
        translationModule = 'positions';
        break;
      case 'groups':
        icon = <GroupIcon sx={{ fontSize: 40 }} />;
        translationModule = 'groups';
        break;
      case 'announcements':
        icon = <AssignmentIcon sx={{ fontSize: 40 }} />;
        translationModule = 'announcements';
        break;
      default:
        icon = customIcon ? customIcon : <AddIcon sx={{ fontSize: 40 }} />;
        translationModule = 'default';
        break;
    }

    // Determinar qual nome de módulo usar em traduções
    const moduleTranslationName = moduleName || translationModule;
    const moduleTranslationNamePlural = moduleNamePlural || `${moduleTranslationName}s`;

    // Usar traduções específicas do módulo se existirem, caso contrário, usar traduções compartilhadas
    const moduleTitle = i18n.exists(`${translationModule}.empty.title`) ? 
      i18n.t(`${translationModule}.empty.title`) : 
      i18n.t("shared.empty.title", { module: moduleTranslationName });

    const moduleMessage = i18n.exists(`${translationModule}.empty.message`) ? 
      i18n.t(`${translationModule}.empty.message`) : 
      i18n.t("shared.empty.message", { module: moduleTranslationNamePlural });

    const moduleButtonText = i18n.exists(`${translationModule}.buttons.add`) ? 
      i18n.t(`${translationModule}.buttons.add`) : 
      i18n.t("shared.buttons.add", { module: moduleTranslationName });

    return {
      title: title || moduleTitle,
      message: message || moduleMessage,
      buttonText: buttonText || moduleButtonText,
      icon: icon,
    };
  };

  const content = getContent();

  return (
    <BaseEmptyState
      icon={content.icon}
      title={content.title}
      message={content.message}
      buttonText={content.buttonText}
      onAction={onCreateNew}
      showButton={showButton}
    />
  );
};

export default EmptyState;