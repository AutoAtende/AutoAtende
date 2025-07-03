import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Formik, FieldArray, Form, Field } from "formik";
import * as Yup from "yup";
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    Avatar,
    Badge,
    Chip,
    useTheme
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    Work as WorkIcon,
    SmartToyOutlined as SmartToyOutlinedIcon,
    Info as InfoIcon,
    PhotoCamera as PhotoCameraIcon,
    Refresh as RefreshIcon,
    Label as LabelIcon
} from '@mui/icons-material';

import { toast } from "../../../helpers/toast";
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";
import { generateColor } from "../../../helpers/colorGenerator";
import { getInitials } from "../../../helpers/getInitials";

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

// Componente ContactProfilePicture simplificado para evitar problemas de ref
const SimpleProfilePicture = forwardRef(({ 
    contactNumber, 
    name, 
    size = 120, 
    profilePicUrl, 
    onUpdateComplete,
    showRefreshButton = true 
}, ref) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [updatedPicUrl, setUpdatedPicUrl] = useState(null);
    const [imageError, setImageError] = useState(false);

    const handleUpdateProfilePic = async () => {
        if (!contactNumber || loading) return;
        
        setLoading(true);
        setImageError(false);
        
        try {
            const formattedNumber = contactNumber.replace(/\D/g, "");
            
            if (formattedNumber.length < 8) {
                throw new Error('Número de telefone inválido');
            }
            
            const { data } = await api.get(`/contacts/profile-pic/${formattedNumber}`);
            
            if (data?.profilePicUrl) {
                setUpdatedPicUrl(data.profilePicUrl);
                onUpdateComplete?.(data);
                toast.success('Foto de perfil atualizada com sucesso');
            } else {
                toast.info('Nenhuma foto encontrada para este contato');
            }
        } catch (err) {
            console.error('Erro ao atualizar foto:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar foto de perfil';
            toast.error(errorMessage);
            setImageError(true);
        } finally {
            setLoading(false);
        }
    };

    const avatarSrc = !imageError ? (updatedPicUrl || profilePicUrl) : null;
    const avatarColor = !avatarSrc ? generateColor(contactNumber || name) : undefined;
    const avatarInitials = !avatarSrc ? getInitials(name) : '';

    return (
        <Box 
            ref={ref}
            sx={{ 
                position: 'relative', 
                display: 'inline-block' 
            }}
        >
            <Avatar
                src={avatarSrc}
                sx={{
                    width: size,
                    height: size,
                    fontSize: size * 0.4,
                    fontWeight: 'bold',
                    backgroundColor: avatarColor,
                    color: "white",
                    boxShadow: 2,
                    cursor: showRefreshButton ? 'pointer' : 'default',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': showRefreshButton ? {
                        transform: 'scale(1.02)',
                        boxShadow: 3,
                    } : {},
                }}
                onClick={showRefreshButton && !loading ? handleUpdateProfilePic : undefined}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
            >
                {avatarInitials}
            </Avatar>
            
            {showRefreshButton && contactNumber && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={handleUpdateProfilePic}
                        disabled={loading}
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                            },
                            '&.Mui-disabled': {
                                backgroundColor: theme.palette.grey[400],
                            }
                        }}
                    >
                        <RefreshIcon 
                            sx={{ 
                                fontSize: '1rem',
                                animation: loading ? 'spin 1s linear infinite' : 'none',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                }
                            }} 
                        />
                    </IconButton>
                </Box>
            )}
            
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '50%',
                    }}
                >
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                </Box>
            )}
        </Box>
    );
});

SimpleProfilePicture.displayName = 'SimpleProfilePicture';

