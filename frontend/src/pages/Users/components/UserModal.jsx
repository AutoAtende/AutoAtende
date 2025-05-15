import React, { useState, useEffect, useContext, useRef } from "react";
import { styled } from '@mui/material/styles';
import { AuthContext } from "../../../context/Auth/AuthContext";
import { GlobalContext } from "../../../context/GlobalContext";
import { TwitterPicker } from "react-color";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Divider
} from "@mui/material";

// Ícones
import {
  Visibility,
  VisibilityOff,
  Mail,
  Lock,
  Person,
  AccessTime,
  WhatsApp,
  Palette,
  Phone,
  Notifications,
  Refresh,
  Schedule,
  CalendarToday
} from "@mui/icons-material";

// Componentes
import BaseModal from "../../../components/shared/BaseModal";
import UserQueueSelect from "../../../components/UserQueueSelect";
import { Can } from "../../../components/Can";
import useWhatsApps from "../../../hooks/useWhatsApps";
import useSettings from "../../../hooks/useSettings";
import { toast } from "../../../helpers/toast";
// Substitua a importação do StyledPhoneInput pelo novo componente
import UserPhoneInput from "../../../components/PhoneInputs/UserPhoneInput";

// Styled Components
const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  overflowY: 'auto'
}));

const ImageUpload = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .MuiAvatar-root': {
    width: 100,
    height: 100,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  }
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const SwitchItem = styled(FormControlLabel)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  '& .MuiFormControlLabel-label': {
    flex: 1,
  },
  '& .description': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5)
  }
}));

const ColorPickerWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  '& .twitter-picker': {
    width: '100% !important',
    backgroundColor: 'transparent !important',
    boxShadow: 'none !important',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  }
}));

// Validation Schema
const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("inputErrors.tooShort"))
    .max(50, i18n.t("inputErrors.tooLong"))
    .required(i18n.t("inputErrors.required")),
  password: Yup.string()
    .min(5, i18n.t("inputErrors.tooShort"))
    .max(50, i18n.t("inputErrors.tooLong"))
    .when('$isNewUser', {
      is: true,
      then: schema => schema.required(i18n.t("inputErrors.required")),
      otherwise: schema => schema.optional()
    }),
  email: Yup.string()
    .email(i18n.t("inputErrors.email"))
    .required(i18n.t("inputErrors.required")),
  startWork: Yup.string().required(i18n.t("users.startWorkRequired")),
  endWork: Yup.string().required(i18n.t("users.endWorkRequired"))
});

