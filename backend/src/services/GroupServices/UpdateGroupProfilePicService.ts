// UpdateGroupProfilePicService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";
import fs from "fs";
import path from "path";

interface Request {
  companyId: number;
  groupId: string;
  profilePicPath: string;
}

const UpdateGroupProfilePicService = async ({
  companyId,
  groupId,
  profilePicPath
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

    // Verificar se o arquivo existe
    if (!fs.existsSync(profilePicPath)) {
      throw new AppError("Arquivo de imagem não encontrado");
    }

    // Ler o arquivo de imagem
    const fileBuffer = fs.readFileSync(profilePicPath);
    
    // Atualizar a foto de perfil do grupo
    await wbot.updateProfilePicture(group.jid, fileBuffer);
    
    logger.info(`Foto de perfil atualizada para o grupo ${group.jid}`);

    // Armazenar o caminho relativo da imagem (para acessar via URL)
    const relativePath = profilePicPath.split("public")[1].replace(/\\/g, "/");
    
    // Atualizar o grupo no banco de dados
    await group.update({
      profilePic: relativePath,
      profilePicOriginal: relativePath
    });

    // Enviar mensagem confirmando a atualização
    wbot.sendMessage(group.jid, {
      text: `*Mensagem automática:*\nFoto do grupo atualizada.`
    });

    return group;
  } catch (error) {
    logger.error(`Erro ao atualizar foto de perfil do grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao atualizar a foto de perfil do grupo.");
  }
};

export default UpdateGroupProfilePicService;