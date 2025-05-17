// services/SettingServices/UpdateCompanySettingService.ts
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import { SettingUpdateRequest } from "../../@types/Settings";

const UpdateCompanySettingService = async ({
  companyId,
  key,
  value
}: SettingUpdateRequest): Promise<Setting> => {
  try {
    const [setting, created] = await Setting.findOrCreate({
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

    if (!created) {
      await setting.update({ value });
    }

    return setting;
  } catch (err) {
    logger.error({
      message: "Erro ao atualizar configuração da empresa",
      companyId,
      key,
      error: err
    });
    throw new AppError("ERR_UPDATING_COMPANY_SETTING", 500);
  }
};

export default UpdateCompanySettingService;