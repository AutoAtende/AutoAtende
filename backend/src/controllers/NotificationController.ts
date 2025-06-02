import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";
import Message from "../models/Message";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { Op } from "sequelize";
import { GetUserQueuesService } from "../services/UserServices/GetUserQueuesService";


/**
 * Marca todas as mensagens não lidas do usuário como lidas
 */
export const clearNotifications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;

  const queues = await GetUserQueuesService({
    userId: Number(userId),
    companyId
  });

  try {
    logger.info(`Limpando notificações para usuário ${userId} da empresa ${companyId}`);

    // Buscar tickets com mensagens não lidas baseado no perfil do usuário
    let whereCondition: any = {
      companyId,
      unreadMessages: { [Op.gt]: 0 }
    };

    // Aplicar filtros baseados no perfil do usuário
    if (profile === "user") {
      const userQueueIds = queues.queues.map(queue => queue.id);
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userId },
          { 
            status: "pending",
            queueId: { [Op.in]: userQueueIds }
          }
        ]
      };
    } else if (profile === "admin" || profile === "superv") {
      // Admin e supervisor podem ver todos os tickets da empresa
      // Não adiciona filtros extras
    }

    // Buscar todos os tickets que atendem aos critérios
    const tickets = await Ticket.findAll({
      where: whereCondition,
      attributes: ['id', 'unreadMessages']
    });

    if (tickets.length === 0) {
      logger.info(`Nenhum ticket com mensagens não lidas encontrado para usuário ${userId}`);
      return res.status(200).json({ 
        message: "Nenhuma notificação para limpar",
        clearedTickets: 0
      });
    }

    const ticketIds = tickets.map(ticket => ticket.id);
    
    // Atualizar todos os tickets para marcar mensagens como lidas
    const [updatedCount] = await Ticket.update(
      { unreadMessages: 0 },
      { 
        where: { 
          id: { [Op.in]: ticketIds },
          companyId 
        } 
      }
    );

    // Emitir evento via socket para todos os clientes conectados da empresa
    const io = getIO();
    io.to(`company-${companyId}`).emit(`company-${companyId}-ticket`, {
      action: "clearNotifications",
      ticketIds: ticketIds,
      userId: userId,
      timestamp: new Date()
    });

    logger.info(`${updatedCount} tickets tiveram suas notificações limpas pelo usuário ${userId}`);

    return res.status(200).json({ 
      message: "Notificações limpas com sucesso",
      clearedTickets: updatedCount,
      ticketIds: ticketIds
    });

  } catch (error) {
    logger.error(`Erro ao limpar notificações para usuário ${userId}:`, error);
    return res.status(500).json({ 
      error: "Erro interno do servidor ao limpar notificações",
      message: error.message 
    });
  }
};

/**
 * Marca mensagens de um ticket específico como lidas
 */
export const markTicketAsRead = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId, id: userId } = req.user;

  try {
    if (!ticketId || isNaN(Number(ticketId))) {
      throw new AppError("ID do ticket inválido", 400);
    }

    logger.info(`Marcando ticket ${ticketId} como lido pelo usuário ${userId}`);

    // Verificar se o ticket existe e pertence à empresa
    const ticket = await Ticket.findOne({
      where: { 
        id: Number(ticketId), 
        companyId 
      }
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Atualizar o ticket para marcar mensagens como lidas
    await ticket.update({ unreadMessages: 0 });

    // Emitir evento via socket
    const io = getIO();
    io.to(`company-${companyId}`).emit(`company-${companyId}-ticket`, {
      action: "updateUnread",
      ticketId: Number(ticketId),
      userId: userId,
      timestamp: new Date()
    });

    logger.info(`Ticket ${ticketId} marcado como lido pelo usuário ${userId}`);

    return res.status(200).json({ 
      message: "Ticket marcado como lido",
      ticketId: Number(ticketId)
    });

  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao marcar ticket ${ticketId} como lido:`, error);
    return res.status(500).json({ 
      error: "Erro interno do servidor",
      message: error.message 
    });
  }
};

/**
 * Busca contagem de notificações não lidas para o usuário
 */
export const getNotificationCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;

  const queues = await GetUserQueuesService({
    userId: Number(userId),
    companyId
  });

  try {
    let whereCondition: any = {
      companyId,
      unreadMessages: { [Op.gt]: 0 }
    };

    // Aplicar filtros baseados no perfil do usuário
    if (profile === "user") {
      const userQueueIds = queues.queues.map((queue: any) => queue.id);
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userId },
          { 
            status: "pending",
            queueId: { [Op.in]: userQueueIds }
          }
        ]
      };
    }

    const count = await Ticket.count({
      where: whereCondition
    });

    return res.status(200).json({ 
      count,
      userId,
      companyId
    });

  } catch (error) {
    logger.error(`Erro ao buscar contagem de notificações para usuário ${userId}:`, error);
    return res.status(500).json({ 
      error: "Erro interno do servidor",
      message: error.message 
    });
  }
};

/**
 * Busca histórico de notificações (últimas 50)
 */
export const getNotificationHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;

  const queues = await GetUserQueuesService({
    userId: Number(userId),
    companyId
  });

  const { limit = 50, offset = 0 } = req.query;

  try {
    let whereCondition: any = {
      companyId
    };

    // Aplicar filtros baseados no perfil do usuário
    if (profile === "user") {
      const userQueueIds = queues.queues.map((queue: any) => queue.id);
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userId },
          { 
            status: "pending",
            queueId: { [Op.in]: userQueueIds }
          }
        ]
      };
    }

    const tickets = await Ticket.findAll({
      where: whereCondition,
      limit: Number(limit),
      offset: Number(offset),
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'body', 'fromMe', 'createdAt']
        }
      ]
    });

    return res.status(200).json({ 
      tickets,
      count: tickets.length,
      userId,
      companyId
    });

  } catch (error) {
    logger.error(`Erro ao buscar histórico de notificações para usuário ${userId}:`, error);
    return res.status(500).json({ 
      error: "Erro interno do servidor",
      message: error.message 
    });
  }
};