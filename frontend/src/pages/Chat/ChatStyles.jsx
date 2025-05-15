import { styled } from '@mui/material/styles';
import { Box, Paper, IconButton, TextField } from '@mui/material';
import { animated } from 'react-spring';

export const ChatContainer = styled(Paper)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 8,
  boxShadow: '0px 3px 5px rgba(0,0,0,0.2)'
});

export const MessageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
  backgroundSize: '20px 20px',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: '3px',
    backgroundColor: theme.palette.primary.main
  }
}));

export const InputContainer = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper
}));

export const MessageBubble = styled(animated.div)(({ theme, isOwn }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '70%',
  padding: '12px',
  marginBottom: '8px',
  borderRadius: '8px',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  backgroundColor: isOwn ? theme.palette.primary.main : '#f5f5f5',
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    [isOwn ? 'right' : 'left']: -10,
    borderStyle: 'solid',
    borderWidth: '10px 10px 0 0',
    borderColor: `${isOwn ? theme.palette.primary.main : '#f5f5f5'} transparent transparent transparent`,
    transform: isOwn ? 'none' : 'scaleX(-1)'
  }
}));

export const MediaPreview = styled(Box)({
  maxWidth: '300px',
  maxHeight: '200px',
  margin: '8px',
  position: 'relative',
  borderRadius: '8px',
  overflow: 'hidden',
  '& img, & video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
});

export const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: theme.palette.action.hover
  }
}));

export const MessageHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '4px'
});

export const MessageTime = styled(Box)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: '4px',
  alignSelf: 'flex-end'
}));

export const MessageActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-32px',
  right: 0,
  display: 'flex',
  gap: '4px',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '4px',
  padding: '4px',
  boxShadow: theme.shadows[2],
  '&:hover': {
    opacity: 1
  }
}));

export const StyledInput = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1]
    }
  }
}));

// Animações como constantes
export const messageAnimation = {
  from: { 
    opacity: 0, 
    transform: 'translateY(20px)'
  },
  to: { 
    opacity: 1, 
    transform: 'translateY(0)'
  },
  config: { 
    tension: 300, 
    friction: 20 
  }
};

export const floatingAnimation = {
  from: { transform: 'translateY(0)' },
  loop: true,
  to: [
    { transform: 'translateY(-4px)' },
    { transform: 'translateY(4px)' }
  ],
  config: { 
    tension: 300, 
    friction: 10 
  }
};