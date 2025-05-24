import { Request, Response } from "express";
import DashboardService from "../services/DashboardService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  public getOverview = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    try {
      logger.info("Iniciando getOverview", { companyId, startDate, endDate });

      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      const data = await this.dashboardService.getOverviewMetrics(
        companyId,
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

      const data = await this.dashboardService.getQueuesMetrics(
        companyId,
        parsedStartDate,
        parsedEndDate,
        parsedQueueId
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

      const data = await this.dashboardService.getQueuesComparison(
        companyId,
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

      const data = await this.dashboardService.getContactsByState(companyId);

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

      const data = await this.dashboardService.getAgentProspection(
        companyId,
        parsedPeriod
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

      const data = await this.dashboardService.getUserQueuesComparison(
        companyId,
        parsedUserId,
        parsedQueue1,
        parsedQueue2,
        parsedStartDate,
        parsedEndDate
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
}

export default DashboardController;