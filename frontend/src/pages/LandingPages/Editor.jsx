import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  Assignment as FormIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import api from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import { slugify } from '../../utils/stringUtils';

// Componentes Base do AutoAtende
import StandardPageLayout from '../../components/shared/StandardPageLayout';
import BaseModal from '../../components/shared/BaseModal';

// Tabs do editor
import BasicInfoTab from './components/tabs/BasicInfoTab';
import FormConfigTab from './components/tabs/FormConfigTab';
import AppearanceTab from './components/tabs/AppearanceTab';
import NotificationsTab from './components/tabs/NotificationsTab';
import AdvancedConfigTab from './components/tabs/AdvancedConfigTab';
import ContentEditorTab from './components/tabs/ContentEditorTab';

import { PreviewContent } from './components/PreviewDialog';

const LandingPageEditor = () => {
  const { id } = useParams();
  const isNewLandingPage = id === 'new' || localStorage.getItem("landingPageNew") === "true";
  const landingPageId = isNewLandingPage ? null : parseInt(id, 10);
  const isValidId = !isNewLandingPage && Boolean(landingPageId && !isNaN(landingPageId) && landingPageId > 0);
  const history = useHistory();
  const { isAuth, user } = useContext(AuthContext);
  const companyId = localStorage.getItem("companyId");

  // Estados
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(isNewLandingPage ? false : true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isNew, setIsNew] = useState(isNewLandingPage);

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
      messageTemplate: 'Olá! Uma nova inscrição foi realizada na landing page {landing_page}:\n\nNome: {name}\nE-mail: {email}\nData: {date}',
      confirmationMessage: {
        enabled: false,
        imageUrl: '',
        caption: 'Obrigado por se cadastrar! Seu formulário foi recebido com sucesso.',
        sendBefore: true
      }
    },
    advancedConfig: {
      metaPixelId: '',
      notificationConnectionId: '',
      contactTags: [],
      inviteGroupId: '',
      groupInviteMessage: null,
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
        name: 'name',
        type: 'text',
        label: 'Nome',
        placeholder: 'Digite seu nome',
        required: true,
        order: 0
      },
      {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'E-mail',
        placeholder: 'Digite seu e-mail',
        required: true,
        order: 1
      },
      {
        id: 'number',
        name: 'number',
        type: 'phone',
        label: 'Telefone',
        placeholder: 'Digite seu telefone',
        required: true,
        order: 2
      }
    ],
    active: true
  });

  useEffect(() => {
    if (isNewLandingPage) {
      console.log("Criando nova landing page");
      localStorage.removeItem("landingPageNew");
    }
  }, [isNewLandingPage]);

  const loadLandingPage = useCallback(async () => {
    if (isNewLandingPage) {
      setLoading(false);
      return;
    }
    
    if (!isValidId) {
      toast.error('ID da landing page inválido');
      history.push('/landing-pages');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.get(`/landing-pages/${landingPageId}`);
      
      const landingPageData = {
        ...response.data,
        content: response.data.content || '<p>Digite o conteúdo da sua landing page aqui...</p>'
      };
      
      setLandingPage(landingPageData);
      
      if (response.data.forms && response.data.forms.length > 0) {
        setForm(response.data.forms[0]);
      }
      
    } catch (error) {
      toast.error('Erro ao carregar landing page: ' + 
          (error.response?.data?.message || error.message));
      
      setTimeout(() => {
        history.push('/landing-pages');
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [landingPageId, isValidId, history, isNewLandingPage]);

  useEffect(() => {
    loadLandingPage();
  }, [loadLandingPage]);

  // Função para verificar disponibilidade do slug
  const checkSlugAvailability = async (slug) => {
    try {
      if (!slug || slug.trim() === '') {
        return false;
      }

      const normalizedSlug = slugify(slug).substring(0, 60);
      const response = await api.get(`/landing-pages/check-slug/${encodeURIComponent(normalizedSlug)}`);

      if (response.data && typeof response.data.available === 'boolean') {
        return response.data.available;
      }

      return true;
    } catch (error) {
      return true;
    }
  };

  // Função para salvar a landing page
  const handleSave = async () => {
    try {
      setSaving(true);

      if (!landingPage.title) {
        toast.error('O título da página é obrigatório');
        setActiveTab(0);
        setSaving(false);
        return;
      }

      if (!landingPage.slug) {
        landingPage.slug = slugify(landingPage.title);
      }

      const payload = { ...landingPage };

      if (isNew) {
        try {
          const slugAvailable = await checkSlugAvailability(landingPage.slug);
          if (!slugAvailable) {
            const randomSuffix = Math.floor(Math.random() * 1000);
            payload.slug = `${landingPage.slug}-${randomSuffix}`;
            setLandingPage(prev => ({
              ...prev,
              slug: payload.slug
            }));
          }
        } catch (error) {
          console.error('Erro na verificação de slug:', error);
        }
      }

      let response;

      if (isNew) {
        response = await api.post('/landing-pages', payload);

        if (landingPage.formConfig.showForm) {
          await api.post('/forms', {
            ...form,
            landingPageId: response.data.id
          });
        }

        toast.success('Landing page criada com sucesso!');
        setIsNew(false);

        setTimeout(() => {
          history.push(`/landing-pages/edit/${response.data.id}`);
        }, 500);
      } else {
        response = await api.put(`/landing-pages/${id}`, payload);

        if (form.id) {
          await api.put(`/forms/${form.id}`, form);
        } else if (landingPage.formConfig.showForm) {
          await api.post('/forms', {
            ...form,
            landingPageId: id
          });
        }

        toast.success('Landing page atualizada com sucesso!');
      }

      setLandingPage(response.data);

    } catch (error) {
      toast.error(`Erro ao salvar: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handlers para modais e navegação
  const handleOpenPreview = () => setPreviewOpen(true);
  const handleClosePreview = () => setPreviewOpen(false);

  const handleGoBack = () => {
    history.push('/landing-pages');
  };

  // Ações do header
  const pageActions = [
    {
      label: "Voltar",
      icon: <ArrowBackIcon />,
      onClick: handleGoBack,
      variant: "outlined",
      color: "inherit"
    },
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

  // Configuração das abas
  const tabs = [
    {
      label: "Básico",
      icon: <InfoIcon />
    },
    {
      label: "Conteúdo",
      icon: <DescriptionIcon />
    },
    {
      label: "Formulário",
      icon: <FormIcon />
    },
    {
      label: "Aparência",
      icon: <PaletteIcon />
    },
    {
      label: "Notificações",
      icon: <NotificationsIcon />
    },
    {
      label: "Avançado",
      icon: <SettingsIcon />
    }
  ];

  // Renderizar conteúdo da aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <BasicInfoTab
            landingPage={landingPage}
            setLandingPage={setLandingPage}
            checkSlugAvailability={checkSlugAvailability}
            isNew={isNew}
          />
        );
      case 1:
        return (
          <ContentEditorTab
            landingPage={landingPage}
            setLandingPage={setLandingPage}
          />
        );
      case 2:
        return (
          <FormConfigTab
            landingPage={landingPage}
            setLandingPage={setLandingPage}
            form={form}
            setForm={setForm}
          />
        );
      case 3:
        return (
          <AppearanceTab
            landingPage={landingPage}
            setLandingPage={setLandingPage}
          />
        );
      case 5:
        return (
          <NotificationsTab
            landingPage={landingPage}
            setLandingPage={setLandingPage}
          />
        );
      case 6:
        return (
          <AdvancedConfigTab
            landingPage={landingPage}
            setLandingPage={setLandingPage}
          />
        );
      default:
        return null;
    }
  };

  // Estado de loading
  if (loading) {
    return (
      <StandardPageLayout
        title={isNew ? 'Nova Landing Page' : 'Carregando...'}
        showSearch={false}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </StandardPageLayout>
    );
  }

  // Título da página com status
  const pageTitle = (
    <Box display="flex" alignItems="center" gap={1}>
      <EditIcon sx={{ color: landingPage.active ? 'success.main' : 'text.secondary' }} />
      {landingPage.title || (isNew ? 'Nova Landing Page' : 'Editando Landing Page')}
      {landingPage.active && (
        <Chip
          icon={<CheckCircleIcon />}
          label="Publicada"
          color="success"
          size="small"
          variant="filled"
        />
      )}
      {saving && (
        <Chip
          icon={<CircularProgress size={14} color="inherit" />}
          label="Salvando..."
          color="primary"
          size="small"
          variant="outlined"
        />
      )}
    </Box>
  );

  return (
    <StandardPageLayout
      title={pageTitle}
      actions={pageActions}
      showSearch={false}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(event, newValue) => setActiveTab(newValue)}
      loading={saving}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Alertas contextuais */}
        {!landingPage.active && (
          <Alert 
            severity="info" 
            variant="outlined" 
            sx={{ mb: 2, borderRadius: 2 }}
          >
            Esta landing page está em modo rascunho. Ative-a na aba "Básico" para torná-la pública.
          </Alert>
        )}

        {isNew && (
          <Alert 
            severity="warning" 
            variant="outlined" 
            sx={{ mb: 2, borderRadius: 2 }}
          >
            Lembre-se de salvar suas alterações antes de sair da página.
          </Alert>
        )}

        {/* Conteúdo da aba ativa */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {renderTabContent()}
        </Box>
      </Box>

      {/* Modal de Pré-visualização */}
      <BaseModal
        open={previewOpen}
        onClose={handleClosePreview}
        title={`Pré-visualização: ${landingPage.title || 'Landing Page'}`}
        maxWidth="lg"
        actions={[
          {
            label: "Fechar",
            onClick: handleClosePreview,
            variant: "contained",
            color: "primary"
          }
        ]}
      >
        <PreviewContent
          landingPage={landingPage}
          form={form}
        />
      </BaseModal>
    </StandardPageLayout>
  );
};

export default LandingPageEditor;