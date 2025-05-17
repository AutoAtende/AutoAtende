// Announcements.jsx (refatorado)
import React, { useState, useEffect, useReducer, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import DOMPurify from 'dompurify';
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useHistory } from "react-router-dom";

// Import components
import BasePage from "../../components/BasePage";
import BasePageHeader from "../../components/BasePageHeader";
import BasePageContent from "../../components/BasePageContent";
import BasePageFooter from "../../components/BasePageFooter";
import BaseButton from "../../components/BaseButton";
import BaseModal from "../../components/BaseModal";
import AnnouncementDialog from "./components/AnnouncementDialog";
import AnnouncementModal from "./components/AnnouncementModal";
import AnnouncementCardView from "./components/AnnouncementCardView";
import AnnouncementTableView from "./components/AnnouncementTableView";

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
  const [viewMode, setViewMode] = useState("card");
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination states
  const [page, setPage] = useState(0); // Ajustado para iniciar em 0 conforme componente BasePagination
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

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
          page: page + 1, // Ajuste para a API que pode esperar página começando em 1
          perPage,
        },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / perPage));
    } catch (err) {
      toast.error(i18n.t("announcements.errors.fetch"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value);
    setPage(0); // Reset para a primeira página ao fazer nova busca
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleOpenModal = (announcement = null) => {
    setSelectedAnnouncement(announcement);
    setModalOpen(true);
  };

  const handleDeleteAnnouncement = async () => {
    try {
      await api.delete(`/announcements/${selectedAnnouncement.id}`);
      // Socket tratará da atualização
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

  // Ações para o Header
  const headerActions = [
    {
      label: i18n.t("announcements.buttons.add"),
      onClick: () => handleOpenModal(),
      icon: <EditIcon />,
      variant: "contained",
      color: "primary"
    }
  ];

  // Renderização condicional para o estado vazio
  const renderEmptyState = () => {
    return {
      icon: <SearchIcon fontSize="large" />,
      title: i18n.t("announcements.emptyState.title"),
      message: i18n.t("announcements.emptyState.message"),
      buttonText: i18n.t("announcements.buttons.add"),
      onAction: () => handleOpenModal(),
      showButton: true
    };
  };

  // Ações para o modal de confirmação de exclusão
  const confirmDeleteActions = [
    {
      label: i18n.t("announcements.buttons.cancel"),
      onClick: () => {
        setConfirmModalOpen(false);
        setSelectedAnnouncement(null);
      },
      variant: "outlined",
      color: "primary"
    },
    {
      label: i18n.t("announcements.buttons.confirm"),
      onClick: handleDeleteAnnouncement,
      variant: "contained",
      color: "primary"
    }
  ];

  return (
    <BasePage
      title={`${i18n.t("announcements.title")} (${totalCount})`}
      headerContent={
        <BasePageHeader
          showSearch={true}
          searchValue={searchParam}
          searchPlaceholder={i18n.t("announcements.searchPlaceholder")}
          onSearch={handleSearch}
          actions={headerActions}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="list" aria-label="list view">
                <Tooltip title={i18n.t("announcements.tooltips.listView")}>
                  <ViewListIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="card" aria-label="card view">
                <Tooltip title={i18n.t("announcements.tooltips.cardView")}>
                  <ViewModuleIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </BasePageHeader>
      }
    >
      <BasePageContent
        loading={loading}
        empty={!loading && announcements.length === 0}
        emptyProps={renderEmptyState()}
      >
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          {viewMode === "card" ? (
            <AnnouncementCardView
              announcements={announcements}
              onEdit={handleOpenModal}
              onDelete={(announcement) => {
                setSelectedAnnouncement(announcement);
                setConfirmModalOpen(true);
              }}
              handleShowAnnouncementDialog={handleShowAnnouncement}
            />
          ) : (
            <AnnouncementTableView
              announcements={announcements}
              onEdit={handleOpenModal}
              onDelete={(announcement) => {
                setSelectedAnnouncement(announcement);
                setConfirmModalOpen(true);
              }}
              onView={handleShowAnnouncement}
            />
          )}
        </Box>
      </BasePageContent>

      <BasePageFooter
        count={totalCount}
        page={page}
        rowsPerPage={perPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        showPagination={true}
      />

      {/* Modal para criação/edição de anúncios */}
      <AnnouncementModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcementId={selectedAnnouncement?.id}
        reload={fetchAnnouncements}
      />

      {/* Modal de confirmação de exclusão */}
      <BaseModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        title={i18n.t("announcements.confirmationModal.deleteTitle")}
        actions={confirmDeleteActions}
      >
        <Typography>
          {i18n.t("announcements.confirmationModal.deleteMessage")}
        </Typography>
      </BaseModal>

      {/* Modal para visualização completa do anúncio */}
      <AnnouncementDialog
        announcement={viewingAnnouncement}
        open={showAnnouncementDialog}
        handleClose={() => {
          setShowAnnouncementDialog(false);
          setViewingAnnouncement(null);
        }}
      />
    </BasePage>
  );
};

export default Announcements;