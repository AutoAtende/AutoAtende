import { Op, Sequelize } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface SummaryReportParams {
  startDate: string;
  endDate: string;
  companyId: number;
  userId?: number;
  queueIds?: number[];
  status?: string;
  employerId?: number;
}

interface SummaryReportResponse {
  totalTickets: number;
  totalMessages: number;
  averageMessagesPerTicket: number;
  ticketsByStatus: {
    open: number;
    pending: number;
    closed: number;
  };
  averageAttendanceTime: number;
  topUsers: {
    id: number;
    name: string;
    count: number;
  }[];
  topQueues: {
    id: number;
    name: string;
    color: string;
    count: number;
  }[];
}

const SummaryReportService = async ({
  startDate,
  endDate,
  companyId,
  userId,
  queueIds,
  status,
  employerId
}: SummaryReportParams): Promise<SummaryReportResponse> => {
  // Validações iniciais
  if (!startDate || !endDate) {
    throw new AppError("Data inicial e final são obrigatórias");
  }

  try {
    logger.debug("Iniciando SummaryReportService com parâmetros:", {
      startDate,
      endDate,
      companyId,
      userId,
      queueIds,
      status,
      employerId
    });

    const parsedStartDate = startOfDay(parseISO(startDate));
    const parsedEndDate = endOfDay(parseISO(endDate));
    
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
      
      // Se não encontrarmos contatos para este employer, retornamos dados padrão
      if (contactIds.length === 0) {
        logger.debug("Nenhum contato encontrado, retornando resumo vazio");
        return {
          totalTickets: 0,
          totalMessages: 0,
          averageMessagesPerTicket: 0,
          ticketsByStatus: {
            open: 0,
            pending: 0,
            closed: 0
          },
          averageAttendanceTime: 0,
          topUsers: [],
          topQueues: []
        };
      }
    }

    // Condições base para os filtros
    const baseWhereCondition: any = {
      companyId,
      createdAt: {
        [Op.gte]: parsedStartDate,
        [Op.lte]: parsedEndDate
      }
    };

    if (userId) {
      baseWhereCondition.userId = userId;
    }

    if (queueIds && queueIds.length > 0) {
      baseWhereCondition.queueId = {
        [Op.in]: queueIds
      };
    }

    if (status) {
      baseWhereCondition.status = status;
    }
    
    // Adicionar filtro por contactIds se tivermos employerId
    if (employerId && contactIds.length > 0) {
      baseWhereCondition.contactId = {
        [Op.in]: contactIds
      };
    }

    logger.debug("Condições WHERE base:", baseWhereCondition);

    // Estatísticas gerais
    const totalTickets = await Ticket.count({
      where: baseWhereCondition
    });

    logger.debug(`Total de tickets encontrados: ${totalTickets}`);

    // Buscar IDs dos tickets que atendem aos nossos critérios para filtrar mensagens
    const ticketIds = await Ticket.findAll({
      attributes: ['id'],
      where: baseWhereCondition,
      raw: true
    }).then(tickets => tickets.map(t => t.id));

    logger.debug(`IDs de tickets para filtrar mensagens: ${ticketIds.length} encontrados`);

    // Condição para mensagens (incluindo ticket relacionado com filtros)
    const messageWhereCondition: any = {
      companyId,
      createdAt: {
        [Op.gte]: parsedStartDate,
        [Op.lte]: parsedEndDate
      }
    };

    // Adicionar filtro de ticketId para mensagens
    if (ticketIds.length > 0) {
      messageWhereCondition.ticketId = {
        [Op.in]: ticketIds
      };
    } else if (employerId && contactIds.length > 0) {
      // Se não encontramos tickets mas temos employer, retornamos dados vazios
      return {
        totalTickets: 0,
        totalMessages: 0,
        averageMessagesPerTicket: 0,
        ticketsByStatus: {
          open: 0,
          pending: 0,
          closed: 0
        },
        averageAttendanceTime: 0,
        topUsers: [],
        topQueues: []
      };
    }

    // Contar mensagens
    const totalMessages = await Message.count({
      where: messageWhereCondition
    });

    logger.debug(`Total de mensagens encontradas: ${totalMessages}`);

    const averageMessagesPerTicket = totalTickets > 0 ? totalMessages / totalTickets : 0;

    // Total por status
    const statusWhereOpen = { ...baseWhereCondition, status: "open" };
    const statusWherePending = { ...baseWhereCondition, status: "pending" };
    const statusWhereClosed = { ...baseWhereCondition, status: "closed" };

    const [openTickets, pendingTickets, closedTickets] = await Promise.all([
      Ticket.count({ where: statusWhereOpen }),
      Ticket.count({ where: statusWherePending }),
      Ticket.count({ where: statusWhereClosed })
    ]);

    logger.debug(`Tickets por status - Abertos: ${openTickets}, Pendentes: ${pendingTickets}, Fechados: ${closedTickets}`);

    // Tempo médio de atendimento (em minutos) para tickets fechados
    const closedTicketsList = await Ticket.findAll({
      where: { ...baseWhereCondition, status: "closed" },
      attributes: ["createdAt", "updatedAt"],
      raw: true
    });

    logger.debug(`Tickets fechados para cálculo de tempo médio: ${closedTicketsList.length}`);

    let totalDuration = 0; // Soma total dos tempos de atendimento em minutos
    let validTicketsCount = 0; // Contador de tickets válidos

    closedTicketsList.forEach((ticket: any) => {
      const createdAt = new Date(ticket.createdAt);
      const updatedAt = new Date(ticket.updatedAt);

      // Verifica se as datas são válidas e se updatedAt é maior que createdAt
      if (createdAt && updatedAt && updatedAt > createdAt) {
        const durationMinutes = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60); // Duração em minutos
        totalDuration += durationMinutes;
        validTicketsCount++;
      }
    });

    // Calcula o tempo médio de atendimento em minutos
    const averageAttendanceTime = validTicketsCount > 0 ? totalDuration / validTicketsCount : 0;

    // Top 5 usuários por quantidade de tickets
    const topUsersWhere = { ...baseWhereCondition, userId: { [Op.not]: null } };
    const topUsersRaw = await Ticket.findAll({
      attributes: [
        "userId",
        [Sequelize.fn("count", Sequelize.col("Ticket.id")), "count"]
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"]
        }
      ],
      where: topUsersWhere,
      group: ["userId", "user.id"],
      order: [[Sequelize.literal('"count"'), "DESC"]],
      limit: 5,
      raw: true
    });

    logger.debug(`Top usuários encontrados: ${topUsersRaw.length}`);

    // Top 5 filas por quantidade de tickets
    const topQueuesWhere = { ...baseWhereCondition, queueId: { [Op.not]: null } };
    const topQueuesRaw = await Ticket.findAll({
      attributes: [
        "queueId",
        [Sequelize.fn("count", Sequelize.col("Ticket.id")), "count"]
      ],
      include: [
        {
          model: Queue,
          as: "queue",
          attributes: ["name", "color"]
        }
      ],
      where: topQueuesWhere,
      group: ["queueId", "queue.id"],
      order: [[Sequelize.literal('"count"'), "DESC"]],
      limit: 5,
      raw: true
    });

    logger.debug(`Top filas encontradas: ${topQueuesRaw.length}`);

    // Formatar dados
    const topUsers = topUsersRaw.map((item: any) => ({
      id: item.userId,
      name: item["user.name"] || "Desconhecido",
      count: parseInt(item.count)
    }));

    const topQueues = topQueuesRaw.map((item: any) => ({
      id: item.queueId,
      name: item["queue.name"] || "Desconhecido",
      color: item["queue.color"] || "#7367F0",
      count: parseInt(item.count)
    }));

    return {
      totalTickets,
      totalMessages,
      averageMessagesPerTicket,
      ticketsByStatus: {
        open: openTickets,
        pending: pendingTickets,
        closed: closedTickets
      },
      averageAttendanceTime,
      topUsers,
      topQueues
    };
  } catch (error) {
    logger.error("Erro ao gerar resumo:", error);
    throw new AppError("Erro ao buscar resumo de atendimentos", 500);
  }
};

export default SummaryReportService;