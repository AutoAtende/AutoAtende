import axios, { AxiosError } from "axios";
import { logger } from "../../../utils/logger";

import { QueryTypes } from "sequelize";
import sequelize from "../../../database";
import Setting from "../../../models/Setting";
import QueueIntegrations from "../../../models/QueueIntegrations";
import GetOpenAIQueueIntegrationService from "../../QueueIntegrationServices/GetOpenAIQueueIntegrationService";

/**
 * Envia dados para um webhook de resumo, se os parâmetros permitirem
 *
 * @param {number} ticketId - O ID do ticket que será enviado para o webhook.
 * @param {number} companyId - O ID da empresa associada ao ticket.
 * @returns {Promise<void>} - Uma promessa que representa a conclusão da operação.
 * @throws {Error} - Lança um erro se ocorrer um problema ao buscar as configurações ou ao enviar os dados.
 */
export const SendDataToWebhookService = async (
  ticketId: number,
  companyId: number,
): Promise<void> => {

  const summarizeTicket = await Setting.findOne({ where: { companyId, key: "summarizeTicket" }
  });
  /** @description Esse parâmetro não é necessário filtrar pelo companyId, por causa que o mesmo é um parâmetro global. */
  const enableN8NWebhookForSummaryAI = await Setting.findOne({ where: { key: "enableN8NWebhookForSummaryAI" }
  });

  /** @description Retorna os dados de integração da openAI para verificar se possui apiKey cadastrada. */
  const openAIIntegration = await GetOpenAIQueueIntegrationService(companyId)

  if (summarizeTicket?.value === "enabled" && enableN8NWebhookForSummaryAI?.value === 'enabled' && openAIIntegration?.urlN8N?.trim()) {
    try {
      const queueIntegration = await QueueIntegrations.findOne({ where: { companyId, generatedViaParameters: 'enableN8NWebhookForSummaryAI' } })

      const data = {
        ticketId,
        companyId,
        domain: process.env.BACKEND_URL,
        apiKey: openAIIntegration?.urlN8N?.trim()
      };

      if (!ticketId) return null
      if (!companyId) return null
  
      const messages = await sequelize.query(
        `SELECT m."body" AS "body", c."name" as name, m."createdAt" as "createdAt"  
          FROM "Messages" m
              INNER JOIN "TicketTraking" tt ON tt."ticketId" = m."ticketId"
              INNER JOIN "Tickets" t ON t.id = tt."ticketId"
              LEFT JOIN   "Contacts" c ON c.id = m."contactId"
          WHERE m."ticketId" = ${ticketId}
              AND t."companyId" = ${companyId}
              AND m."createdAt" >= tt."startedAt"
              AND tt."finishedAt" IS null
                order by m."createdAt" asc;`,
        {
          type: QueryTypes.SELECT
        }
      );
      if (queueIntegration?.urlN8N) {
        await axios.post(queueIntegration?.urlN8N, { ...data, messages });
      }else {
        logger.error("Webhook URL in queue integration not found.")
      }
    } catch (error) {
      const _error = error as AxiosError;
      
      const status = _error.response?.status;
      logger.error(
        `Error Webhook: Function: SendDataToWebhook status: ${status}`, _error
      );
    }
  }
};
