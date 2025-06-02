import { Op, WhereOptions } from "sequelize";
import Setting from "../../models/Setting";

const ListSettingsService = async (
  isSuper: boolean | null, 
  companyId: number | null
): Promise<Setting[] | undefined> => {
  
  // Verificação de entrada
  if (companyId === null) {
    throw new Error("companyId must not be null.");
  }

  const where: WhereOptions = { companyId };

  // Tratamento de isSuper
  if (isSuper === null || isSuper === false) {
    // Quando isSuper é null ou false
    where.key = {
      [Op.notLike]: "\\_%"
    };
  } else if (isSuper === true) {
    // Quando isSuper é true
    // Aqui você pode adicionar qualquer lógica adicional, se necessário
  }

  const settings = await Setting.findAll({
    where
  });

  return settings;
};

export default ListSettingsService;
