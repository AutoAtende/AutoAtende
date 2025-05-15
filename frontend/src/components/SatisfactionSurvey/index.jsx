import React, { useState, useEffect } from 'react';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  Typography,
  Slider,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { Send, ArrowBack, ArrowForward, Close } from '@mui/icons-material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { toast } from '../../helpers/toast';
import { keyframes } from '@emotion/react';
import BaseModal from '../shared/BaseModal';
import api from '../../services/api';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const steps = [
  'Experiência Geral',
  'Atendimento',
  'Gerenciamento',
  'Whatsapp e Conexões',
  'Tarefas e Setores',
  'Recursos Adicionais',
  'Suporte e Feedback'
];

const marks = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
];

const questions = {
  0: [ // Experiência Geral
    { 
      id: 'overall_satisfaction',
      label: 'Qual seu nível de satisfação geral com o sistema?',
      type: 'slider'
    },
    {
      id: 'interface_satisfaction',
      label: 'Como você avalia a interface do sistema em termos de facilidade de uso?',
      type: 'slider'
    },
    {
      id: 'learning_curve',
      label: 'Quão fácil foi aprender a usar o sistema?',
      type: 'slider'
    },
    {
      id: 'recommend_likelihood',
      label: 'Qual a probabilidade de você recomendar o sistema para outros?',
      type: 'slider'
    }
  ],
  1: [ // Atendimento
    {
      id: 'chat_interface',
      label: 'Avalie a interface de atendimento/chat',
      type: 'slider'
    },
    {
      id: 'message_management',
      label: 'Facilidade no gerenciamento de mensagens',
      type: 'slider'
    },
    {
      id: 'queue_efficiency',
      label: 'Eficiência do sistema de filas de atendimento',
      type: 'slider'
    },
    {
      id: 'chat_features',
      label: 'Recursos disponíveis durante o atendimento (respostas rápidas, tags, etc)',
      type: 'slider'
    },
    {
      id: 'chat_improvements',
      label: 'Que recursos você gostaria de ver adicionados ao módulo de atendimento?',
      type: 'text'
    }
  ],
  2: [ // Gerenciamento
    {
      id: 'user_management',
      label: 'Facilidade no gerenciamento de usuários',
      type: 'slider'
    },
    {
      id: 'company_management',
      label: 'Facilidade no gerenciamento de empresas',
      type: 'slider'
    },
    {
      id: 'permission_system',
      label: 'Eficiência do sistema de permissões',
      type: 'slider'
    },
    {
      id: 'reports_quality',
      label: 'Qualidade e utilidade dos relatórios disponíveis',
      type: 'slider'
    }
  ],
  3: [ // Whatsapp e Conexões
    {
      id: 'whatsapp_connection',
      label: 'Facilidade para criar e gerenciar conexões do WhatsApp',
      type: 'slider'
    },
    {
      id: 'connection_stability',
      label: 'Estabilidade das conexões do WhatsApp',
      type: 'slider'
    },
    {
      id: 'multi_device',
      label: 'Experiência com múltiplos dispositivos/conexões',
      type: 'slider'
    },
    {
      id: 'media_handling',
      label: 'Gerenciamento de mídia (imagens, áudios, documentos)',
      type: 'slider'
    }
  ],
  4: [ // Tarefas e Setores
    {
      id: 'task_creation',
      label: 'Facilidade na criação e atribuição de tarefas',
      type: 'slider'
    },
    {
      id: 'task_management',
      label: 'Gerenciamento e acompanhamento de tarefas',
      type: 'slider'
    },
    {
      id: 'sector_organization',
      label: 'Organização e gestão de setores',
      type: 'slider'
    },
    {
      id: 'task_notification',
      label: 'Sistema de notificações de tarefas',
      type: 'slider'
    }
  ],
  5: [ // Recursos Adicionais
    {
      id: 'campaign_tool',
      label: 'Ferramenta de campanhas',
      type: 'slider'
    },
    {
      id: 'contact_management',
      label: 'Gestão de contatos',
      type: 'slider'
    },
    {
      id: 'tag_system',
      label: 'Sistema de tags',
      type: 'slider'
    },
    {
      id: 'api_integration',
      label: 'Facilidade de integração via API',
      type: 'slider'
    }
  ],
  6: [ // Suporte e Feedback
    {
      id: 'support_quality',
      label: 'Qualidade do suporte técnico',
      type: 'slider'
    },
    {
      id: 'response_time',
      label: 'Tempo de resposta do suporte',
      type: 'slider'
    },
    {
      id: 'documentation',
      label: 'Qualidade da documentação e materiais de apoio',
      type: 'slider'
    },
    {
      id: 'system_stability',
      label: 'Estabilidade geral do sistema',
      type: 'slider'
    },
    {
      id: 'general_feedback',
      label: 'Que outras melhorias você sugere para o sistema?',
      type: 'text'
    },
    {
      id: 'usage_time',
      label: 'Há quanto tempo você usa o sistema?',
      type: 'radio',
      options: [
        'Menos de 1 mês',
        '1-6 meses',
        '6-12 meses',
        'Mais de 1 ano'
      ]
    }
  ]
};

