import { Op, Sequelize } from "sequelize";
import Files from "../../models/Files";
import FilesOptions from "../../models/FilesOptions";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: number;
}

interface Response {
  files: Files[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = 1,
  companyId
}: Request): Promise<Response> => {
  let whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          name: {
            [Op.iLike]: `%${searchParam}%`
          }
        },
        {
          message: {
            [Op.iLike]: `%${searchParam}%`
          }
        }
      ]
    };
  }

  const limit = 20;
  const offset = limit * (Number(pageNumber) - 1);

  const { count, rows: files } = await Files.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: FilesOptions,
        attributes: ["id", "path", "mediaType"]
      }
    ]
  });

  const hasMore = count > offset + files.length;

  return {
    files,
    count,
    hasMore
  };
};

export default ListService;