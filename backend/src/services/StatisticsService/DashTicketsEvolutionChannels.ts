import { Op, col, fn, literal, cast } from "sequelize";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  startDate: string;
  endDate: string;
  companyId: string | number;
  userId?: string | number;
  userProfile: string;
}

const DashTicketsEvolutionChannels = async ({
  startDate,
  endDate,
  companyId,
  userId,
  userProfile
}: Request): Promise<any[]> => {
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
    include: [
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"]
      }
    ],
    attributes: [
      [fn('date', col('Ticket.createdAt')), 'date'],
      [cast(col('whatsapp.name'), 'VARCHAR'), 'channel'],
      [fn('count', col('Ticket.id')), 'count']
    ],
    group: [fn('date', col('Ticket.createdAt')), col('whatsapp.name')],
    order: [[fn('date', col('Ticket.createdAt')), 'ASC']]
  });

  return tickets.map(ticket => ({
    dt_ref: ticket.get('date'),
    dt_referencia: new Date(ticket.get('date') as string).toLocaleDateString(),
    label: ticket.get('channel'),
    qtd: ticket.get('count'),
    percentual: 0 // Percentual precisa ser calculado posteriormente
  }));
};

export default DashTicketsEvolutionChannels;