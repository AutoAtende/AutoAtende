import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";
import { logger } from "../utils/logger";

const isSuper = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (!user.super) {
      throw new AppError("Acesso não permitido - Requer permissão de super usuário", 401);
    }

    return next();
  } catch (error) {
    logger.error("Erro na verificação de super usuário:", error);
    throw error;
  }
};

export default isSuper;