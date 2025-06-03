import React, { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import {
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Paper,
  Alert,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  useMediaQuery,
  Divider
} from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
import {
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  AttachFile,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import { toast } from "../../helpers/toast";
import useAuth from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import api from "../../services/api";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 12px rgba(0, 0, 0, 0.4)' 
    : '0 2px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 16px rgba(0, 0, 0, 0.5)' 
      : '0 4px 16px rgba(0, 0, 0, 0.12)',
  }
}));

const GatewayCard = styled(Box)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: selected 
    ? theme.palette.primary.main + '0A' 
    : theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '05',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const ConfigCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[6]
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'valid' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark
  }),
  ...(status === 'invalid' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark
  })
}));

// Componente de Upload de Certificado
const CertificateUpload = ({ currentFile, onUpload, onRemove, loading }) => {
  const fileInputRef = React.useRef(null);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Certificado (.p12)
      </Typography>
      
      <Box 
        sx={{ 
          border: 2, 
          borderColor: currentFile ? 'success.main' : 'divider',
          borderStyle: 'dashed',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: currentFile ? 'success.light' : 'background.default',
          transition: 'all 0.2s'
        }}
      >
        {loading ? (
          <Box>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Enviando...
            </Typography>
          </Box>
        ) : currentFile ? (
          <Box>
            <CheckIcon color="success" sx={{ fontSize: 40 }} />
            <Typography variant="body2" color="success.main" gutterBottom>
              Certificado enviado com sucesso
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={onRemove}
              disabled={loading}
            >
              Remover
            </Button>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Clique para selecionar o certificado .p12
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".p12"
              style={{ display: 'none' }}
              onChange={onUpload}
            />
            <Button
              variant="outlined"
              startIcon={<AttachFile />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Selecionar Arquivo
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

CertificateUpload.propTypes = {
  currentFile: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

// Componente Principal
const PaymentGatewayPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { getAll, update } = useSettings();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [paymentGateway, setPaymentGateway] = useState("");
  const [showSecrets, setShowSecrets] = useState({});
  const [settings, setSettings] = useState({});
  
  // Estado para configurações específicas
  const [efiSettings, setEfiSettings] = useState({
    efiCertFile: "",
    efiClientId: "",
    efiClientSecret: "",
    efiPixKey: ""
  });
  
  const [stripeSettings, setStripeSettings] = useState({
    stripePublicKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: ""
  });

  // Verificar se é super admin
  useEffect(() => {
    if (!user?.super) {
      toast.error("Acesso restrito a super administradores");
    }
  }, [user]);

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      const settingsData = await getAll(companyId);
      
      const settingsObj = {};
      if (Array.isArray(settingsData)) {
        settingsData.forEach(setting => {
          if (setting?.key) {
            settingsObj[setting.key] = setting.value || "";
          }
        });
      }
      
      setSettings(settingsObj);
      
      // Configurar gateway atual
      if (settingsObj._paymentGateway) {
        setPaymentGateway(settingsObj._paymentGateway);
      }
      
      // Configurar Efí
      setEfiSettings({
        efiCertFile: settingsObj._efiCertFile || "",
        efiClientId: settingsObj._efiClientId || "",
        efiClientSecret: settingsObj._efiClientSecret || "",
        efiPixKey: settingsObj._efiPixKey || ""
      });
      
      // Configurar Stripe
      setStripeSettings({
        stripePublicKey: settingsObj._stripePublicKey || "",
        stripeSecretKey: settingsObj._stripeSecretKey || "",
        stripeWebhookSecret: settingsObj._stripeWebhookSecret || ""
      });
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, getAll]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handler para mudança de gateway
  const handleChangeGateway = async (value) => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      await update({ key: "_paymentGateway", value, companyId });
      
      setPaymentGateway(value);
      toast.success("Gateway de pagamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar gateway:", error);
      toast.error("Erro ao atualizar gateway de pagamento");
    } finally {
      setSaving(false);
    }
  };

  // Upload do certificado Efí
  const handleEfiCertUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("settingKey", "efiCertFile");

    setSaving(true);
    setUploadProgress(0);

    try {
      const response = await api.post("/settings/privateFile", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const companyId = user?.companyId || localStorage.getItem("companyId");
      await update({ key: "_efiCertFile", value: response.data, companyId });
      
      setEfiSettings(prev => ({ ...prev, efiCertFile: response.data }));
      toast.success("Certificado enviado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar certificado");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  // Remover certificado
  const handleRemoveCertificate = async () => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      await update({ key: "_efiCertFile", value: "", companyId });
      
      setEfiSettings(prev => ({ ...prev, efiCertFile: "" }));
      toast.success("Certificado removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover certificado:", error);
      toast.error("Erro ao remover certificado");
    } finally {
      setSaving(false);
    }
  };

  // Salvar configuração de texto
  const handleSaveTextSetting = async (gateway, key, value) => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      await update({ key: `_${key}`, value, companyId });
      
      if (gateway === "efi") {
        setEfiSettings(prev => ({ ...prev, [key]: value }));
      } else if (gateway === "stripe") {
        setStripeSettings(prev => ({ ...prev, [key]: value }));
      }
      
      toast.success("Configuração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  // Toggle visibilidade de campo secreto
  const toggleShowSecret = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Validar formato das chaves Stripe
  const validateStripeKey = (key, value) => {
    if (!value) return null;
    
    if (key === "stripePublicKey") {
      return value.startsWith("pk_") ? "valid" : "invalid";
    } else if (key === "stripeSecretKey") {
      return value.startsWith("sk_") ? "valid" : "invalid";
    } else if (key === "stripeWebhookSecret") {
      return value.startsWith("whsec_") ? "valid" : "invalid";
    }
    return null;
  };

  // Copiar para clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado!`);
    }).catch(() => {
      toast.error("Erro ao copiar");
    });
  };

  // Opções de gateway
  const gatewayOptions = [
    {
      value: "",
      label: "Nenhum",
      description: "Desabilitar gateway de pagamento",
      icon: <PaymentIcon />,
      color: "default"
    },
    {
      value: "efi",
      label: "Efí (Gerencianet)",
      description: "Gateway nacional com PIX, boleto e cartão",
      icon: <BankIcon />,
      color: "primary"
    },
    {
      value: "stripe",
      label: "Stripe",
      description: "Gateway internacional com cartão de crédito",
      icon: <CreditCardIcon />,
      color: "secondary"
    }
  ];

  // Estatísticas
  const stats = [
    {
      label: paymentGateway ? 
        `Gateway: ${gatewayOptions.find(g => g.value === paymentGateway)?.label}` : 
        "Nenhum gateway ativo",
      icon: <PaymentIcon />,
      color: paymentGateway ? 'success' : 'default'
    }
  ];

  if (!user?.super) {
    return (
      <MainContainer>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Alert severity="error">
            Acesso restrito a super administradores
          </Alert>
        </Box>
      </MainContainer>
    );
  }

  if (loading) {
    return (
      <MainContainer>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <StandardPageLayout
      title="Gateway de Pagamento"
      subtitle="Configure o processador de pagamentos para cobranças automáticas"
      showSearch={false}
    >
      <StandardTabContent
        title="Seleção de Gateway"
        description="Escolha e configure o gateway de pagamento"
        icon={<PaymentIcon />}
        stats={stats}
        variant="default"
      >
        <StyledPaper>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <PaymentIcon color="primary" />
            Selecionar Gateway de Pagamento
          </Typography>

          {/* Cards de Seleção */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {gatewayOptions.map((option) => (
              <Grid item xs={12} sm={6} md={4} key={option.value}>
                <GatewayCard
                  selected={paymentGateway === option.value}
                  onClick={() => !saving && handleChangeGateway(option.value)}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    {React.cloneElement(option.icon, { 
                      color: paymentGateway === option.value ? 'primary' : 'action',
                      sx: { mr: 1 }
                    })}
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={paymentGateway === option.value ? 600 : 500}
                      color={paymentGateway === option.value ? 'primary' : 'text.primary'}
                    >
                      {option.label}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}
                  >
                    {option.description}
                  </Typography>
                </GatewayCard>
              </Grid>
            ))}
          </Grid>

          {/* Dropdown Alternativo */}
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Ou selecione via dropdown:
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gateway de Pagamento</InputLabel>
                  <Select
                    value={paymentGateway}
                    label="Gateway de Pagamento"
                    onChange={(e) => handleChangeGateway(e.target.value)}
                    disabled={saving}
                  >
                    {gatewayOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box display="flex" alignItems="center">
                          {React.cloneElement(option.icon, { 
                            sx: { mr: 1, fontSize: '1.2rem' } 
                          })}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>

        {/* Alerta quando nenhum gateway selecionado */}
        {!paymentGateway && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Nenhum gateway selecionado:</strong> As funcionalidades de cobrança automática estarão desabilitadas. 
              Selecione um gateway para ativar pagamentos no sistema.
            </Typography>
          </Alert>
        )}
      </StandardTabContent>

      {/* Configurações Efí */}
      {paymentGateway === "efi" && (
        <StandardTabContent
          title="Configurações do Efí (Gerencianet)"
          description="Configure as credenciais e opções do gateway Efí"
          icon={<BankIcon />}
          variant="paper"
        >
          <Grid container spacing={3}>
            {/* Formulário */}
            <Grid item xs={12} lg={6}>
              <ConfigCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Credenciais da API
                  </Typography>
                  
                  <Stack spacing={3}>
                    {/* Upload do Certificado */}
                    <CertificateUpload
                      currentFile={efiSettings.efiCertFile}
                      onUpload={handleEfiCertUpload}
                      onRemove={handleRemoveCertificate}
                      loading={saving && uploadProgress > 0}
                    />

                    {/* Client ID */}
                    <TextField
                      fullWidth
                      label="Client ID"
                      placeholder="Client_Id_xxxxxxxxxxxxx"
                      value={efiSettings.efiClientId}
                      onChange={(e) => setEfiSettings(prev => ({ ...prev, efiClientId: e.target.value }))}
                      onBlur={() => handleSaveTextSetting("efi", "efiClientId", efiSettings.efiClientId)}
                      variant="outlined"
                      helperText="Identificador da aplicação obtido no painel da Efí"
                    />

                    {/* Client Secret */}
                    <TextField
                      fullWidth
                      label="Client Secret"
                      placeholder="Client_Secret_xxxxxxxxxxxxx"
                      type="password"
                      value={efiSettings.efiClientSecret}
                      onChange={(e) => setEfiSettings(prev => ({ ...prev, efiClientSecret: e.target.value }))}
                      onBlur={() => handleSaveTextSetting("efi", "efiClientSecret", efiSettings.efiClientSecret)}
                      variant="outlined"
                      helperText="Chave secreta da aplicação obtida no painel da Efí"
                    />

                    {/* Chave PIX */}
                    <TextField
                      fullWidth
                      label="Chave PIX"
                      placeholder="exemplo@email.com ou +5511999999999"
                      value={efiSettings.efiPixKey}
                      onChange={(e) => setEfiSettings(prev => ({ ...prev, efiPixKey: e.target.value }))}
                      onBlur={() => handleSaveTextSetting("efi", "efiPixKey", efiSettings.efiPixKey)}
                      variant="outlined"
                      helperText="Chave PIX configurada na sua conta Efí"
                    />
                  </Stack>
                </CardContent>
              </ConfigCard>
            </Grid>

            {/* Instruções */}
            <Grid item xs={12} lg={6}>
              <ConfigCard>
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
                    {[
                      "Acesse o painel da Efí em https://dev.gerencianet.com.br",
                      "Vá para 'Aplicações' > 'Minhas Aplicações' > 'Nova Aplicação'",
                      "Configure os endpoints necessários (PIX, Cobranças, etc.)",
                      "Faça o download do certificado (.p12) gerado",
                      "Copie o Client ID e Client Secret da aplicação",
                      "Configure sua chave PIX no painel da Efí",
                      "Preencha os campos com as informações obtidas"
                    ].map((instruction, index) => (
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
              </ConfigCard>
            </Grid>
          </Grid>
        </StandardTabContent>
      )}

      {/* Configurações Stripe */}
      {paymentGateway === "stripe" && (
        <StandardTabContent
          title="Configurações do Stripe"
          description="Configure as credenciais e opções do gateway Stripe"
          icon={<CreditCardIcon />}
          variant="paper"
        >
          <Grid container spacing={3}>
            {/* Formulário */}
            <Grid item xs={12} lg={6}>
              <ConfigCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Credenciais da API
                  </Typography>

                  <Stack spacing={3}>
                    {/* Chave Pública */}
                    <TextField
                      fullWidth
                      label="Chave Publicável"
                      placeholder="pk_test_..."
                      value={stripeSettings.stripePublicKey}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                      onBlur={() => handleSaveTextSetting("stripe", "stripePublicKey", stripeSettings.stripePublicKey)}
                      variant="outlined"
                      error={validateStripeKey("stripePublicKey", stripeSettings.stripePublicKey) === "invalid"}
                      helperText={
                        validateStripeKey("stripePublicKey", stripeSettings.stripePublicKey) === "invalid"
                          ? "Chave pública deve começar com 'pk_'"
                          : "Chave pública para identificar sua conta (segura para uso no frontend)"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: validateStripeKey("stripePublicKey", stripeSettings.stripePublicKey) && (
                          <InputAdornment position="end">
                            {validateStripeKey("stripePublicKey", stripeSettings.stripePublicKey) === "valid" ? 
                              <CheckIcon color="success" fontSize="small" /> : 
                              <WarningIcon color="error" fontSize="small" />
                            }
                          </InputAdornment>
                        )
                      }}
                    />

                    {/* Chave Secreta */}
                    <TextField
                      fullWidth
                      label="Chave Secreta"
                      placeholder="sk_test_..."
                      type={showSecrets.stripeSecretKey ? "text" : "password"}
                      value={stripeSettings.stripeSecretKey}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                      onBlur={() => handleSaveTextSetting("stripe", "stripeSecretKey", stripeSettings.stripeSecretKey)}
                      variant="outlined"
                      error={validateStripeKey("stripeSecretKey", stripeSettings.stripeSecretKey) === "invalid"}
                      helperText={
                        validateStripeKey("stripeSecretKey", stripeSettings.stripeSecretKey) === "invalid"
                          ? "Chave secreta deve começar com 'sk_'"
                          : "Chave secreta para autenticar requisições da API (mantenha segura)"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="error" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <Stack direction="row" spacing={0.5}>
                            {validateStripeKey("stripeSecretKey", stripeSettings.stripeSecretKey) && (
                              validateStripeKey("stripeSecretKey", stripeSettings.stripeSecretKey) === "valid" ? 
                                <CheckIcon color="success" fontSize="small" /> : 
                                <WarningIcon color="error" fontSize="small" />
                            )}
                            <Tooltip title="Mostrar/Ocultar">
                              <IconButton
                                onClick={() => toggleShowSecret("stripeSecretKey")}
                                edge="end"
                                size="small"
                              >
                                {showSecrets.stripeSecretKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )
                      }}
                    />

                    {/* Webhook Secret */}
                    <TextField
                      fullWidth
                      label="Segredo do Webhook"
                      placeholder="whsec_..."
                      type={showSecrets.stripeWebhookSecret ? "text" : "password"}
                      value={stripeSettings.stripeWebhookSecret}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, stripeWebhookSecret: e.target.value }))}
                      onBlur={() => handleSaveTextSetting("stripe", "stripeWebhookSecret", stripeSettings.stripeWebhookSecret)}
                      variant="outlined"
                      error={validateStripeKey("stripeWebhookSecret", stripeSettings.stripeWebhookSecret) === "invalid"}
                      helperText={
                        validateStripeKey("stripeWebhookSecret", stripeSettings.stripeWebhookSecret) === "invalid"
                          ? "Segredo do webhook deve começar com 'whsec_'"
                          : "Usado para verificar a autenticidade dos webhooks"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="warning" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <Stack direction="row" spacing={0.5}>
                            {validateStripeKey("stripeWebhookSecret", stripeSettings.stripeWebhookSecret) && (
                              validateStripeKey("stripeWebhookSecret", stripeSettings.stripeWebhookSecret) === "valid" ? 
                                <CheckIcon color="success" fontSize="small" /> : 
                                <WarningIcon color="error" fontSize="small" />
                            )}
                            <Tooltip title="Mostrar/Ocultar">
                              <IconButton
                                onClick={() => toggleShowSecret("stripeWebhookSecret")}
                                edge="end"
                                size="small"
                              >
                                {showSecrets.stripeWebhookSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )
                      }}
                    />

                    {/* URL do Webhook */}
                    <TextField
                      fullWidth
                      label="URL do Webhook"
                      value={`${window.location.protocol}//${window.location.host}/subscription/webhook`}
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Copiar URL">
                              <IconButton
                                onClick={() => copyToClipboard(
                                  `${window.location.protocol}//${window.location.host}/subscription/webhook`,
                                  "URL do webhook"
                                )}
                                edge="end"
                                size="small"
                              >
                                <CopyIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }}
                      helperText="Configure esta URL no painel do Stripe para receber webhooks"
                    />
                  </Stack>

                  {/* Status das configurações */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status das Configurações:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <StatusChip
                        icon={validateStripeKey("stripePublicKey", stripeSettings.stripePublicKey) === "valid" ? 
                          <CheckIcon /> : <WarningIcon />}
                        label="Chave Pública"
                        status={validateStripeKey("stripePublicKey", stripeSettings.stripePublicKey)}
                        size="small"
                      />
                      <StatusChip
                        icon={validateStripeKey("stripeSecretKey", stripeSettings.stripeSecretKey) === "valid" ? 
                          <CheckIcon /> : <WarningIcon />}
                        label="Chave Secreta"
                        status={validateStripeKey("stripeSecretKey", stripeSettings.stripeSecretKey)}
                        size="small"
                      />
                      <StatusChip
                        icon={validateStripeKey("stripeWebhookSecret", stripeSettings.stripeWebhookSecret) === "valid" ? 
                          <CheckIcon /> : <WarningIcon />}
                        label="Webhook Secret"
                        status={validateStripeKey("stripeWebhookSecret", stripeSettings.stripeWebhookSecret)}
                        size="small"
                      />
                    </Stack>
                  </Box>
                </CardContent>
              </ConfigCard>
            </Grid>

            {/* Instruções */}
            <Grid item xs={12} lg={6}>
              <ConfigCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Instruções de Configuração
                  </Typography>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Siga os passos abaixo para configurar corretamente a integração com o Stripe.
                    </Typography>
                  </Alert>

                  <Stack spacing={2}>
                    {[
                      "Acesse o painel do Stripe em https://dashboard.stripe.com",
                      "Vá para 'Desenvolvedores' > 'Chaves da API'",
                      "Copie a chave publicável (inicia com pk_)",
                      "Copie a chave secreta (inicia com sk_) - mantenha-a segura",
                      "Configure um webhook endpoint em 'Desenvolvedores' > 'Webhooks'",
                      "Use a URL do webhook fornecida acima",
                      "Copie o segredo do webhook (inicia com whsec_)",
                      "Cole as chaves nos campos correspondentes"
                    ].map((instruction, index) => (
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
                      <strong>Segurança:</strong> Nunca compartilhe suas chaves secretas ou segredos de webhook. 
                      Use chaves de teste durante o desenvolvimento e mude para chaves de produção apenas quando estiver pronto.
                    </Typography>
                  </Alert>

                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Dica:</strong> Teste suas configurações criando um pagamento de teste para verificar 
                      se tudo está funcionando corretamente.
                    </Typography>
                  </Alert>
                </CardContent>
              </ConfigCard>
            </Grid>
          </Grid>
        </StandardTabContent>
      )}

      {/* Informações sobre o gateway selecionado */}
      {paymentGateway && (
        <StandardTabContent
          title="Informações do Gateway"
          description="Detalhes sobre o gateway de pagamento selecionado"
          icon={<InfoIcon />}
          variant="paper"
        >
          <StyledPaper>
            {paymentGateway === "efi" && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Efí (Gerencianet)
                </Typography>
                <Typography variant="body2" paragraph>
                  Gateway de pagamento brasileiro que oferece:
                </Typography>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><Typography variant="body2">PIX instantâneo</Typography></li>
                  <li><Typography variant="body2">Boleto bancário</Typography></li>
                  <li><Typography variant="body2">Cartão de crédito</Typography></li>
                  <li><Typography variant="body2">Transferência bancária</Typography></li>
                </ul>
              </Box>
            )}

            {paymentGateway === "stripe" && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Stripe
                </Typography>
                <Typography variant="body2" paragraph>
                  Gateway de pagamento internacional que oferece:
                </Typography>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><Typography variant="body2">Cartão de crédito internacional</Typography></li>
                  <li><Typography variant="body2">Cartões de débito</Typography></li>
                  <li><Typography variant="body2">Wallets digitais (Apple Pay, Google Pay)</Typography></li>
                  <li><Typography variant="body2">Transferências bancárias (ACH)</Typography></li>
                </ul>
              </Box>
            )}
          </StyledPaper>
        </StandardTabContent>
      )}
    </StandardPageLayout>
  );
};

export default PaymentGatewayPage;