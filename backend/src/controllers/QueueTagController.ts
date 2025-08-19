import { Request, Response } from "express";
import AppError from "../errors/AppError";
import Queue from "../models/Queue";
import Tag from "../models/Tag";
import QueueTag from "../models/QueueTag";
import { getIO } from "../libs/optimizedSocket";

export const listQueueTags = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  const queue = await Queue.findOne({
    where: { id: queueId, companyId },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ]
  });

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  return res.status(200).json(queue.tags);
};

export const addQueueTag = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { tagId } = req.body;
  const { companyId } = req.user;

  const queue = await Queue.findOne({
    where: { id: queueId, companyId }
  });

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  const tag = await Tag.findOne({
    where: { id: tagId, companyId }
  });

  if (!tag) {
    throw new AppError("Tag not found", 404);
  }

  const [queueTag] = await QueueTag.findOrCreate({
    where: { queueId, tagId }
  });

  const io = getIO();
  io.emit(`company-${companyId}-queueTag`, {
    action: "update",
    queueTag
  });

  return res.status(200).json(queueTag);
};

export const removeQueueTag = async (req: Request, res: Response): Promise<Response> => {
  const { queueId, tagId } = req.params;
  const { companyId } = req.user;

  const queue = await Queue.findOne({
    where: { id: queueId, companyId }
  });

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  await QueueTag.destroy({
    where: { queueId, tagId }
  });

  const io = getIO();
  io.emit(`company-${companyId}-queueTag`, {
    action: "delete",
    queueId,
    tagId
  });

  return res.status(200).json({ message: "Tag removed" });
};

// Adicionar ao QueueTagController.ts existente

export const listAvailableTags = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;
  try {
    // Busca na tabela QueueTag as associações de tags com a fila selecionada
    const queueTags = await QueueTag.findAll({
      where: { queueId }, // Filtra pelas associações da fila selecionada
      include: [
        {
          model: Tag,
          as: "tag",
          attributes: ["id", "name", "color", "kanban"], // Puxa apenas os detalhes necessários da tabela Tag
        },
      ],
    });

    // Mapeia os dados das tags associadas
    const tags = queueTags.map(queueTag => queueTag.tag);

    return res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags for the queue:", error);
    return res.status(500).json({ error: "Error fetching tags for the queue" });
  }
};

export const bulkSync = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { tagIds } = req.body;
  const { companyId } = req.user;

  const queue = await Queue.findOne({
    where: { id: queueId, companyId }
  });

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  await QueueTag.destroy({
    where: { queueId }
  });

  if (tagIds && tagIds.length > 0) {
    const tags = await Tag.findAll({
      where: { 
        id: tagIds,
        companyId,
        kanban: 1
      }
    });

    const queueTags = tags.map(tag => ({
      queueId,
      tagId: tag.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await QueueTag.bulkCreate(queueTags);
  }

  const updatedQueue = await Queue.findOne({
    where: { id: queueId },
    include: [{
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color", "kanban"]
    }]
  });

  const io = getIO();
  io.to(`company-${companyId}-queue`)
    .emit(`company-${companyId}-queueTags`, {
      action: "update",
      queueId,
      tags: updatedQueue.tags
    });

  return res.status(200).json(updatedQueue.tags);
};