import React, { useState, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Grid,
  TextField,
  Divider,
  Alert,
  Tooltip,
  Button,
  useMediaQuery
} from '@mui/material';
import {
  Devices as DevicesIcon,
  PhoneAndroid as MobileIcon,
  Laptop as DesktopIcon,
  QrCode as QrCodeIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { sanitizeHtml } from '../../../utils/stringUtils';
import QRCodeDialog from '../../../components/QrCodeDialog';
import BaseModal from '../../../components/BaseModal';
import { AuthContext } from '../../../context/Auth/AuthContext';

const AnimatedBox = animated(Box);
const AnimatedPaper = animated(Paper);

const PreviewDialog = ({ open, onClose, landingPage, form }) => {
  const { user } = useContext(AuthContext);
  const [deviceView, setDeviceView] = useState('desktop');
  const [showQrCode, setShowQrCode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Animações
  const fadeIn = useSpring({
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(20px)',
    config: { tension: 280, friction: 60 }
  });

  const deviceAnimation = useSpring({
    opacity: 1,
    transform: deviceView === 'desktop' ? 'scale(1)' : 'scale(0.95)',
    config: { tension: 280, friction: 60 }
  });
  
  // Handler para mudança de visualização (mobile/desktop)
  const handleDeviceChange = (event, newValue) => {
    setDeviceView(newValue);
  };
  
  // Função para renderizar o formulário
  const renderForm = () => {
    if (!landingPage.formConfig.showForm) {
      return null;
    }
    
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 2,
          maxWidth: '100%',
          width: deviceView === 'mobile' ? '100%' : '350px',
          alignSelf: landingPage.formConfig.position === 'center' ? 'center' : 'auto',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          {landingPage.formConfig.title}
        </Typography>
        
        <Box component="form" sx={{ mb: 2 }}>
          {form.fields
            .sort((a, b) => a.order - b.order)
            .map((field, index) => (
              <Box key={index} mb={2}>
                {renderFormField(field)}
              </Box>
            ))}
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled
            sx={{ mt: 2 }}
          >
            {landingPage.formConfig.buttonText}
          </Button>
        </Box>
        
        {landingPage.formConfig.limitSubmissions && (
          <Typography variant="caption" color="textSecondary">
            Limite de {landingPage.formConfig.maxSubmissions} cadastros
          </Typography>
        )}
      </Paper>
    );
  };

  // Renderizar campo de formulário baseado no tipo
  const renderFormField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <TextField
            select
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled
            variant="outlined"
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            {(field.options || []).map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </TextField>
        );
      case 'date':
        return (
          <TextField
            type="date"
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />
        );
      case 'email':
        return (
          <TextField
            type="email"
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled
            variant="outlined"
          />
        );
      case 'phone':
        return (
          <TextField
            type="tel"
            fullWidth
            label={field.label}
            placeholder={field.placeholder || "+55 XX XXXXX-XXXX"}
            required={field.required}
            disabled
            variant="outlined"
          />
        );
      case 'checkbox':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
              {field.required && <span style={{ color: theme.palette.error.main }}> *</span>}
            </Typography>
            {(field.options || []).map((option, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" disabled style={{ marginRight: 8 }} />
                  {option}
                </label>
              </Box>
            ))}
          </Box>
        );
      case 'radio':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
              {field.required && <span style={{ color: theme.palette.error.main }}> *</span>}
            </Typography>
            {(field.options || []).map((option, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="radio" name={field.id} disabled style={{ marginRight: 8 }} />
                  {option}
                </label>
              </Box>
            ))}
          </Box>
        );
      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled
            variant="outlined"
          />
        );
    }
  };

  // Abrir diálogo de QR Code
  const handleOpenQrCode = () => {
    setShowQrCode(true);
  };

  // Fechar diálogo de QR Code
  const handleCloseQrCode = () => {
    setShowQrCode(false);
  };

  // Copiar URL da landing page
  const handleCopyUrl = () => {
    const url = `${window.location.origin}/l/${user.companyId}/${landingPage.slug}`;
    navigator.clipboard.writeText(url);
  };
  
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Pré-visualização: ${landingPage.title}`}
      maxWidth="lg"
      fullWidth
      actions={[
        {
          label: "Copiar URL",
          onClick: handleCopyUrl,
          variant: "outlined",
          color: "primary",
          icon: <CopyIcon />
        },
        {
          label: "Ver QR Code",
          onClick: handleOpenQrCode,
          variant: "outlined",
          color: "primary",
          icon: <QrCodeIcon />
        },
        {
          label: "Fechar",
          onClick: onClose,
          variant: "contained",
          color: "primary"
        }
      ]}
    >
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={deviceView}
            onChange={handleDeviceChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            aria-label="device preview tabs"
          >
            <Tab 
              icon={<DesktopIcon />} 
              label="Desktop" 
              value="desktop"
              iconPosition="start"
            />
            <Tab 
              icon={<MobileIcon />} 
              label="Mobile" 
              value="mobile"
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        <Alert 
          severity="info" 
          variant="outlined"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          <Typography variant="body2">
            Esta é uma prévia da sua landing page. As interações como envio de formulário não estão disponíveis no modo de pré-visualização.
          </Typography>
        </Alert>
        
        <AnimatedBox style={deviceAnimation}>
          <AnimatedPaper
            elevation={2}
            sx={{
              p: 0,
              overflow: 'hidden',
              height: '70vh',
              width: deviceView === 'mobile' ? '380px' : '100%',
              maxWidth: deviceView === 'mobile' ? '380px' : '100%',
              mx: 'auto',
              border: deviceView === 'mobile' ? '10px solid #333' : 'none',
              borderRadius: deviceView === 'mobile' ? '20px' : '2px',
              position: 'relative'
            }}
          >
            {/* Incorporar iframe com Bootstrap para preview responsiva */}
            <Box 
              component="iframe"
              sx={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              srcDoc={`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${landingPage.title || 'Landing Page'}</title>
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                  <style>
                    body {
                      color: ${landingPage.appearance.textColor || '#000000'};
                      background-color: ${landingPage.appearance.backgroundColor || '#ffffff'};
                      ${landingPage.appearance.backgroundImage ? `background-image: url(${landingPage.appearance.backgroundImage});` : ''}
                      ${landingPage.appearance.backgroundPosition ? `background-position: ${landingPage.appearance.backgroundPosition};` : ''}
                      ${landingPage.appearance.backgroundRepeat ? 'background-repeat: repeat;' : 'background-repeat: no-repeat;'}
                      ${landingPage.appearance.backgroundSize ? `background-size: ${landingPage.appearance.backgroundSize};` : ''}
                      ${landingPage.appearance.backgroundAttachment ? `background-attachment: ${landingPage.appearance.backgroundAttachment};` : ''}
                      padding: 0;
                      margin: 0;
                    }
                    .form-container {
                      background-color: rgba(255, 255, 255, 0.9);
                      border-radius: 8px;
                      padding: 20px;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .content-container {
                      padding: 20px;
                    }
                    .whatsapp-button {
                      position: fixed;
                      bottom: 20px;
                      right: 20px;
                      width: 60px;
                      height: 60px;
                      background-color: #25D366;
                      color: white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                      z-index: 1000;
                      text-decoration: none;
                      border: none;
                    }
                  </style>
                </head>
                <body>
                  <div class="container py-4">
                    ${
                      deviceView === 'desktop' && landingPage.formConfig.position === 'left' && landingPage.formConfig.showForm
                        ? `
                        <div class="row">
                          <div class="col-md-4">
                            <div class="form-container">
                              <h4>${landingPage.formConfig.title || 'Formulário'}</h4>
                              <form>
                                <!-- Formulário renderizado aqui -->
                                <button type="button" class="btn btn-primary w-100 mt-3" disabled>
                                  ${landingPage.formConfig.buttonText || 'Enviar'}
                                </button>
                              </form>
                            </div>
                          </div>
                          <div class="col-md-8">
                            <div class="content-container">
                              ${landingPage.eventConfig.isEvent && landingPage.eventConfig.eventTitle 
                                ? `<h2>${landingPage.eventConfig.eventTitle}</h2>` 
                                : ''}
                              ${landingPage.content || '<p>Conteúdo da sua landing page.</p>'}
                            </div>
                          </div>
                        </div>
                        `
                        : deviceView === 'desktop' && landingPage.formConfig.position === 'right' && landingPage.formConfig.showForm
                        ? `
                        <div class="row">
                          <div class="col-md-8">
                            <div class="content-container">
                              ${landingPage.eventConfig.isEvent && landingPage.eventConfig.eventTitle 
                                ? `<h2>${landingPage.eventConfig.eventTitle}</h2>` 
                                : ''}
                              ${landingPage.content || '<p>Conteúdo da sua landing page.</p>'}
                            </div>
                          </div>
                          <div class="col-md-4">
                            <div class="form-container">
                              <h4>${landingPage.formConfig.title || 'Formulário'}</h4>
                              <form>
                                <!-- Formulário renderizado aqui -->
                                <button type="button" class="btn btn-primary w-100 mt-3" disabled>
                                  ${landingPage.formConfig.buttonText || 'Enviar'}
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                        `
                        : `
                        <div class="content-container">
                          ${landingPage.eventConfig.isEvent && landingPage.eventConfig.eventTitle 
                            ? `<h2>${landingPage.eventConfig.eventTitle}</h2>` 
                            : ''}
                          ${landingPage.content || '<p>Conteúdo da sua landing page.</p>'}
                          
                          ${landingPage.formConfig.position === 'center' && landingPage.formConfig.showForm
                            ? `
                            <div class="row justify-content-center mt-4">
                              <div class="col-lg-6">
                                <div class="form-container">
                                  <h4>${landingPage.formConfig.title || 'Formulário'}</h4>
                                  <form>
                                    <!-- Formulário renderizado aqui -->
                                    <button type="button" class="btn btn-primary w-100 mt-3" disabled>
                                      ${landingPage.formConfig.buttonText || 'Enviar'}
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                            `
                            : ''
                          }
                        </div>
                        `
                    }
                  </div>

                  ${landingPage.advancedConfig?.whatsAppChatButton?.enabled
                    ? `<button class="whatsapp-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                      </button>`
                    : ''}
                </body>
                </html>
              `}
            />
          </AnimatedPaper>
        </AnimatedBox>
      </Box>
      
      {/* Diálogo de QR Code */}
      <QRCodeDialog
        open={showQrCode}
        landingPage={landingPage}
        onClose={handleCloseQrCode}
      />
    </BaseModal>
  );
};

export default PreviewDialog;