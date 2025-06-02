import React, { useState, useEffect, useCallback, memo, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  TableCell,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Visibility as DetailsIcon,
  People as UsersIcon,
  Receipt as InvoicesIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  CloudDownload as CloudDownloadIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

import { AuthContext } from '../../context/Auth/AuthContext';
import useSettings from "../../hooks/useSettings";
import { toast } from '../../helpers/toast';
import api from '../../services/api';

// Components
import StandardPageLayout from '../../components/shared/StandardPageLayout';
import StandardDataTable from '../../components/shared/StandardDataTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import CompanyForm from './components/CompanyForm';
import CompanyDetails from './components/CompanyDetails';
import CompanyUsers from './components/CompanyUsers';
import CompanyInvoices from './components/CompanyInvoices';
import CompanySchedules from './components/CompanySchedules';

const Companies = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const { settings } = useSettings();

  // Estado principal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  // Estados de paginação e filtros
  const [page, setPage] = useState(1);
  const [searchParam, setSearchParam] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const searchTimeout = useRef(null);
  const loadingRef = useRef(false);
  const pageSize = 20;

  // Estados dos modals
  const schedulesEnabled = settings.scheduleType === "company";
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showConfirmBlock, setShowConfirmBlock] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);

  // Estados dos menus
  const [anchorExport, setAnchorExport] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [blockAction, setBlockAction] = useState('block');

  // Função para carregar empresas
  const loadCompanies = useCallback(async (isFirstLoad = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = isFirstLoad ? 1 : page;
      
      const { data } = await api.get('/companiesPlan', {
        params: {
          page: currentPage,
          pageSize,
          search: searchParam,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      
      if (isFirstLoad) {
        setRecords(data.companies);
      } else {
        setRecords(prevRecords => [...prevRecords, ...data.companies]);
      }
      
      setHasMore(data.companies.length === pageSize);
      
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar empresas');
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, pageSize, searchParam, statusFilter]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    setRecords([]);
    setHasMore(true);
    setPage(1);
    
    searchTimeout.current = setTimeout(() => {
      loadCompanies(true);
    }, 500);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchParam, statusFilter, loadCompanies]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      loadCompanies(false);
    }
  }, [page, loadCompanies]);

  const handleSearch = useCallback((event) => {
    setSearchParam(event.target.value);
  }, []);

  const handleFilterChange = useCallback((newFilter) => {
    setStatusFilter(newFilter);
    setFilterAnchor(null);
  }, []);

  const handleSaveCompany = useCallback(async () => {
    setRecords([]);
    setHasMore(true);
    setPage(1);
    
    setTimeout(() => {
      loadCompanies(true);
    }, 100);
    
    setShowCompanyModal(false);
  }, [loadCompanies]);

  const handleBlockUnblock = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      if (blockAction === 'block') {
        await api.put(`/companies/${selectedCompany.id}/block`);
        toast.success('Empresa bloqueada com sucesso!');
      } else {
        await api.put(`/companies/${selectedCompany.id}/unblock`);
        toast.success('Empresa desbloqueada com sucesso!');
      }
      
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === selectedCompany.id 
            ? { ...record, status: blockAction === 'unblock' }
            : record
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erro ao alterar status da empresa');
    } finally {
      setLoading(false);
      setShowConfirmBlock(false);
    }
  }, [selectedCompany, blockAction]);

  const handleDeleteCompany = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      await api.delete(`/companies/${selectedCompany.id}`);
      toast.success('Empresa excluída com sucesso!');
      
      setRecords(prevRecords => 
        prevRecords.filter(record => record.id !== selectedCompany.id)
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erro ao excluir empresa');
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  }, [selectedCompany]);

  const handleExport = useCallback(async (type) => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `empresas.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setAnchorExport(null);
      toast.success(`Exportação para ${type.toUpperCase()} concluída!`);
    } catch (err) {
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Configuração das colunas da tabela
  const columns = [
    {
      id: 'id',
      field: 'id',
      label: 'ID',
      width: '80px',
      align: 'center'
    },
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      minWidth: 200,
      render: (company) => (
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {company.name}
        </Typography>
      )
    },
    {
      id: 'email',
      field: 'email',
      label: 'Email',
      minWidth: 200,
      render: (company) => (
        <Typography variant="body2">
          {company.email || 'N/A'}
        </Typography>
      )
    },
    {
      id: 'phone',
      field: 'phone',
      label: 'Telefone',
      width: 150,
      render: (company) => (
        <Typography variant="body2">
          {company.phone || 'N/A'}
        </Typography>
      )
    },
    {
      id: 'status',
      field: 'status',
      label: 'Status',
      width: 120,
      render: (company) => (
        <Chip
          label={company.status ? 'Ativa' : 'Inativa'}
          color={company.status ? 'success' : 'default'}
          size="small"
          sx={{ borderRadius: 12, fontWeight: 600 }}
        />
      )
    },
    {
      id: 'plan',
      field: 'plan',
      label: 'Plano',
      width: 150,
      render: (company) => (
        <Typography variant="body2">
          {company.plan?.name || 'N/A'}
        </Typography>
      )
    }
  ];

  // Ações da tabela
  const getTableActions = (company) => {
    const actions = [
      {
        label: "Detalhes",
        icon: <DetailsIcon />,
        onClick: (company) => {
          setSelectedCompany(company);
          setShowDetailsModal(true);
        },
        color: "info"
      },
      {
        label: "Usuários",
        icon: <UsersIcon />,
        onClick: (company) => {
          setSelectedCompany(company);
          setShowUsersModal(true);
        },
        color: "primary"
      },
      {
        label: "Faturas",
        icon: <InvoicesIcon />,
        onClick: (company) => {
          setSelectedCompany(company);
          setShowInvoicesModal(true);
        },
        color: "secondary"
      }
    ];

    // Adicionar ação de horários se habilitado
    if (schedulesEnabled) {
      actions.push({
        label: "Horários",
        icon: <ScheduleIcon />,
        onClick: (company) => {
          setSelectedCompany(company);
          setScheduleModalOpen(true);
        },
        color: "warning"
      });
    }

    // Ações de edição, bloqueio e exclusão
    actions.push(
      {
        label: "Editar",
        icon: <EditIcon />,
        onClick: (company) => {
          setSelectedCompany(company);
          setShowCompanyModal(true);
        },
        color: "primary"
      },
      {
        label: company.status ? "Bloquear" : "Desbloquear",
        icon: <BlockIcon />,
        onClick: (company) => {
          setSelectedCompany(company);
          setBlockAction(company.status ? 'block' : 'unblock');
          setShowConfirmBlock(true);
        },
        color: company.status ? "warning" : "success"
      },
      {
        label: "Excluir",
        icon: <DeleteIcon />,
        onClick: (company) => {
          setSelectedCompany(company);
          setShowConfirmDelete(true);
        },
        color: "error"
      }
    );

    return actions;
  };

  // Filtrar empresas baseado na aba ativa
  const getFilteredCompanies = () => {
    switch (activeTab) {
      case 1: // Ativas
        return records.filter(company => company.status);
      case 2: // Inativas
        return records.filter(company => !company.status);
      default: // Todas
        return records;
    }
  };

  const filteredCompanies = getFilteredCompanies();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: "Filtrar",
      icon: <FilterIcon />,
      onClick: (e) => setFilterAnchor(e.currentTarget),
      variant: "outlined",
      color: "primary",
      tooltip: "Filtrar empresas"
    },
    {
      label: "Exportar",
      icon: <ExportIcon />,
      onClick: (e) => setAnchorExport(e.currentTarget),
      variant: "outlined",
      color: "primary",
      tooltip: "Exportar dados"
    },
    {
      label: "Nova Empresa",
      icon: <AddIcon />,
      onClick: () => {
        setSelectedCompany(null);
        setShowCompanyModal(true);
      },
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar nova empresa",
      primary: true
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todas (${records.length})`,
      icon: <BusinessIcon />
    },
    {
      label: `Ativas (${records.filter(c => c.status).length})`,
      icon: <ActiveIcon />
    },
    {
      label: `Inativas (${records.filter(c => !c.status).length})`,
      icon: <InactiveIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <StandardPageLayout
        title="Empresas"
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder="Pesquisar empresas..."
        showSearch={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading && records.length === 0}
      >
        <StandardDataTable
          data={filteredCompanies}
          columns={columns}
          loading={loading && records.length === 0}
          actions={filteredCompanies.length > 0 ? getTableActions(filteredCompanies[0]) : []}
          onRowClick={(company) => {
            setSelectedCompany(company);
            setShowDetailsModal(true);
          }}
          stickyHeader={true}
          size="small"
          hover={true}
          maxVisibleActions={8}
          emptyIcon={<BusinessIcon />}
          emptyTitle={
            activeTab === 0 
              ? "Nenhuma empresa encontrada" 
              : activeTab === 1 
                ? "Nenhuma empresa ativa"
                : "Nenhuma empresa inativa"
          }
          emptyDescription={
            searchParam 
              ? "Tente usar outros termos na busca"
              : activeTab === 0
                ? "Comece criando sua primeira empresa"
                : "Não há empresas nesta categoria"
          }
          emptyActionLabel={activeTab === 0 ? "Criar Empresa" : undefined}
          onEmptyActionClick={activeTab === 0 ? () => {
            setSelectedCompany(null);
            setShowCompanyModal(true);
          } : undefined}
        />

        {/* Indicador de carregamento para scroll infinito */}
        {loading && records.length > 0 && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Carregando mais empresas...
            </Typography>
          </Box>
        )}
      </StandardPageLayout>

      {/* Modais */}
      {showCompanyModal && (
        <CompanyForm
          open={showCompanyModal}
          onClose={() => setShowCompanyModal(false)}
          initialData={selectedCompany}
          onSuccess={handleSaveCompany}
        />
      )}

      {showDetailsModal && selectedCompany && (
        <CompanyDetails
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          companyId={selectedCompany.id}
        />
      )}

      {showUsersModal && selectedCompany && (
        <CompanyUsers
          open={showUsersModal}
          onClose={() => setShowUsersModal(false)}
          companyId={selectedCompany.id}
        />
      )}

      {showInvoicesModal && selectedCompany && (
        <CompanyInvoices
          open={showInvoicesModal}
          onClose={() => setShowInvoicesModal(false)}
          companyId={selectedCompany.id}
        />
      )}

      {scheduleModalOpen && selectedCompany && schedulesEnabled && (
        <CompanySchedules
          open={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          companyId={selectedCompany.id}
        />
      )}

      <ConfirmationModal
        title={blockAction === 'block' ? "Bloquear Empresa" : "Desbloquear Empresa"}
        open={showConfirmBlock}
        onClose={() => setShowConfirmBlock(false)}
        onConfirm={handleBlockUnblock}
        loading={loading}
      >
        <Typography>
          {blockAction === 'block' 
            ? 'Tem certeza que deseja bloquear esta empresa? Todas as conexões de WhatsApp serão desconectadas e o acesso será suspenso.'
            : 'Tem certeza que deseja desbloquear esta empresa? O acesso será restaurado e as conexões poderão ser reestabelecidas.'
          }
        </Typography>
      </ConfirmationModal>

      <ConfirmationModal
        title="Excluir Empresa"
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteCompany}
        loading={loading}
      >
        <Typography>
          Tem certeza que deseja excluir esta empresa? Esta ação não poderá ser desfeita.
        </Typography>
      </ConfirmationModal>

      {/* Menus */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem 
          selected={statusFilter === 'all'}
          onClick={() => handleFilterChange('all')}
        >
          Todas as Empresas
        </MenuItem>
        <MenuItem 
          selected={statusFilter === 'active'}
          onClick={() => handleFilterChange('active')}
        >
          Apenas Ativas
        </MenuItem>
        <MenuItem 
          selected={statusFilter === 'inactive'}
          onClick={() => handleFilterChange('inactive')}
        >
          Apenas Inativas
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorExport}
        open={Boolean(anchorExport)}
        onClose={() => setAnchorExport(null)}
      >
        <MenuItem onClick={() => handleExport('xlsx')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar para Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar para PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <CloudDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar para CSV</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default memo(Companies);