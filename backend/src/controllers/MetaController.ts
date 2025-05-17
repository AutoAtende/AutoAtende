import { Request, Response } from "express";
import { WABAClient } from "whatsapp-business";
import { logger } from "../utils/logger";
import Whatsapp from "../models/Whatsapp";
import { setupCompanyWebhook } from "../services/WbotMetaServices/MetaWebhookService";
import { StartMetaSession } from "../services/WbotMetaServices/StartMetaSession";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import { SessionManager } from "../services/WbotMetaServices/MetaSessionManager";
import SendMetaTextMessage from "../services/WbotMetaServices/SendMetaTextMessage";
import SendMetaMediaMessage from "../services/WbotMetaServices/SendMetaMediaMessage";
import SendMetaButtonsMessage from "../services/WbotMetaServices/SendMetaButtonsMessage";
import SendMetaListMessage from "../services/WbotMetaServices/SendMetaListMessage";
import SendMetaPixMessage from "../services/WbotMetaServices/SendMetaPixMessage";
import express from "express";

// Iniciar uma sessão do WhatsApp via API Meta
export const startSession = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    // Buscar o WhatsApp
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado", 404);
    }

    if (whatsapp.companyId !== companyId) {
      throw new AppError("Este WhatsApp não pertence à sua empresa", 403);
    }

    // Iniciar a sessão
    const session = await StartMetaSession(whatsapp, companyId);
    
    // Configurar webhook para a empresa
    const mainRouter = express.Router();
    await setupCompanyWebhook(companyId, mainRouter);

    return res.status(200).json({
      status: "success",
      message: "Sessão Meta API iniciada com sucesso",
      session
    });
  } catch (error) {
    logger.error(`Erro ao iniciar sessão Meta API: ${error.message}`);
    throw error;
  }
};

// Desconectar uma sessão
export const disconnectSession = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    // Buscar o WhatsApp
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado", 404);
    }

    if (whatsapp.companyId !== companyId) {
      throw new AppError("Este WhatsApp não pertence à sua empresa", 403);
    }

    // Remover a sessão
    const removed = SessionManager.removeSession(parseInt(whatsappId));
    
    if (!removed) {
      throw new AppError("Sessão não encontrada", 404);
    }

    // Atualizar status
    await whatsapp.update({ status: "DISCONNECTED" });

    // Notificar o frontend
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp
    });

    return res.status(200).json({
      status: "success",
      message: "Sessão Meta API desconectada com sucesso"
    });
  } catch (error) {
    logger.error(`Erro ao desconectar sessão Meta API: ${error.message}`);
    throw error;
  }
};

// Verificar status da conexão
export const checkConnectionStatus = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    // Buscar o WhatsApp
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado", 404);
    }

    if (whatsapp.companyId !== companyId) {
      throw new AppError("Este WhatsApp não pertence à sua empresa", 403);
    }

    // Obter a sessão
    const waba = SessionManager.getSession(parseInt(whatsappId));
    
    if (!waba) {
      return res.status(200).json({
        status: "disconnected",
        message: "Sessão Meta API não está ativa"
      });
    }

    // Verificar status
    try {
      const healthStatus = await waba.getHealthStatus(whatsapp.metaBusinessId || "");
      const canSendMessage = healthStatus.health_status.can_send_message;

      return res.status(200).json({
        status: canSendMessage === "AVAILABLE" ? "connected" : "limited",
        statusDetails: canSendMessage,
        healthStatus
      });
    } catch (error) {
      logger.error(`Erro ao verificar status da conexão: ${error.message}`);
      return res.status(200).json({
        status: "error",
        message: "Erro ao verificar status da conexão",
        error: error.message
      });
    }
  } catch (error) {
    logger.error(`Erro ao verificar status da conexão Meta API: ${error.message}`);
    throw error;
  }
};

// Enviar mensagem de texto
export const sendTextMessage = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMessageId } = req.body;
  const { companyId } = req.user;

  try {
    // Validar entrada
    if (!body || !body.trim()) {
      throw new AppError("O corpo da mensagem é obrigatório", 400);
    }

    // Buscar o ticket
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.companyId !== companyId) {
      throw new AppError("Este ticket não pertence à sua empresa", 403);
    }

    // Enviar mensagem
    const message = await SendMetaTextMessage({
      whatsappId: ticket.whatsappId,
      ticketId: ticket.id,
      body,
      quotedMessageId,
      companyId
    });

    return res.status(200).json({
      status: "success",
      message: "Mensagem enviada com sucesso",
      data: message
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem de texto: ${error.message}`);
    throw error;
  }
};

// Enviar mensagem com mídia
export const sendMediaMessage = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { mediaPath, caption, quotedMessageId } = req.body;
  const { companyId } = req.user;

  try {
    // Validar entrada
    if (!mediaPath) {
      throw new AppError("O caminho da mídia é obrigatório", 400);
    }

    // Buscar o ticket
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.companyId !== companyId) {
      throw new AppError("Este ticket não pertence à sua empresa", 403);
    }

    // Enviar mensagem
    const message = await SendMetaMediaMessage({
      whatsappId: ticket.whatsappId,
      ticketId: ticket.id,
      mediaPath,
      caption,
      quotedMessageId,
      companyId
    });

    return res.status(200).json({
      status: "success",
      message: "Mensagem com mídia enviada com sucesso",
      data: message
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com mídia: ${error.message}`);
    throw error;
  }
};

