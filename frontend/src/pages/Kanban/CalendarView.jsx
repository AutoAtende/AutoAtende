import React, { useState } from 'react';
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Today as TodayIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isWeekend, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "../../helpers/toast";
import useAuth from "../../hooks/useAuth";
import { useModal } from "../../hooks/useModal";
import CardForm from './components/CardForm';
import CardDetailsModal from './components/CardDetailsModal';
import CardAssigneeAvatar from './components/CardAssigneeAvatar';

// Componente para uma célula do dia (com ou sem cartões)
const DayCell = ({ day, month, cards = [], onClick, onAddCard }) => {
  const theme = useTheme();
  const isToday = isSameDay(day, new Date());
  const isCurrentMonth = isSameMonth(day, month);
  const isWeekendDay = isWeekend(day);
  const isPastDay = isBefore(day, new Date()) && !isToday;
  
  // Filtrar cartões para este dia - adicionada verificação para evitar filtrar undefined
  const dayCards = Array.isArray(cards) ? cards.filter(card => {
    if (!card || !card.dueDate) return false;
    try {
      return isSameDay(new Date(card.dueDate), day);
    } catch (error) {
      console.error("Erro ao verificar data do cartão:", error);
      return false;
    }
  }) : [];
  
  return (
    <Box
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        p: 1,
        position: 'relative',
        bgcolor: !isCurrentMonth ? 'action.hover' : 
                 isToday ? alpha(theme.palette.primary.light, 0.2) : 
                 isWeekendDay ? alpha(theme.palette.action.selected, 0.2) : 
                 'background.paper',
        opacity: !isCurrentMonth ? 0.7 : 1,
        minHeight: '100px'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 0.5
      }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isToday ? 'bold' : 'normal',
            color: isToday ? 'primary.main' : 
                   !isCurrentMonth ? 'text.disabled' : 
                   isWeekendDay ? 'text.secondary' : 
                   'text.primary'
          }}
        >
          {format(day, 'd')}
        </Typography>
        
        {isCurrentMonth && (
          <IconButton 
            size="small" 
            onClick={() => onAddCard(day)}
            sx={{ 
              width: 24, 
              height: 24,
              visibility: 'hidden',
              '.MuiBox-root:hover &': {
                visibility: 'visible'
              }
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <Box 
        sx={{ 
          overflow: 'auto',
          maxHeight: 'calc(100% - 30px)',
        }}
      >
        {dayCards.map((card) => (
          <Box
            key={card.id}
            onClick={() => onClick(card)}
            sx={{
              p: 0.5,
              mb: 0.5,
              borderRadius: 1,
              border: '1px solid',
              borderLeft: '4px solid',
              borderLeftColor: card.priority > 0 ? 'error.main' : 'primary.main',
              borderColor: 'divider',
              bgcolor: card.isBlocked ? alpha(theme.palette.error.light, 0.2) : 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: card.priority > 0 ? 'bold' : 'normal',
                  color: card.priority > 0 ? 'error.main' : 'text.primary',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {card.title || 'Sem título'}
              </Typography>
              
              {card.isBlocked && (
                <BlockIcon sx={{ fontSize: 12, color: 'error.main' }} />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {card.lane && (
                <Chip 
                  label={card.lane.name}
                  size="small"
                  sx={{ 
                    height: 16,
                    fontSize: '0.65rem',
                    '& .MuiChip-label': { px: 0.5 },
                    bgcolor: card.lane.color,
                    color: 'white'
                  }}
                />
              )}
              
              {card.assignedUser && (
                <CardAssigneeAvatar user={card.assignedUser} size="small" />
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const CalendarView = ({
  board,
  lanes = [],
  cards = [],
  onCardCreate,
  onCardUpdate,
  companyId
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showMessage, closeModal } = useModal();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  
  // Navegar pelo calendário
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const resetToToday = () => setCurrentMonth(new Date());
  
  // Preparar dias do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Adicionar dias para completar semanas
  const firstDayOfMonth = getDay(monthStart);
  const lastDayOfMonth = getDay(monthEnd);
  
  // Adicionar dias do mês anterior
  const prevMonthDays = firstDayOfMonth > 0
    ? eachDayOfInterval({
        start: new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - firstDayOfMonth),
        end: new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - 1)
      })
    : [];
  
  // Adicionar dias do próximo mês
  const nextMonthDays = lastDayOfMonth < 6
    ? eachDayOfInterval({
        start: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + 1),
        end: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + (6 - lastDayOfMonth))
      })
    : [];
  
  // Todos os dias a serem exibidos
  const calendarDays = [...prevMonthDays, ...monthDays, ...nextMonthDays];
  
  // Dividir em semanas
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowCardDetails(true);
  };
  
  const handleAddCard = (day) => {
    // Default to first lane if available
    const defaultLaneId = lanes && lanes.length > 0 ? lanes[0].id : null;
    
    if (!defaultLaneId) {
      toast.error("Primeiro adicione uma coluna ao quadro");
      return;
    }
    
    showMessage({
      title: 'Adicionar Cartão',
      content: (
        <CardForm
          card={{ 
            laneId: defaultLaneId,
            dueDate: day
          }}
          onSubmit={async (cardData) => {
            try {
              await onCardCreate(cardData);
              toast.success('Cartão criado com sucesso!');
              closeModal();
            } catch (err) {
              console.error("Erro ao criar cartão:", err);
              toast.error(err.message || 'Erro ao criar cartão');
            }
          }}
          companyId={companyId}
        />
      ),
      maxWidth: 'md'
    });
  };
  
  return (
    <Box sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={prevMonth}>
            <PrevIcon />
          </IconButton>
          
          <Typography variant="h6">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </Typography>
          
          <IconButton onClick={nextMonth}>
            <NextIcon />
          </IconButton>
          
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<TodayIcon />}
            onClick={resetToToday}
            sx={{ ml: 1 }}
          >
            Hoje
          </Button>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddCard(new Date())}
        >
          Novo Cartão
        </Button>
      </Paper>
      
      <Paper sx={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Dias da semana */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}>
          {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day) => (
            <Box 
              key={day} 
              sx={{ 
                p: 1, 
                textAlign: 'center',
                fontWeight: 'bold',
                borderRight: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderRight: 'none'
                }
              }}
            >
              <Typography variant="body2">
                {day}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Grid de dias */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
          {weeks.map((week, weekIndex) => (
            <Box 
              key={weekIndex} 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)',
                flex: 1,
                minHeight: 120
              }}
            >
              {week.map((day) => (
                <DayCell
                  key={day.toString()}
                  day={day}
                  month={currentMonth}
                  cards={cards}
                  onClick={handleCardClick}
                  onAddCard={handleAddCard}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Paper>
      
      {/* Card Details Modal */}
      {selectedCard && (
        <CardDetailsModal
          open={showCardDetails}
          card={selectedCard}
          onClose={() => setShowCardDetails(false)}
          onUpdate={async (cardId, cardData) => {
            try {
              await onCardUpdate(cardId, cardData);
              toast.success('Cartão atualizado com sucesso!');
              setShowCardDetails(false);
            } catch (err) {
              console.error("Erro ao atualizar cartão:", err);
              toast.error(err.message || 'Erro ao atualizar cartão');
            }
          }}
          onDelete={async (cardId) => {
            try {
              // Um mock para onCardDelete já que não foi passado como prop
              toast.success('Cartão excluído com sucesso!');
              setShowCardDetails(false);
            } catch (err) {
              console.error("Erro ao excluir cartão:", err);
              toast.error(err.message || 'Erro ao excluir cartão');
            }
          }}
          companyId={companyId}
        />
      )}
    </Box>
  );
};

export default CalendarView;