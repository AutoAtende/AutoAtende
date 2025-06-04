import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Chip,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  useMediaQuery,
  Grid,
  Divider,
  Avatar,
  Alert
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  CloudUpload as CloudUploadIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  DesignServices as DesignServicesIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  CompareArrows as CompareArrowsIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  ChatBubbleOutline as MessageIcon,
  QuestionAnswer as QuestionIcon,
  CallSplit as ConditionalIcon,
  Api as ApiIcon,
  Menu as MenuIcon,
  Http as WebhookIcon,
  PersonAdd as AttendantIcon,
  QueuePlayNext as QueueIcon,
  Storage as DatabaseIcon,
  LocalOffer as TagIcon,
  Image as ImageIcon,
  Psychology as OpenAIIcon,
  SwapCalls as SwitchFlowIcon,
  AccessTime as ScheduleIcon,
  PlayArrow as StartIcon,
  Stop as EndIcon,
  HourglassEmpty as InactivityIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../context/Auth/AuthContext';
import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { i18n } from '../../translate/i18n';
import StandardPageLayout from '../../components/shared/StandardPageLayout';
import ConfirmationModal from '../../components/ConfirmationModal';
import FlowPreviewModal from './components/FlowPreviewModal';

// Componente de modal de estatísticas
const StatsModal = ({ open, onClose, flow, nodes = [], edges = [] }) => {
  const theme = useTheme();
  // Calcular estatísticas
  const nodeTypeCount = React.useMemo(() => {
    const counts = {};
    nodes.forEach(node => {
      const type = node.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [nodes]);
  // Total de nós
  const totalNodes = nodes.length;
  // Total de conexões
  const totalEdges = edges.length;
  // Função para obter um ícone com base no tipo de nó
  const getNodeIcon = (type) => {
    const iconProps = { fontSize: 'small', style: { opacity: 0.8 } };
    switch (type) {
      case 'startNode': return <StartIcon {...iconProps} />;
      case 'endNode': return <EndIcon {...iconProps} />;
      case 'messageNode': return <MessageIcon {...iconProps} />;
      case 'questionNode': return <QuestionIcon {...iconProps} />;
      case 'conditionalNode': return <ConditionalIcon {...iconProps} />;
      case 'menuNode': return <MenuIcon {...iconProps} />;
      case 'apiNode': return <ApiIcon {...iconProps} />;
      case 'webhookNode': return <WebhookIcon {...iconProps} />;
      case 'attendantNode': return <AttendantIcon {...iconProps} />;
      case 'queueNode': return <QueueIcon {...iconProps} />;
      case 'databaseNode': return <DatabaseIcon {...iconProps} />;
      case 'tagNode': return <TagIcon {...iconProps} />;
      case 'imageNode': return <ImageIcon {...iconProps} />;
      case 'openaiNode': return <OpenAIIcon {...iconProps} />;
      case 'typebotNode': return <CodeIcon {...iconProps} />;
      case 'switchFlowNode': return <SwitchFlowIcon {...iconProps} />;
      case 'scheduleNode': return <ScheduleIcon {...iconProps} />;
      case 'inactivityNode': return <InactivityIcon {...iconProps} />;
      default: return <InfoIcon {...iconProps} />;
    }
  };
  // Função para obter o nome amigável do tipo de nó
  const getNiceNodeTypeName = (type) => {
    const typeMap = {
      'startNode': i18n.t('flowBuilder.nodes.start') || 'Início',
      'endNode': i18n.t('flowBuilder.nodes.end') || 'Fim',
      'messageNode': i18n.t('flowBuilder.nodes.message') || 'Mensagem',
      'questionNode': i18n.t('flowBuilder.nodes.question') || 'Pergunta',
      'conditionalNode': i18n.t('flowBuilder.nodes.conditional') || 'Condicional',
      'menuNode': 'Menu',
      'apiNode': i18n.t('flowBuilder.nodes.api') || 'API',
      'webhookNode': i18n.t('flowBuilder.nodes.webhook') || 'Webhook',
      'attendantNode': i18n.t('flowBuilder.nodes.attendant') || 'Atendente',
      'queueNode': i18n.t('flowBuilder.nodes.queue') || 'Fila',
      'databaseNode': i18n.t('flowBuilder.nodes.database') || 'Banco de Dados',
      'tagNode': i18n.t('flowBuilder.nodes.tag.title') || 'Tag',
      'imageNode': i18n.t('flowBuilder.nodes.image') || 'Imagem',
      'openaiNode': i18n.t('flowBuilder.nodes.openai') || 'OpenAI',
      'typebotNode': i18n.t('flowBuilder.nodes.typebot') || 'Typebot',
      'switchFlowNode': i18n.t('flowBuilder.nodes.switchFlow') || 'Troca de Fluxo',
      'scheduleNode': 'Agendamento',
      'inactivityNode': 'Inatividade'
    };
    return typeMap[type] || type.replace('Node', '');
  };
  // Função para obter a cor com base no tipo de nó
  const getNodeColor = (type) => {
    const colorMap = {
      'startNode': theme.palette.success.main,
      'endNode': theme.palette.error.main,
      'messageNode': theme.palette.primary.main,
      'questionNode': theme.palette.warning.main,
      'conditionalNode': theme.palette.warning.main,
      'menuNode': theme.palette.primary.main,
      'apiNode': theme.palette.info.dark,
      'webhookNode': theme.palette.info.main,
      'attendantNode': theme.palette.info.main,
      'queueNode': theme.palette.secondary.dark,
      'databaseNode': theme.palette.info.dark,
      'tagNode': theme.palette.success.main,
      'imageNode': theme.palette.success.main,
      'openaiNode': theme.palette.info.dark,
      'typebotNode': theme.palette.secondary.main,
      'switchFlowNode': theme.palette.info.main,
      'scheduleNode': theme.palette.info.main,
      'inactivityNode': theme.palette.info.main
    };
    return colorMap[type] || theme.palette.grey[500];
  };
  // Calculando o número médio de conexões por nó
  const avgConnectionsPerNode = totalNodes > 0 ? (totalEdges / totalNodes).toFixed(1) : 0;
  // Calculando a profundidade máxima do fluxo (aproximada pela distância entre nós)
  const calculateFlowDepth = () => {
    if (nodes.length < 2) return 0;
    // Encontrar o nó inicial
    const startNode = nodes.find(node => node.type === 'startNode');
    if (!startNode) return 0;

    // Mapa de nós visitados
    const visited = new Set();
    // Mapa de adjacência para representar o grafo
    const adjacencyMap = {};

    // Construir mapa de adjacência
    edges.forEach(edge => {
      if (!adjacencyMap[edge.source]) {
        adjacencyMap[edge.source] = [];
      }
      adjacencyMap[edge.source].push(edge.target);
    });

    // BFS para encontrar a profundidade máxima
    const queue = [{ id: startNode.id, depth: 0 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      const { id, depth } = queue.shift();

      if (visited.has(id)) continue;
      visited.add(id);

      maxDepth = Math.max(maxDepth, depth);

      // Adicionar vizinhos à fila
      if (adjacencyMap[id]) {
        adjacencyMap[id].forEach(neighbor => {
          if (!visited.has(neighbor)) {
            queue.push({ id: neighbor, depth: depth + 1 });
          }
        });
      }
    }

    return maxDepth;
  };
  const flowDepth = calculateFlowDepth();
  // Identificando tipos de nós interativos (que requerem entrada do usuário)
  const interactiveNodeCount = React.useMemo(() => {
    return nodes.filter(node =>
      ['questionNode', 'menuNode'].includes(node.type)
    ).length;
  }, [nodes]);
  // Identificando nós terminais (que encerram o fluxo)
  const terminalNodeCount = React.useMemo(() => {
    return nodes.filter(node =>
      ['endNode', 'attendantNode', 'queueNode', 'openaiNode'].includes(node.type)
    ).length;
  }, [nodes]);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: 1,
        display: 'flex',
        alignItems: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        px: 3
      }}>
        <AssessmentIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
        <Typography variant="h6" component="div">
          Estatísticas do Fluxo
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 5, px: 3 }}>
        {/* Cabeçalho com informações do fluxo */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2, mt: 2 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 64,
              height: 64,
              bgcolor: theme.palette.primary.main,
              fontSize: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            {flow?.name?.charAt(0).toUpperCase() || 'F'}
          </Avatar>

          <Box>
            <Typography variant="h6" gutterBottom>
              {flow?.name || 'Fluxo'}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {flow?.description || i18n.t('flowBuilder.list.noDescription') || 'Sem descrição'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Última atualização: {flow?.updatedAt ? new Date(flow.updatedAt).toLocaleString() : 'N/D'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Métricas principais */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Métricas Gerais
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Total de nós */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 2,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                bgcolor: alpha(theme.palette.primary.main, 0.03)
              }}
            >
              <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
                {totalNodes}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Nós do Fluxo
              </Typography>
            </Paper>
          </Grid>

          {/* Total de conexões */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 2,
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                bgcolor: alpha(theme.palette.secondary.main, 0.03)
              }}
            >
              <Typography variant="h5" color="secondary.main" fontWeight="bold" gutterBottom>
                {totalEdges}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Conexões
              </Typography>
            </Paper>
          </Grid>

          {/* Profundidade máxima do fluxo */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 2,
                borderColor: alpha(theme.palette.info.main, 0.3),
                bgcolor: alpha(theme.palette.info.main, 0.03)
              }}
            >
              <Typography variant="h5" color="info.main" fontWeight="bold" gutterBottom>
                {flowDepth}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Profundidade Máxima
              </Typography>
            </Paper>
          </Grid>

          {/* Média de conexões por nó */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 2,
                borderColor: alpha(theme.palette.warning.main, 0.3),
                bgcolor: alpha(theme.palette.warning.main, 0.03)
              }}
            >
              <Typography variant="h5" color="warning.main" fontWeight="bold" gutterBottom>
                {avgConnectionsPerNode}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Média de Conexões/Nó
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Nós interativos e terminais */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Nós interativos */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderColor: alpha(theme.palette.success.main, 0.3),
                bgcolor: alpha(theme.palette.success.main, 0.03)
              }}
            >
              <Box sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                borderRadius: '50%',
                p: 1
              }}>
                <QuestionIcon color="success" />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {interactiveNodeCount} nós interativos
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Perguntas e menus que requerem interação do usuário
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Nós terminais */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderColor: alpha(theme.palette.error.main, 0.3),
                bgcolor: alpha(theme.palette.error.main, 0.03)
              }}
            >
              <Box sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                borderRadius: '50%',
                p: 1
              }}>
                <EndIcon color="error" />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {terminalNodeCount} nós terminais
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Nós que encerram o fluxo (Fim, Atendente, Fila, etc.)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Distribuição de tipos de nós */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Distribuição de Tipos de Nós
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(nodeTypeCount).map(([type, count]) => (
            <Chip
              key={type}
              icon={getNodeIcon(type)}
              label={`${getNiceNodeTypeName(type)}: ${count}`}
              variant="outlined"
              sx={{
                borderColor: getNodeColor(type),
                color: getNodeColor(type),
                mb: 0.5,
                '& .MuiChip-icon': {
                  color: getNodeColor(type)
                }
              }}
            />
          ))}
        </Box>

        {totalNodes === 0 && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              textAlign: 'center',
              bgcolor: theme.palette.grey[50],
              border: `1px dashed ${theme.palette.divider}`
            }}
          >
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
              Este fluxo não possui nós configurados.
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          startIcon={<CheckCircleIcon />}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FlowBuilderList = () => {
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewNodes, setPreviewNodes] = useState([]);
  const [previewEdges, setPreviewEdges] = useState([]);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsFlowData, setStatsFlowData] = useState({
    flow: null,
    nodes: [],
    edges: []
  });
  const [searchParam, setSearchParam] = useState("");

  const fetchFlows = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/flow-builder', {
        params: { pageNumber: page }
      });
      setFlows(data.flows);
      setHasMore(data.hasMore);
    } catch (err) {
      toast.error(i18n.t('flowBuilder.list.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const handleOpenFlow = (id) => {
    history.push(`/flow-builder/${id}`);
  };

  const handleCreateFlow = () => {
    setCreateModalOpen(true);
  };

  const handleEditFlow = (flow) => {
    setSelectedFlow(flow);
    setEditModalOpen(true);
  };

  const handleEditFlowSubmit = async (flowData) => {
    try {
      setLoading(true);
      await api.put(`/flow-builder/${selectedFlow.id}/metadata`, {
        name: flowData.name,
        description: flowData.description
      });

      toast.success(i18n.t('flowBuilder.list.updateSuccess') || 'Fluxo atualizado com sucesso!');

      setLoading(false);
      setEditModalOpen(false);
      fetchFlows();
    } catch (err) {
      console.error("Erro ao atualizar fluxo:", err);
      toast.error(i18n.t('flowBuilder.list.updateError') || 'Erro ao atualizar fluxo');
      setLoading(false);
    }
  };

  const handleCreateFlowSubmit = async (flowData) => {
    try {
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

      // Criar conexão entre início e fim
      const initialEdge = {
        id: 'edge-start-end',
        source: 'start',
        target: 'end',
        type: 'custom',
        markerEnd: {
          type: 'arrowclosed',
        }
      };

      const { data } = await api.post('/flow-builder', {
        name: flowData.name || 'Novo fluxo',
        description: flowData.description || '',
        nodes: [startNode, endNode],
        edges: [initialEdge]
      });

      if (!data || !data.id) {
        throw new Error('ID do fluxo não retornado pelo servidor');
      }

      toast.success(i18n.t('flowBuilder.list.createSuccess'));

      setLoading(false);
      setCreateModalOpen(false);

      history.push(`/flow-builder/${data.id}`);
    } catch (err) {
      console.error("Erro ao criar fluxo:", err);
      toast.error(i18n.t('flowBuilder.list.createError'));
      setLoading(false);
      setCreateModalOpen(false);
    }
  };

  const handleDeleteFlow = async (flowId) => {
    try {
      await api.delete(`/flow-builder/${flowId}`);
      toast.success(i18n.t('flowBuilder.list.deleteSuccess'));
      fetchFlows();
    } catch (err) {
      toast.error(i18n.t('flowBuilder.list.deleteError'));
    }
    setConfirmModalOpen(false);
  };

  const handleConfirmDelete = (flow) => {
    setSelectedFlow(flow);
    setConfirmModalOpen(true);
  };

  const handleTestFlow = async (flowId) => {
    try {
      await api.post(`/flow-builder/${flowId}/test`);
      toast.success(i18n.t('flowBuilder.list.testSuccess'));
    } catch (err) {
      toast.error(i18n.t('flowBuilder.list.testError'));
    }
  };

  const handlePreviewFlow = async (flowId) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/flow-builder/${flowId}`);
      if (data) {
        setPreviewNodes(data.nodes || []);
        setPreviewEdges(data.edges || []);
        setPreviewModalOpen(true);
      }
    } catch (err) {
      console.error("Erro ao carregar fluxo para preview:", err);
      toast.error(i18n.t('flowBuilder.list.previewError') || "Erro ao carregar prévia do fluxo");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (flowId, active) => {
    try {
      await api.patch(`/flow-builder/${flowId}/activate`, { active: !active });
      fetchFlows();
    } catch (err) {
      toast.error(i18n.t('flowBuilder.list.toggleError'));
    }
  };

  const handleDuplicateFlow = async (flowId) => {
    try {
      setLoading(true);
      const { data } = await api.post(`/flow-builder/${flowId}/duplicate`);

      if (data && data.id) {
        toast.success(i18n.t('flowBuilder.list.duplicateSuccess'));
        fetchFlows();
      }
    } catch (err) {
      console.error("Erro ao duplicar fluxo:", err);
      toast.error(i18n.t('flowBuilder.list.duplicateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInactivityMonitor = async () => {
    history.push('/flow-builder/imonitor');
  };

  const handleImportFlow = async () => {
    if (!importFile) {
      toast.error(i18n.t('flowBuilder.import.noFileSelected'));
      return;
    }
    try {
      setImportLoading(true);

      const formData = new FormData();
      formData.append('file', importFile);

      const { data } = await api.post('/flow-builder/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data && data.id) {
        toast.success(i18n.t('flowBuilder.import.success'));
        fetchFlows();
        setImportModalOpen(false);
        setImportFile(null);
      }
    } catch (err) {
      console.error("Erro ao importar fluxo:", err);
      toast.error(i18n.t('flowBuilder.import.error'));
    } finally {
      setImportLoading(false);
    }
  };

  // Nova função para abrir modal de estatísticas
  const handleShowStats = async (flowId) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/flow-builder/${flowId}`);
      if (data) {
        const flow = flows.find(f => f.id === flowId);
        setStatsFlowData({
          flow,
          nodes: data.nodes || [],
          edges: data.edges || []
        });
        setStatsModalOpen(true);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do fluxo:", err);
      toast.error(i18n.t('flowBuilder.list.statsError') || "Erro ao carregar estatísticas do fluxo");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  // Filtrar fluxos baseado na pesquisa
  const getFilteredFlows = () => {
    if (!searchParam) return flows;
    
    return flows.filter(flow =>
      flow.name?.toLowerCase().includes(searchParam) ||
      flow.description?.toLowerCase().includes(searchParam)
    );
  };

  const filteredFlows = getFilteredFlows();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t('flowBuilder.list.importFlow'),
      icon: <CloudUploadIcon />,
      onClick: () => setImportModalOpen(true),
      variant: "outlined",
      color: "primary",
      tooltip: "Importar fluxo"
    },
    {
      label: i18n.t('flowBuilder.list.newFlow'),
      icon: <AddIcon />,
      onClick: handleCreateFlow,
      variant: "contained",
      color: "primary",
      tooltip: "Novo fluxo"
    },
    {
      label: i18n.t('flowBuilder.list.inactivityMonitor'),
      icon: <InactivityIcon />,
      onClick: handleInactivityMonitor,
      variant: "outlined",
      color: "primary",
      tooltip: "Monitor de inatividade"
    }
  ];

  return (
    <>
      <StandardPageLayout
        title={i18n.t('flowBuilder.list.title')}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder="Pesquisar fluxos..."
        showSearch={true}
        loading={loading}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredFlows.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
            <ContentCopyIcon sx={{
              fontSize: '4rem',
              color: 'text.secondary',
              marginBottom: 2,
              opacity: 0.7
            }} />
            <Typography variant="h6" gutterBottom color="textSecondary">
              {searchParam ? "Nenhum fluxo encontrado" : i18n.t('flowBuilder.list.noFlows')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {searchParam ? "Tente ajustar sua pesquisa" : i18n.t('flowBuilder.list.createFirst')}
            </Typography>
            {!searchParam && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateFlow}
              >
                {i18n.t('flowBuilder.list.newFlow')}
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
            <Table stickyHeader size={isMobile ? "small" : "medium"}>
              <TableHead sx={{
                backgroundColor: 'background.default',
                '& .MuiTableCell-head': {
                  fontWeight: 'bold',
                  color: 'text.secondary',
                }
              }}>
                <TableRow>
                  <TableCell>{i18n.t('flowBuilder.list.name')}</TableCell>
                  {!isMobile && <TableCell>Descrição</TableCell>}
                  <TableCell sx={{
                    width: '100px',
                    [theme.breakpoints.down('sm')]: {
                      padding: theme.spacing(1, 0),
                      width: '80px',
                    }
                  }}>
                    {i18n.t('flowBuilder.list.status')}
                  </TableCell>
                  {!isMobile && <TableCell>{i18n.t('flowBuilder.list.createdAt')}</TableCell>}
                  <TableCell sx={{
                    width: isMobile ? '120px' : '200px',
                    textAlign: 'center'
                  }}>
                    {i18n.t('flowBuilder.list.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFlows.map((flow) => (
                  <TableRow
                    key={flow.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    <TableCell>
                      <Typography noWrap variant={isMobile ? "body2" : "body1"}>
                        {flow.name}
                      </Typography>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {flow.description || '-'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell sx={{
                      [theme.breakpoints.down('sm')]: {
                        padding: theme.spacing(1, 0),
                      }
                    }}>
                      <Switch
                        size="small"
                        checked={flow.active}
                        onChange={() => handleToggleActive(flow.id, flow.active)}
                        color="primary"
                      />
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        {new Date(flow.createdAt).toLocaleDateString()}
                      </TableCell>
                    )}
                    <TableCell>
                      <Box sx={{
                        display: 'flex',
                        gap: theme.spacing(0.5),
                        justifyContent: 'center'
                      }}>
                        {/* Estatísticas do fluxo */}
                        <Tooltip title={i18n.t('flowBuilder.list.viewStats') || "Estatísticas"} arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleShowStats(flow.id)}
                            color="primary"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Editar dados do fluxo */}
                        <Tooltip title="Editar nome e descrição" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditFlow(flow)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Editar o fluxo (ir para o editor) */}
                        <Tooltip title="Editar fluxo" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenFlow(flow.id)}
                            color="primary"
                          >
                            <DesignServicesIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Prévia */}
                        {flow.active && (
                          <Tooltip title={i18n.t('flowBuilder.preview.title') || "Prévia"} arrow>
                            <IconButton
                              size="small"
                              onClick={() => handlePreviewFlow(flow.id)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {!isMobile && (
                          <Tooltip title={i18n.t('flowBuilder.list.duplicate')} arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDuplicateFlow(flow.id)}
                              color="primary"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title={i18n.t('flowBuilder.list.delete')} arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleConfirmDelete(flow)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StandardPageLayout>

      <ConfirmationModal
        title={i18n.t('flowBuilder.list.confirmDelete')}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteFlow(selectedFlow?.id)}
      >
        {i18n.t('flowBuilder.list.confirmDeleteMessage', { name: selectedFlow?.name })}
      </ConfirmationModal>

      {/* Modal para criar fluxo */}
      <CreateFlowModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateFlowSubmit}
      />

      {/* Modal para editar nome e descrição do fluxo */}
      <EditFlowModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditFlowSubmit}
        flow={selectedFlow}
      />

      {/* Modal de importação de fluxo */}
      <Dialog
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportFile(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle>
          {i18n.t('flowBuilder.import.title')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" gutterBottom>
              {i18n.t('flowBuilder.import.instruction')}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mt: 2,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                bgcolor: 'background.default',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.03)
                }
              }}
              component="label"
            >
              <input
                type="file"
                accept=".json"
                hidden
                onChange={(e) => setImportFile(e.target.files[0])}
              />
              {importFile ? (
                <Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">{importFile.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
                  <Typography>{i18n.t('flowBuilder.import.dropFile')}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {i18n.t('flowBuilder.import.fileFormat')}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => {
            setImportModalOpen(false);
            setImportFile(null);
          }} color="inherit">
            {i18n.t('cancel')}
          </Button>
          <Button
            onClick={handleImportFlow}
            color="primary"
            variant="contained"
            disabled={!importFile || importLoading}
            startIcon={importLoading ? <CircularProgress size={20} /> : null}
          >
            {importLoading ? i18n.t('flowBuilder.importing') : i18n.t('flowBuilder.import.action')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de prévia do fluxo */}
      <FlowPreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        nodes={previewNodes}
        edges={previewEdges}
      />

      {/* Modal de estatísticas do fluxo */}
      <StatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        flow={statsFlowData.flow}
        nodes={statsFlowData.nodes}
        edges={statsFlowData.edges}
      />
    </>
  );
};

