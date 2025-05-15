import { Op } from "sequelize";
import MessageRule from "../../models/MessageRule";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

interface ListParams {
  searchParam?: string;
  pageNumber?: number;
  pageSize?: number;
  companyId: number;
  active?: boolean;
}

interface ListMessageRulesServiceReturn {
  messageRules: MessageRule[];
  count: number;
  hasMore: boolean;
}

export const ListMessageRulesService = async ({
  searchParam,
  pageNumber = 1,
  pageSize = 20,
  companyId,
  active
}: ListParams): Promise<ListMessageRulesServiceReturn> => {
  let whereCondition: any = { companyId };

  if (active !== undefined) {
    whereCondition.active = active;
  }

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { pattern: { [Op.iLike]: `%${searchParam}%` } },
        { description: { [Op.iLike]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: messageRules } = await MessageRule.findAndCountAll({
    where: whereCondition,
    include: [
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
    ],
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    order: [["priority", "DESC"], ["createdAt", "DESC"]]
  });

  const hasMore = count > pageNumber * pageSize;

  return {
    messageRules,
    count,
    hasMore
  };
};