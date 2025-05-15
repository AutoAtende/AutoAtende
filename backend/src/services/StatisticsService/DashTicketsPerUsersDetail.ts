import { Op, fn, col, literal, QueryTypes } from "sequelize";
import sequelize from "../../database";
import { logger } from "../../utils/logger";

interface Request {
  startDate: string;
  endDate: string;
  companyId: number;
  userId?: number | number[] | null;
}

interface StatisticsResult {
  email: string;
  name: string;
  open_tickets: string;
  pending_tickets: string;
  resolved_tickets: string;
  total_tickets: string;
  average_response_time: string;
}

const DashTicketsPerUsersDetail = async ({
  startDate,
  endDate,
  companyId,
  userId
}: Request): Promise<StatisticsResult[]> => {
  const whereConditions = [];
  whereConditions.push(`"Ticket"."companyId" = :companyId`);
  whereConditions.push(`"Ticket"."createdAt" BETWEEN :startDate AND :endDate`);

  const replacements: any = {
    companyId: Number(companyId),
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  };

  if (userId) {
    if (Array.isArray(userId)) {
      whereConditions.push(`"Ticket"."userId" IN (:userIds)`);
      replacements.userIds = userId.map(id => Number(id));
    } else {
      whereConditions.push(`"Ticket"."userId" = :userId`);
      replacements.userId = Number(userId);
    }
  }

  const query = `
    SELECT 
      "user"."email" as email,
      "user"."name" as name,
      COUNT(CASE WHEN "Ticket"."status" = 'open' THEN 1 END) as open_tickets,
      COUNT(CASE WHEN "Ticket"."status" = 'pending' THEN 1 END) as pending_tickets,
      COUNT(CASE WHEN "Ticket"."status" = 'closed' THEN 1 END) as resolved_tickets,
      COUNT("Ticket"."id") as total_tickets,
      ROUND(AVG(EXTRACT(EPOCH FROM ("Ticket"."updatedAt" - "Ticket"."createdAt")) / 60)) as average_response_time
    FROM "Tickets" as "Ticket"
    LEFT JOIN "Users" as "user" ON "Ticket"."userId" = "user"."id"
    WHERE ${whereConditions.join(" AND ")}
    GROUP BY "user"."id", "user"."email", "user"."name"
    ORDER BY total_tickets DESC
  `;

  try {
    const results = await sequelize.query<StatisticsResult>(query, {
      replacements,
      type: QueryTypes.SELECT,
      raw: true
    });

    return results;
  } catch (error) {
    logger.error("Error executing statistics query:", error);
    throw error;
  }
};

export default DashTicketsPerUsersDetail;