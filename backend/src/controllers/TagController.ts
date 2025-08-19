import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import AppError from "../errors/AppError";

import CreateService from "../services/TagServices/CreateService";
import ListService from "../services/TagServices/ListService";
import UpdateService from "../services/TagServices/UpdateService";
import ShowService from "../services/TagServices/ShowService";
import DeleteService from "../services/TagServices/DeleteService";
import DeleteAllTagService from "../services/TagServices/DeleteAllTagService";
import SimpleListService from "../services/TagServices/SimpleListService";
import SyncTagService from "../services/TagServices/SyncTagsService";
import KanbanListService from "../services/TagServices/KanbanListService";
import { BulkDeleteService } from "../services/TagServices/BulkDeleteService";
import { BulkUpdateService } from "../services/TagServices/BulkUpdateService";
import BulkCreateService from "services/TagServices/BulkCreateService";

interface IndexQuery {
  searchParam?: string;
  pageNumber?: string | number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, pageSize = 10, searchParam } = req.query;
  const { companyId } = req.user;

  const { tags, count, hasMore } = await ListService({
    searchParam: typeof searchParam === 'string' ? searchParam : undefined,
    pageNumber: parseInt(pageNumber as string) || 1,
    pageSize: parseInt(pageSize as string) || 10,
    companyId,
  });

  return res.json({
    tags,
    count: parseInt(count.toString()) || 0, // Garante que count seja um número
    hasMore
  });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, color, kanban } = req.body;
    const { companyId } = req.user;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const tag = await CreateService({
      name,
      color,
      kanban: kanban ? 1 : 0,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("tag", {
      action: "create",
      tag
    });

    return res.status(200).json(tag);
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof AppError ? err.message : "Error creating tag";
    return res.status(400).json({ error: errorMessage });
  }
};

export const kanban = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  // Extrai o parâmetro allTags da query string e converte para booleano
  const allTags = req.query.allTags === "true";

  const tags = await KanbanListService({ companyId, alltags: allTags });

  return res.json({ lista: tags });
};


export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;

  const tag = await ShowService(tagId);

  return res.status(200).json(tag);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;
  const tagData = req.body;

  const tag = await UpdateService({ tagData, id: tagId });

  const io = getIO();
  io.emit("tag", {
    action: "update",
    tag
  });

  return res.status(200).json(tag);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;

  await DeleteService(tagId);

  const io = getIO();
  io.emit("tag", {
    action: "delete",
    tagId
  });

  return res.status(200).json({ message: "Tag deleted" });
};

export const removeAll = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    await DeleteAllTagService(companyId);
    return res.status(200).json({ message: "All tags deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting all tags" });
  }
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const tags = await SimpleListService({ searchParam, companyId });

  return res.json(tags);
};

export const syncTags = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body;
  const { companyId } = req.user;

  const tags = await SyncTagService({ ...data, companyId });

  return res.json(tags);
};

export const bulkCreate = async (req: Request, res: Response): Promise<Response> => {
  const { quantity, namePattern, kanban } = req.body;
  const { companyId } = req.user;

  try {
    const tags = await BulkCreateService({
      quantity,
      namePattern,
      kanban,
      companyId
    });

    return res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof AppError ? err.message : "Error creating tags in bulk";
    return res.status(400).json({ error: errorMessage });
  }
};

export const bulkDelete = async (req: Request, res: Response): Promise<Response> => {
  const { tagIds } = req.body;
  const { companyId } = req.user;

  try {
    await BulkDeleteService({ tagIds, companyId });
    
    return res.status(200).json({ message: "Tags deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting tags" });
  }
};

export const bulkUpdate = async (req: Request, res: Response): Promise<Response> => {
  const { tagIds, kanban } = req.body;
  const { companyId } = req.user;

  try {
    await BulkUpdateService({ tagIds, kanban, companyId });
    
    return res.status(200).json({ message: "Tags updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating tags" });
  }
};

export default {
  index,
  store,
  kanban,
  show,
  update,
  remove,
  removeAll,
  list,
  syncTags,
  bulkCreate,
  bulkDelete,
  bulkUpdate
};