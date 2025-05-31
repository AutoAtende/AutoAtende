import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  Switch,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton
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
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardDataTable from "../../components/shared/StandardDataTable";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import BulkTagModal from "./components/BulkTagModal";
import { exportToExcel, exportToPDF, printTags } from './exportUtils';

const Tags = () => {
  const { user } = useContext(AuthContext);

  // Estados principais
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados de modais
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalAction, setConfirmModalAction] = useState(null);
  
  // Estados de menus
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [bulkActionAnchorEl, setBulkActionAnchorEl] = useState(null);

  // Função para buscar tags do servidor
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tags", {
        params: {
          searchParam,
        },
      });

      setTags(data.tags || []);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("tags.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [searchParam]);

  // Carregar tags na montagem e quando os filtros mudarem
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Configuração das colunas - MANTENDO EXATAMENTE O MESMO LAYOUT
  const columns = [
    {
      id: 'id',
      field: 'id',
      label: 'ID',
      width: '60px',
      align: 'left'
    },
    {
      id: 'name',
      field: 'name',
      label: i18n.t("tags.table.name"),
      render: (item) => (
        <Chip
          label={item.name}
          style={{
            backgroundColor: item.color,
            color: "white"
          }}
        />
      )
    },
    {
      id: 'ticketsCount',
      field: 'ticketsCount',
      label: i18n.t("tags.table.tickets"),
      render: (item) => item.ticketsCount || 0
    },
    {
      id: 'kanban',
      field: 'kanban',
      label: i18n.t("tags.table.kanban"),
      render: (item) => (
        <Switch
          checked={item.kanban === 1}
          onChange={() => handleUpdateKanban(item.kanban === 0, item.id)}
          disabled={!user?.super}
          color="primary"
        />
      )
    }
  ];

  // Ações da tabela - MANTENDO AS MESMAS AÇÕES
  const tableActions = [
    {
      label: "Editar",
      icon: <EditIcon />,
      onClick: (item) => handleOpenTagModal(item),
      color: "primary"
    },
    {
      label: "Excluir",
      icon: <DeleteIcon />,
      onClick: (item) => {
        setConfirmModalAction(item.id);
        setConfirmModalOpen(true);
      },
      color: "error"
    }
  ];

  // Manipuladores de eventos
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchParam(value);
  };

  const handleOpenTagModal = (tag = null) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
    fetchTags();
  };

  const handleDeleteTag = async () => {
    try {
      if (confirmModalAction === "selected") {
        await api.post("/tags/bulk-delete", {
          tagIds: selectedTags.map(tag => tag.id),
        });
        toast.success(`${selectedTags.length} tags excluídas com sucesso`);
        setSelectedTags([]);
      } else {
        await api.delete(`/tags/${confirmModalAction}`);
        toast.success(i18n.t("tags.toasts.deleted"));
      }
      setConfirmModalOpen(false);
      fetchTags();
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("tags.toasts.deleteError"));
    }
  };

  const handleUpdateKanban = async (kanbanValue, tagId = null) => {
    try {
      if (selectedTags.length > 0 && !tagId) {
        await api.post("/tags/bulk-update", {
          tagIds: selectedTags.map(tag => tag.id),
          kanban: kanbanValue ? 1 : 0,
        });
        
        toast.success(`${selectedTags.length} tags atualizadas com sucesso`);
        setSelectedTags([]);
      } else if (tagId) {
        const tag = tags.find(t => t.id === tagId);
        if (!tag) return;
  
        await api.put(`/tags/${tagId}`, {
          name: tag.name,
          color: tag.color,
          kanban: kanbanValue ? 1 : 0
        });
        
        toast.success(i18n.t("tags.toasts.updated"));
      }
      fetchTags();
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

  const handleSelectionChange = (selectedItems) => {
    setSelectedTags(selectedItems);
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
      tooltip: "Adicionar nova tag",
      primary: true
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
    setSelectedTags([]); // Limpar seleção ao trocar de aba
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
        <StandardDataTable
          data={filteredTags}
          columns={columns}
          loading={loading}
          selectable={true}
          selectedItems={selectedTags}
          onSelectionChange={handleSelectionChange}
          actions={tableActions}
          onRowClick={(item) => handleOpenTagModal(item)}
          stickyHeader={true}
          size="small"
          hover={true}
          maxVisibleActions={2} // Máximo de 2 ações visíveis por linha
          emptyIcon={<KanbanIcon />}
          emptyTitle="Nenhuma tag encontrada"
          emptyDescription="Não há tags cadastradas para os filtros selecionados."
          emptyActionLabel="Adicionar Tag"
          onEmptyActionClick={() => handleOpenTagModal()}
        />
      </StandardPageLayout>

      {/* Modais */}
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
            ? `Excluir ${selectedTags.length} tags selecionadas?`
            : i18n.t("tags.confirmationModal.deleteTitle")
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteTag}
      >
        {confirmModalAction === "selected"
          ? `Esta ação irá excluir permanentemente ${selectedTags.length} tags selecionadas. Esta ação não pode ser desfeita.`
          : i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      {/* Menus */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={() => setExportAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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