import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Tabs, 
  Tab, 
  Divider, 
  Tooltip, 
  useTheme, 
  CircularProgress 
} from "@mui/material";
import {
  Add as AddIcon,
  ListAlt as ListViewIcon,
  ViewKanban as KanbanViewIcon,
  CalendarToday as CalendarViewIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { useHistory, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useLoading } from "../../hooks/useLoading";
import StandardModal from "../../components/shared/StandardModal";

import KanbanView from "./KanbanView";
import ListView from "./ListView";
import CalendarView from "./CalendarView";
import BoardSelector from "./components/BoardSelector";
import BoardSettingsModal from "./components/BoardSettingsModal";
import KanbanMetrics from "./components/KanbanMetrics";

const Kanban = () => {
  const theme = useTheme();
  const history = useHistory();
  const { isAuth, user } = useAuth();
  const { companyId } = user || {};
  const { boardId } = useParams();
  const { Loading } = useLoading();
  
  const [viewType, setViewType] = useState('kanban');
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [lanes, setLanes] = useState([]);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showBoardSettingsModal, setShowBoardSettingsModal] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [showDeleteBoard, setShowDeleteBoard] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState(null);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.request({
        url: '/kanban/boards',
        method: 'get'
      });
      
      const boardsArray = Array.isArray(data) ? data : [];
      setBoards(boardsArray);
      
      if (!boardId || !boardsArray.find(b => b.id.toString() === boardId)) {
        const defaultBoard = boardsArray.find(b => b.isDefault) || boardsArray[0];
        if (defaultBoard) {
          history.push(`/kanban/${defaultBoard.id}`, { replace: true });
          setSelectedBoard(defaultBoard);
          setViewType(defaultBoard.defaultView || 'kanban');
        }
      } else {
        const board = boardsArray.find(b => b.id.toString() === boardId);
        setSelectedBoard(board);
        setViewType(board?.defaultView || 'kanban');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao carregar quadros:", err);
      toast.error(err.message || "Erro ao carregar quadros Kanban");
      setIsLoading(false);
      setBoards([]);
    }
  }, [boardId, history]);

  const fetchLanes = useCallback(async () => {
    if (!selectedBoard) {
      setLanes([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const lanesArray = selectedBoard.lanes || [];
      setLanes(lanesArray);
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao carregar colunas:", err);
      toast.error(err.message || "Erro ao carregar colunas do Kanban");
      setIsLoading(false);
      setLanes([]);
    }
  }, [selectedBoard]);

  const fetchCards = useCallback(async () => {
    if (!selectedBoard) {
      setCards([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data } = await api.request({
        url: '/kanban/cards',
        method: 'get',
        params: { 
          boardId: selectedBoard.id, 
          showArchived: false
        }
      });
      
      const cardsArray = data?.cards || [];
      
      // Enriquecer os cartões com dados de tickets e contatos
      const enrichedCards = await Promise.all(
        cardsArray.map(async (card) => {
          if (!card) return null;
          
          const enrichedCard = { ...card };
          
          // Buscar dados do ticket se existir
          if (card.ticketId && !card.ticket) {
            try {
              const { data: ticketData } = await api.request({
                url: `/tickets/${card.ticketId}`,
                method: 'get'
              });
              enrichedCard.ticket = ticketData;
            } catch (ticketErr) {
              console.warn(`Erro ao carregar ticket ${card.ticketId}:`, ticketErr);
            }
          }
          
          // Buscar dados do contato se existir
          if (card.contactId && !card.contact) {
            try {
              const { data: contactData } = await api.request({
                url: `/contacts/${card.contactId}`,
                method: 'get'
              });
              enrichedCard.contact = contactData;
            } catch (contactErr) {
              console.warn(`Erro ao carregar contato ${card.contactId}:`, contactErr);
            }
          }
          
          // Buscar dados do usuário responsável se existir
          if (card.assignedUserId && !card.assignedUser) {
            try {
              const { data: userData } = await api.request({
                url: `/users/${card.assignedUserId}`,
                method: 'get'
              });
              enrichedCard.assignedUser = userData;
            } catch (userErr) {
              console.warn(`Erro ao carregar usuário ${card.assignedUserId}:`, userErr);
            }
          }
          
          return enrichedCard;
        })
      );
      
      setCards(enrichedCards.filter(Boolean));
    } catch (err) {
      console.error("Erro ao carregar cartões:", err);
      toast.error(err.message || "Erro ao carregar cartões do Kanban");
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBoard]);

  // Carrega dados iniciais
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards, refreshTrigger]);

  // Carrega lanes quando o board muda
  useEffect(() => {
    fetchLanes();
  }, [fetchLanes, selectedBoard]);

  // Carrega cards quando lanes mudam
  useEffect(() => {
    fetchCards();
  }, [fetchCards, lanes]);

  const handleBoardChange = (boardId) => {
    history.push(`/kanban/${boardId}`);
    const board = boards.find(b => b.id.toString() === boardId.toString());
    if (board) {
      setSelectedBoard(board);
      setViewType(board.defaultView || 'kanban');
    }
  };

  const handleViewChange = (event, newView) => {
    setViewType(newView);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateBoard = () => {
    setShowCreateBoard(true);
  };

  const handleCreateBoardSubmit = async (boardData) => {
    try {
      setModalLoading(true);
      await api.request({
        url: '/kanban/boards',
        method: 'post',
        data: boardData
      });
      toast.success('Quadro criado com sucesso!');
      fetchBoards();
      setShowCreateBoard(false);
    } catch (err) {
      console.error("Erro ao criar quadro:", err);
      toast.error(err.message || 'Erro ao criar quadro');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateBoardClose = () => {
    setShowCreateBoard(false);
  };

  const handleBoardSettings = () => {
    if (selectedBoard) {
      setBoardToEdit(selectedBoard);
      setShowEditBoard(true);
    }
  };

  const handleEditBoardSubmit = async (boardData) => {
    try {
      setModalLoading(true);
      await api.request({
        url: `/kanban/boards/${boardToEdit.id}`,
        method: 'put',
        data: boardData
      });
      toast.success('Quadro atualizado com sucesso!');
      fetchBoards();
      setShowEditBoard(false);
      setBoardToEdit(null);
    } catch (err) {
      console.error("Erro ao atualizar quadro:", err);
      toast.error(err.message || 'Erro ao atualizar quadro');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditBoardClose = () => {
    setShowEditBoard(false);
    setBoardToEdit(null);
  };

  const handleDeleteBoard = () => {
    if (selectedBoard) {
      setBoardToDelete(selectedBoard);
      setShowDeleteBoard(true);
    }
  };

  const handleDeleteBoardConfirm = async () => {
    try {
      setModalLoading(true);
      await api.request({
        url: `/kanban/boards/${boardToDelete.id}`,
        method: 'delete'
      });
      toast.success('Quadro excluído com sucesso!');
      setShowDeleteBoard(false);
      setBoardToDelete(null);
      fetchBoards();
    } catch (err) {
      console.error("Erro ao excluir quadro:", err);
      toast.error(err.message || 'Erro ao excluir quadro');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBoardClose = () => {
    setShowDeleteBoard(false);
    setBoardToDelete(null);
  };

  const handleToggleMetrics = () => {
    setShowMetrics(prev => !prev);
  };

  // Funções para operações de cartões
  const handleCardCreate = async (cardData) => {
    const response = await api.request({
      url: '/kanban/cards',
      method: 'post',
      data: cardData
    });
    
    // Atualizar lista de cartões após criação
    setTimeout(() => fetchCards(), 500);
    
    return response;
  };

  const handleCardUpdate = async (cardId, cardData) => {
    const response = await api.request({
      url: `/kanban/cards/${cardId}`,
      method: 'put',
      data: cardData
    });
    
    // Atualizar lista de cartões após atualização
    setTimeout(() => fetchCards(), 500);
    
    return response;
  };

  const handleCardDelete = async (cardId) => {
    const response = await api.request({
      url: `/kanban/cards/${cardId}`,
      method: 'delete'
    });
    
    // Atualizar lista de cartões após exclusão
    setTimeout(() => fetchCards(), 500);
    
    return response;
  };

  const handleCardMove = async (cardId, laneId) => {
    const response = await api.request({
      url: `/kanban/cards/${cardId}/move`,
      method: 'post',
      data: { laneId }
    });
    
    // Atualizar lista de cartões após movimento
    setTimeout(() => fetchCards(), 500);
    
    return response;
  };

  // Funções para operações de lanes
  const handleLaneCreate = async (laneData) => {
    const response = await api.request({
      url: '/kanban/lanes',
      method: 'post',
      data: laneData
    });
    
    // Atualizar dados do board
    setTimeout(() => fetchBoards(), 500);
    
    return response;
  };

  const handleLaneUpdate = async (laneId, laneData) => {
    const response = await api.request({
      url: `/kanban/lanes/${laneId}`,
      method: 'put',
      data: laneData
    });
    
    // Atualizar dados do board
    setTimeout(() => fetchBoards(), 500);
    
    return response;
  };

  const handleLaneDelete = async (laneId) => {
    const response = await api.request({
      url: `/kanban/lanes/${laneId}`,
      method: 'delete'
    });
    
    // Atualizar dados do board
    setTimeout(() => fetchBoards(), 500);
    
    return response;
  };

  const handleLanesReorder = async (lanes) => {
    const response = await api.request({
      url: `/kanban/boards/${selectedBoard.id}/reorder-lanes`,
      method: 'post',
      data: { lanes }
    });
    
    // Atualizar dados do board
    setTimeout(() => fetchBoards(), 500);
    
    return response;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">Kanban</Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={handleToggleMetrics}
              color={showMetrics ? "primary" : "inherit"}
            >
              Métricas
            </Button>
            
            {(user?.profile === 'admin' || user?.super) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateBoard}
              >
                Novo Quadro
              </Button>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BoardSelector 
            boards={boards || []} 
            selectedBoardId={selectedBoard?.id} 
            onChange={handleBoardChange} 
          />
          
          {selectedBoard && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tabs 
                value={viewType} 
                onChange={handleViewChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab 
                  icon={<KanbanViewIcon />} 
                  label="Kanban" 
                  value="kanban" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<ListViewIcon />} 
                  label="Lista" 
                  value="list" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<CalendarViewIcon />} 
                  label="Calendário" 
                  value="calendar" 
                  iconPosition="start"
                />
              </Tabs>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              
              <Tooltip title="Configurações do Quadro">
                <IconButton onClick={handleBoardSettings}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Paper>
      
      {showMetrics && selectedBoard && (
        <KanbanMetrics 
          boardId={selectedBoard.id} 
          onClose={() => setShowMetrics(false)} 
        />
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : !selectedBoard ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            gap: 2
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Nenhum quadro selecionado
          </Typography>
          {boards.length === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBoard}
            >
              Criar Primeiro Quadro
            </Button>
          )}
        </Box>
      ) : (
        <>
          {viewType === 'kanban' && (
            <KanbanView 
              board={selectedBoard}
              lanes={lanes || []}
              cards={cards || []}
              onLaneCreate={handleLaneCreate}
              onLaneUpdate={handleLaneUpdate}
              onLaneDelete={handleLaneDelete}
              onCardCreate={handleCardCreate}
              onCardUpdate={handleCardUpdate}
              onCardDelete={handleCardDelete}
              onCardMove={handleCardMove}
              onLanesReorder={handleLanesReorder}
              companyId={companyId}
            />
          )}
          
          {viewType === 'list' && (
            <ListView 
              board={selectedBoard}
              lanes={lanes || []}
              cards={cards || []}
              onCardCreate={handleCardCreate}
              onCardUpdate={handleCardUpdate}
              onCardDelete={handleCardDelete}
              companyId={companyId}
            />
          )}
          
          {viewType === 'calendar' && (
            <CalendarView 
              board={selectedBoard}
              lanes={lanes || []}
              cards={cards || []}
              onCardCreate={handleCardCreate}
              onCardUpdate={handleCardUpdate}
              companyId={companyId}
            />
          )}
        </>
      )}
      
      {/* Modal para Criar Quadro */}
      <StandardModal
        open={showCreateBoard}
        onClose={handleCreateBoardClose}
        title="Criar Novo Quadro"
        maxWidth="md"
        size="large"
      >
        <BoardSettingsModal 
          board={null}
          open={false}
          onClose={() => {}}
          onSave={handleCreateBoardSubmit}
          loading={modalLoading}
        />
      </StandardModal>

      {/* Modal para Editar Quadro */}
      <StandardModal
        open={showEditBoard}
        onClose={handleEditBoardClose}
        title={`Editar Quadro: ${boardToEdit?.name || ''}`}
        maxWidth="md"
        size="large"
        actions={[
          {
            label: 'Excluir Quadro',
            onClick: handleDeleteBoard,
            variant: 'outlined',
            color: 'error',
            icon: <DeleteIcon />,
            disabled: modalLoading
          }
        ]}
      >
        {boardToEdit && (
          <BoardSettingsModal 
            board={boardToEdit}
            open={false}
            onClose={() => {}}
            onSave={handleEditBoardSubmit}
            onDelete={() => {}}
            loading={modalLoading}
          />
        )}
      </StandardModal>

      {/* Modal para Excluir Quadro */}
      <StandardModal
        open={showDeleteBoard}
        onClose={handleDeleteBoardClose}
        title="Excluir Quadro"
        maxWidth="sm"
        size="small"
        primaryAction={{
          label: modalLoading ? 'Excluindo...' : 'Confirmar Exclusão',
          onClick: handleDeleteBoardConfirm,
          disabled: modalLoading,
          color: 'error',
          icon: modalLoading ? <CircularProgress size={16} /> : <DeleteIcon />
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleDeleteBoardClose,
          disabled: modalLoading
        }}
      >
        <Typography>
          {boardToDelete && (
            <>
              Tem certeza que deseja excluir o quadro "{boardToDelete.name}"?
              <Box sx={{ mt: 1, color: 'warning.main' }}>
                A exclusão do quadro removerá todas as colunas e cartões associados. Esta ação não pode ser desfeita.
              </Box>
            </>
          )}
        </Typography>
      </StandardModal>
    </Box>
  );
};

export default Kanban;