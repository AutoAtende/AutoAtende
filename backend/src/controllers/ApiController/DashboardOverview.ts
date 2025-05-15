import { Request, Response } from "express";
import * as Yup from 'yup';
import DashboardOverviewService from "../../services/ApiService/DashboardOverviewService";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

/**
 * Obtém uma visão geral do dashboard com métricas importantes
 * @param req - Request do Express
 * @param res - Response do Express
 * @returns Response com os dados do dashboard
 */
export const getDashboardOverview = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validação dos parâmetros da requisição
    const schema = Yup.object().shape({
      period: Yup.string()
        .required("Período é obrigatório")
        .oneOf(["day", "week", "month"], "Período deve ser 'day', 'week' ou 'month'"),
      date: Yup.string()
        .required("Data de referência é obrigatória")
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
      userId: Yup.number().optional(),
      queueId: Yup.number().optional(),
      companyId: Yup.number().optional()
    });

    await schema.validate(req.body);

    // Obter parâmetros
    const { period, date, userId, queueId } = req.body;
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError("ID da empresa não encontrado", 400);
    }

    logger.debug("Chamando DashboardOverviewService com parâmetros:", {
      companyId,
      period,
      date,
      userId,
      queueId
    });

    // Chamar o serviço para obter os dados
    const dashboardData = await DashboardOverviewService({
      companyId,
      period,
      date,
      userId,
      queueId
    });

    return res.status(200).json({
      status: "SUCCESS",
      data: dashboardData
    });
  } catch (err) {
    logger.error("Erro ao buscar visão geral do dashboard:", err);

    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({
        status: "ERROR",
        message: err.message
      });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        status: "ERROR",
        message: err.message
      });
    }

    return res.status(500).json({
      status: "ERROR",
      message: "Erro interno do servidor"
    });
  }
};