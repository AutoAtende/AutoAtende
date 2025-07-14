// src/pages/Connections/components/WhatsAppModal.jsx
import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useContext,
} from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../../helpers/toast";
import { isNil } from "../../../utils/helpers";
import { WhatsAppsContext } from "../../../context/WhatsApp/WhatsAppsContext";
import makeStyles from "@mui/styles/makeStyles";
import moment from "moment";

// MUI Components
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Button,
    DialogActions,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Switch,
    FormControlLabel,
    Grid,
    Divider,
    Tab,
    Tabs,
    Paper,
    Box,
    Tooltip,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';

// Icons
import {
    Cancel as CancelIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    FileCopy as CopyIcon,
    WhatsApp as WhatsAppIcon,
    Schedule as ScheduleIcon,
    Message as MessageIcon,
    Settings as SettingsIcon,
    Extension as ExtensionIcon,
    Chat as ChatIcon,
    Assessment as AssessmentIcon,
    CheckCircleOutline as SaveIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';

import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";
import QueueSelect from "../../../components/QueueSelect";
import TabPanel from "../../../components/TabPanel";
import MessageVariablesPicker from "../../../components/MessageVariablesPicker";
import ColorPickerField from "./ColorPickerField";
import ActionButton from "./ActionButton";

const useStyles = makeStyles((theme) => ({
    root: {
        "& .MuiDialog-paper": {
            maxWidth: "80vw",
            width: "80vw",
            maxHeight: "85vh",
            margin: theme.spacing(2),
        },
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: theme.spacing(1, 2),
        "& .MuiIconButton-root": {
            color: "inherit",
        },
    },
    content: {
        padding: theme.spacing(2),
        height: "auto",
        maxHeight: "65vh",
        overflowY: "auto",
    },
    mainPaper: {
        flex: 1,
        padding: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
    paper: {
        padding: theme.spacing(2),
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },
    btnWrapper: {
        position: "relative",
    },
    buttonProgress: {
        color: theme.palette.success.main,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    importMessage: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        padding: theme.spacing(1),
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: theme.shape.borderRadius,
    },
    tokenField: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    uploadButton: {
        marginBottom: theme.spacing(1),
    },
    attachmentPreview: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        marginBottom: theme.spacing(1),
    },
    tabIcon: {
        minHeight: "48px",
        "& .MuiTab-wrapper": {
            flexDirection: "row",
            justifyContent: "flex-start",
        },
    },
    helpButton: {
        position: "absolute",
        right: theme.spacing(2),
        top: theme.spacing(2),
    },
    container: {
        padding: theme.spacing(2),
        "& > *:not(:last-child)": {
            marginBottom: theme.spacing(2),
        },
    },
}));

const SessionSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, i18n.t("whatsappModal.validation.nameMin"))
        .max(50, i18n.t("whatsappModal.validation.nameMax"))
        .required(i18n.t("whatsappModal.validation.nameRequired")),
    color: Yup.string(),
});

// Função utilitária para normalizar valores vindos do banco (números) para booleanos do frontend
const normalizeNumberToBoolean = (value) => {
    if (value === undefined || value === null) return false;
    
    if (typeof value === "boolean") {
        return value;
    }
    
    if (typeof value === "number") {
        return value > 0;
    }
    
    if (typeof value === "string") {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            return numValue > 0;
        }
        const lowerValue = value.toLowerCase();
        return lowerValue === "true" || lowerValue === "1" || lowerValue === "yes";
    }
    
    return false;
};

