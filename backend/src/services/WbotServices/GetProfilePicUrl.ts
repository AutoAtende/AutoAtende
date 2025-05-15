import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import caches from "../../utils/cache";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

// Constantes de configuração
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_PROFILE_PIC = `${process.env.FRONTEND_URL}/nopicture.png`;

interface ProfilePicError extends Error {
  statusCode?: number;
}

/**
 * Formata o número do WhatsApp para o padrão correto
 */
const formatWhatsAppNumber = (number: string): string => {
  if (!number) return "";
  
  const isGroup = number.endsWith("@g.us") || 
                 number.includes("-") || 
                 number.length >= 18;
  
  if (!number.includes("@")) {
    return isGroup ? `${number}@g.us` : `${number}@s.whatsapp.net`;
  }
  
  return number;
};

/**
 * Verifica e retorna URL da foto do perfil em cache
 */
const getFromCache = async (number: string): Promise<string | null> => {
  try {
    // Verifica cache do NodeCache
    const cachedUrl = caches.imgCache.get<string>(number);
    if (cachedUrl) return cachedUrl;
    
    // Verifica cache do banco de dados
    const contactNumber = number.split("@")[0];
    const contact = await Contact.findOne({
      where: { number: contactNumber }
    });
    
    if (contact?.profilePicUrl) {
      const cacheExpiration = new Date();
      cacheExpiration.setHours(cacheExpiration.getHours() - 24);
      
      if (contact.updatedAt >= cacheExpiration) {
        // Se encontrado no banco, atualiza também o cache em memória
        caches.imgCache.set(number, contact.profilePicUrl);
        return contact.profilePicUrl;
      }
    }
    
    return null;
  } catch (error) {
    logger.error({
      message: "Erro ao verificar cache da foto de perfil",
      number,
      error: error.message
    });
    return null;
  }
};

/**
 * Obtém a URL da foto de perfil do WhatsApp
 */
const GetProfilePicUrl = async (
  number: string,
  companyId: number
): Promise<string> => {
  try {
    // Validação de parâmetros
    if (!number || !companyId) {
      throw new Error("Parâmetros number e companyId são obrigatórios");
    }

    // Formatação do número
    const formattedNumber = formatWhatsAppNumber(number);
    
    // Verificação de cache
    const cachedUrl = await getFromCache(formattedNumber);
    if (cachedUrl) {
      logger.debug({
        message: "Foto de perfil recuperada do cache",
        number: formattedNumber
      });
      return cachedUrl;
    }

    // Obtenção da instância do WhatsApp
    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    if (!defaultWhatsapp) {
      throw new Error(`WhatsApp não encontrado para empresa ${companyId}`);
    }

    const wbot = await getWbot(defaultWhatsapp.id, companyId);
    
    // Obtém a URL da foto de perfil
    const profilePicUrl = await wbot.profilePictureUrl(
      formattedNumber,
      null,
      DEFAULT_TIMEOUT
    );

    // Atualiza o cache
    caches.imgCache.set(formattedNumber, profilePicUrl);
    
    logger.info({
      message: "Foto de perfil obtida com sucesso",
      number: formattedNumber,
      companyId
    });

    return profilePicUrl;

  } catch (error) {
    const typedError = error as ProfilePicError;
    
    // Log estruturado do erro
    logger.warn({
      message: "Erro ao obter foto de perfil",
      number,
      companyId,
      error: {
        message: typedError.message,
        statusCode: typedError.statusCode,
        stack: typedError.stack
      }
    });

    // Casos específicos de erro que não precisam de retry
    if (
      typedError.message.includes("not-authorized") ||
      typedError.message.includes("item-not-found")
    ) {
      caches.imgCache.set(
        formatWhatsAppNumber(number),
        DEFAULT_PROFILE_PIC
      );
    }

    return DEFAULT_PROFILE_PIC;
  }
};

export default GetProfilePicUrl;