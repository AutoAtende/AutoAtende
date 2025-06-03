import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { Op } from "sequelize";
import Contact from "../models/Contact";
import BlockUnblockContactService from "../services/ContactServices/BlockUnblockContactService";
import ListContactsService from "../services/ContactServices/ListContactsService";
import ListContactsServiceNT from "../services/ContactServices/ListContactsServiceNT";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import DeleteAllContactService from "../services/ContactServices/DeleteAllContactService";
import GetContactService from "../services/ContactServices/GetContactService";
import ToggleDisableBotService from "../services/ContactServices/ToggleDisableBotService";
import AppError from "../errors/AppError";
import SimpleListService, {
  SearchContactParams
} from "../services/ContactServices/SimpleListService";
import { ExtractContactsService } from "../services/GroupServices/ExtractContactsService";
import { GetExcelContactsFile } from "../services/GroupServices/GetExcelContactsFile";
import UpdateProfilePicService from "../services/ContactServices/UpdateProfilePicService";
import { logger } from "../utils/logger";
import BulkDeleteContactsService from "../services/ContactServices/BulkDeleteContactsService";
import { Boom } from "@hapi/boom";
import ShowWhatsAppByCompanyIdByDefaultService from "../services/WhatsappService/ShowWhatsAppByCompanyIdByDefaultService";
import { getWbot } from "../libs/wbot";
import CheckContactNumber from "../helpers/CheckContactNumber";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  typeContact?: string;
  pageSize?: string;
  orderBy?: string;
  sortBy?: 'ASC' | 'DESC';
};

type BulkDeleteData = {
  contactIds: string[];
};

type IndexGetContactQuery = {
  name: string;
  number: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pageNumber = parseInt(req.query.pageNumber as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    const searchParam = (req.query.searchParam as string) || "";
    const tagIds = req.query.tagIds as string; // Recebe os IDs das tags como string
    const { companyId } = req.user;

    logger.info(`Fetching contacts. Company: ${companyId}, Page: ${pageNumber}, Size: ${pageSize}, Search: ${searchParam}, TagFilter: ${tagIds || 'none'}`);

    const offset = (pageNumber - 1) * pageSize;
    
    // Converter a string tagIds em array de números, se existir
    let tagIdsArray: number[] = [];
    if (tagIds && tagIds.trim() !== "") {
      tagIdsArray = tagIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }

    const { contacts, count, hasMore } = await ListContactsService({
      searchParam,
      pageNumber,
      companyId,
      limit: pageSize,
      offset,
      tagIds: tagIdsArray.length > 0 ? tagIdsArray : undefined // Passa os IDs das tags para o serviço
    });

    logger.info(`Found ${count} contacts for company ${companyId}`);
    
    return res.status(200).json({
      contacts,
      count,
      hasMore
    });
  } catch (err) {
    logger.error(`Error fetching contacts: ${err.message}`);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const newContact = req.body;
  
  logger.info(`Creating new contact. Company: ${companyId}, Original Number: ${newContact.number}, Name: ${newContact.name}`);
  
  newContact.number = newContact.number.replace("-", "").replace(" ", "");
  logger.info(`Number after basic formatting: ${newContact.number}`);

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    logger.error(`Validation error for contact creation: ${err.message}`);
    throw new AppError(err.message);
  }

  if (!newContact.isGroup) {
    logger.info(`Validating number format for: ${newContact.number}`);
    const validNumber = await CheckContactNumber(newContact.number, companyId);
    const number = validNumber.jid.replace(/\D/g, "");
    logger.info(`Number after full validation: ${number}, Original JID: ${validNumber.jid}`);
    newContact.number = number;
  }

  /**
   * Código desabilitado por demora no retorno
   */
  // const profilePicUrl = await GetProfilePicUrl(validNumber.jid, companyId);

  const contact = await CreateContactService({
    ...newContact,
    // profilePicUrl,
    companyId
  });

  logger.info(`Contact created successfully. ID: ${contact.id}, Number: ${contact.number}, Name: ${contact.name}`);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(
    `company-${companyId}-contact`,
    {
      action: "create",
      contact
    }
  );

  return res.status(200).json(contact);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;
  const contactData = req.body;

  try {
    logger.info(`Atualizando contato ${contactId}. Empresa: ${companyId}, Dados:`, contactData);
    
    // ADICIONAR LOGS para diagnóstico
    if (contactData.employerId !== undefined) {
      logger.info(`employerId recebido: ${contactData.employerId}`);
    }
    
    if (contactData.positionId !== undefined) {
      logger.info(`positionId recebido: ${contactData.positionId}`);
    }
    
    if (contactData.number) {
      logger.info(`Number being updated. Original: ${contactData.number}`);
    }

    const schema = Yup.object().shape({
      name: Yup.string().optional(),
      number: Yup.string()
        .optional()
        .matches(/^\d+$/, "ERR_INVALID_NUMBER_FORMAT"),
      email: Yup.string().email().optional(),
      employerId: Yup.number().nullable().optional(),
      positionId: Yup.number().nullable().optional(),
      positionName: Yup.string().optional(),
      extraInfo: Yup.array()
        .of(
          Yup.object().shape({
            name: Yup.string().required(),
            value: Yup.string().required()
          })
        )
        .optional(),
      disableBot: Yup.boolean().optional()
    });

    await schema.validate(contactData);

    // Obter contato original para comparação
    const originalContact = await ShowContactService(contactId, companyId);
    logger.info(`Original contact data - ID: ${originalContact.id}, Number: ${originalContact.number}, Name: ${originalContact.name}`);

    const contact = await UpdateContactService({
      contactData,
      contactId,
      companyId
    });

    logger.info(`Contact ${contactId} updated successfully. New Number: ${contact.number}, New Name: ${contact.name}`);
    
    if (originalContact.number !== contact.number) {
      logger.info(`Number was changed from ${originalContact.number} to ${contact.number}`);
    }

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Error updating contact ${contactId}: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Error updating contact: " + err.message);
  }
};


