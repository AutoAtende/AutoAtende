import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { alpha, createTheme, ThemeProvider, StyledEngineProvider, useTheme } from '@mui/material/styles';
import { useHistory, useParams } from 'react-router-dom';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  Panel,
  Controls
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Avatar,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Stack,
  Divider,
  Tooltip,
  Popper,
  Grow,
  ClickAwayListener,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  HelpOutline as HelpOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Chat as ChatIcon,
  Code as CodeIcon,
  CallSplit as CallSplitIcon,
  Stop as StopIcon,
  PersonAdd as PersonAddIcon,
  Image as ImageIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Http as HttpIcon,
  SwapCalls as SwapCallsIcon,
  Api as ApiIcon,
  LocalOffer as LocalOfferIcon,
  Psychology as PsychologyIcon,
  QueuePlayNext as QueuePlayNextIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Message as MessageIcon,
  Route as FlowIcon,
  Construction as IntegrationIcon,
  AutoAwesome as AutoAwesomeIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Comment as CommentIcon,
  HourglassEmpty as InactivityIcon,
  Settings as SettingsIcon

} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { i18n } from '../../translate/i18n';
import { AuthContext } from '../../context/Auth/AuthContext';
import FlowOptimizer from './components/FlowOptimizer';

// Componentes do FlowBuilder
import StartNode from './components/nodes/StartNode';
import MessageNode from './components/nodes/MessageNode';
import InternalMessageNode from './components/nodes/InternalMessageNode';
import ConditionalNode from './components/nodes/ConditionalNode';
import EndNode from './components/nodes/EndNode';
import AttendantNode from './components/nodes/AttendantNode';
import ImageNode from './components/nodes/ImageNode';
import TagNode from './components/nodes/TagNode';
import QuestionNode from './components/nodes/QuestionNode';
import WebhookNode from './components/nodes/WebhookNode';
import SwitchFlowNode from './components/nodes/SwitchFlowNode';
import OpenAINode from './components/nodes/OpenAINode';
import TypebotNode from './components/nodes/TypebotNode';
import ApiNode from './components/nodes/ApiNode';
import MenuNode from './components/nodes/MenuNode';
import QueueNode from './components/nodes/QueueNode';
import DatabaseNode from './components/nodes/DatabaseNode';
import InactivityNode from './components/nodes/InactivityNode';
import CustomEdge from './components/CustomEdge';
import NodeDrawer from './components/drawers/NodeDrawer';
import FlowPreviewModal from './components/FlowPreviewModal';
import NodeHelpModal from './components/NodeHelpModal';
import DownloadButton from './components/DownloadButton';
import ScheduleNode from './components/nodes/ScheduleNode';
import AppointmentNode from './components/nodes/AppointmentNode';
import InactivitySettingsModal from './modals/InactivitySettingsModal';


// Definição de tipos de nós disponíveis
const nodeTypes = {
  startNode: StartNode,
  messageNode: MessageNode,
  conditionalNode: ConditionalNode,
  endNode: EndNode,
  attendantNode: AttendantNode,
  imageNode: ImageNode,
  questionNode: QuestionNode,
  webhookNode: WebhookNode,
  switchFlowNode: SwitchFlowNode,
  apiNode: (props) => (
    <ApiNode
      {...props}
      data={{
        ...props.data,
        onEdit: () => {
          setSelectedNode({ id: props.id, type: 'apiNode', data: props.data });
          setNodeDrawerOpen(true);
        }
      }}
    />
  ),
  tagNode: TagNode,
  openaiNode: OpenAINode,
  typebotNode: TypebotNode,
  menuNode: MenuNode,
  queueNode: QueueNode,
  databaseNode: DatabaseNode,
  scheduleNode: ScheduleNode,
  appointmentNode: AppointmentNode,
  internalMessageNode: InternalMessageNode,
  inactivityNode: InactivityNode
};

// Definição de tipos de arestas disponíveis
const edgeTypes = {
  custom: CustomEdge
};

// Estilos globais para o FlowBuilder
const flowBuilderStyles = `
  .flowbuilder-container .react-flow__edge-path {
    stroke-width: 1.5 !important;
  }

  .flowbuilder-container .react-flow__edge-path:hover {
    stroke-width: 2 !important;
  }
  
  .react-flow__edge-interaction {
    stroke-width: 15 !important;
    opacity: 0 !important;
    stroke: transparent !important;
  }
  
  .edge-context-menu {
    z-index: 1500 !important;
    position: absolute;
    pointer-events: auto;
  }
  
  @keyframes dashAnimation {
    to {
      stroke-dashoffset: -1000;
    }
  }
  
  .react-flow__edge-path {
    stroke-dasharray: 5, 5;
    animation: dashAnimation 30s linear infinite;
  }
  
  .node-button {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .node-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .toolbar-category {
    transition: background-color 0.2s ease;
  }
  
  .toolbar-category:hover {
    background-color: rgba(0,0,0,0.04);
  }
  
  /* Ajuste para o cursor quando arrastando nós */
  .react-flow__node {
    cursor: grab;
  }
  
  .react-flow__node.dragging {
    cursor: grabbing;
  }
  
  /* Estilo para o menu de nós */
  .node-menu {
    z-index: 1500;
  }
`;

// Componente NodeToolbar - Exibe os tipos de nós por categoria
const NodeToolbar = ({
  nodes,
  onSelectNode,
  open,
  anchorEl,
  onClose,
  category,
  title
}) => {
  const theme = useTheme();

  // Garantir que realmente temos um elemento de referência e que o menu está aberto
  if (!open || !anchorEl) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      role="menu"
      placement="bottom-start"
      transition
      disablePortal={false}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
      className="node-menu"
      style={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Grow
          {...TransitionProps}
          style={{ transformOrigin: 'top left' }}
        >
          <Paper
            sx={{
              p: 1.5,
              mt: 0.5,
              boxShadow: theme.shadows[3],
              borderRadius: 1,
              width: 400, // Aumentado para acomodar nomes completos
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            <ClickAwayListener onClickAway={onClose}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, pl: 1 }}>
                  {title}
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1
                  }}
                >
                  {nodes.map((node) => (
                    <Tooltip
                      key={node.type}
                      title={node.description || node.label}
                      placement="top"
                      arrow
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: alpha(node.color, 0.15),
                              color: node.color
                            }}
                          >
                            {React.cloneElement(node.icon, { fontSize: 'small' })}
                          </Avatar>
                        }
                        onClick={() => {
                          onSelectNode(node.type);
                          onClose();
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          borderColor: alpha(node.color, 0.3),
                          color: theme.palette.text.primary,
                          '&:hover': {
                            bgcolor: alpha(node.color, 0.05),
                            borderColor: node.color
                          },
                          textTransform: 'none',
                          fontWeight: 'normal',
                          p: '6px 12px',
                          minHeight: 42,
                          overflow: 'hidden', // Para text-overflow
                        }}
                        className="node-button"
                      >
                        <Typography variant="body2" noWrap={false} sx={{ width: '100%', textAlign: 'left' }}>
                          {node.label}
                        </Typography>
                      </Button>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};