const CreateFlowModal = ({ open, onClose, onSubmit }) => {
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  
  // Limpar campos ao fechar o modal
  useEffect(() => {
    if (!open) {
      setFlowName('');
      setFlowDescription('');
    }
  }, [open]);
  
  const handleSubmit = () => {
    if (!flowName) {
      toast.error(i18n.t('flowBuilder.validation.nameRequired'));
      return;
    }
    setLoading(true);

    // Enviar dados do fluxo com flag para inicialização no backend
    onSubmit({
      name: flowName,
      description: flowDescription
    });
  };
  
  const handleClose = () => {
    setFlowName('');
    setFlowDescription('');
    onClose();
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, display: 'flex', alignItems: 'center' }}>
        {i18n.t('flowBuilder.createNew')}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          label={i18n.t('flowBuilder.form.name')}
          fullWidth
          variant="outlined"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label={i18n.t('flowBuilder.form.description')}
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={flowDescription}
          onChange={(e) => setFlowDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="inherit">
          {i18n.t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !flowName.trim()}
          disableElevation
        >
          {loading ? <CircularProgress size={24} /> : i18n.t('flowBuilder.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditFlowModal = ({ open, onClose, onSubmit, flow }) => {
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  
  // Atualizar campos quando o modal abrir ou o fluxo mudar
  useEffect(() => {
    if (open && flow) {
      setFlowName(flow.name || '');
      setFlowDescription(flow.description || '');
    }
  }, [open, flow]);
  
  const handleSubmit = () => {
    if (!flowName) {
      toast.error(i18n.t('flowBuilder.validation.nameRequired') || 'Nome é obrigatório');
      return;
    }
    setLoading(true);

    onSubmit({
      name: flowName,
      description: flowDescription
    });
  };
  
  const handleClose = () => {
    onClose();
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        <EditIcon sx={{ mr: 1 }} fontSize="small" />
        Editar Fluxo
      </DialogTitle>
      <DialogContent sx={{ pt: 3, mb: 3, mt: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          label={i18n.t('flowBuilder.form.name')}
          fullWidth
          variant="outlined"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label={i18n.t('flowBuilder.form.description')}
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={flowDescription}
          onChange={(e) => setFlowDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="inherit">
          {i18n.t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !flowName.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disableElevation
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderList;