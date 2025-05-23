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
      throw new AppError("Sem permissão para alterar foto do grupo. Você precisa ser administrador do grupo.");
    }

    // Verificar se o arquivo existe
    if (!fs.existsSync(profilePicPath)) {
      throw new AppError("Arquivo de imagem não encontrado");
    }

    // Verificar se o arquivo é uma imagem válida
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(profilePicPath).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new AppError("Formato de arquivo não suportado. Use JPG, PNG, GIF ou WEBP.");
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    const stats = fs.statSync(profilePicPath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 5) {
      throw new AppError("Arquivo muito grande. O tamanho máximo é 5MB.");
    }

    // Ler o arquivo de imagem
    const fileBuffer = fs.readFileSync(profilePicPath);
    
    logger.info(`Atualizando foto de perfil do grupo ${group.jid}`);
    
    // Atualizar a foto de perfil do grupo
    await wbot.updateProfilePicture(group.jid, fileBuffer);
    
    logger.info(`Foto de perfil atualizada com sucesso para o grupo ${group.jid}`);

    // Gerar caminho relativo para armazenar no banco
    let relativePath = profilePicPath;
    
    // Se o caminho contém 'public', extrair apenas a parte após 'public'
    if (profilePicPath.includes('public')) {
      const publicIndex = profilePicPath.indexOf('public');
      relativePath = profilePicPath.substring(publicIndex + 6); // +6 para pular 'public'
      
      // Garantir que comece com /
      if (!relativePath.startsWith('/')) {
        relativePath = '/' + relativePath;
      }
    }
    
    // Atualizar o grupo no banco de dados
    await group.update({
      profilePic: relativePath,
      profilePicOriginal: relativePath,
      lastSync: new Date()
    });

    // Enviar mensagem confirmando a atualização (opcional)
    try {
      await wbot.sendMessage(group.jid, {
        text: `*Mensagem automática:*\nFoto do grupo atualizada com sucesso.`
      });
    } catch (msgError) {
      // Log do erro mas não falha o processo principal
      logger.warn(`Erro ao enviar mensagem de confirmação: ${msgError.message}`);
    }

    // Recarregar o grupo para retornar dados atualizados
    await group.reload();

    return group;
  } catch (error) {
    logger.error(`Erro ao atualizar foto de perfil do grupo ${groupId}: ${error}`);
    
    if (error.message.includes('forbidden') || error.message.includes('not-admin')) {
      throw new AppError("Sem permissão para alterar foto do grupo. Verifique se você é administrador do grupo.");
    }
    
    if (error.message.includes('not-found')) {
      throw new AppError("Grupo não encontrado no WhatsApp.");
    }
    
    if (error.message.includes('invalid')) {
      throw new AppError("Arquivo de imagem inválido ou corrompido.");
    }
    
    throw new AppError(`Erro ao atualizar foto de perfil: ${error.message || "Erro desconhecido"}`);
  }
};

export default UpdateGroupProfilePicService;