// GetGroupInviteCodeService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
}

const GetGroupInviteCodeService = async ({
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

    // Verificar se o bot tem permissões para obter o código (deve ser admin)
    const groupMetadata = await wbot.groupMetadata(group.jid);
    const botId = wbot.user.id;
    const isAdmin = groupMetadata.participants.some(
      p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!isAdmin) {
      throw new AppError("O bot não tem permissões de administrador no grupo");
    }

    // Obter o código de convite
    const code = await wbot.groupInviteCode(group.jid);
    
    // Construir e salvar o link de convite
    const inviteLink = `https://chat.whatsapp.com/${code}`;
    await group.update({ inviteLink });
    
    logger.info(`Código de convite obtido para o grupo ${group.jid}: ${code}`);

    return inviteLink;
  } catch (error) {
    logger.error(`Erro ao obter código de convite do grupo ${groupId}: ${error}`);
    throw new AppError(`Erro ao obter o código de convite do grupo: ${error.message}`);
  }
};

export default GetGroupInviteCodeService;