const WhatsAppModal = ({ open, onClose, whatsAppId, onStartImportMonitoring }) => {
    const classes = useStyles();
    const theme = useTheme();

    const {
        whatsApps,
        loading: whatsAppsLoading,
        fetchWhatsApps,
    } = useContext(WhatsAppsContext);
    const [helpOpen, setHelpOpen] = useState(false);
    const [autoToken, setAutoToken] = useState("");
    const inputFileRef = useRef(null);
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState("");
    const [tab, setTab] = useState("general");
    const [copied, setCopied] = useState(false);
    const [schedulesEnabled, setSchedulesEnabled] = useState(false);
    const [NPSEnabled, setNPSEnabled] = useState(false);
    const [isDefaultWhatsApp, setIsDefaultWhatsApp] = useState(false);
    const [showQrCodeAfterSave, setShowQrCodeAfterSave] = useState(false);

    // Estado inicial do WhatsApp
    const [whatsApp, setWhatsApp] = useState({
        name: "",
        greetingMessage: "",
        complationMessage: "",
        outOfHoursMessage: "",
        ratingMessage: "",
        isDefault: 0,
        token: "",
        maxUseBotQueues: 3,
        provider: "beta",
        expiresTicket: 0,
        channel: "baileys",
        allowGroup: false,
        enableImportMessage: false,
        timeUseBotQueues: "0",
        timeSendQueue: "0",
        sendIdQueue: 0,
        expiresTicketNPS: "0",
        expiresInactiveMessage: "",
        timeInactiveMessage: "",
        inactiveMessage: "",
        collectiveVacationMessage: "",
        collectiveVacationStart: null,
        collectiveVacationEnd: null,
        maxUseBotQueuesNPS: 3,
        whenExpiresTicket: 0,
        timeCreateNewTicket: 0,
        color: "#7367F0",
        autoRejectCalls: false,
        autoImportContacts: true,
    });

    const [selectedQueueIds, setSelectedQueueIds] = useState([]);
    const [enableImportMessage, setEnableImportMessage] = useState(false);
    const [importOldMessagesGroups, setImportOldMessagesGroups] = useState(false);
    const [closedTicketsPostImported, setClosedTicketsPostImported] =
        useState(false);
    const [importOldMessages, setImportOldMessages] = useState(
        moment().add(-1, "days").format("YYYY-MM-DDTHH:mm")
    );
    const [importRecentMessages, setImportRecentMessages] = useState(null);

    const [prompts, setPrompts] = useState([]);
    const [queues, setQueues] = useState([]);
    const [integrations, setIntegrations] = useState([]);

    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [startConnection, setStartConnection] = useState(false);

    const [schedules, setSchedules] = useState([
        {
            weekday: i18n.t("queueModal.serviceHours.monday"),
            weekdayEn: "monday",
            startTimeA: "08:00",
            endTimeA: "12:00",
            startTimeB: "13:00",
            endTimeB: "18:00",
        },
        {
            weekday: i18n.t("queueModal.serviceHours.tuesday"),
            weekdayEn: "tuesday",
            startTimeA: "08:00",
            endTimeA: "12:00",
            startTimeB: "13:00",
            endTimeB: "18:00",
        },
        {
            weekday: i18n.t("queueModal.serviceHours.wednesday"),
            weekdayEn: "wednesday",
            startTimeA: "08:00",
            endTimeA: "12:00",
            startTimeB: "13:00",
            endTimeB: "18:00",
        },
        {
            weekday: i18n.t("queueModal.serviceHours.thursday"),
            weekdayEn: "thursday",
            startTimeA: "08:00",
            endTimeA: "12:00",
            startTimeB: "13:00",
            endTimeB: "18:00",
        },
        {
            weekday: i18n.t("queueModal.serviceHours.friday"),
            weekdayEn: "friday",
            startTimeA: "08:00",
            endTimeA: "12:00",
            startTimeB: "13:00",
            endTimeB: "18:00",
        },
        {
            weekday: i18n.t("queueModal.serviceHours.saturday"),
            weekdayEn: "saturday",
            startTimeA: "08:00",
            endTimeA: "12:00",
            startTimeB: "13:00",
            endTimeB: "18:00",
        },
        {
            weekday: i18n.t("queueModal.serviceHours.sunday"),
            weekdayEn: "sunday",
            startTimeA: "08:00",
            endTimeA: "12:00",
            startTimeB: "13:00",
            endTimeB: "18:00",
        },
    ]);

    // Carregamento inicial dos dados
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [promptsResponse, queuesResponse, integrationsResponse] =
                    await Promise.all([
                        api.get("/prompt"),
                        api.get("/queue"),
                        api.get("/queueIntegration"),
                    ]);

                setPrompts(promptsResponse.data.prompts);
                setQueues(queuesResponse.data);
                setIntegrations(integrationsResponse.data.queueIntegrations);
            } catch (err) {
                console.error(err);
                toast.error(i18n.t("whatsappModal.errors.fetchData"));
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const loadWhatsAppData = async () => {
            if (!whatsAppId) return;
    
            try {
                const { data } = await api.get(`whatsapp/${whatsAppId}`);
    
                if (data) {
                    // Converter números do banco para booleanos do frontend
                    setIsDefaultWhatsApp(normalizeNumberToBoolean(data.isDefault));
    
                    // Resto do código
                    setSelectedPrompt(data.promptId || null);
                    setSelectedIntegration(data.integrationId || null);
    
                    if (data.queues && data.queues.length > 0) {
                        const queueIds = data.queues.map(queue => queue.id);
                        setSelectedQueueIds(queueIds);
                    } else {
                        setSelectedQueueIds([]);
                    }
    
                    // Garantir que os campos booleanos sejam convertidos corretamente
                    const defaultedData = {
                        ...whatsApp,
                        ...data,
                        name: data.name || "",
                        greetingMessage: data.greetingMessage || "",
                        complationMessage: data.complationMessage || "",
                        outOfHoursMessage: data.outOfHoursMessage || "",
                        ratingMessage: data.ratingMessage || "",
                        token: data.token || "",
                        maxUseBotQueues: data.maxUseBotQueues || 3,
                        provider: data.provider || "beta",
                        expiresTicket: data.expiresTicket || 0,
                        // Converter números do banco (0/1) para booleanos do frontend (false/true)
                        allowGroup: normalizeNumberToBoolean(data.allowGroup),
                        autoRejectCalls: normalizeNumberToBoolean(data.autoRejectCalls),
                        autoImportContacts: normalizeNumberToBoolean(data.autoImportContacts),
                        timeUseBotQueues: data.timeUseBotQueues || "0",
                        timeSendQueue: data.timeSendQueue || "0",
                        sendIdQueue: data.sendIdQueue || 0,
                        expiresInactiveMessage: data.expiresInactiveMessage || "",
                        timeInactiveMessage: data.timeInactiveMessage || "",
                        inactiveMessage: data.inactiveMessage || "",
                        collectiveVacationMessage: data.collectiveVacationMessage || "",
                        collectiveVacationStart: data.collectiveVacationStart
                            ? moment(data.collectiveVacationStart).format("YYYY-MM-DD")
                            : null,
                        collectiveVacationEnd: data.collectiveVacationEnd
                            ? moment(data.collectiveVacationEnd).format("YYYY-MM-DD")
                            : null,
                        color: data.color || "#7367F0",
                        whenExpiresTicket: data.whenExpiresTicket || 0,
                        timeCreateNewTicket: data.timeCreateNewTicket || 0,
                    };
    
                    // Log para depuração - verificar se os valores estão corretos
                    console.log("Valores recebidos do servidor e convertidos:", {
                        raw: {
                            isDefault: data.isDefault,
                            allowGroup: data.allowGroup,
                            autoRejectCalls: data.autoRejectCalls,
                            autoImportContacts: data.autoImportContacts,
                        },
                        converted: {
                            isDefault: normalizeNumberToBoolean(data.isDefault),
                            allowGroup: normalizeNumberToBoolean(data.allowGroup),
                            autoRejectCalls: normalizeNumberToBoolean(data.autoRejectCalls),
                            autoImportContacts: normalizeNumberToBoolean(data.autoImportContacts),
                        }
                    });
    
                    setWhatsApp(defaultedData);
                    setAttachmentName(data.greetingMediaAttachment || "");
                    setAutoToken(data.token || "");
    
                    // Configurar a importação de mensagens
                    if (data?.importOldMessages) {
                        setEnableImportMessage(true);
                        setImportOldMessages(data.importOldMessages);
                        setImportRecentMessages(data.importRecentMessages);
                        setClosedTicketsPostImported(normalizeNumberToBoolean(data.closedTicketsPostImported));
                        setImportOldMessagesGroups(normalizeNumberToBoolean(data.importOldMessagesGroups));
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar dados do WhatsApp:", err);
                toast.error(i18n.t("whatsappModal.errors.fetchWhatsApp"));
            }
        };
    
        loadWhatsAppData();
    }, [whatsAppId]);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleEnableImportMessage = (e) => {
        setEnableImportMessage(e.target.checked);
    };

    const handleTokenChange = (e) => {
        setAutoToken(e.target.value);
    };

    const handleClickMsgVar = async (msgVar, setFieldValue) => {
        const activeElement = document.activeElement;
        const fieldName = activeElement.name;

        if (fieldName) {
            const firstHalfText = activeElement.value.substring(
                0,
                activeElement.selectionStart
            );
            const secondHalfText = activeElement.value.substring(
                activeElement.selectionEnd
            );
            const newCursorPos = activeElement.selectionStart + msgVar.length;

            setFieldValue(fieldName, `${firstHalfText}${msgVar}${secondHalfText}`);

            await new Promise((r) => setTimeout(r, 100));
            activeElement.focus();
            activeElement.setSelectionRange(newCursorPos, newCursorPos);
        }
    };

    const handleChangePrompt = (e) => {
        const value = e.target.value;
        setSelectedPrompt(value === "0" ? null : Number(value));
    };

    const handleChangeIntegrationId = (e) => {
        const value = e.target.value;
        setSelectedIntegration(value === "0" ? null : Number(value));
    };

    const handleChangeQueue = useCallback((selectedQueues) => {
        console.log("Chamada de handleChangeQueue com:", selectedQueues);
        
        // Se selectedQueues for nulo, undefined ou array vazio, definir queueIds como array vazio
        if (!selectedQueues || 
            (Array.isArray(selectedQueues) && selectedQueues.length === 0) ||
            (typeof selectedQueues === 'object' && Object.keys(selectedQueues).length === 0)) {
            console.log("Nenhum setor selecionado, definindo lista vazia.");
            setSelectedQueueIds([]);
            return;
        }
    
        // Para casos onde é passado um único objeto ou ID
        if (!Array.isArray(selectedQueues)) {
            const queueId = typeof selectedQueues === 'object' && selectedQueues !== null ? 
                selectedQueues.id : Number(selectedQueues);
            
            if (!isNaN(queueId) && queueId > 0) {
                console.log("Único setor selecionado:", queueId);
                setSelectedQueueIds([queueId]);
            } else {
                console.log("Valor inválido para setor único, definindo lista vazia.");
                setSelectedQueueIds([]);
            }
            return;
        }
    
        // Para arrays de objetos ou IDs
        const queueIds = selectedQueues.map(q => {
            return typeof q === 'object' && q !== null ? q.id : Number(q);
        }).filter(id => !isNaN(id) && id > 0);
    
        console.log("Setores selecionados processados:", queueIds);
        setSelectedQueueIds(queueIds);
    }, []);

    const handleSaveWhatsApp = async (values, actions) => {
        try {
            if (!values.name) {
                toast.error(i18n.t("whatsappModal.errors.required"));
                actions.setSubmitting(false);
                return;
            }
    
            // Verificação de conexão padrão se necessário
            if (isDefaultWhatsApp && !whatsAppId) {
                const defaultWhatsApp = whatsApps.find(w => normalizeNumberToBoolean(w.isDefault));
                if (defaultWhatsApp) {
                    if (!window.confirm(i18n.t("whatsappModal.confirmations.changeDefault") || 
                                        "Já existe uma conexão padrão. Deseja substituí-la?")) {
                        actions.setSubmitting(false);
                        return;
                    }
                }
            }
    
            // Garantir que a cor seja válida
            const color = values.color && values.color.startsWith('#') ? values.color : "#7367F0";
            
            const formattedValues = {
                ...values,
                color,
                collectiveVacationStart: values.collectiveVacationStart
                    ? moment(values.collectiveVacationStart).format("YYYY-MM-DD")
                    : null,
                collectiveVacationEnd: values.collectiveVacationEnd
                    ? moment(values.collectiveVacationEnd).format("YYYY-MM-DD")
                    : null,
            };
        
            // Garantir que queueIds seja sempre um array (mesmo que vazio)
            // e que seus elementos sejam números válidos
            const queueIds = Array.isArray(selectedQueueIds) 
                ? selectedQueueIds.filter(id => !isNaN(Number(id)) && Number(id) > 0)
                : [];
                
            console.log("WhatsAppModal - Setores selecionados para salvar:", queueIds);
    
            // Preparação de dados - enviar como booleanos para o backend normalizar automaticamente
            const whatsappData = {
                ...formattedValues,
                // O backend irá converter booleanos para números (0/1) automaticamente
                isDefault: isDefaultWhatsApp,
                channel: "baileys",
                autoRejectCalls: values.autoRejectCalls,
                autoImportContacts: values.autoImportContacts,
                allowGroup: values.allowGroup,
                // Incluir explicitamente queueIds (mesmo que seja array vazio)
                queueIds: queueIds,
                token: autoToken || '',
                status: startConnection ? "PENDING" : "DISCONNECTED",
                promptId: selectedPrompt || null,
                integrationId: selectedIntegration || null,
                schedules: schedules || [],
                importOldMessages: enableImportMessage ? importOldMessages : null,
                importRecentMessages: enableImportMessage ? importRecentMessages : null,
                importOldMessagesGroups: importOldMessagesGroups,
                closedTicketsPostImported: closedTicketsPostImported,
                maxUseBotQueues: Number(values.maxUseBotQueues) || 3,
                timeUseBotQueues: values.timeUseBotQueues || "0",
                expiresTicket: Number(values.expiresTicket) || 0
            };
            
            // Log para debug
            console.log("WhatsAppModal - Dados sendo enviados:", JSON.stringify(whatsappData, null, 2));
            
            let savedWhatsApp;
        
            if (whatsAppId) {
                await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
                toast.success(i18n.t("whatsappModal.success.update"));
            } else {
                // Nova conexão
                const { data } = await api.post("/whatsapp", whatsappData);
                savedWhatsApp = data;
            
                if (savedWhatsApp && !savedWhatsApp.status) {
                    savedWhatsApp.status = startConnection ? "PENDING" : "DISCONNECTED";
                }
            
                if (attachment) {
                    const formData = new FormData();
                    formData.append("file", attachment);
                    await api.post(`/whatsapp/${data.id}/media-upload`, formData);
                }
                toast.success(i18n.t("whatsappModal.success.create"));
            }
        
            await fetchWhatsApps();
        
            if (!whatsAppId && showQrCodeAfterSave) {
                // Se for uma nova conexão e o usuário quer mostrar QR Code
                onClose(true, savedWhatsApp);
                
                // Adicionar um pequeno atraso para garantir que os dados estejam atualizados
                setTimeout(() => {
                    if (savedWhatsApp && savedWhatsApp.id) {
                        // Recarregar os dados atualizados do WhatsApp antes de abrir o QR Code
                        api.get(`/whatsapp/${savedWhatsApp.id}`)
                          .then(response => {
                              if (response.data) {
                                  handleOpenQrModal(response.data);
                              }
                          })
                          .catch(err => console.error("Erro ao buscar dados para QR Code:", err));
                    }
                }, 1500);
            } else {
                onClose();
            }

            // Se tiver importação de mensagens habilitada e função para monitorar
            if (enableImportMessage && typeof onStartImportMonitoring === 'function') {
                setTimeout(() => {
                    const targetWhatsApp = savedWhatsApp || 
                        whatsApps.find(w => w.id === whatsAppId);
                    if (targetWhatsApp) {
                        onStartImportMonitoring(targetWhatsApp);
                    }
                }, 1000);
            }
        } catch (err) {
            console.error("Erro ao salvar WhatsApp:", err);
            toast.error(err?.response?.data?.error || i18n.t("whatsappModal.errors.saveWhatsApp"));
        } finally {
            if (actions?.setSubmitting) {
                actions.setSubmitting(false);
            }
        }
    };

    const generateRandomCode = (length) => {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyvz0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            code += charset.charAt(randomIndex);
        }
        return code;
    };

    const handleRefreshToken = () => {
        const newToken = generateRandomCode(30);
        setAutoToken(newToken);
        toast.success(i18n.t("whatsappModal.tokenRefreshed"));
    };

    const handleCopyToken = () => {
        navigator.clipboard.writeText(autoToken);
        setCopied(true);
        toast.success(i18n.t("whatsappModal.tokenCopied"));
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveSchedules = async (values) => {
        setSchedules(values);
        toast.success(i18n.t("whatsappModal.scheduleSaved"));
    };

    const handleClose = () => {
        onClose();
        setWhatsApp({
            name: "",
            channel: "baileys",
            greetingMessage: "",
            complationMessage: "",
            outOfHoursMessage: "",
            ratingMessage: "",
            isDefault: 0,
            token: "",
            maxUseBotQueues: 3,
            provider: "beta",
            expiresTicket: 0,
            allowGroup: false,
            enableImportMessage: false,
            timeUseBotQueues: "0",
            timeSendQueue: "0",
            sendIdQueue: 0,
            expiresTicketNPS: "0",
            expiresInactiveMessage: "",
            timeInactiveMessage: "",
            inactiveMessage: "",
            collectiveVacationMessage: "",
            collectiveVacationStart: null,
            collectiveVacationEnd: null,
            maxUseBotQueuesNPS: 3,
            whenExpiresTicket: 0,
            timeCreateNewTicket: 0,
            color: "#7367F0",
            autoRejectCalls: false,
            autoImportContacts: true,
        });
        setIsDefaultWhatsApp(false);
        setSelectedPrompt(null);
        setSelectedIntegration(null);
        setSelectedQueueIds([]);
        setSchedules([]);
        setEnableImportMessage(false);
        setAttachment(null);
        setAttachmentName("");
        setAutoToken("");
        setShowQrCodeAfterSave(false);
    };

    const handleFileUpload = () => {
        const file = inputFileRef.current.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(i18n.t("whatsappModal.errors.fileSize"));
                return;
            }
            setAttachment(file);
            setAttachmentName(file.name);
        }
        inputFileRef.current.value = null;
    };

    const handleDeleteFile = () => {
        setAttachment(null);
        setAttachmentName("");
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                scroll="paper"
                className={classes.root}
                PaperProps={{
                    elevation: 0,
                    style: { borderRadius: 8 },
                }}
            >
                <DialogTitle className={classes.header}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <WhatsAppIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                            {whatsAppId
                                ? i18n.t("whatsappModal.title.edit")
                                : i18n.t("whatsappModal.title.add")}
                        </Typography>
                    </Box>
                </DialogTitle>

                <Formik
                    initialValues={whatsApp}
                    enableReinitialize={true}
                    validationSchema={SessionSchema}
                    onSubmit={(values, actions) => {
                        handleSaveWhatsApp(values, actions);
                    }}
                >
                    {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                        <Form>
                            <Paper className={classes.mainPaper} elevation={1}>
                                <Tabs
                                    value={tab}
                                    onChange={handleTabChange}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="WhatsApp configuration tabs"
                                    sx={{ borderBottom: 1, borderColor: "divider" }}
                                >
                                    <Tab
                                        icon={<SettingsIcon />}
                                        iconPosition="start"
                                        label={i18n.t("whatsappModal.tabs.general")}
                                        value="general"
                                        id="tab-general"
                                        aria-controls="tabpanel-general"
                                        className={classes.tabIcon}
                                    />
                                    <Tab
                                        icon={<ExtensionIcon />}
                                        iconPosition="start"
                                        label={i18n.t("whatsappModal.tabs.integrations")}
                                        value="integrations"
                                        id="tab-integrations"
                                        aria-controls="tabpanel-integrations"
                                        className={classes.tabIcon}
                                    />
                                    <Tab
                                        icon={<MessageIcon />}
                                        iconPosition="start"
                                        label={i18n.t("whatsappModal.tabs.messages")}
                                        value="messages"
                                        id="tab-messages"
                                        aria-controls="tabpanel-messages"
                                        className={classes.tabIcon}
                                    />
                                    <Tab
                                        icon={<ChatIcon />}
                                        iconPosition="start"
                                        label="Chatbot"
                                        value="chatbot"
                                        id="tab-chatbot"
                                        aria-controls="tabpanel-chatbot"
                                        className={classes.tabIcon}
                                    />
                                    <Tab
                                        icon={<AssessmentIcon />}
                                        iconPosition="start"
                                        label={i18n.t("whatsappModal.tabs.assessments")}
                                        value="nps"
                                        id="tab-nps"
                                        aria-controls="tabpanel-nps"
                                        className={classes.tabIcon}
                                    />
                                </Tabs>

                                <Box className={classes.content}>
                                    <TabPanel value={tab} name="general">
                                        <Grid container spacing={2}>
                                            {attachmentName && (
                                                <Grid item xs={12}>
                                                    <Box className={classes.attachmentPreview}>
                                                        <Typography variant="body2">
                                                            {attachmentName}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={handleDeleteFile}
                                                            color="secondary"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            )}

                                            <Grid item xs={12} sm={6}>
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    ref={inputFileRef}
                                                    style={{ display: "none" }}
                                                    onChange={handleFileUpload}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => inputFileRef.current.click()}
                                                    startIcon={<UploadIcon />}
                                                    className={classes.uploadButton}
                                                >
                                                    {i18n.t("whatsappModal.buttons.upload")}
                                                </Button>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={isDefaultWhatsApp}
                                                                onChange={(e) => {
                                                                    console.log("isDefault alterado:", e.target.checked);
                                                                    setIsDefaultWhatsApp(e.target.checked);
                                                                }}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={i18n.t("whatsappModal.form.default")}
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                name="allowGroup"
                                                                color="primary"
                                                                checked={values.allowGroup}
                                                                onChange={(e) => {
                                                                    console.log("allowGroup alterado:", e.target.checked);
                                                                    setFieldValue("allowGroup", e.target.checked);
                                                                }}
                                                            />
                                                        }
                                                        label={i18n.t("whatsappModal.form.group")}
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                name="autoImportContacts"
                                                                color="primary"
                                                                checked={values.autoImportContacts}
                                                                onChange={(e) => {
                                                                    console.log("autoImportContacts alterado:", e.target.checked);
                                                                    setFieldValue("autoImportContacts", e.target.checked);
                                                                }}
                                                            />
                                                        }
                                                        label={i18n.t("whatsappModal.form.autoImport")}
                                                    />

                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                name="autoRejectCalls"
                                                                color="primary"
                                                                checked={values.autoRejectCalls}
                                                                onChange={(e) => {
                                                                    console.log("autoRejectCalls alterado:", e.target.checked);
                                                                    setFieldValue("autoRejectCalls", e.target.checked);
                                                                }}
                                                            />
                                                        }
                                                        label={i18n.t("whatsappModal.form.autoReject")}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Field
                                                    as={TextField}
                                                    label={i18n.t("whatsappModal.form.name")}
                                                    name="name"
                                                    error={touched.name && Boolean(errors.name)}
                                                    helperText={touched.name && errors.name}
                                                    variant="outlined"
                                                    fullWidth
                                                    required
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Field name="color" component={ColorPickerField} />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Box className={classes.tokenField}>
                                                    <TextField
                                                        label={i18n.t("whatsappModal.form.token")}
                                                        value={autoToken}
                                                        onChange={handleTokenChange}
                                                        variant="outlined"
                                                        fullWidth
                                                    />
                                                    <Tooltip
                                                        title={i18n.t("whatsappModal.buttons.refresh")}
                                                    >
                                                        <IconButton
                                                            onClick={handleRefreshToken}
                                                            disabled={isSubmitting}
                                                            color="primary"
                                                        >
                                                            <RefreshIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={i18n.t("whatsappModal.buttons.copy")}>
                                                        <IconButton
                                                            onClick={handleCopyToken}
                                                            color={copied ? "secondary" : "default"}
                                                        >
                                                            <CopyIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Grid>

                                            {/* Import Message Section */}
                                            <Grid item xs={12}>
                                                <Paper className={classes.importMessage}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={enableImportMessage}
                                                                onChange={handleEnableImportMessage}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={i18n.t(
                                                            "whatsappModal.form.importOldMessagesEnable"
                                                        )}
                                                    />

                                                    {enableImportMessage && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12}>
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Switch
                                                                                checked={closedTicketsPostImported}
                                                                                onChange={(e) =>
                                                                                    setClosedTicketsPostImported(
                                                                                        e.target.checked
                                                                                    )
                                                                                }
                                                                                color="primary"
                                                                            />
                                                                        }
                                                                        label={i18n.t(
                                                                            "whatsappModal.form.closedTicketsPostImported"
                                                                        )}
                                                                    />
                                                                </Grid>

                                                                <Grid item xs={12} md={6}>
                                                                    <Field
                                                                        fullWidth
                                                                        as={TextField}
                                                                        type="datetime-local"
                                                                        name="importOldMessages"
                                                                        label={i18n.t(
                                                                            "whatsappModal.form.importOldMessages"
                                                                        )}
                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        value={importOldMessages}
                                                                        onChange={(e) =>
                                                                            setImportOldMessages(e.target.value)
                                                                        }
                                                                        variant="outlined"
                                                                    />
                                                                </Grid>

                                                                <Grid item xs={12} md={6}>
                                                                    <Field
                                                                        fullWidth
                                                                        as={TextField}
                                                                        type="datetime-local"
                                                                        name="importRecentMessages"
                                                                        label={i18n.t(
                                                                            "whatsappModal.form.importRecentMessages"
                                                                        )}
                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        value={importRecentMessages}
                                                                        onChange={(e) =>
                                                                            setImportRecentMessages(e.target.value)
                                                                        }
                                                                        variant="outlined"
                                                                    />
                                                                </Grid>

                                                                {enableImportMessage && (
                                                                    <Grid item xs={12}>
                                                                        <Typography color="error" variant="caption">
                                                                            {i18n.t("whatsappModal.form.importAlert")}
                                                                        </Typography>
                                                                    </Grid>
                                                                )}

                                                                {/* Botão para iniciar importação */}
                                                                <Grid item xs={12}>
                                                                    <Button
                                                                        fullWidth
                                                                        variant="contained"
                                                                        color="primary"
                                                                        disabled={isSubmitting}
                                                                        onClick={() => {
                                                                            setShowQrCodeAfterSave(false);
                                                                            handleSaveWhatsApp(values, {
                                                                                setSubmitting: (val) => {}
                                                                            });
                                                                        }}
                                                                        startIcon={<UploadIcon />}
                                                                    >
                                                                        Salvar e Iniciar Importação
                                                                    </Button>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Grid>

                                            {/* Queue Redirection Section */}
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    {i18n.t("whatsappModal.form.queueRedirection")}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    gutterBottom
                                                >
                                                    {i18n.t("whatsappModal.form.queueRedirectionDesc")}
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <FormControl variant="outlined" fullWidth>
                                                            <InputLabel id="sendIdQueue-label">
                                                                {i18n.t("whatsappModal.form.sendIdQueue")}
                                                            </InputLabel>
                                                            <Field
                                                                as={Select}
                                                                name="sendIdQueue"
                                                                labelId="sendIdQueue-label"
                                                                label={i18n.t("whatsappModal.form.sendIdQueue")}
                                                                value={values.sendIdQueue || "0"}
                                                            >
                                                                <MenuItem value="0">&nbsp;</MenuItem>
                                                                {queues.map((queue) => (
                                                                    <MenuItem key={queue.id} value={queue.id}>
                                                                        {queue.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Field>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <Field
                                                            as={TextField}
                                                            name="timeSendQueue"
                                                            label={i18n.t("whatsappModal.form.timeSendQueue")}
                                                            variant="outlined"
                                                            fullWidth
                                                            type="number"
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </TabPanel>

                                    <TabPanel value={tab} name="integrations">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    {i18n.t("whatsappModal.form.availableQueues")}
                                                </Typography>
                                                <QueueSelect
                                                    selectedQueueIds={selectedQueueIds}
                                                    onChange={handleChangeQueue}
                                                />
                                                {/* Debug info - Mostrar quais setores estão selecionados */}
                                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                                                    Setores selecionados (IDs): {selectedQueueIds.join(', ')}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" fullWidth>
                                                    <InputLabel>
                                                        {i18n.t("queueModal.form.integrationId")}
                                                    </InputLabel>
                                                    <Select
                                                        value={selectedIntegration || "0"}
                                                        onChange={handleChangeIntegrationId}
                                                        label={i18n.t("queueModal.form.integrationId")}
                                                    >
                                                        <MenuItem value="0">
                                                            {i18n.t("whatsappModal.form.disabled")}
                                                        </MenuItem>
                                                        {integrations.map((integration) => (
                                                            <MenuItem
                                                                key={integration.id}
                                                                value={integration.id}
                                                            >
                                                                {integration.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" fullWidth>
                                                    <InputLabel>
                                                        {i18n.t("whatsappModal.form.prompt")}
                                                    </InputLabel>
                                                    <Select value={selectedPrompt || "0"}
                                                        onChange={handleChangePrompt}
                                                        label={i18n.t("whatsappModal.form.prompt")}
                                                    >
                                                        <MenuItem value="0">
                                                            {i18n.t("whatsappModal.form.disabled")}
                                                        </MenuItem>
                                                        {prompts.map((prompt) => (
                                                            <MenuItem key={prompt.id} value={prompt.id}>
                                                                {prompt.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </TabPanel>

                                    <TabPanel value={tab} name="messages">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <MessageVariablesPicker
                                                    disabled={isSubmitting}
                                                    onClick={(value) =>
                                                        handleClickMsgVar(value, setFieldValue)
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    label={i18n.t("whatsappModal.form.greetingMessage")}
                                                    name="greetingMessage"
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    spellCheck={true}
                                                    variant="outlined"
                                                    error={
                                                        touched.greetingMessage &&
                                                        Boolean(errors.greetingMessage)
                                                    }
                                                    helperText={
                                                        touched.greetingMessage && errors.greetingMessage
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    label={i18n.t("whatsappModal.form.complationMessage")}
                                                    name="complationMessage"
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    spellCheck={true}
                                                    variant="outlined"
                                                    error={
                                                        touched.complationMessage &&
                                                        Boolean(errors.complationMessage)
                                                    }
                                                    helperText={
                                                        touched.complationMessage && errors.complationMessage
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    label={i18n.t("whatsappModal.form.outOfHoursMessage")}
                                                    name="outOfHoursMessage"
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    spellCheck={true}
                                                    variant="outlined"
                                                    error={
                                                        touched.outOfHoursMessage &&
                                                        Boolean(errors.outOfHoursMessage)
                                                    }
                                                    helperText={
                                                        touched.outOfHoursMessage && errors.outOfHoursMessage
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    label={i18n.t("whatsappModal.form.ratingMessage")}
                                                    name="ratingMessage"
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    spellCheck={true}
                                                    variant="outlined"
                                                    error={
                                                        touched.ratingMessage && Boolean(errors.ratingMessage)
                                                    }
                                                    helperText={
                                                        touched.ratingMessage && errors.ratingMessage
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </TabPanel>

                                    <TabPanel value={tab} name="chatbot">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Field
                                                    as={TextField}
                                                    name="timeCreateNewTicket"
                                                    label={i18n.t("whatsappModal.form.timeCreateNewTicket")}
                                                    type="number"
                                                    fullWidth
                                                    variant="outlined"
                                                    error={
                                                        touched.timeCreateNewTicket &&
                                                        Boolean(errors.timeCreateNewTicket)
                                                    }
                                                    helperText={
                                                        touched.timeCreateNewTicket &&
                                                        errors.timeCreateNewTicket
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Field
                                                    as={TextField}
                                                    name="maxUseBotQueues"
                                                    label={i18n.t("whatsappModal.form.maxUseBotQueues")}
                                                    type="number"
                                                    fullWidth
                                                    variant="outlined"
                                                    error={
                                                        touched.maxUseBotQueues &&
                                                        Boolean(errors.maxUseBotQueues)
                                                    }
                                                    helperText={
                                                        touched.maxUseBotQueues && errors.maxUseBotQueues
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Field
                                                    as={TextField}
                                                    name="timeUseBotQueues"
                                                    label={i18n.t("whatsappModal.form.timeUseBotQueues")}
                                                    type="number"
                                                    fullWidth
                                                    variant="outlined"
                                                    error={
                                                        touched.timeUseBotQueues &&
                                                        Boolean(errors.timeUseBotQueues)
                                                    }
                                                    helperText={
                                                        touched.timeUseBotQueues && errors.timeUseBotQueues
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Field
                                                    as={TextField}
                                                    name="expiresTicket"
                                                    label={i18n.t("whatsappModal.form.expiresTicket")}
                                                    type="number"
                                                    fullWidth
                                                    variant="outlined"
                                                    error={
                                                        touched.expiresTicket &&
                                                        Boolean(errors.expiresTicket)
                                                    }
                                                    helperText={
                                                        touched.expiresTicket && errors.expiresTicket
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <FormControl variant="outlined" fullWidth>
                                                    <InputLabel>
                                                        {i18n.t("whatsappModal.form.whenExpiresTicket")}
                                                    </InputLabel>
                                                    <Field
                                                        as={Select}
                                                        name="whenExpiresTicket"
                                                        label={i18n.t("whatsappModal.form.whenExpiresTicket")}
                                                    >
                                                        <MenuItem value="0">
                                                            {i18n.t("whatsappModal.form.closeLastMessageOptions1")}
                                                        </MenuItem>
                                                        <MenuItem value="1">
                                                            {i18n.t("whatsappModal.form.closeLastMessageOptions2")}
                                                        </MenuItem>
                                                    </Field>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    name="expiresInactiveMessage"
                                                    label={i18n.t("whatsappModal.form.expiresInactiveMessage")}
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    spellCheck={true}
                                                    variant="outlined"
                                                    error={
                                                        touched.expiresInactiveMessage &&
                                                        Boolean(errors.expiresInactiveMessage)
                                                    }
                                                    helperText={
                                                        touched.expiresInactiveMessage &&
                                                        errors.expiresInactiveMessage
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    name="timeInactiveMessage"
                                                    label={i18n.t("whatsappModal.form.timeInactiveMessage")}
                                                    fullWidth
                                                    variant="outlined"
                                                    error={
                                                        touched.timeInactiveMessage &&
                                                        Boolean(errors.timeInactiveMessage)
                                                    }
                                                    helperText={
                                                        touched.timeInactiveMessage &&
                                                        errors.timeInactiveMessage
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    name="inactiveMessage"
                                                    label={i18n.t("whatsappModal.form.inactiveMessage")}
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    spellCheck={true}
                                                    variant="outlined"
                                                    error={
                                                        touched.inactiveMessage &&
                                                        Boolean(errors.inactiveMessage)
                                                    }
                                                    helperText={
                                                        touched.inactiveMessage && errors.inactiveMessage
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </TabPanel>

                                    <TabPanel value={tab} name="nps">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Field
                                                    as={TextField}
                                                    name="ratingMessage"
                                                    label={i18n.t("whatsappModal.form.ratingMessage")}
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    spellCheck={true}
                                                    variant="outlined"
                                                    error={
                                                        touched.ratingMessage &&
                                                        Boolean(errors.ratingMessage)
                                                    }
                                                    helperText={
                                                        touched.ratingMessage && errors.ratingMessage
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </TabPanel>
                                </Box>
                            </Paper>

                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                >
                                    {i18n.t("whatsappModal.buttons.cancel")}
                                </Button>
                                {!whatsAppId && (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={showQrCodeAfterSave}
                                                onChange={(e) => setShowQrCodeAfterSave(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={i18n.t("whatsappModal.form.showQrCodeAfterSave")}
                                    />
                                )}
                                <ActionButton
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    loading={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                    startIcon={<SaveIcon />}
                                >
                                    {whatsAppId
                                        ? i18n.t("whatsappModal.buttons.okEdit")
                                        : i18n.t("whatsappModal.buttons.okAdd")}
                                </ActionButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </>
    );
};

export default React.memo(WhatsAppModal);