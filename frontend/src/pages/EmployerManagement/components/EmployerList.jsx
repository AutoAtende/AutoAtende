import React from 'react';
import { debounce } from '../../../utils/helpers';
import { toast } from '../../../helpers/toast';
import { 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  Typography,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  TextField
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
  },
  searchContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  searchField: {
    width: '300px',
  },
  tableSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '400px', // Altura mínima para garantir espaço para a tabela
  },
  tableContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Importante para controlar o overflow
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
    minHeight: 0, // Importante para o scroll funcionar
    '& .MuiTable-root': {
      minWidth: 650, // Largura mínima da tabela
    }
  },
  table: {
    '& td': {
      padding: theme.spacing(1),
    }
  },
  actionButtons: {
    '& > button': {
      margin: theme.spacing(0, 0.5),
    }
  },
  summaryCard: {
    marginBottom: theme.spacing(2),
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  headerActions: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },
  refreshButton: {
    marginLeft: 'auto',
  },
}));

const EmployerList = ({
  employers,
  loading,
  statistics,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onRefresh,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  uploading
}) => {
  const classes = useStyles();

  const handleSearchDebounced = debounce((value) => {
    onSearch(value);
  }, 500);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div className={classes.headerActions}>
          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={24} /> : <UploadIcon />}
            disabled={uploading}
          >
            Importar Empresas
            <input type="file" hidden accept=".csv,.xls,.xlsx" onChange={onImport} />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onAdd}
            startIcon={<AddIcon />}
          >
            Adicionar Empresa
          </Button>
          <TextField
            className={classes.searchField}
            placeholder="Buscar empresas..."
            variant="outlined"
            size="small"
            onChange={(e) => handleSearchDebounced(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
            sx={{ ml: 2, width: '300px' }}
          />
          <Tooltip title="Atualizar lista">
            <IconButton onClick={onRefresh} className={classes.refreshButton}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Box>

      <Grid container spacing={2} className={classes.summaryCard}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Empresas
              </Typography>
              <Typography variant="h4" className={classes.summaryValue}>
                {statistics?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Empresas Ativas
              </Typography>
              <Typography variant="h4" className={classes.summaryValue}>
                {statistics?.active || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Adicionadas Recentemente
              </Typography>
              <Typography variant="h4" className={classes.summaryValue}>
                {statistics?.recentlyAdded || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper className={classes.mainPaper}>
      <div className={classes.tableSection}>
          <div className={classes.tableContainer}>
            <div className={classes.tableWrapper}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : employers.length > 0 ? (
                <Table 
                  className={classes.table} 
                  stickyHeader 
                  size="small"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Cargos</TableCell>
                      <TableCell>Criada em</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employers.map((employer) => (
                      <TableRow key={employer.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <BusinessIcon color="action" sx={{ mr: 1 }} />
                            {employer.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${employer.positionsCount} cargos`}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {employer.createdAt ? format(new Date(employer.createdAt), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employer.isActive ? "Ativo" : "Inativo"}
                            color={employer.isActive ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right" className={classes.actionButtons}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(employer)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(employer)}
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
              ) : (
                <Box p={4} textAlign="center">
                  <Typography color="textSecondary">
                    Nenhuma empresa encontrada
                  </Typography>
                </Box>
              )}
            </div>
          </div>
        </div>
      </Paper>
    </>
  );
};

export default EmployerList;