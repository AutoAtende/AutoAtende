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
  Button,
  TableContainer
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreVertIcon,
  TableChart as FileExcelIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ViewKanban as KanbanIcon,
  Print as PrintIcon,
  LocalOffer as TagIcon,
  Sell as SellIcon
} from "@mui/icons-material";

// Componentes
import StandardPageLayout from "../../components/StandardPageLayout";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import BulkTagModal from "./components/BulkTagModal";
import { exportToExcel, exportToPDF, printTags } from './exportUtils';

const Tags = () => {
  const { user } = useContext(AuthContext);

  // Estado
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [activeTab, setActiveTab] = useState(0);

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
    setPage(1);
    
    const timeoutId = setTimeout(() => {
      fetchTags(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
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

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const ids = filteredTags.map(tag => tag.id);
      setSelectedTags(ids);
    } else {
      setSelectedTags([]);
    }
  };

  // Filtrar tags com base na aba ativa
  const getFilteredTags = () => {
    switch (activeTab) {
      case 1: // Kanban
        return tags.filter((tag) => tag.kanban === 1);
      case 2: // Não-Kanban
        return tags.filter((tag) => tag.kanban === 0);
      default: // Todas
        return tags;
    }
  };

  const filteredTags = getFilteredTags();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("tags.buttons.add"),
      icon: <AddIcon />,
      onClick: () => handleOpenTagModal(),
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar nova tag"
    },
    {
      label: "Ações em Massa",
      icon: <MoreVertIcon />,
      onClick: (e) => setBulkActionAnchorEl(e.currentTarget),
      variant: "outlined",
      color: "primary",
      tooltip: "Ações em massa"
    },
    {
      label: "Exportar",
      icon: <DownloadIcon />,
      onClick: (e) => setExportAnchorEl(e.currentTarget),
      variant: "outlined",
      color: "primary",
      tooltip: "Exportar dados"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todas (${tags.length})`,
      icon: <TagIcon />
    },
    {
      label: `Kanban (${tags.filter(t => t.kanban === 1).length})`,
      icon: <KanbanIcon />
    },
    {
      label: `Comuns (${tags.filter(t => t.kanban === 0).length})`,
      icon: <SellIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <StandardPageLayout
        title={i18n.t("tags.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("tags.searchPlaceholder")}
        showSearch={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading}
      >
        {filteredTags.length === 0 && !loading ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            sx={{ height: '100%', p: 4 }}
          >
            <KanbanIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Box sx={{ textAlign: 'center' }}>
              <h3>Nenhuma tag encontrada</h3>
              <p>Não há tags cadastradas para os filtros selecionados.</p>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTagModal()}
              >
                Adicionar Tag
              </Button>
            </Box>
          </Box>
        ) : (
          <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
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
                {loading ? (
                  <TableRowSkeleton columns={6} />
                ) : (
                  filteredTags.map((tag) => (
                    <TableRow key={tag.id} hover>
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
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenTagModal(tag)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmModalAction(tag.id);
                            setConfirmModalOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StandardPageLayout>

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
    </>
  );
};

export default Tags;