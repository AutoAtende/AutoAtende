import React from 'react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import {
  People as PeopleIcon,
  Spa as SpaIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  BookmarkBorder as BookmarkIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  ColorLens as ColorLensIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleCheckIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  HourglassTop as HourglassTopIcon,
  EventBusy as EventBusyIcon
} from '@mui/icons-material';

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const GuiaModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = React.useState(0);

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          height: isMobile ? '90vh' : 'auto'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon color="primary" />
          <Typography variant="h6">Guia do Sistema de Agendamento</Typography>
        </Box>
        <IconButton edge="end" onClick={onClose} aria-label="fechar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%' }}>
          {/* Navegação lateral ou superior */}
          <Box sx={{ 
            width: isMobile ? '100%' : 240, 
            borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
            borderBottom: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
          }}>
            <Tabs
              orientation={isMobile ? "horizontal" : "vertical"}
              variant={isMobile ? "scrollable" : "standard"}
              value={tabValue}
              onChange={handleTabChange}
              aria-label="guia de abas"
              sx={{ 
                borderRight: 0,
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  py: 2
                }
              }}
            >
              <Tab icon={<EventIcon />} label="Visão Geral" iconPosition="start" />
              <Tab icon={<PeopleIcon />} label="Profissionais" iconPosition="start" />
              <Tab icon={<SpaIcon />} label="Serviços" iconPosition="start" />
              <Tab icon={<EventIcon />} label="Agendamentos" iconPosition="start" />
              <Tab icon={<AccessTimeIcon />} label="Disponibilidades" iconPosition="start" />
              <Tab icon={<SettingsIcon />} label="Configurações" iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Conteúdo principal */}
          <Box sx={{ 
            flexGrow: 1, 
            p: 3, 
            height: isMobile ? 'calc(90vh - 170px)' : '65vh', 
            overflowY: 'auto' 
          }}>
            <AnimatedBox style={fadeIn}>
              {/* Visão Geral */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Bem-vindo ao Sistema de Agendamento
                  </Typography>
                  
                  <Typography paragraph>
                    O Sistema de Agendamento é uma solução completa para gerenciar todos os aspectos relacionados a
                    agendamentos de serviços. Com ele, você pode cadastrar profissionais, serviços, definir disponibilidades,
                    marcar agendamentos e configurar notificações automáticas para seus clientes.
                  </Typography>
                  
                  <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'primary.lighter' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Principais funcionalidades:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Cadastro de profissionais e seus serviços disponíveis" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Gerenciamento de serviços com preços, durações e cores personalizadas" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Configuração de disponibilidades por profissional e dia da semana" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Agendamentos com seleção inteligente de horários disponíveis" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Envio automático de lembretes e confirmações via WhatsApp" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Personalização de mensagens automáticas para cada etapa do processo" />
                      </ListItem>
                    </List>
                  </Paper>
                  
                  <Typography variant="h6" gutterBottom>
                    Navegação pelo Sistema
                  </Typography>
                  
                  <Typography paragraph>
                    O sistema é dividido em cinco abas principais, cada uma com funções específicas:
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PeopleIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Profissionais</Typography>
                        </Box>
                        <Typography variant="body2">
                          Cadastre e gerencie os profissionais que prestam serviços, vinculando-os aos tipos de serviços que oferecem.
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SpaIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Serviços</Typography>
                        </Box>
                        <Typography variant="body2">
                          Configure os serviços oferecidos, com informações como duração, preço e cor para identificação visual.
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EventIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Agendamentos</Typography>
                        </Box>
                        <Typography variant="body2">
                          Visualize, crie e gerencie todos os agendamentos, com filtros por data, status e profissional.
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Disponibilidades</Typography>
                        </Box>
                        <Typography variant="body2">
                          Defina os horários e dias da semana em que cada profissional está disponível para agendamentos.
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SettingsIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Configurações</Typography>
                        </Box>
                        <Typography variant="body2">
                          Personalize as configurações gerais do sistema, como antecedência mínima, mensagens automáticas e lembretes.
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Dicas de uso:
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <BookmarkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Comece configurando profissionais e serviços antes de criar disponibilidades" 
                        secondary="Para um funcionamento adequado, primeiro cadastre todos os profissionais e serviços necessários"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BookmarkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Verifique as disponibilidades de cada profissional" 
                        secondary="Configure adequadamente os horários disponíveis para cada profissional por dia da semana"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BookmarkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Personalize as mensagens automáticas" 
                        secondary="Crie mensagens claras e completas para boas-vindas, confirmação e lembretes"
                      />
                    </ListItem>
                  </List>
                </Box>
              )}
              
              {/* Profissionais */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Gerenciamento de Profissionais
                  </Typography>
                  
                  <Typography paragraph>
                    Esta seção permite gerenciar os profissionais que realizam os serviços disponíveis. Você pode cadastrar, editar e visualizar 
                    todos os profissionais, definindo suas informações pessoais e vinculando-os aos serviços que oferecem.
                  </Typography>
                  
                  <Accordion defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AddIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Adicionar/Editar Profissional</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        O formulário de profissionais permite cadastrar todas as informações necessárias:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Foto de perfil" 
                            secondary="Carregue uma foto do profissional para facilitar a identificação visual"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Informações pessoais" 
                            secondary="Nome, e-mail e telefone para contato"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Descrição" 
                            secondary="Uma breve descrição sobre o profissional, sua especialidade ou experiência"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Serviços oferecidos" 
                            secondary="Selecione quais serviços este profissional está habilitado a realizar"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Status" 
                            secondary="Defina se o profissional está ativo ou inativo no sistema"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <HelpIcon color="info" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Dica:</strong> Quando um profissional é marcado como inativo, ele não será exibido nas 
                          opções de agendamento, mas seus dados e histórico de agendamentos são preservados.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SearchIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Pesquisa e Filtragem</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        Para encontrar profissionais facilmente:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Barra de pesquisa" 
                            secondary="Busque por nome, e-mail ou telefone"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Filtro de status" 
                            secondary="Filtre por profissionais ativos ou inativos"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Paginação" 
                            secondary="Navegue entre páginas de resultados quando houver muitos profissionais cadastrados"
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Exclusão de Profissionais</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        Ao excluir um profissional, todas as suas disponibilidades também são removidas. No entanto, agendamentos 
                        passados são mantidos para fins de histórico.
                      </Typography>
                      
                      <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 2 }}>
                        <Typography variant="body2" color="error.dark">
                          <strong>Atenção:</strong> Antes de excluir um profissional, verifique se ele possui agendamentos futuros.
                          Considere marcar o profissional como inativo em vez de excluí-lo para manter a referência histórica.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
              
              {/* Serviços */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Gerenciamento de Serviços
                  </Typography>
                  
                  <Typography paragraph>
                    Nesta seção, você pode cadastrar e gerenciar todos os serviços oferecidos pelos profissionais. Cada serviço possui 
                    características específicas como duração, preço e cor para identificação visual.
                  </Typography>
                  
                  <Accordion defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AddIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Adicionar/Editar Serviço</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        O formulário de serviços permite configurar:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Nome do serviço" 
                            secondary="Identificação clara do serviço oferecido"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Descrição" 
                            secondary="Detalhes do que está incluso no serviço"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Duração" 
                            secondary="Tempo necessário para realizar o serviço (em minutos)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Preço" 
                            secondary="Valor cobrado pelo serviço"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Cor" 
                            secondary="Cor para identificação visual do serviço no sistema"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Status" 
                            secondary="Defina se o serviço está ativo ou inativo"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Importante:</strong> A duração do serviço é utilizada para calcular os slots disponíveis para agendamento,
                          garantindo que não haja sobreposição entre agendamentos.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ColorLensIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Cores e Identificação Visual</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        As cores dos serviços são utilizadas em várias partes do sistema para facilitar a identificação visual:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Agendamentos" 
                            secondary="A cor do serviço é exibida nos cards de agendamento para identificação rápida"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Listas de seleção" 
                            secondary="Nas listas de seleção de serviços, cada item é exibido com sua cor correspondente"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Dica:</strong> Utilize cores distintas para diferentes categorias de serviços,
                          facilitando a visualização na agenda.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Gerenciamento de Serviços</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        Ao gerenciar seus serviços, considere as seguintes dicas:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Associe serviços a profissionais" 
                            secondary="Um serviço pode ser oferecido por múltiplos profissionais"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mantenha a duração precisa" 
                            secondary="A duração do serviço determina como os horários são alocados na agenda"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Cuidado ao excluir serviços" 
                            secondary="Ao excluir um serviço, todos os agendamentos relacionados a ele ficarão sem referência"
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
              
              {/* Agendamentos */}
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Gerenciamento de Agendamentos
                  </Typography>
                  
                  <Typography paragraph>
                    A seção de agendamentos é o coração do sistema, permitindo visualizar, criar e gerenciar todos os agendamentos 
                    de serviços. Os agendamentos são organizados por data e horário, facilitando o controle da agenda.
                  </Typography>
                  
                  <Accordion defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AddIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Criar/Editar Agendamento</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        O modal de agendamento permite configurar todos os detalhes:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Cliente" 
                            secondary="Selecione o cliente para o qual será feito o agendamento"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Serviço" 
                            secondary="Escolha o serviço a ser realizado"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Profissional" 
                            secondary="Selecione o profissional que realizará o serviço"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Data e horário" 
                            secondary="Escolha a data e o horário do agendamento"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Conexão WhatsApp" 
                            secondary="Selecione qual número de WhatsApp será usado para enviar as notificações"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Status" 
                            secondary="Defina o status do agendamento (pendente, confirmado, concluído, cancelado, não compareceu)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Observações" 
                            secondary="Adicione informações adicionais importantes sobre o agendamento"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Importante:</strong> Ao selecionar um serviço e um profissional, o sistema mostrará
                          automaticamente os horários disponíveis com base nas configurações de disponibilidade
                          do profissional e na duração do serviço selecionado, evitando sobreposições de horários.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FilterListIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Filtros e Visualização</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        A tela de agendamentos oferece várias opções de filtro e visualização:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Filtro por data" 
                            secondary="Selecione a data específica para visualizar os agendamentos"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Filtro por status" 
                            secondary="Visualize apenas agendamentos com determinado status (pendentes, confirmados, concluídos, etc.)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Busca por cliente" 
                            secondary="Localize agendamentos pelo nome do cliente ou telefone"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Organização por horário" 
                            secondary="Os agendamentos são agrupados por horário para facilitar a visualização da agenda"
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Gerenciamento de Status</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        Cada agendamento possui um status que indica seu estado atual:
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <HourglassTopIcon sx={{ color: '#FFC107', mr: 1 }} />
                            <Typography variant="body2" fontWeight="bold">Pendente</Typography>
                          </Box>
                          <Typography variant="body2">
                            Agendamento criado mas ainda não confirmado pelo cliente ou pela empresa.
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                            <Typography variant="body2" fontWeight="bold">Confirmado</Typography>
                          </Box>
                          <Typography variant="body2">
                            Agendamento foi confirmado e está pronto para ser realizado na data e horário programados.
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircleIcon sx={{ color: '#2196F3', mr: 1 }} />
                            <Typography variant="body2" fontWeight="bold">Concluído</Typography>
                          </Box>
                          <Typography variant="body2">
                            Serviço foi realizado com sucesso na data agendada.
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CancelIcon sx={{ color: '#F44336', mr: 1 }} />
                            <Typography variant="body2" fontWeight="bold">Cancelado</Typography>
                          </Box>
                          <Typography variant="body2">
                            Agendamento foi cancelado pelo cliente ou pela empresa. É necessário informar o motivo do cancelamento.
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EventBusyIcon sx={{ color: '#9E9E9E', mr: 1 }} />
                            <Typography variant="body2" fontWeight="bold">Não Compareceu</Typography>
                          </Box>
                          <Typography variant="body2">
                            O cliente não compareceu no horário agendado para o serviço.
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Typography paragraph>
                        Você pode alterar o status de um agendamento através do menu de opções de cada card,
                        clicando no ícone de três pontos verticais.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Notificações Automáticas</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        O sistema envia notificações automáticas via WhatsApp em diferentes momentos:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Confirmação" 
                            secondary="Enviada imediatamente após a criação do agendamento, solicitando confirmação"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Lembrete" 
                            secondary="Enviada algumas horas antes do agendamento (configurável nas configurações)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Cancelamento" 
                            secondary="Enviada quando um agendamento é cancelado, informando o motivo"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Observação:</strong> Para que as notificações sejam enviadas corretamente, 
                          é necessário configurar pelo menos uma conexão com o WhatsApp ativa. Verifique se 
                          a conexão está online antes de criar agendamentos.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
              
              {/* Disponibilidades */}
              {tabValue === 4 && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Gerenciamento de Disponibilidades
                  </Typography>
                  
                  <Typography paragraph>
                    A seção de disponibilidades permite configurar os horários em que cada profissional está disponível para agendamentos,
                    organizados por dia da semana. Esta configuração é fundamental para que o sistema calcule corretamente os horários 
                    disponíveis na criação de agendamentos.
                  </Typography>
                  
                  <Accordion defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Configurar Disponibilidade</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        O formulário de disponibilidade permite configurar:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Dia da semana" 
                            secondary="Selecione o dia da semana para configurar a disponibilidade (segunda a domingo)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Horário inicial e final" 
                            secondary="Defina o período total do dia em que o profissional atende"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Horário de almoço/pausa" 
                            secondary="Configure um intervalo durante o dia em que o profissional não estará disponível (opcional)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Duração dos slots" 
                            secondary="Defina o tamanho de cada intervalo de agendamento (ex: 30 min, 60 min)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Status" 
                            secondary="Ative ou desative temporariamente esta configuração de disponibilidade"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Importante:</strong> A duração dos slots define o intervalo mínimo para agendamentos.
                          Por exemplo, se configurado para 30 minutos, os horários disponíveis serão 8:00, 8:30, 9:00, etc.
                          Serviços com duração maior ocuparão múltiplos slots consecutivos.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Seleção de Profissionais</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        Na parte superior da tela, você pode navegar entre os diferentes profissionais para configurar 
                        suas disponibilidades individuais:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Selecione o profissional" 
                            secondary="Clique na aba com o nome do profissional para visualizar e configurar suas disponibilidades"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Pesquisa de profissionais" 
                            secondary="Utilize a barra de pesquisa para encontrar rapidamente um profissional específico"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 2 }}>
                        <Typography variant="body2" color="warning.dark">
                          <strong>Observação:</strong> Para que um profissional possa ser agendado, é necessário configurar
                          pelo menos uma disponibilidade para ele. Caso contrário, não aparecerão horários disponíveis no modal
                          de agendamento.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Organização por Dias da Semana</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        As disponibilidades são organizadas por dia da semana, facilitando a visualização completa da agenda semanal:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Cartões por dia" 
                            secondary="Cada dia da semana tem seu próprio cartão, onde você pode adicionar múltiplas disponibilidades"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Múltiplos horários por dia" 
                            secondary="Um profissional pode ter vários períodos de disponibilidade em um mesmo dia (ex: manhã e tarde)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Acesso rápido" 
                            secondary="Botões de adição em cada cartão permitem criar rapidamente novas disponibilidades para aquele dia"
                          />
                        </ListItem>
                      </List>
                      
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Para cada disponibilidade configurada, você pode ver claramente os horários de início e fim, intervalo 
                        de almoço/pausa (se configurado) e o tamanho dos slots de agendamento.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Exemplo prático:
                    </Typography>
                    <Typography variant="body2">
                      Para um profissional que atende:
                      <ul style={{ marginTop: 8, marginBottom: 8 }}>
                        <li>De segunda a sexta, das 8:00 às 18:00</li>
                        <li>Com intervalo para almoço das 12:00 às 13:00</li>
                        <li>Em slots de 30 minutos</li>
                      </ul>
                      Você deverá criar 5 disponibilidades (uma para cada dia da semana de segunda a sexta),
                      cada uma com os mesmos horários e configurações. Isso permitirá que os clientes agendem 
                      em qualquer horário entre 8:00 e 18:00, exceto no período de almoço.
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Configurações */}
              {tabValue === 5 && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Configurações do Sistema de Agendamento
                  </Typography>
                  
                  <Typography paragraph>
                    Na seção de configurações, você pode personalizar o comportamento geral do sistema de agendamento, incluindo
                    regras para marcação de horários e mensagens automáticas enviadas aos clientes.
                  </Typography>
                  
                  <Accordion defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SettingsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Configurações Gerais</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        Nesta seção você pode definir:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Habilitar/desabilitar sistema de agendamento" 
                            secondary="Ative ou desative globalmente o sistema de agendamento via WhatsApp"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Antecedência mínima" 
                            secondary="Defina quantas horas antes o cliente precisa agendar (ex: 24 horas)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Máximo de dias futuros" 
                            secondary="Determine até quantos dias no futuro os clientes podem agendar (ex: 30 dias)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Horas para lembrete" 
                            secondary="Configure quanto tempo antes do agendamento o cliente receberá um lembrete"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Dica:</strong> A antecedência mínima é útil para evitar agendamentos de última hora,
                          que podem ser difíceis de gerenciar. Recomenda-se pelo menos 1-2 horas de antecedência.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Mensagens Automáticas</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        Personalize as mensagens automáticas enviadas aos clientes em diferentes situações:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mensagem de boas-vindas" 
                            secondary="Enviada quando o cliente inicia uma conversa com o WhatsApp para agendamento"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mensagem de confirmação" 
                            secondary="Enviada após a criação de um novo agendamento, solicitando confirmação"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mensagem de lembrete" 
                            secondary="Enviada algumas horas antes do horário agendado (conforme configuração)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mensagem de cancelamento" 
                            secondary="Enviada quando um agendamento é cancelado"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mensagem de horários indisponíveis" 
                            secondary="Enviada quando não há horários disponíveis na data selecionada"
                          />
                        </ListItem>
                      </List>
                      
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Variáveis disponíveis nas mensagens:
                      </Typography>
                      
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={4} md={3}>
                          <Chip label="{name}" size="small" variant="outlined" />
                          <Typography variant="caption" display="block">
                            Nome do cliente
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Chip label="{service}" size="small" variant="outlined" />
                          <Typography variant="caption" display="block">
                            Nome do serviço
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Chip label="{professional}" size="small" variant="outlined" />
                          <Typography variant="caption" display="block">
                            Nome do profissional
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Chip label="{date}" size="small" variant="outlined" />
                          <Typography variant="caption" display="block">
                            Data do agendamento
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Chip label="{time}" size="small" variant="outlined" />
                          <Typography variant="caption" display="block">
                            Horário do agendamento
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Dica para mensagens eficientes:</strong> Mantenha suas mensagens claras e completas.
                          Utilize as variáveis para personalizar o conteúdo automaticamente com os dados específicos de cada agendamento.
                          Sempre inclua informações essenciais como data, horário, serviço e instruções para confirmação ou cancelamento.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <TimerIcon sx={{ mr: 1 }} />
                      Processo de Lembretes Automáticos
                    </Typography>
                    <Typography variant="body2">
                      O sistema de lembretes automáticos funciona da seguinte forma:
                      <ol style={{ marginTop: 8, marginBottom: 8 }}>
                        <li>Um processo verifica periodicamente os agendamentos próximos</li>
                        <li>Quando um agendamento está dentro do período configurado para lembretes (ex: 24 horas antes), o sistema envia automaticamente uma mensagem via WhatsApp</li>
                        <li>A mensagem utiliza o template configurado e substitui as variáveis pelos dados reais do agendamento</li>
                        <li>Os lembretes são enviados apenas para agendamentos com status "Confirmado"</li>
                      </ol>
                      Para que este processo funcione corretamente, é necessário que haja pelo menos uma conexão WhatsApp ativa configurada no sistema.
                    </Typography>
                  </Box>
                </Box>
              )}
            </AnimatedBox>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Entendi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

GuiaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default GuiaModal;