import { Op, fn, col, cast } from "sequelize";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";

interface Request {
  searchParam?: string;
  pageNumber?: number;
  pageSize?: number;
  companyId?: number;
}

interface Response {
  tags: Tag[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId,
  searchParam,
  pageNumber = 1,
  pageSize = 10,
}: Request): Promise<Response> => {
  let whereCondition: any = { companyId };
  const offset = (pageNumber - 1) * pageSize;

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  // Primeiro, obtemos a contagem total
  const totalCount = await Tag.count({
    where: whereCondition
  });

  // Busca as tags com a contagem de tickets
  const tags = await Tag.findAll({
    where: whereCondition,
    limit: pageSize,
    offset,
    order: [["name", "ASC"]],
    include: [{
      model: TicketTag,
      required: false,
      attributes: []
    }],
    attributes: [
      "id",
      "name",
      "color",
      "kanban",
      "mediaPath",
      "msgR",
      "recurrentTime",
      "actCamp",
      "rptDays",
      [fn("COUNT", col("ticketTags.ticketId")), "ticketsCount"]
    ],
    group: ["Tag.id"],
    subQuery: false
  });

  const hasMore = totalCount > offset + tags.length;

  return {
    tags,
    count: totalCount,
    hasMore
  };
};

export default ListService;