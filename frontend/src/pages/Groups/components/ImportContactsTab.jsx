import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Alert,
  Divider,
  FormHelperText,
  Tooltip,
  IconButton
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  FilePresent as FileIcon,
  Help as HelpIcon,
  Download as DownloadIcon
} from "@mui/icons-material";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import BaseButton from "../../../components/shared/BaseButton";
import BasePageContent from "../../../components/shared/BasePageContent";

const ImportContactsTab = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const { data } = await api.get("/groups", {
        params: { searchParam: "", pageNumber: 1 }
      });
      setGroups(data.groups);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoadingGroups(false);
    }
  };
  
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleImportContacts = async () => {
    if (!selectedGroup) {
      toast.error(i18n.t("groups.errors.selectGroup"));
      return;
    }
    
    if (!selectedFile) {
      toast.error(i18n.t("groups.errors.selectFile"));
      return;
    }
    
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      toast.error(i18n.t("groups.errors.invalidFileFormat"));
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const companyId = localStorage.getItem('companyId');
      const socket = window.socket;
      
      const handleImportProgress = (data) => {
        if (data.action === "running") {
          setUploadProgress(data.result.message);
        } else if (data.action === "complete") {
          setResult({
            status: "success",
            message: i18n.t("groups.importSuccess", { 
              valid: data.result.whatsappValids,
              invalid: data.result.whatsappInValids.length
            }),
            invalidNumbers: data.result.whatsappInValids
          });
          setUploadProgress(null);
        }
      };
      
      socket.on(`company-${companyId}-upload-contact-${selectedGroup}`, handleImportProgress);
      
      await api.post(`/groups/${selectedGroup}/upload-contacts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return () => {
        socket.off(`company-${companyId}-upload-contact-${selectedGroup}`, handleImportProgress);
      };
      
    } catch (err) {
      toast.error(err);
      setResult({
        status: "error",
        message: i18n.t("groups.errors.importFailed")
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    const csvContent = "numero\n5511999999999\n5511888888888";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contatos_modelo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedGroup("");
    setSelectedFile(null);
    setResult(null);
    setUploadProgress(null);
  };
  
  return (
    <BasePageContent>
      <Paper variant="outlined" sx={{ p: 3, m: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {i18n.t("groups.importContacts")}
          </Typography>
          
          <Tooltip title={i18n.t("groups.downloadTemplate")}>
            <BaseButton
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              {i18n.t("groups.template")}
            </BaseButton>
          </Tooltip>
        </Box>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          {i18n.t("groups.importContactsDescription")}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{i18n.t("groups.selectGroup")}</InputLabel>
            <Select
              value={selectedGroup}
              onChange={handleGroupChange}
              label={i18n.t("groups.selectGroup")}
              disabled={loading || loadingGroups}
            >
              {loadingGroups ? (
                <MenuItem value="" disabled>
                  <CircularProgress size={20} /> {i18n.t("loading")}
                </MenuItem>
              ) : (
                groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.subject || group.name}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {i18n.t("groups.selectGroupHelp")}
            </FormHelperText>
          </FormControl>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <BaseButton
              variant="outlined"
              component="label"
              startIcon={selectedFile ? <FileIcon /> : <UploadIcon />}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {selectedFile ? selectedFile.name : i18n.t("groups.selectFile")}
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </BaseButton>
            
            <Tooltip title={i18n.t("groups.fileFormatInfo")}>
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <BaseButton
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            onClick={handleImportContacts}
            disabled={loading || !selectedGroup || !selectedFile}
            fullWidth
          >
            {loading ? i18n.t("loading") : i18n.t("groups.importContacts")}
          </BaseButton>
        </Box>
        
        {uploadProgress && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {uploadProgress}
          </Alert>
        )}
        
        {result && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Alert 
              severity={result.status === "success" ? "success" : "error"}
              sx={{ mb: 2 }}
              action={
                result.status === "success" && (
                  <BaseButton
                    variant="outlined"
                    size="small"
                    onClick={handleReset}
                  >
                    Nova Importação
                  </BaseButton>
                )
              }
            >
              {result.message}
            </Alert>
            
            {result.status === "success" && result.invalidNumbers && result.invalidNumbers.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {i18n.t("groups.invalidNumbers")}:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: '150px', overflow: 'auto' }}>
                  {result.invalidNumbers.map((number, index) => (
                    <Typography key={index} variant="body2" component="div">
                      {number}
                    </Typography>
                  ))}
                </Paper>
              </Box>
            )}
          </>
        )}
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {i18n.t("groups.importTips")}:
          </Typography>
          <Box component="ul" sx={{ margin: '8px 0', paddingLeft: '20px' }}>
            <Typography component="li" variant="body2">
              {i18n.t("groups.importTip1")}
            </Typography>
            <Typography component="li" variant="body2">
              {i18n.t("groups.importTip2")}
            </Typography>
            <Typography component="li" variant="body2">
              {i18n.t("groups.importTip3")}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </BasePageContent>
  );
};

export default ImportContactsTab;