import { WAMessage } from "bail-lite";
import WALegacySocket from "bail-lite";

import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { Session } from "../../libs/wbot";

interface ReactionRequest {
  messageId: string;
  ticket: Ticket;
  reactionType: string; // Exemplo: 'like', 'heart', etc.
}

const SendWhatsAppReaction = async ({
  messageId,
  ticket,
  reactionType
}: ReactionRequest): Promise<WAMessage> => {
  const wbot = await GetTicketWbot(ticket) as Session

  const number = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

  try {
    const messageToReact = await Message.findOne({
      where: {
        id: messageId
      }
    });

    if (!messageToReact) {
      throw new AppError("Message not found");
    }

    if (!reactionType) {
      throw new AppError("ReactionType not found");
    }

    const msgFound = JSON.parse(messageToReact.dataJson);

    console.log(reactionType);

    const msg = await wbot.sendMessage(number, {
      react: {
        text: reactionType, // O tipo de reação
        key: msgFound.key // A chave da mensagem original a qual a reação se refere
      }

    });


    return msg;
  } catch (err) {
    
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_REACTION");
  }
};

export default SendWhatsAppReaction;
