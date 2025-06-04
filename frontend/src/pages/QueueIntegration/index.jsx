import React, { useState, useEffect, useReducer, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tooltip, 
  Box, 
  Typography, 
  Chip, 
  Fade,
  CircularProgress
} from "@mui/material";
import {
  DeleteOutline,
  Edit,
  Add as AddIcon,
  FilterList as FilterListIcon,
  SettingsInputComponent as IntegrationIcon,
  Link as LinkIcon,
  Code as CodeIcon
} from "@mui/icons-material";
import { useSpring, animated } from "react-spring";

// Componentes
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom";
import { SocketContext } from "../../context/Socket/SocketContext";
import { toast } from "../../helpers/toast";

// Componente animado para transições
const AnimatedBox = animated(Box);

// Reducer para gerenciar as integrações
const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];

    queueIntegration.forEach((integration) => {
      const integrationIndex = state.findIndex((u) => u.id === integration.id);
      if (integrationIndex !== -1) {
        state[integrationIndex] = integration;
      } else {
        newIntegrations.push(integration);
      }
    });

    return [...state, ...newIntegrations];
  }

  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const integrationIndex = state.findIndex((u) => u.id === queueIntegration.id);

    if (integrationIndex !== -1) {
      state[integrationIndex] = queueIntegration;
      return [...state];
    } else {
      return [queueIntegration, ...state];
    }
  }

  if (action.type === "DELETE_INTEGRATION") {
    const integrationId = action.payload;
    return state.filter(item => item.id !== integrationId);
  }

  if (action.type === "RESET") {
    return [];
  }
};

// Mapeamento de cores para os tipos de integração
const integrationColors = {
  dialogflow: "#4285F4", // Azul do Google
  n8n: "#FF6600", // Laranja da n8n
  webhook: "#6B7280", // Cinza para webhooks
  typebot: "#9B30FF", // Roxo para typebot
  openAI: "#10A37F", // Verde para OpenAI
  assistant: "#2196F3", // Azul para assistentes
  flowbuilder: "#FF9800" // Laranja para flowbuilder
};

