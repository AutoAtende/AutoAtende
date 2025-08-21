import { Sequelize, Op } from "sequelize";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  profile?: string;
  companyId?: number;
  isSuper?: boolean;
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
  onlineCount: number;
  offlineCount: number;
}

const ListUsersService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  isSuper = false,
}: Request): Promise<Response> => {
  const whereCondition: any = {};

  if (isSuper) {
    whereCondition.companyId = companyId;
  } else {
    whereCondition.companyId = companyId;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${searchParam.toLowerCase()}%`
        }
      },
      {
        email: {
          [Op.iLike]: `%${searchParam.toLowerCase()}%`
        }
      }
    ];
  }

  const limit = 50;
  const offset = limit * (Number(pageNumber) - 1);

  const { count, rows: users } = await User.findAndCountAll({
    where: whereCondition,
    attributes: [
      "name", "id", "email", "companyId", "profile", "allTicket", "super",
      "isTricked", "spy", "createdAt", "online", "startWork", "endWork", 
      "defaultMenu", "color", "number", "profilePic", "ramal", "notifyNewTicket", "notifyTask", "canCreateTags", "canRestartConnections"
    ],
    limit,
    offset,
    order: [["profile", "DESC"]],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Company, as: "company", attributes: ["id", "name"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
    ]
  });

  const onlineCount = users.filter(user => user.online).length;
  const offlineCount = users.length - onlineCount;
  const hasMore = count > offset + users.length;

  return {
    users,
    count,
    hasMore,
    onlineCount,
    offlineCount
  };
};

export default ListUsersService;