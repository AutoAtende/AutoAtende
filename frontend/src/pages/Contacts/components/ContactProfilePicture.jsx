import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { 
  Avatar, 
  Badge, 
  CircularProgress, 
  IconButton, 
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { green } from '@mui/material/colors';

import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import { generateColor } from "../../../helpers/colorGenerator";
import { getInitials } from "../../../helpers/getInitials";

// Styled Components com padrão Standard responsivo
const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'size'
})(({ theme, size = 60 }) => ({
  width: size,
  height: size,
  fontSize: size * 0.4, // Proporção do texto baseada no tamanho
  fontWeight: 'bold',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
    : '0 4px 12px rgba(0, 0, 0, 0.15)',
  border: `2px solid ${theme.palette.background.paper}`,
  [theme.breakpoints.down('sm')]: {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'transparent',
    padding: 0,
    minWidth: 'auto',
    height: 'auto'
  },
  '& .MuiBadge-anchorOriginBottomRight': {
    bottom: '15%',
    right: '15%',
    transform: 'scale(1) translate(50%, 50%)',
    [theme.breakpoints.down('sm')]: {
      bottom: '10%',
      right: '10%',
    }
  }
}));

const RefreshButton = styled(IconButton)(({ theme, size }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  width: size > 80 ? 32 : 28,
  height: size > 80 ? 32 : 28,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[600]
  },
  '& .MuiSvgIcon-root': {
    fontSize: size > 80 ? '1rem' : '0.875rem'
  },
  [theme.breakpoints.down('sm')]: {
    width: 24,
    height: 24,
    '& .MuiSvgIcon-root': {
      fontSize: '0.75rem'
    }
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
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.7)' 
    : 'rgba(255, 255, 255, 0.8)',
  borderRadius: '50%',
  zIndex: 10,
  backdropFilter: 'blur(2px)'
}));

const AvatarContainer = styled('div')({
  position: 'relative',
  display: 'inline-block'
});

// Componente de Botão de Refresh otimizado
const ProfilePictureRefreshButton = memo(({ loading, onClick, size }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Tooltip 
      title="Atualizar foto de perfil" 
      arrow 
      placement="top"
      enterDelay={isMobile ? 0 : 500}
    >
      <RefreshButton
        onClick={onClick}
        disabled={loading}
        size={size}
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:active': {
            transform: 'scale(0.95)',
          }
        }}
      >
        <RefreshIcon 
          sx={{ 
            animation: loading ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': {
                transform: 'rotate(0deg)',
              },
              '100%': {
                transform: 'rotate(360deg)',
              },
            }
          }} 
        />
      </RefreshButton>
    </Tooltip>
  );
});

ProfilePictureRefreshButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  size: PropTypes.number.isRequired
};

// Componente de Loading otimizado
const LoadingIndicator = memo(({ size }) => {
  const theme = useTheme();
  
  return (
    <LoadingOverlay size={size}>
      <CircularProgress 
        size={size ? Math.min(size/2, 30) : 24} 
        thickness={6} 
        sx={{ 
          color: green[500],
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }} 
      />
    </LoadingOverlay>
  );
});

LoadingIndicator.propTypes = {
  size: PropTypes.number
};

const ContactProfilePicture = ({
  contactNumber,
  name,
  size = 60,
  onUpdateComplete,
  showRefreshButton = true,
  profilePicUrl,
  className,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(false);
  const [updatedPicUrl, setUpdatedPicUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Responsividade do tamanho baseada na tela
  const responsiveSize = isMobile && size > 100 ? Math.min(size, 80) : size;

  const handleUpdateProfilePic = useCallback(async () => {
    if (!contactNumber || loading) return;
    
    setLoading(true);
    setImageError(false);
    
    try {
      const formattedNumber = contactNumber.replace(/\D/g, "");
      
      if (formattedNumber.length < 8) {
        throw new Error('Número de telefone inválido');
      }
      
      const { data } = await api.get(`/contacts/profile-pic/${formattedNumber}`);
      
      if (data?.profilePicUrl) {
        setUpdatedPicUrl(data.profilePicUrl);
        onUpdateComplete?.(data);
        toast.success('Foto de perfil atualizada com sucesso');
      } else {
        toast.info('Nenhuma foto encontrada para este contato');
      }
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar foto de perfil';
      toast.error(errorMessage);
      setImageError(true);
    } finally {
      setLoading(false);
    }
  }, [contactNumber, loading, onUpdateComplete]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setUpdatedPicUrl(null);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  // Determinar a fonte da imagem
  const avatarSrc = !imageError ? (updatedPicUrl || profilePicUrl) : null;
  const avatarColor = !avatarSrc ? generateColor(contactNumber || name) : undefined;
  const avatarInitials = !avatarSrc ? getInitials(name) : '';
  
  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        showRefreshButton && contactNumber && (
          <ProfilePictureRefreshButton 
            loading={loading} 
            onClick={handleUpdateProfilePic}
            size={responsiveSize}
          />
        )
      }
      className={className}
      sx={sx}
    >
      <AvatarContainer>
        <StyledAvatar
          src={avatarSrc}
          imgProps={{ 
            loading: "lazy",
            onError: handleImageError,
            onLoad: handleImageLoad
          }}
          size={responsiveSize}
          sx={{ 
            backgroundColor: avatarColor,
            color: "white", 
            fontWeight: "bold",
            cursor: showRefreshButton ? 'pointer' : 'default',
            transition: 'all 0.2s ease-in-out',
            '&:hover': showRefreshButton ? {
              transform: 'scale(1.02)',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 6px 16px rgba(0, 0, 0, 0.5)' 
                : '0 6px 16px rgba(0, 0, 0, 0.2)',
            } : {},
            // Garantir que o texto seja sempre visível
            '& .MuiAvatar-fallback': {
              width: '60%',
              height: '60%'
            }
          }}
          onClick={showRefreshButton && !loading ? handleUpdateProfilePic : undefined}
        >
          {avatarInitials}
        </StyledAvatar>
        
        {loading && <LoadingIndicator size={responsiveSize} />}
      </AvatarContainer>
    </StyledBadge>
  );
};

ContactProfilePicture.propTypes = {
  contactNumber: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  onUpdateComplete: PropTypes.func,
  showRefreshButton: PropTypes.bool,
  profilePicUrl: PropTypes.string,
  className: PropTypes.string,
  sx: PropTypes.object
};

export default memo(ContactProfilePicture);