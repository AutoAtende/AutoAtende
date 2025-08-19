// src/services/ContactServices/UpdateProfilePicService.ts
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import { getIO } from "../../libs/optimizedSocket";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import ShowWhatsAppByCompanyIdByStatusService from "../WhatsappService/ShowWhatsAppByCompanyIdByStatusService";

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

interface Request {
  number: string;
  companyId: number;
}

const UpdateProfilePicService = async ({
  number,
  companyId
}: Request): Promise<Contact> => {
  try {
    logger.info(`Atualizando foto de perfil para número: ${number}`);

    // Formato correto do número para WhatsApp
    const formattedNumber = number.includes("@s.whatsapp.net") 
      ? number 
      : `${number.replace(/\D/g, "")}@s.whatsapp.net`;

    // Busca o contato no banco de dados
    const contact = await Contact.findOne({
      where: { 
        number: number.replace(/\D/g, ""),
        companyId 
      }
    });

    if (!contact) {
      throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    // Busca a conexão WhatsApp padrão da empresa
    const whatsapp = await ShowWhatsAppByCompanyIdByStatusService(companyId);
    
    if (!whatsapp) {
      throw new AppError("ERR_NO_WHATSAPP_FOUND", 404);
    }

    // Obtém a instância do WhatsApp
    const wbot = await getWbot(whatsapp.id, companyId);

    // Tenta obter a URL da foto de perfil
    let profilePicUrl: string = '';
    try {
      profilePicUrl = await wbot.profilePictureUrl(formattedNumber, 'image');
    } catch (error) {
      logger.warn(`Erro ao obter foto de perfil para ${formattedNumber}: ${error.message}`);
      // Atribuímos a URL padrão em caso de erro
      profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
    }

    // Se temos uma URL válida que não seja a padrão, baixamos e salvamos
    if (profilePicUrl && !profilePicUrl.includes('nopicture.png')) {
      try {
        // Baixa a imagem
        const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // Gera um nome de arquivo único baseado no número e timestamp
        const timestamp = new Date().getTime();
        const fileName = `${number.replace(/\D/g, "")}_${timestamp}.jpeg`;
        const publicPath = process.env.BACKEND_PUBLIC_PATH;
        const uploadPath = path.resolve(publicPath, `/company${companyId}/profilePics`);
        
        // Garante que o diretório existe
        await mkdirAsync(uploadPath, { recursive: true });
        
        const filePath = path.join(uploadPath, fileName);
        await writeFileAsync(filePath, buffer);

        // Atualiza o caminho da foto no banco de dados
        const serverUrl = process.env.BACKEND_URL || '';
        const savedProfilePicUrl = `${serverUrl}/company${companyId}/profilePics/${fileName}`;
        
        await contact.update({ 
          profilePicUrl: savedProfilePicUrl,
          updatedAt: new Date()
        });
        
        logger.info(`Foto de perfil atualizada com sucesso para ${number}`);
      } catch (downloadError) {
        logger.error(`Erro ao baixar/salvar foto de perfil: ${downloadError.message}`);
        // Em caso de erro, ainda atualizamos com a URL direta
        await contact.update({ 
          profilePicUrl,
          updatedAt: new Date()
        });
      }
    } else {
      // Se não temos uma URL ou se for a padrão, atualizamos apenas a data
      await contact.update({ 
        updatedAt: new Date()
      });
    }

    // Emite evento de atualização
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

    // Recarrega o contato para garantir que retornamos os dados atualizados
    await contact.reload();
    return contact;
  } catch (error) {
    logger.error(`Erro no serviço de atualização de foto: ${error.message}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`Erro ao atualizar foto de perfil: ${error.message}`, 500);
  }
};

export default UpdateProfilePicService;