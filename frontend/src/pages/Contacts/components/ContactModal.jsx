import React, { useState, useEffect, useRef } from "react";
import { Formik, FieldArray, Form, Field } from "formik";
import * as Yup from "yup";
import {
    Button,
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
    Grid,
    useTheme,
    FormHelperText
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from "../../../helpers/toast";
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";
import BaseModal from "../../../components/shared/BaseModal";
import ContactProfilePicture from "./ContactProfilePicture";
import ContactTagsManager from "./ContactTagsManager";
import ContactPhoneInput from "../../../components/PhoneInputs/ContactPhoneInput";

// Esquema de validação modificado para aceitar números internacionais
const ContactSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Nome muito curto")
        .required("Nome é obrigatório"),
    number: Yup.string()
        .required("Número é obrigatório"),
    email: Yup.string()
        .email("Email inválido")
        .optional()
});

const ContactModal = ({ open, onClose, contactId, onSave = () => {} }) => {
    const theme = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingEmployers, setIsLoadingEmployers] = useState(false);
    const [isLoadingPositions, setIsLoadingPositions] = useState(false);
    const [employers, setEmployers] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [newPositionName, setNewPositionName] = useState("");
    const [disableBot, setDisableBot] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState("");
    const [contactTags, setContactTags] = useState([]);
    const [phoneError, setPhoneError] = useState("");
    const phoneInputRef = useRef(null);
    const formikRef = useRef(null);

    const initialState = {
        name: "",
        number: "",
        email: "",
        employerId: null,
        positionId: null,
        extraInfo: []
    };

    const [contact, setContact] = useState(initialState);

