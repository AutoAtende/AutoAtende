import { Op, QueryTypes, Sequelize } from "sequelize";
import Company from "../../models/Company";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import TicketTraking from "../../models/TicketTraking";
import Invoices from "../../models/Invoices";
import Plan from "../../models/Plan";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import sequelize from "../../database";
import { startOfMonth, endOfMonth, subDays, format } from "date-fns";
import { logger } from '../../utils/logger';
import AppError from "../../errors/AppError";
import * as os from "os";

// Interfaces relacionadas à qualidade
interface QualityMetricDetail {
  total: number;
  percentage: number;
  byPeriod: Array<{
    period: string;
    total: number;
    percentage: number;
  }>;
}

interface QualityMetrics {
  firstCallResolution: QualityMetricDetail;
  directResolution: QualityMetricDetail;
}

interface QueryResult {
  quality_metrics: QualityMetrics;
}

interface WhatsappStatusCount {
  status: string;
  count: string;
  dataValues?: {
    status: string;
    count: string;
  };
}

interface TicketMetricsResult {
  pending: number;
  ongoing: number;
  closed: number;
  total: number;
  avg_response_time: number;
  pending_rate: number;
}

// Interfaces completas para tipagem
interface AdminDashboardMetrics {
  companiesActive: number;
  totalCompanies: number;
  usersActive7Days: number;
  usersActive30Days: number;
  contactMetrics: ContactMetrics;
  serviceMetrics: ServiceMetrics;
  revenueMetrics: RevenueMetrics;
  whatsappMetrics: WhatsappMetrics;
  systemMetrics: SystemMetrics;
  messageVolume: MessageVolumeMetrics;
  campaignMetrics: CampaignMetrics;
}

interface ContactMetrics {
  total: number;
  byState: Record<string, { count: number }>;
  activeContactsPerQueue?: Record<string, number>;
}

interface ServiceMetrics {
  leads: number;
  tickets: {
    pending: number;
    ongoing: number;
    closed: number;
    total: number;
  };
  ratings: {
    withRating: number;
    withoutRating: number;
    ratingPercentage: number;
  };
  response: {
    averageTime: number;
    pendingRate: number;
  };
  quality: {
    firstCallResolution: QualityMetricDetail;
    directResolution: QualityMetricDetail;
  };
}

interface RevenueMetrics {
  monthlyRevenue: number;
  annualRevenue: number;
  planDistribution: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  defaultRate: number;
  defaultTrend: Array<{
    date: string;
    rate: number;
  }>;
  projection: Array<{
    month: string;
    projected: number;
    actual: number;
  }>;
}

interface WhatsappMetrics {
  total: number;
  active: number;
  inactive: number;
  connecting: number;
  deliveryRate: number;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
}

interface MessageVolumeMetrics {
  total: number;
  trend: Array<{
    date: string;
    count: number;
  }>;
}

interface CampaignMetrics {
  total: number;
  delivered: number;
  confirmed: number;
  successRate: number;
  trends: Array<{
    date: string;
    sent: number;
    delivered: number;
  }>;
}

interface WhatsappStatusCount {
  status: string;
  count: string;
}

