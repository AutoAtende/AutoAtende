import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Tag from "../models/Tag";
import Ticket from "../models/Ticket";
import QueueTag from "../models/QueueTag";
import Queue from "../models/Queue";
import Message from "../models/Message";
import Contact from "../models/Contact";
import { logger } from "../utils/logger";
import { Op } from "sequelize";
import AppError from "../errors/AppError";

interface QueryParams {
  searchParam?: string;
  queueId?: string | number;
  pageNumber?: string | number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  showAll?: string;
  userId?: string | number;
  withUnreadMessages?: string;
  viewType?: 'active' | 'closed';
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    searchParam,
    queueId,
    pageNumber = 1,
    status,
    dateFrom,
    dateTo,
    showAll,
    userId,
    viewType = 'active',
  } = req.query as QueryParams;

  const { companyId } = req.user;

  const whereCondition: any = {
    companyId
  };
  
  // Modificação para separar status "open" e "pending"
  // Se viewType é 'active', usamos o status específico fornecido, ou ambos se não foi fornecido
  if (viewType === 'active') {
    if (status) {
      // Se um status específico foi fornecido, use-o
      whereCondition.status = status;
    } else {
      // Caso contrário, use tanto "open" quanto "pending"
      whereCondition.status = {
        [Op.in]: ["open", "pending"]
      };
    }
  } else {
    // Se viewType é 'closed', mostre tickets fechados
    whereCondition.status = {
      [Op.in]: ["closed", "close"]
    };
  }
  
  if (queueId) {
    whereCondition.queueId = queueId;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { "$Contact.name$": { [Op.like]: `%${searchParam}%` } },
      { "$Contact.number$": { [Op.like]: `%${searchParam}%` } },
      { "$Message.body$": { [Op.like]: `%${searchParam}%` } }
    ];
  }

  if (dateFrom && dateTo) {
    whereCondition.createdAt = {
      [Op.between]: [
        new Date(`${dateFrom} 00:00:00`),
        new Date(`${dateTo} 23:59:59`)
      ]
    };
  }

  try {
    const limit = 100;
    const offset = (Number(pageNumber) - 1) * limit;

    const tickets = await Ticket.findAll({
      where: whereCondition,
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "profilePicUrl"]
        },
        {
          model: Queue,
          as: "queue",
          attributes: ["id", "name", "color"]
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "color"]
        },
        {
          model: Message,
          as: "messages",
          attributes: ["id", "body"],
          limit: 1,
          order: [["createdAt", "DESC"]]
        }
      ],
      limit,
      offset,
      order: [["updatedAt", "DESC"]]
    });

    const count = await Ticket.count({
      where: whereCondition
    });

    let kanbanTags = [];
    
    try {
      // Buscar os IDs das tags associadas à fila atual (via QueueTag), se houver queueId
      if (queueId) {
        const queueTags = await QueueTag.findAll({
          where: { queueId },
          attributes: ["tagId"]
        });

        // Obter os IDs das tags da fila
        const tagIds = queueTags.map((queueTag) => queueTag.tagId);
        
        // Se temos tagIds, buscamos as tags do kanban relacionadas
        if (tagIds.length > 0) {
          kanbanTags = await Tag.findAll({
            where: {
              companyId,
              kanban: 1,
              id: { [Op.in]: tagIds }
            },
            attributes: [
              "id", "name", "color", "kanban", "msgR", 
              "rptDays", "actCamp", "mediaPath", "mediaName"
            ]
          });
        }
      } else {
        // Se não houver queueId, buscamos todas as tags de kanban
        kanbanTags = await Tag.findAll({
          where: {
            companyId,
            kanban: 1
          },
          attributes: [
            "id", "name", "color", "kanban", "msgR", 
            "rptDays", "actCamp", "mediaPath", "mediaName"
          ]
        });
      }
    } catch (tagError) {
      logger.error("Error fetching kanban tags:", tagError);
      // Continuar mesmo com erro nas tags, para pelo menos mostrar os tickets
      kanbanTags = [];
    }

    return res.status(200).json({
      tickets,
      count,
      hasMore: count > offset + tickets.length,
      kanbanTags
    });

  } catch (err) {
    logger.error(err);
    throw new AppError("Error fetching tickets");
  }
};

export const listKanbanTags = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    // Buscar apenas as informações existentes nas colunas da tabela Tag
    const tags = await Tag.findAll({
      where: { 
        companyId,
        kanban: 1 
      },
      attributes: [
        "id", 
        "name",
        "color",
        "kanban",
        "msgR",
        "rptDays",
        "actCamp",
        "mediaPath",
        "mediaName"
      ],
      order: [["name", "ASC"]]
    });

    return res.status(200).json({ lista: tags });

  } catch (err) {
    logger.error(err);
    throw new AppError("Error fetching kanban tags");
  }
};

export default {
  index,
  listKanbanTags
};