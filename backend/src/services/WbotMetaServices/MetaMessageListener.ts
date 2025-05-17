import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import { WABAClient } from "whatsapp-business";
import { Webhook, WebhookMessage, WebhookContact, WebhookError, WebhookStatus } from "whatsapp-business";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { verifyMessage } from "./MessageListener/Verifiers/VerifyMessage";
import { verifyMediaMessage } from "./MessageListener/Verifiers/VerifyMediaMessage";
import { getBodyMessage } from "./MessageListener/Get/GetBodyMessage";
import { SessionManager } from "./MetaSessionManager";
import axios from "axios";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { Op } from "sequelize";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import { Mutex } from "async-mutex";
import Message from "../../models/Message";
import { handleRating } from "./MessageListener/wbotMessageListener";
import { verifyRating } from "./MessageListener/wbotMessageListener";
import { getQuotedMessageId } from "./MessageListener/wbotMessageListener";
import { ProcessMessageWithRules } from "../MessageRuleService/ProcessMessageWithRules";
import { CheckIsEnabledMessageRuleService } from "../MessageRuleService/CheckIsEnabledMessageRuleService";

const createTicketMutex = new Mutex();
const writeFileAsync = promisify(fs.writeFile);

// Função para fazer o download de mídia
const downloadMedia = async (url: string, token: string, filename: string, companyId: number): Promise<string> => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });
    
    // Criar diretório se não existir
    const mediaDir = path.join(__dirname, "..", "..", "..", "public", `company${companyId}`);
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }
    
    const filePath = path.join(mediaDir, filename);
    await writeFileAsync(filePath, response.data);
    
    return filename;
  } catch (error) {
    logger.error(`Erro ao baixar mídia: ${error.message}`);
    throw error;
  }
};

