import { delay, WAMessage } from "baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import fs from "fs";
import {SendPresenceStatus} from "../../helpers/SendPresenceStatus";
import { Session } from "../../libs/wbot";

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const publicFolder = process.env.BACKEND_PUBLIC_FOLDER;

const SendWhatsAppMediaImage = async ({
  ticket,
  url,
  caption,
  msdelay,
  params
}): Promise<WAMessage> => {
  
  const wbot = await GetTicketWbot(ticket, params) as Session

  const number = `${ticket.contact.number}@${
    ticket.isGroup ? "g.us" : "s.whatsapp.net"
  }`;
  try {
    await SendPresenceStatus(wbot, number, msdelay);

    const sentMessage = await wbot.sendMessage(`${number}`, {
      image: url
        ? { url }
        : fs.readFileSync(
            `${publicFolder}/company${ticket.companyId}/${caption}-${makeid(
              5
            )}.png`
          ),
      caption: formatBody(`${caption}`, ticket),
      mimetype: "image/jpeg"
    });

    return sentMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};
export default SendWhatsAppMediaImage;
