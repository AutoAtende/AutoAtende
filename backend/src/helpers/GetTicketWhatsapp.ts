import AppError from "errors/AppError";
import GetWhatsAppConnected from "./GetWhatsAppConnected";
import Whatsapp from "../models/Whatsapp";
import Ticket from "../models/Ticket";
import { getIO } from "../libs/optimizedSocket";
import { ParamsApi } from "../services/WbotServices/SendWhatsAppMessage";

const GetTicketWhatsapp = async (
    ticket: Ticket,
    params?: ParamsApi
  ): Promise<Whatsapp> => {
    let defaultWhatsapp: Whatsapp = null;
    const io = getIO();
  
    defaultWhatsapp = await GetWhatsAppConnected(
      ticket.companyId,
      ticket.whatsappId
    );
  
    if (!defaultWhatsapp) {
      throw new AppError("ERR_CONNECTION_NOT_CONNECTED");
    }
  
    io.emit(`company-${ticket?.companyId}-ticket-update`, {
      action: "update",
      ticket
    });
  
    return defaultWhatsapp;
  };
  
  export default GetTicketWhatsapp;
  