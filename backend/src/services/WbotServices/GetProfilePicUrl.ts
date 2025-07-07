import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import caches from "../../utils/cache";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_PROFILE_PIC = `${process.env.FRONTEND_URL}/nopicture.png`;

interface ProfilePicError extends Error {
  statusCode?: number;
}

const formatWhatsAppNumber = (number: string): string => {
  if (!number.includes("@")) {
    return `${number}@s.whatsapp.net`;
  }

  logger.info({
    message: "Número formatado:",
    number
  });

  return number;
};

const getFromCache = async (number: string): Promise<string | null> => {
  try {
    const cachedUrl = caches.imgCache.get<string>(number);
    if (cachedUrl) return cachedUrl;

    // Garantir que o número seja tratado como string
    const contact = await Contact.findOne({ 
      where: { 
        number: String(number) // Conversão explícita para string
      } 
    });

    if (contact?.profilePicUrl) {
      const cacheExpiration = new Date();
      cacheExpiration.setHours(cacheExpiration.getHours() - 24);

      if (contact.updatedAt >= cacheExpiration) {
        caches.imgCache.set(number, contact.profilePicUrl);
        return contact.profilePicUrl;
      }
    }

    return null;
  } catch (error) {
    logger.error({
      message: "Erro ao verificar cache da foto de perfil",
      number,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    return null;
  }
};

const GetProfilePicUrl = async (
  number: string,
  companyId: number
): Promise<string> => {
  try {
    if (!number || !companyId) {
      throw new Error("Parâmetros number e companyId são obrigatórios");
    }

    // Garantir que number seja uma string
    const cleanNumber = String(number).trim();

    // Ignora grupos
    if (cleanNumber.includes("@g.us")) {
      return DEFAULT_PROFILE_PIC;
    }

    const formattedNumber = formatWhatsAppNumber(cleanNumber);

    const cachedUrl = await getFromCache(formattedNumber);
    if (cachedUrl) {
      logger.debug({
        message: "Foto de perfil recuperada do cache",
        number: formattedNumber
      });
      return cachedUrl;
    }

    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    if (!defaultWhatsapp) {
      throw new Error(`WhatsApp não encontrado para empresa ${companyId}`);
    }

    const wbot = await getWbot(defaultWhatsapp.id, companyId);

    let profilePicUrl: string;

    try {
      profilePicUrl = await wbot.profilePictureUrl(
        formattedNumber,
        "image",
        DEFAULT_TIMEOUT
      );
    } catch (err) {
      const profileError = err as ProfilePicError;

      if (profileError.message === "not-authorized") {
        logger.info({
          message: "[GetProfilePicUrl] Sem autorização para obter foto de perfil",
          number: formattedNumber,
          companyId
        });
        return DEFAULT_PROFILE_PIC;
      }

      throw profileError;
    }

    // Salvar no cache e no banco de dados
    caches.imgCache.set(formattedNumber, profilePicUrl);

    // Atualizar o contato no banco de dados
    await Contact.update(
      { profilePicUrl },
      { 
        where: { 
          number: String(formattedNumber) 
        } 
      }
    );

    logger.info({
      message: "Foto de perfil obtida com sucesso",
      number: formattedNumber,
      companyId
    });

    return profilePicUrl;

  } catch (error) {
    logger.warn({
      message: "[GetProfilePicUrl] Erro ao obter foto de perfil",
      number,
      companyId,
      error: {
        message: (error as Error).message,
        statusCode: (error as ProfilePicError).statusCode,
        stack: (error as Error).stack
      }
    });

    return DEFAULT_PROFILE_PIC;
  }
};

export default GetProfilePicUrl;