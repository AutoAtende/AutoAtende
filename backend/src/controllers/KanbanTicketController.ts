// controllers/KanbanTicketController.ts
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import KanbanTicketIntegrationService from "../services/KanbanServices/KanbanTicketIntegrationService";
import { processKanbanIntegrationForImportedTickets } from "../services/TicketServices/FindOrCreateTicketService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

interface CreateCardFromTicketBody {
  ticketId: number;
  boardId?: number;
  laneId?: number;
}

interface AutoCreateCardsBody {
  queueId?: number;
  status?: string[];
  boardId?: number;
}

export const createCardFromTicket = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, boardId, laneId }: CreateCardFromTicketBody = req.body;
  const { companyId, id: userId } = req.user;

  try {
    if (!ticketId) {
      throw new AppError("ID do ticket é obrigatório", 400);
    }

    const card = await KanbanTicketIntegrationService.createCardFromTicket({
      ticketId,
      boardId,
      laneId,
      companyId,
      userId: Number(userId)
    });

    return res.status(201).json({
      success: true,
      message: 'Cartão criado a partir do ticket com sucesso',
      card
    });

  } catch (err) {
    logger.error("Erro ao criar cartão a partir do ticket:", err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao criar cartão a partir do ticket: " + err.message);
  }
};

export const autoCreateCards = async (req: Request, res: Response): Promise<Response> => {
  const { queueId, status, boardId }: AutoCreateCardsBody = req.body;
  const { companyId } = req.user;

  try {
    const createdCount = await KanbanTicketIntegrationService.autoCreateCardsForTickets({
      companyId,
      queueId,
      status,
      boardId
    });

    return res.status(200).json({
      success: true,
      message: `${createdCount} cartões criados automaticamente`,
      createdCount
    });

  } catch (err) {
    logger.error("Erro na criação automática de cartões:", err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro na criação automática de cartões: " + err.message);
  }
};

export const processImportedTickets = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const processedCount = await processKanbanIntegrationForImportedTickets(companyId);

    return res.status(200).json({
      success: true,
      message: `${processedCount} tickets importados processados para integração Kanban`,
      processedCount
    });

  } catch (err) {
    logger.error("Erro ao processar tickets importados:", err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao processar tickets importados: " + err.message);
  }
};

export const syncTicketStatus = async (req: Request, res: Response): Promise<Response> => {
  const { cardId } = req.params;
  const { laneId } = req.body;
  const { companyId } = req.user;

  try {
    if (!cardId || !laneId) {
      throw new AppError("ID do cartão e da lane são obrigatórios", 400);
    }

    await KanbanTicketIntegrationService.syncTicketStatus(
      parseInt(cardId),
      parseInt(laneId),
      companyId
    );

    return res.status(200).json({
      success: true,
      message: 'Status do ticket sincronizado com sucesso'
    });

  } catch (err) {
    logger.error("Erro ao sincronizar status do ticket:", err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao sincronizar status do ticket: " + err.message);
  }
};

export const updateCardFromTicket = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  try {
    if (!ticketId) {
      throw new AppError("ID do ticket é obrigatório", 400);
    }

    await KanbanTicketIntegrationService.updateCardFromTicket(
      parseInt(ticketId),
      companyId
    );

    return res.status(200).json({
      success: true,
      message: 'Cartão atualizado a partir do ticket com sucesso'
    });

  } catch (err) {
    logger.error("Erro ao atualizar cartão a partir do ticket:", err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao atualizar cartão a partir do ticket: " + err.message);
  }
};

export const archiveCardFromTicket = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  try {
    if (!ticketId) {
      throw new AppError("ID do ticket é obrigatório", 400);
    }

    await KanbanTicketIntegrationService.archiveCardFromTicket(parseInt(ticketId));

    return res.status(200).json({
      success: true,
      message: 'Cartão arquivado com sucesso'
    });

  } catch (err) {
    logger.error("Erro ao arquivar cartão:", err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao arquivar cartão: " + err.message);
  }
};

export default {
  createCardFromTicket,
  autoCreateCards,
  processImportedTickets,
  syncTicketStatus,
  updateCardFromTicket,
  archiveCardFromTicket
};