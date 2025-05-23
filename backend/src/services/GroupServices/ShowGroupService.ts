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

interface ParticipantWithContact {
  id: string;
  number: string;
  isAdmin: boolean;
  admin?: string;
  name?: string;
  contact?: Contact;
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
    const whatsapp = await GetWhatsAppConnected(companyId, group.whatsappId);
    
    if (whatsapp) {
      const wbot = await getWbot(whatsapp.id);
      const groupMetadata = await wbot.groupMetadata(group.jid);

      // Enriquece os participantes com dados de contatos do banco
      const participantsWithNames: ParticipantWithContact[] = await Promise.all(
        groupMetadata.participants.map(async (p) => {
          const number = p.id.split('@')[0];
          
          // Buscar contato no banco de dados
          const contact = await Contact.findOne({
            where: { 
              number, 
              companyId 
            },
            attributes: ['id', 'name', 'email', 'profilePicUrl']
          });
          
          return {
            id: p.id,
            number: number,
            isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
            admin: p.admin,
            name: contact?.name || null,
            contact: contact || null
          };
        })
      );

      // Separar administradores
      const adminParticipants = participantsWithNames
        .filter(p => p.isAdmin)
        .map(p => p.id);

      // Verificar role do usuário atual
      const botNumber = whatsapp.number?.replace(/\D/g, '');
      const botJid = wbot.user?.id;
      
      let userRole = "participant";
      
      // Buscar participante do bot
      const botParticipant = participantsWithNames.find(p => {
        return p.id === botJid || p.number === botNumber;
      });
      
      if (botParticipant && botParticipant.isAdmin) {
        userRole = "admin";
      }

      // Atualizar as informações do grupo no banco de dados
      await group.update({
        subject: groupMetadata.subject,
        description: groupMetadata.desc,
        participants: JSON.stringify(groupMetadata.participants),
        participantsJson: participantsWithNames,
        adminParticipants,
        userRole,
        lastSync: new Date(),
        syncStatus: "synced"
      });

      // Recarregar o grupo com os dados atualizados
      await group.reload();
    }

    return group;
  } catch (error) {
    logger.error(`Erro ao obter metadados do grupo ${groupId}: ${error}`);
    // Retorna informações do banco mesmo se falhar a atualização
    return group;
  }
};

export default ShowGroupService;