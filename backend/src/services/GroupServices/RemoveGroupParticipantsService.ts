// RemoveGroupParticipantsService.ts
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

const RemoveGroupParticipantsService = async ({
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

  // Validação para garantir que não há participantes nulos
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    throw new AppError("Nenhum participante válido para remover do grupo");
  }

  // Verificar cada participante para garantir que não há valores nulos
  const validParticipants = participants.filter(p => p !== null && p !== undefined && p !== "");
  
  if (validParticipants.length === 0) {
    throw new AppError("Nenhum participante válido para remover do grupo");
  }

  try {
    const whatsapp = await GetWhatsAppConnected(companyId, null);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Formata os números dos participantes
    const formattedParticipants = validParticipants.map(participant => {
      // Verificar formato e adicionar sufixo se necessário
      if (!participant.includes('@')) {
        return `${participant}@s.whatsapp.net`;
      }
      return participant;
    });

    logger.info(`Tentando remover participantes do grupo ${group.jid}: ${JSON.stringify(formattedParticipants)}`);

    // Remove os participantes do grupo
    await wbot.groupParticipantsUpdate(
      group.jid,
      formattedParticipants,
      "remove"
    );
    
    logger.info(`Participantes removidos do grupo ${group.jid}: ${formattedParticipants.join(", ")}`);

    // Atualiza os metadados do grupo
    const groupMetadata = await wbot.groupMetadata(group.jid);
    
    // Extrair administradores
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
    logger.error(`Erro ao remover participantes do grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao remover participantes do grupo.");
  }
};

export default RemoveGroupParticipantsService;