// Função principal de métricas
export const GetMetricsService = async (): Promise<AdminDashboardMetrics> => {
  try {
    logger.info("Iniciando coleta de métricas do dashboard");

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    let companiesActive = 0;
    let totalCompanies = 0;
    let usersActive7Days = 0;
    let usersActive30Days = 0;
    let revenueMetrics = null;
    let serviceMetrics = null;
    let contactMetrics = null;
    let whatsappMetrics = null;
    let systemMetrics = null;
    let messageVolume = null;
    let campaignMetrics = null;

    try {
      logger.info("Coletando métricas de empresas e usuários");
      companiesActive = await Company.count({ where: { status: true, updatedAt: { [Op.gte]: thirtyDaysAgo } } });
      totalCompanies = await Company.count();
      usersActive7Days = await User.count({ where: { updatedAt: { [Op.gte]: sevenDaysAgo } } });
      usersActive30Days = await User.count({ where: { updatedAt: { [Op.gte]: thirtyDaysAgo } } });
      console.log("Métricas de empresas e usuários coletadas:", { companiesActive, totalCompanies, usersActive7Days, usersActive30Days });
    } catch (error) {
      logger.error("Erro ao coletar métricas de empresas e usuários", { error });
      console.error("Erro ao coletar métricas de empresas e usuários:", error);
    }

    try {
      logger.info("Coletando métricas financeiras");
      revenueMetrics = await calculateRevenueMetrics(startOfCurrentMonth, endOfCurrentMonth, now);
      console.log("Métricas financeiras coletadas:", revenueMetrics);
    } catch (error) {
      logger.error("Erro ao coletar métricas financeiras", { error });
      console.error("Erro ao coletar métricas financeiras:", error);
    }

    try {
      logger.info("Coletando métricas de serviço e qualidade");
      serviceMetrics = await calculateServiceMetrics(thirtyDaysAgo, now);
      console.log("Métricas de serviço e qualidade coletadas:", serviceMetrics);
    } catch (error) {
      logger.error("Erro ao coletar métricas de serviço e qualidade", { error });
      console.error("Erro ao coletar métricas de serviço e qualidade:", error);
    }

    try {
      logger.info("Coletando métricas de contato e distribuição geográfica");
      contactMetrics = await calculateContactMetrics();
      console.log("Métricas de contato e distribuição geográfica coletadas:", contactMetrics);
    } catch (error) {
      logger.error("Erro ao coletar métricas de contato e distribuição geográfica", { error });
      console.error("Erro ao coletar métricas de contato e distribuição geográfica:", error);
    }

    try {
      logger.info("Coletando métricas do WhatsApp");
      whatsappMetrics = await calculateWhatsappMetrics();
      console.log("Métricas do WhatsApp coletadas:", whatsappMetrics);
    } catch (error) {
      logger.error("Erro ao coletar métricas do WhatsApp", { error });
      console.error("Erro ao coletar métricas do WhatsApp:", error);
    }

    try {
      logger.info("Coletando métricas do sistema");
      systemMetrics = calculateSystemMetrics();
      console.log("Métricas do sistema coletadas:", systemMetrics);
    } catch (error) {
      logger.error("Erro ao coletar métricas do sistema", { error });
      console.error("Erro ao coletar métricas do sistema:", error);
    }

    try {
      logger.info("Coletando volume de mensagens");
      messageVolume = await calculateMessageVolumeMetrics(thirtyDaysAgo);
      console.log("Volume de mensagens coletado:", messageVolume);
    } catch (error) {
      logger.error("Erro ao coletar volume de mensagens", { error });
      console.error("Erro ao coletar volume de mensagens:", error);
    }

    try {
      logger.info("Coletando métricas de campanhas");
      campaignMetrics = await calculateCampaignMetrics(thirtyDaysAgo);
      console.log("Métricas de campanhas coletadas:", campaignMetrics);
    } catch (error) {
      logger.error("Erro ao coletar métricas de campanhas", { error });
      console.error("Erro ao coletar métricas de campanhas:", error);
    }

    return {
      companiesActive,
      totalCompanies,
      usersActive7Days,
      usersActive30Days,
      contactMetrics,
      serviceMetrics,
      revenueMetrics,
      whatsappMetrics,
      systemMetrics,
      messageVolume,
      campaignMetrics
    };

  } catch (error) {
    logger.error("Erro ao processar métricas do dashboard", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error("Erro ao processar métricas do dashboard:", error);
    throw new AppError("Erro ao processar métricas", 500);
  }
};

async function calculateRevenueMetrics(
  startOfCurrentMonth: Date,
  endOfCurrentMonth: Date,
  now: Date
): Promise<RevenueMetrics> {
  const [monthlyRevenue, annualRevenue] = await Promise.all([
    Invoices.sum('value', {
      where: {
        status: 'paid',
        createdAt: {
          [Op.between]: [
            startOfCurrentMonth.getTime(),
            endOfCurrentMonth.getTime()
          ]
        }
      }
    }),
    Invoices.sum('value', {
      where: {
        status: 'paid',
        createdAt: {
          [Op.between]: [
            new Date(now.getFullYear(), 0, 1).getTime(),
            now.getTime()
          ]
        }
      }
    })
  ]);

  // Distribuição por planos
  const plans = await Plan.findAll();
  const planDistribution = await Promise.all(
    plans.map(async plan => {
      const count = await Company.count({ where: { planId: plan.id } });
      return {
        name: plan.name,
        count,
        value: plan.value * count
      };
    })
  );

  // Tendência de inadimplência
  const defaultTrend = await calculateDefaultTrend(subDays(now, 30), now);

  // Projeção de receita
  const projection = await calculateRevenueProjection();

  return {
    monthlyRevenue: monthlyRevenue || 0,
    annualRevenue: annualRevenue || 0,
    planDistribution,
    defaultRate: await calculateDefaultRate(),
    defaultTrend,
    projection
  };
}

async function calculateServiceMetrics(
  startDate: Date,
  endDate: Date
): Promise<ServiceMetrics> {
  const ticketMetricsQuery = `
    WITH ticket_stats AS (
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as ongoing,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        COUNT(*) as total,
        AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))/60) as avg_response_time
      FROM "Tickets"
      WHERE "createdAt" BETWEEN :startDate AND :endDate
    )
    SELECT 
      *,
      (pending::float / NULLIF(total, 0) * 100) as pending_rate
    FROM ticket_stats
  `;

  const [ticketMetrics] = await sequelize.query<TicketMetricsResult>(ticketMetricsQuery, {
    replacements: { startDate, endDate },
    type: QueryTypes.SELECT
  });

  // Cálculo de FCR e resolução direta
  const qualityMetrics = await calculateQualityMetrics(startDate, endDate);

  const leads = await calculateLeads();
  const ratings = await calculateRatings();

  return {
    leads,
    tickets: {
      pending: ticketMetrics?.pending || 0,
      ongoing: ticketMetrics?.ongoing || 0,
      closed: ticketMetrics?.closed || 0,
      total: ticketMetrics?.total || 0
    },
    ratings,
    response: {
      averageTime: ticketMetrics?.avg_response_time || 0,
      pendingRate: ticketMetrics?.pending_rate || 0
    },
    quality: qualityMetrics
  };
}

async function calculateQualityMetrics(startDate: Date, endDate: Date): Promise<QualityMetrics> {
  try {
    const baseQuery = `
      WITH closed_tickets AS (
        SELECT 
          t.id,
          t."createdAt",
          t."updatedAt",
          (
            SELECT COUNT(*) 
            FROM "TicketTraking" tt 
            WHERE tt."ticketId" = t.id
          ) as interaction_count,
          (
            SELECT MIN(tt."createdAt") 
            FROM "TicketTraking" tt 
            WHERE tt."ticketId" = t.id
          ) as first_interaction,
          (
            SELECT MAX(tt."createdAt") 
            FROM "TicketTraking" tt 
            WHERE tt."ticketId" = t.id
          ) as last_interaction,
          (
            SELECT COUNT(DISTINCT tt.status)
            FROM "TicketTraking" tt 
            WHERE tt."ticketId" = t.id
          ) as status_changes
        FROM "Tickets" t
        WHERE 
          t.status = 'closed'
          AND t."createdAt" BETWEEN :startDate AND :endDate
      ),
      daily_stats AS (
        SELECT
          DATE_TRUNC('day', "createdAt") as period,
          COUNT(*) as total_tickets,
          COUNT(
            CASE WHEN 
              interaction_count = 1 
              AND status_changes = 1
            THEN 1 END
          ) as fcr_count,
          COUNT(
            CASE WHEN 
              interaction_count = 1 
              AND status_changes = 1
              AND EXTRACT(EPOCH FROM (last_interaction - first_interaction)) <= 86400
            THEN 1 END
          ) as direct_resolution_count
        FROM closed_tickets
        GROUP BY DATE_TRUNC('day', "createdAt")
      ),
      total_stats AS (
        SELECT
          COUNT(*) as total_tickets,
          COUNT(
            CASE WHEN 
              interaction_count = 1 
              AND status_changes = 1
            THEN 1 END
          ) as total_fcr,
          COUNT(
            CASE WHEN 
              interaction_count = 1 
              AND status_changes = 1
              AND EXTRACT(EPOCH FROM (last_interaction - first_interaction)) <= 86400
            THEN 1 END
          ) as total_direct_resolution
        FROM closed_tickets
      )
      SELECT
        t.total_tickets,
        t.total_fcr,
        t.total_direct_resolution,
        json_agg(
          json_build_object(
            'period', d.period,
            'total', d.total_tickets,
            'fcr', d.fcr_count,
            'directResolution', d.direct_resolution_count
          ) ORDER BY d.period
        ) as daily_metrics
      FROM total_stats t
      CROSS JOIN LATERAL (
        SELECT * FROM daily_stats
      ) d
      GROUP BY 
        t.total_tickets, 
        t.total_fcr,
        t.total_direct_resolution;
    `;

    const [result] = await sequelize.query(baseQuery, {
      replacements: { 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      type: QueryTypes.SELECT
    });

    if (!result) {
      logger.warn('Nenhum resultado encontrado para métricas de qualidade');
      return {
        firstCallResolution: {
          total: 0,
          percentage: 0,
          byPeriod: []
        },
        directResolution: {
          total: 0,
          percentage: 0,
          byPeriod: []
        }
      };
    }

    const {
      total_tickets = 0,
      total_fcr = 0,
      total_direct_resolution = 0,
      daily_metrics = []
    } = result as any;

    // Processamento dos resultados diários
    const byPeriod = (daily_metrics || []).map((day: any) => ({
      period: format(new Date(day.period), 'yyyy-MM-dd'),
      total: Number(day.total),
      percentage: day.total > 0 
        ? (Number(day.fcr) / Number(day.total)) * 100 
        : 0
    }));

    const directResolutionByPeriod = (daily_metrics || []).map((day: any) => ({
      period: format(new Date(day.period), 'yyyy-MM-dd'),
      total: Number(day.directResolution),
      percentage: day.total > 0 
        ? (Number(day.directResolution) / Number(day.total)) * 100 
        : 0
    }));

    return {
      firstCallResolution: {
        total: Number(total_fcr),
        percentage: total_tickets > 0 
          ? (Number(total_fcr) / Number(total_tickets)) * 100 
          : 0,
        byPeriod
      },
      directResolution: {
        total: Number(total_direct_resolution),
        percentage: total_tickets > 0 
          ? (Number(total_direct_resolution) / Number(total_tickets)) * 100 
          : 0,
        byPeriod: directResolutionByPeriod
      }
    };

  } catch (error) {
    logger.error('Erro ao calcular métricas de qualidade:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      startDate,
      endDate
    });

    // Retorna um objeto vazio mas válido em caso de erro
    return {
      firstCallResolution: {
        total: 0,
        percentage: 0,
        byPeriod: []
      },
      directResolution: {
        total: 0,
        percentage: 0,
        byPeriod: []
      }
    };
  }
}

async function calculateContactMetrics(): Promise<ContactMetrics> {
  const contactsByState = await calculateContactsByState();
  const total = await Contact.count();
  const activeContactsPerQueue = await calculateActiveContactsPerQueue();

  return {
    total,
    byState: contactsByState,
    activeContactsPerQueue
  };
}

async function calculateContactsByState(): Promise<Record<string, { count: number }>> {
  const contacts = await Contact.findAll({
    where: {
      number: {
        [Op.like]: '55%'
      }
    },
    attributes: ['number']
  });

  const stateCount: Record<string, { count: number }> = {};
  
  // Inicializa contadores para todos os estados
  Object.keys(statesDDD).forEach(state => {
    stateCount[state] = { count: 0 };
  });

  // Processa cada contato
  contacts.forEach(contact => {
    if (!contact.number || !contact.number.startsWith('55') || contact.number.length < 12) {
      return;
    }

    const ddd = contact.number.substring(2, 4);
    const state = dddToState[ddd];

    if (state && stateCount[state]) {
      stateCount[state].count++;
    }
  });

  return stateCount;
}

async function calculateActiveContactsPerQueue(): Promise<Record<string, number>> {
  const activeContacts = await sequelize.query(`
    SELECT 
      q.id as "queueId",
      q.name as "queueName",
      COUNT(DISTINCT t."contactId") as "activeContacts"
    FROM "Queues" q
    LEFT JOIN "Tickets" t ON t."queueId" = q.id
    WHERE t.status IN ('pending', 'open')
    GROUP BY q.id, q.name
  `, {
    type: QueryTypes.SELECT
  });
  // Depois
  return activeContacts.reduce<Record<string, number>>((acc, queue: any) => {
    acc[queue.queueName] = parseInt(queue.activeContacts);
    return acc;
  }, {} as Record<string, number>);
}

async function calculateWhatsappMetrics(): Promise<WhatsappMetrics> {
  const connectionsRaw = await Whatsapp.findAll({
    attributes: [
      'status',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  const connections = connectionsRaw as unknown as WhatsappStatusCount[];

  const metrics = connections.reduce((acc: Record<string, number>, conn) => {
    const status = conn.status || conn.dataValues?.status;
    const count = parseInt(conn.count || conn.dataValues?.count || '0');
    acc[status] = count;
    return acc;
  }, {} as Record<string, number>);

  const total = await Message.count({
    where: {
      createdAt: {
        [Op.gte]: subDays(new Date(), 30)
      }
    }
  });

  const delivered = await Message.count({
    where: {
      createdAt: {
        [Op.gte]: subDays(new Date(), 30)
      },
      ack: {
        [Op.gte]: 2
      }
    }
  });

  return {
    total: Object.values(metrics).reduce((a: number, b: number) => a + b, 0),
    active: metrics.CONNECTED || 0,
    inactive: metrics.DISCONNECTED || 0,
    connecting: metrics.CONNECTING || 0,
    deliveryRate: total > 0 ? (delivered / total) * 100 : 0
  };
}


function calculateSystemMetrics(): SystemMetrics {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    cpu: {
      usage: os.loadavg()[0],
      cores: cpus.length,
      model: cpus[0].model
    },
    memory: {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      usagePercent: (usedMemory / totalMemory) * 100
    }
  };
}

async function calculateMessageVolumeMetrics(startDate: Date): Promise<MessageVolumeMetrics> {
  const messageVolume = await sequelize.query(`
    SELECT 
      DATE_TRUNC('day', "createdAt") as date,
      COUNT(*) as count
    FROM "Messages"
    WHERE "createdAt" >= :startDate
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date
  `, {
    replacements: { startDate },
    type: QueryTypes.SELECT
  });

  const total = await Message.count({
    where: {
      createdAt: {
        [Op.gte]: startDate
      }
    }
  });

  return {
    total,
    trend: messageVolume.map((item: any) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      count: parseInt(item.count)
    }))
  };
}

async function calculateDefaultTrend(startDate: Date, endDate: Date) {
  const trends = await Invoices.findAll({
    attributes: [
      [Sequelize.fn('DATE_TRUNC', 'day', Sequelize.col('createdAt')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('*')), 'total'],
      [Sequelize.fn('SUM', 
        Sequelize.literal("CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END")), 
        'defaulted']
    ],
    where: {
      createdAt: {
        [Op.between]: [
          startDate.getTime(),  // Convertemos para timestamp
          endDate.getTime()     // Convertemos para timestamp
        ]
      }
    },
    group: [Sequelize.fn('DATE_TRUNC', 'day', Sequelize.col('createdAt'))],
    raw: true
  });

  return trends.map((trend: any) => ({
    date: format(trend.date, 'yyyy-MM-dd'),
    rate: trend.total > 0 ? (Number(trend.defaulted) / Number(trend.total) * 100) : 0
  }));
}

async function calculateRevenueProjection() {
  const lastMonths = await Invoices.findAll({
    attributes: [
      [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'month'],
      [Sequelize.fn('SUM', Sequelize.col('value')), 'total']
    ],
    where: {
      status: 'paid',
      createdAt: {
        [Op.gte]: subDays(new Date(), 180)
      }
    },
    group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))],
    raw: true
  });

  return lastMonths.map((month: any) => ({
    month: format(month.month, 'yyyy-MM'),
    projected: calculateProjectedValue(month.total),
    actual: month.total
  }));
}

