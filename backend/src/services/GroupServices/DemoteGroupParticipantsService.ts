// DemoteGroupParticipantsService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
  participants: string[];
}

const DemoteGroupParticipantsService = async ({
  companyId,
  groupId,
  participants
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

    // Formata os números dos participantes
    const formattedParticipants = participants.map(participant => {
      // Verifica se já inclui @s.whatsapp.net
      if (!participant.includes('@')) {
        return `${participant}@s.whatsapp.net`;
      }
      return participant;
    });

    // Rebaixa os administradores para participantes comuns
    await wbot.groupParticipantsUpdate(
      group.jid,
      formattedParticipants,
      "demote"
    );
    
    logger.info(`Participantes rebaixados no grupo ${group.jid}: ${formattedParticipants.join(", ")}`);

    // Atualiza os metadados do grupo
    const groupMetadata = await wbot.groupMetadata(group.jid);
    
    // Extrair administradores atualizados
    const adminParticipants = groupMetadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    
    await group.update({
      participants: JSON.stringify(groupMetadata.participants),
      participantsJson: groupMetadata.participants,
      adminParticipants
    });

    return group;
  } catch (error) {
    logger.error(`Erro ao rebaixar participantes no grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao rebaixar administradores para participantes comuns.");
  }
};

export default DemoteGroupParticipantsService;