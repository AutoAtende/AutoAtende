import QueueIntegrations from "../../models/QueueIntegrations";


const GetOpenAIQueueIntegrationService = async (companyId: number): Promise<QueueIntegrations> => {
  if (companyId) {
    const openAIIntegration = await QueueIntegrations.findOne({
      where: {
        companyId,
        type: 'openAI'
      }
    })
    return openAIIntegration || null;
  } else {
    return null
  }
};

export default GetOpenAIQueueIntegrationService;
