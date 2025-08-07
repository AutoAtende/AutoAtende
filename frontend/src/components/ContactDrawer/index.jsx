import React, { useEffect, useState, useContext } from "react";
import api from "../../services/api";

import makeStyles from '@mui/styles/makeStyles';
import {
  Typography,
  IconButton,
  Drawer,
  Link,
  InputLabel,
  Button,
  Paper,
  CardHeader,
  Switch,
  Box,
  Divider,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  Badge,
  useTheme,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  TextField,
  Chip
} from "@mui/material";
import {
  KeyboardTab as CloseIcon,
  Create as CreateIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarMonthIcon,
  ContactPhone as ContactPhoneIcon,
  Notes as NotesIcon,
  Info as InfoIcon,
  ListAlt as ListAltIcon,
  Settings as SettingsIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { i18n } from "../../translate/i18n";

import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import WhatsMarkedWrapper from "../WhatsMarkedWrapper";
import { ContactForm } from "../ContactForm";
import ContactModal from "../ContactModal";
import ContactPhoneInput from "../PhoneInputs/ContactPhoneInput";
import { ContactNotes } from "../ContactNotes";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import ContactProfilePicture from "../ContactProfilePicture";
import ContactAppointments from "../ContactAppointments";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: '100%',
    display: "flex",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  header: {
    display: "flex",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: theme.palette.contactdrawer,
    alignItems: "center",
    padding: theme.spacing(0, 1),
    minHeight: "73px",
    justifyContent: "space-between",
  },
  content: {
    display: "flex",
    backgroundColor: theme.palette.contactdrawer,
    flexDirection: "column",
    padding: "8px 12px",
    height: "100%",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  contactAvatar: {
    margin: 15,
    width: 100,
    height: 100,
  },
  contactHeader: {
    display: "flex",
    padding: 12,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    "& > *": {
      margin: 4,
    },
  },
  contactDetails: {
    marginTop: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
  },
  contactExtraInfo: {
    marginTop: 8,
    padding: 12,
    borderRadius: 4,
  },
  phoneContainer: {
    margin: '8px 0',
  },
  employerSection: {
    marginTop: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 8,
  },
  employerName: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  employerIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  employerCustomField: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  tabPanel: {
    padding: theme.spacing(2, 0),
  },
  tabRoot: {
    minWidth: 'unset',
    padding: theme.spacing(1.5),
    minHeight: '48px',
  },
  tabIcon: {
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicator: {
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  editButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading, isGroup }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [disableBot, setDisableBot] = useState(contact.disableBot);
  const [contactData, setContactData] = useState(contact);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(contact.number || "");
  const [phoneValid, setPhoneValid] = useState(true);
  const [employer, setEmployer] = useState(null);
  const [loadingEmployer, setLoadingEmployer] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [hasAppointments, setHasAppointments] = useState(false);
  
  // Novos estados para lidar com grupos
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setOpenForm(false);
    setDisableBot(contact.disableBot);
    setContactData(contact);
    setPhoneValue(contact.number || "");
    setIsEditingPhone(false);
    setTabValue(0);

    // Função para carregar os participantes do grupo
const loadGroupParticipants = async () => {
	if (!contact.isGroup) return;
	
	setLoadingParticipants(true);
	try {
		const { data } = await api.get(`/groups/${contact.id}/details`);
		setParticipants(data);
	} catch (err) {
		console.error("Erro ao buscar participantes do grupo:", err);
		toast.error("Erro ao carregar participantes do grupo");
		setParticipants([]);
	} finally {
		setLoadingParticipants(false);
	}
};

    const checkAppointments = async () => {
      try {
        const { data } = await api.get('/appointments', {
          params: { 
            contactId: contact.id,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        });
        setHasAppointments(Array.isArray(data) && data.length > 0);
      } catch (err) {
        console.error("Erro ao verificar agendamentos:", err);
        setHasAppointments(false);
      }
    };
    
    if (contact.employerId) {
      loadEmployerDetails(contact.employerId);
    } else {
      setEmployer(null);
    }
    
    if (contact.id) {
      checkAppointments();
    }
    
    // Se for um grupo, carrega os participantes
    if (isGroup) {
      console.log("Carregando participantes do grupo...", contact.id);
      loadGroupParticipants(contact.id);
    }
  }, [open, contact]);

  const loadEmployerDetails = async (employerId) => {
    try {
      setLoadingEmployer(true);
      const { data } = await api.get(`/employers/${employerId}`);
      setEmployer(data);
    } catch (err) {
      console.error("Erro ao carregar detalhes da empresa:", err);
      setEmployer(null);
    } finally {
      setLoadingEmployer(false);
    }
  };
  
  const handleContactToggleDisableBot = async () => {
    const { id } = contact;

    try {
      const { data } = await api.put(`/contacts/toggleDisableBot/${id}`);
      contact.disableBot = data.disableBot;
      setDisableBot(data.disableBot)

    } catch (err) {
      toast.error(err);
    }
  };
  
  const handleProfileUpdate = (updatedContact) => {
    setContactData({
      ...contactData,
      profilePicUrl: updatedContact.profilePicUrl
    });
  };

  const handlePhoneChange = (phone, isValid) => {
    setPhoneValue(phone);
    setPhoneValid(isValid);
  };

  const savePhone = async () => {
    if (!phoneValid) {
      toast.error(i18n.t("contactModal.form.invalidPhone"));
      return;
    }

    try {
      const { data } = await api.put(`/contacts/${contactData.id}`, {
        ...contactData,
        number: phoneValue
      });
      
      setContactData({
        ...contactData,
        number: phoneValue
      });
      
      setIsEditingPhone(false);
      toast.success(i18n.t("contactModal.success.phoneUpdated"));
    } catch (err) {
      toast.error(i18n.t("contactModal.errors.saveGeneric"));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filtra participantes com base na pesquisa
  const filteredParticipants = participants.filter(p => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    const number = p && p.id ? p.id.split('@')[0] : '';
    
    // Busca pelo número ou nome (se disponível)
    return (
      number.includes(searchTermLower) || 
      (p && p.name && p.name.toLowerCase().includes(searchTermLower))
    );
  });

  const isAdmin = (participant) => {
    if (!participant) return false;
    return participant.isAdmin || participant.admin === 'admin' || participant.admin === 'superadmin';
  };

  const renderPhoneSection = () => {
    if (isEditingPhone) {
      return (
        <div className={classes.phoneContainer}>
          <ContactPhoneInput
            name="number"
            label={i18n.t("contactModal.form.number")}
            value={phoneValue}
            onChange={handlePhoneChange}
            error={!phoneValid}
            helperText={!phoneValid ? i18n.t("contactModal.form.invalidPhone") : ""}
            required
            fullWidth
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button 
              size="small" 
              onClick={() => setIsEditingPhone(false)} 
              color="secondary"
              style={{ marginRight: 8 }}
              startIcon={<CancelIcon fontSize="small" />}
            >
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button 
              size="small" 
              onClick={savePhone} 
              color="primary" 
              variant="contained"
              disabled={!phoneValid}
              startIcon={<SaveIcon fontSize="small" />}
            >
              {i18n.t("contactModal.buttons.save")}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Typography style={{fontSize: 12}}>
        <Link 
          href={`tel:${user.isTricked === "enabled" ? contactData.number : contactData.number.slice(0,-4) + "****"}`}
          onClick={(e) => {
            if (openForm) {
              e.preventDefault();
              setIsEditingPhone(true);
            }
          }}
        >
          <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          {user.isTricked === "enabled" ? contactData.number : contactData.number.slice(0,-4) + "****"}
          {openForm && (
            <EditIcon style={{fontSize: 12, marginLeft: 5}} />
          )}
        </Link>
      </Typography>
    );
  };

  const renderEmployerSection = () => {
    if (!contactData.employerId) {
      return null;
    }

    if (loadingEmployer) {
      return (
        <Paper square variant="outlined" className={classes.contactDetails}>
          <Typography variant="subtitle1" gutterBottom>
            {i18n.t("contactDrawer.employerInfo")}
          </Typography>
          <Box display="flex" justifyContent="center" p={2}>
            <Typography color="textSecondary">
              {i18n.t("contactDrawer.loadingEmployerInfo")}
            </Typography>
          </Box>
        </Paper>
      );
    }

    if (!employer) {
      return null;
    }

    return (
      <Paper square elevation={0} variant="outlined" className={classes.contactDetails}>
        <Typography variant="subtitle1" gutterBottom>
          {i18n.t("contactDrawer.employerInfo")}
        </Typography>
        <Box className={classes.employerSection}>
          <Box className={classes.employerName}>
            <BusinessIcon className={classes.employerIcon} />
            <Typography variant="subtitle1" fontWeight="bold">
              {employer.name}
            </Typography>
          </Box>
          
          {employer.extraInfo && employer.extraInfo.length > 0 ? (
            employer.extraInfo.map((field, index) => (
              <Box key={index} className={classes.employerCustomField}>
                <Typography variant="caption" color="textSecondary">
                  {field.name}
                </Typography>
                <Typography variant="body2">
                  {field.value}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" align="center" p={1}>
              {i18n.t("contactDrawer.noEmployerCustomFields")}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      PaperProps={{ style: { position: "absolute" } }}
      BackdropProps={{ style: { position: "absolute" } }}
      ModalProps={{
        container: document.getElementById("drawer-container"),
        style: { position: "absolute" },
      }}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.header}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleDrawerClose} size="large">
            <Tooltip title={i18n.t("contactDrawer.closeMenu")}>
              <CloseIcon />
            </Tooltip>
          </IconButton>
          <Typography variant="h6">
            {i18n.t("contactDrawer.header")}
            {isGroup && (
              <Chip 
                size="small" 
                icon={<GroupIcon />} 
                label={i18n.t("contactDrawer.groupType")} 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
      </div>
      {loading ? (
        <ContactDrawerSkeleton classes={classes} />
      ) : (
        <div className={classes.content}>
          <Paper 
            elevation={0}
            square 
            variant="outlined" 
            className={classes.contactHeader}
            sx={{
              borderRadius: 2,
              position: 'relative',
              overflow: 'visible',
              mb: 2
            }}
          >
            {openForm && (
              <IconButton 
                className={classes.editButton}
                size="small"
                color="primary"
                onClick={() => setOpenForm(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
            
            <ContactProfilePicture 
              contactNumber={contactData.number}
              name={contactData.name}
              profilePicUrl={contactData.profilePicUrl}
              size={80}
              onUpdateComplete={handleProfileUpdate}
              showRefreshButton={true}
            />
            
            <CardHeader
              onClick={() => {}}
              style={{ cursor: "pointer", width: '100%', textAlign: "center", padding: '8px 16px' }}
              titleTypographyProps={{ noWrap: true, variant: 'h6' }}
              subheaderTypographyProps={{ noWrap: true }}
              title={
                <>
                  <Typography variant="h6" onClick={() => setOpenForm(true)}>
                    {contactData.name}
                    {!openForm && <EditIcon style={{fontSize: 16, marginLeft: 5}} />}
                  </Typography>
                </>
              }
              subheader={
                <>
                  {renderPhoneSection()}
                  {contactData.email && (
                    <Typography style={{fontSize: 12}}>
                      <Link href={`mailto:${contactData.email}`}>
                        <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {contactData.email}
                      </Link>
                    </Typography>
                  )}
                </>
              }
            />
            
            {(contactData.id && openForm) && (
              <Box sx={{ mt: 2, width: '100%' }}>
                <ContactForm initialContact={contactData} onCancel={() => setOpenForm(false)} />
              </Box>
            )}
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              classes={{
                indicator: classes.tabIndicator
              }}
            >
              <Tab 
                icon={
                  <Tooltip title={i18n.t("contactDrawer.tabs.notes")}>
                    <NotesIcon className={classes.tabIcon} />
                  </Tooltip>
                }
                classes={{ root: classes.tabRoot }}
              />
              {hasAppointments && (
                <Tab 
                  icon={
                    <Tooltip title={i18n.t("contactDrawer.tabs.appointments")}>
                      <CalendarMonthIcon className={classes.tabIcon} />
                    </Tooltip>
                  }
                  classes={{ root: classes.tabRoot }}
                />
              )}
              {isGroup && (
                <Tab 
                  icon={
                    <Tooltip title={i18n.t("contactDrawer.tabs.participants")}>
                      <GroupIcon className={classes.tabIcon} />
                    </Tooltip>
                  }
                  classes={{ root: classes.tabRoot }}
                />
              )}
              <Tab 
                icon={
                  <Tooltip title={i18n.t("contactDrawer.tabs.info")}>
                    <InfoIcon className={classes.tabIcon} />
                  </Tooltip>
                }
                classes={{ root: classes.tabRoot }}
              />
              <Tab 
                icon={
                  <Tooltip title={i18n.t("contactDrawer.tabs.settings")}>
                    <SettingsIcon className={classes.tabIcon} />
                  </Tooltip>
                }
                classes={{ root: classes.tabRoot }}
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Paper 
              square 
              elevation={0}
              variant="outlined" 
              sx={{ borderRadius: 2, p: 2 }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 'medium'
                }}
              >
                <NotesIcon sx={{ mr: 1, fontSize: 20 }} />
                {i18n.t("ticketOptionsMenu.appointmentsModal.title")}
              </Typography>
              <ContactNotes ticket={ticket} handleDrawerClose={handleDrawerClose}/>
            </Paper>
          </TabPanel>

          {hasAppointments && (
            <TabPanel value={tabValue} index={1}>
              <Paper 
                square 
                elevation={0}
                variant="outlined" 
                sx={{ borderRadius: 2, p: 2 }}
              >
                <ContactAppointments contactId={contactData.id} />
              </Paper>
            </TabPanel>
          )}
          
          {/* Nova aba para participantes do grupo */}
          {isGroup && (
            <TabPanel value={tabValue} index={hasAppointments ? 2 : 1}>
              <Paper 
                square 
                elevation={0}
                variant="outlined" 
                sx={{ borderRadius: 2, p: 2 }}
              >
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    color: theme.palette.primary.main,
                    fontWeight: 'medium'
                  }}
                >
                  <GroupIcon sx={{ mr: 1, fontSize: 20 }} />
                  {i18n.t("contactDrawer.groupParticipants")} 
                  <Chip 
                    label={participants.length} 
                    size="small" 
                    sx={{ ml: 1 }} 
                    color="primary"
                  />
                </Typography>
                
                {loadingParticipants ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <Typography color="textSecondary">
                      {i18n.t("contactDrawer.loadingParticipants")}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box mb={2}>
                      <TextField
                        placeholder={i18n.t("contactDrawer.searchParticipants")}
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    
                    <Paper variant="outlined" sx={{ maxHeight: 350, overflow: 'auto' }}>
                      <List>
                        {filteredParticipants.length === 0 ? (
                          <ListItem>
                            <ListItemText
                              primary={i18n.t("contactDrawer.noParticipantsFound")}
                              secondary={searchTerm ? i18n.t("contactDrawer.tryAnotherSearch") : i18n.t("contactDrawer.noParticipantsInGroup")}
                            />
                          </ListItem>
                        ) : (
                          filteredParticipants.map((participant, index) => (
                            <React.Fragment key={participant.id}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar>
                                    {(participant.name && participant.name[0]) ? participant.name[0].toUpperCase() : 'U'}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Box display="flex" alignItems="center">
                                      <Typography variant="body1">
                                        {participant.name || (participant.id ? participant.id.split('@')[0] : 'Usuário')}
                                      </Typography>
                                      {isAdmin(participant) && (
                                        <Chip
                                          size="small"
                                          color="primary"
                                          icon={<AdminIcon />}
                                          label={i18n.t("contactDrawer.admin")}
                                          style={{ marginLeft: 8 }}
                                        />
                                      )}
                                    </Box>
                                  }
                                  secondary={participant.id ? participant.id.split('@')[0] : ''}
                                />
                              </ListItem>
                              {index < filteredParticipants.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                          ))
                        )}
                      </List>
                    </Paper>
                  </>
                )}
              </Paper>
            </TabPanel>
          )}

          <TabPanel value={tabValue} index={getInfoTabIndex()}>
            <Paper 
              square 
              elevation={0}
              variant="outlined" 
              sx={{ borderRadius: 2, p: 2 }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 'medium'
                }}
              >
                <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
                {i18n.t("contactDrawer.extraInfo")}
              </Typography>

              {contactData?.extraInfo?.length ? (
                contactData.extraInfo.map(info => (
                  <Paper
                    key={info.id}
                    square
                    variant="outlined"
                    className={classes.contactExtraInfo}
                    sx={{ mb: 1 }}
                  >
                    <InputLabel>{info.name}</InputLabel>
                    <Typography component="div" noWrap style={{ paddingTop: 2 }}>
                      <WhatsMarkedWrapper>{info.value}</WhatsMarkedWrapper>
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: theme.palette.background.default,
                    borderRadius: theme.shape.borderRadius,
                    border: `1px dashed ${theme.palette.divider}`,
                    minHeight: 100
                  }}
                >
                  <InfoIcon sx={{ mb: 1, color: theme.palette.text.secondary, fontSize: 32 }} />
                  <Typography variant="body2" color="textSecondary" align="center">
                    {i18n.t("contactDrawer.noExtraInfo")}
                  </Typography>
                </Box>
              )}

              {renderEmployerSection()}
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={getSettingsTabIndex()}>
            <Paper 
              square 
              elevation={0}
              variant="outlined" 
              sx={{ borderRadius: 2, p: 2 }}
            >
              <Typography
                variant="subtitle1"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 'medium'
                }}
              >
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                {i18n.t("contactDrawer.settings")}
              </Typography>

              <Box 
                sx={{ 
                  p: 2,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: theme.shape.borderRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="body1">
                  {i18n.t("contactModal.form.disableBot")}
                </Typography>
                <Switch
                  size="small"
                  checked={disableBot}
                  onChange={() => handleContactToggleDisableBot()}
                  name="disableBot"
                  color="primary"
                />
              </Box>
            </Paper>
          </TabPanel>

          <ContactModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            contactId={contactData.id}
          />
        </div>
      )}
    </Drawer>
  );
  
  // Função auxiliar para calcular o índice da aba de informações
  function getInfoTabIndex() {
    let index = 1; // Índice base (após a aba de Notas)
    if (hasAppointments) index++;
    if (isGroup) index++;
    return index;
  }
  
  // Função auxiliar para calcular o índice da aba de configurações
  function getSettingsTabIndex() {
    let index = 2; // Índice base (após as abas de Notas e Info)
    if (hasAppointments) index++;
    if (isGroup) index++;
    return index;
  }
};

export default ContactDrawer;