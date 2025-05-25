import { proto } from "bail-lite";
import Ticket from "../../../../models/Ticket";
import { Session } from "../../../../libs/wbot";
import Whatsapp from "../../../../models/Whatsapp";
import Message from "../../../../models/Message";
import { Op } from "sequelize";
import moment from "moment";
import { debounce } from "../../../../helpers/Debounce";
import formatBody from "../../../../helpers/Mustache";
import path from "path";
import { getMessageOptions } from "../../SendWhatsAppMedia";

export const greetingMessage = async (
    wbot: Session,
    ticket: Ticket,
    msg: proto.IWebMessageInfo,
    whatsapp?: Whatsapp,
    isGroup?: boolean,
    greetingMessageControl?: any[]
  ) => {
    if (
      !whatsapp?.queues?.length &&
      !ticket.userId &&
      !isGroup &&
      !msg.key.fromMe
    ) {
      if (process.env.CHATBOT_RESTRICT_NUMBER?.length >= 8) {
        if (ticket.contact.number != process.env.CHATBOT_RESTRICT_NUMBER) {
          return;
        }
      }
  
      if (greetingMessageControl.length > 5000) greetingMessageControl = [];
  
      var lastMessage = greetingMessageControl.find(
        o => o.ticketId === ticket.id || o.dest === ticket.contact.number
      );
  
      if (
        lastMessage &&
        lastMessage.time + 1000 * 60 * 5 >= new Date().getTime()
      ) {
        return;
      }
  
      // Verifica se já foi enviada uma mensagem recentemente.
      const firstMessage = await Message.findOne({
        where: {
          ticketId: ticket.id,
          fromMe: true,
          createdAt: {
            [Op.gte]: moment().subtract(5, "minutes").toDate()
          }
        }
      });
  
      if (firstMessage) {
        return;
      }
  
      const debouncedSentMessage = debounce(
        async () => {
          if (!whatsapp.greetingMediaAttachment)
            await wbot.sendMessage(
              `${ticket.contact.number}@${
                ticket.isGroup ? "g.us" : "s.whatsapp.net"
              }`,
              {
                text: formatBody(whatsapp.greetingMessage, ticket)
              }
            );
          else {
            const filePath = path.resolve(
              "public",
              "company" + ticket.companyId,
              whatsapp.greetingMediaAttachment
            );
            const optionsMsg = await getMessageOptions(
              whatsapp.greetingMediaAttachment,
              filePath,
              whatsapp.greetingMessage,
              ticket.companyId,
            );
            await wbot.sendMessage(
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              { ...optionsMsg }
            );
          }
        },
        1000,
        ticket.id
      );
      debouncedSentMessage();
      return;
    }
  };