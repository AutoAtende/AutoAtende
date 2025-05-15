import { AxiosError } from "axios";
import { logger } from "../../../utils/logger";

import { getIO } from "../../../libs/socket";
import Setting from "../../../models/Setting";
import CreateTicketNoteService, { TicketNoteData } from "../../TicketNoteService/CreateTicketNoteService";
import Ticket from "../../../models/Ticket";

/**
 * Adiciona uma nota resumida a um ticket, se os parâmetros permitirem.
 *
 * @param {number} companyId - O ID da empresa associada ao ticket.
 * @param {number} ticketId - O ID do ticket ao qual a nota será adicionada.
 * @param {string} note - O conteúdo da nota a ser adicionada.
 * @returns {Promise<void>} - Uma promessa que representa a conclusão da operação.
 *
 * @throws {Error} - Lança um erro se ocorrer um problema ao buscar as configurações ou ao criar a nota.
 */
export const addSummarizeNote = async (companyId: number, ticketId: number, note: string): Promise<void> => {
  try {
    const summarizeTicket = await Setting.findOne({
      where: {
        companyId,
        key: "summarizeTicket"
      }
    });
    /** @description Esse parâmetro não é necessário filtrar pelo companyId, por causa que o mesmo é um parâmetro global. */
    const enableN8NWebhookForSummaryAI = await Setting.findOne({
      where: {
        key: "enableN8NWebhookForSummaryAI"
      }
    });
    if (summarizeTicket?.value === "enabled" && enableN8NWebhookForSummaryAI?.value === 'enabled' && !!note && ticketId) {
      const ticket = await Ticket.findOne({ where: {
        id: ticketId,
        companyId
      } })

      const ticketNoteData: TicketNoteData = {
        contactId: ticket.contactId,
        note: `${note}`,
        ticketId: ticket.id,
        userId: ticket.userId
      }
   
      await CreateTicketNoteService(ticketNoteData)
    }
  } catch (error) {
    console.error(`Ops! An error occurred: `, {error})
  }
}

/**
 * Envia dados para o serviço de resumo e adiciona uma nota resumida ao ticket.
 *
 * @param {string} text - O texto a ser enviado para o serviço de resumo.
 * @param {number} companyId - O ID da empresa associada ao ticket.
 * @param {number} ticketId - O ID do ticket ao qual a nota será adicionada.
 * @returns {Promise<void>} - Uma promessa que representa a conclusão da operação.
 *
 * @throws {Error} - Lança um erro se ocorrer um problema ao enviar os dados ou ao adicionar a nota.
 */
export const GetDataFromWebhookService = async (
  text: string,
  companyId: number,
  ticketId: number
): Promise<void> => {
  try {
    const io = getIO()
    io.emit(`summarize-${companyId}-${ticketId}-text`, {
      text,
      companyId
    })

    await addSummarizeNote(companyId, ticketId, text)

  } catch (error) {
    const _error = error as AxiosError;
    
    logger.error(
      `Ops! An error occurred in get data from n8n summarize: `, _error
    );
  }
};
