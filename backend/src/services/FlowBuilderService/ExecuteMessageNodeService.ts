import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import ShowContactService from "../ContactServices/ShowContactService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { logger } from "../../utils/logger";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import formatBody from "../../helpers/Mustache";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { verifyMediaMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMediaMessage";
import { getWbot } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import { AnyMessageContent } from "bail-lite";
import { notifyUpdate } from "../TicketServices/UpdateTicketService";
import fs from "fs";
import path from "path";
import mime from "mime-types";


interface ExecuteMessageNodeParams {
  nodeData: {
    message?: string;
    messageType?: string; // 'text', 'image', 'audio', 'video', 'document', 'location'
    mediaUrl?: string;
    caption?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    name?: string;
  };
  ticketId: number;
  contactId: number;
  companyId: number;
  whatsappId?: number;
}

const ExecuteMessageNodeService = async ({
  nodeData,
  ticketId,
  contactId,
  companyId,
  whatsappId
}: ExecuteMessageNodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó de mensagem para ticket ${ticketId}`);
    
    // Obter ticket e contato
    const ticket = await ShowTicketService(ticketId, companyId);
    const contact = await ShowContactService(contactId, companyId);
    
    if (!ticket || !contact) {
      throw new AppError("Ticket ou contato não encontrado");
    }
    
    const whatsappIdToUse = whatsappId || ticket.whatsappId;
    const whatsapp = await ShowWhatsAppService(whatsappIdToUse, companyId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
    
    const wbot = await getWbot(whatsappIdToUse);
    await SendPresenceStatus(
      wbot,
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
    );

    const type = nodeData.messageType || 'text';
    let sentMessage;

    switch (type) {
      case 'text':
      default: {
        if (!nodeData.message) {
          throw new AppError("Mensagem não fornecida");
        }
        const messageText = formatBody(nodeData.message, ticket);
        sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: messageText }
        );
        await verifyMessage(sentMessage, ticket, contact);
        break;
      }
      case 'image':
      case 'audio':
      case 'video':
      case 'document': {
        if (!nodeData.mediaUrl) {
          throw new AppError("URL da mídia não fornecida");
        }
        
        // Montar caminho do arquivo
        const publicFolder = process.env.BACKEND_PUBLIC_PATH || path.resolve("public");
        
        // Verificar se é uma URL (contém http:// ou https://)
        let mediaPath;
        if (/^https?:\/\//i.test(nodeData.mediaUrl)) {
          // Para URLs, extrair apenas o nome do arquivo
          const fileName = path.basename(nodeData.mediaUrl).split("?")[0];
          const localPath = `company${companyId}/flowBuilder/${fileName}`;
          mediaPath = path.join(publicFolder, localPath);
        } else {
          // Para caminhos locais, normalizar o caminho
          let cleanMediaUrl = nodeData.mediaUrl.replace(/^\//, '').replace(/^public\//, '');
          if (!cleanMediaUrl.startsWith(`company${companyId}`)) {
            cleanMediaUrl = `company${companyId}/` + cleanMediaUrl;
          }
          mediaPath = path.join(publicFolder, cleanMediaUrl);
        }
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(mediaPath)) {
          // Tentar em locais alternativos
          const fileName = path.basename(mediaPath);
          const altPaths = [
            path.join(publicFolder, `company${companyId}/flowBuilder/${fileName}`),
            path.join(publicFolder, `company${companyId}/media/${fileName}`),
            path.join(publicFolder, `company${companyId}/images/${fileName}`)
          ];
          
          let found = false;
          for (const altPath of altPaths) {
            if (fs.existsSync(altPath)) {
              mediaPath = altPath;
              found = true;
              break;
            }
          }
          
          if (!found) {
            throw new AppError(`Arquivo de mídia não encontrado: ${mediaPath}`);
          }
        }
        
        const mimeType = mime.lookup(mediaPath) || undefined;
        let optionsMsg: AnyMessageContent;
        
        if (type === 'image') {
          optionsMsg = {
            image: fs.readFileSync(mediaPath),
            caption: nodeData.caption || '',
            mimetype: mimeType
          };
        } else if (type === 'video') {
          optionsMsg = {
            video: fs.readFileSync(mediaPath),
            caption: nodeData.caption || '',
            mimetype: mimeType
          };
        } else if (type === 'audio') {
          optionsMsg = {
            audio: fs.readFileSync(mediaPath),
            mimetype: mimeType,
            ptt: false
          };
        } else if (type === 'document') {
          optionsMsg = {
            document: fs.readFileSync(mediaPath),
            fileName: nodeData.caption || path.basename(mediaPath),
            mimetype: mimeType
          };
        }
        
        sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          optionsMsg
        );
        
        await verifyMediaMessage(sentMessage, ticket, contact, wbot);
        break;
      }
      case 'location': {
        const latitude = typeof nodeData.latitude === 'string' ? parseFloat(nodeData.latitude) : nodeData.latitude;
        const longitude = typeof nodeData.longitude === 'string' ? parseFloat(nodeData.longitude) : nodeData.longitude;
        
        if (
          isNaN(latitude) ||
          isNaN(longitude)
        ) {
          throw new AppError("Latitude e longitude são obrigatórios para localização");
        }
        
        sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            location: {
              degreesLatitude: nodeData.latitude,
              degreesLongitude: nodeData.longitude,
              name: nodeData.name || '',
              address: nodeData.address || ''
            }
          }
        );
        
        await verifyMessage(sentMessage, ticket, contact);
        break;
      }
    }
        const io = getIO();
        notifyUpdate(io, ticket, ticket.id, companyId);

    logger.info(`Nó de mensagem (${type}) executado com sucesso para ticket ${ticketId}`);
  } catch (error) {
    logger.error(`Erro ao executar nó de mensagem: ${error.message}`);
    throw error;
  }
};

export default ExecuteMessageNodeService;