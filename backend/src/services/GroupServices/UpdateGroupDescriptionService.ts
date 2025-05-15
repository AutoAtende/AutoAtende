// UpdateGroupDescriptionService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
  description: string;
}

const UpdateGroupDescriptionService = async ({
  companyId,
  groupId,
  description
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
    const whatsapp = await GetWhatsAppConnected(companyId, null);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Atualiza a descrição do grupo
    await wbot.groupUpdateDescription(group.jid, description);
    
    logger.info(`Descrição atualizada para o grupo ${group.jid}`);

    // Atualizar a descrição no banco de dados
    await group.update({ description });

    return group;
  } catch (error) {
    logger.error(`Erro ao atualizar descrição do grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao atualizar a descrição do grupo.");
  }
};

export default UpdateGroupDescriptionService;