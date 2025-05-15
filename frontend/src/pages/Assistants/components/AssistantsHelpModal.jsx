import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Paper,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useMediaQuery,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { i18n } from '../../../translate/i18n';

// Ícones
import {
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  Add as AddIcon,
  CloudDownload as CloudDownloadIcon,
  Code as CodeIcon,
  Search as SearchIcon,
  Functions as FunctionsIcon,
  Extension as ExtensionIcon,
  Key as KeyIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Label as LabelIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Edit as EditIcon,
  InsertDriveFile as InsertDriveFileIcon,
  BugReport as BugReportIcon,
  TouchApp as TouchAppIcon,
  CheckBox as CheckBoxIcon,
  PermIdentity as PermIdentityIcon,
  IntegrationInstructions as IntegrationInstructionsIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Bolt as BoltIcon,
  Engineering as EngineeringIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  LocationOn as LocationOnIcon,
  ContactPhone as ContactPhoneIcon,
  Audiotrack as AudiotrackIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon
} from '@mui/icons-material';

// Componente para a área de conteúdo das abas
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assistants-help-tabpanel-${index}`}
      aria-labelledby={`assistants-help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AssistantsHelpModal = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);

  // Informações de cada modelo
  const modelInfo = {
    gpt4: {
      title: 'GPT-4o / GPT-4',
      description: i18n.t('assistants.help.introduction.models.gpt4'),
      icon: <SchoolIcon />,
      color: theme.palette.primary.main,
      capabilities: [
        i18n.t('assistants.help.introduction.models.capabilities.contextual'),
        i18n.t('assistants.help.introduction.models.capabilities.reasoning'),
        i18n.t('assistants.help.introduction.models.capabilities.code'),
        i18n.t('assistants.help.introduction.models.capabilities.analysis')
      ]
    },
    gpt4turbo: {
      title: 'GPT-4 Turbo',
      description: i18n.t('assistants.help.introduction.models.gpt4turbo'),
      icon: <BoltIcon />,
      color: theme.palette.info.main,
      capabilities: [
        i18n.t('assistants.help.introduction.models.capabilities.speed'),
        i18n.t('assistants.help.introduction.models.capabilities.knowledge'),
        i18n.t('assistants.help.introduction.models.capabilities.costBenefit'),
        i18n.t('assistants.help.introduction.models.capabilities.versatile')
      ]
    },
    gpt35: {
      title: 'GPT-3.5 Turbo',
      description: i18n.t('assistants.help.introduction.models.gpt35'),
      icon: <BoltIcon />,
      color: theme.palette.success.main,
      capabilities: [
        i18n.t('assistants.help.introduction.models.capabilities.maxSpeed'),
        i18n.t('assistants.help.introduction.models.capabilities.lowCost'),
        i18n.t('assistants.help.introduction.models.capabilities.simpleTasks'),
        i18n.t('assistants.help.introduction.models.capabilities.highScale')
      ]
    }
  };

  // Informações sobre ferramentas
  const toolsInfo = {
    fileSearch: {
      title: i18n.t('assistants.help.tools.fileSearch.title'),
      description: i18n.t('assistants.help.tools.fileSearch.description'),
      icon: <SearchIcon />,
      color: theme.palette.primary.main,
      capabilities: [
        i18n.t('assistants.help.tools.fileSearch.capabilities.retrieveInfo'),
        i18n.t('assistants.help.tools.fileSearch.capabilities.answerQuestions'),
        i18n.t('assistants.help.tools.fileSearch.capabilities.summarize')
      ],
      formats: '.txt, .pdf, .docx, .csv, .json, .md'
    },
    codeInterpreter: {
      title: i18n.t('assistants.help.tools.codeInterpreter.title'),
      description: i18n.t('assistants.help.tools.codeInterpreter.description'),
      icon: <CodeIcon />,
      color: theme.palette.secondary.main,
      capabilities: [
        i18n.t('assistants.help.tools.codeInterpreter.capabilities.executeCode'),
        i18n.t('assistants.help.tools.codeInterpreter.capabilities.dataAnalysis'),
        i18n.t('assistants.help.tools.codeInterpreter.capabilities.visualizations')
      ],
      formats: '.csv, .xls, .xlsx, .json, .txt, .pdf, .png, .jpg'
    },
    functions: {
      title: i18n.t('assistants.help.tools.functions.title'),
      description: i18n.t('assistants.help.tools.functions.description'),
      icon: <FunctionsIcon />,
      color: theme.palette.warning.main,
      capabilities: [
        i18n.t('assistants.help.tools.functions.capabilities.integration'),
        i18n.t('assistants.help.tools.functions.capabilities.realTime'),
        i18n.t('assistants.help.tools.functions.capabilities.actions')
      ]
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Renderiza uma seção de capacidades
  const renderCapabilities = (items) => (
    <List dense disablePadding>
      {items.map((item, index) => (
        <ListItem key={index}>
          <ListItemIcon sx={{ minWidth: '36px', color: theme.palette.primary.main }}>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );

  // Renderiza um cartão para ferramentas e modelos
  const renderInfoCard = (info, extraContent = null) => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2]
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: alpha(info.color, 0.1),
            color: info.color
          }}
        >
          {info.icon}
        </Avatar>
        <Typography variant="h6">{info.title}</Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        {info.description}
      </Typography>
      
      {info.capabilities && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            {i18n.t('assistants.help.common.capabilities')}:
          </Typography>
          {renderCapabilities(info.capabilities)}
        </>
      )}
      
      {info.formats && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 1, 
            borderRadius: 1,
            bgcolor: alpha(theme.palette.info.main, 0.05)
          }}
        >
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <InfoIcon fontSize="small" color="info" />
            {i18n.t('assistants.help.common.supportedFormats')}: <strong>{info.formats}</strong>
          </Typography>
        </Box>
      )}
      
      {extraContent}
    </Paper>
  );

  // Renderiza um passo numerado
  const renderStep = (number, title, description, extraContent = null) => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2.5, 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          {number}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          
          {extraContent}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpOutlineIcon />
          <Typography variant="h6">
            {i18n.t('assistants.help.title')}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            {i18n.t('assistants.help.introduction.description')}
          </Typography>
        </Box>

        {/* Tabs para as principais seções */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="assistant tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={i18n.t('assistants.help.tabs.introduction')} 
              id="tab-0"
              aria-controls="tabpanel-0"
              icon={<InfoIcon />}
              iconPosition="start"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label={i18n.t('assistants.help.tabs.creation')} 
              id="tab-1"
              aria-controls="tabpanel-1"
              icon={<AddIcon />}
              iconPosition="start"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label={i18n.t('assistants.help.tabs.tools')} 
              id="tab-2"
              aria-controls="tabpanel-2"
              icon={<ExtensionIcon />}
              iconPosition="start"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label={i18n.t('assistants.help.tabs.import')} 
              id="tab-3"
              aria-controls="tabpanel-3"
              icon={<CloudDownloadIcon />}
              iconPosition="start"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label={i18n.t('assistants.help.tabs.messageTypes')} 
              id="tab-4"
              aria-controls="tabpanel-4"
              icon={<ChatBubbleOutlineIcon />}
              iconPosition="start"
              sx={{ fontWeight: 'bold' }}
            />
          </Tabs>
        </Box>

        {/* Conteúdo das Tabs */}
        <Box sx={{ px: 3 }}>
          {/* Tab 1: Introdução */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PsychologyIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.introduction.whatAre.title')}
                </Typography>
              </Box>

              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 2,
                background: `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                border: `1px solid ${theme.palette.primary.light}`
              }}>
                <Typography variant="body1" paragraph>
                  {i18n.t('assistants.help.introduction.whatAre.description')}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  {renderCapabilities([
                    i18n.t('assistants.help.introduction.whatAre.benefits.personalization'),
                    i18n.t('assistants.help.introduction.whatAre.benefits.contextMemory'),
                    i18n.t('assistants.help.introduction.whatAre.benefits.tools'),
                    i18n.t('assistants.help.introduction.whatAre.benefits.integration')
                  ])}
                </Box>
              </Paper>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                mt: 4,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <SettingsIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.introduction.page.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.introduction.page.description')}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                      <AddIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {i18n.t('assistants.help.introduction.page.sections.creation')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.t('assistants.help.introduction.page.sections.creationDesc')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      borderLeft: `4px solid ${theme.palette.info.main}`,
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                      <CloudDownloadIcon color="info" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {i18n.t('assistants.help.introduction.page.sections.import')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.t('assistants.help.introduction.page.sections.importDesc')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      borderLeft: `4px solid ${theme.palette.success.main}`,
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                      <SearchIcon color="success" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {i18n.t('assistants.help.introduction.page.sections.search')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.t('assistants.help.introduction.page.sections.searchDesc')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      borderLeft: `4px solid ${theme.palette.warning.main}`,
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                      <EditIcon color="warning" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {i18n.t('assistants.help.introduction.page.sections.management')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.t('assistants.help.introduction.page.sections.managementDesc')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                mt: 4,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <StorageIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.introduction.models.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.introduction.models.description')}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  {renderInfoCard(modelInfo.gpt4)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderInfoCard(modelInfo.gpt4turbo)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderInfoCard(modelInfo.gpt35)}
                </Grid>
              </Grid>

              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.08), 
                borderRadius: 2,
                border: `1px solid ${theme.palette.info.light}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5
              }}>
                <LightbulbIcon color="info" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" color="info.main" gutterBottom>
                    {i18n.t('assistants.help.introduction.models.tip.title')}
                  </Typography>
                  <Typography variant="body2">
                    {i18n.t('assistants.help.introduction.models.tip.description')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 2: Criação */}
          <TabPanel value={tabValue} index={1}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <AddIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.creation.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.creation.description')}
              </Typography>

              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: theme.palette.text.primary,
                  fontWeight: 600
                }}>
                  <TouchAppIcon color="primary" />
                  {i18n.t('assistants.help.creation.stepsTitle')}
                </Typography>
              
                {renderStep(
                  1,
                  i18n.t('assistants.help.creation.steps.one.title'),
                  i18n.t('assistants.help.creation.steps.one.description')
                )}

                {renderStep(
                  2,
                  i18n.t('assistants.help.creation.steps.two.title'),
                  i18n.t('assistants.help.creation.steps.two.description'),
                  <Box sx={{ mt: 2 }}>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableCell width="30%"><strong>{i18n.t('assistants.help.common.field')}</strong></TableCell>
                            <TableCell><strong>{i18n.t('assistants.help.common.description')}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <KeyIcon fontSize="small" color="primary" />
                                {i18n.t('assistants.help.creation.steps.two.fields.apiKey')}
                              </Box>
                            </TableCell>
                            <TableCell>{i18n.t('assistants.help.creation.steps.two.fields.apiKeyDesc')}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LabelIcon fontSize="small" color="primary" />
                                {i18n.t('assistants.help.creation.steps.two.fields.name')}
                              </Box>
                            </TableCell>
                            <TableCell>{i18n.t('assistants.help.creation.steps.two.fields.nameDesc')}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon fontSize="small" color="primary" />
                                {i18n.t('assistants.help.creation.steps.two.fields.instructions')}
                              </Box>
                            </TableCell>
                            <TableCell>{i18n.t('assistants.help.creation.steps.two.fields.instructionsDesc')}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StorageIcon fontSize="small" color="primary" />
                                {i18n.t('assistants.help.creation.steps.two.fields.model')}
                              </Box>
                            </TableCell>
                            <TableCell>{i18n.t('assistants.help.creation.steps.two.fields.modelDesc')}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {renderStep(
                  3,
                  i18n.t('assistants.help.creation.steps.three.title'),
                  i18n.t('assistants.help.creation.steps.three.description'),
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.07),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}
                        >
                          <SearchIcon color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {i18n.t('assistants.help.creation.steps.three.tools.fileSearch')}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.secondary.main, 0.07),
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                          }}
                        >
                          <CodeIcon color="secondary" sx={{ fontSize: '2rem', mb: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {i18n.t('assistants.help.creation.steps.three.tools.codeInterpreter')}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.warning.main, 0.07),
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                          }}
                        >
                          <FunctionsIcon color="warning" sx={{ fontSize: '2rem', mb: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {i18n.t('assistants.help.creation.steps.three.tools.functions')}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                      {i18n.t('assistants.help.creation.steps.three.note')}
                    </Typography>
                  </Box>
                )}

                {renderStep(
                  4,
                  i18n.t('assistants.help.creation.steps.four.title'),
                  i18n.t('assistants.help.creation.steps.four.description')
                )}
              </Box>

              <Box sx={{ 
                p: 3, 
                mt: 4,
                bgcolor: alpha(theme.palette.success.main, 0.07), 
                borderRadius: 2,
                border: `1px solid ${theme.palette.success.light}`
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: theme.palette.success.dark,
                  fontWeight: 600
                }}>
                  <LightbulbIcon color="success" />
                  {i18n.t('assistants.help.creation.tips.title')}
                </Typography>
                <List dense disablePadding>
                  <ListItem>
                    <ListItemIcon sx={{ color: theme.palette.success.main, minWidth: '36px' }}>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t('assistants.help.creation.tips.instructionsQuality')}
                      primaryTypographyProps={{ color: 'text.primary' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: theme.palette.success.main, minWidth: '36px' }}>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t('assistants.help.creation.tips.specificPurpose')}
                      primaryTypographyProps={{ color: 'text.primary' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: theme.palette.success.main, minWidth: '36px' }}>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t('assistants.help.creation.tips.testIteratively')}
                      primaryTypographyProps={{ color: 'text.primary' }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 3: Ferramentas */}
          <TabPanel value={tabValue} index={2}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <ExtensionIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.tools.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.tools.description')}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  {renderInfoCard(toolsInfo.fileSearch)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderInfoCard(toolsInfo.codeInterpreter)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderInfoCard(toolsInfo.functions)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <SettingsIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.tools.configuration.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.tools.configuration.description')}
              </Typography>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 1.5 
                }}>
                  <Avatar sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}>
                    <SearchIcon />
                  </Avatar>
                  <Typography variant="h6">
                    {i18n.t('assistants.help.tools.configuration.fileSearch.title')}
                  </Typography>
                </Box>

                <Box sx={{ ml: 4 }}>
                  <Typography variant="body2" paragraph>
                    {i18n.t('assistants.help.tools.configuration.fileSearch.step1')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {i18n.t('assistants.help.tools.configuration.fileSearch.step2')}
                  </Typography>
                  <Typography variant="body2">
                    {i18n.t('assistants.help.tools.configuration.fileSearch.step3')}
                  </Typography>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 1.5 
                }}>
                  <Avatar sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main
                  }}>
                    <CodeIcon />
                  </Avatar>
                  <Typography variant="h6">
                    {i18n.t('assistants.help.tools.configuration.codeInterpreter.title')}
                  </Typography>
                </Box>

                <Box sx={{ ml: 4 }}>
                  <Typography variant="body2" paragraph>
                    {i18n.t('assistants.help.tools.configuration.codeInterpreter.step1')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {i18n.t('assistants.help.tools.configuration.codeInterpreter.step2')}
                  </Typography>
                  <Typography variant="body2">
                    {i18n.t('assistants.help.tools.configuration.codeInterpreter.libraries')}
                  </Typography>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 1.5 
                }}>
                  <Avatar sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main
                  }}>
                    <FunctionsIcon />
                  </Avatar>
                  <Typography variant="h6">
                    {i18n.t('assistants.help.tools.configuration.functions.title')}
                  </Typography>
                </Box>

                <Box sx={{ ml: 4 }}>
                  <Typography variant="body2" paragraph>
                    {i18n.t('assistants.help.tools.configuration.functions.step1')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {i18n.t('assistants.help.tools.configuration.functions.step2')}
                  </Typography>
                  
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.05)
                  }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {i18n.t('assistants.help.tools.configuration.functions.parameters.title')}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" gutterBottom>
                          <Box component="span" fontWeight="bold">{i18n.t('assistants.help.tools.configuration.functions.parameters.name')}: </Box>
                          {i18n.t('assistants.help.tools.configuration.functions.parameters.nameDesc')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" gutterBottom>
                          <Box component="span" fontWeight="bold">{i18n.t('assistants.help.tools.configuration.functions.parameters.description')}: </Box>
                          {i18n.t('assistants.help.tools.configuration.functions.parameters.descriptionDesc')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" gutterBottom>
                          <Box component="span" fontWeight="bold">{i18n.t('assistants.help.tools.configuration.functions.parameters.type')}: </Box>
                          {i18n.t('assistants.help.tools.configuration.functions.parameters.typeDesc')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" gutterBottom>
                          <Box component="span" fontWeight="bold">{i18n.t('assistants.help.tools.configuration.functions.parameters.required')}: </Box>
                          {i18n.t('assistants.help.tools.configuration.functions.parameters.requiredDesc')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ 
                p: 3, 
                mt: 4,
                bgcolor: alpha(theme.palette.error.main, 0.07), 
                borderRadius: 2,
                border: `1px solid ${theme.palette.error.light}`,
                display: 'flex',
                gap: 2
              }}>
                <BugReportIcon color="error" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" color="error.main" fontWeight="bold" gutterBottom>
                    {i18n.t('assistants.help.tools.limitations.title')}
                  </Typography>
                  <Typography variant="body2">
                    {i18n.t('assistants.help.tools.limitations.description')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 4: Importação */}
          <TabPanel value={tabValue} index={3}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <CloudDownloadIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.import.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.import.description')}
              </Typography>

              <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: theme.palette.text.primary,
                  fontWeight: 600
                }}>
                  <TouchAppIcon color="primary" />
                  {i18n.t('assistants.help.import.processTitle')}
                </Typography>
              
                {renderStep(
                  1,
                  i18n.t('assistants.help.import.steps.one.title'),
                  i18n.t('assistants.help.import.steps.one.description'),
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                  }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <InfoIcon fontSize="small" color="warning" />
                      {i18n.t('assistants.help.import.steps.one.note')}
                    </Typography>
                  </Box>
                )}

                {renderStep(
                  2,
                  i18n.t('assistants.help.import.steps.two.title'),
                  i18n.t('assistants.help.import.steps.two.description')
                )}

                {renderStep(
                  3,
                  i18n.t('assistants.help.import.steps.three.title'),
                  i18n.t('assistants.help.import.steps.three.description'),
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    {i18n.t('assistants.help.import.steps.three.note')}
                  </Typography>
                )}
              </Box>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${theme.palette.success.light}`
                }}
              >
                <Typography variant="subtitle1" color="success.main" fontWeight="bold" gutterBottom>
                  {i18n.t('assistants.help.import.advantages.title')}
                </Typography>
                
                <List dense disablePadding>
                  <ListItem>
                    <ListItemIcon sx={{ color: theme.palette.success.main, minWidth: '36px' }}>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t('assistants.help.import.advantages.time')}
                      primaryTypographyProps={{ color: 'text.primary' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: theme.palette.success.main, minWidth: '36px' }}>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t('assistants.help.import.advantages.consistency')}
                      primaryTypographyProps={{ color: 'text.primary' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: theme.palette.success.main, minWidth: '36px' }}>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t('assistants.help.import.advantages.migration')}
                      primaryTypographyProps={{ color: 'text.primary' }}
                    />
                  </ListItem>
                </List>
              </Paper>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <InfoIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.import.limitations.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.import.limitations.description')}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 2, 
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <InsertDriveFileIcon color="warning" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      {i18n.t('assistants.help.import.limitations.files.title')}
                    </Typography>
                    <Typography variant="body2">
                      {i18n.t('assistants.help.import.limitations.files.description')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 2, 
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <KeyIcon color="warning" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      {i18n.t('assistants.help.import.limitations.keys.title')}
                    </Typography>
                    <Typography variant="body2">
                      {i18n.t('assistants.help.import.limitations.keys.description')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 2, 
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <FunctionsIcon color="warning" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      {i18n.t('assistants.help.import.limitations.functions.title')}
                    </Typography>
                    <Typography variant="body2">
                      {i18n.t('assistants.help.import.limitations.functions.description')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ 
                p: 3, 
                bgcolor: alpha(theme.palette.info.main, 0.07), 
                borderRadius: 2,
                border: `1px solid ${theme.palette.info.light}`,
                display: 'flex',
                gap: 2
              }}>
                <InfoIcon color="info" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" color="info.main" fontWeight="bold" gutterBottom>
                    {i18n.t('assistants.help.import.security.title')}
                  </Typography>
                  <Typography variant="body2">
                    {i18n.t('assistants.help.import.security.description')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 5: Tipos de Mensagens */}
          <TabPanel value={tabValue} index={4}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 1.5 
              }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <ChatBubbleOutlineIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {i18n.t('assistants.help.messageTypes.title')}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {i18n.t('assistants.help.messageTypes.description')}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Texto */}
                <Grid item xs={12}>
                  {renderInfoCard({
                    title: i18n.t('assistants.help.messageTypes.text.title'),
                    description: i18n.t('assistants.help.messageTypes.text.description'),
                    icon: <ChatBubbleOutlineIcon />,
                    color: theme.palette.primary.main,
                    capabilities: null
                  }, 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {i18n.t('assistants.help.messageTypes.text.example')}
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {i18n.t('assistants.help.messageTypes.text.exampleText')}
                      </Typography>
                    </Paper>
                  </Box>)}
                </Grid>
                
                {/* Localização */}
                <Grid item xs={12} md={6}>
                  {renderInfoCard({
                    title: i18n.t('assistants.help.messageTypes.location.title'),
                    description: i18n.t('assistants.help.messageTypes.location.description'),
                    icon: <LocationOnIcon />,
                    color: theme.palette.success.main,
                    capabilities: null
                  }, 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {i18n.t('assistants.help.messageTypes.location.example')}
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        !location:latitude=-23.5505,longitude=-46.6333,name=São Paulo - SP
                      </Typography>
                    </Paper>
                  </Box>)}
                </Grid>
                
                {/* Documento */}
                <Grid item xs={12} md={6}>
                  {renderInfoCard({
                    title: i18n.t('assistants.help.messageTypes.document.title'),
                    description: i18n.t('assistants.help.messageTypes.document.description'),
                    icon: <InsertDriveFileIcon />,
                    color: theme.palette.primary.main,
                    capabilities: null
                  }, 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {i18n.t('assistants.help.messageTypes.document.example')}
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        !document:url=https://exemplo.com/documento.pdf,filename=Relatório.pdf
                      </Typography>
                    </Paper>
                  </Box>)}
                </Grid>
                
                {/* Vídeo */}
                <Grid item xs={12} md={6}>
                  {renderInfoCard({
                    title: i18n.t('assistants.help.messageTypes.video.title'),
                    description: i18n.t('assistants.help.messageTypes.video.description'),
                    icon: <VideocamIcon />,
                    color: theme.palette.error.main,
                    capabilities: null
                  }, 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {i18n.t('assistants.help.messageTypes.video.example')}
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        !video:url=https://exemplo.com/video.mp4,caption=Demonstração do produto
                      </Typography>
                    </Paper>
                  </Box>)}
                </Grid>
                
                {/* Contato */}
                <Grid item xs={12} md={6}>
                  {renderInfoCard({
                    title: i18n.t('assistants.help.messageTypes.contact.title'),
                    description: i18n.t('assistants.help.messageTypes.contact.description'),
                    icon: <ContactPhoneIcon />,
                    color: theme.palette.info.main,
                    capabilities: null
                  }, 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {i18n.t('assistants.help.messageTypes.contact.example')}
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        !contact:name=João Silva,number=5511999998888
                      </Typography>
                    </Paper>
                  </Box>)}
                </Grid>
                
                {/* Áudio */}
                <Grid item xs={12} md={6}>
                  {renderInfoCard({
                    title: i18n.t('assistants.help.messageTypes.audio.title'),
                    description: i18n.t('assistants.help.messageTypes.audio.description'),
                    icon: <AudiotrackIcon />,
                    color: theme.palette.secondary.main,
                    capabilities: null
                  }, 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {i18n.t('assistants.help.messageTypes.audio.example')}
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        !audio:url=https://exemplo.com/audio.mp3
                      </Typography>
                    </Paper>
                  </Box>)}
                </Grid>
                
                {/* Imagem */}
                <Grid item xs={12} md={6}>
                  {renderInfoCard({
                    title: i18n.t('assistants.help.messageTypes.image.title'),
                    description: i18n.t('assistants.help.messageTypes.image.description'),
                    icon: <ImageIcon />,
                    color: theme.palette.warning.main,
                    capabilities: null
                  }, 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {i18n.t('assistants.help.messageTypes.image.example')}
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        !image:url=https://exemplo.com/imagem.jpg,caption=Foto do produto
                      </Typography>
                    </Paper>
                  </Box>)}
                </Grid>
              </Grid>

              <Box sx={{ 
                p: 3, 
                mt: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08), 
                borderRadius: 2,
                border: `1px solid ${theme.palette.info.light}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5
              }}>
                <LightbulbIcon color="info" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" color="info.main" gutterBottom>
                    {i18n.t('assistants.help.messageTypes.tips.title')}
                  </Typography>
                  <Typography variant="body2">
                    {i18n.t('assistants.help.messageTypes.tips.description')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </Box>
      </DialogContent>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="contained" color="primary">
          {i18n.t('common.close')}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AssistantsHelpModal;