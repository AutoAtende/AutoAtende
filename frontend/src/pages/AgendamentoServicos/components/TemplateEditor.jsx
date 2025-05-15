import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  NavigateNext as NavigateNextIcon,
  Chat as ChatIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Função simples para substituir variáveis no template
const processTemplate = (template, data) => {
  let processed = template;
  Object.keys(data).forEach(key => {
    processed = processed.replace(new RegExp(`{${key}}`, 'g'), data[key]);
  });
  return processed;
};

const TemplateEditor = ({ value, onChange, label, helperText, placeholders, error, allTemplates }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [previewData, setPreviewData] = useState({
    name: 'João Silva',
    service: 'Corte de Cabelo',
    professional: 'Ana Barbosa',
    date: '15/05/2025',
    time: '14:30',
    duration: '30',
    price: 'R$ 50,00',
    greeting: 'Bom dia',
    primeiro_nome: 'João',
    cancellationReason: 'Cliente solicitou cancelamento'
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [textFieldRef, setTextFieldRef] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const insertPlaceholder = (placeholder) => {
    if (!textFieldRef) return;
    
    const newValue = 
      value.substring(0, cursorPosition) + 
      `{${placeholder}}` + 
      value.substring(cursorPosition);
    
    onChange(newValue);
    
    // Focar e posicionar o cursor após o placeholder inserido
    setTimeout(() => {
      textFieldRef.focus();
      const newPosition = cursorPosition + placeholder.length + 2;
      textFieldRef.setSelectionRange(newPosition, newPosition);
    }, 100);
  };

  // Processa o template usando nossa própria função de substituição
  const handlePreviewRender = () => {
    try {
      return processTemplate(value, previewData);
    } catch (error) {
      return `Erro ao renderizar template: ${error.message}`;
    }
  };

  const simulateFlow = () => {
    setSimulationOpen(true);
    setActiveStep(0);
    
    // Iniciar a simulação do fluxo de agendamento
    let initialHistory = [];
    
    // Adicionar mensagem de boas-vindas do sistema
    const welcomeMessage = allTemplates?.welcomeMessage || 
      "Olá! Bem-vindo ao nosso sistema de agendamento.\n\nDigite o número da opção desejada:\n1 - Fazer um agendamento\n2 - Consultar meus agendamentos\n3 - Falar com um atendente";
    
    initialHistory.push({
      sender: 'system',
      message: processTemplate(welcomeMessage, previewData)
    });
    
    setConversationHistory(initialHistory);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    
    // Atualizar a conversa com base no passo atual
    const updatedHistory = [...conversationHistory];
    
    switch(activeStep) {
      case 0: // Usuário selecionou "1" - Fazer agendamento
        updatedHistory.push({
          sender: 'user',
          message: "1"
        });
        
        // Sistema apresenta lista de serviços
        updatedHistory.push({
          sender: 'system',
          message: "Por favor, selecione o serviço desejado:\n\n*[ 1 ]* - Corte de Cabelo (30 min)\n*[ 2 ]* - Barba (20 min)\n*[ 3 ]* - Coloração (60 min)\n\nDigite o número correspondente ao serviço desejado."
        });
        break;
        
      case 1: // Usuário selecionou serviço "1" - Corte de Cabelo
        updatedHistory.push({
          sender: 'user',
          message: "1"
        });
        
        // Sistema apresenta lista de profissionais
        updatedHistory.push({
          sender: 'system',
          message: "Você selecionou o serviço: *Corte de Cabelo*\n\nPor favor, selecione o profissional desejado:\n\n*[ 1 ]* - Ana Barbosa\n*[ 2 ]* - Carlos Silva\n\nDigite o número correspondente ao profissional desejado."
        });
        break;
        
      case 2: // Usuário selecionou profissional "1" - Ana Barbosa
        updatedHistory.push({
          sender: 'user',
          message: "1"
        });
        
        // Sistema apresenta datas disponíveis
        updatedHistory.push({
          sender: 'system',
          message: "Você selecionou o profissional: *Ana Barbosa*\n\nPor favor, selecione a data desejada:\n\n*[ 1 ]* - 15/05/2025 (quarta-feira)\n*[ 2 ]* - 16/05/2025 (quinta-feira)\n*[ 3 ]* - 17/05/2025 (sexta-feira)\n\nDigite o número correspondente à data desejada."
        });
        break;
        
      case 3: // Usuário selecionou data "1" - 15/05/2025
        updatedHistory.push({
          sender: 'user',
          message: "1"
        });
        
        // Sistema apresenta horários disponíveis
        updatedHistory.push({
          sender: 'system',
          message: "Você selecionou a data: *15/05/2025 (quarta-feira)*\n\nPor favor, selecione o horário desejado:\n\n*[ 1 ]* - 14:30\n*[ 2 ]* - 15:00\n*[ 3 ]* - 16:30\n\nDigite o número correspondente ao horário desejado."
        });
        break;
        
      case 4: // Usuário selecionou horário "1" - 14:30
        updatedHistory.push({
          sender: 'user',
          message: "1"
        });
        
        // Sistema apresenta confirmação do agendamento
        const confirmationMessage = allTemplates?.confirmationMessage || 
          "Por favor, confirme os detalhes do seu agendamento:\n\n*Serviço:* {service}\n*Profissional:* {professional}\n*Data:* {date}\n*Horário:* {time}\n*Duração:* {duration} minutos\n*Valor:* {price}\n\nDigite *CONFIRMAR* para finalizar o agendamento ou *CANCELAR* para desistir.";
        
        updatedHistory.push({
          sender: 'system',
          message: processTemplate(confirmationMessage, previewData)
        });
        break;
        
      case 5: // Usuário confirmou o agendamento
        updatedHistory.push({
          sender: 'user',
          message: "CONFIRMAR"
        });
        
        // Sistema envia mensagem de sucesso
        const successMessage = "🎉 *Agendamento realizado com sucesso!* 🎉\n\n" +
          "Aqui estão os detalhes do seu agendamento:\n\n" +
          `*Serviço:* ${previewData.service}\n` +
          `*Profissional:* ${previewData.professional}\n` +
          `*Data:* ${previewData.date}\n` +
          `*Horário:* ${previewData.time}\n` +
          `*Duração:* ${previewData.duration} minutos\n` +
          `*Valor:* ${previewData.price}\n\n` +
          "Para cancelar este agendamento, acesse o menu principal e escolha a opção 'Consultar meus agendamentos'.\n\n" +
          "Agradecemos pela preferência!";
        
        updatedHistory.push({
          sender: 'system',
          message: successMessage
        });
        break;
        
      default:
        // Fim da simulação
        break;
    }
    
    setConversationHistory(updatedHistory);
  };

  const handleReset = () => {
    setActiveStep(0);
    simulateFlow(); // Reiniciar a simulação
  };

  // Define os passos da simulação
  const steps = [
    {
      label: 'Menu Principal',
      description: 'Usuário escolhe "Fazer um agendamento"',
    },
    {
      label: 'Seleção de Serviço',
      description: 'Usuário escolhe "Corte de Cabelo"',
    },
    {
      label: 'Seleção de Profissional',
      description: 'Usuário escolhe "Ana Barbosa"',
    },
    {
      label: 'Seleção de Data',
      description: 'Usuário escolhe "15/05/2025"',
    },
    {
      label: 'Seleção de Horário',
      description: 'Usuário escolhe "14:30"',
    },
    {
      label: 'Confirmação',
      description: 'Usuário confirma o agendamento',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">{label}</Typography>
            <Box>
              <Tooltip title="Visualizar prévia">
                <IconButton 
                  size="small" 
                  onClick={() => setPreviewOpen(true)}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Simular fluxo completo">
                <IconButton 
                  size="small" 
                  onClick={simulateFlow}
                  color="secondary"
                  sx={{ ml: 1 }}
                >
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            variant="outlined"
            helperText={helperText}
            error={error}
            inputRef={setTextFieldRef}
            onFocus={(e) => setCursorPosition(e.target.selectionStart)}
            onClick={(e) => setCursorPosition(e.target.selectionStart)}
            onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">
            Variáveis disponíveis (clique para inserir):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {placeholders.map((placeholder) => (
              <Chip
                key={placeholder.label}
                label={placeholder.label}
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => insertPlaceholder(placeholder.label.replace('{', '').replace('}', ''))}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Modal de prévia */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Prévia da Mensagem
        </DialogTitle>
        <DialogContent>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Prévia" />
            <Tab label="Dados de Teste" />
          </Tabs>
          
          {currentTab === 0 && (
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ p: 2, mt: 2, whiteSpace: 'pre-wrap', fontFamily: 'WhatsApp, Arial', bgcolor: '#e5ffd0' }}
            >
              {handlePreviewRender()}
            </Paper>
          )}
          
          {currentTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Editar dados para teste:
              </Typography>
              <Grid container spacing={2}>
                {Object.keys(previewData).map(key => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      label={key}
                      value={previewData[key]}
                      onChange={(e) => setPreviewData({...previewData, [key]: e.target.value})}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de simulação de fluxo */}
      <Dialog 
        open={simulationOpen} 
        onClose={() => setSimulationOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Simulação do Fluxo de Agendamento
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Progresso da simulação:
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepContent>
                      <Typography variant="body2">{step.description}</Typography>
                      <Box sx={{ mb: 2, mt: 1 }}>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<NavigateNextIcon />}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {index === steps.length - 1 ? 'Finalizar' : 'Avançar'}
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              {activeStep === steps.length && (
                <Paper square elevation={0} sx={{ p: 3 }}>
                  <Typography>Simulação concluída!</Typography>
                  <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                    Reiniciar
                  </Button>
                </Paper>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>
                Conversação:
              </Typography>
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  height: '500px', 
                  overflow: 'auto',
                  bgcolor: '#f5f5f5'
                }}
              >
                <List>
                  {conversationHistory.map((message, index) => (
                    <React.Fragment key={index}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                          p: 1
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.5
                          }}
                        >
                          {message.sender === 'system' ? 
                            <ChatIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} /> : 
                            <PersonIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                          }
                          <Typography variant="caption" color="text.secondary">
                            {message.sender === 'system' ? 'Sistema' : 'Você'}
                          </Typography>
                        </Box>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 1.5, 
                            maxWidth: '80%',
                            bgcolor: message.sender === 'system' ? '#e5ffd0' : '#e3f2fd',
                            borderRadius: 2,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'WhatsApp, Arial'
                          }}
                        >
                          {message.message}
                        </Paper>
                      </ListItem>
                      {index < conversationHistory.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSimulationOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditor;