import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { debounce } from '../../utils/helpers';

// Material UI
import {
  Box,
  useMediaQuery,
  Fab,
} from "@mui/material";

// Icons
import {
  Add as AddIcon,
  Campaign as CampaignIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  ContactMail as ContactMailIcon,
} from "@mui/icons-material";

// Componentes
import StandardPageLayout from "../../components/StandardPageLayout";

// Tabs
import CampaignsList from "./tabs/CampaignsList";
import ContactListsTab from "./tabs/ContactListsTab";
import CampaignsSettings from "./tabs/CampaignsSettings";
import CampaignReports from "./tabs/CampaignReports";
import FilesTab from "./tabs/FilesTab";

// Modais
import CampaignModal from "./modals/CampaignModal";
import ContactListModal from "./modals/ContactListModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

// API
import api from "../../services/api";

// Reducer para gerenciamento de estado das campanhas
const campaignsReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CAMPAIGNS':
      return {
        ...state,
        campaigns: action.payload.records,
        hasMore: action.payload.hasMore,
        loading: false,
      };
    case 'UPDATE_CAMPAIGN':
      const campaignIndex = state.campaigns.findIndex(c => c.id === action.payload.id);

      if (campaignIndex !== -1) {
        const updatedCampaigns = [...state.campaigns];
        updatedCampaigns[campaignIndex] = action.payload;
        return {
          ...state,
          campaigns: updatedCampaigns
        };
      }

      return {
        ...state,
        campaigns: [action.payload, ...state.campaigns]
      };
    case 'DELETE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter(c => c.id !== action.payload)
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

