import Company from "../../models/Company";
import Plan from "../../models/Plan";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface PlanUsageMetrics {
  users: {
    used: number;
    total: number;
    percentage: number;
  };
  connections: {
    used: number;
    total: number;
    percentage: number;
  };
  queues: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface CompanyWithPlanDetails extends Company {
  planMetrics: PlanUsageMetrics;
}

const ShowPlanCompanyService = async (id: string | number): Promise<CompanyWithPlanDetails> => {
  try {
    const company = await Company.findOne({
      where: { id },
      attributes: [
        "id",
        "name",
        "email",
        "status",
        "dueDate",
        "createdAt",
        "lastLogin",
        "phone",
        "planId",
        "urlPBX"
      ],
      include: [{
        model: Plan,
        as: "plan",
        attributes: [
          "id",
          "name",
          "users",
          "connections",
          "queues",
          "value",
          "useCampaigns",
          "useSchedules",
          "useInternalChat",
          "useExternalApi",
          "useKanban",
          "useOpenAi",
          "useIntegrations",
          "useEmail",
          "whiteLabel",
          "useOpenAIAssistants",
          "useFlowBuilder",
          "useAPIOfficial",
          "useChatBotRules",
          "storageLimit",
          "openAIAssistantsContentLimit"
        ]
      }]
    });

    if (!company) {
      throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    // Calcular uso atual do plano
    const [usersCount, connectionsCount, queuesCount] = await Promise.all([
      company.$count('users'),
      company.$count('whatsapps', {
        where: { status: 'CONNECTED' }
      }),
      company.$count('queues')
    ]);

    const planMetrics = {
      users: {
        used: usersCount,
        total: company.plan.users,
        percentage: (usersCount / company.plan.users) * 100
      },
      connections: {
        used: connectionsCount,
        total: company.plan.connections,
        percentage: (connectionsCount / company.plan.connections) * 100
      },
      queues: {
        used: queuesCount,
        total: company.plan.queues,
        percentage: (queuesCount / company.plan.queues) * 100
      }
    };

    const companyJson = company.toJSON();
    return {
      ...companyJson,
      planMetrics
    } as CompanyWithPlanDetails;

  } catch (err) {
    logger.error({
      message: "Error retrieving company plan details",
      companyId: id,
      error: err
    });

    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_SHOW_COMPANY_PLAN");
  }
};

export default ShowPlanCompanyService;