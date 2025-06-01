import { Op } from 'sequelize';
import Ticket from '../../models/Ticket';
import KanbanCard from '../../models/KanbanCard';
import KanbanBoard from '../../models/KanbanBoard';
import KanbanLane from '../../models/KanbanLane';
import Contact from '../../models/Contact';
import User from '../../models/User';
import { getIO } from '../../libs/socket';
import { logger } from '../../utils/logger';

interface CreateCardFromTicketData {
  ticketId: number;
  boardId?: number;
  laneId?: number;
  companyId: number;
  userId?: number;
}

interface AutoCreateCardOptions {
  companyId: number;
  queueId?: number;
  status?: string[];
  boardId?: number;
}

class KanbanTicketIntegrationService {
  
  /**
   * Cria um cartão Kanban automaticamente a partir de um ticket
   */
  static async createCardFromTicket({
    ticketId,
    boardId,
    laneId,
    companyId,
    userId
  }: CreateCardFromTicketData): Promise<KanbanCard> {
    try {
      // Buscar o ticket com relacionamentos
      const ticket = await Ticket.findOne({
        where: { 
          id: ticketId,
          companyId 
        },
        include: [
          {
            model: Contact,
            as: 'contact',
            attributes: ['id', 'name', 'number', 'profilePicUrl']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'color']
          }
        ]
      });

      if (!ticket) {
        throw new Error('Ticket não encontrado');
      }

      // Verificar se já existe cartão para este ticket
      const existingCard = await KanbanCard.findOne({
        where: { 
          ticketId,
          isArchived: false
        }
      });

      if (existingCard) {
        logger.info(`Cartão já existe para ticket ${ticketId}: ${existingCard.id}`);
        return existingCard;
      }

      // Determinar o quadro e lane
      let targetBoardId = boardId;
      let targetLaneId = laneId;

      if (!targetBoardId) {
        // Buscar quadro padrão da empresa
        const defaultBoard = await KanbanBoard.findOne({
          where: {
            companyId,
            isDefault: true,
            active: true
          }
        });

        if (!defaultBoard) {
          throw new Error('Nenhum quadro Kanban padrão encontrado');
        }
        
        targetBoardId = defaultBoard.id;
      }

      if (!targetLaneId) {
        // Buscar primeira lane ativa do quadro
        const firstLane = await KanbanLane.findOne({
          where: {
            boardId: targetBoardId,
            active: true
          },
          order: [['position', 'ASC']]
        });

        if (!firstLane) {
          throw new Error('Nenhuma coluna ativa encontrada no quadro');
        }

        targetLaneId = firstLane.id;
      }

      // Determinar título e prioridade baseado no ticket
      const title = ticket.contact?.name 
        ? `${ticket.contact.name} - Ticket #${ticket.id}`
        : `Ticket #${ticket.id}`;

      let priority = 0;
      if (ticket.status === 'pending') priority = 1;
      if (ticket.unreadMessages > 10) priority = 2;

      // Criar o cartão
      const card = await KanbanCard.create({
        title,
        description: `Ticket criado automaticamente\nStatus: ${ticket.status}\nMensagens não lidas: ${ticket.unreadMessages}`,
        priority,
        laneId: targetLaneId,
        contactId: ticket.contactId,
        ticketId: ticket.id,
        assignedUserId: ticket.userId || userId,
        value: ticket.value || 0,
        sku: ticket.sku,
        startedAt: new Date()
      });

      // Recarregar com relacionamentos
      const createdCard = await KanbanCard.findByPk(card.id, {
        include: [
          {
            model: Contact,
            as: 'contact'
          },
          {
            model: Ticket,
            as: 'ticket'
          },
          {
            model: User,
            as: 'assignedUser'
          }
        ]
      });

      // Emitir evento via WebSocket
      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
        action: 'create-card-from-ticket',
        card: createdCard,
        ticketId
      });

      logger.info(`Cartão Kanban criado automaticamente para ticket ${ticketId}: ${card.id}`);
      
      return createdCard;

    } catch (error) {
      logger.error('Erro ao criar cartão a partir do ticket:', error);
      throw error;
    }
  }

  /**
   * Sincroniza status do ticket com posição do cartão no Kanban
   */
  static async syncTicketStatus(cardId: number, newLaneId: number, companyId: number): Promise<void> {
    try {
      const card = await KanbanCard.findOne({
        where: { 
          id: cardId 
        },
        include: [
          {
            model: KanbanLane,
            as: 'lane'
          },
          {
            model: Ticket,
            as: 'ticket'
          }
        ]
      });

      if (!card || !card.ticketId) {
        return;
      }

      const newLane = await KanbanLane.findByPk(newLaneId);
      if (!newLane) {
        throw new Error('Nova lane não encontrada');
      }

      // Mapear lane para status do ticket
      let newTicketStatus = card.ticket.status;
      
      // Regras de mapeamento (configuráveis por empresa)
      const laneStatusMapping = {
        'Pendente': 'pending',
        'Em Atendimento': 'open', 
        'Em Progresso': 'open',
        'Aguardando Cliente': 'pending',
        'Resolvido': 'closed',
        'Finalizado': 'closed',
        'Concluído': 'closed'
      };

      if (laneStatusMapping[newLane.name]) {
        newTicketStatus = laneStatusMapping[newLane.name];
      }

      // Atualizar ticket se status mudou
      if (newTicketStatus !== card.ticket.status) {
        await card.ticket.update({
          status: newTicketStatus
        });

        logger.info(`Status do ticket ${card.ticketId} atualizado para ${newTicketStatus} via Kanban`);

        // Emitir evento de atualização do ticket
        const io = getIO();
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-ticket`, {
          action: 'update-from-kanban',
          ticket: card.ticket,
          cardId
        });
      }

    } catch (error) {
      logger.error('Erro ao sincronizar status do ticket:', error);
      throw error;
    }
  }

  /**
   * Cria cartões automaticamente para tickets sem cartão
   */
  static async autoCreateCardsForTickets(options: AutoCreateCardOptions): Promise<number> {
    try {
      const { companyId, queueId, status = ['pending', 'open'], boardId } = options;

      // Buscar tickets sem cartão associado
      const whereClause: any = {
        companyId,
        status: { [Op.in]: status }
      };

      if (queueId) {
        whereClause.queueId = queueId;
      }

      const ticketsWithoutCards = await Ticket.findAll({
        where: whereClause,
        include: [
          {
            model: Contact,
            as: 'contact'
          }
        ],
        // Subquery para excluir tickets que já têm cartão
        having: Ticket.sequelize.literal(`
          NOT EXISTS (
            SELECT 1 FROM "KanbanCards" 
            WHERE "KanbanCards"."ticketId" = "Ticket"."id" 
            AND "KanbanCards"."isArchived" = false
          )
        `)
      });

      let createdCount = 0;

      for (const ticket of ticketsWithoutCards) {
        try {
          await this.createCardFromTicket({
            ticketId: ticket.id,
            boardId,
            companyId,
            userId: ticket.userId
          });
          createdCount++;
        } catch (error) {
          logger.error(`Erro ao criar cartão para ticket ${ticket.id}:`, error);
        }
      }

      logger.info(`Criados ${createdCount} cartões automaticamente para tickets`);
      
      return createdCount;

    } catch (error) {
      logger.error('Erro na criação automática de cartões:', error);
      throw error;
    }
  }

  /**
   * Atualiza cartão quando ticket é modificado
   */
  static async updateCardFromTicket(ticketId: number, companyId: number): Promise<void> {
    try {
      const ticket = await Ticket.findOne({
        where: { 
          id: ticketId,
          companyId 
        },
        include: [
          {
            model: Contact,
            as: 'contact'
          },
          {
            model: User,
            as: 'user'
          }
        ]
      });

      if (!ticket) {
        return;
      }

      const card = await KanbanCard.findOne({
        where: { 
          ticketId,
          isArchived: false
        }
      });

      if (!card) {
        return;
      }

      // Atualizar dados do cartão baseado no ticket
      const updates: any = {
        assignedUserId: ticket.userId,
        value: ticket.value || 0,
        sku: ticket.sku
      };

      // Atualizar prioridade baseada em regras de negócio
      if (ticket.unreadMessages > 10) {
        updates.priority = 2;
      } else if (ticket.status === 'pending') {
        updates.priority = 1;
      } else {
        updates.priority = 0;
      }

      await card.update(updates);

      // Emitir evento de atualização
      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
        action: 'update-card-from-ticket',
        card,
        ticketId
      });

      logger.info(`Cartão ${card.id} atualizado a partir do ticket ${ticketId}`);

    } catch (error) {
      logger.error('Erro ao atualizar cartão a partir do ticket:', error);
      throw error;
    }
  }

  /**
   * Remove/arquiva cartão quando ticket é fechado definitivamente
   */
  static async archiveCardFromTicket(ticketId: number): Promise<void> {
    try {
      const card = await KanbanCard.findOne({
        where: { 
          ticketId,
          isArchived: false
        }
      });

      if (card) {
        await card.update({ 
          isArchived: true,
          completedAt: new Date()
        });

        logger.info(`Cartão ${card.id} arquivado devido ao fechamento do ticket ${ticketId}`);
      }

    } catch (error) {
      logger.error('Erro ao arquivar cartão:', error);
      throw error;
    }
  }
}

export default KanbanTicketIntegrationService;