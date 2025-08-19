// src/services/TicketServices/ListTicketsService.ts
import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Company from "../../models/Company";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { intersection } from "../../utils/helpers";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  startDate: string;
  endDate: string;
  updatedAt?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  companyId: number;
  reasonId?: string;
  isGroupSuperAdmin?: boolean
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  startDate,
  endDate,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  reasonId,
  companyId,
  isGroupSuperAdmin = false
}: Request): Promise<Response> => {
  const user = await ShowUserService(userId);
  const userQueueIds = user.queues.map(queue => queue.id);

  // CORREÇÃO: Lógica corrigida para evitar inconsistências
  let whereCondition: Filterable["where"] = {};
  let includeCondition: Includeable[];

  // Definir condições baseadas no perfil do usuário
  if (user.profile === "user") {
    // Para usuários normais: mostrar apenas tickets atribuídos a eles OU tickets pending sem usuário
    whereCondition = {
      [Op.or]: [
        { 
          userId: user.id,
          status: { [Op.ne]: "pending" } // Tickets atribuídos não podem ser pending
        },
        { 
          status: "pending",
          userId: { [Op.is]: null } // Tickets pending devem ter userId null
        }
      ],
      queueId: { [Op.or]: [userQueueIds, null] }
    };
  } else {
    // Para admins e outros perfis
    if (showAll === "true" || user.allTicket === "enabled") {
      whereCondition = { 
        queueId: { [Op.or]: [queueIds, null] }
      };
    } else {
      whereCondition = {
        [Op.or]: [
          { 
            userId: user.id,
            status: { [Op.ne]: "pending" }
          },
          { 
            status: "pending",
            userId: { [Op.is]: null }
          }
        ],
        queueId: { [Op.or]: [queueIds, null] }
      };
    }
  }

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl", "presence"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "color", "ramal", "profilePic"],
      include: [
        { 
          model: Whatsapp,
          as: 'whatsapp',
          attributes: ['id', 'name', 'status', 'color']
         }
      ]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name","color"]
    },
    { model: Company, as: "company", attributes: ["urlPBX"] }
  ];

  // Aplicar filtro de status se especificado
  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  // Aplicar outros filtros...
  if (startDate && endDate) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(startDate)), +endOfDay(parseISO(endDate))]
      }
    };
  }

  if (reasonId) {
    whereCondition = {
      ...whereCondition,
      reasonId
    };
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  if (date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }

  if (updatedAt) {
    whereCondition = {
      updatedAt: {
        [Op.between]: [
          +startOfDay(parseISO(updatedAt)),
          +endOfDay(parseISO(updatedAt))
        ]
      }
    };
  }

  if (withUnreadMessages === "true") {
    whereCondition = {
      ...whereCondition,
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  if (Array.isArray(tags) && tags.length > 0) {
    // Optimized: Single query to get all ticket tags for all requested tags
    const ticketTags = await TicketTag.findAll({
      where: { 
        tagId: { [Op.in]: tags },
        companyId
      },
      attributes: ['ticketId', 'tagId']
    });

    // Group by ticketId and count tags
    const ticketTagCounts = ticketTags.reduce((acc: any, tt) => {
      acc[tt.ticketId] = (acc[tt.ticketId] || 0) + 1;
      return acc;
    }, {});

    // Filter tickets that have ALL required tags
    const validTicketIds = Object.keys(ticketTagCounts)
      .filter(ticketId => ticketTagCounts[ticketId] === tags.length)
      .map(id => parseInt(id));

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: validTicketIds
      }
    };
  }

  if (Array.isArray(users) && users.length > 0) {
    // Optimized: Use direct where condition instead of N+1 queries
    whereCondition = {
      ...whereCondition,
      userId: { [Op.in]: users }
    };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  whereCondition = {
    ...whereCondition,
    companyId
  };

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;