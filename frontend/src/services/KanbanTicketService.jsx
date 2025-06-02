// services/KanbanTicketService.js
import api from './api';
import { toast } from '../helpers/toast';

class KanbanTicketService {
  /**
   * Cria um cartão Kanban automaticamente para um ticket
   */
  static async createCardFromTicket(ticketId, boardId = null, laneId = null) {
    try {
      const { data } = await api.request({
        url: '/kanban/tickets/create-card',
        method: 'post',
        data: {
          ticketId,
          boardId,
          laneId
        }
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar cartão do ticket:', error);
      throw error;
    }
  }

  /**
   * Atualiza um cartão Kanban baseado nas mudanças do ticket
   */
  static async updateCardFromTicket(ticketId) {
    try {
      const { data } = await api.request({
        url: `/kanban/tickets/${ticketId}/update-card`,
        method: 'put'
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar cartão do ticket:', error);
      throw error;
    }
  }

  /**
   * Sincroniza o status do ticket com a posição do cartão no Kanban
   */
  static async syncTicketStatus(cardId, laneId) {
    try {
      const { data } = await api.request({
        url: `/kanban/tickets/${cardId}/sync`,
        method: 'post',
        data: { laneId }
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao sincronizar status do ticket:', error);
      throw error;
    }
  }

  /**
   * Cria cartões automaticamente para tickets sem cartão associado
   */
  static async autoCreateCardsForTickets(queueId = null, status = ['pending', 'open'], boardId = null) {
    try {
      const { data } = await api.request({
        url: '/kanban/tickets/auto-create',
        method: 'post',
        data: {
          queueId,
          status,
          boardId
        }
      });
      
      return data;
    } catch (error) {
      console.error('Erro na criação automática de cartões:', error);
      throw error;
    }
  }

  /**
   * Processa tickets importados para integração com Kanban
   */
  static async processImportedTickets() {
    try {
      const { data } = await api.request({
        url: '/kanban/tickets/process-imported',
        method: 'post'
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao processar tickets importados:', error);
      throw error;
    }
  }

  /**
   * Arquiva um cartão quando o ticket é fechado
   */
  static async archiveCardFromTicket(ticketId) {
    try {
      const { data } = await api.request({
        url: `/kanban/tickets/${ticketId}/archive-card`,
        method: 'delete'
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao arquivar cartão do ticket:', error);
      throw error;
    }
  }

  /**
   * Busca cartão Kanban associado a um ticket
   */
  static async findCardByTicket(ticketId) {
    try {
      const { data } = await api.request({
        url: '/kanban/cards',
        method: 'get',
        params: { ticketId }
      });
      
      return data.cards && data.cards.length > 0 ? data.cards[0] : null;
    } catch (error) {
      console.error('Erro ao buscar cartão do ticket:', error);
      return null;
    }
  }

  /**
   * Configurações da integração automática
   */
  static async getAutoCreateSettings() {
    try {
      const { data } = await api.request({
        url: '/settings/kanbanAutoCreateCards',
        method: 'get'
      });
      
      return data.value === 'enabled';
    } catch (error) {
      return false;
    }
  }

  static async setAutoCreateSettings(enabled) {
    try {
      const { data } = await api.request({
        url: '/settings/kanbanAutoCreateCards',
        method: 'post',
        data: {
          value: enabled ? 'enabled' : 'disabled'
        }
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao configurar criação automática:', error);
      throw error;
    }
  }

  /**
   * Hook para eventos de ticket (para usar em componentes)
   */
  static createTicketEventHandler() {
    const handleTicketCreated = async (ticket) => {
      const autoCreateEnabled = await this.getAutoCreateSettings();
      
      if (autoCreateEnabled && ['pending', 'open'].includes(ticket.status)) {
        try {
          await this.createCardFromTicket(ticket.id);
          toast.success('Cartão Kanban criado automaticamente para o ticket');
        } catch (error) {
          console.error('Erro na criação automática do cartão:', error);
        }
      }
    };

    const handleTicketUpdated = async (ticket) => {
      try {
        await this.updateCardFromTicket(ticket.id);
      } catch (error) {
        console.error('Erro ao atualizar cartão do ticket:', error);
      }
    };

    const handleTicketClosed = async (ticket) => {
      try {
        await this.archiveCardFromTicket(ticket.id);
      } catch (error) {
        console.error('Erro ao arquivar cartão do ticket:', error);
      }
    };

    return {
      handleTicketCreated,
      handleTicketUpdated,
      handleTicketClosed
    };
  }
}

export default KanbanTicketService;