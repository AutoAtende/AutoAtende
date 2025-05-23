// UpdateGroupSubjectService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
  subject: string;
}

const UpdateGroupSubjectService = async ({
  companyId,
  groupId,
  subject
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

    // Atualiza o nome do grupo
    await wbot.groupUpdateSubject(group.jid, subject);
    
    logger.info(`Nome atualizado para o grupo ${group.jid}: ${subject}`);

    // Atualizar o título no banco de dados
    await group.update({ subject });

    return group;
  } catch (error) {
    logger.error(`Erro ao atualizar nome do grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao atualizar o nome do grupo.");
  }
};

export default UpdateGroupSubjectService;