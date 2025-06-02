import React, { useEffect, useState, useRef } from "react";
import { i18n } from "../../../translate/i18n";
import { useSpring, animated, config } from "react-spring";
import { Grid, Typography, TextField, IconButton, InputAdornment, Paper } from "@mui/material";
import { AttachFile, Delete } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { toast } from "../../../helpers/toast";
import useSettings from "../../../hooks/useSettings";
import api from "../../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  formContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    boxShadow: theme.shadows[3],
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
  uploadInput: {
    display: "none",
  },
  instructionBox: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    boxShadow: theme.shadows[3],
    height: "100%",
    overflowY: "auto",
  },
  instructionText: {
    marginBottom: theme.spacing(1),
  },
}));

const AnimatedTextField = animated(TextField);
const AnimatedPaper = animated(Paper);

export default function EfiSettings({ settings }) {
  const classes = useStyles();
  const [efiSettings, setEfiSettings] = useState({});
  const efiCertificateFileInput = useRef(null);
  const { update } = useSettings();

  const formAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(50px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: config.gentle,
  });

  const instructionsAnimation = useSpring({
    from: { opacity: 0, transform: "translateX(50px)" },
    to: { opacity: 1, transform: "translateX(0px)" },
    config: config.gentle,
    delay: 300,
  });

  useEffect(() => {
    if (Array.isArray(settings)) {
      const newSettings = {};
      settings.forEach((setting) => {
        if (setting.key.startsWith("_efi")) {
          newSettings[setting.key.substring(1)] = setting.value;
        }
      });
      setEfiSettings(newSettings);
    }
  }, [settings]);

  const uploadPrivate = async (e, key) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("settingKey", key);

    try {
      const response = await api.post("/settings/privateFile", formData, {
        onUploadProgress: (event) => {
          const progress = Math.round((event.loaded * 100) / event.total);
          console.log(`Upload ${progress}%`);
        },
      });
      setEfiSettings((prev) => ({ ...prev, [key]: response.data }));
      toast.success(i18n.t("efi.fileUploadSuccess"));
    } catch (err) {
      console.error(i18n.t("efi.fileUploadError"), err);
      toast.error(i18n.t("efi.fileUploadError"));
    }
  };

  const handleSaveSetting = async (key) => {
    if (typeof efiSettings[key] !== "string") return;
    await update({ key: `_${key}`, value: efiSettings[key] });
    toast.success(i18n.t("efi.settingUpdateSuccess"));
  };

  const setSetting = (key, value) => {
    setEfiSettings((prev) => ({ ...prev, [key]: value }));
  };

  const storeAndSetSetting = async (key, value) => {
    await update({ key: `_${key}`, value });
    setSetting(key, value);
  };

  const renderTextField = (id, label, name) => (
    <AnimatedTextField
      style={formAnimation}
      className={classes.fieldContainer}
      fullWidth
      id={id}
      label={i18n.t(label)}
      variant="outlined"
      name={name}
      size="small"
      value={efiSettings[name] || ""}
      onChange={(e) => setSetting(name, e.target.value)}
      onBlur={() => handleSaveSetting(name)}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );

  return (
    <Grid container spacing={3} className={classes.root}>
      <Grid item xs={12} md={6}>
        <AnimatedPaper style={formAnimation} className={classes.formContainer}>
          <Typography variant="h5" gutterBottom>
            {i18n.t("efi.efiSettings")}
          </Typography>
          <AnimatedTextField
            style={formAnimation}
            className={classes.fieldContainer}
            fullWidth
            id="efi-certificate-upload-field"
            label={i18n.t("efi.certificate")}
            variant="outlined"
            value={efiSettings.efiCertFile || ""}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {efiSettings.efiCertFile && (
                    <IconButton
                      size="small"
                      onClick={() => storeAndSetSetting("efiCertFile", "")}
                    >
                      <Delete />
                    </IconButton>
                  )}
                  <input
                    type="file"
                    id="upload-efi-certificate-button"
                    ref={efiCertificateFileInput}
                    className={classes.uploadInput}
                    onChange={(e) => uploadPrivate(e, "efiCertFile")}
                  />
                  <label htmlFor="upload-efi-certificate-button">
                    <IconButton
                      size="small"
                      component="span"
                      onClick={() => efiCertificateFileInput.current.click()}
                    >
                      <AttachFile />
                    </IconButton>
                  </label>
                </InputAdornment>//
              ),
            }}
          />
          {renderTextField("efiClientIdField", "efi.clientId", "efiClientId")}
          {renderTextField("efiClientSecretField", "efi.clientSecret", "efiClientSecret")}
          {renderTextField("efiPixKeyField", "efi.pixKey", "efiPixKey")}
        </AnimatedPaper>
      </Grid>
      <Grid item xs={12} md={6}>
        <AnimatedPaper style={instructionsAnimation} className={classes.instructionBox}>
          <Typography variant="h6" gutterBottom>
            {i18n.t("efi.efiApiConfigInstructions")}
          </Typography>
          {i18n.t("efi.efiInstructions", { returnObjects: true }).map((instruction, index) => (
            <Typography key={index} className={classes.instructionText}>
              {`${index + 1}. ${instruction}`}
            </Typography>
          ))}
        </AnimatedPaper>
      </Grid>
    </Grid>
  );
}