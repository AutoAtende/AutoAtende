import { useState, useEffect, useCallback } from 'react';
import { toast } from '../helpers/toast';
import api from '../services/api';
import KanbanTicketService from '../services/KanbanTicketService';

/**
 * Hook personalizado para gerenciar a integração entre Kanban e Tickets
 */
const useKanbanIntegration = (companyId) => {
  const [loading, setLoading] = useState(false);
  const [autoCreateEnabled, setAutoCreateEnabled] = useState(false);

  // Verificar configurações da integração automática
  const checkAutoCreateSettings = useCallback(async () => {
    try {
      const enabled = await KanbanTicketService.getAutoCreateSettings();
      setAutoCreateEnabled(enabled);
    } catch (error) {
      console.error('Erro ao verificar configurações:', error);
    }
  }, []);

  // Criar cartão automaticamente para um ticket
  const createCardFromTicket = useCallback(async (ticket, boardId = null, laneId = null) => {
    try {
      setLoading(true);
      
      // Verificar se já existe cartão para este ticket
      const existingCard = await KanbanTicketService.findCardByTicket(ticket.id);
      if (existingCard) {
        toast.info('Este ticket já possui um cartão Kanban');
        return existingCard;
      }

      const result = await KanbanTicketService.createCardFromTicket(
        ticket.id, 
        boardId, 
        laneId
      );
      
      toast.success('Cartão Kanban criado com sucesso!');
      return result.card;
    } catch (error) {
      console.error('Erro ao criar cartão do ticket:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar cartão Kanban');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar cartão baseado em mudanças do ticket
  const updateCardFromTicket = useCallback(async (ticket) => {
    try {
      await KanbanTicketService.updateCardFromTicket(ticket.id);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar cartão do ticket:', error);
      return false;
    }
  }, []);

  // Sincronizar status do ticket com a posição do cartão
  const syncTicketStatus = useCallback(async (cardId, laneId) => {
    try {
      await KanbanTicketService.syncTicketStatus(cardId, laneId);
      toast.success('Status sincronizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar status:', error);
      toast.error('Erro ao sincronizar status do ticket');
      return false;
    }
  }, []);

  // Criar cartões automaticamente para tickets existentes
  const autoCreateCardsForTickets = useCallback(async (queueId = null, status = ['pending', 'open'], boardId = null) => {
    try {
      setLoading(true);
      const result = await KanbanTicketService.autoCreateCardsForTickets(queueId, status, boardId);
      toast.success(`${result.createdCount} cartões criados automaticamente`);
      return result;
    } catch (error) {
      console.error('Erro na criação automática:', error);
      toast.error('Erro na criação automática de cartões');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Processar tickets importados
  const processImportedTickets = useCallback(async () => {
    try {
      setLoading(true);
      const result = await KanbanTicketService.processImportedTickets();
      toast.success(`${result.processedCount} tickets importados processados`);
      return result;
    } catch (error) {
      console.error('Erro ao processar tickets importados:', error);
      toast.error('Erro ao processar tickets importados');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Configurar criação automática
  const toggleAutoCreate = useCallback(async (enabled) => {
    try {
      setLoading(true);
      await KanbanTicketService.setAutoCreateSettings(enabled);
      setAutoCreateEnabled(enabled);
      toast.success(`Criação automática ${enabled ? 'ativada' : 'desativada'}`);
      return true;
    } catch (error) {
      console.error('Erro ao configurar criação automática:', error);
      toast.error('Erro ao alterar configuração');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Arquivar cartão quando ticket é fechado
  const archiveCardFromTicket = useCallback(async (ticketId) => {
    try {
      await KanbanTicketService.archiveCardFromTicket(ticketId);
      return true;
    } catch (error) {
      console.error('Erro ao arquivar cartão:', error);
      return false;
    }
  }, []);

  // Buscar cartão associado ao ticket
  const findCardByTicket = useCallback(async (ticketId) => {
    try {
      return await KanbanTicketService.findCardByTicket(ticketId);
    } catch (error) {
      console.error('Erro ao buscar cartão do ticket:', error);
      return null;
    }
  }, []);

  // Event handlers para eventos de ticket
  const createTicketEventHandlers = useCallback(() => {
    const handleTicketCreated = async (ticket) => {
      if (autoCreateEnabled && ['pending', 'open'].includes(ticket.status)) {
        try {
          await createCardFromTicket(ticket);
        } catch (error) {
          // Log do erro já é feito na função createCardFromTicket
        }
      }
    };

    const handleTicketUpdated = async (ticket) => {
      await updateCardFromTicket(ticket);
    };

    const handleTicketClosed = async (ticket) => {
      await archiveCardFromTicket(ticket.id);
    };

    const handleCardMoved = async (cardId, newLaneId) => {
      await syncTicketStatus(cardId, newLaneId);
    };

    return {
      handleTicketCreated,
      handleTicketUpdated,
      handleTicketClosed,
      handleCardMoved
    };
  }, [autoCreateEnabled, createCardFromTicket, updateCardFromTicket, archiveCardFromTicket, syncTicketStatus]);

  // Carregar configurações ao inicializar
  useEffect(() => {
    if (companyId) {
      checkAutoCreateSettings();
    }
  }, [companyId, checkAutoCreateSettings]);

  return {
    loading,
    autoCreateEnabled,
    
    // Funções principais
    createCardFromTicket,
    updateCardFromTicket,
    syncTicketStatus,
    autoCreateCardsForTickets,
    processImportedTickets,
    toggleAutoCreate,
    archiveCardFromTicket,
    findCardByTicket,
    
    // Event handlers
    createTicketEventHandlers,
    
    // Funções auxiliares
    checkAutoCreateSettings
  };
};

export default useKanbanIntegration;