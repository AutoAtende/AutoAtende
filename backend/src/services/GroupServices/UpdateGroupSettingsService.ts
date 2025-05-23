// UpdateGroupSettingsService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
  setting: "announcement" | "not_announcement" | "locked" | "unlocked";
}

const UpdateGroupSettingsService = async ({
  companyId,
  groupId,
  setting
}: Request): Promise<Groups> => {
  const group = await Groups.findOne({
    where: {
      id: groupId,
      companyId
    }
  });

  if (!group) {
    throw new AppError("Grupo não encontrado");
  }

  try {
    const whatsapp = await GetWhatsAppConnected(companyId, group.whatsappId);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Atualiza a configuração do grupo
    await wbot.groupSettingUpdate(group.jid, setting);
    
    logger.info(`Configuração atualizada para o grupo ${group.jid}: ${setting}`);

    // Atualizar configurações no banco de dados
    let settings = Array.isArray(group.settings) ? [...group.settings] : [];
    
    // Remover configuração anterior do mesmo tipo
    if (setting === "announcement" || setting === "not_announcement") {
      settings = settings.filter(s => s !== "announcement" && s !== "not_announcement");
    } else if (setting === "locked" || setting === "unlocked") {
      settings = settings.filter(s => s !== "locked" && s !== "unlocked");
    }
    
    // Adicionar nova configuração
    settings.push(setting);
    
    await group.update({ settings });

    return group;
  } catch (error) {
    logger.error(`Erro ao atualizar configurações do grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao atualizar as configurações do grupo.");
  }
};

export default UpdateGroupSettingsService;