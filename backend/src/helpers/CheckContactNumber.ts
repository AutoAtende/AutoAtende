import { getWbot } from "../libs/wbot";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import { logger } from "../utils/logger";

const CheckContactNumber = async (number: string, companyId: number) => {
  try {
    // Formatar o número
    const rawNumber = number.replace(/\D/g, "");
    
    let formattedNumber = rawNumber;
    
    // Adicionar código do Brasil (55) se necessário
    if ((rawNumber.length === 10 || rawNumber.length === 11) && !rawNumber.startsWith('55')) {
      formattedNumber = `55${rawNumber}`;
    } else if (rawNumber.startsWith('0')) {
      formattedNumber = `55${rawNumber.substring(1)}`;
    }
    
    // Obter a conexão WhatsApp padrão
    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    const wbot = await getWbot(defaultWhatsapp.id, companyId);
    
    // Verificar se o número existe
    try {
      // Usar a API oficial do WhatsApp para verificar o número
      const [validNumber] = await wbot.onWhatsApp(`${formattedNumber}@s.whatsapp.net`);
      
      if (validNumber && validNumber.exists) {
        return {
          jid: validNumber.jid,
          exists: true
        };
      }
    } catch (apiError) {
      logger.warn(`Erro ao verificar número: ${apiError.message}`);
    }
    
    // Fallback: se não conseguir verificar, assume que existe para números com pelo menos 10 dígitos
    if (formattedNumber.length >= 10) {
      return {
        jid: `${formattedNumber}@s.whatsapp.net`,
        exists: true
      };
    }
    
    // Se não atender nenhuma condição anterior, retorna que não existe
    return {
      jid: `${formattedNumber}@s.whatsapp.net`,
      exists: false
    };
  } catch (error) {
    logger.error(`Erro ao verificar número: ${error.message}`);
    
    // Em caso de erro, retornar com o número formatado
    const cleanNumber = number.replace(/\D/g, "");
    return {
      jid: `${cleanNumber}@s.whatsapp.net`,
      exists: true // Por padrão, assume que existe em caso de erro
    };
  }
};

export default CheckContactNumber;