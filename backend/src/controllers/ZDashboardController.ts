import { Request, Response } from "express";
import { Op, literal, fn, col, where, QueryTypes } from "sequelize";
import Ticket from "../models/Ticket";
import TicketTraking from "../models/TicketTraking";
import User from "../models/User";
import UserRating from "../models/UserRating";
import Task from "../models/Task";
import Setting from "../models/Setting";
import { logger } from "../utils/logger";
import axios from 'axios';
import {has} from "../utils/helpers";
import sequelize from "../database";

interface CardsData {
  counters: any;
  attendants: [];
}

export const CardsData = async (companyId: string | number): Promise<Counters> => {

  let days = 30;

// Obter a data atual
const today = new Date();

// Calcular a data 30 dias atrás
const pastDate = new Date();
pastDate.setDate(today.getDate() - days);

// Converter as datas para o formato ISO 8601 (YYYY-MM-DD)
const date_to = today.toISOString().split('T')[0];
const date_from = pastDate.toISOString().split('T')[0];

const params = {
  days: 30,
  date_to,
  date_from
}

  const query = `   with traking as
                           (select c.name                                                                    "companyName",
                                   u.name                                                                    "userName",
                                   u.online                                                                  "userOnline",
                                   w.name                                                                    "whatsappName",
                                   ct.name                                                                   "contactName",
                                   ct.number                                                                 "contactNumber",
                                   (t."status" = 'closed')                                                   "finished",
                                   (tt."userId" is null and tt."finishedAt" is null and
                                    t."status" = 'pending')                                                  "pending",
                                   coalesce(((date_part('day', age(tt."finishedAt")) * 24 * 60) +
                                             (date_part('hour', age(tt."finishedAt", tt."startedAt")) * 60) +
                                             (date_part('minutes', age(tt."finishedAt", tt."startedAt")))),
                                            0)                                                               "supportTime",
                                   coalesce(((date_part('day', age(tt."queuedAt", tt."startedAt")) * 24 * 60) +
                                             (date_part('hour', age(tt."queuedAt", tt."startedAt")) * 60) +
                                             (date_part('minutes', age(tt."queuedAt", tt."startedAt")))), 0) "waitTime",
                                   t.status,
                                   tt.*,
                                   ct."id"                                                                   "contactId"
                            from "TicketTraking" tt
                                   left join "Companies" c on c.id = tt."companyId"
                                   left join "Users" u on u.id = tt."userId"
                                   left join "Whatsapps" w on w.id = tt."whatsappId"
                                   left join "Tickets" t on t.id = tt."ticketId"
                                   left join "Contacts" ct on ct.id = t."contactId" --filterPeriod),
                         counters
                           as (select (select avg("supportTime") from traking where "supportTime" > 0) "avgSupportTime",
                                      (select avg("waitTime") from traking where "waitTime" > 0)       "avgWaitTime",
                                      (select count(distinct "id")
                                       from "Tickets" t
                                       where status like 'open'
                                         and t."companyId" = ?)                                        "supportHappening",

                                      (select count(distinct "id")
                                       from "Tickets" t
                                       where status like 'pending' and t."companyId" = ?)              "supportPending",
                                      (select count(id) from traking where finished)                   "supportFinished",
                                      (select count(leads.id)
                                       from (select ct1.id, count(tt1.id) total
                                             from traking tt1
                                                    left join "Tickets" t1 on t1.id = tt1."ticketId"
                                                    left join "Contacts" ct1 on ct1.id = t1."contactId"
                                             group by 1
                                             having count(tt1.id) = 1) leads)                          "leads",
                                      (select count(id) from traking where "status" = 'closed')        "tickets",
                                      (select count(id) from traking where "status" = 'closed' and "rated" = false)           "waitRating",
                                      (select count(tt.id)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where "status" = 'closed' and ("rated" = false and "rate" = 0))                  "withoutRating",
                                      (select count(id)
                                       from traking
                                       where "rated" = true)                   "withRating",
                                      (((select count(id) from traking where "rated" = true) * 100) /
                                       nullif((select count(id) from traking), 0))                     "percRating",
                                      (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                            from traking tt
                                                                                   inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                            where rated = true), 0)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where tt.rated = true
                                         and ur."rate" > 3)                                            "npsPromotersPerc",
                                      (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                            from traking tt
                                                                                   inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                            where rated = true), 0)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where tt.rated = true
                                         and ur."rate" = 3)                                      "npsPassivePerc",
                                      (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                            from traking tt
                                                                                   inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                            where rated = true), 0)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where tt.rated = true
                                         and ur."rate" < 3 and ur."rate" != 0)                                            "npsDetractorsPerc",
                                      (select sum(nps.promoter) - sum(nps.detractor)
                                       from ( (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                                    from traking tt
                                                                                           inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                                    where rated = true), 0) promoter,
                                                      0                                                     detractor
                                               from traking tt
                                                      inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                               where tt.rated = true
                                                 and ur."rate" >= 3
                                               union
                                               select 0,
                                                      (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                                    from traking tt
                                                                                           inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                                    where rated = true), 0)
                                               from traking tt
                                                      inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                               where tt.rated = true
                                                 and ur.rate < 3 and ur.rate != 0)) nps)                                "npsScore"),
                         attedants as (select u1.id,
                                              u1."name",
                                              u1."online",
                                              avg(t."waitTime")                     "avgWaitTime",
                                              avg(t."supportTime")                  "avgSupportTime",
                                              count(t."id")                         "tickets",
                                              round(coalesce(avg(ur."rate"), 0), 2) "rating",
                                              coalesce(count(ur."id"), 0)           "countRating"
                                       from "Users" u1
                                              left join traking t on t."userId" = u1.id
                                              left join "UserRatings" ur
                                                        on ur."userId" = t."userId" and ur."ticketId" = t."ticketId"
                                       where u1."companyId" = ?
                                       group by 1, 2
                                       order by u1."name")
                    select (select coalesce(jsonb_build_object('counters', c.*) ->> 'counters', '{}') ::jsonb
                            from counters c)                                               counters,
                           (select coalesce(json_agg(a.*), '[]') ::jsonb from attedants a) attendants; `;

  let where = "where tt.\"companyId\" = ?";
  const replacements = [companyId];
  if (has(params, "days")) {
    where += " and tt.\"createdAt\" >= (now() - '? days'::interval)";
    replacements.push(parseInt(("" + params.days).replace(/\D/g, ""), 10));
  }
  if (has(params, "date_from")) {
    where += " and tt.\"createdAt\" >= ?";
    replacements.push(params.date_from + " 00:00:00");
  }
  if (has(params, "date_to")) {
    where += " and tt.\"createdAt\" <= ?";
    replacements.push(params.date_to + " 23:59:59");
  }
  replacements.push(companyId);
  replacements.push(companyId);
  replacements.push(companyId);

  const finalQuery = query.replace("--filterPeriod", where);

  const responseData: CardsData = await sequelize.query(finalQuery, {
    replacements,
    type: QueryTypes.SELECT,
    plain: true
  });

  const countersOnly = responseData.counters;

  return countersOnly;
}

