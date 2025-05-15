import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Typography,
  Box,
  Tabs,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Chip,
  Paper,
  InputAdornment,
  FormHelperText,
  Snackbar,
  Alert,
  FormGroup,
  Autocomplete,
  Button,
  useTheme
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  PersonRemove as PersonRemoveIcon,
  AdminPanelSettings as AdminIcon,
  PersonAddAlt1 as PersonAddIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Search as SearchIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import BaseModal from "../../../components/shared/BaseModal";

const GroupInfoModal = ({ open, onClose, group }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState([]);
  const [onlyAdminsMessage, setOnlyAdminsMessage] = useState(false);
  const [onlyAdminsSettings, setOnlyAdminsSettings] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [copiedSnack, setCopiedSnack] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newParticipants, setNewParticipants] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [subjectChanged, setSubjectChanged] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmRemoveProfilePic, setConfirmRemoveProfilePic] = useState(false);
  

  useEffect(() => {
    if (open && group) {
      loadGroupInfo();
    }
  }, [open, group]);

  const loadGroupInfo = async () => {
    if (!group) return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/groups/${group.id}`);
      
      setSubject(data.subject || "");
      setDescription(data.description || "");
      
      // Verifica configurações do grupo
      if (data.settings) {
        const announceMode = data.settings.find(s => s === "announcement" || s === "not_announcement");
        const lockMode = data.settings.find(s => s === "locked" || s === "unlocked");
        
        setOnlyAdminsMessage(announceMode === "announcement");
        setOnlyAdminsSettings(lockMode === "locked");
      }
      
      // Verificar se há uma imagem de perfil e adicionar timestamp para evitar cache
      if (data.profilePic) {
        const timestamp = new Date().getTime();
        setProfilePic(`${process.env.REACT_APP_BACKEND_URL}${data.profilePic}?t=${timestamp}`);
      } else {
        setProfilePic("");
      }
      
      // Parse participants JSON
      let parsedParticipants = [];
      try {
        if (data.participantsJson) {
          if (typeof data.participantsJson === 'string') {
            parsedParticipants = JSON.parse(data.participantsJson);
          } else if (Array.isArray(data.participantsJson)) {
            parsedParticipants = data.participantsJson;
          }
        }
      } catch (e) {
        console.error("Erro ao parsear participantes:", e);
        parsedParticipants = [];
      }
      
      setParticipants(parsedParticipants);
      
      // Verifica se há um link de convite
      if (data.inviteLink) {
        setInviteCode(data.inviteLink);
        setInviteUrl(data.inviteLink);
      }
      
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetInviteCode = async () => {
    if (!group) return;
    
    setInviteLoading(true);
    try {
      const { data } = await api.get(`/groups/${group.id}/invite`);
      if (data && data.inviteLink) {
        setInviteCode(data.inviteLink);
        setInviteUrl(data.inviteLink);
      } else {
        toast.error(i18n.t("groups.errors.inviteCodeFailed"));
      }
    } catch (err) {
      toast.error(err);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInviteCode = async () => {
    if (!group) return;
    
    setInviteLoading(true);
    try {
      const { data } = await api.put(`/groups/${group.id}/invite`);
      setInviteCode(data.inviteLink);
      setInviteUrl(data.inviteLink);
      toast.success(i18n.t("groups.inviteCodeRevoked"));
    } catch (err) {
      toast.error(err);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedSnack(true);
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
    
    // Carrega o código de convite quando a aba de convite é acessada
    if (newValue === 2 && !inviteCode) {
      handleGetInviteCode();
    }
  };

  const handleClose = () => {
    setActiveTab(0);
    setInviteCode("");
    setInviteUrl("");
    setErrors({});
    setMenuAnchorEl(null);
    setSelectedParticipant(null);
    onClose();
  };

  const handleSaveInfo = async () => {
    // Validação
    const newErrors = {};
    
    if (!subject || subject.trim() === "") {
      newErrors.subject = i18n.t("groups.errors.subjectRequired");
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      // Salvar alterações em chamadas separadas
      if (subjectChanged) {
        await api.put(`/groups/${group.id}/subject`, { subject });
      }
      
      if (descriptionChanged) {
        await api.put(`/groups/${group.id}/description`, { description });
      }
      
      if (settingsChanged) {
        const setting = onlyAdminsMessage ? "announcement" : "not_announcement";
        await api.put(`/groups/${group.id}/settings`, { setting });
        
        const lockSetting = onlyAdminsSettings ? "locked" : "unlocked";
        await api.put(`/groups/${group.id}/settings`, { setting: lockSetting });
      }
      
      toast.success(i18n.t("groups.updateSuccess"));
      
      // Reset flags
      setSubjectChanged(false);
      setDescriptionChanged(false);
      setSettingsChanged(false);
      
      // Recarregar informações do grupo
      loadGroupInfo();
      
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfilePicClick = () => {
    fileInputRef.current.click();
  };
  
  const handleProfilePicChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profilePic', file);
    
    setUploadingImage(true);
    try {
      const { data } = await api.post(`/groups/${group.id}/profile-pic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Força atualização da imagem evitando cache
      const timestamp = new Date().getTime();
      setProfilePic(`${process.env.REACT_APP_BACKEND_URL}${data.profilePic}?t=${timestamp}`);
      toast.success(i18n.t("groups.profilePicSuccess"));
      
    } catch (err) {
      toast.error(err);
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleRemoveProfilePic = async () => {
    setUploadingImage(true);
    try {
      await api.delete(`/groups/${group.id}/profile-pic`);
      setProfilePic("");
      toast.success(i18n.t("groups.profilePicRemoved"));
      handleCloseRemoveProfilePicConfirm();
    } catch (err) {
      toast.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenRemoveProfilePicConfirm = () => {
    setConfirmRemoveProfilePic(true);
  };
  
  const handleCloseRemoveProfilePicConfirm = () => {
    setConfirmRemoveProfilePic(false);
  };
  


  const handleAddParticipants = async () => {
    if (newParticipants.length === 0) {
      toast.error(i18n.t("groups.errors.selectParticipants"));
      return;
    }
    
    setLoading(true);
    try {
      const formattedParticipants = newParticipants.map(p => p.number);
      
      await api.post(`/groups/${group.id}/participants`, {
        participants: formattedParticipants
      });
      
      toast.success(i18n.t("groups.participantsAdded"));
      setNewParticipants([]);
      
      // Recarregar informações do grupo
      loadGroupInfo();
      
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenParticipantMenu = (event, participant) => {
    setSelectedParticipant(participant);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseParticipantMenu = () => {
    setMenuAnchorEl(null);
  };

  const handlePromoteParticipant = async () => {
    if (!selectedParticipant) return;
    
    setLoading(true);
    try {
      await api.put(`/groups/${group.id}/participants/promote`, {
        participants: [selectedParticipant.id]
      });
      
      toast.success(i18n.t("groups.participantPromoted"));
      handleCloseParticipantMenu();
      
      // Recarregar informações do grupo
      loadGroupInfo();
      
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoteParticipant = async () => {
    if (!selectedParticipant) return;
    
    setLoading(true);
    try {
      await api.put(`/groups/${group.id}/participants/demote`, {
        participants: [selectedParticipant.id]
      });
      
      toast.success(i18n.t("groups.participantDemoted"));
      handleCloseParticipantMenu();
      
      // Recarregar informações do grupo
      loadGroupInfo();
      
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

// Em GroupInfoModal.jsx - Função handleRemoveParticipant

const handleRemoveParticipant = async () => {
  if (!selectedParticipant || !selectedParticipant.id) {
    toast.error(i18n.t("groups.errors.invalidParticipant"));
    handleCloseParticipantMenu();
    return;
  }
  
  setLoading(true);
  try {
    // Garantir que estamos enviando um participante válido
    const participantId = selectedParticipant.id;
    
    console.log(`Tentando remover participante: ${participantId}`);
    
    await api.delete(`/groups/${group.id}/participants`, {
      data: { participants: [participantId] }
    });
    
    toast.success(i18n.t("groups.participantRemoved"));
    handleCloseParticipantMenu();
    
    // Recarregar informações do grupo
    loadGroupInfo();
    
  } catch (err) {
    console.error("Erro ao remover participante:", err);
    toast.error(i18n.t("groups.errors.failedToRemove"));
  } finally {
    setLoading(false);
  }
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

  const modalActions = activeTab === 0 ? [
    {
      label: i18n.t("cancel"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      disabled: loading,
      icon: <CancelIcon />
    },
    {
      label: loading ? i18n.t("saving") : i18n.t("save"),
      onClick: handleSaveInfo,
      variant: "contained",
      color: "primary",
      disabled: loading || (!subjectChanged && !descriptionChanged && !settingsChanged),
      icon: loading ? <CircularProgress size={20} /> : <SaveIcon />
    }
  ] : [
    {
      label: i18n.t("close"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      disabled: loading,
      icon: <CancelIcon />
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={loading ? `${i18n.t("loading")}...` : `${i18n.t("groups.groupInfo")}: ${subject}`}
      actions={modalActions}
      loading={loading}
    >
      <Tabs
        value={activeTab}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label={i18n.t("groups.tabs.info")} />
        <Tab label={i18n.t("groups.tabs.participants")} />
        <Tab label={i18n.t("groups.tabs.inviteLink")} />
      </Tabs>
      
      <Box>
        {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
        
        {!loading && activeTab === 0 && (
          <Box>
<Box mb={3} display="flex" flexDirection="column" alignItems="center">
  <Badge
    overlap="circular"
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    badgeContent={
      <IconButton 
        size="small" 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark',
          } 
        }}
        onClick={profilePic ? handleOpenRemoveProfilePicConfirm : handleProfilePicClick}
        disabled={uploadingImage}
      >
        {uploadingImage ? (
          <CircularProgress size={20} color="inherit" />
        ) : profilePic ? (
          <DeleteIcon fontSize="small" />
        ) : (
          <EditIcon fontSize="small" />
        )}
      </IconButton>
    }
  >
    <Avatar 
      sx={{ width: 100, height: 100, mb: 1, cursor: 'pointer' }}
      src={profilePic}
      onClick={handleProfilePicClick}
    >
      {subject ? subject.substring(0, 2).toUpperCase() : "GP"}
    </Avatar>
  </Badge>
  
  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
    {profilePic 
      ? i18n.t("groups.clickToChangePhoto") 
      : i18n.t("groups.clickToAddPhoto")}
  </Typography>
  
  <input
    type="file"
    ref={fileInputRef}
    accept="image/*"
    style={{ display: 'none' }}
    onChange={handleProfilePicChange}
  />
</Box>

            <TextField
              label={i18n.t("groups.groupName")}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setSubjectChanged(true);
              }}
              fullWidth
              error={Boolean(errors.subject)}
              helperText={errors.subject}
              variant="outlined"
              margin="normal"
            />
            
            <TextField
              label={i18n.t("groups.description")}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionChanged(true);
              }}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              margin="normal"
            />
            
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                {i18n.t("groups.settings")}
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlyAdminsMessage}
                      onChange={(e) => {
                        setOnlyAdminsMessage(e.target.checked);
                        setSettingsChanged(true);
                      }}
                      color="primary"
                    />
                  }
                  label={i18n.t("groups.onlyAdminsMessage")}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlyAdminsSettings}
                      onChange={(e) => {
                        setOnlyAdminsSettings(e.target.checked);
                        setSettingsChanged(true);
                      }}
                      color="primary"
                    />
                  }
                  label={i18n.t("groups.onlyAdminsSettings")}
                />
              </FormGroup>
            </Box>
          </Box>
        )}
        
        {!loading && activeTab === 1 && (
          <Box>
            <Box mb={2}>
              <TextField
                placeholder={i18n.t("groups.searchParticipants")}
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
            
            <Paper variant="outlined">
              <List>
                {filteredParticipants.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary={i18n.t("groups.noParticipantsFound")}
                      secondary={i18n.t("groups.tryAnotherSearch")}
                    />
                  </ListItem>
                ) : (
                  filteredParticipants.map((participant, index) => (
                    <React.Fragment key={participant.id}>
                      <ListItem key={participant.id}>
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
          label={i18n.t("groups.admin")}
          style={{ marginLeft: 8 }}
        />
      )}
    </Box>
  }
  secondary={participant.id ? participant.id.split('@')[0] : ''}
/>
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => handleOpenParticipantMenu(e, participant)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredParticipants.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
            
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                {i18n.t("groups.addNewParticipants")}
              </Typography>
              
              <Box mb={2}>
                <Autocomplete
                  multiple
                  options={contacts}
                  getOptionLabel={(option) => `${option.name} (${option.number})`}
                  onChange={(event, newValue) => {
                    setNewParticipants(newValue);
                  }}
                  loading={loadingContacts}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={i18n.t("groups.selectContacts")}
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingContacts ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        avatar={<Avatar>{option.name[0].toUpperCase()}</Avatar>}
                        label={`${option.name} (${option.number})`}
                        {...getTagProps({ index })}
                        variant="outlined"
                      />
                    ))
                  }
                />
              </Box>
              
              <Box display="flex" justifyContent="flex-start">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleAddParticipants}
                  disabled={newParticipants.length === 0}
                >
                  {i18n.t("groups.addParticipants")}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        
        {!loading && activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t("groups.inviteLink")}
            </Typography>
            
            <Box mb={3}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {i18n.t("groups.inviteLinkDescription")}
              </Typography>
            </Box>
            
            {inviteLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={30} />
              </Box>
            ) : inviteCode ? (
              <Box>
                <Paper variant="outlined" style={{ padding: 16 }}>
                  <Typography variant="body1">
                    {inviteUrl}
                  </Typography>
                </Paper>
                
                <Box display="flex" mt={2} gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyInviteLink}
                  >
                    {i18n.t("groups.copyLink")}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RefreshIcon />}
                    onClick={handleRevokeInviteCode}
                  >
                    {i18n.t("groups.revokeAndGenerate")}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={handleGetInviteCode}
                >
                  {i18n.t("groups.generateInviteLink")}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      {/* Menu de opções para participantes */}
      <Menu
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseParticipantMenu}
      >
        {selectedParticipant && !isAdmin(selectedParticipant) && (
          <MenuItem onClick={handlePromoteParticipant}>
            <ListItemIcon>
              <ArrowUpwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t("groups.promoteToAdmin")} />
          </MenuItem>
        )}
        
        {selectedParticipant && isAdmin(selectedParticipant) && (
          <MenuItem onClick={handleDemoteParticipant}>
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t("groups.demoteFromAdmin")} />
          </MenuItem>
        )}
        
        {selectedParticipant && (
          <MenuItem onClick={handleRemoveParticipant}>
            <ListItemIcon>
              <PersonRemoveIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary={i18n.t("groups.removeParticipant")} style={{ color: '#f44336' }} />
          </MenuItem>
        )}
      </Menu>
      
      {/* Snackbar para cópia de link */}
      <Snackbar
        open={copiedSnack}
        autoHideDuration={3000}
        onClose={() => setCopiedSnack(false)}
      >
        <Alert onClose={() => setCopiedSnack(false)} severity="success">
          {i18n.t("groups.linkCopied")}
        </Alert>
      </Snackbar>

      <Dialog
  open={confirmRemoveProfilePic}
  onClose={handleCloseRemoveProfilePicConfirm}
  aria-labelledby="remove-profile-pic-dialog-title"
>
  <DialogTitle id="remove-profile-pic-dialog-title">
    {i18n.t("groups.removeProfilePicConfirm")}
  </DialogTitle>
  <DialogContent>
    <DialogContentText>
      {i18n.t("groups.removeProfilePicMessage")}
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={handleCloseRemoveProfilePicConfirm} 
      color="primary"
      disabled={uploadingImage}
    >
      {i18n.t("cancel")}
    </Button>
    <Button 
      onClick={handleRemoveProfilePic} 
      color="error" 
      variant="contained"
      disabled={uploadingImage}
      startIcon={uploadingImage ? <CircularProgress size={20} /> : <DeleteIcon />}
    >
      {i18n.t("remove")}
    </Button>
  </DialogActions>
</Dialog>

    </BaseModal>
  );
};

export default GroupInfoModal;