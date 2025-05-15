import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Queue from "../../models/Queue";

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
  
  // Verificar se é um contato de grupo
  const contactTicket = await Ticket.findOne({
    where: { contactId, companyId }
  });
  
  const isGroup = contactTicket?.isGroup;
  
  // Para grupos, sempre retornar um único ticket se já existir
  if (isGroup) {
    const whereGroup = whatsappId ? 
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
      where: whereGroup,
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
  }
  
  // Para contatos normais, verificar se existe ticket aberto
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