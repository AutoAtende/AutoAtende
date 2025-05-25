import { proto } from "bail-lite";
import { Session } from "../../../../../libs/wbot";
import Ticket from "../../../../../models/Ticket";
import Contact from "../../../../../models/Contact";
import Message from "../../../../../models/Message";
import FlowBuilder from "../../../../../models/FlowBuilder";
import FlowBuilderExecution from "../../../../../models/FlowBuilderExecution";
import QueueIntegrations from "../../../../../models/QueueIntegrations";
import ShowQueueIntegrationService from "../../../../QueueIntegrationServices/ShowQueueIntegrationService";
import ExecuteFlowBuilderService from "../../../../FlowBuilderService/ExecuteFlowBuilderService";
import { logger } from "../../../../../utils/logger";
import { getBodyMessage } from "../../Get/GetBodyMessage";
import formatBody from "../../../../../helpers/Mustache";
import { verifyMessage } from "../../Verifiers/VerifyMessage";
import { getWbot } from "../../../../../libs/wbot";
import UpdateFlowVariableService from "../../../../FlowBuilderService/UpdateFlowVariableService";
import ProcessQuestionResponseService from "../../../../FlowBuilderService/ProcessQuestionResponseService";
import ProcessQuestionResponseMediaService from "../../../../FlowBuilderService/ProcessQuestionResponseMediaService";
import ProcessMenuResponseService from "../../../../FlowBuilderService/ProcessMenuResponseService";
import FindOrCreateATicketTrakingService from "../../../../TicketServices/FindOrCreateATicketTrakingService";

