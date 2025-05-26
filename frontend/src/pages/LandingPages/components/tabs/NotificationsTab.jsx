import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Paper,
  Collapse,
  Chip,
  Divider
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  FormatColorText as TextIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { isValidPhoneNumber } from '../../../../utils/stringUtils';
import { PhoneTextField } from '../PhoneNumberMask';
import BaseModal from '../../../../components/shared/BaseModal';
import FileManager from '../FileManager';
import ImageUploader from '../ImageUploader';

const AnimatedPaper = animated(Paper);

const NotificationsTab = ({ landingPage, setLandingPage }) => {
  const theme = useTheme();
  
  // Estados para modais
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState(false);
  
  // Estados temporários para edição
  const [tempMessageTemplate, setTempMessageTemplate] = useState(
    landingPage.notificationConfig.messageTemplate || ''
  );
  const [tempConfirmationConfig, setTempConfirmationConfig] = useState(
    landingPage.notificationConfig.confirmationMessage || {
      enabled: false,
      imageUrl: '',
      caption: 'Obrigado por se cadastrar! Seu formulário foi recebido com sucesso.',
      sendBefore: true
    }
  );
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
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
  
  // Salvar template de mensagem
  const handleSaveMessageTemplate = () => {
    setLandingPage(prev => ({
      ...prev,
      notificationConfig: {
        ...prev.notificationConfig,
        messageTemplate: tempMessageTemplate
      }
    }));
    setTemplateModalOpen(false);
  };
  
  // Salvar configuração de confirmação
  const handleSaveConfirmationConfig = () => {
    setLandingPage(prev => ({
      ...prev,
      notificationConfig: {
        ...prev.notificationConfig,
        confirmationMessage: tempConfirmationConfig
      }
    }));
    setConfirmationModalOpen(false);
  };
  
  // Handler para upload de imagem
  const handleImageUpload = (imageUrl) => {
    setTempConfirmationConfig(prev => ({
      ...prev,
      imageUrl
    }));
  };
  
  // Handler para selecionar arquivo do gerenciador
  const handleFileSelect = (file) => {
    if (file.mimeType.startsWith('image/')) {
      handleImageUpload(file.url);
    }
    setMediaManagerOpen(false);
  };
  
  // Verificar se o número de WhatsApp é válido
  const isWhatsAppNumberValid = () => {
    const number = landingPage.notificationConfig.whatsAppNumber;
    return number ? isValidPhoneNumber(number) : false;
  };
  
  // Gerar mensagem de exemplo
  const generateExampleMessage = (template = tempMessageTemplate) => {
    let message = template || '';
    
    // Substituir variáveis com exemplos
    message = message.replace(/{name}/g, 'João Silva');
    message = message.replace(/{email}/g, 'joao.silva@exemplo.com');
    message = message.replace(/{phone}/g, '+5511999998888');
    message = message.replace(/{landing_page}/g, landingPage.title || 'Minha Landing Page');
    message = message.replace(/{date}/g, new Date().toLocaleString());
    message = message.replace(/{submission_id}/g, 'SUB123456');
    
    return message;
  };
  
  return (
    <AnimatedPaper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        height: '100%',
        overflow: 'auto',
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
        {/* Notificações por WhatsApp */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <WhatsAppIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Notificações por WhatsApp
              </Typography>
            </Box>
            
            <Chip 
              label={landingPage.notificationConfig.enableWhatsApp ? "Ativado" : "Desativado"}
              color={landingPage.notificationConfig.enableWhatsApp ? "success" : "default"}
              variant={landingPage.notificationConfig.enableWhatsApp ? "filled" : "outlined"}
            />
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
                  Ativar notificações por WhatsApp
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Receba notificações quando alguém preencher o formulário da sua landing page.
                </Typography>
              </Box>
            }
          />
        </Grid>
        
        {landingPage.notificationConfig.enableWhatsApp && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <PhoneTextField
                label="Número para Notificações"
                name="whatsAppNumber"
                value={landingPage.notificationConfig.whatsAppNumber || ''}
                onChange={handleWhatsAppNumberChange}
                placeholder="+5511999998888"
                error={!isWhatsAppNumberValid() && !!landingPage.notificationConfig.whatsAppNumber}
                helperText={
                  isWhatsAppNumberValid() || !landingPage.notificationConfig.whatsAppNumber
                    ? "Use o formato internacional com prefixo de país"
                    : "Formato inválido. Use o formato internacional com prefixo de país"
                }
                required
                fullWidth
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
          </>
        )}
        
        {/* Template de Mensagem */}
        {landingPage.notificationConfig.enableWhatsApp && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <MessageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={500}>
                  Template de Mensagem
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  setTempMessageTemplate(landingPage.notificationConfig.messageTemplate || '');
                  setTemplateModalOpen(true);
                }}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {landingPage.notificationConfig.messageTemplate 
                  ? 'Editar Template' 
                  : 'Configurar Template'}
              </Button>
            </Box>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              Configure uma mensagem personalizada que será enviada quando receber um novo lead.
            </Typography>
            
            {landingPage.notificationConfig.messageTemplate && (
              <Alert severity="success" variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  Template configurado com sucesso! As notificações serão enviadas usando sua mensagem personalizada.
                </Typography>
              </Alert>
            )}
          </Grid>
        )}
        
        {/* Mensagem de Confirmação */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <CheckIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Mensagem de Confirmação para Contato
              </Typography>
            </Box>
            
            <Chip 
              label={landingPage.notificationConfig.confirmationMessage?.enabled ? "Ativada" : "Desativada"}
              color={landingPage.notificationConfig.confirmationMessage?.enabled ? "info" : "default"}
              variant={landingPage.notificationConfig.confirmationMessage?.enabled ? "filled" : "outlined"}
            />
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={landingPage.notificationConfig.confirmationMessage?.enabled || false}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setLandingPage(prev => ({
                    ...prev,
                    notificationConfig: {
                      ...prev.notificationConfig,
                      confirmationMessage: {
                        ...prev.notificationConfig.confirmationMessage,
                        enabled,
                        imageUrl: prev.notificationConfig.confirmationMessage?.imageUrl || '',
                        caption: prev.notificationConfig.confirmationMessage?.caption || 
                          'Obrigado por se cadastrar! Seu formulário foi recebido com sucesso.',
                        sendBefore: prev.notificationConfig.confirmationMessage?.sendBefore ?? true
                      }
                    }
                  }));
                }}
                color="info"
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  Enviar mensagem de confirmação para o contato
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Envia uma mensagem automática de confirmação para quem preencheu o formulário.
                </Typography>
              </Box>
            }
          />
          
          <Collapse in={landingPage.notificationConfig.confirmationMessage?.enabled}>
            <Box mt={2}>
              <Button
                variant="contained"
                color="info"
                startIcon={<EditIcon />}
                onClick={() => {
                  setTempConfirmationConfig(landingPage.notificationConfig.confirmationMessage || {
                    enabled: false,
                    imageUrl: '',
                    caption: 'Obrigado por se cadastrar! Seu formulário foi recebido com sucesso.',
                    sendBefore: true
                  });
                  setConfirmationModalOpen(true);
                }}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Configurar Mensagem
              </Button>
              
              {landingPage.notificationConfig.confirmationMessage?.imageUrl && (
                <Alert severity="success" variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Imagem configurada! A mensagem de confirmação será enviada com a imagem selecionada.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Collapse>
        </Grid>
        
        {/* Resumo das Configurações */}
        {landingPage.notificationConfig.enableWhatsApp && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Resumo das configurações:</strong>
                <br />
                • Notificações: {landingPage.notificationConfig.whatsAppNumber || 'Número não configurado'}
                <br />
                • Template personalizado: {landingPage.notificationConfig.messageTemplate ? 'Sim' : 'Padrão do sistema'}
                <br />
                • Confirmação para contato: {landingPage.notificationConfig.confirmationMessage?.enabled ? 'Ativada' : 'Desativada'}
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
      
      {/* Modal - Template de Mensagem */}
      <BaseModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="Configurar Template de Notificação"
        maxWidth="md"
        actions={[
          {
            label: "Cancelar",
            onClick: () => setTemplateModalOpen(false),
            variant: "outlined",
            color: "inherit"
          },
          {
            label: "Visualizar",
            onClick: () => setPreviewMessage(!previewMessage),
            variant: "outlined",
            color: "primary",
            icon: <VisibilityIcon />
          },
          {
            label: "Salvar",
            onClick: handleSaveMessageTemplate,
            variant: "contained",
            color: "primary",
            icon: <CheckIcon />
          }
        ]}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Template da Mensagem"
              value={tempMessageTemplate}
              onChange={(e) => setTempMessageTemplate(e.target.value)}
              variant="outlined"
              placeholder="Digite o template da mensagem de notificação..."
              helperText="Use as variáveis abaixo para personalizar a mensagem"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', pt: 1.5 }}>
                    <TextIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary" gutterBottom fontWeight={500}>
              Variáveis disponíveis:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {[
                '{name}', '{email}', '{phone}', '{landing_page}', 
                '{date}', '{submission_id}'
              ].map((variable) => (
                <Chip
                  key={variable}
                  label={variable}
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => setTempMessageTemplate(prev => prev + variable)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Grid>
          
          {previewMessage && (
            <Grid item xs={12}>
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pré-visualização da Mensagem:
                </Typography>
                <Box
                  sx={{
                    backgroundColor: '#e2f7e2',
                    p: 2,
                    borderRadius: 1,
                    whiteSpace: 'pre-line',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  {generateExampleMessage(tempMessageTemplate) || "Configure um template para ver a pré-visualização."}
                </Box>
              </Alert>
            </Grid>
          )}
        </Grid>
      </BaseModal>
      
      {/* Modal - Configuração de Confirmação */}
      <BaseModal
        open={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        title="Configurar Mensagem de Confirmação"
        maxWidth="md"
        actions={[
          {
            label: "Cancelar",
            onClick: () => setConfirmationModalOpen(false),
            variant: "outlined",
            color: "inherit"
          },
          {
            label: "Salvar",
            onClick: handleSaveConfirmationConfig,
            variant: "contained",
            color: "primary",
            icon: <CheckIcon />
          }
        ]}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Imagem de Confirmação
            </Typography>
            <ImageUploader
              currentImage={tempConfirmationConfig.imageUrl}
              onImageUpload={(url) => setTempConfirmationConfig(prev => ({ ...prev, imageUrl: url }))}
              maxSize={2 * 1024 * 1024}
              acceptedTypes={['image/jpeg', 'image/png', 'image/gif']}
              height={200}
              landingPageId={landingPage.id}
            />
            
            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ImageIcon />}
                onClick={() => setMediaManagerOpen(true)}
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Selecionar da Biblioteca
              </Button>
              
              {tempConfirmationConfig.imageUrl && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setTempConfirmationConfig(prev => ({ ...prev, imageUrl: '' }))}
                  fullWidth
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  Remover Imagem
                </Button>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Mensagem de Confirmação"
              value={tempConfirmationConfig.caption || ''}
              onChange={(e) => setTempConfirmationConfig(prev => ({
                ...prev,
                caption: e.target.value
              }))}
              variant="outlined"
              placeholder="Digite a mensagem que será enviada junto com a imagem..."
              helperText="Esta mensagem será enviada para o contato após o preenchimento do formulário"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={tempConfirmationConfig.sendBefore}
                  onChange={(e) => setTempConfirmationConfig(prev => ({
                    ...prev,
                    sendBefore: e.target.checked
                  }))}
                  color="primary"
                />
              }
              label="Enviar antes do convite do grupo"
              sx={{ mt: 2 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                A mensagem de confirmação será enviada para o número de WhatsApp informado 
                pelo contato no formulário. Certifique-se de que seu formulário possui um campo de telefone.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </BaseModal>
      
      {/* Modal - Gerenciador de Mídia */}
      <BaseModal
        open={mediaManagerOpen}
        onClose={() => setMediaManagerOpen(false)}
        title="Selecionar Imagem"
        maxWidth="lg"
      >
        {landingPage && landingPage.id && (
          <FileManager
            landingPageId={landingPage.id}
            allowedTypes={['image/*']}
            maxFileSize={5 * 1024 * 1024}
            multipleSelection={false}
            onFileSelect={handleFileSelect}
          />
        )}
      </BaseModal>
    </AnimatedPaper>
  );
};

export default NotificationsTab;