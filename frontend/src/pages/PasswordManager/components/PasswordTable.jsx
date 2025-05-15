import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  LinearProgress,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  LockOutlined as LockIcon,
  LinkOff as NoLinkIcon
} from '@mui/icons-material';
import { toast } from '../../../helpers/toast';

// Componente para ações em linha
const ActionButton = ({ icon, title, onClick, color, isMobile }) => {
  return isMobile ? (
    <IconButton size="small" onClick={onClick} color={color}>
      {icon}
    </IconButton>
  ) : (
    <Button
      startIcon={icon}
      onClick={onClick}
      size="small"
      color={color}
      sx={{ mr: 1 }}
    >
      {title}
    </Button>
  );
};

// Componente para mostrar quando não há dados
const NoDataDisplay = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        width: '100%',
        padding: 3
      }}
    >
      <LockIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Nenhuma senha encontrada
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        Não existem senhas cadastradas para os filtros selecionados.
        <br />
        Adicione uma nova senha ou modifique os filtros.
      </Typography>
    </Box>
  );
};

// Componente para linha de esqueleto (loading)
const SkeletonRow = () => {
  return (
    <TableRow>
      <TableCell><Skeleton variant="text" width="80%" /></TableCell>
      <TableCell><Skeleton variant="text" width="70%" /></TableCell>
      <TableCell><Skeleton variant="text" width="90%" /></TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="circular" width={24} height={24} sx={{ ml: 1 }}/>
          <Skeleton variant="circular" width={24} height={24} sx={{ ml: 1 }}/>
        </Box>
      </TableCell>
      <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mx: 1 }}/>
          <Skeleton variant="circular" width={40} height={40} sx={{ mx: 1 }}/>
        </Box>
      </TableCell>
    </TableRow>
  );
};

const PasswordTable = ({
  passwords,
  loading,
  onEdit,
  onDelete,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  currentPage = 0,
  rowsPerPage = 10
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleCopyPassword = async (password) => {
    if (!password) {
      toast.error('Senha não disponível');
      return;
    }
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Senha copiada!');
    } catch (error) {
      toast.error('Erro ao copiar senha');
    }
  };

  const togglePasswordVisibility = (id) => {
    if (!id) return;
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleChangePage = (event, newPage) => {
    if (typeof onPageChange === 'function') {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (typeof onRowsPerPageChange === 'function') {
      onRowsPerPageChange(newRowsPerPage);
    }
  };

  // Verificar se a lista está vazia (sem considerar carregamento)
  const isEmpty = !loading && (!passwords || passwords.length === 0);
  const total = totalCount || passwords.length;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      {loading && (
        <LinearProgress sx={{ height: 2 }} />
      )}
      
      <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)', minHeight: '400px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  fontWeight: 'bold'
                }}
              >
                Empresa
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  fontWeight: 'bold'
                }}
              >
                Aplicação
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  fontWeight: 'bold'
                }}
              >
                URL
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  fontWeight: 'bold'
                }}
              >
                Senha
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  fontWeight: 'bold'
                }}
              >
                Tag
              </TableCell>
              <TableCell 
                align="center"
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  fontWeight: 'bold'
                }}
              >
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                  <NoDataDisplay />
                </TableCell>
              </TableRow>
            ) : loading ? (
              Array(5).fill(0).map((_, index) => (
                <SkeletonRow key={`skeleton-${index}`} />
              ))
            ) : (
              passwords.map((password) => {
                  // Verifica se os dados são seguros
                  if (!password || !password.id) return null;
                  
                  const employerName = password.employer?.name || 'N/A';
                  const application = password.application || 'N/A';
                  const url = password.url || '';
                  const tagName = password.tag?.name || ''; // Alterado para usar o nome da tag
                  const passwordValue = password.password || '';
                  
                  return (
                    <TableRow 
                      key={password.id}
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" noWrap title={employerName}>
                          {employerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap title={application}>
                          {application}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {url ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title={url}>
                              <Typography 
                                component="a" 
                                href={url} 
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body2"
                                color="primary"
                                sx={{ 
                                  textDecoration: 'none',
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }}
                              >
                                {url}
                              </Typography>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                            <NoLinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Não disponível</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            fontFamily="monospace"
                            sx={{
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(0, 0, 0, 0.04)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              width: '100px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {visiblePasswords[password.id] ? passwordValue : '••••••••'}
                          </Typography>
                          <Tooltip title={visiblePasswords[password.id] ? "Ocultar" : "Mostrar"}>
                            <IconButton
                              size="small"
                              onClick={() => togglePasswordVisibility(password.id)}
                            >
                              {visiblePasswords[password.id] ? <HideIcon fontSize="small" /> : <ViewIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copiar">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyPassword(passwordValue)}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {password.tagInfo ? (
                          <Chip 
                            label={password.tagInfo.name} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%'
                        }}>
                          <ActionButton
                            icon={<EditIcon />}
                            title="Editar"
                            onClick={() => onEdit(password)}
                            color="primary"
                            isMobile={isMobile}
                          />
                          <ActionButton
                            icon={<DeleteIcon />}
                            title="Excluir"
                            onClick={() => onDelete(password)}
                            color="error"
                            isMobile={isMobile}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {!isEmpty && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Paper>
  );
};

PasswordTable.propTypes = {
  passwords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      application: PropTypes.string,
      url: PropTypes.string,
      password: PropTypes.string,
      tag: PropTypes.shape({  // Atualizado para incluir informações completas da tag
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string
      }),
      employer: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string
      })
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  currentPage: PropTypes.number,
  rowsPerPage: PropTypes.number
};

PasswordTable.defaultProps = {
  passwords: [],
  loading: false,
  totalCount: 0,
  currentPage: 0,
  rowsPerPage: 10
};

export default PasswordTable;