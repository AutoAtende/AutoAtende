import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import Company from "../../models/Company";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: {
    deviceId: string;
    platform: string;
    appVersion: string;
  };
}

// Mobile login
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, deviceInfo }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    // Find user with company info
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "status", "dueDate"]
        }
      ],
      attributes: [
        "id", "name", "email", "passwordHash", "profile", "companyId",
        "online", "tokenVersion", "profilePic", "number", "super"
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Check if company is active
    if (user.company?.status !== true) {
      return res.status(403).json({
        success: false,
        error: "Company is not active"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        profile: user.profile,
        tokenVersion: user.tokenVersion
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    // Update user online status
    await user.update({ online: true });

    // Log device info if provided
    if (deviceInfo) {
      logger.info(`Mobile login for user ${user.id}`, {
        userId: user.id,
        email: user.email,
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
        appVersion: deviceInfo.appVersion
      });
    }

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          companyId: user.companyId,
          profilePic: user.profilePic,
          number: user.number,
          super: user.super,
          company: {
            id: user.company?.id,
            name: user.company?.name,
            status: user.company?.status
          }
        }
      }
    });

  } catch (error) {
    logger.error("Mobile login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Mobile logout
export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId } = req.user!;

    // Update user offline status
    await User.update(
      { online: false },
      { where: { id: userId } }
    );

    logger.info(`Mobile logout for user ${userId}`);

    return res.json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    logger.error("Mobile logout error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
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
      attributes: ["id", "name", "email", "profile", "companyId", "tokenVersion", "super"]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Generate new token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        profile: user.profile,
        tokenVersion: user.tokenVersion
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          companyId: user.companyId,
          super: user.super,
          company: {
            id: user.company?.id,
            name: user.company?.name,
            status: user.company?.status
          }
        }
      }
    });

  } catch (error) {
    logger.error("Token refresh error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get current user profile
export const profile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: userId } = req.user!;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "status", "dueDate"]
        }
      ],
      attributes: [
        "id", "name", "email", "profile", "companyId", "online",
        "profilePic", "number", "super", "createdAt"
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
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          companyId: user.companyId,
          online: user.online,
          profilePic: user.profilePic,
          number: user.number,
          super: user.super,
          createdAt: user.createdAt,
          company: {
            id: user.company?.id,
            name: user.company?.name,
            status: user.company?.status,
            dueDate: user.company?.dueDate
          }
        }
      }
    });

  } catch (error) {
    logger.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};