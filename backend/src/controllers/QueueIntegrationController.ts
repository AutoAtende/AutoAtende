import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import CreateQueueIntegrationService from "../services/QueueIntegrationServices/CreateQueueIntegrationService";
import DeleteQueueIntegrationService from "../services/QueueIntegrationServices/DeleteQueueIntegrationService";
import ListQueueIntegrationService from "../services/QueueIntegrationServices/ListQueueIntegrationService";
import ShowQueueIntegrationService from "../services/QueueIntegrationServices/ShowQueueIntegrationService";
import UpdateQueueIntegrationService from "../services/QueueIntegrationServices/UpdateQueueIntegrationService";
import CreateOrUpdateQueueIntegrationN8NWebhookByParamNameService from "../services/QueueIntegrationServices/CreateOrUpdateQueueIntegrationN8NWebhookByParamNameService";
import QueueIntegrations from "../models/QueueIntegrations";
import GetOpenAIQueueIntegrationService from "../services/QueueIntegrationServices/GetOpenAIQueueIntegrationService";
import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { queueIntegrations, count, hasMore } = await ListQueueIntegrationService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.status(200).json({ queueIntegrations, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type, name, projectName, jsonContent, language, urlN8N, n8nApiKey,
      typebotExpires,
      typebotKeywordFinish,
      typebotSlug,
      typebotUnknownMessage,
      typebotKeywordRestart,
      generatedViaParameters,
      assistantId,
      typebotRestartMessage } = req.body;
    const { companyId } = req.user;

    // Ensure projectName is not empty
    const finalProjectName = projectName || name || `Project_${Date.now()}`;

    const queueIntegration = await CreateQueueIntegrationService({
      type, 
      name, 
      projectName: finalProjectName, 
      jsonContent, 
      language, 
      urlN8N, 
      n8nApiKey, 
      companyId,
      assistantId,
      typebotExpires,
      typebotKeywordFinish,
      typebotSlug,
      typebotUnknownMessage,
      typebotKeywordRestart,
      typebotRestartMessage,
      generatedViaParameters
    });

    const io = getIO();
    io
      .to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-queueIntegration`, {
        action: "create",
        queueIntegration
      });

    return res.status(200).json(queueIntegration);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Project name must be unique" });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const createOrUpdateWebhookN8N = async (req: Request, res: Response): Promise<Response> => {
  const { 
    type, 
    name, 
    projectName,
    urlN8N,
    generatedViaParameters,
    companyId
  } = req.body;
  const queueIntegration = await CreateOrUpdateQueueIntegrationN8NWebhookByParamNameService({
    type, 
    name, 
    projectName, 
    urlN8N, 
    generatedViaParameters,
    companyId,
  });

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-queueIntegration`, {
      action: "create_or_update",
      queueIntegration
    });

  return res.status(200).json(queueIntegration);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { integrationId } = req.params;
  const { companyId } = req.user;

  const queueIntegration = await ShowQueueIntegrationService(integrationId, companyId);

  return res.status(200).json(queueIntegration);
};

export const getOpenAIIntegrations = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const queueIntegration = await GetOpenAIQueueIntegrationService(companyId);

  return res.status(200).json(queueIntegration);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { integrationId } = req.params;
  const integrationData = req.body;
  const { companyId } = req.user;

  const queueIntegration = await UpdateQueueIntegrationService({ integrationData, integrationId, companyId });

  const io = getIO();
  io.emit(`company-${companyId}-queueIntegration`, {
    action: "update",
    queueIntegration
  });

  return res.status(201).json(queueIntegration);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { integrationId } = req.params;
    const { companyId } = req.user;

    // Verificar se a integração existe antes de tentar excluir
    const integration = await QueueIntegrations.findOne({
      where: { id: integrationId, companyId }
    });

    if (!integration) {
      throw new AppError("ERR_INTEGRATION_NOT_FOUND", 404);
    }

    await DeleteQueueIntegrationService(integrationId);

    const io = getIO();
    io.emit(`company-${companyId}-queueIntegration`, {
      action: "delete",
      integrationId: +integrationId
    });

    return res.status(200).json({ message: "Integration deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Error deleting integration:", error);
    return res.status(500).json({ error: "An error occurred while deleting the integration" });
  }
};

export const removeByParamName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { paramName } = req.body;
    const { companyId } = req.user;

    const data = await QueueIntegrations.findOne({
      where: { 
        generatedViaParameters: paramName,
        companyId
      }
    });

    if (!data) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    await DeleteQueueIntegrationService(data.id.toString());
  
    const io = getIO();
    io.emit(`company-${companyId}-queueIntegration`, {
      action: "delete",
      integrationId: +data.id
    });
    
    return res.status(200).json({ message: "Integration deleted successfully" });
  } catch (error) {
    console.error("Error deleting integration by param name:", error);
    return res.status(500).json({ error: "An error occurred while deleting the integration" });
  }
};

export const getWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { paramName } = req.body;
    const { companyId } = req.user;

    const data = await QueueIntegrations.findOne({
      where: { 
        generatedViaParameters: paramName,
        companyId
      }
    });

    if (!data) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching webhook:", error);
    return res.status(500).json({ error: "An error occurred while fetching the webhook" });
  }
};