// Enviar mensagem com botões
export const sendButtonsMessage = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { title, body, footer, buttons, quotedMessageId } = req.body;
  const { companyId } = req.user;

  try {
    // Validar entrada
    if (!title || !body || !buttons || !Array.isArray(buttons) || buttons.length === 0) {
      throw new AppError("Título, corpo e botões são obrigatórios", 400);
    }

    // Buscar o ticket
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.companyId !== companyId) {
      throw new AppError("Este ticket não pertence à sua empresa", 403);
    }

    // Enviar mensagem
    const message = await SendMetaButtonsMessage({
      whatsappId: ticket.whatsappId,
      ticketId: ticket.id,
      title,
      body,
      footer,
      buttons,
      quotedMessageId,
      companyId
    });

    return res.status(200).json({
      status: "success",
      message: "Mensagem com botões enviada com sucesso",
      data: message
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com botões: ${error.message}`);
    throw error;
  }
};

// Enviar mensagem com lista
export const sendListMessage = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { title, body, footer, buttonText, sections, quotedMessageId } = req.body;
  const { companyId } = req.user;

  try {
    // Validar entrada
    if (!title || !body || !buttonText || !sections || !Array.isArray(sections) || sections.length === 0) {
      throw new AppError("Título, corpo, texto do botão e seções são obrigatórios", 400);
    }

    // Buscar o ticket
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.companyId !== companyId) {
      throw new AppError("Este ticket não pertence à sua empresa", 403);
    }

    // Enviar mensagem
    const message = await SendMetaListMessage({
      whatsappId: ticket.whatsappId,
      ticketId: ticket.id,
      title,
      body,
      footer,
      buttonText,
      sections,
      quotedMessageId,
      companyId
    });

    return res.status(200).json({
      status: "success",
      message: "Mensagem com lista enviada com sucesso",
      data: message
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com lista: ${error.message}`);
    throw error;
  }
};

// Enviar mensagem com PIX
export const sendPixMessage = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pixKey, amount, description, recipientName, city, quotedMessageId } = req.body;
  const { companyId } = req.user;

  try {
    // Validar entrada
    if (!pixKey || !amount || !description || !recipientName || !city) {
      throw new AppError("Chave PIX, valor, descrição, nome do recebedor e cidade são obrigatórios", 400);
    }

    // Buscar o ticket
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.companyId !== companyId) {
      throw new AppError("Este ticket não pertence à sua empresa", 403);
    }

    // Enviar mensagem
    const message = await SendMetaPixMessage({
      whatsappId: ticket.whatsappId,
      ticketId: ticket.id,
      pixKey,
      amount: parseFloat(amount),
      description,
      recipientName,
      city,
      quotedMessageId,
      companyId
    });

    return res.status(200).json({
      status: "success",
      message: "Mensagem PIX enviada com sucesso",
      data: message
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem PIX: ${error.message}`);
    throw error;
  }
};

// Buscar informações do WhatsApp Business
export const getBusinessProfile = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    // Buscar o WhatsApp
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado", 404);
    }

    if (whatsapp.companyId !== companyId) {
      throw new AppError("Este WhatsApp não pertence à sua empresa", 403);
    }

    // Obter a sessão
    const waba = SessionManager.getSession(parseInt(whatsappId));
    
    if (!waba) {
      throw new AppError("Sessão Meta API não está ativa", 400);
    }

    // Buscar perfil
    const profile = await waba.getBusinessProfile();

    return res.status(200).json({
      status: "success",
      data: profile
    });
  } catch (error) {
    logger.error(`Erro ao obter perfil de negócio: ${error.message}`);
    throw error;
  }
};

// Configurar webhook
export const configureWebhook = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { webhookUrl, verificationToken } = req.body;
  const { companyId } = req.user;

  try {
    // Validar entrada
    if (!webhookUrl || !verificationToken) {
      throw new AppError("URL do webhook e token de verificação são obrigatórios", 400);
    }

    // Buscar o WhatsApp
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado", 404);
    }

    if (whatsapp.companyId !== companyId) {
      throw new AppError("Este WhatsApp não pertence à sua empresa", 403);
    }

    // Atualizar dados do webhook
    await whatsapp.update({
      webhookUrl,
      metaVerificationToken: verificationToken
    });

    // Configurar webhook
    const mainRouter = express.Router();
    await setupCompanyWebhook(companyId, mainRouter);

    return res.status(200).json({
      status: "success",
      message: "Webhook configurado com sucesso"
    });
  } catch (error) {
    logger.error(`Erro ao configurar webhook: ${error.message}`);
    throw error;
  }
};

export default {
  startSession,
  disconnectSession,
  checkConnectionStatus,
  sendTextMessage,
  sendMediaMessage,
  sendButtonsMessage,
  sendListMessage,
  sendPixMessage,
  getBusinessProfile,
  configureWebhook
};