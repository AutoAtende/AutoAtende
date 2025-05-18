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
  totalMessages: number;
  averageFirstResponseTime: number;
  newContacts: number;
  messageTrend: number;
  responseTrend: number;
  clientTrend: number;
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
      createdAt: {
        [Op.between]: [
          start,
          end
        ]
      }
    };
  }

  // Calcular tendência comparando o período atual com o período anterior
  private async calculateTrend(
    companyId: number,
    metric: string,
    currentStartDate: Date,
    currentEndDate: Date,
    defaultValue: number = 0,
    maxTrendPercentage: number = 200 // Limitar tendência a 200% (tanto positiva quanto negativa)
  ): Promise<number> {
    try {
      // Duração do período atual em milissegundos
      const periodDuration = currentEndDate.getTime() - currentStartDate.getTime();

      // Calcular datas para o período anterior (mesmo tamanho)
      const previousEndDate = new Date(currentStartDate);
      previousEndDate.setMilliseconds(-1); // Um milissegundo antes do início do período atual

      const previousStartDate = new Date(previousEndDate);
      previousStartDate.setTime(previousEndDate.getTime() - periodDuration);

      let currentValue = 0;
      let previousValue = 0;

      // Selecionar a métrica apropriada para calcular a tendência
      switch (metric) {
        case 'messages':
          currentValue = await Message.count({
            where: {
              companyId,
              createdAt: {
                [Op.between]: [currentStartDate.getTime(), currentEndDate.getTime()]
              }
            }
          });

          previousValue = await Message.count({
            where: {
              companyId,
              createdAt: {
                [Op.between]: [previousStartDate.getTime(), previousEndDate.getTime()]
              }
            }
          });
          break;

        case 'responseTime':
// Para o período atual
const currentTimeResult = await sequelize.query(`
  SELECT AVG(
    CASE 
      WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
      THEN 1440 
      ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
    END
  ) as "avgTime"
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
  AND (m."createdAt" - t."createdAt") > interval '1 second'
  AND (m."createdAt" - t."createdAt") < interval '24 hours'
`, {
  replacements: {
    companyId,
    startDate: currentStartDate,
    endDate: currentEndDate
  },
  type: QueryTypes.SELECT,
  plain: true
}) as any;

// Para o período anterior
const previousTimeResult = await sequelize.query(`
  SELECT AVG(
    CASE 
      WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
      THEN 1440 
      ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
    END
  ) as "avgTime"
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
  AND (m."createdAt" - t."createdAt") > interval '1 second'
  AND (m."createdAt" - t."createdAt") < interval '24 hours'
`, {
  replacements: {
    companyId,
    startDate: previousStartDate,
    endDate: previousEndDate
  },
  type: QueryTypes.SELECT,
  plain: true
}) as any;

          currentValue = currentTimeResult?.avgTime ? parseFloat(currentTimeResult.avgTime) : 0;
          previousValue = previousTimeResult?.avgTime ? parseFloat(previousTimeResult.avgTime) : 0;

          // Para tempo de resposta, um valor menor é melhor, então invertemos a lógica
          if (previousValue > 0 && currentValue > 0) {
            const trend = Math.round(((previousValue - currentValue) / previousValue) * 100);
            return Math.max(Math.min(trend, maxTrendPercentage), -maxTrendPercentage);
          }
          return defaultValue;

        case 'clients':
          currentValue = await Contact.count({
            where: {
              companyId,
              createdAt: {
                [Op.between]: [currentStartDate.getTime(), currentEndDate.getTime()]
              }
            }
          });

          previousValue = await Contact.count({
            where: {
              companyId,
              createdAt: {
                [Op.between]: [previousStartDate.getTime(), previousEndDate.getTime()]
              }
            }
          });
          break;

        default:
          return defaultValue;
      }

      // Calcular a variação percentual com limitação
      if (previousValue > 0) {
        const trend = Math.round(((currentValue - previousValue) / previousValue) * 100);
        return Math.max(Math.min(trend, maxTrendPercentage), -maxTrendPercentage);
      }

      return defaultValue;

    } catch (error) {
      logger.error("Erro ao calcular tendência", { error, metric });
      return defaultValue;
    }
  }

  public async getOverviewMetrics(companyId: number, startDate?: Date, endDate?: Date): Promise<OverviewResponse> {
    const dateCondition = this.buildDateCondition(startDate, endDate);

    logger.info("DashboardService.getOverviewMetrics - Iniciando consulta", {
      companyId,
      dateCondition
    });

    try {
      const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);

      // Total de mensagens no período
      const totalMessages = await Message.count({
        where: {
          companyId,
          ...dateCondition
        }
      });

      // Tempo médio de primeira resposta
// Tempo médio de primeira resposta
const avgFirstResponseResult = await sequelize.query<{ avgTime: string | null }>(`
  SELECT AVG(
    CASE 
      WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
      THEN 1440 
      ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
    END
  ) as "avgTime"
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
  AND (m."createdAt" - t."createdAt") > interval '1 second'
  AND (m."createdAt" - t."createdAt") < interval '24 hours'
`, {
  replacements: {
    companyId,
    startDate: start,
    endDate: end
  },
  type: QueryTypes.SELECT,
  plain: true
});

      const averageFirstResponseTime = avgFirstResponseResult?.avgTime ?
        parseFloat(avgFirstResponseResult.avgTime) : 0;

      // Novos contatos no período
      const newContacts = await Contact.count({
        where: {
          companyId,
          ...dateCondition
        }
      });

      // Calcular tendências (com limitação)
      const messageTrend = await this.calculateTrend(
        companyId,
        'messages',
        start,
        end,
        0,  // valor padrão
        200 // limitação de porcentagem
      );

      const responseTrend = await this.calculateTrend(
        companyId,
        'responseTime',
        start,
        end,
        0,
        200
      );

      const clientTrend = await this.calculateTrend(
        companyId,
        'clients',
        start,
        end,
        0,
        200
      );

      // Mensagens por dia
      const messagesByDay = await Message.findAll({
        attributes: [
          [fn('date', col('createdAt')), 'date'],
          [fn('COUNT', col('Message.id')), 'count']
        ],
        where: {
          companyId,
          ...dateCondition
        },
        group: [fn('date', col('createdAt'))],
        order: [[fn('date', col('createdAt')), 'ASC']],
        raw: true
      }) as unknown as Array<{ date: string; count: string }>;

      // Formatação dos dados para o frontend
      const formattedMessagesByDay = messagesByDay.map((day) => ({
        date: moment(day.date).format('YYYY-MM-DD'),
        count: parseInt(day.count)
      }));

      // Preparar resposta final
      const response: OverviewResponse = {
        totalMessages,
        averageFirstResponseTime,
        newContacts,
        messageTrend,
        responseTrend,
        clientTrend,
        messagesByDay: formattedMessagesByDay
      };

      logger.info("Visão geral formatada com sucesso", {
        totalMessages,
        averageFirstResponseTime,
        newContacts,
        messageTrend,
        responseTrend,
        clientTrend
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
    const dateCondition = this.buildDateCondition(startDate, endDate);

    logger.info("DashboardService.getQueuesMetrics - Iniciando consulta", {
      companyId,
      dateCondition,
      queueId
    });

    try {
      const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);

      // Construir condição para filtrar por fila específica, se fornecida
      const queueCondition = queueId ? { queueId } : { queueId: { [Op.not]: null } };

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
          ...dateCondition,
          ...queueCondition
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
          ...dateCondition,
          userId: { [Op.not]: null },
          ...queueCondition
        },
        group: ['userId', 'user.id', 'user.name'],
        raw: true,
        nest: true
      }) as unknown as Array<{
        userId: number;
        count: string;
        user: { name: string }
      }>;

      // Tempo médio de resolução por fila
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
        ${queueId ? 'AND t."queueId" = :queueId' : ''}
        GROUP BY t."queueId", q.id, q.name, q.color
        ORDER BY t."queueId"
      `, {
        replacements: {
          companyId,
          startDate: start,
          endDate: end,
          queueId
        },
        type: QueryTypes.SELECT
      });

      // Clientes por fila
      const clientsByQueue = await sequelize.query<{
        queueId: number;
        clients: string;
      }>(`
        SELECT 
          t."queueId",
          COUNT(DISTINCT t."contactId") as clients
        FROM "Tickets" t
        WHERE t."companyId" = :companyId
        AND t."createdAt" BETWEEN :startDate AND :endDate
        AND t."queueId" IS NOT NULL
        ${queueId ? 'AND t."queueId" = :queueId' : ''}
        GROUP BY t."queueId"
      `, {
        replacements: {
          companyId,
          startDate: start,
          endDate: end,
          queueId
        },
        type: QueryTypes.SELECT
      });

      // Taxa de resposta por fila
      const responseRateByQueue = await sequelize.query<{
        queueId: number;
        responseRate: string;
      }>(`
        SELECT 
          t."queueId",
          (COUNT(CASE WHEN m."fromMe" = true THEN 1 ELSE NULL END) * 100.0 / 
           NULLIF(COUNT(*), 0)) as "responseRate"
        FROM "Messages" m
        INNER JOIN "Tickets" t ON t.id = m."ticketId"
        WHERE t."companyId" = :companyId
        AND m."createdAt" BETWEEN :startDate AND :endDate
        AND t."queueId" IS NOT NULL
        ${queueId ? 'AND t."queueId" = :queueId' : ''}
        GROUP BY t."queueId"
      `, {
        replacements: {
          companyId,
          startDate: start,
          endDate: end,
          queueId
        },
        type: QueryTypes.SELECT
      });

      // Tempo médio para primeiro contato por fila
      const firstContactByQueue = await sequelize.query<{
        queueId: number;
        firstContactTime: string;
      }>(`
        SELECT 
          t."queueId",
          AVG(EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60) as "firstContactTime"
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
      `, {
        replacements: {
          companyId,
          startDate: start,
          endDate: end,
          queueId
        },
        type: QueryTypes.SELECT
      });

      // Combinar todos os dados por fila
      const formattedTicketsByQueue = ticketsByQueue.map((queue) => {
        const queueId = queue.queueId;
        const clients = clientsByQueue.find(item => item.queueId === queueId);
        const resolutionTime = queueResolutionTimes.find(item => item.queueId === queueId);
        const responseRate = responseRateByQueue.find(item => item.queueId === queueId);
        const firstContact = firstContactByQueue.find(item => item.queueId === queueId);

        return {
          queueId,
          queueName: queue.queue?.name || "Sem fila",
          queueColor: queue.queue?.color || "#7367F0",
          count: parseInt(queue.count),
          clients: clients ? parseInt(clients.clients) : 0,
          avgResolutionTime: resolutionTime ? parseFloat(resolutionTime.avgResolutionTime || '0') : 0,
          responseRate: responseRate ? Math.round(parseFloat(responseRate.responseRate || '0')) : 0,
          firstContactTime: firstContact ? parseFloat(firstContact.firstContactTime || '0') : 0
        };
      });

      // Formatar dados de tickets por usuário
      const formattedTicketsByUser = ticketsByUser.map((user) => ({
        userId: user.userId,
        userName: user.user?.name || "Desconhecido",
        count: parseInt(user.count)
      }));

      return {
        ticketsByQueue: formattedTicketsByQueue,
        ticketsByUser: formattedTicketsByUser
      };
    } catch (error) {
      logger.error("Erro em getQueuesMetrics", { error });
      throw new AppError("Erro ao buscar métricas de filas", 500);
    }
  }

  public async getQueuesComparison(companyId: number, queue1Id: number, queue2Id: number): Promise<QueueComparison> {
    logger.info("DashboardService.getQueuesComparison - Iniciando comparação", {
      companyId,
      queue1Id,
      queue2Id
    });

    try {
      // Verificar se as filas existem e pertencem à empresa
      const queues = await Queue.findAll({
        where: {
          companyId,
          id: { [Op.in]: [queue1Id, queue2Id] }
        }
      });

      if (queues.length !== 2) {
        throw new AppError("Uma ou ambas as filas não foram encontradas", 404);
      }

      // Buscar métricas para a fila 1
      const queue1Metrics = await this.getQueueDetailedMetrics(companyId, queue1Id);

      // Buscar métricas para a fila 2
      const queue2Metrics = await this.getQueueDetailedMetrics(companyId, queue2Id);

      return {
        queue1: queue1Metrics,
        queue2: queue2Metrics
      };
    } catch (error) {
      logger.error("Erro em getQueuesComparison", { error });
      throw new AppError("Erro ao obter comparativo de filas", 500);
    }
  }

  private async getQueueDetailedMetrics(companyId: number, queueId: number): Promise<QueueComparisonData> {
    try {
      // Definir período de 30 dias
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      // Buscar dados da fila
      const queue = await Queue.findOne({
        where: {
          id: queueId,
          companyId
        }
      });

      if (!queue) {
        throw new AppError(`Fila ${queueId} não encontrada`, 404);
      }

      // Total de mensagens
      const messagesCount = await Message.count({
        include: [{
          model: Ticket,
          as: "ticket",
          where: {
            queueId,
            companyId
          },
          required: true
        }],
        where: {
          createdAt: {
            [Op.between]: [startDate.getTime(), endDate.getTime()]
          }
        }
      });

      // Tempo médio de resposta
      const avgTimeResult = await sequelize.query(`
  SELECT AVG(
    CASE 
      WHEN EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 > 1440 
      THEN 1440 
      ELSE EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60 
    END
  ) as "avgTime"
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
`, {
        replacements: {
          companyId,
          queueId,
          startDate,
          endDate
        },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      // Clientes únicos
      const clientsCount = await Ticket.count({
        where: {
          companyId,
          queueId,
          createdAt: {
            [Op.between]: [startDate.getTime(), endDate.getTime()]
          }
        },
        distinct: true,
        col: 'contactId'
      });

      // Taxa de resposta
      const responseRateResult = await sequelize.query(`
        SELECT 
          (COUNT(CASE WHEN m."fromMe" = true THEN 1 ELSE NULL END) * 100.0 / 
           NULLIF(COUNT(*), 0)) as "responseRate"
        FROM "Messages" m
        INNER JOIN "Tickets" t ON t.id = m."ticketId"
        WHERE t."companyId" = :companyId
        AND t."queueId" = :queueId
        AND m."createdAt" BETWEEN :startDate AND :endDate
      `, {
        replacements: {
          companyId,
          queueId,
          startDate,
          endDate
        },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      // Tempo de primeiro contato
      const firstContactTimeResult = await sequelize.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (m."createdAt" - t."createdAt")) / 60) as "firstContactTime"
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
      `, {
        replacements: {
          companyId,
          queueId,
          startDate,
          endDate
        },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      // Formatar resultados
      return {
        id: queueId,
        name: queue.name,
        messages: messagesCount,
        avgTime: avgTimeResult?.avgTime ? parseFloat(avgTimeResult.avgTime) : 0,
        clients: clientsCount,
        responseRate: responseRateResult?.responseRate ? Math.round(parseFloat(responseRateResult.responseRate)) : 0,
        firstContactTime: firstContactTimeResult?.firstContactTime ? parseFloat(firstContactTimeResult.firstContactTime) : 0
      };
    } catch (error) {
      logger.error("Erro em getQueueDetailedMetrics", { error, companyId, queueId });
      throw error;
    }
  }

  public async getAgentProspection(companyId: number, period: string = 'semana'): Promise<AgentProspectionData[]> {
    logger.info("DashboardService.getAgentProspection - Iniciando consulta", {
      companyId,
      period
    });

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
        },
        attributes: ['id', 'name']
      });

      // Calcular métricas para cada usuário
      const prospectionData = await Promise.all(
        users.map(async (user) => {
          // Contar novos contatos
          const clientsResult = await sequelize.query(`
SELECT COUNT(DISTINCT c.id) as count
            FROM "Contacts" c
            INNER JOIN "Tickets" t ON t."contactId" = c.id
            WHERE c."companyId" = :companyId
            AND c."createdAt" BETWEEN :startDate AND :endDate
            AND t."userId" = :userId
          `, {
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

          // Contar mensagens enviadas
          const messagesResult = await sequelize.query(`
            SELECT COUNT(m.id) as count
            FROM "Messages" m
            INNER JOIN "Tickets" t ON t.id = m."ticketId"
            WHERE m."companyId" = :companyId
            AND m."createdAt" BETWEEN :startDate AND :endDate
            AND m."fromMe" = true
            AND t."userId" = :userId
          `, {
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

          // Determinar desempenho com base em limiares ajustáveis
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
      logger.error("Erro em getAgentProspection", { error });
      throw new AppError("Erro ao obter dados de prospecção por agente", 500);
    }
  }

  // Novo método para comparar desempenho de um usuário em dois setores diferentes
  public async getUserQueuesComparison(
    companyId: number,
    userId: number,
    queue1Id: number,
    queue2Id: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<UserQueueComparison> {
    logger.info("DashboardService.getUserQueuesComparison - Iniciando comparação", {
      companyId,
      userId,
      queue1Id,
      queue2Id
    });

    try {
      // Verificar se as filas existem e pertencem à empresa
      const queues = await Queue.findAll({
        where: {
          companyId,
          id: { [Op.in]: [queue1Id, queue2Id] }
        }
      });

      if (queues.length !== 2) {
        throw new AppError("Uma ou ambas as filas não foram encontradas", 404);
      }

      // Verificar se o usuário existe e pertence à empresa
      const user = await User.findOne({
        where: {
          id: userId,
          companyId
        }
      });

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Definir período padrão se não fornecido
      const { startDate: start, endDate: end } = this.getDateRange(startDate, endDate);

      // Buscar dados do usuário na fila 1
      const queue1Data = await this.getUserQueueMetrics(companyId, userId, queue1Id, start, end);

      // Buscar dados do usuário na fila 2
      const queue2Data = await this.getUserQueueMetrics(companyId, userId, queue2Id, start, end);

      // Calcular totais
      const totalClients = queue1Data.clients + queue2Data.clients;
      const totalMessages = queue1Data.messages + queue2Data.messages;

      return {
        user: {
          id: userId,
          name: user.name
        },
        queue1: {
          id: queue1Id,
          name: queues.find(q => q.id === queue1Id)?.name || "Desconhecido",
          clients: queue1Data.clients,
          messages: queue1Data.messages
        },
        queue2: {
          id: queue2Id,
          name: queues.find(q => q.id === queue2Id)?.name || "Desconhecido",
          clients: queue2Data.clients,
          messages: queue2Data.messages
        },
        totals: {
          clients: totalClients,
          messages: totalMessages
        }
      };
    } catch (error) {
      logger.error("Erro em getUserQueuesComparison", { error });
      throw new AppError("Erro ao obter comparativo do usuário entre filas", 500);
    }
  }

  // Método auxiliar para buscar métricas de um usuário em uma fila específica
  private async getUserQueueMetrics(
    companyId: number,
    userId: number,
    queueId: number,
    startDate: Date,
    endDate: Date
  ): Promise<{ clients: number; messages: number }> {
    try {
      // Contar clientes únicos atendidos pelo usuário na fila
      const clientsResult = await sequelize.query(`
        SELECT COUNT(DISTINCT t."contactId") as count
        FROM "Tickets" t
        WHERE t."companyId" = :companyId
        AND t."userId" = :userId
        AND t."queueId" = :queueId
        AND t."createdAt" BETWEEN :startDate AND :endDate
      `, {
        replacements: {
          companyId,
          userId,
          queueId,
          startDate,
          endDate
        },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      const clients = clientsResult ? parseInt(clientsResult.count) : 0;

      // Contar mensagens enviadas pelo usuário na fila
      const messagesResult = await sequelize.query(`
        SELECT COUNT(m.id) as count
        FROM "Messages" m
        INNER JOIN "Tickets" t ON t.id = m."ticketId"
        WHERE m."companyId" = :companyId
        AND m."createdAt" BETWEEN :startDate AND :endDate
        AND m."fromMe" = true
        AND t."userId" = :userId
        AND t."queueId" = :queueId
      `, {
        replacements: {
          companyId,
          userId,
          queueId,
          startDate,
          endDate
        },
        type: QueryTypes.SELECT,
        plain: true
      }) as any;

      const messages = messagesResult ? parseInt(messagesResult.count) : 0;

      return { clients, messages };
    } catch (error) {
      logger.error("Erro em getUserQueueMetrics", { error });
      throw error;
    }
  }
}

export default DashboardService;