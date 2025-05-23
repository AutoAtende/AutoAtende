import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Alert
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  Close as CloseIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Chat as ChatIcon,
  CallSplit as CallSplitIcon,
  Stop as StopIcon,
  PlayArrow as PlayArrowIcon,
  PersonAdd as PersonAddIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Http as HttpIcon,
  SwapCalls as SwapCallsIcon,
  Api as ApiIcon,
  LocalOffer as LocalOfferIcon,
  Psychology as PsychologyIcon,
  Menu as MenuIcon,
  QueuePlayNext as QueuePlayNextIcon,
  Storage as StorageIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Comment as CommentIcon,
  HourglassEmpty as InactivityIcon
} from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import { toast } from '../../../helpers/toast';
import api from '../../../services/api';

import AttendantNodeDrawer from './AttendantNodeDrawer';
import ConditionalNodeDrawer from './ConditionalNodeDrawer';
import ImageNodeDrawer from './ImageNodeDrawer';
import MessageNodeDrawer from './MessageNodeDrawer';
import OpenAINodeDrawer from './OpenAINodeDrawer';
import TypebotNodeDrawer from './TypebotNodeDrawer';
import MenuNodeDrawer from './MenuNodeDrawer';
import QueueNodeDrawer from './QueueNodeDrawer';
import QuestionNodeDrawer from './QuestionNodeDrawer';
import WebhookNodeDrawer from './WebhookNodeDrawer';
import SwitchFlowNodeDrawer from './SwitchFlowNodeDrawer';
import ApiNodeDrawer from './ApiNodeDrawer';
import TagNodeDrawer from './TagNodeDrawer';
import DatabaseNodeDrawer from './DatabaseNodeDrawer';
import ScheduleNodeDrawer from './ScheduleNodeDrawer';
import AppointmentNodeDrawer from './AppointmentNodeDrawer';
import InternalMessageNodeDrawer from './InternalMessageNodeDrawer';
import InactivityNodeDrawer from './InactivityNodeDrawer';

import { validateUrl, validateVariableName } from '../../../utils/api-error-handler';

