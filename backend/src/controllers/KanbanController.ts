import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import { Op } from "sequelize";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import User from "../models/User";
import Queue from "../models/Queue";
import Tag from "../models/Tag";
import Company from "../models/Company";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

interface KanbanQuery {
  queueId?: string;
  searchParam?: string;
  users?: string;
  dateFrom?: string;
  dateTo?: string;
  showClosed?: string;
}

interface KanbanLane {
  id: string;
  name: string;
  color: string;
  status: string;
  tickets: any[];
  canReceiveTickets: boolean;
  queueId?: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    queueId,
    searchParam,
    users,
    dateFrom,
    dateTo,
    showClosed = "false"
  } = req.query as KanbanQuery;
  
  const { companyId } = req.user;

  try {
    // Montar condições do filtro
    const whereCondition: any = {
      companyId
    };

    // Filtrar por fila específica
    if (queueId && queueId !== '') {
      whereCondition.queueId = Number(queueId);
    }

    // Filtrar por usuários
    if (users) {
      try {
        const userIds = JSON.parse(users);
        if (Array.isArray(userIds) && userIds.length > 0) {
          whereCondition.userId = { [Op.in]: userIds };
        }
      } catch (error) {
        logger.error('Erro ao parsear usuários:', error);
      }
    }

    // Filtrar por período
    if (dateFrom && dateTo) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    // Filtrar por status baseado no showClosed
    if (showClosed === "true") {
      whereCondition.status = "closed";
    } else {
      whereCondition.status = { [Op.in]: ["pending", "open"] };
    }

    // Buscar por termo
    let includeCondition: any[] = [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "email", "profilePicUrl"],
        required: false
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "color", "profilePic"],
        required: false
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"],
        required: false
      },
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"],
        through: { attributes: [] },
        required: false
      }
    ];

    if (searchParam) {
      const searchCondition = {
        [Op.or]: [
          { "$contact.name$": { [Op.iLike]: `%${searchParam}%` } },
          { "$contact.number$": { [Op.like]: `%${searchParam}%` } },
          { lastMessage: { [Op.iLike]: `%${searchParam}%` } },
          { id: isNaN(Number(searchParam)) ? 0 : Number(searchParam) }
        ]
      };
      
      Object.assign(whereCondition, searchCondition);
    }

    // Buscar tickets
    const tickets = await Ticket.findAll({
      where: whereCondition,
      include: includeCondition,
      order: [["updatedAt", "DESC"]],
      limit: 1000 // Limitar para performance
    });

    // Buscar filas da empresa para lanes customizadas
    const queues = await Queue.findAll({
      where: { companyId },
      attributes: ["id", "name", "color"],
      order: [["name", "ASC"]]
    });

    // Criar lanes do Kanban
    const lanes: KanbanLane[] = [];

    // Lanes fixas por status
    if (showClosed === "true") {
      // Modo fechados - apenas uma lane
      lanes.push({
        id: "closed",
        name: "Tickets Encerrados",
        color: "#2ecc71",
        status: "closed",
        tickets: tickets.filter(t => t.status === "closed"),
        canReceiveTickets: false
      });
    } else {
      // Modo ativos - lanes por status
      lanes.push({
        id: "pending",
        name: "Aguardando Atendimento",
        color: "#f39c12",
        status: "pending",
        tickets: tickets.filter(t => t.status === "pending"),
        canReceiveTickets: true
      });

      lanes.push({
        id: "open",
        name: "Em Atendimento",
        color: "#3498db",
        status: "open",
        tickets: tickets.filter(t => t.status === "open"),
        canReceiveTickets: true
      });

      // Se uma fila específica foi selecionada, adicionar lane personalizada
      if (queueId && queueId !== '') {
        const selectedQueue = queues.find(q => q.id === Number(queueId));
        if (selectedQueue) {
          // Criar uma lane específica para a fila selecionada
          const queueTickets = tickets.filter(t => t.queueId === selectedQueue.id);
          
          // Remover tickets desta fila das lanes de status
          lanes.forEach(lane => {
            lane.tickets = lane.tickets.filter(t => t.queueId !== selectedQueue.id);
          });

          // Adicionar lane da fila
          lanes.push({
            id: `queue-${selectedQueue.id}`,
            name: selectedQueue.name,
            color: selectedQueue.color || "#9b59b6",
            status: "queue-specific",
            queueId: selectedQueue.id,
            tickets: queueTickets,
            canReceiveTickets: true
          });
        }
      }
    }

    // Formatar dados dos tickets para o frontend
    const formattedLanes = lanes.map(lane => ({
      ...lane,
      tickets: lane.tickets.map(ticket => ({
        id: ticket.id,
        uuid: ticket.uuid,
        status: ticket.status,
        name: ticket.name || `Ticket #${ticket.id}`,
        lastMessage: ticket.lastMessage || "",
        unreadMessages: ticket.unreadMessages || 0,
        value: ticket.value || 0,
        sku: ticket.sku || "",
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        contact: ticket.contact ? {
          id: ticket.contact.id,
          name: ticket.contact.name,
          number: ticket.contact.number,
          profilePicUrl: ticket.contact.profilePicUrl
        } : null,
        user: ticket.user ? {
          id: ticket.user.id,
          name: ticket.user.name,
          email: ticket.user.email,
          color: ticket.user.color,
          profilePic: ticket.user.profilePic
        } : null,
        queue: ticket.queue ? {
          id: ticket.queue.id,
          name: ticket.queue.name,
          color: ticket.queue.color
        } : null,
        tags: ticket.tags ? ticket.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color
        })) : []
      }))
    }));

    return res.status(200).json({
      lanes: formattedLanes,
      queues: queues.map(q => ({
        id: q.id,
        name: q.name,
        color: q.color
      }))
    });

  } catch (error) {
    logger.error("Erro ao buscar dados do Kanban:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const moveTicket = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { targetLaneId, sourceLaneId, position } = req.body;
  const { companyId, id: userCurrentId } = req.user;

  try {
    if (!targetLaneId) {
      throw new AppError("Lane de destino é obrigatória", 400);
    }

    // Buscar o ticket
    const ticket = await Ticket.findOne({
      where: { id: Number(ticketId), companyId },
      include: [
        { model: Contact, as: "contact" },
        { model: User, as: "user" },
        { model: Queue, as: "queue" }
      ]
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    let newStatus = ticket.status;
    let newQueueId = ticket.queueId;
    let newUserId = ticket.userId;

    logger.info(`Movendo ticket ${ticketId} de ${sourceLaneId} para ${targetLaneId}`);

    // Definir mudanças baseadas na lane de destino
    if (targetLaneId === "pending") {
      newStatus = "pending";
      // Manter o usuário atual, mas permitir que seja nulo
    } else if (targetLaneId === "open") {
      newStatus = "open";
      // Se não tem usuário, atribuir para quem está movendo
      if (!ticket.userId) {
        newUserId = Number(userCurrentId);
      }
    } else if (targetLaneId === "closed") {
      newStatus = "closed";
      // Manter o usuário atual ou definir quem fechou
      newUserId = Number(ticket.userId || userCurrentId);
    } else if (targetLaneId.startsWith("queue-")) {
      // Lane de fila específica
      const queueId = Number(targetLaneId.replace("queue-", ""));
      
      // Verificar se a fila existe
      const queue = await Queue.findOne({
        where: { id: queueId, companyId }
      });

      if (!queue) {
        throw new AppError("Fila não encontrada", 404);
      }

      newQueueId = queueId;
      // Manter status atual ou definir como open se estava pending
      if (ticket.status === "pending") {
        newStatus = "open";
        // Se não tem usuário, atribuir para quem está movendo
        if (!ticket.userId) {
          newUserId = Number(userCurrentId);
        }
      }
    }

    // Verificar se houve mudanças
    const hasChanges = newStatus !== ticket.status || 
                      newQueueId !== ticket.queueId || 
                      newUserId !== ticket.userId;

    if (!hasChanges) {
      return res.status(200).json({
        success: true,
        message: "Ticket já está na posição correta",
        ticket: {
          id: ticket.id,
          status: ticket.status,
          queueId: ticket.queueId,
          userId: ticket.userId
        }
      });
    }

    // Atualizar o ticket usando o serviço existente
    const updatedTicket = await UpdateTicketService({
      ticketId: ticket.id,
      ticketData: {
        status: newStatus,
        queueId: newQueueId,
        userId: newUserId,
        unreadMessages: 0 // Marcar como lido quando movido
      },
      companyId,
      userCurrentId: Number(userCurrentId)
    });

    // Emitir evento via socket
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "move-ticket",
      ticketId: Number(ticketId),
      targetLaneId,
      sourceLaneId,
      oldStatus: ticket.status,
      newStatus,
      userId: newUserId,
      queueId: newQueueId
    });

    logger.info(`Ticket ${ticketId} movido com sucesso de ${ticket.status} para ${newStatus}`);

    return res.status(200).json({
      success: true,
      message: "Ticket movido com sucesso",
      ticket: {
        id: ticket.id,
        status: newStatus,
        queueId: newQueueId,
        userId: newUserId
      }
    });

  } catch (error) {
    logger.error("Erro ao mover ticket:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const assignUser = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { userId } = req.body;
  const { companyId, id: userCurrentId } = req.user;

  try {
    // Buscar o ticket
    const ticket = await Ticket.findOne({
      where: { id: Number(ticketId), companyId },
      include: [
        { model: User, as: "user" },
        { model: Queue, as: "queue" }
      ]
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Verificar se o ticket está em status que permite atribuição
    if (ticket.status === "closed") {
      throw new AppError("Não é possível atribuir usuário a ticket fechado", 400);
    }

    // Verificar se o usuário existe (se userId foi fornecido)
    if (userId) {
      const userExists = await User.findOne({
        where: { id: Number(userId), companyId }
      });

      if (!userExists) {
        throw new AppError("Usuário não encontrado", 404);
      }
    }

    // Se está atribuindo usuário, ticket deve ir para "open"
    // Se está removendo usuário, ticket vai para "pending"
    const newStatus = userId ? "open" : "pending";
    const newUserId = userId ? Number(userId) : null;

    await UpdateTicketService({
      ticketId: ticket.id,
      ticketData: {
        userId: newUserId,
        status: newStatus
      },
      companyId,
      userCurrentId: Number(userCurrentId)
    });

    // Emitir evento via socket
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "assign-user",
      ticketId: Number(ticketId),
      userId: newUserId,
      status: newStatus
    });

    logger.info(`Usuário ${userId ? `${userId} atribuído` : 'removido'} do ticket ${ticketId}`);

    return res.status(200).json({
      success: true,
      message: userId ? "Usuário atribuído com sucesso" : "Usuário removido com sucesso"
    });

  } catch (error) {
    logger.error("Erro ao atribuir usuário:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getStats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { queueId } = req.query;

  try {
    const whereCondition: any = { companyId };
    
    if (queueId && queueId !== '') {
      whereCondition.queueId = Number(queueId);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCount, openCount, closedTodayCount, totalActiveCount] = await Promise.all([
      Ticket.count({ where: { ...whereCondition, status: "pending" } }),
      Ticket.count({ where: { ...whereCondition, status: "open" } }),
      Ticket.count({
        where: {
          ...whereCondition,
          status: "closed",
          updatedAt: {
            [Op.gte]: today
          }
        }
      }),
      Ticket.count({ 
        where: { 
          ...whereCondition, 
          status: { [Op.in]: ["pending", "open"] } 
        } 
      })
    ]);

    return res.status(200).json({
      pending: pendingCount,
      open: openCount,
      closedToday: closedTodayCount,
      total: totalActiveCount
    });

  } catch (error) {
    logger.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export default {
  index,
  moveTicket,
  assignUser,
  getStats
};