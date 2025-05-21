// services/FlowBuilderService/InactivityMonitorService.ts
import { Op } from "sequelize";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import FlowBuilder from "../../models/FlowBuilder";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";
import formatBody from "../../helpers/Mustache";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import ReengagementService from "./ReengagementService";
import FinishFlowService from "./FinishFlowService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";

// Interface para os dados necessários de FlowBuilder
interface FlowConfig {
  generalInactivityTimeout: number;
  questionInactivityTimeout: number;
  menuInactivityTimeout: number;
  inactivityAction: string;
  inactivityWarningMessage: string;
  inactivityEndMessage: string;
  inactivityTransferQueueId: number;
  maxInactivityWarnings: number;
  warningInterval: number;
}

// Classe responsável por monitorar e agir sobre inatividade
class InactivityMonitorService {
  // Método principal para verificar execuções inativas
  public static async checkInactiveExecutions(): Promise<void> {
    try {
      logger.info("[InactivityMonitor] Iniciando verificação de execuções inativas");
      
      // Buscar todas as execuções ativas
      const activeExecutions = await FlowBuilderExecution.findAll({
        where: {
          status: "active"
        },
        include: [
          {
            model: FlowBuilder,
            as: "flow"
          },
          {
            model: Contact,
            as: "contact"
          }
        ]
      });
      
      logger.info(`[InactivityMonitor] ${activeExecutions.length} execuções ativas encontradas`);
      
      // Processar cada execução
      for (const execution of activeExecutions) {
        try {
          await this.processExecution(execution);
        } catch (error) {
          logger.error(`[InactivityMonitor] Erro ao processar execução ${execution.id}: ${error.message}`);
        }
      }
      
      logger.info("[InactivityMonitor] Verificação de execuções inativas concluída");
    } catch (error) {
      logger.error(`[InactivityMonitor] Erro ao verificar execuções inativas: ${error.message}`);
    }
  }
  
  // Método para processar uma execução específica
  private static async processExecution(execution: FlowBuilderExecution): Promise<void> {
    // Pular execuções que já estão marcadas como inativas
    if (execution.status !== "active") {
      return;
    }
    
    // Extrair configurações do fluxo ou usar valores padrão
    const flowConfig: FlowConfig = {
      generalInactivityTimeout: execution.flow?.generalInactivityTimeout || 300,
      questionInactivityTimeout: execution.flow?.questionInactivityTimeout || 180,
      menuInactivityTimeout: execution.flow?.menuInactivityTimeout || 180,
      inactivityAction: execution.flow?.inactivityAction || 'warning',
      inactivityWarningMessage: execution.flow?.inactivityWarningMessage || 'Você está aí? Nosso atendimento automatizado está aguardando sua resposta.',
      inactivityEndMessage: execution.flow?.inactivityEndMessage || 'Não recebemos sua resposta. O atendimento automatizado será encerrado.',
      inactivityTransferQueueId: execution.flow?.inactivityTransferQueueId || null,
      maxInactivityWarnings: execution.flow?.maxInactivityWarnings || 2,
      warningInterval: execution.flow?.warningInterval || 60
    };
    
    // Determinar o tipo de timeout apropriado para o nó atual
    const timeoutSeconds = this.determineTimeout(execution, flowConfig);
    
    // Verificar última interação
    const lastInteraction = execution.lastInteractionAt || execution.updatedAt || execution.createdAt;
    const now = new Date();
    const secondsSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / 1000;
    
    // Obter ticket relacionado à execução
    const ticket = await Ticket.findOne({
      where: {
        contactId: execution.contactId,
        status: ["pending", "open"],
        flowExecutionId: execution.id
      },
      include: [
        {
          model: Contact,
          as: "contact"
        }
      ]
    });
    
    if (!ticket) {
      logger.warn(`[InactivityMonitor] Ticket não encontrado para execução ${execution.id}`);
      // Marcar execução como inativa se não houver ticket associado
      await execution.update({
        status: "completed",
        inactivityStatus: "inactive",
        inactivityReason: "Ticket não encontrado"
      });
      return;
    }
    
    // Atualizar TicketTraking
    await this.updateTicketTracking(ticket);
    
    // Verificar se o ticket está em atendimento humano
    if (ticket.status === "open" && ticket.userId) {
      logger.info(`[InactivityMonitor] Execução ${execution.id} está em atendimento humano, ignorando verificação de inatividade`);
      return;
    }
    
    // Processar com base no estado atual de inatividade
    switch (execution.inactivityStatus) {
      case 'active':
        await this.handleActiveState(execution, ticket, secondsSinceLastInteraction, timeoutSeconds, flowConfig);
        break;
        
      case 'warning':
        await this.handleWarningState(execution, ticket, secondsSinceLastInteraction, flowConfig);
        break;
        
      case 'reengaging':
        await this.handleReengagingState(execution, ticket, secondsSinceLastInteraction, flowConfig);
        break;
        
      default:
        // Nada a fazer para outros estados
        break;
    }
  }
  
