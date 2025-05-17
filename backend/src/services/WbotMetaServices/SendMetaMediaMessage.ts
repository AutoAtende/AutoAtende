import { WABAClient } from "whatsapp-business";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { SessionManager } from "./MetaSessionManager";
import fs from "fs";
import path from "path";
import mime from "mime-types";

interface SendMetaMediaMessageData {
  whatsappId: number;
  ticketId: number;
  mediaPath: string;
  caption?: string;
  quotedMessageId?: string;
  companyId: number;
}

export const SendMetaMediaMessage = async ({
  whatsappId,
  ticketId,
  mediaPath,
  caption = "",
  quotedMessageId,
  companyId
}: SendMetaMediaMessageData): Promise<Message> => {
  try {
    logger.info(`Enviando mensagem com mídia via API Meta para ticket #${ticketId}`);

    // Verificar se o arquivo existe
    if (!fs.existsSync(mediaPath)) {
      throw new AppError("Arquivo de mídia não encontrado", 404);
    }

    // Buscar a instância do WhatsApp
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado", 404);
    }

    // Buscar o ticket e contato
    const ticket = await Ticket.findByPk(ticketId, {
      include: [{ model: Contact, as: "contact" }]
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Verificar se o contato está disponível
    if (!ticket.contact) {
      throw new AppError("Contato do ticket não encontrado", 404);
    }

    // Obter o cliente WABA para esta instância do WhatsApp
    const waba = SessionManager.getSession(whatsappId);
    if (!waba) {
      throw new AppError("Sessão WABA não encontrada", 404);
    }

    // Determinar o tipo MIME e tipo de mídia
    const mimeType = mime.lookup(mediaPath) || "application/octet-stream";
    let mediaType: string;
    
    if (mimeType.startsWith("image/")) {
      mediaType = "image";
    } else if (mimeType.startsWith("video/")) {
      mediaType = "video";
    } else if (mimeType.startsWith("audio/")) {
      mediaType = "audio";
    } else {
      mediaType = "document";
    }

    // Formatar o número do destinatário
    const to = ticket.contact.number.replace(/[^0-9]/g, "");

    // Criar a mensagem no banco de dados antes de enviar
    const filename = path.basename(mediaPath);
    
    const message = await Message.create({
      ticketId: ticket.id,
      contactId: ticket.contact.id,
      body: caption || filename,
      fromMe: true,
      read: true,
      mediaType,
      mediaUrl: mediaPath,
      status: "pending",
      remoteJid: ticket.contact.number,
      companyId
    });

    try {
      // Fazer upload da mídia para o servidor da Meta
      logger.info(`Enviando mídia para API Meta: ${mediaPath} (${mimeType})`);
      const uploadResponse = await waba.uploadMedia({
        file: mediaPath,
        type: mimeType as any
      });

      logger.info(`Mídia enviada com sucesso. ID: ${uploadResponse.id}`);

      // Preparar a mensagem para envio
      const messageData: any = {
        to,
        type: mediaType
      };

      // Adicionar o objeto de mídia com ID e caption
      messageData[mediaType] = {
        id: uploadResponse.id,
        caption: caption || ""
      };

      // Adicionar contexto de resposta se necessário
      if (quotedMessageId) {
        // Buscar a mensagem citada
        const quotedMessage = await Message.findByPk(quotedMessageId);
        
        if (quotedMessage) {
          // Verificar se a mensagem citada tem um ID da Meta válido
          const quotedId = quotedMessage.dataJson ? 
            JSON.parse(quotedMessage.dataJson)?.id : null;

          if (quotedId) {
            messageData.context = {
              message_id: quotedId
            };
          }
        }
      }

      // Enviar a mensagem através da API da Meta
      logger.info(`Enviando mensagem com mídia: ${JSON.stringify(messageData)}`);
      const response = await waba.sendMessage(messageData);

      // Log da resposta
      logger.info(`Resposta da API Meta: ${JSON.stringify(response)}`);

      // Atualizar a mensagem com o ID externo e status
      const metaMessageId = response.messages?.[0]?.id;
      if (metaMessageId) {
        await message.update({ 
          ack: 1, // Mensagem enviada
          status: "sent",
          externalId: metaMessageId,
          dataJson: JSON.stringify({
            ...messageData,
            response
          })
        });
      }

      // Atualizar o ticket com a última mensagem
      await ticket.update({ lastMessage: caption || `${mediaType}` });

    } catch (mediaError) {
      logger.error(`Erro ao enviar mídia: ${mediaError.message}`);
      
      // Atualizar mensagem com erro
      await message.update({
        status: "error",
        ack: 4, // Erro
        dataJson: JSON.stringify({ error: mediaError.message })
      });
      
      throw mediaError;
    }

    // Notificar o frontend sobre a nova mensagem
    const io = getIO();
    io.to(`company-${companyId}-${ticket.status}`)
      .to(ticket.id.toString())
      .emit(`company-${companyId}-appMessage`, {
        action: "create",
        message,
        ticket,
        contact: ticket.contact
      });

    logger.info(`Mensagem com mídia enviada com sucesso para o ticket #${ticketId}`);
    return message;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com mídia: ${error.message}`);
    throw new AppError(`Erro ao enviar mensagem com mídia: ${error.message}`, 500);
  }
};

export default SendMetaMediaMessage;