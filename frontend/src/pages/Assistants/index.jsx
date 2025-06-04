import React, { useState, useEffect, useReducer, useCallback } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  useMediaQuery,
  useTheme,
  TablePagination,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudDownload as CloudDownloadIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Functions as FunctionsIcon,
  Extension as ExtensionIcon,
  Add as AddIcon,
  HelpOutline as HelpIcon,
  VolumeUp as VolumeUpIcon,
  SmartToy as SmartToyIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from "@mui/icons-material";

// Componentes
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import api from "../../services/api";
import AssistantModal from "./components/AssistantModal";
import VoiceSettingsModal from "./components/VoiceSettingsModal";
import ImportAssistantsModal from "./components/ImportAssistantsModal";
import AssistantsHelpModal from "./components/AssistantsHelpModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";

// Reducer para gerenciar estado dos assistentes
const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_ASSISTANTS":
      return action.payload;
    case "UPDATE_ASSISTANT":
      const assistant = action.payload;
      const assistantIndex = state.findIndex((p) => p.id === assistant.id);
      if (assistantIndex !== -1) {
        state[assistantIndex] = assistant;
        return [...state];
      } else {
        return [assistant, ...state];
      }
    case "DELETE_ASSISTANT":
      const assistantId = action.payload;
      return state.filter((assistant) => assistant.id !== assistantId);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const Assistants = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [loading, setLoading] = useState(true);
  const [assistants, dispatch] = useReducer(reducer, []);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterTool, setFilterTool] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [voiceSettingsModalOpen, setVoiceSettingsModalOpen] = useState(false);
  // Buscar assistentes com todos os filtros aplicados
  const fetchAssistants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        searchParam,
        pageNumber: page + 1,
        pageSize: rowsPerPage,
      };

      if (filterModel) {
        params.model = filterModel;
      }

      if (filterTool) {
        params.toolType = filterTool;
      }

      const { data } = await api.get("/assistants", { params });
      dispatch({ type: "LOAD_ASSISTANTS", payload: data.assistants });
      setCount(data.count);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("assistants.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [searchParam, page, rowsPerPage, filterModel, filterTool]);

  // Carregar assistentes ao iniciar e quando mudar os filtros
  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  // Handlers para diversas ações
  const handleSearch = (event) => {
    setSearchParam(event.target.value);
    setPage(0);
  };

  const handleOpenAssistantModal = () => {
    setSelectedAssistant(null);
    setAssistantModalOpen(true);
  };

  const handleCloseAssistantModal = () => {
    setSelectedAssistant(null);
    setAssistantModalOpen(false);
  };

  const handleEditAssistant = (assistant) => {
    setSelectedAssistant(assistant);
    setAssistantModalOpen(true);
  };

  const handleConfirmDelete = (assistant) => {
    setSelectedAssistant(assistant);
    setConfirmModalOpen(true);
  };

  const handleDeleteAssistant = async (assistantId) => {
    try {
      await api.delete(`/assistants/${assistantId}`);
      toast.success(i18n.t("assistants.toasts.deleted"));
      dispatch({ type: "DELETE_ASSISTANT", payload: assistantId });
      setCount((prevCount) => prevCount - 1);
    } catch (err) {
      toast.error(i18n.t("assistants.toasts.deleteError"));
    }
    setSelectedAssistant(null);
    setConfirmModalOpen(false);
  };

  const handleImportAssistants = () => {
    setImportModalOpen(true);
  };

  const handleImportComplete = () => {
    fetchAssistants();
  };

  const handleAssistantUpdated = () => {
    fetchAssistants();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrar assistentes baseado na aba ativa
  const getFilteredAssistants = () => {
    switch (activeTab) {
      case 1: // Ativos
        return assistants.filter(assistant => assistant.active);
      case 2: // Inativos
        return assistants.filter(assistant => !assistant.active);
      case 3: // Por Modelo
        return assistants; // Filtro aplicado via estado filterModel
      default: // Todos
        return assistants;
    }
  };

  const filteredAssistants = getFilteredAssistants();

  // Opções para filtro de ferramentas
  const filteredTools = [
    { value: "", label: i18n.t("assistants.filters.allTools") },
    { value: "file_search", label: i18n.t("assistants.tools.fileSearch") },
    { value: "code_interpreter", label: i18n.t("assistants.tools.codeInterpreter") },
    { value: "function", label: i18n.t("assistants.tools.function") },
  ];

  // Opções para filtro de modelos
  const modelOptions = [
    { value: "", label: i18n.t("assistants.filters.allModels") },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ];

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("assistants.buttons.help"),
      icon: <HelpIcon />,
      onClick: () => setHelpModalOpen(true),
      variant: "outlined",
      color: "primary",
      tooltip: i18n.t("assistants.buttons.help")
    },
    {
      label: i18n.t("assistants.buttons.new"),
      icon: <AddIcon />,
      onClick: handleOpenAssistantModal,
      variant: "contained",
      color: "primary"
    },
    {
      label: i18n.t("assistants.buttons.import"),
      icon: <CloudDownloadIcon />,
      onClick: () => setImportModalOpen(true),
      variant: "outlined"
    },
    {
      label: i18n.t("assistants.buttons.voiceSettings"),
      icon: <VolumeUpIcon />,
      onClick: () => setVoiceSettingsModalOpen(true),
      variant: "outlined",
      color: "primary",
      tooltip: i18n.t("assistants.buttons.voiceSettings")
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todos (${assistants.length})`,
      icon: <SmartToyIcon />
    },
    {
      label: `Ativos (${assistants.filter(a => a.active).length})`,
      icon: <ActiveIcon />
    },
    {
      label: `Inativos (${assistants.filter(a => !a.active).length})`,
      icon: <InactiveIcon />
    },
    {
      label: "Filtros",
      icon: <SearchIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Renderizar ícone da ferramenta
  const renderToolIcon = (toolType) => {
    switch (toolType) {
      case "file_search":
        return <SearchIcon fontSize="small" />;
      case "code_interpreter":
        return <CodeIcon fontSize="small" />;
      case "function":
        return <FunctionsIcon fontSize="small" />;
      default:
        return <ExtensionIcon fontSize="small" />;
    }
  };

  // Renderizar label da ferramenta
  const renderToolLabel = (toolType) => {
    switch (toolType) {
      case "file_search":
        return i18n.t("assistants.tools.fileSearch");
      case "code_interpreter":
        return i18n.t("assistants.tools.codeInterpreter");
      case "function":
        return i18n.t("assistants.tools.function");
      default:
        return toolType;
    }
  };

  // Renderizar conteúdo da página
  const renderContent = () => {
    // Aba de filtros
    if (activeTab === 3) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros Avançados
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{i18n.t("assistants.filters.modelLabel")}</InputLabel>
              <Select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                label={i18n.t("assistants.filters.modelLabel")}
              >
                {modelOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{i18n.t("assistants.filters.toolLabel")}</InputLabel>
              <Select
                value={filterTool}
                onChange={(e) => setFilterTool(e.target.value)}
                label={i18n.t("assistants.filters.toolLabel")}
              >
                {filteredTools.map((tool) => (
                  <MenuItem key={tool.value} value={tool.value}>
                    {tool.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setPage(0);
                fetchAssistants();
              }}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Box>
      );
    }

    // Estado vazio
    if (filteredAssistants.length === 0 && !loading) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          sx={{ height: '100%', p: 4 }}
        >
          <SmartToyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {activeTab === 0 
              ? i18n.t("assistants.emptyState.title")
              : activeTab === 1 
                ? "Nenhum assistente ativo"
                : "Nenhum assistente inativo"
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {searchParam 
              ? "Tente usar outros termos na busca"
              : activeTab === 0
                ? i18n.t("assistants.emptyState.description")
                : "Não há assistentes nesta categoria"
            }
          </Typography>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAssistantModal}
              sx={{ borderRadius: '28px', px: 3 }}
            >
              {i18n.t("assistants.buttons.addEmpty")}
            </Button>
          )}
        </Box>
      );
    }

    // Tabela de assistentes
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="medium" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{i18n.t("assistants.table.name")}</TableCell>
                  <TableCell align="center">{i18n.t("assistants.table.model")}</TableCell>
                  <TableCell align="center">{i18n.t("assistants.table.tools")}</TableCell>
                  <TableCell align="center">{i18n.t("assistants.table.status")}</TableCell>
                  <TableCell align="center">{i18n.t("assistants.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssistants.map((assistant) => (
                  <TableRow key={assistant.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {assistant.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={assistant.model} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5}>
                        {assistant.tools?.map((tool) => (
                          <Tooltip
                            key={tool.type}
                            title={
                              tool.type === "file_search"
                                ? i18n.t("assistants.tools.fileSearchFull")
                                : tool.type === "code_interpreter"
                                ? i18n.t("assistants.tools.codeInterpreterFull")
                                : tool.type === "function"
                                ? i18n.t("assistants.tools.functionFull")
                                : tool.type
                            }
                          >
                            <Chip
                              icon={renderToolIcon(tool.type)}
                              label={renderToolLabel(tool.type)}
                              size="small"
                              variant="outlined"
                              sx={{ margin: 0.25 }}
                            />
                          </Tooltip>
                        ))}
                        {(!assistant.tools || assistant.tools.length === 0) && (
                          <Typography variant="caption" color="textSecondary">
                            {i18n.t("assistants.labels.none")}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={assistant.active ? i18n.t("assistants.status.active") : i18n.t("assistants.status.inactive")}
                        color={assistant.active ? "success" : "default"}
                        size="small"
                        sx={{ borderRadius: 12, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title={i18n.t("assistants.buttons.edit")}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAssistant(assistant)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={i18n.t("assistants.buttons.delete")}>
                          <IconButton
                            size="small"
                            onClick={() => handleConfirmDelete(assistant)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Paginação */}
        {count > 0 && activeTab !== 3 && (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <TablePagination
              component="div"
              count={count}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
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
        title={i18n.t("assistants.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("assistants.searchPlaceholder")}
        showSearch={activeTab !== 3}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading && assistants.length === 0}
      >
        {/* Conteúdo principal */}
        
        {renderContent()}
      </StandardPageLayout>

      {/* Modais */}
      <ConfirmationModal
        title={selectedAssistant && `${i18n.t("assistants.confirmationModal.deleteTitle")} ${selectedAssistant.name}?`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteAssistant(selectedAssistant.id)}
      >
        {i18n.t("assistants.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <AssistantModal
        open={assistantModalOpen}
        onClose={handleCloseAssistantModal}
        assistantId={selectedAssistant?.id}
        onAssistantUpdated={handleAssistantUpdated}
      />

      <ImportAssistantsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <AssistantsHelpModal 
        open={helpModalOpen} 
        onClose={() => setHelpModalOpen(false)} 
      />

      <VoiceSettingsModal 
        open={voiceSettingsModalOpen} 
        onClose={() => setVoiceSettingsModalOpen(false)} 
      />
    </>
  );
};

export default Assistants;