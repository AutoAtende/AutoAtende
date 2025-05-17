import { WABAClient } from "whatsapp-business";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { SessionManager } from "./MetaSessionManager";

interface Button {
  id: string;
  title: string;
}

interface SendMetaButtonsMessageData {
  whatsappId: number;
  ticketId: number;
  title: string;
  body: string;
  footer?: string;
  buttons: Button[];
  quotedMessageId?: string;
  companyId: number;
}

export const SendMetaButtonsMessage = async ({
  whatsappId,
  ticketId,
  title,
  body,
  footer,
  buttons,
  quotedMessageId,
  companyId
}: SendMetaButtonsMessageData): Promise<Message> => {
  try {
    logger.info(`Enviando mensagem com botões via API Meta para ticket #${ticketId}`);

    // Validar os botões
    if (!buttons || buttons.length === 0) {
      throw new AppError("É necessário fornecer pelo menos um botão", 400);
    }

    if (buttons.length > 3) {
      throw new AppError("Máximo de 3 botões permitidos", 400);
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

    // Formatar o número do destinatário
    const to = ticket.contact.number.replace(/[^0-9]/g, "");

    // Formatar os botões para o formato esperado pela API Meta
    const formattedButtons = buttons.map(button => ({
      type: "reply",
      reply: {
        id: button.id,
        title: button.title.substring(0, 20) // Limite de 20 caracteres por botão
      }
    }));

    // Preparar a mensagem interativa
    const messageData: any = {
      to,
      type: "interactive",
      interactive: {
        type: "button",
        header: {
          type: "text",
          text: title.substring(0, 60) // Limite de 60 caracteres
        },
        body: {
          text: body.substring(0, 1024) // Limite de 1024 caracteres
        },
        action: {
          buttons: formattedButtons
        }
      }
    };

    // Adicionar rodapé se fornecido
    if (footer) {
      messageData.interactive.footer = {
        text: footer.substring(0, 60) // Limite de 60 caracteres
      };
    }

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

    // Criar a mensagem no banco de dados antes de enviar
    const formattedButtonTitles = buttons.map(b => b.title).join(", ");
    const messageBody = `*${title}*\n\n${body}\n\n_Botões: ${formattedButtonTitles}_`;
    
    const message = await Message.create({
      ticketId: ticket.id,
      contactId: ticket.contact.id,
      body: messageBody,
      fromMe: true,
      read: true,
      mediaType: "interactive",
      mediaUrl: "",
      status: "pending",
      remoteJid: ticket.contact.number,
      companyId
    });

    try {
      // Enviar a mensagem através da API da Meta
      logger.info(`Enviando mensagem interativa: ${JSON.stringify(messageData)}`);
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
      await ticket.update({ lastMessage: "Mensagem com botões enviada" });

    } catch (sendError) {
      logger.error(`Erro ao enviar mensagem com botões: ${sendError.message}`);
      
      // Atualizar mensagem com erro
      await message.update({
        status: "error",
        ack: 4, // Erro
        dataJson: JSON.stringify({ error: sendError.message })
      });
      
      throw sendError;
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

    logger.info(`Mensagem com botões enviada com sucesso para o ticket #${ticketId}`);
    return message;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com botões: ${error.message}`);
    throw new AppError(`Erro ao enviar mensagem com botões: ${error.message}`, 500);
  }
};

export default SendMetaButtonsMessage;