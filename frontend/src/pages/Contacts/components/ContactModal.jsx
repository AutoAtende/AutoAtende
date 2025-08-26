import React, { useState, useEffect, useRef } from "react";
import { Formik, FieldArray, Form, Field } from "formik";
import * as Yup from "yup";
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    IconButton,
    CircularProgress,
    FormControlLabel,
    Switch,
    Autocomplete,
    Stack,
    Typography,
    InputAdornment,
    Tooltip,
    Divider,
    Box,
    Button,
    useTheme
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    Work as WorkIcon,
    SmartToyOutlined as SmartToyOutlinedIcon,
    Info as InfoIcon
} from '@mui/icons-material';

import { toast } from "../../../helpers/toast";
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";
import ContactPhoneInput from './ContactPhoneInput';
import ContactProfilePicture from './ContactProfilePicture';
import ContactTagsManager from './ContactTagsManager';

// Esquema de validação
const ContactSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Nome muito curto")
        .required("Nome é obrigatório"),
    number: Yup.string()
        .required("Número é obrigatório"),
    email: Yup.string()
        .email("Email inválido")
        .nullable()
});

const ContactModal = ({ open, onClose, contactId, onSave }) => {
    console.log('ContactModal renderizado:', { open, contactId });
    
    const theme = useTheme();
    const phoneInputRef = useRef(null);
    const formikRef = useRef(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [employers, setEmployers] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [newPositionName, setNewPositionName] = useState("");
    const [disableBot, setDisableBot] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState("");
    const [contactTags, setContactTags] = useState([]);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    
    // Valores iniciais do formulário
    const [initialValues, setInitialValues] = useState({
        name: "",
        number: "",
        email: "",
        extraInfo: []
    });

    // Reset completo do estado
    const resetForm = () => {
        console.log('Resetando formulário...');
        setInitialValues({
            name: "",
            number: "",
            email: "",
            extraInfo: []
        });
        setSelectedEmployer(null);
        setSelectedPosition(null);
        setNewPositionName("");
        setDisableBot(false);
        setProfilePicUrl("");
        setContactTags([]);
        setTagsLoaded(false);
    };

    // Carregar dados quando modal abrir
    useEffect(() => {
        if (!open) {
            resetForm();
            return;
        }
        
        console.log('Modal aberto, carregando dados...');
        loadModalData();
    }, [open, contactId]);

    const loadModalData = async () => {
        try {
            setIsLoading(true);
            setTagsLoaded(false);
            
            console.log('Iniciando carregamento de dados...');
            
            // Carregar listas básicas
            const [employersRes, positionsRes] = await Promise.all([
                api.get('/employers', { 
                    params: { 
                        searchParam: '', 
                        page: 0, 
                        limit: 999999 
                    } 
                }),
                api.get('/positions/simplified', { 
                    params: { 
                        searchParam: '', 
                        page: 1, 
                        limit: 999999 
                    } 
                })
            ]);
            
            const employersData = employersRes.data?.employers || [];
            const positionsData = positionsRes.data?.positions || [];
            
            console.log('Dados carregados:', { 
                employers: employersData.length, 
                positions: positionsData.length 
            });
            
            setEmployers(employersData);
            setPositions(positionsData);
            
            // Se é edição, carregar dados do contato
            if (contactId) {
                console.log('Carregando contato para edição:', contactId);
                const contactRes = await api.get(`/contacts/${contactId}`);
                const contactData = contactRes.data;
                
                console.log('Dados do contato carregados:', contactData);
                
                // Configurar valores iniciais
                const newInitialValues = {
                    name: String(contactData.name || ""),
                    number: String(contactData.number || ""),
                    email: String(contactData.email || ""),
                    extraInfo: Array.isArray(contactData.extraInfo) 
                        ? contactData.extraInfo.map(info => ({
                            name: String(info?.name || ""),
                            value: String(info?.value || "")
                        }))
                        : []
                };
                
                console.log('Configurando valores iniciais:', newInitialValues);
                setInitialValues(newInitialValues);
                
                setDisableBot(contactData.disableBot || false);
                setProfilePicUrl(contactData.profilePicUrl || "");
                
                // Configurar employer e position
                if (contactData.employerId) {
                    const employer = employersData.find(emp => emp.id === contactData.employerId);
                    console.log('Employer encontrado:', employer);
                    setSelectedEmployer(employer || null);
                }
                
                if (contactData.positionId) {
                    const position = positionsData.find(pos => pos.id === contactData.positionId);
                    console.log('Position encontrada:', position);
                    setSelectedPosition(position || null);
                }
                
                // Tags serão carregadas pelo ContactTagsManager automaticamente
            } else {
                console.log('Novo contato - configurando valores padrão');
                setInitialValues({
                    name: "",
                    number: "",
                    email: "",
                    extraInfo: []
                });
            }
            
            setTagsLoaded(true);
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados do contato');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        console.log('Iniciando submit:', values);
        
        try {
            setIsSaving(true);
            
            // Validação do telefone
            let fullNumber = values.number;
            let isValidPhone = true;
            
            if (phoneInputRef.current) {
                try {
                    fullNumber = phoneInputRef.current.getNumber();
                    isValidPhone = phoneInputRef.current.isValidNumber();
                    
                    console.log('Validação telefone:', { 
                        original: values.number, 
                        processed: fullNumber, 
                        isValid: isValidPhone 
                    });
                    
                    // Debug
                    if (phoneInputRef.current.debug) {
                        phoneInputRef.current.debug();
                    }
                } catch (phoneErr) {
                    console.error("Erro ao validar telefone:", phoneErr);
                    isValidPhone = false;
                }
                
                if (!isValidPhone || !fullNumber) {
                    setFieldError('number', 'Número de telefone inválido');
                    toast.error('Número de telefone inválido');
                    return;
                }
            } else {
                console.warn('phoneInputRef não disponível, usando validação simples');
                if (!values.number || values.number.trim().length < 8) {
                    setFieldError('number', 'Número de telefone inválido');
                    toast.error('Número de telefone inválido');
                    return;
                }
                fullNumber = values.number.trim().replace(/\D/g, '');
            }
    
            // Preparar dados do contato
            const contactData = {
                name: values.name.trim(),
                number: fullNumber,
                email: values.email?.trim() || "",
                extraInfo: Array.isArray(values.extraInfo) ? values.extraInfo.filter(info => 
                    info && info.name && info.name.trim() && info.value && info.value.trim()
                ) : [],
                disableBot,
                employerId: selectedEmployer?.id || null,
                positionId: selectedPosition?.id || null,
                positionName: newPositionName.trim() || undefined,
                profilePicUrl: profilePicUrl || undefined,
                isGroup: false,
                isPBX: false
            };
            
            console.log('Dados preparados para envio:', contactData);
            
            let savedContact;
            
            if (contactId) {
                console.log('Atualizando contato existente:', contactId);
                const { data } = await api.put(`/contacts/${contactId}`, contactData);
                savedContact = { ...data, id: contactId };
                toast.success('Contato atualizado com sucesso');
            } else {
                console.log('Criando novo contato');
                const { data } = await api.post("/contacts", contactData);
                savedContact = data;
                toast.success('Contato criado com sucesso');
            }
            
            console.log('Contato salvo:', savedContact);
            
            // Chamar callback de salvamento
            if (onSave && typeof onSave === 'function') {
                onSave(savedContact);
            }
            
            // Fechar modal
            onClose();
            
        } catch (error) {
            console.error('Erro ao salvar contato:', error);
            
            let errorMessage = 'Erro ao salvar contato';
            
            if (error.response?.status === 400) {
                if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
                    errorMessage = error.response.data.errors[0]?.message || errorMessage;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.log('Erro tratado:', errorMessage);
            toast.error(errorMessage);
            
            // Tratamento específico de erros
            if (errorMessage.toLowerCase().includes('número') || errorMessage.toLowerCase().includes('telefone')) {
                setFieldError('number', errorMessage);
            }
            if (errorMessage.toLowerCase().includes('nome')) {
                setFieldError('name', errorMessage);
            }
            if (errorMessage.toLowerCase().includes('email')) {
                setFieldError('email', errorMessage);
            }
            
        } finally {
            setIsSaving(false);
            setSubmitting(false);
        }
    };

    const handleProfileUpdate = (updatedData) => {
        console.log('Profile atualizado:', updatedData);
        if (updatedData && updatedData.profilePicUrl) {
            setProfilePicUrl(updatedData.profilePicUrl);
        }
    };

    const handleTagsChange = (tags) => {
        console.log('Tags alteradas:', tags);
        setContactTags(Array.isArray(tags) ? tags : []);
    };

    const handleClose = () => {
        console.log('Fechando modal');
        if (!isSaving) {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={isSaving}
            PaperProps={{
                sx: { 
                    borderRadius: 3,
                    maxHeight: '90vh',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {contactId ? 'Editar Contato' : 'Novo Contato'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {contactId ? 'Atualize as informações do contato' : 'Preencha os dados para criar um novo contato'}
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={handleClose} 
                        size="small"
                        disabled={isSaving}
                        sx={{ 
                            bgcolor: 'grey.100',
                            '&:hover': { bgcolor: 'grey.200' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3, maxHeight: '65vh', overflow: 'auto' }}>
                    {isLoading ? (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="200px"
                        >
                            <Stack alignItems="center" spacing={2}>
                                <CircularProgress size={40} thickness={4} />
                                <Typography variant="body2" color="text.secondary">
                                    Carregando dados do contato...
                                </Typography>
                            </Stack>
                        </Box>
                    ) : (
                        <Formik
                            ref={formikRef}
                            initialValues={initialValues}
                            enableReinitialize={true}
                            validationSchema={ContactSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ values, errors, touched, isSubmitting, setFieldValue, setFieldError, setFieldTouched, handleSubmit: formikSubmit }) => (
                                <>
                                    <Form noValidate autoComplete="off">
                                        <Stack spacing={3}>
                                            {/* Foto de Perfil - só aparece na edição */}
                                            {contactId && (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'center',
                                                    py: 2
                                                }}>
                                                    <Stack alignItems="center" spacing={2}>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            color="primary" 
                                                            sx={{ fontWeight: 600 }}
                                                        >
                                                            Foto de Perfil
                                                        </Typography>
                                                        <ContactProfilePicture
                                                            contactNumber={values.number?.replace(/\D/g, '') || ''}
                                                            name={values.name}
                                                            size={120}
                                                            profilePicUrl={profilePicUrl}
                                                            onUpdateComplete={handleProfileUpdate}
                                                            showRefreshButton={true}
                                                        />
                                                        <Typography variant="caption" color="text.secondary" align="center">
                                                            Clique na foto para atualizá-la automaticamente
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            )}

                                            <Typography 
                                                variant="h6" 
                                                color="primary" 
                                                sx={{ 
                                                    fontWeight: 600,
                                                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                    pb: 1
                                                }}
                                            >
                                                Informações Básicas
                                            </Typography>
                                            
                                            {/* Nome */}
                                            <Field name="name">
                                                {({ field, meta }) => (
                                                    <TextField
                                                        {...field}
                                                        value={String(field.value || "")}
                                                        label="Nome Completo"
                                                        variant="outlined"
                                                        fullWidth
                                                        required
                                                        error={meta.touched && Boolean(meta.error)}
                                                        helperText={meta.touched && meta.error ? String(meta.error) : ""}
                                                        disabled={isSaving}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <PersonIcon color="primary" />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': {
                                                                    borderColor: 'grey.300',
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: 'primary.main',
                                                                    borderWidth: 2,
                                                                },
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                            
                                            {/* Telefone */}
                                            <Box>
                                                <ContactPhoneInput
                                                    ref={phoneInputRef}
                                                    value={String(values.number || "")}
                                                    onChange={(phone) => {
                                                        console.log('Phone mudou:', phone);
                                                        setFieldValue('number', String(phone || ""));
                                                        
                                                        // Validação em tempo real
                                                        setTimeout(() => {
                                                            if (phoneInputRef.current) {
                                                                try {
                                                                    const isValid = phoneInputRef.current.isValidNumber();
                                                                    if (!isValid && phone) {
                                                                        setFieldError('number', 'Número de telefone inválido');
                                                                    } else if (isValid) {
                                                                        setFieldError('number', undefined);
                                                                    }
                                                                } catch (err) {
                                                                    console.warn('Erro na validação em tempo real:', err);
                                                                }
                                                            }
                                                        }, 100);
                                                    }}
                                                    error={touched.number && Boolean(errors.number)}
                                                    helperText={touched.number && errors.number ? String(errors.number) : ""}
                                                    label="Número de Telefone"
                                                    required
                                                    disabled={isSaving}
                                                />
                                            </Box>

                                            {/* Email */}
                                            <Field name="email">
                                                {({ field, meta }) => (
                                                    <TextField
                                                        {...field}
                                                        value={String(field.value || "")}
                                                        label="Email (Opcional)"
                                                        variant="outlined"
                                                        fullWidth
                                                        type="email"
                                                        error={meta.touched && Boolean(meta.error)}
                                                        helperText={meta.touched && meta.error ? String(meta.error) : "Digite um email válido"}
                                                        placeholder="exemplo@email.com"
                                                        disabled={isSaving}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <EmailIcon color="primary" />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': {
                                                                    borderColor: 'grey.300',
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: 'primary.main',
                                                                    borderWidth: 2,
                                                                },
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Field>

                                            <Divider sx={{ my: 2 }} />
                                            
                                            {/* Tags */}
                                            <Box>
                                                <Typography 
                                                    variant="h6" 
                                                    color="primary" 
                                                    sx={{ 
                                                        fontWeight: 600, 
                                                        mb: 2,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        pb: 1 
                                                    }}
                                                >
                                                    Tags e Etiquetas
                                                </Typography>
                                                
                                                {tagsLoaded && (
                                                    <ContactTagsManager 
                                                        contactId={contactId}
                                                        onChange={handleTagsChange}
                                                        simplified={false}
                                                        size="medium"
                                                        readOnly={false}
                                                        placeholder="Selecione tags para organizar este contato..."
                                                    />
                                                )}
                                                
                                                {!tagsLoaded && (
                                                    <Box sx={{ 
                                                        p: 3, 
                                                        bgcolor: 'grey.50', 
                                                        borderRadius: 2,
                                                        textAlign: 'center'
                                                    }}>
                                                        <CircularProgress size={24} />
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            Carregando tags...
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            <Divider sx={{ my: 2 }} />
                                            
                                            {/* Organização */}
                                            <Box>
                                                <Typography 
                                                    variant="h6" 
                                                    color="primary" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        pb: 1 
                                                    }}
                                                >
                                                    Organização
                                                </Typography>

                                                <Stack spacing={2}>
                                                    <Autocomplete
                                                        options={employers || []}
                                                        getOptionLabel={(option) => {
                                                            if (!option || typeof option !== 'object') return '';
                                                            return String(option.name || '');
                                                        }}
                                                        value={selectedEmployer || null}
                                                        onChange={(event, newValue) => {
                                                            console.log('Employer selecionado:', newValue);
                                                            setSelectedEmployer(newValue);
                                                            setSelectedPosition(null);
                                                            setNewPositionName("");
                                                        }}
                                                        disabled={isSaving}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Empresa/Organização"
                                                                variant="outlined"
                                                                helperText="Selecione a empresa onde trabalha"
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    startAdornment: (
                                                                        <React.Fragment>
                                                                            <InputAdornment position="start">
                                                                                <BusinessIcon color="primary" />
                                                                            </InputAdornment>
                                                                            {params.InputProps.startAdornment}
                                                                        </React.Fragment>
                                                                    ),
                                                                }}
                                                            />
                                                        )}
                                                        isOptionEqualToValue={(option, value) => {
                                                            if (!option && !value) return true;
                                                            if (!option || !value) return false;
                                                            return option.id === value.id;
                                                        }}
                                                    />

                                                    <Autocomplete
                                                        options={positions || []}
                                                        getOptionLabel={(option) => {
                                                            if (!option || typeof option !== 'object') return '';
                                                            return String(option.name || '');
                                                        }}
                                                        value={selectedPosition || null}
                                                        onChange={(event, newValue) => {
                                                            console.log('Position selecionada:', newValue);
                                                            setSelectedPosition(newValue);
                                                            setNewPositionName(newValue ? "" : newPositionName);
                                                        }}
                                                        disabled={!selectedEmployer || isSaving}
                                                        freeSolo
                                                        onInputChange={(event, newValue) => {
                                                            const inputValue = String(newValue || '');
                                                            if (!selectedPosition) {
                                                                setNewPositionName(inputValue);
                                                            }
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Cargo/Posição"
                                                                variant="outlined"
                                                                helperText={!selectedEmployer 
                                                                    ? 'Selecione uma empresa primeiro'
                                                                    : 'Digite um cargo novo ou selecione existente'}
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    startAdornment: (
                                                                        <React.Fragment>
                                                                            <InputAdornment position="start">
                                                                                <WorkIcon color="primary" />
                                                                            </InputAdornment>
                                                                            {params.InputProps.startAdornment}
                                                                        </React.Fragment>
                                                                    ),
                                                                }}
                                                            />
                                                        )}
                                                        isOptionEqualToValue={(option, value) => {
                                                            if (!option && !value) return true;
                                                            if (!option || !value) return false;
                                                            return option.id === value.id;
                                                        }}
                                                    />
                                                </Stack>
                                            </Box>

                                            {/* Switch para desabilitar bot */}
                                            <Box>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={disableBot}
                                                            onChange={(e) => setDisableBot(e.target.checked)}
                                                            color="primary"
                                                            disabled={isSaving}
                                                        />
                                                    }
                                                    label={
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <SmartToyOutlinedIcon 
                                                                color={disableBot ? "error" : "disabled"} 
                                                                sx={{ fontSize: '1.25rem' }}
                                                            />
                                                            <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
                                                                Desabilitar Bot Automático
                                                            </Typography>
                                                            <Tooltip 
                                                                title="Quando ativado, o bot automático não responderá mensagens deste contato"
                                                                arrow
                                                            >
                                                                <InfoIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                                            </Tooltip>
                                                        </Stack>
                                                    }
                                                />
                                            </Box>

                                            <Divider sx={{ my: 2 }} />
                                            
                                            {/* Informações Adicionais */}
                                            <Box>
                                                <Typography 
                                                    variant="h6" 
                                                    color="primary" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        pb: 1 
                                                    }}
                                                >
                                                    Informações Adicionais
                                                </Typography>

                                                <FieldArray name="extraInfo">
                                                    {({ push, remove }) => (
                                                        <Stack spacing={2}>
                                                            {values.extraInfo && values.extraInfo.length > 0 ? (
                                                                values.extraInfo.map((item, index) => (
                                                                    <Stack
                                                                        key={`extra-${index}`}
                                                                        direction="row"
                                                                        spacing={1}
                                                                        alignItems="flex-start"
                                                                    >
                                                                        <Field name={`extraInfo.${index}.name`}>
                                                                            {({ field, meta }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    value={String(field.value || "")}
                                                                                    label="Nome do Campo"
                                                                                    variant="outlined"
                                                                                    fullWidth
                                                                                    error={meta.touched && Boolean(meta.error)}
                                                                                    helperText={meta.touched && meta.error ? String(meta.error) : ""}
                                                                                    disabled={isSaving}
                                                                                    InputProps={{
                                                                                        startAdornment: (
                                                                                            <InputAdornment position="start">
                                                                                                <InfoIcon fontSize="small" color="primary" />
                                                                                            </InputAdornment>
                                                                                        ),
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Field>
                                                                        
                                                                        <Field name={`extraInfo.${index}.value`}>
                                                                            {({ field, meta }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    value={String(field.value || "")}
                                                                                    label="Valor"
                                                                                    variant="outlined"
                                                                                    fullWidth
                                                                                    error={meta.touched && Boolean(meta.error)}
                                                                                    helperText={meta.touched && meta.error ? String(meta.error) : ""}
                                                                                    disabled={isSaving}
                                                                                />
                                                                            )}
                                                                        </Field>
                                                                        
                                                                        <Tooltip title="Remover Campo">
                                                                            <IconButton
                                                                                onClick={() => remove(index)}
                                                                                color="error"
                                                                                disabled={isSaving}
                                                                                sx={{ 
                                                                                    mt: 1,
                                                                                    borderRadius: 2 
                                                                                }}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Stack>
                                                                ))
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        py: 3,
                                                                        px: 2,
                                                                        bgcolor: 'grey.50',
                                                                        borderRadius: 2,
                                                                        border: `1px dashed ${theme.palette.grey[300]}`,
                                                                        textAlign: 'center'
                                                                    }}
                                                                >
                                                                    <InfoIcon sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Nenhuma informação adicional adicionada
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                            
                                                            <Box display="flex" justifyContent="center" mt={2}>
                                                                <Button
                                                                    type="button"
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    startIcon={<AddIcon />}
                                                                    onClick={() => push({ name: "", value: "" })}
                                                                    disabled={isSaving}
                                                                    sx={{ 
                                                                        minWidth: 200,
                                                                        borderRadius: 2,
                                                                        textTransform: 'none',
                                                                        fontWeight: 600,
                                                                        py: 1.5
                                                                    }}
                                                                >
                                                                    Adicionar Campo Extra
                                                                </Button>
                                                            </Box>
                                                        </Stack>
                                                    )}
                                                </FieldArray>
                                            </Box>
                                        </Stack>
                                    </Form>

                                    {/* Botões de ação */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'flex-end', 
                                        gap: 2, 
                                        pt: 4,
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                        mt: 4
                                    }}>
                                        <Button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={isSaving}
                                            startIcon={<CloseIcon />}
                                            sx={{ 
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                minWidth: 120,
                                                py: 1.5
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            disabled={isSaving || isLoading}
                                            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                                            onClick={() => {
                                                console.log('Botão salvar clicado');
                                                formikSubmit();
                                            }}
                                            sx={{ 
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                minWidth: 120,
                                                py: 1.5,
                                                boxShadow: 3,
                                                '&:hover': {
                                                    boxShadow: 4
                                                }
                                            }}
                                        >
                                            {contactId ? 'Atualizar Contato' : 'Salvar Contato'}
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Formik>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

ContactModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    contactId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSave: PropTypes.func
};

ContactModal.defaultProps = {
    onSave: () => {}
};

export default ContactModal;