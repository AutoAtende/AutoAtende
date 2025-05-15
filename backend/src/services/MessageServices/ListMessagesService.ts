import { FindOptions } from "sequelize/types";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import Queue from "../../models/Queue";
import OldMessage from "../../models/OldMessage";
import TicketTraking from "../../models/TicketTraking"; // Adicionar importação

interface Request {
  ticketId: string;
  companyId: number;
  pageNumber?: string;
  queues?: number[];
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
  trackingRecords?: TicketTraking[]; // Novo campo
}

const ListMessagesService = async ({
  pageNumber = "1",
  ticketId,
  companyId,
  queues = []
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId, companyId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  // await setMessagesAsRead(ticket);
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const options: FindOptions = {
    where: {
      ticketId,
      companyId
    }
  };

  if (queues.length > 0) {
    options.where["queueId"] = {
      [Op.or]: {
        [Op.in]: queues,
        [Op.eq]: null
      }
    };
  }

  // Buscar os registros de TicketTraking para este ticket
  const trackingRecords = await TicketTraking.findAll({
    where: { 
      ticketId,
      [Op.or]: [
        { startedAt: { [Op.ne]: null } },
        { finishedAt: { [Op.ne]: null } }
      ]
    },
    order: [["createdAt", "ASC"]]
  });

  const { count, rows: messages } = await Message.findAndCountAll({
    ...options,
    limit,
    include: [
      "contact",
      {
        model: Message, as: "quotedMsg",
        include: ["contact"],
        where: {
          companyId: ticket.companyId
        },
        required: false,
      },
      {
        model: OldMessage, as: "oldMessages",
        where: {
          ticketId: ticket.id,
        },
        required: false,
      },
      {
        model: Queue,
        as: "queue"
      }
    ],
    offset,
    order: [["createdAt", "DESC"]],
    attributes: {
      include: ['reactions']
    }
  });

  const hasMore = count > offset + messages.length;

  return {
    messages: messages.reverse(),
    ticket,
    count,
    hasMore,
    trackingRecords // Incluir os registros de rastreamento
  };
};

export default ListMessagesService;