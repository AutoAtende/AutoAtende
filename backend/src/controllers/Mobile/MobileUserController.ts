import { Request, Response } from "express";
import User from "../../models/User";
import Company from "../../models/Company";
import { logger } from "../../utils/logger";
import Sequelize, { literal } from "sequelize";

// Get current user info
export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId } = req.user!;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "status"]
        }
      ],
      attributes: [
        "id", "name", "email", "profile", "companyId", "online",
        "profilePic", "number", "super", "startWork", "endWork"
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    return res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Update user profile
export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId } = req.user!;
    const { name, profilePic, startWork, endWork } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const updateData: any = {};
    
    if (name) updateData.name = name.trim();
    if (profilePic) updateData.profilePic = profilePic;
    if (startWork) updateData.startWork = startWork;
    if (endWork) updateData.endWork = endWork;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update"
      });
    }

    await user.update(updateData);

    return res.json({
      success: true,
      data: { user },
      message: "Profile updated successfully"
    });

  } catch (error) {
    logger.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Update online status
export const updateOnlineStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId } = req.user!;
    const { online } = req.body;

    if (typeof online !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "Online status must be boolean"
      });
    }

    await User.update(
      { online },
      { where: { id: userId } }
    );

    return res.json({
      success: true,
      message: `Status updated to ${online ? 'online' : 'offline'}`
    });

  } catch (error) {
    logger.error("Update online status error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get user statistics
export const stats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;

    // Import models dynamically to avoid circular dependencies
    const Ticket = (await import("../../models/Ticket")).default;
    const Message = (await import("../../models/Message")).default;

    // Get user ticket stats
    const ticketStats = await Ticket.count({
      where: {
        userId,
        companyId
      },
      group: ['status']
    });

    // Get message count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMessages = await Message.count({
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: {
            userId,
            companyId
          }
        }
      ],
      where: {
        fromMe: true,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    return res.json({
      success: true,
      data: {
        tickets: ticketStats,
        todayMessages,
        userId
      }
    });

  } catch (error) {
    logger.error("Get user stats error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get user profile (alias for show)
export const getProfile = show;

// Update user profile (alias for update)
export const updateProfile = update;

// Get user settings
export const getSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;

    // Get user settings
    const user = await User.findByPk(userId, {
      attributes: [
        "id", "name", "email", "startWork", "endWork", 
        "notifyNewTicket", "notifyTask", "profilePic"
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get company settings that affect mobile
    const Setting = (await import("../../models/Setting")).default;
    const companySettings = await Setting.findAll({
      where: { companyId },
      attributes: ["key", "value"]
    });

    const settings = companySettings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        user,
        settings: {
          ...settings,
          mobileNotifications: true,
          offlineMode: true,
          autoSync: true
        }
      }
    });

  } catch (error) {
    logger.error("Get user settings error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get dashboard data
export const getDashboard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;

    // Import models dynamically
    const Ticket = (await import("../../models/Ticket")).default;
    const Message = (await import("../../models/Message")).default;

    // Get ticket counts by status
    const ticketCounts = await Ticket.findAll({
      where: { 
        userId,
        companyId 
      },
      attributes: [
        'status',
        [literal('COUNT(*)'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get today's message count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMessages = await Message.count({
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: {
            userId,
            companyId
          }
        }
      ],
      where: {
        fromMe: true,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get pending tickets count
    const pendingTickets = await Ticket.count({
      where: {
        companyId,
        status: 'pending'
      }
    });

    return res.json({
      success: true,
      data: {
        ticketCounts,
        todayMessages,
        pendingTickets,
        userId
      }
    });

  } catch (error) {
    logger.error("Get dashboard error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get WhatsApp connection status
export const getWhatsAppStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;

    const Whatsapp = (await import("../../models/Whatsapp")).default;
    const whatsapps = await Whatsapp.findAll({
      where: { companyId },
      attributes: ["id", "name", "status", "battery", "plugged"]
    });

    return res.json({
      success: true,
      data: { whatsapps }
    });

  } catch (error) {
    logger.error("Get WhatsApp status error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get user queues
export const getQueues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;

    const Queue = (await import("../../models/Queue")).default;
    const UserQueue = (await import("../../models/UserQueue")).default;

    const queues = await Queue.findAll({
      include: [
        {
          model: UserQueue,
          as: "userQueues",
          where: { userId },
          attributes: []
        }
      ],
      where: { companyId },
      attributes: ["id", "name", "color", "greetingMessage"]
    });

    return res.json({
      success: true,
      data: { queues }
    });

  } catch (error) {
    logger.error("Get queues error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get online users
export const getOnlineUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;

    const onlineUsers = await User.findAll({
      where: {
        companyId,
        online: true
      },
      attributes: ["id", "name", "profile", "profilePic"]
    });

    return res.json({
      success: true,
      data: { 
        users: onlineUsers,
        count: onlineUsers.length
      }
    });

  } catch (error) {
    logger.error("Get online users error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};