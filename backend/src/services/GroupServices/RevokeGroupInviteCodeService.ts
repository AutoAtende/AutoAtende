// RevokeGroupInviteCodeService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
}

const RevokeGroupInviteCodeService = async ({
  companyId,
  groupId
}: Request): Promise<string> => {
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

    // Revogar o código de convite atual e gerar um novo
    const code = await wbot.groupRevokeInvite(group.jid);
    
    // Construir e salvar o novo link de convite
    const inviteLink = `https://chat.whatsapp.com/${code}`;
    await group.update({ inviteLink });
    
    logger.info(`Código de convite revogado para o grupo ${group.jid}. Novo código: ${code}`);

    return inviteLink;
  } catch (error) {
    logger.error(`Erro ao revogar código de convite do grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao revogar o código de convite do grupo.");
  }
};

export default RevokeGroupInviteCodeService;