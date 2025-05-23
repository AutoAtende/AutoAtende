import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import FlowBuilderExecution from "../models/FlowBuilderExecution";
import Contact from "../models/Contact";
import Message from "../models/Message";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import ProcessQuestionResponseService from "../services/FlowBuilderService/ProcessQuestionResponseService";
import ProcessQuestionResponseMediaService from "../services/FlowBuilderService/ProcessQuestionResponseMediaService";
import ProcessMenuResponseService from "../services/FlowBuilderService/ProcessMenuResponseService";
import ExecuteFlowBuilderService from "../services/FlowBuilderService/ExecuteFlowBuilderService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import { Op } from "sequelize";
import Ticket from "../models/Ticket";
import AppError from "../errors/AppError";

// Interfaces para tipagem
interface MessageWebhook {
  body: string;
  from: string;
  fromMe: boolean;
  messageId: string;
  timestamp: number;
  companyId: number;
  mediaUrl?: string;
  mediaType?: string;
}

interface FlowResponseResult {
  isValid: boolean;
  message?: string;
  nextNodeId?: string;
  optionId?: string;
}

export const handleFlowMessage = async (messageData: MessageWebhook): Promise<void> => {
  try {
    const { body, from, fromMe, companyId, messageId } = messageData;
    
    // Ignorar mensagens enviadas pelo próprio sistema
    if (fromMe) {
      return;
    }

    // Define o whatsapp que será utilizado
    const whatsappId = await GetDefaultWhatsApp(companyId);
    
    // Extrair número do contato
    const contactNumber = from.replace(/\D/g, "");
    
    // Buscar contato no banco de dados
    const contact = await Contact.findOne({
      where: { number: contactNumber, companyId }
    });
    
    if (!contact) {
      logger.warn(`Contato não encontrado para mensagem: ${contactNumber}`);
      return;
    }
    
    // Verificar se há uma execução ativa aguardando resposta
    const execution = await FlowBuilderExecution.findOne({
      where: {
        contactId: contact.id,
        companyId,
        status: "active",
        variables: {
          [Op.and]: [
            { __awaitingResponse: true }
          ]
        }
      }
    });
    
    if (!execution) {
      // Não há execução ativa aguardando resposta
      return;
    }
    
    logger.info(`Processando resposta para execução ${execution.id}, contato ${contact.id}`);
    
    // IMPORTANTE: Atualizar timestamp de última interação na execução
    // Isso é fundamental para o sistema de inatividade
    await execution.update({
      lastInteractionAt: new Date(),
      inactivityStatus: 'active',
      inactivityWarningsSent: 0,
      lastWarningAt: null
    });
    
    // Buscar a mensagem completa para verificar se contém mídia
    const message = await Message.findOne({
      where: { id: messageId }
    });
    
    // Verificar se há um ticket relacionado ao contato
    const ticket = await Ticket.findOne({
      where: {
        contactId: contact.id,
        status: ["open", "pending"],
        companyId
      }
    });
    
    // Ticket fake para envio de mensagens
    const ticketObj = ticket || {
      contact,
      whatsappId: whatsappId,
      isGroup: false
    };
    
    // Verificar o tipo de entrada esperada
    const inputType = execution.variables.__responseValidation?.inputType;
    
    // Processar com base no tipo de entrada
    let result: FlowResponseResult;
    
    switch (inputType) {
      case 'menu':
        result = await ProcessMenuResponseService({
          executionId: execution.id,
          companyId,
          response: body
        });
        break;
        
      case 'options':
      case 'text':
      case 'number':
      case 'email':
      case 'phone':
      default:
        // Processar informações de mídia se existirem
        let mediaInfo = {};
        if (message && message.mediaUrl) {
          mediaInfo = await ProcessQuestionResponseMediaService({
            message,
            companyId
          });
        }
        
        // Processar a resposta padrão
        result = await ProcessQuestionResponseService({
          executionId: execution.id,
          companyId,
          response: body,
          mediaInfo
        });
        break;
    }
    
    // Se a resposta não for válida
    if (!result.isValid) {
      // Enviar mensagem de erro
      await SendWhatsAppMessage({
        body: result.message || "Resposta inválida. Por favor, tente novamente.",
        ticket: ticketObj as any
      });
      return;
    }
    
    // Se houver ticket em andamento, atualizar o status de fluxo
    if (ticket && ticket.flowExecutionId === execution.id) {
      // Atualizar informações no ticket
      await ticket.update({
        lastMessage: body
      });
    }
    
    // Continuar a execução do fluxo
    try {
      if (result.nextNodeId) {
        // Se houver um nó específico para seguir
        await ExecuteFlowBuilderService({
          flowId: execution.flowId,
          contactId: contact.id,
          wbotId: Number(whatsappId),
          companyId,
          initialNodeId: result.nextNodeId,
          whatsappId: Number(whatsappId)
        });
      } else {
        // Continuar do próximo nó após o atual
        await ExecuteFlowBuilderService({
          flowId: execution.flowId,
          contactId: contact.id,
          wbotId: Number(whatsappId),
          companyId,
          whatsappId: Number(whatsappId)
        });
      }
    } catch (executionError) {
      logger.error(`Erro ao continuar execução do fluxo: ${executionError.message}`);
      
      // Enviar mensagem de erro para o usuário
      await SendWhatsAppMessage({
        body: "Desculpe, ocorreu um erro ao processar sua resposta. Por favor, tente novamente mais tarde.",
        ticket: ticketObj as any
      });
      
      // Atualizar a execução para status de erro
      await execution.update({
        status: "error",
        errorMessage: executionError.message
      });
    }
    
    // Emitir evento via socket para atualização da interface
    const io = getIO();
    io.to(`company-${companyId}-notification`).emit("flowExecution", {
      action: "update",
      execution: {
        id: execution.id,
        status: "running",
        contactId: contact.id,
        flowId: execution.flowId
      }
    });
  } catch (error) {
    logger.error(`Erro ao processar mensagem para fluxo: ${error.message}`);
  }
};