// No useEffect que carrega os dados do contato (ContactModal.jsx)
useEffect(() => {
    const loadData = async () => {
        if (open) {
            try {
                setIsLoadingEmployers(true);
                setIsLoadingPositions(true);
                
                // Carregar employers e positions
                const employersResponse = await api.get('/employers', {
                    params: {
                        searchParam: '',
                        page: 0,
                        limit: 999999
                    }
                });
                
                const positionsResponse = await api.get('/positions/simplified', {
                    params: {
                        searchParam: '',
                        page: 1,
                        limit: 999999
                    }
                });
                
                const employers = employersResponse.data.employers || [];
                const positions = positionsResponse.data.positions || [];
                
                setEmployers(employers);
                setPositions(positions);

                if (contactId) {
                    // Busca os dados do contato
                    const { data: contactData } = await api.get(`/contacts/${contactId}`);
                    
                    if (contactData) {
                        // Manter o número como está, sem formatação forçada
                        let formattedNumber = contactData.number || "";
                        
                        // Define os dados do contato
                        setContact({
                            name: contactData.name || "",
                            number: formattedNumber,
                            email: contactData.email || "",
                            employerId: contactData.employerId || null,
                            positionId: contactData.positionId || null,
                            extraInfo: Array.isArray(contactData.extraInfo) ? contactData.extraInfo : []
                        });
                        
                        setProfilePicUrl(contactData.profilePicUrl || "");
                        setDisableBot(contactData.disableBot || false);

                        // CORREÇÃO AQUI: Encontrar o employer pelo ID explicitamente
                        if (contactData.employerId) {
                            console.log("Buscando employer pelo ID:", contactData.employerId);
                            const employer = employers.find(emp => emp.id === contactData.employerId);
                            console.log("Employer encontrado:", employer);
                            setSelectedEmployer(employer || null);
                        }

                        // CORREÇÃO AQUI: Encontrar a position pelo ID explicitamente
                        if (contactData.positionId) {
                            console.log("Buscando position pelo ID:", contactData.positionId);
                            const position = positions.find(pos => pos.id === contactData.positionId);
                            console.log("Position encontrada:", position);
                            setSelectedPosition(position || null);
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                toast.error(i18n.t("contactModal.errors.loadData"));
            } finally {
                setIsLoadingEmployers(false);
                setIsLoadingPositions(false);
            }
        }
    };

    loadData();
}, [open, contactId]);

    useEffect(() => {
        if (!open) {
            setContact(initialState);
            setSelectedEmployer(null);
            setSelectedPosition(null);
            setNewPositionName("");
            setDisableBot(false);
            setProfilePicUrl("");
            setContactTags([]);
            setPhoneError("");
        }
    }, [open]);

    const handleSaveContact = async (values, { setSubmitting, setFieldError }) => {
        console.log("=== Iniciando handleSaveContact ===");
        console.log("Valores do formulário:", values);
        
        try {
          setIsSaving(true);
          
          // Debug da referência do telefone
          console.log("phoneInputRef existe?", !!phoneInputRef.current);
          
          // Verificar se a referência do input de telefone existe
          if (!phoneInputRef.current) {
            console.error("Referência do phoneInput não encontrada!");
            setPhoneError("Erro ao processar o número de telefone");
            setIsSaving(false);
            setSubmitting(false);
            return;
          }
          
          // Testar a função debug para verificar se a ref está funcionando corretamente
          if (typeof phoneInputRef.current.debug === 'function') {
            phoneInputRef.current.debug();
          }
          
          // Obter e validar o número de telefone
          const fullNumber = phoneInputRef.current.getNumber();
          const isValid = phoneInputRef.current.isValidNumber();
          
          console.log("Número formatado:", fullNumber);
          console.log("Validação do número de telefone:", isValid);
          
          // Validar o número de telefone (verificação com valor booleano explícito)
          if (isValid !== true) {
            console.error("Número de telefone inválido");
            setPhoneError("Número de telefone inválido");
            setFieldError('number', "Número de telefone inválido");
            setIsSaving(false);
            setSubmitting(false);
            return;
          }
          
          if (!fullNumber) {
            console.error("Número de telefone vazio após formatação");
            setPhoneError("Número de telefone inválido");
            setFieldError('number', "Número de telefone inválido");
            setIsSaving(false);
            setSubmitting(false);
            return;
          }
          
          // Montar os dados do contato
          const contactData = {
            name: values.name?.trim(),
            number: fullNumber,
            email: values.email?.trim() || "",
            extraInfo: values.extraInfo || [],
            disableBot,
            employerId: selectedEmployer?.id || null,
            positionId: selectedPosition?.id || null,
            positionName: newPositionName.trim() || undefined,
            profilePicUrl: profilePicUrl || undefined
          };
          
          console.log("Dados a serem enviados:", contactData);
          
          // Salvar o contato
          let savedContact = null;
          
          try {
            if (contactId) {
              console.log(`Atualizando contato com ID ${contactId}`);
              const { data } = await api.put(`/contacts/${contactId}`, contactData);
              savedContact = { ...data, id: contactId };
              toast.success(i18n.t("contactModal.success.updated"));
            } else {
              console.log("Criando novo contato");
              const { data } = await api.post("/contacts", contactData);
              savedContact = data;
              toast.success(i18n.t("contactModal.success.created"));
              
              // Verificar se há tags para sincronizar
              const validTags = Array.isArray(contactTags) && contactTags.filter(tag => tag && tag.id);
              
              if (validTags && validTags.length > 0 && savedContact && savedContact.id) {
                try {
                  console.log(`Sincronizando ${validTags.length} tags para o contato ${savedContact.id}`);
                  await api.post(`/contacts/${savedContact.id}/tags`, {
                    tagIds: validTags.map(tag => tag.id)
                  });
                } catch (tagError) {
                  console.error("Erro ao sincronizar tags:", tagError);
                  toast.warning(i18n.t("contactModal.warnings.tagsSyncFailed"));
                }
              }
            }
            
            console.log("Contato salvo com sucesso:", savedContact);
            
            // Passar o contato salvo para a função onSave
            if (onSave && savedContact) {
              onSave(savedContact);
            }
            
            // Fechar o modal
            onClose();
          } catch (apiError) {
            console.error('Erro ao salvar contato na API:', apiError.response?.data || apiError);
            toast.error(
              apiError?.response?.data?.error || 
              i18n.t("contactModal.errors.saveGeneric")
            );
            
            setIsSaving(false);
            setSubmitting(false);
          }
        } catch (err) {
          console.error('Erro geral ao salvar contato:', err);
          toast.error(i18n.t("contactModal.errors.saveGeneric"));
        } finally {
          console.log("=== Finalizando handleSaveContact ===");
          setIsSaving(false);
          setSubmitting(false);
        }
      };
    const handleProfileUpdate = (updatedContact) => {
        if (updatedContact && updatedContact.profilePicUrl) {
            setProfilePicUrl(updatedContact.profilePicUrl);
            toast.success(i18n.t("contactModal.success.profilePic"));
        }
    };

    const handleTagsChange = (tags) => {
        setContactTags(tags);
    };

    // Submeter o formulário de maneira segura usando a referência do Formik
    const submitForm = () => {
        console.log("=== Iniciando submitForm ===");
        
        try {
          if (!formikRef.current) {
            console.error("Referência do Formik não encontrada!");
            toast.error(i18n.t("contactModal.errors.formSubmissionFailed"));
            return;
          }
          
          console.log("Valores atuais:", formikRef.current.values);
          console.log("Erros atuais:", formikRef.current.errors);
          
          // Verificar se há erros nos campos
          if (formikRef.current.errors && Object.keys(formikRef.current.errors).length > 0) {
            console.log("Formulário com erros:", formikRef.current.errors);
            
            // Tocar manualmente em todos os campos para exibir os erros
            Object.keys(formikRef.current.values).forEach(fieldName => {
              formikRef.current.setFieldTouched(fieldName, true, false);
            });
            
            // Validar novamente para garantir que todos os erros sejam exibidos
            formikRef.current.validateForm().then(errors => {
              console.log("Erros após validação:", errors);
              
              if (Object.keys(errors).length > 0) {
                toast.error(i18n.t("contactModal.errors.validationFailed"));
              } else {
                // Se não houver erros após a validação, tentar submeter novamente
                console.log("Formulário válido após validação, tentando submeter...");
                formikRef.current.submitForm();
              }
            });
            
            return;
          }
          
          // Se não houver erros, submeter o formulário
          console.log("Submetendo formulário sem erros...");
          formikRef.current.submitForm();
          
          // Verificar resultado da submissão após um breve intervalo
          setTimeout(() => {
            const isValid = formikRef.current?.isValid;
            const isSubmitting = formikRef.current?.isSubmitting;
            
            console.log("Estado após submissão:", { isValid, isSubmitting });
            
            if (!isValid) {
              console.log("Formulário inválido após tentativa de submissão");
            }
          }, 100);
        } catch (error) {
          console.error("Erro ao submeter formulário:", error);
          toast.error(i18n.t("contactModal.errors.unexpectedError"));
        }
        
        console.log("=== Finalizando submitForm ===");
      };

      const modalActions = [
        {
          label: i18n.t("contactModal.buttons.cancel"),
          onClick: onClose,
          variant: "outlined",
          color: "secondary",
          disabled: isSaving,
          icon: <CloseIcon />
        },
        {
          label: contactId ? i18n.t("contactModal.buttons.update") : i18n.t("contactModal.buttons.save"),
          onClick: (e) => {
            e.preventDefault(); // Prevenir comportamento padrão
            console.log("Botão Salvar/Atualizar clicado!");
            submitForm(); // Chamar a função de submissão
          },
          variant: "contained",
          color: "primary",
          disabled: isSaving,
          icon: isSaving ? <CircularProgress size={20} /> : <SaveIcon />
        }
      ];

      // Verificar referências durante a renderização
useEffect(() => {
    if (open) {
      console.log("Modal aberto - Verificando referências:");
      console.log("- formikRef existe?", !!formikRef.current);
      console.log("- phoneInputRef existe?", !!phoneInputRef.current);
      
      // Verificar se o phoneInputRef tem os métodos necessários
      if (phoneInputRef.current) {
        console.log("- phoneInputRef.isValidNumber existe?", typeof phoneInputRef.current.isValidNumber === 'function');
        console.log("- phoneInputRef.getNumber existe?", typeof phoneInputRef.current.getNumber === 'function');
      }
    }
  }, [open, phoneInputRef.current, formikRef.current]);

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={contactId ? i18n.t("contactModal.title.edit") : i18n.t("contactModal.title.new")}
            maxWidth="md"
            actions={modalActions}
            loading={isSaving}
            helpText={i18n.t("contactModal.helpText")}
        >
            <Formik
                initialValues={{
                    name: contact.name || "",
                    number: contact.number || "",
                    email: contact.email || "",
                    extraInfo: contact.extraInfo || [],
                }}
                enableReinitialize={true}
                validationSchema={ContactSchema}
                onSubmit={handleSaveContact}
                innerRef={formikRef}
            >
                {({ values, errors, touched, isSubmitting, setFieldValue, setFieldError, setFieldTouched }) => (
                    <Form id="contactForm">
                        <Stack spacing={3} sx={{ py: 1 }}>
                            {/* Seção da foto de perfil */}
                            {contactId && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    mb: 2
                                }}>
                                    <ContactProfilePicture
                                        contactNumber={values.number.replace(/\s+/g, "")}
                                        name={values.name}
                                        size={100}
                                        profilePicUrl={profilePicUrl}
                                        onUpdateComplete={handleProfileUpdate}
                                        showRefreshButton={true}
                                    />
                                </Box>
                            )}

                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                {i18n.t("contactModal.sections.basic")}
                            </Typography>
                            
                            {/* Nome e Número na mesma linha - com layout corrigido */}
                            <Box display="flex" width="100%" gap={2}>
                                <Box flex={1}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("contactModal.form.name")}
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
              
                                <Box flex={1}>
                                    {/* Substitua o campo de telefone antigo pelo novo componente */}
                                    <ContactPhoneInput
                                        ref={phoneInputRef}
                                        name="number"
                                        label={i18n.t("contactModal.form.number")}
                                        value={values.number}
                                        onChange={(phone, isValid) => {
                                            setFieldValue('number', phone);
                                            
                                            // Gerencia erros com base na validação
                                            if (!isValid && phone) {
                                                setFieldError('number', i18n.t("contactModal.form.invalidPhone"));
                                                setPhoneError(i18n.t("contactModal.form.invalidPhone"));
                                            } else if (errors.number === i18n.t("contactModal.form.invalidPhone")) {
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
                                label={i18n.t("contactModal.form.email")}
                                name="email"
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Tags logo após o email - com estilo simplificado */}
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                {i18n.t("contactModal.sections.tags")}
                            </Typography>

                            {contactId ? (
                                <ContactTagsManager 
                                    contactId={contactId}
                                    onChange={handleTagsChange}
                                    simplified={true}
                                />
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ 
                                    py: 2, 
                                    color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600]
                                }}>
                                    {i18n.t("contactModal.tags.saveFirst")}
                                </Typography>
                            )}

                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                {i18n.t("contactModal.sections.organization")}
                            </Typography>

                            <Autocomplete
                                loading={isLoadingEmployers}
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
                                        label={i18n.t("contactModal.form.company")}
                                        variant="outlined"
                                        error={employers.length === 0 && !isLoadingEmployers}
                                        helperText={employers.length === 0 && !isLoadingEmployers ? 
                                            i18n.t("contactModal.errors.loadCompanies") : ""}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <>
                                                    <InputAdornment position="start">
                                                        <BusinessIcon color="primary" />
                                                    </InputAdornment>
                                                    {params.InputProps.startAdornment}
                                                </>
                                            ),
                                            endAdornment: (
                                                <>
                                                    {isLoadingEmployers ? 
                                                        <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => {
                                    if (!option || !value) return false;
                                    return option.id === value.id;
                                }}
                            />

                            <Autocomplete
                                loading={isLoadingPositions}
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
                                        label={i18n.t("contactModal.form.position")}
                                        variant="outlined"
                                        helperText={!selectedEmployer 
                                            ? i18n.t("contactModal.form.selectCompanyFirst")
                                            : i18n.t("contactModal.form.positionHelp")}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <>
                                                    <InputAdornment position="start">
                                                        <WorkIcon color="primary" />
                                                    </InputAdornment>
                                                    {params.InputProps.startAdornment}
                                                </>
                                            ),
                                            endAdornment: (
                                                <>
                                                    {isLoadingPositions ? 
                                                        <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => {
                                    if (!option || !value) return false;
                                    return option.id === value.id;
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
                                        <Typography>{i18n.t("contactModal.form.disableBot")}</Typography>
                                    </Stack>
                                }
                            />

                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                {i18n.t("contactModal.sections.additional")}
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
                                                        label={i18n.t("contactModal.form.extraName")}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <InfoIcon fontSize="small" />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                    <Field
                                                        as={TextField}
                                                        name={`extraInfo.${index}.value`}
                                                        label={i18n.t("contactModal.form.extraValue")}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                    <Tooltip title={i18n.t("contactModal.buttons.remove")}>
                                                        <IconButton
                                                            onClick={() => remove(index)}
                                                            size="small"
                                                            color="error"
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            ))
                                        ) : (
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary" 
                                                align="center"
                                                sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600] }}
                                            >
                                                {i18n.t("contactModal.form.noExtraInfo")}
                                            </Typography>
                                        )}
                                        <Button
                                            variant="outlined"
                                            onClick={() => push({ name: "", value: "" })}
                                            startIcon={<AddIcon />}
                                            fullWidth
                                            color="secondary"
                                        >
                                            {i18n.t("contactModal.buttons.addExtraInfo")}
                                        </Button>
                                    </Stack>
                                )}
                            </FieldArray>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </BaseModal>
    );
};

export default ContactModal;