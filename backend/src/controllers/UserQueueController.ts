import { Request, Response } from "express";
import { 
  GetUserQueuesService, 
  CheckUserQueueAccessService,
  GetAvailableQueuesForUserService 
} from "../services/UserServices/GetUserQueuesService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";


/**
 * Busca todas as filas que um usuário específico tem acesso
 */
export const getUserQueues = async (
  req: Request, 
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { companyId } = req.user;
    const { includeInactive } = req.query;

    // Validar se o userId é válido
    if (!userId || isNaN(Number(userId))) {
      throw new AppError("ID do usuário inválido", 400);
    }

    const result = await GetUserQueuesService({
      userId: Number(userId),
      companyId,
    });

    logger.info(`Filas do usuário ${userId} consultadas por ${req.user.id}`, {
      userId: Number(userId),
      companyId,
      totalQueues: result.totalQueues,
      hasAllAccess: result.userHasAllTicketAccess
    });

    return res.status(200).json(result);

  } catch (error) {
    logger.error(`Erro ao buscar filas do usuário ${req.params.userId}:`, {
      error: error.message,
      userId: req.params.userId,
      companyId: req.user.companyId,
      requesterId: req.user.id
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ 
        error: error.message 
      });
    }

    return res.status(500).json({ 
      error: "Erro interno do servidor ao buscar filas do usuário" 
    });
  }
};

/**
 * Busca as filas do usuário atual (autenticado)
 */
export const getCurrentUserQueues = async (
  req: Request, 
  res: Response
): Promise<Response> => {
  try {
    const { id: userId, companyId } = req.user;

    const result = await GetUserQueuesService({
      userId: Number(userId),
      companyId,
    });

    return res.status(200).json(result);

  } catch (error) {
    logger.error(`Erro ao buscar filas do usuário atual ${req.user.id}:`, {
      error: error.message,
      userId: req.user.id,
      companyId: req.user.companyId
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ 
        error: error.message 
      });
    }

    return res.status(500).json({ 
      error: "Erro interno do servidor ao buscar suas filas" 
    });
  }
};

/**
 * Verifica se um usuário tem acesso a uma fila específica
 */
export const checkUserQueueAccess = async (
  req: Request, 
  res: Response
): Promise<Response> => {
  try {
    const { userId, queueId } = req.params;

    // Validar parâmetros
    if (!userId || isNaN(Number(userId))) {
      throw new AppError("ID do usuário inválido", 400);
    }

    if (!queueId || isNaN(Number(queueId))) {
      throw new AppError("ID da fila inválido", 400);
    }

    const hasAccess = await CheckUserQueueAccessService(
      Number(userId), 
      Number(queueId)
    );

    return res.status(200).json({ 
      hasAccess,
      userId: Number(userId),
      queueId: Number(queueId)
    });

  } catch (error) {
    logger.error(`Erro ao verificar acesso à fila:`, {
      error: error.message,
      userId: req.params.userId,
      queueId: req.params.queueId,
      requesterId: req.user.id
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ 
        error: error.message 
      });
    }

    return res.status(500).json({ 
      error: "Erro interno do servidor ao verificar acesso à fila" 
    });
  }
};

/**
 * Busca todas as filas disponíveis para atribuir a um usuário
 * (usado principalmente por administradores)
 */
export const getAvailableQueues = async (
  req: Request, 
  res: Response
): Promise<Response> => {
  try {
    const { companyId, profile } = req.user;
    const { userId } = req.query;

    // Verificar se o usuário tem permissão para ver todas as filas
    if (profile !== "admin" && profile !== "superv") {
      throw new AppError("Sem permissão para acessar esta funcionalidade", 403);
    }

    const queues = await GetAvailableQueuesForUserService(
      companyId,
      userId ? Number(userId) : undefined
    );

    return res.status(200).json({
      queues,
      total: queues.length
    });

  } catch (error) {
    logger.error(`Erro ao buscar filas disponíveis:`, {
      error: error.message,
      companyId: req.user.companyId,
      requesterId: req.user.id,
      targetUserId: req.query.userId
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ 
        error: error.message 
      });
    }

    return res.status(500).json({ 
      error: "Erro interno do servidor ao buscar filas disponíveis" 
    });
  }
};