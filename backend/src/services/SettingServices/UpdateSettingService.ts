import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import { SettingUpdateRequest } from "../../@types/Settings";
import { logger } from "../../utils/logger";

const UpdateSettingService = async ({
  key,
  value,
  companyId
}: SettingUpdateRequest): Promise<Setting> => {
  try {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        key,
        companyId
      }, 
      defaults: {
        key,
        value,
        companyId
      }
    });

    if (!created && setting?.companyId !== companyId) {
      throw new AppError("Não é possível consultar registros de outra empresa", 403);
    }

    if (!setting) {
      throw new AppError("ERR_NO_SETTING_FOUND", 404);
    }

    await setting.update({ value });

    return setting;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error({
      message: "Erro ao atualizar configuração",
      key,
      companyId,
      error
    });
    throw new AppError("ERR_UPDATE_SETTING", 500);
  }
};

export default UpdateSettingService;