import { Request, Response } from "express";
import DashboardService from "../services/DashboardService";
import DashboardCacheService from "../services/DashboardCacheService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

class DashboardController {
  private dashboardService: DashboardService;
  private dashboardCacheService: DashboardCacheService;

  constructor() {
    this.dashboardService = new DashboardService();
    this.dashboardCacheService = new DashboardCacheService();
  }

  public getOverview = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    try {
      logger.info("Iniciando getOverview", { companyId, startDate, endDate });

      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "overview",
        undefined,
        parsedStartDate,
        parsedEndDate
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getOverview", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public getQueuesMetrics = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { startDate, endDate, queueId } = req.query as { 
      startDate?: string; 
      endDate?: string;
      queueId?: string;
    };

    try {
      logger.info("Iniciando getQueuesMetrics", { companyId, startDate, endDate, queueId });

      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;
      const parsedQueueId = queueId ? parseInt(queueId, 10) : undefined;

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "queues",
        parsedQueueId,
        parsedStartDate,
        parsedEndDate
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getQueuesMetrics", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public getQueuesComparison = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { queue1, queue2 } = req.query as { queue1?: string; queue2?: string };

    try {
      logger.info("Iniciando getQueuesComparison", { companyId, queue1, queue2 });

      if (!queue1 || !queue2) {
        throw new AppError("Parâmetros queue1 e queue2 são obrigatórios", 400);
      }

      const parsedQueue1 = parseInt(queue1, 10);
      const parsedQueue2 = parseInt(queue2, 10);

      if (isNaN(parsedQueue1) || isNaN(parsedQueue2)) {
        throw new AppError("IDs de fila inválidos", 400);
      }

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "queuesComparison",
        undefined,
        undefined,
        undefined,
        undefined,
        parsedQueue1,
        parsedQueue2
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getQueuesComparison", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public getContactsByState = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;

    try {
      logger.info("Iniciando getContactsByState", { companyId });

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "contacts"
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getContactsByState", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public getAgentProspection = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { period } = req.query as { period?: string };

    try {
      logger.info("Iniciando getAgentProspection", { companyId, period });

      // Validar período
      const validPeriods = ['hoje', 'semana', 'quinzena', 'mes'];
      const parsedPeriod = validPeriods.includes(period || '') ? period : 'semana';

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "agentProspection"
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getAgentProspection", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  // Novo método para comparar usuário entre dois setores
  public getUserQueuesComparison = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { userId, queue1, queue2, startDate, endDate } = req.query as { 
      userId?: string; 
      queue1?: string; 
      queue2?: string;
      startDate?: string;
      endDate?: string;
    };

    try {
      logger.info("Iniciando getUserQueuesComparison", { companyId, userId, queue1, queue2, startDate, endDate });

      if (!userId || !queue1 || !queue2) {
        throw new AppError("Parâmetros userId, queue1 e queue2 são obrigatórios", 400);
      }

      const parsedUserId = parseInt(userId, 10);
      const parsedQueue1 = parseInt(queue1, 10);
      const parsedQueue2 = parseInt(queue2, 10);
      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      if (isNaN(parsedUserId) || isNaN(parsedQueue1) || isNaN(parsedQueue2)) {
        throw new AppError("IDs inválidos", 400);
      }

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "userQueuesComparison",
        undefined,
        parsedStartDate,
        parsedEndDate,
        parsedUserId,
        parsedQueue1,
        parsedQueue2
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getUserQueuesComparison", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  /**
   * Força a atualização do cache do dashboard para uma empresa
   */
  public forceUpdateCache = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;

    try {
      logger.info("Iniciando forceUpdateCache", { companyId });

      await this.dashboardCacheService.forceUpdateCache(companyId);

      return res.status(200).json({ 
        message: "Atualização do cache do dashboard iniciada com sucesso" 
      });
    } catch (error) {
      logger.error("Erro em forceUpdateCache", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  /**
   * Obtém dados de mensagens mensais com acumulado
   */
  public getMonthlyMessagesData = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    try {
      logger.info("Iniciando getMonthlyMessagesData", { companyId, startDate, endDate });

      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "monthlyMessages",
        undefined,
        parsedStartDate,
        parsedEndDate
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getMonthlyMessagesData", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  /**
   * Obtém dados de tickets mensais com acumulado
   */
  public getMonthlyTicketsData = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    try {
      logger.info("Iniciando getMonthlyTicketsData", { companyId, startDate, endDate });

      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      // Buscar dados do cache ou gerar em tempo real
      const data = await this.dashboardCacheService.getCachedData(
        companyId,
        "monthlyTickets",
        undefined,
        parsedStartDate,
        parsedEndDate
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("Erro em getMonthlyTicketsData", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

export default DashboardController;