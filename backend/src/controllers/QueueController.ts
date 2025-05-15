import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateQueueService from "../services/QueueService/CreateQueueService";
import DeleteQueueService from "../services/QueueService/DeleteQueueService";
import ListQueuesService from "../services/QueueService/ListQueuesService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import UpdateQueueService from "../services/QueueService/UpdateQueueService";
import { isNil } from "lodash";
import Queue from "../models/Queue";
import Tag from "../models/Tag";
import QueueTag from "../models/QueueTag";
import { head } from "lodash";
import fs from "fs";
import path from "path";
import AppError from "../errors/AppError";

type QueueFilter = {
  companyId: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId: userCompanyId } = req.user;
  const { companyId: queryCompanyId } = req.query as unknown as QueueFilter;
  let companyId = userCompanyId;

  if (!isNil(queryCompanyId)) {
    companyId = +queryCompanyId;
  }

  const queues = await ListQueuesService({ companyId });

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    color,
    greetingMessage,
    outOfHoursMessage,
    keywords,
    schedules,
    orderQueue,
    integrationId,
    promptId,
    tags,
    closeTicket,
    idFilaPBX
  } = req.body;
  
  const { companyId } = req.user;

  const queue = await CreateQueueService({
    name,
    color,
    greetingMessage,
    companyId,
    outOfHoursMessage,
    keywords,
    schedules,
    orderQueue: orderQueue === "" ? null : orderQueue,
    integrationId: integrationId === "" ? null : integrationId,
    promptId: promptId === "" ? null : promptId,
    tags,
    closeTicket,
    idFilaPBX: idFilaPBX === "" ? null : idFilaPBX
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-queue`, {
      action: "update",
      queue
    });

  return res.status(200).json(queue);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  const queue = await ShowQueueService(queueId, companyId);

  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;
  const {
    name,
    color,
    greetingMessage,
    outOfHoursMessage,
    keywords,
    newTicketOnTransfer,
    schedules,
    orderQueue,
    integrationId,
    promptId,
    tags,
    closeTicket,
    idFilaPBX
  } = req.body;

  const queue = await UpdateQueueService(queueId, {
    name,
    color,
    greetingMessage,
    outOfHoursMessage,
    keywords,
    newTicketOnTransfer,
    schedules,
    orderQueue: orderQueue === "" ? null : orderQueue,
    integrationId: integrationId === "" ? null : integrationId,
    promptId: promptId === "" ? null : promptId,
    tags,
    closeTicket,
    idFilaPBX
  }, companyId);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-queue`, {
      action: "update",
      queue
    });

  return res.status(201).json(queue);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  await DeleteQueueService(queueId, companyId);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-queue`, {
      action: "delete",
      queueId: +queueId
    });

  return res.status(200).send();
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    const queue = await Queue.findByPk(queueId);

    queue.update({
      mediaPath: file.filename,
      mediaName: file.originalname
    });

    return res.send({ mensagem: "Arquivo Salvo" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;

  try {
    const queue = await Queue.findByPk(queueId);
    const filePath = path.resolve("public", `company${queue.companyId}`, queue.mediaPath);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      fs.unlinkSync(filePath);
    }

    queue.mediaPath = null;
    queue.mediaName = null;
    await queue.save();
    return res.send({ mensagem: "Arquivo excluído" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const listTags = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  const queue = await Queue.findOne({
    where: { id: queueId, companyId },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color", "kanban"],
        through: { attributes: [] }
      }
    ]
  });

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  return res.status(200).json(queue.tags);
};

export const syncTags = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { tags } = req.body;
  const { companyId } = req.user;

  const queue = await Queue.findOne({
    where: { id: queueId, companyId }
  });

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  // Remove all existing tags
  await QueueTag.destroy({
    where: { queueId: queue.id }
  });

  // Add new tags
  if (tags && tags.length > 0) {
    const queueTags = tags.map(tagId => ({
      queueId: queue.id,
      tagId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await QueueTag.bulkCreate(queueTags);
  }

  // Fetch updated queue with tags
  const updatedQueue = await Queue.findOne({
    where: { id: queueId },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color", "kanban"]
      }
    ]
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-queue`, {
      action: "update",
      queue: updatedQueue
    });

  return res.status(200).json(updatedQueue);
};