import { WhereOptions } from "sequelize";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
  key?: string;
}

const FindCompanySettingsService = async ({ companyId }: Request): Promise<Setting[]> => {
  try {
    const where: WhereOptions = { companyId };

    const settings = await Setting.findAll({
      where,
      attributes: ["key", "value"],
      order: [["key", "ASC"]]
    });

    return settings;
  } catch (err) {
    logger.error({
      message: "Error retrieving company settings",
      companyId,
      error: err
    });
    throw new AppError("ERR_FINDING_COMPANY_SETTINGS");
  }
};

export default FindCompanySettingsService;