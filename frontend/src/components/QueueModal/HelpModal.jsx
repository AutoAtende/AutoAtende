import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Box,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { 
  Close,
  ExpandMore,
  Chat as ChatIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  ContactPhone as ContactIcon,
  SwapHoriz as TransferIcon,
  RuleFolder as ValidationIcon,
  CallSplit as ConditionalIcon,
  Tag as TagIcon,
  Timeline as StepperIcon,
  PlayArrow as TestIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
  },
  tabContent: {
    padding: theme.spacing(2),
  },
  example: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    margin: theme.spacing(2, 0),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  iconTypeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    margin: theme.spacing(2, 0),
  },
  typeCard: {
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: '180px',
    flexGrow: 1,
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  accordion: {
    marginBottom: theme.spacing(1),
  }
}));

// Componente para exibir o conteúdo da aba
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

const HelpModal = ({ open, onClose }) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h6">
          <HelpIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {i18n.t("queueHelpModal.title")}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={i18n.t("queueHelpModal.tabs.overview")} />
          <Tab label={i18n.t("queueHelpModal.tabs.optionTypes")} />
          <Tab label={i18n.t("queueHelpModal.tabs.advanced")} />
          <Tab label={i18n.t("queueHelpModal.tabs.examples")} />
        </Tabs>
      </Box>
      
      <DialogContent dividers>
        {/* Aba 1: Visão Geral */}
        <TabPanel value={tabValue} index={0}>
          <div className={classes.tabContent}>
            <div className={classes.section}>
              <Typography variant="h6" gutterBottom>
                {i18n.t("queueHelpModal.overview.subtitle")}
              </Typography>
              <Typography paragraph>
                {i18n.t("queueHelpModal.overview.description")}
              </Typography>
              
              <Box className={classes.example}>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.overview.commonUseCases")}:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ChatIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.overview.useCase1")}
                      secondary={i18n.t("queueHelpModal.overview.useCase1Desc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TransferIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.overview.useCase2")}
                      secondary={i18n.t("queueHelpModal.overview.useCase2Desc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ValidationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.overview.useCase3")}
                      secondary={i18n.t("queueHelpModal.overview.useCase3Desc")}
                    />
                  </ListItem>
                </List>
              </Box>
            </div>
            
            <div className={classes.section}>
              <Typography variant="h6" gutterBottom>
                {i18n.t("queueHelpModal.overview.structureTitle")}
              </Typography>
              <Typography paragraph>
                {i18n.t("queueHelpModal.overview.structureDesc")}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <StepperIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={i18n.t("queueHelpModal.overview.structure1")}
                    secondary={i18n.t("queueHelpModal.overview.structure1Desc")}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ChatIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={i18n.t("queueHelpModal.overview.structure2")}
                    secondary={i18n.t("queueHelpModal.overview.structure2Desc")}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TestIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={i18n.t("queueHelpModal.overview.structure3")}
                    secondary={i18n.t("queueHelpModal.overview.structure3Desc")}
                  />
                </ListItem>
              </List>
            </div>
          </div>
        </TabPanel>
        
        {/* Aba 2: Tipos de Opções */}
        <TabPanel value={tabValue} index={1}>
          <div className={classes.tabContent}>
            <Typography variant="h6" gutterBottom>
              {i18n.t("queueHelpModal.optionTypes.subtitle")}
            </Typography>
            <Typography paragraph>
              {i18n.t("queueHelpModal.optionTypes.description")}
            </Typography>
            
            <div className={classes.iconTypeGrid}>
              <Paper className={classes.typeCard} variant="outlined">
                <ChatIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.text")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <AudioIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.audio")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <VideoIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.video")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <ImageIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.image")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <DocumentIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.document")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <ContactIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.contact")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <TransferIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.transferQueue")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <TransferIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.transferUser")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <TransferIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.transferWhatsapp")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <ValidationIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.validation")}
                </Typography>
              </Paper>
              
              <Paper className={classes.typeCard} variant="outlined">
                <ConditionalIcon color="primary" />
                <Typography variant="subtitle2">
                  {i18n.t("queueOptions.optionTypes.conditional")}
                </Typography>
              </Paper>
            </div>
            
            <Divider style={{ margin: '20px 0' }} />
            
            {/* Detalhes de cada tipo de opção */}
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <ChatIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.text")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.textDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.textUseWhen")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <AudioIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.audio")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.audioDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.audioUseWhen")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <VideoIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.video")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.videoDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.videoUseWhen")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <ImageIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.image")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.imageDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.imageUseWhen")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <DocumentIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.document")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.documentDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.documentUseWhen")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <ContactIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.contact")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.contactDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.contactUseWhen")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <TransferIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueHelpModal.optionTypes.transferTitle")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.transferDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.optionTypes.transferQueue")}
                      secondary={i18n.t("queueHelpModal.optionTypes.transferQueueDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.optionTypes.transferUser")}
                      secondary={i18n.t("queueHelpModal.optionTypes.transferUserDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.optionTypes.transferWhatsapp")}
                      secondary={i18n.t("queueHelpModal.optionTypes.transferWhatsappDesc")}
                    />
                  </ListItem>
                </List>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.transferUseWhen")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <ValidationIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.validation")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.validationDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.validationUseWhen")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.availableTypes")}:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="CPF"
                      secondary={i18n.t("queueHelpModal.optionTypes.validationCPFDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Email"
                      secondary={i18n.t("queueHelpModal.optionTypes.validationEmailDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.optionTypes.validationPhoneTitle")}
                      secondary={i18n.t("queueHelpModal.optionTypes.validationPhoneDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.optionTypes.validationCustomTitle")}
                      secondary={i18n.t("queueHelpModal.optionTypes.validationCustomDesc")}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <ConditionalIcon style={{ marginRight: 8 }} />
                <Typography>{i18n.t("queueOptions.optionTypes.conditional")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.conditionalDescription")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.common.useWhen")}:
                </Typography>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.optionTypes.conditionalUseWhen")}
                </Typography>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.optionTypes.conditionalOperators")}:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.operators.equals")}
                      secondary={i18n.t("queueHelpModal.optionTypes.operatorEqualsDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.operators.contains")}
                      secondary={i18n.t("queueHelpModal.optionTypes.operatorContainsDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.operators.startsWith")}
                      secondary={i18n.t("queueHelpModal.optionTypes.operatorStartsWithDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.operators.endsWith")}
                      secondary={i18n.t("queueHelpModal.optionTypes.operatorEndsWithDesc")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueOptions.operators.regex")}
                      secondary={i18n.t("queueHelpModal.optionTypes.operatorRegexDesc")}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </div>
        </TabPanel>
        
        {/* Aba 3: Recursos Avançados */}
        <TabPanel value={tabValue} index={2}>
          <div className={classes.tabContent}>
            <div className={classes.section}>
              <Typography variant="h6" gutterBottom>
                {i18n.t("queueHelpModal.advanced.subtitle")}
              </Typography>
              <Typography paragraph>
                {i18n.t("queueHelpModal.advanced.description")}
              </Typography>
              
              <Accordion className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    {i18n.t("queueHelpModal.advanced.nestingTitle")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    {i18n.t("queueHelpModal.advanced.nestingDesc")}
                  </Typography>
                  <Box className={classes.example}>
                    <Typography variant="subtitle2">
                      {i18n.t("queueHelpModal.advanced.nestingExample")}:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="1. Menu Principal" />
                      </ListItem>
                      <List dense style={{ paddingLeft: 20 }}>
                        <ListItem>
                          <ListItemText primary="1.1 Suporte Técnico" />
                        </ListItem>
                        <List dense style={{ paddingLeft: 20 }}>
                          <ListItem>
                            <ListItemText primary="1.1.1 Problemas de Conexão" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="1.1.2 Problemas de Software" />
                          </ListItem>
                        </List>
                        <ListItem>
                          <ListItemText primary="1.2 Financeiro" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="1.3 Vendas" />
                        </ListItem>
                      </List>
                    </List>
                  </Box>
                </AccordionDetails>
              </Accordion>
              
              <Accordion className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    {i18n.t("queueHelpModal.advanced.variablesTitle")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    {i18n.t("queueHelpModal.advanced.variablesDesc")}
                  </Typography>
                  <Box className={classes.example}>
                    <Typography variant="subtitle2">
                      {i18n.t("queueHelpModal.advanced.variablesExample")}:
                    </Typography>
                    <code>
                      {i18n.t("queueHelpModal.advanced.variablesSample")}
                    </code>
                  </Box>
                </AccordionDetails>
              </Accordion>
              
              <Accordion className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    {i18n.t("queueHelpModal.advanced.flowControlTitle")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    {i18n.t("queueHelpModal.advanced.flowControlDesc")}
                  </Typography>
                  <Box className={classes.example}>
                    <Typography variant="subtitle2">
                      {i18n.t("queueHelpModal.advanced.conditionalExample")}:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary={i18n.t("queueHelpModal.advanced.conditionalStep1")}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary={i18n.t("queueHelpModal.advanced.conditionalStep2")}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary={i18n.t("queueHelpModal.advanced.conditionalStep3")}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary={i18n.t("queueHelpModal.advanced.conditionalStep4")}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </AccordionDetails>
              </Accordion>
              
              <Accordion className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    {i18n.t("queueHelpModal.advanced.previewTitle")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    {i18n.t("queueHelpModal.advanced.previewDesc")}
                  </Typography>
                  <Typography variant="subtitle2">
                    {i18n.t("queueHelpModal.advanced.previewSteps")}:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="1. Salve a opção que deseja testar" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="2. Clique no ícone de reprodução (PlayArrow)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="3. Visualize como a mensagem aparecerá para o cliente" />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </TabPanel>
        
        {/* Aba 4: Exemplos */}
        <TabPanel value={tabValue} index={3}>
          <div className={classes.tabContent}>
            <Typography variant="h6" gutterBottom>
              {i18n.t("queueHelpModal.examples.subtitle")}
            </Typography>
            <Typography paragraph>
              {i18n.t("queueHelpModal.examples.description")}
            </Typography>
            
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  {i18n.t("queueHelpModal.examples.menuTitle")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {i18n.t("queueHelpModal.examples.menuDescription")}
                </Typography>
                <Box className={classes.example}>
                  <Typography variant="subtitle2">
                    {i18n.t("queueHelpModal.examples.menuExample")}:
                  </Typography>
                  <Typography style={{ whiteSpace: 'pre-line' }}>
                    {i18n.t("queueHelpModal.examples.menuText")}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  {i18n.t("queueHelpModal.examples.implementation")}:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Menu Principal (text)"
                      secondary={i18n.t("queueHelpModal.examples.menuStep1")}
                    />
                  </ListItem>
                  <List dense style={{ paddingLeft: 20 }}>
                    <ListItem>
                      <ListItemText 
                        primary="1.1 Suporte Técnico (text)"
                        secondary={i18n.t("queueHelpModal.examples.menuStep2")}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                      primary="1.2 Financeiro (transfer_queue)"
                      secondary={i18n.t("queueHelpModal.examples.menuStep3")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="1.3 Vendas (transfer_user)"
                      secondary={i18n.t("queueHelpModal.examples.menuStep4")}
                    />
                  </ListItem>
                </List>
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                {i18n.t("queueHelpModal.examples.formTitle")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {i18n.t("queueHelpModal.examples.formDescription")}
              </Typography>
              <Box className={classes.example}>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.examples.formExample")}:
                </Typography>
                <Typography style={{ whiteSpace: 'pre-line' }}>
                  {i18n.t("queueHelpModal.examples.formText")}
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t("queueHelpModal.examples.implementation")}:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="1. Coleta de Dados (text)"
                    secondary={i18n.t("queueHelpModal.examples.formStep1")}
                  />
                </ListItem>
                <List dense style={{ paddingLeft: 20 }}>
                  <ListItem>
                    <ListItemText 
                      primary="1.1 Nome (validation - custom)"
                      secondary={i18n.t("queueHelpModal.examples.formStep2")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="1.2 Email (validation - email)"
                      secondary={i18n.t("queueHelpModal.examples.formStep3")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="1.3 CPF (validation - cpf)"
                      secondary={i18n.t("queueHelpModal.examples.formStep4")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="1.4 Conclusão (text + transfer_queue)"
                      secondary={i18n.t("queueHelpModal.examples.formStep5")}
                    />
                  </ListItem>
                </List>
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                {i18n.t("queueHelpModal.examples.conditionalTitle")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {i18n.t("queueHelpModal.examples.conditionalDescription")}
              </Typography>
              <Box className={classes.example}>
                <Typography variant="subtitle2">
                  {i18n.t("queueHelpModal.examples.conditionalExample")}:
                </Typography>
                <Typography paragraph style={{ whiteSpace: 'pre-line' }}>
                  {i18n.t("queueHelpModal.examples.conditionalText")}
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t("queueHelpModal.examples.implementation")}:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="1. Pergunta Inicial (text)"
                    secondary={i18n.t("queueHelpModal.examples.conditionalStep1")}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="2. Análise da Resposta (conditional)"
                    secondary={i18n.t("queueHelpModal.examples.conditionalStep2")}
                  />
                </ListItem>
                <List dense style={{ paddingLeft: 20 }}>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.examples.conditionalCondition1")}
                      secondary={i18n.t("queueHelpModal.examples.conditionalTarget1")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.examples.conditionalCondition2")}
                      secondary={i18n.t("queueHelpModal.examples.conditionalTarget2")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={i18n.t("queueHelpModal.examples.conditionalDefault")}
                      secondary={i18n.t("queueHelpModal.examples.conditionalTarget3")}
                    />
                  </ListItem>
                </List>
              </List>
            </AccordionDetails>
          </Accordion>
        </div>
      </TabPanel>
    </DialogContent>
  </Dialog>
);
};

export default HelpModal;