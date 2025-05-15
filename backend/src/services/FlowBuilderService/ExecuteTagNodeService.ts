import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import ContactTags from "../../models/ContactTags";
import TicketTag from "../../models/TicketTag";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { getIO } from "../../libs/socket";

interface ExecuteTagNodeParams {
  nodeData: {
    nodeId?: string;
    tags: Array<{
      id: number;
      name: string;
    }>;
    operation: string; // 'add' ou 'remove'
    selectionMode: string; // 'single' ou 'multiple'
  };
  contact: Contact;
  ticket: Ticket;
  companyId: number;
  executionId: number;
}

const ExecuteTagNodeService = async ({
  nodeData,
  contact,
  ticket,
  companyId,
  executionId
}: ExecuteTagNodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó de tags para ticket ${ticket.id}`);
    
    if (!nodeData.tags || nodeData.tags.length === 0) {
      logger.warn(`Não há tags selecionadas para o nó`);
      return;
    }
    
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }
    
    // Processar as tags conforme a operação
    if (nodeData.operation === 'add') {
      // Adicionar as tags selecionadas ao contato e ao ticket
      for (const tagData of nodeData.tags) {
        // Verificar se a tag existe
        const tag = await Tag.findByPk(tagData.id);
        
        if (!tag) {
          logger.warn(`Tag ${tagData.id} não encontrada`);
          continue;
        }

        // Adicionar tag ao contato
        const existingContactTag = await ContactTags.findOne({
          where: {
            contactId: contact.id,
            tagId: tag.id
          }
        });

        if (!existingContactTag) {
          await ContactTags.create({
            contactId: contact.id,
            tagId: tag.id,
            companyId
          });
          logger.info(`Tag ${tag.name} (id: ${tag.id}) adicionada ao contato ${contact.id}`);
        }

        // Adicionar tag ao ticket
        const existingTicketTag = await TicketTag.findOne({
          where: {
            ticketId: ticket.id,
            tagId: tag.id
          }
        });

        if (!existingTicketTag) {
          await TicketTag.create({
            ticketId: ticket.id,
            tagId: tag.id
          });
          logger.info(`Tag ${tag.name} (id: ${tag.id}) adicionada ao ticket ${ticket.id}`);
        }
      }
    } else if (nodeData.operation === 'remove') {
      // Remover as tags selecionadas do contato e do ticket
      for (const tagData of nodeData.tags) {
        // Remover tag do contato
        await ContactTags.destroy({
          where: {
            contactId: contact.id,
            tagId: tagData.id
          }
        });
        
        // Remover tag do ticket
        await TicketTag.destroy({
          where: {
            ticketId: ticket.id,
            tagId: tagData.id
          }
        });
        
        logger.info(`Tag ${tagData.id} removida do contato ${contact.id} e ticket ${ticket.id}`);
      }
    }
    
    // Buscar o ticket atualizado com suas tags para emitir pelo socket
    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "color"]
        },
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number"]
        }
      ]
    });

    // Emitir atualização via socket
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });
    
    // Atualizar as variáveis da execução com as tags atuais
    const updatedContactTags = await ContactTags.findAll({
      where: { contactId: contact.id },
      include: [{ model: Tag, as: "tag" }]
    });
    
    const updatedTicketTags = await TicketTag.findAll({
      where: { ticketId: ticket.id },
      include: [{ model: Tag }]
    });
    
    const contactTagList = updatedContactTags.map(ct => ({
      id: ct.tagId,
      name: ct.tag.name
    }));
    
    const ticketTagList = updatedTicketTags.map(tt => ({
      id: tt.tagId,
      name: tt.tag.name
    }));
    
    // Atualizar as variáveis da execução
    const updatedVariables = {
      ...execution.variables,
      contactTags: contactTagList,
      ticketTags: ticketTagList,
      lastTagOperation: {
        operation: nodeData.operation,
        tags: nodeData.tags
      }
    };
    
    await execution.update({
      variables: updatedVariables
    });

    await execution.reload();
    
    logger.info(`Nó de tags executado com sucesso para ticket ${ticket.id}`);
  } catch (error) {
    logger.error(`Erro ao executar nó de tags: ${error.message}`);
    throw error;
  }
};

export default ExecuteTagNodeService;