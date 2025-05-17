import Setting from "../../models/Setting";
import AppError from "../../errors/AppError";

const publicSettingsKeys = [
  "primaryColorLight",
  "secondaryColorLight",
  "primaryColorDark",
  "secondaryColorDark",
  "appLogoLight",
  "appLogoDark",
  "appLogoFavicon",
  "appLogoPWAIcon",
  "appName",
  "loginBackground",
  "signupBackground",
  "loginPosition",
  "signupPosition",
  "iconColorLight",
  "iconColorDark",
  "chatlistLight",
  "chatlistDark",
  "boxRightLight",
  "boxRightDark",
  "boxLeftLight",
  "boxLeftDark",
  "allowSignup",
  "privacy",
  "terms",
  "trialExpiration",
  "copyright"
];

export const GetAllPublicSettingsService = async (companyId?: number): Promise<Setting[] | undefined> => {
  // Se não fornecido companyId, usa o padrão 1
  const targetCompanyId = companyId || 1;

  const companySettings = await Setting.findAll({
    where: {
      key: publicSettingsKeys,
      companyId: targetCompanyId
    },
    attributes: ["key", "value"]
  });

  // Buscar configurações padrão da empresa 1 para chaves que não existem
  for (const key of publicSettingsKeys) {
    const setting = companySettings.find((s) => s.key === key);
    if (!setting) {
      const defaultSetting = await Setting.findOne({
        where: {
          key,
          companyId: 1
        },
        attributes: ["key", "value"]
      });
      if (defaultSetting) {
        companySettings.push(defaultSetting);
      }
    }
  }

  return companySettings;
};

const GetPublicSettingService = async ({
  key,
  companyId
}: {
  key: string;
  companyId?: number;
}): Promise<string | undefined> => {
  if (!publicSettingsKeys.includes(key)) {
    throw new AppError("Setting is not public", 403);
  }

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
      companyId: 1,
      key
    },
    attributes: ["key", "value"]
  });

  return setting?.value;
};

export default GetPublicSettingService;