export const blockUnblock = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;
  const { active } = req.body;

  try {
    // Obter contato original para log
    const originalContact = await ShowContactService(contactId, companyId);
    logger.info(`${active ? 'Desbloqueando' : 'Bloqueando'} contato ${contactId}. Estado atual: ${originalContact.active}`);
    logger.info(`Empresa: ${companyId}, Número: ${originalContact.number}, Nome: ${originalContact.name}`);

    // Verificação explícita do valor de active
    const newActiveValue = active === true;
    logger.info(`Novo valor de active a ser definido: ${newActiveValue}`);

    const updatedContact = await BlockUnblockContactService({
      contactId,
      companyId,
      active: newActiveValue
    });

    logger.info(`Contato ${contactId} ${newActiveValue ? 'desbloqueado' : 'bloqueado'} com sucesso. Estado após atualização: ${updatedContact.active}`);
    logger.info(`Número: ${updatedContact.number}`);

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "update",
      contact: updatedContact
    });

    return res.status(200).json(updatedContact);
  } catch (err) {
    logger.error(`Erro ${req.body.active ? 'desbloqueando' : 'bloqueando'} contato: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Erro ${req.body.active ? 'desbloqueando' : 'bloqueando'} contato: ${err.message}`);
  }
};

export const toggleDisableBot = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  try {
    // Obter contato original para log
    const originalContact = await ShowContactService(contactId, companyId);
    logger.info(`Toggling bot status for contact ${contactId}. Company: ${companyId}, Number: ${originalContact.number}, Name: ${originalContact.name}`);

    const updatedContact = await ToggleDisableBotService(contactId, companyId);

    logger.info(`Bot status toggled for contact ${contactId}. New status: ${updatedContact.disableBot ? 'disabled' : 'enabled'}, Number: ${updatedContact.number}`);

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "update",
      contact: updatedContact
    });

    return res.status(200).json(updatedContact);
  } catch (err) {
    logger.error(`Error toggling bot status: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error toggling bot status: ${err.message}`);
  }
};

