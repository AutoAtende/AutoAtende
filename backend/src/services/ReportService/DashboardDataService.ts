import { FindOptions } from "sequelize/types";
import { Sequelize, Op, QueryTypes } from "sequelize";
import moment from "moment";
import sequelize from "../../database";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Queue from "../../models/Queue";
import TicketTraking from "../../models/TicketTraking";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface DashboardRequest {
  companyId: number | string;
  userId?: string;
  dateStart: string;
  dateEnd: string;
  status?: string;
  profile?: string;
  days?: number;
}

interface DashboardQueryResult {
  counters: {
    avgSupportTime: number;
    avgWaitTime: number;
    supportHappening: number;
    supportPending: number;
    supportFinished: number;
    leads: number;
    tickets: number;
    waitRating: number;
    withoutRating: number;
    withRating: number;
    percRating: number;
    npsPromotersPerc: number;
    npsPassivePerc: number;
    npsDetractorsPerc: number;
    npsScore: number;
    contactsCount: number;
    messagesCount: number;
  };
  attendants: Array<{
    id: number;
    name: string;
    online: boolean;
    email: string;
    avgWaitTime: number;
    avgSupportTime: number;
    tickets: number;
    rating: number;
    countRating: number;
  }>;
}

interface DashboardResponse {
  dashboardData: {
    counters: {
      avgSupportTime: string;
      avgWaitTime: string;
      supportHappening: number;
      supportPending: number;
      supportFinished: number;
      leads: number;
      tickets: number;
      waitRating: number;
      withoutRating: number;
      withRating: number;
      percRating: number;
      npsPromotersPerc: number;
      npsPassivePerc: number;
      npsDetractorsPerc: number;
      npsScore: number;
      contactsCount: number;
      messagesCount: number;
    };
    attendants: Array<{
      id: number;
      name: string;
      online: boolean;
      email: string;
      avgWaitTime: string;
      avgSupportTime: string;
      tickets: number;
      rating: number;
      countRating: number;
    }>;
  };
  ticketsAttendance: {
    data: any[];
  };
  ticketsDay: {
    count: number;
    data: any[];
  };
  ticketsQueue: {
    data: any[];
  };
}

