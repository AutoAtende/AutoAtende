import { Op, Sequelize, fn, col, literal, QueryTypes } from "sequelize";
import sequelize from "../../database";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import UserRating from "../../models/UserRating";
import Company from "../../models/Company";
import TicketTraking from "../../models/TicketTraking";
import Whatsapp from "../../models/Whatsapp";
import moment from "moment";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface TimeRange {
  startDate?: Date;
  endDate?: Date;
}

interface TicketByStatus {
  status: string;
  count: number;
}

interface TicketByDay {
  date: string;
  count: number;
}

interface MessageByDay {
  date: string;
  count: number;
}

interface OverviewMetrics {
  totalTickets: number;
  ticketsByStatus: TicketByStatus[];
  totalMessages: number;
  averageResolutionTime: number;
  averageRating: number;
  newContacts: number;
}

interface OverviewResponse {
  overview: OverviewMetrics;
  ticketsByDay: TicketByDay[];
  messagesByDay: MessageByDay[];
}

interface TicketByQueue {
  queueId: number;
  queueName: string;
  queueColor: string;
  count: number;
}

interface TicketByUser {
  userId: number;
  userName: string;
  count: number;
}

interface TicketByHour {
  hour: number;
  count: number;
}

interface TicketByWeekday {
  weekday: number;
  count: number;
}

interface ResolutionTimeByQueue {
  queueId: number;
  queueName: string;
  queueColor: string;
  avgTime: number;
}

interface TicketsMetricsResponse {
  ticketsByStatus: TicketByStatus[];
  ticketsByQueue: TicketByQueue[];
  ticketsByUser: TicketByUser[];
  ticketsByHour: TicketByHour[];
  ticketsByWeekday: TicketByWeekday[];
  averageFirstResponseTime: number;
  averageResolutionTimeByQueue: ResolutionTimeByQueue[];
}

interface UserPerformance {
  userId: number;
  userName: string;
  userProfile: string;
  count: number;
}

interface MessagePerUser {
  userId: number;
  userName: string;
  count: number;
}

interface ResolutionTimePerUser {
  userId: number;
  userName: string;
  avgTime: number;
}

interface RatingPerUser {
  userId: number;
  userName: string;
  avgRate: number;
  count: number;
}

interface RatingDistribution {
  rate: number;
  count: number;
}

interface UsersMetricsResponse {
  ticketsPerUser: UserPerformance[];
  messagesPerUser: MessagePerUser[];
  avgResolutionTimePerUser: ResolutionTimePerUser[];
  ratingsPerUser: RatingPerUser[];
  ratingDistribution: RatingDistribution[];
}

interface ContactByDay {
  date: string;
  count: number;
}

interface TopContact {
  contactId: number;
  contactName: string;
  contactNumber: string;
  count: number;
}

interface ContactByHour {
  hour: number;
  count: number;
}

interface ContactByWeekday {
  weekday: number;
  count: number;
}

interface TopTag {
  tagId: number;
  tagName: string;
  tagColor: string;
  count: number;
}

interface ContactsMetricsResponse {
  newContactsByDay: ContactByDay[];
  contactsWithMostTickets: TopContact[];
  contactsByHour: ContactByHour[];
  contactsByWeekday: ContactByWeekday[];
  mostUsedTags: TopTag[];
}

interface QueueWaitTime {
  queueId: number;
  queueName: string;
  queueColor: string;
  avgWaitTime: number;
}

interface QueueResolutionTime {
  queueId: number;
  queueName: string;
  queueColor: string;
  avgResolutionTime: number;
}

interface QueueRating {
  queueId: number;
  queueName: string;
  queueColor: string;
  avgRate: number;
  count: number;
}

interface QueuesMetricsResponse {
  ticketsByQueue: TicketByQueue[];
  queueWaitTimes: QueueWaitTime[];
  queueResolutionTimes: QueueResolutionTime[];
  queueRatings: QueueRating[];
}

interface TagUsage {
  tagId: number;
  tagName: string;
  tagColor: string;
  count: number;
}

interface TagResolutionTime {
  tagId: number;
  tagName: string;
  tagColor: string;
  avgResolutionTime: number;
}

interface TagByStatus {
  tagId: number;
  tagName: string;
  tagColor: string;
  status: string;
  count: number;
}

interface TagsMetricsResponse {
  mostUsedTags: TagUsage[];
  avgResponseTimeByTag: TagResolutionTime[];
  tagsByTicketStatus: TagByStatus[];
}

interface UserQueueMetric {
  queueId: number;
  queueName: string;
  queueColor: string;
  tickets: number;
  messages: number;
}

class DashboardService {
  private getDateRange(startDate?: Date, endDate?: Date): TimeRange {
    const now = new Date();
    const defaultStartDate = new Date(now);
    defaultStartDate.setDate(now.getDate() - 30); // 30 dias atrás como padrão
    return {
      startDate: startDate || defaultStartDate,
      endDate: endDate || now
    };
  }

