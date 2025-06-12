import { WAMessage } from "baileys";
import { Session } from "libs/wbot";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import { verifyMessage } from "./MessageListener/Verifiers/VerifyMessage";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  vCard?: any;
  sendPresence?: boolean;
  params?: ParamsApi;
}

export type ParamsApi = {
  whatsappId: number;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  vCard,
  sendPresence = false,
  params
}: Request): Promise<WAMessage> => {
  let options = {};
  
  try {
    const wbot = await GetTicketWbot(ticket, params) as Session


    let number = ticket.contact.number;
    if (!number?.includes("@")) {
      number = ticket.isGroup
        ? `${number}@g.us`
        : `${number}@s.whatsapp.net`;
    }

    console.log("[SENDMESSAGE] Enviando msg para:", number);

    // Handle vCard logic first
    if (vCard) {
      try {
        // Ensure vCard has required properties
        if (!vCard.name) {
          throw new AppError("vCard must have a name");
        }

        const contactName = vCard.name?.split(" ")[0] || "";
        const lastName = vCard.name?.split(" ").slice(1).join(" ") || "";
        const vcardNumber = vCard.number?.replace(/\D/g, "") || "";

        const vcardBody = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${contactName};;;
FN:${vCard.name}
TEL;type=CELL;waid=${vcardNumber}:+${vcardNumber}
END:VCARD`;

        const msg = await wbot.sendMessage(number, {
          contacts: {
            displayName: vCard.name,
            contacts: [{ vcard: vcardBody }]
          }
        });

        await ticket.update({
          lastMessage: `Contato: ${vCard.name}`,
          imported: null
        });

        return msg;
      } catch (vcardError) {
        console.error("Error sending vCard:", vcardError);
        throw new AppError("Error sending contact card");
      }
    }

    // Regular message handling
    const formattedBody = body ? formatBody(body, ticket) : "";

    if (quotedMsg) {
      const chatMessage = await Message.findOne({
        where: { id: quotedMsg.id }
      });

      if (chatMessage) {
        try {
          const msgFound = JSON.parse(chatMessage.dataJson);
          options = {
            quoted: {
              key: msgFound?.key || chatMessage.id,
              message: {
                extendedTextMessage: msgFound?.message.extendedTextMessage
              }
            }
          };
        } catch (parseError) {
          console.error("Error parsing quoted message:", parseError);
        }
      }
    }

    if (sendPresence) {
      await SendPresenceStatus(wbot, number);
    }

    const sentMessage = await wbot.sendMessage(
      number,
      { text: formattedBody },
      { ...options }
    );

    wbot.cacheMessage(sentMessage);

    await verifyMessage(sentMessage, ticket, ticket.contact);
    return sentMessage;

  } catch (err) {
    
    console.error("Error in SendWhatsAppMessage:", err);
    throw new AppError(err.message || "ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;