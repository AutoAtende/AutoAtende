// services/ReportService/ListTicketsWithMessagesService.ts

import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import AppError from "../../errors/AppError";

interface ListTicketsWithMessagesParams {
  startDate: string;
  endDate: string;
  contactNumber?: string;
  companyId: number;
}

interface TicketWithMessages {
  id: number;
  uuid: string;
  status: string;
  createdAt: Date;
  contactId: number;
  contactNumber: string;
  contactName: string;
  messages: Array<{
    id: number;
    body: string;
    createdAt: Date;
    fromMe: boolean;
    mediaUrl: string | null;
    mediaType: string | null;
  }>;
}

export const ListTicketsWithMessagesService = async ({
  startDate,
  endDate,
  contactNumber,
  companyId
}: ListTicketsWithMessagesParams): Promise<TicketWithMessages[]> => {
  if (!startDate || !endDate) {
    throw new AppError("Data inicial e final são obrigatórias");
  }

  try {
    // Converter strings para objetos Date
    const startDateObj = startOfDay(parseISO(startDate));
    const endDateObj = endOfDay(parseISO(endDate));

    // Construir condições da consulta
    const whereCondition: any = {
      companyId
    };

    // Ajuste para Op.between com datas no Sequelize 5
    whereCondition.createdAt = {};
    whereCondition.createdAt[Op.gte] = startDateObj;
    whereCondition.createdAt[Op.lte] = endDateObj;

    // Condições para o contato
    const contactWhere: any = {
      companyId
    };

    if (contactNumber) {
      contactWhere.number = {
        [Op.like]: `%${contactNumber}%`
      };
    }

    // Condições para mensagens
    const messageWhere: any = {};
    messageWhere.createdAt = {};
    messageWhere.createdAt[Op.gte] = startDateObj;
    messageWhere.createdAt[Op.lte] = endDateObj;

    // Buscar os tickets com suas mensagens
    const tickets = await Ticket.findAll({
      where: whereCondition,
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "email", "profilePicUrl"]
        },
        {
          model: Message,
          as: "messages",
          attributes: ["id", "body", "createdAt", "fromMe", "mediaUrl", "mediaType"],
          where: messageWhere,
          required: false
        }
      ],
      order: [
        ["createdAt", "ASC"],
        [{ model: Message, as: "messages" }, "createdAt", "ASC"]
      ]
    });

    // Formatar os dados para retornar
    const formattedTickets: TicketWithMessages[] = [];

    for (const ticket of tickets) {
      // Usar any para contornar as limitações de tipagem do Sequelize 5
      const ticketData: any = ticket.get({ plain: true });
      
      if (ticketData && ticketData.contact) {
        const formattedTicket: TicketWithMessages = {
          id: ticketData.id,
          uuid: ticketData.uuid,
          status: ticketData.status,
          createdAt: ticketData.createdAt,
          contactId: ticketData.contact.id,
          contactNumber: ticketData.contact.number,
          contactName: ticketData.contact.name,
          messages: []
        };

        // Verificar se messages existe e é um array
        if (ticketData.messages && Array.isArray(ticketData.messages)) {
          formattedTicket.messages = ticketData.messages.map(message => ({
            id: message.id,
            body: message.body || "",
            createdAt: message.createdAt,
            fromMe: message.fromMe,
            mediaUrl: message.mediaUrl,
            mediaType: message.mediaType
          }));
        }

        formattedTickets.push(formattedTicket);
      }
    }

    return formattedTickets;
  } catch (error) {
    console.error("Erro na consulta de tickets com mensagens:", error);
    throw new AppError("Erro ao buscar tickets com mensagens", 500);
  }
};

export default ListTicketsWithMessagesService;