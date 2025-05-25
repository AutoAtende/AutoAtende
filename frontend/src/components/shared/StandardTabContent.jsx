import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Divider,
  Breadcrumbs,
  Link,
  Chip,
  useMediaQuery
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components
const TabContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const TabHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2)
  }
}));

const TabTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.125rem'
  }
}));

const TabDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  marginTop: theme.spacing(0.5)
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const ContentArea = styled(Box)(({ theme, variant }) => ({
  flex: 1,
  overflow: 'hidden', // Remove overflow para evitar múltiplas barras de rolagem
  display: 'flex',
  flexDirection: 'column',
  ...(variant === 'paper' && {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'
  }),
  ...(variant === 'padded' && {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2)
    }
  })
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(0.5)
  }
}));

// Componente de Estatísticas
const TabStats = ({ stats = [] }) => {
  if (!stats.length) return null;

  return (
    <StatsContainer>
      {stats.map((stat, index) => (
        <Chip
          key={index}
          icon={stat.icon}
          label={stat.label}
          size="small"
          color={stat.color || 'default'}
          variant={stat.variant || 'outlined'}
          sx={{ 
            fontWeight: 500,
            '& .MuiChip-icon': {
              fontSize: '0.875rem'
            }
          }}
        />
      ))}
    </StatsContainer>
  );
};

// Componente de Navegação (Breadcrumbs)
const TabBreadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="navegação"
      sx={{ 
        fontSize: '0.875rem',
        '& .MuiBreadcrumbs-separator': {
          marginX: 0.5
        }
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link
              color="inherit"
              href={item.href}
              onClick={item.onClick}
              sx={{ 
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {item.label}
            </Link>
          ) : (
            <Typography color="text.primary" fontSize="inherit">
              {item.label}
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Breadcrumbs>
  );
};

// Componente de Alerta Customizado
const TabAlert = ({ 
  severity = 'info', 
  title, 
  message, 
  action,
  dismissible = false,
  onDismiss,
  sx = {}
}) => {
  const icons = {
    info: <InfoIcon fontSize="small" />,
    warning: <WarningIcon fontSize="small" />,
    error: <ErrorIcon fontSize="small" />,
    success: <SuccessIcon fontSize="small" />
  };

  return (
    <Alert
      severity={severity}
      icon={icons[severity]}
      action={action}
      onClose={dismissible ? onDismiss : undefined}
      sx={{
        '& .MuiAlert-message': {
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        },
        ...sx
      }}
    >
      {title && (
        <Typography variant="subtitle2" component="div" gutterBottom>
          {title}
        </Typography>
      )}
      {message && (
        <Typography variant="body2">
          {message}
        </Typography>
      )}
    </Alert>
  );
};

// Componente Principal
const StandardTabContent = ({
  title,
  description,
  icon,
  breadcrumbs = [],
  stats = [],
  alerts = [],
  actions,
  variant = 'default', // 'default', 'paper', 'padded'
  loading = false,
  children,
  contentProps = {},
  headerProps = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TabContainer>
      {/* Cabeçalho da Aba */}
      {(title || description || breadcrumbs.length > 0 || stats.length > 0) && (
        <TabHeader {...headerProps}>
          {/* Navegação (Breadcrumbs) */}
          <TabBreadcrumbs items={breadcrumbs} />

          {/* Título e Ações */}
          {(title || actions) && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              gap={2}
            >
              <Box flex={1}>
                {title && (
                  <TabTitle>
                    {icon && icon}
                    {title}
                  </TabTitle>
                )}
                {description && (
                  <TabDescription>
                    {description}
                  </TabDescription>
                )}
                <TabStats stats={stats} />
              </Box>

              {actions && (
                <Box
                  display="flex"
                  gap={1}
                  flexWrap="wrap"
                  sx={{
                    [theme.breakpoints.down('sm')]: {
                      width: '100%',
                      justifyContent: 'stretch',
                      '& > *': {
                        flex: 1
                      }
                    }
                  }}
                >
                  {actions}
                </Box>
              )}
            </Box>
          )}

          {/* Alertas */}
          {alerts.map((alert, index) => (
            <TabAlert
              key={index}
              severity={alert.severity}
              title={alert.title}
              message={alert.message}
              action={alert.action}
              dismissible={alert.dismissible}
              onDismiss={alert.onDismiss}
              sx={alert.sx}
            />
          ))}
        </TabHeader>
      )}

      {/* Divisor */}
      {(title || description || breadcrumbs.length > 0 || alerts.length > 0) && (
        <Divider sx={{ mb: 3 }} />
      )}

      {/* Área de Conteúdo */}
      <ContentWrapper>
        <ContentArea variant={variant} {...contentProps}>
          {children}
        </ContentArea>
      </ContentWrapper>
    </TabContainer>
  );
};

StandardTabContent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func
    })
  ),
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      color: PropTypes.string,
      variant: PropTypes.string
    })
  ),
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
      title: PropTypes.string,
      message: PropTypes.string,
      action: PropTypes.node,
      dismissible: PropTypes.bool,
      onDismiss: PropTypes.func,
      sx: PropTypes.object
    })
  ),
  actions: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'paper', 'padded']),
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  contentProps: PropTypes.object,
  headerProps: PropTypes.object
};

export default StandardTabContent;