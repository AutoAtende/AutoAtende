// controllers/InactivityStatsController.ts
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import CleanupInactiveFlowsService from "../services/FlowBuilderService/CleanupInactiveFlowsService";
import { logger } from "../utils/logger";

interface StatsRequest {
  companyId: number;
  startDate?: string;
  endDate?: string;
}

export const getInactivityStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { startDate, endDate } = req.query as unknown as StatsRequest;
  
  try {
    // Coletar estatísticas de inatividade
    const stats = await CleanupInactiveFlowsService.collectInactivityStats();
    
    return res.status(200).json(stats);
  } catch (error) {
    logger.error(`[InactivityStats] Erro ao obter estatísticas: ${error.message}`);
    throw new AppError(error.message);
  }
};

export const forceInactivityCleanup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { maxInactiveTimeMinutes, batchSize } = req.body;
  
  try {
    // Validar parâmetros
    const maxTime = maxInactiveTimeMinutes ? parseInt(maxInactiveTimeMinutes) : 60;
    const limit = batchSize ? parseInt(batchSize) : 100;
    
    if (isNaN(maxTime) || maxTime < 5) {
      throw new AppError("Tempo máximo de inatividade inválido. Mínimo: 5 minutos.");
    }
    
    if (isNaN(limit) || limit < 1 || limit > 500) {
      throw new AppError("Tamanho de lote inválido. Deve estar entre 1 e 500.");
    }
    
    // Executar limpeza forçada
    const stats = await CleanupInactiveFlowsService.cleanupInactiveFlows(maxTime, limit);
    
    // Notificar via WebSockets
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("inactivity:cleanup", {
      status: "completed",
      stats
    });
    
    return res.status(200).json({
      message: "Limpeza de inatividade iniciada com sucesso",
      stats
    });
  } catch (error) {
    logger.error(`[InactivityStats] Erro ao forçar limpeza: ${error.message}`);
    throw new AppError(error.message);
  }
};

export default {
  getInactivityStats,
  forceInactivityCleanup
};