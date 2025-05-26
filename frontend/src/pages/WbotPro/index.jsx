import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  ListItemSecondaryAction,
  Fab
} from '@mui/material';
import {
  Send as SendIcon,
  Phone as PhoneIcon,
  SmartButton as ButtonIcon,
  List as ListIcon,
  ConnectedTvOutlined as InteractiveIcon,
  Payment as PaymentIcon,
  ViewCarousel as CarouselIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as ConnectedIcon,
  Cancel as DisconnectedIcon,
  Code as CodeIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/Auth/AuthContext';
import { styled } from '@mui/material/styles';
import StandardPageLayout from '../../components/StandardPageLayout';
import MessageExamples from './components/MessageExamples';
import api from '../../services/api';
import { toast } from '../../helpers/toast';


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
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[100],
    color: active ? theme.palette.common.white : theme.palette.text.primary
  }
}));

// Tipos de mensagem disponíveis (apenas os solicitados)
const MESSAGE_TYPES = [
  { key: 'buttons', label: 'Botões', icon: <ButtonIcon /> },
  { key: 'interactive', label: 'Interativa', icon: <InteractiveIcon /> },
  { key: 'list', label: 'Lista', icon: <ListIcon /> },
  { key: 'carousel', label: 'Carrossel', icon: <CarouselIcon /> },
  { key: 'requestPayment', label: 'Solicitar Pagamento', icon: <PaymentIcon /> }
];

// Estados iniciais
const INITIAL_MESSAGE_DATA = {
  buttons: {
    text: 'Escolha uma opção:',
    footer: 'AutoAtende PRO - 2025',
    buttons: [
      { 
        buttonId: '🚀', 
        buttonText: { displayText: '🗿' }, 
        type: 1 
      }
    ],
    headerType: 1,
    viewOnce: true
  },
  interactive: {
    text: 'AutoAtende Pro',
    title: 'Igna',
    subtitle: 'test',
    footer: 'Bot',
    buttons: [
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: 'title',
          sections: [{
            title: 'AutoAtende PRO - 2025',
            highlight_label: '😜',
            rows: [
              {
                header: 'HEADER',
                title: 'TITLE',
                description: 'DESCRIPTION',
                id: 'YOUR_ID_1'
              },
              {
                header: 'HEADER 2',
                title: 'TITLE 2',
                description: 'DESCRIPTION 2',
                id: 'YOUR_ID_2'
              }
            ]
          }]
        })
      },
      {
        name: 'cta_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'quick_reply',
          id: 'message'
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'url',
          url: 'https://www.google.com',
          merchant_url: 'https://www.google.com'
        })
      }
    ]
  },
  list: {
    text: 'This is a list',
    footer: 'nice footer, link: https://google.com',
    title: 'Amazing boldfaced list title',
    buttonText: 'Required, text on the button to view the list',
    sections: [
      {
        title: 'Section 1',
        rows: [
          { title: 'Option 1', rowId: 'option1' },
          { title: 'Option 2', rowId: 'option2', description: 'This is a description' }
        ]
      },
      {
        title: 'Section 2',
        rows: [
          { title: 'Option 3', rowId: 'option3' },
          { title: 'Option 4', rowId: 'option4', description: 'This is a description V2' }
        ]
      }
    ]
  },
  carousel: {
    text: 'Escolha um produto:',
    footer: 'Catálogo de produtos',
    cards: [
      {
        title: 'Produto 1',
        image: { url: 'https://picsum.photos/300/200?random=1' },
        caption: 'Descrição do produto 1'
      },
      {
        title: 'Produto 2',
        image: { url: 'https://picsum.photos/300/200?random=2' },
        caption: 'Descrição do produto 2'
      }
    ],
    viewOnce: true
  },
  requestPayment: {
    currency: 'BRL',
    amount: '10000',
    from: '',
    note: 'Pagamento de teste - AutoAtende',
    background: {}
  }
};

