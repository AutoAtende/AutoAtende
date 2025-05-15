
import AppError from "../../errors/AppError";
import QueueIntegrations from "../../models/QueueIntegrations";


interface Request {
  type: string;
  name: string;
  projectName: string;
  urlN8N: string;
  generatedViaParameters: string;
  companyId: number;
}

const CreateOrUpdateQueueIntegrationN8NWebhookByParamNameService = async ({
  type,
  name,
  projectName,
  urlN8N,
  generatedViaParameters,
  companyId
}: Request): Promise<QueueIntegrations> => {
  try {

    const queueIntegrations = await QueueIntegrations.findOne({
      where: {
        generatedViaParameters,
        companyId
      }
    })

    if (queueIntegrations?.id) {
      await queueIntegrations.update({
          type,
            name,
            projectName,
            urlN8N,
            generatedViaParameters,
            companyId,
            /** 
             * @description Colunas obrigatórias */
            jsonContent: "",
            language: "",
            n8nApiKey: "",
            typebotDelayMessage: 1000,
            typebotExpires: 1,
            typebotKeywordFinish: "",
            typebotKeywordRestart: "",
            typebotRestartMessage: "",
            typebotSlug: "",
            typebotUnknownMessage: ""
        }
      );
    } else {
      await QueueIntegrations.create({
          type,
            name,
            projectName,
            urlN8N,
            generatedViaParameters,
            companyId,
            /** 
             * @description Colunas obrigatórias */
            jsonContent: "",
            language: "",
            n8nApiKey: "",
            typebotDelayMessage: 1000,
            typebotExpires: 1,
            typebotKeywordFinish: "",
            typebotKeywordRestart: "",
            typebotRestartMessage: "",
            typebotSlug: "",
            typebotUnknownMessage: ""
        }
      );

    }

    return queueIntegrations;
  } catch (error) {
    throw new AppError('ERR_GENERIC')
  }

};

export default CreateOrUpdateQueueIntegrationN8NWebhookByParamNameService;
