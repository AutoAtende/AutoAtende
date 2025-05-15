import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, FieldArray } from "formik";
import { toast } from "../../helpers/toast";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip
} from "@mui/material";
import {
    AttachFile as AttachFileIcon,
    Delete as DeleteIcon,
    Description as FileIcon,
    CloudUpload as CloudUploadIcon
} from "@mui/icons-material";
import { green } from "@mui/material/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const FileListSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, "Nome muito curto")
        .required("Obrigatório"),
    message: Yup.string()
        .required("Obrigatório"),
    options: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required("Nome do arquivo é obrigatório")
        })
    )
});

const FilesModal = ({ open, onClose, fileListId, reload }) => {
    const { user } = useContext(AuthContext);
    const [uploading, setUploading] = useState(false);

    const initialState = {
        name: "",
        message: "",
        options: [],
    };

    const [fileList, setFileList] = useState(initialState);

    useEffect(() => {
        const fetchFileList = async () => {
            if (!fileListId) {
                setFileList(initialState);
                return;
            }

            try {
                const { data } = await api.get(`/files/${fileListId}`);
                setFileList(data);
            } catch (err) {
                toast.error("Erro ao carregar lista de arquivos");
            }
        };

        fetchFileList();
    }, [fileListId, open]);

    const handleClose = () => {
        setFileList(initialState);
        onClose();
    };

    const uploadFiles = async (options, filesOptions, id) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("fileId", id);
        formData.append("typeArch", "fileList");

        filesOptions.forEach((fileOption, index) => {
            if (fileOption.file) {
                formData.append("files", fileOption.file);
                formData.append("mediaType", fileOption.file.type);
                formData.append("name", options[index].name);
                formData.append("id", options[index].id);
            }
        });

        try {
            await api.post(`/files/uploadList/${id}`, formData);
            toast.success("Arquivos enviados com sucesso!");
        } catch (err) {
            toast.error("Erro ao enviar arquivos");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveFileList = async (values, { setSubmitting }) => {
        const fileData = { ...values, userId: user.id };
        
        try {
            if (fileListId) {
                const { data } = await api.put(`/files/${fileListId}`, fileData);
                if (data.options.length > 0 && values.options.some(opt => opt.file)) {
                    await uploadFiles(data.options, values.options, fileListId);
                }
            } else {
                const { data } = await api.post("/files", fileData);
                if (values.options.some(opt => opt.file)) {
                    await uploadFiles(data.options, values.options, data.id);
                }
            }
            
            toast.success(i18n.t("fileModal.success"));
            if (typeof reload === 'function') {
                reload();
            }
            handleClose();
        } catch (err) {
            toast.error("Erro ao salvar lista de arquivos");
        } finally {
            setSubmitting(false);
        }
    };

    const getFileSize = (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Dialog 
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle>
                {fileListId ? "Editar Lista de Arquivos" : "Nova Lista de Arquivos"}
            </DialogTitle>
            
            <Formik
                initialValues={fileList}
                enableReinitialize
                validationSchema={FileListSchema}
                onSubmit={handleSaveFileList}
            >
                {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label="Nome da Lista"
                                        name="name"
                                        fullWidth
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label="Mensagem"
                                        name="message"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        error={touched.message && Boolean(errors.message)}
                                        helperText={touched.message && errors.message}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Paper variant="outlined" style={{ padding: 16 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Arquivos
                                        </Typography>
                                        
                                        <FieldArray name="options">
                                            {({ push, remove }) => (
                                                <>
                                                    <List>
                                                        {values.options.map((option, index) => (
                                                            <ListItem
                                                                key={index}
                                                                divider
                                                                style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                                                            >
                                                                <Grid container spacing={2} alignItems="center">
                                                                    <Grid item xs={12} sm={6}>
                                                                        <Field
                                                                            as={TextField}
                                                                            name={`options.${index}.name`}
                                                                            label="Nome do Arquivo"
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            size="small"
                                                                            error={touched.options?.[index]?.name && Boolean(errors.options?.[index]?.name)}
                                                                            helperText={touched.options?.[index]?.name && errors.options?.[index]?.name}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <input
                                                                            type="file"
                                                                            id={`file-upload-${index}`}
                                                                            style={{ display: 'none' }}
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                setFieldValue(`options.${index}.file`, file);
                                                                            }}
                                                                        />
                                                                        <label htmlFor={`file-upload-${index}`}>
                                                                            <Button
                                                                                variant="outlined"
                                                                                component="span"
                                                                                startIcon={<CloudUploadIcon />}
                                                                                size="small"
                                                                                fullWidth
                                                                            >
                                                                                Selecionar Arquivo
                                                                            </Button>
                                                                        </label>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={2}>
                                                                        <IconButton 
                                                                            onClick={() => remove(index)}
                                                                            color="error"
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Grid>
                                                                    {(option.file || option.path) && (
                                                                        <Grid item xs={12}>
                                                                            <Chip
                                                                                icon={<FileIcon />}
                                                                                label={
                                                                                    option.file 
                                                                                        ? `${option.file.name} (${getFileSize(option.file.size)})`
                                                                                        : option.path
                                                                                }
                                                                                variant="outlined"
                                                                                color="primary"
                                                                                size="small"
                                                                            />
                                                                        </Grid>
                                                                    )}
                                                                </Grid>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<AttachFileIcon />}
                                                        onClick={() => push({ name: "", path: "" })}
                                                        style={{ marginTop: 16 }}
                                                    >
                                                        Adicionar Arquivo
                                                    </Button>
                                                </>
                                            )}
                                        </FieldArray>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions>
                            <Button
                                onClick={handleClose}
                                color="secondary"
                                disabled={isSubmitting || uploading}
                                variant="outlined"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                disabled={isSubmitting || uploading}
                                variant="contained"
                                startIcon={isSubmitting || uploading ? <CircularProgress size={20} /> : null}
                            >
                                {fileListId ? "Atualizar" : "Criar"}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default FilesModal;