interface DashboardData {
  announcements: any[];
  tickets: {
    totalTickets: number;
    waiting: number;
    inProgress: number;
    closed: number;
    avgWaitTime: string;
  };
  tasks: {
    total: number;
    overdue: number;
    completed: number;
  };
  users: any[];
  ratings: any[];
  zabbixDashboard: any;
}

interface NpsMetrics {
  totalTickets: number;
  withRating: number;
  waitRating: number;
  withoutRating: number;
  percRating: number;
  npsPromotersPerc: number;
  npsPassivePerc: number;
  npsDetractorsPerc: number;
  npsScore: number;
}

interface TicketMetrics {
  totalTickets: number;
  waiting: number;
  inProgress: number;
  closed: number;
  avgWaitTime: string;
}

interface Announcement {
  id: string;
  type: string;
  title: string;
  dueDate: Date | null;
}

interface Counters {
  leads: number;               // Número de leads
  tickets: number;             // Total de tickets
  npsScore: number;            // Pontuação NPS (Net Promoter Score)
  percRating: number;          // Porcentagem de avaliação
  waitRating: number;          // Quantidade de avaliações relacionadas ao tempo de espera
  withRating: number;          // Número de atendimentos avaliados
  avgWaitTime: string;         // Tempo médio de espera em segundos
  withoutRating: number;       // Número de atendimentos sem avaliação
  avgSupportTime: number;      // Tempo médio de suporte em segundos
  npsPassivePerc: number;      // Percentual de clientes passivos no NPS
  supportPending: number;      // Quantidade de atendimentos pendentes
  supportFinished: number;     // Quantidade de atendimentos finalizados
  npsPromotersPerc: number;    // Percentual de promotores no NPS
  supportHappening: number;    // Quantidade de atendimentos em andamento
  npsDetractorsPerc: number;   // Percentual de detratores no NPS
}

