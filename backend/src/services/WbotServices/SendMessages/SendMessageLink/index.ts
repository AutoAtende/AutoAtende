import { makeid } from "../../../../helpers/makeid";
import Contact from "../../../../models/Contact";
import Ticket from "../../../../models/Ticket";
import { verifyMessage } from "../../MessageListener/Verifiers/VerifyMessage";
import { Session } from "../../../../libs/wbot";
import fs from "fs";
import formatBody from "../../../../helpers/Mustache";

export const sendMessageLink = async (
    wbot: Session,
    contact: Contact,
    ticket: Ticket,
    url: string,
    caption: string
  ) => {
    let sentMessage;
    try {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          document: url
            ? { url }
            : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
          fileName: caption,
          caption: caption,
          mimetype: "application/pdf"
        }
      );
    } catch (error) {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: formatBody("Não consegui enviar o PDF, tente novamente!", ticket)
        }
      );
    }
    verifyMessage(sentMessage, ticket, contact);
  };