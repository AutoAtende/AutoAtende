// JoinGroupByInviteService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  code: string;
}

const JoinGroupByInviteService = async ({
  companyId,
  code
}: Request): Promise<Groups> => {
  try {
    const whatsapp = await GetWhatsAppConnected(companyId, null);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Remover prefixo https://chat.whatsapp.com/ se existir
    const cleanCode = code.replace("https://chat.whatsapp.com/", "");
    
    // Entrar no grupo usando o código de convite
    const groupId = await wbot.groupAcceptInvite(cleanCode);
    
    if (!groupId) {
      throw new AppError("Erro ao entrar no grupo. Verifique o código de convite.");
    }
    
    logger.info(`Entrou no grupo ${groupId} usando o código ${cleanCode}`);

    // Obter metadados do grupo
    const groupMetadata = await wbot.groupMetadata(groupId);

    // Extrair administradores
    const adminParticipants = groupMetadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    
    // Criar link de convite para o grupo
    const inviteCode = await wbot.groupInviteCode(groupId);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

    // Verificar se o grupo já existe no banco de dados
    let group = await Groups.findOne({
      where: {
        jid: groupId,
        companyId
      }
    });

    // Se o grupo não existir, cria um novo registro
    if (!group) {
      group = await Groups.create({
        jid: groupId,
        subject: groupMetadata.subject,
        description: groupMetadata.desc,
        participantsJson: groupMetadata.participants,
        adminParticipants,
        inviteLink,
        companyId
      });
    } else {
      // Atualiza os metadados do grupo existente
      await group.update({
        subject: groupMetadata.subject,
        description: groupMetadata.desc,
        participantsJson: groupMetadata.participants,
        adminParticipants,
        inviteLink
      });
    }

    return group;
  } catch (error) {
    logger.error(`Erro ao entrar no grupo com o código ${code}: ${error}`);
    throw new AppError("Erro ao entrar no grupo. Verifique o código de convite e suas permissões.");
  }
};

export default JoinGroupByInviteService;