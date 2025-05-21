import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  CircularProgress,
  Fab,
  Tooltip,
  InputAdornment,
  useMediaQuery,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  FormatAlignCenter as FormIcon,
  Event as EventIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useSpring, animated } from 'react-spring';
import api from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import { slugify } from '../../utils/stringUtils';
// Componentes Base
import BasePage from '../../components/BasePage';
import BasePageContent from '../../components/BasePageContent';
import BaseButton from '../../components/BaseButton';
import BasePageHeader from '../../components/BasePageHeader';
import BaseResponsiveTabs from '../../components/BaseResponsiveTabs';
import Breadcrumbs from '../../components/Breadcrumbs';

// Tabs do editor
import BasicInfoTab from './components/tabs/BasicInfoTab';
import FormConfigTab from './components/tabs/FormConfigTab';
import EventConfigTab from './components/tabs/EventConfigTab';
import AppearanceTab from './components/tabs/AppearanceTab';
import NotificationsTab from './components/tabs/NotificationsTab';
import AdvancedConfigTab from './components/tabs/AdvancedConfigTab';
import ContentEditorTab from './components/tabs/ContentEditorTab';

// Componente de pré-visualização
import PreviewDialog from './components/PreviewDialog';

const AnimatedBox = animated(Box);

const LandingPageEditor = () => {
  const { id } = useParams();
  const isNewLandingPage = id === 'new' || localStorage.getItem("landingPageNew") === "true";
  const landingPageId = isNewLandingPage ? null : parseInt(id, 10);
  const isValidId = !isNewLandingPage && Boolean(landingPageId && !isNaN(landingPageId) && landingPageId > 0);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuth, user } = useContext(AuthContext);
  const companyId = localStorage.getItem("companyId");

  // Estados
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(isNewLandingPage ? false : true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isNew, setIsNew] = useState(isNewLandingPage);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estado da landing page
  const [landingPage, setLandingPage] = useState({
    title: '',
    slug: '',
    content: '<p>Digite o conteúdo da sua landing page aqui...</p>',
    appearance: {
      textColor: '#000000',
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundPosition: 'center',
      backgroundRepeat: false,
      backgroundSize: 'cover',
      backgroundAttachment: 'scroll'
    },
    formConfig: {
      showForm: true,
      position: 'right',
      title: 'Formulário de Cadastro',
      buttonText: 'Enviar',
      limitSubmissions: false,
      maxSubmissions: 100
    },
    eventConfig: {
      isEvent: false,
      eventTitle: ''
    },
    notificationConfig: {
      enableWhatsApp: false,
      whatsAppNumber: '',
      messageTemplate: 'Olá! Uma nova inscrição foi realizada na landing page {landing_page}:\n\nNome: {name}\nE-mail: {email}\nData: {date}'
    },
    advancedConfig: {
      metaPixelId: '',
      whatsAppChatButton: {
        enabled: false,
        number: '',
        defaultMessage: 'Olá! Gostaria de saber mais sobre {landing_page}'
      }
    },
    active: false
  });

  // Estado para armazenar o formulário
  const [form, setForm] = useState({
    name: 'Formulário de Cadastro',
    description: 'Formulário para coleta de leads',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nome',
        placeholder: 'Digite seu nome',
        required: true,
        order: 0
      },
      {
        id: 'email',
        type: 'email',
        label: 'E-mail',
        placeholder: 'Digite seu e-mail',
        required: true,
        order: 1
      }
    ],
    active: true
  });

  // Animações com react-spring
  const fadeIn = useSpring({
    opacity: loading ? 0 : 1,
    config: { duration: 300 }
  });

  const tabAnimation = useSpring({
    transform: `translateY(${loading ? 20 : 0}px)`,
    opacity: loading ? 0 : 1,
    config: { tension: 280, friction: 60 }
  });

  useEffect(() => {
    if (isNewLandingPage) {
      console.log("Criando nova landing page");
      localStorage.removeItem("landingPageNew");
    }
  }, [isNewLandingPage]);

  const loadLandingPage = useCallback(async () => {
    // Se for nova landing page, não precisamos carregar dados
    if (isNewLandingPage) {
      console.log("Iniciando criação de nova landing page");
      setLoading(false);
      return;
    }
    
    if (!isValidId) {
      setSnackbarState({
        open: true,
        message: 'ID da landing page inválido',
        severity: 'error'
      });
      history.push('/landing-pages');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.get(`/landing-pages/${landingPageId}`);
      
      // Preservar o HTML exatamente como está no banco de dados
      const landingPageData = {
        ...response.data,
        content: response.data.content || '<p>Digite o conteúdo da sua landing page aqui...</p>'
      };
      
      setLandingPage(landingPageData);
      
      // Carregar formulário associado
      if (response.data.forms && response.data.forms.length > 0) {
        setForm(response.data.forms[0]);
      }
      
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Erro ao carregar landing page: ' + 
          (error.response?.data?.message || error.message),
        severity: 'error'
      });
      
      setTimeout(() => {
        history.push('/landing-pages');
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [landingPageId, isValidId, history, setSnackbarState, isNewLandingPage]);
  

  useEffect(() => {
    loadLandingPage();
  }, [loadLandingPage]);

  // Manipulador de mudança de aba
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Em Editor.jsx - Função checkSlugAvailability melhorada
  const checkSlugAvailability = async (slug) => {
    try {
      // Verificação adicional antes de chamar a API
      if (!slug || slug.trim() === '') {
        return false;
      }

      // Limitar comprimento do slug e garantir formato correto
      const normalizedSlug = slugify(slug).substring(0, 60);

      const response = await api.get(`/landing-pages/check-slug/${encodeURIComponent(normalizedSlug)}`);

      // Verificação adicional para garantir resposta válida
      if (response.data && typeof response.data.available === 'boolean') {
        return response.data.available;
      }

      // Assume disponível em caso de resposta inválida
      return true;

    } catch (error) {
      // Em caso de erro, assumimos que o slug está disponível
      // para não bloquear a criação da landing page
      return true;
    }
  };

  // Função para salvar a landing page
  // Função para salvar a landing page
  // Em Editor.jsx - Função handleSave modificada
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validar campos obrigatórios
      if (!landingPage.title) {
        setSnackbarState({
          open: true,
          message: 'O título da página é obrigatório',
          severity: 'error'
        });
        setActiveTab(0);
        setSaving(false);
        return;
      }

      // Garantir que o slug não está vazio
      if (!landingPage.slug) {
        landingPage.slug = slugify(landingPage.title);
      }

      // Preparar dados para envio
      const payload = { ...landingPage };

      // Verificar disponibilidade de slug somente se estiver criando nova página
      if (isNew) {
        try {
          const slugAvailable = await checkSlugAvailability(landingPage.slug);
          if (!slugAvailable) {
            // Gerar um slug único adicionando um número aleatório
            const randomSuffix = Math.floor(Math.random() * 1000);
            payload.slug = `${landingPage.slug}-${randomSuffix}`;
            setLandingPage(prev => ({
              ...prev,
              slug: payload.slug
            }));
          }
        } catch (error) {
          // Continuar a execução mesmo com erro na verificação
        }
      }

      let response;

      if (isNew) {
        // Criar nova landing page
        response = await api.post('/landing-pages', payload);

        // Criar formulário associado se showForm estiver ativado
        if (landingPage.formConfig.showForm) {
          await api.post('/forms', {
            ...form,
            landingPageId: response.data.id
          });
        }

        // Redirecionar para a página de edição
        setSnackbarState({
          open: true,
          message: 'Landing page criada com sucesso!',
          severity: 'success'
        });

        setIsNew(false);

        // Redirecionar DEPOIS de atualizar o estado
        setTimeout(() => {
          history.push(`/landing-pages/edit/${response.data.id}`);
        }, 500);
      } else {
        // Atualizar landing page existente
        response = await api.put(`/landing-pages/${id}`, payload);

        // Atualizar formulário 
        if (form.id) {
          await api.put(`/forms/${form.id}`, form);
        } else if (landingPage.formConfig.showForm) {
          // Criar novo formulário
          await api.post('/forms', {
            ...form,
            landingPageId: id
          });
        }

        setSnackbarState({
          open: true,
          message: 'Landing page atualizada com sucesso!',
          severity: 'success'
        });
      }

      // Atualizar estado com dados retornados
      setLandingPage(response.data);

    } catch (error) {
      setSnackbarState({
        open: true,
        message: `Erro ao salvar: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };


  const saveWithRetry = async (payload, retryCount = 0) => {
    try {
      const maxRetries = 3;
      const response = await api.post('/landing-pages', payload);
      return response;
    } catch (error) {
      if (error.response?.status === 409 && retryCount < maxRetries) {
        // Conflict - slug já existe, tentar com outro slug
        console.log(`Tentando novamente com novo slug (tentativa ${retryCount + 1})`);
        const newSlug = generateUniqueSlug(payload.title);
        return saveWithRetry({ ...payload, slug: newSlug }, retryCount + 1);
      }
      throw error;
    }
  };

  // Abre o diálogo de pré-visualização
  const handleOpenPreview = () => {
    setPreviewOpen(true);
  };

  // Fecha o diálogo de pré-visualização
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  // Fecha a snackbar
  const handleCloseSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      open: false
    });
  };

  // Cria as abas com ícones e conteúdo
  const tabs = [
    {
      label: "Básico",
      icon: <InfoIcon />,
      content: (
        <BasicInfoTab
          landingPage={landingPage}
          setLandingPage={setLandingPage}
          checkSlugAvailability={checkSlugAvailability}
          isNew={isNew}
        />
      )
    },
    {
      label: "Conteúdo",
      icon: <DescriptionIcon />,
      content: (
        <ContentEditorTab
          landingPage={landingPage}
          setLandingPage={setLandingPage}
        />
      )
    },
    {
      label: "Formulário",
      icon: <FormIcon />,
      content: (
        <FormConfigTab
          landingPage={landingPage}
          setLandingPage={setLandingPage}
          form={form}
          setForm={setForm}
        />
      )
    },
    {
      label: "Evento",
      icon: <EventIcon />,
      content: (
        <EventConfigTab
          landingPage={landingPage}
          setLandingPage={setLandingPage}
        />
      )
    },
    {
      label: "Aparência",
      icon: <PaletteIcon />,
      content: (
        <AppearanceTab
          landingPage={landingPage}
          setLandingPage={setLandingPage}
        />
      )
    },
    {
      label: "Notificações",
      icon: <NotificationsIcon />,
      content: (
        <NotificationsTab
          landingPage={landingPage}
          setLandingPage={setLandingPage}
        />
      )
    },
    {
      label: "Avançado",
      icon: <SettingsIcon />,
      content: (
        <AdvancedConfigTab
          landingPage={landingPage}
          setLandingPage={setLandingPage}
        />
      )
    },
  ];

  // Define os items da breadcrumb
  const breadcrumbItems = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Landing Pages", link: "/landing-pages" },
    { label: isNew ? 'Nova Landing Page' : landingPage.title || 'Edição' }
  ];

  // Ações para o header da página
  const headerActions = [
    {
      label: "Visualizar",
      icon: <PreviewIcon />,
      onClick: handleOpenPreview,
      variant: "outlined",
      color: "primary",
      disabled: !landingPage.title
    },
    {
      label: "Salvar",
      icon: <SaveIcon />,
      onClick: handleSave,
      variant: "contained",
      color: "primary",
      disabled: saving || !isAuth
    }
  ];

  // FAB para mobile
  const fabActions = {
    save: {
      icon: <SaveIcon />,
      color: "primary",
      onClick: handleSave,
      tooltip: "Salvar landing page"
    },
    preview: {
      icon: <PreviewIcon />,
      color: "secondary",
      onClick: handleOpenPreview,
      tooltip: "Pré-visualizar landing page"
    }
  };

  if (loading) {
    return (
      <BasePage
        title={isNew ? 'Nova Landing Page' : 'Editando Landing Page'}
        headerContent={
          <BaseButton
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push('/landing-pages')}
          >
            Voltar
          </BaseButton>
        }
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </BasePage>
    );
  }

  return (
    <BasePage
      showTitle={false}
      headerContent={
        <BasePageHeader
          showSearch={false}
          actions={!isMobile ? headerActions : []}
        >
          <Box width="100%">
            <Breadcrumbs items={breadcrumbItems} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <AnimatedBox style={fadeIn}>
                <Box display="flex" alignItems="center">
                  <EditIcon
                    sx={{
                      mr: 1,
                      color: landingPage.active ? 'success.main' : 'text.secondary'
                    }}
                  />
                  {landingPage.title ? (
                    <Box component="h1" fontSize="1.5rem" fontWeight="600" m={0}>
                      {landingPage.title}
                      {landingPage.active && (
                        <Tooltip title="Página ativa e publicada">
                          <CheckCircleIcon
                            fontSize="small"
                            sx={{ ml: 1, color: 'success.main', verticalAlign: 'middle' }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  ) : (
                    <Box component="h1" fontSize="1.5rem" fontWeight="600" m={0}>
                      {isNew ? 'Nova Landing Page' : 'Editando Landing Page'}
                    </Box>
                  )}
                </Box>
              </AnimatedBox>

              <Box>
                <BaseButton
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => history.push('/landing-pages')}
                  sx={{ mr: 1 }}
                >
                  Voltar
                </BaseButton>
              </Box>
            </Box>
          </Box>
        </BasePageHeader>
      }
    >
      <BasePageContent>
        <AnimatedBox style={tabAnimation} display="flex" flexDirection="column" height="100%">
          <BaseResponsiveTabs
            tabs={tabs}
            value={activeTab}
            onChange={handleTabChange}
            showTabsOnMobile={false}
            fabIcon={<SaveIcon />}
            onFabClick={handleSave}
            showFab={isMobile}
            sx={{
              '& .MuiBox-root': {
                height: 'calc(100vh - 240px)', // Altura ajustável conforme necessidade
                overflow: 'auto',
                padding: 1
              }
            }}
          />
        </AnimatedBox>
      </BasePageContent>

      {/* FABs para mobile */}
      {isMobile && (
        <Box>
          <Tooltip title={fabActions.preview.tooltip}>
            <Fab
              color={fabActions.preview.color}
              aria-label={fabActions.preview.tooltip}
              onClick={fabActions.preview.onClick}
              sx={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                zIndex: 1100
              }}
              disabled={!landingPage.title}
            >
              {fabActions.preview.icon}
            </Fab>
          </Tooltip>
        </Box>
      )}

      {/* Diálogo de pré-visualização */}
      <PreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        landingPage={landingPage}
        form={form}
      />

      {/* Snackbar para mensagens de feedback */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarState.severity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </BasePage>
  );
};

export default LandingPageEditor;