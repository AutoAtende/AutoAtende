import { Op } from "sequelize";
import FlowBuilder from "../../models/FlowBuilder";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  flows: FlowBuilder[];
  count: number;
  hasMore: boolean;
}

const ListFlowBuildersService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = (parseInt(pageNumber, 10) - 1) * limit;

  let whereCondition = {};

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { description: { [Op.iLike]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: flows } = await FlowBuilder.findAndCountAll({
    where: {
      companyId,
      ...whereCondition
    },
    limit,
    offset,
    order: [["name", "ASC"]],
  });

  const hasMore = count > offset + flows.length;

  return {
    flows,
    count,
    hasMore
  };
};

export default ListFlowBuildersService;