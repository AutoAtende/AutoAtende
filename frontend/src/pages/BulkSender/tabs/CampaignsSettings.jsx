import React, { useEffect, useState, useContext } from "react";
import { useTheme, styled } from "@mui/material/styles";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";

// Material UI
import {
  Paper,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  useMediaQuery,
} from "@mui/material";

// Icons
import {
  DeleteOutline as DeleteOutlineIcon,
  Save as SaveIcon,
  Add as AddIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

// Componentes
import ConfirmationModal from "../../../components/ConfirmationModal";

// API
import api from "../../../services/api";

// Componentes estilizados
const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
  ...theme.scrollbarStyles,
  display: "flex",
  flexDirection: "column",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const FormSection = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  overflow: "visible", // Garante que o conteúdo não seja cortado
}));

const VariablesSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const WarningAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.warning.lighter,
  color: theme.palette.warning.dark,
  '& .MuiAlert-icon': {
    color: theme.palette.warning.main,
  },
}));

const initialSettings = {
  messageInterval: 5,
  longerIntervalAfter: 30,
  greaterInterval: 20,
  variables: [],
};

const CampaignsSettings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const companyId = user.companyId;

  // Estados
  const [settings, setSettings] = useState(initialSettings);
  const [showVariableForm, setShowVariableForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });
  const [saving, setSaving] = useState(false);

  // Carregar configurações
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/campaign-settings", {
          params: { companyId }
        });
        
        if (Array.isArray(data) && data.length > 0) {
          const settingsList = [];
          data.forEach((item) => {
            settingsList.push([item.key, JSON.parse(item.value)]);
          });
          setSettings(Object.fromEntries(settingsList));
        }
      } catch (err) {
        toast.error(i18n.t("campaignsConfig.toasts.fetchError"));
      }
    };

    fetchSettings();
  }, [companyId]);

  // Handlers
  const handleChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    if (variable.key.trim() === "" || variable.value.trim() === "") {
      toast.error(i18n.t("campaignsConfig.toasts.emptyVariable"));
      return;
    }

    setSettings((prev) => {
      const variablesExists = prev.variables.filter(
        (v) => v.key === variable.key
      );
      
      const variables = [...prev.variables];
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      } else {
        toast.error(i18n.t("campaignsConfig.toasts.duplicatedVariable"));
      }
      
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
    setConfirmationOpen(false);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.post("/campaign-settings", { settings });
      toast.success(i18n.t("campaignsConfig.toasts.success"));
    } catch (err) {
      toast.error(i18n.t("campaignsConfig.toasts.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainPaper elevation={0} variant="outlined">
      <ConfirmationModal
        title={i18n.t("campaignsConfig.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaignsConfig.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <SectionTitle variant="h6">
        {i18n.t("campaignsConfig.title")}
      </SectionTitle>

      {/* Seção de Configurações de Intervalo - Ajustada para melhor visualização em dispositivos móveis */}
      <FormSection variant="outlined">
        <CardContent sx={{ 
          overflow: "visible", 
          p: isMobile ? 1.5 : 2 // Reduz o padding em dispositivos móveis
        }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {i18n.t("campaignsConfig.intervalSettings.title")}
          </Typography>
          
          {/* Stack em vez de Grid para dispositivos muito pequenos */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row", 
            gap: 2, 
            width: "100%",
            mt: 1
          }}>
            {/* Primeiro item - Intervalo entre mensagens */}
            <Box sx={{ flex: 1, minWidth: isMobile ? "100%" : "30%" }}>
              <FormControl
                variant="outlined"
                fullWidth
                size="small" // Sempre use small para economizar espaço
              >
                <InputLabel id="messageInterval-label">
                  {i18n.t("campaignsConfig.intervalSettings.messageInterval")}
                </InputLabel>
                <Select
                  name="messageInterval"
                  id="messageInterval"
                  labelId="messageInterval-label"
                  label={i18n.t("campaignsConfig.intervalSettings.messageInterval")}
                  value={settings.messageInterval}
                  onChange={handleChangeSettings}
                >
                  <MenuItem value={0}>{i18n.t("campaignsConfig.intervalSettings.noInterval")}</MenuItem>
                  <MenuItem value={1}>1 {i18n.t("campaignsConfig.intervalSettings.second")}</MenuItem>
                  <MenuItem value={5}>5 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={10}>10 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={15}>15 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={20}>20 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Segundo item - Intervalo mais longo após */}
            <Box sx={{ flex: 1, minWidth: isMobile ? "100%" : "30%" }}>
              <FormControl
                variant="outlined"
                fullWidth
                size="small"
              >
                <InputLabel id="longerIntervalAfter-label">
                  {i18n.t("campaignsConfig.intervalSettings.longerIntervalAfter")}
                </InputLabel>
                <Select
                  name="longerIntervalAfter"
                  id="longerIntervalAfter"
                  labelId="longerIntervalAfter-label"
                  label={i18n.t("campaignsConfig.intervalSettings.longerIntervalAfter")}
                  value={settings.longerIntervalAfter}
                  onChange={handleChangeSettings}
                >
                  <MenuItem value={0}>{i18n.t("campaignsConfig.intervalSettings.notDefined")}</MenuItem>
                  <MenuItem value={10}>10 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={15}>15 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={20}>20 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={30}>30 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={40}>40 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={60}>60 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={80}>80 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={100}>100 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                  <MenuItem value={120}>120 {i18n.t("campaignsConfig.intervalSettings.sends")}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Terceiro item - Intervalo maior */}
            <Box sx={{ flex: 1, minWidth: isMobile ? "100%" : "30%" }}>
              <FormControl
                variant="outlined"
                fullWidth
                size="small"
              >
                <InputLabel id="greaterInterval-label">
                  {i18n.t("campaignsConfig.intervalSettings.greaterInterval")}
                </InputLabel>
                <Select
                  name="greaterInterval"
                  id="greaterInterval"
                  labelId="greaterInterval-label"
                  label={i18n.t("campaignsConfig.intervalSettings.greaterInterval")}
                  value={settings.greaterInterval}
                  onChange={handleChangeSettings}
                >
                  <MenuItem value={0}>{i18n.t("campaignsConfig.intervalSettings.noInterval")}</MenuItem>
                  <MenuItem value={1}>1 {i18n.t("campaignsConfig.intervalSettings.second")}</MenuItem>
                  <MenuItem value={5}>5 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={10}>10 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={15}>15 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={20}>20 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={30}>30 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={40}>40 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={60}>60 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={80}>80 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={100}>100 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                  <MenuItem value={120}>120 {i18n.t("campaignsConfig.intervalSettings.seconds")}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </FormSection>

      <VariablesSection>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {i18n.t("campaignsConfig.variables.title")}
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowVariableForm(!showVariableForm)}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
            sx={{ mt: isMobile ? 1 : 0 }}
          >
            {i18n.t("campaignsConfig.variables.add")}
          </Button>
        </Box>

        {showVariableForm && (
          <FormSection variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label={i18n.t("campaignsConfig.variables.shortcut")}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    name="key"
                    value={variable.key}
                    onChange={handleChangeVariable}
                    placeholder={i18n.t("campaignsConfig.variables.shortcutPlaceholder")}
                  />
                </Grid>
                
                <Grid item xs={12} sm={5}>
                  <TextField
                    label={i18n.t("campaignsConfig.variables.content")}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    name="value"
                    value={variable.value}
                    onChange={handleChangeVariable}
                    placeholder={i18n.t("campaignsConfig.variables.contentPlaceholder")}
                  />
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    height: '100%', 
                    alignItems: 'center', 
                    gap: 1,
                    flexDirection: isMobile ? 'row' : 'column',
                    justifyContent: isMobile ? 'flex-end' : 'center',
                    mt: isMobile ? 1 : 0
                  }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={addVariable}
                      fullWidth={isMobile}
                      size={isMobile ? "small" : "medium"}
                    >
                      {i18n.t("campaignsConfig.variables.addButton")}
                    </Button>
                    
                    {isMobile && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setShowVariableForm(false)}
                        size="small"
                      >
                        {i18n.t("campaignsConfig.variables.cancel")}
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </FormSection>
        )}

        {settings.variables.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <FormSection variant="outlined">
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={isMobile ? "10%" : "5%"}></TableCell>
                      <TableCell>{i18n.t("campaignsConfig.variables.shortcut")}</TableCell>
                      <TableCell>{i18n.t("campaignsConfig.variables.content")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settings.variables.map((v, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedKey(v.key);
                              setConfirmationOpen(true);
                            }}
                            color="error"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {"{" + v.key + "}"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {v.value}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </FormSection>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary">
                {i18n.t("campaignsConfig.variables.empty")}
              </Typography>
            </Paper>
          </Box>
        )}
      </VariablesSection>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mt: 3,
        width: '100%'
      }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          disabled={saving}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
        >
          {i18n.t("campaignsConfig.saveButton")}
        </Button>
      </Box>

      <WarningAlert severity="warning" icon={<InfoOutlinedIcon />}>
        <AlertTitle>{i18n.t("campaignsConfig.warning.title")}</AlertTitle>
        
        <Typography variant="body2" paragraph>
          {i18n.t("campaignsConfig.warning.content1")}
        </Typography>
        
        <Typography variant="body2" paragraph>
          {i18n.t("campaignsConfig.warning.content2")}
        </Typography>
        
        <Typography variant="body2" paragraph>
          {i18n.t("campaignsConfig.warning.content3")}
        </Typography>
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            {i18n.t("campaignsConfig.warning.regards")}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {i18n.t("campaignsConfig.warning.team")} {theme.appName}
          </Typography>
        </Box>
      </WarningAlert>
    </MainPaper>
  );
};

export default CampaignsSettings;