// services/SettingServices/GetSettingService.ts
import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import { UserSettingRequest, SAFE_SETTINGS, isSafeSetting } from "../../@types/Settings";
import { logger } from "../../utils/logger";

export const GetSettingService = async ({
  key,
  user
}: UserSettingRequest): Promise<string> => {
  try {
    // Verificar permissões
    if (user.profile !== "admin" && !isSafeSetting(key)) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const setting = await Setting.findOne({
      where: {
        companyId: user.companyId,
        key
      }
    });

    // Se não encontrou configuração e é uma configuração segura, retorna valor padrão
    if (!setting && key in SAFE_SETTINGS) {
      return SAFE_SETTINGS[key];
    }

    return setting?.value || "";
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error({
      message: "Erro ao obter configuração",
      key,
      companyId: user.companyId,
      error
    });
    throw new AppError("ERR_GET_SETTING", 500);
  }
};

export default GetSettingService;