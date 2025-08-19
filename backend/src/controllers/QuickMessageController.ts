import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import ListService from "../services/QuickMessageService/ListService";
import CreateService from "../services/QuickMessageService/CreateService";
import ShowService from "../services/QuickMessageService/ShowService";
import UpdateService from "../services/QuickMessageService/UpdateService";
import DeleteService from "../services/QuickMessageService/DeleteService";
import FindService from "../services/QuickMessageService/FindService";
import QuickMessage from "../models/QuickMessage";
import { head } from "../utils/helpers";
import fs from "fs";
import path from "path";
import AppError from "../errors/AppError";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string;
  userId?: string;
};

type StoreData = {
  shortcode: string;
  message: string;
  userId: number;
  geral: boolean;
  audioContent?: string; // Base64 encoded audio content
  mediaName?: string;
  mediaPath?: string;
  mediaType?: string;
};

type FindParams = {
  companyId: string;
  userId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, userId } = req.query as IndexQuery;
  const { companyId } = req.user;

  const pageNum = pageNumber;
  
  // Se userId não for fornecido na requisição, use o userId do usuário autenticado
  let userIdNum: number;
  
  if (userId) {
    userIdNum = parseInt(userId, 10);
  } else {
    userIdNum = parseInt(req.user.id.toString(), 10);
  }

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber: pageNum,
    companyId,
    userId: userIdNum
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    shortcode: Yup.string().required("ERR_SHORTCODE_REQUIRED"),
    message: Yup.string().when(
      "mediaPath",
      ([mediaPath]: [string | undefined], schema: Yup.StringSchema) => {
        return mediaPath
          ? schema.notRequired()
          : schema.required("ERR_MESSAGE_REQUIRED");
      }
    ),
    audioContent: Yup.string(),
    mediaName: Yup.string()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Correção: Normalizar o caminho da mídia
  if (data.mediaPath && typeof data.mediaPath === 'string') {
    // Extrair apenas o nome do arquivo do caminho completo
    const pathParts = data.mediaPath.split('/');
    data.mediaPath = pathParts[pathParts.length - 1];
  }

  const record = await CreateService({
    ...data,
    companyId,
    userId: req.user.id,
    mediaPath: data?.mediaPath,
    mediaType: data?.mediaType,
    mediaName: data.mediaName || null
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(
    `company-${companyId}-quickmessage`,
    {
      action: "create",
      record
    }
  );

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const record = await ShowService(id);
  return res.status(200).json(record);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;
  const { companyId } = req.user;
  const { id } = req.params;
  const idNum = Number(id);

  const schema = Yup.object().shape({
    shortcode: Yup.string().required(),
    message: Yup.string().when(
      "mediaPath",
      ([mediaPath]: [string | undefined], schema: Yup.StringSchema) => {
        return mediaPath
          ? schema.notRequired()
          : schema.required("ERR_MESSAGE_REQUIRED");
      }
    ),
    audioContent: Yup.string(),
    mediaName: Yup.string()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const existingRecord = await QuickMessage.findByPk(idNum);
  if (!existingRecord) {
    throw new AppError("ERR_QUICK_MESSAGE_NOT_FOUND");
  }

  // Correção: Normalizar o caminho da mídia
  if (data.mediaPath && typeof data.mediaPath === 'string') {
    // Verificar se o caminho contém um padrão como /public/companyXXX/
    const regex = /\/public\/company\d+\/quickMessage\/(.+)/;
    const match = data.mediaPath.match(regex);
    if (match) {
      data.mediaPath = match[1];
    } else {
      // Se não corresponder ao padrão, verificar se é um path completo ou relativo
      const pathParts = data.mediaPath.split('/');
      if (pathParts.length > 1) {
        // Se tiver múltiplas partes, pegar apenas o nome do arquivo
        data.mediaPath = pathParts[pathParts.length - 1];
      }
    }
  }
  
  const record = await UpdateService({
    ...data,
    userId: Number(data.userId) || Number(req.user.id),
    id: idNum,
    mediaPath: data?.mediaPath,
    mediaType: data?.mediaType,
    mediaName: data.mediaName || null
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(
    `company-${companyId}-quickmessage`,
    {
      action: "update",
      record
    }
  );

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const record = await QuickMessage.findByPk(id);
  if (record && record.mediaPath) {
    const filePath = path.resolve(
      "public",
      `company${companyId}`,
      "quickMessage",
      record.mediaPath
    );
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
  }

  await DeleteService(id);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(
    `company-${companyId}-quickmessage`,
    {
      action: "delete",
      id
    }
  );

  return res.status(200).json({ message: "Quick message deleted" });
};

export const findList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.query as FindParams;
  const records: QuickMessage[] = await FindService(params);
  return res.status(200).json(records);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  const file = head(files);
  
  if (!file) {
    throw new AppError("ERR_NO_FILE_UPLOADED_QUICK_MESSAGE");
  }

  const { companyId } = req.user;
  
  try {
    const quickmessage = await QuickMessage.findByPk(id);
    if (!quickmessage) {
      throw new AppError("ERR_QUICK_MESSAGE_NOT_FOUND");
    }

    // Remove existing file if present
    if (quickmessage.mediaPath) {
      const filePath = path.resolve(
        "public",
        `company${companyId}`,
        "quickMessage",
        quickmessage.mediaPath
      );
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
    }

    // Determinar o tipo de mídia
    const mediaType = file.mimetype.startsWith("audio/") ? "audio" : "file";

    // Usar o nome de arquivo gerado pelo multer
    await quickmessage.update({
      mediaPath: file.filename, // Nome gerado pelo multer
      mediaName: file.originalname,
      mediaType: mediaType
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(
      `company-${companyId}-quickmessage`,
      {
        action: "update_media",
        record: quickmessage
      }
    );

    return res.send({ mensagem: "Arquivo Anexado" });
  } catch (err: any) {
    logger.error(`Erro no upload de mídia: ${err.message}`);
    throw new AppError(err.message);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  if (!req.user || !req.user.companyId) {
    throw new AppError("ERR_UNAUTHENTICATED_OR_UNIDENTIFIED_COMPANY");
  }

  try {
    const quickmessage = await QuickMessage.findByPk(id);
    if (!quickmessage) {
      throw new AppError("ERR_QUICK_MESSAGE_NOT_FOUND");
    }

    if (quickmessage.mediaPath) {
      // Caminho completo para o arquivo
      const filePath = path.resolve(
        "public",
        `company${companyId}`,
        "quickMessage",
        quickmessage.mediaPath
      );
      
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
        logger.info(`Arquivo excluído: ${filePath}`);
      } else {
        logger.warn(`Arquivo não encontrado: ${filePath}`);
      }
    }

    await quickmessage.update({
      mediaPath: null,
      mediaName: null,
      mediaType: null
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(
      `company-${companyId}-quickmessage`,
      {
        action: "delete_media",
        id: quickmessage.id
      }
    );

    return res.send({ mensagem: "Arquivo Excluído" });
  } catch (err: any) {
    logger.error(`Erro ao excluir mídia: ${err.message}`);
    throw new AppError(err.message);
  }
};