// DemoteGroupParticipantsService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import Contact from "../../models/Contact";
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

  // Validação de participantes
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    throw new AppError("Lista de participantes inválida ou vazia");
  }

  // Filtrar participantes válidos (não nulos/vazios)
  const validParticipants = participants.filter(p => p && p.trim() !== "");
  
  if (validParticipants.length === 0) {
    throw new AppError("Nenhum participante válido para rebaixar");
  }

  try {
    const whatsapp = await GetWhatsAppConnected(companyId, group.whatsappId);
    
    if (!whatsapp) {
      throw new AppError("Nenhuma conexão WhatsApp disponível");
    }
    
    const wbot = await getWbot(whatsapp.id);

    // Verificar se o bot tem permissão de admin no grupo
    const groupMetadata = await wbot.groupMetadata(group.jid);
    const botJid = wbot.user?.id;
    const botNumber = whatsapp.number?.replace(/\D/g, '');
    
    const botParticipant = groupMetadata.participants.find(p => {
      return p.id === botJid || p.id.split('@')[0] === botNumber;
    });
    
    if (!botParticipant || (botParticipant.admin !== 'admin' && botParticipant.admin !== 'superadmin')) {
      throw new AppError("Sem permissão para rebaixar participantes. Você precisa ser administrador do grupo.");
    }

    // Formatar os números dos participantes
    const formattedParticipants = validParticipants.map(participant => {
      // Se já está no formato correto, mantém
      if (participant.includes('@s.whatsapp.net')) {
        return participant;
      }
      // Se é só o número, adiciona o sufixo
      return `${participant.replace(/\D/g, '')}@s.whatsapp.net`;
    });

    // Verificar se os participantes existem no grupo e são administradores
    const currentAdmins = groupMetadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    
    const participantsToDemote = formattedParticipants.filter(p => 
      currentAdmins.includes(p)
    );

    if (participantsToDemote.length === 0) {
      throw new AppError("Nenhum dos participantes especificados é administrador do grupo");
    }

    // Verificar se não está tentando rebaixar o criador do grupo (superadmin)
    const superAdmins = groupMetadata.participants
      .filter(p => p.admin === 'superadmin')
      .map(p => p.id);
    
    const tryingToDemoteSuperAdmin = participantsToDemote.some(p => 
      superAdmins.includes(p)
    );

    if (tryingToDemoteSuperAdmin) {
      throw new AppError("Não é possível rebaixar o criador do grupo");
    }

    logger.info(`Rebaixando participantes no grupo ${group.jid}: ${participantsToDemote.join(", ")}`);

    // Rebaixar os administradores para participantes comuns
    await wbot.groupParticipantsUpdate(
      group.jid,
      participantsToDemote,
      "demote"
    );
    
    logger.info(`Participantes rebaixados com sucesso no grupo ${group.jid}`);

    // Aguardar um pouco para que as mudanças sejam refletidas
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Atualizar os metadados do grupo
    const updatedGroupMetadata = await wbot.groupMetadata(group.jid);
    
    // Enriquecer participantes com dados de contatos
    const enrichedParticipants = await Promise.all(
      updatedGroupMetadata.participants.map(async (p) => {
        const number = p.id.split('@')[0];
        const contact = await Contact.findOne({
          where: { number, companyId },
          attributes: ['id', 'name', 'email']
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
    
    // Extrair administradores atualizados
    const adminParticipants = enrichedParticipants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    
    await group.update({
      participantsJson: enrichedParticipants,
      adminParticipants,
      lastSync: new Date()
    });

    // Recarregar para retornar dados atualizados
    await group.reload();

    return group;
  } catch (error) {
    logger.error(`Erro ao rebaixar participantes no grupo ${groupId}: ${error}`);
    
    if (error.message.includes('forbidden') || error.message.includes('not-admin')) {
      throw new AppError("Sem permissão para rebaixar participantes. Verifique se você é administrador do grupo.");
    }
    
    if (error.message.includes('not-found')) {
      throw new AppError("Grupo não encontrado no WhatsApp ou participantes inválidos.");
    }
    
    throw new AppError(`Erro ao rebaixar participantes: ${error.message || "Erro desconhecido"}`);
  }
};

export default DemoteGroupParticipantsService;