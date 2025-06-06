// CreateGroupService.ts
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import ShowWhatsAppByCompanyIdByDefaultService from "../WhatsappService/ShowWhatsAppByCompanyIdByDefaultService";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import Company from "../../models/Company";

interface CreateGroupData {
  companyId: number;
  title: string;
  participants: string[];
  description?: string;
  settings?: GroupSetting[];
}

type GroupSetting = "announcement" | "locked" | "not_announcement" | "unlocked";

const prepareContactToCreateGroup = (participants: string[]): string[] => {
  return participants.map(participant => {
    // Adiciona @s.whatsapp.net se não existir
    if (!participant.includes('@')) {
      return `${participant}@s.whatsapp.net`;
    }
    return participant;
  });
};

const CreateGroupService = async ({
  companyId,
  title,
  participants,
  description,
  settings = []
}: CreateGroupData): Promise<Groups> => {
  try {
    const defaultWhatsapp = await ShowWhatsAppByCompanyIdByDefaultService(companyId);
    const wbot = await getWbot(defaultWhatsapp.id);
    
    // Formatar números para o formato correto
    const formattedParticipants = prepareContactToCreateGroup(participants);

    // Criar grupo usando a API do WhatsApp
    const groupResult = await wbot.groupCreate(title, formattedParticipants);
    
    logger.info(`Grupo criado: ${groupResult.id} para a empresa ${companyId}`);

    // Obter código de convite
    const inviteCode = await wbot.groupInviteCode(groupResult.id);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    
    // Atualizar descrição se fornecida
    if (description) {
      await wbot.groupUpdateDescription(groupResult.id, description);
    }
    
    // Aplicar configurações do grupo
    for (const setting of settings) {
      await wbot.groupSettingUpdate(groupResult.id, setting);
    }
    
    // Obter metadados do grupo para extrair participantes
    const groupMetadata = await wbot.groupMetadata(groupResult.id);
    
    // Extrair administradores
    const adminParticipants = groupMetadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);

    // Salvar informações do grupo no banco de dados
    const newGroup = await Groups.create({
      jid: groupResult.id,
      subject: title,
      description,
      participantsJson: groupMetadata.participants,
      adminParticipants,
      inviteLink,
      settings,
      companyId
    });

    const company = await Company.findOne({
      where: {
        id: companyId
      }
    });

    // Enviar mensagem de boas-vindas
    await wbot.sendMessage(groupResult.id, { 
      text: `Grupo "${title}" criado pelo ${company.name}.` 
    });

    return newGroup;
  } catch (error) {
    logger.error(`Erro ao criar grupo: ${error}`);
    throw new AppError("Erro ao criar o grupo. Verifique os participantes e tente novamente.");
  }
};

export default CreateGroupService;