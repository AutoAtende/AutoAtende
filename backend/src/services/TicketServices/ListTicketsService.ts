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
  //chatbot?: boolean | string;
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

/**
 * Serviço para listar tickets com base em diversos parâmetros de busca.
 *
 * @param {Object} params - Parâmetros de entrada para a busca de tickets.
 * @param {string} [params.searchParam] - Parâmetro de busca para filtrar tickets.
 * @param {string} [params.pageNumber] - Número da página para paginação.
 * @param {string} [params.status] - Status dos tickets a serem filtrados.
 * @param {string} [params.date] - Data específica para filtrar tickets.
 * @param {string} params.startDate - Data de início para o intervalo de busca.
 * @param {string} params.endDate - Data de fim para o intervalo de busca.
 * @param {string} [params.updatedAt] - Data de atualização para filtrar tickets.
 * @param {string} [params.showAll] - Flag para mostrar todos os tickets.
 * @param {string} params.userId - ID do usuário que está fazendo a busca.
 * @param {string} [params.withUnreadMessages] - Flag para incluir tickets com mensagens não lidas.
 * @param {number[]} params.queueIds - IDs das filas para filtrar tickets.
 * @param {number[]} params.tags - IDs das tags para filtrar tickets.
 * @param {number[]} params.users - IDs dos usuários para filtrar tickets.
 * @param {number} params.companyId - ID da empresa associada aos tickets.
 * @param {string} [params.reasonId] - ID da razão para filtrar tickets.
 * @param {boolean} [params.isGroupSuperAdmin] - Flag para indicar se o usuário é um super admin de grupo.
 * 
 * @returns {Promise<Response>} - Retorna uma promessa com os tickets encontrados, contagem e se há mais tickets.
 */
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
  //chatbot,
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

  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: { [Op.or]: [queueIds, null] }
  };
  let includeCondition: Includeable[];

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

  if (user.profile === "user") {
    const TicketsUserFilter: any[] | null = [];

    let ticketsIds = [];

    ticketsIds = await Ticket.findAll({
      where: {
        userId: { [Op.or]: [user.id, null] },
        companyId,
      },
    });

    if (ticketsIds) {
      TicketsUserFilter.push(ticketsIds.map(t => t.id));
    }

    const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

    whereCondition = {
      ...whereCondition,
      id: ticketsIntersection
    };
  }

  if (showAll === "true" || (user.profile === "user" && user.allTicket === "enabled")) {
      whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

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

  //if (chatbot) {
  //  whereCondition = {
  //    ...whereCondition,
  //    chatbot
  //  };
  // }

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
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  if (Array.isArray(tags) && tags.length > 0) {
    const ticketsTagFilter: any[] | null = [];
    for (let tag of tags) {
      const ticketTags = await TicketTag.findAll({
        where: { tagId: tag }
      });
      if (ticketTags) {
        ticketsTagFilter.push(ticketTags.map(t => t.ticketId));
      }
    }

    const ticketsIntersection: number[] = intersection(...ticketsTagFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: ticketsIntersection
      }
    };
  }

  if (Array.isArray(users) && users.length > 0) {
    const ticketsUserFilter: any[] | null = [];
    for (let user of users) {
      const ticketUsers = await Ticket.findAll({
        where: { userId: user }
      });
      if (ticketUsers) {
        ticketsUserFilter.push(ticketUsers.map(t => t.id));
      }
    }

    const ticketsIntersection: number[] = intersection(...ticketsUserFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: ticketsIntersection
      }
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
