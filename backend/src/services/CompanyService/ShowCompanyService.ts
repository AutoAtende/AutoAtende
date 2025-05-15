import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface UsageMetrics {
  used: number;
  total: number;
  percentage: number;
}

interface CompanyMetrics {
  usersUsage: UsageMetrics;
  connectionsUsage: UsageMetrics;
  queuesUsage: UsageMetrics;
}

interface CompanyWithMetrics extends Company {
  metrics: CompanyMetrics;
}

const ShowCompanyService = async (id: string | number): Promise<CompanyWithMetrics> => {
  try {
    const company = await Company.findByPk(parseInt(id.toString()), {
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: [
            "id", "name", "users", "connections", "queues", "value",
            "useCampaigns", "useSchedules", "useInternalChat", "useExternalApi"
          ]
        },
        {
          model: Queue,
          as: "queues",
          attributes: ["id", "name", "status"]
        },
        {
          model: Whatsapp,
          as: "whatsapps",
          attributes: ["id", "name", "status", "number"]
        },
        {
          model: Setting,
          as: "settings",
          attributes: ["key", "value"]
        }
      ]
    });

    if (!company) {
      logger.error(`Company not found: ${id}`);
      throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    const {
      users: totalUsers,
      connections: totalConnections,
      queues: totalQueues
    } = company.plan;

    const usage = {
      users: await company.$count('users'),
      connections: await company.$count('whatsapps', {
        where: { status: 'CONNECTED' }
      }),
      queues: await company.$count('queues')
    };

    const metrics = {
      usersUsage: {
        used: usage.users,
        total: totalUsers,
        percentage: (usage.users / totalUsers) * 100
      },
      connectionsUsage: {
        used: usage.connections,
        total: totalConnections,
        percentage: (usage.connections / totalConnections) * 100
      },
      queuesUsage: {
        used: usage.queues,
        total: totalQueues,
        percentage: (usage.queues / totalQueues) * 100
      }
    };

    const companyJson = company.toJSON();
    return {
      ...companyJson,
      metrics
    } as CompanyWithMetrics;

  } catch (err) {
    logger.error({
      message: "Error retrieving company",
      companyId: id,
      error: err
    });
    throw err;
  }
};

export default ShowCompanyService;