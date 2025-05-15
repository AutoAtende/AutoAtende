import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import Ticket from "../../models/Ticket";
import Company from "../../models/Company";
import ShowContactService from "../ContactServices/ShowContactService";
import { getIO } from "../../libs/socket";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import User from "../../models/User";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  queueId?: number;
  whatsappId?: string;
  value?: number;
  sku?: string;
}

interface ServiceResponse {
  ticketExists: boolean;
  ticket: Ticket | null;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  companyId,
  whatsappId,
  value,
  sku,
}: Request): Promise<ServiceResponse> => {
  let whatsapp: Whatsapp = null;

  if (!whatsappId) {
    throw new AppError('ERR_CONNECTION_NOT_PROVIDED')
  }

  const checkTicket = await CheckContactOpenTickets(contactId, companyId, whatsappId);
  
  if (checkTicket.ticketExists) {
    // Se o ticket existe e pertence a outro usuário
    if (checkTicket.ticket.userId !== userId) {
      return {
        ticketExists: true,
        ticket: checkTicket.ticket
      };
    }
  }

  const { isGroup } = await ShowContactService(contactId, companyId);

  const [_ticket, _] = await Ticket.findOrCreate({
    where: {
      contactId,
      companyId,
      whatsappId: +whatsappId
    },
    defaults: {
      contactId,
      companyId,
      whatsappId: +whatsappId,
      status,
      isGroup,
      userId,
      value,
      sku,
    },
  });

  await _ticket.reload()

  if (!_ticket.id) {
    return {
      ticketExists: false,
      ticket: null
    };
  }

  const ticket = await Ticket.findByPk(_ticket.id, 
    { 
      include: [
        "queue",
        "tags",
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'ramal']
        },
        {
          model: Whatsapp,
          as: 'whatsapp',
          attributes: ['id','name']
        },
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "email", "profilePicUrl"],
        },
        { model: Company, as: "company", attributes: ["urlPBX"] }
      ], 
    });

  const contact = await Contact.findByPk(ticket.contact.id)
  await contact.update({ whatsappId })
  await contact.reload()

  await ticket.update(
    { companyId, queueId, userId, whatsappId, status: "open" },
  );
  await ticket.reload()

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  await FindOrCreateATicketTrakingService({
    ticketId: ticket.id,
    companyId: ticket.companyId,
    whatsappId: ticket.whatsappId,
    userId: ticket.userId
  });

  const io = getIO();

  io.to(ticket.id.toString()).emit("ticket", {
    action: "update",
    ticket
  });

  return {
    ticketExists: false,
    ticket: ticket
  };
};

export default CreateTicketService;