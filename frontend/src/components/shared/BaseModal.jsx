import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';

// Componentes estilizados
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    margin: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      maxHeight: '100%',
      maxWidth: '100%',
      borderRadius: 0,
    },
  },
}));

const StyledDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const TitleText = styled(Typography)(({ theme, isMobile }) => ({
  flex: 1,
  ...(isMobile ? theme.typography.subtitle1 : theme.typography.h6),
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const BaseModal = ({
  open,
  onClose,
  title,
  children,
  actions = [],
  maxWidth = 'md',
  helpText,
  loading = false,
  sx = {} // Adicionado a prop sx com valor padrão
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderActionButtons = () => {
    return actions.map((action, index) => (
      <ActionButton
        key={index}
        onClick={action.onClick}
        variant={action.variant || 'text'}
        color={action.color || 'primary'}
        disabled={loading || action.disabled}
        startIcon={action.icon}
        size={isMobile ? 'small' : 'medium'}
      >
        {!isMobile && action.label}
      </ActionButton>
    ));
  };

  return (
    <StyledDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={isMobile}
      sx={sx}
    >
      <StyledDialogTitle>
        <TitleText isMobile={isMobile}>
          {title}
        </TitleText>
        <IconContainer>
          {helpText && (
            <Tooltip title={helpText}>
              <IconButton
                size="small"
                onClick={(e) => e.preventDefault()}
                sx={{ color: 'primary.contrastText' }}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            disabled={loading}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </IconContainer>
      </StyledDialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>

      {actions.length > 0 && (
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {renderActionButtons()}
        </DialogActions>
      )}
    </StyledDialog>
  );
};

BaseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    onClick: PropTypes.func,
    variant: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.node
  })),
  maxWidth: PropTypes.string,
  helpText: PropTypes.string,
  loading: PropTypes.bool,
  sx: PropTypes.object
};

export default React.memo(BaseModal);