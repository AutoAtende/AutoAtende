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
import TicketTraking from "../../models/TicketTraking";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import moment from "moment";

// Cache simples em memória (em produção, use Redis)
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.cache = new Map();
  }

  set(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new MemoryCache();

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

interface ContactMetrics {
  total: number;
  byState: Record<string, { count: number }>;
}

interface OverviewMetrics {
  totalMessages: number;
  averageFirstResponseTime: number;
  newContacts: number;
  messageTrend: number;
  responseTrend: number;
  clientTrend: number;
  contactMetrics: ContactMetrics;
}

interface OverviewResponse extends OverviewMetrics {
  messagesByDay: MessageByDay[];
}

interface TicketByQueue {
  queueId: number;
  queueName: string;
  queueColor: string;
  count: number;
  clients: number;
  avgResolutionTime: number;
  responseRate: number;
  firstContactTime: number;
}

interface TicketByUser {
  userId: number;
  userName: string;
  count: number;
}

interface QueuesMetricsResponse {
  ticketsByQueue: TicketByQueue[];
  ticketsByUser: TicketByUser[];
}

interface QueueComparison {
  queue1: QueueComparisonData;
  queue2: QueueComparisonData;
}

interface QueueComparisonData {
  id: number;
  name: string;
  messages: number;
  avgTime: number;
  clients: number;
  responseRate: number;
  firstContactTime: number;
}

interface AgentProspectionData {
  id: number;
  name: string;
  clients: number;
  messages: number;
  performance: string;
}

interface UserQueueComparison {
  user: {
    id: number;
    name: string;
  };
  queue1: {
    id: number;
    name: string;
    clients: number;
    messages: number;
  };
  queue2: {
    id: number;
    name: string;
    clients: number;
    messages: number;
  };
  totals: {
    clients: number;
    messages: number;
  };
}

const statesDDD = {
  SP: ["11", "12", "13", "14", "15", "16", "17", "18", "19"],
  RJ: ["21", "22", "24"],
  ES: ["27", "28"],
  MG: ["31", "32", "33", "34", "35", "37", "38"],
  PR: ["41", "42", "43", "44", "45", "46"],
  SC: ["47", "48", "49"],
  RS: ["51", "53", "54", "55"],
  DF: ["61"],
  GO: ["62", "64"],
  TO: ["63"],
  MT: ["65", "66"],
  MS: ["67"],
  AC: ["68"],
  RO: ["69"],
  BA: ["71", "73", "74", "75", "77"],
  SE: ["79"],
  PE: ["81", "87"],
  AL: ["82"],
  PB: ["83"],
  RN: ["84"],
  CE: ["85", "88"],
  PI: ["86", "89"],
  PA: ["91", "93", "94"],
  AM: ["92", "97"],
  RR: ["95"],
  AP: ["96"],
  MA: ["98", "99"]
};

export const stateNames = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins"
};

// Mapeamento inverso de DDD para estado
const dddToState = Object.entries(statesDDD).reduce((acc, [state, ddds]) => {
  ddds.forEach(ddd => {
    acc[ddd] = state;
  });
  return acc;
}, {} as Record<string, string>);

class DashboardService {
  private generateCacheKey(method: string, params: any): string {
    return `dashboard_${method}_${JSON.stringify(params)}`;
  }

  private getDateRange(startDate?: Date, endDate?: Date): TimeRange {
    const now = new Date();
    const defaultStartDate = new Date(now);
    defaultStartDate.setDate(now.getDate() - 30);
    return {
      startDate: startDate || defaultStartDate,
      endDate: endDate || now
    };
  }

