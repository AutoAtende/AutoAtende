import React, { useState, useCallback, memo } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Avatar, 
  Badge, 
  CircularProgress, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { green } from '@mui/material/colors';

import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";

const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'size'
})(({ theme, size = 60 }) => ({
  width: size,
  height: size
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'transparent',
    padding: 0
  }
}));

const RefreshButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[300]
  }
}));

const LoadingOverlay = styled('div')(({ theme, size = 60 }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '50%',
  zIndex: 10
}));

const AvatarContainer = styled('div')({
  position: 'relative'
});

const ProfilePictureRefreshButton = memo(({ loading, onClick }) => (
  <Tooltip title="Atualizar foto de perfil">
    <RefreshButton
      onClick={onClick}
      size="small"
      disabled={loading}
    >
      <RefreshIcon fontSize="small" />
    </RefreshButton>
  </Tooltip>
));

const LoadingIndicator = memo(({ size }) => (
  <LoadingOverlay>
    <CircularProgress 
      size={size ? size/2 : 30} 
      thickness={6} 
      sx={{ color: green[500] }} 
    />
  </LoadingOverlay>
));

const ContactProfilePicture = ({
  contactNumber,
  name,
  size = 60,
  onUpdateComplete,
  showRefreshButton = true,
  profilePicUrl
}) => {
  const [loading, setLoading] = useState(false);
  const [updatedPicUrl, setUpdatedPicUrl] = useState(null);

  const handleUpdateProfilePic = useCallback(async () => {
    if (!contactNumber || loading) return;
    
    setLoading(true);
    
    try {
      const formattedNumber = contactNumber.replace(/\D/g, "");
      const { data } = await api.get(`/contacts/profile-pic/${formattedNumber}`);
      
      if (data?.profilePicUrl) {
        setUpdatedPicUrl(data.profilePicUrl);
        onUpdateComplete?.(data);
      }
      
      toast.success('Foto de perfil atualizada com sucesso');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar foto de perfil');
    } finally {
      setLoading(false);
    }
  }, [contactNumber, loading, onUpdateComplete]);

  const avatarSrc = updatedPicUrl || profilePicUrl;
  const avatarColor = !avatarSrc ? generateColor(contactNumber) : undefined;
  
  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        showRefreshButton && (
          <ProfilePictureRefreshButton 
            loading={loading} 
            onClick={handleUpdateProfilePic} 
          />
        )
      }
    >
      <AvatarContainer>
        <StyledAvatar
          src={avatarSrc}
          imgProps={{ loading: "lazy" }}
          size={size}
          sx={{ 
            backgroundColor: avatarColor,
            color: "white", 
            fontWeight: "bold"
          }}
        >
          {!avatarSrc && getInitials(name)}
        </StyledAvatar>
        
        {loading && <LoadingIndicator size={size} />}
      </AvatarContainer>
    </StyledBadge>
  );
};

export default memo(ContactProfilePicture);