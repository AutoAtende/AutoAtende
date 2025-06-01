import Company from "../../models/Company";
import Plan from "../../models/Plan";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import path from "path";
import fs from "fs/promises";

interface CompanyMetrics {
  folderSize: number;
  numberOfFiles: number;
  lastUpdated: Date | null;
}

interface CompanyWithMetrics extends Company {
  metrics: CompanyMetrics;
}

export const calculateCompanyMetrics = async (companyId: number): Promise<CompanyMetrics> => {
  const companyDir = path.join(
    process.env.BACKEND_PUBLIC_PATH || "public",
    `company${companyId}`
  );

  try {
    const exists = await fs.access(companyDir)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return {
        folderSize: 0,
        numberOfFiles: 0,
        lastUpdated: null
      };
    }

    const files = await fs.readdir(companyDir);
    let totalSize = 0;
    let lastUpdated = new Date(0);

    for (const file of files) {
      const filePath = path.join(companyDir, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      if (stats.mtime > lastUpdated) {
        lastUpdated = stats.mtime;
      }
    }

    return {
      folderSize: totalSize,
      numberOfFiles: files.length,
      lastUpdated: files.length > 0 ? lastUpdated : null
    };

  } catch (err) {
    logger.error({
      message: "Error calculating company metrics",
      companyId,
      error: err
    });
    return {
      folderSize: 0,
      numberOfFiles: 0,
      lastUpdated: null
    };
  }
};

const ListCompaniesPlanService = async (): Promise<CompanyWithMetrics[]> => {
  try {
    const companies = await Company.findAll({
      attributes: [
        "id", 
        "name", 
        "email", 
        "status", 
        "dueDate", 
        "lastLogin",
        "createdAt", 
        "phone",
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
          "whiteLabel"
        ]
      }],
      order: [["name", "ASC"]]
    });

    // Adicionar métricas para cada empresa
    const companiesWithMetrics = await Promise.all(
      companies.map(async (company) => {
        const metrics = await calculateCompanyMetrics(company.id);
        const companyJson = company.toJSON();
        return {
          ...companyJson,
          metrics
        } as CompanyWithMetrics;
      })
    );

    return companiesWithMetrics;
  } catch (err) {
    logger.error({
      message: "Error listing companies with plans",
      error: err
    });
    throw new AppError("ERR_LIST_COMPANIES_PLANS");
  }
};

export default ListCompaniesPlanService;