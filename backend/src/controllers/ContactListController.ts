import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { ImportContacts } from "../services/ContactListService/ImportContacts";
import { ExportContacts } from "../services/ContactListService/ExportContacts";
import { ImportContactsFromSystem } from "services/ContactListService/ImportContactsFromSystem";

import ListService from "../services/ContactListService/ListService";
import CreateService from "../services/ContactListService/CreateService";
import ShowService from "../services/ContactListService/ShowService";
import UpdateService from "../services/ContactListService/UpdateService";
import DeleteService from "../services/ContactListService/DeleteService";
import FindService from "../services/ContactListService/FindService";
import { head } from "../utils/helpers";

import ContactList from "../models/ContactList";
import AppError from "../errors/AppError";
import { logger } from "utils/logger";
import path from 'path';

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  companyId: string | number;
};

type StoreData = {
  name: string;
  companyId: string;
};

type FindParams = {
  companyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    name: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await CreateService({
    ...data,
    companyId
  });

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-ContactList`, {
      action: "create",
      record
    });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const record = await ShowService(id);
  return res.status(200).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as StoreData;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;
  const record = await UpdateService({
    ...data,
    id
  });

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-ContactList`, {
      action: "update",
      record
    });

  return res.status(200).json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id);

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-ContactList`, {
      action: "delete",
      id
    });

  return res.status(200).json({ message: "Contact list deleted" });
};

export const findList = async (req: Request, res: Response): Promise<Response> => {
  const params = req.query as FindParams;
  const records: ContactList[] = await FindService(params);
  return res.status(200).json(records);
};

// Adicione este novo método ao ContactListController.ts

export const exportContacts = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const buffer = await ExportContacts(+id, companyId, res);
    res.send(buffer);
  } catch (err) {
    logger.error('Erro ao exportar contatos:', err);
    res.status(500).json({ error: "Error exporting contacts" });
  }
};

export const upload = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const file = head(files);
    const { id } = req.params;
    const { companyId } = req.user;

    logger.info(`Iniciando upload de arquivo para lista ${id}`, {
      fileName: file?.originalname,
      fileSize: file?.size,
      mimeType: file?.mimetype
    });

    if (!file) {
      logger.error('Nenhum arquivo fornecido no upload');
      return res.status(400).json({ error: "Nenhum arquivo fornecido" });
    }

    // Validar formato do arquivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      logger.error(`Formato de arquivo inválido: ${fileExtension}`);
      return res.status(400).json({ 
        error: "Formato de arquivo inválido. Use .xlsx, .xls ou .csv" 
      });
    }

    // Responder ao usuário que o processo começou
    res.status(200).json({ 
      message: "Arquivo enviado, aguarde o processamento!",
      status: "processing"
    });
    
    // Continuar o processamento em segundo plano com tratamento de erro melhorado
    ImportContacts(+id, companyId, file)
      .then((response) => {
        logger.info(`Importação concluída com sucesso. Contatos importados: ${response.length}`);

        const io = getIO();
        io.to(`company-${companyId}-mainchannel`)
          .emit(`company-${companyId}-ContactListItem-${+id}`, {
            action: "reload",
            records: response,
            message: `Importação concluída com sucesso! ${response.length} contatos importados.`
          });
      })
      .catch(err => {
        logger.error('Erro durante a importação:', err);
        
        const io = getIO();
        io.to(`company-${companyId}-mainchannel`)
          .emit(`company-${companyId}-ContactListItem-${+id}`, {
            action: "error",
            message: `Erro na importação: ${err.message || "Falha ao processar o arquivo"}`
          });
      });
      
  } catch (err) {
    logger.error('Erro no endpoint de upload:', err);
    // Como já enviamos a resposta, não podemos enviar outra
    // Apenas logamos o erro
  }
};

export const importContacts = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { companyId } = req.user;

  ImportContactsFromSystem(+id, companyId).then((response) => {
    const io = getIO();
    io
      .to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-ContactListItem-${+id}`, {
        action: "reload",
        records: response
      });
  });

  return res.status(200).json({ 
    message: "Importação de contatos do sistema iniciada, aguarde o processamento!" 
  });
};