import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Paper,
  Box,
  InputAdornment,
  IconButton,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSpring, animated } from "react-spring";
import { makeStyles } from "@mui/styles";
import { toast } from "../../../helpers/toast";
import useSettings from "../../../hooks/useSettings";
import { i18n } from "../../../translate/i18n";
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon
} from "@mui/icons-material";

const AnimatedPaper = animated(Paper);
const StyledPaper = styled(AnimatedPaper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    padding: theme.spacing(2),
    maxWidth: 1200,
    margin: '0 auto'
  },
  fieldContainer: {
    marginBottom: theme.spacing(2)
  }
}));

export default function StripeSettings() {
  const classes = useStyles();
  const { getAll: getAllSettings, update } = useSettings();
  const [showSecrets, setShowSecrets] = useState({
    publicKey: false,
    secretKey: false,
    webhookSecret: false
  });

  const [stripeSettings, setStripeSettings] = useState({
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: ''
  });

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 500 }
  });

  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const settings = await getAllSettings();
        const initialSettings = settings.reduce((acc, setting) => {
          if (setting.key.startsWith("_stripe")) {
            acc[setting.key.substring(1)] = setting.value;
          }
          return acc;
        }, {});
        setStripeSettings(initialSettings);
      } catch (error) {
        toast.error(i18n.t("settings.loadError"));
      }
    };

    loadInitialSettings();
  }, []);

  const handleSaveSetting = async (key, value) => {
    try {
      await update({
        key: `_${key}`,
        value
      });
      toast.success(i18n.t("settings.success"));
    } catch (error) {
      toast.error(i18n.t("settings.saveError"));
    }
  };

  const handleChange = (key) => (event) => {
    const { value } = event.target;
    setStripeSettings(prev => ({ ...prev, [key]: value }));
    handleSaveSetting(key, value);
  };

  const toggleShowSecret = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getWebhookUrl = () => {
    return `${window.location.protocol}//${window.location.host}/subscription/webhook`;
  };

  return (
    <Box className={classes.mainContainer}>
      <animated.div style={fadeIn}>
        <Typography variant="h4" gutterBottom>
          {i18n.t("stripe.title")}
        </Typography>

        <StyledPaper elevation={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                className={classes.fieldContainer}
                fullWidth
                label={i18n.t("stripe.publicKey")}
                variant="outlined"
                value={stripeSettings.stripePublicKey || ""}
                onChange={handleChange('stripePublicKey')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={i18n.t("stripe.publicKeyTooltip")} arrow>
                        <InfoIcon />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                className={classes.fieldContainer}
                fullWidth
                label={i18n.t("stripe.secretKey")}
                variant="outlined"
                type={showSecrets.secretKey ? 'text' : 'password'}
                value={stripeSettings.stripeSecretKey || ""}
                onChange={handleChange('stripeSecretKey')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={i18n.t("stripe.secretKeyTooltip")} arrow>
                        <InfoIcon />
                      </Tooltip>
                      <IconButton
                        onClick={() => toggleShowSecret('secretKey')}
                        edge="end"
                      >
                        {showSecrets.secretKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                className={classes.fieldContainer}
                fullWidth
                label={i18n.t("stripe.webhookSecret")}
                variant="outlined"
                type={showSecrets.webhookSecret ? 'text' : 'password'}
                value={stripeSettings.stripeWebhookSecret || ""}
                onChange={handleChange('stripeWebhookSecret')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={i18n.t("stripe.webhookSecretTooltip")} arrow>
                        <InfoIcon />
                      </Tooltip>
                      <IconButton
                        onClick={() => toggleShowSecret('webhookSecret')}
                        edge="end"
                      >
                        {showSecrets.webhookSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                className={classes.fieldContainer}
                fullWidth
                label={i18n.t("stripe.webhookUrl")}
                variant="outlined"
                value={getWebhookUrl()}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={i18n.t("stripe.webhookUrlTooltip")} arrow>
                        <InfoIcon />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </StyledPaper>
      </animated.div>
    </Box>
  );
}