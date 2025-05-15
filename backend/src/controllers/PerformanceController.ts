// Arquivo: controllers/PerformanceController.ts

import { Request, Response } from "express";
import PerformanceDataService from "../services/ReportService/PerformanceDataService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

export const getPerformanceData = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId } = req.user;
        const {
            startDate,
            endDate,
            userId,
            queueIds: queueIdsString,
            compareQueueIds: compareQueueIdsString
        } = req.query;

        logger.info("Parâmetros recebidos:", {
            query: req.query,
            user: req.user
          });
        
        // Validação dos parâmetros
        if (!companyId) {
            throw new AppError("CompanyId é obrigatório", 400);
        }

        if (!startDate || !endDate) {
            throw new AppError("Data inicial e final são obrigatórias", 400);
        }

        // Processar arrays JSON de parâmetros
let queueIds: number[] = [];
if (typeof queueIdsString === 'string') {
  queueIds = queueIdsString.split(',').map(Number).filter(Number.isInteger);
}
        let compareQueueIds: number[] | undefined = undefined;

        if (queueIdsString) {
            try {
                queueIds = JSON.parse(queueIdsString as string);
                if (!Array.isArray(queueIds)) {
                    throw new AppError("O parâmetro queueIds deve ser um array de números", 400);
                }
            } catch (error) {
                throw new AppError("Formato inválido para queueIds", 400);
            }
        }

        if (compareQueueIdsString) {
            try {
                compareQueueIds = JSON.parse(compareQueueIdsString as string);
                if (!Array.isArray(compareQueueIds)) {
                    throw new AppError("O parâmetro compareQueueIds deve ser um array de números", 400);
                }
            } catch (error) {
                throw new AppError("Formato inválido para compareQueueIds", 400);
            }
        }

        // Log dos parâmetros para debug
        logger.info("Buscando dados de desempenho", {
            companyId,
            startDate,
            endDate,
            userId,
            queueIds,
            compareQueueIds
        });

        // Chamar o serviço para obter os dados
        const performanceData = await PerformanceDataService({
            companyId: Number(companyId),
            startDate: startDate as string,
            endDate: endDate as string,
            userId: userId ? Number(userId) : undefined,
            queueIds,
            compareQueueIds
        });

        return res.status(200).json(performanceData);
    } catch (err) {
        // Log detalhado do erro
        logger.error("Erro ao buscar dados de desempenho", {
            error: err,
            stack: err instanceof Error ? err.stack : undefined
        });
        
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({
                error: "ErroAplicacao",
                message: err.message
            });
        }

        return res.status(500).json({
            error: "ErroAplicacao",
            message: "Erro interno ao buscar dados de desempenho"
        });
    }
};

export default {
    getPerformanceData
};