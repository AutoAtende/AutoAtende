import React, { useState, useEffect, useReducer, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TablePagination
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Announcement as AnnouncementIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Person as PersonIcon
} from "@mui/icons-material";
import DOMPurify from 'dompurify';
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useHistory } from "react-router-dom";

// Componentes
import StandardPageLayout from "../../components/StandardPageLayout";
import AnnouncementDialog from "./components/AnnouncementDialog";
import AnnouncementModal from "./components/AnnouncementModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const announcementsReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_ANNOUNCEMENTS":
      const announcements = action.payload;
      const newAnnouncements = [];

      if (Array.isArray(announcements)) {
        announcements.forEach((announcement) => {
          const announcementIndex = state.findIndex(
            (u) => u?.id === announcement.id
          );
          if (announcementIndex !== -1) {
            state[announcementIndex] = announcement;
          } else {
            newAnnouncements.push(announcement);
          }
        });
      }

      return [...state, ...newAnnouncements];

    case "UPDATE_ANNOUNCEMENTS":
      const announcement = action.payload;
      const announcementIndex = state.findIndex((u) => u?.id === announcement.id);

      if (announcementIndex !== -1) {
        state[announcementIndex] = announcement;
        return [...state];
      } else {
        return [announcement, ...state];
      }

    case "DELETE_ANNOUNCEMENT":
      const announcementId = action.payload;
      return state.filter(item => item.id !== announcementId);

    case "RESET":
      return [];

    default:
      return state;
  }
};

const Announcements = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  // States
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [announcements, dispatch] = useReducer(announcementsReducer, []);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    if (!user.super) {
      toast.error(i18n.t("announcements.errors.permission"));
      history.push("/");
    }
  }, [user.super, history]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const handleAnnouncementUpdate = (data) => {
      switch (data.action) {
        case "create":
          dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
          setTotalCount(prev => prev + 1);
          toast.success(i18n.t("announcements.toasts.created"));
          break;
        case "update":
          dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
          toast.success(i18n.t("announcements.toasts.updated"));
          break;
        case "delete":
          dispatch({ type: "DELETE_ANNOUNCEMENT", payload: data.id });
          setTotalCount(prev => prev - 1);
          toast.success(i18n.t("announcements.toasts.deleted"));
          break;
        default:
          break;
      }
    };

    socket.on("company-announcement", handleAnnouncementUpdate);
    
    return () => {
      socket.off("company-announcement", handleAnnouncementUpdate);
    };
  }, [socketManager]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, page, perPage]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/announcements", {
        params: {
          searchParam,
          page: page + 1,
          perPage,
        },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setTotalCount(data.count);
    } catch (err) {
      toast.error(i18n.t("announcements.errors.fetch"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value);
    setPage(0);
  };

  const handleOpenModal = (announcement = null) => {
    setSelectedAnnouncement(announcement);
    setModalOpen(true);
  };

  const handleDeleteAnnouncement = async () => {
    try {
      await api.delete(`/announcements/${selectedAnnouncement.id}`);
      setConfirmModalOpen(false);
      setSelectedAnnouncement(null);
    } catch (err) {
      toast.error(i18n.t("announcements.errors.delete"));
    }
  };

  const handleShowAnnouncement = (announcement) => {
    setViewingAnnouncement(announcement);
    setShowAnnouncementDialog(true);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleRowsPerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrar anúncios baseado na aba ativa
  const getFilteredAnnouncements = () => {
    switch (activeTab) {
      case 1: // Ativos
        return announcements.filter(announcement => announcement.status === 'active');
      case 2: // Inativos
        return announcements.filter(announcement => announcement.status === 'inactive');
      case 3: // Públicos
        return announcements.filter(announcement => announcement.mediaType === 'public');
      default: // Todos
        return announcements;
    }
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'draft':
        return 'Rascunho';
      default:
        return status;
    }
  };

  // Função para truncar texto
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    const cleanText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...' 
      : cleanText;
  };

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("announcements.buttons.add"),
      icon: <AddIcon />,
      onClick: () => handleOpenModal(),
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar novo anúncio"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todos (${announcements.length})`,
      icon: <AnnouncementIcon />
    },
    {
      label: `Ativos (${announcements.filter(a => a.status === 'active').length})`,
      icon: <PublicIcon />
    },
    {
      label: `Inativos (${announcements.filter(a => a.status === 'inactive').length})`,
      icon: <GroupIcon />
    },
    {
      label: `Públicos (${announcements.filter(a => a.mediaType === 'public').length})`,
      icon: <PersonIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Renderizar conteúdo da tabela
  const renderContent = () => {
    if (filteredAnnouncements.length === 0 && !loading) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          sx={{ height: '100%', p: 4 }}
        >
          <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {activeTab === 0 
              ? "Nenhum anúncio encontrado" 
              : activeTab === 1 
                ? "Nenhum anúncio ativo"
                : activeTab === 2
                  ? "Nenhum anúncio inativo"
                  : "Nenhum anúncio público"
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {searchParam 
              ? "Tente usar outros termos na busca"
              : activeTab === 0
                ? "Comece criando seu primeiro anúncio"
                : "Não há anúncios nesta categoria"
            }
          </Typography>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              Criar Anúncio
            </Button>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Conteúdo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id} hover>
                  <TableCell>{announcement.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {announcement.title || 'Sem título'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {truncateText(announcement.text, 80)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(announcement.status)}
                      color={getStatusColor(announcement.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {announcement.mediaType || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {announcement.createdAt 
                        ? new Date(announcement.createdAt).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleShowAnnouncement(announcement)}
                          color="info"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(announcement)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
                            setConfirmModalOpen(true);
                          }}
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

        {/* Paginação */}
        {totalCount > 0 && (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={perPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <StandardPageLayout
        title={i18n.t("announcements.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("announcements.searchPlaceholder")}
        showSearch={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading}
      >
        {renderContent()}
      </StandardPageLayout>

      {/* Modais */}
      <AnnouncementModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcementId={selectedAnnouncement?.id}
        reload={fetchAnnouncements}
      />

      <ConfirmationModal
        title={i18n.t("announcements.confirmationModal.deleteTitle")}
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        onConfirm={handleDeleteAnnouncement}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <AnnouncementDialog
        announcement={viewingAnnouncement}
        open={showAnnouncementDialog}
        handleClose={() => {
          setShowAnnouncementDialog(false);
          setViewingAnnouncement(null);
        }}
      />
    </>
  );
};

export default Announcements;