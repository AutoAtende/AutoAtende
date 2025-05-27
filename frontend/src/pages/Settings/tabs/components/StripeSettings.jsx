import React, { useEffect, useState, useCallback } from "react";
import {
  Grid,
  Typography,
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Alert,
  Chip
} from "@mui/material";
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from "@mui/icons-material";

import StandardTabContent from "../../../../components/shared/StandardTabContent";
import { toast } from "../../../../helpers/toast";
import useSettings from "../../../../hooks/useSettings";
import { i18n } from "../../../../translate/i18n";

const StripeSettings = () => {
  const { getAll: getAllSettings, update } = useSettings();
  
  const [stripeSettings, setStripeSettings] = useState({
    stripePublicKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: ""
  });
  
  const [showSecrets, setShowSecrets] = useState({
    secretKey: false,
    webhookSecret: false
  });
  
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState({
    publicKey: null,
    secretKey: null,
    webhookSecret: null
  });

  // Carregar configurações iniciais
  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        setLoading(true);
        const settings = await getAllSettings();
        const initialSettings = settings.reduce((acc, setting) => {
          if (setting.key.startsWith("_stripe")) {
            acc[setting.key.substring(1)] = setting.value;
          }
          return acc;
        }, {});
        setStripeSettings(prev => ({ ...prev, ...initialSettings }));
        
        // Validar chaves existentes
        validateKeys(initialSettings);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    };

    loadInitialSettings();
  }, [getAllSettings]);

  // Validar formato das chaves
  const validateKeys = useCallback((settings) => {
    const validation = {
      publicKey: null,
      secretKey: null,
      webhookSecret: null
    };

    // Validar chave pública (deve começar com pk_)
    if (settings.stripePublicKey) {
      validation.publicKey = settings.stripePublicKey.startsWith('pk_') ? 'valid' : 'invalid';
    }

    // Validar chave secreta (deve começar com sk_)
    if (settings.stripeSecretKey) {
      validation.secretKey = settings.stripeSecretKey.startsWith('sk_') ? 'valid' : 'invalid';
    }

    // Validar webhook secret (deve começar com whsec_)
    if (settings.stripeWebhookSecret) {
      validation.webhookSecret = settings.stripeWebhookSecret.startsWith('whsec_') ? 'valid' : 'invalid';
    }

    setValidationStatus(validation);
  }, []);

  // Salvar configuração
  const handleSaveSetting = useCallback(async (key, value) => {
    try {
      await update({ key: `_${key}`, value });
      
      // Revalidar chaves após salvar
      const newSettings = { ...stripeSettings, [key]: value };
      validateKeys(newSettings);
      
      toast.success("Configuração salva com sucesso");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    }
  }, [update, stripeSettings, validateKeys]);

  // Handler para mudança de campo
  const handleChange = useCallback((key) => (event) => {
    const value = event.target.value;
    setStripeSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handler para salvar ao sair do campo
  const handleBlur = useCallback((key) => () => {
    handleSaveSetting(key, stripeSettings[key]);
  }, [handleSaveSetting, stripeSettings]);

  // Toggle visibilidade de campos secretos
  const toggleShowSecret = useCallback((field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Copiar texto para clipboard
  const copyToClipboard = useCallback((text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado para a área de transferência`);
    }).catch(() => {
      toast.error("Erro ao copiar para a área de transferência");
    });
  }, []);

  // Obter URL do webhook
  const getWebhookUrl = useCallback(() => {
    return `${window.location.protocol}//${window.location.host}/subscription/webhook`;
  }, []);

  // Renderizar status de validação
  const renderValidationStatus = (status) => {
    if (status === 'valid') {
      return <CheckIcon color="success" fontSize="small" />;
    } else if (status === 'invalid') {
      return <WarningIcon color="error" fontSize="small" />;
    }
    return null;
  };

  const instructions = [
    "Acesse o painel do Stripe em https://dashboard.stripe.com",
    "Vá para 'Desenvolvedores' > 'Chaves da API'",
    "Copie a chave publicável (inicia com pk_)",
    "Copie a chave secreta (inicia com sk_) - mantenha-a segura",
    "Configure um webhook endpoint em 'Desenvolvedores' > 'Webhooks'",
    "Use a URL do webhook fornecida abaixo",
    "Copie o segredo do webhook (inicia com whsec_)",
    "Cole as chaves nos campos correspondentes"
  ];

  return (
    <StandardTabContent
      title="Configurações Stripe"
      description="Configure as credenciais para integração com o Stripe"
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
                {/* Chave Pública */}
                <Box>
                  <TextField
                    fullWidth
                    label="Chave Publicável"
                    placeholder="pk_test_..."
                    value={stripeSettings.stripePublicKey || ""}
                    onChange={handleChange('stripePublicKey')}
                    onBlur={handleBlur('stripePublicKey')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {renderValidationStatus(validationStatus.publicKey)}
                          <Tooltip title="Chave pública do Stripe" arrow>
                            <InfoIcon color="action" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    error={validationStatus.publicKey === 'invalid'}
                    helperText={
                      validationStatus.publicKey === 'invalid' 
                        ? "Chave pública deve começar com 'pk_'"
                        : "Chave pública para identificar sua conta (segura para uso no frontend)"
                    }
                  />
                </Box>

                {/* Chave Secreta */}
                <Box>
                  <TextField
                    fullWidth
                    label="Chave Secreta"
                    placeholder="sk_test_..."
                    type={showSecrets.secretKey ? 'text' : 'password'}
                    value={stripeSettings.stripeSecretKey || ""}
                    onChange={handleChange('stripeSecretKey')}
                    onBlur={handleBlur('stripeSecretKey')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="error" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Stack direction="row" spacing={0.5}>
                            {renderValidationStatus(validationStatus.secretKey)}
                            <Tooltip title="Mostrar/Ocultar chave secreta" arrow>
                              <IconButton
                                onClick={() => toggleShowSecret('secretKey')}
                                edge="end"
                                size="small"
                              >
                                {showSecrets.secretKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chave secreta do Stripe" arrow>
                              <InfoIcon color="action" />
                            </Tooltip>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    error={validationStatus.secretKey === 'invalid'}
                    helperText={
                      validationStatus.secretKey === 'invalid'
                        ? "Chave secreta deve começar com 'sk_'"
                        : "Chave secreta para autenticar requisições da API (mantenha segura)"
                    }
                  />
                </Box>

                {/* Webhook Secret */}
                <Box>
                  <TextField
                    fullWidth
                    label="Segredo do Webhook"
                    placeholder="whsec_..."
                    type={showSecrets.webhookSecret ? 'text' : 'password'}
                    value={stripeSettings.stripeWebhookSecret || ""}
                    onChange={handleChange('stripeWebhookSecret')}
                    onBlur={handleBlur('stripeWebhookSecret')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="warning" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Stack direction="row" spacing={0.5}>
                            {renderValidationStatus(validationStatus.webhookSecret)}
                            <Tooltip title="Mostrar/Ocultar segredo do webhook" arrow>
                              <IconButton
                                onClick={() => toggleShowSecret('webhookSecret')}
                                edge="end"
                                size="small"
                              >
                                {showSecrets.webhookSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Segredo do webhook do Stripe" arrow>
                              <InfoIcon color="action" />
                            </Tooltip>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    error={validationStatus.webhookSecret === 'invalid'}
                    helperText={
                      validationStatus.webhookSecret === 'invalid'
                        ? "Segredo do webhook deve começar com 'whsec_'"
                        : "Usado para verificar a autenticidade dos webhooks"
                    }
                  />
                </Box>

                {/* URL do Webhook */}
                <Box>
                  <TextField
                    fullWidth
                    label="URL do Webhook"
                    value={getWebhookUrl()}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Copiar URL do webhook" arrow>
                            <IconButton
                              onClick={() => copyToClipboard(getWebhookUrl(), "URL do webhook")}
                              edge="end"
                              size="small"
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    helperText="Configure esta URL no painel do Stripe para receber webhooks"
                  />
                </Box>
              </Stack>

              {/* Status das configurações */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status das Configurações:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    icon={renderValidationStatus(validationStatus.publicKey)}
                    label="Chave Pública"
                    color={validationStatus.publicKey === 'valid' ? 'success' : validationStatus.publicKey === 'invalid' ? 'error' : 'default'}
                    size="small"
                  />
                  <Chip
                    icon={renderValidationStatus(validationStatus.secretKey)}
                    label="Chave Secreta"
                    color={validationStatus.secretKey === 'valid' ? 'success' : validationStatus.secretKey === 'invalid' ? 'error' : 'default'}
                    size="small"
                  />
                  <Chip
                    icon={renderValidationStatus(validationStatus.webhookSecret)}
                    label="Webhook Secret"
                    color={validationStatus.webhookSecret === 'valid' ? 'success' : validationStatus.webhookSecret === 'invalid' ? 'error' : 'default'}
                    size="small"
                  />
                </Stack>
              </Box>
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
                  Siga os passos abaixo para configurar corretamente a integração com o Stripe.
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
          </Card>
        </Grid>
      </Grid>
    </StandardTabContent>
  );
};

export default StripeSettings;