import { getWbot } from "../libs/wbot";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import { logger } from "../utils/logger";

const CheckContactNumber = async (number: string, companyId: number) => {
  try {
    // Formatar o número
    const isGroup =number.includes("@g.us") ? true : false;
    let rawNumber = number;
    let formattedNumber;
    if(!isGroup){
      rawNumber = number.replace(/\D/g, "");
      formattedNumber = `${rawNumber}@s.whatsapp.net`;
    } else {
      formattedNumber = number;
    }

    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    const wbot = await getWbot(defaultWhatsapp.id, companyId);
    
      const [validNumber] = await wbot.onWhatsApp(formattedNumber);
      
      if (validNumber && validNumber.exists) {
        return {
          jid: validNumber.jid,
          exists: true
        };
      }
  } catch (error) {
    logger.error(`Erro ao verificar número: ${error.message}`);
    
    const cleanNumber = number.replace(/\D/g, "");
    return {
      jid: cleanNumber,
      exists: false
    };
  }
};

export default CheckContactNumber;