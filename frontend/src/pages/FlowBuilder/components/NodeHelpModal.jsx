import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Paper,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useMediaQuery,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { alpha, useTheme } from '@mui/material/styles';
import { i18n } from '../../../translate/i18n';

// Ícones para propriedades/características dos nós
import {
  Input as InputIcon,
  Output as OutputIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  TouchApp as TouchAppIcon,
  Devices as DevicesIcon,
  LocalOffer as LocalOfferIcon,
  QueuePlayNext as QueuePlayNextIcon,
  Event as EventIcon
} from '@mui/icons-material';

// Componente para a área de conteúdo das abas
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`node-tabpanel-${index}`}
      aria-labelledby={`node-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const NodeHelpModal = ({ open, onClose, nodeTypes }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [categoryTabValue, setCategoryTabValue] = useState(0);

  // Agrupar os nós por categoria
  const messageNodes = nodeTypes.filter(node => node.category === 'message');
  const flowNodes = nodeTypes.filter(node => node.category === 'flow');
  const integrationNodes = nodeTypes.filter(node => node.category === 'integration');

  // Conteúdos de documentação para cada tipo de nó
  const nodeDocumentation = {
    // Nós de mensagem
    messageNode: {
      title: i18n.t('flowBuilder.help.messageNode.title'),
      description: i18n.t('flowBuilder.help.messageNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.messageNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.messageType'), description: i18n.t('flowBuilder.help.messageNode.properties.messageType') },
        { name: i18n.t('flowBuilder.help.properties.message'), description: i18n.t('flowBuilder.help.messageNode.properties.message') },
        { name: i18n.t('flowBuilder.help.properties.mediaUrl'), description: i18n.t('flowBuilder.help.messageNode.properties.mediaUrl') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.connections.singleOutput') }
      ],
      usage: i18n.t('flowBuilder.help.messageNode.usage'),
      example: i18n.t('flowBuilder.help.messageNode.example')
    },
    appointmentNode: {
      title: 'Nó de Agendamento',
      description: 'Este nó inicia um fluxo de agendamento guiado que permite aos contatos marcar horários diretamente pelo chat.',
      properties: [
        { name: i18n.t('flowBuilder.properties.label'), description: 'Rótulo identificador do nó (opcional)' },
        { name: 'Mensagem de Boas-vindas', description: 'Texto inicial exibido ao iniciar o processo de agendamento' },
        { name: 'Tempo Limite', description: 'Tempo máximo (em minutos) para o contato completar o processo de agendamento' }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: 'Nenhuma saída - inicia o processo de agendamento e encerra o fluxo' }
      ],
      usage: 'Utilize este nó quando precisar oferecer aos seus contatos a possibilidade de agendar compromissos, consultas ou serviços diretamente pelo chat. O sistema guiará o contato pelo processo completo de agendamento.',
      example: 'Uma clínica médica utiliza este nó para permitir que pacientes agendem consultas, escolhendo entre datas e horários disponíveis sem precisar ligar para a recepção.'
    },
    imageNode: {
      title: i18n.t('flowBuilder.help.imageNode.title'),
      description: i18n.t('flowBuilder.help.imageNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.imageNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.mediaUrl'), description: i18n.t('flowBuilder.help.imageNode.properties.mediaUrl') },
        { name: i18n.t('flowBuilder.help.properties.caption'), description: i18n.t('flowBuilder.help.imageNode.properties.caption') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.connections.singleOutput') }
      ],
      usage: i18n.t('flowBuilder.help.imageNode.usage'),
      example: i18n.t('flowBuilder.help.imageNode.example')
    },
    questionNode: {
      title: i18n.t('flowBuilder.help.questionNode.title'),
      description: i18n.t('flowBuilder.help.questionNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.questionNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.question'), description: i18n.t('flowBuilder.help.questionNode.properties.question') },
        { name: i18n.t('flowBuilder.help.properties.variableName'), description: i18n.t('flowBuilder.help.questionNode.properties.variableName') },
        { name: i18n.t('flowBuilder.help.properties.inputType'), description: i18n.t('flowBuilder.help.questionNode.properties.inputType') },
        { name: i18n.t('flowBuilder.help.properties.options'), description: i18n.t('flowBuilder.help.questionNode.properties.options') },
        { name: i18n.t('flowBuilder.help.properties.validationType'), description: i18n.t('flowBuilder.help.questionNode.properties.validationType') },
        { name: i18n.t('flowBuilder.help.properties.useValidationErrorOutput'), description: i18n.t('flowBuilder.help.questionNode.properties.useValidationErrorOutput') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.defaultOutput'), description: i18n.t('flowBuilder.help.questionNode.connections.defaultOutput') },
        { type: i18n.t('flowBuilder.help.connections.optionOutputs'), description: i18n.t('flowBuilder.help.questionNode.connections.optionOutputs') },
        { type: i18n.t('flowBuilder.help.connections.validationErrorOutput'), description: i18n.t('flowBuilder.help.questionNode.connections.validationErrorOutput') }
      ],
      usage: i18n.t('flowBuilder.help.questionNode.usage'),
      example: i18n.t('flowBuilder.help.questionNode.example')
    },

    queueNode: {
      title: i18n.t('flowBuilder.nodes.queue'),
      description: i18n.t('flowBuilder.help.queueNode.description', 'Este nó transfere o atendimento para uma fila específica e encerra o fluxo.'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.queueNode.properties.label', 'Rótulo identificador do nó (opcional)') },
        { name: i18n.t('flowBuilder.help.properties.queue'), description: i18n.t('flowBuilder.help.queueNode.properties.queue', 'Fila para a qual o atendimento será transferido') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput', 'Uma única entrada no topo do nó') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.queueNode.connections.output', 'Nenhuma saída - encerra o fluxo e transfere para a fila') }
      ],
      usage: i18n.t('flowBuilder.help.queueNode.usage', 'Utilize este nó quando precisar transferir o atendimento para uma fila específica e encerrar o fluxo atual. O ticket ficará pendente na fila selecionada.'),
      example: i18n.t('flowBuilder.help.queueNode.example', 'Um cliente solicita atendimento especializado, e você transfere o ticket para a fila de "Suporte Técnico", encerrando o fluxo de bot.')
    },

    // Nós de Fluxo
    conditionalNode: {
      title: i18n.t('flowBuilder.help.conditionalNode.title'),
      description: i18n.t('flowBuilder.help.conditionalNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.conditionalNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.variable'), description: i18n.t('flowBuilder.help.conditionalNode.properties.variable') },
        { name: i18n.t('flowBuilder.help.properties.conditions'), description: i18n.t('flowBuilder.help.conditionalNode.properties.conditions') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.defaultOutput'), description: i18n.t('flowBuilder.help.conditionalNode.connections.defaultOutput') },
        { type: i18n.t('flowBuilder.help.connections.conditionOutputs'), description: i18n.t('flowBuilder.help.conditionalNode.connections.conditionOutputs') }
      ],
      usage: i18n.t('flowBuilder.help.conditionalNode.usage'),
      example: i18n.t('flowBuilder.help.conditionalNode.example')
    },
    endNode: {
      title: i18n.t('flowBuilder.help.endNode.title'),
      description: i18n.t('flowBuilder.help.endNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.endNode.properties.label') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.endNode.connections.output') }
      ],
      usage: i18n.t('flowBuilder.help.endNode.usage'),
      example: i18n.t('flowBuilder.help.endNode.example')
    },
    switchFlowNode: {
      title: i18n.t('flowBuilder.help.switchFlowNode.title'),
      description: i18n.t('flowBuilder.help.switchFlowNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.switchFlowNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.targetFlow'), description: i18n.t('flowBuilder.help.switchFlowNode.properties.targetFlow') },
        { name: i18n.t('flowBuilder.help.properties.transferVariables'), description: i18n.t('flowBuilder.help.switchFlowNode.properties.transferVariables') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.switchFlowNode.connections.output') }
      ],
      usage: i18n.t('flowBuilder.help.switchFlowNode.usage'),
      example: i18n.t('flowBuilder.help.switchFlowNode.example')
    },

    // Nós de Integração
    attendantNode: {
      title: i18n.t('flowBuilder.help.attendantNode.title'),
      description: i18n.t('flowBuilder.help.attendantNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.attendantNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.assignmentType'), description: i18n.t('flowBuilder.help.attendantNode.properties.assignmentType') },
        { name: i18n.t('flowBuilder.help.properties.assignedUser'), description: i18n.t('flowBuilder.help.attendantNode.properties.assignedUser') },
        { name: i18n.t('flowBuilder.help.properties.timeout'), description: i18n.t('flowBuilder.help.attendantNode.properties.timeout') },
        { name: i18n.t('flowBuilder.help.properties.endFlow'), description: i18n.t('flowBuilder.help.attendantNode.properties.endFlow') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.attendantNode.connections.output') }
      ],
      usage: i18n.t('flowBuilder.help.attendantNode.usage'),
      example: i18n.t('flowBuilder.help.attendantNode.example')
    },
    webhookNode: {
      title: i18n.t('flowBuilder.help.webhookNode.title'),
      description: i18n.t('flowBuilder.help.webhookNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.webhookNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.method'), description: i18n.t('flowBuilder.help.webhookNode.properties.method') },
        { name: i18n.t('flowBuilder.help.properties.url'), description: i18n.t('flowBuilder.help.webhookNode.properties.url') },
        { name: i18n.t('flowBuilder.help.properties.headers'), description: i18n.t('flowBuilder.help.webhookNode.properties.headers') },
        { name: i18n.t('flowBuilder.help.properties.variableName'), description: i18n.t('flowBuilder.help.webhookNode.properties.variableName') },
        { name: i18n.t('flowBuilder.help.properties.secretKey'), description: i18n.t('flowBuilder.help.webhookNode.properties.secretKey') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.connections.singleOutput') }
      ],
      usage: i18n.t('flowBuilder.help.webhookNode.usage'),
      example: i18n.t('flowBuilder.help.webhookNode.example')
    },
    apiNode: {
      title: i18n.t('flowBuilder.help.apiNode.title'),
      description: i18n.t('flowBuilder.help.apiNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.apiNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.method'), description: i18n.t('flowBuilder.help.apiNode.properties.method') },
        { name: i18n.t('flowBuilder.help.properties.url'), description: i18n.t('flowBuilder.help.apiNode.properties.url') },
        { name: i18n.t('flowBuilder.help.properties.headers'), description: i18n.t('flowBuilder.help.apiNode.properties.headers') },
        { name: i18n.t('flowBuilder.help.properties.contentType'), description: i18n.t('flowBuilder.help.apiNode.properties.contentType') },
        { name: i18n.t('flowBuilder.help.properties.body'), description: i18n.t('flowBuilder.help.apiNode.properties.body') },
        { name: i18n.t('flowBuilder.help.properties.queryParams'), description: i18n.t('flowBuilder.help.apiNode.properties.queryParams') },
        { name: i18n.t('flowBuilder.help.properties.responseVariable'), description: i18n.t('flowBuilder.help.apiNode.properties.responseVariable') },
        { name: i18n.t('flowBuilder.help.properties.responseFilter'), description: i18n.t('flowBuilder.help.apiNode.properties.responseFilter') },
        { name: i18n.t('flowBuilder.help.properties.authentication'), description: i18n.t('flowBuilder.help.apiNode.properties.authentication') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.successOutput'), description: i18n.t('flowBuilder.help.apiNode.connections.successOutput') },
        { type: i18n.t('flowBuilder.help.connections.errorOutput'), description: i18n.t('flowBuilder.help.apiNode.connections.errorOutput') }
      ],
      usage: i18n.t('flowBuilder.help.apiNode.usage'),
      example: i18n.t('flowBuilder.help.apiNode.example')
    },
    
    // Novo nó de Tag
    tagNode: {
      title: i18n.t('flowBuilder.nodes.tag.title'),
      description: i18n.t('flowBuilder.nodes.tag.helpText'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.properties.label') },
        { name: i18n.t('flowBuilder.nodes.tag.operation'), description: i18n.t('flowBuilder.nodes.tag.operation') },
        { name: i18n.t('flowBuilder.nodes.tag.selectionMode'), description: i18n.t('flowBuilder.nodes.tag.selectionMode') },
        { name: i18n.t('flowBuilder.nodes.tag.selectTags'), description: i18n.t('flowBuilder.nodes.tag.selectTags') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.connections.singleOutput') }
      ],
      usage: i18n.t('flowBuilder.nodes.tag.helpText'),
      example: i18n.t('flowBuilder.nodes.tag.helpText')
    },

    openaiNode: {
      title: i18n.t('flowBuilder.help.openaiNode.title'),
      description: i18n.t('flowBuilder.help.openaiNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.openaiNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.name'), description: i18n.t('flowBuilder.help.openaiNode.properties.name') },
        { name: i18n.t('flowBuilder.help.properties.apiKey'), description: i18n.t('flowBuilder.help.openaiNode.properties.apiKey') },
        { name: i18n.t('flowBuilder.help.properties.prompt'), description: i18n.t('flowBuilder.help.openaiNode.properties.prompt') },
        { name: i18n.t('flowBuilder.help.properties.voice'), description: i18n.t('flowBuilder.help.openaiNode.properties.voice') },
        { name: i18n.t('flowBuilder.help.properties.temperature'), description: i18n.t('flowBuilder.help.openaiNode.properties.temperature') },
        { name: i18n.t('flowBuilder.help.properties.maxTokens'), description: i18n.t('flowBuilder.help.openaiNode.properties.maxTokens') },
        { name: i18n.t('flowBuilder.help.properties.maxMessages'), description: i18n.t('flowBuilder.help.openaiNode.properties.maxMessages') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.connections.singleOutput') }
      ],
      usage: i18n.t('flowBuilder.help.openaiNode.usage'),
      example: i18n.t('flowBuilder.help.openaiNode.example')
    },
    
    // Documentação para o nó Typebot
    typebotNode: {
      title: i18n.t('flowBuilder.help.typebotNode.title'),
      description: i18n.t('flowBuilder.help.typebotNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.typebotNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.name'), description: i18n.t('flowBuilder.help.typebotNode.properties.name') },
        { name: i18n.t('flowBuilder.help.properties.typebotUrl'), description: i18n.t('flowBuilder.help.typebotNode.properties.typebotUrl') },
        { name: i18n.t('flowBuilder.help.properties.typebotId'), description: i18n.t('flowBuilder.help.typebotNode.properties.typebotId') },
        { name: i18n.t('flowBuilder.help.properties.typebotToken'), description: i18n.t('flowBuilder.help.typebotNode.properties.typebotToken') },
        { name: i18n.t('flowBuilder.help.properties.saveResponse'), description: i18n.t('flowBuilder.help.typebotNode.properties.saveResponse') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.output'), description: i18n.t('flowBuilder.help.connections.singleOutput') }
      ],
      usage: i18n.t('flowBuilder.help.typebotNode.usage'),
      example: i18n.t('flowBuilder.help.typebotNode.example')
    },

    menuNode: {
      title: i18n.t('flowBuilder.help.menuNode.title'),
      description: i18n.t('flowBuilder.help.menuNode.description'),
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: i18n.t('flowBuilder.help.menuNode.properties.label') },
        { name: i18n.t('flowBuilder.help.properties.menuTitle'), description: i18n.t('flowBuilder.help.menuNode.properties.menuTitle') },
        { name: i18n.t('flowBuilder.help.properties.menuOptions'), description: i18n.t('flowBuilder.help.menuNode.properties.menuOptions') },
        { name: i18n.t('flowBuilder.help.properties.useEmoji'), description: i18n.t('flowBuilder.help.menuNode.properties.useEmoji') }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.input'), description: i18n.t('flowBuilder.help.connections.singleInput') },
        { type: i18n.t('flowBuilder.help.connections.defaultOutput'), description: i18n.t('flowBuilder.help.menuNode.connections.defaultOutput') },
        { type: i18n.t('flowBuilder.help.connections.optionOutputs'), description: i18n.t('flowBuilder.help.menuNode.connections.optionOutputs') }
      ],
      usage: i18n.t('flowBuilder.help.menuNode.usage'),
      example: i18n.t('flowBuilder.help.menuNode.example')
    },

    // Nó de Início
    startNode: {
      title: i18n.t('flowBuilder.nodes.start') || 'Nó de Início',
      description: "Este é o ponto de partida do seu fluxo. Cada fluxo deve ter exatamente um nó de início.",
      properties: [
        { name: i18n.t('flowBuilder.help.properties.label'), description: "Rótulo identificador do nó (opcional)" }
      ],
      connections: [
        { type: i18n.t('flowBuilder.help.connections.output'), description: "Uma única saída para iniciar o fluxo" }
      ],
      usage: "O nó de início é automaticamente executado quando o fluxo é iniciado. Use-o para começar a interagir com o usuário.",
      example: "Um fluxo de boas-vindas começa com um nó de início, seguido por um nó de mensagem com uma saudação."
    }
  };
  
  // Função para obter a documentação de um nó específico
  const getNodeDoc = (nodeType) => {
    return nodeDocumentation[nodeType] || {
      title: nodeType,
      description: 'Documentação não disponível para este tipo de nó.',
      properties: [],
      connections: [],
      usage: '',
      example: ''
    };
  };

  // Manipuladores de eventos para as abas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryTabChange = (event, newValue) => {
    setCategoryTabValue(newValue);
  };

  // Função para renderizar o esquema visual das conexões do nó
  const renderConnectionDiagram = (nodeType) => {
    // Cores e configurações para os diferentes tipos de nós
    const nodeColors = {
      startNode: theme.palette.node?.start || '#10b981',
      messageNode: theme.palette.node?.message || '#3b82f6',
      conditionalNode: theme.palette.node?.conditional || '#f59e0b',
      endNode: theme.palette.node?.end || '#ef4444',
      attendantNode: theme.palette.info?.main || '#0ea5e9',
      imageNode: theme.palette.success?.main || '#10b981',
      questionNode: theme.palette.warning?.main || '#f59e0b',
      webhookNode: theme.palette.secondary?.main || '#9333ea',
      switchFlowNode: theme.palette.info?.main || '#0ea5e9',
      apiNode: theme.palette.info?.dark || '#0369a1',
      tagNode: theme.palette.success?.main || '#10b981',
      appointmentNode: theme.palette.info?.main || '#0ea5e9'
    };

    const nodeColor = nodeColors[nodeType] || theme.palette.primary.main;

    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        {/* StartNode */}
        {nodeType === 'startNode' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                width: 120, 
                height: 90, 
                borderRadius: 2, 
                mb: 2, 
                bgcolor: nodeColor,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Typography variant="subtitle2">Início</Typography>
              <Box sx={{ 
                position: 'absolute', 
                bottom: -10, 
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: `10px solid ${nodeColor}`
              }} />
            </Paper>
            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2), 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`
            }}>
              <Typography variant="caption">Saída única</Typography>
            </Box>
          </Box>
        )}

