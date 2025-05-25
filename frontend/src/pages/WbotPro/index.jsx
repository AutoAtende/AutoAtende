import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Send as SendIcon,
  Phone as PhoneIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  AttachFile as FileIcon,
  LocationOn as LocationIcon,
  ContactPhone as ContactIcon,
  SmartButton as ButtonIcon,
  List as ListIcon,
  InteractiveVideo as InteractiveIcon,
  Poll as PollIcon,
  Payment as PaymentIcon,
  PhotoLibrary as AlbumIcon,
  ViewCarousel as CarouselIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as ConnectedIcon,
  Cancel as DisconnectedIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import StandardPageLayout from '../components/StandardPageLayout';
import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { AuthContext } from '../../context/Auth/AuthContext';

// Styled Components
const TestCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const StatusChip = styled(Chip)(({ theme, connected }) => ({
  backgroundColor: connected ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
  fontWeight: 600
}));

const MessageTypeButton = styled(Button)(({ theme, active }) => ({
  borderColor: active ? theme.palette.primary.main : theme.palette.grey[300],
  backgroundColor: active ? theme.palette.primary.light : 'transparent',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[100]
  }
}));

// Tipos de mensagem disponíveis
const MESSAGE_TYPES = [
  { key: 'text', label: 'Texto', icon: <SendIcon /> },
  { key: 'image', label: 'Imagem', icon: <ImageIcon /> },
  { key: 'video', label: 'Vídeo', icon: <VideoIcon /> },
  { key: 'audio', label: 'Áudio', icon: <AudioIcon /> },
  { key: 'document', label: 'Documento', icon: <FileIcon /> },
  { key: 'location', label: 'Localização', icon: <LocationIcon /> },
  { key: 'contact', label: 'Contato', icon: <ContactIcon /> },
  { key: 'buttons', label: 'Botões', icon: <ButtonIcon /> },
  { key: 'list', label: 'Lista', icon: <ListIcon /> },
  { key: 'interactive', label: 'Interativo', icon: <InteractiveIcon /> },
  { key: 'poll', label: 'Enquete', icon: <PollIcon /> }
];