export const handleFlowBuilder = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  queueIntegration?: QueueIntegrations
): Promise<boolean> => {
  try {
    logger.info(`[FLOWBUILDER] Iniciando processamento para ticket ${ticket.id}`);

    if (ticket.status === "open") {
      logger.info(`[FLOWBUILDER] Ticket ${ticket.id} está em atendimento (status open). Ignorando processamento.`);
      
      // Buscar e finalizar qualquer execução ativa
      const activeExecutions = await FlowBuilderExecution.findAll({
        where: {
          contactId: contact.id,
          companyId: ticket.companyId,
          status: "active"
        }
      });
      
      if (activeExecutions.length > 0) {
        logger.info(`[FLOWBUILDER] Finalizando ${activeExecutions.length} execuções ativas para o ticket ${ticket.id}`);
        
        for (const execution of activeExecutions) {
          await execution.update({
            status: "completed",
            variables: {
              ...execution.variables,
              __terminatedByHumanAgent: true
            }
          });
        }
      }
      
      return false;
    }

    if (ticket.appointmentMode && ticket.updatedAt) {
      const lastUpdate = new Date(ticket.updatedAt).getTime();
      const now = new Date().getTime();
      const minutesSinceLastUpdate = (now - lastUpdate) / (1000 * 60);
      
      // Se estiver travado por mais de 15 minutos, liberar o ticket
      if (minutesSinceLastUpdate > 15) {
        logger.info(`[APPOINTMENT_CHATBOT] Liberando ticket ${ticket.id} travado em modo de agendamento por ${minutesSinceLastUpdate.toFixed(0)} minutos`);
        await ticket.update({
          appointmentMode: false,
          useIntegration: false,
          isBot: false,
          chatbot: false,
          flowExecutionId: null,
          flowExecution: null,
          integrationId: null,
        });

        await ticket.reload();
      }
    }

    if (ticket.appointmentMode === true) {
      logger.info(`[FLOWBUILDER] Ticket ${ticket.id} está em modo de agendamento, ignorando processamento pelo FlowBuilder`);
      
      // Se a mensagem não foi enviada pelo próprio bot, processar com o sistema de agendamento
      if (!msg.key.fromMe) {
        logger.info(`[APPOINTMENT_CHATBOT] Processando mensagem para ticket ${ticket.id} em modo de agendamento`);
        
        // Importar e chamar o handler de agendamento
        const handleAppointmentChatbot = require("../HandleAppointmentChatbot").default;
        
        // Processar a mensagem com o sistema de agendamento
        await handleAppointmentChatbot.execute(msg, ticket, contact, wbot);
      }
      
      return true;
    }

    // Se não foi informada uma integração, tenta buscar pela associada ao ticket
    if (!queueIntegration && ticket.integrationId) {
      logger.info(`[FLOWBUILDER] Buscando integração ${ticket.integrationId} do ticket`);
      const { default: ShowQueueIntegrationService } = await import(
        "../../../../QueueIntegrationServices/ShowQueueIntegrationService"
      );
      queueIntegration = await ShowQueueIntegrationService(
        ticket.integrationId,
        ticket.companyId
      );
    }

    // Verifica se é uma integração de tipo flowbuilder
    if (!queueIntegration || queueIntegration.type !== "flowbuilder") {
      logger.info(`[FLOWBUILDER] Integração não é do tipo flowbuilder ou não foi encontrada`);
      return false;
    }

    // Obter o ID do fluxo a partir da configuração da integração
    const flowId = parseInt(queueIntegration.jsonContent || "0", 10);
    if (!flowId) {
      logger.error(`[FLOWBUILDER] ID do fluxo não encontrado na integração ${queueIntegration.id}`);
      return false;
    }

    // Verificar se o fluxo existe
    const flow = await FlowBuilder.findByPk(flowId);
    if (!flow) {
      logger.error(`[FLOWBUILDER] Fluxo ID ${flowId} não encontrado`);
      return false;
    }

    logger.info(`[FLOWBUILDER] Fluxo encontrado: ${flow.name} (ID: ${flow.id})`);

    // Verificar se já existe uma execução ativa para este ticket
    let execution = await FlowBuilderExecution.findOne({
      where: {
        contactId: contact.id,
        companyId: ticket.companyId,
        status: "active"
      }
    });

    // Se existe uma execução pendente, processar a resposta
    if (execution) {
      logger.info(`[FLOWBUILDER] Execução ativa encontrada: ${execution.id}`);
      
      // IMPORTANTE: Atualizar timestamp de interação sempre que há uma mensagem do usuário
      await execution.update({
        lastInteractionAt: new Date(),
        inactivityStatus: 'active',
        inactivityWarningsSent: 0,
        lastWarningAt: null
      });
      
      // IMPORTANTE: Verificar timeout - se passou muito tempo desde a última pergunta
      if (execution.variables && execution.variables.__awaitingResponse) {
        const lastQuestionTime = execution.variables.__lastQuestionTimestamp;
        
        if (lastQuestionTime) {
          const now = Date.now();
          const timeSinceQuestion = (now - lastQuestionTime) / 1000 / 60; // em minutos
          
          // Se passou mais de 30 minutos desde a última pergunta, resetar o fluxo
          if (timeSinceQuestion > 30) {
            logger.info(`[FLOWBUILDER] Timeout detectado. ${timeSinceQuestion.toFixed(0)} minutos desde a última pergunta. Resetando fluxo.`);
            
            // Resetar as variáveis de aguardando resposta
            const updatedVariables = {
              ...execution.variables,
              __awaitingResponse: false,
              __awaitingResponseFor: null,
              __responseValidation: null,
              __validationAttempts: 0,
              __lastQuestionTimestamp: null
            };
            
            await execution.update({
              variables: updatedVariables,
              status: "completed" // Finalizar a execução atual
            });
            
            // O fluxo será reiniciado abaixo como uma nova execução
            execution = null;
          }
        }
      }
      
      // Se ainda está aguardando resposta (não deu timeout), processar a resposta
      if (execution && execution.variables && execution.variables.__awaitingResponse) {
        logger.info(`[FLOWBUILDER] Execução aguardando resposta para a variável: ${execution.variables.__awaitingResponseFor}`);
        
        // Processar a resposta baseado no tipo de mensagem
        const hasMedia = (
          msg.message?.imageMessage ||
          msg.message?.documentMessage ||
          msg.message?.videoMessage ||
          msg.message?.audioMessage
        );

        let responseResult;
        
        if (hasMedia) {
          // Processar resposta de mídia
          logger.info(`[FLOWBUILDER] Processando resposta de mídia`);
          
          // Buscar ou criar a mensagem no banco de dados
          const messageBody = getBodyMessage(msg) || "";
          const messageModel = await Message.findOne({
            where: { id: msg.key.id, companyId: ticket.companyId }
          });
          
          if (!messageModel) {
            logger.warn(`[FLOWBUILDER] Mensagem de mídia não encontrada no banco de dados`);
            return false;
          }
          
          const mediaInfo = await ProcessQuestionResponseMediaService({
            message: messageModel,
            companyId: ticket.companyId
          });
          
          responseResult = await ProcessQuestionResponseService({
            executionId: execution.id,
            companyId: ticket.companyId,
            response: messageBody,
            mediaInfo
          });
        } else if (execution.variables.__responseValidation?.inputType === 'menu') {
          // Processar resposta de menu
          logger.info(`[FLOWBUILDER] Processando resposta de menu`);
          responseResult = await ProcessMenuResponseService({
            executionId: execution.id,
            companyId: ticket.companyId,
            response: getBodyMessage(msg) || ""
          });
        } else {
          // Processar resposta de texto
          logger.info(`[FLOWBUILDER] Processando resposta de texto`);
          responseResult = await ProcessQuestionResponseService({
            executionId: execution.id,
            companyId: ticket.companyId,
            response: getBodyMessage(msg) || ""
          });
        }
        
        // Se a resposta é válida ou forçando avanço, continuar o fluxo
        if (responseResult.isValid || responseResult.forceAdvance) {
          logger.info(`[FLOWBUILDER] Resposta ${responseResult.isValid ? 'válida' : 'forçando avanço após tentativas'}, continuando fluxo`);
          
          // Se há um ID de próximo nó específico, atualizar a execução
          if (responseResult.nextNodeId) {
            logger.info(`[FLOWBUILDER] Atualizando execução para o próximo nó: ${responseResult.nextNodeId}`);
            await execution.update({
              currentNodeId: responseResult.nextNodeId
            });
          }
          
          // Continuar a execução do fluxo a partir do estado atual
          await ExecuteFlowBuilderService({
            flowId: flow.id,
            contactId: contact.id,
            wbotId: wbot.id!,
            companyId: ticket.companyId,
            whatsappId: ticket.whatsappId,
            initialNodeId: responseResult.nextNodeId || execution.currentNodeId, // Usar o nó atual ou o próximo
            ticketId: ticket.id
          });
          
          return true;
        } else {
          // Se a resposta não é válida, enviar mensagem de erro
          logger.info(`[FLOWBUILDER] Resposta inválida: ${responseResult.message}`);
          
          // Obter a instância do wbot
          const wbotInstance = await getWbot(ticket.whatsappId);
          
          // Obter o número de tentativas atual e incrementar
          const currentAttempts = execution.variables.__validationAttempts || 0;
          const newAttempts = currentAttempts + 1;
          const remainingAttempts = 3 - newAttempts;
          
          // Atualizar o contador de tentativas na execução
          await execution.update({
            variables: {
              ...execution.variables,
              __validationAttempts: newAttempts,
              __lastQuestionTimestamp: Date.now() // Atualizar timestamp para timeout
            }
          });
          
          // Se já atingiu o limite de tentativas, forçar o avanço do fluxo
          if (newAttempts >= 3) {
            logger.info(`[FLOWBUILDER] Limite de tentativas atingido. Forçando avanço do fluxo.`);
            
            // Processar novamente com forceAdvance = true
            const forceAdvanceResult = await ProcessQuestionResponseService({
              executionId: execution.id,
              companyId: ticket.companyId,
              response: getBodyMessage(msg) || ""
            });
            
            // Continuar a execução do fluxo
            await ExecuteFlowBuilderService({
              flowId: flow.id,
              contactId: contact.id,
              wbotId: wbot.id!,
              companyId: ticket.companyId,
              whatsappId: ticket.whatsappId,
              initialNodeId: forceAdvanceResult.nextNodeId,
              ticketId: ticket.id
            });
            
            return true;
          }
          
          // Adicionar informação sobre tentativas restantes à mensagem de erro
          let errorMsg = responseResult.message;
          if (remainingAttempts > 0) {
            errorMsg += `\n\nVocê tem mais ${remainingAttempts} ${remainingAttempts === 1 ? 'tentativa' : 'tentativas'}.`;
          }
          
          // Enviar mensagem de erro formatada
          const errorMessage = await wbotInstance.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            {
              text: formatBody(`\u200e${errorMsg}`, ticket)
            }
          );
          
          // Registrar a mensagem no sistema
          await verifyMessage(errorMessage, ticket, contact);
          return true;
        }
      }
      
      // Se existe uma execução mas não está aguardando resposta, continuar normalmente
      if (execution) {
        logger.info(`[FLOWBUILDER] Continuando execução existente`);
        await ExecuteFlowBuilderService({
          flowId: flow.id,
          contactId: contact.id,
          wbotId: wbot.id!,
          companyId: ticket.companyId,
          whatsappId: ticket.whatsappId,
          ticketId: ticket.id
        });
        
        return true;
      }
    }
    
    // Caso não exista uma execução ou deu timeout, iniciar uma nova
    logger.info(`[FLOWBUILDER] Iniciando nova execução do fluxo`);
    
    // Marcar ticket para usar integração
    await ticket.update({
      useIntegration: true,
      integrationId: queueIntegration.id,
      isBot: true
      
    });
    
    // Processar comandos especiais
    const messageBody = getBodyMessage(msg);
    
    // Se a mensagem for "#", reiniciar o fluxo
    if (messageBody === "#") {
      logger.info(`[FLOWBUILDER] Comando # detectado, reiniciando fluxo`);
      
      // Buscar execuções ativas e encerrá-las
      const activeExecutions = await FlowBuilderExecution.findAll({
        where: {
          contactId: contact.id,
          companyId: ticket.companyId,
          status: "active"
        }
      });
      
      for (const exec of activeExecutions) {
        await exec.update({ status: "completed" });
      }
    }
    
    // Registrar tracking para o fluxo
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId: ticket.companyId,
      whatsappId: ticket.whatsappId
    });

    await ticketTraking.update({
      updatedAt: new Date()
    });
    
    // Iniciar o fluxo
    const initialVariables = {
      contactName: contact.name,
      contactNumber: contact.number,
      ticketId: ticket.id,
      lastMessage: messageBody
    };
    
    logger.info(`[FLOWBUILDER] Iniciando execução com variáveis iniciais`, initialVariables);
    
    await ExecuteFlowBuilderService({
      flowId: flow.id,
      contactId: contact.id,
      wbotId: wbot.id!,
      companyId: ticket.companyId,
      whatsappId: ticket.whatsappId,
      initialVariables,
      ticketId: ticket.id
    });
    
    return true;
  } catch (error) {
    logger.error(`[FLOWBUILDER] Erro ao processar flowbuilder: ${error.message}`, {
      error: error.stack,
      ticketId: ticket.id
    });
    
    // Em caso de erro, enviar mensagem informando o problema
    try {
      // Obter a instância do wbot
      const wbotInstance = await getWbot(ticket.whatsappId);
      
      // Enviar mensagem de erro
      const errorMsg = await wbotInstance.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: formatBody(`Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato com o suporte.`, ticket)
        }
      );
      
      // Registrar a mensagem no sistema
      await verifyMessage(errorMsg, ticket, contact);
    } catch (sendError) {
      logger.error(`[FLOWBUILDER] Erro ao enviar mensagem de erro: ${sendError.message}`);
    }
    
    return false;
  }
};