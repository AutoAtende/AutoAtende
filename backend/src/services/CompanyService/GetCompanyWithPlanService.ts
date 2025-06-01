import Company from "../../models/Company";
import Plan from "../../models/Plan";
import { logger } from "../../utils/logger";


const GetCompanyWithPlanService = async (companyId: number): Promise<Company | null> => {
  try {
    const company = await Company.findByPk(companyId, {
      include: [{
        model: Plan,
        as: "plan",
        attributes: [
          "id", "name", "users", "connections", "queues", "value",
          "useCampaigns", "useSchedules", "useInternalChat", "useExternalApi",
          "useKanban", "useOpenAi", "useIntegrations", "useEmail", "whiteLabel",
          "isVisible", "useOpenAIAssistants", "useFlowBuilder", "useAPIOfficial",
          "useChatBotRules", "storageLimit", "openAIAssistantsContentLimit"
        ]
      }]
    });

    if (!company) return null;

    // Converter para objeto simples e fazer cast para o tipo correto
    const companyJson = company.toJSON() as Company;
    return companyJson;
  } catch (err) {
    logger.error({
      message: "Error getting company with plan",
      companyId,
      error: err
    });
    throw new Error("ERR_GET_COMPANY_WITH_PLAN");
  }
};

export default GetCompanyWithPlanService;