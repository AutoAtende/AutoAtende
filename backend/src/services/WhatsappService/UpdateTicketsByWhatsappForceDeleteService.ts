import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { sendMessageNotificationToFrontend } from "../SocketEventMessageNotificationService/SendMessageNotificationService";

interface Request {
  openTickets: Ticket[]
  userCurrentId: number
  companyId: number
}

const UpdateTicketsByWhatsappForceDeleteService = async ({
  openTickets,
  companyId,
  userCurrentId
}: Request): Promise<void> => {

  const userCurrent = await User.findByPk(userCurrentId);

  await Promise.all(openTickets.map(async (ticket) => {
    try {
      // Verificar se o contato existe
      const contact = await Contact.findByPk(ticket.contactId);
      
      if (!contact) {
        console.log(`Pulando criação de mensagem para ticket ${ticket.id} pois o contato não foi encontrado`);
        // Atualizar apenas o ticket sem tentar criar a mensagem
        ticket.status = 'closed';
        ticket.isForceDeleteConnection = true;
        await ticket.save();
        return;
      }

      // Atualizar ticket
      ticket.status = 'closed';
      ticket.isForceDeleteConnection = true;
      await ticket.save();

      // Importante: Recarregar o ticket com o contato incluído
      await ticket.reload({
        include: [
          {
            model: Contact,
            as: "contact"
          }
        ]
      });

      const messageData = {
        id: Math.random().toString(36).substring(2, 18).toUpperCase(),
        ticketId: ticket?.id,
        contactId: ticket?.contactId,
        body: `O ticket foi fechado porque a conexão foi deletada pelo usuário ${userCurrent.name}(${userCurrent.profile})`,
        fromMe: true,
        mediaType: null,
        read: false,
        quotedMsgId: null,
        ack: 3,
        remoteJid: null,
        participant: null,
        dataJson: null,
        isEdited: false,
        isForceDeleteConnection: true
      };
      
      // Verificar se o contato foi carregado corretamente no ticket
      if (!ticket.contact) {
        ticket.contact = contact;
      }
      
      await CreateMessageService({ 
        messageData, 
        ticket, 
        companyId: ticket?.companyId, 
        isForceDeleteConnection: true 
      });
    } catch (error) {
      console.log(`Erro ao processar ticket ${ticket.id}: ${error}`);
      // Tentar atualizar o ticket mesmo com erro na mensagem
      try {
        ticket.status = 'closed';
        ticket.isForceDeleteConnection = true;
        await ticket.save();
      } catch (ticketError) {
        console.log(`Erro ao atualizar ticket ${ticket.id}: ${ticketError}`);
      }
    }
  }));

  const message = 'Todos os tickets vinculados com a conexão foram fechados com sucesso.';
  sendMessageNotificationToFrontend(userCurrentId, companyId, message, 'SUCCESS');
};

export default UpdateTicketsByWhatsappForceDeleteService;