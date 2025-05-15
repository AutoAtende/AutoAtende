import { Request, Response } from "express";
import DashboardService from "../services/DashboardService";
import { logger } from "../utils/logger";

class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  public getOverview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      logger.info("DashboardController.getOverview", { companyId, startDate, endDate });

      const data = await this.dashboardService.getOverviewMetrics(
        companyId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      // Ajuste: O frontend espera os dados diretamente, não dentro de um objeto "overview"
      const response = {
        ...data.overview,
        ticketsByDay: data.ticketsByDay,
        messagesByDay: data.messagesByDay
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error("DashboardController.getOverview error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public getTicketsMetrics = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      logger.info("DashboardController.getTicketsMetrics", { companyId, startDate, endDate });

      const data = await this.dashboardService.getTicketsMetrics(
        companyId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("DashboardController.getTicketsMetrics error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public getUsersMetrics = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      logger.info("DashboardController.getUsersMetrics", { companyId, startDate, endDate });

      const data = await this.dashboardService.getUsersMetrics(
        companyId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("DashboardController.getUsersMetrics error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public getContactsMetrics = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      logger.info("DashboardController.getContactsMetrics", { companyId, startDate, endDate });

      const data = await this.dashboardService.getContactsMetrics(
        companyId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("DashboardController.getContactsMetrics error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public getQueuesMetrics = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      logger.info("DashboardController.getQueuesMetrics", { companyId, startDate, endDate });

      const data = await this.dashboardService.getQueuesMetrics(
        companyId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("DashboardController.getQueuesMetrics error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public getTagsMetrics = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      logger.info("DashboardController.getTagsMetrics", { companyId, startDate, endDate });

      const data = await this.dashboardService.getTagsMetrics(
        companyId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      const response = {
        ...data,
        avgResponseTimeByTag: data.avgResponseTimeByTag
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error("DashboardController.getTagsMetrics error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public getQueuesComparison = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { queue1Id, queue2Id } = req.query as { queue1Id: string; queue2Id: string };
      const { companyId } = req.user;

      logger.info("DashboardController.getQueuesComparison", { companyId, queue1Id, queue2Id });

      if (!queue1Id || !queue2Id) {
        return res.status(400).json({ error: "É necessário informar duas queues para comparação" });
      }

      const data = await this.dashboardService.getQueuesComparison(
        companyId,
        parseInt(queue1Id),
        parseInt(queue2Id)
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("DashboardController.getQueuesComparison error:", error);
      return res.status(500).json({ error: "Erro ao obter comparativo de queues" });
    }
  };

  public getAgentProspection = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { period } = req.query as { period: string };
      const { companyId } = req.user;

      logger.info("DashboardController.getAgentProspection", { companyId, period });

      const data = await this.dashboardService.getAgentProspection(
        companyId,
        period || 'hoje'
      );

      return res.status(200).json(data);
    } catch (error) {
      logger.error("DashboardController.getAgentProspection error:", error);
      return res.status(500).json({ error: "Erro ao obter dados de prospecção por agente" });
    }
  };

public getUserQueueMetrics = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { userId } = req.params;
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };

    logger.info("DashboardController.getUserQueueMetrics", { 
      companyId, 
      userId, 
      startDate, 
      endDate 
    });

    const data = await this.dashboardService.getUserQueueMetrics(
      companyId,
      parseInt(userId),
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return res.status(200).json(data);
  } catch (error) {
    logger.error("DashboardController.getUserQueueMetrics error:", error);
    return res.status(500).json({ error: "Erro ao obter métricas do usuário por fila" });
  }
};

}

export default DashboardController;