const WhatsAppTestPage = () => {
  const { user } = useContext(AuthContext);
  
  // Estados principais
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedMessageType, setSelectedMessageType] = useState('text');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  
  // Estados para formulários de mensagem
  const [messageData, setMessageData] = useState({
    text: { text: '', mentions: [] },
    image: { url: '', caption: '' },
    video: { url: '', caption: '', ptv: false, gifPlayback: false },
    audio: { url: '', mimetype: 'audio/mp4' },
    document: { url: '', mimetype: '', fileName: '' },
    location: { latitude: '', longitude: '' },
    contact: { displayName: '', vcard: '' },
    buttons: {
      text: 'Escolha uma opção:',
      footer: 'Teste de Botões',
      buttons: [{ buttonId: '1', buttonText: { displayText: 'Opção 1' }, type: 1 }],
      viewOnce: false
    },
    list: {
      text: 'Escolha uma opção da lista:',
      footer: 'Teste de Lista',
      title: 'Menu de Opções',
      buttonText: 'Ver Opções',
      sections: [{
        title: 'Seção 1',
        rows: [{ title: 'Item 1', rowId: 'item1', description: 'Descrição do item 1' }]
      }]
    },
    interactive: {
      text: 'Mensagem interativa',
      title: 'Título',
      subtitle: 'Subtítulo',
      footer: 'Rodapé',
      buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Resposta Rápida', id: 'reply1' }) }]
    },
    poll: {
      name: 'Qual sua cor favorita?',
      values: ['Azul', 'Vermelho', 'Verde'],
      selectableCount: 1
    }
  });

  // Estados para funcionalidades especiais
  const [albumFiles, setAlbumFiles] = useState([{ type: 'image', url: '', caption: '' }]);
  const [carouselCards, setCarouselCards] = useState([{ title: '', image: '', caption: '' }]);
  const [paymentRequest, setPaymentRequest] = useState({
    currency: 'BRL',
    amount: '100',
    from: '',
    note: 'Pagamento de teste'
  });

  useEffect(() => {
    loadSessions();
  }, []);

  // Carregar sessões disponíveis
  const loadSessions = async () => {
    try {
      const response = await api.get('/wbotpro/sessions');
      setSessions(response.data.data || []);
      
      // Carregar status de cada sessão
      for (const session of response.data.data || []) {
        await loadSessionStatus(session.sessionName);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast.error('Erro ao carregar sessões do WhatsApp');
    }
  };

  // Carregar status de uma sessão específica
  const loadSessionStatus = async (sessionName) => {
    try {
      const response = await api.get(`/wbotpro/status/${sessionName}`);
      setConnectionStatus(prev => ({
        ...prev,
        [sessionName]: response.data.data
      }));
    } catch (error) {
      console.error(`Erro ao carregar status da sessão ${sessionName}:`, error);
    }
  };

  // Conectar sessão
  const connectSession = async () => {
    if (!selectedSession) {
      toast.error('Selecione uma sessão');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/wbotpro/connect', {
        sessionName: selectedSession,
        printQRInTerminal: false,
        markOnlineOnConnect: false
      });

      if (response.data.success) {
        if (response.data.data.qrCode) {
          toast.info('QR Code gerado. Verifique o terminal para escanear.');
        } else {
          toast.success('WhatsApp conectado com sucesso!');
        }
        await loadSessionStatus(selectedSession);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast.error('Erro ao conectar com o WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Desconectar sessão
  const disconnectSession = async () => {
    if (!selectedSession) return;

    setLoading(true);
    try {
      await api.delete(`/wbotpro/disconnect/${selectedSession}`);
      toast.success('WhatsApp desconectado com sucesso!');
      await loadSessionStatus(selectedSession);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Verificar número de telefone
  const checkPhoneNumber = async () => {
    if (!selectedSession || !phoneNumber) {
      toast.error('Selecione uma sessão e informe um número');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/wbotpro/check-phone/${selectedSession}`, {
        phoneNumber: phoneNumber
      });

      if (response.data.data.exists) {
        toast.success(`Número ${phoneNumber} existe no WhatsApp`);
      } else {
        toast.warning(`Número ${phoneNumber} não encontrado no WhatsApp`);
      }
    } catch (error) {
      console.error('Erro ao verificar número:', error);
      toast.error('Erro ao verificar número');
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!selectedSession || !phoneNumber) {
      toast.error('Selecione uma sessão e informe um número');
      return;
    }

    const sessionStatus = connectionStatus[selectedSession];
    if (!sessionStatus?.isConnected) {
      toast.error('WhatsApp não está conectado');
      return;
    }

    setLoading(true);
    try {
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      
      const response = await api.post(`/wbotpro/send-message/${selectedSession}`, {
        jid,
        type: selectedMessageType,
        content: messageData[selectedMessageType],
        options: {}
      });

      if (response.data.success) {
        toast.success('Mensagem enviada com sucesso!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  // Enviar álbum
  const sendAlbum = async () => {
    if (!selectedSession || !phoneNumber) {
      toast.error('Selecione uma sessão e informe um número');
      return;
    }

    setLoading(true);
    try {
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      
      // Simular envio de álbum (múltiplas mensagens)
      for (const file of albumFiles) {
        await api.post(`/wbotpro/send-message/${selectedSession}`, {
          jid,
          type: file.type,
          content: { url: file.url, caption: file.caption },
          options: {}
        });
      }

      toast.success('Álbum enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar álbum:', error);
      toast.error('Erro ao enviar álbum');
    } finally {
      setLoading(false);
    }
  };

  // Enviar carrossel
  const sendCarousel = async () => {
    if (!selectedSession || !phoneNumber) {
      toast.error('Selecione uma sessão e informe um número');
      return;
    }

    setLoading(true);
    try {
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      
      const response = await api.post(`/wbotpro/send-message/${selectedSession}`, {
        jid,
        type: 'interactive',
        content: {
          text: 'Carrossel de produtos',
          footer: 'Escolha uma opção',
          cards: carouselCards,
          viewOnce: true
        },
        options: {}
      });

      if (response.data.success) {
        toast.success('Carrossel enviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar carrossel:', error);
      toast.error('Erro ao enviar carrossel');
    } finally {
      setLoading(false);
    }
  };

  // Enviar solicitação de pagamento
  const sendPaymentRequest = async () => {
    if (!selectedSession || !phoneNumber) {
      toast.error('Selecione uma sessão e informe um número');
      return;
    }

    setLoading(true);
    try {
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      
      const response = await api.post(`/wbotpro/send-message/${selectedSession}`, {
        jid,
        type: 'interactive',
        content: {
          requestPayment: {
            currency: paymentRequest.currency,
            amount: paymentRequest.amount,
            from: paymentRequest.from || jid,
            note: paymentRequest.note
          }
        },
        options: {}
      });

      if (response.data.success) {
        toast.success('Solicitação de pagamento enviada!');
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação de pagamento:', error);
      toast.error('Erro ao enviar solicitação de pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados da mensagem
  const updateMessageData = (type, field, value) => {
    setMessageData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  // Adicionar botão
  const addButton = () => {
    const newButton = {
      buttonId: `btn_${Date.now()}`,
      buttonText: { displayText: 'Novo Botão' },
      type: 1
    };
    updateMessageData('buttons', 'buttons', [...messageData.buttons.buttons, newButton]);
  };

  // Remover botão
  const removeButton = (index) => {
    const updatedButtons = messageData.buttons.buttons.filter((_, i) => i !== index);
    updateMessageData('buttons', 'buttons', updatedButtons);
  };

  // Adicionar item da lista
  const addListItem = (sectionIndex) => {
    const newItem = {
      title: 'Novo Item',
      rowId: `item_${Date.now()}`,
      description: 'Descrição do novo item'
    };
    const updatedSections = [...messageData.list.sections];
    updatedSections[sectionIndex].rows.push(newItem);
    updateMessageData('list', 'sections', updatedSections);
  };

  // Adicionar arquivo ao álbum
  const addAlbumFile = () => {
    setAlbumFiles(prev => [...prev, { type: 'image', url: '', caption: '' }]);
  };

  // Remover arquivo do álbum
  const removeAlbumFile = (index) => {
    setAlbumFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Adicionar card ao carrossel
  const addCarouselCard = () => {
    setCarouselCards(prev => [...prev, { title: '', image: '', caption: '' }]);
  };

  // Remover card do carrossel
  const removeCarouselCard = (index) => {
    setCarouselCards(prev => prev.filter((_, i) => i !== index));
  };

  // Renderizar formulário específico do tipo de mensagem
  const renderMessageForm = () => {
    switch (selectedMessageType) {
      case 'text':
        return (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Texto da mensagem"
              value={messageData.text.text}
              onChange={(e) => updateMessageData('text', 'text', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Menções (separadas por vírgula)"
              value={messageData.text.mentions.join(', ')}
              onChange={(e) => updateMessageData('text', 'mentions', e.target.value.split(',').map(m => m.trim()).filter(Boolean))}
              margin="normal"
              helperText="Ex: 5511999999999, 5511888888888"
            />
          </Box>
        );

      case 'image':
        return (
          <Box>
            <TextField
              fullWidth
              label="URL da imagem"
              value={messageData.image.url}
              onChange={(e) => updateMessageData('image', 'url', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Legenda"
              value={messageData.image.caption}
              onChange={(e) => updateMessageData('image', 'caption', e.target.value)}
              margin="normal"
            />
          </Box>
        );

      case 'video':
        return (
          <Box>
            <TextField
              fullWidth
              label="URL do vídeo"
              value={messageData.video.url}
              onChange={(e) => updateMessageData('video', 'url', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Legenda"
              value={messageData.video.caption}
              onChange={(e) => updateMessageData('video', 'caption', e.target.value)}
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={messageData.video.ptv}
                  onChange={(e) => updateMessageData('video', 'ptv', e.target.checked)}
                />
              }
              label="Enviar como nota de vídeo"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={messageData.video.gifPlayback}
                  onChange={(e) => updateMessageData('video', 'gifPlayback', e.target.checked)}
                />
              }
              label="Reproduzir como GIF"
            />
          </Box>
        );

      case 'audio':
        return (
          <Box>
            <TextField
              fullWidth
              label="URL do áudio"
              value={messageData.audio.url}
              onChange={(e) => updateMessageData('audio', 'url', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Tipo MIME"
              value={messageData.audio.mimetype}
              onChange={(e) => updateMessageData('audio', 'mimetype', e.target.value)}
              margin="normal"
              helperText="Ex: audio/mp4, audio/ogg"
            />
          </Box>
        );

      case 'document':
        return (
          <Box>
            <TextField
              fullWidth
              label="URL do documento"
              value={messageData.document.url}
              onChange={(e) => updateMessageData('document', 'url', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Nome do arquivo"
              value={messageData.document.fileName}
              onChange={(e) => updateMessageData('document', 'fileName', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Tipo MIME"
              value={messageData.document.mimetype}
              onChange={(e) => updateMessageData('document', 'mimetype', e.target.value)}
              margin="normal"
              helperText="Ex: application/pdf, application/zip"
            />
          </Box>
        );

      case 'location':
        return (
          <Box>
            <TextField
              fullWidth
              type="number"
              label="Latitude"
              value={messageData.location.latitude}
              onChange={(e) => updateMessageData('location', 'latitude', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="Longitude"
              value={messageData.location.longitude}
              onChange={(e) => updateMessageData('location', 'longitude', e.target.value)}
              margin="normal"
            />
          </Box>
        );

      case 'contact':
        return (
          <Box>
            <TextField
              fullWidth
              label="Nome do contato"
              value={messageData.contact.displayName}
              onChange={(e) => updateMessageData('contact', 'displayName', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="vCard"
              value={messageData.contact.vcard}
              onChange={(e) => updateMessageData('contact', 'vcard', e.target.value)}
              margin="normal"
              helperText="Formato vCard completo"
            />
          </Box>
        );

      case 'buttons':
        return (
          <Box>
            <TextField
              fullWidth
              label="Texto principal"
              value={messageData.buttons.text}
              onChange={(e) => updateMessageData('buttons', 'text', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Rodapé"
              value={messageData.buttons.footer}
              onChange={(e) => updateMessageData('buttons', 'footer', e.target.value)}
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={messageData.buttons.viewOnce}
                  onChange={(e) => updateMessageData('buttons', 'viewOnce', e.target.checked)}
                />
              }
              label="Visualizar uma vez"
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Botões
              <IconButton onClick={addButton}>
                <AddIcon />
              </IconButton>
            </Typography>
            
            {messageData.buttons.buttons.map((button, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <TextField
                  fullWidth
                  label={`Texto do botão ${index + 1}`}
                  value={button.buttonText.displayText}
                  onChange={(e) => {
                    const updatedButtons = [...messageData.buttons.buttons];
                    updatedButtons[index].buttonText.displayText = e.target.value;
                    updateMessageData('buttons', 'buttons', updatedButtons);
                  }}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={`ID do botão ${index + 1}`}
                  value={button.buttonId}
                  onChange={(e) => {
                    const updatedButtons = [...messageData.buttons.buttons];
                    updatedButtons[index].buttonId = e.target.value;
                    updateMessageData('buttons', 'buttons', updatedButtons);
                  }}
                  margin="normal"
                />
                <IconButton onClick={() => removeButton(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        );

      case 'list':
        return (
          <Box>
            <TextField
              fullWidth
              label="Texto principal"
              value={messageData.list.text}
              onChange={(e) => updateMessageData('list', 'text', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Título"
              value={messageData.list.title}
              onChange={(e) => updateMessageData('list', 'title', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Texto do botão"
              value={messageData.list.buttonText}
              onChange={(e) => updateMessageData('list', 'buttonText', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Rodapé"
              value={messageData.list.footer}
              onChange={(e) => updateMessageData('list', 'footer', e.target.value)}
              margin="normal"
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Seções e Itens
            </Typography>
            
            {messageData.list.sections.map((section, sectionIndex) => (
              <Box key={sectionIndex} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <TextField
                  fullWidth
                  label={`Título da seção ${sectionIndex + 1}`}
                  value={section.title}
                  onChange={(e) => {
                    const updatedSections = [...messageData.list.sections];
                    updatedSections[sectionIndex].title = e.target.value;
                    updateMessageData('list', 'sections', updatedSections);
                  }}
                  margin="normal"
                />
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Itens
                  <IconButton onClick={() => addListItem(sectionIndex)}>
                    <AddIcon />
                  </IconButton>
                </Typography>
                
                {section.rows.map((row, rowIndex) => (
                  <Box key={rowIndex} sx={{ ml: 2, mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Título"
                      value={row.title}
                      onChange={(e) => {
                        const updatedSections = [...messageData.list.sections];
                        updatedSections[sectionIndex].rows[rowIndex].title = e.target.value;
                        updateMessageData('list', 'sections', updatedSections);
                      }}
                      margin="dense"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="ID"
                      value={row.rowId}
                      onChange={(e) => {
                        const updatedSections = [...messageData.list.sections];
                        updatedSections[sectionIndex].rows[rowIndex].rowId = e.target.value;
                        updateMessageData('list', 'sections', updatedSections);
                      }}
                      margin="dense"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Descrição"
                      value={row.description}
                      onChange={(e) => {
                        const updatedSections = [...messageData.list.sections];
                        updatedSections[sectionIndex].rows[rowIndex].description = e.target.value;
                        updateMessageData('list', 'sections', updatedSections);
                      }}
                      margin="dense"
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        );

      case 'poll':
        return (
          <Box>
            <TextField
              fullWidth
              label="Pergunta da enquete"
              value={messageData.poll.name}
              onChange={(e) => updateMessageData('poll', 'name', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Opções (separadas por vírgula)"
              value={messageData.poll.values.join(', ')}
              onChange={(e) => updateMessageData('poll', 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="Número de seleções permitidas"
              value={messageData.poll.selectableCount}
              onChange={(e) => updateMessageData('poll', 'selectableCount', parseInt(e.target.value) || 1)}
              margin="normal"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  const pageActions = [
    {
      label: 'Atualizar Sessões',
      icon: <RefreshIcon />,
      onClick: loadSessions,
      variant: 'outlined'
    }
  ];

  return (
    <StandardPageLayout
      title="Teste de Mensagens WhatsApp"
      actions={pageActions}
      showSearch={false}
    >
      <Grid container spacing={3}>
        {/* Painel de Controle */}
        <Grid item xs={12} md={4}>
          <TestCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Controle de Sessão
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Sessão WhatsApp</InputLabel>
                <Select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.sessionName} value={session.sessionName}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {session.sessionName}
                        <Box sx={{ ml: 'auto' }}>
                          <StatusChip
                            size="small"
                            label={connectionStatus[session.sessionName]?.isConnected ? 'Conectado' : 'Desconectado'}
                            connected={connectionStatus[session.sessionName]?.isConnected}
                            icon={connectionStatus[session.sessionName]?.isConnected ? <ConnectedIcon /> : <DisconnectedIcon />}
                          />
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={connectSession}
                  disabled={loading || connectionStatus[selectedSession]?.isConnected}
                  sx={{ flex: 1 }}
                >
                  Conectar
                </Button>
                <Button
                  variant="outlined"
                  onClick={disconnectSession}
                  disabled={loading || !connectionStatus[selectedSession]?.isConnected}
                  sx={{ flex: 1 }}
                >
                  Desconectar
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Número de telefone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                margin="normal"
                helperText="Ex: 5511999999999 ou 5511999999999@s.whatsapp.net"
              />

              <Button
                fullWidth
                variant="outlined"
                onClick={checkPhoneNumber}
                disabled={loading}
                startIcon={<PhoneIcon />}
                sx={{ mt: 1 }}
              >
                Verificar Número
              </Button>
            </CardContent>
          </TestCard>

          {/* Status da Sessão */}
          {selectedSession && connectionStatus[selectedSession] && (
            <TestCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status da Sessão
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Conexão:
                  </Typography>
                  <StatusChip
                    size="small"
                    label={connectionStatus[selectedSession].isConnected ? 'Conectado' : 'Desconectado'}
                    connected={connectionStatus[selectedSession].isConnected}
                  />
                </Box>

                {connectionStatus[selectedSession].qrCode && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    QR Code disponível no terminal
                  </Alert>
                )}
              </CardContent>
            </TestCard>
          )}
        </Grid>

        {/* Painel de Mensagens */}
        <Grid item xs={12} md={8}>
          <TestCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tipos de Mensagem
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {MESSAGE_TYPES.map((type) => (
                  <MessageTypeButton
                    key={type.key}
                    variant="outlined"
                    size="small"
                    active={selectedMessageType === type.key}
                    onClick={() => setSelectedMessageType(type.key)}
                    startIcon={type.icon}
                  >
                    {type.label}
                  </MessageTypeButton>
                ))}
              </Box>

              {/* Formulário da mensagem */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Configurar {MESSAGE_TYPES.find(t => t.key === selectedMessageType)?.label}
                </Typography>
                
                {renderMessageForm()}
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={sendMessage}
                  disabled={loading || !connectionStatus[selectedSession]?.isConnected}
                  startIcon={<SendIcon />}
                  sx={{ mt: 2 }}
                >
                  Enviar Mensagem
                </Button>
              </Box>
            </CardContent>
          </TestCard>

          {/* Funcionalidades Especiais */}
          <TestCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Funcionalidades Especiais
              </Typography>

              {/* Álbum de Mídia */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <AlbumIcon sx={{ mr: 1 }} />
                  <Typography>Álbum de Mídia</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Envie múltiplas mídias como um álbum
                  </Typography>
                  
                  {albumFiles.map((file, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                      <FormControl fullWidth margin="dense">
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          value={file.type}
                          onChange={(e) => {
                            const updatedFiles = [...albumFiles];
                            updatedFiles[index].type = e.target.value;
                            setAlbumFiles(updatedFiles);
                          }}
                        >
                          <MenuItem value="image">Imagem</MenuItem>
                          <MenuItem value="video">Vídeo</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        fullWidth
                        label="URL"
                        value={file.url}
                        onChange={(e) => {
                          const updatedFiles = [...albumFiles];
                          updatedFiles[index].url = e.target.value;
                          setAlbumFiles(updatedFiles);
                        }}
                        margin="dense"
                      />
                      
                      <TextField
                        fullWidth
                        label="Legenda"
                        value={file.caption}
                        onChange={(e) => {
                          const updatedFiles = [...albumFiles];
                          updatedFiles[index].caption = e.target.value;
                          setAlbumFiles(updatedFiles);
                        }}
                        margin="dense"
                      />
                      
                      <IconButton onClick={() => removeAlbumFile(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={addAlbumFile}
                      startIcon={<AddIcon />}
                    >
                      Adicionar Arquivo
                    </Button>
                    <Button
                      variant="contained"
                      onClick={sendAlbum}
                      disabled={loading || !connectionStatus[selectedSession]?.isConnected}
                      startIcon={<AlbumIcon />}
                    >
                      Enviar Álbum
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Carrossel */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <CarouselIcon sx={{ mr: 1 }} />
                  <Typography>Carrossel</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Envie um carrossel interativo com múltiplos cards
                  </Typography>
                  
                  {carouselCards.map((card, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                      <TextField
                        fullWidth
                        label="Título"
                        value={card.title}
                        onChange={(e) => {
                          const updatedCards = [...carouselCards];
                          updatedCards[index].title = e.target.value;
                          setCarouselCards(updatedCards);
                        }}
                        margin="dense"
                      />
                      
                      <TextField
                        fullWidth
                        label="URL da Imagem"
                        value={card.image}
                        onChange={(e) => {
                          const updatedCards = [...carouselCards];
                          updatedCards[index].image = e.target.value;
                          setCarouselCards(updatedCards);
                        }}
                        margin="dense"
                      />
                      
                      <TextField
                        fullWidth
                        label="Legenda"
                        value={card.caption}
                        onChange={(e) => {
                          const updatedCards = [...carouselCards];
                          updatedCards[index].caption = e.target.value;
                          setCarouselCards(updatedCards);
                        }}
                        margin="dense"
                      />
                      
                      <IconButton onClick={() => removeCarouselCard(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={addCarouselCard}
                      startIcon={<AddIcon />}
                    >
                      Adicionar Card
                    </Button>
                    <Button
                      variant="contained"
                      onClick={sendCarousel}
                      disabled={loading || !connectionStatus[selectedSession]?.isConnected}
                      startIcon={<CarouselIcon />}
                    >
                      Enviar Carrossel
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Solicitação de Pagamento */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <PaymentIcon sx={{ mr: 1 }} />
                  <Typography>Solicitação de Pagamento</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Envie uma solicitação de pagamento
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="dense">
                        <InputLabel>Moeda</InputLabel>
                        <Select
                          value={paymentRequest.currency}
                          onChange={(e) => setPaymentRequest(prev => ({ ...prev, currency: e.target.value }))}
                        >
                          <MenuItem value="BRL">Real (BRL)</MenuItem>
                          <MenuItem value="USD">Dólar (USD)</MenuItem>
                          <MenuItem value="EUR">Euro (EUR)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Valor"
                        value={paymentRequest.amount}
                        onChange={(e) => setPaymentRequest(prev => ({ ...prev, amount: e.target.value }))}
                        margin="dense"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="De (deixe vazio para usar o número de destino)"
                        value={paymentRequest.from}
                        onChange={(e) => setPaymentRequest(prev => ({ ...prev, from: e.target.value }))}
                        margin="dense"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nota"
                        value={paymentRequest.note}
                        onChange={(e) => setPaymentRequest(prev => ({ ...prev, note: e.target.value }))}
                        margin="dense"
                      />
                    </Grid>
                  </Grid>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={sendPaymentRequest}
                    disabled={loading || !connectionStatus[selectedSession]?.isConnected}
                    startIcon={<PaymentIcon />}
                    sx={{ mt: 2 }}
                  >
                    Enviar Solicitação de Pagamento
                  </Button>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </TestCard>

          {/* Log de Atividades */}
          <TestCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sessões Ativas
              </Typography>
              
              {sessions.length === 0 ? (
                <Alert severity="info">
                  Nenhuma sessão disponível. Crie uma nova sessão no painel de controle.
                </Alert>
              ) : (
                <List>
                  {sessions.map((session) => (
                    <ListItem key={session.sessionName}>
                      <ListItemText
                        primary={session.sessionName}
                        secondary={`Status: ${connectionStatus[session.sessionName]?.isConnected ? 'Conectado' : 'Desconectado'}`}
                      />
                      <ListItemSecondaryAction>
                        <StatusChip
                          size="small"
                          label={connectionStatus[session.sessionName]?.isConnected ? 'Online' : 'Offline'}
                          connected={connectionStatus[session.sessionName]?.isConnected}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </TestCard>
        </Grid>
      </Grid>
    </StandardPageLayout>
  );
};

export default WhatsAppTestPage;