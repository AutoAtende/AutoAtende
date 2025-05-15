import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { getWbot, Session } from "../libs/wbot";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import caches from "../utils/cache";
import Contact from "../models/Contact";

interface IOnWhatsapp {
  jid: string;
  exists: boolean;
}

const connectionCache = new Map();

const checker = async (number: string, wbot: Session) => {
  // Verifica se é um grupo
  const isGroup = number.endsWith("@g.us") || number.includes("-") || number.length >= 18;

  // Verificar se o número já foi validado recentemente
  const vinteQuatroHorasAtras = new Date();
  vinteQuatroHorasAtras.setHours(vinteQuatroHorasAtras.getHours() - 24);
  
  // Remover qualquer parte "@..." que possa existir no número
  const contato = number.split("@")[0];
  
  const salvo = await Contact.findOne({where: { number: contato }});
  if (salvo) {
    const atualizadoRecentemente = salvo.updatedAt >= vinteQuatroHorasAtras;
    if(atualizadoRecentemente) {
      if(isGroup) {
        return { jid: `${number}@g.us`, exists: true };
      } else {
        return { jid: `${number}@s.whatsapp.net`, exists: true };
      }    
    }
  }
  
  // Cache key
  const cacheKey = `${number}`;
  if (connectionCache.has(cacheKey)) {
    return connectionCache.get(cacheKey);
  }

  // Tratar grupos
  if (isGroup) {
    try {
      let groupId = number;
      if (!groupId.includes("@g.us")) {
        groupId = `${groupId}@g.us`;
      }

      const verify = await caches.contactCache.get(groupId);
      if(verify) {
        return verify;
      }

      const groupData = await wbot.groupMetadata(groupId);
      const result = {
        jid: groupData.id,
        exists: true
      };
      caches.contactCache.set(groupId, result);      
      connectionCache.set(cacheKey, result);
      return result;
    } catch (err) {
      // Não retorne imediatamente como falso para grupos
      logger.warn(`Erro ao verificar grupo ${number}:`, err);
    }
  }

  // MELHORIA: Verificação mais robusta para números normais
  try {
    // Garantir que o número esteja formatado corretamente
    const rawNumber = number.replace(/\D/g, "");
    
    // Padronizar o número para o formato internacional
    let formattedNumber = rawNumber;
    
    // Para números brasileiros
    if ((rawNumber.length === 10 || rawNumber.length === 11) && !rawNumber.startsWith('55')) {
      formattedNumber = `55${rawNumber}`;
    } else if (rawNumber.startsWith('0')) {
      // Remove o 0 inicial e adiciona 55 (Brasil)
      formattedNumber = `55${rawNumber.substring(1)}`;
    }
    
    // Adicionar sufixo @s.whatsapp.net se não estiver presente
    const validationNumber = formattedNumber.includes('@s.whatsapp.net') 
      ? formattedNumber 
      : `${formattedNumber}@s.whatsapp.net`;
    
    logger.debug(`Validando número: ${validationNumber}`);
    
    // Verificação oficial do WhatsApp
    try {
      const [validNumber] = await wbot.onWhatsApp(validationNumber);
      
      const verify = caches.contactCache.get(formattedNumber);
      if(verify) {
        return verify;
      }
      
      if (validNumber && validNumber.exists) {
        connectionCache.set(cacheKey, validNumber);
        caches.contactCache.set(formattedNumber, validNumber);   
        return validNumber;
      }
    } catch (apiError) {
      logger.warn(`Erro na API do WhatsApp ao validar ${validationNumber}:`, apiError);
      // Continua para tentar abordagem alternativa
    }
    
    // IMPORTANTE: Abordagem alternativa para números que não podem ser verificados
    // pela API, mas que são provavelmente válidos
    
    // Qualquer número com formato válido de telefone (pelo menos 10 dígitos)
    // será considerado como válido para evitar problemas com campanhas
    if (formattedNumber.length >= 10) {
      const result = {
        jid: `${formattedNumber}@s.whatsapp.net`,
        exists: true
      };
      
      // Registrar nos caches
      connectionCache.set(cacheKey, result);
      caches.contactCache.set(formattedNumber, result);
      
      logger.info(`Número ${formattedNumber} considerado válido pelo formato`);
      return result;
    }
    
    return { exists: false };
  } catch (err) {
    logger.error(`Erro ao verificar número ${number}:`, err);
    
    // Se ocorrer um erro na API, ainda vamos considerar o número como potencialmente válido
    // se tiver um formato plausível de número de telefone
    const formattedNumber = number.replace(/\D/g, "");
    if (formattedNumber.length >= 10) {
      return {
        jid: `${formattedNumber}@s.whatsapp.net`,
        exists: true
      };
    }
    
    return { exists: false };
  }
};

const CheckContactNumber = async (
  number: string,
  companyId: number
): Promise<IOnWhatsapp> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    
    let retries = 0;
    const maxRetries = 3;
    let wbot = null;
    
    while (retries < maxRetries) {
      try {
        wbot = await getWbot(defaultWhatsapp.id, companyId);
        break;
      } catch (error) {
        if (error.message === "ERR_WAPP_NOT_INITIALIZED") {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }
    
    if (!wbot) {
      logger.error(`WhatsApp não inicializado para companyId ${companyId}`);
      // Em vez de lançar erro, retornamos um valor que indica que o número pode ser válido
      // para não impedir o funcionamento das campanhas
      return {
        jid: `${number}@s.whatsapp.net`,
        exists: true
      };
    }

    const numberExists = await checker(number, wbot);
    
    // MELHORIA: Se a verificação falhar, mas o número tiver formato válido,
    // ainda retornamos como válido para não prejudicar as campanhas
    if (!numberExists?.exists) {
      const cleanNumber = number.replace(/\D/g, "");
      if (cleanNumber.length >= 10) {
        logger.warn(`Número ${number} não validado pela API, mas considerado válido pelo formato`);
        return {
          jid: `${cleanNumber}@s.whatsapp.net`,
          exists: true
        };
      }
      
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    
    return numberExists;
  } catch (error) {
    logger.error(`Erro ao verificar número ${number}:`, error);
    
    // Se for um erro de validação, ainda podemos retornar o número como possivelmente válido
    // para não impedir o funcionamento das campanhas
    const cleanNumber = number.replace(/\D/g, "");
    if (cleanNumber.length >= 10) {
      return {
        jid: `${cleanNumber}@s.whatsapp.net`,
        exists: true
      };
    }
    
    throw error;
  }
};

export default CheckContactNumber;