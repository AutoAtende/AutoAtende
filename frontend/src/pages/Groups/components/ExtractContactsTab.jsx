import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Snackbar
} from "@mui/material";
import {
  CloudDownload as ExtractIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import BaseButton from "../../../components/shared/BaseButton";
import BasePageContent from "../../../components/shared/BasePageContent";

const ExtractContactsTab = () => {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleExtractContacts = async () => {
    if (!link) {
      toast.error(i18n.t("groups.errors.linkRequired"));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/groups/${localStorage.getItem('companyId')}/extract-contacts`, {
        link
      });
      
      const companyId = localStorage.getItem('companyId');
      const socket = window.socket;
      
      const handleExtractResult = (data) => {
        if (data.action === "success") {
          setResult({
            status: "success",
            message: data.result.message
          });
          
          fetchDownloadUrl();
        } else if (data.action === "error") {
          setResult({
            status: "error",
            message: data.result.message
          });
        }
      };
      
      socket.on(`company-${companyId}-extract-contact-${link?.trim()}`, handleExtractResult);
      
      return () => {
        socket.off(`company-${companyId}-extract-contact-${link?.trim()}`, handleExtractResult);
      };
      
    } catch (err) {
      toast.error(err);
      setResult({
        status: "error",
        message: i18n.t("groups.errors.extractFailed")
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadUrl = async () => {
    try {
      const { data } = await api.post(`/groups/${localStorage.getItem('companyId')}/get-excel-file`, {
        link
      });
      
      if (data) {
        setDownloadUrl(data);
      }
    } catch (err) {
      console.error("Error fetching download URL:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setOpenSnackbar(true);
  };

  const handleReset = () => {
    setLink("");
    setResult(null);
    setDownloadUrl("");
  };

  return (
    <BasePageContent>
      <Paper variant="outlined" sx={{ p: 3, m: 2 }}>
        <Typography variant="h6" gutterBottom>
          {i18n.t("groups.extractContacts")}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          {i18n.t("groups.extractContactsDescription")}
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 3, gap: 1 }}>
          <TextField
            fullWidth
            label={i18n.t("groups.groupInviteLink")}
            placeholder="https://chat.whatsapp.com/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={loading}
            variant="outlined"
          />
          <BaseButton
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <ExtractIcon />}
            onClick={handleExtractContacts}
            disabled={loading || !link}
            sx={{ minWidth: '180px' }}
          >
            {loading ? i18n.t("loading") : i18n.t("groups.extractContacts")}
          </BaseButton>
        </Box>
        
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
                    Nova Extração
                  </BaseButton>
                )
              }
            >
              {result.message}
            </Alert>
            
            {result.status === "success" && downloadUrl && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <BaseButton
                  variant="outlined"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18n.t("groups.downloadExcel")}
                </BaseButton>
                
                <Tooltip title={i18n.t("groups.copyDownloadLink")}>
                  <IconButton onClick={handleCopyLink} sx={{ ml: 1 }}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <InfoIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            {i18n.t("groups.extractContactsInfo")}
          </Typography>
        </Box>
        
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          message={i18n.t("groups.linkCopied")}
        />
      </Paper>
    </BasePageContent>
  );
};

export default ExtractContactsTab;