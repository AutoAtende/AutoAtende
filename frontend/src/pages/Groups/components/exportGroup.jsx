// Exportação centralizada de todos os componentes do sistema de Grupos Automáticos

// Componentes principais
export { default as CreateGroupSeriesModal } from './CreateGroupSeriesModal';
export { default as GroupSeriesInfoModal } from './GroupSeriesInfoModal';
export { default as GroupSeriesTab } from './GroupSeriesTab';
export { default as GroupMonitoringDashboard } from './GroupMonitoringDashboard';

// Componentes de integração com Landing Pages
//export { default as LandingPageGroupSeriesSelector } from './LandingPageGroupSeriesSelector';
//export { default as LandingPageGroupIntegration } from './LandingPageGroupIntegration';

// Componentes de notificação e status
export { default as GroupSeriesNotificationProvider } from '../provider/GroupSeriesNotificationProvider';
export { default as GroupSeriesSystemStatus } from './GroupSeriesSystemStatus';
export { default as GroupSeriesStatusWidget } from '../widgets/GroupSeriesStatusWidget';

// Componentes de configuração
export { default as GroupSeriesAdvancedSettings } from './GroupSeriesAdvancedSettings';

// Hooks customizados
export * from '../../../hooks/useGroupSeries';

// Re-exportar contextos relacionados
export { useGroupSeriesNotifications } from '../provider/GroupSeriesNotificationProvider';

// Tipos e utilitários (se necessário)
export const GROUP_SERIES_EVENTS = {
  GROUP_CREATED: 'auto-group-created',
  GROUP_DEACTIVATED: 'auto-group-deactivated',
  SERIES_UPDATED: 'group-series',
  MONITORING_STATS: 'group-monitoring-stats',
  SERIES_NEAR_CAPACITY: 'series-near-capacity'
};

export const GROUP_SERIES_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ERROR: 'error',
  INACTIVE: 'inactive'
};

export const DEFAULT_SERIES_CONFIG = {
  maxParticipants: 256,
  thresholdPercentage: 95,
  autoCreateEnabled: true,
  createFirstGroup: true
};

// Utilitários para validação
export const validateSeriesConfig = (config) => {
  const errors = {};
  
  if (!config.name?.trim()) {
    errors.name = 'Nome da série é obrigatório';
  }
  
  if (!config.baseGroupName?.trim()) {
    errors.baseGroupName = 'Nome base do grupo é obrigatório';
  }
  
  if (!config.whatsappId) {
    errors.whatsappId = 'Conexão WhatsApp é obrigatória';
  }
  
  if (config.maxParticipants < 10 || config.maxParticipants > 1024) {
    errors.maxParticipants = 'Máximo de participantes deve estar entre 10 e 1024';
  }
  
  if (config.thresholdPercentage < 50 || config.thresholdPercentage > 99) {
    errors.thresholdPercentage = 'Limiar deve estar entre 50% e 99%';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utilitário para calcular ocupação
export const calculateOccupancy = (currentParticipants, maxParticipants) => {
  if (maxParticipants <= 0) return 0;
  return Math.min(100, (currentParticipants / maxParticipants) * 100);
};

// Utilitário para determinar se deve criar próximo grupo
export const shouldCreateNextGroup = (currentParticipants, maxParticipants, threshold) => {
  const occupancy = calculateOccupancy(currentParticipants, maxParticipants);
  return occupancy >= threshold;
};

// Utilitário para formatar estatísticas
export const formatSeriesStats = (stats) => {
  return {
    ...stats,
    occupancyPercentage: stats.totalCapacity > 0 
      ? (stats.totalParticipants / stats.totalCapacity) * 100 
      : 0,
    efficiency: stats.totalGroups > 0 
      ? (stats.totalParticipants / (stats.totalGroups * 256)) * 100 
      : 0
  };
};

// Utilitário para gerar nome de grupo
export const generateGroupName = (baseGroupName, groupNumber) => {
  if (groupNumber <= 1) {
    return baseGroupName;
  }
  return `${baseGroupName} #${groupNumber}`;
};

// Utilitário para cores de status
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
    case 'healthy':
      return 'success';
    case 'warning':
    case 'near_capacity':
      return 'warning';
    case 'error':
    case 'failed':
      return 'error';
    case 'paused':
    case 'inactive':
      return 'default';
    default:
      return 'primary';
  }
};

// Utilitário para ícones de status
export const getStatusIcon = (status) => {
  switch (status) {
    case 'active':
    case 'healthy':
      return 'CheckCircle';
    case 'warning':
    case 'near_capacity':
      return 'Warning';
    case 'error':
    case 'failed':
      return 'Error';
    case 'paused':
      return 'Pause';
    case 'inactive':
      return 'Stop';
    default:
      return 'Info';
  }
};

// Configurações padrão para diferentes tipos de landing pages
export const LANDING_PAGE_PRESETS = {
  sales: {
    name: 'Vendas',
    maxParticipants: 256,
    thresholdPercentage: 95,
    groupInviteMessage: {
      enabled: true,
      message: 'Parabéns! Você foi selecionado(a) para participar do nosso grupo exclusivo de vendas. Clique no link abaixo para entrar:'
    }
  },
  
  support: {
    name: 'Suporte',
    maxParticipants: 128,
    thresholdPercentage: 90,
    groupInviteMessage: {
      enabled: true,
      message: 'Bem-vindo(a) ao nosso grupo de suporte! Aqui você receberá ajuda e poderá tirar suas dúvidas:'
    }
  },
  
  community: {
    name: 'Comunidade',
    maxParticipants: 512,
    thresholdPercentage: 85,
    groupInviteMessage: {
      enabled: true,
      message: 'Você agora faz parte da nossa comunidade! Conecte-se com outros membros e compartilhe experiências:'
    }
  },
  
  course: {
    name: 'Curso',
    maxParticipants: 200,
    thresholdPercentage: 95,
    groupInviteMessage: {
      enabled: true,
      message: 'Sua matrícula foi confirmada! Entre no grupo do curso para receber materiais e se conectar com outros alunos:'
    }
  }
};

// Utilitário para aplicar preset
export const applyPreset = (presetName, customConfig = {}) => {
  const preset = LANDING_PAGE_PRESETS[presetName];
  if (!preset) {
    throw new Error(`Preset '${presetName}' não encontrado`);
  }
  
  return {
    ...DEFAULT_SERIES_CONFIG,
    ...preset,
    ...customConfig
  };
};