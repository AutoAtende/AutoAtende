import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  Grid, 
  Typography, 
  TextField, 
  IconButton, 
  InputAdornment, 
  Card,
  CardContent,
  Box,
  Stack,
  Alert,
  CircularProgress
} from "@mui/material";
import { 
  AttachFile as AttachFileIcon, 
  Delete as DeleteIcon,
  Description as FileIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon
} from "@mui/icons-material";

import StandardTabContent from "../../../../components/shared/StandardTabContent";
import BaseButton from "../../../../components/shared/BaseButton";
import { toast } from "../../../../helpers/toast";
import useSettings from "../../../../hooks/useSettings";
import api from "../../../../services/api";

const EfiSettings = ({ settings }) => {
  const [efiSettings, setEfiSettings] = useState({
    efiCertFile: "",
    efiClientId: "",
    efiClientSecret: "",
    efiPixKey: ""
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);
  const { update } = useSettings();

  // Carregar configurações iniciais
  useEffect(() => {
    if (Array.isArray(settings)) {
      const newSettings = {};
      settings.forEach((setting) => {
        if (setting.key.startsWith("_efi")) {
          newSettings[setting.key.substring(1)] = setting.value;
        }
      });
      setEfiSettings(prev => ({ ...prev, ...newSettings }));
    }
  }, [settings]);

  // Upload do certificado
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("settingKey", "efiCertFile");

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await api.post("/settings/privateFile", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setEfiSettings(prev => ({ ...prev, efiCertFile: response.data }));
      await update({ key: "_efiCertFile", value: response.data });
      toast.success("Certificado enviado com sucesso");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar certificado");
    } finally {
      setLoading(false);
      setUploadProgress(0);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [update]);

  // Remover certificado
  const handleRemoveCertificate = useCallback(async () => {
    try {
      setLoading(true);
      setEfiSettings(prev => ({ ...prev, efiCertFile: "" }));
      await update({ key: "_efiCertFile", value: "" });
      toast.success("Certificado removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover certificado:", error);
      toast.error("Erro ao remover certificado");
    } finally {
      setLoading(false);
    }
  }, [update]);

  // Salvar configuração de texto
  const handleSaveTextSetting = useCallback(async (key, value) => {
    if (typeof value !== "string") return;
    
    try {
      await update({ key: `_${key}`, value });
      toast.success("Configuração salva com sucesso");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    }
  }, [update]);

  // Handler para mudança de texto
  const handleTextChange = useCallback((key) => (event) => {
    const value = event.target.value;
    setEfiSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handler para salvar ao sair do campo
  const handleTextBlur = useCallback((key) => () => {
    handleSaveTextSetting(key, efiSettings[key]);
  }, [efiSettings, handleSaveTextSetting]);

  const instructions = [
    "Acesse o painel da Efí (Gerencianet) em https://dev.gerencianet.com.br",
    "Vá para 'Aplicações' > 'Minhas Aplicações' > 'Nova Aplicação'",
    "Configure os endpoints necessários (PIX, Cobranças, etc.)",
    "Faça o download do certificado (.p12) gerado",
    "Copie o Client ID e Client Secret da aplicação",
    "Configure sua chave PIX no painel da Efí",
    "Preencha os campos abaixo com as informações obtidas"
  ];

  return (
    <StandardTabContent
      title="Configurações Efí (Gerencianet)"
      description="Configure as credenciais para integração com o gateway Efí"
      variant="padded"
    >
      <Grid container spacing={3}>
        {/* Formulário de configurações */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Credenciais da API
              </Typography>
              
              <Stack spacing={3}>
                {/* Upload do Certificado */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Certificado (.p12)
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      border: 2, 
                      borderColor: efiSettings.efiCertFile ? 'success.main' : 'divider',
                      borderStyle: 'dashed',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      bgcolor: efiSettings.efiCertFile ? 'success.light' : 'background.default',
                      transition: 'all 0.2s'
                    }}
                  >
                    {loading && uploadProgress > 0 ? (
                      <Box>
                        <CircularProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Enviando... {uploadProgress}%
                        </Typography>
                      </Box>
                    ) : efiSettings.efiCertFile ? (
                      <Box>
                        <CheckIcon color="success" sx={{ fontSize: 40 }} />
                        <Typography variant="body2" color="success.main" gutterBottom>
                          Certificado enviado com sucesso
                        </Typography>
                        <BaseButton
                          variant="outlined"
                          color="error"
                          size="small"
                          icon={<DeleteIcon />}
                          onClick={handleRemoveCertificate}
                          disabled={loading}
                        >
                          Remover
                        </BaseButton>
                      </Box>
                    ) : (
                      <Box>
                        <FileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Clique para selecionar o certificado .p12
                        </Typography>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".p12"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                        <BaseButton
                          variant="outlined"
                          icon={<AttachFileIcon />}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                        >
                          Selecionar Arquivo
                        </BaseButton>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Client ID */}
                <TextField
                  fullWidth
                  label="Client ID"
                  placeholder="Client_Id_xxxxxxxxxxxxx"
                  value={efiSettings.efiClientId || ""}
                  onChange={handleTextChange("efiClientId")}
                  onBlur={handleTextBlur("efiClientId")}
                  variant="outlined"
                  helperText="Identificador da aplicação obtido no painel da Efí"
                />

                {/* Client Secret */}
                <TextField
                  fullWidth
                  label="Client Secret"
                  placeholder="Client_Secret_xxxxxxxxxxxxx"
                  type="password"
                  value={efiSettings.efiClientSecret || ""}
                  onChange={handleTextChange("efiClientSecret")}
                  onBlur={handleTextBlur("efiClientSecret")}
                  variant="outlined"
                  helperText="Chave secreta da aplicação obtida no painel da Efí"
                />

                {/* Chave PIX */}
                <TextField
                  fullWidth
                  label="Chave PIX"
                  placeholder="exemplo@email.com ou +5511999999999"
                  value={efiSettings.efiPixKey || ""}
                  onChange={handleTextChange("efiPixKey")}
                  onBlur={handleTextBlur("efiPixKey")}
                  variant="outlined"
                  helperText="Chave PIX configurada na sua conta Efí"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Instruções */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Instruções de Configuração
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Siga os passos abaixo para configurar corretamente a integração com a Efí.
                </Typography>
              </Alert>

              <Stack spacing={2}>
                {instructions.map((instruction, index) => (
                  <Box key={index} display="flex" gap={2}>
                    <Box
                      sx={{
                        minWidth: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {instruction}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> Certifique-se de que sua conta Efí está habilitada 
                  para os produtos que deseja utilizar (PIX, Boleto, Cartão de Crédito).
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </StandardTabContent>
  );
};

export default EfiSettings;