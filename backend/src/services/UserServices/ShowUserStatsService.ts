// services/UserServices/ShowUserStatsService.ts
import { Op } from "sequelize";
import moment from "moment";
import User from "../../models/User";
import Ticket from "../../models/Ticket";

interface UserStats {
  openTickets: number;
  closedToday: number;
  avgResponseTime: string;
  rating: number;
}

const ShowUserStatsService = async (userId: number): Promise<UserStats> => {
  const today = moment().startOf('day').toDate();
  const tomorrow = moment().endOf('day').toDate();

  const openTickets = await Ticket.count({
    where: {
      userId,
      status: {
        [Op.in]: ['open', 'pending']
      }
    }
  });

  const closedToday = await Ticket.count({
    where: {
      userId,
      status: 'closed',
      updatedAt: {
        [Op.gte]: today,
        [Op.lte]: tomorrow
      }
    }
  });

  const tickets = await Ticket.findAll({
    where: {
      userId,
      status: 'closed'
    },
    attributes: ['createdAt', 'updatedAt']
  });

  let totalResponseTime = 0;
  let totalEvaluation = 0;
  let evaluationCount = 0;

  tickets.forEach(ticket => {
    const createdAt = moment(ticket.createdAt);
    const updatedAt = moment(ticket.updatedAt);
    totalResponseTime += updatedAt.diff(createdAt, 'minutes');
    
  });

  const avgResponseTime = tickets.length > 0 ? Math.round(totalResponseTime / tickets.length) : 0;
  const rating = evaluationCount > 0 ? (totalEvaluation / evaluationCount) : 0;

  return {
    openTickets,
    closedToday,
    avgResponseTime: `${avgResponseTime}min`,
    rating: Number(rating.toFixed(1))
  };
};

export default ShowUserStatsService;