import Setting from "../../models/Setting";
import { DEFAULT_COMPANY_ID, isSuperSetting } from "../../@types/Settings";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface SuperSettingRequest {
  key: string;
}

const GetSuperSettingService = async ({
  key
}: SuperSettingRequest): Promise<string | null> => {
  try {
    if (!isSuperSetting(key)) {
      return null;
    }

    const setting = await Setting.findOne({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        key
      }
    });

    return setting?.value || null;
  } catch (error) {
    logger.error({
      message: "Erro ao obter configuração super",
      key,
      error
    });
    throw new AppError("ERR_GET_SUPER_SETTING", 500);
  }
};

export default GetSuperSettingService;