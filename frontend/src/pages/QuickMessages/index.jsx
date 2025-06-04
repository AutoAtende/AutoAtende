import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
} from "react";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  CircularProgress
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  GridView,
  ViewList,
} from "@mui/icons-material";
import { MessageSquarePlus } from 'lucide-react';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import CustomAudioPlayer from "../../components/Audio/CustomAudioPlayer";
import formatTextWithLimit from "../../helpers/formatTextWithLimit";
import { getProfileType } from "../../helpers/getProfileType";

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";

// Estilos
const Text = styled(Typography)(({ theme }) => ({
  fontSize: "11px",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
}));

const ActionsButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
}));

const ViewModeSelector = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "auto",
  minHeight: 180,
  display: "flex",
  flexDirection: "column",
  transition: "all 0.2s ease-in-out",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[3],
  },
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
}));

const CardActionsStyled = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'light' 
    ? theme.palette.grey[50] 
    : theme.palette.grey[900],
  justifyContent: 'flex-end',
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));

const CardMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const MediaInfo = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const GlobalBadge = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  color: theme.palette.success.main,
}));

// Reducer para gerenciar os dados de quickmessages
const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (Array.isArray(quickmessages)) {
      quickmessages.forEach((quickmessage) => {
        const quickmessageIndex = state.findIndex(
          (u) => u.id === quickmessage.id
        );
        if (quickmessageIndex !== -1) {
          state[quickmessageIndex] = quickmessage;
        } else {
          newQuickmessages.push(quickmessage);
        }
      });
    }

    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickmessage = action.payload;
    const quickmessageIndex = state.findIndex((u) => u.id === quickmessage.id);

    if (quickmessageIndex !== -1) {
      state[quickmessageIndex] = quickmessage;
      return [...state];
    } else {
      return [quickmessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickmessageId = action.payload;

    const quickmessageIndex = state.findIndex((u) => u.id === quickmessageId);
    if (quickmessageIndex !== -1) {
      state.splice(quickmessageIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const QuickMessages = () => {
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickmessage, setSelectedQuickmessage] = useState(null);
  const [deletingQuickmessage, setDeletingQuickmessage] = useState(null);
  const [quickmessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickmessages, dispatch] = useReducer(reducer, []);
  const [viewMode, setViewMode] = useState("grid");
  const [makeRequest, setMakeRequest] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const socketManager = useContext(SocketContext);

  // Resetar dados ao mudar filtro
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, tabValue]);

  // Carregar mensagens com debounce
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickmessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, makeRequest, tabValue]);

  // Função para buscar mensagens rápidas da API
  const fetchQuickmessages = async () => {
    try {
      const { data } = await api.get("/quick-messages", {
        params: { 
          searchParam, 
          pageNumber,
          userId: tabValue === 1 ? user.id : undefined // Somente minhas
        },
      });
      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };

  // Monitorar eventos do socket
  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketManager.GetSocket(companyId, user.id);

    socket.on(`company-${companyId}-quickmessage`, (data) => {
      if (
        data.action === "update" ||
        data.action === "create" ||
        data.action === "create_media" ||
        data.action === "update_media" ||
        data.action === "delete_media"
      ) {
        fetchQuickmessages();
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
      }
    });
    
    return () => {
      socket.off(`company-${companyId}-quickmessage`);
    };
  }, [socketManager, user, tabValue]);

  // Abrir diálogo para nova mensagem rápida
  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickmessage(null);
    setQuickMessageDialogOpen(true);
  };

  // Fechar diálogo
  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickmessage(null);
    setQuickMessageDialogOpen(false);
  };

  // Editar mensagem rápida existente
  const handleEditQuickmessage = (quickmessage) => {
    setSelectedQuickmessage(quickmessage);
    setQuickMessageDialogOpen(true);
  };

  // Excluir mensagem rápida
  const handleDeleteQuickmessage = async (quickmessage) => {
    try {
      setLoading(true);
      if (quickmessage.mediaPath){
        await api.delete(`/quick-messages/${quickmessage.id}/media-upload`);
      }
      await api.delete(`/quick-messages/${quickmessage.id}`);
      toast.success(i18n.t("quickMessages.toasts.deleted"));
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
      setDeletingQuickmessage(null);
      setConfirmModalOpen(false);
      setSearchParam("");
      setPageNumber(1);
      dispatch({ type: "RESET" });
      fetchQuickmessages();
    }
  };

  // Carregar mais mensagens
  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  // Detectar rolagem para carregar mais itens
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  // Abrir arquivo de mídia
  const showFile = (mediaPath) => {
    if (mediaPath) {
      window.open(mediaPath.replace(":443", ""), "_blank");
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  // Renderizar ações para cada mensagem rápida
  const renderActions = (quickmessage) => {
    return (
      <ActionsButtons>
        {quickmessage.mediaType === "audio" && (
          <Tooltip title={i18n.t("quickMessages.buttons.playAudio")}>
            <CustomAudioPlayer
              src={quickmessage.mediaPath?.replace(":443", "")}
            />
          </Tooltip>
        )}
        {quickmessage.mediaType === "file" && (
          <Tooltip title={i18n.t("quickMessages.buttons.openFile")}>
            <IconButton
              size="small"
              onClick={() => showFile(quickmessage.mediaPath)}
            >
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
        )}
        {/* Mostrar ações de edição/exclusão baseadas no perfil ou na propriedade do item */}
        {(profile === "admin" ||
          profile === "supervisor" ||
          (user.id === quickmessage.userId)) && (
          <>
            <Tooltip title={i18n.t("quickMessages.buttons.edit")}>
              <IconButton
                size="small"
                onClick={() => handleEditQuickmessage(quickmessage)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("quickMessages.buttons.delete")}>
              <IconButton
                size="small"
                onClick={() => {
                  setConfirmModalOpen(true);
                  setDeletingQuickmessage(quickmessage);
                }}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </ActionsButtons>
    );
  };

  // Implementação do componente QuickMessagesTable dentro deste arquivo
  const QuickMessagesTable = ({ messages }) => {
    if (!messages || messages.length === 0) {
      return null;
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {messages.map((message) => (
          <StyledCard key={message.id} variant="outlined">
            <CardContentStyled>
              <CardTitle variant="h6" component="h2">
                {message.shortcode}
              </CardTitle>
              <CardMessage variant="body2" component="p">
                {message.message}
              </CardMessage>
              {message.mediaPath && (
                <MediaInfo variant="body2">
                  {i18n.t("quickMessages.table.media")}: {message.mediaName || (message.mediaType === "audio" ? "Áudio" : "Arquivo")}
                </MediaInfo>
              )}
              {message.geral && (
                <GlobalBadge>
                  <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {i18n.t("quickMessages.global")}
                </GlobalBadge>
              )}
            </CardContentStyled>
            <CardActionsStyled>
              {renderActions(message)}
            </CardActionsStyled>
          </StyledCard>
        ))}
      </Box>
    );
  };

  // Renderização condicional da visualização em lista
  const renderTableView = () => (
    <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Código</TableCell>
            <TableCell>Mensagem</TableCell>
            <TableCell>Mídia</TableCell>
            <TableCell>Última modificação</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quickmessages.map((quickmessage) => (
            <TableRow key={quickmessage.id} hover>
              <TableCell>{quickmessage.id}</TableCell>
              <TableCell>{formatTextWithLimit(quickmessage.shortcode, 20)}</TableCell>
              <TableCell>{formatTextWithLimit(quickmessage.message, 33)}</TableCell>
              <TableCell>
                {quickmessage.mediaPath && (
                  quickmessage.mediaType === "file" ? "Arquivo" : "Áudio"
                )}
              </TableCell>
              <TableCell>
                {quickmessage?.user?.name} ({getProfileType(quickmessage?.user?.profile)})
                {!quickmessage.geral && user?.profile === "user" && (
                  <Text>
                    <b>{i18n.t("quickMessages.permission")}</b>
                  </Text>
                )}
              </TableCell>
              <TableCell align="right">
                {renderActions(quickmessage)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: "Nova",
      icon: <MessageSquarePlus size={20} />,
      onClick: handleOpenQuickMessageDialog,
      variant: "contained",
      color: "primary",
      tooltip: "Nova resposta rápida"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todas (${quickmessages.length})`,
      icon: <MessageSquarePlus size={20} />
    },
    {
      label: `Minhas`,
      icon: <MessageSquarePlus size={20} />
    }
  ];

  // Filtrar mensagens baseado na pesquisa
  const getFilteredQuickMessages = () => {
    if (!searchParam) return quickmessages;
    
    return quickmessages.filter(quickmessage =>
      quickmessage.shortcode?.toLowerCase().includes(searchParam) ||
      quickmessage.message?.toLowerCase().includes(searchParam)
    );
  };

  const filteredQuickMessages = getFilteredQuickMessages();

  return (
    <>
      <StandardPageLayout
        title={i18n.t("quickMessages.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("quickMessages.searchPlaceholder")}
        showSearch={true}
        tabs={tabs}
        activeTab={tabValue}
        onTabChange={(e, newValue) => setTabValue(newValue)}
        loading={loading && quickmessages.length === 0}
      >
        {/* Seletor de modo de visualização */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <ViewModeSelector>
            <Tooltip title="Visualização em grade">
              <IconButton 
                color={viewMode === "grid" ? "primary" : "default"}
                onClick={() => setViewMode("grid")}
              >
                <GridView />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualização em lista">
              <IconButton 
                color={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </ViewModeSelector>
        </Box>

        {loading && quickmessages.length === 0 ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredQuickMessages.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
            <MessageSquarePlus size={40} />
            <Typography variant="h6" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
              {searchParam ? "Nenhuma resposta rápida encontrada" : "Nenhuma resposta rápida cadastrada"}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {searchParam ? "Tente ajustar sua pesquisa" : "Crie uma nova resposta rápida para facilitar seu atendimento"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto' }} onScroll={handleScroll}>
            {viewMode === "grid" ? (
              <QuickMessagesTable messages={filteredQuickMessages} />
            ) : (
              renderTableView()
            )}
          </Box>
        )}
      </StandardPageLayout>

      {/* Modal de confirmação para exclusão */}
      {confirmModalOpen && (
        <ConfirmationModal
          title={
            deletingQuickmessage &&
            `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${
              deletingQuickmessage.shortcode
            }?`
          }
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteQuickmessage(deletingQuickmessage)}
        >
          {i18n.t("quickMessages.confirmationModal.deleteMessage")}
        </ConfirmationModal>
      )}
      
      {/* Dialog para criar/editar mensagem rápida */}
      {quickmessageModalOpen && (
        <QuickMessageDialog
          open={quickmessageModalOpen}
          onClose={handleCloseQuickMessageDialog}
          aria-labelledby="form-dialog-title"
          quickMessageId={selectedQuickmessage && selectedQuickmessage.id}
          setMakeRequest={setMakeRequest}
        />
      )}
    </>
  );
};

export default QuickMessages;