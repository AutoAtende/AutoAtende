import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
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
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  companyId: number;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
  tagValues?: { [tagId: number]: number };
}

/**
 * Serviço para listar tickets no formato Kanban.
 * @param {Object} params - Parâmetros da requisição.
 * @param {string} [params.searchParam] - Parâmetro de busca.
 * @param {string} [params.pageNumber] - Número da página.
 * @param {string} [params.status] - Status do ticket.
 * @param {string} [params.date] - Data de criação do ticket.
 * @param {string} [params.updatedAt] - Data de atualização do ticket.
 * @param {string} [params.showAll] - Flag para mostrar todos os tickets.
 * @param {string} params.userId - ID do usuário.
 * @param {string} [params.withUnreadMessages] - Flag para incluir mensagens não lidas.
 * @param {number[]} params.queueIds - IDs das filas.
 * @param {number[]} params.tags - IDs das tags.
 * @param {number[]} params.users - IDs dos usuários.
 * @param {number} params.companyId - ID da empresa.
 * @returns {Promise<Response>} - Retorna um objeto com os tickets, contagem e informações adicionais.
 */
const ListTicketsServiceKanban = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  companyId
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: { [Op.or]: [queueIds, null] }
  };
  let includeCondition: Includeable[];

  includeCondition = [

    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "presence", "profilePicUrl"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "color"],
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
      attributes: ["name", "color"]
    }
  ];

  if (showAll === "true") {
    whereCondition = {
      queueId: { [Op.or]: [queueIds, null] },
      userId
    };
  }

  whereCondition = {
    ...whereCondition,
    status: { [Op.or]: ["pending", "open"] }
  };

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
    // Optimized: Single query to get all ticket tags for all requested tags
    const ticketTags = await TicketTag.findAll({
      where: { 
        tagId: { [Op.in]: tags }
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
    attributes: ['id', 'value', 'sku', 'uuid', 'createdAt', 'updatedAt'],
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    subQuery: false,
  });
  const hasMore = count > offset + tickets.length;
  // Função para calcular a soma dos valores dos tickets por tag
  const tagValues = await calculateTagValues(tags, companyId);

  return {
    tickets,
    count,
    hasMore,
    tagValues
  };
};

async function calculateTagValues(tags: number[], companyId: number): Promise<{ [tagId: number]: number }> {
  const tagValues: { [tagId: number]: number } = {};
  for (const tagId of tags) {
    const tickets = await Ticket.findAll({
      include: [{
        model: Tag,
        as: 'tags',
        where: { id: tagId },
        attributes: []
      }],
      where: { companyId },
      attributes: ['value'] // Only select the 'value' attribute
    });

    tagValues[tagId] = tickets.reduce((acc, ticket) => acc + ticket.value, 0);
  }
  return tagValues;
}

export default ListTicketsServiceKanban;
