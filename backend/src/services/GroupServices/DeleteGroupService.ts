// DeleteGroupService.ts
import Groups from "../../models/Groups";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";
import { removeFilePublicFolder } from "./RemoveGroupProfilePicService";

interface Request {
  companyId: number;
  groupId: string;
  forceDelete?: boolean; // Adiciona um parâmetro opcional para forçar a exclusão
}

const DeleteGroupService = async ({ companyId, groupId, forceDelete = false }: Request): Promise<void> => {
  const group = await Groups.findOne({
    where: {
      id: groupId,
      companyId
    }
  });

  if (!group) {
    throw new AppError("Grupo não encontrado");
  }

  // Se forceDelete for true, apenas exclui do banco de dados sem tentar sair do grupo
  if (forceDelete) {
    await group.destroy();
    logger.info(`Grupo ${groupId} foi forçadamente removido do banco de dados`);
    return;
  }

  try {
    const whatsapp = await GetWhatsAppConnected(companyId, group.whatsappId);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Sair do grupo no WhatsApp
    await wbot.groupLeave(group.jid);
    logger.info(`Saiu do grupo ${group.jid}`);
    
    // Remover o grupo do banco de dados
    await group.destroy();
    
    return;
  } catch (error) {
    logger.error(`Erro ao deletar grupo ${groupId}: ${error}`);
    
    // Se não conseguir sair do grupo devido a erro not-found ou forbidden, 
    // ainda assim remove do banco de dados
    if (error.message.includes("not-found") || error.message.includes("forbidden")) {
      await group.destroy();
      return;
    }
    
    throw new AppError("Erro ao sair do grupo. Verifique suas permissões.");
  }
};

export default DeleteGroupService;