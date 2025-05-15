import React, { useState, useCallback, useContext, useRef, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Button,
  TextField,
  Checkbox,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  TableChart as FileExcelIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ViewKanban as KanbanIcon,
  Print as PrintIcon
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import EmptyState from "../../components/EmptyState";
import BulkTagModal from "./components/BulkTagModal";
import { exportToExcel, exportToPDF, printTags } from './exportUtils';

const Tags = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [kanbanFilter, setKanbanFilter] = useState("all");
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalAction, setConfirmModalAction] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [bulkActionAnchorEl, setBulkActionAnchorEl] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const scrollRef = useRef(null);

  const fetchTags = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { data } = await api.get("/tags", {
        params: {
          searchParam,
          pageNumber: page,
          pageSize: 10,
        },
      });

      setTags((prevTags) => (page === 1 ? data.tags : [...prevTags, ...data.tags]));
      setHasMore(data.hasMore);
      setTotalCount(data.count || 0);
    } catch (err) {
      toast.error(i18n.t("tags.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [searchParam, page, loading]);

  // Efeito para carregar as tags apenas na montagem inicial do componente
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/tags", {
          params: {
            searchParam: "",
            pageNumber: 1,
            pageSize: 10,
          },
        });
        setTags(data.tags);
        setHasMore(data.hasMore);
        setTotalCount(data.count || 0);
      } catch (err) {
        toast.error(i18n.t("tags.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    };
    
    initialFetch();
    // Array de dependências vazio para garantir que só executa uma vez na montagem
  }, []);

  const handleScroll = useCallback(() => {
    if (!hasMore || loading) return;

    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollHeight - scrollTop - clientHeight < clientHeight * 0.2) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, loading]);

  const handleSearch = (value) => {
    setSearchParam(value);
    setPage(1);
    // Adicionamos um pequeno atraso para evitar requisições em excesso durante a digitação
    const timeoutId = setTimeout(() => {
      fetchTags();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleOpenTagModal = (tag = null) => {
    // Se estiver abrindo para criar uma nova tag
    if (tag === null) {
      setSelectedTag(null);
    } else {
      // Para editar, garantimos que estamos passando o objeto completo da tag
      console.log("Abrindo modal para editar tag:", tag);
      setSelectedTag(tag);
    }
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
    setPage(1);
    fetchTags();
  };

  const handleDeleteTag = async () => {
    try {
      if (confirmModalAction === "selected") {
        await api.post("/tags/bulk-delete", {
          tagIds: selectedTags,
        });
        setTags((prevTags) => prevTags.filter((tag) => !selectedTags.includes(tag.id)));
        setSelectedTags([]);
      } else {
        await api.delete(`/tags/${confirmModalAction}`);
        setTags((prevTags) => prevTags.filter((tag) => tag.id !== confirmModalAction));
      }
      toast.success(i18n.t("tags.toasts.deleted"));
      setConfirmModalOpen(false);
    } catch (err) {
      toast.error(i18n.t("tags.toasts.deleteError"));
    }
  };

  const handleUpdateKanban = async (kanbanValue, tagId = null) => {
    try {
      if (selectedTags.length > 0 && !tagId) {
        await api.post("/tags/bulk-update", {
          tagIds: selectedTags,
          kanban: kanbanValue,
        });
        
        // Atualizar as tags no estado local
        setTags(prevTags => 
          prevTags.map(tag => 
            selectedTags.includes(tag.id) 
              ? { ...tag, kanban: kanbanValue } 
              : tag
          )
        );
      } else if (tagId) {
        const tag = tags.find((t) => t.id === tagId);
        if (!tag) return;
  
        // Enviar o objeto completo da tag junto com a atualização do kanban
        const { data } = await api.put(`/tags/${tagId}`, {
          name: tag.name,
          color: tag.color,
          kanban: kanbanValue ? 1 : 0  // Converter para 1/0 conforme esperado pelo backend
        });
        
        setTags((prevTags) =>
          prevTags.map((t) => (t.id === tagId ? data : t))
        );
      }
      toast.success(i18n.t("tags.toasts.updated"));
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("tags.toasts.updateError"));
    }
  };

  const handleBulkAction = (action) => {
    setBulkActionAnchorEl(null);
    switch (action) {
      case "delete":
        setConfirmModalAction("selected");
        setConfirmModalOpen(true);
        break;
      case "addKanban":
        handleUpdateKanban(true);
        break;
      case "removeKanban":
        handleUpdateKanban(false);
        break;
      default:
        break;
    }
  };

  const filteredTags = tags.filter((tag) => {
    if (kanbanFilter === "kanban") return tag.kanban;
    if (kanbanFilter === "nonKanban") return !tag.kanban;
    return true;
  });

  const handleKanbanFilterChange = (newValue) => {
    setKanbanFilter(newValue);
    setPage(1);
    setSelectedTags([]);
    // Não recarregamos os dados do servidor ao mudar o filtro,
    // apenas filtramos os dados já existentes no cliente
  };

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const ids = filteredTags.map(tag => tag.id);
      setSelectedTags(ids);
    } else {
      setSelectedTags([]);
    }
  };

  return (
    <MainContainer>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        tagData={selectedTag} 
        onSave={fetchTags}
      />
      <BulkTagModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSave={fetchTags}
      />
      <ConfirmationModal
        title={
          confirmModalAction === "selected"
            ? i18n.t("tags.confirmationModal.deleteSelectedTitle")
            : i18n.t("tags.confirmationModal.deleteTitle")
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteTag}
      >
        {confirmModalAction === "selected"
          ? i18n.t("tags.confirmationModal.deleteSelectedMessage")
          : i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <MainHeader>
        <Box sx={{ 
          display: "flex", 
          width: "100%", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Title>{i18n.t("tags.title")}</Title>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1 
          }}>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => setBulkActionAnchorEl(e.currentTarget)}
              startIcon={<MoreVertIcon />}
            >
              {i18n.t("tags.buttons.bulkActions")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleOpenTagModal()}
              startIcon={<AddIcon />}
            >
              {i18n.t("tags.buttons.add")}
            </Button>
          </Box>
        </Box>
      </MainHeader>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 2 
        }}>
          <TextField
            size="small"
            placeholder={i18n.t("tags.searchPlaceholder")}
            value={searchParam}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={kanbanFilter}
            onChange={(e) => handleKanbanFilterChange(e.target.value)}
            sx={{ width: "180px" }}
          >
            <MenuItem value="all">{i18n.t("tags.filters.allTags")}</MenuItem>
            <MenuItem value="kanban">{i18n.t("tags.filters.onlyKanban")}</MenuItem>
            <MenuItem value="nonKanban">{i18n.t("tags.filters.onlyNonKanban")}</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
            startIcon={<DownloadIcon />}
          >
            {i18n.t("tags.buttons.export")}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ 
        mt: 2, 
        maxHeight: "calc(100vh - 250px)", 
        display: "flex", 
        flexDirection: "column" 
      }}>
        <Box 
          ref={scrollRef} 
          sx={{ flex: 1, overflow: "auto" }} 
          onScroll={handleScroll}
        >
          {loading && page === 1 ? (
            <TableRowSkeleton columns={6} />
          ) : !loading && tags.length === 0 ? (
            <EmptyState 
              type="tags" 
              onCreateNew={() => handleOpenTagModal()} 
            />
          ) : (
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: "48px" }}>
                    <Checkbox
                      checked={filteredTags.length > 0 && selectedTags.length === filteredTags.length}
                      indeterminate={selectedTags.length > 0 && selectedTags.length < filteredTags.length}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: "60px" }}>ID</TableCell>
                  <TableCell>{i18n.t("tags.table.name")}</TableCell>
                  <TableCell>{i18n.t("tags.table.tickets")}</TableCell>
                  <TableCell>{i18n.t("tags.table.kanban")}</TableCell>
                  <TableCell align="right">{i18n.t("tags.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.id]);
                          } else {
                            setSelectedTags(selectedTags.filter(id => id !== tag.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{tag.id}</TableCell>
                    <TableCell>
                      <Chip
                        label={tag.name}
                        style={{
                          backgroundColor: tag.color,
                          color: "white"
                        }}
                      />
                    </TableCell>
                    <TableCell>{tag.tickets?.length || 0}</TableCell>
                    <TableCell>
                      <Switch
                        checked={tag.kanban}
                        onChange={() => handleUpdateKanban(!tag.kanban, tag.id)}
                        disabled={!user.super}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenTagModal(tag)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setConfirmModalAction(tag.id);
                          setConfirmModalOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {loading && page > 1 && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Paper>

      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={() => setExportAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            exportToExcel(filteredTags);
            setExportAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <FileExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar para Excel</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToPDF(filteredTags);
            setExportAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar para PDF</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            printTags(filteredTags);
            setExportAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Imprimir</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={bulkActionAnchorEl}
        open={Boolean(bulkActionAnchorEl)}
        onClose={() => setBulkActionAnchorEl(null)}
      >
        {selectedTags.length > 0 ? (
          <>
            <MenuItem onClick={() => handleBulkAction("delete")}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Excluir Selecionadas ({selectedTags.length})</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleBulkAction("addKanban")}>
              <ListItemIcon>
                <KanbanIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Adicionar ao Kanban</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleBulkAction("removeKanban")}>
              <ListItemIcon>
                <KanbanIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Remover do Kanban</ListItemText>
            </MenuItem>
          </>
        ) : (
          <MenuItem
            onClick={() => {
              setBulkActionAnchorEl(null);
              setBulkModalOpen(true);
            }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Criar Tags em Massa</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </MainContainer>
  );
};

export default Tags;