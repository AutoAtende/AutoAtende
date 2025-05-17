import { Op, WhereOptions } from "sequelize";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

const ListSettingsService = async (
  isSuper: boolean | null, 
  companyId: number | null
): Promise<Setting[] | undefined> => {
  try {
    // Verificação de entrada
    if (companyId === null) {
      throw new AppError("companyId não pode ser nulo", 400);
    }

    const where: WhereOptions = { companyId };

    // Tratamento de isSuper
    if (isSuper === null || isSuper === false) {
      // Quando isSuper é null ou false, excluir configurações super
      where.key = {
        [Op.notLike]: "\\_%"
      };
    }
    // Para isSuper = true, retorna todas as configurações

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
      isSuper,
      error
    });
    throw new AppError("ERR_LIST_SETTINGS", 500);
  }
};

export default ListSettingsService;