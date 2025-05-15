// Announcements.jsx (continued)
import React, { useState, useEffect, useReducer, useContext } from "react";
import { useStyles } from './styles';
import {
  Container,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Fade,
  Chip,
  Tooltip,
  CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import DOMPurify from 'dompurify';
import { useTheme } from "@mui/material/styles";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useHistory } from "react-router-dom";

// Import components
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import AnnouncementModal from "../../components/AnnouncementModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import PaginationComponent from "../../components/PaginationComponent";
import AnnouncementCardView from "../../components/AnnouncementCardView";
import AnnouncementTableView from "../../components/AnnouncementTableView";
import AnnouncementDialog from "../../components/AnnouncementDialog";

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
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  // States
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [announcements, dispatch] = useReducer(announcementsReducer, []); // Now using the defined reducer
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination states
  const [page, setPage] = useState(1);
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
          page,
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
    setPage(1); // Reset to first page on new search
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
      // Socket will handle the update
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

  const renderTopBar = () => (
    <Box className={classes.searchContainer}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={i18n.t("announcements.searchPlaceholder")}
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box className={classes.actionsContainer}>
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
            <Tooltip title={i18n.t("announcements.tooltips.addNew")}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenModal()}
                startIcon={<EditIcon />}
              >
                {i18n.t("announcements.buttons.add")}
              </Button>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          {i18n.t("announcements.title")} ({totalCount})
        </Title>
      </MainHeader>

      <Paper className={classes.mainContainer}>
        {renderTopBar()}

        <Fade in={!loading}>
          <Box className={classes.contentContainer}>
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
        </Fade>

        {loading && (
          <Box display="flex" justifyContent="center" padding={4}>
            <CircularProgress />
          </Box>
        )}

        <Box className={classes.paginationContainer}>
          <PaginationComponent
            count={totalPages}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </Box>
      </Paper>

      <AnnouncementModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcementId={selectedAnnouncement?.id}
        reload={fetchAnnouncements}
      />

      <AnnouncementDialog
        announcement={viewingAnnouncement}
        open={showAnnouncementDialog}
        handleClose={() => {
          setShowAnnouncementDialog(false);
          setViewingAnnouncement(null);
        }}
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
    </MainContainer>
  );
};

export default Announcements;