const NodeDrawer = ({ open, onClose, node, updateNodeData, companyId, nodes }) => {
  const theme = useTheme();
  const [nodeData, setNodeData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [flowVariables, setFlowVariables] = useState([]);

  useEffect(() => {
    if (node && node.data) {
      setNodeData({ ...node.data });
      setValidationErrors({});
    } else {
      setNodeData(null);
    }
  }, [node]);

  const extractVariablesFromNodes = useCallback((nodes) => {
    if (!nodes || !Array.isArray(nodes)) return [];
    
    const variables = [];
    
    nodes.forEach(node => {
      if (node.type === 'questionNode' && node.data && node.data.variableName) {
        variables.push({
          name: node.data.variableName,
          type: 'question',
          nodeId: node.id,
          description: node.data.question || 'Pergunta'
        });
      }
      
      if ((node.type === 'apiNode' || node.type === 'webhookNode') && node.data && node.data.responseVariable) {
        variables.push({
          name: node.data.responseVariable,
          type: 'api',
          nodeId: node.id,
          description: node.data.url || 'Resposta da API'
        });
      }
      
      if (node.type === 'databaseNode' && node.data && node.data.responseVariable) {
        variables.push({
          name: node.data.responseVariable,
          type: 'database',
          nodeId: node.id,
          description: 'Resposta do banco de dados'
        });
      }
    });
    
    return variables;
  }, []);
  
  useEffect(() => {
    if (open) {
      const allNodes = nodes || [];
      const variables = extractVariablesFromNodes(allNodes);
      setFlowVariables(variables);
    }
  }, [open, nodes, extractVariablesFromNodes]);

  // Condicional de retorno movido para depois de todos os hooks
  if (!node || !nodeData) {
    return null;
  }

  const handleNodeDataChange = (newData) => {
    setNodeData(newData);
  };

  const validateNodeData = () => {
    let errors = {};
    
    switch (node.type) {
      case 'apiNode':
        if (validateUrl && validateUrl(nodeData.url)) {
          errors.url = validateUrl(nodeData.url);
        }
        
        if (nodeData.responseVariable && validateVariableName && validateVariableName(nodeData.responseVariable)) {
          errors.responseVariable = validateVariableName(nodeData.responseVariable);
        }
        break;
        
      case 'internalMessageNode':
        if (!nodeData.message || nodeData.message.trim() === '') {
          errors.message = "A mensagem é obrigatória";
        }
        break;

      case 'inactivityNode':
        if (nodeData.inactivityConfig && !nodeData.inactivityConfig.useGlobalSettings) {
          if (nodeData.inactivityConfig.timeoutMinutes < 1 || nodeData.inactivityConfig.timeoutMinutes > 60) {
            errors.timeoutMinutes = "Timeout deve estar entre 1 e 60 minutos";
          }
          
          if (nodeData.inactivityConfig.warningTimeoutMinutes < 1 || 
              nodeData.inactivityConfig.warningTimeoutMinutes >= nodeData.inactivityConfig.timeoutMinutes) {
            errors.warningTimeoutMinutes = "Timeout de aviso deve ser menor que o timeout principal";
          }
          
          if (nodeData.inactivityConfig.action === 'transfer' && !nodeData.inactivityConfig.transferQueueId) {
            errors.transferQueueId = "Selecione uma fila para transferência";
          }
          
          if (!nodeData.inactivityConfig.warningMessage?.trim()) {
            errors.warningMessage = "Mensagem de aviso é obrigatória";
          }
        }
        break;
        
      case 'webhookNode':
        if (validateUrl && validateUrl(nodeData.url)) {
          errors.url = validateUrl(nodeData.url);
        }
        
        if (nodeData.variableName && validateVariableName && validateVariableName(nodeData.variableName)) {
          errors.variableName = validateVariableName(nodeData.variableName);
        }
        break;
        
      case 'questionNode':
        if (!nodeData.question || nodeData.question.trim() === '') {
          errors.question = "A pergunta é obrigatória";
        }
        
        if (validateVariableName && validateVariableName(nodeData.variableName)) {
          errors.variableName = validateVariableName(nodeData.variableName);
        }
        
        if (nodeData.inputType === 'options' && (!nodeData.options || nodeData.options.length === 0)) {
          errors.options = "É necessário adicionar pelo menos uma opção";
        }
        break;
        
      case 'switchFlowNode':
        if (!nodeData.targetFlowId) {
          errors.targetFlowId = "É necessário selecionar um fluxo de destino";
        }
        break;
        
      case 'attendantNode':
        if (nodeData.assignmentType === 'manual' && !nodeData.assignedUserId) {
          errors.assignedUserId = "Por favor, selecione um atendente quando o tipo de atribuição for manual";
        }
        break;
        
      case 'tagNode':
        if (!nodeData.tags || nodeData.tags.length === 0) {
          errors.tags = "É necessário selecionar pelo menos uma tag";
        }
        break;

      case 'menuNode':
        if (!nodeData.menuTitle || nodeData.menuTitle.trim() === '') {
          errors.menuTitle = "O título do menu é obrigatório";
        }
        
        if (!nodeData.menuOptions || nodeData.menuOptions.length === 0) {
          errors.menuOptions = "É necessário adicionar pelo menos uma opção ao menu";
        }
        break;

      case 'openaiNode':
        if (!nodeData.typebotIntegration?.name || nodeData.typebotIntegration.name.trim() === '') {
          errors.name = "O nome da integração é obrigatório";
        }
        
        if (!nodeData.typebotIntegration?.apiKey || nodeData.typebotIntegration.apiKey.trim() === '') {
          errors.apiKey = "A chave de API é obrigatória";
        }
        
        if (!nodeData.typebotIntegration?.prompt || nodeData.typebotIntegration.prompt.trim() === '') {
          errors.prompt = "O prompt é obrigatório";
        }
        break;

      case 'typebotNode':
        if (!nodeData.typebotIntegration?.name || nodeData.typebotIntegration.name.trim() === '') {
          errors.name = "O nome da integração é obrigatório";
        }
        
        if (!nodeData.typebotIntegration?.typebotUrl || nodeData.typebotIntegration.typebotUrl.trim() === '') {
          errors.typebotUrl = "A URL do Typebot é obrigatória";
        }
        
        if (!nodeData.typebotIntegration?.typebotId || nodeData.typebotIntegration.typebotId.trim() === '') {
          errors.typebotId = "O ID do Typebot é obrigatório";
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateNodeData()) {
      toast.error("Por favor, corrija os erros antes de salvar");
      return;
    }
    
    setIsSaving(true);
    
    try {
      updateNodeData(node.id, nodeData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar nó:", error);
      toast.error("Ocorreu um erro ao salvar as configurações do nó");
    } finally {
      setIsSaving(false);
    }
  };

  const getNodeTypeColor = (nodeType) => {
    switch (nodeType) {
      case 'startNode': return theme.palette.node?.start || '#10b981';
      case 'messageNode': return theme.palette.node?.message || '#3b82f6';
      case 'conditionalNode': return theme.palette.node?.conditional || '#f59e0b';
      case 'endNode': return theme.palette.node?.end || '#ef4444';
      case 'attendantNode': return theme.palette.info?.main || '#0ea5e9';
      case 'imageNode': return theme.palette.success?.main || '#10b981';
      case 'questionNode': return theme.palette.warning?.main || '#f59e0b';
      case 'webhookNode': return theme.palette.secondary?.main || '#9333ea';
      case 'switchFlowNode': return theme.palette.info?.main || '#0ea5e9';
      case 'apiNode': return theme.palette.info?.dark || '#0369a1';
      case 'tagNode': return theme.palette.success?.main || '#10b981';
      case 'openaiNode': return theme.palette.info?.dark || '#0369a1';
      case 'typebotNode': return theme.palette.secondary?.main || '#9333ea';
      case 'menuNode': return theme.palette.primary?.main || '#9333ea';
      case 'queueNode': return theme.palette.secondary?.dark || '#7c3aed';
      case 'databaseNode': return theme.palette.primary?.main || '0ea5e9';
      case 'scheduleNode': return theme.palette.primary?.main || '0ea5e9';
      case 'appointmentNode': return theme.palette.primary?.main || '0ea5e9';
      case 'internalMessageNode': return theme.palette.primary?.main || '0ea5e9';
      case 'inactivityNode': return theme.palette.warning?.main || '#f59e0b';
      default: return theme.palette.primary.main;
    }
  };

  const getNodeTypeIcon = (nodeType) => {
    switch (nodeType) {
      case 'startNode': return <PlayArrowIcon fontSize="small" />;
      case 'messageNode': return <ChatIcon fontSize="small" />;
      case 'conditionalNode': return <CallSplitIcon fontSize="small" />;
      case 'endNode': return <StopIcon fontSize="small" />;
      case 'attendantNode': return <PersonAddIcon fontSize="small" />;
      case 'imageNode': return <ImageIcon fontSize="small" />;
      case 'questionNode': return <QuestionAnswerIcon fontSize="small" />;
      case 'webhookNode': return <HttpIcon fontSize="small" />;
      case 'switchFlowNode': return <SwapCallsIcon fontSize="small" />;
      case 'apiNode': return <ApiIcon fontSize="small" />;
      case 'tagNode': return <LocalOfferIcon fontSize="small" />;
      case 'openaiNode': return <PsychologyIcon fontSize="small" />;
      case 'typebotNode': return <PlayArrowIcon fontSize="small" />;
      case 'menuNode': return <MenuIcon fontSize="small" />;
      case 'queueNode': return <QueuePlayNextIcon fontSize="small" />;
      case 'databaseNode': return <StorageIcon fontSize="small" />;
      case 'scheduleNode': return <AccessTimeIcon fontSize="small" />;
      case 'appointmentNode': return <EventIcon fontSize="small" />;
      case 'internalMessageNode': return <CommentIcon fontSize="small" />;
      case 'inactivityNode': return <InactivityIcon fontSize="small" />;
      default: return <ChatIcon fontSize="small" />;
    }
  };

  const renderNodeProperties = () => {
    switch (node.type) {
      case 'messageNode':
        return <MessageNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'conditionalNode':
        return <ConditionalNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'attendantNode':
        return <AttendantNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'imageNode':
        return <ImageNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;

      case 'internalMessageNode':
        return <InternalMessageNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} flowVariables={flowVariables} />;

      case 'inactivityNode':
        return <InactivityNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} flowVariables={flowVariables} />;
        
      case 'questionNode':
        return <QuestionNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'webhookNode':
        return <WebhookNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;

      case 'scheduleNode':
        return <ScheduleNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'switchFlowNode':
        return <SwitchFlowNodeDrawer 
          nodeData={nodeData} 
          onChange={handleNodeDataChange} 
          companyId={companyId} 
        />;
  
        case 'apiNode':
          return <ApiNodeDrawer 
            nodeData={{ ...nodeData, nodeId: node.id }} 
            onChange={handleNodeDataChange} 
            flowVariables={flowVariables}
          />;
      
      case 'tagNode':
        return <TagNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
      
      case 'openaiNode':
        return <OpenAINodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'typebotNode':
        return <TypebotNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;

      case 'menuNode':
        return <MenuNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;

      case 'databaseNode':
        return <DatabaseNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'queueNode':
        return <QueueNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      case 'appointmentNode':
        return <AppointmentNodeDrawer nodeData={nodeData} onChange={handleNodeDataChange} />;
        
      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {i18n.t('flowBuilder.properties.unknownNodeType')}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450 },
          p: 0,
          overflow: 'hidden',
          zIndex: 1400,
          position: 'fixed', 
          height: { xs: '100%', sm: 'calc(100% - 64px)' },
          marginTop: { xs: 0, sm: '64px' },
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: alpha(getNodeTypeColor(node.type), 0.05),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getNodeTypeIcon(node.type)}
            <Typography variant="h6">
              {i18n.t('flowBuilder.properties.title')}
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box 
          sx={{ 
            flex: 1,
            p: 0,
            overflowY: 'auto',
          }}
        >
          {renderNodeProperties()}
          
          {Object.keys(validationErrors).length > 0 && (
            <Alert severity="warning" sx={{ m: 2 }}>
              Por favor, corrija os erros antes de salvar.
            </Alert>
          )}
        </Box>
        
        <Box 
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider', 
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
            disableElevation
            disabled={isSaving || Object.keys(validationErrors).length > 0}
            sx={{ mb: 1 }}
          >
            {isSaving 
              ? "Salvando..." 
              : i18n.t('buttons.save')}
          </Button>
          
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={onClose}
          >
            {i18n.t('buttons.cancel')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default NodeDrawer;