  private buildDateCondition(startDate?: Date, endDate?: Date): any {
    const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);
    return {
      createdAt: {
        [Op.between]: [start, end]
      }
    };
  }

  // Query otimizada para buscar métricas básicas de uma vez
  private async getBasicMetrics(companyId: number, startDate: Date, endDate: Date): Promise<any> {
    const cacheKey = this.generateCacheKey('basicMetrics', { companyId, startDate, endDate });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await sequelize.query(`
        WITH date_range AS (
          SELECT :startDate::timestamp as start_date, :endDate::timestamp as end_date
        ),
        message_metrics AS (
          SELECT 
            COUNT(*) as total_messages,
            COUNT(DISTINCT CASE WHEN "fromMe" = false THEN "contactId" END) as unique_contacts
          FROM "Messages" m
          CROSS JOIN date_range dr
          WHERE m."companyId" = :companyId
          AND m."createdAt" BETWEEN dr.start_date AND dr.end_date
        ),
        contact_metrics AS (
          SELECT COUNT(*) as new_contacts
          FROM "Contacts" c
          CROSS JOIN date_range dr
          WHERE c."companyId" = :companyId
          AND c."createdAt" BETWEEN dr.start_date AND dr.end_date
        ),
        response_time_metrics AS (
          SELECT AVG(
            CASE 
              WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
              THEN 1440 
              ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
            END
          ) as avg_response_time
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          CROSS JOIN date_range dr
          WHERE m."companyId" = :companyId
          AND m."fromMe" = true
          AND m."createdAt" BETWEEN dr.start_date AND dr.end_date
          AND t."createdAt" BETWEEN dr.start_date AND dr.end_date
          AND m.id = (
            SELECT MIN(m2.id)
            FROM "Messages" m2
            WHERE m2."ticketId" = t.id
            AND m2."fromMe" = true
          )
          AND (m."createdAt" - t."createdAt") > interval '1 second'
          AND (m."createdAt" - t."createdAt") < interval '24 hours'
        )
        SELECT 
          mm.total_messages,
          mm.unique_contacts,
          cm.new_contacts,
          COALESCE(rtm.avg_response_time, 0) as avg_response_time
        FROM message_metrics mm
        CROSS JOIN contact_metrics cm
        CROSS JOIN response_time_metrics rtm
      `, {
        replacements: { companyId, startDate, endDate },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      cache.set(cacheKey, result, 3); // Cache por 3 minutos
      return result;
    } catch (error) {
      logger.error("Erro ao buscar métricas básicas", { error });
      return {
        total_messages: 0,
        unique_contacts: 0,
        new_contacts: 0,
        avg_response_time: 0
      };
    }
  }

  // Query otimizada para mensagens por dia
  private async getMessagesByDay(companyId: number, startDate: Date, endDate: Date): Promise<MessageByDay[]> {
    const cacheKey = this.generateCacheKey('messagesByDay', { companyId, startDate, endDate });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const results = await sequelize.query(`
        SELECT 
          DATE(m."createdAt") as date,
          COUNT(m.id) as count
        FROM "Messages" m
        WHERE m."companyId" = :companyId
        AND m."createdAt" BETWEEN :startDate AND :endDate
        GROUP BY DATE(m."createdAt")
        ORDER BY DATE(m."createdAt") ASC
        LIMIT 30
      `, {
        replacements: { companyId, startDate, endDate },
        type: QueryTypes.SELECT
      }) as any[];

      const formattedResults = results.map((day: any) => ({
        date: moment(day.date).format('YYYY-MM-DD'),
        count: parseInt(day.count)
      }));

      cache.set(cacheKey, formattedResults, 3);
      return formattedResults;
    } catch (error) {
      logger.error("Erro ao buscar mensagens por dia", { error });
      return [];
    }
  }

  // Calcular tendência de forma mais eficiente
  private async calculateTrend(
    companyId: number,
    metric: string,
    currentStartDate: Date,
    currentEndDate: Date,
    defaultValue: number = 0,
    maxTrendPercentage: number = 200
  ): Promise<number> {
    const cacheKey = this.generateCacheKey('trend', { companyId, metric, currentStartDate, currentEndDate });
    const cached = cache.get(cacheKey);
    if (cached !== null) return cached;

    try {
      const periodDuration = currentEndDate.getTime() - currentStartDate.getTime();
      const previousEndDate = new Date(currentStartDate);
      previousEndDate.setMilliseconds(-1);
      const previousStartDate = new Date(previousEndDate);
      previousStartDate.setTime(previousEndDate.getTime() - periodDuration);

      let query = '';
      
      switch (metric) {
        case 'messages':
          query = `
            WITH periods AS (
              SELECT 
                COUNT(CASE WHEN "createdAt" BETWEEN :currentStart AND :currentEnd THEN 1 END) as current_value,
                COUNT(CASE WHEN "createdAt" BETWEEN :previousStart AND :previousEnd THEN 1 END) as previous_value
              FROM "Messages"
              WHERE "companyId" = :companyId
              AND "createdAt" BETWEEN :previousStart AND :currentEnd
            )
            SELECT 
              current_value,
              previous_value,
              CASE 
                WHEN previous_value > 0 THEN 
                  LEAST(GREATEST(((current_value - previous_value) * 100.0 / previous_value), -:maxTrend), :maxTrend)
                ELSE :defaultValue
              END as trend
            FROM periods
          `;
          break;
          
        case 'clients':
          query = `
            WITH periods AS (
              SELECT 
                COUNT(CASE WHEN "createdAt" BETWEEN :currentStart AND :currentEnd THEN 1 END) as current_value,
                COUNT(CASE WHEN "createdAt" BETWEEN :previousStart AND :previousEnd THEN 1 END) as previous_value
              FROM "Contacts"
              WHERE "companyId" = :companyId
              AND "createdAt" BETWEEN :previousStart AND :currentEnd
            )
            SELECT 
              current_value,
              previous_value,
              CASE 
                WHEN previous_value > 0 THEN 
                  LEAST(GREATEST(((current_value - previous_value) * 100.0 / previous_value), -:maxTrend), :maxTrend)
                ELSE :defaultValue
              END as trend
            FROM periods
          `;
          break;
          
        case 'responseTime':
          query = `
            WITH periods AS (
              SELECT 
                AVG(CASE 
                  WHEN m."createdAt" BETWEEN :currentStart AND :currentEnd THEN
                    CASE 
                      WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
                      THEN 1440 
                      ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
                    END
                END) as current_value,
                AVG(CASE 
                  WHEN m."createdAt" BETWEEN :previousStart AND :previousEnd THEN
                    CASE 
                      WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
                      THEN 1440 
                      ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
                    END
                END) as previous_value
              FROM "Messages" m
              INNER JOIN "Tickets" t ON t.id = m."ticketId"
              WHERE m."companyId" = :companyId
              AND m."fromMe" = true
              AND m."createdAt" BETWEEN :previousStart AND :currentEnd
              AND t."createdAt" BETWEEN :previousStart AND :currentEnd
              AND m.id = (
                SELECT MIN(m2.id)
                FROM "Messages" m2
                WHERE m2."ticketId" = t.id
                AND m2."fromMe" = true
              )
              AND (m."createdAt" - t."createdAt") > interval '1 second'
              AND (m."createdAt" - t."createdAt") < interval '24 hours'
            )
            SELECT 
              current_value,
              previous_value,
              CASE 
                WHEN previous_value > 0 AND current_value > 0 THEN 
                  LEAST(GREATEST(((previous_value - current_value) * 100.0 / previous_value), -:maxTrend), :maxTrend)
                ELSE :defaultValue
              END as trend
            FROM periods
          `;
          break;
          
        default:
          cache.set(cacheKey, defaultValue, 5);
          return defaultValue;
      }

      const result = await sequelize.query(query, {
        replacements: {
          companyId,
          currentStart: currentStartDate,
          currentEnd: currentEndDate,
          previousStart: previousStartDate,
          previousEnd: previousEndDate,
          maxTrend: maxTrendPercentage,
          defaultValue
        },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      const trend = Math.round(result?.trend || defaultValue);
      cache.set(cacheKey, trend, 5);
      return trend;

    } catch (error) {
      logger.error("Erro ao calcular tendência", { error, metric });
      cache.set(cacheKey, defaultValue, 1);
      return defaultValue;
    }
  }

  public async getOverviewMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<OverviewResponse> {
    const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);
    const cacheKey = this.generateCacheKey('overview', { companyId, start, end });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    logger.info("DashboardService.getOverviewMetrics - Iniciando consulta otimizada", {
      companyId,
      start,
      end
    });

    try {
      // Buscar métricas básicas em uma única query
      const basicMetrics = await this.getBasicMetrics(companyId, start, end);
      
      // Buscar mensagens por dia em paralelo
      const [messagesByDay, messageTrend, responseTrend, clientTrend, contactMetrics] = await Promise.all([
        this.getMessagesByDay(companyId, start, end),
        this.calculateTrend(companyId, 'messages', start, end, 0, 200),
        this.calculateTrend(companyId, 'responseTime', start, end, 0, 200),
        this.calculateTrend(companyId, 'clients', start, end, 0, 200),
        this.getContactsByState(companyId)
      ]);

      const response: OverviewResponse = {
        totalMessages: basicMetrics.total_messages || 0,
        averageFirstResponseTime: parseFloat(basicMetrics.avg_response_time) || 0,
        newContacts: basicMetrics.new_contacts || 0,
        messageTrend,
        responseTrend,
        clientTrend,
        messagesByDay,
        contactMetrics
      };

      cache.set(cacheKey, response, 3);
      logger.info("Visão geral otimizada processada com sucesso", { 
        totalMessages: response.totalMessages,
        processingTime: Date.now()
      });

      return response;
    } catch (error) {
      logger.error("Erro em getOverviewMetrics", { error });
      throw new AppError("Erro ao buscar métricas de visão geral", 500);
    }
  }

  public async getQueuesMetrics(
    companyId: number,
    startDate?: Date,
    endDate?: Date,
    queueId?: number
  ): Promise<QueuesMetricsResponse> {
    const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);
    const cacheKey = this.generateCacheKey('queuesMetrics', { companyId, start, end, queueId });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    logger.info("DashboardService.getQueuesMetrics - Iniciando consulta otimizada", {
      companyId,
      start,
      end,
      queueId
    });

    try {
      const queueCondition = queueId ? 'AND t."queueId" = :queueId' : 'AND t."queueId" IS NOT NULL';
      
      // Query otimizada que busca todas as métricas de filas de uma vez
      const queueMetrics = await sequelize.query(`
        WITH queue_basic_metrics AS (
          SELECT 
            t."queueId",
            q.name as queue_name,
            q.color as queue_color,
            COUNT(DISTINCT t.id) as ticket_count,
            COUNT(DISTINCT t."contactId") as client_count
          FROM "Tickets" t
          LEFT JOIN "Queues" q ON q.id = t."queueId"
          WHERE t."companyId" = :companyId
          AND t."createdAt" BETWEEN :startDate AND :endDate
          ${queueCondition}
          GROUP BY t."queueId", q.id, q.name, q.color
        ),
        queue_resolution_times AS (
          SELECT 
            t."queueId",
            AVG(EXTRACT(EPOCH FROM (tt."finishedAt" - tt."startedAt")) / 60) as avg_resolution_time
          FROM "TicketTraking" tt
          INNER JOIN "Tickets" t ON t.id = tt."ticketId"
          WHERE tt."companyId" = :companyId
          AND tt."startedAt" IS NOT NULL
          AND tt."finishedAt" IS NOT NULL
          AND tt."createdAt" BETWEEN :startDate AND :endDate
          AND t."queueId" IS NOT NULL
          ${queueId ? 'AND t."queueId" = :queueId' : ''}
          GROUP BY t."queueId"
        ),
        queue_response_rates AS (
          SELECT 
            t."queueId",
            (COUNT(CASE WHEN m."fromMe" = true THEN 1 ELSE NULL END) * 100.0 / 
             NULLIF(COUNT(*), 0)) as response_rate
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          WHERE t."companyId" = :companyId
          AND m."createdAt" BETWEEN :startDate AND :endDate
          AND t."queueId" IS NOT NULL
          ${queueId ? 'AND t."queueId" = :queueId' : ''}
          GROUP BY t."queueId"
        ),
        queue_first_contact AS (
          SELECT 
            t."queueId",
            AVG(EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60) as first_contact_time
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          WHERE t."companyId" = :companyId
          AND m."fromMe" = true
          AND m."createdAt" BETWEEN :startDate AND :endDate
          AND t."queueId" IS NOT NULL
          ${queueId ? 'AND t."queueId" = :queueId' : ''}
          AND m.id = (
            SELECT MIN(m2.id)
            FROM "Messages" m2
            WHERE m2."ticketId" = t.id
            AND m2."fromMe" = true
          )
          GROUP BY t."queueId"
        )
        SELECT 
          qbm."queueId",
          qbm.queue_name,
          qbm.queue_color,
          qbm.ticket_count,
          qbm.client_count,
          COALESCE(qrt.avg_resolution_time, 0) as avg_resolution_time,
          COALESCE(qrr.response_rate, 0) as response_rate,
          COALESCE(qfc.first_contact_time, 0) as first_contact_time
        FROM queue_basic_metrics qbm
        LEFT JOIN queue_resolution_times qrt ON qrt."queueId" = qbm."queueId"
        LEFT JOIN queue_response_rates qrr ON qrr."queueId" = qbm."queueId"
        LEFT JOIN queue_first_contact qfc ON qfc."queueId" = qbm."queueId"
        ORDER BY qbm."queueId"
      `, {
        replacements: { companyId, startDate: start, endDate: end, queueId },
        type: QueryTypes.SELECT
      }) as any[];

      // Buscar dados de usuários em paralelo
      const userMetrics = await sequelize.query(`
        SELECT 
          t."userId",
          u.name as user_name,
          COUNT(t.id) as ticket_count
        FROM "Tickets" t
        LEFT JOIN "Users" u ON u.id = t."userId"
        WHERE t."companyId" = :companyId
        AND t."createdAt" BETWEEN :startDate AND :endDate
        AND t."userId" IS NOT NULL
        ${queueId ? 'AND t."queueId" = :queueId' : 'AND t."queueId" IS NOT NULL'}
        GROUP BY t."userId", u.id, u.name
        ORDER BY ticket_count DESC
        LIMIT 20
      `, {
        replacements: { companyId, startDate: start, endDate: end, queueId },
        type: QueryTypes.SELECT
      }) as any[];

      // Formatar resultados
      const formattedTicketsByQueue = queueMetrics.map((queue: any) => ({
        queueId: queue.queueId,
        queueName: queue.queue_name || "Sem fila",
        queueColor: queue.queue_color || "#7367F0",
        count: parseInt(queue.ticket_count) || 0,
        clients: parseInt(queue.client_count) || 0,
        avgResolutionTime: parseFloat(queue.avg_resolution_time) || 0,
        responseRate: Math.round(parseFloat(queue.response_rate) || 0),
        firstContactTime: parseFloat(queue.first_contact_time) || 0
      }));

      const formattedTicketsByUser = userMetrics.map((user: any) => ({
        userId: user.userId,
        userName: user.user_name || "Desconhecido",
        count: parseInt(user.ticket_count) || 0
      }));

      const result = {
        ticketsByQueue: formattedTicketsByQueue,
        ticketsByUser: formattedTicketsByUser
      };

      cache.set(cacheKey, result, 3);
      return result;
    } catch (error) {
      logger.error("Erro em getQueuesMetrics", { error });
      throw new AppError("Erro ao buscar métricas de filas", 500);
    }
  }

  public async getQueuesComparison(companyId: number, queue1Id: number, queue2Id: number): Promise<QueueComparison> {
    const cacheKey = this.generateCacheKey('queuesComparison', { companyId, queue1Id, queue2Id });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    logger.info("DashboardService.getQueuesComparison - Iniciando comparação otimizada", {
      companyId,
      queue1Id,
      queue2Id
    });

    try {
      // Verificar se as filas existem
      const queues = await Queue.findAll({
        where: {
          companyId,
          id: { [Op.in]: [queue1Id, queue2Id] }
        },
        attributes: ['id', 'name'],  // Buscar apenas campos necessários
        raw: true
      });

      if (queues.length !== 2) {
        throw new AppError("Uma ou ambas as filas não foram encontradas", 404);
      }

      // Buscar métricas para ambas as filas de uma vez
      const [queue1Metrics, queue2Metrics] = await Promise.all([
        this.getQueueDetailedMetrics(companyId, queue1Id),
        this.getQueueDetailedMetrics(companyId, queue2Id)
      ]);

      const result = {
        queue1: queue1Metrics,
        queue2: queue2Metrics
      };

      cache.set(cacheKey, result, 5);
      return result;
    } catch (error) {
      logger.error("Erro em getQueuesComparison", { error });
      throw new AppError("Erro ao obter comparativo de filas", 500);
    }
  }

  private async getQueueDetailedMetrics(companyId: number, queueId: number): Promise<QueueComparisonData> {
    const cacheKey = this.generateCacheKey('queueDetailed', { companyId, queueId });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      // Query otimizada para buscar todas as métricas da fila de uma vez
      const result = await sequelize.query(`
        WITH queue_info AS (
          SELECT id, name FROM "Queues" WHERE id = :queueId AND "companyId" = :companyId
        ),
        message_metrics AS (
          SELECT COUNT(m.id) as messages_count
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          WHERE t."companyId" = :companyId
          AND t."queueId" = :queueId
          AND m."createdAt" BETWEEN :startDate AND :endDate
        ),
        avg_time_metrics AS (
          SELECT AVG(
            CASE 
              WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
              THEN 1440 
              ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
            END
          ) as avg_time
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          WHERE t."companyId" = :companyId
          AND t."queueId" = :queueId
          AND m."fromMe" = true
          AND m."createdAt" BETWEEN :startDate AND :endDate
          AND m.id = (
            SELECT MIN(m2.id)
            FROM "Messages" m2
            WHERE m2."ticketId" = t.id
            AND m2."fromMe" = true
          )
          AND (m."createdAt" - t."createdAt") > interval '1 second'
          AND (m."createdAt" - t."createdAt") < interval '24 hours'
        ),
        client_metrics AS (
          SELECT COUNT(DISTINCT t."contactId") as clients_count
          FROM "Tickets" t
          WHERE t."companyId" = :companyId
          AND t."queueId" = :queueId
          AND t."createdAt" BETWEEN :startDate AND :endDate
        ),
        response_rate_metrics AS (
          SELECT 
            (COUNT(CASE WHEN m."fromMe" = true THEN 1 ELSE NULL END) * 100.0 / 
             NULLIF(COUNT(*), 0)) as response_rate
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          WHERE t."companyId" = :companyId
          AND t."queueId" = :queueId
          AND m."createdAt" BETWEEN :startDate AND :endDate
        ),
        first_contact_metrics AS (
          SELECT AVG(EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60) as first_contact_time
          FROM "Messages" m
          INNER JOIN "Tickets" t ON t.id = m."ticketId"
          WHERE t."companyId" = :companyId
          AND t."queueId" = :queueId
          AND m."fromMe" = true
          AND m."createdAt" BETWEEN :startDate AND :endDate
          AND m.id = (
            SELECT MIN(m2.id)
            FROM "Messages" m2
            WHERE m2."ticketId" = t.id
            AND m2."fromMe" = true
          )
        )
        SELECT 
          qi.id,
          qi.name,
          COALESCE(mm.messages_count, 0) as messages,
          COALESCE(atm.avg_time, 0) as avg_time,
          COALESCE(cm.clients_count, 0) as clients,
          COALESCE(rrm.response_rate, 0) as response_rate,
          COALESCE(fcm.first_contact_time, 0) as first_contact_time
        FROM queue_info qi
        CROSS JOIN message_metrics mm
        CROSS JOIN avg_time_metrics atm
        CROSS JOIN client_metrics cm
        CROSS JOIN response_rate_metrics rrm
        CROSS JOIN first_contact_metrics fcm
      `, {
        replacements: { companyId, queueId, startDate, endDate },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      if (!result) {
        throw new AppError(`Fila ${queueId} não encontrada`, 404);
      }

      const formattedResult: QueueComparisonData = {
        id: queueId,
        name: result.name || "Desconhecido",
        messages: parseInt(result.messages) || 0,
        avgTime: parseFloat(result.avg_time) || 0,
        clients: parseInt(result.clients) || 0,
        responseRate: Math.round(parseFloat(result.response_rate) || 0),
        firstContactTime: parseFloat(result.first_contact_time) || 0
      };

      cache.set(cacheKey, formattedResult, 5);
      return formattedResult;
    } catch (error) {
      logger.error("Erro em getQueueDetailedMetrics", { error, companyId, queueId });
      throw error;
    }
  }

  public async getAgentProspection(companyId: number, period: string = 'semana'): Promise<AgentProspectionData[]> {
    const cacheKey = this.generateCacheKey('agentProspection', { companyId, period });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    logger.info("DashboardService.getAgentProspection - Iniciando consulta otimizada", {
      companyId,
      period
    });

    try {
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

      // Query otimizada que busca todos os dados de prospecção de uma vez
      const prospectionData = await sequelize.query(`
        SELECT 
          u.id,
          u.name,
          COUNT(DISTINCT c.id) as clients,
          COUNT(DISTINCT m.id) as messages,
          CASE 
            WHEN COUNT(DISTINCT c.id) > 10 OR COUNT(DISTINCT m.id) > 100 THEN 'Alto'
            WHEN COUNT(DISTINCT c.id) < 5 OR COUNT(DISTINCT m.id) < 50 THEN 'Baixo'
            ELSE 'Médio'
          END as performance
        FROM "Users" u
        LEFT JOIN "Tickets" t ON t."userId" = u.id 
          AND t."companyId" = :companyId
          AND EXISTS (
            SELECT 1 FROM "Contacts" c2 
            WHERE c2.id = t."contactId" 
            AND c2."createdAt" BETWEEN :startDate AND :endDate
          )
        LEFT JOIN "Contacts" c ON c.id = t."contactId"
        LEFT JOIN "Messages" m ON m."ticketId" = t.id 
          AND m."fromMe" = true 
          AND m."createdAt" BETWEEN :startDate AND :endDate
        WHERE u."companyId" = :companyId
        GROUP BY u.id, u.name
        ORDER BY clients DESC, messages DESC
        LIMIT 50
      `, {
        replacements: { companyId, startDate, endDate },
        type: QueryTypes.SELECT
      }) as any[];

      const result = prospectionData.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        clients: parseInt(agent.clients) || 0,
        messages: parseInt(agent.messages) || 0,
        performance: agent.performance
      }));

      cache.set(cacheKey, result, 5);
      return result;
    } catch (error) {
      logger.error("Erro em getAgentProspection", { error });
      throw new AppError("Erro ao obter dados de prospecção por agente", 500);
    }
  }

  public async getUserQueuesComparison(
    companyId: number,
    userId: number,
    queue1Id: number,
    queue2Id: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<UserQueueComparison> {
    const cacheKey = this.generateCacheKey('userQueuesComparison', { 
      companyId, userId, queue1Id, queue2Id, startDate, endDate 
    });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    logger.info("DashboardService.getUserQueuesComparison - Iniciando comparação otimizada", {
      companyId, userId, queue1Id, queue2Id
    });

    try {
      // Verificar se as filas e usuário existem em uma única query
      const [queues, user] = await Promise.all([
        Queue.findAll({
          where: { companyId, id: { [Op.in]: [queue1Id, queue2Id] } },
          attributes: ['id', 'name'],
          raw: true
        }),
        User.findOne({
          where: { id: userId, companyId },
          attributes: ['id', 'name'],
          raw: true
        })
      ]);

      if (queues.length !== 2) {
        throw new AppError("Uma ou ambas as filas não foram encontradas", 404);
      }

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);

      // Query otimizada para buscar métricas de ambas as filas de uma vez
      const metricsResult = await sequelize.query(`
        WITH user_queue_metrics AS (
          SELECT 
            t."queueId",
            COUNT(DISTINCT t."contactId") as clients,
            COUNT(DISTINCT m.id) as messages
          FROM "Tickets" t
          LEFT JOIN "Messages" m ON m."ticketId" = t.id 
            AND m."fromMe" = true 
            AND m."createdAt" BETWEEN :startDate AND :endDate
          WHERE t."companyId" = :companyId
          AND t."userId" = :userId
          AND t."queueId" IN (:queue1Id, :queue2Id)
          AND t."createdAt" BETWEEN :startDate AND :endDate
          GROUP BY t."queueId"
        )
        SELECT 
          COALESCE(SUM(CASE WHEN "queueId" = :queue1Id THEN clients ELSE 0 END), 0) as queue1_clients,
          COALESCE(SUM(CASE WHEN "queueId" = :queue1Id THEN messages ELSE 0 END), 0) as queue1_messages,
          COALESCE(SUM(CASE WHEN "queueId" = :queue2Id THEN clients ELSE 0 END), 0) as queue2_clients,
          COALESCE(SUM(CASE WHEN "queueId" = :queue2Id THEN messages ELSE 0 END), 0) as queue2_messages
        FROM user_queue_metrics
      `, {
        replacements: {
          companyId, userId, queue1Id, queue2Id, startDate: start, endDate: end
        },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      const queue1_clients = parseInt(metricsResult?.queue1_clients) || 0;
      const queue1_messages = parseInt(metricsResult?.queue1_messages) || 0;
      const queue2_clients = parseInt(metricsResult?.queue2_clients) || 0;
      const queue2_messages = parseInt(metricsResult?.queue2_messages) || 0;

      const result: UserQueueComparison = {
        user: {
          id: userId,
          name: user.name
        },
        queue1: {
          id: queue1Id,
          name: queues.find(q => q.id === queue1Id)?.name || "Desconhecido",
          clients: queue1_clients,
          messages: queue1_messages
        },
        queue2: {
          id: queue2Id,
          name: queues.find(q => q.id === queue2Id)?.name || "Desconhecido",
          clients: queue2_clients,
          messages: queue2_messages
        },
        totals: {
          clients: queue1_clients + queue2_clients,
          messages: queue1_messages + queue2_messages
        }
      };

      cache.set(cacheKey, result, 5);
      return result;
    } catch (error) {
      logger.error("Erro em getUserQueuesComparison", { error });
      throw new AppError("Erro ao obter comparativo do usuário entre filas", 500);
    }
  }

  public async getContactsByState(companyId: number): Promise<ContactMetrics> {
    const cacheKey = this.generateCacheKey('contactsByState', { companyId });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      logger.info("DashboardService.getContactsByState - Iniciando consulta otimizada", { companyId });

      // Query otimizada para processar DDDs e estados no banco
      const stateResults = await sequelize.query(`
        WITH contact_ddds AS (
          SELECT 
            SUBSTRING(number FROM 3 FOR 2) as ddd,
            COUNT(*) as count
          FROM "Contacts"
          WHERE "companyId" = :companyId
          AND number LIKE '55%'
          AND LENGTH(number) >= 12
          AND number IS NOT NULL
          AND number != ''
          GROUP BY SUBSTRING(number FROM 3 FOR 2)
        )
        SELECT 
          ddd,
          count,
          CASE ddd
            ${Object.entries(dddToState).map(([ddd, state]) => 
              `WHEN '${ddd}' THEN '${state}'`
            ).join(' ')}
            ELSE 'UNKNOWN'
          END as state
        FROM contact_ddds
        WHERE CASE ddd
          ${Object.entries(dddToState).map(([ddd]) => 
            `WHEN '${ddd}' THEN true`
          ).join(' ')}
          ELSE false
        END
      `, {
        replacements: { companyId },
        type: QueryTypes.SELECT
      }) as any[];

      // Inicializar contadores para todos os estados
      const stateCount: Record<string, { count: number }> = {};
      Object.keys(statesDDD).forEach(state => {
        stateCount[state] = { count: 0 };
      });

      let total = 0;

      // Processar resultados
      stateResults.forEach((result: any) => {
        const state = result.state;
        const count = parseInt(result.count) || 0;
        
        if (state !== 'UNKNOWN' && stateCount[state]) {
          stateCount[state].count += count;
          total += count;
        }
      });

      const contactMetrics: ContactMetrics = {
        total,
        byState: stateCount
      };

      cache.set(cacheKey, contactMetrics, 10); // Cache por mais tempo pois muda menos
      logger.info("Contatos por estado calculados otimizadamente", { total, statesWithContacts: Object.keys(stateCount).filter(state => stateCount[state].count > 0).length });

      return contactMetrics;
    } catch (error) {
      logger.error("Erro em getContactsByState", { error });
      throw new AppError("Erro ao buscar contatos por estado", 500);
    }
  }
}

export default DashboardService;