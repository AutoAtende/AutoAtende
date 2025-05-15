import { Op, Sequelize } from "sequelize";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Contact from "../../models/Contact";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface ChartsReportParams {
  startDate: string;
  endDate: string;
  aggregation: 'day' | 'week' | 'month';
  companyId: number;
  userId?: number;
  queueIds?: number[];
  status?: string;
  employerId?: number;
}

interface TicketsByQueue {
  queueId: number;
  queueName: string;
  queueColor: string;
  count: number;
}

interface TicketsByStatus {
  status: string;
  statusName: string;
  count: number;
  color: string;
}

interface TicketsByDate {
  date: string;
  count: number;
}

interface ChartsReportResponse {
  ticketsByQueue: TicketsByQueue[];
  ticketsByStatus: TicketsByStatus[];
  ticketsByDate: TicketsByDate[];
}

const ChartsReportService = async ({
  startDate,
  endDate,
  aggregation = 'day',
  companyId,
  userId,
  queueIds,
  status,
  employerId
}: ChartsReportParams): Promise<ChartsReportResponse> => {
  // Validações iniciais
  if (!startDate || !endDate) {
    throw new AppError("Data inicial e final são obrigatórias");
  }

  try {
    logger.debug("Iniciando ChartsReportService com parâmetros:", {
      startDate,
      endDate,
      aggregation,
      companyId,
      userId,
      queueIds,
      status,
      employerId
    });

    const parsedStartDate = startOfDay(parseISO(startDate)).getTime();
    const parsedEndDate = endOfDay(parseISO(endDate)).getTime();
    
    // Se temos employerId, primeiro buscaremos todos os contatos dessa empresa
    let contactIds: number[] = [];
    
    if (employerId) {
      logger.debug(`Buscando contatos para employerId ${employerId}`);
      const contacts = await Contact.findAll({
        where: {
          employerId,
          companyId
        },
        attributes: ['id']
      });
      
      contactIds = contacts.map(contact => contact.id);
      logger.debug(`Encontrados ${contactIds.length} contatos para employerId ${employerId}`);
      
      // Se não encontrarmos contatos para este employer, retornamos dados vazios
      if (contactIds.length === 0) {
        logger.debug(`Nenhum contato encontrado para employerId ${employerId}, retornando dados vazios`);
        return {
          ticketsByQueue: [],
          ticketsByStatus: [],
          ticketsByDate: []
        };
      }
    }

    // Condições de filtro comuns
    const baseWhereCondition: any = {
      companyId,
      createdAt: {
        [Op.between]: [parsedStartDate, parsedEndDate]
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

    // 1. Tickets por fila
    const ticketsQueueWhere = { ...baseWhereCondition, queueId: { [Op.not]: null } };
    logger.debug("Buscando tickets por fila com condições:", ticketsQueueWhere);
    
    const ticketsQueueRaw = await Ticket.findAll({
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
      where: ticketsQueueWhere,
      group: ["queueId", "queue.id"],
      raw: true
    });

    const ticketsByQueue = ticketsQueueRaw.map((item: any) => ({
      queueId: item.queueId,
      queueName: item["queue.name"],
      queueColor: item["queue.color"] || "#7367F0",
      count: parseInt(item.count)
    }));

    logger.debug(`Encontrados ${ticketsByQueue.length} filas com tickets`);

    // 2. Tickets por status
    const ticketsStatusWhere = { ...baseWhereCondition };
    logger.debug("Buscando tickets por status com condições:", ticketsStatusWhere);
    
    const ticketsStatusRaw = await Ticket.findAll({
      attributes: [
        "status",
        [Sequelize.fn("count", Sequelize.col("Ticket.id")), "count"]
      ],
      where: ticketsStatusWhere,
      group: ["status"],
      raw: true
    });

    const statusColors = {
      open: "#28C76F", // Verde
      pending: "#FF9F43", // Laranja
      closed: "#EA5455", // Vermelho
      default: "#7367F0" // Roxo (padrão do sistema)
    };

    const statusNames = {
      open: "Aberto",
      pending: "Pendente",
      closed: "Fechado"
    };

    const ticketsByStatus = ticketsStatusRaw.map((item: any) => ({
      status: item.status,
      statusName: statusNames[item.status] || item.status,
      count: parseInt(item.count),
      color: statusColors[item.status] || statusColors.default
    }));

    logger.debug(`Encontrados tickets com ${ticketsByStatus.length} status diferentes`);

    // 3. Tickets por período (dia, semana, mês)
    let dateGroup;
    let dateFormat;

    switch (aggregation) {
      case "week":
        dateGroup = Sequelize.fn(
          "date_trunc",
          "week",
          Sequelize.col("createdAt")
        );
        dateFormat = "dd/MM/yyyy";
        break;
      case "month":
        dateGroup = Sequelize.fn(
          "date_trunc",
          "month",
          Sequelize.col("createdAt")
        );
        dateFormat = "MM/yyyy";
        break;
      default: // dia
        dateGroup = Sequelize.fn(
          "date_trunc",
          "day",
          Sequelize.col("createdAt")
        );
        dateFormat = "dd/MM/yyyy";
    }

    logger.debug(`Buscando tickets por data com agregação: ${aggregation}`);
    const ticketsDateWhere = { ...baseWhereCondition };
    const ticketsDateRaw = await Ticket.findAll({
      attributes: [
        [dateGroup, "date"],
        [Sequelize.fn("count", Sequelize.col("Ticket.id")), "count"]
      ],
      where: ticketsDateWhere,
      group: ["date"],
      order: [[Sequelize.literal('"date"'), "ASC"]],
      raw: true
    });

    // Formatar datas para o formato brasileiro
    const ticketsByDate = ticketsDateRaw.map((item: any) => ({
      date: format(new Date(item.date), dateFormat, { locale: pt }),
      count: parseInt(item.count)
    }));

    logger.debug(`Encontrados dados de tickets para ${ticketsByDate.length} períodos de tempo`);

    return {
      ticketsByQueue,
      ticketsByStatus,
      ticketsByDate
    };
  } catch (error) {
    logger.error("Erro ao gerar dados para gráficos:", error);
    throw new AppError("Erro ao buscar dados para gráficos", 500);
  }
};

export default ChartsReportService;