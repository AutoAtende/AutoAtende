// services/SettingServices/GetPublicSettingService.ts
import Setting from "../../models/Setting";
import AppError from "../../errors/AppError";
import { 
  PUBLIC_SETTINGS_KEYS, 
  DEFAULT_COMPANY_ID, 
  PublicSettingRequest 
} from "../../@types/Settings";
import { logger } from "../../utils/logger";

export const GetAllPublicSettingsService = async (companyId?: number): Promise<Setting[] | undefined> => {
  try {
    // Se não fornecido companyId, usa o padrão 1
    const targetCompanyId = companyId || DEFAULT_COMPANY_ID;

    const companySettings = await Setting.findAll({
      where: {
        key: PUBLIC_SETTINGS_KEYS,
        companyId: targetCompanyId
      },
      attributes: ["key", "value"]
    });

    // Buscar configurações padrão da empresa 1 para chaves que não existem
    for (const key of PUBLIC_SETTINGS_KEYS) {
      const setting = companySettings.find((s) => s.key === key);
      if (!setting) {
        const defaultSetting = await Setting.findOne({
          where: {
            key,
            companyId: DEFAULT_COMPANY_ID
          },
          attributes: ["key", "value"]
        });
        if (defaultSetting) {
          companySettings.push(defaultSetting);
        }
      }
    }

    return companySettings;
  } catch (error) {
    logger.error({
      message: "Erro ao obter configurações públicas",
      companyId,
      error
    });
    throw new AppError("ERR_GET_PUBLIC_SETTINGS", 500);
  }
};

const GetPublicSettingService = async ({
  key,
  companyId
}: PublicSettingRequest): Promise<string | undefined> => {
  if (!PUBLIC_SETTINGS_KEYS.includes(key)) {
    throw new AppError("Configuração não é pública", 403);
  }

  try {
    if (companyId) {
      const companySetting = await Setting.findOne({
        where: {
          companyId,
          key
        },
        attributes: ["key", "value"]
      });

      if (companySetting?.value) {
        return companySetting.value;
      }
    }

    // Fallback para configurações da empresa 1
    const setting = await Setting.findOne({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        key
      },
      attributes: ["key", "value"]
    });

    return setting?.value;
  } catch (error) {
    logger.error({
      message: "Erro ao obter configuração pública",
      key,
      companyId,
      error
    });
    throw new AppError("ERR_GET_PUBLIC_SETTING", 500);
  }
};

export default GetPublicSettingService;