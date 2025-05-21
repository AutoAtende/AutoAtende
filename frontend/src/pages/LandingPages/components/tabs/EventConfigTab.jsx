import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  Paper,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Event as EventIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  Title as TitleIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';

const AnimatedPaper = animated(Paper);
const AnimatedCard = animated(Card);

const EventConfigTab = ({ landingPage, setLandingPage }) => {
  const theme = useTheme();
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 300,
    config: { tension: 220, friction: 40 }
  });
  
  // Handler para alternar configuração de evento
  const handleToggleEvent = (e) => {
    const isEvent = e.target.checked;
    
    setLandingPage(prev => ({
      ...prev,
      eventConfig: {
        ...prev.eventConfig,
        isEvent
      }
    }));
  };
  
  // Handler para alteração do título do evento
  const handleEventTitleChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      eventConfig: {
        ...prev.eventConfig,
        eventTitle: e.target.value
      }
    }));
  };
  
  return (
<AnimatedPaper 
  elevation={0} 
  variant="outlined" 
  sx={{ 
    p: 3, 
    borderRadius: 2,
    height: '100%', // Usar altura total do container
    overflow: 'auto', // Habilitar scroll
    display: 'flex',
    flexDirection: 'column'
  }}
  style={fadeIn}
>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 3,
        color: 'primary.main',
        fontWeight: 600
      }}>
        <EventIcon sx={{ mr: 1 }} />
        Configurações de Evento
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={landingPage.eventConfig.isEvent}
                    onChange={handleToggleEvent}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="subtitle1">
                    {landingPage.eventConfig.isEvent
                      ? "Esta página é para um evento"
                      : "Esta página não é para um evento"}
                  </Typography>
                }
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                Marque esta opção se a landing page for para um evento específico. 
                Isso habilitará opções adicionais como data, hora e local.
              </Typography>
            </Box>
            
            <Chip 
              label={landingPage.eventConfig.isEvent ? "Evento" : "Página Padrão"}
              color={landingPage.eventConfig.isEvent ? "primary" : "default"}
              variant={landingPage.eventConfig.isEvent ? "filled" : "outlined"}
              icon={<EventNoteIcon />}
              sx={{ height: 36 }}
            />
          </Box>
        </Grid>
        
        {landingPage.eventConfig.isEvent && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Título do Evento"
                value={landingPage.eventConfig.eventTitle || ''}
                onChange={handleEventTitleChange}
                variant="outlined"
                placeholder="Ex: Workshop de Marketing Digital"
                helperText="Este é o nome principal do seu evento"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <AnimatedCard 
                variant="outlined" 
                sx={{ 
                  mt: 2, 
                  bgcolor: 'background.neutral',
                  borderRadius: 2
                }}
                style={cardAnimation}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <InfoIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>
                      Dicas para configuração de eventos
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    Para configurar detalhes completos do seu evento, recomendamos:
                  </Typography>
                  
                  <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 1 }}>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Incluir data e hora no conteúdo principal" 
                        secondary="Use o editor de conteúdo para adicionar detalhes da programação"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Adicionar o endereço e mapa no conteúdo" 
                        secondary="Você pode incorporar um mapa do Google usando o editor HTML"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <ClockIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Especificar cronograma detalhado" 
                        secondary="Liste as atividades e horários dentro do conteúdo principal"
                      />
                    </ListItem>
                  </List>
                  
                  <Alert 
                    severity="info" 
                    variant="outlined" 
                    sx={{ mt: 2, borderRadius: 1 }}
                  >
                    <Typography variant="body2">
                      Marcar como evento também habilitará metadados especiais que ajudam a 
                      promover seu evento em mecanismos de busca e redes sociais.
                    </Typography>
                  </Alert>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </>
        )}
      </Grid>
    </AnimatedPaper>
  );
};

export default EventConfigTab;