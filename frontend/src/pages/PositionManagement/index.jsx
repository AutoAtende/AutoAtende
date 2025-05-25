import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Button, TextField, CircularProgress, Box,
  Typography, Chip, Tooltip, Card, CardContent, Grid,
  TablePagination, Autocomplete, List, ListItem, ListItemText,
  ListItemIcon, Switch, FormControlLabel, TableContainer
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  CleaningServices as CleaningIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import StandardPageLayout from '../../components/StandardPageLayout';
import BaseModal from '../../components/shared/BaseModal';
import api from '../../services/api';

const PositionManagement = () => {
  // Estados mantidos da implementação original
  const [positions, setPositions] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    recentlyAdded: 0
  });
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    assignToAll: false,
    selectedEmployers: []
  });
  const [deleteFromAll, setDeleteFromAll] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Funções auxiliares mantidas
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const resetModalState = () => {
    setModalType(null);
    setSelectedPosition(null);
    setFormData({
      name: '',
      assignToAll: false,
      selectedEmployers: []
    });
    setDeleteFromAll(false);
  };

  // Funções de API mantidas
  const fetchStatistics = useCallback(async () => {
    try {
      const { data } = await api.get('/positions/statistics');
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setStatistics({
        total: 0,
        active: 0,
        recentlyAdded: 0
      });
    }
  }, []);

  const fetchEmployers = useCallback(async () => {
    try {
      const { data } = await api.get('/employers');
      setEmployers(data.employers || []);
    } catch (err) {
      console.error('Error fetching employers:', err);
      toast.error('Erro ao carregar empresas');
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/positions/simplified', {
        params: { 
          searchParam: searchTerm,
          page: page + 1,
          limit: rowsPerPage,
          orderBy: 'name',
          order: 'asc'
        }
      });
      
      setPositions(data.positions || []);
      setTotalCount(data.count || 0);
      await fetchStatistics();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados');
      setPositions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, rowsPerPage, fetchStatistics]);

  // Effects mantidos
  useEffect(() => {
    fetchPositions();
    fetchEmployers();
  }, [fetchPositions, fetchEmployers]);

  // Handlers mantidos
  const handleSearchDebounced = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(0);
    }, 500),
    []
  );

  const handleSearch = (event) => {
    handleSearchDebounced(event.target.value);
  };

  const handleCleanupDuplicates = async () => {
    try {
      setCleaningDuplicates(true);
      const { data } = await api.post('/positions/cleanup-duplicates');
      toast.success(data.message);
      await fetchPositions();
    } catch (error) {
      console.error('Erro ao limpar duplicados:', error);
      toast.error('Erro ao limpar cargos duplicados');
    } finally {
      setCleaningDuplicates(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const payload = {
        name: formData.name.trim(),
        employerIds: formData.selectedEmployers.map(emp => emp.id),
        assignToAll: formData.assignToAll
      };

      if (selectedPosition?.id) {
        await api.put(`/positions/${selectedPosition.id}`, payload);
        toast.success('Cargo atualizado com sucesso');
      } else {
        await api.post('/positions', payload);
        toast.success('Cargo criado com sucesso');
      }

      resetModalState();
      await fetchPositions();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMsg = err.response?.data?.error || 'Erro ao salvar cargo';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/positions/${selectedPosition.id}`, {
        data: { deleteFromAll }
      });
      
      toast.success('Cargo excluído com sucesso');
      await fetchPositions();
      resetModalState();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      toast.error(err.response?.data?.error || 'Erro ao excluir cargo');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar posições baseado na aba ativa
  const getFilteredPositions = () => {
    switch (activeTab) {
      case 1: // Ativos
        return positions.filter(position => position.active);
      case 2: // Inativos
        return positions.filter(position => !position.active);
      default: // Todos
        return positions;
    }
  };

  const filteredPositions = getFilteredPositions();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: "Limpar Duplicados",
      icon: cleaningDuplicates ? <CircularProgress size={20} /> : <CleaningIcon />,
      onClick: handleCleanupDuplicates,
      variant: "outlined",
      color: "warning",
      disabled: cleaningDuplicates,
      tooltip: "Remover cargos duplicados"
    },
    {
      label: "Adicionar Cargo",
      icon: <AddIcon />,
      onClick: () => {
        setModalType('create');
        setFormData({
          name: '',
          assignToAll: false,
          selectedEmployers: []
        });
      },
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar novo cargo"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todos (${positions.length})`,
      icon: <WorkIcon />
    },
    {
      label: `Ativos (${positions.filter(p => p.active).length})`,
      icon: <ActiveIcon />
    },
    {
      label: `Inativos (${positions.filter(p => !p.active).length})`,
      icon: <InactiveIcon />
    },
    {
      label: "Estatísticas",
      icon: <StatsIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Configuração dos modais usando BaseModal
  const modalConfig = {
    details: {
      title: `Detalhes do Cargo: ${selectedPosition?.name}`,
      content: (
        <List>
          {selectedPosition?.employers?.map((employer) => (
            <ListItem key={employer.id}>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary={employer.name} />
            </ListItem>
          ))}
        </List>
      ),
      actions: [
        {
          label: 'Fechar',
          onClick: resetModalState,
          variant: 'text'
        }
      ]
    },
    create: {
      title: 'Novo Cargo',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            autoFocus
            label="Nome do Cargo"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({
              ...formData,
              name: e.target.value
            })}
            variant="outlined"
            error={!formData.name.trim()}
            helperText={!formData.name.trim() && 'Nome é obrigatório'}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.assignToAll}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    assignToAll: e.target.checked,
                    selectedEmployers: []
                  });
                }}
              />
            }
            label="Atribuir a todas as empresas"
            sx={{ mb: 2, display: 'block' }}
          />

          {!formData.assignToAll && (
            <Autocomplete
              multiple
              options={employers}
              getOptionLabel={(option) => option.name}
              value={formData.selectedEmployers}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  selectedEmployers: newValue
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Empresas"
                  placeholder="Selecione as empresas"
                />
              )}
            />
          )}
        </Box>
      ),
      actions: [
        {
          label: 'Cancelar',
          onClick: resetModalState,
          variant: 'text'
        },
        {
          label: loading ? 'Criando...' : 'Criar',
          onClick: handleSave,
          variant: 'contained',
          color: 'primary',
          disabled: !formData.name.trim() || 
                   (!formData.assignToAll && formData.selectedEmployers.length === 0) || 
                   loading
        }
      ]
    },
    edit: {
      title: 'Editar Cargo',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            autoFocus
            label="Nome do Cargo"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({
              ...formData,
              name: e.target.value
            })}
            variant="outlined"
            error={!formData.name.trim()}
            helperText={!formData.name.trim() && 'Nome é obrigatório'}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.assignToAll}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    assignToAll: e.target.checked,
                    selectedEmployers: []
                  });
                }}
              />
            }
            label="Atribuir a todas as empresas"
            sx={{ mb: 2, display: 'block' }}
          />

          {!formData.assignToAll && (
            <Autocomplete
              multiple
              options={employers}
              getOptionLabel={(option) => option.name}
              value={formData.selectedEmployers}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  selectedEmployers: newValue
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Empresas"
                  placeholder="Selecione as empresas"
                />
              )}
            />
          )}
        </Box>
      ),
      actions: [
        {
          label: 'Cancelar',
          onClick: resetModalState,
          variant: 'text'
        },
        {
          label: loading ? 'Atualizando...' : 'Atualizar',
          onClick: handleSave,
          variant: 'contained',
          color: 'primary',
          disabled: !formData.name.trim() || 
                   (!formData.assignToAll && formData.selectedEmployers.length === 0) || 
                   loading
        }
      ]
    },
    delete: {
      title: 'Confirmar Exclusão',
      content: (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Tem certeza que deseja excluir o cargo "{selectedPosition?.name}"?
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={deleteFromAll}
                onChange={(e) => setDeleteFromAll(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" color="textSecondary">
                Excluir este cargo de todas as empresas
              </Typography>
            }
          />
          
          {deleteFromAll && (
            <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
              Atenção: Esta ação excluirá o cargo de todas as empresas que o possuem!
            </Typography>
          )}
        </Box>
      ),
      actions: [
        {
          label: 'Cancelar',
          onClick: resetModalState,
          variant: 'text',
          disabled: loading
        },
        {
          label: loading ? 'Excluindo...' : 'Confirmar Exclusão',
          onClick: handleDelete,
          variant: 'contained',
          color: 'error',
          icon: <DeleteIcon />,
          disabled: loading
        }
      ]
    }
  };

  // Renderizar conteúdo da aba ativa
  const renderTabContent = () => {
    if (activeTab === 3) {
      // Aba de Estatísticas
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total de Cargos
                </Typography>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                  {statistics.total}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Cargos cadastrados no sistema
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Cargos Ativos
                </Typography>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {statistics.active}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Cargos em uso nas empresas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Adicionados Recentemente
                </Typography>
                <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {statistics.recentlyAdded}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Últimos 30 dias
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    // Conteúdo da tabela para outras abas
    if (filteredPositions.length === 0 && !loading) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          sx={{ height: '100%', p: 4 }}
        >
          <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {activeTab === 0 
              ? "Nenhum cargo encontrado" 
              : activeTab === 1 
                ? "Nenhum cargo ativo"
                : "Nenhum cargo inativo"
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {activeTab === 0 
              ? "Não encontramos nenhum cargo cadastrado. Que tal começar criando um novo?"
              : "Não há cargos nesta categoria no momento."
            }
          </Typography>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setModalType('create');
                setFormData({
                  name: '',
                  assignToAll: false,
                  selectedEmployers: []
                });
              }}
            >
              Adicionar Cargo
            </Button>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Empresas</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPositions.map((position) => (
                  <TableRow 
                    key={position.id} 
                    hover 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => {
                      setSelectedPosition(position);
                      setModalType('details');
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <WorkIcon color="action" sx={{ mr: 1 }} />
                        {position.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<BusinessIcon />}
                        label={`${position.employerCount} ${
                          position.employerCount === 1 ? 'empresa' : 'empresas'
                        }`}
                        size="small"
                        color={position.employerCount > 0 ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={position.active ? 'Ativo' : 'Inativo'}
                        color={position.active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPosition(position);
                            setFormData({
                              name: position.name,
                              assignToAll: false,
                              selectedEmployers: position.employers || []
                            });
                            setModalType('edit');
                          }}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPosition(position);
                            setModalType('delete');
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Paginação */}
        {activeTab !== 3 && totalCount > 0 && (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              labelRowsPerPage="Registros por página"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <StandardPageLayout
        title="Gerenciamento de Cargos"
        actions={pageActions}
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Buscar cargos..."
        showSearch={activeTab !== 3} // Não mostrar pesquisa na aba de estatísticas
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading}
      >
        {renderTabContent()}
      </StandardPageLayout>

      {/* Renderização dos modais usando BaseModal */}
      {modalType && (
        <BaseModal
          open={true}
          onClose={resetModalState}
          title={modalConfig[modalType].title}
          actions={modalConfig[modalType].actions}
          maxWidth="sm"
          loading={loading}
        >
          {modalConfig[modalType].content}
        </BaseModal>
      )}
    </>
  );
};

export default PositionManagement;