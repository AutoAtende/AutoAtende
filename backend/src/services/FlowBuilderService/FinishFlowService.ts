import { Op } from "sequelize";
import { logger } from "../../utils/logger";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import Ticket from "../../models/Ticket";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";

interface FinishFlowParams {
  ticketId: number;
  companyId: number;
  executionId: number;
  ticketStatus: string;
  flowStatus: string;
}

// FinishFlowService.ts - correção completa

const FinishFlowService = async ({
  ticketId,
  companyId,
  executionId,
  ticketStatus,
  flowStatus
}: FinishFlowParams): Promise<void> => {
  try {
    // Verificar se a execução existe
    const execution = await FlowBuilderExecution.findOne({
      where: {
        id: executionId,
        companyId
      }
    });

    if (!execution) {
      logger.warn(`Execução ${executionId} não encontrada ao finalizar fluxo`);
      return;
    }

    // Verificar se a execução já foi finalizada para evitar processamento duplicado
    if (execution.status !== 'active' && flowStatus === 'completed') {
      logger.info(`Execução ${executionId} já foi finalizada anteriormente com status: ${execution.status}`);
      return;
    }

    // 1. Atualizar o ticket para limpar todos os campos relacionados ao fluxo
    await UpdateTicketService({
      ticketData: {
        status: ticketStatus || "pending",
        appointmentMode: false,
        flowExecutionId: null,
        useIntegration: false,
        integrationId: null,
        chatbot: false,
        amountUsedBotQueues: 0,
        promptId: null,
      },
      ticketId,
      companyId
    });

    // 2. Verificar por outras execuções ativas do mesmo contato e finalizá-las
    const ticket = await Ticket.findByPk(ticketId);
    if (ticket) {
      const otherActiveExecutions = await FlowBuilderExecution.findAll({
        where: {
          id: { [Op.ne]: executionId },
          contactId: ticket.contactId,
          companyId,
          status: "active"
        }
      });

      // Finalizar outras execuções ativas
      for (const otherExecution of otherActiveExecutions) {
        await otherExecution.update({
          status: "completed",
          variables: {
            ...otherExecution.variables,
            __flowTerminatedByOtherExecution: true,
            __inAppointmentMode: false
          }
        });
        logger.info(`Execução ${otherExecution.id} finalizada automaticamente`);
      }
    }

    // 3. Marcar a execução como concluída
    await execution.update({
      status: flowStatus || "completed",
      variables: {
        ...execution.variables,
        __inAppointmentMode: false,
        __finalStatus: ticketStatus || "pending"
      }
    });

    logger.info(`Fluxo finalizado para ticket ${ticketId} com status: ${flowStatus}`);
  } catch (error) {
    logger.error(`Erro ao finalizar fluxo para ticket ${ticketId}: ${error.message}`);
    // Tentar finalizar mesmo com erro
    try {
      await UpdateTicketService({
        ticketData: {
          status: ticketStatus || "pending",
          useIntegration: false,
          chatbot: false,
          promptId: null,
          amountUsedBotQueues: 0,
          flowExecutionId: null,
          integrationId: null,
          appointmentMode: false
        },
        ticketId,
        companyId,
        isFlowBuilder: true
      });
    } catch (updateError) {
      logger.error(`Erro secundário ao atualizar ticket: ${updateError.message}`);
    }
  }
};

export default FinishFlowService;