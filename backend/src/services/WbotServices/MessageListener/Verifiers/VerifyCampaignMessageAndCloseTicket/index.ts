import { proto } from "baileys";
import { getIO } from "../../../../../libs/socket";
import Message from "../../../../../models/Message";
import Ticket from "../../../../../models/Ticket";
import Contact from "../../../../../models/Contact";
import { getBodyMessage } from "../../Get/GetBodyMessage";

export const verifyCampaignMessageAndCloseTicket = async (
    message: proto.IWebMessageInfo,
    companyId: number
  ) => {
    const io = getIO();
    const body = getBodyMessage(message);
    const isCampaign = /\u200c/.test(body);
    if (message.key.fromMe && isCampaign) {
      const messageRecord = await Message.findOne({
        where: { id: message.key.id!, companyId }
      });
  
      if (!messageRecord.ticketId) return null;
  
      const ticket = await Ticket.findByPk(messageRecord.ticketId, {
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name", "number", "email", "profilePicUrl"]
          }
        ]
      });
      await ticket.update({ status: "closed" });
  
      io.emit(`company-${ticket.companyId}-ticket`, {
        action: "delete",
        ticket,
        ticketId: ticket.id
      });
  
      io.to(`company-${companyId}-${ticket.status}`)
        .to(ticket.id.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }
  };