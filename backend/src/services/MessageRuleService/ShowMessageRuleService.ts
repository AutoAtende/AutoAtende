import AppError from "../../errors/AppError";
import MessageRule from "../../models/MessageRule";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

export const ShowMessageRuleService = async (
  id: string | number,
  companyId: number
): Promise<MessageRule> => {
  const messageRule = await MessageRule.findOne({
    where: { id, companyId },
    include: [
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
    ]
  });

  if (!messageRule) {
    throw new AppError("ERR_MESSAGE_RULE_NOT_FOUND", 404);
  }

  return messageRule;
};