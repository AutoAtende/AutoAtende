import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from '../../../helpers/toast';

const CodeBlock = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'auto',
  maxHeight: '400px',
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  fontSize: '13px',
  lineHeight: 1.5,
  position: 'relative',
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.grey[700],
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.grey[600]
  }
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`message-example-tabpanel-${index}`}
      aria-labelledby={`message-example-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MessageExamples = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Código copiado para a área de transferência!');
    }).catch(() => {
      toast.error('Erro ao copiar código');
    });
  };

  const examples = [
    {
      label: 'Texto Simples',
      code: `{
  "type": "text",
  "content": {
    "text": "Olá! Esta é uma mensagem de texto simples."
  }
}`
    },
    {
      label: 'Texto com Menções',
      code: `{
  "type": "text",
  "content": {
    "text": "Olá @5511999999999! Como você está?",
    "mentions": ["5511999999999@s.whatsapp.net"]
  }
}`
    },
    {
      label: 'Imagem',
      code: `{
  "type": "image",
  "content": {
    "url": "https://example.com/imagem.jpg",
    "caption": "Legenda da imagem"
  }
}`
    },
    {
      label: 'Vídeo',
      code: `{
  "type": "video",
  "content": {
    "url": "https://example.com/video.mp4",
    "caption": "Legenda do vídeo",
    "ptv": false,
    "gifPlayback": false
  }
}`
    },
    {
      label: 'Áudio',
      code: `{
  "type": "audio",
  "content": {
    "url": "https://example.com/audio.ogg",
    "mimetype": "audio/ogg"
  }
}`
    },
    {
      label: 'Documento',
      code: `{
  "type": "document",
  "content": {
    "url": "https://example.com/documento.pdf",
    "fileName": "documento.pdf",
    "mimetype": "application/pdf"
  }
}`
    },
    {
      label: 'Localização',
      code: `{
  "type": "location",
  "content": {
    "latitude": -23.5505,
    "longitude": -46.6333
  }
}`
    },
    {
      label: 'Contato',
      code: `{
  "type": "contact",
  "content": {
    "displayName": "João Silva",
    "vcard": "BEGIN:VCARD\\nVERSION:3.0\\nFN:João Silva\\nTEL;type=CELL:+5511999999999\\nEND:VCARD"
  }
}`
    },
    {
      label: 'Botões',
      code: `{
  "type": "buttons",
  "content": {
    "text": "Escolha uma opção:",
    "footer": "Powered by AutoAtende",
    "buttons": [
      {
        "buttonId": "opcao1",
        "buttonText": {
          "displayText": "Opção 1"
        },
        "type": 1
      },
      {
        "buttonId": "opcao2",
        "buttonText": {
          "displayText": "Opção 2"
        },
        "type": 1
      }
    ],
    "viewOnce": false
  }
}`
    },
    {
      label: 'Lista',
      code: `{
  "type": "list",
  "content": {
    "text": "Escolha uma opção da lista:",
    "title": "Menu Principal",
    "buttonText": "Ver Opções",
    "footer": "Powered by AutoAtende",
    "sections": [
      {
        "title": "Seção 1",
        "rows": [
          {
            "title": "Item 1",
            "rowId": "item1",
            "description": "Descrição do item 1"
          },
          {
            "title": "Item 2",
            "rowId": "item2",
            "description": "Descrição do item 2"
          }
        ]
      }
    ]
  }
}`
    },
    {
      label: 'Interativo',
      code: `{
  "type": "interactive",
  "content": {
    "text": "Mensagem interativa",
    "title": "Título da Mensagem",
    "subtitle": "Subtítulo",
    "footer": "Rodapé da mensagem",
    "buttons": [
      {
        "name": "quick_reply",
        "buttonParamsJson": "{\\"display_text\\":\\"Resposta Rápida\\",\\"id\\":\\"reply1\\"}"
      },
      {
        "name": "cta_url",
        "buttonParamsJson": "{\\"display_text\\":\\"Visitar Site\\",\\"url\\":\\"https://example.com\\"}"
      }
    ]
  }
}`
    },
    {
      label: 'Enquete',
      code: `{
  "type": "poll",
  "content": {
    "name": "Qual sua cor favorita?",
    "values": ["Azul", "Vermelho", "Verde", "Amarelo"],
    "selectableCount": 1
  }
}`
    },
    {
      label: 'Álbum de Mídia',
      code: `// Enviar múltiplas mídias em sequência
[
  {
    "type": "image",
    "url": "https://example.com/foto1.jpg",
    "caption": "Primeira foto"
  },
  {
    "type": "image", 
    "url": "https://example.com/foto2.jpg",
    "caption": "Segunda foto"
  },
  {
    "type": "video",
    "url": "https://example.com/video.mp4",
    "caption": "Vídeo do álbum"
  }
]`
    },
    {
      label: 'Carrossel',
      code: `{
  "type": "interactive",
  "content": {
    "text": "Escolha um produto:",
    "footer": "Catálogo de produtos",
    "cards": [
      {
        "title": "Produto 1",
        "image": "https://example.com/produto1.jpg",
        "caption": "Descrição do produto 1"
      },
      {
        "title": "Produto 2", 
        "image": "https://example.com/produto2.jpg",
        "caption": "Descrição do produto 2"
      }
    ],
    "viewOnce": true
  }
}`
    },
    {
      label: 'Solicitação de Pagamento',
      code: `{
  "type": "interactive",
  "content": {
    "requestPayment": {
      "currency": "BRL",
      "amount": "10000",
      "from": "5511999999999@s.whatsapp.net",
      "note": "Pagamento do pedido #123"
    }
  }
}`
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Exemplos de Mensagens
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            {examples.map((example, index) => (
              <Tab
                key={index}
                label={example.label}
                id={`message-example-tab-${index}`}
                aria-controls={`message-example-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {examples.map((example, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {example.label}
              </Typography>
              
              <CodeBlock>
                <CopyButton
                  size="small"
                  onClick={() => copyToClipboard(example.code)}
                >
                  <Tooltip title="Copiar código">
                    <CopyIcon fontSize="small" />
                  </Tooltip>
                </CopyButton>
                <pre>{example.code}</pre>
              </CodeBlock>

              {/* Dicas específicas para cada tipo */}
              <Box sx={{ mt: 2 }}>
                {index === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Mensagens de texto são o tipo mais básico e suportam formatação básica do WhatsApp como *negrito* e _itálico_.
                  </Typography>
                )}
                
                {index === 1 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Para mencionar usuários, use @ seguido do número e inclua o JID completo no array de mentions.
                  </Typography>
                )}
                
                {index === 2 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Imagens podem ser enviadas via URL ou buffer. Formatos suportados: JPG, PNG, GIF, WebP.
                  </Typography>
                )}
                
                {index === 3 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Use ptv: true para nota de vídeo e gifPlayback: true para GIFs animados.
                  </Typography>
                )}
                
                {index === 4 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Para melhor compatibilidade, converta áudios para OGG com codec Opus usando: ffmpeg -i input.mp3 -avoid_negative_ts make_zero -ac 1 output.ogg
                  </Typography>
                )}
                
                {index === 8 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Botões têm limite de 3 por mensagem. Use type: 1 para botões de resposta.
                  </Typography>
                )}
                
                {index === 9 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Listas podem ter múltiplas seções e até 10 itens por seção.
                  </Typography>
                )}
                
                {index === 11 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Enquetes permitem até 12 opções e podem ser de seleção única ou múltipla.
                  </Typography>
                )}
                
                {index === 12 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Álbuns são enviados como múltiplas mensagens em sequência com delay configurável.
                  </Typography>
                )}
                
                {index === 14 && (
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> Valores de pagamento devem ser em centavos (ex: R$ 100,00 = "10000").
                  </Typography>
                )}
              </Box>
            </Box>
          </TabPanel>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageExamples;