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

import BasePage from "../../components/BasePage";
import BasePageHeader from "../../components/BasePageHeader";
import BasePageContent from "../../components/BasePageContent";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import BaseButton from "../../components/BaseButton";
import BaseResponsiveTabs from "../../components/BaseResponsiveTabs";

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
            <BaseButton
              variant="outlined"
              size="small"
              startIcon={<AttachFileIcon />}
              onClick={() =>
                showFile(quickmessage.mediaPath)
              }
            >
              Ver arquivo
            </BaseButton>
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
  const QuickMessagesTable = ({ messages, showLoading, editMessage, deleteMessage, readOnly }) => {
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

  // Renderizar conteúdo da tab de todas as mensagens
  const renderAllMessages = () => (
    <>
      {viewMode === "grid" ? (
        <QuickMessagesTable
          messages={quickmessages}
          showLoading={loading}
          editMessage={handleEditQuickmessage}
          deleteMessage={(message) => {
            setDeletingQuickmessage(message);
            setConfirmModalOpen(true);
          }}
          readOnly={false}
        />
      ) : (
        <TableContainer>
          <Table>
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
                <TableRow key={quickmessage.id}>
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
      )}
    </>
  );

  // Renderizar conteúdo da tab de minhas mensagens
  const renderMyMessages = () => (
    <>
      {viewMode === "grid" ? (
        <QuickMessagesTable
          messages={quickmessages}
          showLoading={loading}
          editMessage={handleEditQuickmessage}
          deleteMessage={(message) => {
            setDeletingQuickmessage(message);
            setConfirmModalOpen(true);
          }}
          readOnly={false}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Mensagem</TableCell>
                <TableCell>Mídia</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quickmessages.map((quickmessage) => (
                <TableRow key={quickmessage.id}>
                  <TableCell>{quickmessage.id}</TableCell>
                  <TableCell>{formatTextWithLimit(quickmessage.shortcode, 20)}</TableCell>
                  <TableCell>{formatTextWithLimit(quickmessage.message, 33)}</TableCell>
                  <TableCell>
                    {quickmessage.mediaPath && (
                      quickmessage.mediaType === "file" ? "Arquivo" : "Áudio"
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
      )}
    </>
  );

  const tabs = [
    {
      label: "Todas",
      icon: <MessageSquarePlus size={20} />,
      content: <BasePageContent
        loading={loading && quickmessages.length === 0}
        empty={!loading && quickmessages.length === 0}
        emptyProps={{
          title: "Nenhuma resposta rápida encontrada",
          message: "Crie uma nova resposta rápida para facilitar seu atendimento",
          buttonText: "Nova Resposta Rápida",
          onAction: handleOpenQuickMessageDialog,
          icon: <MessageSquarePlus size={40} />
        }}
      >
        <Box sx={{ height: '100%', overflow: 'auto' }} onScroll={handleScroll}>
          {renderAllMessages()}
        </Box>
      </BasePageContent>
    },
    {
      label: "Minhas",
      icon: <MessageSquarePlus size={20} />,
      content: <BasePageContent
        loading={loading && quickmessages.length === 0}
        empty={!loading && quickmessages.length === 0}
        emptyProps={{
          title: "Nenhuma resposta rápida encontrada",
          message: "Crie uma nova resposta rápida para facilitar seu atendimento",
          buttonText: "Nova Resposta Rápida",
          onAction: handleOpenQuickMessageDialog,
          icon: <MessageSquarePlus size={40} />
        }}
      >
        <Box sx={{ height: '100%', overflow: 'auto' }} onScroll={handleScroll}>
          {renderMyMessages()}
        </Box>
      </BasePageContent>
    }
  ];

  return (
    <BasePage
      title={i18n.t("quickMessages.title")}
      headerContent={
        <BasePageHeader
          onSearch={(e) => setSearchParam(e.target.value.toLowerCase())}
          searchValue={searchParam}
          searchPlaceholder={i18n.t("quickMessages.searchPlaceholder")}
          actions={[
            {
              icon: <MessageSquarePlus size={20} />,
              label: "Nova",
              onClick: handleOpenQuickMessageDialog,
              variant: "contained"
            }
          ]}
        >
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
        </BasePageHeader>
      }
    >
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
      
      {/* Conteúdo com abas */}
      <BaseResponsiveTabs
        tabs={tabs}
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        showTabsOnMobile={true}
        fabIcon={<MessageSquarePlus />}
        onFabClick={handleOpenQuickMessageDialog}
      />
    </BasePage>
  );
};

export default QuickMessages;