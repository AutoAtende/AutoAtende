import { Request, Response, NextFunction } from "express";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";

const isApi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Headers completos:', req.headers);

    if (!authHeader) {
      console.log('Authorization header não encontrado');
      return res.status(401).json({error: 'Authorization header is required'});
    }

    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("[API - Token extraído:]", token);
    }

    // Verifica se o token existe na tabela Whatsapp
    const whatsapp = await Whatsapp.findOne({
      attributes: ['token', 'companyId', 'status'], 
      where: {token}
    });

    console.log('Whatsapp encontrado:', whatsapp);

    if (!whatsapp) {
      return res.status(401).json({ status: 'ERRO', error: 'Token de autorização inválido' });
    }

    return next();
  } catch (e) {
    console.error('Erro completo:', e);
    throw new AppError(e.toString(), 403);
  }
};

export default isApi;