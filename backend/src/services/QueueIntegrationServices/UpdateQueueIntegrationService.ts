import * as Yup from "yup";

import AppError from "../../errors/AppError";
import QueueIntegrations from "../../models/QueueIntegrations";
import ShowIntegrationService from "./ShowQueueIntegrationService";

interface IntegrationData {
  type?: string;
  name?: string;
  projectName?: string;
  jsonContent?: string;
  language?: string;
  urlN8N?: string;
  n8nApiKey?: string;
  assistantId?: string; 
  typebotSlug?: string;
  typebotExpires?: number;
  typebotKeywordFinish?: string;
  typebotUnknownMessage?: string;
  typebotDelayMessage?: number;
  typebotKeywordRestart?: string;
  typebotRestartMessage?: string;
}

interface Request {
  integrationData: IntegrationData;
  integrationId: string;
  companyId: number;
}

const UpdateQueueIntegrationService = async ({
  integrationData,
  integrationId,
  companyId
}: Request): Promise<QueueIntegrations> => {
  const schema = Yup.object().shape({
    type: Yup.string().min(2),
    name: Yup.string().min(2)
  });

  const {
    type,
    name,
    projectName,
    assistantId,
    jsonContent,
    language,
    urlN8N,
    n8nApiKey,
    typebotExpires,
    typebotKeywordFinish,
    typebotSlug,
    typebotUnknownMessage,
    typebotDelayMessage,
    typebotKeywordRestart,
    typebotRestartMessage
  } = integrationData;

  try {
    await schema.validate({ type, name, projectName, jsonContent, language, urlN8N, n8nApiKey });
  } catch (err) {
    throw new AppError(err.message);
  }

  const integration = await ShowIntegrationService(integrationId, companyId);

  await integration.update({
    type,
    name,
    projectName,
    assistantId,
    jsonContent,
    language,
    urlN8N,
    n8nApiKey,
    companyId,
    typebotExpires,
    typebotKeywordFinish,
    typebotSlug,
    typebotUnknownMessage,
    typebotDelayMessage,
    typebotKeywordRestart,
    typebotRestartMessage
  });

  return integration;
};

export default UpdateQueueIntegrationService;
