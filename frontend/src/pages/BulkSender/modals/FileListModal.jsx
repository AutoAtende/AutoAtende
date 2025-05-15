import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "@mui/material/styles";
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
  Box
} from "@mui/material";

// Icons
import {
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon
} from "@mui/icons-material";

// API
import api from "../../../services/api";

const FileListModal = ({ open, onClose, file, onSave }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const companyId = user?.companyId;
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState("");
  
  // Efeito para carregar dados do arquivo quando abrir para edição
  useEffect(() => {
    if (open && file) {
      setName(file.name || "");
      setMessage(file.message || "");
    } else if (open && !file) {
      setName("");
      setMessage("");
    }
  }, [file, open]);

  // Validação de campos
  const validateFields = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError(i18n.t("files.validation.nameRequired"));
      isValid = false;
    } else if (name.length < 2) {
      setNameError(i18n.t("files.validation.nameMin"));
      isValid = false;
    } else if (name.length > 100) {
      setNameError(i18n.t("files.validation.nameMax"));
      isValid = false;
    } else {
      setNameError("");
    }
    
    return isValid;
  };

  // Handler de salvar
  const handleSave = async () => {
    if (!validateFields()) {
      return;
    }
    
    setLoading(true);
    try {
      const fileData = {
        name,
        message: message || "",
        options: []
      };
      
      let response;
      
      if (file?.id) {
        // Atualizar arquivo existente
        response = await api.put(`/files/${file.id}`, fileData);
        toast.success(i18n.t("files.toasts.updated"));
      } else {
        // Criar novo arquivo
        response = await api.post("/files", { ...fileData, companyId });
        toast.success(i18n.t("files.toasts.added"));
      }
      
      if (onSave) {
        onSave(response.data);
      }
      
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("files.toasts.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setMessage("");
      setNameError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
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
          onClick={handleClose}
          disabled={loading}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              label={i18n.t("files.modal.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!nameError}
              helperText={nameError}
              disabled={loading}
              variant="outlined"
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={i18n.t("files.modal.description")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              variant="outlined"
              multiline
              rows={4}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClose}
          disabled={loading}
        >
          {i18n.t("files.modal.cancel")}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {file?.id
            ? i18n.t("files.modal.saveChanges")
            : i18n.t("files.modal.add")
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileListModal;