import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import { BaseSetting } from "../../@types/Settings";
import { logger } from "../../utils/logger";

const ListSettingByValueService = async (
  value: string
): Promise<BaseSetting | undefined> => {
  try {
    const settings = await Setting.findOne({
      where: { value }
    });

    if (!settings) {
      throw new AppError("ERR_NO_KEY_FOUND", 404);
    }

    return { 
      key: settings.key, 
      value: settings.value, 
      companyId: settings.companyId 
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error({
      message: "Erro ao buscar configuração por valor",
      value,
      error
    });
    throw new AppError("ERR_LIST_SETTING_BY_VALUE", 500);
  }
};

export default ListSettingByValueService;