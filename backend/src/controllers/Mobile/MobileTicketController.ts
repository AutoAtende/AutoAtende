import { Request, Response } from "express";
import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";

// Mobile-optimized ticket listing with pagination and filtering
export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;
    const {
      pageNumber = 1,
      limit = 20,
      status,
      queueIds,
      userId,
      searchParam,
      withUnreadMessages,
      sortBy = 'updatedAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (Number(pageNumber) - 1) * Number(limit);

    // Build where conditions
    let whereCondition: any = {
      companyId,
    };

    if (status) {
      whereCondition.status = status;
    }

    if (queueIds) {
      const queueIdArray = String(queueIds).split(',').map(Number);
      whereCondition.queueId = { [Op.in]: queueIdArray };
    }

    if (userId) {
      whereCondition.userId = Number(userId);
    }

    if (withUnreadMessages === 'true') {
      whereCondition.unreadMessages = { [Op.gt]: 0 };
    }

    // Search functionality
    if (searchParam) {
      whereCondition[Op.or] = [
        { '$contact.name$': { [Op.iLike]: `%${searchParam}%` } },
        { '$contact.number$': { [Op.iLike]: `%${searchParam}%` } },
        { lastMessage: { [Op.iLike]: `%${searchParam}%` } }
      ];
    }

    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'name', 'number', 'email', 'profilePicUrl', 'isGroup']
        },
        {
          model: User,
          as: "user",
          attributes: ['id', 'name', 'profile']
        },
        {
          model: Queue,
          as: "queue",
          attributes: ['id', 'name', 'color']
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ['id', 'name', 'status']
        }
      ],
      limit: Number(limit),
      offset,
      order: [[sortBy as string, sortOrder as string]],
      subQuery: false
    });

    const hasMore = offset + tickets.length < count;

    return res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: Number(pageNumber),
          totalPages: Math.ceil(count / Number(limit)),
          totalItems: count,
          hasMore,
          limit: Number(limit)
        }
      }
    });

  } catch (error) {
    logger.error("Error in mobile ticket index:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get single ticket with full details
export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user!;

    const ticket = await Ticket.findOne({
      where: {
        id: Number(ticketId),
        companyId
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'name', 'number', 'email', 'profilePicUrl', 'isGroup']
        },
        {
          model: User,
          as: "user",
          attributes: ['id', 'name', 'profile', 'email']
        },
        {
          model: Queue,
          as: "queue",
          attributes: ['id', 'name', 'color', 'greetingMessage']
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ['id', 'name', 'status', 'number']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    // Get recent messages count
    const messageCount = await Message.count({
      where: { ticketId: ticket.id }
    });

    return res.json({
      success: true,
      data: {
        ...ticket.toJSON(),
        messageCount
      }
    });

  } catch (error) {
    logger.error("Error in mobile ticket show:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Mobile-optimized ticket update
export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId, id: userId } = req.user!;
    const updateData = req.body;

    const ticket = await Ticket.findOne({
      where: {
        id: Number(ticketId),
        companyId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    // Update ticket
    await ticket.update({
      ...updateData,
      userId: updateData.userId || userId
    });

    // Get updated ticket with relations
    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: User,
          as: "user",
          attributes: ['id', 'name', 'profile']
        },
        {
          model: Queue,
          as: "queue",
          attributes: ['id', 'name', 'color']
        }
      ]
    });

    return res.json({
      success: true,
      data: updatedTicket
    });

  } catch (error) {
    logger.error("Error in mobile ticket update:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get recent tickets for quick access
export const getRecentTickets = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user!;
    const limit = 10;

    const tickets = await Ticket.findAll({
      where: {
        companyId,
        userId,
        status: { [Op.ne]: 'closed' }
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        }
      ],
      limit,
      order: [['updatedAt', 'DESC']]
    });

    return res.json({
      success: true,
      data: tickets
    });

  } catch (error) {
    logger.error("Error getting recent tickets:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get pending tickets
export const getPendingTickets = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;
    const limit = 20;

    const tickets = await Ticket.findAll({
      where: {
        companyId,
        status: 'pending'
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: Queue,
          as: "queue",
          attributes: ['id', 'name', 'color']
        }
      ],
      limit,
      order: [['createdAt', 'ASC']]
    });

    return res.json({
      success: true,
      data: tickets
    });

  } catch (error) {
    logger.error("Error getting pending tickets:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get my assigned tickets
export const getMyTickets = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user!;

    const tickets = await Ticket.findAll({
      where: {
        companyId,
        userId,
        status: { [Op.ne]: 'closed' }
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        }
      ],
      order: [['unreadMessages', 'DESC'], ['updatedAt', 'DESC']],
      limit: 50
    });

    return res.json({
      success: true,
      data: tickets
    });

  } catch (error) {
    logger.error("Error getting my tickets:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Transfer ticket to another user/queue
export const transfer = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user!;
    const { userId, queueId } = req.body;

    const ticket = await Ticket.findOne({
      where: {
        id: Number(ticketId),
        companyId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    await ticket.update({
      userId: userId || null,
      queueId: queueId || null,
      status: 'pending'
    });

    return res.json({
      success: true,
      message: "Ticket transferred successfully"
    });

  } catch (error) {
    logger.error("Error transferring ticket:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Close ticket
export const close = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user!;

    const ticket = await Ticket.findOne({
      where: {
        id: Number(ticketId),
        companyId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    await ticket.update({
      status: 'closed'
    });

    return res.json({
      success: true,
      message: "Ticket closed successfully"
    });

  } catch (error) {
    logger.error("Error closing ticket:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get ticket statistics
export const getStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user!;

    const ticket = await Ticket.findOne({
      where: {
        id: Number(ticketId),
        companyId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    const messageCount = await Message.count({
      where: { ticketId: ticket.id }
    });

    const unreadCount = await Message.count({
      where: { 
        ticketId: ticket.id,
        read: false,
        fromMe: false
      }
    });

    const responseTime = await Message.findOne({
      where: { 
        ticketId: ticket.id,
        fromMe: true
      },
      order: [['createdAt', 'ASC']]
    });

    let avgResponseTime = null;
    if (responseTime && ticket.createdAt) {
      avgResponseTime = new Date(responseTime.createdAt).getTime() - new Date(ticket.createdAt).getTime();
    }

    return res.json({
      success: true,
      data: {
        messageCount,
        unreadCount,
        avgResponseTime,
        duration: new Date().getTime() - new Date(ticket.createdAt).getTime(),
        status: ticket.status
      }
    });

  } catch (error) {
    logger.error("Error getting ticket stats:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};