import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface UpdateRequest {
  companyId: number;
  key: string;
  value: string;
}

const UpdateCompanySettingService = async ({
  companyId,
  key,
  value
}: UpdateRequest): Promise<Setting> => {
  try {
    const [setting] = await Setting.findOrCreate({
      where: {
        companyId,
        key
      },
      defaults: {
        companyId,
        key,
        value
      }
    });

    if (!setting.isNewRecord) {
      await setting.update({ value });
    }

    return setting;
  } catch (err) {
    logger.error({
      message: "Error updating company setting",
      companyId,
      key,
      error: err
    });
    throw new AppError("ERR_UPDATING_COMPANY_SETTING");
  }
};


export default UpdateCompanySettingService;