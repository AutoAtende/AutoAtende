import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import ListService from "../services/ContactListItemService/ListService";
import CreateService from "../services/ContactListItemService/CreateService";
import ShowService from "../services/ContactListItemService/ShowService";
import UpdateService from "../services/ContactListItemService/UpdateService";
import DeleteService from "../services/ContactListItemService/DeleteService";
import FindService from "../services/ContactListItemService/FindService";
import { head } from "../utils/helpers";
import { ImportContacts } from "../services/ContactListService/ImportContacts";
import AppError from "errors/AppError";
import { logger } from "../utils/logger";


interface IndexQuery {
  searchParam?: string;
  pageNumber?: string;
  rowsPerPage?: string;
  contactListId?: string | number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber = "1", rowsPerPage = "20", contactListId } = req.query as IndexQuery;
  const { companyId } = req.user;

  logger.info('Contact List Items Request:', {
    searchParam,
    pageNumber,
    rowsPerPage,
    contactListId,
    companyId
  });

  try {
    // Validação básica
    if (!contactListId) {
      logger.warn('Missing contactListId');
      return res.status(400).json({
        error: "ContactListId is required"
      });
    }

    const page = Math.max(1, parseInt(pageNumber.toString()));
    const limit = Math.max(1, parseInt(rowsPerPage.toString()));

    const { contacts, count, hasMore } = await ListService({
      searchParam: searchParam || "",
      pageNumber: page,
      companyId: parseInt(companyId.toString()),
      contactListId: parseInt(contactListId.toString()),
      limit
    });

    logger.info('Contact List Items Response:', {
      count,
      hasMore,
      contactsCount: contacts.length
    });

    return res.status(200).json({
      contacts,
      count,
      hasMore
    });

  } catch (err: any) {
    logger.error('Error in contact list items:', err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;

  try {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      number: Yup.string().required().min(8).max(50),
      contactListId: Yup.number().required()
    });

    await schema.validate(data);

    const record = await CreateService({
      ...data,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ContactListItem`, {
        action: "create",
        record
      });

    // Também notificar a lista específica
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ContactListItem-${data.contactListId}`, {
        action: "create",
        record
      });

    return res.status(200).json(record);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    logger.error("Error creating contact list item:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const record = await ShowService(id);
    return res.status(200).json(record);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = req.body;

  try {
    // Validação básica
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      number: Yup.string().required().min(8).max(50)
    });

    await schema.validate(data);

    const record = await UpdateService({
      ...data,
      id
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ContactListItem`, {
        action: "update",
        record
      });

    // Também notificar a lista específica
    if (record.contactListId) {
      io.to(`company-${companyId}-mainchannel`)
        .emit(`company-${companyId}-ContactListItem-${record.contactListId}`, {
          action: "update",
          record
        });
    }

    return res.status(200).json(record);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    logger.error("Error updating contact list item:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const record = await ShowService(id);
    const contactListId = record.contactListId;

    await DeleteService(id);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ContactListItem`, {
        action: "delete",
        id
      });

    // Também notificar a lista específica
    if (contactListId) {
      io.to(`company-${companyId}-mainchannel`)
        .emit(`company-${companyId}-ContactListItem-${contactListId}`, {
          action: "delete",
          id
        });
    }

    return res.status(200).json({ message: "Contact list item deleted" });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    logger.error("Error deleting contact list item:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const findList = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, contactListId } = req.query;

  try {
    if (!companyId || !contactListId) {
      return res.status(400).json({ error: "companyId and contactListId are required" });
    }

    const records = await FindService({ companyId: +companyId, contactListId: +contactListId });
    return res.status(200).json(records);
  } catch (err) {
    logger.error("Error finding contact list items:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const upload = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const file: Express.Multer.File = head(files) as Express.Multer.File;
    const { id } = req.params;
    const { companyId } = req.user;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Primeiro enviar resposta para não bloquear o cliente
    res.status(200).json({ message: "Arquivo enviado, aguarde o processamento!" });

    // Processar em segundo plano
    ImportContacts(+id, companyId, file).then((response) => {
      const io = getIO();

      io
        .to(`company-${companyId}-mainchannel`)
        .emit(`company-${companyId}-ContactListItem-${+id}`, {
          action: "reload",
          records: response
        });
    }).catch(error => {
      logger.error("Error importing contacts:", error);
      // Notificar erro via socket se necessário
      const io = getIO();
      io
        .to(`company-${companyId}-mainchannel`)
        .emit(`company-${companyId}-ContactListItem-${+id}`, {
          action: "error",
          message: "Erro ao importar contatos"
        });
    });
  } catch (error) {
    logger.error("Error in upload endpoint:", error);
    // Cliente já recebeu resposta, então apenas logamos o erro
  }
};