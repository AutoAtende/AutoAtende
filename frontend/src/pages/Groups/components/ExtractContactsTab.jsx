import React, { useState } from "react";
import {
  Box,
  TextField,
  CircularProgress,
  InputAdornment,
  Snackbar,
  FormControl,
  FormLabel,
  FormHelperText,
  Typography,
  ListItemIcon
} from "@mui/material";
import {
  CloudDownload as ExtractIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from "@mui/icons-material";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import BaseButton from "../../../components/shared/BaseButton";
import StandardTabContent from "../../../components/shared/StandardTabContent";

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

  // Configuração dos alertas
  const alerts = [];

  if (result) {
    alerts.push({
      severity: result.status === "success" ? "success" : "error",
      title: result.status === "success" ? "Extração Concluída" : "Erro na Extração",
      message: result.message,
      action: result.status === "success" ? (
        <BaseButton
          variant="outlined"
          size="small"
          onClick={handleReset}
        >
          Nova Extração
        </BaseButton>
      ) : null
    });
  }

  // Ações do cabeçalho
  const actions = (
    <Box display="flex" gap={1}>
      {result?.status === "success" && downloadUrl && (
        <>
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
          
          <BaseButton
            variant="outlined"
            size="small"
            startIcon={<CopyIcon />}
            onClick={handleCopyLink}
          >
            Copiar Link
          </BaseButton>
        </>
      )}
    </Box>
  );

  return (
    <StandardTabContent
      title={i18n.t("groups.extractContacts")}
      description={i18n.t("groups.extractContactsDescription")}
      icon={<ExtractIcon />}
      alerts={alerts}
      actions={result?.status === "success" ? actions : null}
      variant="padded"
    >
      <Box sx={{ maxWidth: 600 }}>
        {/* Formulário de Extração */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel sx={{ mb: 1 }}>
            {i18n.t("groups.groupInviteLink")}
          </FormLabel>
          <TextField
            fullWidth
            placeholder="https://chat.whatsapp.com/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={loading}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <FormHelperText>
            Cole aqui o link de convite do grupo do WhatsApp
          </FormHelperText>
        </FormControl>

        {/* Botão de Extração */}
        <BaseButton
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ExtractIcon />}
          onClick={handleExtractContacts}
          disabled={loading || !link}
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {loading ? i18n.t("loading") : i18n.t("groups.extractContacts")}
        </BaseButton>

        {/* Informações Adicionais */}
        <Box 
          sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'info.light', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'info.main'
          }}
        >
          <Box display="flex" alignItems="flex-start" gap={1}>
            <InfoIcon color="info" sx={{ mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" color="info.dark" gutterBottom>
                Como funciona a extração:
              </Typography>
              <Box component="ul" sx={{ 
                margin: 0, 
                paddingLeft: 2,
                '& li': {
                  fontSize: '0.875rem',
                  color: 'info.dark',
                  mb: 0.5
                }
              }}>
                <li>Cole o link de convite do grupo do WhatsApp</li>
                <li>O sistema extrairá automaticamente todos os contatos</li>
                <li>Você receberá um arquivo Excel com os números</li>
                <li>O processo pode levar alguns minutos dependendo do tamanho do grupo</li>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={i18n.t("groups.linkCopied")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </StandardTabContent>
  );
};

export default ExtractContactsTab;