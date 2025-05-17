import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Chip,
  Paper
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
  Print as PrintIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";

// Importação dos componentes Base
import BasePage from "../../components/BasePage";
import BasePageHeader from "../../components/BasePageHeader";
import BasePageContent from "../../components/BasePageContent";
import BasePageFooter from "../../components/BasePageFooter";
import BaseButton from "../../components/BaseButton";

// Importações existentes
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import EmptyState from "../../components/EmptyState";
import BulkTagModal from "./components/BulkTagModal";
import { exportToExcel, exportToPDF, printTags } from './exportUtils';

const Tags = () => {
  const { user } = useContext(AuthContext);

  // Estado
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Função para buscar tags do servidor
  const fetchTags = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get("/tags", {
        params: {
          searchParam,
          pageNumber,
          pageSize: rowsPerPage,
        },
      });

      setTags(data.tags);
      setHasMore(data.hasMore);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("tags.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [searchParam, rowsPerPage]);

  // Carregar tags na montagem e quando os filtros mudarem
  useEffect(() => {
    fetchTags(1);
  }, [fetchTags]);

  // Manipuladores de eventos
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchParam(value);
    // Resetar página ao fazer nova busca
    setPage(1);
    
    // Adicionar delay para evitar excesso de requisições
    const timeoutId = setTimeout(() => {
      fetchTags(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1); // +1 porque a API usa paginação baseada em 1
    fetchTags(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    fetchTags(1);
  };

  const handleOpenTagModal = (tag = null) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
    fetchTags(page);
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
      fetchTags(page);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("tags.toasts.deleteError"));
    }
  };

  const handleUpdateKanban = async (kanbanValue, tagId = null) => {
    try {
      if (selectedTags.length > 0 && !tagId) {
        await api.post("/tags/bulk-update", {
          tagIds: selectedTags,
          kanban: kanbanValue ? 1 : 0,
        });
        
        setTags(prevTags => 
          prevTags.map(tag => 
            selectedTags.includes(tag.id) 
              ? { ...tag, kanban: kanbanValue ? 1 : 0 } 
              : tag
          )
        );
        
        toast.success(i18n.t("tags.toasts.updated"));
      } else if (tagId) {
        const tag = tags.find(t => t.id === tagId);
        if (!tag) return;
  
        await api.put(`/tags/${tagId}`, {
          name: tag.name,
          color: tag.color,
          kanban: kanbanValue ? 1 : 0
        });
        
        setTags(prevTags =>
          prevTags.map(t => (t.id === tagId ? { ...t, kanban: kanbanValue ? 1 : 0 } : t))
        );
        
        toast.success(i18n.t("tags.toasts.updated"));
      }
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

  const handleKanbanFilterChange = (newValue) => {
    setKanbanFilter(newValue);
    setFilterAnchorEl(null);
  };

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const ids = filteredTags.map(tag => tag.id);
      setSelectedTags(ids);
    } else {
      setSelectedTags([]);
    }
  };

  // Filtrar tags com base no kanbanFilter
  const filteredTags = tags.filter((tag) => {
    if (kanbanFilter === "kanban") return tag.kanban === 1;
    if (kanbanFilter === "nonKanban") return tag.kanban === 0;
    return true;
  });

  // Ações para o BasePageHeader
  const headerActions = [
    {
      label: i18n.t("tags.buttons.add"),
      onClick: () => handleOpenTagModal(),
      icon: <AddIcon />,
      variant: "contained",
      color: "primary",
    }
  ];

  // Ações para o BasePageFooter
  const footerActions = [
    {
      label: i18n.t("tags.buttons.export"),
      onClick: (e) => setExportAnchorEl(e.currentTarget),
      icon: <DownloadIcon />,
      variant: "outlined",
    },
    {
      label: i18n.t("tags.buttons.bulkActions"),
      onClick: (e) => setBulkActionAnchorEl(e.currentTarget),
      icon: <MoreVertIcon />,
      variant: "outlined",
    }
  ];

  return (
    <BasePage title={i18n.t("tags.title")}>
      {/* Modais */}
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        tagData={selectedTag}
        onSave={() => fetchTags(page)}
      />
      
      <BulkTagModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSave={() => fetchTags(page)}
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

      {/* Cabeçalho da página */}
      <BasePageHeader
        onSearch={handleSearch}
        searchValue={searchParam}
        searchPlaceholder={i18n.t("tags.searchPlaceholder")}
        actions={headerActions}
        sx={{ mb: 3 }} // Adicionado margin-bottom para criar espaço entre o cabeçalho e o conteúdo
      >
        <BaseButton
          variant="outlined"
          size="small"
          startIcon={<FilterIcon />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
        >
          {kanbanFilter === "all" 
            ? i18n.t("tags.filters.allTags") 
            : kanbanFilter === "kanban" 
              ? i18n.t("tags.filters.onlyKanban") 
              : i18n.t("tags.filters.onlyNonKanban")}
        </BaseButton>
      </BasePageHeader>

      {/* Conteúdo da página */}
      <BasePageContent 
        loading={loading && page === 1}
        empty={!loading && filteredTags.length === 0}
        emptyProps={{
          icon: <KanbanIcon fontSize="large" />,
          title: i18n.t("tags.emptyState.title"),
          message: i18n.t("tags.emptyState.message"),
          buttonText: i18n.t("tags.buttons.add"),
          onAction: () => handleOpenTagModal(),
          showButton: true,
        }}
        sx={{ mb: 3 }} // Adiciona margin-bottom no conteúdo para espaçamento com o footer
      >
        <Box sx={{ height: '100%', overflow: 'auto' }}>
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
              {loading && page === 1 ? (
                <TableRowSkeleton columns={6} />
              ) : (
                filteredTags.map((tag) => (
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
                    <TableCell>{tag.ticketsCount || 0}</TableCell>
                    <TableCell>
                      <Switch
                        checked={tag.kanban === 1}
                        onChange={() => handleUpdateKanban(tag.kanban === 0, tag.id)}
                        disabled={!user?.super}
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
                ))
              )}
              
              {loading && page > 1 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </BasePageContent>

      {/* Rodapé da página */}
      <BasePageFooter
        count={totalCount}
        page={page - 1} // -1 porque a paginação do MUI começa em 0
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        actions={footerActions}
      />

      {/* Menus */}
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

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem 
          selected={kanbanFilter === "all"}
          onClick={() => handleKanbanFilterChange("all")}
        >
          {i18n.t("tags.filters.allTags")}
        </MenuItem>
        <MenuItem 
          selected={kanbanFilter === "kanban"}
          onClick={() => handleKanbanFilterChange("kanban")}
        >
          {i18n.t("tags.filters.onlyKanban")}
        </MenuItem>
        <MenuItem 
          selected={kanbanFilter === "nonKanban"}
          onClick={() => handleKanbanFilterChange("nonKanban")}
        >
          {i18n.t("tags.filters.onlyNonKanban")}
        </MenuItem>
      </Menu>
    </BasePage>
  );
};

export default Tags;