const defaultTicketsData: TicketMetrics = {
  totalTickets: 0,
  waiting: 0,
  inProgress: 0,
  closed: 0,
  avgWaitTime: "0h 0m"
};

const defaultTasksData = {
  total: 0,
  overdue: 0,
  completed: 0
};

const getTasksData = async (companyId: number): Promise<typeof defaultTasksData> => {
  try {
    const [total, overdue, completed] = await Promise.all([
      Task.count({ 
        where: { 
          companyId,
          done: { [Op.not]: true }
        }
      }),
      Task.count({ 
        where: {
          companyId,
          done: false,
          dueDate: { [Op.lt]: literal('CURRENT_DATE') }
        }
      }),
      Task.count({ 
        where: { 
          companyId,
          done: true 
        }
      })
    ]);

    return {
      total: total || 0,
      overdue: overdue || 0,
      completed: completed || 0
    };
  } catch (error) {
    logger.error("Error getting tasks data:", error);
    return defaultTasksData;
  }
};

const getTicketsData = async (companyId: number) => {
  try {
    const ticketData = await Promise.all([
      // Total aguardando
      Ticket.count({ 
        where: { 
          status: "pending",
          companyId
        }
      }),
      // Total em conversa
      Ticket.count({ 
        where: { 
          status: "open",
          companyId
        }
      }),
      // Total finalizados hoje
      Ticket.count({ 
        where: { 
          status: "closed",
          companyId,
          updatedAt: {
            [Op.gte]: literal('CURRENT_DATE'),
            [Op.lt]: literal('CURRENT_DATE + INTERVAL \'1 day\'')
          }
        }
      }),
      // Tempo médio de espera
      TicketTraking.findAll({
        where: {
          companyId,
          startedAt: {
            [Op.gte]: literal('CURRENT_DATE'),
            [Op.lt]: literal('CURRENT_DATE + INTERVAL \'1 day\'')
          }
        },
        attributes: [
          [fn('AVG', 
            literal('EXTRACT(EPOCH FROM (COALESCE("startedAt", CURRENT_TIMESTAMP) - "queuedAt")) / 60')
          ), 'avgWaitTime']
        ],
        raw: true
      })
    ]);

    const [waiting, inProgress, closed, [waitTimeResult]] = ticketData;
    const avgWaitTimeMinutes = parseFloat(waitTimeResult?.avgWaitTime) || 0;
    const hours = Math.floor(avgWaitTimeMinutes / 60);
    const minutes = Math.floor(avgWaitTimeMinutes % 60);

    const newWaiting = waiting;

    return {
      totalTickets: newWaiting + inProgress + closed,
      waiting: newWaiting,
      inProgress, 
      closed,
      avgWaitTime: `${hours}h ${minutes}m`
    };
  } catch (error) {
    logger.error("Error getting tickets data:", error);
    return defaultTicketsData;
  }
};

const getZabbixData = async () => {
  try {
    // Buscar configurações do Zabbix da empresa 1
    const settings = await Setting.findAll({
      where: {
        companyId: 1,
        key: ['enableZabbix', 'zabbixAuth', 'zabbixBaseUrl']
      }
    });

    const enableZabbix = settings.find(s => s.key === 'enableZabbix')?.value;
    
    // Se Zabbix não estiver habilitado, retorna array vazio
    if (enableZabbix !== 'enabled') {
      logger.info("Zabbix integration is disabled");
      return [];
    }

    const zabbixAuth = settings.find(s => s.key === 'zabbixAuth')?.value;
    const zabbixBaseUrl = settings.find(s => s.key === 'zabbixBaseUrl')?.value;

    // Verificar se as configurações necessárias existem
    if (!zabbixAuth || !zabbixBaseUrl) {
      logger.error("Zabbix configurations are missing for company ID 1");
      return [];
    }

    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    const auth = zabbixAuth;
    const baseUrl = zabbixBaseUrl;

    const problemsResponse = await axios.post(baseUrl, {
      jsonrpc: '2.0',
      method: 'problem.get',
      params: {
        output: 'extend',
        selectAcknowledges: 'extend',
        selectSuppressionData: 'extend',
        selectTags: 'extend',
        recent: true,
        time_from: sevenDaysAgo,
        sortfield: ['eventid'],
        sortorder: 'DESC'
      },
      auth: auth,
      id: 1
    }, {
      headers: {
        'Content-Type': 'application/json-rpc'
      },
      timeout: 5000
    });

    if (!problemsResponse.data.result || !problemsResponse.data.result.length) {
      return [];
    }

    const hostIds = [...new Set(problemsResponse.data.result.map(problem => problem.objectid))];

    const hostsResponse = await axios.post(baseUrl, {
      jsonrpc: '2.0',
      method: 'host.get',
      params: {
        output: ['hostid', 'host', 'name'],
        hostids: hostIds
      },
      auth: auth,
      id: 1
    }, {
      headers: {
        'Content-Type': 'application/json-rpc'
      },
      timeout: 5000
    });

    const hostMap = {};
    if (hostsResponse.data.result) {
      hostsResponse.data.result.forEach(host => {
        hostMap[host.hostid] = host.name || host.host;
      });
    }

    return problemsResponse.data.result.map(problem => ({
      ...problem,
      hostname: hostMap[problem.objectid] || 'Host Desconhecido'
    }));

  } catch (error) {
    logger.error("Error getting Zabbix data:", error);
    return [];
  }
};

