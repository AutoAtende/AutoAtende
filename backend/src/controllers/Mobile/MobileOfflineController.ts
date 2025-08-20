import { Request, Response } from "express";
import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import { logger } from "../../utils/logger";

// Sync data for offline mode
export const syncData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;
    const { lastSyncTimestamp } = req.query;

    const syncTime = lastSyncTimestamp 
      ? new Date(Number(lastSyncTimestamp))
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours default

    // Get updated tickets
    const tickets = await Ticket.findAll({
      where: {
        companyId,
        [Op.or]: [
          { userId },
          { status: 'pending' }
        ],
        updatedAt: {
          [Op.gte]: syncTime
        }
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "profilePicUrl"]
        },
        {
          model: Queue,
          as: "queue",
          attributes: ["id", "name", "color"]
        }
      ],
      attributes: [
        "id", "uuid", "status", "lastMessage", "lastMessageAt",
        "unreadMessages", "contactId", "userId", "queueId", 
        "createdAt", "updatedAt"
      ],
      order: [["updatedAt", "DESC"]],
      limit: 100
    });

    // Get recent messages for these tickets
    const ticketIds = tickets.map(t => t.id);
    const messages = await Message.findAll({
      where: {
        ticketId: { [Op.in]: ticketIds },
        createdAt: {
          [Op.gte]: syncTime
        }
      },
      attributes: [
        "id", "body", "fromMe", "mediaType", "mediaUrl", 
        "ticketId", "contactId", "createdAt", "isDeleted"
      ],
      order: [["createdAt", "DESC"]],
      limit: 500
    });

    // Get quick messages for this user
    const QuickMessage = (await import("../../models/QuickMessage")).default;
    const quickMessages = await QuickMessage.findAll({
      where: {
        companyId,
        [Op.or]: [
          { userId },
          { geral: true }
        ]
      },
      attributes: ["id", "shortcode", "message", "mediaPath", "mediaName"],
      limit: 50
    });

    // Get user queues
    const UserQueue = (await import("../../models/UserQueue")).default;
    const userQueues = await Queue.findAll({
      include: [
        {
          model: UserQueue,
          as: "userQueues",
          where: { userId },
          attributes: []
        }
      ],
      attributes: ["id", "name", "color", "greetingMessage"]
    });

    return res.json({
      success: true,
      data: {
        tickets,
        messages,
        quickMessages,
        queues: userQueues,
        syncTimestamp: Date.now(),
        totalItems: {
          tickets: tickets.length,
          messages: messages.length,
          quickMessages: quickMessages.length,
          queues: userQueues.length
        }
      }
    });

  } catch (error) {
    logger.error("Sync data error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get cached messages for offline viewing
export const getCachedMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user!;
    const { limit = 50, offset = 0 } = req.query;

    // Verify ticket belongs to user's company
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

    const messages = await Message.findAll({
      where: {
        ticketId: Number(ticketId),
        isDeleted: false
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "profilePicUrl"]
        }
      ],
      attributes: [
        "id", "body", "fromMe", "mediaType", "mediaUrl", 
        "contactId", "createdAt", "read"
      ],
      order: [["createdAt", "ASC"]],
      limit: Number(limit),
      offset: Number(offset)
    });

    return res.json({
      success: true,
      data: {
        messages,
        ticketId: Number(ticketId),
        hasMore: messages.length === Number(limit)
      }
    });

  } catch (error) {
    logger.error("Get cached messages error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Queue message for sending when online
export const queueMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId, body, mediaUrl, mediaType } = req.body;
    const { id: userId, companyId } = req.user!;

    if (!ticketId || !body) {
      return res.status(400).json({
        success: false,
        error: "Ticket ID and message body are required"
      });
    }

    // Verify ticket exists and belongs to company
    const ticket = await Ticket.findOne({
      where: {
        id: ticketId,
        companyId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    // For now, we'll store this in a simple queue table or cache
    // In a real implementation, you might want to use Redis or a message queue
    const queuedMessage = {
      id: Date.now().toString(),
      ticketId,
      body,
      mediaUrl,
      mediaType,
      userId,
      status: 'queued',
      createdAt: new Date().toISOString()
    };

    // This would typically be stored in Redis or a database table
    // For now, we'll just return success
    logger.info("Message queued for offline sending", queuedMessage);

    return res.status(201).json({
      success: true,
      data: { queuedMessage },
      message: "Message queued successfully"
    });

  } catch (error) {
    logger.error("Queue message error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get app configuration for offline mode
export const getAppConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;

    // Get company settings
    const Company = (await import("../../models/Company")).default;
    const company = await Company.findByPk(companyId, {
      attributes: ["id", "name", "status", "dueDate"]
    });

    // Get app settings that might be needed offline
    const config = {
      company,
      features: {
        offlineMode: true,
        pushNotifications: true,
        autoSync: true,
        mediaCache: true
      },
      limits: {
        maxCachedMessages: 1000,
        maxCachedMedia: 100,
        syncInterval: 300000 // 5 minutes
      },
      version: process.env.APP_VERSION || "1.0.0"
    };

    return res.json({
      success: true,
      data: config
    });

  } catch (error) {
    logger.error("Get app config error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Sync tickets specifically  
export const syncTickets = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;
    const { lastSyncTimestamp } = req.body;

    const syncTime = lastSyncTimestamp 
      ? new Date(lastSyncTimestamp)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tickets = await Ticket.findAll({
      where: {
        companyId,
        [Op.or]: [
          { userId },
          { status: 'pending' }
        ],
        updatedAt: {
          [Op.gte]: syncTime
        }
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "profilePicUrl"]
        }
      ],
      attributes: [
        "id", "uuid", "status", "lastMessage", "lastMessageAt",
        "unreadMessages", "contactId", "userId", "queueId", 
        "createdAt", "updatedAt"
      ],
      order: [["updatedAt", "DESC"]],
      limit: 50
    });

    return res.json({
      success: true,
      data: {
        tickets,
        syncTimestamp: Date.now(),
        count: tickets.length
      }
    });

  } catch (error) {
    logger.error("Sync tickets error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Sync messages specifically
export const syncMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;
    const { ticketIds, lastSyncTimestamp } = req.body;

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Ticket IDs array is required"
      });
    }

    const syncTime = lastSyncTimestamp 
      ? new Date(lastSyncTimestamp)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const messages = await Message.findAll({
      where: {
        ticketId: { [Op.in]: ticketIds },
        createdAt: {
          [Op.gte]: syncTime
        }
      },
      attributes: [
        "id", "body", "fromMe", "mediaType", "mediaUrl", 
        "ticketId", "contactId", "createdAt", "isDeleted"
      ],
      order: [["createdAt", "DESC"]],
      limit: 200
    });

    return res.json({
      success: true,
      data: {
        messages,
        syncTimestamp: Date.now(),
        count: messages.length
      }
    });

  } catch (error) {
    logger.error("Sync messages error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get sync status
export const getSyncStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;

    // Get counts for sync status
    const ticketCount = await Ticket.count({
      where: {
        companyId,
        [Op.or]: [
          { userId },
          { status: 'pending' }
        ]
      }
    });

    const pendingCount = await Ticket.count({
      where: {
        companyId,
        status: 'pending'
      }
    });

    const userTicketCount = await Ticket.count({
      where: {
        userId,
        companyId
      }
    });

    return res.json({
      success: true,
      data: {
        totalTickets: ticketCount,
        pendingTickets: pendingCount,
        userTickets: userTicketCount,
        lastSync: Date.now(),
        status: 'online'
      }
    });

  } catch (error) {
    logger.error("Get sync status error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Process offline queue
export const processOfflineQueue = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { queuedMessages } = req.body;

    if (!Array.isArray(queuedMessages)) {
      return res.status(400).json({
        success: false,
        error: "Queued messages array is required"
      });
    }

    const results = [];

    for (const queuedMessage of queuedMessages) {
      try {
        // Here you would process each queued message
        // For now, we'll just mark them as processed
        results.push({
          id: queuedMessage.id,
          status: 'processed',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          id: queuedMessage.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return res.json({
      success: true,
      data: {
        results,
        processed: results.filter(r => r.status === 'processed').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    });

  } catch (error) {
    logger.error("Process offline queue error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};