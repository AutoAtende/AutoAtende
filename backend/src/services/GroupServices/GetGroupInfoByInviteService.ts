// GetGroupInfoByInviteService.ts
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  code: string;
}

interface GroupInfo {
  id: string;
  subject: string;
  creator?: string;
  creation?: number;
  desc?: string;
  descOwner?: string;
  participants: {
    id: string;
    admin?: string;
  }[];
  size?: number;
}

const GetGroupInfoByInviteService = async ({
  companyId,
  code
}: Request): Promise<GroupInfo> => {
  try {
    const whatsapp = await GetWhatsAppConnected(companyId, null);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Remover prefixo https://chat.whatsapp.com/ se existir
    const cleanCode = code.replace("https://chat.whatsapp.com/", "");
    
    // Obter informações do grupo pelo código de convite
    const groupInfo = await wbot.groupGetInviteInfo(cleanCode);
    
    if (!groupInfo) {
      throw new AppError("Não foi possível obter informações do grupo. Verifique o código de convite.");
    }
    
    logger.info(`Obteve informações do grupo pelo código ${cleanCode}`);

    return groupInfo;
  } catch (error) {
    logger.error(`Erro ao obter informações do grupo com o código ${code}: ${error}`);
    throw new AppError("Erro ao obter informações do grupo. Verifique o código de convite.");
  }
};

export default GetGroupInfoByInviteService;