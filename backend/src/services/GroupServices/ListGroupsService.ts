// ListGroupsService.ts
import { Op } from "sequelize";
import Groups from "../../models/Groups";
import Company from "../../models/Company";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: number;
}

interface Response {
  groups: Groups[];
  count: number;
  hasMore: boolean;
}

const ListGroupsService = async ({
  companyId,
  searchParam = "",
  pageNumber = 1
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = (pageNumber - 1) * limit;

  const where = {
    companyId,
    ...(searchParam && {
      [Op.or]: [
        { subject: { [Op.iLike]: `%${searchParam}%` } },
        { jid: { [Op.iLike]: `%${searchParam}%` } }
      ]
    })
  };

  const { count, rows: groups } = await Groups.findAndCountAll({
    where,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    include: [
      {
        model: Company,
        attributes: ["id", "name"]
      }
    ]
  });

  const hasMore = count > offset + groups.length;

  return {
    groups,
    count,
    hasMore
  };
};

export default ListGroupsService;