export const nt = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  try {
    logger.info(`Fetching filtered contacts (NT). Company: ${companyId}, Page: ${pageNumber}, Search: ${searchParam}`);

    const { contacts, count, hasMore } = await ListContactsServiceNT({
      searchParam,
      pageNumber,
      companyId
    });

    logger.info(`Found ${count} filtered contacts for company ${companyId}`);
    
    // Log para exibir os números dos contatos retornados
    contacts.forEach(contact => {
      logger.info(`NT Contact ID: ${contact.id}, Number: ${contact.number}, Name: ${contact.name}`);
    });

    return res.json({ contacts, count, hasMore });
  } catch (err) {
    logger.error(`Error fetching filtered contacts: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error fetching filtered contacts: ${err.message}`);
  }
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;
  const { companyId } = req.user;

  try {
    logger.info(`Getting contact. Company: ${companyId}, Number: ${number}, Name: ${name}`);

    const contact = await GetContactService({
      name,
      number,
      companyId
    });

    logger.info(`Contact found: ID: ${contact.id}, Number: ${contact.number}, Name: ${contact.name}`);

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Error getting contact with number ${number}: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error getting contact: ${err.message}`);
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Showing contact ${contactId}. Company: ${companyId}`);

    const contact = await ShowContactService(contactId, companyId);

    logger.info(`Contact ${contactId} details retrieved successfully. Number: ${contact.number}, Name: ${contact.name}`);

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Error showing contact: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error showing contact: ${err.message}`);
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  try {
    // Obter contato original para log
    const contactToDelete = await ShowContactService(contactId, companyId);
    logger.info(`Deleting contact ${contactId}. Company: ${companyId}, Number: ${contactToDelete.number}, Name: ${contactToDelete.name}`);

    await DeleteContactService(contactId, companyId);

    logger.info(`Contact ${contactId} with number ${contactToDelete.number} deleted successfully`);

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "delete",
      contactId
    });

    return res.status(200).json({ message: "Contact deleted" });
  } catch (err) {
    logger.error(`Error deleting contact: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error deleting contact: ${err.message}`);
  }
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.query as unknown as SearchContactParams;
  const { companyId } = req.user;

  try {
    logger.info(`Listing contacts. Company: ${companyId}, Name filter: ${name || 'none'}`);

    const contacts = await SimpleListService({ name, companyId });

    logger.info(`Listed ${contacts.length} contacts for company ${companyId}`);
    
    return res.json(contacts);
  } catch (err) {
    logger.error(`Error listing contacts: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error listing contacts: ${err.message}`);
  }
};

export const findOrCreate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;
  const { companyId } = req.user;

  try {
    logger.info(`Finding or creating contact. Company: ${companyId}, Original Number: ${number}, Name: ${name}`);

    const contact = await GetContactService({
      name,
      number,
      companyId
    });

    logger.info(`Contact found/created: ID: ${contact.id}, Final Number: ${contact.number}, Name: ${contact.name}`);
    
    if (number !== contact.number) {
      logger.info(`Number was normalized from ${number} to ${contact.number} during findOrCreate`);
    }

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Error finding or creating contact with number ${number}: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error finding or creating contact: ${err.message}`);
  }
};

export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  try {
    // Obter contatos para log antes de deletar
    const contacts = await Contact.findAll({ where: { companyId } });
    logger.info(`Deleting all ${contacts.length} contacts. Company: ${companyId}`);
    
    // Log para todos os números que serão excluídos
    contacts.forEach(contact => {
      logger.info(`Contact to be deleted: ID: ${contact.id}, Number: ${contact.number}, Name: ${contact.name}`);
    });

    await DeleteAllContactService(companyId);

    logger.info(`All contacts deleted for company ${companyId}`);

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "delete-all"
    });

    return res.status(200).json({ message: "All contacts deleted successfully" });
  } catch (err) {
    logger.error(`Error deleting all contacts: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error deleting all contacts: ${err.message}`);
  }
};

const removeWhatsAppSuffix = (input: string): string => {
  const regex = /:\d+@s\.whatsapp\.net/g;
  const result = input.replace(regex, "");
  return result;
};

