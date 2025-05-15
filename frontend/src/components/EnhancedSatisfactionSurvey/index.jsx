import React, { useState, useEffect } from "react";
import { 
  Tooltip, 
  IconButton, 
  Badge, 
  Fade, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { useTheme } from "@mui/material/styles";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    color: "white",
    position: "relative",
    "&.pulse": {
      animation: `$pulseAnimation 1.5s infinite`
    }
  },
  badge: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText
  },
  pulseRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    animation: `$pulseRingAnimation 2s infinite`
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  dialogActions: {
    padding: theme.spacing(2),
  },
  "@keyframes pulseAnimation": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.1)",
    },
    "100%": {
      transform: "scale(1)",
    }
  },
  "@keyframes pulseRingAnimation": {
    "0%": {
      transform: "scale(0.8)",
      opacity: 0.8,
      border: "2px solid rgba(255, 171, 0, 0.8)",
    },
    "100%": {
      transform: "scale(1.5)",
      opacity: 0,
      border: "2px solid rgba(255, 171, 0, 0)",
    }
  }
}));

// Este é o componente que sobrescreve o SatisfactionSurvey original
const EnhancedSatisfactionSurvey = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [pendingSurveys, setPendingSurveys] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Importamos estes estados do componente SatisfactionSurvey original
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    
    // Verificar pesquisas pendentes
    const fetchPendingSurveys = async () => {
      try {
        // Verificar se o usuário já respondeu a pesquisa
        const { data: checkData } = await api.get('/satisfaction-survey/check');
        setHasSubmitted(checkData.hasSubmitted);
        
        if (checkData.hasSubmitted) {
          setPendingSurveys(0);
          return;
        }
        
        // Se não respondeu, considerar como uma pesquisa pendente
        setPendingSurveys(1);
        
        // Ativar efeito de pulso
        setPulseEffect(true);
        
        // Mostrar lembrete após tempo de inatividade
        const lastReminder = localStorage.getItem('lastSatisfactionReminder');
        const now = new Date().getTime();
        
        if (!lastReminder || (now - parseInt(lastReminder)) > 24 * 60 * 60 * 1000) { // 24 horas
          setTimeout(() => {
            // Só mostrar o lembrete se ainda não tiver respondido
            if (!hasSubmitted) {
              setShowReminder(true);
            }
          }, 60000); // Mostrar após 1 minuto de uso do sistema
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPendingSurveys();
    
    // Verificar periodicamente (a cada 30 minutos)
    const interval = setInterval(fetchPendingSurveys, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [hasSubmitted]);
  
  // Se não estiver no domínio correto ou já tiver respondido, não renderiza nada
  if (hasSubmitted) {
    return null;
  }
  
  const handleOpenSurvey = () => {
    setShowReminder(false);
    setPulseEffect(false);
    localStorage.setItem('lastSatisfactionReminder', new Date().getTime().toString());
    
    // Aqui está a correção principal: abrimos diretamente o modal da pesquisa
    setOpen(true);
  };
  
  const handleDismissReminder = () => {
    setShowReminder(false);
    localStorage.setItem('lastSatisfactionReminder', new Date().getTime().toString());
  };

  // Importamos os demais props do SatisfactionSurvey
  const handleClose = () => {
    setOpen(false);
  };

  // Aqui renderizamos tanto a nossa parte aprimorada quanto o SatisfactionSurvey original
  return (
    <>
      {/* Nossa versão melhorada do botão */}
      <Tooltip 
        title={pendingSurveys > 0 ? "Você tem uma pesquisa de satisfação pendente!" : "Pesquisa de Satisfação"}
        arrow
      >
        <IconButton 
          onClick={handleOpenSurvey} 
          className={`${classes.iconButton} ${pulseEffect ? 'pulse' : ''}`}
          size="large"
          data-testid="enhanced-satisfaction-survey-button"
        >
          {pulseEffect && <div className={classes.pulseRing} />}
          <Badge 
            badgeContent={pendingSurveys} 
            classes={{ badge: classes.badge }}
            invisible={pendingSurveys === 0}
          >
            <SentimentSatisfiedAltIcon style={{ color: "white" }} />
          </Badge>
        </IconButton>
      </Tooltip>
      
      {/* Dialog de lembrete */}
      <Dialog
        open={showReminder}
        onClose={handleDismissReminder}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
      >
        <DialogTitle>
          Sua opinião é importante!
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box display="flex" alignItems="center" mb={2}>
            <SentimentSatisfiedAltIcon fontSize="large" color="secondary" />
            <Typography variant="body1" style={{ marginLeft: 16 }}>
              Gostaríamos de saber sua opinião sobre o {theme.appName}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Suas respostas nos ajudam a melhorar continuamente nosso sistema. Isso levará apenas alguns minutos.
          </Typography>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleDismissReminder} color="primary">
            Lembrar mais tarde
          </Button>
          <Button 
            onClick={handleOpenSurvey} 
            variant="contained" 
            color="secondary" 
            autoFocus
          >
            Responder agora
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Aqui importamos o SatisfactionSurvey original, mas passando nosso estado "open" */}
      {open && (
        <OriginalSurveyWrapper 
          open={open} 
          onClose={handleClose} 
        />
      )}
    </>
  );
};

// Este componente é um wrapper que importa o SatisfactionSurvey original
const OriginalSurveyWrapper = ({ open, onClose }) => {
  // Importamos o SatisfactionSurvey dinamicamente para garantir que ele está disponível
  const SatisfactionSurvey = require('../SatisfactionSurvey').default;
  
  // Renderizamos o SatisfactionSurvey original com nossa variável "open"
  return <SatisfactionSurvey forceOpen={open} onCloseHandler={onClose} />;
};

export default EnhancedSatisfactionSurvey;