const SatisfactionSurvey = ({ forceOpen, onCloseHandler }) => {
  const [open, setOpen] = useState(forceOpen || false);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {

    const checkSubmission = async () => {
      try {
        const { data } = await api.get('/satisfaction-survey/check');
        setHasSubmitted(data.hasSubmitted);
      } catch (error) {
        console.error('Erro ao verificar submissão:', error);
        toast.error('Erro ao verificar status da pesquisa');
      }
    };
    checkSubmission();
  }, []);

  // Se já tiver respondido, não renderiza nada
  if (hasSubmitted) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
    setActiveStep(0);
    setAnswers({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
      if (onCloseHandler) {
        onCloseHandler();
      }
    }
  };

  const handleNext = () => {
    const currentQuestions = questions[activeStep] || [];
    const allAnswered = currentQuestions.every(q => 
      answers[q.id] !== undefined && answers[q.id] !== ''
    );

    if (!allAnswered) {
      toast.warn('Por favor, responda todas as perguntas antes de continuar');
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const currentQuestions = questions[activeStep] || [];
      const allAnswered = currentQuestions.every(q => 
        answers[q.id] !== undefined && answers[q.id] !== ''
      );

      if (!allAnswered) {
        toast.warn('Por favor, responda todas as perguntas antes de enviar');
        setIsSubmitting(false);
        return;
      }

      await api.post('/satisfaction-survey', { answers });
      setHasSubmitted(true);
      setOpen(false);
      toast.success('Pesquisa enviada com sucesso! Obrigado pelo feedback.');
    } catch (error) {
      console.error('Erro ao enviar pesquisa:', error);
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'slider':
        return (
          <Box sx={{ width: '100%', mt: 3, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {question.label}
            </Typography>
            <Slider
              value={answers[question.id] || 1}
              onChange={(_, value) => handleAnswer(question.id, value)}
              step={1}
              marks={marks}
              min={1}
              max={10}
              valueLabelDisplay="auto"
            />
          </Box>
        );
      
      case 'text':
        return (
          <Box sx={{ width: '100%', mt: 3, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {question.label}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
            />
          </Box>
        );
      
      case 'radio':
        return (
          <Box sx={{ width: '100%', mt: 3, mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{question.label}</FormLabel>
              <RadioGroup
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
              >
                {question.options.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      
      default:
        return null;
    }
  };

  if (hasSubmitted) {
    return null;
  }

  const currentQuestions = questions[activeStep] || [];
  const isLastStep = activeStep === steps.length - 1;

  const modalActions = [
    {
      label: 'Fechar',
      icon: <Close />,
      onClick: handleClose,
      color: 'inherit'
    },
    activeStep > 0 && {
      label: 'Anterior',
      icon: <ArrowBack />,
      onClick: handleBack,
      color: 'inherit'
    },
    {
      label: isLastStep ? 'Enviar' : 'Próximo',
      icon: isLastStep ? <Send /> : <ArrowForward />,
      onClick: isLastStep ? handleSubmit : handleNext,
      color: 'primary',
      variant: 'contained',
      loading: isSubmitting
    }
  ].filter(Boolean);

  return (
    <>
      <Tooltip title="Pesquisa de Satisfação">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          size="large"
          sx={{
            animation: `${pulse} 2s infinite`,
            '&:hover': {
              animation: 'none'
            }
          }}
        >
          <SentimentSatisfiedAltIcon sx={{ color: 'white' }} />
        </IconButton>
      </Tooltip>

      <BaseModal
        open={open}
        onClose={handleClose}
        title="Pesquisa de Satisfação"
        actions={modalActions}
        maxWidth="md"
      >
        <Box sx={{ width: '100%', p: 2 }}>
          <Box sx={{ mb: 6, mt: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ 
            width: '100%', 
            maxHeight: '60vh',
            overflowY: 'auto',
            px: 2
          }}>
            {currentQuestions.map((question) => renderQuestion(question))}
          </Box>
        </Box>
      </BaseModal>
    </>
  );
};

export default SatisfactionSurvey;