export const extractContactsGroupByLink = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId } = req.body;
  const { companyId } = req.params;

  try {
    logger.info(`Extracting contacts from group ${groupId}. Company: ${companyId}`);
    
    let whatsapp = await ShowWhatsAppByCompanyIdByDefaultService(+companyId);
    
    if (!whatsapp) {
      throw new AppError("Default WhatsApp connection not found", 404);
    }
    
    const wbot = await getWbot(whatsapp?.id, +companyId);
    const groupMetadata = await wbot.groupMetadata(`${groupId}@g.us`);
    
    logger.info(`Group metadata retrieved. Participant count: ${groupMetadata?.participants?.length}`);
    
    // Log para os números dos participantes do grupo
    groupMetadata?.participants?.forEach((participant, index) => {
      const participantId = participant.id || '';
      const rawNumber = removeWhatsAppSuffix(participantId);
      logger.info(`Group participant ${index+1}: Raw ID: ${participantId}, Extracted Number: ${rawNumber}`);
    });
    
    await ExtractContactsService(
      "",
      +companyId,
      groupMetadata?.participants,
      groupId
    );
    
    const fileName = `excel_contacts-${companyId}-${groupId}.xlsx`;
    const file = await GetExcelContactsFile(fileName);
    
    logger.info(`Contacts extracted successfully from group ${groupId}`);
    
    return res.json(file);
  } catch (error) {
    logger.error(`Error extracting contacts from group: ${error.message}`);
    
    const _error = error as Boom;
    if (_error.data === 403) {
      throw new AppError(
        `O número desta conexao não está presente dentro do grupo para realizar a extração dos contatos. É necessário que o mesmo esteja dentro do grupo para realizar a ação.`
      );
    } else {
      throw new AppError(error?.message || "Error extracting contacts");
    }
  }
};

export const bulkDelete = async (req: Request, res: Response): Promise<Response> => {
  const { contactIds }: BulkDeleteData = req.body;
  const { companyId } = req.user;

  try {
    logger.info(`Bulk deleting contacts. Company: ${companyId}, Count: ${contactIds?.length || 0}`);

    if (!contactIds || contactIds.length === 0) {
      throw new AppError("É necessário fornecer pelo menos um ID de contato");
    }

    // Obter contatos para log antes de deletar
    const contactsToDelete = await Contact.findAll({
      where: {
        id: { [Op.in]: contactIds },
        companyId
      }
    });
    
    // Log para todos os números que serão excluídos
    contactsToDelete.forEach(contact => {
      logger.info(`Contact to be bulk deleted: ID: ${contact.id}, Number: ${contact.number}, Name: ${contact.name}`);
    });

    const deletedCount = await BulkDeleteContactsService({
      contactIds,
      companyId
    });

    logger.info(`Bulk delete completed. ${deletedCount} contacts deleted`);

    // Notificar via websocket sobre as exclusões
    const io = getIO();
    contactIds.forEach(contactId => {
      io.emit(`company-${companyId}-contact`, {
        action: "delete",
        contactId
      });
    });

    return res.status(200).json({ 
      message: `${deletedCount} contato(s) excluído(s) com sucesso`,
      count: deletedCount,
      total: contactIds.length
    });
  } catch (err) {
    logger.error(`Error bulk deleting contacts: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error bulk deleting contacts: ${err.message}`);
  }
};

