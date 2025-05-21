import React, { useState, useEffect, useCallback, memo, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { AuthContext } from '../../context/Auth/AuthContext';
import useSettings from "../../hooks/useSettings";
import { toast } from '../../helpers/toast';
import api from '../../services/api';

// Components
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import CompanyForm from './components/CompanyForm';
import CompanyDetails from './components/CompanyDetails';
import CompanyUsers from './components/CompanyUsers';
import CompanyInvoices from './components/CompanyInvoices';
import CompanySchedules from './components/CompanySchedules';
import { HeaderButtons } from './components/HeaderButtons';
import { ExportMenu } from './components/ExportMenu';
import { FilterMenu } from './components/FilterMenu';
import CustomTable from './components/CustomTable';

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
  const searchTimeout = useRef(null);
  const loadingRef = useRef(false); // Referência para controlar o estado de carregamento
  const pageSize = 20;

  // Estados dos modais
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
const schedulesEnabled = settings.scheduleType === "company";
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
    // Previne múltiplas chamadas simultâneas
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

  // Efeito para carregar empresas na inicialização e quando os filtros mudam
  useEffect(() => {
    // Cancelar qualquer timeout pendente
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Resetar estados para uma nova busca
    setRecords([]);
    setHasMore(true);
    setPage(1);
    
    // Atrasar a busca para evitar muitas requisições durante digitação
    searchTimeout.current = setTimeout(() => {
      loadCompanies(true);
    }, 500);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchParam, statusFilter, loadCompanies]);

  // Função para carregar mais empresas (scroll infinito)
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  // Efeito para carregar mais dados quando a página muda
  useEffect(() => {
    // Não carrega na primeira página, pois isso já é tratado pelo efeito dos filtros
    if (page > 1) {
      loadCompanies(false);
    }
  }, [page, loadCompanies]);

  // Handler para atualização da busca
  const handleSearch = useCallback((value) => {
    setSearchParam(value);
  }, []);

  // Handler para atualização do filtro
  const handleFilterChange = useCallback((newFilter) => {
    setStatusFilter(newFilter);
    setFilterAnchor(null);
  }, []);

  // Handlers para operações CRUD
  const handleSaveCompany = useCallback(async () => {
    // Recarregar a lista completa quando uma empresa é criada ou atualizada
    setRecords([]);
    setHasMore(true);
    setPage(1);
    
    // Pequeno timeout para garantir que o estado foi atualizado
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
      
      // Atualizar apenas o registro modificado na lista
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
      
      // Remover o registro excluído da lista
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

  return (
    <MainContainer>
      <MainHeader>
        <HeaderButtons 
          isMobile={isMobile}
          onSearch={handleSearch}
          onFilterClick={(e) => setFilterAnchor(e.currentTarget)}
          onExportClick={(e) => setAnchorExport(e.currentTarget)}
          onNewCompany={() => {
            setSelectedCompany(null);
            setShowCompanyModal(true);
          }}
        />
      </MainHeader>

      {/* Tabela customizada com scroll infinito */}
      <CustomTable
        data={records}
        loading={loading}
        error={error}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onEdit={(company) => {
          setSelectedCompany(company);
          setShowCompanyModal(true);
        }}
        onBlock={(company) => {
          setSelectedCompany(company);
          setBlockAction(company.status ? 'block' : 'unblock');
          setShowConfirmBlock(true);
        }}
        onDelete={(company) => {
          setSelectedCompany(company);
          setShowConfirmDelete(true);
        }}
        onDetails={(company) => {
          setSelectedCompany(company);
          setShowDetailsModal(true);
        }}
        onUsers={(company) => {
          setSelectedCompany(company);
          setShowUsersModal(true);
        }}
        onInvoices={(company) => {
          setSelectedCompany(company);
          setShowInvoicesModal(true);
        }}
        onSchedule={(company) => {
          setSelectedCompany(company);
          setScheduleModalOpen(true);
        }}
        schedulesEnabled={schedulesEnabled}
      />

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
      <FilterMenu
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        currentFilter={statusFilter}
        onFilterChange={handleFilterChange}
      />

      <ExportMenu
        anchorEl={anchorExport}
        onClose={() => setAnchorExport(null)}
        onExport={handleExport}
      />
    </MainContainer>
  );
};

export default memo(Companies);