// Componente ContactTagsManager simplificado para evitar problemas de ref
const SimpleTagsManager = forwardRef(({ 
    contactId, 
    onChange, 
    simplified = true 
}, ref) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [error, setError] = useState(null);

    const fetchTags = async () => {
        try {
            const { data } = await api.get('/tags/list');
            setAvailableTags(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erro ao carregar tags:', err);
            setError('Erro ao carregar tags');
            setAvailableTags([]);
        }
    };

    const fetchContactTags = async () => {
        if (!contactId) return;
        
        try {
            setLoading(true);
            const { data } = await api.get(`/contacts/${contactId}/tags`);
            const tags = Array.isArray(data) ? data : [];
            setSelectedTags(tags);
            if (onChange) {
                onChange(tags);
            }
        } catch (err) {
            console.error('Erro ao carregar tags do contato:', err);
            setError('Erro ao carregar tags do contato');
            setSelectedTags([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        if (contactId) {
            fetchContactTags();
        } else {
            setSelectedTags([]);
        }
    }, [contactId]);

    const handleTagsChange = async (_, newTags) => {
        if (!contactId) return;
        
        try {
            setLoading(true);
            const tagIds = Array.isArray(newTags) ? newTags.map(tag => tag.id).filter(Boolean) : [];
            
            const { data } = await api.post(`/contacts/${contactId}/tags`, {
                tagIds
            });
            
            const updatedTags = Array.isArray(data.tags) ? data.tags : [];
            setSelectedTags(updatedTags);
            
            if (onChange) {
                onChange(updatedTags);
            }
            
            toast.success('Tags atualizadas com sucesso');
        } catch (err) {
            console.error('Erro ao atualizar tags:', err);
            toast.error('Erro ao atualizar tags');
            fetchContactTags();
        } finally {
            setLoading(false);
        }
    };

    if (!contactId) {
        return (
            <Box 
                ref={ref}
                sx={{ 
                    p: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: `1px dashed ${theme.palette.grey[300]}`,
                    textAlign: 'center'
                }}
            >
                <LabelIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                    As tags poderão ser gerenciadas após salvar o contato
                </Typography>
            </Box>
        );
    }

    return (
        <Box ref={ref} sx={{ width: '100%' }}>
            <Autocomplete
                multiple
                options={availableTags}
                getOptionLabel={(option) => option?.name || ''}
                value={selectedTags}
                onChange={handleTagsChange}
                loading={loading}
                disabled={loading}
                size="medium"
                limitTags={3}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Tags do Contato"
                        placeholder={selectedTags.length === 0 ? "Selecionar tags..." : ""}
                        fullWidth
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <React.Fragment>
                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                        <LabelIcon color="primary" />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </React.Fragment>
                            ),
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                            sx: {
                                '& .MuiAutocomplete-input': {
                                    padding: '16.5px 14px !important',
                                    fontSize: '1rem !important'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                minHeight: '56px',
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
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: '1rem',
                                '&.Mui-focused': {
                                    color: 'primary.main',
                                }
                            }
                        }}
                    />
                )}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                            <Chip
                                key={key}
                                label={option.name}
                                {...tagProps}
                                style={{
                                    backgroundColor: option.color || theme.palette.grey[600],
                                    color: '#fff',
                                    fontWeight: 500,
                                    margin: '2px',
                                    height: '28px',
                                    fontSize: '0.875rem'
                                }}
                                size="small"
                                sx={{
                                    '& .MuiChip-deleteIcon': {
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '1rem',
                                        '&:hover': {
                                            color: '#fff'
                                        }
                                    }
                                }}
                            />
                        );
                    })
                }
                renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                        <li key={key} {...optionProps}>
                            <Box
                                component="span"
                                sx={{
                                    width: 14,
                                    height: 14,
                                    mr: 1.5,
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    backgroundColor: option.color || theme.palette.grey[600],
                                    flexShrink: 0
                                }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                {option.name}
                            </Typography>
                        </li>
                    );
                }}
                PopperProps={{
                    sx: {
                        '& .MuiAutocomplete-paper': {
                            borderRadius: 2,
                            boxShadow: theme.palette.mode === 'dark' 
                                ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                                : '0 8px 32px rgba(0, 0, 0, 0.12)',
                            '& .MuiAutocomplete-option': {
                                padding: theme.spacing(1.5, 2),
                                minHeight: 48,
                                '&[aria-selected="true"]': {
                                    backgroundColor: theme.palette.primary.light + '20',
                                },
                                '&.Mui-focused': {
                                    backgroundColor: theme.palette.action.hover,
                                }
                            }
                        }
                    }
                }}
                noOptionsText="Nenhuma tag disponível"
            />
            
            {selectedTags.length > 0 && (
                <Typography 
                    variant="caption" 
                    color="textSecondary" 
                    sx={{ 
                        mt: 1, 
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 500
                    }}
                >
                    {selectedTags.length === 1 
                        ? `1 tag selecionada`
                        : `${selectedTags.length} tags selecionadas`
                    }
                </Typography>
            )}
        </Box>
    );
});

