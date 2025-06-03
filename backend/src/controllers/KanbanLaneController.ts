import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import KanbanLaneService from "../services/KanbanServices/KanbanLaneService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    color,
    icon,
    position,
    cardLimit,
    boardId,
    queueId
  } = req.body;
  const { companyId } = req.user;

  if (!name) {
    throw new AppError("Lane name is required", 400);
  }

  if (!boardId) {
    throw new AppError("BoardId is required", 400);
  }

  try {
    const lane = await KanbanLaneService.createLane({
      name,
      description,
      color,
      icon,
      position,
      cardLimit,
      boardId,
      queueId,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "create-lane",
      lane,
      boardId
    });

    return res.status(201).json(lane);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error creating kanban lane:", error);
    throw new AppError("Error creating kanban lane");
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { laneId } = req.params;
  const { companyId } = req.user;

  try {
    const lane = await KanbanLaneService.findLane(Number(laneId), companyId);

    return res.status(200).json(lane);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error fetching kanban lane:", error);
    throw new AppError("Error fetching kanban lane");
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { laneId } = req.params;
  const {
    name,
    description,
    color,
    icon,
    position,
    cardLimit,
    queueId,
    active
  } = req.body;
  const { companyId } = req.user;

  try {
    const lane = await KanbanLaneService.updateLane(Number(laneId), companyId, {
      name,
      description,
      color,
      icon,
      position,
      cardLimit,
      queueId,
      active
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "update-lane",
      lane,
      boardId: lane.boardId
    });

    return res.status(200).json(lane);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error updating kanban lane:", error);
    throw new AppError("Error updating kanban lane");
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { laneId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanLaneService.deleteLane(Number(laneId), companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "delete-lane",
      laneId: Number(laneId)
    });

    return res.status(200).json({ message: "Lane deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error deleting kanban lane:", error);
    throw new AppError("Error deleting kanban lane");
  }
};

export const reorderLanes = async (req: Request, res: Response): Promise<Response> => {
  const { boardId } = req.params;
  const { lanes } = req.body;
  const { companyId } = req.user;

  if (!lanes || !Array.isArray(lanes)) {
    throw new AppError("Lanes array is required", 400);
  }

  try {
    await KanbanLaneService.reorderLanes({
      boardId: Number(boardId),
      companyId,
      lanes
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "reorder-lanes",
      boardId: Number(boardId),
      lanes
    });

    return res.status(200).json({ message: "Lanes reordered successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error reordering kanban lanes:", error);
    throw new AppError("Error reordering kanban lanes");
  }
};

export default {
  store,
  show,
  update,
  remove,
  reorderLanes
};