// Processar mensagem recebida do webhook
const processIncomingMessage = async (
  message: WebhookMessage,
  contact: WebhookContact,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    // Criar ou atualizar contato
    const contactData = {
      name: contact.profile.name || contact.wa_id,
      number: contact.wa_id,
      isGroup: false,
      companyId,
      whatsappId: whatsapp.id
    };
    
    // Obter o cliente WABA
    const waba = SessionManager.getSession(whatsapp.id);
    if (!waba) {
      logger.error(`Cliente WABA não encontrado para WhatsApp ID: ${whatsapp.id}`);
      return;
    }

    // Criar ou atualizar contato
    const contactRecord = await CreateOrUpdateContactService(contactData, null, contact.wa_id);
    
    // Atualizar contador de mensagens não lidas
    let unreadMessages = 0;
    
    // Criar ou encontrar ticket
    const ticket = await createTicketMutex.runExclusive(async () => {
      return FindOrCreateTicketService(
        contactRecord,
        whatsapp.id!,
        unreadMessages + 1,
        companyId
      );
    });
    
    // Criar rastreamento de ticket
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp.id
    });
    
    // Se for avaliação
    if (verifyRating(ticketTraking)) {
      // Converter formato de mensagem
      const waMessage = {
        key: {
          fromMe: false,
          id: message.id
        },
        message: {
          conversation: message.text ? message.text.body : "",
        }
      };
      await handleRating(waMessage, ticket, ticketTraking);
      return;
    }
    
    // Processar diferentes tipos de mensagens
    if (message.type === "text") {
      // Mensagem de texto
      const messageData = {
        id: message.id,
        ticketId: ticket.id,
        contactId: contactRecord.id,
        body: message.text.body,
        fromMe: false,
        read: false,
        mediaType: "chat",
        remoteJid: contactRecord.number,
        dataJson: JSON.stringify(message)
      };
      
      const createdMessage = await Message.create(messageData);
      
      // Atualizar última mensagem do ticket
      await ticket.update({ lastMessage: message.text.body });
      
      // Verificar regras de mensagem
      const isEnabledMessageRules = await CheckIsEnabledMessageRuleService({ 
        companyId, 
        whatsappId: ticket.whatsappId 
      });
      
      if (isEnabledMessageRules) {
        await ProcessMessageWithRules({
          body: message.text.body,
          ticket,
          companyId
        });
      }
      
    } else if (message.type === "image" || message.type === "audio" || message.type === "video" || message.type === "document") {
      // Mensagem de mídia
      const mediaInfo = message[message.type];
      
      // Baixar mídia
      const mediaId = mediaInfo.id;
      const mediaResponse = await waba.getMedia(mediaId);
      
      // Gerar nome do arquivo
      const timestamp = new Date().getTime();
      const extension = mediaResponse.mime_type.split('/')[1];
      const filename = `${timestamp}-${mediaId}.${extension}`;
      
      // Download e salvar mídia
      await downloadMedia(mediaResponse.url, whatsapp.token, filename, companyId);
      
      // Criar mensagem no banco de dados
      const messageData = {
        id: message.id,
        ticketId: ticket.id,
        contactId: contactRecord.id,
        body: mediaInfo.caption || "",
        fromMe: false,
        read: false,
        mediaUrl: filename,
        mediaType: message.type,
        remoteJid: contactRecord.number,
        dataJson: JSON.stringify(message)
      };
      
      const createdMessage = await Message.create(messageData);
      
      // Atualizar última mensagem do ticket
      await ticket.update({ 
        lastMessage: mediaInfo.caption || `${message.type} message` 
      });
    } else if (message.type === "location") {
      // Mensagem de localização
      const locationData = {
        id: message.id,
        ticketId: ticket.id,
        contactId: contactRecord.id,
        body: `Latitude: ${message.location.latitude}, Longitude: ${message.location.longitude}`,
        fromMe: false,
        read: false,
        mediaType: "location",
        remoteJid: contactRecord.number,
        dataJson: JSON.stringify(message)
      };
      
      const createdMessage = await Message.create(locationData);
      
      // Atualizar última mensagem do ticket
      await ticket.update({ 
        lastMessage: `Location shared` 
      });
    } else if (message.type === "contacts") {
      // Mensagem de contatos
      const contactsMessage = {
        id: message.id,
        ticketId: ticket.id,
        contactId: contactRecord.id,
        body: `Contact shared: ${message.contacts.length} contact(s)`,
        fromMe: false,
        read: false,
        mediaType: "vcard",
        remoteJid: contactRecord.number,
        dataJson: JSON.stringify(message)
      };
      
      const createdMessage = await Message.create(contactsMessage);
      
      // Atualizar última mensagem do ticket
      await ticket.update({ 
        lastMessage: `Contact shared` 
      });
    }
    
    // Emitir evento via socket
    const io = getIO();
    io.to(`company-${companyId}-${ticket.status}`)
      .to(ticket.id.toString())
      .to(`queue-${ticket.queueId}-${ticket.status}`)
      .emit(`company-${companyId}-ticket`, {
        action: "updateUnread",
        ticketId: ticket.id
      });
      
  } catch (error) {
    logger.error(`Erro ao processar mensagem: ${error.message}`);
  }
};

// Processar mensagem de status do webhook
const processStatusMessage = async (
  status: WebhookStatus,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    // Encontrar mensagem pelo ID
    const message = await Message.findOne({
      where: { id: status.id, companyId }
    });
    
    if (!message) {
      logger.warn(`Mensagem não encontrada para status update: ${status.id}`);
      return;
    }
    
    // Atualizar status da mensagem
    let ack: number;
    
    switch (status.status) {
      case "sent":
        ack = 1;
        break;
      case "delivered":
        ack = 2;
        break;
      case "read":
        ack = 3;
        break;
      case "failed":
        ack = 4;
        break;
      default:
        ack = 0;
    }
    
    await message.update({ ack });
    
    // Emitir evento via socket
    const io = getIO();
    io.to(`company-${companyId}-appMessage`).emit(`company-${companyId}-appMessage`, {
      action: "update",
      message
    });
  } catch (error) {
    logger.error(`Erro ao processar status de mensagem: ${error.message}`);
  }
};

