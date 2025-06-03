import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import KanbanCardService from "../services/KanbanServices/KanbanCardService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

interface IndexQuery {
  boardId?: string;
  laneId?: string;
  assignedUserId?: string;
  searchParam?: string;
  showArchived?: string;
  ticketId?: string;
  contactId?: string;
  tags?: string;
  startDueDate?: string;
  endDueDate?: string;
  priority?: string;
  isBlocked?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    boardId,
    laneId,
    assignedUserId,
    searchParam,
    showArchived,
    ticketId,
    contactId,
    tags,
    startDueDate,
    endDueDate,
    priority,
    isBlocked
  } = req.query as IndexQuery;
  const { companyId } = req.user;

  try {
    let tagsArray: number[] = [];
    if (tags) {
      try {
        tagsArray = JSON.parse(tags);
      } catch (error) {
        throw new AppError("Invalid tags format", 400);
      }
    }

    let priorityArray: number[] = [];
    if (priority) {
      try {
        priorityArray = JSON.parse(priority);
      } catch (error) {
        throw new AppError("Invalid priority format", 400);
      }
    }

    const { cards, count } = await KanbanCardService.findCards({
      companyId,
      boardId: boardId ? Number(boardId) : undefined,
      laneId: laneId ? Number(laneId) : undefined,
      assignedUserId: assignedUserId ? Number(assignedUserId) : undefined,
      searchParam,
      showArchived: showArchived === "true",
      ticketId: ticketId ? Number(ticketId) : undefined,
      contactId: contactId ? Number(contactId) : undefined,
      tags: tagsArray,
      startDueDate: startDueDate ? new Date(startDueDate) : undefined,
      endDueDate: endDueDate ? new Date(endDueDate) : undefined,
      priority: priorityArray,
      isBlocked: isBlocked ? isBlocked === "true" : undefined
    });

    return res.status(200).json({ cards, count });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error fetching kanban cards:", error);
    throw new AppError("Error fetching kanban cards");
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { cardId } = req.params;
  const { companyId } = req.user;

  try {
    const card = await KanbanCardService.findCard(Number(cardId), companyId);

    return res.status(200).json(card);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error fetching kanban card:", error);
    throw new AppError("Error fetching kanban card");
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    title,
    description,
    priority,
    dueDate,
    laneId,
    assignedUserId,
    contactId,
    ticketId,
    value,
    sku,
    tags,
    metadata
  } = req.body;
  const { companyId } = req.user;

  if (!laneId) {
    throw new AppError("LaneId is required", 400);
  }

  try {
    const card = await KanbanCardService.createCard({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      laneId,
      assignedUserId,
      contactId,
      ticketId,
      value,
      sku,
      tags,
      metadata,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "create-card",
      card,
      laneId
    });

    return res.status(201).json(card);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error creating kanban card:", error);
    throw new AppError("Error creating kanban card");
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { cardId } = req.params;
  const {
    title,
    description,
    priority,
    dueDate,
    laneId,
    assignedUserId,
    contactId,
    ticketId,
    value,
    sku,
    tags,
    metadata,
    isArchived,
    isBlocked,
    blockReason
  } = req.body;
  const { companyId } = req.user;

  try {
    const card = await KanbanCardService.updateCard(
      Number(cardId),
      companyId,
      {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        laneId,
        assignedUserId,
        contactId,
        ticketId,
        value,
        sku,
        tags,
        metadata,
        isArchived,
        isBlocked,
        blockReason
      }
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "update-card",
      card,
      laneId: card.laneId
    });

    return res.status(200).json(card);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error updating kanban card:", error);
    throw new AppError("Error updating kanban card");
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { cardId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanCardService.deleteCard(Number(cardId), companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "delete-card",
      cardId: Number(cardId)
    });

    return res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error deleting kanban card:", error);
    throw new AppError("Error deleting kanban card");
  }
};

export const moveCard = async (req: Request, res: Response): Promise<Response> => {
  const { cardId } = req.params;
  const { laneId } = req.body;
  const { companyId, id: userId } = req.user;

  if (!laneId) {
    throw new AppError("Target laneId is required", 400);
  }

  try {
    const card = await KanbanCardService.moveCard(
      Number(cardId),
      Number(laneId),
      companyId,
      Number(userId)
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "move-card",
      card,
      fromLaneId: card.laneId,
      toLaneId: laneId,
      userId: Number(userId)
    });

    return res.status(200).json(card);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error moving kanban card:", error);
    throw new AppError("Error moving kanban card");
  }
};

export default {
  index,
  show,
  store,
  update,
  remove,
  moveCard
};