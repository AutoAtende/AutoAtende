import { Request, Response } from "express";
import User from "../../models/User";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/optimizedSocket";

// Interface for push notification data stored in database
interface PushTokenData {
  token: string;
  platform: 'ios' | 'android';
  deviceId?: string;
  appVersion?: string;
  lastUsed: Date;
}

// Register push notification token
export const registerPushToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;
    const { pushToken, platform = 'android', deviceId, appVersion } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        error: "Push token is required"
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get existing push tokens or initialize empty array
    let pushTokens: PushTokenData[] = [];
    try {
      pushTokens = user.pushTokens ? JSON.parse(user.pushTokens) : [];
    } catch (error) {
      logger.warn(`Error parsing push tokens for user ${userId}:`, error);
      pushTokens = [];
    }

    // Remove existing token if it exists (to avoid duplicates)
    pushTokens = pushTokens.filter(tokenData => tokenData.token !== pushToken);

    // Add new token
    const newTokenData: PushTokenData = {
      token: pushToken,
      platform: platform as 'ios' | 'android',
      deviceId,
      appVersion,
      lastUsed: new Date()
    };

    pushTokens.push(newTokenData);

    // Keep only the last 3 tokens per user (in case they have multiple devices)
    if (pushTokens.length > 3) {
      pushTokens = pushTokens
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 3);
    }

    // Update user with new push tokens
    await user.update({
      pushTokens: JSON.stringify(pushTokens)
    });

    logger.info(`Push token registered for user ${userId} on ${platform}`, {
      userId,
      companyId,
      platform,
      deviceId
    });

    return res.json({
      success: true,
      message: "Push token registered successfully"
    });

  } catch (error) {
    logger.error("Error registering push token:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Unregister push notification token
export const unregisterPushToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId } = req.user!;
    const { pushToken } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.pushTokens) {
      try {
        let pushTokens: PushTokenData[] = JSON.parse(user.pushTokens);
        pushTokens = pushTokens.filter(tokenData => tokenData.token !== pushToken);
        
        await user.update({
          pushTokens: JSON.stringify(pushTokens)
        });
      } catch (error) {
        logger.warn(`Error parsing/updating push tokens for user ${userId}:`, error);
      }
    }

    logger.info(`Push token unregistered for user ${userId}`);

    return res.json({
      success: true,
      message: "Push token unregistered successfully"
    });

  } catch (error) {
    logger.error("Error unregistering push token:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get user notifications (could be expanded to include notification history)
export const getNotifications = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user!;
    const { pageNumber = 1, limit = 20 } = req.query;

    // For now, return empty array as notifications might be handled differently
    // In a full implementation, you might have a Notification model
    const notifications: any[] = [];

    return res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: Number(pageNumber),
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
          limit: Number(limit)
        }
      }
    });

  } catch (error) {
    logger.error("Error getting notifications:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: notificationId } = req.params;
    const { id: userId } = req.user!;

    // In a full implementation, you would update a Notification model
    // For now, just return success
    
    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);

    return res.json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    logger.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Utility function to send push notification to user (to be used by other services)
export const sendPushNotificationToUser = async (
  userId: number,
  title: string,
  body: string,
  data?: any
) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.pushTokens) {
      return;
    }

    let pushTokens: PushTokenData[] = [];
    try {
      pushTokens = JSON.parse(user.pushTokens);
    } catch (error) {
      logger.warn(`Error parsing push tokens for user ${userId}:`, error);
      return;
    }

    // Prepare notifications for each token
    const notifications = pushTokens.map(tokenData => ({
      to: tokenData.token,
      title,
      body,
      data: {
        ...data,
        userId,
        timestamp: new Date().toISOString()
      },
      // Platform-specific settings
      ...(tokenData.platform === 'ios' ? {
        badge: 1,
        sound: 'default'
      } : {
        channelId: data?.urgent ? 'urgent' : 'default'
      })
    }));

    // Send notifications using Expo Push API
    // In a real implementation, you would use the Expo SDK or make HTTP requests
    // to https://exp.host/--/api/v2/push/send
    
    logger.info(`Sending push notification to user ${userId}`, {
      title,
      body,
      tokenCount: pushTokens.length
    });

    // For now, just log the notifications that would be sent
    console.log('Push notifications to send:', notifications);

    return true;
  } catch (error) {
    logger.error(`Error sending push notification to user ${userId}:`, error);
    return false;
  }
};

// Send test push notification
export const sendTestNotification = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId } = req.user!;
    const { title = "Test Notification", body = "This is a test notification from AutoAtende" } = req.body;

    const success = await sendPushNotificationToUser(userId, title, body, {
      type: 'test',
      timestamp: new Date().toISOString()
    });

    if (success) {
      return res.json({
        success: true,
        message: "Test notification sent successfully"
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Failed to send test notification"
      });
    }

  } catch (error) {
    logger.error("Error sending test notification:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};