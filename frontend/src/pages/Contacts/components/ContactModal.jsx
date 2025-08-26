import React, { useState, useEffect, useRef } from "react";
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
import ContactPhoneInput from '../../../components/PhoneInputs/ContactPhoneInput';
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
            
            // Validação do telefone usando o ContactPhoneInput
            let fullNumber = values.number;
            let isValidPhone = true;
            
            if (phoneInputRef.current) {
                try {
                    fullNumber = phoneInputRef.current.getNumber();
                    isValidPhone = phoneInputRef.current.isValidNumber();
                    console.log('Validação do telefone:', { fullNumber, isValidPhone });
                    
                    // Debug para depuração
                    phoneInputRef.current.debug();
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
    
            // Dados do contato
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
                isGroup: false, // Sempre false para contatos individuais
                isPBX: false    // Campo adicional de segurança
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
            
            // Melhor tratamento de erro
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
                sx: { 
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
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

            <DialogContent dividers sx={{ maxHeight: '70vh', p: 3 }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            Carregando dados do contato...
                        </Typography>
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
                                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
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
                                            </Stack>
                                        </Box>
                                    )}

                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                                        Informações Básicas
                                    </Typography>
                                    
                                    {/* Nome */}
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
                                    
                                    {/* Telefone usando ContactPhoneInput */}
                                    <ContactPhoneInput
                                        ref={phoneInputRef}
                                        value={values.number}
                                        onChange={(phone) => {
                                            setFieldValue('number', phone);
                                            
                                            // Validação em tempo real
                                            if (phoneInputRef.current) {
                                                const isValid = phoneInputRef.current.isValidNumber();
                                                if (!isValid && phone) {
                                                    setFieldError('number', 'Número de telefone inválido');
                                                    setPhoneError('Número de telefone inválido');
                                                } else if (errors.number === 'Número de telefone inválido') {
                                                    setFieldError('number', undefined);
                                                    setPhoneError("");
                                                }
                                            }
                                        }}
                                        error={touched.number && Boolean(errors.number)}
                                        helperText={touched.number && errors.number}
                                        label="Número de Telefone"
                                        required
                                    />

                                    {/* Email */}
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

                                    <Divider sx={{ my: 2 }} />
                                    
                                    {/* Tags usando ContactTagsManager */}
                                    <Box>
                                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                                            Tags e Etiquetas
                                        </Typography>
                                        
                                        <ContactTagsManager 
                                            contactId={contactId}
                                            onChange={handleTagsChange}
                                            simplified={false}
                                            size="medium"
                                            readOnly={false}
                                            placeholder="Selecione tags para organizar este contato..."
                                        />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />
                                    
                                    {/* Organização */}
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                                        Organização
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
                                                            <InputAdornment position="start" sx={{ mr: 1 }}>
                                                                <BusinessIcon color="primary" />
                                                            </InputAdornment>
                                                            {params.InputProps.startAdornment}
                                                        </React.Fragment>
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
                                        isOptionEqualToValue={(option, value) => {
                                            return option?.id === value?.id;
                                        }}
                                        sx={{ mb: 2 }}
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
                                                            <InputAdornment position="start" sx={{ mr: 1 }}>
                                                                <WorkIcon color="primary" />
                                                            </InputAdornment>
                                                            {params.InputProps.startAdornment}
                                                        </React.Fragment>
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
                                        isOptionEqualToValue={(option, value) => {
                                            return option?.id === value?.id;
                                        }}
                                        sx={{ mb: 2 }}
                                    />

                                    {/* Switch para desabilitar bot */}
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
                                                <Typography sx={{ fontSize: '1rem' }}>
                                                    Desabilitar Bot Automático
                                                </Typography>
                                                <Tooltip title="Quando ativado, o bot automático não responderá mensagens deste contato">
                                                    <InfoIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                                </Tooltip>
                                            </Stack>
                                        }
                                        sx={{ mb: 2 }}
                                    />

                                    <Divider sx={{ my: 2 }} />
                                    
                                    {/* Informações Adicionais */}
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                                        Informações Adicionais
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
                                                                size="medium"
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
                                                                        fontSize: '1rem',
                                                                        '&.Mui-focused': {
                                                                            color: 'primary.main',
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <Field
                                                                as={TextField}
                                                                name={`extraInfo.${index}.value`}
                                                                label="Valor"
                                                                variant="outlined"
                                                                size="medium"
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
                                                                        fontSize: '1rem',
                                                                        '&.Mui-focused': {
                                                                            color: 'primary.main',
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <Tooltip title="Remover Campo">
                                                                <IconButton
                                                                    onClick={() => remove(index)}
                                                                    size="medium"
                                                                    color="error"
                                                                    sx={{ 
                                                                        borderRadius: 2,
                                                                        padding: 1.5
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
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => push({ name: "", value: "" })}
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
                                </Stack>

                                {/* Botões de ação dentro do form */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'flex-end', 
                                    gap: 2, 
                                    pt: 3,
                                    borderTop: `1px solid ${theme.palette.divider}`,
                                    mt: 3
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
                                        type="submit"
                                        variant="contained"
                                        disabled={isSaving || isLoading}
                                        startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                                        sx={{ 
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            minWidth: 120,
                                            py: 1.5,
                                            boxShadow: 2
                                        }}
                                    >
                                        {contactId ? 'Atualizar Contato' : 'Salvar Contato'}
                                    </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                )}
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