import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Link,
  Alert,
  Tooltip,
  IconButton,
  Chip,
  Collapse,
  Autocomplete,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  FileUpload as FileUploadIcon,
  File as FileIcon,
  Help as HelpIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  PhoneAndroid as PhoneIcon,
  Message as MessageIcon,
  FormatColorText as TextIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  InsertLink as InsertLinkIcon,
  LocalOffer as TagIcon,
  Group as GroupIcon,
  Image as ImageIcon,
  CheckOutlined as CheckIcon,
  CloseOutlined as CloseIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { isValidPhoneNumber } from '../../../../utils/stringUtils';
import { PhoneTextField } from '../PhoneNumberMask';
import FileManager from '../FileManager';
import api from '../../../../services/api';
import { enqueueSnackbar } from 'notistack';
import { AuthContext } from '../../../../context/Auth/AuthContext';
import BaseModal from '../../../../components/BaseModal';
import ImageUploader from '../ImageUploader';

const AnimatedPaper = animated(Paper);
const AnimatedBox = animated(Box);

const AdvancedConfigTab = ({ landingPage, setLandingPage }) => {
  const { user } = React.useContext(AuthContext);
  const theme = useTheme();
  const [whatsappConnections, setWhatsappConnections] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [selectedImageTarget, setSelectedImageTarget] = useState(null); // 'groupInvite' ou null
  
  // Estado para armazenar as tags selecionadas
  const [selectedTags, setSelectedTags] = useState(landingPage.advancedConfig?.contactTags || []);

  // Verificar se notificationConnectionId está definido
  useEffect(() => {
    if (!landingPage.advancedConfig?.notificationConnectionId && whatsappConnections.length > 0) {
      setLandingPage(prev => ({
        ...prev,
        advancedConfig: {
          ...prev.advancedConfig,
          notificationConnectionId: whatsappConnections[0].id
        }
      }));
    }
  }, [whatsappConnections, landingPage.advancedConfig?.notificationConnectionId, setLandingPage]);

  // Inicializar a configuração de mensagem de convite se não existir
  useEffect(() => {
    if (!landingPage.advancedConfig?.groupInviteMessage && landingPage.advancedConfig?.inviteGroupId) {
      setLandingPage(prev => ({
        ...prev,
        advancedConfig: {
          ...prev.advancedConfig,
          groupInviteMessage: {
            enabled: true,
            message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp. Clique no link abaixo para entrar:',
            imageUrl: ''
          }
        }
      }));
    }
  }, [landingPage.advancedConfig?.inviteGroupId, landingPage.advancedConfig?.groupInviteMessage, setLandingPage]);

  // Carregar conexões WhatsApp disponíveis
  useEffect(() => {
    const fetchWhatsappConnections = async () => {
      try {
        setLoadingConnections(true);
        const response = await api.get('/whatsapp');
        const activeConnections = response.data.filter(conn => conn.status === 'CONNECTED');
        setWhatsappConnections(activeConnections);
      } catch (error) {
        console.error('Erro ao carregar conexões WhatsApp:', error);
      } finally {
        setLoadingConnections(false);
      }
    };
    
    fetchWhatsappConnections();
  }, []);

  // Carregar tags disponíveis
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const response = await api.get('/tags/list');
        setTags(response.data);
      } catch (error) {
        console.error('Erro ao carregar tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };
    
    fetchTags();
  }, []);

  // Inicializar selectedTags a partir do landingPage
  useEffect(() => {
    if (landingPage.advancedConfig?.contactTags) {
      setSelectedTags(landingPage.advancedConfig.contactTags);
    }
  }, [landingPage.advancedConfig?.contactTags]);

  // NOVA FUNÇÃO: Carregar grupos disponíveis
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await api.get('/groups');
        setGroups(response.data.groups || []);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        enqueueSnackbar('Erro ao carregar lista de grupos', { variant: 'error' });
      } finally {
        setLoadingGroups(false);
      }
    };
    
    fetchGroups();
  }, []);
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

  const fileManagerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 300,
    config: { tension: 280, friction: 60 }
  });
  
  // Handler para alteração do ID do Meta Pixel
  const handleMetaPixelChange = (e) => {
    const metaPixelId = e.target.value;
    
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        metaPixelId
      }
    }));
  };
  
  // Handler para alteração da conexão de notificação
  const handleNotificationConnectionChange = (e) => {
    const notificationConnectionId = e.target.value;
    
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        notificationConnectionId
      }
    }));
  };
  
  // Handler para alteração do grupo selecionado
  const handleGroupChange = (e) => {
    const inviteGroupId = e.target.value;
    
    // Se não tem mensagem de convite configurada ainda, criar uma padrão
    const currentInviteMessage = landingPage.advancedConfig?.groupInviteMessage;
    const updatedInviteMessage = currentInviteMessage || {
      enabled: true,
      message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp. Clique no link abaixo para entrar:',
      imageUrl: ''
    };
    
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        inviteGroupId,
        // Incluir a mensagem de convite se tiver um grupo configurado
        groupInviteMessage: inviteGroupId ? updatedInviteMessage : null
      }
    }));
  };
  
  // Toggle para habilitar/desabilitar mensagem personalizada do convite
  const handleToggleGroupInviteMessage = (e) => {
    const enabled = e.target.checked;
    
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.advancedConfig?.groupInviteMessage || {
        enabled: false,
        message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp. Clique no link abaixo para entrar:',
        imageUrl: ''
      };
      
      return {
        ...prev,
        advancedConfig: {
          ...prev.advancedConfig,
          groupInviteMessage: {
            ...currentConfig,
            enabled
          }
        }
      };
    });
  };
  
  // Handler para alterar a mensagem do convite do grupo
  const handleGroupInviteMessageChange = (e) => {
    const message = e.target.value;
    
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.advancedConfig?.groupInviteMessage || {
        enabled: true,
        message: '',
        imageUrl: ''
      };
      
      return {
        ...prev,
        advancedConfig: {
          ...prev.advancedConfig,
          groupInviteMessage: {
            ...currentConfig,
            message
          }
        }
      };
    });
  };
  
  // Handler para upload de imagem para convite de grupo
  const handleGroupInviteImageUpload = (imageUrl) => {
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.advancedConfig?.groupInviteMessage || {
        enabled: true,
        message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp. Clique no link abaixo para entrar:',
        imageUrl: ''
      };
      
      return {
        ...prev,
        advancedConfig: {
          ...prev.advancedConfig,
          groupInviteMessage: {
            ...currentConfig,
            imageUrl
          }
        }
      };
    });
  };
  
  // Handler para remover imagem do convite de grupo
  const handleRemoveGroupInviteImage = () => {
    setLandingPage(prev => {
      // Inicializar a configuração se não existir
      const currentConfig = prev.advancedConfig?.groupInviteMessage || {
        enabled: true,
        message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp. Clique no link abaixo para entrar:',
        imageUrl: ''
      };
      
      return {
        ...prev,
        advancedConfig: {
          ...prev.advancedConfig,
          groupInviteMessage: {
            ...currentConfig,
            imageUrl: ''
          }
        }
      };
    });
  };
  
  // Handler para alternar botão de chat WhatsApp
  const handleToggleWhatsAppChat = (e) => {
    const enabled = e.target.checked;
    
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        whatsAppChatButton: {
          ...prev.advancedConfig.whatsAppChatButton,
          enabled
        }
      }
    }));
  };
  
  // Handler para alteração do número do WhatsApp de chat
  const handleWhatsAppNumberChange = (e) => {
    const number = e.target.value;
    
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        whatsAppChatButton: {
          ...prev.advancedConfig.whatsAppChatButton,
          number
        }
      }
    }));
  };
  
  // Handler para alteração da mensagem padrão do chat
  const handleDefaultMessageChange = (e) => {
    const defaultMessage = e.target.value;
    
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        whatsAppChatButton: {
          ...prev.advancedConfig.whatsAppChatButton,
          defaultMessage
        }
      }
    }));
  };

  // Handler para alteração das tags selecionadas
  const handleTagsChange = (event, newTags) => {
    setSelectedTags(newTags);
    
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        contactTags: newTags
      }
    }));
  };
  
  // Abrir gerenciador de mídia para selecionar imagem
  const handleOpenMediaManager = (target) => {
    setSelectedImageTarget(target);
    setMediaManagerOpen(true);
  };
  
  // Fechar gerenciador de mídia
  const handleCloseMediaManager = () => {
    setMediaManagerOpen(false);
    setSelectedImageTarget(null);
  };
  
  // Handler para selecionar um arquivo do gerenciador
  const handleFileSelect = (file) => {
    if (file.mimeType.startsWith('image/')) {
      if (selectedImageTarget === 'groupInvite') {
        handleGroupInviteImageUpload(file.url);
      }
    }
    
    // Fechar o gerenciador de mídia
    handleCloseMediaManager();
  };
  
  // Verificar se o número de WhatsApp é válido
  const isWhatsAppNumberValid = () => {
    const number = landingPage.advancedConfig?.whatsAppChatButton?.number;
    return number ? isValidPhoneNumber(number) : false;
  };
  
  // Acessar a configuração de mensagem de convite do grupo
  const groupInviteMessage = landingPage.advancedConfig?.groupInviteMessage || {
    enabled: false,
    message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp. Clique no link abaixo para entrar:',
    imageUrl: ''
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
        <SettingsIcon sx={{ mr: 1 }} />
        Configurações Avançadas
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.primary.main}`
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <FacebookIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Integração com Meta Pixel
              </Typography>
              <Tooltip title="O Meta Pixel ajuda a rastrear visitantes e conversões para otimizar suas campanhas no Facebook e Instagram">
                <IconButton size="small">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <TextField
              fullWidth
              label="ID do Meta Pixel"
              value={landingPage.advancedConfig.metaPixelId || ''}
              onChange={handleMetaPixelChange}
              variant="outlined"
              placeholder="Exemplo: 123456789012345"
              helperText={
                <Box component="span">
                  ID numérico do seu Meta Pixel. Saiba mais na{' '}
                  <Link 
                    href="https://www.facebook.com/business/help/952192354843755" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    documentação oficial
                    <InsertLinkIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Link>
                </Box>
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CodeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.info.main}`
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <SettingsIcon sx={{ mr: 1, color: theme.palette.info.main, fontSize: 28 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Configurações de Notificação
              </Typography>
              <Tooltip title="Escolha qual conexão do WhatsApp será usada para enviar notificações de submissões de formulário">
                <IconButton size="small">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <FormControl fullWidth variant="outlined">
              <InputLabel>Conexão para Notificações</InputLabel>
              <Select
                value={landingPage.advancedConfig?.notificationConnectionId || ''}
                onChange={handleNotificationConnectionChange}
                label="Conexão para Notificações"
                startAdornment={
                  <InputAdornment position="start">
                    <WhatsAppIcon color="action" />
                  </InputAdornment>
                }
                endAdornment={
                  loadingConnections && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  )
                }
              >
                {whatsappConnections.length === 0 ? (
                  <MenuItem disabled value="">
                    <em>Nenhuma conexão disponível</em>
                  </MenuItem>
                ) : (
                  whatsappConnections.map((conn) => (
                    <MenuItem key={conn.id} value={conn.id}>
                      {conn.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            {/* Seletor de Grupo para Convite */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={500} sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 1, fontSize: 'small' }} />
                Grupo para Convite Automático
                <Tooltip title="Quando o visitante preencher o formulário, receberá um convite para este grupo no WhatsApp">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                <InputLabel>Selecione um Grupo</InputLabel>
                <Select
                  value={landingPage.advancedConfig?.inviteGroupId || ''}
                  onChange={handleGroupChange}
                  label="Selecione um Grupo"
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupIcon color="action" />
                    </InputAdornment>
                  }
                  endAdornment={
                    loadingGroups && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )
                  }
                >
                  <MenuItem value="">
                    <em>Nenhum grupo (desabilitado)</em>
                  </MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.subject || `Grupo ${group.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Nova seção para personalizar mensagem de convite para o grupo */}
              {landingPage.advancedConfig?.inviteGroupId && (
                <Box sx={{ mt: 3, ml: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={groupInviteMessage.enabled}
                        onChange={handleToggleGroupInviteMessage}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          Personalizar mensagem de convite
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Personalize o texto e adicione uma imagem à mensagem de convite para o grupo
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Collapse in={groupInviteMessage.enabled}>
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <ImageUploader
                              currentImage={groupInviteMessage.imageUrl}
                              onImageUpload={handleGroupInviteImageUpload}
                              maxSize={2 * 1024 * 1024} // 2MB
                              acceptedTypes={['image/jpeg', 'image/png', 'image/gif']}
                              height={200}
                              landingPageId={landingPage.id}
                            />
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box display="flex" flexDirection="column" height="100%" justifyContent="center">
                            {groupInviteMessage.imageUrl ? (
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
                              onClick={() => handleOpenMediaManager('groupInvite')}
                            >
                              Selecionar da Biblioteca
                            </Button>
                            
                            {groupInviteMessage.imageUrl && (
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={handleRemoveGroupInviteImage}
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
                            label="Mensagem do Convite"
                            value={groupInviteMessage.message}
                            onChange={handleGroupInviteMessageChange}
                            variant="outlined"
                            placeholder="Digite a mensagem que precederá o link do grupo..."
                            helperText="O link do grupo será adicionado automaticamente no final desta mensagem."
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
                          Esta mensagem (com ou sem imagem) será enviada para o contato com o link do grupo adicionado automaticamente no final.
                          Use {'{nome}'} para incluir o nome do contato na mensagem.
                        </Typography>
                      </Alert>
                    </Box>
                  </Collapse>
                </Box>
              )}
              
              {landingPage.advancedConfig?.inviteGroupId && (
                <Alert 
                  severity="info" 
                  variant="outlined" 
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    Quando um visitante preencher o formulário, ele receberá uma mensagem com link de convite para 
                    participar do grupo selecionado. Isso é útil para comunidades, cursos ou suporte.
                  </Typography>
                </Alert>
              )}
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags para Contatos
              </Typography>
              <Autocomplete
                multiple
                options={tags}
                value={selectedTags}
                onChange={handleTagsChange}
                getOptionLabel={(option) => option.name}
                loading={loadingTags}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags para novos contatos"
                    variant="outlined"
                    placeholder="Selecione as tags..."
                    helperText="Tags que serão atribuídas aos contatos que preencherem o formulário"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <TagIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {loadingTags ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      style={{ backgroundColor: option.color, color: '#fff' }}
                    />
                  ))
                }
              />
              <Alert 
                severity="info" 
                variant="outlined" 
                sx={{ mt: 2, borderRadius: 2 }}
              >
                <Typography variant="body2">
                  As tags selecionadas serão automaticamente atribuídas aos contatos que preencherem o formulário.
                  Isso facilita a segmentação e automação de mensagens para estes contatos.
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.success.main}`
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <WhatsAppIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="subtitle1" fontWeight={500}>
                  Botão de Chat WhatsApp
                </Typography>
              </Box>
              
              <Chip 
                label={landingPage.advancedConfig.whatsAppChatButton?.enabled ? "Ativado" : "Desativado"}
                color={landingPage.advancedConfig.whatsAppChatButton?.enabled ? "success" : "default"}
                variant={landingPage.advancedConfig.whatsAppChatButton?.enabled ? "filled" : "outlined"}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={landingPage.advancedConfig.whatsAppChatButton?.enabled || false}
                  onChange={handleToggleWhatsAppChat}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">
                    {landingPage.advancedConfig.whatsAppChatButton?.enabled
                      ? "Exibir botão de chat WhatsApp"
                      : "Botão de chat WhatsApp desativado"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Adiciona um botão flutuante para iniciar um chat no WhatsApp diretamente da sua landing page.
                  </Typography>
                </Box>
              }
            />
            
            <Collapse in={landingPage.advancedConfig.whatsAppChatButton?.enabled}>
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <PhoneTextField
                      label="Número do WhatsApp"
                      name="whatsAppNumber"
                      value={landingPage.advancedConfig.whatsAppChatButton?.number || ''}
                      onChange={handleWhatsAppNumberChange}
                      placeholder="+5511999998888"
                      error={!isWhatsAppNumberValid() && !!landingPage.advancedConfig.whatsAppChatButton?.number}
                      helperText={
                        !isWhatsAppNumberValid() && !!landingPage.advancedConfig.whatsAppChatButton?.number
                          ? "Formato inválido. Use o formato internacional (+5511999998888)"
                          : "Use o formato internacional com prefixo de país"
                      }
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mensagem Padrão"
                      value={landingPage.advancedConfig.whatsAppChatButton?.defaultMessage || ''}
                      onChange={handleDefaultMessageChange}
                      variant="outlined"
                      placeholder="Olá! Gostaria de mais informações sobre..."
                      helperText="Mensagem que será pré-preenchida quando o visitante clicar no botão de chat"
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', pt: 1.5 }}>
                            <MessageIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Use {'{landing_page}'} para incluir o nome da landing page na mensagem.
                    </Typography>
                  </Grid>
                </Grid>
                
                <Alert 
                  severity="info" 
                  variant="outlined" 
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    O botão de chat WhatsApp aparecerá no canto inferior direito da sua landing page. 
                    Os visitantes poderão clicar para iniciar uma conversa direta com você no WhatsApp.
                  </Typography>
                </Alert>
              </Box>
            </Collapse>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          
          <AnimatedBox
            style={fileManagerAnimation}
          >
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3,
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.primary.light}`
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <FileUploadIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="subtitle1" fontWeight={500}>
                  Gerenciamento de Arquivos
                </Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Gerencie imagens e arquivos que podem ser utilizados na sua landing page.
                Os arquivos ficam armazenados para reuso em qualquer conteúdo.
              </Typography>
              
              <FileManager
                allowedTypes={[
                  'image/jpeg',
                  'image/png',
                  'image/gif',
                  'application/pdf',
                  'video/mp4'
                ]}
                maxFileSize={5 * 1024 * 1024} // 5MB
                multipleSelection={true}
                landingPageId={landingPage.id}
              />
            </Paper>
          </AnimatedBox>
        </Grid>
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

export default AdvancedConfigTab;