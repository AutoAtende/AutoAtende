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
    
    // Verificação mais robusta dos dados
    if (!data) {
      console.error("Resposta da API não contém dados");
      toast.error("Erro ao carregar quadros: resposta vazia");
      setIsLoading(false);
      return;
    }
    
    // Garantir que data é um array
    const boardsArray = Array.isArray(data) ? data : [];
    
    // Log para debug
    console.log(`Recebidos ${boardsArray.length} quadros`);
    
    if (boardsArray.length === 0) {
      // Se não há quadros, defina o estado como vazio e interrompa o carregamento
      setBoards([]);
      setIsLoading(false);
      return;
    }
    
    setBoards(boardsArray);
    
    // Lógica robusta para seleção de quadro
    let boardToSelect = null;
    
    // 1. Se há boardId na URL e existe nos dados, use-o
    if (boardId && boardsArray.find(b => b.id.toString() === boardId)) {
      boardToSelect = boardsArray.find(b => b.id.toString() === boardId);
      console.log("Selecionando quadro da URL:", boardToSelect?.name);
    } 
    // 2. Se não, use o quadro padrão se existir
    else if (boardsArray.find(b => b.isDefault)) {
      boardToSelect = boardsArray.find(b => b.isDefault);
      console.log("Selecionando quadro padrão:", boardToSelect?.name);
    } 
    // 3. Se não há quadro padrão, use o primeiro da lista
    else if (boardsArray.length > 0) {
      boardToSelect = boardsArray[0];
      console.log("Selecionando primeiro quadro:", boardToSelect?.name);
    }
    
    // Se encontramos um quadro para selecionar
    if (boardToSelect) {
      // Atualize a URL se necessário
      if (!boardId || boardToSelect.id.toString() !== boardId) {
        history.push(`/kanban/${boardToSelect.id}`);
      }
      
      setSelectedBoard(boardToSelect);
      
      // Defina o tipo de visualização com fallback seguro
      const viewType = boardToSelect.defaultView || 'kanban';
      setViewType(viewType);
      
      console.log(`Quadro selecionado: ID=${boardToSelect.id}, Nome=${boardToSelect.name}, Visualização=${viewType}`);
    } else {
      console.error("Não foi possível selecionar um quadro");
      toast.error("Erro ao selecionar quadro");
    }
    
    setIsLoading(false);
  } catch (err) {
    console.error("Erro ao carregar quadros:", err);
    // Exibir mais detalhes do erro
    if (err.response) {
      console.error("Detalhes da resposta:", err.response.data);
      console.error("Status:", err.response.status);
    } else if (err.request) {
      console.error("Sem resposta do servidor:", err.request);
    } else {
      console.error("Erro:", err.message);
    }
    
    toast.error(err.message || "Erro ao carregar quadros Kanban");
    setIsLoading(false);
    setBoards([]);
  }
}, [boardId, history]);
  

const fetchLanes = useCallback(async () => {
  if (!selectedBoard) {
    console.log("fetchLanes: Nenhum quadro selecionado, definindo lanes como array vazio");
    setLanes([]);
    return;
  }
  
  try {
    console.log(`fetchLanes: Buscando lanes para o quadro ${selectedBoard.id}`);
    setIsLoading(true);
    
    // Verificar se selectedBoard.lanes existe e é um array
    if (Array.isArray(selectedBoard.lanes)) {
      console.log(`fetchLanes: Encontradas ${selectedBoard.lanes.length} lanes no quadro`);
      setLanes(selectedBoard.lanes);
    } else {
      // Se selectedBoard.lanes não existir ou não for um array,
      // buscar lanes diretamente da API
      console.log("fetchLanes: selectedBoard.lanes não é um array, buscando da API");
      const { data } = await api.request({
        url: `/kanban/boards/${selectedBoard.id}`,
        method: 'get'
      });
      
      if (data && Array.isArray(data.lanes)) {
        console.log(`fetchLanes: API retornou ${data.lanes.length} lanes`);
        setLanes(data.lanes);
      } else {
        console.warn("fetchLanes: API não retornou lanes válidas");
        setLanes([]);
      }
    }
    
    setIsLoading(false);
  } catch (err) {
    console.error("Erro ao carregar colunas:", err);
    if (err.response) {
      console.error("Detalhes da resposta:", err.response.data);
      console.error("Status:", err.response.status);
    }
    toast.error(err.message || "Erro ao carregar colunas do Kanban");
    setIsLoading(false);
    setLanes([]);
  }
}, [selectedBoard]);

