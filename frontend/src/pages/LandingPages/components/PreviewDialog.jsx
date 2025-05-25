import React, { useState, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  IconButton,
  Grid,
  Alert,
  Button,
  useMediaQuery
} from '@mui/material';
import {
  Devices as DevicesIcon,
  PhoneAndroid as MobileIcon,
  Laptop as DesktopIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { AuthContext } from '../../../context/Auth/AuthContext';
import QRCodeDialog from '../../../components/QrCodeDialog';
import BaseModal from '../../../components/shared/BaseModal';

const AnimatedBox = animated(Box);
const AnimatedPaper = animated(Paper);

// Componente principal que será usado dentro do BaseModal
const PreviewContent = ({ landingPage, form }) => {
  const { user } = useContext(AuthContext);
  const [deviceView, setDeviceView] = useState('desktop');
  const [showQrCode, setShowQrCode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Animações
  const deviceAnimation = useSpring({
    opacity: 1,
    transform: deviceView === 'desktop' ? 'scale(1)' : 'scale(0.95)',
    config: { tension: 280, friction: 60 }
  });
  
  // Handler para mudança de visualização (mobile/desktop)
  const handleDeviceChange = (event, newValue) => {
    setDeviceView(newValue);
  };
  
  // Copiar URL da landing page
  const handleCopyUrl = () => {
    const url = `${window.location.origin}/l/${user.companyId}/${landingPage.slug}`;
    navigator.clipboard.writeText(url);
  };
  
  // Abrir diálogo de QR Code
  const handleOpenQrCode = () => {
    setShowQrCode(true);
  };
  
  // Fechar diálogo de QR Code
  const handleCloseQrCode = () => {
    setShowQrCode(false);
  };
  
  return (
    <Box>
      {/* Controles de Visualização */}
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
      
      {/* Ações Rápidas */}
      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CopyIcon />}
          onClick={handleCopyUrl}
          size="small"
        >
          Copiar URL
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<QrCodeIcon />}
          onClick={handleOpenQrCode}
          size="small"
        >
          Ver QR Code
        </Button>
      </Box>
      
      {/* Alerta Informativo */}
      <Alert 
        severity="info" 
        variant="outlined"
        sx={{ mb: 2, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body2">
          Esta é uma prévia da sua landing page. As interações como envio de formulário 
          não estão disponíveis no modo de pré-visualização.
        </Typography>
      </Alert>
      
      {/* Área de Preview */}
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
          {/* Iframe com Bootstrap para preview responsiva */}
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
                  ${generatePageContent(landingPage, form, deviceView)}
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
      
      {/* Diálogo de QR Code */}
      <QRCodeDialog
        open={showQrCode}
        landingPage={landingPage}
        onClose={handleCloseQrCode}
      />
    </Box>
  );
};

// Função para gerar o conteúdo da página
const generatePageContent = (landingPage, form, deviceView) => {
  const hasForm = landingPage.formConfig.showForm;
  const formPosition = landingPage.formConfig.position;
  
  const formHtml = hasForm ? `
    <div class="form-container">
      <h4>${landingPage.formConfig.title || 'Formulário'}</h4>
      <form>
        ${form.fields
          .sort((a, b) => a.order - b.order)
          .map(field => generateFieldHtml(field))
          .join('')}
        <button type="button" class="btn btn-primary w-100 mt-3" disabled>
          ${landingPage.formConfig.buttonText || 'Enviar'}
        </button>
      </form>
    </div>
  ` : '';
  
  const contentHtml = `
    <div class="content-container">
      ${landingPage.eventConfig.isEvent && landingPage.eventConfig.eventTitle 
        ? `<h2>${landingPage.eventConfig.eventTitle}</h2>` 
        : ''}
      ${landingPage.content || '<p>Conteúdo da sua landing page.</p>'}
    </div>
  `;
  
  if (deviceView === 'desktop' && hasForm && formPosition === 'left') {
    return `
      <div class="row">
        <div class="col-md-4">${formHtml}</div>
        <div class="col-md-8">${contentHtml}</div>
      </div>
    `;
  } else if (deviceView === 'desktop' && hasForm && formPosition === 'right') {
    return `
      <div class="row">
        <div class="col-md-8">${contentHtml}</div>
        <div class="col-md-4">${formHtml}</div>
      </div>
    `;
  } else if (hasForm && formPosition === 'center') {
    return `
      ${contentHtml}
      <div class="row justify-content-center mt-4">
        <div class="col-lg-6">${formHtml}</div>
      </div>
    `;
  } else {
    return contentHtml + (hasForm ? `<div class="mt-4">${formHtml}</div>` : '');
  }
};

// Função para gerar HTML dos campos do formulário
const generateFieldHtml = (field) => {
  const required = field.required ? 'required' : '';
  const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
  
  switch (field.type) {
    case 'select':
      return `
        <div class="mb-3">
          <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
          <select class="form-select" ${required} disabled>
            <option value="">${field.placeholder || 'Selecione uma opção'}</option>
            ${(field.options || []).map(option => 
              `<option value="${option}">${option}</option>`
            ).join('')}
          </select>
        </div>
      `;
    case 'date':
      return `
        <div class="mb-3">
          <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
          <input type="date" class="form-control" ${required} ${placeholder} disabled>
        </div>
      `;
    case 'email':
      return `
        <div class="mb-3">
          <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
          <input type="email" class="form-control" ${required} ${placeholder} disabled>
        </div>
      `;
    case 'phone':
      return `
        <div class="mb-3">
          <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
          <input type="tel" class="form-control" ${required} placeholder="+55 XX XXXXX-XXXX" disabled>
        </div>
      `;
    case 'checkbox':
      return `
        <div class="mb-3">
          <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
          ${(field.options || []).map(option => `
            <div class="form-check">
              <input class="form-check-input" type="checkbox" disabled>
              <label class="form-check-label">${option}</label>
            </div>
          `).join('')}
        </div>
      `;
    case 'radio':
      return `
        <div class="mb-3">
          <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
          ${(field.options || []).map(option => `
            <div class="form-check">
              <input class="form-check-input" type="radio" name="${field.id}" disabled>
              <label class="form-check-label">${option}</label>
            </div>
          `).join('')}
        </div>
      `;
    default:
      return `
        <div class="mb-3">
          <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
          <input type="text" class="form-control" ${required} ${placeholder} disabled>
        </div>
      `;
  }
};

// Componente wrapper para compatibilidade (quando usado como modal separado)
const PreviewDialog = ({ open, onClose, landingPage, form }) => {
  if (!open) return null;
  
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Pré-visualização: ${landingPage.title || 'Landing Page'}`}
      maxWidth="lg"
      actions={[
        {
          label: "Fechar",
          onClick: onClose,
          variant: "contained",
          color: "primary"
        }
      ]}
    >
      <PreviewContent landingPage={landingPage} form={form} />
    </BaseModal>
  );
};

// Exportar tanto o conteúdo quanto o dialog completo
export { PreviewContent };
export default PreviewDialog;