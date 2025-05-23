// RemoveGroupProfilePicService.ts
import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";
import path from "path";
import fs from "fs";

interface Request {
  companyId: number;
  groupId: string;
}

export const extractFileNameFromPath = (filePath: string): string | null => {
  const publicIndex = filePath?.indexOf('/public/');
  if (publicIndex !== -1) {
    return filePath?.slice(publicIndex + 8); // Adiciona 8 para compensar o comprimento de '/public/'
  } else {
    return filePath || ''; // Caso '/public/' não seja encontrado
  }
}

export const removeFilePublicFolder = async (filePathWithout443: string) => {
  try {
    if (filePathWithout443) {
      const filePath = path.resolve(
        "public",
        extractFileNameFromPath(filePathWithout443)
      );
      const fileExists = fs.existsSync(filePath);
      if (fileExists) {
        logger.info("Arquivo excluido com sucesso da pasta public.");
        if (filePath) {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (error) {
    console.log('Houve um erro ao tentar excluir o arquivo no servidor', error)
  }
}

const RemoveGroupProfilePicService = async ({
  companyId,
  groupId
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

    // Remover a foto de perfil do grupo
    await wbot.removeProfilePicture(group.jid);
    
    logger.info(`Foto de perfil removida para o grupo ${group.jid}`);

    // Remover o arquivo se existir
    if (group.profilePic) {
      await removeFilePublicFolder(group.profilePic);
    }

    // Remover os caminhos das imagens no banco de dados
    await group.update({
      profilePic: null,
      profilePicOriginal: null
    });

    // Enviar mensagem confirmando a remoção
    wbot.sendMessage(group.jid, {
      text: `*Mensagem automática:*\nFoto do grupo removida.`
    });

    return group;
  } catch (error) {
    logger.error(`Erro ao remover foto de perfil do grupo ${groupId}: ${error}`);
    throw new AppError("Erro ao remover a foto de perfil do grupo.");
  }
};

export default RemoveGroupProfilePicService;