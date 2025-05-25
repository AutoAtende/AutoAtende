import {
  delay,
  WAMessage,
  AnyMediaMessageContent
} from "bail-lite";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import fs from "fs";
import path from "path";
import {SendPresenceStatus} from "../../helpers/SendPresenceStatus";
import { ParamsApi } from "./SendWhatsAppMessage";
import { Session } from "libs/wbot";

interface Request {
  ticket: Ticket;
  url: string;
  caption: string;
  msdelay?: number;
  params?: ParamsApi
}

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
const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
const SendWhatsAppMessageLink = async ({
  ticket,
  url,
  caption,
  msdelay,
  params
}: Request): Promise<WAMessage> => {
  
  const wbot = await GetTicketWbot(ticket, params) as Session

  const number = `${ticket.contact.number}@${
    ticket.isGroup ? "g.us" : "s.whatsapp.net"
  }`;
  try {
    await SendPresenceStatus(wbot, number, msdelay);
      const sentMessage = await wbot.sendMessage(`${number}`, {
      document: url
        ? { url }
        : fs.readFileSync(
            `${publicFolder}/company${ticket.companyId}/${caption}-${makeid(
              5
            )}.pdf`
          ),
      fileName: caption,
      mimetype: "application/pdf"
    });
    await SendPresenceStatus(wbot, number, msdelay);
    return sentMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};
export default SendWhatsAppMessageLink;
