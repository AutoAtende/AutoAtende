import React, { useState, useEffect, useRef } from "react";
import { i18n } from "../../../translate/i18n";
import {
  TextField,
  Typography,
  Box,
  Chip,
  CircularProgress,
  FormHelperText,
  Autocomplete,
  Avatar,
  Badge,
  IconButton
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from "@mui/icons-material";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import BaseModal from "../../../components/shared/BaseModal";

const CreateGroupModal = ({ open, onClose }) => {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open, searchTerm]);

  const fetchContacts = async () => {
    if (!open) return;
    
    setLoadingContacts(true);
    try {
      const { data } = await api.get("/contacts", {
        params: { searchParam: searchTerm }
      });
      setContacts(data.contacts);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setParticipants([]);
    setErrors({});
    setProfilePic(null);
    setProfilePicPreview("");
    onClose();
  };

  const handleProfilePicClick = () => {
    fileInputRef.current.click();
  };

  const handleProfilePicChange = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setProfilePic(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview("");
  };

  const handleSave = async () => {
    const newErrors = {};
    
    if (!title || title.trim() === "") {
      newErrors.title = i18n.t("groups.errors.titleRequired");
    }
    
    if (participants.length === 0) {
      newErrors.participants = i18n.t("groups.errors.participantsRequired");
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      const formattedParticipants = participants.map(p => p.number);
      
      const { data: newGroup } = await api.post("/groups", {
        title,
        participants: formattedParticipants
      });
      
      if (profilePic && newGroup && newGroup.id) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('profilePic', profilePic);
        
        await api.post(`/groups/${newGroup.id}/profile-pic`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      toast.success(i18n.t("groups.createSuccess"));
      handleClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleAddParticipant = (event, contact) => {
    if (!contact) return;
    
    if (!participants.find(p => p.id === contact.id)) {
      setParticipants([...participants, contact]);
    }
    
    if (errors.participants) {
      setErrors({...errors, participants: undefined});
    }
  };

  const handleRemoveParticipant = (contactId) => {
    setParticipants(participants.filter(p => p.id !== contactId));
  };

  const modalActions = [
    {
      label: i18n.t("cancel"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      disabled: loading || uploadingImage,
      icon: <CancelIcon />
    },
    {
      label: loading || uploadingImage ? i18n.t("loading") : i18n.t("save"),
      onClick: handleSave,
      variant: "contained",
      color: "primary",
      disabled: loading || uploadingImage,
      icon: loading || uploadingImage ? <CircularProgress size={20} /> : <SaveIcon />
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={i18n.t("groups.createNewGroup")}
      actions={modalActions}
      loading={loading}
    >
      <Box mb={3} display="flex" flexDirection="column" alignItems="center">
        {profilePicPreview ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton 
                size="small" 
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  } 
                }}
                onClick={handleRemoveProfilePic}
                disabled={loading || uploadingImage}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
          >
            <Avatar 
              sx={{ width: 100, height: 100, mb: 1 }}
              src={profilePicPreview}
            />
          </Badge>
        ) : (
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
                onClick={handleProfilePicClick}
                disabled={loading}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            }
          >
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mb: 1, 
                bgcolor: 'primary.light',
                color: 'primary.dark'
              }}
            >
              <PhotoCameraIcon fontSize="large" />
            </Avatar>
          </Badge>
        )}
        
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {profilePicPreview 
            ? i18n.t("groups.groupPhotoSelected") 
            : i18n.t("groups.addGroupPhoto")}
        </Typography>
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfilePicChange}
        />
      </Box>

      <Box mb={3}>
        <TextField
          label={i18n.t("groups.groupName")}
          placeholder={i18n.t("groups.groupNamePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          error={Boolean(errors.title)}
          helperText={errors.title}
          variant="outlined"
          disabled={loading}
        />
      </Box>
      
      <Box mb={3}>
        <Autocomplete
          options={contacts}
          getOptionLabel={(option) => `${option.name} (${option.number})`}
          onChange={handleAddParticipant}
          loading={loadingContacts}
          renderInput={(params) => (
            <TextField
              {...params}
              label={i18n.t("groups.addParticipants")}
              placeholder={i18n.t("groups.searchContacts")}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              error={Boolean(errors.participants)}
            />
          )}
        />
        {errors.participants && (
          <FormHelperText error>{errors.participants}</FormHelperText>
        )}
      </Box>
      
      <Box>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {i18n.t("groups.selectedParticipants")} ({participants.length})
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1}>
          {participants.map((participant) => (
            <Chip
              key={participant.id}
              avatar={
                <Avatar>
                  {participant.name ? participant.name[0].toUpperCase() : "C"}
                </Avatar>
              }
              label={`${participant.name} (${participant.number})`}
              onDelete={() => handleRemoveParticipant(participant.id)}
              variant="outlined"
            />
          ))}
          
          {participants.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              {i18n.t("groups.noParticipantsSelected")}
            </Typography>
          )}
        </Box>
      </Box>
    </BaseModal>
  );
};

export default CreateGroupModal;