SimpleTagsManager.displayName = 'SimpleTagsManager';

// Componente ContactPhoneInput simplificado para evitar problemas de ref
const SimplePhoneInput = forwardRef(({ 
    value, 
    onChange, 
    onBlur, 
    error, 
    helperText, 
    label, 
    required 
}, ref) => {
    const phoneRef = useRef(null);
    
    // Expor métodos através da ref
    React.useImperativeHandle(ref, () => ({
        getNumber: () => {
            return value ? value.replace(/\D/g, '') : '';
        },
        isValidNumber: () => {
            const digitsOnly = value ? value.replace(/\D/g, '') : '';
            return digitsOnly.length >= 8;
        },
        debug: () => {
            console.log('SimplePhoneInput Debug:');
            console.log('- value:', value);
            console.log('- digits only:', value ? value.replace(/\D/g, '') : '');
            console.log('- isValid:', value ? value.replace(/\D/g, '').length >= 8 : false);
            return true;
        }
    }));

    // Formatação automática do telefone
    const formatPhone = (phoneValue) => {
        const digits = phoneValue.replace(/\D/g, '');
        
        if (digits.length <= 2) {
            return `(${digits}`;
        } else if (digits.length <= 6) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        } else if (digits.length <= 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        } else {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
        }
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        const formattedValue = formatPhone(inputValue);
        
        if (onChange) {
            onChange(formattedValue, formattedValue.replace(/\D/g, '').length >= 8);
        }
    };

    return (
        <TextField
            ref={phoneRef}
            label={label || "Número de Telefone"}
            value={value || ''}
            onChange={handleInputChange}
            onBlur={onBlur}
            error={error}
            helperText={helperText || "Digite o número com DDD"}
            variant="outlined"
            fullWidth
            required={required}
            type="tel"
            placeholder="(11) 99999-9999"
            inputProps={{
                maxLength: 15,
                style: { fontSize: '1rem' }
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                        <PhoneIcon color={error ? "error" : "primary"} />
                    </InputAdornment>
                ),
                sx: {
                    '& input': {
                        padding: '16.5px 14px',
                        fontSize: '1rem'
                    }
                }
            }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: error ? 'error.main' : 'grey.300',
                    },
                    '&:hover fieldset': {
                        borderColor: error ? 'error.main' : 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: error ? 'error.main' : 'primary.main',
                        borderWidth: 2,
                    },
                },
                '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    '&.Mui-focused': {
                        color: error ? 'error.main' : 'primary.main',
                    }
                }
            }}
        />
    );
});

SimplePhoneInput.displayName = 'SimplePhoneInput';