const getAnnouncementsData = async (companyId: number): Promise<Announcement[]> => {
  try {
    logger.info(`[ZDASH] Iniciando getAnnouncementsData para companyId: ${companyId}`);
    
    const pendingTasks = await Task.findAll({
      where: {
        companyId,
        done: false,
        dueDate: {
          [Op.lte]: new Date() // Apenas registros com dueDate menor ou igual à data atual
        }
      },
      attributes: [
        'id', 
        'title', 
        'dueDate'
      ],
      order: [
        ['dueDate', 'ASC'], 
        ['createdAt', 'DESC']
      ]
    }).catch(error => {
      logger.error("[ZDASH] Erro na consulta de tarefas:", {
        message: error.message,
        stack: error.stack
      });
      throw error;
    });
    

    if (!pendingTasks) {
      logger.warn('[ZDASH] Consulta retornou null ou undefined');
      return [];
    }

    logger.info(`[ZDASH] Encontradas ${pendingTasks.length} tarefas pendentes`);

    const announcements = pendingTasks.map(task => {
      return {
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        dueDate: task.dueDate
      };
    });

    logger.info(`[ZDASH] Processadas ${announcements.length} tarefas para exibição`);
    return announcements;
    
  } catch (error) {
    logger.error("[ZDASH] Error getting announcements data:", {
      error: error.message,
      code: error.code,
      stack: error.stack,
      companyId
    });
    throw error;
  }
};


export const index = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user?.companyId || 1;
  const dashboardData: Partial<DashboardData> = {};
  let hasErrors = false;

  try {
    type PromiseResults = [
      TicketMetrics,
      typeof defaultTasksData,
      Array<{ id: number; name: string; online: boolean; rating: number }>,
      NpsMetrics,
      any[]
    ];

    const countersOnly: Counters = await CardsData(companyId);
    console.log(countersOnly);

    const results = await Promise.all([
      getTicketsData(companyId),
      getTasksData(companyId),
      getUsersData(companyId),
      getNpsMetrics(companyId),
      getZabbixData()
    ]).catch(err => {
      logger.error("Error in parallel data fetching:", err);
      hasErrors = true;
      return [
        defaultTicketsData,
        defaultTasksData,
        [] as Array<{ id: number; name: string; online: boolean; rating: number }>,
        { 
          totalTickets: 0, 
          withRating: 0, 
          waitRating: 0, 
          withoutRating: 0, 
          percRating: 0,
          npsPromotersPerc: 0,
          npsPassivePerc: 0,
          npsDetractorsPerc: 0,
          npsScore: 0
        },
        [] as any[]
      ] as PromiseResults;
    });

    const [tickets, tasks, users, npsData, zabbixData] = results;

    const seconds = Number(countersOnly.avgWaitTime);
    const hours = Math.floor(seconds/ 3600); // Calcula o número de horas inteiras
    const minutes = Math.floor((seconds % 3600) / 60); 

    tickets.avgWaitTime = `${hours}h ${minutes}m`;

    // Adiciona dados NPS do countersOnly aos npsData para garantir consistência
    npsData.npsPromotersPerc = countersOnly.npsPromotersPerc || 0;
    npsData.npsPassivePerc = countersOnly.npsPassivePerc || 0;
    npsData.npsDetractorsPerc = countersOnly.npsDetractorsPerc || 0;
    npsData.npsScore = countersOnly.npsScore || 0;

    dashboardData.tickets = tickets;
    dashboardData.tasks = tasks;
    dashboardData.users = users;
    dashboardData.ratings = [npsData];
    dashboardData.zabbixDashboard = zabbixData;

    try {
      dashboardData.announcements = await getAnnouncementsData(companyId);
    } catch (error) {
      console.log("Error getting announcements:", error);
      dashboardData.announcements = [];
      hasErrors = true;
    }

    const statusCode = hasErrors ? 206 : 200;
    return res.status(statusCode).json(dashboardData);

  } catch (error) {
    console.log("Critical error in dashboard data collection:", error);
    return res.status(500).json({
      announcements: [],
      tickets: defaultTicketsData,
      tasks: defaultTasksData,
      users: [],
      ratings: [],
      zabbixDashboard: []
    });
  }
};

