import * as Yup from "yup";

import AppError from "../../errors/AppError";
import QueueIntegrations from "../../models/QueueIntegrations";


interface Request {
  type: string;
  name: string;
  projectName: string;
  jsonContent: string;
  language: string;
  urlN8N?: string;
  n8nApiKey?: string;
  companyId: number;
  assistantId?: string; 
  typebotSlug?: string;
  typebotExpires?: number;
  typebotKeywordFinish?: string;
  typebotUnknownMessage?: string;
  typebotDelayMessage?: number;
  typebotKeywordRestart?: string;
  typebotRestartMessage?: string;
  generatedViaParameters?: string;
}

const CreateQueueIntegrationService = async ({
  type,
  name,
  projectName,
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
  typebotDelayMessage,
  typebotKeywordRestart,
  typebotRestartMessage,
  generatedViaParameters
}: Request): Promise<QueueIntegrations> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required('ERR_NAME_INTEGRATION_REQUIRED')
      .min(2, "ERR_NAME_INTEGRATION_MIN_2")
      .max(50, "ERR_NAME_INTEGRATION_MAX_50")
      .test(
        "Check-name",
        "ERR_NAME_INTEGRATION_ALREADY_EXISTS",
        async value => {
          if (!value) return false;
          const nameExists = await QueueIntegrations.findOne({
            where: {
              name: value,
              companyId
            }
          });
          return !nameExists;
        }
      ),
    type: Yup.string()
      .test(
        "Check-type",
        "ERR_NAME_INTEGRATION_OPENAI_ALREADY_EXISTS",
        async type => {
          if (!type) return false;
          if (type === 'openAI') {
            const nameExists = await QueueIntegrations.findOne({
              where: {
                type: type,
                companyId
              }
            });
            return !nameExists;
          }
          return true;
        }
      )  
  });

  try {
    await schema.validate({ type, name });
  } catch (err) {
    throw new AppError(err.message);
  }


  const queueIntegration = await QueueIntegrations.create({
    type,
    name,
    projectName,
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
    typebotDelayMessage,
    typebotKeywordRestart,
    typebotRestartMessage,
    generatedViaParameters
  }
  );

  return queueIntegration;
};

export default CreateQueueIntegrationService;
