import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";

const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if ( user.profile !== "admin") {
      throw new AppError(
        `Acesso não permitido. Tipo de usuário: ${user.profile}`,
        403
      );
    }
    return next();
};

export default isAdmin;