const UserModal = ({ open, onClose, userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getCachedSetting } = useSettings();
  const { user: loggedInUser } = useContext(AuthContext);
  const { setMakeRequestGetUsers } = useContext(GlobalContext);
  const { loading: whatsappsLoading, whatsApps } = useWhatsApps();

  // Refs
  const fileInputRef = useRef(null);
  const formikRef = useRef(null);

  // Estados
  const [activeTab, setActiveTab] = useState(0);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappId, setWhatsappId] = useState(null);
  const [enableGLPI, setEnableGLPI] = useState(false);
  const [superUser, setSuperUser] = useState(false);
  const [canEditPassword, setCanEditPassword] = useState(false);
  const [canEditNotifications, setCanEditNotifications] = useState(false);
  const [canEditPermissions, setCanEditPermissions] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
    profile: "user",
    allTicket: "enabled",
    startWork: "",
    endWork: "",
    spy: "enabled",
    isTricked: "enabled",
    defaultMenu: "open",
    color: "#7367F0",
    number: "",
    profilePic: null,
    ramal: "",
    canCreateTags: false,
    notifyNewTicket: false,
    notifyTask: false,
    canRestartConnections: false,
    canManageSchedulesNodesData: false
  });

  useEffect(() => {
    const fetchGLPISetting = async () => {
      const glpiSetting = await getCachedSetting("enableGLPI");
      setEnableGLPI(glpiSetting?.value === "enabled");
    };
    fetchGLPISetting();
  }, [getCachedSetting]);

  useEffect(() => {
    const fetchUser = async () => {
      // Limpar o erro de telefone quando o modal for aberto/reaberto
      setPhoneError("");

      if (!userId) {
        setCanEditPassword(true);
        setCanEditNotifications(loggedInUser.profile === "admin" || loggedInUser.profile === "superv");
        setCanEditPermissions(loggedInUser.profile === "admin" || loggedInUser.profile === "superv");
        return;
      }

      try {
        const { data } = await api.get(`/users/${userId}`);
        if (!data.color) {
          data.color = "#7367F0";
        }

        setInitialValues(prevState => ({
          ...prevState,
          ...data,
          // Garantir que os valores booleanos das propriedades sejam corretamente inicializados
          notifyNewTicket: data.notifyNewTicket || false,
          notifyTask: data.notifyTask || false,
          canRestartConnections: data.canRestartConnections || false,
          canManageSchedulesNodesData: data.canManageSchedulesNodesData || false
        }));

        if (data?.profilePic) {
          setPreviewImage(
            `${process.env.REACT_APP_BACKEND_URL}/public/company${data.companyId}/profile/${data.profilePic}`
          );
        }

        if (data.queues && Array.isArray(data.queues)) {
          setSelectedQueueIds(data.queues.map(queue => queue.id));
        }

        setWhatsappId(data.whatsappId || null);
        setSuperUser(data.super);

        // Lógica de permissão de edição de senha
        if (loggedInUser.super) {
          setCanEditPassword(data.super ? loggedInUser.id === userId : true);
        } else if (loggedInUser.profile === "admin") {
          setCanEditPassword(
            ["user", "superv"].includes(data.profile) || loggedInUser.id === userId
          );
        } else if (loggedInUser.profile === "superv") {
          setCanEditPassword(data.profile === "user" || loggedInUser.id === userId);
        } else {
          setCanEditPassword(loggedInUser.id === userId);
        }

        // Lógica de permissão para edição de notificações
        setCanEditNotifications(
          (loggedInUser.profile === "admin" || loggedInUser.profile === "superv") ||
          (loggedInUser.id === userId && data.profile !== "user")
        );
        
        // Lógica de permissão para edição de permissões
        setCanEditPermissions(
          (loggedInUser.profile === "admin" || loggedInUser.profile === "superv") &&
          (data.profile !== "admin" || loggedInUser.id === userId)
        );
      } catch (err) {
        console.error(err);
        toast.error(err.message || i18n.t("userModal.errors.load"));
      }
    };

    fetchUser();
  }, [userId, loggedInUser]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const submitForm = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();

      // Remove campos que não devem ser enviados
      const {
        tokenVersion,
        createdAt,
        updatedAt,
        online,
        passwordHash,
        ...cleanValues
      } = values;

      // Validar o número de telefone
      let phoneNumber = values.number;
      let isValidPhone = true;

      // Se o campo não estiver vazio, valide-o
      if (phoneNumber && phoneNumber.length > 4) {
        if (!phoneNumber.startsWith('+')) {
          // Adicione o prefixo internacional se não existir
          phoneNumber = `+${phoneNumber}`;
        }

        // Verifique se o número tem um formato válido
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        isValidPhone = phoneRegex.test(phoneNumber);

        if (!isValidPhone) {
          setPhoneError("Número de telefone inválido");
          setSubmitting(false);
          return;
        }
      }

      // Prepara dados para envio
      Object.entries(cleanValues).forEach(([key, value]) => {
        if (!['profilePic', 'whatsappId', 'queueIds', 'super', 'notifyNewTicket', 'notifyTask', 'canRestartConnections', 'canManageSchedulesNodesData', 'number'].includes(key)) {
          formData.append(key, String(value !== null && value !== undefined ? value : ''));
        }
      });

      // Adicionar o número formatado
      formData.append('number', phoneNumber || '');

      // CORREÇÃO: Garantir que os valores boolean sejam enviados corretamente
      formData.append('super', superUser === true ? 'true' : 'false');
      formData.append('notifyNewTicket', cleanValues.notifyNewTicket === true ? 'true' : 'false');
      formData.append('notifyTask', cleanValues.notifyTask === true ? 'true' : 'false');
      formData.append('canRestartConnections', cleanValues.canRestartConnections === true ? 'true' : 'false');
      formData.append('canManageSchedulesNodesData', cleanValues.canManageSchedulesNodesData === true ? 'true' : 'false');

      // Adiciona arquivo de imagem se existir
      if (fileInputRef.current?.files[0]) {
        formData.append('typeArch', 'profile');
        formData.append('profile', fileInputRef.current.files[0]);
      }

      // Adiciona WhatsApp ID se existir
      if (whatsappId) {
        formData.append('whatsappId', String(whatsappId));
      }

      // Adiciona IDs das filas selecionadas
      const cleanQueueIds = selectedQueueIds
        .map(id => Number(id))
        .filter(id => !isNaN(id));
      formData.append('queueIds', JSON.stringify(cleanQueueIds));

      // Envia requisição
      if (userId) {
        await api.put(`/users/${userId}`, formData);
        toast.success(i18n.t("userModal.success"));
      } else {
        await api.post("/users", formData);
        toast.success(i18n.t("userModal.success"));
      }

      setMakeRequestGetUsers(Math.random());
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || i18n.t("userModal.errors.save"));
    } finally {
      setSubmitting(false);
    }
  };

  const modalActions = [
    {
      label: i18n.t("userModal.buttons.cancel"),
      onClick: onClose,
      variant: "outlined",
      color: "secondary",
      disabled: false,
      icon: null
    },
    {
      label: userId
        ? i18n.t("userModal.buttons.okEdit")
        : i18n.t("userModal.buttons.okAdd"),
      onClick: submitForm,
      variant: "contained",
      color: "primary",
      disabled: false,
      icon: null
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={userId ? i18n.t("userModal.title.edit") : i18n.t("userModal.title.add")}
      maxWidth="md"
      actions={modalActions}
    >
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={UserSchema}
        onSubmit={handleSubmit}
        validateOnMount={false}
        validateOnChange={true}
        innerRef={formikRef}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          setFieldTouched
        }) => (
          <Form onSubmit={handleSubmit}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? "fullWidth" : "standard"}
              >
                <Tab label={i18n.t("userModal.tabs.info")} />
                <Tab label={i18n.t("userModal.tabs.permission")} />
                <Tab label={i18n.t("userModal.tabs.notifications")} icon={<Notifications />} iconPosition="start" />
                {enableGLPI && <Tab label="GLPI" />}
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <TabPanel>
                <ImageUpload>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <Avatar
                    src={previewImage}
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {i18n.t("userModal.form.profilePicHelp")}
                  </Typography>
                </ImageUpload>

                <FormSection>
                  <TextField
                    fullWidth
                    name="name"
                    label={i18n.t("userModal.form.name")}
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormSection>

                {/* Profile e Ramal na mesma linha */}
                <FormSection>
                  <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
                    <FormControl fullWidth>
                      <InputLabel>
                        {i18n.t("userModal.form.profileT")}
                      </InputLabel>
                      <Select
                        name="profile"
                        value={values.profile}
                        onChange={handleChange}
                        label={i18n.t("userModal.form.profileT")}
                      >
                        <MenuItem value="admin">
                          {i18n.t("userModal.form.profile.admin")}
                        </MenuItem>
                        <MenuItem value="user">
                          {i18n.t("userModal.form.profile.user")}
                        </MenuItem>
                        <MenuItem value="superv">
                          {i18n.t("userModal.form.profile.superv")}
                        </MenuItem>
                      </Select>
                      <FormHelperText>
                        {i18n.t("userModal.form.profileHelp")}
                      </FormHelperText>
                    </FormControl>

                    <TextField
                      fullWidth
                      name="ramal"
                      label={i18n.t("userModal.form.ramal")}
                      value={values.ramal}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </FormSection>

                <FormSection>
                  <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
                    <TextField
                      fullWidth
                      name="email"
                      label={i18n.t("userModal.form.email")}
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {canEditPassword && (
                      <TextField
                        fullWidth
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        label={i18n.t("userModal.form.password")}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="large"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Box>
                </FormSection>

                <FormSection>
                  <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
                    <TextField
                      fullWidth
                      type="time"
                      name="startWork"
                      label={i18n.t("userModal.form.startWork")}
                      value={values.startWork}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.startWork && Boolean(errors.startWork)}
                      helperText={touched.startWork && errors.startWork}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTime />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                      fullWidth
                      type="time"
                      name="endWork"
                      label={i18n.t("userModal.form.endWork")}
                      value={values.endWork}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.endWork && Boolean(errors.endWork)}
                      helperText={touched.endWork && errors.endWork}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTime />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <FormHelperText>
                    {i18n.t("userModal.form.workHoursHelp")}
                  </FormHelperText>
                </FormSection>

                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() => (
                    <FormSection>
                      <UserQueueSelect
                        selectedQueueIds={selectedQueueIds}
                        onChange={setSelectedQueueIds}
                      />
                    </FormSection>
                  )}
                />
              </TabPanel>
            )}

            {activeTab === 1 && (
              <TabPanel>
                {loggedInUser.super && (
                  <SwitchItem
                    control={
                      <Switch
                        checked={superUser}
                        onChange={(e) => {
                          setSuperUser(e.target.checked);
                        }}
                        disabled={userId === loggedInUser?.id}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {i18n.t("userModal.form.super")}
                        </Typography>
                        <Typography className="description">
                          {i18n.t("userModal.form.superHelp")}
                        </Typography>
                      </Box>
                    }
                  />
                )}

                <SwitchItem
                  control={
                    <Switch
                      checked={values.allTicket === 'enabled'}
                      onChange={(e) => setFieldValue('allTicket', e.target.checked ? 'enabled' : 'disabled')}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {i18n.t("userModal.form.allTicket")}
                      </Typography>
                      <Typography className="description">
                        {i18n.t("userModal.form.allTicketHelp")}
                      </Typography>
                    </Box>
                  }
                />

                <SwitchItem
                  control={
                    <Switch
                      checked={values.spy === 'enabled'}
                      onChange={(e) => setFieldValue('spy', e.target.checked ? 'enabled' : 'disabled')}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {i18n.t("userModal.form.spy")}
                      </Typography>
                      <Typography className="description">
                        {i18n.t("userModal.form.spyHelp")}
                      </Typography>
                    </Box>
                  }
                />

                <SwitchItem
                  control={
                    <Switch
                      checked={values.isTricked === 'enabled'}
                      onChange={(e) => setFieldValue('isTricked', e.target.checked ? 'enabled' : 'disabled')}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {i18n.t("userModal.form.isTricked")}
                      </Typography>
                      <Typography className="description">
                        {i18n.t("userModal.form.isTrickedHelp")}
                      </Typography>
                    </Box>
                  }
                />

                {/* Novo switch para reiniciar conexões */}
                <SwitchItem
                  control={
                    <Switch
                      checked={values.canRestartConnections === true}
                      onChange={(e) => setFieldValue('canRestartConnections', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {i18n.t("userModal.form.canRestartConnections")}
                      </Typography>
                      <Typography className="description">
                        {i18n.t("userModal.form.canRestartConnectionsHelp")}
                      </Typography>
                    </Box>
                  }
                />

                <SwitchItem
                  control={
                    <Switch
                      checked={values.canCreateTags}
                      onChange={(e) => setFieldValue('canCreateTags', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        Permissão para criar tags
                      </Typography>
                      <Typography className="description">
                        Permite ao usuário criar novas tags no sistema
                      </Typography>
                    </Box>
                  }
                />
                
                {/* Nova permissão para gerenciar horários no drawer de Schedule */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, fontSize: '1rem' }} />
                  Permissões adicionais
                </Typography>
                
                <SwitchItem
  control={
    <Switch
      checked={values.canManageSchedulesNodesData === true}
      onChange={(e) => {
        // Qualquer perfil pode ter a permissão atribuída
        // Apenas removemos a verificação que impedia atribuir a permissão
        setFieldValue('canManageSchedulesNodesData', e.target.checked);
      }}
      // Apenas verificamos se o usuário atual tem permissão para editar
      disabled={!canEditPermissions}
      color="primary"
    />
  }
  label={
    <Box>
      <Typography variant="body1">
        Gerenciar horários no fluxo
      </Typography>
      <Typography className="description">
        Permite ao usuário criar, editar e excluir horários diretamente no drawer do nó de Schedule do fluxo de atendimento
      </Typography>
    </Box>
  }
/>

                <FormSection>
                  <FormControl fullWidth>
                    <InputLabel>
                      {i18n.t("userModal.form.defaultMenu")}
                    </InputLabel>
                    <Select
                      name="defaultMenu"
                      value={values.defaultMenu}
                      onChange={handleChange}
                      label={i18n.t("userModal.form.defaultMenu")}
                    >
                      <MenuItem value="open">
                        {i18n.t("userModal.form.defaultMenuOpen")}
                      </MenuItem>
                      <MenuItem value="closed">
                        {i18n.t("userModal.form.defaultMenuClosed")}
                      </MenuItem>
                    </Select>
                    <FormHelperText>
                      {i18n.t("userModal.form.defaultMenuHelp")}
                    </FormHelperText>
                  </FormControl>
                </FormSection>

                <FormSection>
                  <Typography variant="subtitle1" gutterBottom>
                    {i18n.t("userModal.form.color")}
                  </Typography>
                  <ColorPickerWrapper>
                    <TwitterPicker
                      color={values.color || "#7367F0"} // Garante que sempre terá um valor válido
                      onChange={(color) => {
                        // Validação do valor retornado pelo color picker
                        if (color && typeof color === 'object' && color.hex) {
                          setFieldValue('color', color.hex);
                        } else {
                          setFieldValue('color', '#7367F0'); // Valor padrão
                        }
                      }}
                      triangle="hide"
                    />
                  </ColorPickerWrapper>
                  <FormHelperText>
                    {i18n.t("userModal.form.colorHelp")}
                  </FormHelperText>
                </FormSection>
              </TabPanel>
            )}

            {/* Aba de Notificações */}
{activeTab === 2 && (
  <TabPanel>
    <Typography variant="h6" gutterBottom>
      {i18n.t("userModal.form.notificationSettings")}
    </Typography>

    <FormSection>
      {/* Componente UserPhoneInput com tratamento para valores nulos */}
      <UserPhoneInput
        name="number"
        label={i18n.t("userModal.form.number")}
        value={values.number || ''} // Garantir que nunca seja null
        onChange={(phone, isValid) => {
          setFieldValue('number', phone);
          
          // Validação só quando houver valor e com verificação de nulidade
          if (phone && typeof phone === 'string' && phone.trim() !== '') {
            if (!isValid) {
              setPhoneError(i18n.t("userModal.form.invalidPhone"));
            } else {
              setPhoneError("");
            }
          } else {
            setPhoneError("");
          }
        }}
        onBlur={() => {
          setFieldTouched('number', true, false);
        }}
        error={phoneError}
        helperText={phoneError || i18n.t("userModal.form.numberHelp")}
        disabled={!canEditNotifications}
      />
    </FormSection>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'medium' }}>
      {i18n.t("userModal.form.notificationTypes")}
    </Typography>

    <SwitchItem
      control={
        <Switch
          checked={values.notifyNewTicket === true}
          onChange={(e) => setFieldValue('notifyNewTicket', e.target.checked)}
          color="primary"
          disabled={!canEditNotifications}
        />
      }
      label={
        <Box>
          <Typography variant="body1">
            {i18n.t("userModal.form.notifyNewTicket")}
          </Typography>
          <Typography className="description">
            {i18n.t("userModal.form.notifyNewTicketHelp")}
          </Typography>
        </Box>
      }
    />

    <SwitchItem
      control={
        <Switch
          checked={values.notifyTask === true}
          onChange={(e) => setFieldValue('notifyTask', e.target.checked)}
          color="primary"
          disabled={!canEditNotifications}
        />
      }
      label={
        <Box>
          <Typography variant="body1">
            {i18n.t("userModal.form.notifyTask")}
          </Typography>
          <Typography className="description">
            {i18n.t("userModal.form.notifyTaskHelp")}
          </Typography>
        </Box>
      }
    />
    <Can
      role={loggedInUser.profile}
      perform="user-modal:editWhatsApp"
      yes={() => (
        <FormSection sx={{ mt: 4 }}>
          <FormControl fullWidth>
            <InputLabel>
              {i18n.t("userModal.form.whatsapp")}
            </InputLabel>
            <Select
              value={whatsappId || ''}
              onChange={(e) => setWhatsappId(e.target.value ? Number(e.target.value) : null)}
              label={i18n.t("userModal.form.whatsapp")}
              disabled={!canEditNotifications || whatsappsLoading}
            >
              <MenuItem value="">
                <em>{i18n.t("userModal.form.whatsappNone")}</em>
              </MenuItem>
              {/* Verificação para garantir que whatsApps seja um array antes de usar map */}
              {Array.isArray(whatsApps) && whatsApps.length > 0 ? (
                whatsApps.map((whatsapp) => (
                  <MenuItem key={whatsapp.id} value={whatsapp.id}>
                    {whatsapp.name}
                  </MenuItem>
                ))
              ) : whatsappsLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Carregando...
                </MenuItem>
              ) : (
                <MenuItem disabled>
                  Nenhum WhatsApp disponível
                </MenuItem>
              )}
            </Select>
            <FormHelperText>
              {i18n.t("userModal.form.whatsappHelp")}
            </FormHelperText>
          </FormControl>
        </FormSection>
      )}
    />

    {!canEditNotifications && (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="textSecondary">
          {i18n.t("userModal.form.onlyAdminSupervHelp")}
        </Typography>
      </Box>
    )}
  </TabPanel>
)}

            {enableGLPI && activeTab === 3 && (
              <TabPanel>
                <FormSection>
                  <TextField
                    fullWidth
                    name="glpiUser"
                    label={i18n.t("userModal.form.glpiUser")}
                    value={values.glpiUser || ''}
                    onChange={handleChange}
                  />
                </FormSection>

                <FormSection>
                  <TextField
                    fullWidth
                    name="glpiPass"
                    type="password"
                    label={i18n.t("userModal.form.glpiPass")}
                    value={values.glpiPass || ''}
                    onChange={handleChange}
                  />
                </FormSection>

                <FormHelperText>
                  {i18n.t("userModal.form.glpiHelp")}
                </FormHelperText>
              </TabPanel>
            )}
          </Form>
        )}
      </Formik>
    </BaseModal>
  );
};

export default UserModal;