const WbotPro = () => {
  const { user } = useContext(AuthContext);

  // Estados principais
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState('');
  const [selectedMessageType, setSelectedMessageType] = useState('buttons');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // Estados para formulários de mensagem
  const [messageData, setMessageData] = useState(INITIAL_MESSAGE_DATA);

  // Carregar conexões WhatsApp
  const loadWhatsApps = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/whatsapp');
      setWhatsapps(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar conexões WhatsApp:', error);
      toast.error('Erro ao carregar conexões WhatsApp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWhatsApps();
  }, [loadWhatsApps]);

  // Verificar número de telefone
  const checkPhoneNumber = useCallback(async () => {
    if (!selectedWhatsapp || !phoneNumber) {
      toast.error('Selecione uma conexão e informe um número');
      return;
    }

    const whatsapp = whatsapps.find(w => w.id === selectedWhatsapp);
    if (!whatsapp || whatsapp.status !== 'CONNECTED') {
      toast.error('WhatsApp não está conectado');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/wbotpro/check-phone/${selectedWhatsapp}`, {//
        phoneNumber: phoneNumber
      });

      if (response.data.data?.exists) {
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
  }, [selectedWhatsapp, phoneNumber, whatsapps]);

  // Enviar mensagem
  const sendMessage = useCallback(async () => {
    if (!selectedWhatsapp || !phoneNumber) {
      toast.error('Selecione uma conexão e informe um número');
      return;
    }

    const whatsapp = whatsapps.find(w => w.id === selectedWhatsapp);
    if (!whatsapp || whatsapp.status !== 'CONNECTED') {
      toast.error('WhatsApp não está conectado');
      return;
    }

    setLoading(true);
    try {
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      
      const response = await api.post(`/wbotpro/send-message/${selectedWhatsapp}`, {
        jid,
        type: selectedMessageType,
        content: messageData[selectedMessageType],
        options: {}
      });

      if (response.data.success) {
        toast.success('Mensagem enviada com sucesso!');
      } else {
        toast.error(response.data.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  }, [selectedWhatsapp, phoneNumber, whatsapps, selectedMessageType, messageData]);

  // Atualizar dados da mensagem
  const updateMessageData = useCallback((type, field, value) => {
    setMessageData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  }, []);

  // Funções auxiliares
  const addButton = useCallback(() => {
    const newButton = {
      buttonId: `btn_${Date.now()}`,
      buttonText: { displayText: 'Novo Botão' },
      type: 1
    };
    updateMessageData('buttons', 'buttons', [...messageData.buttons.buttons, newButton]);
  }, [messageData.buttons.buttons, updateMessageData]);

  const removeButton = useCallback((index) => {
    const updatedButtons = messageData.buttons.buttons.filter((_, i) => i !== index);
    updateMessageData('buttons', 'buttons', updatedButtons);
  }, [messageData.buttons.buttons, updateMessageData]);

  const addListItem = useCallback((sectionIndex) => {
    const newItem = {
      title: 'Novo Item',
      rowId: `item_${Date.now()}`,
      description: 'Descrição do novo item'
    };
    const updatedSections = [...messageData.list.sections];
    updatedSections[sectionIndex].rows.push(newItem);
    updateMessageData('list', 'sections', updatedSections);
  }, [messageData.list.sections, updateMessageData]);

  const addCarouselCard = useCallback(() => {
    const newCard = {
      title: 'Novo Produto',
      image: { url: `https://picsum.photos/300/200?random=${Date.now()}` },
      caption: 'Nova descrição'
    };
    updateMessageData('carousel', 'cards', [...messageData.carousel.cards, newCard]);
  }, [messageData.carousel.cards, updateMessageData]);

  const removeCarouselCard = useCallback((index) => {
    const updatedCards = messageData.carousel.cards.filter((_, i) => i !== index);
    updateMessageData('carousel', 'cards', updatedCards);
  }, [messageData.carousel.cards, updateMessageData]);

  // Validar mensagem
  const isMessageValid = useCallback(() => {
    if (!selectedWhatsapp || !phoneNumber) return false;
    
    const whatsapp = whatsapps.find(w => w.id === selectedWhatsapp);
    if (!whatsapp || whatsapp.status !== 'CONNECTED') return false;

    const data = messageData[selectedMessageType];
    
    switch (selectedMessageType) {
      case 'buttons':
        return data.text && data.text.trim().length > 0 && 
               data.buttons && data.buttons.length > 0;
      
      case 'interactive':
        return data.text && data.text.trim().length > 0 &&
               data.buttons && data.buttons.length > 0;
      
      case 'list':
        return data.text && data.text.trim().length > 0 && 
               data.title && data.title.trim().length > 0 &&
               data.sections && data.sections.length > 0;
      
      case 'carousel':
        return data.text && data.text.trim().length > 0 &&
               data.cards && data.cards.length > 0;
      
      case 'requestPayment':
        return data.currency && data.amount && data.note &&
               data.amount.trim().length > 0;
      
      default:
        return false;
    }
  }, [selectedWhatsapp, phoneNumber, whatsapps, selectedMessageType, messageData]);

  // Renderizar formulário específico do tipo de mensagem
  const renderMessageForm = () => {
    switch (selectedMessageType) {
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
              <Box key={`button-${index}`} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
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

      case 'interactive':
        return (
          <Box>
            <TextField
              fullWidth
              label="Texto principal"
              value={messageData.interactive.text}
              onChange={(e) => updateMessageData('interactive', 'text', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Título"
              value={messageData.interactive.title}
              onChange={(e) => updateMessageData('interactive', 'title', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Subtítulo"
              value={messageData.interactive.subtitle}
              onChange={(e) => updateMessageData('interactive', 'subtitle', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Rodapé"
              value={messageData.interactive.footer}
              onChange={(e) => updateMessageData('interactive', 'footer', e.target.value)}
              margin="normal"
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Mensagem interativa com botões pré-configurados (single_select, quick_reply, url)
            </Alert>
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
              <Box key={`section-${sectionIndex}`} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
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
                  <Box key={`row-${sectionIndex}-${rowIndex}`} sx={{ ml: 2, mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
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

      case 'carousel':
        return (
          <Box>
            <TextField
              fullWidth
              label="Texto principal"
              value={messageData.carousel.text}
              onChange={(e) => updateMessageData('carousel', 'text', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Rodapé"
              value={messageData.carousel.footer}
              onChange={(e) => updateMessageData('carousel', 'footer', e.target.value)}
              margin="normal"
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Cards
              <IconButton onClick={addCarouselCard}>
                <AddIcon />
              </IconButton>
            </Typography>
            
            {messageData.carousel.cards.map((card, index) => (
              <Box key={`card-${index}`} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <TextField
                  fullWidth
                  label={`Título do card ${index + 1}`}
                  value={card.title}
                  onChange={(e) => {
                    const updatedCards = [...messageData.carousel.cards];
                    updatedCards[index].title = e.target.value;
                    updateMessageData('carousel', 'cards', updatedCards);
                  }}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={`URL da imagem ${index + 1}`}
                  value={card.image.url}
                  onChange={(e) => {
                    const updatedCards = [...messageData.carousel.cards];
                    updatedCards[index].image.url = e.target.value;
                    updateMessageData('carousel', 'cards', updatedCards);
                  }}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={`Legenda ${index + 1}`}
                  value={card.caption}
                  onChange={(e) => {
                    const updatedCards = [...messageData.carousel.cards];
                    updatedCards[index].caption = e.target.value;
                    updateMessageData('carousel', 'cards', updatedCards);
                  }}
                  margin="normal"
                />
                <IconButton onClick={() => removeCarouselCard(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        );

      case 'requestPayment':
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Moeda</InputLabel>
              <Select
                value={messageData.requestPayment.currency}
                onChange={(e) => updateMessageData('requestPayment', 'currency', e.target.value)}
              >
                <MenuItem value="BRL">BRL - Real Brasileiro</MenuItem>
                <MenuItem value="USD">USD - Dólar Americano</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Valor (em centavos)"
              value={messageData.requestPayment.amount}
              onChange={(e) => updateMessageData('requestPayment', 'amount', e.target.value)}
              margin="normal"
              helperText="Ex: 10000 = R$ 100,00"
            />
            
            <TextField
              fullWidth
              label="De (JID)"
              value={messageData.requestPayment.from}
              onChange={(e) => updateMessageData('requestPayment', 'from', e.target.value)}
              margin="normal"
              helperText="Ex: 5511999999999@s.whatsapp.net"
            />
            
            <TextField
              fullWidth
              label="Nota/Descrição"
              value={messageData.requestPayment.note}
              onChange={(e) => updateMessageData('requestPayment', 'note', e.target.value)}
              margin="normal"
            />
          </Box>
        );

      default:
        return (
          <Alert severity="info">
            Selecione um tipo de mensagem para configurar
          </Alert>
        );
    }
  };

  const pageActions = [
    {
      label: 'Exemplos',
      icon: <CodeIcon />,
      onClick: () => setShowExamples(true),
      variant: 'outlined'
    },
    {
      label: 'Atualizar',
      icon: <RefreshIcon />,
      onClick: loadWhatsApps,
      variant: 'outlined'
    }
  ];

  return (
    <StandardPageLayout
      title="API de Mensagens Interativas"
      actions={pageActions}
      showSearch={false}
    >
      <Grid container spacing={3}>
        {/* Painel de Controle */}
        <Grid item xs={12} md={4}>
          <TestCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seleção de Conexão
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Conexão WhatsApp</InputLabel>
                <Select
                  value={selectedWhatsapp}
                  onChange={(e) => setSelectedWhatsapp(e.target.value)}
                >
                  {whatsapps.map((whatsapp) => (
                    <MenuItem key={whatsapp.id} value={whatsapp.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {whatsapp.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {whatsapp.id}
                          </Typography>
                        </Box>
                        <StatusChip
                          size="small"
                          label={whatsapp.status === 'CONNECTED' ? 'Conectado' : whatsapp.status}
                          connected={whatsapp.status === 'CONNECTED'}
                          icon={whatsapp.status === 'CONNECTED' ? <ConnectedIcon /> : <DisconnectedIcon />}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                disabled={loading || !selectedWhatsapp}
                startIcon={<PhoneIcon />}
                sx={{ mt: 1 }}
              >
                Verificar Número
              </Button>
            </CardContent>
          </TestCard>

          {/* Status da Conexão Selecionada */}
          {selectedWhatsapp && (
            <TestCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status da Conexão
                </Typography>
                
                {(() => {
                  const whatsapp = whatsapps.find(w => w.id === selectedWhatsapp);
                  if (!whatsapp) return null;
                  
                  return (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Nome:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {whatsapp.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Status:
                        </Typography>
                        <StatusChip
                          size="small"
                          label={whatsapp.status === 'CONNECTED' ? 'Conectado' : whatsapp.status}
                          connected={whatsapp.status === 'CONNECTED'}
                        />
                      </Box>

                      {whatsapp.status === 'CONNECTED' && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          Conexão ativa e pronta para envios
                        </Alert>
                      )}

                      {whatsapp.status !== 'CONNECTED' && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Conexão não disponível para envios
                        </Alert>
                      )}
                    </Box>
                  );
                })()}
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
                
                {/* Indicador de status */}
                <Box sx={{ mb: 2 }}>
                  {isMessageValid() ? (
                    <Alert severity="success" sx={{ py: 0.5 }}>
                      Mensagem pronta para envio
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ py: 0.5 }}>
                      Preencha os campos obrigatórios para habilitar o envio
                    </Alert>
                  )}
                </Box>
                
                {renderMessageForm()}
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={sendMessage}
                  disabled={loading || !isMessageValid()}
                  startIcon={<SendIcon />}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </Box>
            </CardContent>
          </TestCard>

        </Grid>
      </Grid>

      {/* FAB para Ajuda */}
      <Fab
        color="primary"
        aria-label="help"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowExamples(true)}
      >
        <HelpIcon />
      </Fab>

      {/* Dialog de Exemplos */}
      <MessageExamples
        open={showExamples}
        onClose={() => setShowExamples(false)}
      />
    </StandardPageLayout>
  );
};

export default WbotPro;