export const resumeFlow = async (req: Request, res: Response): Promise<Response> => {
  const { executionId } = req.params;
  const { companyId } = req.user;
  const { nextNodeId, variables } = req.body;
  
  try {
    // Buscar execução
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId }
    });
    
    if (!execution) {
      return res.status(404).json({ error: "Execução não encontrada" });
    }
    
    // Verificar status atual
    if (execution.status !== "active" && execution.status !== "paused") {
      return res.status(400).json({ error: `A execução não pode ser retomada do status atual (${execution.status})` });
    }
    
    // Se a execução estiver pausada, atualizar para ativa
    if (execution.status === "paused") {
      await execution.update({
        status: "active",
        lastInteractionAt: new Date(), // Atualizar timestamp de interação
        inactivityStatus: 'active', // Resetar status de inatividade
        inactivityWarningsSent: 0, // Resetar contador de avisos
        lastWarningAt: null // Limpar último aviso
      });
    }
    
    // Se houver variáveis a atualizar, fazer isso primeiro
    if (variables && typeof variables === "object") {
      const updatedVariables = {
        ...execution.variables,
        ...variables
      };
      
      await execution.update({
        variables: updatedVariables
      });
    }
    
    // Continuar a execução do fluxo
    const whatsappId = await GetDefaultWhatsApp(companyId);
    await ExecuteFlowBuilderService({
      flowId: execution.flowId,
      contactId: execution.contactId,
      wbotId: Number(whatsappId),
      companyId,
      initialNodeId: nextNodeId || execution.currentNodeId,
      whatsappId: Number(whatsappId)
    });
    
    return res.status(200).json({ message: "Fluxo retomado com sucesso" });
  } catch (error) {
    logger.error(`Erro ao retomar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const pauseFlow = async (req: Request, res: Response): Promise<Response> => {
  const { executionId } = req.params;
  const { companyId } = req.user;
  const { reason } = req.body;
  
  try {
    // Buscar execução
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId }
    });
    
    if (!execution) {
      return res.status(404).json({ error: "Execução não encontrada" });
    }
    
    if (execution.status !== "active") {
      return res.status(400).json({ error: "A execução não está ativa" });
    }
    
    // Atualizar status para pausado
    const updatedVariables = {
      ...execution.variables,
      __pauseReason: reason || "Pausa manual",
      __pausedAt: Date.now()
    };
    
    await execution.update({
      status: "paused",
      variables: updatedVariables,
      inactivityStatus: 'inactive', // Marcar como inativo quando pausado
      inactivityReason: reason || "Pausa manual"
    });
    
    // Notificar clientes conectados sobre a pausa
    const io = getIO();
    io.to(`company-${companyId}-notification`).emit("flowExecution", {
      action: "update",
      execution: {
        id: execution.id,
        status: "paused",
        contactId: execution.contactId,
        flowId: execution.flowId
      }
    });
    
    return res.status(200).json({ 
      message: "Fluxo pausado com sucesso",
      execution: {
        id: execution.id,
        status: "paused"
      }
    });
  } catch (error) {
    logger.error(`Erro ao pausar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const cancelFlow = async (req: Request, res: Response): Promise<Response> => {
  const { executionId } = req.params;
  const { companyId } = req.user;
  const { reason } = req.body;
  
  try {
    // Buscar execução
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId }
    });
    
    if (!execution) {
      return res.status(404).json({ error: "Execução não encontrada" });
    }
    
    // Verificar status atual
    if (execution.status === "completed" || execution.status === "canceled") {
      return res.status(400).json({ error: `A execução já está finalizada (${execution.status})` });
    }
    
    // Atualizar variáveis e status
    const updatedVariables = {
      ...execution.variables,
      __cancelReason: reason || "Cancelamento manual",
      __canceledAt: Date.now()
    };
    
    await execution.update({
      status: "canceled",
      variables: updatedVariables,
      inactivityStatus: 'inactive', // Marcar como inativo quando cancelado
      inactivityReason: reason || "Cancelamento manual"
    });
    
    // Buscar ticket associado à execução
    const ticket = await Ticket.findOne({
      where: {
        flowExecutionId: execution.id,
        contactId: execution.contactId,
        companyId
      }
    });
    
    // Se houver um ticket associado, enviar mensagem de encerramento
    if (ticket && (ticket.status === "open" || ticket.status === "pending")) {
      await SendWhatsAppMessage({
        body: "O fluxo automatizado foi encerrado pelo sistema.",
        ticket: ticket as any
      });
    }
    
    // Notificar clientes conectados sobre o cancelamento
    const io = getIO();
    io.to(`company-${companyId}-notification`).emit("flowExecution", {
      action: "update",
      execution: {
        id: execution.id,
        status: "canceled",
        contactId: execution.contactId,
        flowId: execution.flowId
      }
    });
    
    return res.status(200).json({ 
      message: "Fluxo cancelado com sucesso",
      execution: {
        id: execution.id,
        status: "canceled"
      }
    });
  } catch (error) {
    logger.error(`Erro ao cancelar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const listFlowExecutions = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { contactId, flowId, status, pageNumber = 1, pageSize = 20 } = req.query;
  
  try {
    // Preparar filtros
    const filters: any = { companyId };
    
    if (contactId) {
      filters.contactId = contactId;
    }
    
    if (flowId) {
      filters.flowId = flowId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    // Calcular offset para paginação
    const offset = (Number(pageNumber) - 1) * Number(pageSize);
    
    // Buscar execuções com paginação
    const { count, rows: executions } = await FlowBuilderExecution.findAndCountAll({
      where: filters,
      limit: Number(pageSize),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Contact, as: 'contact', attributes: ['id', 'name', 'number'] }
      ]
    });
    
    return res.status(200).json({
      executions,
      count,
      hasMore: count > offset + executions.length
    });
  } catch (error) {
    logger.error(`Erro ao listar execuções de fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getFlowExecution = async (req: Request, res: Response): Promise<Response> => {
  const { executionId } = req.params;
  const { companyId } = req.user;
  
  try {
    // Buscar execução com detalhes
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId },
      include: [
        { model: Contact, as: 'contact' }
      ]
    });
    
    if (!execution) {
      return res.status(404).json({ error: "Execução não encontrada" });
    }
    
    return res.status(200).json(execution);
  } catch (error) {
    logger.error(`Erro ao obter detalhes da execução: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Adicionar esta função ao FlowMessageReceiverController.ts

export const forceEndExecution = async (req: Request, res: Response): Promise<Response> => {
  const { executionId } = req.params;
  const { companyId } = req.user;
  const { reason = "Encerramento forçado pelo administrador" } = req.body;
  
  try {
    // Buscar execução
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId }
    });
    
    if (!execution) {
      return res.status(404).json({ error: "Execução não encontrada" });
    }
    
    // Verificar status atual
    if (execution.status === "completed" || execution.status === "canceled") {
      return res.status(400).json({ error: `A execução já está finalizada (${execution.status})` });
    }
    
    // Atualizar variáveis e status
    const updatedVariables = {
      ...execution.variables,
      __forceEndReason: reason,
      __forceEndAt: Date.now(),
      __forceEndBy: req.user.id
    };
    
    await execution.update({
      status: "completed",
      variables: updatedVariables,
      inactivityStatus: 'inactive',
      inactivityReason: reason
    });
    
    // Buscar ticket associado à execução
    const ticket = await Ticket.findOne({
      where: {
        flowExecutionId: execution.id,
        contactId: execution.contactId,
        companyId
      }
    });
    
    // Se houver um ticket associado, enviar mensagem de encerramento e finalizar
    if (ticket && (ticket.status === "open" || ticket.status === "pending")) {
      await SendWhatsAppMessage({
        body: "O atendimento automatizado foi encerrado pelo sistema.",
        ticket: ticket as any
      });
      
      // Finalizar o fluxo usando o serviço apropriado
      await FinishFlowService({
        ticketId: ticket.id,
        companyId: ticket.companyId,
        executionId: execution.id,
        ticketStatus: "pending",
        flowStatus: "completed"
      });
    }
    
    // Notificar clientes conectados sobre o encerramento
    const io = getIO();
    io.to(`company-${companyId}-notification`).emit("flowExecution", {
      action: "force-end",
      execution: {
        id: execution.id,
        status: "completed",
        contactId: execution.contactId,
        flowId: execution.flowId,
        reason: reason
      }
    });
    
    logger.info(`[ForceEndExecution] Execução ${executionId} encerrada forçadamente: ${reason}`);
    
    return res.status(200).json({ 
      message: "Execução encerrada com sucesso",
      execution: {
        id: execution.id,
        status: "completed",
        reason: reason
      }
    });
  } catch (error) {
    logger.error(`Erro ao encerrar execução forçadamente: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};