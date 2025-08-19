import { Request, Response } from "express";
import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import QuickMessage from "../../models/QuickMessage";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/optimizedSocket";
import SendWhatsAppMessage from "../../services/WbotServices/SendWhatsAppMessage";
import SendWhatsAppMedia from "../../services/WbotServices/SendWhatsAppMedia";

// Get messages for a ticket with mobile optimization
export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user!;
    const { pageNumber = 1, limit = 50 } = req.query;

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

    const offset = (Number(pageNumber) - 1) * Number(limit);

    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        ticketId: Number(ticketId)
      },
      limit: Number(limit),
      offset,
      order: [['timestamp', 'DESC']],
      attributes: [
        'id',
        'body',
        'ack',
        'read',
        'fromMe',
        'mediaUrl',
        'mediaType',
        'timestamp',
        'quotedMsgId',
        'isDeleted',
        'reactions'
      ]
    });

    // Reverse messages for mobile display (oldest first)
    const reversedMessages = messages.reverse();

    const hasMore = offset + messages.length < count;

    return res.json({
      success: true,
      data: {
        messages: reversedMessages,
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
    logger.error("Error getting messages:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Send text message
export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId, id: userId } = req.user!;
    const { body, quotedMsgId } = req.body;

    if (!body?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message body is required"
      });
    }

    // Verify ticket
    const ticket = await Ticket.findOne({
      where: {
        id: Number(ticketId),
        companyId
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'number']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    // Send message via WhatsApp
    const message = await SendWhatsAppMessage({
      ticket,
      body: body.trim(),
      quotedMsgId
    });

    // Update ticket status and last message
    await ticket.update({
      lastMessage: body.trim(),
      lastMessageAt: new Date(),
      userId,
      status: ticket.status === 'pending' ? 'open' : ticket.status
    });

    return res.json({
      success: true,
      data: message
    });

  } catch (error) {
    logger.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Send media message
export const sendMedia = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId, id: userId } = req.user!;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No media file provided"
      });
    }

    // Verify ticket
    const ticket = await Ticket.findOne({
      where: {
        id: Number(ticketId),
        companyId
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ['id', 'number']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    const { originalname: filename, mimetype, path: mediaPath } = req.file;
    const caption = req.body.caption || '';

    // Send media via WhatsApp
    const message = await SendWhatsAppMedia({
      ticket,
      mediaPath,
      mediaType: mimetype,
      caption,
      fileName: filename
    });

    // Update ticket
    await ticket.update({
      lastMessage: caption || 'Mídia enviada',
      lastMessageAt: new Date(),
      userId,
      status: ticket.status === 'pending' ? 'open' : ticket.status
    });

    return res.json({
      success: true,
      data: message
    });

  } catch (error) {
    logger.error("Error sending media:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Send voice message
export const sendVoice = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId, id: userId } = req.user!;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No voice file provided"
      });
    }

    // Verify ticket
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

    const { path: mediaPath } = req.file;

    // Send voice message via WhatsApp
    const message = await SendWhatsAppMedia({
      ticket,
      mediaPath,
      mediaType: 'audio/ogg',
      caption: '',
      isVoice: true
    });

    // Update ticket
    await ticket.update({
      lastMessage: 'Áudio enviado',
      lastMessageAt: new Date(),
      userId,
      status: ticket.status === 'pending' ? 'open' : ticket.status
    });

    return res.json({
      success: true,
      data: message
    });

  } catch (error) {
    logger.error("Error sending voice message:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Send location message
export const sendLocation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId, id: userId } = req.user!;
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required"
      });
    }

    // Verify ticket
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

    // Format location message
    const locationBody = address 
      ? `📍 ${address}\nLatitude: ${latitude}\nLongitude: ${longitude}`
      : `📍 Localização\nLatitude: ${latitude}\nLongitude: ${longitude}`;

    // Send location via WhatsApp
    const message = await SendWhatsAppMessage({
      ticket,
      body: locationBody
    });

    // Update ticket
    await ticket.update({
      lastMessage: 'Localização enviada',
      lastMessageAt: new Date(),
      userId,
      status: ticket.status === 'pending' ? 'open' : ticket.status
    });

    return res.json({
      success: true,
      data: message
    });

  } catch (error) {
    logger.error("Error sending location:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Mark message as read
export const markAsRead = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const { companyId } = req.user!;

    const message = await Message.findOne({
      where: { id: messageId },
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: { companyId }
        }
      ]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found"
      });
    }

    await message.update({ read: true });

    return res.json({
      success: true,
      message: "Message marked as read"
    });

  } catch (error) {
    logger.error("Error marking message as read:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get quick messages
export const getQuickMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user!;

    const quickMessages = await QuickMessage.findAll({
      where: {
        companyId,
        [Op.or]: [
          { userId },
          { userId: null } // Global quick messages
        ]
      },
      attributes: ['id', 'shortcode', 'message', 'mediaPath', 'mediaName'],
      order: [['shortcode', 'ASC']]
    });

    return res.json({
      success: true,
      data: quickMessages
    });

  } catch (error) {
    logger.error("Error getting quick messages:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};