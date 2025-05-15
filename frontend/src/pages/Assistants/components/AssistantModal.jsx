import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { styled } from "@mui/material/styles";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  MenuItem,
  Checkbox,
  Tooltip,
  LinearProgress,
  Grid,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Divider,
  Slider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import {
  Add as AddIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Code as CodeIcon,
  Search as SearchIcon,
  Functions as FunctionsIcon
} from "@mui/icons-material";
import ToolsIcon from "@mui/icons-material/Extension";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { useSpring, animated } from "react-spring";
import FunctionsEditor from "./FunctionsEditor";

// Modelos compatíveis com a OpenAI
const openAiModels = [
  { displayName: "GPT-4o", modelCode: "gpt-4o" },
  { displayName: "GPT-4", modelCode: "gpt-4" },
  { displayName: "GPT-4 Turbo", modelCode: "gpt-4-turbo" },
  { displayName: "GPT-3.5 Turbo", modelCode: "gpt-3.5-turbo" }
];

// TabPanel para as diferentes abas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assistant-tabpanel-${index}`}
      aria-labelledby={`assistant-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Estilos para os componentes
const PREFIX = "AssistantModal";

const StyledButton = styled(Button)({
  "& input": {
    display: "none",
  },
});

const FileListContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  marginTop: theme.spacing(2),
  height: "150px",
  overflowY: "auto",
}));

const FileRow = styled(Box)(({ theme, isSelected }) => ({
  display: "grid",
  gridTemplateColumns: "40px 1fr 40px",
  alignItems: "center",
  padding: theme.spacing(0.5),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "& .checkbox, & .delete-button": {
    opacity: isSelected ? 1 : 0,
    transition: "opacity 0.3s",
  },
  "&:hover .checkbox, &:hover .delete-button": {
    opacity: 1,
  },
}));

const NavigationContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "8px",
});

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .file-list-container": {
    maxHeight: "calc(100vh - 400px)",
    overflowY: "auto",
  },
}));

// Schema para validação com Yup
const AssistantSchema = Yup.object().shape({
  openaiApiKey: Yup.string().required(i18n.t("assistants.validation.required")),
  name: Yup.string()
    .min(2, i18n.t("assistants.validation.tooShort"))
    .max(50, i18n.t("assistants.validation.tooLong"))
    .required(i18n.t("assistants.validation.required")),
  instructions: Yup.string()
    .min(2, i18n.t("assistants.validation.tooShort"))
    .max(1000, i18n.t("assistants.validation.tooLong"))
    .required(i18n.t("assistants.validation.required")),
  model: Yup.string().required(i18n.t("assistants.validation.required")),
  active: Yup.boolean()
});

const AssistantModal = ({ open, onClose, assistantId, onAssistantUpdated }) => {
  const { user } = useContext(AuthContext);
  const [assistant, setAssistant] = useState({
    openaiApiKey: "",
    name: "",
    instructions: "",
    model: "",
    active: true,
    tools: []
  });
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUploadSize, setTotalUploadSize] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [existingFiles, setExistingFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedToolType, setSelectedToolType] = useState("file_search");
  const [tools, setTools] = useState([
    { type: "file_search", enabled: false },
    { type: "code_interpreter", enabled: false },
    { type: "function", enabled: false }
  ]);
  const [functions, setFunctions] = useState([]);
  
  const filesPerPage = 3;
  const springProps = useSpring({
    opacity: open ? 1 : 0,
    transform: `scale(${open ? 1 : 0.8})`,
  });

  // Carregar dados do assistente ao abrir o modal para edição
  useEffect(() => {
    const fetchAssistant = async () => {
      if (!assistantId) return;
      
      try {
        const { data } = await api.get(`/assistants/${assistantId}`);
        setAssistant(data);
        
        // Configurar ferramentas habilitadas
        if (data.tools && Array.isArray(data.tools)) {
          const toolsState = tools.map(tool => {
            const found = data.tools.find(t => t.type === tool.type);
            return {
              ...tool,
              enabled: !!found
            };
          });
          setTools(toolsState);
          
          // Carregar funções se existirem
          const functionTools = data.tools.filter(t => t.type === "function");
          if (functionTools.length > 0) {
            const extractedFunctions = functionTools.map(t => ({
              name: t.function.name,
              description: t.function.description,
              parameters: t.function.parameters
            }));
            setFunctions(extractedFunctions);
          }
        }
        
        // Carregar arquivos existentes
        fetchAssistantFiles(assistantId);
      } catch (err) {
        toast.error(i18n.t("assistants.toasts.loadAssistantError"));
        console.error(err);
      }
    };
    
    if (assistantId && open) {
      fetchAssistant();
    }
  }, [assistantId, open]);

  // Buscar arquivos do assistente
  const fetchAssistantFiles = async (id) => {
    setLoadingFiles(true);
    try {
      const { data } = await api.get(`/assistants/${id}/files`);
      setExistingFiles(data);
    } catch (err) {
      toast.error(i18n.t("assistants.toasts.loadFilesError"));
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Gerenciar mudança de aba
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fechar o modal
  const handleClose = () => {
    onClose();
    setAssistant({
      openaiApiKey: "",
      name: "",
      instructions: "",
      model: "",
      active: true,
      tools: []
    });
    setFiles([]);
    setSelectedFiles([]);
    setExistingFiles([]);
    setTotalUploadSize(0);
    setUploadProgress(0);
    setTabValue(0);
    setTools([
      { type: "file_search", enabled: false },
      { type: "code_interpreter", enabled: false },
      { type: "function", enabled: false }
    ]);
    setFunctions([]);
  };

  // Salvar o assistente
  const handleSaveAssistant = async (values) => {
    try {
      // Preparar ferramentas
      const enabledTools = tools
        .filter(tool => tool.enabled)
        .map(tool => {
          if (tool.type === "function") {
            // Não adicionamos as funções aqui, serão adicionadas separadamente
            return null;
          }
          return { type: tool.type };
        })
        .filter(Boolean);
      
      // Criar ou atualizar o assistente
      let savedAssistant;
      if (assistantId) {
        const { data } = await api.put(`/assistants/${assistantId}`, {
          ...values,
          tools: enabledTools
        });
        savedAssistant = data;
      } else {
        const { data } = await api.post("/assistants", {
          ...values,
          tools: enabledTools
        });
        savedAssistant = data;
      }

      // Se ferramenta "function" estiver habilitada, enviar funções
      if (tools.find(t => t.type === "function" && t.enabled) && functions.length > 0) {
        await api.post(`/assistants/${savedAssistant.id}/functions`, {
          functions
        });
      }

      // Upload de arquivos
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          
          // Adicionar o tipo de ferramenta para o upload
          formData.append("toolType", selectedToolType);
          
          // Adicionar o arquivo ao FormData
          const fileToUpload = file.file || file;
          formData.append("file", fileToUpload);

          // Fazer upload do arquivo
          await api.post(`/assistants/${savedAssistant.id}/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
        }
      }

      toast.success(i18n.t("assistants.toasts.success"));
      handleClose();
      
      if (onAssistantUpdated) {
        onAssistantUpdated(savedAssistant);
      }
    } catch (err) {
      console.error(i18n.t("assistants.toasts.saveError"), err);
      toast.error(err.response?.data?.error || i18n.t("assistants.toasts.saveError"));
    }
  };

  // Gerenciar arquivos
  const handleDeleteFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setSelectedFiles(selectedFiles.filter(i => i !== index));
    
    // Recalcular tamanho total
    const newTotalSize = newFiles.reduce((acc, file) => {
      return acc + (file.size || 0);
    }, 0);
    
    setTotalUploadSize(newTotalSize);
    setUploadProgress((newTotalSize / (2048 * 1024)) * 100);
  };

  // Remover arquivo existente do assistente
  const handleDeleteExistingFile = async (fileId) => {
    try {
      await api.delete(`/assistants/${assistantId}/files/${fileId}`);
      
      // Atualizar lista de arquivos
      setExistingFiles(existingFiles.filter(file => file.id !== fileId));
      toast.success(i18n.t("assistants.toasts.fileRemoved"));
    } catch (err) {
      toast.error(i18n.t("assistants.toasts.fileRemoveError"));
      console.error(err);
    }
  };

  const handleSelectFile = (event, index) => {
    if (event.target.checked) {
      setSelectedFiles([...selectedFiles, index]);
    } else {
      setSelectedFiles(selectedFiles.filter(i => i !== index));
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedFiles(files.map((_, index) => index));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDeleteSelected = () => {
    const newFiles = files.filter((_, index) => !selectedFiles.includes(index));
    setFiles(newFiles);
    setSelectedFiles([]);
    
    // Recalcular tamanho total
    const newTotalSize = newFiles.reduce((acc, file) => {
      return acc + (file.size || 0);
    }, 0);
    
    setTotalUploadSize(newTotalSize);
    setUploadProgress((newTotalSize / (2048 * 1024)) * 100);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(Math.ceil(files.length / filesPerPage) - 1, prev + 1));
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const newTotalSize = [...files, ...newFiles].reduce((acc, file) => acc + file.size, 0);
    const maxSize = 2048 * 1024; // 2048KB em bytes

    if (newTotalSize > maxSize) {
      toast.error(i18n.t("assistants.toasts.fileSizeExceeded"));
      return;
    }

    setFiles(prevFiles => [
      ...prevFiles,
      ...newFiles.map(file => ({
        file,
        name: file.name,
        uploadDate: new Date().toLocaleString(),
        size: file.size
      }))
    ]);

    setTotalUploadSize(newTotalSize);
    setUploadProgress((newTotalSize / maxSize) * 100);
  };

  // Alternar ferramentas
  const handleToggleTool = (type) => {
    setTools(tools.map(tool => 
      tool.type === type ? { ...tool, enabled: !tool.enabled } : tool
    ));
  };

  // Alterar tipo de ferramenta para upload de arquivos
  const handleToolTypeChange = (event) => {
    setSelectedToolType(event.target.value);
  };

  const paginatedFiles = files.slice(currentPage * filesPerPage, (currentPage + 1) * filesPerPage);

  return (
    <Root>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <animated.div style={springProps}>
          <DialogTitle>
            {assistantId
              ? i18n.t("assistants.modal.title.edit")
              : i18n.t("assistants.modal.title.add")}
          </DialogTitle>
          
          <Formik
            initialValues={assistant}
            enableReinitialize={true}
            validationSchema={AssistantSchema}
            onSubmit={handleSaveAssistant}
          >
            {({ touched, errors, isSubmitting, values, setFieldValue }) => (
              <Form>
                <DialogContent dividers>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="assistant tabs"
                  >
                    <Tab label={i18n.t("assistants.tabs.basicSettings")} icon={<CodeIcon />} />
                    <Tab label={i18n.t("assistants.tabs.tools")} icon={<ToolsIcon />} />
                    <Tab label={i18n.t("assistants.tabs.files")} icon={<InsertDriveFileIcon />} />
                    <Tab label={i18n.t("assistants.tabs.functions")} icon={<FunctionsIcon />} />
                  </Tabs>
                  
                  {/* Aba de Configurações Básicas */}
                  <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label={i18n.t("assistants.form.openaiApiKey")}
                          name="openaiApiKey"
                          error={touched.openaiApiKey && errors.openaiApiKey}
                          helperText={touched.openaiApiKey && errors.openaiApiKey}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          type="password"
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label={i18n.t("assistants.form.name")}
                          name="name"
                          error={touched.name && errors.name}
                          helperText={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("assistants.form.instructions")}
                          name="instructions"
                          error={touched.instructions && errors.instructions}
                          helperText={touched.instructions && errors.instructions}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          multiline
                          rows={5}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Field name="model">
                          {({ field }) => (
                            <TextField
                              select
                              label={i18n.t("assistants.form.model")}
                              variant="outlined"
                              fullWidth
                              margin="dense"
                              error={touched.model && errors.model}
                              helperText={touched.model && errors.model}
                              {...field}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            >
                              {openAiModels.map((model) => (
                                <MenuItem key={model.modelCode} value={model.modelCode}>
                                  {model.displayName}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        </Field>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Field
                              as={Switch}
                              name="active"
                              color="primary"
                              checked={values.active}
                            />
                          }
                          label={i18n.t("assistants.form.active")}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {i18n.t("assistants.form.activeHelp")}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 4 }}>
    <Typography variant="h6" gutterBottom>
      {i18n.t("assistants.form.voiceSettings")}
    </Typography>
    
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Field
              as={Switch}
              name="enableVoiceResponses"
              color="primary"
              checked={values.enableVoiceResponses}
            />
          }
          label={i18n.t("assistants.form.enableVoiceResponses")}
        />
        <Typography variant="caption" color="textSecondary">
          {i18n.t("assistants.form.voiceResponsesHelp")}
        </Typography>
      </Grid>
      
      {values.enableVoiceResponses && (
        <>
          <Grid item xs={12} md={6}>
            <Field name="voiceId">
              {({ field }) => (
                <TextField
                  select
                  label={i18n.t("assistants.form.voiceId")}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  {...field}
                  InputLabelProps={{
                    shrink: true,
                  }}
                >
                  <MenuItem value="alloy">Alloy</MenuItem>
                  <MenuItem value="echo">Echo</MenuItem>
                  <MenuItem value="fable">Fable</MenuItem>
                  <MenuItem value="onyx">Onyx</MenuItem>
                  <MenuItem value="nova">Nova</MenuItem>
                  <MenuItem value="shimmer">Shimmer</MenuItem>
                </TextField>
              )}
            </Field>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Field name="voiceSpeed">
              {({ field, form }) => (
                <Box>
                  <Typography gutterBottom>
                    {i18n.t("assistants.form.voiceSpeed")}: {field.value}
                  </Typography>
                  <Slider
                    value={field.value}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    onChange={(_, value) => form.setFieldValue('voiceSpeed', value)}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </Field>
          </Grid>
        </>
      )}
    </Grid>
  </Box>
                  </TabPanel>
                  
                  {/* Aba de Ferramentas */}
                  <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>
                      {i18n.t("assistants.tools.availableTools")}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {tools.map((tool) => (
                        <Grid item xs={12} md={4} key={tool.type}>
                          <Card variant={tool.enabled ? "outlined" : "elevation"} 
                                sx={{ 
                                  borderColor: tool.enabled ? 'primary.main' : 'divider',
                                  transition: 'all 0.3s'
                                }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">
                                  {tool.type === "file_search" && i18n.t("assistants.tools.fileSearchFull")}
                                  {tool.type === "code_interpreter" && i18n.t("assistants.tools.codeInterpreterFull")}
                                  {tool.type === "function" && i18n.t("assistants.tools.functionFull")}
                                </Typography>
                                <Switch
                                  checked={tool.enabled}
                                  onChange={() => handleToggleTool(tool.type)}
                                  color="primary"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="textSecondary">
                                {tool.type === "file_search" && i18n.t("assistants.tools.fileSearchDescription")}
                                {tool.type === "code_interpreter" && i18n.t("assistants.tools.codeInterpreterDescription")}
                                {tool.type === "function" && i18n.t("assistants.tools.functionDescription")}
                              </Typography>
                              
                              {tool.enabled && (
                                <Box mt={2}>
                                  {tool.type === "file_search" && (
                                    <Typography variant="caption">
                                      {i18n.t("assistants.tools.fileSearchConfig")}
                                    </Typography>
                                  )}
                                  {tool.type === "code_interpreter" && (
                                    <Typography variant="caption">
                                      {i18n.t("assistants.tools.codeInterpreterConfig")}
                                    </Typography>
                                  )}
                                  {tool.type === "function" && (
                                    <Typography variant="caption">
                                      {i18n.t("assistants.tools.functionConfig")}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </TabPanel>
                  
                  {/* Aba de Arquivos */}
                  <TabPanel value={tabValue} index={2}>
                    <Box mb={3}>
                      <FormControl fullWidth variant="outlined" margin="dense">
                        <InputLabel id="tool-type-label">{i18n.t("assistants.form.toolType")}</InputLabel>
                        <Select
                          labelId="tool-type-label"
                          value={selectedToolType}
                          onChange={handleToolTypeChange}
                          label={i18n.t("assistants.form.toolType")}
                        >
                          <MenuItem value="file_search">{i18n.t("assistants.tools.fileSearchFull")}</MenuItem>
                          <MenuItem value="code_interpreter">{i18n.t("assistants.tools.codeInterpreterFull")}</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography variant="caption" color="textSecondary">
                        {i18n.t("assistants.form.toolTypeHelp")}
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                          <StyledButton
                            variant="contained"
                            component="label"
                            startIcon={<AddIcon />}
                            color="primary"
                          >
                            {i18n.t("assistants.form.addFiles")}
                            <input
                              type="file"
                              onChange={handleFileChange}
                              multiple
                              style={{ display: 'none' }}
                            />
                          </StyledButton>
                        </Box>
                        
                        {/* Lista de arquivos a serem enviados */}
                        {files.length > 0 && (
                          <>
                            <Typography variant="subtitle2" gutterBottom>
                              {i18n.t("assistants.form.newFiles")}
                            </Typography>
                            <FileListContainer>
                              {paginatedFiles.map((file, index) => (
                                <FileRow key={index} isSelected={selectedFiles.includes(currentPage * filesPerPage + index)}>
                                  <Checkbox
                                    className="checkbox"
                                    checked={selectedFiles.includes(currentPage * filesPerPage + index)}
                                    onChange={(event) => handleSelectFile(event, currentPage * filesPerPage + index)}
                                  />
                                  <Box display="flex" alignItems="center">
                                    <InsertDriveFileIcon sx={{ mr: 1, color: "primary.main" }} />
                                    <Typography variant="body2" noWrap>
                                      {file.name}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    className="delete-button"
                                    onClick={() => handleDeleteFile(currentPage * filesPerPage + index)}
                                    size="small"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </FileRow>
                              ))}
                            </FileListContainer>
                            
                            <NavigationContainer>
                              <Box>
                                <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
                                  <NavigateBeforeIcon />
                                </IconButton>
                                <IconButton 
                                  onClick={handleNextPage} 
                                  disabled={currentPage === Math.ceil(files.length / filesPerPage) - 1}
                                >
                                  <NavigateNextIcon />
                                </IconButton>
                              </Box>
                              <Box>
                                <Tooltip title={i18n.t("assistants.buttons.cancelSelection")}>
                                  <IconButton 
                                    onClick={() => setSelectedFiles([])} 
                                    disabled={selectedFiles.length === 0}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={i18n.t("assistants.buttons.deleteSelected")}>
                                  <IconButton 
                                    onClick={handleDeleteSelected} 
                                    disabled={selectedFiles.length === 0} 
                                    color="secondary"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </NavigationContainer>
                            
                            <ProgressContainer>
                              <LinearProgress variant="determinate" value={uploadProgress} />
                              <Typography variant="caption" align="right" display="block">
                                {(totalUploadSize / 1024).toFixed(2)} KB / 2048 KB
                              </Typography>
                            </ProgressContainer>
                          </>
                        )}
                        
                        {/* Lista de arquivos existentes */}
                        {assistantId && (
                          <Box mt={4}>
                            <Typography variant="subtitle2" gutterBottom>
                              {i18n.t("assistants.form.existingFiles")}
                            </Typography>
                            
                            {loadingFiles ? (
                              <CircularProgress size={24} />
                            ) : existingFiles.length > 0 ? (
                              <FileListContainer>
                                {existingFiles.map((file) => (
                                  <FileRow key={file.id} isSelected={false}>
                                    <Box width={40} />
                                    <Box display="flex" alignItems="center">
                                      <InsertDriveFileIcon sx={{ mr: 1, color: "primary.main" }} />
                                      <Box>
                                        <Typography variant="body2" noWrap>
                                          {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          {file.toolType === "file_search" ? i18n.t("assistants.tools.fileSearchFull") : i18n.t("assistants.tools.codeInterpreterFull")}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <IconButton
                                      onClick={() => handleDeleteExistingFile(file.id)}
                                      size="small"
                                      color="secondary"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </FileRow>
                                ))}
                              </FileListContainer>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("assistants.form.noFiles")}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </TabPanel>
                  
                  {/* Aba de Funções */}
                  <TabPanel value={tabValue} index={3}>
                    <FunctionsEditor 
                      functions={functions}
                      setFunctions={setFunctions}
                      disabled={!tools.find(t => t.type === "function" && t.enabled)}
                    />
                    
                    {!tools.find(t => t.type === "function" && t.enabled) && (
                      <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                        <Typography color="textSecondary">
                          {i18n.t("assistants.functions.enableFirst")}
                        </Typography>
                      </Box>
                    )}
                  </TabPanel>
                </DialogContent>
                
                <DialogActions>
                  <Button
                    onClick={handleClose}
                    color="secondary"
                    disabled={isSubmitting}
                    startIcon={<CancelIcon />}
                  >
                    {i18n.t("assistants.buttons.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >{assistantId
                    ? i18n.t("assistants.buttons.okEdit")
                    : i18n.t("assistants.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress size={24} sx={{ ml: 1 }} />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </animated.div>
    </Dialog>
  </Root>
);
};

export default AssistantModal;