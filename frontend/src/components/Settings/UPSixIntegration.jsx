import React, { useMemo } from 'react';
import { 
  Paper, 
  FormGroup, 
  FormControlLabel, 
  Switch, 
  FormHelperText, 
  Grid, 
  Typography, 
  Box, 
  Divider, 
  useTheme, 
  Avatar, 
  Tooltip 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { i18n } from "../../translate/i18n";
import { useSpring, animated } from "react-spring";

// Componentes estilizados usando styled API do MUI 5
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8]
  }
}));

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  fontSize: '0.875rem'
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0)
}));

const StyledTitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginLeft: theme.spacing(1)
}));

const StyledSubOption = styled(Grid)(({ theme }) => ({
  marginLeft: theme.spacing(3),
  marginTop: theme.spacing(1)
}));

const StyledBadge = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 36,
  height: 36,
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  }
}));

// Componente animado
const AnimatedSwitch = animated(Switch);

const UPSixIntegration = ({ 
  enableUPSix, 
  onEnableUPSix,
  enableUPSixWebphone,
  onEnableUPSixWebphone,
  enableUPSixNotifications,
  onEnableUPSixNotifications
}) => {
  const theme = useTheme();
  
  // Animação para os switches
  const switchAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { tension: 300, friction: 20 }
  });

  // Textos informativos
  const helperTexts = useMemo(() => ({
    main: i18n.t("integrations.upsix.mainHelperText") || 
      "Ativa ou desativa a integração com o serviço de telefonia UPSix, permitindo recursos de webphone e gravações.",
    webphone: i18n.t("integrations.upsix.webphoneHelperText") || 
      "Habilita o webphone UPSix diretamente na interface de atendimento, permitindo realizar e receber chamadas.",
    notifications: i18n.t("integrations.upsix.notificationsHelperText") || 
      "Envia notificações automáticas para administradores e supervisores quando novas gravações são realizadas."
  }), []);

  // Rótulos
  const labels = useMemo(() => ({
    main: i18n.t("integrations.upsix.mainLabel") || "Habilitar integração com UPSix",
    webphone: i18n.t("integrations.upsix.webphoneLabel") || "Ativar telefonia na tela de atendimento",
    notifications: i18n.t("integrations.upsix.notificationsLabel") || "Ativar notificações de gravações para admin/supervisor"
  }), []);

  return (
    <StyledPaper elevation={3} variant="outlined">
      <StyledTitleContainer>
        <StyledBadge>
          <PhoneIcon fontSize="small" sx={{ color: 'white' }} />
        </StyledBadge>
        <StyledTitle variant="h6">
          UPSix Integração
        </StyledTitle>
        <Tooltip title="A integração com o UPSix permite adicionar funcionalidades de telefonia ao sistema, incluindo chamadas, transferências e gravações.">
          <InfoIcon fontSize="small" sx={{ ml: 1, color: theme.palette.info.main }} />
        </Tooltip>
      </StyledTitleContainer>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={enableUPSix === "enabled"}
                  color="primary"
                  onChange={(e) => onEnableUPSix(e.target.checked ? "enabled" : "disabled")}
                />
              }
              label={labels.main}
            />
            <StyledFormHelperText>
              {helperTexts.main}
            </StyledFormHelperText>
          </FormGroup>
        </Grid>

        {enableUPSix === "enabled" && (
          <>
            <Grid item xs={12}>
              <StyledDivider />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Configurações da integração
              </Typography>
            </Grid>

            <StyledSubOption item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <AnimatedSwitch
                      style={switchAnimation}
                      checked={enableUPSixWebphone === "enabled"}
                      color="primary"
                      onChange={(e) => onEnableUPSixWebphone(e.target.checked ? "enabled" : "disabled")}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                      {labels.webphone}
                    </Box>
                  }
                />
                <StyledFormHelperText>
                  {helperTexts.webphone}
                </StyledFormHelperText>
              </FormGroup>
            </StyledSubOption>

            <StyledSubOption item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <AnimatedSwitch
                      style={switchAnimation}
                      checked={enableUPSixNotifications === "enabled"}
                      color="primary"
                      onChange={(e) => onEnableUPSixNotifications(e.target.checked ? "enabled" : "disabled")}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NotificationsIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                      {labels.notifications}
                    </Box>
                  }
                />
                <StyledFormHelperText>
                  {helperTexts.notifications}
                </StyledFormHelperText>
              </FormGroup>
            </StyledSubOption>
          </>
        )}
      </Grid>
    </StyledPaper>
  );
};

export default React.memo(UPSixIntegration);