  private buildDateCondition(startDate?: Date, endDate?: Date): any {
    const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);
    return {
      [Op.between]: [
        start,
        end
      ]
    };
  }

  public async getOverviewMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<OverviewResponse> {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    logger.info("DashboardService.getOverviewMetrics - Iniciando consulta", {
      companyId,
      dateCondition
    });

    try {
      // Total de tickets no período
      const totalTickets = await Ticket.count({
        where: {
          companyId,
          createdAt: dateCondition
        }
      });

      logger.info("Total de tickets obtido", { totalTickets });

      // Tickets por status
      const ticketsByStatus = await Ticket.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: ['status'],
        raw: true
      }) as unknown as Array<{ status: string; count: string }>;

      logger.info("Tickets por status obtidos", { ticketsByStatus });

      // Tickets por dia no período
      const ticketsByDay = await Ticket.findAll({
        attributes: [
          [fn('date', col('createdAt')), 'date'],
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: [fn('date', col('createdAt'))],
        order: [[fn('date', col('createdAt')), 'ASC']],
        raw: true
      }) as unknown as Array<{ date: string; count: string }>;

      logger.info("Tickets por dia obtidos", { ticketsByDay });

      // Total de mensagens no período
      const totalMessages = await Message.count({
        where: {
          companyId,
          createdAt: dateCondition
        }
      });

      logger.info("Total de mensagens obtido", { totalMessages });

      // Mensagens por dia
      const messagesByDay = await Message.findAll({
        attributes: [
          [fn('date', col('createdAt')), 'date'],
          [fn('COUNT', col('Message.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: [fn('date', col('createdAt'))],
        order: [[fn('date', col('createdAt')), 'ASC']],
        raw: true
      }) as unknown as Array<{ date: string; count: string }>;

      logger.info("Mensagens por dia obtidas", { messagesByDay });

      // Tempo médio de resolução (em minutos)
      const avgResolutionTimeResult = await TicketTraking.findOne({
        attributes: [
          [
            fn('AVG',
              literal('EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) / 60')
            ),
            'avgTime'
          ]
        ],
        where: {
          companyId,
          startedAt: { [Op.not]: null },
          finishedAt: { [Op.not]: null },
          createdAt: dateCondition
        },
        raw: true
      }) as unknown as { avgTime: string | null };

      const averageResolutionTime = avgResolutionTimeResult?.avgTime ? 
        parseFloat(avgResolutionTimeResult.avgTime) : 0;

      logger.info("Tempo médio de resolução obtido", { averageResolutionTime });

      // Taxa de avaliação média
      const avgRatingResult = await UserRating.findOne({
        attributes: [
          [fn('AVG', col('UserRating.rate')), 'avgRate']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        raw: true
      }) as unknown as { avgRate: string | null };

      const averageRating = avgRatingResult?.avgRate ? 
        parseFloat(avgRatingResult.avgRate) : 0;

      logger.info("Avaliação média obtida", { averageRating });

      // Novos contatos no período
      const newContacts = await Contact.count({
        where: {
          companyId,
          createdAt: dateCondition
        }
      });

      logger.info("Novos contatos obtidos", { newContacts });

      // Formatação dos dados para o frontend
      const formattedTicketsByStatus = ticketsByStatus.map((status) => ({
        status: status.status,
        count: parseInt(status.count)
      }));

      const formattedTicketsByDay = ticketsByDay.map((day) => ({
        date: moment(day.date).format('YYYY-MM-DD'),
        count: parseInt(day.count)
      }));

      const formattedMessagesByDay = messagesByDay.map((day) => ({
        date: moment(day.date).format('YYYY-MM-DD'),
        count: parseInt(day.count)
      }));

      const response: OverviewResponse = {
        overview: {
          totalTickets,
          ticketsByStatus: formattedTicketsByStatus,
          totalMessages,
          averageResolutionTime,
          averageRating,
          newContacts
        },
        ticketsByDay: formattedTicketsByDay,
        messagesByDay: formattedMessagesByDay
      };

      logger.info("Resposta completa da visão geral formatada", { response });

      return response;
    } catch (error) {
      logger.error("Erro em getOverviewMetrics", { error });
      throw new AppError("Erro ao buscar métricas de visão geral", 500);
    }
  }

  public async getTicketsMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<TicketsMetricsResponse> {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    logger.info("DashboardService.getTicketsMetrics - Iniciando consulta", {
      companyId,
      dateCondition
    });

    try {
      // Tickets por status
      const ticketsByStatus = await Ticket.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: ['status'],
        raw: true
      }) as unknown as Array<{ status: string; count: string }>;

      // Tickets por fila
      const ticketsByQueue = await Ticket.findAll({
        attributes: [
          'queueId',
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        include: [
          {
            model: Queue,
            as: 'queue',
            attributes: ['name', 'color'],
            required: false
          }
        ],
        where: {
          companyId,
          createdAt: dateCondition,
          queueId: { [Op.not]: null }
        },
        group: ['queueId', 'queue.id', 'queue.name', 'queue.color'],
        raw: true,
        nest: true
      }) as unknown as Array<{ 
        queueId: number; 
        count: string; 
        queue: { name: string; color: string } 
      }>;

      // Tickets por atendente
      const ticketsByUser = await Ticket.findAll({
        attributes: [
          'userId',
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name'],
            required: false
          }
        ],
        where: {
          companyId,
          createdAt: dateCondition,
          userId: { [Op.not]: null }
        },
        group: ['userId', 'user.id', 'user.name'],
        raw: true,
        nest: true
      }) as unknown as Array<{ 
        userId: number; 
        count: string; 
        user: { name: string } 
      }>;

      // Tickets por hora do dia
      const ticketsByHour = await Ticket.findAll({
        attributes: [
          [fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'hour'],
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: [fn('EXTRACT', literal('HOUR FROM "createdAt"'))],
        order: [[fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'ASC']],
        raw: true
      }) as unknown as Array<{ hour: string; count: string }>;

      // Tickets por dia da semana
      const ticketsByWeekday = await Ticket.findAll({
        attributes: [
          [fn('EXTRACT', literal('DOW FROM "createdAt"')), 'weekday'],
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: [fn('EXTRACT', literal('DOW FROM "createdAt"'))],
        order: [[fn('EXTRACT', literal('DOW FROM "createdAt"')), 'ASC']],
        raw: true
      }) as unknown as Array<{ weekday: string; count: string }>;

      // Tempo médio de primeira resposta
      const avgFirstResponseResult = await sequelize.query<{ avgTime: string | null }>(`
        SELECT AVG(EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60) as "avgTime"
        FROM "Messages" m
        INNER JOIN "Tickets" t ON t.id = m."ticketId"
        WHERE m."companyId" = :companyId
        AND m."fromMe" = true
        AND m."createdAt" BETWEEN :startDate AND :endDate
        AND t."createdAt" BETWEEN :startDate AND :endDate
        AND m.id = (
          SELECT MIN(m2.id)
          FROM "Messages" m2
          WHERE m2."ticketId" = t.id
          AND m2."fromMe" = true
        )
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT,
        plain: true
      });

      const averageFirstResponseTime = avgFirstResponseResult?.avgTime ? 
        parseFloat(avgFirstResponseResult.avgTime) : 0;

      // Tempo médio de resolução por fila
      const avgResolutionByQueue = await sequelize.query<{ 
        queueId: number; 
        queueName: string; 
        queueColor: string; 
        avgTime: string;
      }>(`
        SELECT 
          t."queueId",
          q.name as "queueName",
          q.color as "queueColor",
          AVG(EXTRACT(EPOCH FROM (tt."finishedAt" - tt."startedAt")) / 60) as "avgTime"
        FROM "TicketTraking" tt
        INNER JOIN "Tickets" t ON t.id = tt."ticketId"
        LEFT JOIN "Queues" q ON q.id = t."queueId"
        WHERE tt."companyId" = :companyId
        AND tt."startedAt" IS NOT NULL
        AND tt."finishedAt" IS NOT NULL
        AND tt."createdAt" BETWEEN :startDate AND :endDate
        AND t."queueId" IS NOT NULL
        GROUP BY t."queueId", q.id, q.name, q.color
        ORDER BY t."queueId"
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Formatação dos dados
      const formattedTicketsByStatus = ticketsByStatus.map((status) => ({
        status: status.status,
        count: parseInt(status.count)
      }));

      const formattedTicketsByQueue = ticketsByQueue.map((queue) => ({
        queueId: queue.queueId,
        queueName: queue.queue?.name || "Sem fila",
        queueColor: queue.queue?.color || "#7367F0",
        count: parseInt(queue.count)
      }));

      const formattedTicketsByUser = ticketsByUser.map((user) => ({
        userId: user.userId,
        userName: user.user?.name || "Desconhecido",
        count: parseInt(user.count)
      }));

      const formattedTicketsByHour = ticketsByHour.map((hour) => ({
        hour: parseInt(hour.hour),
        count: parseInt(hour.count)
      }));

      const formattedTicketsByWeekday = ticketsByWeekday.map((weekday) => ({
        weekday: parseInt(weekday.weekday),
        count: parseInt(weekday.count)
      }));

      const formattedAvgResolutionByQueue = avgResolutionByQueue.map((queue) => ({
        queueId: queue.queueId,
        queueName: queue.queueName || "Sem fila",
        queueColor: queue.queueColor || "#7367F0",
        avgTime: parseFloat(queue.avgTime || '0')
      }));

      const response: TicketsMetricsResponse = {
        ticketsByStatus: formattedTicketsByStatus,
        ticketsByQueue: formattedTicketsByQueue,
        ticketsByUser: formattedTicketsByUser,
        ticketsByHour: formattedTicketsByHour,
        ticketsByWeekday: formattedTicketsByWeekday,
        averageFirstResponseTime,
        averageResolutionTimeByQueue: formattedAvgResolutionByQueue
      };

      logger.info("Métricas de tickets formatadas", { response });

      return response;
    } catch (error) {
      logger.error("Erro em getTicketsMetrics", { error });
      throw new AppError("Erro ao buscar métricas de tickets", 500);
    }
  }

  public async getUsersMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<UsersMetricsResponse> {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    logger.info("DashboardService.getUsersMetrics - Iniciando consulta", {
      companyId,
      dateCondition
    });

    try {
      // Tickets atendidos por usuário
      const ticketsPerUser = await Ticket.findAll({
        attributes: [
          'userId',
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'profile'],
            required: false
          }
        ],
        where: {
          companyId,
          createdAt: dateCondition,
          userId: { [Op.not]: null }
        },
        group: ['userId', 'user.id', 'user.name', 'user.profile'],
        raw: true,
        nest: true
      }) as unknown as Array<{ 
        userId: number; 
        count: string; 
        user: { name: string; profile: string } 
      }>;

      // Mensagens enviadas por usuário
      const messagesPerUser = await sequelize.query<{
        userId: number;
        userName: string;
        count: string;
      }>(`
        SELECT 
          t."userId",
          u.name as "userName",
          COUNT(m.id) as count
        FROM "Messages" m
        INNER JOIN "Tickets" t ON t.id = m."ticketId"
        INNER JOIN "Users" u ON u.id = t."userId"
        WHERE m."companyId" = :companyId
        AND m."fromMe" = true
        AND m."createdAt" BETWEEN :startDate AND :endDate
        AND t."userId" IS NOT NULL
        GROUP BY t."userId", u.id, u.name
        ORDER BY count DESC
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Tempo médio de resolução por usuário
      const avgResolutionTimePerUser = await TicketTraking.findAll({
        attributes: [
          'userId',
          [
            fn('AVG',
              literal('EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) / 60')
            ),
            'avgTime'
          ]
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name'],
            required: false
          }
        ],
        where: {
          companyId,
          startedAt: { [Op.not]: null },
          finishedAt: { [Op.not]: null },
          createdAt: dateCondition,
          userId: { [Op.not]: null }
        },
        group: ['userId', 'user.id', 'user.name'],
        raw: true,
        nest: true
      }) as unknown as Array<{ 
        userId: number; 
        avgTime: string; 
        user: { name: string } 
      }>;

      // Avaliação média por usuário
      const ratingsPerUser = await UserRating.findAll({
        attributes: [
          'userId',
          [fn('AVG', col('UserRating.rate')), 'avgRate'],
          [fn('COUNT', col('UserRating.id')), 'count']
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name'],
            required: false
          }
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: ['userId', 'user.id', 'user.name'],
        raw: true,
        nest: true
      }) as unknown as Array<{ 
        userId: number; 
        avgRate: string; 
        count: string; 
        user: { name: string } 
      }>;

      // Distribuição de avaliações por pontuação
      const ratingDistribution = await UserRating.findAll({
        attributes: [
          'rate',
          [fn('COUNT', col('UserRating.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: ['rate'],
        order: [['rate', 'ASC']],
        raw: true
      }) as unknown as Array<{ rate: number; count: string }>;

      // Formatação dos dados
      const formattedTicketsPerUser = ticketsPerUser.map((user) => ({
        userId: user.userId,
        userName: user.user?.name || "Desconhecido",
        userProfile: user.user?.profile || "user",
        count: parseInt(user.count)
      }));

      const formattedMessagesPerUser = messagesPerUser.map((user) => ({
        userId: user.userId,
        userName: user.userName || "Desconhecido",
        count: parseInt(user.count)
      }));

      const formattedAvgResolutionTimePerUser = avgResolutionTimePerUser.map((user) => ({
        userId: user.userId,
        userName: user.user?.name || "Desconhecido",
        avgTime: parseFloat(user.avgTime)
      }));

      const formattedRatingsPerUser = ratingsPerUser.map((rating) => ({
        userId: rating.userId,
        userName: rating.user?.name || "Desconhecido",
        avgRate: parseFloat(rating.avgRate || '0'),
        count: parseInt(rating.count)
      }));

      const formattedRatingDistribution = ratingDistribution.map((rate) => ({
        rate: rate.rate,
        count: parseInt(rate.count)
      }));

      const response: UsersMetricsResponse = {
        ticketsPerUser: formattedTicketsPerUser,
        messagesPerUser: formattedMessagesPerUser,
        avgResolutionTimePerUser: formattedAvgResolutionTimePerUser,
        ratingsPerUser: formattedRatingsPerUser,
        ratingDistribution: formattedRatingDistribution
      };

      logger.info("Métricas de usuários formatadas", { response });

      return response;
    } catch (error) {
      logger.error("Erro em getUsersMetrics", { error });
      throw new AppError("Erro ao buscar métricas de usuários", 500);
    }
  }

  public async getContactsMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<ContactsMetricsResponse> {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    logger.info("DashboardService.getContactsMetrics - Iniciando consulta", {
      companyId,
      dateCondition
    });

    try {
      // Novos contatos por dia
      const newContactsByDay = await Contact.findAll({
        attributes: [
          [fn('date', col('createdAt')), 'date'],
          [fn('COUNT', col('Contact.id')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: [fn('date', col('createdAt'))],
        order: [[fn('date', col('createdAt')), 'ASC']],
        raw: true
      }) as unknown as Array<{ date: string; count: string }>;

      // Contatos com mais tickets
      const contactsWithMostTickets = await sequelize.query<{
        contactId: number;
        contactName: string;
        contactNumber: string;
        count: string;
      }>(`
        SELECT 
          c.id as "contactId",
          c.name as "contactName",
          c.number as "contactNumber",
          COUNT(t.id) as count
        FROM "Contacts" c
        INNER JOIN "Tickets" t ON t."contactId" = c.id
        WHERE c."companyId" = :companyId
        AND t."createdAt" BETWEEN :startDate AND :endDate
        GROUP BY c.id, c.name, c.number
        ORDER BY count DESC
        LIMIT 10
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Contatos por hora do dia (quando interagem)
      const contactsByHour = await Ticket.findAll({
        attributes: [
          [fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'hour'],
          [fn('COUNT', literal('DISTINCT "contactId"')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: [fn('EXTRACT', literal('HOUR FROM "createdAt"'))],
        order: [[fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'ASC']],
        raw: true
      }) as unknown as Array<{ hour: string; count: string }>;

      // Contatos por dia da semana
      const contactsByWeekday = await Ticket.findAll({
        attributes: [
          [fn('EXTRACT', literal('DOW FROM "createdAt"')), 'weekday'],
          [fn('COUNT', literal('DISTINCT "contactId"')), 'count']
        ],
        where: {
          companyId,
          createdAt: dateCondition
        },
        group: [fn('EXTRACT', literal('DOW FROM "createdAt"'))],
        order: [[fn('EXTRACT', literal('DOW FROM "createdAt"')), 'ASC']],
        raw: true
      }) as unknown as Array<{ weekday: string; count: string }>;

      // Tags mais associadas a contatos
      const mostUsedTags = await sequelize.query<{
        tagId: number;
        tagName: string;
        tagColor: string;
        count: string;
      }>(`
        SELECT 
          tag.id as "tagId",
          tag.name as "tagName",
          tag.color as "tagColor",
          COUNT(*) as count
        FROM "Tags" tag
        INNER JOIN "TicketTags" tt ON tt."tagId" = tag.id
        INNER JOIN "Tickets" t ON t.id = tt."ticketId"
        WHERE tag."companyId" = :companyId
        AND t."createdAt" BETWEEN :startDate AND :endDate
        GROUP BY tag.id, tag.name, tag.color
        ORDER BY count DESC
        LIMIT 10
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Formatação dos dados
      const formattedNewContactsByDay = newContactsByDay.map((day) => ({
        date: moment(day.date).format('YYYY-MM-DD'),
        count: parseInt(day.count)
      }));

      const formattedContactsWithMostTickets = contactsWithMostTickets.map((contact) => ({
        contactId: contact.contactId,
        contactName: contact.contactName || "Desconhecido",
        contactNumber: contact.contactNumber || "N/A",
        count: parseInt(contact.count)
      }));

      const formattedContactsByHour = contactsByHour.map((hour) => ({
        hour: parseInt(hour.hour),
        count: parseInt(hour.count)
      }));

      const formattedContactsByWeekday = contactsByWeekday.map((weekday) => ({
        weekday: parseInt(weekday.weekday),
        count: parseInt(weekday.count)
      }));

      const formattedMostUsedTags = mostUsedTags.map((tag) => ({
        tagId: tag.tagId,
        tagName: tag.tagName,
        tagColor: tag.tagColor || "#7367F0",
        count: parseInt(tag.count)
      }));

      const response: ContactsMetricsResponse = {
        newContactsByDay: formattedNewContactsByDay,
        contactsWithMostTickets: formattedContactsWithMostTickets,
        contactsByHour: formattedContactsByHour,
        contactsByWeekday: formattedContactsByWeekday,
        mostUsedTags: formattedMostUsedTags
      };

      logger.info("Métricas de contatos formatadas", { response });

      return response;
    } catch (error) {
      logger.error("Erro em getContactsMetrics", { error });
      throw new AppError("Erro ao buscar métricas de contatos", 500);
    }
  }

  public async getQueuesMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<QueuesMetricsResponse> {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    logger.info("DashboardService.getQueuesMetrics - Iniciando consulta", {
      companyId,
      dateCondition
    });

    try {
      // Tickets por fila
      const ticketsByQueue = await Ticket.findAll({
        attributes: [
          'queueId',
          [fn('COUNT', col('Ticket.id')), 'count']
        ],
        include: [
          {
            model: Queue,
            as: 'queue',
            attributes: ['name', 'color'],
            required: false
          }
        ],
        where: {
          companyId,
          createdAt: dateCondition,
          queueId: { [Op.not]: null }
        },
        group: ['queueId', 'queue.id', 'queue.name', 'queue.color'],
        raw: true,
        nest: true
      }) as unknown as Array<{ 
        queueId: number; 
        count: string; 
        queue: { name: string; color: string } 
      }>;

      // Filas com maior tempo de espera
      const queueWaitTimes = await sequelize.query<{
        queueId: number;
        queueName: string;
        queueColor: string;
        avgWaitTime: string;
      }>(`
        SELECT 
          t."queueId",
          q.name as "queueName",
          q.color as "queueColor",
          AVG(EXTRACT(EPOCH FROM (tt."startedAt" - tt."queuedAt")) / 60) as "avgWaitTime"
        FROM "TicketTraking" tt
        INNER JOIN "Tickets" t ON t.id = tt."ticketId"
        LEFT JOIN "Queues" q ON q.id = t."queueId"
        WHERE tt."companyId" = :companyId
        AND tt."queuedAt" IS NOT NULL
        AND tt."startedAt" IS NOT NULL
        AND tt."createdAt" BETWEEN :startDate AND :endDate
        AND t."queueId" IS NOT NULL
        GROUP BY t."queueId", q.id, q.name, q.color
        ORDER BY "avgWaitTime" DESC
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Filas com maior tempo de resolução
      const queueResolutionTimes = await sequelize.query<{
        queueId: number;
        queueName: string;
        queueColor: string;
        avgResolutionTime: string;
      }>(`
        SELECT 
          t."queueId",
          q.name as "queueName",
          q.color as "queueColor",
          AVG(EXTRACT(EPOCH FROM (tt."finishedAt" - tt."startedAt")) / 60) as "avgResolutionTime"
        FROM "TicketTraking" tt
        INNER JOIN "Tickets" t ON t.id = tt."ticketId"
        LEFT JOIN "Queues" q ON q.id = t."queueId"
        WHERE tt."companyId" = :companyId
        AND tt."startedAt" IS NOT NULL
        AND tt."finishedAt" IS NOT NULL
        AND tt."createdAt" BETWEEN :startDate AND :endDate
        AND t."queueId" IS NOT NULL
        GROUP BY t."queueId", q.id, q.name, q.color
        ORDER BY "avgResolutionTime" DESC
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Filas por avaliação média
      const queueRatings = await sequelize.query<{
        queueId: number;
        queueName: string;
        queueColor: string;
        avgRate: string;
        count: string;
      }>(`
        SELECT 
          t."queueId",
          q.name as "queueName",
          q.color as "queueColor",
          AVG(ur.rate) as "avgRate",
          COUNT(ur.id) as count
        FROM "UserRatings" ur
        INNER JOIN "Tickets" t ON t.id = ur."ticketId"
        LEFT JOIN "Queues" q ON q.id = t."queueId"
        WHERE ur."companyId" = :companyId
        AND ur."createdAt" BETWEEN :startDate AND :endDate
        AND t."queueId" IS NOT NULL
        GROUP BY t."queueId", q.id, q.name, q.color
        ORDER BY "avgRate" DESC
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Formatação dos dados
      const formattedTicketsByQueue = ticketsByQueue.map((queue) => ({
        queueId: queue.queueId,
        queueName: queue.queue?.name || "Sem fila",
        queueColor: queue.queue?.color || "#7367F0",
        count: parseInt(queue.count)
      }));

      const formattedQueueWaitTimes = queueWaitTimes.map((queue) => ({
        queueId: queue.queueId,
        queueName: queue.queueName || "Sem fila",
        queueColor: queue.queueColor || "#7367F0",
        avgWaitTime: parseFloat(queue.avgWaitTime || '0')
      }));

      const formattedQueueResolutionTimes = queueResolutionTimes.map((queue) => ({
        queueId: queue.queueId,
        queueName: queue.queueName || "Sem fila",
        queueColor: queue.queueColor || "#7367F0",
        avgResolutionTime: parseFloat(queue.avgResolutionTime || '0')
      }));

      const formattedQueueRatings = queueRatings.map((queue) => ({
        queueId: queue.queueId,
        queueName: queue.queueName || "Sem fila",
        queueColor: queue.queueColor || "#7367F0",
        avgRate: parseFloat(queue.avgRate || '0'),
        count: parseInt(queue.count)
      }));

      const response: QueuesMetricsResponse = {
        ticketsByQueue: formattedTicketsByQueue,
        queueWaitTimes: formattedQueueWaitTimes,
        queueResolutionTimes: formattedQueueResolutionTimes,
        queueRatings: formattedQueueRatings
      };

      logger.info("Métricas de filas formatadas", { response });

      return response;
    } catch (error) {
      logger.error("Erro em getQueuesMetrics", { error });
      throw new AppError("Erro ao buscar métricas de filas", 500);
    }
  }

  public async getUserQueueMetrics(
    companyId: number,
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<UserQueueMetric[]> {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    logger.info("DashboardService.getUserQueueMetrics - Iniciando consulta", {
      companyId,
      userId,
      dateCondition
    });
  
    try {
      // Verificar se o usuário existe e pertence à empresa
      const user = await User.findOne({
        where: {
          id: userId,
          companyId
        }
      });
  
      if (!user) {
        throw new AppError("Usuário não encontrado ou não pertence à empresa", 404);
      }
  
      // Primeiro, buscar todas as filas que o usuário tem acesso
      let userQueues: Queue[] = [];
      
      // Verificar se o usuário é admin (acesso a todas as filas)
      if (user.profile === 'admin') {
        userQueues = await Queue.findAll({
          where: { companyId },
          attributes: ['id', 'name', 'color']
        });
      } else {
        // Buscar filas específicas do usuário através da tabela de relacionamento
        userQueues = await Queue.findAll({
          include: [
            {
              model: User,
              as: 'users',
              where: { id: userId },
              attributes: [],
              required: true
            }
          ],
          where: { companyId },
          attributes: ['id', 'name', 'color']
        });
      }
  
      // Para cada fila, buscar os tickets e mensagens
      const result = await Promise.all(
        userQueues.map(async (queue) => {
          // Contar tickets na fila atribuídos ao usuário
          const ticketCount = await Ticket.count({
            where: {
              companyId,
              queueId: queue.id,
              userId,
              createdAt: dateCondition
            }
          });
  
          // Contar mensagens enviadas pelo usuário nos tickets da fila
          const messageCount = await sequelize.query(`
            SELECT COUNT(m.id) as count
            FROM "Messages" m
            INNER JOIN "Tickets" t ON t.id = m."ticketId"
            WHERE m."companyId" = :companyId
            AND t."queueId" = :queueId
            AND t."userId" = :userId
            AND m."fromMe" = true
            AND m."createdAt" BETWEEN :startDate AND :endDate
          `, {
            replacements: {
              companyId,
              queueId: queue.id,
              userId,
              startDate: dateCondition[Op.between][0],
              endDate: dateCondition[Op.between][1]
            },
            type: QueryTypes.SELECT,
            plain: true
          }) as any;
  
          return {
            queueId: queue.id,
            queueName: queue.name,
            queueColor: queue.color || "#7367F0",
            tickets: ticketCount,
            messages: messageCount?.count ? parseInt(messageCount.count) : 0
          };
        })
      );
  
      // Ordenar por número de tickets (decrescente)
      return result.sort((a, b) => b.tickets - a.tickets);
    } catch (error) {
      logger.error("Erro em getUserQueueMetrics", { error, companyId, userId });
      throw new AppError("Erro ao buscar métricas do usuário por fila", 500);
    }
  }

  // Métodos adicionais para a classe DashboardService

public async getQueuesComparison(companyId: number, queue1Id: number, queue2Id: number): Promise<any> {
  logger.info("DashboardService.getQueuesComparison - Iniciando comparação", {
    companyId,
    queue1Id,
    queue2Id
  });

  try {
    // Buscar dados da queue 1
    const queue1Data = await this.getQueueMetrics(companyId, queue1Id);
    
    // Buscar dados da queue 2
    const queue2Data = await this.getQueueMetrics(companyId, queue2Id);

    return {
      queue1: queue1Data,
      queue2: queue2Data
    };
  } catch (error) {
    logger.error("Erro em getQueuesComparison", { error });
    throw new AppError("Erro ao obter comparativo de queues", 500);
  }
}

public async getAgentProspection(companyId: number, period: string = 'hoje'): Promise<any> {
  logger.info("DashboardService.getAgentProspection - Iniciando consulta", {
    companyId,
    period
  });

  try {
    const prospectionData = await this.getAgentProspectionData(companyId, period);
    return prospectionData;
  } catch (error) {
    logger.error("Erro em getAgentProspection", { error });
    throw new AppError("Erro ao obter dados de prospecção por agente", 500);
  }
}

// Função auxiliar para buscar métricas de uma queue
private async getQueueMetrics(companyId: number, queueId: number): Promise<any> {
  // Definir a data de início (30 dias atrás por padrão)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  // Definir as condições de filtro
  const whereCondition: any = {
    companyId,
    queueId,
    createdAt: {
      [Op.between]: [startDate, new Date()]
    }
  };
  
  try {
    // Buscar total de mensagens
    const totalMessages = await Message.count({
      include: [{
        model: Ticket,
        as: "ticket",
        where: whereCondition,
        required: true
      }]
    });
    
    // Buscar tempo médio de atendimento
    const avgTimeResult = await TicketTraking.findOne({
      attributes: [
        [
          fn('AVG',
            literal('EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) / 60')
          ),
          'avgTime'
        ]
      ],
      where: {
        companyId,
        finishedAt: { [Op.not]: null }
      },
      include: [{
        model: Ticket,
        as: "ticket",
        where: { queueId },
        required: true
      }],
      raw: true
    }) as unknown as { avgTime: string | null };
    
    // Buscar total de clientes únicos
    const totalClients = await Contact.count({
      distinct: true,
      include: [{
        model: Ticket,
        as: "tickets",
        where: whereCondition,
        required: true,
        attributes: []
      }]
    });
    
    // Buscar taxa de resposta usando query SQL direta
    const responseRateQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "fromMe" = true THEN 1 ELSE 0 END) as responses
      FROM "Messages" m
      INNER JOIN "Tickets" t ON t.id = m."ticketId"
      WHERE t."companyId" = :companyId 
      AND t."queueId" = :queueId
      AND t."createdAt" BETWEEN :startDate AND :endDate
    `;
    
    const responseRateResult = await sequelize.query(responseRateQuery, {
      replacements: {
        companyId,
        queueId,
        startDate,
        endDate: new Date()
      },
      type: QueryTypes.SELECT,
      raw: true
    }) as any[];
    
    // Calcular taxa de resposta
    const responseRate = responseRateResult.length > 0 && parseInt(responseRateResult[0].total) > 0
      ? Math.round((parseInt(responseRateResult[0].responses) / parseInt(responseRateResult[0].total)) * 100)
      : 0;
    
    // Buscar tempo médio de primeiro contato
    const firstContactTimeResult = await TicketTraking.findOne({
      attributes: [
        [
          fn('AVG',
            literal('EXTRACT(EPOCH FROM ("startedAt" - "queuedAt")) / 60')
          ),
          'avgTime'
        ]
      ],
      where: {
        companyId,
        startedAt: { [Op.not]: null },
        queuedAt: { [Op.not]: null }
      },
      include: [{
        model: Ticket,
        as: "ticket",
        where: { queueId },
        required: true
      }],
      raw: true
    }) as unknown as { avgTime: string | null };
    
    return {
      totalMessages,
      avgTime: avgTimeResult?.avgTime ? parseFloat(avgTimeResult.avgTime) : 0,
      totalClients,
      responseRate,
      firstContactTime: firstContactTimeResult?.avgTime ? parseFloat(firstContactTimeResult.avgTime) : 0
    };
  } catch (error) {
    logger.error("Erro em getQueueMetrics", { error, companyId, queueId });
    throw new AppError("Erro ao buscar métricas da fila", 500);
  }
}

// Função auxiliar para buscar dados de prospecção por agente
private async getAgentProspectionData(companyId: number, period: string): Promise<any> {
  try {
    // Definir filtro de data baseado no período selecionado
    let startDate: Date;
    const endDate = new Date();
    
    switch (period) {
      case 'semana':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'quinzena':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 15);
        break;
      case 'mes':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'hoje':
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    // Buscar usuários ativos
    const users = await User.findAll({
      where: {
        companyId
        //profile: { [Op.ne]: 'admin' }
      },
      attributes: ['id', 'name']
    });
    
    // Calcular métricas para cada usuário
    const prospectionData = await Promise.all(
      users.map(async (user) => {
        // Contar novos contatos
        const contactQuery = `
          SELECT COUNT(DISTINCT c.id) as count
          FROM "Contacts" c
          INNER JOIN "Tickets" t ON t."contactId" = c.id
          WHERE c."companyId" = :companyId
          AND c."createdAt" BETWEEN :startDate AND :endDate
          AND t."userId" = :userId
        `;
        
        const clientsResult = await sequelize.query(contactQuery, {
          replacements: {
            companyId,
            startDate,
            endDate,
            userId: user.id
          },
          type: QueryTypes.SELECT,
          plain: true
        }) as any;
        
        const clients = clientsResult ? parseInt(clientsResult.count) : 0;
        
        // Contar mensagens enviadas a novos contatos
        const messageQuery = `
          SELECT COUNT(m.id) as count
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          INNER JOIN "Contacts" c ON c.id = t."contactId"
          WHERE m."companyId" = :companyId
          AND m."createdAt" BETWEEN :startDate AND :endDate
          AND m."fromMe" = true
          AND t."userId" = :userId
          AND c."createdAt" BETWEEN :startDate AND :endDate
        `;
        
        const messagesResult = await sequelize.query(messageQuery, {
          replacements: {
            companyId,
            startDate,
            endDate,
            userId: user.id
          },
          type: QueryTypes.SELECT,
          plain: true
        }) as any;
        
        const messages = messagesResult ? parseInt(messagesResult.count) : 0;
        
        // Determinar desempenho
        let performance = 'Médio';
        if (clients > 10 || messages > 100) {
          performance = 'Alto';
        } else if (clients < 5 || messages < 50) {
          performance = 'Baixo';
        }
        
        return {
          id: user.id,
          name: user.name,
          clients,
          messages,
          performance
        };
      })
    );
    
    // Ordenar por número de clientes (decrescente)
    return prospectionData.sort((a, b) => b.clients - a.clients);
  } catch (error) {
    logger.error("Erro em getAgentProspectionData", { error, companyId, period });
    throw new AppError("Erro ao processar dados de prospecção por agente", 500);
  }
}

  public async getTagsMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<TagsMetricsResponse> {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    logger.info("DashboardService.getTagsMetrics - Iniciando consulta", {
      companyId,
      dateCondition
    });

    try {
      // Tags mais usadas
      const mostUsedTags = await sequelize.query<{
        tagId: number;
        tagName: string;
        tagColor: string;
        count: string;
      }>(`
        SELECT 
          tag.id as "tagId",
          tag.name as "tagName",
          tag.color as "tagColor",
          COUNT(*) as count
        FROM "Tags" tag
        INNER JOIN "TicketTags" tt ON tt."tagId" = tag.id
        INNER JOIN "Tickets" t ON t.id = tt."ticketId"
        WHERE tag."companyId" = :companyId
        AND t."createdAt" BETWEEN :startDate AND :endDate
        GROUP BY tag.id, tag.name, tag.color
        ORDER BY count DESC
        LIMIT 10
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Tempo médio de resolução por tag
      const tagResolutionTimes = await sequelize.query<{
        tagId: number;
        tagName: string;
        tagColor: string;
        avgResolutionTime: string;
      }>(`
        SELECT 
          tag.id as "tagId",
          tag.name as "tagName",
          tag.color as "tagColor",
          AVG(EXTRACT(EPOCH FROM (tt."finishedAt" - tt."startedAt")) / 60) as "avgResolutionTime"
        FROM "Tags" tag
        INNER JOIN "TicketTags" ttag ON ttag."tagId" = tag.id
        INNER JOIN "Tickets" t ON t.id = ttag."ticketId"
        INNER JOIN "TicketTraking" tt ON tt."ticketId" = t.id
        WHERE tag."companyId" = :companyId
        AND tt."startedAt" IS NOT NULL
        AND tt."finishedAt" IS NOT NULL
        AND tt."createdAt" BETWEEN :startDate AND :endDate
        GROUP BY tag.id, tag.name, tag.color
        ORDER BY "avgResolutionTime" DESC
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Tags por status de ticket
      const tagsByTicketStatus = await sequelize.query<{
        tagId: number;
        tagName: string;
        tagColor: string;
        status: string;
        count: string;
      }>(`
        SELECT 
          tag.id as "tagId",
          tag.name as "tagName",
          tag.color as "tagColor",
          t.status,
          COUNT(*) as count
        FROM "Tags" tag
        INNER JOIN "TicketTags" tt ON tt."tagId" = tag.id
        INNER JOIN "Tickets" t ON t.id = tt."ticketId"
        WHERE tag."companyId" = :companyId
        AND t."createdAt" BETWEEN :startDate AND :endDate
        GROUP BY tag.id, tag.name, tag.color, t.status
        ORDER BY tag.id, t.status
      `, {
        replacements: {
          companyId,
          startDate: dateCondition[Op.between][0],
          endDate: dateCondition[Op.between][1]
        },
        type: QueryTypes.SELECT
      });

      // Formatação dos dados
      const formattedMostUsedTags = mostUsedTags.map((tag) => ({
        tagId: tag.tagId,
        tagName: tag.tagName,
        tagColor: tag.tagColor || "#7367F0",
        count: parseInt(tag.count)
      }));

      const formattedTagResolutionTimes = tagResolutionTimes.map((tag) => ({
        tagId: tag.tagId,
        tagName: tag.tagName,
        tagColor: tag.tagColor || "#7367F0",
        avgResolutionTime: parseFloat(tag.avgResolutionTime || '0')
      }));

      const formattedTagsByTicketStatus = tagsByTicketStatus.map((tag) => ({
        tagId: tag.tagId,
        tagName: tag.tagName,
        tagColor: tag.tagColor || "#7367F0",
        status: tag.status,
        count: parseInt(tag.count)
      }));

      const response: TagsMetricsResponse = {
        mostUsedTags: formattedMostUsedTags,
        avgResponseTimeByTag: formattedTagResolutionTimes,
        tagsByTicketStatus: formattedTagsByTicketStatus
      };

      logger.info("Métricas de tags formatadas", { response });

      return response;
    } catch (error) {
      logger.error("Erro em getTagsMetrics", { error });
      throw new AppError("Erro ao buscar métricas de tags", 500);
    }
  }
}

export default DashboardService;