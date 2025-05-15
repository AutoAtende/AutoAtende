import { Request, Response } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { ListTicketsReportService } from "../services/ReportService/ListTicketsReportService";
import ChartsReportService from "../services/ReportService/ChartsReportService";
import ExportReportService from "../services/ReportService/ExportReportService";
import SummaryReportService from "../services/ReportService/SummaryReportService";
import ExportCsvService from "services/ReportService/ExportCsvService";
import * as Yup from "yup";

// Tipos para os parâmetros da query
interface IndexQuery {
  startDate: string;
  endDate: string;
  userId?: string;
  queueIds?: string;
  tagIds?: string;
  status?: string;
  employerId?: string; 
  searchParam?: string;
  pageNumber?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ChartQuery {
  startDate: string;
  endDate: string;
  aggregation?: string; // day, week, month
  userId?: string;
  queueIds?: string;
  tagIds?: string;
  status?: string;
  employerId?: string;
}

// Função auxiliar para validar e processar parâmetros
const validateAndProcessParams = async (params: IndexQuery) => {
  const schema = Yup.object().shape({
    startDate: Yup.string().required("Data inicial é obrigatória"),
    endDate: Yup.string().required("Data final é obrigatória"),
    userId: Yup.number().transform(value => isNaN(Number(value)) ? undefined : Number(value)).optional(),
    queueIds: Yup.string().optional(),
    tagIds: Yup.string().optional(),
    status: Yup.string().optional(),
    employerId: Yup.number().transform(value => isNaN(Number(value)) ? undefined : Number(value)).optional(),
    searchParam: Yup.string().optional(),
    pageNumber: Yup.number().transform(value => Number(value)).default(1),
    pageSize: Yup.number().transform(value => Number(value)).default(20),
    sortBy: Yup.string().default("createdAt"),
    sortOrder: Yup.string().oneOf(["ASC", "DESC"]).default("DESC")
  });

  try {
    // Validar parâmetros básicos
    const validatedParams = await schema.validate(params);
    
    // Processar arrays JSON
    return {
      ...validatedParams,
      queueIds: validatedParams.queueIds ? JSON.parse(validatedParams.queueIds) : [],
      tagIds: validatedParams.tagIds ? JSON.parse(validatedParams.tagIds) : [],
    };
  } catch (err) {
    throw new AppError(err.message);
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawParams = req.query as unknown as IndexQuery;
    const { companyId } = req.user;
    
    // Validar e processar parâmetros
    const params = await validateAndProcessParams(rawParams);
    
    logger.debug("ListTicketsReportService - Parâmetros processados:", { 
      ...params, 
      companyId 
    });
    
    const { tickets, count, hasMore } = await ListTicketsReportService({
      startDate: params.startDate,
      endDate: params.endDate,
      userId: params.userId,
      queueIds: params.queueIds,
      tagIds: params.tagIds,
      status: params.status,
      employerId: params.employerId,
      searchParam: params.searchParam,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder as "ASC" | "DESC",
      companyId
    });
    
    return res.json({
      tickets,
      count,
      hasMore
    });
    
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error(err);
    throw new AppError("Erro ao buscar relatório de atendimentos", 500);
  }
};

export const charts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { 
      startDate, 
      endDate, 
      aggregation = "day",
      userId,
      queueIds,
      status,
      employerId
    } = req.query as unknown as ChartQuery;
    
    const { companyId } = req.user;
    
    // Validar parâmetros
    if (!startDate || !endDate) {
      throw new AppError("Datas inicial e final são obrigatórias", 400);
    }
    
    // Processar parâmetros
    const parsedQueueIds = queueIds ? JSON.parse(queueIds) : [];
    const parsedUserId = userId ? Number(userId) : undefined;
    const parsedEmployerId = employerId ? Number(employerId) : undefined;
    
    logger.debug("ChartsReportService - Parâmetros processados:", { 
      startDate, 
      endDate, 
      aggregation, 
      userId: parsedUserId, 
      queueIds: parsedQueueIds, 
      status, 
      employerId: parsedEmployerId,
      companyId 
    });
    
