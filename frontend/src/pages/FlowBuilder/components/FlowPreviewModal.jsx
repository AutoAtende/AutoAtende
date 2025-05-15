import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Paper,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Tooltip,
  Badge,
  Link
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  RestartAlt as RestartIcon,
  SkipNext as SkipNextIcon,
  Tag as TagIcon,
  QueuePlayNext as QueuePlayNextIcon,
  Link as LinkIcon,
  Description as DocumentIcon,
  AudioFile as AudioFileIcon,
  VideoFile as VideoFileIcon,
  LocationOn as LocationIcon,
  Code as CodeIcon,
  Event as EventIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";

// Funções auxiliares para validação
const validateCPF = (cpf) => {
  if (!cpf) return false;

  // Remover caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verificar se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let dv1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cpf.charAt(9)) !== dv1) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let dv2 = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(cpf.charAt(10)) === dv2;
};

const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;

  // Remover caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');

  // Verificar se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let remainder = sum % 11;
  let dv1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cnpj.charAt(12)) !== dv1) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  remainder = sum % 11;
  let dv2 = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(cnpj.charAt(13)) === dv2;
};

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Função para identificar e transformar URLs em links clicáveis
const parseMessageContent = (content) => {
  if (!content) return null;

  // Regex para identificar URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

  // Verificar se o conteúdo contém algum link
  if (!urlRegex.test(content)) return content;

  // Resetar o regex para usar novamente
  urlRegex.lastIndex = 0;

  // Dividir o conteúdo em partes (texto e links)
  const parts = [];
  let lastIndex = 0;
  let match;

  // Encontrar todas as ocorrências de URLs
  while ((match = urlRegex.exec(content)) !== null) {
    // Adicionar o texto antes do link
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    // Obter a URL encontrada
    let url = match[0];

    // Adicionar http:// para URLs que começam com www.
    if (url.startsWith('www.')) {
      url = 'http://' + url;
    }

    // Adicionar o link como um elemento clicável
    parts.push(
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        key={match.index}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          wordBreak: 'break-all',
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
        {match[0]}
      </Link>
    );

    // Atualizar o índice para continuar a busca
    lastIndex = match.index + match[0].length;
  }

  // Adicionar qualquer texto restante após o último link
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length ? parts : content;
};

