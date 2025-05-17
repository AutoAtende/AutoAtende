import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import KanbanChecklistService from "../services/KanbanServices/KanbanChecklistService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

interface IndexQuery {
  searchParam?: string;
  active?: string;
}

export const indexTemplates = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, active } = req.query as IndexQuery;
  const { companyId } = req.user;

  try {
    const templates = await KanbanChecklistService.findTemplates(
      companyId,
      searchParam,
      active === "false" ? false : true
    );

    return res.status(200).json(templates);
  } catch (error) {
    logger.error("Error fetching checklist templates:", error);
    throw new AppError("Error fetching checklist templates");
  }
};

export const showTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  try {
    const template = await KanbanChecklistService.findTemplateById(Number(templateId), companyId);

    return res.status(200).json(template);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error fetching checklist template:", error);
    throw new AppError("Error fetching checklist template");
  }
};

export const storeTemplate = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    itemsTemplate
  } = req.body;
  const { companyId, id: userId } = req.user;

  if (!name) {
    throw new AppError("Template name is required", 400);
  }

  if (!itemsTemplate || !Array.isArray(itemsTemplate) || itemsTemplate.length === 0) {
    throw new AppError("Template items are required", 400);
  }

  try {
    const template = await KanbanChecklistService.createTemplate({
      name,
      description,
      itemsTemplate,
      companyId,
      createdBy: Number(userId)
    });

    return res.status(201).json(template);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error creating checklist template:", error);
    throw new AppError("Error creating checklist template");
  }
};

export const updateTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const {
    name,
    description,
    itemsTemplate,
    active
  } = req.body;
  const { companyId } = req.user;

  try {
    const template = await KanbanChecklistService.updateTemplate(
      Number(templateId),
      companyId,
      {
        name,
        description,
        itemsTemplate,
        active
      }
    );

    return res.status(200).json(template);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error updating checklist template:", error);
    throw new AppError("Error updating checklist template");
  }
};

export const removeTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanChecklistService.deleteTemplate(Number(templateId), companyId);

    return res.status(200).json({ message: "Checklist template deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error deleting checklist template:", error);
    throw new AppError("Error deleting checklist template");
  }
};

export const applyTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId, cardId } = req.params;
  const { companyId } = req.user;

  try {
    const checklistItems = await KanbanChecklistService.applyTemplateToCard(
      Number(templateId),
      Number(cardId),
      companyId
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "apply-checklist-template",
      cardId: Number(cardId),
      checklistItems
    });

    return res.status(200).json(checklistItems);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error applying checklist template to card:", error);
    throw new AppError("Error applying checklist template to card");
  }
};

export const storeChecklistItem = async (req: Request, res: Response): Promise<Response> => {
  const { cardId } = req.params;
  const {
    description,
    required,
    position,
    templateId,
    assignedUserId
  } = req.body;
  const { companyId } = req.user;

  if (!description) {
    throw new AppError("Item description is required", 400);
  }

  try {
    const checklistItem = await KanbanChecklistService.createChecklistItem({
      description,
      required,
      position,
      cardId: Number(cardId),
      templateId,
      assignedUserId,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "create-checklist-item",
      cardId: Number(cardId),
      checklistItem
    });

    return res.status(201).json(checklistItem);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error creating checklist item:", error);
    throw new AppError("Error creating checklist item");
  }
};

export const updateChecklistItem = async (req: Request, res: Response): Promise<Response> => {
  const { itemId } = req.params;
  const {
    description,
    required,
    position,
    checked,
    assignedUserId
  } = req.body;
  const { companyId, id: userId } = req.user;

  try {
    const checklistItem = await KanbanChecklistService.updateChecklistItem(
      Number(itemId),
      companyId,
      {
        description,
        required,
        position,
        checked,
        assignedUserId,
        checkedBy: checked ? Number(userId) : undefined
      }
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "update-checklist-item",
      cardId: checklistItem.cardId,
      checklistItem
    });

    return res.status(200).json(checklistItem);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error updating checklist item:", error);
    throw new AppError("Error updating checklist item");
  }
};

export const removeChecklistItem = async (req: Request, res: Response): Promise<Response> => {
  const { itemId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanChecklistService.deleteChecklistItem(Number(itemId), companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "delete-checklist-item",
      itemId: Number(itemId)
    });

    return res.status(200).json({ message: "Checklist item deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error deleting checklist item:", error);
    throw new AppError("Error deleting checklist item");
  }
};

export const reorderChecklistItems = async (req: Request, res: Response): Promise<Response> => {
  const { cardId } = req.params;
  const { items } = req.body;
  const { companyId } = req.user;

  if (!items || !Array.isArray(items)) {
    throw new AppError("Items array is required", 400);
  }

  try {
    await KanbanChecklistService.reorderChecklistItems(
      Number(cardId),
      companyId,
      items
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-kanban`, {
      action: "reorder-checklist-items",
      cardId: Number(cardId),
      items
    });

    return res.status(200).json({ message: "Checklist items reordered successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error reordering checklist items:", error);
    throw new AppError("Error reordering checklist items");
  }
};

export default {
  indexTemplates,
  showTemplate,
  storeTemplate,
  updateTemplate,
  removeTemplate,
  applyTemplate,
  storeChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  reorderChecklistItems
};