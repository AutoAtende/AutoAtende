// ShowGroupService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";
import Contact from "../../models/Contact";

interface Request {
  companyId: number;
  groupId: string;
}

const ShowGroupService = async ({ companyId, groupId }: Request): Promise<Groups> => {
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
    // Obter detalhes atualizados do grupo via WhatsApp API
    const whatsapp = await GetWhatsAppConnected(companyId, null);
    
    if (whatsapp) {
      const wbot = await getWbot(whatsapp.id);
      const groupMetadata = await wbot.groupMetadata(group.jid);

      // Enriquece os participantes com dados de contatos
      const participantsWithNames = await Promise.all(
        groupMetadata.participants.map(async (p) => {
          const number = p.id.split('@')[0];
          const contact = await Contact.findOne({
            where: { number, companyId }
          });
          
          return {
            id: p.id,
            number: number,
            isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
            name: contact?.name || null
          };
        })
      );

      // Separar administradores
      const adminParticipants = participantsWithNames
        .filter(p => p.isAdmin)
        .map(p => p.id);

      // Atualizar as informações do grupo no banco de dados
      await group.update({
        subject: groupMetadata.subject,
        participants: JSON.stringify(groupMetadata.participants),
        participantsJson: participantsWithNames,
        adminParticipants
      });
    }

    return group;
  } catch (error) {
    logger.error(`Erro ao obter metadados do grupo ${groupId}: ${error}`);
    // Retorna informações do banco mesmo se falhar a atualização
    return group;
  }
};

export default ShowGroupService;