import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Tab, 
  Tabs, 
  Paper,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(4), // Adicionado margem superior maior
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2), // Margem menor em mobile
  }
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.75rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  }
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(0.5), // Ajuste fino para alinhar com o título
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    marginTop: 0,
  }
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  width: '33%',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '50%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  }
}));

const TabsContainer = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const TabPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  }
}));

// Componente de Botão Responsivo
const ResponsiveActionButton = ({ 
  label, 
  icon, 
  onClick, 
  variant = "contained", 
  color = "primary",
  disabled = false,
  tooltip,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const button = (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      startIcon={!isMobile ? icon : null}
      sx={{
        minWidth: isMobile ? 'auto' : 'auto',
        padding: isMobile ? theme.spacing(1) : theme.spacing(1, 2),
        borderRadius: '8px', // Cantos arredondados
        ...(isMobile && {
          '& .MuiButton-startIcon': {
            margin: 0
          }
        })
      }}
      {...props}
    >
      {isMobile ? icon : label}
    </Button>
  );

  return isMobile && tooltip ? (
    <Tooltip title={tooltip || label} arrow>
      {button}
    </Tooltip>
  ) : button;
};

ResponsiveActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  tooltip: PropTypes.string
};

// Componente Principal
const StandardPageLayout = ({
  title,
  actions = [],
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Pesquisar...",
  showSearch = true,
  tabs = [],
  activeTab = 0,
  onTabChange,
  children,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <PageContainer>
      {/* Cabeçalho da Página */}
      <PageHeader>
        <PageTitle variant="h4" component="h1">
          {title}
        </PageTitle>
        
        {actions.length > 0 && (
          <ActionButtonsContainer>
            {actions.map((action, index) => (
              <ResponsiveActionButton
                key={index}
                label={action.label}
                icon={action.icon}
                onClick={action.onClick}
                variant={action.variant || "contained"}
                color={action.color || "primary"}
                disabled={action.disabled || loading}
                tooltip={action.tooltip}
              />
            ))}
          </ActionButtonsContainer>
        )}
      </PageHeader>

      {/* Campo de Pesquisa */}
      {showSearch && (
        <SearchContainer>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
            }}
          />
        </SearchContainer>
      )}

      {/* Abas (se fornecidas) */}
      {tabs.length > 0 && (
        <TabsContainer>
          <Tabs
            value={activeTab}
            onChange={onTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              backgroundColor: theme.palette.background.paper,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{
                  '& .MuiTab-iconWrapper': {
                    marginRight: theme.spacing(1),
                    marginBottom: 0,
                  }
                }}
              />
            ))}
          </Tabs>
        </TabsContainer>
      )}

      {/* Área de Conteúdo */}
      <ContentArea>
        {tabs.length > 0 ? (
          <TabPanel>
            {children}
          </TabPanel>
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {children}
          </Box>
        )}
      </ContentArea>
    </PageContainer>
  );
};

StandardPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      color: PropTypes.string,
      disabled: PropTypes.bool,
      tooltip: PropTypes.string
    })
  ),
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  showSearch: PropTypes.bool,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node
    })
  ),
  activeTab: PropTypes.number,
  onTabChange: PropTypes.func,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool
};

export default StandardPageLayout;