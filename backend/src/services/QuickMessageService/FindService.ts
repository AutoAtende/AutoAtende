import {Op} from "sequelize";
import QuickMessage from "../../models/QuickMessage";
import Company from "../../models/Company";
import { GetCompanySetting } from "../../helpers/CheckSettings";

type Params = {
  companyId: string;
  userId: string;
};

type QuickMessageWhere = {
  companyId: string;
  userId?: string;
}

const FindService = async ({ companyId, userId }: Params): Promise<QuickMessage[]> => {
  const where: QuickMessageWhere = {
    companyId,
  };

  // Verificar a configuração da empresa para quickMessages
  const quickMessagesSetting = await GetCompanySetting(parseInt(companyId, 10), "quickMessages", "company");

  // Se a configuração for "individual" ou "user", filtrar por usuário
  if (quickMessagesSetting === "individual" || quickMessagesSetting === "user") {
    where.userId = userId;
  }

  const notes: QuickMessage[] = await QuickMessage.findAll({
    where,
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["shortcode", "ASC"]]
  });

  return notes;
};

export default FindService;