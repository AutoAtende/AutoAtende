import React, { useState, useEffect } from "react";
import {
    Paper,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Switch,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon } from "@mui/icons-material";

import { toast } from "../../helpers/toast";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    },
    mainPaper: {
        width: '100%',
        flex: 1,
        padding: theme.spacing(2)
    },
    fullWidth: {
        width: '100%'
    },
    tableContainer: {
        width: '100%',
        overflowX: "scroll",
        ...theme.scrollbarStyles
    },
    textfield: {
        width: '100%'
    },
    textRight: {
        textAlign: 'right'
    },
    row: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    control: {
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1)
    },
    buttonContainer: {
        textAlign: 'right',
        padding: theme.spacing(1)
    }
}));

export function PlanManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles()

    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        value: 0,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
        useEmail: true,
        isVisible: true,
        whiteLabel: true,
        // Novos campos
        useOpenAIAssistants: true,
        useFlowBuilder: true,
        useAPIOfficial: true,
        useChatBotRules: true,
        storageLimit: 500, // Padrão: 500 MB
        openAIAssistantsContentLimit: 100, // Padrão: 100 MB
    });

    useEffect(() => {
        setRecord(initialValue)
    }, [initialValue])

    const handleSubmit = async (data) => {
        data.value = data.value.replace(",", ".");
        onSubmit(data)
    }

    return (
        <Formik
            enableReinitialize
            className={classes.fullWidth}
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => {
                    handleSubmit(values)
                    resetForm()
                }, 500)
            }
        >
            {(values) => (
                <Form className={classes.fullWidth}>
                    <Grid spacing={1} justifyContent="flex-start" container>
                        {/* NOME */}
                        <Grid xs={12} sm={6} md={2} item>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.name")}
                                name="name"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                            />
                        </Grid>

                        {/* USUARIOS */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.users")}
                                name="users"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* CONEXOES */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.connections")}
                                name="connections"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* FILAS */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label="Filas"
                                name="queues"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* VALOR */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label="Valor"
                                name="value"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="text"
                            />
                        </Grid>

                        {/* LIMITE DE ARMAZENAMENTO */}
                        <Grid xs={12} sm={6} md={2} item>
                            <Field
                                as={TextField}
                                label="Limite de Armazenamento (MB)"
                                name="storageLimit"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* LIMITE DE CONTEÚDO OPENAI ASSISTANTS */}
                        <Grid xs={12} sm={6} md={2} item>
                            <Field
                                as={TextField}
                                label="Limite de Conteúdo Agentes (MB)"
                                name="openAIAssistantsContentLimit"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* CAMPANHAS */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useCampaigns-selection">{i18n.t("plans.form.campaigns")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useCampaigns-selection"
                                    label={i18n.t("plans.form.campaigns")}
                                    labelId="useCampaigns-selection-label"
                                    name="useCampaigns"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* AGENDAMENTOS */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useSchedules-selection">{i18n.t("plans.form.schedules")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useSchedules-selection"
                                    label={i18n.t("plans.form.schedules")}
                                    labelId="useSchedules-selection-label"
                                    name="useSchedules"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* CHAT INTERNO */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useInternalChat-selection">Chat Interno</InputLabel>
                                <Field
                                    as={Select}
                                    id="useInternalChat-selection"
                                    label="Chat Interno"
                                    labelId="useInternalChat-selection-label"
                                    name="useInternalChat"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* API Externa */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useExternalApi-selection">API Externa</InputLabel>
                                <Field
                                    as={Select}
                                    id="useExternalApi-selection"
                                    label="API Externa"
                                    labelId="useExternalApi-selection-label"
                                    name="useExternalApi"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* KANBAN */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useKanban-selection">Kanban</InputLabel>
                                <Field
                                    as={Select}
                                    id="useKanban-selection"
                                    label="Kanban"
                                    labelId="useKanban-selection-label"
                                    name="useKanban"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* OPENAI */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useOpenAi-selection">Open.Ai</InputLabel>
                                <Field
                                    as={Select}
                                    id="useOpenAi-selection"
                                    label="Open.Ai"
                                    labelId="useOpenAi-selection-label"
                                    name="useOpenAi"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* OPEN AI ASSISTANTS */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useOpenAIAssistants-selection">Agentes IA</InputLabel>
                                <Field
                                    as={Select}
                                    id="useOpenAIAssistants-selection"
                                    label="Agentes IA"
                                    labelId="useOpenAIAssistants-selection-label"
                                    name="useOpenAIAssistants"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* FLOW BUILDER */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useFlowBuilder-selection">Flow Builder</InputLabel>
                                <Field
                                    as={Select}
                                    id="useFlowBuilder-selection"
                                    label="Flow Builder"
                                    labelId="useFlowBuilder-selection-label"
                                    name="useFlowBuilder"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* API OFICIAL */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useAPIOfficial-selection">API Oficial</InputLabel>
                                <Field
                                    as={Select}
                                    id="useAPIOfficial-selection"
                                    label="API Oficial"
                                    labelId="useAPIOfficial-selection-label"
                                    name="useAPIOfficial"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* CHATBOT RULES */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useChatBotRules-selection">Regras de ChatBot</InputLabel>
                                <Field
                                    as={Select}
                                    id="useChatBotRules-selection"
                                    label="Regras de ChatBot"
                                    labelId="useChatBotRules-selection-label"
                                    name="useChatBotRules"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* INTEGRACOES */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useIntegrations-selection">Integrações</InputLabel>
                                <Field
                                    as={Select}
                                    id="useIntegrations-selection"
                                    label="Integrações"
                                    labelId="useIntegrations-selection-label"
                                    name="useIntegrations"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>
                        
                        {/* EMAIL*/}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useEmail-selection">{i18n.t("plans.form.email")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useEmails-selection"
                                    label={i18n.t("plans.form.email")}
                                    labelId="useEmail-selection-label"
                                    name="useEmail"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>
                        
                        {/* WHITELABEL*/}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="whiteLabel-selection">{i18n.t("plans.form.whiteLabel")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="whiteLabel-selection"
                                    label={i18n.t("plans.form.whiteLabel")}
                                    labelId="whiteLabel-selection-label"
                                    name="whiteLabel"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Grid xs={12} sm={6} md={4} item>
                        <Field
                            as={Switch}
                            label="Visível"
                            name="isVisible"
                            checked={values.values.isVisible}
                            onChange={(event, checked) => values.setFieldValue("isVisible", checked)}
                            color="primary"
                        /> {i18n.t("plans.form.isVisible")}
                    </Grid>

                    <Grid spacing={2} justifyContent="flex-end" container>
                        <Grid sm={3} md={2} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onCancel()} variant="contained">
                                {i18n.t("plans.form.clear")}
                            </ButtonWithSpinner>
                        </Grid>
                        {record.id !== undefined ? (
                            <Grid sm={3} md={2} item>
                                <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onDelete(record)} variant="contained" color="secondary">
                                    {i18n.t("plans.form.delete")}
                                </ButtonWithSpinner>
                            </Grid>
                        ) : null}
                        <Grid sm={3} md={2} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} type="submit" variant="contained" color="primary">
                                {i18n.t("plans.form.save")}
                            </ButtonWithSpinner>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    )
}

