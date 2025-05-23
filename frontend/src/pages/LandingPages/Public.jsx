import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  InputAdornment
} from '@mui/material';
import { 
  WhatsApp as WhatsAppIcon, 
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import openApi from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { LandingPagePhoneInput } from '../../components/PhoneInputs/LandingPagePhoneInput'; // Novo componente
import { toast } from '../../helpers/toast';

const PublicLandingPage = () => {
  const { companyId, slug } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [landingPage, setLandingPage] = useState(null);
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [phoneValidation, setPhoneValidation] = useState({});
  const [error, setError] = useState(null);
  
  // Referências para os elementos do DOM
  const bootstrapCSSRef = useRef(null);
  const bootstrapJSRef = useRef(null);
  const pixelScriptRef = useRef(null);
  const pixelNoscriptRef = useRef(null);
  
  // Timeout para debounce da validação do telefone
  const phoneValidationTimeoutRef = useRef(null);
  
  // Efeito para carregar a landing page
  useEffect(() => {
    const loadLandingPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await openApi.get(`/landing-pages/company/${companyId}/l/${slug}`);
        setLandingPage(response.data);
        
        // Registrar visita
        try {
          await openApi.post(`/landing-pages/company/${companyId}/l/${response.data.id}/visit`, {
            ip: await fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => data.ip),
            userAgent: navigator.userAgent
          });
        } catch (visitError) {
          console.warn('Erro ao registrar visita:', visitError);
        }
        
        // Se a landing page tiver um formulário ativo
        if (response.data.forms && response.data.forms.length > 0) {
          setForm(response.data.forms[0]);
          
          // Inicializar estado de formulário com campos vazios
          const initialFormData = {};
          response.data.forms[0].fields.forEach(field => {
            initialFormData[field.id] = '';
          });
          setFormData(initialFormData);
        }
        
      } catch (error) {
        setError(
          error.response?.status === 404
            ? 'Esta página não existe ou não está disponível.'
            : 'Ocorreu um erro ao carregar a página. Por favor, tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    loadLandingPage();
  }, [companyId, slug]);
  
  // Função para validar telefone no WhatsApp
  const validatePhoneNumber = async (phone, fieldId) => {
    if (!phone || phone.length < 10) {
      setPhoneValidation(prev => ({
        ...prev,
        [fieldId]: { status: 'idle', message: '' }
      }));
      return;
    }
    
    try {
      setPhoneValidation(prev => ({
        ...prev,
        [fieldId]: { status: 'validating', message: 'Verificando número...' }
      }));
      
      // IMPORTANTE: Limpar formatação antes de enviar para API
      const cleanPhone = phone.replace(/[^\d+]/g, ''); // Remove espaços, traços, parênteses
      
      const response = await openApi.get(
        `/landing-pages/${landingPage.id}/check-phone/${encodeURIComponent(cleanPhone)}`
      );
      
      if (response.data.exists) {
        setPhoneValidation(prev => ({
          ...prev,
          [fieldId]: { 
            status: 'valid', 
            message: 'Número válido no WhatsApp' 
          }
        }));
      } else {
        setPhoneValidation(prev => ({
          ...prev,
          [fieldId]: { 
            status: 'invalid', 
            message: 'Número não encontrado no WhatsApp' 
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao validar telefone:', error);
      setPhoneValidation(prev => ({
        ...prev,
        [fieldId]: { 
          status: 'error', 
          message: 'Erro ao verificar número' 
        }
      }));
    }
  };
  
  
  // Handler para alteração de campos do formulário
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkbox, usar o estado checked
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Limpar erro do campo se for modificado
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Se for campo de telefone, validar após um delay
    const field = form?.fields?.find(f => f.id === name);
    if (field && field.type === 'phone' && type !== 'checkbox') {
      // Limpar timeout anterior
      if (phoneValidationTimeoutRef.current) {
        clearTimeout(phoneValidationTimeoutRef.current);
      }
      
      // Definir novo timeout para validação
      phoneValidationTimeoutRef.current = setTimeout(() => {
        validatePhoneNumber(fieldValue, name);
      }, 1500); // Delay de 1.5 segundos
    }
  };
  
  // Validar formulário
  const validateForm = () => {
    const errors = {};
    const requiredFields = form.fields.filter(field => field.required);
    
    for (const field of requiredFields) {
      if (!formData[field.id] && formData[field.id] !== 0) {
        errors[field.id] = `O campo ${field.label} é obrigatório.`;
      }
    }
    
    // Validar e-mail
    const emailField = form.fields.find(f => f.type === 'email');
    if (emailField && formData[emailField.id]) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(formData[emailField.id])) {
        errors[emailField.id] = 'E-mail inválido.';
      }
    }
    
    // ATUALIZADA: Validar telefone
    const phoneField = form.fields.find(f => f.type === 'phone');
    if (phoneField && formData[phoneField.id]) {
      // Limpar número para validação
      const cleanPhone = formData[phoneField.id].replace(/[^\d+]/g, '');
      
      // Validação de formato atualizada
      const phoneRegex = /^\+[1-9]\d{7,14}$/; // Formato internacional: +[código país][número] (8-15 dígitos total)
      if (!phoneRegex.test(cleanPhone)) {
        errors[phoneField.id] = 'Telefone inválido. Use o formato internacional (+55...)';
      } else {
        // Verificar se o telefone foi validado no WhatsApp
        const validation = phoneValidation[phoneField.id];
        if (validation && validation.status === 'invalid') {
          errors[phoneField.id] = 'Este número não foi encontrado no WhatsApp.';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handler para envio de formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar formulário
      if (!validateForm()) {
        return;
      }
      
      setSubmitting(true);
      
      // Preparar dados do formulário - limpar formatação do telefone
      const submissionData = { ...formData };
      
      // Encontrar campo de telefone e limpar formatação
      const phoneField = form.fields.find(f => f.type === 'phone');
      if (phoneField && submissionData[phoneField.id]) {
        submissionData[phoneField.id] = submissionData[phoneField.id].replace(/[^\d+]/g, '');
      }
      
      // Enviar dados do formulário
      await openApi.post(
        `/landing-pages/company/${companyId}/l/${landingPage.id}/form/${form.id}/submit`,
        submissionData // Usando dados limpos
      );
      
      // Limpar formulário
      const cleanFormData = {};
      Object.keys(formData).forEach(key => {
        cleanFormData[key] = '';
      });
      setFormData(cleanFormData);
      setPhoneValidation({});
      
      // Mostrar mensagem de sucesso
      toast.success('Formulário enviado com sucesso!');
      
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (phoneValidationTimeoutRef.current) {
        clearTimeout(phoneValidationTimeoutRef.current);
      }
    };
  }, []);
    
  // Adicionar Meta Pixel se configurado
  useEffect(() => {
    if (!landingPage?.advancedConfig?.metaPixelId) return;
    
    try {
      // Adicionar Facebook Pixel ao head
      const pixelScript = document.createElement('script');
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${landingPage.advancedConfig.metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
      pixelScriptRef.current = pixelScript;
      
      const pixelNoscript = document.createElement('noscript');
      pixelNoscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${landingPage.advancedConfig.metaPixelId}&ev=PageView&noscript=1"/>
      `;
      document.head.appendChild(pixelNoscript);
      pixelNoscriptRef.current = pixelNoscript;
    } catch (error) {
      console.error('Erro ao adicionar Meta Pixel:', error);
    }
    
    return () => {
      // Limpeza ao desmontar - com verificação de existência
      try {
        if (pixelScriptRef.current && document.head.contains(pixelScriptRef.current)) {
          document.head.removeChild(pixelScriptRef.current);
        }
        if (pixelNoscriptRef.current && document.head.contains(pixelNoscriptRef.current)) {
          document.head.removeChild(pixelNoscriptRef.current);
        }
      } catch (error) {
        console.error('Erro ao remover Meta Pixel:', error);
      }
    };
  }, [landingPage?.advancedConfig?.metaPixelId]);
  
  // Função para obter ícone de validação do telefone
  const getPhoneValidationIcon = (fieldId) => {
    const validation = phoneValidation[fieldId];
    if (!validation) return null;
    
    switch (validation.status) {
      case 'validating':
        return <HourglassEmptyIcon color="action" />;
      case 'valid':
        return <CheckCircleIcon color="success" />;
      case 'invalid':
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };
  
  // Função para obter cor da validação do telefone
  const getPhoneValidationColor = (fieldId) => {
    const validation = phoneValidation[fieldId];
    if (!validation) return undefined;
    
    switch (validation.status) {
      case 'valid':
        return 'success';
      case 'invalid':
      case 'error':
        return 'error';
      default:
        return undefined;
    }
  };
  
  // Renderizar campo de formulário baseado no tipo
  const renderFormField = (field) => {
    const focusColor = landingPage.formConfig.focusColor || '#1976d2';
    const validation = phoneValidation[field.id];
    
    switch (field.type) {
      case 'select':
        return (
          <FormControl 
            fullWidth
            error={!!formErrors[field.id]}
            required={field.required}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: focusColor,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: focusColor,
              }
            }}
          >
            <InputLabel id={`${field.id}-label`}>{field.label}</InputLabel>
            <Select
              labelId={`${field.id}-label`}
              name={field.id}
              value={formData[field.id] || ''}
              onChange={handleFieldChange}
              label={field.label}
            >
              <MenuItem value=""><em>Selecione</em></MenuItem>
              {(field.options || []).map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {formErrors[field.id] && (
              <FormHelperText error>{formErrors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );
          
      case 'date':
        return (
          <TextField
            type="date"
            fullWidth
            label={field.label}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={handleFieldChange}
            required={field.required}
            error={!!formErrors[field.id]}
            helperText={formErrors[field.id]}
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: focusColor,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: focusColor,
              }
            }}
          />
        );
      
      case 'email':
        return (
          <TextField
            type="email"
            fullWidth
            label={field.label}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={handleFieldChange}
            placeholder={field.placeholder}
            required={field.required}
            error={!!formErrors[field.id]}
            helperText={formErrors[field.id]}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: focusColor,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: focusColor,
              }
            }}
          />
        );
      
      case 'phone':
        return (
          <LandingPagePhoneInput
            label={field.label}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={handleFieldChange}
            placeholder={field.placeholder || "+55 XX XXXXX-XXXX"}
            required={field.required}
            error={!!formErrors[field.id] || getPhoneValidationColor(field.id) === 'error'}
            helperText={
              formErrors[field.id] || 
              (validation ? validation.message : '')
            }
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {getPhoneValidationIcon(field.id)}
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: focusColor,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: focusColor,
              }
            }}
          />
        );
        
      case 'checkbox':
        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            {(field.options || []).map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    name={`${field.id}_${index}`}
                    checked={!!formData[`${field.id}_${index}`]}
                    onChange={handleFieldChange}
                  />
                }
                label={option}
              />
            ))}
            {formErrors[field.id] && (
              <FormHelperText error>{formErrors[field.id]}</FormHelperText>
            )}
          </Box>
        );
        
      case 'radio':
        return (
          <FormControl 
            component="fieldset" 
            fullWidth 
            margin="normal"
            error={!!formErrors[field.id]}
            required={field.required}
          >
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            <RadioGroup
              name={field.id}
              value={formData[field.id] || ''}
              onChange={handleFieldChange}
            >
              {(field.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {formErrors[field.id] && (
              <FormHelperText error>{formErrors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );
        
      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={handleFieldChange}
            placeholder={field.placeholder}
            required={field.required}
            error={!!formErrors[field.id]}
            helperText={formErrors[field.id]}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: focusColor,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: focusColor,
              }
            }}
          />
        );
    }
  };
  
  // Renderização do formulário
  const renderForm = () => {
    if (!landingPage.formConfig.showForm || !form) {
      return null;
    }
    
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 2,
          width: '100%',
          height: 'auto',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'flex-start',
        }}
      >
        <Typography variant="h6" gutterBottom>
          {landingPage.formConfig.title}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          {form.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <Box key={field.id || field.name} mb={2}>
                {renderFormField(field)}
              </Box>
            ))}
        
          <Button
            type="submit"
            variant="contained"
            sx={{ 
              mt: 2,
              width: '100%',
              minHeight: '56px', // Mesma altura dos campos TextField
              backgroundColor: landingPage.formConfig.buttonColor || '#1976d2',
              '&:hover': {
                backgroundColor: landingPage.formConfig.buttonColor 
                  ? `${landingPage.formConfig.buttonColor}e0`
                  : '#1565c0',
              },
              '&.Mui-disabled': {
                backgroundColor: landingPage.formConfig.buttonColor 
                  ? `${landingPage.formConfig.buttonColor}80`
                  : 'rgba(0, 0, 0, 0.12)',
              }
            }}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              landingPage.formConfig.buttonText
            )}
          </Button>
        </Box>
        
        {landingPage.formConfig.limitSubmissions && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Limite de {landingPage.formConfig.maxSubmissions} cadastros
          </Typography>
        )}
      </Paper>
    );
  };
  
  // Botão de chat do WhatsApp
  const renderWhatsAppButton = () => {
    if (!landingPage.advancedConfig?.whatsAppChatButton?.enabled) {
      return null;
    }
    
    const phoneNumber = landingPage.advancedConfig.whatsAppChatButton.number;
    if (!phoneNumber) return null;
    
    // Preparar mensagem com variáveis substituídas
    let message = landingPage.advancedConfig.whatsAppChatButton.defaultMessage || '';
    message = message.replace('{landing_page}', landingPage.title);
    
    // Construir URL para WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Link 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          underline="none"
        >
          <IconButton
            sx={{
              backgroundColor: '#25D366',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#128C7E',
              },
              width: '60px',
              height: '60px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            <WhatsAppIcon fontSize="large" />
          </IconButton>
        </Link>
      </Box>
    );
  };
  
  // Se estiver carregando
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Se ocorreu algum erro
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Ops! Algo deu errado.
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </Paper>
      </Box>
    );
  }
  
  // Renderizar a página com seu conteúdo
  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: landingPage.appearance.textColor,
        backgroundColor: landingPage.appearance.backgroundColor,
        backgroundImage: landingPage.appearance.backgroundImage 
          ? `url(${landingPage.appearance.backgroundImage})` 
          : 'none',
        backgroundPosition: landingPage.appearance.backgroundPosition || 'center',
        backgroundRepeat: landingPage.appearance.backgroundRepeat ? 'repeat' : 'no-repeat',
        backgroundSize: landingPage.appearance.backgroundSize || 'cover',
        backgroundAttachment: landingPage.appearance.backgroundAttachment || 'scroll',
      }}
    >
      <Box
        component="main"
        className="container"
        sx={{
          py: { xs: 3, md: 4 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Grid 
          container 
          spacing={3}
          className="row"
        >
          {/* Formulário à esquerda */}
          {landingPage.formConfig.position === 'left' && landingPage.formConfig.showForm && (
            <Grid 
              item 
              xs={12} 
              md={4} 
              className="col-md-4"
              sx={{ 
                height: 'auto',
                alignSelf: 'flex-start'
              }}
            >
              {renderForm()}
            </Grid>
          )}
          
          {/* Conteúdo principal */}
          <Grid 
            item 
            xs={12} 
            md={
              landingPage.formConfig.showForm && 
              landingPage.formConfig.position !== 'center' 
                ? 8 
                : 12
            }
            className={`col-md-${landingPage.formConfig.showForm && landingPage.formConfig.position !== 'center' ? '8' : '12'}`}
          >
            {/* Título do evento */}
            {landingPage.eventConfig?.isEvent && landingPage.eventConfig?.eventTitle && (
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 'bold' }}
                className="mb-4"
              >
                {landingPage.eventConfig.eventTitle}
              </Typography>
            )}
            
            {/* Conteúdo HTML com Bootstrap */}
            <Box sx={{ mb: 4 }} className="content-container">
              <div 
                dangerouslySetInnerHTML={{ __html: landingPage.content }} 
                className="landing-page-content"
              />
            </Box>
            
            {/* Formulário centralizado */}
            {landingPage.formConfig.position === 'center' && landingPage.formConfig.showForm && (
              <Box 
                sx={{ 
                  maxWidth: '600px', 
                  mx: 'auto', 
                  my: 4,
                  height: 'auto',
                  alignSelf: 'flex-start'
                }}
              >
                {renderForm()}
              </Box>
            )}
          </Grid>
          
          {/* Formulário à direita */}
          {landingPage.formConfig.position === 'right' && landingPage.formConfig.showForm && (
            <Grid 
              item 
              xs={12} 
              md={4} 
              className="col-md-4"
              sx={{ 
                height: 'auto',
                alignSelf: 'flex-start'
              }}
            >
              {renderForm()}
            </Grid>
          )}
        </Grid>
      </Box>
      
      {/* Botão de WhatsApp flutuante */}
      {renderWhatsAppButton()}
    </Box>
  );
};

export default PublicLandingPage;