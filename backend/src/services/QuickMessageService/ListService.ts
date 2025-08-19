import { Sequelize, Op, Filterable } from "sequelize";
import QuickMessage from "../../models/QuickMessage";
import User from "../../models/User";
import { GetCompanySetting } from "../../helpers/CheckSettings";

interface Request {
  searchParam: string;
  pageNumber: string;
  companyId: number;
  userId: number;
}

interface Response {
  records: QuickMessage[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  userId
}: Request): Promise<Response> => {
  const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

  let whereCondition: Filterable["where"] = {
    shortcode: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("shortcode")),
      "LIKE",
      `%${sanitizedSearchParam}%`
    )
  };
  
  // Adicionar condição de companyId
  whereCondition = {
    ...whereCondition,
    companyId
  };

  // Verificar a configuração da empresa para quickMessages
  const quickMessagesSetting = await GetCompanySetting(companyId, "quickMessages", "company");

  // Se a configuração for "individual" ou "user", filtrar por usuário
  if (quickMessagesSetting === "individual" || quickMessagesSetting === "user") {
    whereCondition = {
      ...whereCondition,
      userId
    };
  }

  const limit = 50;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: records } = await QuickMessage.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "profile", "super"]
      }
    ],
    limit,
    offset,
    order: [["shortcode", "ASC"]]
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListService;