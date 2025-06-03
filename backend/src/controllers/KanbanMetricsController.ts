import { Request, Response } from "express";
import KanbanMetricsService from "../services/KanbanServices/KanbanMetricsService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

interface MetricsQuery {
  boardId?: string;
  laneId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  metricType?: string;
}

export const getBoardMetrics = async (req: Request, res: Response): Promise<Response> => {
  const {
    boardId,
    laneId,
    userId,
    startDate,
    endDate,
    metricType
  } = req.query as MetricsQuery;
  const { companyId } = req.user;

  try {
    const metrics = await KanbanMetricsService.calculateBoardMetrics({
      companyId,
      boardId: boardId ? Number(boardId) : undefined,
      laneId: laneId ? Number(laneId) : undefined,
      userId: userId ? Number(userId) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      metricType
    });

    return res.status(200).json(metrics);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error calculating board metrics:", error);
    throw new AppError("Error calculating board metrics");
  }
};

export default {
  getBoardMetrics
};