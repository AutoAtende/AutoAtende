import { Op, fn, col, literal } from "sequelize";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";

interface Request {
  startDate: string;
  endDate: string;
  companyId: number;
  userId?: number | number[] | null;
}

const DashTicketsQueue = async ({
  startDate,
  endDate,
  companyId,
  userId
}: Request): Promise<any[]> => {
  const whereCondition: any = {
    companyId,
    createdAt: {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    }
  };

  if (userId) {
    whereCondition.userId = Array.isArray(userId) ? { [Op.in]: userId } : userId;
  }

  const tickets = await Ticket.findAll({
    where: whereCondition,
    include: [
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name"]
      }
    ],
    attributes: [
      [col('queue.name') as any, 'queue_name'],
      [fn('count', col('Ticket.id')), 'ticket_count']
    ],
    group: ['queue.id'],
    order: [[literal('ticket_count'), 'DESC']]
  });

  const totalTickets = tickets.reduce((sum, ticket) => sum + (ticket.get('ticket_count') as any as number), 0);

  return tickets.map(ticket => ({
    queue_name: ticket.get('queue_name') || 'Not Assigned',
    ticket_count: ticket.get('ticket_count') as number,
    percentage: (((ticket.get('ticket_count') as any as number) / totalTickets) * 100).toFixed(2)
  }));
};

export default DashTicketsQueue;