import { Op, fn, col } from "sequelize";
import Ticket from "../../models/Ticket";

interface Request {
  startDate: string;
  endDate: string;
  companyId: number;
  userId?: number | number[] | null;
  userProfile?: string;
}

interface TicketEvolution {
  date: string;
  count: number;
}

const DashTicketsEvolutionByPeriod = async ({
  startDate,
  endDate,
  companyId,
  userId,
  userProfile
}: Request): Promise<TicketEvolution[]> => {
  const whereCondition: any = {
    companyId,
    createdAt: {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    }
  };

  if (userProfile !== "admin" && userId) {
    whereCondition.userId = userId;
  }

  const tickets = await Ticket.findAll({
    where: whereCondition,
    attributes: [
      [fn('date', col('createdAt')), 'date'],
      [fn('count', col('id')), 'count']
    ],
    group: [fn('date', col('createdAt'))],
    order: [[fn('date', col('createdAt')), 'ASC']]
  });

  return tickets.map(ticket => ({
    date: ticket.get('date') as string,
    count: ticket.get('count') as number
  }));
};

export default DashTicketsEvolutionByPeriod;