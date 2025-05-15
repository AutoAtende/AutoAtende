import React, { useState } from 'react';
import { 
  Avatar,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ProfileImageModal = ({ 
  contact,
  generateColor,
  getInitials,
  className 
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (contact?.profilePicUrl) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Avatar
        sx={{ 
          backgroundColor: generateColor(contact?.number || ''), 
          color: "white", 
          fontWeight: "bold",
          img: { loading: "lazy" },
          cursor: contact?.profilePicUrl ? 'pointer' : 'default'
        }}
        className={className}
        src={contact?.profilePicUrl}
        alt="contact_image"
        onClick={handleOpen}
      >
        {getInitials(contact?.name || '')}
      </Avatar>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={contact?.profilePicUrl}
            alt={contact?.name || 'Profile'}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileImageModal;