import React, { useState } from 'react';
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
  Card,
  CardContent,
  Collapse,
  Chip,
  IconButton,
  Tooltip
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
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { isValidPhoneNumber } from '../../../../utils/stringUtils';
import { PhoneTextField } from '../PhoneNumberMask';
import StandardTabContent from '../../../../components/shared/StandardTabContent';
import BaseModal from '../../../../components/shared/BaseModal';
import FileManager from '../FileManager';
import ImageUploader from '../ImageUploader';

const AnimatedCard = animated(Card);

const NotificationsTab = ({ landingPage, setLandingPage }) => {
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
  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
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
  
  // Estatísticas para o header
  const stats = [
    {
      label: landingPage.notificationConfig.enableWhatsApp ? 'WhatsApp Ativo' : 'WhatsApp Inativo',
      icon: <WhatsAppIcon />,
      color: landingPage.notificationConfig.enableWhatsApp ? 'success' : 'default',
      variant: 'filled'
    },
    {
      label: landingPage.notificationConfig.confirmationMessage?.enabled 
        ? 'Confirmação Ativa' : 'Confirmação Inativa',
      icon: <CheckIcon />,
      color: landingPage.notificationConfig.confirmationMessage?.enabled ? 'info' : 'default',
      variant: 'outlined'
    }
  ];
  
  // Alertas
  const alerts = [];
  
  if (landingPage.notificationConfig.enableWhatsApp && !isWhatsAppNumberValid()) {
    alerts.push({
      severity: 'warning',
      title: 'Número de WhatsApp Inválido',
      message: 'Configure um número válido para receber as notificações.',
    });
  }
  
  if (landingPage.notificationConfig.enableWhatsApp && !landingPage.notificationConfig.messageTemplate) {
    alerts.push({
      severity: 'info',
      title: 'Template de Mensagem',
      message: 'Configure um template personalizado para as notificações.',
    });
  }
  
  return (
    <StandardTabContent
      title="Configurações de Notificações"
      description="Configure como e quando você será notificado sobre novos leads"
      icon={<NotificationsIcon />}
      stats={stats}
      alerts={alerts}
      variant="padded"
    >
      <Grid container spacing={3}>
        {/* Configuração Principal do WhatsApp */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <WhatsAppIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={500}>
                    Notificações por WhatsApp
                  </Typography>
                </Box>
                
                <Switch
                  checked={landingPage.notificationConfig.enableWhatsApp}
                  onChange={handleToggleWhatsApp}
                  color="success"
                />
              </Box>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Receba notificações instantâneas no WhatsApp sempre que alguém preencher 
                o formulário da sua landing page.
              </Typography>
              
              <Collapse in={landingPage.notificationConfig.enableWhatsApp}>
                <Box mt={2}>
                  <Grid container spacing={2}>
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
                            ? "Número que receberá as notificações"
                            : "Formato inválido. Use o formato internacional"
                        }
                        required
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" height="100%">
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setTempMessageTemplate(landingPage.notificationConfig.messageTemplate || '');
                            setTemplateModalOpen(true);
                          }}
                          fullWidth
                          sx={{ height: '56px' }}
                        >
                          {landingPage.notificationConfig.messageTemplate 
                            ? 'Editar Template' 
                            : 'Configurar Template'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Mensagem de Confirmação para Contato */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <MessageIcon color="info" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={500}>
                    Mensagem de Confirmação
                  </Typography>
                </Box>
                
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
              </Box>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Envie uma mensagem automática de confirmação para o contato que preencheu o formulário.
              </Typography>
              
              <Collapse in={landingPage.notificationConfig.confirmationMessage?.enabled}>
                <Box mt={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box textAlign="center">
                        {landingPage.notificationConfig.confirmationMessage?.imageUrl ? (
                          <Box
                            component="img"
                            src={landingPage.notificationConfig.confirmationMessage.imageUrl}
                            alt="Imagem de confirmação"
                            sx={{
                              maxWidth: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid rgba(0,0,0,0.12)'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 120,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px dashed rgba(0,0,0,0.12)',
                              borderRadius: 1,
                              color: 'text.secondary'
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 48 }} />
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        color="primary"
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
                        fullWidth
                      >
                        Configurar Confirmação
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Resumo das Configurações */}
        {landingPage.notificationConfig.enableWhatsApp && (
          <Grid item xs={12}>
            <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Configurações ativas:</strong>
                <br />
                • Notificações para: {landingPage.notificationConfig.whatsAppNumber || 'Não configurado'}
                <br />
                • Template: {landingPage.notificationConfig.messageTemplate ? 'Configurado' : 'Padrão'}
                <br />
                • Confirmação: {landingPage.notificationConfig.confirmationMessage?.enabled ? 'Ativada' : 'Desativada'}
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
            icon: <SaveIcon />
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
                  sx={{ mt: 1 }}
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
    </StandardTabContent>
  );
};

export default NotificationsTab;