const QueueIntegration = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [queueIntegration, dispatch] = useReducer(reducer, []);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const companyId = user.companyId;
  const history = useHistory();

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  const messageToUserIntegrationWebhook = 'Integração definida via parâmetros pelo usuário administrador. Não é possível editar por aqui.';

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useIntegrations) {
        toast.error(i18n.t("queueIntegration.toasts.errorPermition"));
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchIntegrations = async () => {
        try {
          const { data } = await api.get("/queueIntegration/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching integrations:", err);
          toast.error(err.response?.data?.error || "Erro ao carregar integrações");
          setLoading(false);
        }
      };
      fetchIntegrations();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const socketManager = useContext(SocketContext);
  const socket = socketManager.GetSocket(companyId);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");

    socket.on(`company-${companyId}-queueIntegration`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
      }
    });

    return () => {
      socket.off(`company-${companyId}-queueIntegration`);
    };
  }, []);

  const handleOpenUserModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditIntegration = (queueIntegration) => {
    if (!!queueIntegration?.generatedViaParameters) {
      toast.error(messageToUserIntegrationWebhook);
      return;
    }
    setSelectedIntegration(queueIntegration);
    setUserModalOpen(true);
  };

  const handleDeleteIntegration = async (integrationId) => {
    setActionInProgress(true);
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
      dispatch({ type: "DELETE_INTEGRATION", payload: integrationId });
    } catch (err) {
      console.error("Error deleting integration:", err);
      toast.error(err.response?.data?.error || "Erro ao excluir integração");
    } finally {
      setDeletingUser(null);
      setActionInProgress(false);
      setConfirmModalOpen(false);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  // Filtrar integrações baseado na aba ativa
  const getFilteredIntegrations = () => {
    switch (activeTab) {
      case 1: // Webhooks
        return queueIntegration.filter(integration => integration.type === 'webhook');
      case 2: // APIs
        return queueIntegration.filter(integration => 
          ['dialogflow', 'n8n', 'openAI', 'assistant'].includes(integration.type)
        );
      case 3: // Bots
        return queueIntegration.filter(integration => 
          ['typebot', 'flowbuilder'].includes(integration.type)
        );
      default: // Todas
        return queueIntegration;
    }
  };

  const filteredIntegrations = getFilteredIntegrations();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("queueIntegration.buttons.add"),
      icon: <AddIcon />,
      onClick: handleOpenUserModal,
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar nova integração"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todas (${queueIntegration.length})`,
      icon: <IntegrationIcon />
    },
    {
      label: `Webhooks (${queueIntegration.filter(i => i.type === 'webhook').length})`,
      icon: <LinkIcon />
    },
    {
      label: `APIs (${queueIntegration.filter(i => ['dialogflow', 'n8n', 'openAI', 'assistant'].includes(i.type)).length})`,
      icon: <CodeIcon />
    },
    {
      label: `Bots (${queueIntegration.filter(i => ['typebot', 'flowbuilder'].includes(i.type)).length})`,
      icon: <FilterListIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const IntegrationItem = ({ integration }) => (
    <TableRow 
      key={integration.id}
      hover
      sx={{
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: `${theme.palette.primary.lighter} !important`
        }
      }}
    >
      <TableCell>
        <Chip
          label={integration.type}
          sx={{
            backgroundColor: integrationColors[integration.type] || theme.palette.primary.main,
            color: '#fff',
            fontWeight: 'medium',
            minWidth: 120,
            textTransform: 'capitalize'
          }}
        />
      </TableCell>
      <TableCell align="center">{integration.id}</TableCell>
      <TableCell align="center">{integration.name}</TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Tooltip title={!!integration?.generatedViaParameters ? messageToUserIntegrationWebhook : i18n.t("queueIntegration.buttons.edit")}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Edit />}
              onClick={() => handleEditIntegration(integration)}
              disabled={!!integration?.generatedViaParameters}
              sx={{ 
                borderRadius: 8,
                textTransform: 'none'
              }}
            >
              {i18n.t("queueIntegration.buttons.edit")}
            </Button>
          </Tooltip>

          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteOutline />}
            disabled={!!integration?.generatedViaParameters || actionInProgress}
            onClick={() => {
              setConfirmModalOpen(true);
              setDeletingUser(integration);
            }}
            sx={{ 
              borderRadius: 8,
              textTransform: 'none'
            }}
          >
            {i18n.t("queueIntegration.buttons.delete")}
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );

  // Renderizar conteúdo da página
  const renderContent = () => {
    if (loading && queueIntegration.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (filteredIntegrations.length === 0) {
      return (
        <Fade in timeout={500}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing(6),
            textAlign: 'center',
            height: '60vh'
          }}>
            <FilterListIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.7, mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {activeTab === 0 
                ? (i18n.t("queueIntegration.noIntegrationsFound") || "Nenhuma integração encontrada")
                : activeTab === 1
                  ? "Nenhum webhook encontrado"
                  : activeTab === 2
                    ? "Nenhuma API encontrada"
                    : "Nenhum bot encontrado"
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
              {searchParam 
                ? (i18n.t("queueIntegration.tryAnotherSearch") || "Tente usar outros termos na busca")
                : activeTab === 0
                  ? (i18n.t("queueIntegration.addYourFirstIntegration") || "Adicione sua primeira integração")
                  : "Não há integrações deste tipo cadastradas"
              }
            </Typography>
            {activeTab === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenUserModal}
                sx={{ 
                  borderRadius: 30,
                  padding: theme.spacing(1.5, 4),
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: theme.shadows[3]
                }}
              >
                {i18n.t("queueIntegration.buttons.add")}
              </Button>
            )}
          </Box>
        </Fade>
      );
    }

    return (
      <AnimatedBox style={fadeIn}>
        <TableContainer 
          sx={{ height: '100%', overflow: 'auto' }}
          onScroll={handleScroll}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {i18n.t("queueIntegration.table.type") || "Tipo"}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {i18n.t("queueIntegration.table.id") || "ID"}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {i18n.t("queueIntegration.table.name") || "Nome"}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {i18n.t("queueIntegration.table.actions") || "Ações"}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIntegrations.map((integration) => (
                <IntegrationItem 
                  key={integration.id} 
                  integration={integration} 
                />
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </TableBody>
          </Table>
        </TableContainer>
      </AnimatedBox>
    );
  };

  return (
    <>
      <StandardPageLayout
        title={i18n.t("queueIntegration.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("queueIntegration.searchPlaceholder")}
        showSearch={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading && queueIntegration.length === 0}
      >
        {renderContent()}
      </StandardPageLayout>

      {/* Modais */}
      {confirmModalOpen && (
        <ConfirmationModal
          title={
            deletingUser &&
            `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingUser.name}?`
          }
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteIntegration(deletingUser.id)}
          loading={actionInProgress}
        >
          {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
        </ConfirmationModal>
      )}
      
      {userModalOpen && (
        <IntegrationModal
          open={userModalOpen}
          onClose={handleCloseIntegrationModal}
          aria-labelledby="form-dialog-title"
          integrationId={selectedIntegration && selectedIntegration.id}
        />
      )}
    </>
  );
};

export default QueueIntegration;