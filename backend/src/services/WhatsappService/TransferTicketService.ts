import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import User from "../../models/User";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";

interface Request {
  oldWhatsappId: number;
  newWhatsappId: number;
  userId: number;
}

const TransferTicketsService = async ({
  oldWhatsappId,
  newWhatsappId,
  userId
}: Request): Promise<void> => {
  const tickets = await Ticket.findAll({
    where: { whatsappId: oldWhatsappId }
  });

  if (!tickets.length) return;

  const user = await User.findByPk(userId);

  // Para cada ticket a ser transferido
  for (const ticket of tickets) {
    // Verifica se já existe um ticket para o mesmo contato na conexão de destino
    const existingTicket = await Ticket.findOne({
      where: {
        contactId: ticket.contactId,
        companyId: ticket.companyId,
        whatsappId: newWhatsappId
      }
    });

    if (existingTicket) {
      // Caso exista, vamos mesclar os tickets
      logger.info(`Mesclando ticket ${ticket.id} com ticket existente ${existingTicket.id}`);
      
      // Transfere todas as mensagens do ticket original para o ticket existente
      const messages = await Message.findAll({
        where: { ticketId: ticket.id }
      });
      
      // Cria mensagem do sistema sobre a mesclagem
      const mergeMessageData = {
        id: Math.random().toString(36).substring(2, 18).toUpperCase(),
        ticketId: existingTicket.id,
        contactId: ticket.contactId,
        body: `Conversas mescladas da conexão anterior pelo usuário ${user.name}`,
        fromMe: true,
        read: true,
        mediaType: "system",
        quotedMsgId: null,
        ack: 3,
        remoteJid: null,
        participant: null,
        dataJson: null
      };
      
      await CreateMessageService({ 
        messageData: mergeMessageData, 
        ticket: existingTicket, 
        companyId: existingTicket.companyId
      });

      // Atualiza o lastMessage do ticket existente, se necessário
      if (ticket.lastMessage) {
        await existingTicket.update({
          lastMessage: `${existingTicket.lastMessage} | ${ticket.lastMessage}`.substring(0, 255),
          updatedAt: new Date()
        });
      }
      
      // Transfere todas as mensagens
      for (const message of messages) {
        await message.update({
          ticketId: existingTicket.id
        });
      }
      
      // Marca o ticket original para exclusão
      await ticket.destroy();
    } else {
      // Se não existe um ticket duplicado, apenas transfere o ticket para a nova conexão
      await ticket.update({ whatsappId: newWhatsappId });

      // Cria mensagem do sistema sobre a transferência
      const messageData = {
        id: Math.random().toString(36).substring(2, 18).toUpperCase(),
        ticketId: ticket.id,
        contactId: ticket.contactId,
        body: `Ticket transferido para outra conexão pelo usuário ${user.name}`,
        fromMe: true,
        read: true,
        mediaType: "system",
        quotedMsgId: null,
        ack: 3,
        remoteJid: null,
        participant: null,
        dataJson: null
      };

      await CreateMessageService({ 
        messageData, 
        ticket, 
        companyId: ticket.companyId
      });
    }
  }
};

export default TransferTicketsService;