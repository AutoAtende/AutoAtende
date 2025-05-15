import { Op, literal, fn, col } from "sequelize";
import Groups from "../../models/Groups";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  groups: Groups[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId,
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 200000;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { subject: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: groups } = await Groups.findAndCountAll({
    where: { ...whereCondition, companyId },
    limit,
    offset,
    order: [["subject", "ASC"]]
  });

  const hasMore = count > offset + groups.length;

  //console.log(groups);

  return {
    groups,
    count,
    hasMore
  };
};

export default ListService;