const ContactModal = ({ open, onClose, contactId, onSave }) => {
    console.log('ContactModal renderizado:', { open, contactId });
    
    const theme = useTheme();
    const phoneInputRef = useRef(null);
    
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
    const [phoneError, setPhoneError] = useState("");
    
    // Valores iniciais do formulário
    const [initialValues, setInitialValues] = useState({
        name: "",
        number: "",
        email: "",
        extraInfo: []
    });

    // Carregar dados quando modal abrir
    useEffect(() => {
        if (!open) {
            resetForm();
            return;
        }
        
        console.log('Carregando dados do modal...');
        loadModalData();
    }, [open, contactId]);

    const resetForm = () => {
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
        setPhoneError("");
    };

    const loadModalData = async () => {
        try {
            setIsLoading(true);
            
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
            
            const employersData = employersRes.data.employers || [];
            const positionsData = positionsRes.data.positions || [];
            
            setEmployers(employersData);
            setPositions(positionsData);
            
            // Se é edição, carregar dados do contato
            if (contactId) {
                console.log('Carregando contato para edição:', contactId);
                const contactRes = await api.get(`/contacts/${contactId}`);
                const contactData = contactRes.data;
                
                console.log('Dados do contato carregados:', contactData);
                
                setInitialValues({
                    name: contactData.name || "",
                    number: contactData.number || "",
                    email: contactData.email || "",
                    extraInfo: Array.isArray(contactData.extraInfo) ? contactData.extraInfo : []
                });
                
                setDisableBot(contactData.disableBot || false);
                setProfilePicUrl(contactData.profilePicUrl || "");
                
                // Encontrar employer e position
                if (contactData.employerId) {
                    const employer = employersData.find(emp => emp.id === contactData.employerId);
                    setSelectedEmployer(employer || null);
                }
                
                if (contactData.positionId) {
                    const position = positionsData.find(pos => pos.id === contactData.positionId);
                    setSelectedPosition(position || null);
                }
            } else {
                resetForm();
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados do contato');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        console.log('Submetendo formulário:', values);
        
        try {
            setIsSaving(true);
            
            // Validação do telefone
            let fullNumber = values.number;
            let isValidPhone = true;
            
            if (phoneInputRef.current) {
                try {
                    fullNumber = phoneInputRef.current.getNumber();
                    isValidPhone = phoneInputRef.current.isValidNumber();
                    console.log('Validação do telefone:', { fullNumber, isValidPhone });
                } catch (phoneErr) {
                    console.error("Erro ao validar telefone:", phoneErr);
                    isValidPhone = false;
                }
                
                if (!isValidPhone) {
                    setFieldError('number', 'Número de telefone inválido');
                    setPhoneError('Número de telefone inválido');
                    return;
                }
            } else {
                if (!values.number || values.number.trim().length < 8) {
                    setFieldError('number', 'Número de telefone inválido');
                    return;
                }
                fullNumber = values.number.trim();
            }
    
            // ✅ CORREÇÃO: Incluir isGroup explicitamente
            const contactData = {
                name: values.name.trim(),
                number: fullNumber,
                email: values.email?.trim() || "",
                extraInfo: values.extraInfo || [],
                disableBot,
                employerId: selectedEmployer?.id || null,
                positionId: selectedPosition?.id || null,
                positionName: newPositionName.trim() || undefined,
                profilePicUrl: profilePicUrl || undefined,
                isGroup: false, // ✅ ADICIONADO: Sempre false para contatos individuais
                isPBX: false    // ✅ ADICIONADO: Campo adicional de segurança
            };
            
            console.log('Dados a serem enviados:', contactData);
            
            let savedContact;
            
            if (contactId) {
                console.log('Atualizando contato:', contactId);
                const { data } = await api.put(`/contacts/${contactId}`, contactData);
                savedContact = { ...data, id: contactId };
                toast.success('Contato atualizado com sucesso');
            } else {
                console.log('Criando novo contato');
                const { data } = await api.post("/contacts", contactData);
                savedContact = data;
                toast.success('Contato criado com sucesso');
                
                // Sincronizar tags para novo contato
                const validTags = Array.isArray(contactTags) && contactTags.filter(tag => tag && tag.id);
                if (validTags && validTags.length > 0 && savedContact && savedContact.id) {
                    try {
                        console.log(`Sincronizando ${validTags.length} tags para o contato ${savedContact.id}`);
                        await api.post(`/contacts/${savedContact.id}/tags`, {
                            tagIds: validTags.map(tag => tag.id)
                        });
                    } catch (tagError) {
                        console.error("Erro ao sincronizar tags:", tagError);
                        toast.warning('Contato criado, mas houve erro ao sincronizar tags');
                    }
                }
            }
            
            console.log('Contato salvo:', savedContact);
            
            if (onSave && typeof onSave === 'function') {
                onSave(savedContact);
            }
            
            onClose();
            
        } catch (error) {
            console.error('Erro ao salvar contato:', error);
            
            // ✅ MELHOR TRATAMENTO DE ERRO
            let errorMessage = 'Erro ao salvar contato';
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.log('Mensagem de erro final:', errorMessage);
            toast.error(errorMessage);
            
            // Se for erro de validação, pode tentar mostrar no campo específico
            if (error.response?.status === 400 && errorMessage.includes('número')) {
                setFieldError('number', errorMessage);
                setPhoneError(errorMessage);
            }
            
        } finally {
            setIsSaving(false);
            setSubmitting(false);
        }
    };

    const handleProfileUpdate = (updatedContact) => {
        if (updatedContact && updatedContact.profilePicUrl) {
            setProfilePicUrl(updatedContact.profilePicUrl);
            toast.success('Foto de perfil atualizada');
        }
    };

    const handleTagsChange = (tags) => {
        setContactTags(tags);
    };

    const handleClose = () => {
        console.log('Fechando modal');
        onClose();
    };

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6">
                            {contactId ? 'Editar Contato' : 'Novo Contato'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {contactId ? 'Atualize as informações do contato' : 'Preencha os dados para criar um novo contato'}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ maxHeight: '70vh' }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize={true}
                        validationSchema={ContactSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, isSubmitting, setFieldValue, setFieldError, setFieldTouched }) => (
                            <Form>
                                <Stack spacing={3} sx={{ py: 1 }}>
                                    {/* Foto de Perfil */}
                                    {contactId && (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            mb: 2
                                        }}>
                                            <Stack alignItems="center" spacing={1}>
                                                <Typography variant="subtitle2" color="primary">
                                                    Foto de Perfil
                                                </Typography>
                                                <SimpleProfilePicture
                                                    contactNumber={values.number.replace(/\s+/g, "")}
                                                    name={values.name}
                                                    size={120}
                                                    profilePicUrl={profilePicUrl}
                                                    onUpdateComplete={handleProfileUpdate}
                                                    showRefreshButton={true}
                                                />
                                            </Stack>
                                        </Box>
                                    )}

                                    <Typography variant="subtitle1" color="primary" gutterBottom>
                                        📱 Informações Básicas
                                    </Typography>
                                    
                                    <Box display="flex" gap={2} sx={{ mb: 1 }}>
                                        <Box flex={1}>
                                            <Field
                                                as={TextField}
                                                name="name"
                                                label="Nome Completo"
                                                error={touched.name && Boolean(errors.name)}
                                                helperText={touched.name && errors.name}
                                                variant="outlined"
                                                fullWidth
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ mr: 1 }}>
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
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontSize: '1rem',
                                                        '&.Mui-focused': {
                                                            color: 'primary.main',
                                                        }
                                                    },
                                                    '& input': {
                                                        padding: '16.5px 14px',
                                                        fontSize: '1rem'
                                                    }
                                                }}
                                            />
                                        </Box>
                                        
                                        <Box flex={1}>
                                            <SimplePhoneInput
                                                ref={phoneInputRef}
                                                label="Número de Telefone"
                                                value={values.number}
                                                onChange={(phone, isValid) => {
                                                    setFieldValue('number', phone);
                                                    
                                                    if (!isValid && phone) {
                                                        setFieldError('number', 'Número de telefone inválido');
                                                        setPhoneError('Número de telefone inválido');
                                                    } else if (errors.number === 'Número de telefone inválido') {
                                                        setFieldError('number', undefined);
                                                        setPhoneError("");
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    setFieldTouched('number', true, true);
                                                }}
                                                error={touched.number && Boolean(errors.number)}
                                                helperText={touched.number && errors.number}
                                                required
                                            />
                                        </Box>
                                    </Box>

                                    <Field
                                        as={TextField}
                                        name="email"
                                        label="Email (Opcional)"
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email || "Digite um email válido"}
                                        variant="outlined"
                                        fullWidth
                                        type="email"
                                        placeholder="exemplo@email.com"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ mr: 1 }}>
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
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: '1rem',
                                                '&.Mui-focused': {
                                                    color: 'primary.main',
                                                }
                                            },
                                            '& input': {
                                                padding: '16.5px 14px',
                                                fontSize: '1rem'
                                            }
                                        }}
                                    />

                                    <Divider />
                                    <Typography variant="subtitle1" color="primary" gutterBottom>
                                        🏷️ Tags e Etiquetas
                                    </Typography>

                                    <SimpleTagsManager 
                                        contactId={contactId}
                                        onChange={handleTagsChange}
                                        simplified={true}
                                    />

                                    <Divider />
                                    <Typography variant="subtitle1" color="primary" gutterBottom>
                                        🏢 Organização
                                    </Typography>

                                    <Autocomplete
                                        options={employers}
                                        getOptionLabel={(option) => option?.name || ''}
                                        value={selectedEmployer}
                                        onChange={(event, newValue) => {
                                            setSelectedEmployer(newValue);
                                            setSelectedPosition(null);
                                            setNewPositionName("");
                                        }}
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
                                            return option?.id === value?.id;
                                        }}
                                    />

                                    <Autocomplete
                                        options={positions}
                                        getOptionLabel={(option) => option?.name || ''}
                                        value={selectedPosition}
                                        onChange={(event, newValue) => {
                                            setSelectedPosition(newValue);
                                            setNewPositionName(newValue ? "" : newPositionName);
                                        }}
                                        disabled={!selectedEmployer}
                                        freeSolo
                                        onInputChange={(event, newValue) => {
                                            if (!selectedPosition) {
                                                setNewPositionName(newValue);
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
                                            return option?.id === value?.id;
                                        }}
                                    />

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={disableBot}
                                                onChange={(e) => setDisableBot(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <SmartToyOutlinedIcon color={disableBot ? "error" : "disabled"} />
                                                <Typography>Desabilitar Bot Automático</Typography>
                                            </Stack>
                                        }
                                    />

                                    <Divider />
                                    <Typography variant="subtitle1" color="primary" gutterBottom>
                                        ℹ️ Informações Adicionais
                                    </Typography>

                                    <FieldArray name="extraInfo">
                                        {({ push, remove }) => (
                                            <Stack spacing={2}>
                                                {values.extraInfo && values.extraInfo.length > 0 ? (
                                                    values.extraInfo.map((_, index) => (
                                                        <Stack
                                                            key={index}
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                        >
                                                            <Field
                                                                as={TextField}
                                                                name={`extraInfo.${index}.name`}
                                                                label="Nome do Campo"
                                                                variant="outlined"
                                                                size="small"
                                                                fullWidth
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                                                            <InfoIcon fontSize="small" color="primary" />
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
                                                                    },
                                                                    '& .MuiInputLabel-root': {
                                                                        fontSize: '0.875rem',
                                                                        '&.Mui-focused': {
                                                                            color: 'primary.main',
                                                                        }
                                                                    },
                                                                    '& input': {
                                                                        fontSize: '0.875rem'
                                                                    }
                                                                }}
                                                            />
                                                            <Field
                                                                as={TextField}
                                                                name={`extraInfo.${index}.value`}
                                                                label="Valor"
                                                                variant="outlined"
                                                                size="small"
                                                                fullWidth
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
                                                                    },
                                                                    '& .MuiInputLabel-root': {
                                                                        fontSize: '0.875rem',
                                                                        '&.Mui-focused': {
                                                                            color: 'primary.main',
                                                                        }
                                                                    },
                                                                    '& input': {
                                                                        fontSize: '0.875rem'
                                                                    }
                                                                }}
                                                            />
                                                            <Tooltip title="Remover Campo">
                                                                <IconButton
                                                                    onClick={() => remove(index)}
                                                                    size="small"
                                                                    color="error"
                                                                    sx={{ 
                                                                        borderRadius: 2,
                                                                        padding: 1
                                                                    }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                                        Nenhuma informação adicional adicionada
                                                    </Typography>
                                                )}
                                                
                                                <Box display="flex" justifyContent="center" mt={2}>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => push({ name: "", value: "" })}
                                                        sx={{ 
                                                            minWidth: 200,
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Adicionar Campo Extra
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        )}
                                    </FieldArray>
                                </Stack>
                            </Form>
                        )}
                    </Formik>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={isSaving}
                    startIcon={<CloseIcon />}
                    sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        minWidth: 120
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSaving || isLoading}
                    startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={() => {
                        // Submeter o formulário
                        const form = document.querySelector('form');
                        if (form) {
                            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                            form.dispatchEvent(submitEvent);
                        }
                    }}
                    sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        minWidth: 120,
                        boxShadow: 2
                    }}
                >
                    {contactId ? 'Atualizar Contato' : 'Salvar Contato'}
                </Button>
            </DialogActions>
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