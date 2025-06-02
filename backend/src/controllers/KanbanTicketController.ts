import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import KanbanTicketService from "../services/KanbanServices/KanbanTicketService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

interface KanbanQuery {
  queueId?: string;
  status?: string;
  searchParam?: string;
  users?: string;
  dateFrom?: string;
  dateTo?: string;
  viewType?: 'active' | 'closed';
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    queueId,
    status,
    searchParam,
    users,
    dateFrom,
    dateTo,
    viewType = 'active'
  } = req.query as KanbanQuery;
  const { companyId } = req.user;

  try {
    let userIds: number[] = [];
    if (users) {
      try {
        userIds = JSON.parse(users);
      } catch (error) {
        logger.error('Erro ao parsear usuários:', error);
      }
    }

    let statusArray: string[] = ['pending', 'open'];
    if (status) {
      try {
        statusArray = JSON.parse(status);
      } catch (error) {
        statusArray = [status];
      }
    }

    const result = await KanbanTicketService.findTicketsForKanban({
      companyId,
      queueId: queueId ? Number(queueId) : undefined,
      status: statusArray,
      searchParam,
      users: userIds.length > 0 ? userIds : undefined,
      dateFrom,
      dateTo,
      viewType
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error("Erro ao buscar dados do Kanban:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const moveTicket = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { targetLaneId } = req.body;
  const { companyId } = req.user;

  try {
    if (!targetLaneId) {
      throw new AppError("Lane de destino é obrigatória", 400);
    }

    await KanbanTicketService.moveTicketToLane(
      Number(ticketId),
      targetLaneId,
      companyId
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "move-ticket",
      ticketId: Number(ticketId),
      targetLaneId
    });

    return res.status(200).json({ 
      success: true,
      message: "Ticket movido com sucesso" 
    });
  } catch (error) {
    logger.error("Erro ao mover ticket:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export default {
  index,
  moveTicket
};