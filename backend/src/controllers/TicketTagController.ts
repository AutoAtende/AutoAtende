import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import AppError from "../errors/AppError";
import TicketTag from '../models/TicketTag';
import Tag from '../models/Tag';
import Ticket from '../models/Ticket';
import Contact from '../models/Contact';
import { logger } from "../utils/logger";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.params;
  const { companyId } = req.user;

  try {
    // Verificar se o ticket existe e pertence à empresa
    const ticket = await Ticket.findOne({
      where: { id: ticketId, companyId }
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Verificar se a tag existe e pertence à empresa
    const tag = await Tag.findOne({
      where: { id: tagId, companyId }
    });

    if (!tag) {
      throw new AppError("Tag não encontrada", 404);
    }

    // Antes de adicionar a nova tag, remover todas as tags kanban existentes
    // Isso garantirá que o ticket tenha apenas uma tag kanban por vez
    const ticketTags = await TicketTag.findAll({ 
      where: { ticketId },
      include: [{
        model: Tag,
        where: { kanban: 1 }
      }]
    });

    // Remover tags kanban anteriores
    for (const tt of ticketTags) {
      await tt.destroy();
    }

    // Criar a nova associação ticket-tag
    const ticketTag = await TicketTag.create({ ticketId, tagId });

    // Buscar o ticket atualizado com suas tags
    const updatedTicket = await Ticket.findByPk(ticketId, {
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

    // Notificar via socket.io
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });

    return res.status(201).json(updatedTicket);
  } catch (error) {
    logger.error("Error in store ticket tag:", error);
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Falha ao adicionar tag ao ticket.' });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  try {
    // Verificar se o ticket existe e pertence à empresa
    const ticket = await Ticket.findOne({
      where: { id: ticketId, companyId }
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Retrieve tagIds associated with the provided ticketId from TicketTags
    const ticketTags = await TicketTag.findAll({ where: { ticketId } });
    const tagIds = ticketTags.map((ticketTag) => ticketTag.tagId);

    // Find the tagIds with kanban = 1 in the Tags table
    const tagsWithKanbanOne = await Tag.findAll({
      where: {
        id: tagIds,
        kanban: 1,
      },
    });

    // Remove the tagIds with kanban = 1 from TicketTags
    const tagIdsWithKanbanOne = tagsWithKanbanOne.map((tag) => tag.id);
    if (tagIdsWithKanbanOne.length > 0) {
      await TicketTag.destroy({ where: { ticketId, tagId: tagIdsWithKanbanOne } });
    }

    // Buscar o ticket atualizado para retornar
    const updatedTicket = await Ticket.findByPk(ticketId, {
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

    // Notificar via socket.io
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });

    return res.status(200).json(updatedTicket);
  } catch (error) {
    logger.error("Error in remove ticket tag:", error);
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Falha ao remover tags do ticket.' });
  }
};

// Rota para substituir uma tag atual por outra (usado no Kanban)
export const update = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.params;
  const { companyId } = req.user;

  try {
    // Verificar se o ticket existe e pertence à empresa
    const ticket = await Ticket.findOne({
      where: { id: ticketId, companyId }
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Se o tagId for 0, remove todas as tags kanban
    if (tagId === "0") {
      return await remove(req, res);
    }

    // Verificar se a tag existe e pertence à empresa
    const tag = await Tag.findOne({
      where: { id: tagId, companyId }
    });

    if (!tag) {
      throw new AppError("Tag não encontrada", 404);
    }

    // Remover todas as tags kanban existentes
    const ticketTags = await TicketTag.findAll({ 
      where: { ticketId },
      include: [{
        model: Tag,
        where: { kanban: 1 }
      }]
    });

    for (const tt of ticketTags) {
      await tt.destroy();
    }

    // Adicionar a nova tag
    await TicketTag.create({ ticketId, tagId });

    // Buscar o ticket atualizado com suas tags
    const updatedTicket = await Ticket.findByPk(ticketId, {
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

    // Notificar via socket.io
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });

    return res.status(200).json(updatedTicket);
  } catch (error) {
    logger.error("Error in update ticket tag:", error);
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Falha ao atualizar tag do ticket.' });
  }
};

export default {
  store,
  remove,
  update
};