const FlowPreviewModal = ({ open, onClose, nodes, edges }) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [activeChoices, setActiveChoices] = useState([]);
  const [flowPath, setFlowPath] = useState([]);
  const [flowVariables, setFlowVariables] = useState({});
  const [showVariablesPanel, setShowVariablesPanel] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  // Cores personalizadas baseadas no tema
  const chatBgColor = theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.9) : '#F0F2F5';
  const headerBgColor = theme.palette.primary.main;
  const headerTextColor = theme.palette.primary.contrastText;
  const messageBubbleUserBg = theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#DCF8C6';
  const messageBubbleBotBg = theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : 'white';
  const messageBubbleTextColor = theme.palette.text.primary;
  const systemMessageBg = alpha(theme.palette.info.main, 0.1);

  // Resetar simulação quando o modal abrir
  useEffect(() => {
    if (open) resetSimulation();
  }, [open]);

  const resetSimulation = () => {
    setMessages([{
      type: 'system',
      content: i18n.t('flowBuilder.preview.welcome')
    }]);
    setCurrentNodeId(null);
    setActiveChoices([]);
    setFlowPath([]);
    setSimulationComplete(false);
    setUserInput('');
    setFlowVariables({});

    const startNode = nodes.find(n => n.type === 'startNode');
    startNode && setTimeout(() => processNode(startNode.id), 500);
  };

  // Função para salvar valor em uma variável
  const setVariable = (name, value) => {
    if (!name) return;

    // Verificar se a variável já existe para determinar se é criação ou atualização
    const isNewVariable = !flowVariables.hasOwnProperty(name);

    setFlowVariables(prev => ({
      ...prev,
      [name]: value
    }));

    // Adicionar mensagem do sistema quando uma variável é criada ou atualizada
    if (isNewVariable) {
      addSystemMessage('flowBuilder.preview.variableCreated', { name, value });
    } else {
      addSystemMessage('flowBuilder.preview.variableUpdated', { name, value });
    }
  };

  // Função para obter o valor de uma variável
  const getVariable = (name) => {
    return flowVariables[name];
  };

  // Função para processar texto e substituir referências a variáveis
  const processVariables = (text) => {
    if (!text) return text;

    // Regex para identificar variáveis no formato ${nomeDaVariavel}
    const regex = /\${([^}]+)}/g;

    return text.replace(regex, (match, variableName) => {
      const value = getVariable(variableName);
      return value !== undefined ? value : match;
    });
  };

  const processNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setCurrentNodeId(nodeId);
    setFlowPath(prev => [...prev, nodeId]);

    switch (node.type) {
      case 'startNode':
        addSystemMessage('flowBuilder.preview.startNode');
        setTimeout(() => findAndProcessNextNode(nodeId), 800);
        break;

      case 'messageNode':
        handleMessageNode(node);
        break;

      case 'internalMessageNode':
        handleInternalMessageNode(node);
        break;

      case 'imageNode':
        handleImageNode(node);
        break;

      case 'questionNode':
        handleQuestionNode(node);
        break;

      case 'menuNode':
        handleMenuNode(node);
        break;

      case 'conditionalNode':
        handleConditionalNode(node);
        break;

      case 'switchFlowNode':
        handleSwitchFlowNode(node);
        break;

      case 'tagNode':
        handleTagNode(node);
        break;

      case 'apiNode':
      case 'webhookNode':
        handleApiNode(node);
        break;

      case 'databaseNode':
        handleDatabaseNode(node);
        break;

      case 'queueNode':
        handleQueueNode(node);
        break;

      case 'openaiNode':
        handleOpenAINode(node);
        break;

      case 'typebotNode':
        handleTypebotNode(node);
        break;

      case 'attendantNode':
        handleAttendantNode(node);
        break;

      case 'scheduleNode':
        handleScheduleNode(node);
        break;

      case 'appointmentNode':
        handleAppointmentNode(node);
        break;

      case 'endNode':
        addSystemMessage('flowBuilder.preview.endNode');
        setSimulationComplete(true);
        break;

      default:
        autoPlay && setTimeout(() => findAndProcessNextNode(nodeId), 1000);
    }
  };

  const handleMessageNode = (node) => {
    const messageType = node.data.messageType || 'text';

    // Trata cada tipo de mensagem adequadamente
    switch (messageType) {
      case 'text':
        // Processar variáveis no texto da mensagem
        const processedMessage = processVariables(node.data.message);
        const processedCaption = processVariables(node.data.caption);

        addBotMessage({
          content: processedMessage,
          caption: processedCaption
        });
        break;

      case 'image':
        addBotMessage({
          content: processVariables(node.data.caption),
          mediaUrl: node.data.mediaUrl,
          mediaType: 'image'
        });
        break;

      case 'audio':
        addBotMessage({
          content: processVariables(node.data.caption || 'Áudio enviado'),
          mediaType: 'audio',
          filename: node.data.filename || (node.data.mediaUrl ? node.data.mediaUrl.split('/').pop() : 'Áudio')
        });
        break;

      case 'video':
        addBotMessage({
          content: processVariables(node.data.caption || 'Vídeo enviado'),
          mediaType: 'video',
          filename: node.data.filename || (node.data.mediaUrl ? node.data.mediaUrl.split('/').pop() : 'Vídeo')
        });
        break;

      case 'document':
        addBotMessage({
          content: processVariables(node.data.caption || 'Documento enviado'),
          mediaType: 'document',
          filename: node.data.filename || (node.data.mediaUrl ? node.data.mediaUrl.split('/').pop() : 'Documento')
        });
        break;

      case 'location':
        const locationCaption = processVariables(node.data.locationName || 'Localização');
        const coordinates = node.data.latitude && node.data.longitude
          ? `${node.data.latitude}, ${node.data.longitude}`
          : '';
        const address = node.data.address ? `\nEndereço: ${processVariables(node.data.address)}` : '';

        addBotMessage({
          content: `${locationCaption}${coordinates ? `\n${coordinates}` : ''}${address}`,
          mediaType: 'location'
        });
        break;

      default:
        addBotMessage({
          content: processVariables(node.data.message || 'Conteúdo não disponível')
        });
    }

    autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1500);
  };

  const handleInternalMessageNode = (node) => {
    // Processar variáveis no texto da mensagem
    const processedMessage = processVariables(node.data.message);
    
    // Adicionar uma mensagem do sistema explicando que é uma mensagem interna
    addSystemMessage('flowBuilder.preview.internalMessage');
    
    // Exibir a mensagem interna com um estilo diferente
    addSystemMessage('flowBuilder.preview.internalMessageContent', { 
      content: processedMessage 
    });
    
    // Se tiver uma variável selecionada, salvar a mensagem nela
    if (node.data.selectedVariable) {
      setVariable(node.data.selectedVariable, processedMessage);
    }
    
    // Continuar o fluxo automaticamente
    autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1500);
  };

  const handleImageNode = (node) => {
    addBotMessage({
      content: node.data.caption,
      mediaUrl: node.data.mediaUrl,
      mediaType: 'image'
    });

    autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1500);
  };

  const handleSwitchFlowNode = (node) => {
    const targetFlowName = node.data.targetFlowName || (node.data.targetFlowId ? `ID ${node.data.targetFlowId}` : 'Fluxo desconhecido');

    addSystemMessage('flowBuilder.preview.switchFlow', {
      flowName: targetFlowName
    });

    // Simular que variáveis são transferidas, se configurado
    if (node.data.transferVariables) {
      addSystemMessage('flowBuilder.preview.transferVariables');
    }

    // Simulação de continuação do fluxo após 1 segundo
    setTimeout(() => {
      // Na prévia, continuamos o fluxo normalmente em vez de trocar realmente
      // Encontrar a próxima conexão possível (simulando o que aconteceria no fluxo de destino)
      addSystemMessage('flowBuilder.preview.simulatedContinuation');
      autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1000);
    }, 1000);
  };

  const validateUserInput = (input, node) => {
    if (!node || !node.data) return { isValid: true };

    // Verificar tipo de validação necessária
    const inputType = node.data.inputType;
    const validationType = node.data.validationType;

    // Se não tiver validação configurada, retorna válido
    if (!inputType && !validationType) return { isValid: true };

    // Validação baseada no tipo de entrada
    if (inputType === 'email' || validationType === 'email') {
      return {
        isValid: validateEmail(input),
        errorMessage: "E-mail inválido. Por favor, insira um e-mail válido."
      };
    }

    if (inputType === 'cpf' || validationType === 'cpf') {
      return {
        isValid: validateCPF(input),
        errorMessage: "CPF inválido. Por favor, insira um CPF válido."
      };
    }

    if (inputType === 'cnpj' || validationType === 'cnpj') {
      return {
        isValid: validateCNPJ(input),
        errorMessage: "CNPJ inválido. Por favor, insira um CNPJ válido."
      };
    }

    if (validationType === 'regex' && node.data.validationRegex) {
      try {
        const regex = new RegExp(node.data.validationRegex);
        return {
          isValid: regex.test(input),
          errorMessage: node.data.errorMessage || "Formato inválido. Por favor, verifique os dados."
        };
      } catch (e) {
        console.error("Erro ao validar regex:", e);
        return { isValid: true }; // Em caso de erro na regex, permitir passar
      }
    }

    // Se passou por todas as validações
    return { isValid: true };
  };

  const handleQuestionNode = (node) => {
    const question = node.data.question || "Pergunta sem texto";
    let isValidationNode = false;

    // Verificar se o nó tem validação
    if (node.data.inputType === 'email' ||
      node.data.inputType === 'cpf' ||
      node.data.inputType === 'cnpj' ||
      node.data.validationType === 'email' ||
      node.data.validationType === 'cpf' ||
      node.data.validationType === 'cnpj' ||
      node.data.validationType === 'regex') {
      isValidationNode = true;
    }

    // Enviar a pergunta
    addBotMessage({
      content: question,
      options: node.data.options
    });

    // Se não houver opções, avisa sobre entrada de texto
    if (!node.data.options || node.data.options.length === 0) {
      const inputTypeText = i18n.t(`flowBuilder.inputTypes.${node.data.inputType}`, node.data.inputType || 'texto');

      addSystemMessage('flowBuilder.preview.inputRequired', {
        type: inputTypeText
      });

      // Se tiver validação, avisar sobre isso
      if (isValidationNode) {
        const validationType = node.data.inputType === 'email' || node.data.inputType === 'cpf' || node.data.inputType === 'cnpj'
          ? node.data.inputType
          : node.data.validationType;

        addSystemMessage('flowBuilder.preview.validationRequired', {
          type: i18n.t(`flowBuilder.validationTypes.${validationType}`, validationType)
        });
      }
    }

    setActiveChoices(node.data.options || []);
  };

  const handleAppointmentNode = (node) => {
    const welcomeMsg = node.data.configuration?.welcomeMessage || 'Bem-vindo ao sistema de agendamento!';
    
    // Mostrar a mensagem de boas-vindas
    addBotMessage({
      content: welcomeMsg
    });
    
    // Avisar que é um nó de agendamento
    addSystemMessage('flowBuilder.preview.appointmentNode');
    
    // Avisar que o fluxo será encerrado
    setTimeout(() => {
      addSystemMessage('flowBuilder.preview.terminalNode');
      setSimulationComplete(true);
    }, 1500);
  };

  const handleMenuNode = (node) => {
    addBotMessage({
      content: node.data.menuTitle,
      options: node.data.menuOptions
    });

    setActiveChoices(node.data.menuOptions || []);
  };

  const handleTagNode = (node) => {
    const operation = node.data.operation === 'add' ? 'adicionadas' : 'removidas';
    const tags = node.data.tags?.map(t => t.name).join(', ') || 'Nenhuma tag';

    addSystemMessage('flowBuilder.preview.tagOperation', { operation, tags });
    autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1000);
  };

  const handleApiNode = async (node) => {
    // Processar variáveis na URL
    const processedUrl = processVariables(node.data.url || '');

    addSystemMessage('flowBuilder.preview.apiCall', { url: processedUrl });

    // Processar variáveis em headers se existirem
    let processedHeaders = {};
    if (node.data.headers) {
      for (const [key, value] of Object.entries(node.data.headers)) {
        processedHeaders[key] = processVariables(value);
      }
    }

    // Processar variáveis no body se não for GET e tiver body
    let processedBody = null;
    if (node.data.method !== 'GET' && node.data.body) {
      if (node.data.parseVariables && node.data.contentType === 'application/json') {
        // Para JSON, tentar processar as variáveis dentro do JSON
        try {
          const bodyObj = JSON.parse(node.data.body);
          const processedBodyObj = processObjectVariables(bodyObj);
          processedBody = JSON.stringify(processedBodyObj, null, 2);
        } catch (e) {
          // Se falhar em parsear como JSON, tratar como texto
          processedBody = processVariables(node.data.body);
        }
      } else {
        // Para outros content types, processar como texto
        processedBody = processVariables(node.data.body);
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Simulação de resposta de API
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Operação realizada com sucesso'
        }
      };

      // Se há variável para armazenar a resposta, salvá-la
      if (node.data.responseVariable) {
        setVariable(node.data.responseVariable, mockResponse.data);
        addSystemMessage('flowBuilder.preview.apiResponseStored', {
          variable: node.data.responseVariable
        });
      }

      if (node.data.statusVariable) {
        setVariable(node.data.statusVariable, mockResponse.status);
      }

      addSystemMessage('flowBuilder.preview.apiSuccess');
      autoPlay && findAndProcessNextNode(node.id);
    }, 2000);
  };

  // Função auxiliar para processar variáveis em objetos (para uso em JSON bodies)
  const processObjectVariables = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    // Se for array, processar cada elemento
    if (Array.isArray(obj)) {
      return obj.map(item => processObjectVariables(item));
    }

    // Se for objeto, processar cada chave/valor
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = processVariables(value);
      } else if (typeof value === 'object') {
        result[key] = processObjectVariables(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  const handleQueueNode = (node) => {
    const queueName = node.data.queueName || (node.data.queueId ? `ID ${node.data.queueId}` : 'Fila desconhecida');

    addSystemMessage('flowBuilder.preview.queueTransfer', { queueName });

    setTimeout(() => {
      addSystemMessage('flowBuilder.preview.terminalNode');
      setSimulationComplete(true);
    }, 1000);
  };

  const handleDatabaseNode = (node) => {
    const databaseType = node.data.databaseType || 'firebase';
    const isNoSQL = ['firebase', 'realtime'].includes(databaseType);

    let operationText = '';
    if (isNoSQL) {
      const operation = node.data.operation || 'get';
      switch (operation) {
        case 'get': operationText = 'listagem de documentos'; break;
        case 'get_document': operationText = 'obtenção de documento'; break;
        case 'add': operationText = 'adição de documento'; break;
        case 'update': operationText = 'atualização de documento'; break;
        case 'delete': operationText = 'exclusão de documento'; break;
        default: operationText = operation;
      }
    } else {
      operationText = 'consulta SQL';
    }

    // Mensagem genérica sobre a operação do banco de dados
    addSystemMessage('flowBuilder.preview.databaseOperation', {
      type: databaseType,
      operation: operationText
    });

    // Simulação de processamento
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Gerar uma resposta aleatória baseada no tipo de operação
      const successRate = 80; // 80% de chance de sucesso
      const isSuccess = Math.random() * 100 < successRate;

      if (isSuccess) {
        // Mensagem de sucesso com dados fictícios
        if (node.data.responseVariable) {
          addSystemMessage('flowBuilder.preview.databaseSuccess', {
            variable: node.data.responseVariable
          });

          // Simulação de dados retornados
          if (isNoSQL) {
            if (node.data.operation === 'get') {
              addBotMessage({
                content: `Dados obtidos com sucesso para a coleção ${node.data.collection || 'coleção'}`
              });
            } else if (node.data.operation === 'get_document') {
              addBotMessage({
                content: `Documento ${node.data.document || 'documento'} obtido com sucesso da coleção ${node.data.collection || 'coleção'}`
              });
            } else if (['add', 'update'].includes(node.data.operation)) {
              addBotMessage({
                content: `Operação de ${node.data.operation === 'add' ? 'adição' : 'atualização'} realizada com sucesso na coleção ${node.data.collection || 'coleção'}`
              });
            } else if (node.data.operation === 'delete') {
              addBotMessage({
                content: `Documento ${node.data.document || 'documento'} excluído com sucesso da coleção ${node.data.collection || 'coleção'}`
              });
            }
          } else {
            // Para bancos relacionais
            addBotMessage({
              content: `Consulta SQL executada com sucesso no banco ${node.data.database || 'de dados'}. ${node.data.sqlParams?.length > 0 ? `Parâmetros aplicados: ${node.data.sqlParams.length}` : ''}`
            });
          }
        }

        // Continuar fluxo após operação bem-sucedida
        autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1500);
      } else {
        // Simulação de erro
        addSystemMessage('flowBuilder.preview.databaseError');

        // Verificar se há tratamento de erro
        const errorEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'error');
        if (errorEdge) {
          setTimeout(() => {
            processNode(errorEdge.target);
          }, 1000);
        } else {
          // Se não há tratamento de erro, mostrar mensagem e encerrar simulação
          addSystemMessage('flowBuilder.preview.noErrorHandler');
          setTimeout(() => {
            setSimulationComplete(true);
          }, 1000);
        }
      }
    }, 2000);
  };

  const handleScheduleNode = (node) => {
    const horarioId = node.data.horarioId;

    if (!horarioId) {
      addSystemMessage('flowBuilder.preview.scheduleNodeNoConfig');
      autoPlay && setTimeout(() => findAndProcessNextNode(node.id, null, 'fora'), 1500);
      return;
    }

    addSystemMessage('flowBuilder.preview.scheduleNodeChecking', {
      horarioId: horarioId
    });

    // Simular verificação de horário
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulação: 70% de chance de estar "dentro" do horário
      const isInSchedule = Math.random() < 0.7;
      const result = isInSchedule ? "dentro" : "fora";

      addSystemMessage('flowBuilder.preview.scheduleNodeResult', {
        result: result === "dentro" ? "dentro do horário" : "fora do horário"
      });

      // Encontrar a próxima conexão com base no resultado
      autoPlay && setTimeout(() => findAndProcessNextNode(node.id, null, result), 1500);
    }, 1000);
  };

  const handleOpenAINode = (node) => {
    const integrationName = node.data.typebotIntegration?.name || 'Integração OpenAI';

    addSystemMessage('flowBuilder.preview.openaiIntegration', { name: integrationName });

    setTimeout(() => {
      addSystemMessage('flowBuilder.preview.terminalNode');
      setSimulationComplete(true);
    }, 1000);
  };

  const handleTypebotNode = (node) => {
    const integrationName = node.data.typebotIntegration?.name || 'Integração Typebot';

    addSystemMessage('flowBuilder.preview.typebotIntegration', { name: integrationName });

    autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1500);
  };

  const handleAttendantNode = (node) => {
    const isTerminal = node.data.endFlowFlag === true;

    if (isTerminal) {
      const userName = node.data.assignmentType === 'manual' && node.data.assignedUserName
        ? node.data.assignedUserName
        : 'um atendente';

      addSystemMessage('flowBuilder.preview.attendantTransfer', { name: userName });

      setTimeout(() => {
        addSystemMessage('flowBuilder.preview.terminalNode');
        setSimulationComplete(true);
      }, 1000);
    } else {
      addSystemMessage('flowBuilder.preview.attendantNode');
      autoPlay && setTimeout(() => findAndProcessNextNode(node.id), 1500);
    }
  };

  const handleConditionalNode = (node) => {
    // Obter o valor da variável a ser avaliada
    const variableName = node.data.variable;
    const variableValue = getVariable(variableName);
    const defaultValue = node.data.defaultValue || '';

    // Valor a ser usado na avaliação (variável ou valor padrão)
    const valueToEvaluate = variableValue !== undefined ? variableValue : defaultValue;

    addSystemMessage('flowBuilder.preview.checkingCondition', {
      variable: variableName,
      value: valueToEvaluate
    });

    // Avaliar cada condição
    let matchedCondition = null;
    let matchedIndex = -1;

    if (node.data.conditions && node.data.conditions.length > 0) {
      // Encontrar a primeira condição que corresponde
      for (let i = 0; i < node.data.conditions.length; i++) {
        const condition = node.data.conditions[i];
        if (evaluateCondition(valueToEvaluate, condition)) {
          matchedCondition = condition;
          matchedIndex = i;
          break;
        }
      }
    }

    if (matchedCondition) {
      // Exibir mensagem sobre qual condição foi atendida
      addSystemMessage('flowBuilder.preview.conditionMatched', {
        index: matchedIndex + 1,
        condition: matchedCondition.description || matchedCondition.value || 'condição definida'
      });

      // Encontrar e seguir o edge correspondente à condição
      setTimeout(() => findAndProcessNextNode(node.id, null, `condition-${matchedCondition.id}`), 1000);
    } else {
      // Nenhuma condição corresponde, seguir caminho padrão
      addSystemMessage('flowBuilder.preview.noConditionMatched');
      setTimeout(() => findAndProcessNextNode(node.id), 1000);
    }
  };

  // Função auxiliar para avaliar condições
  const evaluateCondition = (value, condition) => {
    const conditionValue = condition.value;

    switch (condition.operator) {
      case '==':
        return value == conditionValue;
      case '!=':
        return value != conditionValue;
      case '>':
        return parseFloat(value) > parseFloat(conditionValue);
      case '<':
        return parseFloat(value) < parseFloat(conditionValue);
      case '>=':
        return parseFloat(value) >= parseFloat(conditionValue);
      case '<=':
        return parseFloat(value) <= parseFloat(conditionValue);
      case 'contains':
        return String(value).includes(String(conditionValue));
      case 'startsWith':
        return String(value).startsWith(String(conditionValue));
      case 'endsWith':
        return String(value).endsWith(String(conditionValue));
      case 'regex':
        try {
          const regex = new RegExp(conditionValue);
          return regex.test(String(value));
        } catch (e) {
          console.error("Erro ao executar regex:", e);
          return false;
        }
      case 'validCPF':
        return validateCPF(value);
      case 'validCNPJ':
        return validateCNPJ(value);
      case 'validEmail':
        return validateEmail(value);
      default:
        return false;
    }
  };


  const findAndProcessNextNode = (currentNodeId, response = null, optionData = null) => {
    // Obter o nó atual para identificar seu tipo
    const currentNode = nodes.find(n => n.id === currentNodeId);

    // Verificar se é um nó terminal
    if (currentNode) {
      if (
        currentNode.type === 'endNode' ||
        currentNode.type === 'queueNode' ||
        currentNode.type === 'openaiNode' ||
        (currentNode.type === 'attendantNode' && currentNode.data.endFlowFlag === true)
      ) {
        setSimulationComplete(true);
        return;
      }
    }

    // Filtrar todas as arestas que saem do nó atual
    const edgesFromNode = edges.filter(e => e.source === currentNodeId);

    if (edgesFromNode.length === 0) {
      setSimulationComplete(true);
      return;
    }

    let nextEdge = null;

    // Verificar o tipo de nó e como devemos processar a navegação
    if (currentNode) {
      switch (currentNode.type) {
        case 'conditionalNode':
          // Para nós condicionais, procuramos um edge específico baseado na condição
          if (optionData && optionData.startsWith('condition-')) {
            nextEdge = edgesFromNode.find(e => e.sourceHandle === optionData);
          }
          break;

        case 'questionNode':
          // Verificar se é um QuestionNode com validação e simular validação
          if (response) {
            // Validar a entrada do usuário com base no tipo configurado
            const validation = validateUserInput(response, currentNode);

            // Se a validação falhou e existir useValidationErrorOutput
            if (!validation.isValid && currentNode.data.useValidationErrorOutput) {
              // Procura a aresta que usa o handle de validação-erro
              nextEdge = edgesFromNode.find(e => e.sourceHandle === 'validation-error');

              if (nextEdge) {
                // Mostrar mensagem de erro de validação
                addSystemMessage('flowBuilder.preview.validationFailed', {
                  message: validation.errorMessage
                });
                processNode(nextEdge.target);
                return;
              }
            }

            // Se tem validação e a entrada é inválida
            if (!validation.isValid) {
              // Mostrar mensagem de erro
              addBotMessage({
                content: validation.errorMessage || "Resposta inválida. Por favor, tente novamente."
              });
              // Re-exibir o nó de pergunta
              handleQuestionNode(currentNode);
              return;
            }

            // Para nós de pergunta com opções, verificar se a resposta corresponde a alguma opção
            if (currentNode.data.options) {
              const selectedOption = currentNode.data.options.find(opt => opt.text === response);

              if (selectedOption) {
                nextEdge = edgesFromNode.find(e =>
                  e.sourceHandle === `option-${selectedOption.id}` ||
                  e.sourceHandle?.includes(`option-`) && e.data?.option?.id === selectedOption.id
                );
              }
            }
          }
          break;

        case 'menuNode':
          // Para nós de menu, procuramos um edge baseado na opção selecionada
          if (response && currentNode.data.menuOptions) {
            // Encontrar a opção correspondente
            const selectedOption = currentNode.data.menuOptions.find(opt => opt.text === response);

            if (selectedOption) {
              // Buscar a aresta que tem o handle correspondente à opção
              nextEdge = edgesFromNode.find(e =>
                e.sourceHandle === `menu-option-${selectedOption.id}` ||
                e.sourceHandle?.includes(`menu-option-`) && e.data?.option?.id === selectedOption.id
              );
            }
          }
          break;

        case 'scheduleNode':
          // Para nós de verificação de horário
          if (typeof optionData === 'string') {
            // Encontrar a aresta correspondente ao resultado (dentro/fora)
            nextEdge = edgesFromNode.find(e => e.sourceHandle === optionData);
          }
          break;
      }
    }

    // Se não encontramos uma aresta específica para a opção, usar a saída padrão
    if (!nextEdge && edgesFromNode.length > 0) {
      // Procurar pela aresta que não tem sourceHandle específico (saída padrão)
      nextEdge = edgesFromNode.find(e => !e.sourceHandle || e.sourceHandle === 'default');

      // Se não encontrar uma aresta padrão, usar a primeira disponível
      if (!nextEdge) {
        nextEdge = edgesFromNode[0];
      }
    }

    if (nextEdge) {
      processNode(nextEdge.target);
    } else {
      setSimulationComplete(true);
    }
  };

  const addBotMessage = ({ content, mediaUrl, mediaType, options, filename }) => {
    const newMessage = {
      type: 'bot',
      content,
      mediaUrl,
      mediaType,
      options,
      filename,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  // Adicionando traduções (simuladas)
  const databaseMessages = {
    'flowBuilder.preview.databaseOperation': (data) =>
      `Conectando ao banco de dados {{type}} para operação de {{operation}}...`.replace('{{type}}', data.type).replace('{{operation}}', data.operation),
    'flowBuilder.preview.databaseSuccess': (data) =>
      `Operação concluída com sucesso. Dados armazenados na variável {{variable}}.`.replace('{{variable}}', data.variable),
    'flowBuilder.preview.databaseError': () =>
      `Erro ao executar operação no banco de dados. Iniciando tratamento de erro...`,
    'flowBuilder.preview.noErrorHandler': () =>
      `Não há tratamento de erro configurado para este nó. O fluxo será encerrado.`,
  };

  const appointmentMessages = {
    'flowBuilder.preview.appointmentNode': () =>
      `Iniciando o processo de agendamento... Em um cenário real, o chatbot guiaria o usuário para escolher datas e horários disponíveis.`,
  };

  // Mensagens para o nó de horário
  const scheduleNodeMessages = {
    'flowBuilder.preview.scheduleNodeNoConfig': () =>
      `Este nó de verificação de horário não está configurado com um horário específico. Continuando pelo caminho "fora".`,
    'flowBuilder.preview.scheduleNodeChecking': (data) =>
      `Verificando condições do horário ID: {{horarioId}}...`.replace('{{horarioId}}', data.horarioId),
    'flowBuilder.preview.scheduleNodeResult': (data) =>
      `Verificação concluída. Resultado: {{result}}. Seguindo fluxo correspondente.`.replace('{{result}}', data.result),
  };

  const variableMessages = {
    'flowBuilder.preview.variableCreated': (data) =>
      `Variável "{{name}}" criada com valor: {{value}}`.replace('{{name}}', data.name).replace('{{value}}', data.value),
    'flowBuilder.preview.variableUpdated': (data) =>
      `Variável "{{name}}" atualizada para: {{value}}`.replace('{{name}}', data.name).replace('{{value}}', data.value),
    'flowBuilder.preview.checkingCondition': (data) =>
      `Verificando condição para variável "{{variable}}" com valor: {{value}}`.replace('{{variable}}', data.variable).replace('{{value}}', data.value),
    'flowBuilder.preview.conditionMatched': (data) =>
      `Condição {{index}} atendida: "{{condition}}"`.replace('{{index}}', data.index).replace('{{condition}}', data.condition),
    'flowBuilder.preview.noConditionMatched': () =>
      `Nenhuma condição atendida. Seguindo caminho padrão.`,
    'flowBuilder.preview.apiResponseStored': (data) =>
      `Resposta da API armazenada na variável "{{variable}}"`.replace('{{variable}}', data.variable),
  };

  // Mensagens para mensagens internas
  const internalMessageMessages = {
    'flowBuilder.preview.internalMessage': () =>
      `Uma mensagem interna foi criada no sistema (visível apenas para atendentes)`,
    'flowBuilder.preview.internalMessageContent': (data) =>
      `Conteúdo da mensagem interna: "{{content}}"`.replace('{{content}}', data.content),
  };

  // Modificar a função addSystemMessage para suportar as mensagens de variáveis
  const addSystemMessage = (translationKey, values) => {
    let content;

    // Verificar o tipo de mensagem
    if (translationKey.startsWith('flowBuilder.preview.database') && databaseMessages[translationKey]) {
      content = databaseMessages[translationKey](values);
    }
    else if (translationKey.startsWith('flowBuilder.preview.scheduleNode') && scheduleNodeMessages[translationKey]) {
      content = scheduleNodeMessages[translationKey](values);
    }
    else if (translationKey.startsWith('flowBuilder.preview.variable') && variableMessages[translationKey]) {
      content = variableMessages[translationKey](values);
    }
    else if (translationKey.startsWith('flowBuilder.preview.condition') && variableMessages[translationKey]) {
      content = variableMessages[translationKey](values);
    }
    else if (translationKey.startsWith('flowBuilder.preview.api') && variableMessages[translationKey]) {
      content = variableMessages[translationKey](values);
    }
    else if (translationKey.startsWith('flowBuilder.preview.appointment') && appointmentMessages[translationKey]) {
      content = appointmentMessages[translationKey](values);
    }
    else if (translationKey.startsWith('flowBuilder.preview.internalMessage') && internalMessageMessages[translationKey]) {
      content = internalMessageMessages[translationKey](values);
    }
    else {
      // Usar o i18n normal para outras mensagens
      content = i18n.t(translationKey, values);
    }

    setMessages(prev => [...prev, {
      type: 'system',
      content: content,
      timestamp: new Date().toISOString()
    }]);
    scrollToBottom();
  };

  const handleUserResponse = (response, optionData = null) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: response,
      timestamp: new Date().toISOString()
    }]);

    setUserInput('');
    setActiveChoices([]);

    // Armazenar a resposta e dados da opção para uso na navegação
    setLastResponse({ text: response, optionData });

    // Se estamos respondendo a um nó de pergunta, salvar a resposta na variável correspondente
    if (currentNodeId) {
      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (currentNode && currentNode.type === 'questionNode' && currentNode.data.variableName) {
        // Salvar a resposta na variável definida pelo nó
        setVariable(currentNode.data.variableName, response);
      }
      if (currentNode && currentNode.type === 'conditionalNode' && currentNode.data.variableName) {
        // Salvar a resposta na variável definida pelo nó
        setVariable(currentNode.data.variableName, response);
      }
    }

    scrollToBottom();
    setTimeout(() => findAndProcessNextNode(currentNodeId, response, optionData), 800);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Função para permitir clicar nos links em mensagens de sistema
  const renderSystemMessage = (content) => {
    return parseMessageContent(content);
  };

  // Componente para exibir o painel de variáveis
  const VariablesPanel = () => {
    if (!showVariablesPanel || Object.keys(flowVariables).length === 0) {
      return null;
    }

    return (
      <Paper sx={{
        position: 'absolute',
        right: 16,
        top: 80,
        p: 2,
        zIndex: 1200,
        maxWidth: 300,
        maxHeight: '60vh',
        overflow: 'auto',
        borderRadius: 1,
        boxShadow: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.95)
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">Variáveis do Fluxo</Typography>
          <IconButton size="small" onClick={() => setShowVariablesPanel(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 1 }} />
        {Object.entries(flowVariables).map(([name, value]) => (
          <Box key={name} sx={{ mb: 1, pb: 1, borderBottom: `1px dashed ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              ${name}
            </Typography>
            <Typography variant="body2">
              {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.shape.borderRadius,
          height: '80vh',
          overflow: 'hidden',
          backgroundColor: chatBgColor
        }
      }}
    >
      {/* Cabeçalho estilo mensageria */}
      <DialogTitle sx={{
        bgcolor: headerBgColor,
        color: headerTextColor,
        py: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        <IconButton onClick={onClose} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Avatar src="/logo.png" sx={{ mx: 2 }} />
        <Box flex={1}>
          <Typography variant="h6">Prévia do Fluxo</Typography>
          <Typography variant="caption" display="block">
            {simulationComplete ? 'Concluído' : 'Em andamento'}
          </Typography>
        </Box>
        <IconButton color="inherit">
          <MoreVertIcon />
        </IconButton>
        <Tooltip title="Ver Variáveis">
          <Badge
            badgeContent={Object.keys(flowVariables).length}
            color="primary"
            invisible={Object.keys(flowVariables).length === 0}
          >
            <IconButton
              color={showVariablesPanel ? "primary" : "default"}
              onClick={() => setShowVariablesPanel(prev => !prev)}
              sx={{
                ...(showVariablesPanel && {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                })
              }}
            >
              <CodeIcon />
            </IconButton>
          </Badge>
        </Tooltip>
      </DialogTitle>

      {/* Painel de Variáveis */}
      {showVariablesPanel && <VariablesPanel />}

      {/* Área de mensagens */}
      <DialogContent sx={{
        p: 2,
        flex: 1,
        overflowY: 'auto',
        backgroundImage: theme.palette.mode === 'dark' ? 'none' : 'url(/whatsapp-bg.png)',
        backgroundSize: 'contain',
        backgroundColor: chatBgColor
      }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{
            display: 'flex',
            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
            mb: 2
          }}>
            {msg.type === 'system' ? (
              <Paper sx={{
                maxWidth: '90%',
                p: 1.5,
                borderRadius: 2,
                bgcolor: systemMessageBg,
                textAlign: 'center',
                mx: 'auto'
              }}>
                <Typography variant="body2" color="text.secondary">
                  {renderSystemMessage(msg.content)}
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{
                maxWidth: '80%',
                p: 1.5,
                borderRadius: 2,
                bgcolor: msg.type === 'user' ? messageBubbleUserBg : messageBubbleBotBg,
                color: messageBubbleTextColor,
                position: 'relative',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  [msg.type === 'user' ? 'right' : 'left']: -8,
                  top: 0,
                  border: `8px solid transparent`,
                  borderTopColor: msg.type === 'user' ? messageBubbleUserBg : messageBubbleBotBg
                }
              }}>
                {msg.mediaType === 'image' && msg.mediaUrl && (
                  <Box sx={{
                    maxWidth: 250,
                    maxHeight: 200,
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 1
                  }}>
                    <img
                      src={msg.mediaUrl}
                      alt="Mídia"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}

                {msg.mediaType === 'document' && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <DocumentIcon fontSize="small" />
                    <Typography variant="body2">
                      {msg.filename || 'Documento'}
                    </Typography>
                  </Box>
                )}

                {msg.mediaType === 'audio' && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <AudioFileIcon fontSize="small" />
                    <Typography variant="body2">
                      {msg.filename || 'Áudio'}
                    </Typography>
                  </Box>
                )}

                {msg.mediaType === 'video' && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <VideoFileIcon fontSize="small" />
                    <Typography variant="body2">
                      {msg.filename || 'Vídeo'}
                    </Typography>
                  </Box>
                )}

                {msg.mediaType === 'location' && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <LocationIcon fontSize="small" />
                    <Typography variant="body2">
                      Localização
                    </Typography>
                  </Box>
                )}

<Typography variant="body2">
                  {parseMessageContent(msg.content)}
                </Typography>

                {msg.options?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {msg.options.map((opt, i) => (
                      <Button
                        key={i}
                        variant="outlined"
                        size="small"
                        onClick={() => handleUserResponse(opt.text, opt)}
                        sx={{
                          display: 'block',
                          width: '100%',
                          mb: 1,
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main
                        }}
                      >
                        {opt.text}
                      </Button>
                    ))}
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary" sx={{
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Paper>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </DialogContent>

      {/* Controles de simulação */}
      <DialogActions sx={{
        p: 1,
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RestartIcon />}
            onClick={resetSimulation}
            color="primary"
          >
            Reiniciar
          </Button>

          <Button
            variant="outlined"
            startIcon={autoPlay ? <PauseIcon /> : <PlayIcon />}
            onClick={() => setAutoPlay(!autoPlay)}
            color="primary"
          >
            {autoPlay ? 'Pausar' : 'Continuar'}
          </Button>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Digite uma resposta..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleUserResponse(userInput)}
              disabled={activeChoices.length > 0 || simulationComplete}
              sx={{
                maxWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  bgcolor: theme.palette.background.default
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUserResponse(userInput)}
              disabled={!userInput.trim() || simulationComplete}
              endIcon={<SendIcon />}
              sx={{ borderRadius: 2 }}
            >
              Enviar
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FlowPreviewModal;