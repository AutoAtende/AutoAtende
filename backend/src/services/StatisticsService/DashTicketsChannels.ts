import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  startDate: string;
  endDate: string;
  companyId: number;
  userId?: number | number[] | null;
  userProfile?: string;
}

const DashTicketsChannels = async ({
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
    attributes: ["whatsappId"]
  });

  const channelCounts = tickets.reduce((acc, ticket) => {
    const channel = ticket.whatsapp ? ticket.whatsapp.name : "Unknown";
    acc[channel] = (acc[channel] || 0) + 1;
    return acc;
  }, {});

  const totalTickets = tickets.length;

  return Object.entries(channelCounts).map(([label, qtd]) => ({
    label,
    qtd,
    percent: ((qtd as number) / totalTickets * 100).toFixed(2)
  }));
};

export default DashTicketsChannels;