import { Request, Response } from "express";
import * as Yup from "yup";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import Assistant from "../models/Assistant";
import AssistantFile from "../models/AssistantFile";
import OpenAI from "openai";
import ListAssistantsService from "../services/AssistantServices/ListAssistantsService";
import CreateAssistantService from "../services/AssistantServices/CreateAssistantService";
import ShowAssistantService from "../services/AssistantServices/ShowAssistantService";
import UpdateAssistantService from "../services/AssistantServices/UpdateAssistantService";
import DeleteAssistantService from "../services/AssistantServices/DeleteAssistantService";
import UploadFileToAssistantService from "../services/AssistantServices/UploadFileToAssistantService";
import FetchOpenAIAssistantsService from "../services/AssistantServices/FetchOpenAIAssistantsService";
import ManageAssistantFunctionsService from "../services/AssistantServices/ManageAssistantFunctionsService";
import ImportAssistantsService from "../services/AssistantServices/ImportAssistantsService";

interface CustomRequest extends Request {
  user: {
    id: string;
    profile: string;
    isSuper: boolean;
    companyId: number;
  };
  files?: {
    file: Express.Multer.File[];
  };
}

export const index = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as { searchParam?: string; pageNumber?: string };
  const { companyId } = req.user;

  try {
    const { assistants, count, hasMore } = await ListAssistantsService({
      searchParam,
      pageNumber: parseInt(pageNumber || "1"),
      companyId
    });

    return res.json({ assistants, count, hasMore });
  } catch (error) {
    console.error("Error listing assistants:", error);
    return res.status(200).json({ assistants: [], count: 0, hasMore: false });
  }
};

export const store = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    instructions: Yup.string().required(),
    model: Yup.string().required(),
    openaiApiKey: Yup.string().required(),
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const newAssistant = await CreateAssistantService({
    ...req.body,
    companyId
  });

  return res.status(200).json(newAssistant);
};

export const show = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const assistant = await ShowAssistantService({ id, companyId });

  return res.status(200).json(assistant);
};

export const update = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const assistantData = req.body;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string(),
    instructions: Yup.string(),
    model: Yup.string(),
    openaiApiKey: Yup.string(),
    active: Yup.boolean()
  });

  try {
    await schema.validate(assistantData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const assistant = await UpdateAssistantService({ assistantData, assistantId: id, companyId });

  return res.status(200).json(assistant);
};

export const remove = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteAssistantService({ assistantId: id, companyId });

  return res.status(200).json({ message: "Assistant deleted" });
};

export const uploadFile = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { files } = req;
  const { toolType } = req.body;

  if (!files || !files.file) {
    throw new AppError("No files uploaded", 400);
  }

  // Processar todos os arquivos enviados
  const uploadedFiles = await Promise.all(
    (files.file || []).map(async (file: Express.Multer.File) => {
      return await UploadFileToAssistantService({
        assistantId: id,
        file,
        companyId,
        toolType
      });
    })
  );

  return res.status(200).json(uploadedFiles);
};

export const fetchOpenAIAssistants = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { apiKey } = req.body;
  const { companyId } = req.user;

  if (!apiKey) {
    return res.status(400).json({ 
      error: true, 
      message: "API key é obrigatória" 
    });
  }

  try {
    const assistants = await FetchOpenAIAssistantsService({
      openaiApiKey: apiKey,
      companyId
    });

    return res.status(200).json(assistants);

  } catch (error) {
    logger.error({ 
      companyId,
      error: error.message 
    }, "[fetchOpenAIAssistants] Error");
    
    return res.status(error.statusCode || 500).json({
      error: true,
      message: error.message || "Erro ao buscar assistentes"
    });
  }
};

export const importAssistants = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { assistantIds, apiKey } = req.body;
  const { companyId } = req.user;

  if (!apiKey || !assistantIds?.length) {
    return res.status(400).json({
      error: true,
      message: "API key e IDs dos assistentes são obrigatórios"
    });
  }

  try {
    const importedAssistants = await ImportAssistantsService({
      openaiApiKey: apiKey,
      assistantIds,
      companyId
    });

    return res.status(200).json(importedAssistants);

  } catch (error) {
    logger.error({ 
      companyId,
      error: error.message 
    }, "[importAssistants] Error");
    
    return res.status(error.statusCode || 500).json({
      error: true,
      message: error.message || "Erro ao importar assistentes"
    });
  }
};

export const manageFunctions = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { functions } = req.body;
  const { companyId } = req.user;

  const assistant = await ManageAssistantFunctionsService({
    assistantId: id,
    companyId,
    functions
  });

  return res.status(200).json(assistant);
};

export const listFiles = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  // Verificar se o assistente pertence à empresa
  const assistant = await Assistant.findOne({
    where: { id, companyId }
  });

  if (!assistant) {
    throw new AppError("Assistente não encontrado", 404);
  }

  const assistantFiles = await AssistantFile.findAll({
    where: { assistantId: id },
    order: [['createdAt', 'DESC']]
  });

  return res.status(200).json(assistantFiles);
};

export const removeFile = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id, fileId } = req.params;
  const { companyId } = req.user;

  // Verificar se o assistente pertence à empresa
  const assistant = await Assistant.findOne({
    where: { id, companyId }
  });

  if (!assistant) {
    throw new AppError("Assistente não encontrado", 404);
  }

  const file = await AssistantFile.findOne({
    where: { id: fileId, assistantId: id }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  // Remover o arquivo da OpenAI
  const openai = new OpenAI({
    apiKey: assistant.openaiApiKey
  });

  try {
    // Se for um arquivo de vector store, remover primeiro do vector store
    if (file.toolType === "file_search" && assistant.vectorStoreId) {
      await openai.vectorStores.files.del(
        assistant.vectorStoreId,
        file.fileId
      );
    }

    // Remover o arquivo da OpenAI
    await openai.files.del(file.fileId);

    // Remover o arquivo do banco de dados
    await file.destroy();

    // Se for um arquivo de code_interpreter, atualizar os tool_resources
    if (file.toolType === "code_interpreter" && assistant.toolResources) {
      const toolResources = assistant.toolResources;
      if (toolResources.code_interpreter && toolResources.code_interpreter.file_ids) {
        toolResources.code_interpreter.file_ids = toolResources.code_interpreter.file_ids.filter(
          id => id !== file.fileId
        );

        // Atualizar o assistente na OpenAI
        await openai.beta.assistants.update(assistant.assistantId, {
          tool_resources: toolResources
        });

        // Atualizar o registro local
        await assistant.update({ toolResources });
      }
    }

    return res.status(200).json({ message: "Arquivo removido com sucesso" });
  } catch (error) {
    logger.error({
      companyId,
      assistantId: id,
      fileId,
      error: error.message
    }, "Erro ao remover arquivo");

    throw new AppError("Erro ao remover arquivo. Por favor, tente novamente.", 500);
  }
};