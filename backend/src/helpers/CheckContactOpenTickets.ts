import { Op } from "sequelize";
import Ticket from "../models/Ticket";
import User from "../models/User";
import Queue from "../models/Queue";

interface ServiceResponse {
  ticketExists: boolean;
  ticket: Ticket | null;
}

const CheckContactOpenTickets = async (
  contactId: number, 
  companyId: number, 
  whatsappId?: string
): Promise<ServiceResponse> => {
  let ticket;
  const whereCondition = whatsappId ? 
    {
      contactId,
      status: { [Op.or]: ["open", "pending"] },
      whatsappId
    } : 
    {
      contactId,
      companyId,
      status: { [Op.or]: ["open", "pending"] }
    };

  ticket = await Ticket.findOne({
    where: whereCondition,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      },
      {
        model: Queue,
        as: 'queue',
        attributes: ['id', 'name']
      }
    ]
  });

  if (ticket) {
    return {
      ticketExists: true,
      ticket
    };
  }

  return {
    ticketExists: false,
    ticket: null
  };
};

export default CheckContactOpenTickets;