// Processar erro do webhook
const processErrorMessage = async (
  error: WebhookError,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  logger.error(`Erro recebido do webhook: ${error.code} - ${error.title} - ${error.message}`);
  
  // Verificar se é erro de autenticação ou token expirado
  if (error.code === 0 || error.code === 190) {
    await whatsapp.update({ status: "DISCONNECTED" });
    
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp
    });
    
    logger.error(`Conexão Meta API desconectada devido a erro de autenticação para WhatsApp ID: ${whatsapp.id}`);
  }
};

// Função principal para processar webhook do Meta API
export const metaWebhookProcessor = async (
  webhookData: Webhook,
  companyId: number
): Promise<void> => {
  try {
    logger.info(`Processando webhook da Meta API para empresa ${companyId}`);
    
    if (webhookData.object !== "whatsapp") {
      logger.warn(`Webhook recebido não é do WhatsApp: ${webhookData.object}`);
      return;
    }
    
    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        const value = change.value;
        
        if (value.messaging_product !== "whatsapp") {
          continue;
        }
        
        // Encontrar o WhatsApp correspondente pelo número de telefone
        const whatsapp = await Whatsapp.findOne({
          where: {
            phoneNumberId: value.metadata.phone_number_id,
            companyId
          }
        });
        
        if (!whatsapp) {
          logger.warn(`WhatsApp não encontrado para phone_number_id: ${value.metadata.phone_number_id}`);
          continue;
        }
        
        // Processar mensagens recebidas
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            // Verificar se mensagem já existe para evitar duplicação
            const messageExists = await Message.count({
              where: { id: message.id, companyId }
            });
            
            if (!messageExists) {
              const contact = value.contacts[0];
              await processIncomingMessage(message, contact, whatsapp, companyId);
            }
          }
        }
        
        // Processar atualizações de status
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            await processStatusMessage(status, whatsapp, companyId);
          }
        }
        
        // Processar erros
        if (value.errors && value.errors.length > 0) {
          for (const error of value.errors) {
            await processErrorMessage(error, whatsapp, companyId);
          }
        }
      }
    }
  } catch (error) {
    logger.error(`Erro ao processar webhook da Meta API: ${error.message}`);
  }
};

// Função para enviar mensagem via API oficial
export const sendMessageMeta = async (
  whatsapp: Whatsapp,
  to: string,
  body: string,
  quotedMessageId?: string,
  mediaUrl?: string,
  mediaType?: string
): Promise<any> => {
  try {
    const waba = SessionManager.getSession(whatsapp.id);
    if (!waba) {
      throw new Error(`Cliente WABA não encontrado para WhatsApp ID: ${whatsapp.id}`);
    }
    
    // Remover caracteres não numéricos do número
    const formattedNumber = to.replace(/\D/g, "");
    
    if (mediaUrl) {
      // Enviar mensagem com mídia
      const mediaResponse = await waba.uploadMedia({
        file: mediaUrl,
        type: mediaType || "image/jpeg"
      });
      
      // Construir mensagem com mídia
      const message: any = {
        to: formattedNumber,
        type: mediaType.includes("image") ? "image" :
              mediaType.includes("audio") ? "audio" :
              mediaType.includes("video") ? "video" : "document"
      };
      
      // Adicionar objeto de mídia correto
      message[message.type] = {
        id: mediaResponse.id,
        caption: body
      };
      
      // Enviar mensagem
      return await waba.sendMessage(message);
    } else {
      // Mensagem de texto simples
      const message: any = {
        to: formattedNumber,
        type: "text",
        text: { body }
      };
      
      // Adicionar contexto (resposta) se necessário
      if (quotedMessageId) {
        message.context = {
          message_id: quotedMessageId
        };
      }
      
      // Enviar mensagem
      return await waba.sendMessage(message);
    }
  } catch (error) {
    logger.error(`Erro ao enviar mensagem via Meta API: ${error.message}`);
    throw error;
  }
};

export default {
  metaWebhookProcessor,
  sendMessageMeta
};