const fetchCards = useCallback(async () => {
  if (!selectedBoard) {
    console.log("fetchCards: Nenhum quadro selecionado, definindo cards como array vazio");
    setCards([]);
    return;
  }
  
  try {
    console.log(`fetchCards: Buscando cards para o quadro ${selectedBoard.id}`);
    setIsLoading(true);
    
    const { data } = await api.request({
      url: '/kanban/cards',
      method: 'get',
      params: { 
        boardId: selectedBoard.id, 
        showArchived: false,
        includeTickets: true
      }
    });
    
    // Verificação rigorosa dos dados retornados
    if (!data) {
      console.error("fetchCards: Resposta da API não contém dados");
      setCards([]);
      setIsLoading(false);
      return;
    }
    
    // Garantir que cards é um array
    const cardsArray = data?.cards || [];
    console.log(`fetchCards: API retornou ${cardsArray.length} cards`);
    
    // Se há tickets associados, carregá-los corretamente
    if (cardsArray.length > 0) {
      // Verificar quais cards têm ticketId mas não têm ticket
      const ticketIds = cardsArray
        .filter(card => card.ticketId && !card.ticket)
        .map(card => card.ticketId);
      
      if (ticketIds.length > 0) {
        console.log(`fetchCards: Buscando ${ticketIds.length} tickets associados`);
        try {
          const { data: ticketsData } = await api.request({
            url: '/tickets/batch',
            method: 'get',
            params: { ids: ticketIds.join(',') }
          });
          
          // Associar os tickets aos cartões
          if (ticketsData && ticketsData.length > 0) {
            console.log(`fetchCards: API retornou ${ticketsData.length} tickets`);
            ticketsData.forEach(ticket => {
              const cardIndex = cardsArray.findIndex(c => c.ticketId === ticket.id);
              if (cardIndex !== -1) {
                cardsArray[cardIndex].ticket = ticket;
              }
            });
          }
        } catch (ticketErr) {
          console.error("Erro ao carregar tickets associados:", ticketErr);
        }
      }
    }
    
    setCards(cardsArray);
  } catch (err) {
    console.error("Erro ao carregar cartões:", err);
    if (err.response) {
      console.error("Detalhes da resposta:", err.response.data);
      console.error("Status:", err.response.status);
    }
    toast.error(err.message || "Erro ao carregar cartões do Kanban");
    setCards([]);
  } finally {
    setIsLoading(false);
  }
}, [selectedBoard]);

  useEffect(() => {
    console.log("useEffect de fetchBoards executado. boardId:", boardId, "refreshTrigger:", refreshTrigger);
    fetchBoards();
  }, [fetchBoards, refreshTrigger]);
  
  // Adicione logs para o carregamento de lanes
  useEffect(() => {
    console.log("useEffect de fetchLanes executado. selectedBoard:", selectedBoard);
    fetchLanes();
  }, [fetchLanes, selectedBoard]);
  
  // E para o carregamento de cards
  useEffect(() => {
    console.log("useEffect de fetchCards executado. lanes:", lanes);
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

  const renderContent = () => {
    // Se estiver carregando, mostre o indicador
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    // Se não há boards disponíveis
    if (boards.length === 0) {
      return (
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
            Nenhum quadro encontrado
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBoard}
          >
            Criar Primeiro Quadro
          </Button>
        </Box>
      );
    }
    
    // Se não há quadro selecionado
    if (!selectedBoard) {
      return (
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
          <Button
            variant="contained"
            onClick={() => {
              // Tente selecionar o quadro padrão ou o primeiro quadro
              const boardToSelect = boards.find(b => b.isDefault) || boards[0];
              if (boardToSelect) {
                history.push(`/kanban/${boardToSelect.id}`);
                setSelectedBoard(boardToSelect);
                setViewType(boardToSelect.defaultView || 'kanban');
              }
            }}
          >
            Selecionar Quadro
          </Button>
        </Box>
      );
    }
    
    // Se tem quadro selecionado, renderize a visualização apropriada
    return (
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
    );
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

      {renderContent()}
            
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