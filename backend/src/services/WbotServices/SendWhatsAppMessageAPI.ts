import { delay, WAMessage } from "bail-lite";

import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import { Session } from "../../libs/wbot";
interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  msdelay?: number;
}
const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  msdelay
}: Request): Promise<WAMessage> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket) as Session
  const number = `${ticket.contact.number}@${
    ticket.isGroup ? "g.us" : "s.whatsapp.net"
  }`;
  if (quotedMsg) {
    const chatMessages = await Message.findOne({ where: { id: quotedMsg.id } });
    if (chatMessages) {
      const msgFound = JSON.parse(chatMessages.dataJson);
      options = {
        quoted: {
          key: msgFound.key,
          message: { extendedTextMessage: msgFound.message.extendedTextMessage }
        }
      };
    }
  }
  try {
    await delay(msdelay);
    const sentMessage = await wbot.sendMessage(
      number,
      { text: formatBody(body, ticket) },
      { ...options }
    );
    await ticket.update({ lastMessage: formatBody(body, ticket) });
    return sentMessage;
  } catch (err) {
    
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};
export default SendWhatsAppMessage;
