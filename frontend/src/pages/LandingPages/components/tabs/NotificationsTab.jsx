import React, { useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Alert,
  Divider,
  Chip,
  Card,
  CardContent,
  Collapse
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  FormatColorText as TextIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { isValidPhoneNumber } from '../../../../utils/stringUtils';
import { PhoneTextField } from '../PhoneNumberMask';
import FileManager from '../FileManager';
import BaseModal from '../../../../components/BaseModal';
import ImageUploader from '../ImageUploader';

const AnimatedPaper = animated(Paper);
const AnimatedCard = animated(Card);

const NotificationsTab = ({ landingPage, setLandingPage }) => {  
  const theme = useTheme();
  
  // Estado para teste de mensagem
  const [previewMessage, setPreviewMessage] = useState(false);
  
  // Estado para gerenciador de arquivos
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 300,
    config: { tension: 220, friction: 40 }
  });
  
  // Handler para alternar notificação por WhatsApp
  const handleToggleWhatsApp = (e) => {
    const enableWhatsApp = e.target.checked;
    
    setLandingPage(prev => ({
      ...prev,
      notificationConfig: {
        ...prev.notificationConfig,
        enableWhatsApp
      }
    }));
  };
  
  // Handler para alteração do número de WhatsApp
  const handleWhatsAppNumberChange = (e) => {
    const whatsAppNumber = e.target.value;
    
    setLandingPage(prev => ({
      ...prev,
      notificationConfig: {
        ...prev.notificationConfig,
        whatsAppNumber
      }
    }));
  };
  
  // Handler para alteração do modelo de mensagem
  const handleMessageTemplateChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      notificationConfig: {
        ...prev.notificationConfig,
        messageTemplate: e.target.value
      }
    }));
  };

  // Verificar se o número de WhatsApp é válido
  const isWhatsAppNumberValid = () => {
    const number = landingPage.notificationConfig.whatsAppNumber;
    return number ? isValidPhoneNumber(number) : false;
  };
  
  // Handler para alternar mensagem de confirmação
  const handleToggleConfirmationMessage = (e) => {
    const enabled = e.target.checked;
    
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.notificationConfig.confirmationMessage || {
        enabled: false,
        imageUrl: '',
        caption: 'Obrigado por se cadastrar! Seu formulário foi recebido com sucesso.',
        sendBefore: true
      };
      
      return {
        ...prev,
        notificationConfig: {
          ...prev.notificationConfig,
          confirmationMessage: {
            ...currentConfig,
            enabled
          }
        }
      };
    });
  };
  
  // Handler para alteração da legenda da imagem
  const handleConfirmationCaptionChange = (e) => {
    const caption = e.target.value;
    
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.notificationConfig.confirmationMessage || {
        enabled: false,
        imageUrl: '',
        caption: '',
        sendBefore: true
      };
      
      return {
        ...prev,
        notificationConfig: {
          ...prev.notificationConfig,
          confirmationMessage: {
            ...currentConfig,
            caption
          }
        }
      };
    });
  };
  
  // Handler para alteração da ordem de envio
  const handleSendBeforeChange = (e) => {
    const sendBefore = e.target.checked;
    
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.notificationConfig.confirmationMessage || {
        enabled: false,
        imageUrl: '',
        caption: '',
        sendBefore: true
      };
      
      return {
        ...prev,
        notificationConfig: {
          ...prev.notificationConfig,
          confirmationMessage: {
            ...currentConfig,
            sendBefore
          }
        }
      };
    });
  };
  
  // Handler para upload de imagem
  const handleImageUpload = (imageUrl) => {
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.notificationConfig.confirmationMessage || {
        enabled: false,
        imageUrl: '',
        caption: '',
        sendBefore: true
      };
      
      return {
        ...prev,
        notificationConfig: {
          ...prev.notificationConfig,
          confirmationMessage: {
            ...currentConfig,
            imageUrl
          }
        }
      };
    });
  };
  
  // Handler para remover imagem
  const handleRemoveImage = () => {
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.notificationConfig.confirmationMessage || {
        enabled: false,
        imageUrl: '',
        caption: '',
        sendBefore: true
      };
      
      return {
        ...prev,
        notificationConfig: {
          ...prev.notificationConfig,
          confirmationMessage: {
            ...currentConfig,
            imageUrl: ''
          }
        }
      };
    });
  };
  
  // Gerar mensagem de exemplo
  const generateExampleMessage = () => {
    let message = landingPage.notificationConfig.messageTemplate || '';
    
    // Substituir variáveis com exemplos
    message = message.replace(/{name}/g, 'João Silva');
    message = message.replace(/{email}/g, 'joao.silva@exemplo.com');
    message = message.replace(/{phone}/g, '+5511999998888');
    message = message.replace(/{landing_page}/g, landingPage.title || 'Minha Landing Page');
    message = message.replace(/{date}/g, new Date().toLocaleString());
    message = message.replace(/{submission_id}/g, 'SUB123456');
    
    return message;
  };
  
  // Alternar visualização de mensagem de teste
  const handleTogglePreview = () => {
    setPreviewMessage(!previewMessage);
  };
  
  // Abrir/fechar gerenciador de mídia
  const handleOpenMediaManager = () => setMediaManagerOpen(true);
  const handleCloseMediaManager = () => setMediaManagerOpen(false);
  
  // Handler para selecionar um arquivo do gerenciador
  const handleFileSelect = (file) => {
    if (file.mimeType.startsWith('image/')) {
      handleImageUpload(file.url);
    }
    
    // Fechar o gerenciador de mídia
    handleCloseMediaManager();
  };
  
  // Verificar se existe a configuração de mensagem de confirmação
  const confirmationConfig = landingPage.notificationConfig.confirmationMessage || {
    enabled: false,
    imageUrl: '',
    caption: 'Obrigado por se cadastrar! Seu formulário foi recebido com sucesso.',
    sendBefore: true
  };
  
  return (
    <AnimatedPaper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        height: '100%', // Usar altura total do container
        overflow: 'auto', // Habilitar scroll
        display: 'flex',
        flexDirection: 'column'
      }}
      style={fadeIn}
    >
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 3,
        color: 'primary.main',
        fontWeight: 600
      }}>
        <NotificationsIcon sx={{ mr: 1 }} />
        Configurações de Notificações
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f8f9fa',
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.success.main}`
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <WhatsAppIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Notificações por WhatsApp
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={landingPage.notificationConfig.enableWhatsApp}
                  onChange={handleToggleWhatsApp}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">
                    {landingPage.notificationConfig.enableWhatsApp
                      ? "Ativar notificações por WhatsApp"
                      : "Notificações por WhatsApp desativadas"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Receba notificações por WhatsApp quando alguém preencher o formulário da sua landing page.
                  </Typography>
                </Box>
              }
            />

            <Box display="flex" alignItems="center" mt={2}>
              <Chip 
                icon={<CheckIcon />}
                label={landingPage.notificationConfig.enableWhatsApp ? "Notificações Ativas" : "Notificações Inativas"}
                color={landingPage.notificationConfig.enableWhatsApp ? "success" : "default"}
                variant={landingPage.notificationConfig.enableWhatsApp ? "filled" : "outlined"}
              />
            </Box>
          </Paper>
        </Grid>
        
        {landingPage.notificationConfig.enableWhatsApp && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número para Notificações"
                value={landingPage.notificationConfig.whatsAppNumber || ''}
                onChange={handleWhatsAppNumberChange}
                variant="outlined"
                placeholder="+5511999998888"
                helperText={
                  isWhatsAppNumberValid() || !landingPage.notificationConfig.whatsAppNumber
                    ? "Use o formato internacional com prefixo de país (ex: +5511999998888)"
                    : "Formato inválido. Use o formato internacional com prefixo de país"
                }
                error={!isWhatsAppNumberValid() && !!landingPage.notificationConfig.whatsAppNumber}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color={
                        !landingPage.notificationConfig.whatsAppNumber ? "action" :
                        isWhatsAppNumberValid() ? "success" : "error"
                      } />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center">
                  <MessageIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    Modelo de Mensagem para Administrador
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<VisibilityIcon />}
                  onClick={handleTogglePreview}
                  size="small"
                >
                  {previewMessage ? "Ocultar Exemplo" : "Ver Exemplo"}
                </Button>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={landingPage.notificationConfig.messageTemplate || ''}
                onChange={handleMessageTemplateChange}
                variant="outlined"
                placeholder="Digite aqui o modelo de mensagem para notificações..."
                helperText="Use {name}, {email}, etc. para incluir dados do formulário"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', pt: 1.5 }}>
                      <TextIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              {previewMessage && (
                <AnimatedCard 
                  variant="outlined"
                  sx={{ 
                    mt: 2, 
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f0f8f0'
                  }}
                  style={cardAnimation}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <WhatsAppIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" fontWeight={500}>
                        Exemplo de Notificação
                      </Typography>
                    </Box>
                    <Box 
                      sx={{
                        backgroundColor: '#e2f7e2', 
                        p: 2, 
                        borderRadius: 2,
                        color: '#333',
                        whiteSpace: 'pre-line',
                        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                      }}
                    >
                      {generateExampleMessage() || "Defina um modelo de mensagem para ver o exemplo."}
                    </Box>
                  </CardContent>
                </AnimatedCard>
              )}
              
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" fontWeight={500}>
                  Variáveis disponíveis:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  <Chip label="{name}" size="small" variant="outlined" color="primary" />
                  <Chip label="{email}" size="small" variant="outlined" color="primary" />
                  <Chip label="{phone}" size="small" variant="outlined" color="primary" />
                  <Chip label="{landing_page}" size="small" variant="outlined" color="primary" />
                  <Chip label="{date}" size="small" variant="outlined" color="primary" />
                  <Chip label="{submission_id}" size="small" variant="outlined" color="primary" />
                </Box>
                
                <Alert 
                  severity="info" 
                  variant="outlined"
                  icon={<InfoIcon />}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    Também é possível usar o nome de qualquer campo personalizado que você adicionar ao formulário. 
                    Por exemplo, se você criar um campo com ID "empresa", poderá usar {'{empresa}'} no modelo de mensagem.
                  </Typography>
                </Alert>
              </Box>
            </Grid>
            
            {/* Nova seção para mensagem de confirmação com imagem */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f8f9fa',
                  borderRadius: 2,
                  borderLeft: `4px solid ${theme.palette.info.main}`
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <WhatsAppIcon color="info" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    Mensagem de Confirmação para Contato
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={confirmationConfig.enabled}
                      onChange={handleToggleConfirmationMessage}
                      color="info"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {confirmationConfig.enabled
                          ? "Enviar mensagem de confirmação para o contato"
                          : "Mensagem de confirmação desativada"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Envia uma mensagem de confirmação com imagem para o contato que preencheu o formulário.
                      </Typography>
                    </Box>
                  }
                />
                
                <Box display="flex" alignItems="center" mt={2}>
                  <Chip 
                    icon={<CheckIcon />}
                    label={confirmationConfig.enabled ? "Confirmação Ativa" : "Confirmação Inativa"}
                    color={confirmationConfig.enabled ? "info" : "default"}
                    variant={confirmationConfig.enabled ? "filled" : "outlined"}
                  />
                </Box>
                
                <Collapse in={confirmationConfig.enabled}>
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Imagem de Confirmação
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <ImageUploader
                            currentImage={confirmationConfig.imageUrl}
                            onImageUpload={handleImageUpload}
                            maxSize={2 * 1024 * 1024} // 2MB
                            acceptedTypes={['image/jpeg', 'image/png', 'image/gif']}
                            height={200}
                            landingPageId={landingPage.id}
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box display="flex" flexDirection="column" height="100%" justifyContent="center">
                          {confirmationConfig.imageUrl ? (
                            <Alert 
                              severity="success" 
                              variant="outlined" 
                              icon={<CheckIcon />}
                              sx={{ mb: 2, width: '100%', borderRadius: 2 }}
                            >
                              <Typography variant="body2">
                                Imagem definida com sucesso!
                              </Typography>
                            </Alert>
                          ) : (
                            <Alert 
                              severity="info" 
                              variant="outlined"
                              sx={{ mb: 2, width: '100%', borderRadius: 2 }}
                            >
                              <Typography variant="body2">
                                Arraste uma imagem para a área ou clique para selecionar.
                              </Typography>
                            </Alert>
                          )}
                          
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<ImageIcon />}
                            onClick={handleOpenMediaManager}
                          >
                            Selecionar da Biblioteca
                          </Button>
                          
                          {confirmationConfig.imageUrl && (
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={handleRemoveImage}
                              sx={{ mt: 2 }}
                            >
                              Remover Imagem
                            </Button>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Legenda da Imagem"
                          value={confirmationConfig.caption || ''}
                          onChange={handleConfirmationCaptionChange}
                          variant="outlined"
                          placeholder="Digite a legenda que acompanhará a imagem..."
                          helperText="Esta mensagem será enviada junto com a imagem de confirmação."
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={confirmationConfig.sendBefore}
                              onChange={handleSendBeforeChange}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1">
                                Enviar antes do convite do grupo
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Se ativado, envia a mensagem de confirmação antes do convite para o grupo (se configurado).
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    </Grid>
                    
                    <Alert 
                      severity="info" 
                      variant="outlined"
                      icon={<InfoIcon />}
                      sx={{ mt: 3, borderRadius: 2 }}
                    >
                      <Typography variant="body2">
                        A mensagem de confirmação será enviada para o número de WhatsApp informado pelo contato no formulário.
                        Certifique-se de que seu formulário possui um campo de telefone/WhatsApp.
                      </Typography>
                    </Alert>
                  </Box>
                </Collapse>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
      
      {/* Diálogo do gerenciador de mídia */}
      <BaseModal
        open={mediaManagerOpen}
        onClose={handleCloseMediaManager}
        title="Selecionar Imagem"
        maxWidth="lg"
      >
        {landingPage && landingPage.id && (
          <FileManager
            landingPageId={landingPage.id}
            allowedTypes={['image/*']}
            maxFileSize={5 * 1024 * 1024} // 5MB
            multipleSelection={false}
            onFileSelect={handleFileSelect}
          />
        )}
      </BaseModal>
    </AnimatedPaper>
  );
};

export default NotificationsTab;