import AppError from "../../errors/AppError";
import { getIO } from "../../libs/optimizedSocket";
import { notifyUpdate } from "../TicketServices/UpdateTicketService";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import MediaNode from "../../models/MediaNode";
import { logger } from "../../utils/logger";
import { verifyMediaMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMediaMessage";
import { getWbot } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import formatBody from "../../helpers/Mustache";
import { getMessageOptions } from "../WbotServices/SendWhatsAppMedia";
import url from "url";

interface ExecuteMediaNodeParams {
  nodeData: {
    nodeId?: string;
    mediaType: string; // 'image', 'audio', 'video', 'file'
    mediaUrl: string;
    caption?: string;
    allowedFormats?: string[];
    maxFileSize?: number;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  whatsappId?: number;
}

/**

Normaliza URLs de mídia para caminhos locais, tratando URLs completas e caminhos relativos
@param mediaUrl URL ou caminho da mídia
@param companyId ID da empresa
@returns Caminho normalizado para acesso ao arquivo local
*/
const normalizeMediaPath = (mediaUrl: string, companyId: number): { mediaPath: string, originalUrl: string } => {
  // Armazenar a URL original para referência
  const originalUrl = mediaUrl;

  // Verificar se a URL é absoluta (começa com http:// ou https://)
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    try {
      // Extrair o caminho da URL (sem o domínio e protocolo)
      const parsedUrl = new URL(mediaUrl);
      const pathname = parsedUrl.pathname;
      // Extrair o nome do arquivo
      const filename = path.basename(pathname);

      // Verificar se contém /flowBuilder/ ou um padrão de empresa no pathname
      if (pathname.includes('/flowBuilder/')) {
        // Formato padronizado para mídia no FlowBuilder
        mediaUrl = `company${companyId}/flowBuilder/${filename}`;
      } else if (pathname.includes(`/company${companyId}/`)) {
        // Tentar extrair o caminho relativo a partir do padrão /company{id}/
        const companyPattern = `/company${companyId}/`;
        const pathIndex = pathname.indexOf(companyPattern);
        if (pathIndex >= 0) {
          mediaUrl = pathname.substring(pathIndex + 1); // +1 para remover a barra inicial
        } else {
          mediaUrl = `company${companyId}/${filename}`;
        }
      } else {
        // Caminho padrão se não conseguir identificar um padrão específico
        mediaUrl = `company${companyId}/${filename}`;
      }

      logger.info(`URL convertida de ${originalUrl} para ${mediaUrl}`);
    } catch (error) {
      logger.error(`Erro ao processar URL de mídia: ${error.message}`);
      // Usar apenas o nome do arquivo como fallback
      const filename = path.basename(mediaUrl);
      mediaUrl = `company${companyId}/flowBuilder/${filename}`;
    }
  } else {
    // Remover barras iniciais, prefixos 'public/' e prefixos 'company{id}/'
    mediaUrl = mediaUrl
      .replace(/^\//, '') // Remove leading slash
      .replace(/^public\//, ''); // Remove 'public/' prefix
    // Se não começar com company{id}, adicionar esse prefixo
    if (!mediaUrl.startsWith(`company${companyId}/`)) {
      mediaUrl = `company${companyId}/${mediaUrl}`;
    }
  }
  // Retornar o caminho da mídia normalizado e a URL original
  return {
    mediaPath: path.join(process.env.BACKEND_PUBLIC_PATH || 'public', mediaUrl),
    originalUrl
  };
};

const ExecuteMediaNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  whatsappId
  }: ExecuteMediaNodeParams): Promise<void> => {
  try {
  logger.info(`Executando nó de mídia (${nodeData.mediaType}) para ticket ${ticket.id}`);
  if (!nodeData.mediaUrl) {
    throw new AppError("URL da mídia não fornecida", 400, "flow/missing-media-url");
  }
  
  // Usar whatsappId do ticket se não for fornecido
  const whatsappIdToUse = whatsappId || ticket.whatsappId;
  
  // Buscar configuração específica do nó de mídia no banco de dados
  const mediaNode = nodeData.nodeId ? await MediaNode.findOne({
    where: {
      nodeId: nodeData.nodeId,
      companyId
    }
  }) : null;
  
  // Se existir o nó no banco, utilizar suas configurações
  const mediaConfig = mediaNode ? {
    mediaType: mediaNode.mediaType,
    mediaUrl: mediaNode.mediaUrl,
    caption: mediaNode.caption,
    allowedFormats: mediaNode.allowedFormats,
    maxFileSize: mediaNode.maxFileSize
  } : nodeData;
  
  const whatsapp = await Whatsapp.findByPk(whatsappIdToUse);
  
  if (!whatsapp) {
    throw new AppError("WhatsApp não encontrado", 404, "flow/whatsapp-not-found");
  }
  
  // Usar a função de normalização para obter o caminho da mídia
  let { mediaPath, originalUrl } = normalizeMediaPath(mediaConfig.mediaUrl, companyId);
  
  logger.info(`Caminho construído para a mídia: ${mediaPath} (original: ${originalUrl})`);
  
  // Verificar se o arquivo existe no caminho construído
  if (!fs.existsSync(mediaPath)) {
    // Tentar caminhos alternativos
    const possiblePaths = [
      // Caminho padrão com flowBuilder
      path.join(process.env.BACKEND_PUBLIC_PATH || 'public', `company${companyId}/flowBuilder`, path.basename(mediaConfig.mediaUrl)),
      // Caminho com apenas o nome do arquivo
      path.join(process.env.BACKEND_PUBLIC_PATH || 'public', `company${companyId}`, path.basename(mediaConfig.mediaUrl)),
      // Caminho com estrutura de diretórios adicional
      path.join(process.env.BACKEND_PUBLIC_PATH || 'public', `company${companyId}/images`, path.basename(mediaConfig.mediaUrl))
    ];
    
    let foundPath = null;
    for (const testPath of possiblePaths) {
      logger.info(`Tentando caminho alternativo: ${testPath}`);
      if (fs.existsSync(testPath)) {
        foundPath = testPath;
        logger.info(`Arquivo encontrado em: ${foundPath}`);
        break;
      }
    }
    
    if (!foundPath) {
      throw new AppError(`Arquivo de mídia não encontrado: ${mediaPath} (URL original: ${mediaConfig.mediaUrl})`, 
        404, "flow/media-not-found");
    }
    
    // Usar o caminho encontrado
    mediaPath = foundPath;
  }
  
  // Verificar o tamanho do arquivo
  const stats = fs.statSync(mediaPath);
  const fileSizeInBytes = stats.size;
  const maxFileSizeBytes = mediaConfig.maxFileSize || 16 * 1024 * 1024; // 16MB padrão para WhatsApp
  
  if (fileSizeInBytes > maxFileSizeBytes) {
    const fileSizeMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (maxFileSizeBytes / (1024 * 1024)).toFixed(2);
    throw new AppError(`Arquivo muito grande (${fileSizeMB}MB). O limite é ${maxSizeMB}MB.`, 
      400, "flow/file-too-large");
  }
    // Obter extensão do arquivo
    const fileExtension = path.extname(mediaPath).substring(1).toLowerCase();

    // Verificar se o formato é permitido
    if (mediaConfig.allowedFormats && mediaConfig.allowedFormats.length > 0) {
      if (!mediaConfig.allowedFormats.includes(fileExtension)) {
        throw new AppError(`Formato de arquivo não permitido: ${fileExtension}. Formatos permitidos: ${mediaConfig.allowedFormats.join(', ')}`,
          400, "flow/unsupported-format");
      }
    }

    // Substituir variáveis na legenda, se existir
    const caption = mediaConfig.caption
      ? formatBody(mediaConfig.caption, ticket)
      : "";

    // Nome do arquivo para exibição
    const filename = path.basename(mediaPath);

    // Obter instância do bot
    const wbot = await getWbot(whatsappIdToUse);

    // Enviar status de "enviando mídia"
    await SendPresenceStatus(
      wbot,
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
    );

    // Preparar opções de mensagem
    const optionsMsg = await getMessageOptions(
      filename,
      mediaPath,
      caption,
      ticket.companyId
    );

    // Enviar mídia
    const sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      { ...optionsMsg }
    );

    // Verificar e registrar a mensagem no sistema
    await verifyMediaMessage(sentMessage, ticket, contact, wbot);

    const io = getIO();
    notifyUpdate(io, ticket, ticket.id, companyId);

    logger.info(`Nó de mídia (${mediaConfig.mediaType}) executado com sucesso para ticket ${ticket.id}`);
  } catch (error) {
    logger.error(`Erro ao executar nó de mídia: ${error.message}`);
    throw error;
  }
};

export default ExecuteMediaNodeService;