const FlowBuilder = () => {
  const { user } = useContext(AuthContext);
  const companyId = localStorage.getItem("companyId");

  const baseTheme = useTheme();
  const customTheme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      node: {
        start: '#10b981',
        message: '#3b82f6',
        conditional: '#f59e0b',
        end: '#ef4444',
        attendant: '#0ea5e9',
        internalMessage: '#0ea5e9',
        image: '#10b981',
        question: '#f59e0b',
        webhook: '#9333ea',
        switchFlow: '#0ea5e9',
        api: '#0369a1',
        menu: '#3b82f6', // Cor para o nó de menu
      },
      background: {
        ...baseTheme.palette.background,
        // Use a cor baseada no tema atual
        grid: baseTheme.palette.mode === 'dark' ? alpha(baseTheme.palette.background.default, 0.3) : '#f5f5f5'
      }
    },
  });

  const history = useHistory();
  const { id } = useParams();

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Estado para controle do menu de contexto de edge
  const [edgeContextMenu, setEdgeContextMenu] = useState(null);
  const [connectionStartHandle, setConnectionStartHandle] = useState(null);

  // Estados para controle do fluxo
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDrawerOpen, setNodeDrawerOpen] = useState(false);

  // Estados para controle dos menus de ferramentas
  const [messageNodesMenuOpen, setMessageNodesMenuOpen] = useState(false);
  const [flowNodesMenuOpen, setFlowNodesMenuOpen] = useState(false);
  const [integrationNodesMenuOpen, setIntegrationNodesMenuOpen] = useState(false);

  // Referências para âncoras dos menus
  const messageMenuAnchorRef = useRef(null);
  const flowMenuAnchorRef = useRef(null);
  const integrationMenuAnchorRef = useRef(null);

  // Estados para controle da interface  
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [optimizationModalOpen, setOptimizationModalOpen] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [optimizationDetails, setOptimizationDetails] = useState(null);

  // Estado para controle da inicialização do fluxo
  const [flowInitialized, setFlowInitialized] = useState(false);

  // Estado para controle do modal de configurações de inatividade
  const [inactivitySettingsOpen, setInactivitySettingsOpen] = useState(false);


  // Definindo as categorias de nós com descrições
  const messageNodes = [
    {
      type: 'messageNode',
      label: i18n.t('flowBuilder.nodes.message') || 'Mensagem',
      description: 'Envia mensagem de texto para o contato',
      icon: <ChatIcon fontSize="small" />,
      color: customTheme.palette.node?.message || '#3b82f6',
      category: 'message'
    },
    {
      type: 'internalMessageNode',
      label: 'Mensagem Interna',
      description: 'Cria mensagem interna no ticket',
      icon: <CommentIcon fontSize="small" />,
      color: customTheme.palette.secondary?.main || '#9333ea',
      category: 'message'
    },
    {
      type: 'imageNode',
      label: i18n.t('flowBuilder.nodes.image') || 'Imagem',
      description: 'Envia imagem com legenda opcional',
      icon: <ImageIcon fontSize="small" />,
      color: customTheme.palette.success?.main || '#10b981',
      category: 'message'
    },
    {
      type: 'questionNode',
      label: i18n.t('flowBuilder.nodes.question') || 'Pergunta',
      description: 'Faz uma pergunta e aguarda resposta',
      icon: <QuestionAnswerIcon fontSize="small" />,
      color: customTheme.palette.warning?.main || '#f59e0b',
      category: 'message'
    },
    {
      type: 'menuNode',
      label: 'Menu de Opções',
      description: 'Exibe menu com opções para seleção',
      icon: <MenuIcon fontSize="small" />,
      color: customTheme.palette.warning?.dark || '#f59e0b',
      category: 'message'
    }
  ];

  const flowNodes = [
    {
      type: 'conditionalNode',
      label: i18n.t('flowBuilder.nodes.conditional') || 'Condicional',
      description: 'Direciona o fluxo baseado em condições',
      icon: <CallSplitIcon fontSize="small" />,
      color: customTheme.palette.node?.conditional || '#f59e0b',
      category: 'flow'
    },
    {
      type: 'endNode',
      label: i18n.t('flowBuilder.nodes.end') || 'Finalizar',
      description: 'Finaliza o fluxo de atendimento',
      icon: <StopIcon fontSize="small" />,
      color: customTheme.palette.node?.end || '#ef4444',
      category: 'flow'
    },
    {
      type: 'switchFlowNode',
      label: i18n.t('flowBuilder.nodes.switchFlow') || 'Trocar Fluxo',
      description: 'Muda para outro fluxo de atendimento',
      icon: <SwapCallsIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'flow'
    }
  ];

  const integrationNodes = [
    {
      type: 'attendantNode',
      label: i18n.t('flowBuilder.nodes.attendant') || 'Atendente',
      description: 'Transfere para atendimento humano',
      icon: <PersonAddIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'integration'
    },
    {
      type: 'scheduleNode',
      label: 'Verificação de Horário',
      description: 'Verifica horário de atendimento',
      icon: <AccessTimeIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'integration'
    },
    {
      type: 'appointmentNode',
      label: 'Agendamento',
      description: 'Sistema de agendamento de compromissos',
      icon: <EventIcon fontSize="small" />,
      color: customTheme.palette.success?.main || '#10b981',
      category: 'integration'
    },
    {
      type: 'inactivityNode',
      label: 'Detecção de Inatividade',
      description: 'Monitora e reage à inatividade do usuário',
      icon: <InactivityIcon fontSize="small" />,
      color: customTheme.palette.warning?.main || '#f59e0b',
      category: 'integration'
    },
    {
      type: 'databaseNode',
      label: i18n.t('flowBuilder.nodes.database') || 'Banco de Dados',
      description: 'Consulta ou salva dados no banco',
      icon: <StorageIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'integration'
    },
    {
      type: 'webhookNode',
      label: i18n.t('flowBuilder.nodes.webhook') || 'Webhook',
      description: 'Envia dados para URL externa',
      icon: <HttpIcon fontSize="small" />,
      color: customTheme.palette.secondary?.main || '#9333ea',
      category: 'integration'
    },
    {
      type: 'apiNode',
      label: i18n.t('flowBuilder.nodes.api') || 'API',
      description: 'Faz chamadas para APIs externas',
      icon: <ApiIcon fontSize="small" />,
      color: customTheme.palette.info?.dark || '#0369a1',
      category: 'integration'
    },
    {
      type: 'tagNode',
      label: i18n.t('flowBuilder.nodes.tag.title') || 'Tag',
      description: 'Aplica ou remove tags do contato',
      icon: <LocalOfferIcon fontSize="small" />,
      color: customTheme.palette.success?.main || '#10b981',
      category: 'integration'
    },
    {
      type: 'queueNode',
      label: i18n.t('flowBuilder.nodes.queue') || 'Fila',
      description: 'Direciona para fila de atendimento',
      icon: <QueuePlayNextIcon fontSize="small" />,
      color: customTheme.palette.secondary?.dark || '#7c3aed',
      category: 'integration'
    },
    {
      type: 'openaiNode',
      label: i18n.t('flowBuilder.nodes.openai') || 'OpenAI',
      description: 'Integração com assistente OpenAI',
      icon: <PsychologyIcon fontSize="small" />,
      color: customTheme.palette.info?.dark || '#0369a1',
      category: 'integration'
    },
    {
      type: 'typebotNode',
      label: i18n.t('flowBuilder.nodes.typebot') || 'Typebot',
      description: 'Integração com Typebot',
      icon: <PlayArrowIcon fontSize="small" />,
      color: customTheme.palette.secondary?.main || '#9333ea',
      category: 'integration'
    }
  ];

  // Limpar estados ao desmontar o componente
  useEffect(() => {
    return () => {
      setFlowInitialized(false);
      setNodes([]);
      setEdges([]);
    };
  }, []);

  // Função para remover arestas
  const onEdgeRemove = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges]);

  // Efeito para adicionar ouvinte de clique global para fechar o menu de contexto
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (edgeContextMenu && !event.target.closest('.edge-context-menu')) {
        setEdgeContextMenu(null);
      }
    };

    // Só adiciona o listener se o menu estiver aberto
    if (edgeContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [edgeContextMenu]);

  // Inicialização básica do fluxo
  const initializeBasicFlow = useCallback(() => {
    console.log('Inicializando fluxo básico');

    // Definir estado de loading
    setLoading(true);

    // Criar nós iniciais
    const startNode = {
      id: 'start',
      type: 'startNode',
      data: { label: 'Início' },
      position: { x: 250, y: 100 },
      draggable: true,
      deletable: false
    };

    const endNode = {
      id: 'end',
      type: 'endNode',
      data: { label: 'Fim' },
      position: { x: 250, y: 300 },
      draggable: true,
      deletable: true
    };

    // Atualizar nós
    setNodes([startNode, endNode]);

    // Criar conexão
    const newEdge = {
      id: 'edge-start-end',
      source: 'start',
      target: 'end',
      type: 'custom',
      data: { onEdgeRemove },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
      },
    };

    // Atualizar arestas
    setEdges([newEdge]);

    // Atualizar estados de controle
    setFlowInitialized(true);
    setLoading(false);

  }, [setNodes, setEdges, onEdgeRemove]);

  const loadFlow = useCallback(async (flowId) => {
    try {
      setLoading(true);
      console.log('Carregando fluxo:', flowId);

      const { data } = await api.get(`/flow-builder/${flowId}`);

      if (data) {
        setFlowName(data.name || '');
        setFlowDescription(data.description || '');

        // Processar nós
        if (Array.isArray(data.nodes) && data.nodes.length > 0) {
          console.log('Nodes encontrados:', data.nodes.length);

          // Processar arestas
          let processedEdges = [];
          if (Array.isArray(data.edges)) {
            console.log('Edges encontrados:', data.edges.length);
            processedEdges = data.edges.map(edge => ({
              ...edge,
              type: 'custom',
              data: { onEdgeRemove }
            }));
          }

          // Verificar se o fluxo precisa de otimização
          const needsOptimize = FlowOptimizer.needsOptimization({
            nodes: data.nodes,
            edges: data.edges
          });

          if (needsOptimize) {
            console.log('Fluxo necessita otimização, executando otimização automática...');

            // Realizar a otimização do fluxo
            const optimizationResult = FlowOptimizer.optimizeFlow({
              nodes: data.nodes,
              edges: data.edges
            });

            if (optimizationResult.optimized) {
              console.log(`Fluxo otimizado automaticamente: ${optimizationResult.totalOptimized} nós atualizados.`);

              // Guardar nome e descrição em variáveis locais para garantir preservação
              const currentName = data.name || '';
              const currentDescription = data.description || '';

              // Usar os nós otimizados
              setNodes(optimizationResult.flow.nodes);

              // Processar as arestas otimizadas
              const updatedEdges = optimizationResult.flow.edges.map(edge => ({
                ...edge,
                type: 'custom',
                data: { onEdgeRemove }
              }));

              setEdges(updatedEdges);

              // Garantir que nome e descrição sejam preservados
              setFlowName(currentName);
              setFlowDescription(currentDescription);

              // Exibir notificação
              setNotification({
                open: true,
                message: `Fluxo otimizado automaticamente (${optimizationResult.totalOptimized} nós atualizados).`,
                type: 'info'
              });

              // Salvar com uma função que use os valores corretos
              setTimeout(() => {
                // Usar uma função separada que capture os valores atuais
                const saveOptimizedFlow = async () => {
                  try {
                    setLoading(true);

                    const flowData = {
                      name: currentName, // Usar as variáveis locais
                      description: currentDescription, // Usar as variáveis locais  
                      nodes: optimizationResult.flow.nodes || [],
                      edges: optimizationResult.flow.edges.map(edge => ({
                        ...edge,
                        data: edge.data ? { ...edge.data, onEdgeRemove: undefined } : {}
                      })) || []
                    };

                    if (id) {
                      await api.put(`/flow-builder/${id}`, flowData);
                    }

                  } catch (err) {
                    console.error("Erro ao salvar fluxo otimizado:", err);
                  } finally {
                    setLoading(false);
                  }
                };

                saveOptimizedFlow();
              }, 1500);
            } else {
              // Se não houve otimização, usar os nós e arestas originais
              setNodes(data.nodes);
              setEdges(processedEdges);
            }
          } else {
            // Se não precisa de otimização, usar os nós e arestas originais
            setNodes(data.nodes);
            setEdges(processedEdges);
          }

          // Definir fluxo como inicializado
          setFlowInitialized(true);
        } else {
          console.log('Criando fluxo básico por falta de nodes');
          // Se não houver nós, inicializar fluxo básico
          initializeBasicFlow();
        }
      } else {
        // Se não houver dados, inicializar fluxo básico
        console.log('Nenhum dado retornado, inicializando fluxo básico');
        initializeBasicFlow();
      }

      // Importante: sempre definir loading como false no final
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar fluxo:", err);
      setLoadError(`Erro ao carregar fluxo: ${err.message || 'Erro desconhecido'}`);
      toast.error(i18n.t('flowBuilder.errors.loadFailed'));

      // Em caso de erro na otimização, registrar o erro
      if (err.message && err.message.includes('otimização')) {
        console.error("Erro específico na otimização:", err);
      }

      // Em caso de erro, tentar inicializar fluxo básico
      initializeBasicFlow();

      // Sempre definir loading como false, mesmo em caso de erro
      setLoading(false);
    }
  }, [initializeBasicFlow, setNodes, setEdges, onEdgeRemove, setNotification]);

  // Efeito principal para controle de carregamento/inicialização do fluxo
  useEffect(() => {
    // Se já tiver sido inicializado, retornar
    if (flowInitialized) return;

    // Se estiver carregado ou em estado de erro, não fazer nada
    if (loadError) return;

    // Dependendo da presença do ID, carregar fluxo existente ou inicializar novo
    if (id) {
      console.log('Iniciando carregamento do fluxo, id:', id);
      loadFlow(id);
    } else {
      console.log('Nenhum ID fornecido, inicializando fluxo básico');
      initializeBasicFlow();
    }

    // A dependência é apenas o ID e os estados necessários
  }, [id, loadFlow, initializeBasicFlow, flowInitialized, loadError]);

  // Manipuladores para menus de categorias
  const handleCloseAllMenus = () => {
    setMessageNodesMenuOpen(false);
    setFlowNodesMenuOpen(false);
    setIntegrationNodesMenuOpen(false);
  };

  // Adicione este efeito para fechar os menus quando clicar fora deles
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // Verificar se o clique foi fora dos menus e seus botões
      if (
        messageMenuAnchorRef.current &&
        !messageMenuAnchorRef.current.contains(event.target) &&
        flowMenuAnchorRef.current &&
        !flowMenuAnchorRef.current.contains(event.target) &&
        integrationMenuAnchorRef.current &&
        !integrationMenuAnchorRef.current.contains(event.target) &&
        !event.target.closest('.node-menu') // Não fechar se clicar dentro do menu
      ) {
        handleCloseAllMenus();
      }
    };

    // Adicionar o listener se qualquer menu estiver aberto
    if (messageNodesMenuOpen || flowNodesMenuOpen || integrationNodesMenuOpen) {
      document.addEventListener('mousedown', handleGlobalClick);
      return () => {
        document.removeEventListener('mousedown', handleGlobalClick);
      };
    }
  }, [messageNodesMenuOpen, flowNodesMenuOpen, integrationNodesMenuOpen]);

  // Manipuladores de menu corrigidos
  const handleToggleMessageNodesMenu = (event) => {
    // Impedir a propagação do evento
    event.stopPropagation();

    // Alternar visibilidade do menu
    setMessageNodesMenuOpen((prev) => !prev);

    // Fechar os outros menus
    setFlowNodesMenuOpen(false);
    setIntegrationNodesMenuOpen(false);
  };

  const handleToggleFlowNodesMenu = (event) => {
    event.stopPropagation();

    setFlowNodesMenuOpen((prev) => !prev);

    // Fechar os outros menus
    setMessageNodesMenuOpen(false);
    setIntegrationNodesMenuOpen(false);
  };

  const handleToggleIntegrationNodesMenu = (event) => {
    event.stopPropagation();

    setIntegrationNodesMenuOpen((prev) => !prev);

    // Fechar os outros menus
    setMessageNodesMenuOpen(false);
    setFlowNodesMenuOpen(false);
  };

  // Função para inserir um novo nó (corrigida)
  const handleInsertNode = useCallback((nodeType) => {
    if (!reactFlowInstance) {
      console.error("ReactFlow não está inicializado");
      toast.error("Não foi possível adicionar o nó. Tente novamente.");
      return;
    }

    // Verificar se já existe um nó de início e impedir adicionar outro
    if (nodeType === 'startNode' && nodes.some(node => node.type === 'startNode')) {
      setNotification({
        open: true,
        message: 'Só é permitido um nó de início por fluxo',
        type: 'warning'
      });
      return;
    }

    // Verificar se já existe um nó de fim e impedir adicionar outro
    if (nodeType === 'endNode' && nodes.some(node => node.type === 'endNode')) {
      setNotification({
        open: true,
        message: 'Só é permitido um nó de fim por fluxo',
        type: 'warning'
      });
      return;
    }

    // Calcular a posição do novo nó no centro da viewport atual
    const viewport = reactFlowInstance.getViewport();
    const { x: viewportX, y: viewportY, zoom } = viewport;

    // Tamanho do container
    const width = reactFlowWrapper.current?.clientWidth || 800;
    const height = reactFlowWrapper.current?.clientHeight || 600;

    // Calcular o centro da viewport
    const centerX = viewportX + width / 2 / zoom;
    const centerY = viewportY + height / 2 / zoom;

    console.log(`Inserindo nó do tipo ${nodeType} na posição (${centerX}, ${centerY})`);

    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position: { x: centerX - 100, y: centerY - 50 }, // Ajuste para centralizar melhor
      data: {
        label: getDefaultNodeLabel(nodeType),
        // Dados padrão baseados no tipo do nó
        ...(nodeType === 'messageNode' ? { message: '', messageType: 'text' } : {}),
        ...(nodeType === 'internalMessageNode' ? { message: '', messageType: 'text' } : {}),
        ...(nodeType === 'imageNode' ? { message: '', messageType: 'text' } : {}),
        ...(nodeType === 'questionNode' ? { question: '', variableName: '', options: [] } : {}),
        ...(nodeType === 'webhookNode' ? { url: '', responseVariable: '' } : {}),
        ...(nodeType === 'scheduleNode' ? { configuration: { welcomeMessage: 'Bem-vindo ao sistema de agendamento!', timeoutMinutes: 30 } } : {}),
        ...(nodeType === 'appointmentNode' ? { configuration: { welcomeMessage: 'Bem-vindo ao sistema de agendamento!', timeoutMinutes: 30 } } : {}),
        ...(nodeType === 'databaseNode' ? { configuration: { welcomeMessage: 'Bem-vindo ao sistema de agendamento!', timeoutMinutes: 30 } } : {}),
        ...(nodeType === 'inactivityNode' ? {
          inactivityConfig: {
            timeoutMinutes: 5,
            warningTimeoutMinutes: 3,
            maxWarnings: 2,
            action: 'warning',
            warningMessage: 'Você ainda está aí? Por favor, responda para continuar.',
            endMessage: 'Conversa encerrada por inatividade.',
            reengageMessage: 'Vamos tentar novamente! Como posso ajudá-lo?',
            transferMessage: 'Transferindo você para um atendente devido à inatividade.',
            transferQueueId: null,
            enableCustomTimeout: false,
            useGlobalSettings: true,
            detectInactivityOn: 'all'
          }
        } : {}),
        ...(nodeType === 'conditionalNode' ? { conditions: [] } : {}),
        ...(nodeType === 'menuNode' ? { menuTitle: '', menuOptions: [] } : {}),
        ...(nodeType === 'appointmentNode' ? {
          configuration: {
            welcomeMessage: 'Bem-vindo ao sistema de agendamento!',
            timeoutMinutes: 30
          }
        } : {}),
        ...(nodeType === 'apiNode' ? {
          method: 'GET',
          url: '',
          responseVariable: '',
          headers: {},
          queryParams: {}
        } : {}),
        nodeId: `node_${Date.now()}`,
        // Adicionar callbacks para edição (isso é crucial)
        onEdit: (nodeId) => {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            setNodeDrawerOpen(true);
          }
        }
      },
      // Se for um nó de início, impedir que seja excluído
      ...(nodeType === 'startNode' ? { deletable: false } : {})
    };

    // Adicionar nó ao fluxo
    setNodes((nds) => nds.concat(newNode));

    // Mostrar notificação de sucesso
    toast.success(`Nó de ${getDefaultNodeLabel(nodeType)} adicionado com sucesso!`);

    // Centralizar a visualização no novo nó
    setTimeout(() => {
      reactFlowInstance.fitView({
        nodes: [newNode],
        padding: 0.5,
        duration: 500
      });
    }, 50);
  }, [reactFlowInstance, nodes, setNodes, setNotification]);

  // Manipuladores de eventos para o FlowBuilder
  const onConnect = useCallback((params) => {
    console.log('Conectando nodes:', params);
    setEdges((eds) => addEdge({
      ...params,
      type: 'custom',
      data: { onEdgeRemove },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
      },
    }, eds));
  }, [setEdges, onEdgeRemove]);

  // Manipulador para conexão iniciada - rastreia o handle de início
  const onConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
    if (handleType === 'source') {
      setConnectionStartHandle({ nodeId, handleId });
    }
  }, []);

  // Manipulador para conexão finalizada em um espaço vazio
  const onConnectEnd = useCallback((event) => {
    // Se não tiver um handle de conexão inicial, não faz nada
    if (!connectionStartHandle) {
      return;
    }

    // Verificar se o alvo é um nó (não queremos abrir o menu se soltar sobre um nó)
    const targetIsNode = event.target && event.target.closest('.react-flow__node');
    if (targetIsNode) {
      setConnectionStartHandle(null);
      return;
    }

    // Obter as coordenadas do wrapper do ReactFlow
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) {
      setConnectionStartHandle(null);
      return;
    }

    // Verificar se o clique foi dentro da área do canvas
    const isInsideCanvas = (
      event.clientX > reactFlowBounds.left &&
      event.clientX < reactFlowBounds.right &&
      event.clientY > reactFlowBounds.top &&
      event.clientY < reactFlowBounds.bottom
    );

    if (isInsideCanvas && reactFlowInstance) {
      // Calculando a posição relativa ao canvas
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      };

      // Abrir o menu de contexto na posição calculada
      setTimeout(() => {
        setEdgeContextMenu({
          sourceNodeId: connectionStartHandle.nodeId,
          sourceHandleId: connectionStartHandle.handleId,
          position: position
        });
      }, 50); // Pequeno timeout para garantir que outros eventos sejam processados primeiro
    }

    // Limpar o estado de conexão inicial
    setConnectionStartHandle(null);
  }, [connectionStartHandle, reactFlowInstance]);

  const handleSelectNodeType = useCallback((nodeType, position) => {
    if (!edgeContextMenu || !reactFlowInstance) return;

    // Verificar se já existe um nó de início e impedir adicionar outro
    if (nodeType === 'startNode' && nodes.some(node => node.type === 'startNode')) {
      setNotification({
        open: true,
        message: 'Só é permitido um nó de início por fluxo',
        type: 'warning'
      });
      setEdgeContextMenu(null);
      return;
    }

    // Verificar se já existe um nó de fim e impedir adicionar outro
    if (nodeType === 'endNode' && nodes.some(node => node.type === 'endNode')) {
      setNotification({
        open: true,
        message: 'Só é permitido um nó de fim por fluxo',
        type: 'warning'
      });
      setEdgeContextMenu(null);
      return;
    }

    // Converter posição do mouse para posição do fluxo com validação
    const flowPosition = reactFlowInstance.screenToFlowPosition({
      x: Math.max(0, (edgeContextMenu.position?.x || 0)),
      y: Math.max(0, (edgeContextMenu.position?.y || 0))
    });

    // Criar novo nó
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position: flowPosition,
      data: {
        label: getDefaultNodeLabel(nodeType),
        // Dados padrão baseados no tipo do nó
        ...(nodeType === 'messageNode' ? { message: '', messageType: 'text' } : {}),
        ...(nodeType === 'internalMessageNode' ? { message: '', messageType: 'text' } : {}),
        ...(nodeType === 'imageNode' ? { message: '', messageType: 'text' } : {}),
        ...(nodeType === 'questionNode' ? { question: '', variableName: '', options: [] } : {}),
        ...(nodeType === 'webhookNode' ? { url: '', responseVariable: '' } : {}),
        ...(nodeType === 'conditionalNode' ? { conditions: [] } : {}),
        ...(nodeType === 'menuNode' ? { menuTitle: '', menuOptions: [] } : {}),
        ...(nodeType === 'apiNode' ? {
          method: 'GET',
          url: '',
          responseVariable: '',
          headers: {},
          queryParams: {}
        } : {}),
        ...(nodeType === 'tagNode' ? { tag: '' } : {}),
        // Adicionar callback para edição
        onEdit: (nodeId) => {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            setNodeDrawerOpen(true);
          }
        }
      }
    };

    // Adicionar nó ao fluxo
    setNodes((nds) => nds.concat(newNode));

    // Criar edge conectando o nó de origem ao novo nó com o tipo personalizado
    const newEdge = {
      id: `edge_${Date.now()}`,
      source: edgeContextMenu.sourceNodeId,
      sourceHandle: edgeContextMenu.sourceHandleId,
      target: newNode.id,
      type: 'custom',
      data: { onEdgeRemove },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
      }
    };

    setEdges((eds) => eds.concat(newEdge));

    // Fechar o menu após a operação completa
    setEdgeContextMenu(null);
  }, [edgeContextMenu, reactFlowInstance, setNodes, setEdges, onEdgeRemove, nodes, setNotification]);

  // Novo manipulador de arrastar sobre (drag over)
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Novo manipulador para drop
  const onDrop = useCallback((event) => {
    event.preventDefault();

    const nodeType = event.dataTransfer.getData('application/reactflow');

    if (!nodeType || !reactFlowInstance) {
      return;
    }

    // Verificar se já existe um nó de início e impedir adicionar outro
    if (nodeType === 'startNode' && nodes.some(node => node.type === 'startNode')) {
      setNotification({
        open: true,
        message: 'Só é permitido um nó de início por fluxo',
        type: 'warning'
      });
      return;
    }

    // Verificar se já existe um nó de fim e impedir adicionar outro
    if (nodeType === 'endNode' && nodes.some(node => node.type === 'endNode')) {
      setNotification({
        open: true,
        message: 'Só é permitido um nó de fim por fluxo',
        type: 'warning'
      });
      return;
    }

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    // Criar novo nó na posição do drop
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: getDefaultNodeLabel(nodeType),
        // Dados padrão baseados no tipo do nó
        ...(nodeType === 'messageNode' ? { message: '', messageType: 'text' } : {}),
        ...(nodeType === 'conditionalNode' ? { conditions: [] } : {}),
        ...(nodeType === 'menuNode' ? { menuTitle: '', menuOptions: [] } : {}),
        ...(nodeType === 'apiNode' ? {
          method: 'GET',
          url: '',
          responseVariable: '',
          headers: {},
          queryParams: {}
        } : {}),
        ...(nodeType === 'webhookNode' ? { url: '', responseVariable: '' } : {}),
        ...(nodeType === 'tagNode' ? { tag: '' } : {}),

        // Adicionar callback para edição
        onEdit: (nodeId) => {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            setNodeDrawerOpen(true);
          }
        }
      }
    };

    // Adicionar nó ao fluxo
    setNodes((nds) => nds.concat(newNode));

    // Mostrar notificação de sucesso
    toast.success(`Nó de ${getDefaultNodeLabel(nodeType)} adicionado com sucesso!`);
  }, [reactFlowInstance, nodes, setNodes, setNotification]);

  // Função para iniciar o arrasto de um tipo de nó
  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  // Obter label padrão baseado no tipo do nó
  const getDefaultNodeLabel = (type) => {
    switch (type) {
      case 'startNode':
        return 'Início';

      case 'messageNode':
        return 'Mensagem';

      case 'conditionalNode':
        return 'Condição';

      case 'questionNode':
        return 'Pergunta';
      case 'attendantNode':

        return 'Usuário';
      case 'imageNode':

        return 'Imagem';
      case 'webhookNode':

        return 'WebHook';

      case 'switchFlowNode':
        return 'Trocar fluxo';

      case 'scheduleNode':
        return 'Horários';

      case 'apiNode':
        return 'API';

      case 'tagNode':
        return 'Tag';

      case 'endNode':
        return 'Fim';

      case 'menuNode':
        return 'Menu';

      case 'databaseNode':
        return 'Banco de Dados';

      case 'openaiNode':
        return 'OpenAI';

      case 'typebotNode':
        return 'Typebot';

      case 'queueNode':
        return 'Fila';

      case 'appointmentNode':
        return 'Agendamento';

      case 'internalMessageNode':
        return 'Mensagem Interna';

      case 'inactivityNode':
        return 'Inatividade';

      default:
        return 'Novo Nó';
    }
  };

  // Função para validar o fluxo
  const saveFlow = useCallback(async () => {
    try {
      setLoading(true);

      // Os dados nome e descrição já estão definidos, então não precisamos abrir modal
      const flowData = {
        name: flowName,
        description: flowDescription,
        nodes: nodes || [],
        edges: edges.map(edge => ({
          ...edge,
          data: edge.data ? { ...edge.data, onEdgeRemove: undefined } : {}
        })) || []
      };

      if (id) {
        // Atualizar fluxo existente
        await api.put(`/flow-builder/${id}`, flowData);
      }
    } catch (err) {
      console.error("Erro ao salvar fluxo:", err);
    } finally {
      setLoading(false);
    }
  }, [id, flowName, flowDescription, nodes, edges, setLoading]);

  // Manipulador para seleção de nós
  const onNodeClick = useCallback((event, node) => {
    // Verificar se o nó é do tipo startNode ou endNode
    if (node.type === 'startNode') {
      // Não fazer nada ou desselecionar o nó
      setSelectedNode(null);
      return;
    }

    // Para os outros tipos de nós, continuar com o comportamento normal
    setSelectedNode(node);
    setNodeDrawerOpen(true);
  }, []);

  // Manipulador para remoção de nós, impede a remoção do nó de início
  const onNodesDelete = useCallback((nodesToDelete) => {
    // Verificar se o usuário está tentando excluir o nó de início
    const startNodeToDelete = nodesToDelete.find(node => node.type === 'startNode');

    if (startNodeToDelete) {
      // Impedir a exclusão do nó de início
      setNotification({
        open: true,
        message: 'O nó de início não pode ser removido',
        type: 'warning'
      });

      // Filtrar para excluir apenas os nós que não são o nó de início
      return nodesToDelete.filter(node => node.type !== 'startNode');
    }

    return nodesToDelete;
  }, []);

  // Atualizar dados de um nó selecionado
  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
              onEdit: node.data.onEdit
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Testar o fluxo
  const validateFlow = () => {
    // Verificar se existe um nó de início
    const hasStartNode = nodes.some(node => node.type === 'startNode');

    // Verificar se existe pelo menos um nó de fim OU um nó de troca de fluxo
    const hasEndNode = nodes.some(node => node.type === 'endNode');
    const hasSwitchFlowNode = nodes.some(node => node.type === 'switchFlowNode');
    const hasOpenAINode = nodes.some(node => node.type === 'openaiNode');
    const hasTerminalAttendantNode = nodes.some(node => node.type === 'attendantNode' && node.data.endFlowFlag);
    const hasQueueNode = nodes.some(node => node.type === 'queueNode'); // Adicionar esta verificação


    // Validar o fluxo de acordo com os critérios
    if (!hasStartNode) {
      setNotification({
        open: true,
        message: i18n.t('flowBuilder.validation.noStartNode', 'O fluxo deve conter um nó de início'),
        type: 'error'
      });
      return false;
    }

    if (!hasEndNode && !hasSwitchFlowNode && !hasOpenAINode && !hasTerminalAttendantNode && !hasQueueNode) {
      setNotification({
        open: true,
        message: i18n.t('flowBuilder.validation.noEndOrSwitchNode', 'O fluxo deve conter pelo menos um nó de fim, nó OpenAI, atendente terminal, nó de fila ou um nó de troca de fluxo'),
        type: 'error'
      });
      return false;
    }

    // Se passou nas validações, exibir mensagem de sucesso
    setNotification({
      open: true,
      message: i18n.t('flowBuilder.validation.success', 'Fluxo validado com sucesso!'),
      type: 'success'
    });

    return true;
  };

  const handleExportFlow = async () => {
    if (!id) {
      setNotification({
        open: true,
        message: 'Salve o fluxo antes de exportá-lo',
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);

      // Chamar a API para obter os dados de exportação
      const response = await api.get(`/flow-builder/${id}/export`, {
        responseType: 'blob' // Importante para receber o arquivo
      });

      // Criar um objeto URL para o blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Criar um elemento <a> temporário para o download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `flow-${flowName.replace(/\s+/g, '-')}.json`);

      // Adicionar ao documento, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar o objeto URL
      window.URL.revokeObjectURL(url);

      setNotification({
        open: true,
        message: i18n.t('flowBuilder.success.exported'),
        type: 'success'
      });
    } catch (err) {
      console.error("Erro ao exportar fluxo:", err);
      setNotification({
        open: true,
        message: i18n.t('flowBuilder.errors.exportFailed'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para tentar recarregar o fluxo
  const handleRetryLoad = () => {
    setLoadError(null);
    setFlowInitialized(false);
    loadFlow(id);
  };

  // Manipulador para quando o ReactFlow é inicializado
  const handleReactFlowInit = (instance) => {
    setReactFlowInstance(instance);
    console.log('ReactFlow inicializado com sucesso');

    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 100);

    // Inicialização automática para novos fluxos
    if (!id && !flowInitialized) {
      initializeBasicFlow();
    }
  };

  // Definição dos tipos de nós para o modal de ajuda
  const helpNodeTypes = [
    // Nós de mensagem
    {
      type: 'messageNode',
      label: i18n.t('flowBuilder.nodes.message'),
      icon: <ChatIcon fontSize="small" />,
      color: customTheme.palette.node?.message || '#3b82f6',
      category: 'message'
    },
    {
      type: 'imageNode',
      label: i18n.t('flowBuilder.nodes.image'),
      icon: <ImageIcon fontSize="small" />,
      color: customTheme.palette.success?.main || '#10b981',
      category: 'message'
    },
    {
      type: 'questionNode',
      label: i18n.t('flowBuilder.nodes.question'),
      icon: <QuestionAnswerIcon fontSize="small" />,
      color: customTheme.palette.warning?.main || '#f59e0b',
      category: 'message'
    },
    {
      type: 'internalMessageNode',
      label: 'Mensagem Interna',
      icon: <CommentIcon fontSize="small" />,
      color: customTheme.palette.secondary?.main || '#9333ea',
      category: 'message'
    },
    {
      type: 'menuNode',
      label: 'Menu',
      icon: <MenuIcon fontSize="small" />,
      color: customTheme.palette.primary?.main || '#3b82f6',
      category: 'message'
    },

    // Nós de fluxo
    {
      type: 'startNode',
      label: i18n.t('flowBuilder.nodes.start'),
      icon: <PlayArrowIcon fontSize="small" />,
      color: customTheme.palette.node?.start || '#10b981',
      category: 'flow'
    },
    {
      type: 'conditionalNode',
      label: i18n.t('flowBuilder.nodes.conditional'),
      icon: <CallSplitIcon fontSize="small" />,
      color: customTheme.palette.node?.conditional || '#f59e0b',
      category: 'flow'
    },
    {
      type: 'endNode',
      label: i18n.t('flowBuilder.nodes.end'),
      icon: <StopIcon fontSize="small" />,
      color: customTheme.palette.node?.end || '#ef4444',
      category: 'flow'
    },
    {
      type: 'switchFlowNode',
      label: i18n.t('flowBuilder.nodes.switchFlow'),
      icon: <SwapCallsIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'flow'
    },

    // Nós de integração
    {
      type: 'attendantNode',
      label: i18n.t('flowBuilder.nodes.attendant'),
      icon: <PersonAddIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'integration'
    },
    {
      type: 'scheduleNode',
      label: 'Verificação de Horário',
      icon: <AccessTimeIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'integration'
    },
    {
      type: 'inactivityNode',
      label: 'Detecção de Inatividade',
      icon: <InactivityIcon fontSize="small" />,
      color: customTheme.palette.warning?.main || '#f59e0b',
      category: 'integration'
    },
    {
      type: 'databaseNode',
      label: i18n.t('flowBuilder.nodes.database'),
      icon: <StorageIcon fontSize="small" />,
      color: customTheme.palette.info?.main || '#0ea5e9',
      category: 'integration'
    },
    {
      type: 'webhookNode',
      label: i18n.t('flowBuilder.nodes.webhook'),
      icon: <HttpIcon fontSize="small" />,
      color: customTheme.palette.secondary?.main || '#9333ea',
      category: 'integration'
    },
    {
      type: 'apiNode',
      label: i18n.t('flowBuilder.nodes.api'),
      icon: <ApiIcon fontSize="small" />,
      color: customTheme.palette.info?.dark || '#0369a1',
      category: 'integration'
    },
    {
      type: 'tagNode',
      label: i18n.t('flowBuilder.nodes.tag.title'),
      icon: <LocalOfferIcon fontSize="small" />,
      color: customTheme.palette.success?.main || '#10b981',
      category: 'integration'
    },
    {
      type: 'queueNode',
      label: i18n.t('flowBuilder.nodes.queue'),
      icon: <QueuePlayNextIcon fontSize="small" />,
      color: customTheme.palette.secondary?.dark || '#7c3aed',
      category: 'integration'
    },
    {
      type: 'openaiNode',
      label: i18n.t('flowBuilder.nodes.openai'),
      icon: <PsychologyIcon fontSize="small" />,
      color: customTheme.palette.info?.dark || '#0369a1',
      category: 'integration'
    },
    {
      type: 'typebotNode',
      label: i18n.t('flowBuilder.nodes.typebot'),
      icon: <PlayArrowIcon fontSize="small" />,
      color: customTheme.palette.secondary?.main || '#9333ea',
      category: 'integration'
    }
  ];

  // Se houver erro de carregamento, mostrar mensagem de erro com botão para tentar novamente
  if (loadError) {
    return (
      <ThemeProvider theme={customTheme}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }} elevation={2}>
              <Typography variant="h5" gutterBottom>
                Ocorreu um erro ao carregar o fluxo
              </Typography>
              <Typography variant="body1" gutterBottom color="text.secondary">
                {loadError}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRetryLoad}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: customTheme.palette.primary.main }} /> : 'Tentar novamente'}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => history.push('/flow-builder')}
                >
                  Voltar para a lista
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Componente principal
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={customTheme}>
        <style>{flowBuilderStyles}</style>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}>
          {/* Barra de ferramentas superior */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: '0 16px',
            height: 64,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            boxShadow: 1
          }}>
            {/* Área à esquerda - título */}
            <Box sx={{ display: 'flex', alignItems: 'center', pt: 3, px: 3 }}>
              <Typography variant="h6" color="text.secondary">
                {flowName || i18n.t('flowBuilder.newFlow')}
              </Typography>
            </Box>

            {/* Área à direita - ícones de ação */}
            <Box sx={{ display: 'flex', gap: 1, pt: 3, px: 3 }}>
              <Tooltip title={i18n.t('flowBuilder.save')}>
                <IconButton
                  color="primary"
                  onClick={saveFlow}
                  disabled={loading}
                  sx={{ backgroundColor: alpha(customTheme.palette.primary.main, 0.1) }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: customTheme.palette.primary.main }} /> : <SaveIcon sx={{ color: customTheme.palette.primary.main }} />}
                </IconButton>
              </Tooltip>

              {id && (
                <Tooltip title={i18n.t('flowBuilder.validate', 'Validar')}>
                  <IconButton
                    color="primary"
                    onClick={validateFlow}
                    disabled={loading}
                  >
                    <CheckCircleOutlineIcon sx={{ color: customTheme.palette.primary.main }} />
                  </IconButton>
                </Tooltip>
              )}

              {id && (
                <Tooltip title={i18n.t('flowBuilder.preview.title', 'Prévia')}>
                  <IconButton
                    color="primary"
                    onClick={() => setPreviewModalOpen(true)}
                    disabled={loading}
                  >
                    <VisibilityIcon sx={{ color: customTheme.palette.primary.main }} />
                  </IconButton>
                </Tooltip>
              )}

              {id && (
                <Tooltip title={i18n.t('flowBuilder.export')}>
                  <IconButton
                    color="primary"
                    onClick={handleExportFlow}
                    disabled={loading}
                  >
                    <FileDownloadIcon sx={{ color: customTheme.palette.primary.main }} />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Configurações de Inatividade">
                <IconButton
                  color="primary"
                  onClick={() => setInactivitySettingsOpen(true)}
                  disabled={loading || !id}
                >
                  <SettingsIcon sx={{ color: customTheme.palette.primary.main }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Monitor de Inatividade">
                <IconButton
                  color="primary"
                  onClick={() => history.push('/flow-builder/inactivity-monitor')}
                  disabled={loading}
                >
                  <InactivityIcon sx={{ color: customTheme.palette.primary.main }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={i18n.t('flowBuilder.help.title', 'Ajuda')}>
                <IconButton
                  color="primary"
                  onClick={() => setHelpModalOpen(true)}
                  disabled={loading}
                >
                  <HelpOutlineIcon sx={{ color: customTheme.palette.primary.main }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Barra de ferramentas de nodes */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            p: '4px 16px',
            bgcolor: alpha(customTheme.palette.primary.main, 0.03),
            borderBottom: 1,
            borderColor: 'divider',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Nodes de Mensagem">
                <Box
                  ref={messageMenuAnchorRef}
                  className="toolbar-category"
                  onClick={handleToggleMessageNodesMenu}
                  onMouseDown={(e) => e.stopPropagation()}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: '4px 8px',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: messageNodesMenuOpen ? alpha(customTheme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(customTheme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: alpha(customTheme.palette.primary.main, 0.15),
                      color: customTheme.palette.primary.main,
                      mr: 0.5
                    }}
                  >
                    <MessageIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" color="primary" fontWeight={500}>Mensagens</Typography>
                  <ArrowDropDownIcon color="primary" />
                </Box>
              </Tooltip>

              <Tooltip title="Nodes de Fluxo">
                <Box
                  ref={flowMenuAnchorRef}
                  className="toolbar-category"
                  onClick={handleToggleFlowNodesMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: '4px 8px',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: flowNodesMenuOpen ? alpha(customTheme.palette.warning.main, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(customTheme.palette.warning.main, 0.1)
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: alpha(customTheme.palette.warning.main, 0.15),
                      color: customTheme.palette.warning.main,
                      mr: 0.5
                    }}
                  >
                    <FlowIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" color="warning.main" fontWeight={500}>Fluxo</Typography>
                  <ArrowDropDownIcon color="warning" />
                </Box>
              </Tooltip>

              <Tooltip title="Nodes de Integração">
                <Box
                  ref={integrationMenuAnchorRef}
                  className="toolbar-category"
                  onClick={handleToggleIntegrationNodesMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: '4px 8px',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: integrationNodesMenuOpen ? alpha(customTheme.palette.secondary.main, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(customTheme.palette.secondary.main, 0.1)
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: alpha(customTheme.palette.secondary.main, 0.15),
                      color: customTheme.palette.secondary.main,
                      mr: 0.5
                    }}
                  >
                    <IntegrationIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" color="secondary" fontWeight={500}>Integrações</Typography>
                  <ArrowDropDownIcon color="secondary" />
                </Box>
              </Tooltip>
            </Box>

            {/* Menus de nodes por categoria */}
            <NodeToolbar
              nodes={messageNodes}
              onSelectNode={handleInsertNode}
              anchorEl={messageMenuAnchorRef.current}
              onClose={() => setMessageNodesMenuOpen(false)}
              open={messageNodesMenuOpen}
              category="message"
              title="Nodes de Mensagem"
            />

            <NodeToolbar
              nodes={flowNodes}
              onSelectNode={handleInsertNode}
              anchorEl={flowMenuAnchorRef.current}
              onClose={() => setFlowNodesMenuOpen(false)}
              open={flowNodesMenuOpen}
              category="flow"
              title="Nodes de Fluxo"
            />

            <NodeToolbar
              nodes={integrationNodes}
              onSelectNode={handleInsertNode}
              anchorEl={integrationMenuAnchorRef.current}
              onClose={() => setIntegrationNodesMenuOpen(false)}
              open={integrationNodesMenuOpen}
              category="integration"
              title="Nodes de Integração"
            />
          </Box>

          {/* Container do Flow */}
          <Box
            ref={reactFlowWrapper}
            sx={{ flex: 1, position: 'relative' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeClick={onNodeClick}
                onInit={handleReactFlowInit}
                onNodesDelete={onNodesDelete}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                minZoom={0.5}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                defaultEdgeOptions={{
                  type: 'custom',
                }}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                className="flowbuilder-container"
              >
                <Background
                  variant="dots"
                  gap={12}
                  size={1.0}
                  color={customTheme.palette.mode === 'dark' ? alpha(customTheme.palette.divider, 0.7) : customTheme.palette.divider}
                  style={{ backgroundColor: customTheme.palette.background.grid }}
                />
                <Controls />
                <Panel position="bottom-right">
                  <Stack spacing={1}>
                    <DownloadButton flowName={flowName} />
                  </Stack>
                </Panel>
              </ReactFlow>
            )}
          </Box>

          {/* Drawer de propriedades do nó */}
          <NodeDrawer
            open={nodeDrawerOpen}
            onClose={() => setNodeDrawerOpen(false)}
            node={selectedNode}
            updateNodeData={updateNodeData}
            companyId={companyId}
            nodes={nodes}
          />

          {/* Snackbar para notificações */}
          <Snackbar
            open={notification.open}
            autoHideDuration={2000}
            onClose={() => setNotification({ ...notification, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setNotification({ ...notification, open: false })}
              severity={notification.type}
              variant="filled"
              elevation={3}
              sx={{ borderRadius: 2 }}
            >
              {notification.message}
            </Alert>
          </Snackbar>

          <FlowPreviewModal
            open={previewModalOpen}
            onClose={() => setPreviewModalOpen(false)}
            nodes={nodes}
            edges={edges}
          />

          <NodeHelpModal
            open={helpModalOpen}
            onClose={() => setHelpModalOpen(false)}
            nodeTypes={helpNodeTypes}
          />

          <InactivitySettingsModal
            open={inactivitySettingsOpen}
            onClose={() => setInactivitySettingsOpen(false)}
            flowId={id}
          />


        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

// Componente FlowBuilder envolvido pelo ErrorBoundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro no FlowBuilder:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: 'background.default'
        }}>
          <Paper elevation={2} sx={{ p: 4, maxWidth: '800px', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight={600} color="error">
              Ops! Ocorreu um erro no editor de fluxos.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Por favor, tente recarregar a página ou volte para a lista de fluxos.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                disableElevation
              >
                Recarregar página
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/flow-builder'}
              >
                Voltar para lista
              </Button>
            </Box>
            <Box sx={{ mt: 4, width: '100%' }}>
              <details>
                <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                  <Typography variant="subtitle2">Detalhes técnicos do erro (para suporte)</Typography>
                </summary>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflowX: 'auto' }}>
                  <Typography variant="caption" component="div">
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                  </Typography>
                </Paper>
              </details>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Componente FlowBuilder envolvido pelo ErrorBoundary
const FlowBuilderWithErrorBoundary = () => (
  <ErrorBoundary>
    <FlowBuilder />
  </ErrorBoundary>
);

export default FlowBuilderWithErrorBoundary;