import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button,
  Alert,
  Chip,
  Collapse,
  Autocomplete,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Settings as SettingsIcon,
  PhoneAndroid as PhoneIcon,
  Message as MessageIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  LocalOffer as TagIcon,
  Group as GroupIcon,
  Image as ImageIcon,
  CheckOutlined as CheckIcon,
  Edit as EditIcon,
  Add as AddIcon,
  InsertLink as InsertLinkIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { isValidPhoneNumber } from '../../../../utils/stringUtils';
import { PhoneTextField } from '../PhoneNumberMask';
import StandardTabContent from '../../../../components/shared/StandardTabContent';
import BaseModal from '../../../../components/shared/BaseModal';
import FileManager from '../FileManager';
import ImageUploader from '../ImageUploader';
import api from '../../../../services/api';
import { AuthContext } from '../../../../context/Auth/AuthContext';

const AdvancedConfigTab = ({ landingPage, setLandingPage }) => {
  const { user } = useContext(AuthContext);
  
  // Estados para dados externos
  const [whatsappConnections, setWhatsappConnections] = useState([]);
  const [tags, setTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  // Estados para modais
  const [pixelModalOpen, setPixelModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [selectedImageTarget, setSelectedImageTarget] = useState(null);
  
  // Estados temporários para edição
  const [tempPixelId, setTempPixelId] = useState(landingPage.advancedConfig?.metaPixelId || '');
  const [tempChatConfig, setTempChatConfig] = useState(
    landingPage.advancedConfig?.whatsAppChatButton || {
      enabled: false,
      number: '',
      defaultMessage: 'Olá! Gostaria de saber mais sobre {landing_page}'
    }
  );
  const [tempGroupConfig, setTempGroupConfig] = useState({
    inviteGroupId: landingPage.advancedConfig?.inviteGroupId || '',
    groupInviteMessage: landingPage.advancedConfig?.groupInviteMessage || {
      enabled: false,
      message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp.',
      imageUrl: ''
    }
  });
  
  // Estado para tags selecionadas
  const [selectedTags, setSelectedTags] = useState(
    landingPage.advancedConfig?.contactTags || []
  );

  // Carregar dados externos
  useEffect(() => {
    const loadExternalData = async () => {
      try {
        // Carregar conexões WhatsApp
        setLoadingConnections(true);
        const connectionsResponse = await api.get('/whatsapp');
        setWhatsappConnections(connectionsResponse.data.filter(conn => conn.status === 'CONNECTED'));
        
        // Carregar tags
        setLoadingTags(true);
        const tagsResponse = await api.get('/tags/list');
        setTags(tagsResponse.data);
        
        // Carregar grupos
        setLoadingGroups(true);
        const groupsResponse = await api.get('/groups');
        setGroups(groupsResponse.data.groups || []);
        
      } catch (error) {
        console.error('Erro ao carregar dados externos:', error);
      } finally {
        setLoadingConnections(false);
        setLoadingTags(false);
        setLoadingGroups(false);
      }
    };
    
    loadExternalData();
  }, []);

  // Configurar conexão padrão se não existir
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

  // Handlers para salvamento
  const handleSavePixelConfig = () => {
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        metaPixelId: tempPixelId
      }
    }));
    setPixelModalOpen(false);
  };

  const handleSaveChatConfig = () => {
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        whatsAppChatButton: tempChatConfig
      }
    }));
    setChatModalOpen(false);
  };

  const handleSaveGroupConfig = () => {
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        inviteGroupId: tempGroupConfig.inviteGroupId,
        groupInviteMessage: tempGroupConfig.inviteGroupId ? tempGroupConfig.groupInviteMessage : null
      }
    }));
    setGroupModalOpen(false);
  };

  // Handlers para mudanças simples
  const handleNotificationConnectionChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      advancedConfig: {
        ...prev.advancedConfig,
        notificationConnectionId: e.target.value
      }
    }));
  };

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

  // Handlers para imagens
  const handleFileSelect = (file) => {
    if (file.mimeType.startsWith('image/')) {
      if (selectedImageTarget === 'groupInvite') {
        setTempGroupConfig(prev => ({
          ...prev,
          groupInviteMessage: {
            ...prev.groupInviteMessage,
            imageUrl: file.url
          }
        }));
      }
    }
    setMediaManagerOpen(false);
  };

  // Verificações
  const isWhatsAppNumberValid = (number) => {
    return number ? isValidPhoneNumber(number) : false;
  };

  // Estatísticas para o header
  const stats = [
    {
      label: landingPage.advancedConfig?.metaPixelId ? 'Meta Pixel Ativo' : 'Meta Pixel Inativo',
      icon: <FacebookIcon />,
      color: landingPage.advancedConfig?.metaPixelId ? 'primary' : 'default',
      variant: 'outlined'
    },
    {
      label: landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'Chat Ativo' : 'Chat Inativo',
      icon: <WhatsAppIcon />,
      color: landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'success' : 'default',
      variant: 'outlined'
    },
    {
      label: `${selectedTags.length} Tags`,
      icon: <TagIcon />,
      color: selectedTags.length > 0 ? 'secondary' : 'default',
      variant: 'filled'
    }
  ];

  // Alertas
  const alerts = [];
  
  if (landingPage.advancedConfig?.whatsAppChatButton?.enabled && 
      !isWhatsAppNumberValid(landingPage.advancedConfig.whatsAppChatButton.number)) {
    alerts.push({
      severity: 'warning',
      title: 'Botão de Chat WhatsApp',
      message: 'Configure um número válido para o botão de chat funcionar corretamente.',
    });
  }

  return (
    <StandardTabContent
      title="Configurações Avançadas"
      description="Configure integrações e funcionalidades avançadas da sua landing page"
      icon={<SettingsIcon />}
      stats={stats}
      alerts={alerts}
      variant="padded"
    >
      <Grid container spacing={3}>
        {/* Configurações Básicas */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'primary.main',
            mb: 2
          }}>
            <InfoIcon sx={{ mr: 1 }} />
            Configurações do Sistema
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Conexão de Notificação
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Escolha qual conexão WhatsApp será usada para enviar notificações
                  </Typography>
                  
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Conexão WhatsApp</InputLabel>
                    <Select
                      value={landingPage.advancedConfig?.notificationConnectionId || ''}
                      onChange={handleNotificationConnectionChange}
                      label="Conexão WhatsApp"
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
                            <Box display="flex" alignItems="center">
                              <WhatsAppIcon color="success" sx={{ mr: 1, fontSize: 'small' }} />
                              {conn.name}
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Tags para Contatos
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Tags aplicadas automaticamente aos novos contatos
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
                        size="small"
                        placeholder="Selecione as tags..."
                        InputProps={{
                          ...params.InputProps,
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
                          size="small"
                          style={{ backgroundColor: option.color, color: '#fff' }}
                        />
                      ))
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Integrações */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'primary.main',
            mb: 2
          }}>
            <CodeIcon sx={{ mr: 1 }} />
            Integrações e Rastreamento
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <FacebookIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>
                      Meta Pixel
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Configure o Meta Pixel para rastrear conversões
                  </Typography>
                  <Chip
                    label={landingPage.advancedConfig?.metaPixelId ? 'Configurado' : 'Não configurado'}
                    color={landingPage.advancedConfig?.metaPixelId ? 'success' : 'default'}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setTempPixelId(landingPage.advancedConfig?.metaPixelId || '');
                      setPixelModalOpen(true);
                    }}
                  >
                    Configurar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <WhatsAppIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>
                      Botão de Chat
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Botão flutuante para contato direto
                  </Typography>
                  <Chip
                    label={landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'Ativo' : 'Inativo'}
                    color={landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'success' : 'default'}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setTempChatConfig(landingPage.advancedConfig?.whatsAppChatButton || {
                        enabled: false,
                        number: '',
                        defaultMessage: 'Olá! Gostaria de saber mais sobre {landing_page}'
                      });
                      setChatModalOpen(true);
                    }}
                  >
                    Configurar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>
                      Convite para Grupo
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Convite automático para grupo WhatsApp
                  </Typography>
                  <Chip
                    label={landingPage.advancedConfig?.inviteGroupId ? 'Configurado' : 'Não configurado'}
                    color={landingPage.advancedConfig?.inviteGroupId ? 'info' : 'default'}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setTempGroupConfig({
                        inviteGroupId: landingPage.advancedConfig?.inviteGroupId || '',
                        groupInviteMessage: landingPage.advancedConfig?.groupInviteMessage || {
                          enabled: false,
                          message: 'Olá! Obrigado por se cadastrar. Você foi convidado para participar do nosso grupo no WhatsApp.',
                          imageUrl: ''
                        }
                      });
                      setGroupModalOpen(true);
                    }}
                  >
                    Configurar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Modal - Meta Pixel */}
      <BaseModal
        open={pixelModalOpen}
        onClose={() => setPixelModalOpen(false)}
        title="Configurar Meta Pixel"
        maxWidth="sm"
        actions={[
          {
            label: "Cancelar",
            onClick: () => setPixelModalOpen(false),
            variant: "outlined",
            color: "inherit"
          },
          {
            label: "Salvar",
            onClick: handleSavePixelConfig,
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
              label="ID do Meta Pixel"
              value={tempPixelId}
              onChange={(e) => setTempPixelId(e.target.value)}
              variant="outlined"
              placeholder="123456789012345"
              helperText="ID numérico do seu Meta Pixel (somente números)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FacebookIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                O Meta Pixel ajuda a rastrear visitantes e conversões para otimizar suas campanhas no Facebook e Instagram.
                <br /><br />
                <strong>Como encontrar o ID:</strong>
                <br />
                1. Acesse o Gerenciador de Eventos do Facebook
                <br />
                2. Selecione seu pixel
                <br />
                3. O ID aparece no topo da página
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </BaseModal>

      {/* Modal - Botão de Chat WhatsApp */}
      <BaseModal
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        title="Configurar Botão de Chat WhatsApp"
        maxWidth="md"
        actions={[
          {
            label: "Cancelar",
            onClick: () => setChatModalOpen(false),
            variant: "outlined",
            color: "inherit"
          },
          {
            label: "Salvar",
            onClick: handleSaveChatConfig,
            variant: "contained",
            color: "primary",
            icon: <CheckIcon />
          }
        ]}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={tempChatConfig.enabled}
                  onChange={(e) => setTempChatConfig(prev => ({
                    ...prev,
                    enabled: e.target.checked
                  }))}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">
                    Exibir botão de chat WhatsApp
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Adiciona um botão flutuante no canto inferior direito da página
                  </Typography>
                </Box>
              }
            />
          </Grid>
          
          <Collapse in={tempChatConfig.enabled}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <PhoneTextField
                    label="Número do WhatsApp"
                    name="whatsAppNumber"
                    value={tempChatConfig.number || ''}
                    onChange={(e) => setTempChatConfig(prev => ({
                      ...prev,
                      number: e.target.value
                    }))}
                    placeholder="+5511999998888"
                    error={!isWhatsAppNumberValid(tempChatConfig.number) && !!tempChatConfig.number}
                    helperText={
                      !isWhatsAppNumberValid(tempChatConfig.number) && !!tempChatConfig.number
                        ? "Formato inválido. Use o formato internacional"
                        : "Número que receberá as mensagens do chat"
                    }
                    required
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mensagem Padrão"
                    value={tempChatConfig.defaultMessage || ''}
                    onChange={(e) => setTempChatConfig(prev => ({
                      ...prev,
                      defaultMessage: e.target.value
                    }))}
                    variant="outlined"
                    placeholder="Olá! Gostaria de mais informações sobre..."
                    helperText="Mensagem pré-preenchida quando o visitante clicar no botão"
                    multiline
                    rows={3}
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
            </Grid>
          </Collapse>
          
          <Grid item xs={12}>
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                O botão de chat WhatsApp aparecerá como um ícone flutuante no canto inferior direito 
                da sua landing page, permitindo que os visitantes iniciem uma conversa direta com você.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </BaseModal>

      {/* Modal - Convite para Grupo */}
      <BaseModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title="Configurar Convite para Grupo"
        maxWidth="md"
        actions={[
          {
            label: "Cancelar",
            onClick: () => setGroupModalOpen(false),
            variant: "outlined",
            color: "inherit"
          },
          {
            label: "Salvar",
            onClick: handleSaveGroupConfig,
            variant: "contained",
            color: "primary",
            icon: <CheckIcon />
          }
        ]}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Selecionar Grupo</InputLabel>
              <Select
                value={tempGroupConfig.inviteGroupId}
                onChange={(e) => setTempGroupConfig(prev => ({
                  ...prev,
                  inviteGroupId: e.target.value
                }))}
                label="Selecionar Grupo"
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
                    <Box display="flex" alignItems="center">
                      <GroupIcon color="primary" sx={{ mr: 1, fontSize: 'small' }} />
                      {group.subject || `Grupo ${group.id}`}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Collapse in={!!tempGroupConfig.inviteGroupId}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tempGroupConfig.groupInviteMessage.enabled}
                    onChange={(e) => setTempGroupConfig(prev => ({
                      ...prev,
                      groupInviteMessage: {
                        ...prev.groupInviteMessage,
                        enabled: e.target.checked
                      }
                    }))}
                    color="primary"
                  />
                }
                label="Personalizar mensagem de convite"
                sx={{ mb: 2 }}
              />
              
              <Collapse in={tempGroupConfig.groupInviteMessage.enabled}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Imagem do Convite
                    </Typography>
                    <ImageUploader
                      currentImage={tempGroupConfig.groupInviteMessage.imageUrl}
                      onImageUpload={(url) => setTempGroupConfig(prev => ({
                        ...prev,
                        groupInviteMessage: {
                          ...prev.groupInviteMessage,
                          imageUrl: url
                        }
                      }))}
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
                        onClick={() => {
                          setSelectedImageTarget('groupInvite');
                          setMediaManagerOpen(true);
                        }}
                        fullWidth
                      >
                        Selecionar da Biblioteca
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Mensagem do Convite"
                      value={tempGroupConfig.groupInviteMessage.message}
                      onChange={(e) => setTempGroupConfig(prev => ({
                        ...prev,
                        groupInviteMessage: {
                          ...prev.groupInviteMessage,
                          message: e.target.value
                        }
                      }))}
                      variant="outlined"
                      placeholder="Digite a mensagem que precederá o link do grupo..."
                      helperText="O link do grupo será adicionado automaticamente no final"
                    />
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Use {'{nome}'} para incluir o nome do contato na mensagem.
                    </Typography>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Collapse>
          
          <Grid item xs={12}>
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Quando um visitante preencher o formulário, ele receberá automaticamente um convite 
                para participar do grupo selecionado. Isso é útil para comunidades, cursos ou suporte.
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

export default AdvancedConfigTab;