import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import Tag from "../../models/Tag";
import Contact from "../../models/Contact";
import TicketTag from "../../models/TicketTag";
import ContactTags from "../../models/ContactTags";
import { logger } from "../../utils/logger";

interface Request {
  tags: Tag[];
  ticketId: number;
}

const SyncTags = async ({ tags, ticketId }: Request): Promise<Ticket | null> => {
  const io = getIO();
  
  if (!ticketId) {
    logger.error(`SyncTags: ticketId não fornecido`);
    return null;
  }
  
  // Buscar o ticket incluindo tags e o contato associado
  const ticket = await Ticket.findByPk(ticketId, { 
    include: [
      { model: Tag, as: 'tags' },
      { model: Contact, as: 'contact' }
    ] 
  });
  
  if (!ticket) {
    logger.error(`SyncTags: Ticket com ID ${ticketId} não encontrado`);
    return null;
  }
  
  const companyId = ticket.companyId;
  const contactId = ticket.contactId;
  
  if (!contactId) {
    logger.error(`SyncTags: Ticket ${ticketId} não tem contactId associado`);
    return null;
  }
  
  // Verificar se todos os objetos de tag possuem a propriedade 'id'
  const hasIdKey = tags.every(tag => tag.hasOwnProperty('id'));
  if (!hasIdKey) {
    logger.error(`SyncTags: Alguma tag não possui propriedade 'id'`);
    return null;
  }
  
  try {
    // Preparar arrays para bulk create
    const ticketTagList = tags.map(t => ({ tagId: t.id, ticketId }));
    const contactTagList = tags.map(t => ({ tagId: t.id, contactId }));
    
    // Atualizar as tags do ticket
    await TicketTag.destroy({ where: { ticketId } });
    if (ticketTagList.length > 0) {
      await TicketTag.bulkCreate(ticketTagList);
    }
    
    // Atualizar as tags do contato
    await ContactTags.destroy({ where: { contactId } });
    if (contactTagList.length > 0) {
      await ContactTags.bulkCreate(contactTagList);
    }
    
    // Buscar o ticket atualizado com suas tags e contato para retornar
    const ticketReturn = await Ticket.findByPk(ticketId, { 
      include: [
        { model: Tag, as: 'tags' },
        { 
          model: Contact, 
          as: 'contact',
          include: [
            { model: Tag, as: 'tags' }
          ]
        }
      ] 
    });
    
    // Emitir evento de atualização via socket
    io.emit(`company-${companyId}-ticket`, {
      action: "tagUpdate",
      ticket: ticketReturn
    });
    
    // Também notificar atualização do contato
    io.emit(`company-${companyId}-contact`, {
      action: "update",
      contact: ticketReturn.contact
    });
    
    logger.info(`SyncTags: Tags sincronizadas com sucesso para o ticket ${ticketId} e contato ${contactId}`);
    
    return ticketReturn;
    
  } catch (error) {
    logger.error(`Erro ao sincronizar tags: ${error.message}`);
    return null;
  }
};

export default SyncTags;