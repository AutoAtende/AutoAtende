// src/pages/BulkSender/tabs/FilesTab.jsx
import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";

// Material UI
import {
  Box,
  Paper,
  Chip,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

// Icons
import {
  Search as SearchIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";

// Componentes
import BaseEmptyState from "../../../components/BaseEmptyState";
import BaseButton from "../../../components/BaseButton";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import FilePreviewModal from "../modals/FilePreviewModal";

// API
import api from "../../../services/api";

// Reducer para gerenciar as listas de arquivos
const fileListsReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_FILELISTS":
      return action.payload;
    case "ADD_FILELIST":
      return [action.payload, ...state];
    case "UPDATE_FILELIST":
      return state.map(fileList => 
        fileList.id === action.payload.id ? action.payload : fileList
      );
    case "DELETE_FILELIST":
      return state.filter(fileList => fileList.id !== action.payload);
    default:
      return state;
  }
};

const FilesTab = ({ searchParam = "" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const companyId = user?.companyId;
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [localSearchParam, setLocalSearchParam] = useState("");
  const [fileLists, dispatch] = useReducer(fileListsReducer, []);
  const [selectedFileList, setSelectedFileList] = useState(null);
  const [expandedFileList, setExpandedFileList] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = React.useRef(null);
  
  // Estados para o modal de preview e exclusão de arquivo
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Usar searchParam de props se existir
  useEffect(() => {
    if (searchParam) {
      setLocalSearchParam(searchParam);
    }
  }, [searchParam]);

  // Socket listeners
  useEffect(() => {
    if (!companyId) return;
    
    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;
    
    const handleFileListUpdate = (data) => {
      if (!data) return;
      
      if (data.action === "create" || data.action === "update") {
        dispatch({ 
          type: data.action === "create" ? "ADD_FILELIST" : "UPDATE_FILELIST", 
          payload: data.fileList 
        });
      } else if (data.action === "delete") {
        dispatch({ type: "DELETE_FILELIST", payload: data.fileId });
        if (expandedFileList === data.fileId) {
          setExpandedFileList(null);
        }
      }
    };

    socket.on(`company${companyId}-file`, handleFileListUpdate);

    return () => {
      socket.off(`company${companyId}-file`, handleFileListUpdate);
    };
  }, [companyId, socketManager, expandedFileList]);

  // Fetch de listas de arquivos
  const fetchFileLists = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const { data } = await api.get("/files", {
        params: { 
          searchParam: searchParam || localSearchParam, 
          pageNumber,
          companyId
        }
      });
      
      dispatch({ type: "LOAD_FILELISTS", payload: data.files || [] });
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("files.toasts.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [searchParam, localSearchParam, pageNumber, companyId]);

  // Efeito para buscar listas de arquivos quando os parâmetros mudam
  useEffect(() => {
    fetchFileLists();
  }, [fetchFileLists]);

  // Handlers
  const handleSearch = (e) => {
    setLocalSearchParam(e.target.value.toLowerCase());
    setPageNumber(1);
  };

  const handleDeleteFileList = async () => {
    if (!selectedFileList) return;
    
    try {
      await api.delete(`/files/${selectedFileList.id}`);
      toast.success(i18n.t("files.toasts.deleted"));
      dispatch({ type: "DELETE_FILELIST", payload: selectedFileList.id });
      
      if (expandedFileList === selectedFileList.id) {
        setExpandedFileList(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("files.toasts.deleteError"));
    } finally {
      setDeleteModalOpen(false);
      setSelectedFileList(null);
    }
  };

  const handleExpandFileList = (fileListId) => {
    setExpandedFileList(expandedFileList === fileListId ? null : fileListId);
  };

  const handleSaveFileList = async () => {
    if (!newListName.trim()) {
      toast.error(i18n.t("files.validation.nameRequired"));
      return;
    }

    try {
      setLoading(true);
      const fileData = {
        name: newListName,
        message: newListDescription || "",
        companyId
      };
      
      let response;
      
      if (selectedFileList?.id) {
        // Atualizar lista existente
        response = await api.put(`/files/${selectedFileList.id}`, fileData);
        toast.success(i18n.t("files.toasts.updated"));
      } else {
        // Criar nova lista
        response = await api.post("/files", fileData);
        toast.success(i18n.t("files.toasts.added"));
      }

      fetchFileLists();
      setFileModalOpen(false);
      setNewListName("");
      setNewListDescription("");
      setSelectedFileList(null);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("files.toasts.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFileModal = (fileList = null) => {
    if (fileList) {
      setSelectedFileList(fileList);
      setNewListName(fileList.name || "");
      setNewListDescription(fileList.message || "");
    } else {
      setSelectedFileList(null);
      setNewListName("");
      setNewListDescription("");
    }
    setFileModalOpen(true);
  };

  const handleCloseFileModal = () => {
    if (!loading) {
      setFileModalOpen(false);
      setNewListName("");
      setNewListDescription("");
      setSelectedFileList(null);
    }
  };

  // Função para upload de arquivos
  const handleFileUpload = async (e, fileListId) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !fileListId) {
      return;
    }

    try {
      setUploadLoading(true);
      
      // Preparar FormData para múltiplos arquivos
      const formData = new FormData();
      
      // Adicionar todos os arquivos
      Array.from(files).forEach(file => {
        formData.append("files", file); 
      });
      
      // Adicionar parâmetros necessários
      formData.append("typeArch", "fileList");
      formData.append("fileId", fileListId);
      
      await api.post(`/files/uploadList/${fileListId}`, formData);
      
      toast.success(
        files.length > 1 
          ? i18n.t("files.toasts.filesAddedToList", { count: files.length })
          : i18n.t("files.toasts.fileAddedToList")
      );
      
      // Atualizar a lista após o upload
      fetchFileLists();
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      toast.error(
        files.length > 1
          ? i18n.t("files.toasts.uploadMultipleError")
          : i18n.t("files.toasts.uploadError")
      );
    } finally {
      setUploadLoading(false);
      // Resetar o input para permitir selecionar o mesmo arquivo novamente
      setFileInputKey(Date.now());
    }
  };

  // Função para excluir um arquivo específico
  const handleDeleteFile = async () => {
    if (!selectedFile || !selectedFile.id) return;
    
    try {
      // Remover opção de arquivo
      await api.delete(`/files/option/${selectedFile.id}`);
      
      toast.success(i18n.t("files.toasts.fileDeleted"));
      fetchFileLists();
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("files.toasts.deleteFileError"));
    } finally {
      setDeleteFileModalOpen(false);
      setSelectedFile(null);
    }
  };

  // Função para abrir o modal de preview
  const handlePreviewFile = (fileList, file) => {
    const fileData = {
      ...file,
      companyId,
      fileId: fileList.id,
      name: file.name || file.path
    }
    setSelectedFile(fileData);
    setPreviewModalOpen(true);
  };

  // Funções auxiliares para renderização
  const getFileIcon = (file) => {
    if (!file || !file.mediaType) return <DescriptionIcon color="info" />;
    
    const mediaType = file.mediaType.toLowerCase();
    
    if (mediaType.includes('image')) {
      return <ImageIcon color="primary" />;
    } else if (mediaType.includes('pdf')) {
      return <PdfIcon color="error" />;
    } else {
      return <DescriptionIcon color="info" />;
    }
  };

  const getFileUrl = (fileList, file) => {
    if (!file || !file.path) return '#';
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
    return `${backendUrl}/public/company${companyId}/fileList/${fileList.id}/${file.path}`;
  };

  // Renderização condicional para estado vazio
  if (!loading && fileLists.length === 0 && !searchParam && !localSearchParam) {
    return (
      <Box sx={{ p: 0, height: '100%' }}>
        <BaseEmptyState
          icon={<AttachFileIcon sx={{ fontSize: 40 }} />}
          title={i18n.t("files.empty.title")}
          message={i18n.t("files.empty.message")}
          buttonText={i18n.t("files.buttons.addList")}
          onAction={() => handleOpenFileModal()}
          showButton={true}
        />

        {/* Modal para criar/editar lista de arquivos */}
        <Dialog
          open={fileModalOpen}
          onClose={handleCloseFileModal}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {selectedFileList ? 
              i18n.t("files.modal.editTitle") : 
              i18n.t("files.modal.addTitle")
            }
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={i18n.t("files.modal.name")}
              fullWidth
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              variant="outlined"
              required
            />
            <TextField
              margin="dense"
              label={i18n.t("files.modal.description")}
              fullWidth
              multiline
              rows={4}
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <BaseButton onClick={handleCloseFileModal} color="secondary">
              {i18n.t("files.modal.cancel")}
            </BaseButton>
            <BaseButton 
              onClick={handleSaveFileList} 
              color="primary"
              disabled={loading}
              variant="contained"
            >
              {loading ? 
                <CircularProgress size={24} /> : 
                selectedFileList ? 
                  i18n.t("files.modal.saveChanges") : 
                  i18n.t("files.modal.add")
              }
            </BaseButton>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Barra de ferramentas */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 2,
        gap: 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        <TextField
          placeholder={i18n.t("files.searchPlaceholder")}
          variant="outlined"
          size="small"
          value={localSearchParam}
          onChange={handleSearch}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        
        <BaseButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenFileModal()}
        >
          {i18n.t("files.buttons.addList")}
        </BaseButton>
      </Box>

      {/* Conteúdo principal - Listas de arquivos */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        ...theme.scrollbarStyles
      }}>
        {loading && fileLists.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : fileLists.length === 0 ? (
          <Box sx={{ p: a4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {i18n.t("files.noResults")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fileLists.map((fileList) => (
              <Paper
                key={fileList.id}
                variant="outlined"
                sx={{
                  overflow: 'hidden'
                }}
              >
                {/* Cabeçalho da lista de arquivos */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: expandedFileList === fileList.id ? theme.palette.action.selected : 'inherit',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover
                  }
                }}
                onClick={() => handleExpandFileList(fileList.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={500}>
                      {fileList.name}
                    </Typography>
                    <Chip 
                      label={fileList.options?.length || 0}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={i18n.t("files.tooltips.edit")}>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFileModal(fileList);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={i18n.t("files.tooltips.delete")}>
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFileList(fileList);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {expandedFileList === fileList.id ? 
                      <ExpandLessIcon /> : 
                      <ExpandMoreIcon />
                    }
                  </Box>
                </Box>
                
                {/* Conteúdo expandido - Upload de arquivos */}
                <Collapse in={expandedFileList === fileList.id}>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <input
                      id={`file-upload-${fileList.id}`}
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e, fileList.id)}
                      style={{ display: 'none' }}
                      key={`${fileInputKey}-${fileList.id}`}
                    />
                    <BaseButton
                      variant="contained"
                      color="primary"
                      startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                      onClick={() => document.getElementById(`file-upload-${fileList.id}`).click()}
                      disabled={uploadLoading}
                    >
                      {i18n.t("files.buttons.uploadFile")}
                    </BaseButton>

                    {/* Lista de arquivos dentro da lista */}
                    {fileList.options && fileList.options.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {i18n.t("files.filesList")}
                        </Typography>
                        <Paper variant="outlined">
                          <Box sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 1
                          }}>
                            {fileList.options.map((option) => (
                              <Box 
                                key={option.id}
                                sx={{
                                  p: 1.5, 
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 1,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  '&:hover': {
                                    bgcolor: theme.palette.action.hover
                                  }
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1, 
                                    flexGrow: 1,
                                    cursor: 'pointer' 
                                  }}
                                  onClick={() => handlePreviewFile(fileList, option)}
                                >
                                  {getFileIcon(option)}
                                  <Typography variant="body2" noWrap sx={{ maxWidth: { xs: '120px', sm: '180px' } }}>
                                    {option.name || option.path}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title={i18n.t("files.tooltips.view")}>
                                    <IconButton 
                                      size="small"
                                      onClick={() => handlePreviewFile(fileList, option)}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={i18n.t("files.tooltips.download")}>
                                    <IconButton 
                                      size="small"
                                      component="a"
                                      href={getFileUrl(fileList, option)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={i18n.t("files.tooltips.delete")}>
                                    <IconButton 
                                      size="small"
                                      color="error"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(option);
                                        setDeleteFileModalOpen(true);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                          {i18n.t("files.emptyFileList")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            ))}
            
            {loading && fileLists.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Modal para criar/editar lista de arquivos */}
      <Dialog
        open={fileModalOpen}
        onClose={handleCloseFileModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedFileList ? 
            i18n.t("files.modal.editTitle") : 
            i18n.t("files.modal.addTitle")
          }
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={i18n.t("files.modal.name")}
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            variant="outlined"
            required
          />
          <TextField
            margin="dense"
            label={i18n.t("files.modal.description")}
            fullWidth
            multiline
            rows={4}
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <BaseButton onClick={handleCloseFileModal} color="secondary">
            {i18n.t("files.modal.cancel")}
          </BaseButton>
          <BaseButton 
            onClick={handleSaveFileList} 
            color="primary"
            disabled={loading}
            variant="contained"
          >
            {loading ? 
              <CircularProgress size={24} /> : 
              selectedFileList ? 
                i18n.t("files.modal.saveChanges") : 
                i18n.t("files.modal.add")
            }
          </BaseButton>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão de lista */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedFileList(null);
        }}
        onConfirm={handleDeleteFileList}
        title={i18n.t("files.deleteDialog.title")}
        message={i18n.t("files.deleteDialog.message")}
        itemName={selectedFileList?.name}
        itemType="fileList"
      />

      {/* Modal de confirmação de exclusão de arquivo */}
      <DeleteConfirmationModal
        open={deleteFileModalOpen}
        onClose={() => {
          setDeleteFileModalOpen(false);
          setSelectedFile(null);
        }}
        onConfirm={handleDeleteFile}
        title={i18n.t("files.deleteFileDialog.title")}
        message={i18n.t("files.deleteFileDialog.message")}
        itemName={selectedFile?.path}
        itemType="file"
      />

      {/* Modal de visualização de arquivo */}
      <FilePreviewModal
        open={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
      />
    </Paper>
  );
};

export default FilesTab;


