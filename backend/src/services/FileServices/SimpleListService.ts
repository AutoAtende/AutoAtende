import { Op } from "sequelize";
import Files from "../../models/Files";
import FilesOptions from "../../models/FilesOptions";

interface Request {
  searchParam?: string;
  companyId: number;
}

const SimpleListService = async ({
  searchParam = "",
  companyId
}: Request): Promise<Files[]> => {
  let whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { message: { [Op.iLike]: `%${searchParam}%` } }
      ]
    };
  }

  const files = await Files.findAll({
    where: whereCondition,
    order: [["name", "ASC"]],
    include: [
      {
        model: FilesOptions,
        attributes: ["id", "path", "mediaType"]
      }
    ]
  });

  return files;
};

export default SimpleListService;