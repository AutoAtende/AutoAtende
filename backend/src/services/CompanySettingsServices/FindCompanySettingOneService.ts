import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";

interface Request {
    companyId: number;
    key?: string;
}

const FindCompanySettingOneService = async ({ companyId, key }: Request): Promise<Setting> => {
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
        message: "Error retrieving company setting",
        companyId,
        key,
        error: err
      });
  
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError("ERR_FINDING_COMPANY_SETTING");
    }
  };

export default FindCompanySettingOneService;