// src/pages/EmailDashboard/components/EmailDetail.jsx
import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Divider, 
  Paper, 
  Chip,
  IconButton,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import moment from 'moment';

// Ícones
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachmentIcon from '@mui/icons-material/Attachment';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CodeIcon from '@mui/icons-material/Code';

import { i18n } from "../../../translate/i18n";

// Styled components
const DetailHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const DetailSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(0.5),
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status) {
    case 'SENT':
      color = theme.palette.success.main;
      break;
    case 'ERROR':
      color = theme.palette.error.main;
      break;
    case 'PENDING':
      color = theme.palette.warning.main;
      break;
    default:
      color = theme.palette.info.main;
  }
  
  return {
    backgroundColor: `${color}20`,  // 20% opacity
    color: color,
    borderColor: color,
    '& .MuiChip-icon': {
      color: color
    }
  };
});

const MessageContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  whiteSpace: 'pre-line',
  overflow: 'auto',
  maxHeight: '300px',
}));

/**
 * Componente para exibir detalhes de um email selecionado
 */
const EmailDetail = ({ email = {}, onClose, isMobile }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Handler para mudança de tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Formatação de data
  const formatDate = (date) => {
    if (!date) return '-';
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
  };
  
  // Status icon mapping
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT': return <CheckCircleIcon fontSize="small" />;
      case 'ERROR': return <ErrorIcon fontSize="small" />;
      case 'PENDING': return <PendingIcon fontSize="small" />;
      default: return null;
    }
  };
  
  // Se email for undefined ou null, não renderiza nada
  if (!email) {
    return null;
  }
  
  return (
    <Box>
      <DetailHeader>
        <Typography>
          {i18n.t('email.emailDetails.title')}
        </Typography>
        
        <IconButton onClick={onClose} aria-label={i18n.t('email.ariaLabels.closeDetails')}>
          <CloseIcon />
        </IconButton>
      </DetailHeader>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          aria-label={i18n.t('email.ariaLabels.detailTabs')}
        >
          <Tab 
            icon={<FormatListBulletedIcon />} 
            label={isMobile ? "" : i18n.t('email.emailDetails.overview')} 
            aria-label={i18n.t('email.ariaLabels.overviewTab')}
          />
          <Tab 
            icon={<DocumentScannerIcon />} 
            label={isMobile ? "" : i18n.t('email.emailDetails.content')} 
            aria-label={i18n.t('email.ariaLabels.contentTab')}
          />
          <Tab 
            icon={<CodeIcon />} 
            label={isMobile ? "" : i18n.t('email.emailDetails.technical')} 
            aria-label={i18n.t('email.ariaLabels.technicalTab')}
          />
        </Tabs>
      </Box>
      
      {/* Visão geral */}
      {activeTab === 0 && (
        <Box>
          <DetailSection>
            <DetailLabel>{i18n.t('email.emailDetails.subject')}</DetailLabel>
            <Typography variant="h6" gutterBottom>
              {email.subject || i18n.t('email.noSubject')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <StatusChip
                label={i18n.t(`email.status.${email.status?.toLowerCase() || 'unknown'}`)}
                size="small"
                status={email.status}
                icon={getStatusIcon(email.status)}
                variant="outlined"
              />
              
              {email.hasAttachments && (
                <Chip
                  icon={<AttachmentIcon />}
                  label={i18n.t('email.emailDetails.hasAttachments')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              
              {email.scheduled && (
                <Chip
                  icon={<ScheduleIcon />}
                  label={i18n.t('email.emailDetails.scheduled')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </DetailSection>
          
          <DetailSection>
            <DetailLabel>{i18n.t('email.emailDetails.recipient')}</DetailLabel>
            <Typography variant="body1">{email.sender}</Typography>
          </DetailSection>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
            {email.sentAt && (
              <DetailSection>
                <DetailLabel>{i18n.t('email.emailDetails.sentAt')}</DetailLabel>
                <Typography variant="body1">{formatDate(email.sentAt)}</Typography>
              </DetailSection>
            )}
            
            {email.sendAt && (
              <DetailSection>
                <DetailLabel>{i18n.t('email.emailDetails.scheduledFor')}</DetailLabel>
                <Typography variant="body1">{formatDate(email.sendAt)}</Typography>
              </DetailSection>
            )}
            
            <DetailSection>
              <DetailLabel>{i18n.t('email.emailDetails.createdAt')}</DetailLabel>
              <Typography variant="body1">{formatDate(email.createdAt)}</Typography>
            </DetailSection>
            
            {email.error && (
              <DetailSection>
                <DetailLabel>{i18n.t('email.emailDetails.error')}</DetailLabel>
                <Typography variant="body1" color="error">{email.error}</Typography>
              </DetailSection>
            )}
          </Box>
        </Box>
      )}
      
      {/* Conteúdo */}
      {activeTab === 1 && (
        <Box>
          <DetailSection>
            <DetailLabel>{i18n.t('email.emailDetails.message')}</DetailLabel>
            <MessageContent>
              <Typography variant="body1">{email.message}</Typography>
            </MessageContent>
          </DetailSection>
          
        <Typography variant={isMobile ? "h6" : "h5"} component="h2">
          {email.hasAttachments && (
            <DetailSection>
              <DetailLabel>{i18n.t('email.emailDetails.attachments')}</DetailLabel>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('email.emailDetails.attachmentsPlaceholder')}
                </Typography>
              </Paper>
            </DetailSection>
          )}
          </Typography>
        </Box>
      )}
      
      {/* Informações técnicas */}
      {activeTab === 2 && (
        <Box>
          <DetailSection>
            <DetailLabel>{i18n.t('email.emailDetails.emailId')}</DetailLabel>
            <Typography variant="body1">{email.id}</Typography>
          </DetailSection>
          
          <DetailSection>
            <DetailLabel>{i18n.t('email.emailDetails.companyId')}</DetailLabel>
            <Typography variant="body1">{email.companyId}</Typography>
          </DetailSection>
          
          {email.messageId && (
            <DetailSection>
              <DetailLabel>{i18n.t('email.emailDetails.messageId')}</DetailLabel>
              <Typography variant="body1" 
                sx={{ 
                  wordBreak: 'break-all', 
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  bgcolor: theme => theme.palette.background.default,
                  p: 1,
                  borderRadius: 1
                }}
              >
                {email.messageId}
              </Typography>
            </DetailSection>
          )}
          
          <DetailSection>
            <DetailLabel>{i18n.t('email.emailDetails.updatedAt')}</DetailLabel>
            <Typography variant="body1">{formatDate(email.updatedAt)}</Typography>
          </DetailSection>
          
          <DetailSection>
            <DetailLabel>JSON</DetailLabel>
            <Box 
              component="pre" 
              sx={{ 
                bgcolor: theme => theme.palette.background.default,
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '200px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                border: theme => `1px solid ${theme.palette.divider}`
              }}
            >
              {JSON.stringify(email, null, 2)}
            </Box>
          </DetailSection>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          {i18n.t('email.buttons.close')}
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(EmailDetail);