    const chartData = await ChartsReportService({
      startDate, 
      endDate, 
      aggregation: aggregation as 'day' | 'week' | 'month',
      userId: parsedUserId,
      queueIds: parsedQueueIds,
      status,
      employerId: parsedEmployerId,
      companyId
    });
    
    return res.json(chartData);
    
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error(err);
    throw new AppError("Erro ao buscar dados para gráficos", 500);
  }
};

export const exportPdf = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      startDate,
      endDate,
      userId,
      queueIds,
      tagIds,
      status,
      employerId,
      includeLogo
    } = req.body;
    
    const { companyId } = req.user;
    
    // Validar parâmetros
    if (!startDate || !endDate) {
      throw new AppError("Datas inicial e final são obrigatórias", 400);
    }
    
    // Processar userId e employerId
    const parsedUserId = userId ? Number(userId) : undefined;
    const parsedEmployerId = employerId ? Number(employerId) : undefined;
    
    logger.debug("ExportReportService - Parâmetros processados:", { 
      startDate, 
      endDate, 
      userId: parsedUserId, 
      queueIds, 
      tagIds, 
      status, 
      employerId: parsedEmployerId,
      includeLogo,
      companyId 
    });
    
    // Chamar serviço de exportação
    const pdfBuffer = await ExportReportService({
      startDate,
      endDate,
      userId: parsedUserId,
      queueIds,
      tagIds,
      status,
      employerId: parsedEmployerId,
      includeLogo,
      companyId
    });
    
    // Definir cabeçalhos da resposta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio-atendimentos.pdf`
    );
    
    // Enviar PDF como resposta
    return res.send(pdfBuffer);
    
  } catch (err) {
    logger.error(err);
    throw new AppError(
      err instanceof AppError ? err.message : "Erro ao gerar PDF",
      err instanceof AppError ? err.statusCode : 500
    );
  }
};

export const summary = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { 
      startDate, 
      endDate,
      userId,
      queueIds,
      status,
      employerId
    } = req.query as { 
      startDate: string; 
      endDate: string;
      userId?: string;
      queueIds?: string;
      status?: string;
      employerId?: string;
    };
    
    const { companyId } = req.user;
    
    // Validar parâmetros
    if (!startDate || !endDate) {
      throw new AppError("Datas inicial e final são obrigatórias", 400);
    }
    
    // Processar parâmetros
    const parsedQueueIds = queueIds ? JSON.parse(queueIds) : undefined;
    const parsedUserId = userId ? Number(userId) : undefined;
    const parsedEmployerId = employerId ? Number(employerId) : undefined;
    
    logger.debug("SummaryReportService - Parâmetros processados:", { 
      startDate, 
      endDate, 
      userId: parsedUserId, 
      queueIds: parsedQueueIds, 
      status, 
      employerId: parsedEmployerId,
      companyId 
    });
    
    const summaryData = await SummaryReportService({
      startDate,
      endDate,
      userId: parsedUserId,
      queueIds: parsedQueueIds,
      status,
      employerId: parsedEmployerId,
      companyId
    });
    
    return res.json(summaryData);
    
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error(err);
    throw new AppError("Erro ao buscar resumo de atendimentos", 500);
  }
};

export const exportCsv = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      dateStart,
      dateEnd,
      status,
      queueId,
    } = req.body;
    
    const { companyId } = req.user;
    
    // Validar parâmetros
    if (!dateStart || !dateEnd) {
      throw new AppError("Datas inicial e final são obrigatórias", 400);
    }
    
    // Processar parâmetros
    const parsedQueueId = queueId ? Number(queueId) : undefined;
    
    logger.debug("ExportCsvService - Parâmetros processados:", { 
      dateStart, 
      dateEnd, 
      status, 
      queueId: parsedQueueId, 
      companyId 
    });
    
    // Usar o serviço para obter os dados formatados
    const formattedTickets = await ExportCsvService({
      dateStart,
      dateEnd,
      status,
      queueId: parsedQueueId,
      companyId
    });
    
    return res.json(formattedTickets);
    
  } catch (err) {
    logger.error(err);
    throw new AppError(
      err instanceof AppError ? err.message : "Erro ao exportar tickets para CSV",
      err instanceof AppError ? err.statusCode : 500
    );
  }
};

export default {
  index,
  charts,
  exportPdf,
  summary
};