function calculateProjectedValue(currentValue: number): number {
  // Implementar lógica de projeção baseada em seus requisitos de negócio
  // Por exemplo, um crescimento mensal de 5%
  return currentValue * 1.05;
}

async function calculateDefaultRate() {
  const [totalInvoices, defaultedInvoices] = await Promise.all([
    Invoices.count(),
    Invoices.count({
      where: {
        status: 'unpaid',
        dueDate: {
          [Op.lt]: new Date()
        }
      }
    })
  ]);

  return totalInvoices > 0 ? (defaultedInvoices / totalInvoices) * 100 : 0;
}

async function calculateLeads() {
  return Contact.count();
}

async function calculateRatings() {
  try {
    const [ticketsWithRating, totalTickets] = await Promise.all([
      TicketTraking.count({
        where: {
          rated: true,
          ratingAt: {
            [Op.not]: null
          }
        },
        distinct: true,
        col: 'ticketId'
      }),
      Ticket.count({
        where: {
          status: 'closed'  // Consideramos apenas tickets fechados para o cálculo
        }
      })
    ]);

    return {
      withRating: ticketsWithRating,
      withoutRating: totalTickets - ticketsWithRating,
      ratingPercentage: totalTickets > 0 ? (ticketsWithRating / totalTickets) * 100 : 0
    };
  } catch (error) {
    logger.error("Erro ao calcular métricas de avaliação:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    // Retorna valores zerados em caso de erro
    return {
      withRating: 0,
      withoutRating: 0,
      ratingPercentage: 0
    };
  }
}

async function calculateCampaignMetrics(startDate: Date): Promise<CampaignMetrics> {
  const campaigns = await Campaign.findAll({
    where: {
      createdAt: {
        [Op.gte]: startDate
      }
    },
    include: [{
      model: CampaignShipping,
      attributes: ['id', 'deliveredAt', 'confirmedAt']
    }]
  });

  const total = campaigns.reduce((acc, campaign) => acc + campaign.shipping.length, 0);
  const delivered = campaigns.reduce((acc, campaign) => 
    acc + campaign.shipping.filter(s => s.deliveredAt).length, 0);
  const confirmed = campaigns.reduce((acc, campaign) => 
    acc + campaign.shipping.filter(s => s.confirmedAt).length, 0);

  // Calcula tendências diárias
  const trends = await sequelize.query(`
    SELECT 
      DATE_TRUNC('day', "createdAt") as date,
      COUNT(*) as sent,
      COUNT(CASE WHEN "deliveredAt" IS NOT NULL THEN 1 END) as delivered
    FROM "CampaignShipping"
    WHERE "createdAt" >= :startDate
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date
  `, {
    replacements: { startDate },
    type: QueryTypes.SELECT
  });

  return {
    total,
    delivered,
    confirmed,
    successRate: total > 0 ? (confirmed / total) * 100 : 0,
    trends: trends.map((item: any) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      sent: parseInt(item.sent),
      delivered: parseInt(item.delivered)
    }))
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

// Exporta a função principal e os tipos para uso em outros arquivos
export {
  AdminDashboardMetrics,
  ContactMetrics,
  ServiceMetrics,
  RevenueMetrics,
  WhatsappMetrics,
  SystemMetrics,
  MessageVolumeMetrics,
  CampaignMetrics
};