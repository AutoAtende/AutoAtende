// ExecuteAppointmentNodeService.ts
import AppError from "../../errors/AppError";
import { proto } from "bail-lite";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Company from "../../models/Company";
import AppointmentNode from "../../models/AppointmentNode";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { logger } from "../../utils/logger";
import handleAppointmentChatbot from "../WbotServices/MessageListener/Handles/HandleAppointmentChatbot";
import { getWbot } from "../../libs/wbot";

interface ExecuteAppointmentNodeParams {
  nodeData: {
    nodeId?: string;
    configuration?: any;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  whatsappId?: number;
  flowExecutionId?: number; // Adicionado para rastrear a execução
  msg?: proto.IWebMessageInfo,
}

const ExecuteAppointmentNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  whatsappId,
  flowExecutionId,
  msg
}: ExecuteAppointmentNodeParams): Promise<boolean> => {
  try {
    logger.info(`Executando nó de agendamento para ticket ${ticket.id}`);
    
    // Usar whatsappId do ticket se não for fornecido
    const whatsappIdToUse = whatsappId || ticket.whatsappId;
    
    // Buscar configuração específica do nó no banco de dados
    const appointmentNode = nodeData.nodeId ? await AppointmentNode.findOne({
      where: {
        nodeId: nodeData.nodeId,
        companyId
      }
    }) : null;
    
    // Marcar o ticket como em modo de agendamento
    await ticket.update({
      useIntegration: true,
      integrationId: ticket.integrationId, // Manter a integração atual
      isBot: true,
      chatbot: true,
      appointmentMode: true // Nova flag para indicar modo de agendamento
    });
    
    // Atualizar a execução do fluxo para indicar que está em modo de agendamento
    if (flowExecutionId) {
      const execution = await FlowBuilderExecution.findByPk(flowExecutionId);
      if (execution) {
        await execution.update({
          variables: {
            ...execution.variables,
            __inAppointmentMode: true,
            __appointmentStartedAt: Date.now()
          }
        });
        
        logger.info(`[APPOINTMENT_NODE] Execução ${flowExecutionId} marcada como em modo de agendamento`);
      }
    }
    
    // Obter instância do bot
    const wbot = await getWbot(whatsappIdToUse);
    
    // Inicializar o chatbot de agendamento
    // Passando null como msg para indicar início automático sem uma mensagem específica
    await handleAppointmentChatbot.execute(null, ticket, contact, wbot);
    
    // O nó é terminal (sempre para o fluxo)
    // O fluxo será retomado/finalizado pelo próprio handleAppointmentChatbot quando necessário
    return false;
  } catch (error) {
    logger.error(`Erro ao executar nó de agendamento: ${error.message}`);
    throw error;
  }
};

export default ExecuteAppointmentNodeService;