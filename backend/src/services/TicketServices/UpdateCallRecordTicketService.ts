import AppError from "../../errors/AppError";
import CreateMessageService from "../MessageServices/CreateMessageService";
import ShowCompanyUPSixService from "../CompanyService/ShowCompanyUPSixService";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Company from "../../models/Company";

/**
 * Serviço para criar mensagem com URL da gravação.
 * @param {string | number} ticketId - O ID do ticket relacionado.
 * @param {string} recordId - O ID da gravação.
 * @param {number} companyId - O ID da empresa.
 * @returns {Promise<void>} - Não retorna dados, apenas cria a mensagem.
 * @throws {AppError} - Lança erro se dados estiverem inválidos ou registros não forem encontrados.
 */
const UpdateCallRecordTicketService = async (
  ticketId: string | number,
  recordId: string
): Promise<{ message: string }> => { 
  if (!ticketId || !recordId) {
    throw new AppError("Dados inválidos. ticketId e recordId são obrigatórios");
  }

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id"]
      },
      {
        model: Company,
        as: "company",
        attributes: ["urlPBX"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("Ticket não encontrado", 404);
  }

  const value = await ShowCompanyUPSixService(ticket.companyId);
  
  if (!value) {
    throw new AppError("Configuração de PBX não encontrada");
  }

  const baseUrl = `https://${value}.simplesclique.com.br:8193/${recordId}.mp3`;

  const messageData = {
    id: Math.random().toString(36).substring(2, 18).toUpperCase(),
    ticketId: ticket.id,
    contactId: ticket.contactId,
    body: `Mensagem do Sistema:\nA url referente a gravação da ligação com o contato ID: ${ticket.contact.id} é: ${baseUrl}`,
    fromMe: true,
    mediaType: null,
    read: true,
    quotedMsgId: null,
    ack: 3,
    remoteJid: null,
    participant: null,
    dataJson: null,
    isEdited: false,
    internalMessage: true
  };

  await CreateMessageService({
    messageData,
    ticket,
    companyId: ticket.companyId,
    internalMessage: true
  });

  return {
    message: "URL da gravação registrada com sucesso"
  };
};

export default UpdateCallRecordTicketService;