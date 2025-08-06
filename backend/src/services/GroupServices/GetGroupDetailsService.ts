import { GroupMetadata, GroupParticipant } from "baileys";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";

interface GetGroupDetailsResponse {
  id: string;
  name: string;
  number: string;
  profilePicUrl: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface GetGroupDetailsRequest {
  contactId: number;
  companyId: number;
}

const GetGroupDetailsService = async ({
  contactId,
  companyId
}: GetGroupDetailsRequest): Promise<GetGroupDetailsResponse[]> => {
  // Buscar o contato do grupo incluindo o whatsapp
  const contact = await Contact.findOne({
    where: {
      id: contactId,
      companyId,
      isGroup: true
    },
    include: [
      {
        model: Whatsapp,
        as: "whatsapp"
      }
    ]
  });

  if (!contact) {
    throw new AppError("Grupo não encontrado", 404);
  }

  if (!contact.isGroup) {
    throw new AppError("Este contato não é um grupo", 400);
  }

  // Obter o wbot - usar o whatsapp do contato ou o padrão da empresa
  let wbot;
  try {
    if (contact.whatsappId) {
      wbot = getWbot(contact.whatsappId);
    } else {
      // Fallback para o WhatsApp padrão da empresa
      const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
      wbot = getWbot(defaultWhatsapp.id);
    }
  } catch (error) {
    console.error("Erro ao obter wbot:", error);
    throw new AppError("WhatsApp não encontrado ou desconectado", 500);
  }

  // Verificar se o remoteJid existe
  if (!contact.remoteJid) {
    throw new AppError("RemoteJid do grupo não encontrado", 400);
  }

  try {
    console.log(`Buscando metadados do grupo: ${contact.remoteJid}`);
    
    // Buscar metadados do grupo
    const groupMetadata: GroupMetadata = await wbot.groupMetadata(contact.remoteJid);
    
    if (!groupMetadata) {
      console.log("GroupMetadata não encontrado");
      return [];
    }

    if (!groupMetadata.participants || groupMetadata.participants.length === 0) {
      console.log("Nenhum participante encontrado no grupo");
      return [];
    }

    console.log(`Encontrados ${groupMetadata.participants.length} participantes`);

    // Processar cada participante
    const participantsPromises = groupMetadata.participants.map(async (participant: GroupParticipant) => {
      let participantName = participant.id;
      let profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
      
      try {
        // Buscar foto de perfil do participante (comentado para debug)
        // profilePicUrl = await wbot.profilePictureUrl(participant.id, "image");
      } catch (error) {
        // Usar imagem padrão se não conseguir obter a foto
        console.log(`Erro ao buscar foto do participante ${participant.id}:`, error.message);
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
      }

      // Extrair número do participante
      const number = participant.id.replace(/\D/g, "");

      try {
        // Verificar se o participante já existe como contato na empresa
        const existingContact = await Contact.findOne({
          where: {
            number,
            companyId
          }
        });

        // Usar nome do contato existente ou número como nome
        if (existingContact && existingContact.name && existingContact.name !== number) {
          participantName = existingContact.name;
        } else {
          participantName = number;
        }
      } catch (error) {
        console.log(`Erro ao buscar contato existente para ${number}:`, error.message);
        participantName = number;
      }

      return {
        id: participant.id,
        name: participantName,
        number,
        profilePicUrl,
        isAdmin: participant.admin === "admin",
        isSuperAdmin: participant.admin === "superadmin"
      };
    });

    const participants = await Promise.all(participantsPromises);

    // Ordenar participantes: super admins primeiro, depois admins, depois membros normais
    participants.sort((a, b) => {
      if (a.isSuperAdmin && !b.isSuperAdmin) return -1;
      if (!a.isSuperAdmin && b.isSuperAdmin) return 1;
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return a.name.localeCompare(b.name);
    });

    console.log(`Retornando ${participants.length} participantes processados`);
    return participants;

  } catch (error) {
    console.error("Erro ao buscar participantes do grupo:", error);
    
    // Verificar se o erro é relacionado ao grupo não existir mais
    if (error.message?.includes("not_found") || error.message?.includes("item-not-found")) {
      throw new AppError("Grupo não encontrado no WhatsApp", 404);
    }
    
    // Verificar se o erro é de conexão
    if (error.message?.includes("Connection Closed") || error.message?.includes("not_connected")) {
      throw new AppError("WhatsApp desconectado", 503);
    }
    
    throw new AppError(`Erro ao buscar participantes do grupo: ${error.message}`, 500);
  }
};

export default GetGroupDetailsService;