  // Determinar qual timeout usar com base no tipo de nó
  private static determineTimeout(execution: FlowBuilderExecution, config: FlowConfig): number {
    if (!execution.variables) {
      return config.generalInactivityTimeout;
    }
    
    // Se estiver aguardando resposta de pergunta
    if (execution.variables.__awaitingResponse && execution.variables.__responseValidation) {
      if (execution.variables.__responseValidation.inputType === 'menu') {
        return config.menuInactivityTimeout;
      } else {
        return config.questionInactivityTimeout;
      }
    }
    
    return config.generalInactivityTimeout;
  }
  
  // Lidar com execução em estado ativo
  private static async handleActiveState(
    execution: FlowBuilderExecution,
    ticket: Ticket,
    secondsSinceLastInteraction: number,
    timeoutSeconds: number,
    config: FlowConfig
  ): Promise<void> {
    // Verificar se passou do tempo limite
    if (secondsSinceLastInteraction > timeoutSeconds) {
      logger.info(`[InactivityMonitor] Execução ${execution.id} está inativa há ${secondsSinceLastInteraction} segundos`);
      
      // Atualizar estado para warning
      await execution.update({
        inactivityStatus: 'warning',
        inactivityWarningsSent: 1,
        lastWarningAt: new Date()
      });
      
      // Enviar mensagem de aviso
      await this.sendInactivityMessage(
        ticket,
        config.inactivityWarningMessage || 'Você está aí? Nosso atendimento automatizado está aguardando sua resposta.'
      );
    }
  }
  
  // Lidar com execução em estado de aviso
  private static async handleWarningState(
    execution: FlowBuilderExecution,
    ticket: Ticket,
    secondsSinceLastInteraction: number,
    config: FlowConfig
  ): Promise<void> {
    const secondsSinceLastWarning = (new Date().getTime() - execution.lastWarningAt.getTime()) / 1000;
    
    // Verificar se é hora de enviar outro aviso
    if (secondsSinceLastWarning > config.warningInterval && 
        execution.inactivityWarningsSent < config.maxInactivityWarnings) {
      
      logger.info(`[InactivityMonitor] Enviando aviso ${execution.inactivityWarningsSent + 1}/${config.maxInactivityWarnings} para execução ${execution.id}`);
      
      // Incrementar contador de avisos
      await execution.update({
        inactivityWarningsSent: execution.inactivityWarningsSent + 1,
        lastWarningAt: new Date()
      });
      
      // Enviar mensagem de aviso
      await this.sendInactivityMessage(
        ticket,
        config.inactivityWarningMessage || 'Você está aí? Nosso atendimento automatizado está aguardando sua resposta.'
      );
    }
    // Verificar se já enviou o número máximo de avisos
    else if (execution.inactivityWarningsSent >= config.maxInactivityWarnings) {
      logger.info(`[InactivityMonitor] Máximo de avisos atingido para execução ${execution.id}, iniciando ação configurada: ${config.inactivityAction}`);
      
      // Atualizar estado para reengaging
      await execution.update({
        inactivityStatus: 'reengaging'
      });
      
      // Executar ação configurada
      await this.executeInactivityAction(execution, ticket, config);
    }
  }
  
