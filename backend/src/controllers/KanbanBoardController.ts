import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import KanbanBoardService from "../services/KanbanServices/KanbanBoardService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

interface IndexQuery {
  searchParam?: string;
  active?: string;
  boardId?: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, active } = req.query as IndexQuery;
  const { companyId } = req.user;

  try {
    // Converter a string active para boolean de forma segura
    let activeBoolean: boolean;
    
    // Se active for explicitamente "false", use false
    // Caso contrário (incluindo undefined, "true", ou qualquer outro valor), use true como padrão
    activeBoolean = active === "false" ? false : true;

    const boards = await KanbanBoardService.findAllBoards({
      companyId,
      searchParam,
      active: activeBoolean
    });

    return res.status(200).json(boards);
  } catch (error) {
    logger.error("Error fetching kanban boards:", error);
    throw new AppError("Error fetching kanban boards");
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { boardId } = req.params;
  const { companyId } = req.user;

  try {
    const board = await KanbanBoardService.findBoard(Number(boardId), companyId);

    return res.status(200).json(board);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error fetching kanban board:", error);
    throw new AppError("Error fetching kanban board");
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    color,
    isDefault,
    defaultView
  } = req.body;
  const { companyId, id: userId } = req.user;

  if (!name) {
    throw new AppError("Board name is required", 400);
  }

  try {
    const board = await KanbanBoardService.createBoard({
      name,
      description,
      color,
      isDefault,
      defaultView,
      companyId,
      createdBy: Number(userId)
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "create",
      board
    });

    return res.status(201).json(board);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error creating kanban board:", error);
    throw new AppError("Error creating kanban board");
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { boardId } = req.params;
  const {
    name,
    description,
    color,
    isDefault,
    defaultView,
    active
  } = req.body;
  const { companyId } = req.user;

  try {
    const board = await KanbanBoardService.updateBoard(Number(boardId), companyId, {
      name,
      description,
      color,
      isDefault,
      defaultView,
      active
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "update",
      board
    });

    return res.status(200).json(board);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error updating kanban board:", error);
    throw new AppError("Error updating kanban board");
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { boardId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanBoardService.deleteBoard(Number(boardId), companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "delete",
      boardId: Number(boardId)
    });

    return res.status(200).json({ message: "Board deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error deleting kanban board:", error);
    throw new AppError("Error deleting kanban board");
  }
};

export default {
  index,
  show,
  store,
  update,
  remove
};