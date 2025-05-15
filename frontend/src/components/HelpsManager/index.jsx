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
    Typography,
    Box,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Divider,
    Tooltip,
    Alert
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Clear as ClearIcon,
    DeleteSweep as DeleteSweepIcon,
    Add as AddIcon,
    YouTube as YouTubeIcon,
    Help as HelpIcon,
    Cancel as CancelIcon
} from "@mui/icons-material";

import { toast } from "react-toastify";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    },
    mainPaper: {
        width: '100%',
        flex: 1,
        padding: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1)
        }
    },
    fullWidth: {
        width: '100%'
    },
    tableContainer: {
        width: '100%',
        overflowX: "auto",
        ...theme.scrollbarStyles,
        marginTop: theme.spacing(2)
    },
    textfield: {
        width: '100%'
    },
    card: {
        marginBottom: theme.spacing(2)
    },
    buttonContainer: {
        display: 'flex',
        gap: theme.spacing(1),
        marginTop: theme.spacing(2),
        flexWrap: 'wrap'
    },
    actionButton: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        '& .MuiSvgIcon-root': {
            marginRight: theme.spacing(0.5)
        }
    },
    mobileCard: {
        marginBottom: theme.spacing(2)
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: theme.spacing(1),
        padding: theme.spacing(1)
    },
    title: {
        marginBottom: theme.spacing(2)
    },
    formContainer: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`
    }
}));

const HelpFormCard = ({ onSubmit, onDelete, onCancel, initialValue, loading }) => {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {initialValue.id ? 'Editar Ajuda' : 'Nova Ajuda'}
                </Typography>
                <Formik
                    enableReinitialize
                    initialValues={initialValue}
                    onSubmit={(values, { resetForm }) =>
                        setTimeout(() => {
                            onSubmit(values);
                            resetForm();
                        }, 500)
                    }
                >
                    {() => (
                        <Form>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Field
                                        as={TextField}
                                        label="Título"
                                        name="title"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Field
                                        as={TextField}
                                        label="Código do Vídeo"
                                        name="video"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            startAdornment: <YouTubeIcon color="action" />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Field
                                        as={TextField}
                                        label="Descrição"
                                        name="description"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={1}
                                    />
                                </Grid>
                            </Grid>
                            <Box className={classes.buttonContainer}>
                                <ButtonWithSpinner
                                    loading={loading}
                                    onClick={onCancel}
                                    variant="outlined"
                                    className={classes.actionButton}
                                    startIcon={<ClearIcon />}
                                >
                                    Limpar
                                </ButtonWithSpinner>
                                {initialValue.id && (
                                    <ButtonWithSpinner
                                        loading={loading}
                                        onClick={() => onDelete(initialValue)}
                                        variant="outlined"
                                        color="error"
                                        className={classes.actionButton}
                                        startIcon={<DeleteIcon />}
                                    >
                                        Excluir
                                    </ButtonWithSpinner>
                                )}
                                <ButtonWithSpinner
                                    loading={loading}
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className={classes.actionButton}
                                    startIcon={<SaveIcon />}
                                >
                                    Salvar
                                </ButtonWithSpinner>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </CardContent>
        </Card>
    );
};

const HelpList = ({ records, onSelect, isMobile }) => {
    const classes = useStyles();

    if (isMobile) {
        return (
            <Box>
                {records.map((record) => (
                    <Card key={record.id} className={classes.mobileCard}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                {record.title || '-'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {record.description || '-'}
                            </Typography>
                            {record.video && (
                                <Box mt={1}>
                                    <Typography variant="body2" color="primary">
                                        <YouTubeIcon fontSize="small" /> {record.video}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                        <Divider />
                        <Box className={classes.cardActions}>
                            <Tooltip title="Editar">
                                <IconButton onClick={() => onSelect(record)} size="small">
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Card>
                ))}
            </Box>
        );
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell align="center" style={{ width: '1%' }}>#</TableCell>
                    <TableCell>Título</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Vídeo</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {records.map((row) => (
                    <TableRow key={row.id} hover>
                        <TableCell align="center">
                            <Tooltip title="Editar">
                                <IconButton onClick={() => onSelect(row)} size="small">
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                        <TableCell>{row.title || '-'}</TableCell>
                        <TableCell>{row.description || '-'}</TableCell>
                        <TableCell>
                            {row.video ? (
                                <Box display="flex" alignItems="center">
                                    <YouTubeIcon fontSize="small" color="error" />
                                    <Box ml={1}>{row.video}</Box>
                                </Box>
                            ) : (
                                '-'
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default function HelpsManager() {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { list, save, update, remove, removeAll } = useHelps();

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showConfirmDialogAll, setShowConfirmDialogAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [record, setRecord] = useState({
        title: '',
        description: '',
        video: ''
    });

    useEffect(() => {
        loadHelps();
    }, []);

    const loadHelps = async () => {
        setLoading(true);
        try {
            const helpList = await list();
            setRecords(helpList);
        } catch (e) {
            toast.error('Não foi possível carregar a lista de ajudas');
        }
        setLoading(false);
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            if (data.id) {
                await update(data);
            } else {
                await save(data);
            }
            await loadHelps();
            handleCancel();
            toast.success('Operação realizada com sucesso!');
        } catch (e) {
            toast.error('Erro ao salvar. Verifique se já existe uma ajuda com o mesmo título.');
        }
        setLoading(false);
    };

    const handleDeleteAll = async () => {
        setLoading(true);
        try {
            await removeAll();
            await loadHelps();
            handleCancel();
            toast.success('Todos os registros foram removidos');
        } catch (e) {
            toast.error('Erro ao remover registros');
        }
        setLoading(false);
        setShowConfirmDialogAll(false);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await remove(record.id);
            await loadHelps();
            handleCancel();
            toast.success('Registro removido com sucesso!');
        } catch (e) {
            toast.error('Erro ao remover registro');
        }
        setLoading(false);
        setShowConfirmDialog(false);
    };

    const handleCancel = () => {
        setRecord({
            title: '',
            description: '',
            video: ''
        });
    };

    const handleSelect = (data) => {
        setRecord({
            id: data.id,
            title: data.title || '',
            description: data.description || '',
            video: data.video || ''
        });
    };

    return (
        <Box className={classes.root}>
            <Paper className={classes.mainPaper} elevation={0}>
                <Box className={classes.content}>
                    <Box className={classes.title}>
                        <Typography variant="h5" component="h1">
                            Gerenciamento de Ajudas
                        </Typography>
                    </Box>
    
                    {records.length === 0 && !loading && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Nenhum registro encontrado. Comece adicionando uma nova ajuda!
                        </Alert>
                    )}
    
                    <HelpFormCard
                        initialValue={record}
                        onDelete={() => setShowConfirmDialog(true)}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            Registros ({records.length})
                        </Typography>
                        <ButtonWithSpinner
                            variant="outlined"
                            color="error"
                            onClick={() => setShowConfirmDialogAll(true)}
                            loading={loading}
                            disabled={records.length === 0}
                            startIcon={<DeleteSweepIcon />}
                        >
                            Limpar Todos
                        </ButtonWithSpinner>
                    </Box>
    
                    <Paper className={classes.tableContainer}>
                        <HelpList
                            records={records}
                            onSelect={handleSelect}
                            isMobile={isMobile}
                        />
                    </Paper>
                </Box>
    
                <ConfirmationModal
                    title="Confirmação de Exclusão"
                    open={showConfirmDialog}
                    onClose={() => setShowConfirmDialog(false)}
                    onConfirm={handleDelete}
                >
                    <Typography>
                        Deseja realmente excluir este registro?
                    </Typography>
                </ConfirmationModal>
    
                <ConfirmationModal
                    title="Limpar Todos os Registros"
                    open={showConfirmDialogAll}
                    onClose={() => setShowConfirmDialogAll(false)}
                    onConfirm={handleDeleteAll}
                >
                    <Typography color="error">
                        Atenção! Esta ação irá remover todos os registros de ajuda.
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Deseja continuar?
                    </Typography>
                </ConfirmationModal>
            </Paper>
        </Box>
    );
}