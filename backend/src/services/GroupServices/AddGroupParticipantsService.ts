// AddGroupParticipantsService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";
import CheckContactNumber from "../../helpers/CheckContactNumber";

interface Request {
  companyId: number;
  groupId: string;
  participants: string[];
}

const AddGroupParticipantsService = async ({
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
    const whatsapp = await GetWhatsAppConnected(companyId, group.whatsappId);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Verifica e formata os números dos participantes
    const formattedParticipants = [];
    for (const number of participants) {
      try {
        // Verifica se o número é válido
        const validNumber = await CheckContactNumber(number, companyId);
        
        if (validNumber.exists) {
          formattedParticipants.push(validNumber.jid);
        }
      } catch (error) {
        logger.warn(`Número inválido: ${number}. Erro: ${error}`);
        // Continua com os outros números
      }
    }

    if (formattedParticipants.length === 0) {
      throw new AppError("Nenhum número válido para adicionar ao grupo");
    }

    // Adiciona os participantes ao grupo
    await wbot.groupParticipantsUpdate(
      group.jid,
      formattedParticipants,
      "add"
    );
    
    logger.info(`Participantes adicionados ao grupo ${group.jid}: ${formattedParticipants.join(", ")}`);

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
    logger.error(`Erro ao adicionar participantes no grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao adicionar participantes ao grupo.");
  }
};

export default AddGroupParticipantsService;