  // Lidar com execução em estado de reengajamento
  private static async handleReengagingState(
    execution: FlowBuilderExecution,
    ticket: Ticket,
    secondsSinceLastInteraction: number,
    config: FlowConfig
  ): Promise<void> {
    // Verificar se houve interação após tentativa de reengajamento
    if (execution.lastInteractionAt > execution.lastWarningAt) {
      logger.info(`[InactivityMonitor] Usuário respondeu após reengajamento para execução ${execution.id}`);
      
      // Resetar estado para ativo
      await execution.update({
        inactivityStatus: 'active',
        inactivityWarningsSent: 0,
        lastWarningAt: null
      });
    }
    // Se já estamos em reengaging, verificar se já passou um tempo adicional
    else if (secondsSinceLastInteraction > (config.generalInactivityTimeout * 2)) {
      logger.info(`[InactivityMonitor] Execução ${execution.id} permanece inativa após reengajamento`);
      
      // Marcar como inativa
      await execution.update({
        status: "completed",
        inactivityStatus: "inactive",
        inactivityReason: "Sem resposta após tentativas de reengajamento"
      });
      
      // Enviar mensagem de encerramento
      await this.sendInactivityMessage(
        ticket,
        config.inactivityEndMessage || 'Não recebemos sua resposta. O atendimento automatizado será encerrado.'
      );
      
      // Finalizar fluxo
      await FinishFlowService({
        ticketId: ticket.id,
        companyId: ticket.companyId,
        executionId: execution.id,
        ticketStatus: "pending",
        flowStatus: "completed"
      });
    }
  }
  
  // Executar ação configurada para inatividade
  private static async executeInactivityAction(
    execution: FlowBuilderExecution,
    ticket: Ticket,
    config: FlowConfig
  ): Promise<void> {
    switch (config.inactivityAction) {
      case 'warning':
        // Já enviamos avisos, continuar monitorando
        break;
        
      case 'end':
        // Finalizar o fluxo
        await execution.update({
          status: "completed",
          inactivityStatus: "inactive",
          inactivityReason: "Finalizado por inatividade"
        });
        
        // Enviar mensagem de encerramento
        await this.sendInactivityMessage(
          ticket,
          config.inactivityEndMessage || 'Não recebemos sua resposta. O atendimento automatizado será encerrado.'
        );
        
        // Finalizar fluxo
        await FinishFlowService({
          ticketId: ticket.id,
          companyId: ticket.companyId,
          executionId: execution.id,
          ticketStatus: "pending",
          flowStatus: "completed"
        });
        break;
        
      case 'transfer':
        // Transferir para fila ou atendente
        await execution.update({
          status: "completed",
          inactivityStatus: "inactive",
          inactivityReason: "Transferido por inatividade",
          transferredToQueueId: config.inactivityTransferQueueId
        });
        
        // Enviar mensagem de transferência
        await this.sendInactivityMessage(
          ticket,
          'Percebemos que você está inativo. Vamos transferir seu atendimento para um de nossos atendentes.'
        );
        
        // Atualizar ticket para fila de transferência
        if (config.inactivityTransferQueueId) {
          await UpdateTicketService({
            ticketData: {
              status: "pending",
              queueId: config.inactivityTransferQueueId,
              userId: null,
              flowExecutionId: null,
              useIntegration: false,
              chatbot: false,
              amountUsedBotQueues: null
            },
            ticketId: ticket.id,
            companyId: ticket.companyId
          });
        }
        break;
        
      case 'reengage':
        // Tentar reengajar usando ReengagementService
        await ReengagementService.attemptReengagement(execution, ticket);
        break;
        
      default:
        // Ação desconhecida, usar comportamento padrão (warning)
        logger.warn(`[InactivityMonitor] Ação desconhecida: ${config.inactivityAction}`);
        break;
    }
  }
  
  // Enviar mensagem de inatividade
  private static async sendInactivityMessage(ticket: Ticket, message: string): Promise<void> {
    try {
      const wbot = await getWbot(ticket.whatsappId);
      const sentMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        { text: formatBody(message, ticket) }
      );
      
      // Registrar a mensagem no sistema
      await verifyMessage(sentMessage, ticket, ticket.contact);
      
      logger.info(`[InactivityMonitor] Mensagem de inatividade enviada para ticket ${ticket.id}`);
    } catch (error) {
      logger.error(`[InactivityMonitor] Erro ao enviar mensagem de inatividade: ${error.message}`);
    }
  }
  
  // Atualizar TicketTracking
  private static async updateTicketTracking(ticket: Ticket): Promise<void> {
    try {
      // Buscar ou criar TicketTracking
      const ticketTraking = await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId: ticket.companyId,
        whatsappId: ticket.whatsappId
      });
      
      // Atualizar timestamp
      await ticketTraking.update({
        updatedAt: new Date()
      });
    } catch (error) {
      logger.error(`[InactivityMonitor] Erro ao atualizar TicketTracking: ${error.message}`);
    }
  }
}

export default InactivityMonitorService;