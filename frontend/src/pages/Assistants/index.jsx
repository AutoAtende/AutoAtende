import React, { useState, useEffect, useReducer, useCallback } from "react";
import { styled } from "@mui/material/styles";
import {
  Paper,
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
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudDownload as CloudDownloadIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Functions as FunctionsIcon,
  Extension as ExtensionIcon,
  SearchOutlined as SearchOutlinedIcon,
  Add as AddIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  VolumeUp as VolumeUpIcon
} from "@mui/icons-material";
import { useSpring, animated } from "react-spring";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import AssistantModal from "./components/AssistantModal";
import AssistantsHelpButton from './components/AssistantsHelpButton';
import VoiceSettingsButton from './components/VoiceSettingsButton';
import ImportAssistantsModal from "./components/ImportAssistantsModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";

// Estilos
const PREFIX = "Assistants";

const classes = {
  mainPaper: `${PREFIX}-mainPaper`,
  searchContainer: `${PREFIX}-searchContainer`,
  tableContainer: `${PREFIX}-tableContainer`,
  filterChip: `${PREFIX}-filterChip`,
  emptyState: `${PREFIX}-emptyState`,
  mobileCard: `${PREFIX}-mobileCard`,
  actionButton: `${PREFIX}-actionButton`,
  pagination: `${PREFIX}-pagination`,
  statusChip: `${PREFIX}-statusChip`,
  toolChip: `${PREFIX}-toolChip`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.mainPaper}`]: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
    },
  },
  [`& .${classes.searchContainer}`]: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      padding: theme.spacing(1, 0),
    },
  },
  [`& .${classes.tableContainer}`]: {
    maxHeight: "calc(100vh - 280px)",
    [theme.breakpoints.down("sm")]: {
      maxHeight: "none",
    },
  },
  [`& .${classes.filterChip}`]: {
    margin: theme.spacing(0.5),
    backgroundColor: theme.palette.background.default,
  },
  [`& .${classes.emptyState}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    textAlign: "center",
  },
  [`& .${classes.mobileCard}`]: {
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    },
  },
  [`& .${classes.actionButton}`]: {
    borderRadius: 8,
    textTransform: "none",
    boxShadow: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    padding: theme.spacing(1, 2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.75, 1.5),
      fontSize: "0.8125rem",
    },
  },
  [`& .${classes.pagination}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2, 0),
    marginTop: theme.spacing(2),
  },
  [`& .${classes.statusChip}`]: {
    borderRadius: 12,
    fontWeight: 600,
    height: 24,
  },
  [`& .${classes.toolChip}`]: {
    borderRadius: 8,
    margin: theme.spacing(0.5),
    "& .MuiChip-icon": {
      marginLeft: theme.spacing(0.5),
    },
  },
}));

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

// Componente AssistantListItem para visualização mobile
const AssistantListItem = ({ assistant, onEdit, onDelete, theme }) => {
  return (
    <Fade in={true} timeout={500}>
      <Card className={classes.mobileCard} variant="outlined">
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" component="h2">
                  {assistant.name}
                </Typography>
                <Chip
                  label={assistant.active ? i18n.t("assistants.status.active") : i18n.t("assistants.status.inactive")}
                  color={assistant.active ? "success" : "default"}
                  size="small"
                  className={classes.statusChip}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary" mr={1}>
                  {i18n.t("assistants.labels.model")}:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {assistant.model}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" mb={0.5}>
                {i18n.t("assistants.labels.tools")}:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {assistant.tools && assistant.tools.length > 0 ? (
                  assistant.tools.map((tool) => (
                    <Chip
                      key={tool.type}
                      size="small"
                      className={classes.toolChip}
                      icon={
                        tool.type === "file_search" ? (
                          <SearchIcon fontSize="small" />
                        ) : tool.type === "code_interpreter" ? (
                          <CodeIcon fontSize="small" />
                        ) : tool.type === "function" ? (
                          <FunctionsIcon fontSize="small" />
                        ) : (
                          <ExtensionIcon fontSize="small" />
                        )
                      }
                      label={
                        tool.type === "file_search"
                          ? i18n.t("assistants.tools.fileSearch")
                          : tool.type === "code_interpreter"
                          ? i18n.t("assistants.tools.codeInterpreter")
                          : tool.type === "function"
                          ? i18n.t("assistants.tools.function")
                          : tool.type
                      }
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    {i18n.t("assistants.labels.noTools")}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(assistant)}
                  variant="outlined"
                >
                  {i18n.t("assistants.buttons.edit")}
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(assistant)}
                  variant="outlined"
                  color="error"
                >
                  {i18n.t("assistants.buttons.delete")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);

  // Configuração da animação com react-spring
  const springProps = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 500 },
  });

  // Buscar assistentes com todos os filtros aplicados
  const fetchAssistants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        searchParam,
        pageNumber: page,
      };

      if (filterModel) {
        params.model = filterModel;
      }

      if (filterTool) {
        params.toolType = filterTool;
      }

      const { data } = await api.get("/assistants", { params });
      dispatch({ type: "LOAD_ASSISTANTS", payload: data.assistants });
      setHasMore(data.hasMore);
      setCount(data.count);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("assistants.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [searchParam, page, filterModel, filterTool]);

  // Carregar assistentes ao iniciar e quando mudar a página
  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants, page]);

  // Handlers para diversas ações
  const handleSearch = () => {
    setPage(1);
    fetchAssistants();
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

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleImportComplete = () => {
    fetchAssistants();
  };

  const handleAssistantUpdated = () => {
    fetchAssistants();
  };

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

  return (
    <Root>
      <MainContainer>
        {/* Modal de confirmação para exclusão */}
        <ConfirmationModal
          title={selectedAssistant && `${i18n.t("assistants.confirmationModal.deleteTitle")} ${selectedAssistant.name}?`}
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteAssistant(selectedAssistant.id)}
        >
          {i18n.t("assistants.confirmationModal.deleteMessage")}
        </ConfirmationModal>

        {/* Modal para adicionar/editar assistente */}
        <AssistantModal
          open={assistantModalOpen}
          onClose={handleCloseAssistantModal}
          assistantId={selectedAssistant?.id}
          onAssistantUpdated={handleAssistantUpdated}
        />

        {/* Modal para importar assistentes */}
        <ImportAssistantsModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImportComplete={handleImportComplete}
        />

        {/* Cabeçalho */}
        <MainHeader>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            sx={{ marginTop: 2 }}
          >
            <Box display="flex" alignItems="center">
              <Title>{i18n.t("assistants.title")}</Title>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title={i18n.t("assistants.buttons.help")}>
                <span>
                  <AssistantsHelpButton />
                </span>
              </Tooltip>
              
              <Tooltip title="Configurações de Voz">
                <span>
                  <VoiceSettingsButton />
                </span>
              </Tooltip>
              
              <Tooltip title={i18n.t("assistants.buttons.import")}>
                <IconButton
                  color="primary"
                  onClick={handleImportAssistants}
                  size="large"
                >
                  <CloudDownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={i18n.t("assistants.buttons.add")}>
                <IconButton
                  color="primary"
                  onClick={handleOpenAssistantModal}
                  size="large"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </MainHeader>

        {/* Conteúdo principal */}
        <Paper className={classes.mainPaper} variant="outlined">
          {/* Barra de pesquisa e filtros */}
          <Box className={classes.searchContainer}>
            <TextField
              placeholder={i18n.t("assistants.searchPlaceholder")}
              value={searchParam}
              onChange={(e) => setSearchParam(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              fullWidth
              size={isMobile ? "small" : "medium"}
              variant="outlined"
            />

            <Box display="flex" gap={1.5} flexWrap="wrap" width={isMobile ? "100%" : "auto"}>
              <FormControl
                variant="outlined"
                size="small"
                style={{
                  minWidth: isMobile ? "100%" : 150,
                  flex: isMobile ? 1 : "0 0 auto",
                }}
              >
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

              <FormControl
                variant="outlined"
                size="small"
                style={{
                  minWidth: isMobile ? "100%" : 180,
                  flex: isMobile ? 1 : "0 0 auto",
                }}
              >
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
                onClick={handleSearch}
                style={{ minWidth: isMobile ? "100%" : 100 }}
                fullWidth={isMobile}
              >
                {i18n.t("assistants.buttons.search")}
              </Button>
            </Box>
          </Box>

          {loading ? (
            // Estado de carregamento
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={4}
            >
              <CircularProgress />
            </Box>
          ) : assistants.length > 0 ? (
            // Lista de assistentes
            isMobile ? (
              // Visualização em cards para mobile
              <Box>
                {assistants.map((assistant) => (
                  <AssistantListItem
                    key={assistant.id}
                    assistant={assistant}
                    onEdit={handleEditAssistant}
                    onDelete={handleConfirmDelete}
                    theme={theme}
                  />
                ))}
              </Box>
            ) : (
              // Visualização em tabela para desktop
              <TableContainer className={classes.tableContainer}>
                <Table size="medium" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">
                        {i18n.t("assistants.table.name")}
                      </TableCell>
                      <TableCell align="center">
                        {i18n.t("assistants.table.model")}
                      </TableCell>
                      <TableCell align="center">{i18n.t("assistants.table.tools")}</TableCell>
                      <TableCell align="center">{i18n.t("assistants.table.status")}</TableCell>
                      <TableCell align="center">
                        {i18n.t("assistants.table.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assistants.map((assistant) => (
                      <TableRow
                        key={assistant.id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="body1" fontWeight={500}>
                            {assistant.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{assistant.model}</TableCell>
                        <TableCell align="center">
                          <Box
                            display="flex"
                            justifyContent="center"
                            flexWrap="wrap"
                            gap={0.5}
                          >
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
                                  icon={
                                    tool.type === "file_search" ? (
                                      <SearchIcon fontSize="small" />
                                    ) : tool.type === "code_interpreter" ? (
                                      <CodeIcon fontSize="small" />
                                    ) : tool.type === "function" ? (
                                      <FunctionsIcon fontSize="small" />
                                    ) : (
                                      <ExtensionIcon fontSize="small" />
                                    )
                                  }
                                  label={
                                    tool.type === "file_search"
                                      ? i18n.t("assistants.tools.fileSearch")
                                      : tool.type === "code_interpreter"
                                      ? i18n.t("assistants.tools.codeInterpreter")
                                      : tool.type === "function"
                                      ? i18n.t("assistants.tools.function")
                                      : tool.type
                                  }
                                  size="small"
                                  variant="outlined"
                                  className={classes.toolChip}
                                />
                              </Tooltip>
                            ))}
                            {(!assistant.tools ||
                              assistant.tools.length === 0) && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {i18n.t("assistants.labels.none")}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {assistant.active ? (
                            <Chip
                              label={i18n.t("assistants.status.active")}
                              color="success"
                              size="small"
                              className={classes.statusChip}
                            />
                          ) : (
                            <Chip
                              label={i18n.t("assistants.status.inactive")}
                              color="default"
                              size="small"
                              className={classes.statusChip}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip
                              title={i18n.t("assistants.buttons.edit")}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleEditAssistant(assistant)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title={i18n.t("assistants.buttons.delete")}
                            >
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
              </TableContainer>
            )
          ) : (
            // Estado vazio
            <Box className={classes.emptyState}>
              <ExtensionIcon style={{ fontSize: 60, color: theme.palette.text.secondary, marginBottom: theme.spacing(2) }} />
              <Typography variant="h6" align="center" gutterBottom>
                {i18n.t("assistants.emptyState.title")}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary" mb={2}>
                {i18n.t("assistants.emptyState.description")}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAssistantModal}
                sx={{
                  borderRadius: 28,
                  padding: '10px 24px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                }}
              >
                {i18n.t("assistants.buttons.addEmpty")}
              </Button>
            </Box>
          )}

          {/* Paginação */}
          {assistants.length > 0 && (
            <Box className={classes.pagination}>
              <Typography variant="body2" color="textSecondary">
                {i18n.t("assistants.pagination.showing", { 
                  visible: assistants.length, 
                  total: count 
                })}
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<NavigateBeforeIcon />}
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  {i18n.t("assistants.pagination.previous")}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<NavigateNextIcon />}
                  onClick={handleNextPage}
                  disabled={!hasMore}
                >
                  {i18n.t("assistants.pagination.next")}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </MainContainer>
    </Root>
  );
};

export default Assistants;