import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import {dataMessages, getWbot} from "../../libs/wbot";
import { getIO } from "../../libs/optimizedSocket";
import { handleMessage } from "../WbotServices/MessageListener/wbotMessageListener";
import moment from "moment";
import {Op, QueryTypes, Sequelize} from "sequelize";
import { add } from "date-fns";
import { logger } from "../../utils/logger";

export const closeImportedTickets = async whatsappId => {
  const pendingTickets = await Ticket.findAll({
    where: {
      status: "pending",
      whatsappId: whatsappId,
      imported: {
        [Op.lt]: add(new Date(), { hours: 5 })
      }
    }
  });
  for (const ticket of pendingTickets) {
    await new Promise(a => setTimeout(a, 330));
    await UpdateTicketService({
      ticketData: {
        status: "closed"
      },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });
  }
  let targetWhatsapp = await Whatsapp.findByPk(whatsappId);
  targetWhatsapp.update({
    statusImportMessages: null
  });
  const io = getIO();
  io
    .to(`company-${targetWhatsapp.companyId}-mainchannel`)
    .emit("importMessages-" + targetWhatsapp.companyId, {
    action: "refresh"
  });
};

function compareMessageTimestamps(a, b) {
  return a.messageTimestamp - b.messageTimestamp; // Ordem crescente
}

function removeDuplicateById(a) {
  const map = new Map();
  const uniqueIds = [];
  for (const d of a) {
    const id = d.key.id;
    if (!map.has(id)) {
      map.set(id, true);
      uniqueIds.push(d);
    }
  }
  return uniqueIds.sort(compareMessageTimestamps); // Ordena em ordem crescente
}

const ImportWhatsAppService = async (targetWhatsapp: Whatsapp, _dataMessages: any[]) => {
  //let targetWhatsapp = await Whatsapp.findByPk(whatsappId);

  let messages = dataMessages

  messages = _dataMessages || dataMessages

  const wbot = await getWbot(targetWhatsapp.id);
  try {
    const io = getIO();
    const messageList = removeDuplicateById(messages[targetWhatsapp.id]);

    logger.warn('----------------------------------------------------------')
    logger.warn('[IMPORT MESSAGE] - Realizando a importação de mensagens...')
    logger.warn('----------------------------------------------------------')

    const messageCount = messageList.length;
    let currentIndex = 0;
    
    // Iniciar com status indicando número total de mensagens
    io.to(`company-${targetWhatsapp.companyId}-mainchannel`)
      .emit("importMessages-" + targetWhatsapp.companyId, {
        action: "update",
        status: {
          this: 0,
          all: messageCount,
          status: "Running"
        }
      });
    
    while (currentIndex < messageCount) {
      try {
        const currentMessage = messageList[currentIndex];

        await handleMessage(currentMessage, wbot, targetWhatsapp.companyId, true);
        
        // Emitir atualizações mais frequentes com um limite para não sobrecarregar
        if (currentIndex % 5 === 0 || currentIndex + 1 === messageCount) {
          const timestamp = currentMessage.messageTimestamp ? 
            Math.floor(currentMessage.messageTimestamp.low * 1000) : 
            Date.now();
            
          io.to(`company-${targetWhatsapp.companyId}-mainchannel`)
            .emit("importMessages-" + targetWhatsapp.companyId, {
              action: "update",
              status: {
                this: currentIndex + 1,
                all: messageCount,
                date: moment(timestamp).format("DD/MM/YY HH:mm:ss"),
                status: "Running"
              }
            });
        }
        
        if (currentIndex + 1 === messageCount) {
          messages[targetWhatsapp.id] = [];
          if (targetWhatsapp.closedTicketsPostImported) {
            await closeImportedTickets(targetWhatsapp.id);
          }
          await targetWhatsapp.update({
            statusImportMessages: targetWhatsapp.closedTicketsPostImported ? null : "renderButtonCloseTickets",
            importOldMessages: null,
            importRecentMessages: null
          });
          io
            .to(`company-${targetWhatsapp.companyId}-mainchannel`)
            .emit("importMessages-" + targetWhatsapp.companyId, {
              action: "refresh"
            });
        }
      } catch (error) {
        console.log(error);
        console.log("ERROR_IMPORTING_MESSAGE");
      }
      currentIndex++;
    }
  } catch (error) {
    console.log(error);
    throw new AppError("ERR_NOT_MESSAGE_TO_IMPORT", 403);
  }
  return "whatsapps";
};

export default ImportWhatsAppService;