export function PlansManagerGrid(props) {
    const { records, onSelect } = props
    const classes = useStyles()
    
    const renderCampaigns = (row) => {
        return row.useCampaigns === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderSchedules = (row) => {
        return row.useSchedules === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderInternalChat = (row) => {
        return row.useInternalChat === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderExternalApi = (row) => {
        return row.useExternalApi === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderKanban = (row) => {
        return row.useKanban === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderOpenAi = (row) => {
        return row.useOpenAi === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderOpenAIAssistants = (row) => {
        return row.useOpenAIAssistants === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderFlowBuilder = (row) => {
        return row.useFlowBuilder === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderAPIOfficial = (row) => {
        return row.useAPIOfficial === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderChatBotRules = (row) => {
        return row.useChatBotRules === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderIntegrations = (row) => {
        return row.useIntegrations === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderEmail = (row) => {
        return row.useEmail === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderWhiteLabel = (row) => {
        return row.whiteLabel === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    return (
        <Paper className={classes.tableContainer}>
            <Table
                className={classes.fullWidth}
                padding="none"
                aria-label="a dense table"
            >
                <TableHead>
                    <TableRow>
                        <TableCell align="center" style={{ width: '1%' }}>#</TableCell>
                        <TableCell align="left">{i18n.t("plans.form.name")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.users")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.connections")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.queue")}</TableCell>
                        <TableCell align="center">Valor</TableCell>
                        <TableCell align="center">Armazenamento</TableCell>
                        <TableCell align="center">Limite IA</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.campaigns")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.schedules")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.chat")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.api")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.kanban")}</TableCell>
                        <TableCell align="center">Open.Ai</TableCell>
                        <TableCell align="center">Agentes IA</TableCell>
                        <TableCell align="center">Flow Builder</TableCell>
                        <TableCell align="center">API Oficial</TableCell>
                        <TableCell align="center">Regras Chatbot</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.integrations")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.email")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.whiteLabel")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.isVisible")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell align="center" style={{ width: '1%' }}>
                                <IconButton onClick={() => onSelect(row)} aria-label="delete" size="large">
                                    <EditIcon />
                                </IconButton>
                            </TableCell>
                            <TableCell align="left">{row.name || '-'}</TableCell>
                            <TableCell align="center">{row.users || '-'}</TableCell>
                            <TableCell align="center">{row.connections || '-'}</TableCell>
                            <TableCell align="center">{row.queues || '-'}</TableCell>
                            <TableCell align="center">{i18n.t("plans.form.money")} {row.value ? row.value.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00.00'}</TableCell>
                            <TableCell align="center">{row.storageLimit || '-'} MB</TableCell>
                            <TableCell align="center">{row.openAIAssistantsContentLimit || '-'} MB</TableCell>
                            <TableCell align="center">{renderCampaigns(row)}</TableCell>
                            <TableCell align="center">{renderSchedules(row)}</TableCell>
                            <TableCell align="center">{renderInternalChat(row)}</TableCell>
                            <TableCell align="center">{renderExternalApi(row)}</TableCell>
                            <TableCell align="center">{renderKanban(row)}</TableCell>
                            <TableCell align="center">{renderOpenAi(row)}</TableCell>
                            <TableCell align="center">{renderOpenAIAssistants(row)}</TableCell>
                            <TableCell align="center">{renderFlowBuilder(row)}</TableCell>
                            <TableCell align="center">{renderAPIOfficial(row)}</TableCell>
                            <TableCell align="center">{renderChatBotRules(row)}</TableCell>
                            <TableCell align="center">{renderIntegrations(row)}</TableCell>
                            <TableCell align="center">{renderEmail(row)}</TableCell>
                            <TableCell align="center">{renderWhiteLabel(row)}</TableCell>
                            <TableCell align="center">{row.isVisible ? 'Sim' : 'Não'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

export default function PlansManager() {
    const classes = useStyles()
    const { list, save, update, remove } = usePlans()

    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState([])
    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        value: 0,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
        useEmail: true,
        isVisible: false,
        whiteLabel: true,
        // Novos campos
        useOpenAIAssistants: true,
        useFlowBuilder: true,
        useAPIOfficial: true,
        useChatBotRules: true,
        storageLimit: 500, // Padrão: 500 MB
        openAIAssistantsContentLimit: 100, // Padrão: 100 MB
    })

    useEffect(() => {
        async function fetchData() {
            await loadPlans()
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record])

    const loadPlans = async () => {
        setLoading(true)
        try {
            const planList = await list()
            setRecords(planList)
        } catch (e) {
            toast.error('Não foi possível carregar a lista de registros')
        }
        setLoading(false)
    }

    const handleSubmit = async (data) => {
        setLoading(true)
        console.log(data)
        try {
            if (data.id !== undefined) {
                await update(data)
            } else {
                await save(data)
            }
            await loadPlans()
            handleCancel()
            toast.success('Operação realizada com sucesso!')
        } catch (e) {
            toast.error('Não foi possível realizar a operação. Verifique se já existe uma plano com o mesmo nome ou se os campos foram preenchidos corretamente')
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await remove(record.id)
            await loadPlans()
            handleCancel()
            toast.success('Operação realizada com sucesso!')
        } catch (e) {
            toast.error('Não foi possível realizar a operação')
        }
        setLoading(false)
    }

    const handleOpenDeleteDialog = () => {
        setShowConfirmDialog(true)
    }

    const handleCancel = () => {
        setRecord({
            id: undefined,
            name: '',
            users: 0,
            connections: 0,
            queues: 0,
            value: 0,
            useCampaigns: true,
            useSchedules: true,
            useInternalChat: true,
            useExternalApi: true,
            useKanban: true,
            useOpenAi: true,
            useIntegrations: true,
            useEmail: true,
            isVisible: false,
            whiteLabel: true,
            // Novos campos
            useOpenAIAssistants: true,
            useFlowBuilder: true,
            useAPIOfficial: true,
            useChatBotRules: true,
            storageLimit: 500, // Padrão: 500 MB
            openAIAssistantsContentLimit: 100, // Padrão: 100 MB
        })
    }

    const handleSelect = (data) => {
        let useCampaigns = data.useCampaigns === false ? false : true
        let useSchedules = data.useSchedules === false ? false : true
        let useInternalChat = data.useInternalChat === false ? false : true
        let useExternalApi = data.useExternalApi === false ? false : true
        let useKanban = data.useKanban === false ? false : true
        let useOpenAi = data.useOpenAi === false ? false : true
        let useIntegrations = data.useIntegrations === false ? false : true
        let useEmail = data.useEmail === false ? false : true
        let whiteLabel = data.whiteLabel === false ? false : true
        
        // Novos campos
        let useOpenAIAssistants = data.useOpenAIAssistants === false ? false : true
        let useFlowBuilder = data.useFlowBuilder === false ? false : true
        let useAPIOfficial = data.useAPIOfficial === false ? false : true
        let useChatBotRules = data.useChatBotRules === false ? false : true

        setRecord({
            id: data.id,
            name: data.name || '',
            users: data.users || 0,
            connections: data.connections || 0,
            queues: data.queues || 0,
            value: data.value?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || 0,
            useCampaigns,
            useSchedules,
            useInternalChat,
            useExternalApi,
            useKanban,
            useOpenAi,
            useIntegrations,
            useEmail,
            isVisible: data.isVisible,
            whiteLabel,
            // Novos campos
            useOpenAIAssistants,
            useFlowBuilder,
            useAPIOfficial,
            useChatBotRules,
            storageLimit: data.storageLimit || 500,
            openAIAssistantsContentLimit: data.openAIAssistantsContentLimit || 100,
        })
    }

    return (
        <Paper className={classes.mainPaper} elevation={0}>
            <Grid spacing={2} container>
                <Grid xs={12} item>
                    <PlanManagerForm
                        initialValue={record}
                        onDelete={handleOpenDeleteDialog}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </Grid>
                <Grid xs={12} item>
                    <PlansManagerGrid
                        records={records}
                        onSelect={handleSelect}
                    />
                </Grid>
            </Grid>
            <ConfirmationModal
                title="Exclusão de Registro"
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={() => handleDelete()}
            >
                {i18n.t("plans.form.delete")}
            </ConfirmationModal>
        </Paper>
    )
}