// ============================================================================
// 🔥 SOCKET EMITTER - VERSÃO CORRIGIDA PARA GARANTIR ENTREGA DE MENSAGENS
// ============================================================================

import { getIO } from "../libs/socket";
import { logger } from "./logger";

/**
 * 🔥 CORREÇÃO PRINCIPAL: Emite eventos relacionados a mensagens de forma CONSISTENTE
 */
export const emitMessageEvent = (
  companyId: string | number,
  action: "create" | "update" | "delete" | "ticketAssigned",
  message: any,
  extraData?: any
): void => {
  try {
    const io = getIO();
    if (!io) {
      logger.warn("[SocketEmitter] IO não disponível para emitir evento de mensagem");
      return;
    }

    // 🔥 CRÍTICO: Preservar TODOS os campos da mensagem original
    const preservedMessage = {
      ...message,
      // Garantir que campos críticos não sejam perdidos
      id: message?.id,
      ticketId: message?.ticketId,
      body: message?.body,
      mediaType: message?.mediaType,
      mediaUrl: message?.mediaUrl,
      fromMe: message?.fromMe,
      read: message?.read,
      ack: message?.ack || 0,
      createdAt: message?.createdAt,
      updatedAt: message?.updatedAt,
      internalMessage: message?.internalMessage
    };

    // 🔥 CORREÇÃO: Dados do evento com estrutura PADRÃO
    const eventData = {
      action,
      message: preservedMessage,
      ticketId: message?.ticketId,
      messageId: message?.id,
      timestamp: new Date(),
      ...(extraData && { ticket: extraData })
    };

    const ticketId = message?.ticketId || message?.ticket?.id;

    // 🔥 CRÍTICO: Emitir para TODAS as salas que o frontend pode estar escutando
    logger.debug(`📡 [SOCKET EMITTER] Emitindo mensagem para company-${companyId}`, {
      action,
      messageId: message?.id,
      ticketId,
      salas: [
        `company-${companyId}`,
        ticketId ? `ticket-${ticketId}` : null,
        ticketId ? `chatBox-${ticketId}` : null
      ].filter(Boolean)
    });

    // SALA 1: Principal da empresa (PRIORIDADE MÁXIMA)
    io.to(`company-${companyId}`).emit(`company-${companyId}-appMessage`, eventData);

    // SALA 2: Específica do ticket (se existir)
    if (ticketId) {
      io.to(`ticket-${ticketId}`).emit(`ticket-${ticketId}-appMessage`, eventData);
      io.to(`ticket-${ticketId}`).emit(`company-${companyId}-appMessage`, eventData);
      
      // SALA 3: ChatBox (compatibilidade)
      io.to(`chatBox-${ticketId}`).emit(`${ticketId}-appMessage`, eventData);
      io.to(ticketId.toString()).emit(`company-${companyId}-appMessage`, eventData);
    }

    // 🔥 LOG CRÍTICO: Verificar se dados estão corretos
    logger.info(`✅ [SOCKET EMITTER] Evento de mensagem emitido`, {
      companyId,
      action,
      messageId: preservedMessage.id,
      ticketId,
      hasMediaType: !!preservedMessage.mediaType,
      hasMediaUrl: !!preservedMessage.mediaUrl,
      hasBody: !!preservedMessage.body,
      fromMe: preservedMessage.fromMe
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] ERRO CRÍTICO ao emitir evento de mensagem:", error);
  }
};

/**
 * Emite eventos relacionados a tickets COM ISOLAMENTO POR EMPRESA
 */
export const emitTicketEvent = (
  companyId: string | number,
  action: "create" | "update" | "delete" | "updateUnread" | "removeFromList",
  ticket: any,
  extraData?: any
): void => {
  try {
    const io = getIO();
    if (!io) {
      logger.warn("[SocketEmitter] IO não disponível para emitir evento de ticket");
      return;
    }

    const eventData = {
      action,
      ticket,
      ticketId: ticket?.id,
      timestamp: new Date(),
      ...(extraData && { extraData })
    };

    // 🎯 EMITIR PARA SALAS ESPECÍFICAS DA EMPRESA
    io.to(`company-${companyId}`).emit(`company-${companyId}-ticket`, eventData);

    // Se há ticket específico, emitir também para sua sala
    if (ticket?.id) {
      io.to(`ticket-${ticket.id}`).emit(`ticket-${ticket.id}`, eventData);
      io.to(`chatBox-${ticket.id}`).emit(`company-${companyId}-tickets-list`, eventData);
    }

    logger.debug(`📡 [SOCKET EMITTER] Evento de ticket emitido para company-${companyId}`, {
      action,
      ticketId: ticket?.id,
      ticketStatus: ticket?.status
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir evento de ticket:", error);
  }
};

/**
 * 🔥 CORREÇÃO: Emite eventos de presença/status online de forma CONSISTENTE
 */
export const emitPresenceEvent = (
  companyId: string | number,
  contactId: string | number,
  presence: "available" | "composing" | "recording" | "paused",
  ticketId?: string | number
): void => {
  try {
    const io = getIO();
    if (!io) return;

    const eventData = {
      action: "presence",
      contact: { id: contactId },
      presence,
      ticketId: ticketId || null, // 🔥 ADICIONAR ticketId para facilitar filtro no frontend
      timestamp: new Date()
    };

    // 🎯 EMITIR PARA A EMPRESA ESPECÍFICA
    io.to(`company-${companyId}`).emit(`company-${companyId}-presence`, eventData);

    logger.debug(`📡 [SOCKET EMITTER] Evento de presença emitido para company-${companyId}`, {
      contactId,
      presence,
      ticketId
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir evento de presença:", error);
  }
};

// Manter outras funções existentes sem alteração para compatibilidade
export const emitNotificationEvent = (
  companyId: string | number,
  type: string,
  data: any
): void => {
  try {
    const io = getIO();
    if (!io) return;

    const eventData = {
      action: "notification",
      type,
      data,
      timestamp: new Date().toISOString()
    };

    io.to(`company-${companyId}`).emit(`company-${companyId}-notification`, eventData);

    logger.debug(`📡 [SOCKET EMITTER] Notificação emitida para company-${companyId}`, {
      type,
      dataKeys: Object.keys(data || {})
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir notificação:", error);
  }
};

export const emitNotificationCount = (
  companyId: string | number,
  userId: string | number,
  count: number
): void => {
  try {
    const io = getIO();
    if (!io) return;

    const eventData = {
      action: "notificationCount",
      userId,
      count,
      timestamp: new Date().toISOString()
    };

    io.to(`company-${companyId}`).emit(`company-${companyId}-notification-count`, eventData);
    io.to(`user-${userId}-notifications`).emit(`user-${userId}-notification-count`, eventData);

    logger.debug(`📡 [SOCKET EMITTER] Contador de notificação emitido`, {
      companyId,
      userId,
      count
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir contador de notificação:", error);
  }
};

// Outras funções mantidas para compatibilidade
export const emitCustomEvent = (
  eventName: string,
  data: any,
  rooms?: string[]
): void => {
  try {
    const io = getIO();
    if (!io) return;

    const eventData = {
      ...data,
      timestamp: new Date().toISOString()
    };

    if (rooms && rooms.length > 0) {
      rooms.forEach(room => {
        io.to(room).emit(eventName, eventData);
      });
      
      logger.debug(`📡 [SOCKET EMITTER] Evento customizado emitido para salas específicas`, {
        eventName,
        rooms,
        dataKeys: Object.keys(data || {})
      });
    } else {
      logger.warn(`⚠️ [SOCKET EMITTER] Evento customizado emitido globalmente (sem salas): ${eventName}`);
      io.emit(eventName, eventData);
    }

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir evento customizado:", error);
  }
};

export const emitContactEvent = (
  companyId: string | number,
  action: "create" | "update" | "delete",
  contact: any,
  extraData?: any
): void => {
  try {
    const io = getIO();
    if (!io) {
      logger.warn("[SocketEmitter] IO não disponível para emitir evento de contato");
      return;
    }

    const eventData = {
      action,
      contact,
      contactId: contact?.id,
      timestamp: new Date(),
      ...(extraData && { extraData })
    };

    io.to(`company-${companyId}`).emit(`company-${companyId}-contact`, eventData);

    logger.debug(`📡 [SOCKET EMITTER] Evento de contato emitido para company-${companyId}`, {
      action,
      contactId: contact?.id,
      contactName: contact?.name
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir evento de contato:", error);
  }
};

export const emitUserEvent = (
  companyId: string | number,
  action: "create" | "update" | "delete" | "online" | "offline",
  user: any,
  extraData?: any
): void => {
  try {
    const io = getIO();
    if (!io) {
      logger.warn("[SocketEmitter] IO não disponível para emitir evento de usuário");
      return;
    }

    const eventData = {
      action,
      user,
      userId: user?.id,
      timestamp: new Date(),
      ...(extraData && { extraData })
    };

    io.to(`company-${companyId}`).emit(`company-${companyId}-user`, eventData);

    logger.debug(`📡 [SOCKET EMITTER] Evento de usuário emitido para company-${companyId}`, {
      action,
      userId: user?.id,
      userName: user?.name
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir evento de usuário:", error);
  }
};

export const emitWhatsappEvent = (
  companyId: string | number,
  action: "update" | "delete" | "restart" | "ready" | "qrcode",
  whatsapp: any,
  extraData?: any
): void => {
  try {
    const io = getIO();
    if (!io) {
      logger.warn("[SocketEmitter] IO não disponível para emitir evento de WhatsApp");
      return;
    }

    const eventData = {
      action,
      whatsapp,
      whatsappId: whatsapp?.id,
      timestamp: new Date(),
      ...(extraData && { extraData })
    };

    io.to(`company-${companyId}`).emit(`company-${companyId}-whatsapp`, eventData);

    logger.debug(`📡 [SOCKET EMITTER] Evento de WhatsApp emitido para company-${companyId}`, {
      action,
      whatsappId: whatsapp?.id,
      whatsappName: whatsapp?.name
    });

  } catch (error) {
    logger.error("❌ [SOCKET EMITTER] Erro ao emitir evento de WhatsApp:", error);
  }
};

// ============================================================================
// 🔥 CLASSE SOCKETEMITTER PARA COMPATIBILIDADE TOTAL
// ============================================================================

export class SocketEmitter {
  static emitMessageEvent = emitMessageEvent;
  static emitTicketEvent = emitTicketEvent;
  static emitPresenceEvent = emitPresenceEvent;
  static emitNotificationEvent = emitNotificationEvent;
  static emitNotificationCount = emitNotificationCount;
  static emitCustomEvent = emitCustomEvent;
  static emitContactEvent = emitContactEvent;
  static emitUserEvent = emitUserEvent;
  static emitWhatsappEvent = emitWhatsappEvent;
}

export default SocketEmitter;