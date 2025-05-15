import React, { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";

// Material UI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Paper
} from "@mui/material";

// Icons
import {
  Close as CloseIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";

// API
import api from "../../../services/api";

// Schema de validação
const FileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("files.validation.nameMin"))
    .max(100, i18n.t("files.validation.nameMax"))
    .required(i18n.t("files.validation.nameRequired")),
  message: Yup.string()
    .max(500, i18n.t("files.validation.descriptionMax"))
});

const FileModal = ({ open, onClose, file, onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const companyId = user?.companyId;
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = React.useRef(null);
  
  // Formulário
  const formik = useFormik({
    initialValues: {
      name: "",
      message: "",
      options: []
    },
    validationSchema: FileSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const fileData = {
          name: values.name,
          message: values.message || "",
          options: values.options || [],
          companyId
        };
        
        let response;
        
        if (file?.id) {
          // Atualizar arquivo existente
          response = await api.put(`/files/${file.id}`, fileData);
          toast.success(i18n.t("files.toasts.updated"));
        } else {
          // Criar novo arquivo
          response = await api.post("/files", fileData);
          toast.success(i18n.t("files.toasts.added"));
        }
        
        // Se tiver novo upload de arquivo, enviar para o endpoint correto
        if (uploadFile && response.data && response.data.id) {
          const formData = new FormData();
          // Usando 'files' (plural) conforme configurado no backend
          formData.append("files", uploadFile);
          
          // Simplificando os parâmetros para focar no essencial
          formData.append("typeArch", "fileList");
          
          try {
            const uploadResponse = await api.post(`/files/uploadList/${response.data.id}`, formData);
            console.log("Upload realizado com sucesso:", uploadResponse.data);
          } catch (err) {
            console.error("Erro ao fazer upload do arquivo:", err);
            toast.error("Erro ao fazer upload do arquivo. Tente novamente.");
          }
        }
        
        if (onSave) {
          onSave();
        }
        
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(i18n.t("files.toasts.error"));
      } finally {
        setLoading(false);
      }
    }
  });

  // Carregar dados do arquivo para edição
  useEffect(() => {
    if (open && file) {
      formik.setValues({
        name: file.name || "",
        message: file.message || "",
        options: file.options || []
      });
      
      if (file.path) {
        setPreviewUrl(`/files/${file.path}`);
      }
    } else if (open && !file) {
      formik.resetForm();
      setUploadFile(null);
      setPreviewUrl("");
    }
  }, [file, open]);

  // Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setUploadFile(selectedFile);
    
    // Criar URL para preview
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
    
    // Atualizar nome se não tiver sido preenchido
    if (!formik.values.name || formik.values.name === "") {
      formik.setFieldValue("name", selectedFile.name);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Verificar se é um tipo de arquivo com preview
  const isImageFile = () => {
    if (uploadFile && uploadFile.type.startsWith('image/')) {
      return true;
    }
    
    if (file && file.type && file.type.startsWith('image/')) {
      return true;
    }
    
    return false;
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFileIcon />
          <Typography variant="h6">
            {file?.id
              ? i18n.t("files.modal.editTitle") 
              : i18n.t("files.modal.addTitle")
            }
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                fullWidth
                label={i18n.t("files.modal.name")}
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={loading}
                variant="outlined"
                required
                margin="normal"
              />
              
              <TextField
                fullWidth
                label={i18n.t("files.modal.description")}
                name="message"
                value={formik.values.message}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.message && Boolean(formik.errors.message)}
                helperText={formik.touched.message && formik.errors.message}
                disabled={loading}
                variant="outlined"
                multiline
                rows={4}
                margin="normal"
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {(!file || !file.id) && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    fullWidth
                  >
                    {i18n.t("files.buttons.selectFile")}
                  </Button>
                  
                  {uploadFile && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFileIcon color="primary" fontSize="small" />
                        <Typography variant="body2" noWrap sx={{ maxWidth: '180px' }}>
                          {uploadFile.name}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={handleRemoveFile}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t("files.modal.preview")}
              </Typography>
              
              <Paper
                variant="outlined"
                sx={{
                  height: 300,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  p: 2
                }}
              >
                {previewUrl ? (
                  isImageFile() ? (
                    <img
                      src={previewUrl}
                      alt={formik.values.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <AttachFileIcon fontSize="large" color="primary" />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {uploadFile?.name || file?.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {uploadFile ? 
                          `${(uploadFile.size / 1024).toFixed(2)} KB` : 
                          file?.size ? `${(file.size / 1024).toFixed(2)} KB` : ''
                        }
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Typography color="textSecondary">
                    {i18n.t("files.modal.noPreview")}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {i18n.t("files.modal.cancel")}
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || (!file && !uploadFile)}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {file?.id
              ? i18n.t("files.modal.saveChanges")
              : i18n.t("files.modal.add")
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FileModal;