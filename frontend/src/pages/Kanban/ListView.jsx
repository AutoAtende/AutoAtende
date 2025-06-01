import React, { useState } from 'react';
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Checkbox,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from "../../helpers/toast";
import useAuth from "../../hooks/useAuth";
import StandardModal from "../../components/shared/StandardModal";
import CardForm from './components/CardForm';
import CardDetailsModal from './components/CardDetailsModal';
import CardAssigneeAvatar from './components/CardAssigneeAvatar';

const ListView = ({
  board,
  lanes = [],
  cards = [],
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  companyId
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [showDeleteCard, setShowDeleteCard] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    lane: '',
    assignee: '',
    showBlocked: false
  });

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (event) => {
    if (!event || !event.target) return;
    
    const { name, value, checked } = event.target;
    setFilter(prevFilter => ({
      ...prevFilter,
      [name]: name === 'showBlocked' ? checked : value
    }));
    setPage(0);
  };

  const handleCardClick = (card) => {
    if (!card) return;
    setSelectedCard(card);
    setShowCardDetails(true);
  };

  const handleAddCard = () => {
    const defaultLaneId = lanes && lanes.length > 0 ? lanes[0].id : null;
    
    if (!defaultLaneId) {
      toast.error("Primeiro adicione uma coluna ao quadro");
      return;
    }
    
    setShowAddCard(true);
  };

  const handleAddCardSubmit = async (cardData) => {
    try {
      setIsLoading(true);
      await onCardCreate(cardData);
      toast.success('Cartão criado com sucesso!');
      setShowAddCard(false);
    } catch (err) {
      console.error("Erro ao criar cartão:", err);
      toast.error(err.message || 'Erro ao criar cartão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCardClose = () => {
    setShowAddCard(false);
  };

  const handleEditCard = (card) => {
    setCardToEdit(card);
    setShowEditCard(true);
  };

  const handleEditCardSubmit = async (cardData) => {
    try {
      setIsLoading(true);
      await onCardUpdate(cardToEdit.id, cardData);
      toast.success('Cartão atualizado com sucesso!');
      setShowEditCard(false);
      setCardToEdit(null);
    } catch (err) {
      console.error("Erro ao atualizar cartão:", err);
      toast.error(err.message || 'Erro ao atualizar cartão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCardClose = () => {
    setShowEditCard(false);
    setCardToEdit(null);
  };

  const handleDeleteCard = (card) => {
    setCardToDelete(card);
    setShowDeleteCard(true);
  };

  const handleDeleteCardConfirm = async () => {
    try {
      setIsLoading(true);
      await onCardDelete(cardToDelete.id);
      toast.success('Cartão excluído com sucesso!');
      setShowDeleteCard(false);
      setCardToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir cartão:", err);
      toast.error(err.message || 'Erro ao excluir cartão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCardClose = () => {
    setShowDeleteCard(false);
    setCardToDelete(null);
  };

  const handleCardDetailsClose = () => {
    setShowCardDetails(false);
    setSelectedCard(null);
  };

  const handleCardDetailsUpdate = async (cardId, cardData) => {
    try {
      setIsLoading(true);
      await onCardUpdate(cardId, cardData);
      toast.success('Cartão atualizado com sucesso!');
      setShowCardDetails(false);
      setSelectedCard(null);
    } catch (err) {
      console.error("Erro ao atualizar cartão:", err);
      toast.error(err.message || 'Erro ao atualizar cartão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardDetailsDelete = async (cardId) => {
    try {
      setIsLoading(true);
      await onCardDelete(cardId);
      toast.success('Cartão excluído com sucesso!');
      setShowCardDetails(false);
      setSelectedCard(null);
    } catch (err) {
      console.error("Erro ao excluir cartão:", err);
      toast.error(err.message || 'Erro ao excluir cartão');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificações para garantir que tudo é array e evitar erros
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeLanes = Array.isArray(lanes) ? lanes : [];
  
  // Filter cards
  const filteredCards = safeCards.filter(card => {
    if (!card) return false;
    
    const searchTerm = (filter.search || '').toLowerCase();
    
    const matchSearch = !searchTerm || 
      (card.title && card.title.toLowerCase().includes(searchTerm)) ||
      (card.description && card.description.toLowerCase().includes(searchTerm)) ||
      (card.contact && card.contact.name && card.contact.name.toLowerCase().includes(searchTerm)) ||
      (card.sku && card.sku.toLowerCase().includes(searchTerm));
    
    const matchLane = !filter.lane || card.laneId === parseInt(filter.lane);
    
    const matchAssignee = !filter.assignee || 
      (filter.assignee === 'unassigned' ? !card.assignedUserId : 
      card.assignedUserId === parseInt(filter.assignee));
    
    const matchBlocked = !filter.showBlocked || card.isBlocked;
    
    return matchSearch && matchLane && matchAssignee && matchBlocked;
  });

  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (!a || !b) return 0;
    
    let valueA, valueB;
    
    if (orderBy === 'title') {
      valueA = a.title || '';
      valueB = b.title || '';
    } else if (orderBy === 'lane') {
      const laneA = safeLanes.find(l => l && l.id === a.laneId);
      const laneB = safeLanes.find(l => l && l.id === b.laneId);
      valueA = laneA ? laneA.name : '';
      valueB = laneB ? laneB.name : '';
    } else if (orderBy === 'priority') {
      valueA = a.priority !== undefined ? a.priority : 0;
      valueB = b.priority !== undefined ? b.priority : 0;
    } else if (orderBy === 'dueDate') {
      valueA = a.dueDate ? new Date(a.dueDate) : null;
      valueB = b.dueDate ? new Date(b.dueDate) : null;
      
      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return order === 'asc' ? 1 : -1;
      if (valueB === null) return order === 'asc' ? -1 : 1;
    } else {
      valueA = a[orderBy];
      valueB = b[orderBy];
    }
    
    if (valueA === undefined || valueA === null) valueA = '';
    if (valueB === undefined || valueB === null) valueB = '';
    
    const result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    return order === 'asc' ? result : -result;
  });

  // Pagination
  const paginatedCards = sortedCards.slice(
    page * rowsPerPage,
    Math.min(page * rowsPerPage + rowsPerPage, sortedCards.length)
  );
  
  // Lista de usuários para o filtro
  const assignedUsers = safeCards
    .filter(card => card && card.assignedUser)
    .map(card => card.assignedUser)
    .filter((user, index, self) => 
      user && index === self.findIndex(u => u && u.id === user.id)
    );

  return (
    <Box sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="search"
              label="Buscar"
              value={filter.search || ''}
              onChange={handleFilterChange}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Coluna</InputLabel>
              <Select
                name="lane"
                value={filter.lane || ''}
                onChange={handleFilterChange}
                label="Coluna"
              >
                <MenuItem value="">Todas</MenuItem>
                {safeLanes.map((lane) => lane && (
                  <MenuItem key={lane.id} value={lane.id}>
                    {lane.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável</InputLabel>
              <Select
                name="assignee"
                value={filter.assignee || ''}
                onChange={handleFilterChange}
                label="Responsável"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="unassigned">Não Atribuído</MenuItem>
                {assignedUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                name="showBlocked"
                checked={!!filter.showBlocked}
                onChange={handleFilterChange}
              />
              <Typography>Apenas Bloqueados</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCard}
              >
                Novo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Título
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'lane'}
                  direction={orderBy === 'lane' ? order : 'asc'}
                  onClick={() => handleSort('lane')}
                >
                  Coluna
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'priority'}
                  direction={orderBy === 'priority' ? order : 'asc'}
                  onClick={() => handleSort('priority')}
                >
                  Prioridade
                </TableSortLabel>
              </TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'assignedUserId'}
                  direction={orderBy === 'assignedUserId' ? order : 'asc'}
                  onClick={() => handleSort('assignedUserId')}
                >
                  Responsável
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'dueDate'}
                  direction={orderBy === 'dueDate' ? order : 'asc'}
                  onClick={() => handleSort('dueDate')}
                >
                  Vencimento
                </TableSortLabel>
              </TableCell>
              <TableCell>Checklist</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Nenhum cartão encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCards.map((card) => {
                if (!card) return null;
                
                const lane = safeLanes.find(l => l && l.id === card.laneId);
                const checklistItems = card.checklistItems || [];
                const completedItems = checklistItems.filter(item => item && item.checked).length;
                const isPastDue = card.dueDate && new Date() > new Date(card.dueDate);
                
                return (
                  <TableRow 
                    key={card.id}
                    hover
                    onClick={() => handleCardClick(card)}
                    sx={{ 
                      cursor: 'pointer',
                      ...(card.isBlocked && {
                        bgcolor: alpha(theme.palette.error.light, 0.2),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.light, 0.3),
                        }
                      })
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {card.isBlocked && (
                          <Tooltip title={card.blockReason || "Bloqueado"}>
                            <BlockIcon sx={{ mr: 1, color: 'error.main' }} />
                          </Tooltip>
                        )}
                        <Typography
                          sx={{
                            fontWeight: card.priority > 0 ? 'bold' : 'normal',
                            color: card.priority > 0 ? 'error.main' : 'inherit',
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {card.title || "Sem título"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {lane && (
                        <Chip 
                          label={lane.name}
                          size="small"
                          style={{
                            backgroundColor: lane.color,
                            color: 'white'
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {(card.priority === 0 || card.priority === undefined) ? (
                        <Typography variant="body2">Normal</Typography>
                      ) : (
                        <Chip
                          label={card.priority === 1 ? "Alta" : "Urgente"}
                          size="small"
                          color={card.priority === 1 ? "warning" : "error"}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {card.contact && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={card.contact.profilePicUrl} 
                            alt={card.contact.name}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {card.contact.name}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {card.assignedUser ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CardAssigneeAvatar user={card.assignedUser} size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {card.assignedUser.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Não atribuído
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {card.dueDate ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon 
                            fontSize="small" 
                            color={isPastDue ? "error" : "action"} 
                            sx={{ mr: 0.5 }}
                          />
                          <Typography 
                            variant="body2"
                            color={isPastDue ? "error" : "textPrimary"}
                          >
                            {format(new Date(card.dueDate), 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {checklistItems.length > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon 
                            fontSize="small" 
                            color={completedItems === checklistItems.length ? "success" : "action"} 
                            sx={{ mr: 0.5 }}
                          />
                          <Typography variant="body2">
                            {completedItems}/{checklistItems.length}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {card.tags && Array.isArray(card.tags) && card.tags.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {card.tags.map((tag) => (
                            tag && (
                              <Chip
                                key={tag.id}
                                label={tag.name}
                                size="small"
                                style={{
                                  backgroundColor: tag.color || undefined,
                                  color: tag.color ? '#fff' : undefined
                                }}
                              />
                            )
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCard(card);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={filteredCards.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
      
      {/* Modal para Adicionar Cartão */}
      <StandardModal
        open={showAddCard}
        onClose={handleAddCardClose}
        title="Adicionar Cartão"
        maxWidth="md"
        size="large"
      >
        <CardForm
          card={{ 
            laneId: lanes && lanes.length > 0 ? lanes[0].id : null
          }}
          onSubmit={handleAddCardSubmit}
          loading={isLoading}
          companyId={companyId}
        />
      </StandardModal>

      {/* Modal para Editar Cartão */}
      <StandardModal
        open={showEditCard}
        onClose={handleEditCardClose}
        title="Editar Cartão"
        maxWidth="md"
        size="large"
      >
        {cardToEdit && (
          <CardForm
            card={cardToEdit}
            onSubmit={handleEditCardSubmit}
            loading={isLoading}
            companyId={companyId}
          />
        )}
      </StandardModal>

      {/* Modal para Excluir Cartão */}
      <StandardModal
        open={showDeleteCard}
        onClose={handleDeleteCardClose}
        title="Excluir Cartão"
        maxWidth="sm"
        size="small"
        primaryAction={{
          label: isLoading ? 'Excluindo...' : 'Excluir',
          onClick: handleDeleteCardConfirm,
          disabled: isLoading,
          color: 'error',
          icon: isLoading ? <CircularProgress size={16} /> : <DeleteIcon />
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleDeleteCardClose,
          disabled: isLoading
        }}
      >
        <Typography>
          {cardToDelete && (
            <>
              Tem certeza que deseja excluir o cartão "{cardToDelete.title || 'Sem título'}"?
            </>
          )}
        </Typography>
      </StandardModal>
      
      {/* Card Details Modal */}
      {selectedCard && (
        <CardDetailsModal
          open={showCardDetails}
          card={selectedCard}
          onClose={handleCardDetailsClose}
          onUpdate={handleCardDetailsUpdate}
          onDelete={handleCardDetailsDelete}
          loading={isLoading}
          companyId={companyId}
        />
      )}
    </Box>
  );
};

export default ListView;