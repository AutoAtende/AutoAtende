import {initWASocket} from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import {wbotMessageListener} from "./MessageListener/wbotMessageListener";
import {getIO} from "../../libs/optimizedSocket";
import wbotMonitor from "./wbotMonitor";
import {logger} from "../../utils/logger";


export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  logger.info(`Starting WhatsApp session for connection ${whatsapp.name} (ID: ${whatsapp.id})`);
  
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  
  try {
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });
    
    const wbot = await initWASocket(whatsapp);
    logger.info(`WhatsApp socket initialized for connection ${whatsapp.name}`);
    
    wbotMessageListener(wbot, companyId, whatsapp);
    wbotMonitor(wbot, whatsapp, companyId);
  } catch (err) {
    logger.error(`Error starting WhatsApp session: ${err.message}`);
    logger.error(err.stack);
    
    await whatsapp.update({
      status: "DISCONNECTED",
      qrcode: ""
    });
    
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });
  }
};
