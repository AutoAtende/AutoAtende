import Setting from "../models/Setting";
import AppError from "../errors/AppError";

const CheckOneSetting = async (key: string, companyId: number): Promise<string> => {
  const setting = await Setting.findOne({
    where:
     {
       companyId: companyId,
       key
     }
  });

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  return setting.value;
};

export default CheckOneSetting;
