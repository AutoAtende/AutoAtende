import React, { useState, useCallback } from 'react';
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

// Dados dos exemplos específicos para os tipos solicitados
const EXAMPLES_DATA = [
  {
    label: 'Botões',
    code: `{
  "type": "buttons",
  "content": {
    "text": "Escolha uma opção:",
    "footer": "AutoAtende - 2025",
    "buttons": [
      {
        "buttonId": "🚀",
        "buttonText": {
          "displayText": "🗿"
        },
        "type": 1
      },
      {
        "buttonId": "option2",
        "buttonText": {
          "displayText": "Opção 2"
        },
        "type": 1
      }
    ],
    "headerType": 1,
    "viewOnce": true
  }
}`,
    tip: 'Mensagens de botões têm limite de 3 botões por mensagem. Use type: 1 para botões de resposta rápida.',
    description: 'Envie mensagens com botões interativos para facilitar a navegação do usuário.'
  },
  {
    label: 'Interativa',
    code: `{
  "type": "interactive",
  "content": {
    "text": "Baileys Pro",
    "title": "Igna",
    "subtitle": "test",
    "footer": "Bot",
    "buttons": [
      {
        "name": "single_select",
        "buttonParamsJson": "{\\"title\\":\\"Opções\\",\\"sections\\":[{\\"title\\":\\"AutoAtende - 2025\\",\\"highlight_label\\":\\"😜\\",\\"rows\\":[{\\"header\\":\\"HEADER\\",\\"title\\":\\"TITLE\\",\\"description\\":\\"DESCRIPTION\\",\\"id\\":\\"YOUR_ID\\"}]}]}"
      },
      {
        "name": "cta_reply",
        "buttonParamsJson": "{\\"display_text\\":\\"Resposta Rápida\\",\\"id\\":\\"quick_reply\\"}"
      },
      {
        "name": "cta_url",
        "buttonParamsJson": "{\\"display_text\\":\\"Visitar Site\\",\\"url\\":\\"https://www.google.com\\",\\"merchant_url\\":\\"https://www.google.com\\"}"
      }
    ]
  }
}`,
    tip: 'Mensagens interativas suportam vários tipos de botões: single_select, cta_reply, cta_url, cta_call, cta_copy, entre outros.',
    description: 'Mensagens interativas avançadas com múltiplos tipos de botões e funcionalidades.'
  },
  {
    label: 'Lista',
    code: `{
  "type": "list",
  "content": {
    "text": "This is a list",
    "footer": "nice footer, link: https://google.com",
    "title": "Amazing boldfaced list title",
    "buttonText": "Required, text on the button to view the list",
    "sections": [
      {
        "title": "Section 1",
        "rows": [
          {
            "title": "Option 1",
            "rowId": "option1"
          },
          {
            "title": "Option 2",
            "rowId": "option2",
            "description": "This is a description"
          }
        ]
      },
      {
        "title": "Section 2",
        "rows": [
          {
            "title": "Option 3",
            "rowId": "option3"
          },
          {
            "title": "Option 4",
            "rowId": "option4",
            "description": "This is a description V2"
          }
        ]
      }
    ]
  }
}`,
    tip: 'Listas podem ter múltiplas seções e até 10 itens por seção. Ideais para menus organizados.',
    description: 'Envie listas organizadas em seções para facilitar a seleção de opções.'
  },
  {
    label: 'Carrossel',
    code: `{
  "type": "carousel",
  "content": {
    "text": "Escolha um produto:",
    "footer": "Catálogo de produtos",
    "cards": [
      {
        "title": "Produto 1",
        "image": {
          "url": "https://picsum.photos/300/200?random=1"
        },
        "caption": "Descrição do produto 1"
      },
      {
        "title": "Produto 2",
        "image": {
          "url": "https://picsum.photos/300/200?random=2"
        },
        "caption": "Descrição do produto 2"
      }
    ],
    "viewOnce": true
  }
}`,
    tip: 'Carrosséis são ideais para catálogos de produtos ou galerias de imagens. Cada card pode ter imagem e descrição.',
    description: 'Crie carrosséis visuais com múltiplos cards contendo imagens e descrições.'
  },
  {
    label: 'Solicitar Pagamento',
    code: `{
  "type": "requestPayment",
  "content": {
    "currency": "BRL",
    "amount": "10000",
    "from": "5511999999999@s.whatsapp.net",
    "note": "Pagamento de teste - AutoAtende",
    "background": {}
  }
}`,
    tip: 'Valores devem ser em centavos (ex: R$ 100,00 = "10000"). Suporta diferentes moedas: BRL, USD, EUR.',
    description: 'Envie solicitações de pagamento diretamente pelo WhatsApp com valor e descrição.'
  },
  {
    label: 'Exemplo Completo - Botões',
    code: `// Código JavaScript para envio direto via Baileys
sock.sendMessage(jid, {
  text: "Hello World !",
  footer: "Baileys - 2025",
  buttons: [
    {
      buttonId: \`🚀\`, 
      buttonText: {
        displayText: '🗿'
      },
      type: 1 
    }
  ],
  headerType: 1,
  viewOnce: true
}, { quoted: null })`,
    tip: 'Este é o código direto do Baileys para referência dos desenvolvedores.',
    description: 'Exemplo de implementação direta usando a biblioteca Baileys.'
  },
  {
    label: 'Exemplo Completo - Lista',
    code: `// Código JavaScript para envio direto via Baileys
const sections = [
  {
    title: "Section 1",
    rows: [
      {title: "Option 1", rowId: "option1"},
      {title: "Option 2", rowId: "option2", description: "This is a description"}
    ]
  },
  {
    title: "Section 2",
    rows: [
      {title: "Option 3", rowId: "option3"},
      {title: "Option 4", rowId: "option4", description: "This is a description V2"}
    ]
  }
];

const listMessage = {
  text: "This is a list",
  footer: "nice footer, link: https://google.com",
  title: "Amazing boldfaced list title",
  buttonText: "Required, text on the button to view the list",
  sections
};

await sock.sendMessage(jid, listMessage)`,
    tip: 'Implementação completa de uma mensagem de lista usando Baileys.',
    description: 'Exemplo prático de como criar e enviar listas organizadas.'
  }
];

const MessageExamples = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Código copiado para a área de transferência!');
    }).catch(() => {
      toast.error('Erro ao copiar código');
    });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTabValue(0); // Reset tab when closing
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Exemplos de Mensagens WhatsApp Pro
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
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
            {EXAMPLES_DATA.map((example, index) => (
              <Tab
                key={`tab-${index}`}
                label={example.label}
                id={`message-example-tab-${index}`}
                aria-controls={`message-example-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {EXAMPLES_DATA.map((example, index) => (
          <TabPanel key={`panel-${index}`} value={tabValue} index={index}>
            <Box sx={{ px: 3, pb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {example.label}
              </Typography>
              
              {example.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {example.description}
                </Typography>
              )}
              
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
              {example.tip && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Dica:</strong> {example.tip}
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
        ))}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="contained" size="large">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageExamples;