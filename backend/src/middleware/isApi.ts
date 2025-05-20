import { Request, Response, NextFunction } from "express";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

const isApi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    logger.debug('Headers de autorização API:', req.headers.authorization ? 'Presente' : 'Ausente');

    if (!authHeader) {
      logger.warn('Authorization header não encontrado para requisição API');
      return res.status(401).json({error: 'Authorization header is required'});
    }

    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      logger.debug("[API - Token extraído]");
    }

    // Verifica se o token existe na tabela Whatsapp
    const whatsapp = await Whatsapp.findOne({
      attributes: ['token', 'companyId', 'status'], 
      where: {token}
    });

    logger.debug(`API token verificado: ${whatsapp ? 'Encontrado' : 'Não encontrado'}`);

    if (!whatsapp) {
      logger.warn('Token API inválido ou não encontrado');
      return res.status(401).json({ status: 'ERRO', error: 'Token de autorização inválido' });
    }
    
    // NOVA VALIDAÇÃO: Verificar se a conexão WhatsApp está ativa
    if (whatsapp.status !== 'CONNECTED') {
      logger.warn(`API token para WhatsApp com status ${whatsapp.status} - acesso negado`);
      return res.status(403).json({ 
        status: 'ERRO', 
        error: 'Conexão WhatsApp não está ativa', 
        connectionStatus: whatsapp.status 
      });
    }

    // Adicionar companyId ao request para uso posterior nas rotas
    req.companyId = whatsapp.companyId;
    
    // NOVA VALIDAÇÃO: Verificar se está tentando acessar recursos de outra empresa
    const requestedCompanyId = req.params.companyId ? Number(req.params.companyId) : null;
    
    if (requestedCompanyId && requestedCompanyId !== whatsapp.companyId) {
      logger.warn(`Tentativa de acesso a recursos da empresa ${requestedCompanyId} com token da empresa ${whatsapp.companyId}`);
      return res.status(403).json({ 
        status: 'ERRO', 
        error: 'Acesso negado a recursos de outra empresa' 
      });
    }

    return next();
  } catch (e) {
    logger.error('Erro ao verificar token API:', e);
    throw new AppError(e.toString(), 403);
  }
};

export default isApi;