{nodeType === 'appointmentNode' && (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Box sx={{ 
      width: 80, 
      height: 30, 
      backgroundColor: alpha(nodeColor, 0.2), 
      borderRadius: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: `1px dashed ${nodeColor}`,
      mb: 2
    }}>
      <Typography variant="caption">Entrada única</Typography>
    </Box>

    <Paper 
      elevation={3} 
      sx={{ 
        width: 120, 
        height: 90, 
        borderRadius: 2, 
        bgcolor: nodeColor,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: -10, 
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: `10px solid ${nodeColor}`
      }} />
      <Typography variant="subtitle2">Agendamento</Typography>
    </Paper>

    <Typography variant="caption" sx={{ mt: 2, fontStyle: 'italic' }}>
      Nó terminal - inicia processo de agendamento
    </Typography>
  </Box>
)}

  {nodeType === 'queueNode' && (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ 
        width: 80, 
        height: 30, 
        backgroundColor: alpha(nodeColor, 0.2), 
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: `1px dashed ${nodeColor}`,
        mb: 2
      }}>
        <Typography variant="caption">Entrada única</Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          width: 120, 
          height: 90, 
          borderRadius: 2, 
          bgcolor: nodeColor,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: -10, 
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `10px solid ${nodeColor}`
        }} />
        <Typography variant="subtitle2">Fila</Typography>
      </Paper>

      <Typography variant="caption" sx={{ mt: 2, fontStyle: 'italic' }}>
        Nó terminal - encerra o fluxo
      </Typography>
    </Box>
  )}


        {/* EndNode */}
        {nodeType === 'endNode' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2), 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mb: 2
            }}>
              <Typography variant="caption">Entrada única</Typography>
            </Box>
            <Paper 
              elevation={3} 
              sx={{ 
                width: 120, 
                height: 90, 
                borderRadius: 2, 
                bgcolor: nodeColor,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -10, 
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: `10px solid ${nodeColor}`
              }} />
              <Typography variant="subtitle2">Fim</Typography>
            </Paper>
          </Box>
        )}

        {/* MessageNode, ImageNode, AttendantNode, WebhookNode, TagNode */}
        {['messageNode', 'imageNode', 'attendantNode', 'webhookNode', 'tagNode'].includes(nodeType) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2), 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mb: 2
            }}>
              <Typography variant="caption">Entrada única</Typography>
            </Box>

            <Paper 
              elevation={3} 
              sx={{ 
                width: 120, 
                height: 90, 
                borderRadius: 2, 
                bgcolor: nodeColor,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -10, 
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: `10px solid ${nodeColor}`
              }} />
              <Typography variant="subtitle2">
                {nodeType === 'messageNode' && 'Mensagem'}
                {nodeType === 'imageNode' && 'Imagem'}
                {nodeType === 'attendantNode' && 'Atendente'}
                {nodeType === 'webhookNode' && 'Webhook'}
                {nodeType === 'tagNode' && 'Tag'}
              </Typography>
              <Box sx={{ 
                position: 'absolute', 
                bottom: -10, 
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: `10px solid ${nodeColor}`
              }} />
            </Paper>

            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2),
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mt: 2
            }}>
              <Typography variant="caption">Saída única</Typography>
            </Box>
          </Box>
        )}

        {/* SwitchFlowNode */}
        {nodeType === 'switchFlowNode' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2), 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mb: 2
            }}>
              <Typography variant="caption">Entrada única</Typography>
            </Box>

            <Paper 
              elevation={3} 
              sx={{ 
                width: 120, 
                height: 90, 
                borderRadius: 2, 
                bgcolor: nodeColor,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -10, 
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: `10px solid ${nodeColor}`
              }} />
              <Typography variant="subtitle2">Trocar Fluxo</Typography>
            </Paper>

            <Typography variant="caption" sx={{ mt: 2, fontStyle: 'italic' }}>
              Sem saídas - encerra este fluxo e inicia outro
            </Typography>
          </Box>
        )}

        {/* ConditionalNode */}
        {nodeType === 'conditionalNode' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2), 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mb: 2
            }}>
              <Typography variant="caption">Entrada única</Typography>
            </Box>

            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', my: 2 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  width: 120, 
                  height: 90, 
                  borderRadius: 2, 
                  bgcolor: nodeColor,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: `10px solid ${nodeColor}`
                }} />
                <Typography variant="subtitle2">Condição</Typography>
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: -10, 
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: `10px solid ${nodeColor}`
                }} />

                {/* Lado direito - saídas de condição */}
                <Box sx={{ 
                  position: 'absolute', 
                  right: -10,
                  top: 15,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: `10px solid ${nodeColor}`
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  right: -10,
                  top: 45,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: `10px solid ${nodeColor}`
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  right: -10,
                  top: 75,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: `10px solid ${nodeColor}`
                }} />
              </Paper>

              {/* Saídas laterais */}
              <Box sx={{ 
                position: 'absolute',
                right: '25%', 
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'flex-start',
                minHeight: 150
              }}>
                <Box sx={{
width: 120, 
                  height: 24, 
                  backgroundColor: alpha(nodeColor, 0.2), 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${nodeColor}`
                }}>
                  <Typography variant="caption">Condição 1</Typography>
                </Box>
                <Box sx={{ 
                  width: 120, 
                  height: 24, 
                  backgroundColor: alpha(nodeColor, 0.2), 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${nodeColor}`
                }}>
                  <Typography variant="caption">Condição 2</Typography>
                </Box>
                <Box sx={{ 
                  width: 120, 
                  height: 24, 
                  backgroundColor: alpha(nodeColor, 0.2), 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${nodeColor}`
                }}>
                  <Typography variant="caption">Condição N</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              width: 120, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2),
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mt: 2
            }}>
              <Typography variant="caption">Saída default</Typography>
            </Box>
          </Box>
        )}

        {/* QuestionNode */}
        {nodeType === 'questionNode' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2), 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mb: 2
            }}>
              <Typography variant="caption">Entrada única</Typography>
            </Box>

            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', my: 2 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  width: 120, 
                  height: 90, 
                  borderRadius: 2, 
                  bgcolor: nodeColor,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: `10px solid ${nodeColor}`
                }} />
                <Typography variant="subtitle2">Pergunta</Typography>
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: -10, 
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: `10px solid ${nodeColor}`
                }} />

                {/* Lado direito - saídas de opções */}
                <Box sx={{ 
                  position: 'absolute', 
                  right: -10,
                  top: 15,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: `10px solid ${nodeColor}`
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  right: -10,
                  top: 45,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: `10px solid ${nodeColor}`
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  right: -10,
                  top: 75,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: `10px solid ${nodeColor}`
                }} />
              </Paper>

              {/* Saídas laterais */}
              <Box sx={{ 
                position: 'absolute',
                right: '25%', 
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'flex-start',
                minHeight: 150
              }}>
                <Box sx={{ 
                  width: 120, 
                  height: 24, 
                  backgroundColor: alpha(nodeColor, 0.2), 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${nodeColor}`
                }}>
                  <Typography variant="caption">Opção 1</Typography>
                </Box>
                <Box sx={{ 
                  width: 120, 
                  height: 24, 
                  backgroundColor: alpha(nodeColor, 0.2), 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${nodeColor}`
                }}>
                  <Typography variant="caption">Opção 2</Typography>
                </Box>
                <Box sx={{ 
                  width: 120, 
                  height: 24, 
                  backgroundColor: alpha(nodeColor, 0.2), 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${nodeColor}`
                }}>
                  <Typography variant="caption">Opção N</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              width: 120, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2),
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mt: 2
            }}>
              <Typography variant="caption">Outras respostas</Typography>
            </Box>
          </Box>
        )}

        {/* MenuNode */}
{nodeType === 'menuNode' && (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Box sx={{ 
      width: 80, 
      height: 30, 
      backgroundColor: alpha(nodeColor, 0.2), 
      borderRadius: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: `1px dashed ${nodeColor}`,
      mb: 2
    }}>
      <Typography variant="caption">Entrada única</Typography>
    </Box>

    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', my: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          width: 120, 
          height: 90, 
          borderRadius: 2, 
          bgcolor: nodeColor,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: -10, 
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `10px solid ${nodeColor}`
        }} />
        <Typography variant="subtitle2">Menu</Typography>
        <Box sx={{ 
          position: 'absolute', 
          bottom: -10, 
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `10px solid ${nodeColor}`
        }} />

        {/* Lado direito - saídas de opções */}
        <Box sx={{ 
          position: 'absolute', 
          right: -10,
          top: 15,
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft: `10px solid ${nodeColor}`
        }} />
        <Box sx={{ 
          position: 'absolute', 
          right: -10,
          top: 45,
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft: `10px solid ${nodeColor}`
        }} />
        <Box sx={{ 
          position: 'absolute', 
          right: -10,
          top: 75,
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft: `10px solid ${nodeColor}`
        }} />
      </Paper>

      {/* Saídas laterais */}
      <Box sx={{ 
        position: 'absolute',
        right: '25%', 
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        alignItems: 'flex-start',
        minHeight: 150
      }}>
        <Box sx={{ 
          width: 120, 
          height: 24, 
          backgroundColor: alpha(nodeColor, 0.2), 
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${nodeColor}`
        }}>
          <Typography variant="caption">Opção 1</Typography>
        </Box>
        <Box sx={{ 
          width: 120, 
          height: 24, 
          backgroundColor: alpha(nodeColor, 0.2), 
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${nodeColor}`
        }}>
          <Typography variant="caption">Opção 2</Typography>
        </Box>
        <Box sx={{ 
          width: 120, 
          height: 24, 
          backgroundColor: alpha(nodeColor, 0.2), 
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${nodeColor}`
        }}>
          <Typography variant="caption">Opção N</Typography>
        </Box>
      </Box>
    </Box>

    <Box sx={{ 
      width: 120, 
      height: 30, 
      backgroundColor: alpha(nodeColor, 0.2),
      borderRadius: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: `1px dashed ${nodeColor}`,
      mt: 2
    }}>
      <Typography variant="caption">Sem seleção</Typography>
    </Box>
  </Box>
)}

        {/* ApiNode */}
        {nodeType === 'apiNode' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 30, 
              backgroundColor: alpha(nodeColor, 0.2), 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${nodeColor}`,
              mb: 2
            }}>
              <Typography variant="caption">Entrada única</Typography>
            </Box>

            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', my: 2 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  width: 120, 
                  height: 90, 
                  borderRadius: 2, 
                  bgcolor: nodeColor,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: `10px solid ${nodeColor}`
                }} />
                <Typography variant="subtitle2">API</Typography>
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: -10, 
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: `10px solid ${nodeColor}`
                }} />

                {/* Lado direito - saída de erro */}
                <Box sx={{ 
                  position: 'absolute', 
                  right: -10,
                  top: 45,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: `10px solid ${nodeColor}`
                }} />
              </Paper>

              {/* Saída lateral para erro */}
              <Box sx={{ 
                position: 'absolute',
                right: '25%', 
                top: '40%',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  width: 120, 
                  height: 24, 
                  backgroundColor: alpha(theme.palette.error.main, 0.2), 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${theme.palette.error.main}`
                }}>
                  <Typography variant="caption" color="error">Erro</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              width: 120, 
              height: 30, 
              backgroundColor: alpha(theme.palette.success.main, 0.2),
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px dashed ${theme.palette.success.main}`,
              mt: 2
            }}>
              <Typography variant="caption" color="success.main">Sucesso</Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Função para renderizar a documentação de um nó
  const renderNodeDocumentation = (nodeType) => {
    const doc = getNodeDoc(nodeType);
    const node = nodeTypes.find(n => n.type === nodeType) || {};

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(node.color || theme.palette.primary.main, 0.8),
              color: '#fff',
            }}
          >
            {node.icon || <InfoIcon />}
          </Avatar>
          <Typography variant="h5" component="h2">
            {doc.title}
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          {doc.description}
        </Typography>

        {/* Visualização das conexões */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DevicesIcon fontSize="small" color="action" />
          Visualização das Conexões
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          {renderConnectionDiagram(nodeType)}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" sx={{ textAlign: 'left' }}>
            {nodeType === 'startNode' && '→ O nó de início tem apenas uma saída para iniciar o fluxo.'}
            {nodeType === 'messageNode' && '→ O nó de mensagem tem uma entrada no topo e uma saída na parte inferior.'}
            {nodeType === 'imageNode' && '→ O nó de imagem tem uma entrada no topo e uma saída na parte inferior.'}
            {nodeType === 'conditionalNode' && '→ O nó de condição tem uma entrada no topo, múltiplas saídas laterais (uma para cada condição) e uma saída inferior para quando nenhuma condição é atendida.'}
            {nodeType === 'questionNode' && '→ O nó de pergunta tem uma entrada no topo, múltiplas saídas laterais (uma para cada opção) e uma saída inferior para outras respostas.'}
            {nodeType === 'apiNode' && '→ O nó de API tem uma entrada no topo, uma saída de sucesso na parte inferior e uma saída de erro na lateral direita.'}
            {nodeType === 'webhookNode' && '→ O nó de Webhook tem uma entrada no topo e uma saída na parte inferior.'}
            {nodeType === 'attendantNode' && '→ O nó de Atendente tem uma entrada no topo e uma saída na parte inferior.'}
            {nodeType === 'tagNode' && '→ O nó de Tag tem uma entrada no topo e uma saída na parte inferior.'}
            {nodeType === 'switchFlowNode' && '→ O nó de Troca de Fluxo tem apenas uma entrada no topo e nenhuma saída, pois encerra o fluxo atual e inicia outro.'}
            {nodeType === 'endNode' && '→ O nó de Fim tem apenas uma entrada no topo e encerra o fluxo.'}
            {nodeType === 'appointmentNode' && '→ O nó de Agendamento tem apenas uma entrada no topo e nenhuma saída, pois encerra o fluxo atual e inicia outro.'}
          </Typography>
        </Paper>

        {/* Propriedades do nó */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="small" color="action" />
          {i18n.t('flowBuilder.help.propertiesSection')}
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell width="30%"><strong>{i18n.t('flowBuilder.help.propertyName')}</strong></TableCell>
                <TableCell><strong>{i18n.t('flowBuilder.help.propertyDescription')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doc.properties.map((prop, index) => (
                <TableRow key={index}>
                  <TableCell>{prop.name}</TableCell>
                  <TableCell>{prop.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Conexões do nó */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DevicesIcon fontSize="small" color="action" />
          {i18n.t('flowBuilder.help.connectionsSection')}
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell width="30%"><strong>{i18n.t('flowBuilder.help.connectionType')}</strong></TableCell>
                <TableCell><strong>{i18n.t('flowBuilder.help.connectionDescription')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doc.connections.map((conn, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {conn.type.includes('Entrada') || conn.type.includes('Input') ? (
                        <ArrowBackIcon fontSize="small" color="primary" />
                      ) : (
                        <ArrowForwardIcon fontSize="small" color="secondary" />
                      )}
                      {conn.type}
                    </Box>
                  </TableCell>
                  <TableCell>{conn.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Como usar */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TouchAppIcon fontSize="small" color="action" />
          {i18n.t('flowBuilder.help.usageSection')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2">{doc.usage}</Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            {i18n.t('flowBuilder.help.exampleSection')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {doc.example}
          </Typography>
        </Paper>
      </Box>
    );
  };

  // Renderização das tabs por tipo de nó
  const renderNodeTabs = (nodes, category) => {
    return (
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="node tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 2
          }}
        >
          {nodes.map((node, index) => (
            <Tab
              key={node.type}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: alpha(node.color, 0.2),
                      color: node.color,
                    }}
                  >
                    {typeof node.icon === 'string' ? node.icon : React.cloneElement(node.icon, { fontSize: 'small' })}
                  </Avatar>
                  <Typography variant="body2">
                    {node.label}
                  </Typography>
                </Box>
              }
              id={`node-tab-${index}`}
              aria-controls={`node-tabpanel-${index}`}
            />
          ))}
        </Tabs>

        {nodes.map((node, index) => (
          <TabPanel key={node.type} value={tabValue} index={index}>
            {renderNodeDocumentation(node.type)}
          </TabPanel>
        ))}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Typography variant="h6">
          {i18n.t('flowBuilder.help.title')}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" paragraph>
            {i18n.t('flowBuilder.help.introduction')}
          </Typography>
        </Box>

        {/* Tabs para categorias */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={categoryTabValue}
            onChange={handleCategoryTabChange}
            aria-label="category tabs"
          >
            <Tab 
              label={i18n.t('flowBuilder.sidebar.messageNodes')}
              id="category-tab-0"
              aria-controls="category-tabpanel-0"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label={i18n.t('flowBuilder.sidebar.flowNodes')}
              id="category-tab-1"
              aria-controls="category-tabpanel-1"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label={i18n.t('flowBuilder.sidebar.integrationNodes')}
              id="category-tab-2"
              aria-controls="category-tabpanel-2"
              sx={{ fontWeight: 'bold' }}
            />
          </Tabs>
        </Box>

        {/* Conteúdo das categorias */}
        <Box sx={{ px: 2, py: 2 }}>
          <TabPanel value={categoryTabValue} index={0}>
            {renderNodeTabs(messageNodes, 'message')}
          </TabPanel>
          <TabPanel value={categoryTabValue} index={1}>
            {renderNodeTabs(flowNodes, 'flow')}
          </TabPanel>
          <TabPanel value={categoryTabValue} index={2}>
            {renderNodeTabs(integrationNodes, 'integration')}
          </TabPanel>
        </Box>
      </DialogContent>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="contained" color="primary">
          {i18n.t('close')}
        </Button>
      </Box>
    </Dialog>
  );
};

export default NodeHelpModal;