const BulkSender = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const companyId = user?.companyId;

  // Estados
  const [activeTab, setActiveTab] = useState(0);
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [campaignsState, dispatchCampaigns] = useReducer(campaignsReducer, {
    campaigns: [],
    hasMore: false,
    loading: false,
  });

  // Estado dos modais
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [duplicateFromId, setDuplicateFromId] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // Controle de busca com debounce
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setPageNumber(1);
      setSearchParam(searchTerm.toLowerCase());
    }, 500),
    []
  );

  // Fetch de campanhas
  const fetchCampaigns = useCallback(async () => {
    if (activeTab !== 0) return;

    try {
      dispatchCampaigns({ type: 'SET_LOADING', payload: true });
      const { data } = await api.get("/campaigns/", {
        params: {
          searchParam,
          pageNumber,
          pageSize: 20,
          companyId
        },
      });
      dispatchCampaigns({ type: 'LOAD_CAMPAIGNS', payload: data });
    } catch (err) {
      toast.error(i18n.t("campaigns.toasts.fetchError"));
    }
  }, [searchParam, pageNumber, companyId, activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    
    if (tab === 'reports') {
      setActiveTab(3);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Configuração de socket para atualizações em tempo real
  useEffect(() => {
    if (!companyId || !socketManager) return;
  
    let socket;
    try {
      socket = socketManager.GetSocket(companyId);
    } catch (error) {
      console.error("Erro ao obter socket:", error);
      return;
    }
    
    if (!socket) return;
  
    const handleCampaignUpdate = (data) => {
      if (!data) return;
  
      switch (data.action) {
        case "update":
        case "create":
          dispatchCampaigns({ type: 'UPDATE_CAMPAIGN', payload: data.record });
          break;
        case "delete":
          dispatchCampaigns({ type: 'DELETE_CAMPAIGN', payload: data.id });
          break;
        default:
          break;
      }
    };
  
    const eventName = `company-${companyId}-campaign`;
    socket.on(eventName, handleCampaignUpdate);
  
    return () => {
      if (socket && socket.off) {
        socket.off(eventName, handleCampaignUpdate);
      }
    };
  }, [companyId, socketManager]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleOpenCampaignModal = (campaign = null) => {
    setSelectedCampaign(campaign);
    setDuplicateFromId(null);
    setCampaignModalOpen(true);
  };

  const handleDuplicateCampaign = (campaign) => {
    if (!campaign || !campaign.id) return;
    
    setSelectedCampaign(null);
    setDuplicateFromId(campaign.id);
    setCampaignModalOpen(true);
  };

  const handleOpenContactListModal = (contactList = null) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleOpenDeleteConfirmation = (item, type) => {
    setDeletingItem(item);
    setDeleteType(type);
    setConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'campaign') {
        await api.delete(`/campaigns/${deletingItem.id}`);
        toast.success(i18n.t("campaigns.toasts.deleted"));
        dispatchCampaigns({ type: 'DELETE_CAMPAIGN', payload: deletingItem.id });
      } else if (deleteType === 'contactList') {
        await api.delete(`/contact-lists/${deletingItem.id}`);
        toast.success(i18n.t("contactLists.toasts.deleted"));
      }
    } catch (err) {
      toast.error(i18n.t("common.toasts.deleteError"));
    } finally {
      setConfirmModalOpen(false);
      setDeletingItem(null);
      setDeleteType(null);
    }
  };

  const handleCampaignAction = async (campaign, action) => {
    try {
      await api.post(`/campaigns/${campaign.id}/${action}`);
      toast.success(i18n.t(`campaigns.toasts.${action}`));
      fetchCampaigns();
    } catch (err) {
      toast.error(i18n.t(`campaigns.toasts.${action}Error`));
    }
  };

  // Configuração das ações do cabeçalho
  const getPageActions = () => {
    const actions = [];
    
    switch (activeTab) {
      case 0: // Campanhas
        actions.push({
          label: i18n.t("campaigns.buttons.add"),
          icon: <AddIcon />,
          onClick: () => handleOpenCampaignModal(),
          variant: "contained",
          color: "primary",
          tooltip: "Criar nova campanha"
        });
        break;
      case 1: // Listas de Contatos
        actions.push({
          label: i18n.t("contactLists.buttons.add"),
          icon: <AddIcon />,
          onClick: () => handleOpenContactListModal(),
          variant: "contained",
          color: "primary",
          tooltip: "Criar nova lista de contatos"
        });
        break;
      case 4: // Arquivos
        actions.push({
          label: i18n.t("files.buttons.upload"),
          icon: <AttachFileIcon />,
          onClick: () => document.getElementById('file-upload-input')?.click(),
          variant: "contained",
          color: "primary",
          tooltip: "Fazer upload de arquivo"
        });
        break;
      default:
        break;
    }
    
    return actions;
  };

  // Configuração das abas
  const tabs = [
    {
      label: `${i18n.t("campaigns.tabs.campaigns")} (${campaignsState.campaigns.length})`,
      icon: <SendIcon />
    },
    {
      label: i18n.t("campaigns.tabs.contactLists"),
      icon: <ContactMailIcon />
    },
    {
      label: i18n.t("campaigns.tabs.files"),
      icon: <AttachFileIcon />
    },
    {
      label: i18n.t("campaigns.tabs.reports"),
      icon: <AssessmentIcon />
    },
    {
      label: i18n.t("campaigns.tabs.settings"),
      icon: <SettingsIcon />
    }
  ];

  // Renderizar conteúdo da aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <CampaignsList
            campaigns={campaignsState.campaigns}
            loading={campaignsState.loading}
            onEdit={handleOpenCampaignModal}
            onDelete={item => handleOpenDeleteConfirmation(item, 'campaign')}
            onDuplicate={handleDuplicateCampaign}
            onAction={handleCampaignAction}
            hasMore={campaignsState.hasMore}
            onScroll={() => {
              if (campaignsState.hasMore && !campaignsState.loading) {
                setPageNumber(prev => prev + 1);
              }
            }}
          />
        );
      case 1:
        return (
          <ContactListsTab
            onEdit={handleOpenContactListModal}
            onDelete={item => handleOpenDeleteConfirmation(item, 'contactList')}
            searchParam={searchParam}
          />
        );
      case 2:
        return <FilesTab searchParam={searchParam} />;
      case 3:
        return <CampaignReports />;
      case 4:
        return <CampaignsSettings />;
      default:
        return null;
    }
  };

  // Determinar se deve mostrar o campo de busca
  const showSearch = activeTab === 0 || activeTab === 1 || activeTab === 2;

  return (
    <>
      <StandardPageLayout
        title={i18n.t("campaigns.title")}
        actions={getPageActions()}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("campaigns.searchPlaceholder")}
        showSearch={showSearch}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={campaignsState.loading && activeTab === 0}
      >
        {renderTabContent()}
      </StandardPageLayout>

      {/* FAB para mobile */}
      {isMobile && (activeTab === 0 || activeTab === 1 || activeTab === 2) && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: theme.zIndex.speedDial,
          }}
          onClick={() => {
            switch (activeTab) {
              case 0:
                handleOpenCampaignModal();
                break;
              case 1:
                handleOpenContactListModal();
                break;
              case 2:
                document.getElementById('file-upload-input')?.click();
                break;
              default:
                break;
            }
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Modais */}
      <DeleteConfirmationModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title={
          deleteType === 'campaign'
            ? i18n.t("campaigns.confirmationModal.deleteTitle", { name: deletingItem?.name })
            : i18n.t("contactLists.confirmationModal.deleteTitle", { name: deletingItem?.name })
        }
        message={
          deleteType === 'campaign'
            ? i18n.t("campaigns.confirmationModal.deleteMessage")
            : i18n.t("contactLists.confirmationModal.deleteMessage")
        }
      />

      <CampaignModal
        open={campaignModalOpen}
        onClose={() => {
          setSelectedCampaign(null);
          setDuplicateFromId(null);
          setCampaignModalOpen(false);
        }}
        campaignId={selectedCampaign?.id}
        duplicateFromId={duplicateFromId}
        onSuccess={() => {
          fetchCampaigns();
        }}
      />

      <ContactListModal
        open={contactListModalOpen}
        onClose={() => {
          setSelectedContactList(null);
          setContactListModalOpen(false);
        }}
        contactListId={selectedContactList?.id}
      />

      {/* Input de upload escondido */}
      <input
        id="file-upload-input"
        type="file"
        hidden
        onChange={(e) => {
          if (e.target.files.length > 0) {
            const uploadEvent = new CustomEvent('fileUploadTriggered', {
              detail: e.target.files[0]
            });
            document.dispatchEvent(uploadEvent);
            e.target.value = null;
          }
        }}
      />
    </>
  );
};

export default BulkSender;