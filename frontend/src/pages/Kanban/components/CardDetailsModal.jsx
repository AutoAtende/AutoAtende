import React, { useState } from 'react';
import { alpha, useTheme } from "@mui/material/styles";
import {
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Tooltip,
  Avatar,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Tag as TagIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  OpenInNew as OpenInNewIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "../../../helpers/toast";
import StandardModal from "../../../components/shared/StandardModal";
import CardForm from './CardForm';
import CardAssigneeAvatar from './CardAssigneeAvatar';

const CardDetailsModal = ({ 
  open, 
  card,
  onClose, 
  onUpdate, 
  onDelete, 
  onShowChecklist,
  loading,
  companyId
}) => {
  const history = useHistory();
  const theme = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  if (!card) return null;
  
  const checklistItems = card.checklistItems || [];
  const completedItems = checklistItems.filter(item => item.checked).length;
  const hasDueDate = !!card.dueDate;
  const dueDate = hasDueDate ? new Date(card.dueDate) : null;
  const isPastDue = hasDueDate && new Date() > dueDate;
  
  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditSubmit = async (cardData) => {
    try {
      await onUpdate(card.id, cardData);
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar cartão');
    }
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
  };

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    onDelete(card.id);
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const handleOpenTicket = () => {
    if (card.ticketId) {
      history.push(`/tickets/${card.ticket.uuid}`);
    }
  };

  const handleShowChecklist = () => {
    if (onShowChecklist) {
      onShowChecklist();
    }
  };

  // Configuração das ações do modal
  const primaryAction = {
    label: loading ? 'Carregando...' : 'Editar',
    onClick: handleEditClick,
    disabled: loading,
    icon: loading ? <CircularProgress size={16} /> : <EditIcon />
  };

  const secondaryAction = {
    label: 'Fechar',
    onClick: onClose,
    disabled: loading
  };

  const actions = [
    {
      label: 'Gerenciar Checklist',
      onClick: handleShowChecklist,
      variant: 'outlined',
      color: 'info',
      icon: <AssignmentIcon />,
      disabled: loading || !onShowChecklist
    }
  ];

  return (
    <>
      <StandardModal
        open={open}
        onClose={onClose}
        title={card.title || "Sem título"}
        subtitle={card.isBlocked ? "Cartão Bloqueado" : undefined}
        maxWidth="md"
        size="large"
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        actions={actions}
        closeOnBackdrop={!loading}
        closeOnEscape={!loading}
      >
        <Box sx={{ 
          borderLeft: card.priority > 0 ? '6px solid #f44336' : undefined,
          pl: card.priority > 0 ? 2 : 0,
          ml: card.priority > 0 ? -2 : 0
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {card.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Descrição
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {card.description}
                  </Typography>
                </Box>
              )}
              
              {card.isBlocked && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 3, 
                    bgcolor: alpha(theme.palette.error.light, 0.2),
                    color: theme.palette.error.main,
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BlockIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Cartão Bloqueado
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {card.blockReason || "Nenhum motivo especificado"}
                  </Typography>
                </Paper>
              )}
              
              {checklistItems.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Checklist ({completedItems}/{checklistItems.length})
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={handleShowChecklist}
                      startIcon={<CheckCircleIcon />}
                      disabled={!onShowChecklist}
                    >
                      Ver Completo
                    </Button>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    {checklistItems.slice(0, 3).map((item) => (
                      <Box 
                        key={item.id} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: item.checked ? alpha(theme.palette.success.light, 0.3) : alpha(theme.palette.background.paper, 0.5),
                          opacity: item.checked ? 0.8 : 1
                        }}
                      >
                        <CheckCircleIcon 
                          sx={{ 
                            mr: 1, 
                            color: item.checked ? 'success.main' : 'action.disabled'
                          }} 
                        />
                        <Typography 
                          variant="body2"
                          sx={{
                            textDecoration: item.checked ? 'line-through' : 'none'
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    ))}
                    
                    {checklistItems.length > 3 && (
                      <Button 
                        variant="text" 
                        size="small"
                        onClick={handleShowChecklist}
                        disabled={!onShowChecklist}
                      >
                        +{checklistItems.length - 3} mais itens
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
              
              {card.tags && card.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TagIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Tags
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {card.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        style={{
                          backgroundColor: tag.color || undefined,
                          color: tag.color ? '#fff' : undefined
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Informações do Cartão
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2
                }}>
                  {card.assignedUser && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Responsável
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CardAssigneeAvatar user={card.assignedUser} size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {card.assignedUser.name}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  
                  {hasDueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon 
                        sx={{ 
                          mr: 1, 
                          color: isPastDue ? 'error.main' : 'primary.main' 
                        }} 
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Data de Vencimento
                        </Typography>
                        <Typography 
                          variant="body2"
                          color={isPastDue ? 'error.main' : 'text.primary'}
                        >
                          {format(dueDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          {isPastDue && (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <WarningIcon fontSize="small" sx={{ mr: 0.5, color: 'error.main' }} />
                              Atrasado
                            </Box>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {card.priority > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon 
                        sx={{ 
                          mr: 1, 
                          color: card.priority === 2 ? 'error.main' : 'warning.main' 
                        }} 
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Prioridade
                        </Typography>
                        <Typography 
                          variant="body2"
                          color={card.priority === 2 ? 'error.main' : 'warning.main'}
                        >
                          {card.priority === 1 ? 'Alta' : 'Urgente'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {card.lane && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%',
                          bgcolor: card.lane.color || 'primary.main',
                          mr: 1 
                        }} 
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Coluna
                        </Typography>
                        <Typography variant="body2">
                          {card.lane.name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {(card.value > 0 || card.sku) && (
                    <Divider sx={{ my: 1 }} />
                  )}
                  
                  {card.value > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        Valor:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        R$ {card.value.toFixed(2).replace('.', ',')}
                      </Typography>
                    </Box>
                  )}
                  
                  {card.sku && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        SKU:
                      </Typography>
                      <Typography variant="body2">
                        {card.sku}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
              
              {(card.contact || card.ticket) && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Informações de Contato
                  </Typography>
                  
                  {card.contact && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: card.ticket ? 2 : 0
                    }}>
                      <Avatar 
                        src={card.contact.profilePicUrl} 
                        alt={card.contact.name} 
                        sx={{ mr: 1, width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography variant="body2">
                          {card.contact.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {card.contact.number}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {card.ticket && (
                    <Button
                      variant="outlined"
                      startIcon={<WhatsAppIcon />}
                      fullWidth
                      onClick={handleOpenTicket}
                      endIcon={<OpenInNewIcon />}
                      sx={{ mt: card.contact ? 1 : 0 }}
                    >
                      Abrir Conversa
                    </Button>
                  )}
                </Paper>
              )}
            </Grid>
          </Grid>

          {/* Seção de Exclusão */}
          {!confirmDelete ? (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                disabled={loading}
                variant="outlined"
              >
                Excluir Cartão
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteClick}
                  disabled={loading}
                  startIcon={<DeleteIcon />}
                >
                  Confirmar Exclusão
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelDelete}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </StandardModal>

      {/* Modal de Edição */}
      <StandardModal
        open={showEditModal}
        onClose={handleCloseEdit}
        title="Editar Cartão"
        maxWidth="md"
        size="large"
      >
        <CardForm
          card={card}
          onSubmit={handleEditSubmit}
          loading={loading}
          companyId={companyId}
        />
      </StandardModal>
    </>
  );
};

export default CardDetailsModal;