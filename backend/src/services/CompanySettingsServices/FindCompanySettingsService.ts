import { WhereOptions } from "sequelize";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface CompanySettingsRequest {
  companyId: number;
}

const FindCompanySettingsService = async ({ companyId }: CompanySettingsRequest): Promise<Setting[]> => {
  try {
    const where: WhereOptions = { companyId };

    const settings = await Setting.findAll({
      where,
      attributes: ["key", "value"],
      order: [["key", "ASC"]]
    });

    return settings;
  } catch (error) {
    logger.error({
      message: "Erro ao buscar configurações da empresa",
      companyId,
      error
    });
    throw new AppError("ERR_FINDING_COMPANY_SETTINGS", 500);
  }
};

export default FindCompanySettingsService;