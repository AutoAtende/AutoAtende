import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../helpers/toast";

import {
  Button,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  TextField,
  Grid,
  Paper,
  Typography,
  Alert,
  Box,
} from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';
import { green } from "@mui/material/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  btnLeft: {
    display: "flex",
    marginRight: "auto",
    marginLeft: 12,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
  infoBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.lighter || theme.palette.primary.light,
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(2, 0)
  }
}));

const QueueIntegration = ({ open, onClose, integrationId }) => {
  const classes = useStyles();
  const [flowsList, setFlowsList] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [loadingAssistants, setLoadingAssistants] = useState(false);
  const [scheduleSettingsExists, setScheduleSettingsExists] = useState(false);

  const initialState = {
    type: "typebot",
    name: "",
    projectName: "",
    jsonContent: "",
    language: "",
    urlN8N: "",
    n8nApiKey: "",
    typebotDelayMessage: 1000,
    typebotExpires: 1,
    typebotKeywordFinish: "",
    typebotKeywordRestart: "",
    typebotRestartMessage: "",
    typebotSlug: "",
    typebotUnknownMessage: "",
    flowId: "",
    assistantId: "",
  };

  const [integration, setIntegration] = useState(initialState);

  useEffect(() => {
    (async () => {
      if (!integrationId) return;
      try {
        const { data } = await api.get(`/queueIntegration/${integrationId}`);
        setIntegration((prevState) => {
          return { ...prevState, ...data };
        });

        // Se for uma integração do tipo flowbuilder, carregar a lista de fluxos
        if (data.type === "flowbuilder") {
          await fetchFlows();
          // Se houver um ID de fluxo no jsonContent, defini-lo como flowId
          if (data.jsonContent) {
            setIntegration((prevState) => {
              return { ...prevState, flowId: data.jsonContent };
            });
          }
        }

        // Se for uma integração do tipo assistant, carregar a lista de assistentes
        if (data.type === "assistant") {
          await fetchAssistants();
        }

      } catch (err) {
        toast.error(err);
      }
    })();

    // Verificar se as configurações de agendamento existem
    checkScheduleSettings();

    return () => {
      setIntegration({
        type: "dialogflow",
        name: "",
        projectName: "",
        jsonContent: "",
        language: "",
        urlN8N: "",
        n8nApiKey: "",
        typebotDelayMessage: 1000,
        flowId: "",
        assistantId: "",
      });
    };

  }, [integrationId, open]);

  // Verificar se as configurações de agendamento estão configuradas
  const checkScheduleSettings = async () => {
    try {
      const { data } = await api.get('/schedule/settings');
      setScheduleSettingsExists(!!data);
    } catch (err) {
      console.error("Erro ao verificar configurações de agendamento:", err);
      setScheduleSettingsExists(false);
    }
  };

  // Carregar a lista de fluxos quando o tipo flowbuilder for selecionado
  const fetchFlows = async () => {
    setLoadingFlows(true);
    try {
      const { data } = await api.get('/flow-builder');
      setFlowsList(data.flows || []);
    } catch (err) {
      toast.error(i18n.t("queueIntegrationModal.messages.flowsError") || "Erro ao carregar fluxos");
    } finally {
      setLoadingFlows(false);
    }
  };

  // Carregar a lista de assistentes quando o tipo assistant for selecionado
  const fetchAssistants = async () => {
    setLoadingAssistants(true);
    try {
      const { data } = await api.get('/assistants');
      setAssistants(data.assistants || []);
    } catch (err) {
      toast.error("Erro ao carregar assistentes");
    } finally {
      setLoadingAssistants(false);
    }
  };

  const handleClose = () => {
    onClose();
    setIntegration(initialState);
  };

  const handleTestSession = async (event, values) => {
    try {
      const { projectName, jsonContent, language } = values;

      await api.post(`/queueIntegration/testSession`, {
        projectName,
        jsonContent,
        language,
      });

      toast.success(i18n.t("queueIntegrationModal.messages.testSuccess"));
    } catch (err) {
      toast.error(err);
    }
  };

  const handleSaveDialogflow = async (values) => {
    try {
      if (values.type === 'n8n' || values.type === 'webhook' || values.type === 'typebot') {
        values.projectName = values.name
        if (!values?.name){
          toast.error('Nome obrigatório.')
          return
        }
      } else if (values.type === "flowbuilder") {
        // Para flowbuilder, usar o nome do fluxo selecionado
        if (!values.flowId) {
          toast.error('É necessário selecionar um fluxo.');
          return;
        }
        const selectedFlow = flowsList.find(flow => flow.id.toString() === values.flowId.toString());
        values.name = selectedFlow ? selectedFlow.name : "";
        values.projectName = values.name;
        
        // Salvar o ID do fluxo no campo jsonContent
        values.jsonContent = values.flowId.toString();
      } else if (values.type === "openAI") {
        values.projectName = 'OpenAI'
        values.name = 'OpenAI'
      } else if (values.type === "assistant") {
        // Para assistant, validar que assistente foi selecionado
        if (!values.assistantId) {
          toast.error('É necessário selecionar um assistente.');
          return;
        }
        
        // Usar o nome do assistente selecionado
        const selectedAssistant = assistants.find(assistant => assistant.id === values.assistantId);
        values.name = selectedAssistant ? selectedAssistant.name : "Agente";
        values.projectName = values.name;
        
        // Armazenar o ID do assistente no campo jsonContent para compatibilidade
        values.jsonContent = values.assistantId;
      }
      
      // Ensure projectName is not empty
      if (!values.projectName) {
        values.projectName = values.name || `Project_${Date.now()}`;
      }
  
      if (integrationId) {
        await api.put(`/queueIntegration/${integrationId}`, values);
        toast.success(i18n.t("queueIntegrationModal.messages.editSuccess"));
      } else {
        await api.post("/queueIntegration", values);
        toast.success(i18n.t("queueIntegrationModal.messages.addSuccess"));
      }
      handleClose();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error(i18n.t("queueIntegrationModal.messages.duplicateProjectName"));
      } else {
        toast.error(i18n.t("queueIntegrationModal.messages.unknownError"));
      }
    }
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
        <DialogTitle>
          {integrationId
            ? `${i18n.t("queueIntegrationModal.title.edit")}`
            : `${i18n.t("queueIntegrationModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={integration}
          enableReinitialize={true}
          // validationSchema={DialogflowSchema}
          onSubmit={(values, actions, event) => {
            setTimeout(() => {
              handleSaveDialogflow(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form>
              <Paper square className={classes.mainPaper} elevation={1}>
                <DialogContent dividers>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6} xl={6}>
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                        margin="dense"
                        fullWidth
                      >
                        <InputLabel id="type-selection-input-label">
                          {i18n.t("queueIntegrationModal.form.type")}
                        </InputLabel>

                        <Field
                          as={Select}
                          label={i18n.t("queueIntegrationModal.form.type")}
                          name="type"
                          labelId="profile-selection-label"
                          error={touched.type && Boolean(errors.type)}
                          helpertext={touched.type && errors.type}
                          id="type"
                          required
                          onChange={(e) => {
                            setFieldValue("type", e.target.value);
                            if (e.target.value === "flowbuilder") {
                              fetchFlows();
                            }
                            if (e.target.value === "assistant") {
                              fetchAssistants();
                            }
                          }}
                        >
                          <MenuItem value="dialogflow">DialogFlow</MenuItem>
                          <MenuItem value="n8n">n8n</MenuItem>
                          <MenuItem value="webhook">WebHooks</MenuItem>
                          <MenuItem value="typebot">Typebot</MenuItem>
                          <MenuItem value="openAI">OpenAI</MenuItem>
			                    <MenuItem value="flowbuilder">Flowbuilder</MenuItem>
                          <MenuItem value="assistant">Agente</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    {values.type === "dialogflow" && (
                      <>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.name")}
                            autoFocus
                            name="name"
                            fullWidth
                            error={touched.name && Boolean(errors.name)}
                            helpertext={touched.name && errors.name}
                            variant="outlined"
                            margin="dense"
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            margin="dense"
                            fullWidth
                          >
                            <InputLabel id="language-selection-input-label">
                              {i18n.t("queueIntegrationModal.form.language")}
                            </InputLabel>

                            <Field
                              as={Select}
                              label={i18n.t("queueIntegrationModal.form.language")}
                              name="language"
                              labelId="profile-selection-label"
                              fullWidth
                              error={touched.language && Boolean(errors.language)}
                              helpertext={touched.language && errors.language}
                              id="language-selection"
                              required
                            >
                              <MenuItem value="pt-BR">Portugues</MenuItem>
                              <MenuItem value="en">Inglês</MenuItem>
                              <MenuItem value="es">Español</MenuItem>
                            </Field>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.projectName")}
                            name="projectName"
                            error={touched.projectName && Boolean(errors.projectName)}
                            helpertext={touched.projectName && errors.projectName}
                            fullWidth
                            variant="outlined"
                            margin="dense"
                          />
                        </Grid>
                        <Grid item xs={12} md={12} xl={12} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.jsonContent")}
                            type="jsonContent"
                            multiline
                            //inputRef={greetingRef}
                            maxRows={5}
                            minRows={5}
                            fullWidth
                            name="jsonContent"
                            error={touched.jsonContent && Boolean(errors.jsonContent)}
                            helpertext={touched.jsonContent && errors.jsonContent}
                            variant="outlined"
                            margin="dense"
                          />
                        </Grid>
                      </>
                    )}

                    {(values.type === "n8n") && (
                      <>
                        <Grid item xs={12} md={6} xl={6}>
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.name")}
                            autoFocus
                            required
                            name="name"
                            error={touched.name && Boolean(errors.name)}
                            helpertext={touched.name && errors.name}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={12} xl={12}>
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.urlN8N")}
                            name="urlN8N"
                            error={touched.urlN8N && Boolean(errors.urlN8N)}
                            helpertext={touched.urlN8N && errors.urlN8N}
                            variant="outlined"
                            margin="dense"
                            required
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={12} xl={12}>
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.n8nApiKey")} // Novo campo
                            name="n8nApiKey"
                            error={touched.n8nApiKey && Boolean(errors.n8nApiKey)}
                            helpertext={touched.n8nApiKey && errors.n8nApiKey}
                            variant="outlined"
                            margin="dense"
                            required
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                      </>
                    )}

                    {(values.type === "webhook") && (
                      <>
                        <Grid item xs={12} md={6} xl={6}>
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.name")}
                            autoFocus
                            required
                            name="name"
                            error={touched.name && Boolean(errors.name)}
                            helpertext={touched.name && errors.name}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={12} xl={12}>
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.urlN8N")}
                            name="urlN8N"
                            error={touched.urlN8N && Boolean(errors.urlN8N)}
                            helpertext={touched.urlN8N && errors.urlN8N}
                            variant="outlined"
                            margin="dense"
                            required
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                      </>
                    )}
		    
                    {values.type === "flowbuilder" && (
                      <Grid item xs={12} md={6} xl={6}>
                        <FormControl
                          variant="outlined"
                          className={classes.formControl}
                          margin="dense"
                          fullWidth
                        >
                          <InputLabel id="flow-selection-input-label">
                            {i18n.t("queueIntegrationModal.form.selectFlow") || "Selecione um Fluxo"}
                          </InputLabel>
                          
                          <Field
                            as={Select}
                            label={i18n.t("queueIntegrationModal.form.selectFlow") || "Selecione um Fluxo"}
                            name="flowId"
                            labelId="flow-selection-label"
                            error={touched.flowId && Boolean(errors.flowId)}
                            helpertext={touched.flowId && errors.flowId}
                            id="flow-selection"
                            required
                            disabled={loadingFlows}
                          >
                            {loadingFlows ? (
                              <MenuItem value="" disabled>
                                Carregando...
                              </MenuItem>
                            ) : (
                              flowsList.map((flow) => (
                                <MenuItem key={flow.id} value={flow.id}>
                                  {flow.name}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                        </FormControl>
                      </Grid>
                    )}

                    {values.type === "assistant" && (
                      <Grid item xs={12} md={6} xl={6}>
                        <FormControl
                          variant="outlined"
                          className={classes.formControl}
                          margin="dense"
                          fullWidth
                        >
                          <InputLabel id="assistant-selection-input-label">
                            Selecione um Agente
                          </InputLabel>
                          
                          <Field
                            as={Select}
                            label="Selecione um Agente"
                            name="assistantId"
                            labelId="assistant-selection-label"
                            error={touched.assistantId && Boolean(errors.assistantId)}
                            helpertext={touched.assistantId && errors.assistantId}
                            id="assistant-selection"
                            required
                            disabled={loadingAssistants}
                          >
                            {loadingAssistants ? (
                              <MenuItem value="" disabled>
                                Carregando...
                              </MenuItem>
                            ) : (
                              assistants.map((assistant) => (
                                <MenuItem key={assistant.id} value={assistant.id}>
                                  {assistant.name}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                        </FormControl>
                      </Grid>
                    )}
		    
                    {(values.type === "openAI") && (
                      <>
                        <Grid item xs={12} md={12} xl={12}>
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.OpenApiKey")}
                            name="urlN8N"
                            error={touched.urlN8N && Boolean(errors.urlN8N)}
                            helpertext={touched.urlN8N && errors.urlN8N}
                            variant="outlined"
                            margin="dense"
                            required
                            fullWidth
                            type='password'
                            className={classes.textField}
                          />
                        </Grid>
                      </>
                    )}
                    {(values.type === "typebot") && (
                      <>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.name")}
                            autoFocus
                            name="name"
                            error={touched.name && Boolean(errors.name)}
                            helpertext={touched.name && errors.name}
                            variant="outlined"
                            margin="dense"
                            required
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={12} xl={12} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.urlN8N")}
                            name="urlN8N"
                            error={touched.urlN8N && Boolean(errors.urlN8N)}
                            helpertext={touched.urlN8N && errors.urlN8N}
                            variant="outlined"
                            margin="dense"
                            required
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.typebotSlug")}
                            name="typebotSlug"
                            error={touched.typebotSlug && Boolean(errors.typebotSlug)}
                            helpertext={touched.typebotSlug && errors.typebotSlug}
                            required
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.typebotExpires")}
                            name="typebotExpires"
                            error={touched.typebotExpires && Boolean(errors.typebotExpires)}
                            helpertext={touched.typebotExpires && errors.typebotExpires}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.typebotDelayMessage")}
                            name="typebotDelayMessage"
                            error={touched.typebotDelayMessage && Boolean(errors.typebotDelayMessage)}
                            helpertext={touched.typebotDelayMessage && errors.typebotDelayMessage}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.typebotKeywordFinish")}
                            name="typebotKeywordFinish"
                            error={touched.typebotKeywordFinish && Boolean(errors.typebotKeywordFinish)}
                            helpertext={touched.typebotKeywordFinish && errors.typebotKeywordFinish}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.typebotKeywordRestart")}
                            name="typebotKeywordRestart"
                            error={touched.typebotKeywordRestart && Boolean(errors.typebotKeywordRestart)}
                            helpertext={touched.typebotKeywordRestart && errors.typebotKeywordRestart}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} xl={6} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.typebotUnknownMessage")}
                            name="typebotUnknownMessage"
                            error={touched.typebotUnknownMessage && Boolean(errors.typebotUnknownMessage)}
                            helpertext={touched.typebotUnknownMessage && errors.typebotUnknownMessage}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        <Grid item xs={12} md={12} xl={12} >
                          <Field
                            as={TextField}
                            label={i18n.t("queueIntegrationModal.form.typebotRestartMessage")}
                            name="typebotRestartMessage"
                            error={touched.typebotRestartMessage && Boolean(errors.typebotRestartMessage)}
                            helpertext={touched.typebotRestartMessage && errors.typebotRestartMessage}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.textField}
                          />
                        </Grid>
                        
                      </>
                    )}
                  </Grid>
                </DialogContent>
              </Paper>

              <DialogActions>
                {values.type === "dialogflow" && (
                  <Button
                    //type="submit"
                    onClick={(e) => handleTestSession(e, values)}
                    color="inherit"
                    disabled={isSubmitting}
                    name="testSession"
                    variant="outlined"
                    className={classes.btnLeft}
                  >
                    {i18n.t("queueIntegrationModal.buttons.test")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("queueIntegrationModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {integrationId
                    ? `${i18n.t("queueIntegrationModal.buttons.okEdit")}`
                    : `${i18n.t("queueIntegrationModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div >
  );
};

export default QueueIntegration;