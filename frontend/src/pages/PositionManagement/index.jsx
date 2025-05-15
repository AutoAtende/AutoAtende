import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Button, TextField, CircularProgress, Box,
  Typography, Chip, Tooltip, Card, CardContent, Grid,
  TablePagination, Autocomplete, List, ListItem, ListItemText,
  ListItemIcon, Switch, FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  CleaningServices as CleaningIcon
} from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import MainContainer from '../../components/MainContainer';
import Title from '../../components/Title';
import BaseModal from '../../components/shared/BaseModal';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

// Componentes estilizados para partes comuns
const StyledPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 250px)',
  overflow: 'hidden'
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const TableContainer = styled(Box)({
  flex: 1,
  overflow: 'auto',
  position: 'relative',
});

const PaginationContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 2,
  borderTop: `1px solid ${theme.palette.divider}`
}));

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

  return (
    <MainContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Title>Gerenciamento de Cargos</Title>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleCleanupDuplicates}
            startIcon={cleaningDuplicates ? <CircularProgress size={20} /> : <CleaningIcon />}
            disabled={cleaningDuplicates}
          >
            Limpar Duplicados
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setModalType('create');
              setFormData({
                name: '',
                assignToAll: false,
                selectedEmployers: []
              });
            }}
            startIcon={<AddIcon />}
          >
            Adicionar Cargo
          </Button>
        </Box>
      </Box>

      {/* Cards de estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Cargos
              </Typography>
              <Typography variant="h4" color="primary">
                {statistics.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cargos Ativos
              </Typography>
              <Typography variant="h4" color="primary">
                {statistics.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Adicionados Recentemente
              </Typography>
              <Typography variant="h4" color="primary">
                {statistics.recentlyAdded}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela principal */}
      <StyledPaper>
        <SearchContainer>
          <TextField
            sx={{ width: '300px' }}
            placeholder="Buscar cargos..."
            variant="outlined"
            size="small"
            onChange={(e) => handleSearchDebounced(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
          <Tooltip title="Filtrar">
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </SearchContainer>

        <TableContainer>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : positions.length > 0 ? (
            <>
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
                  {positions.map((position) => (
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
              <PaginationContainer>
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
              </PaginationContainer>
            </>
          ) : (
            <EmptyState
              type="positions"
              onCreateNew={() => {
                setModalType('create');
                setFormData({
                  name: '',
                  assignToAll: false,
                  selectedEmployers: []
                });
              }}
              message="Não encontramos nenhum cargo cadastrado. Que tal começar criando um novo?"
              buttonText="Adicionar Cargo"
            />
          )}
        </TableContainer>
      </StyledPaper>

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
    </MainContainer>
  );
};

export default PositionManagement;