import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Upload as UploadIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

// Standard Components
import StandardPageLayout from '../../../components/shared/StandardPageLayout';
import StandardDataTable from '../../../components/shared/StandardDataTable';

// Utils
import { debounce } from '../../../utils/helpers';
import { toast } from '../../../helpers/toast';

// Styled Components seguindo padrão Standard
const SummaryContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.breakpoints.down('sm') ? 12 : 8,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.12)',
  }
}));

const SummaryValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  }
}));

const EmployerList = ({
  employers = [],
  loading = false,
  loadingMore = false,
  statistics = {},
  searchParam = '',
  onSearch,
  onRefresh,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  uploading = false,
  hasMore = true,
  onLoadMore,
  selectedEmployers = [],
  onSelectionChange,
  totalCount = 0
}) => {
  const theme = useTheme();
  const observerRef = useRef();
  const lastEmployerElementRef = useRef();

  // Debounced search handler
  const handleSearchDebounced = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 500),
    [onSearch]
  );

  const handleSearchChange = useCallback((event) => {
    const value = event?.target?.value || '';
    handleSearchDebounced(value);
  }, [handleSearchDebounced]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          onLoadMore?.();
        }
      },
      { threshold: 1.0 }
    );

    if (lastEmployerElementRef.current) {
      observerRef.current.observe(lastEmployerElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [employers, hasMore, loading, loadingMore, onLoadMore]);

  // Normalizar dados do employer
  const normalizeEmployerData = (employer) => {
    if (!employer || typeof employer !== 'object') {
      return {
        id: '',
        name: 'N/A',
        positionsCount: 0,
        createdAt: null,
        isActive: true
      };
    }

    return {
      id: employer.id || '',
      name: employer.name || 'N/A',
      positionsCount: employer.positionsCount || 0,
      createdAt: employer.createdAt || null,
      isActive: employer.isActive !== false,
      ...employer
    };
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      id: 'name',
      field: 'name',
      label: 'Empresa',
      minWidth: 200,
      render: (employer) => {
        const normalizedEmployer = normalizeEmployerData(employer);
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon color="primary" sx={{ fontSize: '1.25rem' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {normalizedEmployer.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ID: {normalizedEmployer.id}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'positions',
      field: 'positionsCount',
      label: 'Cargos',
      width: 120,
      align: 'center',
      render: (employer) => {
        const normalizedEmployer = normalizeEmployerData(employer);
        
        return (
          <Chip 
            label={`${normalizedEmployer.positionsCount} ${normalizedEmployer.positionsCount === 1 ? 'cargo' : 'cargos'}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 500,
              minWidth: 80
            }}
          />
        );
      }
    },
    {
      id: 'createdAt',
      field: 'createdAt',
      label: 'Criada em',
      width: 130,
      align: 'center',
      render: (employer) => {
        const normalizedEmployer = normalizeEmployerData(employer);
        
        if (!normalizedEmployer.createdAt) {
          return (
            <Typography variant="body2" color="textSecondary">
              -
            </Typography>
          );
        }

        try {
          return (
            <Typography variant="body2">
              {format(new Date(normalizedEmployer.createdAt), 'dd/MM/yyyy')}
            </Typography>
          );
        } catch (error) {
          return (
            <Typography variant="body2" color="error">
              Data inválida
            </Typography>
          );
        }
      }
    },
    {
      id: 'status',
      field: 'isActive',
      label: 'Status',
      width: 100,
      align: 'center',
      render: (employer) => {
        const normalizedEmployer = normalizeEmployerData(employer);
        
        return (
          <Chip
            label={normalizedEmployer.isActive ? "Ativo" : "Inativo"}
            color={normalizedEmployer.isActive ? "success" : "default"}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 500,
              minWidth: 70
            }}
          />
        );
      }
    }
  ];

  // Ações da tabela
  const getTableActions = useCallback((employer) => {
    const actions = [];

    actions.push({
      label: "Editar",
      icon: <EditIcon />,
      onClick: () => onEdit(normalizeEmployerData(employer)),
      color: "primary"
    });

    actions.push({
      label: "Excluir",
      icon: <DeleteIcon />,
      onClick: () => onDelete(normalizeEmployerData(employer)),
      color: "error"
    });

    return actions;
  }, [onEdit, onDelete]);

  // Ações do header
  const pageActions = [
    {
      label: "Adicionar",
      icon: <AddIcon />,
      onClick: onAdd,
      variant: "contained",
      color: "primary",
      primary: true
    },
    {
      label: uploading ? "Importando..." : "Importar",
      icon: uploading ? <CircularProgress size={20} /> : <UploadIcon />,
      onClick: onImport,
      variant: "outlined",
      disabled: uploading
    },
    {
      label: "Atualizar",
      icon: <RefreshIcon />,
      onClick: onRefresh,
      variant: "outlined",
      tooltip: "Atualizar lista de empresas"
    }
  ];

  // Counter formatado
  const formattedCounter = () => {
    const selectedCount = Array.isArray(selectedEmployers) ? selectedEmployers.length : 0;
    const baseText = `${employers.length} de ${totalCount} empresas`;
    return selectedCount > 0 
      ? `${baseText} (${selectedCount} selecionadas)`
      : baseText;
  };

  // Renderizar empresas com infinite scroll
  const renderEmployers = () => {
    const employersWithRef = employers.map((employer, index) => {
      const isLast = index === employers.length - 1;
      return {
        ...normalizeEmployerData(employer),
        ref: isLast ? lastEmployerElementRef : null
      };
    });

    return employersWithRef;
  };

  // Componente de resumo/estatísticas
  const SummarySection = () => (
    <SummaryContainer>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Total de Empresas
              </Typography>
              <SummaryValue>
                {statistics?.total || totalCount || 0}
              </SummaryValue>
            </CardContent>
          </SummaryCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Empresas Ativas
              </Typography>
              <SummaryValue color="success.main">
                {statistics?.active || 0}
              </SummaryValue>
            </CardContent>
          </SummaryCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Adicionadas Recentemente
              </Typography>
              <SummaryValue color="info.main">
                {statistics?.recentlyAdded || 0}
              </SummaryValue>
            </CardContent>
          </SummaryCard>
        </Grid>
      </Grid>
    </SummaryContainer>
  );

  return (
    <StandardPageLayout
      title="Empresas"
      subtitle={formattedCounter()}
      searchValue={searchParam}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Buscar empresas..."
      showSearch={true}
      actions={pageActions}
      loading={loading}
    >
      {/* Seção de resumo/estatísticas */}
      <SummarySection />

      {/* Tabela de empresas */}
      <StandardDataTable
        data={renderEmployers()}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedItems={selectedEmployers}
        onSelectionChange={onSelectionChange}
        actions={getTableActions}
        stickyHeader={true}
        size="small"
        hover={true}
        maxVisibleActions={2}
        emptyIcon={<BusinessIcon />}
        emptyTitle="Nenhuma empresa encontrada"
        emptyDescription="Não há empresas cadastradas para os filtros selecionados."
        emptyActionLabel="Adicionar Empresa"
        onEmptyActionClick={onAdd}
        containerProps={{
          sx: {
            height: '100%',
            maxHeight: 'calc(100vh - 450px)',
            overflow: 'auto'
          }
        }}
        customRowRenderer={(item, index, columns) => {
          const isLast = index === employers.length - 1;
          return (
            <>
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.id || colIndex}
                  align={column.align || 'left'}
                  ref={isLast && colIndex === 0 ? lastEmployerElementRef : null}
                >
                  {column.render 
                    ? column.render(item, index)
                    : item[column.field] || '-'
                  }
                </TableCell>
              ))}
            </>
          );
        }}
      />
      
      {/* Loading indicator para infinite scroll */}
      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
            Carregando mais empresas...
          </Typography>
        </Box>
      )}
    </StandardPageLayout>
  );
};

EmployerList.propTypes = {
  // Dados
  employers: PropTypes.array,
  loading: PropTypes.bool,
  loadingMore: PropTypes.bool,
  statistics: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    recentlyAdded: PropTypes.number
  }),
  searchParam: PropTypes.string,
  totalCount: PropTypes.number,
  
  // Scroll infinito
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  
  // Seleção
  selectedEmployers: PropTypes.array,
  onSelectionChange: PropTypes.func,
  
  // Callbacks
  onSearch: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  
  // Estados
  uploading: PropTypes.bool
};

EmployerList.defaultProps = {
  employers: [],
  loading: false,
  loadingMore: false,
  statistics: {},
  searchParam: '',
  totalCount: 0,
  hasMore: true,
  selectedEmployers: [],
  uploading: false
};

export default EmployerList;