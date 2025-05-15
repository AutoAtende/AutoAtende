import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import Tag from "../models/Tag";
import ContactTags from "../models/ContactTags";
import { logger } from "../utils/logger";

// Listar tags de um contato
export const listContactTags = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Listando tags do contato ${contactId}. Company: ${companyId}`);

    const contact = await Contact.findOne({
      where: { id: contactId, companyId },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    if (!contact) {
      throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    logger.info(`Tags do contato ${contactId} listadas com sucesso`);

    return res.status(200).json(contact.tags);
  } catch (err) {
    logger.error(`Erro ao listar tags do contato: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Erro ao listar tags do contato: ${err.message}`);
  }
};

// Atribuir tags a um contato
export const syncContactTags = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { tagIds } = req.body;
  const { companyId } = req.user;

  try {
    logger.info(`Sincronizando tags do contato ${contactId}. Company: ${companyId}`);

    const contact = await Contact.findOne({
      where: { id: contactId, companyId }
    });

    if (!contact) {
      throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    // Verifica se todas as tags pertencem à mesma empresa
    if (tagIds && tagIds.length > 0) {
      const tags = await Tag.findAll({
        where: { id: tagIds, companyId }
      });

      if (tags.length !== tagIds.length) {
        throw new AppError("ERR_SOME_TAGS_NOT_FOUND", 404);
      }

      // Remove todas as tags atuais
      await ContactTags.destroy({
        where: { contactId }
      });

      // Adiciona as novas tags
      await Promise.all(
        tagIds.map(async (tagId) => {
          await ContactTags.create({
            contactId,
            tagId
          });
        })
      );
    } else {
      // Se a lista de tags estiver vazia, remove todas as tags
      await ContactTags.destroy({
        where: { contactId }
      });
    }

    // Recarrega o contato com as tags atualizadas
    await contact.reload({
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    logger.info(`Tags do contato ${contactId} sincronizadas com sucesso`);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Erro ao sincronizar tags do contato: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Erro ao sincronizar tags do contato: ${err.message}`);
  }
};

// Adicionar uma tag a um contato
export const addContactTag = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, tagId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Adicionando tag ${tagId} ao contato ${contactId}. Company: ${companyId}`);

    const contact = await Contact.findOne({
      where: { id: contactId, companyId }
    });

    if (!contact) {
      throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    const tag = await Tag.findOne({
      where: { id: tagId, companyId }
    });

    if (!tag) {
      throw new AppError("ERR_TAG_NOT_FOUND", 404);
    }

    // Verifica se a tag já está atribuída ao contato
    const tagExists = await ContactTags.findOne({
      where: { contactId, tagId }
    });

    if (tagExists) {
      return res.status(200).json({ message: "Tag já atribuída a este contato" });
    }

    // Adiciona a tag ao contato
    await ContactTags.create({
      contactId,
      tagId
    });

    // Recarrega o contato com as tags atualizadas
    await contact.reload({
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    logger.info(`Tag ${tagId} adicionada ao contato ${contactId} com sucesso`);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Erro ao adicionar tag ao contato: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Erro ao adicionar tag ao contato: ${err.message}`);
  }
};

// Remover uma tag de um contato
export const removeContactTag = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, tagId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Removendo tag ${tagId} do contato ${contactId}. Company: ${companyId}`);

    const contact = await Contact.findOne({
      where: { id: contactId, companyId }
    });

    if (!contact) {
      throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    const tag = await Tag.findOne({
      where: { id: tagId, companyId }
    });

    if (!tag) {
      throw new AppError("ERR_TAG_NOT_FOUND", 404);
    }

    // Remove a tag do contato
    await ContactTags.destroy({
      where: { contactId, tagId }
    });

    // Recarrega o contato com as tags atualizadas
    await contact.reload({
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    logger.info(`Tag ${tagId} removida do contato ${contactId} com sucesso`);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Erro ao remover tag do contato: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Erro ao remover tag do contato: ${err.message}`);
  }
};

export default {
  listContactTags,
  syncContactTags,
  addContactTag,
  removeContactTag
};