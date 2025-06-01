import React, { useState, useCallback } from "react";
import Board from "react-trello";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  WhatsApp as WhatsAppIcon
} from "@mui/icons-material";
import { useSpring, animated } from "react-spring";
import { toast } from "../../helpers/toast";
import useAuth from "../../hooks/useAuth";
import StandardModal from "../../components/shared/StandardModal";
import LaneForm from "./components/LaneForm";
import CardForm from "./components/CardForm";
import CardDetailsModal from "./components/CardDetailsModal";
import ChecklistModal from "./components/ChecklistModal";
import CardAssigneeAvatar from "./components/CardAssigneeAvatar";

const AnimatedDialog = animated(StandardModal);

const customLaneHeader = (laneTitle, cards, onAddCard, onEditLane, onDeleteLane, laneColor, userProfile) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%',
      bgcolor: laneColor || 'primary.main',
      color: 'white',
      borderRadius: '4px 4px 0 0',
      p: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {laneTitle}
        </Typography>
        <Typography variant="caption" sx={{ ml: 1 }}>
          ({cards.length})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Adicionar cartão">
          <IconButton size="small" onClick={onAddCard} sx={{ color: 'white' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {userProfile === 'admin' && (
          <>
            <Tooltip title="Editar coluna">
              <IconButton size="small" onClick={onEditLane} sx={{ color: 'white' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir coluna">
              <IconButton size="small" onClick={onDeleteLane} sx={{ color: 'white' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
};

const customCard = (props) => {
  const { card, dragging, onClick } = props;
  const theme = useTheme();
  
  // Parse cardData from description
  let cardData = {};
  try {
    if (typeof card.description === 'string') {
      cardData = JSON.parse(card.description) || {};
    }
  } catch (error) {
    console.error("Erro ao analisar dados do cartão:", error);
  }
  
  const checklistItems = cardData.checklistItems || [];
  const completedItems = checklistItems.filter(item => item && item.checked).length;
  const totalItems = checklistItems.length;
  const hasDueDate = !!cardData.dueDate;
  const dueDate = hasDueDate ? new Date(cardData.dueDate) : null;
  const isPastDue = hasDueDate && dueDate && new Date() > dueDate;
  const hasTicket = !!cardData.ticketId;
  const ticketInfo = hasTicket ? (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mt: 0.5,
      p: 0.5,
      bgcolor: alpha(theme.palette.info.light, 0.2),
      borderRadius: 0.5
    }}>
      <WhatsAppIcon fontSize="small" sx={{ mr: 0.5, color: '#25d366' }} />
      <Typography variant="caption">
        Ticket #{cardData.ticketId}
      </Typography>
    </Box>
  ) : null;
  
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1,
        cursor: 'pointer',
        bgcolor: dragging ? 'action.hover' : 'background.paper',
        borderRadius: 1,
        boxShadow: dragging ? 4 : 1,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          bgcolor: 'action.hover',
        },
        mb: 1,
        position: 'relative',
        borderLeft: cardData.priority > 0 ? `4px solid ${theme.palette.error.main}` : null,
        opacity: cardData.isBlocked ? 0.7 : 1
      }}
    >
      {cardData.isBlocked && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          bgcolor: 'error.main', 
          color: 'white',
          p: 0.5,
          fontSize: '0.7rem',
          textAlign: 'center'
        }}>
          BLOQUEADO
        </Box>
      )}
      
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
        {card.title || "Sem título"}
      </Typography>
      
      {cardData.contactName && (
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          Cliente: {cardData.contactName}
          {hasTicket && ticketInfo}
        </Typography>
      )}
      
      {cardData.description && typeof cardData.description === 'string' && (
        <Typography variant="caption" sx={{ 
          display: 'block', 
          mb: 0.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {cardData.description.length > 60 
            ? `${cardData.description.substring(0, 60)}...` 
            : cardData.description}
        </Typography>
      )}

      {totalItems > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 0.5, gap: 0.5 }}>
          <CheckCircleIcon 
            fontSize="small" 
            color={completedItems === totalItems ? "success" : "action"} 
          />
          <Typography variant="caption">
            {completedItems}/{totalItems}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {hasDueDate && dueDate && (
            <Tooltip title={dueDate.toLocaleDateString()}>
              <CalendarIcon 
                fontSize="small" 
                color={isPastDue ? "error" : "action"} 
              />
            </Tooltip>
          )}
          
          {cardData.tags && Array.isArray(cardData.tags) && cardData.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {cardData.tags.slice(0, 2).map((tag) => (
                <Box
                  key={tag.id}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: tag.color || 'primary.main',
                  }}
                />
              ))}
              {cardData.tags.length > 2 && (
                <Tooltip title={`+${cardData.tags.length - 2} tags`}>
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
        
        {cardData.assignedUser && (
          <CardAssigneeAvatar user={cardData.assignedUser} />
        )}
      </Box>
    </Box>
  );
};

