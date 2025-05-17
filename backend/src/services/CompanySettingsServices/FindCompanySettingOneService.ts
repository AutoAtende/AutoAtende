import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import { SettingRequest } from "../../@types/Settings";

const FindCompanySettingOneService = async ({ companyId, key }: SettingRequest): Promise<Setting> => {
  try {
    const setting = await Setting.findOne({
      where: {
        companyId,
        key
      }
    });

    if (!setting) {
      throw new AppError("ERR_NO_SETTING_FOUND", 404);
    }

    return setting;
  } catch (err) {
    logger.error({
      message: "Erro ao buscar configuração da empresa",
      companyId,
      key,
      error: err
    });

    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_FINDING_COMPANY_SETTING", 500);
  }
};

export default FindCompanySettingOneService;