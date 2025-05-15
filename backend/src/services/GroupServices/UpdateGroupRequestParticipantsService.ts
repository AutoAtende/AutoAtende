// UpdateGroupRequestParticipantsService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
  participants: string[];
  action: "approve" | "reject";
}

const UpdateGroupRequestParticipantsService = async ({
  companyId,
  groupId,
  participants,
  action
}: Request): Promise<any> => {
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

    // Formatar os números dos participantes
    const formattedParticipants = participants.map(participant => {
      // Verifica se já inclui @s.whatsapp.net
      if (!participant.includes('@')) {
        return `${participant}@s.whatsapp.net`;
      }
      return participant;
    });

    // Aprovar ou rejeitar solicitações
    const result = await wbot.groupRequestParticipantsUpdate(
      group.jid,
      formattedParticipants,
      action
    );
    
    logger.info(`Solicitações de entrada ${action === 'approve' ? 'aprovadas' : 'rejeitadas'} para o grupo ${group.jid}: ${formattedParticipants.join(", ")}`);

    // Se aprovadas, atualiza os metadados do grupo
    if (action === 'approve') {
      // Aguarda um momento para que os participantes sejam adicionados
      setTimeout(async () => {
        try {
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
        } catch (error) {
          logger.error(`Erro ao atualizar metadados após aprovação: ${error}`);
        }
      }, 2000);
    }

    return result;
  } catch (error) {
    logger.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} solicitações do grupo ${groupId}: ${error}`);
    throw new AppError(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} solicitações do grupo.`);
  }
};

export default UpdateGroupRequestParticipantsService;