// UpdateGroupService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface GroupData {
  subject?: string;
  description?: string;
  settings?: GroupSetting[];
}

type GroupSetting = "announcement" | "locked" | "not_announcement" | "unlocked";

interface Request {
  companyId: number;
  groupId: string;
  groupData: GroupData;
}

const UpdateGroupService = async ({
  companyId,
  groupId,
  groupData
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

    // Atualiza o título do grupo, se fornecido
    if (groupData.subject) {
      await wbot.groupUpdateSubject(group.jid, groupData.subject);
      group.subject = groupData.subject;
    }

    // Atualiza a descrição do grupo, se fornecida
    if (groupData.description) {
      await wbot.groupUpdateDescription(group.jid, groupData.description);
      group.description = groupData.description;
    }

    // Atualiza as configurações do grupo, se fornecidas
    if (groupData.settings && groupData.settings.length > 0) {
      for (const setting of groupData.settings) {
        await wbot.groupSettingUpdate(group.jid, setting);
      }
      group.settings = groupData.settings;
    }

    // Sincroniza os metadados do grupo
    const groupMetadata = await wbot.groupMetadata(group.jid);
    
    // Extrair administradores
    const adminParticipants = groupMetadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    
    await group.update({
      subject: groupMetadata.subject,
      description: groupData.description || group.description,
      participantsJson: groupMetadata.participants,
      adminParticipants,
      settings: groupData.settings || group.settings
    });

    return group;
  } catch (error) {
    logger.error(`Erro ao atualizar grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao atualizar o grupo. Verifique suas permissões.");
  }
};

export default UpdateGroupService;