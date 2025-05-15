// ListReportService.ts
import { QueryTypes } from "sequelize";
import sequelize from "../../database";
import moment from "moment";

export interface DashboardData {
  tickets: any[];
  totalTickets: any;
}

export interface Params {
  contactId?: string;
  whatsappId: string[];
  dateFrom: string;
  dateTo: string;
  status: string[];
  queueIds: number[];
  users: number[];
  userId: string;
  onlyRated: string;
}

export default async function ListReportService(
  companyId: string | number,
  params: Params,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardData> {
  try {
    console.log("Starting ListReportService...");
    const offset = (page - 1) * pageSize;
    const onlyRated = params.onlyRated === "true";

    // Formatação correta das datas
    const dateFrom = params.dateFrom
      ? moment(params.dateFrom).startOf("day").format("YYYY-MM-DD HH:mm:ss")
      : null;
    const dateTo = params.dateTo
      ? moment(params.dateTo).endOf("day").format("YYYY-MM-DD HH:mm:ss")
      : null;

    console.log("Formatted dateFrom:", dateFrom);
    console.log("Formatted dateTo:", dateTo);

    let baseQuery = `
    SELECT 
      t.id,
      t.uuid,
      w.name as whatsappName,
      c.name as contactName,
      u.name as userName,
      q.name as queueName,
      t.status,
      t."createdAt" as rawCreatedAt,
      tt."finishedAt" as rawFinishedAt,
      tt."ratingAt" as rawRatingAt,
      COALESCE(ur.rate, 0) as NPS
    FROM 
      "Tickets" t
      LEFT JOIN (
        SELECT DISTINCT ON ("ticketId") *
        FROM "TicketTraking"
        WHERE "companyId" = :companyId
        ORDER BY "ticketId", "id" DESC
      ) tt ON t.id = tt."ticketId"
      ${onlyRated ? "INNER" : "LEFT"} JOIN "UserRatings" ur ON t.id = ur."ticketId"
      LEFT JOIN "Contacts" c ON t."contactId" = c.id 
      LEFT JOIN "Whatsapps" w ON t."whatsappId" = w.id 
      LEFT JOIN "Users" u ON t."userId" = u.id 
      LEFT JOIN "Queues" q ON t."queueId" = q.id 
    `;

    let where = `WHERE t."companyId" = :companyId`;
    const queryParams: any = { companyId };

    if (dateFrom) {
      where += ` AND t."createdAt" >= :dateFrom`;
      queryParams.dateFrom = dateFrom;
    }

    if (dateTo) {
      where += ` AND t."createdAt" <= :dateTo`;
      queryParams.dateTo = dateTo;
    }

    if (Array.isArray(params.whatsappId) && params.whatsappId.length > 0) {
      where += ` AND t."whatsappId" IN (:whatsappIds)`;
      queryParams.whatsappIds = params.whatsappId;
    }

    if (Array.isArray(params.users) && params.users.length > 0) {
      where += ` AND t."userId" IN (:userIds)`;
      queryParams.userIds = params.users;
    }

    if (Array.isArray(params.queueIds) && params.queueIds.length > 0) {
      where += ` AND COALESCE(t."queueId", 0) IN (:queueIds)`;
      queryParams.queueIds = params.queueIds;
    }

    if (Array.isArray(params.status) && params.status.length > 0) {
      where += ` AND t."status" IN (:statusIds)`;
      queryParams.statusIds = params.status;
    }

    if (params.contactId) {
      where += ` AND t."contactId" = :contactId`;
      queryParams.contactId = params.contactId;
    }

    console.log("Generated WHERE clause:", where);
    console.log("Query parameters:", queryParams);

    const totalQuery = `
      SELECT COUNT(DISTINCT t.id) as total 
      FROM "Tickets" t
      LEFT JOIN "UserRatings" ur ON t.id = ur."ticketId"
      ${where}
    `;

    console.log("Executing totalQuery...");
    const [totalResult] = await sequelize.query(totalQuery, {
      type: QueryTypes.SELECT,
      replacements: queryParams,
      raw: true,
    });

    console.log("Total result:", totalResult);

    const finalQuery = `
      ${baseQuery}
      ${where}
      ORDER BY t."createdAt" DESC
      LIMIT :limit OFFSET :offset
    `;

    console.log("Executing finalQuery...");
    const tickets = await sequelize.query(finalQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        ...queryParams,
        limit: pageSize,
        offset,
      },
      raw: true,
    });

    console.log("Tickets fetched:", tickets.length);

    const formattedTickets = tickets.map((ticket: any) => {
      const ratingAt = ticket.rawRatingAt ? moment(ticket.rawRatingAt) : null;
      const createdAt = moment(ticket.rawcreatedat, "DD/MM/YYYY HH:mm:ss").toDate();
      const closedAt = ticket.rawfinishedat
        ? moment(ticket.rawfinishedat, "DD/MM/YYYY HH:mm:ss").toDate()
        : null;

      // Cálculo do tempo de atendimento, se closedAt estiver disponível
      let supportTime = null;
      if (createdAt && closedAt) {
        const minutes = moment(closedAt).diff(moment(createdAt), "minutes");

        // Formatação do tempo de atendimento
        if (minutes < 60) {
          // Se for menos de 60 minutos, mostra apenas os minutos
          supportTime = `${minutes} m`;
        } else {
          // Se for 60 minutos ou mais, mostra as horas e minutos
          supportTime = `${Math.floor(minutes / 60)} hrs e ${minutes % 60} m`;
        }
      }

      const statusTranslation: any = {
        open: "Aberto",
        closed: "Fechado",
        pending: "Pendente",
        group: "Grupo",
        nps: "NPS",
      };

      return {
        ...ticket,
        createdAt: createdAt,
        closedAt: closedAt ? closedAt : null,
        supportTime,
        status: statusTranslation[ticket.status] || ticket.status,
      };
    });

    console.log("Formatted tickets:", formattedTickets.length);

    return {
      tickets: formattedTickets,
      totalTickets: totalResult,
    };
  } catch (err) {
    console.error("Error in ListReportService:", err);
    throw new Error("Error fetching tickets report");
  }
}