const formatTimeFromMinutes = (minutes: number): string => {
  if (!minutes || isNaN(minutes)) return '00:00:00';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  const seconds = Math.round((minutes % 1) * 60);
  
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const DashboardDataService = async ({
  companyId,
  userId,
  dateStart,
  dateEnd,
  status,
  profile,
  days,
}: DashboardRequest): Promise<DashboardResponse> => {
  try {
    const dashboardQuery = `
      WITH traking AS (
        SELECT 
          c.name as "companyName",
          u.name as "userName",
          u.email as "email",
          u.online as "userOnline",
          w.name as "whatsappName",
          ct.name as "contactName",
          ct.number as "contactNumber",
          (t.status = 'closed') as "finished",
          (tt."userId" is null AND tt."finishedAt" is null AND t.status = 'pending') as "pending",
          COALESCE(
            ((date_part('day', age(tt."finishedAt", tt."startedAt")) * 24 * 60) +
             (date_part('hour', age(tt."finishedAt", tt."startedAt")) * 60) +
             date_part('minutes', age(tt."finishedAt", tt."startedAt"))),
            0
          ) as "supportTime",
          COALESCE(
            ((date_part('day', age(tt."startedAt", tt."queuedAt")) * 24 * 60) +
             (date_part('hour', age(tt."startedAt", tt."queuedAt")) * 60) +
             date_part('minutes', age(tt."startedAt", tt."queuedAt"))),
            0
          ) as "waitTime",
          t.status,
          tt.*,
          ct.id as "contactId"
        FROM "TicketTraking" tt
        LEFT JOIN "Companies" c ON c.id = tt."companyId"
        LEFT JOIN "Users" u ON u.id = tt."userId"
        LEFT JOIN "Whatsapps" w ON w.id = tt."whatsappId"
        LEFT JOIN "Tickets" t ON t.id = tt."ticketId"
        LEFT JOIN "Contacts" ct ON ct.id = t."contactId"
        --filterPeriod
      ),
      counters AS (
        SELECT 
          (SELECT avg("supportTime") FROM traking WHERE "supportTime" > 0) as "avgSupportTime",
          (SELECT avg("waitTime") FROM traking WHERE "waitTime" > 0) as "avgWaitTime",
          (SELECT count(DISTINCT id)
           FROM "Tickets" t
           WHERE status = 'open'
           AND t."companyId" = ?) as "supportHappening",
          (SELECT count(DISTINCT id)
           FROM "Tickets" t
           WHERE status = 'pending'
           AND t."companyId" = ?) as "supportPending",
          (SELECT count(id) FROM traking WHERE finished) as "supportFinished",
          (SELECT count(leads.id)
           FROM (
             SELECT ct1.id, count(tt1.id) total
             FROM traking tt1
             LEFT JOIN "Tickets" t1 ON t1.id = tt1."ticketId"
             LEFT JOIN "Contacts" ct1 ON ct1.id = t1."contactId"
             GROUP BY ct1.id
             HAVING count(tt1.id) = 1
           ) leads) as "leads",
          (SELECT count(id) FROM traking WHERE status = 'closed') as "tickets",
          (SELECT count(DISTINCT ct.id)
           FROM "Contacts" ct
           WHERE ct."companyId" = ?) as "contactsCount",
          (SELECT count(m.id)
           FROM "Messages" m
           INNER JOIN "Tickets" t ON t.id = m."ticketId"
           WHERE t."companyId" = ?) as "messagesCount",
          (SELECT count(id)
           FROM traking
           WHERE status = 'closed'
           AND rated = false) as "waitRating",
          (SELECT count(tt.id)
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE status = 'closed'
           AND (rated = false AND rate = 0)) as "withoutRating",
          (SELECT count(id)
           FROM traking
           WHERE rated = true) as "withRating",
          (((SELECT count(id) FROM traking WHERE rated = true) * 100.0) /
           NULLIF((SELECT count(id) FROM traking), 0)) as "percRating",
          (SELECT (100.0 * count(tt.*)) / NULLIF((SELECT count(*) total
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE rated = true), 0)
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE tt.rated = true
           AND ur.rate > 3) as "npsPromotersPerc",
          (SELECT (100.0 * count(tt.*)) / NULLIF((SELECT count(*) total
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE rated = true), 0)
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE tt.rated = true
           AND ur.rate = 3) as "npsPassivePerc",
          (SELECT (100.0 * count(tt.*)) / NULLIF((SELECT count(*) total
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE rated = true), 0)
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE tt.rated = true
           AND ur.rate < 3
           AND ur.rate != 0) as "npsDetractorsPerc",
          (SELECT 
            sum(CASE WHEN ur.rate > 3 THEN 100.0 ELSE 0 END) -
            sum(CASE WHEN ur.rate < 3 AND ur.rate != 0 THEN 100.0 ELSE 0 END)
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE tt.rated = true) / NULLIF((SELECT count(*)
           FROM traking tt
           INNER JOIN "UserRatings" ur ON ur."ticketId" = tt."ticketId"
           WHERE rated = true), 0) as "npsScore"
      ),
      attendants AS (
        SELECT 
          u1.id,
          u1.name,
          u1.online,
          u1.email,
          avg(t."waitTime") as "avgWaitTime",
          avg(t."supportTime") as "avgSupportTime",
          count(t.id) as "tickets",
          round(coalesce(avg(ur.rate), 0), 2) as "rating",
          coalesce(count(ur.id), 0) as "countRating"
        FROM "Users" u1
        LEFT JOIN traking t ON t."userId" = u1.id
        LEFT JOIN "UserRatings" ur ON ur."userId" = t."userId" AND ur."ticketId" = t."ticketId"
        WHERE u1."companyId" = ?
        GROUP BY u1.id, u1.name, u1.online, u1.email
        ORDER BY u1.name
      )
      SELECT 
        (SELECT row_to_json(c.*) FROM counters c) as counters,
        (SELECT coalesce(json_agg(a.*), '[]') FROM attendants a) as attendants
    `;

    let where = 'WHERE tt."companyId" = ?';
    const dashboardReplacements = [companyId];

    if (dateStart && dateEnd) {
      where += ' AND tt."createdAt" BETWEEN ? AND ?';
      dashboardReplacements.push(
        `${dateStart} 00:00:00`,
        `${dateEnd} 23:59:59`
      );
    }

    if (days) {
      where += ' AND tt."createdAt" >= NOW() - INTERVAL \'? days\'';
      dashboardReplacements.push(days);
    }

    dashboardReplacements.push(companyId, companyId, companyId, companyId, companyId);

    const finalDashboardQuery = dashboardQuery.replace('--filterPeriod', where);

    // Configurar opções para tickets por dia
    const ticketsDayOptions: FindOptions = {
      where: {
        companyId,
        createdAt: {
          [Op.between]: [
            moment(dateStart).startOf('day').toDate(),
            moment(dateEnd).endOf('day').toDate()
          ] as any // Type assertion necessária para compatibilidade
        } as any // Type assertion para o objeto completo
      },
      attributes: dateStart && dateStart.trim() === dateEnd.trim()
        ? [
            [Sequelize.literal('EXTRACT(HOUR FROM "createdAt")'), 'horario'],
            [Sequelize.literal('COUNT(*)'), 'total']
          ]
        : [
            [Sequelize.literal('TO_CHAR(DATE("createdAt"), \'dd/mm/YYYY\')'), 'data'],
            [Sequelize.fn('COUNT', '*'), 'total']
          ],
      group: dateStart && dateStart.trim() === dateEnd.trim() ? 'horario' : 'data',
      order: [Sequelize.literal(dateStart && dateStart.trim() === dateEnd.trim() 
        ? '"horario" ASC' 
        : '"data" ASC')]
    };

    // Configurar filtro para fila de tickets
    const linkedModels = [{
      model: User,
      as: "user",
      attributes: ["id", "name", "profile"]
    }, {
      model: Queue,
      as: "queue"
    }];

    let queueFilter: any = {};

    if (status) {
      const openTickets = await Ticket.findAll({
        where: {
          status: "open"
        },
        group: ["companyId", "contactId", "queueId", "whatsappId"],
        attributes: ["companyId", "contactId", "queueId", "whatsappId", [Sequelize.fn("max", Sequelize.col("id")), "id"]]
      });

      const ticketIds = openTickets.map(t => t.get('id'));
      queueFilter = {
        ...queueFilter,
        id: {
          [Op.in]: ticketIds
        }
      };
    }

    if (profile === "user") {
      queueFilter = {
        ...queueFilter,
        userId
      };
    }

    if (dateStart && dateEnd) {
      queueFilter = {
        ...queueFilter,
        createdAt: {
          [Op.between]: [
            moment(dateStart).startOf('day').toDate(),
            moment(dateEnd).endOf('day').toDate()
          ] as any // Type assertion necessária para compatibilidade
        } as any // Type assertion para o objeto completo
      };
    }

    const [dashboardData, ticketsDayResult, queueTickets] = await Promise.all([
      sequelize.query<DashboardQueryResult>(finalDashboardQuery, {
        replacements: dashboardReplacements,
        type: QueryTypes.SELECT,
        plain: true,
        logging: (sql) => logger.debug("Executando query do dashboard", { sql })
      }),
      TicketTraking.findAll(ticketsDayOptions),
      Ticket.findAll({
        where: {
          ...queueFilter,
          companyId
        },
        include: linkedModels,
        order: [["updatedAt", "DESC"]]
      })
    ]);

    if (!dashboardData) {
      throw new AppError("Não foi possível recuperar os dados do dashboard", 404);
    }

    // Processamento dos dados de tickets por dia
    let ticketsDayTotal = 0;
    const processedTicketsDay = ticketsDayResult.map((ticket: any) => {
      ticketsDayTotal += Number(ticket.dataValues.total);
      return {
        horario: ticket.dataValues.horario,
        data: ticket.dataValues.data,
        total: ticket.dataValues.total
      };
    });

    // Processamento dos dados de atendimento
    const users = await User.findAll({
      attributes: ['id', 'name'],
      where: { companyId }
    });

    const ticketCounts = await TicketTraking.findAll({
      attributes: [
        'userId',
        [Sequelize.fn('COUNT', Sequelize.col('userId')), 'quantidade']
      ],
      where: {
        companyId,
        createdAt: {
          [Op.between]: [
            moment(dateStart).startOf('day').toDate(),
            moment(dateEnd).endOf('day').toDate()
          ] as any // Type assertion necessária para compatibilidade
        } as any, // Type assertion para o objeto completo
        ticketId: { [Op.ne]: null }
      },
      group: ['userId']
    });

    const processedTicketsAttendance = users.map(user => {
      const ticketInfo = ticketCounts.find((tc: any) => tc.getDataValue('userId') === user.id);
      return {
        name: user.name,
        quantity: ticketInfo?.getDataValue('quantidade') || 0
      };
    });

    // Formatação dos dados finais
    const formattedDashboardData = {
      counters: {
        ...dashboardData.counters,
        avgSupportTime: formatTimeFromMinutes(dashboardData.counters.avgSupportTime || 0),
        avgWaitTime: formatTimeFromMinutes(dashboardData.counters.avgWaitTime || 0),
        supportHappening: Number(dashboardData.counters.supportHappening) || 0,
        supportPending: Number(dashboardData.counters.supportPending) || 0,
        supportFinished: Number(dashboardData.counters.supportFinished) || 0,
        leads: Number(dashboardData.counters.leads) || 0,
        tickets: Number(dashboardData.counters.tickets) || 0,
        contactsCount: Number(dashboardData.counters.contactsCount) || 0,
        messagesCount: Number(dashboardData.counters.messagesCount) || 0,
        waitRating: Number(dashboardData.counters.waitRating) || 0,
        withoutRating: Number(dashboardData.counters.withoutRating) || 0,
        withRating: Number(dashboardData.counters.withRating) || 0,
        percRating: Number(dashboardData.counters.percRating) || 0,
        npsPromotersPerc: Number(dashboardData.counters.npsPromotersPerc) || 0,
        npsPassivePerc: Number(dashboardData.counters.npsPassivePerc) || 0,
        npsDetractorsPerc: Number(dashboardData.counters.npsDetractorsPerc) || 0,
        npsScore: Number(dashboardData.counters.npsScore) || 0
      },
      attendants: (dashboardData.attendants || []).map(att => ({
        ...att,
        avgSupportTime: formatTimeFromMinutes(att.avgSupportTime || 0),
        avgWaitTime: formatTimeFromMinutes(att.avgWaitTime || 0),
        tickets: Number(att.tickets) || 0,
        rating: Number(att.rating) || 0,
        countRating: Number(att.countRating) || 0
      }))
    };

    return {
      dashboardData: formattedDashboardData,
      ticketsAttendance: {
        data: processedTicketsAttendance
      },
      ticketsDay: {
        count: ticketsDayTotal,
        data: processedTicketsDay
      },
      ticketsQueue: {
        data: queueTickets
      }
    };
  } catch (error) {
    logger.error("Erro ao processar dados do dashboard", {
      error,
      params: { companyId, dateStart, dateEnd, status, profile }
    });
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      "Erro ao buscar dados do dashboard. Por favor, tente novamente.",
      500
    );
  }
};

export default DashboardDataService;