const KanbanView = ({
  board,
  lanes = [],
  cards = [],
  onLaneCreate,
  onLaneUpdate,
  onLaneDelete,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  onCardMove,
  onLanesReorder,
  companyId
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [isAddingLane, setIsAddingLane] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showEditLane, setShowEditLane] = useState(false);
  const [selectedLane, setSelectedLane] = useState(null);
  const [showDeleteLane, setShowDeleteLane] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState(null);
  const [showDeleteCard, setShowDeleteCard] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  
  const addLaneFormStyles = useSpring({
    opacity: isAddingLane ? 1 : 0,
    transform: isAddingLane ? 'translateY(0)' : 'translateY(-20px)',
    config: { tension: 300, friction: 20 }
  });

  // Preparar os dados para o componente Board
  const formatBoardData = useCallback(() => {
    if (!Array.isArray(lanes)) {
      console.error("Lanes não é um array", lanes);
      return { lanes: [] };
    }
    
    const formattedLanes = lanes.map(lane => {
      if (!lane) {
        console.error("Lane é undefined");
        return null;
      }
      
      const laneCards = Array.isArray(cards) 
        ? cards.filter(card => card && card.laneId === lane.id)
        : [];
      
      return {
        id: lane.id.toString(),
        title: lane.name || "Sem nome",
        cards: laneCards.map(card => {
          if (!card) {
            console.error("Card é undefined");
            return null;
          }
          
          const cardData = {
            id: card.id,
            description: card.description,
            priority: card.priority,
            dueDate: card.dueDate,
            contactId: card.contactId,
            contactName: card.contact?.name,
            ticketId: card.ticketId,
            assignedUserId: card.assignedUserId,
            assignedUser: card.assignedUser,
            value: card.value,
            sku: card.sku,
            tags: card.tags || [],
            isBlocked: card.isBlocked,
            blockReason: card.blockReason,
            checklistItems: card.checklistItems || []
          };
          
          return {
            id: card.id.toString(),
            title: card.title || (card.contact ? card.contact.name : 'Sem título'),
            description: JSON.stringify(cardData),
            label: card.tags?.length ? card.tags[0].name : '',
            draggable: !card.isBlocked,
            metadata: card.metadata
          };
        }).filter(Boolean),
        style: {
          width: 280,
        },
        color: lane.color || theme.palette.primary.main,
        cardLimit: lane.cardLimit
      };
    }).filter(Boolean);
    
    return { lanes: formattedLanes };
  }, [lanes, cards, theme.palette.primary.main]);

  const handleLaneAdd = () => {
    setIsAddingLane(true);
  };

  const handleLaneAddClose = () => {
    setIsAddingLane(false);
  };

  const handleLaneAddSubmit = async (laneData) => {
    try {
      setIsLoading(true);
      await onLaneCreate(laneData);
      setIsAddingLane(false);
      toast.success('Coluna criada com sucesso!');
    } catch (err) {
      console.error("Erro ao criar coluna:", err);
      toast.error(err.message || 'Erro ao criar coluna');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaneEdit = (laneId) => {
    const lane = lanes.find(l => l && l.id && l.id.toString() === laneId);
    if (!lane) {
      console.error("Lane não encontrada para edição:", laneId);
      return;
    }
    
    setSelectedLane(lane);
    setShowEditLane(true);
  };

  const handleLaneEditSubmit = async (laneData) => {
    try {
      setIsLoading(true);
      await onLaneUpdate(selectedLane.id, laneData);
      toast.success('Coluna atualizada com sucesso!');
      setShowEditLane(false);
      setSelectedLane(null);
    } catch (err) {
      console.error("Erro ao atualizar coluna:", err);
      toast.error(err.message || 'Erro ao atualizar coluna');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaneEditClose = () => {
    setShowEditLane(false);
    setSelectedLane(null);
  };

  const handleLaneDelete = (laneId) => {
    const lane = lanes.find(l => l && l.id && l.id.toString() === laneId);
    if (!lane) {
      console.error("Lane não encontrada para exclusão:", laneId);
      return;
    }
    
    setSelectedLane(lane);
    setShowDeleteLane(true);
  };

  const handleLaneDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await onLaneDelete(selectedLane.id);
      toast.success('Coluna excluída com sucesso!');
      setShowDeleteLane(false);
      setSelectedLane(null);
    } catch (err) {
      console.error("Erro ao excluir coluna:", err);
      toast.error(err.message || 'Erro ao excluir coluna');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaneDeleteClose = () => {
    setShowDeleteLane(false);
    setSelectedLane(null);
  };

  const handleCardAdd = (laneId) => {
    const lane = lanes.find(l => l && l.id && l.id.toString() === laneId);
    if (!lane) {
      console.error("Lane não encontrada para adicionar cartão:", laneId);
      return;
    }
    
    setSelectedLaneId(parseInt(laneId));
    setShowAddCard(true);
  };

  const handleCardAddSubmit = async (cardData) => {
    try {
      setIsLoading(true);
      await onCardCreate(cardData);
      toast.success('Cartão criado com sucesso!');
      setShowAddCard(false);
      setSelectedLaneId(null);
    } catch (err) {
      console.error("Erro ao criar cartão:", err);
      toast.error(err.message || 'Erro ao criar cartão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardAddClose = () => {
    setShowAddCard(false);
    setSelectedLaneId(null);
  };

  const handleCardClick = (cardId) => {
    const card = Array.isArray(cards) ? cards.find(c => c && c.id && c.id.toString() === cardId) : null;
    if (!card) {
      console.error("Cartão não encontrado para visualização:", cardId);
      return;
    }
    
    setSelectedCard(card);
    setShowCardDetails(true);
  };

  const handleCardUpdate = async (cardId, cardData) => {
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

  const handleCardDelete = async (cardId) => {
    const card = Array.isArray(cards) ? cards.find(c => c && c.id && c.id.toString() === cardId) : null;
    if (!card) {
      console.error("Cartão não encontrado para exclusão:", cardId);
      return;
    }
    
    setCardToDelete(card);
    setShowDeleteCard(true);
  };

  const handleCardDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await onCardDelete(cardToDelete.id);
      toast.success('Cartão excluído com sucesso!');
      setShowDeleteCard(false);
      setCardToDelete(null);
      setShowCardDetails(false);
      setSelectedCard(null);
    } catch (err) {
      console.error("Erro ao excluir cartão:", err);
      toast.error(err.message || 'Erro ao excluir cartão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardDeleteClose = () => {
    setShowDeleteCard(false);
    setCardToDelete(null);
  };

  const handleCardDetailsClose = () => {
    setShowCardDetails(false);
    setSelectedCard(null);
  };

  const handleDragEnd = async (
    cardId,
    sourceLaneId,
    targetLaneId,
    position,
    card
  ) => {
    if (sourceLaneId === targetLaneId) return;
    
    try {
      await onCardMove(cardId, parseInt(targetLaneId));
    } catch (err) {
      console.error("Erro ao mover cartão:", err);
      toast.error(err.message || 'Erro ao mover cartão');
    }
  };

  const handleLaneDragEnd = async (removedIndex, addedIndex, lane) => {
    if (removedIndex === addedIndex) return;
    
    try {
      if (!Array.isArray(lanes)) {
        console.error("Lanes não é um array ao reordenar");
        return;
      }
      
      const reorderedLanes = [...lanes];
      const [movedLane] = reorderedLanes.splice(removedIndex, 1);
      reorderedLanes.splice(addedIndex, 0, movedLane);
      
      const lanesWithPositions = reorderedLanes.map((lane, index) => ({
        id: lane.id,
        position: index
      }));
      
      await onLanesReorder(lanesWithPositions);
    } catch (err) {
      console.error("Erro ao reordenar colunas:", err);
      toast.error(err.message || 'Erro ao reordenar colunas');
    }
  };

  const handleShowChecklist = () => {
    setShowChecklist(true);
    setShowCardDetails(false);
  };

  const handleChecklistClose = () => {
    setShowChecklist(false);
    setShowCardDetails(true);
  };

  const boardData = formatBoardData();

  const components = {
    Card: customCard,
    LaneHeader: (props) => {
      const { title, cards, onAdd, id } = props;
      if (!id) {
        console.error("LaneHeader recebeu um ID inválido");
        return null;
      }
      const lane = lanes.find(l => l && l.id && l.id.toString() === id);
      return customLaneHeader(
        title, 
        cards || [], 
        () => handleCardAdd(id), 
        () => handleLaneEdit(id),
        () => handleLaneDelete(id),
        lane?.color,
        user?.profile || 'user'
      );
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 180px)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mb: 2,
        mt: -1
      }}>
        {(user?.profile === 'admin' || user?.super) && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleLaneAdd}
          >
            Adicionar Coluna
          </Button>
        )}
      </Box>
      
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <Board
          data={boardData}
          draggable
          laneDraggable={(user?.profile === 'admin' || user?.super)}
          editable={(user?.profile === 'admin' || user?.super)}
          canAddLanes={false}
          editLaneTitle={false}
          hideCardDeleteIcon
          style={{
            height: '100%',
            background: theme.palette.background.default,
            padding: '0px'
          }}
          components={components}
          onCardClick={handleCardClick}
          handleDragEnd={handleDragEnd}
          handleLaneDragEnd={handleLaneDragEnd}
          laneStyle={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '4px',
            marginRight: '10px',
            boxShadow: theme.shadows[1],
            border: `1px solid ${theme.palette.divider}`
          }}
        />
      </Box>
      
      {/* Modal para adicionar coluna */}
      <StandardModal
        open={isAddingLane}
        onClose={handleLaneAddClose}
        title="Adicionar Coluna"
        maxWidth="md"
        size="medium"
      >
        <LaneForm
          onSubmit={handleLaneAddSubmit}
          loading={isLoading}
        />
      </StandardModal>

      {/* Modal para editar coluna */}
      <StandardModal
        open={showEditLane}
        onClose={handleLaneEditClose}
        title="Editar Coluna"
        maxWidth="md"
        size="medium"
      >
        <LaneForm
          lane={selectedLane}
          onSubmit={handleLaneEditSubmit}
          loading={isLoading}
        />
      </StandardModal>

      {/* Modal para excluir coluna */}
      <StandardModal
        open={showDeleteLane}
        onClose={handleLaneDeleteClose}
        title="Excluir Coluna"
        maxWidth="sm"
        size="small"
        primaryAction={{
          label: isLoading ? 'Excluindo...' : 'Excluir',
          onClick: handleLaneDeleteConfirm,
          disabled: isLoading,
          color: 'error',
          icon: isLoading ? <CircularProgress size={16} /> : <DeleteIcon />
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleLaneDeleteClose,
          disabled: isLoading
        }}
      >
        <Typography>
          {selectedLane && (
            <>
              Tem certeza que deseja excluir a coluna "{selectedLane.name}"?
              {cards.filter(card => card && card.laneId === selectedLane.id).length > 0 && (
                <Box sx={{ mt: 1, color: 'warning.main' }}>
                  Esta coluna possui cartões que também serão excluídos.
                </Box>
              )}
            </>
          )}
        </Typography>
      </StandardModal>

      {/* Modal para adicionar cartão */}
      <StandardModal
        open={showAddCard}
        onClose={handleCardAddClose}
        title="Adicionar Cartão"
        maxWidth="md"
        size="large"
      >
        <CardForm
          card={{ laneId: selectedLaneId }}
          onSubmit={handleCardAddSubmit}
          loading={isLoading}
          companyId={companyId}
        />
      </StandardModal>

      {/* Modal para excluir cartão */}
      <StandardModal
        open={showDeleteCard}
        onClose={handleCardDeleteClose}
        title="Excluir Cartão"
        maxWidth="sm"
        size="small"
        primaryAction={{
          label: isLoading ? 'Excluindo...' : 'Excluir',
          onClick: handleCardDeleteConfirm,
          disabled: isLoading,
          color: 'error',
          icon: isLoading ? <CircularProgress size={16} /> : <DeleteIcon />
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleCardDeleteClose,
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
      
      {/* Modal de detalhes do card */}
      {selectedCard && (
        <CardDetailsModal
          open={showCardDetails}
          card={selectedCard}
          onClose={handleCardDetailsClose}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
          onShowChecklist={handleShowChecklist}
          loading={isLoading}
          companyId={companyId}
        />
      )}
      
      {/* Modal de checklist */}
      {selectedCard && (
        <ChecklistModal
          open={showChecklist}
          card={selectedCard}
          onClose={handleChecklistClose}
          companyId={companyId}
        />
      )}
    </Box>
  );
};

export default KanbanView;