import { Op, WhereOptions } from "sequelize";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

const ListSettingsService = async (
  companyId: number | null
): Promise<Setting[] | undefined> => {
  try {
    const where: WhereOptions = { companyId };

    const settings = await Setting.findAll({
      where,
      order: [["key", "ASC"]]
    });

    return settings;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error({
      message: "Erro ao listar configurações",
      companyId,
      error
    });
    throw new AppError("ERR_LIST_SETTINGS", 500);
  }
};

export default ListSettingsService;