import { Op } from "sequelize";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: number;
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
}

const ShowUsersFromCompanyService = async ({
  companyId,
  searchParam = "",
  pageNumber = 1
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = (pageNumber - 1) * limit;

  try {
    const whereCondition: any = { 
      companyId 
    };

    if (searchParam) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { email: { [Op.iLike]: `%${searchParam}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["name", "ASC"]],
      attributes: ["id", "name", "email", "profile", "createdAt"],
    });

    return {
      users,
      count,
      hasMore: count > offset + users.length
    };
  } catch (err) {
    throw new AppError("Error listing company users");
  }
};

export default ShowUsersFromCompanyService;