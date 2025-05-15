import Sequelize, { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Message from "../../models/Message";
import UserRating from "../../models/UserRating";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";//

interface ListTicketsReportParams {
  startDate: string;
  endDate: string;
  userId?: number;
  queueIds?: number[];
  tagIds?: number[];
  status?: string;
  employerId?: number;
  searchParam?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  companyId: number;
  showAll?: boolean;
}

interface ListTicketsReportResponse {
  tickets: any[];
  count: number;
  hasMore: boolean;
}

interface TicketJson {
  contact?: {
    name?: string;
    number?: string;
    email?: string;
    profilePicUrl?: string;
    employerId?: number;
  };
  queue?: {
    name?: string;
    color?: string;
  };
  user?: {
    name?: string;
    ratings?: {
      id: number;
      rate: number;
    }[];
  };
  messages?: {
    body?: string;
  }[];
  [key: string]: any;
}

export const ListTicketsReportService = async ({
  startDate,
  endDate,
  userId,
  queueIds,
  tagIds,
  status,
  employerId,
  searchParam,
  pageNumber = 1,
  pageSize = 20,
  sortBy = "createdAt",
  sortOrder = "DESC",
  companyId,
  showAll = false
}: ListTicketsReportParams): Promise<ListTicketsReportResponse> => {
  // Validações iniciais
  if (!startDate || !endDate) {
    throw new AppError("Data inicial e final são obrigatórias");
  }

  try {
    logger.debug("Iniciando ListTicketsReportService com parâmetros:", {
      startDate,
      endDate,
      userId,
      queueIds,
      tagIds,
      status,
      employerId,
      searchParam,
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
      companyId,
      showAll
    });

    // Se temos employerId, primeiro buscaremos todos os contatos dessa empresa
    let contactIds: number[] = [];
    
    if (employerId) {
      logger.debug(`Buscando contatos para employerId: ${employerId}`);
      const contacts = await Contact.findAll({
        where: {
          employerId,
          companyId
        },
        attributes: ['id']
      });
      
      contactIds = contacts.map(contact => contact.id);
      logger.debug(`Encontrados ${contactIds.length} contatos para employerId ${employerId}`);
      
      // Se não encontrarmos contatos para este employer, retornamos um array vazio
      if (contactIds.length === 0) {
        logger.debug("Nenhum contato encontrado, retornando lista vazia");
        return {
          tickets: [],
          count: 0,
          hasMore: false
        };
      }
    }

    // Construir condições da consulta
    const whereCondition: any = {
      companyId,
      createdAt: {
        [Op.gte]: `${startDate} 00:00:00`,
        [Op.lte]: `${endDate} 23:59:59.999`
      }
    };

    if (userId && !showAll) {
      whereCondition.userId = userId;
    }

    if (queueIds && queueIds.length > 0) {
      whereCondition.queueId = {
        [Op.in]: queueIds
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // Adicionar filtro por contactIds se tivermos employerId
    if (employerId && contactIds.length > 0) {
      whereCondition.contactId = {
        [Op.in]: contactIds
      };
    }

    if (searchParam) {
      const search = `%${searchParam}%`;
      whereCondition[Op.or] = [
        { lastMessage: { [Op.like]: search } },
        { "$contact.name$": { [Op.like]: search } },
        { "$contact.number$": { [Op.like]: search } }
      ];
    }

    logger.debug("Condições WHERE para consulta de tickets:", whereCondition);

    // Configurar paginação
    const limit = pageSize;
    const offset = (pageNumber - 1) * limit;

    // Incluir associações
    const include: any = [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "email", "profilePicUrl", "employerId"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        limit: 1,
        order: [["createdAt", "DESC"]]
      }
    ];

    // Aplicar filtro por tags
    if (tagIds && tagIds.length > 0) {
      include.push({
        model: Tag,
        as: "tags",
        where: { id: { [Op.in]: tagIds } },
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      });
    } else {
      // Incluir tags sem filtro
      include.push({
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      });
    }

    // Configurar ordem
    const order: any = [[sortBy, sortOrder]];

    // Executar consulta principal para obter tickets
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereCondition,
      include,
      limit,
      offset,
      order,
      distinct: true,
      subQuery: false
    });

    logger.debug(`Tickets encontrados: ${tickets.length}, Total: ${count}`);

    // NOVA PARTE: Buscar avaliações para todos os tickets de uma vez
    const ticketIds = tickets.map(ticket => ticket.id);
    const userRatings = await UserRating.findAll({
      where: {
        ticketId: {
          [Op.in]: ticketIds
        }
      },
      attributes: ['ticketId', 'rate']
    });

    // Criar um mapa de avaliações por ID de ticket
    const ratingsMap = new Map();
    userRatings.forEach(rating => {
      ratingsMap.set(rating.ticketId, rating.rate);
    });

    // Processar dados para o frontend
    const formattedTickets = tickets.map(ticket => {
      const ticketJson: TicketJson = ticket.toJSON();
      
      return {
        ...ticketJson,
        contactName: ticketJson.contact?.name || '-',
        queueName: ticketJson.queue?.name || '-',
        userName: ticketJson.user?.name || '-',
        lastMessage: ticketJson.messages && ticketJson.messages.length > 0 
          ? ticketJson.messages[0].body 
          : '-',
        rating: ratingsMap.get(ticket.id) || null // Usar o mapa de avaliações
      };
    });

    return {
      tickets: formattedTickets,
      count,
      hasMore: count > offset + tickets.length
    };
  } catch (error) {
    logger.error("Erro na consulta de tickets:", error);
    throw new AppError("Erro ao buscar tickets para relatório", 500);
  }
};

export default ListTicketsReportService;