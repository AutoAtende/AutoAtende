import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../helpers/toast";
import { head } from "lodash";
import {
  TextField,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  IconButton,
  InputAdornment,
  Button,
  CircularProgress,
  Box,
  DialogContent,
  DialogActions,
  useTheme
} from "@mui/material";
import { AttachFile, Colorize, DeleteOutline, HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import { makeStyles } from '@mui/styles';
import { green } from "@mui/material/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ColorPicker from "../ColorPicker";
import MessageVariablesPicker from "../MessageVariablesPicker";
import { TagsFilter } from "./TagsFilter";
import HelpModal from "./HelpModal";
import { QueueOptions } from "../QueueOptions";
import SchedulesForm from "../SchedulesForm";
import ConfirmationModal from "../ConfirmationModal";
import useSettings from "../../hooks/useSettings";
import BaseModal from "../shared/BaseModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  }
}));

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
  greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
  const theme = useTheme();
  const classes = useStyles();
  const initialState = {
    name: "",
    color: "",
    greetingMessage: "",
    outOfHoursMessage: "",
    keywords: "",
    newTicketOnTransfer: false,
    orderQueue: "",
    integrationId: "",
    promptId: "",
    tags: "",
    closeTicket: false,
    idFilaPBX: null,
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [tab, setTab] = useState(0);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const greetingRef = useRef();
  const [integrations, setIntegrations] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);
  const [queueEditable, setQueueEditable] = useState(true);
  const [confirmationOpen, setConfirmModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
    const [schedules, setSchedules] = useState([
        {
            weekday: i18n.t("daysweek.day1"), weekdayEn: "monday", startTime: "08:00", endTime: "18:00",
            startLunchTime: "", endLunchTime: "",
        },
        {
            weekday: i18n.t("daysweek.day2"), weekdayEn: "tuesday", startTime: "08:00", endTime: "18:00",
            startLunchTime: "", endLunchTime: "",
        },
        {
            weekday: i18n.t("daysweek.day3"),
            weekdayEn: "wednesday",
            startTime: "08:00",
            endTime: "18:00",
            startLunchTime: "",
            endLunchTime: "",
        },
        {
            weekday: i18n.t("daysweek.day4"),
            weekdayEn: "thursday",
            startTime: "08:00",
            endTime: "18:00",
            startLunchTime: "",
            endLunchTime: "",
        },
        {
            weekday: i18n.t("daysweek.day5"),
            weekdayEn: "friday",
            startTime: "08:00",
            endTime: "18:00",
            startLunchTime: "",
            endLunchTime: "",
        },
        {
            weekday: i18n.t("daysweek.day6"),
            weekdayEn: "saturday",
            startTime: "08:00",
            endTime: "12:00",
            startLunchTime: "",
            endLunchTime: "",
        },
        {
            weekday: i18n.t("daysweek.day7"),
            weekdayEn: "sunday",
            startTime: "00:00",
            endTime: "00:00",
            startLunchTime: "",
            endLunchTime: "",
        },
    ]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const { getCachedSetting } = useSettings();

    useEffect(async () => {
        try {
            const {data} = await api.get("/prompt");
            setPrompts(data.prompts);
        } catch (err) {
            toast.error(err);
        }

        const scheduleType = await getCachedSetting("scheduleType");
        if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "queue");
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const {data} = await api.get("/queueIntegration");

                setIntegrations(data.queueIntegrations);
            } catch (err) {
                toast.error(err);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!queueId) return;
            try {
                const { data } = await api.get(`/queue/${queueId}`);
                setQueue((prevState) => {
                    return { ...prevState, ...data };
                });
                data.promptId ? setSelectedPrompt(data.promptId) : setSelectedPrompt(null);
                
                // Correção no tratamento das tags
                if (data.tags && Array.isArray(data.tags)) {
                    const tagIds = data.tags.map(tag => tag.id);
                    setSelectedTags(tagIds);
                } else if (typeof data.tags === 'string' && data.tags) {
                    // Se vier como string, converte para array
                    try {
                        const parsedTags = JSON.parse(data.tags);
                        setSelectedTags(Array.isArray(parsedTags) ? parsedTags : []);
                    } catch (e) {
                        setSelectedTags([]);
                    }
                } else {
                    setSelectedTags([]);
                }
                
                setSchedules(data.schedules || []);
            } catch (err) {
                toast.error(err);
            }
        })();
    
        return () => {
            setQueue({
                name: "",
                color: "",
                newTicketOnTransfer: false,
                greetingMessage: "",
                tags: "", // Mantém o estado inicial
                outOfHoursMessage: "",
                keywords: "",
                orderQueue: "",
                integrationId: "",
                closeTicket: false,
            });
        };
    }, [queueId, open]);

    const getIconColor = () => {
        return theme.palette.primary.main;
      };



    const handleAttachmentFile = (e) => {
        const file = head(e.target.files);
        if (file) {
            setAttachment(file);
        }
    };

    const deleteMedia = async () => {
        if (attachment) {
            setAttachment(null);
            attachmentFile.current.value = null;
        }

        if (queue.mediaPath) {
            await api.delete(`/queue/${queue.id}/media-upload`);
            setQueue((prev) => ({...prev, mediaPath: null, mediaName: null}));
            toast.success(i18n.t("queueModal.toasts.deleted")); //
        }
    };

    const handleSaveQueue = async (values) => {
        setLoading(true);
        try {
          const dataToSend = {
            ...values,
            schedules,
            promptId: selectedPrompt ? selectedPrompt : null,
            tags: selectedTags
          };
    
          let response;
          if (queueId) {
            response = await api.put(`/queue/${queueId}`, dataToSend);
          } else {
            response = await api.post("/queue", dataToSend);
          }
    
          if (attachment != null) {
            const formData = new FormData();
            formData.append("file", attachment);
            await api.post(`/queue/${response.data.id}/media-upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
          }
    
          toast.success(i18n.t("queueModal.toasts.success"));
          handleClose();
        } catch (err) {
          toast.error(err);
        }
        setLoading(false);
      };
    
      const handleHelpModal = () => {
        setHelpModalOpen(prev => !prev);
      };

    const handleSaveSchedules = async (values) => {
        toast.success("Clique em salvar para registar as alterações");
        setSchedules(values);
        setTab(0);
    };

    const handleChangePrompt = (e) => {
        setSelectedPrompt(e.target.value);
    };

    const handleSelectedTags = (selecteds) => {
        if (!selecteds) {
            setSelectedTags([]);
            return;
        }
        const tags = selecteds.map((t) => t.id);
        setSelectedTags(tags);
    };

    const handleClickMsgVar = async (msgVar, setFieldValue) => {
        const activeElement = document.activeElement; // Pega o elemento atualmente focado
        const fieldName = activeElement.name; // Supõe que o elemento focado tenha uma propriedade 'name' que corresponda ao nome do campo no Formik

        if (fieldName) {
            const firstHalfText = activeElement.value.substring(0, activeElement.selectionStart);
            const secondHalfText = activeElement.value.substring(activeElement.selectionEnd);
            const newCursorPos = activeElement.selectionStart + msgVar.length;

            setFieldValue(fieldName, `${firstHalfText}${msgVar}${secondHalfText}`);

            await new Promise(r => setTimeout(r, 100));
            activeElement.focus(); // Re-foca no campo ativo
            activeElement.setSelectionRange(newCursorPos, newCursorPos); // Posiciona o cursor corretamente
        }
    };

    const handleClose = () => {
        onClose();
        setQueue(initialState);
        setSelectedTags([]);
      };

    const modalActions = [
        {
          label: i18n.t("queueModal.buttons.cancel"),
          onClick: handleClose,
          color: "secondary",
          variant: "outlined",
          disabled: loading
        },
        {
          label: queueId 
            ? i18n.t("queueModal.buttons.okEdit")
            : i18n.t("queueModal.buttons.okAdd"),
          onClick: () => {
            // Trigger form submission
            document.getElementById('queueForm').requestSubmit();
          },
          color: "primary",
          variant: "contained",
          disabled: loading
        }
      ];
    
      if (!attachment && !queue.mediaPath && queueEditable) {
        modalActions.unshift({
          label: i18n.t("queueModal.buttons.attach"),
          onClick: () => attachmentFile.current.click(),
          color: "primary",
          variant: "outlined",
          disabled: loading
        });
      }
    
      return (
        <>
          <ConfirmationModal
            title={i18n.t("queueModal.confirmationModal.deleteTitle")}
            open={confirmationOpen}
            onClose={() => setConfirmModalOpen(false)}
            onConfirm={deleteMedia}
          >
            {i18n.t("queueModal.confirmationModal.deleteMessage")}
          </ConfirmationModal>
    
    
        <HelpModal 
            open={helpModalOpen} 
            onClose={() => setHelpModalOpen(false)} 
        />
        
        <BaseModal
            open={open}
            onClose={handleClose}
            title={
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ flex: 1 }}>
                {queueId 
                    ? i18n.t("queueModal.title.edit")
                    : i18n.t("queueModal.title.add")
                }
                </span>
                <IconButton
                size="small"
                onClick={handleHelpModal}
                color="primary"
                title={i18n.t("queueHelpModal.helpButtonTooltip")}
                >
                <HelpOutlineIcon />
                </IconButton>
            </div>
            }
        >
            <Box p={2}>
              <div style={{ display: "none" }}>
                <input
                  type="file"
                  ref={attachmentFile}
                  onChange={handleAttachmentFile}
                />
              </div>
    
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                <Tab label={i18n.t("queueModal.tabs.queue")} />
                {schedulesEnabled && (
                  <Tab label={i18n.t("queueModal.tabs.schedules")} />
                )}
              </Tabs>
    
              {tab === 0 && (
                <Formik
                  initialValues={queue}
                  enableReinitialize
                  validationSchema={QueueSchema}
                  onSubmit={handleSaveQueue}
                >
                  {({touched, errors, isSubmitting, values, setFieldValue}) => (
                    <Form id="queueForm">
                                    <DialogContent dividers>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("queueModal.form.name")}
                                            autoFocus
                                            name="name"
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                            variant="outlined"
                                            margin="dense"
                                            className={classes.textField}
                                        />
                                        <Field
                                            as={TextField}
                                            label={i18n.t("queueModal.form.color")}
                                            name="color"
                                            id="color"
                                            onFocus={() => {
                                                setColorPickerModalOpen(true);
                                                greetingRef.current.focus();
                                            }}
                                            error={touched.color && Boolean(errors.color)}
                                            helperText={touched.color && errors.color}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <div
                                                            style={{backgroundColor: values.color}}
                                                            className={classes.colorAdorment}
                                                        ></div>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => setColorPickerModalOpen(true)}
                                                    >
                                                        <Colorize  style={{ color: getIconColor() }} />
                                                    </IconButton>
                                                ),
                                            }}
                                            variant="outlined"
                                            margin="dense"
                                            className={classes.textField}
                                            InputLabelProps={{
                                                shrink: true,
                                              }}
                                        />
                                        <ColorPicker
                                            open={colorPickerModalOpen}
                                            handleClose={() => setColorPickerModalOpen(false)}
                                            onChange={(color) => {
                                                values.color = color;
                                                setQueue(() => {
                                                    return {...values, color};
                                                });
                                            }}
                                        />
                                        <Field
                                            as={TextField}
                                            label={i18n.t("queueModal.form.orderQueue")}
                                            name="orderQueue"
                                            type="orderQueue"
                                            error={touched.orderQueue && Boolean(errors.orderQueue)}
                                            helperText={touched.orderQueue && errors.orderQueue}
                                            variant="outlined"
                                            margin="dense"
                                            className={classes.textField}
                                            InputLabelProps={{
                                                shrink: true,
                                              }}
                                        />
                                        <FormControlLabel
                                        control={
                                            <Field
                                            as={Switch}
                                            color="primary"
                                            name="closeTicket"
                                            checked={values.closeTicket}
                                            />
                                        }
                                        label={i18n.t("queueModal.form.closeTicket")}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Field
                                                    as={Switch}
                                                    color="primary"
                                                    name="newTicketOnTransfer"
                                                    checked={values.newTicketOnTransfer}
                                                />
                                            }
                                            label={i18n.t("queueModal.form.newTicketOnTransfer")}
                                        />
                                        <div>
                                            <FormControl
                                                variant="outlined"
                                                margin="dense"
                                                className={classes.FormControl}
                                                fullWidth
                                            >
                                                <InputLabel id="integrationId-selection-label">
                                                    {i18n.t("queueModal.form.integrationId")}
                                                </InputLabel>
                                                <Field
                                                    as={Select}
                                                    label={i18n.t("queueModal.form.integrationId")}
                                                    name="integrationId"
                                                    id="integrationId"
                                                    placeholder={i18n.t("queueModal.form.integrationId")}
                                                    labelId="integrationId-selection-label"
                                                    value={values.integrationId || ""}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                      }}
                                                >
                                                    <MenuItem value={""}>{"Nenhum"}</MenuItem>
                                                    {integrations.map((integration) => (
                                                        <MenuItem key={integration.id} value={integration.id}>
                                                            {integration.name}
                                                        </MenuItem>
                                                    ))}
                                                </Field>

                                            </FormControl>
                                            <Grid item xs={12}>
                                                <TagsFilter 
                                                    onFiltered={handleSelectedTags}
                                                    initialTags={selectedTags} // Adicione esta prop
                                                />
                                            </Grid>
                                            <FormControl
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                            >
                                                <InputLabel>
                                                    {i18n.t("whatsappModal.form.prompt")}
                                                </InputLabel>
                                                <Select
                                                    labelId="dialog-select-prompt-label"
                                                    id="dialog-select-prompt"
                                                    name="promptId"
                                                    value={selectedPrompt || ""}
                                                    onChange={handleChangePrompt}
                                                    label={i18n.t("whatsappModal.form.prompt")}
                                                    fullWidth
                                                    MenuProps={{
                                                        anchorOrigin: {
                                                            vertical: "bottom",
                                                            horizontal: "left",
                                                        },
                                                        transformOrigin: {
                                                            vertical: "top",
                                                            horizontal: "left",
                                                        },
                                                        getContentAnchorEl: null,
                                                    }}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                      }}
                                                >
                                                    <MenuItem value={""}>{"Nenhum"}</MenuItem>
                                                    {prompts.map((prompt) => (
                                                        <MenuItem
                                                            key={prompt.id}
                                                            value={prompt.id}
                                                        >
                                                            {prompt.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div style={{marginTop: 5}}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("queueModal.form.greetingMessage")}
                                                type="greetingMessage"
                                                multiline
                                                inputRef={greetingRef}
                                                rows={5}
                                                fullWidth
                                                spellCheck={true}
                                                name="greetingMessage"
                                                error={
                                                    touched.greetingMessage &&
                                                    Boolean(errors.greetingMessage)
                                                }
                                                helperText={
                                                    touched.greetingMessage && errors.greetingMessage
                                                }
                                                variant="outlined"
                                                margin="dense"
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                  }}
                                            />
                                            {schedulesEnabled && (
                                                <Field
                                                    as={TextField}
                                                    label={i18n.t("queueModal.form.outOfHoursMessage")}
                                                    type="outOfHoursMessage"
                                                    multiline
                                                    inputRef={greetingRef}
                                                    rows={5}
                                                    fullWidth
                                                    spellCheck={true}
                                                    name="outOfHoursMessage"
                                                    error={
                                                        touched.outOfHoursMessage &&
                                                        Boolean(errors.outOfHoursMessage)
                                                    }
                                                    helperText={
                                                        touched.outOfHoursMessage && errors.outOfHoursMessage
                                                    }
                                                    variant="outlined"
                                                    margin="dense"
                                                    className={classes.textField}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                      }}
                                                />
                                            )}

                                            <Field
                                                as={TextField}
                                                label={i18n.t("queueModal.form.keywords")}
                                                type="keywords"
                                                multiline
                                                inputRef={greetingRef}
                                                rows={3}
                                                fullWidth
                                                name="keywords"
                                                error={
                                                    touched.keywords &&
                                                    Boolean(errors.keywords)
                                                }
                                                helperText={
                                                    touched.keywords && errors.keywords
                                                }
                                                variant="outlined"
                                                margin="dense"
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                  }}
                                            />

                                            <Grid item>
                                                <MessageVariablesPicker
                                                    disabled={isSubmitting}
                                                    onClick={value => handleClickMsgVar(value, setFieldValue)}
                                                />
                                            </Grid>

                                            <Field
                                                as={TextField}
                                                label="ID Fila PBX"
                                                name="idFilaPBX"
                                                type="number"
                                                error={touched.idFilaPBX && Boolean(errors.idFilaPBX)}
                                                helperText={touched.idFilaPBX && errors.idFilaPBX}
                                                variant="outlined"
                                                margin="dense"
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                />

                                        </div>
                                        <QueueOptions queueId={queueId}/>
                                        {(queue.mediaPath || attachment) && (
                                            <Grid xs={12} item>
                                                <Button startIcon={<AttachFile/>}>
                                                    {attachment != null
                                                        ? attachment.name
                                                        : queue.mediaName}
                                                </Button>
                                                {queueEditable && (
                                                    <IconButton onClick={() => setConfirmationOpen(true)} color="secondary" size="large">
                                                        <DeleteOutline style={{ color: getIconColor() }} />
                                                    </IconButton>
                                                )}
                                            </Grid>
                                        )}
                                    </DialogContent>
                                    <DialogActions>
                                        {!attachment && !queue.mediaPath && queueEditable && (
                                            <Button
                                                color="primary"
                                                onClick={() => attachmentFile.current.click()}
                                                disabled={isSubmitting}
                                                variant="outlined"
                                            >
                                                {i18n.t("queueModal.buttons.attach")}
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleClose}
                                            color="secondary"
                                            disabled={isSubmitting}
                                            variant="outlined"
                                        >
                                            {i18n.t("queueModal.buttons.cancel")}
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="primary"
                                            disabled={isSubmitting}
                                            variant="contained"
                                            className={classes.btnWrapper}
                                        >
                                            {queueId
                                                ? `${i18n.t("queueModal.buttons.okEdit")}`
                                                : `${i18n.t("queueModal.buttons.okAdd")}`}
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
               )}

               {tab === 1 && (
                 <SchedulesForm
                   loading={loading}
                   onSubmit={handleSaveSchedules}
                   initialValues={schedules}
                   labelSaveButton={i18n.t("queueModal.buttons.saveSchedules")}
                 />
               )}
             </Box>
           </BaseModal>
         </>
       );
     };
     
     export default QueueModal;