// pages/Kanban/index.jsx
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
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { useHistory, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useLoading } from "../../hooks/useLoading";
import { useModal } from "../../hooks/useModal";

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
  const { companyId } = user || {}; // Adicionado fallback
  const { boardId } = useParams();
  const { Loading } = useLoading();
  const { showMessage, closeModal } = useModal();
  
  const [viewType, setViewType] = useState('kanban');
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [lanes, setLanes] = useState([]);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showBoardSettingsModal, setShowBoardSettingsModal] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.request({
        url: '/kanban/boards',
        method: 'get'
      });
      
      // Garantir que data é um array
      const boardsArray = Array.isArray(data) ? data : [];
      setBoards(boardsArray);
      
      // Se não houver boardId na URL ou se o boardId não existir nos dados,
      // use o primeiro quadro padrão ou o primeiro quadro disponível
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
      // Verificar se selectedBoard.lanes existe, caso contrário, definir como array vazio
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
          showArchived: false,
          includeTickets: true // Adicionar este parâmetro
        }
      });
      
      // Garantir que cards é um array
      const cardsArray = data?.cards || [];
      
      // Verificar se há tickets associados e carregá-los corretamente
      if (cardsArray.length > 0) {
        // Se necessário, buscar tickets que não foram incluídos na resposta
        const ticketIds = cardsArray
          .filter(card => card.ticketId && !card.ticket)
          .map(card => card.ticketId);
        
        if (ticketIds.length > 0) {
          try {
            const { data: ticketsData } = await api.request({
              url: '/tickets/batch',
              method: 'get',
              params: { ids: ticketIds.join(',') }
            });
            
            // Associar os tickets aos cartões
            if (ticketsData && ticketsData.length > 0) {
              ticketsData.forEach(ticket => {
                const cardIndex = cardsArray.findIndex(c => c.ticketId === ticket.id);
                if (cardIndex !== -1) {
                  cardsArray[cardIndex].ticket = ticket;
                }
              });
            }
          } catch (err) {
            console.error("Erro ao carregar tickets associados:", err);
          }
        }
      }
      
      setCards(cardsArray);
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
    setShowBoardSettingsModal(true);
  };

  const handleBoardSettings = () => {
    setShowSettings(true);
  };

  const handleToggleMetrics = () => {
    setShowMetrics(prev => !prev);
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
              onLaneCreate={(laneData) => {
                const newLaneData = {
                  ...laneData,
                  boardId: selectedBoard.id
                };
                return api.request({
                  url: '/kanban/lanes',
                  method: 'post',
                  data: newLaneData
                });
              }}
              onLaneUpdate={(laneId, laneData) => {
                return api.request({
                  url: `/kanban/lanes/${laneId}`,
                  method: 'put',
                  data: laneData
                });
              }}
              onLaneDelete={(laneId) => {
                return api.request({
                  url: `/kanban/lanes/${laneId}`,
                  method: 'delete'
                });
              }}
              onCardCreate={(cardData) => {
                return api.request({
                  url: '/kanban/cards',
                  method: 'post',
                  data: cardData
                });
              }}
              onCardUpdate={(cardId, cardData) => {
                return api.request({
                  url: `/kanban/cards/${cardId}`,
                  method: 'put',
                  data: cardData
                });
              }}
              onCardDelete={(cardId) => {
                return api.request({
                  url: `/kanban/cards/${cardId}`,
                  method: 'delete'
                });
              }}
              onCardMove={(cardId, laneId) => {
                return api.request({
                  url: `/kanban/cards/${cardId}/move`,
                  method: 'post',
                  data: { laneId }
                });
              }}
              onLanesReorder={(lanes) => {
                return api.request({
                  url: `/kanban/boards/${selectedBoard.id}/reorder-lanes`,
                  method: 'post',
                  data: { lanes }
                });
              }}
              companyId={companyId}
            />
          )}
          
          {viewType === 'list' && (
            <ListView 
              board={selectedBoard}
              lanes={lanes || []}
              cards={cards || []}
              onCardCreate={(cardData) => {
                return api.request({
                  url: '/kanban/cards',
                  method: 'post',
                  data: cardData
                });
              }}
              onCardUpdate={(cardId, cardData) => {
                return api.request({
                  url: `/kanban/cards/${cardId}`,
                  method: 'put',
                  data: cardData
                });
              }}
              onCardDelete={(cardId) => {
                return api.request({
                  url: `/kanban/cards/${cardId}`,
                  method: 'delete'
                });
              }}
              companyId={companyId}
            />
          )}
          
          {viewType === 'calendar' && (
            <CalendarView 
              board={selectedBoard}
              lanes={lanes || []}
              cards={cards || []}
              onCardCreate={(cardData) => {
                return api.request({
                  url: '/kanban/cards',
                  method: 'post',
                  data: cardData
                });
              }}
              onCardUpdate={(cardId, cardData) => {
                return api.request({
                  url: `/kanban/cards/${cardId}`,
                  method: 'put',
                  data: cardData
                });
              }}
              companyId={companyId}
            />
          )}
        </>
      )}
      
      {showSettings && selectedBoard && (
        <BoardSettingsModal 
          board={selectedBoard}
          open={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={async (boardData) => {
            try {
              Loading.turnOn();
              await api.request({
                url: `/kanban/boards/${selectedBoard.id}`,
                method: 'put',
                data: boardData
              });
              toast.success('Quadro atualizado com sucesso!');
              fetchBoards();
              setShowSettings(false);
            } catch (err) {
              console.error("Erro ao atualizar quadro:", err);
              toast.error(err.message || 'Erro ao atualizar quadro');
            } finally {
              Loading.turnOff();
            }
          }}
          onDelete={async () => {
            try {
              Loading.turnOn();
              await api.request({
                url: `/kanban/boards/${selectedBoard.id}`,
                method: 'delete'
              });
              toast.success('Quadro excluído com sucesso!');
              setShowSettings(false);
              fetchBoards();
            } catch (err) {
              console.error("Erro ao excluir quadro:", err);
              toast.error(err.message || 'Erro ao excluir quadro');
            } finally {
              Loading.turnOff();
            }
          }}
        />
      )}
      
      {showBoardSettingsModal && (
        <BoardSettingsModal 
          open={showBoardSettingsModal}
          onClose={() => setShowBoardSettingsModal(false)}
          onSave={async (boardData) => {
            try {
              Loading.turnOn();
              await api.request({
                url: '/kanban/boards',
                method: 'post',
                data: boardData
              });
              toast.success('Quadro criado com sucesso!');
              fetchBoards();
              setShowBoardSettingsModal(false);
            } catch (err) {
              console.error("Erro ao criar quadro:", err);
              toast.error(err.message || 'Erro ao criar quadro');
            } finally {
              Loading.turnOff();
            }
          }} 
        />
      )}
    </Box>
  );
};

export default Kanban;