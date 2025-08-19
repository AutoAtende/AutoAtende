import { getWbot, Session } from "../libs/wbot";
import Ticket from "../models/Ticket";
import AppError from "../errors/AppError";
import { getIO } from "../libs/optimizedSocket";
import { ParamsApi } from "../services/WbotServices/SendWhatsAppMessage";
import GetWhatsAppConnected from "./GetWhatsAppConnected";


const GetTicketWbot = async (
  ticket: Ticket,
  params?: ParamsApi
): Promise<Session> => {
  const io = getIO();

  const defaultWhatsapp = await GetWhatsAppConnected(
    ticket.companyId,
    ticket.whatsappId
  );

  if (!defaultWhatsapp) {
    throw new AppError("ERR_CONNECTION_NOT_CONNECTED");
  }

  const wbot = await getWbot(ticket.whatsappId, ticket.companyId);
  
  if (!wbot) {
    throw new AppError("ERR_WBOT_NOT_FOUND");
  }

  io.emit(`company-${ticket?.companyId}-ticket-update`, {
    action: "update",
    ticket
  });

  return wbot;
};

export default GetTicketWbot;