import { getIO } from "../../libs/optimizedSocket";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import OldMessage from "../../models/OldMessage";
import Tag from "../../models/Tag";

export interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  ack?: number;
  queueId?: number;
  internalMessage?: boolean;
}

interface Request {
  messageData: MessageData;
  ticket: Ticket;
  companyId: number;
  isForceDeleteConnection?: boolean;
  internalMessage?: boolean;
}

const CreateMessageService = async ({
  messageData,
  ticket,
  companyId,
  isForceDeleteConnection = false,
  internalMessage = false
}: Request): Promise<Message> => {
  // Verificar e garantir que temos um contactId válido
  if (!messageData.contactId && ticket.contactId) {
    messageData.contactId = ticket.contactId;
  }

  if (!messageData.contactId) {
    console.error(`Erro: Tentativa de criar mensagem sem contactId para o ticket ${ticket.id}`);
    throw new Error("ERR_NO_CONTACT_ID");
  }

  // Criar a mensagem no banco de dados
  await Message.upsert({ ...messageData, companyId });

  // Buscar a mensagem criada com todas as informações necessárias
  const message = await Message.findOne({
    where: {
      id: messageData.id,
      companyId
    },
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        include: ["contact", "queue", "whatsapp"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"],
        where: {
          companyId
        },
        required: false
      },
      {
        model: OldMessage,
        as: "oldMessages",
        where: {
          ticketId: messageData.ticketId
        },
        required: false
      }
    ]
  });

  if (!message) {
    throw new Error("ERR_CREATING_MESSAGE");
  }

  // Atualizar o contato e emitir eventos, se necessário
  if (ticket.contactId) {
    try {
      const contact = await Contact.findByPk(ticket.contactId);
      
      if (contact) {
        await contact.update({ presence: "available" });
        await contact.reload();
        
        if (ticket.queueId !== null && message.queueId === null) {
          await message.update({ queueId: ticket.queueId });
        }
        
        if (!isForceDeleteConnection || internalMessage) {
          const io = getIO();
          io.emit(`company-${companyId}-appMessage`, {
            action: "create",
            message,
            ticket,
            contact
          });
        
          io.emit(`company-${companyId}-contact`, {
            action: "update",
            contact: contact
          });
        }
      } else {
        console.warn(`Contato ID ${ticket.contactId} não encontrado ao criar mensagem para ticket ${ticket.id}`);
      }
    } catch (error) {
      console.error(`Erro ao buscar ou atualizar contato ID ${ticket.contactId}:`, error);
      // Não lançar erro para não interromper o fluxo de criação da mensagem
    }
  } else {
    console.warn(`Ticket ${ticket.id} não possui contactId. Ignorando atualização de contato.`);
  }

  return message;
};

export default CreateMessageService;