export const updateProfilePic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { number } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Requisição para atualizar foto de perfil. Número original: ${number}, Empresa: ${companyId}`);
    
    const contact = await UpdateProfilePicService({
      number,
      companyId
    });

    logger.info(`Foto de perfil atualizada com sucesso. ID: ${contact.id}, Número final: ${contact.number}, Nome: ${contact.name}`);

    return res.status(200).json(contact);
  } catch (err) {
    logger.error(`Erro ao atualizar foto de perfil para número ${number}: ${err.message}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Erro ao atualizar foto de perfil: ${err.message}`, 500);
  }
};

export const bulkUpdate = async (req: Request, res: Response): Promise<Response> => {
  const { contactIds, update } = req.body;
  const { companyId } = req.user;

  try {
    logger.info(`Iniciando atualização em massa de ${contactIds.length} contatos. CompanyId: ${companyId}, Campos a atualizar:`, update);

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      throw new AppError("É necessário fornecer pelo menos um ID de contato");
    }

    if (!update || Object.keys(update).length === 0) {
      throw new AppError("É necessário fornecer pelo menos um campo para atualização");
    }

    // Verifica permissões
    const validUpdates = ["disableBot"]; // Campos permitidos para atualização em massa
    const invalidFields = Object.keys(update).filter(field => !validUpdates.includes(field));
    
    if (invalidFields.length > 0) {
      throw new AppError(`Os seguintes campos não podem ser atualizados em massa: ${invalidFields.join(', ')}`);
    }

    // Verifica se todos os contatos pertencem à empresa
    const contacts = await Contact.findAll({
      where: {
        id: { [Op.in]: contactIds },
        companyId
      }
    });

    if (contacts.length === 0) {
      throw new AppError("Nenhum contato válido encontrado para atualização");
    }

    // Log para todos os números que serão atualizados
    contacts.forEach(contact => {
      logger.info(`Contact to be bulk updated: ID: ${contact.id}, Number: ${contact.number}, Name: ${contact.name}`);
    });

    logger.info(`Encontrados ${contacts.length} de ${contactIds.length} contatos válidos para atualização`);

    // Atualiza os contatos
    const updatedCount = await Contact.update(update, {
      where: {
        id: { [Op.in]: contactIds },
        companyId
      }
    });

    // Notifica clientes sobre a atualização
    const io = getIO();
    contacts.forEach(contact => {
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
        action: "update",
        contact: { ...contact.toJSON(), ...update }
      });
    });

    logger.info(`Atualização em massa concluída. ${updatedCount[0]} contatos atualizados.`);
    
    return res.status(200).json({ 
      message: `${updatedCount[0]} contato(s) atualizado(s) com sucesso`,
      count: updatedCount[0],
      total: contactIds.length
    });
  } catch (error) {
    logger.error(`Erro durante a atualização em massa: ${error.message}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`Erro ao atualizar contatos em massa: ${error.message}`);
  }
};

// Endpoint para bloqueio/desbloqueio em massa de contatos
export const bulkBlockUnblock = async (req: Request, res: Response): Promise<Response> => {
  const { contactIds, active } = req.body;
  const { companyId } = req.user;

  try {
    logger.info(`Iniciando ${active ? 'desbloqueio' : 'bloqueio'} em massa de ${contactIds.length} contatos. CompanyId: ${companyId}`);

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      throw new AppError("É necessário fornecer pelo menos um ID de contato");
    }

    if (active === undefined || active === null) {
      throw new AppError("É necessário especificar o parâmetro 'active'");
    }

    // Verifica se todos os contatos pertencem à empresa
    const contacts = await Contact.findAll({
      where: {
        id: { [Op.in]: contactIds },
        companyId
      }
    });

    if (contacts.length === 0) {
      throw new AppError("Nenhum contato válido encontrado");
    }

    // Log para todos os números que serão bloqueados/desbloqueados
    contacts.forEach(contact => {
      logger.info(`Contact to be ${active ? 'unblocked' : 'blocked'}: ID: ${contact.id}, Number: ${contact.number}, Name: ${contact.name}`);
    });

    logger.info(`Encontrados ${contacts.length} de ${contactIds.length} contatos válidos`);

    // Atualiza o estado de bloqueio dos contatos
    const updatedCount = await Contact.update(
      { active }, 
      {
        where: {
          id: { [Op.in]: contactIds },
          companyId
        }
      }
    );

    // Notifica clientes sobre a atualização
    const io = getIO();
    contacts.forEach(contact => {
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
        action: "update",
        contact: { ...contact.toJSON(), active }
      });
    });

    logger.info(`${active ? 'Desbloqueio' : 'Bloqueio'} em massa concluído. ${updatedCount[0]} contatos atualizados.`);
    
    return res.status(200).json({ 
      message: `${updatedCount[0]} contato(s) ${active ? 'desbloqueado(s)' : 'bloqueado(s)'} com sucesso`,
      count: updatedCount[0],
      total: contactIds.length
    });
  } catch (error) {
    logger.error(`Erro durante o ${active ? 'desbloqueio' : 'bloqueio'} em massa: ${error.message}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`Erro ao ${active ? 'desbloquear' : 'bloquear'} contatos em massa: ${error.message}`);
  }
};