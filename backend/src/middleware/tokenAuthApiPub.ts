import { Request, Response, NextFunction } from "express";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";

/**
 * Middleware de autenticação por token para APIs públicas
 * Valida o token fornecido no header Authorization ou no body da requisição
 * e adiciona informações de contexto (whatsapp, company) à requisição
 */
const tokenAuthApiPub = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Obter token do header Authorization ou do body
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.substring(7)
        : req.headers.authorization;

    // Verificar se o token foi fornecido
    if (!token) {
      throw new AppError(
        "Token de autenticação não fornecido. Inclua o token no header Authorization ou no body da requisição.",
        401
      );
    }

    // Buscar WhatsApp associado ao token
    const whatsapp = await Whatsapp.findOne({ 
      where: { token },
      attributes: ['id', 'companyId', 'name', 'status']
    });

    // Verificar se o token é válido
    if (!whatsapp) {
      throw new AppError(
        "Token inválido ou expirado. Verifique a chave de API fornecida.",
        401
      );
    }


    req.companyId = whatsapp.companyId;


    // Para manter compatibilidade com código existente
    req.params = {
      ...req.params,
      whatsappId: whatsapp.id.toString(),
      companyId: whatsapp.companyId.toString(),
      isApi: "true"
    };

    // Também definir no req.user para compatibilidade
    req.user = {
      ...req.user,
      companyId: whatsapp.companyId,
    };

    req.companyId = whatsapp.companyId;
    req.whatsappId = whatsapp.id;

    return next();
  } catch (err) {
    console.error("Erro na autenticação da API:", err);
  }
};

export default tokenAuthApiPub;