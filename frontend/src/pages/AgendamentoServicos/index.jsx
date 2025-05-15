import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Container, 
  Typography,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import {
  People as PeopleIcon,
  Spa as SpaIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

// Importação dos componentes de cada aba
import Profissionais from './Profissionais';
import Servicos from './Servicos';
import Agendamentos from './Agendamentos';
import Disponibilidades from './Disponibilidades';
import Configuracoes from './Configuracoes';
import GuiaModal from './components/GuiaModal'; // Novo componente de guia

// Componente principal com animação
const AnimatedContainer = animated(Container);

// Tabs estilizada para manter consistência visual
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
  marginBottom: theme.spacing(2),
  '& .MuiTab-root': {
    textTransform: 'none',
    minHeight: 60,
    fontWeight: 500,
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
    '&:focus': {
      outline: 'none',
    },
    // Aumenta área de toque em dispositivos móveis
    [theme.breakpoints.down('sm')]: {
      minWidth: 64,
      minHeight: 48
    }
  },
}));

// Paper estilizado para o conteúdo principal
const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  boxShadow: 'rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px'
}));

// Estrutura de dados para configuração das abas
const TABS = [
  { value: 0, label: 'Profissionais', icon: <PeopleIcon />, component: Profissionais },
  { value: 1, label: 'Serviços', icon: <SpaIcon />, component: Servicos },
  { value: 2, label: 'Agendamentos', icon: <EventIcon />, component: Agendamentos },
  { value: 3, label: 'Disponibilidades', icon: <AccessTimeIcon />, component: Disponibilidades },
  { value: 4, label: 'Configurações', icon: <SettingsIcon />, component: Configuracoes }
];

const AgendamentoServicos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [guiaModalOpen, setGuiaModalOpen] = useState(false); // Novo state para o modal de guia

  // Animações com react-spring
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Recupera a última aba selecionada do localStorage, se disponível
  useEffect(() => {
    const savedTabStr = localStorage.getItem('autoAtende_agendamentoTab');
    if (savedTabStr) {
      const savedTab = parseInt(savedTabStr, 10);
      if (!isNaN(savedTab) && savedTab >= 0 && savedTab < TABS.length) {
        setTabValue(savedTab);
      }
    }
    
    // Simulação de carregamento para efeito visual
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Salva a preferência de aba no localStorage
    localStorage.setItem('autoAtende_agendamentoTab', newValue.toString());
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const ActiveComponent = TABS[tabValue].component;

  return (
    <AnimatedContainer maxWidth="xl" style={fadeIn} sx={{ mt: 4, mb: 4 }}>
      <MainPaper elevation={2}>
        {loading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <LinearProgress color="primary" />
          </Box>
        )}
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <Tooltip title="Voltar" arrow placement="bottom">
                <IconButton 
                  onClick={handleGoBack}
                  aria-label="Voltar para a página anterior"
                  size="small"
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            )}
            <EventIcon color="primary" />
            <Typography 
              variant="h5" 
              component="h1"
              color="primary.main"
              fontWeight={500}
            >
              Sistema de Agendamento
            </Typography>
          </Box>
          
          {/* Botão de ajuda */}
          <Tooltip title="Guia de ajuda" arrow placement="bottom">
            <IconButton
              onClick={() => setGuiaModalOpen(true)}
              aria-label="Abrir guia de ajuda"
              color="primary"
              sx={{ 
                border: '1px solid',
                borderColor: 'primary.light',
                borderRadius: 2
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          aria-label="abas do sistema de agendamento"
          indicatorColor="primary"
        >
          {TABS.map((tab) => (
            <Tab 
              key={tab.value}
              icon={tab.icon} 
              label={isMobile ? undefined : tab.label} 
              iconPosition="start"
              aria-label={tab.label}
            />
          ))}
        </StyledTabs>
        
        <Box sx={{ pt: 2 }}>
          <ActiveComponent />
        </Box>
      </MainPaper>
      
      {/* Modal de Guia */}
      <GuiaModal
        open={guiaModalOpen}
        onClose={() => setGuiaModalOpen(false)}
      />
    </AnimatedContainer>
  );
};

export default AgendamentoServicos;