// src/pages/EmailDashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  CssBaseline, 
  Box, 
  Tabs, 
  Tab, 
  useTheme, 
  useMediaQuery, 
  Slide, 
  Fade,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { i18n } from "../../translate/i18n";
import { toast } from '../../helpers/toast';

// Importar o hook corretamente
import useEmailAPI from './hooks/useEmailAPI';

// Componentes
import EmailForm from './components/EmailForm';
import EmailList from './components/EmailList';
import EmailStats from './components/EmailStats';
import EmailDetail from './components/EmailDetail';
import LoadingSkeleton from './components/LoadingSkeleton';

// Estilos
const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100%', // Alterado de '100vw' para '100%'
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  overflowX: 'hidden', // Adicionado para garantir que não haja rolagem horizontal
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  maxWidth: '1200px',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  overflow: 'hidden', 
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const AnimatedTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiTab-root': {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// Componente principal
const EmailDashboard = () => {
  // Estados
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use o hook de email
  const { 
    sentEmails = [], 
    scheduledEmails = [], 
    loadEmails, 
    sendEmail, 
    scheduleEmail,
    cancelScheduledEmail,
    rescheduleMail,
    exportEmailsToPdf
  } = useEmailAPI({ setIsLoading });

  // Efeitos
  useEffect(() => {
    // Carregar emails inicialmente
    const fetchData = async () => {
      try {
        await loadEmails();
      } catch (error) {
        console.error("Erro ao carregar emails:", error);
        toast.error("Não foi possível carregar os emails. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Configurar atualização periódica
    const intervalId = setInterval(() => {
      fetchData();
    }, 120000);
    
    return () => clearInterval(intervalId);
  }, [loadEmails]);

  // Efeito para controlar a visualização do detalhe
  useEffect(() => {
    if (selectedEmail) {
      setShowDetail(true);
    }
  }, [selectedEmail]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleCloseEmail = () => {
    setShowDetail(false);
    setTimeout(() => {
      setSelectedEmail(null);
    }, 300); // Pequeno atraso para animação
  };

  // Handlers de formulário
  const handleSendEmail = async (values) => {
    try {
      if (activeTab === 0) {
        return await sendEmail(values);
      } else {
        return await scheduleEmail(values);
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Não foi possível enviar o email. Tente novamente mais tarde.");
      return false;
    }
  };

  // Handler para lidar com reagendamento
  const handleReschedule = (emailId) => {
    const email = scheduledEmails.find(e => e.id === emailId);
    if (email && rescheduleMail) {
      // Por ora, vamos apenas exibir um log
      console.log("Reagendando email:", emailId);
      // E um toast informativo
      toast.info("Funcionalidade de reagendamento ainda não implementada completamente.");
    }
  };

  // Renderização do conteúdo da tab atual
  const renderActiveTabContent = () => {
    if (isLoading && !sentEmails.length && !scheduledEmails.length) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (activeTab === 0) {
      return (
        <EmailForm 
          title={i18n.t('email.title.sendEmail')}
          variant="send"
          onSubmit={handleSendEmail}
          isLoading={isLoading}
          isMobile={isMobile}
        />
      );
    } else if (activeTab === 1) {
      return (
        <EmailForm 
          title={i18n.t('email.title.scheduleEmail')}
          variant="schedule"
          onSubmit={handleSendEmail}
          isLoading={isLoading}
          isMobile={isMobile}
        />
      );
    } else {
      return (
        <EmailStats 
          sentEmails={sentEmails || []}
          scheduledEmails={scheduledEmails || []}
          onViewEmail={handleOpenEmail}
          onRefresh={loadEmails}
          onExportPdf={exportEmailsToPdf}
          onCancelScheduled={cancelScheduledEmail}
          onReschedule={handleReschedule}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      );
    }
  };

  return (
    <StyledBox component="main" aria-label={i18n.t('email.ariaLabels.dashboard')}>
      <CssBaseline />
      
      <Box style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <StyledPaper 
          elevation={3} 
          aria-labelledby="email-dashboard-title"
        >
          <AnimatedTabs 
            value={activeTab} 
            onChange={handleTabChange} 
            centered 
            variant={isMobile ? "fullWidth" : "standard"}
            aria-label={i18n.t('email.ariaLabels.tabs')}
          >
            <Tab 
              icon={<SendIcon />} 
              label={isMobile ? "" : i18n.t('email.tabs.send')} 
              aria-label={i18n.t('email.ariaLabels.sendTab')}
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label={isMobile ? "" : i18n.t('email.tabs.schedule')} 
              aria-label={i18n.t('email.ariaLabels.scheduleTab')}
            />
            <Tab 
              icon={<ListAltIcon />} 
              label={isMobile ? "" : i18n.t('email.tabs.list')} 
              aria-label={i18n.t('email.ariaLabels.listTab')}
            />
          </AnimatedTabs>

          <Box mt={3} px={isMobile ? 1 : 2}>
            {renderActiveTabContent()}
          </Box>
        </StyledPaper>

        {/* Email detalhado */}
        {selectedEmail && (
          <Slide direction="up" in={showDetail} mountOnEnter unmountOnExit>
            <StyledPaper>
              <EmailDetail 
                email={selectedEmail} 
                onClose={handleCloseEmail} 
                isMobile={isMobile}
              />
            </StyledPaper>
          </Slide>
        )}
      </Box>
    </StyledBox>
  );
};

export default EmailDashboard;