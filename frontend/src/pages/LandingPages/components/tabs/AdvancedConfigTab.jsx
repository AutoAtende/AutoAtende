import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
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
  Paper,
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
  InsertLink as InsertLinkIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { isValidPhoneNumber } from '../../../../utils/stringUtils';
import { PhoneTextField } from '../PhoneNumberMask';
import BaseModal from '../../../../components/sharedBaseModal';
import FileManager from '../FileManager';
import ImageUploader from '../ImageUploader';
import api from '../../../../services/api';
import { AuthContext } from '../../../../context/Auth/AuthContext';

const AnimatedPaper = animated(Paper);

const AdvancedConfigTab = ({ landingPage, setLandingPage }) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  
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

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

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
        <SettingsIcon sx={{ mr: 1 }} />
        Configurações Avançadas
      </Typography>
      
      <Grid container spacing={3}>
        {/* Configuração de Conexão WhatsApp */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={2}>
            <WhatsAppIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={500}>
              Conexão para Notificações
            </Typography>
          </Box>
          
          <FormControl fullWidth variant="outlined">
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
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Escolha qual conexão WhatsApp será usada para enviar notificações de novos leads.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Tags para Contatos */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={2}>
            <TagIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={500}>
              Tags para Contatos
            </Typography>
          </Box>
          
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
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Meta Pixel */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <FacebookIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Meta Pixel (Facebook/Instagram)
              </Typography>
            </Box>
            
            <Chip
              label={landingPage.advancedConfig?.metaPixelId ? 'Configurado' : 'Não configurado'}
              color={landingPage.advancedConfig?.metaPixelId ? 'success' : 'default'}
              variant={landingPage.advancedConfig?.metaPixelId ? 'filled' : 'outlined'}
            />
          </Box>
          
          <Typography variant="body2" color="textSecondary" paragraph>
            Configure o Meta Pixel para rastrear visitantes e conversões nas suas campanhas do Facebook e Instagram.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              setTempPixelId(landingPage.advancedConfig?.metaPixelId || '');
              setPixelModalOpen(true);
            }}
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {landingPage.advancedConfig?.metaPixelId ? 'Editar Meta Pixel' : 'Configurar Meta Pixel'}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Botão de Chat WhatsApp */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <WhatsAppIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Botão de Chat WhatsApp
              </Typography>
            </Box>
            
            <Chip
              label={landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'Ativo' : 'Inativo'}
              color={landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'success' : 'default'}
              variant={landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'filled' : 'outlined'}
            />
          </Box>
          
          <Typography variant="body2" color="textSecondary" paragraph>
            Adiciona um botão flutuante no canto inferior direito da página para contato direto via WhatsApp.
          </Typography>
          
          <Button
            variant="contained"
            color="success"
            startIcon={<EditIcon />}
            onClick={() => {
              setTempChatConfig(landingPage.advancedConfig?.whatsAppChatButton || {
                enabled: false,
                number: '',
                defaultMessage: 'Olá! Gostaria de saber mais sobre {landing_page}'
              });
              setChatModalOpen(true);
            }}
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'Editar Botão de Chat' : 'Configurar Botão de Chat'}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Convite para Grupo */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <GroupIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Convite Automático para Grupo
              </Typography>
            </Box>
            
            <Chip
              label={landingPage.advancedConfig?.inviteGroupId ? 'Configurado' : 'Não configurado'}
              color={landingPage.advancedConfig?.inviteGroupId ? 'info' : 'default'}
              variant={landingPage.advancedConfig?.inviteGroupId ? 'filled' : 'outlined'}
            />
          </Box>
          
          <Typography variant="body2" color="textSecondary" paragraph>
            Envie automaticamente um convite para um grupo WhatsApp quando alguém preencher o formulário.
          </Typography>
          
          <Button
            variant="contained"
            color="info"
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
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {landingPage.advancedConfig?.inviteGroupId ? 'Editar Convite para Grupo' : 'Configurar Convite para Grupo'}
          </Button>
        </Grid>

        {/* Resumo das Configurações */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Configurações ativas:</strong>
              <br />
              • Conexão WhatsApp: {whatsappConnections.find(conn => conn.id === landingPage.advancedConfig?.notificationConnectionId)?.name || 'Não configurada'}
              <br />
              • Tags para contatos: {selectedTags.length} selecionada(s)
              <br />
              • Meta Pixel: {landingPage.advancedConfig?.metaPixelId ? 'Configurado' : 'Não configurado'}
              <br />
              • Botão de chat: {landingPage.advancedConfig?.whatsAppChatButton?.enabled ? 'Ativo' : 'Inativo'}
              <br />
              • Convite para grupo: {landingPage.advancedConfig?.inviteGroupId ? 'Configurado' : 'Não configurado'}
            </Typography>
          </Alert>
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
                <br /><br />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InsertLinkIcon />}
                  href="https://www.facebook.com/business/help/952192354843755"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 2 }}
                >
                  Ver Documentação
                </Button>
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
                        sx={{ borderRadius: 2 }}
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
    </AnimatedPaper>
  );
};

export default AdvancedConfigTab;