export const nps = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user?.companyId || 1;
  logger.info(`[ZDASH] Iniciando endpoint NPS para companyId: ${companyId}`);
  
  try {
    // Obter dados completos de NPS
    const countersData = await CardsData(companyId);
    const npsMetrics = await getNpsMetrics(companyId);
    
    // Combinar dados do countersData e getNpsMetrics para ter informações completas
    const combinedData: NpsMetrics = {
      ...npsMetrics,
      npsPromotersPerc: countersData.npsPromotersPerc || 0,
      npsPassivePerc: countersData.npsPassivePerc || 0,
      npsDetractorsPerc: countersData.npsDetractorsPerc || 0,
      npsScore: countersData.npsScore || 0
    };
    
    logger.info('[ZDASH] NPS endpoint concluído com sucesso:', { data: combinedData });
    return res.status(200).json(combinedData);
  } catch (error) {
    logger.error("[ZDASH] Error in NPS endpoint:", {
      error: error.message,
      stack: error.stack,
      companyId
    });
    return res.status(500).json({ error: "Error getting NPS metrics" });
  }
};

const getUsersData = async (companyId: number) => {
  try {
    const users = await User.findAll({
      where: { 
        companyId,
        super: false
      },
      attributes: ["id", "name", "online"],
      include: [{
        model: UserRating,
        as: "ratings",
        attributes: ["rate"],
        required: false // Não requer avaliações para mostrar o usuário
      }],
      order: [['name', 'ASC']]
    });

    return users.map(user => {
      const ratings = user.ratings || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((acc: number, curr: any) => acc + curr.rate, 0) / ratings.length
        : 0;

      return {
        id: user.id,
        name: user.name,
        online: user.online,
        rating: avgRating
      };
    });
  } catch (error) {
    logger.error("Error getting users data:", error);
    return [];
  }
};

const getNpsMetrics = async (companyId: number) => {
  try {
    const thirtyDaysAgo = literal('CURRENT_DATE - INTERVAL \'30 days\'');
    const now = literal('CURRENT_DATE + INTERVAL \'1 day\'');

    // Busca todos os tickets fechados nos últimos 30 dias
    const tickets = await Ticket.findAll({
      where: {
        companyId,
        status: 'closed',
        updatedAt: {
          [Op.gte]: thirtyDaysAgo,
          [Op.lt]: now
        }
      },
      attributes: ['id']
    });

    // Busca todas as avaliações dos tickets fechados nos últimos 30 dias
    const ratings = await UserRating.findAll({
      where: {
        companyId,
        ticketId: {
          [Op.in]: tickets.map(t => t.id)
        },
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
          [Op.lt]: now
        }
      }
    });

    const totalTickets = tickets.length;
    const withRating = ratings.length;
    const withoutRating = totalTickets - withRating;
    const waitRating = tickets.filter(t => !ratings.some(r => r.ticketId === t.id)).length;
    const percRating = totalTickets > 0 ? (withRating / totalTickets) * 100 : 0;

    return {
      totalTickets,
      withRating,
      waitRating,
      withoutRating,
      percRating,
      npsPromotersPerc: 0, // Será preenchido no método principal
      npsPassivePerc: 0,   // Será preenchido no método principal
      npsDetractorsPerc: 0, // Será preenchido no método principal
      npsScore: 0          // Será preenchido no método principal
    };
  } catch (error) {
    logger.error("Error getting NPS metrics:", error);
    return {
      totalTickets: 0,
      withRating: 0,
      waitRating: 0,
      withoutRating: 0,
      percRating: 0,
      npsPromotersPerc: 0,
      npsPassivePerc: 0,
      npsDetractorsPerc: 0,
      npsScore: 0
    };
  }
};