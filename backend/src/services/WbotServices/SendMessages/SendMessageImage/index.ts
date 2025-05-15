import Contact from "../../../../models/Contact";
import Ticket from "../../../../models/Ticket";
import { verifyMessage } from "../../MessageListener/Verifiers/VerifyMessage";
import { Session } from "../../../../libs/wbot";
import fs from "fs";
import formatBody from "../../../../helpers/Mustache";
import { makeid } from "../../../../helpers/makeid";

export const sendMessageImage = async (
    wbot: Session,
    contact: Contact,
    ticket: Ticket,
    url: string,
    caption: string
  ) => {
    let sentMessage = null;
    try {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          image: url
            ? { url }
            : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
          fileName: caption,
          caption: caption,
          mimetype: "image/jpeg"
        }
      );
    } catch (error) {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: formatBody("Não consegui enviar a imagem, tente novamente!", ticket)
        }
      );
    }
    verifyMessage(sentMessage, ticket, contact);
  };