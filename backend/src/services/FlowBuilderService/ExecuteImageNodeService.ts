import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import fs from "fs";
import path from "path";
import formatBody from "../../helpers/Mustache";
import mime from "mime-types";
import { getWbot } from "../../libs/wbot";
import { verifyMediaMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMediaMessage";
import url from "url";

interface ExecuteImageNodeParams {
  nodeData: {
    mediaUrl: string;
    caption?: string;
  };
  contact: Contact;
  ticket: Ticket;
  companyId: number;
  whatsappId: number;
}

const ExecuteImageNodeService = async ({
  nodeData,
  contact,
  ticket,
  companyId,
  whatsappId
}: ExecuteImageNodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó de imagem para ticket ${ticket.id}`);
    
    if (!nodeData.mediaUrl) {
      throw new AppError("URL da imagem não fornecida");
    }
    
    // Usar whatsappId do ticket se não for fornecido
    const whatsappIdToUse = whatsappId || ticket.whatsappId;
    
    const whatsapp = await Whatsapp.findByPk(whatsappIdToUse);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
    
    // Caminho raiz das mídias públicas
    const publicFolder = process.env.BACKEND_PUBLIC_PATH || path.resolve("public");
    
    // Normalizar a URL da imagem e corrigir problemas com URLs completas
    let mediaUrl = nodeData.mediaUrl;
    
    // Verificar se a mediaUrl é uma URL completa (http:// ou https://)
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      try {
        // Extrair apenas o caminho do arquivo da URL
        const parsedUrl = new URL(mediaUrl);
        const pathname = parsedUrl.pathname;
        
        // Extrair o nome do arquivo e construir o caminho local
        const fileName = path.basename(pathname);
        
        // Verificar se contém /flowBuilder/ na URL
        if (pathname.includes('/flowBuilder/')) {
          mediaUrl = `company${companyId}/flowBuilder/${fileName}`;
        } else {
          mediaUrl = `company${companyId}/${fileName}`;
        }
        
        logger.info(`URL convertida de ${nodeData.mediaUrl} para ${mediaUrl}`);
      } catch (error) {
        logger.error(`Erro ao processar URL de mídia: ${error.message}`);
        // Tentar extrair apenas o nome do arquivo como fallback
        const fileName = path.basename(mediaUrl);
        mediaUrl = `company${companyId}/flowBuilder/${fileName}`;
      }
    } else {
      // Remover prefixo "company{id}/" se já estiver presente
      const companyPrefix = `company${companyId}/`;
      if (mediaUrl.startsWith(companyPrefix)) {
        mediaUrl = mediaUrl.substring(companyPrefix.length);
      }
      
      // Adicionar prefixo da empresa
      mediaUrl = `company${companyId}/${mediaUrl}`;
    }
    
    // Construir o caminho completo da imagem
    let mediaPath = path.join(publicFolder, mediaUrl);
    
    logger.info(`Caminho construído para a imagem: ${mediaPath}`);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(mediaPath)) {
      // Tentar encontrar em pastas específicas do sistema
      const alternativePaths = [
        path.join(publicFolder, `company${companyId}`, "flowBuilder", path.basename(mediaUrl)),
        path.join(publicFolder, `company${companyId}`, "images", path.basename(mediaUrl)),
        path.join(publicFolder, `company${companyId}`, path.basename(mediaUrl))
      ];
      
      let fileFound = false;
      
      for (const altPath of alternativePaths) {
        logger.info(`Tentando caminho alternativo: ${altPath}`);
        if (fs.existsSync(altPath)) {
          logger.info(`Arquivo encontrado em: ${altPath}`);
          fileFound = true;
          mediaPath = altPath;
          break;
        }
      }
      
      if (!fileFound) {
        throw new AppError(`Arquivo de imagem não encontrado: ${mediaPath} (URL original: ${nodeData.mediaUrl})`);
      }
    }
    
    // Substituir variáveis na legenda, se existir
    const caption = nodeData.caption 
      ? formatBody(nodeData.caption, ticket) 
      : "";
    
    // Nome do arquivo para exibição
    const filename = path.basename(mediaPath);
    
    // Obter o tipo MIME baseado na extensão do arquivo
    const mimeType = mime.lookup(mediaPath) || 'image/jpeg';
    
    // Obter instância do bot
    const wbot = await getWbot(whatsappIdToUse);
    
    // Preparar opções de mensagem usando o método existente do sistema
    const optionsMsg = {
      image: fs.readFileSync(mediaPath),
      caption: caption,
      mimetype: mimeType
    };
    
    // Enviar mídia
    const sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      optionsMsg
    );
    
    // Verificar e registrar a mensagem no sistema usando o método existente
    await verifyMediaMessage(sentMessage, ticket, contact, wbot);
    
    logger.info(`Nó de imagem executado com sucesso para ticket ${ticket.id}`);
  } catch (error) {
    logger.error(`Erro ao executar nó de imagem: ${error.message}`);
    throw error;
  }
};

export default ExecuteImageNodeService;